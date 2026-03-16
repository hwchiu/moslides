// src/part10_sre.js
// Part 10: SRE (Slides 136–150)

"use strict";

const fs      = require("fs");
const pptxgen = require("pptxgenjs");
const { COLORS, FONTS } = require("./design-system");
const {
  W, H, HEADER_H, BOTTOM_Y,
  initSlide,
  addSlideHeader,
  addNodeCard,
  addMiniNode,
  addHArrow,
  addVArrow,
  addTipBar,
  addAlertBar,
  addThreeCols,
  addCodeCard,
  addCompareItem,
  addSummaryCard,
  addMetricCard,
} = require("./helpers");

const ACCENT = COLORS.success; // 3FB950

// ─────────────────────────────────────────────────────────────────────────────
// Slide 136 — Three Pillars Integration: Grafana Stack
// ─────────────────────────────────────────────────────────────────────────────
function slide136(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Three Pillars Integration: Grafana Stack",
    partLabel: "PART 10 SRE  · 136 / 150",
    accentColor: ACCENT,
    complexity: 7,
  });

  // Central Grafana box
  slide.addShape(pres.ShapeType.roundRect, {
    x: 3.8, y: 1.8, w: 2.4, h: 1.5, rectRadius: 0.12,
    fill: { color: COLORS.bg3 },
    line: { color: ACCENT, width: 2.0 },
  });
  slide.addText("📊", { x: 3.8, y: 1.88, w: 2.4, h: 0.45, fontSize: 22, align: "center", valign: "middle" });
  slide.addText("Grafana", {
    x: 3.8, y: 2.35, w: 2.4, h: 0.3,
    fontSize: 14, bold: true, color: ACCENT, fontFace: FONTS.title, align: "center",
  });
  slide.addText("Unified Observability UI", {
    x: 3.8, y: 2.67, w: 2.4, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Data source nodes
  const sources = [
    { x: 0.3,  y: 1.0,  emoji: "📈", name: "Prometheus", meta: "Metrics", color: COLORS.warning },
    { x: 0.3,  y: 2.6,  emoji: "📋", name: "Loki",       meta: "Logs",    color: COLORS.danger  },
    { x: 8.5,  y: 1.0,  emoji: "🔍", name: "Tempo",      meta: "Traces",  color: COLORS.infra   },
    { x: 8.5,  y: 2.6,  emoji: "⚙️", name: "AlertMgr",  meta: "Alerting",color: COLORS.accent  },
  ];
  sources.forEach(s => {
    addNodeCard(slide, pres, { x: s.x, y: s.y, w: 1.5, h: 1.0, emoji: s.emoji, name: s.name, meta: s.meta, borderColor: s.color });
  });

  // Arrows from sources to Grafana
  addHArrow(slide, pres, { x: 1.82, y: 1.38, w: 2.0, label: "PromQL", color: COLORS.warning });
  addHArrow(slide, pres, { x: 1.82, y: 2.98, w: 2.0, label: "LogQL",  color: COLORS.danger  });
  addHArrow(slide, pres, { x: 6.22, y: 1.38, w: 2.28, label: "TraceQL", color: COLORS.infra  });
  addHArrow(slide, pres, { x: 6.22, y: 2.98, w: 2.28, label: "API",    color: COLORS.accent  });

  // Bottom integration tip
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.05, w: 9.4, h: 0.55, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.75 },
  });
  slide.addText("🔗  Click a metric spike → find correlated trace → see exact log lines — all within Grafana", {
    x: 0.5, y: 4.08, w: 9.0, h: 0.48,
    fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "Grafana Stack = Prometheus + Loki + Tempo + Grafana — open source, vendor-neutral, fully integrated",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 137 — Alert -> Incident -> Postmortem Flow
// ─────────────────────────────────────────────────────────────────────────────
function slide137(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Alert → Incident → Postmortem Flow",
    partLabel: "PART 10 SRE  · 137 / 150",
    accentColor: ACCENT,
    complexity: 6,
  });

  const steps = [
    { emoji: "🔔", label: "Alert Fires",   sub: "Prometheus\nrule triggered",  color: COLORS.danger  },
    { emoji: "📣", label: "Route",         sub: "AlertManager\nPagerDuty/Slack",color: COLORS.warning },
    { emoji: "✋", label: "Acknowledge",   sub: "On-call engineer\naccepts page", color: COLORS.accent },
    { emoji: "🔍", label: "Investigate",   sub: "Grafana\ndashboards",          color: COLORS.accent  },
    { emoji: "🛠️", label: "Mitigate",     sub: "Hotfix or\nrollback",           color: COLORS.success },
    { emoji: "📝", label: "Postmortem",    sub: "Within 48h\nblameless review",  color: ACCENT         },
  ];

  const nodeW  = 1.3;
  const nodeH  = 1.2;
  const startX = 0.2;
  const spacing = (W - startX * 2 - nodeW * steps.length) / (steps.length - 1);
  const nodeY  = 1.5;

  steps.forEach((s, i) => {
    const x = startX + i * (nodeW + spacing);
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: nodeY, w: nodeW, h: nodeH, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: s.color, width: 1.5 },
    });
    slide.addText(s.emoji, { x, y: nodeY + 0.08, w: nodeW, h: 0.42, fontSize: 22, align: "center", valign: "middle" });
    slide.addText(s.label, {
      x: x + 0.05, y: nodeY + 0.52, w: nodeW - 0.1, h: 0.26,
      fontSize: 10, bold: true, color: s.color, fontFace: FONTS.body, align: "center",
    });
    slide.addText(s.sub, {
      x: x + 0.05, y: nodeY + 0.78, w: nodeW - 0.1, h: 0.38,
      fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });

    // Step number badge
    slide.addShape(pres.ShapeType.ellipse, {
      x: x + nodeW - 0.28, y: nodeY - 0.14, w: 0.28, h: 0.28,
      fill: { color: s.color }, line: { color: s.color, width: 0 },
    });
    slide.addText(`${i + 1}`, {
      x: x + nodeW - 0.28, y: nodeY - 0.14, w: 0.28, h: 0.28,
      fontSize: 9, bold: true, color: COLORS.bg, fontFace: FONTS.body, align: "center", valign: "middle",
    });

    // Arrow between steps
    if (i < steps.length - 1) {
      const ax = x + nodeW + 0.03;
      addHArrow(slide, pres, { x: ax, y: nodeY + 0.44, w: spacing - 0.03, color: COLORS.border });
    }
  });

  // SLA timing bar
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.1, w: 9.4, h: 0.55, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.5 },
  });
  const timings = [
    { label: "MTTA (mean time to ack)", value: "< 5 min", color: COLORS.warning },
    { label: "MTTD (mean time to detect)", value: "< 2 min", color: COLORS.danger },
    { label: "MTTR (mean time to recover)", value: "< 30 min", color: ACCENT },
  ];
  timings.forEach((t, i) => {
    const tx = 0.6 + i * 3.1;
    slide.addText(`${t.label}: `, {
      x: tx, y: 3.18, w: 2.3, h: 0.38,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(t.value, {
      x: tx + 1.7, y: 3.18, w: 1.0, h: 0.38,
      fontSize: 10, bold: true, color: t.color, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "Every alert should have a clear owner, a runbook, and lead to a postmortem if it was production-impacting",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 138 — SLI, SLO, and SLA Defined
// ─────────────────────────────────────────────────────────────────────────────
function slide138(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "SLI, SLO, and SLA Defined",
    partLabel: "PART 10 SRE  · 138 / 150",
    accentColor: ACCENT,
    complexity: 6,
  });

  addThreeCols(slide, pres, [
    {
      title: "📏 SLI",
      icon: "📊",
      color: ACCENT,
      items: [
        { text: "Service Level Indicator",    sub: "The actual measurement" },
        { text: "Example: request success rate" },
        { text: "Current value: 99.95%" },
        { text: "P99 latency: 180ms" },
        { text: "Computed from real traffic" },
      ],
    },
    {
      title: "🎯 SLO",
      icon: "🏹",
      color: COLORS.accent,
      items: [
        { text: "Service Level Objective",  sub: "Internal target" },
        { text: "Target: ≥ 99.9% success" },
        { text: "Set by engineering team" },
        { text: "Stricter than SLA (buffer!)" },
        { text: "Drives Error Budget policy" },
      ],
    },
    {
      title: "📄 SLA",
      icon: "🤝",
      color: COLORS.warning,
      items: [
        { text: "Service Level Agreement",  sub: "Contractual promise" },
        { text: "Promise: ≥ 99.5% success" },
        { text: "Agreed with customers" },
        { text: "Breach = financial penalty" },
        { text: "Must be looser than SLO" },
      ],
    },
  ], { y: HEADER_H + 0.12, h: H - HEADER_H - 1.0 });

  // Key rule bar
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.92, w: 9.4, h: 0.52, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("⚠️  Key Rule: SLO must be STRICTER than SLA  |  SLI=99.95%  →  SLO=99.9%  →  SLA=99.5%", {
    x: 0.5, y: 3.95, w: 9.0, h: 0.44,
    fontSize: 10.5, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.71,
    text: "SLO 是你的內部目標，SLA 是你對客戶的承諾，永遠讓 SLO > SLA",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 139 — Error Budget
// ─────────────────────────────────────────────────────────────────────────────
function slide139(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Error Budget",
    partLabel: "PART 10 SRE  · 139 / 150",
    accentColor: ACCENT,
    complexity: 7,
  });

  // Formula
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.52, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.2 },
  });
  slide.addText("Error Budget  =  1 − SLO   →   99.9% SLO  =  0.1% budget  ≈  43.8 min downtime per month", {
    x: 0.5, y: 0.67, w: 9.0, h: 0.48,
    fontSize: 11.5, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center", valign: "middle",
  });

  // Budget consumption visual bar
  const barY  = 1.42;
  const barH  = 0.38;
  const barW  = 9.0;
  slide.addText("Budget Consumption This Month (example: 68% used)", {
    x: 0.5, y: barY - 0.28, w: barW, h: 0.24,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: barY, w: barW, h: barH, rectRadius: 0.06,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: barY, w: barW * 0.68, h: barH, rectRadius: 0.06,
    fill: { color: COLORS.warning }, line: { color: COLORS.warning, width: 0 },
  });
  slide.addText("68%", {
    x: 0.5, y: barY, w: barW * 0.68, h: barH,
    fontSize: 10, bold: true, color: COLORS.bg, fontFace: FONTS.body, align: "center", valign: "middle",
  });

  // States
  const states = [
    { title: "✅  Budget Healthy (< 50% used)",     color: ACCENT,          sub: "Deploy freely · run experiments · launch features" },
    { title: "⚠️  Budget Burning (50–90% used)",    color: COLORS.warning,  sub: "Slow down releases · investigate reliability issues" },
    { title: "🔥  Budget Exhausted (≥ 100% used)",  color: COLORS.danger,   sub: "Freeze deployments · incident mode · SRE+Dev focus on reliability" },
  ];
  states.forEach((s, i) => {
    const sy = 2.08 + i * 0.68;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: sy, w: 9.4, h: 0.58, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: s.color, width: 1.0 },
    });
    slide.addText(s.title, {
      x: 0.5, y: sy + 0.04, w: 4.5, h: 0.28,
      fontSize: 10.5, bold: true, color: s.color, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(s.sub, {
      x: 0.5, y: sy + 0.3, w: 9.0, h: 0.22,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "Error budget is a shared contract between product and SRE — when it's gone, reliability wins over velocity",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 140 — SRE Responsibilities
// ─────────────────────────────────────────────────────────────────────────────
function slide140(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "SRE Responsibilities",
    partLabel: "PART 10 SRE  · 140 / 150",
    accentColor: ACCENT,
    complexity: 6,
  });

  const responsibilities = [
    { emoji: "📈", title: "Availability & Reliability",  sub: "Define SLOs, track SLIs, maintain uptime" },
    { emoji: "📦", title: "Capacity Planning",           sub: "Forecast growth, provision before overload" },
    { emoji: "⚡", title: "Performance & Efficiency",    sub: "Optimize latency, throughput, resource usage" },
    { emoji: "🚀", title: "Change Management",           sub: "Safe deploys, feature flags, canary releases" },
    { emoji: "🔔", title: "Monitoring & Alerting",       sub: "Build dashboards, tune alerts, reduce noise" },
    { emoji: "🚨", title: "Emergency Response",          sub: "On-call rotation, incident command, runbooks" },
  ];

  const colW = 4.55;
  responsibilities.forEach((r, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x   = 0.2  + col * (colW + 0.5);
    const y   = 0.72 + row * 0.8;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: colW, h: 0.68, rectRadius: 0.09,
      fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.0 },
    });
    slide.addText(r.emoji, {
      x, y, w: 0.56, h: 0.68, fontSize: 22, align: "center", valign: "middle",
    });
    slide.addText(r.title, {
      x: x + 0.6, y: y + 0.06, w: colW - 0.7, h: 0.26,
      fontSize: 10.5, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(r.sub, {
      x: x + 0.6, y: y + 0.34, w: colW - 0.7, h: 0.28,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  // 50% rule
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.25, w: 9.4, h: 0.62, rectRadius: 0.08,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.warning, width: 1.2 },
  });
  slide.addText("⏱️  The 50% Rule:", {
    x: 0.5, y: 3.30, w: 1.6, h: 0.52,
    fontSize: 10.5, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });
  slide.addText("SRE should spend LESS than 50% of time on toil (manual, repetitive, automatable work). The rest goes to engineering work that improves the system.", {
    x: 2.1, y: 3.30, w: 7.5, h: 0.52,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.1,
    text: "SRE is NOT just ops — it's software engineering applied to reliability problems",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 141 — Toil: What It Is and Why It Matters
// ─────────────────────────────────────────────────────────────────────────────
function slide141(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Toil: What It Is and Why It Matters",
    partLabel: "PART 10 SRE  · 141 / 150",
    accentColor: ACCENT,
    complexity: 5,
  });

  // Toil definition
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.5, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("🔥  Toil: manual · repetitive · automatable · scales O(n) with service growth · lacks enduring value", {
    x: 0.5, y: 0.68, w: 9.0, h: 0.44,
    fontSize: 10.5, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  // Two columns: toil vs non-toil
  const colY  = 1.3;
  const colH  = 2.5;
  const colW  = 4.5;

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.2, y: colY, w: colW, h: colH, rectRadius: 0.1,
    fill: { color: COLORS.cardDanger }, line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("❌  Toil Examples", {
    x: 0.4, y: colY + 0.1, w: colW - 0.3, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });

  const toilItems = [
    "Manually SSH to deploy each release",
    "Ticket-driven capacity provisioning",
    "Hand-crafting runbooks from scratch every time",
    "Manually restarting crashed pods",
    "Copy-pasting configs between environments",
  ];
  toilItems.forEach((item, i) => {
    slide.addText(`• ${item}`, {
      x: 0.4, y: colY + 0.48 + i * 0.38, w: colW - 0.3, h: 0.34,
      fontSize: 10, color: COLORS.text, fontFace: FONTS.body,
    });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.3, y: colY, w: colW, h: colH, rectRadius: 0.1,
    fill: { color: COLORS.cardSuccess }, line: { color: ACCENT, width: 1.0 },
  });
  slide.addText("✅  Non-Toil (Engineering Value)", {
    x: 5.5, y: colY + 0.1, w: colW - 0.3, h: 0.3,
    fontSize: 11, bold: true, color: ACCENT, fontFace: FONTS.body,
  });

  const nonToilItems = [
    "Building a CI/CD pipeline",
    "Writing an auto-scaler",
    "Creating a self-healing runbook once",
    "Implementing auto-restart with health checks",
    "Infra-as-Code with Terraform",
  ];
  nonToilItems.forEach((item, i) => {
    slide.addText(`• ${item}`, {
      x: 5.5, y: colY + 0.48 + i * 0.38, w: colW - 0.3, h: 0.34,
      fontSize: 10, color: COLORS.text, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.05,
    text: "Goal: automate away toil continuously — keep it under 50% of SRE time, track it as a metric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 142 — On-Call Design Principles
// ─────────────────────────────────────────────────────────────────────────────
function slide142(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "On-Call Design Principles",
    partLabel: "PART 10 SRE  · 142 / 150",
    accentColor: ACCENT,
    complexity: 6,
  });

  const principles = [
    { emoji: "✅", title: "Pages must be actionable",        sub: "If no action needed, it's not an alert — it's noise",         color: ACCENT         },
    { emoji: "🩺", title: "Alert on symptoms, not causes",   sub: "Alert: 'error rate > 1%', not 'disk inode usage high'",        color: COLORS.accent  },
    { emoji: "📖", title: "Every alert needs a runbook",     sub: "Link in the alert body — zero excuse for undocumented pages",  color: COLORS.warning },
    { emoji: "🔕", title: "Reduce alert fatigue",            sub: "False positives erode trust and slow real responses",          color: COLORS.danger  },
    { emoji: "😌", title: "Rotation must be sustainable",    sub: "Max 2 incidents/shift; no back-to-back nights; swap coverage", color: ACCENT         },
    { emoji: "🤝", title: "Primary + secondary responder",   sub: "Secondary is backup escalation — never on-call alone",        color: COLORS.accent  },
  ];

  const colW = 4.55;
  principles.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x   = 0.2  + col * (colW + 0.5);
    const y   = 0.68 + row * 0.82;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: colW, h: 0.7, rectRadius: 0.09,
      fill: { color: COLORS.bg2 }, line: { color: p.color, width: 1.0 },
    });
    slide.addText(p.emoji, {
      x, y, w: 0.56, h: 0.7, fontSize: 20, align: "center", valign: "middle",
    });
    slide.addText(p.title, {
      x: x + 0.6, y: y + 0.07, w: colW - 0.7, h: 0.26,
      fontSize: 10.5, bold: true, color: p.color, fontFace: FONTS.body,
    });
    slide.addText(p.sub, {
      x: x + 0.6, y: y + 0.36, w: colW - 0.7, h: 0.28,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "On-call culture defines engineering culture — burnout from pager hell drives your best engineers away",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 143 — Runbook Writing
// ─────────────────────────────────────────────────────────────────────────────
function slide143(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Runbook Writing",
    partLabel: "PART 10 SRE  · 143 / 150",
    accentColor: ACCENT,
    complexity: 5,
  });

  // Sections
  const sections = [
    { label: "1. Alert Description", color: COLORS.accent  },
    { label: "2. Impact",            color: COLORS.danger  },
    { label: "3. Investigation",     color: COLORS.warning },
    { label: "4. Mitigation",        color: ACCENT         },
    { label: "5. Escalation",        color: COLORS.infra   },
  ];
  sections.forEach((s, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.2, y: 0.67 + i * 0.36, w: 2.4, h: 0.3, rectRadius: 0.06,
      fill: { color: COLORS.bg2 }, line: { color: s.color, width: 1.0 },
    });
    slide.addText(s.label, {
      x: 0.35, y: 0.67 + i * 0.36, w: 2.2, h: 0.3,
      fontSize: 9.5, bold: true, color: s.color, fontFace: FONTS.body, valign: "middle",
    });
  });

  // Code card with example runbook structure
  addCodeCard(slide, pres, {
    x: 2.9, y: 0.68, w: 6.9, h: 2.6,
    language: "Runbook: HighErrorRate",
    code:
`# Alert: HighErrorRate
## Impact
  API error rate > 1% — users experiencing failures

## Investigation
  1. Check Grafana: error-rate dashboard
  2. kubectl logs deploy/api-service | grep ERROR
  3. Check DB connection pool: prometheus metric db_pool_wait
  4. Review recent deployments: kubectl rollout history

## Mitigation
  - If bad deploy: kubectl rollout undo deploy/api-service
  - If DB overload: scale replicas or enable read-replica

## Escalation
  After 15 min unresolved → page team lead`,
  });

  // Golden rule
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.48, w: 9.4, h: 0.62, rectRadius: 0.08,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.warning, width: 1.2 },
  });
  slide.addText("📖  Golden Rule:", {
    x: 0.5, y: 3.53, w: 1.5, h: 0.52,
    fontSize: 10.5, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });
  slide.addText("Any on-call engineer — including a new hire — should be able to resolve the alert using the runbook alone, without asking the expert.", {
    x: 2.0, y: 3.53, w: 7.5, h: 0.52,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.3,
    text: "A runbook is a living document — update it after every incident with new investigation steps or mitigation tricks",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 144 — Blameless Postmortem
// ─────────────────────────────────────────────────────────────────────────────
function slide144(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Blameless Postmortem",
    partLabel: "PART 10 SRE  · 144 / 150",
    accentColor: ACCENT,
    complexity: 6,
  });

  // Core principle
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.46, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.2 },
  });
  slide.addText("🧠  Core Principle: blame the SYSTEM, not the person — humans are fallible, systems should be resilient", {
    x: 0.5, y: 0.67, w: 9.0, h: 0.42,
    fontSize: 10.5, bold: true, color: ACCENT, fontFace: FONTS.body, valign: "middle",
  });

  // Structure (4 stages)
  const stages = [
    { emoji: "⏱️", label: "Timeline",     sub: "Exact sequence of events,\nwhat was observed when",    color: COLORS.accent  },
    { emoji: "🔎", label: "Root Cause",   sub: "5-Why analysis — drill\ndown 5 levels deep",            color: COLORS.warning },
    { emoji: "💥", label: "Impact",       sub: "Users affected, revenue\nloss, duration, SLA breach",   color: COLORS.danger  },
    { emoji: "🛡️", label: "Action Items", sub: "System improvements,\nnot individual punishment",       color: ACCENT         },
  ];
  const nW = 2.1;
  const nY = 1.28;
  stages.forEach((s, i) => {
    const x = 0.3 + i * (nW + 0.3);
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: nY, w: nW, h: 1.5, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: s.color, width: 1.5 },
    });
    slide.addText(s.emoji, { x, y: nY + 0.1, w: nW, h: 0.42, fontSize: 24, align: "center", valign: "middle" });
    slide.addText(s.label, {
      x: x + 0.08, y: nY + 0.58, w: nW - 0.16, h: 0.3,
      fontSize: 11, bold: true, color: s.color, fontFace: FONTS.body, align: "center",
    });
    slide.addText(s.sub, {
      x: x + 0.08, y: nY + 0.9, w: nW - 0.16, h: 0.55,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
    if (i < stages.length - 1) {
      addHArrow(slide, pres, { x: x + nW + 0.02, y: nY + 0.63, w: 0.27, color: COLORS.border });
    }
  });

  // 5-Why example
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.98, w: 9.4, h: 1.45, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addText("5-Why Example", {
    x: 0.5, y: 3.02, w: 2.0, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  const whys = [
    "Why was the API down? → DB connection pool exhausted",
    "Why exhausted? → Traffic spike after marketing campaign",
    "Why no auto-scale? → HPA not configured for this deployment",
    "Why not configured? → No checklist for new service onboarding",
    "Why no checklist? → Onboarding process was never documented → ACTION: create runbook",
  ];
  whys.forEach((w, i) => {
    slide.addText(w, {
      x: 0.5, y: 3.32 + i * 0.22, w: 9.0, h: 0.2,
      fontSize: 9, color: i === 4 ? ACCENT : COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.6,
    text: "Google pioneered blameless postmortems — the goal is learning and system improvement, not accountability theater",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 145 — Observability Maturity Model
// ─────────────────────────────────────────────────────────────────────────────
function slide145(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Observability Maturity Model",
    partLabel: "PART 10 SRE  · 145 / 150",
    accentColor: ACCENT,
    complexity: 6,
  });

  const levels = [
    { level: "0", label: "No Monitoring",           sub: "Find out from customers calling you",                    color: COLORS.danger  },
    { level: "1", label: "Basic Metrics",            sub: "CPU, memory, manual alert checking",                    color: COLORS.warning },
    { level: "2", label: "Structured Logs",          sub: "JSON logs + basic dashboards",                          color: COLORS.warning },
    { level: "3", label: "Distributed Tracing",      sub: "Trace IDs + correlated across services",                color: COLORS.accent  },
    { level: "4", label: "SLO-Based Alerting",       sub: "Error budgets, symptom-based alerts",                   color: ACCENT         },
    { level: "5", label: "AIOps & Auto-Remediation", sub: "Full OTel + automated healing + AI anomaly detection",  color: ACCENT         },
  ];

  const barW = 8.8;
  const barH = 0.56;
  const startX = 0.6;
  levels.forEach((l, i) => {
    const y = 0.68 + i * (barH + 0.1);
    const fillW = barW * ((i + 1) / levels.length);

    slide.addShape(pres.ShapeType.roundRect, {
      x: startX, y, w: barW, h: barH, rectRadius: 0.07,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.5 },
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: startX, y, w: fillW, h: barH, rectRadius: 0.07,
      fill: { color: COLORS.bg3 }, line: { color: l.color, width: 0 },
    });

    // Level badge
    slide.addShape(pres.ShapeType.ellipse, {
      x: startX + 0.06, y: y + 0.08, w: 0.38, h: 0.38,
      fill: { color: l.color }, line: { color: l.color, width: 0 },
    });
    slide.addText(l.level, {
      x: startX + 0.06, y: y + 0.08, w: 0.38, h: 0.38,
      fontSize: 11, bold: true, color: COLORS.bg, fontFace: FONTS.body, align: "center", valign: "middle",
    });

    slide.addText(l.label, {
      x: startX + 0.54, y: y + 0.06, w: 3.5, h: 0.26,
      fontSize: 10.5, bold: true, color: l.color, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(l.sub, {
      x: startX + 0.54, y: y + 0.3, w: fillW - 0.58, h: 0.2,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "Most companies are at Level 2–3. Getting to Level 4 (SLO-based alerting) has the highest ROI",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 146 — Observability Cost Control
// ─────────────────────────────────────────────────────────────────────────────
function slide146(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Observability Cost Control",
    partLabel: "PART 10 SRE  · 146 / 150",
    accentColor: ACCENT,
    complexity: 6,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.44, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("⚠️  Observability is NOT free — it costs: storage, compute, network egress, SaaS vendor fees", {
    x: 0.5, y: 0.67, w: 9.0, h: 0.4,
    fontSize: 10.5, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  const levers = [
    {
      emoji: "📋", title: "Log Sampling",
      sub: "Not every DEBUG log in production\nInfo level in prod; debug on demand only",
      color: COLORS.warning,
    },
    {
      emoji: "📊", title: "Metric Cardinality Limits",
      sub: "Avoid high-cardinality labels (e.g., user_id, request_id)\nEach unique label value = a new time series",
      color: COLORS.danger,
    },
    {
      emoji: "🔍", title: "Trace Sampling",
      sub: "1–10% typical in production\nHead-based or tail-based sampling strategies",
      color: COLORS.accent,
    },
    {
      emoji: "🗄️", title: "Retention Policies",
      sub: "Hot: 7 days (fast SSD)\nWarm: 30 days (object storage)\nCold: 1 year (cheap archival)",
      color: ACCENT,
    },
  ];

  levers.forEach((l, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x   = 0.2  + col * 4.9;
    const y   = 1.28 + row * 1.25;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: 4.6, h: 1.12, rectRadius: 0.09,
      fill: { color: COLORS.bg2 }, line: { color: l.color, width: 1.0 },
    });
    slide.addText(l.emoji, { x, y, w: 0.56, h: 1.12, fontSize: 22, align: "center", valign: "middle" });
    slide.addText(l.title, {
      x: x + 0.6, y: y + 0.1, w: 3.9, h: 0.28,
      fontSize: 11, bold: true, color: l.color, fontFace: FONTS.body,
    });
    slide.addText(l.sub, {
      x: x + 0.6, y: y + 0.4, w: 3.9, h: 0.65,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "Rule of thumb: observability cost should be 5–10% of total infrastructure spend — if it's more, optimize",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 147 — Common Observability Anti-Patterns
// ─────────────────────────────────────────────────────────────────────────────
function slide147(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Common Observability Anti-Patterns",
    partLabel: "PART 10 SRE  · 147 / 150",
    accentColor: ACCENT,
    complexity: 5,
  });

  const antiPatterns = [
    {
      emoji: "🔔", title: "Alert on Everything",
      sub: "Alert fatigue → engineers ignore pages → real incidents missed",
      fix: "Alert only on user-visible symptoms with clear SLO breach",
    },
    {
      emoji: "📝", title: "Logs Without Structure",
      sub: "Unstructured text logs → grep hell, no aggregation possible",
      fix: "Always emit structured JSON logs with consistent fields",
    },
    {
      emoji: "📊", title: "Dashboard Sprawl",
      sub: "500 dashboards, nobody maintains them, stale metrics everywhere",
      fix: "Fewer, curated dashboards: service overview + SLO + dependencies",
    },
    {
      emoji: "🔍", title: "Tracing Without Sampling",
      sub: "100% trace capture = storage explosion + performance overhead",
      fix: "Use tail-based sampling at 1–10% or sample on errors only",
    },
    {
      emoji: "📉", title: "No SLOs",
      sub: "Can't measure reliability without objectives — flying blind",
      fix: "Define SLOs for every user-facing service, even internal ones",
    },
    {
      emoji: "🔬", title: "Observability Only in Production",
      sub: "Adding monitoring after go-live is too late — debug in prod",
      fix: "Instrument during development; use OTel SDK from day one",
    },
  ];

  const colW = 4.55;
  antiPatterns.forEach((ap, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x   = 0.2  + col * (colW + 0.5);
    const y   = 0.67 + row * 1.2;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: colW, h: 1.1, rectRadius: 0.09,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.danger, width: 0.75 },
    });
    slide.addText(ap.emoji, { x, y, w: 0.52, h: 1.1, fontSize: 20, align: "center", valign: "middle" });
    slide.addText(ap.title, {
      x: x + 0.56, y: y + 0.07, w: colW - 0.65, h: 0.26,
      fontSize: 10.5, bold: true, color: COLORS.danger, fontFace: FONTS.body,
    });
    slide.addText(`❌ ${ap.sub}`, {
      x: x + 0.56, y: y + 0.35, w: colW - 0.65, h: 0.3,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
    slide.addText(`✅ ${ap.fix}`, {
      x: x + 0.56, y: y + 0.66, w: colW - 0.65, h: 0.3,
      fontSize: 8.5, color: ACCENT, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "Avoiding these anti-patterns is what separates mature SRE teams from reactive firefighting cultures",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 148 — OpenTelemetry Full Ecosystem Overview
// ─────────────────────────────────────────────────────────────────────────────
function slide148(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "OpenTelemetry Full Ecosystem Overview",
    partLabel: "PART 10 SRE  · 148 / 150",
    accentColor: ACCENT,
    complexity: 7,
  });

  // Left: Instrumentation
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.2, y: 0.67, w: 2.7, h: 4.28, rectRadius: 0.1,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.accent, width: 1.2 },
  });
  slide.addText("📦  Instrumentation", {
    x: 0.3, y: 0.72, w: 2.5, h: 0.32,
    fontSize: 10.5, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });
  slide.addText("OTel SDK", {
    x: 0.3, y: 1.08, w: 2.5, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  const langs = ["Python", "Java", "Go", "Node.js", ".NET", "Ruby"];
  langs.forEach((l, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.35, y: 1.35 + i * 0.46, w: 2.4, h: 0.38, rectRadius: 0.06,
      fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.5 },
    });
    slide.addText(l, {
      x: 0.35, y: 1.35 + i * 0.46, w: 2.4, h: 0.38,
      fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.code, align: "center", valign: "middle",
    });
  });

  // Center: OTel Collector
  slide.addShape(pres.ShapeType.roundRect, {
    x: 3.55, y: 1.2, w: 2.9, h: 2.5, rectRadius: 0.12,
    fill: { color: COLORS.bg3 }, line: { color: ACCENT, width: 2.0 },
  });
  slide.addText("⚙️", { x: 3.55, y: 1.3, w: 2.9, h: 0.5, fontSize: 26, align: "center", valign: "middle" });
  slide.addText("OTel Collector", {
    x: 3.55, y: 1.82, w: 2.9, h: 0.3,
    fontSize: 13, bold: true, color: ACCENT, fontFace: FONTS.title, align: "center",
  });
  slide.addText("THE HUB", {
    x: 3.55, y: 2.14, w: 2.9, h: 0.22,
    fontSize: 9, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  const collectorFeats = ["Receive → Process → Export", "Filtering & sampling", "Batching & retry", "Multi-backend export"];
  collectorFeats.forEach((f, i) => {
    slide.addText(`• ${f}`, {
      x: 3.7, y: 2.4 + i * 0.26, w: 2.6, h: 0.24,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  // Arrows left → center
  addHArrow(slide, pres, { x: 2.92, y: 2.3, w: 0.62, label: "OTLP", color: COLORS.accent });

  // Right: Backends
  slide.addShape(pres.ShapeType.roundRect, {
    x: 7.1, y: 0.67, w: 2.7, h: 4.28, rectRadius: 0.1,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.infra, width: 1.2 },
  });
  slide.addText("🗄️  Backends", {
    x: 7.2, y: 0.72, w: 2.5, h: 0.32,
    fontSize: 10.5, bold: true, color: COLORS.infra, fontFace: FONTS.body,
  });
  const backends = [
    { name: "Jaeger",      sub: "Traces (OSS)",   color: COLORS.warning },
    { name: "Prometheus",  sub: "Metrics (OSS)",  color: COLORS.warning },
    { name: "Loki / Tempo",sub: "Logs+Traces",    color: ACCENT         },
    { name: "Datadog",     sub: "Commercial",     color: COLORS.danger  },
    { name: "New Relic",   sub: "Commercial",     color: COLORS.danger  },
    { name: "Zipkin",      sub: "Traces (OSS)",   color: COLORS.accent  },
  ];
  backends.forEach((b, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 7.2, y: 1.1 + i * 0.54, w: 2.4, h: 0.44, rectRadius: 0.06,
      fill: { color: COLORS.bg3 }, line: { color: b.color, width: 0.75 },
    });
    slide.addText(b.name, {
      x: 7.25, y: 1.12 + i * 0.54, w: 1.4, h: 0.4,
      fontSize: 9.5, bold: true, color: b.color, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(b.sub, {
      x: 8.65, y: 1.12 + i * 0.54, w: 0.95, h: 0.4,
      fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
    });
  });

  // Arrow center → right
  addHArrow(slide, pres, { x: 6.46, y: 2.3, w: 0.62, label: "OTLP/gRPC", color: COLORS.infra });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "Vendor portability: switch from Jaeger to Tempo without changing a single line of app code — just reconfigure the Collector",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 149 — Observability Checklist
// ─────────────────────────────────────────────────────────────────────────────
function slide149(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Observability Checklist",
    partLabel: "PART 10 SRE  · 149 / 150",
    accentColor: ACCENT,
    complexity: 5,
  });

  const checklist = [
    {
      emoji: "📈", title: "Metrics",
      items: ["RED metrics (Rate, Errors, Duration) defined", "Per-service dashboards in Grafana", "Cardinality limits enforced"],
      color: COLORS.warning,
    },
    {
      emoji: "📋", title: "Logs",
      items: ["Structured JSON with correlation ID", "No sensitive data (PII scrubbed)", "Log levels configured per env"],
      color: COLORS.accent,
    },
    {
      emoji: "🔍", title: "Traces",
      items: ["OTel SDK instrumented", "Sampling configured (1–10%)", "Context propagation across services"],
      color: COLORS.infra,
    },
    {
      emoji: "🔔", title: "Alerts",
      items: ["Every SLO has an alert", "Every alert has a runbook", "Alert fatigue reviewed monthly"],
      color: COLORS.danger,
    },
    {
      emoji: "📊", title: "Dashboards",
      items: ["Service overview dashboard", "Dependency map", "SLO / error budget board"],
      color: ACCENT,
    },
    {
      emoji: "🚨", title: "Incident",
      items: ["On-call rotation defined", "Escalation policy documented", "Postmortem process established"],
      color: COLORS.success,
    },
  ];

  const colW  = 2.95;
  const cardH = 1.5;
  checklist.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x   = 0.25 + col * (colW + 0.3);
    const y   = 0.67 + row * (cardH + 0.15);

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: colW, h: cardH, rectRadius: 0.1,
      fill: { color: COLORS.bg2 }, line: { color: c.color, width: 1.2 },
    });
    slide.addText(`${c.emoji}  ${c.title}`, {
      x: x + 0.12, y: y + 0.1, w: colW - 0.24, h: 0.3,
      fontSize: 11, bold: true, color: c.color, fontFace: FONTS.body,
    });
    c.items.forEach((item, j) => {
      slide.addShape(pres.ShapeType.ellipse, {
        x: x + 0.15, y: y + 0.48 + j * 0.32 + 0.07, w: 0.12, h: 0.12,
        fill: { color: c.color }, line: { color: c.color, width: 0 },
      });
      slide.addText(item, {
        x: x + 0.34, y: y + 0.46 + j * 0.32, w: colW - 0.44, h: 0.3,
        fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
      });
    });
  });

  addTipBar(slide, pres, {
    y: 4.88,
    text: "Use this checklist as a gate before deploying any new service to production — automate it in your CI/CD pipeline",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 150 — Course Complete: The Full Cloud Native Journey
// ─────────────────────────────────────────────────────────────────────────────
function slide150(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Course Complete: The Full Cloud Native Journey 🎉",
    partLabel: "PART 10 SRE  · 150 / 150",
    accentColor: ACCENT,
    complexity: 5,
  });

  // Celebratory background tint
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: HEADER_H, w: W, h: H - HEADER_H,
    fill: { color: "0F2A1A" }, line: { color: "0F2A1A", width: 0 },
  });

  // Journey steps — two rows of 5
  const journey = [
    { emoji: "🖥️", label: "Traditional",   sub: "Single server" },
    { emoji: "⚖️", label: "Scale Out",      sub: "LB + replicas"  },
    { emoji: "🐳", label: "Containers",     sub: "Docker"         },
    { emoji: "📐", label: "12-Factor App",  sub: "Cloud-native"   },
    { emoji: "🚀", label: "DevOps",         sub: "CI/CD pipeline" },
    { emoji: "🔧", label: "SRE",            sub: "Reliability"    },
    { emoji: "📈", label: "Metrics",        sub: "Prometheus"     },
    { emoji: "📋", label: "Logs",           sub: "Loki / ELK"     },
    { emoji: "🔍", label: "Tracing",        sub: "OTel / Jaeger"  },
    { emoji: "🏆", label: "Observability",  sub: "Three Pillars"  },
  ];

  const stepW   = 0.9;
  const stepH   = 0.95;
  const rowY1   = 0.68;
  const rowY2   = 1.78;
  const totalW  = W - 0.4;
  const perRow  = 5;
  const spacing = (totalW - perRow * stepW) / (perRow - 1);

  journey.forEach((j, i) => {
    const row  = Math.floor(i / perRow);
    const col  = i % perRow;
    const x    = 0.2 + col * (stepW + spacing);
    const y    = rowY1 + row * (stepH + 0.15);
    const isLast = i === journey.length - 1;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: stepW, h: stepH, rectRadius: 0.1,
      fill: { color: isLast ? COLORS.cardSuccess : COLORS.bg3 },
      line: { color: isLast ? ACCENT : COLORS.border, width: isLast ? 2.0 : 1.0 },
    });

    // Step number
    slide.addShape(pres.ShapeType.ellipse, {
      x: x + stepW - 0.26, y: y - 0.12, w: 0.26, h: 0.26,
      fill: { color: isLast ? ACCENT : COLORS.border }, line: { color: "000000", width: 0 },
    });
    slide.addText(`${i + 1}`, {
      x: x + stepW - 0.26, y: y - 0.12, w: 0.26, h: 0.26,
      fontSize: 8, bold: true, color: COLORS.bg, fontFace: FONTS.body, align: "center", valign: "middle",
    });

    slide.addText(j.emoji, { x, y: y + 0.06, w: stepW, h: 0.38, fontSize: 20, align: "center", valign: "middle" });
    slide.addText(j.label, {
      x: x + 0.03, y: y + 0.48, w: stepW - 0.06, h: 0.24,
      fontSize: 8.5, bold: true, color: isLast ? ACCENT : COLORS.text, fontFace: FONTS.body, align: "center",
    });
    slide.addText(j.sub, {
      x: x + 0.03, y: y + 0.7, w: stepW - 0.06, h: 0.2,
      fontSize: 7, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });

    // Arrow between steps (within same row)
    if (col < perRow - 1) {
      addHArrow(slide, pres, { x: x + stepW + 0.02, y: y + 0.37, w: spacing - 0.02, color: COLORS.border });
    }
  });

  // Bottom congratulations message
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.9, w: 9.4, h: 0.5, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.5 },
  });
  slide.addText("🎓  你現在具備了在真實世界部署與運維分散式系統的能力", {
    x: 0.5, y: 2.92, w: 9.0, h: 0.46,
    fontSize: 12, bold: true, color: ACCENT, fontFace: FONTS.title, align: "center", valign: "middle",
  });

  // Achievement badges
  const badges = ["150 Slides", "10 Parts", "Full Stack to SRE", "Cloud Native Ready"];
  const bW = 2.1;
  badges.forEach((b, i) => {
    const bx = 0.3 + i * (bW + 0.13);
    slide.addShape(pres.ShapeType.roundRect, {
      x: bx, y: 3.55, w: bW, h: 0.4, rectRadius: 0.1,
      fill: { color: COLORS.cardSuccess }, line: { color: ACCENT, width: 1.0 },
    });
    slide.addText(`⭐  ${b}`, {
      x: bx, y: 3.55, w: bW, h: 0.4,
      fontSize: 9, bold: true, color: ACCENT, fontFace: FONTS.body, align: "center", valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 4.5,
    text: "Next Steps: Kubernetes · Service Mesh (Istio) · GitOps (Argo CD / Flux) · FinOps · Platform Engineering",
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
    slide136, slide137, slide138, slide139, slide140,
    slide141, slide142, slide143, slide144, slide145,
    slide146, slide147, slide148, slide149, slide150,
  ]) {
    await fn(pres);
  }

  await pres.writeFile({ fileName: "output/part10_sre.pptx" });
  console.log("✅  output/part10_sre.pptx created (15 slides, 136–150)");
}

if (require.main === module) { main(); }
