# Phase 9 Asset Direction

Phase 9 is an asset-direction pass, not a production-art integration pass. The draft assets in `public/assets/prototypes/phase-9/` are review concepts generated to test tone, scale, texture, and contrast against the current Phase 8/Phase 7 exhibit.

The live exhibit structure remains unchanged. Labels, dates, headings, button text, card text, and topic names remain HTML for accessibility and editing. No generated asset should include official JMU logos, official Breeze logos, readable baked-in text, or navigation UI.

## Date Copy Decision

Use `1991–2026` as the public exhibit range. The enriched archive includes 2026 records, the timeline constants allow 2026, the threshold already says `1991–2026`, and the Parade intro now matches that range.

## Shared Prompt Guardrails

All generated concepts used these constraints:

- Whimsical 2.5D archival exhibit object or scene.
- Warm off-white newsprint texture.
- JMU-inspired purple and gold only as color inspiration, with no official logos.
- Civic-history museum feel, playful but not childish.
- Subtle shadows.
- No readable text baked into the image.
- No dashboard UI, maps, StoryMap chapter devices, or corporate content blocks.

GPT Image output in this workflow is treated as opaque raster art. The draft files have no alpha channel. If future production work needs transparent small objects, prefer SVG/CSS or generate on a removable chroma-key background and verify the cutout locally.

## Visual Direction A: Archival Newspaper Corridor

Mood: Paper-forward, quiet, tactile, slightly tense. The corridor feels like a clipping file that visitors can walk through.

Color use: Warm paper dominates. Purple is a structural rail/accent color. Gold appears as tape, pins, and Pat warmth rather than a broad wash.

Texture use: Newsprint grain, torn clipping edges, faint fibers, soft paper shadows. Texture should stay behind text and never reduce contrast.

Shape language: Rectangular clippings, pulled tabs, file slips, drawer labels, folded corners, clipped cards.

What it improves: Makes the Memory Rail, drawer, and card surfaces feel like one exhibit family. Helps the UI avoid feeling like standard web cards.

What it risks: Too much paper texture can flatten hierarchy and make every surface feel equally important.

## Visual Direction B: Whimsical Civic Parade

Mood: Public, warm, animated, inviting, memory-lane energy with a slightly mischievous edge.

Color use: Purple and gold appear in balloons, awnings, banners, and small civic objects. Cream and muted teal keep the screen from becoming a two-color school-spirit palette.

Texture use: Poster-like paper grain over a bottom-third parade/market scene. The top and middle remain calm enough for HTML title, intro, touch button, and clipping cards.

Shape language: Storefront silhouettes, crosswalks, newspaper boxes, campus-town bus forms, balloons, small simplified figures.

What it improves: Strengthens The Breeze Parade as the first public kiosk signal and gives idle mode a stronger “come touch this” presence.

What it risks: Over-detailed figures, balloons, or storefronts could become childish or compete with the title and clipping.

## Visual Direction C: Museum Memory Wall / Card-Catalog

Mood: Organized but odd, like a museum wall assembled from drawer tabs, pins, tickets, and student-newspaper memory slips.

Color use: Purple edges and selected tabs, gold pins/tape, paper neutrals, light civic-blue as a focus/accent only.

Texture use: Corkboard, manila card stock, ticket paper, pin marks, string, and soft shadows. Texture is strongest at edges and quieter under labels.

Shape language: Tickets, tabs, card-catalog slips, corkboard frames, pushpins, quiet thread arcs.

What it improves: Gives the Class-of tray, Memory Rail, and Follow the Strings a shared physical vocabulary without turning them into form controls.

What it risks: If every control becomes a different artifact, the exhibit could feel busy again. Keep one dominant metaphor per section.

## Generated Draft Asset Inventory

### `parade-background-landscape-draft.png`

- Intended screen/use: The Breeze Parade landscape attractor background concept.
- Recommended dimensions: 3840 x 2160.
- Actual draft dimensions: 3840 x 2160.
- Asset type: Background.
- Background/alpha: Opaque raster; blend behind HTML title, button, and clipping card.
- Prompt: `Create a 3840 x 2160 style concept for The Breeze Parade background. A whimsical 2.5D Harrisonburg/JMU-adjacent college-town civic parade and market scene along the bottom third of the image: downtown storefront shapes, crosswalk, newspaper boxes, campus-bus-like silhouette, small simplified parade figures, helium balloons in purple, gold, cream, teal, and muted civic colors. Warm off-white newsprint texture across the whole image with soft shadows and gentle paper grain. Leave the top and center mostly open and calm for large HTML title text and a clipping card overlay. Mood: archival, civic, playful but not childish, warm but slightly mischievous. No logos, no mascots, no official branding, no readable text, no signs with letters, no watermark, no dashboard UI, no map, no interface chrome.`
- Safe to integrate now: Possibly, after human/vision review confirms no accidental readable signage and the card/title contrast remains strong.
- Accessibility/readability risks: The street detail can compete with bottom controls if cropped too high.
- StoryMap/dashboard note: Scenic bottom-third composition supports attractor mode rather than chapter navigation or scrollytelling.

### `parade-background-portrait-draft.png`

- Intended screen/use: The Breeze Parade portrait kiosk poster concept.
- Recommended dimensions: 2160 x 3840.
- Actual draft dimensions: 2160 x 3840.
- Asset type: Background.
- Background/alpha: Opaque raster; blend behind HTML overlays.
- Prompt: `Create a 2160 x 3840 style concept for The Breeze Parade background in portrait. Compose it like a tall museum poster: top third calm off-white newsprint field with generous empty space for HTML title and touch button, middle third open space for an HTML clipping card overlay, bottom third a whimsical 2.5D Harrisonburg/JMU-adjacent college-town civic parade and market scene with storefront silhouettes, crosswalk, newspaper boxes, campus-bus-like silhouette, simplified parade figures, and helium balloons in purple, gold, cream, teal, and muted civic colors. Warm archival paper texture, subtle shadows, public touchscreen museum feel. No logos, no mascots, no official branding, no readable text, no letters on signs, no watermark, no UI elements, no maps, no dashboard visuals.`
- Safe to integrate now: Possibly, but only if portrait screenshots confirm the clipping never overlaps the title and touch button.
- Accessibility/readability risks: The mid-screen balloon cluster may need a contrast scrim behind clipping cards.
- StoryMap/dashboard note: Poster composition preserves the Phase 6 museum portrait layout.

### `clipping-card-texture-draft.png`

- Intended screen/use: Attractor clipping, Editor Table hidden card, future card texture tests.
- Recommended dimensions: 1200 x 800.
- Actual draft dimensions: 1200 x 800.
- Asset type: Texture/card surface.
- Background/alpha: Opaque raster; can be used as a CSS `background-image` inside an HTML card, not as a standalone transparent object.
- Prompt: `Create a blank clipped newspaper card texture concept, landscape paper card around 1200 x 800 proportions. Warm off-white newsprint paper, faint fibers, slightly torn uneven edges, one subtle purple edge stripe and one tiny gold tape-like accent, soft shadow, high-contrast-safe blank center for HTML text. It should feel archival and tactile, not decorative or busy. No readable text, no letters, no logos, no watermark, no UI controls, no official branding.`
- Safe to integrate now: Yes for controlled card backgrounds with a solid fallback color and text contrast testing.
- Accessibility/readability risks: Paper grain should be opacity-limited under body text.
- StoryMap/dashboard note: Supports clipping metaphor rather than clean white content blocks.

### `memory-rail-tab-concept-draft.png`

- Intended screen/use: Memory Rail tab material concept.
- Recommended dimensions: 900 x 1800 source sheet.
- Actual draft dimensions: 900 x 1800.
- Asset type: Object sheet/concept.
- Background/alpha: Opaque raster; not production-ready as individual transparent tabs.
- Prompt: `Create a concept sheet of six tactile archive rail tabs, arranged vertically like a physical stack of newspaper clippings, manila drawer tabs, pinned paper scraps, and hallway exhibit signs. Purple edges, restrained gold accents, warm off-white newsprint material, subtle soft shadows. Each tab must be blank with no readable labels so HTML text can sit on top. Shape language should feel pulled-out, touchable, and slightly odd, not corporate navigation. No logos, no letters, no readable text, no numbered dots, no maps, no dashboard UI, no watermark.`
- Safe to integrate now: No. Use it as a visual reference; production tabs should be CSS/SVG or separately cut objects with verified alpha.
- Accessibility/readability risks: The sheet includes shadows and uneven shapes that may make HTML labels hard to align.
- StoryMap/dashboard note: Good direction because it reads as archive furniture, not chapter dots or a corporate sidebar.

### `class-of-ticket-concept-draft.png`

- Intended screen/use: Class-of tray/ticket concept.
- Recommended dimensions: 1400 x 700.
- Actual draft dimensions: 1400 x 700.
- Asset type: Object/texture concept.
- Background/alpha: Opaque raster; can be used only inside a controlled panel or recreated as SVG/CSS.
- Prompt: `Create a blank archival ticket stub concept, landscape around 1400 x 700 proportions. Warm paper texture, gently torn perforated edges, one purple border, restrained gold corner accent, soft museum-object shadow, high-contrast-safe blank center for HTML year text and buttons. It should feel like a tactile memory ticket or archive drawer slip, not a web form. No readable text, no numbers, no letters, no logos, no official branding, no watermark, no UI controls.`
- Safe to integrate now: Maybe as a low-opacity background; better as SVG/CSS for exact responsive sizing.
- Accessibility/readability risks: Decorative border can crowd large kiosk controls if not padded.
- StoryMap/dashboard note: Supports tactile memory selection rather than a form/dropdown.

### `corkboard-string-board-texture-draft.png`

- Intended screen/use: Follow the Strings board background concept.
- Recommended dimensions: 2400 x 1600.
- Actual draft dimensions: 2400 x 1600.
- Asset type: Background/texture.
- Background/alpha: Opaque raster.
- Prompt: `Create a 2400 x 1600 landscape concept background: warm corkboard / archival bulletin board surface with faint newspaper fibers, subtle pin marks, restrained purple and gold string accents along the edges only, soft paper shadows, museum exhibit mood. Keep the central area calm and low-contrast so HTML nodes and labels remain readable. Whimsical but not childish, civic-history archive room, tactile. No readable text, no letters, no logos, no official branding, no maps, no dashboard UI, no watermark.`
- Safe to integrate now: Possibly, with a translucent overlay/scrim behind node labels.
- Accessibility/readability risks: Edge clippings and strings may distract in portrait; central contrast must be tested.
- StoryMap/dashboard note: Reinforces the self-contained corkboard room without adding map or scrollytelling conventions.

## Recommended Next Integration Order

1. Test `clipping-card-texture-draft.png` in one card component at low texture opacity.
2. Test The Breeze Parade background in attractor mode with a contrast scrim and crop rules for landscape/portrait.
3. Rebuild Memory Rail tabs as CSS/SVG based on the concept sheet instead of using the opaque sheet directly.
4. Rebuild Class-of ticket as CSS/SVG or use the concept only as a subtle panel background.
5. Test corkboard texture last, because Follow the Strings already carries the highest density risk.

## Rejected Or Deferred Uses

- Do not replace the live Memory Rail with the opaque tab sheet.
- Do not use generated art as buttons with baked-in labels.
- Do not use the generated Parade background if any accidental signage reads like a real logo or headline.
- Do not apply corkboard texture under small labels without a readability layer.
- Do not generate final transparent icons until the screen bible has had human or vision-model critique.
