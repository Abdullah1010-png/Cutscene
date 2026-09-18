let tvData = [];
let currentFilter = "all";
let currentSearch = "";
let currentSort = "default";

function loadTV() {
  fetch("../assets/data/tv-shows.json?t=" + Date.now())
    .then(res => { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
    .then(data => {
      tvData = data.map(item => ({
        ...item,
        genre: Array.isArray(item.genre) ? item.genre.map(g => String(g).toLowerCase()) : typeof item.genre === "string" ? [item.genre.toLowerCase()] : []
      }));
      localStorage.setItem("tvShows", JSON.stringify(tvData));
      renderTV();
    })
    .catch(err => {
      console.error("Failed to fetch tv-shows.json:", err);
      try {
        tvData = JSON.parse(localStorage.getItem("tvShows") || "[]");
        renderTV();
      } catch (e) {
        const container = document.getElementById("tvContainer") || document.getElementById("tvShowsContainer");
        if (container) container.innerHTML = `<p class="text-danger text-center py-4">Could not load TV shows data.</p>`;
      }
    });
}

function sortItems(items) {
  const sorted = [...items];
  switch (currentSort) {
    case "rating-desc": sorted.sort((a,b) => Number(b.rating||0)-Number(a.rating||0)); break;
    case "rating-asc": sorted.sort((a,b) => Number(a.rating||0)-Number(b.rating||0)); break;
    case "year-desc": sorted.sort((a,b) => Number(b.year||0)-Number(a.year||0)); break;
    case "year-asc": sorted.sort((a,b) => Number(a.year||0)-Number(b.year||0)); break;
    case "title-asc": sorted.sort((a,b) => String(a.title).localeCompare(String(b.title))); break;
    case "title-desc": sorted.sort((a,b) => String(b.title).localeCompare(String(a.title))); break;
  }
  return sorted;
}

function renderTV() {
  const container = document.getElementById("tvContainer") || document.getElementById("tvShowsContainer");
  const noResults = document.getElementById("noResults");
  if (!container) return;
  const searchTerm = currentSearch.toLowerCase().trim();
  let filtered = tvData.filter(item => {
    const genreMatch = currentFilter === "all" || item.genre.includes(currentFilter.toLowerCase());
    const searchMatch = !searchTerm || String(item.title).toLowerCase().includes(searchTerm);
    return genreMatch && searchMatch;
  });
  filtered = sortItems(filtered);
  container.innerHTML = "";
  if (!filtered.length) { noResults?.classList.remove("d-none"); return; }
  noResults?.classList.add("d-none");

  filtered.forEach(item => {
    const col = document.createElement("div"); col.className = "col-6 col-md-4 col-lg-4 col-xl-3";
    col.innerHTML = `<div class="tv-shows-careds" data-id="${item.id}" data-title="${escapeAttribute(item.title)}" data-year="${item.year}" data-rating="${item.rating}" data-image="${escapeAttribute(item.image)}" data-description="${escapeAttribute(item.description || "No description.")}" data-type="tv" data-imdblink="${escapeAttribute(item.imdblink || "")}"><div class="tv-shows-postar"><img src="${escapeAttribute(item.image)}" alt="${escapeAttribute(item.title)}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'"/><span class="tv-shows-rating">${item.rating}/10</span></div><h4>${escapeHtml(item.title)}</h4><p>${item.year}</p></div>`;
    container.appendChild(col);
  });
}

function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
function escapeAttribute(value) { return escapeHtml(value); }

function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => btn.addEventListener("click", function(){
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    this.classList.add("active"); currentFilter = this.dataset.filter || "all"; renderTV();
  }));
  document.getElementById("searchInput")?.addEventListener("input", function(){ currentSearch=this.value; renderTV(); });
  document.getElementById("tvSearchForm")?.addEventListener("submit", e=>e.preventDefault());
  document.getElementById("sortSelect")?.addEventListener("change", function(){ currentSort=this.value; renderTV(); });
}

let watchlist = JSON.parse(localStorage.getItem("cutsceneWatchlist")) || [];
function saveWatchlist(){ localStorage.setItem("cutsceneWatchlist", JSON.stringify(watchlist)); }
function isInWatchlist(id,type="tv"){ return watchlist.some(item=>item.id===id && (item.type||"tv")===type); }

function openDetailModal(card){
  const id=Number(card.dataset.id), title=card.dataset.title, type=card.dataset.type||"tv";
  document.getElementById("modalTitle").textContent="Details";
  document.getElementById("modalTitleText").textContent=title;
  document.getElementById("modalYear").textContent=card.dataset.year;
  document.getElementById("modalRating").textContent=card.dataset.rating;
  document.getElementById("modalImage").src=card.dataset.image;
  document.getElementById("modalDescription").textContent=card.dataset.description;
  const imdbContainer=document.getElementById("modalImdbContainer"), imdbLink=document.getElementById("modalImdbLink");
  if(card.dataset.imdblink){imdbLink.href=card.dataset.imdblink; imdbContainer.classList.remove("d-none");} else imdbContainer.classList.add("d-none");
  const btn=document.getElementById("modalAddWatchlist"), status=document.getElementById("modalWatchlistStatus"), saved=isInWatchlist(id,type);
  btn.textContent=saved?"Remove from Watchlist":"+ Add to Watchlist"; status.classList.toggle("d-none",!saved);
  btn.dataset.id=id; btn.dataset.title=title; btn.dataset.year=card.dataset.year; btn.dataset.rating=card.dataset.rating; btn.dataset.image=card.dataset.image; btn.dataset.description=card.dataset.description; btn.dataset.type=type;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("detailModal")).show();
}

document.addEventListener("click",function(e){
  const btn=e.target.closest("#modalAddWatchlist");
  if(btn){const id=Number(btn.dataset.id),type=btn.dataset.type||"tv",index=watchlist.findIndex(item=>item.id===id&&(item.type||"tv")===type); if(index>=0){watchlist.splice(index,1);btn.textContent="+ Add to Watchlist";document.getElementById("modalWatchlistStatus").classList.add("d-none");}else{watchlist.push({id,title:btn.dataset.title,year:btn.dataset.year,rating:btn.dataset.rating,image:btn.dataset.image,description:btn.dataset.description,type,dateAdded:Date.now()});btn.textContent="Remove from Watchlist";document.getElementById("modalWatchlistStatus").classList.remove("d-none");}saveWatchlist();return;}
  const card=e.target.closest(".tv-shows-careds"); if(card) openDetailModal(card);
});

document.addEventListener("DOMContentLoaded",()=>{loadTV();setupFilters();});
