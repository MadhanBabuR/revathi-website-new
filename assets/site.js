/* Kalariwoman — shared behaviour. Transform and opacity only. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init() {
    // reveal on entry, once
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
      document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("is-in"); });
    }

    var fill = document.querySelector(".thread__fill");
    var heroImg = document.querySelector(".hero__bg > img");
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        var max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        if (fill) fill.style.setProperty("--p", Math.min(y / max, 1).toFixed(4));
        if (heroImg && !reduced) heroImg.style.setProperty("--py", (y * 0.15).toFixed(1) + "px");
        ticking = false;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // The enquiry form has no server behind it. Rather than silently drop what
    // someone typed, compose it into a message they can actually send.
    var form = document.querySelector("[data-enquiry]");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var data = new FormData(form);
        var lines = [
          "Name: " + (data.get("name") || ""),
          "Interested in: " + (data.get("interest") || ""),
          "Location / time zone: " + (data.get("where") || ""),
          "",
          (data.get("message") || ""),
        ];
        var out = form.querySelector("[data-enquiry-out]");
        var text = form.querySelector("[data-enquiry-text]");
        if (out && text) {
          text.value = lines.join("\n");
          out.hidden = false;
          text.focus();
          text.select();
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
