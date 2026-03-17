// src/part9_tracing.js
// Part 9: 分散式追蹤 (Slides 121–135)

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
// 投影片 121 — 分散式追蹤：為什麼我們需要它
// ─────────────────────────────────────────────────────────────────────────────
function slide121(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "分散式追蹤：為什麼我們需要它",
    partLabel: "PART 9 追蹤  · 121 / 150",
    accentColor: COLORS.infra,
    complexity: 4,
  });

  // 問題說明
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.52, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.5 },
  });
  slide.addText("問題：在分散式系統中，一個請求會經過 10 個以上的服務 — 每一跳都是潛在的故障點", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.52,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });

  // 請求流程圖（用戶 → 前端 → API閘道 → 認證 → 訂單 → 庫存 → DB）
  const nodes = [
    { emoji: "👤", name: "用戶請求",   x: 0.2 },
    { emoji: "🖥️", name: "前端",       x: 1.55 },
    { emoji: "🔀", name: "API 閘道",   x: 2.9 },
    { emoji: "🔐", name: "認證服務",   x: 4.25 },
    { emoji: "📦", name: "訂單服務",   x: 5.6 },
    { emoji: "🏭", name: "庫存服務",   x: 6.95 },
    { emoji: "🗄️", name: "資料庫",     x: 8.3 },
  ];

  nodes.forEach((n) => {
    addNodeCard(slide, pres, {
      x: n.x, y: 1.28, w: 1.28, h: 1.0,
      emoji: n.emoji, name: n.name,
      borderColor: COLORS.infra,
    });
  });

  // 箭頭連接各服務
  for (let i = 0; i < nodes.length - 1; i++) {
    addHArrow(slide, pres, {
      x: nodes[i].x + 1.28, y: 1.58, w: 0.27,
      color: COLORS.infra,
    });
  }

  // 說明文字（無追蹤的困境）
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.42, w: 9.4, h: 0.55, rectRadius: 0.08,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addText("沒有追蹤時：可以看到錯誤，但完全無法追蹤請求經過了哪些服務、哪一步出了問題", {
    x: 0.5, y: 2.42, w: 9.0, h: 0.55,
    fontSize: 10.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  // 痛點列表
  const points = [
    { text: "🔍 無法知道哪個服務造成延遲",     fill: COLORS.bg2, border: COLORS.warning },
    { text: "💥 錯誤傳播路徑不明確",           fill: COLORS.cardDanger, border: COLORS.danger },
    { text: "🔗 跨服務的因果關係無法重建",     fill: COLORS.bg2, border: COLORS.infra },
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
    message: "一個請求失敗了，但你不知道是哪個服務出了問題",
  });

  addTipBar(slide, pres, {
    y: 5.0,
    text: "分散式追蹤 = 為每個請求建立完整的旅程地圖，讓問題無所遁形",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 122 — Trace、Span 與 Context 核心概念
// ─────────────────────────────────────────────────────────────────────────────
function slide122(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Trace、Span 與 Context 核心概念",
    partLabel: "PART 9 追蹤  · 122 / 150",
    accentColor: COLORS.infra,
    complexity: 5,
  });

  // 左側：三個核心定義卡片
  const defs = [
    {
      icon: "🗺️", title: "Trace",
      color: COLORS.infra,
      desc: "一次請求的完整旅程",
      meta: "具有唯一的 traceId\n跨越所有服務邊界",
    },
    {
      icon: "📐", title: "Span",
      color: COLORS.accent,
      desc: "一個工作單元",
      meta: "spanId + parentSpanId\n開始/結束時間 + 標籤",
    },
    {
      icon: "🏷️", title: "Context",
      color: COLORS.success,
      desc: "跨服務邊界傳遞的元資料",
      meta: "隨 HTTP 標頭傳播\nW3C Trace Context 標準",
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

  // 右側：父子 Span 階層視覺化
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.85, y: 0.65, w: 4.85, h: 4.62, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.2 },
  });
  slide.addText("父子 Span 階層示意", {
    x: 4.95, y: 0.72, w: 4.65, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.infra, fontFace: FONTS.body, align: "center",
  });

  // 根 Span
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.05, y: 1.12, w: 4.55, h: 0.4, rectRadius: 0.06,
    fill: { color: "2D1F5E" },
    line: { color: COLORS.infra, width: 1.2 },
  });
  slide.addText("Span: HTTP POST /checkout  (traceId: abc-123)", {
    x: 5.15, y: 1.12, w: 4.35, h: 0.4,
    fontSize: 9.5, bold: true, color: COLORS.infra, fontFace: FONTS.code, valign: "middle",
  });

  // 子 Span：認證
  slide.addShape(pres.ShapeType.line, {
    x: 5.45, y: 1.52, w: 0.01, h: 0.25,
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.65, y: 1.77, w: 3.65, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.accent, width: 1.0 },
  });
  slide.addText("Span: 認證服務驗證 Token  (parentId: root)", {
    x: 5.75, y: 1.77, w: 3.45, h: 0.38,
    fontSize: 9, color: COLORS.accent, fontFace: FONTS.code, valign: "middle",
  });

  // 子 Span：訂單
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.65, y: 2.25, w: 3.65, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.success, width: 1.0 },
  });
  slide.addText("Span: 訂單服務建立訂單  (parentId: root)", {
    x: 5.75, y: 2.25, w: 3.45, h: 0.38,
    fontSize: 9, color: COLORS.success, fontFace: FONTS.code, valign: "middle",
  });

  // 孫 Span：資料庫
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

  // 子 Span：庫存
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.65, y: 3.35, w: 3.65, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.warning, width: 1.0 },
  });
  slide.addText("Span: 庫存服務扣減庫存  (parentId: root)", {
    x: 5.75, y: 3.35, w: 3.45, h: 0.38,
    fontSize: 9, color: COLORS.warning, fontFace: FONTS.code, valign: "middle",
  });

  // 時間軸
  slide.addShape(pres.ShapeType.line, {
    x: 5.05, y: 4.12, w: 4.55, h: 0.01,
    line: { color: COLORS.border, width: 0.75, dashType: "dash" },
  });
  slide.addText("← 時間軸 →    總耗時: 245ms", {
    x: 5.05, y: 4.18, w: 4.55, h: 0.25,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.code, align: "center",
  });

  addTipBar(slide, pres, {
    y: 5.0,
    text: "每個 Span 記錄開始時間、結束時間、狀態碼、標籤屬性，完整還原請求在各服務的執行細節",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 123 — Context Propagation 上下文傳遞
// ─────────────────────────────────────────────────────────────────────────────
function slide123(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Context Propagation 上下文傳遞",
    partLabel: "PART 9 追蹤  · 123 / 150",
    accentColor: COLORS.infra,
    complexity: 6,
  });

  // W3C 標準說明
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.5, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.5 },
  });
  slide.addText("W3C Trace Context 標準  ·  HTTP 標頭：traceparent", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.5,
    fontSize: 12, bold: true, color: COLORS.infra, fontFace: FONTS.body, valign: "middle",
  });

  // traceparent 格式說明（程式碼卡片）
  addCodeCard(slide, pres, {
    x: 0.3, y: 1.28, w: 9.4, h: 1.1,
    language: "traceparent 標頭格式",
    code: "traceparent: 00-{traceId(32位元組十六進位)}-{parentSpanId(16位元組)}-{flags(01=取樣,00=不取樣)}\n\n# 實際範例\ntraceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  });

  // 傳遞流程圖標題
  slide.addText("跨服務傳遞流程", {
    x: 0.3, y: 2.5, w: 9.4, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });

  // 服務 A
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 2.88, w: 2.8, h: 1.52, rectRadius: 0.1,
    fill: { color: "1A1F2E" },
    line: { color: COLORS.accent, width: 1.5 },
  });
  slide.addText("服務 A（呼叫方）", {
    x: 0.4, y: 2.92, w: 2.6, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.accent, fontFace: FONTS.body, align: "center",
  });
  slide.addText("1. 建立根 Span\n2. 設定 traceparent 標頭\n3. 發送 HTTP 請求", {
    x: 0.5, y: 3.26, w: 2.4, h: 0.95,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // 傳輸箭頭
  addHArrow(slide, pres, {
    x: 3.1, y: 3.44, w: 1.4,
    color: COLORS.infra,
  });
  slide.addText("HTTP 請求\n+ traceparent", {
    x: 3.05, y: 3.02, w: 1.55, h: 0.4,
    fontSize: 8.5, color: COLORS.infra, fontFace: FONTS.code, align: "center",
  });

  // 服務 B
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.55, y: 2.88, w: 2.8, h: 1.52, rectRadius: 0.1,
    fill: { color: "1A2E1A" },
    line: { color: COLORS.success, width: 1.5 },
  });
  slide.addText("服務 B（被呼叫方）", {
    x: 4.65, y: 2.92, w: 2.6, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.success, fontFace: FONTS.body, align: "center",
  });
  slide.addText("1. 讀取 traceparent 標頭\n2. 解析 traceId + parentSpanId\n3. 建立子 Span", {
    x: 4.75, y: 3.26, w: 2.4, h: 0.95,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // 繼續傳遞虛線箭頭
  addHArrow(slide, pres, {
    x: 7.35, y: 3.44, w: 1.2,
    color: COLORS.border,
  });
  slide.addText("繼續傳遞\n到服務 C...", {
    x: 7.3, y: 3.02, w: 1.35, h: 0.4,
    fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.code, align: "center",
  });

  // 其他 Context 格式
  const formats = [
    { label: "B3 (Zipkin)", color: COLORS.warning },
    { label: "Jaeger",      color: COLORS.backend },
    { label: "AWS X-Ray",  color: COLORS.database },
  ];
  slide.addText("其他 Context 格式（OTel Collector 可互相轉換）：", {
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
    text: "traceparent 標頭必須在每個 HTTP/gRPC 呼叫中轉發 — 任何一層忘記轉發就會造成 Trace 斷鏈",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 124 — 單體式 vs 分散式架構的追蹤差異
// ─────────────────────────────────────────────────────────────────────────────
function slide124(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "單體式 vs 分散式架構的追蹤差異",
    partLabel: "PART 9 追蹤  · 124 / 150",
    accentColor: COLORS.infra,
    complexity: 5,
  });

  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.65, w: 4.5,
    label: "🏛️  單體式架構",
    type: "good",
  });
  addCompareHeading(slide, pres, {
    x: 5.2, y: 0.65, w: 4.5,
    label: "🌐  分散式架構",
    type: "bad",
  });

  const monoItems = [
    { emoji: "✅", title: "單一 Process",      sub: "所有程式碼在同一記憶體空間執行", type: "good" },
    { emoji: "✅", title: "函式呼叫追蹤",      sub: "直接攔截函式呼叫堆疊（call stack）", type: "good" },
    { emoji: "✅", title: "易於埋點",          sub: "一個 SDK 覆蓋整個應用程式", type: "good" },
    { emoji: "✅", title: "線性 Trace",        sub: "請求路徑單一，Span 階層簡單", type: "good" },
  ];
  const distItems = [
    { emoji: "⚠️", title: "每個服務需獨立埋點", sub: "多語言、多框架，維護成本高", type: "warning" },
    { emoji: "⚠️", title: "非同步間隙",         sub: "訊息佇列（Kafka/RabbitMQ）難以關聯", type: "warning" },
    { emoji: "❌", title: "HTTP/gRPC 邊界",     sub: "必須靠 Context Propagation 串聯", type: "bad" },
    { emoji: "❌", title: "時鐘偏移問題",        sub: "不同機器時間不同步，Span 順序可能錯誤", type: "bad" },
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
    text: "分散式追蹤本質上比單體式複雜 10 倍 — 但 OpenTelemetry 大幅降低了實作門檻",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 125 — OpenTelemetry：業界標準
// ─────────────────────────────────────────────────────────────────────────────
function slide125(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "OpenTelemetry：業界標準",
    partLabel: "PART 9 追蹤  · 125 / 150",
    accentColor: COLORS.infra,
    complexity: 6,
  });

  // 大標題說明
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.52, rectRadius: 0.08,
    fill: { color: "2D1F5E" },
    line: { color: COLORS.infra, width: 1.5 },
  });
  slide.addText("OTel = 廠商中立的可觀測性標準   ·   CNCF 畢業專案   ·   三大支柱全部涵蓋", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.52,
    fontSize: 11.5, bold: true, color: COLORS.infra, fontFace: FONTS.body, valign: "middle", align: "center",
  });

  // 三個元件
  addThreeCols(slide, pres, [
    {
      title: "API",
      color: COLORS.accent,
      icon: "🔌",
      items: [
        { text: "埋點介面", sub: "在程式碼中建立 Span 的 API" },
        { text: "語言無關", sub: "Python / Go / Java / JS" },
        { text: "僅定義介面", sub: "不含實作邏輯" },
        { text: "程式碼中的呼叫點", sub: "tracer.start_span()" },
      ],
    },
    {
      title: "SDK",
      color: COLORS.success,
      icon: "⚙️",
      items: [
        { text: "API 的實作", sub: "處理 Span 生命週期" },
        { text: "批次處理", sub: "合併多個 Span 再傳送" },
        { text: "取樣決策", sub: "頭部取樣邏輯在此實作" },
        { text: "導出器", sub: "傳送到 Collector 或後端" },
      ],
    },
    {
      title: "Collector",
      color: COLORS.infra,
      icon: "🔄",
      items: [
        { text: "接收遙測資料", sub: "支援 OTLP / Jaeger / Zipkin" },
        { text: "資料處理", sub: "過濾、豐富化、轉換格式" },
        { text: "多目標導出", sub: "同時送往多個後端" },
        { text: "解耦應用程式", sub: "後端變更不需修改程式碼" },
      ],
    },
  ], { y: 1.28, h: 3.55 });

  // 三大支柱
  const pillars = [
    { label: "📍 Traces", color: COLORS.infra,   desc: "請求追蹤" },
    { label: "📊 Metrics", color: COLORS.success, desc: "指標監控" },
    { label: "📋 Logs",   color: COLORS.warning,  desc: "日誌記錄" },
  ];
  slide.addText("OTel 涵蓋可觀測性三大支柱：", {
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
// 投影片 126 — OTel Collector 架構解析
// ─────────────────────────────────────────────────────────────────────────────
function slide126(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "OTel Collector 架構解析",
    partLabel: "PART 9 追蹤  · 126 / 150",
    accentColor: COLORS.infra,
    complexity: 7,
  });

  // 管線標題
  slide.addText("管線架構：接收器  →  處理器  →  導出器", {
    x: 0.3, y: 0.65, w: 9.4, h: 0.35,
    fontSize: 12, bold: true, color: COLORS.text, fontFace: FONTS.body, align: "center",
  });

  // 接收器區塊
  addZoneBorder(slide, pres, {
    x: 0.2, y: 1.12, w: 2.8, h: 2.65,
    color: COLORS.accent, label: "接收器",
  });
  ["OTLP (gRPC/HTTP)", "Jaeger", "Zipkin", "Prometheus"].forEach((r, i) => {
    addMiniNode(slide, pres, {
      x: 0.35, y: 1.28 + i * 0.58, w: 2.5, h: 0.42,
      label: r, borderColor: COLORS.accent,
    });
  });

  // 箭頭 → 處理器
  addHArrow(slide, pres, { x: 3.0, y: 2.28, w: 0.5, color: COLORS.infra });

  // 處理器區塊
  addZoneBorder(slide, pres, {
    x: 3.5, y: 1.12, w: 3.0, h: 2.65,
    color: COLORS.infra, label: "處理器",
  });
  ["批次處理 (batch)", "屬性豐富化", "過濾/取樣", "資源偵測"].forEach((p, i) => {
    addMiniNode(slide, pres, {
      x: 3.65, y: 1.28 + i * 0.58, w: 2.7, h: 0.42,
      label: p, borderColor: COLORS.infra,
    });
  });

  // 箭頭 → 導出器
  addHArrow(slide, pres, { x: 6.5, y: 2.28, w: 0.5, color: COLORS.success });

  // 導出器區塊
  addZoneBorder(slide, pres, {
    x: 7.0, y: 1.12, w: 2.8, h: 2.65,
    color: COLORS.success, label: "導出器",
  });
  ["Jaeger", "Zipkin / OTLP", "Prometheus", "Loki / 其他"].forEach((e, i) => {
    addMiniNode(slide, pres, {
      x: 7.15, y: 1.28 + i * 0.58, w: 2.5, h: 0.42,
      label: e, borderColor: COLORS.success,
    });
  });

  // Collector 外框
  addZoneBorder(slide, pres, {
    x: 0.1, y: 0.98, w: 9.8, h: 2.92,
    color: COLORS.border, label: "OTel Collector",
  });

  // 設定檔範例
  addCodeCard(slide, pres, {
    x: 0.3, y: 4.08, w: 9.4, h: 1.12,
    language: "otel-collector-config.yaml（概要）",
    code: "receivers: {otlp: {protocols: {grpc: {endpoint: 0.0.0.0:4317}}}}\nprocessors: {batch: {timeout: 1s, send_batch_size: 1024}}\nexporters: {jaeger: {endpoint: jaeger:14250}, prometheus: {endpoint: 0.0.0.0:8889}}\nservice: {pipelines: {traces: {receivers: [otlp], processors: [batch], exporters: [jaeger]}}}",
  });

  addTipBar(slide, pres, {
    y: 5.25,
    text: "Collector 讓應用程式與後端解耦 — 後端從 Jaeger 換成 Tempo 不需修改任何應用程式程式碼",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 127 — Jaeger：分散式追蹤後端
// ─────────────────────────────────────────────────────────────────────────────
function slide127(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Jaeger：分散式追蹤後端",
    partLabel: "PART 9 追蹤  · 127 / 150",
    accentColor: COLORS.infra,
    complexity: 7,
  });

  slide.addText("Jaeger 由 Uber 開源，目前為 CNCF 畢業專案，是最廣泛使用的分散式追蹤後端之一", {
    x: 0.3, y: 0.65, w: 9.4, h: 0.35,
    fontSize: 10.5, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  // 架構元件卡片
  const components = [
    { x: 0.3,  y: 1.1, emoji: "📡", name: "jaeger-agent",     meta: "Sidecar / DaemonSet\nUDP port 6831/6832",  borderColor: COLORS.accent  },
    { x: 2.85, y: 1.1, emoji: "🔄", name: "jaeger-collector", meta: "驗證、索引\n儲存至後端",                   borderColor: COLORS.success },
    { x: 5.4,  y: 1.1, emoji: "🔍", name: "jaeger-query",     meta: "搜尋 API\nREST + gRPC",                   borderColor: COLORS.infra   },
    { x: 7.95, y: 1.1, emoji: "🖥️", name: "Jaeger UI",        meta: "Trace 視覺化\nGantt 時序圖",              borderColor: COLORS.warning },
  ];
  components.forEach((c) => {
    addNodeCard(slide, pres, {
      x: c.x, y: c.y, w: 2.3, h: 1.25,
      emoji: c.emoji, name: c.name, meta: c.meta,
      borderColor: c.borderColor,
    });
  });

  // 元件間箭頭
  for (let i = 0; i < 3; i++) {
    addHArrow(slide, pres, {
      x: components[i].x + 2.3, y: 1.57, w: 0.25,
      color: COLORS.infra,
    });
  }

  // 儲存後端
  slide.addText("儲存後端", {
    x: 0.3, y: 2.55, w: 1.5, h: 0.3,
    fontSize: 10, bold: true, color: COLORS.text, fontFace: FONTS.body,
  });
  [
    { label: "Elasticsearch", color: COLORS.success },
    { label: "Cassandra",     color: COLORS.warning },
    { label: "Badger (本地)", color: COLORS.accent  },
  ].forEach((s, i) => {
    addMiniNode(slide, pres, {
      x: 1.9 + i * 2.7, y: 2.45, w: 2.4, h: 0.42,
      label: s.label, borderColor: s.color,
    });
  });
  addVArrow(slide, pres, { x: 3.6, y: 2.35, h: 0.12, color: COLORS.border });

  // 特性說明
  const features = [
    { icon: "🔍", text: "依 service / operation / tag 搜尋 Trace",        color: COLORS.infra   },
    { icon: "📊", text: "比較多個 Trace，找出效能退化",                    color: COLORS.accent  },
    { icon: "🗂️", text: "服務相依圖（Service Graph）自動生成",            color: COLORS.success },
    { icon: "⚡", text: "尾部取樣：Jaeger Collector 支援 remote sampling", color: COLORS.warning },
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
    text: "Jaeger UI 提供 Gantt 時序圖，可直觀看到每個 Span 的耗時佔比，快速定位瓶頸服務",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 128 — 取樣策略：頭部取樣 vs 尾部取樣
// ─────────────────────────────────────────────────────────────────────────────
function slide128(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "取樣策略：頭部取樣 vs 尾部取樣",
    partLabel: "PART 9 追蹤  · 128 / 150",
    accentColor: COLORS.infra,
    complexity: 7,
  });

  // 問題說明
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.48, rectRadius: 0.08,
    fill: { color: COLORS.cardDanger },
    line: { color: COLORS.danger, width: 1.2 },
  });
  slide.addText("問題：無法追蹤 100% 的請求 — 資料量太大、儲存成本太高、效能開銷過大", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.48,
    fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  addCompareHeading(slide, pres, {
    x: 0.3, y: 1.24, w: 4.5,
    label: "頭部取樣（Head-based Sampling）",
    type: "good",
  });
  addCompareHeading(slide, pres, {
    x: 5.2, y: 1.24, w: 4.5,
    label: "尾部取樣（Tail-based Sampling）",
    type: "bad",
  });

  const headItems = [
    { emoji: "⏱️", title: "在請求開始時決定",  sub: "以固定機率立即判斷是否追蹤", type: "good" },
    { emoji: "✅", title: "實作簡單",          sub: "SDK 內建支援，不需額外基礎設施", type: "good" },
    { emoji: "⚡", title: "低開銷",            sub: "未選到的請求不產生 Span", type: "good" },
    { emoji: "⚠️", title: "可能漏掉偶發錯誤",  sub: "低機率錯誤可能被取樣率過濾掉", type: "warning" },
  ];
  const tailItems = [
    { emoji: "🔄", title: "Trace 完成後才決定", sub: "等待整個 Trace 結束再做判斷", type: "warning" },
    { emoji: "✅", title: "保留所有錯誤",       sub: "100% 保留含錯誤的 Trace", type: "good" },
    { emoji: "⚠️", title: "需要暫存所有 Trace", sub: "Collector 需要大量記憶體緩衝", type: "warning" },
    { emoji: "❌", title: "架構複雜",           sub: "OTel Collector Tail Sampling 設定複雜", type: "bad" },
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

  // 其他取樣策略
  const strategies = [
    { label: "機率取樣",    desc: "隨機取樣 X% 的請求（最常見）",  color: COLORS.accent },
    { label: "速率限制",    desc: "每秒最多 N 個 Trace",           color: COLORS.success },
    { label: "規則取樣",    desc: "錯誤 = 100%，正常 = 1%",       color: COLORS.warning },
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
    text: "生產環境通常使用 1-10% 頭部取樣，搭配尾部取樣保留所有錯誤 Trace — 兼顧成本與可觀測性",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 129 — 使用 OTel SDK 埋點實作
// ─────────────────────────────────────────────────────────────────────────────
function slide129(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "使用 OTel SDK 埋點實作",
    partLabel: "PART 9 追蹤  · 129 / 150",
    accentColor: COLORS.infra,
    complexity: 6,
  });

  // 左側：手動埋點程式碼
  slide.addText("手動 Span 建立（Python / FastAPI）", {
    x: 0.3, y: 0.65, w: 4.6, h: 0.3,
    fontSize: 10.5, bold: true, color: COLORS.infra, fontFace: FONTS.body,
  });
  addCodeCard(slide, pres, {
    x: 0.3, y: 0.98, w: 4.6, h: 3.62,
    language: "Python OTel SDK",
    code: "from opentelemetry import trace\nfrom opentelemetry.sdk.trace import TracerProvider\nfrom opentelemetry.sdk.trace.export import (\n    BatchSpanProcessor\n)\nfrom opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (\n    OTLPSpanExporter\n)\n\n# 初始化 TracerProvider\nprovider = TracerProvider()\nprovider.add_span_processor(\n    BatchSpanProcessor(OTLPSpanExporter())\n)\ntrace.set_tracer_provider(provider)\n\n# 取得 Tracer\ntracer = trace.get_tracer(__name__)\n\n# 建立手動 Span\nwith tracer.start_as_current_span(\"處理訂單\") as span:\n    # 加入自訂屬性\n    span.set_attribute(\"order.id\", order_id)\n    span.set_attribute(\"order.amount\", amount)\n    result = process(order)\n    span.add_event(\"訂單處理完成\")",
  });

  // 右側：自動埋點
  slide.addText("自動埋點（不需修改業務程式碼）", {
    x: 5.2, y: 0.65, w: 4.5, h: 0.3,
    fontSize: 10.5, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  addCodeCard(slide, pres, {
    x: 5.2, y: 0.98, w: 4.5, h: 1.85,
    language: "自動埋點（零侵入）",
    code: "# 安裝自動埋點套件\npip install opentelemetry-instrument-fastapi\npip install opentelemetry-instrument-sqlalchemy\npip install opentelemetry-instrument-requests\n\n# 啟動時自動注入（不修改程式碼）\nopentelemetry-instrument \\\n    --traces_exporter otlp \\\n    uvicorn app:main",
  });

  // 支援的框架
  slide.addText("自動埋點支援的框架與函式庫：", {
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
    text: "自動埋點適合快速上手，手動埋點適合業務關鍵路徑 — 兩者可以混用",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 130 — Kubernetes 中的追蹤部署方式
// ─────────────────────────────────────────────────────────────────────────────
function slide130(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Kubernetes 中的追蹤部署方式",
    partLabel: "PART 9 追蹤  · 130 / 150",
    accentColor: COLORS.infra,
    complexity: 8,
  });

  const schemes = [
    {
      x: 0.2, title: "① DaemonSet 模式", color: COLORS.accent,
      desc: "每個節點部署一個 OTel Collector",
      pros: ["應用程式發送到 localhost", "節點共享，資源效率高", "適合大型叢集"],
      cons: ["節點故障時該節點資料遺失", "Collector 升級影響整節點"],
    },
    {
      x: 3.47, title: "② Sidecar 模式", color: COLORS.infra,
      desc: "每個 Pod 附帶一個 Collector",
      pros: ["完整隔離，互不影響", "可針對 Pod 設定取樣策略"],
      cons: ["資源開銷大（每 Pod 多一個容器）", "大量 Pod 時維護複雜"],
    },
    {
      x: 6.72, title: "③ 中央 Collector", color: COLORS.success,
      desc: "所有應用程式發送到統一部署",
      pros: ["最易管理", "統一設定與監控"],
      cons: ["單點故障風險", "網路開銷稍高", "流量大時需水平擴展"],
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

    // Pod 示意圖
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

    // 優點
    slide.addText("優點", {
      x: s.x + 0.12, y: 2.52, w: 2.96, h: 0.25,
      fontSize: 9, bold: true, color: COLORS.success, fontFace: FONTS.body,
    });
    s.pros.forEach((p, i) => {
      slide.addText(`\u2705 ${p}`, {
        x: s.x + 0.12, y: 2.78 + i * 0.32, w: 2.96, h: 0.3,
        fontSize: 9, color: COLORS.text, fontFace: FONTS.body,
      });
    });

    // 缺點
    const prosH = s.pros.length * 0.32;
    slide.addText("缺點", {
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
    text: "大多數團隊從 DaemonSet 開始，需要強隔離時才改用 Sidecar — 中央 Collector 適合小型叢集",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 131 — Service Mesh 自動追蹤
// ─────────────────────────────────────────────────────────────────────────────
function slide131(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Service Mesh 自動追蹤",
    partLabel: "PART 9 追蹤  · 131 / 150",
    accentColor: COLORS.infra,
    complexity: 8,
  });

  // 核心說明
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.5, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.5 },
  });
  slide.addText("Istio / Envoy：在 Proxy 層自動注入追蹤標頭 — 應用程式不需要 SDK 埋點即可獲得基本追蹤", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.5,
    fontSize: 11, bold: true, color: COLORS.infra, fontFace: FONTS.body, valign: "middle",
  });

  // 架構圖 — Pod A
  addZoneBorder(slide, pres, {
    x: 0.2, y: 1.25, w: 3.5, h: 1.8,
    color: COLORS.accent, label: "Pod A",
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.4, y: 1.45, w: 1.4, h: 1.35, rectRadius: 0.08,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.accent, width: 1.0 },
  });
  slide.addText("🐍\n應用程式\n(無 SDK)", {
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

  // 注入箭頭
  addHArrow(slide, pres, {
    x: 3.7, y: 1.98, w: 1.0,
    label: "注入\ntraceparent",
    color: COLORS.infra,
  });

  // 架構圖 — Pod B
  addZoneBorder(slide, pres, {
    x: 4.7, y: 1.25, w: 3.5, h: 1.8,
    color: COLORS.success, label: "Pod B",
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.9, y: 1.45, w: 1.55, h: 1.35, rectRadius: 0.08,
    fill: { color: "2D1F5E" },
    line: { color: COLORS.infra, width: 1.0 },
  });
  slide.addText("🔷\nEnvoy\nProxy\n(讀取標頭)", {
    x: 4.9, y: 1.5, w: 1.55, h: 1.2,
    fontSize: 9.5, color: COLORS.infra, fontFace: FONTS.body, align: "center", valign: "middle",
  });
  addHArrow(slide, pres, { x: 6.45, y: 1.98, w: 0.2, color: COLORS.border });
  slide.addShape(pres.ShapeType.roundRect, {
    x: 6.65, y: 1.45, w: 1.4, h: 1.35, rectRadius: 0.08,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.success, width: 1.0 },
  });
  slide.addText("🐍\n應用程式\n(無 SDK)", {
    x: 6.65, y: 1.5, w: 1.4, h: 1.2,
    fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body, align: "center", valign: "middle",
  });

  // 發送到 Jaeger
  addHArrow(slide, pres, {
    x: 8.2, y: 1.98, w: 1.0,
    label: "Span →\nJaeger",
    color: COLORS.warning,
  });

  // 限制說明
  slide.addText("⚠️  Service Mesh 追蹤的重要限制", {
    x: 0.3, y: 3.22, w: 9.4, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });
  const limits = [
    { text: "⚠️ 應用程式仍需轉發 traceparent 等標頭，否則父子 Span 連結會斷掉", color: COLORS.warning },
    { text: "❌ 無法看到應用程式內部邏輯 — 只能看到服務間的 HTTP/gRPC 呼叫",   color: COLORS.danger  },
    { text: "❌ 資料庫查詢、快取呼叫等內部 Span 需要 SDK 才能追蹤",             color: COLORS.danger  },
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
    text: "Service Mesh 追蹤是很好的起點，但最終仍需 OTel SDK 才能獲得完整的業務層追蹤",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 132 — Trace、Log、Metrics 三者整合
// ─────────────────────────────────────────────────────────────────────────────
function slide132(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Trace、Log、Metrics 三者整合",
    partLabel: "PART 9 追蹤  · 132 / 150",
    accentColor: COLORS.infra,
    complexity: 8,
  });

  // 關鍵說明
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 9.4, h: 0.5, rectRadius: 0.08,
    fill: { color: "2D1F5E" },
    line: { color: COLORS.infra, width: 1.5 },
  });
  slide.addText("關鍵：將 traceId 和 spanId 注入每條日誌記錄 — 三個 Pillar 透過 Correlation ID 互相串聯", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.5,
    fontSize: 11, bold: true, color: COLORS.infra, fontFace: FONTS.body, valign: "middle",
  });

  // Grafana Stack 三個面板
  const panels = [
    {
      x: 0.2, icon: "📊", title: "Prometheus", subtitle: "指標監控",
      color: COLORS.warning,
      content: "看到 error_rate 或\np99 latency 突然飆升\n→ 點擊進入 Grafana",
    },
    {
      x: 3.47, icon: "🔍", title: "Tempo / Jaeger", subtitle: "追蹤分析",
      color: COLORS.infra,
      content: "找到問題時段的 Trace\n看到哪個 Span 耗時異常\n→ 點擊查看關聯 Log",
    },
    {
      x: 6.72, icon: "📋", title: "Loki", subtitle: "日誌查詢",
      color: COLORS.success,
      content: "根據 traceId 直接查詢\n該次請求所有服務的日誌\n精確定位錯誤行",
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

  // 關聯箭頭
  addHArrow(slide, pres, {
    x: 3.4, y: 2.58, w: 0.07,
    label: "TraceID\n關聯",
    color: COLORS.textMuted,
  });
  addHArrow(slide, pres, {
    x: 6.65, y: 2.58, w: 0.07,
    label: "TraceID\n關聯",
    color: COLORS.textMuted,
  });

  // 工作流程
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.08, w: 9.4, h: 0.58, rectRadius: 0.08,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 1.0 },
  });
  slide.addText("工作流程：Prometheus 看到異常 → Grafana Explore 找 Trace → Tempo 顯示 Span 詳情 → 點擊 TraceID 跳至 Loki 查詢相關日誌", {
    x: 0.5, y: 4.08, w: 9.0, h: 0.58,
    fontSize: 10, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 4.78,
    text: "Correlation ID 貫穿三個 Pillar 是可觀測性的核心能力 — Grafana 的 Explore 頁面可直接在三個資料源間跳轉",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 133 — 追蹤的成本與效能影響
// ─────────────────────────────────────────────────────────────────────────────
function slide133(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "追蹤的成本與效能影響",
    partLabel: "PART 9 追蹤  · 133 / 150",
    accentColor: COLORS.infra,
    complexity: 6,
  });

  // SDK 效能開銷
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 4.5, h: 1.62, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.warning, width: 1.5 },
  });
  slide.addText("⚡ SDK 效能開銷", {
    x: 0.45, y: 0.72, w: 4.2, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });
  [
    "CPU：約 1-3% 額外用於埋點與序列化",
    "記憶體：每個 Span 約 1-5KB（含屬性、事件）",
    "網路：批次處理後到 Collector 的傳輸量",
    "延遲：非同步導出，對請求延遲影響 < 1ms",
  ].forEach((t, i) => {
    slide.addText(`\u2022 ${t}`, {
      x: 0.45, y: 1.06 + i * 0.28, w: 4.2, h: 0.27,
      fontSize: 9.5, color: COLORS.text, fontFace: FONTS.body,
    });
  });

  // 成本試算
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.1, y: 0.65, w: 4.6, h: 1.62, rectRadius: 0.1,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.danger, width: 1.5 },
  });
  slide.addText("💰 儲存成本試算（100% 取樣）", {
    x: 5.25, y: 0.72, w: 4.3, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.danger, fontFace: FONTS.body,
  });
  addCodeCard(slide, pres, {
    x: 5.2, y: 1.06, w: 4.5, h: 1.05,
    language: "每日資料量估算",
    code: "每天 100 萬個請求\n× 每請求 10 個 Span\n× 每 Span 2 KB\n= 每天 20 GB Trace 資料",
  });

  // 三欄比較：取樣率影響
  addThreeCols(slide, pres, [
    {
      title: "100% 取樣",
      color: COLORS.danger,
      icon: "🔴",
      items: [
        { text: "每天 20 GB",    sub: "成本最高" },
        { text: "完整可觀測性",  sub: "每個請求都可查" },
        { text: "適合：測試環境", sub: "不建議生產環境" },
      ],
    },
    {
      title: "10% 取樣",
      color: COLORS.warning,
      icon: "🟡",
      items: [
        { text: "每天 2 GB",     sub: "成本降低 90%" },
        { text: "可接受覆蓋率",  sub: "大多數問題可查到" },
        { text: "適合：一般業務", sub: "最常見的選擇" },
      ],
    },
    {
      title: "1% 取樣",
      color: COLORS.success,
      icon: "🟢",
      items: [
        { text: "每天 200 MB",   sub: "成本最低" },
        { text: "僅做趨勢分析",  sub: "個別問題難以查到" },
        { text: "搭配尾部取樣",  sub: "保留錯誤 Trace" },
      ],
    },
  ], { y: 2.45, h: 2.72 });

  addTipBar(slide, pres, {
    y: 5.25,
    text: "取樣率設計原則：正常請求低取樣 + 錯誤/高延遲請求 100% 保留 = 最佳成本效益比",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 134 — 常見追蹤反模式
// ─────────────────────────────────────────────────────────────────────────────
function slide134(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "常見追蹤反模式",
    partLabel: "PART 9 追蹤  · 134 / 150",
    accentColor: COLORS.infra,
    complexity: 5,
  });

  const antiPatterns = [
    {
      icon: "💣", title: "追蹤不取樣",
      desc: "100% 取樣率 + 高流量 = 儲存爆炸、成本暴增",
      fix: "正確做法：設定合理取樣率，搭配尾部取樣保留錯誤",
    },
    {
      icon: "🔗", title: "缺少 Context Propagation",
      desc: "任何一層（Message Queue、Async Job）忘記傳遞 traceparent 就會造成 Trace 斷鏈",
      fix: "正確做法：所有服務邊界都必須轉發追蹤標頭",
    },
    {
      icon: "🙈", title: "只追蹤正常路徑",
      desc: "只在 try 區塊埋點，catch/error 路徑沒有 Span — 錯誤發生時無法追蹤",
      fix: "正確做法：在 Span 中記錄異常 span.record_exception(e)",
    },
    {
      icon: "🗂️", title: "不與日誌關聯",
      desc: "Trace 單獨使用只能看到時序，看不到詳細錯誤訊息，無法深入除錯",
      fix: "正確做法：日誌中注入 trace_id 和 span_id",
    },
    {
      icon: "🔒", title: "廠商鎖定",
      desc: "直接使用 Jaeger SDK 或 Zipkin SDK 埋點，未來換後端需要大幅修改程式碼",
      fix: "正確做法：永遠使用 OTel API/SDK，後端透過 Collector 抽象",
    },
  ];

  antiPatterns.forEach((ap, i) => {
    // 最後一張（第5個）置中全寬
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
    text: "追蹤系統的價值來自於完整性和關聯性 — 避免這些反模式可以讓追蹤效益最大化",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 投影片 135 — 追蹤章節總結
// ─────────────────────────────────────────────────────────────────────────────
function slide135(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "追蹤章節總結",
    partLabel: "PART 9 追蹤  · 135 / 150",
    accentColor: COLORS.infra,
    complexity: 5,
  });

  // 四個總結卡片
  const summaries = [
    {
      x: 0.3, icon: "🗺️", title: "是什麼",
      color: COLORS.infra,
      items: [
        "跨服務邊界追蹤請求路徑",
        "Trace + Span + Context",
        "W3C traceparent 標準",
        "解決分散式除錯難題",
      ],
    },
    {
      x: 2.65, icon: "🔧", title: "怎麼做",
      color: COLORS.accent,
      items: [
        "OTel SDK 自動/手動埋點",
        "OTel Collector 路由",
        "Jaeger / Tempo 後端",
        "K8s DaemonSet 部署",
      ],
    },
    {
      x: 5.0, icon: "🎯", title: "取樣策略",
      color: COLORS.warning,
      items: [
        "頭部取樣：低開銷",
        "尾部取樣：保留所有錯誤",
        "生產：1-10% + 錯誤全保",
        "成本控制的必要手段",
      ],
    },
    {
      x: 7.35, icon: "🔗", title: "整合",
      color: COLORS.success,
      items: [
        "TraceID 注入每條日誌",
        "Grafana Tempo + Loki",
        "三個 Pillar 互相串聯",
        "告警 → Trace → Log",
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

  // 下一章節預告
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 4.88, w: 9.4, h: 0.5, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.infra, width: 1.2 },
  });
  slide.addText("🚀  下一章節 PART 10：SRE 實踐 — 將 Traces + Metrics + Logs 整合到 SLO/SLI 體系中", {
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
