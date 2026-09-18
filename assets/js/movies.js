let moviesData = [];
let currentFilter = "all";
let currentLanguage = "all";
let currentSearch = "";
let currentSort = "default";

const arabicMovies = [
  {
    id: 101,
    title: "الفيل الأزرق",
    titleEn: "The Blue Elephant",
    year: 2014,
    genre: ["Drama", "Thriller"],
    rating: "8.0",
    language: "AR",
    image: makeArabicPoster("الفيل الأزرق", 2014),
    description: "طبيب نفسي يعود للعمل في مستشفى للأمراض النفسية، ويواجه حالة غامضة تقوده إلى أسرار غير متوقعة.",
    descriptionEn: "A psychiatrist returns to work at a mental hospital and encounters a mysterious case that leads him into unexpected secrets."
  },
  {
    id: 102,
    title: "تراب الماس",
    titleEn: "Diamond Dust",
    year: 2018,
    genre: ["Crime", "Drama", "Thriller"],
    rating: "7.4",
    language: "AR",
    image: makeArabicPoster("تراب الماس", 2018),
    description: "تدفع جريمة غامضة شابًا إلى البحث عن حقيقة عائلته وسلسلة من الأحداث المرتبطة بالماضي.",
    descriptionEn: "A mysterious crime pushes a young man to uncover his family's history and a chain of events connected to the past."
  },
  {
    id: 103,
    title: "كيرة والجن",
    titleEn: "Kira & El Gin",
    year: 2022,
    genre: ["Action", "Drama", "History"],
    rating: "7.8",
    language: "AR",
    image: makeArabicPoster("كيرة والجن", 2022),
    description: "يتقاطع طريق رجلين في مقاومة الاحتلال خلال فترة تاريخية مضطربة، وتجمعهما مواجهة واحدة.",
    descriptionEn: "Two men cross paths while resisting occupation during a turbulent historical period, joining forces against a common enemy."
  },
  {
    id: 104,
    title: "إكس لارج",
    titleEn: "X Large",
    year: 2011,
    genre: ["Comedy", "Drama"],
    rating: "7.1",
    language: "AR",
    image: makeArabicPoster("إكس لارج", 2011),
    description: "كوميديا اجتماعية عن شاب يحاول التعامل مع حياته اليومية وعلاقاته ونظرته إلى نفسه والآخرين.",
    descriptionEn: "A social comedy about a young man dealing with everyday life, relationships, and how he sees himself and others."
  }
];

function makeArabicPoster(title, year) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><rect width="600" height="900" fill="#171a20"/><rect x="28" y="28" width="544" height="844" rx="20" fill="#242832" stroke="#8066ff" stroke-width="3"/><text x="300" y="170" text-anchor="middle" fill="#8066ff" font-size="32" font-family="Arial">CUTSCENE</text><text x="300" y="430" text-anchor="middle" direction="rtl" fill="#ffffff" font-size="55" font-family="Arial" font-weight="bold">${title}</text><text x="300" y="500" text-anchor="middle" fill="#aeb2bc" font-size="25" font-family="Arial">${year}</text><text x="300" y="790" text-anchor="middle" fill="#ed5b69" font-size="28" font-family="Arial">AR • عربي</text></svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function normalizeMovie(m) {
  const language = String(m.language || m.lang || "EN").toUpperCase() === "AR" ? "AR" : "EN";
  return {
    ...m,
    language,
    genre: Array.isArray(m.genre) ? m.genre.map((g) => String(g).toLowerCase()) : typeof m.genre === "string" ? [m.genre.toLowerCase()] : []
  };
}

function loadMovies() {
  fetch("../assets/data/movies.json?t=" + Date.now())
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((data) => {
      moviesData = [...data.map(normalizeMovie), ...arabicMovies.map(normalizeMovie)];
      localStorage.setItem("movies", JSON.stringify(moviesData));
      renderMovies();
    })
    .catch((err) => {
      console.error("Failed to fetch movies.json:", err);
      try {
        const stored = JSON.parse(localStorage.getItem("movies") || "[]");
        moviesData = [...stored.map(normalizeMovie), ...arabicMovies.map(normalizeMovie).filter(a => !stored.some(s => Number(s.id) === a.id))];
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
    const languageMatch = currentLanguage === "all" || m.language === currentLanguage;
    const searchMatch = !searchTerm || String(m.title).toLowerCase().includes(searchTerm) || String(m.titleEn || "").toLowerCase().includes(searchTerm);
    return genreMatch && languageMatch && searchMatch;
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
    const isArabic = movie.language === "AR";
    const displayTitle = isArabic ? movie.title : movie.title;
    col.innerHTML = `
      <div class="movies-careds ${isArabic ? "arabic-movie" : "english-movie"}" data-id="${movie.id}" data-title="${escapeAttribute(movie.title)}" data-title-en="${escapeAttribute(movie.titleEn || movie.title)}" data-year="${movie.year}" data-rating="${movie.rating}" data-image="${escapeAttribute(movie.image)}" data-description="${escapeAttribute(movie.description || "No description.")}" data-description-en="${escapeAttribute(movie.descriptionEn || movie.description || "No description.")}" data-language="${movie.language}" data-type="movie" data-imdblink="${escapeAttribute(movie.imdblink || "")}">
        <div class="movies-postar">
          <img src="${escapeAttribute(movie.image)}" alt="${escapeAttribute(displayTitle)}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'" />
          <span class="language-badge-card ${isArabic ? "ar-badge" : "en-badge"}">${isArabic ? "AR" : "E"}</span>
          <span class="movies-rating">${movie.rating}/10</span>
        </div>
        <h4>${escapeHtml(displayTitle)}</h4><p>${movie.year}</p>
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

  document.querySelectorAll(".language-btn").forEach((btn) => btn.addEventListener("click", function () {
    document.querySelectorAll(".language-btn").forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    currentLanguage = this.dataset.language || "all";
    document.documentElement.lang = currentLanguage === "AR" ? "ar" : "en";
    renderMovies();
  }));

  document.getElementById("searchInput")?.addEventListener("input", function () { currentSearch = this.value; renderMovies(); });
  document.getElementById("movieSearchForm")?.addEventListener("submit", e => e.preventDefault());
  document.getElementById("sortSelect")?.addEventListener("change", function () { currentSort = this.value; renderMovies(); });

  const params = new URLSearchParams(window.location.search);
  const urlSearch = params.get("search");
  if (urlSearch) {
    currentSearch = urlSearch;
    const input = document.getElementById("searchInput");
    if (input) input.value = urlSearch;
  }
}

let watchlist = JSON.parse(localStorage.getItem("cutsceneWatchlist")) || [];
function saveWatchlist() { localStorage.setItem("cutsceneWatchlist", JSON.stringify(watchlist)); }
function isInWatchlist(id, type = "movie") { return watchlist.some(item => item.id === id && (item.type || "movie") === type); }

function openDetailModal(card) {
  const id = Number(card.dataset.id), language = card.dataset.language || "EN", title = language === "AR" ? card.dataset.title : card.dataset.titleEn || card.dataset.title, type = card.dataset.type || "movie";
  document.getElementById("modalTitle").textContent = language === "AR" ? "التفاصيل" : "Details";
  document.getElementById("modalTitleText").textContent = title;
  document.getElementById("modalYearLabel").textContent = language === "AR" ? "السنة:" : "Year:";
  document.getElementById("modalRatingLabel").textContent = language === "AR" ? "التقييم:" : "Rating:";
  document.getElementById("modalDescriptionLabel").textContent = language === "AR" ? "الوصف:" : "Description:";
  document.getElementById("modalYear").textContent = card.dataset.year;
  document.getElementById("modalRating").textContent = card.dataset.rating;
  document.getElementById("modalImage").src = card.dataset.image;
  document.getElementById("modalDescription").textContent = language === "AR" ? card.dataset.description : card.dataset.descriptionEn;
  document.getElementById("modalTitleText").dir = language === "AR" ? "rtl" : "ltr";
  document.getElementById("modalDescription").dir = language === "AR" ? "rtl" : "ltr";
  const imdbContainer = document.getElementById("modalImdbContainer"), imdbLink = document.getElementById("modalImdbLink");
  if (card.dataset.imdblink) { imdbLink.href = card.dataset.imdblink; imdbContainer.classList.remove("d-none"); } else imdbContainer.classList.add("d-none");
  const btn = document.getElementById("modalAddWatchlist"), status = document.getElementById("modalWatchlistStatus");
  const saved = isInWatchlist(id, type);
  btn.textContent = saved ? (language === "AR" ? "إزالة من القائمة" : "Remove from Watchlist") : (language === "AR" ? "+ إضافة للقائمة" : "+ Add to Watchlist");
  status.classList.toggle("d-none", !saved);
  btn.dataset.id = id; btn.dataset.title = title; btn.dataset.year = card.dataset.year; btn.dataset.rating = card.dataset.rating; btn.dataset.image = card.dataset.image; btn.dataset.description = language === "AR" ? card.dataset.description : card.dataset.descriptionEn; btn.dataset.type = type;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("detailModal")).show();
}

document.addEventListener("click", function (e) {
  const addBtn = e.target.closest("#modalAddWatchlist");
  if (addBtn) {
    const id = Number(addBtn.dataset.id), type = addBtn.dataset.type || "movie";
    const index = watchlist.findIndex(item => item.id === id && (item.type || "movie") === type);
    if (index >= 0) { watchlist.splice(index, 1); addBtn.textContent = "+ Add to Watchlist"; document.getElementById("modalWatchlistStatus").classList.add("d-none"); }
    else { watchlist.push({ id, title:addBtn.dataset.title, year:addBtn.dataset.year, rating:addBtn.dataset.rating, image:addBtn.dataset.image, description:addBtn.dataset.description, type, dateAdded:Date.now() }); addBtn.textContent = "+ Add to Watchlist"; document.getElementById("modalWatchlistStatus").classList.remove("d-none"); }
    saveWatchlist();
    return;
  }
  const card = e.target.closest(".movies-careds");
  if (card) openDetailModal(card);
});

document.addEventListener("DOMContentLoaded", () => { loadMovies(); setupFilters(); });
