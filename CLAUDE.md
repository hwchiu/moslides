# CLAUDE.md — Operating Manual for Claude Code

> This file is read automatically at the start of every Claude Code session.
> It is the single source of truth for how to work in this repository.
> Read it fully before writing any code or running any command.

---

## What This Project Does

Programmatically generates professional slide decks (`.pptx`) using **pptxgenjs** (Node.js).
Each topic is a standalone script in `src/` that produces a `.pptx` in `output/`.
An optional Python step applies a branded `.pptx` master template on top.

---

## Project Structure

```
src/
  design-system.js     Color + font tokens. Single source of truth. NEVER hardcode colors.
  helpers.js           All shared slide components (header, cards, arrows, panels…).
  icon-helper.js       Converts react-icons → PNG base64 for embedding in slides.
  apply-template.py    Applies templates/template.pptx to any generated .pptx.
  merge.js             Merges multiple part .pptx files into one final deck.
  <topic>.js           One file per topic/part — this is what you write.

templates/
  template.pptx        The branded master template. Replace with your own.

output/                Generated .pptx files (do not commit).
skills/                Documentation — read before generating any slides.
```

---

## Commands

```bash
# Generate slides for one topic
node src/<topic>.js                    # → output/<topic>.pptx

# Apply the branded template
python3 src/apply-template.py \
  output/<topic>.pptx \
  templates/template.pptx \
  output/<topic>_templated.pptx

# Merge all parts into one deck
node src/merge.js                      # → output/cloud_native_slides_final.pptx

# Install dependencies (first time only)
npm install
pip3 install python-pptx
```

---

## Mandatory Reading Order (before writing slide code)

Read these skills files in this order. Do not skip any.

| # | File | Read When |
|---|------|-----------|
| 1 | `skills/anti-patterns.md` | **Always — read first, every time** |
| 2 | `skills/design-tokens.md` | Whenever using COLORS or FONTS |
| 3 | `skills/helpers-api.md` | To know which helper function to call |
| 4 | `skills/layout-guide.md` | For positioning and safe-zone rules |
| 5 | `skills/cookbook.md` | For copy-paste patterns (cover, section, diagram…) |
| 6 | `skills/decision-trees.md` | When unsure which helper/pattern to use |
| 7 | `skills/template-workflow.md` | For applying a .pptx master template |
| 8 | `skills/setup.md` | For dependency installation only |

---

## How to Create Slides for a New Topic

### Step 1 — Create `src/<topic>.js`

```js
const pptxgen = require("pptxgenjs");
const { COLORS, FONTS, setTheme } = require("./design-system");
setTheme("light");                              // ← REQUIRED. Always call this first.
const { initSlide, addSlideHeader, ... } = require("./helpers");

async function main() {
  const pres = new pptxgen();
  pres.defineLayout({ name: "WIDE", width: 10, height: 5.5 });
  pres.layout = "WIDE";

  // --- Slide 1 ---
  const slide1 = initSlide(pres);
  addSlideHeader(slide1, pres, { title: "My Title", partLabel: "PART 1  ·  01" });
  // ... add content ...

  await pres.writeFile({ fileName: "output/<topic>.pptx" });
  console.log("✅ output/<topic>.pptx written");
}
main();
```

### Step 2 — Run it

```bash
node src/<topic>.js
```

### Step 3 — Apply template (if required)

```bash
python3 src/apply-template.py \
  output/<topic>.pptx \
  templates/template.pptx \
  output/<topic>_templated.pptx
```

See `skills/template-workflow.md` for the full explanation, especially the
**"Why Common Approaches Fail"** section — the obvious python-pptx approaches
all silently break. Use only the method documented there.

---

## Non-Negotiable Rules

Violating any of these will produce broken or inconsistent output.

1. **`setTheme("light")` must be the first call** after requiring design-system.
   Without it, COLORS still contains dark theme values.

2. **Never hardcode colors.**
   Always use `COLORS.*` from design-system.js.
   ```js
   // ❌  fill: { color: "58A6FF" }
   // ✅  fill: { color: COLORS.accent }
   ```

3. **Always pass `pres` into helpers that draw shapes.**
   Helper functions need `pres.ShapeType.*` to draw rectangles, lines, etc.
   ```js
   addSlideHeader(slide, pres, { title: "..." });  // pres is the second arg
   ```

4. **All text must be in English.** No Chinese in rendered slide content.
   (JS source code comments may remain in Chinese.)

5. **`apply-template.py` must never be run on an already-templated file.**
   Always source from the raw `output/<topic>.pptx`, never from
   `output/<topic>_templated.pptx`. Running it twice double-scales everything.

6. **Do not edit `_templated.pptx` files.** They are generated artifacts.
   Re-run the script to update them.

---

## Component Color Map

Every architecture component has a designated color. Use these consistently.

| Component | Token | Hex (light theme) |
|-----------|-------|-------------------|
| Frontend / Nginx | `COLORS.frontend` | `5B8DB8` |
| Backend / App Server | `COLORS.backend` | `5A9B6E` |
| Database | `COLORS.database` | `C4804A` |
| Infra / LB / Cache / MQ | `COLORS.infra` | `8B6AB5` |
| Container / Pod | `COLORS.container` | `4A9B8E` |
| Client / Browser | `COLORS.client` | `908880` |

---

## Canvas Coordinate System

```
(0, 0) ──────────────────────── (10, 0)
  │                                  │
  │   Safe content area              │
  │   x: 0.15 → 9.85                │
  │   y: 0.52 → 5.35                │  ← below header, above bottom panel
  │                                  │
(0, 5.5) ─────────────────────(10, 5.5)
```

- All values are **inches as floats**
- Header occupies y = 0 → 0.52 (managed by `addSlideHeader`)
- Bottom panel occupies y = 3.55 → 5.5 (managed by `addBottomPanel`)
- Do not place content outside the safe area

---

## Template Workflow — Quick Reference

> Full explanation in `skills/template-workflow.md`.

**Before using a new template, run this inspection first:**

```bash
python3 - <<'EOF'
from pptx import Presentation
prs = Presentation("templates/template.pptx")
print(f"Canvas: {prs.slide_width.inches:.4f}\" x {prs.slide_height.inches:.4f}\"")
for i, layout in enumerate(prs.slide_layouts):
    print(f"  layout[{i}]  {layout.name}")
master = prs.slide_masters[0]
for sh in master.shapes:
    t = sh.top / 914400; b = (sh.top + sh.height) / 914400
    print(f"  master shape: {sh.name!r}  y={t:.2f}\"→{b:.2f}\"")
EOF
```

**Key things to check:**
- The index of the "Blank" layout → update line 103 of `apply-template.py` if not 6
- The y-range of master header/footer shapes → adjust `HEADER_H` / `BOTTOM_H` in `helpers.js`

---

## Dependency Versions (tested)

| Package | Version |
|---------|---------|
| Node.js | v18+ (v24 tested) |
| pptxgenjs | 4.0.1 |
| react / react-dom | 19.x |
| react-icons | 5.x |
| sharp | 0.34.x |
| Python | 3.8+ (3.11 tested) |
| python-pptx | latest |
