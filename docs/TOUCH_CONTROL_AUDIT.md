# Touch Control Audit

Phase 8 review confirms the Phase 7 goal: remove public form friction from the museum touchscreen interface. Visitors should tap exhibit objects, cards, chips, rails, and buttons instead of typing into boxes or working through dropdowns.

## Audit Command

```sh
rg -n "<input|<select|<textarea|contenteditable|prompt\\(|type=\\\"search\\\"|placeholder=|\\binput\\b|\\bselect\\b" src public/scripts public -g '!dist/**' -g '!public/data/**' -g '!public/reports/**'
```

Additional Phase 8 search:

```sh
rg -n "<input|<select|<textarea|contenteditable|prompt\\(|type=\\\"search\\\"|placeholder=|\\binput\\b|\\bselect\\b|search" src public/scripts public -g '!dist/**' -g '!public/data/**' -g '!public/reports/**'
```

## Current Findings

| File | Line | Finding | Surface | Can summon keyboard? | Status |
| --- | ---: | --- | --- | --- | --- |
| `src/pages/index.astro` | 96 | `<input id="class-year" type="range">` | Public Class-of tray | No | Kept. This is a large touch slider for graduation year selection. |
| `public/scripts/exhibit.js` | 60, 352-362, 1485, 1695, 1820 | Internal `search` state and record search blob | Hidden state only | No | Kept. No public search input exists; this remains available for internal filtering logic if future tactile controls use it. |
| `public/scripts/exhibit.js` | 1530 | `target.closest('button, a, input, summary, [role="button"]')` | Drag guard logic | No | Kept. This only prevents corridor dragging from stealing interaction from controls. |
| `public/scripts/exhibit.js` | 1702 | `input` event listener for `#class-year` | Public Class-of tray | No | Kept. This listens to the range slider and updates the visible year range. |
| `src/styles/corridor.css` | 497 | `user-select: none` | CSS text selection rule | No | Kept. Not an input or public form control. |
| `src/styles/corridor.css` | 2435, 3888 | `.class-tray input[type="range"]` | Public Class-of tray styling | No | Kept. Styles the large non-keyboard slider. |
| `src/styles/global.css` | 68 | `input { font: inherit; }` | Global type normalization | No | Kept for the Class-of range input. |

## Removed Or Replaced

| Former control | Previous location | Change |
| --- | --- | --- |
| Year dropdown | Threshold controls panel | Removed. Year filtering remains available through tactile timeline tiles. |
| Era dropdown | Threshold controls panel | Removed. Era remains represented by timeline/year context instead of a native select. |
| Topic dropdown | Threshold controls panel | Removed. Topic filtering remains available through physical topic stations/doors. |
| Form dropdown | Threshold controls panel | Removed. Darts/Pats remain browsable through walls, cards, and the drawer. |
| Search box | Threshold controls panel | Removed. No public text entry remains. |
| Editor topic dropdown | Editor's Table | Removed. The game now asks only Dart or Pat. |

## Final Recommendation

No visible public UI currently requires typing or opens a touchscreen keyboard. No public text-entry boxes, search boxes, textareas, contenteditable regions, `prompt()` flows, or visible public select/dropdowns remain. Keep the Class-of range slider because it is large, direct, and non-textual. Diagnostics are hidden/operator-only and do not require visitor text entry. Avoid reintroducing native dropdowns or search fields unless they are replaced with tactile chips/buttons.
