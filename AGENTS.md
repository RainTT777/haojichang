# Repository Guidelines

## Architecture
- Reusable UI belongs in `src/components/`.
- Page shells belong in `src/layouts/`.
- SEO content belongs in `src/content/`; configuration belongs in `src/data/`.
- Preserve the wide, low-margin layout and rounded visual system defined in `src/styles/global.css`.

## SEO
- Keep exactly one H1 per page.
- Add canonical, Open Graph and JSON-LD through `BaseLayout.astro`.
- Never publish fabricated benchmarks as factual results; demo values must be replaced or clearly labeled.
