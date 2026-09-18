const MOVIES_DATA_URL = "../assets/data/movies.json?t=" + Date.now();
const ARABIC_MOVIES_URL = "../assets/data/arabic-movies.json?t=" + Date.now();

let moviesData = [];
let currentGenre = "all";
let currentLanguage = "all";
let currentSearch = "";
let currentSort = "default";
let watchlist = JSON.parse(localStorage.getItem("cutsceneWatchlist") || "[]");

const extraCarMovies = [
  {
    id: 301,
    title: "Need for Speed",
    year: 2014,
    language: "EN",
    genre: ["Action", "Crime", "Drama"],
    rating: "6.4",
    image: "https://image.tmdb.org/t/p/w500/kOaszlaotCGOu9BhFeeATnGkVMV.webp",
    description: "A street racer is framed for a crime he did not commit and sets out on a cross-country race for revenge.",
    imdblink: "https://www.imdb.com/title/tt2369135/"
  },
  {
    id: 302,
    title: "Fast & Furious",
    year: 2009,
    language: "EN",
    genre: ["Action", "Crime", "Thriller"],
    rating: "6.6",
    image: "https://image.tmdb.org/t/p/w500/zvjQPVttJWaCSbzMijyc2x2MLr4.webp",
    description: "The Fast & Furious crew reunites as old rivalries and a dangerous criminal investigation bring them back together.",
    imdblink: "https://www.imdb.com/title/tt1013752/"
  },
  {
    id: 303,
    title: "The Fast and the Furious: Tokyo Drift",
    year: 2006,
    language: "EN",
    genre: ["Action", "Crime", "Drama"],
    rating: "6.0",
    image: "https://pixeldemonmg.co.uk/cdn/shop/files/fandf_11.webp?v=1713214881&width=1214",
    description: "A teenager discovers drifting and becomes involved with Tokyo's underground racing scene.",
    imdblink: "https://www.imdb.com/title/tt0463985/"
  },
  {
    id: 304,
    title: "Ford v Ferrari",
    year: 2019,
    language: "EN",
    genre: ["Action", "Drama", "Adventure"],
    rating: "8.1",
    image: "https://movingstory-prod.imgix.net/mx/posters/ford-v-ferrari.webp",
    description: "Car designer Carroll Shelby and driver Ken Miles build a revolutionary race car for Ford.",
    imdblink: "https://www.imdb.com/title/tt1950186/"
  },
  {
    id: 305,
    title: "Rush",
    year: 2013,
    language: "EN",
    genre: ["Action", "Drama", "Adventure"],
    rating: "8.1",
    image: "https://m.media-amazon.com/images/M/MV5BMTZhOGQxM2ItNGQyYy00YzE5LWI5MjMtNmMzNGQzNDE1OTUzXkEyXkFqcGc%40._V1_.webp",
    description: "The intense Formula One rivalry between James Hunt and Niki Lauda during the 1970s.",
    imdblink: "https://www.imdb.com/title/tt1979320/"
  },
  {
    id: 306,
    title: "Gran Turismo",
    year: 2023,
    language: "EN",
    genre: ["Action", "Drama", "Adventure"],
    rating: "7.1",
    image: "https://images.squarespace-cdn.com/content/v1/5efce5920d28887981c5bd9b/1690038639462-I53VPPFUXFIX0HQ7C1R8/Gran%2BTurismo%2Bposter%2B2.webp",
    description: "A teenage gamer uses his racing skills to pursue a real-world career behind the wheel.",
    imdblink: "https://www.imdb.com/title/tt4495098/"
  }
];

const $ = id => document.getElementById(id);

function normalize(item, defaultLanguage = "EN") {
  return {
    ...item,
    language: item.language || defaultLanguage,
    genre: Array.isArray(item.genre) ? item.genre.map(g => String(g).toLowerCase()) : [],
    rating: Number(item.rating || 0)
  };
}

function saveWatchlist() { localStorage.setItem("cutsceneWatchlist", JSON.stringify(watchlist)); }

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]));
}

function posterFallback(title) {
  const safe = String(title).replace(/[<>&\"']/g, "");
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750"><rect width="500" height="750" fill="#20232c"/><circle cx="250" cy="280" r="74" fill="#ef233c" opacity=".9"/><path d="M230 245l70 35-70 35z" fill="white"/><text x="250" y="420" fill="white" font-size="28" text-anchor="middle" font-family="Arial">CUTSCENE</text><text x="250" y="465" fill="#a8adb8" font-size="22" text-anchor="middle" font-family="Arial">${safe}</text></svg>`);
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

function renderMovies() {
  const container = $("moviesContainer");
  const noResults = $("noResults");
  if (!container) return;
  const query = currentSearch.trim().toLowerCase();
  let items = moviesData.filter(movie => {
    const genreMatch = currentGenre === "all" || movie.genre.includes(currentGenre);
    const languageMatch = currentLanguage === "all" || movie.language === currentLanguage;
    const searchMatch = !query || movie.title.toLowerCase().includes(query);
    return genreMatch && languageMatch && searchMatch;
  });
  items = sortItems(items);
  container.innerHTML = "";
  if (!items.length) { noResults?.classList.remove("d-none"); return; }
  noResults?.classList.add("d-none");

  items.forEach((movie, index) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3 col-xl-3";
    const arabicClass = movie.language === "AR" ? "arabic-movie" : "";
    const languageText = movie.language === "AR" ? "AR · عربي" : "E · English";
    const image = escapeHtml(movie.image || posterFallback(movie.title));
    col.innerHTML = `<article class="movies-careds ${arabicClass}" data-id="${movie.id}" style="--delay:${index * 35}ms"><div class="movies-postar"><img src="${image}" alt="${escapeHtml(movie.title)} poster" loading="lazy" onerror="this.onerror=null;this.src='${posterFallback(movie.title)}';"><span class="movies-rating"><i class="fa-solid fa-star"></i> ${movie.rating.toFixed(1)}</span><span class="language-badge-card ${movie.language === "AR" ? "ar-badge" : "en-badge"}">${movie.language}</span><span class="poster-play"><i class="fa-solid fa-play"></i></span></div><h4>${escapeHtml(movie.title)}</h4><p>${movie.year} <span>•</span> ${languageText}</p></article>`;
    col.querySelector("article").addEventListener("click", () => openDetails(movie));
    container.appendChild(col);
  });
}

function openDetails(movie) {
  $("modalTitleText").textContent = movie.title;
  $("modalYear").textContent = movie.year;
  $("modalRating").textContent = movie.rating.toFixed(1) + "/10";
  $("modalDescription").textContent = movie.description || "No description available.";
  const modalImage = $("modalImage");
  modalImage.src = movie.image || posterFallback(movie.title);
  modalImage.onerror = () => { modalImage.onerror = null; modalImage.src = posterFallback(movie.title); };
  modalImage.alt = movie.title + " poster";
  const imdb = $("modalImdbContainer");
  const imdbLink = $("modalImdbLink");
  if (movie.imdblink) { imdbLink.href = movie.imdblink; imdb.classList.remove("d-none"); } else { imdb.classList.add("d-none"); }
  const button = $("modalAddWatchlist");
  const status = $("modalWatchlistStatus");
  const saved = watchlist.some(item => Number(item.id) === Number(movie.id) && (item.type || "movie") === "movie");
  button.textContent = saved ? "Remove from Watchlist" : "+ Add to Watchlist";
  status.classList.toggle("d-none", !saved);
  button.dataset.id = movie.id;
  button.dataset.type = "movie";
  button.dataset.title = movie.title;
  button.dataset.year = movie.year;
  button.dataset.rating = movie.rating;
  button.dataset.image = movie.image;
  button.dataset.description = movie.description || "";
  button.dataset.language = movie.language;
  button.dataset.genre = movie.genre.join(",");
  bootstrap.Modal.getOrCreateInstance($("detailModal")).show();
}

function setupControls() {

  // Categories
  $("genreSelect")?.addEventListener("change", e => {
    currentGenre = e.target.value || "all";
    renderMovies();
  });

  // Language
  document.querySelectorAll("#languageFilter .language-btn").forEach(button =>
    button.addEventListener("click", () => {
      document.querySelectorAll("#languageFilter .language-btn")
        .forEach(b => b.classList.remove("active"));

      button.classList.add("active");
      currentLanguage = button.dataset.language || "all";
      renderMovies();
    })
  );

  // Search
  $("searchInput")?.addEventListener("input", e => {
    currentSearch = e.target.value;
    renderMovies();
  });

  $("movieSearchForm")?.addEventListener("submit", e => e.preventDefault());

  // Sort
  $("sortSelect")?.addEventListener("change", e => {
    currentSort = e.target.value;
    renderMovies();
  });

  // Watchlist
  document.addEventListener("click", event => {
    const button = event.target.closest("#modalAddWatchlist");

    if (!button) return;

    const id = Number(button.dataset.id);

    const index = watchlist.findIndex(
      item =>
        Number(item.id) === id &&
        (item.type || "movie") === "movie"
    );

    if (index >= 0) {
      watchlist.splice(index, 1);
      button.textContent = "+ Add to Watchlist";
      $("modalWatchlistStatus")?.classList.add("d-none");
    } else {
      watchlist.push({
        id,
        type: "movie",
        title: button.dataset.title,
        year: Number(button.dataset.year),
        rating: Number(button.dataset.rating),
        image: button.dataset.image,
        description: button.dataset.description,
        language: button.dataset.language,
        genre: button.dataset.genre
          ? button.dataset.genre.split(",")
          : [],
        dateAdded: Date.now()
      });

      button.textContent = "Remove from Watchlist";
      $("modalWatchlistStatus")?.classList.remove("d-none");
    }

    saveWatchlist();
  });
}

async function loadMovies() {
  try {
    const [englishResponse, arabicResponse] = await Promise.all([fetch(MOVIES_DATA_URL), fetch(ARABIC_MOVIES_URL)]);
    if (!englishResponse.ok || !arabicResponse.ok) throw new Error("Catalog request failed");
    const [english, arabic] = await Promise.all([englishResponse.json(), arabicResponse.json()]);
    moviesData = [...english.map(item => normalize(item, "EN")), ...arabic.map(item => normalize(item, "AR")), ...extraCarMovies.map(item => normalize(item, "EN"))];
    localStorage.setItem("cutsceneMoviesCatalog", JSON.stringify(moviesData));
  } catch (error) {
    console.error(error);
    moviesData = JSON.parse(localStorage.getItem("cutsceneMoviesCatalog") || "[]").map(item => normalize(item));
  }
  renderMovies();
}

document.addEventListener("DOMContentLoaded", () => { setupControls(); loadMovies(); });
