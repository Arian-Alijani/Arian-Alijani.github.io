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
          } : undefined,
          showCloseButton: false
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

  function removeFromCart(pid) {
    try {
      if (typeof cartItems !== 'undefined' && cartItems && cartItems.delete) {
        cartItems.delete(pid);

        if (typeof saveCartToStorage === 'function') saveCartToStorage();
        if (typeof renderCartBadge === 'function') renderCartBadge();
        return;
      }
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem('mahanshop_cart');
      if (!raw) return;
      const arr = JSON.parse(raw);
      const list = Array.isArray(arr) ? arr : [];
      const next = list.filter(item => (item?.pid || item) !== pid);
      if (next.length === 0) localStorage.removeItem('mahanshop_cart');
      else localStorage.setItem('mahanshop_cart', JSON.stringify(next));
    } catch { /* ignore */ }
  }

  function initAddToCart(pid) {
    const btn = document.getElementById('add-to-cart-btn');
    const qtyInput = document.getElementById('qty-input');
    const qtyRow = document.getElementById('qty-row');
    if (!btn || !qtyInput) return;

    const label = btn.querySelector('[data-cta-label]');
    const icon = btn.querySelector('.pd-cta__icon');

    const setLabel = (text) => {
      if (label) label.textContent = text;
      else btn.textContent = text;
    };

    const pulseBtn = () => {
      btn.classList.remove('pd-cta--pulse');
      void btn.offsetWidth;
      btn.classList.add('pd-cta--pulse');
    };

    const setBtnState = () => {
      const inCart = isInCart(pid);
      btn.classList.toggle('pd-cta--remove', inCart);
      setLabel(inCart ? 'حذف از سبد خرید' : 'افزودن به سبد خرید');
      if (icon) icon.textContent = inCart ? 'delete' : 'shopping_cart';
      if (qtyRow) {
        qtyRow.classList.toggle('is-visible', inCart);
        qtyRow.setAttribute('aria-hidden', inCart ? 'false' : 'true');
      }
      if (!inCart) qtyInput.value = '1';
    };

    setBtnState();

    btn.addEventListener('click', () => {
      const inCart = isInCart(pid);

      if (inCart) {
        removeFromCart(pid);
        setBtnState();
        pulseBtn();

        if (window.mahanToast && typeof window.mahanToast.show === 'function') {
          window.mahanToast.show({
            type: 'danger',
            title: 'از سبد خرید حذف شد',
            icon: 'delete',
            duration: 2500,
            showCloseButton: false
          });
        }
        return;
      }

      const qty = clampQty(qtyInput.value);
      addToCart(pid, qty);
      setBtnState();
      pulseBtn();

      if (window.mahanToast && typeof window.mahanToast.show === 'function') {
        window.mahanToast.show({
          type: 'success',
          title: 'به سبد خرید اضافه شد',
          icon: 'check_circle',
          duration: 2500,
          showCloseButton: false
        });
      }
    });
  }

  function initGallery() {
    const mainImg = document.getElementById('main-product-image');
    const thumbWrap = document.querySelector('.pd-thumbs');
    let thumbs = Array.from(document.querySelectorAll('.pd-thumb'));
    const prevBtn = document.querySelector('.pd-nav-btn--prev');
    const nextBtn = document.querySelector('.pd-nav-btn--next');

    if (!mainImg) return;

    const readGalleryImages = () => {
      const root = document.getElementById('product-root');
      const raw = root?.dataset?.images || root?.dataset?.gallery || '';
      if (!raw) return [];

      const trimmed = raw.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
          return [];
        }
      }

      return trimmed.split(/[|,]/).map(s => s.trim()).filter(Boolean);
    };

    const renderThumbs = (images) => {
      if (!thumbWrap || images.length === 0) return;
      thumbWrap.innerHTML = '';
      images.forEach((src, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `pd-thumb${i === 0 ? ' is-active' : ''}`;
        btn.setAttribute('data-full-src', src);
        btn.setAttribute('aria-label', `تصویر ${i + 1}`);

        const img = document.createElement('img');
        img.src = src;
        img.alt = `نمای ${i + 1}`;
        img.loading = 'lazy';
        btn.appendChild(img);
        thumbWrap.appendChild(btn);
      });
    };

    const dataImages = readGalleryImages();
    if (dataImages.length > 0) {
      if (!mainImg.getAttribute('src')) mainImg.setAttribute('src', dataImages[0]);
      renderThumbs(dataImages);
      thumbs = Array.from(document.querySelectorAll('.pd-thumb'));
    }

    const hasThumbs = thumbs.length > 0;
    let index = Math.max(0, thumbs.findIndex(t => t.classList.contains('is-active')));
    if (index < 0) index = 0;

    const setActive = (i) => {
      if (!hasThumbs) {
        index = 0;
        return;
      }

      const nextIndex = (i + thumbs.length) % thumbs.length;
      index = nextIndex;

      thumbs.forEach((t, k) => t.classList.toggle('is-active', k === index));
      const src = thumbs[index].getAttribute('data-full-src');
      if (src) swapMainImage(src);
    };

    if (hasThumbs) {
      thumbs.forEach((btn, i) => {
        btn.addEventListener('click', () => setActive(i));
      });
    }

    prevBtn?.addEventListener('click', () => setActive(index - 1));
    nextBtn?.addEventListener('click', () => setActive(index + 1));

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') setActive(index + 1);
      if (e.key === 'ArrowRight') setActive(index - 1);
    });

    const lightbox = document.getElementById('pd-lightbox');
    const lightboxImg = document.getElementById('pd-lightbox-image');
    const lightboxCounter = document.getElementById('pd-lightbox-counter');
    const lightboxLoader = document.getElementById('pd-lightbox-loader');
    const lightboxPrev = lightbox?.querySelector('[data-lightbox-prev]');
    const lightboxNext = lightbox?.querySelector('[data-lightbox-next]');
    const lightboxClose = Array.from(lightbox?.querySelectorAll('[data-lightbox-close]') || []);

    if (!lightbox || !lightboxImg) return;

    let zoom = 1;
    let translateX = 0;
    let translateY = 0;
    let baseWidth = 0;
    let baseHeight = 0;
    let isDragging = false;
    let suppressClick = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragOriginX = 0;
    let dragOriginY = 0;
    let lastFocused = null;
    let mainSwapTimer = 0;
    let lightboxSwapTimer = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let isPinching = false;
    let pinchStartDist = 0;
    let pinchStartZoom = 1;
    const minZoom = 1;
    const maxZoom = 3;

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(lightbox.querySelectorAll(focusableSelector))
      .filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

    const focusFirstElement = () => {
      const focusables = getFocusable();
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        lightbox.focus();
      }
    };

    const trapFocus = (e) => {
      if (e.key !== 'Tab') return;
      if (!lightbox.classList.contains('is-open')) return;
      const focusables = getFocusable();
      if (focusables.length === 0) {
        e.preventDefault();
        lightbox.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const applyTransform = () => {
      lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
      lightboxImg.style.cursor = zoom > 1 ? 'grab' : 'zoom-in';
    };

    const swapMainImage = (src) => {
      if (!src) return;
      if (mainSwapTimer) clearTimeout(mainSwapTimer);
      mainImg.classList.add('is-fading');
      mainSwapTimer = window.setTimeout(() => {
        mainImg.setAttribute('src', src);
        const reveal = () => requestAnimationFrame(() => mainImg.classList.remove('is-fading'));
        if (mainImg.complete) {
          requestAnimationFrame(reveal);
        } else {
          mainImg.onload = reveal;
        }
      }, 120);
    };

    const toggleBackground = (hidden) => {
      const siblings = Array.from(document.body.children).filter((el) => el !== lightbox);
      siblings.forEach((el) => {
        if (hidden) {
          if (!el.hasAttribute('data-lightbox-aria')) {
            const prev = el.getAttribute('aria-hidden');
            el.setAttribute('data-lightbox-aria', prev === null ? '' : prev);
          }
          el.setAttribute('aria-hidden', 'true');
          if ('inert' in el) el.inert = true;
        } else {
          if (el.hasAttribute('data-lightbox-aria')) {
            const prev = el.getAttribute('data-lightbox-aria');
            if (prev === '') el.removeAttribute('aria-hidden');
            else el.setAttribute('aria-hidden', prev);
            el.removeAttribute('data-lightbox-aria');
          }
          if ('inert' in el) el.inert = false;
        }
      });
    };

    const updateBaseSize = () => {
      const rect = lightboxImg.getBoundingClientRect();
      baseWidth = rect.width;
      baseHeight = rect.height;
    };

    const clampTranslate = () => {
      if (zoom <= minZoom) {
        translateX = 0;
        translateY = 0;
        return;
      }
      const maxX = Math.max(0, (baseWidth * zoom - baseWidth) / 2);
      const maxY = Math.max(0, (baseHeight * zoom - baseHeight) / 2);
      translateX = Math.max(-maxX, Math.min(maxX, translateX));
      translateY = Math.max(-maxY, Math.min(maxY, translateY));
    };

    const resetZoom = () => {
      zoom = minZoom;
      translateX = 0;
      translateY = 0;
      applyTransform();
    };

    const toggleZoom = () => {
      if (zoom > minZoom) {
        resetZoom();
      } else {
        zoom = Math.min(2, maxZoom);
        clampTranslate();
        applyTransform();
      }
    };

    const images = (hasThumbs ? thumbs : [])
      .map((t) => t.getAttribute('data-full-src') || t.querySelector('img')?.getAttribute('src'))
      .filter(Boolean);
    if (images.length === 0) {
      const fallback = mainImg.getAttribute('src');
      if (fallback) images.push(fallback);
    }

    const updateLightbox = (i) => {
      if (images.length === 0) return;
      const nextIndex = (i + images.length) % images.length;
      index = nextIndex;
      if (hasThumbs) setActive(index);
      if (lightboxLoader) lightboxLoader.classList.add('is-visible');
      lightboxImg.classList.add('is-fading');
      if (lightboxSwapTimer) clearTimeout(lightboxSwapTimer);
      lightboxSwapTimer = window.setTimeout(() => {
        lightboxImg.setAttribute('src', images[index]);
        lightboxImg.setAttribute('draggable', 'false');
      }, 120);
      if (lightboxCounter) lightboxCounter.textContent = `${index + 1} / ${images.length}`;

      const isSingle = images.length <= 1;
      if (lightboxPrev) lightboxPrev.disabled = isSingle;
      if (lightboxNext) lightboxNext.disabled = isSingle;

      const sync = () => {
        updateBaseSize();
        resetZoom();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => lightboxImg.classList.remove('is-fading'));
        });
        if (lightboxLoader) lightboxLoader.classList.remove('is-visible');
      };

      if (lightboxImg.complete) {
        requestAnimationFrame(sync);
      } else {
        lightboxImg.onload = () => requestAnimationFrame(sync);
      }
    };

    const openLightbox = (i) => {
      lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('pd-lightbox-open');
      toggleBackground(true);
      requestAnimationFrame(() => updateLightbox(i));
      requestAnimationFrame(() => focusFirstElement());
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('pd-lightbox-open');
      toggleBackground(false);
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    };

    mainImg.addEventListener('click', () => openLightbox(index));
    lightboxPrev?.addEventListener('click', () => updateLightbox(index - 1));
    lightboxNext?.addEventListener('click', () => updateLightbox(index + 1));
    lightboxClose.forEach((btn) => btn.addEventListener('click', closeLightbox));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    lightboxImg.addEventListener('click', () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      toggleZoom();
    });
    lightboxImg.addEventListener('pointerdown', (e) => {
      if (zoom <= minZoom) return;
      isDragging = true;
      suppressClick = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragOriginX = translateX;
      dragOriginY = translateY;
      lightboxImg.setPointerCapture(e.pointerId);
      lightboxImg.style.cursor = 'grabbing';
      e.preventDefault();
    });
    lightboxImg.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      translateX = dragOriginX + dx;
      translateY = dragOriginY + dy;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) suppressClick = true;
      clampTranslate();
      applyTransform();
    });
    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      lightboxImg.releasePointerCapture(e.pointerId);
      lightboxImg.style.cursor = zoom > 1 ? 'grab' : 'zoom-in';
    };
    lightboxImg.addEventListener('pointerup', endDrag);
    lightboxImg.addEventListener('pointercancel', endDrag);
    lightboxImg.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      if (e.touches.length === 2) {
        isPinching = true;
        const [t1, t2] = e.touches;
        pinchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        pinchStartZoom = zoom;
        updateBaseSize();
        return;
      }
      isPinching = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    lightboxImg.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length < 2 || !isPinching) return;
      const [t1, t2] = e.touches;
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (pinchStartDist <= 0) return;
      const scale = dist / pinchStartDist;
      zoom = Math.max(minZoom, Math.min(maxZoom, pinchStartZoom * scale));
      clampTranslate();
      applyTransform();
      e.preventDefault();
    }, { passive: false });
    lightboxImg.addEventListener('touchend', (e) => {
      if (isPinching && (!e.touches || e.touches.length < 2)) {
        isPinching = false;
        clampTranslate();
        applyTransform();
        return;
      }
      if (zoom > minZoom) return;
      const endTouch = e.changedTouches && e.changedTouches[0];
      if (!endTouch) return;
      const dx = endTouch.clientX - touchStartX;
      const dy = endTouch.clientY - touchStartY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) updateLightbox(index + 1);
      else updateLightbox(index - 1);
    }, { passive: true });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      trapFocus(e);
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') updateLightbox(index + 1);
      if (e.key === 'ArrowRight') updateLightbox(index - 1);
    });
    window.addEventListener('resize', () => {
      if (!lightbox.classList.contains('is-open')) return;
      updateBaseSize();
      if (zoom <= 1) resetZoom();
      else {
        clampTranslate();
        applyTransform();
      }
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

  function initBuyBoxScroll() {
    const buyBox = document.querySelector('.pd-buy');
    if (!buyBox) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const scrolled = (window.scrollY || 0) > 20;
      buyBox.classList.toggle('is-scrolled', scrolled);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
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
    initBuyBoxScroll();
  });
})();



