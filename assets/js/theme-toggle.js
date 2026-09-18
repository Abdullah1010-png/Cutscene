// Cutscene theme controller
(function () {
  const STORAGE_KEY = "cutsceneTheme";

  function applyTheme(theme) {
    const isLight = theme === "light";
    const root = document.documentElement;

    if (isLight) {
      root.setAttribute("data-theme", "light");
    } else {
      root.setAttribute("data-theme", "dark");
    }

    document.querySelectorAll("[data-bs-theme]").forEach((element) => {
      element.setAttribute("data-bs-theme", isLight ? "light" : "dark");
    });

    const button = document.getElementById("themeToggle");
    if (button) {
      button.setAttribute("aria-pressed", String(isLight));
      button.setAttribute("title", isLight ? "Switch to dark mode" : "Switch to light mode");
    }
  }

  function initThemeToggle() {
    const button = document.getElementById("themeToggle");
    if (!button || button.dataset.themeReady === "true") return;

    button.dataset.themeReady = "true";
    applyTheme(localStorage.getItem(STORAGE_KEY) || "dark");

    button.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }

  applyTheme(localStorage.getItem(STORAGE_KEY) || "dark");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
