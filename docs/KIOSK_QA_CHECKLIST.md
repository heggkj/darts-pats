# Museum Kiosk QA Checklist

Use this checklist before a public installation, after any visual pass, and after browser/OS kiosk-shell changes.

## Setup

- Confirm the kiosk browser loads the exhibit with no login, cookie prompt, or external navigation.
- Confirm the browser/OS kiosk shell handles fullscreen or app-lock mode; the web app should not be the only kiosk lock.
- Confirm the network/data files load locally or from the deployed host.
- Confirm the touchscreen reports taps accurately at all four corners and along both edges.

## Landscape Test

- Test `1920x1080`, `2560x1440`, and `3840x2160` or the nearest available display modes.
- Confirm The Breeze Parade feels spacious and the entry button is obvious from standing distance.
- Confirm Memory Rail remains narrow and does not cover content.
- Confirm Memory Corridor edge arrows only appear when the corresponding side wall is out of view.
- Confirm Follow the Strings nodes are large enough to tap without hover.
- Confirm Open Drawer uses a comfortable multi-column card grid.

## Portrait Test

- Test `1080x1920`, `1440x2560`, `2160x3840`, and `1024x1366` if available.
- Confirm Memory Rail becomes a bottom tray and does not squeeze content.
- Confirm Memory Corridor reads as a vertical hallway with large cards.
- Confirm the timeline wraps cleanly and remains tappable.
- Confirm Follow the Strings feels intentional in portrait, not like a broken landscape board.
- Confirm Open Drawer uses one or two columns and the reading drawer is nearly full-screen.

## Reduced-Motion Test

- Enable OS/browser reduced-motion preference.
- Confirm balloons do not travel and clipping motion is simplified.
- Confirm corridor, string-board, card, and topic transforms do not depend on motion.
- Confirm all navigation still works without animation.

## Idle Reset Test

- Open a reading drawer, open Class-of tray, apply a topic or class filter, recenter Follow the Strings, and reveal an Editor card.
- Wait for idle reset or trigger it in the test harness.
- Confirm the overlay says it is returning to The Breeze Parade.
- Confirm the app returns to The Breeze Parade.
- Confirm drawer/trays are closed, filters cleared, string board reset, and Editor Table reset.

## Start Over Test

- From each major section, tap Start Over.
- Confirm the app returns to The Breeze Parade, not just the threshold.
- Confirm no visitor-specific state remains.

## Drawer Readability

- Open a Dart and a Pat.
- Stand at the expected visitor distance and confirm full text is comfortable to read.
- Confirm close, Previous, and Next controls are obvious and large.
- Confirm related-entry chips are tappable and do not require hover.

## Class-Of Filter Test

- Open Class of...
- Choose a year and confirm the copy explains the four-year window.
- Confirm the active class chip appears near the Memory Corridor heading.
- Confirm Show all years clears the window.
- Confirm idle reset clears the class filter and closes the tray.

## Follow The Strings Touch Test

- Tap a theme node and confirm it recenters the board.
- Tap a related theme and confirm it recenters without jumping the Memory Corridor.
- Tap a Dart/Pat clipping and confirm the reading drawer opens.
- Confirm the Send to corridor action is secondary and not the main behavior.

## Editor Table Test

- Confirm hidden cards do not reveal Dart/Pat classification in metadata before reveal.
- Confirm masked text still reads naturally enough for guessing.
- Confirm reveal shows the original classification and original text.
- Confirm no score, login, leaderboard, or saved state appears.

## Touch And Edge Operation

- Confirm all primary controls are at least 72px high where practical.
- Confirm secondary controls are at least 56px and custom controls never drop below 44px.
- Confirm one-handed operation from the left side and right side of the kiosk.
- Confirm controls near screen edges are intentionally large edge controls.
- Confirm no-hover operation: every hover behavior must also work on tap/click.

## Environment Checks

- Check glare/high-ambient-light readability.
- Check text contrast on the actual display.
- Confirm orientation changes do not leave the rail or drawer in a broken position.
- Confirm the page does not expose external links that pull visitors away.
- Confirm hidden diagnostics can be opened by staff and closed again.
