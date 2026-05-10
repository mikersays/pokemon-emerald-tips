# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static GitHub Pages site of Pokemon Emerald tips, framed as the "Hoenn Field Guide" — vintage strategy-magazine / risograph aesthetic, vanilla HTML/CSS/JS, no framework, no build step. 15 content pages plus a hub `index.html`.

## Common commands

```sh
# Serve locally (open http://localhost:8000)
python3 -m http.server

# JSON validity check (canonical content lives here)
python3 -c "import json; json.load(open('content/tips.json'))"

# Audit sprite usage on a page
grep -c "poke-sprite" <page>.html

# Verify nav matches index.html on a given page (must be byte-identical)
diff <(sed -n '/<nav class="nav__links"/,/<\/nav>/p' index.html) \
     <(sed -n '/<nav class="nav__links"/,/<\/nav>/p' <page>.html)

# Deploy: push to main. .github/workflows/deploy.yml ships repo root to Pages.
```

There is no test suite, no linter, and no build step. Pages are served as-is.

## Architecture

### Content is the source of truth

`content/tips.json` (~8,000 lines, 36 top-level keys) is the canonical content. Every HTML page **inlines the relevant slice** of this JSON directly into its markup at edit time — pages do **not** `fetch()` the JSON at runtime. This keeps the site working from a `file://` open and keeps Pages deploys atomic.

Top-level JSON keys map roughly 1:1 to page sections (e.g. `gym_leaders` → `gyms.html`, `pokemon_tier_list` → `tier-list.html`, `key_items` → `keyitems.html`). When extending content: update the JSON first, then re-render the affected HTML.

### Design system: `assets/css/main.css` is locked

`main.css` is organized into 18 numbered sections (tokens, reset, typography, layout, nav, hero, cards, type chips, stat rows, callouts, utilities, tier list, page header, footer, back-to-top, animations, responsive, sprites). When building or extending pages, **use only existing classes**. Do not add new component classes without strong justification — the agents that built this site converged on a shared vocabulary precisely so pages stay visually coherent.

Color tokens live in `:root` (`--paper`, `--ink`, `--emerald`, `--ember`, `--sun`, `--mist`, `--ocean`, etc.). Type tokens use Fraunces (display) / Instrument Sans (body) / JetBrains Mono (data) / Press Start 2P (sparing pixel accents). Hard 2.5–4px borders, never soft drop-shadows.

Key reusable patterns:
- `.card-trainer` — for any "entry per dossier" page (gym leaders, Elite Four, legendaries, Frontier brains)
- `.tile` in a `.grid--auto` — compact entries (TMs, secrets, key items)
- `.tier-row[data-tier=...]` + `.tier-card` — tier-list rows with giant Fraunces letter glyph
- `.callout[--emerald|--ocean|--sun|--ember]` — strategy/note paragraphs (never use plain `<p>` for tactical content)
- `.type-chip[data-type="..."]` — covers all 17 Gen-3 types via `data-type`; never hardcode chip colors
- Page-header pattern: `<section class="page-header">` containing one `riso-blob`, one `riso-dots`, kicker, two-line `page-header__title` with one `<em>` italic-emerald word, then a lede

### Reveal animation requires care

`.reveal` elements are hidden (`opacity: 0`) **only when JS adds `.is-armed`**, and JS only arms elements that are below the initial viewport. Above-the-fold content is always visible, even with JS disabled. A 1.2s safety timer in `assets/js/main.js` force-reveals any still-armed element so missed observer firings can't leave content invisible. Don't change this contract — full-page screenshots and the no-JS fallback both depend on it.

### Pokemon sprites

Always use the PokeAPI Gen-3 Emerald sprite set:

```html
<img class="poke-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/{DEX}.png" alt="{Name}" loading="lazy">
```

Sizes: `.poke-sprite--xs` 32, `--sm` 48, default 64, `--lg` 96, `--xl` 128. `.poke-sprite-frame` for hard-bordered tile (with `--emerald|--ember|--sun|--ocean` color variants). `.poke-row` for sprite + label flex pairings. The sprite class always uses `image-rendering: pixelated` to preserve the GBA look.

### Cross-page contracts

- **Nav block** is byte-identical across all 15 pages. JS auto-marks the current page via `.is-current` — never manually add it. Adding a new page means inserting a `<li>` in both `nav__links` and `nav__drawer` on **every** page (use a Python sweep, not the Edit tool).
- **Footer block** is byte-identical across all pages.
- **One drop-cap per page** (the `.dropcap` class). Place it on the first body paragraph of the first content section.
- Page titles: `<Page Name> &middot; Hoenn Field Guide`.

### Deployment

`.github/workflows/deploy.yml` deploys the repo root to GitHub Pages on push to `main` (Source: GitHub Actions in repo settings). `.nojekyll` keeps Pages from running Jekyll. The site has no build step — pushing publishes. The branch+root path (Settings → Pages → Deploy from a branch / `main` / root) also works if the workflow is removed.

## Working with this site

### Adding a new content page

1. Add (or extend) the relevant key in `content/tips.json`.
2. Create `<name>.html` by copying the head/nav/footer scaffolding from any existing inner page (e.g. `gyms.html`). Do not introduce new CSS classes.
3. Add a `<li>` link in **both** `nav__links` and `nav__drawer` on every existing page (Python sweep).
4. Add a hub tile in `index.html` and bump the chapter count in the intro lede.
5. Sprites for any Pokemon mentioned, where applicable.

### Verifying changes visually

Use the Playwright MCP browser to navigate to `http://localhost:8765/<page>.html?v={timestamp}` (cache-bust the CSS link href if you've modified CSS — the browser caches aggressively). Take full-page screenshots after a `setTimeout(1500)` to give reveal animations a chance to finish. Save screenshots to `/tmp/emerald-shots/` not the repo (kept out of git via `.gitignore`).

### Constraints worth remembering

- The site must work from `file://` (no fetch). Inline JSON content into HTML at edit time.
- Never modify `main.css` to add a one-off rule for a single page; extend the section-relevant utility instead.
- Don't add gradients (except riso textures already in CSS) or soft drop-shadows. Hard borders + offset blocks only.
- No emojis in content unless explicitly requested.
- The `.playwright-mcp/` scratch dir and screenshot files are gitignored; don't commit them.
