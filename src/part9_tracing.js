// src/part9_tracing.js
// Part 9: Distributed Tracing (Slides 121–135)

"use strict";

const fs      = require("fs");
const pptxgen = require("pptxgenjs");
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

const ACCENT = COLORS.infra; // 6E40C9
const label  = (n) => `PART 9 TRACING  · ${n} / 150`;

// ─────────────────────────────────────────────────────────────────────────────
// Slide 121 — Distributed Tracing: Why We Need It
// ─────────────────────────────────────────────────────────────────────────────
function slide121(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Distributed Tracing: Why We Need It",
    partLabel: label(121),
    accentColor: ACCENT,
    complexity: 4,
  });

  // Problem statement cards
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.46, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addText("Problem: one user request touches 10+ services — errors happen anywhere along the chain", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.46,
    fontSize: 10.5, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });

  // Service chain diagram
  const services = [
    { emoji: "👤", name: "User",       color: COLORS.client },
    { emoji: "🖥️", name: "Frontend",  color: COLORS.frontend },
    { emoji: "🔀", name: "API GW",     color: COLORS.accent },
    { emoji: "🔐", name: "Auth Svc",   color: COLORS.warning },
    { emoji: "📦", name: "Order Svc",  color: COLORS.backend },
    { emoji: "🏪", name: "Inventory",  color: COLORS.success },
    { emoji: "🗄️", name: "DB",         color: COLORS.database },
  ];
  const nodeW = 1.1;
  const nodeH = 0.9;
  const arrowW = 0.45;
  const totalW = services.length * nodeW + (services.length - 1) * arrowW;
  const startX = (W - totalW) / 2;
  const rowY   = 1.25;

  services.forEach((svc, i) => {
    const x = startX + i * (nodeW + arrowW);
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: rowY, w: nodeW, h: nodeH, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: svc.color, width: 1.5 },
    });
    slide.addText(svc.emoji, {
      x, y: rowY + 0.05, w: nodeW, h: 0.42,
      fontSize: 18, align: "center", valign: "middle",
    });
    slide.addText(svc.name, {
      x, y: rowY + 0.5, w: nodeW, h: 0.3,
      fontSize: 8.5, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
    });
    if (i < services.length - 1) {
      addHArrow(slide, pres, {
        x: x + nodeW, y: rowY + 0.28, w: arrowW, color: COLORS.border,
      });
    }
  });

  // Failure point annotation
  slide.addText("← Each hop is a potential failure point", {
    x: 1.0, y: 2.25, w: 8.0, h: 0.25,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, italic: true, align: "center",
  });

  // Two problem points
  const points = [
    { icon: "❌", text: "Without tracing: you see an error but cannot follow the request journey across services" },
    { icon: "🔍", text: "With tracing: every hop gets a span — latency, errors, and context are all visible end-to-end" },
  ];
  points.forEach((p, i) => {
    const y = 2.58 + i * 0.52;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 9.4, h: 0.44, rectRadius: 0.07,
      fill: { color: i === 0 ? COLORS.cardDanger : COLORS.cardSuccess },
      line: { color: i === 0 ? COLORS.danger : COLORS.success, width: 0.75 },
    });
    slide.addText(`${p.icon}  ${p.text}`, {
      x: 0.5, y, w: 9.0, h: 0.44,
      fontSize: 10, color: i === 0 ? COLORS.danger : COLORS.success,
      fontFace: FONTS.body, valign: "middle",
    });
  });

  addAlertBar(slide, pres, {
    y: 3.72,
    message: "一個請求失敗了，但你不知道是哪個服務的問題",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 122 — Trace, Span, and Context
// ─────────────────────────────────────────────────────────────────────────────
function slide122(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Trace, Span, and Context",
    partLabel: label(122),
    accentColor: ACCENT,
    complexity: 5,
  });

  // Three concept cards
  const concepts = [
    {
      icon: "🔗", title: "Trace", color: ACCENT,
      lines: ["Complete journey of a single request", "Has a unique traceId (128-bit)", "Composed of many spans", "Spans the full lifecycle end-to-end"],
    },
    {
      icon: "⏱️", title: "Span", color: COLORS.accent,
      lines: ["One unit of work inside a trace", "Has spanId + parentSpanId", "Records start/end time", "Can carry tags, logs, events"],
    },
    {
      icon: "📬", title: "Context", color: COLORS.success,
      lines: ["Metadata propagated across boundaries", "Passes traceId + spanId in HTTP headers", "W3C traceparent standard", "Links child spans back to parent"],
    },
  ];
  const colW = 2.9;
  concepts.forEach((c, i) => {
    const x = 0.25 + i * (colW + 0.15);
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 0.62, w: colW, h: 2.6, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: c.color, width: 1.5 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x, y: 0.62, w: colW, h: 0.5,
      fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0 },
    });
    slide.addText(`${c.icon}  ${c.title}`, {
      x: x + 0.1, y: 0.62, w: colW - 0.2, h: 0.5,
      fontSize: 13, bold: true, color: c.color, fontFace: FONTS.body, valign: "middle",
    });
    c.lines.forEach((line, j) => {
      slide.addShape(pres.ShapeType.ellipse, {
        x: x + 0.14, y: 1.26 + j * 0.47 + 0.05, w: 0.1, h: 0.1,
        fill: { color: c.color }, line: { color: c.color, width: 0 },
      });
      slide.addText(line, {
        x: x + 0.3, y: 1.24 + j * 0.47, w: colW - 0.42, h: 0.38,
        fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
      });
    });
  });

  // Parent-child span hierarchy
  slide.addText("Parent → Child span hierarchy:", {
    x: 0.3, y: 3.32, w: 4.0, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  const spans = [
    { label: "Trace: frontend-request  [traceId: abc123]", x: 0.3, w: 9.4, color: ACCENT, depth: 0 },
    { label: "Span: api-gateway  [parentSpanId: root]", x: 0.6, w: 8.8, color: COLORS.accent, depth: 1 },
    { label: "Span: auth-service  [parentSpanId: gw-span]", x: 1.0, w: 8.0, color: COLORS.success, depth: 2 },
    { label: "Span: order-service  [parentSpanId: gw-span]", x: 1.0, w: 8.0, color: COLORS.warning, depth: 2 },
  ];
  spans.forEach((sp, i) => {
    const y = 3.65 + i * 0.36;
    slide.addShape(pres.ShapeType.roundRect, {
      x: sp.x, y, w: sp.w, h: 0.28, rectRadius: 0.05,
      fill: { color: COLORS.bg2 }, line: { color: sp.color, width: 1.0 },
    });
    slide.addText(sp.label, {
      x: sp.x + 0.12, y, w: sp.w - 0.2, h: 0.28,
      fontSize: 8.5, color: sp.color, fontFace: FONTS.code, valign: "middle",
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 123 — Context Propagation
// ─────────────────────────────────────────────────────────────────────────────
function slide123(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Context Propagation",
    partLabel: label(123),
    accentColor: ACCENT,
    complexity: 6,
  });

  // W3C standard badge
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.07,
    fill: { color: COLORS.bg3 }, line: { color: ACCENT, width: 1.0 },
  });
  slide.addText("W3C Trace Context Standard — defines the traceparent HTTP header format", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 10.5, bold: true, color: ACCENT, fontFace: FONTS.body, valign: "middle",
  });

  // Header anatomy code card
  addCodeCard(slide, pres, {
    x: 0.3, y: 1.22, w: 9.4, h: 1.0,
    language: "HTTP Header",
    code:
      "traceparent: 00-{traceId}-{spanId}-{flags}\n" +
      "traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01\n" +
      "             ↑  ← 32-hex traceId →         ← 16-hex spanId →  ↑\n" +
      "             version                                           sampled flag",
  });

  // Propagation flow diagram
  slide.addText("How context flows across service boundaries:", {
    x: 0.3, y: 2.38, w: 5.0, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  const steps = [
    { emoji: "🅰️", name: "Service A", sub: "Creates root span\nSets traceparent header", color: COLORS.frontend },
    { emoji: "→", name: "", sub: "HTTP Request", color: COLORS.border, isArrow: true },
    { emoji: "🅱️", name: "Service B", sub: "Reads traceparent\nCreates child span", color: COLORS.backend },
    { emoji: "→", name: "", sub: "HTTP Request", color: COLORS.border, isArrow: true },
    { emoji: "🅲", name: "Service C", sub: "Reads traceparent\nCreates child span", color: COLORS.infra },
  ];

  let xPos = 0.3;
  steps.forEach((step) => {
    if (step.isArrow) {
      slide.addShape(pres.ShapeType.line, {
        x: xPos + 0.05, y: 3.22, w: 0.8, h: 0,
        line: { color: COLORS.accent, width: 1.5, endArrowType: "arrow" },
      });
      slide.addText(step.sub, {
        x: xPos, y: 2.72, w: 0.9, h: 0.42,
        fontSize: 7.5, color: COLORS.textMuted, fontFace: FONTS.code, align: "center",
      });
      xPos += 0.9;
    } else {
      const boxW = 2.4;
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 2.72, w: boxW, h: 0.98, rectRadius: 0.08,
        fill: { color: COLORS.bg2 }, line: { color: step.color, width: 1.5 },
      });
      slide.addText(`${step.emoji} ${step.name}`, {
        x: xPos + 0.1, y: 2.74, w: boxW - 0.2, h: 0.3,
        fontSize: 10.5, bold: true, color: step.color, fontFace: FONTS.body, valign: "middle",
      });
      slide.addText(step.sub, {
        x: xPos + 0.1, y: 3.06, w: boxW - 0.2, h: 0.58,
        fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.code,
      });
      xPos += boxW;
    }
  });

  // Key points
  const keyPoints = [
    { icon: "📌", text: "traceparent header is injected automatically by OTel SDK middleware" },
    { icon: "🔗", text: "Even async queues (Kafka, SQS) can propagate context via message metadata" },
  ];
  keyPoints.forEach((kp, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: 3.86 + i * 0.48, w: 9.4, h: 0.38, rectRadius: 0.06,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.5 },
    });
    slide.addText(`${kp.icon}  ${kp.text}`, {
      x: 0.5, y: 3.86 + i * 0.48, w: 9.0, h: 0.38,
      fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, { y: 5.08, text: "Context propagation is the glue that connects spans into a full trace — without it every service sees an isolated request" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 124 — Tracing in Monolith vs Distributed
// ─────────────────────────────────────────────────────────────────────────────
function slide124(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Tracing in Monolith vs Distributed",
    partLabel: label(124),
    accentColor: ACCENT,
    complexity: 5,
  });

  addCompareHeading(slide, pres, { x: 0.3,  y: 0.65, w: 4.5, label: "🏢 Monolith", type: "good" });
  addCompareHeading(slide, pres, { x: 5.2,  y: 0.65, w: 4.5, label: "🕸️ Distributed", type: "bad" });

  const leftItems = [
    { emoji: "✅", title: "Single process", sub: "All spans in one runtime — no network hops" },
    { emoji: "✅", title: "Function call tracing", sub: "Instrument methods directly with spans" },
    { emoji: "✅", title: "Easy to instrument", sub: "One OTel SDK, one exporter config" },
    { emoji: "✅", title: "Linear trace", sub: "Spans follow call stack order" },
  ];
  const rightItems = [
    { emoji: "⚠️", title: "Every service needs SDK", sub: "Inconsistent instrumentation = broken traces" },
    { emoji: "⚠️", title: "Async gaps", sub: "Queues, events break parent-child links" },
    { emoji: "⚠️", title: "HTTP/gRPC boundaries", sub: "Must propagate traceparent explicitly" },
    { emoji: "⚠️", title: "Fan-out complexity", sub: "One request → 20 spans across 8 services" },
  ];

  leftItems.forEach((item, i) => {
    addCompareItem(slide, pres, { x: 0.3, y: 1.15 + i * 0.62, w: 4.5, emoji: item.emoji, title: item.title, sub: item.sub, type: "good" });
  });
  rightItems.forEach((item, i) => {
    addCompareItem(slide, pres, { x: 5.2, y: 1.15 + i * 0.62, w: 4.5, emoji: item.emoji, title: item.title, sub: item.sub, type: "warning" });
  });

  addTipBar(slide, pres, { y: 5.08, text: "即使是 Monolith，加入 tracing 仍能發現慢查詢、N+1 等效能問題 — 不只是分散式系統的工具" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 125 — OpenTelemetry: The Standard
// ─────────────────────────────────────────────────────────────────────────────
function slide125(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "OpenTelemetry: The Standard",
    partLabel: label(125),
    accentColor: ACCENT,
    complexity: 6,
  });

  // OTel intro badge
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.5 },
  });
  slide.addText("OpenTelemetry (OTel) — vendor-neutral observability standard, hosted by CNCF", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 11, bold: true, color: ACCENT, fontFace: FONTS.body, valign: "middle",
  });

  // Three components
  addThreeCols(slide, pres, [
    {
      title: "📐 API",
      icon: "",
      color: COLORS.accent,
      items: [
        { text: "Instrument your code", sub: "Create spans, record metrics" },
        { text: "Vendor-neutral interfaces" },
        { text: "No implementation details" },
        { text: "Works with any SDK" },
      ],
    },
    {
      title: "⚙️ SDK",
      icon: "",
      color: COLORS.success,
      items: [
        { text: "Implements the API", sub: "Language-specific library" },
        { text: "Handles batching & retry" },
        { text: "Sampling configuration" },
        { text: "Auto-instrumentation" },
      ],
    },
    {
      title: "📡 Collector",
      icon: "",
      color: ACCENT,
      items: [
        { text: "Receives telemetry data", sub: "OTLP / Jaeger / Zipkin" },
        { text: "Processes and enriches" },
        { text: "Exports to backends" },
        { text: "Runs as sidecar or agent" },
      ],
    },
  ], { y: 1.14, h: 2.85 });

  // Three pillars coverage
  slide.addText("OTel covers all three observability pillars:", {
    x: 0.3, y: 4.08, w: 4.0, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  const pillars = [
    { label: "📊 Metrics", color: COLORS.success },
    { label: "📋 Logs", color: COLORS.warning },
    { label: "🔍 Traces", color: ACCENT },
  ];
  pillars.forEach((p, i) => {
    const x = 0.3 + i * 3.15;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 4.4, w: 2.9, h: 0.38, rectRadius: 0.07,
      fill: { color: COLORS.bg2 }, line: { color: p.color, width: 1.5 },
    });
    slide.addText(p.label, {
      x, y: 4.4, w: 2.9, h: 0.38,
      fontSize: 11, bold: true, color: p.color, fontFace: FONTS.body, align: "center", valign: "middle",
    });
  });

  addTipBar(slide, pres, { y: 5.08, text: "OTel 2023 年已達 GA 穩定版 — 替換掉 OpenCensus、Jaeger client、Zipkin SDK 等舊標準" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 126 — OTel Collector Architecture
// ─────────────────────────────────────────────────────────────────────────────
function slide126(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "OTel Collector Architecture",
    partLabel: label(126),
    accentColor: ACCENT,
    complexity: 7,
  });

  // Pipeline header
  slide.addText("Pipeline: Receivers → Processors → Exporters", {
    x: 0.3, y: 0.65, w: 9.4, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });

  // Receivers column
  const colH = 3.35;
  const colY = 1.05;

  const sections = [
    {
      title: "📥 Receivers", color: COLORS.success, x: 0.25,
      items: ["OTLP (gRPC/HTTP)", "Jaeger", "Zipkin", "Prometheus", "Kafka", "Cloud providers"],
    },
    {
      title: "⚙️ Processors", color: COLORS.warning, x: 3.55,
      items: ["batch (buffer spans)", "filter (drop noise)", "attribute enrichment", "memory_limiter", "tail_sampling", "resource detection"],
    },
    {
      title: "📤 Exporters", color: COLORS.accent, x: 6.85,
      items: ["Jaeger", "Zipkin", "OTLP (to Tempo)", "Prometheus", "Loki", "Cloud (X-Ray, GCP)"],
    },
  ];

  sections.forEach((sec) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: sec.x, y: colY, w: 3.0, h: colH, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: sec.color, width: 1.5 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x: sec.x, y: colY, w: 3.0, h: 0.45,
      fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0 },
    });
    slide.addText(sec.title, {
      x: sec.x + 0.1, y: colY, w: 2.8, h: 0.45,
      fontSize: 11, bold: true, color: sec.color, fontFace: FONTS.body, valign: "middle",
    });
    sec.items.forEach((item, j) => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: sec.x + 0.12, y: colY + 0.55 + j * 0.45, w: 2.72, h: 0.36, rectRadius: 0.05,
        fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.5 },
      });
      slide.addText(item, {
        x: sec.x + 0.22, y: colY + 0.55 + j * 0.45, w: 2.52, h: 0.36,
        fontSize: 9.5, color: COLORS.text, fontFace: FONTS.code, valign: "middle",
      });
    });
  });

  // Arrows between columns
  addHArrow(slide, pres, { x: 3.25, y: colY + colH / 2 - 0.2, w: 0.3, color: ACCENT });
  addHArrow(slide, pres, { x: 6.55, y: colY + colH / 2 - 0.2, w: 0.3, color: ACCENT });

  addTipBar(slide, pres, { y: 4.5, text: "Collector 可以 fan-out：同時把 traces 送到 Jaeger AND Tempo，方便評估後端切換" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 127 — Jaeger: Distributed Tracing Backend
// ─────────────────────────────────────────────────────────────────────────────
function slide127(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Jaeger: Distributed Tracing Backend",
    partLabel: label(127),
    accentColor: ACCENT,
    complexity: 7,
  });

  // Jaeger components
  slide.addText("Jaeger Components:", {
    x: 0.3, y: 0.65, w: 4.0, h: 0.28,
    fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });

  const components = [
    {
      emoji: "🔌", name: "jaeger-agent", color: COLORS.success,
      desc: "Sidecar / DaemonSet\nCollects spans via UDP\nForwards to collector",
    },
    {
      emoji: "📦", name: "jaeger-collector", color: COLORS.accent,
      desc: "Validates spans\nWrites to storage\nSupports OTLP + Jaeger proto",
    },
    {
      emoji: "🔍", name: "jaeger-query + UI", color: ACCENT,
      desc: "REST API + Web UI\nSearch by traceId/service\nVisualise trace waterfalls",
    },
    {
      emoji: "🗄️", name: "Storage", color: COLORS.database,
      desc: "Elasticsearch (recommended)\nor Cassandra, Badger\nTTL-based retention",
    },
  ];

  const boxW = 2.1;
  const boxH = 1.5;
  components.forEach((comp, i) => {
    const x = 0.25 + i * (boxW + 0.15);
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 1.0, w: boxW, h: boxH, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: comp.color, width: 1.5 },
    });
    slide.addText(comp.emoji, {
      x, y: 1.04, w: boxW, h: 0.46,
      fontSize: 22, align: "center", valign: "middle",
    });
    slide.addText(comp.name, {
      x: x + 0.08, y: 1.52, w: boxW - 0.16, h: 0.28,
      fontSize: 9.5, bold: true, color: comp.color, fontFace: FONTS.code, align: "center",
    });
    slide.addText(comp.desc, {
      x: x + 0.1, y: 1.82, w: boxW - 0.2, h: 0.62,
      fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
    if (i < components.length - 1) {
      addHArrow(slide, pres, { x: x + boxW, y: 1.6, w: 0.15, color: COLORS.border });
    }
  });

  // Architecture flow
  addZoneBorder(slide, pres, { x: 0.25, y: 0.92, w: 9.5, h: 1.68, color: COLORS.border, label: "Jaeger Deployment" });

  // Deployment modes
  slide.addText("Deployment Modes:", {
    x: 0.3, y: 2.75, w: 4.0, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  const modes = [
    { title: "All-in-One", sub: "Dev/testing — single binary, in-memory storage, quick start" },
    { title: "Production", sub: "Separate agent + collector + storage — horizontally scalable" },
    { title: "Kubernetes Operator", sub: "jaeger-operator CRD manages lifecycle and config" },
  ];
  modes.forEach((mode, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: 3.1 + i * 0.48, w: 9.4, h: 0.4, rectRadius: 0.06,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.5 },
    });
    slide.addText(`▶  ${mode.title}`, {
      x: 0.5, y: 3.1 + i * 0.48, w: 2.2, h: 0.4,
      fontSize: 10, bold: true, color: ACCENT, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(mode.sub, {
      x: 2.8, y: 3.1 + i * 0.48, w: 6.8, h: 0.4,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, { y: 4.62, text: "Grafana Tempo 是更輕量的替代方案 — 相容 Jaeger UI，不需要 Elasticsearch" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 128 — Sampling Strategies
// ─────────────────────────────────────────────────────────────────────────────
function slide128(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Sampling Strategies",
    partLabel: label(128),
    accentColor: ACCENT,
    complexity: 7,
  });

  // Problem statement
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.4, rectRadius: 0.07,
    fill: { color: COLORS.cardDanger }, line: { color: COLORS.danger, width: 0.75 },
  });
  slide.addText("Problem: tracing 100% of requests is too expensive — too much data, too much storage, too much CPU", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  // Sampling strategies
  const strategies = [
    {
      icon: "⚡", title: "Head Sampling", color: COLORS.accent,
      desc: "Decision made at the START of the request, before processing begins",
      pros: "Simple, low overhead",
      cons: "Misses rare errors (already decided to drop before error occurs)",
    },
    {
      icon: "🧠", title: "Tail Sampling", color: COLORS.success,
      desc: "Decision made AFTER the trace is complete — can examine full context",
      pros: "Always keeps error traces",
      cons: "Complex — needs to buffer spans in memory",
    },
    {
      icon: "🎲", title: "Probability Sampling", color: ACCENT,
      desc: "Sample X% of requests randomly (e.g., 1% = 1 in 100)",
      pros: "Predictable storage costs",
      cons: "May drop important edge cases",
    },
    {
      icon: "🚦", title: "Rate Limiting", color: COLORS.warning,
      desc: "Allow maximum N traces per second regardless of traffic volume",
      pros: "Bounded cost under load",
      cons: "May drop data during traffic spikes",
    },
  ];

  const boxW = 4.55;
  strategies.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.25 + col * (boxW + 0.3);
    const y = 1.12 + row * 1.35;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: boxW, h: 1.25, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: s.color, width: 1.5 },
    });
    slide.addText(`${s.icon}  ${s.title}`, {
      x: x + 0.1, y: y + 0.04, w: boxW - 0.2, h: 0.32,
      fontSize: 11, bold: true, color: s.color, fontFace: FONTS.body,
    });
    slide.addText(s.desc, {
      x: x + 0.1, y: y + 0.35, w: boxW - 0.2, h: 0.3,
      fontSize: 9, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(`✅ ${s.pros}`, {
      x: x + 0.1, y: y + 0.65, w: (boxW - 0.3) / 2, h: 0.52,
      fontSize: 8.5, color: COLORS.success, fontFace: FONTS.body,
    });
    slide.addText(`⚠️ ${s.cons}`, {
      x: x + 0.1 + (boxW - 0.3) / 2, y: y + 0.65, w: (boxW - 0.3) / 2, h: 0.52,
      fontSize: 8.5, color: COLORS.warning, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, { y: 3.9, text: "生產環境通常使用 1-10% head sampling，搭配 tail sampling 保留所有錯誤" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 129 — Instrumenting Your Code with OTel SDK
// ─────────────────────────────────────────────────────────────────────────────
function slide129(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Instrumenting Your Code with OTel SDK",
    partLabel: label(129),
    accentColor: ACCENT,
    complexity: 6,
  });

  // Left: code card
  addCodeCard(slide, pres, {
    x: 0.25, y: 0.72, w: 5.5, h: 2.9,
    language: "Python / FastAPI",
    code:
      "from opentelemetry import trace\n" +
      "from opentelemetry.sdk.trace import TracerProvider\n" +
      "from opentelemetry.sdk.trace.export import (\n" +
      "    BatchSpanProcessor)\n" +
      "from opentelemetry.exporter.otlp.proto.grpc\\\n" +
      "    .trace_exporter import OTLPSpanExporter\n" +
      "\n" +
      "provider = TracerProvider()\n" +
      "provider.add_span_processor(\n" +
      "    BatchSpanProcessor(OTLPSpanExporter()))\n" +
      "trace.set_tracer_provider(provider)\n" +
      "\n" +
      "tracer = trace.get_tracer(__name__)\n" +
      "\n" +
      "with tracer.start_as_current_span(\"process-order\") as span:\n" +
      "    span.set_attribute(\"order.id\", order_id)\n" +
      "    result = process(order)",
  });

  // Right: key concepts
  const rightItems = [
    {
      icon: "🤖", title: "Auto-Instrumentation", color: COLORS.success,
      desc: "Zero code change for popular frameworks (FastAPI, Django, Flask, SQLAlchemy, requests, httpx)",
      cmd: "opentelemetry-instrument python app.py",
    },
    {
      icon: "✋", title: "Manual Spans", color: ACCENT,
      desc: "Add business context: set_attribute(), add_event(), record_exception()",
    },
    {
      icon: "🏷️", title: "Span Attributes", color: COLORS.warning,
      desc: "Semantic conventions: http.method, db.statement, net.peer.ip",
    },
  ];

  rightItems.forEach((item, i) => {
    const y = 0.72 + i * 0.94;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.9, y, w: 3.85, h: 0.84, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: item.color, width: 1.2 },
    });
    slide.addText(`${item.icon}  ${item.title}`, {
      x: 6.0, y: y + 0.04, w: 3.6, h: 0.26,
      fontSize: 10.5, bold: true, color: item.color, fontFace: FONTS.body,
    });
    slide.addText(item.desc, {
      x: 6.0, y: y + 0.3, w: 3.6, h: 0.36,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
    if (item.cmd) {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 5.9, y: y + 0.66, w: 3.85, h: 0.22, rectRadius: 0.04,
        fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.5 },
      });
      slide.addText(`$ ${item.cmd}`, {
        x: 6.0, y: y + 0.67, w: 3.65, h: 0.2,
        fontSize: 7.5, color: COLORS.success, fontFace: FONTS.code,
      });
    }
  });

  // Supported languages row
  slide.addText("SDK support: Python · Go · Java · Node.js · .NET · Ruby · PHP · Rust · Swift", {
    x: 0.3, y: 3.75, w: 9.4, h: 0.28,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, italic: true, align: "center",
  });

  addTipBar(slide, pres, { y: 4.12, text: "Auto-instrumentation: zero code change — just set OTEL_EXPORTER_OTLP_ENDPOINT env var and run" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 130 — Tracing in Kubernetes
// ─────────────────────────────────────────────────────────────────────────────
function slide130(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Tracing in Kubernetes",
    partLabel: label(130),
    accentColor: ACCENT,
    complexity: 8,
  });

  // Three deployment options
  const options = [
    {
      icon: "🖥️", num: "1", title: "DaemonSet Collector",
      color: COLORS.success,
      items: [
        "One OTel Collector per Node",
        "Apps send to localhost:4317",
        "Lower resource overhead",
        "Shared across all pods on node",
        "Best for: high-density clusters",
      ],
    },
    {
      icon: "📦", num: "2", title: "Sidecar Collector",
      color: COLORS.warning,
      items: [
        "One Collector per Pod",
        "Full isolation per service",
        "Per-service config possible",
        "Higher resource cost",
        "Best for: sensitive workloads",
      ],
    },
    {
      icon: "🏢", num: "3", title: "Central Collector",
      color: COLORS.accent,
      items: [
        "All apps send to one Deployment",
        "Easy to manage / update",
        "Single point of failure risk",
        "Scale with HPA",
        "Best for: small/medium clusters",
      ],
    },
  ];

  const boxW = 3.0;
  const boxH = 3.0;
  options.forEach((opt, i) => {
    const x = 0.25 + i * (boxW + 0.25);
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 0.62, w: boxW, h: boxH, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: opt.color, width: 1.5 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x, y: 0.62, w: boxW, h: 0.5,
      fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0 },
    });
    slide.addText(`${opt.num}. ${opt.icon}  ${opt.title}`, {
      x: x + 0.1, y: 0.62, w: boxW - 0.2, h: 0.5,
      fontSize: 10.5, bold: true, color: opt.color, fontFace: FONTS.body, valign: "middle",
    });
    opt.items.forEach((item, j) => {
      slide.addShape(pres.ShapeType.ellipse, {
        x: x + 0.15, y: 1.26 + j * 0.44 + 0.06, w: 0.1, h: 0.1,
        fill: { color: opt.color }, line: { color: opt.color, width: 0 },
      });
      slide.addText(item, {
        x: x + 0.32, y: 1.24 + j * 0.44, w: boxW - 0.44, h: 0.38,
        fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
      });
    });
  });

  // K8s zone context
  addZoneBorder(slide, pres, { x: 0.18, y: 0.55, w: 9.62, h: 3.14, color: ACCENT, label: "Kubernetes Cluster" });

  // Config tip
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.82, w: 9.4, h: 0.48, rectRadius: 0.07,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addText("K8s Config: set OTEL_EXPORTER_OTLP_ENDPOINT via ConfigMap → all pods pick up collector address automatically", {
    x: 0.5, y: 3.82, w: 9.0, h: 0.48,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle", italic: true,
  });

  addTipBar(slide, pres, { y: 4.42, text: "OTel Operator for K8s 可以自動注入 sidecar instrumentation — 無需修改 Deployment 定義" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 131 — Service Mesh Auto-Tracing
// ─────────────────────────────────────────────────────────────────────────────
function slide131(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Service Mesh Auto-Tracing",
    partLabel: label(131),
    accentColor: ACCENT,
    complexity: 8,
  });

  // Intro
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.07,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.0 },
  });
  slide.addText("Istio / Envoy: automatically injects trace headers at the proxy layer — no SDK changes needed for basic traces", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });

  // Flow diagram
  slide.addText("Traffic flow with Envoy sidecar tracing:", {
    x: 0.3, y: 1.14, w: 5.0, h: 0.26,
    fontSize: 9.5, bold: true, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  const flowSteps = [
    { label: "Client", sub: "sends request", color: COLORS.client, emoji: "👤" },
    { label: "Envoy A\n(inbound)", sub: "injects\ntraceparent", color: COLORS.warning, emoji: "🔀" },
    { label: "App Pod A", sub: "processes\nrequest", color: COLORS.frontend, emoji: "🅰️" },
    { label: "Envoy A\n(outbound)", sub: "forwards\nheader", color: COLORS.warning, emoji: "🔀" },
    { label: "Envoy B\n(inbound)", sub: "reads\ntraceparent", color: COLORS.success, emoji: "🔀" },
    { label: "App Pod B", sub: "processes\nrequest", color: COLORS.backend, emoji: "🅱️" },
  ];
  const fW = 1.4;
  const fH = 1.1;
  const fY = 1.46;
  const totalFlowW = flowSteps.length * fW + (flowSteps.length - 1) * 0.3;
  const fStartX = (W - totalFlowW) / 2;

  flowSteps.forEach((step, i) => {
    const x = fStartX + i * (fW + 0.3);
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: fY, w: fW, h: fH, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: step.color, width: 1.5 },
    });
    slide.addText(step.emoji, {
      x, y: fY + 0.04, w: fW, h: 0.38,
      fontSize: 18, align: "center", valign: "middle",
    });
    slide.addText(step.label, {
      x, y: fY + 0.44, w: fW, h: 0.34,
      fontSize: 8, bold: true, color: step.color, fontFace: FONTS.body, align: "center",
    });
    slide.addText(step.sub, {
      x, y: fY + 0.78, w: fW, h: 0.28,
      fontSize: 7, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
    if (i < flowSteps.length - 1) {
      addHArrow(slide, pres, { x: x + fW, y: fY + 0.35, w: 0.3, color: ACCENT });
    }
  });

  // Pros and limitations
  const items = [
    { type: "good",    emoji: "✅", title: "Zero app code change for inter-service traces" },
    { type: "good",    emoji: "✅", title: "Works for any language / framework automatically" },
    { type: "warning", emoji: "⚠️", title: "App must forward trace headers to link parent-child spans" },
    { type: "bad",     emoji: "❌", title: "Cannot see inside app logic — no DB query spans, no business metrics" },
  ];
  items.forEach((item, i) => {
    addCompareItem(slide, pres, {
      x: 0.3, y: 2.72 + i * 0.52, w: 9.4,
      emoji: item.emoji, title: item.title, type: item.type,
    });
  });

  addTipBar(slide, pres, { y: 5.0, text: "Best practice: Istio for inter-service traces + OTel SDK for in-app spans = complete observability" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 132 — Connecting Traces to Logs and Metrics
// ─────────────────────────────────────────────────────────────────────────────
function slide132(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Connecting Traces to Logs and Metrics",
    partLabel: label(132),
    accentColor: ACCENT,
    complexity: 8,
  });

  // Key technique
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.07,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.0 },
  });
  slide.addText("Key: inject traceId + spanId into every log entry → correlation across all three pillars", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });

  // Grafana stack panels
  const panels = [
    {
      title: "📊 Prometheus\n(Metrics)", color: COLORS.success, x: 0.25,
      items: ["CPU spike at 14:32", "Error rate 5% → alert fires", "Click: \"Explore\" in Grafana"],
    },
    {
      title: "🔍 Grafana Tempo\n(Traces)", color: ACCENT, x: 3.55,
      items: ["Find trace by time range", "See slow span: order-svc 3.2s", "Click: traceId → Loki"],
    },
    {
      title: "📋 Loki\n(Logs)", color: COLORS.warning, x: 6.85,
      items: ["Filter by traceId=abc123", "See exact error stacktrace", "Root cause identified ✅"],
    },
  ];

  panels.forEach((panel) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: panel.x, y: 1.14, w: 3.0, h: 2.35, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: panel.color, width: 1.5 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x: panel.x, y: 1.14, w: 3.0, h: 0.5,
      fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0 },
    });
    slide.addText(panel.title, {
      x: panel.x + 0.1, y: 1.14, w: 2.8, h: 0.5,
      fontSize: 10, bold: true, color: panel.color, fontFace: FONTS.body, valign: "middle",
    });
    panel.items.forEach((item, j) => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: panel.x + 0.1, y: 1.74 + j * 0.52, w: 2.76, h: 0.44, rectRadius: 0.06,
        fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.5 },
      });
      slide.addText(item, {
        x: panel.x + 0.2, y: 1.74 + j * 0.52, w: 2.56, h: 0.44,
        fontSize: 8.5, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
      });
    });
    if (panel.x < 6.5) {
      addHArrow(slide, pres, { x: panel.x + 3.0, y: 2.26, w: 0.55, color: COLORS.accent, label: "click" });
    }
  });

  // Log injection example
  addCodeCard(slide, pres, {
    x: 0.3, y: 3.6, w: 9.4, h: 0.72,
    language: "Structured Log with Trace Context",
    code: '{"timestamp":"2024-01-15T14:32:01Z","level":"ERROR","traceId":"4bf92f3577b34da6","spanId":"00f067aa0ba902b7","service":"order-svc","msg":"payment timeout after 3000ms"}',
  });

  addTipBar(slide, pres, { y: 4.44, text: "Correlation ID 貫穿三個 pillars 是 Observability 的核心能力" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 133 — Tracing Cost and Overhead
// ─────────────────────────────────────────────────────────────────────────────
function slide133(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Tracing Cost and Overhead",
    partLabel: label(133),
    accentColor: ACCENT,
    complexity: 6,
  });

  // Overhead metrics
  const overheadItems = [
    { icon: "⚙️", label: "SDK CPU Overhead", value: "1–3%", color: COLORS.success, sub: "For typical instrumented services" },
    { icon: "💾", label: "Span Size", value: "~2 KB", color: COLORS.accent, sub: "Attributes + events + links" },
    { icon: "📡", label: "Spans per Request", value: "5–20", color: ACCENT, sub: "Typical microservice request" },
    { icon: "📊", label: "Network Overhead", value: "<1%", color: COLORS.success, sub: "With batch export + compression" },
  ];

  overheadItems.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    addMetricCard(slide, pres, {
      x: 0.3 + col * 4.9, y: 0.68 + row * 1.52,
      w: 4.55, h: 1.38,
      value: item.value, label: item.label, sub: item.sub,
      color: item.color,
    });
  });

  // Cost math
  slide.addText("Cost Math Example:", {
    x: 0.3, y: 3.42, w: 3.0, h: 0.28,
    fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });

  const rows = [
    ["Sampling Rate", "Daily Volume", "Storage/day", "Storage/month"],
    ["100% (no sampling)", "1M req × 10 spans × 2KB", "~20 GB/day", "~600 GB/month"],
    ["10% sampling", "100K spans × 2KB", "~2 GB/day", "~60 GB/month"],
    ["1% sampling", "10K spans × 2KB", "~0.2 GB/day", "~6 GB/month"],
  ];

  const colWidths  = [2.3, 2.7, 2.0, 2.1];
  const rowColors  = [COLORS.bg3, COLORS.cardDanger, COLORS.cardWarn, COLORS.cardSuccess];
  const textColors = [COLORS.textMuted, COLORS.danger, COLORS.warning, COLORS.success];

  rows.forEach((row, rowIdx) => {
    let xOff = 0.3;
    row.forEach((cell, colIdx) => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: xOff, y: 3.76 + rowIdx * 0.34, w: colWidths[colIdx], h: 0.3, rectRadius: 0.04,
        fill: { color: rowColors[rowIdx] }, line: { color: COLORS.border, width: 0.3 },
      });
      slide.addText(cell, {
        x: xOff + 0.06, y: 3.76 + rowIdx * 0.34, w: colWidths[colIdx] - 0.1, h: 0.3,
        fontSize: rowIdx === 0 ? 8.5 : 8, bold: rowIdx === 0,
        color: rowIdx === 0 ? COLORS.textMuted : textColors[rowIdx],
        fontFace: rowIdx === 0 ? FONTS.body : FONTS.code, valign: "middle",
      });
      xOff += colWidths[colIdx];
    });
  });

  addTipBar(slide, pres, { y: 5.12, text: "Sampling is the #1 lever for cost control — even 10% sampling gives statistically valid performance data" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 134 — Common Tracing Anti-Patterns
// ─────────────────────────────────────────────────────────────────────────────
function slide134(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Common Tracing Anti-Patterns",
    partLabel: label(134),
    accentColor: ACCENT,
    complexity: 5,
  });

  const antiPatterns = [
    {
      icon: "💣", title: "Tracing without sampling",
      desc: "100% trace rate causes storage explosion — costs spiral out of control at scale",
      fix: "Always configure sampling from day one",
    },
    {
      icon: "🔗", title: "Missing context propagation",
      desc: "If any service drops the traceparent header, the trace splits into disconnected fragments",
      fix: "Test propagation end-to-end in staging",
    },
    {
      icon: "😊", title: "Only tracing happy paths",
      desc: "Spans only created for successful flows — errors and timeouts have no trace data",
      fix: "Always record exceptions with span.record_exception()",
    },
    {
      icon: "🏝️", title: "No correlation with logs",
      desc: "Traces exist but no traceId in logs — cannot drill from trace to root cause details",
      fix: "Inject traceId into every structured log entry",
    },
    {
      icon: "🔒", title: "Vendor lock-in",
      desc: "Using vendor-specific SDKs (X-Ray, Datadog trace) — painful to migrate later",
      fix: "Use OTel API/SDK — swap exporters without code changes",
    },
  ];

  antiPatterns.forEach((ap, i) => {
    const y = 0.62 + i * 0.88;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 9.4, h: 0.78, rectRadius: 0.08,
      fill: { color: COLORS.cardDanger }, line: { color: COLORS.danger, width: 0.75 },
    });
    slide.addText(`${ap.icon}  ${ap.title}`, {
      x: 0.5, y: y + 0.04, w: 3.5, h: 0.3,
      fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body,
    });
    slide.addText(ap.desc, {
      x: 0.5, y: y + 0.34, w: 5.5, h: 0.36,
      fontSize: 9, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.1, y: y + 0.08, w: 3.4, h: 0.6, rectRadius: 0.06,
      fill: { color: COLORS.cardSuccess }, line: { color: COLORS.success, width: 0.75 },
    });
    slide.addText(`✅ Fix: ${ap.fix}`, {
      x: 6.2, y: y + 0.08, w: 3.2, h: 0.6,
      fontSize: 8.5, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 135 — Tracing Section Summary
// ─────────────────────────────────────────────────────────────────────────────
function slide135(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Tracing Section Summary",
    partLabel: label(135),
    accentColor: ACCENT,
    complexity: 5,
  });

  addThreeCols(slide, pres, [
    {
      title: "🔍 What & Why",
      color: ACCENT,
      items: [
        { text: "Follow requests across services", sub: "traceId links every hop" },
        { text: "Spans = units of work" },
        { text: "Context propagation (W3C)" },
        { text: "Find latency & error root cause" },
      ],
    },
    {
      title: "⚙️ How (Stack)",
      color: COLORS.accent,
      items: [
        { text: "OTel SDK", sub: "instrument app code" },
        { text: "OTel Collector", sub: "receive & export" },
        { text: "Jaeger / Tempo", sub: "store & visualise" },
        { text: "Grafana for correlation" },
      ],
    },
    {
      title: "🛠️ Operations",
      color: COLORS.success,
      items: [
        { text: "Sampling: 1-10% head", sub: "+ tail for all errors" },
        { text: "K8s: DaemonSet Collector" },
        { text: "Correlate with logs/metrics" },
        { text: "OTel avoids vendor lock-in" },
      ],
    },
  ], { y: HEADER_H + 0.1, h: 3.8 });

  // Next section preview
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.56, w: 9.4, h: 0.55, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.2 },
  });
  slide.addText("▶  Next: SRE Practices — error budgets, SLOs, incident response, and integrating all three observability pillars", {
    x: 0.5, y: 4.56, w: 9.0, h: 0.55,
    fontSize: 10.5, bold: true, color: ACCENT, fontFace: FONTS.body, valign: "middle",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.defineLayout({ name: "WIDESCREEN", width: 10, height: 5.5 });
  pres.layout = "WIDESCREEN";

  slide121(pres);
  slide122(pres);
  slide123(pres);
  slide124(pres);
  slide125(pres);
  slide126(pres);
  slide127(pres);
  slide128(pres);
  slide129(pres);
  slide130(pres);
  slide131(pres);
  slide132(pres);
  slide133(pres);
  slide134(pres);
  slide135(pres);

  if (!fs.existsSync("output")) fs.mkdirSync("output");
  await pres.writeFile({ fileName: "output/part9_tracing.pptx" });
  console.log("✅  output/part9_tracing.pptx generated successfully");
}

if (require.main === module) { main(); }
