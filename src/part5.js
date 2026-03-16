// src/part5.js
// Part 5: DevOps and CI/CD (Slides 35–42)

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

// ─────────────────────────────────────────────────────────────────────────────
// Slide 35 — DevOps 是什麼？
// ─────────────────────────────────────────────────────────────────────────────
function slide35(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "DevOps：打破開發與維運的高牆",
    partLabel: "PART 5  ·  35 / 50",
    accentColor: COLORS.accent,
  });

  // ── Left column — Dev side ────────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.2,
    label: "👨‍💻 開發團隊 (Dev)", type: "good",
  });

  const devItems = [
    { text: "💡 快速開發新功能", border: COLORS.frontend, bold: true },
    { text: "🔀 頻繁合併代碼",   border: COLORS.frontend, bold: false },
    { text: "⚡ 下午 5 點 push code", border: COLORS.frontend, bold: false },
    { text: "🙏 「快點上線！」",  border: COLORS.frontend, bold: false },
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
  slide.addText("feature/week  ·  功能開發速度", {
    x: 0.4, y: 3.68, w: 1.9, h: 0.22,
    fontSize: 7.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // ── Center wall ───────────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.55, w: 0, h: 4.62,
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
      x: 4.5, y: arrowY, w: 0.48, h: 0,
      line: { color: COLORS.danger, width: 1.5, endArrowType: "arrow" },
    });
    slide.addShape(pres.ShapeType.line, {
      x: 5.02, y: arrowY, w: 0.48, h: 0,
      line: { color: COLORS.danger, width: 1.5, beginArrowType: "arrow" },
    });
  });

  // ── Right column — Ops side ───────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 5.3, y: 0.62, w: 4.2,
    label: "🔧 維運團隊 (Ops)", type: "bad",
  });

  const opsItems = [
    "🚨 穩定第一，不要動！",
    "😰 週五 5 點不能部署",
    "📋 變更管理需要審批",
    "😤 「你們搞壞了 Prod！」",
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
  slide.addText("MTTR  ·  平均故障恢復時間", {
    x: 5.4, y: 3.68, w: 1.9, h: 0.22,
    fontSize: 7.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // ── Bottom banner ─────────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.25, w: 9.4, h: 0.78, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText(
    "✅  DevOps 的核心目標：拆掉這道牆 — 讓開發、測試、部署、維運成為統一的連續流程",
    {
      x: 0.4, y: 4.28, w: 9.2, h: 0.72,
      fontSize: 12, bold: true, color: COLORS.success, fontFace: FONTS.body,
      align: "center", valign: "middle",
    }
  );

  addTipBar(slide, pres, {
    y: 5.08,
    text: "DevOps 不是職稱，是文化和實踐 — Dev 懂 Ops，Ops 懂 Dev，自動化一切",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 36 — CI/CD Pipeline
// ─────────────────────────────────────────────────────────────────────────────
function slide36(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "CI/CD Pipeline：從 Commit 到 Production 全自動",
    partLabel: "PART 5  ·  36 / 50",
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
      x: a.x, y: 1.6, w: 0.3, h: 0,
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
    { x: 5.4,  y: 2.75, value: "< 10min", label: "Pipeline 時間目標",        color: COLORS.success },
    { x: 7.55, y: 2.75, value: "100%",    label: "自動化測試覆蓋",            color: COLORS.accent  },
    { x: 5.4,  y: 3.95, value: "× 50+",  label: "每天部署次數 (Netflix)",    color: COLORS.warning },
    { x: 7.55, y: 3.95, value: "< 1hr",  label: "Commit→Prod 時間",          color: COLORS.success },
  ];
  metrics.forEach(m => {
    addMetricCard(slide, pres, { x: m.x, y: m.y, w: 1.95, h: 1.05, value: m.value, label: m.label, color: m.color });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 37 — GitOps 工作流
// ─────────────────────────────────────────────────────────────────────────────
function slide37(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "GitOps：Git 作為唯一真相來源",
    partLabel: "PART 5  ·  37 / 50",
    accentColor: COLORS.infra,
  });

  // ── Left — principles ─────────────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4, label: "GitOps 核心原則", type: "good",
  });

  const principles = [
    "① Git 是唯一真相來源 (Single Source of Truth)",
    "② 所有變更通過 Pull Request",
    "③ 自動同步 — Git state = Cluster state",
    "④ 可審計、可回滾 — git revert 即回滾",
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
    x: 6.55, y: 2.82, w: 0.55, h: 0,
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
    x: 8.6, y: 2.82, w: 0.45, h: 0,
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
    x: 8.6, y: 3.55, w: 0.9, h: 0,
    line: { color: COLORS.warning, width: 1.2, dashType: "dash" },
  });
  slide.addShape(pres.ShapeType.line, {
    x: 7.15, y: 3.28, w: 0, h: 0.27,
    line: { color: COLORS.warning, width: 1.2, dashType: "dash" },
  });
  slide.addShape(pres.ShapeType.line, {
    x: 7.15, y: 3.55, w: 1.45, h: 0,
    line: { color: COLORS.warning, width: 1.2, dashType: "dash", endArrowType: "arrow" },
  });
  slide.addText("drift detect → auto-heal", {
    x: 7.18, y: 3.6, w: 1.85, h: 0.2,
    fontSize: 7.5, color: COLORS.warning, fontFace: FONTS.code, align: "center",
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "GitOps 讓基礎設施變成 Code — 每次 Prod 變更都有 git commit 記錄，可審計可回滾",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 38 — Feature Flags
// ─────────────────────────────────────────────────────────────────────────────
function slide38(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Feature Flags：從部署中解放功能發布",
    partLabel: "PART 5  ·  38 / 50",
    accentColor: COLORS.warning,
  });

  // ── Left — traditional approach ───────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4, label: "❌ 傳統做法：部署 = 上線", type: "bad",
  });

  const painItems = [
    { text: "😱 每次部署都影響所有用戶", color: COLORS.danger },
    { text: "⏱️ 發現問題只能全量回滾",   color: COLORS.danger },
    { text: "🚫 無法針對特定用戶測試",   color: COLORS.warning },
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
    x: 5.0, y: 0.55, w: 0, h: 4.2,
    line: { color: COLORS.border, width: 0.75 },
  });

  // ── Right — Feature Flags ─────────────────────────────────────────────────
  addCompareHeading(slide, pres, {
    x: 5.2, y: 0.62, w: 4.4, label: "✅ Feature Flags：部署 ≠ 上線", type: "good",
  });

  addCodeCard(slide, pres, {
    x: 5.25, y: 1.08, w: 4.35, h: 1.68,
    language: "Python",
    code: [
      "# Feature Flag 控制",
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
  slide.addText("🚀 部署 (Deploy)", {
    x: 0.45, y: 3.58, w: 4.4, h: 0.32,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });
  slide.addText("把 Code 放到 Prod Server — 但 Flag = OFF，用戶看不到", {
    x: 0.45, y: 3.9, w: 4.4, h: 0.28,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Center divider
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 3.55, w: 0, h: 1.1,
    line: { color: COLORS.border, width: 0.75 },
  });

  // Right half
  slide.addText("🎉 發布 (Release)", {
    x: 5.2, y: 3.58, w: 4.3, h: 0.32,
    fontSize: 12, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("把 Flag 切到 ON — 功能對用戶可見 (隨時可關)", {
    x: 5.2, y: 3.9, w: 4.3, h: 0.28,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "Feature Flag 讓你做到 Continuous Deployment — 每天部署數十次，功能上線時機由 PM 決定",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 39 — 藍綠部署 vs 金絲雀部署
// ─────────────────────────────────────────────────────────────────────────────
function slide39(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "部署策略：Blue/Green vs Canary Release",
    partLabel: "PART 5  ·  39 / 50",
    accentColor: COLORS.accent,
  });

  // ── Left — Blue/Green ─────────────────────────────────────────────────────
  slide.addText("🔵🟢 Blue/Green 部署", {
    x: 0.3, y: 0.65, w: 4.4, h: 0.35,
    fontSize: 13, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  // Step 1 — Blue active, Green standby
  slide.addText("Step 1：部署新版本到 Green", {
    x: 0.3, y: 1.02, w: 4.4, h: 0.2,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 1.22, w: 2.0, h: 0.55, rectRadius: 0.08,
    fill: { color: COLORS.cardSuccess }, line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("🔵 Blue (v1) — 100% 流量", {
    x: 0.3, y: 1.22, w: 2.0, h: 0.55,
    fontSize: 9, bold: true, color: COLORS.success, fontFace: FONTS.body,
    align: "center", valign: "middle",
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.45, y: 1.22, w: 2.0, h: 0.55, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.textMuted, width: 1.0 },
  });
  slide.addText("🟢 Green (v2) — 0% 流量", {
    x: 2.45, y: 1.22, w: 2.0, h: 0.55,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
    align: "center", valign: "middle",
  });

  // Step 2 — LB switch
  slide.addText("Step 2：LB 切換流量至 Green", {
    x: 0.3, y: 1.82, w: 4.4, h: 0.2,
    fontSize: 8.5, color: COLORS.accent, fontFace: FONTS.body, bold: true,
  });
  slide.addShape(pres.ShapeType.line, {
    x: 2.4, y: 1.96, w: 0.6, h: 0,
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
    { text: "✅ 零停機時間",        color: COLORS.success, bold: true  },
    { text: "✅ 回滾只需切 LB",     color: COLORS.success, bold: true  },
    { text: "⚠️ 需要兩套環境 (成本)", color: COLORS.warning, bold: false },
  ];
  bgBenefits.forEach((b, i) => {
    slide.addText(b.text, {
      x: 0.4, y: 2.72 + i * 0.3, w: 4.2, h: 0.26,
      fontSize: 10.5, bold: b.bold, color: b.color, fontFace: FONTS.body,
    });
  });

  // ── Divider ───────────────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.line, {
    x: 4.95, y: 0.55, w: 0, h: 4.85,
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
    x: 6.05, y: 1.72, w: 0, h: 0.35,
    line: { color: COLORS.client, width: 1.2 },
  });
  slide.addShape(pres.ShapeType.line, {
    x: 5.72, y: 2.07, w: 0.33, h: 0,
    line: { color: COLORS.client, width: 1.2, endArrowType: "arrow" },
  });

  // Arrow from LB to v2 branch
  slide.addShape(pres.ShapeType.line, {
    x: 6.05, y: 1.72, w: 0, h: 0.35,
    line: { color: COLORS.warning, width: 1.2 },
  });
  slide.addShape(pres.ShapeType.line, {
    x: 6.05, y: 2.07, w: 0.98, h: 0,
    line: { color: COLORS.warning, width: 1.2, endArrowType: "arrow" },
  });

  // v1 card
  addNodeCard(slide, pres, {
    x: 5.25, y: 2.1, w: 1.5, h: 0.75,
    emoji: "⚙️", name: "v1 × 9", meta: "90% 流量",
    borderColor: COLORS.client,
  });

  // v2 card
  addNodeCard(slide, pres, {
    x: 7.25, y: 2.1, w: 1.5, h: 0.75,
    emoji: "⚙️", name: "v2 × 1", meta: "10% 流量 (Canary)",
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
  slide.addText("✅ 自動增加 Canary 流量", {
    x: 5.25, y: 3.2, w: 2.1, h: 0.26,
    fontSize: 9.5, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("❌ 自動回滾 Canary", {
    x: 7.45, y: 3.9, w: 2.1, h: 0.26,
    fontSize: 9.5, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });

  // Canary benefits
  const canaryBenefits = [
    { text: "✅ 小範圍驗證新版本",  bold: true  },
    { text: "✅ 問題只影響少數用戶", bold: false },
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
    title: "DORA Metrics：衡量 DevOps 成熟度的四個指標",
    partLabel: "PART 5  ·  40 / 50",
    accentColor: COLORS.success,
  });

  const cards = [
    {
      x: 0.3, y: 0.65, border: COLORS.success,
      emoji: "🚀", name: "Deployment Frequency", sub: "部署頻率",
      nameColor: COLORS.success,
      tiers: [
        { text: "Elite: 多次/天",   color: COLORS.success },
        { text: "High: 每天~每週",  color: COLORS.accent  },
        { text: "Medium: 每週~每月", color: COLORS.warning },
      ],
    },
    {
      x: 5.2, y: 0.65, border: COLORS.accent,
      emoji: "⚡", name: "Lead Time for Changes", sub: "從 Commit 到 Prod 的時間",
      nameColor: COLORS.accent,
      tiers: [
        { text: "Elite: < 1 小時",  color: COLORS.success },
        { text: "High: < 1 天",     color: COLORS.accent  },
        { text: "Medium: 1週~1月",  color: COLORS.warning },
      ],
    },
    {
      x: 0.3, y: 2.95, border: COLORS.danger,
      emoji: "🔥", name: "Change Failure Rate", sub: "部署導致 Prod 問題的比率",
      nameColor: COLORS.danger,
      tiers: [
        { text: "Elite: < 5%",    color: COLORS.success },
        { text: "High: < 15%",    color: COLORS.accent  },
        { text: "Medium: 15-45%", color: COLORS.warning },
      ],
    },
    {
      x: 5.2, y: 2.95, border: COLORS.warning,
      emoji: "🔧", name: "MTTR", sub: "Mean Time To Restore — 恢復時間",
      nameColor: COLORS.warning,
      tiers: [
        { text: "Elite: < 1 小時", color: COLORS.success },
        { text: "High: < 1 天",    color: COLORS.accent  },
        { text: "Medium: 1天~1週", color: COLORS.warning },
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
    text: "DORA Research (2019): Elite 表現者比低表現者 — 部署快 208x，故障恢復快 2604x",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 41 — 持續測試金字塔
// ─────────────────────────────────────────────────────────────────────────────
function slide41(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "持續測試金字塔：測試的層次與速度",
    partLabel: "PART 5  ·  41 / 50",
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
  slide.addText("模擬真實用戶 | 分鐘級", {
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
  slide.addText("API + DB 整合 | 秒級", {
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
  slide.addText("快速 | 隔離 | 毫秒級    jest, pytest, go test", {
    x: 0.35, y: 3.67, w: 4.5, h: 0.2,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Speed indicator arrow (right side of pyramid)
  slide.addShape(pres.ShapeType.line, {
    x: 4.95, y: 4.1, w: 0, h: -2.4,
    line: { color: COLORS.textMuted, width: 1.2, endArrowType: "arrow" },
  });
  slide.addText("慢 🐌", {
    x: 4.85, y: 1.6, w: 0.6, h: 0.22,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });
  slide.addText("快 ⚡", {
    x: 4.85, y: 4.1, w: 0.6, h: 0.22,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // ── Right — code card ─────────────────────────────────────────────────────
  addCodeCard(slide, pres, {
    x: 5.4, y: 0.65, w: 4.3, h: 3.1,
    language: "pytest / jest commands",
    code: [
      "# CI Pipeline 測試順序",
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
    { x: 0.3,  title: "⚡ Fail Fast",  desc: "Unit test 失敗立刻停止 Pipeline" },
    { x: 3.55, title: "🔁 測試隔離",   desc: "每個 Test 獨立，不依賴順序" },
    { x: 6.8,  title: "📊 Coverage",   desc: "目標 80%+，關鍵路徑 100%" },
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
// Slide 42 — Part 5 小結
// ─────────────────────────────────────────────────────────────────────────────
function slide42(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Part 5 小結：DevOps 讓軟體交付飛起來",
    partLabel: "PART 5  ·  42 / 50",
    accentColor: COLORS.success,
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 0.65, w: 9.4, h: 1.38,
    icon: "🔄",
    title: "DevOps 是文化，CI/CD 是工具",
    items: [
      "打破 Dev/Ops 高牆，共同對交付品質負責",
      "CI/CD Pipeline 讓每次 Commit 都能安全部署",
    ],
    color: COLORS.accent,
    status: "核心理念",
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 2.12, w: 9.4, h: 1.38,
    icon: "📊",
    title: "用 DORA Metrics 衡量進步",
    items: [
      "4 個指標 — 部署頻率、Lead Time、失敗率、MTTR",
      "Elite 表現者不是天生的 — 是 DevOps 文化建立的",
    ],
    color: COLORS.success,
    status: "量化成果",
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 3.59, w: 9.4, h: 1.38,
    icon: "🚀",
    title: "Container + GitOps + CI/CD = 現代部署三劍客",
    items: [
      "Container：環境一致",
      "GitOps：基礎設施即代碼",
      "CI/CD：自動化交付 → Part 6: 可觀測性與 SRE",
    ],
    color: COLORS.container,
    status: "整合視角",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync("output", { recursive: true });
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  for (const fn of [slide35, slide36, slide37, slide38, slide39, slide40, slide41, slide42]) {
    await fn(pres);
  }
  await pres.writeFile({ fileName: "output/part5.pptx" });
  console.log("part5.pptx created");
}
main().catch(console.error);
