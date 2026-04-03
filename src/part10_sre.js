// src/part10_sre.js
// Part 10: SRE (Slides 136–150)

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
  addTipBar,
  addAlertBar,
  addThreeCols,
  addCodeCard,
  addCompareItem,
  addCompareHeading,
  addSummaryCard,
  addMetricCard,
} = require("./helpers");

const ACCENT = COLORS.success; // 3FB950
const label  = () => "PART 10";

// ─────────────────────────────────────────────────────────────────────────────
// Slide 136 — Three Pillars Integration: Grafana Stack
// ─────────────────────────────────────────────────────────────────────────────
function slide136(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Three Pillars Integration: Grafana Stack",
    partLabel: label(136),
    accentColor: ACCENT,
    complexity: 7,
  });

  const gx = 3.8, gy = 1.6, gw = 2.4, gh = 1.0;
  slide.addShape(pres.ShapeType.roundRect, {
    x: gx, y: gy, w: gw, h: gh, rectRadius: 0.1,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 2.0 },
  });
  slide.addText("📊  Grafana", {
    x: gx, y: gy + 0.1, w: gw, h: 0.4,
    fontSize: 14, bold: true, color: ACCENT, fontFace: FONTS.title, align: "center",
  });
  slide.addText("Unified Observability Interface", {
    x: gx, y: gy + 0.55, w: gw, h: 0.3,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  const sources = [
    { emoji: "📈", name: "Prometheus",    meta: "Metrics", color: COLORS.warning, x: 0.3, y: 1.5, query: "PromQL"  },
    { emoji: "📋", name: "Loki",          meta: "Logs",    color: COLORS.backend, x: 0.3, y: 2.8, query: "LogQL"   },
    { emoji: "🔍", name: "Tempo",         meta: "Traces",  color: COLORS.infra,   x: 7.4, y: 1.5, query: "TraceQL" },
    { emoji: "🔔", name: "AlertManager",  meta: "Alerts",  color: COLORS.danger,  x: 7.4, y: 2.8, query: "API"     },
  ];
  sources.forEach((src) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: src.x, y: src.y, w: 2.0, h: 0.85, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: src.color, width: 1.2 },
    });
    slide.addText(src.emoji + "  " + src.name, {
      x: src.x, y: src.y + 0.08, w: 2.0, h: 0.35,
      fontSize: 11, bold: true, color: src.color, fontFace: FONTS.body, align: "center",
    });
    slide.addText("(" + src.meta + ")", {
      x: src.x, y: src.y + 0.45, w: 2.0, h: 0.28,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
  });

  addHArrow(slide, pres, { x: 2.3, y: 1.73, w: 1.5, label: "PromQL",  color: COLORS.warning });
  addHArrow(slide, pres, { x: 2.3, y: 3.03, w: 1.5, label: "LogQL",   color: COLORS.backend });
  addHArrow(slide, pres, { x: 6.2, y: 1.73, w: 1.2, label: "TraceQL", color: COLORS.infra   });
  addHArrow(slide, pres, { x: 6.2, y: 3.03, w: 1.2, label: "API",     color: COLORS.danger  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.0, w: 9.4, h: 0.52, rectRadius: 0.08,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addText("🔗  Integration Flow: Click metric anomaly  →  Find Trace  →  View correlated logs", {
    x: 0.5, y: 4.0, w: 9.0, h: 0.52,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "Grafana Stack = Prometheus (Metrics) + Loki (Logs) + Tempo (Traces) + Grafana (UI) — open-source, vendor-neutral, fully integrated",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 137 — Alert → Incident → Postmortem Complete Flow
// ─────────────────────────────────────────────────────────────────────────────
function slide137(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Alert → Incident → Postmortem Complete Flow",
    partLabel: label(137),
    accentColor: ACCENT,
    complexity: 6,
  });

  const steps = [
    { no: "1", name: "Alert Fired",     sub: "Prometheus rule triggered",       color: COLORS.danger  },
    { no: "2", name: "Route & Notify", sub: "AlertManager → PagerDuty",        color: COLORS.warning },
    { no: "3", name: "Acknowledge",    sub: "On-call engineer accepts alert",   color: COLORS.accent  },
    { no: "4", name: "Investigate",    sub: "Use Grafana Dashboard",            color: COLORS.accent  },
    { no: "5", name: "Mitigate",       sub: "Hotfix or rollback",              color: COLORS.success },
    { no: "6", name: "Postmortem",     sub: "Blameless review within 48 hrs",  color: ACCENT         },
  ];

  const nodeW = 1.4, nodeH = 0.82, arrowW = 0.22;
  const totalW = steps.length * nodeW + (steps.length - 1) * arrowW;
  const startX = (W - totalW) / 2;
  const rowY   = 0.65;

  steps.forEach((step, i) => {
    const x = startX + i * (nodeW + arrowW);
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: rowY, w: nodeW, h: nodeH, rectRadius: 0.09,
      fill: { color: COLORS.bg2 }, line: { color: step.color, width: 1.5 },
    });
    slide.addText(step.no, {
      x: x + 0.05, y: rowY + 0.04, w: 0.24, h: 0.22,
      fontSize: 8, bold: true, color: step.color, fontFace: FONTS.body,
    });
    slide.addText(step.name, {
      x, y: rowY + 0.14, w: nodeW, h: 0.3,
      fontSize: 10.5, bold: true, color: step.color, fontFace: FONTS.body, align: "center",
    });
    slide.addText(step.sub, {
      x: x + 0.05, y: rowY + 0.48, w: nodeW - 0.1, h: 0.28,
      fontSize: 7.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
    if (i < steps.length - 1) {
      addHArrow(slide, pres, { x: x + nodeW, y: rowY + 0.26, w: arrowW, color: COLORS.border });
    }
  });

  const metrics = [
    { value: "< 2 min",  label: "MTTD", sub: "Mean Time to Detect",  color: COLORS.danger  },
    { value: "< 5 min",  label: "MTTA", sub: "Mean Time to Acknowledge", color: COLORS.warning },
    { value: "< 30 min", label: "MTTR", sub: "Mean Time to Recover", color: COLORS.success },
  ];
  metrics.forEach((m, i) => {
    addMetricCard(slide, pres, {
      x: 0.4 + i * 3.1, y: 1.65, w: 2.8, h: 1.1, value: m.value, label: m.label, sub: m.sub, color: m.color,
    });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.05, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addText("⏱️  Alert Fired  →  Notification Sent  →  Acknowledged  →  Root Cause Found  →  Mitigated  →  Postmortem Complete", {
    x: 0.5, y: 3.05, w: 9.0, h: 0.42,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "Every alert should have a clear owner and runbook; production-impacting incidents must complete a postmortem within 48 hours",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 138 — SLI, SLO, SLA Definitions & Differences
// ─────────────────────────────────────────────────────────────────────────────
function slide138(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "SLI, SLO, SLA Definitions & Differences",
    partLabel: label(138),
    accentColor: ACCENT,
    complexity: 6,
  });

  addThreeCols(slide, pres, [
    {
      title: "SLI (Service Level Indicator)",
      icon: "📊",
      color: COLORS.accent,
      items: [
        { text: "Actual measured value" },
        { text: "Example: Request success rate" },
        { text: "Current value: 99.95%" },
        { text: "P99 latency: 180ms" },
        { text: "Computed from real traffic" },
      ],
    },
    {
      title: "SLO (Service Level Objective)",
      icon: "🎯",
      color: COLORS.warning,
      items: [
        { text: "Internal target" },
        { text: "Target: ≥ 99.9% success rate" },
        { text: "Set by engineering team" },
        { text: "Must be stricter than SLA" },
        { text: "Drives error budget policy" },
      ],
    },
    {
      title: "SLA (Service Level Agreement)",
      icon: "📝",
      color: COLORS.danger,
      items: [
        { text: "Contractual commitment to customers" },
        { text: "Promise: ≥ 99.5% success rate" },
        { text: "Agreed upon with customers" },
        { text: "Breach triggers financial penalties" },
        { text: "Must be more lenient than SLO" },
      ],
    },
  ], { y: HEADER_H + 0.1, h: 3.88 });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.46, w: 9.4, h: 0.3, rectRadius: 0.07,
    fill: { color: COLORS.cardWarn }, line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("⚠️  Core Principle: SLO must be stricter than SLA | SLI=99.95% → SLO=99.9% → SLA=99.5%", {
    x: 0.5, y: 4.46, w: 9.0, h: 0.3,
    fontSize: 9.5, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 5.06,
    text: "SLO is your internal target, SLA is your commitment to customers — always keep SLO > SLA",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 139 — Error Budget: The Compass of Reliability Engineering
// ─────────────────────────────────────────────────────────────────────────────
function slide139(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Error Budget: The Compass of Reliability Engineering",
    partLabel: label(139),
    accentColor: ACCENT,
    complexity: 7,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.0 },
  });
  slide.addText("Error Budget = 1 − SLO  →  99.9% SLO = 0.1% budget ≈ ~43.8 min downtime/month", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 11, bold: true, color: ACCENT, fontFace: FONTS.body, valign: "middle",
  });

  slide.addText("Monthly Budget Consumption (Example: 68% used)", {
    x: 0.5, y: 1.18, w: 9.0, h: 0.24,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 1.42, w: 9.4, h: 0.26, rectRadius: 0.05,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 1.42, w: 9.4 * 0.68, h: 0.26, rectRadius: 0.05,
    fill: { color: COLORS.warning }, line: { color: COLORS.warning, width: 0 },
  });
  slide.addText("68%", {
    x: 0.3, y: 1.42, w: 9.4 * 0.68, h: 0.26,
    fontSize: 9, bold: true, color: COLORS.bg, fontFace: FONTS.body, align: "right", valign: "middle",
  });

  const states = [
    {
      icon: "✅",
      title: "Budget Healthy (< 50% used)",
      desc:  "Deploy freely · Experiment boldly · Ship features aggressively",
      color: COLORS.success, bg: COLORS.cardSuccess,
    },
    {
      icon: "⚠️",
      title: "Budget Warning (50–90% used)",
      desc:  "Slow down releases · Investigate reliability issues",
      color: COLORS.warning, bg: COLORS.cardWarn,
    },
    {
      icon: "🔥",
      title: "Budget Exhausted (≥ 100% used)",
      desc:  "Freeze deployments · Enter incident mode · SRE + Dev focus on reliability",
      color: COLORS.danger, bg: COLORS.cardDanger,
    },
  ];
  states.forEach((s, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: 1.86 + i * 0.66, w: 9.4, h: 0.54, rectRadius: 0.08,
      fill: { color: s.bg }, line: { color: s.color, width: 1.0 },
    });
    slide.addText(s.icon + "  " + s.title, {
      x: 0.5, y: 1.86 + i * 0.66 + 0.04, w: 4.2, h: 0.46,
      fontSize: 11, bold: true, color: s.color, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(s.desc, {
      x: 4.8, y: 1.86 + i * 0.66 + 0.04, w: 4.7, h: 0.46,
      fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "Error budget is the shared contract between Product and SRE — when budget is exhausted, reliability takes priority over velocity",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 140 — SRE Engineer Responsibilities
// ─────────────────────────────────────────────────────────────────────────────
function slide140(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "SRE Engineer Responsibilities",
    partLabel: label(140),
    accentColor: ACCENT,
    complexity: 6,
  });

  const cards = [
    { emoji: "📊", title: "Availability & Reliability",     sub: "Define SLOs, track SLIs, maintain service health" },
    { emoji: "📐", title: "Capacity Planning",               sub: "Forecast growth, scale proactively before overload" },
    { emoji: "⚡", title: "Performance & Efficiency",        sub: "Optimize latency, throughput, and resource utilization" },
    { emoji: "🚀", title: "Change Management (Safe Deploy)", sub: "Safe deployments, Feature Flags, Canary releases" },
    { emoji: "🔔", title: "Monitoring & Alerting",           sub: "Build dashboards, tune alerts, reduce noise" },
    { emoji: "🚨", title: "Emergency Incident Response",     sub: "On-call rotation, incident command, runbooks" },
  ];

  const colW = 4.55;
  cards.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.3 + col * (colW + 0.3);
    const y = 0.65 + row * 0.84;
    addCompareItem(slide, pres, { x, y, w: colW, emoji: c.emoji, title: c.title, sub: c.sub, type: "good" });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.88, w: 9.4, h: 0.44, rectRadius: 0.08,
    fill: { color: COLORS.bg3 }, line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("⏱️  50% Rule: SREs should spend less than 50% of their time on toil; the rest goes to engineering improvements", {
    x: 0.5, y: 3.88, w: 9.0, h: 0.44,
    fontSize: 10.5, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.78,
    text: "SRE is not just operations — it's applying software engineering to reliability problems",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 141 — Toil: What It Is and Why It Matters
// ─────────────────────────────────────────────────────────────────────────────
function slide141(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Toil: What It Is and Why It Matters",
    partLabel: label(141),
    accentColor: ACCENT,
    complexity: 5,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger }, line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("🔥  Toil: Manual · Repetitive · Automatable · Scales linearly with growth · No lasting value", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 10.5, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  addCompareHeading(slide, pres, { x: 0.3,  y: 1.14, w: 4.55, label: "❌  Toil Examples",              type: "bad"  });
  addCompareHeading(slide, pres, { x: 5.15, y: 1.14, w: 4.55, label: "✅  Non-Toil (Engineering Value)", type: "good" });

  const toils = [
    "Manually SSH into each server to deploy",
    "Ticket-driven capacity adjustments",
    "Writing runbooks from scratch every time",
    "Manually restarting crashed Pods",
    "Copy-pasting configs between environments",
  ];
  const nonToils = [
    "Building CI/CD pipelines",
    "Writing auto-scaling controllers",
    "Creating self-healing runbooks once",
    "Implementing auto-restart with health checks",
    "Using Terraform for Infrastructure as Code",
  ];

  toils.forEach((t, i) => {
    addCompareItem(slide, pres, { x: 0.3,  y: 1.6 + i * 0.46, w: 4.55, emoji: "✗", title: t, type: "bad"  });
  });
  nonToils.forEach((t, i) => {
    addCompareItem(slide, pres, { x: 5.15, y: 1.6 + i * 0.46, w: 4.55, emoji: "✓", title: t, type: "good" });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.95, w: 9.4, h: 0.28, rectRadius: 0.07,
    fill: { color: COLORS.bg3 }, line: { color: ACCENT, width: 0.75 },
  });
  slide.addText("🎯  Goal: Automate toil away and keep toil under 50% of total time", {
    x: 0.5, y: 4.95, w: 9.0, h: 0.28,
    fontSize: 9.5, bold: true, color: ACCENT, fontFace: FONTS.body, valign: "middle",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 142 — On-call Design Principles
// ─────────────────────────────────────────────────────────────────────────────
function slide142(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "On-call Design Principles",
    partLabel: label(142),
    accentColor: ACCENT,
    complexity: 6,
  });

  const principles = [
    { emoji: "✅", title: "Alerts Must Be Actionable",        sub: "Every alert needs clear response steps; otherwise it's noise" },
    { emoji: "🎯", title: "Alert on Symptoms, Not Causes",   sub: "Alert on 'users experiencing latency', not 'CPU usage high'" },
    { emoji: "📖", title: "Every Alert Needs a Runbook",     sub: "Any on-call engineer should be able to follow the steps" },
    { emoji: "🔕", title: "Reduce Alert Fatigue",            sub: "Too many false positives make engineers ignore all alerts, destroying team culture" },
    { emoji: "🔄", title: "Rotation Must Be Sustainable",    sub: "Rotation cycles must not cause burnout; ensure sufficient backup" },
    { emoji: "👥", title: "Primary + Secondary On-call",     sub: "Dual coverage ensures adequate support for major incidents" },
  ];

  const colW = 4.55;
  principles.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.3 + col * (colW + 0.3);
    const y = 0.65 + row * 0.85;
    addCompareItem(slide, pres, { x, y, w: colW, emoji: p.emoji, title: p.title, sub: p.sub, type: "good" });
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "Gold standard for alert design: when an alert fires at 3 AM, the on-call engineer knows exactly what to do",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 143 — Runbook Writing Guide
// ─────────────────────────────────────────────────────────────────────────────
function slide143(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Runbook Writing Guide",
    partLabel: label(143),
    accentColor: ACCENT,
    complexity: 5,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.0 },
  });
  slide.addText("Runbook = Step-by-step guide for handling a specific alert — enables any on-call engineer to resolve independently, not just experts", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 10.5, bold: true, color: ACCENT, fontFace: FONTS.body, valign: "middle",
  });

  const runbookCode = [
    "# Runbook: High Error Rate Alert (high-error-rate)",
    "",
    "## Alert Description",
    "- Service: payment-service",
    "- Condition: error_rate > 1% for 5 minutes",
    "",
    "## Impact Scope",
    "- Users: Unable to complete checkout flow",
    "",
    "## Investigation Steps",
    "1. Check Grafana Dashboard: payment-service overview",
    "2. Identify failing endpoint: /api/checkout vs /api/refund",
    "3. Check Loki logs: {service=\"payment\"} |= \"ERROR\"",
    "4. Trace related spans: Click Exemplar in Grafana",
    "",
    "## Mitigation Steps",
    "1. If recent deploy → Rollback immediately",
    "2. If DB connection issue → Restart connection pool",
    "3. If Stripe API issue → Enable degraded mode",
    "",
    "## Escalation Path",
    "- Not mitigated in 15 min → Notify Tech Lead",
    "- Not mitigated in 30 min → Initiate P1 incident process",
  ].join("\n");

  addCodeCard(slide, pres, {
    x: 0.3, y: 1.22, w: 9.4, h: 3.55, code: runbookCode, language: "Markdown",
  });

  addTipBar(slide, pres, {
    y: 5.05,
    text: "A good runbook enables even the most junior on-call engineer to handle incidents — after writing, have a colleague test if the steps actually work",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 144 — Blameless Postmortem
// ─────────────────────────────────────────────────────────────────────────────
function slide144(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Blameless Postmortem",
    partLabel: label(144),
    accentColor: ACCENT,
    complexity: 6,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.cardSuccess }, line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("🎯  Core Principle: Review systems, not people — individuals made reasonable decisions within a flawed system", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 11, bold: true, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
  });

  const sections = [
    { title: "Timeline Reconstruction", desc: "Record events in chronological order to establish clear cause-and-effect",          color: COLORS.accent  },
    { title: "Root Cause Analysis",    desc: "Use 5 Whys to drill down layer by layer and find systemic root causes",           color: COLORS.warning },
    { title: "Impact Assessment",      desc: "Quantify impact: affected users, duration, revenue loss",                         color: COLORS.danger  },
    { title: "Action Items",           desc: "Specific, trackable improvement measures with assigned owners and deadlines",      color: COLORS.success },
  ];
  sections.forEach((s, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.3 + col * 4.75;
    const y = 1.14 + row * 0.82;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: 4.55, h: 0.72, rectRadius: 0.09,
      fill: { color: COLORS.bg2 }, line: { color: s.color, width: 1.0 },
    });
    slide.addText(s.title, {
      x: x + 0.12, y: y + 0.06, w: 4.3, h: 0.26,
      fontSize: 11, bold: true, color: s.color, fontFace: FONTS.body,
    });
    slide.addText(s.desc, {
      x: x + 0.12, y: y + 0.34, w: 4.3, h: 0.32,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.88, w: 9.4, h: 1.45, rectRadius: 0.09,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addText("5 Whys Example", {
    x: 0.5, y: 2.93, w: 2.5, h: 0.26,
    fontSize: 9.5, bold: true, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  const whys = [
    "① Why did the service go down? → DB connections exhausted",
    "② Why exhausted? → Connections not properly released",
    "③ Why not released? → Missing finally block",
    "④ Why missing? → No code review checklist",
    "🎯  Fix: Establish a code review checklist",
  ];
  whys.forEach((w, i) => {
    slide.addText(w, {
      x: 0.5, y: 3.22 + i * 0.21, w: 9.0, h: 0.21,
      fontSize: 9, color: i === 4 ? ACCENT : COLORS.text, fontFace: FONTS.body, bold: i === 4,
    });
  });

  addTipBar(slide, pres, {
    y: 4.65,
    text: "Google SRE culture: Postmortems are learning opportunities, not punishment — sharing openly benefits the entire organization",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 145 — Observability Maturity Model
// ─────────────────────────────────────────────────────────────────────────────
function slide145(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Observability Maturity Model",
    partLabel: label(145),
    accentColor: ACCENT,
    complexity: 6,
  });

  const levels = [
    { level: "Level 0 (Critical)", name: "No Monitoring",          desc: "Outages discovered from customer complaints; fully reactive",                       color: COLORS.danger    },
    { level: "Level 1 (Warning)", name: "Basic Metrics",           desc: "CPU & memory monitoring, manual alert checking, no auto-notification",              color: COLORS.warning   },
    { level: "Level 2",           name: "Structured Logging",      desc: "JSON structured logs + basic dashboards, searchable",                               color: COLORS.textMuted },
    { level: "Level 3",           name: "Distributed Tracing",     desc: "OTel Tracing + Correlation ID, cross-service tracing",                              color: COLORS.accent    },
    { level: "Level 4",           name: "SLO-Driven",              desc: "SLO-based alerting + error budget management, user-experience focused",             color: COLORS.success   },
    { level: "Level 5 (Target)",  name: "Full Observability",      desc: "Complete OTel, auto-remediation, AIOps anomaly detection",                          color: ACCENT           },
  ];

  levels.forEach((lv, i) => {
    const y = 0.63 + i * 0.65;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 9.4, h: 0.55, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: lv.color, width: 1.0 },
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y, w: 2.1, h: 0.55, rectRadius: 0.08,
      fill: { color: COLORS.bg3 }, line: { color: lv.color, width: 0 },
    });
    slide.addText(lv.level, {
      x: 0.4, y: y + 0.05, w: 2.0, h: 0.44,
      fontSize: 9, bold: true, color: lv.color, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(lv.name, {
      x: 2.5, y: y + 0.05, w: 1.9, h: 0.44,
      fontSize: 11, bold: true, color: lv.color, fontFace: FONTS.body, valign: "middle",
    });
    slide.addText(lv.desc, {
      x: 4.5, y: y + 0.05, w: 5.1, h: 0.44,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 4.57,
    text: "Most teams are at Level 2–3 — aim for Level 4 (SLO-driven); Level 5 is the long-term goal",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 146 — Observability Cost Control Strategies
// ─────────────────────────────────────────────────────────────────────────────
function slide146(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Observability Cost Control Strategies",
    partLabel: label(146),
    accentColor: ACCENT,
    complexity: 6,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("💰  Observability is not free: storage, compute, and network all cost money — target 5–10% of infra cost", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 11, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  const strategies = [
    { emoji: "📉", title: "Log Sampling",           sub: "Don't log all DEBUG in production; dynamically adjust log levels" },
    { emoji: "📊", title: "Metric Cardinality Cap", sub: "Avoid high-cardinality labels (e.g. user_id) — they blow up Prometheus memory" },
    { emoji: "🔍", title: "Trace Sampling",          sub: "Typical 1–10% sampling rate; reduce sampling for high-traffic paths" },
    { emoji: "💾", title: "Data Retention Policy",   sub: "Hot data 7 days, warm data 30 days, cold data archived for 1 year" },
  ];

  const colW = 4.55;
  strategies.forEach((s, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.3 + col * (colW + 0.3);
    const y = 1.16 + row * 0.8;
    addCompareItem(slide, pres, { x, y, w: colW, emoji: s.emoji, title: s.title, sub: s.sub, type: "good" });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.5, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.cardWarn }, line: { color: COLORS.warning, width: 0.8 },
  });
  slide.addText("Principle: Observability cost should be 5–10% of infra cost — exceeding that signals a design problem", {
    x: 0.5, y: 3.5, w: 9.0, h: 0.42,
    fontSize: 10.5, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  const retentions = [
    { label: "Hot Data",  period: "7 days",  color: COLORS.danger  },
    { label: "Warm Data", period: "30 days", color: COLORS.warning },
    { label: "Cold Data", period: "1 year",  color: COLORS.accent  },
  ];
  retentions.forEach((r, i) => {
    addMetricCard(slide, pres, {
      x: 0.4 + i * 3.1, y: 4.0, w: 2.8, h: 0.75,
      value: r.period, label: r.label, color: r.color,
    });
  });

  addTipBar(slide, pres, {
    y: 5.06,
    text: "High cardinality is Prometheus's biggest cost trap — never use user_id as a label",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 147 — Common Observability Anti-patterns
// ─────────────────────────────────────────────────────────────────────────────
function slide147(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Common Observability Anti-patterns",
    partLabel: label(147),
    accentColor: ACCENT,
    complexity: 5,
  });

  const antiPatterns = [
    { emoji: "🔔", title: "Alerting on Everything",            sub: "Alert fatigue causes engineers to ignore all alerts, including critical ones" },
    { emoji: "📝", title: "Unstructured Logs",                sub: "Grep hell — searching plain-text logs with grep doesn't scale" },
    { emoji: "📊", title: "Dashboard Sprawl",                 sub: "100 dashboards but nobody knows which to look at, and nobody maintains them" },
    { emoji: "🔍", title: "No Trace Sampling",                sub: "Collecting 100% of traces causes storage costs to explode" },
    { emoji: "🎯", title: "No SLOs Defined",                  sub: "Cannot objectively measure reliability or make data-driven decisions" },
    { emoji: "🌐", title: "Observability Only in Production", sub: "Issues should be caught in dev; discovering them late costs the most" },
  ];

  const colW = 4.55;
  antiPatterns.forEach((ap, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.3 + col * (colW + 0.3);
    const y = 0.65 + row * 0.88;
    addCompareItem(slide, pres, { x, y, w: colW, emoji: ap.emoji, title: ap.title, sub: ap.sub, type: "bad" });
  });

  addTipBar(slide, pres, {
    y: 4.0,
    text: "Observability anti-patterns are accumulated debt — each one increases MTTR for the next incident",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 148 — OpenTelemetry Complete Ecosystem Overview
// ─────────────────────────────────────────────────────────────────────────────
function slide148(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "OpenTelemetry Complete Ecosystem Overview",
    partLabel: label(148),
    accentColor: ACCENT,
    complexity: 7,
  });

  const sdks = [
    { emoji: "🐍", name: "Python SDK",   color: COLORS.warning },
    { emoji: "☕", name: "Java SDK",     color: COLORS.danger  },
    { emoji: "🐹", name: "Go SDK",       color: COLORS.accent  },
    { emoji: "🟩", name: "Node.js SDK",  color: COLORS.success },
  ];
  sdks.forEach((sdk, i) => {
    addMiniNode(slide, pres, {
      x: 0.2, y: 0.72 + i * 0.9, w: 1.8, h: 0.7,
      emoji: sdk.emoji, label: sdk.name, borderColor: sdk.color,
    });
  });

  sdks.forEach((_, i) => {
    addHArrow(slide, pres, { x: 2.0, y: 0.92 + i * 0.9, w: 0.5, color: COLORS.border });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.55, y: 0.72, w: 2.5, h: 3.78, rectRadius: 0.12,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 2.0 },
  });
  slide.addText("🔧", {
    x: 2.55, y: 0.82, w: 2.5, h: 0.5,
    fontSize: 22, align: "center",
  });
  slide.addText("OTel Collector", {
    x: 2.55, y: 1.38, w: 2.5, h: 0.35,
    fontSize: 12, bold: true, color: ACCENT, fontFace: FONTS.body, align: "center",
  });
  ["Receive · Process · Export", "Traces / Metrics / Logs", "Multi-backend output", "Sampling · Filtering · Transform"].forEach((f, i) => {
    slide.addText(f, {
      x: 2.65, y: 1.82 + i * 0.3, w: 2.3, h: 0.28,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
  });

  addHArrow(slide, pres, { x: 5.05, y: 1.25, w: 0.5, color: COLORS.border });
  addHArrow(slide, pres, { x: 5.05, y: 2.85, w: 0.5, color: COLORS.border });

  addZoneBorder(slide, pres, { x: 5.55, y: 0.72, w: 2.0, h: 1.82, color: COLORS.success, label: "Open Source" });
  [
    { name: "Jaeger",       color: COLORS.infra   },
    { name: "Prometheus",   color: COLORS.warning },
    { name: "Loki / Tempo", color: COLORS.backend },
  ].forEach((b, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.65, y: 1.0 + i * 0.48, w: 1.8, h: 0.36, rectRadius: 0.06,
      fill: { color: COLORS.bg3 }, line: { color: b.color, width: 0.75 },
    });
    slide.addText(b.name, {
      x: 5.65, y: 1.0 + i * 0.48, w: 1.8, h: 0.36,
      fontSize: 9.5, bold: true, color: b.color, fontFace: FONTS.body, align: "center", valign: "middle",
    });
  });

  addZoneBorder(slide, pres, { x: 5.55, y: 2.64, w: 2.0, h: 1.86, color: COLORS.warning, label: "Commercial" });
  [
    { name: "Datadog",   color: COLORS.warning },
    { name: "New Relic", color: COLORS.accent  },
    { name: "Honeycomb", color: COLORS.danger  },
  ].forEach((c, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.65, y: 2.9 + i * 0.48, w: 1.8, h: 0.36, rectRadius: 0.06,
      fill: { color: COLORS.bg3 }, line: { color: c.color, width: 0.75 },
    });
    slide.addText(c.name, {
      x: 5.65, y: 2.9 + i * 0.48, w: 1.8, h: 0.36,
      fontSize: 9.5, bold: true, color: c.color, fontFace: FONTS.body, align: "center", valign: "middle",
    });
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 7.65, y: 0.72, w: 2.1, h: 3.78, rectRadius: 0.1,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.5 },
  });
  slide.addText("🔌  Vendor Portability", {
    x: 7.7, y: 0.82, w: 2.0, h: 0.35,
    fontSize: 10, bold: true, color: ACCENT, fontFace: FONTS.body, align: "center",
  });
  slide.addText("Switch backends without modifying application code — just change the Collector export config", {
    x: 7.7, y: 1.24, w: 2.0, h: 2.1,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "OTel is the USB standard for observability — instrument once, switch any backend, protect your investment",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 149 — Observability Pre-launch Checklist
// ─────────────────────────────────────────────────────────────────────────────
function slide149(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Observability Pre-launch Checklist",
    partLabel: label(149),
    accentColor: ACCENT,
    complexity: 5,
  });

  const checks = [
    { emoji: "📈", title: "Metrics",      sub: "All services define RED metrics (Rate, Errors, Duration)" },
    { emoji: "📋", title: "Logs",        sub: "JSON structured logs with Correlation ID, no sensitive data" },
    { emoji: "🔍", title: "Traces",      sub: "OTel SDK integrated, sampling configured, Context Propagation working" },
    { emoji: "🔔", title: "Alerts",      sub: "Every SLO has an alert, every alert has a Runbook" },
    { emoji: "📊", title: "Dashboard",   sub: "Service overview dashboard, dependency graph, SLO dashboard" },
    { emoji: "🚨", title: "Incidents",   sub: "On-call rotation set, escalation policy defined, postmortem process established" },
  ];

  const colW = 4.55;
  checks.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.3 + col * (colW + 0.3);
    const y = 0.65 + row * 0.9;
    addCompareItem(slide, pres, { x, y, w: colW, emoji: c.emoji, title: c.title, sub: c.sub, type: "good" });
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "The pre-launch checklist is not a formality — every gap is the reason the next 3 AM incident can't be resolved quickly",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 150 — Course Complete: The Full Cloud Native Journey
// ─────────────────────────────────────────────────────────────────────────────
function slide150(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Course Complete: The Full Cloud Native Journey",
    partLabel: label(150),
    accentColor: ACCENT,
    complexity: 5,
  });

  slide.addText("🎓  Congratulations on completing the full Cloud Native course!", {
    x: 0.3, y: 0.58, w: 9.4, h: 0.44,
    fontSize: 16, bold: true, color: ACCENT, fontFace: FONTS.title, align: "center", valign: "middle",
  });

  const steps = [
    { emoji: "🖥️", name: "Traditional Deploy", sub: "Single server"            },
    { emoji: "⚖️", name: "Scale Out",         sub: "Multi-server + LB"       },
    { emoji: "🐳", name: "Containerization",  sub: "Docker consistent env"    },
    { emoji: "📐", name: "12-Factor App",     sub: "Cloud native principles"  },
    { emoji: "🔄", name: "DevOps",            sub: "CI/CD pipelines"          },
    { emoji: "🛡️", name: "SRE",              sub: "Reliability engineering"  },
    { emoji: "📈", name: "Metrics",           sub: "Prometheus+Grafana"       },
    { emoji: "📋", name: "Logs",              sub: "ELK+Loki"                 },
    { emoji: "🔍", name: "Tracing",           sub: "OTel+Jaeger+Tempo"        },
    { emoji: "🎯", name: "Full Observability", sub: "Three pillars unified"   },
  ];

  const stepW = 1.7, stepH = 1.0, gap = 0.14;
  const totalW = 5 * stepW + 4 * gap;
  const startX = (W - totalW) / 2;

  steps.forEach((s, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const x = startX + col * (stepW + gap);
    const y = 1.1 + row * (stepH + 0.18);
    const isLast = i === steps.length - 1;
    const borderColor = isLast ? ACCENT : COLORS.border;
    const bgColor     = isLast ? COLORS.cardSuccess : COLORS.bg2;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: stepW, h: stepH, rectRadius: 0.09,
      fill: { color: bgColor }, line: { color: borderColor, width: isLast ? 1.8 : 0.75 },
    });
    slide.addText(s.emoji, {
      x, y: y + 0.07, w: stepW, h: 0.36,
      fontSize: 16, align: "center", valign: "middle",
    });
    slide.addText(s.name, {
      x: x + 0.05, y: y + 0.46, w: stepW - 0.1, h: 0.3,
      fontSize: isLast ? 9.5 : 9, bold: isLast,
      color: isLast ? ACCENT : COLORS.text, fontFace: FONTS.body, align: "center",
    });
    slide.addText(s.sub, {
      x: x + 0.05, y: y + 0.72, w: stepW - 0.1, h: 0.24,
      fontSize: 7.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
    if (col < 4) {
      addHArrow(slide, pres, { x: x + stepW, y: y + 0.35, w: gap, color: COLORS.border });
    }
  });

  slide.addText("🎓  You now have the skills to deploy and operate distributed systems in the real world", {
    x: 0.3, y: 3.38, w: 9.4, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
  });

  const badges = ["150 Slides", "10 Topics", "Full-stack to SRE", "Cloud Native Ready"];
  const badgeW = 2.0, badgeGap = 0.5;
  const badgeTotalW = badges.length * badgeW + (badges.length - 1) * badgeGap;
  const badgeStartX = (W - badgeTotalW) / 2;
  badges.forEach((b, i) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: badgeStartX + i * (badgeW + badgeGap), y: 3.76, w: badgeW, h: 0.42, rectRadius: 0.08,
      fill: { color: COLORS.cardSuccess }, line: { color: ACCENT, width: 1.0 },
    });
    slide.addText("🏆  " + b, {
      x: badgeStartX + i * (badgeW + badgeGap), y: 3.76, w: badgeW, h: 0.42,
      fontSize: 9.5, bold: true, color: ACCENT, fontFace: FONTS.body, align: "center", valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "Next steps: Kubernetes · Service Mesh (Istio) · GitOps (Argo CD / Flux) · FinOps · Platform Engineering",
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

main().catch(err => { console.error(err); process.exit(1); });
