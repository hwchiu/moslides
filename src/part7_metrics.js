// src/part7_metrics.js
// Part 7: Metrics Observability (Slides 91–105)

"use strict";

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const { COLORS, FONTS, setTheme } = require("./design-system");
setTheme("light");
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
    title: "Observability vs Monitoring: Beyond Just Charts",
    partLabel: "PART 7",
    accentColor: COLORS.accent,
  });

  // Divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.58, w: 0.01, h: 3.62,
    line: { color: COLORS.border, width: 0.5 },
  });

  // Left: Monitoring
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "📊 Traditional Monitoring",
    type: "bad",
  });

  const monitoringItems = [
    { title: "You know what to look for in advance", sub: "Pre-built Dashboards" },
    { title: "Only knows WHAT is broken", sub: "High CPU, slow responses" },
    { title: "Cannot answer unknown questions", sub: "Helpless against novel failures" },
    { title: "Static alert thresholds", sub: "Alert when CPU > 80%" },
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
    label: "🔍 Observability",
    type: "good",
  });

  const obsItems = [
    { title: "Infer internal system state from external outputs" },
    { title: "Knows What / Why / Where", sub: "Three Pillars" },
    { title: "Can answer any question", sub: "Even first-time incidents" },
    { title: "Dynamic and queryable", sub: "No pre-built dashboards needed" },
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
    text: "Three Pillars of Observability: Metrics (what is broken) + Logs (why) + Traces (which service) — all three are essential",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 92 — 三本柱總覽
// ─────────────────────────────────────────────────────────────────────────────
function slide92(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Three Pillars Overview: What Metrics, Logs, Traces Each Solve",
    partLabel: "PART 7",
    accentColor: COLORS.accent,
  });

  addThreeCols(slide, pres, [
    {
      title: "📊 Metrics",
      icon: "📈",
      color: COLORS.success,
      items: [
        { text: "Numeric time-series data" },
        { text: "What is happening now?" },
        { text: "CPU%, Req/s, Error Rate, P99 Latency" },
        { text: "Best for: Alerting, capacity planning" },
        { text: "Retention: Months to years (low cost)" },
        { text: "Tools: Prometheus, Grafana" },
      ],
    },
    {
      title: "📋 Logs",
      icon: "📝",
      color: COLORS.warning,
      items: [
        { text: "Textual event stream" },
        { text: "Why did it happen?" },
        { text: "Request details, error stack traces" },
        { text: "Best for: Debugging, auditing" },
        { text: "Retention: Days to months (high cost)" },
        { text: "Tools: ELK, Loki, Fluentd" },
      ],
    },
    {
      title: "🔍 Traces",
      icon: "🔗",
      color: COLORS.infra,
      items: [
        { text: "Distributed request path" },
        { text: "Where is it slow?" },
        { text: "Which service, which function, how long" },
        { text: "Best for: Perf analysis, dependency tracking" },
        { text: "Retention: Days to weeks (highest cost)" },
        { text: "Tools: Jaeger, Tempo, Zipkin" },
      ],
    },
  ], { y: HEADER_H + 0.12, h: H - HEADER_H - 0.6 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Cost perspective: Metrics are cheapest (numbers), Logs are moderate (text), Traces are most expensive (every Span must be stored)",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 93 — 為什麼分散式需要可觀測性
// ─────────────────────────────────────────────────────────────────────────────
function slide93(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Monolithic vs Distributed: Why Observability Becomes Critical",
    partLabel: "PART 7",
    accentColor: COLORS.danger,
  });

  // Divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.58, w: 0.01, h: 4.3,
    line: { color: COLORS.border, width: 0.5 },
  });

  // Left: Monolith
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.2,
    label: "🖥️ Monolith: Simple Debugging",
    type: "good",
  });

  addNodeCard(slide, pres, {
    x: 1.2, y: 1.1, w: 2.2, h: 1.0,
    emoji: "⚙️", name: "Monolith App", meta: "Single Process",
    borderColor: COLORS.backend,
  });

  const debugCards = [
    { text: "tail -f app.log" },
    { text: "print() / console.log()" },
    { text: "gdb / pdb local debugging" },
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
  slide.addText("✅ The problem is in this process — just search here", {
    x: 0.45, y: 3.68, w: 3.9, h: 0.38,
    fontSize: 10, bold: true, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
  });

  // Right: Distributed
  addCompareHeading(slide, pres, {
    x: 5.1, y: 0.62, w: 4.4,
    label: "🕸️ Distributed: Debugging Nightmare",
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
    message: "User says checkout is slow! Which service? Which function? Without tracing, you have to check logs on every service...",
    tags: ["15 min to find issue", "Sometimes unfindable"],
  });

  addTipBar(slide, pres, {
    y: 4.75,
    text: "In distributed systems, a single request may touch 10+ services — without Traces, you have no idea where the bottleneck is",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 94 — Metrics 是什麼？解決什麼問題
// ─────────────────────────────────────────────────────────────────────────────
function slide94(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Metrics: Numbers Tell You System Health",
    partLabel: "PART 7",
    accentColor: COLORS.success,
    complexity: 3,
  });

  // Left: explanation
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 4.7, h: 0.88, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.success, width: 1.0 },
  });
  slide.addText("Metrics = Numeric Time-Series Data", {
    x: 0.4, y: 0.68, w: 4.5, h: 0.3,
    fontSize: 14, bold: true, color: COLORS.success,
    fontFace: FONTS.body, align: "center",
  });
  slide.addText("(timestamp, metric_name, labels, value)", {
    x: 0.4, y: 0.98, w: 4.5, h: 0.22,
    fontSize: 10, color: COLORS.textMuted,
    fontFace: FONTS.code, align: "center",
  });

  slide.addText("Your service is running in production — but how do you know it's healthy?", {
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
  slide.addText("❌ Without Metrics, it's like driving without a dashboard — no speed, fuel, or engine status", {
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
    { x: 5.4,  icon: "⏱️", label: "Time-Series", sub: "Ordered by time\nTrend analysis",   border: COLORS.accent },
    { x: 6.88, icon: "🏷️", label: "Labels", sub: "service, env\nversion, region", border: COLORS.accent },
    { x: 8.36, icon: "💡", label: "Efficient", sub: "Numbers = small\nLow storage cost",   border: COLORS.success },
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
    text: "Metrics are not Logs — Metrics only store numbers, extremely low cost, suitable for long-term retention (1+ years is no problem)",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 95 — Metrics 資料類型
// ─────────────────────────────────────────────────────────────────────────────
function slide95(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Four Metric Data Types: Counter, Gauge, Histogram, Summary",
    partLabel: "PART 7",
    accentColor: COLORS.success,
  });

  // Card 1: Counter (top-left)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 4.5, h: 2.2, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("① Counter — Only Goes Up", {
    x: 0.5, y: 0.72, w: 4.1, h: 0.28,
    fontSize: 12, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("Use cases: Total requests, total errors, bytes transferred", {
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
  slide.addText("⚠️ Counter alone is meaningless — use rate() to compute per-second rate", {
    x: 0.5, y: 1.62, w: 4.0, h: 0.25,
    fontSize: 9, color: COLORS.warning, fontFace: FONTS.body,
  });
  // Staircase visual
  const steps = [[0.55, 2.52], [0.9, 2.35], [1.25, 2.18], [1.6, 2.02], [1.95, 1.88]];
  steps.forEach((s, i) => {
    if (i < steps.length - 1) {
      slide.addShape(pres.ShapeType.line, {
        x: s[0], y: s[1], w: 0.35, h: 0.01,
        line: { color: COLORS.success, width: 1.5 },
      });
      slide.addShape(pres.ShapeType.line, {
        x: s[0] + 0.35, y: s[1], w: 0.01, h: Math.max(Math.abs(steps[i + 1][1] - s[1]), 0.01),
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
  slide.addText("② Gauge — Goes Up and Down", {
    x: 5.4, y: 0.72, w: 4.1, h: 0.28,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });
  slide.addText("Use cases: Active connections, memory usage, queue depth", {
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
  slide.addText("Use value directly — no rate() needed", {
    x: 5.4, y: 1.62, w: 4.0, h: 0.25,
    fontSize: 9, color: COLORS.success, fontFace: FONTS.body,
  });
  // Wavy line
  const wavePoints = [[5.4, 2.38], [5.65, 2.22], [5.9, 2.48], [6.15, 2.18], [6.4, 2.42], [6.65, 2.25], [6.9, 2.52]];
  wavePoints.forEach((pt, i) => {
    if (i < wavePoints.length - 1) {
      const dx = wavePoints[i + 1][0] - pt[0];
      const dy = wavePoints[i + 1][1] - pt[1];
      // Normalize negative dimensions: start from the "earlier" corner
      slide.addShape(pres.ShapeType.line, {
        x: dx < 0 ? pt[0] + dx : pt[0],
        y: dy < 0 ? pt[1] + dy : pt[1],
        w: Math.max(Math.abs(dx), 0.01),
        h: Math.max(Math.abs(dy), 0.01),
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
  slide.addText("③ Histogram — Bucketed Distribution", {
    x: 0.5, y: 3.08, w: 4.1, h: 0.28,
    fontSize: 12, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });
  slide.addText("Use cases: Request latency and response size distribution", {
    x: 0.5, y: 3.36, w: 4.1, h: 0.22,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addText("Buckets: _le=0.1, _le=0.5, _le=1.0, _le=+Inf", {
    x: 0.5, y: 3.6, w: 4.1, h: 0.22,
    fontSize: 9, color: COLORS.text, fontFace: FONTS.code,
  });
  slide.addText("Use histogram_quantile(0.99, ...) to compute P99", {
    x: 0.5, y: 3.82, w: 4.1, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addText("Server-side quantile computation — most flexible", {
    x: 0.5, y: 4.08, w: 4.1, h: 0.22,
    fontSize: 9, color: COLORS.success, fontFace: FONTS.body,
  });

  // Card 4: Summary (bottom-right)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 3.02, w: 4.5, h: 2.2, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.2 },
  });
  slide.addText("④ Summary — Client-Side Quantiles", {
    x: 5.4, y: 3.08, w: 4.1, h: 0.28,
    fontSize: 12, bold: true, color: COLORS.infra, fontFace: FONTS.body,
  });
  slide.addText("Use cases: When precise quantiles needed, low data volume", {
    x: 5.4, y: 3.36, w: 4.1, h: 0.22,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addText("Directly outputs P50, P90, P99 quantiles", {
    x: 5.4, y: 3.6, w: 4.1, h: 0.22,
    fontSize: 9, color: COLORS.text, fontFace: FONTS.body,
  });
  slide.addText("⚠️ Cannot aggregate across instances", {
    x: 5.4, y: 3.82, w: 4.1, h: 0.22,
    fontSize: 9, color: COLORS.danger, fontFace: FONTS.body,
  });
  slide.addText("Use Histogram in most cases; Summary is rarely used now", {
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
    title: "Push vs Pull: Fundamental Collection Mode Differences",
    partLabel: "PART 7",
    accentColor: COLORS.accent,
  });

  // Vertical divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.58, w: 0.01, h: 4.85,
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
    emoji: "📊", name: "Prometheus", meta: "Actively scrapes every 15s",
    borderColor: COLORS.accent,
  });

  const pullCards = [
    { text: "✅ Collector controls scrape timing", border: COLORS.success, fill: COLORS.bg2 },
    { text: "✅ Detects service down immediately (scrape fails)", border: COLORS.success, fill: COLORS.bg2 },
    { text: "⚠️ Services must expose HTTP /metrics", border: COLORS.warning, fill: COLORS.bg2 },
    { text: "⚠️ Short-lived batch jobs may be missed", border: COLORS.warning, fill: COLORS.bg2 },
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
    { text: "✅ Ideal for short-lived Batch/Cron Jobs", border: COLORS.success },
    { text: "✅ Can traverse NAT and firewalls",      border: COLORS.success },
    { text: "⚠️ Collector becomes the traffic sink",   border: COLORS.warning },
    { text: "⚠️ Hard to detect when a service is down",          border: COLORS.warning },
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
    text: "In Kubernetes, Pull (Prometheus) is the go-to — K8s service discovery lets Prometheus automatically find all Pods",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 97 — Pull Mode 實戰：Prometheus 架構
// ─────────────────────────────────────────────────────────────────────────────
function slide97(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Prometheus Architecture Deep Dive: Pull Mode in Action",
    partLabel: "PART 7",
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
    code: `global:\n  scrape_interval: 15s\n  evaluation_interval: 15s\n\nscrape_configs:\n  - job_name: 'api-service'\n    static_configs:\n      - targets: ['api-01:8080', 'api-02:8080']\n\n  - job_name: 'kubernetes-pods'  # K8s auto service discovery\n    kubernetes_sd_configs:\n      - role: pod\n    relabel_configs:\n      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]\n        action: keep\n        regex: true`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 98 — K8s 環境的 Prometheus 服務發現
// ─────────────────────────────────────────────────────────────────────────────
function slide98(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Kubernetes + Prometheus: Auto Service Discovery",
    partLabel: "PART 7",
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
  slide.addText("Benefits of Auto-Discovery", {
    x: 5.8, y: 0.72, w: 3.85, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });

  const benefits = [
    { text: "🔄 New Pod starts → automatically added to monitoring", bold: true, color: COLORS.success },
    { text: "🗑️ Pod deleted → automatically removed, no stale targets" },
    { text: "📈 Scale out ×10 → Prometheus discovers all automatically" },
    { text: "0️⃣ No manual edits to prometheus.yml needed" },
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
    code: `# Add annotation to Pod spec\nmetadata:\n  annotations:\n    prometheus.io/scrape: 'true'\n    prometheus.io/path: '/metrics'\n    prometheus.io/port: '8080'\n\n# Prometheus auto-discovers all Pods\n# with this annotation`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 99 — Push Mode 實戰：StatsD 與 Pushgateway
// ─────────────────────────────────────────────────────────────────────────────
function slide99(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Push Mode in Practice: StatsD, Pushgateway, OTLP Collector",
    partLabel: "PART 7",
    accentColor: COLORS.warning,
  });

  addThreeCols(slide, pres, [
    {
      title: "StatsD (UDP Push)",
      icon: "📡",
      color: COLORS.warning,
      items: [
        { text: "UDP fire-and-forget", sub: "Non-blocking for application" },
        { text: "Client library is extremely simple" },
        { text: "statsd.increment('orders.created')" },
        { text: "Best for: High-frequency counters" },
        { text: "DogStatsD supports Tags" },
        { text: "Backend: Graphite / Prometheus" },
      ],
    },
    {
      title: "Pushgateway",
      icon: "🔄",
      color: COLORS.accent,
      items: [
        { text: "Official Prometheus relay station" },
        { text: "Use case: Batch Job / Cron Job" },
        { text: "Job done → push → Prometheus scrapes" },
        { text: "Note: Not suitable for long-running services" },
        { text: "Note: No automatic TTL cleanup" },
        { text: "Preserves K8s Job completion metrics" },
      ],
    },
    {
      title: "OTLP Collector",
      icon: "🏗️",
      color: COLORS.container,
      items: [
        { text: "OpenTelemetry unified pipeline" },
        { text: "Receives Metrics/Logs/Traces simultaneously" },
        { text: "Multiple Receivers: OTLP, Prometheus" },
        { text: "Multiple Exporters: Prometheus, Jaeger" },
        { text: "Deploy as Sidecar or DaemonSet" },
        { text: "The future standard — recommended adoption" },
      ],
    },
  ], { y: HEADER_H + 0.1, h: H - HEADER_H - 0.62 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "StatsD UDP is the lightest push mode — even if the collector is down, the app is unaffected; ideal for critical hot paths",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 100 — PromQL 查詢語言實戰
// ─────────────────────────────────────────────────────────────────────────────
function slide100(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "PromQL: Prometheus Query Language in Practice",
    partLabel: "PART 7",
    accentColor: COLORS.accent,
  });

  addCodeCard(slide, pres, {
    x: 0.3, y: 0.65, w: 9.4, h: 4.62,
    language: "PromQL Examples",
    code: `# 1. Counter Rate — HTTP requests per second\nrate(http_requests_total[5m])\n\n# 2. Error rate grouped by status code\nsum by(status) (rate(http_requests_total[5m]))\n\n# 3. P99 Latency — most common SLO metric\nhistogram_quantile(0.99,\n  rate(http_request_duration_seconds_bucket[5m])\n)\n\n# 4. Error rate (5xx / total)\nsum(rate(http_requests_total{status=~'5..'}[5m]))\n  / sum(rate(http_requests_total[5m])) * 100\n\n# 5. Recording Rule — pre-compute complex queries (in prometheus.yml)\nrecord: job:http_error_rate:ratio5m\nexpr: |\n  sum(rate(http_requests_total{status=~'5..'}[5m]))\n  / sum(rate(http_requests_total[5m]))\n\n# 6. Aggregate across K8s Pods\nsum by(namespace, deployment) (\n  rate(http_requests_total[5m])\n)`,
  });

  addTipBar(slide, pres, {
    y: 5.38,
    text: "Recording Rules are a performance key — pre-compute complex PromQL and store the result; Grafana queries become 10x faster",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 101 — USE / RED / 四個黃金信號
// ─────────────────────────────────────────────────────────────────────────────
function slide101(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Monitoring Methodologies: USE, RED, Four Golden Signals",
    partLabel: "PART 7",
    accentColor: COLORS.success,
  });

  const cols = [
    {
      x: 0.3, border: COLORS.database, heading: "🔧 USE Method",
      sub: "Best for: Infrastructure resources",
      cards: [
        { label: "U — Utilization", detail: "Resource usage rate\nCPU: 75%, Disk: 60%" },
        { label: "S — Saturation",  detail: "Resource saturation\nLoad Average, Queue depth" },
        { label: "E — Errors",      detail: "Error rate\nDisk IO errors, NIC drops" },
      ],
      footer: "Ask: Is this resource overloaded?",
    },
    {
      x: 3.45, border: COLORS.backend, heading: "🌐 RED Method",
      sub: "Best for: Microservice APIs",
      cards: [
        { label: "R — Rate",     detail: "Requests per second\nHTTP req/s, RPC/s" },
        { label: "E — Errors",   detail: "Error rate\n5xx%, failed RPC %" },
        { label: "D — Duration", detail: "Latency distribution\nP50/P95/P99 latency" },
      ],
      footer: "Ask: How is this service performing?",
    },
    {
      x: 6.6, border: COLORS.accent, heading: "⭐ Four Golden Signals",
      sub: "Google SRE Book — Most important to users",
      cards: [
        { label: "Latency",    detail: "Good request vs bad request latency" },
        { label: "Traffic",    detail: "System demand in req/s" },
        { label: "Errors",     detail: "Failed request ratio" },
        { label: "Saturation", detail: "System saturation (most constrained resource)" },
      ],
      footer: "Q: How is the user experience?",
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
    text: "Start new services with the RED method — Rate + Errors + Duration, three metrics that reveal 80% of problems",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 102 — Grafana Dashboard 設計原則
// ─────────────────────────────────────────────────────────────────────────────
function slide102(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Grafana Dashboard Design: Let the Data Speak",
    partLabel: "PART 7",
    accentColor: COLORS.accent,
  });

  // Left: design principles
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.3,
    label: "Dashboard Design Principles",
    type: "good",
  });

  const principles = [
    { text: "🎯 One Dashboard = one service/system", border: COLORS.success },
    { text: "📊 Top: RED/Golden Signals (user impact)",  border: COLORS.success },
    { text: "📉 Middle: Resource usage (USE Method)",       border: COLORS.accent },
    { text: "🔗 Bottom: Downstream dependency status",                border: COLORS.accent },
    { text: "🏷️ Use Variables: env, datacenter, pod", border: COLORS.warning },
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
  slide.addText("❌ Cramming all metrics into one Dashboard\n❌ No time range selector", {
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
    title: "Alert Design: The Art of Avoiding Alert Fatigue",
    partLabel: "PART 7",
    accentColor: COLORS.danger,
  });

  // Left: symptom vs cause
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "❌ Cause-Based Alerts (Not Recommended)",
    type: "bad",
  });

  const badAlerts = [
    { title: "CPU > 80%",       sub: "High CPU doesn't always affect users" },
    { title: "Memory > 70%",    sub: "Might just be cache — perfectly normal" },
    { title: "Disk IOPS > 1000", sub: "Normal during peak business hours" },
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
    label: "✅ Symptom-Based Alerts (Recommended)",
    type: "good",
  });

  const goodAlerts = [
    { title: "Error rate > 1% for 2 minutes",  sub: "Users are being affected right now" },
    { title: "P99 latency > 2000ms",         sub: "Users are experiencing slowness" },
    { title: "SLO burn rate too high",         sub: "Error budget is being depleted fast" },
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
  slide.addText("Alert Severity Levels", {
    x: 5.2, y: 0.65, w: 4.4, h: 0.3,
    fontSize: 13, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  const tiers = [
    {
      fill: COLORS.cardDanger, border: COLORS.danger,
      title: "🚨 P1 CRITICAL — Wake up On-Call immediately",
      detail: "Users affected right now | Respond within 5 min | Phone call + PagerDuty",
      titleColor: COLORS.danger,
    },
    {
      fill: COLORS.cardWarn, border: COLORS.warning,
      title: "⚠️ P2 WARNING — Handle during business hours",
      detail: "May affect users | Fix today | Slack notification is fine",
      titleColor: COLORS.warning,
    },
    {
      fill: COLORS.bg2, border: COLORS.accent,
      title: "💡 P3 INFO — Scheduled resolution",
      detail: "Potential issue | Fix this week | Track via ticket",
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
  slide.addText("📌 Every alert must have:", {
    x: 5.35, y: 3.76, w: 4.1, h: 0.25,
    fontSize: 10.5, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("1. A Runbook link  2. A clear owner  3. A defined response SLA", {
    x: 5.35, y: 4.0, w: 4.1, h: 0.52,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  addTipBar(slide, pres, {
    y: 4.78,
    text: "Alert fatigue is the SRE's worst enemy — review alerts weekly; disable or downgrade alerts nobody acts on",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 104 — AlertManager 路由與通知
// ─────────────────────────────────────────────────────────────────────────────
function slide104(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "AlertManager: Intelligent Routing & Alert Management",
    partLabel: "PART 7",
    accentColor: COLORS.danger,
  });

  // Left: flow diagram
  addNodeCard(slide, pres, {
    x: 0.3, y: 0.78, w: 1.5, h: 0.85,
    emoji: "📊", name: "Prometheus", meta: "Sends alerts",
    borderColor: COLORS.success,
  });

  addHArrow(slide, pres, { x: 1.85, y: 1.08, label: "alert", color: COLORS.danger, w: 0.5 });

  addNodeCard(slide, pres, {
    x: 2.45, y: 0.78, w: 1.8, h: 0.85,
    emoji: "🔀", name: "AlertManager", meta: "Routing Engine",
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

  // Arrows from AlertManager to receivers — normalize to positive dimensions
  slide.addShape(pres.ShapeType.line, {
    x: 3.3 - 0.65, y: 2.17, w: 0.65, h: 0.35,
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
  slide.addText("Advanced Features", {
    x: 5.5, y: 0.75, w: 4.1, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  const features = [
    { border: COLORS.infra,    icon: "🔕", title: "Inhibition", detail: "DB is down → suppress API alerts to avoid duplicate notifications" },
    { border: COLORS.warning,  icon: "🔇", title: "Silence",    detail: "Mute specific alerts during maintenance windows" },
    { border: COLORS.success,  icon: "📦", title: "Grouping",   detail: "Merge multiple alerts from the same service into one notification" },
    { border: COLORS.accent,   icon: "🔁", title: "Repeat Interval",  detail: "Don't repeat every minute — set 4h repeat interval" },
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
    text: "Inhibition rules can drastically reduce alert noise — if the datacenter is down, no need to notify every individual service",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 105 — Metrics 章節小結
// ─────────────────────────────────────────────────────────────────────────────
function slide105(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Metrics Summary: The Complete Pipeline from Collection to Alerting",
    partLabel: "PART 7",
    accentColor: COLORS.success,
  });

  // Full journey timeline
  addNodeCard(slide, pres, {
    x: 0.2, y: 0.72, w: 1.65, h: 1.4,
    emoji: "⚙️", name: "Instrument", meta: "Prometheus client\nDefine Metrics",
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
      title: "🎯 Choose the Right Metric Type",
      body: "Counter → rate()\nGauge → use directly\nHistogram → P99\nDon't use average latency!",
    },
    {
      x: 3.45, border: COLORS.accent,
      title: "📐 Pull > Push in K8s",
      body: "Prometheus + K8s SD\nAuto-discover all Pods\nShort-lived Jobs use Pushgateway\nUnified → OTLP Collector",
    },
    {
      x: 6.6, border: COLORS.warning,
      title: "⚠️ Alerts Must Be Meaningful",
      body: "Symptom-based first\nEvery alert needs a Runbook\nControl alert volume\nAvoid alert fatigue",
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
