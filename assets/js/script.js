document.addEventListener('DOMContentLoaded', () => {

// --- Footer Mobile Accordion ---
function initFooterAccordion() {
    const accordionHeaders = document.querySelectorAll('.footer-accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const parentSection = header.parentElement;
            const isActive = header.classList.contains('active');
            
            if (isActive) {
                header.classList.remove('active');
                content.classList.remove('active');
                parentSection.classList.remove('active-section');
                content.style.maxHeight = content.scrollHeight + 'px';
                setTimeout(() => { content.style.maxHeight = '0'; }, 10);
            } else {
                header.classList.add('active');
                content.classList.add('active');
                parentSection.classList.add('active-section');
                content.style.maxHeight = content.scrollHeight + 'px';
                setTimeout(() => { content.style.maxHeight = 'none'; }, 400);
            }
            
            header.style.transform = 'scale(0.98)';
            setTimeout(() => { header.style.transform = ''; }, 150);
        });
        
        header.addEventListener('mouseenter', () => {
            if (!header.classList.contains('active')) header.style.background = 'rgba(103, 80, 164, 0.05)';
        });
        
        header.addEventListener('mouseleave', () => {
            if (!header.classList.contains('active')) header.style.background = '';
        });
    });
    
    if (window.innerWidth <= 767 && accordionHeaders.length > 0) {
        const firstHeader = accordionHeaders[0];
        const firstContent = firstHeader.nextElementSibling;
        const firstSection = firstHeader.parentElement;
        setTimeout(() => {
            firstHeader.classList.add('active');
            firstContent.classList.add('active');
            firstSection.classList.add('active-section');
            firstContent.style.maxHeight = firstContent.scrollHeight + 'px';
        }, 500);
    }
}
initFooterAccordion();

// Add layout helper when mobile footer exists
const mobileFooter = document.getElementById('mobile-footer');
if (mobileFooter) {
    document.body.classList.add('has-mobile-footer');
}

// --- Dynamic Banner Offset ---
const navbar = document.getElementById('navbar');
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

// --- Navbar Bottom Hide/Show Logic (scroll down = hide bottom row) ---
function initNavbarBottomScroll() {
    const navbar = document.getElementById('navbar');
    const navbarBottom = document.getElementById('navbar-bottom');
    if (!navbarBottom) return;

    let lastScrollY = window.pageYOffset || 0;
    let ticking = false;

    function updateNavbarBottom() {
        const currentScrollY = window.pageYOffset || 0;
        const scrollDiff = currentScrollY - lastScrollY;
        const absDiff = Math.abs(scrollDiff);

        if (navbar) {
            if (currentScrollY > 10) {
                navbar.classList.add('shadow-sm');
                if (navbar.classList.contains('bg-[#FEF7FF]/90')) {
                    navbar.classList.replace('bg-[#FEF7FF]/90', 'bg-[#FEF7FF]/95');
                }
            } else {
                navbar.classList.remove('shadow-sm');
                if (navbar.classList.contains('bg-[#FEF7FF]/95')) {
                    navbar.classList.replace('bg-[#FEF7FF]/95', 'bg-[#FEF7FF]/90');
                }
            }
        }

        if (absDiff < 4) {
            lastScrollY = currentScrollY;
            ticking = false;
            return;
        }

        if (currentScrollY <= 0 || scrollDiff < 0) {
            navbarBottom.classList.remove('navbar-hidden');
        } else if (scrollDiff > 0) {
            navbarBottom.classList.add('navbar-hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbarBottom);
            ticking = true;
        }
    }, { passive: true });

    updateNavbarBottom();
}
initNavbarBottomScroll();

// --- Cart state (per product) + Header badge ---
const cartBtn = document.getElementById('cart-btn');
const cartBadge = document.getElementById('cart-count-badge');
const cartSet = new Set();
const favoritesSet = new Set();

function loadFavoritesFromStorage() {
    if (typeof Storage === 'undefined') return;
    try {
        const savedFavs = localStorage.getItem('mahanshop_favorites');
        if (savedFavs && savedFavs.trim()) {
            const favArray = JSON.parse(savedFavs);
            if (Array.isArray(favArray)) {
                favoritesSet.clear();
                favArray.forEach(pid => {
                    if (pid && typeof pid === 'string' && pid.trim()) {
                        favoritesSet.add(pid.trim());
                    }
                });
            }
        }
    } catch (e) {
        console.warn('Failed to load favorites:', e);
    }
}

function saveFavoritesToStorage() {
    if (typeof Storage === 'undefined') return;
    try {
        const favArray = Array.from(favoritesSet);
        if (favArray.length === 0) {
            localStorage.removeItem('mahanshop_favorites');
        } else {
            localStorage.setItem('mahanshop_favorites', JSON.stringify(favArray));
        }
    } catch (e) {
        console.warn('Failed to save favorites:', e);
    }
}

function getCardPid(card) {
    return card?.dataset?.pid || null;
}

function setFavoriteButtonState(btn, isFav) {
    if (!btn) return;
    btn.classList.toggle('is-favorite', isFav);
    btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
    btn.setAttribute('aria-label', isFav ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی');
    const icon = btn.querySelector('.material-icon');
    if (icon) icon.textContent = isFav ? 'favorite' : 'favorite_border';
}

function loadCartFromStorage() {
    if (typeof Storage === 'undefined') return;
    try {
        const savedCart = localStorage.getItem('mahanshop_cart');
        if (savedCart && savedCart.trim()) {
            const cartArray = JSON.parse(savedCart);
            if (Array.isArray(cartArray)) {
                cartSet.clear();
                cartArray.forEach(pid => {
                    if (pid && typeof pid === 'string' && pid.trim()) {
                        cartSet.add(pid.trim());
                    }
                });
            }
        }
    } catch (e) {
        console.warn('Failed to load cart:', e);
    }
}

function saveCartToStorage() {
    if (typeof Storage === 'undefined') return;
    try {
        const cartArray = Array.from(cartSet);
        if (cartArray.length === 0) {
            localStorage.removeItem('mahanshop_cart');
        } else {
            localStorage.setItem('mahanshop_cart', JSON.stringify(cartArray));
        }
    } catch (e) {
        console.warn('Failed to save cart:', e);
    }
}

document.querySelectorAll('.product-card').forEach((card) => {
    if (!card.dataset.pid) {
        const title = card.querySelector('h3')?.textContent?.trim() || '';
        const brand = card.querySelector('p')?.textContent?.trim() || '';
        const price = card.querySelector('.font-black')?.textContent?.trim() || '';
        const productString = `${title}-${brand}-${price}`;
        let hash = 0;
        for (let j = 0; j < productString.length; j++) {
            const char = productString.charCodeAt(j);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; 
        }
        card.dataset.pid = `prod_${Math.abs(hash)}`;
    }
});

let pageFullyLoaded = false;
window.addEventListener('load', () => { pageFullyLoaded = true; });

loadCartFromStorage();
loadFavoritesFromStorage();

function renderCartBadge() {
    if (!cartBadge) return;
    const n = cartSet.size;
    cartBadge.textContent = String(n);
    cartBadge.classList.toggle('hidden', n <= 0);
}
renderCartBadge();

document.addEventListener('click', (e) => {
    if (!e.isTrusted) return;
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.hasAttribute('data-processing')) return;
    btn.setAttribute('data-processing', 'true');
    setTimeout(() => btn.removeAttribute('data-processing'), 100);

    const iconEl = btn.querySelector('.material-icon');
    const iconName = iconEl?.textContent?.trim();

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
            saveCartToStorage();
        } else {
            cartSet.delete(pid);
            btn.classList.remove('in-cart');
            if (iconEl) iconEl.textContent = 'add';
            renderCartBadge();
            saveCartToStorage();
        }
        return;
    }

    if ((btn.classList.contains('product-like-btn') || iconName === 'favorite_border' || iconName === 'favorite') && btn.closest('.product-card')) {
        e.stopPropagation();
        const card = btn.closest('.product-card');
        const pid = getCardPid(card);
        const isFav = btn.classList.contains('is-favorite');
        const nextFav = !isFav;
        if (pid) {
            if (nextFav) favoritesSet.add(pid);
            else favoritesSet.delete(pid);
            saveFavoritesToStorage();
        }
        setFavoriteButtonState(btn, nextFav);
        return;
    }
});

document.addEventListener('click', (e) => {
    const iconBtn = e.target.closest('#navbar .nav-icon-btn');
    if (!iconBtn) return;
    iconBtn.classList.add('is-active');
    clearTimeout(iconBtn._activeT);
    iconBtn._activeT = setTimeout(() => {
        iconBtn.classList.remove('is-active');
    }, 220);
});

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
            const wrap = document.createElement('div');
            wrap.className = 'flex items-center gap-2';
            wrap.appendChild(likeBtn);
            bottomRow.appendChild(wrap);
        }
    }

    const likeBtn = card.querySelector('button.product-like-btn');
    if (likeBtn) {
        const pid = getCardPid(card);
        const isFav = pid ? favoritesSet.has(pid) : likeBtn.classList.contains('is-favorite');
        setFavoriteButtonState(likeBtn, isFav);
    }
});

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
    if (isIconBtn) circle.style.backgroundColor = 'rgba(103, 80, 164, 0.14)';
    circle.classList.add('ripple-effect');
    target.appendChild(circle);
    setTimeout(() => { circle.remove(); }, duration);
});

const sections = document.querySelectorAll('section');
if (sections.length > 0) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) {
        sections.forEach(section => {
            section.classList.add('opacity-100', 'translate-y-0');
        });
    } else {
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
}

document.getElementById('add-all-to-cart-btn')?.addEventListener('click', (e) => {
    if (!e.isTrusted) return;
    const favoriteCards = document.querySelectorAll('#favorites-grid .product-card');
    let addedCount = 0;
    favoriteCards.forEach(card => {
        const pid = card?.dataset?.pid;
        if (pid && !cartSet.has(pid)) {
            cartSet.add(pid);
            addedCount++;
        }
    });
    if (addedCount > 0) {
        renderCartBadge();
        saveCartToStorage();
    }
});

const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const closeMenuBtn = document.getElementById('close-menu-btn');

function openMenu() {
    if (!mobileMenu || !mobileMenuOverlay) return;
    mobileMenu.classList.remove('translate-x-full');
    mobileMenuOverlay.classList.remove('hidden');
    void mobileMenuOverlay.offsetWidth;
    mobileMenuOverlay.classList.remove('opacity-0');
    document.body.classList.add('menu-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenuOverlay.setAttribute('aria-hidden', 'false');
    if (mobileMenuToggle) {
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
    }
}

function closeMenu() {
    if (!mobileMenu || !mobileMenuOverlay) return;
    mobileMenu.classList.add('translate-x-full');
    mobileMenuOverlay.classList.add('opacity-0');
    setTimeout(() => mobileMenuOverlay.classList.add('hidden'), 280);
    document.body.classList.remove('menu-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenuOverlay.setAttribute('aria-hidden', 'true');
    if (mobileMenuToggle) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
}

function toggleMenu() {
    if (!mobileMenu) return;
    const isHidden = mobileMenu.classList.contains('translate-x-full');
    if (isHidden) openMenu(); else closeMenu();
}

if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', toggleMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMenu);

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
});

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
    bannerSlides.forEach((slide, i) => slide.classList.toggle('active', i === bannerIndex));
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
    requestAnimationFrame(() => startBannerTimer());

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
            if (!endTouch) { startBannerTimer(); return; }
            const dx = endTouch.clientX - startX;
            const dy = endTouch.clientY - startY;
            if (Math.abs(dy) > Math.abs(dx)) { startBannerTimer(); return; }
            const threshold = 45;
            if (dx <= -threshold) updateBanner(bannerIndex + 1);
            else if (dx >= threshold) updateBanner(bannerIndex - 1);
            startBannerTimer();
        }, { passive: true });

        bannerContainer.addEventListener('mouseenter', stopBannerTimer);
        bannerContainer.addEventListener('mouseleave', startBannerTimer);
    }
}

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

document.addEventListener('dragstart', (e) => {
    const img = e.target?.closest?.('.products-row img');
    if (img) e.preventDefault();
});

document.querySelectorAll('.drag-scroll').forEach((row) => {
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;
    const threshold = 6;

    function canStartFrom(target) {
        return !target.closest('button, a, input, textarea, select, details, summary');
    }

    row.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (!canStartFrom(e.target)) return;
        isDown = true;
        moved = false;
        startX = e.clientX;
        startScrollLeft = row.scrollLeft;
        row.classList.add('is-dragging');
        row.style.scrollSnapType = 'none';
        row.style.scrollBehavior = 'auto';
        try { row.setPointerCapture(e.pointerId); } catch {}
    });

    row.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > threshold) moved = true;
        row.scrollLeft = startScrollLeft - dx;
        if (moved) e.preventDefault();
    }, { passive: false });

    function endDrag(e) {
        if (!isDown) return;
        isDown = false;
        row.classList.remove('is-dragging');
        row.style.scrollSnapType = 'none';
        row.style.scrollBehavior = '';
        try { row.releasePointerCapture(e.pointerId); } catch {}
        if (moved) {
            row.dataset.justDragged = '1';
            setTimeout(() => { delete row.dataset.justDragged; }, 100);
        }
    }

    row.addEventListener('pointerup', endDrag);
    row.addEventListener('pointercancel', endDrag);
    row.addEventListener('click', (e) => {
        if (row.dataset.justDragged === '1') {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    row.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
        const step = stepSize(row);
        const max = Math.max(0, row.scrollWidth - row.clientWidth);
        const isRtl = (row.dir || getComputedStyle(row).direction) === 'rtl';
        const prev = getScrollPos(row);
        let next = prev;
        if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = max;
        else if (e.key === 'ArrowLeft') next = prev + (isRtl ? step : -step);
        else if (e.key === 'ArrowRight') next = prev + (isRtl ? -step : step);
        next = Math.max(0, Math.min(max, next));
        scrollToPos(row, next, 'smooth');
        e.preventDefault();
    });
});

function getRtlScrollType() {
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
    el.scrollLeft = 0;
    if (el.scrollLeft > 0) { document.body.removeChild(el); return 'default'; }
    el.scrollLeft = 1;
    const type = (el.scrollLeft === 0) ? 'negative' : 'reverse';
    document.body.removeChild(el);
    return type;
}
const RTL_SCROLL_TYPE = getRtlScrollType();

function getScrollPos(row) {
    const max = row.scrollWidth - row.clientWidth;
    if (max <= 0) return 0;
    const sl = row.scrollLeft;
    if (row.dir !== 'rtl' && getComputedStyle(row).direction !== 'rtl') return Math.max(0, Math.min(max, sl));
    if (RTL_SCROLL_TYPE === 'negative') return Math.max(0, Math.min(max, -sl));
    if (RTL_SCROLL_TYPE === 'reverse') return Math.max(0, Math.min(max, max - sl));
    return Math.max(0, Math.min(max, sl));
}

function rawScrollLeftFromPos(row, pos) {
    const max = row.scrollWidth - row.clientWidth;
    const p = Math.max(0, Math.min(max, pos));
    if (row.dir !== 'rtl' && getComputedStyle(row).direction !== 'rtl') return p;
    if (RTL_SCROLL_TYPE === 'negative') return -p;
    if (RTL_SCROLL_TYPE === 'reverse') return max - p;
    return p;
}

function setScrollPos(row, pos) {
    row.scrollLeft = rawScrollLeftFromPos(row, pos);
}

function scrollToPos(row, pos, behavior = 'auto') {
    const left = rawScrollLeftFromPos(row, pos);
    try { row.scrollTo({ left, behavior }); } catch { row.scrollLeft = left; }
}

function stepSize(row) {
    const card = row.querySelector('.product-card');
    if (!card) return 280;
    const gap = parseFloat(getComputedStyle(row).gap || '0') || 0;
    return card.getBoundingClientRect().width + gap;
}

function setupAutoScroller(row, { mode = 'step', intervalMs = 5000, driftPxPerFrame = 0.55, pauseOnDrag = true, manualPauseMs = 20000 } = {}) {
    if (!row) return;
    let timer = null;
    let raf = null;
    let dir = 1;
    let pauseUntil = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function pauseFor(ms = manualPauseMs) { pauseUntil = Math.max(pauseUntil, Date.now() + ms); }
    function maxScroll() { return Math.max(0, row.scrollWidth - row.clientWidth); }
    function isPausedByInteraction() {
        if (Date.now() < pauseUntil) return true;
        if (pauseOnDrag && (row.classList.contains('is-dragging') || row.classList.contains('is-momentum'))) return true;
        return false;
    }
    function nudgeIfStuck(prevPos) {
        const cur = getScrollPos(row);
        if (Math.abs(cur - prevPos) < 0.5) { dir *= -1; return false; }
        return true;
    }
    function tickStep() {
        if (isPausedByInteraction()) return;
        const max = maxScroll();
        if (max <= 0) return;
        const prev = getScrollPos(row);
        const step = stepSize(row);
        if (prev >= max - 1 && dir > 0) dir = -1;
        if (prev <= 1 && dir < 0) dir = 1;
        let next = prev + dir * step;
        if (next > max || next < 0) { dir *= -1; next = prev + dir * step; }
        next = Math.max(0, Math.min(max, next));
        scrollToPos(row, next, 'smooth');
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
        if (isPausedByInteraction()) { raf = requestAnimationFrame(loopDrift); return; }
        const max = maxScroll();
        if (max <= 0) { raf = requestAnimationFrame(loopDrift); return; }
        const prev = getScrollPos(row);
        if (prev >= max - 1 && dir > 0) dir = -1;
        if (prev <= 1 && dir < 0) dir = 1;
        let next = prev + dir * driftPxPerFrame;
        if (next >= max - 1) { dir = -1; next = max; } else if (next <= 1) { dir = 1; next = 0; }
        setScrollPos(row, next);
        if (!nudgeIfStuck(prev)) setScrollPos(row, Math.max(0, Math.min(max, prev + dir * 10)));
        raf = requestAnimationFrame(loopDrift);
    }
    function start() {
        stop();
        if (row.dataset.userPaused === '1') return;
        row.style.scrollSnapType = 'x proximity';
        if (reducedMotion.matches) return;
        if (mode === 'step') timer = setInterval(tickStep, intervalMs);
        else raf = requestAnimationFrame(loopDrift);
    }
    function stop() {
        if (timer) clearInterval(timer); timer = null;
        if (raf) cancelAnimationFrame(raf); raf = null;
    }
    function scheduleResume() {
        setTimeout(() => {
            if (Date.now() >= pauseUntil) {
                delete row.dataset.userPaused;
                start();
            }
        }, manualPauseMs);
    }
    const interact = () => {
        row.style.scrollSnapType = 'none';
        row.dataset.userPaused = '1';
        stop();
    };
    row.addEventListener('pointerdown', interact);
    row.addEventListener('pointerup', scheduleResume);
    row.addEventListener('pointercancel', scheduleResume);
    row.addEventListener('touchstart', interact);
    row.addEventListener('touchend', scheduleResume);
    row.addEventListener('wheel', interact);
    row.addEventListener('mouseenter', interact);
    row.addEventListener('focusin', interact);
    row.addEventListener('mouseleave', scheduleResume);
    row.addEventListener('focusout', scheduleResume);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    window.addEventListener('resize', () => { setScrollPos(row, getScrollPos(row)); }, { passive: true });
    if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stop(); else start(); });
    } else if (typeof reducedMotion.addListener === 'function') {
        reducedMotion.addListener(() => { if (reducedMotion.matches) stop(); else start(); });
    }
    start();
}

setupAutoScroller(document.querySelector('.products-row[data-autoplay="suggested"]'), { mode: 'step', intervalMs: 5000, manualPauseMs: 8000 });
setupAutoScroller(document.querySelector('.products-row[data-autoplay="best"]'), { mode: 'drift', driftPxPerFrame: 0.6 });

const otpInputs = document.querySelectorAll('.otp-field input');
if (otpInputs.length > 0) {
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < otpInputs.length - 1) otpInputs[index + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) otpInputs[index - 1].focus();
    });
  });
}

const mainImage = document.getElementById('main-product-image');
const thumbnails = document.querySelectorAll('.gallery-thumb');
if (mainImage && thumbnails.length > 0) {
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbnails.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const newSrc = thumb.querySelector('img').src;
      mainImage.classList.add('opacity-50');
      setTimeout(() => { mainImage.src = newSrc; mainImage.classList.remove('opacity-50'); }, 200);
    });
  });
}

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

});
