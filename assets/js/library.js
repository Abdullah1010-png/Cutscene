let watchlist = JSON.parse(localStorage.getItem("cutsceneWatchlist") || "[]");
let catalog = [];
let currentSort = "date";
let currentSearch = "";
let currentType = "all";
let currentGenre = "all";
let currentLanguage = "all";

const $ = id => document.getElementById(id);
const grid = $("watchlistGrid");
const movieCount = $("movieCount");
const sortSelect = $("sortSelect");
const librarySearch = $("librarySearch");
const librarySearchForm = $("librarySearchForm");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}

function fallbackPoster(title) {
  const safe = String(title || "Cutscene").replace(/[<>&\"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750"><rect width="500" height="750" fill="#20232c"/><circle cx="250" cy="280" r="74" fill="#ef233c"/><path d="M230 245l70 35-70 35z" fill="white"/><text x="250" y="420" fill="white" font-size="28" text-anchor="middle" font-family="Arial">CUTSCENE</text><text x="250" y="465" fill="#a8adb8" font-size="22" text-anchor="middle" font-family="Arial">${safe}</text></svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function saveWatchlist() { localStorage.setItem("cutsceneWatchlist", JSON.stringify(watchlist)); }
function updateCount(count) { if (movieCount) movieCount.textContent = `(${count} ${count === 1 ? "title" : "titles"})`; }

function metaFor(item) {
  const type = item.type || "movie";
  const found = catalog.find(entry => Number(entry.id) === Number(item.id) && entry.type === type);
  return {
    ...found,
    ...item,
    type,
    language: item.language || found?.language || "EN",
    genre: Array.isArray(item.genre) ? item.genre : (found?.genre || []),
    image: item.image || found?.image || fallbackPoster(item.title)
  };
}

function getItems() {
  const query = currentSearch.trim().toLowerCase();
  const items = watchlist.map(metaFor).filter(item => {
    const typeMatch = currentType === "all" || item.type === currentType;
    const genreMatch = currentGenre === "all" || (item.genre || []).map(g => String(g).toLowerCase()).includes(currentGenre);
    const languageMatch = currentLanguage === "all" || item.language === currentLanguage;
    const searchMatch = !query || String(item.title || "").toLowerCase().includes(query);
    return typeMatch && genreMatch && languageMatch && searchMatch;
  });

  switch (currentSort) {
    case "date": items.sort((a,b) => (b.dateAdded || 0) - (a.dateAdded || 0)); break;
    case "rating-desc": items.sort((a,b) => Number(b.rating || 0) - Number(a.rating || 0)); break;
    case "rating-asc": items.sort((a,b) => Number(a.rating || 0) - Number(b.rating || 0)); break;
    case "year-desc": items.sort((a,b) => Number(b.year || 0) - Number(a.year || 0)); break;
    case "year-asc": items.sort((a,b) => Number(a.year || 0) - Number(b.year || 0)); break;
    case "title-asc": items.sort((a,b) => String(a.title || "").localeCompare(String(b.title || ""))); break;
    case "title-desc": items.sort((a,b) => String(b.title || "").localeCompare(String(a.title || ""))); break;
  }
  return items;
}

function renderWatchlist() {
  if (!grid) return;
  grid.innerHTML = "";
  const items = getItems();
  updateCount(items.length);

  if (!items.length) {
    const filtered = currentSearch || currentType !== "all" || currentGenre !== "all" || currentLanguage !== "all";
    grid.innerHTML = `<div class="col-12 text-center py-5 library-empty"><h4>${filtered ? "No titles found" : "Your watchlist is empty"}</h4><p>Try another filter or add a title from Movies or TV Shows.</p></div>`;
    return;
  }

  items.forEach(item => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3 col-xl-3";
    const isTV = item.type === "tv";
    const cardClass = isTV ? "tv-shows-careds" : "movies-careds";
    const posterClass = isTV ? "tv-shows-postar" : "movies-postar";
    const ratingClass = isTV ? "tv-shows-rating" : "movies-rating";
    const image = escapeHtml(item.image || fallbackPoster(item.title));
    const language = item.language === "AR" ? "AR" : "E";

    col.innerHTML = `<article class="${cardClass} watchlist-item" data-id="${item.id}" data-type="${item.type}" data-title="${escapeHtml(item.title)}" data-year="${item.year || ""}" data-rating="${item.rating || 0}" data-image="${image}" data-description="${escapeHtml(item.description || "")}"><div class="${posterClass}"><img src="${image}" alt="${escapeHtml(item.title)} poster" loading="lazy" onerror="this.onerror=null;this.src='${fallbackPoster(item.title)}'"><span class="${ratingClass}"><i class="fa-solid fa-star"></i> ${Number(item.rating || 0).toFixed(1)}</span><span class="language-badge-card ${item.language === "AR" ? "ar-badge" : "en-badge"}">${language}</span><button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 delete-btn" data-id="${item.id}" data-type="${item.type}" title="Remove from watchlist" aria-label="Remove ${escapeHtml(item.title)}">×</button></div><h4>${escapeHtml(item.title)}</h4><p>${item.year || ""} <span>•</span> ${isTV ? "Series" : "Movie"}</p></article>`;
    grid.appendChild(col);
  });

  grid.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", e => {
    e.stopPropagation();
    const id = Number(btn.dataset.id);
    const type = btn.dataset.type || "movie";
    watchlist = watchlist.filter(item => !(Number(item.id) === id && (item.type || "movie") === type));
    saveWatchlist();
    renderWatchlist();
  }));

  grid.querySelectorAll(".watchlist-item").forEach(card => card.addEventListener("click", () => openDetailModal(card)));
}

function openDetailModal(card) {
  $("modalTitleText").textContent = card.dataset.title;
  $("modalYear").textContent = card.dataset.year;
  $("modalRating").textContent = Number(card.dataset.rating || 0).toFixed(1) + "/10";
  $("modalDescription").textContent = card.dataset.description || "No description available.";

  const image = $("modalImage");
  image.src = card.dataset.image || fallbackPoster(card.dataset.title);
  image.alt = card.dataset.title + " poster";
  image.onerror = () => { image.onerror = null; image.src = fallbackPoster(card.dataset.title); };

  const imdb = $("modalImdbContainer");
  const link = $("modalImdbLink");
  link.href = `https://www.imdb.com/find/?q=${encodeURIComponent(card.dataset.title + " " + card.dataset.year)}`;
  imdb.classList.remove("d-none");

  const button = $("modalAddWatchlist");
  const status = $("modalWatchlistStatus");
  button.textContent = "Remove from Watchlist";
  status.classList.remove("d-none");
  button.dataset.id = card.dataset.id;
  button.dataset.type = card.dataset.type;
  bootstrap.Modal.getOrCreateInstance($("detailModal")).show();
}

async function loadCatalog() {
  const sources = [
    ["../assets/data/movies.json", "movie", "EN"],
    ["../assets/data/arabic-movies.json", "movie", "AR"],
    ["../assets/data/tv-shows.json", "tv", "EN"],
    ["../assets/data/arabic-tv-shows.json", "tv", "AR"]
  ];

  try {
    const responses = await Promise.all(sources.map(([url]) => fetch(url + "?t=" + Date.now())));
    if (responses.some(response => !response.ok)) throw new Error("Catalog request failed");
    const dataSets = await Promise.all(responses.map(response => response.json()));
    catalog = [];
    dataSets.forEach((data, index) => {
      const [, type, defaultLanguage] = sources[index];
      data.forEach(item => catalog.push({...item, type, language: item.language || defaultLanguage}));
    });
  } catch (error) {
    console.error("Could not load catalog:", error);
  }
  renderWatchlist();
}

function setupControls() {
  sortSelect?.addEventListener("change", e => { currentSort = e.target.value; renderWatchlist(); });
  librarySearch?.addEventListener("input", e => { currentSearch = e.target.value; renderWatchlist(); });
  librarySearchForm?.addEventListener("submit", e => e.preventDefault());

  $("genreSelect")?.addEventListener("change", e => {
    currentGenre = e.target.value || "all";
    renderWatchlist();
  });

  document.querySelectorAll("#libraryTypeFilter .filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("#libraryTypeFilter .filter-btn").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      currentType = button.dataset.type || "all";
      renderWatchlist();
    });
  });

  document.querySelectorAll("#libraryLanguageFilter .language-btn").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("#libraryLanguageFilter .language-btn").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      currentLanguage = button.dataset.language || "all";
      renderWatchlist();
    });
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("#modalAddWatchlist");
    if (!button) return;
    const id = Number(button.dataset.id);
    const type = button.dataset.type || "movie";
    watchlist = watchlist.filter(item => !(Number(item.id) === id && (item.type || "movie") === type));
    saveWatchlist();
    bootstrap.Modal.getInstance($("detailModal"))?.hide();
    renderWatchlist();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupControls();
  loadCatalog();
});
