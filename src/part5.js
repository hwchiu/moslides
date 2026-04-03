// src/part5.js
// Part 5: DevOps and CI/CD (Slides 35–42)

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
// Slide 35 — What is DevOps?
// ─────────────────────────────────────────────────────────────────────────────
function slide35(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "DevOps: Breaking Down the Wall Between Dev and Ops",
    partLabel: "PART 5",
    accentColor: COLORS.accent,
  });

  // ── Left column — Dev side ────────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.2,
    label: "👨‍💻 Dev Team", type: "good",
  });

  const devItems = [
    { text: "💡 Rapidly develop new features", border: COLORS.frontend, bold: true },
    { text: "🔀 Frequently merge code",   border: COLORS.frontend, bold: false },
    { text: "⚡ Push code at 5 PM Friday", border: COLORS.frontend, bold: false },
    { text: "🙏 \"Ship it now!\"",  border: COLORS.frontend, bold: false },
  ];
  devItems.forEach((item, i) => {
    const y = 1.1 + i * 0.52;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.4, y, w: 4.0, h: 0.45, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: item.border, width: 1.0 },
    });
    slide.addText(item.text, {
      x: 0.55, y: y + 0.07, w: 3.7, h: 0.3,
      fontSize: 10, bold: item.bold, color: COLORS.text, fontFace: FONTS.body,
      valign: "middle",
    });
  });

  // Dev metrics
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.4, y: 3.28, w: 1.9, h: 0.68, rectRadius: 0.1,
    fill: { color: COLORS.cardSuccess }, line: { color: COLORS.success, width: 1.0 },
  });
  slide.addText("×12", {
    x: 0.4, y: 3.28, w: 1.9, h: 0.42,
    fontSize: 22, bold: true, color: COLORS.success, fontFace: FONTS.title, align: "center",
  });
  slide.addText("feature/week  ·  Dev Velocity", {
    x: 0.4, y: 3.68, w: 1.9, h: 0.22,
    fontSize: 7.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // ── Center wall ───────────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.55, w: 0.01, h: 4.62,
    line: { color: COLORS.danger, width: 3 },
  });
  slide.addText("🧱  THE WALL", {
    x: 4.62, y: 2.3, w: 0.75, h: 1.0,
    fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body,
    align: "center", valign: "middle", rotate: 270,
  });

  // Conflict arrows pointing at wall
  [1.3, 2.1, 2.9].forEach(arrowY => {
    slide.addShape(pres.ShapeType.line, {
      x: 4.5, y: arrowY, w: 0.48, h: 0.01,
      line: { color: COLORS.danger, width: 1.5, endArrowType: "arrow" },
    });
    slide.addShape(pres.ShapeType.line, {
      x: 5.02, y: arrowY, w: 0.48, h: 0.01,
      line: { color: COLORS.danger, width: 1.5, beginArrowType: "arrow" },
    });
  });

  // ── Right column — Ops side ───────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 5.3, y: 0.62, w: 4.2,
    label: "🔧 Ops Team", type: "bad",
  });

  const opsItems = [
    "🚨 Stability first, don't touch it!",
    "😰 No deploys on Friday at 5 PM",
    "📋 Change management requires approval",
    "😤 \"You broke Prod!\"",
  ];
  opsItems.forEach((text, i) => {
    const y = 1.1 + i * 0.52;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.4, y, w: 4.0, h: 0.45, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.danger, width: 1.0 },
    });
    slide.addText(text, {
      x: 5.55, y: y + 0.07, w: 3.7, h: 0.3,
      fontSize: 10, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  // Ops metrics
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.4, y: 3.28, w: 1.9, h: 0.68, rectRadius: 0.1,
    fill: { color: COLORS.cardWarn }, line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("×3h", {
    x: 5.4, y: 3.28, w: 1.9, h: 0.42,
    fontSize: 22, bold: true, color: COLORS.warning, fontFace: FONTS.title, align: "center",
  });
  slide.addText("MTTR  ·  Mean Time To Restore", {
    x: 5.4, y: 3.68, w: 1.9, h: 0.22,
    fontSize: 7.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // ── Bottom banner ─────────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.25, w: 9.4, h: 0.78, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText(
    "✅  The core goal of DevOps: tear down this wall — unify dev, test, deploy, and ops into one continuous flow",
    {
      x: 0.4, y: 4.28, w: 9.2, h: 0.72,
      fontSize: 12, bold: true, color: COLORS.success, fontFace: FONTS.body,
      align: "center", valign: "middle",
    }
  );

  addTipBar(slide, pres, {
    y: 5.08,
    text: "DevOps is not a job title — it's a culture and practice. Dev understands Ops, Ops understands Dev, automate everything",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 36 — CI/CD Pipeline
// ─────────────────────────────────────────────────────────────────────────────
function slide36(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "CI/CD Pipeline: Fully Automated from Commit to Production",
    partLabel: "PART 5",
    accentColor: COLORS.success,
  });

  // ── Pipeline nodes ────────────────────────────────────────────────────────
  const nodes = [
    { x: 0.20, emoji: "💻", name: "Code",    meta: "git push",              borderColor: COLORS.client },
    { x: 1.95, emoji: "🔨", name: "Build",   meta: "compile\ndocker build", borderColor: COLORS.accent },
    { x: 3.70, emoji: "🧪", name: "Test",    meta: "unit test\nintegration", borderColor: COLORS.warning },
    { x: 5.45, emoji: "📦", name: "Package", meta: "docker push\nRegistry", borderColor: COLORS.container },
    { x: 7.20, emoji: "🚀", name: "Deploy",  meta: "Staging\nK8s apply",    borderColor: COLORS.infra },
    { x: 8.95, emoji: "✅", name: "Prod",    meta: "Production",            borderColor: COLORS.success, w: 0.95 },
  ];

  nodes.forEach(n => {
    addNodeCard(slide, pres, {
      x: n.x, y: 0.72, w: n.w || 1.4, h: 1.45,
      emoji: n.emoji, name: n.name, meta: n.meta,
      borderColor: n.borderColor,
    });
  });

  // Arrows between nodes
  const arrowDefs = [
    { x: 1.62, label: "push",    color: COLORS.accent },
    { x: 3.37, label: "build",   color: COLORS.accent },
    { x: 5.12, label: "test",    color: COLORS.warning },
    { x: 6.87, label: "push",    color: COLORS.container },
    { x: 8.62, label: "approve", color: COLORS.success },
  ];
  arrowDefs.forEach(a => {
    slide.addShape(pres.ShapeType.line, {
      x: a.x, y: 1.6, w: 0.3, h: 0.01,
      line: { color: a.color, width: 1.5, endArrowType: "arrow" },
    });
    slide.addText(a.label, {
      x: a.x - 0.05, y: 1.38, w: 0.4, h: 0.18,
      fontSize: 7.5, color: a.color, fontFace: FONTS.code, align: "center",
    });
  });

  // Zone borders
  addZoneBorder(slide, pres, {
    x: 0.15, y: 0.62, w: 5.6, h: 1.65,
    color: COLORS.accent, label: "CI — Continuous Integration",
  });
  addZoneBorder(slide, pres, {
    x: 5.35, y: 0.62, w: 4.5, h: 1.65,
    color: COLORS.success, label: "CD — Continuous Delivery",
  });

  // ── YAML code card ────────────────────────────────────────────────────────
  addCodeCard(slide, pres, {
    x: 0.3, y: 2.7, w: 4.8, h: 2.55,
    language: ".github/workflows/ci.yml",
    code: [
      "name: CI/CD Pipeline",
      "on: [push]",
      "",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pip install -r requirements.txt",
      "      - run: pytest",
      "",
      "  deploy:",
      "    needs: test",
      "    steps:",
      "      - run: docker build -t myapp:$GITHUB_SHA .",
      "      - run: docker push registry/myapp:$GITHUB_SHA",
      "      - run: kubectl set image deploy/api api=myapp:$GITHUB_SHA",
    ].join("\n"),
  });

  // ── Metric cards (2×2) ────────────────────────────────────────────────────
  const metrics = [
    { x: 5.4,  y: 2.75, value: "< 10min", label: "Pipeline Time Target",        color: COLORS.success },
    { x: 7.55, y: 2.75, value: "100%",    label: "Automated Test Coverage",            color: COLORS.accent  },
    { x: 5.4,  y: 3.95, value: "× 50+",  label: "Deploys/Day (Netflix)",    color: COLORS.warning },
    { x: 7.55, y: 3.95, value: "< 1hr",  label: "Commit→Prod Time",          color: COLORS.success },
  ];
  metrics.forEach(m => {
    addMetricCard(slide, pres, { x: m.x, y: m.y, w: 1.95, h: 1.05, value: m.value, label: m.label, color: m.color });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 37 — GitOps Workflow
// ─────────────────────────────────────────────────────────────────────────────
function slide37(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "GitOps: Git as the Single Source of Truth",
    partLabel: "PART 5",
    accentColor: COLORS.infra,
  });

  // ── Left — principles ─────────────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4, label: "GitOps Core Principles", type: "good",
  });

  const principles = [
    "① Git is the Single Source of Truth",
    "② All changes go through Pull Requests",
    "③ Auto-sync — Git state = Cluster state",
    "④ Auditable & rollbackable — git revert = rollback",
  ];
  principles.forEach((text, i) => {
    const y = 1.1 + i * 0.52;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.4, y, w: 4.1, h: 0.45, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.infra, width: 1.0 },
    });
    slide.addText(text, {
      x: 0.55, y: y + 0.07, w: 3.8, h: 0.3,
      fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  // GitOps tool badges
  const tools = [
    { label: "ArgoCD", x: 0.4,  color: COLORS.success },
    { label: "Flux",   x: 1.65, color: COLORS.success },
    { label: "Tekton", x: 2.9,  color: COLORS.accent  },
  ];
  tools.forEach(t => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: t.x, y: 3.2, w: 1.1, h: 0.38, rectRadius: 0.07,
      fill: { color: COLORS.bg2 }, line: { color: t.color, width: 1.0 },
    });
    slide.addText(t.label, {
      x: t.x, y: 3.2, w: 1.1, h: 0.38,
      fontSize: 10, bold: true, color: t.color, fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
  });

  // ── Right — GitOps flow diagram ───────────────────────────────────────────
  // Developer
  addNodeCard(slide, pres, {
    x: 5.1, y: 1.0, w: 1.4, h: 0.9,
    emoji: "👨‍💻", name: "Developer", meta: "local",
    borderColor: COLORS.client,
  });

  // Arrow down: Developer → Git Repo
  addVArrow(slide, pres, { x: 5.8, y: 1.93, h: 0.38, color: COLORS.accent });
  slide.addText("PR", {
    x: 5.85, y: 1.99, w: 0.4, h: 0.2,
    fontSize: 8, color: COLORS.accent, fontFace: FONTS.code,
  });

  // Git Repo
  addNodeCard(slide, pres, {
    x: 5.1, y: 2.35, w: 1.4, h: 0.9,
    emoji: "📁", name: "Git Repo", meta: "app-config",
    borderColor: COLORS.accent,
  });

  // Arrow right: Git Repo → ArgoCD
  slide.addShape(pres.ShapeType.line, {
    x: 6.55, y: 2.82, w: 0.55, h: 0.01,
    line: { color: COLORS.infra, width: 1.5, endArrowType: "arrow" },
  });
  slide.addText("watch", {
    x: 6.55, y: 2.65, w: 0.55, h: 0.18,
    fontSize: 7.5, color: COLORS.infra, fontFace: FONTS.code, align: "center",
  });

  // ArgoCD
  addNodeCard(slide, pres, {
    x: 7.15, y: 2.35, w: 1.4, h: 0.9,
    emoji: "🔄", name: "ArgoCD", meta: "GitOps Operator",
    borderColor: COLORS.infra,
  });

  // Arrow right: ArgoCD → K8s
  slide.addShape(pres.ShapeType.line, {
    x: 8.6, y: 2.82, w: 0.45, h: 0.01,
    line: { color: COLORS.success, width: 1.5, endArrowType: "arrow" },
  });
  slide.addText("apply", {
    x: 8.58, y: 2.65, w: 0.5, h: 0.18,
    fontSize: 7.5, color: COLORS.success, fontFace: FONTS.code, align: "center",
  });

  // K8s
  addNodeCard(slide, pres, {
    x: 9.1, y: 2.35, w: 0.8, h: 0.9,
    emoji: "☸️", name: "K8s", meta: "Cluster",
    borderColor: COLORS.success,
  });

  // Drift detection feedback arc (K8s → ArgoCD) — bottom curved path
  slide.addShape(pres.ShapeType.line, {
    x: 8.6, y: 3.55, w: 0.9, h: 0.01,
    line: { color: COLORS.warning, width: 1.2, dashType: "dash" },
  });
  slide.addShape(pres.ShapeType.line, {
    x: 7.15, y: 3.28, w: 0.01, h: 0.27,
    line: { color: COLORS.warning, width: 1.2, dashType: "dash" },
  });
  slide.addShape(pres.ShapeType.line, {
    x: 7.15, y: 3.55, w: 1.45, h: 0.01,
    line: { color: COLORS.warning, width: 1.2, dashType: "dash", endArrowType: "arrow" },
  });
  slide.addText("drift detect → auto-heal", {
    x: 7.18, y: 3.6, w: 1.85, h: 0.2,
    fontSize: 7.5, color: COLORS.warning, fontFace: FONTS.code, align: "center",
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "GitOps turns infrastructure into code — every Prod change has a git commit record, auditable and rollbackable",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 38 — Feature Flags
// ─────────────────────────────────────────────────────────────────────────────
function slide38(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Feature Flags: Decouple Deployment from Feature Release",
    partLabel: "PART 5",
    accentColor: COLORS.warning,
  });

  // ── Left — traditional approach ───────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4, label: "❌ Traditional: Deploy = Release", type: "bad",
  });

  const painItems = [
    { text: "😱 Every deploy impacts all users", color: COLORS.danger },
    { text: "⏱️ Issues require a full rollback",   color: COLORS.danger },
    { text: "🚫 Cannot test with specific users",   color: COLORS.warning },
  ];
  painItems.forEach((item, i) => {
    const y = 1.1 + i * 0.52;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.4, y, w: 4.1, h: 0.45, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: item.color, width: 1.0 },
    });
    slide.addText(item.text, {
      x: 0.55, y: y + 0.07, w: 3.8, h: 0.3,
      fontSize: 10, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });
  });

  // Vertical divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.55, w: 0.01, h: 4.2,
    line: { color: COLORS.border, width: 0.75 },
  });

  // ── Right — Feature Flags ─────────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 5.2, y: 0.62, w: 4.4, label: "✅ Feature Flags: Deploy ≠ Release", type: "good",
  });

  addCodeCard(slide, pres, {
    x: 5.25, y: 1.08, w: 4.35, h: 1.68,
    language: "Python",
    code: [
      "# Feature Flag control",
      "if feature_flags.is_enabled('new_checkout', user):",
      "    return new_checkout_flow(user)",
      "else:",
      "    return old_checkout_flow(user)",
    ].join("\n"),
  });

  // Use case badges
  const badges = [
    { label: "🧪 A/B Testing",    x: 5.25 },
    { label: "🐤 Canary Release", x: 6.75 },
    { label: "🎯 Internal Beta",  x: 8.25 },
  ];
  badges.forEach(b => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: b.x, y: 2.85, w: 1.4, h: 0.55, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.warning, width: 1.0 },
    });
    slide.addText(b.label, {
      x: b.x, y: 2.85, w: 1.4, h: 0.55,
      fontSize: 9.5, bold: true, color: COLORS.warning, fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
  });

  // ── Deploy vs Release decoupling ──────────────────────────────────────────
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.5, w: 9.4, h: 1.2, rectRadius: 0.1,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.warning, width: 1.2 },
  });

  // Left half
  slide.addText("🚀 Deploy", {
    x: 0.45, y: 3.58, w: 4.4, h: 0.32,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });
  slide.addText("Code is on Prod server — but Flag = OFF, users can't see it", {
    x: 0.45, y: 3.9, w: 4.4, h: 0.28,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Center divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 3.55, w: 0.01, h: 1.1,
    line: { color: COLORS.border, width: 0.75 },
  });

  // Right half
  slide.addText("🎉 Release", {
    x: 5.2, y: 3.58, w: 4.3, h: 0.32,
    fontSize: 12, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("Flip the Flag to ON — feature visible to users (can turn off anytime)", {
    x: 5.2, y: 3.9, w: 4.3, h: 0.28,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "Feature Flags enable Continuous Deployment — deploy dozens of times a day, let PM decide when to release",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 39 — Blue/Green vs Canary Deployment
// ─────────────────────────────────────────────────────────────────────────────
function slide39(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Deployment Strategies: Blue/Green vs Canary Release",
    partLabel: "PART 5",
    accentColor: COLORS.accent,
  });

  // ── Left — Blue/Green ─────────────────────────────────────────────────────
  slide.addText("🔵🟢 Blue/Green Deployment", {
    x: 0.3, y: 0.65, w: 4.4, h: 0.35,
    fontSize: 13, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  // Step 1 — Blue active, Green standby
  slide.addText("Step 1: Deploy new version to Green", {
    x: 0.3, y: 1.02, w: 4.4, h: 0.2,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 1.22, w: 2.0, h: 0.55, rectRadius: 0.08,
    fill: { color: COLORS.cardSuccess }, line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("🔵 Blue (v1) — 100% Traffic", {
    x: 0.3, y: 1.22, w: 2.0, h: 0.55,
    fontSize: 9, bold: true, color: COLORS.success, fontFace: FONTS.body,
    align: "center", valign: "middle",
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.45, y: 1.22, w: 2.0, h: 0.55, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.textMuted, width: 1.0 },
  });
  slide.addText("🟢 Green (v2) — 0% Traffic", {
    x: 2.45, y: 1.22, w: 2.0, h: 0.55,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    align: "center", valign: "middle",
  });

  // Step 2 — LB switch
  slide.addText("Step 2: LB switches traffic to Green", {
    x: 0.3, y: 1.82, w: 4.4, h: 0.2,
    fontSize: 8.5, color: COLORS.accent, fontFace: FONTS.body, bold: true,
  });
  slide.addShape(pres.ShapeType.line, {
    x: 2.4, y: 1.96, w: 0.6, h: 0.01,
    line: { color: COLORS.accent, width: 1.5, endArrowType: "arrow" },
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.05, w: 2.0, h: 0.55, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.textMuted, width: 1.0 },
  });
  slide.addText("🔵 Blue (v1) — 0%", {
    x: 0.3, y: 2.05, w: 2.0, h: 0.55,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    align: "center", valign: "middle",
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.45, y: 2.05, w: 2.0, h: 0.55, rectRadius: 0.08,
    fill: { color: COLORS.cardSuccess }, line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("🟢 Green (v2) — 100%", {
    x: 2.45, y: 2.05, w: 2.0, h: 0.55,
    fontSize: 9, bold: true, color: COLORS.success, fontFace: FONTS.body,
    align: "center", valign: "middle",
  });

  // Benefits
  const bgBenefits = [
    { text: "✅ Zero downtime",        color: COLORS.success, bold: true  },
    { text: "✅ Rollback by switching LB",     color: COLORS.success, bold: true  },
    { text: "⚠️ Requires two environments (cost)", color: COLORS.warning, bold: false },
  ];
  bgBenefits.forEach((b, i) => {
    slide.addText(b.text, {
      x: 0.4, y: 2.72 + i * 0.3, w: 4.2, h: 0.26,
      fontSize: 10.5, bold: b.bold, color: b.color, fontFace: FONTS.body,
    });
  });

  // ── Divider ───────────────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.line, {
    x: 4.95, y: 0.55, w: 0.01, h: 4.85,
    line: { color: COLORS.border, width: 0.75 },
  });

  // ── Right — Canary ────────────────────────────────────────────────────────
  slide.addText("🐤 Canary Release", {
    x: 5.2, y: 0.65, w: 4.5, h: 0.35,
    fontSize: 13, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });

  // LB node
  addMiniNode(slide, pres, {
    x: 5.8, y: 1.2, w: 1.0, h: 0.5,
    emoji: "⚖️", label: "LB", borderColor: COLORS.infra,
  });

  // Arrow from LB to v1 branch
  slide.addShape(pres.ShapeType.line, {
    x: 6.05, y: 1.72, w: 0.01, h: 0.35,
    line: { color: COLORS.client, width: 1.2 },
  });
  slide.addShape(pres.ShapeType.line, {
    x: 5.72, y: 2.07, w: 0.33, h: 0.01,
    line: { color: COLORS.client, width: 1.2, endArrowType: "arrow" },
  });

  // Arrow from LB to v2 branch
  slide.addShape(pres.ShapeType.line, {
    x: 6.05, y: 1.72, w: 0.01, h: 0.35,
    line: { color: COLORS.warning, width: 1.2 },
  });
  slide.addShape(pres.ShapeType.line, {
    x: 6.05, y: 2.07, w: 0.98, h: 0.01,
    line: { color: COLORS.warning, width: 1.2, endArrowType: "arrow" },
  });

  // v1 card
  addNodeCard(slide, pres, {
    x: 5.25, y: 2.1, w: 1.5, h: 0.75,
    emoji: "⚙️", name: "v1 × 9", meta: "90% Traffic",
    borderColor: COLORS.client,
  });

  // v2 card
  addNodeCard(slide, pres, {
    x: 7.25, y: 2.1, w: 1.5, h: 0.75,
    emoji: "⚙️", name: "v2 × 1", meta: "10% Traffic (Canary)",
    borderColor: COLORS.warning,
  });

  // Monitoring card
  addNodeCard(slide, pres, {
    x: 7.4, y: 3.05, w: 2.0, h: 0.78,
    emoji: "📊", name: "Monitoring", meta: "Error Rate < 0.1%?\nP99 Latency OK?",
    borderColor: COLORS.infra,
  });

  // V2 → Monitoring arrow
  addVArrow(slide, pres, { x: 8.0, y: 2.88, h: 0.15, color: COLORS.infra });

  // Success / fail paths
  slide.addText("✅ Auto-increase Canary traffic", {
    x: 5.25, y: 3.2, w: 2.1, h: 0.26,
    fontSize: 9.5, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("❌ Auto-rollback Canary", {
    x: 7.45, y: 3.9, w: 2.1, h: 0.26,
    fontSize: 9.5, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });

  // Canary benefits
  const canaryBenefits = [
    { text: "✅ Validate new version at small scale",  bold: true  },
    { text: "✅ Issues only affect a small subset of users", bold: false },
  ];
  canaryBenefits.forEach((b, i) => {
    slide.addText(b.text, {
      x: 5.3, y: 4.05 + i * 0.28, w: 4.3, h: 0.26,
      fontSize: 10.5, bold: b.bold, color: COLORS.success, fontFace: FONTS.body,
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 40 — DORA Metrics
// ─────────────────────────────────────────────────────────────────────────────
function slide40(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "DORA Metrics: Four Indicators of DevOps Maturity",
    partLabel: "PART 5",
    accentColor: COLORS.success,
  });

  const cards = [
    {
      x: 0.3, y: 0.65, border: COLORS.success,
      emoji: "🚀", name: "Deployment Frequency", sub: "How often you deploy",
      nameColor: COLORS.success,
      tiers: [
        { text: "Elite: Multiple/day",   color: COLORS.success },
        { text: "High: Daily to weekly",  color: COLORS.accent  },
        { text: "Medium: Weekly to monthly", color: COLORS.warning },
      ],
    },
    {
      x: 5.2, y: 0.65, border: COLORS.accent,
      emoji: "⚡", name: "Lead Time for Changes", sub: "Time from Commit to Prod",
      nameColor: COLORS.accent,
      tiers: [
        { text: "Elite: < 1 hour",  color: COLORS.success },
        { text: "High: < 1 day",     color: COLORS.accent  },
        { text: "Medium: 1 week to 1 month",  color: COLORS.warning },
      ],
    },
    {
      x: 0.3, y: 2.95, border: COLORS.danger,
      emoji: "🔥", name: "Change Failure Rate", sub: "Rate of deploys causing Prod issues",
      nameColor: COLORS.danger,
      tiers: [
        { text: "Elite: < 5%",    color: COLORS.success },
        { text: "High: < 15%",    color: COLORS.accent  },
        { text: "Medium: 15-45%", color: COLORS.warning },
      ],
    },
    {
      x: 5.2, y: 2.95, border: COLORS.warning,
      emoji: "🔧", name: "MTTR", sub: "Mean Time To Restore",
      nameColor: COLORS.warning,
      tiers: [
        { text: "Elite: < 1 hour", color: COLORS.success },
        { text: "High: < 1 day",    color: COLORS.accent  },
        { text: "Medium: 1 day to 1 week", color: COLORS.warning },
      ],
    },
  ];

  cards.forEach(c => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: c.x, y: c.y, w: 4.4, h: 2.15, rectRadius: 0.12,
      fill: { color: COLORS.bg2 }, line: { color: c.border, width: 1.5 },
      shadow: { type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.3 },
    });

    slide.addText(c.emoji, {
      x: c.x, y: c.y + 0.1, w: 4.4, h: 0.45,
      fontSize: 24, align: "center", valign: "middle",
    });

    slide.addText(c.name, {
      x: c.x + 0.12, y: c.y + 0.56, w: 4.16, h: 0.3,
      fontSize: 13, bold: true, color: c.nameColor, fontFace: FONTS.body, align: "center",
    });

    slide.addText(c.sub, {
      x: c.x + 0.12, y: c.y + 0.85, w: 4.16, h: 0.22,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });

    c.tiers.forEach((tier, i) => {
      slide.addText(tier.text, {
        x: c.x + 0.2, y: c.y + 1.12 + i * 0.3, w: 4.0, h: 0.26,
        fontSize: 10.5, bold: true, color: tier.color, fontFace: FONTS.body, align: "center",
      });
    });
  });

  addTipBar(slide, pres, {
    y: 5.15,
    text: "DORA Research (2019): Elite performers vs low performers — 208x faster deploys, 2604x faster recovery",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 41 — Testing Pyramid
// ─────────────────────────────────────────────────────────────────────────────
function slide41(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Testing Pyramid: Layers and Speed of Testing",
    partLabel: "PART 5",
    accentColor: COLORS.warning,
  });

  // ── Left — pyramid ────────────────────────────────────────────────────────
  // Layer 3 — E2E (top / smallest)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.0, y: 1.75, w: 3.2, h: 0.75, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger }, line: { color: COLORS.danger, width: 1.2 },
  });
  slide.addText("🌐 E2E Tests (10%)", {
    x: 1.05, y: 1.79, w: 3.1, h: 0.26,
    fontSize: 10, bold: true, color: COLORS.danger, fontFace: FONTS.body, align: "center",
  });
  slide.addText("Simulate real users | Minutes", {
    x: 1.05, y: 2.04, w: 3.1, h: 0.2,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Layer 2 — Integration (middle)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.65, y: 2.55, w: 3.9, h: 0.78, rectRadius: 0.08,
    fill: { color: COLORS.cardWarn }, line: { color: COLORS.warning, width: 1.2 },
  });
  slide.addText("🔗 Integration Tests (20%)", {
    x: 0.7, y: 2.59, w: 3.8, h: 0.26,
    fontSize: 10, bold: true, color: COLORS.warning, fontFace: FONTS.body, align: "center",
  });
  slide.addText("API + DB integration | Seconds", {
    x: 0.7, y: 2.84, w: 3.8, h: 0.2,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Layer 1 — Unit Tests (bottom / widest)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.38, w: 4.6, h: 0.75, rectRadius: 0.08,
    fill: { color: COLORS.cardSuccess }, line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("🧪 Unit Tests (70%)", {
    x: 0.35, y: 3.42, w: 4.5, h: 0.26,
    fontSize: 10, bold: true, color: COLORS.success, fontFace: FONTS.body, align: "center",
  });
  slide.addText("Fast | Isolated | Milliseconds    jest, pytest, go test", {
    x: 0.35, y: 3.67, w: 4.5, h: 0.2,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Speed indicator arrow (right side of pyramid)
  slide.addShape(pres.ShapeType.line, {
    x: 4.95, y: 1.7, w: 0.01, h: 2.4,
    line: { color: COLORS.textMuted, width: 1.2, endArrowType: "arrow" },
  });
  slide.addText("Slow 🐌", {
    x: 4.85, y: 1.6, w: 0.6, h: 0.22,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });
  slide.addText("Fast ⚡", {
    x: 4.85, y: 4.1, w: 0.6, h: 0.22,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // ── Right — code card ─────────────────────────────────────────────────────
  addCodeCard(slide, pres, {
    x: 5.4, y: 0.65, w: 4.3, h: 3.1,
    language: "pytest / jest commands",
    code: [
      "# CI Pipeline test order",
      "",
      "# 1. Unit Tests (fail fast)",
      "pytest tests/unit/ --tb=short",
      "js: jest --testPathPattern=unit",
      "",
      "# 2. Integration Tests",
      "pytest tests/integration/ \\",
      "  --docker-compose=docker-compose.test.yml",
      "",
      "# 3. E2E Tests (only on main)",
      "pytest tests/e2e/ \\",
      "  --base-url=https://staging.myapp.com",
    ].join("\n"),
  });

  // ── Bottom rule cards (3 cols) ────────────────────────────────────────────
  const rules = [
    { x: 0.3,  title: "⚡ Fail Fast",  desc: "Stop pipeline immediately on unit test failure" },
    { x: 3.55, title: "🔁 Test Isolation",   desc: "Each test is independent, no order dependency" },
    { x: 6.8,  title: "📊 Coverage",   desc: "Target 80%+, critical paths 100%" },
  ];
  rules.forEach(r => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: r.x, y: 3.88, w: 2.95, h: 0.72, rectRadius: 0.08,
      fill: { color: COLORS.bg2 }, line: { color: COLORS.border, width: 0.75 },
    });
    slide.addText(r.title, {
      x: r.x + 0.1, y: 3.93, w: 2.75, h: 0.26,
      fontSize: 11, bold: true, color: COLORS.accent, fontFace: FONTS.body,
    });
    slide.addText(r.desc, {
      x: r.x + 0.1, y: 4.19, w: 2.75, h: 0.26,
      fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 42 — Part 5 Summary
// ─────────────────────────────────────────────────────────────────────────────
function slide42(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Part 5 Summary: DevOps Makes Software Delivery Fly",
    partLabel: "PART 5",
    accentColor: COLORS.success,
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 0.65, w: 9.4, h: 1.38,
    icon: "🔄",
    title: "DevOps Is Culture, CI/CD Is the Toolchain",
    items: [
      "Break down the Dev/Ops wall — shared responsibility for delivery quality",
      "CI/CD Pipeline ensures every commit can be safely deployed",
    ],
    color: COLORS.accent,
    status: "Core Principle",
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 2.12, w: 9.4, h: 1.38,
    icon: "📊",
    title: "Measure Progress with DORA Metrics",
    items: [
      "4 metrics — Deploy Frequency, Lead Time, Failure Rate, MTTR",
      "Elite performers are not born — they are built by DevOps culture",
    ],
    color: COLORS.success,
    status: "Measurable Outcomes",
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 3.59, w: 9.4, h: 1.38,
    icon: "🚀",
    title: "Container + GitOps + CI/CD = The Modern Deployment Trio",
    items: [
      "Container: Consistent environments",
      "GitOps: Infrastructure as Code",
      "CI/CD: Automated delivery → Part 6: Observability & SRE",
    ],
    color: COLORS.container,
    status: "Integrated View",
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
  for (const fn of [slide35, slide36, slide37, slide38, slide39, slide40, slide41, slide42]) {
    await fn(pres);
  }
  await pres.writeFile({ fileName: "output/part5.pptx" });
  console.log("part5.pptx created");
}
main().catch(console.error);
