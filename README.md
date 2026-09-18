# Cutscene 🎬

A dark, Netflix-style movie & TV show dashboard where you can browse titles, filter by genre, search, view details in a modal, and build your own personal watchlist — all running client-side with no backend required.

![Status](https://img.shields.io/badge/status-in--development-orange)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-7952B3?logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- **Landing page** with hero section, trending titles slider, feature highlights, and FAQ accordion
- **Dashboard** showing top-rated movies and TV shows
- **Movies & TV Shows pages** with genre filter buttons and a live search bar
- **Detail modal** — click any card to see poster, year, rating, and description
- **Watchlist / Library** — add or remove titles from any page, sort by date added, rating, title, or year
- **Sign in / Sign up pages** with password show/hide toggle
- **Data persistence** via `localStorage`, seeded from local JSON files (`movies.json`, `tv-shows.json`) with cache-busting fetches and graceful fallback if the fetch fails
- **Dark, Netflix-inspired UI** — red accent color, card hover animations, responsive layout down to small mobile screens

## 📁 Project Structure

```
Cutscene/
├── index.html                 # Landing / home page
├── pages/
│   ├── dashboard.html         # Top-rated movies & TV shows
│   ├── movies.html            # Full movies catalog (filter + search)
│   ├── tv-shows.html          # Full TV shows catalog (filter + search)
│   ├── library.html           # User's watchlist
│   ├── signin.html            # Sign in
│   └── signup.html            # Sign up
├── assets/
│   ├── css/
│   │   ├── base.css           # Design tokens, resets, shared styles
│   │   ├── home.css           # Landing page styles
│   │   ├── dashboard.css      # Dashboard + shared card styles
│   │   ├── movies.css         # Movies page styles
│   │   ├── tv-shows.css       # TV shows page styles
│   │   ├── library.css        # Watchlist page styles
│   │   ├── signin.css         # Sign in page styles
│   │   └── signup.css         # Sign up page styles
│   ├── js/
│   │   ├── home.js            # Trending slider + navbar scroll effect
│   │   ├── dashboard.js       # Fetch/seed data, render top-rated cards, modal
│   │   ├── movies.js          # Load, filter, search, render movies + watchlist logic
│   │   ├── tv-shows.js        # Load, filter, search, render TV shows + watchlist logic
│   │   └── library.js         # Render, sort, and manage the watchlist
│   ├── data/
│   │   ├── movies.json        # Movie catalog data
│   │   └── tv-shows.json      # TV show catalog data
│   └── images/
│       └── logo.png
└── README.md
```

> Note: adjust the `pages/` and `assets/` paths above to match your actual folder layout — the HTML files reference stylesheets/scripts via `../assets/...`, so keep the relative structure consistent.

## 🎨 Design System

Colors, fonts, spacing, and radii are defined once as CSS custom properties in `base.css` and reused across every page:

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#1a1d21` | Page background |
| `--color-bg-card` | `#2b3035` | Card / panel background |
| `--color-accent` | `#e50914` | Primary red accent (buttons, hover states) |
| `--color-text` | `#ffffff` | Primary text |
| `--color-text-muted` | `#999999` | Secondary text |
| `--font-display` | PP Right Grotesk / Clash Display fallback | Headings |
| `--font-body` | System font stack | Body text |

## 🗃️ Data Model

Each entry in `movies.json` / `tv-shows.json` follows this shape:

```json
{
  "id": 1,
  "title": "The Shawshank Redemption",
  "year": 1994,
  "imdblink": "https://www.imdb.com/title/tt0111161/",
  "genre": ["Drama"],
  "rating": "9.3",
  "image": "https://...",
  "description": "..."
}
```

Watchlist items stored in `localStorage` under `cutsceneWatchlist` additionally carry `type` (`"movie"` or `"tv"`) and `dateAdded` (timestamp).

## 🚀 Getting Started

This is a static site — no build step or backend needed.

1. Clone or download the repository
2. Because pages `fetch()` local JSON files, open the project through a local server rather than the `file://` protocol (fetch requests are blocked from `file://` in most browsers):
   ```bash
   # with Python
   python -m http.server 8000

   # or with the VS Code "Live Server" extension
   ```
3. Visit `http://localhost:8000/index.html`

## 🧩 Tech Stack

- **HTML5** — semantic markup across all pages
- **CSS3** — custom properties, flexbox/grid, keyframe animations, responsive breakpoints
- **Bootstrap 5.3.8** — grid, navbar, modal, accordion components (via CDN)
- **Font Awesome 7.3.1** — icons (via CDN)
- **Vanilla JavaScript** — no framework; DOM manipulation, `fetch`, `localStorage`

## 📌 Roadmap / Known Improvements

- [ ] Wire up sign in / sign up forms to real authentication
- [ ] Replace `localStorage` seeding with a proper backend/API
- [ ] Add trailer and cast info to the detail modal
- [ ] Add a "Load More" / pagination control for large catalogs
- [ ] Refactor page scripts into shared modules/classes to reduce duplication between `movies.js` and `tv-shows.js`

## 📄 License

All Rights Reserved © Cutscene 2026.
