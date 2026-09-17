// Screenshot a localhost URL using the Chromium already installed in this
// container, driven over the DevTools protocol. Zero dependencies: Node's
// built-in WebSocket talks to Chromium directly, so there is nothing to
// npm install on a fresh container.
//
//   node screenshot.mjs http://localhost:3000
//   node screenshot.mjs http://localhost:3000 hero          -> screenshot-N-hero.png
//   node screenshot.mjs http://localhost:3000 phone --width 390 --height 844
//   node screenshot.mjs http://localhost:3000 whole --full  -> full-page capture
//   node screenshot.mjs http://localhost:3000 lower --scroll 2400
//
// Saves to "./temporary screenshots/screenshot-N[-label].png", auto-incremented.
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CHROME = process.env.CHROME_PATH || "/opt/pw-browsers/chromium";
const OUT_DIR = join(process.cwd(), "temporary screenshots");

const argv = process.argv.slice(2);
const url = argv[0];
if (!url) {
  console.error("usage: node screenshot.mjs <url> [label] [--width N] [--height N] [--full] [--scroll N] [--wait MS]");
  process.exit(1);
}
if (url.startsWith("file://")) {
  console.error("refusing a file:// URL. Start `node serve.mjs` and screenshot http://localhost:3000");
  process.exit(1);
}

const label = argv[1] && !argv[1].startsWith("--") ? argv[1] : "";
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : Number(argv[i + 1]);
};
const width = flag("width", 1440);
const height = flag("height", 900);
const scrollY = flag("scroll", 0);
const extraWait = flag("wait", 600);
const fullPage = argv.includes("--full");

let nextId = 0;
const pending = new Map();
const onEvent = new Map();

function send(ws, method, params = {}, sessionId) {
  const id = ++nextId;
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

function once(method) {
  return new Promise((resolve) => {
    const list = onEvent.get(method) || [];
    list.push(resolve);
    onEvent.set(method, list);
  });
}

const profile = await mkdtemp(join(tmpdir(), "shot-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "--no-sandbox",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-color-profile=srgb",
  // the sandbox proxy uses its own CA, so webfonts and other TLS assets fail
  // to load without this and screenshots silently show fallback fonts
  "--ignore-certificate-errors",
  "about:blank",
], { stdio: ["ignore", "pipe", "pipe"] });

// Some pages (a 100vh hero plus a blurred fixed bar, for instance) make
// Chromium hang when the viewport is grown for --full. Fail loudly instead
// of wedging the session.
const budgetMs = flag("timeout", 60) * 1000;
const watchdog = setTimeout(() => {
  console.error(
    `timed out after ${budgetMs / 1000}s.` +
    (fullPage ? " --full can hang on tall image-heavy pages; use --scroll N at a normal viewport instead." : "")
  );
  chrome.kill("SIGKILL");
  process.exit(2);
}, budgetMs);

const wsUrl = await new Promise((resolve, reject) => {
  let buf = "";
  const timer = setTimeout(() => reject(new Error("Chromium did not report a DevTools endpoint")), 20000);
  chrome.stderr.on("data", (chunk) => {
    buf += chunk.toString();
    const m = buf.match(/ws:\/\/[^\s]+/);
    if (m) {
      clearTimeout(timer);
      resolve(m[0]);
    }
  });
  chrome.on("exit", (code) => reject(new Error(`Chromium exited early (${code}): ${buf.slice(-400)}`)));
});

const ws = new WebSocket(wsUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", () => reject(new Error("could not connect to Chromium")), { once: true });
});

ws.addEventListener("message", (evt) => {
  const msg = JSON.parse(evt.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method && onEvent.has(msg.method)) {
    const list = onEvent.get(msg.method);
    onEvent.delete(msg.method);
    list.forEach((fn) => fn(msg.params));
  }
});

const { targetId } = await send(ws, "Target.createTarget", { url: "about:blank" });
const { sessionId } = await send(ws, "Target.attachToTarget", { targetId, flatten: true });

await send(ws, "Page.enable", {}, sessionId);
await send(ws, "Emulation.setDeviceMetricsOverride", {
  width, height, deviceScaleFactor: 1, mobile: width < 700,
}, sessionId);

const loaded = once("Page.loadEventFired");
await send(ws, "Page.navigate", { url }, sessionId);
await Promise.race([loaded, new Promise((r) => setTimeout(r, 20000))]);

// let webfonts settle, otherwise the capture shows fallback faces
await send(ws, "Runtime.evaluate", {
  expression: "document.fonts ? document.fonts.ready.then(() => true) : true",
  awaitPromise: true,
}, sessionId).catch(() => {});

if (scrollY) {
  await send(ws, "Runtime.evaluate", { expression: `window.scrollTo(0, ${scrollY})` }, sessionId);
}
await new Promise((r) => setTimeout(r, extraWait));

if (fullPage) {
  // captureBeyondViewport deadlocks on long image-heavy pages in this
  // Chromium build, so grow the emulated viewport to the content instead.
  // 16384 is the texture limit; past it the capture comes back blank.
  const { contentSize } = await send(ws, "Page.getLayoutMetrics", {}, sessionId);
  const tall = Math.min(Math.ceil(contentSize.height), 16384);
  if (tall > height) {
    await send(ws, "Emulation.setDeviceMetricsOverride", {
      width, height: tall, deviceScaleFactor: 1, mobile: width < 700,
    }, sessionId);
    await new Promise((r) => setTimeout(r, 500));
  }
}
const { data } = await send(ws, "Page.captureScreenshot", { format: "png" }, sessionId);

await mkdir(OUT_DIR, { recursive: true });
const existing = await readdir(OUT_DIR).catch(() => []);
const used = existing
  .map((f) => Number(f.match(/^screenshot-(\d+)/)?.[1]))
  .filter((n) => Number.isFinite(n));
const n = (used.length ? Math.max(...used) : 0) + 1;
const outPath = join(OUT_DIR, `screenshot-${n}${label ? `-${label}` : ""}.png`);
await writeFile(outPath, Buffer.from(data, "base64"));

console.log(outPath);

ws.close();
chrome.kill();
await rm(profile, { recursive: true, force: true }).catch(() => {});
