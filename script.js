document.addEventListener('DOMContentLoaded', () => {

// --- Dynamic Banner Offset (prevent banner hiding under fixed navbar) ---
const navbar = document.getElementById('navbar');
function applyNavbarOffset() {
    if (!navbar) return;
    // offsetHeight includes the mobile search row too.
    const h = navbar.offsetHeight || 0;
    document.documentElement.style.setProperty('--navbar-offset', `${h}px`);
}
applyNavbarOffset();
window.addEventListener('resize', applyNavbarOffset);

// Extra safety: font load / layout shifts
if ('ResizeObserver' in window && navbar) {
    const ro = new ResizeObserver(() => applyNavbarOffset());
    ro.observe(navbar);
}

// --- Navbar Blur Effect on Scroll ---
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('shadow-sm');
            navbar.classList.replace('bg-[#FEF7FF]/80', 'bg-[#FEF7FF]/95');
        } else {
            navbar.classList.remove('shadow-sm');
            navbar.classList.replace('bg-[#FEF7FF]/95', 'bg-[#FEF7FF]/80');
        }
    }, { passive: true });
}

// --- Add to Cart Interaction (Toast) ---
const toast = document.getElementById('toast');
let toastTimeout;

document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn && btn.querySelector('.material-icon') && btn.querySelector('.material-icon').textContent === 'add') {
        e.stopPropagation();

        if (toast) {
            toast.classList.remove('translate-y-20', 'opacity-0');
            if (toastTimeout) clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        }
    }
});

// --- Header icon active-state toggle (requested: click changes color, no shake) ---
document.addEventListener('click', (e) => {
    const iconBtn = e.target.closest('.nav-icon-btn');
    if (!iconBtn) return;

    // do not interfere with add-to-cart buttons
    const icon = iconBtn.querySelector('.material-icon');
    if (icon && icon.textContent.trim() === 'add') return;

    iconBtn.classList.toggle('is-active');
});

// --- Product cards: inject divider + normalize brand text + add helper classes ---
document.querySelectorAll('.product-card').forEach((card) => {
    // Add divider once (between media block and title)
    const mediaBlock = card.querySelector(':scope > .relative');
    if (mediaBlock && !card.querySelector('.product-divider')) {
        const divider = document.createElement('div');
        divider.className = 'product-divider';
        divider.setAttribute('aria-hidden', 'true');
        mediaBlock.insertAdjacentElement('afterend', divider);
    }

    // Title helper class (for responsive sizing)
    const titleEl = card.querySelector('h3');
    if (titleEl) {
        titleEl.classList.add('product-title');
        // Ensure truncation works everywhere (no line-clamp dependency)
        titleEl.classList.add('truncate');
    }

    // Brand: remove "برند:" prefix; keep only brand name
    const brandEl = card.querySelector('p.mt-1.text-gray-500');
    if (brandEl) {
        brandEl.textContent = brandEl.textContent.replace(/^\s*برند\s*:\s*/i, '').trim();
        brandEl.classList.add('product-brand');
    }

    // Bottom row helper class (for consistent layout)
    const bottomRow = card.querySelector(':scope > div.mt-3.flex');
    if (bottomRow) bottomRow.classList.add('product-bottom');

    // Action buttons helper classes
    const actionBtns = card.querySelectorAll('button.nav-icon-btn');
    actionBtns.forEach((btn) => {
        const icon = btn.querySelector('.material-icon');
        const name = icon?.textContent?.trim();
        if (name === 'favorite_border' || name === 'favorite') {
            btn.classList.add('product-like-btn');
        }
        if (name === 'add') {
            btn.classList.add('product-add-btn');
        }
    });
});

// --- Ripple Effect Implementation (icons: faster + subtler, no movement) ---
document.addEventListener('click', function (e) {
    const target = e.target.closest('.ripple');
    if (!target) return;

    const isIconBtn = target.classList.contains('nav-icon-btn');

    const circle = document.createElement('span');

    // Slightly smaller/cleaner ripple for icon buttons
    const base = Math.max(target.clientWidth, target.clientHeight);
    const diameter = isIconBtn ? base : base;
    const radius = diameter / 2;

    const rect = target.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;

    // Make the feedback faster and more subtle on icons
    const duration = isIconBtn ? 260 : 600;
    circle.style.animationDuration = `${duration}ms`;
    if (isIconBtn) {
        circle.style.backgroundColor = 'rgba(103, 80, 164, 0.14)';
    }

    circle.classList.add('ripple-effect');
    target.appendChild(circle);

    setTimeout(() => {
        circle.remove();
    }, duration);
});

// --- Entrance Animations (Intersection Observer) ---
const sections = document.querySelectorAll('section');
if (sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
        observer.observe(section);
    });
}

// --- Mobile Menu Logic ---
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
const openMenuBtn = document.getElementById('open-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');

function openMenu() {
    if (!mobileMenu || !mobileMenuOverlay) return;

    mobileMenu.classList.remove('translate-x-full');
    mobileMenuOverlay.classList.remove('hidden');
    // force reflow for transition
    void mobileMenuOverlay.offsetWidth;
    mobileMenuOverlay.classList.remove('opacity-0');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    if (!mobileMenu || !mobileMenuOverlay) return;

    mobileMenu.classList.add('translate-x-full');
    mobileMenuOverlay.classList.add('opacity-0');
    setTimeout(() => mobileMenuOverlay.classList.add('hidden'), 280);
    document.body.style.overflow = '';
}

function toggleMenu() {
    if (!mobileMenu) return;
    const isHidden = mobileMenu.classList.contains('translate-x-full');
    if (isHidden) openMenu(); else closeMenu();
}

if (openMenuBtn) openMenuBtn.addEventListener('click', toggleMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMenu);

// Close on ESC
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
});

// --- Banner Slider Logic (Auto + Dots + Swipe) ---
const bannerWrapper = document.getElementById('banner-wrapper');
const bannerContainer = bannerWrapper?.closest('.banner-container') || null;
const bannerSlides = document.querySelectorAll('.banner-slide');
const bannerDots = document.querySelectorAll('.banner-dot');
let bannerIndex = 0;
let bannerInterval;

function updateBanner(index, { animate = true } = {}) {
    if (!bannerWrapper) return;

    if (!animate) bannerWrapper.classList.add('no-anim');

    if (index >= bannerSlides.length) bannerIndex = 0;
    else if (index < 0) bannerIndex = bannerSlides.length - 1;
    else bannerIndex = index;

    bannerWrapper.style.transform = `translateX(-${bannerIndex * 100}%)`;

    bannerSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === bannerIndex);
    });

    bannerDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === bannerIndex);
        dot.setAttribute('aria-current', i === bannerIndex ? 'true' : 'false');
    });

    if (!animate) {
        // allow next tick to re-enable animation
        requestAnimationFrame(() => bannerWrapper.classList.remove('no-anim'));
    }
}

function startBannerTimer() {
    if (bannerInterval) clearInterval(bannerInterval);
    bannerInterval = setInterval(() => updateBanner(bannerIndex + 1), 10000);
}

function stopBannerTimer() {
    if (bannerInterval) clearInterval(bannerInterval);
}

if (bannerWrapper && bannerSlides.length > 0) {
    // Ensure initial state is in-sync (and prevents any first-frame glitches)
    updateBanner(0, { animate: false });
    requestAnimationFrame(() => {
        startBannerTimer();
    });

    bannerDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopBannerTimer();
            updateBanner(index);
            startBannerTimer();
        });
    });

    // Swipe support (mobile/tablet)
    if (bannerContainer) {
        let startX = 0;
        let startY = 0;
        let isTouching = false;

        bannerContainer.addEventListener('touchstart', (e) => {
            if (!e.touches || e.touches.length !== 1) return;
            isTouching = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            stopBannerTimer();
        }, { passive: true });

        bannerContainer.addEventListener('touchend', (e) => {
            if (!isTouching) return;
            isTouching = false;

            const endTouch = e.changedTouches && e.changedTouches[0];
            if (!endTouch) {
                startBannerTimer();
                return;
            }

            const dx = endTouch.clientX - startX;
            const dy = endTouch.clientY - startY;

            // Ignore mostly vertical gestures
            if (Math.abs(dy) > Math.abs(dx)) {
                startBannerTimer();
                return;
            }

            const threshold = 45; // px
            if (dx <= -threshold) {
                // swipe left -> next
                updateBanner(bannerIndex + 1);
            } else if (dx >= threshold) {
                // swipe right -> prev
                updateBanner(bannerIndex - 1);
            }

            startBannerTimer();
        }, { passive: true });

        // Pause timer on hover (desktop)
        bannerContainer.addEventListener('mouseenter', stopBannerTimer);
        bannerContainer.addEventListener('mouseleave', startBannerTimer);
    }
}

});
