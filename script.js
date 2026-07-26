(function () {
  "use strict";
  var toastTimer = null;

  function ensureToastHost() {
    var host = document.getElementById("gl-toast");
    if (!host) {
      host = document.createElement("div");
      host.id = "gl-toast";
      host.className = "gl-toast";
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    return host;
  }

  function toast(message, type) {
    var host = ensureToastHost();
    host.textContent = message;
    host.dataset.type = type || "info";
    host.classList.add("show");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      host.classList.remove("show");
    }, 2200);
  }

  function copy(text, successMessage) {
    var value = text == null ? "" : String(text);
    var done = function () { toast(successMessage || "Copied to clipboard!", "success"); };
    var fail = function () { toast("Copy failed – please copy manually.", "error"); };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value).then(done, function () {
        if (legacyCopy(value)) done(); else fail();
      });
    }
    if (legacyCopy(value)) done(); else fail();
    return Promise.resolve();
  }

  function legacyCopy(value) {
    try {
      var ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  window.EncrizeLab = window.EncrizeLab || {};
  window.EncrizeLab.toast = toast;
  window.EncrizeLab.copy = copy;

  function highlightActiveLink(sidebar) {
    var here = window.location.pathname.split("/").pop() || "index.html";
    var links = sidebar.querySelectorAll(".nav-link");
    var matched = false;
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute("href") || "").split("/").pop();
      if (href === here) {
        links[i].classList.add("active");
        links[i].setAttribute("aria-current", "page");
        matched = true;
      } else {
        links[i].classList.remove("active");
        links[i].removeAttribute("aria-current");
      }
    }
    return matched;
  }

  function setupSidebarCollapse(sidebar) {
    if (!sidebar) return;
    var header = sidebar.querySelector(".sidebar-header");
    if (!header) return;
    var STORAGE_KEY = "gl-sidebar-collapsed";

    var collapseBtn = document.createElement("button");
    collapseBtn.type = "button";
    collapseBtn.className = "sidebar-collapse";
    collapseBtn.id = "sidebarCollapse";
    collapseBtn.setAttribute("aria-label", "Hide sidebar");
    collapseBtn.setAttribute("title", "Hide sidebar");
    collapseBtn.setAttribute("aria-controls", "primaryNav");
    collapseBtn.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';
    header.appendChild(collapseBtn);

    var reopenBtn = document.createElement("button");
    reopenBtn.type = "button";
    reopenBtn.className = "sidebar-reopen";
    reopenBtn.id = "sidebarReopen";
    reopenBtn.setAttribute("aria-label", "Show sidebar");
    reopenBtn.setAttribute("title", "Show sidebar");
    reopenBtn.setAttribute("aria-controls", "primaryNav");
    reopenBtn.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
    document.body.appendChild(reopenBtn);

    function setCollapsed(collapsed) {
      document.body.classList.toggle("sidebar-collapsed", collapsed);
      collapseBtn.setAttribute("aria-expanded", String(!collapsed));
      try { window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0"); } catch (e) {}
    }

    var saved = null;
    try { saved = window.localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved === "1") setCollapsed(true);
    else collapseBtn.setAttribute("aria-expanded", "true");

    collapseBtn.addEventListener("click", function () { setCollapsed(true); });
    reopenBtn.addEventListener("click", function () { setCollapsed(false); });
  }

  function init() {
    var yearEls = document.querySelectorAll("[data-year]");
    for (var y = 0; y < yearEls.length; y++) {
      yearEls[y].textContent = String(new Date().getFullYear());
    }

    var toggle = document.getElementById("navToggle");
    var sidebar = document.getElementById("primaryNav");
    var overlay = document.getElementById("navOverlay");

    if (sidebar) highlightActiveLink(sidebar);

    setupSidebarCollapse(sidebar);

    if (!toggle || !sidebar || !overlay) return;

    var mobileQuery = window.matchMedia("(max-width: 900px)");

    function openNav() {
      sidebar.classList.add("open");
      overlay.hidden = false;
      void overlay.offsetWidth;
      overlay.classList.add("show");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      document.body.classList.add("nav-open");
    }

    function closeNav() {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("nav-open");
      window.setTimeout(function () {
        if (!sidebar.classList.contains("open")) overlay.hidden = true;
      }, 260);
    }

    function toggleNav() {
      if (sidebar.classList.contains("open")) closeNav();
      else openNav();
    }

    toggle.addEventListener("click", toggleNav);
    overlay.addEventListener("click", closeNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.key === "Esc") closeNav();
    });

    var links = sidebar.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        if (mobileQuery.matches) closeNav();
      });
    }

    var onChange = function () {
      if (!mobileQuery.matches) closeNav();
    };
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", onChange);
    else if (mobileQuery.addListener) mobileQuery.addListener(onChange);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
