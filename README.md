# 數橋 Hashi（測試版）

手機瀏覽器可直接玩的數橋拼圖遊戲，零伺服器成本（GitHub Pages 靜態託管＋PeerJS 公用信令做多人連線）。

線上玩：https://yyh-tgsh.github.io/hashi-test/

## 專案結構

```
index.html          入口：載入 CSS / JS 模組、掛載 React
css/style.css       全部樣式（動畫、棋盤、UI）
js/sound.js         Web Audio 合成音效（window.HASHI_SOUND）
js/solver.js        數橋求解器：回溯＋MRV，數解（上限可設）
                    → 找第 2 個解即停，用來判定唯一解
js/puzzle.js        題目引擎（window.HASHI_PUZZLE）
                    → 產生題目、空橋槽位、seeded RNG
                    → generateUniqueHashi：重抽直到唯一解
js/app.js           React 主程式（遊戲畫面、關卡、每日一題、多人）
apple-touch-icon.png 加入主畫面用的 icon（180x180）
```

## 模組邊界

- `solver.js` / `puzzle.js` / `sound.js` 是純邏輯，不依賴 DOM 或 React，
  之後要包成原生 App（Capacitor 等）可以直接沿用。
- `app.js` 是表現層，透過 `window.HASHI_*` 取用引擎。

## 題目品質

`generateUniqueHashi` 產題後會用 solver 驗證：
找到第 2 組解就停手 —— 0 組＝無解、1 組＝唯一解、2+＝多解，
重抽直到唯一解為止（依題目規模限制嘗試次數）。
每日一題用日期 seed，整個重抽序列是確定性的，同一天全世界同一題。
