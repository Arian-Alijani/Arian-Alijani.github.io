document.addEventListener('DOMContentLoaded', () => {

// --- Mobile Menu Toggle ---
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('close-menu-btn');
    const menu = document.getElementById('mobile-menu');

    // باز کردن منو
    toggleBtn?.addEventListener('click', () => {
        menu.classList.remove('hidden');
        setTimeout(() => {
            menu.classList.add('active');
            document.body.classList.add('menu-open');
        }, 10);
    });

    // بستن منو
    const closeMenu = () => {
        menu.classList.remove('active');
        setTimeout(() => {
            menu.classList.add('hidden');
            document.body.classList.remove('menu-open');
        }, 300);
    };

    closeBtn?.addEventListener('click', closeMenu);
    menu?.addEventListener('click', (e) => {
        if (e.target === menu) closeMenu();
    });
});

// --- Dynamic Banner Offset (prevent banner hiding under fixed navbar) ---
 const navbar = document.querySelector('header.sticky');
function applyNavbarOffset() {
    if (!navbar) return;
    const h = navbar.offsetHeight || 0;
    document.documentElement.style.setProperty('--navbar-offset', `${h}px`);
}
applyNavbarOffset();
window.addEventListener('resize', applyNavbarOffset);

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

// --- Toast helper (dynamic message + icon) ---
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');
let toastTimeout;

function showToast(message, { icon = 'check_circle', iconClass = 'text-green-400' } = {}) {
    if (!toast) return;

    if (toastMsg) toastMsg.textContent = message;
    if (toastIcon) {
        toastIcon.textContent = icon;
        toastIcon.className = `material-icon ${iconClass}`;
    }

    toast.classList.remove('translate-y-20', 'opacity-0');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2600);
}

// --- Cart state (per product) + Header badge ---
const cartBtn = document.getElementById('cart-btn');
const cartBadge = document.getElementById('cart-count-badge');
const cartSet = new Set();

// assign a stable id to each card (in case you later want persistence)
document.querySelectorAll('.product-card').forEach((card, i) => {
    if (!card.dataset.pid) card.dataset.pid = `p${i + 1}`;
});

function renderCartBadge() {
    if (!cartBadge) return;
    const n = cartSet.size;
    cartBadge.textContent = String(n);
    cartBadge.classList.toggle('hidden', n <= 0);
}
renderCartBadge();

// --- Product interactions (Cart + Favorite) ---
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const iconEl = btn.querySelector('.material-icon');
    const iconName = iconEl?.textContent?.trim();

    // Cart toggle (only product add button)
    if (btn.classList.contains('product-add-btn')) {
        e.stopPropagation();

        const card = btn.closest('.product-card');
        const pid = card?.dataset?.pid;
        if (!pid) return;

        const inCart = cartSet.has(pid);
        if (!inCart) {
            cartSet.add(pid);
            btn.classList.add('in-cart');
            if (iconEl) iconEl.textContent = 'remove_shopping_cart';

            renderCartBadge();
            showToast('محصول به سبد خرید اضافه شد', { icon: 'check_circle', iconClass: 'text-green-400' });
        } else {
            cartSet.delete(pid);
            btn.classList.remove('in-cart');
            if (iconEl) iconEl.textContent = 'add';

            renderCartBadge();
            showToast('محصول از سبد خرید حذف شد', { icon: 'remove_shopping_cart', iconClass: 'text-red-400' });
        }
        return;
    }

    // Favorite toast (ONLY inside product cards)
    if ((iconName === 'favorite_border' || iconName === 'favorite') && btn.closest('.product-card')) {
        e.stopPropagation();

        const isFav = iconName === 'favorite';
        if (iconEl) iconEl.textContent = isFav ? 'favorite_border' : 'favorite';

        showToast(isFav ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد', {
            icon: 'favorite',
            iconClass: isFav ? 'text-gray-300' : 'text-pink-400'
        });
        return;
    }
});

// --- Header icon temporary click highlight (no persistent active state) ---
document.addEventListener('click', (e) => {
    // only buttons inside navbar (avoid product buttons)
    const iconBtn = e.target.closest('#navbar .nav-icon-btn');
    if (!iconBtn) return;

    iconBtn.classList.add('is-active');
    clearTimeout(iconBtn._activeT);
    iconBtn._activeT = setTimeout(() => {
        iconBtn.classList.remove('is-active');
    }, 220);
});

// --- Product cards: inject divider + normalize brand text + add helper classes ---
document.querySelectorAll('.product-card').forEach((card) => {
    const mediaBlock = card.querySelector(':scope > .relative');
    if (mediaBlock && !card.querySelector('.product-divider')) {
        const divider = document.createElement('div');
        divider.className = 'product-divider';
        divider.setAttribute('aria-hidden', 'true');
        mediaBlock.insertAdjacentElement('afterend', divider);
    }

    const titleEl = card.querySelector('h3');
    if (titleEl) {
        titleEl.classList.add('product-title');
        titleEl.classList.add('truncate');
    }

    const brandEl = card.querySelector('p.mt-1.text-gray-500');
    if (brandEl) {
        brandEl.textContent = brandEl.textContent.replace(/^\s*برند\s*:\s*/i, '').trim();
        brandEl.classList.add('product-brand');
    }

    const bottomRow = card.querySelector(':scope > div.mt-3.flex');
    if (bottomRow) bottomRow.classList.add('product-bottom');

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

    // Ensure every card has a visible favorite button. Insert it before add button if present, otherwise append to the bottom row.
    const hasLike = card.querySelector('button.product-like-btn');
    const addBtn = card.querySelector('button.product-add-btn');
    if (!hasLike) {
        const likeBtn = document.createElement('button');
        likeBtn.type = 'button';
        likeBtn.className = 'nav-icon-btn ripple product-like-btn w-10 h-10 rounded-2xl bg-white border border-gray-100 text-gray-700 flex items-center justify-center hover:bg-[#F7F2FA] transition';
        likeBtn.setAttribute('aria-label', 'افزودن به علاقه‌مندی');
        likeBtn.innerHTML = '<span class="material-icon text-[20px]">favorite_border</span>';
        if (addBtn && addBtn.parentNode) {
            addBtn.parentNode.insertBefore(likeBtn, addBtn);
        } else if (bottomRow) {
            // append to bottomRow's right side
            const wrap = document.createElement('div');
            wrap.className = 'flex items-center gap-2';
            // move existing children (price) into wrap if needed
            // place likeBtn then addBtn placeholder
            wrap.appendChild(likeBtn);
            bottomRow.appendChild(wrap);
        }
    }
});

// --- Ripple Effect Implementation ---
document.addEventListener('click', function (e) {
    const target = e.target.closest('.ripple');
    if (!target) return;

    const isIconBtn = target.classList.contains('nav-icon-btn');

    const circle = document.createElement('span');
    const base = Math.max(target.clientWidth, target.clientHeight);
    const diameter = base;
    const radius = diameter / 2;

    const rect = target.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;

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

// Add event listener for menu-toggle button as well
const menuToggleBtn = document.getElementById('menu-toggle');
if (menuToggleBtn) menuToggleBtn.addEventListener('click', toggleMenu);
if (openMenuBtn) openMenuBtn.addEventListener('click', toggleMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMenu);

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

            if (Math.abs(dy) > Math.abs(dx)) {
                startBannerTimer();
                return;
            }

            const threshold = 45;
            if (dx <= -threshold) {
                updateBanner(bannerIndex + 1);
            } else if (dx >= threshold) {
                updateBanner(bannerIndex - 1);
            }

            startBannerTimer();
        }, { passive: true });

        bannerContainer.addEventListener('mouseenter', stopBannerTimer);
        bannerContainer.addEventListener('mouseleave', startBannerTimer);
    }
}

// --- Search clear button UX ---
document.querySelectorAll('.search-shell').forEach((shell) => {
    const input = shell.querySelector('.search-input');
    const clearBtn = shell.querySelector('.search-clear');
    if (!input || !clearBtn) return;

    function sync() {
        const has = (input.value || '').trim().length > 0;
        clearBtn.classList.toggle('hidden', !has);
    }

    input.addEventListener('input', sync);
    input.addEventListener('blur', sync);

    clearBtn.addEventListener('click', () => {
        input.value = '';
        input.focus();
        sync();
    });
});

// --- Drag to scroll (pointer events + momentum) for product rows ---
// Prevent ghost image dragging on product images
document.addEventListener('dragstart', (e) => {
    const img = e.target?.closest?.('.products-row img');
    if (img) e.preventDefault();
});

document.querySelectorAll('.drag-scroll').forEach((row) => {
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;

    // velocity tracking
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let momentumRaf = null;

    const threshold = 6;

    function canStartFrom(target) {
        return !target.closest('button, a, input, textarea, select, details, summary');
    }

    function stopMomentum() {
        if (momentumRaf) cancelAnimationFrame(momentumRaf);
        momentumRaf = null;
    }

    function startMomentum() {
        // Don't implement momentum scrolling - just stop at current position
        // This ensures the slider stays where the user releases it
    }

    row.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (!canStartFrom(e.target)) return;

        stopMomentum();

        isDown = true;
        moved = false;
        startX = e.clientX;
        startScrollLeft = row.scrollLeft;

        lastX = e.clientX;
        lastT = performance.now();
        velocity = 0;

        row.classList.add('is-dragging');
        row.style.scrollBehavior = 'auto';

        try { row.setPointerCapture(e.pointerId); } catch {}
    });

    row.addEventListener('pointermove', (e) => {
        if (!isDown) return;

        const now = performance.now();
        const dx = e.clientX - startX;
        if (Math.abs(dx) > threshold) moved = true;

        // update scroll
        row.scrollLeft = startScrollLeft - dx;

        // velocity (px/ms)
        const dt = Math.max(10, now - lastT);
        const ddx = e.clientX - lastX;
        velocity = (ddx / dt);

        lastX = e.clientX;
        lastT = now;

        if (moved) e.preventDefault();
    }, { passive: false });

    function endDrag(e) {
        if (!isDown) return;
        isDown = false;

        row.classList.remove('is-dragging');
        row.style.scrollSnapType = 'none'; // Keep it where it was released
        row.style.scrollBehavior = '';

        try { row.releasePointerCapture(e.pointerId); } catch {}

        if (moved) {
            row.dataset.justDragged = '1';
            setTimeout(() => { delete row.dataset.justDragged; }, 100);
        }

        // Don't start momentum after releasing - just stop at current position
        stopMomentum();
    }

    row.addEventListener('pointerup', endDrag);
    row.addEventListener('pointercancel', endDrag);

    // Capture click to avoid accidental clicks after dragging
    row.addEventListener('click', (e) => {
        if (row.dataset.justDragged === '1') {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
});

// --- Auto scrollers (Suggested + Best) ---
// Goal: always moves (never gets stuck) across RTL implementations.
function getRtlScrollType() {
    // Detect RTL scrollLeft behavior: "default" | "reverse" | "negative"
    // Based on the widely used detection pattern.
    const el = document.createElement('div');
    el.dir = 'rtl';
    el.style.width = '100px';
    el.style.height = '100px';
    el.style.overflow = 'scroll';
    el.style.position = 'absolute';
    el.style.top = '-9999px';

    const inner = document.createElement('div');
    inner.style.width = '200px';
    inner.style.height = '1px';
    el.appendChild(inner);
    document.body.appendChild(el);

    // If setting 0 results in a positive value, it's the "default" type.
    el.scrollLeft = 0;
    if (el.scrollLeft > 0) {
        document.body.removeChild(el);
        return 'default';
    }

    // Otherwise distinguish between negative and reverse.
    el.scrollLeft = 1;
    const type = (el.scrollLeft === 0) ? 'negative' : 'reverse';

    document.body.removeChild(el);
    return type;
}

const RTL_SCROLL_TYPE = getRtlScrollType();

function getScrollPos(row) {
    // normalized: 0 .. max
    const max = row.scrollWidth - row.clientWidth;
    if (max <= 0) return 0;

    const sl = row.scrollLeft;
    if (row.dir !== 'rtl' && getComputedStyle(row).direction !== 'rtl') {
        return Math.max(0, Math.min(max, sl));
    }

    if (RTL_SCROLL_TYPE === 'negative') {
        return Math.max(0, Math.min(max, -sl));
    }

    if (RTL_SCROLL_TYPE === 'reverse') {
        return Math.max(0, Math.min(max, max - sl));
    }

    // default
    return Math.max(0, Math.min(max, sl));
}

function rawScrollLeftFromPos(row, pos) {
    const max = row.scrollWidth - row.clientWidth;
    const p = Math.max(0, Math.min(max, pos));

    if (row.dir !== 'rtl' && getComputedStyle(row).direction !== 'rtl') {
        return p;
    }

    if (RTL_SCROLL_TYPE === 'negative') {
        return -p;
    }

    if (RTL_SCROLL_TYPE === 'reverse') {
        return max - p;
    }

    return p;
}

function setScrollPos(row, pos) {
    row.scrollLeft = rawScrollLeftFromPos(row, pos);
}

function scrollToPos(row, pos, behavior = 'auto') {
    const left = rawScrollLeftFromPos(row, pos);
    try {
        row.scrollTo({ left, behavior });
    } catch {
        // fallback
        row.scrollLeft = left;
    }
}

function stepSize(row) {
    const card = row.querySelector('.product-card');
    if (!card) return 280;
    const gap = parseFloat(getComputedStyle(row).gap || '0') || 0;
    return card.getBoundingClientRect().width + gap;
}

function setupAutoScroller(row, {
    mode = 'step', // 'step' or 'drift'
    intervalMs = 5000,
    driftPxPerFrame = 0.55,
    pauseOnHover = true,
    pauseOnDrag = true,
    manualPauseMs = 20000
} = {}) {
    if (!row) return;

    let timer = null;
    let raf = null;
    let paused = false;
    let dir = 1; // 1 forward, -1 backward (normalized direction)

    // When user interacts manually, pause autoplay for a while (per-row)
    let pauseUntil = 0;
    function pauseFor(ms = manualPauseMs) {
        pauseUntil = Math.max(pauseUntil, Date.now() + ms);
    }

    function maxScroll() {
        return Math.max(0, row.scrollWidth - row.clientWidth);
    }

    function isPausedByInteraction() {
        if (paused) return true;
        if (Date.now() < pauseUntil) return true;
        if (pauseOnDrag && (row.classList.contains('is-dragging') || row.classList.contains('is-momentum'))) return true;
        return false;
    }

    function nudgeIfStuck(prevPos) {
        // If scroll didn't change (RTL weirdness or near boundary), flip direction and try again.
        const cur = getScrollPos(row);
        if (Math.abs(cur - prevPos) < 0.5) {
            dir *= -1;
            return false;
        }
        return true;
    }

    function tickStep() {
        if (isPausedByInteraction()) return;

        const max = maxScroll();
        if (max <= 0) return;

        const prev = getScrollPos(row);
        const step = stepSize(row);

        // If already at an edge, make sure we move inward
        if (prev >= max - 1 && dir > 0) dir = -1;
        if (prev <= 1 && dir < 0) dir = 1;

        let next = prev + dir * step;

        // If going out of bounds, flip direction and try once more
        if (next > max || next < 0) {
            dir *= -1;
            next = prev + dir * step;
        }

        // Clamp
        next = Math.max(0, Math.min(max, next));

        // Smooth step
        scrollToPos(row, next, 'smooth');

        // Safety: if browser didn't move (RTL edge-case), flip direction and nudge
        setTimeout(() => {
            if (isPausedByInteraction()) return;
            const cur = getScrollPos(row);
            if (Math.abs(cur - prev) < 0.5) {
                dir *= -1;
                const retry = Math.max(0, Math.min(max, prev + dir * step));
                scrollToPos(row, retry, 'smooth');
            }
        }, 420);
    }

    function loopDrift() {
        if (!raf) return;
        if (isPausedByInteraction()) {
            raf = requestAnimationFrame(loopDrift);
            return;
        }

        const max = maxScroll();
        if (max <= 0) {
            raf = requestAnimationFrame(loopDrift);
            return;
        }

        const prev = getScrollPos(row);

        // keep dir valid at edges
        if (prev >= max - 1 && dir > 0) dir = -1;
        if (prev <= 1 && dir < 0) dir = 1;

        let next = prev + dir * driftPxPerFrame;

        if (next >= max - 1) {
            dir = -1;
            next = max;
        } else if (next <= 1) {
            dir = 1;
            next = 0;
        }

        setScrollPos(row, next);

        // If stuck, flip direction and move more
        if (!nudgeIfStuck(prev)) {
            setScrollPos(row, Math.max(0, Math.min(max, prev + dir * 10)));
        }

        raf = requestAnimationFrame(loopDrift);
    }

    function start() {
        stop();
        row.style.scrollSnapType = 'x mandatory'; // Re-enable snap when auto-scrolling starts
        if (mode === 'step') {
            timer = setInterval(tickStep, intervalMs);
        } else {
            raf = requestAnimationFrame(loopDrift);
        }
    }

    function stop() {
        if (timer) clearInterval(timer);
        timer = null;
        if (raf) cancelAnimationFrame(raf);
        raf = null;
    }

    function scheduleResume() {
        // Schedule the auto-scrolling to resume after 20 seconds
        setTimeout(() => {
            // Check if we're still in the pause period
            if (Date.now() >= pauseUntil) {
                // Only start if auto-scrolling should be active
                start();
            }
        }, 20000); // Fixed 20 second delay
    }

    // Manual interactions => pause for 20s
    row.addEventListener('pointerdown', () => {
        pauseFor();
        // Stop any existing timer to reset the 20-second countdown
        if (timer) clearInterval(timer);
        timer = null;
        // Schedule to resume later
        scheduleResume();
    });
    row.addEventListener('pointerup', () => {
        // Auto-scrolling will resume after 20 seconds via the scheduled timeout
    });
    row.addEventListener('touchstart', () => {
        pauseFor();
        // Stop any existing timer to reset the 20-second countdown
        if (timer) clearInterval(timer);
        timer = null;
        // Schedule to resume later
        scheduleResume();
    });
    row.addEventListener('touchend', () => {
        // Auto-scrolling will resume after 20 seconds via the scheduled timeout
    });
    row.addEventListener('wheel', () => {
        pauseFor();
        // Stop any existing timer to reset the 20-second countdown
        if (timer) clearInterval(timer);
        timer = null;
        // Schedule to resume later
        scheduleResume();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop(); else start();
    });

    // Keep moving after resize (maxScroll changes)
    window.addEventListener('resize', () => {
        // ensure not out of bounds
        setScrollPos(row, getScrollPos(row));
    }, { passive: true });

    start();
}

// Suggested: step 1 card every 5s (as requested)
setupAutoScroller(document.querySelector('.products-row[data-autoplay="suggested"]'), {
    mode: 'step',
    intervalMs: 5000
});

// Best sellers: smooth drift (continuous motion)
setupAutoScroller(document.querySelector('.products-row[data-autoplay="best"]'), {
    mode: 'drift',
    driftPxPerFrame: 0.6
});

// --- OTP Input Logic ---
const otpInputs = document.querySelectorAll('.otp-field input');
if (otpInputs.length > 0) {
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });
}

// --- Product Gallery Logic ---
const mainImage = document.getElementById('main-product-image');
const thumbnails = document.querySelectorAll('.gallery-thumb');
if (mainImage && thumbnails.length > 0) {
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      // Remove active class from all
      thumbnails.forEach(t => t.classList.remove('active'));
      // Add to clicked
      thumb.classList.add('active');
      // Change main image
      const newSrc = thumb.querySelector('img').src;
      mainImage.classList.add('opacity-50');
      setTimeout(() => {
        mainImage.src = newSrc;
        mainImage.classList.remove('opacity-50');
      }, 200);
    });
  });
}

// --- Quantity Selector Logic ---
document.querySelectorAll('.qty-selector').forEach(selector => {
  const minusBtn = selector.querySelector('.qty-minus');
  const plusBtn = selector.querySelector('.qty-plus');
  const input = selector.querySelector('input');

  if (minusBtn && plusBtn && input) {
    minusBtn.addEventListener('click', () => {
      const val = parseInt(input.value) || 1;
      if (val > 1) input.value = val - 1;
    });
    plusBtn.addEventListener('click', () => {
      const val = parseInt(input.value) || 1;
      input.value = val + 1;
    });
  }
});

// --- Simple Tabs for Profile ---
const tabLinks = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');

if(tabLinks.length > 0) {
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.tabTarget;
            
            // Toggle active link
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Toggle active content
            tabContents.forEach(c => c.classList.add('hidden'));
            const targetContent = document.querySelector(targetId);
            if(targetContent) targetContent.classList.remove('hidden');
        });
    });
}

});