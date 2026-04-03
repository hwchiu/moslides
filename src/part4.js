// src/part4.js
// Part 4: 12-Factor App (Slides 27–34)
"use strict";

const fs      = require("fs");
const pptxgen = require("pptxgenjs");
const { COLORS, FONTS, setTheme } = require("./design-system");
setTheme("light");
const {
  W, H, HEADER_H, BOTTOM_Y,
  initSlide, addSlideHeader, addBottomPanel,
  addNodeCard, addMiniNode, addHArrow, addVArrow, addZoneBorder,
  addAlertBar, addTipBar, addCompareHeading, addCompareItem,
  addSummaryCard, addMetricCard, addThreeCols, addCodeCard,
} = require("./helpers");

// ─────────────────────────────────────────────────────────────────────────────
// Slide 27 — 12-Factor App Introduction
// ─────────────────────────────────────────────────────────────────────────────
function slide27(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "12-Factor App: Modern Application Design Principles",
    partLabel: "PART 4",
    accentColor: COLORS.accent,
  });

  slide.addText("What is the 12-Factor App?", {
    x: 0.3, y: 0.62, w: 9.4, h: 0.28,
    fontSize: 15, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  slide.addText("12 principles distilled by Heroku engineers to help applications thrive in Cloud Native environments", {
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
    text: "These 12 principles are guidelines, not rules — but following them lets your app run naturally in Container/Cloud environments",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 28 — Factor 1-3: Codebase, Dependencies, Config
// ─────────────────────────────────────────────────────────────────────────────
function slide28(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Factor 1-3: Codebase, Dependencies, Config",
    partLabel: "PART 4",
    accentColor: COLORS.accent,
  });

  const cols = [
    {
      title: "① Codebase", icon: "📁", color: COLORS.accent,
      items: [
        { text: "One repo = One application",     sub: "Don't mix multiple apps in a single repo" },
        { text: "Multiple environments = Same codebase" },
        { text: "Branch strategy: main/dev/feature", sub: "main always maps to Prod" },
        { text: "❌ Different branch per environment" },
      ],
    },
    {
      title: "② Dependencies", icon: "📦", color: COLORS.infra,
      items: [
        { text: "Explicitly declare all dependencies",           sub: "requirements.txt / package.json / go.mod" },
        { text: "No system-level package assumptions",   sub: "Cannot assume host has curl or zip" },
        { text: "Containers perfectly satisfy this factor",     sub: "Dockerfile is your dependency manifest" },
        { text: "❌ pip install without version pinning" },
      ],
    },
    {
      title: "③ Config", icon: "⚙️", color: COLORS.warning,
      items: [
        { text: "Store config in environment variables",            sub: "DB_URL, API_KEY, PORT..." },
        { text: "✅ os.getenv('DB_URL')",     sub: "✅ Kubernetes ConfigMap/Secret" },
        { text: "❌ Hardcoded config in source code",         sub: "❌ config.dev.py / config.prod.py" },
        { text: "Config must not be committed to version control" },
      ],
    },
  ];

  addThreeCols(slide, pres, cols, { y: HEADER_H + 0.1, h: H - HEADER_H - 0.55 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Storing config in env vars is the most impactful 12-Factor rule — the same image runs across dev/staging/prod",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 29 — Factor 4-6: Backing Services, Build/Release/Run, Processes
// ─────────────────────────────────────────────────────────────────────────────
function slide29(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Factor 4-6: Backing Services, Build/Release/Run, Processes",
    partLabel: "PART 4",
    accentColor: COLORS.infra,
  });

  const cols = [
    {
      title: "④ Backing Services", icon: "🔌", color: COLORS.database,
      items: [
        { text: "DB/MQ/Cache = Attached resources" },
        { text: "Local and third-party services treated equally", sub: "Switching DB only requires changing the URL" },
        { text: "Access via URL/credential" },
        { text: "❌ Hardcoded localhost:5432" },
        { text: "✅ DB_URL env var" },
      ],
    },
    {
      title: "⑤ Build/Release/Run", icon: "🏗️", color: COLORS.accent,
      items: [
        { text: "Build: Source code → Executable artifact" },
        { text: "Release: Build + Config", sub: "Tagged with version, immutable" },
        { text: "Run: Execute a specific Release" },
        { text: "Three stages strictly separated" },
        { text: "Releases are immutable" },
      ],
    },
    {
      title: "⑥ Processes", icon: "🔄", color: COLORS.success,
      items: [
        { text: "Processes must be stateless" },
        { text: "Stateless = Can scale freely",         sub: "This is the prerequisite for Scale Out!" },
        { text: "Session/State → External storage",   sub: "Redis / DB" },
        { text: "❌ Storing sessions on local filesystem" },
        { text: "✅ JWT + Redis" },
      ],
    },
  ];

  addThreeCols(slide, pres, cols, { y: HEADER_H + 0.1, h: H - HEADER_H - 0.55 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Stateless Process (Factor 6) is the cornerstone of Scale Out — without it, horizontal scaling is impossible",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 30 — Factor 7-9: Port Binding, Concurrency, Disposability
// ─────────────────────────────────────────────────────────────────────────────
function slide30(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Factor 7-9: Port Binding, Concurrency, Disposability",
    partLabel: "PART 4",
    accentColor: COLORS.success,
  });

  const cols = [
    {
      title: "⑦ Port Binding", icon: "🔌", color: COLORS.frontend,
      items: [
        { text: "App includes its own HTTP server" },
        { text: "Exports services via port binding",       sub: "No external Apache/Nginx required to run" },
        { text: "✅ Flask/FastAPI/Express" },
        { text: "Containerization naturally satisfies this" },
        { text: "PORT=8080 controlled via env var" },
      ],
    },
    {
      title: "⑧ Concurrency", icon: "⚡", color: COLORS.accent,
      items: [
        { text: "Scale via process types" },
        { text: "Web Process × N = Scale Out" },
        { text: "Worker Process = Async tasks" },
        { text: "Each type scales independently",         sub: "Web × 5, Worker × 2" },
        { text: "Kubernetes Deployment supports this perfectly" },
      ],
    },
    {
      title: "⑨ Disposability", icon: "🔄", color: COLORS.success,
      items: [
        { text: "Processes must start quickly",          sub: "Target < 10 seconds" },
        { text: "Graceful Shutdown" },
        { text: "On SIGTERM → Finish current requests, then exit" },
        { text: "Crashes are fine — fast restart" },
        { text: "Container + K8s are a perfect match" },
      ],
    },
  ];

  addThreeCols(slide, pres, cols, { y: HEADER_H + 0.1, h: H - HEADER_H - 0.55 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Disposability lets Kubernetes kill/restart your containers at any time — design it right, and there's nothing to worry about",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 31 — Factor 10-12: Dev/Prod Parity, Logs, Admin Processes
// ─────────────────────────────────────────────────────────────────────────────
function slide31(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Factor 10-12: Dev/Prod Parity, Logs, Admin Processes",
    partLabel: "PART 4",
    accentColor: COLORS.warning,
  });

  const cols = [
    {
      title: "⑩ Dev/Prod Parity", icon: "🔄", color: COLORS.warning,
      items: [
        { text: "Dev environment should closely mirror Prod" },
        { text: "❌ Dev uses SQLite, Prod uses Postgres" },
        { text: "✅ Docker Compose to replicate all services" },
        { text: "Shorten the Dev → Deploy cycle" },
        { text: "Containers make parity easy" },
      ],
    },
    {
      title: "⑪ Logs", icon: "📋", color: COLORS.infra,
      items: [
        { text: "Output logs to stdout/stderr" },
        { text: "Don't manage log files yourself" },
        { text: "Let the platform collect them (FluentD, CloudWatch)" },
        { text: "Structured logs (JSON)",              sub: "Easy to search and analyze" },
        { text: "kubectl logs / docker logs" },
      ],
    },
    {
      title: "⑫ Admin Processes", icon: "🛠️", color: COLORS.accent,
      items: [
        { text: "One-off admin tasks = Separate process" },
        { text: "DB Migration: kubectl exec" },
        { text: "Data Cleanup: Dedicated Job" },
        { text: "Package admin scripts into the same Image" },
        { text: "❌ SSH into production machines directly" },
      ],
    },
  ];

  addThreeCols(slide, pres, cols, { y: HEADER_H + 0.1, h: H - HEADER_H - 0.55 });

  addTipBar(slide, pres, {
    y: 5.08,
    text: "Logs as streams (Factor 11) enables ELK Stack / CloudWatch to centrally manage all container logs",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 32 — Container vs 12-Factor Alignment
// ─────────────────────────────────────────────────────────────────────────────
function slide32(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Containers Naturally Align with 12-Factor App Principles",
    partLabel: "PART 4",
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
  slide.addText("Container / Docker Support", {
    x: 3.6, y: 0.62, w: 4.5, h: 0.38,
    fontSize: 9.5, bold: true, color: COLORS.textMuted, fontFace: FONTS.body, valign: "middle",
  });
  slide.addText("Level", {
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
    { num: "⑨", name: "Disposability",     support: "Containers start/stop quickly",              color: COLORS.success },
    { num: "⑩", name: "Dev/Prod Parity",   support: "Same image, consistent environments",       color: COLORS.warning },
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
    text: "Containers don't just solve environment consistency — they nearly perfectly support all 12-Factor App principles",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 33 — 12-Factor in Practice: An API Service
// ─────────────────────────────────────────────────────────────────────────────
function slide33(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "12-Factor in Practice: A Compliant FastAPI Service",
    partLabel: "PART 4",
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
  slide.addText("Which Factors are covered?", {
    x: 5.2, y: 0.65, w: 4.6, h: 0.35,
    fontSize: 13, bold: true, color: COLORS.accent, fontFace: FONTS.body,
  });

  const chips = [
    // Col 1
    { text: "✅ Factor 2 — Dep Declaration",     col: 0, row: 0 },
    { text: "✅ Factor 3 — Config via Env Vars", col: 0, row: 1 },
    { text: "✅ Factor 6 — Stateless",    col: 0, row: 2 },
    { text: "✅ Factor 9 — Fast Startup",      col: 0, row: 3 },
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
    text: "A 12-Factor compliant app is inherently container-ready — this is the standard for modern Cloud Native applications",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide 34 — Part 4 Summary
// ─────────────────────────────────────────────────────────────────────────────
function slide34(pres) {
  const slide = initSlide(pres);
  addSlideHeader(slide, pres, {
    title: "Part 4 Summary: Well-Designed Cloud Native Applications",
    partLabel: "PART 4",
    accentColor: COLORS.accent,
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 0.65, w: 9.4, h: 1.32,
    icon: "📐",
    title: "12-Factor App: Not Rules, but Distilled Wisdom",
    items: [
      "Best practices distilled from hundreds of apps by Heroku",
      "Each factor addresses a real-world engineering pain point",
    ],
    color: COLORS.accent,
    status: "Key Takeaway",
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 2.05, w: 9.4, h: 1.32,
    icon: "🐳",
    title: "Containers Naturally Align with 12-Factor — They Reinforce Each Other",
    items: [
      "Manage dependencies with Dockerfile (Factor 2)",
      "Configure via environment variables (Factor 3)",
      "Stateless Process = Scale Out (Factor 6)",
    ],
    color: COLORS.container,
    status: "Core Insight",
  });

  addSummaryCard(slide, pres, {
    x: 0.3, y: 3.45, w: 9.4, h: 1.32,
    icon: "🚀",
    title: "Next Step: Automate Everything",
    items: [
      "Manual docker build/push is just the beginning",
      "CI/CD Pipelines automate deployment on every commit",
      "→ Part 5: DevOps and CI/CD Pipelines",
    ],
    color: COLORS.success,
    status: "Part 5 Preview",
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
  for (const fn of [slide27, slide28, slide29, slide30, slide31, slide32, slide33, slide34]) {
    await fn(pres);
  }
  await pres.writeFile({ fileName: "output/part4.pptx" });
  console.log("part4.pptx created");
}

main().catch(console.error);
