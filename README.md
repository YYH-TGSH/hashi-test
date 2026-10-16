# 數獨 × 數橋 遊戲平台

同一個網址、一個介面，選今天要玩數獨還是數橋。

- `index.html` — 平台殼（首頁選遊戲、畫面切換、storage 安全網）
- `css/` — sudoku.css / hashi.css（各遊戲樣式，body 規則抽到 platform.css 以 data-view 切換）/ platform.css
- `js/sudoku/` — engine.js（生成器・求解器・存檔）＋ app.compiled.js（build 時以 Babel 7 預編譯）
- `js/hashi/` — sound.js / solver.js / puzzle.js ＋ app.compiled.js（build 時以 Babel 6 預編譯）
- `js/platform/shell.js` — 殼邏輯（按需 fetch 遊戲程式、主畫面限定返回鈕）

原始碼專案：數獨 `~/workspace/sudoku-site`、數橋 `~/workspace/hashi-site`；平台打包工具在 `~/workspace/platform`（`build.py --site` 產出本站、`build.py` 產出單檔預覽）。
