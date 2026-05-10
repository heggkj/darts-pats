# Static Package Validation

Date: 2026-05-10 18:38:56 EDT  
Branch: `static-site-packaging`  
Exhibit source commit packaged: `53f2e4b6fccab09657f1f1748d60f3f062053060`

Note: the static package was generated from the launch-ready exhibit content on `main`; this packaging workflow branch adds the repeatable script and documentation around that static build.

## Build Result

`npm ci`: passed

`npm run build`: passed

`npm run package:static`: passed

`git diff --check`: passed

## Package Output

Package folder:

```txt
release/darts-pats-static-site/
```

Package archive:

```txt
release/darts-pats-static-site.zip
```

Archive size: 45 MB  
Expanded package size: 47 MB  
Archive SHA-256:

```txt
9b1a4d13c3c23e1c9f9bcbfa30b1963ce4edef7db058b6edd1c5f6d33aee6b4f
```

## Top-Level Package Contents

- `_astro/`
- `assets/`
- `codex-responses-darts-pats.pdf`
- `data/`
- `index.html`
- `phase-9-asset-preview/`
- `scripts/`
- `STATIC_PACKAGE_MANIFEST.txt`

The package contents are static files. The public phase reports in `public/reports/` were excluded from the package by default.

## Data Files Found

- `data/town_gown_exhibit_records_enriched.json`
- `data/town_gown_exhibit_analysis_summary.json`
- `data/town_gown_exhibit_records_enriched.csv`

No data is fetched from GitHub, Google Sheets, Netlify, APIs, or remote URLs at runtime.

## Asset Folders Found

- `assets/generated/`
- `assets/logos/`
- `assets/prototypes/`

Confirmed local assets include:

- PL2 logo: `assets/logos/pl2-logo.jpg`
- Landscape parade artwork: `assets/prototypes/phase-9b/harrisonburg-parade-landscape-reference-draft.png`
- Portrait parade artwork: `assets/prototypes/phase-9b/harrisonburg-parade-portrait-reference-draft.png`
- Generated SVG/CSS visual accents in `assets/generated/`

## External Dependency Audit

Audit file:

```txt
release/static-package-audit.txt
```

Audit result: PASS

Findings:

- 20 harmless findings: SVG/XML namespace URLs and plain Credits links.
- 1 review-only finding: `fetch(DATA_URL)` / `fetch(SUMMARY_URL)` in `scripts/exhibit.js`, which resolves to local `data/*.json` files.
- 0 failures.

External URLs remain only as:

- readable/clickable Credits links to DSDC, PL2 Lab, and The Breeze digital collection
- SVG namespace declarations such as `http://www.w3.org/2000/svg`

No remote scripts, CSS, fonts, images, data/API calls, analytics scripts, or CDN-hosted runtime libraries were found.

## Static Package Smoke Test

Served from the package folder with:

```sh
cd release/darts-pats-static-site
python3 -m http.server 8080
```

Test URL:

```txt
http://localhost:8080/
```

Smoke checks passed:

- The Breeze Parade loads first.
- Touch-to-enter opens the exhibit.
- Memory Corridor loads all 616 records.
- Word Breeze excludes `Sent`.
- Class-of filter applies and clears.
- Long Argument year filter applies and clears.
- Follow the Strings works and has no `Send to corridor` button.
- Open Drawer renders cards.
- Reading drawer opens.
- Editor Table choice/reveal/new card works.
- No visible `[form hidden]`.
- Credits tab works.
- PL2 logo loads locally from `/assets/logos/pl2-logo.jpg`.
- Idle reset returns to The Breeze Parade.

Package-specific browser console warnings/errors from `http://localhost:8080`: 0.

## Runtime Dependency Answer

Does the Mac mini/static-server runtime need Node, npm, Astro, or Vite?

No. Those tools are needed only on the build machine. The Mac mini only needs the generated static package and a generic static web server.
