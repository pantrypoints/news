/* ═══════════════════════════════════════════════════════════════
   The Point News — main.js
   Handles: dark mode · search · sponsors carousel · news ticker
            · mobile nav
═══════════════════════════════════════════════════════════════ */

/* ── Dark Mode ──────────────────────────────────────────────────── */
const ThemeManager = {
  init() {
    const saved = localStorage.getItem('tpn-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
    this.updateBtn();
  },

  toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('tpn-theme', isDark ? 'dark' : 'light');
    this.updateBtn();
  },

  updateBtn() {
    const isDark = document.documentElement.classList.contains('dark');
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.querySelector('.icon-sun').classList.toggle('hidden', isDark);
    btn.querySelector('.icon-moon').classList.toggle('hidden', !isDark);
  }
};

/* ── Mobile Nav ─────────────────────────────────────────────────── */
const MobileNav = {
  init() {
    const open = document.getElementById('mobile-open');
    const close = document.getElementById('mobile-close');
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');

    const openMenu = () => { menu.classList.remove('hidden'); menu.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const closeMenu = () => { menu.classList.remove('open'); menu.classList.add('hidden'); document.body.style.overflow = ''; };

    open?.addEventListener('click', openMenu);
    close?.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);
  }
};

/* ── Search ─────────────────────────────────────────────────────── */
const Search = {
  data: null,
  lang: 'en',

  async init() {
    const btn = document.getElementById('search-toggle');
    const close = document.getElementById('search-close');
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');

    // Detect lang from URL  
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (['en', 'tl', 'cb'].includes(parts[0])) this.lang = parts[0];

    btn?.addEventListener('click', () => {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input?.focus(), 50);
    });

    close?.addEventListener('click', () => this.closeModal());
    modal?.addEventListener('click', e => { if (e.target === modal) this.closeModal(); });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeModal();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        input?.focus();
      }
    });

    input?.addEventListener('input', () => this.handleInput(input.value));
  },

  closeModal() {
    const modal = document.getElementById('search-modal');
    modal?.classList.add('hidden');
    document.body.style.overflow = '';
  },

  async fetchData() {
    if (this.data) return;
    try {
      const res = await fetch(`/${this.lang}/index.json`);
      this.data = await res.json();
    } catch (e) {
      console.warn('Search index not available:', e);
      this.data = [];
    }
  },

  async handleInput(query) {
    const resultsEl = document.getElementById('search-results');
    if (!resultsEl) return;
    const q = query.trim().toLowerCase();

    if (!q) { resultsEl.innerHTML = '<p class="text-sm text-gray-400 p-4 text-center">Type to search…</p>'; return; }

    await this.fetchData();
    const matches = this.data
      .filter(item =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.desc  || '').toLowerCase().includes(q) ||
        (item.author|| '').toLowerCase().includes(q)
      )
      .slice(0, 8);

    if (!matches.length) {
      resultsEl.innerHTML = `<p class="text-sm text-gray-400 p-4 text-center">No results for "<strong>${this.escHtml(query)}</strong>"</p>`;
      return;
    }

    resultsEl.innerHTML = matches.map(item => `
      <a href="${item.url}" class="search-result-item group" onclick="Search.closeModal()">
        <div class="flex-1 min-w-0">
          <span class="inline-block text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-1 badge-${item.section || 'world'}">${item.section || 'news'}</span>
          <p class="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand">${this.highlight(item.title || '', q)}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">${this.highlight(item.desc || '', q)}</p>
          <p class="text-xs text-gray-400 mt-1">${item.author ? `By ${item.author} · ` : ''}${item.date || ''}</p>
        </div>
        <svg class="w-4 h-4 text-gray-300 group-hover:text-brand shrink-0 self-center" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </a>
    `).join('');
  },

  highlight(text, q) {
    if (!q) return this.escHtml(text);
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return this.escHtml(text).replace(re, '<mark class="bg-accent/40 dark:bg-accent/30 rounded px-0.5">$1</mark>');
  },

  escHtml(str) {
    return (str || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
};

/* ── Sponsors Carousel ──────────────────────────────────────────── */
const SponsorsCarousel = {
  init() {
    const tracks = document.querySelectorAll('.sponsors-track');
    tracks.forEach(track => {
      // Duplicate items for infinite loop
      const items = track.innerHTML;
      track.innerHTML = items + items;
    });
  }
};

/* ── Breaking News Ticker ───────────────────────────────────────── */
const NewsTicker = {
  init() {
    const inners = document.querySelectorAll('.ticker-inner');
    inners.forEach(inner => {
      const items = inner.innerHTML;
      inner.innerHTML = items + items;
    });
  }
};

/* ── Sticky Nav shrink ──────────────────────────────────────────── */
const StickyNav = {
  init() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.classList.add('shadow-lg', 'shadow-black/20');
        nav.classList.remove('py-2');
      } else {
        nav.classList.remove('shadow-lg', 'shadow-black/20');
        nav.classList.add('py-2');
      }
    }, { passive: true });
  }
};

/* ── Reading Progress Bar ───────────────────────────────────────── */
const ReadingProgress = {
  init() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const progress = (doc.scrollTop) / (doc.scrollHeight - doc.clientHeight) * 100;
      bar.style.width = `${Math.min(100, progress)}%`;
    }, { passive: true });
  }
};

/* ── Language Dropdown ──────────────────────────────────────────── */
const LangDropdown = {
  init() {
    const btn = document.getElementById('lang-btn');
    const dropdown = document.getElementById('lang-dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => dropdown.classList.add('hidden'));
  }
};

/* ── Video fallback ─────────────────────────────────────────────── */
const VideoFallback = {
  init() {
    document.querySelectorAll('video').forEach(v => {
      v.addEventListener('error', () => {
        const parent = v.closest('[data-grad]');
        if (parent) {
          v.remove();
          parent.classList.add(parent.dataset.grad || 'hero-grad');
        }
      });
    });
  }
};

/* ── Article Image Lightbox ─────────────────────────────────────── */
const Lightbox = {
  init() {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    if (!lb || !lbImg) return;

    document.querySelectorAll('.prose img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        lbImg.src = img.src;
        lb.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    });

    lb.addEventListener('click', () => {
      lb.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }
};

/* ── Init all ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  MobileNav.init();
  Search.init();
  SponsorsCarousel.init();
  NewsTicker.init();
  StickyNav.init();
  ReadingProgress.init();
  LangDropdown.init();
  VideoFallback.init();
  Lightbox.init();
});

// Expose for inline usage
window.ThemeManager = ThemeManager;
window.Search = Search;
