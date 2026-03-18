# The Point News

> **Get to the point.** — A multilingual Philippine news site built with Hugo 0.145.0, Bun 1.3.3, and Tailwind CSS 4.

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Hugo Extended](https://gohugo.io) | 0.145.0 | Static site generator |
| [Bun](https://bun.sh) | 1.3.3 | Package manager & script runner |
| [Tailwind CSS](https://tailwindcss.com) | 4.2.1 | Utility-first CSS |
| [@tailwindcss/cli](https://tailwindcss.com/docs/installation) | 4.2.1 | Tailwind build CLI |
| [concurrently](https://github.com/open-cli-tools/concurrently) | 8.2.2 | Run Hugo + Tailwind in parallel |

---

## Languages

| Code | Language | Content Dir |
|------|----------|------------|
| `en` | English  | `content/en/` |
| `tl` | Filipino | `content/tl/` |
| `cb` | Cebuano  | `content/cb/` |

URLs follow the pattern `/en/sports/article-slug/`, `/tl/palakasan/article-slug/`, etc.

---

## Getting Started

### Prerequisites

- [Hugo Extended 0.145.0](https://github.com/gohugoio/hugo/releases/tag/v0.145.0)
- [Bun 1.3.3](https://bun.sh)

### Install dependencies

```bash
bun install
```

### Development server (Hugo + Tailwind watch in parallel)

```bash
bun run dev
```

Visits: `http://localhost:1313/en/`

### Production build

```bash
bun run build
```

Output goes to `public/`.

---

## Project Structure

```
the-point-news/
├── assets/
│   ├── css/main.css          # Tailwind 4 source — edit here
│   └── js/main.js            # Theme, search, carousel, nav
├── content/
│   ├── en/                   # English content
│   │   ├── _index.md         # Home page front matter
│   │   ├── world/
│   │   ├── politics/
│   │   ├── sports/
│   │   ├── technology/
│   │   └── entertainment/
│   ├── tl/                   # Filipino translations
│   └── cb/                   # Cebuano translations
├── data/
│   ├── breaking_news.json    # Ticker items — edit to add breaking stories
│   └── sponsors.json         # Sponsor carousel items
├── i18n/
│   ├── en.yaml
│   ├── tl.yaml
│   └── cb.yaml
├── layouts/
│   ├── _default/
│   │   ├── baseof.html       # Base layout shell
│   │   ├── single.html       # Article page
│   │   └── list.html         # Category list page
│   ├── index.html            # Home page
│   ├── index.json            # Search index (JSON output)
│   └── partials/
│       ├── head.html         # <head> meta/fonts/CSS
│       ├── nav.html          # Sticky nav + search modal + mobile drawer
│       ├── footer.html
│       ├── hero-home.html    # Full-screen home hero with video bg + ticker
│       ├── hero-category.html # Category section hero with video bg
│       ├── article-hero.html  # Article hero (video/image/dark-orange fallback)
│       ├── article-card.html  # Reusable article card (small/default/large)
│       ├── breaking-news.html # Scrolling ticker bar
│       └── sponsors.html      # Autoplay sponsor carousel
├── static/
│   ├── css/output.css        # Tailwind compiled output (gitignore in prod)
│   ├── js/main.js
│   └── images/favicon.svg
├── hugo.toml                 # Hugo configuration
└── package.json              # Bun scripts + devDependencies
```

---

## Content Front Matter Reference

```yaml
---
title: "Article Title"
description: "SEO description and card excerpt"
date: 2026-03-17T08:00:00+08:00
author: "First Last"
author_bio: "Short author bio shown in author box"

# Hero media (priority: hero_video > hero_image > dark orange gradient)
hero_video: "/videos/my-clip.mp4"   # optional
hero_image: "/images/articles/photo.jpg"  # optional

# Article flags
featured: true       # Shows in home hero
breaking: true       # Adds Breaking badge + red indicator
read_time: 5         # Minutes — auto-calculated if omitted
location: "Manila"   # Dateline shown in hero

# Taxonomy
tags: ["politics", "manila", "2026"]
---
```

---

## Adding Articles

```bash
# English sports article
hugo new content/en/sports/2026-03-20-my-headline.md

# Filipino politics article
hugo new content/tl/politics/2026-03-20-pamagat.md
```

---

## Updating Breaking News Ticker

Edit `data/breaking_news.json`:

```json
[
  {
    "headline": "Your breaking headline here",
    "url": "/en/world/your-article-slug/"
  }
]
```

---

## Sponsors Carousel

Edit `data/sponsors.json`. Each sponsor can have:
- `name` — display name (shown if no logo)
- `url` — click destination
- `bg_color` — hex color for card background
- `bg_image` — path to background image (optional)
- `logo` — path to logo PNG/SVG (optional, filtered to white)

---

## Design Tokens

Defined in `assets/css/main.css` using Tailwind 4 `@theme {}`:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand` | `#C44D18` | Dark orange — primary brand |
| `--color-accent` | `#F5C200` | Yellow — highlights, tickers |
| `--color-highlight` | `#0891B2` | Teal — technology section, links |
| `--color-dark-*` | `#080D12`…`#243040` | Dark mode surfaces |

---

## Dark Mode

Toggled via the moon/sun button in the nav. Preference is saved to `localStorage` key `tpn-theme`. The `<html>` element receives a `dark` class — Tailwind 4 reads this via the custom `dark` variant defined in `main.css`.

---

## Search

Client-side search powered by a Hugo JSON output format at `/en/index.json`. Searches by **title**, **author**, and **description**. Triggered by the Search button in the nav or `Ctrl/Cmd + K`.

---

## Category Colors

| Section | Color Class | Hex |
|---------|------------|-----|
| World | `badge-world` | `#DC2626` |
| Politics | `badge-politics` | `#C44D18` |
| Sports | `badge-sports` | `#16A34A` |
| Technology | `badge-technology` | `#0891B2` |
| Entertainment | `badge-entertainment` | `#7C3AED` |

---

## Deployment

The `public/` directory is a fully static site — deploy to Netlify, Vercel, Cloudflare Pages, or any static host.

**Netlify** (`netlify.toml`):
```toml
[build]
  command = "bun run build"
  publish = "public"
```
