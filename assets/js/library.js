// ─── DATA ─────────────────────────────────────────────────────────
let watchlist = JSON.parse(localStorage.getItem("cutsceneWatchlist")) || [];
let currentSort = "date";

// ─── DOM REFS ──────────────────────────────────────────────────
const grid = document.getElementById("watchlistGrid");
const movieCount = document.getElementById("movieCount");
const sortSelect = document.getElementById("sortSelect");

// ─── SAVE ──────────────────────────────────────────────────────
function saveWatchlist() {
  localStorage.setItem("cutsceneWatchlist", JSON.stringify(watchlist));
}

// ─── UPDATE COUNT ─────────────────────────────────────────────
function updateCount() {
  const count = watchlist.length;
  if (movieCount) {
    movieCount.textContent = `(${count} ${count === 1 ? "title" : "titles"})`;
  }
}

// ─── RENDER ────────────────────────────────────────────────────
function renderWatchlist() {
  if (!grid) return;
  grid.innerHTML = "";

  if (watchlist.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center text-muted py-5">
        <h4>Your watchlist is empty</h4>
        <p>Add movies or TV shows from the Dashboard, Movies, or TV Shows pages.</p>
      </div>
    `;
    updateCount();
    return;
  }

  // Sort
  let sorted = [...watchlist];
  switch (currentSort) {
    case "date":
      sorted.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
      break;
    case "rating":
      sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      break;
    case "title":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "year":
      sorted.sort((a, b) => b.year - a.year);
      break;
    default:
      break;
  }

  sorted.forEach((item) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-4 col-xl-3";

    // Determine card class based on type
    const isMovie = item.type === "movie";
    const cardClass = isMovie ? "movies-careds" : "tv-shows-careds";
    const posterClass = isMovie ? "movies-postar" : "tv-shows-postar";
    const ratingClass = isMovie ? "movies-rating" : "tv-shows-rating";

    col.innerHTML = `
      <div class="${cardClass} watchlist-item" data-id="${item.id}" data-type="${item.type}" data-title="${item.title}" data-year="${item.year}" data-rating="${item.rating}" data-image="${item.image}" data-description="${item.description || ""}">
        <div class="${posterClass}">
          <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'" />
          <span class="${ratingClass}">${item.rating}/10</span>
          <!-- delete button -->
          <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 delete-btn" data-id="${item.id}" data-type="${item.type}" style="z-index:5; border-radius:50%; width:30px; height:30px; padding:0; line-height:1;">×</button>
        </div>
        <h4>${item.title}</h4>
        <p>${item.year}</p>
      </div>
    `;
    grid.appendChild(col);
  });

  updateCount();

  // Attach delete events
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation(); // prevent modal opening
      const id = Number(this.dataset.id);
      const type = this.dataset.type;
      watchlist = watchlist.filter(
        (item) => !(item.id === id && item.type === type),
      );
      saveWatchlist();
      renderWatchlist();
    });
  });

  // Attach click to open modal (same as dashboard)
  document.querySelectorAll(".watchlist-item").forEach((card) => {
    card.addEventListener("click", function () {
      openDetailModalFromCard(this);
    });
  });
}

// ─── OPEN MODAL FROM WATCHLIST CARD ─────────────────────────
function openDetailModalFromCard(card) {
  const title = card.dataset.title;
  const year = card.dataset.year;
  const rating = card.dataset.rating;
  const image = card.dataset.image;
  const description = card.dataset.description || "No description.";
  const id = Number(card.dataset.id);
  const type = card.dataset.type;
  const imdbContainer = document.getElementById("modalImdbContainer");
  const imdbLink = document.getElementById("modalImdbLink");
  document.getElementById("modalTitle").textContent = "Details";
  document.getElementById("modalTitleText").textContent = title;
  document.getElementById("modalYear").textContent = year;
  document.getElementById("modalRating").textContent = rating;
  document.getElementById("modalImage").src = image;
  document.getElementById("modalDescription").textContent = description;
  const imdbUrl =
    card.dataset.imdb ||
    `https://www.imdb.com/find/?q=${encodeURIComponent(title + " " + year)}`;
  imdbLink.href = imdbUrl;
  imdbContainer.classList.remove("d-none");
  const addBtn = document.getElementById("modalAddWatchlist");
  const statusSpan = document.getElementById("modalWatchlistStatus");

  // Since it's already in watchlist, show remove option
  addBtn.textContent = "Remove from Watchlist";
  statusSpan.classList.remove("d-none");
  statusSpan.textContent = "✓ In your watchlist";

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

// ─── SORT CHANGE ──────────────────────────────────────────────
if (sortSelect) {
  sortSelect.addEventListener("change", function () {
    currentSort = this.value;
    renderWatchlist();
  });
}

// ─── HANDLE WATCHLIST TOGGLE FROM MODAL (same as other pages) ──
document.addEventListener("click", function (e) {
  const btn = e.target.closest("#modalAddWatchlist");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const type = btn.dataset.type;
  const index = watchlist.findIndex(
    (item) => item.id === id && item.type === type,
  );
  if (index !== -1) {
    watchlist.splice(index, 1);
    saveWatchlist();
    renderWatchlist();
    // Close modal after removal? We'll leave it open, but update status.
    btn.textContent = "+ Add to Watchlist";
    document.getElementById("modalWatchlistStatus").classList.add("d-none");
    // Also close modal maybe? We'll let user close manually.
  }
});

// ─── INIT ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  renderWatchlist();
});
