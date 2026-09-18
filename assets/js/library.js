let watchlist = JSON.parse(localStorage.getItem("cutsceneWatchlist")) || [];
let currentSort = "date";
let currentSearch = "";
let currentType = "all";

const grid = document.getElementById("watchlistGrid");
const movieCount = document.getElementById("movieCount");
const sortSelect = document.getElementById("sortSelect");
const librarySearch = document.getElementById("librarySearch");
const librarySearchForm = document.getElementById("librarySearchForm");

function saveWatchlist() { localStorage.setItem("cutsceneWatchlist", JSON.stringify(watchlist)); }
function updateCount(count = watchlist.length) { if (movieCount) movieCount.textContent = `(${count} ${count === 1 ? "title" : "titles"})`; }

function getFilteredAndSortedMovies() {
  const query = currentSearch.trim().toLowerCase();
  let items = watchlist.filter(item => {
    const type = item.type || "movie";
    const typeMatch = currentType === "all" || type === currentType;
    const searchMatch = !query || String(item.title || "").toLowerCase().includes(query);
    return typeMatch && searchMatch;
  });
  switch (currentSort) {
    case "date": items.sort((a,b) => (b.dateAdded||0)-(a.dateAdded||0)); break;
    case "rating-desc": items.sort((a,b) => Number(b.rating||0)-Number(a.rating||0)); break;
    case "rating-asc": items.sort((a,b) => Number(a.rating||0)-Number(b.rating||0)); break;
    case "year-desc": items.sort((a,b) => Number(b.year||0)-Number(a.year||0)); break;
    case "year-asc": items.sort((a,b) => Number(a.year||0)-Number(b.year||0)); break;
    case "title-asc": items.sort((a,b) => String(a.title||"").localeCompare(String(b.title||""))); break;
    case "title-desc": items.sort((a,b) => String(b.title||"").localeCompare(String(a.title||""))); break;
  }
  return items;
}

function renderWatchlist() {
  if (!grid) return;
  grid.innerHTML = "";
  const items = getFilteredAndSortedMovies();
  updateCount(items.length);
  if (!items.length) {
    grid.innerHTML = `<div class="col-12 text-center py-5 library-empty"><h4>${currentSearch || currentType !== "all" ? "No titles found" : "Your watchlist is empty"}</h4><p>${currentSearch || currentType !== "all" ? "Try another search or filter." : "Add movies or TV shows from the Movies or TV Shows pages."}</p></div>`;
    return;
  }
  items.forEach(item => {
    const col = document.createElement("div"); col.className = "col-6 col-md-4 col-lg-4 col-xl-3";
    const type = item.type || "movie";
    const cardClass = type === "movie" ? "movies-careds" : "tv-shows-careds";
    const posterClass = type === "movie" ? "movies-postar" : "tv-shows-postar";
    const ratingClass = type === "movie" ? "movies-rating" : "tv-shows-rating";
    col.innerHTML = `<div class="${cardClass} watchlist-item" data-id="${item.id}" data-type="${type}" data-title="${escapeHtml(item.title)}" data-year="${item.year||""}" data-rating="${item.rating||""}" data-image="${escapeHtml(item.image||"")}" data-description="${escapeHtml(item.description||"")}"><div class="${posterClass}"><img src="${escapeHtml(item.image||"")}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'"><span class="${ratingClass}">${item.rating ?? "N/A"}/10</span><button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 delete-btn" data-id="${item.id}" data-type="${type}" title="Remove from watchlist" aria-label="Remove ${escapeHtml(item.title)}">×</button></div><h4>${escapeHtml(item.title)}</h4><p>${item.year||""}</p></div>`;
    grid.appendChild(col);
  });
  document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", e => { e.stopPropagation(); const id=Number(btn.dataset.id), type=btn.dataset.type; watchlist=watchlist.filter(item => !(item.id===id && (item.type||"movie")===type)); saveWatchlist(); renderWatchlist(); }));
  document.querySelectorAll(".watchlist-item").forEach(card => card.addEventListener("click", () => openDetailModalFromCard(card)));
}

function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }

function openDetailModalFromCard(card) {
  const title=card.dataset.title, id=Number(card.dataset.id), type=card.dataset.type;
  document.getElementById("modalTitleText").textContent=title;
  document.getElementById("modalYear").textContent=card.dataset.year;
  document.getElementById("modalRating").textContent=card.dataset.rating;
  document.getElementById("modalImage").src=card.dataset.image;
  document.getElementById("modalImage").alt=title;
  document.getElementById("modalDescription").textContent=card.dataset.description||"No description.";
  const imdbContainer=document.getElementById("modalImdbContainer"), imdbLink=document.getElementById("modalImdbLink");
  imdbLink.href=`https://www.imdb.com/find/?q=${encodeURIComponent(title+" "+card.dataset.year)}`;
  imdbContainer.classList.remove("d-none");
  const btn=document.getElementById("modalAddWatchlist"), status=document.getElementById("modalWatchlistStatus");
  btn.textContent="Remove from Watchlist"; status.classList.remove("d-none"); status.textContent="✓ In your watchlist"; btn.dataset.id=id; btn.dataset.type=type;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("detailModal")).show();
}

sortSelect?.addEventListener("change", function(){currentSort=this.value;renderWatchlist();});
librarySearch?.addEventListener("input", function(){currentSearch=this.value;renderWatchlist();});
librarySearchForm?.addEventListener("submit", e=>e.preventDefault());
document.querySelectorAll("#libraryTypeFilter .filter-btn").forEach(btn=>btn.addEventListener("click",function(){document.querySelectorAll("#libraryTypeFilter .filter-btn").forEach(b=>b.classList.remove("active"));this.classList.add("active");currentType=this.dataset.type||"all";renderWatchlist();}));

document.addEventListener("click", function(e){
  const btn=e.target.closest("#modalAddWatchlist");
  if(!btn)return;
  const id=Number(btn.dataset.id), type=btn.dataset.type||"movie";
  const index=watchlist.findIndex(item=>item.id===id&&(item.type||"movie")===type);
  if(index!==-1){watchlist.splice(index,1);saveWatchlist();renderWatchlist();btn.textContent="+ Add to Watchlist";document.getElementById("modalWatchlistStatus").classList.add("d-none");}
});

document.addEventListener("DOMContentLoaded", renderWatchlist);
