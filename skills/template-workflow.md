# Template Workflow — Working with .pptx Master Templates

> Two-stage workflow: generate content with pptxgenjs (Node.js), then apply an
> organization's branded .pptx master template via python-pptx (Python).
> The script `src/apply-template.py` is the authoritative implementation.

## When Do You Need This?

| Scenario | Use Template? |
|----------|--------------|
| Personal / internal presentation | ❌ Built-in design system is enough |
| Organization requires branded master slides | ✅ Apply template post-generation |
| Conference submission with required format | ✅ Apply template post-generation |
| Quick prototype / draft | ❌ Skip template step |

---

## Why Common Approaches Fail

> **Read this before writing any code.** Every "obvious" approach breaks.

### ❌ Approach 1 — Change slide.slide_layout on existing slides

```python
slide.slide_layout = template.slide_layouts[6]  # DOES NOT WORK
```

python-pptx's `slide_layout` property is read-only after slide creation.
Assigning a new layout does not change the master and raises no error —
it silently does nothing.

### ❌ Approach 2 — Copy slide master XML directly into content .pptx

```python
content.slide_masters.append(template.slide_masters[0])  # DOES NOT WORK
```

The `slide_masters` collection has no `append` method. Attempting to
manipulate the OOXML `<p:sldMasterIdLst>` directly orphans relationships
and produces a corrupt file that PowerPoint must repair.

### ❌ Approach 3 — Set content.slide_master = template.slide_master

```python
content.slide_master = template.slide_masters[0]  # DOES NOT WORK
```

`slide_master` is not a settable attribute on a `Presentation` object.

### ✅ The Only Reliable Approach — Create slides INSIDE the template

Because a slide always inherits its master from the `Presentation` object
it belongs to, the only way to attach a template's master to new slides is
to **add slides directly into the template `Presentation` object**, then
copy content shapes into those slides.

Steps:
1. Open the template `.pptx` as a `Presentation` — it already carries the master.
2. **Remove** any pre-existing slides from the template (cleanly, via `drop_rel`).
3. Add blank slides using `template.slides.add_slide(blank_layout)`.
4. Copy every shape node from the content slide into the new slide's `spTree`.
5. Scale all position/size XML attributes to match the template canvas.
6. Save the template `Presentation` — the output has the master baked in.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Stage 1 — Node.js (pptxgenjs)   content generation          │
│                                                              │
│  design-system.js ──→ COLORS / FONTS constants               │
│  helpers.js       ──→ shared slide components                │
│  partN.js         ──→ per-topic slide script                 │
│                                                              │
│  Canvas: fixed 10" × 5.5"  (virtual coordinate space)       │
└──────────────────────────┬───────────────────────────────────┘
                           │  node src/partN.js
                           ▼
                  output/partN.pptx   (10"×5.5", no master)
                           │
                           │  python3 src/apply-template.py
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Stage 2 — Python (python-pptx)   template application       │
│                                                              │
│  1. Read templates/template.pptx — get target canvas size    │
│  2. Compute scale factors:                                   │
│       sx = template_width_emu  / content_width_emu           │
│       sy = template_height_emu / content_height_emu          │
│       font_scale = (sx + sy) / 2                             │
│  3. Remove pre-existing slides from template (drop_rel)      │
│  4. For each content slide:                                  │
│       a. Add blank slide using template's Blank layout       │
│       b. Deep-copy every shape from content slide            │
│       c. Scale all <a:xfrm> off/ext values by sx / sy        │
│       d. Scale all <a:sz> font sizes by font_scale           │
│       e. Append shapes to the new slide's spTree             │
│  5. Save → output/partN_templated.pptx                       │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
              output/partN_templated.pptx  (template size, has master)
```

---

## Complete Script — `src/apply-template.py`

> This is the authoritative, working implementation. Do not simplify or
> restructure it — every section exists for a specific reason.

```python
#!/usr/bin/env python3
"""
Apply a .pptx master template to a content-only .pptx.

Strategy:
  1. Open the content pptx (10" x 5.5" from pptxgenjs).
  2. Create a new presentation using the template as its slide master.
  3. For each content slide, add a blank slide (template's Blank layout),
     then copy all shapes into it — scaling every position/size from the
     source canvas to the target canvas.
  4. Save the result.

Usage:
  python3 src/apply-template.py output/part1.pptx templates/template.pptx output/part1_templated.pptx
"""

import sys
import copy
import lxml.etree as etree
from pptx import Presentation
from pptx.util import Emu
from pptx.oxml.ns import qn

EMU_PER_INCH = 914400


def scale_xfrm(xfrm_el, sx, sy):
    """Scale <a:xfrm> off/ext/chOff/chExt in-place."""
    for tag, xscale, yscale in [
        (qn("a:off"),   sx, sy),
        (qn("a:ext"),   sx, sy),
        (qn("a:chOff"), sx, sy),
        (qn("a:chExt"), sx, sy),
    ]:
        el = xfrm_el.find(tag)
        if el is None:
            continue
        if "x" in el.attrib:
            el.attrib["x"] = str(int(round(int(el.attrib["x"]) * xscale)))
        if "y" in el.attrib:
            el.attrib["y"] = str(int(round(int(el.attrib["y"]) * yscale)))
        if "cx" in el.attrib:
            el.attrib["cx"] = str(int(round(int(el.attrib["cx"]) * xscale)))
        if "cy" in el.attrib:
            el.attrib["cy"] = str(int(round(int(el.attrib["cy"]) * yscale)))


def scale_shape_tree(spTree, sx, sy):
    """Recursively scale every <a:xfrm> found inside spTree."""
    for xfrm in spTree.iter(qn("a:xfrm")):
        scale_xfrm(xfrm, sx, sy)


def scale_font_sizes(spTree, scale):
    """Scale font sizes (<a:sz> values are in hundredths of a point)."""
    for sz_el in spTree.iter(qn("a:sz")):
        try:
            val = int(sz_el.attrib["val"])
            sz_el.attrib["val"] = str(int(round(val * scale)))
        except (KeyError, ValueError):
            pass


def apply_template(content_path, template_path, output_path):
    content  = Presentation(content_path)
    template = Presentation(template_path)

    # Derive target canvas from template (auto — no hardcoding needed)
    tgt_w_emu = template.slide_width
    tgt_h_emu = template.slide_height
    src_w_emu = content.slide_width
    src_h_emu = content.slide_height

    sx         = tgt_w_emu / src_w_emu
    sy         = tgt_h_emu / src_h_emu
    font_scale = (sx + sy) / 2

    print(f"Source : {src_w_emu/EMU_PER_INCH:.2f}\" x {src_h_emu/EMU_PER_INCH:.2f}\"")
    print(f"Target : {tgt_w_emu/EMU_PER_INCH:.2f}\" x {tgt_h_emu/EMU_PER_INCH:.2f}\"")
    print(f"Scale  : sx={sx:.4f}  sy={sy:.4f}  font={font_scale:.4f}")

    # ── Remove pre-existing slides from template (clean OOXML removal) ────────
    # We must use drop_rel() to remove both the sldId entry AND the package
    # relationship. Removing only from sldIdLst leaves an orphaned part in the
    # zip and causes PowerPoint's "duplicate name" repair warning.
    prs_part = template.part
    sldIdLst  = template.element.find(qn("p:sldIdLst"))
    for sldId in list(sldIdLst):
        rId = sldId.get(
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
        )
        if rId:
            try:
                prs_part.drop_rel(rId)
            except Exception:
                pass
        sldIdLst.remove(sldId)

    # ── Choose the most minimal layout so the master background shows ─────────
    # Layout index 6 is "Blank" in most standard templates.
    # Run the inspection command (see Porting section) to confirm the index
    # for your specific template, then change the number here if needed.
    blank_layout = template.slide_layouts[6]

    # ── Copy each content slide into the template presentation ────────────────
    for slide_idx, src_slide in enumerate(content.slides):
        new_slide   = template.slides.add_slide(blank_layout)
        dst_spTree  = new_slide.shapes._spTree
        src_spTree  = src_slide.shapes._spTree

        for child in src_spTree:
            tag = child.tag.split("}")[-1]
            # nvGrpSpPr and grpSpPr are group-level metadata for the spTree
            # itself — they must not be copied as child shapes.
            if tag in ("nvGrpSpPr", "grpSpPr"):
                continue
            node = copy.deepcopy(child)
            scale_shape_tree(node, sx, sy)
            scale_font_sizes(node, font_scale)
            dst_spTree.append(node)

        print(f"  slide {slide_idx + 1:02d} → copied {len(src_spTree) - 2} shapes")

    template.save(output_path)
    print(f"\n✅  Saved: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python3 apply-template.py <content.pptx> <template.pptx> <output.pptx>")
        sys.exit(1)
    apply_template(sys.argv[1], sys.argv[2], sys.argv[3])
```

---

## Setup

```bash
pip3 install python-pptx
```

Place your template:
```
templates/
  template.pptx    # one file — the script always uses this name
```

---

## Usage

```bash
# Single part
python3 src/apply-template.py \
  output/part1.pptx \
  templates/template.pptx \
  output/part1_templated.pptx

# All parts (bash loop)
for f in output/part*.pptx; do
  base=$(basename "$f" .pptx)
  python3 src/apply-template.py "$f" templates/template.pptx "output/${base}_templated.pptx"
done
```

---

## Porting to a New Internal Project

Follow these steps when bringing this workflow into a different codebase with
a different template.

### Step 1 — Drop in your template

```bash
cp your-company-template.pptx templates/template.pptx
```

### Step 2 — Inspect the template canvas and layouts

Run this before touching any code:

```bash
python3 - <<'EOF'
from pptx import Presentation
prs = Presentation("templates/template.pptx")
print(f"Canvas: {prs.slide_width.inches:.4f}\" x {prs.slide_height.inches:.4f}\"")
print(f"Slides in template file: {len(prs.slides)}")
print()
for i, layout in enumerate(prs.slide_layouts):
    print(f"  layout[{i}]  {layout.name}")
print()
master = prs.slide_masters[0]
print(f"Master shapes ({len(master.shapes)} total):")
for sh in master.shapes:
    t = sh.top    / 914400
    b = (sh.top + sh.height) / 914400
    l = sh.left   / 914400
    r = (sh.left + sh.width) / 914400
    print(f"  {sh.name!r:30s}  y={t:.2f}\"→{b:.2f}\"  x={l:.2f}\"→{r:.2f}\"")
EOF
```

Things to note from the output:

| Output field | What to do |
|---|---|
| **Canvas size** | Scale factors are auto-computed — no code change needed |
| **layout[N] Blank** | Use that N in `blank_layout = template.slide_layouts[N]` |
| **Master shapes y ranges** | Convert to source space (÷ sy) to find safe zones |

### Step 3 — Find the correct Blank layout index

The script defaults to `slide_layouts[6]`. If your template's Blank layout
is at a different index (from the Step 2 output), edit line 103 of
`src/apply-template.py`:

```python
blank_layout = template.slide_layouts[6]  # ← change 6 to your index
```

If there is **no Blank layout**, use whichever layout has the fewest
placeholder shapes — that minimises visual interference with your content.

### Step 4 — Audit master safe zones and adjust helpers.js

Map the master's y-ranges back to the **source coordinate space**:

```
source_y = master_y_inches / sy
```

where `sy = template_height / source_height` (printed by the script).

In `src/helpers.js`, adjust the boundary constants so generated content
avoids the master's occupied regions:

```js
const HEADER_H = 0.52;  // ← increase if master header bar is taller
const BOTTOM_H = 1.95;  // ← increase if master footer/logo bar is taller
```

Example: master has a bottom bar at y=6.9" on a 7.5" target canvas.
That occupies the bottom `7.5 - 6.9 = 0.6"` of the target.
In source space: `0.6 / 1.364 ≈ 0.44"`.
So set `BOTTOM_H` to at least `1.95 + 0.44 = 2.39"` to stay clear.

### Step 5 — Run and verify

```bash
node src/part1.js
python3 src/apply-template.py \
  output/part1.pptx templates/template.pptx output/part1_templated.pptx
```

Open `output/part1_templated.pptx` and check:
- [ ] Master background / branding elements appear on every slide
- [ ] Content does not overlap master header or footer bars
- [ ] Font sizes look proportional (not too large or too small)
- [ ] No shapes are clipped at slide edges
- [ ] Slide count matches the source (no extra blank slides)

---

## How `apply-template.py` Works Internally

### Scale factor derivation

```
sx          = template_width_emu  / content_width_emu
sy          = template_height_emu / content_height_emu
font_scale  = (sx + sy) / 2    ← average to avoid over-scaling one axis
```

> ⚠️ If source and target aspect ratios differ (e.g. 10:5.5 ≠ 13.33:7.5),
> then `sx ≠ sy` and square shapes become slightly rectangular.
> This is visually minor for most content. See Caveats.

### XML elements that are scaled

| XML element | Attributes scaled |
|-------------|------------------|
| `<a:xfrm>/<a:off>` | `x` × sx, `y` × sy |
| `<a:xfrm>/<a:ext>` | `cx` × sx, `cy` × sy |
| `<a:xfrm>/<a:chOff>` | `x` × sx, `y` × sy |
| `<a:xfrm>/<a:chExt>` | `cx` × sx, `cy` × sy |
| `<a:sz>` | `val` × font_scale |

### Elements intentionally **not** scaled

| Element | Reason |
|---------|--------|
| Line widths `<a:ln w="...">` | Hairlines stay hairlines |
| Shadow offsets / blur | Visual noise; scaling rarely improves result |
| Image pixel data | Only bounding box is scaled; binary data is unchanged |
| Theme / scheme colors | Inherited from template master automatically |

---

## Caveats & Known Limitations

> ⚠️ **Aspect ratio mismatch distorts circles**
> If `sx ≠ sy`, circles (`ShapeType.ellipse` with equal `cx`/`cy`) become
> ellipses. To eliminate this: switch the source canvas in `helpers.js` to
> exactly match the template dimensions (`W = 13.33, H = 7.5`), then
> regenerate all slides before applying the template.

> ⚠️ **Blank layout index is not always 6**
> Always run the Step 2 inspection on any new template. Using the wrong
> layout index causes placeholder shapes to appear over your content.

> ⚠️ **Placeholder fields (title, footer, date, slide number) stay empty**
> The Blank layout has no active placeholders, so those fields are not
> populated. If your organization requires them, switch to a layout that
> has those placeholders and populate them with python-pptx after copying
> shapes.

> ⚠️ **Corporate fonts must be installed locally**
> The script copies `<a:latin typeface="..."/>` references. If the template
> uses a proprietary font that is not installed on the machine opening the
> file, PowerPoint will substitute a fallback font and layout will shift.

> ⚠️ **Images copy correctly via relationship re-embedding**
> `copy.deepcopy` copies only the XML node. python-pptx re-embeds image
> binary data when the node is appended to the new slide part. If images
> appear as red X placeholders, verify the source was generated with
> pptxgenjs ≥ 3.x and that images were added via `slide.addImage()`.

> ⚠️ **Never run apply-template.py on an already-templated file**
> The script scales coordinates on every run. Running it twice on the same
> file doubles all positions/sizes and produces garbage. Always source from
> the raw `output/partN.pptx` (Node.js output), never from
> `output/partN_templated.pptx`.

---

## Rules

1. **Template is the visual layer only** — validate content on raw Node.js output first.
2. **Never edit `_templated.pptx` files manually** — they are generated artifacts.
3. **One template per build** — exactly one `.pptx` in `templates/`.
4. **Content-first** — if master safe zones clash with content, adjust `helpers.js`, not the template.
5. **Always inspect before porting** — run the Step 2 inspection script on every new template.

## When Do You Need This?

| Scenario | Use Template? |
|----------|--------------|
| Personal / internal presentation | ❌ Built-in design system is enough |
| Organization requires branded master slides | ✅ Apply template post-generation |
| Conference submission with required format | ✅ Apply template post-generation |
| Quick prototype / draft | ❌ Skip template step |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Stage 1 — Node.js (pptxgenjs)   content generation          │
│                                                              │
│  design-system.js ──→ COLORS / FONTS constants               │
│  helpers.js       ──→ shared slide components                │
│  partN.js         ──→ per-topic slide script                 │
│                                                              │
│  Canvas: fixed 10" × 5.5"  (virtual coordinate space)       │
└──────────────────────────┬───────────────────────────────────┘
                           │  node src/partN.js
                           ▼
                  output/partN.pptx   (10"×5.5", no master)
                           │
                           │  python3 src/apply-template.py
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Stage 2 — Python (python-pptx)   template application       │
│                                                              │
│  1. Read templates/template.pptx — get target canvas size    │
│  2. Compute scale factors:                                   │
│       sx = template_width_emu  / content_width_emu           │
│       sy = template_height_emu / content_height_emu          │
│       font_scale = (sx + sy) / 2                             │
│  3. Remove pre-existing slides from template cleanly         │
│  4. For each content slide:                                  │
│       a. Add blank slide using template's Blank layout       │
│       b. Deep-copy every shape from content slide            │
│       c. Scale all <a:xfrm> off/ext values by sx / sy        │
│       d. Scale all <a:sz> font sizes by font_scale           │
│       e. Append shapes to the new slide's spTree             │
│  5. Save → output/partN_templated.pptx                       │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
              output/partN_templated.pptx  (template size, has master)
```

**Why this approach (scale + copy, not merge)?**

python-pptx has no public API to swap a slide's master after the fact.
The only reliable method is to create slides *inside* the template presentation
(which already carries the master), then copy content shapes into them.
Scaling is necessary because the source canvas (10×5.5") differs from the
template canvas (typically 13.33×7.5").

---

## Setup

```bash
pip3 install python-pptx
```

Place your template:
```
templates/
  template.pptx    # one file — the script always uses this name
```

---

## Usage

```bash
# Single part
python3 src/apply-template.py \
  output/part1.pptx \
  templates/template.pptx \
  output/part1_templated.pptx

# All parts (bash loop)
for f in output/part*.pptx; do
  base=$(basename "$f" .pptx)
  python3 src/apply-template.py "$f" templates/template.pptx "output/${base}_templated.pptx"
done
```

---

## Porting to a New Internal Project

Follow these steps when bringing this workflow into a different codebase with
a different template.

### Step 1 — Drop in your template

```bash
cp your-company-template.pptx templates/template.pptx
```

### Step 2 — Inspect the template canvas and layouts

```bash
python3 - <<'EOF'
from pptx import Presentation
prs = Presentation("templates/template.pptx")
print(f"Canvas: {prs.slide_width.inches:.4f}\" x {prs.slide_height.inches:.4f}\"")
print(f"Slides in template: {len(prs.slides)}")
for i, layout in enumerate(prs.slide_layouts):
    print(f"  layout[{i}]  {layout.name}")
print()
master = prs.slide_masters[0]
print(f"Master shapes: {len(master.shapes)}")
for sh in master.shapes:
    print(f"  [{sh.shape_type}] {sh.name!r}  pos=({sh.left/914400:.2f}, {sh.top/914400:.2f})  size=({sh.width/914400:.2f}x{sh.height/914400:.2f})")
EOF
```

Things to note:
- **Canvas size** → scale factors are computed automatically; no code change needed.
- **Layout index** → find the most minimal layout (usually named "Blank").
  If the index is not 6, update line 103 of `apply-template.py`:
  ```python
  blank_layout = template.slide_layouts[N]  # use the index from inspection
  ```
- **Master shapes** → note any decorative bars, logos, or footers the master
  places on every slide. You may need to leave safe zones in your content
  (adjust `HEADER_H` / `BOTTOM_H` in `helpers.js`) so content does not
  overlap them after scaling.

### Step 3 — Inspect the master's occupied zones (safe-zone audit)

```bash
python3 - <<'EOF'
from pptx import Presentation
prs = Presentation("templates/template.pptx")
master = prs.slide_masters[0]
W = prs.slide_width.inches
H = prs.slide_height.inches
for sh in master.shapes:
    t  = sh.top    / 914400
    b  = (sh.top + sh.height) / 914400
    l  = sh.left   / 914400
    r  = (sh.left + sh.width) / 914400
    print(f"{sh.name!r:30s}  top={t:.2f}\" bottom={b:.2f}\"  left={l:.2f}\" right={r:.2f}\"")
EOF
```

Map the occupied pixels back to the **source coordinate space** (÷ sx or sy)
to know which y-ranges are already claimed by the master in source inches.

### Step 4 — Adjust safe zones in helpers.js if needed

In `src/helpers.js`, the key constants are:

```js
const W        = 10;    // source canvas width
const H        = 5.5;   // source canvas height
const HEADER_H = 0.52;  // top bar height — increase if master header is taller
const BOTTOM_H = 1.95;  // bottom panel height
const BOTTOM_Y = H - BOTTOM_H;
```

Example: if the master has a bottom logo bar occupying the bottom 0.6" of the
target (7.5" canvas), then in source space that is `0.6 / sy ≈ 0.44"`.
Increase `BOTTOM_H` by at least that amount so generated content stays clear.

### Step 5 — Run and verify

```bash
node src/part1.js
python3 src/apply-template.py \
  output/part1.pptx templates/template.pptx output/part1_templated.pptx
```

Open `output/part1_templated.pptx` and check:
- [ ] Master background / branding elements appear
- [ ] Content does not overlap master header or footer bars
- [ ] Font sizes look proportional (not too big or too small)
- [ ] No shapes are clipped at slide edges

---

## How `apply-template.py` Works Internally

### Scale factor derivation

```
source  : content.slide_width  / content.slide_height   (EMU)
target  : template.slide_width / template.slide_height  (EMU)

sx          = target_width_emu  / source_width_emu
sy          = target_height_emu / source_height_emu
font_scale  = (sx + sy) / 2          ← average to avoid over-scaling
```

> ⚠️ **Note:** `sx` and `sy` will differ if the source and target have
> different aspect ratios (e.g. 10:5.5 = 1.818 vs 13.33:7.5 = 1.778).
> Shapes that are exactly square in the source will become very slightly
> rectangular in the output. This is visually negligible for most content
> but noticeable for circle/icon shapes. See Caveats below.

### XML elements that are scaled

| XML element | Attributes scaled |
|-------------|------------------|
| `<a:xfrm>/<a:off>` | `x` × sx, `y` × sy |
| `<a:xfrm>/<a:ext>` | `cx` × sx, `cy` × sy |
| `<a:xfrm>/<a:chOff>` | `x` × sx, `y` × sy |
| `<a:xfrm>/<a:chExt>` | `cx` × sx, `cy` × sy |
| `<a:sz>` | `val` × font_scale |

### Elements that are **not** scaled

| Element | Reason |
|---------|--------|
| Line widths (`<a:ln w="...">`) | Intentionally unchanged — hairlines stay hairlines |
| Shadow offsets / blur | Minor visual element; scaling would rarely improve appearance |
| Image pixel data | Only the bounding box is scaled; image content is unchanged |
| Theme / scheme colors | Inherited from the template master automatically |

---

## Caveats & Known Limitations

> ⚠️ **Aspect ratio mismatch distorts circles**
> If `sx ≠ sy`, a perfect circle (equal `cx` and `cy`) in the source will
> become an ellipse. Fix: use `pres.ShapeType.ellipse` only for decorative
> purposes, or switch the source canvas to 13.33×7.5 in `helpers.js` to
> eliminate the mismatch entirely.

> ⚠️ **Template's Blank layout index may not be 6**
> Different templates number layouts differently. Always run the inspection
> command (Step 2) and verify before running on a new template.

> ⚠️ **Template placeholder content is not populated**
> The script uses the "Blank" layout and copies raw shapes, so PowerPoint
> placeholder fields (title, footer, slide number, date) remain unpopulated.
> If your organization requires those fields, switch to a layout with
> placeholders and fill them via python-pptx after copying shapes.

> ⚠️ **Fonts must be installed on the target machine**
> The script copies font face references (`<a:latin typeface="..."/>`).
> If the template uses a proprietary corporate font, that font must be
> installed on any machine that opens the output .pptx.

> ⚠️ **Images embedded in content slides are copied correctly**
> Shape copy uses `copy.deepcopy` on the XML node only. python-pptx resolves
> relationship IDs when appending the node to the new slide's part, so image
> binary data is re-embedded correctly. If images appear broken, check that
> the source .pptx was generated with pptxgenjs ≥ 3.x.

> ⚠️ **Do not run apply-template.py on an already-templated file**
> Running the script twice on the same output will double-scale all coordinates.
> Always use the raw `output/partN.pptx` (from Node.js) as the source, never
> `output/partN_templated.pptx`.

---

## Rules

1. **Template is the visual layer only** — content correctness is validated on the raw Node.js output first.
2. **Never edit `_templated.pptx` files manually** — they are generated artifacts; re-run the script instead.
3. **One template per build** — place exactly one `.pptx` in `templates/`.
4. **Content-first** — if the template's safe zones clash with content, adjust `helpers.js` constants, not the template.
