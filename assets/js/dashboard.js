document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 dashboard.js loaded");

  fetchDataAndSeed()
    .then(() => {
      const movies = JSON.parse(localStorage.getItem("movies")) || [];
      const tvShows = JSON.parse(localStorage.getItem("tvShows")) || [];
      console.log(
        `📽️ Movies: ${movies.length}, 📺 TV Shows: ${tvShows.length}`,
      );
      renderCards("moviesContainer", movies, "movie");
      renderCards("tvShowsContainer", tvShows, "tv");
    })
    .catch((err) => {
      console.error("❌ Initialisation error:", err);
      // Fallback: render from hardcoded data
      renderCards("moviesContainer", [], "movie");
      renderCards("tvShowsContainer", [], "tv");
    });

  // ─── MODAL LOGIC ───
  const modalElement = document.getElementById("detailModal");
  const modal = new bootstrap.Modal(modalElement);

  function findItemByTitle(title) {
    const movies = JSON.parse(localStorage.getItem("movies")) || [];
    const tvShows = JSON.parse(localStorage.getItem("tvShows")) || [];
    return [...movies, ...tvShows].find((item) => item.title === title);
  }

  document.addEventListener("click", function (e) {
    const card = e.target.closest(".movies-careds, .tv-shows-careds");
    if (!card) return;

    const title = card.querySelector("h4").textContent.trim();
    const year = card.querySelector("p").textContent.trim();
    const rating = card
      .querySelector(".movies-rating, .tv-shows-rating")
      .textContent.trim();
    const image = card.querySelector("img").src;
    const item = findItemByTitle(title);
    const description = item ? item.description : "No description available.";

    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalYear").textContent = year;
    document.getElementById("modalRating").textContent = rating;
    document.getElementById("modalImage").src = image;
    document.getElementById("modalDescription").textContent = description;

    modal.show();
  });
});

// ─── FETCH & SEED ───
async function fetchDataAndSeed() {
  try {
    console.log("📡 Fetching JSON files...");
    // Add cache-busting query param to bypass browser cache
    const moviesRes = await fetch("../assets/data/movies.json?" + Date.now());
    const tvRes = await fetch("../assets/data/tv-shows.json?" + Date.now());

    if (!moviesRes.ok || !tvRes.ok) {
      throw new Error(
        `HTTP error: Movies ${moviesRes.status}, TV ${tvRes.status}`,
      );
    }

    const moviesData = await moviesRes.json();
    const tvData = await tvRes.json();

    localStorage.setItem("movies", JSON.stringify(moviesData));
    localStorage.setItem("tvShows", JSON.stringify(tvData));

    console.log("✅ Data seeded from JSON files.");
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    console.log("🔄 Using fallback data.");
    localStorage.setItem("movies", JSON.stringify([]));
    localStorage.setItem("tvShows", JSON.stringify([]));
  }
}

// ─── RENDER CARDS ───
function renderCards(containerId, items, type) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`⚠️ Container #${containerId} not found.`);
    return;
  }
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="text-muted">No ${type}s available.</p>`;
    return;
  }

  items.forEach((item) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-4 col-xl-3";

    const cardClass = type === "movie" ? "movies-careds" : "tv-shows-careds";
    const posterClass = type === "movie" ? "movies-postar" : "tv-shows-postar";
    const ratingClass = type === "movie" ? "movies-rating" : "tv-shows-rating";

    col.innerHTML = `
      <div class="${cardClass}" data-id="${item.id}">
        <div class="${posterClass}">
          <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'" />
          <span class="${ratingClass}">${item.rating}/10</span>
        </div>
        <h4>${item.title}</h4>
        <p>${item.year}</p>
      </div>
    `;
    container.appendChild(col);
  });
  console.log(`✅ Rendered ${items.length} ${type} cards in #${containerId}`);
}
