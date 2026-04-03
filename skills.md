# Moslides — Slide Generation Skills & Design Conventions

> This document captures all design conventions, style rules, theme system usage, and helper patterns for the `moslides` slide generation project. Use it as the single source of truth when creating or modifying slides.

---

## 1. Project Architecture

```
src/
  design-system.js   # Colors, fonts, theme switching (single source of truth)
  helpers.js         # All shared slide-building utilities
  part1.js           # Slides 1-12   (Traditional Deployment Evolution)
  part2.js           # Slides 13-20  (Scale Out Challenges)
  part3.js           # Slides 21-26  (Container Revolution)
  part4.js           # Slides 27-34  (12-Factor App)
  part5.js           # Slides 35-42  (DevOps Integration)
  part6.js           # Slides 43-50  (SDLC & Observability)
  part7_metrics.js   # Slides 91-105 (Metrics Deep Dive)
  part8_logs.js      # Slides 106-120 (Logs Management)
  part9_tracing.js   # Slides 121-135 (Distributed Tracing)
  part10_sre.js      # Slides 136-150 (SRE Complete Picture)
  merge.js           # Merges all part .pptx files into final deck
output/              # Generated .pptx files
```

Each `partN.js` is standalone. Run `node src/partN.js` to generate its deck, then `node src/merge.js` to produce the final merged file.

---

## 2. Theme System

### Switching Themes

Every part file must call `setTheme("light")` immediately after requiring `design-system.js`:

```js
const { COLORS, FONTS, setTheme } = require("./design-system");
setTheme("light");
```

The `setTheme()` function mutates the shared `COLORS` object. Since each part runs in a separate `node` process, this is safe.

### Available Themes

| Theme | Background | Text | Best For |
|-------|-----------|------|----------|
| `dark` | `0D1117` (near-black) | `E6EDF3` (light grey) | Screen reading, dark rooms |
| `light` | `FFFDF8` (warm cream) | `2D2926` (dark brown) | **Projector / classroom** (current default) |

### Color Token Reference (light theme)

| Token | Hex | Usage |
|-------|-----|-------|
| `COLORS.bg` | `FFFDF8` | Slide background |
| `COLORS.bg2` | `F5F1EB` | Card/panel backgrounds |
| `COLORS.bg3` | `ECE6DD` | Secondary card fills, column headers |
| `COLORS.border` | `D6CCBF` | Card borders, separators |
| `COLORS.text` | `2D2926` | Primary text |
| `COLORS.textMuted` | `8A8078` | Secondary/meta text |
| `COLORS.accent` | `4A7FB5` | Links, highlights, default borders |
| `COLORS.success` | `4A9968` | Good/advantage indicators |
| `COLORS.danger` | `C4605B` | Bad/limitation indicators |
| `COLORS.warning` | `B8892C` | Warning indicators |

### Component Color Assignments

| Component | Token | Hex | Visual |
|-----------|-------|-----|--------|
| Frontend / Nginx | `COLORS.frontend` | `5B8DB8` | Muted blue |
| Backend / App | `COLORS.backend` | `5A9B6E` | Sage green |
| Database | `COLORS.database` | `C4804A` | Warm orange |
| LB / Cache / MQ | `COLORS.infra` | `8B6AB5` | Soft purple |
| Container / Pod | `COLORS.container` | `4A9B8E` | Teal |
| Client / Browser | `COLORS.client` | `908880` | Warm grey |

**Rule:** Never hardcode hex colors. Always use `COLORS.*` tokens.

---

## 3. Canvas & Layout

- **Canvas size:** 10 x 5.5 inches (pptxgenjs widescreen default)
- **All coordinates in inches** — `x`, `y`, `w`, `h` are floats
- **Background:** Always `slide.background = { color: COLORS.bg }`
- **Header height:** 0.52 inches (`HEADER_H` constant)
- **Bottom panel height:** 1.95 inches (`BOTTOM_H` constant)

### Layout Principles

1. **Fill the slide** — no large empty areas. Content should span the full canvas.
2. **Readable text** — minimum font size 9pt for body, 7.5pt only for labels/tags.
3. **Use PowerPoint native text** — Excalidraw is for diagrams/images only. All text goes through `slide.addText()` for easy future editing.
4. **No page numbers** — partLabel should be just `"PART N"`, no "XX / 50" suffixes.

---

## 4. Helper Functions Reference

All helpers are in `src/helpers.js`. Import what you need:

```js
const {
  W, H, HEADER_H, BOTTOM_H, BOTTOM_Y,
  initSlide, addSlideHeader, addBottomPanel,
  addNodeCard, addMiniNode, addHArrow, addDashedHArrow, addVArrow,
  addZoneBorder, addAlertBar, addTipBar, addCommentBar, addKnowledgeCards,
  addCompareHeading, addCompareItem, addSummaryCard, addMetricCard,
  addThreeCols, addCodeCard,
} = require("./helpers");
```

### Key Helpers

| Helper | Purpose | Key Options |
|--------|---------|-------------|
| `initSlide(pres)` | Create slide with background | Returns slide object |
| `addSlideHeader(slide, pres, opts)` | Header bar with title, part label, complexity meter | `title`, `partLabel`, `complexity`, `accentColor` |
| `addBottomPanel(slide, pres, pros, cons, opts)` | Two-column pros/cons panel | Items can be `string` or `{title, sub}` |
| `addNodeCard(slide, pres, opts)` | Rounded service node | `emoji`, `name`, `meta`, `borderColor`, `nameColor` |
| `addMiniNode(slide, pres, opts)` | Small inline node | `emoji`, `label`, `borderColor` |
| `addHArrow(slide, pres, opts)` | Horizontal arrow with pill-badge label | `x`, `y`, `w`, `label`, `color` |
| `addDashedHArrow(slide, pres, opts)` | Dashed arrow for responses | `reverse` for direction |
| `addVArrow(slide, pres, opts)` | Vertical arrow | `h` can be negative for upward |
| `addZoneBorder(slide, pres, opts)` | Dashed border around a group | `label` for tab on top |
| `addTipBar(slide, pres, opts)` | Insight bar at bottom | `y`, `text` |
| `addAlertBar(slide, pres, opts)` | Red alert bar | `message`, `tags[]` |
| `addCommentBar(slide, pres, opts)` | `// code-comment` style bar | `message`, `sub` |
| `addKnowledgeCards(slide, pres, cards, opts)` | Bottom knowledge cards (3-column) | `[{title, body, color}]` |
| `addCompareHeading(slide, pres, opts)` | Comparison section heading | `type: "good"/"bad"` |
| `addCompareItem(slide, pres, opts)` | Comparison list row | `emoji`, `title`, `sub`, `type` |
| `addSummaryCard(slide, pres, opts)` | Summary card with bullet list | `icon`, `title`, `items[]`, `color` |
| `addMetricCard(slide, pres, opts)` | Big number KPI card | `value`, `label`, `sub`, `color` |
| `addThreeCols(slide, pres, cols, opts)` | Three-column layout | `[{title, color, icon, items[]}]` |
| `addCodeCard(slide, pres, opts)` | Dark code snippet card | `code`, `language` |

---

## 5. Visual Style Guide (Engineer Handbook Style)

The current style is inspired by a "terminal / engineer handbook" aesthetic optimized for classroom projectors.

### Arrow Labels
- Use **pill-badge labels** on arrows (rounded rect background with protocol text)
- Arrow labels use `FONTS.code` (Consolas) for technical protocol names
- Example: `addHArrow(slide, pres, { label: "HTTP", color: COLORS.frontend })`

### Node Cards
- Use **color-matched names** via `nameColor` option
- Node border and name text should use the same component color
- Example: `addNodeCard(slide, pres, { name: "Nginx", borderColor: COLORS.frontend, nameColor: COLORS.frontend })`

### Insight Bars
- Use `addCommentBar()` for code-comment style (`// insight message`)
- Use `addTipBar()` for tips at slide bottom
- Use `addAlertBar()` for pain points and warnings

### Knowledge Cards
- Use `addKnowledgeCards()` for bottom 3-column educational content
- Each card has a color-coded top accent strip
- Keep titles short, body text concise

### Response Arrows
- Use `addDashedHArrow()` for response/reverse flows
- Dashed lines visually distinguish request from response

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Slide title | Calibri | 16pt | Bold |
| Part label | Calibri | 8.5pt | Normal |
| Body text | Calibri | 10.5pt | Bold for titles |
| Sub-text | Calibri | 9pt | Normal |
| Code | Consolas | 9.5pt | Normal |
| Labels/tags | Consolas | 7.5pt | Bold |
| Big metrics | Calibri | 34pt | Bold |

---

## 6. Slide Template Types

| Template | Use Case | Key Elements |
|----------|----------|-------------|
| T1 | Cover page | Big title, journey cards on right |
| T2 | Part opener | Large part number, bullet list of topics |
| T3 | Architecture diagram | Diagram top 65%, pros/cons bottom 35% via `addBottomPanel` |
| T4 | Comparison | Left/right dual column via `addCompareHeading` + `addCompareItem` |
| T5 | Concept explanation | Large icon left, 3-4 bullets right |
| T6 | Code page | Dark code card + diagram via `addCodeCard` |
| T7 | Part summary | 2x3 card grid via `addSummaryCard` |

---

## 7. Language

- **All user-visible text must be in English.** No Chinese text in rendered content.
- Code comments in source files may remain in Chinese (not rendered).
- Code snippets inside `addCodeCard` should use English comments.

---

## 8. Build & QA

### Build Commands

```bash
# Generate a single part
node src/part1.js          # outputs output/part1.pptx

# Merge all parts into final deck
node src/merge.js          # outputs output/cloud_native_slides_final.pptx
```

### QA Checklist

- All architecture diagrams use icons/emojis, not ASCII art
- Component colors match the design system table
- Complexity bar progresses correctly across parts
- No text overflow or element overlap
- No Chinese text in rendered slide content
- Slide fills the canvas — no large empty areas
- Fonts render correctly (Calibri for text, Consolas for code)

### No Test Suite

Visual QA only. Open the generated `.pptx` files in PowerPoint/Google Slides to verify rendering.

---

## 9. Shape Types

Always use `pres.ShapeType.*` for shapes:
- `pres.ShapeType.rect` — rectangle
- `pres.ShapeType.roundRect` — rounded rectangle
- `pres.ShapeType.ellipse` — circle/ellipse
- `pres.ShapeType.line` — line/arrow

The `pres` object must be passed into helper functions for shape access.

---

## 10. Commit Convention

```
feat: add Part N slides (description)
fix: correct [issue] in partN
style: update theme/colors for projector readability
```
