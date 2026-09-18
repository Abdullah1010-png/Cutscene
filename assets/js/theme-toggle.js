||// ==========================================
// Dark / Light mode toggle
// New file — doesn't touch dashboard.js / library.js /
// movies.js / tv-shows.js. Just wires up #themeToggle.
// ==========================================
(function () {
  const STORAGE_KEY = "cutsceneTheme";

  function applyTheme(theme) {
    const isLight = theme === "light";

    if (isLight) {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    // Keep Bootstrap's own dark/light components (e.g. the navbar)
    // in sync with the same choice.
    document.querySelectorAll("[data-bs-theme]").forEach(function (el) {
      el.setAttribute("data-bs-theme", isLight ? "light" : "dark");
    });

    const btn = document.getElementById("themeToggle");
    if (btn) btn.setAttribute("aria-pressed", String(isLight));
  }

  // Apply saved preference immediately (defaults to dark, the site's
  // native theme) so there's no flash of the wrong mode.
  applyTheme(localStorage.getItem(STORAGE_KEY) || "dark");

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const isCurrentlyLight =
        document.documentElement.getAttribute("data-theme") === "light";
      const next = isCurrentlyLight ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  });
})();
