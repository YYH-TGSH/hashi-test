# 數獨 × 數橋 × 踩地雷 — 整合平台

三款遊戲共用同一個網站、同一套大廳/房間框架（PeerJS 點對點連線，零伺服器成本）。
正式站：https://yyh-tgsh.github.io/hashi-test/（GitHub repo `YYH-TGSH/hashi-test`）

## 部署形狀（重要）

正式站只部署**單一 `index.html`**：平台殼 + 三款遊戲預編譯碼 + 全部 vendor 函式庫都 inline 在同一檔，
零外部請求。這是為了消滅「多檔各自快取、版本混搭」的實機事故（v1.19.0 定案），不要拆回多檔。
repo 內的 `js/`、`css/` 多檔資產是凍結備援，與 `index.html` 同一次 build 產出，平常不直接服務玩家。

## 原始碼地圖

| 路徑 | 內容 |
|---|---|
| `platform/` | 平台殼：`shell.html` / `shell.js` / `shell.css`、`build.py`（建置）、`compile.js`（預編譯三款 app）、`vendor/`（函式庫快照）、`tools/`（Babel 6/7 本體，vendored） |
| `sudoku-site/` | 數獨原始碼 `js/app.js`、`js/engine.js`、`js/sound.js` |
| `hashi-site/` | 數橋原始碼 `js/app.js`、`js/puzzle.js`、`js/solver.js`、`js/sound.js` |
| `mines-site/` | 踩地雷原始碼 `js/app.js` |
| `boottest/` | jsdom 整合測試（雙頁 mock PeerJS broker）；`run-all.js` 是全套回歸的單一清單 |

repo 內的 `source/` 是以上原始碼的版控快照（H-01：原始碼、建置工具與測試都要進版控，工作區遺失也能重建）。

## 建置

```bash
cd platform
python3 build.py            # 產出 platform-v1-test.html（測試包，boottest 指向它）
python3 build.py --site     # 產出 ../platform-site/index.html（正式站單檔）＋多檔備援資產
```

需求：Node.js（跑 compile.js）、Python 3。路徑全相對，Babel 已 vendored，不依賴工作區外檔案。

## 測試

```bash
cd boottest
node run-all.js             # 全套回歸（逐支依序跑；不要平行，會 CPU 爭用假失敗）
npm test                    # 同上
node run-all.js mines       # 只跑名稱含 mines 的
```

「測試全綠才上線」的「全套」以 `run-all.js` 的清單為準，逐支完整輸出在 `boottest/run-all-logs/`。

## 版本規則

`platform/shell.js` 的 `PLAT_VERSION` 是唯一版本來源：功能批 minor +1、小修 patch +1，**每次推送必升版**。

## 架構速記

- 殼持有唯一 Peer 連線 + 大廳（房號 `yyh-tgsh-<4碼>-host`）；遊戲訊息經 Peer shim 多工（`__pg/__pd` 蓋戳），殼訊息帶 `{__plat:1, kind}` 信封。
- 殼↔遊戲介面：`window.__PLAT_HOOKS_<game> = { enter, exit, migrate, identity, debug }`；共用元件 PlatBar / PlatRoom / PlatCountdown / PlatResults / PlatPodium / PlatCalendar / PlatDock / createFerris 都在殼端單一實作。
- 房主是對局權威（出題、計分、道具發放）；殼層訊息一律驗證寄件者（房主權威訊息只認房主連線、身分以連線 pid 查名單）。
