// src/part3.js
// Part 3: Container 核心概念 (Slides 21–26)

"use strict";

const fs      = require("fs");
const pptxgen = require("pptxgenjs");
const { COLORS, FONTS } = require("./design-system");
const {
  W, H, HEADER_H, BOTTOM_H, BOTTOM_Y,
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
// Slide 21 — Container 是什麼？
// ─────────────────────────────────────────────────────────────────────────────
function slide21(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Container 是什麼？解決什麼問題？",
    partLabel: "PART 3  ·  21 / 50",
    accentColor: COLORS.container,
    complexity: 5,
  });

  // ── Divider ──────────────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.55, w: 0, h: 4.85,
    line: { color: COLORS.border, width: 0.75 },
  });

  // ── Left column — ❌ Before ───────────────────────────────────────────────
  addCompareHeading(slide, pres, { x: 0.3, y: 0.62, w: 4.4, label: "❌  Container 之前", type: "bad" });

  // Card 1 — Dev
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.4, y: 1.1, w: 4.1, h: 0.78, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("🖥️ Dev (Mac)  —  Python 3.9 + brew Postgres 14", {
    x: 0.55, y: 1.14, w: 3.8, h: 0.28,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });
  slide.addText("手動 brew install 所有依賴", {
    x: 0.55, y: 1.42, w: 3.8, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Card 2 — Staging
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.4, y: 1.98, w: 4.1, h: 0.78, rectRadius: 0.08,
    fill: { color: COLORS.cardWarn },
    line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("🖥️ Staging (Ubuntu 20.04)  —  Python 3.8 + apt", {
    x: 0.55, y: 2.02, w: 3.8, h: 0.28,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });
  slide.addText("套件版本與 Dev 不一致，偶爾出現神秘錯誤", {
    x: 0.55, y: 2.30, w: 3.8, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Card 3 — Prod
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.4, y: 2.86, w: 4.1, h: 0.78, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("🖥️ Prod (CentOS 7)  —  Python 3.6 (!!) + yum", {
    x: 0.55, y: 2.90, w: 3.8, h: 0.28,
    fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });
  slide.addText("系統內建 Python，幾乎無法升級", {
    x: 0.55, y: 3.18, w: 3.8, h: 0.22,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Red callout
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.4, y: 3.75, w: 4.1, h: 0.45, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("🔥 「在我這裡可以跑啊！」— 版本地獄", {
    x: 0.55, y: 3.78, w: 3.8, h: 0.38,
    fontSize: 10.5, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  // ── Right column — ✅ With Container ─────────────────────────────────────
  addCompareHeading(slide, pres, { x: 5.2, y: 0.62, w: 4.4, label: "✅  使用 Container 之後", type: "good" });

  // Dockerfile card
  addCodeCard(slide, pres, {
    x: 5.3, y: 1.05, w: 2.0, h: 1.8,
    language: "Dockerfile",
    code: "FROM python:3.11-slim\nCOPY . /app\nRUN pip install -r requirements.txt\nCMD [\"uvicorn\", \"main:app\"]",
  });

  // build arrow
  addHArrow(slide, pres, { x: 7.4, y: 1.63, label: "build", color: COLORS.container, w: 0.5 });

  // Image node
  addNodeCard(slide, pres, {
    x: 8.0, y: 1.05, w: 1.55, h: 1.8,
    emoji: "📦", name: "Image", meta: "myapp:v1.2.3\n(不可變快照)",
    borderColor: COLORS.container,
  });

  // "docker run → 任何主機都能執行"
  slide.addText("docker run → 任何主機都能執行", {
    x: 5.3, y: 2.95, w: 4.3, h: 0.25,
    fontSize: 11, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });

  // 3 host badges
  const hosts = ["Ubuntu Server", "CentOS Server", "Cloud VM"];
  hosts.forEach((label, i) => {
    const bx = 5.3 + i * 1.45;
    slide.addShape(pres.ShapeType.roundRect, {
      x: bx, y: 3.2, w: 1.35, h: 0.28, rectRadius: 0.06,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.container, width: 1.0 },
    });
    slide.addText(label, {
      x: bx, y: 3.2, w: 1.35, h: 0.28,
      fontSize: 9, color: COLORS.container, fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
  });

  // Benefits row
  const benefits = [
    { x: 5.25, label: "🔒 環境一致", sub: "Dev=Staging=Prod", border: COLORS.success },
    { x: 6.75, label: "⚡ 秒級啟動", sub: "vs VM 分鐘",       border: COLORS.success },
    { x: 8.25, label: "📜 版本控管", sub: "tag = 可回滾",      border: COLORS.success },
  ];
  benefits.forEach((b) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: b.x, y: 3.72, w: 1.35, h: 0.75, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: b.border, width: 1.0 },
    });
    slide.addText(b.label, {
      x: b.x + 0.06, y: 3.76, w: 1.22, h: 0.3,
      fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(b.sub, {
      x: b.x + 0.06, y: 4.08, w: 1.22, h: 0.25,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 4.75,
    text: "Container 把「應用 + 所有依賴」打包成一個不可變的 Image — 在哪裡跑都一樣",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 22 — VM vs Container
// ─────────────────────────────────────────────────────────────────────────────
function slide22(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "VM vs Container：架構深度對比",
    partLabel: "PART 3  ·  22 / 50",
    accentColor: COLORS.accent,
  });

  // ── Left: VM stack ────────────────────────────────────────────────────────

  // Title bar
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 4.4, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 0.75 },
  });
  slide.addText("🖥️  Virtual Machine (VM)", {
    x: 0.45, y: 0.62, w: 4.1, h: 0.38,
    fontSize: 12, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  // App A (top-left VM)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.35, y: 1.1, w: 2.05, h: 1.05, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.backend, width: 1.0 },
  });
  slide.addText("⚙️", { x: 0.35, y: 1.14, w: 2.05, h: 0.35, fontSize: 16, align: "center", valign: "middle" });
  slide.addText("App A", {
    x: 0.35, y: 1.5, w: 2.05, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
  });
  slide.addText("Libs / Runtime", {
    x: 0.35, y: 1.78, w: 2.05, h: 0.22,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // App B (top-right VM)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.48, y: 1.1, w: 2.05, h: 1.05, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.backend, width: 1.0 },
  });
  slide.addText("⚙️", { x: 2.48, y: 1.14, w: 2.05, h: 0.35, fontSize: 16, align: "center", valign: "middle" });
  slide.addText("App B", {
    x: 2.48, y: 1.5, w: 2.05, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
  });
  slide.addText("Libs / Runtime", {
    x: 2.48, y: 1.78, w: 2.05, h: 0.22,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Guest OS A
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.35, y: 2.18, w: 2.05, h: 0.72, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.textMuted, width: 1.0 },
  });
  slide.addText("🐧 Guest OS A", {
    x: 0.35, y: 2.18, w: 2.05, h: 0.72,
    fontSize: 9.5, bold: true, color: COLORS.textMuted, fontFace: FONTS.body,
    align: "center", valign: "middle",
  });

  // Guest OS B
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.48, y: 2.18, w: 2.05, h: 0.72, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.textMuted, width: 1.0 },
  });
  slide.addText("🐧 Guest OS B", {
    x: 2.48, y: 2.18, w: 2.05, h: 0.72,
    fontSize: 9.5, bold: true, color: COLORS.textMuted, fontFace: FONTS.body,
    align: "center", valign: "middle",
  });

  // Hypervisor
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.35, y: 2.92, w: 4.3, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.cardWarn },
    line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("🔲 Hypervisor (VMware/KVM)", {
    x: 0.45, y: 2.92, w: 4.1, h: 0.38,
    fontSize: 10, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  // Host OS (left)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.35, y: 3.32, w: 4.3, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.client, width: 1.0 },
  });
  slide.addText("🐧 Host OS", {
    x: 0.45, y: 3.32, w: 4.1, h: 0.38,
    fontSize: 10, bold: true, color: COLORS.client, fontFace: FONTS.body, valign: "middle",
  });

  // Hardware (left)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.35, y: 3.72, w: 4.3, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addText("⚙️ Hardware", {
    x: 0.45, y: 3.72, w: 4.1, h: 0.38,
    fontSize: 10, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  // VM characteristics row
  const vmChars = [
    { label: "啟動: 分鐘", fill: COLORS.cardDanger, border: COLORS.danger, color: COLORS.danger },
    { label: "大小: GB",   fill: COLORS.cardDanger, border: COLORS.danger, color: COLORS.danger },
    { label: "隔離: 強 (OS)", fill: COLORS.cardSuccess, border: COLORS.success, color: COLORS.success },
  ];
  vmChars.forEach((c, i) => {
    const cx = 0.35 + i * 1.45;
    slide.addShape(pres.ShapeType.roundRect, {
      x: cx, y: 4.15, w: 1.35, h: 0.3, rectRadius: 0.06,
      fill: { color: c.fill }, line: { color: c.border, width: 1.0 },
    });
    slide.addText(c.label, {
      x: cx, y: 4.15, w: 1.35, h: 0.3,
      fontSize: 8.5, bold: true, color: c.color, fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
  });

  // ── Right: Container stack ────────────────────────────────────────────────

  // Title bar
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 0.62, w: 4.4, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.container, width: 0.75 },
  });
  slide.addText("🐳  Container", {
    x: 5.35, y: 0.62, w: 4.1, h: 0.38,
    fontSize: 12, bold: true, color: COLORS.container, fontFace: FONTS.body, valign: "middle",
  });

  // Container A (no Guest OS)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.25, y: 1.1, w: 2.05, h: 1.78, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.container, width: 1.0 },
  });
  slide.addText("🐳", { x: 5.25, y: 1.14, w: 2.05, h: 0.4, fontSize: 18, align: "center", valign: "middle" });
  slide.addText("App A", {
    x: 5.25, y: 1.56, w: 2.05, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
  });
  slide.addText("依賴包含在 Image 內", {
    x: 5.25, y: 1.84, w: 2.05, h: 0.38,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Container B
  slide.addShape(pres.ShapeType.roundRect, {
    x: 7.38, y: 1.1, w: 2.05, h: 1.78, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.container, width: 1.0 },
  });
  slide.addText("🐳", { x: 7.38, y: 1.14, w: 2.05, h: 0.4, fontSize: 18, align: "center", valign: "middle" });
  slide.addText("App B", {
    x: 7.38, y: 1.56, w: 2.05, h: 0.28,
    fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
  });
  slide.addText("依賴包含在 Image 內", {
    x: 7.38, y: 1.84, w: 2.05, h: 0.38,
    fontSize: 8, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  // Container Runtime
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.25, y: 2.92, w: 4.3, h: 0.38, rectRadius: 0.06,
    fill: { color: "061E18" },
    line: { color: COLORS.container, width: 1.0 },
  });
  slide.addText("🐳 Container Runtime (Docker)", {
    x: 5.35, y: 2.92, w: 4.1, h: 0.38,
    fontSize: 10, bold: true, color: COLORS.container, fontFace: FONTS.body, valign: "middle",
  });

  // Host OS (right)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.25, y: 3.32, w: 4.3, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.client, width: 1.0 },
  });
  slide.addText("🐧 Host OS", {
    x: 5.35, y: 3.32, w: 4.1, h: 0.38,
    fontSize: 10, bold: true, color: COLORS.client, fontFace: FONTS.body, valign: "middle",
  });

  // Hardware (right)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.25, y: 3.72, w: 4.3, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addText("⚙️ Hardware", {
    x: 5.35, y: 3.72, w: 4.1, h: 0.38,
    fontSize: 10, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  // Container characteristics row
  const ctChars = [
    { label: "啟動: 秒",        fill: COLORS.cardSuccess, border: COLORS.success, color: COLORS.success },
    { label: "大小: MB",         fill: COLORS.cardSuccess, border: COLORS.success, color: COLORS.success },
    { label: "隔離: 輕量 (Process)", fill: "0A1929", border: COLORS.accent, color: COLORS.accent },
  ];
  ctChars.forEach((c, i) => {
    const cx = 5.25 + i * 1.45;
    slide.addShape(pres.ShapeType.roundRect, {
      x: cx, y: 4.15, w: 1.35, h: 0.3, rectRadius: 0.06,
      fill: { color: c.fill }, line: { color: c.border, width: 1.0 },
    });
    slide.addText(c.label, {
      x: cx, y: 4.15, w: 1.35, h: 0.3,
      fontSize: 8.5, bold: true, color: c.color, fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
  });

  // ── Comparison metrics ────────────────────────────────────────────────────
  const metrics = [
    { x: 0.3,  w: 3.0, value: "分鐘 → 秒", sub: "啟動時間 VM→Container", border: COLORS.success },
    { x: 3.6,  w: 3.0, value: "GB → MB",   sub: "Image 大小",            border: COLORS.success },
    { x: 6.9,  w: 2.8, value: "強→輕量",   sub: "隔離程度",              border: COLORS.accent  },
  ];
  metrics.forEach((m) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: m.x, y: 4.62, w: m.w, h: 0.68, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: m.border, width: 1.0 },
    });
    slide.addText(m.value, {
      x: m.x + 0.08, y: 4.64, w: m.w - 0.16, h: 0.38,
      fontSize: 16, bold: true, color: COLORS.success, fontFace: FONTS.title,
      align: "center", valign: "middle",
    });
    slide.addText(m.sub, {
      x: m.x + 0.08, y: 5.04, w: m.w - 0.16, h: 0.2,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 23 — Docker 核心概念
// ─────────────────────────────────────────────────────────────────────────────
function slide23(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Docker 核心概念：Image → Container → Registry",
    partLabel: "PART 3  ·  23 / 50",
    accentColor: COLORS.container,
  });

  // ── Top flow ──────────────────────────────────────────────────────────────
  addCodeCard(slide, pres, {
    x: 0.3, y: 0.7, w: 2.55, h: 1.9,
    language: "Dockerfile",
    code: "FROM python:3.11-slim\n\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\n\nCOPY . .\nEXPOSE 8080\nCMD [\"uvicorn\", \"main:app\"]",
  });

  addHArrow(slide, pres, { x: 2.95, y: 1.38, label: "docker build", color: COLORS.container, w: 0.9 });

  addNodeCard(slide, pres, {
    x: 3.95, y: 0.78, w: 1.55, h: 1.75,
    emoji: "📦", name: "Image", meta: "不可變快照\nmyapp:v1.2.3",
    borderColor: COLORS.container,
  });

  addHArrow(slide, pres, { x: 5.6, y: 1.38, label: "docker run", color: COLORS.success, w: 0.85 });

  addNodeCard(slide, pres, {
    x: 6.55, y: 0.78, w: 1.55, h: 1.75,
    emoji: "🚀", name: "Container", meta: "執行中的實例\n(可多個)",
    borderColor: COLORS.success,
  });

  addHArrow(slide, pres, { x: 8.2, y: 1.38, label: "push/pull", color: COLORS.accent, w: 0.65 });

  addNodeCard(slide, pres, {
    x: 8.95, y: 0.78, w: 0.9, h: 1.75,
    emoji: "🏭", name: "Registry", meta: "Hub/ECR",
    borderColor: COLORS.accent,
  });

  // ── Commands section ──────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.82, w: 9.4, h: 0.35, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 0.75 },
  });
  slide.addText("常用 Docker 指令", {
    x: 0.5, y: 2.82, w: 9.0, h: 0.35,
    fontSize: 11, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  const commands = [
    { cmd: "docker build -t myapp:v1.2.3 .",             desc: "從 Dockerfile 建立 Image" },
    { cmd: "docker run -p 8080:8080 myapp:v1.2.3",       desc: "啟動 Container" },
    { cmd: "docker ps",                                   desc: "查看執行中的 Container" },
    { cmd: "docker logs <container-id>",                  desc: "查看 Container log" },
    { cmd: "docker exec -it <container-id> bash",         desc: "進入 Container 除錯" },
  ];

  commands.forEach((row, i) => {
    const ry = 3.22 + i * 0.4;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: ry, w: 9.4, h: 0.35, rectRadius: 0.05,
      fill: { color: COLORS.bg2 },
      line: { color: COLORS.border, width: 0.5 },
    });
    slide.addText(row.cmd, {
      x: 0.48, y: ry + 0.02, w: 6.0, h: 0.31,
      fontSize: 10, color: COLORS.accent, fontFace: FONTS.code, valign: "middle",
    });
    slide.addText(row.desc, {
      x: 6.5, y: ry + 0.02, w: 3.0, h: 0.31,
      fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body,
      align: "right", valign: "middle",
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 24 — Docker Compose
// ─────────────────────────────────────────────────────────────────────────────
function slide24(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Docker Compose：多容器應用一鍵啟動",
    partLabel: "PART 3  ·  24 / 50",
    accentColor: COLORS.container,
  });

  // ── Left: docker-compose.yml ──────────────────────────────────────────────
  addCodeCard(slide, pres, {
    x: 0.3, y: 0.65, w: 4.4, h: 4.65,
    language: "docker-compose.yml",
    code: "services:\n  nginx:\n    image: nginx:alpine\n    ports: [\"80:80\"]\n    depends_on: [backend]\n\n  backend:\n    build: ./backend\n    environment:\n      DB_URL: postgresql://db/app\n    depends_on: [db, redis]\n\n  db:\n    image: postgres:16\n    volumes:\n      - pgdata:/var/lib/postgresql\n\n  redis:\n    image: redis:7-alpine\n\nvolumes:\n  pgdata:",
  });

  // ── Big arrow ─────────────────────────────────────────────────────────────
  slide.addText("→", {
    x: 4.82, y: 2.72, w: 0.36, h: 0.56,
    fontSize: 28, bold: true, color: COLORS.container, fontFace: FONTS.body,
    align: "center", valign: "middle",
  });

  // ── Right: network zone + service nodes ──────────────────────────────────
  addZoneBorder(slide, pres, {
    x: 5.2, y: 0.72, w: 4.5, h: 4.5,
    color: COLORS.container, label: "docker network",
  });

  addNodeCard(slide, pres, {
    x: 5.45, y: 1.0, w: 1.65, h: 1.05,
    emoji: "🌐", name: "nginx", meta: ":80",
    borderColor: COLORS.frontend,
  });

  addNodeCard(slide, pres, {
    x: 7.7, y: 1.0, w: 1.65, h: 1.05,
    emoji: "⚙️", name: "backend", meta: ":8080",
    borderColor: COLORS.backend,
  });

  addNodeCard(slide, pres, {
    x: 5.45, y: 2.55, w: 1.65, h: 1.05,
    emoji: "🗄️", name: "db", meta: ":5432",
    borderColor: COLORS.database,
  });

  addNodeCard(slide, pres, {
    x: 7.7, y: 2.55, w: 1.65, h: 1.05,
    emoji: "⚡", name: "redis", meta: ":6379",
    borderColor: COLORS.infra,
  });

  // Arrows between services
  // nginx → backend
  addHArrow(slide, pres, { x: 7.15, y: 1.3, label: "proxy", color: COLORS.frontend, w: 0.5 });

  // backend → db (vertical)
  addVArrow(slide, pres, { x: 6.27, y: 2.08, h: 0.44, color: COLORS.backend });

  // backend → redis (horizontal)
  addHArrow(slide, pres, { x: 7.55, y: 3.0, label: "cache", color: COLORS.infra, w: 0.12 });

  addTipBar(slide, pres, {
    y: 5.05,
    text: "一個指令搞定：docker compose up -d — 開發環境從此告別手動啟動多個服務",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 25 — Container Registry
// ─────────────────────────────────────────────────────────────────────────────
function slide25(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Container Registry：Image 的倉庫與版本管理",
    partLabel: "PART 3  ·  25 / 50",
    accentColor: COLORS.accent,
  });

  // ── Pipeline flow ─────────────────────────────────────────────────────────
  addNodeCard(slide, pres, {
    x: 0.2, y: 0.72, w: 1.35, h: 1.35,
    emoji: "💻", name: "Developer", meta: "程式碼變更",
    borderColor: COLORS.client,
  });

  addHArrow(slide, pres, { x: 1.65, y: 1.15, label: "git commit\ndocker build", color: COLORS.accent, w: 0.8 });

  addNodeCard(slide, pres, {
    x: 2.55, y: 0.72, w: 1.35, h: 1.35,
    emoji: "📦", name: "Image", meta: "myapp:v1.2.4",
    borderColor: COLORS.container,
  });

  addHArrow(slide, pres, { x: 4.0, y: 1.15, label: "docker push", color: COLORS.accent, w: 0.8 });

  addNodeCard(slide, pres, {
    x: 4.9, y: 0.72, w: 1.5, h: 1.35,
    emoji: "🏭", name: "Registry", meta: "Docker Hub\nECR / GCR / Harbor",
    borderColor: COLORS.accent,
  });

  addHArrow(slide, pres, { x: 6.5, y: 1.15, label: "docker pull", color: COLORS.success, w: 0.8 });

  addNodeCard(slide, pres, {
    x: 7.4, y: 0.72, w: 2.3, h: 1.35,
    emoji: "🚀", name: "Production", meta: "app-server-01\napp-server-02\napp-server-03",
    borderColor: COLORS.success,
  });

  // ── Tag strategy section ──────────────────────────────────────────────────
  slide.addText("Image Tag 策略", {
    x: 0.3, y: 2.55, w: 5.0, h: 0.32,
    fontSize: 13, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  // Card 1 — :latest (bad)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.85, w: 4.4, h: 0.92, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("❌ :latest — 避免在 Production 使用", {
    x: 0.45, y: 2.89, w: 4.1, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });
  slide.addText("無法回溯，不知道是哪個版本", {
    x: 0.45, y: 3.19, w: 4.1, h: 0.28,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Card 2 — :v1.2.3 (good)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 2.85, w: 4.4, h: 0.92, rectRadius: 0.08,
    fill: { color: COLORS.cardSuccess },
    line: { color: COLORS.success, width: 1.0 },
  });
  slide.addText("✅ :v1.2.3 (Semantic Version) — 推薦", {
    x: 5.35, y: 2.89, w: 4.1, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("明確版本，隨時可回滾", {
    x: 5.35, y: 3.19, w: 4.1, h: 0.28,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Card 3 — :git-abc1234
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.88, w: 4.4, h: 0.92, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.accent, width: 1.0 },
  });
  slide.addText("✅ :git-abc1234 (Commit Hash)", {
    x: 0.45, y: 3.92, w: 4.1, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });
  slide.addText("每個 commit 對應一個不可變 Image，CI/CD 常用", {
    x: 0.45, y: 4.22, w: 4.1, h: 0.28,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Card 4 — :20240315-abc1234
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 3.88, w: 4.4, h: 0.92, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.accent, width: 1.0 },
  });
  slide.addText("✅ :20240315-abc1234 (Date+Hash)", {
    x: 5.35, y: 3.92, w: 4.1, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });
  slide.addText("時間戳+Hash，可讀性與唯一性兼具", {
    x: 5.35, y: 4.22, w: 4.1, h: 0.28,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  addTipBar(slide, pres, {
    y: 4.92,
    text: "永遠不要在 Prod 用 :latest — 你永遠不知道 latest 到底是哪個版本",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 26 — Container 化效益
// ─────────────────────────────────────────────────────────────────────────────
function slide26(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Container 化：從維運噩夢到一致部署",
    partLabel: "PART 3  ·  26 / 50",
    accentColor: COLORS.container,
    complexity: 5,
  });

  // ── Divider ──────────────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.line, {
    x: 5.0, y: 0.55, w: 0, h: 3.12,
    line: { color: COLORS.border, width: 0.75 },
  });

  // ── Left — ❌ Before ──────────────────────────────────────────────────────
  addCompareHeading(slide, pres, { x: 0.3, y: 0.62, w: 4.4, label: "❌  Container 化之前", type: "bad" });

  // Row 1: OS badges
  const osBadges = ["Ubuntu 18", "Ubuntu 20", "CentOS 7", "Debian 10", "RHEL 8"];
  osBadges.forEach((label, i) => {
    const bx = 0.3 + i * 0.87;
    slide.addShape(pres.ShapeType.roundRect, {
      x: bx, y: 1.05, w: 0.83, h: 0.28, rectRadius: 0.05,
      fill: { color: COLORS.cardDanger },
      line: { color: COLORS.danger, width: 0.75 },
    });
    slide.addText(label, {
      x: bx, y: 1.05, w: 0.83, h: 0.28,
      fontSize: 7.5, color: COLORS.danger, fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
  });

  // Row 2: runtime badges
  const rtBadges = ["Python 3.6", "Python 3.7", "Python 3.8", "Python 3.9", "Node 14"];
  rtBadges.forEach((label, i) => {
    const bx = 0.3 + i * 0.87;
    slide.addShape(pres.ShapeType.roundRect, {
      x: bx, y: 1.42, w: 0.83, h: 0.28, rectRadius: 0.05,
      fill: { color: COLORS.cardWarn },
      line: { color: COLORS.warning, width: 0.75 },
    });
    slide.addText(label, {
      x: bx, y: 1.42, w: 0.83, h: 0.28,
      fontSize: 7.5, color: COLORS.warning, fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
  });

  // Row 3: server badges
  const svrBadges = ["Nginx 1.14", "Nginx 1.16", "Nginx 1.18", "Nginx 1.20", "Apache 2.4"];
  svrBadges.forEach((label, i) => {
    const bx = 0.3 + i * 0.87;
    slide.addShape(pres.ShapeType.roundRect, {
      x: bx, y: 1.79, w: 0.83, h: 0.28, rectRadius: 0.05,
      fill: { color: COLORS.cardDanger },
      line: { color: COLORS.danger, width: 0.75 },
    });
    slide.addText(label, {
      x: bx, y: 1.79, w: 0.83, h: 0.28,
      fontSize: 7.5, color: COLORS.danger, fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
  });

  // Additional chaos rows
  const chaosRows = [
    { label: "手動 SSH 部署腳本", y: 2.15 },
    { label: "每台主機設定各不同", y: 2.45 },
    { label: "「只有我知道怎麼重啟」", y: 2.75 },
  ];
  chaosRows.forEach((r) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: r.y, w: 4.4, h: 0.26, rectRadius: 0.05,
      fill: { color: COLORS.bg3 },
      line: { color: COLORS.border, width: 0.5 },
    });
    slide.addText("• " + r.label, {
      x: 0.45, y: r.y, w: 4.1, h: 0.26,
      fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
    });
  });

  // Counter
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.25, w: 4.4, h: 0.4, rectRadius: 0.06,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("😱 15+ 台 × N 個不同設定 = 維運地獄", {
    x: 0.45, y: 3.25, w: 4.1, h: 0.4,
    fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  // ── Right — ✅ After ──────────────────────────────────────────────────────
  addCompareHeading(slide, pres, { x: 5.2, y: 0.62, w: 4.4, label: "✅  Container 化之後", type: "good" });

  addZoneBorder(slide, pres, {
    x: 5.25, y: 0.95, w: 4.35, h: 2.4,
    color: COLORS.container, label: "IDENTICAL ON ALL HOSTS",
  });

  addNodeCard(slide, pres, {
    x: 5.45, y: 1.12, w: 1.9, h: 0.92,
    emoji: "📦", name: "nginx:1.25", meta: "Frontend",
    borderColor: COLORS.frontend,
  });

  addNodeCard(slide, pres, {
    x: 7.5, y: 1.12, w: 1.9, h: 0.92,
    emoji: "📦", name: "backend:v2.1", meta: "Backend",
    borderColor: COLORS.backend,
  });

  addNodeCard(slide, pres, {
    x: 5.45, y: 2.18, w: 1.9, h: 0.92,
    emoji: "📦", name: "postgres:16", meta: "Database",
    borderColor: COLORS.database,
  });

  addNodeCard(slide, pres, {
    x: 7.5, y: 2.18, w: 1.9, h: 0.92,
    emoji: "📦", name: "redis:7", meta: "Cache",
    borderColor: COLORS.infra,
  });

  slide.addText("✅ 4 個 Container Image，全部環境一致 — Dev = Staging = Prod", {
    x: 5.2, y: 3.25, w: 4.55, h: 0.4,
    fontSize: 10, bold: true, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
  });

  // ── Transition banner ─────────────────────────────────────────────────────
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 3.72, w: 9.4, h: 0.62, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.container, width: 1.5 },
  });
  slide.addText("複雜度 9/10  →  5/10  ↓  維運噩夢  →  標準化部署", {
    x: 0.3, y: 3.72, w: 9.4, h: 0.62,
    fontSize: 14, bold: true, color: COLORS.container, fontFace: FONTS.body,
    align: "center", valign: "middle",
  });

  // ── Benefit chips ─────────────────────────────────────────────────────────
  const chips = [
    { x: 0.3,  border: COLORS.success,   title: "🔒 環境一致",  sub: "Dev = Staging = Prod" },
    { x: 3.55, border: COLORS.accent,    title: "📜 版本鎖定",  sub: "Image tag 隨時可回滾" },
    { x: 6.8,  border: COLORS.container, title: "⚡ 快速部署",  sub: "docker pull + run，秒級" },
  ];
  chips.forEach((c) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: c.x, y: 4.5, w: 2.95, h: 0.75, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: c.border, width: 1.0 },
    });
    slide.addText(c.title, {
      x: c.x + 0.1, y: 4.54, w: 2.75, h: 0.3,
      fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body,
    });
    slide.addText(c.sub, {
      x: c.x + 0.1, y: 4.85, w: 2.75, h: 0.28,
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
  await slide21(pres);
  await slide22(pres);
  await slide23(pres);
  await slide24(pres);
  await slide25(pres);
  await slide26(pres);
  await pres.writeFile({ fileName: "output/part3.pptx" });
  console.log("✅ output/part3.pptx created");
}

main().catch(console.error);
