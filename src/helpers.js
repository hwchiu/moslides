// src/helpers.js
// Shared slide-building utilities used by all Part scripts.
// Slide canvas: 10" wide x 5.5" tall (pptxgenjs widescreen default).

const { COLORS, FONTS } = require("./design-system");

// ── Canvas constants ──────────────────────────────────────────────────────────
const W        = 10;     // slide width (inches)
const H        = 5.5;    // slide height
const HEADER_H = 0.52;   // standard header height
const BOTTOM_H = 1.95;   // two-column bottom panel height
const BOTTOM_Y = H - BOTTOM_H; // 3.55 — top of bottom panel

// ── Slide initialisation ──────────────────────────────────────────────────────

/** Create a new slide with the standard dark background. */
function initSlide(pres) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.bg };
  return slide;
}

// ── Header ────────────────────────────────────────────────────────────────────

/**
 * Standard slide header bar.
 *
 * opts:
 *   title        {string}  – main title
 *   partLabel    {string}  – top-right label, e.g. "PART 1  ·  03 / 50"
 *   accentColor  {string}  – hex color of left accent strip (default: COLORS.accent)
 *   complexity   {number}  – 1-10; omit to hide the bar
 *   maxComplexity{number}  – default 10
 */
function addSlideHeader(slide, pres, opts = {}) {
  const {
    title        = "",
    partLabel    = "",
    accentColor  = COLORS.accent,
    complexity   = null,
    maxComplexity= 10,
  } = opts;

  // Background
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: W, h: HEADER_H,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.border, width: 0.5 },
  });

  // Left accent strip
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0.09, w: 0.05, h: HEADER_H - 0.18,
    fill: { color: accentColor },
    line: { color: accentColor, width: 0 },
  });

  // Title
  slide.addText(title, {
    x: 0.18, y: 0, w: 6.5, h: HEADER_H,
    fontSize: 16, bold: true, color: COLORS.text,
    fontFace: FONTS.title, valign: "middle",
  });

  // Complexity meter (optional)
  if (complexity !== null) {
    const ratio     = complexity / maxComplexity;
    const fillColor = ratio >= 0.8 ? COLORS.danger
                    : ratio >= 0.5 ? COLORS.warning
                    : COLORS.success;
    const bx = 6.75, by = 0.12, bw = 1.05, bh = 0.09;

    slide.addText(`Complexity  ${complexity}/${maxComplexity}`, {
      x: bx, y: 0.01, w: bw, h: 0.15,
      fontSize: 7.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
    slide.addShape(pres.ShapeType.rect, {
      x: bx, y: by, w: bw, h: bh,
      fill: { color: COLORS.meterBg }, line: { color: COLORS.meterBg, width: 0 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x: bx, y: by, w: Math.max(0.04, bw * ratio), h: bh,
      fill: { color: fillColor }, line: { color: fillColor, width: 0 },
    });
  }

  // Part / slide label (top-right)
  if (partLabel) {
    slide.addText(partLabel, {
      x: 7.8, y: 0, w: 2.1, h: HEADER_H,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
      align: "right", valign: "middle",
    });
  }
}

// ── Bottom panel ──────────────────────────────────────────────────────────────

/**
 * Two-column bottom panel: green (pros) left, red (cons) right.
 *
 * Each item can be a plain string or { title, sub }.
 * opts: { y, h }
 */
function addBottomPanel(slide, pres, pros = [], cons = [], opts = {}) {
  const { y = BOTTOM_Y, h = BOTTOM_H } = opts;
  const midX = W / 2;

  slide.addShape(pres.ShapeType.rect, {
    x: 0, y, w: midX, h,
    fill: { color: COLORS.cardSuccess },
    line: { color: COLORS.success, width: 0.5 },
  });
  slide.addShape(pres.ShapeType.rect, {
    x: midX, y, w: midX, h,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 0.5 },
  });

  slide.addText("✅  Advantages", {
    x: 0.2, y: y + 0.1, w: midX - 0.3, h: 0.28,
    fontSize: 10.5, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("⚠️  Limitations", {
    x: midX + 0.2, y: y + 0.1, w: midX - 0.3, h: 0.28,
    fontSize: 10.5, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });

  const rowCount = Math.max(pros.length, cons.length, 2);
  const rowH     = Math.min((h - 0.48) / rowCount, 0.54);

  const renderRow = (items, offsetX, color) => {
    items.forEach((item, i) => {
      const ry   = y + 0.44 + i * rowH;
      const text = typeof item === "string" ? item : item.title;
      const sub  = typeof item === "object"  ? (item.sub || "") : "";
      slide.addShape(pres.ShapeType.ellipse, {
        x: offsetX + 0.18, y: ry + 0.05, w: 0.16, h: 0.16,
        fill: { color }, line: { color, width: 0 },
      });
      slide.addText(text, {
        x: offsetX + 0.42, y: ry, w: midX - 0.55, h: sub ? 0.22 : 0.3,
        fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
      });
      if (sub) {
        slide.addText(sub, {
          x: offsetX + 0.42, y: ry + 0.21, w: midX - 0.55, h: 0.2,
          fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
        });
      }
    });
  };

  renderRow(pros, 0,    COLORS.success);
  renderRow(cons, midX, COLORS.danger);
}

// ── Architecture node card ────────────────────────────────────────────────────

/**
 * Rounded service node card.
 *
 * opts: { x, y, w=1.3, h=1.05, emoji, name, meta, borderColor, nameColor }
 * nameColor: if set, uses this color for the name text (color-matched to border)
 */
function addNodeCard(slide, pres, opts = {}) {
  const { x, y, w = 1.3, h = 1.05, emoji, name, meta, borderColor = COLORS.accent, nameColor } = opts;

  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: borderColor, width: 1.5 },
    shadow: { type: "outer", color: COLORS.shadowColor, blur: 6, offset: 2, angle: 45, opacity: COLORS.shadowOpacity },
  });

  if (emoji) {
    slide.addText(emoji, {
      x, y: y + 0.06, w, h: h * 0.46,
      fontSize: 22, align: "center", valign: "middle",
    });
  }

  slide.addText(name || "", {
    x: x + 0.06, y: y + h * 0.52, w: w - 0.12, h: 0.27,
    fontSize: 10.5, bold: true, color: nameColor || COLORS.text, fontFace: FONTS.body, align: "center",
  });

  if (meta) {
    slide.addText(meta, {
      x: x + 0.04, y: y + h * 0.52 + 0.25, w: w - 0.08, h: 0.2,
      fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.code, align: "center",
    });
  }
}

// ── Mini node (for complex diagrams) ─────────────────────────────────────────

/**
 * Small inline node for tier diagrams.
 * opts: { x, y, w=1.15, h=0.38, emoji, label, borderColor }
 */
function addMiniNode(slide, pres, opts = {}) {
  const { x, y, w = 1.15, h = 0.38, emoji, label, borderColor = COLORS.border } = opts;

  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: borderColor, width: 1.0 },
  });

  const emojiW = emoji ? 0.26 : 0;
  if (emoji) {
    slide.addText(emoji, {
      x: x + 0.05, y, w: emojiW, h,
      fontSize: 12, valign: "middle",
    });
  }

  slide.addText(label || "", {
    x: x + emojiW + 0.06, y, w: w - emojiW - 0.1, h,
    fontSize: 9.5, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });
}

// ── Connectors ────────────────────────────────────────────────────────────────

/**
 * Horizontal arrow with pill-badge protocol label.
 * opts: { x, y, w=0.55, label="", color }
 */
function addHArrow(slide, pres, opts = {}) {
  const { x, y, w = 0.55, label = "", color = COLORS.accent } = opts;

  slide.addShape(pres.ShapeType.line, {
    x, y: y + 0.15, w, h: 0.01,
    line: { color, width: 1.5, endArrowType: "arrow" },
  });

  if (label) {
    // Pill badge background
    const pillW = Math.max(w * 0.85, 0.6);
    const pillX = x + (w - pillW) / 2;
    slide.addShape(pres.ShapeType.roundRect, {
      x: pillX, y: y - 0.04, w: pillW, h: 0.22, rectRadius: 0.06,
      fill: { color: COLORS.bg2 },
      line: { color, width: 0.75 },
    });
    slide.addText(label, {
      x: pillX, y: y - 0.04, w: pillW, h: 0.22,
      fontSize: 7.5, bold: true, color, fontFace: FONTS.code, align: "center", valign: "middle",
    });
  }
}

/**
 * Horizontal dashed arrow (for response / reverse flows).
 * opts: { x, y, w, label="", color, reverse=false }
 */
function addDashedHArrow(slide, pres, opts = {}) {
  const { x, y, w, label = "", color = COLORS.success, reverse = false } = opts;

  slide.addShape(pres.ShapeType.line, {
    x, y, w, h: 0.01,
    line: { color, width: 1.5, dashType: "dash",
            beginArrowType: reverse ? "arrow" : "none",
            endArrowType: reverse ? "none" : "arrow" },
  });

  if (label) {
    const pillW = Math.min(w * 0.5, 2.0);
    const pillX = x + (w - pillW) / 2;
    slide.addShape(pres.ShapeType.roundRect, {
      x: pillX, y: y - 0.25, w: pillW, h: 0.22, rectRadius: 0.06,
      fill: { color: COLORS.bg2 },
      line: { color, width: 0.75 },
    });
    slide.addText(label, {
      x: pillX, y: y - 0.25, w: pillW, h: 0.22,
      fontSize: 7.5, bold: true, color, fontFace: FONTS.code, align: "center", valign: "middle",
    });
  }
}

/**
 * Vertical downward arrow (for tier-to-tier connectors).
 * opts: { x, y, h=0.22, color }
 */
function addVArrow(slide, pres, opts = {}) {
  const { x, color = COLORS.border } = opts;
  let { y, h = 0.22 } = opts;
  // Normalize: negative h means arrow goes up — adjust y and flip
  if (h < 0) { y = y + h; h = -h; }
  slide.addShape(pres.ShapeType.line, {
    x, y, w: 0.01, h,
    line: { color, width: 1.5, endArrowType: "arrow" },
  });
}

// ── Zone border ───────────────────────────────────────────────────────────────

/**
 * Dashed border around a group of nodes to indicate a zone or replica group.
 * opts: { x, y, w, h, color, label }
 */
function addZoneBorder(slide, pres, opts = {}) {
  const { x, y, w, h, color = COLORS.backend, label = "" } = opts;

  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.1,
    fill: { type: "none" },
    line: { color, width: 1.0, dashType: "dash" },
  });

  if (label) {
    // Label tab sitting on top of the border
    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 0.1, y: y - 0.16, w: 1.0, h: 0.2, rectRadius: 0.04,
      fill: { color: COLORS.bg },
      line: { color, width: 0.5 },
    });
    slide.addText(label, {
      x: x + 0.12, y: y - 0.16, w: 0.96, h: 0.2,
      fontSize: 7.5, bold: true, color, fontFace: FONTS.body, align: "center",
    });
  }
}

// ── Alert / tip bars ──────────────────────────────────────────────────────────

/**
 * Red alert bar — used to highlight pain points.
 * opts: { y=3.08, message, tags=[] }
 */
function addAlertBar(slide, pres, opts = {}) {
  const { y = 3.08, message = "", tags = [] } = opts;

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y, w: 9.4, h: 0.42, rectRadius: 0.06,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.0 },
  });

  slide.addText(`🔥  ${message}`, {
    x: 0.5, y: y + 0.05, w: tags.length ? 7.3 : 8.7, h: 0.32,
    fontSize: 10.5, bold: true, color: COLORS.danger,
    fontFace: FONTS.body, valign: "middle",
  });

  tags.forEach((tag, i) => {
    const tx = 7.8 + i * 0.54;
    if (tx + 0.5 > W - 0.3) return;
    slide.addShape(pres.ShapeType.roundRect, {
      x: tx, y: y + 0.08, w: 1.2, h: 0.25, rectRadius: 0.04,
      fill: { color: COLORS.dangerTagBg }, line: { color: COLORS.danger, width: 0.5 },
    });
    slide.addText(tag, {
      x: tx, y: y + 0.11, w: 1.2, h: 0.18,
      fontSize: 7.5, color: COLORS.danger, fontFace: FONTS.body, align: "center",
    });
  });
}

/**
 * Blue tip bar — 💡 insight at bottom of slide.
 * opts: { y=4.9, text }
 */
function addTipBar(slide, pres, opts = {}) {
  const { y = 4.9, text = "" } = opts;

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y, w: 9.4, h: 0.42, rectRadius: 0.06,
    fill: { color: COLORS.tipBg },
    line: { color: COLORS.accent, width: 0.75 },
  });

  slide.addText(`💡  ${text}`, {
    x: 0.5, y: y + 0.05, w: 9.0, h: 0.32,
    fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body,
    italic: true, valign: "middle",
  });
}

// ── Comparison helpers ────────────────────────────────────────────────────────

/**
 * Comparison section heading (❌ bad or ✅ good).
 * opts: { x, y, w, label, type="bad" }
 */
function addCompareHeading(slide, pres, opts = {}) {
  const { x, y, w, label, type = "bad" } = opts;
  const color = type === "good" ? COLORS.success : COLORS.danger;
  const bg    = type === "good" ? COLORS.cardSuccess : COLORS.cardDanger;

  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h: 0.4, rectRadius: 0.08,
    fill: { color: bg },
    line: { color, width: 1.0 },
  });
  slide.addText(label, {
    x: x + 0.12, y, w: w - 0.2, h: 0.4,
    fontSize: 12, bold: true, color, fontFace: FONTS.body, valign: "middle",
  });
}

/**
 * Comparison list item row.
 * opts: { x, y, w=4.3, emoji, title, sub, type="neutral" }
 */
function addCompareItem(slide, pres, opts = {}) {
  const { x, y, w = 4.3, emoji = "✓", title, sub, type = "neutral" } = opts;
  const iconColor = type === "good"    ? COLORS.success
                  : type === "bad"     ? COLORS.danger
                  : type === "warning" ? COLORS.warning
                  : COLORS.textMuted;
  const iconBg = type === "good"    ? COLORS.cardSuccess
               : type === "bad"     ? COLORS.cardDanger
               : type === "warning" ? COLORS.cardWarn
               : COLORS.bg3;
  const rowH = sub ? 0.56 : 0.4;

  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h: rowH, rectRadius: 0.07,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: x + 0.08, y: y + 0.07, w: 0.27, h: 0.27, rectRadius: 0.05,
    fill: { color: iconBg }, line: { color: iconColor, width: 0.5 },
  });
  slide.addText(emoji, {
    x: x + 0.08, y: y + 0.06, w: 0.27, h: 0.27,
    fontSize: 11, align: "center", valign: "middle", color: iconColor, fontFace: FONTS.body,
  });
  slide.addText(title || "", {
    x: x + 0.43, y: y + 0.04, w: w - 0.54, h: sub ? 0.22 : 0.32,
    fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });
  if (sub) {
    slide.addText(sub, {
      x: x + 0.43, y: y + 0.25, w: w - 0.54, h: 0.24,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  }
}

// ── Summary card ──────────────────────────────────────────────────────────────

/**
 * Summary card used in Part summary slides (T7).
 * opts: { x, y, w=2.1, h=1.85, icon, title, items=[], color, status }
 */
function addSummaryCard(slide, pres, opts = {}) {
  const {
    x, y, w = 2.1, h = 1.85,
    icon = "📌", title = "", items = [],
    color = COLORS.accent, status,
  } = opts;

  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.1,
    fill: { color: COLORS.bg2 }, line: { color, width: 1.2 },
    shadow: { type: "outer", color: COLORS.shadowColor, blur: 6, offset: 2, angle: 45, opacity: COLORS.shadowOpacity },
  });

  slide.addText(icon, {
    x, y: y + 0.08, w, h: 0.42,
    fontSize: 22, align: "center", valign: "middle",
  });

  slide.addText(title, {
    x: x + 0.08, y: y + 0.52, w: w - 0.16, h: 0.3,
    fontSize: 11, bold: true, color, fontFace: FONTS.body, align: "center",
  });

  items.forEach((item, i) => {
    slide.addText(`• ${item}`, {
      x: x + 0.1, y: y + 0.87 + i * 0.28, w: w - 0.2, h: 0.26,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  if (status) {
    const sc = status.includes("✅") ? COLORS.success : COLORS.danger;
    slide.addText(status, {
      x: x + w - 0.32, y: y + 0.08, w: 0.28, h: 0.28,
      fontSize: 12, align: "center", color: sc, fontFace: FONTS.body,
    });
  }
}

// ── Metric / KPI big-number card ──────────────────────────────────────────────

/**
 * Big metric card (for "When to Scale", SRE, etc.).
 * opts: { x, y, w=2.8, h=1.4, value, label, sub, color }
 */
function addMetricCard(slide, pres, opts = {}) {
  const { x, y, w = 2.8, h = 1.4, value, label, sub, color = COLORS.accent } = opts;

  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.12,
    fill: { color: COLORS.bg2 }, line: { color, width: 1.5 },
    shadow: { type: "outer", color: COLORS.shadowColor, blur: 8, offset: 3, angle: 45, opacity: COLORS.shadowOpacity },
  });

  slide.addText(value || "", {
    x: x + 0.1, y: y + 0.12, w: w - 0.2, h: h * 0.46,
    fontSize: 34, bold: true, color, fontFace: FONTS.title, align: "center", valign: "middle",
  });

  slide.addText(label || "", {
    x: x + 0.1, y: y + h * 0.56, w: w - 0.2, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
  });

  if (sub) {
    slide.addText(sub, {
      x: x + 0.1, y: y + h * 0.56 + 0.28, w: w - 0.2, h: 0.25,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
  }
}

// ── Three-column layout ───────────────────────────────────────────────────────

/**
 * Render a three-column content section (used by 12-Factor, deployment strategies, etc.).
 * cols is an array of 3 objects: { title, color, icon, items=[] }
 * opts: { y=0.6, h=4.7 }
 */
function addThreeCols(slide, pres, cols, opts = {}) {
  const { y = HEADER_H + 0.1, h = H - HEADER_H - 0.2 } = opts;
  const colW = (W - 0.6) / 3;

  cols.slice(0, 3).forEach((col, i) => {
    const x = 0.2 + i * (colW + 0.1);
    const c = col.color || COLORS.accent;

    // Column card background
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: colW, h, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: c, width: 1.2 },
    });

    // Icon + title strip
    slide.addShape(pres.ShapeType.rect, {
      x, y, w: colW, h: 0.52,
      fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0 },
    });

    if (col.icon) {
      slide.addText(col.icon, {
        x, y: y + 0.02, w: 0.48, h: 0.48,
        fontSize: 22, align: "center", valign: "middle",
      });
    }

    slide.addText(col.title || "", {
      x: x + (col.icon ? 0.46 : 0.1), y, w: colW - (col.icon ? 0.5 : 0.1), h: 0.52,
      fontSize: 12, bold: true, color: c, fontFace: FONTS.body, valign: "middle",
    });

    // Items
    (col.items || []).forEach((item, j) => {
      const iy = y + 0.6 + j * 0.44;
      if (iy + 0.4 > y + h - 0.1) return;

      const text = typeof item === "string" ? item : item.text;
      const sub  = typeof item === "object" ? (item.sub || "") : "";

      // Bullet dot
      slide.addShape(pres.ShapeType.ellipse, {
        x: x + 0.14, y: iy + 0.07, w: 0.12, h: 0.12,
        fill: { color: c }, line: { color: c, width: 0 },
      });

      slide.addText(text, {
        x: x + 0.32, y: iy, w: colW - 0.42, h: sub ? 0.24 : 0.38,
        fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
      });

      if (sub) {
        slide.addText(sub, {
          x: x + 0.32, y: iy + 0.22, w: colW - 0.42, h: 0.2,
          fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
        });
      }
    });
  });
}

// ── Code card ─────────────────────────────────────────────────────────────────

/**
 * Dark code snippet card with language label.
 * opts: { x, y, w, h, code, language="Dockerfile" }
 */
function addCodeCard(slide, pres, opts = {}) {
  const { x, y, w, h, code = "", language = "" } = opts;

  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.1,
    fill: { color: COLORS.codeBg }, line: { color: COLORS.border, width: 1.0 },
    shadow: { type: "outer", color: COLORS.shadowColor, blur: 10, offset: 4, angle: 45, opacity: COLORS.shadowOpacity },
  });

  if (language) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 0.1, y: y - 0.16, w: 1.0, h: 0.2, rectRadius: 0.04,
      fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.5 },
    });
    slide.addText(language, {
      x: x + 0.12, y: y - 0.16, w: 0.96, h: 0.2,
      fontSize: 8, bold: true, color: COLORS.textMuted, fontFace: FONTS.code, align: "center",
    });
  }

  slide.addText(code, {
    x: x + 0.14, y: y + 0.12, w: w - 0.28, h: h - 0.2,
    fontSize: 9.5, color: COLORS.text, fontFace: FONTS.code,
    valign: "top", paraSpaceAfter: 2,
  });
}

// ── Code-style comment bar ────────────────────────────────────────────────────

/**
 * Code-comment style section header: "// message"
 * opts: { y, message, sub="" }
 */
function addCommentBar(slide, pres, opts = {}) {
  const { y = 3.08, message = "", sub = "" } = opts;

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y, w: 9.4, h: sub ? 0.52 : 0.34, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.border, width: 0.75 },
  });

  slide.addText(`// ${message}`, {
    x: 0.5, y: y + 0.02, w: 9.0, h: 0.22,
    fontSize: 10, bold: true, color: COLORS.textMuted, fontFace: FONTS.code,
    valign: "middle",
  });

  if (sub) {
    slide.addText(sub, {
      x: 0.7, y: y + 0.24, w: 8.8, h: 0.22,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.code,
      italic: true, valign: "middle",
    });
  }
}

// ── Knowledge cards (bottom three-column) ─────────────────────────────────────

/**
 * Three knowledge cards at the bottom of a slide.
 * cards: [{ title, body, color }]
 * opts: { y, h=1.0 }
 */
function addKnowledgeCards(slide, pres, cards = [], opts = {}) {
  const { y = H - 1.2, h = 1.05 } = opts;
  const gap = 0.15;
  const cardW = (W - 0.4 - gap * (cards.length - 1)) / cards.length;

  cards.forEach((card, i) => {
    const cx = 0.2 + i * (cardW + gap);
    const c = card.color || COLORS.accent;

    slide.addShape(pres.ShapeType.roundRect, {
      x: cx, y, w: cardW, h, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.border, width: 0.75 },
    });

    // Top color accent strip
    slide.addShape(pres.ShapeType.rect, {
      x: cx, y, w: cardW, h: 0.04,
      fill: { color: c }, line: { color: c, width: 0 },
    });

    slide.addText(card.title || "", {
      x: cx + 0.12, y: y + 0.1, w: cardW - 0.24, h: 0.28,
      fontSize: 11, bold: true, color: c, fontFace: FONTS.body, valign: "middle",
    });

    slide.addText(card.body || "", {
      x: cx + 0.12, y: y + 0.38, w: cardW - 0.24, h: h - 0.5,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, valign: "top",
    });
  });
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  W, H, HEADER_H, BOTTOM_H, BOTTOM_Y,
  initSlide,
  addSlideHeader,
  addBottomPanel,
  addNodeCard,
  addMiniNode,
  addHArrow,
  addDashedHArrow,
  addVArrow,
  addZoneBorder,
  addAlertBar,
  addTipBar,
  addCommentBar,
  addKnowledgeCards,
  addCompareHeading,
  addCompareItem,
  addSummaryCard,
  addMetricCard,
  addThreeCols,
  addCodeCard,
};
