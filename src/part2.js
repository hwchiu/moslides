// src/part2.js
// Part 2: 分散式架構演進 (Slides 13–20)

"use strict";

const fs      = require("fs");
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
// Slide 13 — Load Balancer
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide13(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Load Balancer：流量分發的核心元件",
    partLabel: "PART 2  ·  13 / 50",
    accentColor: COLORS.infra,
    complexity: 5,
  });

  // 3 Client mini nodes (stacked left)
  const clientYs = [0.85, 1.4, 1.95];
  clientYs.forEach((cy) => {
    addMiniNode(slide, pres, {
      x: 0.2, y: cy,
      emoji: "👤", label: "Client",
      borderColor: COLORS.client,
    });
  });

  // Arrows from clients to LB
  clientYs.forEach((cy) => {
    addHArrow(slide, pres, { x: 1.4, y: cy + 0.04, w: 0.22, color: COLORS.client });
  });

  // Load Balancer card
  addNodeCard(slide, pres, {
    x: 1.7, y: 1.1, w: 1.5, h: 1.5,
    emoji: "⚖️", name: "Load Balancer",
    meta: "Round Robin\nLeast Conn",
    borderColor: COLORS.infra,
  });

  // Algorithm tag badges below LB
  const algos = ["Round Robin", "Least Conn", "IP Hash", "Weighted"];
  algos.forEach((algo, i) => {
    const bw = 1.0;
    const bx = 0.15 + i * (bw + 0.08);
    slide.addShape(pres.ShapeType.roundRect, {
      x: bx, y: 2.72, w: bw, h: 0.22, rectRadius: 0.05,
      fill: { color: COLORS.bg3 },
      line: { color: COLORS.infra, width: 0.75 },
    });
    slide.addText(algo, {
      x: bx, y: 2.72, w: bw, h: 0.22,
      fontSize: 7.5, bold: true, color: COLORS.infra,
      fontFace: FONTS.body, align: "center", valign: "middle",
    });
  });

  // Backend zone border
  addZoneBorder(slide, pres, {
    x: 3.5, y: 0.6, w: 2.0, h: 2.82,
    color: COLORS.backend, label: "REPLICA GROUP",
  });

  // 3 backend server nodes inside zone
  const serverYs = [0.72, 1.5, 2.28];
  serverYs.forEach((sy, idx) => {
    addNodeCard(slide, pres, {
      x: 3.65, y: sy, w: 1.6, h: 0.72,
      emoji: "⚙️", name: `api-0${idx + 1}`,
      meta: ":8080",
      borderColor: COLORS.backend,
    });
  });

  // Arrows LB → servers
  serverYs.forEach((sy) => {
    addHArrow(slide, pres, { x: 3.25, y: sy + 0.17, w: 0.35, color: COLORS.infra });
  });

  // Database card
  addNodeCard(slide, pres, {
    x: 6.1, y: 1.3, w: 1.7, h: 1.1,
    emoji: "🗄️", name: "Database",
    meta: "Postgres Primary",
    borderColor: COLORS.database,
  });

  // Arrows servers → DB
  serverYs.forEach((sy) => {
    addHArrow(slide, pres, { x: 5.3, y: sy + 0.17, w: 0.75, color: COLORS.database });
  });

  // Bottom panel
  addBottomPanel(slide, pres,
    [
      { title: "流量均勻分散",   sub: "避免單一節點過載" },
      { title: "高可用性 (HA)",  sub: "一台掛掉，LB 自動排除，服務不中斷" },
    ],
    [
      { title: "Session 黏性問題",  sub: "同一使用者可能被派到不同 Server" },
      { title: "LB 本身也需要 HA", sub: "LB 掛掉 → 整個服務掛" },
    ],
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 14 — Session 狀態問題
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide14(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Scale Out 的陷阱：Session 狀態問題",
    partLabel: "PART 2  ·  14 / 50",
    accentColor: COLORS.danger,
  });

  // ── Left column ─────────────────────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "❌  Session 黏性問題",
    type: "bad",
  });

  // Client node
  addMiniNode(slide, pres, {
    x: 0.35, y: 1.15, w: 1.1,
    emoji: "👤", label: "Client",
    borderColor: COLORS.client,
  });

  // LB node
  addMiniNode(slide, pres, {
    x: 1.6, y: 1.15, w: 1.0,
    emoji: "⚖️", label: "LB",
    borderColor: COLORS.infra,
  });

  addHArrow(slide, pres, { x: 1.5, y: 1.3, w: 0.05, color: COLORS.textMuted });

  // Server A (has session)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.75, y: 1.05, w: 1.5, h: 0.52, rectRadius: 0.07,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.backend, width: 1.0 },
  });
  slide.addText("⚙️  Server A  💾", {
    x: 2.75, y: 1.05, w: 1.5, h: 0.52,
    fontSize: 9.5, bold: true, color: COLORS.text,
    fontFace: FONTS.body, align: "center", valign: "middle",
  });

  addHArrow(slide, pres, { x: 2.65, y: 1.22, w: 0.05, color: COLORS.textMuted });

  // Server B (no session)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.75, y: 1.9, w: 1.5, h: 0.52, rectRadius: 0.07,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.backend, width: 1.0 },
  });
  slide.addText("⚙️  Server B", {
    x: 2.75, y: 1.9, w: 1.5, h: 0.52,
    fontSize: 9.5, bold: true, color: COLORS.text,
    fontFace: FONTS.body, align: "center", valign: "middle",
  });

  addHArrow(slide, pres, { x: 2.65, y: 2.07, w: 0.05, color: COLORS.textMuted });

  slide.addText("Request #2 → Server B → 找不到 Session → 被登出！", {
    x: 0.35, y: 2.75, w: 4.3, h: 0.32,
    fontSize: 10, bold: true, color: COLORS.danger,
    fontFace: FONTS.body,
  });

  // ── Vertical divider ─────────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.55, w: 0.01, h: 4.9,
    line: { color: COLORS.border, width: 0.5 },
  });

  // ── Right column ─────────────────────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 5.2, y: 0.62, w: 4.4,
    label: "✅  三種解決方案",
    type: "good",
  });

  const solutions = [
    {
      y: 1.1,
      title: "① JWT Token（無狀態）",
      sub: "Token存Client，Server無狀態 | 推薦 REST API",
      color: COLORS.success,
    },
    {
      y: 2.15,
      title: "② Redis 集中 Session",
      sub: "Session集中存Redis，所有Server共用",
      color: COLORS.infra,
    },
    {
      y: 3.2,
      title: "③ Sticky Session（不推薦⚠️）",
      sub: "LB固定綁定IP | 失去Scale Out彈性",
      color: COLORS.warning,
    },
  ];

  solutions.forEach((s) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.2, y: s.y, w: 4.4, h: 0.95, rectRadius: 0.1,
      fill: { color: COLORS.bg2 },
      line: { color: s.color, width: 1.2 },
    });
    slide.addText(s.title, {
      x: 5.35, y: s.y + 0.1, w: 4.1, h: 0.32,
      fontSize: 12, bold: true, color: s.color,
      fontFace: FONTS.body,
    });
    slide.addText(s.sub, {
      x: 5.35, y: s.y + 0.44, w: 4.1, h: 0.42,
      fontSize: 9.5, color: COLORS.textMuted,
      fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "現代架構首選 JWT + Redis 的組合 — 讓 Server 真正 Stateless",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 15 — Read Replica 架構
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide15(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "資料庫的擴展：Read Replica 架構",
    partLabel: "PART 2  ·  15 / 50",
    accentColor: COLORS.database,
    complexity: 7,
  });

  // App servers zone
  addZoneBorder(slide, pres, {
    x: 0.3, y: 0.75, w: 2.2, h: 2.5,
    color: COLORS.backend, label: "APP SERVERS",
  });

  const appYs = [1.0, 1.55, 2.1];
  const appLabels = ["api-01", "api-02", "api-03"];
  appYs.forEach((ay, i) => {
    addMiniNode(slide, pres, {
      x: 0.45, y: ay, w: 1.7,
      emoji: "⚙️", label: appLabels[i],
      borderColor: COLORS.backend,
    });
  });

  // Write/Read arrows from app zone to primary
  addHArrow(slide, pres, { x: 2.55, y: 1.19, w: 0.78, label: "WRITE", color: COLORS.danger });
  addHArrow(slide, pres, { x: 2.55, y: 1.99, w: 0.78, label: "READ",  color: COLORS.success });

  // Primary DB
  addNodeCard(slide, pres, {
    x: 3.4, y: 0.8, w: 1.8, h: 1.5,
    emoji: "🗄️", name: "Primary",
    meta: "Write Only\nPostgres",
    borderColor: COLORS.danger,
  });

  // Replication arrow text
  slide.addText("async →", {
    x: 5.25, y: 1.45, w: 0.8, h: 0.22,
    fontSize: 9, color: COLORS.textMuted,
    fontFace: FONTS.code, italic: true,
  });

  addHArrow(slide, pres, { x: 5.25, y: 1.55, w: 0.25, color: COLORS.textMuted });

  // Read Replicas zone
  addZoneBorder(slide, pres, {
    x: 5.55, y: 0.65, w: 2.1, h: 2.65,
    color: COLORS.success, label: "READ REPLICAS",
  });

  const replicaYs = [0.95, 1.55, 2.15];
  const replicaLabels = ["Replica 1", "Replica 2", "Replica 3"];
  replicaYs.forEach((ry, i) => {
    addMiniNode(slide, pres, {
      x: 5.7, y: ry, w: 1.7,
      emoji: "🗄️", label: replicaLabels[i],
      borderColor: COLORS.database,
    });
  });

  // Read arrows from primary to replicas
  replicaYs.forEach((ry) => {
    addHArrow(slide, pres, { x: 5.25, y: ry + 0.1, w: 0.4, color: COLORS.success });
  });

  // Replication lag note
  slide.addText("非同步複製 (async) — 可能有微小延遲 (Replication Lag)", {
    x: 0.3, y: 3.2, w: 7.5, h: 0.25,
    fontSize: 9, color: COLORS.textMuted,
    fontFace: FONTS.body, italic: true,
  });

  // Bottom panel
  addBottomPanel(slide, pres,
    [
      { title: "讀取效能大幅提升",  sub: "90% 操作是 Read，Replica 分流" },
      { title: "Primary 專注寫入", sub: "Write 效能不受 Read 影響" },
    ],
    [
      { title: "Replication Lag",    sub: "Replica 資料可能落後 Primary 數毫秒" },
      { title: "不解決 Write 瓶頸", sub: "高頻寫入仍然是 Primary 的問題" },
    ],
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 16 — 三層 Caching 策略
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide16(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "三層 Caching 策略：從外到內",
    partLabel: "PART 2  ·  16 / 50",
    accentColor: COLORS.accent,
  });

  addThreeCols(slide, pres, [
    {
      title: "① CDN",
      icon: "☁️",
      color: COLORS.cdn,
      items: [
        { text: "靜態資源 (JS/CSS/圖片)", sub: "TTL: 天/週" },
        { text: "工具: Cloudflare, CloudFront" },
        { text: "Cache Hit → 不碰後端" },
        { text: "Hit Rate: ~60-80%" },
      ],
    },
    {
      title: "② Redis 快取",
      icon: "⚡",
      color: COLORS.infra,
      items: [
        { text: "API 回應快取", sub: "TTL: 秒/分鐘" },
        { text: "Session 儲存" },
        { text: "工具: Redis, Memcached" },
        { text: "Hit Rate: ~30-50%" },
      ],
    },
    {
      title: "③ In-Process 快取",
      icon: "🧠",
      color: COLORS.warning,
      items: [
        { text: "超熱資料 (config/常數)", sub: "TTL: 秒級" },
        { text: "不可跨 Server 共用" },
        { text: "Scale Out 需特別處理" },
        { text: "Hit Rate: ~10-20%" },
      ],
    },
  ], { y: HEADER_H + 0.08, h: H - HEADER_H - 0.55 });

  addTipBar(slide, pres, {
    y: 5.0,
    text: "快取失效 (Cache Invalidation) 是分散式系統中最難的問題之一 — 想清楚 TTL 再設計",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 17 — 訊息佇列
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide17(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "訊息佇列：非同步解耦的利器",
    partLabel: "PART 2  ·  17 / 50",
    accentColor: COLORS.infra,
  });

  // ── Left: ❌ Synchronous chain ───────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "❌  同步呼叫鏈",
    type: "bad",
  });

  const syncNodes = [
    { x: 0.4,  emoji: "📦", label: "Order" },
    { x: 1.85, emoji: "📧", label: "Email" },
    { x: 3.3,  emoji: "📦", label: "Inventory" },
  ];
  syncNodes.forEach((n) => {
    addMiniNode(slide, pres, {
      x: n.x, y: 1.3, w: 0.95,
      emoji: n.emoji, label: n.label,
      borderColor: COLORS.backend,
    });
  });

  // Sync arrows between nodes
  [[1.4, 2.85]].forEach(() => {});
  addHArrow(slide, pres, { x: 1.4,  y: 1.43, w: 0.4, label: "sync", color: COLORS.textMuted });
  addHArrow(slide, pres, { x: 2.85, y: 1.43, w: 0.4, label: "sync", color: COLORS.textMuted });

  // Problem description box
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.1, w: 4.4, h: 0.52, rectRadius: 0.07,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 0.75 },
  });
  slide.addText("任一步驟慢 → 全部等待\n任一步驟失敗 → 整個 Request 失敗", {
    x: 0.5, y: 2.1, w: 4.1, h: 0.52,
    fontSize: 9.5, color: COLORS.danger,
    fontFace: FONTS.body, valign: "middle",
  });

  // Timing diagram: stacked bars showing cumulative latency
  slide.addText("⏱  總延遲 = 所有步驟之和", {
    x: 0.35, y: 2.72, w: 4.2, h: 0.22,
    fontSize: 9, bold: true, color: COLORS.danger,
    fontFace: FONTS.body,
  });
  const barWidths = [1.0, 1.2, 1.4];
  const barColors = [COLORS.backend, COLORS.warning, COLORS.danger];
  let barX = 0.35;
  barWidths.forEach((bw, i) => {
    slide.addShape(pres.ShapeType.rect, {
      x: barX, y: 3.0, w: bw, h: 0.22,
      fill: { color: barColors[i] },
      line: { color: COLORS.bg, width: 0.5 },
    });
    barX += bw;
  });

  // ── Right: ✅ MQ ─────────────────────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 5.2, y: 0.62, w: 4.4,
    label: "✅  訊息佇列（非同步）",
    type: "good",
  });

  // Producer card
  addNodeCard(slide, pres, {
    x: 5.3, y: 1.0, w: 1.4, h: 0.9,
    emoji: "📤", name: "Producer",
    meta: "Order Service",
    borderColor: COLORS.backend,
  });

  addHArrow(slide, pres, { x: 6.75, y: 1.3, w: 0.6, label: "publish", color: COLORS.infra });

  // Queue card
  addNodeCard(slide, pres, {
    x: 7.4, y: 1.0, w: 1.3, h: 0.9,
    emoji: "📋", name: "MQ",
    meta: "RabbitMQ/Kafka",
    borderColor: COLORS.infra,
  });

  // Consumers
  const consumers = [
    { y: 0.95, emoji: "📧", label: "Email",     color: COLORS.success },
    { y: 1.45, emoji: "📦", label: "Inventory", color: COLORS.success },
    { y: 1.95, emoji: "📊", label: "Analytics", color: COLORS.success },
  ];
  consumers.forEach((c) => {
    addHArrow(slide, pres, { x: 8.75, y: c.y + 0.12, w: 0.2, color: COLORS.infra });
    addMiniNode(slide, pres, {
      x: 9.0, y: c.y, w: 0.9,
      emoji: c.emoji, label: c.label,
      borderColor: c.color,
    });
  });

  // ── Use case cards (3 cols) ─────────────────────────────────────────────────
  const useCases = [
    { x: 0.3,  title: "📬 訂單→通知",   items: ["非同步寄信", "用戶無需等待"] },
    { x: 3.55, title: "🏔️ 削峰填谷",    items: ["瞬間大量請求", "Queue緩衝消化"] },
    { x: 6.8,  title: "🔓 服務解耦",    items: ["各服務獨立Scale", "互不影響"] },
  ];
  useCases.forEach((u) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: u.x, y: 2.85, w: 2.95, h: 0.8, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.infra, width: 1.0 },
    });
    slide.addText(u.title, {
      x: u.x + 0.1, y: 2.88, w: 2.75, h: 0.28,
      fontSize: 11, bold: true, color: COLORS.infra,
      fontFace: FONTS.body,
    });
    slide.addText(u.items.join("  ·  "), {
      x: u.x + 0.1, y: 3.17, w: 2.75, h: 0.4,
      fontSize: 9, color: COLORS.textMuted,
      fontFace: FONTS.body,
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 18 — 完整分散式架構全貌
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide18(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "完整分散式架構：你現在需要維運什麼？",
    partLabel: "PART 2  ·  18 / 50",
    accentColor: COLORS.danger,
    complexity: 9,
  });

  // ── Tier 0 — Internet ────────────────────────────────────────────────────────
  slide.addText("INTERNET", {
    x: 0.05, y: 0.78, w: 0.85, h: 0.22,
    fontSize: 7, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  addMiniNode(slide, pres, { x: 0.95, y: 0.68, w: 1.5, emoji: "👥", label: "Users (1000+)", borderColor: COLORS.client });
  addMiniNode(slide, pres, { x: 2.6,  y: 0.68, emoji: "☁️", label: "CDN",  borderColor: COLORS.cdn });
  addMiniNode(slide, pres, { x: 3.85, y: 0.68, emoji: "🛡️", label: "WAF",  borderColor: COLORS.warning });

  addVArrow(slide, pres, { x: 1.7, y: 1.08, h: 0.16, color: COLORS.border });

  // ── Tier 1 — LB ─────────────────────────────────────────────────────────────
  slide.addText("LOAD BALANCER", {
    x: 0.05, y: 1.34, w: 0.85, h: 0.22,
    fontSize: 7, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  addMiniNode(slide, pres, { x: 0.95, y: 1.24, w: 2.0, emoji: "⚖️", label: "LB (HA Pair)", borderColor: COLORS.infra });

  addVArrow(slide, pres, { x: 1.7, y: 1.63, h: 0.16, color: COLORS.border });

  // ── Tier 2 — Frontend ────────────────────────────────────────────────────────
  addZoneBorder(slide, pres, { x: 0.9, y: 1.69, w: 2.3, h: 0.58, color: COLORS.frontend, label: "FRONTEND ×3" });
  addMiniNode(slide, pres, { x: 1.0,  y: 1.79, emoji: "🌐", label: "nginx-01", borderColor: COLORS.frontend });
  addMiniNode(slide, pres, { x: 2.15, y: 1.79, emoji: "🌐", label: "nginx-02", borderColor: COLORS.frontend });

  addVArrow(slide, pres, { x: 1.7, y: 2.28, h: 0.16, color: COLORS.border });

  // ── Tier 3 — Backend + Infra ─────────────────────────────────────────────────
  addZoneBorder(slide, pres, { x: 0.9, y: 2.34, w: 2.3, h: 0.58, color: COLORS.backend, label: "BACKEND ×3" });
  addMiniNode(slide, pres, { x: 1.0,  y: 2.44, emoji: "⚙️", label: "api-01",   borderColor: COLORS.backend });
  addMiniNode(slide, pres, { x: 2.15, y: 2.44, emoji: "⚙️", label: "api-02",   borderColor: COLORS.backend });
  addMiniNode(slide, pres, { x: 3.4,  y: 2.44, emoji: "⚡", label: "Redis",    borderColor: COLORS.infra });
  addMiniNode(slide, pres, { x: 4.7,  y: 2.44, emoji: "📋", label: "RabbitMQ", borderColor: COLORS.infra });

  addVArrow(slide, pres, { x: 1.7, y: 2.93, h: 0.16, color: COLORS.border });

  // ── Tier 4 — Database ────────────────────────────────────────────────────────
  addMiniNode(slide, pres, { x: 0.95, y: 3.09, w: 1.4,  emoji: "🗄️", label: "Primary (W)", borderColor: COLORS.danger });
  slide.addText("→ replication →", {
    x: 2.45, y: 3.22, w: 1.0, h: 0.22,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.code,
  });
  addMiniNode(slide, pres, { x: 3.35, y: 3.09, emoji: "🗄️", label: "Replica 1", borderColor: COLORS.database });
  addMiniNode(slide, pres, { x: 4.65, y: 3.09, emoji: "🗄️", label: "Replica 2", borderColor: COLORS.database });
  addMiniNode(slide, pres, { x: 5.95, y: 3.09, emoji: "🗄️", label: "Replica 3", borderColor: COLORS.database });

  // ── Right side summary ───────────────────────────────────────────────────────
  slide.addText("你在維運的機器", {
    x: 6.7, y: 0.7, w: 3.0, h: 0.36,
    fontSize: 13, bold: true, color: COLORS.warning,
    fontFace: FONTS.title,
  });

  const countCards = [
    { y: 1.1,  label: "CDN/WAF/LB ×3",        count: "3",  color: COLORS.warning  },
    { y: 1.62, label: "Frontend+Backend ×6",   count: "6",  color: COLORS.frontend },
    { y: 2.14, label: "DB Primary+Replicas ×4", count: "4", color: COLORS.database },
    { y: 2.66, label: "Redis+RabbitMQ ×2",      count: "2", color: COLORS.infra    },
  ];
  countCards.forEach((c) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: c.y, w: 2.8, h: 0.45, rectRadius: 0.07,
      fill: { color: COLORS.bg2 },
      line: { color: c.color, width: 0.75 },
    });
    slide.addText(c.label, {
      x: 6.95, y: c.y, w: 2.1, h: 0.45,
      fontSize: 9.5, color: COLORS.text,
      fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(c.count, {
      x: 9.1, y: c.y, w: 0.4, h: 0.45,
      fontSize: 18, bold: true, color: c.color,
      fontFace: FONTS.title, align: "center", valign: "middle",
    });
  });

  // Total card
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.7, y: 3.22, w: 2.8, h: 0.7, rectRadius: 0.1,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.5 },
  });
  slide.addText("15+ 台機器", {
    x: 6.7, y: 3.22, w: 2.8, h: 0.7,
    fontSize: 20, bold: true, color: COLORS.danger,
    fontFace: FONTS.title, align: "center", valign: "middle",
  });

  // Alert bar
  addAlertBar(slide, pres, {
    y: 3.72,
    message: "每台機器設定各不相同、環境飄移 — 部署靠手動 SSH，每次都是一場冒險",
    tags: ["環境不一致", "設定漂移", "更新困難"],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 19 — 維運複雜度爆炸
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide19(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "部署惡夢：維運複雜度爆炸",
    partLabel: "PART 2  ·  19 / 50",
    accentColor: COLORS.danger,
  });

  const cards = [
    {
      x: 0.3, y: 0.65,
      emoji: "😱",
      title: "環境不一致",
      items: [
        "• Dev: Mac + Python 3.9",
        "• Staging: Ubuntu + Python 3.8",
        "• Prod: CentOS + Python 3.6 (!!)",
        "• 「在我這裡可以跑！」",
      ],
    },
    {
      x: 5.2, y: 0.65,
      emoji: "🔄",
      title: "更新困難",
      items: [
        "• 15台機器逐一SSH更新",
        "• 更新中失敗 → 版本不一致",
        "• 需要停機維護窗口",
        "• 每次部署都提心吊膽",
      ],
    },
    {
      x: 0.3, y: 3.05,
      emoji: "📋",
      title: "設定管理混亂",
      items: [
        "• DB密碼寫死在程式碼",
        "• 各機器設定微妙不同",
        "• 沒有版本控管",
        "• 新人入職需一週搞懂",
      ],
    },
    {
      x: 5.2, y: 3.05,
      emoji: "🤯",
      title: "Dev/Prod 落差",
      items: [
        "• Dev本機 vs 15台Prod",
        "• 本機測試通過 → Prod爆炸",
        "• 「It works on my machine」",
        "• 除錯難度 ×10",
      ],
    },
  ];

  cards.forEach((card) => {
    // Card background
    slide.addShape(pres.ShapeType.roundRect, {
      x: card.x, y: card.y, w: 4.5, h: 2.25, rectRadius: 0.1,
      fill: { color: COLORS.cardDanger },
      line: { color: COLORS.danger, width: 1.2 },
      shadow: { type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.4 },
    });

    // Emoji
    slide.addText(card.emoji, {
      x: card.x + 0.15, y: card.y + 0.12, w: 0.5, h: 0.5,
      fontSize: 24, align: "center", valign: "middle",
    });

    // Title
    slide.addText(card.title, {
      x: card.x + 0.7, y: card.y + 0.12, w: 3.6, h: 0.42,
      fontSize: 14, bold: true, color: COLORS.danger,
      fontFace: FONTS.body, valign: "middle",
    });

    // Items
    card.items.forEach((item, i) => {
      slide.addText(item, {
        x: card.x + 0.2, y: card.y + 0.65 + i * 0.38, w: 4.1, h: 0.35,
        fontSize: 10.5, color: COLORS.text,
        fontFace: FONTS.body,
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 20 — Part 2 小結
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide20(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Part 2 小結：問題累積，需要新思維",
    partLabel: "PART 2  ·  20 / 50",
    accentColor: COLORS.infra,
  });

  // ── Summary table ─────────────────────────────────────────────────────────────

  // Header row
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.38, rectRadius: 0.05,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 0.5 },
  });
  slide.addText("技術",      { x: 0.5,  y: 0.65, w: 2.5, h: 0.38, fontSize: 10, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle" });
  slide.addText("解決了什麼", { x: 3.1,  y: 0.65, w: 3.0, h: 0.38, fontSize: 10, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle" });
  slide.addText("帶來的代價", { x: 6.3,  y: 0.65, w: 3.3, h: 0.38, fontSize: 10, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle" });

  const rows = [
    { tech: "⚖️ Load Balancer",  solved: "流量分散、高可用",  cost: "Session 黏性問題",      danger: false },
    { tech: "💾 Redis Session",  solved: "Stateless 實現",   cost: "Redis 本身要 HA",       danger: false },
    { tech: "🗄️ Read Replica",   solved: "讀取效能提升",     cost: "Replication Lag",       danger: false },
    { tech: "⚡ Cache",           solved: "效能大幅提升",     cost: "快取失效複雜",           danger: false },
    { tech: "📋 Message Queue",  solved: "非同步解耦",       cost: "最終一致性問題",         danger: false },
    { tech: "🏗️ 分散式架構",     solved: "高可用、可擴展",   cost: "維運 15+ 台機器！",       danger: true  },
  ];

  rows.forEach((row, i) => {
    const ry   = 1.05 + i * 0.38;
    const fill = i % 2 === 0 ? COLORS.bg2 : COLORS.bg;
    const borderColor = row.danger ? COLORS.danger : COLORS.border;
    const borderWidth = row.danger ? 1.0 : 0.3;

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: ry, w: 9.4, h: 0.36, rectRadius: 0.04,
      fill: { color: fill },
      line: { color: borderColor, width: borderWidth },
    });
    slide.addText(row.tech, {
      x: 0.5, y: ry, w: 2.5, h: 0.36,
      fontSize: 10, bold: true, color: COLORS.text,
      fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(row.solved, {
      x: 3.1, y: ry, w: 3.0, h: 0.36,
      fontSize: 10, color: COLORS.success,
      fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(row.cost, {
      x: 6.3, y: ry, w: 3.2, h: 0.36,
      fontSize: 10, color: row.danger ? COLORS.danger : COLORS.warning,
      fontFace: FONTS.body, valign: "middle",
    });
  });

  // Complexity count badge
  slide.addShape(pres.ShapeType.roundRect, {
    x: 7.5, y: 0.68, w: 2.1, h: 0.3, rectRadius: 0.06,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 0.75 },
  });
  slide.addText("複雜度 10/10 🔴", {
    x: 7.5, y: 0.68, w: 2.1, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.danger,
    fontFace: FONTS.body, align: "center", valign: "middle",
  });

  // Problem card
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.5, w: 9.4, h: 0.8, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.2 },
  });
  slide.addText(
    "🔥  這樣下去不行了！15 台機器各自獨立設定 — 部署一次靠手動 SSH，版本飄移是常態",
    {
      x: 0.5, y: 3.5, w: 9.0, h: 0.8,
      fontSize: 12, bold: true, color: COLORS.danger,
      fontFace: FONTS.body, valign: "middle",
    },
  );

  // Teaser card
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.42, w: 9.4, h: 0.82, rectRadius: 0.08,
    fill: { color: COLORS.cardSuccess },
    line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText(
    "💡  Part 3 預告：Container 技術如何把這一切簡化 — 統一打包、環境一致、秒級部署",
    {
      x: 0.5, y: 4.42, w: 9.0, h: 0.82,
      fontSize: 12, bold: true, color: COLORS.success,
      fontFace: FONTS.body, valign: "middle",
    },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync("output", { recursive: true });

  const pres    = new pptxgen();
  pres.defineLayout({ name: "WIDESCREEN", width: 10, height: 5.5 });
  pres.layout = "WIDESCREEN";

  buildSlide13(pres);
  buildSlide14(pres);
  buildSlide15(pres);
  buildSlide16(pres);
  buildSlide17(pres);
  buildSlide18(pres);
  buildSlide19(pres);
  buildSlide20(pres);

  await pres.writeFile({ fileName: "output/part2.pptx" });
  console.log("✅ output/part2.pptx created");
}

main().catch(console.error);
