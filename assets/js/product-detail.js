/* Product Detail page logic:
   - gallery (thumbs + prev/next)
   - tabs (intro/specs)
   - specs show more (5 rows)
   - favorites toggle (compatible with global script.js)
   - add to cart (compatible with global script.js)
*/

(function () {
  'use strict';

  function safeNumber(val, fallback = 1) {
    const n = Number(String(val ?? '').replace(/[^\d]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  function clampQty(n) {
    const num = safeNumber(n, 1);
    return Math.max(1, Math.min(99, num));
  }

  function getPid() {
    const root = document.getElementById('product-root');
    const fromDom = root?.dataset?.pid?.trim();
    if (fromDom) return fromDom;

    const url = new URL(window.location.href);
    const pidParam = url.searchParams.get('pid');
    return pidParam ? pidParam.trim() : 'product_unknown';
  }

  function seedCatalogForCart(pid) {
    // Works when script.js is loaded (global lexical bindings exist)
    try {
      const titleEl = document.getElementById('product-title');
      const brandEl = document.getElementById('product-brand');
      const priceEl = document.getElementById('product-price');
      const imgEl = document.getElementById('main-product-image');

      const name = titleEl?.textContent?.trim() || pid;
      const brand = brandEl?.textContent?.trim() || '';
      const priceValue = safeNumber(priceEl?.dataset?.price || priceEl?.textContent, 0);
      const image = imgEl?.getAttribute('src') || '';

      if (typeof productCatalog !== 'undefined' && productCatalog && productCatalog.set) {
        productCatalog.set(pid, { name, brand, priceValue, image });
      }
    } catch {
      // no-op (page still works even if global catalog is not available)
    }
  }

  function initFavorites(pid) {
    const likeBtn = document.getElementById('favorite-toggle');
    if (!likeBtn) return;

    const applyState = (isFav) => {
      if (typeof setFavoriteButtonState === 'function') {
        setFavoriteButtonState(likeBtn, isFav);
      } else {
        likeBtn.classList.toggle('is-favorite', isFav);
        likeBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
        const icon = likeBtn.querySelector('.material-icon');
        if (icon) icon.textContent = isFav ? 'favorite' : 'favorite_border';
      }
    };

    const readFav = () => {
      try {
        if (typeof favoritesSet !== 'undefined' && favoritesSet && favoritesSet.has) {
          return favoritesSet.has(pid);
        }
      } catch { /* ignore */ }

      // fallback localStorage
      try {
        const raw = localStorage.getItem('mahanshop_favorites');
        if (!raw) return false;
        const arr = JSON.parse(raw);
        return Array.isArray(arr) && arr.includes(pid);
      } catch {
        return false;
      }
    };

    const writeFav = (nextFav) => {
      try {
        if (typeof favoritesSet !== 'undefined' && favoritesSet) {
          if (nextFav) favoritesSet.add(pid);
          else favoritesSet.delete(pid);

          if (typeof saveFavoritesToStorage === 'function') saveFavoritesToStorage();
          return;
        }
      } catch { /* ignore */ }

      // fallback localStorage
      try {
        const raw = localStorage.getItem('mahanshop_favorites');
        const arr = raw ? JSON.parse(raw) : [];
        const set = new Set(Array.isArray(arr) ? arr : []);
        if (nextFav) set.add(pid);
        else set.delete(pid);
        localStorage.setItem('mahanshop_favorites', JSON.stringify(Array.from(set)));
      } catch { /* ignore */ }
    };

    applyState(readFav());

    likeBtn.addEventListener('click', () => {
      const current = readFav();
      const next = !current;
      writeFav(next);
      applyState(next);

      // Toast
      if (window.mahanToast && typeof window.mahanToast.show === 'function') {
        window.mahanToast.show({
          type: next ? 'favorite' : 'danger',
          title: next ? 'به محبوب‌ها اضافه شد' : 'از محبوب‌ها حذف شد',
          icon: 'favorite',
          duration: next ? 2500 : 6000,
          action: !next ? {
            label: 'بازگردانی',
            onClick: () => {
              writeFav(true);
              applyState(true);
            }
          } : undefined
        });
      }
    });
  }

  function initQty() {
    const wrap = document.querySelector('.pd-qty');
    const input = document.getElementById('qty-input');
    if (!wrap || !input) return;

    const normalize = () => { input.value = String(clampQty(input.value)); };

    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-qty]');
      if (!btn) return;
      const action = btn.getAttribute('data-qty');
      const current = clampQty(input.value);

      if (action === 'inc') input.value = String(clampQty(current + 1));
      if (action === 'dec') input.value = String(clampQty(current - 1));
    });

    input.addEventListener('input', normalize);
    input.addEventListener('blur', normalize);
  }

  function isInCart(pid) {
    try {
      if (typeof cartItems !== 'undefined' && cartItems && cartItems.get) {
        return cartItems.has(pid);
      }
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem('mahanshop_cart');
      if (!raw) return false;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) && arr.some(x => (x?.pid || x) === pid);
    } catch {
      return false;
    }
  }

  function addToCart(pid, qty) {
    const quantity = clampQty(qty);

    // Prefer global cart map + renderer if available
    try {
      if (typeof cartItems !== 'undefined' && cartItems && cartItems.set) {
        const current = cartItems.get(pid)?.quantity ?? 0;
        const nextQty = Math.max(1, Number(current) || 0) + quantity;
        cartItems.set(pid, { quantity: nextQty });

        if (typeof saveCartToStorage === 'function') saveCartToStorage();
        if (typeof renderCartBadge === 'function') renderCartBadge();

        if (typeof openCartMenu === 'function') openCartMenu();
        return;
      }
    } catch { /* ignore */ }

    // Fallback localStorage
    try {
      const raw = localStorage.getItem('mahanshop_cart');
      const arr = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(arr) ? arr : [];
      const idx = list.findIndex(x => (x?.pid || x) === pid);

      if (idx >= 0) {
        const item = list[idx];
        const cur = Number(item?.quantity) || 1;
        list[idx] = { pid, quantity: cur + quantity };
      } else {
        list.push({ pid, quantity });
      }

      localStorage.setItem('mahanshop_cart', JSON.stringify(list));
    } catch { /* ignore */ }
  }

  function initAddToCart(pid) {
    const btn = document.getElementById('add-to-cart-btn');
    const qtyInput = document.getElementById('qty-input');
    if (!btn || !qtyInput) return;

    const setBtnState = () => {
      const inCart = isInCart(pid);
      if (inCart) {
        btn.textContent = 'در سبد خرید است (افزودن مجدد)';
        btn.classList.add('opacity-95');
      } else {
        btn.textContent = 'افزودن به سبد خرید';
        btn.classList.remove('opacity-95');
      }
    };

    setBtnState();

    btn.addEventListener('click', () => {
      const qty = clampQty(qtyInput.value);
      addToCart(pid, qty);
      setBtnState();

      if (window.mahanToast && typeof window.mahanToast.show === 'function') {
        window.mahanToast.show({
          type: 'success',
          title: 'به سبد خرید اضافه شد',
          icon: 'check_circle',
          duration: 2500
        });
      }
    });
  }

  function initGallery() {
    const mainImg = document.getElementById('main-product-image');
    const thumbs = Array.from(document.querySelectorAll('.pd-thumb'));
    const prevBtn = document.querySelector('.pd-nav-btn--prev');
    const nextBtn = document.querySelector('.pd-nav-btn--next');

    if (!mainImg || thumbs.length === 0) return;

    let index = Math.max(0, thumbs.findIndex(t => t.classList.contains('is-active')));
    if (index < 0) index = 0;

    const setActive = (i) => {
      const nextIndex = (i + thumbs.length) % thumbs.length;
      index = nextIndex;

      thumbs.forEach((t, k) => t.classList.toggle('is-active', k === index));
      const src = thumbs[index].getAttribute('data-full-src');
      if (src) mainImg.setAttribute('src', src);
    };

    thumbs.forEach((btn, i) => {
      btn.addEventListener('click', () => setActive(i));
    });

    prevBtn?.addEventListener('click', () => setActive(index - 1));
    nextBtn?.addEventListener('click', () => setActive(index + 1));

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') setActive(index + 1);
      if (e.key === 'ArrowRight') setActive(index - 1);
    });
  }

  function initTabs() {
    const tabs = Array.from(document.querySelectorAll('.pd-tab'));
    const panels = {
      desc: document.getElementById('tab-desc'),
      specs: document.getElementById('tab-specs')
    };

    if (tabs.length === 0) return;

    const activate = (key) => {
      tabs.forEach(t => {
        const isActive = t.getAttribute('data-tab') === key;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      Object.entries(panels).forEach(([k, el]) => {
        if (!el) return;
        el.classList.toggle('hidden', k !== key);
      });
    };

    tabs.forEach(t => {
      t.addEventListener('click', () => activate(t.getAttribute('data-tab')));
    });
  }

  function initSpecsShowMore() {
    const list = document.getElementById('specs-list');
    const toggle = document.getElementById('specs-toggle');
    if (!list || !toggle) return;

    const rows = Array.from(list.querySelectorAll('.pd-spec'));
    if (rows.length <= 5) return;

    let expanded = false;

    const apply = () => {
      rows.forEach((row, idx) => {
        row.classList.toggle('hidden', !expanded && idx >= 5);
      });
      toggle.textContent = expanded ? 'مشاهده کمتر' : 'مشاهده بیشتر';
    };

    toggle.classList.remove('hidden');
    apply();

    toggle.addEventListener('click', () => {
      expanded = !expanded;
      apply();
    });
  }

  function initColorSync() {
    const label = document.getElementById('selected-color-label');
    const priceColor = document.getElementById('price-color-label');
    const radios = Array.from(document.querySelectorAll('input[name="color"]'));
    if (!label || radios.length === 0) return;

    const set = (v) => {
      label.textContent = v;
      if (priceColor) priceColor.textContent = v;
    };

    const checked = radios.find(r => r.checked);
    if (checked) set(checked.value);

    radios.forEach(r => {
      r.addEventListener('change', () => { if (r.checked) set(r.value); });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const pid = getPid();

    // Keep breadcrumb up-to-date
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    const title = document.getElementById('product-title')?.textContent?.trim();
    if (breadcrumbTitle && title) breadcrumbTitle.textContent = title;

    seedCatalogForCart(pid);
    initFavorites(pid);
    initQty();
    initAddToCart(pid);

    initGallery();
    initTabs();
    initSpecsShowMore();
    initColorSync();
  });
})();
