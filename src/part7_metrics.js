// src/part7_metrics.js
// Part 7: Metrics Observability (Slides 91–105)

"use strict";

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const { COLORS, FONTS } = require("./design-system");
const {
  W, H, HEADER_H, BOTTOM_Y,
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
// Slide 91 — 可觀測性 vs 監控
// ─────────────────────────────────────────────────────────────────────────────
function slide91(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "可觀測性 vs 監控：不只是看圖表",
    partLabel: "PART 7 METRICS  · 91 / 150",
    accentColor: COLORS.accent,
  });

  // Divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.58, w: 0, h: 3.62,
    line: { color: COLORS.border, width: 0.5 },
  });

  // Left: Monitoring
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "📊 傳統監控 (Monitoring)",
    type: "bad",
  });

  const monitoringItems = [
    { title: "你事先知道要看什麼", sub: "預設 Dashboard" },
    { title: "只知道 What 壞了", sub: "CPU高、回應慢" },
    { title: "無法回答未知問題", sub: "遇到新型故障束手無策" },
    { title: "靜態告警閾值", sub: "CPU>80% 就告警" },
  ];
  monitoringItems.forEach((item, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: 1.1 + i * 0.52, w: 4.4, h: 0.45, rectRadius: 0.06,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.textMuted, width: 0.8 },
    });
    slide.addText(item.title, {
      x: 0.5, y: 1.1 + i * 0.52 + 0.03, w: 4.0, h: 0.2,
      fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(item.sub, {
      x: 0.5, y: 1.1 + i * 0.52 + 0.23, w: 4.0, h: 0.18,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  // Right: Observability
  addCompareHeading(slide, pres, {
    x: 5.2, y: 0.62, w: 4.4,
    label: "🔍 可觀測性 (Observability)",
    type: "good",
  });

  const obsItems = [
    { title: "能從外部推導系統內部狀態" },
    { title: "知道 What/Why/Where", sub: "三本柱" },
    { title: "可回答任意問題", sub: "即使是第一次發生的問題" },
    { title: "動態、可查詢", sub: "不需要預設 Dashboard" },
  ];
  obsItems.forEach((item, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.2, y: 1.1 + i * 0.52, w: 4.4, h: 0.45, rectRadius: 0.06,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.success, width: 0.8 },
    });
    slide.addText(item.title, {
      x: 5.4, y: 1.1 + i * 0.52 + 0.03, w: 4.0, h: 0.2,
      fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    if (item.sub) {
      slide.addText(item.sub, {
        x: 5.4, y: 1.1 + i * 0.52 + 0.23, w: 4.0, h: 0.18,
        fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
      });
    }
  });

  // Bottom quote
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.72, w: 9.4, h: 0.65, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.accent, width: 1.0 },
  });
  slide.addText("Monitoring tells you WHEN things break. Observability tells you WHY.", {
    x: 0.4, y: 3.72, w: 9.2, h: 0.65,
    fontSize: 14, bold: true, italic: true, color: COLORS.accent,
    fontFace: FONTS.body, align: "center", valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.5,
    text: "可觀測性的三本柱：Metrics（什麼出問題）+ Logs（為什麼）+ Traces（在哪個服務）— 缺一不可",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 92 — 三本柱總覽
// ─────────────────────────────────────────────────────────────────────────────
function slide92(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "三本柱總覽：Metrics、Logs、Traces 各自解決什麼",
    partLabel: "PART 7 METRICS  · 92 / 150",
    accentColor: COLORS.accent,
  });

  addThreeCols(slide, pres, [
    {
      title: "📊 Metrics",
      icon: "📈",
      color: COLORS.success,
      items: [
        { text: "數值型時序資料" },
        { text: "What is happening now?" },
        { text: "CPU%, Req/s, 錯誤率, P99延遲" },
        { text: "適合：告警、容量規劃" },
        { text: "保留：月到年（低成本）" },
        { text: "工具：Prometheus, Grafana" },
      ],
    },
    {
      title: "📋 Logs",
      icon: "📝",
      color: COLORS.warning,
      items: [
        { text: "文字事件流" },
        { text: "Why did it happen?" },
        { text: "請求詳細記錄、錯誤堆疊" },
        { text: "適合：除錯、審計" },
        { text: "保留：天到月（高成本）" },
        { text: "工具：ELK, Loki, Fluentd" },
      ],
    },
    {
      title: "🔍 Traces",
      icon: "🔗",
      color: COLORS.infra,
      items: [
        { text: "分散式請求鏈路" },
        { text: "Where is it slow?" },
        { text: "哪個服務、哪個函式、耗時多少" },
        { text: "適合：效能分析、依賴追蹤" },
        { text: "保留：天到週（最高成本）" },
        { text: "工具：Jaeger, Tempo, Zipkin" },
      ],
    },
  ], { y: HEADER_H + 0.12, h: H - HEADER_H - 0.6 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "從成本角度：Metrics 最便宜（數字），Logs 中等（文字），Traces 最貴（每個 Span 都要儲存）",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 93 — 為什麼分散式需要可觀測性
// ─────────────────────────────────────────────────────────────────────────────
function slide93(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "單體 vs 分散式：為什麼可觀測性變得關鍵",
    partLabel: "PART 7 METRICS  · 93 / 150",
    accentColor: COLORS.danger,
  });

  // Divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.58, w: 0, h: 4.3,
    line: { color: COLORS.border, width: 0.5 },
  });

  // Left: Monolith
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.2,
    label: "🖥️ 單體服務：簡單偵錯",
    type: "good",
  });

  addNodeCard(slide, pres, {
    x: 1.2, y: 1.1, w: 2.2, h: 1.0,
    emoji: "⚙️", name: "Monolith App", meta: "一個 Process",
    borderColor: COLORS.backend,
  });

  const debugCards = [
    { text: "tail -f app.log" },
    { text: "print() / console.log()" },
    { text: "gdb / pdb 本地除錯" },
  ];
  debugCards.forEach((card, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: 2.25 + i * 0.47, w: 4.2, h: 0.4, rectRadius: 0.06,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.success, width: 0.8 },
    });
    slide.addText(card.text, {
      x: 0.5, y: 2.25 + i * 0.47, w: 3.8, h: 0.4,
      fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.code, valign: "middle",
    });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.68, w: 4.2, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.cardSuccess },
    line: { color: COLORS.success, width: 0.8 },
  });
  slide.addText("✅ 問題出在這個 process，直接找就好", {
    x: 0.45, y: 3.68, w: 3.9, h: 0.38,
    fontSize: 10, bold: true, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
  });

  // Right: Distributed
  addCompareHeading(slide, pres, {
    x: 5.1, y: 0.62, w: 4.4,
    label: "🕸️ 分散式：除錯地獄",
    type: "bad",
  });

  // 3x3 mini service grid
  const miniServices = [
    { x: 5.2,  label: "nginx",          color: COLORS.frontend },
    { x: 6.6,  label: "api-gw",         color: COLORS.accent },
    { x: 8.0,  label: "auth-svc",       color: COLORS.infra },
    { x: 5.2,  label: "order-svc",      color: COLORS.backend },
    { x: 6.6,  label: "payment-svc",    color: COLORS.warning },
    { x: 8.0,  label: "inventory-svc",  color: COLORS.container },
    { x: 5.2,  label: "email-svc",      color: COLORS.textMuted },
    { x: 6.6,  label: "db",             color: COLORS.database },
    { x: 8.0,  label: "redis",          color: COLORS.danger },
  ];
  miniServices.forEach((svc, i) => {
    const row = Math.floor(i / 3);
    addMiniNode(slide, pres, {
      x: svc.x, y: 1.0 + row * 0.6, w: 1.3,
      emoji: "⚙️", label: svc.label, borderColor: svc.color,
    });
  });

  addAlertBar(slide, pres, {
    y: 3.18,
    message: "User說結帳很慢！是哪個服務？哪個函式？沒有 Tracing 只能每個服務慢慢查 log...",
    tags: ["15分鐘找問題", "有時找不到"],
  });

  addTipBar(slide, pres, {
    y: 4.75,
    text: "分散式系統中一個請求可能觸碰 10+ 個服務 — 沒有 Traces，你根本不知道慢在哪",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 94 — Metrics 是什麼？解決什麼問題
// ─────────────────────────────────────────────────────────────────────────────
function slide94(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Metrics：數字告訴你系統的健康狀態",
    partLabel: "PART 7 METRICS  · 94 / 150",
    accentColor: COLORS.success,
    complexity: 3,
  });

  // Left: explanation
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 4.7, h: 0.88, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.success, width: 1.0 },
  });
  slide.addText("Metrics = 時間序列數字資料", {
    x: 0.4, y: 0.68, w: 4.5, h: 0.3,
    fontSize: 14, bold: true, color: COLORS.success,
    fontFace: FONTS.body, align: "center",
  });
  slide.addText("(timestamp, metric_name, labels, value)", {
    x: 0.4, y: 0.98, w: 4.5, h: 0.22,
    fontSize: 10, color: COLORS.textMuted,
    fontFace: FONTS.code, align: "center",
  });

  slide.addText("Production 服務在跑，但你怎麼知道它健康嗎？", {
    x: 0.3, y: 1.62, w: 4.7, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });

  const metricExamples = [
    "📈 http_requests_total: 15,847 req (counter)",
    "⚡ api_response_p99_ms: 245ms (gauge)",
    "❌ http_error_rate: 0.03% (gauge)",
    "💾 process_memory_bytes: 512MB (gauge)",
  ];
  metricExamples.forEach((ex, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.4, y: 2.0 + i * 0.48, w: 4.3, h: 0.42, rectRadius: 0.06,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.border, width: 0.75 },
    });
    slide.addText(ex, {
      x: 0.55, y: 2.0 + i * 0.48, w: 4.0, h: 0.42,
      fontSize: 10, color: COLORS.text, fontFace: FONTS.code, valign: "middle",
    });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.97, w: 4.7, h: 0.62, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("❌ 沒有 Metrics 就像開車沒有儀表板 — 不知道速度、油量、引擎狀態", {
    x: 0.45, y: 3.97, w: 4.45, h: 0.62,
    fontSize: 10, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  // Right: time series visualization mockup
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.5, y: 0.75, w: 4.2, h: 2.85, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addText("http_requests_total (rate/s)", {
    x: 5.6, y: 0.82, w: 4.0, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.code,
  });

  // Chart segments — baseline then spike
  const chartSegs = [
    { x: 5.65, y: 2.9, w: 0.45, col: COLORS.success },
    { x: 6.12, y: 2.7, w: 0.45, col: COLORS.success },
    { x: 6.59, y: 2.5, w: 0.45, col: COLORS.success },
    { x: 7.06, y: 2.0, w: 0.45, col: COLORS.warning },
    { x: 7.53, y: 1.4, w: 0.45, col: COLORS.danger },
    { x: 8.0,  y: 2.2, w: 0.45, col: COLORS.warning },
    { x: 8.47, y: 2.65, w: 0.45, col: COLORS.success },
    { x: 8.94, y: 2.88, w: 0.28, col: COLORS.success },
  ];
  chartSegs.forEach(seg => {
    slide.addShape(pres.ShapeType.rect, {
      x: seg.x, y: seg.y, w: seg.w, h: 3.38 - seg.y,
      fill: { color: seg.col, transparency: 40 },
      line: { color: seg.col, width: 0 },
    });
  });
  slide.addText("time →", {
    x: 5.6, y: 3.42, w: 4.0, h: 0.18,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "right",
  });
  slide.addText("req/s", {
    x: 5.5, y: 1.0, w: 0.5, h: 0.2,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // 3 property cards
  const propCards = [
    { x: 5.4,  icon: "⏱️", label: "時序", sub: "按時間排列\n可計算趨勢",   border: COLORS.accent },
    { x: 6.88, icon: "🏷️", label: "標籤", sub: "service, env\nversion, region", border: COLORS.accent },
    { x: 8.36, icon: "💡", label: "高效", sub: "數字 = 小\n保存成本低",   border: COLORS.success },
  ];
  propCards.forEach(card => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: card.x, y: 3.78, w: 1.32, h: 0.82, rectRadius: 0.07,
      fill: { color: COLORS.bg2 },
      line: { color: card.border, width: 0.8 },
    });
    slide.addText(`${card.icon} ${card.label}`, {
      x: card.x + 0.06, y: 3.8, w: 1.2, h: 0.25,
      fontSize: 10, bold: true, color: card.border, fontFace: FONTS.body, align: "center",
    });
    slide.addText(card.sub, {
      x: card.x + 0.06, y: 4.05, w: 1.2, h: 0.52,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
  });

  addTipBar(slide, pres, {
    y: 4.92,
    text: "Metrics 不是 Logs — Metrics 只存數字，成本極低，適合長期保留（1年以上都沒問題）",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 95 — Metrics 資料類型
// ─────────────────────────────────────────────────────────────────────────────
function slide95(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "四種 Metric 資料類型：Counter、Gauge、Histogram、Summary",
    partLabel: "PART 7 METRICS  · 95 / 150",
    accentColor: COLORS.success,
  });

  // Card 1: Counter (top-left)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 4.5, h: 2.2, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("① Counter — 只增不減", {
    x: 0.5, y: 0.72, w: 4.1, h: 0.28,
    fontSize: 12, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("適用：請求總數、錯誤總數、位元組數", {
    x: 0.5, y: 1.0, w: 4.1, h: 0.22,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.45, y: 1.24, w: 4.0, h: 0.32, rectRadius: 0.05,
    fill: { color: "0D1117" }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addText("http_requests_total{method='GET',status='200'}", {
    x: 0.55, y: 1.24, w: 3.8, h: 0.32,
    fontSize: 8.5, color: COLORS.text, fontFace: FONTS.code, valign: "middle",
  });
  slide.addText("⚠️ Counter 本身無意義，用 rate() 換算每秒速率", {
    x: 0.5, y: 1.62, w: 4.0, h: 0.25,
    fontSize: 9, color: COLORS.warning, fontFace: FONTS.body,
  });
  // Staircase visual
  const steps = [[0.55, 2.52], [0.9, 2.35], [1.25, 2.18], [1.6, 2.02], [1.95, 1.88]];
  steps.forEach((s, i) => {
    if (i < steps.length - 1) {
      slide.addShape(pres.ShapeType.line, {
        x: s[0], y: s[1], w: 0.35, h: 0,
        line: { color: COLORS.success, width: 1.5 },
      });
      slide.addShape(pres.ShapeType.line, {
        x: s[0] + 0.35, y: s[1], w: 0, h: steps[i + 1][1] - s[1],
        line: { color: COLORS.success, width: 1.5 },
      });
    }
  });

  // Card 2: Gauge (top-right)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 0.65, w: 4.5, h: 2.2, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.accent, width: 1.2 },
  });
  slide.addText("② Gauge — 可升可降", {
    x: 5.4, y: 0.72, w: 4.1, h: 0.28,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });
  slide.addText("適用：當前連線數、記憶體用量、Queue深度", {
    x: 5.4, y: 1.0, w: 4.1, h: 0.22,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.35, y: 1.24, w: 4.0, h: 0.32, rectRadius: 0.05,
    fill: { color: "0D1117" }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addText("process_resident_memory_bytes", {
    x: 5.45, y: 1.24, w: 3.8, h: 0.32,
    fontSize: 8.5, color: COLORS.text, fontFace: FONTS.code, valign: "middle",
  });
  slide.addText("直接使用數值，不需要 rate()", {
    x: 5.4, y: 1.62, w: 4.0, h: 0.25,
    fontSize: 9, color: COLORS.success, fontFace: FONTS.body,
  });
  // Wavy line
  const wavePoints = [[5.4, 2.38], [5.65, 2.22], [5.9, 2.48], [6.15, 2.18], [6.4, 2.42], [6.65, 2.25], [6.9, 2.52]];
  wavePoints.forEach((pt, i) => {
    if (i < wavePoints.length - 1) {
      slide.addShape(pres.ShapeType.line, {
        x: pt[0], y: pt[1], w: wavePoints[i + 1][0] - pt[0], h: wavePoints[i + 1][1] - pt[1],
        line: { color: COLORS.accent, width: 1.5 },
      });
    }
  });

  // Card 3: Histogram (bottom-left)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.02, w: 4.5, h: 2.2, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.warning, width: 1.2 },
  });
  slide.addText("③ Histogram — 分桶分布", {
    x: 0.5, y: 3.08, w: 4.1, h: 0.28,
    fontSize: 12, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });
  slide.addText("適用：請求延遲、回應大小的分布", {
    x: 0.5, y: 3.36, w: 4.1, h: 0.22,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addText("桶 (Bucket): _le=0.1, _le=0.5, _le=1.0, _le=+Inf", {
    x: 0.5, y: 3.6, w: 4.1, h: 0.22,
    fontSize: 9, color: COLORS.text, fontFace: FONTS.code,
  });
  slide.addText("用 histogram_quantile(0.99, ...) 計算 P99", {
    x: 0.5, y: 3.82, w: 4.1, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addText("Server 端計算分位數，最靈活", {
    x: 0.5, y: 4.08, w: 4.1, h: 0.22,
    fontSize: 9, color: COLORS.success, fontFace: FONTS.body,
  });

  // Card 4: Summary (bottom-right)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 3.02, w: 4.5, h: 2.2, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.2 },
  });
  slide.addText("④ Summary — 客戶端分位數", {
    x: 5.4, y: 3.08, w: 4.1, h: 0.28,
    fontSize: 12, bold: true, color: COLORS.infra, fontFace: FONTS.body,
  });
  slide.addText("適用：需要精確分位數，資料量小", {
    x: 5.4, y: 3.36, w: 4.1, h: 0.22,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addText("直接輸出 P50、P90、P99 分位數", {
    x: 5.4, y: 3.6, w: 4.1, h: 0.22,
    fontSize: 9, color: COLORS.text, fontFace: FONTS.body,
  });
  slide.addText("⚠️ 無法跨 instance 聚合", {
    x: 5.4, y: 3.82, w: 4.1, h: 0.22,
    fontSize: 9, color: COLORS.danger, fontFace: FONTS.body,
  });
  slide.addText("多數情況用 Histogram，Summary 漸少用", {
    x: 5.4, y: 4.08, w: 4.1, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 96 — Push vs Pull 架構比較
// ─────────────────────────────────────────────────────────────────────────────
function slide96(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Push vs Pull：收集模式的根本差異",
    partLabel: "PART 7 METRICS  · 96 / 150",
    accentColor: COLORS.accent,
  });

  // Vertical divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.58, w: 0, h: 4.85,
    line: { color: COLORS.border, width: 0.5 },
  });

  // ── LEFT: Pull Mode ───────────────────────────────────────────────────────
  slide.addText("⬇️ Pull Mode", {
    x: 0.4, y: 0.68, w: 4.2, h: 0.32,
    fontSize: 14, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  // 3 service nodes
  const pullServices = [
    { x: 0.4,  label: "Service A\n:8080/metrics" },
    { x: 1.55, label: "Service B\n:8080/metrics" },
    { x: 2.7,  label: "Service C\n:8080/metrics" },
  ];
  pullServices.forEach(svc => {
    addMiniNode(slide, pres, {
      x: svc.x, y: 1.0, w: 1.1,
      emoji: "⚙️", label: svc.label, borderColor: COLORS.backend,
    });
  });

  // Arrows from services to Prometheus (going down)
  [0.95, 2.1, 3.25].forEach(ax => {
    addVArrow(slide, pres, { x: ax, y: 1.55, h: 0.38, color: COLORS.success });
  });

  addNodeCard(slide, pres, {
    x: 0.5, y: 1.95, w: 2.8, h: 0.88,
    emoji: "📊", name: "Prometheus", meta: "每 15 秒主動 scrape",
    borderColor: COLORS.accent,
  });

  const pullCards = [
    { text: "✅ Collector控制抓取時機", border: COLORS.success, fill: COLORS.bg2 },
    { text: "✅ 服務掛了立刻發現 (scrape失敗)", border: COLORS.success, fill: COLORS.bg2 },
    { text: "⚠️ 服務必須暴露 HTTP /metrics", border: COLORS.warning, fill: COLORS.bg2 },
    { text: "⚠️ 短暫 Batch Job 會錯過", border: COLORS.warning, fill: COLORS.bg2 },
  ];
  pullCards.forEach((card, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.4, y: 2.98 + i * 0.48, w: 4.0, h: 0.42, rectRadius: 0.06,
      fill: { color: card.fill }, line: { color: card.border, width: 0.8 },
    });
    slide.addText(card.text, {
      x: 0.55, y: 2.98 + i * 0.48, w: 3.7, h: 0.42,
      fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  // ── RIGHT: Push Mode ──────────────────────────────────────────────────────
  slide.addText("⬆️ Push Mode", {
    x: 5.3, y: 0.68, w: 4.2, h: 0.32,
    fontSize: 14, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });

  const pushServices = [
    { x: 5.3,  label: "Service A" },
    { x: 6.35, label: "Service B" },
    { x: 7.4,  label: "Service C" },
  ];
  pushServices.forEach(svc => {
    addMiniNode(slide, pres, {
      x: svc.x, y: 1.0, w: 1.1,
      emoji: "⚙️", label: svc.label, borderColor: COLORS.backend,
    });
  });

  // Arrows from services down to collector
  [5.85, 6.9, 7.95].forEach(ax => {
    addVArrow(slide, pres, { x: ax, y: 1.55, h: 0.42, color: COLORS.warning });
  });

  addNodeCard(slide, pres, {
    x: 6.1, y: 2.0, w: 2.3, h: 0.88,
    emoji: "🎯", name: "Collector",
    meta: "StatsD / CloudWatch\n/ OTLP Receiver",
    borderColor: COLORS.warning,
  });

  const pushCards = [
    { text: "✅ 適合短暫 Batch/Cron Job", border: COLORS.success },
    { text: "✅ 可穿越 NAT、Firewall",      border: COLORS.success },
    { text: "⚠️ Collector成為流量接收端",   border: COLORS.warning },
    { text: "⚠️ 服務掛了難以偵測",          border: COLORS.warning },
  ];
  pushCards.forEach((card, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.3, y: 2.98 + i * 0.48, w: 4.0, h: 0.42, rectRadius: 0.06,
      fill: { color: COLORS.bg2 }, line: { color: card.border, width: 0.8 },
    });
    slide.addText(card.text, {
      x: 5.45, y: 2.98 + i * 0.48, w: 3.7, h: 0.42,
      fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 5.1,
    text: "Kubernetes 環境首選 Pull (Prometheus) — 因為 K8s 的服務發現讓 Prometheus 自動找到所有 Pod",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 97 — Pull Mode 實戰：Prometheus 架構
// ─────────────────────────────────────────────────────────────────────────────
function slide97(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Prometheus 架構深度解析：Pull Mode 實作",
    partLabel: "PART 7 METRICS  · 97 / 150",
    accentColor: COLORS.success,
  });

  // Architecture diagram
  addNodeCard(slide, pres, {
    x: 0.2, y: 0.78, w: 1.7, h: 1.5,
    emoji: "⚙️", name: "App Service", meta: ":8080\n/metrics",
    borderColor: COLORS.backend,
  });
  slide.addText("GET /metrics\nhttp_req_total 1024\nhttp_duration_sum 5.2", {
    x: 0.2, y: 2.32, w: 1.7, h: 0.45,
    fontSize: 7.5, color: COLORS.textMuted, fontFace: FONTS.code,
  });

  addHArrow(slide, pres, { x: 2.0, y: 1.45, label: "scrape\nevery 15s", color: COLORS.success, w: 0.8 });

  addNodeCard(slide, pres, {
    x: 2.9, y: 0.78, w: 2.2, h: 1.5,
    emoji: "📊", name: "Prometheus\nServer", meta: "TSDB\n+ Evaluator",
    borderColor: COLORS.success,
  });

  addHArrow(slide, pres, { x: 5.2, y: 1.45, label: "query\nPromQL", color: COLORS.accent, w: 0.7 });

  addNodeCard(slide, pres, {
    x: 6.0, y: 0.78, w: 1.5, h: 0.7,
    emoji: "📈", name: "Grafana", meta: "Dashboard",
    borderColor: COLORS.accent,
  });

  addVArrow(slide, pres, { x: 3.95, y: 2.35, h: 0.45, color: COLORS.danger });

  addNodeCard(slide, pres, {
    x: 2.9, y: 2.85, w: 2.2, h: 0.75,
    emoji: "🔔", name: "AlertManager", meta: "Slack/PagerDuty",
    borderColor: COLORS.danger,
  });

  addHArrow(slide, pres, { x: 5.2, y: 3.18, label: "notify", color: COLORS.danger, w: 0.7 });

  addNodeCard(slide, pres, {
    x: 6.0, y: 2.85, w: 1.5, h: 0.75,
    emoji: "📱", name: "On-Call", meta: "PagerDuty",
    borderColor: COLORS.warning,
  });

  addCodeCard(slide, pres, {
    x: 0.3, y: 3.62, w: 9.4, h: 1.7,
    language: "prometheus.yml",
    code: `global:\n  scrape_interval: 15s\n  evaluation_interval: 15s\n\nscrape_configs:\n  - job_name: 'api-service'\n    static_configs:\n      - targets: ['api-01:8080', 'api-02:8080']\n\n  - job_name: 'kubernetes-pods'  # K8s 自動服務發現\n    kubernetes_sd_configs:\n      - role: pod\n    relabel_configs:\n      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]\n        action: keep\n        regex: true`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 98 — K8s 環境的 Prometheus 服務發現
// ─────────────────────────────────────────────────────────────────────────────
function slide98(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Kubernetes + Prometheus：自動服務發現",
    partLabel: "PART 7 METRICS  · 98 / 150",
    accentColor: COLORS.container,
  });

  // Left: K8s cluster diagram
  addZoneBorder(slide, pres, {
    x: 0.3, y: 0.65, w: 5.0, h: 4.5,
    color: COLORS.container, label: "Kubernetes Cluster",
  });

  addNodeCard(slide, pres, {
    x: 0.55, y: 1.0, w: 2.0, h: 1.05,
    emoji: "⚙️", name: "api-pod-1",
    meta: "annotation:\nprometheus.io/scrape: true\nprometheus.io/port: 8080",
    borderColor: COLORS.backend,
  });
  addNodeCard(slide, pres, {
    x: 2.75, y: 1.0, w: 2.0, h: 1.05,
    emoji: "⚙️", name: "api-pod-2",
    meta: "same annotation",
    borderColor: COLORS.backend,
  });
  addNodeCard(slide, pres, {
    x: 0.55, y: 2.22, w: 2.0, h: 1.05,
    emoji: "📊", name: "Prometheus\n(Deployment)",
    meta: "watches K8s API",
    borderColor: COLORS.success,
  });
  addMiniNode(slide, pres, {
    x: 2.85, y: 2.45, w: 1.85,
    emoji: "⚙️", label: "K8s API\nServer", borderColor: COLORS.accent,
  });

  // Arrows: Prometheus → K8s API
  addHArrow(slide, pres, { x: 2.6, y: 2.72, label: "list pods", color: COLORS.accent, w: 0.22 });
  // Prometheus → pods (scrape)
  addVArrow(slide, pres, { x: 1.55, y: 2.22, h: -0.62, color: COLORS.success });

  // Right: benefits
  slide.addText("自動發現的好處", {
    x: 5.8, y: 0.72, w: 3.85, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });

  const benefits = [
    { text: "🔄 新 Pod 啟動 → 自動加入監控", bold: true, color: COLORS.success },
    { text: "🗑️ Pod 刪除 → 自動移除，不留殘餘" },
    { text: "📈 Scale Out ×10 → Prometheus 自動找到全部" },
    { text: "0️⃣ 不需要人工修改 prometheus.yml" },
  ];
  benefits.forEach((b, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.75, y: 1.1 + i * 0.62, w: 3.85, h: 0.55, rectRadius: 0.07,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.success, width: 0.8 },
    });
    slide.addText(b.text, {
      x: 5.9, y: 1.1 + i * 0.62, w: 3.55, h: 0.55,
      fontSize: 10, bold: !!b.bold, color: b.color || COLORS.text,
      fontFace: FONTS.body, valign: "middle",
    });
  });

  addCodeCard(slide, pres, {
    x: 5.75, y: 3.3, w: 3.85, h: 1.85,
    language: "pod annotation",
    code: `# 在 Pod spec 加上 annotation\nmetadata:\n  annotations:\n    prometheus.io/scrape: 'true'\n    prometheus.io/path: '/metrics'\n    prometheus.io/port: '8080'\n\n# Prometheus 自動偵測所有帶\n# 這個 annotation 的 Pod`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 99 — Push Mode 實戰：StatsD 與 Pushgateway
// ─────────────────────────────────────────────────────────────────────────────
function slide99(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Push Mode 實戰：StatsD、Pushgateway、OTLP Collector",
    partLabel: "PART 7 METRICS  · 99 / 150",
    accentColor: COLORS.warning,
  });

  addThreeCols(slide, pres, [
    {
      title: "StatsD (UDP Push)",
      icon: "📡",
      color: COLORS.warning,
      items: [
        { text: "UDP fire-and-forget", sub: "不阻塞 application" },
        { text: "Client library 極簡單" },
        { text: "statsd.increment('orders.created')" },
        { text: "適合：高頻計數器" },
        { text: "DogStatsD 支援 Tags" },
        { text: "Backend: Graphite / Prometheus" },
      ],
    },
    {
      title: "Pushgateway",
      icon: "🔄",
      color: COLORS.accent,
      items: [
        { text: "Prometheus 官方中繼站" },
        { text: "用途：Batch Job / Cron Job" },
        { text: "Job 完成 → push → Prometheus scrape" },
        { text: "注意：不適合長期服務" },
        { text: "注意：不自動 TTL 清除" },
        { text: "K8s Job 完成 metrics 保存" },
      ],
    },
    {
      title: "OTLP Collector",
      icon: "🏗️",
      color: COLORS.container,
      items: [
        { text: "OpenTelemetry 統一 Pipeline" },
        { text: "同時接收 Metrics/Logs/Traces" },
        { text: "多個 Receiver：OTLP, Prometheus" },
        { text: "多個 Exporter：Prometheus, Jaeger" },
        { text: "Sidecar 或 DaemonSet 部署" },
        { text: "未來標準，推薦採用" },
      ],
    },
  ], { y: HEADER_H + 0.1, h: H - HEADER_H - 0.62 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "StatsD UDP 是最輕量的 push — 即使 collector 掛了也不影響 app，適合不能 block 的關鍵路徑",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 100 — PromQL 查詢語言實戰
// ─────────────────────────────────────────────────────────────────────────────
function slide100(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "PromQL：Prometheus 查詢語言實戰",
    partLabel: "PART 7 METRICS  · 100 / 150",
    accentColor: COLORS.accent,
  });

  addCodeCard(slide, pres, {
    x: 0.3, y: 0.65, w: 9.4, h: 4.62,
    language: "PromQL Examples",
    code: `# 1. Counter Rate — 每秒 HTTP 請求數\nrate(http_requests_total[5m])\n\n# 2. 按 status 碼分組的錯誤率\nsum by(status) (rate(http_requests_total[5m]))\n\n# 3. P99 延遲 — 最常用的 SLO 指標\nhistogram_quantile(0.99,\n  rate(http_request_duration_seconds_bucket[5m])\n)\n\n# 4. 錯誤率 (5xx / total)\nsum(rate(http_requests_total{status=~'5..'}[5m]))\n  / sum(rate(http_requests_total[5m])) * 100\n\n# 5. Recording Rule — 預計算複雜查詢（放 prometheus.yml）\nrecord: job:http_error_rate:ratio5m\nexpr: |\n  sum(rate(http_requests_total{status=~'5..'}[5m]))\n  / sum(rate(http_requests_total[5m]))\n\n# 6. 跨 K8s Pod 聚合\nsum by(namespace, deployment) (\n  rate(http_requests_total[5m])\n)`,
  });

  addTipBar(slide, pres, {
    y: 5.38,
    text: "Recording Rules 是效能關鍵 — 把複雜 PromQL 預計算儲存，Grafana 查詢快 10 倍",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 101 — USE / RED / 四個黃金信號
// ─────────────────────────────────────────────────────────────────────────────
function slide101(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "監控方法論：USE、RED、四個黃金信號",
    partLabel: "PART 7 METRICS  · 101 / 150",
    accentColor: COLORS.success,
  });

  const cols = [
    {
      x: 0.3, border: COLORS.database, heading: "🔧 USE Method",
      sub: "適用：基礎設施資源",
      cards: [
        { label: "U — Utilization", detail: "資源使用率\nCPU: 75%, Disk: 60%" },
        { label: "S — Saturation",  detail: "資源飽和度\nLoad Average, Queue深度" },
        { label: "E — Errors",      detail: "錯誤率\nDisk IO errors, NIC drops" },
      ],
      footer: "問：這個資源過載了嗎？",
    },
    {
      x: 3.45, border: COLORS.backend, heading: "🌐 RED Method",
      sub: "適用：微服務 API",
      cards: [
        { label: "R — Rate",     detail: "每秒請求數\nHTTP req/s, RPC/s" },
        { label: "E — Errors",   detail: "錯誤率\n5xx%, failed RPC %" },
        { label: "D — Duration", detail: "延遲分布\nP50/P95/P99 latency" },
      ],
      footer: "問：這個服務表現如何？",
    },
    {
      x: 6.6, border: COLORS.accent, heading: "⭐ 四個黃金信號",
      sub: "Google SRE Book — 對用戶最重要",
      cards: [
        { label: "Latency",    detail: "好請求 vs 壞請求的延遲" },
        { label: "Traffic",    detail: "系統需求量 req/s" },
        { label: "Errors",     detail: "失敗請求的比率" },
        { label: "Saturation", detail: "系統飽和度 (最受限的資源)" },
      ],
      footer: "問：用戶的體驗如何？",
    },
  ];

  cols.forEach(col => {
    const colW = col.x === 6.6 ? 3.0 : 2.95;
    slide.addShape(pres.ShapeType.roundRect, {
      x: col.x, y: 0.65, w: colW, h: 4.62, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: col.border, width: 1.2 },
    });
    slide.addText(col.heading, {
      x: col.x + 0.1, y: 0.72, w: colW - 0.2, h: 0.28,
      fontSize: 12, bold: true, color: col.border, fontFace: FONTS.body, align: "center",
    });
    slide.addText(col.sub, {
      x: col.x + 0.1, y: 1.0, w: colW - 0.2, h: 0.2,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });

    col.cards.forEach((card, i) => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: col.x + 0.12, y: 1.24 + i * 0.78, w: colW - 0.24, h: 0.7, rectRadius: 0.07,
        fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.5 },
      });
      slide.addText(card.label, {
        x: col.x + 0.2, y: 1.26 + i * 0.78, w: colW - 0.4, h: 0.22,
        fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body,
      });
      slide.addText(card.detail, {
        x: col.x + 0.2, y: 1.48 + i * 0.78, w: colW - 0.4, h: 0.42,
        fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
      });
    });

    slide.addText(col.footer, {
      x: col.x + 0.1, y: 4.62, w: colW - 0.2, h: 0.3,
      fontSize: 9, italic: true, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
  });

  addTipBar(slide, pres, {
    y: 5.38,
    text: "新服務先從 RED 方法開始 — Rate + Errors + Duration 三個 Metric 能告訴你 80% 的問題",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 102 — Grafana Dashboard 設計原則
// ─────────────────────────────────────────────────────────────────────────────
function slide102(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Grafana Dashboard 設計：讓數據說話",
    partLabel: "PART 7 METRICS  · 102 / 150",
    accentColor: COLORS.accent,
  });

  // Left: design principles
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.3,
    label: "Dashboard 設計原則",
    type: "good",
  });

  const principles = [
    { text: "🎯 一個 Dashboard = 一個服務/系統", border: COLORS.success },
    { text: "📊 頂部：RED/四黃金信號 (用戶影響)",  border: COLORS.success },
    { text: "📉 中部：資源使用 (USE Method)",       border: COLORS.accent },
    { text: "🔗 底部：下游依賴狀態",                border: COLORS.accent },
    { text: "🏷️ 使用 Variables：env, datacenter, pod", border: COLORS.warning },
  ];
  principles.forEach((p, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.4, y: 1.1 + i * 0.52, w: 4.0, h: 0.45, rectRadius: 0.07,
      fill: { color: COLORS.bg2 }, line: { color: p.border, width: 0.8 },
    });
    slide.addText(p.text, {
      x: 0.55, y: 1.1 + i * 0.52, w: 3.7, h: 0.45,
      fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.72, w: 4.3, h: 0.58, rectRadius: 0.07,
    fill: { color: COLORS.cardDanger }, line: { color: COLORS.danger, width: 0.8 },
  });
  slide.addText("❌ 把所有 Metric 塞進一個 Dashboard\n❌ 沒有時間範圍選擇器", {
    x: 0.45, y: 3.72, w: 4.0, h: 0.58,
    fontSize: 9.5, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  // Right: dashboard wireframe
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.15, y: 0.75, w: 4.55, h: 0.38, rectRadius: 0.05,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.accent, width: 0.8 },
  });
  slide.addText("Service: api | ENV: prod | Last: 6h", {
    x: 5.2, y: 0.75, w: 4.45, h: 0.38,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center", valign: "middle",
  });

  // Row 1: stat panels
  const statPanels = [
    { x: 5.15, fill: COLORS.cardSuccess, border: COLORS.success,  val: "1,234 req/s", lbl: "Traffic",     valColor: COLORS.success },
    { x: 6.68, fill: COLORS.bg2,         border: COLORS.danger,   val: "0.12%",       lbl: "Error Rate",  valColor: COLORS.danger },
    { x: 8.21, fill: COLORS.bg2,         border: COLORS.warning,  val: "245ms",       lbl: "P99 Latency", valColor: COLORS.warning },
  ];
  statPanels.forEach(p => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: p.x, y: 1.18, w: 1.4, h: 0.62, rectRadius: 0.07,
      fill: { color: p.fill }, line: { color: p.border, width: 0.8 },
    });
    slide.addText(p.val, {
      x: p.x + 0.05, y: 1.2, w: 1.3, h: 0.32,
      fontSize: 14, bold: true, color: p.valColor, fontFace: FONTS.body, align: "center",
    });
    slide.addText(p.lbl, {
      x: p.x + 0.05, y: 1.52, w: 1.3, h: 0.25,
      fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
  });

  // Row 2: time series
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.15, y: 1.92, w: 4.55, h: 1.15, rectRadius: 0.07,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.8 },
  });
  slide.addText("HTTP Request Rate over time", {
    x: 5.25, y: 2.0, w: 4.35, h: 0.25,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Row 3: resource panels
  [
    { x: 5.15, label: "CPU Usage %" },
    { x: 7.48, label: "Memory Usage" },
  ].forEach(p => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: p.x, y: 3.15, w: 2.2, h: 0.98, rectRadius: 0.07,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.8 },
    });
    slide.addText(p.label, {
      x: p.x + 0.1, y: 3.22, w: 2.0, h: 0.25,
      fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  // Row 4: dependencies
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.15, y: 4.2, w: 4.55, h: 0.78, rectRadius: 0.07,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.8 },
  });
  slide.addText("DB Latency | Redis Hit Rate | MQ Queue Depth", {
    x: 5.25, y: 4.28, w: 4.35, h: 0.25,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 103 — 告警設計哲學
// ─────────────────────────────────────────────────────────────────────────────
function slide103(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "告警設計：避免告警疲勞的藝術",
    partLabel: "PART 7 METRICS  · 103 / 150",
    accentColor: COLORS.danger,
  });

  // Left: symptom vs cause
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "❌ Cause-based 告警（不推薦）",
    type: "bad",
  });

  const badAlerts = [
    { title: "CPU > 80%",       sub: "CPU高不一定影響用戶" },
    { title: "Memory > 70%",    sub: "可能只是 cache，正常" },
    { title: "Disk IOPS > 1000", sub: "業務繁忙期的正常現象" },
  ];
  badAlerts.forEach((a, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: 1.1 + i * 0.45, w: 4.4, h: 0.4, rectRadius: 0.07,
      fill: { color: COLORS.cardDanger }, line: { color: COLORS.danger, width: 0.8 },
    });
    slide.addText(a.title, {
      x: 0.45, y: 1.1 + i * 0.45 + 0.02, w: 4.0, h: 0.2,
      fontSize: 10.5, bold: true, color: COLORS.danger, fontFace: FONTS.body,
    });
    slide.addText(a.sub, {
      x: 0.45, y: 1.1 + i * 0.45 + 0.22, w: 4.0, h: 0.16,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addCompareHeading(slide, pres, {
    x: 0.3, y: 2.9, w: 4.4,
    label: "✅ Symptom-based 告警（推薦）",
    type: "good",
  });

  const goodAlerts = [
    { title: "錯誤率 > 1% 持續 2 分鐘",  sub: "用戶正在受影響" },
    { title: "P99 延遲 > 2000ms",         sub: "用戶感受到服務變慢" },
    { title: "SLO burn rate 過快",         sub: "Error Budget 快耗盡" },
  ];
  goodAlerts.forEach((a, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: 3.35 + i * 0.45, w: 4.4, h: 0.4, rectRadius: 0.07,
      fill: { color: COLORS.cardSuccess }, line: { color: COLORS.success, width: 0.8 },
    });
    slide.addText(a.title, {
      x: 0.45, y: 3.35 + i * 0.45 + 0.02, w: 4.0, h: 0.2,
      fontSize: 10.5, bold: true, color: COLORS.success, fontFace: FONTS.body,
    });
    slide.addText(a.sub, {
      x: 0.45, y: 3.35 + i * 0.45 + 0.22, w: 4.0, h: 0.16,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  // Right: severity tiers
  slide.addText("告警嚴重度分級", {
    x: 5.2, y: 0.65, w: 4.4, h: 0.3,
    fontSize: 13, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  const tiers = [
    {
      fill: COLORS.cardDanger, border: COLORS.danger,
      title: "🚨 P1 CRITICAL — 立即叫醒 On-Call",
      detail: "現在有用戶受影響 | 5分鐘內必須回應 | 打電話+PagerDuty",
      titleColor: COLORS.danger,
    },
    {
      fill: COLORS.cardWarn, border: COLORS.warning,
      title: "⚠️ P2 WARNING — 工作時間處理",
      detail: "可能影響用戶 | 今天內處理 | Slack 通知即可",
      titleColor: COLORS.warning,
    },
    {
      fill: COLORS.bg2, border: COLORS.accent,
      title: "💡 P3 INFO — 排程處理",
      detail: "潛在問題 | 本週處理 | Ticket 追蹤",
      titleColor: COLORS.accent,
    },
  ];
  tiers.forEach((t, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.2, y: 1.0 + i * 0.72, w: 4.4, h: 0.65, rectRadius: 0.08,
      fill: { color: t.fill }, line: { color: t.border, width: 0.8 },
    });
    slide.addText(t.title, {
      x: 5.35, y: 1.02 + i * 0.72, w: 4.1, h: 0.25,
      fontSize: 10.5, bold: true, color: t.titleColor, fontFace: FONTS.body,
    });
    slide.addText(t.detail, {
      x: 5.35, y: 1.27 + i * 0.72, w: 4.1, h: 0.35,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 3.72, w: 4.4, h: 0.85, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.success, width: 0.8 },
  });
  slide.addText("📌 每個告警必須：", {
    x: 5.35, y: 3.76, w: 4.1, h: 0.25,
    fontSize: 10.5, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("1. 有 Runbook 連結  2. 明確的負責人  3. 明確的回應 SLA", {
    x: 5.35, y: 4.0, w: 4.1, h: 0.52,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  addTipBar(slide, pres, {
    y: 4.78,
    text: "告警疲勞是 SRE 最大敵人 — 每週 review 告警，把沒人 action 的告警關掉或降級",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 104 — AlertManager 路由與通知
// ─────────────────────────────────────────────────────────────────────────────
function slide104(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "AlertManager：智慧路由與告警管理",
    partLabel: "PART 7 METRICS  · 104 / 150",
    accentColor: COLORS.danger,
  });

  // Left: flow diagram
  addNodeCard(slide, pres, {
    x: 0.3, y: 0.78, w: 1.5, h: 0.85,
    emoji: "📊", name: "Prometheus", meta: "發送告警",
    borderColor: COLORS.success,
  });

  addHArrow(slide, pres, { x: 1.85, y: 1.08, label: "alert", color: COLORS.danger, w: 0.5 });

  addNodeCard(slide, pres, {
    x: 2.45, y: 0.78, w: 1.8, h: 0.85,
    emoji: "🔀", name: "AlertManager", meta: "路由引擎",
    borderColor: COLORS.danger,
  });

  addVArrow(slide, pres, { x: 3.3, y: 1.7, h: 0.45, color: COLORS.danger });

  // 3 receiver branches
  addMiniNode(slide, pres, {
    x: 1.2, y: 2.22, w: 1.5,
    emoji: "💬", label: "Slack\n#oncall", borderColor: COLORS.accent,
  });
  addMiniNode(slide, pres, {
    x: 3.05, y: 2.22, w: 1.5,
    emoji: "📟", label: "PagerDuty\n(P1 only)", borderColor: COLORS.danger,
  });
  addMiniNode(slide, pres, {
    x: 4.9, y: 2.22, w: 1.5,
    emoji: "📧", label: "Email\n(P3 only)", borderColor: COLORS.textMuted,
  });

  // Arrows from AlertManager to receivers
  slide.addShape(pres.ShapeType.line, {
    x: 3.3, y: 2.17, w: -0.65, h: 0.35,
    line: { color: COLORS.danger, width: 1.0, endArrowType: "arrow" },
  });
  slide.addShape(pres.ShapeType.line, {
    x: 3.35, y: 2.17, w: 0.5, h: 0.35,
    line: { color: COLORS.danger, width: 1.0, endArrowType: "arrow" },
  });

  addCodeCard(slide, pres, {
    x: 0.3, y: 3.1, w: 4.8, h: 2.28,
    language: "alertmanager.yml",
    code: `route:\n  receiver: 'slack-default'\n  group_wait: 30s\n  group_interval: 5m\n  repeat_interval: 4h\n  routes:\n    - match:\n        severity: critical\n      receiver: 'pagerduty'\n    - match:\n        severity: warning\n      receiver: 'slack-warning'\n\nreceivers:\n  - name: 'pagerduty'\n    pagerduty_configs:\n      - service_key: '<key>'`,
  });

  // Right: advanced features
  slide.addText("進階功能", {
    x: 5.5, y: 0.75, w: 4.1, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  const features = [
    { border: COLORS.infra,    icon: "🔕", title: "Inhibition (抑制)", detail: "DB 掛了 → 抑制 API 告警，避免重複通知" },
    { border: COLORS.warning,  icon: "🔇", title: "Silence (靜音)",    detail: "維護窗口期間靜音特定告警" },
    { border: COLORS.success,  icon: "📦", title: "Grouping (分組)",   detail: "同一服務的多個告警合併通知" },
    { border: COLORS.accent,   icon: "🔁", title: "Repeat Interval",  detail: "不要每分鐘重複，設定 4h 重複" },
  ];
  features.forEach((f, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.4, y: 1.05 + i * 0.72, w: 4.2, h: 0.65, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: f.border, width: 0.8 },
    });
    slide.addText(`${f.icon} ${f.title}`, {
      x: 5.55, y: 1.08 + i * 0.72, w: 3.9, h: 0.25,
      fontSize: 10.5, bold: true, color: f.border, fontFace: FONTS.body,
    });
    slide.addText(f.detail, {
      x: 5.55, y: 1.33 + i * 0.72, w: 3.9, h: 0.35,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "Inhibition 規則可以大幅減少告警噪音 — datacenter 掛了就不用個別通知每個服務",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 105 — Metrics 章節小結
// ─────────────────────────────────────────────────────────────────────────────
function slide105(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Metrics 小結：從收集到告警的完整鏈路",
    partLabel: "PART 7 METRICS  · 105 / 150",
    accentColor: COLORS.success,
  });

  // Full journey timeline
  addNodeCard(slide, pres, {
    x: 0.2, y: 0.72, w: 1.65, h: 1.4,
    emoji: "⚙️", name: "Instrument", meta: "Prometheus client\n定義 Metrics",
    borderColor: COLORS.backend,
  });
  addHArrow(slide, pres, { x: 1.9, y: 1.35, label: "expose", color: COLORS.success, w: 0.5 });

  addNodeCard(slide, pres, {
    x: 2.5, y: 0.72, w: 1.65, h: 1.4,
    emoji: "📊", name: "Collect", meta: "Prometheus\nscrape /metrics",
    borderColor: COLORS.success,
  });
  addHArrow(slide, pres, { x: 4.2, y: 1.35, label: "query", color: COLORS.accent, w: 0.5 });

  addNodeCard(slide, pres, {
    x: 4.8, y: 0.72, w: 1.65, h: 1.4,
    emoji: "📈", name: "Visualize", meta: "Grafana\nDashboard",
    borderColor: COLORS.accent,
  });
  addHArrow(slide, pres, { x: 6.5, y: 1.35, label: "alert", color: COLORS.danger, w: 0.5 });

  addNodeCard(slide, pres, {
    x: 7.1, y: 0.72, w: 1.45, h: 1.4,
    emoji: "🔔", name: "Alert", meta: "AlertManager\nRoute Rules",
    borderColor: COLORS.danger,
  });
  addHArrow(slide, pres, { x: 8.6, y: 1.35, label: "notify", color: COLORS.warning, w: 0.5 });

  addNodeCard(slide, pres, {
    x: 9.2, y: 0.72, w: 0.7, h: 1.4,
    emoji: "📱", name: "Act", meta: "On-Call",
    borderColor: COLORS.warning,
  });

  // 3 takeaway cards
  const cards = [
    {
      x: 0.3, border: COLORS.success,
      title: "🎯 選對 Metric 類型",
      body: "Counter → rate()\nGauge → 直接用\nHistogram → P99\n不要用 average latency!",
    },
    {
      x: 3.45, border: COLORS.accent,
      title: "📐 Pull > Push in K8s",
      body: "Prometheus + K8s SD\n自動發現所有 Pod\n短暫 Job 用 Pushgateway\n統一 → OTLP Collector",
    },
    {
      x: 6.6, border: COLORS.warning,
      title: "⚠️ 告警要有意義",
      body: "Symptom-based 優先\n每個告警要有 Runbook\n控制告警數量\n避免告警疲勞",
    },
  ];
  cards.forEach(card => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: card.x, y: 2.38, w: 2.9, h: 2.62, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: card.border, width: 1.2 },
    });
    slide.addText(card.title, {
      x: card.x + 0.12, y: 2.48, w: 2.66, h: 0.32,
      fontSize: 11, bold: true, color: card.border, fontFace: FONTS.body, align: "center",
    });
    slide.addText(card.body, {
      x: card.x + 0.12, y: 2.88, w: 2.66, h: 1.98,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, valign: "top",
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync("output", { recursive: true });
  const pres = new pptxgen();
  pres.defineLayout({ name: "WIDESCREEN", width: 10, height: 5.5 });
  pres.layout = "WIDESCREEN";

  for (const fn of [
    slide91, slide92, slide93, slide94, slide95,
    slide96, slide97, slide98, slide99, slide100,
    slide101, slide102, slide103, slide104, slide105,
  ]) {
    await fn(pres);
  }

  await pres.writeFile({ fileName: "output/part7_metrics.pptx" });
  console.log("part7_metrics.pptx created");
}

main().catch(console.error);
