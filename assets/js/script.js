(function () {
  "use strict";

  function __mahanInit() {

// --- Auth State Management ---
function initAuthButtons() {
    // Check the current auth state from body attribute
    const authState = document.body.getAttribute('data-auth');
    const loginRegisterDesktop = document.querySelector('.guest-only.hidden.md\\:flex.header-cta-group');
    const loginRegisterMobile = document.querySelector('.guest-only.md\\:hidden.header-cta-mobile-group');

    // If user is authenticated, hide login/register buttons (since user is already logged in)
    if (authState === 'authenticated') {
        // Hide login/register buttons if they exist
        if (loginRegisterDesktop) {
            loginRegisterDesktop.style.display = 'none';
        }
        if (loginRegisterMobile) {
            loginRegisterMobile.style.display = 'none';
        }
    }
    // If user is a guest, ensure login/register are visible (default behavior)
    else {
        // Make sure login/register buttons are visible
        if (loginRegisterDesktop) {
            loginRegisterDesktop.style.display = '';
        }
        if (loginRegisterMobile) {
            loginRegisterMobile.style.display = '';
        }
    }
}

initAuthButtons();


// --- Mobile Menu Modifications ---


function initMobileMenuDropdowns() {
    // Try immediately first (fast path)
    const existingMenu = document.getElementById('mobile-menu');
    if (existingMenu) {
        setupMobileDropdowns(existingMenu);
        return;
    }

    // If the menu is injected later, observe until it appears
    const observer = new MutationObserver(() => {
        const mobileMenu = document.getElementById('mobile-menu');
        if (!mobileMenu) return;
        setupMobileDropdowns(mobileMenu);
        observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function setupMobileDropdowns(mobileMenu) {
    // Use event delegation to handle clicks on mobile dropdown headers
    // This ensures functionality works even if the DOM is modified later

    // Remove any existing event listeners to prevent duplicates
    mobileMenu.removeEventListener('click', handleMobileDropdownClick);

    // Add event listener with event delegation
    mobileMenu.addEventListener('click', handleMobileDropdownClick);
}

function handleMobileDropdownClick(e) {
    // Check if the clicked element is a mobile dropdown header or inside one
    const header = e.target.closest('.mobile-dropdown-header');
    if (!header) return;

    e.preventDefault();
    e.stopPropagation();

    // Get the parent dropdown container
    const dropdown = header.closest('.mobile-dropdown');
    if (!dropdown) return;

    const content = dropdown.querySelector('.mobile-dropdown-content');
    const arrow = dropdown.querySelector('.mobile-dropdown-arrow');

    if (!content || !arrow) return;

    // Toggle the hidden class on content
    content.classList.toggle('hidden');

    // Rotate the arrow icon
    if (content.classList.contains('hidden')) {
        arrow.textContent = 'expand_more';
    } else {
        arrow.textContent = 'expand_less';
    }

    // Visual open state (CSS)
    dropdown.classList.toggle('is-open', !content.classList.contains('hidden'));

    // Close other open dropdowns
    const allDropdowns = dropdown.parentElement.querySelectorAll('.mobile-dropdown');
    allDropdowns.forEach(otherDropdown => {
        if (otherDropdown !== dropdown) {
            const otherContent = otherDropdown.querySelector('.mobile-dropdown-content');
            const otherArrow = otherDropdown.querySelector('.mobile-dropdown-arrow');
            if (otherContent && otherArrow && !otherContent.classList.contains('hidden')) {
                otherContent.classList.add('hidden');
                otherArrow.textContent = 'expand_more';
                otherDropdown.classList.remove('is-open');
            }
        }
    });
}

// Initialize mobile menu modifications and dropdowns.
// NOTE: This file is already wrapped in a DOMContentLoaded handler.
// Adding another DOMContentLoaded listener here prevents these initializers
// from running (because the event has already fired).
initMobileMenuDropdowns();






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
            if (!header.classList.contains('active')) header.style.background = 'rgba(37, 99, 235, 0.05)';
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
    if (!navbar || !navbarBottom) return;

    const desktopMQ = window.matchMedia('(min-width: 768px)');
    let lastScrollY = 0;
    let ticking = false;

    const getClampedScrollY = () => {
        const raw = window.scrollY || window.pageYOffset || 0;
        const doc = document.documentElement;
        const scrollHeight = (doc && doc.scrollHeight) ? doc.scrollHeight : document.body.scrollHeight;
        const maxScroll = Math.max(0, scrollHeight - window.innerHeight);
        return Math.min(maxScroll, Math.max(0, raw));
    };

    const ensureMobileState = () => {
        // On mobile, do not toggle the bottom-row state. The :has() styling
        // can otherwise change header padding/height and cause jitter.
        if (!desktopMQ.matches) {
            navbarBottom.classList.remove('navbar-hidden');
        }
    };

    const updateNavbarBottom = () => {
        ticking = false;

        const currentScrollY = getClampedScrollY();
        const scrollDiff = currentScrollY - lastScrollY;

        // Header surface changes (stable even under overscroll bounce)
        if (currentScrollY > 10) {
            navbar.classList.add('shadow-md');
        } else {
            navbar.classList.remove('shadow-md');
        }

        // Mobile: keep stable height, skip bottom row toggling
        if (!desktopMQ.matches) {
            ensureMobileState();
            lastScrollY = currentScrollY;
            return;
        }

        // Desktop: avoid flicker on micro scrolls / trackpads
        const threshold = 12;
        if (Math.abs(scrollDiff) < threshold) {
            lastScrollY = currentScrollY;
            return;
        }

        if (currentScrollY <= 0 || scrollDiff < 0) {
            navbarBottom.classList.remove('navbar-hidden');
        } else if (scrollDiff > 0) {
            navbarBottom.classList.add('navbar-hidden');
        }

        lastScrollY = currentScrollY;
    };

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbarBottom);
            ticking = true;
        }
    };

    lastScrollY = getClampedScrollY();
    ensureMobileState();

    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
        ensureMobileState();
        lastScrollY = getClampedScrollY();
        updateNavbarBottom();
    };

    window.addEventListener('resize', onResize, { passive: true });
    if (desktopMQ.addEventListener) desktopMQ.addEventListener('change', onResize);

    updateNavbarBottom();
}

initNavbarBottomScroll();

// --- Header category dropdowns ---
function initHeaderCategoryDropdowns() {
    const dropdowns = Array.from(document.querySelectorAll('[data-nav-dropdown]'));
    if (dropdowns.length === 0) return;

    const hoverMediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const setState = (dropdown, isOpen) => {
        const trigger = dropdown.querySelector('.nav-dropdown-trigger');
        const panel = dropdown.querySelector('.nav-dropdown-panel');
        if (!trigger || !panel) return;
        dropdown.classList.toggle('is-open', isOpen);
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    };

    const closeAll = (except) => {
        dropdowns.forEach((dropdown) => {
            if (dropdown === except) return;
            setState(dropdown, false);
        });
    };

    dropdowns.forEach((dropdown) => {
        const trigger = dropdown.querySelector('.nav-dropdown-trigger');
        if (!trigger) return;
        setState(dropdown, false);
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            const isOpen = dropdown.classList.contains('is-open');
            closeAll(dropdown);
            setState(dropdown, !isOpen);
        });

        if (hoverMediaQuery.matches) {
            let hoverCloseTimer = null;
            const scheduleClose = () => {
                clearTimeout(hoverCloseTimer);
                hoverCloseTimer = setTimeout(() => setState(dropdown, false), 180);
            };

            dropdown.addEventListener('mouseenter', () => {
                clearTimeout(hoverCloseTimer);
                closeAll(dropdown);
                setState(dropdown, true);
            });
            dropdown.addEventListener('mouseleave', () => {
                scheduleClose();
            });
            const panel = dropdown.querySelector('.nav-dropdown-panel');
            if (panel) {
                panel.addEventListener('mouseenter', () => {
                    clearTimeout(hoverCloseTimer);
                });
                panel.addEventListener('mouseleave', () => {
                    scheduleClose();
                });
            }
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('[data-nav-dropdown]')) closeAll();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeAll();
    });

    window.addEventListener('resize', () => closeAll());
}
initHeaderCategoryDropdowns();

// --- Cart state (per product) + Header badge ---
const cartBtn = document.getElementById('cart-btn');
const cartBadge = document.getElementById('cart-count-badge');
const cartItems = new Map();
const favoritesSet = new Set();
const productCatalog = new Map();
const currencyFormatter = new Intl.NumberFormat('fa-IR');
const numberFormatter = new Intl.NumberFormat('fa-IR');
const cartMenu = document.getElementById('cart-menu');
const cartMenuItems = cartMenu?.querySelector('[data-cart-menu-items]');
const cartMenuCount = cartMenu?.querySelector('[data-cart-menu-count]');
const cartMenuTotal = cartMenu?.querySelector('[data-cart-menu-total]');
const cartMenuStatus = cartMenu?.querySelector('[data-cart-menu-status]');
const cartMenuWrapper = document.getElementById('cart-menu-wrapper');
let cartMenuOpen = false;
let cartHoverTimeout = null;
let cartMenuResizeRaf = 0;

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

function formatCurrency(value) {
    const normalized = Number(value ?? 0) || 0;
    return `${currencyFormatter.format(Math.round(normalized))} تومان`;
}

function parsePriceValue(value) {
    if (!value) return 0;
    const digits = String(value).replace(/[^\d]/g, '');
    return digits ? Number(digits) : 0;
}

function readCartDataset(key) {
    if (!cartMenu) return [];
    const raw = cartMenu.dataset?.[key];
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.warn('Failed to parse cart dataset:', err);
        return [];
    }
}

function normalizeCartData(list) {
    if (!Array.isArray(list)) return [];
    const items = [];
    list.forEach((entry) => {
        if (!entry) return;
        if (typeof entry === 'string') {
            const pid = entry.trim();
            if (pid) items.push({ pid, quantity: 1 });
            return;
        }
        const pid = String(entry.pid || entry.id || '').trim();
        if (!pid) return;
        const quantity = Math.max(1, Number(entry.quantity) || 1);
        const name = String(entry.name || entry.title || '').trim();
        const brand = String(entry.brand || '').trim();
        const rawPrice = entry.priceValue ?? entry.price ?? entry.unitPrice ?? 0;
        const priceValue = typeof rawPrice === 'number' ? rawPrice : parsePriceValue(rawPrice);
        const image = String(entry.image || entry.imageUrl || '').trim();
        items.push({ pid, quantity, name, brand, priceValue, image });
    });
    return items;
}

function seedCatalogFromItems(items) {
    items.forEach((item) => {
        if (!item?.pid) return;
        productCatalog.set(item.pid, {
            name: item.name || item.pid,
            brand: item.brand || '',
            priceValue: item.priceValue ?? 0,
            image: item.image || '',
        });
    });
}

function seedCartFromItems(items) {
    cartItems.clear();
    items.forEach((item) => {
        if (!item?.pid) return;
        cartItems.set(item.pid, { quantity: item.quantity || 1 });
    });
    seedCatalogFromItems(items);
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
                cartItems.clear();
                cartArray.forEach((entry) => {
                    if (!entry) return;
                    if (typeof entry === 'string') {
                        const pid = entry.trim();
                        if (pid) {
                            cartItems.set(pid, { quantity: 1 });
                        }
                        return;
                    }
                    const pid = entry.pid?.trim();
                    if (!pid) return;
                    const quantity = Math.max(1, Number(entry.quantity) || 1);
                    cartItems.set(pid, { quantity });
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
        const cartPayload = [];
        cartItems.forEach((info, pid) => {
            if (!pid) return;
            const quantity = Math.max(1, Number(info?.quantity) || 1);
            cartPayload.push({ pid, quantity });
        });
        if (cartPayload.length === 0) {
            localStorage.removeItem('mahanshop_cart');
        } else {
            localStorage.setItem('mahanshop_cart', JSON.stringify(cartPayload));
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

const cartDatasetItems = normalizeCartData(readCartDataset('cartItems'));
if (cartDatasetItems.length > 0) {
    seedCartFromItems(cartDatasetItems);
} else {
    loadCartFromStorage();
}
loadFavoritesFromStorage();

function renderCartMenu() {
    if (!cartMenu || !cartMenuItems || !cartMenuCount || !cartMenuTotal || !cartMenuStatus) return;
    const items = [];
    cartItems.forEach((payload, pid) => {
        const info = productCatalog.get(pid) || {};
        items.push({
            pid,
            quantity: Math.max(1, Number(payload?.quantity) || 1),
            name: info.name || pid || 'محصول',
            brand: info.brand || '',
            priceValue: info.priceValue ?? 0,
            image: info.image || '',
        });
    });
    const totalQty = items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0);
    cartMenuCount.textContent = `${totalQty} کالا`;
    cartMenuStatus.textContent = items.length ? '' : 'سبد خرید شما خالی است';
    cartMenuItems.innerHTML = '';
    if (items.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'text-xs text-gray-500 text-center';
        empty.textContent = 'هنوز کالایی به سبد اضافه نشده است.';
        cartMenuItems.appendChild(empty);
        cartMenuTotal.textContent = formatCurrency(0);
        return;
    }
    let subtotal = 0;
    items.forEach((item) => {
        const pid = item.pid;
        const priceValue = item.priceValue ?? 0;
        const quantity = Math.max(1, Number(item.quantity) || 1);
        subtotal += priceValue * quantity;

        const itemRow = document.createElement('div');
        itemRow.className = 'cart-menu-item';
        itemRow.dataset.pid = pid;

        const thumb = document.createElement('div');
        thumb.className = 'cart-menu-item-thumb';
        if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name || pid;
            img.loading = 'lazy';
            thumb.appendChild(img);
        } else {
            const icon = document.createElement('span');
            icon.className = 'material-icon text-[#2563EB] text-xl';
            icon.textContent = 'shopping_bag';
            thumb.appendChild(icon);
        }

        const meta = document.createElement('div');
        meta.className = 'flex-1 min-w-0';

        const title = document.createElement('p');
        title.className = 'text-sm font-semibold text-gray-900 truncate';
        title.textContent = item.name || pid || 'محصول';
        meta.appendChild(title);

        if (item.brand) {
            const brand = document.createElement('p');
            brand.className = 'text-[11px] text-gray-500 truncate';
            brand.textContent = item.brand;
            meta.appendChild(brand);
        }

        const price = document.createElement('p');
        price.className = 'cart-menu-price';
        price.textContent = priceValue ? formatCurrency(priceValue * quantity) : 'قیمت نامشخص';
        meta.appendChild(price);

        const footer = document.createElement('div');
        footer.className = 'cart-menu-item-footer';

        const qtyWrap = document.createElement('div');
        qtyWrap.className = 'cart-menu-qty';

        const minusBtn = document.createElement('button');
        minusBtn.type = 'button';
        minusBtn.className = 'cart-menu-qty-btn';
        minusBtn.dataset.cartMenuAction = 'dec';
        minusBtn.dataset.cartMenuPid = pid;
        minusBtn.setAttribute('aria-label', 'کاهش تعداد');
        minusBtn.innerHTML = '<span class="material-icon text-sm">remove</span>';

        const qtyValue = document.createElement('span');
        qtyValue.className = 'cart-menu-qty-value';
        qtyValue.textContent = numberFormatter.format(quantity);

        const plusBtn = document.createElement('button');
        plusBtn.type = 'button';
        plusBtn.className = 'cart-menu-qty-btn';
        plusBtn.dataset.cartMenuAction = 'inc';
        plusBtn.dataset.cartMenuPid = pid;
        plusBtn.setAttribute('aria-label', 'افزایش تعداد');
        plusBtn.innerHTML = '<span class="material-icon text-sm">add</span>';

        qtyWrap.appendChild(minusBtn);
        qtyWrap.appendChild(qtyValue);
        qtyWrap.appendChild(plusBtn);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'cart-menu-remove-btn ripple';
        removeBtn.setAttribute('aria-label', 'حذف از سبد خرید');
        removeBtn.dataset.cartMenuAction = 'remove';
        removeBtn.dataset.cartMenuPid = pid;
        removeBtn.innerHTML = '<span class="material-icon text-base">delete</span>';

        footer.appendChild(qtyWrap);
        footer.appendChild(removeBtn);
        meta.appendChild(footer);

        itemRow.appendChild(thumb);
        itemRow.appendChild(meta);
        cartMenuItems.appendChild(itemRow);
    });
    cartMenuTotal.textContent = formatCurrency(subtotal);
}

function renderCartBadge() {
    if (!cartBadge) return;
    let totalQty = 0;
    cartItems.forEach((info) => {
        totalQty += Math.max(1, Number(info?.quantity) || 1);
    });
    const n = totalQty;
    cartBadge.textContent = String(n);
    cartBadge.classList.toggle('hidden', n <= 0);
    renderCartMenu();
}
renderCartBadge();

function syncCartMenuPosition() {
    // Positioning is now handled by CSS relative to parent container
    if (!cartBtn || !cartMenu) return;
}

function openCartMenu() {
    if (!cartMenu) return;
    clearTimeout(cartHoverTimeout);
    syncCartMenuPosition();
    cartMenu.classList.add('is-open');
    cartMenu.setAttribute('aria-hidden', 'false');
    cartBtn?.setAttribute('aria-expanded', 'true');
    cartMenuOpen = true;
}

function closeCartMenu() {
    if (!cartMenu) return;
    cartHoverTimeout && clearTimeout(cartHoverTimeout);
    cartMenu.classList.remove('is-open');
    cartMenu.setAttribute('aria-hidden', 'true');
    cartBtn?.setAttribute('aria-expanded', 'false');
    cartMenuOpen = false;
}

function scheduleCartMenuClose(delay = 180) {
    if (!cartMenu) return;
    cartHoverTimeout && clearTimeout(cartHoverTimeout);
    cartHoverTimeout = setTimeout(() => {
        if (!cartMenu.matches(':hover') && !cartMenuWrapper?.matches(':hover')) {
            closeCartMenu();
        }
    }, delay);
}

function applyCartMenuAction(pid, action) {
    if (!pid || !action) return;
    const current = cartItems.get(pid)?.quantity ?? 1;
    if (action === 'remove') {
        cartItems.delete(pid);
    } else if (action === 'inc') {
        cartItems.set(pid, { quantity: current + 1 });
    } else if (action === 'dec') {
        cartItems.set(pid, { quantity: Math.max(1, current - 1) });
    } else {
        return;
    }
    renderCartBadge();
    saveCartToStorage();
}

function handleCartMenuAction(event) {
    const actionBtn = event.target.closest('[data-cart-menu-action]');
    if (!actionBtn || !cartMenu?.contains(actionBtn)) return;
    const action = actionBtn.dataset.cartMenuAction;
    const pid = actionBtn.dataset.cartMenuPid;
    if (!pid || !action) return;
    event.preventDefault();
    event.stopPropagation();
    cartHoverTimeout && clearTimeout(cartHoverTimeout);
    applyCartMenuAction(pid, action);
}

cartMenu?.addEventListener('click', handleCartMenuAction);

window.addEventListener('resize', () => {
    if (!cartMenuOpen) return;
    if (cartMenuResizeRaf) cancelAnimationFrame(cartMenuResizeRaf);
    cartMenuResizeRaf = requestAnimationFrame(() => {
        // Positioning is now handled by CSS relative to parent container
        cartMenuResizeRaf = 0;
    });
});

const hoverSupported = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (cartMenuWrapper && hoverSupported) {
    cartMenuWrapper.addEventListener('mouseenter', openCartMenu);
    cartMenuWrapper.addEventListener('mouseleave', () => scheduleCartMenuClose());
    cartMenu?.addEventListener('mouseenter', openCartMenu);
    cartMenu?.addEventListener('mouseleave', () => scheduleCartMenuClose());
}

document.addEventListener('click', (event) => {
    if (!cartMenu || !cartMenuOpen) return;
    if (event.target.closest('#cart-menu') || event.target.closest('#cart-btn')) return;
    closeCartMenu();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeCartMenu();
    }
});

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

        const inCart = cartItems.has(pid);
        if (!inCart) {
            cartItems.set(pid, { quantity: 1 });
            btn.classList.add('in-cart');
            if (iconEl) iconEl.textContent = 'remove_shopping_cart';
            renderCartBadge();
            saveCartToStorage();
        } else {
            cartItems.delete(pid);
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
        likeBtn.className = 'nav-icon-btn ripple product-like-btn w-10 h-10 rounded-2xl bg-white border border-gray-100 text-gray-700 flex items-center justify-center hover:bg-[#EFF6FF] transition';
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

    const cardPid = getCardPid(card);
    if (cardPid) {
        const cardName = (card.dataset.name || titleEl?.textContent || '').trim();
        const cardBrand = (card.dataset.brand || brandEl?.textContent || '').trim();
        const priceValue = parsePriceValue(card.dataset.price);
        const cardImage = card.dataset.image || card.querySelector('img')?.src || '';
        productCatalog.set(cardPid, {
            name: cardName || 'محصول',
            brand: cardBrand,
            priceValue,
            image: cardImage,
        });
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
    if (isIconBtn) circle.style.backgroundColor = 'rgba(37, 99, 235, 0.14)';
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
        if (pid && !cartItems.has(pid)) {
            cartItems.set(pid, { quantity: 1 });
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

// Enhanced keyboard navigation for mobile menu
function initMobileMenuKeyboardNav() {
    if (!mobileMenu) return;

    // Focus management when menu opens
    mobileMenu.addEventListener('transitionend', function(e) {
        if (e.propertyName === 'transform' && !mobileMenu.classList.contains('translate-x-full')) {
            // Menu is now open, focus on the first focusable element
            const firstFocusable = mobileMenu.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    });

    // Trap focus inside the menu when it's open
    mobileMenu.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const focusableElements = mobileMenu.querySelectorAll(
                'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
}

if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', toggleMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMenu);

// When a user taps a link inside the drawer, close the drawer.
// This fixes cases where the overlay/state remains open and improves UX on mobile.
if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        // Don't interfere with dropdown toggles (they are not anchors today,
        // but keep this guard to avoid future regressions).
        if (e.target.closest('.mobile-dropdown-header')) return;

        closeMenu();
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
});

// Initialize keyboard navigation
initMobileMenuKeyboardNav();

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
  }

  function __boot() {
    const layoutReady = window.__layoutReady;
    if (layoutReady && typeof layoutReady.then === "function") {
      layoutReady.then(__mahanInit).catch(__mahanInit);
    } else {
      __mahanInit();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", __boot);
  } else {
    __boot();
  }
})();
