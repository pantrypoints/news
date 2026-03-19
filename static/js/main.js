/* ═══════════════════════════════════════════════════════════════
    The Point News — main.js
═══════════════════════════════════════════════════════════════ */

const ThemeManager = {
  init() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    // Use the same key as your head script to prevent flickering
    const saved = localStorage.getItem('theme'); 
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }

    this.updateIcon();
    btn.addEventListener('click', () => this.toggle());
  },

  toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.updateIcon();
  },

  updateIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    const sun = document.getElementById('theme-sun');
    const moon = document.getElementById('theme-moon');
    
    if (sun && moon) {
      sun.classList.toggle('hidden', isDark);
      moon.classList.toggle('hidden', !isDark);
    }
  }
};

const MobileNav = {
  init() {
    const openBtn = document.getElementById('mobile-open');
    const closeBtn = document.getElementById('mobile-close');
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    const subToggles = document.querySelectorAll('.mobile-submenu-toggle');

    if (!menu) return;

    openBtn?.addEventListener('click', () => {
      menu.classList.remove('hidden');
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });

    const close = () => {
      menu.classList.add('hidden');
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
    };

    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    // Mobile Submenu Logic
    subToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        const icon = btn.querySelector('svg');
        target?.classList.toggle('hidden');
        icon?.classList.toggle('rotate-90');
      });
    });
  }
};

const Search = {
  data: null,
  lang: 'en',

  init() {
    const toggleBtn = document.getElementById('search-toggle');
    const closeBtn = document.getElementById('search-close');
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    const backdrop = document.getElementById('search-backdrop');

    if (!modal) return;

    // Detect lang from <html> tag (Hugo standard) or URL
    this.lang = document.documentElement.lang || 'en';

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
    backdrop?.addEventListener('click', closeSearch);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeSearch();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    });

    input?.addEventListener('input', (e) => this.handleInput(e.target.value));
  },

  async fetchData() {
    if (this.data) return;
    try {
      // Hugo usually outputs index.json at /[lang]/index.json
      const res = await fetch(`/${this.lang}/index.json`);
      this.data = await res.json();
    } catch (err) {
      console.error("Search data failed:", err);
      this.data = [];
    }
  },

  async handleInput(query) {
    const resultsEl = document.getElementById('search-results');
    const q = query.trim().toLowerCase();
    if (!q) {
      resultsEl.innerHTML = '<p class="text-sm text-gray-400 p-4 text-center">Type to search…</p>';
      return;
    }

    await this.fetchData();
    const matches = (this.data || []).filter(item => 
      item.title?.toLowerCase().includes(q) || item.desc?.toLowerCase().includes(q)
    ).slice(0, 8);

    if (matches.length === 0) {
      resultsEl.innerHTML = `<p class="p-4 text-center text-gray-400">No results for "${query}"</p>`;
      return;
    }

    resultsEl.innerHTML = matches.map(item => `
      <a href="${item.url}" class="block p-3 hover:bg-dark-600 rounded-lg transition-colors group">
        <p class="font-semibold text-white group-hover:text-accent">${item.title}</p>
        <p class="text-xs text-gray-400 line-clamp-1">${item.desc || ''}</p>
      </a>
    `).join('');
  }
};

const LangDropdown = {
  init() {
    const btn = document.getElementById('lang-btn');
    const dropdown = document.getElementById('lang-dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => dropdown.classList.add('hidden'));
  }
};

// ── MAIN INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  MobileNav.init();
  Search.init();
  LangDropdown.init();
});