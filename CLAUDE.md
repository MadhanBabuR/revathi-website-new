# CLAUDE.md — Frontend Website Rules

> Adapted for Claude Code on the web. This repo runs in an ephemeral Linux
> container, not on a local Windows machine, so the server and screenshot
> mechanics below differ from the original. The design rules are unchanged.

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL. `screenshot.mjs` refuses `file://` outright.
- Start the dev server in the background: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root, has zero dependencies, and needs no install.
- If the server is already running, do not start a second instance — it exits with `EADDRINUSE`. Override the port with `PORT=4000 node serve.mjs`.
- The container is rebuilt every session, so the server will not already be running at session start.

## Screenshot Workflow
- Chromium ships with this container at `/opt/pw-browsers/chromium`. `screenshot.mjs` drives it directly over the DevTools protocol using Node's built-in WebSocket. **There is nothing to npm install** — no Puppeteer, no Playwright, no `node_modules`.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten). That folder is gitignored.
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- Viewport: `--width 390 --height 844` (defaults to 1440x900; widths under 700 enable mobile emulation).
- Lower sections: `--scroll 2400` scrolls before capturing. This is the reliable way to inspect a long page.
- Whole page: `--full`. It grows the viewport to the content height, and it **can hang on tall image-heavy pages** (a 100vh hero plus a blurred fixed bar is enough). A watchdog aborts after 60s; use `--scroll` instead when it trips. Override with `--timeout 90`.
- `screenshot.mjs` passes `--ignore-certificate-errors` because this container's egress proxy uses its own CA. Without it Google Fonts silently fail and **every screenshot shows fallback fonts**, which will make you sign off on type you never actually saw. Do not remove that flag.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- **This repo's real photography lives in `images/`** — treat it as the brand asset folder. Use it; do not use placeholders where a real photo exists.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.
- Caption people and scenes only as what the photo actually shows. Several images here are group or ritual shots, not portraits of the trainer.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.
- **Display faces:** Check the face actually has a lowercase before setting sentence-length headings in it. Inscriptional faces (Cinzel and similar) render lowercase as capitals and turn a headline into an unreadable caps wall.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
- Do not remove `--ignore-certificate-errors` from `screenshot.mjs`
- Do not commit the `temporary screenshots/` folder
