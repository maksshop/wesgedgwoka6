/* ==========================================================================
   РЕСТОРАНТ МАКС — SHARED SITE SCRIPT
   Classic (non-module) script so the site also works when index.html is
   opened directly from disk via file:// — browsers block ES module fetches
   on that origin.
   ========================================================================== */
(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------------- utils */

    function debounce(fn, wait) {
        var timeout;
        return function () {
            var args = arguments, ctx = this;
            clearTimeout(timeout);
            timeout = setTimeout(function () { fn.apply(ctx, args); }, wait || 150);
        };
    }

    /* --------------------------------------------------------------- loader */

    function initLoader() {
        var loader = document.getElementById('loader');
        if (!loader) return;

        var done = false;
        function hide() {
            if (done) return;
            done = true;
            loader.classList.add('is-hidden');
        }

        window.addEventListener('load', function () { setTimeout(hide, 350); });
        // Safety net: never trap the page behind the loader if a resource stalls
        setTimeout(hide, 4000);
    }

    /* ------------------------------------------------------------ navigation */

    function initNav() {
        var nav = document.getElementById('siteNav');
        var burger = document.getElementById('navBurger');
        var links = document.getElementById('navLinks');
        if (!nav) return;

        // The transparent, light-on-dark treatment only makes sense while the
        // bar sits over the hero image. Pages without a hero (the menu) keep
        // the solid variant at every scroll position.
        var hasHero = !!document.getElementById('hero');
        var cue = document.getElementById('heroCue');

        var onScroll = function () {
            if (!hasHero) {
                nav.classList.add('is-scrolled');
                return;
            }
            nav.classList.toggle('is-scrolled', window.scrollY > 60);
            // Rides the existing listener rather than adding another
            if (cue) cue.classList.toggle('is-hidden', window.scrollY > 40);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        if (!burger || !links) return;

        function setMenu(open) {
            burger.setAttribute('aria-expanded', String(open));
            links.classList.toggle('is-open', open);
            document.body.classList.toggle('no-scroll', open);
            // While the overlay is open the bar always needs its solid treatment
            if (open) nav.classList.add('is-scrolled'); else onScroll();
        }

        burger.addEventListener('click', function () {
            setMenu(burger.getAttribute('aria-expanded') !== 'true');
        });

        links.addEventListener('click', function (e) {
            if (e.target.closest('a')) setMenu(false);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
                setMenu(false);
                burger.focus();
            }
        });

        // Reset the mobile overlay if the viewport grows past the breakpoint
        window.addEventListener('resize', debounce(function () {
            if (window.innerWidth > 960 && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
        }, 200));
    }

    /* -------------------------------------------------------- active section */

    function initScrollSpy() {
        var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
        var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link[href^="#"]'));
        if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.id;
                links.forEach(function (link) {
                    var match = link.getAttribute('href') === '#' + id;
                    if (match) link.setAttribute('aria-current', 'true');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (section) { observer.observe(section); });
    }

    /* ---------------------------------------------------------- hero slider */

    function initHeroSlider() {
        var stage = document.getElementById('heroStage');
        var dotsWrap = document.getElementById('heroDots');
        if (!stage) return;

        var slides = Array.prototype.slice.call(stage.querySelectorAll('.hero-slide'));
        if (slides.length < 2) return;

        var current = 0;
        var timer = null;
        var INTERVAL = 6000;

        // Slides 2+ carry their image in data-bg so they don't compete with the
        // LCP frame during first paint.
        function loadSlide(slide) {
            if (slide && slide.dataset.bg) {
                slide.style.backgroundImage = "url('" + slide.dataset.bg + "')";
                delete slide.dataset.bg;
            }
        }
        window.addEventListener('load', function () { slides.forEach(loadSlide); });

        var dots = [];
        if (dotsWrap) {
            slides.forEach(function (_, i) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'hero-dot';
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                dot.setAttribute('aria-label', 'Изображение ' + (i + 1));
                dot.addEventListener('click', function () { go(i); restart(); });
                dotsWrap.appendChild(dot);
                dots.push(dot);
            });
        }

        function go(n) {
            slides[current].classList.remove('is-active');
            if (dots[current]) dots[current].setAttribute('aria-selected', 'false');

            current = (n + slides.length) % slides.length;

            loadSlide(slides[current]);
            slides[current].classList.add('is-active');
            if (dots[current]) dots[current].setAttribute('aria-selected', 'true');
        }

        function next() { go(current + 1); }

        function start() {
            if (prefersReducedMotion || timer !== null) return;
            timer = setInterval(next, INTERVAL);
        }

        function stop() {
            if (timer !== null) { clearInterval(timer); timer = null; }
        }

        function restart() { stop(); start(); }

        // Don't animate off-screen or in a background tab
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stop(); else start();
        });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !document.hidden) start(); else stop();
                });
            }, { threshold: 0 }).observe(stage);
        } else {
            start();
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { go(current - 1); restart(); }
            if (e.key === 'ArrowRight') { next(); restart(); }
        });
    }

    /* ----------------------------------------------------------- reveal (JS) */

    function initRevealFallback() {
        // Engines with scroll-driven animations handle .reveal purely in CSS.
        if (!document.documentElement.classList.contains('no-sda')) return;
        if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

        var items = document.querySelectorAll('.reveal');
        if (!items.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

        Array.prototype.forEach.call(items, function (item) { observer.observe(item); });
    }

    /* ------------------------------------------------------------- to-top */

    function initToTop() {
        var btn = document.getElementById('toTop');
        if (!btn) return;

        window.addEventListener('scroll', function () {
            btn.classList.toggle('is-visible', window.scrollY > 600);
        }, { passive: true });

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    /* -------------------------------------------------------- theme toggle */

    function initTheme() {
        var toggle = document.getElementById('themeToggle');
        if (!toggle) return;

        toggle.addEventListener('click', function () {
            var root = document.documentElement;
            var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            var currentlyDark = root.dataset.theme
                ? root.dataset.theme === 'dark'
                : systemDark;
            var nextTheme = currentlyDark ? 'light' : 'dark';

            root.dataset.theme = nextTheme;
            try { localStorage.setItem('maks-theme', nextTheme); } catch (e) { /* private mode */ }
        });
    }

    /* ----------------------------------------------------------------- misc */

    function initYear() {
        var el = document.getElementById('year');
        if (el) el.textContent = new Date().getFullYear();
    }

    /* ------------------------------------------------------------------ run */

    function init() {
        initLoader();
        initNav();
        initScrollSpy();
        initHeroSlider();
        initRevealFallback();
        initToTop();
        initTheme();
        initYear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
