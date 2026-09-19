const TV_DATA_URL = "../assets/data/tv-shows.json?t=" + Date.now();
const ARABIC_TV_URL = "../assets/data/arabic-tv-shows.json?t=" + Date.now();

let tvData = [];
let currentGenre = "all";
let currentType = "all";
let currentLanguage = "all";
let currentSearch = "";
let currentSort = "default";
let watchlist = JSON.parse(localStorage.getItem("cutsceneWatchlist") || "[]");

const $ = id => document.getElementById(id);

function normalize(item, defaultLanguage = "EN") {
  return {
    ...item,
    language: item.language || defaultLanguage,
    genre: Array.isArray(item.genre) ? item.genre.map(g => String(g).toLowerCase()) : [],
    rating: Number(item.rating || 0)
  };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
  }[char]));
}

function posterFallback(title) {
  const safe = String(title).replace(/[<>&\"']/g, "");
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750"><rect width="500" height="750" fill="#20232c"/><circle cx="250" cy="280" r="74" fill="#ef233c" opacity=".9"/><path d="M230 245l70 35-70 35z" fill="white"/><text x="250" y="420" fill="white" font-size="28" text-anchor="middle" font-family="Arial">CUTSCENE</text><text x="250" y="465" fill="#a8adb8" font-size="22" text-anchor="middle" font-family="Arial">${safe}</text></svg>`
  );
}

function saveWatchlist() {
  localStorage.setItem("cutsceneWatchlist", JSON.stringify(watchlist));
}

function sortItems(items) {
  const sorted = [...items];
  switch (currentSort) {
    case "rating-desc": sorted.sort((a, b) => b.rating - a.rating); break;
    case "rating-asc": sorted.sort((a, b) => a.rating - b.rating); break;
    case "year-desc": sorted.sort((a, b) => b.year - a.year); break;
    case "year-asc": sorted.sort((a, b) => a.year - b.year); break;
    case "title-asc": sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
    case "title-desc": sorted.sort((a, b) => b.title.localeCompare(a.title)); break;
  }
  return sorted;
}

function renderTV() {
  const container = $("tvShowsContainer") || $("tvContainer");
  const noResults = $("noResults");
  if (!container) return;

  const query = currentSearch.trim().toLowerCase();
  let items = tvData.filter(show => {
    const typeMatch = currentType === "all" || currentType === "tv";
    const genreMatch = currentGenre === "all" || show.genre.includes(currentGenre);
    const languageMatch = currentLanguage === "all" || show.language === currentLanguage;
    const searchMatch = !query || show.title.toLowerCase().includes(query);
    return typeMatch && genreMatch && languageMatch && searchMatch;
  });

  items = sortItems(items);
  container.innerHTML = "";

  if (!items.length) {
    noResults?.classList.remove("d-none");
    return;
  }
  noResults?.classList.add("d-none");

  items.forEach((show, index) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3 col-xl-3";
    const arabicClass = show.language === "AR" ? "arabic-movie" : "";
    const image = escapeHtml(show.image || posterFallback(show.title));

    col.innerHTML = `
      <article class="tv-shows-careds ${arabicClass}" data-id="${show.id}" style="--delay:${index * 35}ms">
        <div class="tv-shows-postar">
          <img src="${image}" alt="${escapeHtml(show.title)} poster" loading="lazy"
               onerror="this.onerror=null;this.src='${posterFallback(show.title)}';">
          <span class="tv-shows-rating"><i class="fa-solid fa-star"></i> ${show.rating.toFixed(1)}</span>
          <span class="language-badge-card ${show.language === "AR" ? "ar-badge" : "en-badge"}">${show.language}</span>
          <span class="content-type-badge">SERIES</span>
          <span class="poster-play"><i class="fa-solid fa-play"></i></span>
        </div>
        <div class="tv-card-info">
          <h4>${escapeHtml(show.title)}</h4>
          <p>${show.year} <span>•</span> ${show.language === "AR" ? "عربي" : "English"}</p>
        </div>
      </article>`;

    col.querySelector("article").addEventListener("click", () => openDetails(show));
    container.appendChild(col);
  });
}

function openDetails(show) {
  $("modalTitleText").textContent = show.title;
  $("modalYear").textContent = show.year;
  $("modalRating").textContent = show.rating.toFixed(1) + "/10";
  $("modalDescription").textContent = show.description || "No description available.";
  const modalImage = $("modalImage");
  modalImage.src = show.image || posterFallback(show.title);
  modalImage.onerror = () => { modalImage.onerror = null; modalImage.src = posterFallback(show.title); };
  modalImage.alt = show.title + " poster";

  const imdb = $("modalImdbContainer");
  const imdbLink = $("modalImdbLink");
  if (show.imdblink) {
    imdbLink.href = show.imdblink;
    imdb.classList.remove("d-none");
  } else {
    imdb.classList.add("d-none");
  }

  const watchContainer = $("modalWatchNowContainer");
  const watchLink = $("modalWatchNow");
  if (show.watchLink) { watchLink.href = show.watchLink; watchContainer.classList.remove("d-none"); } else { watchLink.removeAttribute("href"); watchContainer.classList.add("d-none"); }

  const button = $("modalAddWatchlist");
  const status = $("modalWatchlistStatus");
  const saved = watchlist.some(item => Number(item.id) === Number(show.id) && (item.type || "movie") === "tv");
  button.textContent = saved ? "Remove from Watchlist" : "+ Add to Watchlist";
  status.classList.toggle("d-none", !saved);
  button.dataset.id = show.id;
  button.dataset.type = "tv";
  button.dataset.title = show.title;
  button.dataset.year = show.year;
  button.dataset.rating = show.rating;
  button.dataset.image = show.image;
  button.dataset.description = show.description || "";
  button.dataset.language = show.language;

  bootstrap.Modal.getOrCreateInstance($("detailModal")).show();
}

function setupControls() {
  $("genreSelect")?.addEventListener("change", e => {
    currentGenre = e.target.value || "all";
    renderTV();
  });

  document.querySelectorAll("#typeFilter .filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("#typeFilter .filter-btn").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      currentType = button.dataset.type || "all";
      renderTV();
    });
  });

  document.querySelectorAll("#languageFilter .language-btn").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("#languageFilter .language-btn").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      currentLanguage = button.dataset.language || "all";
      renderTV();
    });
  });

  $("searchInput")?.addEventListener("input", e => {
    currentSearch = e.target.value;
    renderTV();
  });

  $("tvSearchForm")?.addEventListener("submit", e => e.preventDefault());

  $("sortSelect")?.addEventListener("change", e => {
    currentSort = e.target.value;
    renderTV();
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("#modalAddWatchlist");
    if (!button) return;

    const id = Number(button.dataset.id);
    const index = watchlist.findIndex(item => Number(item.id) === id && (item.type || "movie") === "tv");

    if (index >= 0) {
      watchlist.splice(index, 1);
      button.textContent = "+ Add to Watchlist";
      $("modalWatchlistStatus")?.classList.add("d-none");
    } else {
      watchlist.push({
        id,
        type: "tv",
        title: button.dataset.title,
        year: Number(button.dataset.year),
        rating: Number(button.dataset.rating),
        image: button.dataset.image,
        description: button.dataset.description,
        language: button.dataset.language,
        dateAdded: Date.now()
      });
      button.textContent = "Remove from Watchlist";
      $("modalWatchlistStatus")?.classList.remove("d-none");
    }

    saveWatchlist();
  });
}

async function loadTV() {
  try {
    const [englishResponse, arabicResponse] = await Promise.all([
      fetch(TV_DATA_URL),
      fetch(ARABIC_TV_URL)
    ]);
    if (!englishResponse.ok || !arabicResponse.ok) throw new Error("TV catalog request failed");

    const [english, arabic] = await Promise.all([englishResponse.json(), arabicResponse.json()]);
    tvData = [
      ...english.map(item => normalize(item, "EN")),
      ...arabic.map(item => normalize(item, "AR"))
    ];
    localStorage.setItem("cutsceneTVCatalog", JSON.stringify(tvData));
  } catch (error) {
    console.error(error);
    tvData = JSON.parse(localStorage.getItem("cutsceneTVCatalog") || "[]").map(item => normalize(item));
  }
  renderTV();
}

document.addEventListener("DOMContentLoaded", () => {
  setupControls();
  loadTV();
});
