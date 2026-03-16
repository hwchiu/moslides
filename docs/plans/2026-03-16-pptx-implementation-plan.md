# Cloud Native 投影片重設計 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 將 cloud_native_slides_v2.pptx 全面重設計為深色主題、專業架構圖、圖示化元件的 50 頁碩士課程投影片

**Architecture:** 使用 pptxgenjs 從頭建立，搭配 react-icons 渲染 PNG 圖示嵌入架構圖。以 Part 為單位分批產出，每批完成後轉圖片做視覺 QA。

**Tech Stack:** Node.js, pptxgenjs, react-icons, react, react-dom, sharp, LibreOffice, pdftoppm

---

## 設計系統常數

```javascript
// 在每個 Part 的檔案頂端 require 此模組
const COLORS = {
  bg: "0D1117",           // 背景
  text: "E6EDF3",         // 主要文字
  textMuted: "8B949E",    // 次要文字
  accent: "58A6FF",       // 強調色（電藍）
  success: "3FB950",      // 成功/解法（綠）
  danger: "F85149",       // 警告/痛點（紅）
  // 架構元件色
  frontend: "1F6FEB",
  backend: "238636",
  database: "E36209",
  infra: "6E40C9",        // LB/Cache/MQ
  container: "0D8A6C",
  client: "8B949E",
  cdn: "1A7F64",
  // 卡片背景
  cardBg: "161B22",
  cardSuccess: "0F2A1A",
  cardDanger: "2A0F0F",
};

const FONTS = {
  title: "Calibri",
  body: "Calibri",
  code: "Consolas",
};
```

## 圖示對應表

```javascript
// react-icons 圖示對應（統一使用 256px 渲染）
const ICONS = {
  browser:  { lib: "fa", name: "FaDesktop" },    // Client/Browser
  server:   { lib: "fa", name: "FaServer" },      // App Server
  database: { lib: "fa", name: "FaDatabase" },    // Database
  lb:       { lib: "md", name: "MdBalancer" },    // Load Balancer → FaNetworkWired
  cache:    { lib: "fa", name: "FaBolt" },        // Cache/Redis
  queue:    { lib: "fa", name: "FaList" },        // Message Queue
  cloud:    { lib: "fa", name: "FaCloud" },       // CDN/Internet
  docker:   { lib: "fa", name: "FaCube" },        // Container
  user:     { lib: "fa", name: "FaUser" },        // End user
  check:    { lib: "fa", name: "FaCheckCircle" }, // ✅
  warning:  { lib: "fa", name: "FaExclamationTriangle" }, // ⚠️
  arrow:    { lib: "fa", name: "FaArrowRight" },
};
```

---

## Task 0：環境建置

**Files:**
- Create: `src/design-system.js`
- Create: `src/icon-helper.js`

**Step 1: 安裝依賴**

```bash
cd /Users/hwchiu/hwchiu/moslides
npm init -y
npm install pptxgenjs react react-dom react-icons sharp
```

Expected: `node_modules/` 建立，無 error

**Step 2: 確認 soffice 可用**

```bash
python3 /Users/hwchiu/.claude/plugins/cache/anthropic-agent-skills/document-skills/b0cbd3df1533/skills/pptx/scripts/office/soffice.py --version
```

Expected: 版本號輸出 或 `soffice` 路徑確認

**Step 3: 建立 design-system.js**

```javascript
// src/design-system.js
const COLORS = {
  bg: "0D1117", text: "E6EDF3", textMuted: "8B949E",
  accent: "58A6FF", success: "3FB950", danger: "F85149",
  frontend: "1F6FEB", backend: "238636", database: "E36209",
  infra: "6E40C9", container: "0D8A6C", client: "8B949E",
  cdn: "1A7F64", cardBg: "161B22",
  cardSuccess: "0F2A1A", cardDanger: "2A0F0F",
};
const FONTS = { title: "Calibri", body: "Calibri", code: "Consolas" };
module.exports = { COLORS, FONTS };
```

**Step 4: 建立 icon-helper.js**

```javascript
// src/icon-helper.js
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

async function iconToBase64(IconComponent, color = "#FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
module.exports = { iconToBase64 };
```

**Step 5: Commit**

```bash
git add src/ package.json package-lock.json
git commit -m "feat: setup pptxgenjs project with design system and icon helper"
```

---

## Task 1：Part 1 投影片（Slides 1–12）

**Files:**
- Create: `src/part1.js`
- Output: `output/part1.pptx`

### Slide 1：封面（T1 封面頁）

```
背景：#0D1117
左側 40%：大型 "CLOUD NATIVE" 標題（accent 色，48pt bold）
副標題：系統部署實務（白色，24pt）
下方標籤列：碩士課程 · 2.5 小時 · 50 頁（灰色 12pt）
右側 60%：架構演進示意（小型方塊堆疊圖，從 1 個到多個）
底部細線：accent 色分隔
```

### Slide 2：課程大綱（T2 Part 開場）

```
左側：大型半透明 "00" 數字（120pt，accent 色 30% opacity）
右側：課程大綱標題 + 6 個 Part 條列（用 icon 圓圈 + Part 名稱）
Part 圓圈顏色對應該 Part 的主色
```

### Slide 3：最簡單的部署架構（T3 架構演進頁）

架構圖（上 65%）：
- FaUser icon（左端，灰色）→ 箭頭標 "HTTP" → FaDesktop（Browser，灰色）→ 箭頭 → FaServer（App Server，綠色，:8080）
- 複雜度進度條右上角：1/10

下方說明（下 35%）：
- 左欄綠卡：✅ 設定簡單 / 適合 PoC / Dev≈Prod
- 右欄紅卡：⚠️ 單點故障 / 無法高流量 / 資料遺失

### Slide 4：HTTP Request 旅程（T5 概念說明頁）

```
左側：FaGlobe 大圖示（accent 色）
右側：6 個步驟的流程，每步驟：
  - 帶數字的圓圈（①②③④⑤⑥，accent 色）
  - 步驟名稱（白色 bold）
  - 說明（灰色小字）
底部 💡 金句卡片
```

### Slide 5：DB 分離（T3 架構演進頁）

架構圖：
- FaDesktop（App Server，綠色）→ 標 "SQL" 箭頭 → FaDatabase（DB，橘色，:5432）
- 複雜度進度條：3/10

### Slide 6：三層架構（T3 架構演進頁）

架構圖（三欄並排）：
- FaGlobe（使用者）→
- FaServer（Frontend，Nginx，藍色）→
- FaServer（Backend，FastAPI，綠色）→
- FaDatabase（DB，PostgreSQL，橘色）
- 每個方塊下方標示職責（灰色小字）

### Slide 7：三層架構挑戰（T4 對比頁 / 改為 4 問題卡片）

```
2×2 卡片格：
① 部署順序地雷（紅框卡）
② 版本相依地獄（紅框卡）
③ 環境差異（紅框卡）
④ 單點故障（紅框卡）
每卡有 icon、標題、1-2 行說明
```

### Slide 8：找出瓶頸（T5 概念說明頁）

```
左側：FaSearch 大圖示
右側：5 種瓶頸列表（CPU/Memory/Disk/Network/DB）
每項：顏色圓圈 icon + 症狀 + 工具
底部：監控指標（P50/P95/P99 大字）
```

### Slide 9：何時需要 Scale（T5）

```
3 個大數字觸發條件卡片：
CPU > 70% | P99 > 1s | Error > 0.1%
下方：常見錯誤（過早 Scale）提示卡
```

### Slide 10：Scale Up vs Scale Out（T4 對比頁）

```
左欄（Scale Up）：
  - 單一 FaServer 大圖示（showing upgrade）
  - ✅ 快速 ✅ 不改程式 ⚠️ 成本 ⚠️ 有上限

右欄（Scale Out）：
  - 3 個 FaServer 並排小圖示
  - ✅ 彈性 ✅ 零停機 ⚠️ 需 Stateless
```

### Slide 11：Stateless 設計（T4 對比頁）

```
左欄（❌ Stateful）：
  - 圖：FaDesktop → LB(六邊形) → Server A / Server B（各自有 Session 圖示）
  - 說明：Request #2 找不到 Session → 被登出

右欄（✅ Stateless）：
  - 圖：FaDesktop → LB → Server A/B → FaBolt（Redis）
  - 說明：任一 Server 都能處理
```

### Slide 12：Part 1 小結（T7 小結頁）

```
4 格卡片：單機部署 / DB 分離 / 三層架構 / 需要 Scale Out
每卡：✅ 優點 / ⚠️ 問題
底部箭頭指向 Part 2
```

**Step 1: 建立 src/part1.js 並執行**

```bash
node src/part1.js
```

Expected: `output/part1.pptx` 建立，無 error

**Step 2: 轉換為圖片**

```bash
mkdir -p output/qa/part1
python3 /Users/hwchiu/.claude/plugins/cache/anthropic-agent-skills/document-skills/b0cbd3df1533/skills/pptx/scripts/office/soffice.py --headless --convert-to pdf output/part1.pptx --outdir output/qa/part1/
pdftoppm -jpeg -r 150 output/qa/part1/part1.pdf output/qa/part1/slide
```

Expected: `slide-01.jpg` ~ `slide-12.jpg` 產生

**Step 3: 視覺 QA（子 agent）**

使用子 agent 檢查所有圖片，確認：
- 無元素重疊、文字溢出
- 架構圖 icon 清晰可辨
- 顏色對比足夠
- 複雜度進度條正確顯示

**Step 4: 修正問題後 Commit**

```bash
git add src/part1.js output/part1.pptx
git commit -m "feat: add Part 1 slides (traditional deployment evolution)"
```

---

## Task 2：Part 2 投影片（Slides 13–20）

**Files:**
- Create: `src/part2.js`
- Output: `output/part2.pptx`

### Slide 13：Load Balancer（T3 架構演進頁）

```
架構圖：
FaDesktop（多個用戶）→ 六邊形 LB（紫色）→ Server 1/2/3（綠色，扇形排列）→ FaDatabase（橘色）
LB 旁標示 4 種演算法（小標籤）
複雜度進度條：5/10
```

### Slide 14：Session 問題（T4 對比頁）

```
左欄（❌）：
  圖：LB → Server1(有Session) / Server2(無Session)
  文字說明用戶被登出

右欄（✅ 3種解法）：
  ① Cookie-Based（FaCookie → 限制說明）
  ② Redis Session（FaBolt 紅色 → 說明）
  ③ JWT Token（FaKey → 說明）
```

### Slide 15：Read Replica（T3 架構演進頁）

```
架構圖：
Server 1/2/3 → Write → DB Primary（橘色大）
           → Read  → Replica 1/2/3（橘色小，右側）
Replication 箭頭（虛線）
複雜度進度條：6/10
```

### Slide 16：三層 Caching（T5 概念說明頁）

```
由外到內 3 個同心卡片：
① CDN（最外，FaCloud，深青）：靜態資源，TTL 天級
② Redis（中層，FaBolt，紅）：API 結果，TTL 分鐘
③ In-Process（最內，FaMicrochip，灰）：超熱資料，TTL 秒
```

### Slide 17：Message Queue（T4 對比頁）

```
左欄（❌ 同步）：
  圖：A → B → C 串聯，任一慢全慢

右欄（✅ MQ）：
  圖：Producer → FaList（Queue，紫色） → Consumer（多個，可獨立 Scale）
  3 個使用案例 icon 卡片
```

### Slide 18：完整分散式架構（T3，重點頁）

```
架構圖（複雜，全頁）：
Internet → FaCloud(CDN) → FaShieldAlt(WAF) → LB(六邊形)
→ Frontend Server 1/2/3 → LB → Backend 1/2/3
→ Redis / RabbitMQ / DB Primary + 3 Replica

底部紅色警告卡：❌ 需維護 15+ 台機器！
複雜度進度條：9/10（幾乎滿格，視覺衝擊）
```

### Slide 19：維運惡夢（T4 問題清單）

```
4 個大紅框問題卡：
① 環境不一致 ② 更新困難 ③ 設定混亂 ④ Dev/Prod 落差
每卡有 FaExclamationTriangle icon
底部統計：15 台機器 × N 個問題 = 維運地獄
```

### Slide 20：Part 2 小結（T7）

```
比較表格（6 行）：LB / Session / Read Replica / Cache / MQ / 分散式架構
每行：✅ 優點 / ⚠️ 代價
底部：💡 引出 Container
複雜度進度條：10/10（滿格紅色）
```

**Step 1: 建立 src/part2.js 並執行**
**Step 2: 轉換圖片 QA**
**Step 3: 修正並 Commit**

```bash
git commit -m "feat: add Part 2 slides (scale out challenges)"
```

---

## Task 3：Part 3 投影片（Slides 21–26）

**Files:**
- Create: `src/part3.js`
- Output: `output/part3.pptx`

### Slide 21：Container 是什麼（T4 對比頁）

```
左欄（❌ 傳統）：堆疊的環境依賴（Code/Runtime/OS）
右欄（✅ Container）：FaCube（Docker，青綠）封裝一切，任何主機都能跑
底部 3 個價值圖示卡：環境一致 / 快速啟動 / 輕量隔離
複雜度進度條：7/10（開始下降！）
```

### Slide 22：VM vs Container（T4 對比頁，重要）

```
左欄（VM）：堆疊圖示：HW → Host OS → Hypervisor → GuestOS A/B → App
右欄（Container）：堆疊圖示：HW → Host OS → ContainerRuntime → Container A/B
3 個對比數字大字：分鐘 vs 秒 / GB vs MB / 強隔離 vs 輕量
```

### Slide 23：Docker 核心概念（T6 程式碼頁）

```
左側：Dockerfile 程式碼卡片（深色）→ FaDocker 圖示 → docker build
中間：Image 方塊（不可變快照）→ docker run → Container（執行中）
右側：push/pull → Registry（FaDatabase 圓柱）
下方：5 個常用指令表
```

### Slide 24：Docker Compose（T6 程式碼頁）

```
左側：docker-compose.yml 程式碼
右側：一鍵啟動 4 個服務的架構圖
  FaServer(Nginx 藍) / FaServer(Backend 綠) / FaDatabase(Postgres 橘) / FaBolt(Redis 紅)
  全部在同一虛線邊框內（代表 network）
```

### Slide 25：Container Registry（T5 概念說明頁）

```
水平流程：Code → FaDocker(build) → Image → FaCloud(push) → Registry → Server(pull)
Image Tag 策略表（:latest 紅色打叉 / :v1.2.3 綠色打勾）
```

### Slide 26：Container 化的改變（T4 對比頁）

```
左欄（❌ 15台機器）：亂七八糟的版本列表（紅色調）
右欄（✅ Container）：統一的 4 個 Container 圖示，一目了然（綠色調）
複雜度進度條：5/10（明顯下降，視覺衝擊）
```

**Step 1: 建立 src/part3.js 並執行**
**Step 2: 轉換圖片 QA**
**Step 3: 修正並 Commit**

```bash
git commit -m "feat: add Part 3 slides (container revolution)"
```

---

## Task 4：Part 4 投影片（Slides 27–34）

**Files:**
- Create: `src/part4.js`
- Output: `output/part4.pptx`

### Slide 27–34：12-Factor App

```
Slide 27：什麼是 Cloud-Ready（T4 對比頁）
Slide 28：12-Factor 全覽（3×4 卡片格，每格一個 Factor）
Slide 29：Factor 1-3（3 欄詳細說明）
Slide 30：Factor 4-6（3 欄）
Slide 31：Factor 7-9（3 欄）
Slide 32：Factor 10-12（3 欄）
Slide 33：違反案例（4 個程式碼卡片 + 說明）
Slide 34：12-Factor 對應架構（對照圖）
```

---

## Task 5：Part 5 投影片（Slides 35–42）

**Files:**
- Create: `src/part5.js`
- Output: `output/part5.pptx`

### Slide 35–42：DevOps 整合

```
Slide 35：DevOps 文化（T4 對比頁）
Slide 36：CI/CD Pipeline（水平流程圖，5 個步驟）
Slide 37：部署策略（3 欄：Rolling/Blue-Green/Canary）
Slide 38：環境分層（3 欄：Dev/Staging/Prod）
Slide 39：大規模團隊協作（T5）
Slide 40：GitOps（流程圖）
Slide 41：Feature Flags（T4 對比頁 + 程式碼）
Slide 42：Part 5 小結（指標大字：Deploy Freq/Lead Time/MTTR）
```

---

## Task 6：Part 6 投影片（Slides 43–50）

**Files:**
- Create: `src/part6.js`
- Output: `output/part6.pptx`

### Slide 43–50：SDLC 閉環

```
Slide 43：SDLC 8 步驟（圓形流程圖）
Slide 44：環境一致性（T4 對比頁）
Slide 45：可觀測性三支柱（3 欄：Metrics/Logs/Tracing）
Slide 46：Incident Response（5 步驟流程）
Slide 47：SRE（3 欄：SLI/SLO/Error Budget）
Slide 48：Post-mortem（T4 對比頁）
Slide 49：完整旅程總覽（全頁流程圖）
Slide 50：總結 + 學習路線圖
```

---

## Task 7：合併所有 Part

**Files:**
- Create: `src/merge.js`
- Output: `output/cloud_native_slides_redesigned.pptx`

```javascript
// 使用 python-pptx 合併 6 個 pptx
// 或在單一 pptxgenjs 腳本中產出全部
```

**Step 1: 合併**

```bash
node src/merge.js
```

**Step 2: 最終全局 QA**

```bash
python3 scripts/soffice.py --headless --convert-to pdf output/cloud_native_slides_redesigned.pptx
pdftoppm -jpeg -r 150 output/cloud_native_slides_redesigned.pdf output/qa/final/slide
```

**Step 3: 完整 50 張視覺審查（子 agent）**

**Step 4: 最終 Commit**

```bash
git add output/cloud_native_slides_redesigned.pptx
git commit -m "feat: complete Cloud Native slides redesign (50 slides)"
```

---

## QA 檢查清單

每個 Part 完成後必須確認：

- [ ] 所有架構圖使用圖示（非純文字箭頭）
- [ ] 元件顏色符合設計系統（Frontend=藍/Backend=綠/DB=橘/Infra=紫/Container=青）
- [ ] 複雜度進度條正確（Part1低→Part2高→Part3開始降→Part4-6穩定低）
- [ ] 無文字溢出或元素重疊
- [ ] 所有文字與背景對比足夠
- [ ] 中文字型正確顯示
- [ ] 程式碼頁使用 Consolas 且有深色背景卡片
