// src/part8_logs.js
// Part 8: Logs Observability (Slides 106–120)

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
// Slide 106 — Logs: Application Event Records
// ─────────────────────────────────────────────────────────────────────────────
function slide106(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Logs: Application Event Records — The Last Line of Defense for Debugging",
    partLabel: "PART 8",
    accentColor: COLORS.warning,
  });

  // Large definition box
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 4.5, h: 0.85, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.warning, width: 1.5 },
  });
  slide.addText("Logs = Timestamped Structured Event Records", {
    x: 0.3, y: 0.68, w: 4.5, h: 0.42,
    fontSize: 13, bold: true, color: COLORS.warning, fontFace: FONTS.body, align: "center", valign: "middle",
  });
  slide.addText("Records what happened in the system at a specific moment", {
    x: 0.3, y: 1.08, w: 4.5, h: 0.38,
    fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body, align: "center", valign: "middle",
  });

  // 3 problem scenarios
  const scenarios = [
    { text: "🔥 Prod suddenly returns 500 errors — which API? which user? what cause?", border: COLORS.danger, fill: COLORS.cardDanger },
    { text: "🐛 User reports 'my order disappeared' — when? which service failed?", border: COLORS.warning, fill: COLORS.cardWarn },
    { text: "🔐 Security audit — who deleted this record and when?", border: COLORS.accent, fill: COLORS.bg2 },
  ];
  scenarios.forEach((s, i) => {
    const y = 1.62 + i * 0.58;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 4.5, h: 0.5, rectRadius: 0.08,
      fill: { color: s.fill },
      line: { color: s.border, width: 1.2 },
    });
    slide.addText(s.text, {
      x: 0.45, y, w: 4.2, h: 0.5,
      fontSize: 10, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  // Without logs box
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.34, w: 4.5, h: 0.58, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.5 },
  });
  slide.addText("❌ Without Logs: Can only reproduce issues, guess causes, no audit trail", {
    x: 0.45, y: 3.34, w: 4.2, h: 0.58,
    fontSize: 10.5, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  // Right: code card
  addCodeCard(slide, pres, {
    x: 5.15, y: 0.65, w: 4.55, h: 4.62,
    language: "Structured Log Example (JSON)",
    code: '{\n  "timestamp": "2024-03-15T14:32:01.234Z",\n  "level": "ERROR",\n  "service": "payment-service",\n  "version": "v2.1.3",\n  "trace_id": "abc-123-xyz",\n  "span_id": "def-456",\n  "user_id": "user-789",\n  "event": "payment_failed",\n  "amount": 299.99,\n  "currency": "USD",\n  "error": "insufficient_funds",\n  "message": "Payment processing failed",\n  "duration_ms": 145,\n  "env": "production"\n}',
  });

  addTipBar(slide, pres, {
    y: 5.38,
    text: "A good log entry should tell you 100% what happened without reproducing the issue — include trace_id to correlate with Traces",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 107 — Structured vs Unstructured Logs
// ─────────────────────────────────────────────────────────────────────────────
function slide107(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Structured vs Unstructured Logs: Machine-Readability Is Key",
    partLabel: "PART 8",
    accentColor: COLORS.warning,
  });

  // Left - unstructured
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "❌ Unstructured Logs (Human-readable, Machine-unfriendly)",
    type: "bad",
  });
  addCodeCard(slide, pres, {
    x: 0.3, y: 1.08, w: 4.4, h: 1.75,
    language: "plain text logs",
    code: "2024-03-15 14:32:01 ERROR User login failed\n2024-03-15 14:32:01 ERROR john@example.com bad pwd\n2024-03-15 14:33:45 INFO  request GET /api/users 200 145ms\n2024-03-15 14:33:52 WARN  high memory: 89%",
  });

  const badProblems = [
    "❌ Hard to grep: must guess the format",
    "❌ Cannot auto-parse email / latency",
    "❌ Kibana/Loki cannot perform aggregation",
  ];
  badProblems.forEach((t, i) => {
    const y = 2.98 + i * 0.45;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.4, y, w: 4.1, h: 0.4, rectRadius: 0.06,
      fill: { color: COLORS.cardDanger },
      line: { color: COLORS.danger, width: 1.0 },
    });
    slide.addText(t, {
      x: 0.55, y, w: 3.8, h: 0.4,
      fontSize: 10, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
    });
  });

  // Right - structured
  addCompareHeading(slide, pres, {
    x: 5.2, y: 0.62, w: 4.4,
    label: "✅ Structured Logs (JSON / key=value)",
    type: "good",
  });
  addCodeCard(slide, pres, {
    x: 5.2, y: 1.08, w: 4.4, h: 1.75,
    language: "structured JSON logs",
    code: '{"time":"2024-03-15T14:32:01Z","level":"ERROR",\n "event":"login_failed","user":"john@ex.com",\n "reason":"wrong_password","attempt":3}\n{"time":"2024-03-15T14:33:45Z","level":"INFO",\n "method":"GET","path":"/api/users","status":200,\n "duration_ms":145}\n{"time":"2024-03-15T14:33:52Z","level":"WARN",\n "event":"high_memory","usage_pct":89}',
  });

  const goodBenefits = [
    "✅ Auto-parsed by machines — ES/Loki auto-index fields",
    "✅ Supports aggregation: avg(duration_ms) by user",
    "✅ Can join with Traces via trace_id",
  ];
  goodBenefits.forEach((t, i) => {
    const y = 2.98 + i * 0.45;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.3, y, w: 4.1, h: 0.4, rectRadius: 0.06,
      fill: { color: COLORS.cardSuccess },
      line: { color: COLORS.success, width: 1.0 },
    });
    slide.addText(t, {
      x: 5.45, y, w: 3.8, h: 0.4,
      fontSize: 10, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
    });
  });

  addCodeCard(slide, pres, {
    x: 0.3, y: 4.08, w: 9.4, h: 1.12,
    language: "Python structlog example",
    code: "import structlog\nlog = structlog.get_logger()\nlog.error('login_failed', user=email, reason='wrong_password', attempt=3, trace_id=get_trace_id())",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 108 — Log Level Design
// ─────────────────────────────────────────────────────────────────────────────
function slide108(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log Level Design: When to Use Which Level",
    partLabel: "PART 8",
    accentColor: COLORS.warning,
  });

  const levels = [
    {
      y: 0.68, fill: COLORS.bg2, border: COLORS.textMuted,
      badge: "🔵 DEBUG", badgeColor: COLORS.textMuted,
      desc: "Detailed debug info — enable only in dev/debug, usually off in Production",
      example: "SQL query: SELECT * FROM users WHERE id=123 (12ms)",
    },
    {
      y: 1.46, fill: COLORS.bg2, border: COLORS.success,
      badge: "🟢 INFO", badgeColor: COLORS.success,
      desc: "Normal operation events — service start, request success, state changes",
      example: "payment_completed: order_id=456, amount=299.99, user=john",
    },
    {
      y: 2.24, fill: COLORS.cardWarn, border: COLORS.warning,
      badge: "🟡 WARN", badgeColor: COLORS.warning,
      desc: "Unexpected but handled situations — no impact on main flow, but worth noting",
      example: "retry_attempt: db_connection failed, retry 2/3",
    },
    {
      y: 3.02, fill: COLORS.cardDanger, border: COLORS.danger,
      badge: "🔴 ERROR", badgeColor: COLORS.danger,
      desc: "Unexpected error occurred — requires human intervention, partial functionality affected",
      example: "payment_failed: stripe_api_error, user_id=789",
    },
    {
      y: 3.80, fill: COLORS.cardDanger, border: COLORS.danger,
      badge: "💀 CRITICAL/FATAL", badgeColor: COLORS.danger,
      desc: "System cannot continue — entire service is down, immediate human action required",
      example: "db_connection_pool_exhausted: all 100 connections in use",
    },
  ];

  levels.forEach((lv) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: lv.y, w: 9.4, h: 0.72, rectRadius: 0.08,
      fill: { color: lv.fill },
      line: { color: lv.border, width: 1.2 },
    });
    slide.addText(lv.badge, {
      x: 0.45, y: lv.y, w: 2.0, h: 0.72,
      fontSize: 11, bold: true, color: lv.badgeColor, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(lv.desc, {
      x: 2.5, y: lv.y, w: 4.5, h: 0.72,
      fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(lv.example, {
      x: 7.1, y: lv.y, w: 2.45, h: 0.72,
      fontSize: 9, color: COLORS.accent, fontFace: FONTS.code, valign: "middle",
    });
  });

  // Anti-patterns row
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.62, w: 9.4, h: 0.65, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.2 },
  });
  slide.addText("❌ Common Mistakes: ERROR catch Exception (catching everything as ERROR) | Too many INFO logs (noise) | DEBUG left in Prod (perf issue)", {
    x: 0.45, y: 4.62, w: 9.1, h: 0.65,
    fontSize: 10, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 5.35,
    text: "Production recommendation: INFO and above, use DEBUG only for critical paths | For every log ask: What decision can the on-call engineer make from this?",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 109 — Correlation ID: Log Correlation in Distributed Systems
// ─────────────────────────────────────────────────────────────────────────────
function slide109(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Correlation ID: How to Correlate Logs in Distributed Systems",
    partLabel: "PART 8",
    accentColor: COLORS.infra,
  });

  // Left: problem
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "❌ Without Correlation ID",
    type: "bad",
  });
  slide.addText("User reports checkout failure — where do you look?", {
    x: 0.4, y: 1.12, w: 4.3, h: 0.28,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });

  const noCorr = [
    { text: "api-service: ERROR payment failed user_id=123", border: COLORS.backend },
    { text: "payment-svc: WARN stripe timeout", border: COLORS.infra },
    { text: "db: ERROR connection timeout 14:32:01", border: COLORS.database },
  ];
  noCorr.forEach((item, i) => {
    const y = 1.42 + i * 0.48;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 4.4, h: 0.42, rectRadius: 0.06,
      fill: { color: COLORS.bg2 },
      line: { color: item.border, width: 1.0 },
    });
    slide.addText(item.text, {
      x: 0.45, y, w: 4.1, h: 0.42,
      fontSize: 9.5, color: COLORS.text, fontFace: FONTS.code, valign: "middle",
    });
  });

  slide.addText("Are these 3 logs from the same request? 🤷 No way to tell!", {
    x: 0.3, y: 2.92, w: 4.4, h: 0.35,
    fontSize: 10, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  // Right: solution
  addCompareHeading(slide, pres, {
    x: 5.2, y: 0.62, w: 4.4,
    label: "✅ Using Trace ID as Correlation ID",
    type: "good",
  });

  const withCorr = [
    'api-svc: ERROR payment_failed trace_id="abc-123"',
    'payment-svc: WARN stripe_timeout trace_id="abc-123"',
    'db: ERROR conn_timeout trace_id="abc-123"',
  ];
  withCorr.forEach((text, i) => {
    const y = 1.12 + i * 0.66;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.2, y, w: 4.4, h: 0.58, rectRadius: 0.06,
      fill: { color: COLORS.cardSuccess },
      line: { color: COLORS.success, width: 1.2 },
    });
    slide.addText(text, {
      x: 5.35, y, w: 4.1, h: 0.58,
      fontSize: 9, bold: true, color: COLORS.success, fontFace: FONTS.code, valign: "middle",
    });
  });

  slide.addText("✅ Query trace_id='abc-123' to find all related logs at once!", {
    x: 5.2, y: 3.12, w: 4.4, h: 0.35,
    fontSize: 10, bold: true, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
  });

  // Implementation code
  addCodeCard(slide, pres, {
    x: 0.3, y: 3.52, w: 9.4, h: 1.52,
    language: "Python FastAPI + OpenTelemetry",
    code: "from opentelemetry import trace\nimport structlog\n\n@app.middleware('http')\nasync def logging_middleware(request, call_next):\n    span = trace.get_current_span()\n    trace_id = format(span.get_span_context().trace_id, '032x')\n    # All subsequent logs automatically include trace_id\n    structlog.contextvars.bind_contextvars(trace_id=trace_id)\n    return await call_next(request)",
  });

  addTipBar(slide, pres, {
    y: 5.12,
    text: "Use OpenTelemetry trace_id as Correlation ID — one ID to link Logs + Traces + Metrics",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 110 — Monolithic Service Log Collection
// ─────────────────────────────────────────────────────────────────────────────
function slide110(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Monolithic Service Log Collection: From stdout to Centralized Storage",
    partLabel: "PART 8",
    accentColor: COLORS.warning,
    complexity: 2,
  });

  // Pipeline nodes
  addNodeCard(slide, pres, { x: 0.2, y: 0.82, w: 1.6, h: 1.2, emoji: "⚙️", name: "App", meta: "print()/logging\nto stdout", borderColor: COLORS.backend });
  addHArrow(slide, pres, { x: 1.85, y: 1.38, label: "stdout", color: COLORS.textMuted, w: 0.4 });
  addNodeCard(slide, pres, { x: 2.35, y: 0.82, w: 1.5, h: 1.2, emoji: "📄", name: "Log File", meta: "/var/log/app.log\nor journald", borderColor: COLORS.border });
  addHArrow(slide, pres, { x: 3.9, y: 1.38, label: "tail", color: COLORS.warning, w: 0.4 });
  addNodeCard(slide, pres, { x: 4.4, y: 0.82, w: 1.7, h: 1.2, emoji: "🔄", name: "Filebeat /\nFluentd", meta: "collect +\ntransform", borderColor: COLORS.warning });
  addHArrow(slide, pres, { x: 6.15, y: 1.38, label: "ship", color: COLORS.success, w: 0.4 });
  addNodeCard(slide, pres, { x: 6.65, y: 0.82, w: 1.65, h: 1.2, emoji: "🔍", name: "Elasticsearch\n/ Loki", meta: "index +\nstore", borderColor: COLORS.accent });
  addHArrow(slide, pres, { x: 8.35, y: 1.38, label: "query", color: COLORS.accent, w: 0.4 });
  addNodeCard(slide, pres, { x: 8.85, y: 0.82, w: 1.05, h: 1.2, emoji: "📊", name: "Kibana\nGrafana", meta: "search +\nvisualize", borderColor: COLORS.frontend });

  // Collectors zone
  addZoneBorder(slide, pres, { x: 4.32, y: 2.1, w: 1.85, h: 0.85, color: COLORS.warning, label: "Collectors" });
  slide.addText("Filebeat (Elastic)", { x: 4.4, y: 2.22, w: 1.65, h: 0.22, fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body });
  slide.addText("Fluentd (CNCF)",     { x: 4.4, y: 2.55, w: 1.65, h: 0.22, fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body });
  slide.addText("Vector (Rust)",       { x: 4.4, y: 2.88, w: 1.65, h: 0.22, fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body });

  // Config card
  addCodeCard(slide, pres, {
    x: 0.3, y: 3.12, w: 9.4, h: 1.58,
    language: "Fluentd config (single server)",
    code: "<source>\n  @type tail\n  path /var/log/app/*.log\n  pos_file /var/log/fluentd/app.pos\n  <parse>\n    @type json  # structured JSON log\n  </parse>\n  tag app.logs\n</source>\n\n<match app.logs>\n  @type elasticsearch\n  host elasticsearch.logging.svc\n  port 9200\n  logstash_format true\n</match>",
  });

  addTipBar(slide, pres, {
    y: 4.82,
    text: "Monolithic log collection is straightforward — output to stdout, OS saves to journald, Filebeat/Fluentd collects and ships",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 111 — Distributed Log Collection Challenges
// ─────────────────────────────────────────────────────────────────────────────
function slide111(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Distributed Log Collection: Container Environment Challenges",
    partLabel: "PART 8",
    accentColor: COLORS.danger,
  });

  // Left: challenges
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "Four Major Challenges of Distributed Logs",
    type: "bad",
  });

  const challenges = [
    { title: "🗑️ Containers Are Ephemeral", desc: "Container restart/delete → Logs are gone!\nCan no longer tail log files", border: COLORS.danger, fill: COLORS.cardDanger },
    { title: "📍 Pods Spread Across Nodes", desc: "50 Pods × 10 Nodes = Logs everywhere\nManual kubectl logs is impossible", border: COLORS.danger, fill: COLORS.cardDanger },
    { title: "📊 Log Volume Explosion", desc: "50 microservices × 1000 req/s = TB-level Logs/day\nSampling and filtering strategies needed", border: COLORS.warning, fill: COLORS.cardWarn },
    { title: "🔗 Cannot Correlate", desc: "Logs from the same request span multiple services\nWithout Correlation ID, impossible to trace", border: COLORS.warning, fill: COLORS.cardWarn },
  ];
  challenges.forEach((c, i) => {
    const y = 1.1 + i * 0.62;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 4.4, h: 0.56, rectRadius: 0.08,
      fill: { color: c.fill },
      line: { color: c.border, width: 1.2 },
    });
    slide.addText(c.title, {
      x: 0.45, y: y + 0.02, w: 4.1, h: 0.24,
      fontSize: 10.5, bold: true, color: c.border, fontFace: FONTS.body,
    });
    slide.addText(c.desc, {
      x: 0.45, y: y + 0.26, w: 4.1, h: 0.28,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  // Right: solutions
  addCompareHeading(slide, pres, {
    x: 5.1, y: 0.62, w: 4.5,
    label: "✅ Solutions",
    type: "good",
  });

  const solutions = [
    { title: "📤 Output Logs to stdout", desc: "Containers don't write files, K8s auto-saves stdout\nkubectl logs just works", border: COLORS.success, fill: COLORS.cardSuccess },
    { title: "🔄 DaemonSet / Sidecar Collection", desc: "One log collector per Node\nAuto-collects stdout from all Containers", border: COLORS.success, fill: COLORS.cardSuccess },
    { title: "🏷️ Attach Metadata", desc: "Auto-append: pod name, namespace, node\napp label → easy filtering", border: COLORS.accent, fill: COLORS.bg2 },
    { title: "⚡ Centralized Storage + Search", desc: "Elasticsearch / Loki\nFull-text search + structured queries", border: COLORS.accent, fill: COLORS.bg2 },
  ];
  solutions.forEach((s, i) => {
    const y = 1.1 + i * 0.62;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.1, y, w: 4.5, h: 0.56, rectRadius: 0.08,
      fill: { color: s.fill },
      line: { color: s.border, width: 1.2 },
    });
    slide.addText(s.title, {
      x: 5.25, y: y + 0.02, w: 4.2, h: 0.24,
      fontSize: 10.5, bold: true, color: s.border, fontFace: FONTS.body,
    });
    slide.addText(s.desc, {
      x: 5.25, y: y + 0.26, w: 4.2, h: 0.28,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.78,
    text: "K8s Container stdout → /var/log/containers/*.log is auto-saved — Log collectors only need to tail this directory",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 112 — Sidecar vs DaemonSet Collection Pattern
// ─────────────────────────────────────────────────────────────────────────────
function slide112(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log Collection Architecture: Sidecar vs DaemonSet Pattern",
    partLabel: "PART 8",
    accentColor: COLORS.container,
  });

  // Left: DaemonSet
  slide.addText("🔵 DaemonSet Pattern (Recommended)", {
    x: 0.4, y: 0.65, w: 4.2, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  addZoneBorder(slide, pres, { x: 0.3, y: 1.0, w: 4.3, h: 3.4, color: COLORS.container, label: "K8s Node" });

  addMiniNode(slide, pres, { x: 0.5, y: 1.25, emoji: "⚙️", label: "App Pod 1\nstdout", borderColor: COLORS.backend, w: 1.15 });
  addMiniNode(slide, pres, { x: 0.5, y: 1.82, emoji: "⚙️", label: "App Pod 2", borderColor: COLORS.backend, w: 1.15 });
  addMiniNode(slide, pres, { x: 0.5, y: 2.39, emoji: "⚙️", label: "App Pod 3", borderColor: COLORS.backend, w: 1.15 });

  // Log files column
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.78, y: 1.18, w: 1.12, h: 2.2, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 0.8 },
  });
  slide.addText("/var/log/\ncontainers/\n*.log", {
    x: 1.78, y: 1.22, w: 1.12, h: 2.1,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.code, align: "center", valign: "middle",
  });

  // Arrows from pods to log dir
  addHArrow(slide, pres, { x: 1.68, y: 1.52, color: COLORS.textMuted, w: 0.08 });
  addHArrow(slide, pres, { x: 1.68, y: 2.07, color: COLORS.textMuted, w: 0.08 });
  addHArrow(slide, pres, { x: 1.68, y: 2.62, color: COLORS.textMuted, w: 0.08 });

  // DaemonSet collector
  addNodeCard(slide, pres, { x: 3.15, y: 1.65, w: 1.35, h: 1.0, emoji: "🔄", name: "Fluent Bit\n(DaemonSet)", meta: "1 per Node", borderColor: COLORS.success });
  addHArrow(slide, pres, { x: 2.92, y: 2.22, color: COLORS.warning, w: 0.2 });

  slide.addText("✅ 1 Collector = 1 Node | Lightweight | Shared by all Pods", {
    x: 0.4, y: 4.52, w: 4.1, h: 0.3,
    fontSize: 10, color: COLORS.success, fontFace: FONTS.body,
  });

  // Right: Sidecar
  slide.addText("🟡 Sidecar Pattern (Special Cases)", {
    x: 5.2, y: 0.65, w: 4.4, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });

  addZoneBorder(slide, pres, { x: 5.1, y: 1.0, w: 4.5, h: 1.85, color: COLORS.warning, label: "Pod (with sidecar)" });
  addMiniNode(slide, pres, { x: 5.3, y: 1.38, emoji: "⚙️", label: "App\nContainer", borderColor: COLORS.backend, w: 1.5 });
  addMiniNode(slide, pres, { x: 7.25, y: 1.38, emoji: "🔄", label: "Fluent Bit\nSidecar", borderColor: COLORS.warning, w: 1.5 });
  addHArrow(slide, pres, { x: 6.85, y: 1.78, label: "shared\nvolume", color: COLORS.warning, w: 0.38 });

  const useCases = [
    { text: "Use when: each app needs its own log format configuration", fill: COLORS.bg2, border: COLORS.border, color: COLORS.text },
    { text: "Use when: legacy app writes to files (no code change)", fill: COLORS.bg2, border: COLORS.border, color: COLORS.text },
    { text: "⚠️ Downside: extra sidecar container per Pod (2× resources)", fill: COLORS.cardWarn, border: COLORS.warning, color: COLORS.warning },
    { text: "⚠️ Downside: complex config, hard to manage uniformly", fill: COLORS.cardWarn, border: COLORS.warning, color: COLORS.warning },
  ];
  useCases.forEach((uc, i) => {
    const y = 3.0 + i * 0.48;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.1, y, w: 4.5, h: 0.42, rectRadius: 0.06,
      fill: { color: uc.fill },
      line: { color: uc.border, width: 0.8 },
    });
    slide.addText(uc.text, {
      x: 5.25, y, w: 4.2, h: 0.42,
      fontSize: 9.5, color: uc.color, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 4.78,
    text: "In K8s, 99% use DaemonSet (Fluent Bit) — unless you have a legacy app that cannot output to stdout",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 113 — ELK / EFK Stack Architecture
// ─────────────────────────────────────────────────────────────────────────────
function slide113(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "ELK / EFK Stack: The Industry's Most Widely Used Log Management Solution",
    partLabel: "PART 8",
    accentColor: COLORS.accent,
  });

  // Applications zone
  addZoneBorder(slide, pres, { x: 0.2, y: 0.72, w: 2.05, h: 2.7, color: COLORS.backend, label: "Applications" });
  addMiniNode(slide, pres, { x: 0.32, y: 1.05, emoji: "🌐", label: "nginx", borderColor: COLORS.frontend, w: 0.9 });
  addMiniNode(slide, pres, { x: 1.28, y: 1.05, emoji: "⚙️", label: "api", borderColor: COLORS.backend, w: 0.9 });
  addMiniNode(slide, pres, { x: 0.32, y: 1.72, emoji: "📦", label: "order", borderColor: COLORS.backend, w: 0.9 });
  addMiniNode(slide, pres, { x: 1.28, y: 1.72, emoji: "💳", label: "payment", borderColor: COLORS.infra, w: 0.9 });
  addMiniNode(slide, pres, { x: 0.32, y: 2.39, emoji: "📧", label: "email", borderColor: COLORS.warning, w: 0.9 });
  addMiniNode(slide, pres, { x: 1.28, y: 2.39, emoji: "🗄️", label: "db", borderColor: COLORS.database, w: 0.9 });

  addHArrow(slide, pres, { x: 2.32, y: 2.0, label: "stdout", color: COLORS.textMuted, w: 0.48 });

  // Collect
  addNodeCard(slide, pres, { x: 2.88, y: 0.78, w: 1.55, h: 2.62, emoji: "🔄", name: "Fluentd /\nFluent Bit", meta: "DaemonSet\n- tail logs\n- parse JSON\n- add k8s meta\n- filter", borderColor: COLORS.warning });

  addHArrow(slide, pres, { x: 4.52, y: 2.02, label: "ship", color: COLORS.warning, w: 0.45 });

  // Transform
  addNodeCard(slide, pres, { x: 5.08, y: 1.25, w: 1.35, h: 1.5, emoji: "🔧", name: "Logstash", meta: "(optional)\n- transform\n- enrich\n- route", borderColor: COLORS.infra });

  addHArrow(slide, pres, { x: 6.5, y: 1.95, color: COLORS.accent, w: 0.38 });

  // Store
  addNodeCard(slide, pres, { x: 6.98, y: 0.78, w: 1.52, h: 2.62, emoji: "🔍", name: "Elasticsearch", meta: "- index logs\n- full-text search\n- retention ILM\n- shard/replica", borderColor: COLORS.accent });

  addHArrow(slide, pres, { x: 8.58, y: 2.02, color: COLORS.frontend, w: 0.35 });

  // Visualize
  addNodeCard(slide, pres, { x: 9.0, y: 1.3, w: 0.9, h: 1.52, emoji: "📊", name: "Kibana", meta: "search\ndashboard\nalert", borderColor: COLORS.frontend });

  // EFK alternative
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.62, w: 4.3, h: 0.65, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.container, width: 1.2 },
  });
  slide.addText("EFK Stack = E + Fluentd + K", {
    x: 0.45, y: 3.66, w: 4.0, h: 0.28,
    fontSize: 11, bold: true, color: COLORS.container, fontFace: FONTS.body,
  });
  slide.addText("Logstash → Fluentd (lighter, CNCF standard)", {
    x: 0.45, y: 3.94, w: 4.0, h: 0.28,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Loki alternative
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.85, y: 3.62, w: 4.85, h: 0.65, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("🆕 Grafana Loki: Lightweight Alternative", {
    x: 5.0, y: 3.66, w: 4.5, h: 0.28,
    fontSize: 11, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("Label-based indexing (no full-text indexing) → 90% storage cost reduction", {
    x: 5.0, y: 3.94, w: 4.5, h: 0.28,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  addTipBar(slide, pres, {
    y: 4.45,
    text: "ELK is powerful but expensive (Elasticsearch storage costs are high); Loki is cheap but weaker at search — choose based on budget and query needs",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 114 — Fluentd / Fluent Bit
// ─────────────────────────────────────────────────────────────────────────────
function slide114(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Fluentd / Fluent Bit: The Swiss Army Knife of Log Pipelines",
    partLabel: "PART 8",
    accentColor: COLORS.warning,
  });

  // Left: pipeline
  slide.addText("Processing Pipeline", {
    x: 0.4, y: 0.68, w: 4.8, h: 0.28,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  // Stage 1: INPUT
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.4, y: 0.98, w: 4.8, h: 1.0, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.warning, width: 1.2 },
  });
  slide.addText("⬇️ INPUT Plugins", {
    x: 0.55, y: 1.0, w: 2.0, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });
  const inputTypes = ["tail (file)", "systemd", "forward (TCP)", "http"];
  inputTypes.forEach((t, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.5 + i * 1.18, y: 1.34, w: 1.08, h: 0.55, rectRadius: 0.06,
      fill: { color: COLORS.bg3 },
      line: { color: COLORS.warning, width: 0.8 },
    });
    slide.addText(t, {
      x: 0.5 + i * 1.18, y: 1.34, w: 1.08, h: 0.55,
      fontSize: 8.5, color: COLORS.text, fontFace: FONTS.code, align: "center", valign: "middle",
    });
  });

  addVArrow(slide, pres, { x: 2.82, y: 2.06, h: 0.14, color: COLORS.warning });

  // Stage 2: FILTER
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.4, y: 2.12, w: 4.8, h: 1.0, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.accent, width: 1.2 },
  });
  slide.addText("🔧 FILTER Plugins", {
    x: 0.55, y: 2.14, w: 2.0, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });
  const filterTypes = ["parser (JSON/regex)", "grep (filter)", "record_transformer", "kubernetes"];
  filterTypes.forEach((t, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.5 + i * 1.18, y: 2.48, w: 1.08, h: 0.55, rectRadius: 0.06,
      fill: { color: COLORS.bg3 },
      line: { color: COLORS.accent, width: 0.8 },
    });
    slide.addText(t, {
      x: 0.5 + i * 1.18, y: 2.48, w: 1.08, h: 0.55,
      fontSize: 8.5, color: COLORS.text, fontFace: FONTS.code, align: "center", valign: "middle",
    });
  });

  addVArrow(slide, pres, { x: 2.82, y: 3.18, h: 0.14, color: COLORS.accent });

  // Stage 3: OUTPUT
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.4, y: 3.24, w: 4.8, h: 1.0, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("⬆️ OUTPUT Plugins", {
    x: 0.55, y: 3.26, w: 2.0, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  const outputTypes = ["elasticsearch", "kafka", "s3 (archive)", "stdout (debug)"];
  outputTypes.forEach((t, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.5 + i * 1.18, y: 3.6, w: 1.08, h: 0.55, rectRadius: 0.06,
      fill: { color: COLORS.bg3 },
      line: { color: COLORS.success, width: 0.8 },
    });
    slide.addText(t, {
      x: 0.5 + i * 1.18, y: 3.6, w: 1.08, h: 0.55,
      fontSize: 8.5, color: COLORS.text, fontFace: FONTS.code, align: "center", valign: "middle",
    });
  });

  // Right: comparison table
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.75, y: 0.75, w: 3.85, h: 1.48, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.border, width: 1.0 },
  });
  // Header row
  slide.addShape(pres.ShapeType.rect, {
    x: 5.75, y: 0.75, w: 3.85, h: 0.3,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 0 },
  });
  slide.addText("Comparison  |  Fluentd  |  Fluent Bit", {
    x: 5.85, y: 0.75, w: 3.65, h: 0.3,
    fontSize: 9, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });
  const tableRows = [
    "Language  |  Ruby  |  C/Rust (lightweight)",
    "Memory  |  ~40MB  |  ~650KB(!)",
    "Plugin  |  1000+  |  70+",
    "Best for  |  Servers  |  K8s DaemonSet",
  ];
  tableRows.forEach((row, i) => {
    const y = 1.08 + i * 0.28;
    slide.addShape(pres.ShapeType.rect, {
      x: 5.75, y, w: 3.85, h: 0.28,
      fill: { color: i % 2 === 0 ? COLORS.bg2 : COLORS.bg3 },
      line: { color: COLORS.border, width: 0 },
    });
    slide.addText(row, {
      x: 5.85, y, w: 3.65, h: 0.28,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
    });
  });

  addCodeCard(slide, pres, {
    x: 5.75, y: 2.35, w: 3.85, h: 2.95,
    language: "fluent-bit.conf",
    code: "[SERVICE]\n  Flush        5\n  Log_Level    info\n\n[INPUT]\n  Name         tail\n  Path         /var/log/containers/*.log\n  Parser       docker\n  Tag          kube.*\n\n[FILTER]\n  Name         kubernetes\n  Match        kube.*\n  Merge_Log    On\n  Keep_Log     Off\n\n[OUTPUT]\n  Name         es\n  Match        *\n  Host         elasticsearch\n  Port         9200\n  Index        k8s-logs",
  });

  addTipBar(slide, pres, {
    y: 5.4,
    text: "Fluent Bit is nearly standard in K8s — uses only 650KB memory, one per Node, auto-collects all Container logs",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 115 — Grafana Loki: Label-based Log Management
// ─────────────────────────────────────────────────────────────────────────────
function slide115(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Grafana Loki: Managing Logs Like Prometheus",
    partLabel: "PART 8",
    accentColor: COLORS.success,
  });

  // Left: comparison
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "Elasticsearch vs Loki",
    type: "good",
  });

  const compareRows = [
    {
      label: "Indexing",
      left: "Elasticsearch: Full-text index\nHigh storage cost",
      leftFill: COLORS.cardWarn, leftBorder: COLORS.warning,
      right: "Loki: Index labels only\n90% lower storage cost",
      rightFill: COLORS.cardSuccess, rightBorder: COLORS.success,
    },
    {
      label: "Search",
      left: "Full-text arbitrary search, very powerful",
      leftFill: COLORS.bg2, leftBorder: COLORS.border,
      right: "LogQL queries, requires labels",
      rightFill: COLORS.bg2, rightBorder: COLORS.border,
    },
    {
      label: "Integration",
      left: "Kibana (separate installation)",
      leftFill: COLORS.bg2, leftBorder: COLORS.border,
      right: "Native Grafana support (all-in-one)",
      rightFill: COLORS.bg2, rightBorder: COLORS.border,
    },
    {
      label: "Cost",
      left: "💰 Expensive (high EC2 + Disk overhead)",
      leftFill: COLORS.cardDanger, leftBorder: COLORS.danger,
      right: "💚 Affordable (S3 for log data storage)",
      rightFill: COLORS.cardSuccess, rightBorder: COLORS.success,
    },
  ];

  compareRows.forEach((row, i) => {
    const y = 1.1 + i * 0.58;
    slide.addText(row.label, {
      x: 0.35, y, w: 0.8, h: 0.52,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.0, y, w: 1.6, h: 0.52, rectRadius: 0.06,
      fill: { color: row.leftFill },
      line: { color: row.leftBorder, width: 0.8 },
    });
    slide.addText(row.left, {
      x: 1.05, y, w: 1.5, h: 0.52,
      fontSize: 9, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 2.8, y, w: 1.7, h: 0.52, rectRadius: 0.06,
      fill: { color: row.rightFill },
      line: { color: row.rightBorder, width: 0.8 },
    });
    slide.addText(row.right, {
      x: 2.85, y, w: 1.6, h: 0.52,
      fontSize: 9, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  // When to choose Loki
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.48, w: 4.4, h: 0.72, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("Choose Loki: Grafana ecosystem, cost-sensitive, logs queried by service/namespace", {
    x: 0.45, y: 3.52, w: 4.1, h: 0.35,
    fontSize: 10, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
  });
  slide.addText("Choose ES: Need complex full-text search, existing Elastic investment", {
    x: 0.45, y: 3.86, w: 4.1, h: 0.3,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Right: LogQL + architecture
  addCodeCard(slide, pres, {
    x: 5.15, y: 0.72, w: 4.55, h: 2.28,
    language: "LogQL Examples",
    code: '# 1. Filter ERROR logs for a specific service\n{service="payment-svc", env="prod"}\n  |= "ERROR"\n\n# 2. Parse JSON + filter fields\n{service="api"}\n  | json\n  | status >= 500\n\n# 3. Calculate error rate per minute\nsum(rate({service="api"} |= "ERROR" [1m]))\n  by (service)\n\n# 4. Find correlated logs by trace_id\n{namespace="prod"}\n  |= `trace_id="abc-123-xyz"`',
  });

  addNodeCard(slide, pres, { x: 5.15, y: 3.12, w: 2.1, h: 1.2, emoji: "🔄", name: "Promtail\nAgent", meta: "push logs\n(DaemonSet)", borderColor: COLORS.warning });
  addHArrow(slide, pres, { x: 7.3, y: 3.62, label: "push", color: COLORS.success, w: 0.42 });
  addNodeCard(slide, pres, { x: 7.8, y: 3.12, w: 2.0, h: 1.2, emoji: "📋", name: "Grafana\nLoki", meta: "label index\n+ S3 storage", borderColor: COLORS.success });

  addTipBar(slide, pres, {
    y: 4.45,
    text: "Loki's philosophy: Index only labels (service, env, pod), store log body in S3 — saves money but sacrifices full-text search flexibility",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 116 — Log Sampling Strategies
// ─────────────────────────────────────────────────────────────────────────────
function slide116(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log Sampling Strategies: Balancing Completeness and Cost",
    partLabel: "PART 8",
    accentColor: COLORS.warning,
  });

  // Volume problem stats
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 4.4, h: 1.28, rectRadius: 0.08,
    fill: { color: COLORS.cardWarn },
    line: { color: COLORS.warning, width: 1.5 },
  });
  slide.addText("Typical System Log Volume", {
    x: 0.3, y: 0.68, w: 4.4, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.warning, fontFace: FONTS.body, align: "center",
  });
  slide.addText("50 microservices × 1000 req/s × avg 3 log lines × 500 bytes", {
    x: 0.3, y: 1.0, w: 4.4, h: 0.3,
    fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });
  slide.addText("= 75 MB/s = 6.5 TB/day = 195 TB/month 💸", {
    x: 0.3, y: 1.3, w: 4.4, h: 0.55,
    fontSize: 12, bold: true, color: COLORS.danger, fontFace: FONTS.body, align: "center", valign: "middle",
  });

  // 4 sampling strategies
  const strategies = [
    { title: "① 100% Record Errors", desc: "Keep all ERRORs — no sampling, cost is acceptable", fill: COLORS.cardSuccess, border: COLORS.success },
    { title: "② N% Sample Success", desc: "Normal requests keep only 10% — statistically sufficient, saves 90% cost", fill: COLORS.bg2, border: COLORS.accent },
    { title: "③ Head-based Sampling", desc: "Decide at request start: if trace is sampled, keep all its logs", fill: COLORS.bg2, border: COLORS.accent },
    { title: "④ Dynamic Sampling", desc: "New trace_ids keep all; repeated patterns reduce sample rate", fill: COLORS.bg2, border: COLORS.infra },
  ];
  strategies.forEach((s, i) => {
    const y = 2.05 + i * 0.65;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 4.4, h: 0.58, rectRadius: 0.08,
      fill: { color: s.fill },
      line: { color: s.border, width: 1.2 },
    });
    slide.addText(s.title, {
      x: 0.45, y: y + 0.04, w: 4.1, h: 0.26,
      fontSize: 10.5, bold: true, color: s.border, fontFace: FONTS.body,
    });
    slide.addText(s.desc, {
      x: 0.45, y: y + 0.3, w: 4.1, h: 0.24,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  // Right: retention policy
  slide.addText("Log Retention Policy (ILM)", {
    x: 5.2, y: 0.68, w: 4.4, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  const tiers = [
    { title: "🔥 Hot (0-7 days)", desc: "SSD storage, fast queries | Recent incidents | Most expensive", fill: COLORS.cardSuccess, border: COLORS.success, titleColor: COLORS.success },
    { title: "⚡ Warm (7-30 days)", desc: "HDD storage | This month's events | Medium cost", fill: COLORS.cardWarn, border: COLORS.warning, titleColor: COLORS.warning },
    { title: "❄️ Cold (30+ days)", desc: "S3/GCS object storage | Compliance/audit | Very low cost", fill: COLORS.bg2, border: COLORS.textMuted, titleColor: COLORS.textMuted },
  ];
  tiers.forEach((t, i) => {
    const y = 1.05 + i * 0.72;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.2, y, w: 4.4, h: 0.65, rectRadius: 0.08,
      fill: { color: t.fill },
      line: { color: t.border, width: 1.2 },
    });
    slide.addText(t.title, {
      x: 5.35, y: y + 0.05, w: 4.1, h: 0.28,
      fontSize: 11, bold: true, color: t.titleColor, fontFace: FONTS.body,
    });
    slide.addText(t.desc, {
      x: 5.35, y: y + 0.33, w: 4.1, h: 0.28,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addCodeCard(slide, pres, {
    x: 5.15, y: 3.25, w: 4.55, h: 1.72,
    language: "Fluent Bit sampling filter",
    code: "[FILTER]\n  Name     grep\n  Match    *\n  # Keep only ERROR and WARN\n  Regex    level ^(ERROR|WARN)$\n\n[FILTER]\n  Name     sampling\n  Match    *\n  # Keep 1 out of every 10 INFO logs\n  Rate     0.1\n  Condition  level INFO",
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Three principles for log cost control: ERROR 100% retained, INFO sampled at 10%, DEBUG never in Production",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 117 — Log Query in Practice
// ─────────────────────────────────────────────────────────────────────────────
function slide117(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log Query in Practice: From Chaos to Insight in a Few Commands",
    partLabel: "PART 8",
    accentColor: COLORS.accent,
  });

  addCodeCard(slide, pres, {
    x: 0.3, y: 0.65, w: 9.4, h: 4.62,
    language: "Log Query Examples (Kibana KQL / Loki LogQL)",
    code: '# ===== Kibana KQL =====\n\n# 1. Find ERROR logs for a specific service in the last hour\nservice:"payment-svc" AND level:ERROR\n\n# 2. Find all actions by a specific user (audit)\nuser_id:"user-789" AND @timestamp:[now-24h TO now]\n\n# 3. Find high-latency requests (>1000ms)\nservice:"api" AND duration_ms:>1000\n\n# 4. Find all related logs for a specific trace\ntrace_id:"abc-123-xyz"\n\n\n# ===== Grafana LogQL (Loki) =====\n\n# 5. Calculate error rate per service (per minute)\nsum by(service) (\n  rate({namespace="prod"} |= "ERROR" [1m])\n)\n\n# 6. Extract fields from JSON logs and filter\n{service="order-svc"}\n  | json\n  | duration_ms > 500\n  | line_format "{{.user_id}} took {{.duration_ms}}ms"\n\n# 7. Find the slowest API endpoints\ntopk(10,\n  sum by(path) (rate({service="api"}\n    | json | duration_ms > 0 [5m])\n  )\n)',
  });

  addTipBar(slide, pres, {
    y: 5.38,
    text: "In Grafana you can jump from Metrics alerts directly to Logs (Explore), then to Traces — that is the power of observability",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 118 — Log-based Alerting
// ─────────────────────────────────────────────────────────────────────────────
function slide118(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log-based Alerting: Making Logs More Than Passive Records",
    partLabel: "PART 8",
    accentColor: COLORS.danger,
  });

  // Left: alert types
  slide.addText("Three Log Alerting Modes", {
    x: 0.4, y: 0.68, w: 4.6, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  const modes = [
    { title: "🔴 Keyword Alert", desc: "Log contains CRITICAL / OOM / panic → alert immediately", border: COLORS.danger },
    { title: "🟡 Rate Alert", desc: "ERROR count > 50 in 1 minute → something is wrong", border: COLORS.warning },
    { title: "🔵 Absence Alert", desc: "Health check log missing for 5 minutes → service may be down", border: COLORS.accent },
  ];
  modes.forEach((m, i) => {
    const y = 1.0 + i * 0.72;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 4.5, h: 0.65, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: m.border, width: 1.2 },
    });
    slide.addText(m.title, {
      x: 0.45, y: y + 0.05, w: 4.1, h: 0.28,
      fontSize: 11, bold: true, color: m.border, fontFace: FONTS.body,
    });
    slide.addText(m.desc, {
      x: 0.45, y: y + 0.33, w: 4.1, h: 0.28,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addCodeCard(slide, pres, {
    x: 0.3, y: 3.18, w: 4.5, h: 2.0,
    language: "Kibana Alert Rule",
    code: "# Kibana Watcher (JSON)\nindex: k8s-logs-*\nfilter: level:ERROR\nthreshold: count > 100\ntime_window: 5m\nschedule: every 1m\naction: slack_webhook",
  });

  // Right
  addCodeCard(slide, pres, {
    x: 5.15, y: 0.75, w: 4.55, h: 2.35,
    language: "Loki Ruler Alert",
    code: "# prometheus-style alert from logs\ngroups:\n  - name: log-alerts\n    rules:\n      - alert: HighErrorRate\n        expr: |\n          sum(rate({namespace='prod'}\n            |= 'ERROR' [5m]))\n          / sum(rate({namespace='prod'} [5m]))\n          > 0.05\n        for: 2m\n        labels:\n          severity: critical\n        annotations:\n          summary: 'Error rate >5%'",
  });

  // Metrics from logs concept
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.15, y: 3.22, w: 4.55, h: 1.58, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("📊 Deriving Metrics from Logs", {
    x: 5.3, y: 3.26, w: 4.2, h: 0.32,
    fontSize: 11, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("Loki can compute Metrics from Logs in real time\nNo need to add a Prometheus client in the App\n→ Great for quickly adding Metrics to Legacy Apps", {
    x: 5.3, y: 3.6, w: 4.2, h: 1.12,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  addTipBar(slide, pres, {
    y: 4.98,
    text: "Log alerts are more context-rich than Metric alerts — alert messages can include log content, so on-call can see the problem at a glance",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 119 — Log Engineering Best Practices
// ─────────────────────────────────────────────────────────────────────────────
function slide119(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log Engineering Best Practices: Making Logs Truly Valuable",
    partLabel: "PART 8",
    accentColor: COLORS.success,
  });

  // Left: DOs
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "✅ Logging Best Practices",
    type: "good",
  });

  const dos = [
    { title: "✅ Output to stdout uniformly", desc: "Standard for containerized environments, K8s/Docker auto-handles" },
    { title: "✅ Use structured JSON format", desc: "Machine-readable, Kibana/Loki auto-parse fields" },
    { title: "✅ Include trace_id / correlation_id in every log", desc: "Correlate cross-service requests, one ID to trace all related logs" },
    { title: "✅ Include necessary context", desc: "user_id, service, version, env, duration_ms" },
    { title: "✅ Error logs with full Stack Trace", desc: "Don't just log the message, include the exception chain" },
    { title: "✅ Set appropriate Log Levels", desc: "Production: INFO+, enable DEBUG only when needed" },
  ];
  dos.forEach((d, i) => {
    const y = 1.08 + i * 0.52;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 4.4, h: 0.46, rectRadius: 0.06,
      fill: { color: COLORS.cardSuccess },
      line: { color: COLORS.success, width: 1.0 },
    });
    slide.addText(d.title, {
      x: 0.45, y: y + 0.02, w: 4.1, h: 0.22,
      fontSize: 9.5, bold: true, color: COLORS.success, fontFace: FONTS.body,
    });
    slide.addText(d.desc, {
      x: 0.45, y: y + 0.24, w: 4.1, h: 0.2,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  // Right: DON'Ts
  addCompareHeading(slide, pres, {
    x: 5.1, y: 0.62, w: 4.4,
    label: "❌ Logging Anti-Patterns",
    type: "bad",
  });

  const donts = [
    { title: "❌ Log sensitive data", desc: "Passwords, credit card numbers, PII — GDPR violation!", fill: COLORS.cardDanger, border: COLORS.danger, color: COLORS.danger },
    { title: "❌ DEBUG logs left in Production", desc: "Performance issues + storage cost explosion", fill: COLORS.cardDanger, border: COLORS.danger, color: COLORS.danger },
    { title: "❌ catch(e) { logger.error('error') }", desc: "No context, impossible to debug", fill: COLORS.cardDanger, border: COLORS.danger, color: COLORS.danger },
    { title: "❌ Log but never look", desc: "Collect massive logs but no Dashboard or alerts", fill: COLORS.cardWarn, border: COLORS.warning, color: COLORS.warning },
    { title: "❌ Log all fields for every request", desc: "No sampling strategy → 10× storage cost", fill: COLORS.cardWarn, border: COLORS.warning, color: COLORS.warning },
    { title: "❌ Only log errors, never successes", desc: "Cannot analyze normal traffic patterns", fill: COLORS.cardWarn, border: COLORS.warning, color: COLORS.warning },
  ];
  donts.forEach((d, i) => {
    const y = 1.08 + i * 0.52;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.1, y, w: 4.4, h: 0.46, rectRadius: 0.06,
      fill: { color: d.fill },
      line: { color: d.border, width: 1.0 },
    });
    slide.addText(d.title, {
      x: 5.25, y: y + 0.02, w: 4.1, h: 0.22,
      fontSize: 9.5, bold: true, color: d.color, fontFace: FONTS.body,
    });
    slide.addText(d.desc, {
      x: 5.25, y: y + 0.24, w: 4.1, h: 0.2,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "The most important logging principle: every log should have a reader — logs nobody reads are waste; alerts and dashboards are the purpose",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 120 — Logs Summary
// ─────────────────────────────────────────────────────────────────────────────
function slide120(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Logs Summary: From Event Records to System Insight",
    partLabel: "PART 8",
    accentColor: COLORS.warning,
  });

  // Journey pipeline
  addNodeCard(slide, pres, { x: 0.2, y: 0.72, w: 1.45, h: 1.3, emoji: "⚙️", name: "App", meta: "structlog\nJSON output", borderColor: COLORS.backend });
  addHArrow(slide, pres, { x: 1.7, y: 1.3, label: "stdout", color: COLORS.textMuted, w: 0.35 });
  addNodeCard(slide, pres, { x: 2.15, y: 0.72, w: 1.45, h: 1.3, emoji: "🔄", name: "Fluent Bit", meta: "DaemonSet\ncollect+parse", borderColor: COLORS.warning });
  addHArrow(slide, pres, { x: 3.65, y: 1.3, label: "ship", color: COLORS.warning, w: 0.38 });
  addNodeCard(slide, pres, { x: 4.13, y: 0.72, w: 1.45, h: 1.3, emoji: "🔍", name: "Loki / ES", meta: "index+store\nlabels", borderColor: COLORS.accent });
  addHArrow(slide, pres, { x: 5.63, y: 1.3, label: "query", color: COLORS.accent, w: 0.38 });
  addNodeCard(slide, pres, { x: 6.11, y: 0.72, w: 1.45, h: 1.3, emoji: "📊", name: "Grafana\nKibana", meta: "dashboard\nsearch", borderColor: COLORS.frontend });
  addHArrow(slide, pres, { x: 7.61, y: 1.3, label: "alert", color: COLORS.danger, w: 0.38 });
  addNodeCard(slide, pres, { x: 8.09, y: 0.72, w: 1.75, h: 1.3, emoji: "📱", name: "On-Call", meta: "investigate\n& resolve", borderColor: COLORS.warning });

  // 3 key takeaway cards
  const cards = [
    {
      x: 0.3, color: COLORS.warning,
      title: "📋 Structured First",
      items: "JSON format\nMachine-readable\ntrace_id required\nInclude enough context\nNo sensitive data",
    },
    {
      x: 3.45, color: COLORS.container,
      title: "🔄 DaemonSet Collection",
      items: "K8s standard:\nFluent Bit DaemonSet\nAuto-collect stdout\nAuto-add k8s metadata\nShip to Loki or ES",
    },
    {
      x: 6.6, color: COLORS.danger,
      title: "💰 Cost Control",
      items: "ERROR → 100% retained\nINFO → 10% sampled\nDEBUG → not in Prod\nHot/Warm/Cold tiers\nLoki 90% cheaper than ES",
    },
  ];

  cards.forEach((c) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: c.x, y: 2.3, w: 2.9, h: 2.8, rectRadius: 0.1,
      fill: { color: COLORS.bg2 },
      line: { color: c.color, width: 1.5 },
    });
    slide.addText(c.title, {
      x: c.x + 0.1, y: 2.38, w: 2.7, h: 0.36,
      fontSize: 11, bold: true, color: c.color, fontFace: FONTS.body, align: "center",
    });
    slide.addText(c.items, {
      x: c.x + 0.12, y: 2.78, w: 2.66, h: 2.2,
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
    slide106, slide107, slide108, slide109, slide110,
    slide111, slide112, slide113, slide114, slide115,
    slide116, slide117, slide118, slide119, slide120,
  ]) {
    await fn(pres);
  }

  await pres.writeFile({ fileName: "output/part8_logs.pptx" });
  console.log("part8_logs.pptx created");
}

main().catch(console.error);
