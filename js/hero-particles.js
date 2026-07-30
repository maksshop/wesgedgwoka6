// ==========================================
// HERO PARTICLES (decorative three.js background)
// ==========================================
// Purely visual enhancement for the hero section: warm, slowly rising
// embers that drift with a gentle mouse-parallax. Plain classic script
// (not type="module") loaded after js/vendor/three.min.js (a UMD build
// exposing window.THREE) so it also works when the page is opened
// directly via file:// — browsers block ES module fetches under that
// origin. Runs after window 'load' so it never competes with critical
// resources (hero photo, fonts, CSS) for bandwidth, and is skipped
// entirely when the user prefers reduced motion or the hero isn't on
// screen.

function debounce(func, wait = 150) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function initHeroParticles() {
    const container = document.getElementById('heroParticles');
    const hero = document.getElementById('hero');
    if (!container || !hero) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof THREE === 'undefined') return; // three.min.js failed to load: skip decoration

    const isSmallScreen = window.innerWidth < 768;
    const PARTICLE_COUNT = isSmallScreen ? 100 : 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Soft circular glow sprite (drawn on a canvas) used as the point texture,
    // so particles read as warm embers rather than hard squares.
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const ctx = spriteCanvas.getContext('2d');
    // Warm ember core fading through the brand clay tone — matches --clay-500
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 232, 199, 1)');
    gradient.addColorStop(0.35, 'rgba(220, 193, 136, 0.85)');
    gradient.addColorStop(0.7, 'rgba(184, 73, 47, 0.45)');
    gradient.addColorStop(1, 'rgba(184, 73, 47, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const spriteTexture = new THREE.CanvasTexture(spriteCanvas);

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const drifts = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        speeds[i] = 0.01 + Math.random() * 0.03;
        drifts[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.6,
        map: spriteTexture,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let mouseX = 0;
    let mouseY = 0;
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    });

    const startTime = performance.now();
    let animationId = null;

    function renderFrame() {
        const elapsed = (performance.now() - startTime) / 1000;
        const posAttr = geometry.attributes.position;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            let y = posAttr.array[i * 3 + 1] + speeds[i];
            if (y > 12) y = -12;
            posAttr.array[i * 3 + 1] = y;
            posAttr.array[i * 3] += Math.sin(elapsed + drifts[i]) * 0.003;
        }
        posAttr.needsUpdate = true;

        camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        animationId = requestAnimationFrame(renderFrame);
    }

    function startAnimation() {
        if (animationId === null) {
            animationId = requestAnimationFrame(renderFrame);
        }
    }

    function stopAnimation() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // Pause rendering when the hero scrolls out of view or the tab is
    // hidden, so this purely decorative effect never burns battery
    // in the background.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !document.hidden) {
                startAnimation();
            } else {
                stopAnimation();
            }
        });
    }, { threshold: 0 });
    observer.observe(hero);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAnimation();
        } else {
            const rect = hero.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) startAnimation();
        }
    });

    window.addEventListener('resize', debounce(() => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }, 200));

    startAnimation();
    container.classList.add('is-ready');
}

if (document.readyState === 'complete') {
    initHeroParticles();
} else {
    window.addEventListener('load', initHeroParticles);
}
