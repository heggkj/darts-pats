# Phase 9b Whimsical Localization

Phase 9b uses the uploaded Harrisonburg reference image as a mood and locality cue, not as literal source art. The live implementation stays CSS/HTML-first so the public touchscreen keeps readable text, large touch targets, and reduced-motion behavior.

## Reference Cues Extracted

- Shape language: civic cupola, red-roofed courthouse massing, low downtown blocks, long street grid, crosswalk diagonals, market-stall geometry, small skyline breaks, and Blue Ridge horizon bands.
- Line quality: simplified architectural silhouettes work better than detailed realism. The exhibit should use chunky paper-cut shapes and soft shadows rather than photographic detail.
- Density: the uploaded view is busy, but the exhibit needs the opposite: a few recognizable local gestures with generous open sky for title, button, and clipping text.
- Building/street character: brick blocks, cream civic building surfaces, greenish copper dome, crosswalks, parking/street rhythms, autumn trees, and downtown storefront edges.
- Whimsy level: lively civic parade, balloons, market tents, tiny figures, and newspaper boxes; playful but not childish.
- Color mood: warm paper base, JMU-inspired purple/gold accents, brick red, copper teal, muted autumn oranges/greens, and blue ridge haze.

## Live Changes

- The Breeze Parade now includes a CSS Blue Ridge horizon, courthouse/cupola silhouette, market stalls, richer storefronts, crosswalk rhythm, and a slightly more local newsbox treatment.
- Threshold gained a very subtle civic-building silhouette in the right background.
- Memory Rail gained a quiet cupola/tab accent.
- Class-of tray gained a small balloon-memory accent.
- Follow the Strings gained only a low-opacity corner wash; the board remains readable.
- Reading Drawer, Open Drawer, and Editor’s Table remain clean and text-forward.

## Draft Generated Assets

### `harrisonburg-parade-landscape-reference-draft.png`

- Location: `public/assets/prototypes/phase-9b/`
- Type: draft background concept, opaque raster.
- Dimensions: 3840 x 2160.
- Prompt: `Use the uploaded Harrisonburg aerial image as mood reference: small-city downtown blocks, red brick buildings, a courthouse-like civic building with red roof and green copper dome/cupola, crosswalk geometry, autumn trees, surrounding Blue Ridge horizon, local street grid and market-day energy. Create a 3840 x 2160 whimsical civic illustration concept for a museum touchscreen attractor screen. Bottom 30% should be a lively but not crowded Harrisonburg-inspired parade/market streetscape: storefront silhouettes, crosswalks, newspaper boxes, small simplified figures, market stalls, balloons, and a courthouse/cupola-inspired civic silhouette. Top and center must remain calm warm newsprint space for large HTML title, button, and clipping card overlays. JMU-inspired purple and gold accents, warm off-white paper texture, muted teal/brick/autumn accents, soft shadows, playful but not childish, civic and archival. No official logos, no fake Breeze logo, no readable text, no letters on signs, no UI, no maps, no dashboard, no watermark.`
- Integration recommendation: strong enough as a concept direction, but not integrated directly. Before production use, inspect for accidental readable marks and test clipping/title contrast.

### `harrisonburg-parade-portrait-reference-draft.png`

- Location: `public/assets/prototypes/phase-9b/`
- Type: draft background concept, opaque raster.
- Dimensions: 2160 x 3840.
- Prompt: `Use the uploaded Harrisonburg aerial image as mood reference: downtown Harrisonburg civic core, red brick blocks, courthouse-like civic building with red roof and green copper dome/cupola, crosswalks, autumn trees, Blue Ridge horizon, college-town street grid, market/parade atmosphere. Create a 2160 x 3840 whimsical civic illustration concept for a portrait museum touchscreen attractor. Compose as a tall poster: top third mostly calm warm newsprint space for HTML title and large touch button; middle third open enough for a popped newspaper clipping card; bottom third a lively but not crowded Harrisonburg-inspired parade/market scene with storefront silhouettes, crosswalk, newspaper boxes, small simplified figures, market stalls, balloons, and a courthouse/cupola-inspired civic silhouette. JMU-inspired purple and gold accents with muted teal, brick, cream, autumn tree colors, soft shadows, public museum exhibit mood. No official logos, no fake Breeze logo, no readable text, no letters, no UI, no maps, no dashboard, no watermark.`
- Integration recommendation: promising for future attractor-art replacement, but production would need crop and overlap testing in portrait kiosk view.

## Readability Rules Preserved

- No generated labels are baked into the live UI.
- The large title, touch-to-enter button, clipping card text, drawer text, and editor text remain HTML.
- The generated assets are prototypes only.
- Reduced-motion behavior is unchanged; the new CSS shapes are static.
- The reading-heavy screens avoid extra decorative backgrounds.

## Rejections And Deferrals

- Do not use the generated backgrounds as-is until a visual review checks accidental signage, contrast, and portrait overlap.
- Do not add the courthouse/cupola motif to every section; it should remain an attractor/threshold accent.
- Do not add heavy texture to the Reading Drawer or Editor’s Table reading area.
