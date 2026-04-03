// src/part6.js
// Part 6: Observability and SRE (Slides 43–50)

"use strict";

const fs      = require("fs");
const pptxgen = require("pptxgenjs");
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
// Slide 43 — Observability Three Pillars
// ─────────────────────────────────────────────────────────────────────────────
function slide43(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Observability Three Pillars: Metrics, Logs, Traces",
    partLabel: "PART 6",
    accentColor: COLORS.accent,
  });

  addThreeCols(slide, pres, [
    {
      title: "📊 Metrics",
      icon: "📈",
      color: COLORS.success,
      items: [
        { text: "Numeric time-series data", sub: "CPU%, Memory, Requests/sec" },
        { text: "Tools: Prometheus + Grafana" },
        { text: "Alert rules: CPU > 80% → Notify" },
        { text: "Best for: 'What went wrong'" },
        { text: "Retention: Months to Years" },
      ],
    },
    {
      title: "📋 Logs",
      icon: "📝",
      color: COLORS.warning,
      items: [
        { text: "Text event stream", sub: "Structured JSON format" },
        { text: "Tools: ELK Stack, Loki, CloudWatch" },
        { text: "stdout → Centralized collection" },
        { text: "Best for: 'Why it went wrong'" },
        { text: "Retention: Weeks to Months" },
      ],
    },
    {
      title: "🔍 Traces",
      icon: "🔗",
      color: COLORS.infra,
      items: [
        { text: "Distributed request chain tracing" },
        { text: "Trace ID spans all services" },
        { text: "Tools: Jaeger, Zipkin, Tempo" },
        { text: "Best for: 'Where it went wrong'" },
        { text: "Retention: Days to Weeks (high cost)" },
      ],
    },
  ], { y: HEADER_H + 0.1, h: H - HEADER_H - 0.55 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "All three pillars are essential: Metrics tell you something is wrong, Logs tell you why, Traces tell you which service",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 44 — SLI SLO SLA Definition
// ─────────────────────────────────────────────────────────────────────────────
function slide44(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "SLI / SLO / SLA: Three Levels of Reliability",
    partLabel: "PART 6",
    accentColor: COLORS.success,
  });

  // ── Left column: SLI ──────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 3.0, h: 0.48, rectRadius: 0.08,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.success, width: 1.5 },
  });
  slide.addText("📏 SLI — Service Level Indicator", {
    x: 0.4, y: 0.65, w: 2.85, h: 0.48,
    fontSize: 10.5, bold: true, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 1.18, w: 3.0, h: 0.78, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addText("Actual measured service metric values", {
    x: 0.4, y: 1.22, w: 2.8, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });
  slide.addText("A number representing current service performance", {
    x: 0.4, y: 1.52, w: 2.8, h: 0.25,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  const sliItems = [
    { text: "Availability: 99.95%", color: COLORS.success },
    { text: "P99 Latency: 245ms",  color: COLORS.accent },
    { text: "Error Rate: 0.03%",    color: COLORS.success },
    { text: "Throughput: 1200 req/s", color: COLORS.accent },
  ];
  sliItems.forEach((item, i) => {
    const y = 2.0 + i * 0.52;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 3.0, h: 0.45, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.border, width: 1.0 },
    });
    slide.addText(item.text, {
      x: 0.45, y: y + 0.02, w: 2.7, h: 0.41,
      fontSize: 10, bold: true, color: item.color, fontFace: FONTS.body, valign: "middle",
    });
  });

  // ── Middle column: SLO ────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.roundRect, {
    x: 3.55, y: 0.65, w: 3.0, h: 0.48, rectRadius: 0.08,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.accent, width: 1.5 },
  });
  slide.addText("🎯 SLO — Service Level Objective", {
    x: 3.65, y: 0.65, w: 2.85, h: 0.48,
    fontSize: 10.5, bold: true, color: COLORS.accent, fontFace: FONTS.body, valign: "middle",
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 3.55, y: 1.18, w: 3.0, h: 0.78, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addText("Your defined target numbers", {
    x: 3.65, y: 1.22, w: 2.8, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });
  slide.addText("SLO is the target value for SLI", {
    x: 3.65, y: 1.52, w: 2.8, h: 0.25,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  const sloItems = [
    { text: "Availability SLO: ≥ 99.9%",         color: COLORS.accent },
    { text: "P99 Latency SLO: ≤ 500ms",        color: COLORS.accent },
    { text: "Error Rate SLO: ≤ 0.1%",           color: COLORS.accent },
    { text: "Error Budget: 0.1% = 43min/mo", color: COLORS.warning },
  ];
  sloItems.forEach((item, i) => {
    const y = 2.0 + i * 0.52;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 3.55, y, w: 3.0, h: 0.45, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.border, width: 1.0 },
    });
    slide.addText(item.text, {
      x: 3.70, y: y + 0.02, w: 2.7, h: 0.41,
      fontSize: 10, bold: true, color: item.color, fontFace: FONTS.body, valign: "middle",
    });
  });

  // ── Right column: SLA ─────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.8, y: 0.65, w: 3.0, h: 0.48, rectRadius: 0.08,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.warning, width: 1.5 },
  });
  slide.addText("📄 SLA — Service Level Agreement", {
    x: 6.9, y: 0.65, w: 2.85, h: 0.48,
    fontSize: 10.5, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.8, y: 1.18, w: 3.0, h: 0.78, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addText("External-facing legal agreement", {
    x: 6.9, y: 1.22, w: 2.8, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });
  slide.addText("SLA Violation → Compensation", {
    x: 6.9, y: 1.52, w: 2.8, h: 0.25,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  const slaItems = [
    { text: "AWS EC2: 99.99% Availability",          color: COLORS.warning, italic: false },
    { text: "Compensation: Service Credit",             color: COLORS.warning, italic: false },
    { text: "SLO < SLA (keep buffer)",             color: COLORS.accent,  italic: false },
    { text: "\"SLO is the internal target, SLA is the external commitment\"", color: COLORS.textMuted, italic: true },
  ];
  slaItems.forEach((item, i) => {
    const y = 2.0 + i * 0.52;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y, w: 3.0, h: 0.45, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.border, width: 1.0 },
    });
    slide.addText(item.text, {
      x: 6.95, y: y + 0.02, w: 2.7, h: 0.41,
      fontSize: 9.5, bold: !item.italic, italic: item.italic,
      color: item.color, fontFace: FONTS.body, valign: "middle",
    });
  });

  // ── Arrows between columns ────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.line, {
    x: 3.35, y: 1.45, w: 0.18, h: 0.01,
    line: { color: COLORS.textMuted, width: 1.5, endArrowType: "arrow" },
  });
  slide.addText("measured by", {
    x: 3.36, y: 1.32, w: 0.18, h: 0.22,
    fontSize: 6.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  slide.addShape(pres.ShapeType.line, {
    x: 6.6, y: 1.45, w: 0.18, h: 0.01,
    line: { color: COLORS.textMuted, width: 1.5, endArrowType: "arrow" },
  });
  slide.addText("defines", {
    x: 6.61, y: 1.32, w: 0.18, h: 0.22,
    fontSize: 6.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "SLO should be 10x stricter than SLA — if SLA is 99.9%, your SLO should be 99.99%, the gap is your Error Budget",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 45 — Error Budget
// ─────────────────────────────────────────────────────────────────────────────
function slide45(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Error Budget: Turning Downtime into a Decision Tool",
    partLabel: "PART 6",
    accentColor: COLORS.warning,
  });

  // ── Left: Definition ──────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 4.4, h: 1.1, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.warning, width: 1.5 },
  });
  slide.addText("Error Budget = 1 - SLO", {
    x: 0.4, y: 0.68, w: 4.2, h: 0.5,
    fontSize: 16, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });
  slide.addText("SLO = 99.9%  →  Error Budget = 0.1% = 43.8 min/month", {
    x: 0.4, y: 1.18, w: 4.2, h: 0.3,
    fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Scenario 1
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 1.88, w: 4.4, h: 0.65, rectRadius: 0.08,
    fill: { color: COLORS.cardSuccess },
    line: { color: COLORS.success, width: 1.5 },
  });
  slide.addText("✅ Budget Sufficient → Deploy new features rapidly", {
    x: 0.45, y: 1.88, w: 4.1, h: 0.65,
    fontSize: 10.5, bold: true, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
  });

  // Scenario 2
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.58, w: 4.4, h: 0.65, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.5 },
  });
  slide.addText("🚨 Budget Exhausted → Freeze feature deploys, focus on stability", {
    x: 0.45, y: 2.58, w: 4.1, h: 0.65,
    fontSize: 10.5, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  // Policy
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.38, w: 4.4, h: 1.35, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.5 },
  });
  slide.addText("Error Budget Policy", {
    x: 0.45, y: 3.42, w: 4.1, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.infra, fontFace: FONTS.body,
  });
  slide.addText("• Budget > 50%: Normal deploys, risky deploys allowed", {
    x: 0.45, y: 3.74, w: 4.1, h: 0.25,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addText("• Budget 25-50%: Deploy cautiously, increase testing", {
    x: 0.45, y: 4.01, w: 4.1, h: 0.25,
    fontSize: 9.5, color: COLORS.warning, fontFace: FONTS.body,
  });
  slide.addText("• Budget < 25%: Freeze feature deployments", {
    x: 0.45, y: 4.28, w: 4.1, h: 0.25,
    fontSize: 9.5, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });

  // ── Right: Bar chart visualization ───────────────────────────────────────
  slide.addText("2024 Monthly Error Budget Consumption", {
    x: 5.2, y: 0.65, w: 4.4, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const values = [22, 15, 8, 45, 62, 18, 10, 5, 38, 95, 28, 12];
  const barColors = [
    COLORS.danger, COLORS.success, COLORS.success, COLORS.warning,
    COLORS.danger, COLORS.success, COLORS.success, COLORS.success,
    COLORS.warning, COLORS.danger, COLORS.warning, COLORS.success,
  ];

  const chartX   = 5.2;
  const chartBotY = 3.7;
  const chartH   = 2.5;
  const barW     = 0.26;
  const barGap   = 0.36;

  // Budget Limit line at 100%
  slide.addShape(pres.ShapeType.line, {
    x: chartX, y: 1.08, w: 4.45, h: 0.01,
    line: { color: COLORS.danger, width: 1.0, dashType: "dash" },
  });
  slide.addText("Budget Limit (100%)", {
    x: chartX + 2.6, y: 0.92, w: 1.85, h: 0.22,
    fontSize: 7.5, color: COLORS.danger, fontFace: FONTS.body,
  });

  months.forEach((mon, i) => {
    const pct = values[i] / 100;
    const bH  = chartH * pct;
    const bX  = chartX + i * barGap;
    const bY  = chartBotY - bH;

    slide.addShape(pres.ShapeType.roundRect, {
      x: bX, y: bY, w: barW, h: bH, rectRadius: 0.03,
      fill: { color: barColors[i] },
      line: { color: barColors[i], width: 0.5 },
    });
    slide.addText(mon, {
      x: bX, y: chartBotY + 0.02, w: barW, h: 0.18,
      fontSize: 7.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
    slide.addText(`${values[i]}%`, {
      x: bX - 0.04, y: bY - 0.2, w: barW + 0.08, h: 0.2,
      fontSize: 6.5, color: barColors[i], fontFace: FONTS.body, align: "center",
    });
  });

  addAlertBar(slide, pres, {
    y: 3.85,
    message: "October Error Budget exhausted! → Immediately freeze feature deploys, SRE intervenes for stability",
    tags: ["Freeze Deploys", "SRE Action", "Root Cause"],
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Error Budget gives Dev and Ops a shared language — not 'stability vs speed', but 'how much budget is left to spend'",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 46 — Prometheus + Grafana Monitoring
// ─────────────────────────────────────────────────────────────────────────────
function slide46(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Monitoring in Practice: Prometheus + Grafana Combo",
    partLabel: "PART 6",
    accentColor: COLORS.success,
  });

  // ── Services ──────────────────────────────────────────────────────────────
  ["api-01", "api-02", "api-03"].forEach((label, i) => {
    addMiniNode(slide, pres, {
      x: 0.4, y: 0.72 + i * 0.6,
      emoji: "⚙️", label,
      borderColor: COLORS.backend,
    });
    slide.addText(":8080/metrics", {
      x: 1.6, y: 0.87 + i * 0.6, w: 1.0, h: 0.2,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.code,
    });
  });

  // Scrape arrow
  slide.addShape(pres.ShapeType.line, {
    x: 2.3, y: 1.35 + 0.15, w: 0.5, h: 0.01,
    line: { color: COLORS.success, width: 1.5, endArrowType: "arrow" },
  });
  slide.addText("scrape\n15s", {
    x: 2.28, y: 1.22, w: 0.6, h: 0.28,
    fontSize: 8, color: COLORS.success, fontFace: FONTS.body, align: "center",
  });

  // Prometheus node
  addNodeCard(slide, pres, {
    x: 2.9, y: 0.68, w: 1.6, h: 1.52,
    emoji: "📊", name: "Prometheus",
    meta: "Time-Series DB\n15s scrape",
    borderColor: COLORS.success,
  });

  // Grafana arrow
  slide.addShape(pres.ShapeType.line, {
    x: 4.6, y: 1.32 + 0.15, w: 0.45, h: 0.01,
    line: { color: COLORS.accent, width: 1.5, endArrowType: "arrow" },
  });

  // Grafana node
  addNodeCard(slide, pres, {
    x: 5.1, y: 0.68, w: 1.6, h: 1.52,
    emoji: "📈", name: "Grafana",
    meta: "Visualization\nDashboard",
    borderColor: COLORS.accent,
  });

  // AlertManager
  addMiniNode(slide, pres, {
    x: 2.9, y: 2.55, w: 1.6,
    emoji: "🔔", label: "AlertManager",
    borderColor: COLORS.danger,
  });

  // Prometheus → AlertManager arrow
  addVArrow(slide, pres, { x: 3.7, y: 2.25, h: 0.28, color: COLORS.danger });

  // AlertManager → notify arrow
  slide.addShape(pres.ShapeType.line, {
    x: 4.6, y: 2.85 + 0.15, w: 0.5, h: 0.01,
    line: { color: COLORS.warning, width: 1.5, endArrowType: "arrow" },
  });
  slide.addText("notify", {
    x: 4.58, y: 2.75, w: 0.55, h: 0.2,
    fontSize: 8, color: COLORS.warning, fontFace: FONTS.body, align: "center",
  });

  // PagerDuty / Slack
  addMiniNode(slide, pres, {
    x: 5.25, y: 2.6, w: 1.6,
    emoji: "📱", label: "PagerDuty\nSlack",
    borderColor: COLORS.warning,
  });

  // ── PromQL code card ──────────────────────────────────────────────────────
  addCodeCard(slide, pres, {
    x: 6.9, y: 0.65, w: 2.8, h: 2.35,
    language: "PromQL",
    code: "# HTTP Error Rate\nrate(http_requests_total{\n  status=~'5..'\n}[5m]) /\nrate(http_requests_total[5m])\n\n# P99 Latency\nhistogram_quantile(0.99,\n  rate(http_duration_bucket[5m])\n)\n\n# CPU Alert Rule\ncontainer_cpu_usage > 0.8",
  });

  // ── Alert rule label cards ────────────────────────────────────────────────
  const alertRules = [
    { x: 0.3,  label: "🔴 Critical: Error Rate > 1%",   color: COLORS.danger },
    { x: 3.4,  label: "🟡 Warning: P99 > 500ms",     color: COLORS.warning },
    { x: 6.5,  label: "🟢 Info: Deployment Completed",        color: COLORS.success },
  ];
  alertRules.forEach((r) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: r.x, y: 3.22, w: 2.9, h: 0.52, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: r.color, width: 1.5 },
    });
    slide.addText(r.label, {
      x: r.x + 0.12, y: 3.22, w: 2.68, h: 0.52,
      fontSize: 10, bold: true, color: r.color, fontFace: FONTS.body, valign: "middle",
    });
  });

  // ── Alert rule code card ──────────────────────────────────────────────────
  addCodeCard(slide, pres, {
    x: 0.3, y: 3.85, w: 9.4, h: 1.02,
    language: "alert rule",
    code: "- alert: HighErrorRate\n  expr: rate(http_requests_total{status=~'5..'}[5m]) / rate(http_requests_total[5m]) > 0.01\n  for: 2m\n  labels: { severity: critical }\n  annotations: { summary: 'Error rate {{ $value | humanizePercentage }}' }",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 47 — Distributed Tracing
// ─────────────────────────────────────────────────────────────────────────────
function slide47(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Distributed Tracing: Finding Performance Bottlenecks",
    partLabel: "PART 6",
    accentColor: COLORS.infra,
  });

  // ── Top request flow ──────────────────────────────────────────────────────
  addMiniNode(slide, pres, { x: 0.2,  y: 0.78, w: 0.78, emoji: "👤", label: "User",  borderColor: COLORS.client });
  addHArrow(slide, pres,   { x: 1.04, y: 0.98, w: 0.3,  label: "GET /checkout",      color: COLORS.frontend });
  addMiniNode(slide, pres, { x: 1.4,  y: 0.78, w: 0.78, emoji: "🌐", label: "nginx", borderColor: COLORS.frontend });
  addHArrow(slide, pres,   { x: 2.24, y: 0.98, w: 0.3,  label: "proxy",              color: COLORS.backend });
  addMiniNode(slide, pres, { x: 2.6,  y: 0.78, w: 0.78, emoji: "⚙️", label: "api",  borderColor: COLORS.backend });

  // api → sub-services arrows
  addVArrow(slide, pres, { x: 2.95, y: 1.42, h: 0.32, color: COLORS.backend });

  addMiniNode(slide, pres, { x: 2.1,  y: 1.75, w: 0.78, emoji: "🗄️", label: "DB",    borderColor: COLORS.database });
  addMiniNode(slide, pres, { x: 3.0,  y: 1.75, w: 0.78, emoji: "⚡",  label: "Redis", borderColor: COLORS.infra });
  addMiniNode(slide, pres, { x: 3.9,  y: 1.75, w: 0.78, emoji: "📧",  label: "Email", borderColor: COLORS.warning });

  // Trace ID badge
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.9, y: 0.78, w: 4.9, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.0 },
  });
  slide.addText("Trace ID: abc-123-xyz", {
    x: 5.05, y: 0.78, w: 3.2, h: 0.38,
    fontSize: 10, bold: true, color: COLORS.infra, fontFace: FONTS.code, valign: "middle",
  });
  slide.addText("Spans the entire request chain", {
    x: 8.25, y: 0.78, w: 1.4, h: 0.38,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  // ── Gantt timeline ────────────────────────────────────────────────────────
  const ganttItems = [
    { label: "nginx",       x: 5.8,  y: 1.35, w: 3.7,  color: COLORS.frontend, fill: "1A2A40" },
    { label: "api",         x: 5.95, y: 1.55, w: 3.4,  color: COLORS.backend,  fill: "1A2A1A" },
    { label: "DB query",    x: 6.0,  y: 1.75, w: 2.8,  color: COLORS.database, fill: COLORS.cardDanger },
    { label: "Redis",       x: 6.0,  y: 1.95, w: 0.4,  color: COLORS.infra,    fill: "1A1A2A" },
    { label: "Email(async)",x: 9.1,  y: 2.15, w: 0.5,  color: COLORS.warning,  fill: COLORS.cardWarn },
  ];
  ganttItems.forEach((g) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: g.x, y: g.y, w: g.w, h: 0.15, rectRadius: 0.03,
      fill: { color: g.fill },
      line: { color: g.color, width: 1.0 },
    });
    slide.addText(g.label, {
      x: 4.9, y: g.y, w: 0.85, h: 0.15,
      fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
    });
  });

  slide.addText("⚠️ DB query: 245ms — Bottleneck!", {
    x: 8.9, y: 1.73, w: 0.9, h: 0.2,
    fontSize: 9, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });

  // ── Code card ─────────────────────────────────────────────────────────────
  addCodeCard(slide, pres, {
    x: 0.3, y: 2.38, w: 9.4, h: 1.52,
    language: "Python (OpenTelemetry)",
    code: "from opentelemetry import trace\n\ntracer = trace.get_tracer(__name__)\n\n@app.get('/checkout')\nasync def checkout(user_id: str):\n    with tracer.start_as_current_span('checkout') as span:\n        span.set_attribute('user.id', user_id)\n        \n        with tracer.start_as_current_span('db.query'):\n            result = await db.fetch_cart(user_id)  # Auto-records duration\n        \n        return result",
  });

  addTipBar(slide, pres, {
    y: 5.0,
    text: "Debugging a distributed system without tracing is like solving a puzzle blindfolded — OpenTelemetry is the modern standard",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 48 — SRE Engineer Responsibilities
// ─────────────────────────────────────────────────────────────────────────────
function slide48(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "SRE: Treating Operations as a Software Engineering Problem",
    partLabel: "PART 6",
    accentColor: COLORS.accent,
  });

  // ── Left: SRE responsibilities ────────────────────────────────────────────
  slide.addText("Core SRE Responsibilities", {
    x: 0.3, y: 0.65, w: 4.4, h: 0.35,
    fontSize: 13, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  const respCards = [
    { label: "🔧 Eliminate Toil — Automate repetitive manual work", color: COLORS.success },
    { label: "📊 SLI/SLO/Error Budget Management",        color: COLORS.accent },
    { label: "🚨 Incident Response & On-Call",       color: COLORS.danger },
    { label: "📝 Postmortem Culture — Blameless",        color: COLORS.warning },
    { label: "🏗️ Build more reliable system architectures",              color: COLORS.infra },
  ];
  respCards.forEach((c, i) => {
    const y = 1.0 + i * 0.62;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 4.4, h: 0.52, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: c.color, width: 1.5 },
    });
    slide.addText(c.label, {
      x: 0.45, y, w: 4.1, h: 0.52,
      fontSize: 10.5, bold: true, color: c.color, fontFace: FONTS.body, valign: "middle",
    });
  });

  // Toil budget box
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.75, w: 4.4, h: 0.88, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.warning, width: 1.5 },
  });
  slide.addText("Toil Budget: < 50% of work time", {
    x: 0.45, y: 3.82, w: 4.1, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });
  slide.addText("Exceeds 50% → SRE automates until it drops below 50%", {
    x: 0.45, y: 4.13, w: 4.1, h: 0.42,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // ── Right: Comparison table ───────────────────────────────────────────────
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.1, y: 0.65, w: 4.6, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 1.0 },
  });
  const headers = ["", "SysAdmin", "DevOps", "SRE"];
  const colXs   = [5.1, 5.95, 7.1, 8.25];
  headers.forEach((h, i) => {
    slide.addText(h, {
      x: colXs[i] + 0.05, y: 0.65, w: 1.0, h: 0.38,
      fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  const rows = [
    { label: "Primary Goal", vals: [
      { t: "Stability",         c: COLORS.textMuted },
      { t: "Speed",         c: COLORS.accent },
      { t: "Reliability",       c: COLORS.success },
    ]},
    { label: "Automation", vals: [
      { t: "Manual SSH",     c: COLORS.danger },
      { t: "CI/CD",        c: COLORS.accent },
      { t: "Fully Automated",     c: COLORS.success },
    ]},
    { label: "Failure Handling", vals: [
      { t: "Fix & Forget",     c: COLORS.textMuted },
      { t: "Inconsistent",       c: COLORS.warning },
      { t: "Postmortem Required", c: COLORS.success },
    ]},
    { label: "Measurement", vals: [
      { t: "Uptime/Downtime",   c: COLORS.textMuted },
      { t: "Deploy Frequency",     c: COLORS.accent },
      { t: "SLO/Error Budget", c: COLORS.success },
    ]},
  ];

  rows.forEach((row, ri) => {
    const y   = 1.05 + ri * 0.52;
    const bg  = ri % 2 === 0 ? COLORS.bg2 : COLORS.bg3;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.1, y, w: 4.6, h: 0.46, rectRadius: 0.04,
      fill: { color: bg },
      line: { color: COLORS.border, width: 0.5 },
    });
    slide.addText(row.label, {
      x: 5.15, y, w: 0.75, h: 0.46,
      fontSize: 9, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
    row.vals.forEach((v, vi) => {
      slide.addText(v.t, {
        x: colXs[vi + 1] + 0.05, y, w: 1.05, h: 0.46,
        fontSize: 9, color: v.c, fontFace: FONTS.body, valign: "middle",
      });
    });
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Google SRE Handbook: 'SRE is what happens when you ask a software engineer to design an operations team — they automate everything'",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 49 — Postmortem Culture
// ─────────────────────────────────────────────────────────────────────────────
function slide49(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Blameless Postmortem: Learning from Failures",
    partLabel: "PART 6",
    accentColor: COLORS.warning,
  });

  // ── Left: Blameless principles ────────────────────────────────────────────
  slide.addText("🚫 Blameless Postmortem", {
    x: 0.3, y: 0.65, w: 4.4, h: 0.35,
    fontSize: 13, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });
  slide.addText("Find the root cause, not someone to blame", {
    x: 0.3, y: 0.95, w: 4.4, h: 0.28,
    fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  const principles = [
    "✅ Describe facts, don't blame individuals",
    "✅ 5-Why root cause analysis",
    "✅ Systemic improvement, not punishment",
    "✅ Share learnings openly",
  ];
  principles.forEach((p, i) => {
    const y = 1.28 + i * 0.58;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 4.4, h: 0.48, rectRadius: 0.08,
      fill: { color: COLORS.cardSuccess },
      line: { color: COLORS.success, width: 1.5 },
    });
    slide.addText(p, {
      x: 0.45, y, w: 4.1, h: 0.48,
      fontSize: 10.5, bold: true, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
    });
  });

  // Forbidden card
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.62, w: 4.4, h: 0.52, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.5 },
  });
  slide.addText("❌ Forbidden: 'It was all XXX's fault'", {
    x: 0.45, y: 3.62, w: 4.1, h: 0.52,
    fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  // ── Right: Postmortem template ────────────────────────────────────────────
  addCodeCard(slide, pres, {
    x: 5.1, y: 0.65, w: 4.6, h: 4.55,
    language: "Postmortem Template",
    code: "## Incident Summary\n- Date: 2024-03-15 14:32 UTC\n- Duration: 47 minutes\n- Impact: 23% of global users unable to log in\n- Severity: SEV-1\n\n## Timeline\n- 14:32 Alert triggered: Error rate > 5%\n- 14:38 SRE on-call paged\n- 14:45 Root cause identified: DB migration\n- 15:19 Rollback completed\n\n## Root Cause\nDB migration script locked the users table\ncausing all login requests to timeout\n\n## Action Items\n[ ] Add DB migration smoke test\n[ ] Schedule migrations during maintenance window\n[ ] Improve rollback SOP",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 50 — Course Summary
// ─────────────────────────────────────────────────────────────────────────────
function slide50(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Course Summary: You Now Understand Real-World Deployment",
    partLabel: "COURSE SUMMARY",
    accentColor: COLORS.accent,
  });

  // ── Journey milestone cards ───────────────────────────────────────────────
  const milestones = [
    { x: 0.25, border: COLORS.frontend,  part: "PART 1", emoji: "🖥️",  title: "Traditional Deploy",  sub: "Single→Split→3-Tier" },
    { x: 1.82, border: COLORS.infra,     part: "PART 2", emoji: "⚖️",  title: "Scale Out", sub: "LB+Cache+MQ" },
    { x: 3.39, border: COLORS.container, part: "PART 3", emoji: "🐳",  title: "Container", sub: "Consistent Env" },
    { x: 4.96, border: COLORS.accent,    part: "PART 4", emoji: "📐",  title: "12-Factor",  sub: "Design Principles" },
    { x: 6.53, border: COLORS.success,   part: "PART 5", emoji: "🔄",  title: "DevOps",    sub: "CI/CD" },
    { x: 8.1,  border: COLORS.warning,   part: "PART 6", emoji: "📊",  title: "Observability",  sub: "SRE" },
  ];

  milestones.forEach((m) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: m.x, y: 0.65, w: 1.42, h: 1.72, rectRadius: 0.1,
      fill: { color: COLORS.bg2 },
      line: { color: m.border, width: 1.5 },
    });
    slide.addText(m.part, {
      x: m.x + 0.08, y: 0.68, w: 1.25, h: 0.25,
      fontSize: 9, bold: true, color: COLORS.accent, fontFace: FONTS.body, align: "center",
    });
    slide.addText(m.emoji, {
      x: m.x + 0.08, y: 0.93, w: 1.25, h: 0.55,
      fontSize: 20, color: COLORS.text, fontFace: FONTS.body, align: "center",
    });
    slide.addText(m.title, {
      x: m.x + 0.08, y: 1.5, w: 1.25, h: 0.25,
      fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
    });
    slide.addText(m.sub, {
      x: m.x + 0.08, y: 1.77, w: 1.25, h: 0.28,
      fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
  });

  // Connecting arrows between milestone cards
  [1.73, 3.3, 4.87, 6.44, 8.01].forEach((ax) => {
    slide.addShape(pres.ShapeType.line, {
      x: ax, y: 1.5, w: 0.07, h: 0.01,
      line: { color: COLORS.accent, width: 1.5, endArrowType: "arrow" },
    });
  });

  // ── Core insight banner ───────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.5, w: 9.4, h: 0.95, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.accent, width: 1.5 },
  });
  slide.addText("🎯 Core Insight: Complexity is inevitable — but it can be managed", {
    x: 0.3, y: 2.55, w: 9.4, h: 0.42,
    fontSize: 14, bold: true, color: COLORS.accent, fontFace: FONTS.body, align: "center",
  });
  slide.addText("Container + 12-Factor + CI/CD + Observability = The Modern Cloud Native Engineer's Toolkit", {
    x: 0.3, y: 2.97, w: 9.4, h: 0.3,
    fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // ── Takeaway cards ────────────────────────────────────────────────────────
  const takeaways = [
    {
      x: 0.3,
      border: COLORS.frontend,
      icon: "🏗️ Architecture Evolves",
      iconColor: COLORS.frontend,
      body: "From monolith to distributed\nEvery step has a reason\nDon't over-engineer",
    },
    {
      x: 3.45,
      border: COLORS.container,
      icon: "🐳 Containers Are the Foundation",
      iconColor: COLORS.container,
      body: "Consistent environments + Versioning\nThe smallest unit of modern deployment\nMaster Docker well",
    },
    {
      x: 6.6,
      border: COLORS.success,
      icon: "📊 Let Data Decide",
      iconColor: COLORS.success,
      body: "SLO/SLA/DORA\nDrive improvement with metrics\nDon't rely on gut feelings",
    },
  ];
  takeaways.forEach((t) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: t.x, y: 3.58, w: 2.9, h: 1.5, rectRadius: 0.1,
      fill: { color: COLORS.bg2 },
      line: { color: t.border, width: 1.5 },
    });
    slide.addText(t.icon, {
      x: t.x + 0.12, y: 3.65, w: 2.66, h: 0.35,
      fontSize: 11, bold: true, color: t.iconColor, fontFace: FONTS.body,
    });
    slide.addText(t.body, {
      x: t.x + 0.12, y: 4.02, w: 2.66, h: 0.95,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
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
  for (const fn of [slide43, slide44, slide45, slide46, slide47, slide48, slide49, slide50]) {
    await fn(pres);
  }
  await pres.writeFile({ fileName: "output/part6.pptx" });
  console.log("part6.pptx created");
}

main().catch(console.error);
