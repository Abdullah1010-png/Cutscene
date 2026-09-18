const defaultMovies = [
    {
        id: 1,
        title: "Interstellar",
        year: 2014,
        rating: 8.7,
        dateAdded: 4,
        image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.webp"
    },
    {
        id: 2,
        title: "Spider-Man: Brand New Day",
        year: 2026,
        rating: 8.8,
        dateAdded: 3,
        image: "https://image.tmdb.org/t/p/w500/9JCQtDCSpPR2ld55yNlEg1VwcQo.webp"
    },
    {
        id: 3,
        title: "Need for Speed",
        year: 2014,
        rating: 6.4,
        dateAdded: 2,
        image: "https://image.tmdb.org/t/p/w500/kOaszlaotCGOu9BhFeeATnGkVMV.webp"
    },
    {
        id: 4,
        title: "Fast & Furious",
        year: 2009,
        rating: 6.7,
        dateAdded: 1,
        image: "https://image.tmdb.org/t/p/w500/zvjQPVttJWaCSbzMijyc2x2MLr4.webp"
    },
    {
        id: 5,
        title: "The Odyssey",
        year: 2026,
        rating: 9.0,
        dateAdded: 5,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5cIP_BAlZIhKVvozD9DDzrW60_vxt8DsRz-hSLWN74N3BT46rwY2kNzw&s=10"
    }
];

const grid = document.getElementById("watchlistGrid");
const movieCount = document.getElementById("movieCount");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const movieModal = document.getElementById("movieModal");
const detailsModal = document.getElementById("detailsModal");
const movieForm = document.getElementById("movieForm");
const addMovieBtn = document.getElementById("addMovieBtn");
const closeModal = document.getElementById("closeModal");
const closeDetails = document.getElementById("closeDetails");

let watchlist;
const savedMovies = localStorage.getItem("cutsceneWatchlist");

try {
    watchlist = savedMovies ? JSON.parse(savedMovies) : defaultMovies;
} catch (error) {
    watchlist = defaultMovies;
}

if (!savedMovies) {
    saveWatchlist();
}

function saveWatchlist() {
    localStorage.setItem("cutsceneWatchlist", JSON.stringify(watchlist));
}

function updateCount() {
    const count = watchlist.length;
    movieCount.textContent = `(${count} ${count === 1 ? "title" : "titles"})`;
}

function getSortedMovies() {
    const movies = [...watchlist];
    const type = sortSelect.value;

    if (type === "date") {
        movies.sort((a, b) => b.dateAdded - a.dateAdded);
    } else if (type === "rating") {
        movies.sort((a, b) => b.rating - a.rating);
    } else if (type === "title") {
        movies.sort((a, b) => a.title.localeCompare(b.title));
    } else if (type === "year") {
        movies.sort((a, b) => b.year - a.year);
    }

    return movies;
}

function displayMovies() {
    const query = searchInput.value.trim().toLowerCase();

    const movies = getSortedMovies().filter(movie =>
        movie.title.toLowerCase().includes(query)
    );

    grid.innerHTML = "";

    if (movies.length === 0) {
        grid.innerHTML = `
            <div class="empty-watchlist">
                <h2>No movies found</h2>
                <p>Try another title or add a new movie.</p>
            </div>
        `;
        updateCount();
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement("article");
        card.className = "movie-card";

        card.innerHTML = `
            <div class="poster-container">
                <img src="${movie.image}" alt="${movie.title}" loading="lazy">
                <div class="rating">⭐ ${movie.rating}</div>
                <button class="delete-btn" title="Remove movie">×</button>
            </div>
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-year">${movie.year}</p>
        `;

        card.addEventListener("click", event => {
            if (!event.target.classList.contains("delete-btn")) {
                showDetails(movie);
            }
        });

        card.querySelector(".delete-btn").addEventListener("click", event => {
            event.stopPropagation();
            watchlist = watchlist.filter(item => item.id !== movie.id);
            saveWatchlist();
            displayMovies();
        });

        grid.appendChild(card);
    });

    updateCount();
}

addMovieBtn.addEventListener("click", () => {
    movieModal.classList.add("show");
});

closeModal.addEventListener("click", () => {
    movieModal.classList.remove("show");
});

movieForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("movieTitle").value.trim();
    const year = Number(document.getElementById("movieYear").value);
    const rating = Number(document.getElementById("movieRating").value);
    const image = document.getElementById("movieImage").value.trim();

    const newMovie = {
        id: Date.now(),
        title,
        year,
        rating,
        dateAdded: Date.now(),
        image
    };

    watchlist.push(newMovie);
    saveWatchlist();
    displayMovies();

    movieForm.reset();
    movieModal.classList.remove("show");
});

function showDetails(movie) {
    document.getElementById("detailsImage").src = movie.image;
    document.getElementById("detailsImage").alt = movie.title;
    document.getElementById("detailsTitle").textContent = movie.title;
    document.getElementById("detailsMeta").textContent = `${movie.year} • ⭐ ${movie.rating}`;
    detailsModal.classList.add("show");
}

closeDetails.addEventListener("click", () => {
    detailsModal.classList.remove("show");
});

searchInput.addEventListener("input", displayMovies);
sortSelect.addEventListener("change", displayMovies);

function setTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light");
        themeToggle.textContent = "🌙";
    } else {
        document.body.classList.remove("light");
        themeToggle.textContent = "☀️";
    }
}

const savedTheme = localStorage.getItem("cutsceneTheme") || "dark";
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("light") ? "dark" : "light";
    localStorage.setItem("cutsceneTheme", newTheme);
    setTheme(newTheme);
});

menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
});

window.addEventListener("click", event => {
    if (event.target === movieModal) {
        movieModal.classList.remove("show");
    }

    if (event.target === detailsModal) {
        detailsModal.classList.remove("show");
    }
});

displayMovies();
