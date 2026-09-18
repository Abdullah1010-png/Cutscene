let moviesData = [];
let currentFilter = "all";
let currentSearch = "";
let currentSort = "default";

function loadMovies() {
  fetch("../assets/data/movies.json?t=" + Date.now())
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((data) => {
      moviesData = data.map((m) => ({
        ...m,
        genre: Array.isArray(m.genre)
          ? m.genre.map((g) => String(g).toLowerCase())
          : typeof m.genre === "string"
            ? [m.genre.toLowerCase()]
            : [],
      }));
      localStorage.setItem("movies", JSON.stringify(moviesData));
      renderMovies();
    })
    .catch((err) => {
      console.error("Failed to fetch movies.json:", err);
      try {
        const stored = JSON.parse(localStorage.getItem("movies") || "[]");
        moviesData = stored.map((m) => ({
          ...m,
          genre: Array.isArray(m.genre) ? m.genre.map((g) => String(g).toLowerCase()) : [],
        }));
        renderMovies();
      } catch (e) {
        const container = document.getElementById("moviesContainer");
        if (container) container.innerHTML = `<p class="text-danger text-center py-4">Could not load movies data.</p>`;
      }
    });
}

function sortItems(items) {
  const sorted = [...items];
  switch (currentSort) {
    case "rating-desc": sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)); break;
    case "rating-asc": sorted.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0)); break;
    case "year-desc": sorted.sort((a, b) => Number(b.year || 0) - Number(a.year || 0)); break;
    case "year-asc": sorted.sort((a, b) => Number(a.year || 0) - Number(b.year || 0)); break;
    case "title-asc": sorted.sort((a, b) => String(a.title).localeCompare(String(b.title))); break;
    case "title-desc": sorted.sort((a, b) => String(b.title).localeCompare(String(a.title))); break;
  }
  return sorted;
}

function renderMovies() {
  const container = document.getElementById("moviesContainer");
  const noResults = document.getElementById("noResults");
  if (!container) return;
  const searchTerm = currentSearch.toLowerCase().trim();

  let filtered = moviesData.filter((m) => {
    const genreMatch = currentFilter === "all" || m.genre.includes(currentFilter.toLowerCase());
    const searchMatch = !searchTerm || String(m.title).toLowerCase().includes(searchTerm);
    return genreMatch && searchMatch;
  });
  filtered = sortItems(filtered);

  container.innerHTML = "";
  if (!filtered.length) {
    noResults?.classList.remove("d-none");
    return;
  }
  noResults?.classList.add("d-none");

  filtered.forEach((movie) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-4 col-xl-3";
    col.innerHTML = `
      <div class="movies-careds" data-id="${movie.id}" data-title="${escapeAttribute(movie.title)}" data-year="${movie.year}" data-rating="${movie.rating}" data-image="${escapeAttribute(movie.image)}" data-description="${escapeAttribute(movie.description || "No description.")}" data-type="movie" data-imdblink="${escapeAttribute(movie.imdblink || "")}">
        <div class="movies-postar">
          <img src="${escapeAttribute(movie.image)}" alt="${escapeAttribute(movie.title)}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'" />
          <span class="movies-rating">${movie.rating}/10</span>
        </div>
        <h4>${escapeHtml(movie.title)}</h4><p>${movie.year}</p>
      </div>`;
    container.appendChild(col);
  });
}

function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
function escapeAttribute(value) { return escapeHtml(value); }

function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach((btn) => btn.addEventListener("click", function () {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    currentFilter = this.dataset.filter || "all";
    renderMovies();
  }));
  document.getElementById("searchInput")?.addEventListener("input", function () { currentSearch = this.value; renderMovies(); });
  document.getElementById("movieSearchForm")?.addEventListener("submit", e => e.preventDefault());
  document.getElementById("sortSelect")?.addEventListener("change", function () { currentSort = this.value; renderMovies(); });
}

let watchlist = JSON.parse(localStorage.getItem("cutsceneWatchlist")) || [];
function saveWatchlist() { localStorage.setItem("cutsceneWatchlist", JSON.stringify(watchlist)); }
function isInWatchlist(id, type = "movie") { return watchlist.some(item => item.id === id && (item.type || "movie") === type); }

function openDetailModal(card) {
  const id = Number(card.dataset.id), title = card.dataset.title, type = card.dataset.type || "movie";
  document.getElementById("modalTitle").textContent = "Details";
  document.getElementById("modalTitleText").textContent = title;
  document.getElementById("modalYear").textContent = card.dataset.year;
  document.getElementById("modalRating").textContent = card.dataset.rating;
  document.getElementById("modalImage").src = card.dataset.image;
  document.getElementById("modalDescription").textContent = card.dataset.description;
  const imdbContainer = document.getElementById("modalImdbContainer"), imdbLink = document.getElementById("modalImdbLink");
  if (card.dataset.imdblink) { imdbLink.href = card.dataset.imdblink; imdbContainer.classList.remove("d-none"); } else imdbContainer.classList.add("d-none");
  const btn = document.getElementById("modalAddWatchlist"), status = document.getElementById("modalWatchlistStatus");
  const saved = isInWatchlist(id, type);
  btn.textContent = saved ? "Remove from Watchlist" : "+ Add to Watchlist";
  status.classList.toggle("d-none", !saved);
  btn.dataset.id = id; btn.dataset.title = title; btn.dataset.year = card.dataset.year; btn.dataset.rating = card.dataset.rating; btn.dataset.image = card.dataset.image; btn.dataset.description = card.dataset.description; btn.dataset.type = type;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("detailModal")).show();
}

document.addEventListener("click", function (e) {
  const addBtn = e.target.closest("#modalAddWatchlist");
  if (addBtn) {
    const id = Number(addBtn.dataset.id), type = addBtn.dataset.type || "movie";
    const index = watchlist.findIndex(item => item.id === id && (item.type || "movie") === type);
    if (index >= 0) { watchlist.splice(index, 1); addBtn.textContent = "+ Add to Watchlist"; document.getElementById("modalWatchlistStatus").classList.add("d-none"); }
    else { watchlist.push({ id, title:addBtn.dataset.title, year:addBtn.dataset.year, rating:addBtn.dataset.rating, image:addBtn.dataset.image, description:addBtn.dataset.description, type, dateAdded:Date.now() }); addBtn.textContent = "Remove from Watchlist"; document.getElementById("modalWatchlistStatus").classList.remove("d-none"); }
    saveWatchlist();
    return;
  }
  const card = e.target.closest(".movies-careds");
  if (card) openDetailModal(card);
});

document.addEventListener("DOMContentLoaded", () => { loadMovies(); setupFilters(); });
