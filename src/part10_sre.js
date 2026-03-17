// src/part10_sre.js
// Part 10: SRE（投影片 136–150）

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
const label  = (n) => `PART 10 SRE  · ${n} / 150`;

// ─────────────────────────────────────────────────────────────────────────────
// Slide 136 — 三大支柱整合：Grafana Stack
// ─────────────────────────────────────────────────────────────────────────────
function slide136(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "三大支柱整合：Grafana Stack",
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
  slide.addText("統一可觀測性介面", {
    x: gx, y: gy + 0.55, w: gw, h: 0.3,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  const sources = [
    { emoji: "📈", name: "Prometheus",    meta: "指標", color: COLORS.warning, x: 0.3, y: 1.5, query: "PromQL"  },
    { emoji: "📋", name: "Loki",          meta: "日誌", color: COLORS.backend, x: 0.3, y: 2.8, query: "LogQL"   },
    { emoji: "🔍", name: "Tempo",         meta: "追蹤", color: COLORS.infra,   x: 7.4, y: 1.5, query: "TraceQL" },
    { emoji: "🔔", name: "AlertManager",  meta: "告警", color: COLORS.danger,  x: 7.4, y: 2.8, query: "API"     },
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
    slide.addText("（" + src.meta + "）", {
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
  slide.addText("🔗  整合流程：點擊指標異常  →  找到 Trace  →  查看關聯日誌", {
    x: 0.5, y: 4.0, w: 9.0, h: 0.52,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "Grafana Stack = Prometheus（指標）+ Loki（日誌）+ Tempo（追蹤）+ Grafana（介面）— 開源、廠商中立、完整整合",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 137 — 告警 → 事故 → 事後檢討 完整流程
// ─────────────────────────────────────────────────────────────────────────────
function slide137(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "告警 → 事故 → 事後檢討 完整流程",
    partLabel: label(137),
    accentColor: ACCENT,
    complexity: 6,
  });

  const steps = [
    { no: "1", name: "告警觸發", sub: "Prometheus 規則觸發",      color: COLORS.danger  },
    { no: "2", name: "路由通知", sub: "AlertManager → PagerDuty", color: COLORS.warning },
    { no: "3", name: "認領處理", sub: "值班工程師接受通知",       color: COLORS.accent  },
    { no: "4", name: "調查問題", sub: "使用 Grafana Dashboard",   color: COLORS.accent  },
    { no: "5", name: "緩解問題", sub: "Hotfix 或回滾",            color: COLORS.success },
    { no: "6", name: "事後檢討", sub: "48小時內無責備審查",       color: ACCENT         },
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
    { value: "< 2分鐘",  label: "MTTD", sub: "平均偵測時間", color: COLORS.danger  },
    { value: "< 5分鐘",  label: "MTTA", sub: "平均認領時間", color: COLORS.warning },
    { value: "< 30分鐘", label: "MTTR", sub: "平均恢復時間", color: COLORS.success },
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
  slide.addText("⏱️  告警觸發  →  通知到達  →  認領開始  →  問題定位  →  緩解生效  →  事後檢討完成", {
    x: 0.5, y: 3.05, w: 9.0, h: 0.42,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "每個告警應該有明確的負責人、操作手冊，若影響生產環境必須在 48 小時內完成事後檢討",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 138 — SLI、SLO、SLA 定義與差異
// ─────────────────────────────────────────────────────────────────────────────
function slide138(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "SLI、SLO、SLA 定義與差異",
    partLabel: label(138),
    accentColor: ACCENT,
    complexity: 6,
  });

  addThreeCols(slide, pres, [
    {
      title: "SLI（服務層級指標）",
      icon: "📊",
      color: COLORS.accent,
      items: [
        { text: "實際測量值" },
        { text: "範例：請求成功率" },
        { text: "目前值：99.95%" },
        { text: "P99 延遲：180ms" },
        { text: "由真實流量計算" },
      ],
    },
    {
      title: "SLO（服務層級目標）",
      icon: "🎯",
      color: COLORS.warning,
      items: [
        { text: "內部目標" },
        { text: "目標：≥ 99.9% 成功率" },
        { text: "由工程團隊設定" },
        { text: "必須比 SLA 更嚴格" },
        { text: "驅動錯誤預算政策" },
      ],
    },
    {
      title: "SLA（服務層級協議）",
      icon: "📝",
      color: COLORS.danger,
      items: [
        { text: "對客戶的合約承諾" },
        { text: "承諾：≥ 99.5% 成功率" },
        { text: "與客戶共同協議" },
        { text: "違反即財務賠償" },
        { text: "必須比 SLO 更寬鬆" },
      ],
    },
  ], { y: HEADER_H + 0.1, h: 3.88 });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.46, w: 9.4, h: 0.3, rectRadius: 0.07,
    fill: { color: COLORS.cardWarn }, line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("⚠️  核心原則：SLO 必須比 SLA 更嚴格 | SLI=99.95% → SLO=99.9% → SLA=99.5%", {
    x: 0.5, y: 4.46, w: 9.0, h: 0.3,
    fontSize: 9.5, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 5.06,
    text: "SLO 是你的內部目標，SLA 是你對客戶的承諾，永遠讓 SLO > SLA",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 139 — 錯誤預算：可靠性工程的指南針
// ─────────────────────────────────────────────────────────────────────────────
function slide139(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "錯誤預算：可靠性工程的指南針",
    partLabel: label(139),
    accentColor: ACCENT,
    complexity: 7,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.0 },
  });
  slide.addText("錯誤預算 = 1 − SLO  →  99.9% SLO = 0.1% 預算 ≈ 每月約 43.8 分鐘停機時間", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 11, bold: true, color: ACCENT, fontFace: FONTS.body, valign: "middle",
  });

  slide.addText("本月預算消耗（範例：已使用 68%）", {
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
      title: "預算充足（< 50% 已使用）",
      desc:  "自由部署 · 大膽實驗 · 積極推出功能",
      color: COLORS.success, bg: COLORS.cardSuccess,
    },
    {
      icon: "⚠️",
      title: "預算告急（50–90% 已使用）",
      desc:  "放慢發版速度 · 調查可靠性問題",
      color: COLORS.warning, bg: COLORS.cardWarn,
    },
    {
      icon: "🔥",
      title: "預算耗盡（≥ 100% 已使用）",
      desc:  "凍結部署 · 進入事故模式 · SRE+開發全力提升可靠性",
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
    text: "錯誤預算是產品與 SRE 之間的共同契約——預算耗盡時，可靠性優先於速度",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 140 — SRE 工程師的職責範疇
// ─────────────────────────────────────────────────────────────────────────────
function slide140(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "SRE 工程師的職責範疇",
    partLabel: label(140),
    accentColor: ACCENT,
    complexity: 6,
  });

  const cards = [
    { emoji: "📊", title: "可用性與可靠性保障",    sub: "定義 SLO、追蹤 SLI、維持服務正常" },
    { emoji: "📐", title: "容量規劃",               sub: "預測成長、在超載前提前擴容" },
    { emoji: "⚡", title: "效能與效率優化",         sub: "優化延遲、吞吐量、資源使用率" },
    { emoji: "🚀", title: "變更管理（安全部署）",   sub: "安全部署、Feature Flag、Canary 發布" },
    { emoji: "🔔", title: "監控與告警",             sub: "建立 Dashboard、調整告警、減少噪音" },
    { emoji: "🚨", title: "緊急事故應變",           sub: "值班輪替、事故指揮、操作手冊" },
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
  slide.addText("⏱️  50% 原則：SRE 花在瑣事（Toil）上的時間應少於 50%，其餘時間用於工程改進工作", {
    x: 0.5, y: 3.88, w: 9.0, h: 0.44,
    fontSize: 10.5, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.78,
    text: "SRE 不只是維運——而是將軟體工程應用於可靠性問題",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 141 — Toil（瑣事）：什麼是 Toil，為何重要
// ─────────────────────────────────────────────────────────────────────────────
function slide141(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Toil（瑣事）：什麼是 Toil，為何重要",
    partLabel: label(141),
    accentColor: ACCENT,
    complexity: 5,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger }, line: { color: COLORS.danger, width: 1.0 },
  });
  slide.addText("🔥  Toil：手動 · 重複性 · 可自動化 · 與規模成正比增長 · 缺乏持久價值的工作", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 10.5, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  addCompareHeading(slide, pres, { x: 0.3,  y: 1.14, w: 4.55, label: "❌  Toil 範例",         type: "bad"  });
  addCompareHeading(slide, pres, { x: 5.15, y: 1.14, w: 4.55, label: "✅  非 Toil（工程價值）", type: "good" });

  const toils = [
    "手動 SSH 到每台伺服器部署",
    "票單驅動的容量調整",
    "每次都要從頭撰寫操作手冊",
    "手動重啟崩潰的 Pod",
    "在環境之間複製貼上設定",
  ];
  const nonToils = [
    "建立 CI/CD 流水線",
    "編寫自動擴縮容器",
    "一次寫好自我修復的操作手冊",
    "用健康檢查實作自動重啟",
    "使用 Terraform 基礎設施即代碼",
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
  slide.addText("🎯  目標：自動化消除 Toil，將 Toil 時間維持在 50% 以下", {
    x: 0.5, y: 4.95, w: 9.0, h: 0.28,
    fontSize: 9.5, bold: true, color: ACCENT, fontFace: FONTS.body, valign: "middle",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 142 — 值班設計原則
// ─────────────────────────────────────────────────────────────────────────────
function slide142(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "值班設計原則",
    partLabel: label(142),
    accentColor: ACCENT,
    complexity: 6,
  });

  const principles = [
    { emoji: "✅", title: "告警應可操作",           sub: "每個告警都需要明確的應對步驟，否則就是噪音" },
    { emoji: "��", title: "針對症狀告警，而非原因", sub: "告警「用戶體驗到延遲」，而非「CPU 使用率高」" },
    { emoji: "📖", title: "每個告警都需要操作手冊", sub: "任何值班人員都能按照步驟處理" },
    { emoji: "🔕", title: "減少告警疲勞",           sub: "誤報太多會讓工程師忽視所有告警，摧毀團隊文化" },
    { emoji: "🔄", title: "值班輪替必須可持續",     sub: "輪替週期不能讓人筋疲力竭，需要足夠的備援" },
    { emoji: "👥", title: "主值班 + 備援值班",      sub: "雙人模式確保重大事故有足夠支援" },
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
    text: "告警設計的黃金標準：每個告警在深夜觸發時，值班人員都知道確切要做什麼",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 143 — Runbook 操作手冊撰寫指南
// ─────────────────────────────────────────────────────────────────────────────
function slide143(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Runbook 操作手冊撰寫指南",
    partLabel: label(143),
    accentColor: ACCENT,
    complexity: 5,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: ACCENT, width: 1.0 },
  });
  slide.addText("Runbook = 處理特定告警的逐步操作指南 — 讓任何值班人員都能獨立處理，不只是專家", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 10.5, bold: true, color: ACCENT, fontFace: FONTS.body, valign: "middle",
  });

  const runbookCode = [
    "# Runbook: 高錯誤率告警 (high-error-rate)",
    "",
    "## 告警說明",
    "- 服務：payment-service",
    "- 條件：error_rate > 1% 持續 5 分鐘",
    "",
    "## 影響範圍",
    "- 用戶：無法完成結帳流程",
    "",
    "## 調查步驟",
    "1. 查看 Grafana Dashboard: payment-service overview",
    "2. 確認是否特定端點出錯: /api/checkout vs /api/refund",
    "3. 查看 Loki 日誌: {service=\"payment\"} |= \"ERROR\"",
    "4. 追蹤相關 Trace: 點擊 Grafana 中的 Exemplar",
    "",
    "## 緩解步驟",
    "1. 若最近有部署 → 立即回滾",
    "2. 若 DB 連線異常 → 重啟 connection pool",
    "3. 若 Stripe API 異常 → 啟用降級模式",
    "",
    "## 升級流程",
    "- 15 分鐘內未緩解 → 通知 Tech Lead",
    "- 30 分鐘內未緩解 → 啟動 P1 事故流程",
  ].join("\n");

  addCodeCard(slide, pres, {
    x: 0.3, y: 1.22, w: 9.4, h: 3.55, code: runbookCode, language: "Markdown",
  });

  addTipBar(slide, pres, {
    y: 5.05,
    text: "好的 Runbook 讓最資淺的值班人員也能處理——寫完後請找同事測試是否真的能照步驟操作",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 144 — 無責備事後檢討（Blameless Postmortem）
// ─────────────────────────────────────────────────────────────────────────────
function slide144(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "無責備事後檢討（Blameless Postmortem）",
    partLabel: label(144),
    accentColor: ACCENT,
    complexity: 6,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.cardSuccess }, line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("🎯  核心原則：檢討系統，不責怪個人 — 個人在有缺陷的系統中做出了合理的決定", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 11, bold: true, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
  });

  const sections = [
    { title: "時間軸重建",   desc: "按時間順序記錄事件發展，確立清晰的因果關係",         color: COLORS.accent  },
    { title: "根本原因分析", desc: "使用五個為什麼（5 Whys）逐層追問，找到系統性根因",    color: COLORS.warning },
    { title: "影響範圍評估", desc: "量化影響：受影響用戶數、持續時間、營收損失",          color: COLORS.danger  },
    { title: "行動項目",     desc: "具體、可追蹤的改善措施，指定負責人和截止日期",        color: COLORS.success },
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
  slide.addText("5 Whys 範例", {
    x: 0.5, y: 2.93, w: 2.5, h: 0.26,
    fontSize: 9.5, bold: true, color: COLORS.textMuted, fontFace: FONTS.body,
  });
  const whys = [
    "① 為何服務中斷？→ DB 連線耗盡",
    "② 為何耗盡？→ 連線未正確釋放",
    "③ 為何未釋放？→ 缺少 finally 區塊",
    "④ 為何缺少？→ 沒有 code review checklist",
    "🎯  改善：建立 code review checklist",
  ];
  whys.forEach((w, i) => {
    slide.addText(w, {
      x: 0.5, y: 3.22 + i * 0.21, w: 9.0, h: 0.21,
      fontSize: 9, color: i === 4 ? ACCENT : COLORS.text, fontFace: FONTS.body, bold: i === 4,
    });
  });

  addTipBar(slide, pres, {
    y: 4.65,
    text: "Google SRE 文化：事後檢討是學習機會，不是懲罰工具——公開分享讓整個組織受益",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 145 — 可觀測性成熟度模型
// ─────────────────────────────────────────────────────────────────────────────
function slide145(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "可觀測性成熟度模型",
    partLabel: label(145),
    accentColor: ACCENT,
    complexity: 6,
  });

  const levels = [
    { level: "第 0 級（危險）", name: "沒有監控",     desc: "從客戶投訴才知道故障，完全被動應對",                color: COLORS.danger    },
    { level: "第 1 級（警告）", name: "基本指標",     desc: "CPU、記憶體監控，手動查看告警，無自動通知",          color: COLORS.warning   },
    { level: "第 2 級",         name: "結構化日誌",   desc: "JSON 結構化日誌 + 基本 Dashboard，可搜尋",          color: COLORS.textMuted },
    { level: "第 3 級",         name: "分散式追蹤",   desc: "OTel Tracing + Correlation ID，可跨服務追蹤",       color: COLORS.accent    },
    { level: "第 4 級",         name: "SLO 管理",     desc: "基於 SLO 的告警 + 錯誤預算管理，面向用戶體驗",      color: COLORS.success   },
    { level: "第 5 級（成功）", name: "完整可觀測性", desc: "完整 OTel、自動修復、AIOps 異常偵測",               color: ACCENT           },
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
    text: "大多數團隊在第 2-3 級——目標是第 4 級（SLO 驅動）；第 5 級是長期目標",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 146 — 可觀測性成本控制策略
// ─────────────────────────────────────────────────────────────────────────────
function slide146(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "可觀測性成本控制策略",
    partLabel: label(146),
    accentColor: ACCENT,
    complexity: 6,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.42, rectRadius: 0.08,
    fill: { color: COLORS.bg2 }, line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("💰  可觀測性並非免費：儲存、運算、網路都有成本 — 目標是 5-10% 基礎設施成本", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.42,
    fontSize: 11, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  const strategies = [
    { emoji: "📉", title: "日誌取樣",     sub: "生產環境不記錄所有 DEBUG 日誌，動態調整 Log Level" },
    { emoji: "📊", title: "指標基數限制", sub: "避免高基數標籤（如 user_id），會讓 Prometheus 記憶體爆炸" },
    { emoji: "🔍", title: "追蹤取樣",     sub: "典型為 1-10% 取樣率，對高流量路徑降低取樣" },
    { emoji: "💾", title: "資料保留策略", sub: "熱資料 7 天、溫資料 30 天、冷資料 1 年歸檔" },
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
  slide.addText("原則：可觀測性成本應佔基礎設施成本的 5-10%——超出代表設計有問題", {
    x: 0.5, y: 3.5, w: 9.0, h: 0.42,
    fontSize: 10.5, bold: true, color: COLORS.warning, fontFace: FONTS.body, valign: "middle",
  });

  const retentions = [
    { label: "熱資料", period: "7 天",  color: COLORS.danger  },
    { label: "溫資料", period: "30 天", color: COLORS.warning },
    { label: "冷資料", period: "1 年",  color: COLORS.accent  },
  ];
  retentions.forEach((r, i) => {
    addMetricCard(slide, pres, {
      x: 0.4 + i * 3.1, y: 4.0, w: 2.8, h: 0.75,
      value: r.period, label: r.label, color: r.color,
    });
  });

  addTipBar(slide, pres, {
    y: 5.06,
    text: "高基數（high cardinality）是 Prometheus 最大的成本陷阱——永遠不要用 user_id 作為 label",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 147 — 常見可觀測性反模式
// ─────────────────────────────────────────────────────────────────────────────
function slide147(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "常見可觀測性反模式",
    partLabel: label(147),
    accentColor: ACCENT,
    complexity: 5,
  });

  const antiPatterns = [
    { emoji: "🔔", title: "對所有事情告警",        sub: "告警疲勞讓工程師開始忽視所有告警，包括真正重要的" },
    { emoji: "📝", title: "無結構的日誌",           sub: "Grep 地獄——靠 grep 搜尋純文字日誌無法擴展" },
    { emoji: "📊", title: "Dashboard 泛濫",         sub: "有 100 個 Dashboard 但沒人知道要看哪個，也沒人維護" },
    { emoji: "🔍", title: "追蹤不取樣",             sub: "100% 收集所有 Trace 導致儲存費用爆炸" },
    { emoji: "🎯", title: "沒有 SLO",               sub: "無法客觀衡量可靠性，無法做基於數據的決策" },
    { emoji: "🌐", title: "只在生產環境做可觀測性", sub: "問題在開發階段就應該被發現，為時已晚代價最高" },
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
    text: "可觀測性反模式是累積債務——每一個都讓下次事故的 MTTR 增加",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 148 — OpenTelemetry 完整生態系概覽
// ─────────────────────────────────────────────────────────────────────────────
function slide148(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "OpenTelemetry 完整生態系概覽",
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
  ["接收 · 處理 · 轉發", "Traces / Metrics / Logs", "多後端輸出", "採樣 · 過濾 · 轉換"].forEach((f, i) => {
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
  slide.addText("🔌  廠商可移植性", {
    x: 7.7, y: 0.82, w: 2.0, h: 0.35,
    fontSize: 10, bold: true, color: ACCENT, fontFace: FONTS.body, align: "center",
  });
  slide.addText("切換後端無需修改應用程式碼——只需更換 Collector 輸出設定", {
    x: 7.7, y: 1.24, w: 2.0, h: 2.1,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });

  addTipBar(slide, pres, {
    y: 4.85,
    text: "OTel 是可觀測性的 USB 標準——一次埋點，切換任何後端，保護你的投資",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 149 — 可觀測性上線前檢查清單
// ─────────────────────────────────────────────────────────────────────────────
function slide149(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "可觀測性上線前檢查清單",
    partLabel: label(149),
    accentColor: ACCENT,
    complexity: 5,
  });

  const checks = [
    { emoji: "📈", title: "指標",       sub: "所有服務定義 RED 指標（Rate、Errors、Duration）" },
    { emoji: "📋", title: "日誌",       sub: "JSON 結構化日誌、含 Correlation ID、無敏感資料" },
    { emoji: "🔍", title: "追蹤",       sub: "OTel SDK 已整合、取樣設定完成、Context Propagation 正常" },
    { emoji: "🔔", title: "告警",       sub: "每個 SLO 都有告警，每個告警都有 Runbook" },
    { emoji: "📊", title: "Dashboard",  sub: "服務總覽 Dashboard、依賴關係圖、SLO Dashboard" },
    { emoji: "🚨", title: "事故",       sub: "值班輪替表已設定、升級策略已定義、事後檢討流程已建立" },
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
    text: "上線前清單不是形式——每一個缺失都是下次凌晨三點事故無法快速解決的原因",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 150 — 課程完結：Cloud Native 完整旅程
// ─────────────────────────────────────────────────────────────────────────────
function slide150(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "課程完結：Cloud Native 完整旅程",
    partLabel: label(150),
    accentColor: ACCENT,
    complexity: 5,
  });

  slide.addText("🎓  恭喜完成 Cloud Native 完整課程！", {
    x: 0.3, y: 0.58, w: 9.4, h: 0.44,
    fontSize: 16, bold: true, color: ACCENT, fontFace: FONTS.title, align: "center", valign: "middle",
  });

  const steps = [
    { emoji: "🖥️", name: "傳統部署",      sub: "單一伺服器"         },
    { emoji: "⚖️", name: "水平擴展",      sub: "多台伺服器+負載平衡" },
    { emoji: "🐳", name: "容器化",        sub: "Docker 一致環境"     },
    { emoji: "📐", name: "12-Factor App", sub: "雲端原生原則"        },
    { emoji: "🔄", name: "DevOps",        sub: "CI/CD 流水線"        },
    { emoji: "🛡️", name: "SRE",          sub: "可靠性工程"          },
    { emoji: "📈", name: "Metrics",       sub: "Prometheus+Grafana"  },
    { emoji: "📋", name: "Logs",          sub: "ELK+Loki"            },
    { emoji: "🔍", name: "Tracing",       sub: "OTel+Jaeger+Tempo"   },
    { emoji: "🎯", name: "完整可觀測性",  sub: "三大支柱統一"        },
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

  slide.addText("🎓  你現在具備了在真實世界部署與運維分散式系統的能力", {
    x: 0.3, y: 3.38, w: 9.4, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
  });

  const badges = ["150 張投影片", "10 大主題", "全端到 SRE", "Cloud Native 就緒"];
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
    text: "下一步：Kubernetes · Service Mesh（Istio）· GitOps（Argo CD / Flux）· FinOps · Platform Engineering",
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
