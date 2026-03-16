// src/part8_logs.js
// Part 8: Logs Observability (Slides 106–120)

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
// Slide 106 — Logs 是什麼？解決什麼問題
// ─────────────────────────────────────────────────────────────────────────────
function slide106(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Logs：應用程式的事件日誌 — 除錯的最後防線",
    partLabel: "PART 8 LOGS  · 106 / 150",
    accentColor: COLORS.warning,
  });

  // Large definition box
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 4.5, h: 0.85, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.warning, width: 1.5 },
  });
  slide.addText("Logs = 帶時間戳的結構化事件記錄", {
    x: 0.3, y: 0.68, w: 4.5, h: 0.42,
    fontSize: 13, bold: true, color: COLORS.warning, fontFace: FONTS.body, align: "center", valign: "middle",
  });
  slide.addText("記錄了系統在特定時刻「發生了什麼事」", {
    x: 0.3, y: 1.08, w: 4.5, h: 0.38,
    fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body, align: "center", valign: "middle",
  });

  // 3 problem scenarios
  const scenarios = [
    { text: "🔥 Prod 突然出現 500 錯誤 — 哪個 API？哪個 user？什麼原因？", border: COLORS.danger, fill: COLORS.cardDanger },
    { text: "🐛 用戶說「我的訂單消失了」— 什麼時候？哪個 service 出問題？", border: COLORS.warning, fill: COLORS.cardWarn },
    { text: "🔐 安全審計 — 誰在什麼時候刪除了這筆資料？", border: COLORS.accent, fill: COLORS.bg2 },
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
  slide.addText("❌ 沒有 Log：只能重現問題、猜測原因、無法審計", {
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
    text: "一條好的 Log 應該能讓你在不重現問題的情況下，100% 知道發生了什麼 — 包含 trace_id 讓你串聯 Traces",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 107 — 結構化日誌 vs 非結構化日誌
// ─────────────────────────────────────────────────────────────────────────────
function slide107(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "結構化日誌 vs 非結構化日誌：機器可讀才是關鍵",
    partLabel: "PART 8 LOGS  · 107 / 150",
    accentColor: COLORS.warning,
  });

  // Left - unstructured
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "❌ 非結構化日誌（人能讀，機器難讀）",
    type: "bad",
  });
  addCodeCard(slide, pres, {
    x: 0.3, y: 1.08, w: 4.4, h: 1.75,
    language: "plain text logs",
    code: "2024-03-15 14:32:01 ERROR User login failed\n2024-03-15 14:32:01 ERROR john@example.com bad pwd\n2024-03-15 14:33:45 INFO  request GET /api/users 200 145ms\n2024-03-15 14:33:52 WARN  high memory: 89%",
  });

  const badProblems = [
    "❌ 難以 grep: 要猜 format",
    "❌ 無法自動解析 email / latency",
    "❌ Kibana/Loki 無法做 aggregation",
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
    label: "✅ 結構化日誌（JSON / key=value）",
    type: "good",
  });
  addCodeCard(slide, pres, {
    x: 5.2, y: 1.08, w: 4.4, h: 1.75,
    language: "structured JSON logs",
    code: '{"time":"2024-03-15T14:32:01Z","level":"ERROR",\n "event":"login_failed","user":"john@ex.com",\n "reason":"wrong_password","attempt":3}\n{"time":"2024-03-15T14:33:45Z","level":"INFO",\n "method":"GET","path":"/api/users","status":200,\n "duration_ms":145}\n{"time":"2024-03-15T14:33:52Z","level":"WARN",\n "event":"high_memory","usage_pct":89}',
  });

  const goodBenefits = [
    "✅ 機器自動解析 — ES/Loki 自動建 index",
    "✅ 可 aggregation: avg(duration_ms) by user",
    "✅ 可直接 join with Traces (trace_id)",
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
// Slide 108 — Log 等級設計原則
// ─────────────────────────────────────────────────────────────────────────────
function slide108(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log 等級設計：什麼情況記哪個等級",
    partLabel: "PART 8 LOGS  · 108 / 150",
    accentColor: COLORS.warning,
  });

  const levels = [
    {
      y: 0.68, fill: COLORS.bg2, border: COLORS.textMuted,
      badge: "🔵 DEBUG", badgeColor: COLORS.textMuted,
      desc: "詳細的除錯資訊 — 只在開發/除錯時開啟，Production 通常關閉",
      example: "SQL query: SELECT * FROM users WHERE id=123 (12ms)",
    },
    {
      y: 1.46, fill: COLORS.bg2, border: COLORS.success,
      badge: "🟢 INFO", badgeColor: COLORS.success,
      desc: "正常運作的重要事件 — 服務啟動、請求成功、狀態變更",
      example: "payment_completed: order_id=456, amount=299.99, user=john",
    },
    {
      y: 2.24, fill: COLORS.cardWarn, border: COLORS.warning,
      badge: "🟡 WARN", badgeColor: COLORS.warning,
      desc: "不預期但已處理的情況 — 不影響主流程，但值得注意",
      example: "retry_attempt: db_connection failed, retry 2/3",
    },
    {
      y: 3.02, fill: COLORS.cardDanger, border: COLORS.danger,
      badge: "🔴 ERROR", badgeColor: COLORS.danger,
      desc: "發生了不預期的錯誤 — 需要人工介入，影響部分功能",
      example: "payment_failed: stripe_api_error, user_id=789",
    },
    {
      y: 3.80, fill: COLORS.cardDanger, border: COLORS.danger,
      badge: "💀 CRITICAL/FATAL", badgeColor: COLORS.danger,
      desc: "系統無法繼續運作 — 整個服務掛掉，立即需要人工處理",
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
  slide.addText("❌ 常見錯誤：ERROR catch Exception (全部 catch 都用 ERROR) | INFO 記太多（噪音）| DEBUG 留在 Prod（效能問題）", {
    x: 0.45, y: 4.62, w: 9.1, h: 0.65,
    fontSize: 10, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  addTipBar(slide, pres, {
    y: 5.35,
    text: "Production 建議：INFO 以上，關鍵路徑才用 DEBUG | 每條 Log 都問：On-Call 人員看到這條能做什麼决定？",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 109 — Correlation ID：串聯跨服務的 Log
// ─────────────────────────────────────────────────────────────────────────────
function slide109(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Correlation ID：如何在分散式系統中串聯日誌",
    partLabel: "PART 8 LOGS  · 109 / 150",
    accentColor: COLORS.infra,
  });

  // Left: problem
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "❌ 沒有 Correlation ID",
    type: "bad",
  });
  slide.addText("用戶說結帳失敗，你要查哪裡？", {
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

  slide.addText("這三條 Log 是同一個請求嗎？🤷 完全無法確定！", {
    x: 0.3, y: 2.92, w: 4.4, h: 0.35,
    fontSize: 10, bold: true, color: COLORS.danger, fontFace: FONTS.body, valign: "middle",
  });

  // Right: solution
  addCompareHeading(slide, pres, {
    x: 5.2, y: 0.62, w: 4.4,
    label: "✅ 使用 Trace ID 作為 Correlation ID",
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

  slide.addText("✅ 用 trace_id='abc-123' 一次查到所有相關 Log！", {
    x: 5.2, y: 3.12, w: 4.4, h: 0.35,
    fontSize: 10, bold: true, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
  });

  // Implementation code
  addCodeCard(slide, pres, {
    x: 0.3, y: 3.52, w: 9.4, h: 1.52,
    language: "Python FastAPI + OpenTelemetry",
    code: "from opentelemetry import trace\nimport structlog\n\n@app.middleware('http')\nasync def logging_middleware(request, call_next):\n    span = trace.get_current_span()\n    trace_id = format(span.get_span_context().trace_id, '032x')\n    # 所有後續 log 自動帶 trace_id\n    structlog.contextvars.bind_contextvars(trace_id=trace_id)\n    return await call_next(request)",
  });

  addTipBar(slide, pres, {
    y: 5.12,
    text: "使用 OpenTelemetry trace_id 作為 Correlation ID — 一個 ID 串聯 Logs + Traces + Metrics",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 110 — 單體服務的 Log 收集
// ─────────────────────────────────────────────────────────────────────────────
function slide110(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "單體服務 Log 收集：從 stdout 到集中儲存",
    partLabel: "PART 8 LOGS  · 110 / 150",
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
    text: "單體服務 Log 收集很簡單 — 輸出到 stdout，OS 幫你存到 journald，Filebeat/Fluentd 收集傳送",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 111 — 分散式架構的 Log 收集挑戰
// ─────────────────────────────────────────────────────────────────────────────
function slide111(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "分散式架構 Log 收集：Container 環境的挑戰",
    partLabel: "PART 8 LOGS  · 111 / 150",
    accentColor: COLORS.danger,
  });

  // Left: challenges
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "分散式 Log 的四大挑戰",
    type: "bad",
  });

  const challenges = [
    { title: "🗑️ 容器是短暫的", desc: "Container 重啟/刪除 → Log 消失！\n不能再 tail log file 了", border: COLORS.danger, fill: COLORS.cardDanger },
    { title: "📍 Pod 分散在多個 Node", desc: "50 個 Pod × 10 台 Node = Log 到處都是\n人工 kubectl logs 是不可能的", border: COLORS.danger, fill: COLORS.cardDanger },
    { title: "📊 Log 量爆炸", desc: "50 個微服務 × 1000 req/s = TB 級 Log/天\n需要取樣與過濾策略", border: COLORS.warning, fill: COLORS.cardWarn },
    { title: "🔗 無法關聯", desc: "同一個請求跨多 service 的 Log 分散各處\n沒有 Correlation ID 無從查起", border: COLORS.warning, fill: COLORS.cardWarn },
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
    label: "✅ 解決方案",
    type: "good",
  });

  const solutions = [
    { title: "📤 Log 輸出到 stdout", desc: "Container 不寫檔案，K8s 自動保存 stdout\nkubectl logs 就能看", border: COLORS.success, fill: COLORS.cardSuccess },
    { title: "🔄 DaemonSet / Sidecar 收集", desc: "每個 Node 跑一個 log collector\n自動收集所有 Container 的 stdout", border: COLORS.success, fill: COLORS.cardSuccess },
    { title: "🏷️ 加入 Metadata", desc: "自動附加：pod name, namespace, node\napp label → 方便過濾", border: COLORS.accent, fill: COLORS.bg2 },
    { title: "⚡ 集中儲存 + 搜尋", desc: "Elasticsearch / Loki\n全文搜尋 + 結構化查詢", border: COLORS.accent, fill: COLORS.bg2 },
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
    text: "K8s 的 Container stdout → /var/log/containers/*.log 會自動保存 — Log collector 只需要 tail 這個目錄",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 112 — Sidecar vs DaemonSet 收集模式
// ─────────────────────────────────────────────────────────────────────────────
function slide112(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log 收集架構：Sidecar 模式 vs DaemonSet 模式",
    partLabel: "PART 8 LOGS  · 112 / 150",
    accentColor: COLORS.container,
  });

  // Left: DaemonSet
  slide.addText("🔵 DaemonSet 模式（推薦）", {
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

  slide.addText("✅ 1個 Collector = 1個Node | 輕量 | 所有Pod共享", {
    x: 0.4, y: 4.52, w: 4.1, h: 0.3,
    fontSize: 10, color: COLORS.success, fontFace: FONTS.body,
  });

  // Right: Sidecar
  slide.addText("🟡 Sidecar 模式（特殊場景）", {
    x: 5.2, y: 0.65, w: 4.4, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.warning, fontFace: FONTS.body,
  });

  addZoneBorder(slide, pres, { x: 5.1, y: 1.0, w: 4.5, h: 1.85, color: COLORS.warning, label: "Pod (with sidecar)" });
  addMiniNode(slide, pres, { x: 5.3, y: 1.38, emoji: "⚙️", label: "App\nContainer", borderColor: COLORS.backend, w: 1.5 });
  addMiniNode(slide, pres, { x: 7.25, y: 1.38, emoji: "🔄", label: "Fluent Bit\nSidecar", borderColor: COLORS.warning, w: 1.5 });
  addHArrow(slide, pres, { x: 6.85, y: 1.78, label: "shared\nvolume", color: COLORS.warning, w: 0.38 });

  const useCases = [
    { text: "適合：需要每個 App 有自己的 Log 格式設定", fill: COLORS.bg2, border: COLORS.border, color: COLORS.text },
    { text: "適合：寫到檔案的 legacy app（不改 code）", fill: COLORS.bg2, border: COLORS.border, color: COLORS.text },
    { text: "⚠️ 缺點：每個 Pod 多一個 sidecar container（資源×2）", fill: COLORS.cardWarn, border: COLORS.warning, color: COLORS.warning },
    { text: "⚠️ 缺點：設定複雜，難統一管理", fill: COLORS.cardWarn, border: COLORS.warning, color: COLORS.warning },
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
    text: "K8s 環境 99% 用 DaemonSet (Fluent Bit) — 除非你有 legacy app 無法改為 stdout 輸出",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 113 — ELK / EFK Stack 架構
// ─────────────────────────────────────────────────────────────────────────────
function slide113(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "ELK / EFK Stack：業界最廣泛的 Log 集中管理方案",
    partLabel: "PART 8 LOGS  · 113 / 150",
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
  slide.addText("Logstash → Fluentd（更輕量，CNCF 標準）", {
    x: 0.45, y: 3.94, w: 4.0, h: 0.28,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Loki alternative
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.85, y: 3.62, w: 4.85, h: 0.65, rectRadius: 0.08,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.success, width: 1.2 },
  });
  slide.addText("🆕 Grafana Loki：輕量替代方案", {
    x: 5.0, y: 3.66, w: 4.5, h: 0.28,
    fontSize: 11, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("標籤式索引（不全文索引）→ 儲存成本降低 90%", {
    x: 5.0, y: 3.94, w: 4.5, h: 0.28,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  addTipBar(slide, pres, {
    y: 4.45,
    text: "ELK 強大但貴 (Elasticsearch 儲存成本高)；Loki 便宜但搜尋較弱 — 根據預算和查詢需求選擇",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 114 — Fluentd / Fluent Bit 工作原理
// ─────────────────────────────────────────────────────────────────────────────
function slide114(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Fluentd / Fluent Bit：Log 收集管線的瑞士刀",
    partLabel: "PART 8 LOGS  · 114 / 150",
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
  slide.addText("⬇️ INPUT 插件", {
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
  slide.addText("🔧 FILTER 插件", {
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
  slide.addText("⬆️ OUTPUT 插件", {
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
  slide.addText("比較項目  |  Fluentd  |  Fluent Bit", {
    x: 5.85, y: 0.75, w: 3.65, h: 0.3,
    fontSize: 9, bold: true, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
  });
  const tableRows = [
    "語言  |  Ruby  |  C/Rust (輕量)",
    "記憶體  |  ~40MB  |  ~650KB(!)",
    "Plugin  |  1000+  |  70+",
    "適合  |  伺服器  |  K8s DaemonSet",
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
    text: "Fluent Bit 在 K8s 中幾乎是標準配置 — 只佔 650KB 記憶體，每個 Node 跑一個，自動收集所有 Container Log",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 115 — Grafana Loki：Label-based Log 管理
// ─────────────────────────────────────────────────────────────────────────────
function slide115(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Grafana Loki：像 Prometheus 一樣管理 Log",
    partLabel: "PART 8 LOGS  · 115 / 150",
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
      label: "索引方式",
      left: "Elasticsearch: 全文索引\n儲存成本高",
      leftFill: COLORS.cardWarn, leftBorder: COLORS.warning,
      right: "Loki: 只索引 Labels\n儲存成本低 90%",
      rightFill: COLORS.cardSuccess, rightBorder: COLORS.success,
    },
    {
      label: "搜尋能力",
      left: "全文任意搜尋，非常強大",
      leftFill: COLORS.bg2, leftBorder: COLORS.border,
      right: "LogQL 查詢，需要有 label",
      rightFill: COLORS.bg2, rightBorder: COLORS.border,
    },
    {
      label: "整合",
      left: "Kibana (需另外安裝)",
      leftFill: COLORS.bg2, leftBorder: COLORS.border,
      right: "Grafana 原生支援（一站式）",
      rightFill: COLORS.bg2, rightBorder: COLORS.border,
    },
    {
      label: "成本",
      left: "💰 昂貴（EC2 + Disk 開銷大）",
      leftFill: COLORS.cardDanger, leftBorder: COLORS.danger,
      right: "💚 便宜（S3 儲存 log data）",
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
  slide.addText("選 Loki：有 Grafana 生態、成本敏感、logs 主要按 service/namespace 查", {
    x: 0.45, y: 3.52, w: 4.1, h: 0.35,
    fontSize: 10, color: COLORS.success, fontFace: FONTS.body, valign: "middle",
  });
  slide.addText("選 ES：需要複雜全文搜尋、已有 Elastic 投資", {
    x: 0.45, y: 3.86, w: 4.1, h: 0.3,
    fontSize: 9, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // Right: LogQL + architecture
  addCodeCard(slide, pres, {
    x: 5.15, y: 0.72, w: 4.55, h: 2.28,
    language: "LogQL Examples",
    code: '# 1. 過濾特定 service 的 ERROR log\n{service="payment-svc", env="prod"}\n  |= "ERROR"\n\n# 2. 解析 JSON + 過濾欄位\n{service="api"}\n  | json\n  | status >= 500\n\n# 3. 計算每分鐘錯誤率\nsum(rate({service="api"} |= "ERROR" [1m]))\n  by (service)\n\n# 4. 用 trace_id 找關聯 log\n{namespace="prod"}\n  |= `trace_id="abc-123-xyz"`',
  });

  addNodeCard(slide, pres, { x: 5.15, y: 3.12, w: 2.1, h: 1.2, emoji: "🔄", name: "Promtail\nAgent", meta: "push logs\n(DaemonSet)", borderColor: COLORS.warning });
  addHArrow(slide, pres, { x: 7.3, y: 3.62, label: "push", color: COLORS.success, w: 0.42 });
  addNodeCard(slide, pres, { x: 7.8, y: 3.12, w: 2.0, h: 1.2, emoji: "📋", name: "Grafana\nLoki", meta: "label index\n+ S3 storage", borderColor: COLORS.success });

  addTipBar(slide, pres, {
    y: 4.45,
    text: "Loki 的理念：只索引 Label（service, env, pod），log 正文存 S3 — 省錢但犧牲全文搜尋彈性",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 116 — Log 取樣策略與成本控制
// ─────────────────────────────────────────────────────────────────────────────
function slide116(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log 取樣策略：在完整性與成本之間取得平衡",
    partLabel: "PART 8 LOGS  · 116 / 150",
    accentColor: COLORS.warning,
  });

  // Volume problem stats
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.65, w: 4.4, h: 1.28, rectRadius: 0.08,
    fill: { color: COLORS.cardWarn },
    line: { color: COLORS.warning, width: 1.5 },
  });
  slide.addText("典型系統的 Log 量", {
    x: 0.3, y: 0.68, w: 4.4, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.warning, fontFace: FONTS.body, align: "center",
  });
  slide.addText("50 微服務 × 1000 req/s × avg 3 log lines × 500 bytes", {
    x: 0.3, y: 1.0, w: 4.4, h: 0.3,
    fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body, align: "center",
  });
  slide.addText("= 75 MB/s = 6.5 TB/天 = 195 TB/月 💸", {
    x: 0.3, y: 1.3, w: 4.4, h: 0.55,
    fontSize: 12, bold: true, color: COLORS.danger, fontFace: FONTS.body, align: "center", valign: "middle",
  });

  // 4 sampling strategies
  const strategies = [
    { title: "① 100% 記錄 Errors", desc: "所有 ERROR 都保留 — 不取樣，成本可接受", fill: COLORS.cardSuccess, border: COLORS.success },
    { title: "② N% 取樣 Success", desc: "正常請求只記 10% — 統計上夠用，省 90% 成本", fill: COLORS.bg2, border: COLORS.accent },
    { title: "③ Head-based 取樣", desc: "請求開始時決定：如果 trace 被取樣，所有 log 都保留", fill: COLORS.bg2, border: COLORS.accent },
    { title: "④ Dynamic 取樣", desc: "新型 trace_id 全保留，重複 pattern 降取樣率", fill: COLORS.bg2, border: COLORS.infra },
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
  slide.addText("Log 保留政策 (ILM)", {
    x: 5.2, y: 0.68, w: 4.4, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  const tiers = [
    { title: "🔥 Hot (0-7天)", desc: "SSD 儲存、快速查詢 | 最近發生的問題 | 最貴", fill: COLORS.cardSuccess, border: COLORS.success, titleColor: COLORS.success },
    { title: "⚡ Warm (7-30天)", desc: "HDD 儲存 | 本月事件 | 中等成本", fill: COLORS.cardWarn, border: COLORS.warning, titleColor: COLORS.warning },
    { title: "❄️ Cold (30天以上)", desc: "S3/GCS 物件儲存 | 合規/審計用 | 極低成本", fill: COLORS.bg2, border: COLORS.textMuted, titleColor: COLORS.textMuted },
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
    code: "[FILTER]\n  Name     grep\n  Match    *\n  # 只保留 ERROR 和 WARN\n  Regex    level ^(ERROR|WARN)$\n\n[FILTER]\n  Name     sampling\n  Match    *\n  # 每 10 條 INFO 保留 1 條\n  Rate     0.1\n  Condition  level INFO",
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Log 成本控制三原則：ERROR 100% 保留、INFO 取樣 10%、DEBUG 不進 Production",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 117 — Log 查詢與分析實戰
// ─────────────────────────────────────────────────────────────────────────────
function slide117(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log 查詢實戰：從混亂到洞察只需幾個指令",
    partLabel: "PART 8 LOGS  · 117 / 150",
    accentColor: COLORS.accent,
  });

  addCodeCard(slide, pres, {
    x: 0.3, y: 0.65, w: 9.4, h: 4.62,
    language: "Log Query Examples (Kibana KQL / Loki LogQL)",
    code: '# ===== Kibana KQL =====\n\n# 1. 找特定服務最近 1 小時的 ERROR\nservice:"payment-svc" AND level:ERROR\n\n# 2. 找特定用戶的所有操作（審計）\nuser_id:"user-789" AND @timestamp:[now-24h TO now]\n\n# 3. 找高延遲請求 (>1000ms)\nservice:"api" AND duration_ms:>1000\n\n# 4. 找特定 trace 的所有相關 log\ntrace_id:"abc-123-xyz"\n\n\n# ===== Grafana LogQL (Loki) =====\n\n# 5. 統計每個服務的錯誤率 (per minute)\nsum by(service) (\n  rate({namespace="prod"} |= "ERROR" [1m])\n)\n\n# 6. 從 JSON log 提取欄位並過濾\n{service="order-svc"}\n  | json\n  | duration_ms > 500\n  | line_format "{{.user_id}} took {{.duration_ms}}ms"\n\n# 7. 找最慢的 API endpoints\ntopk(10,\n  sum by(path) (rate({service="api"}\n    | json | duration_ms > 0 [5m])\n  )\n)',
  });

  addTipBar(slide, pres, {
    y: 5.38,
    text: "在 Grafana 裡可以從 Metrics 告警直接跳到 Logs（Explore），再跳到 Traces — 這就是可觀測性的魔力",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 118 — Log-based 告警
// ─────────────────────────────────────────────────────────────────────────────
function slide118(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log-based 告警：讓 Log 不只是被動紀錄",
    partLabel: "PART 8 LOGS  · 118 / 150",
    accentColor: COLORS.danger,
  });

  // Left: alert types
  slide.addText("Log 告警三種模式", {
    x: 0.4, y: 0.68, w: 4.6, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  const modes = [
    { title: "🔴 關鍵字告警", desc: "Log 出現 CRITICAL / OOM / panic → 立即告警", border: COLORS.danger },
    { title: "🟡 頻率告警 (Rate Alert)", desc: "1分鐘內 ERROR > 50 條 → 代表事情不對勁", border: COLORS.warning },
    { title: "🔵 缺失告警 (Absence Alert)", desc: "健康檢查 log 5分鐘沒出現 → 服務可能掛了", border: COLORS.accent },
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
  slide.addText("📊 從 Log 提取 Metrics", {
    x: 5.3, y: 3.26, w: 4.2, h: 0.32,
    fontSize: 11, bold: true, color: COLORS.success, fontFace: FONTS.body,
  });
  slide.addText("Loki 可以從 Log 即時計算 Metrics\n不需要在 App 裡多加 Prometheus client\n→ 適合 Legacy App 快速補 Metrics", {
    x: 5.3, y: 3.6, w: 4.2, h: 1.12,
    fontSize: 9.5, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  addTipBar(slide, pres, {
    y: 4.98,
    text: "Log 告警比 Metric 告警更 context-rich — 告警訊息可以直接附上 log 內容，On-Call 一眼看到問題",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 119 — Log 最佳實踐清單
// ─────────────────────────────────────────────────────────────────────────────
function slide119(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Log 工程最佳實踐：讓 Log 真正有價值",
    partLabel: "PART 8 LOGS  · 119 / 150",
    accentColor: COLORS.success,
  });

  // Left: DOs
  addCompareHeading(slide, pres, {
    x: 0.3, y: 0.62, w: 4.4,
    label: "✅ Log 的正確做法",
    type: "good",
  });

  const dos = [
    { title: "✅ 統一輸出到 stdout", desc: "容器化環境的標準，K8s/Docker 自動處理" },
    { title: "✅ 使用結構化 JSON 格式", desc: "機器可讀，Kibana/Loki 可自動解析欄位" },
    { title: "✅ 每條 Log 帶 trace_id / correlation_id", desc: "串聯跨服務請求，一個 ID 追蹤所有相關 Log" },
    { title: "✅ 包含必要 Context", desc: "user_id, service, version, env, duration_ms" },
    { title: "✅ Error Log 帶完整 Stack Trace", desc: "不要只記 message，要記 exception chain" },
    { title: "✅ 設定合理的 Log Level", desc: "Production: INFO+，DEBUG 只在需要時開" },
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
    label: "❌ Log 的錯誤做法",
    type: "bad",
  });

  const donts = [
    { title: "❌ Log 敏感資料", desc: "密碼、信用卡號、個人資料 — GDPR 違規！", fill: COLORS.cardDanger, border: COLORS.danger, color: COLORS.danger },
    { title: "❌ DEBUG Log 留在 Production", desc: "效能問題 + 儲存成本爆炸", fill: COLORS.cardDanger, border: COLORS.danger, color: COLORS.danger },
    { title: "❌ catch(e) { logger.error('error') }", desc: "沒有 context，無法除錯", fill: COLORS.cardDanger, border: COLORS.danger, color: COLORS.danger },
    { title: "❌ Log 但不看", desc: "收集了大量 Log 但沒有 Dashboard 或告警", fill: COLORS.cardWarn, border: COLORS.warning, color: COLORS.warning },
    { title: "❌ 每個 request 都 Log 全部欄位", desc: "無取樣策略 → 儲存成本 ×10", fill: COLORS.cardWarn, border: COLORS.warning, color: COLORS.warning },
    { title: "❌ 只記錯誤，不記成功", desc: "無法分析正常流量 pattern", fill: COLORS.cardWarn, border: COLORS.warning, color: COLORS.warning },
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
    text: "最重要的 Log 原則：每一條 Log 都要有讀的人 — 寫了沒人看的 Log 是浪費，告警和 Dashboard 才是目的",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 120 — Logs 章節小結
// ─────────────────────────────────────────────────────────────────────────────
function slide120(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Logs 小結：從事件記錄到系統洞察",
    partLabel: "PART 8 LOGS  · 120 / 150",
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
      title: "📋 結構化優先",
      items: "JSON 格式\n機器可讀\ntrace_id 必帶\n包含足夠 context\n不含敏感資料",
    },
    {
      x: 3.45, color: COLORS.container,
      title: "🔄 DaemonSet 收集",
      items: "K8s 環境標準:\nFluent Bit DaemonSet\n自動收集 stdout\n自動加 k8s metadata\n送 Loki 或 ES",
    },
    {
      x: 6.6, color: COLORS.danger,
      title: "💰 成本控制",
      items: "ERROR → 100% 保留\nINFO → 10% 取樣\nDEBUG → 不進 Prod\nHot/Warm/Cold 分層\nLoki 比 ES 省 90%",
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
