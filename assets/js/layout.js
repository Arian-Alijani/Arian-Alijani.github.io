(function () {
  'use strict';

  let resolveReady;
  window.__layoutReady = new Promise((resolve) => {
    resolveReady = resolve;
  });

  const includeEls = Array.from(document.querySelectorAll('[data-include]'));
  if (includeEls.length === 0) {
    resolveReady?.();
    return;
  }

  const candidateBases = ['.', '..', '../..', '../../..', '../../../..', '../../../../..'];

  const normalizeTemplate = (html, base) => (html || '').replaceAll('{{base}}', base);

  const fetchPartial = async (base, partName) => {
    const url = `${base}/partials/${partName}.html`;
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) {
      const err = new Error(`Failed to load ${url} (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return normalizeTemplate(await res.text(), base);
  };

  const resolveBase = async () => {
    // Probe using the first required partial to avoid brittle path heuristics.
    const firstPart = includeEls[0].getAttribute('data-include') || 'header';

    for (const base of candidateBases) {
      try {
        await fetchPartial(base, firstPart);
        return base;
      } catch {
        // try next
      }
    }

    // Fallback to legacy heuristic.
    const path = window.location.pathname || '';
    if (/\/pages\//.test(path)) return '..';
    return '.';
  };

  const injectIncludes = async () => {
    const base = await resolveBase();
    window.__mahanBase = base;

    const tasks = includeEls.map(async (el) => {
      const partName = el.getAttribute('data-include');
      if (!partName) return;

      try {
        const html = await fetchPartial(base, partName);
        el.innerHTML = html;
      } catch (err) {
        el.innerHTML = '';
        // eslint-disable-next-line no-console
        console.error(`[layout] Failed to inject ${partName}:`, err);
      }
    });

    await Promise.all(tasks);

    // Fixed header offset helper (used by filter drawer, overlays, etc.)
    const updateNavbarHeight = () => {
      const navbar = document.getElementById('navbar');
      if (!navbar) return;
      const height = Math.max(0, Math.round(navbar.getBoundingClientRect().height));
      if (height) document.documentElement.style.setProperty('--navbar-height', `${height}px`);
    };

    // Active navigation (desktop + mobile)
    const resolvePageId = () => {
      const pathname = window.location.pathname || '';
      const file = pathname.split('/').filter(Boolean).pop() || 'index.html';
      const fileLower = String(file).toLowerCase();

      // GitHub Pages often serves the home page at /<repo>/ (no filename)
      if (pathname.endsWith('/') || !fileLower.includes('.') || fileLower === '' || fileLower === 'index.html') return 'home';
      if (fileLower === 'products.html' || fileLower === 'product-detail.html') return 'products';
      if (fileLower === 'about-us.html') return 'contact';
      return null;
    };

    const setActiveNav = () => {
      const pageId = resolvePageId();
      if (!pageId) return;

      document.querySelectorAll('[data-nav-id]').forEach((link) => {
        const id = link.getAttribute('data-nav-id');
        link.classList.toggle('active', id === pageId);
      });
    };

    try {
      updateNavbarHeight();
      setActiveNav();
    } catch {
      // ignore
    }

    try {
      const navbar = document.getElementById('navbar');
      if (navbar && 'ResizeObserver' in window) {
        const ro = new ResizeObserver(() => updateNavbarHeight());
        ro.observe(navbar);
      } else {
        window.addEventListener('resize', updateNavbarHeight, { passive: true });
      }
    } catch {
      // ignore
    }

    resolveReady?.();
  };

  injectIncludes();
})();
