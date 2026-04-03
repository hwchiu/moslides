// src/part9_tracing.js
// Part 9: Distributed Tracing (Slides 121–135)

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
// Slide 121 — Distributed Tracing: Why We Need It
// ─────────────────────────────────────────────────────────────────────────────
function slide121(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Distributed Tracing: Why We Need It",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 4,
  });

  // Problem statement
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.52, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.5 },
  });
  slide.addText("Problem: In distributed systems, a single request traverses 10+ services — every hop is a potential failure point", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.52,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });

  // Request flow diagram (User → Frontend → API Gateway → Auth → Order → Inventory → DB)
  const nodes = [
    { emoji: "👤", name: "User Request",    x: 0.2 },
    { emoji: "🖥️", name: "Frontend",        x: 1.55 },
    { emoji: "🔀", name: "API Gateway",     x: 2.9 },
    { emoji: "🔐", name: "Auth Service",    x: 4.25 },
    { emoji: "📦", name: "Order Service",   x: 5.6 },
    { emoji: "🏭", name: "Inventory Svc",   x: 6.95 },
    { emoji: "🗄️", name: "Database",        x: 8.3 },
  ];

  nodes.forEach((n) => {
    addNodeCard(slide, pres, {
      x: n.x, y: 1.28, w: 1.28, h: 1.0,
      emoji: n.emoji, name: n.name,
      borderColor: COLORS.infra,
    });
  });

  // Arrows connecting services
  for (let i = 0; i < nodes.length - 1; i++) {
    addHArrow(slide, pres, {
      x: nodes[i].x + 1.28, y: 1.58, w: 0.27,
      color: COLORS.infra,
    });
  }

  // Explanation text (challenges without tracing)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.42, w: 9.4, h: 0.55, rectRadius: 0.08,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addText("Without tracing: you can see errors, but have no way to trace which services a request passed through or where it failed", {
    x: 0.5, y: 2.42, w: 9.0, h: 0.55,
    fontSize: 10.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  // Pain points
  const points = [
    { text: "🔍 Cannot identify which service causes latency", fill: COLORS.bg2, border: COLORS.warning },
    { text: "💥 Error propagation path is unclear",            fill: COLORS.cardDanger, border: COLORS.danger },
    { text: "🔗 Cross-service causality cannot be reconstructed", fill: COLORS.bg2, border: COLORS.infra },
  ];
  points.forEach((p, i) => {
    const x = 0.3 + i * 3.17;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 3.1, w: 3.0, h: 0.52, rectRadius: 0.08,
      fill: { color: p.fill },
      line: { color: p.border, width: 1.2 },
    });
    slide.addText(p.text, {
      x: x + 0.15, y: 3.1, w: 2.7, h: 0.52,
      fontSize: 10.5, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addAlertBar(slide, pres, {
    y: 3.76,
    message: "A request failed, but you have no idea which service caused the issue",
  });

  addTipBar(slide, pres, {
    y: 5.0,
    text: "Distributed tracing = building a complete journey map for every request, leaving no issue hidden",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 122 — Trace, Span & Context: Core Concepts
// ─────────────────────────────────────────────────────────────────────────────
function slide122(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Trace, Span & Context: Core Concepts",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 5,
  });

  // Left: Three core definition cards
  const defs = [
    {
      icon: "🗺️", title: "Trace",
      color: COLORS.infra,
      desc: "The complete journey of a request",
      meta: "Has a unique traceId\nSpans across all service boundaries",
    },
    {
      icon: "📐", title: "Span",
      color: COLORS.accent,
      desc: "A single unit of work",
      meta: "spanId + parentSpanId\nStart/end time + attributes",
    },
    {
      icon: "🏷️", title: "Context",
      color: COLORS.success,
      desc: "Metadata propagated across service boundaries",
      meta: "Propagated via HTTP headers\nW3C Trace Context standard",
    },
  ];

  defs.forEach((d, i) => {
    const y = 0.65 + i * 1.52;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 4.3, h: 1.38, rectRadius: 0.1,
      fill: { color: COLORS.bg2 },
      line: { color: d.color, width: 1.5 },
    });
    slide.addText(d.icon, {
      x: 0.3, y: y + 0.06, w: 0.8, h: 1.26,
      fontSize: 26, align: "center", valign: "middle",
    });
    slide.addText(d.title, {
      x: 1.18, y: y + 0.1, w: 3.3, h: 0.36,
      fontSize: 14, bold: true, color: d.color, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(d.desc, {
      x: 1.18, y: y + 0.46, w: 3.3, h: 0.3,
      fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(d.meta, {
      x: 1.18, y: y + 0.76, w: 3.3, h: 0.54,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.code,
    });
  });

  // Right: Parent-child Span hierarchy visualization
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.85, y: 0.65, w: 4.85, h: 4.62, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.2 },
  });
  slide.addText("Parent-Child Span Hierarchy", {
    x: 4.95, y: 0.72, w: 4.65, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.infra, fontFace: FONTS.body, align: "center",
  });

  // Root Span
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.05, y: 1.12, w: 4.55, h: 0.4, rectRadius: 0.06,
    fill: { color: "2D1F5E" },
    line: { color: COLORS.infra, width: 1.2 },
  });
  slide.addText("Span: HTTP POST /checkout  (traceId: abc-123)", {
    x: 5.15, y: 1.12, w: 4.35, h: 0.4,
    fontSize: 9.5, bold: true, color: COLORS.infra, fontFace: FONTS.code, valign: "middle",
  });

  // Child Span: Auth
  slide.addShape(pres.ShapeType.line, {
    x: 5.45, y: 1.52, w: 0.01, h: 0.25,
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.65, y: 1.77, w: 3.65, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.accent, width: 1.0 },
  });
  slide.addText("Span: Auth Service Validate Token  (parentId: root)", {
    x: 5.75, y: 1.77, w: 3.45, h: 0.38,
    fontSize: 9, color: COLORS.accent, fontFace: FONTS.code, valign: "middle",
  });

  // Child Span: Order
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.65, y: 2.25, w: 3.65, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.success, width: 1.0 },
  });
  slide.addText("Span: Order Service Create Order  (parentId: root)", {
    x: 5.75, y: 2.25, w: 3.45, h: 0.38,
    fontSize: 9, color: COLORS.success, fontFace: FONTS.code, valign: "middle",
  });

  // Grandchild Span: Database
  slide.addShape(pres.ShapeType.line, {
    x: 5.95, y: 2.63, w: 0.01, h: 0.25,
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.15, y: 2.88, w: 3.15, h: 0.36, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.database, width: 1.0 },
  });
  slide.addText("Span: DB INSERT orders  (parentId: order-span)", {
    x: 6.25, y: 2.88, w: 2.95, h: 0.36,
    fontSize: 9, color: COLORS.database, fontFace: FONTS.code, valign: "middle",
  });

  // Child Span: Inventory
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.65, y: 3.35, w: 3.65, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("Span: Inventory Service Deduct Stock  (parentId: root)", {
    x: 5.75, y: 3.35, w: 3.45, h: 0.38,
    fontSize: 9, color: COLORS.warning, fontFace: FONTS.code, valign: "middle",
  });

  // Timeline
  slide.addShape(pres.ShapeType.line, {
    x: 5.05, y: 4.12, w: 4.55, h: 0.01,
    line: { color: COLORS.border, width: 0.75, dashType: "dash" },
  });
  slide.addText("← Timeline →    Total Duration: 245ms", {
    x: 5.05, y: 4.18, w: 4.55, h: 0.25,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.code, align: "center",
  });

  addTipBar(slide, pres, {
    y: 5.0,
    text: "Each Span records start time, end time, status code, and tag attributes — fully reconstructing the execution details across services",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 123 — Context Propagation
// ─────────────────────────────────────────────────────────────────────────────
function slide123(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Context Propagation",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 6,
  });

  // W3C standard description
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.5, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.5 },
  });
  slide.addText("W3C Trace Context Standard  ·  HTTP Header: traceparent", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.5,
    fontSize: 12, bold: true, color: COLORS.infra, fontFace: FONTS.body, valign: "middle",
  });

  // traceparent format (code card)
  addCodeCard(slide, pres, {
    x: 0.3, y: 1.28, w: 9.4, h: 1.1,
    language: "traceparent Header Format",
    code: "traceparent: 00-{traceId(32-hex-chars)}-{parentSpanId(16-hex-chars)}-{flags(01=sampled,00=not sampled)}\n\n# Example\ntraceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  });

  // Propagation flow diagram title
  slide.addText("Cross-Service Propagation Flow", {
    x: 0.3, y: 2.5, w: 9.4, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });

  // Service A
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.88, w: 2.8, h: 1.52, rectRadius: 0.1,
    fill: { color: "1A1F2E" },
    line: { color: COLORS.accent, width: 1.5 },
  });
  slide.addText("Service A (Caller)", {
    x: 0.4, y: 2.92, w: 2.6, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.accent, fontFace: FONTS.body, align: "center",
  });
  slide.addText("1. Create root Span\n2. Set traceparent header\n3. Send HTTP request", {
    x: 0.5, y: 3.26, w: 2.4, h: 0.95,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Transfer arrow
  addHArrow(slide, pres, {
    x: 3.1, y: 3.44, w: 1.4,
    color: COLORS.infra,
  });
  slide.addText("HTTP Request\n+ traceparent", {
    x: 3.05, y: 3.02, w: 1.55, h: 0.4,
    fontSize: 8.5, color: COLORS.infra, fontFace: FONTS.code, align: "center",
  });

  // Service B
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.55, y: 2.88, w: 2.8, h: 1.52, rectRadius: 0.1,
    fill: { color: "1A2E1A" },
    line: { color: COLORS.success, width: 1.5 },
  });
  slide.addText("Service B (Callee)", {
    x: 4.65, y: 2.92, w: 2.6, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.success, fontFace: FONTS.body, align: "center",
  });
  slide.addText("1. Read traceparent header\n2. Parse traceId + parentSpanId\n3. Create child Span", {
    x: 4.75, y: 3.26, w: 2.4, h: 0.95,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Continue propagation dashed arrow
  addHArrow(slide, pres, {
    x: 7.35, y: 3.44, w: 1.2,
    color: COLORS.border,
  });
  slide.addText("Continue\nto Service C...", {
    x: 7.3, y: 3.02, w: 1.35, h: 0.4,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.code, align: "center",
  });

  // Other context formats
  const formats = [
    { label: "B3 (Zipkin)", color: COLORS.warning },
    { label: "Jaeger",      color: COLORS.backend },
    { label: "AWS X-Ray",  color: COLORS.database },
  ];
  slide.addText("Other Context formats (OTel Collector can convert between them):", {
    x: 0.3, y: 4.55, w: 5.0, h: 0.28,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  formats.forEach((f, i) => {
    const x = 0.3 + i * 1.65;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 4.85, w: 1.5, h: 0.28, rectRadius: 0.05,
      fill: { color: COLORS.bg3 },
      line: { color: f.color, width: 0.75 },
    });
    slide.addText(f.label, {
      x, y: 4.85, w: 1.5, h: 0.28,
      fontSize: 9, color: f.color, fontFace: FONTS.code, align: "center", valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 5.18,
    text: "The traceparent header must be forwarded in every HTTP/gRPC call — missing it at any layer breaks the trace chain",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 124 — Monolithic vs Distributed Tracing Differences
// ─────────────────────────────────────────────────────────────────────────────
function slide124(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Monolithic vs Distributed Tracing Differences",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 5,
  });

  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.65, w: 4.5,
    label: "🏛️  Monolithic Architecture",
    type: "good",
  });
  addCompareHeading(slide, pres, {
    x: 5.2, y: 0.65, w: 4.5,
    label: "🌐  Distributed Architecture",
    type: "bad",
  });

  const monoItems = [
    { emoji: "✅", title: "Single Process",            sub: "All code runs in the same memory space", type: "good" },
    { emoji: "✅", title: "Function Call Tracing",      sub: "Directly intercept call stack traces", type: "good" },
    { emoji: "✅", title: "Easy Instrumentation",       sub: "A single SDK covers the entire application", type: "good" },
    { emoji: "✅", title: "Linear Trace",               sub: "Single request path, simple Span hierarchy", type: "good" },
  ];
  const distItems = [
    { emoji: "⚠️", title: "Each Service Needs Instrumentation", sub: "Multiple languages/frameworks, high maintenance cost", type: "warning" },
    { emoji: "⚠️", title: "Async Gaps",                  sub: "Message queues (Kafka/RabbitMQ) hard to correlate", type: "warning" },
    { emoji: "❌", title: "HTTP/gRPC Boundaries",         sub: "Must rely on Context Propagation to link spans", type: "bad" },
    { emoji: "❌", title: "Clock Skew Issues",             sub: "Different machines have unsynchronized clocks, Span order may be wrong", type: "bad" },
  ];

  monoItems.forEach((item, i) => {
    addCompareItem(slide, pres, {
      x: 0.3, y: 1.14 + i * 0.62, w: 4.5,
      emoji: item.emoji, title: item.title, sub: item.sub, type: item.type,
    });
  });
  distItems.forEach((item, i) => {
    addCompareItem(slide, pres, {
      x: 5.2, y: 1.14 + i * 0.62, w: 4.5,
      emoji: item.emoji, title: item.title, sub: item.sub, type: item.type,
    });
  });

  addTipBar(slide, pres, {
    y: 5.0,
    text: "Distributed tracing is inherently 10x more complex than monolithic — but OpenTelemetry dramatically lowers the implementation barrier",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 125 — OpenTelemetry: The Industry Standard
// ─────────────────────────────────────────────────────────────────────────────
function slide125(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "OpenTelemetry: The Industry Standard",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 6,
  });

  // Main heading
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.52, rectRadius: 0.08,
    fill: { color: "2D1F5E" },
    line: { color: COLORS.infra, width: 1.5 },
  });
  slide.addText("OTel = Vendor-Neutral Observability Standard   ·   CNCF Graduated Project   ·   All Three Pillars Covered", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.52,
    fontSize: 11.5, bold: true, color: COLORS.infra, fontFace: FONTS.body, valign: "middle", align: "center",
  });

  // Three components
  addThreeCols(slide, pres, [
    {
      title: "API",
      color: COLORS.accent,
      icon: "🔌",
      items: [
        { text: "Instrumentation Interface", sub: "API for creating Spans in code" },
        { text: "Language Agnostic", sub: "Python / Go / Java / JS" },
        { text: "Interface Only", sub: "No implementation logic" },
        { text: "Call Points in Code", sub: "tracer.start_span()" },
      ],
    },
    {
      title: "SDK",
      color: COLORS.success,
      icon: "⚙️",
      items: [
        { text: "API Implementation", sub: "Handles Span lifecycle" },
        { text: "Batch Processing", sub: "Merges multiple Spans before sending" },
        { text: "Sampling Decisions", sub: "Head sampling logic lives here" },
        { text: "Exporters", sub: "Send to Collector or backend" },
      ],
    },
    {
      title: "Collector",
      color: COLORS.infra,
      icon: "🔄",
      items: [
        { text: "Receive Telemetry Data", sub: "Supports OTLP / Jaeger / Zipkin" },
        { text: "Data Processing", sub: "Filter, enrich, transform formats" },
        { text: "Multi-Target Export", sub: "Send to multiple backends simultaneously" },
        { text: "Decouple Applications", sub: "Backend changes need no code changes" },
      ],
    },
  ], { y: 1.28, h: 3.55 });

  // Three pillars
  const pillars = [
    { label: "📍 Traces", color: COLORS.infra,   desc: "Request Tracing" },
    { label: "📊 Metrics", color: COLORS.success, desc: "Metrics Monitoring" },
    { label: "📋 Logs",   color: COLORS.warning,  desc: "Log Recording" },
  ];
  slide.addText("OTel covers the three pillars of observability:", {
    x: 0.3, y: 4.9, w: 3.2, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });
  pillars.forEach((p, i) => {
    const x = 3.6 + i * 2.0;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 4.88, w: 1.85, h: 0.35, rectRadius: 0.06,
      fill: { color: COLORS.bg2 },
      line: { color: p.color, width: 1.0 },
    });
    slide.addText(`${p.label}  ${p.desc}`, {
      x, y: 4.88, w: 1.85, h: 0.35,
      fontSize: 10, bold: true, color: p.color, fontFace: FONTS.body, align: "center", valign: "middle",
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 126 — OTel Collector Architecture
// ─────────────────────────────────────────────────────────────────────────────
function slide126(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "OTel Collector Architecture",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 7,
  });

  // Pipeline title
  slide.addText("Pipeline Architecture: Receivers  →  Processors  →  Exporters", {
    x: 0.3, y: 0.65, w: 9.4, h: 0.35,
    fontSize: 12, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
  });

  // Receivers block
  addZoneBorder(slide, pres, {
    x: 0.2, y: 1.12, w: 2.8, h: 2.65,
    color: COLORS.accent, label: "Receivers",
  });
  ["OTLP (gRPC/HTTP)", "Jaeger", "Zipkin", "Prometheus"].forEach((r, i) => {
    addMiniNode(slide, pres, {
      x: 0.35, y: 1.28 + i * 0.58, w: 2.5, h: 0.42,
      label: r, borderColor: COLORS.accent,
    });
  });

  // Arrow → Processors
  addHArrow(slide, pres, { x: 3.0, y: 2.28, w: 0.5, color: COLORS.infra });

  // Processors block
  addZoneBorder(slide, pres, {
    x: 3.5, y: 1.12, w: 3.0, h: 2.65,
    color: COLORS.infra, label: "Processors",
  });
  ["Batch Processing", "Attribute Enrichment", "Filtering / Sampling", "Resource Detection"].forEach((p, i) => {
    addMiniNode(slide, pres, {
      x: 3.65, y: 1.28 + i * 0.58, w: 2.7, h: 0.42,
      label: p, borderColor: COLORS.infra,
    });
  });

  // Arrow → Exporters
  addHArrow(slide, pres, { x: 6.5, y: 2.28, w: 0.5, color: COLORS.success });

  // Exporters block
  addZoneBorder(slide, pres, {
    x: 7.0, y: 1.12, w: 2.8, h: 2.65,
    color: COLORS.success, label: "Exporters",
  });
  ["Jaeger", "Zipkin / OTLP", "Prometheus", "Loki / Others"].forEach((e, i) => {
    addMiniNode(slide, pres, {
      x: 7.15, y: 1.28 + i * 0.58, w: 2.5, h: 0.42,
      label: e, borderColor: COLORS.success,
    });
  });

  // Collector outer border
  addZoneBorder(slide, pres, {
    x: 0.1, y: 0.98, w: 9.8, h: 2.92,
    color: COLORS.border, label: "OTel Collector",
  });

  // Configuration example
  addCodeCard(slide, pres, {
    x: 0.3, y: 4.08, w: 9.4, h: 1.12,
    language: "otel-collector-config.yaml (overview)",
    code: "receivers: {otlp: {protocols: {grpc: {endpoint: 0.0.0.0:4317}}}}\nprocessors: {batch: {timeout: 1s, send_batch_size: 1024}}\nexporters: {jaeger: {endpoint: jaeger:14250}, prometheus: {endpoint: 0.0.0.0:8889}}\nservice: {pipelines: {traces: {receivers: [otlp], processors: [batch], exporters: [jaeger]}}}",
  });

  addTipBar(slide, pres, {
    y: 5.25,
    text: "Collector decouples apps from backends — switching from Jaeger to Tempo requires no application code changes",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 127 — Jaeger: Distributed Tracing Backend
// ─────────────────────────────────────────────────────────────────────────────
function slide127(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Jaeger: Distributed Tracing Backend",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 7,
  });

  slide.addText("Jaeger was open-sourced by Uber and is now a CNCF graduated project — one of the most widely used distributed tracing backends", {
    x: 0.3, y: 0.65, w: 9.4, h: 0.35,
    fontSize: 10.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  // Architecture component cards
  const components = [
    { x: 0.3,  y: 1.1, emoji: "📡", name: "jaeger-agent",     meta: "Sidecar / DaemonSet\nUDP port 6831/6832",  borderColor: COLORS.accent  },
    { x: 2.85, y: 1.1, emoji: "🔄", name: "jaeger-collector", meta: "Validate, index\nStore to backend",         borderColor: COLORS.success },
    { x: 5.4,  y: 1.1, emoji: "🔍", name: "jaeger-query",     meta: "Search API\nREST + gRPC",                   borderColor: COLORS.infra   },
    { x: 7.95, y: 1.1, emoji: "🖥️", name: "Jaeger UI",        meta: "Trace visualization\nGantt timeline chart", borderColor: COLORS.warning },
  ];
  components.forEach((c) => {
    addNodeCard(slide, pres, {
      x: c.x, y: c.y, w: 2.3, h: 1.25,
      emoji: c.emoji, name: c.name, meta: c.meta,
      borderColor: c.borderColor,
    });
  });

  // Arrows between components
  for (let i = 0; i < 3; i++) {
    addHArrow(slide, pres, {
      x: components[i].x + 2.3, y: 1.57, w: 0.25,
      color: COLORS.infra,
    });
  }

  // Storage backends
  slide.addText("Storage Backends", {
    x: 0.3, y: 2.55, w: 1.5, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });
  [
    { label: "Elasticsearch", color: COLORS.success },
    { label: "Cassandra",     color: COLORS.warning },
    { label: "Badger (local)", color: COLORS.accent  },
  ].forEach((s, i) => {
    addMiniNode(slide, pres, {
      x: 1.9 + i * 2.7, y: 2.45, w: 2.4, h: 0.42,
      label: s.label, borderColor: s.color,
    });
  });
  addVArrow(slide, pres, { x: 3.6, y: 2.35, h: 0.12, color: COLORS.border });

  // Feature descriptions
  const features = [
    { icon: "🔍", text: "Search traces by service / operation / tag",              color: COLORS.infra   },
    { icon: "📊", text: "Compare multiple traces to detect performance regressions", color: COLORS.accent  },
    { icon: "🗂️", text: "Service dependency graph (Service Graph) auto-generated",  color: COLORS.success },
    { icon: "⚡", text: "Tail sampling: Jaeger Collector supports remote sampling",  color: COLORS.warning },
  ];
  features.forEach((f, i) => {
    const x = 0.3 + (i % 2) * 4.8;
    const y = 3.08 + Math.floor(i / 2) * 0.58;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: 4.5, h: 0.48, rectRadius: 0.07,
      fill: { color: COLORS.bg2 },
      line: { color: f.color, width: 0.8 },
    });
    slide.addText(`${f.icon}  ${f.text}`, {
      x: x + 0.12, y, w: 4.2, h: 0.48,
      fontSize: 10, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 4.95,
    text: "Jaeger UI provides Gantt timeline charts to visually show each Span's duration ratio, quickly pinpointing bottleneck services",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 128 — Sampling Strategies: Head vs Tail Sampling
// ─────────────────────────────────────────────────────────────────────────────
function slide128(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Sampling Strategies: Head vs Tail Sampling",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 7,
  });

  // Problem statement
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.48, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.2 },
  });
  slide.addText("Problem: Tracing 100% of requests is impractical — data volume too large, storage costs too high, performance overhead too great", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.48,
    fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  addCompareHeading(slide, pres, {
    x: 0.3, y: 1.24, w: 4.5,
    label: "Head-based Sampling",
    type: "good",
  });
  addCompareHeading(slide, pres, {
    x: 5.2, y: 1.24, w: 4.5,
    label: "Tail-based Sampling",
    type: "bad",
  });

  const headItems = [
    { emoji: "⏱️", title: "Decided at Request Start",  sub: "Immediately determines whether to trace at a fixed probability", type: "good" },
    { emoji: "✅", title: "Simple to Implement",        sub: "Built into SDK, no extra infrastructure needed", type: "good" },
    { emoji: "⚡", title: "Low Overhead",               sub: "Unsampled requests produce no Spans", type: "good" },
    { emoji: "⚠️", title: "May Miss Rare Errors",       sub: "Low-probability errors may be filtered out by sample rate", type: "warning" },
  ];
  const tailItems = [
    { emoji: "🔄", title: "Decided After Trace Completes", sub: "Waits for the entire trace to finish before deciding", type: "warning" },
    { emoji: "✅", title: "Retains All Errors",             sub: "100% retention of traces containing errors", type: "good" },
    { emoji: "⚠️", title: "Must Buffer All Traces",         sub: "Collector requires significant memory buffer", type: "warning" },
    { emoji: "❌", title: "Complex Architecture",            sub: "OTel Collector Tail Sampling config is complex", type: "bad" },
  ];

  headItems.forEach((item, i) => {
    addCompareItem(slide, pres, {
      x: 0.3, y: 1.72 + i * 0.57, w: 4.5,
      emoji: item.emoji, title: item.title, sub: item.sub, type: item.type,
    });
  });
  tailItems.forEach((item, i) => {
    addCompareItem(slide, pres, {
      x: 5.2, y: 1.72 + i * 0.57, w: 4.5,
      emoji: item.emoji, title: item.title, sub: item.sub, type: item.type,
    });
  });

  // Other sampling strategies
  const strategies = [
    { label: "Probabilistic",  desc: "Randomly sample X% of requests (most common)",  color: COLORS.accent },
    { label: "Rate Limiting",  desc: "Max N traces per second",                       color: COLORS.success },
    { label: "Rule-based",     desc: "Errors = 100%, normal = 1%",                    color: COLORS.warning },
  ];
  strategies.forEach((s, i) => {
    const x = 0.3 + i * 3.17;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 4.4, w: 3.0, h: 0.48, rectRadius: 0.07,
      fill: { color: COLORS.bg2 },
      line: { color: s.color, width: 1.0 },
    });
    slide.addText(`${s.label}: ${s.desc}`, {
      x: x + 0.12, y: 4.4, w: 2.76, h: 0.48,
      fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 5.0,
    text: "Production typically uses 1-10% head sampling combined with tail sampling to retain all error traces — balancing cost and observability",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 129 — OTel SDK Instrumentation Implementation
// ─────────────────────────────────────────────────────────────────────────────
function slide129(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "OTel SDK Instrumentation Implementation",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 6,
  });

  // Left: Manual instrumentation code
  slide.addText("Manual Span Creation (Python / FastAPI)", {
    x: 0.3, y: 0.65, w: 4.6, h: 0.3,
    fontSize: 10.5, bold: true, color: COLORS.infra, fontFace: FONTS.body,
  });
  addCodeCard(slide, pres, {
    x: 0.3, y: 0.98, w: 4.6, h: 3.62,
    language: "Python OTel SDK",
    code: "from opentelemetry import trace\nfrom opentelemetry.sdk.trace import TracerProvider\nfrom opentelemetry.sdk.trace.export import (\n    BatchSpanProcessor\n)\nfrom opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (\n    OTLPSpanExporter\n)\n\n# Initialize TracerProvider\nprovider = TracerProvider()\nprovider.add_span_processor(\n    BatchSpanProcessor(OTLPSpanExporter())\n)\ntrace.set_tracer_provider(provider)\n\n# Get Tracer\ntracer = trace.get_tracer(__name__)\n\n# Create manual Span\nwith tracer.start_as_current_span(\"process_order\") as span:\n    # Add custom attributes\n    span.set_attribute(\"order.id\", order_id)\n    span.set_attribute(\"order.amount\", amount)\n    result = process(order)\n    span.add_event(\"order_processed\")",
  });

  // Right: Auto-instrumentation
  slide.addText("Auto-Instrumentation (No Code Changes)", {
    x: 5.2, y: 0.65, w: 4.5, h: 0.3,
    fontSize: 10.5, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  addCodeCard(slide, pres, {
    x: 5.2, y: 0.98, w: 4.5, h: 1.85,
    language: "Auto-Instrumentation (Zero Invasion)",
    code: "# Install auto-instrumentation packages\npip install opentelemetry-instrument-fastapi\npip install opentelemetry-instrument-sqlalchemy\npip install opentelemetry-instrument-requests\n\n# Auto-inject at startup (no code changes)\nopentelemetry-instrument \\\n    --traces_exporter otlp \\\n    uvicorn app:main",
  });

  // Supported frameworks
  slide.addText("Frameworks and libraries supported by auto-instrumentation:", {
    x: 5.2, y: 2.98, w: 4.5, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });
  const frameworks = [
    { label: "FastAPI / Flask / Django",   color: COLORS.accent   },
    { label: "SQLAlchemy / psycopg2",      color: COLORS.database },
    { label: "requests / httpx / aiohttp", color: COLORS.success  },
    { label: "Redis / Celery / Kafka",     color: COLORS.warning  },
  ];
  frameworks.forEach((f, i) => {
    const y = 3.3 + i * 0.4;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.2, y, w: 4.5, h: 0.34, rectRadius: 0.06,
      fill: { color: COLORS.bg2 },
      line: { color: f.color, width: 0.75 },
    });
    slide.addText(`\u2705  ${f.label}`, {
      x: 5.35, y, w: 4.2, h: 0.34,
      fontSize: 9.5, color: f.color, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 4.95,
    text: "Auto-instrumentation is ideal for quick starts; manual instrumentation suits business-critical paths — both can be combined",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 130 — Tracing Deployment in Kubernetes
// ─────────────────────────────────────────────────────────────────────────────
function slide130(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Tracing Deployment in Kubernetes",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 8,
  });

  const schemes = [
    {
      x: 0.2, title: "① DaemonSet Mode", color: COLORS.accent,
      desc: "Deploy one OTel Collector per node",
      pros: ["Apps send to localhost", "Shared per node, resource-efficient", "Suitable for large clusters"],
      cons: ["Node failure loses that node's data", "Collector upgrades affect entire node"],
    },
    {
      x: 3.47, title: "② Sidecar Mode", color: COLORS.infra,
      desc: "Each Pod includes a Collector sidecar",
      pros: ["Full isolation, no interference", "Per-Pod sampling strategies possible"],
      cons: ["High resource overhead (extra container per Pod)", "Complex maintenance with many Pods"],
    },
    {
      x: 6.72, title: "③ Central Collector", color: COLORS.success,
      desc: "All apps send to a centralized deployment",
      pros: ["Easiest to manage", "Unified config and monitoring"],
      cons: ["Single point of failure risk", "Slightly higher network overhead", "Horizontal scaling needed under heavy load"],
    },
  ];

  schemes.forEach((s) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: s.x, y: 0.65, w: 3.2, h: 4.62, rectRadius: 0.1,
      fill: { color: COLORS.bg2 },
      line: { color: s.color, width: 1.5 },
    });
    slide.addText(s.title, {
      x: s.x + 0.1, y: 0.72, w: 3.0, h: 0.35,
      fontSize: 11, bold: true, color: s.color, fontFace: FONTS.body, align: "center",
    });
    slide.addText(s.desc, {
      x: s.x + 0.12, y: 1.1, w: 2.96, h: 0.32,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });

    // Pod diagram
    slide.addShape(pres.ShapeType.roundRect, {
      x: s.x + 0.35, y: 1.48, w: 2.5, h: 0.9, rectRadius: 0.07,
      fill: { color: COLORS.bg3 },
      line: { color: COLORS.border, width: 0.75, dashType: "dash" },
    });
    slide.addText("K8s Node / Pod", {
      x: s.x + 0.35, y: 1.52, w: 2.5, h: 0.25,
      fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.code, align: "center",
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: s.x + 0.55, y: 1.82, w: 0.9, h: 0.42, rectRadius: 0.05,
      fill: { color: COLORS.bg2 },
      line: { color: s.color, width: 0.75 },
    });
    slide.addText("App Pod", {
      x: s.x + 0.55, y: 1.82, w: 0.9, h: 0.42,
      fontSize: 8, color: COLORS.text, fontFace: FONTS.code, align: "center", valign: "middle",
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: s.x + 1.6, y: 1.82, w: 1.0, h: 0.42, rectRadius: 0.05,
      fill: { color: "2D1F5E" },
      line: { color: COLORS.infra, width: 0.75 },
    });
    slide.addText("OTel\nCollector", {
      x: s.x + 1.6, y: 1.82, w: 1.0, h: 0.42,
      fontSize: 7.5, color: COLORS.infra, fontFace: FONTS.code, align: "center", valign: "middle",
    });

    // Pros
    slide.addText("Pros", {
      x: s.x + 0.12, y: 2.52, w: 2.96, h: 0.25,
      fontSize: 9, bold: true, color: COLORS.success, fontFace: FONTS.body,
    });
    s.pros.forEach((p, i) => {
      slide.addText(`\u2705 ${p}`, {
        x: s.x + 0.12, y: 2.78 + i * 0.32, w: 2.96, h: 0.3,
        fontSize: 9, color: COLORS.text, fontFace: FONTS.body,
      });
    });

    // Cons
    const prosH = s.pros.length * 0.32;
    slide.addText("Cons", {
      x: s.x + 0.12, y: 2.78 + prosH + 0.1, w: 2.96, h: 0.25,
      fontSize: 9, bold: true, color: COLORS.danger, fontFace: FONTS.body,
    });
    s.cons.forEach((c, i) => {
      slide.addText(`\u26a0\ufe0f ${c}`, {
        x: s.x + 0.12, y: 2.78 + prosH + 0.36 + i * 0.3, w: 2.96, h: 0.28,
        fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
      });
    });
  });

  addTipBar(slide, pres, {
    y: 5.35,
    text: "Most teams start with DaemonSet and switch to Sidecar only when strong isolation is needed — Central Collector suits small clusters",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 131 — Service Mesh Auto-Tracing
// ─────────────────────────────────────────────────────────────────────────────
function slide131(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Service Mesh Auto-Tracing",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 8,
  });

  // Core explanation
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.5, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.5 },
  });
  slide.addText("Istio / Envoy: Automatically inject tracing headers at the proxy layer — apps get basic tracing without any SDK instrumentation", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.5,
    fontSize: 11, bold: true, color: COLORS.infra, fontFace: FONTS.body, valign: "middle",
  });

  // Architecture diagram — Pod A
  addZoneBorder(slide, pres, {
    x: 0.2, y: 1.25, w: 3.5, h: 1.8,
    color: COLORS.accent, label: "Pod A",
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.4, y: 1.45, w: 1.4, h: 1.35, rectRadius: 0.08,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.accent, width: 1.0 },
  });
  slide.addText("🐍\nApplication\n(No SDK)", {
    x: 0.4, y: 1.5, w: 1.4, h: 1.2,
    fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body, align: "center", valign: "middle",
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.0, y: 1.45, w: 1.55, h: 1.35, rectRadius: 0.08,
    fill: { color: "2D1F5E" },
    line: { color: COLORS.infra, width: 1.0 },
  });
  slide.addText("🔷\nEnvoy\nProxy\n(Sidecar)", {
    x: 2.0, y: 1.5, w: 1.55, h: 1.2,
    fontSize: 9.5, color: COLORS.infra, fontFace: FONTS.body, align: "center", valign: "middle",
  });
  addHArrow(slide, pres, { x: 1.8, y: 1.98, w: 0.2, color: COLORS.border });

  // Injection arrow
  addHArrow(slide, pres, {
    x: 3.7, y: 1.98, w: 1.0,
    label: "Inject\ntraceparent",
    color: COLORS.infra,
  });

  // Architecture diagram — Pod B
  addZoneBorder(slide, pres, {
    x: 4.7, y: 1.25, w: 3.5, h: 1.8,
    color: COLORS.success, label: "Pod B",
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.9, y: 1.45, w: 1.55, h: 1.35, rectRadius: 0.08,
    fill: { color: "2D1F5E" },
    line: { color: COLORS.infra, width: 1.0 },
  });
  slide.addText("🔷\nEnvoy\nProxy\n(Read Headers)", {
    x: 4.9, y: 1.5, w: 1.55, h: 1.2,
    fontSize: 9.5, color: COLORS.infra, fontFace: FONTS.body, align: "center", valign: "middle",
  });
  addHArrow(slide, pres, { x: 6.45, y: 1.98, w: 0.2, color: COLORS.border });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.65, y: 1.45, w: 1.4, h: 1.35, rectRadius: 0.08,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.success, width: 1.0 },
  });
  slide.addText("🐍\nApplication\n(No SDK)", {
    x: 6.65, y: 1.5, w: 1.4, h: 1.2,
    fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body, align: "center", valign: "middle",
  });

  // Send to Jaeger
  addHArrow(slide, pres, {
    x: 8.2, y: 1.98, w: 1.0,
    label: "Span →\nJaeger",
    color: COLORS.warning,
  });

  // Limitations
  slide.addText("⚠️  Important Limitations of Service Mesh Tracing", {
    x: 0.3, y: 3.22, w: 9.4, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });
  const limits = [
    { text: "⚠️ Apps must still forward traceparent headers — otherwise parent-child Span links break", color: COLORS.warning },
    { text: "❌ Cannot see application internal logic — only inter-service HTTP/gRPC calls are visible",   color: COLORS.danger  },
    { text: "❌ Database queries, cache calls, and other internal Spans require SDK instrumentation",       color: COLORS.danger  },
  ];
  limits.forEach((l, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: 3.6 + i * 0.47, w: 9.4, h: 0.42, rectRadius: 0.07,
      fill: { color: COLORS.bg2 },
      line: { color: l.color, width: 0.8 },
    });
    slide.addText(l.text, {
      x: 0.45, y: 3.6 + i * 0.47, w: 9.1, h: 0.42,
      fontSize: 10, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 5.05,
    text: "Service Mesh tracing is a great starting point, but ultimately OTel SDK is needed for full business-layer tracing",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 132 — Integrating Traces, Logs & Metrics
// ─────────────────────────────────────────────────────────────────────────────
function slide132(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Integrating Traces, Logs & Metrics",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 8,
  });

  // Key explanation
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.5, rectRadius: 0.08,
    fill: { color: "2D1F5E" },
    line: { color: COLORS.infra, width: 1.5 },
  });
  slide.addText("Key: Inject traceId and spanId into every log entry — three pillars are linked via Correlation ID", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.5,
    fontSize: 11, bold: true, color: COLORS.infra, fontFace: FONTS.body, valign: "middle",
  });

  // Grafana Stack three panels
  const panels = [
    {
      x: 0.2, icon: "📊", title: "Prometheus", subtitle: "Metrics Monitoring",
      color: COLORS.warning,
      content: "Spot error_rate or\np99 latency spikes\n→ Click into Grafana",
    },
    {
      x: 3.47, icon: "🔍", title: "Tempo / Jaeger", subtitle: "Trace Analysis",
      color: COLORS.infra,
      content: "Find traces in the problem window\nSee which Span has abnormal latency\n→ Click to view correlated logs",
    },
    {
      x: 6.72, icon: "📋", title: "Loki", subtitle: "Log Queries",
      color: COLORS.success,
      content: "Query by traceId to find\nall service logs for that request\nPinpoint the exact error line",
    },
  ];

  panels.forEach((p) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: p.x, y: 1.28, w: 3.2, h: 2.68, rectRadius: 0.1,
      fill: { color: COLORS.bg2 },
      line: { color: p.color, width: 1.5 },
    });
    slide.addText(p.icon, {
      x: p.x, y: 1.35, w: 3.2, h: 0.5,
      fontSize: 24, align: "center",
    });
    slide.addText(p.title, {
      x: p.x + 0.1, y: 1.85, w: 3.0, h: 0.3,
      fontSize: 12, bold: true, color: p.color, fontFace: FONTS.body, align: "center",
    });
    slide.addText(p.subtitle, {
      x: p.x + 0.1, y: 2.15, w: 3.0, h: 0.24,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
    slide.addText(p.content, {
      x: p.x + 0.15, y: 2.44, w: 2.9, h: 1.42,
      fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body,
    });
  });

  // Correlation arrows
  addHArrow(slide, pres, {
    x: 3.4, y: 2.58, w: 0.07,
    label: "TraceID\nCorrelation",
    color: COLORS.textMuted,
  });
  addHArrow(slide, pres, {
    x: 6.65, y: 2.58, w: 0.07,
    label: "TraceID\nCorrelation",
    color: COLORS.textMuted,
  });

  // Workflow
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.08, w: 9.4, h: 0.58, rectRadius: 0.08,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addText("Workflow: Prometheus detects anomaly → Grafana Explore finds Trace → Tempo shows Span details → Click TraceID to jump to Loki for related logs", {
    x: 0.5, y: 4.08, w: 9.0, h: 0.58,
    fontSize: 10, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.78,
    text: "Correlation ID across three pillars is the core capability of observability — Grafana's Explore page enables direct navigation between all three data sources",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 133 — Tracing Cost & Performance Impact
// ─────────────────────────────────────────────────────────────────────────────
function slide133(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Tracing Cost & Performance Impact",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 6,
  });

  // SDK performance overhead
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 4.5, h: 1.62, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.warning, width: 1.5 },
  });
  slide.addText("⚡ SDK Performance Overhead", {
    x: 0.45, y: 0.72, w: 4.2, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });
  [
    "CPU: ~1-3% extra for instrumentation & serialization",
    "Memory: ~1-5KB per Span (incl. attributes, events)",
    "Network: Batch-processed transfer to Collector",
    "Latency: Async export, request latency impact < 1ms",
  ].forEach((t, i) => {
    slide.addText(`\u2022 ${t}`, {
      x: 0.45, y: 1.06 + i * 0.28, w: 4.2, h: 0.27,
      fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body,
    });
  });

  // Cost estimation
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.1, y: 0.65, w: 4.6, h: 1.62, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.danger, width: 1.5 },
  });
  slide.addText("💰 Storage Cost Estimate (100% Sampling)", {
    x: 5.25, y: 0.72, w: 4.3, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });
  addCodeCard(slide, pres, {
    x: 5.2, y: 1.06, w: 4.5, h: 1.05,
    language: "Daily Data Volume Estimate",
    code: "1,000,000 requests/day\n× 10 Spans per request\n× 2 KB per Span\n= 20 GB Trace data per day",
  });

  // Three-column comparison: sampling rate impact
  addThreeCols(slide, pres, [
    {
      title: "100% Sampling",
      color: COLORS.danger,
      icon: "🔴",
      items: [
        { text: "20 GB per day",        sub: "Highest cost" },
        { text: "Full observability",    sub: "Every request queryable" },
        { text: "Suitable for: testing", sub: "Not recommended for production" },
      ],
    },
    {
      title: "10% Sampling",
      color: COLORS.warning,
      icon: "🟡",
      items: [
        { text: "2 GB per day",           sub: "90% cost reduction" },
        { text: "Acceptable coverage",     sub: "Most issues still traceable" },
        { text: "Suitable for: general",   sub: "Most common choice" },
      ],
    },
    {
      title: "1% Sampling",
      color: COLORS.success,
      icon: "🟢",
      items: [
        { text: "200 MB per day",           sub: "Lowest cost" },
        { text: "Trend analysis only",      sub: "Individual issues hard to find" },
        { text: "Combine with tail sampling", sub: "Retain error traces" },
      ],
    },
  ], { y: 2.45, h: 2.72 });

  addTipBar(slide, pres, {
    y: 5.25,
    text: "Sampling rate design principle: low sampling for normal requests + 100% retention for errors/high-latency = optimal cost-effectiveness",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 134 — Common Tracing Anti-patterns
// ─────────────────────────────────────────────────────────────────────────────
function slide134(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Common Tracing Anti-patterns",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 5,
  });

  const antiPatterns = [
    {
      icon: "💣", title: "No Sampling",
      desc: "100% sample rate + high traffic = storage explosion, skyrocketing costs",
      fix: "Best practice: Set a reasonable sample rate, use tail sampling to retain errors",
    },
    {
      icon: "🔗", title: "Missing Context Propagation",
      desc: "Any layer (Message Queue, Async Job) forgetting to forward traceparent breaks the trace chain",
      fix: "Best practice: All service boundaries must forward trace headers",
    },
    {
      icon: "🙈", title: "Only Tracing Happy Path",
      desc: "Only instrumenting try blocks; catch/error paths have no Spans — failures become untraceable",
      fix: "Best practice: Record exceptions in Spans via span.record_exception(e)",
    },
    {
      icon: "🗂️", title: "Not Correlating with Logs",
      desc: "Traces alone only show timing; without detailed error messages, deep debugging is impossible",
      fix: "Best practice: Inject trace_id and span_id into log entries",
    },
    {
      icon: "🔒", title: "Vendor Lock-in",
      desc: "Instrumenting directly with Jaeger SDK or Zipkin SDK means switching backends requires major code changes",
      fix: "Best practice: Always use OTel API/SDK; abstract backends via Collector",
    },
  ];

  antiPatterns.forEach((ap, i) => {
    // Last card (5th) centered full width
    const isLast = (i === 4);
    const x = isLast ? 0.3 : (i % 2 === 0 ? 0.3 : 5.15);
    const y = 0.65 + Math.floor(i / 2) * 1.62;
    const w = isLast ? 9.4 : 4.55;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w, h: 1.48, rectRadius: 0.1,
      fill: { color: COLORS.cardDanger },
      line: { color: COLORS.danger, width: 1.2 },
    });
    slide.addText(`${ap.icon}  ${ap.title}`, {
      x: x + 0.12, y: y + 0.08, w: w - 0.24, h: 0.32,
      fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body,
    });
    slide.addText(ap.desc, {
      x: x + 0.12, y: y + 0.4, w: w - 0.24, h: 0.45,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 0.12, y: y + 0.92, w: w - 0.24, h: 0.45, rectRadius: 0.05,
      fill: { color: COLORS.cardSuccess },
      line: { color: COLORS.success, width: 0.75 },
    });
    slide.addText(`\u2705 ${ap.fix}`, {
      x: x + 0.22, y: y + 0.94, w: w - 0.44, h: 0.4,
      fontSize: 9, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 5.25,
    text: "The value of a tracing system comes from completeness and correlation — avoiding these anti-patterns maximizes tracing ROI",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 135 — Tracing Chapter Summary
// ─────────────────────────────────────────────────────────────────────────────
function slide135(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Tracing Chapter Summary",
    partLabel: "PART 9",
    accentColor: COLORS.infra,
    complexity: 5,
  });

  // Four summary cards
  const summaries = [
    {
      x: 0.3, icon: "🗺️", title: "What It Is",
      color: COLORS.infra,
      items: [
        "Track request paths across service boundaries",
        "Trace + Span + Context",
        "W3C traceparent standard",
        "Solves distributed debugging challenges",
      ],
    },
    {
      x: 2.65, icon: "🔧", title: "How To Do It",
      color: COLORS.accent,
      items: [
        "OTel SDK auto/manual instrumentation",
        "OTel Collector routing",
        "Jaeger / Tempo backends",
        "K8s DaemonSet deployment",
      ],
    },
    {
      x: 5.0, icon: "🎯", title: "Sampling Strategy",
      color: COLORS.warning,
      items: [
        "Head sampling: low overhead",
        "Tail sampling: retains all errors",
        "Production: 1-10% + 100% errors",
        "Essential for cost control",
      ],
    },
    {
      x: 7.35, icon: "🔗", title: "Integration",
      color: COLORS.success,
      items: [
        "TraceID injected into every log",
        "Grafana Tempo + Loki",
        "Three pillars linked together",
        "Alert → Trace → Log",
      ],
    },
  ];

  summaries.forEach((s) => {
    addSummaryCard(slide, pres, {
      x: s.x, y: 0.65, w: 2.28, h: 4.12,
      icon: s.icon, title: s.title,
      color: s.color, items: s.items,
    });
  });

  // Next chapter preview
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.88, w: 9.4, h: 0.5, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.2 },
  });
  slide.addText("🚀  Next Chapter PART 10: SRE Practices — Integrating Traces + Metrics + Logs into the SLO/SLI Framework", {
    x: 0.5, y: 4.88, w: 9.0, h: 0.5,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle", align: "center",
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
    slide121, slide122, slide123, slide124, slide125,
    slide126, slide127, slide128, slide129, slide130,
    slide131, slide132, slide133, slide134, slide135,
  ]) {
    await fn(pres);
  }

  await pres.writeFile({ fileName: "output/part9_tracing.pptx" });
  console.log("part9_tracing.pptx created");
}

main().catch(console.error);
