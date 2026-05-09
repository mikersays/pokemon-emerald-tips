# Pokemon Emerald Tips

A small static site collecting tips, tricks, and trivia for Pokemon Emerald.

Live site: <pending>

Built with vanilla HTML/CSS/JS. No build step, no framework, no dependencies.

## How to run locally

Open `index.html` directly in a browser, or serve the repo root:

```sh
python3 -m http.server
```

Then visit http://localhost:8000.

## Structure

- `index.html` — entry point
- `assets/css/`, `assets/js/`, `assets/img/` — static assets
- `content/` — tips data (e.g. `tips.json`)
- `.github/workflows/deploy.yml` — auto-deploys to GitHub Pages on push to `main`
