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
    image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/6TQMUpRRzzSmzr6KQserQu9ViNB.jpg",
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
    image: "https://image.tmdb.org/t/p/w500/6TQMUpRRzzSmzr6KQserQu9ViNB.jpg",
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
    image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/cXD23v93qyFwXNBz3Z5kaTMac9h.jpg",
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
    image: "https://image.tmdb.org/t/p/original/dBK3YVsY27F7VYWXdSrXqot947K.jpg",
    description: "كوميديا اجتماعية عن شاب يحاول التعامل مع حياته اليومية وعلاقاته ونظرته إلى نفسه والآخرين.",
    descriptionEn: "A social comedy about a young man dealing with everyday life, relationships, and how he sees himself and others."
  }
];

function makeArabicPoster(title, year) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#151820"/><stop offset="1" stop-color="#302044"/></linearGradient></defs><rect width="600" height="900" fill="url(#g)"/><circle cx="470" cy="150" r="150" fill="#8066ff" opacity=".12"/><rect x="30" y="30" width="540" height="840" rx="24" fill="none" stroke="#8066ff" stroke-width="3" opacity=".8"/><text x="300" y="145" text-anchor="middle" fill="#a78bfa" font-size="30" font-family="Arial" letter-spacing="4">CUTSCENE</text><text x="300" y="450" text-anchor="middle" direction="rtl" fill="#fff" font-size="54" font-family="Arial" font-weight="700">${title}</text><text x="300" y="515" text-anchor="middle" fill="#c7cad2" font-size="24" font-family="Arial">${year}</text><text x="300" y="810" text-anchor="middle" fill="#ff6b7a" font-size="25" font-family="Arial">AR • عربي</text></svg>`;
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
    const displayTitle = movie.title;
    col.innerHTML = `
      <div class="movies-careds ${isArabic ? "arabic-movie" : "english-movie"}" data-id="${movie.id}" data-title="${escapeAttribute(movie.title)}" data-title-en="${escapeAttribute(movie.titleEn || movie.title)}" data-year="${movie.year}" data-rating="${movie.rating}" data-image="${escapeAttribute(movie.image)}" data-description="${escapeAttribute(movie.description || "No description.")}" data-description-en="${escapeAttribute(movie.descriptionEn || movie.description || "No description.")}" data-language="${movie.language}" data-type="movie" data-imdblink="${escapeAttribute(movie.imdblink || "")}">
        <div class="movies-postar">
          <img src="${escapeAttribute(movie.image)}" alt="${escapeAttribute(displayTitle)}" loading="lazy" onerror="this.src=makeArabicPoster('${escapeAttribute(displayTitle)}','${movie.year}')" />
          <span class="content-type-badge">FILM</span>
          <span class="language-badge-card ${isArabic ? "ar-badge" : "en-badge"}">${isArabic ? "AR" : "E"}</span>
          <span class="movies-rating"><i class="fa-solid fa-star"></i> ${movie.rating}</span>
          <span class="poster-play"><i class="fa-solid fa-play"></i></span>
        </div>
        <div class="movie-card-info">
          <h4>${escapeHtml(displayTitle)}</h4><p>${movie.year} <span>•</span> ${isArabic ? "فيلم" : "Movie"}</p>
        </div>
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
