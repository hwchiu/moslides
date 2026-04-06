// src/obs_prometheus.js
// "When Metrics Go Silent" — Prometheus/Grafana Observability War Stories
// 30 slides, 40-minute talk for observability practitioners

"use strict";

const pptxgen = require("pptxgenjs");
const fs = require("fs");
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

  slide.addText("WHEN", {
    x: 0.5, y: 0.7, w: 5.5, h: 0.85,
    fontSize: 68, bold: true, color: COLORS.text, fontFace: FONTS.title, charSpacing: -1,
  });
  slide.addText("METRICS", {
    x: 0.5, y: 1.45, w: 5.5, h: 0.85,
    fontSize: 68, bold: true, color: COLORS.accent, fontFace: FONTS.title, charSpacing: -1,
  });
  slide.addText("GO SILENT", {
    x: 0.5, y: 2.2, w: 5.5, h: 0.85,
    fontSize: 68, bold: true, color: COLORS.danger, fontFace: FONTS.title, charSpacing: -1,
  });

  slide.addText("Observability War Stories from Production Kubernetes", {
    x: 0.5, y: 3.15, w: 5.4, h: 0.5,
    fontSize: 18, bold: false, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 3.75, w: 4.2, h: 0.35, rectRadius: 0.06,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.8 },
  });
  slide.addText("Prometheus  ·  Grafana  ·  Linux Kernel  ·  Kubernetes", {
    x: 0.55, y: 3.75, w: 4.1, h: 0.35,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.code, valign: "middle",
  });

  // Right: Journey cards (2x3)
  const sections = [
    { n: "01", label: "Sampling Basics", color: COLORS.accent },
    { n: "02", label: "K8s Metrics Landscape", color: COLORS.success },
    { n: "03", label: "When Things Break", color: COLORS.danger },
    { n: "04", label: "Kernel Blind Spots", color: COLORS.warning },
    { n: "05", label: "Case Studies", color: COLORS.infra },
    { n: "06", label: "Fighting Back", color: COLORS.container },
  ];
  sections.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 5.9 + col * 2.0;
    const y = 0.65 + row * 1.35;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: 1.85, h: 1.2, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: s.color, width: 1.5 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x, y, w: 1.85, h: 0.28,
      fill: { color: s.color }, line: { color: s.color, width: 0 },
    });
    slide.addText(s.n, {
      x, y, w: 1.85, h: 0.28,
      fontSize: 9, bold: true, color: "FFFFFF", fontFace: FONTS.code,
      align: "center", valign: "middle",
    });
    slide.addText(s.label, {
      x: x + 0.1, y: y + 0.33, w: 1.65, h: 0.75,
      fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body,
      valign: "middle", align: "center",
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 2 — Agenda
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide2(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Today's Journey: From Metrics to Silence",
    partLabel: "OBS",
    accentColor: COLORS.accent,
  });

  const steps = [
    { icon: "📡", title: "How Prometheus Works", sub: "Pull model, scrape intervals, the sampling contract", color: COLORS.accent },
    { icon: "☸️", title: "Kubernetes Metric Heaven", sub: "node-exporter, kube-state-metrics, cAdvisor — rich data", color: COLORS.success },
    { icon: "💀", title: "When Things Break", sub: "CPU starvation, blank metrics, the Rashomon effect", color: COLORS.danger },
    { icon: "🐧", title: "Linux Kernel Blind Spots", sub: "Hidden /proc params, what node-exporter misses", color: COLORS.warning },
    { icon: "🔥", title: "Real Case Studies", sub: "Thread explosion, zombie storms, cascading failures", color: COLORS.infra },
    { icon: "🛡️", title: "Fighting Back", sub: "Node Problem Detector, eBPF, kernel forensics", color: COLORS.container },
  ];

  steps.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.3 + col * 3.15;
    const y = HEADER_H + 0.18 + row * 2.1;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: 3.0, h: 1.92, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: s.color, width: 1.5 },
    });
    slide.addText(s.icon, {
      x, y: y + 0.18, w: 3.0, h: 0.55,
      fontSize: 28, align: "center", valign: "middle",
    });
    slide.addText(s.title, {
      x: x + 0.12, y: y + 0.78, w: 2.76, h: 0.35,
      fontSize: 11.5, bold: true, color: s.color, fontFace: FONTS.body, align: "center",
    });
    slide.addText(s.sub, {
      x: x + 0.12, y: y + 1.13, w: 2.76, h: 0.65,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center", valign: "top",
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 3 — Section 1 Opener
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide3(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Section 1 — How Prometheus Really Works",
    partLabel: "OBS · 01",
    accentColor: COLORS.accent,
    complexity: 2,
  });

  slide.addText("01", {
    x: 0.3, y: 0.65, w: 2.8, h: 2.4,
    fontSize: 160, bold: true, color: COLORS.bg3, fontFace: FONTS.title,
    align: "center", valign: "middle",
  });

  const topics = [
    { icon: "📡", text: "Prometheus pull model vs push" },
    { icon: "⏱️", text: "Scrape intervals and what happens between them" },
    { icon: "📊", text: "Time-series data: what a 'sample' really means" },
    { icon: "⚠️", text: "The silent contract: no data is not no problem" },
  ];
  topics.forEach((t, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 3.3, y: 0.7 + i * 0.95, w: 6.3, h: 0.8, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.8 },
    });
    slide.addText(t.icon + "  " + t.text, {
      x: 3.5, y: 0.7 + i * 0.95, w: 6.0, h: 0.8,
      fontSize: 13, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Key insight: Prometheus is a sampling system. Every decision about scrape intervals is a trade-off between accuracy and overhead.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 4 — The Prometheus Scrape Pipeline
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide4(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "The Prometheus Scrape Pipeline",
    partLabel: "OBS · 01",
    accentColor: COLORS.accent,
    complexity: 2,
  });

  const exporters = [
    { x: 0.25, emoji: "📦", name: "App", meta: "/metrics\nendpoint", color: COLORS.backend },
    { x: 2.0,  emoji: "🖥️", name: "node-exporter", meta: "host metrics", color: COLORS.infra },
    { x: 3.75, emoji: "☸️", name: "kube-state-metrics", meta: "k8s objects", color: COLORS.container },
    { x: 5.5,  emoji: "🐳", name: "cAdvisor", meta: "container metrics", color: COLORS.accent },
  ];
  exporters.forEach(e => {
    addNodeCard(slide, pres, {
      x: e.x, y: 0.65, w: 1.6, h: 1.0,
      emoji: e.emoji, name: e.name, meta: e.meta,
      borderColor: e.color, nameColor: e.color,
    });
  });

  [0.25, 2.0, 3.75, 5.5].forEach(x => {
    addVArrow(slide, pres, { x: x + 0.75, y: 1.68, h: 0.45, color: COLORS.border });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.2, y: 2.18, w: 7.0, h: 0.85, rectRadius: 0.1,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.accent, width: 2.0 },
  });
  slide.addText("📡  Prometheus Server", {
    x: 0.35, y: 2.18, w: 3.0, h: 0.85,
    fontSize: 14, bold: true, color: COLORS.accent, fontFace: FONTS.body, valign: "middle",
  });
  slide.addText("scrape_interval: 15s  |  TSDB storage  |  PromQL engine", {
    x: 3.3, y: 2.18, w: 3.7, h: 0.85,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.code, valign: "middle",
  });

  addHArrow(slide, pres, { x: 7.25, y: 2.6, w: 0.8, label: "PromQL", color: COLORS.accent });

  addNodeCard(slide, pres, {
    x: 8.1, y: 2.18, w: 1.6, h: 0.85,
    emoji: "📊", name: "Grafana", meta: "Dashboards",
    borderColor: COLORS.warning, nameColor: COLORS.warning,
  });

  addZoneBorder(slide, pres, {
    x: 0.2, y: 0.62, w: 7.0, h: 2.44,
    color: COLORS.border, label: "Scrape targets",
  });

  addAlertBar(slide, pres, {
    y: 3.22,
    message: "Every 15 seconds, Prometheus sends HTTP GET to each target. If target is slow, overloaded, or unreachable — that scrape is MISSED.",
    tags: ["scrape_timeout: 10s", "up{} = 0 on failure"],
  });

  addKnowledgeCards(slide, pres, [
    { title: "Pull Model", body: "Prometheus initiates scrapes. Targets don't push. This means Prometheus can detect down targets via 'up{} = 0'.", color: COLORS.accent },
    { title: "Scrape Gap", body: "Between scrapes, Prometheus knows NOTHING. A 30-second outage between two 15s scrapes = invisible.", color: COLORS.warning },
    { title: "Stale Markers", body: "After 5 missed scrapes (~75s), Prometheus marks the series as stale. Grafana shows a gap — not zero.", color: COLORS.danger },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 5 — Sampling: The Silent Contract
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide5(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Sampling: The Silent Contract You Agreed To",
    partLabel: "OBS · 01",
    accentColor: COLORS.accent,
    complexity: 3,
  });

  slide.addText("📉", {
    x: 0.3, y: 0.7, w: 2.5, h: 2.5,
    fontSize: 96, align: "center", valign: "middle",
  });

  const points = [
    { title: "Every metric is a snapshot, not reality", sub: "You see CPU at T=0 and T=15s. What happened in between? Unknown." },
    { title: "High-frequency spikes are invisible", sub: "A 500ms CPU spike between scrapes leaves no trace in Prometheus." },
    { title: "Counter resets can be misleading", sub: "If a process restarts between scrapes, the counter jump looks like a huge spike." },
    { title: "rate() hides the gaps", sub: "PromQL rate() interpolates between points — it assumes linearity that may not exist." },
  ];
  points.forEach((p, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 3.0, y: 0.68 + i * 0.88, w: 6.6, h: 0.78, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.8 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x: 3.0, y: 0.68 + i * 0.88, w: 0.06, h: 0.78,
      fill: { color: COLORS.accent }, line: { color: COLORS.accent, width: 0 },
    });
    slide.addText(p.title, {
      x: 3.15, y: 0.68 + i * 0.88 + 0.04, w: 6.3, h: 0.26,
      fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(p.sub, {
      x: 3.15, y: 0.68 + i * 0.88 + 0.32, w: 6.3, h: 0.4,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.53,
    text: "Prometheus is excellent for trends and aggregates over time — but it was never designed to capture every event. That is what logs are for.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 6 — The Illusion of Completeness
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide6(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "The Illusion of Completeness: What a Healthy Dashboard Hides",
    partLabel: "OBS · 01",
    accentColor: COLORS.warning,
    complexity: 3,
  });

  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.58, w: 0.01, h: 3.7,
    line: { color: COLORS.border, width: 0.5 },
  });

  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.3, label: "What We See in Grafana", type: "good",
  });
  addCompareHeading(slide, pres, {
    x: 5.15, y: 0.62, w: 4.4, label: "What Might Be True", type: "bad",
  });

  const left = [
    { icon: "OK", text: "CPU steady at 40%" },
    { icon: "OK", text: "Memory looks normal" },
    { icon: "OK", text: "No alerts firing" },
    { icon: "OK", text: "Dashboard all green" },
    { icon: "OK", text: "Grafana shows data" },
  ];
  const right = [
    { icon: "!!", text: "CPU spiked to 100% for 8 seconds — twice" },
    { icon: "!!", text: "OOM killer ran between scrapes, nobody noticed" },
    { icon: "!!", text: "Alert rule evaluated against stale data" },
    { icon: "!!", text: "node-exporter missed 3 scrapes: data interpolated" },
    { icon: "!!", text: "Kernel panic logged then system recovered silently" },
  ];

  left.forEach((item, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: 1.08 + i * 0.48, w: 4.3, h: 0.42, rectRadius: 0.06,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.success, width: 0.8 },
    });
    slide.addText("✅  " + item.text, {
      x: 0.45, y: 1.08 + i * 0.48, w: 4.0, h: 0.42,
      fontSize: 10.5, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  right.forEach((item, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.15, y: 1.08 + i * 0.48, w: 4.4, h: 0.42, rectRadius: 0.06,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.danger, width: 0.8 },
    });
    slide.addText("⚠️  " + item.text, {
      x: 5.3, y: 1.08 + i * 0.48, w: 4.1, h: 0.42,
      fontSize: 10, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addAlertBar(slide, pres, {
    y: 3.58,
    message: "A green dashboard doesn't mean nothing happened — it means Prometheus didn't capture it at sample time.",
    tags: ["Absence of evidence is not evidence of absence"],
  });

  addTipBar(slide, pres, {
    y: 4.18,
    text: "scrape_interval controls your observability resolution. 15s means events shorter than 15s may be completely invisible to you.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 7 — Section 2 Opener
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide7(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Section 2 — Kubernetes: Metric Heaven",
    partLabel: "OBS · 02",
    accentColor: COLORS.success,
    complexity: 3,
  });

  slide.addText("02", {
    x: 0.3, y: 0.65, w: 2.8, h: 2.4,
    fontSize: 160, bold: true, color: COLORS.bg3, fontFace: FONTS.title,
    align: "center", valign: "middle",
  });

  const topics = [
    { icon: "🖥️", text: "node-exporter: 1000+ host-level metrics" },
    { icon: "☸️", text: "kube-state-metrics: every K8s object state" },
    { icon: "🐳", text: "cAdvisor: per-container CPU, memory, network, I/O" },
    { icon: "📡", text: "Custom app metrics via /metrics endpoints" },
  ];
  topics.forEach((t, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 3.3, y: 0.7 + i * 0.95, w: 6.3, h: 0.8, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.8 },
    });
    slide.addText(t.icon + "  " + t.text, {
      x: 3.5, y: 0.7 + i * 0.95, w: 6.0, h: 0.8,
      fontSize: 13, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Kubernetes offers the richest default metric coverage of any platform — thousands of metrics out of the box. This is both its strength and its trap.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 8 — The Big Three Exporters
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide8(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "The Big Three: What Each Exporter Covers",
    partLabel: "OBS · 02",
    accentColor: COLORS.success,
    complexity: 3,
  });

  addThreeCols(slide, pres, [
    {
      title: "🖥️ node-exporter",
      icon: "🐧",
      color: COLORS.infra,
      items: [
        { text: "CPU usage by mode (user/sys/iowait)" },
        { text: "Memory: MemFree, Buffers, Cached" },
        { text: "Disk I/O: read/write bytes, IOPS" },
        { text: "Network: bytes, packets, errors" },
        { text: "Filesystem: available, inodes" },
        { text: "System: load avg, context switches" },
      ],
    },
    {
      title: "☸️ kube-state-metrics",
      icon: "📋",
      color: COLORS.container,
      items: [
        { text: "Pod phase (Pending/Running/Failed)" },
        { text: "Deployment replicas desired vs available" },
        { text: "Node conditions (Ready, MemoryPressure)" },
        { text: "PersistentVolume bound/released" },
        { text: "Job completions, failures" },
        { text: "HPA current vs desired replicas" },
      ],
    },
    {
      title: "🐳 cAdvisor",
      icon: "📦",
      color: COLORS.backend,
      items: [
        { text: "container_cpu_usage_seconds_total" },
        { text: "container_memory_working_set_bytes" },
        { text: "container_network_transmit_bytes_total" },
        { text: "container_fs_writes_bytes_total" },
        { text: "container_processes (thread count)" },
        { text: "OOM kills per container" },
      ],
    },
  ], { y: HEADER_H + 0.12, h: H - HEADER_H - 0.6 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Deploy all three: node-exporter and cAdvisor as DaemonSets (one per node), kube-state-metrics as a Deployment. Together they cover host, platform, and container runtime.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 9 — K8s Metrics Flow Architecture
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide9(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "How Kubernetes Metrics Flow: The Full Pipeline",
    partLabel: "OBS · 02",
    accentColor: COLORS.success,
    complexity: 4,
  });

  addZoneBorder(slide, pres, {
    x: 0.2, y: 0.62, w: 4.3, h: 3.1, color: COLORS.infra, label: "Worker Node (DaemonSet)",
  });

  addNodeCard(slide, pres, {
    x: 0.4, y: 0.88, w: 1.7, h: 0.82,
    emoji: "🖥️", name: "node-exporter", meta: ":9100/metrics",
    borderColor: COLORS.infra, nameColor: COLORS.infra,
  });
  addNodeCard(slide, pres, {
    x: 2.2, y: 0.88, w: 1.7, h: 0.82,
    emoji: "🐳", name: "cAdvisor", meta: ":8080/metrics",
    borderColor: COLORS.backend, nameColor: COLORS.backend,
  });

  addZoneBorder(slide, pres, {
    x: 0.4, y: 1.85, w: 3.8, h: 1.65, color: COLORS.border, label: "App Pods",
  });
  [0.55, 1.55, 2.55].forEach((x, i) => {
    addMiniNode(slide, pres, {
      x, y: 2.1, w: 0.95,
      emoji: "📦", label: "pod-" + (i + 1),
      borderColor: COLORS.backend,
    });
  });

  addNodeCard(slide, pres, {
    x: 0.4, y: 3.62, w: 3.8, h: 0.82,
    emoji: "☸️", name: "kube-state-metrics", meta: "Deployment  :8080/metrics",
    borderColor: COLORS.container, nameColor: COLORS.container,
  });

  addHArrow(slide, pres, { x: 4.56, y: 1.32, w: 0.65, label: "scrape", color: COLORS.infra });
  addHArrow(slide, pres, { x: 4.56, y: 2.22, w: 0.65, label: "scrape", color: COLORS.backend });
  addHArrow(slide, pres, { x: 4.56, y: 4.02, w: 0.65, label: "scrape", color: COLORS.container });

  addNodeCard(slide, pres, {
    x: 5.28, y: 1.85, w: 1.95, h: 1.2,
    emoji: "📡", name: "Prometheus", meta: "TSDB + PromQL",
    borderColor: COLORS.accent, nameColor: COLORS.accent,
  });

  addHArrow(slide, pres, { x: 7.28, y: 2.48, w: 0.7, label: "query", color: COLORS.accent });

  addNodeCard(slide, pres, {
    x: 8.02, y: 1.85, w: 1.7, h: 1.2,
    emoji: "📊", name: "Grafana", meta: "Dashboards\n& Alerts",
    borderColor: COLORS.warning, nameColor: COLORS.warning,
  });

  addCommentBar(slide, pres, {
    message: "// Every DaemonSet pod runs on every node — node-exporter sees host metrics, cAdvisor sees container metrics",
    sub: "Prometheus scrapes all of them. With 100 nodes, that is 200+ scrape targets per cycle.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 10 — Essential K8s PromQL Queries
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide10(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Essential Kubernetes PromQL Queries",
    partLabel: "OBS · 02",
    accentColor: COLORS.success,
    complexity: 4,
  });

  const queries = [
    {
      label: "Node CPU usage %",
      code: `100 - (avg by(instance) (
  rate(node_cpu_seconds_total{mode="idle"}[5m])
) * 100)`,
    },
    {
      label: "Pod memory working set (MB)",
      code: `container_memory_working_set_bytes{container!=""}
  / 1024 / 1024`,
    },
    {
      label: "Pods not running",
      code: `kube_pod_status_phase{phase!~"Running|Succeeded"} == 1`,
    },
    {
      label: "Node CPU iowait %",
      code: `rate(node_cpu_seconds_total{mode="iowait"}[5m]) * 100`,
    },
  ];

  queries.forEach((q, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.3 + col * 4.85;
    const y = HEADER_H + 0.12 + row * 2.15;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: 4.65, h: 1.98, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.8 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x, y, w: 4.65, h: 0.28,
      fill: { color: COLORS.success }, line: { color: COLORS.success, width: 0 },
    });
    slide.addText(q.label, {
      x: x + 0.1, y, w: 4.45, h: 0.28,
      fontSize: 9, bold: true, color: "FFFFFF", fontFace: FONTS.code,
      valign: "middle",
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 0.1, y: y + 0.35, w: 4.45, h: 1.52, rectRadius: 0.06,
      fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.5 },
    });
    slide.addText(q.code, {
      x: x + 0.18, y: y + 0.38, w: 4.28, h: 1.46,
      fontSize: 9.5, color: COLORS.text, fontFace: FONTS.code, valign: "top",
    });
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "These queries work because data flows reliably. In the next section, we will see what happens when that flow breaks down.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 11 — Section 3 Opener: When Things Break
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide11(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Section 3 — When Things Break",
    partLabel: "OBS · 03",
    accentColor: COLORS.danger,
    complexity: 7,
  });

  slide.addText("03", {
    x: 0.3, y: 0.65, w: 2.8, h: 2.4,
    fontSize: 160, bold: true, color: COLORS.bg3, fontFace: FONTS.title,
    align: "center", valign: "middle",
  });

  const topics = [
    { icon: "🔇", text: "Blank metrics: the node is broken but the chart is empty" },
    { icon: "⚡", text: "CPU starvation: even exporters can't get scheduled" },
    { icon: "0️⃣", text: "Blank vs. zero: they look the same, mean very different things" },
    { icon: "🎭", text: "The Rashomon effect: same dashboard, five opinions" },
  ];
  topics.forEach((t, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 3.3, y: 0.7 + i * 0.95, w: 6.3, h: 0.8, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.danger, width: 1.2 },
    });
    slide.addText(t.icon + "  " + t.text, {
      x: 3.5, y: 0.7 + i * 0.95, w: 6.0, h: 0.8,
      fontSize: 13, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addAlertBar(slide, pres, {
    y: 4.68,
    message: "When a system is most broken, its metrics are most likely to be absent. This is the fundamental observability paradox.",
    tags: ["The Heisenbug of Ops"],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 12 — Blank Metrics = Silent Alarms
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide12(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Blank Metrics = Silent Alarms: The Node is Screaming, Charts are Quiet",
    partLabel: "OBS · 03",
    accentColor: COLORS.danger,
    complexity: 7,
  });

  const events = [
    { t: "T=0:00", label: "Normal", sub: "Metrics flowing\nHealthy scrapes", color: COLORS.success },
    { t: "T=0:10", label: "Stress", sub: "CPU load spike\nKernel OOM events", color: COLORS.warning },
    { t: "T=0:20", label: "Crisis", sub: "node-exporter\nmissed scrapes", color: COLORS.danger },
    { t: "T=0:30", label: "BLANK", sub: "No data in\nPrometheus at all", color: COLORS.danger },
    { t: "T=0:45", label: "Alert?", sub: "absent() fires\n45s too late", color: COLORS.warning },
  ];

  events.forEach((e, i) => {
    const x = 0.3 + i * 1.85;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 0.65, w: 1.7, h: 1.8, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: e.color, width: 2.0 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x, y: 0.65, w: 1.7, h: 0.28,
      fill: { color: e.color }, line: { color: e.color, width: 0 },
    });
    slide.addText(e.t, {
      x, y: 0.65, w: 1.7, h: 0.28,
      fontSize: 9, bold: true, color: "FFFFFF", fontFace: FONTS.code,
      align: "center", valign: "middle",
    });
    slide.addText(e.label, {
      x, y: 1.0, w: 1.7, h: 0.45,
      fontSize: 14, bold: true, color: e.color, fontFace: FONTS.body, align: "center",
    });
    slide.addText(e.sub, {
      x: x + 0.08, y: 1.48, w: 1.54, h: 0.88,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center", valign: "top",
    });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.62, w: 9.4, h: 0.75, rectRadius: 0.08,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.8 },
  });
  slide.addText("Grafana shows:  T=0:00 [data]  T=0:10 [data]  T=0:20 [partial]  T=0:25-0:45 [NO DATA]  T=0:45 [data]", {
    x: 0.45, y: 2.62, w: 9.1, h: 0.75,
    fontSize: 10.5, color: COLORS.text, fontFace: FONTS.code, valign: "middle",
  });

  addAlertBar(slide, pres, {
    y: 3.54,
    message: "Users report outage at T=0:20. On-call opens Grafana. Sees partial data then blank. No obvious spike. No clear cause. Investigation begins in the dark.",
    tags: ["Classic pattern", "Everyone has seen this"],
  });

  addKnowledgeCards(slide, pres, [
    { title: "absent() Alert", body: "Use absent(metric) to alert when a metric disappears. But you need 5 missed scrapes (~75s) before Prometheus marks it stale.", color: COLORS.warning },
    { title: "Scrape Miss Counter", body: "scrape_samples_scraped tracks per-job. up{} = 0 means target unreachable. Monitor these meta-metrics!", color: COLORS.accent },
    { title: "The Gap Trap", body: "Grafana interpolates gaps by default. A blank period looks like a smooth line unless you set No value display to show gaps.", color: COLORS.danger },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 13 — CPU Starvation: Exporters Can't Run
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide13(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "CPU Starvation: When the Exporter Can't Get Scheduled",
    partLabel: "OBS · 03",
    accentColor: COLORS.danger,
    complexity: 8,
  });

  slide.addText("🔴", {
    x: 0.25, y: 0.65, w: 1.8, h: 1.8,
    fontSize: 80, align: "center", valign: "middle",
  });

  const points = [
    { title: "Linux is a preemptive scheduler", sub: "Processes compete for CPU time. Anything can starve anything else." },
    { title: "node-exporter is a normal process", sub: "No elevated priority by default. Under heavy load, it waits in the run queue." },
    { title: "Scrape timeout hits while exporter waits", sub: "Prometheus gives up after scrape_timeout (default 10s). Scrape fails — data gap." },
    { title: "The worse the problem, the less you see", sub: "A runaway workload creates blanks in the exact metrics you need to diagnose it." },
  ];

  points.forEach((p, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 2.1, y: 0.65 + i * 0.88, w: 7.5, h: 0.78, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.8 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x: 2.1, y: 0.65 + i * 0.88, w: 0.06, h: 0.78,
      fill: { color: COLORS.danger }, line: { color: COLORS.danger, width: 0 },
    });
    slide.addText(p.title, {
      x: 2.25, y: 0.65 + i * 0.88 + 0.04, w: 7.2, h: 0.26,
      fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(p.sub, {
      x: 2.25, y: 0.65 + i * 0.88 + 0.32, w: 7.2, h: 0.4,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addAlertBar(slide, pres, {
    y: 4.25,
    message: "Irony: The CPU starvation metric itself (node_cpu_seconds_total) may be missing because the exporter can't get CPU to report it.",
    tags: ["The observer effect", "Can't measure what's measuring you"],
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "Mitigation: Give node-exporter a higher CPU priority via K8s Priority Classes to guarantee it gets CPU even under heavy load.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 14 — Blank vs Zero
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide14(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Blank vs. Zero: They Look Similar, Mean Completely Different Things",
    partLabel: "OBS · 03",
    accentColor: COLORS.warning,
    complexity: 7,
  });

  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.58, w: 0.01, h: 3.85,
    line: { color: COLORS.border, width: 0.5 },
  });

  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.3, label: "Value is Zero", type: "good",
  });
  addCompareHeading(slide, pres, {
    x: 5.1, y: 0.62, w: 4.5, label: "No Value (Blank)", type: "bad",
  });

  const zeroItems = [
    { title: "Data WAS collected", sub: "Prometheus scraped successfully" },
    { title: "The metric is genuinely zero", sub: "No errors, no traffic, all quiet" },
    { title: "Safe to alert: 0 > threshold", sub: "You can write alert rules confidently" },
    { title: "error_rate = 0", sub: "No errors in this window" },
  ];
  const blankItems = [
    { title: "Data was NOT collected", sub: "Scrape failed, target down, timeout" },
    { title: "Unknown state — could be anything", sub: "Node panic, exporter crash, network issue" },
    { title: "Alert rules may NOT fire at all", sub: "absent() needed — easily forgotten" },
    { title: "error_rate = (blank)", sub: "Could be 0% or 100% — or node is dead" },
  ];

  zeroItems.forEach((item, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: 1.08 + i * 0.6, w: 4.3, h: 0.52, rectRadius: 0.06,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.success, width: 0.8 },
    });
    slide.addText(item.title, {
      x: 0.45, y: 1.08 + i * 0.6 + 0.04, w: 4.0, h: 0.24,
      fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(item.sub, {
      x: 0.45, y: 1.08 + i * 0.6 + 0.28, w: 4.0, h: 0.2,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });
  blankItems.forEach((item, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.1, y: 1.08 + i * 0.6, w: 4.5, h: 0.52, rectRadius: 0.06,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.danger, width: 0.8 },
    });
    slide.addText(item.title, {
      x: 5.25, y: 1.08 + i * 0.6 + 0.04, w: 4.2, h: 0.24,
      fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(item.sub, {
      x: 5.25, y: 1.08 + i * 0.6 + 0.28, w: 4.2, h: 0.2,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addAlertBar(slide, pres, {
    y: 3.58,
    message: "Alert rule fires IF metric > threshold. If metric is blank — the rule never evaluates. You need BOTH threshold alerts AND absent() guards.",
    tags: ["Common mistake", "Production incident root cause"],
  });

  addCommentBar(slide, pres, {
    message: "// Recommended: always pair threshold alerts with absent() alerts",
    sub: "alert: HighErrorRate OR alert: ErrorMetricMissing (using absent(error_rate_metric))",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 15 — The Rashomon Effect
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide15(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "The Rashomon Effect: Same Dashboard, Five Different Stories",
    partLabel: "OBS · 03",
    accentColor: COLORS.danger,
    complexity: 8,
  });

  // Center: blank dashboard
  slide.addShape(pres.ShapeType.roundRect, {
    x: 3.5, y: 0.68, w: 3.0, h: 1.4, rectRadius: 0.1,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 1.5 },
  });
  slide.addText("Grafana Dashboard", {
    x: 3.55, y: 0.72, w: 2.9, h: 0.3,
    fontSize: 9, bold: true, color: COLORS.textMuted, fontFace: FONTS.code, align: "center",
  });
  slide.addText("[ NO DATA ]", {
    x: 3.55, y: 1.02, w: 2.9, h: 0.92,
    fontSize: 18, bold: true, color: COLORS.textMuted, fontFace: FONTS.code, align: "center", valign: "middle",
  });

  const opinions = [
    { x: 0.2,  y: 0.62, w: 3.1, color: COLORS.backend,
      who: "App Developer", says: '"My app is fine. No errors in my code logs. Must be infra."' },
    { x: 6.6,  y: 0.62, w: 3.1, color: COLORS.infra,
      who: "Infra Engineer", says: '"Network is clean. No drops. Check the app config."' },
    { x: 0.2,  y: 2.6,  w: 3.1, color: COLORS.warning,
      who: "Security Team", says: '"Blank metrics could be a DDoS data-plane attack. Lock it down."' },
    { x: 6.6,  y: 2.6,  w: 3.1, color: COLORS.container,
      who: "K8s Admin", says: '"Pod restarts look normal. Etcd healthy. Dashboard issue?"' },
    { x: 3.5,  y: 2.35, w: 3.0, color: COLORS.danger,
      who: "On-Call Engineer", says: '"Users are down. Nobody knows why. P0 declared."' },
  ];

  opinions.forEach(o => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: o.x, y: o.y, w: o.w, h: 1.65, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: o.color, width: 1.2 },
    });
    slide.addText(o.who, {
      x: o.x + 0.1, y: o.y + 0.08, w: o.w - 0.2, h: 0.3,
      fontSize: 10.5, bold: true, color: o.color, fontFace: FONTS.body,
    });
    slide.addText(o.says, {
      x: o.x + 0.1, y: o.y + 0.42, w: o.w - 0.2, h: 1.12,
      fontSize: 9.5, italic: true, color: COLORS.text, fontFace: FONTS.body, valign: "top",
    });
  });

  addAlertBar(slide, pres, {
    y: 4.42,
    message: "When metrics are blank, every team fills the vacuum with assumptions from their own domain. The incident becomes political. Resolution stalls.",
    tags: ["The real cost of blank metrics"],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 16 — Section 4 Opener: Linux Kernel Blind Spots
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide16(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Section 4 — Linux Kernel: The Dark Matter",
    partLabel: "OBS · 04",
    accentColor: COLORS.warning,
    complexity: 8,
  });

  slide.addText("04", {
    x: 0.3, y: 0.65, w: 2.8, h: 2.4,
    fontSize: 160, bold: true, color: COLORS.bg3, fontFace: FONTS.title,
    align: "center", valign: "middle",
  });

  const topics = [
    { icon: "🔭", text: "What node-exporter doesn't collect by default" },
    { icon: "⚙️", text: "Critical kernel parameters hidden in /proc and /sys" },
    { icon: "🧩", text: "The knowledge gap: incidents reveal what you should monitor" },
    { icon: "⚡", text: "CPU preemption cascade: a kernel-level feedback loop" },
  ];
  topics.forEach((t, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 3.3, y: 0.7 + i * 0.95, w: 6.3, h: 0.8, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.warning, width: 1.2 },
    });
    slide.addText(t.icon + "  " + t.text, {
      x: 3.5, y: 0.7 + i * 0.95, w: 6.0, h: 0.8,
      fontSize: 13, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addAlertBar(slide, pres, {
    y: 4.68,
    message: "The Linux kernel exposes thousands of tunable parameters and counters. node-exporter covers a curated subset. The rest are dark matter.",
    tags: ["/proc/sys", "sysctl -a returns 1000+ parameters"],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 17 — Hidden Kernel Parameters
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide17(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Hidden Kernel Parameters: What node-exporter Doesn't Expose",
    partLabel: "OBS · 04",
    accentColor: COLORS.warning,
    complexity: 8,
  });

  addThreeCols(slide, pres, [
    {
      title: "Memory Subsystem",
      icon: "💾",
      color: COLORS.infra,
      items: [
        { text: "/proc/vmstat: oom_kill count" },
        { text: "nr_throttled_background_pages" },
        { text: "pgscan_kswapd / pgsteal_kswapd" },
        { text: "numa_foreign / numa_miss" },
        { text: "compaction_stall (huge pages)" },
        { text: "Not in default node-exporter!" },
      ],
    },
    {
      title: "Scheduler / CPU",
      icon: "🔄",
      color: COLORS.danger,
      items: [
        { text: "nr_running: run queue depth" },
        { text: "nr_uninterruptible: D-state procs" },
        { text: "/proc/schedstat: wait_sum" },
        { text: "cpu_steal_time (on VMs)" },
        { text: "context_switch rate (cs/s)" },
        { text: "Needs --collector.schedstat flag" },
      ],
    },
    {
      title: "Kernel Limits",
      icon: "📁",
      color: COLORS.warning,
      items: [
        { text: "/proc/sys/kernel/threads-max" },
        { text: "/proc/sys/kernel/pid_max" },
        { text: "/proc/sys/vm/overcommit_memory" },
        { text: "/proc/sys/net/ipv4/tcp_tw_reuse" },
        { text: "file-max: open file descriptor limit" },
        { text: "inotify/max_user_watches" },
      ],
    },
  ], { y: HEADER_H + 0.12, h: H - HEADER_H - 0.6 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Enable additional collectors: --collector.schedstat --collector.vmstat --collector.processes. Each adds crucial kernel visibility.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 18 — The Knowledge Gap
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide18(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "The Knowledge Gap: Too Much Signal, No Context When It Matters",
    partLabel: "OBS · 04",
    accentColor: COLORS.warning,
    complexity: 8,
  });

  const phases = [
    {
      label: "Normal Operations",
      color: COLORS.success,
      x: 0.2,
      items: [
        "1000+ metrics available",
        "Nobody monitors /proc/vmstat",
        "nr_uninterruptible always low",
        "Schedstat: no one checks it",
        "Life is good, dashboards green",
      ],
    },
    {
      label: "Incident in Progress",
      color: COLORS.danger,
      x: 3.55,
      items: [
        "System degrading fast",
        "CPU charts blank or stale",
        "Which kernel counter matters?",
        "No muscle memory for this",
        "Pressure to restore NOW",
      ],
    },
    {
      label: "Post-Mortem",
      color: COLORS.accent,
      x: 6.9,
      items: [
        "Root cause: pgscan_kswapd spike",
        "nr_uninterruptible hit 200+",
        "schedstat.wait_sum maxed out",
        '"We should have monitored this"',
        "New dashboards... until next time",
      ],
    },
  ];

  phases.forEach(p => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: p.x, y: HEADER_H + 0.12, w: 3.1, h: 3.55, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: p.color, width: 1.5 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x: p.x, y: HEADER_H + 0.12, w: 3.1, h: 0.3,
      fill: { color: p.color }, line: { color: p.color, width: 0 },
    });
    slide.addText(p.label, {
      x: p.x + 0.05, y: HEADER_H + 0.12, w: 3.0, h: 0.3,
      fontSize: 9.5, bold: true, color: "FFFFFF", fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
    p.items.forEach((item, i) => {
      slide.addText("• " + item, {
        x: p.x + 0.15, y: HEADER_H + 0.52 + i * 0.56, w: 2.8, h: 0.5,
        fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body,
      });
    });
  });

  addHArrow(slide, pres, { x: 3.35, y: 2.1, w: 0.15, label: "breaks", color: COLORS.danger });
  addHArrow(slide, pres, { x: 6.68, y: 2.1, w: 0.15, label: "recover", color: COLORS.accent });

  addAlertBar(slide, pres, {
    y: 4.0,
    message: "The vicious cycle: you only know which kernel metrics matter AFTER the incident — but by then it is too late to have collected them.",
    tags: ["Institutional knowledge gap"],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 19 — CPU Preemption Cascade
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide19(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "CPU Preemption Cascade: The Feedback Loop That Defeats Monitoring",
    partLabel: "OBS · 04",
    accentColor: COLORS.danger,
    complexity: 9,
  });

  const steps = [
    { n: "1", label: "Runaway workload", sub: "Container saturates all CPUs\nRun queue depth spikes", color: COLORS.danger },
    { n: "2", label: "All processes stall", sub: "Kernel processes wait in queue\nD-state count rises", color: COLORS.danger },
    { n: "3", label: "node-exporter waits", sub: "Cannot get CPU to run\nScrape timeout approaches", color: COLORS.warning },
    { n: "4", label: "Prometheus scrape fails", sub: "HTTP GET times out\nup{job=node} = 0", color: COLORS.warning },
    { n: "5", label: "Metrics go blank", sub: "Dashboard shows nothing\nAlerts do not fire", color: COLORS.textMuted },
    { n: "6", label: "Diagnosis impossible", sub: "Cannot see what caused this\nRashomon begins", color: COLORS.textMuted },
  ];

  steps.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.3 + col * 3.2;
    const y = HEADER_H + 0.18 + row * 1.85;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: 3.0, h: 1.65, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: s.color, width: 1.8 },
    });
    slide.addText(s.n, {
      x, y, w: 0.45, h: 0.45,
      fontSize: 16, bold: true, color: s.color, fontFace: FONTS.title,
      align: "center", valign: "middle",
    });
    slide.addText(s.label, {
      x: x + 0.08, y: y + 0.45, w: 2.84, h: 0.38,
      fontSize: 11.5, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
    });
    slide.addText(s.sub, {
      x: x + 0.1, y: y + 0.86, w: 2.8, h: 0.7,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center", valign: "top",
    });
  });

  addCommentBar(slide, pres, {
    message: "// This loop is self-reinforcing: the problem creates its own information blackout",
    sub: "CPU steal / iowait / D-state metrics vanish exactly when you need them most — because the system that reports them is also starving.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 20 — The Starvation Loop Diagram
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide20(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "The Starvation Loop: From Bad Container to Blank Dashboard",
    partLabel: "OBS · 04",
    accentColor: COLORS.danger,
    complexity: 9,
  });

  addNodeCard(slide, pres, {
    x: 0.2, y: 0.68, w: 1.85, h: 1.0,
    emoji: "📦", name: "Container", meta: "high CPU\nworkload",
    borderColor: COLORS.danger, nameColor: COLORS.danger,
  });

  addHArrow(slide, pres, { x: 2.1, y: 1.18, w: 0.6, label: "floods", color: COLORS.danger });

  addNodeCard(slide, pres, {
    x: 2.75, y: 0.68, w: 1.85, h: 1.0,
    emoji: "📋", name: "CPU Run\nQueue", meta: "depth >> 1",
    borderColor: COLORS.warning, nameColor: COLORS.warning,
  });

  addHArrow(slide, pres, { x: 4.65, y: 1.18, w: 0.6, label: "starves", color: COLORS.warning });

  addZoneBorder(slide, pres, {
    x: 5.3, y: 0.62, w: 4.35, h: 1.18, color: COLORS.warning, label: "All competing for CPU",
  });
  [
    { x: 5.4,  label: "node-exporter", color: COLORS.infra },
    { x: 6.65, label: "kubelet probes", color: COLORS.container },
    { x: 7.9,  label: "system daemons", color: COLORS.textMuted },
  ].forEach(n => {
    addMiniNode(slide, pres, {
      x: n.x, y: 0.82, w: 1.15,
      emoji: "⏳", label: n.label, borderColor: n.color,
    });
  });

  addVArrow(slide, pres, { x: 6.1, y: 1.84, h: 0.5, color: COLORS.danger });

  addNodeCard(slide, pres, {
    x: 0.2, y: 2.45, w: 2.0, h: 0.95,
    emoji: "💀", name: "Scrape Timeout", meta: "up{} = 0",
    borderColor: COLORS.danger, nameColor: COLORS.danger,
  });
  addNodeCard(slide, pres, {
    x: 2.4, y: 2.45, w: 2.0, h: 0.95,
    emoji: "🔇", name: "Metrics Blank", meta: "null values",
    borderColor: COLORS.danger, nameColor: COLORS.danger,
  });
  addNodeCard(slide, pres, {
    x: 4.6, y: 2.45, w: 2.0, h: 0.95,
    emoji: "🚫", name: "Alerts Silent", meta: "no data to\nevaluate",
    borderColor: COLORS.warning, nameColor: COLORS.warning,
  });
  addNodeCard(slide, pres, {
    x: 6.8, y: 2.45, w: 2.9, h: 0.95,
    emoji: "🎭", name: "Rashomon", meta: "everyone guesses\nnobody knows",
    borderColor: COLORS.textMuted, nameColor: COLORS.textMuted,
  });

  addAlertBar(slide, pres, {
    y: 3.58,
    message: "The monitoring system depends on the very resources it is trying to monitor. Under maximum load = maximum blindness.",
    tags: ["Observer effect at the kernel level"],
  });

  addKnowledgeCards(slide, pres, [
    { title: "Mitigation: Priority Classes", body: "Give node-exporter a high-priority PriorityClass so it gets CPU even under heavy load.", color: COLORS.success },
    { title: "Mitigation: Tune Timeout", body: "Increase scrape_timeout to 30s — gives exporter more time to get scheduled and respond.", color: COLORS.accent },
    { title: "Mitigation: Heartbeat", body: "Out-of-band monitoring: push-based heartbeat to external system. If heartbeat stops, alert fires independently.", color: COLORS.warning },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 21 — Section 5 Opener: Case Studies
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide21(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Section 5 — Case Studies from the Trenches",
    partLabel: "OBS · 05",
    accentColor: COLORS.infra,
    complexity: 9,
  });

  slide.addText("05", {
    x: 0.3, y: 0.65, w: 2.8, h: 2.4,
    fontSize: 160, bold: true, color: COLORS.bg3, fontFace: FONTS.title,
    align: "center", valign: "middle",
  });

  const cases = [
    { icon: "🧵", label: "Case 1: Thread Explosion", sub: "App creates thousands of threads → CPU saturation → blank metrics → Rashomon" },
    { icon: "🧟", label: "Case 2: Zombie Storm", sub: "readiness/liveness probes + bad shutdown → zombie accumulation → kernel resource exhaustion" },
    { icon: "🕸️", label: "Case 3: Everything Connected", sub: "Threads + zombies + CPU starvation + blank metrics = a perfect storm" },
  ];
  cases.forEach((c, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 3.3, y: 0.7 + i * 1.22, w: 6.3, h: 1.1, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.infra, width: 1.5 },
    });
    slide.addText(c.icon + "  " + c.label, {
      x: 3.5, y: 0.75 + i * 1.22, w: 6.0, h: 0.38,
      fontSize: 13, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(c.sub, {
      x: 3.5, y: 1.12 + i * 1.22, w: 6.0, h: 0.6,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "top",
    });
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Based on real production incidents. Details generalized. Each illustrates how metrics fail precisely when needed most.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 22 — Case Study 1: Thread Explosion
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide22(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Case 1: Thread Explosion — When Bad Code Blinds the Entire Node",
    partLabel: "OBS · 05",
    accentColor: COLORS.infra,
    complexity: 9,
  });

  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.58, w: 0.01, h: 3.85,
    line: { color: COLORS.border, width: 0.5 },
  });

  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.3, label: "Root Cause", type: "bad",
  });
  addCompareHeading(slide, pres, {
    x: 5.1, y: 0.62, w: 4.5, label: "What We Saw (Or Did Not)", type: "bad",
  });

  const cause = [
    { title: "App spawns thread per request", sub: "Common anti-pattern: no thread pooling" },
    { title: "Traffic spike: 50,000+ threads", sub: "process.threads exceeds kernel.threads-max" },
    { title: "Linux scheduler thrashes", sub: "Context switches per second: millions" },
    { title: "All CPUs at 100% sys time", sub: "No user-space process gets meaningful CPU" },
  ];
  cause.forEach((item, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: 1.08 + i * 0.62, w: 4.3, h: 0.55, rectRadius: 0.06,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.danger, width: 0.8 },
    });
    slide.addText(item.title, {
      x: 0.45, y: 1.08 + i * 0.62 + 0.04, w: 4.0, h: 0.24,
      fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(item.sub, {
      x: 0.45, y: 1.08 + i * 0.62 + 0.3, w: 4.0, h: 0.2,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  const observed = [
    { text: "CPU chart: blank for 8 minutes" },
    { text: "Memory chart: blank" },
    { text: "Network chart: blank" },
    { text: "up{job=node-exporter}: stuck then 0" },
    { text: "absent() alert fired — 75 seconds too late" },
  ];
  observed.forEach((item, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.1, y: 1.08 + i * 0.55, w: 4.5, h: 0.48, rectRadius: 0.06,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.textMuted, width: 0.8 },
    });
    slide.addText(item.text, {
      x: 5.25, y: 1.08 + i * 0.55, w: 4.2, h: 0.48,
      fontSize: 10.5, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addAlertBar(slide, pres, {
    y: 3.9,
    message: "Diagnosis: only by SSH to node, running 'ps aux | wc -l' and reading /proc/PID/status. No Grafana dashboard showed this.",
    tags: ["container_processes metric existed", "Dashboard was not built"],
  });

  addTipBar(slide, pres, {
    y: 4.55,
    text: "Add alert on container_processes > N per-app baseline. Also alert on node_context_switches_total rate — a proxy for thread thrashing.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 23 — The CPU Wait Cascade Diagram
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide23(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "The CPU Wait Cascade: One Bad App, Whole Node Affected",
    partLabel: "OBS · 05",
    accentColor: COLORS.infra,
    complexity: 9,
  });

  addNodeCard(slide, pres, {
    x: 3.7, y: 0.65, w: 2.6, h: 0.95,
    emoji: "😈", name: "Bad App Container", meta: "50,000 threads\nthread-per-request",
    borderColor: COLORS.danger, nameColor: COLORS.danger,
  });

  addVArrow(slide, pres, { x: 5.0, y: 1.63, h: 0.45, color: COLORS.danger });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.5, y: 2.12, w: 7.0, h: 0.62, rectRadius: 0.08,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.danger, width: 2.0 },
  });
  slide.addText("Linux CPU Run Queue  [saturated — all slots taken]", {
    x: 1.55, y: 2.12, w: 6.9, h: 0.62,
    fontSize: 10.5, bold: true, color: COLORS.danger, fontFace: FONTS.code, valign: "middle",
  });

  const waiters = [
    { x: 0.2,  emoji: "🖥️", name: "node-exporter", color: COLORS.infra },
    { x: 2.0,  emoji: "🐳", name: "cAdvisor", color: COLORS.backend },
    { x: 3.8,  emoji: "📡", name: "kubelet", color: COLORS.container },
    { x: 5.6,  emoji: "🔒", name: "kube-proxy", color: COLORS.accent },
    { x: 7.4,  emoji: "🔧", name: "system daemons", color: COLORS.textMuted },
  ];
  waiters.forEach(w => {
    addNodeCard(slide, pres, {
      x: w.x, y: 2.88, w: 1.7, h: 0.95,
      emoji: w.emoji, name: w.name, meta: "waiting...",
      borderColor: w.color, nameColor: w.color,
    });
  });

  addZoneBorder(slide, pres, {
    x: 0.2, y: 2.82, w: 9.6, h: 1.1, color: COLORS.warning, label: "All of these are waiting for CPU",
  });

  addAlertBar(slide, pres, {
    y: 4.12,
    message: "When one misbehaving container monopolizes CPU, EVERY system component on that node suffers — monitoring, networking, health checks all degrade simultaneously.",
    tags: ["Noisy neighbor at the kernel level"],
  });

  addTipBar(slide, pres, {
    y: 4.78,
    text: "K8s resource limits (cpu.limits) prevent this. Unlimited CPU containers are a ticking time bomb in shared node environments.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 24 — Case Study 2: Zombie Process Storm
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide24(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Case 2: Zombie Process Storm — Liveness Probes Making Things Worse",
    partLabel: "OBS · 05",
    accentColor: COLORS.infra,
    complexity: 9,
  });

  const chain = [
    { emoji: "📦", name: "App Container", meta: "Does not reap\nchild processes", color: COLORS.backend },
    { emoji: "🧟", name: "Zombie Procs", meta: "PID table fills\nslowly", color: COLORS.warning },
    { emoji: "💊", name: "Liveness Probe", meta: "Probe: is app\nalive? — fails", color: COLORS.accent },
    { emoji: "🔄", name: "Container Restart", meta: "Kills container\nnew zombies spawn", color: COLORS.danger },
    { emoji: "📈", name: "PID Exhaustion", meta: "pid_max reached\nfork() fails", color: COLORS.danger },
  ];

  chain.forEach((c, i) => {
    addNodeCard(slide, pres, {
      x: 0.15 + i * 1.95, y: 0.65, w: 1.72, h: 1.05,
      emoji: c.emoji, name: c.name, meta: c.meta,
      borderColor: c.color, nameColor: c.color,
    });
    if (i < chain.length - 1) {
      addHArrow(slide, pres, { x: 1.9 + i * 1.95, y: 1.18, w: 0.2, label: "", color: c.color });
    }
  });

  const effects = [
    { title: "node_processes metric: unreliable", sub: "Fast restarts cause counter resets that look like noise", color: COLORS.warning },
    { title: "process_zombie gauge: exists but unwatched", sub: "node-exporter exports it, nobody alerting on it", color: COLORS.danger },
    { title: "kubelet churning: high CPU overhead", sub: "Constant restarts — kubelet busy — metrics delayed", color: COLORS.danger },
    { title: "Readiness never stable: service degraded", sub: "Endpoint flickering causes load balancer thrash", color: COLORS.infra },
  ];

  effects.forEach((e, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.25 + col * 4.9, y: 1.92 + row * 0.68, w: 4.7, h: 0.6, rectRadius: 0.06,
      fill: { color: COLORS.bg2 }, line: { color: e.color, width: 0.8 },
    });
    slide.addText(e.title, {
      x: 0.4 + col * 4.9, y: 1.92 + row * 0.68 + 0.04, w: 4.4, h: 0.24,
      fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(e.sub, {
      x: 0.4 + col * 4.9, y: 1.92 + row * 0.68 + 0.3, w: 4.4, h: 0.22,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addAlertBar(slide, pres, {
    y: 3.42,
    message: "The fix is the app, not Prometheus. Use tini or dumb-init as PID 1 to reap zombie children. Liveness probes amplify pre-existing issues.",
    tags: ["process_zombie > 10 should alert", "Use init process in containers"],
  });

  addCodeCard(slide, pres, {
    x: 0.25, y: 3.98, w: 9.5, h: 0.82,
    code: "# Dockerfile: use tini as PID 1 to reap zombie processes\nENTRYPOINT [\"/sbin/tini\", \"--\", \"/app/start.sh\"]\n# Or in K8s: shareProcessNamespace: true  (lets kubelet reap zombies)",
    language: "bash",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 25 — Case Study 3: Everything Connected
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide25(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Case 3: Everything Connected — The Perfect Storm",
    partLabel: "OBS · 05",
    accentColor: COLORS.infra,
    complexity: 10,
  });

  addNodeCard(slide, pres, {
    x: 3.8, y: 0.68, w: 2.4, h: 0.85,
    emoji: "📦", name: "Bad Container", meta: "threads/request, no pool",
    borderColor: COLORS.danger, nameColor: COLORS.danger,
  });
  addNodeCard(slide, pres, {
    x: 0.2, y: 1.88, w: 2.1, h: 0.82,
    emoji: "🧵", name: "Thread Explosion", meta: "50k+ threads",
    borderColor: COLORS.danger, nameColor: COLORS.danger,
  });
  addNodeCard(slide, pres, {
    x: 7.5, y: 1.88, w: 2.2, h: 0.82,
    emoji: "🔄", name: "CPU Thrash", meta: "scheduler overload",
    borderColor: COLORS.warning, nameColor: COLORS.warning,
  });
  addNodeCard(slide, pres, {
    x: 0.2, y: 3.12, w: 2.1, h: 0.82,
    emoji: "🧟", name: "Zombie Procs", meta: "PID table grows",
    borderColor: COLORS.warning, nameColor: COLORS.warning,
  });
  addNodeCard(slide, pres, {
    x: 7.5, y: 3.12, w: 2.2, h: 0.82,
    emoji: "🔇", name: "Blank Metrics", meta: "exporter starved",
    borderColor: COLORS.textMuted, nameColor: COLORS.textMuted,
  });
  addNodeCard(slide, pres, {
    x: 3.9, y: 3.12, w: 2.2, h: 0.82,
    emoji: "💊", name: "Probe Failures", meta: "kubelet churning",
    borderColor: COLORS.infra, nameColor: COLORS.infra,
  });

  // Connection lines — normalize so x/y are top-left, w/h always positive
  [
    { x1: 4.2, y1: 1.55, x2: 1.95, y2: 1.88 },
    { x1: 6.2, y1: 1.55, x2: 8.0,  y2: 1.88 },
    { x1: 1.25, y1: 2.7,  x2: 1.25, y2: 3.12 },
    { x1: 8.6,  y1: 2.7,  x2: 8.6,  y2: 3.12 },
    { x1: 2.3,  y1: 3.55, x2: 3.9,  y2: 3.55 },
    { x1: 6.1,  y1: 3.55, x2: 7.5,  y2: 3.55 },
  ].forEach(a => {
    const x = Math.min(a.x1, a.x2);
    const y = Math.min(a.y1, a.y2);
    const w = Math.max(Math.abs(a.x2 - a.x1), 0.01);
    const h = Math.max(Math.abs(a.y2 - a.y1), 0.01);
    const flipH = a.x2 < a.x1;
    const flipV = a.y2 < a.y1;
    slide.addShape(pres.ShapeType.line, {
      x, y, w, h,
      line: { color: COLORS.border, width: 1.2 },
      ...(flipH ? { flipH: true } : {}),
      ...(flipV ? { flipV: true } : {}),
    });
  });

  addAlertBar(slide, pres, {
    y: 4.12,
    message: "None of these problems is independently obvious. They interact in ways that create symptoms pointing in all directions — classic Rashomon.",
    tags: ["Root cause: app architecture", "Surface: everywhere"],
  });

  addTipBar(slide, pres, {
    y: 4.78,
    text: "Combine dmesg + /proc/PID/status + container_processes + node run queue depth to reconstruct the full picture.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 26 — Section 6 Opener: Fighting Back
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide26(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Section 6 — Fighting Back: Strategies When Metrics Fail You",
    partLabel: "OBS · 06",
    accentColor: COLORS.container,
    complexity: 6,
  });

  slide.addText("06", {
    x: 0.3, y: 0.65, w: 2.8, h: 2.4,
    fontSize: 160, bold: true, color: COLORS.bg3, fontFace: FONTS.title,
    align: "center", valign: "middle",
  });

  const strategies = [
    { icon: "🔍", text: "Node Problem Detector: convert kernel logs to metrics" },
    { icon: "🐧", text: "Long-running agents: capture kernel memory snapshots" },
    { icon: "📖", text: "Post-mortem forensics: dmesg, /proc, systemd journal" },
    { icon: "🛡️", text: "Architectural hardening: Priority Classes, resource limits" },
  ];
  strategies.forEach((s, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 3.3, y: 0.7 + i * 0.95, w: 6.3, h: 0.8, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.container, width: 1.2 },
    });
    slide.addText(s.icon + "  " + s.text, {
      x: 3.5, y: 0.7 + i * 0.95, w: 6.0, h: 0.8,
      fontSize: 13, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Defense in depth: reduce failure probability (limits), detect faster (NPD), retain evidence after crash (persistent collectors).",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 27 — Node Problem Detector
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide27(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Node Problem Detector: Log-Based Detection as a Metrics Bridge",
    partLabel: "OBS · 06",
    accentColor: COLORS.container,
    complexity: 6,
  });

  slide.addText("🔍", {
    x: 0.2, y: 0.65, w: 2.0, h: 2.0,
    fontSize: 80, align: "center", valign: "middle",
  });

  const points = [
    {
      title: "What it is",
      sub: "Open-source K8s DaemonSet that watches kernel logs (dmesg, journald, custom logs) and converts patterns to K8s Events and custom metrics.",
    },
    {
      title: "What it catches",
      sub: "OOM kill events, kernel panics, disk I/O hangs, NFS timeouts, docker daemon failures — things node-exporter has no metric for.",
    },
    {
      title: "How it works",
      sub: "Rule-based log pattern matching → NodeCondition update → custom Prometheus metrics via problem_gauge and problem_counter.",
    },
    {
      title: "The limitation",
      sub: "Still depends on log collection working. Under extreme CPU starvation, NPD itself may fail to get scheduled. Not a silver bullet.",
    },
  ];

  points.forEach((p, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 2.3, y: 0.65 + i * 1.0, w: 7.3, h: 0.88, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.8 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x: 2.3, y: 0.65 + i * 1.0, w: 0.06, h: 0.88,
      fill: { color: COLORS.container }, line: { color: COLORS.container, width: 0 },
    });
    slide.addText(p.title, {
      x: 2.45, y: 0.65 + i * 1.0 + 0.05, w: 7.0, h: 0.26,
      fontSize: 11, bold: true, color: COLORS.container, fontFace: FONTS.body,
    });
    slide.addText(p.sub, {
      x: 2.45, y: 0.65 + i * 1.0 + 0.34, w: 7.0, h: 0.48,
      fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body,
    });
  });

  addCommentBar(slide, pres, {
    message: "// NPD converts qualitative log events into quantitative signals Prometheus can alert on",
    sub: "metric: node_problem_detector_problem_gauge{condition=\"OOMKilling\"} fires before OOM becomes a blank metric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 28 — Node Problem Detector Architecture
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide28(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Node Problem Detector: Architecture and Data Flow",
    partLabel: "OBS · 06",
    accentColor: COLORS.container,
    complexity: 6,
  });

  addZoneBorder(slide, pres, {
    x: 0.2, y: 0.62, w: 2.4, h: 3.35, color: COLORS.textMuted, label: "Log Sources",
  });
  [
    { y: 0.9,  emoji: "📝", name: "/dev/kmsg", meta: "kernel ring buffer" },
    { y: 1.75, emoji: "📋", name: "journald", meta: "systemd journal" },
    { y: 2.6,  emoji: "📁", name: "custom log", meta: "/var/log/*.log" },
  ].forEach(n => {
    addMiniNode(slide, pres, {
      x: 0.3, y: n.y, w: 2.1,
      emoji: n.emoji, label: n.name + "\n" + n.meta, borderColor: COLORS.textMuted,
    });
  });

  addHArrow(slide, pres, { x: 2.65, y: 2.3, w: 0.55, label: "watch", color: COLORS.container });

  addNodeCard(slide, pres, {
    x: 3.25, y: 1.58, w: 2.2, h: 1.45,
    emoji: "🔍", name: "Node Problem\nDetector", meta: "pattern matching\nrule engine",
    borderColor: COLORS.container, nameColor: COLORS.container,
  });

  addHArrow(slide, pres, { x: 5.5, y: 2.0, w: 0.55, label: "update", color: COLORS.accent });
  addHArrow(slide, pres, { x: 5.5, y: 2.8, w: 0.55, label: "expose", color: COLORS.success });

  addNodeCard(slide, pres, {
    x: 6.1, y: 0.68, w: 2.5, h: 1.05,
    emoji: "☸️", name: "K8s NodeCondition", meta: "OOMKilling=True\nKernelDeadlock=True",
    borderColor: COLORS.accent, nameColor: COLORS.accent,
  });
  addNodeCard(slide, pres, {
    x: 6.1, y: 1.85, w: 2.5, h: 1.05,
    emoji: "📊", name: "Custom Metrics", meta: "/metrics endpoint\nfor Prometheus",
    borderColor: COLORS.success, nameColor: COLORS.success,
  });
  addNodeCard(slide, pres, {
    x: 6.1, y: 3.0, w: 2.5, h: 1.0,
    emoji: "🔔", name: "Alert Rules", meta: "problem_gauge > 0\nto PagerDuty",
    borderColor: COLORS.warning, nameColor: COLORS.warning,
  });

  addHArrow(slide, pres, { x: 5.5, y: 3.5, w: 0.55, label: "trigger", color: COLORS.warning });

  addAlertBar(slide, pres, {
    y: 4.22,
    message: "NPD provides early warning BEFORE a node becomes completely unresponsive. OOM events, kernel hangs, filesystem errors — all become Prometheus-queryable.",
    tags: ["Detects before metrics go silent"],
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "Deploy NPD with custom rules for your kernel version. See: github.com/kubernetes/node-problem-detector",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 29 — Long-Running Kernel Collectors
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide29(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Long-Running Kernel Collectors: Evidence That Survives Node Death",
    partLabel: "OBS · 06",
    accentColor: COLORS.container,
    complexity: 6,
  });

  addThreeCols(slide, pres, [
    {
      title: "eBPF Agents",
      icon: "⚡",
      color: COLORS.accent,
      items: [
        { text: "Pixie, Tetragon, Falco" },
        { text: "Kernel-level: zero sampling gap" },
        { text: "Captures every syscall, every packet" },
        { text: "Persists to ring buffer / storage" },
        { text: "Survives even exporter crashes" },
        { text: "Cost: significant CPU/memory overhead" },
      ],
    },
    {
      title: "Kernel Memory Snapshots",
      icon: "📸",
      color: COLORS.infra,
      items: [
        { text: "cat /proc/meminfo >> log (periodic)" },
        { text: "vmstat -n 1 >> /var/log/vmstat.log" },
        { text: "sar -A interval (sysstat package)" },
        { text: "Write to node-local persistent disk" },
        { text: "Retrievable after pod restart" },
        { text: "Low overhead, high diagnostic value" },
      ],
    },
    {
      title: "Post-Crash Forensics",
      icon: "🔍",
      color: COLORS.warning,
      items: [
        { text: "dmesg --ctime: kernel timeline" },
        { text: "journalctl -k --since yesterday" },
        { text: "/var/log/kern.log (if configured)" },
        { text: "kdump: crash dump for kernel panics" },
        { text: "systemd coredump for app crashes" },
        { text: "Survives node reboot" },
      ],
    },
  ], { y: HEADER_H + 0.12, h: H - HEADER_H - 0.65 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Strategy: eBPF for high-fidelity realtime, vmstat/sar snapshots for low-overhead persistence, dmesg/journal for post-mortem. Layer all three.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 30 — Key Takeaways
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide30(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Key Takeaways: What to Do Monday Morning",
    partLabel: "OBS · SUMMARY",
    accentColor: COLORS.accent,
    complexity: 4,
  });

  const cards = [
    {
      icon: "📡",
      title: "Understand your scrape gaps",
      items: [
        "Events shorter than scrape_interval are invisible",
        "Monitor: up{} and scrape_duration_seconds",
        "Use absent() guards on every threshold alert",
      ],
      color: COLORS.accent,
    },
    {
      icon: "🔇",
      title: "Blank does not mean Healthy",
      items: [
        "No data can mean catastrophic failure",
        "Set Grafana No Value display correctly",
        "Alert on data absence, not just data values",
      ],
      color: COLORS.danger,
    },
    {
      icon: "🐧",
      title: "Expand your kernel coverage",
      items: [
        "Enable --collector.schedstat --collector.vmstat",
        "Alert on container_processes and process_zombie",
        "context_switches rate as CPU health proxy",
      ],
      color: COLORS.warning,
    },
    {
      icon: "🛡️",
      title: "Harden your monitoring stack",
      items: [
        "K8s Priority Classes for monitoring DaemonSets",
        "Always set CPU and memory limits on containers",
        "Use tini or dumb-init as PID 1 everywhere",
      ],
      color: COLORS.success,
    },
    {
      icon: "🔍",
      title: "Deploy Node Problem Detector",
      items: [
        "Convert kernel log events to Prometheus metrics",
        "Get early warning before complete metric silence",
        "Write custom rules for your kernel patterns",
      ],
      color: COLORS.container,
    },
    {
      icon: "💾",
      title: "Collect evidence proactively",
      items: [
        "Run vmstat/sar snapshots to persistent storage",
        "Consider eBPF agents for critical workloads",
        "dmesg + journald: your post-mortem lifeline",
      ],
      color: COLORS.infra,
    },
  ];

  cards.forEach((card, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 3.18;
    const y = HEADER_H + 0.12 + row * 2.18;

    addSummaryCard(slide, pres, {
      x, y, w: 3.03, h: 2.0,
      icon: card.icon,
      title: card.title,
      items: card.items,
      color: card.color,
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
    buildSlide1,  buildSlide2,  buildSlide3,  buildSlide4,  buildSlide5,
    buildSlide6,  buildSlide7,  buildSlide8,  buildSlide9,  buildSlide10,
    buildSlide11, buildSlide12, buildSlide13, buildSlide14, buildSlide15,
    buildSlide16, buildSlide17, buildSlide18, buildSlide19, buildSlide20,
    buildSlide21, buildSlide22, buildSlide23, buildSlide24, buildSlide25,
    buildSlide26, buildSlide27, buildSlide28, buildSlide29, buildSlide30,
  ]) {
    await fn(pres);
  }

  await pres.writeFile({ fileName: "output/obs_prometheus.pptx" });
  console.log("obs_prometheus.pptx created (30 slides)");
}

main().catch(console.error);
