/* ═══════════════════════════════════════════════════════════════
   The Point News — main.js
   All handlers wired via addEventListener — no inline onclick.
═══════════════════════════════════════════════════════════════ */

/* ── Dark Mode ──────────────────────────────────────────────────── */
const ThemeManager = {
  init() {
    // Apply saved preference (also done inline in <head> to avoid FOUC,
    // but we re-apply here to keep the icon state correct)
    const saved = localStorage.getItem('tpn-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.updateIcon();

    // Wire the toggle button — no inline onclick needed
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
    }
  },

  toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('tpn-theme', isDark ? 'dark' : 'light');
    this.updateIcon();
  },

  updateIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    const sun  = document.querySelector('#theme-toggle .icon-sun');
    const moon = document.querySelector('#theme-toggle .icon-moon');
    if (sun)  sun.classList.toggle('hidden',  isDark);
    if (moon) moon.classList.toggle('hidden', !isDark);
  }
};

/* ── Mobile Nav ─────────────────────────────────────────────────── */
const MobileNav = {
  init() {
    const openBtn  = document.getElementById('mobile-open');
    const closeBtn = document.getElementById('mobile-close');
    const menu     = document.getElementById('mobile-menu');
    const overlay  = document.getElementById('mobile-overlay');
    if (!menu) return;

    const openMenu = () => {
      menu.classList.remove('hidden');
      overlay.classList.remove('hidden');
      // Small rAF so the transition plays after display:block
      requestAnimationFrame(() => menu.classList.add('open'));
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      menu.classList.remove('open');
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
      // Re-hide after transition
      menu.addEventListener('transitionend', () => {
        if (!menu.classList.contains('open')) menu.classList.add('hidden');
      }, { once: true });
    };

    openBtn?.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }
};

/* ── Search ─────────────────────────────────────────────────────── */
const Search = {
  data: null,
  lang: 'en',

  async init() {
    const toggleBtn = document.getElementById('search-toggle');
    const closeBtn  = document.getElementById('search-close');
    const modal     = document.getElementById('search-modal');
    const input     = document.getElementById('search-input');
    if (!modal) return;

    // Detect current language from URL path
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (['en', 'tl', 'cb'].includes(pathParts[0])) this.lang = pathParts[0];

    const openSearch = () => {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input?.focus(), 50);
    };

    const closeSearch = () => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    };

    toggleBtn?.addEventListener('click', openSearch);
    closeBtn?.addEventListener('click', closeSearch);

    // Click outside modal content closes it
    modal.addEventListener('click', e => {
      if (e.target === modal) closeSearch();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeSearch();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    });

    input?.addEventListener('input', () => this.handleInput(input.value));
  },

  async fetchData() {
    if (this.data) return;
    try {
      const res  = await fetch(`/${this.lang}/index.json`);
      this.data  = await res.json();
    } catch {
      this.data = [];
    }
  },

  async handleInput(query) {
    const resultsEl = document.getElementById('search-results');
    if (!resultsEl) return;
    const q = query.trim().toLowerCase();

    if (!q) {
      resultsEl.innerHTML = '<p class="text-sm text-gray-400 p-4 text-center">Type to search…</p>';
      return;
    }

    await this.fetchData();

    const matches = (this.data || [])
      .filter(item =>
        (item.title  || '').toLowerCase().includes(q) ||
        (item.desc   || '').toLowerCase().includes(q) ||
        (item.author || '').toLowerCase().includes(q)
      )
      .slice(0, 8);

    if (!matches.length) {
      resultsEl.innerHTML = `<p class="text-sm text-gray-400 p-4 text-center">No results for "<strong>${this.escHtml(query)}</strong>"</p>`;
      return;
    }

    resultsEl.innerHTML = matches.map(item => `
      <a href="${item.url}" class="search-result-item group">
        <div class="flex-1 min-w-0">
          <span class="inline-block text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-1 badge-${item.section || 'world'}">${item.section || 'news'}</span>
          <p class="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand transition-colors">${this.highlight(item.title || '', q)}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">${this.highlight(item.desc || '', q)}</p>
          <p class="text-xs text-gray-400 mt-1">${item.author ? `By ${item.author} · ` : ''}${item.date || ''}</p>
        </div>
        <svg class="w-4 h-4 text-gray-300 group-hover:text-brand shrink-0 self-center transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </a>
    `).join('');

    // Wire close on result click
    resultsEl.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        document.getElementById('search-modal')?.classList.add('hidden');
        document.body.style.overflow = '';
      });
    });
  },

  highlight(text, q) {
    if (!q) return this.escHtml(text);
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    return this.escHtml(text).replace(re, '<mark class="bg-accent/40 dark:bg-accent/30 rounded px-0.5">$1</mark>');
  },

  escHtml(str) {
    return (str || '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }
};

/* ── Language Dropdown ──────────────────────────────────────────── */
const LangDropdown = {
  init() {
    const btn      = document.getElementById('lang-btn');
    const dropdown = document.getElementById('lang-dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = !dropdown.classList.contains('hidden');
      dropdown.classList.toggle('hidden', isOpen);
    });

    document.addEventListener('click', () => dropdown.classList.add('hidden'));
  }
};

/* ── Sticky Nav shadow on scroll ────────────────────────────────── */
const StickyNav = {
  init() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle('shadow-lg',          window.scrollY > 60);
      nav.classList.toggle('shadow-black/20',    window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
};

/* ── Reading Progress Bar ───────────────────────────────────────── */
const ReadingProgress = {
  init() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const doc      = document.documentElement;
      const scrolled = doc.scrollTop;
      const total    = doc.scrollHeight - doc.clientHeight;
      bar.style.width = total > 0 ? `${Math.min(100, (scrolled / total) * 100)}%` : '0%';
    }, { passive: true });
  }
};

/* ── Copy-Link buttons (data-copy-url) ──────────────────────────── */
const CopyButtons = {
  init() {
    document.querySelectorAll('[data-copy-url]').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.copyUrl;
        navigator.clipboard.writeText(url).then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = `<svg class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>`;
          setTimeout(() => { btn.innerHTML = orig; }, 2000);
        }).catch(() => {
          // Fallback for non-https
          prompt('Copy this link:', url);
        });
      });
    });
  }
};

/* ── Sponsors Carousel (CSS animation, JS just duplicates items) ── */
const SponsorsCarousel = {
  init() {
    // Items are already duplicated in the Hugo template for pure-CSS looping.
    // Nothing extra needed unless JS-only duplication is desired.
  }
};

/* ── Breaking News Ticker (pure CSS animation) ──────────────────── */
const NewsTicker = {
  init() {
    // Items duplicated in Hugo template. Pure CSS marquee handles the loop.
  }
};

/* ── Video bg error fallback ────────────────────────────────────── */
const VideoFallback = {
  init() {
    document.querySelectorAll('video').forEach(v => {
      v.addEventListener('error', () => {
        const wrapper = v.closest('[data-grad]');
        if (wrapper) {
          v.style.display = 'none';
          wrapper.classList.add(wrapper.dataset.grad || 'hero-grad');
        }
      });
    });
  }
};

/* ── Image Lightbox ─────────────────────────────────────────────── */
const Lightbox = {
  init() {
    const lb    = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    if (!lb || !lbImg) return;

    document.querySelectorAll('.prose img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        lbImg.src = img.src;
        lb.classList.remove('hidden');
        lb.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLb = () => {
      lb.classList.add('hidden');
      lb.style.display = '';
      document.body.style.overflow = '';
    };

    lb.addEventListener('click', closeLb);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
  }
};

/* ── Bootstrap all modules ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  MobileNav.init();
  Search.init();
  LangDropdown.init();
  StickyNav.init();
  ReadingProgress.init();
  CopyButtons.init();
  SponsorsCarousel.init();
  NewsTicker.init();
  VideoFallback.init();
  Lightbox.init();
});


