/* Bespoke signature move for this page only: the footprint trail.
   Not a scrollcraft device. Stamps one footprint per chapter as the reader
   arrives at it, and drives the margin folio that names where they are.
   The engine (scrollcraft.js) is untouched; this reads plain DOM state. */
(function () {
  "use strict";

  function init() {
    var chapters = Array.prototype.slice.call(document.querySelectorAll(".chapter[data-chapter]"));
    var rail = document.querySelector(".fc-rail");
    if (!chapters.length || !rail) return;

    var items = Array.prototype.slice.call(rail.querySelectorAll(".fc-rail__item"));
    var folio = document.querySelector(".fc-folio");
    var folioNum = folio && folio.querySelector(".fc-folio__num");
    var folioTitle = folio && folio.querySelector(".fc-folio__title");

    var byId = {};
    items.forEach(function (it) { byId[it.getAttribute("data-chapter")] = it; });
    var order = chapters.map(function (c) { return c.getAttribute("data-chapter"); });

    function activate(chapter) {
      var id = chapter.getAttribute("data-chapter");
      var item = byId[id];
      if (item) {
        items.forEach(function (it) { it.classList.remove("is-active"); });
        item.classList.add("is-active");
        item.classList.add("is-passed");
        var idx = order.indexOf(id);
        order.forEach(function (oid, i) {
          if (i < idx && byId[oid]) byId[oid].classList.add("is-passed");
        });
      }
      if (folio && folioNum && folioTitle) {
        var n = order.indexOf(id) + 1;
        folioNum.textContent = n < 10 ? "0" + n : String(n);
        folioTitle.textContent = chapter.getAttribute("data-folio") || "";
        folio.classList.add("is-on");
      }
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) activate(entry.target);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    chapters.forEach(function (c) { io.observe(c); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
