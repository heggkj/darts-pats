# Codex task: populate heggkj/darts-pats

Populate the empty GitHub repository `heggkj/darts-pats` with this Astro exhibit.

## Required work

1. Copy all files in this starter kit into the repo root.
2. Preserve the data files in `/public/data/`.
3. Run:
   ```bash
   npm install
   npm run build
   ```
4. Fix any build issues.
5. Commit all files with this message:
   ```text
   Initial 2.5D Darts & Pats town-gown exhibit
   ```
6. Push to `main`.

## Design intent

The result should feel like a whimsical 2.5D archival corridor, not a normal website. Visitors should walk through the town-gown evidence: timeline floor, topic doors, Darts wall, Pats wall, source-card drawer, and a light no-score editor game.

Keep the tone honest, archival, and slightly tense. This is not admissions branding; it is a public-history interface for conflict, gratitude, humor, and civic memory.

## Current starter structure

- `src/pages/index.astro`
- `src/styles/global.css`
- `src/styles/corridor.css`
- `public/scripts/exhibit.js`
- `public/data/*.json`
- `public/assets/generated/*.svg`
- `netlify.toml`
- `package.json`
- `README.md`

## Nice-to-have refinements after the first build

- Replace placeholder SVGs with generated Image 2 assets.
- Improve keyboard focus states and mobile layout.
- Add a print/archive citation view for each opened card.
- Add a physical-exhibit QR-code landing panel once the Netlify URL exists.
