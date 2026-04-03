// src/part1_excalidraw.js — v2 (manual centering rewrite)
// Part 1: 傳統部署演進 — Excalidraw whiteboard style
//
// All text centering uses manual pixel-width estimation for precise positioning.
// Uses fontFamily 2 (Normal/Helvetica) per user's "A mode" request.
//
// Run:  node src/part1_excalidraw.js
//       (requires canvas server at localhost:3000 + browser open)

"use strict";

const path = require("path");
const fs   = require("fs");
const pptxgen = require("pptxgenjs");
const ex   = require("./excalidraw-helper");

// ─── Canvas dimensions (px) — ~180 DPI at 10″×5.5″ slide ────────────────────
const CW = 1800;
const CH = 990;
const M  = 50;

// ─── Whiteboard palette (bright on white) ────────────────────────────────────
const P = {
  text:    "#1e1e1e",
  muted:   "#868e96",
  line:    "#ced4da",
  white:   "#ffffff",

  blue:    "#1971c2",   blueFill:   "#d0ebff",
  green:   "#2f9e44",   greenFill:  "#d3f9d8",
  orange:  "#e8590c",   orangeFill: "#ffec99",
  purple:  "#6741d9",   purpleFill: "#e5dbff",
  teal:    "#0c8599",   tealFill:   "#c3fae8",
  gray:    "#495057",   grayFill:   "#e9ecef",
  red:     "#e03131",   redFill:    "#ffe3e3",
  yellow:  "#f08c00",   yellowFill: "#fff9db",
};

// Component semantic map: [fill, stroke]
const COMP = {
  frontend:  [P.blueFill,   P.blue],
  backend:   [P.greenFill,  P.green],
  database:  [P.orangeFill, P.orange],
  infra:     [P.purpleFill, P.purple],
  container: [P.tealFill,   P.teal],
  client:    [P.grayFill,   P.gray],
};

// ─── Text width estimation (fontFamily 2 / Helvetica) ────────────────────────
function _tw(text, sz) {
  let w = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0);
    if (c >= 0x2000) w += sz * 1.0;
    else if (c >= 0x41 && c <= 0x5A) w += sz * 0.65;
    else if (c === 0x20) w += sz * 0.33;
    else w += sz * 0.5;
  }
  return w;
}

// ─── Primitive element builders ──────────────────────────────────────────────

function _frame() {
  return { type: "rectangle", x: 0, y: 0, width: CW, height: CH,
    strokeColor: P.white, backgroundColor: P.white,
    fillStyle: "solid", strokeWidth: 0 };
}

function _rect(x, y, w, h, o = {}) {
  return { type: "rectangle", x, y, width: w, height: h,
    strokeColor: o.stroke || P.text, backgroundColor: o.fill || "transparent",
    fillStyle: o.fill ? "solid" : "hachure", strokeWidth: o.sw ?? 2,
    roundness: o.sharp ? null : { type: 3 } };
}

function _txt(x, y, text, o = {}) {
  return { type: "text", x, y, text,
    fontSize: o.size || 24, strokeColor: o.color || P.text,
    textAlign: o.align || "left", fontFamily: 2 };
}

function _arrow(x1, y1, x2, y2, o = {}) {
  return { type: "arrow", x: x1, y: y1,
    width: x2 - x1, height: y2 - y1,
    points: [[0, 0], [x2 - x1, y2 - y1]],
    strokeColor: o.color || P.text, strokeWidth: o.sw || 2,
    endArrowhead: "arrow", startArrowhead: null };
}

function _line(x1, y1, x2, y2, o = {}) {
  return { type: "line", x: x1, y: y1,
    width: x2 - x1, height: y2 - y1,
    points: [[0, 0], [x2 - x1, y2 - y1]],
    strokeColor: o.color || P.line, strokeWidth: o.sw || 1 };
}

// ─── Centered-text helpers ───────────────────────────────────────────────────

/** Rounded rect with one or more lines of centered text. */
function _boxTxt(x, y, w, h, text, o = {}) {
  const sz = o.size || 20;
  const lines = text.split("\n");
  const lineH = sz * 1.35;
  const totalH = lines.length * lineH;
  const startY = y + (h - totalH) / 2;
  const els = [_rect(x, y, w, h, { fill: o.fill, stroke: o.stroke, sw: o.sw, sharp: o.sharp })];
  lines.forEach((line, i) => {
    const tw = _tw(line, sz);
    els.push(_txt(x + (w - tw) / 2, startY + i * lineH, line, { size: sz, color: o.color }));
  });
  return els;
}

/** Circle with centered text. */
function _cirTxt(x, y, d, text, o = {}) {
  const sz = o.size || 18;
  const tw = _tw(text, sz);
  const th = sz * 1.35;
  return [
    { type: "ellipse", x, y, width: d, height: d,
      strokeColor: o.stroke || P.text, backgroundColor: o.fill || "transparent",
      fillStyle: o.fill ? "solid" : "hachure", strokeWidth: o.sw ?? 2 },
    _txt(x + (d - tw) / 2, y + (d - th) / 2, text, { size: sz, color: o.color }),
  ];
}

// ─── Composite patterns ─────────────────────────────────────────────────────

function _header(title, label, accent) {
  return [
    _rect(M, 22, 60, 6, { fill: accent, stroke: accent, sw: 0, sharp: true }),
    _txt(M + 80, 10, title, { size: 30, color: accent }),
    _txt(CW - 300, 30, label, { size: 13, color: P.muted }),
    _line(M, 56, CW - M, 56),
  ];
}

function _node(x, y, w, h, name, meta, comp) {
  const [f, s] = COMP[comp] || COMP.client;
  const nameSize = 20, metaSize = 14;
  const nameH = nameSize * 1.35;
  const metaH = meta ? metaSize * 1.35 : 0;
  const gap = meta ? 6 : 0;
  const totalH = nameH + gap + metaH;
  const startY = y + (h - totalH) / 2;
  const els = [_rect(x, y, w, h, { fill: f, stroke: s })];
  const nw = _tw(name, nameSize);
  els.push(_txt(x + (w - nw) / 2, startY, name, { size: nameSize, color: s }));
  if (meta) {
    const mw = _tw(meta, metaSize);
    els.push(_txt(x + (w - mw) / 2, startY + nameH + gap, meta, { size: metaSize, color: P.muted }));
  }
  return els;
}

function _zone(x, y, w, h, label, color) {
  return [
    _rect(x, y, w, h, { stroke: color, sw: 1.5 }),
    _txt(x + 10, y + 6, label, { size: 12, color }),
  ];
}

function _prosCons(startY, pros, cons) {
  const pw = (CW - M * 3) / 2;
  const itemCount = Math.max(pros.length, cons.length);
  const ph = 60 + itemCount * 50 + 25;
  const els = [];
  // Pros card
  els.push(_rect(M, startY, pw, ph, { fill: P.greenFill, stroke: P.green }));
  els.push(..._boxTxt(M + 15, startY + 12, 100, 30, "✅ 優點",
    { fill: P.green, stroke: P.green, color: P.white, size: 14, sharp: true }));
  pros.forEach((p, i) => {
    const py = startY + 60 + i * 50;
    els.push(_txt(M + 25, py, "• " + p.title, { size: 16 }));
    if (p.sub) els.push(_txt(M + 38, py + 24, p.sub, { size: 12, color: P.muted }));
  });
  // Cons card
  const cx = M + pw + M;
  els.push(_rect(cx, startY, pw, ph, { fill: P.redFill, stroke: P.red }));
  els.push(..._boxTxt(cx + 15, startY + 12, 100, 30, "❌ 缺點",
    { fill: P.red, stroke: P.red, color: P.white, size: 14, sharp: true }));
  cons.forEach((c, i) => {
    const cy = startY + 60 + i * 50;
    els.push(_txt(cx + 25, cy, "• " + c.title, { size: 16 }));
    if (c.sub) els.push(_txt(cx + 38, cy + 24, c.sub, { size: 12, color: P.muted }));
  });
  return els;
}

function _tipBar(y, text, color) {
  color = color || P.blue;
  const fill = color === P.yellow ? P.yellowFill : color === P.red ? P.redFill : P.blueFill;
  return [
    _rect(M, y, CW - M * 2, 50, { fill, stroke: color }),
    _txt(M + 18, y + 14, "💡 " + text, { size: 15, color }),
  ];
}

function _compareHead(x, y, w, label, type) {
  const color = type === "good" ? P.green : P.red;
  const fill  = type === "good" ? P.greenFill : P.redFill;
  return _boxTxt(x, y, w, 42, label, { fill, stroke: color, color, size: 18 });
}

function _compareItem(x, y, w, emoji, title, sub, type) {
  const color = type === "good" ? P.green : type === "bad" ? P.red : P.yellow;
  const fill  = type === "good" ? P.greenFill : type === "bad" ? P.redFill : P.yellowFill;
  const h = sub ? 60 : 42;
  const els = [_rect(x, y, w, h, { fill, stroke: color })];
  els.push(_txt(x + 15, y + (sub ? 8 : 10), emoji + "  " + title, { size: 15 }));
  if (sub) els.push(_txt(x + 35, y + 34, sub, { size: 12, color: P.muted }));
  return els;
}

// ─── Render helper ──────────────────────────────────────────────────────────

async function render(num, elements) {
  const all = [_frame(), ...elements];
  const file = path.join(__dirname, "..", "output", "diagrams",
    `ex-s${String(num).padStart(2, "0")}.png`);
  const b64 = await ex.drawAndExport(all, { background: true, saveTo: file });
  console.log(`  ✓ Slide ${num}`);
  return b64;
}


// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Cover
// ═════════════════════════════════════════════════════════════════════════════
function s1() {
  const els = [
    // Left: accent bar + eyebrow
    _rect(M, 105, 60, 6, { fill: P.blue, stroke: P.blue, sw: 0, sharp: true }),
    _txt(M + 80, 93, "MASTER'S COURSE  ·  SYSTEM ARCHITECTURE", { size: 14, color: P.blue }),
    // Title
    _txt(M, 155, "CLOUD", { size: 72 }),
    _txt(M, 255, "NATIVE", { size: 72, color: P.blue }),
    // Subtitle
    _txt(M, 380, "系統部署實務", { size: 36 }),
    _txt(M, 435, "從單體部署到 Cloud Native 的完整演進之路", { size: 18, color: P.muted }),
    // Badges
    ..._boxTxt(M, 500, 130, 35, "碩士課程",
      { fill: P.blueFill, stroke: P.blue, color: P.blue, size: 14 }),
    ..._boxTxt(M + 150, 500, 120, 35, "2.5 小時",
      { fill: P.greenFill, stroke: P.green, color: P.green, size: 14 }),
    ..._boxTxt(M + 290, 500, 100, 35, "50 頁",
      { fill: P.orangeFill, stroke: P.orange, color: P.orange, size: 14 }),
    // Vertical divider
    _line(840, 40, 840, CH - 40, { color: P.line, sw: 1.5 }),
  ];

  // Right: 6 journey cards (all parts)
  const cards = [
    { num: "1", title: "傳統部署演進",       sub: "單機 → 三層架構 → 分散式",          color: P.green, fill: P.greenFill, chip: "低複雜" },
    { num: "2", title: "Scale Out 挑戰",     sub: "LB / Session / DB Replica / Cache", color: P.purple, fill: P.purpleFill, chip: "高複雜 🔺" },
    { num: "3", title: "Container 革命",     sub: "Docker · Compose · Registry",       color: P.teal, fill: P.tealFill, chip: "複雜 ↓" },
    { num: "4", title: "12-Factor App",      sub: "Cloud-Ready 應用設計原則",           color: P.blue, fill: P.blueFill, chip: "設計原則" },
    { num: "5", title: "DevOps 整合",        sub: "CI/CD · GitOps · 部署策略",          color: P.blue, fill: P.blueFill, chip: "工程紀律" },
    { num: "6", title: "SDLC 閉環",          sub: "可觀測性 · SRE · Post-mortem",       color: P.red, fill: P.redFill, chip: "完整閉環" },
  ];

  cards.forEach((c, i) => {
    const cy = 30 + i * 157;
    const cw = 870, ch = 142, cx = 880;
    els.push(_rect(cx, cy, cw, ch, { fill: c.fill, stroke: c.color }));
    els.push(_rect(cx, cy, 8, ch, { fill: c.color, stroke: c.color, sw: 0, sharp: true }));
    els.push(..._cirTxt(cx + 24, cy + ch / 2 - 18, 36, c.num,
      { fill: c.color, stroke: c.color, size: 18, color: P.white }));
    els.push(_txt(cx + 78, cy + 30, c.title, { size: 20 }));
    els.push(_txt(cx + 78, cy + 62, c.sub, { size: 13, color: P.muted }));
    els.push(..._boxTxt(cx + cw - 155, cy + ch / 2 - 15, 130, 30, c.chip,
      { fill: P.white, stroke: c.color, color: c.color, size: 13 }));
  });

  return els;
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Agenda
// ═════════════════════════════════════════════════════════════════════════════
function s2() {
  const els = [
    _txt(M, 12, "課程大綱", { size: 40, color: P.blue }),
    _txt(M + 230, 35, "Agenda — 完整演進之路", { size: 16, color: P.muted }),
    _txt(CW - 200, 25, "02 / 50", { size: 13, color: P.muted }),
    _line(M, 68, CW - M, 68),
  ];

  const rows = [
    { color: P.green,  fill: P.greenFill,  num: "1", title: "傳統部署演進",   sub: "單機 → 三層架構" },
    { color: P.purple, fill: P.purpleFill, num: "2", title: "Scale Out 挑戰", sub: "LB / Session / DB 擴展" },
    { color: P.teal,   fill: P.tealFill,   num: "3", title: "Container 革命", sub: "Docker / Compose / Registry" },
    { color: P.blue,   fill: P.blueFill,   num: "4", title: "12-Factor App",  sub: "Cloud-Ready 應用設計原則" },
    { color: P.blue,   fill: P.blueFill,   num: "5", title: "DevOps 整合",    sub: "CI/CD · GitOps · 部署策略" },
    { color: P.red,    fill: P.redFill,    num: "6", title: "SDLC 閉環",      sub: "可觀測性 · SRE · Post-mortem" },
  ];

  rows.forEach((r, i) => {
    const ry = 86 + i * 147;
    const rw = CW - M * 2, rh = 130;
    els.push(_rect(M, ry, rw, rh, { fill: r.fill, stroke: r.color }));
    els.push(_rect(M, ry, 8, rh, { fill: r.color, stroke: r.color, sw: 0, sharp: true }));
    els.push(..._cirTxt(M + 30, ry + rh / 2 - 22, 44, r.num,
      { fill: r.color, stroke: r.color, size: 20, color: P.white }));
    els.push(_txt(M + 95, ry + 18, "PART " + r.num, { size: 12, color: r.color }));
    els.push(_txt(M + 95, ry + 42, r.title, { size: 24 }));
    els.push(_txt(M + 95, ry + 78, r.sub, { size: 14, color: P.muted }));
  });

  return els;
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — 起點：最簡單的部署架構
// ═════════════════════════════════════════════════════════════════════════════
function s3() {
  const zy = 100, zh = 400;
  const ny = zy + 55, nh = 280;
  return [
    ..._header("起點：最簡單的部署架構", "PART 1  ·  03 / 50", P.green),
    _txt(M, 66, "SINGLE HOST DEPLOYMENT", { size: 11, color: P.muted }),
    // Client
    ..._node(M, zy + 100, 160, 140, "Client", "Browser", "client"),
    _arrow(M + 170, zy + 170, M + 275, zy + 170, { color: P.blue }),
    _txt(M + 180, zy + 140, "HTTP/80", { size: 11, color: P.blue }),
    // Zone: ubuntu-01
    ..._zone(M + 285, zy, 1415, zh, "ubuntu-01", P.green),
    // Frontend
    ..._node(M + 340, ny, 340, nh, "Frontend", "Nginx :80", "frontend"),
    _arrow(M + 690, ny + nh / 2, M + 745, ny + nh / 2, { color: P.blue }),
    _txt(M + 695, ny + nh / 2 - 24, "proxy", { size: 11, color: P.blue }),
    // Backend
    ..._node(M + 755, ny, 340, nh, "Backend", "FastAPI :8080", "backend"),
    _arrow(M + 1105, ny + nh / 2, M + 1160, ny + nh / 2, { color: P.orange }),
    _txt(M + 1108, ny + nh / 2 - 24, "SQL", { size: 11, color: P.orange }),
    // Database
    ..._node(M + 1170, ny, 340, nh, "Database", "Postgres :5432", "database"),
    // Resource note
    ..._boxTxt(M + 285, zy + zh - 38, 1415, 32,
      "同一台機器共享：CPU / RAM / Disk / Network",
      { fill: P.grayFill, stroke: P.line, color: P.muted, size: 13, sw: 1 }),
    // Pros/Cons
    ..._prosCons(535,
      [{ title: "部署超簡單，一台搞定", sub: "幾分鐘內可完成部署" },
       { title: "Dev ≈ Prod，除錯方便", sub: "所有 log 在同一處" }],
      [{ title: "單點故障 (SPOF)", sub: "任一進程掛掉，整個服務停止" },
       { title: "無法水平擴展", sub: "流量增加只能換更大的機器" }],
    ),
    ..._tipBar(730, "單機適合 MVP 和開發環境 — 流量一旦超過單機極限，就需要開始拆分架構", P.green),
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — HTTP Request 完整旅程
// ═════════════════════════════════════════════════════════════════════════════
function s4() {
  const nx = [50, 350, 660, 970, 1280];
  const nw = 260, nh = 140, ny = 100;

  const els = [
    ..._header("一個 HTTP Request 的完整旅程", "PART 1  ·  04 / 50", P.blue),
    // 5 nodes
    ..._node(nx[0], ny, nw, nh, "Client",   "瀏覽器輸入 URL",  "client"),
    ..._node(nx[1], ny, nw, nh, "DNS",      "解析 IP 位址",    "infra"),
    ..._node(nx[2], ny, nw, nh, "Frontend", "Nginx :80",       "frontend"),
    ..._node(nx[3], ny, nw, nh, "Backend",  "FastAPI :8080",   "backend"),
    ..._node(nx[4], ny, nw, nh, "Database", "Postgres :5432",  "database"),
  ];

  // Forward arrows
  const labels = ["DNS Query", "TCP :80", "Proxy Pass", "SQL Query"];
  const colors = [P.purple, P.blue, P.green, P.orange];
  for (let i = 0; i < 4; i++) {
    const ax = nx[i] + nw + 5, bx = nx[i + 1] - 5;
    els.push(
      _arrow(ax, ny + nh / 2, bx, ny + nh / 2, { color: colors[i] }),
      _txt(ax + 5, ny + nh / 2 - 24, labels[i], { size: 11, color: colors[i] }),
    );
  }

  // Response arrow
  const ry = 310;
  els.push(
    _arrow(nx[4] + nw / 2, ry, nx[0] + nw / 2, ry, { color: P.green }),
    _txt(600, ry - 26, "← HTTP Response (JSON)", { size: 14, color: P.green }),
  );

  // Latency bar
  const barY = 375, barH = 35, barW = CW - M * 2;
  els.push(_rect(M, barY, barW, barH + 55, { fill: P.grayFill, stroke: P.line, sw: 1 }));
  const segs = [
    { pct: 0.08, color: P.purple, label: "DNS ~5ms" },
    { pct: 0.12, color: P.blue,   label: "TCP ~20ms" },
    { pct: 0.15, color: P.blue,   label: "Nginx ~40ms" },
    { pct: 0.25, color: P.green,  label: "App ~80ms" },
    { pct: 0.40, color: P.orange, label: "DB — 瓶頸 ~200ms+" },
  ];
  let sx = M + 10;
  segs.forEach((s) => {
    const sw = (barW - 20) * s.pct;
    const fill = s.color === P.purple ? P.purpleFill : s.color === P.blue ? P.blueFill
      : s.color === P.green ? P.greenFill : P.orangeFill;
    els.push(_rect(sx, barY + 8, sw - 4, barH, { fill, stroke: s.color }));
    // Center the label text below the segment
    const tw = _tw(s.label, 12);
    els.push(_txt(sx + (sw - 4 - tw) / 2, barY + barH + 14, s.label, { size: 12, color: s.color }));
    sx += sw;
  });

  // Tip
  els.push(..._tipBar(520, "在單機架構中，所有步驟共用同一組資源 — 任何一步過載，全部都跟著慢下來"));

  // Key takeaways below tip
  const tkY = 590, tkH = 55;
  const tkW = (CW - M * 2 - 40) / 3;
  const takeaways = [
    { icon: "🔍", label: "DNS 解析", detail: "通常最快 ~5ms", color: P.purple },
    { icon: "⚡", label: "App 邏輯",  detail: "可優化空間最大", color: P.green },
    { icon: "💿", label: "DB 查詢",   detail: "通常是最大瓶頸", color: P.orange },
  ];
  takeaways.forEach((tk, i) => {
    const tx = M + i * (tkW + 20);
    els.push(_rect(tx, tkY, tkW, tkH, { fill: P.grayFill, stroke: P.line, sw: 1 }));
    els.push(_txt(tx + 15, tkY + 8, tk.icon + "  " + tk.label, { size: 16, color: tk.color }));
    els.push(_txt(tx + 42, tkY + 32, tk.detail, { size: 12, color: P.muted }));
  });

  return els;
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — 分離資料庫 Server
// ═════════════════════════════════════════════════════════════════════════════
function s5() {
  const zy = 100, zh = 390;
  const ny = zy + 55, nw = 360, nh = 260;
  return [
    ..._header("第一步擴展：分離資料庫 Server", "PART 1  ·  05 / 50", P.orange),
    _txt(M, 66, "TWO-MACHINE DEPLOYMENT", { size: 11, color: P.muted }),
    // Client
    ..._node(M, zy + 95, 140, 130, "Client", "Browser", "client"),
    _arrow(M + 150, zy + 160, M + 260, zy + 160, { color: P.blue }),
    _txt(M + 160, zy + 130, "HTTP", { size: 11, color: P.blue }),
    // App server zone
    ..._zone(M + 270, zy, 560, zh, "app-server-01", P.green),
    ..._node(M + 330, ny, nw, nh, "App Server", "Frontend + Backend\nNginx + FastAPI", "backend"),
    // Arrow between zones
    _arrow(M + 840, zy + zh / 2, M + 970, zy + zh / 2, { color: P.orange }),
    _txt(M + 855, zy + zh / 2 - 26, "SQL :5432", { size: 12, color: P.orange }),
    // DB server zone
    ..._zone(M + 980, zy, 560, zh, "db-server-01", P.orange),
    ..._node(M + 1040, ny, nw, nh, "Database", "PostgreSQL :5432\n専用機器", "database"),
    // Pros/Cons
    ..._prosCons(530,
      [{ title: "資料獨立備份", sub: "DB 機器可獨立 snapshot" },
       { title: "App 可重啟不影響資料", sub: "分離職責，故障範圍縮小" }],
      [{ title: "網路延遲增加", sub: "同主機 IPC → 跨機器 TCP" },
       { title: "仍然是單點故障", sub: "App 或 DB 任一掛掉，服務中斷" }],
    ),
    ..._tipBar(725, "資料庫分離是第一步 — 接下來要考慮 Frontend 也獨立部署", P.orange),
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — 三層架構
// ═════════════════════════════════════════════════════════════════════════════
function s6() {
  const zy = 100, zh = 390;
  const ny = zy + 55, nw = 280, nh = 260;
  return [
    ..._header("三層架構：前端 + 後端 + 資料庫", "PART 1  ·  06 / 50", P.blue),
    // Client
    ..._node(M, zy + 80, 155, 160, "Client", null, "client"),
    _arrow(M + 165, zy + 160, M + 255, zy + 160, { color: P.blue }),
    _txt(M + 170, zy + 130, "HTTP/443", { size: 11, color: P.blue }),
    // Frontend zone
    ..._zone(M + 265, zy, nw + 40, zh, "server-01", P.blue),
    ..._node(M + 285, ny, nw, nh, "Frontend", "Nginx", "frontend"),
    // Center the desc below the node
    ...(function() {
      const t = "靜態資源 / 反向代理";
      const tw = _tw(t, 12);
      return [_txt(M + 285 + (nw - tw) / 2, ny + nh + 10, t, { size: 12, color: P.muted })];
    })(),
    _arrow(M + 585, zy + 190, M + 645, zy + 190, { color: P.green }),
    _txt(M + 590, zy + 160, "Proxy", { size: 11, color: P.green }),
    // Backend zone
    ..._zone(M + 655, zy, nw + 40, zh, "server-02", P.green),
    ..._node(M + 675, ny, nw, nh, "Backend", "FastAPI", "backend"),
    ...(function() {
      const t = "業務邏輯 / API";
      const tw = _tw(t, 12);
      return [_txt(M + 675 + (nw - tw) / 2, ny + nh + 10, t, { size: 12, color: P.muted })];
    })(),
    _arrow(M + 975, zy + 190, M + 1035, zy + 190, { color: P.orange }),
    _txt(M + 978, zy + 160, "SQL", { size: 11, color: P.orange }),
    // Database zone
    ..._zone(M + 1045, zy, nw + 40, zh, "server-03", P.orange),
    ..._node(M + 1065, ny, nw, nh, "Database", "PostgreSQL", "database"),
    ...(function() {
      const t = "資料持久化";
      const tw = _tw(t, 12);
      return [_txt(M + 1065 + (nw - tw) / 2, ny + nh + 10, t, { size: 12, color: P.muted })];
    })(),
    // Pros/Cons
    ..._prosCons(530,
      [{ title: "職責分離，各自獨立擴展", sub: "前後端可以分別 Scale" },
       { title: "技術棧靈活", sub: "各層可選用最適合的技術" }],
      [{ title: "部署順序問題", sub: "DB → Backend → Frontend，順序錯就失敗" },
       { title: "版本相依地獄", sub: "三個 repo 的版本必須匹配" }],
    ),
    ..._tipBar(725, "三層架構是大多數 Web 應用的起點 — 下一步要面對部署複雜度的挑戰"),
  ];
}


// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — 三層架構的真實挑戰
// ═════════════════════════════════════════════════════════════════════════════
function s7() {
  const els = [..._header("三層架構的真實挑戰", "PART 1  ·  07 / 50", P.red)];
  const cw = (CW - M * 3) / 2, ch = 310;

  // Card 1: 部署順序地雷 (top-left)
  const c1x = M, c1y = 80;
  els.push(_rect(c1x, c1y, cw, ch, { fill: P.redFill, stroke: P.red }));
  els.push(_txt(c1x + 25, c1y + 18, "💣 部署順序地雷", { size: 22, color: P.red }));
  // Visual: deployment order arrow chain
  const chainY = c1y + 70;
  els.push(..._boxTxt(c1x + 30,  chainY, 160, 40, "Database", { fill: P.orangeFill, stroke: P.orange, color: P.orange, size: 14 }));
  els.push(_arrow(c1x + 200, chainY + 20, c1x + 250, chainY + 20, { color: P.text }));
  els.push(..._boxTxt(c1x + 260, chainY, 160, 40, "Backend",  { fill: P.greenFill, stroke: P.green, color: P.green, size: 14 }));
  els.push(_arrow(c1x + 430, chainY + 20, c1x + 480, chainY + 20, { color: P.text }));
  els.push(..._boxTxt(c1x + 490, chainY, 160, 40, "Frontend", { fill: P.blueFill, stroke: P.blue, color: P.blue, size: 14 }));
  // Crossed wrong-order arrow
  els.push(_txt(c1x + 30, c1y + 135, "❌ 順序錯誤 → 服務全掛", { size: 15, color: P.red }));
  // Bullet items
  els.push(_txt(c1x + 30, c1y + 175, "• 必須先啟動 DB，再 Backend，再 Frontend", { size: 14 }));
  els.push(_txt(c1x + 30, c1y + 210, "• 沒有自動化 → 每次部署靠人工確認", { size: 14 }));
  els.push(_txt(c1x + 30, c1y + 245, "• 多人操作 → 失誤機率大幅上升", { size: 14 }));

  // Card 2: 版本相依地獄 (top-right)
  const c2x = CW / 2 + M / 2, c2y = 80;
  els.push(_rect(c2x, c2y, cw, ch, { fill: P.redFill, stroke: P.red }));
  els.push(_txt(c2x + 25, c2y + 18, "🔗 版本相依地獄", { size: 22, color: P.red }));
  // Visual: version conflict diagram
  const vY = c2y + 70;
  els.push(..._boxTxt(c2x + 30,  vY, 140, 40, "FE v2.1", { fill: P.blueFill, stroke: P.blue, color: P.blue, size: 14 }));
  els.push(_arrow(c2x + 180, vY + 20, c2x + 230, vY + 20, { color: P.red }));
  els.push(..._boxTxt(c2x + 240, vY, 140, 40, "BE v3.0", { fill: P.greenFill, stroke: P.green, color: P.green, size: 14 }));
  els.push(_arrow(c2x + 390, vY + 20, c2x + 440, vY + 20, { color: P.red }));
  els.push(..._boxTxt(c2x + 450, vY, 140, 40, "DB v5",   { fill: P.orangeFill, stroke: P.orange, color: P.orange, size: 14 }));
  // Conflict indicator
  els.push(_txt(c2x + 215, vY - 20, "⚠️", { size: 16, color: P.red }));
  els.push(_txt(c2x + 425, vY - 20, "⚠️", { size: 16, color: P.red }));
  els.push(_txt(c2x + 30, c2y + 135, "❌ 任一版本不對齊 → 整個掛", { size: 15, color: P.red }));
  els.push(_txt(c2x + 30, c2y + 175, "• 前端 v2.1 依賴後端 API v3", { size: 14 }));
  els.push(_txt(c2x + 30, c2y + 210, "• 後端 v3 依賴 DB Schema v5", { size: 14 }));
  els.push(_txt(c2x + 30, c2y + 245, "• 三個 repo，三套版號，人工對齊", { size: 14 }));

  // Card 3: 環境差異問題 (bottom-left)
  const c3x = M, c3y = 410;
  els.push(_rect(c3x, c3y, cw, ch, { fill: P.redFill, stroke: P.red }));
  els.push(_txt(c3x + 25, c3y + 18, "😱 環境差異問題", { size: 22, color: P.red }));
  // Visual: Dev vs Prod comparison
  const eY = c3y + 68;
  els.push(..._boxTxt(c3x + 30,  eY, 240, 45, "🍎 Dev: macOS + brew", { fill: P.grayFill, stroke: P.gray, color: P.gray, size: 14 }));
  els.push(_txt(c3x + 310, eY + 8, "≠", { size: 28, color: P.red }));
  els.push(..._boxTxt(c3x + 370, eY, 270, 45, "🐧 Prod: Ubuntu + apt", { fill: P.grayFill, stroke: P.gray, color: P.gray, size: 14 }));
  els.push(_txt(c3x + 30, c3y + 140, "💬  「在我這裡可以跑！」", { size: 16, color: P.red }));
  els.push(_txt(c3x + 30, c3y + 180, "• Python 3.9 vs 3.11 — 不同 API 行為", { size: 14 }));
  els.push(_txt(c3x + 30, c3y + 215, "• OpenSSL 版本不一致 → TLS 握手失敗", { size: 14 }));
  els.push(_txt(c3x + 30, c3y + 250, "• 手動安裝相依套件 → 忘記就爆掉", { size: 14 }));

  // Card 4: Scale Out 前提條件 (bottom-right)
  const c4x = CW / 2 + M / 2, c4y = 410;
  els.push(_rect(c4x, c4y, cw, ch, { fill: P.redFill, stroke: P.red }));
  els.push(_txt(c4x + 25, c4y + 18, "⛔ Scale Out 前提條件", { size: 22, color: P.red }));
  // Visual: session stuck to server
  const sY = c4y + 68;
  els.push(..._boxTxt(c4x + 30,  sY, 160, 45, "💾 Session", { fill: P.purpleFill, stroke: P.purple, color: P.purple, size: 14 }));
  els.push(_txt(c4x + 200, sY + 8, "🔒 stuck", { size: 16, color: P.red }));
  els.push(..._boxTxt(c4x + 340, sY, 160, 45, "⚙️ Server A", { fill: P.greenFill, stroke: P.green, color: P.green, size: 14 }));
  els.push(_txt(c4x + 30, c4y + 140, "⚠️  必須先解決才能 Scale Out", { size: 15, color: P.red }));
  els.push(_txt(c4x + 30, c4y + 180, "• Session 存本機 → 換 Server 就登出", { size: 14 }));
  els.push(_txt(c4x + 30, c4y + 215, "• 本機快取 → 各機器資料不一致", { size: 14 }));
  els.push(_txt(c4x + 30, c4y + 250, "• 本機寫檔 → 只存在一台機器上", { size: 14 }));

  // Bottom tip bar
  els.push(..._tipBar(745, "這些挑戰是推動我們走向 Container 和 Cloud Native 的根本原因", P.red));

  return els;
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — 如何找出系統瓶頸？
// ═════════════════════════════════════════════════════════════════════════════
function s8() {
  const els = [
    ..._header("如何找出系統瓶頸？", "PART 1  ·  08 / 50", P.yellow),
    // Left column decoration
    _txt(M + 60, 120, "🔍", { size: 80 }),
  ];
  const tw0 = _tw("找瓶頸", 28);
  els.push(_txt(M + (350 - tw0) / 2, 280, "找瓶頸", { size: 28, color: P.yellow }));

  const rows = [
    { color: P.red,    fill: P.redFill,    title: "🔥 CPU 飽和",       sub: "症狀: 請求越來越慢 | 工具: top, htop" },
    { color: P.yellow, fill: P.yellowFill, title: "💾 記憶體不足",     sub: "症狀: OOM kills | 工具: free -m" },
    { color: P.orange, fill: P.orangeFill, title: "💿 磁碟 I/O 瓶頸",  sub: "症狀: DB 查詢慢 | 工具: iostat" },
    { color: P.blue,   fill: P.blueFill,   title: "🌐 網路頻寬",       sub: "症狀: 大檔案傳輸慢 | 工具: iftop" },
    { color: P.blue,   fill: P.blueFill,   title: "📊 慢查詢 (最常見)", sub: "症狀: API P99 高 | 工具: EXPLAIN ANALYZE" },
  ];

  let ry = 85;
  rows.forEach((r) => {
    els.push(
      _rect(400, ry, CW - 400 - M, 120, { fill: r.fill, stroke: r.color }),
      _rect(400, ry, 10, 120, { fill: r.color, stroke: r.color, sw: 0, sharp: true }),
      _txt(428, ry + 18, r.title, { size: 18 }),
      _txt(428, ry + 52, r.sub, { size: 13, color: P.muted }),
    );
    ry += 135;
  });

  els.push(..._tipBar(770, "先量測再優化 — Profile first, optimize second.", P.yellow));
  return els;
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — 何時需要開始思考 Scale？
// ═════════════════════════════════════════════════════════════════════════════
function s9() {
  const mw = 520, mh = 160;
  const els = [
    ..._header("何時需要開始思考 Scale？", "PART 1  ·  09 / 50", P.yellow),
    // 3 metric cards
    ..._boxTxt(M,        80, mw, mh, "CPU > 70%",
      { fill: P.redFill, stroke: P.red, color: P.red, size: 36 }),
    ..._boxTxt(M + 570,  80, mw, mh, "P99 > 1s",
      { fill: P.yellowFill, stroke: P.yellow, color: P.yellow, size: 36 }),
    ..._boxTxt(M + 1140, 80, mw, mh, "Error > 0.1%",
      { fill: P.redFill, stroke: P.red, color: P.red, size: 36 }),
  ];
  // Metric sub-labels (centered below each card)
  const metaSubs = [
    { x: M,        w: mw, t1: "持續 5 分鐘以上", t2: "不是偶發 spike" },
    { x: M + 570,  w: mw, t1: "API 尾端延遲",   t2: "使用者已感受到卡頓" },
    { x: M + 1140, w: mw, t1: "錯誤率超過閾值",  t2: "5xx 或 timeout 增加" },
  ];
  metaSubs.forEach((m) => {
    const tw1 = _tw(m.t1, 14), tw2 = _tw(m.t2, 12);
    els.push(_txt(m.x + (m.w - tw1) / 2, 248, m.t1, { size: 14 }));
    els.push(_txt(m.x + (m.w - tw2) / 2, 272, m.t2, { size: 12, color: P.muted }));
  });

  // Warning bar
  els.push(
    _rect(M, 310, CW - M * 2, 50, { fill: P.yellowFill, stroke: P.yellow }),
    _txt(M + 18, 322, "⚠️  常見錯誤：過早 Scale — 先從程式優化開始 (索引、快取、查詢)", { size: 15, color: P.yellow }),
  );

  // Two-column recommendations
  const lx = M, ly = 390, colW = (CW - M * 3) / 2, colH = 280;
  // Left: do first
  els.push(_rect(lx, ly, colW, colH, { fill: P.greenFill, stroke: P.green }));
  els.push(..._boxTxt(lx + 15, ly + 12, 130, 30, "✅ 先做這些",
    { fill: P.green, stroke: P.green, color: P.white, size: 14, sharp: true }));
  ["加索引 (最快、最便宜)", "引入 Redis 快取", "優化 N+1 查詢", "CDN 靜態資源"].forEach((item, i) => {
    els.push(_txt(lx + 25, ly + 62 + i * 46, "• " + item, { size: 16 }));
  });

  // Right: scale considerations
  const rx = M + colW + M;
  els.push(_rect(rx, ly, colW, colH, { fill: P.redFill, stroke: P.red }));
  els.push(..._boxTxt(rx + 15, ly + 12, 170, 30, "⚠️ 再考慮 Scale Out",
    { fill: P.red, stroke: P.red, color: P.white, size: 14, sharp: true }));
  ["確認瓶頸真的是機器不足", "應用必須先設計成 Stateless", "需要 Load Balancer", "成本/複雜度大幅增加"].forEach((item, i) => {
    els.push(_txt(rx + 25, ly + 62 + i * 46, "• " + item, { size: 16 }));
  });

  // Bottom tip bar
  els.push(..._tipBar(700, "關鍵原則：先做 profiling，確認瓶頸是「機器不夠」而非「程式太差」，再考慮 Scale", P.yellow));

  return els;
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — Scale Up vs Scale Out
// ═════════════════════════════════════════════════════════════════════════════
function s10() {
  const mid = CW / 2;
  const hw = mid - M - 20;

  const els = [
    ..._header("Scale Up vs Scale Out：兩種擴展策略", "PART 1  ·  10 / 50", P.blue),
    _line(mid, 60, mid, CH - 15, { sw: 1.5 }),

    // ── Left: Scale Up ──
    ..._compareHead(M, 75, hw, "↑  Scale Up（垂直擴展）", "bad"),
    // Growing servers
    ..._node(M + 20,  160, 120, 100, "Server", "2 vCPU", "client"),
    ...(function() {
      const t = "→";
      const tw = _tw(t, 24);
      return [_txt(M + 155, 195, t, { size: 24, color: P.blue })];
    })(),
    ..._node(M + 185, 150, 160, 120, "Server", "16 vCPU", "backend"),
    ...(function() {
      const t = "→";
      const tw = _tw(t, 24);
      return [_txt(M + 360, 195, t, { size: 24, color: P.blue })];
    })(),
    ..._node(M + 395, 140, 200, 140, "Server", "64 vCPU 💸", "database"),
    // Limit indicator
    _rect(M + 620, 145, 45, 130, { stroke: P.red, sw: 2 }),
    _txt(M + 622, 128, "上限", { size: 12, color: P.red }),

    // Compare items left
    ..._compareItem(M, 330, hw, "✓", "不需改程式碼",    "直接升級機器規格",             "good"),
    ..._compareItem(M, 405, hw, "✗", "費用指數成長",    "高階機器貴、且仍是單點故障",   "bad"),
    ..._compareItem(M, 480, hw, "✗", "物理上限存在",    "停機才能升級，有天花板",       "bad"),

    // ── Right: Scale Out ──
    ..._compareHead(mid + 20, 75, hw, "↔  Scale Out（水平擴展）", "good"),
  ];

  // LB box
  els.push(..._node(mid + 60, 160, 130, 120, "LB", "⚖️", "infra"));

  // 3 servers + arrows
  const srvY = [140, 215, 290];
  srvY.forEach((sy) => {
    els.push(..._boxTxt(mid + 300, sy, 200, 55, "⚙️ Server",
      { fill: P.greenFill, stroke: P.green, color: P.green, size: 15 }));
    els.push(_arrow(mid + 190, 220, mid + 295, sy + 27, { color: P.purple }));
  });
  els.push(_txt(mid + 360, 358, "+ 可繼續加...", { size: 14, color: P.green }));

  // Compare items right
  els.push(
    ..._compareItem(mid + 20, 400, hw, "✓", "線性成本增長",          "用小機器組成艦隊，彈性高",        "good"),
    ..._compareItem(mid + 20, 475, hw, "✓", "無停機擴容",            "動態加減節點，應對流量高峰",       "good"),
    ..._compareItem(mid + 20, 550, hw, "!", "前提：應用必須 Stateless", "Session / 快取 / 寫檔 → 都要重設計", "warning"),
  );

  // Bottom conclusion
  els.push(..._tipBar(660, "多數場景：先 Scale Up (快速解決) → 再 Scale Out (長期方案)"));

  return els;
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — Stateless 設計
// ═════════════════════════════════════════════════════════════════════════════
function s11() {
  const mid = CW / 2;
  const hw = mid - M - 20;

  const els = [
    ..._header("Stateless 設計：Scale Out 的先決條件", "PART 1  ·  11 / 50", P.blue),
    _line(mid, 60, mid, CH - 15, { sw: 1.5 }),

    // ── Left: Stateful ──
    ..._compareHead(M, 75, hw, "❌  Stateful — 無法 Scale Out", "bad"),
    // Client → LB → Servers with local session
    ..._node(M + 20, 155, 140, 100, "Client", null, "client"),
    _arrow(M + 170, 205, M + 240, 205, { color: P.purple }),
    ..._node(M + 250, 160, 120, 90, "LB", null, "infra"),
    // Server A
    ..._boxTxt(M + 440, 135, 260, 65, "💾 Server A (session)",
      { fill: P.greenFill, stroke: P.green, color: P.green, size: 15 }),
    // Server B
    ..._boxTxt(M + 440, 225, 260, 65, "💾 Server B (session)",
      { fill: P.greenFill, stroke: P.green, color: P.green, size: 15 }),
    _arrow(M + 370, 190, M + 435, 167, { color: P.purple }),
    _arrow(M + 370, 220, M + 435, 257, { color: P.purple }),
    // Problem
    _txt(M + 20, 320, "Request #2 找不到 Session → 被登出！", { size: 16, color: P.red }),
    ..._compareItem(M, 370, hw, "✗", "Session 存在本機記憶體", null, "bad"),
    ..._compareItem(M, 425, hw, "✗", "LB 必須用 Sticky Session", "一台掛掉，使用者全部登出", "bad"),

    // ── Right: Stateless ──
    ..._compareHead(mid + 20, 75, hw, "✅  Stateless — 可自由 Scale Out", "good"),
    ..._node(mid + 40, 155, 140, 100, "Client", null, "client"),
    _arrow(mid + 190, 205, mid + 260, 205, { color: P.purple }),
    ..._node(mid + 270, 160, 120, 90, "LB", null, "infra"),
    // Servers (no local session)
    ..._boxTxt(mid + 460, 135, 220, 65, "⚙️ Server A",
      { fill: P.greenFill, stroke: P.green, color: P.green, size: 15 }),
    ..._boxTxt(mid + 460, 225, 220, 65, "⚙️ Server B",
      { fill: P.greenFill, stroke: P.green, color: P.green, size: 15 }),
    _arrow(mid + 390, 190, mid + 455, 167, { color: P.purple }),
    _arrow(mid + 390, 220, mid + 455, 257, { color: P.purple }),
    // Redis
    ..._boxTxt(mid + 480, 330, 200, 70, "⚡ Redis\nSession Store",
      { fill: P.purpleFill, stroke: P.purple, color: P.purple, size: 16 }),
    _arrow(mid + 575, 290, mid + 575, 325, { color: P.purple }),

    ..._compareItem(mid + 20, 430, hw, "✓", "Session 集中存入 Redis", null, "good"),
    ..._compareItem(mid + 20, 485, hw, "✓", "任一 Server 都能處理任意請求",
      "LB 可自由分配，Server 可隨時加減", "good"),
    ..._compareItem(mid + 20, 560, hw, "!", "其他需注意：本機快取、本機寫檔",
      "任何「狀態」都要外部化", "warning"),
  ];

  // Bottom takeaway
  els.push(..._tipBar(670, "Stateless 是 Scale Out 的門票 — 所有「狀態」(Session / 快取 / 檔案) 都必須外部化"));

  return els;
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — Part 1 小結
// ═════════════════════════════════════════════════════════════════════════════
function s12() {
  const cw = (CW - M * 3) / 2, ch = 380;
  const els = [
    ..._header("Part 1 小結：架構演進路線圖", "PART 1  ·  12 / 50", P.green),
  ];

  const summaries = [
    { x: M,           y: 80,  icon: "🖥️", title: "單機部署",       color: P.green, fill: P.greenFill,
      items: ["設定簡單，快速啟動", "SPOF 單點故障", "不可 Scale"] },
    { x: M + cw + M,  y: 80,  icon: "🗄️", title: "DB 分離",        color: P.orange, fill: P.orangeFill,
      items: ["資料與應用分開", "獨立備份與優化", "仍舊 2 個 SPOF"] },
    { x: M,           y: 500, icon: "🌐", title: "三層架構",       color: P.blue, fill: P.blueFill,
      items: ["職責分離清楚", "技術棧彈性", "版本相依複雜化"] },
    { x: M + cw + M,  y: 500, icon: "⚖️", title: "Scale Out 準備", color: P.purple, fill: P.purpleFill,
      items: ["需要 Load Balancer", "App 必須 Stateless", "準備好了嗎？→ Part 2"] },
  ];

  summaries.forEach((s) => {
    els.push(_rect(s.x, s.y, cw, ch, { fill: s.fill, stroke: s.color }));
    // Icon centered at top
    const iconTw = _tw(s.icon, 32);
    els.push(_txt(s.x + (cw - iconTw) / 2, s.y + 20, s.icon, { size: 32 }));
    // Title centered
    const titleTw = _tw(s.title, 22);
    els.push(_txt(s.x + (cw - titleTw) / 2, s.y + 72, s.title, { size: 22, color: s.color }));
    // Items
    s.items.forEach((item, i) => {
      els.push(_txt(s.x + 30, s.y + 125 + i * 40, "• " + item, { size: 16 }));
    });
  });

  // Evolution arrows: Card 1 → 2 → 3 → 4 (Z-pattern)
  const arrowC = P.gray;
  // Arrow 1: Card 1 (right) → Card 2 (left) — horizontal
  els.push(_arrow(M + cw + 5, 80 + ch / 2, M + cw + M - 5, 80 + ch / 2, { color: arrowC }));
  // Step label 1
  els.push(..._cirTxt(M + cw + 10, 80 + ch / 2 - 26, 22, "1", { fill: arrowC, stroke: arrowC, size: 11, color: P.white }));
  // Arrow 2: Card 2 (bottom) → Card 3 (top) — diagonal
  els.push(_arrow(M + cw + M + cw / 2, 80 + ch + 5, M + cw / 2, 500 - 5, { color: arrowC }));
  // Step label 2
  els.push(..._cirTxt(CW / 2 - 11, 80 + ch + (500 - 80 - ch) / 2 - 11, 22, "2", { fill: arrowC, stroke: arrowC, size: 11, color: P.white }));
  // Arrow 3: Card 3 (right) → Card 4 (left) — horizontal
  els.push(_arrow(M + cw + 5, 500 + ch / 2, M + cw + M - 5, 500 + ch / 2, { color: arrowC }));
  // Step label 3
  els.push(..._cirTxt(M + cw + 10, 500 + ch / 2 - 26, 22, "3", { fill: arrowC, stroke: arrowC, size: 11, color: P.white }));

  // CTA centered at bottom
  const cta = "→ Part 2: Scale Out 的挑戰";
  const ctaTw = _tw(cta, 18);
  els.push(_txt((CW - ctaTw) / 2, CH - 55, cta, { size: 18, color: P.blue }));

  return els;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════
async function main() {
  const ok = await ex.healthCheck();
  if (!ok) { console.error("❌ Canvas server not running at localhost:3000"); process.exit(1); }
  console.log("✓ Canvas server OK\nBuilding Excalidraw-style slides (v2)...\n");

  const pres = new pptxgen();
  pres.defineLayout({ name: "WIDE", width: 10, height: 5.5 });
  pres.layout = "WIDE";

  const builders = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12];

  for (let i = 0; i < builders.length; i++) {
    const elements = builders[i]();
    const base64 = await render(i + 1, elements);
    const slide = pres.addSlide();
    slide.background = { color: "FFFFFF" };
    slide.addImage({ data: base64, x: 0, y: 0, w: 10, h: 5.5 });
  }

  const outDir = path.join(__dirname, "..", "output");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "part1_excalidraw");
  await pres.writeFile({ fileName: outFile });
  console.log(`\n✅ Saved → ${outFile}.pptx`);
}

main().catch((err) => { console.error("❌ Error:", err); process.exit(1); });
