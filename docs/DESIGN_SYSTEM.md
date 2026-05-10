# Darts & Pats Exhibit Design System

Phase 6 hardening target: public museum touchscreen use in landscape, portrait kiosk, phone portrait, desktop preview, and reduced-motion mode.

## Core Tone

- Archival, civic, tactile, whimsical, honest, and slightly tense.
- Not promotional, not a dashboard, not a corporate content site, and not an ESRI/ArcGIS StoryMap.
- One dominant metaphor per section:
  - The Breeze Parade: civic parade, balloons, clipped newspaper cards.
  - Memory Corridor: hallway, side walls, floor timeline, topic objects.
  - Follow the Strings: corkboard, thread, pins, clippings.
  - Open the Drawer: archive drawer and readable cards.
  - Editor's Table: desk, hidden card, reveal stamp.

## Color Tokens

- `--jmu-purple #450084`: primary action, active rail edge, major headings.
- `--jmu-gold #cbb677`: Pat accents, pins, tape, warm archival highlights.
- `--paper #fbf8ef`: base newsprint field.
- `--paper-deep #efe5cf`: deeper paper surfaces and kiosk trays.
- `--ink #241f2b`: primary text.
- `--muted #6f6478`: metadata and secondary copy.
- `--dart #342a42`: Dart card edge and darker timeline mood.
- `--civic-blue #2f6f7e`: orientation, focus accents, Word Breeze emphasis.
- `--tension #b3261e`: small warning/stamp accents only.

Use purple for structure and actions, gold for warmth and touchable artifacts. Avoid large purple/gold gradients that make every object compete.

## Typography

- Headings use the system sans stack, heavy weight, tight line-height, and zero letter spacing.
- Eyebrows use all caps sparingly with `0.08em-0.14em` letter spacing.
- Kiosk reading text should be at least `18px` in coarse-pointer contexts.
- Drawer body text should read from standing distance, with larger blockquote sizing in portrait.

## Buttons And Tap Targets

- Kiosk primary controls should be at least `72px` high where practical.
- Secondary controls should be at least `56px`; custom controls should not drop below `44px`.
- Use rounded pill buttons for commands, physical tabs for navigation, and paper cards for records.
- All controls must work on tap/click and keyboard focus. Hover may enhance but must not reveal essential behavior.
- Focus states use visible civic-blue or purple outlines with enough offset to stand away from paper texture.

## Cards

- Record cards use an archival clipping surface, 8px radius, subtle tape mark, and a left border for Dart/Pat form.
- Card shadows should stay soft. Avoid stacking multiple heavy shadows.
- Badges should be quiet pills, not loud dashboard chips.
- Dense metadata belongs in the reading drawer, not in the Memory Corridor stage.

## Memory Rail

- Landscape: narrow fixed physical rail on the left.
- Portrait and tablet: bottom tactile tray with horizontally scrollable tabs.
- Active stop should read as a pulled tab or selected physical marker.
- The rail is navigation furniture, not a table of contents or StoryMap chapter rail.

## Drawers And Modals

- Reading drawer is the only large modal surface.
- Landscape: wide drawer, comfortable metadata columns.
- Portrait: nearly full-screen drawer with a large close button and large previous/next controls.
- Dialogs must not trap visitors in tiny panels.

## Motion Principles

- Motion should feel ambient and optional, never required to understand or operate the exhibit.
- The Breeze Parade cycles: clipping rests, clipping fades out, balloon rises, new clipping appears.
- Reduced motion disables balloon travel and large transforms, leaving static cards and static exhibit objects.
- Avoid fast panning, spin, bounce, or game-like scoring feedback.

## Landscape Layout Rules

- The Breeze Parade stays spacious with the clipping on the right and parade layer along the bottom.
- Memory Rail stays left on wide screens.
- Memory Corridor may use side walls, central stage, and horizontal floor timeline.
- Follow the Strings may use a wide radial/string board.
- Open Drawer uses a multi-column shelf.
- Editor's Table can use a two-zone layout: hidden card first, then large Dart/Pat choice objects and a reveal button. No public topic dropdown.

## Portrait Layout Rules

- Treat phone portrait and museum/tablet portrait as different modes. Phone portrait is compact; portrait kiosk begins around `orientation: portrait`, `min-width: 768px`, and `min-height: 1200px`.
- Portrait kiosk stages should use most of the available width, currently via `--kiosk-portrait-stage-width`, instead of centering a narrow mobile column.
- Memory Rail becomes a bottom tray so the content is not squeezed by a tall side column.
- Memory Corridor becomes a vertical hallway: current view first, then Darts and Pats walls as stacked shelves, then topic stations and the wrapped floor strip.
- Timeline becomes a wrapped floor strip instead of a perspective floor.
- Follow the Strings uses a portrait board: center theme near top, related themes in a tappable shelf, Darts and Pats as larger shelf cards, and lighter string lines.
- Open Drawer uses one or two columns.
- Editor's Table stacks controls and related cards.
- The Breeze Parade uses a poster composition: top third title/invitation, middle third clipping, bottom third parade scene.

## Image Asset Rules

- Do not bake readable words, dates, labels, logos, or headlines into generated images.
- Generated images should be transparent-background objects unless serving as a full scene background.
- Keep placeholders lightweight until the whole screen bible has been reviewed.
- Assets should support public touchscreen scale and remain legible in high-ambient-light settings.

## Do Not Look Like StoryMap

- No numbered chapter dots.
- No map-first layout.
- No clean corporate sidebar/table-of-contents.
- No white scrollytelling cards stacked as the main rhythm.
- No dashboard rows of metrics as the dominant interface.
- Navigation should feel like physical exhibit furniture.

## Kiosk And Touch Rules

- No login, no saved visitor state, no scorekeeping, no user-generated content.
- No external links that pull visitors away from the exhibit.
- Start Over and idle reset return to The Breeze Parade.
- Idle reset closes drawers/trays, clears filters, resets the string board and editor table.
- Test landscape, portrait, coarse pointer, fine pointer, and reduced motion before public installation.
