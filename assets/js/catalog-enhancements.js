/* Cutscene catalog expansion + direct title navigation */
(function () {
  const carMovies = [
    [1001,"The Fast and the Furious",2001,6.8,"https://www.imdb.com/title/tt0232500/"],
    [1002,"2 Fast 2 Furious",2003,5.9,"https://www.imdb.com/title/tt0322259/"],
    [1003,"The Fast and the Furious: Tokyo Drift",2006,6.1,"https://www.imdb.com/title/tt0463985/"],
    [1004,"Fast & Furious",2009,6.5,"https://www.imdb.com/title/tt1013752/"],
    [1005,"Fast Five",2011,7.3,"https://www.imdb.com/title/tt1596343/"],
    [1006,"Fast & Furious 6",2013,7.0,"https://www.imdb.com/title/tt1905041/"],
    [1007,"Furious 7",2015,7.1,"https://www.imdb.com/title/tt2820852/"],
    [1008,"The Fate of the Furious",2017,6.6,"https://www.imdb.com/title/tt4630562/"],
    [1009,"F9: The Fast Saga",2021,5.2,"https://www.imdb.com/title/tt5433138/"],
    [1010,"Need for Speed",2014,6.4,"https://www.imdb.com/title/tt2369135/"],
    [1011,"Ford v Ferrari",2019,8.1,"https://www.imdb.com/title/tt1950186/"],
    [1012,"Rush",2013,8.1,"https://www.imdb.com/title/tt1979320/"],
    [1013,"Gran Turismo",2023,7.1,"https://www.imdb.com/title/tt4495098/"]
  ].map(([id,title,year,rating,imdblink]) => ({id,title,year,rating:String(rating),imdblink,genre:["car action","action","motorsport"],language:"EN",image:poster(title,year,"CAR ACTION"),description:`${title} — car action, racing and motorsport.`}));

  const arabicMoviesExtra = [
    [1101,"هيبتا: المحاضرة الأخيرة","Hepta: The Last Lecture",2016,7.6,"https://www.imdb.com/title/tt4663992/"],
    [1102,"ولاد رزق","Welad Rizk",2015,7.0,"https://www.imdb.com/title/tt4708484/"],
    [1103,"ولاد رزق 2","Sons of Rizk 2",2019,7.1,"https://www.imdb.com/title/tt10787478/"],
    [1104,"الجزيرة","El Gezira",2007,7.5,"https://www.imdb.com/title/tt1170341/"],
    [1105,"عمارة يعقوبيان","The Yacoubian Building",2006,7.4,"https://www.imdb.com/title/tt0428731/"]
  ].map(([id,title,titleEn,year,rating,imdblink]) => ({id,title,titleEn,year,rating:String(rating),imdblink,genre:["drama","arabic"],language:"AR",image:poster(title,year,"AR • عربي"),description:`فيلم عربي: ${title}`,descriptionEn:titleEn}));

  const arabicShows = [
    [2001,"Paranormal","ما وراء الطبيعة",2020,7.9,"https://www.imdb.com/title/tt12411074/",["drama","horror","mystery","thriller"]],
    [2002,"Grand Hotel","جراند أوتيل",2015,8.2,"https://www.imdb.com/title/tt5857914/",["drama","crime","mystery","thriller"]],
    [2003,"El Nos","الناس",2025,7.4,"https://www.imdb.com/title/tt39970797/",["comedy","crime","drama","history"]],
    [2004,"Al Maddah","المداح",2021,7.0,"https://www.imdb.com/title/tt15685516/",["drama","horror","mystery"]]
  ].map(([id,title,titleAr,year,rating,imdblink,genre]) => ({id,title,titleAr,year,rating:String(rating),imdblink,genre,language:"AR",image:poster(title,year,"AR • عربي"),description:`مسلسل عربي: ${titleAr}`,descriptionEn:title}));

  function poster(title, year, label) {
    const safe = String(title).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const rtl = /[\u0600-\u06FF]/.test(title);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#171a20"/><stop offset="1" stop-color="#30284f"/></linearGradient></defs><rect width="600" height="900" fill="url(#g)"/><rect x="24" y="24" width="552" height="852" rx="24" fill="none" stroke="#8066ff" stroke-width="4"/><text x="300" y="115" text-anchor="middle" fill="#8066ff" font-size="30" font-family="Arial" font-weight="700">CUTSCENE</text><text x="300" y="430" text-anchor="middle" ${rtl?'direction="rtl"':''} fill="white" font-size="48" font-family="Arial" font-weight="700">${safe}</text><text x="300" y="500" text-anchor="middle" fill="#b9b5c9" font-size="26" font-family="Arial">${year}</text><text x="300" y="785" text-anchor="middle" fill="#ed5b69" font-size="28" font-family="Arial" font-weight="700">${label}</text></svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  function addMovieExtras() {
    if (typeof moviesData === "undefined" || !Array.isArray(moviesData)) return false;
    const ids = new Set(moviesData.map(m => Number(m.id)));
    const extras = [...carMovies, ...arabicMoviesExtra].filter(m => !ids.has(Number(m.id)));
    if (extras.length) moviesData.push(...extras);
    if (typeof renderMovies === "function") renderMovies();
    return true;
  }

  function addTVExtras() {
    if (typeof tvData === "undefined" || !Array.isArray(tvData)) return false;
    const ids = new Set(tvData.map(m => Number(m.id)));
    const extras = arabicShows.filter(m => !ids.has(Number(m.id)));
    if (extras.length) tvData.push(...extras);
    if (typeof renderTV === "function") renderTV();
    return true;
  }

  function directNavigation(e) {
    const card = e.target.closest(".movies-careds, .tv-shows-careds");
    if (!card) return;
    const url = card.dataset.imdblink;
    if (url) window.location.href = url;
  }

  document.addEventListener("click", directNavigation, true);

  let tries = 0;
  const timer = setInterval(() => {
    const movieReady = addMovieExtras();
    const tvReady = addTVExtras();
    if ((movieReady || tvReady) || ++tries > 50) clearInterval(timer);
  }, 150);
})();
