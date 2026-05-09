# The Breeze Between Town and Gown

An Astro-powered 2.5D digital exhibit built from town-gown related Darts & Pats published in *The Breeze*, James Madison University's student newspaper.

The site is designed as an interactive corridor rather than a conventional dashboard. Visitors move through years, topics, Darts, Pats, and source cards to explore friction and gratitude in the relationship between JMU, Harrisonburg, and Rockingham County.

## Data

The exhibit expects these files in `public/data/`:

- `town_gown_exhibit_records_enriched.json`
- `town_gown_exhibit_analysis_summary.json`
- `town_gown_exhibit_records_enriched.csv`

Each record includes `date`, `year`, `kind`, `sentiment`, `primary_topic_label`, `topic_tag_labels`, `entities`, `text_full`, and source metadata.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Netlify

This repo includes `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Connect the GitHub repo to Netlify after the first commit lands.

## Exhibit tone

This is not a promotional microsite. It is an interpretive civic-memory exhibit: funny, tense, archival, occasionally petty, and honest about both conflict and gratitude.
