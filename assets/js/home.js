// ==========================================
// Landing Page Navbar
// Desktop: full navigation + search + theme + auth actions.
// Mobile/tablet: everything stays inside Bootstrap's hamburger menu.
// ==========================================
(function () {
    const navbar = document.querySelector('.custom-navbar');
    const collapse = document.getElementById('navbarContent');

    if (!navbar || !collapse) return;

    collapse.innerHTML = `
        <div class="cutscene-navbar-layout w-100">
            <ul class="navbar-nav cutscene-main-nav align-items-lg-center">
                <li class="nav-item"><a class="nav-link cutscene-nav-link active" href="./index.html">Home</a></li>
                <li class="nav-item"><a class="nav-link cutscene-nav-link" href="./pages/movies.html">Movies</a></li>
                <li class="nav-item"><a class="nav-link cutscene-nav-link" href="./pages/tv-shows.html">TV Shows</a></li>
                <li class="nav-item"><a class="nav-link cutscene-nav-link" href="#trending">Trending</a></li>
                <li class="nav-item"><a class="nav-link cutscene-nav-link" href="./pages/library.html">Library</a></li>
            </ul>

            <div class="cutscene-nav-actions">
                <form class="cutscene-search-form" id="cutsceneSearchForm" role="search">
                    <span aria-hidden="true">⌕</span>
                    <input id="cutsceneNavSearch" type="search" placeholder="Search" aria-label="Search movies and TV shows">
                </form>

                <button type="button" class="cutscene-theme-btn" id="cutsceneThemeToggle" aria-label="Toggle light and dark mode" title="Toggle theme">☀️</button>

                <a href="./pages/signin.html" class="btn cutscene-login-btn rounded-pill">Log in</a>
                <a href="./pages/signup.html" class="btn cutscene-signup-btn rounded-pill">Sign up</a>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .cutscene-navbar-layout {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 28px;
        }

        .cutscene-main-nav {
            gap: 4px;
        }

        .cutscene-nav-link {
            color: var(--color-text-muted) !important;
            font-size: 15px;
            padding: 8px 12px !important;
            border-radius: 999px;
            transition: all .25s ease;
        }

        .cutscene-nav-link:hover,
        .cutscene-nav-link:focus,
        .cutscene-nav-link.active {
            color: var(--color-text) !important;
            background: rgba(255,255,255,.06);
        }

        .cutscene-nav-link.active {
            color: var(--color-accent) !important;
        }

        .cutscene-nav-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            flex-shrink: 0;
        }

        .cutscene-search-form {
            width: 190px;
            height: 40px;
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 0 13px;
            border: 1px solid var(--color-border);
            border-radius: 999px;
            background: rgba(255,255,255,.025);
            transition: border-color .25s ease, box-shadow .25s ease;
        }

        .cutscene-search-form:focus-within {
            border-color: var(--color-accent);
            box-shadow: 0 0 0 3px rgba(229,9,20,.12);
        }

        .cutscene-search-form span {
            color: var(--color-text-muted);
            font-size: 20px;
            line-height: 1;
        }

        .cutscene-search-form input {
            width: 100%;
            border: 0;
            outline: 0;
            background: transparent;
            color: var(--color-text);
            font-size: 14px;
        }

        .cutscene-search-form input::placeholder {
            color: var(--color-text-muted);
        }

        .cutscene-theme-btn {
            width: 40px;
            height: 40px;
            border: 1px solid var(--color-border);
            border-radius: 50%;
            background: transparent;
            color: var(--color-text);
            cursor: pointer;
            transition: all .25s ease;
        }

        .cutscene-theme-btn:hover {
            border-color: var(--color-accent);
            transform: translateY(-1px);
        }

        .cutscene-login-btn,
        .cutscene-signup-btn {
            min-width: 82px;
            padding: 9px 18px;
            font-size: 14px;
            font-weight: 600;
            transition: all .25s ease;
        }

        .cutscene-login-btn {
            color: var(--color-text) !important;
            background: transparent;
            border: 1px solid var(--color-border);
        }

        .cutscene-login-btn:hover {
            border-color: var(--color-accent);
            color: var(--color-accent) !important;
        }

        .cutscene-signup-btn {
            color: #fff !important;
            background: var(--color-accent);
            border: 1px solid var(--color-accent);
        }

        .cutscene-signup-btn:hover {
            color: #fff !important;
            background: #ff1c27;
            border-color: #ff1c27;
            transform: translateY(-1px);
            box-shadow: 0 8px 20px rgba(229,9,20,.25);
        }

        body.cutscene-light {
            --color-bg: #f5f5f5;
            --color-bg-navbar: #ffffff;
            --color-bg-card: #ffffff;
            --color-bg-icon: #f1e7e8;
            --color-text: #17191c;
            --color-text-muted: #666b70;
            --color-text-subtle: #73777b;
            --color-border: #d6d9dc;
            --color-border-soft: rgba(0,0,0,.09);
            --shadow-card: 0 10px 30px rgba(0,0,0,.10);
        }

        body.cutscene-light .custom-navbar.navbar-scrolled {
            background-color: rgba(255,255,255,.92);
        }

        body.cutscene-light .custom-toggler .navbar-toggler-icon {
            filter: none;
        }

        @media (max-width: 991.98px) {
            .cutscene-navbar-layout {
                display: block;
            }

            .cutscene-main-nav {
                display: grid;
                gap: 3px;
                padding-bottom: 14px;
                margin-bottom: 14px;
                border-bottom: 1px solid var(--color-border-soft);
            }

            .cutscene-nav-link {
                padding: 10px 12px !important;
            }

            .cutscene-nav-actions {
                display: grid;
                grid-template-columns: 1fr 40px;
                gap: 10px;
            }

            .cutscene-search-form {
                width: auto;
            }

            .cutscene-login-btn,
            .cutscene-signup-btn {
                width: 100%;
            }

            .cutscene-login-btn {
                grid-column: 1;
            }

            .cutscene-signup-btn {
                grid-column: 1 / -1;
            }

            .cutscene-theme-btn {
                grid-column: 2;
                grid-row: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Search from the navbar. It sends the user to Movies with the query in the URL.
    const searchForm = document.getElementById('cutsceneSearchForm');
    const searchInput = document.getElementById('cutsceneNavSearch');

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;
        window.location.href = `./pages/movies.html?search=${encodeURIComponent(query)}`;
    });

    // Persist the landing-page theme.
    const themeButton = document.getElementById('cutsceneThemeToggle');
    const savedTheme = localStorage.getItem('cutsceneTheme') || 'dark';

    function applyTheme(theme) {
        const light = theme === 'light';
        document.body.classList.toggle('cutscene-light', light);
        themeButton.textContent = light ? '🌙' : '☀️';
        themeButton.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    }

    applyTheme(savedTheme);

    themeButton.addEventListener('click', function () {
        const nextTheme = document.body.classList.contains('cutscene-light') ? 'dark' : 'light';
        localStorage.setItem('cutsceneTheme', nextTheme);
        applyTheme(nextTheme);
    });
})();

// ==========================================
// Trending Slider
// ==========================================
(function () {
    const track = document.getElementById('trendingTrack');
    const prevBtn = document.getElementById('trendPrevBtn');
    const nextBtn = document.getElementById('trendNextBtn');

    if (!track || !prevBtn || !nextBtn) return;

    function scrollByCards(direction) {
        const card = track.querySelector('.trending-card');
        if (!card) return;

        const cardWidth = card.getBoundingClientRect().width;
        const trackGap = parseFloat(getComputedStyle(track).columnGap) || 18;
        const scrollAmount = (cardWidth + trackGap) * 2;

        track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }

    prevBtn.addEventListener('click', function () {
        scrollByCards(-1);
    });

    nextBtn.addEventListener('click', function () {
        scrollByCards(1);
    });
})();

// ==========================================
// Navbar Scroll Effect
// ==========================================
(function () {
    const navbar = document.querySelector('.custom-navbar');
    if (!navbar) return;

    function updateNavbarState() {
        navbar.classList.toggle('navbar-scrolled', window.scrollY > 10);
    }

    window.addEventListener('scroll', updateNavbarState, { passive: true });
    updateNavbarState();
})();
