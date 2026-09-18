// Cutscene Library / Watchlist
let watchlist = JSON.parse(localStorage.getItem("cutsceneWatchlist")) || [];
let currentSort = "date";
let currentSearch = "";

const grid = document.getElementById("watchlistGrid");
const movieCount = document.getElementById("movieCount");
const sortSelect = document.getElementById("sortSelect");
const librarySearch = document.getElementById("librarySearch");
const librarySearchForm = document.getElementById("librarySearchForm");

function saveWatchlist() {
  localStorage.setItem("cutsceneWatchlist", JSON.stringify(watchlist));
}

function updateCount(count = watchlist.length) {
  if (movieCount) {
    movieCount.textContent = `(${count} ${count === 1 ? "title" : "titles"})`;
  }
}

function getFilteredAndSortedMovies() {
  const query = currentSearch.trim().toLowerCase();
  let sorted = [...watchlist].filter((item) =>
    String(item.title || "").toLowerCase().includes(query)
  );

  switch (currentSort) {
    case "date":
      sorted.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
      break;
    case "rating":
      sorted.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
      break;
    case "title":
      sorted.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
      break;
    case "year":
      sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
      break;
  }

  return sorted;
}

function renderWatchlist() {
  if (!grid) return;
  grid.innerHTML = "";

  const movies = getFilteredAndSortedMovies();
  updateCount(movies.length);

  if (movies.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5 library-empty">
        <h4>${currentSearch ? "No movies found" : "Your watchlist is empty"}</h4>
        <p>${currentSearch ? "Try another title." : "Add movies or TV shows from the Dashboard, Movies, or TV Shows pages."}</p>
      </div>
    `;
    return;
  }

  movies.forEach((item) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-4 col-xl-3";

    const isMovie = item.type === "movie";
    const cardClass = isMovie ? "movies-careds" : "tv-shows-careds";
    const posterClass = isMovie ? "movies-postar" : "tv-shows-postar";
    const ratingClass = isMovie ? "movies-rating" : "tv-shows-rating";

    col.innerHTML = `
      <div class="${cardClass} watchlist-item"
        data-id="${item.id}"
        data-type="${item.type || "movie"}"
        data-title="${escapeAttribute(item.title)}"
        data-year="${item.year || ""}"
        data-rating="${item.rating || ""}"
        data-image="${escapeAttribute(item.image || "") }"
        data-description="${escapeAttribute(item.description || "")}">
        <div class="${posterClass}">
          <img src="${escapeAttribute(item.image || "")}" alt="${escapeAttribute(item.title)}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
          <span class="${ratingClass}">${item.rating ?? "N/A"}/10</span>
          <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 delete-btn" data-id="${item.id}" data-type="${item.type || "movie"}" title="Remove from watchlist" aria-label="Remove ${escapeAttribute(item.title)}">×</button>
        </div>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${item.year || ""}</p>
      </div>
    `;
    grid.appendChild(col);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const id = Number(this.dataset.id);
      const type = this.dataset.type;
      watchlist = watchlist.filter((item) => !(item.id === id && (item.type || "movie") === type));
      saveWatchlist();
      renderWatchlist();
    });
  });

  document.querySelectorAll(".watchlist-item").forEach((card) => {
    card.addEventListener("click", function () {
      openDetailModalFromCard(this);
    });
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function openDetailModalFromCard(card) {
  const title = card.dataset.title;
  const year = card.dataset.year;
  const rating = card.dataset.rating;
  const image = card.dataset.image;
  const description = card.dataset.description || "No description.";
  const id = Number(card.dataset.id);
  const type = card.dataset.type;

  document.getElementById("modalTitleText").textContent = title;
  document.getElementById("modalYear").textContent = year;
  document.getElementById("modalRating").textContent = rating;
  document.getElementById("modalImage").src = image;
  document.getElementById("modalImage").alt = title;
  document.getElementById("modalDescription").textContent = description;

  const imdbContainer = document.getElementById("modalImdbContainer");
  const imdbLink = document.getElementById("modalImdbLink");
  imdbLink.href = `https://www.imdb.com/find/?q=${encodeURIComponent(title + " " + year)}`;
  imdbContainer.classList.remove("d-none");

  const addBtn = document.getElementById("modalAddWatchlist");
  const statusSpan = document.getElementById("modalWatchlistStatus");
  addBtn.textContent = "Remove from Watchlist";
  statusSpan.classList.remove("d-none");
  statusSpan.textContent = "✓ In your watchlist";
  addBtn.dataset.id = id;
  addBtn.dataset.type = type;

  bootstrap.Modal.getOrCreateInstance(document.getElementById("detailModal")).show();
}

if (sortSelect) {
  sortSelect.addEventListener("change", function () {
    currentSort = this.value;
    renderWatchlist();
  });
}

if (librarySearch) {
  librarySearch.addEventListener("input", function () {
    currentSearch = this.value;
    renderWatchlist();
  });
}

if (librarySearchForm) {
  librarySearchForm.addEventListener("submit", function (e) {
    e.preventDefault();
  });
}

document.addEventListener("click", function (e) {
  const btn = e.target.closest("#modalAddWatchlist");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const type = btn.dataset.type;
  const index = watchlist.findIndex((item) => item.id === id && (item.type || "movie") === type);

  if (index !== -1) {
    watchlist.splice(index, 1);
    saveWatchlist();
    renderWatchlist();
    btn.textContent = "+ Add to Watchlist";
    document.getElementById("modalWatchlistStatus").classList.add("d-none");
  }
});

document.addEventListener("DOMContentLoaded", renderWatchlist);
