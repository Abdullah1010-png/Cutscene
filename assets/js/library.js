let watchlist = JSON.parse(localStorage.getItem("cutsceneWatchlist") || "[]");
let catalog = [];
let currentSort = "date";
let currentSearch = "";
let currentType = "all";
let currentGenre = "all";
let currentLanguage = "all";

const grid = document.getElementById("watchlistGrid");
const movieCount = document.getElementById("movieCount");
const sortSelect = document.getElementById("sortSelect");
const librarySearch = document.getElementById("librarySearch");
const librarySearchForm = document.getElementById("librarySearchForm");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}

function fallbackPoster(title) {
  const safe = String(title).replace(/[<>&\"']/g, "");
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750"><rect width="500" height="750" fill="#20232c"/><circle cx="250" cy="280" r="74" fill="#ef233c"/><path d="M230 245l70 35-70 35z" fill="white"/><text x="250" y="420" fill="white" font-size="28" text-anchor="middle" font-family="Arial">CUTSCENE</text><text x="250" y="465" fill="#a8adb8" font-size="22" text-anchor="middle" font-family="Arial">${safe}</text></svg>`);
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
  let items = watchlist.map(metaFor).filter(item => {
    const typeMatch = currentType === "all" || item.type === currentType;
    const genreMatch = currentGenre === "all" || item.genre.map(g => String(g).toLowerCase()).includes(currentGenre);
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
    grid.innerHTML = `<div class="col-12 text-center py-5 library-empty"><h4>${currentSearch || currentType !== "all" || currentGenre !== "all" || currentLanguage !== "all" ? "No titles found" : "Your watchlist is empty"}</h4><p>Try another filter or add a title from Movies or TV Shows.</p></div>`;
    return;
  }

  items.forEach(item => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3 col-xl-3";
    const cardClass = item.type === "tv" ? "tv-shows-careds" : "movies-careds";
    const posterClass = item.type === "tv" ? "tv-shows-postar" : "movies-postar";
    const ratingClass = item.type === "tv" ? "tv-shows-rating" : "movies-rating";
    const image = escapeHtml(item.image);
    const language = item.language === "AR" ? "AR" : "E";

    col.innerHTML = `<article class="${cardClass} watchlist-item" data-id="${item.id}" data-type="${item.type}" data-title="${escapeHtml(item.title)}" data-year="${item.year || ""}" data-rating="${item.rating || 0}" data-image="${image}" data-description="${escapeHtml(item.description || "")}" data-language="${item.language}"><div class="${posterClass}"><img src="${image}" alt="${escapeHtml(item.title)} poster" loading="lazy" onerror="this.onerror=null;this.src='${fallbackPoster(item.title)}'"><span class="${ratingClass}"><i class="fa-solid fa-star"></i> ${Number(item.rating || 0).toFixed(1)}</span><span class="language-badge-card ${item.language === "AR" ? "ar-badge" : "en-badge"}">${language}</span><button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 delete-btn" data-id="${item.id}" data-type="${item.type}" title="Remove from watchlist" aria-label="Remove ${escapeHtml(item.title)}">×</button></div><h4>${escapeHtml(item.title)}</h4><p>${item.year || ""} <span>•</span> ${item.type === "tv" ? "Series" : "Movie"}</p></article>`;
    grid.appendChild(col);
  });

  document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", e => {
    e.stopPropagation();
    const id = Number(btn.dataset.id);
    const type = btn.dataset.type;
    watchlist = watchlist.filter(item => !(Number(item.id) === id && (item.type || "movie") === type));
    saveWatchlist();
    renderWatchlist();
  }));

  document.querySelectorAll(".watchlist-item").forEach(card => card.addEventListener("click", () => openDetailModal(card)));
}

function openDetailModal(card) {
  const title = card.dataset.title;
  document.getElementById("modalTitleText").textContent = title;
  document.getElementById("modalYear").textContent = card.dataset.year;
  document.getElementById("modalRating").textContent = Number(card.dataset.rating || 0).toFixed(1) + "/10";
  document.getElementById("modalDescription").textContent = card.dataset.description || "No description available.";

  const image = document.getElementById("modalImage");
  image.src = card.dataset.image || fallbackPoster(title);
  image.alt = title + " poster";
  image.onerror = () => { image.onerror = null; image.src = fallbackPoster(title); };

  const imdb = document.getElementById("modalImdbContainer");
  const link = document.getElementById("modalImdbLink");
  link.href = `https://www.imdb.com/find/?q=${encodeURIComponent(title + " " + card.dataset.year)}`;
  imdb.classList.remove("d-none");

  const button = document.getElementById("modalAddWatchlist");
  const status = document.getElementById("modalWatchlistStatus");
  button.textContent = "Remove from Watchlist";
  status.classList.remove("d-none");
  button.dataset.id = card.dataset.id;
  button.dataset.type = card.dataset.type;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("detailModal")).show();
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
    const dataSets = await Promise.all(responses.map(r => r.json()));
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

sortSelect?.addEventListener("change", function(){ currentSort = this.value; renderWatchlist(); });
librarySearch?.addEventListener("input", function(){ currentSearch = this.value; renderWatchlist(); });
librarySearchForm?.addEventListener("submit", e => e.preventDefault());

document.querySelectorAll("#libraryGenreFilter .filter-btn").forEach(btn => btn.addEventListener("click", function(){
  document.querySelectorAll("#libraryGenreFilter .filter-btn").forEach(b => b.classList.remove("active"));
  this.classList.add("active");
  currentGenre = this.dataset.filter || "all";
  renderWatchlist();
}));

document.querySelectorAll("#libraryTypeFilter .filter-btn").forEach(btn => btn.addEventListener("click", function(){
  document.querySelectorAll("#libraryTypeFilter .filter-btn").forEach(b => b.classList.remove("active"));
  this.classList.add("active");
  currentType = this.dataset.type || "all";
  renderWatchlist();
}));

document.querySelectorAll("#libraryLanguageFilter .language-btn").forEach(btn => btn.addEventListener("click", function(){
  document.querySelectorAll("#libraryLanguageFilter .language-btn").forEach(b => b.classList.remove("active"));
  this.classList.add("active");
  currentLanguage = this.dataset.language || "all";
  renderWatchlist();
}));

document.addEventListener("click", function(e){
  const btn = e.target.closest("#modalAddWatchlist");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const type = btn.dataset.type || "movie";
  watchlist = watchlist.filter(item => !(Number(item.id) === id && (item.type || "movie") === type));
  saveWatchlist();
  bootstrap.Modal.getInstance(document.getElementById("detailModal"))?.hide();
  renderWatchlist();
});

document.addEventListener("DOMContentLoaded", loadCatalog);
