// src/excalidraw-helper.js
// Bridge between Excalidraw canvas server and pptxgenjs slides.
//
// Prerequisites:
//   1. Canvas server running:  cd ~/mcp_excalidraw && PORT=3000 npm run canvas
//   2. Browser open at http://localhost:3000  (required for PNG/SVG export)
//
// Usage:
//   const ex = require("./excalidraw-helper");
//   await ex.clearCanvas();
//   await ex.createElements([...]);
//   const base64 = await ex.exportToPng();   // "image/png;base64,..."
//   slide.addImage({ data: base64, x: 0.5, y: 0.5, w: 9, h: 4 });

const CANVAS_URL =
  process.env.EXCALIDRAW_URL || "http://localhost:3000";

// ─── Dark palette: matches design-system.js for dark-bg slides ──
// Excalidraw uses "#RRGGBB" format (with # prefix).
const DARK_PALETTE = {
  // Backgrounds (shape fills)
  zoneBg:     "#161B22",   // large zone / group box fill
  cardBg:     "#1C2128",   // component card fill
  cardBg2:    "#21262D",   // alternate card fill (slightly lighter)
  // Borders
  border:     "#30363D",   // default subtle border
  accent:     "#58A6FF",   // primary accent
  frontend:   "#1F6FEB",   // blue
  backend:    "#238636",   // green
  database:   "#E36209",   // orange
  infra:      "#6E40C9",   // purple
  container:  "#0D8A6C",   // teal
  client:     "#8B949E",   // grey
  // Text
  text:       "#E6EDF3",   // primary text
  textMuted:  "#8B949E",   // secondary text
  textTitle:  "#58A6FF",   // title / heading text
  // Status
  success:    "#3FB950",
  danger:     "#F85149",
  warning:    "#D29922",
};

// ─── Default style: clean font, no sloppiness, light text ───────
const DEFAULTS = {
  text:  { fontFamily: 3, roughness: 0, strokeColor: DARK_PALETTE.text },
  shape: { roughness: 0 },
};

/** Merge default styles into an element based on its type. */
function applyDefaults(el) {
  const base =
    el.type === "text"
      ? { ...DEFAULTS.text }
      : { ...DEFAULTS.shape };
  return { ...base, ...el };
}

// ─── Low-level API helpers ──────────────────────────────────────

async function api(method, path, body) {
  const url = `${CANVAS_URL.replace(/\/$/, "")}${path}`;
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const json = await res.json().catch(() => null);
  if (!res.ok || (json && json.success === false)) {
    throw new Error(
      `Excalidraw API ${method} ${path} failed: ${res.status} ${json?.error || res.statusText}`
    );
  }
  return json;
}

// ─── Canvas operations ──────────────────────────────────────────

/** Remove every element from the canvas. */
async function clearCanvas() {
  return api("DELETE", "/api/elements/clear");
}

/** Create a single Excalidraw element (with default styles). Returns the created element. */
async function createElement(el) {
  const json = await api("POST", "/api/elements", applyDefaults(el));
  return json.element;
}

/** Create many elements in sequence (with default styles). Returns array of created elements. */
async function createElements(elements) {
  const results = [];
  for (const el of elements) {
    results.push(await createElement(el));
  }
  return results;
}

/** Batch-create elements (single HTTP call, with default styles). Returns array of created elements. */
async function batchCreate(elements) {
  const json = await api("POST", "/api/elements/batch", {
    elements: elements.map(applyDefaults),
  });
  return json.elements;
}

/** Get all elements currently on the canvas. */
async function getElements() {
  const json = await api("GET", "/api/elements");
  return json.elements;
}

/** Update an existing element by id. */
async function updateElement(id, updates) {
  const json = await api("PUT", `/api/elements/${id}`, updates);
  return json.element;
}

/** Delete a single element by id. */
async function deleteElement(id) {
  return api("DELETE", `/api/elements/${id}`);
}

// ─── Export (requires browser at localhost:3000) ────────────────

/**
 * Export the current canvas to PNG.
 * Returns a string in pptxgenjs-compatible format: "image/png;base64,..."
 *
 * @param {object} [opts]
 * @param {boolean} [opts.background=false] - include background color (default: transparent)
 * @returns {Promise<string>} base64 data URI for pptxgenjs addImage({ data })
 */
async function exportToPng(opts = {}) {
  const { background = false } = opts;
  const json = await api("POST", "/api/export/image", {
    format: "png",
    background,
  });
  if (!json.data) {
    throw new Error("Export returned no image data");
  }
  // The server returns raw base64. Prepend the MIME header pptxgenjs expects.
  const raw = json.data;
  if (raw.startsWith("data:image/png;base64,")) {
    return raw.replace("data:", "");
  }
  if (raw.startsWith("image/png;base64,")) {
    return raw;
  }
  return "image/png;base64," + raw;
}

/**
 * Export the current canvas to SVG string.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.background=false]
 * @returns {Promise<string>} SVG markup
 */
async function exportToSvg(opts = {}) {
  const { background = false } = opts;
  const json = await api("POST", "/api/export/image", {
    format: "svg",
    background,
  });
  if (!json.data) {
    throw new Error("Export returned no SVG data");
  }
  return json.data;
}

/**
 * Save the current canvas to a .png file and return the base64 for pptxgenjs.
 *
 * @param {string} filePath - e.g. "output/diagrams/k8s-arch.png"
 * @param {object} [opts]
 * @param {boolean} [opts.background=false]
 * @returns {Promise<string>} base64 data URI
 */
async function exportToPngFile(filePath, opts = {}) {
  const fs = require("node:fs");
  const path = require("node:path");
  const base64Str = await exportToPng(opts);
  // Strip "image/png;base64," prefix to get raw base64
  const raw = base64Str.replace(/^image\/png;base64,/, "");
  const buf = Buffer.from(raw, "base64");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buf);
  console.log(`  ✓ Saved ${filePath} (${(buf.length / 1024).toFixed(1)} KB)`);
  return base64Str;
}

// ─── Convenience: draw → export → ready for pptx ───────────────

/**
 * Clear canvas, draw elements, export to PNG, return base64.
 * One-call convenience for slide generation.
 *
 * @param {Array} elements - Excalidraw element definitions
 * @param {object} [opts]
 * @param {boolean} [opts.background=false]
 * @param {string}  [opts.saveTo] - optional file path to also save PNG
 * @returns {Promise<string>} base64 data URI for pptxgenjs
 */
async function drawAndExport(elements, opts = {}) {
  const { background = false, saveTo } = opts;
  await clearCanvas();
  await batchCreate(elements);
  // Small delay to let WebSocket sync to the browser
  await new Promise((r) => setTimeout(r, 500));
  const base64 = await exportToPng({ background });
  if (saveTo) {
    const fs = require("node:fs");
    const path = require("node:path");
    const raw = base64.replace(/^image\/png;base64,/, "");
    const buf = Buffer.from(raw, "base64");
    fs.mkdirSync(path.dirname(saveTo), { recursive: true });
    fs.writeFileSync(saveTo, buf);
    console.log(`  ✓ Saved ${saveTo} (${(buf.length / 1024).toFixed(1)} KB)`);
  }
  return base64;
}

// ─── Health check ───────────────────────────────────────────────

/** Verify the canvas server is reachable. */
async function healthCheck() {
  try {
    await api("GET", "/api/elements");
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  DARK_PALETTE,
  DEFAULTS,
  clearCanvas,
  createElement,
  createElements,
  batchCreate,
  getElements,
  updateElement,
  deleteElement,
  exportToPng,
  exportToSvg,
  exportToPngFile,
  drawAndExport,
  healthCheck,
  CANVAS_URL,
};
