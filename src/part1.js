// src/part1.js
// Part 1: 傳統部署演進 (Slides 1–12)

"use strict";

const fs      = require("fs");
const path    = require("path");
const pptxgen = require("pptxgenjs");
const { COLORS, FONTS } = require("./design-system");
const {
  W, H, HEADER_H, BOTTOM_H, BOTTOM_Y,
  initSlide,
  addSlideHeader,
  addBottomPanel,
  addNodeCard,
  addMiniNode,
  addHArrow,
  addVArrow,
  addZoneBorder,
  addAlertBar,
  addTipBar,
  addCompareHeading,
  addCompareItem,
  addSummaryCard,
  addMetricCard,
  addThreeCols,
  addCodeCard,
} = require("./helpers");

// ─────────────────────────────────────────────────────────────────────────────
// Slide 1 — Cover
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide1(pres) {
  const slide = initSlide(pres);

  // ── Left half ──────────────────────────────────────────────────────────────

  // Eyebrow accent line
  slide.addShape(pres.ShapeType.rect, {
    x: 0.5, y: 0.78, w: 0.3, h: 0.03,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent, width: 0 },
  });

  // Eyebrow text
  slide.addText("MASTER'S COURSE  ·  SYSTEM ARCHITECTURE", {
    x: 0.9, y: 0.68, w: 4.2, h: 0.22,
    fontSize: 10, bold: true, color: COLORS.accent, fontFace: FONTS.body,
    charSpacing: 1,
  });

  // Big title "CLOUD"
  slide.addText("CLOUD", {
    x: 0.5, y: 1.1, w: 4.2, h: 0.9,
    fontSize: 72, bold: true, color: COLORS.text, fontFace: FONTS.title,
    charSpacing: -1,
  });

  // Big title "NATIVE"
  slide.addText("NATIVE", {
    x: 0.5, y: 1.9, w: 4.2, h: 0.9,
    fontSize: 72, bold: true, color: COLORS.accent, fontFace: FONTS.title,
    charSpacing: -1,
  });

  // Chinese subtitle
  slide.addText("系統部署實務", {
    x: 0.5, y: 3.0, w: 4.2, h: 0.55,
    fontSize: 26, bold: true, color: COLORS.text, fontFace: FONTS.title,
  });

  // Description
  slide.addText("從單體部署到 Cloud Native 的完整演進之路", {
    x: 0.5, y: 3.55, w: 4.2, h: 0.35,
    fontSize: 13, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Badges
  const badges = [
    { label: "碩士課程", color: COLORS.accent, x: 0.5 },
    { label: "2.5 小時",  color: COLORS.success, x: 1.75 },
    { label: "50 頁",     color: COLORS.database, x: 2.95 },
  ];
  badges.forEach((b) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: b.x, y: 4.1, w: 1.1, h: 0.28, rectRadius: 0.07,
      fill: { color: COLORS.bg2 },
      line: { color: b.color, width: 1.0 },
    });
    slide.addText(b.label, {
      x: b.x, y: 4.1, w: 1.1, h: 0.28,
      fontSize: 9.5, bold: true, color: b.color, fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
  });

  // Vertical divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.3, w: 0, h: 4.9,
    line: { color: COLORS.border, width: 0.75 },
  });

  // ── Right half: Journey cards ──────────────────────────────────────────────
  const cards = [
    {
      border: COLORS.backend,   dot: COLORS.backend,   num: "1",
      title: "傳統部署演進",
      sub:   "單機 → 三層架構 → 分散式",
      chip: "低複雜", chipColor: COLORS.success,
    },
    {
      border: COLORS.infra,     dot: COLORS.infra,     num: "2",
      title: "Scale Out 挑戰",
      sub:   "LB / Session / DB Replica / Cache / MQ",
      chip: "高複雜 🔺", chipColor: COLORS.danger,
    },
    {
      border: COLORS.container, dot: COLORS.container, num: "3",
      title: "Container 革命",
      sub:   "Docker · Compose · Registry",
      chip: "複雜↓", chipColor: COLORS.container,
    },
    {
      border: COLORS.accent,    dot: COLORS.accent,    num: "4",
      title: "12-Factor + DevOps + SRE",
      sub:   "工程最佳實踐 · CI/CD · 可觀測性",
      chip: "工程紀律", chipColor: COLORS.accent,
    },
  ];

  let cy = 0.65;
  cards.forEach((c) => {
    // Card background
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.1, y: cy, w: 4.7, h: 0.95, rectRadius: 0.1,
      fill: { color: COLORS.bg2 },
      line: { color: c.border, width: 1.0 },
    });
    // Circle dot
    slide.addShape(pres.ShapeType.ellipse, {
      x: 5.25, y: cy + 0.35, w: 0.24, h: 0.24,
      fill: { color: c.dot }, line: { color: c.dot, width: 0 },
    });
    slide.addText(c.num, {
      x: 5.25, y: cy + 0.35, w: 0.24, h: 0.24,
      fontSize: 9, bold: true, color: "FFFFFF",
      align: "center", valign: "middle", fontFace: FONTS.body,
    });
    // Title
    slide.addText(c.title, {
      x: 5.57, y: cy + 0.1, w: 3.1, h: 0.3,
      fontSize: 12, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    // Sub
    slide.addText(c.sub, {
      x: 5.57, y: cy + 0.42, w: 3.1, h: 0.22,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.code,
    });
    // Chip
    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.7, y: cy + 0.34, w: 1.0, h: 0.24, rectRadius: 0.06,
      fill: { color: COLORS.bg3 },
      line: { color: c.chipColor, width: 0.75 },
    });
    slide.addText(c.chip, {
      x: 8.7, y: cy + 0.34, w: 1.0, h: 0.24,
      fontSize: 8, color: c.chipColor, fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
    cy += 1.05;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 2 — Agenda
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide2(pres) {
  const slide = initSlide(pres);

  // Large semi-transparent "00"
  slide.addText("00", {
    x: 0.1, y: 0.2, w: 1.8, h: 1.0,
    fontSize: 110, bold: true, color: COLORS.accent,
    fontFace: FONTS.title, transparency: 75,
  });

  // Title
  slide.addText("課程大綱", {
    x: 1.0, y: 0.28, w: 5.0, h: 0.55,
    fontSize: 30, bold: true, color: COLORS.accent, fontFace: FONTS.title,
  });

  // Subtitle
  slide.addText("Agenda — 完整演進之路", {
    x: 1.0, y: 0.75, w: 5.0, h: 0.3,
    fontSize: 13, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Badge top-right
  slide.addText("02 / 50", {
    x: 8.8, y: 0.1, w: 1.0, h: 0.25,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "right",
  });

  const rows = [
    { color: COLORS.backend,   num: "1", part: "PART 1", title: "傳統部署演進",      sub: "單機 → 三層架構" },
    { color: COLORS.infra,     num: "2", part: "PART 2", title: "Scale Out 挑戰",   sub: "LB / Session / DB 擴展" },
    { color: COLORS.container, num: "3", part: "PART 3", title: "Container 革命",   sub: "Docker / Compose / Registry" },
    { color: COLORS.accent,    num: "4", part: "PART 4", title: "12-Factor App",    sub: "Cloud-Ready 應用設計原則" },
    { color: COLORS.frontend,  num: "5", part: "PART 5", title: "DevOps 整合",      sub: "CI/CD · GitOps · 部署策略" },
    { color: COLORS.danger,    num: "6", part: "PART 6", title: "SDLC 閉環",        sub: "可觀測性 · SRE · Post-mortem" },
  ];

  let ry = 1.38;
  rows.forEach((r) => {
    // Card background
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.4, y: ry, w: 9.2, h: 0.58, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.border, width: 0.5 },
    });
    // Left color strip
    slide.addShape(pres.ShapeType.rect, {
      x: 0.4, y: ry, w: 0.1, h: 0.58,
      fill: { color: r.color },
      line: { color: r.color, width: 0 },
    });
    // Circle dot
    slide.addShape(pres.ShapeType.ellipse, {
      x: 0.62, y: ry + 0.17, w: 0.24, h: 0.24,
      fill: { color: r.color }, line: { color: r.color, width: 0 },
    });
    slide.addText(r.num, {
      x: 0.62, y: ry + 0.17, w: 0.24, h: 0.24,
      fontSize: 9, bold: true, color: "FFFFFF",
      align: "center", valign: "middle", fontFace: FONTS.body,
    });
    // Part label
    slide.addText(r.part, {
      x: 1.0, y: ry + 0.06, w: 1.0, h: 0.25,
      fontSize: 9, bold: true, color: r.color, fontFace: FONTS.body,
    });
    // Title
    slide.addText(r.title, {
      x: 1.0, y: ry + 0.28, w: 4.5, h: 0.25,
      fontSize: 12, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    // Sub
    slide.addText(r.sub, {
      x: 6.2, y: ry + 0.17, w: 3.2, h: 0.25,
      fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body, align: "right", valign: "middle",
    });
    ry += 0.65;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 3 — 起點：最簡單的部署架構
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide3(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "起點：最簡單的部署架構",
    partLabel: "PART 1  ·  03 / 50",
    accentColor: COLORS.backend,
    complexity: 1,
  });

  // Zone label
  slide.addText("SINGLE HOST DEPLOYMENT", {
    x: 0.3, y: 0.62, w: 3.0, h: 0.2,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, charSpacing: 1,
  });

  // User / Client node
  addNodeCard(slide, pres, { x: 0.4, y: 1.3, w: 1.25, h: 1.05, emoji: "👤", name: "Client", meta: "Browser", borderColor: COLORS.client });

  // Arrow from client to zone
  addHArrow(slide, pres, { x: 1.72, y: 1.72, w: 0.6, label: "HTTP/80", color: COLORS.accent });

  // Zone border for ubuntu-01
  addZoneBorder(slide, pres, { x: 2.4, y: 0.9, w: 7.0, h: 2.3, color: COLORS.backend, label: "ubuntu-01" });

  // Inside zone: Frontend (Nginx)
  addNodeCard(slide, pres, { x: 2.7, y: 1.15, w: 1.8, h: 1.6, emoji: "🌐", name: "Frontend", meta: "Nginx :80", borderColor: COLORS.frontend });

  // Arrow Nginx → FastAPI
  addHArrow(slide, pres, { x: 4.57, y: 1.8, w: 0.56, label: "proxy", color: COLORS.frontend });

  // Backend (FastAPI)
  addNodeCard(slide, pres, { x: 5.2, y: 1.15, w: 1.8, h: 1.6, emoji: "⚙️", name: "Backend", meta: "FastAPI :8080", borderColor: COLORS.backend });

  // Arrow FastAPI → Postgres
  addHArrow(slide, pres, { x: 7.07, y: 1.8, w: 0.56, label: "SQL", color: COLORS.database });

  // Database (Postgres)
  addNodeCard(slide, pres, { x: 7.7, y: 1.15, w: 1.5, h: 1.6, emoji: "🗄️", name: "Database", meta: "Postgres :5432", borderColor: COLORS.database });

  // Resource strip
  slide.addText("同一台機器共享：CPU / RAM / Disk / Network", {
    x: 2.4, y: 2.9, w: 7.0, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Bottom panel
  addBottomPanel(slide, pres, [
    { title: "部署超簡單，一台搞定",      sub: "幾分鐘內可完成部署" },
    { title: "Dev ≈ Prod，除錯方便",     sub: "所有 log 在同一處" },
  ], [
    { title: "單點故障 (SPOF)",          sub: "任一進程掛掉，整個服務停止" },
    { title: "無法水平擴展",              sub: "流量增加只能換更大的機器" },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 4 — 一個 HTTP Request 的完整旅程
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide4(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "一個 HTTP Request 的完整旅程",
    partLabel: "PART 1  ·  04 / 50",
    accentColor: COLORS.accent,
  });

  const nodeY = 1.0;
  const nodeH = 1.1;

  // 5 nodes
  addNodeCard(slide, pres, { x: 0.4,  y: nodeY, w: 1.0, h: nodeH, emoji: "👤", name: "Client",   meta: "瀏覽器輸入 URL",    borderColor: COLORS.client });
  addNodeCard(slide, pres, { x: 2.3,  y: nodeY, w: 1.0, h: nodeH, emoji: "🔍", name: "DNS",      meta: "解析 IP 位址",      borderColor: COLORS.infra });
  addNodeCard(slide, pres, { x: 4.2,  y: nodeY, w: 1.0, h: nodeH, emoji: "🌐", name: "Frontend", meta: "Nginx :80",         borderColor: COLORS.frontend });
  addNodeCard(slide, pres, { x: 6.1,  y: nodeY, w: 1.0, h: nodeH, emoji: "⚙️",  name: "Backend",  meta: "FastAPI :8080",     borderColor: COLORS.backend });
  addNodeCard(slide, pres, { x: 8.0,  y: nodeY, w: 1.0, h: nodeH, emoji: "🗄️", name: "Database", meta: "Postgres :5432",    borderColor: COLORS.database });

  // Arrows between nodes
  addHArrow(slide, pres, { x: 1.47, y: 1.45, w: 0.76, label: "DNS Query", color: COLORS.infra });
  addHArrow(slide, pres, { x: 3.37, y: 1.45, w: 0.76, label: "TCP :80",   color: COLORS.frontend });
  addHArrow(slide, pres, { x: 5.27, y: 1.45, w: 0.76, label: "Proxy Pass",color: COLORS.backend });
  addHArrow(slide, pres, { x: 7.17, y: 1.45, w: 0.76, label: "SQL Query", color: COLORS.database });

  // Response arrow (going left — draw as a line)
  slide.addShape(pres.ShapeType.line, {
    x: 1.4, y: 2.85, w: 6.6, h: 0,
    line: { color: COLORS.success, width: 1.5, endArrowType: "arrow" },
  });
  slide.addText("← HTTP Response (JSON)", {
    x: 2.0, y: 2.68, w: 5.0, h: 0.22,
    fontSize: 9, color: COLORS.success, fontFace: FONTS.code, align: "center",
  });

  // Latency bar background
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.2, w: 9.4, h: 0.55, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.border, width: 0.75 },
  });

  // Proportional segments inside latency bar
  const barX = 0.4;
  const barY = 3.32;
  const barW = 9.2;
  const barH = 0.22;
  const segs = [
    { pct: 0.08, color: COLORS.infra,    label: "DNS\n~5ms" },
    { pct: 0.12, color: COLORS.frontend, label: "TCP\n~20ms" },
    { pct: 0.15, color: COLORS.backend,  label: "Nginx\n~40ms" },
    { pct: 0.25, color: COLORS.success,  label: "App\n~80ms" },
    { pct: 0.40, color: COLORS.database, label: "DB — 通常是瓶頸\n~200ms+" },
  ];
  let sx = barX;
  segs.forEach((s) => {
    const sw = barW * s.pct;
    slide.addShape(pres.ShapeType.rect, {
      x: sx, y: barY, w: sw, h: barH,
      fill: { color: s.color }, line: { color: s.color, width: 0 },
    });
    slide.addText(s.label, {
      x: sx, y: barY + barH + 0.02, w: sw, h: 0.28,
      fontSize: 7.5, color: s.color, fontFace: FONTS.code, align: "center",
    });
    sx += sw;
  });

  // Tip bar
  addTipBar(slide, pres, {
    y: 3.88,
    text: "在單機架構中，所有步驟共用同一組資源 — 任何一步過載，全部都跟著慢下來",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 5 — 第一步擴展：分離資料庫 Server
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide5(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "第一步擴展：分離資料庫 Server",
    partLabel: "PART 1  ·  05 / 50",
    accentColor: COLORS.database,
    complexity: 3,
  });

  // Zone label
  slide.addText("TWO-MACHINE DEPLOYMENT", {
    x: 0.3, y: 0.62, w: 4.0, h: 0.2,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, charSpacing: 1,
  });

  // Client node + arrow
  addNodeCard(slide, pres, { x: 0.15, y: 1.5, w: 0.8, h: 0.8, emoji: "👤", name: "Client", meta: "Browser", borderColor: COLORS.client });
  addHArrow(slide, pres, { x: 1.0, y: 1.85, w: 0.55, label: "HTTP", color: COLORS.accent });

  // App server zone
  addZoneBorder(slide, pres, { x: 1.6, y: 0.85, w: 3.5, h: 2.2, color: COLORS.backend, label: "app-server-01" });
  addNodeCard(slide, pres, { x: 2.0, y: 1.1, w: 2.6, h: 1.7, emoji: "⚙️", name: "App Server", meta: "Frontend + Backend\nNginx + FastAPI", borderColor: COLORS.backend });

  // Arrow between machines
  addHArrow(slide, pres, { x: 5.2, y: 1.85, w: 0.9, label: "SQL :5432", color: COLORS.database });

  // DB server zone
  addZoneBorder(slide, pres, { x: 6.2, y: 0.85, w: 3.5, h: 2.2, color: COLORS.database, label: "db-server-01" });
  addNodeCard(slide, pres, { x: 6.6, y: 1.1, w: 2.6, h: 1.7, emoji: "🗄️", name: "Database", meta: "PostgreSQL :5432\n専用機器", borderColor: COLORS.database });

  // Bottom panel
  addBottomPanel(slide, pres, [
    { title: "資料獨立備份",        sub: "DB 機器可獨立 snapshot" },
    { title: "App Server 可重啟不影響資料", sub: "分離職責，故障範圍縮小" },
  ], [
    { title: "網路延遲增加",        sub: "同主機 IPC → 跨機器 TCP" },
    { title: "仍然是單點故障",      sub: "App 或 DB 任一掛掉，服務中斷" },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 6 — 三層架構
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide6(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "三層架構：前端 + 後端 + 資料庫",
    partLabel: "PART 1  ·  06 / 50",
    accentColor: COLORS.frontend,
    complexity: 5,
  });

  const nodeY = 0.75;

  // Client
  addNodeCard(slide, pres, { x: 0.3, y: nodeY, w: 1.2, h: 1.4, emoji: "👤", name: "Client", borderColor: COLORS.client });

  addHArrow(slide, pres, { x: 1.57, y: 1.45, w: 0.46, label: "HTTP/443", color: COLORS.frontend });

  // Frontend
  addNodeCard(slide, pres, { x: 2.1, y: nodeY, w: 1.7, h: 1.7, emoji: "🌐", name: "Frontend", meta: "Nginx\nserver-01", borderColor: COLORS.frontend });

  addHArrow(slide, pres, { x: 3.87, y: 1.5, w: 0.5, label: "Proxy", color: COLORS.backend });

  // Backend
  addNodeCard(slide, pres, { x: 4.45, y: nodeY, w: 1.7, h: 1.7, emoji: "⚙️", name: "Backend", meta: "FastAPI\nserver-02", borderColor: COLORS.backend });

  addHArrow(slide, pres, { x: 6.22, y: 1.5, w: 0.5, label: "SQL", color: COLORS.database });

  // Database
  addNodeCard(slide, pres, { x: 6.8, y: nodeY, w: 1.7, h: 1.7, emoji: "🗄️", name: "Database", meta: "PostgreSQL\nserver-03", borderColor: COLORS.database });

  // Role labels below nodes
  slide.addText("靜態資源 / 反向代理", {
    x: 2.1, y: 2.55, w: 1.7, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });
  slide.addText("業務邏輯 / API", {
    x: 4.45, y: 2.55, w: 1.7, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });
  slide.addText("資料持久化", {
    x: 6.8, y: 2.55, w: 1.7, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Bottom panel
  addBottomPanel(slide, pres, [
    { title: "職責分離，各自獨立擴展",  sub: "前後端可以分別 Scale" },
    { title: "技術棧靈活",             sub: "各層可選用最適合的技術" },
  ], [
    { title: "部署順序問題",           sub: "DB → Backend → Frontend，順序錯誤就失敗" },
    { title: "版本相依地獄",           sub: "三個 repo 的版本必須匹配" },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 7 — 三層架構的真實挑戰
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide7(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "三層架構的真實挑戰",
    partLabel: "PART 1  ·  07 / 50",
    accentColor: COLORS.danger,
  });

  const cards = [
    {
      x: 0.3, y: 0.62, emoji: "💣", title: "部署順序地雷",
      items: ["• 必須先啟動 DB，再啟動 Backend", "• 再啟動 Frontend", "• 順序錯一個 → 服務全掛"],
    },
    {
      x: 5.2, y: 0.62, emoji: "🔗", title: "版本相依地獄",
      items: ["• 前端 v2.1 依賴後端 API v3", "• 後端 v3 依賴 DB Schema v5", "• 任一版本不對齊 → 整個掛"],
    },
    {
      x: 0.3, y: 3.02, emoji: "😱", title: "環境差異問題",
      items: ["• 開發: Mac OS + brew", "• 正式: Ubuntu 20.04 + apt", "• 「在我這裡可以跑！」"],
    },
    {
      x: 5.2, y: 3.02, emoji: "⛔", title: "Scale Out 前提條件",
      items: ["• Session 儲存在本機 → 無法多機", "• 本機快取 → 各機器資料不同", "• 本機寫檔 → 資料只在一台"],
    },
  ];

  cards.forEach((c) => {
    // Card background
    slide.addShape(pres.ShapeType.roundRect, {
      x: c.x, y: c.y, w: 4.5, h: 2.25, rectRadius: 0.12,
      fill: { color: COLORS.cardDanger },
      line: { color: COLORS.danger, width: 1.2 },
      shadow: { type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.4 },
    });
    // Emoji
    slide.addText(c.emoji, {
      x: c.x, y: c.y + 0.12, w: 4.5, h: 0.45,
      fontSize: 28, align: "center",
    });
    // Title
    slide.addText(c.title, {
      x: c.x + 0.15, y: c.y + 0.62, w: 4.2, h: 0.32,
      fontSize: 14, bold: true, color: COLORS.danger, fontFace: FONTS.body,
    });
    // Items
    c.items.forEach((item, i) => {
      slide.addText(item, {
        x: c.x + 0.15, y: c.y + 1.02 + i * 0.36, w: 4.2, h: 0.3,
        fontSize: 11, color: COLORS.text, fontFace: FONTS.body,
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 8 — 如何找出系統瓶頸？
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide8(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "如何找出系統瓶頸？",
    partLabel: "PART 1  ·  08 / 50",
    accentColor: COLORS.warning,
  });

  // Left column — big emoji + text
  slide.addText("🔍", {
    x: 0.3, y: 1.0, w: 3.0, h: 1.6,
    fontSize: 80, align: "center", valign: "middle",
  });
  slide.addText("找瓶頸", {
    x: 0.3, y: 2.85, w: 3.0, h: 0.5,
    fontSize: 18, bold: true, color: COLORS.warning, fontFace: FONTS.body, align: "center",
  });

  // Right column — bottleneck rows
  const rows = [
    { color: COLORS.danger,   emoji: "🔥", title: "CPU 飽和",        sub: "症狀: 請求越來越慢 | 工具: top, htop, Prometheus" },
    { color: COLORS.warning,  emoji: "💾", title: "記憶體不足",      sub: "症狀: OOM kills | 工具: free -m, memory_usage" },
    { color: COLORS.database, emoji: "💿", title: "磁碟 I/O 瓶頸",   sub: "症狀: DB 查詢慢 | 工具: iostat, pg_stat" },
    { color: COLORS.frontend, emoji: "🌐", title: "網路頻寬",        sub: "症狀: 大檔案傳輸慢 | 工具: iftop, netstat" },
    { color: COLORS.accent,   emoji: "📊", title: "慢查詢 (最常見)", sub: "症狀: API P99 高 | 工具: EXPLAIN ANALYZE, slow_log" },
  ];

  let ry = 0.75;
  rows.forEach((r) => {
    // Card background
    slide.addShape(pres.ShapeType.roundRect, {
      x: 3.9, y: ry, w: 5.7, h: 0.72, rectRadius: 0.07,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.border, width: 0.5 },
    });
    // Left color strip
    slide.addShape(pres.ShapeType.rect, {
      x: 3.9, y: ry, w: 0.08, h: 0.72,
      fill: { color: r.color }, line: { color: r.color, width: 0 },
    });
    // Emoji
    slide.addText(r.emoji, {
      x: 4.05, y: ry + 0.1, w: 0.42, h: 0.52,
      fontSize: 22, valign: "middle",
    });
    // Title
    slide.addText(r.title, {
      x: 4.55, y: ry + 0.06, w: 4.9, h: 0.26,
      fontSize: 11.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    // Sub
    slide.addText(r.sub, {
      x: 4.55, y: ry + 0.34, w: 4.9, h: 0.26,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.code,
    });
    ry += 0.85;
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "先量測再優化 — 沒有量測數據就動手，等於猜測。Profile first, optimize second.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 9 — 何時需要開始思考 Scale？
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide9(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "何時需要開始思考 Scale？",
    partLabel: "PART 1  ·  09 / 50",
    accentColor: COLORS.warning,
  });

  // Three metric cards
  addMetricCard(slide, pres, { x: 0.4, y: 0.75, w: 2.9, h: 1.9, value: "CPU > 70%",   label: "持續 5 分鐘以上",   sub: "不是偶發 spike",            color: COLORS.danger });
  addMetricCard(slide, pres, { x: 3.5, y: 0.75, w: 2.9, h: 1.9, value: "P99 > 1s",    label: "API 尾端延遲",      sub: "使用者已感受到卡頓",         color: COLORS.warning });
  addMetricCard(slide, pres, { x: 6.6, y: 0.75, w: 2.9, h: 1.9, value: "Error > 0.1%",label: "錯誤率超過閾值",    sub: "5xx 或 timeout 增加",        color: COLORS.danger });

  // Warning card
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.85, w: 9.4, h: 0.55, rectRadius: 0.07,
    fill: { color: COLORS.cardWarn },
    line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("⚠️  常見錯誤：過早 Scale — 先從程式優化開始 (索引、快取、查詢)，不要一有問題就加機器", {
    x: 0.5, y: 2.89, w: 9.0, h: 0.47,
    fontSize: 11, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  // Left card — do these first
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.55, w: 4.5, h: 1.75, rectRadius: 0.1,
    fill: { color: COLORS.cardSuccess },
    line: { color: COLORS.success, width: 1.0 },
  });
  slide.addText("✅ 先做這些", {
    x: 0.5, y: 3.65, w: 4.1, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  ["• 加索引 (最快、最便宜)", "• 引入 Redis 快取", "• 優化 N+1 查詢", "• CDN 靜態資源"].forEach((item, i) => {
    slide.addText(item, {
      x: 0.5, y: 4.02 + i * 0.3, w: 4.1, h: 0.27,
      fontSize: 11, color: COLORS.text, fontFace: FONTS.body,
    });
  });

  // Right card — scale out considerations
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 3.55, w: 4.5, h: 1.75, rectRadius: 0.1,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("⚠️ 再考慮 Scale Out", {
    x: 5.4, y: 3.65, w: 4.1, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });
  ["• 確認瓶頸真的是機器不足", "• 應用必須先設計成 Stateless", "• 需要 Load Balancer"].forEach((item, i) => {
    slide.addText(item, {
      x: 5.4, y: 4.02 + i * 0.3, w: 4.1, h: 0.27,
      fontSize: 11, color: COLORS.text, fontFace: FONTS.body,
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 10 — Scale Up vs Scale Out
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide10(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Scale Up vs Scale Out：兩種擴展策略",
    partLabel: "PART 1  ·  10 / 50",
    accentColor: COLORS.accent,
  });

  // Vertical divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.55, w: 0, h: 4.85,
    line: { color: COLORS.border, width: 0.75 },
  });

  // ── Left column: Scale Up ──────────────────────────────────────────────────
  addCompareHeading(slide, pres, { x: 0.3, y: 0.62, w: 4.4, label: "↑  Scale Up（垂直擴展）", type: "bad" });

  // Growing servers visual
  addNodeCard(slide, pres, { x: 0.5, y: 1.15, w: 0.9, h: 0.9,  emoji: "⚙️", meta: "2 vCPU",    borderColor: COLORS.textMuted });
  slide.addText("→", { x: 1.45, y: 1.45, w: 0.3, h: 0.3, fontSize: 16, bold: true, color: COLORS.accent, fontFace: FONTS.body, align: "center" });
  addNodeCard(slide, pres, { x: 1.8, y: 1.05, w: 1.1, h: 1.1,  emoji: "⚙️", meta: "16 vCPU",   borderColor: COLORS.backend });
  slide.addText("→", { x: 2.95, y: 1.45, w: 0.3, h: 0.3, fontSize: 16, bold: true, color: COLORS.accent, fontFace: FONTS.body, align: "center" });
  addNodeCard(slide, pres, { x: 3.1, y: 0.9,  w: 1.35, h: 1.35, emoji: "⚙️", meta: "64 vCPU 💸", borderColor: COLORS.danger });

  // "上限" dashed box indicator
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.5, y: 0.95, w: 0.35, h: 1.2, rectRadius: 0.05,
    fill: { type: "none" },
    line: { color: COLORS.danger, width: 1.0, dashType: "dash" },
  });
  slide.addText("上限", {
    x: 4.48, y: 0.88, w: 0.4, h: 0.18,
    fontSize: 7.5, color: COLORS.danger, fontFace: FONTS.body, align: "center",
  });

  // Compare items left
  addCompareItem(slide, pres, { x: 0.3, y: 2.48, w: 4.4, emoji: "✓", title: "不需改程式碼",     sub: "直接升級機器規格",              type: "good" });
  addCompareItem(slide, pres, { x: 0.3, y: 3.14, w: 4.4, emoji: "✗", title: "費用指數成長",     sub: "高階機器貴、且仍是單點故障",    type: "bad" });
  addCompareItem(slide, pres, { x: 0.3, y: 3.82, w: 4.4, emoji: "✗", title: "物理上限存在",     sub: "停機才能升級，有天花板",        type: "bad" });

  // ── Right column: Scale Out ────────────────────────────────────────────────
  addCompareHeading(slide, pres, { x: 5.2, y: 0.62, w: 4.4, label: "↔  Scale Out（水平擴展）", type: "good" });

  // LB + servers visual
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.4, y: 1.1, w: 0.9, h: 0.9, rectRadius: 0.1,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.infra, width: 1.2 },
  });
  slide.addText("⚖️\nLB", {
    x: 5.4, y: 1.1, w: 0.9, h: 0.9,
    fontSize: 13, align: "center", valign: "middle", color: COLORS.infra, fontFace: FONTS.body,
  });

  // 3 small server nodes
  const srvY = [0.9, 1.5, 2.1];
  srvY.forEach((sy) => {
    addMiniNode(slide, pres, { x: 6.8, y: sy, w: 1.1, h: 0.45, emoji: "⚙️", label: "Server", borderColor: COLORS.backend });
    // Arrow from LB to server
    slide.addShape(pres.ShapeType.line, {
      x: 6.3, y: sy + 0.22, w: 0.5, h: 0,
      line: { color: COLORS.infra, width: 1.0, endArrowType: "arrow" },
    });
  });

  // Compare items right
  addCompareItem(slide, pres, { x: 5.2, y: 2.48, w: 4.4, emoji: "✓", title: "線性成本增長",          sub: "用小機器組成艦隊，彈性高",           type: "good" });
  addCompareItem(slide, pres, { x: 5.2, y: 3.14, w: 4.4, emoji: "✓", title: "無停機擴容",            sub: "動態加減節點，應對流量高峰",          type: "good" });
  addCompareItem(slide, pres, { x: 5.2, y: 3.82, w: 4.4, emoji: "!", title: "前提：應用必須 Stateless", sub: "Session、本機快取、本機寫檔 → 都要重新設計", type: "warning" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 11 — Stateless 設計
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide11(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Stateless 設計：Scale Out 的先決條件",
    partLabel: "PART 1  ·  11 / 50",
    accentColor: COLORS.accent,
  });

  // Vertical divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.55, w: 0, h: 4.85,
    line: { color: COLORS.border, width: 0.75 },
  });

  // ── Left: Stateful ────────────────────────────────────────────────────────
  addCompareHeading(slide, pres, { x: 0.3, y: 0.62, w: 4.4, label: "❌  Stateful — 無法 Scale Out", type: "bad" });

  // Architecture diagram
  addNodeCard(slide, pres, { x: 0.4, y: 1.3, w: 1.0, h: 0.85, emoji: "👤", name: "Client", borderColor: COLORS.client });
  addHArrow(slide, pres, { x: 1.47, y: 1.68, w: 0.4, label: "", color: COLORS.accent });
  addNodeCard(slide, pres, { x: 1.93, y: 1.3, w: 0.9, h: 0.85, emoji: "⚖️", name: "LB", borderColor: COLORS.infra });

  // Two servers with session icon
  addNodeCard(slide, pres, { x: 3.1, y: 0.95, w: 1.2, h: 0.75, emoji: "💾", name: "Server A", borderColor: COLORS.backend });
  addNodeCard(slide, pres, { x: 3.1, y: 1.85, w: 1.2, h: 0.75, emoji: "💾", name: "Server B", borderColor: COLORS.backend });

  // Arrows from LB to servers
  slide.addShape(pres.ShapeType.line, { x: 2.83, y: 1.42, w: 0.27, h: -0.15, line: { color: COLORS.infra, width: 1.0, endArrowType: "arrow" } });
  slide.addShape(pres.ShapeType.line, { x: 2.83, y: 1.55, w: 0.27, h: 0.55,  line: { color: COLORS.infra, width: 1.0, endArrowType: "arrow" } });

  // Problem annotation
  slide.addText("Request #2 找不到 Session → 被登出！", {
    x: 0.3, y: 2.75, w: 4.4, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });

  addCompareItem(slide, pres, { x: 0.3, y: 3.05, w: 4.4, emoji: "✗", title: "Session 存在本機記憶體",    type: "bad" });
  addCompareItem(slide, pres, { x: 0.3, y: 3.62, w: 4.4, emoji: "✗", title: "LB 必須用 Sticky Session", sub: "一台掛掉，使用者全部登出", type: "bad" });

  // ── Right: Stateless ───────────────────────────────────────────────────────
  addCompareHeading(slide, pres, { x: 5.2, y: 0.62, w: 4.4, label: "✅  Stateless — 可自由 Scale Out", type: "good" });

  // Architecture diagram
  addNodeCard(slide, pres, { x: 5.3, y: 1.3, w: 1.0, h: 0.85, emoji: "👤", name: "Client", borderColor: COLORS.client });
  addHArrow(slide, pres, { x: 6.37, y: 1.68, w: 0.4, label: "", color: COLORS.accent });
  addNodeCard(slide, pres, { x: 6.83, y: 1.3, w: 0.9, h: 0.85, emoji: "⚖️", name: "LB", borderColor: COLORS.infra });

  // Zone around servers
  addZoneBorder(slide, pres, { x: 7.85, y: 0.9, w: 1.65, h: 1.75, color: COLORS.backend, label: "" });

  // Servers A & B (stateless)
  addMiniNode(slide, pres, { x: 7.95, y: 1.05, w: 1.45, h: 0.45, emoji: "⚙️", label: "Server A", borderColor: COLORS.backend });
  addMiniNode(slide, pres, { x: 7.95, y: 1.55, w: 1.45, h: 0.45, emoji: "⚙️", label: "Server B", borderColor: COLORS.backend });

  // Arrows from LB to servers
  slide.addShape(pres.ShapeType.line, { x: 7.73, y: 1.48, w: 0.22, h: -0.16, line: { color: COLORS.infra, width: 1.0, endArrowType: "arrow" } });
  slide.addShape(pres.ShapeType.line, { x: 7.73, y: 1.57, w: 0.22, h: 0.22,  line: { color: COLORS.infra, width: 1.0, endArrowType: "arrow" } });

  // Redis node
  addNodeCard(slide, pres, { x: 8.3, y: 2.8, w: 1.4, h: 0.9, emoji: "⚡", name: "Redis", meta: "Session Store", borderColor: COLORS.infra });
  // Arrows from servers to Redis
  slide.addShape(pres.ShapeType.line, { x: 9.0, y: 1.5, w: 0, h: 1.3, line: { color: COLORS.infra, width: 1.0, dashType: "dash", endArrowType: "arrow" } });

  addCompareItem(slide, pres, { x: 5.2, y: 3.05, w: 4.4, emoji: "✓", title: "Session 集中存入 Redis",                                              type: "good" });
  addCompareItem(slide, pres, { x: 5.2, y: 3.62, w: 4.4, emoji: "✓", title: "任一 Server 都能處理任意請求",  sub: "LB 可自由分配，Server 可隨時加減", type: "good" });
  addCompareItem(slide, pres, { x: 5.2, y: 4.22, w: 4.4, emoji: "!", title: "其他需注意：本機快取、本機寫檔", sub: "任何「狀態」都要外部化",           type: "warning" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 12 — Part 1 小結
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide12(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Part 1 小結：架構演進路線圖",
    partLabel: "PART 1  ·  12 / 50",
    accentColor: COLORS.backend,
  });

  // 2×2 summary cards
  addSummaryCard(slide, pres, { x: 0.3, y: 0.65, w: 4.5, h: 2.25, icon: "🖥️",  title: "單機部署",      color: COLORS.backend,   items: ["設定簡單，快速啟動", "SPOF 單點故障", "不可 Scale"] });
  addSummaryCard(slide, pres, { x: 5.2, y: 0.65, w: 4.5, h: 2.25, icon: "🗄️",  title: "DB 分離",       color: COLORS.database,  items: ["資料與應用分開", "獨立備份與優化", "仍舊 2 個 SPOF"] });
  addSummaryCard(slide, pres, { x: 0.3, y: 3.1,  w: 4.5, h: 2.25, icon: "🌐",  title: "三層架構",      color: COLORS.frontend,  items: ["職責分離清楚", "技術棧彈性", "版本相依複雜化"] });
  addSummaryCard(slide, pres, { x: 5.2, y: 3.1,  w: 4.5, h: 2.25, icon: "⚖️",  title: "Scale Out 準備", color: COLORS.infra,    items: ["需要 Load Balancer", "App 必須 Stateless", "準備好了嗎？→ Part 2"] });

  // Bottom CTA arrow
  slide.addText("→ Part 2: Scale Out 的挑戰", {
    x: 0, y: 5.28, w: 10, h: 0.2,
    fontSize: 11, color: COLORS.accent, fontFace: FONTS.body, bold: true, align: "center",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";   // 10" × 5.5"

  buildSlide1(pres);
  buildSlide2(pres);
  buildSlide3(pres);
  buildSlide4(pres);
  buildSlide5(pres);
  buildSlide6(pres);
  buildSlide7(pres);
  buildSlide8(pres);
  buildSlide9(pres);
  buildSlide10(pres);
  buildSlide11(pres);
  buildSlide12(pres);

  const outDir = path.join(__dirname, "..", "output");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "part1");
  await pres.writeFile({ fileName: outFile });
  console.log(`✅  Saved → ${outFile}.pptx`);
}

main().catch((err) => {
  console.error("❌  Error:", err);
  process.exit(1);
});
