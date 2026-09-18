// Cutscene theme controller + shared navbar enhancements
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

  function addSharedNavbarActions() {
    const navbar = document.querySelector(".navbar");
    const collapse = navbar?.querySelector(".navbar-collapse");
    if (!navbar || !collapse || collapse.dataset.sharedNavReady === "true") return;

    collapse.dataset.sharedNavReady = "true";

    // Add Home and Trending to the existing navigation.
    const navList = collapse.querySelector(".navbar-nav");
    if (navList && !navList.querySelector('[data-cutscene-link="home"]')) {
      const currentPage = (window.location.pathname.split("/").pop() || "dashboard.html").toLowerCase();
      const homeItem = document.createElement("li");
      homeItem.className = "nav-item";
      homeItem.innerHTML = `<a class="nav-link" data-cutscene-link="home" href="../index.html">Home</a>`;

      const trendingItem = document.createElement("li");
      trendingItem.className = "nav-item";
      trendingItem.innerHTML = `<a class="nav-link" data-cutscene-link="trending" href="../index.html#trending">Trending</a>`;

      navList.prepend(trendingItem);
      navList.prepend(homeItem);

      if (currentPage === "index.html") {
        homeItem.querySelector("a")?.classList.add("active");
      }
    }

    // Add Log in + Sign up to every app-page navbar.
    if (!collapse.querySelector(".cutscene-auth-actions")) {
      const themeButton = document.getElementById("themeToggle");
      const searchForm = collapse.querySelector('form[role="search"]') || collapse.querySelector("form");
      const auth = document.createElement("div");
      auth.className = "cutscene-auth-actions d-flex align-items-center gap-2";
      auth.innerHTML = `
        <a href="signin.html" class="btn cutscene-login-link rounded-pill">Log in</a>
        <a href="signup.html" class="btn cutscene-signup-link rounded-pill">Sign up</a>
      `;

      if (searchForm) {
        searchForm.insertAdjacentElement("afterend", auth);
      } else if (themeButton) {
        themeButton.insertAdjacentElement("beforebegin", auth);
      } else {
        collapse.appendChild(auth);
      }
    }

    // Add shared styles once.
    if (!document.getElementById("cutscene-shared-navbar-styles")) {
      const style = document.createElement("style");
      style.id = "cutscene-shared-navbar-styles";
      style.textContent = `
        .cutscene-auth-actions { flex-shrink: 0; margin-left: 10px; }
        .cutscene-login-link,
        .cutscene-signup-link {
          min-width: 78px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          transition: all .25s ease;
        }
        .cutscene-login-link {
          color: var(--color-text) !important;
          background: transparent;
          border: 1px solid var(--color-border);
        }
        .cutscene-login-link:hover,
        .cutscene-login-link:focus-visible {
          color: var(--color-accent) !important;
          border-color: var(--color-accent);
        }
        .cutscene-signup-link {
          color: #fff !important;
          background: var(--color-accent);
          border: 1px solid var(--color-accent);
        }
        .cutscene-signup-link:hover,
        .cutscene-signup-link:focus-visible {
          color: #fff !important;
          background: #ff1c27;
          border-color: #ff1c27;
          transform: translateY(-1px);
        }
        @media (max-width: 991.98px) {
          .cutscene-auth-actions {
            width: 100%;
            margin: 10px 0 4px;
          }
          .cutscene-auth-actions a { flex: 1; text-align: center; }
          .navbar-collapse .navbar-nav { margin-bottom: 10px !important; }
          .navbar-collapse form[role="search"] { margin-bottom: 6px; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function initThemeToggle() {
    addSharedNavbarActions();

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
