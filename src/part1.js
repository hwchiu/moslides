// src/part1.js
// Part 1: 傳統部署演進 (Slides 1–12)

"use strict";

const fs      = require("fs");
const path    = require("path");
const pptxgen = require("pptxgenjs");
const { COLORS, FONTS, setTheme } = require("./design-system");
setTheme("light");
const {
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
} = require("./helpers");

// ─────────────────────────────────────────────────────────────────────────────
// Slide 1 — Cover
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide1(pres) {
  const slide = initSlide(pres);

  // ── Left half ──────────────────────────────────────────────────────────────

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

  // Subtitle
  slide.addText("System Deployment in Practice", {
    x: 0.5, y: 3.0, w: 4.2, h: 0.55,
    fontSize: 26, bold: true, color: COLORS.text, fontFace: FONTS.title,
  });

  // Description
  slide.addText("The complete evolution from monolithic deployment to Cloud Native", {
    x: 0.5, y: 3.55, w: 4.2, h: 0.35,
    fontSize: 13, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Vertical divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.3, w: 0.01, h: 4.9,
    line: { color: COLORS.border, width: 0.75 },
  });

  // ── Right half: Journey cards ──────────────────────────────────────────────
  const cards = [
    {
      border: COLORS.backend,   dot: COLORS.backend,   num: "1",
      title: "Traditional Deployment Evolution",
      sub:   "Single Server → Three-Tier → Distributed",
      chip: "Low Complexity", chipColor: COLORS.success,
    },
    {
      border: COLORS.infra,     dot: COLORS.infra,     num: "2",
      title: "Scale Out Challenges",
      sub:   "LB / Session / DB Replica / Cache / MQ",
      chip: "High Complexity 🔺", chipColor: COLORS.danger,
    },
    {
      border: COLORS.container, dot: COLORS.container, num: "3",
      title: "Container Revolution",
      sub:   "Docker · Compose · Registry",
      chip: "Complexity↓", chipColor: COLORS.container,
    },
    {
      border: COLORS.accent,    dot: COLORS.accent,    num: "4",
      title: "12-Factor + DevOps + SRE",
      sub:   "Engineering Best Practices · CI/CD · Observability",
      chip: "Eng. Discipline", chipColor: COLORS.accent,
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
  slide.addText("Course Outline", {
    x: 1.0, y: 0.28, w: 5.0, h: 0.55,
    fontSize: 30, bold: true, color: COLORS.accent, fontFace: FONTS.title,
  });

  // Subtitle
  slide.addText("Agenda — The Complete Evolution Path", {
    x: 1.0, y: 0.75, w: 5.0, h: 0.3,
    fontSize: 13, color: COLORS.textMuted, fontFace: FONTS.body,
  });



  const rows = [
    { color: COLORS.backend,   num: "1", part: "PART 1", title: "Traditional Deployment Evolution",      sub: "Single Server → Three-Tier" },
    { color: COLORS.infra,     num: "2", part: "PART 2", title: "Scale Out Challenges",   sub: "LB / Session / DB Scaling" },
    { color: COLORS.container, num: "3", part: "PART 3", title: "Container Revolution",   sub: "Docker / Compose / Registry" },
    { color: COLORS.accent,    num: "4", part: "PART 4", title: "12-Factor App",    sub: "Cloud-Ready App Design Principles" },
    { color: COLORS.frontend,  num: "5", part: "PART 5", title: "DevOps Integration",      sub: "CI/CD · GitOps · Deployment Strategies" },
    { color: COLORS.danger,    num: "6", part: "PART 6", title: "SDLC Closed Loop",        sub: "Observability · SRE · Post-mortem" },
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
    title: "Starting Point: The Simplest Deployment",
    partLabel: "PART 1",
    accentColor: COLORS.backend,
    complexity: 1,
  });

  // Zone label
  slide.addText("SINGLE HOST DEPLOYMENT", {
    x: 0.3, y: 0.62, w: 3.0, h: 0.2,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, charSpacing: 1,
  });

  // User / Client node
  addNodeCard(slide, pres, { x: 0.2, y: 1.05, w: 1.3, h: 1.2, emoji: "👤", name: "Client", meta: "Browser", borderColor: COLORS.client });

  // Arrow from client to zone
  addHArrow(slide, pres, { x: 1.57, y: 1.55, w: 0.5, label: "HTTP/80", color: COLORS.accent });

  // Zone border for ubuntu-01
  addZoneBorder(slide, pres, { x: 2.15, y: 0.75, w: 7.65, h: 2.6, color: COLORS.backend, label: "ubuntu-01" });

  // Inside zone: Frontend (Nginx)
  addNodeCard(slide, pres, { x: 2.4, y: 0.98, w: 2.0, h: 1.8, emoji: "🌐", name: "Frontend", meta: "Nginx :80", borderColor: COLORS.frontend });

  // Arrow Nginx → FastAPI
  addHArrow(slide, pres, { x: 4.47, y: 1.75, w: 0.56, label: "proxy", color: COLORS.frontend });

  // Backend (FastAPI)
  addNodeCard(slide, pres, { x: 5.1, y: 0.98, w: 2.0, h: 1.8, emoji: "⚙️", name: "Backend", meta: "FastAPI :8080", borderColor: COLORS.backend });

  // Arrow FastAPI → Postgres
  addHArrow(slide, pres, { x: 7.17, y: 1.75, w: 0.56, label: "SQL", color: COLORS.database });

  // Database (Postgres)
  addNodeCard(slide, pres, { x: 7.8, y: 0.98, w: 1.8, h: 1.8, emoji: "🗄️", name: "Database", meta: "Postgres :5432", borderColor: COLORS.database });

  // Resource strip
  slide.addText("All sharing a single machine: CPU / RAM / Disk / Network", {
    x: 2.15, y: 3.05, w: 7.65, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Bottom panel (custom y/h to accommodate 4 pros + 3 cons)
  addBottomPanel(slide, pres, [
    "Extremely simple deployment — one machine handles frontend, backend, and database",
    "All services colocated, making debugging and tuning easy",
    "Perfect for a one-person team",
    "Upgrade machine specs when performance is insufficient",
  ], [
    "Single Point of Failure (SPOF)",
    "Any component failure takes down the entire service",
    "No component can be scaled independently to handle traffic",
  ], { y: 3.3, h: 2.2 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 4 — 一個 HTTP Request 的完整旅程
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide4(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "The Complete Journey of an HTTP Request",
    partLabel: "PART 1",
    accentColor: COLORS.accent,
  });

  // Terminal-style subtitle
  slide.addText("$ traceroute  https://api.example.com", {
    x: 0.2, y: 0.55, w: 5.0, h: 0.22,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.code,
  });

  const nodeY = 0.85;
  const nodeH = 1.35;
  const nodeW = 1.3;
  const arrowY = nodeY + 0.38;

  // 5 nodes — color-matched names
  addNodeCard(slide, pres, { x: 0.2,  y: nodeY, w: nodeW, h: nodeH, emoji: "👤", name: "Client",   meta: "Browser enters URL",    borderColor: COLORS.client,   nameColor: COLORS.client });
  addNodeCard(slide, pres, { x: 2.1,  y: nodeY, w: nodeW, h: nodeH, emoji: "🔍", name: "DNS",      meta: "Resolves IP address",      borderColor: COLORS.infra,    nameColor: COLORS.infra });
  addNodeCard(slide, pres, { x: 4.0,  y: nodeY, w: nodeW, h: nodeH, emoji: "🌐", name: "Frontend", meta: "Nginx :443\nTLS + routing", borderColor: COLORS.frontend, nameColor: COLORS.frontend });
  addNodeCard(slide, pres, { x: 5.9,  y: nodeY, w: nodeW, h: nodeH, emoji: "⚙️",  name: "Backend",  meta: "FastAPI :8080\nbusiness logic", borderColor: COLORS.backend,  nameColor: COLORS.backend });
  addNodeCard(slide, pres, { x: 7.8,  y: nodeY, w: nodeW, h: nodeH, emoji: "🗄️", name: "Database", meta: "Postgres :5432\npersistent store", borderColor: COLORS.database, nameColor: COLORS.database });

  // Pill badge arrows between nodes
  addHArrow(slide, pres, { x: 1.57, y: arrowY, w: 0.46, label: "DNS Query", color: COLORS.infra });
  addHArrow(slide, pres, { x: 3.47, y: arrowY, w: 0.46, label: "TCP :443",  color: COLORS.frontend });
  addHArrow(slide, pres, { x: 5.37, y: arrowY, w: 0.46, label: "proxy pass", color: COLORS.backend });
  addHArrow(slide, pres, { x: 7.17, y: arrowY, w: 0.56, label: "SQL Query", color: COLORS.database });

  // Dashed response arrow
  addDashedHArrow(slide, pres, {
    x: 1.5, y: 2.55, w: 6.7,
    label: "HTTP 200 OK (JSON)",
    color: COLORS.success, reverse: true,
  });

  // Latency breakdown — code style header
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.2, y: 2.85, w: 9.6, h: 0.72, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.border, width: 0.75 },
  });
  slide.addText("// latency_breakdown = {", {
    x: 0.35, y: 2.87, w: 4.0, h: 0.2,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.code,
  });

  // Proportional segments
  const barX = 0.35, barY = 3.1, barW = 9.3, barH = 0.16;
  const segs = [
    { pct: 0.08, color: COLORS.infra,    label: "DNS ~5ms" },
    { pct: 0.12, color: COLORS.frontend, label: "TCP ~20ms" },
    { pct: 0.15, color: COLORS.backend,  label: "Nginx ~40ms" },
    { pct: 0.25, color: COLORS.success,  label: "App ~80ms" },
    { pct: 0.40, color: COLORS.database, label: "DB + Network ~200ms+" },
  ];
  let sx = barX;
  segs.forEach((s) => {
    const sw = barW * s.pct;
    slide.addShape(pres.ShapeType.roundRect, {
      x: sx, y: barY, w: sw - 0.04, h: barH, rectRadius: 0.03,
      fill: { color: s.color }, line: { color: s.color, width: 0 },
    });
    slide.addText(s.label, {
      x: sx, y: barY + barH + 0.01, w: sw, h: 0.18,
      fontSize: 7, color: s.color, fontFace: FONTS.code, align: "center",
    });
    sx += sw;
  });

  // Comment bar insight
  addCommentBar(slide, pres, {
    y: 3.72,
    message: "In a monolithic architecture, all layers share resources.",
    sub: "One slow layer blocks the entire request chain — hotspots: N+1 queries, unindexed lookups, blocking I/O.",
  });

  // Bottom knowledge cards
  addKnowledgeCards(slide, pres, [
    { title: "DNS Resolution", color: COLORS.infra,
      body: "~5ms avg; reduced by OS / browser caching.\nTTL controls how long cached records live." },
    { title: "App Processing", color: COLORS.backend,
      body: "Business logic and external I/O are\nthe most common throughput hotspots." },
    { title: "DB Query", color: COLORS.database,
      body: "Indexes and query patterns set tail latency.\nUse EXPLAIN ANALYZE to find slow queries." },
  ], { y: 4.35, h: 1.05 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 5 — 第一步擴展：分離資料庫 Server
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide5(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "First Expansion: Separate Database Server",
    partLabel: "PART 1",
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
  addNodeCard(slide, pres, { x: 6.6, y: 1.1, w: 2.6, h: 1.7, emoji: "🗄️", name: "Database", meta: "PostgreSQL :5432\nDedicated Machine", borderColor: COLORS.database });

  // Bottom panel
  addBottomPanel(slide, pres, [
    { title: "Independent Data Backup",        sub: "DB machine can be snapshotted independently" },
    { title: "App Server restarts without data loss", sub: "Separated responsibilities, reduced failure scope" },
  ], [
    { title: "Increased network latency",        sub: "Same-host IPC → cross-machine TCP" },
    { title: "Still a Single Point of Failure",      sub: "Either App or DB going down causes service outage" },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 6 — 三層架構
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide6(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Three-Tier Architecture: Frontend + Backend + Database",
    partLabel: "PART 1",
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
  slide.addText("Static Assets / Reverse Proxy", {
    x: 2.1, y: 2.55, w: 1.7, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });
  slide.addText("Business Logic / API", {
    x: 4.45, y: 2.55, w: 1.7, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });
  slide.addText("Data Persistence", {
    x: 6.8, y: 2.55, w: 1.7, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Bottom panel
  addBottomPanel(slide, pres, [
    { title: "Separation of concerns, independent scaling",  sub: "Frontend and backend can scale separately" },
    { title: "Flexible tech stack",             sub: "Each tier can use its most suitable technology" },
  ], [
    { title: "Deployment order issues",           sub: "DB → Backend → Frontend; wrong order = failure" },
    { title: "Version dependency hell",           sub: "Versions across three repos must match" },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 7 — 三層架構的真實挑戰
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide7(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Real Challenges of Three-Tier Architecture",
    partLabel: "PART 1",
    accentColor: COLORS.danger,
  });

  const cards = [
    {
      x: 0.3, y: 0.62, emoji: "💣", title: "Deployment Order Landmines",
      items: ["• Must start DB first, then Backend", "• Then start Frontend", "• Wrong order → entire service goes down"],
    },
    {
      x: 5.2, y: 0.62, emoji: "🔗", title: "Version Dependency Hell",
      items: ["• Frontend v2.1 depends on Backend API v3", "• Backend v3 depends on DB Schema v5", "• Any version mismatch → everything breaks"],
    },
    {
      x: 0.3, y: 3.02, emoji: "😱", title: "Environment Inconsistency",
      items: ["• Dev: Mac OS + brew", "• Prod: Ubuntu 20.04 + apt", "• \"It works on my machine!\""],
    },
    {
      x: 5.2, y: 3.02, emoji: "⛔", title: "Scale Out Prerequisites",
      items: ["• Session stored locally → can't go multi-node", "• Local cache → data differs per machine", "• Local file writes → data on one machine only"],
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
    title: "How to Identify System Bottlenecks?",
    partLabel: "PART 1",
    accentColor: COLORS.warning,
  });

  // Left column — big emoji + text
  slide.addText("🔍", {
    x: 0.3, y: 1.0, w: 3.0, h: 1.6,
    fontSize: 80, align: "center", valign: "middle",
  });
  slide.addText("Find Bottlenecks", {
    x: 0.3, y: 2.85, w: 3.0, h: 0.5,
    fontSize: 18, bold: true, color: COLORS.warning, fontFace: FONTS.body, align: "center",
  });

  // Right column — bottleneck rows
  const rows = [
    { color: COLORS.danger,   emoji: "🔥", title: "CPU Saturation",        sub: "Symptoms: requests slowing down | Tools: top, htop, Prometheus" },
    { color: COLORS.warning,  emoji: "💾", title: "Memory Exhaustion",      sub: "Symptoms: OOM kills | Tools: free -m, memory_usage" },
    { color: COLORS.database, emoji: "💿", title: "Disk I/O Bottleneck",   sub: "Symptoms: slow DB queries | Tools: iostat, pg_stat" },
    { color: COLORS.frontend, emoji: "🌐", title: "Network Bandwidth",        sub: "Symptoms: slow large file transfers | Tools: iftop, netstat" },
    { color: COLORS.accent,   emoji: "📊", title: "Slow Queries (Most Common)", sub: "Symptoms: high API P99 | Tools: EXPLAIN ANALYZE, slow_log" },
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
    text: "Measure before optimizing — acting without data is guessing. Profile first, optimize second.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 9 — 何時需要開始思考 Scale？
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide9(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "When Should You Start Thinking About Scaling?",
    partLabel: "PART 1",
    accentColor: COLORS.warning,
  });

  // Three metric cards
  addMetricCard(slide, pres, { x: 0.4, y: 0.75, w: 2.9, h: 1.9, value: "CPU > 70%",   label: "Sustained for 5+ minutes",   sub: "Not an occasional spike",            color: COLORS.danger });
  addMetricCard(slide, pres, { x: 3.5, y: 0.75, w: 2.9, h: 1.9, value: "P99 > 1s",    label: "API Tail Latency",      sub: "Users are noticing lag",         color: COLORS.warning });
  addMetricCard(slide, pres, { x: 6.6, y: 0.75, w: 2.9, h: 1.9, value: "Error > 0.1%",label: "Error Rate Over Threshold",    sub: "5xx or timeouts increasing",        color: COLORS.danger });

  // Warning card
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.85, w: 9.4, h: 0.55, rectRadius: 0.07,
    fill: { color: COLORS.cardWarn },
    line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("⚠️  Common mistake: premature scaling — start with code optimization (indexes, caching, queries); don't add machines at the first sign of trouble", {
    x: 0.5, y: 2.89, w: 9.0, h: 0.47,
    fontSize: 11, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  // Left card — do these first
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.55, w: 4.5, h: 1.75, rectRadius: 0.1,
    fill: { color: COLORS.cardSuccess },
    line: { color: COLORS.success, width: 1.0 },
  });
  slide.addText("✅ Do These First", {
    x: 0.5, y: 3.65, w: 4.1, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  ["• Add indexes (fastest, cheapest)", "• Introduce Redis caching", "• Optimize N+1 queries", "• CDN for static assets"].forEach((item, i) => {
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
  slide.addText("⚠️ Then Consider Scale Out", {
    x: 5.4, y: 3.65, w: 4.1, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });
  ["• Confirm the bottleneck is truly insufficient capacity", "• Application must be designed stateless first", "• Requires a Load Balancer"].forEach((item, i) => {
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
    title: "Scale Up vs Scale Out: Two Scaling Strategies",
    partLabel: "PART 1",
    accentColor: COLORS.accent,
  });

  // Vertical divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.55, w: 0.01, h: 4.85,
    line: { color: COLORS.border, width: 0.75 },
  });

  // ── Left column: Scale Up ──────────────────────────────────────────────────
  addCompareHeading(slide, pres, { x: 0.3, y: 0.62, w: 4.4, label: "↑  Scale Up (Vertical Scaling)", type: "bad" });

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
  slide.addText("Limit", {
    x: 4.48, y: 0.88, w: 0.4, h: 0.18,
    fontSize: 7.5, color: COLORS.danger, fontFace: FONTS.body, align: "center",
  });

  // Compare items left
  addCompareItem(slide, pres, { x: 0.3, y: 2.48, w: 4.4, emoji: "✓", title: "No Code Changes Required",     sub: "Simply upgrade machine specs",              type: "good" });
  addCompareItem(slide, pres, { x: 0.3, y: 3.14, w: 4.4, emoji: "✗", title: "Exponential Cost Growth",     sub: "High-end machines are expensive and still a SPOF",    type: "bad" });
  addCompareItem(slide, pres, { x: 0.3, y: 3.82, w: 4.4, emoji: "✗", title: "Physical Limits Exist",     sub: "Requires downtime to upgrade; has a ceiling",        type: "bad" });

  // ── Right column: Scale Out ────────────────────────────────────────────────
  addCompareHeading(slide, pres, { x: 5.2, y: 0.62, w: 4.4, label: "↔  Scale Out (Horizontal Scaling)", type: "good" });

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
      x: 6.3, y: sy + 0.22, w: 0.5, h: 0.01,
      line: { color: COLORS.infra, width: 1.0, endArrowType: "arrow" },
    });
  });

  // Compare items right
  addCompareItem(slide, pres, { x: 5.2, y: 2.48, w: 4.4, emoji: "✓", title: "Linear Cost Growth",          sub: "Build a fleet with small machines for high flexibility",           type: "good" });
  addCompareItem(slide, pres, { x: 5.2, y: 3.14, w: 4.4, emoji: "✓", title: "Scale Without Downtime",            sub: "Dynamically add/remove nodes to handle traffic peaks",          type: "good" });
  addCompareItem(slide, pres, { x: 5.2, y: 3.82, w: 4.4, emoji: "!", title: "Prerequisite: App Must Be Stateless", sub: "Session, local cache, local file writes → all need redesign", type: "warning" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 11 — Stateless 設計
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide11(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Stateless Design: The Prerequisite for Scale Out",
    partLabel: "PART 1",
    accentColor: COLORS.accent,
  });

  // Vertical divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.55, w: 0.01, h: 4.85,
    line: { color: COLORS.border, width: 0.75 },
  });

  // ── Left: Stateful ────────────────────────────────────────────────────────
  addCompareHeading(slide, pres, { x: 0.3, y: 0.62, w: 4.4, label: "❌  Stateful — Cannot Scale Out", type: "bad" });

  // Architecture diagram
  addNodeCard(slide, pres, { x: 0.4, y: 1.3, w: 1.0, h: 0.85, emoji: "👤", name: "Client", borderColor: COLORS.client });
  addHArrow(slide, pres, { x: 1.47, y: 1.68, w: 0.4, label: "", color: COLORS.accent });
  addNodeCard(slide, pres, { x: 1.93, y: 1.3, w: 0.9, h: 0.85, emoji: "⚖️", name: "LB", borderColor: COLORS.infra });

  // Two servers with session icon
  addNodeCard(slide, pres, { x: 3.1, y: 0.95, w: 1.2, h: 0.75, emoji: "💾", name: "Server A", borderColor: COLORS.backend });
  addNodeCard(slide, pres, { x: 3.1, y: 1.85, w: 1.2, h: 0.75, emoji: "💾", name: "Server B", borderColor: COLORS.backend });

  // Arrows from LB to servers
  slide.addShape(pres.ShapeType.line, { x: 2.83, y: 1.27, w: 0.27, h: 0.15, line: { color: COLORS.infra, width: 1.0, endArrowType: "arrow" } });
  slide.addShape(pres.ShapeType.line, { x: 2.83, y: 1.55, w: 0.27, h: 0.55,  line: { color: COLORS.infra, width: 1.0, endArrowType: "arrow" } });

  // Problem annotation
  slide.addText("Request #2 can't find Session → user gets logged out!", {
    x: 0.3, y: 2.75, w: 4.4, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });

  addCompareItem(slide, pres, { x: 0.3, y: 3.05, w: 4.4, emoji: "✗", title: "Session stored in local memory",    type: "bad" });
  addCompareItem(slide, pres, { x: 0.3, y: 3.62, w: 4.4, emoji: "✗", title: "LB must use Sticky Session", sub: "One server down = all its users logged out", type: "bad" });

  // ── Right: Stateless ───────────────────────────────────────────────────────
  addCompareHeading(slide, pres, { x: 5.2, y: 0.62, w: 4.4, label: "✅  Stateless — Free to Scale Out", type: "good" });

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
  slide.addShape(pres.ShapeType.line, { x: 7.73, y: 1.32, w: 0.22, h: 0.16, line: { color: COLORS.infra, width: 1.0, endArrowType: "arrow" } });
  slide.addShape(pres.ShapeType.line, { x: 7.73, y: 1.57, w: 0.22, h: 0.22,  line: { color: COLORS.infra, width: 1.0, endArrowType: "arrow" } });

  // Redis node
  addNodeCard(slide, pres, { x: 8.3, y: 2.8, w: 1.4, h: 0.9, emoji: "⚡", name: "Redis", meta: "Session Store", borderColor: COLORS.infra });
  // Arrows from servers to Redis
  slide.addShape(pres.ShapeType.line, { x: 9.0, y: 1.5, w: 0.01, h: 1.3, line: { color: COLORS.infra, width: 1.0, dashType: "dash", endArrowType: "arrow" } });

  addCompareItem(slide, pres, { x: 5.2, y: 3.05, w: 4.4, emoji: "✓", title: "Sessions centralized in Redis",                                              type: "good" });
  addCompareItem(slide, pres, { x: 5.2, y: 3.62, w: 4.4, emoji: "✓", title: "Any server can handle any request",  sub: "LB distributes freely; servers can be added or removed anytime", type: "good" });
  addCompareItem(slide, pres, { x: 5.2, y: 4.22, w: 4.4, emoji: "!", title: "Also watch out: local cache, local file writes", sub: "All state must be externalized",           type: "warning" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 12 — Part 1 小結
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide12(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Part 1 Summary: Architecture Evolution Roadmap",
    partLabel: "PART 1",
    accentColor: COLORS.backend,
  });

  // 2×2 summary cards
  addSummaryCard(slide, pres, { x: 0.3, y: 0.65, w: 4.5, h: 2.25, icon: "🖥️",  title: "Single-Server Deployment",      color: COLORS.backend,   items: ["Simple setup, fast to start", "SPOF — Single Point of Failure", "Cannot scale"] });
  addSummaryCard(slide, pres, { x: 5.2, y: 0.65, w: 4.5, h: 2.25, icon: "🗄️",  title: "DB Separation",       color: COLORS.database,  items: ["Data separated from application", "Independent backup and optimization", "Still 2 SPOFs"] });
  addSummaryCard(slide, pres, { x: 0.3, y: 3.1,  w: 4.5, h: 2.25, icon: "🌐",  title: "Three-Tier Architecture",      color: COLORS.frontend,  items: ["Clear separation of concerns", "Flexible tech stack", "Version dependencies grow complex"] });
  addSummaryCard(slide, pres, { x: 5.2, y: 3.1,  w: 4.5, h: 2.25, icon: "⚖️",  title: "Scale Out Readiness", color: COLORS.infra,    items: ["Requires Load Balancer", "App must be stateless", "Ready? → Part 2"] });

  // Bottom CTA arrow
  slide.addText("→ Part 2: The Challenges of Scale Out", {
    x: 0, y: 5.28, w: 10, h: 0.2,
    fontSize: 11, color: COLORS.accent, fontFace: FONTS.body, bold: true, align: "center",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.defineLayout({ name: "WIDESCREEN", width: 10, height: 5.5 });
  pres.layout = "WIDESCREEN";   // 10" × 5.5"

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
