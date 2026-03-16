// src/part4.js
// Part 4: 12-Factor App (Slides 27–34)
"use strict";

const fs      = require("fs");
const pptxgen = require("pptxgenjs");
const { COLORS, FONTS } = require("./design-system");
const {
  W, H, HEADER_H, BOTTOM_Y,
  initSlide, addSlideHeader, addBottomPanel,
  addNodeCard, addMiniNode, addHArrow, addVArrow, addZoneBorder,
  addAlertBar, addTipBar, addCompareHeading, addCompareItem,
  addSummaryCard, addMetricCard, addThreeCols, addCodeCard,
} = require("./helpers");

// ─────────────────────────────────────────────────────────────────────────────
// Slide 27 — 12-Factor App 介紹
// ─────────────────────────────────────────────────────────────────────────────
function slide27(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "12-Factor App：現代應用的設計原則",
    partLabel: "PART 4  ·  27 / 50",
    accentColor: COLORS.accent,
  });

  slide.addText("12-Factor App 是什麼？", {
    x: 0.3, y: 0.62, w: 9.4, h: 0.28,
    fontSize: 15, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  slide.addText("由 Heroku 工程師總結的 12 條準則，讓應用程式能在 Cloud Native 環境中良好運作", {
    x: 0.3, y: 0.95, w: 9.4, h: 0.28,
    fontSize: 10, color: COLORS.textMuted, fontFace: FONTS.body,
  });

  // 12-factor grid: 4 rows × 3 cols
  const factors = [
    // Row 1 — accent
    { num: "①", name: "Codebase",         sub: "One codebase → many deploys",           color: COLORS.accent },
    { num: "②", name: "Dependencies",     sub: "Explicit dep declaration",               color: COLORS.accent },
    { num: "③", name: "Config",           sub: "Config in environment vars",             color: COLORS.accent },
    // Row 2 — infra
    { num: "④", name: "Backing Services", sub: "Treat DB/MQ/Cache as attached resources", color: COLORS.infra },
    { num: "⑤", name: "Build/Release/Run",sub: "Strict build → release → run stages",    color: COLORS.infra },
    { num: "⑥", name: "Processes",        sub: "Stateless processes",                    color: COLORS.infra },
    // Row 3 — success
    { num: "⑦", name: "Port Binding",     sub: "Self-contained: export via port",        color: COLORS.success },
    { num: "⑧", name: "Concurrency",      sub: "Scale via process model",                color: COLORS.success },
    { num: "⑨", name: "Disposability",    sub: "Fast startup, graceful shutdown",        color: COLORS.success },
    // Row 4 — warning
    { num: "⑩", name: "Dev/Prod Parity",  sub: "Dev environment mirrors production",     color: COLORS.warning },
    { num: "⑪", name: "Logs",             sub: "Logs as event streams (stdout)",          color: COLORS.warning },
    { num: "⑫", name: "Admin Processes",  sub: "Admin as one-off processes",             color: COLORS.warning },
  ];

  const cellW = 2.9;
  const cellH = 0.78;
  const startY = 1.3;
  const rowGap = 0.88;
  const colXs = [0.3, 3.4, 6.5];

  factors.forEach((f, idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const cx = colXs[col];
    const cy = startY + row * rowGap;

    slide.addShape(pres.ShapeType.roundRect, {
      x: cx, y: cy, w: cellW, h: cellH, rectRadius: 0.08,
      fill: { color: COLORS.bg2 },
      line: { color: f.color, width: 1.2 },
    });

    slide.addText(`${f.num} ${f.name}`, {
      x: cx + 0.12, y: cy + 0.05, w: cellW - 0.2, h: 0.28,
      fontSize: 11, bold: true, color: f.color, fontFace: FONTS.body,
    });

    slide.addText(f.sub, {
      x: cx + 0.12, y: cy + 0.32, w: cellW - 0.2, h: 0.38,
      fontSize: 8.5, color: COLORS.textMuted, fontFace: FONTS.body,
    });
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "這 12 條原則不是規定，是建議 — 但遵循它們能讓你的 App 在 Container/Cloud 環境中自然地運作",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 28 — Factor 1-3: Codebase, Dependencies, Config
// ─────────────────────────────────────────────────────────────────────────────
function slide28(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Factor 1-3：Codebase、Dependencies、Config",
    partLabel: "PART 4  ·  28 / 50",
    accentColor: COLORS.accent,
  });

  const cols = [
    {
      title: "① Codebase", icon: "📁", color: COLORS.accent,
      items: [
        { text: "一個 Repo = 一個應用",     sub: "不要把多個應用混在同一個 repo" },
        { text: "多個環境 = 同一份 code" },
        { text: "分支策略：main/dev/feature", sub: "main 永遠對應 Prod" },
        { text: "❌ 每個環境不同 branch" },
      ],
    },
    {
      title: "② Dependencies", icon: "📦", color: COLORS.infra,
      items: [
        { text: "顯式宣告所有依賴",           sub: "requirements.txt / package.json / go.mod" },
        { text: "不依賴 System-Level 套件",   sub: "不能假設主機有 curl 或 zip" },
        { text: "Container 完美符合此條",     sub: "Dockerfile 即依賴清單" },
        { text: "❌ pip install 沒有版本號" },
      ],
    },
    {
      title: "③ Config", icon: "⚙️", color: COLORS.warning,
      items: [
        { text: "設定放在環境變數",            sub: "DB_URL, API_KEY, PORT..." },
        { text: "✅ os.getenv('DB_URL')",     sub: "✅ Kubernetes ConfigMap/Secret" },
        { text: "❌ 設定寫死在程式碼",         sub: "❌ config.dev.py / config.prod.py" },
        { text: "Config 不進版本控管" },
      ],
    },
  ];

  addThreeCols(slide, pres, cols, { y: HEADER_H + 0.1, h: H - HEADER_H - 0.55 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Config 放環境變數是 12-Factor 最重要的一條 — 讓同一個 Image 在 dev/staging/prod 都能跑",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 29 — Factor 4-6: Backing Services, Build/Release/Run, Processes
// ─────────────────────────────────────────────────────────────────────────────
function slide29(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Factor 4-6：Backing Services、Build/Release/Run、Processes",
    partLabel: "PART 4  ·  29 / 50",
    accentColor: COLORS.infra,
  });

  const cols = [
    {
      title: "④ Backing Services", icon: "🔌", color: COLORS.database,
      items: [
        { text: "資料庫/MQ/Cache = 附加服務" },
        { text: "本地 = 第三方服務，同等對待", sub: "換 DB 只需換 URL" },
        { text: "透過 URL/credential 存取" },
        { text: "❌ 直接 localhost:5432" },
        { text: "✅ DB_URL env var" },
      ],
    },
    {
      title: "⑤ Build/Release/Run", icon: "🏗️", color: COLORS.accent,
      items: [
        { text: "Build：原始碼 → 可執行包" },
        { text: "Release：Build + Config", sub: "打上版本號，不可變" },
        { text: "Run：執行特定 Release" },
        { text: "三個階段嚴格分離" },
        { text: "Release 不可被修改" },
      ],
    },
    {
      title: "⑥ Processes", icon: "🔄", color: COLORS.success,
      items: [
        { text: "Process 必須是 Stateless" },
        { text: "無狀態 = 可隨時增減",         sub: "這就是 Scale Out 的前提！" },
        { text: "Session/State → 外部儲存",   sub: "Redis / DB" },
        { text: "❌ 本地檔案系統存 Session" },
        { text: "✅ JWT + Redis" },
      ],
    },
  ];

  addThreeCols(slide, pres, cols, { y: HEADER_H + 0.1, h: H - HEADER_H - 0.55 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Stateless Process (Factor 6) 是 Scale Out 的基石 — 沒有這條，水平擴展就是夢",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 30 — Factor 7-9: Port Binding, Concurrency, Disposability
// ─────────────────────────────────────────────────────────────────────────────
function slide30(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Factor 7-9：Port Binding、Concurrency、Disposability",
    partLabel: "PART 4  ·  30 / 50",
    accentColor: COLORS.success,
  });

  const cols = [
    {
      title: "⑦ Port Binding", icon: "🔌", color: COLORS.frontend,
      items: [
        { text: "應用自帶 HTTP Server" },
        { text: "透過 Port 對外提供服務",       sub: "不需要外部 Apache/Nginx 才能跑" },
        { text: "✅ Flask/FastAPI/Express" },
        { text: "容器化天然符合此條" },
        { text: "PORT=8080 環境變數控制" },
      ],
    },
    {
      title: "⑧ Concurrency", icon: "⚡", color: COLORS.accent,
      items: [
        { text: "透過 Process 類型 Scale" },
        { text: "Web Process × N = Scale Out" },
        { text: "Worker Process = 非同步任務" },
        { text: "不同類型可獨立 Scale",         sub: "Web × 5, Worker × 2" },
        { text: "Kubernetes Deployment 完美支援" },
      ],
    },
    {
      title: "⑨ Disposability", icon: "🔄", color: COLORS.success,
      items: [
        { text: "Process 要能快速啟動",          sub: "目標 < 10 秒" },
        { text: "優雅關閉 (Graceful Shutdown)" },
        { text: "接到 SIGTERM → 完成當前請求再關" },
        { text: "Crash 也沒關係 — 快速重啟" },
        { text: "Container + K8s 完美搭配" },
      ],
    },
  ];

  addThreeCols(slide, pres, cols, { y: HEADER_H + 0.1, h: H - HEADER_H - 0.55 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Disposability 讓 Kubernetes 可以隨時 kill/restart 你的 Container — 不用怕，設計好就沒問題",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 31 — Factor 10-12: Dev/Prod Parity, Logs, Admin Processes
// ─────────────────────────────────────────────────────────────────────────────
function slide31(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Factor 10-12：Dev/Prod Parity、Logs、Admin Processes",
    partLabel: "PART 4  ·  31 / 50",
    accentColor: COLORS.warning,
  });

  const cols = [
    {
      title: "⑩ Dev/Prod Parity", icon: "🔄", color: COLORS.warning,
      items: [
        { text: "Dev 環境要盡量接近 Prod" },
        { text: "❌ Dev 用 SQLite, Prod 用 Postgres" },
        { text: "✅ Docker Compose 模擬全部服務" },
        { text: "縮短 Dev → Deploy 週期" },
        { text: "Container 讓 Parity 變容易" },
      ],
    },
    {
      title: "⑪ Logs", icon: "📋", color: COLORS.infra,
      items: [
        { text: "Log 輸出到 stdout/stderr" },
        { text: "不要自己處理 Log 檔案" },
        { text: "由平台收集 (FluentD, CloudWatch)" },
        { text: "結構化 Log (JSON)",              sub: "方便搜尋與分析" },
        { text: "kubectl logs / docker logs" },
      ],
    },
    {
      title: "⑫ Admin Processes", icon: "🛠️", color: COLORS.accent,
      items: [
        { text: "一次性管理任務 = 獨立 Process" },
        { text: "DB Migration: kubectl exec" },
        { text: "Data Cleanup: 獨立 Job" },
        { text: "與 App 一起打包進 Image" },
        { text: "❌ 直接 SSH 進 Prod 機器跑" },
      ],
    },
  ];

  addThreeCols(slide, pres, cols, { y: HEADER_H + 0.1, h: H - HEADER_H - 0.55 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Logs as streams (Factor 11) 讓 ELK Stack / CloudWatch 可以集中管理所有 Container 的 log",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 32 — Container vs 12-Factor 對照
// ─────────────────────────────────────────────────────────────────────────────
function slide32(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Container 天然符合 12-Factor App 原則",
    partLabel: "PART 4  ·  32 / 50",
    accentColor: COLORS.container,
  });

  // Table header
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.3, y: 0.62, w: 9.4, h: 0.38, rectRadius: 0.06,
    fill: { color: COLORS.bg3 },
    line: { color: COLORS.border, width: 0.8 },
  });
  slide.addText("Factor", {
    x: 0.5, y: 0.62, w: 3.0, h: 0.38,
    fontSize: 9.5, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });
  slide.addText("Container / Docker 的支援", {
    x: 3.6, y: 0.62, w: 4.5, h: 0.38,
    fontSize: 9.5, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });
  slide.addText("程度", {
    x: 8.25, y: 0.62, w: 1.3, h: 0.38,
    fontSize: 9.5, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });

  const rows = [
    { num: "①", name: "Codebase",          support: "Dockerfile in repo",                    color: COLORS.accent },
    { num: "②", name: "Dependencies",      support: "Dockerfile + requirements.txt",          color: COLORS.accent },
    { num: "③", name: "Config",            support: "ENV in docker-compose / K8s Secret",     color: COLORS.accent },
    { num: "④", name: "Backing Services",  support: "docker-compose services",                color: COLORS.database },
    { num: "⑤", name: "Build/Release/Run", support: "docker build → tag → run",              color: COLORS.infra },
    { num: "⑥", name: "Processes",         support: "Stateless Container = Scale Out",        color: COLORS.infra },
    { num: "⑦", name: "Port Binding",      support: "EXPOSE + -p flag",                       color: COLORS.frontend },
    { num: "⑧", name: "Concurrency",       support: "docker run ×N / K8s replicas",           color: COLORS.accent },
    { num: "⑨", name: "Disposability",     support: "Container 快速啟動/關閉",                  color: COLORS.success },
    { num: "⑩", name: "Dev/Prod Parity",   support: "同一個 Image，環境一致",                   color: COLORS.warning },
    { num: "⑪", name: "Logs",              support: "docker logs / stdout",                   color: COLORS.warning },
    { num: "⑫", name: "Admin Processes",   support: "docker exec / K8s Job",                  color: COLORS.accent },
  ];

  const startY = 1.02;
  const rowGap = 0.35;
  const rowH   = 0.33;

  rows.forEach((row, i) => {
    const ry  = startY + i * rowGap;
    const bg  = i % 2 === 0 ? COLORS.bg2 : COLORS.bg;

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.3, y: ry, w: 9.4, h: rowH, rectRadius: 0.05,
      fill: { color: bg },
      line: { color: COLORS.border, width: 0.4 },
    });

    slide.addText(`${row.num} ${row.name}`, {
      x: 0.5, y: ry, w: 3.0, h: rowH,
      fontSize: 9.5, bold: true, color: row.color, fontFace: FONTS.body, valign: "middle",
    });

    slide.addText(row.support, {
      x: 3.6, y: ry, w: 4.5, h: rowH,
      fontSize: 9, color: COLORS.text, fontFace: FONTS.body, valign: "middle",
    });

    slide.addText("✅", {
      x: 8.25, y: ry, w: 1.3, h: rowH,
      fontSize: 12, color: COLORS.success, fontFace: FONTS.body,
      align: "center", valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Container 不只解決了環境一致問題 — 它幾乎完美地支援了所有 12-Factor App 的原則",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 33 — 12-Factor 實戰：一個 API Service
// ─────────────────────────────────────────────────────────────────────────────
function slide33(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "12-Factor 實戰：一個符合規範的 FastAPI Service",
    partLabel: "PART 4  ·  33 / 50",
    accentColor: COLORS.container,
  });

  // Left: code cards
  addCodeCard(slide, pres, {
    x: 0.3, y: 0.65, w: 4.6, h: 1.4,
    language: "main.py",
    code: "import os\nfrom fastapi import FastAPI\n\napp = FastAPI()\nDB_URL = os.getenv('DATABASE_URL')  # Factor 3\n\n@app.get('/health')\nasync def health():\n    return {'status': 'ok'}",
  });

  addCodeCard(slide, pres, {
    x: 0.3, y: 2.1, w: 4.6, h: 1.2,
    language: "Dockerfile",
    code: "FROM python:3.11-slim    # Factor 2\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nEXPOSE 8080               # Factor 7\nCMD [\"uvicorn\", \"main:app\", \"--port\", \"8080\"]",
  });

  addCodeCard(slide, pres, {
    x: 0.3, y: 3.35, w: 4.6, h: 1.55,
    language: "docker-compose.yml",
    code: "services:\n  api:\n    build: .\n    environment:\n      DATABASE_URL: postgresql://db/app  # Factor 3\n    ports: ['8080:8080']\n    depends_on: [db]\n  db:\n    image: postgres:16       # Factor 4",
  });

  // Right: factor compliance chips
  slide.addText("遵循了哪些 Factor？", {
    x: 5.2, y: 0.65, w: 4.6, h: 0.35,
    fontSize: 13, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  const chips = [
    // Col 1
    { text: "✅ Factor 2 — 依賴宣告",     col: 0, row: 0 },
    { text: "✅ Factor 3 — Config 環境變數", col: 0, row: 1 },
    { text: "✅ Factor 6 — Stateless",    col: 0, row: 2 },
    { text: "✅ Factor 9 — 快速啟動",      col: 0, row: 3 },
    // Col 2
    { text: "✅ Factor 4 — Backing Svc",  col: 1, row: 0 },
    { text: "✅ Factor 7 — Port Binding", col: 1, row: 1 },
    { text: "✅ Factor 10 — Dev/Prod Parity", col: 1, row: 2 },
    { text: "✅ Factor 11 — Stdout Log",  col: 1, row: 3 },
  ];

  const chipStartY = 1.1;
  const chipGap    = 0.65;
  const chipW      = 2.1;
  const chipH      = 0.55;
  const colXs      = [5.25, 7.5];

  chips.forEach((chip) => {
    const cx = colXs[chip.col];
    const cy = chipStartY + chip.row * chipGap;

    slide.addShape(pres.ShapeType.roundRect, {
      x: cx, y: cy, w: chipW, h: chipH, rectRadius: 0.08,
      fill: { color: COLORS.cardSuccess },
      line: { color: COLORS.success, width: 1.0 },
    });

    slide.addText(chip.text, {
      x: cx + 0.08, y: cy, w: chipW - 0.12, h: chipH,
      fontSize: 9, bold: true, color: COLORS.success, fontFace: FONTS.body,
      valign: "middle",
    });
  });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "一個符合 12-Factor 的 App 天然就是 Container-ready — 這就是現代 Cloud Native 應用的標配",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 34 — Part 4 小結
// ─────────────────────────────────────────────────────────────────────────────
function slide34(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Part 4 小結：設計優良的 Cloud Native 應用",
    partLabel: "PART 4  ·  34 / 50",
    accentColor: COLORS.accent,
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 0.65, w: 9.4, h: 1.32,
    icon: "📐",
    title: "12-Factor App 不是規定，是智慧結晶",
    items: [
      "Heroku 從數百個應用中提煉的最佳實踐",
      "每一條都解決了真實的工程痛點",
    ],
    color: COLORS.accent,
    status: "學習重點",
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 2.05, w: 9.4, h: 1.32,
    icon: "🐳",
    title: "Container 天然符合 12-Factor — 它們互相強化",
    items: [
      "用 Dockerfile 管理依賴 (Factor 2)",
      "用環境變數設定 (Factor 3)",
      "Stateless Process = Scale Out (Factor 6)",
    ],
    color: COLORS.container,
    status: "核心洞察",
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 3.45, w: 9.4, h: 1.32,
    icon: "🚀",
    title: "下一步：自動化這一切",
    items: [
      "手動 docker build/push 只是起點",
      "CI/CD Pipeline 讓每次 commit 自動部署",
      "→ Part 5: DevOps 與 CI/CD Pipeline",
    ],
    color: COLORS.success,
    status: "預告 Part 5",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync("output", { recursive: true });
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  for (const fn of [slide27, slide28, slide29, slide30, slide31, slide32, slide33, slide34]) {
    await fn(pres);
  }
  await pres.writeFile({ fileName: "output/part4.pptx" });
  console.log("part4.pptx created");
}

main().catch(console.error);
