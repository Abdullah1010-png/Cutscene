// ==========================================
// Trending Slider
// Scrolls the trending track left/right using the prev/next buttons.
// The track itself is a normal scrollable flex row, so touch swipe
// on mobile keeps working with no extra code.
// ==========================================
(function () {
    const track = document.getElementById('trendingTrack');
    const prevBtn = document.getElementById('trendPrevBtn');
    const nextBtn = document.getElementById('trendNextBtn');

    if (!track || !prevBtn || !nextBtn) return;

    function scrollByCards(direction) {
        const card = track.querySelector('.trending-card');
        if (!card) return;

        const cardWidth = card.getBoundingClientRect().width;
        const trackGap = parseFloat(getComputedStyle(track).columnGap) || 18;
        const scrollAmount = (cardWidth + trackGap) * 2; // move two cards at a time

        track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }

    prevBtn.addEventListener('click', function () {
        scrollByCards(-1);
    });

    nextBtn.addEventListener('click', function () {
        scrollByCards(1);
    });
})();







// ==========================================
// Navbar Scroll Effect
// Adds a background/shadow to the navbar once the page scrolls
// past the top, so it stays readable over any section.
// ==========================================
(function () {
    const navbar = document.querySelector('.custom-navbar');
    if (!navbar) return;

    function updateNavbarState() {
        navbar.classList.toggle('navbar-scrolled', window.scrollY > 10);
    }

    window.addEventListener('scroll', updateNavbarState, { passive: true });
    updateNavbarState();
})();
