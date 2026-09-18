// ─── DATA ─────────────────────────────────────────────────────────
let tvData = [];
let currentFilter = "all";
let currentSearch = "";

// ─── LOAD DATA ──────────────────────────────────────────────────
function loadTV() {
  // Always fetch fresh JSON first (cache‑busting)
  fetch("../assets/data/tv-shows.json?t=" + Date.now())
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((data) => {
      tvData = data.map((item) => {
        // Ensure genre is always an array of lowercase strings
        let genres = [];
        if (Array.isArray(item.genre)) {
          genres = item.genre.map((g) => g.toLowerCase());
        } else if (typeof item.genre === "string") {
          genres = [item.genre.toLowerCase()];
        }
        // If no genre, keep empty array (no fallback)
        return {
          ...item,
          genre: genres,
        };
      });
      localStorage.setItem("tvShows", JSON.stringify(tvData));
      renderTV();
    })
    .catch((err) => {
      console.error("Failed to fetch tv-shows.json:", err);
      // Fallback to localStorage
      let stored = localStorage.getItem("tvShows");
      if (stored) {
        try {
          tvData = JSON.parse(stored).map((item) => {
            let genres = [];
            if (Array.isArray(item.genre)) {
              genres = item.genre.map((g) => g.toLowerCase());
            } else if (typeof item.genre === "string") {
              genres = [item.genre.toLowerCase()];
            }
            return { ...item, genre: genres };
          });
          renderTV();
          return;
        } catch (e) {}
      }
      const container =
        document.getElementById("tvContainer") ||
        document.getElementById("tvShowsContainer");
      if (container) {
        container.innerHTML = `<p class="text-danger text-center py-4">⚠️ Could not load TV shows data. Please refresh or check network.</p>`;
      }
    });
}

// ─── RENDER CARDS ──────────────────────────────────────────────
function renderTV() {
  const container =
    document.getElementById("tvContainer") ||
    document.getElementById("tvShowsContainer");
  const noResults = document.getElementById("noResults");
  if (!container) return;

  const searchTerm = currentSearch.toLowerCase().trim();

  let filtered = tvData.filter((item) => {
    // Genre filter: if not "all", check if the selected genre is in the array
    if (currentFilter !== "all") {
      const filterLower = currentFilter.toLowerCase();
      if (!item.genre.some((g) => g.toLowerCase() === filterLower))
        return false;
    }
    // Search filter
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm))
      return false;
    return true;
  });

  container.innerHTML = "";
  if (filtered.length === 0) {
    if (noResults) noResults.classList.remove("d-none");
    return;
  }
  if (noResults) noResults.classList.add("d-none");

  filtered.forEach((item) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-4 col-xl-3";
    col.innerHTML = `
      <div class="tv-shows-careds" 
           data-id="${item.id}"
           data-title="${item.title}"
           data-year="${item.year}"
           data-rating="${item.rating}"
           data-image="${item.image}"
           data-description="${item.description || "No description."}"
           data-type="tv"
           data-imdblink="${item.imdblink || ""}">
        <div class="tv-shows-postar">
          <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'" />
          <span class="tv-shows-rating">${item.rating}/10</span>
        </div>
        <h4>${item.title}</h4>
        <p>${item.year}</p>
      </div>
    `;
    container.appendChild(col);
  });
}

// ─── FILTER + SEARCH ────────────────────────────────────────────
function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentFilter = this.dataset.filter; // e.g., "action", "drama", etc.
      renderTV();
    });
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentSearch = this.value;
      renderTV();
    });
  }
}

// ─── MODAL & WATCHLIST ──────────────────────────────────────────
let watchlist = JSON.parse(localStorage.getItem("cutsceneWatchlist")) || [];

function saveWatchlist() {
  localStorage.setItem("cutsceneWatchlist", JSON.stringify(watchlist));
}

function isInWatchlist(id) {
  return watchlist.some((item) => item.id === id);
}

function openDetailModal(card) {
  const title = card.dataset.title;
  const year = card.dataset.year;
  const rating = card.dataset.rating;
  const image = card.dataset.image;
  const description = card.dataset.description;
  const id = Number(card.dataset.id);
  const type = card.dataset.type || "tv";
  const imdblink = card.dataset.imdblink || "";

  document.getElementById("modalTitle").textContent = "Details";
  document.getElementById("modalTitleText").textContent = title;
  document.getElementById("modalYear").textContent = year;
  document.getElementById("modalRating").textContent = rating;
  document.getElementById("modalImage").src = image;
  document.getElementById("modalDescription").textContent = description;

  const imdbContainer = document.getElementById("modalImdbContainer");
  const imdbLink = document.getElementById("modalImdbLink");
  if (imdblink) {
    imdbLink.href = imdblink;
    imdbContainer.classList.remove("d-none");
  } else {
    imdbContainer.classList.add("d-none");
  }

  const addBtn = document.getElementById("modalAddWatchlist");
  const statusSpan = document.getElementById("modalWatchlistStatus");

  if (isInWatchlist(id)) {
    addBtn.textContent = "Remove from Watchlist";
    statusSpan.classList.remove("d-none");
    statusSpan.textContent = "✓ In your watchlist";
  } else {
    addBtn.textContent = "+ Add to Watchlist";
    statusSpan.classList.add("d-none");
  }

  addBtn.dataset.id = id;
  addBtn.dataset.title = title;
  addBtn.dataset.year = year;
  addBtn.dataset.rating = rating;
  addBtn.dataset.image = image;
  addBtn.dataset.description = description;
  addBtn.dataset.type = type;

  const modal = new bootstrap.Modal(document.getElementById("detailModal"));
  modal.show();
}

// ─── HANDLE WATCHLIST BUTTON IN MODAL ──────────────────────────
document.addEventListener("click", function (e) {
  const btn = e.target.closest("#modalAddWatchlist");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const title = btn.dataset.title;
  const year = btn.dataset.year;
  const rating = btn.dataset.rating;
  const image = btn.dataset.image;
  const description = btn.dataset.description;
  const type = btn.dataset.type;

  const index = watchlist.findIndex(
    (item) => item.id === id && item.type === type,
  );
  if (index !== -1) {
    watchlist.splice(index, 1);
    btn.textContent = "+ Add to Watchlist";
    document.getElementById("modalWatchlistStatus").classList.add("d-none");
  } else {
    watchlist.push({
      id,
      title,
      year,
      rating,
      image,
      description,
      type,
      dateAdded: Date.now(),
    });
    btn.textContent = "Remove from Watchlist";
    const statusSpan = document.getElementById("modalWatchlistStatus");
    statusSpan.classList.remove("d-none");
    statusSpan.textContent = "✓ In your watchlist";
  }
  saveWatchlist();
});

// ─── HANDLE CARD CLICK ──────────────────────────────────────────
document.addEventListener("click", function (e) {
  const card = e.target.closest(".tv-shows-careds");
  if (card) {
    openDetailModal(card);
  }
});

// ─── INIT ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  loadTV();
  setupFilters();
});
