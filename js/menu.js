/* ==========================================================================
   РЕСТОРАНТ МАКС — MENU PAGE SCRIPT
   Category filtering. Shared behaviour (theme, nav, back-to-top, year) lives
   in js/app.js. Classic script so the page also works over file://.
   ========================================================================== */
(function () {
    'use strict';

    var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
    var sections = Array.prototype.slice.call(document.querySelectorAll('.menu-section'));
    var empty = document.getElementById('menuEmpty');

    if (!tabs.length || !sections.length) return;

    function applyFilter(category) {
        var shown = 0;

        sections.forEach(function (section) {
            var match = category === 'all' || section.dataset.category === category;
            section.hidden = !match;
            if (match) shown++;
        });

        tabs.forEach(function (tab) {
            tab.setAttribute('aria-pressed', String(tab.dataset.category === category));
        });

        if (empty) empty.hidden = shown > 0;
    }

    function selectCategory(category, scroll) {
        applyFilter(category);

        // Keep the URL shareable without adding a history entry per click
        var hash = category === 'all' ? ' ' : '#cat-' + category;
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', category === 'all' ? window.location.pathname : hash);
        }

        if (!scroll) return;

        var target = category === 'all'
            ? document.querySelector('.menu-main')
            : document.getElementById('cat-' + category);
        if (!target) return;

        // scroll-padding-top on <html> keeps the heading clear of the fixed nav
        // and the sticky tab bar — more reliable than measuring the bar, whose
        // position changes as it sticks.
        target.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
        });
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            selectCategory(tab.dataset.category, true);
            // Bring the freshly activated tab fully into view on narrow screens
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });

    // Honour a deep link such as menu.html#cat-pizza on first load
    var initial = (window.location.hash || '').replace('#cat-', '');
    if (initial && tabs.some(function (t) { return t.dataset.category === initial; })) {
        applyFilter(initial);
    } else {
        applyFilter('all');
    }
})();
