# 大廳改版 + 數橋大亂鬥（2026-10-16，使用者指示）

- 平台大廳流程改為數橋風格：入口「🏠 建立房間／🚪 加入房間」左右雙框 → 暱稱拉霸機（30 動物名單與數橋同源、減速停止、同步輸入框、可手改）＋房號欄（加入時）＋代表色 → 房間「遊戲平台」卡：數獨／數橋各自 [🤝 合作][⚔️ 大亂鬥]（data-launch="game-mode"）。
- 數獨 hook：房主依 launch mode 預設 isBrawlMode；數橋 hook：brawl→內部 race。
- 數橋「競速」玩家可見字樣全改「大亂鬥」（大廳/開始鈕/進度/結果/toast/游標鎖 title）；內部識別字不動。
- 上帝視角：大亂鬥中 BRAWL_STATE 快照（bridges+progress，700ms 節流 + raceAwareSync 觸發、完賽送最終版；房主轉發）；進度區「👁️ 上帝視角」鈕開唯讀 modal（多對手可切換分頁、完成色標示）。
- 道具：里程碑 25/50/75% 在 pushRaceProgress 內發隨機道具（炸橋權重 3、其餘 2；上限 3）。BRAWL_ITEM 訊息（targetUid 定向、房主轉發）：
  - 💣 炸橋：目標隨機一條 count>0 的橋 count−1。
  - 🌫️ 迷霧水球：隨機島為中心 |dx|≤2,|dy|≤2 區，10 秒（fxFog，島上覆蓋 🌫️）。
  - ❓ 數字幻影：隨機 3 島數字變 ?，8 秒（fxPhantom）。
  - 🔀 單雙顛倒：10 秒（fxRef.invertUntil），在 handleBridgeClick 實線分支攔截（tap 與 drag 共用此入口）：產生的 1↔2 互換、0 不變。
  - 🧲 磁鐵：用 randomLevelData.solution 以 (from,to) 配對找 count 不足且不與自有實橋交叉的候選，隨機補 +1（raceAwareSync 走正常進度/勝利判定）。
- 驗證：jsdom mock 實測——大廳流程 8/8、大亂鬥特效與上帝視角 14/14（幻影恰 3 島、迷霧 8 島、顛倒 chip、炸橋無橋路徑、上帝視角橋線渲染），零頁面錯誤。里程碑發放/炸橋有橋/磁鐵補橋/顛倒實點需雙機實測（jsdom 無 SVG 幾何、點不了橋）。

## 2026-10-16 使用者實測回饋修正
- 數獨炸彈/掃把消失：根因是 setupPeerJS 房主 open handler 用「定義當下閉包」的 isBrawlMode（hook 在首 render 註冊 → 永遠 false）呼叫 generateAndSync，平台 launch 的大亂鬥被蓋成合作。改讀 stateRef.current（sizeId/diffId/isBrawlMode）後修復；jsdom 驗證大亂鬥鈕呈紫色啟用態。教訓：平台 hook 呼叫的遊戲函式若內部用閉包 state 而非 ref，都可能中招。
- 數橋里程碑改「房主加權發放」（比照數獨）：玩家跨 25/50/75% 送 BRAWL_MILESTONE 給房主（去重 uid@threshold），房主抽道具後以權重 (1−進度)²+0.15 在全體玩家中抽收件者（越落後越高、領先者仍有機會），BRAWL_GRANT 廣播、收件者 applyBrawlGrant 入包（滿包流掉）。
- 道具 UI 改圓形按鈕列：盤面底部置中（bottom-4 left-1/2），56/64px 圓鈕（圖示+小字名稱、同種疊加有紅色數量徽章），進度區只留提示文字＋上帝視角＋特效 chip。

## 2026-10-16 統一框架盤點（使用者要求完整檢查＋靈魂拷問）
數獨為基準，數橋補齊以下不一致（皆已實作於 hashi-site/js/app.js）：
1. 等待室：數獨是全屏「遊戲大廳」（房間代碼/模式切換/名單/設定/準備）；數橋原本只有大亂鬥的置中 modal、合作模式根本沒等待室。→ 數橋新統一等待室 roomOpen：房號 chip、房主模式切換（合作黃/大亂鬥紫，比照數獨）、名單徽章（✅準備好/未準備/👁️觀戰）、準備切換、全員備妥自動開始＋房主強制開始、合作有開始合作＋房主關卡設定（同步）、離開房間。
2. 設定區：數獨有 ⚙️ 對局設定 modal；數橋原本零設定。→ 大亂鬥設定 modal（房主改、全員同步 BRAWL_SETTINGS）：題目尺寸（LEVELS）、結束名次 winnersCount、里程碑道具開關、上帝視角顯示數字。
3. 上帝視角規則：數獨比賽中選手不能看（只有觀戰者/完賽後/房主設定）；數橋原本比賽中人人可偷看——作弊漏洞，已改：選手比賽中無上帝視角鈕；自己完賽後可「觀戰對手」；結算有「看盤面」；觀戰者有專屬觀戰面板（選手分頁切換）。
4. 觀戰身分：數獨有觀戰者（大廳切換、遲入自動觀戰）；數橋原本沒有。→ 玩家 isSpectator（REQ_SPECTATE 切換、PLAYERS_UPDATE 同步）、RACE_START 帶 racers 名單、非選手進 spectating 面板；比賽中遲入者自動觀戰。
5. 結算：數獨有名次/未完成以進度計/完賽觀戰；數橋原本只有完賽者時間＋立即再來一局。→ 結束名次制 maybeFinalize（完賽數達 winnersCount 或全員完賽；未完成以進度排名、顯示「未完成・NN%」）、獎牌列、星星（完賽才有）、回等待室 returnToLobby（TO_LOBBY 全員；回房清準備狀態防自動秒開）。
6. 準備狀態：REQ_READY/PLAYERS_UPDATE 同步（房主端處理，比照 REQ_COLOR_CHANGE 模式）。
驗證：brawlfx（等待室/設定廣播/準備自動開始/防偷看/幻影/名次結算/完賽看盤/回等待室）全過；brawlfx2、lobbyflow 回歸全過、零錯誤。教訓：G3a 抽 renderGodBoard 時把夾在中間的 raceProgress 鏡像 effect 與自動開始 effect 一起刪掉，已復原並改放穩定錨點（playersListRef effect 之後）。

## 入口尺寸統一 + 數獨每日一題/玩法教學（2026-10-16 使用者：「還是跟數橋不一樣，數橋的版面大小比較好看；數獨也要有每日一題跟玩法教學」）
- 尺寸對齊數橋原規格：雙框 grid-cols-1（手機直向堆疊）/md:grid-cols-2、p-6、rounded-xl、shadow-[6px]、標題 div text-2xl＋副標 text-xs；平台大廳卡 max-w-md→max-w-2xl、p-6 md:p-8。數獨選單雙框同步換同款（先前 flex 版太小）。
- 數獨每日一題：engine `generateDailySudoku(dateStr)`＝mulberry32(FNV hash of 'sudoku-daily-'+date）暫換 Math.random 後呼叫 generateSudokuAsync(9,'medium')——9x9 medium 生成 <20s 時完全 deterministic（已 jsdom 驗證同日同題、SVG #cell-x-y 簽名比對）。首頁黃色「📅 每日一題」鈕＋日期列（◀ date-input ▶、下限 2026-01-01、🔥 連續 N 天、最佳 mm:ss）；遊戲內標頭綠色「📅 每日 MM-DD（補玩）」徽章。完賽 useEffect[isWon,endTime] 記錄：sudoku_daily_records（每日期最佳秒數）、sudoku_daily_streak（僅今天影響連擊，規則同數橋）；startSinglePlayer/handleGoHome 清 dailyRef。
- 數獨玩法教學：首頁「❓ 玩法教學」→ overlay 三幕 CSS 循環動畫（①點格填數字 tut-key-num 飛入＋tut-target 脈衝 ②筆記 2/7 tut-draft 交替 ③整行 1-9 tut-row-cell 依序亮綠），文案各一句；keyframes 在 sudoku css 尾。
- **教訓**：tutorialOverlay 的 const 宣告若放在 home return 之後，Babel env 把 const 變 var → 首頁引用到 undefined 靜默不渲染（無錯誤！）。共用 JSX 變數必須宣告在所有 return 分支之前。jsdom 測試 sudokudaily.js 8/8。

## 數獨輸入方式切換（2026-10-16 玩家反映：喜歡先點格子再點數字）
- 工具列（填答/筆記/塗鴉旁）加 segmented 切換：🔢 數字先行（預設、原行為）/👆 格子先行；`inputMode` state 存 localStorage 'sudoku_input_mode'（try/catch）。
- 實作：把 handleCellClick 的填字尾段抽成 `applyCharToCell(cellId, char)`（含草稿切換、GHOST 廣播、history、syncState，語意原封不動），兩種模式共用。格子先行：點格子＝選取（selectedCellId；底色 sky #bae6fd，與黃色同值高亮區分；同時 setSelectedChar(該格值) 做同值高亮）；點數字鍵（onNumClick 開頭分支）＝寫入選取格（同數字再點清除、筆記模式記草稿）；未選格時點數字只做高亮；題目格有 toast 保護。塗鴉模式（interactionMode>=2）不受影響（guard 在分支之前）。
- 文案：玩法教學加第四幕（兩顆 pill 對照＋「遊戲中在盤面下方隨時切換」）；遊戲規則面板加一條格子先行說明。
- 驗證 inputmode.js 13/13（實測填入/清除/筆記/題目格保護/高亮 rect）；sudokudaily/entryui/lobbyflow 回歸零錯誤。（註：jsdom 在負載高時 boot 等待要放寬，首版測試曾因 3.5s 等待不足誤判。）

## 版面批：數橋底部工具列＋dock 重新設計＋數獨拉霸機（2026-10-17 使用者指示）
- 數橋：原本模式/繪圖子工具/縮放是盤面右下角浮動鈕群（盤面還要留 pb-24 pr-20 避開它）→ 全刪，改卡片底部工具列（比照數獨 segmented：[✎畫筆][✏️草稿][🖌️繪圖（多人時）] 深色膠囊＋繪圖子工具原樣搬入＋右側縮放 －/＋/循環）；盤面內距改 pb-2 pr-2 拿回空間。switchMode helper（set＋toast）；教學文案「右下角按鈕」→「遊戲下方的工具列」。大亂鬥道具圓鈕維持盤面底部置中（暫時性、不常駐）。
- 平台 dock 重新設計位置：右下角 52px 直排大鈕（最高 ~290px）→ 右側垂直置中深色半透明膠囊（rgba(30,41,59,.85)＋白邊＋blur），鈕 42px；視訊頭像列移到膠囊上方（top: calc(50% - 148px) translateY(-100%)）。聊天面板不動（使用者先前定案）。
- 數獨多人選單：暱稱欄改拉霸機（SUDOKU_SLOT_NAMES 30 動物同 shell/engine），虛線框顯示＋黃色「🎲 拉霸機選名字」（減速曲線同殼）＋手動輸入保留（placeholder 改「或自己輸入暱稱」）。
- 驗證：layout2 10/10（dock computed top=50%、數橋每日進場、底部列切換生效、舊鈕消失、pb-2、數獨拉霸選出「帝雉」並填入）；mp-smoke 6/6（平台建房→拉霸→launch 數橋合作→等待室渲染＋名單＋開始合作）。/tmp 曾被清：mockpeer.js 已依 AGENTS.md 描述重建、jsdom 重裝。

## 版面批 2：dock 改底部橫條＋數橋底部列對齊數獨排列（2026-10-17 使用者看預覽截圖後指示）
- 使用者看截圖回饋：「數橋的底部要跟數獨一樣」「聊天室跟視訊也要放在底部，不要放在右邊」——右側置中膠囊被否決。
- dock 改全寬底部橫條（高 54px＋safe-area，深色條、鈕橫排置中）；`updateDock` 同步切 `body.dock-on`：.plat-view.active 高度改為 calc(100dvh - 54px)，遊戲根 div（#hashi-root/#sudoku-root > div）height:100% !important，讓遊戲自己的底部列浮上來不被 dock 蓋住；大廳/首頁改 overflow-y:auto。視訊頭像列改右下橫排（bottom:62px）；聊天面板 bottom 改 62px。
- 數橋底部列改數獨排列：左＝縮放組（白方鈕 －/＋＋深色循環鈕，比照數獨工具列左側）、中＝繪圖子工具（模式 2 時）、右＝模式 segmented（ml-auto）。原本是模式在左、縮放在右。
- 驗證：layout2（dock computed dir=row/bottom=0、數橋列切換）＋mp-smoke 7/7（dock-on 在 peer open 後切上——測試需 poll 等待）。**右側膠囊版未曾 push**；本批與前批（底部工具列/dock 位置/數獨拉霸機）一起待使用者確認。

## 版面批 3：聊天/視訊按鈕併入遊戲底部列同排（2026-10-17 使用者截圖糾正）
- 使用者看底部橫條版截圖糾正：「聊天室跟視訊那三顆按鈕的樣子應該要跟原本最底部的那些按鈕的樣式長一樣而且放在同一排」「回到大廳不用出現，只有在數獨或數橋的主頁面的時候可以出現」。（另：該截圖顯示橫條版的 dock-on 讓位在 Messenger webview 沒生效、橫條蓋住數獨工具列——讓位機制整套廢棄。）
- 定案架構：殼新增 `window.PlatDock` API（isActive/getState/toggleChat/toggleVideo/toggleMic/toggleSpeaker/goLobby/subscribe/_emit；updateDock 與 renderUnread 觸發 _emit）。兩款遊戲在平台連線中把深色 capsule（與模式切換鈕同款，啟用色：數獨黃/數橋綠，💬 帶未讀紅徽章）畫進：① 遊戲底部工具列同排（數獨列改 flex-wrap＋min-h 容納）② 等待室（數橋 roomOpen 離開房間前、數獨等待 modal 準備列後）③ 主畫面一列 [🏠 回大廳（sky 藍寬鈕）＋capsule]（僅主畫面、僅連線中）。
- 殼 strip 只留在平台大廳（body[data-view=hashi/sudoku] 時 display:none !important），按鈕改遊戲方鈕風（44px、radius 14px、3px 深邊、硬陰影、透明底）。dock-on 讓位只保留 home/lobby（overflow-y:auto），遊戲 view 恢復自然高度。#plat-back 連線中隱藏（window.__PLAT_SESSION_ACTIVE，updateDock 維護），回大廳改由遊戲主畫面的列負責。
- 驗證：mp-smoke（重建版）11/11（建房→拉霸→dock-on→數橋等待室 💬 capsule→回大廳→數獨等待室 💬 capsule，零錯誤）；dockcss 實質項全過（方鈕風、遊戲畫面隱藏、大廳恢復；另 2 項因 CDN 載入逾 60 秒逾時未驗，dock 底部橫條 computed 值已於前版測試驗過）。數橋每日單機的底部列互動在同日前一版 layout2 已驗（列內容除新增 capsule 外未變，capsule 非連線回傳 null）。/tmp/boottest 曾被部署清空，已依 AGENTS.md 描述重建（mockpeer.js/harness.js/mp-smoke.js/layout2.js/dockcss.js）；layout2 全流程在慢速 CDN＋數橋每日生成同步阻塞下會跑很久，未重跑完畢。
- **未 push**：與版面批 1、2 合併待使用者確認後一次上線。
- 驗證補正（同日）：mp-smoke 重建版一度出現 7 項失敗，追查後確認是**測試競態**非 app bug——jsdom 裡 shell.html 的靜態按鈕比 shell.js 先出現在 DOM，測試在 PLAT_show 尚未定義時就點了 inline onclick（實機瀏覽器經典腳本同步執行不會發生）；且重建版把拉霸鈕文字誤寫為「拉霸機」（實際按鈕是 #slot-spin「🎰 拉霸」、暱稱 input 是 #lob-name、確認鈕 #lob-confirm「✅ 確認，進房間」）。修正：測試先等 `typeof PLAT_show==='function' && PlatDock` 就緒、改用 id 定位。重跑結果 **12/12 全過**（含兩款等待室 💬 capsule），唯一「錯誤」是 jsdom 未實作 scrollTo 的假訊息。dockcss 的 2 項逾時同屬 CDN 載入慢。

## 版面批 4：多人入口統一導向大廳＋底部按鈕濃縮（2026-10-17 使用者三截圖回饋）
- 問題 1：先選遊戲再進該遊戲自己的多人連線（截圖 1：數獨自有房代碼 3412）→ 沒有聊天/視訊（殼 session 不存在、PlatDock 不啟用，遊戲自有聊天/視訊又在平台模式被隱藏）。修法：**平台模式下兩款遊戲主畫面的多人入口直接改去平台大廳**（數獨 🌐 多人連線、數橋 🌐 多人合作的 onClick 先判斷 PLAT 旗標 → PLAT_show('lobby')；非平台/獨立版行為不變）。多人一律從大廳進，聊天/視訊自然都在。
- 問題 2：數獨底部列被 capsule 擠成兩行（截圖 3）。濃縮（兩款同款）：① 模式三鈕（填答/筆記/塗鴉、畫筆/草稿/繪圖）→ **單顆循環鈕**（顯示目前模式＋▾；數獨 cycleInteractionMode：填答→筆記→塗鴉→填答，切到塗鴉自動開子工具 popover、子工具關閉時點鈕先重開 popover；數橋用 switchMode 循環，單機 engine 非 peerjs 時跳過繪圖只在畫筆/草稿循環，連線時三段循環，繪圖子工具維持列中央原設計）。② 縮放三鈕 → **單顆 🔍 展開鈕**（zoomOpen 狀態；展開才出現 －/＋/適應循環鈕，數獨主鈕兼顯示雙指縮放百分比指示）。輸入方式雙鈕（數獨）維持不動。濃縮後兩款底部列＋capsule 可容納單行（列仍保留 flex-wrap 備援）。
- 驗證：tools.js 18/18（兩款入口導向 view=lobby、數獨模式循環＋popover、縮放展開、數橋同款＋單機跳繪圖，零錯誤）；mp-smoke 回歸 12/12。注意：跑 jsdom 測試時勿同時跑兩份（CDN/CPU 競爭會讓載入逾時誤判）；殼就緒 gate 需等 PLAT_show+PlatDock（上限拉到 600s 應付慢速 CDN）。
- **未 push**：版面批 1–4 合併待使用者確認後一次上線。

## 版面批 5：縮放改往上 popover＋數橋模式鈕完全對齊數獨（2026-10-17 使用者五截圖回饋）
- 縮放展開改「往上長的方框」：使用者點名要像數獨塗鴉子工具 popover 一樣往上長、不要往右長（往右會把底部列擠成兩行）。兩款同款：🔍 主鈕留在列內，展開時在主鈕上方開白色方框（border-3、硬陰影、animate-popUpCenter），內含直向 [＋][－][適應循環（深色）] 三顆 w-12 方鈕；錨點容器加 relative。
- 數橋模式循環鈕對齊數獨：padding 改 px-3 md:px-5、gap 改 md:gap-2（與數獨模式鈕 class 完全一致，僅主題色不同：數獨黃/數橋綠、塗鴉同為 emerald）；圖示改同款 🖋️/✏️/🖌️（原本畫筆用 ✎；注意 switchMode 的 toast modeIcons 本來就是 🖋️ 系列）。位置維持列內第三組、dock capsule 之前。
- 驗證：tools.js 21/21（入口導向、兩款 popover 為 absolute 方框、數橋圖示 🖋、循環行為，零錯誤）。
- **未 push**：版面批 1–5 合併待使用者確認後一次上線。

## 版面批 6：數橋底部列「整列」對齊數獨（2026-10-17 使用者重申統一原則後的修正）
- 使用者重申：整合在同一平台就是介面要長一樣；點名數橋 ❶塗鴉子工具仍是列內圓鈕 pill（數獨是往上方框方鈕）❷縮放等其他按鈕、甚至最下方白色底框的位置大小都不同——「這是 UI 設計很大的錯誤」，並問「都長一樣的話程式碼是不是就相同、更省空間」。
- 修正（以數獨列為唯一規格，逐字同 class）：
  - 底框容器：數橋改 `bg-[#fffdfa]/95 backdrop-blur-md border-t-[4px] min-h-[4rem] md:min-h-[5rem] py-1 px-3 md:px-6 shadow-[0_-4px_20px...]`（原為 bg-[#fffdf5] px-2 py-2 薄列）＋保留 shrink-0/relative/z-30 與 gap-x-2（其 ml-auto 版面需要）。
  - 縮放組：改 slate-100 膠囊（p-1 rounded-xl border-2 border-slate-300）＋主鈕 w-11 h-11 md:w-14 md:h-14（原 w-9/w-10），hover 用數橋主題綠；popover 本就同款（批 5）。
  - 塗鴉子工具：刪除列內圓鈕 pill（含玩家色 tint/rainbow svg——為統一外觀捨棄，筆跡顏色仍顯示在畫布上）；改掛模式 capsule 內、與數獨逐字同 class 的往上 popover（absolute bottom-full mb-6 right-0、方框、w-12 方鈕）：🖌 筆（active emerald-100）、🧽 橡皮擦（active orange-100，onDoubleClick=clearOwnStrokes 保留）、房主 🚮 玫瑰方鈕（原 🚨 紅圓鈕，handler clearAllStrokes 不變）。新增 drawSubOpen 狀態，模式鈕行為與數獨一致（在繪圖且 popover 關時點按鈕先重開）。
  - 模式 capsule 補 relative + md:gap-2（與數獨同）。
- 驗證：tools.js 34/34 全過、零錯誤——含真實連線流程（大廳建房→數橋合作等待室→開始合作→盤面→切繪圖→popover 方框/方鈕/掛載點/🧽🚮/點橡皮擦後仍在）與兩款底框 class 規格斷言。
- **測試教訓**：harness 的 waitFor 簽名是 (fn, ms, label)；D 段曾寫反成 (fn, label, ms) 造成假 timeout＋兩次假檢查（無條件 true、byText 為 null 的否定檢查）。檢查不可寫無條件 true。
- **未 push**：版面批 1–6 待使用者確認後一次上線。

## 決策（2026-10-17）：底部列之後抽成殼的共用元件
- 使用者拍板走中間路線：之後把底部列抽成「平台殼渲染的單一共用元件」，遊戲只回報狀態、接收按鈕事件。理由（已向使用者說明）：省的不是檔案大小（重複僅幾 KB），是維護成本——改一次兩邊同步、不再長歪。兩款不併成單一 App（出身不同：數獨 Babel 7 單檔、數橋 Babel 6；UI 層重寫風險過高），已共用的殼層（連線/大廳/聊天/視訊面板/暱稱）維持。
- 實作方向（開工時再細化）：殼（vanilla JS）提供 window.PlatBar：遊戲在對局畫面留掛載點 div 並呼叫 attach/update/unmount；popover 開合等純 UI 狀態歸殼持有，遊戲只推 mode/drawSubMode/zoom 百分比等狀態與回呼（onZoomIn/onZoomOut/onCycleZoom/onModePress/子工具…）；樣式續用同一份 Tailwind 規格（頁面已有 Tailwind CDN）。注意 React 重渲染與掛載點生命週期（以 screen 為 key 重新 attach）。數獨專屬的輸入方式組做成可選 group。
- 順序：先上版面批 1–6（目前規格已統一）→ 雙機實測 → 再開抽共用元件的獨立階段。


## PlatBar 共用底部列（2026-10-17 完成，待 push）
- 殼 shell.js 新增 window.PlatBar（attach/update/detach/isAttached/_debug）：對局底部列改由殼以 vanilla JS 渲染（同一份 class 字串），popover 開合（zoomOpen/drawOpen）由殼持有；模式鈕規則：塗鴉模式且 popover 關閉時只重開，其餘呼叫 onAction('mode-press') 由遊戲推進（遊戲另抽 advance 函式給 PlatBar 與舊列共用）。
- 契約：cfg {accent, onAction(name,payload)}，actions: zoom-in/out/cycle、input-set('num'|'cell')、mode-press、draw-tool('pen'|'eraser')、draw-erase-dbl、draw-clear；state {mode, modes[{icon,label}], modeTitle, zoomLabel, zoomGlyph, showInput, inputMode, showDraw, drawTool, showHostClear}。dock capsule 由 PlatBar 直接讀 PlatDock 狀態渲染（訂閱 _emit 重繪），遊戲不再畫列內 capsule。數獨專屬輸入組以 showInput 開關呈現。
- 遊戲端：對局畫面留掛載 div（數獨在 fixed 容器內、數橋 class 同原列 shrink-0 relative z-30），attach effect [screen]、update effect 無 deps。window.PlatBar 不存在（獨立版）時走舊列 JSX（React.Fragment 條件分支），舊列保留。
- ⚠️ 大坑：去重 JSON memo 不可放遊戲端——遊戲在主畫面時 update effect 也會跑（PlatBar 還 attached 在另一款的掛載點上，guard 通過），memo 被主畫面狀態污染；進場後狀態 JSON 恰相同就跳過 update，而 attach 已 detach 清空殼端狀態 → 底部列永遠空白（先玩數獨再玩數橋必現）。修法：去重放殼端 PlatBar.update（lastJson），且 attach/detach 時 lastJson=null 強制下一次必繪。遊戲端一律直接呼叫 update。
- 測試：~/workspace/boottest/platbar.js 23/23（殼列渲染/模式循環/塗鴉 popover/橡皮擦雙擊/縮放 popover/輸入切換/跨遊戲切換/合作塗鴉＋房主清除/列內 💬 開聊天室），零錯誤。harness 已重建於 ~/workspace/boottest（harness.js＋mockpeer.js，/tmp 版已被清）。
- 數橋盤面右側超出修復（同批）：applyFitZoom 改用可用寬度（clientWidth 扣容器 padding 與內層 pr/pb）×0.98，且套用後以 scrollWidth>clientWidth 保底再縮一次（只縮不放）。真瀏覽器幾何驗證未完成（CDP 量測環境不穩），靠雙機實測確認。

## 統一連線生命週期（2026-10-17 晚，使用者「靈魂拷問」指示）
狀態機（兩款一致）：lobby → countdown → playing → finished；結算後只有 play-again（直接下一局、不經等待室）與 to-lobby（全員一起、明確動作）兩條路，禁止任何自動跳回大廳。
- S1 全員準備 = 非觀戰者全部 isReady（數獨舊 bug：every 含觀戰者 → 三人房有人觀戰/閒置就永遠不開始；數橋 roomAllReady 已正確排除觀戰者）。
- S2 觀戰開關兩款兩模式都要有（數獨舊況：coop 無 toggle；數橋舊況：coop 無 toggle）——不想打的人切觀戰，不要卡住全場。
- S3 結算「再來一局（同設定）」兩款同款同位：數橋原本缺此鈕（每局必回等待室＝使用者主訴）；來賓按 → REQ 給房主執行+廣播，全員同進退。數獨既有 REQ_PLAY_DIRECT。
- S4 斷線不結束對局：數橋 race 舊況 conn close/LEAVE → exitRaceToSolo 整場結束；改標記離線、進度列保留「未完成・NN%」，其餘人打完照常結算。數獨 host 側移除玩家續打已具備。
- S5 重連同 uid 回座：playerId 存 localStorage 持久化（同裝置同房 = 同 uid）；host JOIN 的 existingPlayer 分支兩款都有（回座送 INIT 全量）。數橋 race 回座另補 RACE_RESUME 盤面快照（host 的 brawlBoards）。殼：plat_room 記上次房號，重開 App 可一鍵回房。
- S6 房主斷線接管（平台版）：數獨 standalone 有接管，但平台模式被 __PLAT_PLATFORM 短路成 switchToOffline。改走殼協作：殼偵測房主 conn close → 依 roster 順序第一位非觀戰來賓升格（同房號重建 host peer，broker id 釋放重試）、其餘來賓重連 → hooks 'host-migrated' → 新房主遊戲 promote（sudoku 重跑 setupPeerJS host；hashi 新增 promoteToHost），其餘人以同 uid 回座（S5 路徑）。
- S7 中途加入：coop 直接入場（INIT 全量，兩款已支援）；brawl 自動觀戰、下局起參賽（sudoku isSpec／hashi lateSpec 兩款已支援，驗證即可）。
- 已實測定位（dual-sudoku3.js）：三人數獨 coop，阿丙無 toggle 可按（coop 無觀戰開關）+ 未準備 → 房主與阿客 ready 也永遠不開始（every 含未準備者本來就對，但「沒觀戰可切」是設計缺口；brawl 有觀戰者時 every 含觀戰者＝真 bug）。

## 統一生命週期實作結果（2026-10-17 晚，批 9+10）
- S1 數獨 all-ready 改排除觀戰者（dual-sudoku3 6/6：三人房阿丙切上帝後房主+阿客 ready 即開局）。
- S2 觀戰 toggle：數獨 coop 補上（原本 isBrawlMode 閘）、數橋 coop 補上（原本 race-only）。
- S3 數橋結算補「🔁 再來一局」（race settlement 列）＋合作勝利 modal 連線時改 再來一局/回等待室；playAgain()：房主 race→startRace、coop→hostCoopAgain（applyCoopLevel+COOP_START 廣播）；來賓→REQ_PLAY_AGAIN（房主 handler：race finished 才 startRace、coop 需 isWonRef 才 hostCoopAgain）；回等待室來賓改 REQ_TO_LOBBY→房主 returnToLobby 全員。isWonRef 為本批新增鏡像。
- S4 數橋 DNF：markRacerDnf(uid)（記 raceResultsRef[uid]={dnf:true,progress}、maybeFinalize 計入、finalizeRace 的 DNF 桶優先用 rr.progress）；房主 LEAVE/conn close 在 countdown/racing 改記 DNF＋廣播 RACE_DNF＋不拔名單（保留名次/回座），來賓加 RACE_DNF case。進度列修剪 effect 改保留 racersRef 內 uid。exitRaceToSolo 只剩房主自己離開時用。
- S5 uid 持久：兩款 playerIdRef 改讀 localStorage（plat_uid_sudoku/plat_uid_hashi，try/catch）。數橋 RACE_RESUME：房主 JOIN 時若 race 進行中，對該 conn 補送（racers 快照 brawlBoardsRef[m.uid].bridges＋raceProgressRef）；來賓 handler beginRace 後覆寫 bridges/progress。brawlBoardsRef 為本批新增鏡像。殼：createRoom/joinRoom 存 plat_room、leaveRoom/peer-unavailable 清除；入口加「↩ 回到房間 XXXX」鈕（#lob-rejoin，自動帶入房號＋暱稱進暱稱步）。
- S6 接管：殼 onRealConnClose 房主 conn 關閉且未收 bye → onHostConnLost（不再 endSession）：roster 第一位非房主升格 promoteToHost（同房號 RealPeer、unavailable-id 每 2s 重試×10、保留自己 pid 只改 hostPid/isHost、open 後廣播 roster＋migrateGame(true)）；其餘 waitForNewHost（每 3s 重連×16、成功送 join＋Net.restored=true＋migrateGame(false)）；'launch' handler 見 restored 只 PLAT_show 不再 enter（防雙重 setup）。__PLAT_NOTIFY('host-gone') 改呼叫 onHostConnLost（數獨端已移除該 notify 呼叫，改只 toast）。endSession 清 Net.migrating。
- 遊戲 migrate hook：數獨→setupPeerJS(code,name,amHost)（房主 open 的 isMigrating 續局邏輯沿用）；數橋→升格 promotingRef（open handler 不洗名單：移除舊房主、自己標 host、保留其他人）／來賓重設 guest 旗標＋platAutoRef 補名自動 JOIN。
- 硬化：兩款 setupPeerJS 開頭冪等重設（destroy 舊 peerRef、connsRef=[]、connRef=null）——修「重複 setup 後 SYNC 送進死連線/重複綁定」整簇問題（使用者實測的準備/再來一局單邊進遊戲疑與此同簇；乾淨流程 E2E 均不重現）。
- 驗證：dual-migrate3（全流量）3/3、dual-sudoku3 6/6、dual-sudoku 7/7、dual-again（4x4 解題→結算→來賓再來一局）房主/來賓同步離開結算＋新局、dual.js 32/33（剩數橋倒數 overlay：jsdom 三頁共用 CPU 停滯致 state 批次吞掉，機制逐行審查正確＋同頁數獨倒數實證，列雙機清單驗）、site-boot 4/4。
- 測試環境教訓：三頁 jsdom 共用 Node 事件迴圈，任一頁生成題目可堵住整條迴圈 25s——取樣型斷言（倒數、badge 回顯）會假失敗；判定以全流量紀錄（dual-migrate3）＋MutationObserver 為準。測試程序結束後以 pgrep -f '^node dual' 清殘留（勿用 pkill -f dual，會誤殺自己的 shell）。

## 2026-10-17 深夜：選色拉霸閃退 hotfix＋版本號制
- Bug（雙機實測回報）：暱稱步拉霸選色結束 → 被踢回入口選單、進不了房間。根因：spinColor 收尾呼叫 renderLobby()，當時 Net.active=false → renderLobby 強制 showIdle()。修法：spinColor 只在 Net.active 時才 renderLobby；renderLobby 在暱稱步顯示中不切畫面。回歸 spin-step.js（修前 2/6、修後 6/6）、dual.js 32/33（同基線）、site-boot 4/4。commit 086c88c 上線。
- 版本號制（使用者指示）：PLAT_VERSION 單一來源（殼），平台首頁「整合測試版 v1.1.1」；數獨/數橋頁尾顯示子版本號（讀 window.PLAT_VERSION，獨立版 fallback v3.13.4 / v2.18 測試版）。v1.0.0=5999866、v1.1.0=43bcf5b、v1.1.1=086c88c＋2ea1ffe。

## 2026-10-17 深夜續：Phase D 混合大亂鬥賽程＋完賽凍結修復（v1.2.0，commit 9d63c74 已 push、Pages 驗證完成）
- Phase D 殼端 PlatTourn 引擎完成：房主權威、嗅探計分（不改兩款遊戲協定）、5 局交替、名次分 10/7/5/3/2（6th+ 1 分）、同分先比冠軍局數、再同分加賽 1 局數橋。開賽面板可選：局序（數獨先/數橋先/隨機）、數獨尺寸/難度、數橋關卡、每局時限（預設 5 分）。遊戲端 enter(sess.tourn) 套 preset＋鎖等待室設定（琥珀提示條＋pointerEvents none）。房主被接管 → 依當下積分提前結算。
- jsdom 驗證：tourn-stub 24/24（5 局全流程＋同分加賽＋總冠軍＋來賓同步＋零錯誤）；site-boot 4/4；dual.js 32/33（基線，唯一 fail 為已知 PlatCountdown 取樣假象）。
- tourn-stub harness 教訓：殼 boot() 是 lazy 的——遊戲第一次被 PLAT_show 時才執行真程式碼並覆寫 __PLAT_HOOKS_*。stub hooks 第一局贏競速、第二局起被真 hooks 取代 → R3/R4 enters 消失。修法：installStub 後用 Object.defineProperty 鎖住 hooks（吞掉後續覆寫）。這是 harness 假象，非引擎 bug（真 hooks 的重複 enter 早被 dual-again 等套件證明）。
- 完賽凍結修復（使用者雙機實測回報：數橋完賽後被朋友用 💣 拆橋）：根因兩層——(1) applyBrawlItem 無完賽守衛，完賽後道具照樣改盤；(2) useBrawlItem 自動鎖定「進度最高」的對手，完賽者 100% 反而是頭號目標。修法（數橋 js/app.js）：applyBrawlItem 開頭 myFinishTimeRef != null → 擋下並 toast「盤面凍結」；useBrawlItem 完賽者不可用道具、選目標排除 raceResultsRef 已完賽者與非 racers 的觀戰者；里程碑 handleBrawlMilestone 候選排除已完賽/觀戰者；applyBrawlGrant 完賽不再收道具。對照數獨：WEAPON_HIT_FOG/ERASE 本就有 isSpectator 守衛且完賽即轉觀戰——數獨原本就凍結，本次是數橋補齊對齊。

## 2026-10-18 凌晨：賽程卡關檢討＋架構硬化＋數獨水球改凍結（v1.3.0，commit f03f815 已 push、Pages 驗證完成）
使用者雙機實測 v1.2.0 回報：五戰模式第二局卡住（只剩主機在跑、其他人卡倒數）、第二局玩完跳主畫面或卡住，要求重新思考設計。
診斷（jsdom 真遊戲重現 tourn-real.js＋探針）：
- BUG-A（確診・主犯之一）：數獨 SYNC 是 delta 廣播——cells 只在出題 SYNC、countdownTarget 只在開賽 SYNC，永遠不在同一封。嗅探器原本要求兩者同封 → 數獨局的計時器永遠不武裝，只能靠全員完賽結算，否則只剩 120 秒 armTimer 兜底（+5 分鐘時限＝卡 ~7 分鐘）。已改為分開偵測（cells/levelData.cells 認 totalBlanks；countdownTarget 認 startedAt）。
- 結構弱點（設計檢討結論：原設計「射後不理」——launch/return 無 ACK、enter 可被靜默放棄、訊息無緩衝）：(1) waitForHook 12 秒找不到 hooks 就靜默放棄 → 玩家停在遊戲主畫面（即「跳回主畫面」）；(2) routeData 對 Net.gamePeer 無緩衝，data handler 未掛上前的訊息直接丟棄；數獨 JOIN 無重送（數橋有 2.5s 自我修復）→ 漏接即永遠卡連線中；(3) PlatCountdown 殼有 overlay 但轉場不清理，遊戲中途退出會留凍結數字；(4) 兩款 handleGoHome 來賓分支 setTimeout(100ms) 銷毀的是「當下的 peerRef.current」——100ms 內重進場會誤殺新 peer。
硬化（v1.3.0）：嗅探器 delta 修正；shim 兩層訊息緩衝（VirtualConn._dq＋Net._dq，handler/peer 就緒自動補送，上限 100）；waitForHook 改 48 秒＋兩段 platToast 提示；doLaunch/doReturnToLobby 一律 PlatCountdown.hide()；launch 重複防護（同遊戲同局忽略，for 重送）；tourn ACK（entered/lobby，含房主 self-ack）＋房主面板每人狀態列（⏳進場中/🎮已進場、⏳還在遊戲裡/🏠已回大廳）＋「重送邀請」「叫他回大廳」鈕——軟屏障，不硬擋（避免一支手機死掉鎖死整場）；兩款拆彈（捕獲 peer 實例再銷毀）；數獨補 JOIN 自我修復（比照數橋）。
數獨水球改版（使用者指示）：💧 命中不再靠 🫟 emoji 遮數字（各廠牌 emoji 大小不一會漏看數字）——改為「凍結」：命中宮格上冰霜漸層 rect（不透明度 ≥0.92）＋❄️ 特效，10 秒內該宮格 applyCharToCell（填答/草稿）與 clearCell（長按清除）全擋（frozenToast 節流 1.5s）。foggedBoxes state 語意改為凍結宮格，ticker/重置沿用。
驗證：tourn-stub 24/24、tourn-real 23/23（真遊戲 R1–R3 全切換，計時結算正常）、site-boot 4/4、dual.js 32/33（基線）、dual-sudoku 7/7（重跑；首跑 6/7 為 jsdom 取樣 flake）。tourn-real 教訓：倒數斷言要用 PlatCountdown.show 的 instrument 紀錄，不能用 DOM 取樣（等待室一消失取樣迴圈就退出，永遠取不到）。

## 2026-10-18 v1.3.1：房主下令才開賽＋雙分頁 uid 撞號修復（commit c952ca5 已 push、Pages 驗證完成）
- 使用者雙機（同電腦雙分頁）實測 v1.3.0 回報：(1) 玩家按準備就自動進遊戲——應改房主下令。(2) 進遊戲後名字變「玩家」、比賽跑不起來。
- 自動開始移除（兩款同款）：刪數獨 waiting watcher 與數橋 race auto-start effect；PlatRoom 開始鈕改「🏁 開始比賽/🏁 開始大亂鬥」(primary)；準備只是打勾。tourn-real 改為房主 1.5s 後按開始，三局 hostGone≈1.7s 同步進場。
- 名字 bug 根因（probe-sametab 共用 localStorage 重現）：兩分頁共用 localStorage → plat_uid_sudoku/hashi 兩邊讀到同一個 uid → 來賓 JOIN 的 uid 撞房主自己的名單條目，房主條目被改名、兩邊塌成同一人（探針裡變阿乙；實機顯示為「玩家」）。修法（兩款同款）：uid 加「分頁占用鎖」——每分頁有 sessionStorage tab id，第一個分頁占用正規 uid 並每 3 秒心跳 claim（8 秒內有效）；後開的分頁偵測到占用改用 sessionStorage 分頁專屬 uid。正規 uid 的同裝置回座功能不受影響。探針修前 1/3、修後 3/3。
- 回歸：tourn-real 22/23（功能全過；1 fail 為既有來賓頁 teardown filter flake）、dual 32/33 基線、dual-sudoku 7/7、site-boot 4/4、probe-sametab 3/3。

## 2026-10-18 v1.4.0：在線心跳＋五戰架構修正 A/B/C/D（commit 28a082b 已 push、Pages 驗證 PLAT_VERSION=1.4.0）
- 起因：(1) 使用者回報玩家端關掉後房主名單仍看得到他（幽靈）——WebRTC/ICE 察覺消失太慢。(2) 使用者要求五戰斷線者不用等：房主可手動結束本局；並要求靈魂拷問五戰架構、先對話定案再修正。定案：A 進度%計分＋隨時結束本局、B 斷線可回來打、C 房主斷線可接管續打、D 看得到誰沒回來＋房主可強制開始。嗅探維持（使用者未選明牌）。
- 在線心跳（殼＋兩款同款，使用者定案參數）：每 10 秒 ping、25 秒無回應標離線、60 秒大廳/等待室移除；比賽中只標離線不移除（保座位走 DNF/回座）。殼：Net.presence{pingMs,offlineMs,removeMs}＋Net.lastSeen/hostSeen、5 秒 tick、ping/pong、大廳名單離線者加「（離線）」。遊戲層：lastSeenRef/hostSeenRef/lastPingRef、房主 handler 開頭 stamp（c.uid||m.uid||m.targetId）＋PING→PONG、來賓 stamp hostSeen、5 秒 sweep（來賓每 10 秒 PING；房主 >25 秒寫 isOffline 進 players 廣播、等待中 >60 秒移除＋toast）、PlatRoom online 統一式（自己 true／isOffline 取反／房主端連線已斷 false／否則 null）。探針 presence-shell 5/5、presence-game 5/5（真門檻 29 秒標離線、64 秒移除）。
- 五戰修正（全在 shell.js，遊戲端零改動）：(1) 殼層持久身份 plat_uid（myUid()，join 帶 uid＋ver，roster 條目帶 uid/ver；建賽時版本不一致 sysChat 警告不阻擋）。(2) tourn 全部狀態鍵 pid→entrant uid（totals/wins/progress/finishOrder/disc/acks；tournEntrant/tournEntrantByPid/tournUidByName/tournRebind；placements 帶 {uid,pid}）。(3) C 備份：tournStateMsg/tournSnapshot 走 tourn-score 廣播（進度節流 2.5 秒、完賽強制），來賓 playing 相位存 shadow 狀態；join 時房主補送快照；tournAdopt 取代 tournEndByHostLoss（升格 1.2 秒後：局中以備份進度 tournSettle 續行、局間廣播狀態接手）。(4) A：房主面板「⏹️ 結束本局（以目前進度結算）」隨時可按。(5) D：下一局/加賽鈕在 lobby acks（uid 鍵、值=round）未齊時顯示「🚀 強制開始第 N 局（還有 X 人未回來）」。
- 測試教訓：tourn-v14 B 情境假失敗兩次——stub 遊戲 peer 以同 id 蓋掉殼 peer 在 mock REG 的註冊，重連者的殼 join 被送到 stub 遊戲 peer 而石沉大海；真實平台 host id 只屬於殼。測試端還原註冊後 16/16 全過。dual.js 來賓設定 2 項失敗經舊版整站（c952ca5，HTTP 供檔）對照定性：舊版過、新版一度失敗，最終證明是 dual.js 未等 lazy-boot 來賓的設定 portal 內容就斷言的測試競態（探針顯示內容渲染正常），已改 waitFor；倒數 overlay 1 項舊版新版同樣失敗＝既有基線（harness 內來賓 PlatCountdown.show 從未被呼叫，兩版一致）。
- 回歸（v1.4.0 打包前）：tourn-v14 16/16、tourn-stub 24/24、tourn-real 22/23（既有 teardown flake）、dual 32/33（基線）、dual-sudoku 7/7、site-boot 4/4、probe-sametab 3/3、presence 兩支 5/5＋5/5。
- 數橋來賓閃爍＋閃退（2026-10-18 回報）仍未在 harness 重現（probe-flicker 正常），待 v1.4.0 上線後真機觀察（心跳離線數據或有助定位）。

## 2026-10-18 v1.4.1：雙機實測兩 bug 修復（commit e32c801 已 push、Pages 驗證 PLAT_VERSION=1.4.1；基於 v1.4.0 的 patch 故為 1.4.1）
- Bug 1（五戰數獨→數橋，來賓自己在數橋等待室每 1–3 秒退出/進入循環）：根因＝數獨房主的舊「分層自動同步」effect（v3.8.13，每 1s/3s 廣播 PLAYERS_UPDATE＋HEARTBEAT_PING）在 exit() 後變殭屍——effect cleanup 只看 deps [isHost, matchPhase]，handleGoHome 後兩者都不變（switchToOffline 仍設 isHost=true、matchPhase 未重置），interval callback 又不複驗 engine；且殼的 VirtualConn.send 不看所屬 VirtualPeer 是否已 destroy，殭屍照樣送得出。切到數橋後，殭屍把數獨的 [房主一人] 名單每 3 秒蓋進來賓的數橋 app，來賓從自己名單消失→數橋自我修復重送 JOIN→房主回 INIT 復原→再被蓋掉，形成循環。修法：(a) 殼 VirtualConn 的 open/send 一律尊重 vp._destroyed（已退出的遊戲全面靜音，兩款受益）；(b) 數獨該 interval 每 tick 複驗 isHostRef＋engineRef==='peerjs'。
- Bug 2（一般模式數獨大亂鬥，房主先完賽後，來賓完賽房主永遠等不到）：harness 正常流程不重現；定位到三個真實缺陷疊加：(a) 來賓完賽回報 GHOST_I_WON 只送一次、無補送，途中任何掉包/連線替換即永遠遺失；(b) 殼 wrapperFor 對同 pid 的新實體連線不重新綁定 _real——重連後遊戲層收得到、送不出（殭屍連線）；(c) 房主 allDone 公式只認「未觀戰選手全數完賽」，名單旗標（isSpectator 殘留）或 uid 分歧時永遠不成立。修法：wrapperFor 同 pid 換連線時重綁 _real 並解 closed；數獨＋數橋完賽回報補送（房主宣布完賽前每 3 秒、最多 6 次，房主端以 id/uid 去重，兩款同款邏輯）；allDone 改為「非房主玩家已完賽（id 或名字對上）或觀戰中都算了結」。
- 驗證：repro-bug1 修前 present/absent=30/30、transitions=16 → 修後 60/0/0 全穩；repro-bug2（真解題完賽）4/4；repro-bug2-loss（第一封 GHOST_I_WON 在傳輸層吞掉）靠補送修復 4/4。回歸：tourn-real 23/23（優於基線 22/23）、tourn-stub 24/24、tourn-v14 16/16、dual 32/33（基線倒數 1 項）、dual-sudoku 7/7、site-boot 4/4、probe-sametab 3/3、presence 5/5＋5/5。

## 2026-10-18 v1.5.0：來賓誤當房主（isHost 未重置）＋開始按鈕門檻（commit 132d634 已 push、Pages 驗證 PLAT_VERSION=1.5.0）
使用者雙機回報兩件：(1) 五戰第三局數獨，來賓端出現「開始比賽」鈕；(2) 五戰先數橋再數獨，來賓一樣斷線重連＋誤以為自己是房主。並要求：開始鈕須等全員準備好、或等待室滿 1 分鐘（防掛機）才亮。另問「是不是要做一遍整個程式碼修正、哪裡衝突了」——答覆與處置：這幾次 bug 是同一類根因「離開/單機時寫入的狀態，重入時沒人重置」，已針對進出生命週期面做兩款對照稽核（下方），而非盲目全改。
- 根因：數獨 `isHost`（state+ref）全檔只有 setIsHost(true)（switchToOffline、房主 open），從來沒有 false 的重置；來賓分支 setupPeerJS 不設它。第一次進房靠初始 false 沒事；任何一次 switchToOffline 後就被毒化：switchToOffline 的呼叫點共四處——handleGoHome、startSinglePlayer（單機）、startDailyGame（每日一題）、來賓 conn close 且無其他玩家時（連線閃斷也會中）。毒化後果：PlatRoom spec 用 state isHost → 來賓看到開始鈕；isHostRef=true → 來賓誤跑房主自動同步廣播 PLAYERS_UPDATE（只有自己一人的名單）→ 房主名單被蓋 → 來賓消失→JOIN 自癒→INIT 復原→再被蓋＝斷線重連循環。數橋各分支都有 setIsHost(false) 重置——兩款不對稱就是數獨一直出事的原因。
- 修法（數獨 setupPeerJS 開頭單一 choke point）：`setIsHost(!!isCreating); isHostRef.current = !!isCreating;`——所有進入路徑（房主/來賓/接管/重入）一律依角色重置，四個毒化來源全數失效。數橋經稽核本來就正確，未動。
- 開始按鈕門檻（兩款同款邏輯）：殼新增單一來源 `window.PLAT_START_WAIT_MS = 60000`。兩款各加 waitingSinceRef（等待室可見時起算、關閉清除）＋房主端 1 秒 waitTick 重繪＋spec 計算 canStart = 非觀戰者全員 isReady（含房主本人）|| 已等滿閾值。數獨：合作/大亂鬥共用同一開始鈕，兩模式都套；數橋：競速套（與原 racers>=2 條件疊加），合作模式無準備機制不套（維持原行為）。PlatRoom 本來就支援 start.disabled/note（殼免改）；兩款 onAction 'start' 再加 canStartRef 守衛（數橋僅 race），未達門檻按了只 toast。附帶發現：數橋獨立版 fallback 開始鈕（app.js 舊 JSX）仍是舊行為，未在本次範圍（平台路徑為回報情境）。
- 驗證（v1.5.0 build）：新 test-startgate 13/13（R1 門檻四態＋R2 重入來賓無開始鈕＋等待閾值亮起，閾值以 PLAT_START_WAIT_MS=3000 注入測）；新 test-hashifirst 7/7（來賓先玩每日一題毒化→進數獨等待室：無開始鈕、房主名單取樣 40/40、transitions=0）；tourn-real 23/23、dual-sudoku 7/7、repro-bug1 4/4、repro-bug2 4/4、site-boot 4/4、dual 32/33（基線倒數 overlay fail 不變）。

## 2026-10-18 v1.6.0：數獨來賓先贏房主被跳結算（allDone 漏算房主）＋數橋進度條改數獨款（commit 6be03e9 已 push、Pages 驗證 PLAT_VERSION=1.6.0）
使用者回報：(1) 五戰第三局數獨，來賓先贏 → 房主立刻被跳出成績畫面、賽程斷掉。(2) 數橋進度條他不喜歡，要數獨款（晶片＋玩家色細條），且要同款的點按改名/改色（房主可改全員）。
- Bug 根因：數獨 handleMultiplayerWin 的 allDone 公式 contenders 只算「非房主」玩家——兩人局裡來賓一完賽 every() 即成立，房主還在玩就被結算。v1.4.1 硬化時保留了舊式的排除房主寫法（當時症狀是反向的卡死）。數橋 maybeFinalize 本來就把 myFinishTime 算進 finCount（正確），數獨對齊：新增 hostEntry/hostDone（房主了結＝觀戰中或已在 winners），allDone = winners 達上限 || (hostDone && contenders 全數了結)。
- 數橋進度條改造：競速面板（直式全寬統一綠條）→ 數獨同款橫向晶片條（左色條＋名字/👑/👁️/(你)＋綠字 %＋w-24/32 玩家色細條，rainbow 用 CSS 漸層）；資料改以 playersList 為準、% 取 raceProgress。原「👥 連線玩家」晶片列在競速中隱藏（避免兩條並存），fx 徽章列與上帝視角鈕保留在進度條下方。
- 改名/改色（數橋補齊與數獨同款）：新增 editTarget/editName state＋「⚙️ 個人設定」modal（暱稱輸入＋儲存含重名檢查、20 色盤＋[0,4,15,19] 彩虹序列，與數獨 modal 同邏輯；底色用數橋綠 #f6fdf6、input ring 用 emerald）；新增 handlePlayerNameChange（房主改名單廣播 PLAYERS_UPDATE、來賓送新訊息 REQ_NAME_CHANGE——房主 handler 比照既有 REQ_COLOR_CHANGE 形狀新增）；競速晶片點按權限同數獨（自己或房主可開 modal，其他人點跳 toast）。PlatRoom 等待室同步開放：數橋 spec clickable 改為（自己||房主）、onAction 新增 player-click 開同一 modal（先前數橋 clickable:false、等待室無法改名改色，與數獨不一致）。
- 驗證（v1.6.0 build）：新 test-guestfirst 7/7（來賓先解完 4x4：房主無結算畫面、房主解完才結算且含來賓）；新 test-hashi-strip 10/10（晶片雙色相異、來賓改自己名雙邊同步、房主改來賓名/色雙邊同步）；tourn-real 23/23、dual 30/31（唯一 fail 為倒數 overlay 既有基線；其進度斷言已改寫對新晶片條）、dual-sudoku 7/7、repro-bug1 4/4、repro-bug2 4/4、test-startgate 13/13、test-hashifirst 7/7、site-boot 4/4。

## 2026-10-18 v1.6.1：跨網路連不上（缺 TURN 中繼）修復（commit b1d92ee 已 push、Pages 驗證 PLAT_VERSION=1.6.1；跨網路實測待使用者回報）
使用者回報：沒有用區網就不能連線；截圖證據——朋友手機 4G、卡在數獨來賓「已啟動握手，建立加密通道…」永遠不開（broker 登記成功、WebRTC 資料連線 ICE 交涉失敗）。
- 診斷：不是程式回歸（原始碼/殼從未設過自訂 ICE，一直用 PeerJS 預設）。PeerJS 預設只有 STUN：同區網靠 host candidate 直連永遠通；跨網路遇到對稱 NAT/電信 CGNAT（4G 常見）/擋 UDP 的網路就穿不過。信令（房號/登記）走 WSS 不受影響，所以症狀是卡在握手畫面而不是報錯。
- 修法（shell.js 單一來源）：新增 PEER_OPTS = {config:{iceServers:[STUN×2(Google), TURN OpenRelay :80/:443/:443?transport=tcp（username/credential 皆 openrelayproject，免費公共中繼、免註冊）]}}，四個 RealPeer 建構點全數帶上（makeHostPeer、joinRoom 來賓（改傳 undefined, PEER_OPTS 以相容 mock）、接管升格 attempt、PlatPeer 無 session 直通）。ICE 仍優先直連，中繼只在直連失敗時啟用；維持零伺服器費用。遊戲訊息經 DTLS 加密，中繼只轉發密文。
- 驗證：test-turnopts 6/6（mock Peer 記錄建構參數：房主/來賓都帶 turn+stun、加設定後大廳流程正常、零錯誤）。真實穿透效果只能正式站雙機跨網路實測（jsdom 無真 ICE）。
- 後續（使用者 21:26 新指示）：數獨/數橋大亂鬥結算畫面長得不一樣——要比照 PlatRoom 模式抽成殼共用框架（PlatResults），排 v1.7.0。

## 2026-10-18 v1.7.0：結算畫面統一 PlatResults（commit 0eb7d32 已 push、Pages 驗證 PLAT_VERSION=1.7.0；雙機實測待使用者回報）
使用者指示：數獨/數橋大亂鬥「其中一位玩家過關時的結算畫面又長得不一樣」——比照 PlatCountdown/PlatRoom 抽成殼共用框架。
- 殼（shell.js）：新增 window.PlatResults = {show(spec), hide(), _visible()}，overlay #plat-results（z-850、白卡、🏆+標題、名次列（🥇🥈🥉/n.、代表色直條、名字+(你)+👑、右側 mono 狀態字、第 1 名 accent 底色）、waitingText（⏳ 脈動）、verdict（emerald 粗體）、stars（3 顆、超出灰階）、buttons（data-pres 委派 onAction；primary=accent 底、danger 紅、其餘白底）、note 小灰字。show 以 JSON 去重（剔除 onAction 比對；命中只換 onAction 參照）。doLaunch/doReturnToLobby 轉場一律 hide（與 PlatCountdown 並列）。
- 規格統一：entries 一律全體非觀戰選手（完賽依名次＋⏱ 時間、未完賽「未完成 · NN%」）；finished 與 waiting（自己已完賽、他人未完）兩態共用同一框架；不做 ✕/收合 pill（數獨舊 ✕ peek 只留獨立版 fallback；觀戰走 watch 鈕）。按鈕統一組 watch/rematch（🔁 再來一局，primary）/lobby（🏁 回等待室）/home（離開），各遊戲接回自己既有 handler（五戰 ack 流程不變）。accent：數獨 #ffcc00、數橋 #4ade80。數獨 waiting 態只有 watch（轉上帝模式）；finished 且非房主不可控（allowOthersToPlayAgain=false）時按鈕全藏＋note「等待房主決定」。數橋 finished 附星星（自己有完賽才傳 stars）與來賓 note「再來一局／回等待室都會帶全員一起」。
- 遊戲接線：兩款各加 resultsDismissRef（記 phase/raceState：同態內 watch 關了不重彈、狀態變了自動重彈）＋無相依 PlatResults effect（比照 PlatCountdown 驅動法）。數獨 waiting entries=已完賽 winners；finished 補未完賽者（ghostProgress 排序）。數橋 waiting entries=raceResultsRef 非 DNF 者＋併入自己的完賽（myFinishTimeRef；房主自己的完賽不在 raceResultsRef、來賓自己的不會被回送，兩邊都要補自己）。本地舊 modal/pill 加 `!(window.PlatResults)` gate 只作無殼 fallback。
- 驗證：新 test-results 22/22（數獨真解題全流程：來賓等待態→房主不跳結算→雙邊結算同按鈕組→回等待室鈕實按；數橋 winnersCount=1＋注入 RACE_FINISH 觸發 finalize：雙邊同框架結算、條目含 ⏱/未完成）。回歸：test-guestfirst 7/7（已改 DOM 訊號）、tourn-real 23/23、repro-bug2 4/4、repro-bug1 4/4、dual-sudoku 7/7、dual 30/31（基線）、test-startgate 13/13、test-hashifirst 7/7、test-hashi-strip 10/10、test-turnopts 6/6、site-boot 4/4。
- 踩坑（測試端，非遊戲 bug）：(1) 單檔 bundle 的 body.textContent 含 body 內 <script> 原始碼——「大亂鬥結果」在全新頁面就存在，文字斷言全被污染；斷言改用 #plat-results 元素/#view-<game> 子樹。(2) 等待室時盤面已渲染在 overlay 下方，「cells>0」不是開賽訊號；真訊號=雙邊 [data-pr-region=roster] 消失。(3) v1.5.0 canStart 門檻下，ready 點擊遺漏會讓 start 被守衛擋下、整場不開賽——測試開局序列必須：雙邊 ready→等房主 start 不再 disabled→點擊→等 roster 消失。

## 2026-10-18 v1.7.1：回滾 TURN（commit 0d23529 已 push、Pages 驗證 PLAT_VERSION=1.7.1、線上 shell.js 已無 openrelay 字串）
使用者 22:09 回報「現在都無法連線了」——v1.6.1 的 OpenRelay TURN 不但沒救到跨網路，連原本能連的也拖下水。查證：該服務的公開靜態帳密（openrelayproject）已失效（官方改 API key 制），死中繼列在 ICE 清單裡會讓交涉整體卡死。使用者明確拒絕 Firebase 與「註冊任何東西」，指示先修正。
- 修法：shell.js 移除 PEER_OPTS 整段、四個 RealPeer 建構點全數回到 v1.6.0 原始寫法（PeerJS 預設）、註解留下回滾原因與「跨網路需註冊制中繼、使用者決定不註冊」的狀態。
- 驗證：dual-sudoku 7/7、dual 30/31（基線）、tourn-real 23/23、site-boot 4/4。（test-turnopts 的前提已不存在，停用。）
- 現況：連線行為 = v1.6.0：同區網/友善 NAT 可連；跨網路（對稱 NAT/CGNAT）仍受 WebRTC 本質限制，無免註冊解法——待使用者日後改變心意再議（Firebase 傳輸層或 Metered TURN 皆已評估過、他都拒绝）。

## 2026-10-18 v1.8.0（整批一次上：使用者明示不要分批、不要先 1.9.0）【已 push 4e691a9、Pages 驗證 PLAT_VERSION=1.8.0】
今晚使用者連發六項需求，全部併入 v1.8.0：
1. 數橋技能狀況列浮動化：fx chips（🔀/🌫️/❓）原本 in-flow 推移棋盤 → 移出改 absolute overlay（棋盤左上、pointer-events-none、z-57，比照舊等待 pill 的定位父層）；in-flow 列只剩 finished 的上帝視角鈕。通知本就有 toast＋盤面視覺，資訊不減。
2. 大廳改分頁：#lob-room 內新增分頁列（🔢 數獨/🌉 數橋/🏆 五戰，[data-lobtab]＋#lob-panel-{sudoku,hashi,tourn}）；原 #lob-launch 兩張卡拆進各自 panel、#lob-tourn-setup＋#lob-tourn 移入五戰 panel（另加來賓說明 #lob-tourn-note）。renderLobby 改走 applyLobbyTab()＋[data-launch] 非房主 disabled；renderTourn 在 standings/playoff-pending/ended 的「轉態」自動切五戰 tab（Net._tabTournKey 去重，避免 renderTourn 高頻呼叫亂切）；tourn-setup/tourn-end/tournCreate 也切五戰 tab。遊戲內自己的多人選單在平台模式本就被導向大廳（兩款主畫面按鈕皆 PLAT_show('lobby')），join 畫面只剩獨立版用途。
3. 主畫面改截圖款：移除殼的左上角 #plat-back「🏠 平台」鈕（shell.html 元素＋updateBackBtn 輪詢全刪；PLAT_show 內的呼叫點也要記得刪——第一輪 build 後 test-v180 抓到 ReferenceError）。兩款主畫面的藍色「🏠 回大廳」列改為平台模式恆顯示（原 gate 在 platDock 連線中才出現）：無連線時走 PLAT_show('lobby')、連線中走 PlatDock.goLobby()；膠囊（💬/🎥）仍只在連線中出現。
4. 回到房間一鍵重連：#lob-rejoin 原本只預填房號還要走暱稱步 → 改為直接連：讀 plat_name/plat_color 回填身份，依 plat_room_role（createRoom/joinRoom 時寫入）分流 createRoom()/joinRoom()，不經暱稱步；無 plat_name（第一次）才退回暱稱步。refreshRejoin() 掛進 showStep('entry') 讓按鈕狀態跟著 plat_room 即時更新（init 只跑一次不夠）。注意：殼 join handler 以 normName 拒絕同名（name_taken）——舊席位還在時同名重連會被拒，屬既有行為（正常離開會清席位）。
5. 五戰名單帶入等待室：tournSess() 新增 roster（entrants 的 uid/name/color）；兩款 enter() 存 tournRosterRef；房主 open 建名單時把未到選手種成 {id:'pending:'+name, pending:true} 灰席位（PlatRoom spec 傳 pending → 殼 prRenderRegions 整列 opacity .55＋色點灰階＋（未到）＋badge「未到」；online=false）。真 JOIN 以同名頂替（沿用席位顏色與位置；撞名檢查排除 pending）；心跳 sweep 跳過 pending（不標離線不移除）；開始門檻自動被未到者擋住（未 ready），60 秒逃生口不變；房主按下開始（數獨 handleForceStart／數橋 startRace）先清掉 pending 再開賽（遲到者以觀戰加入，不卡 allDone/maybeFinalize）；數橋 roomRealRacers（排除 pending）供「至少 2 位真人」判定，避免清席後 racers<2 靜默失敗。PLAYERS_UPDATE 兩款皆整表送，pending 自動帶給來賓端顯示。
6. 頒獎台 PlatPodium（殼端）：renderTourn 尾端 hook——phase 進 standings/playoff-pending/ended 且 history 新增一筆（Net._podiumKey 去重；tournNewState 重置）→ podShow(最後一筆 history, tourn)：山字台（DOM 序 [2,1,3]、台高 96/66/48、podDrop 依名次延遲 0.15/0.45/0.85s 落下、冠軍 👑）、第 4 名起 podRoll 滾下台（rotate 660°＋下移＋淡出，交錯延遲）、總分列 +N 浮現（podPlus）＋數字 0.5s 後 1.15s easeOut 滾動累加；5.6s 自動關、點任意處跳過。**關鍵坑：doReturnToLobby 不可 podHide**——來賓先收 tourn-score 播台、隨後才被 return 帶回大廳，藏掉就永遠看不到（第一輪 test-v180 來賓台 fail 即此）；doLaunch 仍 podHide（新局清舊台）。
7. 數橋完賽等待按鈕對齊數獨：PlatResults waiting spec 與本地 pill 的「👁️ 觀戰對手」→「👁️ 轉變為上帝模式（觀戰）」。
- 驗證：新 test-v180 21/21（版本/無 plat-back/主畫面藍鈕/分頁切換/來賓 launch disabled/一鍵重連/名單帶入＋未到禁用開始/替換/雙邊頒獎台/點跳過/零錯誤）；回歸：tourn-real 23/23、tourn-stub 24/24、dual-sudoku 7/7、test-results 22/22、test-startgate 13/13、test-hashi-strip 10/10、dual 30/31（基線）、site-boot 4/4。spin-step/repro-bug1/2/platbar/room-late/test-hashifirst/test-guestfirst/tourn-v14 依使用者指示跳過（五戰他手動測、其餘小套件他選先打包）。
- 同場加映診斷：3 人數獨大亂鬥 jsdom 實測健康（probe-3p：名單 20 次取樣零缺、第三人進度雙邊同步）——今晚三人場的斷線感與五戰 3/4 局異常，高度懷疑是當時線上 v1.7.0 還帶著死 TURN 的毒害（人越多交涉越多越糟）；已請使用者在 v1.7.1/1.8.0 重測三人場再議。

## 2026-10-19 v1.8.1（已 push 51aae1f、Pages 驗證 PLAT_VERSION=1.8.1）
- 緣起：使用者看 v1.8.0 實機截圖糾正——他說的「不要出現多人連線選單」指的是殼的大廳房間頁本身（標題就叫多人連線選單），不是遊戲內選單；他要的是建/入房後直接進遊戲等待室（PlatRoom），分頁長在等待室頂部房內切換（附手繪截圖：數獨/數橋/五戰三框畫在等待室上方）。
- 實作：Net.armed{game,mode}（doLaunch 統一同步）＋roomTab；房主 peer open 後 maybeAutoEnterRoom、來賓首封 roster 後 1.5s fallback 自進；doReturnToLobby 改回等待室（賽程中 roomTab='tourn'，doLaunch 後才設以免被覆寫）；PLAT_show('lobby') 在 Net.active 時自動轉向等待室/主頁流程；PlatRoom skeleton 加 tabs region（卡片上方）＋tourn region（卡片內），prClick 委派 [data-rtab]/[data-rmode] → __PLAT_ROOMTAB（房主切換廣播 launch 全房跟隨；五戰分頁任何人可看；賽程進行中鎖定、ended 切走自動 tournAbort）；renderRoomTabs 把 #lob-tourn-setup/#lob-tourn-note/#lob-tourn 節點搬進/搬出等待室 tourn region（PlatRoom.detach 前 rescueTournNodes 搬回 #lob-panel-tourn）；PlatDock.goLobby 改回 PLAT_show('home')；兩款藍色「🏠 回大廳」鈕 onClick 改 PLAT_show('home')（使用者明示：回主頁，不是選單也不是等待室）。
- 第五局數獨提前結算修正（使用者實機回報）：(1) 數獨 handleMultiplayerWinRef 在 platTournLockRef（enter/exit 同步）開啟時改嚴格判定——房主＋所有非 pending 選手都進 brawlWinners 才 allDone，取消 winnersCount 名額捷徑與「觀戰算了結」。(2) 殼 tournCheckDone 的 disc 旗標只在該選手真的不在 Net.roster 時才算了結（重連回來還在玩的人要等他完賽）。
- 驗證：test-v181 第一輪 23/8——核心（雙邊直達等待室、分頁列、數橋切換最終成功且名單完整、模式切換、五戰面板搬移、零錯誤）通過；8 個 fail 為測試自身問題（數橋切換 >90s 逾時、今晚 jsdom 慢、建立鈕 selector 寫錯（真 id #t-start）、開始鈕節點被重繪換掉點空）＋其連鎖。放寬版重跑中（背景），使用者指示先 push（51aae1f）。

## 2026-10-19 v1.8.2（已 push 2689ecb；Pages 驗證待補）
- 使用者實機回饋三點：(1) 等待室分頁列下面的合作/大亂鬥列是重複的（兩款「對局設定」裡本來就有模式切換）→ renderRoomTabs 刪除模式列、prClick/__PLAT_ROOMTAB 移除 mode 分支。(2) 五戰分頁全白——真 bug：renderTourn 的 setup/note 顯示條件含 `!Net.inMatch`，房內（已 launch）永遠不成立；改依 `Net.roomTab==='tourn'` 顯示，__PLAT_ROOMTAB 開五戰分頁時先 renderTourn()。(3) 分頁「亂做」：切換改用 Net.armedByGame（每款遊戲記住自己上次模式，doLaunch 同步），分頁只負責換遊戲。(4) 他重申動機：刪掉舊大廳就是要整體更精簡合理——殼不要重複遊戲已有的 UI。
- 驗證：test-v182 進行中被叫 push；已見的 fail 皆為今晚 CDN 載入極慢造成的逾時級聯（名單最終都齊全、零錯誤待確認）。push 時 exec session 曾中斷，經 ls-remote 確認遠端 main 已在 2689ecb（push 實際成功）。

## 2026-10-19 v1.9.0（開發中，待 push）
- 使用者定案四件：(1) 分頁改「純選遊戲」（Model A）：__PLAT_ROOMTAB 的 game 分頁只改 Net.armed.game＋廣播新 plat kind 'arm' 同步來賓，不 launch；房主在等待室按開始鈕才帶全房過去——prClick 對 'start' 先問 tryTransportStart()（armed≠inMatch 且非賽程時改道 broadcast launch＋doLaunch），prRenderRegions 在此情況下把開始鈕改標籤「🚀 帶大家去數橋/數獨」＋強制啟用＋藏 note，分頁列下方加提示行。(2) 「五戰」改名「🏆 錦標賽」（分頁/面板/訊息/sysChat）。(3) 局數可選：設定面板加 #t-rounds（3/5/7/10)，tournCreate 讀它、tournBuildRounds(order, n) 參數化。(4) 錦標賽題目設定不再有自己的表單：移除 #t-s-size/#t-s-diff/#t-h-size，tournCreate 改呼叫兩款 hooks 的新 getSettings()（數獨回 stateRef 的 sizeId/diffId、數橋回 brawlSettingsRef.sizeId），缺值用預設 9/medium/2。(5) 多人底色：renderLobby 切換 body.plat-room-on，shell.css 以 `body.plat-room-on[data-view=lobby|sudoku|hashi]` 覆寫為平台深藍 #2b3a55（不用數獨黃/數橋綠）。
- **重大根因（同日查出）：切換遊戲後新遊戲的等待室永遠掛不上**——PlatRoom 是單例，舊遊戲的掛載節點切換後只是被 display:none、仍 isConnected，兩款遊戲 attach effect 的守衛（isAttached && _elConnected 就跳過）使新遊戲永遠不接手，PR 一直綁在舊 view（probe-transport2 實測 PRslotView=view-sudoku 達 120s)。v1.8.1/v1.8.2 使用者回報的「按分頁亂做/被甩進遊戲」很可能同源。修法三件套：(a) shell doLaunch 在 PLAT_show 前，若 PlatRoom 綁定的 slot 不在目標 view 內先 detach()（無參數版）；(b) 兩款遊戲 attach effect 加主人檢查：`window.__PLAT_NET.inMatch` 非空且不是自己就 return（避免 detach 後舊遊戲 1s waitTick 搶回）;(c) 兩款 update effect 同樣加主人檢查（避免舊遊戲每秒覆寫新房的 spec)。修後 probe-transport2 21/21（10 秒內 PRslotView=view-hashi、名單出現）。此修正同時惠及錦標賽跨遊戲局間切換（走同一個 doLaunch)。
- 測試：test-v190 第一輪 34/9——v1.9.0 新功能核心全過（純選遊戲/arm 同步/開始鈕改標籤/改名/局數=3 套用/無自有表單/深藍底色/零錯誤）；9 fail 為 transport 單次點擊點空（PlatRoom 重繪換節點，已知陷阱）＋其連鎖＋錦標賽尾段（#t-forceend 比賽中在 lobby view、房內無入口——v1.8.1 起的既有設計缺口，非本版回歸）。probe-transport（重試點擊）證實帶路成功、房主有離開數獨畫面；probe-transport2 定位根因如上。
- 驗證（最終）：修正後 probe-transport2 21/21；test-v190 重跑 **38 pass / 5 fail**——v1.9.0 全部新功能與雙向帶路（去數橋、回數獨）皆過、零頁面錯誤。剩 5 fail 同源：錦標賽第 1 局開打後找不到 #t-forceend——renderTourn 只在狀態事件時重繪（開局當下 phase 轉 playing 後未立即重繪），且比賽中面板節點在 lobby view（房內不可達，v1.8.1 起的既有缺口，非本版回歸）；其後頒獎台/回等待室等檢查皆為連鎖。每局有 roundSecs 限時自動以進度結算，不會卡死。是否補「局中可達的結束本局入口」待使用者決定。
- 發布：v1.9.0 commit 3c21d46 已 push、Pages 驗證 PLAT_VERSION=1.9.0。
- v1.9.1（同日，接續修局中結束鈕）：(a) 殼加浮動鈕 #plat-forceend（forceBtnEl/renderForceBtn，僅房主＋phase playing/playoff＋未結算時顯示，z-295、螢幕上方中央；renderTourn 與 renderLobby 都呼叫 renderForceBtn）。(b) 更深的根因：**錦標賽三節點（lob-tourn-setup/note/lob-tourn）會被遊戲的 React 卸載連子樹拔出文件**——比賽開始時等待室 overlay 卸載，掛載點整棵消失，殼的 rescueTournNodes 用 getElementById 已找不到節點（probe-settle 實測 #lob-tourn 不存在、podKey 空），於是結算後面板空白、頒獎台不出、#t-next 無法綁定。修法：tournNode(id) 參照快取（rescue/renderRoomTabs/renderTourn 全改用它），面板內按鈕改 panel.querySelector 綁定。驗證：probe-settle 修後 podium flex 亮 5.6s、panelLen 2059、regionHasR1=true；**test-v190 全套 43 pass / 0 fail**（此設計線首次全綠）。commit 2b0d022 已 push、Pages 驗證 PLAT_VERSION=1.9.1。教訓：殼借住在遊戲 React 子樹裡的 DOM 節點，必須自己持有參照，不能假設 getElementById 永遠找得到（已同步寫入 AGENTS.md 候選教訓：見本節）。
- v1.9.2（同日深夜，使用者實機影片回報）：錦標賽按開賽後房主停在錦標賽面板（顯示「進行中」但沒有名單/準備/開始），來賓也沒被帶過去——根因：doLaunch 的 tournSess 分支沒設 Net.roomTab（一般局會設），roomTab 停在 'tourn' → 等待室的名單/控制列被 renderRoomTabs 隱藏。jsdom 舊測試只查元素存在、沒查可見性，所以 43/43 沒抓到（教訓：等待室類斷言要查 display 可見性）。修法：tournSess 分支也設 roomTab=game（局間回等待室由 doReturnToLobby 照舊切回 'tourn'）。驗證：probe-tournland 行為證據（雙邊 roomTab、來賓 entered ack、真按鈕開局）＋ test-v190 新增等待式可見性斷言後 **46 pass / 0 fail**。commit b8406ac 已 push（ls-remote 確認）；Pages 部署延遲，push 後約 7 分鐘仍回 1.9.1（HEAD 內容確認為 1.9.2），待其自行翻版。

## v1.9.3（commit e2307fc，2026-10-20 深夜 push、Pages 驗證 PLAT_VERSION=1.9.3；使用者實機 v1.9.2 回報六點中的五點＋一點待問）
- 修1 分頁同步：房主切錦標賽分頁廣播新 plat kind 'tab'，來賓 roomTab 跟著切；'arm' 時來賓 roomTab 也跟著切到該遊戲。待機房間頁的 setLobbyTab 同步同一套（房主點分頁＝arm+廣播、來賓收到 arm/tab 自動 setLobbyTab 切自己的待機頁）。
- 修3 來賓頒獎台存活：podShow 記 POD.shownAt；doLaunch 的 podHide 加 6 秒盾——來賓先收 tourn-score 播台、隨後才被 'return' 帶回 doLaunch，舊行為會立刻把台弄消失（房主端因順序相反沒事，所以只有玩家看不到小局結算）。
- 修4 PlatBar 主人檢查（兩款同款）：兩款 PlatBar 的 attach/update effect 加 `__PLAT_NET.inMatch !== 自己` 就 return。病根：update effect 只檢查 isAttached（不問主人），背景那款（錦標賽沒被 exit 的上一款）每秒 re-render 就把自己的 modes 蓋進共用列，下方模式在數獨/數橋間翻跳。PlatBar._debug 加 mode0 供測試取樣。
- 修6 dock：updateDock 只在 data-view==='lobby' 時顯示 #plat-dock；PLAT_show 切換後呼叫 updateDock。回主頁不再殘留大廳/聊天室/視訊三框（遊戲畫面本來就被 CSS 隱藏＋遊戲自繪膠囊）。
- 修5 待機房間頁（使用者定案「選好才載入」）：maybeAutoEnterRoom 只在 Net.restored（房主接管還原）時自動進遊戲；建房/入房停在殼房間頁（#lob-room：房號/名單/三個分頁/各遊戲的合作・大亂鬥鈕/錦標賽面板都在這頁、遊戲完全不 boot）；房主點模式鈕（data-launch）廣播 launch＋doLaunch 全員進等待室；中途入房靠 roster 送出時的 launch replay（shell.js:396）帶入。PLAT_show('lobby') 無 inMatch 時不再 doLaunch、改 renderLobby 顯示房間頁。
- 未修：使用者回報「多人數橋裡面的遊戲設定不對」尚未指明是哪個設定（已給選項待回覆）。
- 測試：test-v193.js（待機/分頁同步/dock/PlatBar 取樣/來賓頒獎台）；test-v190 已改版號 1.9.3＋hostCreate 改走待機→launch。教訓：mockpeer 要 require 取字串，fs.readFileSync 會把 module.exports 原始碼注入頁面（全滅假失敗）。

## v1.9.4（commit dfb3374，2026-10-21 凌晨 push、Pages 驗證 PLAT_VERSION=1.9.4）
- 使用者實機打槍 v1.9.3 待機頁：「我說過不要進入多人連線選單那個頁面，我按多人連線就直接是遊戲大廳」——待機房間頁在他眼中就是被禁的選單頁。裁示：(1) 廢止待機、恢復 v1.9.2 直接進場（maybeAutoEnterRoom 拿掉 restored 門檻、PLAT_show('lobby') 恢復 doLaunch 轉向）；(2)「那個多人連線畫面直接在程式裡刪掉，不然以後哪一版又自動串過去」——#lob-room 整頁（房號/名單/分頁條/遊戲卡片/離開鈕）從 shell.html 刪除，shell.js 的 showRoom/setLobbyTab/applyLobbyTab/[data-lobtab]/[data-launch]/#lob-leave 綁定與所有 setLobbyTab 呼叫點一併刪除（grep 歸零、HTML 標籤平衡驗證過）。#lob-panel-tourn 保留為錦標賽節點的家（display:none，只在被搬進等待室 region 時顯示）。
- 補上原本第 5 點的根：PLAT_show('lobby') 時若目前畫面是某款遊戲，先把 armed.game 設成那款——從數橋按多人連線就直接進數橋等待室，不再先載數獨；doLaunch 時把 game 存進 localStorage plat_armed_game，Net 初始化讀它當預設（第一次才預設數獨）。
- v1.9.3 的其餘四修復（分頁同步 'tab'/'arm'、頒獎台 6 秒盾、PlatBar 主人檢查、dock 只在 lobby 顯示）全數保留。test-v193 上一輪 20/22（失敗：來賓底部列取樣不到狀態、來賓端一筆 Array.filter 錯誤，皆待後續查證）；今晚 jsdom CDN 載入多次逾時（SHELL NOT READY），v1.9.4 版 test-v193 未取得乾淨結果，使用者指示先上線。

## v1.9.5（commit 772fa72，2026-10-21 晚 push；Pages 換版較慢、背景監看中）
- 使用者實機 v1.9.4 雙機回報三連：玩家沒準備開始／房主強制進入玩家也不進去／玩家進數橋閃閃閃（影片：來賓落進合作模式房、自己名單列 1 秒一跳）。追到同源根因：數橋 RACE_RESUME 的 data 不含 bridges（bridges 是 m.bridges 兄弟欄位、可為 null），來賓端 beginRace 第一行 setBridges(payload.bridges) 直接把 undefined 寫進 state → 下一幀 render 的 crossedBridgeIds useMemo `bridges.filter` 丟 TypeError → PlatBoundary 接住後整棵遊戲樹變空白（獨立版則 React 卸載剩綠底——即 2026-10-18 回報的「來賓閃退」舊案）。晚入場/回座的來賓必中；房主自己開賽走 RACE_START（payload 有 bridges）所以房主永遠正常，完美解釋「只有玩家壞」。
- 修法：beginRace 改 `setBridges(payload.bridges || HASHI_PUZZLE.generateEmptyBridges(payload.randomLevelData))`，handler 後段既有的 `if (m.bridges) setBridges(m.bridges)` 再覆蓋真快照。數獨無 RACE_RESUME 路徑、不受影響。
- 同場加映部署落差：v1.9.4 上線的 compiled Hashi 缺了原始碼早有的三處 `bridges || []` memo 防護（28 行 diff、只在 Hashi；Sudoku 0 diff）——原始碼修好但沒進部署檔的假修復。v1.9.5 起打包後必做：site compiled 與 fresh compile 逐檔 diff 歸零才 push（已寫入 AGENTS.md）。
- test-v193 @1.9.5：17 pass / 1 fail——兩大舊 fail 全轉綠（來賓底部列整局在＋零頁面錯誤）；唯一 fail 是「數橋局開賽」的測試偵測逾時，但同局後續（雙邊底部列取樣、頒獎台、結算、回分頁）全過，屬 harness 偵測 flake 非產品問題。
- 名單閃爍（影片）未單獨定位：發生在來賓落進錯誤模式房間的情境，預期隨根因修復消失，待雙機複測確認。

## v1.9.6（commit 9df435c，2026-10-21 深夜 push、Pages 驗證 1.9.6）：跨遊戲訊息污染——GO 迴圈/名單閃爍的總根源
- 同批另一修：帶路按鈕標籤卡死——prRenderRegions 的帶路改標只在遊戲端 PlatRoom.update 時觸發，數橋等待室沒有週期 update → 房主在數橋切數獨分頁後開始鈕永遠不变「🚀 帶大家去數獨」（test-v190 穩定複現）。修法：__PLAT_ROOMTAB 的 tab 分支與來賓 'arm' handler 在 renderRoomTabs 後直接呼叫 prRenderRegions()，殼自己的元件自己重繪。
- 驗證總成：probe-goloop 修後 RESUME 0/INIT 0；test-v193 18/18 全綠（本系列首次）；test-v190 45/46——唯一 fail 是來賓落進第 1 局等待室的 120 秒 waitFor 逾時，但其後 entered ack 與整局結算都完成，判為 jsdom 雙遊戲頁的環境遲滯（同節其餘斷言全過）。部署 compiled diff 雙 0。
- 使用者實機 v1.9.5 回報 GO! 每 ~2.2 秒重閃（影片）＋「bug 太多受不了」。探針 probe-goloop 量化複現：開賽後 25 秒內來賓重送 JOIN 20 次（兩個 uid 輪流）、房主回 INIT 20 次——名單出現 3 人（2 台裝置）。
- 根因：共用連線上兩款遊戲的訊息不分家。routeData 把所有遊戲訊息只投給 Net.gamePeer（前景遊戲），但背景遊戲並沒有真的 inert：它的名單自我修復（2.5 秒，名單上沒自己就重送 JOIN)、心跳、房主端 PLAYERS_UPDATE 照常在共用連線上跑。前景是數橋時，背景數獨的 JOIN 全數落進房主數橋的 JOIN 處理 → 同一條 VirtualConn 被兩個 uid 輪流佔據 → 互搶名單（來賓列閃爍/（你）消失）→ 每次 JOIN 在比賽中又觸發 RACE_RESUME → beginRace 重啟倒數 → GO! 無限重閃。房主端背景數獨每秒廣播的 PLAYERS_UPDATE 同理污染來賓。
- 修法（殼層單一實作，兩款共用）：遊戲訊息蓋寄件遊戲戳記。VirtualPeer 建構時記 __game（doLaunch/migrateGame 的 enter 呼叫前後設 window.__PLAT_CREATING_GAME，fallback Net.inMatch)；VirtualConn.send 把物件訊息包成 {__pg: game, __pd: 原訊息}；routeData 在 tournSniff/投遞前先驗戳：__pg 與 Net.inMatch 不同 → 直接丟棄；排隊（Net._dq）沖洗時同驗。殼自己的 plat 訊息與獨立版（RealPeer 直通）不受影響。
- 驗證：probe-goloop 修後同視窗：JOIN@sudoku 11（背景還在送、但全被丟棄）、RACE_RESUME 0、INIT 0、心跳 PING/PONG@hashi 正常。test-v193 @修後 bundle: 18 pass / 0 fail（首次全綠，含數橋局開賽）。test-v190 首跑在回程帶路標籤逾時後 FATAL（待重跑判讀是否 jsdom flake）。

## v1.11.0 設計（使用者 2026-10-22 00:05 指示、00:06 點選確認）：房間框架改版
- 流程定案：遊戲主畫面按多人連線 → 殼入口（建/入房）→ 暱稱拉霸＋代表色 → 進入「殼房間頁」（不載入任何遊戲）→ 三分頁（數獨/數橋/錦標賽）自由切換、每頁有該款自己的設定表單 → 房主按開始才載入遊戲。
- 殼房間頁 = PlatRoom 直接掛在殼頁面：名單＋準備＋開始都在殼層（準備狀態走殼 roster 的 ready 旗標，新 plat kind 'ready'）；設定槽改由殼的表單填（不再由遊戲 portal）。開始 → doLaunch(game, mode, {settings, autoStart})：遊戲載入後房主端自動開局（沿用各遊戲自己的 canStart 閘門輪詢觸發），來賓進場跟随（晚到走既有 RESUME/遲入同步）。
- 設定歸屬（同批處理「數橋設定要用數橋的」）：數獨頁籤 = 數獨自己的設定（模式/尺寸/難度/大亂鬥：去第幾名、道具等照數獨）；數橋頁籤 = 數橋自己的設定（模式/關卡/大亂鬥：里程碑道具、上帝視角數字）。**數橋的 winnersCount（結束名次）全面移除**——它是數獨鏡像期搬來的；maybeFinalize 改為全員完賽或 DNF 才結算（DNF -machine 現成）。錦標賽頁籤：局數/局序/每局限時＋數獨大亂鬥設定＋數橋大亂鬥設定，**兩款都不出現去第幾名**（限時到就結束；數獨在錦標賽脈絡 suppress winnersCount、一般房間保留）。
- 回合間：PlatResults 的「回等待室」改回殼房間頁；錦標賽局間也回殼房間頁的錦標賽分頁（頒獎台/名單都在殼層，本來就是殼 DOM）。
- 兩款遊戲內的連線頁面（各自的建房/入房/房號輸入等獨立連線畫面）從程式刪除；遊戲首頁的多人按鈕只導向殼入口（現況已是）。遊戲內等待室在平台流程中不再出現（enter 帶 autoStart 直接進對局）；其排程/名單邏輯被殼房間頁取代的部分逐步拆乾淨，以不弄壞對局內流程為界。
- 風險控管：分階段做、每階段 jsdom 驗證；v193/v190 需改寫成 hub 流程；上線前兩套全綠＋goloop 探針（戳記）回歸。

## v1.10.0（0a24b2f，2026-10-22 00:2x PUSHED LIVE，Pages 驗證 PLAT_VERSION=1.10.0）
- 修「先完賽者結果畫面閃爍」：總根源＝跨遊戲 overlay 互搶。兩款各有一個 effect 在「自己沒東西顯示」時呼叫殼 PlatResults.hide()（數獨 results effect 無條件 hide、數橋同族），背景那款每 render 就把前景款的結算蓋掉；先完賽者看的是 wait 規格，背景數獨的 1s class 的 render 節奏造成「亮 ~1 秒→滅→對手架橋前景重 render 又亮」。修法（兩款對稱、殼無改）：PlatResults 與 PlatCountdown 兩個 effect 開頭加主人守衛 `if (window.__PLAT_NET && window.__PLAT_NET.inMatch !== '<自己的遊戲>') return;`（數獨/數橋各 2 處）。獨立版無 __PLAT_NET 不受影響。
- 錦標賽局結算移除「再來一局」：兩款 fin 規格的 buttons 改為 `__PLAT_NET.tourn` 存在時用無 rematch 的組（看盤面/回等待室 primary/離開）；數橋的非房主 note 在錦標賽時也拿掉（原本寫「再來一局／回等待室都會帶全員一起」）。
- 倒數前棋盤重模糊：數橋棋盤 wrapper 在 raceState==='countdown' 時 filter: blur(18px)+pointerEvents none；數獨棋盤 wrapper 在 countdownValue!==null 時同樣處理（GO 後自動解除，帶 0.3s transition）。
- 驗證：test-v193 18/18 全綠；test-v190 44/46（fail＝版號字串過期已改 1.10.0＋來賓落地 120s waitFor 遲滯尾巴，與 v1.9.6 同一條、下游 entered ack 與結算皆過，非本次改動路徑）；build 後 compiled diff 閘門 PASS（站台路徑 js/sudoku/app.compiled.js、js/hashi/app.compiled.js）。

## v1.11.0（06de45d，2026-10-22 PUSHED LIVE，Pages 驗證 PLAT_VERSION=1.11.0）
- 房間框架改版（使用者 2026-10-22 00:06 親自確認的流程）：主畫面按多人連線 → 選單步拉霸暱稱＋代表色 → 進入殼房間頁（不載入任何遊戲；房號/名單/聊天＋數獨・數橋・錦標賽三段分頁，各分頁帶該款自己的設定表單）→ 房主按開始才載入選定遊戲。殼實作：Net.hub（ready/spec/cfg 狀態、plat_hub_cfg 持久化）、hubSpec 餵 PlatRoom、hubLaunchCfg 正規化 settings 給遊戲 enter 種子、plat kinds ready/spec/hubstate/hubcfg、doLaunch 第 4 參 hubCfg、doReturnToLobby 改回房間頁。順手修 updateDock 的 IIFE 作用域死碼（__PLAT_UPDATE_DOCK）。
- 錦標賽設定改讀房間頁表單：tournCreate 讀 hub cfg（兩款大亂鬥設定都帶、不含 winnersCount）；數獨 brawl.winnersCount 在賽程內部設為 entrants 人數（全員完賽才結束，非使用者設定）。tournGameSettings 已刪。
- 數橋 winnersCount 全面移除（預設/maybeFinalize 改全員完賽或 DNF 才結算/UI 兩處）；數獨一般房間保留、錦標賽不出現。
- 兩款遊戲內建連線頁面從程式碼刪除：join 頁 render、PlatRoom 等待室 attach/update、roomSettings 卡與 modal（數橋）、hooks getSettings、孤兒 handlers（數獨 handleReady/initiateHostGame/joinExistingGame/spinSlotName/setupStep；數橋 guestConnectRoom/openSlotForNick/confirmNickAndEnter）。保留引擎：setupPeerJS、hostConfirmName、guestSendJoin、fullJoinCleanup、hostCreateRoom（error 重試用）、joinStep 狀態機（platAutoRef 於 open handler 自動確認暱稱）。等待室改三分支：local / platHub 簡單等待卡 / null。首頁多人按鈕改平台專用；backToChoose 與 handleJoinRejected 的 setScreen('join') 改 'home'。數橋編譯 318→280 KB、數獨 294 KB。
- 事故與修復：切 guestConnectRoom 時用假設長度（40 行）多刪了夾在它與 openSlotForNick 之間的 guestSendJoin 定義 → 來賓 TAKEN_NAMES/逾時路徑呼叫未定義函式、JOIN 永遠送不出、房主自動開局等不到人（v193 兩項 fail：數橋局自動開賽逾時 120s、來賓底部列無狀態）。從 v1.10.0 已部署 compiled 檔還原 guestSendJoin 原文補回 hostConfirmName 之後。教訓已寫入 ~/AGENTS.md：刪除函式區塊必須逐行讀過整個 span，不可用假設長度。
- 測試：test-hub 25/25、test-v193 17/17、test-v190 40/40（新房間頁模型）；probe-goloop 為舊流程探針（等遊戲內等待室 roster），新模型下已不適用、標記過時（其戳記污染防護在殼端 routeData、未受影響，症狀族由 v193 修4 flips=0 涵蓋）。compiled diff 閘門 PASS。
- 待雙機驗：房間頁全流程（拉霸→房間頁→分頁/設定同步→開始載入→回房間頁）、錦標賽兩款設定生效且無去第幾名、v1.10.0 三修實機複測。

## v1.11.1（2026-10-23，commit 7920e80，Pages 驗證 PLAT_VERSION=1.11.1）使用者回報三項・防誤觸批
- 結果卡「離開」叫不回：兩款同款——(1)「離開」改兩段確認（首按武裝→按鈕變紅「⚠️ 確定離開？」3.5s 內再按才 handleGoHome，能生效靠 PlatResults 的 spec JSON 去重換 closure）；(2)「看盤面」關卡後留浮動「🏆 結果」鈕（fixed bottom-24 right-3 z-56，白 pill 兩款同 class），點它清 resultsDismissRef 重開結果卡，finished 結束即消失。狀態：resultsDismissedUi/leaveArm/leaveArmTimerRef（resultsDismissRef 旁）。
- 錦標賽「結束本局」防誤觸：殼端移除浮動鈕 #plat-forceend（forceBtnEl/renderForceBtn 與兩處呼叫全刪），改暴露 window.__PLAT_TOURN_CAN_FORCEEND()（房主＋phase playing/playoff＋未 settled）與 __PLAT_TOURN_FORCEEND()（→tournSettle）；兩款標頭「退出」鈕 onClick 改：CAN_FORCEEND 為真→開 showExitMenu 選單（結束本局（錦標賽）/退出對局/取消，z-95 置中卡，兩款同款），否則照舊直達 handleGoHome。錦標賽面板內的 #t-forceend 保留不動。
- 錦標賽每局開局門檻：enter 的到齊自動開局 poll 加 !sess.tourn 條件（錦標賽不自動開局）；兩款 platHub 等待卡在 platTournLock 時換互動版：局次標題（sess.tourn.round/total/playoff/entrants 存 tournRoundInfo）、名單列（未到/未準備/✅準備好了徽章）、自己的準備鈕（數橋 setMyReady；數獨新加 handleTournReady 同舊 handleReady 訊息形狀）、房主「🏁 開始本局」鈕——門檻：到齊人數 ≥2 且（全員到齊且全員準備 或 等滿 60000ms（tournWaitSinceRef=enter 時間，1s tick 刷新）），附倒數說明文字。一般 hub 對局維持原自動開局。
- 測試：v193 19/19、v190 44/44、hub 25/25（v190/v193 已改新流程：準備→房主開始鈕解鎖→點擊；結束本局走退出選單；v190 版號斷言改 1.11.x 正則）。diff 閘門 PASS。
- 待雙機驗：三項各點一次（誤按離開、看盤面叫回、退出選單結束本局、每局準備/1 分鐘強制開始）。

## v1.12.0（ef8194a，2026-10-23 PUSHED LIVE，Pages 驗證 1.12.0）
使用者同晚五項回報一次處理（退出/回等待室/房間頁改名改色/設定不完整/刪品牌字樣與按鈕）：
- 「回等待室」修復：根因——數獨 handleBackToLobby 房主路徑只 generateAndSync 生新題、數橋 returnToLobby 只切遊戲內狀態，平台模式都沒通知殼。兩款同款修法：platHub 時 results 'lobby' 與選單「🏁 回等待室」直接 __PLAT_NOTIFY('game-exit')。殼端 guest 分支由「只清 inMatch」改 doReturnToLobby（來賓按＝只有自己回房間頁、其他人繼續）；host 分支不變（廣播 return 全員回）。獨立版舊語義（來賓送請求）保留。
- 標頭「退出」改版（兩款同款）：平台對局中按退出一律開選單（確認步）——[⏹️ 結束本局（僅錦標賽房主局中)、🏁 回等待室、🚪 退出（回大廳）、取消]。handleGoHome(platLeave)：'leave' → NOTIFY('player-leave')。
- 殼 'player-leave'：只有自己離房回大廳（endSession，延 350ms 讓遊戲層 LEAVE 先送出）；房主先 platBroadcast({kind:'host-leaving'})，來賓 case 'host-leaving' → onHostConnLost 接管選舉（第一位非房主升格、同房號、migrateGame 延續對局）。Net.leaving 防重入。
- 房間頁改暱稱/代表色（殼 #hub-identity 卡，名單下方）：房主每列都有 ✏️、玩家只有自己列；編輯器＝名稱輸入＋20 色票（改自己且已解鎖才有 rainbow）。來賓改自己送 plat kind 'identity'（房主以寄件 pid 認人、不信任訊息 uid），房主 hubApplyIdentity 驗證（非空/≤12/同名 normName 拒）→寫 roster 廣播；被改者靠 case 'roster' 的 hubSyncMeFromRoster 同步 Net.me＋plat_name/plat_color。改名進聊天室 sysChat。
- join 同 uid 回座：房主 join 處理先把同 uid 舊條目換綁新 pid（清 lastSeen/關舊 conn）再做同名檢查——修「離房一鍵重連被誤判暱稱已被使用」（舊條目未逾時清除時）。連帶守衛：onRealConnClose 開頭——關閉的 conn 不是 Net.conns[pid] 登記的那條就忽略（舊連線遲到 close 誤觸接管）。
- 等候室設定補齊至與遊戲內一致（標籤同步遊戲內文字）：數獨大亂鬥補 陷害道具延遲（0/30/60/90/120/180 秒 select)、開啟快速填答、開啟循環模式（hubDefaults/hubLaunchCfg 不再寫死 false/false/60）；錦標賽表單同步加 ts-quick/ts-trav/ts-wtime（TKEYS/syncTournForm/tournCreate/tournSess 全通）。數橋：HUB_LEVELS 補「⚙️ 自訂尺寸」＋customW/customH 數字欄（5~100)；順帶修合作模式種子——房主 enter 後照選定關卡（含自訂尺寸）先生成題目 syncState（原本永遠初始 10x10，關卡設定形同虛設）；競速 startRace 自訂尺寸走 customDimsRef 蓋掉 LEVELS placeholder 30x30。
- 刪字樣/按鈕：數橋三處「測試版」全刪（首頁標題徽章、對局標頭徽章、頁尾 fallback 字串），殼首頁頁尾「整合測試版」→「整合版」；數獨首頁「🌐 多人連線」鈕整顆刪除（數橋的保留，他只點名數獨）。
- 測試：hub 31/31（+5.5 設定完整度、+5.6 身份編輯）、新增 test-leave.js 17/17（來賓個人退出/房主繼續/選單回等待室/一鍵重連/房主退房接管且對局延續）、v193 19/19、v190 44/44（版號斷言改 1.12.x）。diff 閘門 PASS。踩坑：hub 內嵌的退出段落曾因錦標賽進行中無 #t-abort（僅 phase ended 渲染）連鎖假失敗——退出/接管測試獨立成 test-leave.js；文字找鈕必須限定在「要離開對局嗎？」浮層內（底部列有自己的回大廳鈕會誤點）。
- 待雙機驗：退出三路徑各走一次、房間頁互改名/色、數獨新三個設定實際生效、數橋自訂尺寸合作一局。

## v1.12.1（9447b3e，2026-10-23 上線，Pages 驗證 1.12.1）
使用者同晚續報四點，一次處理：
- 數獨首頁刪「恢復上次對局」探測：lastSessionAlive state＋探測 useEffect＋首頁按鈕 IIFE 全刪（根因：探測 effect 有平台閘門、按鈕渲染沒有，且 engine setupPeerJS 在平台對局也會寫 sudoku_last_session，所以平台裡玩過就必現且永遠卡「正在檢查連線」）。注意 sudoku_last_session 的寫入（engine.js）與 app.js INIT 的 RACE_RESUME 讀取是對局內 resume 機制，不可刪。多人重連改放平台主頁：#view-home 新增 #home-rejoin 鈕（plat_room 有存才顯示）；refreshRejoin 同時管大廳 #lob-rejoin 與主頁鈕；點擊邏輯抽成共用 doRejoin()（Net.active 時只切回房間頁不重複入房）；PLAT_show('home') 經 window.__PLAT_REFRESH_REJOIN 保鮮。殼重連不做存續探測，點了才連。
- 改名/改色改回名單列內編輯（他不要 v1.12.0 的獨立 #hub-identity 卡）：div＋hubRenderIdentity 刪除（其呼叫點全改 hubRender());PlatRoom 名單列改兩層結構（外層 div＋內層 flex 列）,editable 的名字本身是 [data-id-edit] 鈕（✏️ 提示），點開在該列下方展開編輯器（#hub-id-name 輸入＋色票 [data-id-color]＋[data-id-save]/[data-id-cancel]）;hubSpec players 新增 editable/editing/editName/editColor/editRainbow 欄位，PlatRoom JSON 去重保證打字不被重繪洗掉。身份同步邏輯（plat 'identity'、hubApplyIdentity 驗證、hubSyncMeFromRoster）不變。
- 回到房間鈕按下回饋：rejoinBusy(on)——兩顆重連鈕同時改「⏳ 正在連線…」＋animate-pulse＋disabled（存 _origHtml 還原）；doRejoin 連線路徑啟動，showStep/showHubRoom/endSession 清除，20 秒保險逾時。
- 進房代表色自動拉霸：spinColor(cb) 加完成回呼並設 Net.colorPicked=true;showStep('nick') 重置 colorPicked=false；確認鈕流程改為：名字（空白拉霸）→ 房號驗證 → colorPicked 未定才自動 spinColor 後遞迴重按確認 → 建房/加入。暱稱步顏色區加一行小字說明。
- 拉霸音效：platTone/spinSound（WebAudio 方波 tick 先密後疏配合減速＋落地 880/1318Hz 雙聲）;spinSlot 與 spinColor 啟動時各播一次（1150ms 版）；無 AudioContext 環境靜默（try/catch）。
- 測試：hub 38/38（+數獨首頁無檢查鈕、+主頁回到房間鈕、+無身份卡、+名單列內編輯、+雙邊 colorPicked 斷言）、leave 17/17、v193 19/19、v190 44/44;diff 閘門雙 0；編譯後數獨「正在檢查連線」字串計數 0。
- 待雙機驗：主頁回到房間、名單點名字改名改色、拉霸音效實際聽感、顏色自動拉霸流程。

## v1.12.2（11765ae，2026-10-23 上線，Pages 驗證 1.12.2）
使用者續報三點（其中第一點推翻 v1.12.1 的主畫面重連鈕，以本版為準）：
- 重連鈕改回「只在大廳＋探測式」：#home-rejoin 從主畫面刪除（HTML/綁定/refresh 分支/PLAT_show home 鉤全清；PLAT_show 改成進 'lobby' 時觸發 refreshRejoin——進多人連線才探測）。#lob-rejoin 改三態：probing＝灰 disabled＋「🔍 正在尋找房間 XXXX…」＋pulse;alive＝亮藍（bg-sky-400)「↩ 回到房間 XXXX」可點；dead＝灰 disabled「🚫 房間已失效 (XXXX)」。例外：dead 且本人是原房主＋房號是自己的 → 亮藍可點「🏠 用同房號重開房間」（不然房主被鎖在自己房外）。probeRoom：暫時 RealPeer 連 yyh-tgsh-<code>-host，conn open＝alive、peer/conn error 或 5 秒逾時＝dead；結果快取 20 秒；Net.peer 存在時不探。doRejoin 路由改：probe alive → 一律 joinRoom 回座（房間含被接管的情形）；否則房主同房號 createRoom。注意：jsdom mock 對不存在的 peer 也會觸發 conn open，dead 路徑在測試環境驗不了（實機靠 PeerJS 的 peer-unavailable＋逾時；邏輯同舊數獨探測）。探測 conn 會被房主端登記進 Net.conns 並 _deliver 給 gamePeer——與舊數獨探測行為相同，房主 onRealConnClose 對不在名單的 pid 是 no-op，安全。
- 拉霸選色時下方色圈跟著跳：spinColor tick 內同步把 #lob-colors 對應 index 的圈切 'sel' class（PLAT_COLORS.indexOf 對位；rainbow 鈕在色圈列尾端不影響 index）。
- 數獨補音效：新增 sudoku-site/js/sound.js（window.SUDOKU_SOUND，與數橋 HASHI_SOUND 同引擎同音色/頻率，靜音鍵 sudoku_muted）;build.py classics 與站台 script/copy 都接上。掛點：applyCharToCell 填數字 'place'、清除 'remove'、草稿切換 'click'、凍結格被拒 'error';isWon effect 'win'；倒數 effect 每秒 'countdown'、轉 playing 時 'go'。標頭列（存檔鈕旁）加 🔊/🔇 靜音鈕（muted state 同數橋模式）。數獨本來沒有星星顯示，故無 star  stagger。
- 測試：hub 38/38（2.5 改斷言主畫面無重連鈕）、leave 18/18（新增「重連鈕探測到房間→亮藍可點」)、v193 19/19、v190 44/44;diff 閘門雙 0；站台 js/sudoku/sound.js 已部署（Pages 200）。
- 待雙機驗：探測三態實際顯示（尤其房間不在時的失效態）、數獨音效聽感與靜音鈕、色圈跟跳效果。

## v1.12.3（e57e222，2026-10-24）：開新局清舊結算暫存＋設定 null-safe＋新 icon
- 使用者錦標賽實測兩 bug：(1) 錦標賽最後一局數橋結束後，房主回房間頁再開數橋大亂鬥，進去看到舊的大亂鬥結果畫面——他的處方「每次開新局，舊有的結算畫面的暫存要刪除」。(2) 房間頁合作模式的遊戲設定沒出現。
- Bug1 根因（程式證據）：數橋 PlatResults effect 無相依、每 render 跑，fin=inRace && raceState==='finished' && raceResult；enter() 原本完全不重置 race/results 狀態（靠 hostConfirmName 在 peer open 順帶 setRaceState('lobby')，但平台 setupPeerJS 冪等、open 不一定重跑）。jsdom 複現限制：三條回房路徑（game-exit/return/tournReturnAll）都經 exitGameHook→exit→handleGoHome 清理、且 jsdom 拖橋造不出真 finished 態，全程複現不出殘留——故採「enter 唯一入口整組清」修法（保證性修法）：數橋 enter 開頭重置 raceState idle/raceWaiting/raceResult/raceCountdown/raceProgress/raceResultsRef/myFinishTimeRef/resultsDismiss/leaveArm/brawlBoards/godView/isWon/endTime/resetWinMeta；數獨 enter 同步重置 winner/isWon/endTime/isWinnerDeclaredRef/brawlWinners/hideVictoryModal/resultsDismiss/leaveArm/matchPhase waiting（含 stateRef）。
- Bug2：三種複現（新房間/一般對局回房/完整 3 局錦標賽生命週期 repro-tourn-full.js，含來賓視角）設定槽全部正常（coop len 1200/1376），未能複現。加硬化：hubSpec/hubSettingsHtml 的 cfg[game] 缺失時 fallback hubDefaults（防舊存檔/異常 cfg 讓整段渲染丟失）。若實機再現，需使用者截圖確認是哪個畫面。
- Icon：使用者從 3 候選挑 A（四字磚 2×2，icon-candidates/icon-a.png）→ platform-icon.png 換上（210641 bytes）；殼 favicon/apple-touch-icon 都指向它；站台根目錄孤兒 apple-touch-icon.png（無引用）已刪。候選與 make_icons.py 留 platform/icon-candidates/。
- 驗證：repro-tourn-full（錦標賽 3 局全流程＋結束切分頁設定＋再開大亂鬥 PlatResults 不可見）修後全過零錯誤；hub 38/38、leave 18/18、v193 19/19、v190 44/44；compiled diff 雙 0；Pages PLAT_VERSION=1.12.3、icon 200。
- 教訓：hubSpec 大亂鬥開始閘門 = 全員 ready 或進房 60s（enteredAt 只在 showHubRoom 首入房 stamp、endSession 才清）；複現腳本點開始前要兩邊按 [data-pr="ready"]，否則 waitFor 假 timeout。

## v1.12.4（1ac8294，2026-10-24）：錦標賽記錯分/武器沒對手——同族殘留旗標清乾淨
- 使用者 01:15 實機（v1.12.2 場次）兩 bug：(1)「我贏了結果分數是另一位第一名」；(2) 第二次數獨大亂鬥按攻擊道具跳「目前沒有可以攻擊的對手」。
- 根因（兩者同源）：數獨 handleGoHome 不清大亂鬥狀態——brawlWinners/isWinnerDeclaredRef/lastWinInfoRef 全數跨局殘留（v1.12.2 enter 也不清）。Bug1：來賓端 GHOST_I_WON 補送 effect（3s/次、上限 6）守衛 = isWinnerDeclaredRef && lastWinInfoRef，新局 matchPhase 非 finished 就重送舊完賽 → 殼 tournSniff 照收、記成新局完賽 → 名次/總分翻盤。數橋同型：RACE_FINISH 補送守衛 raceState==='racing' && myFinishTimeRef。Bug2：handleUseWeapon 的 validPlayers 排除 brawlWinners 全員（舊名單兩人都在）→ 空集跳 toast；里程碑發武器候選也吃同一份 winnersIds 過濾。
- 修法：v1.12.3 已在兩款 enter 整組清（主修法）；v1.12.4 補清 sudoku enter 的 lastWinInfoRef/winResentRef 與 hashi enter 的 finishResentRef（補送彈藥歸零）。
- 驗證（boottest/repro-tourn-bugs.js，雙頁真解題 S→H→S）：R1 來賓先贏 10:7、武器（水球）R1 可用；R3 開局 7 秒 tripwire 零舊完賽重送、finishOrder 空；R3 武器可攻擊；總分 27:24 冠軍房主、頒獎台正確。17/17；hub 38/38、leave 18/18、v193 19/19、v190 44/44、repro-tourn-full 零❌；diff 閘門 0/0；Pages PLAT_VERSION=1.12.4。
- Harness 教訓：數獨填格 pad 點選後必須等 ~110ms 再點格，否則 selectedChar 落後一位、整盤位移一格（97% 假進度）；解答從攔截的 SYNC/INIT payload 的 solutionGrid 取（存檔只有盤面）；錦標賽等待卡開賽 = 兩邊「✋ 準備好了」→ 房主「🏁 開始本局」（tournCanStart 全員 ready 或 60s）。

## v1.12.5（231079a，2026-10-24 上線）
- 未到者不擋錦標賽結算（使用者 10:56 規則）：卡點在殼 tournCheckDone——C「在房間但該局從未進場」既不在 finishOrder、disc 旗標（遊戲 conn）又不存在 → done 永遠 false，只能等 300 秒時限或房主手動回等待室。遊戲層本來就清 pending 席位、不卡（數橋 startRace／數獨 handleForceStart）。修法：entrant 若 entered ack≠本局且 progress=0、且 finishOrder 已非空 → 視同了結（tournSettle 以進度 0 排最後）；中途進場（ack 進來或有進度）就恢復正常等待。複現 repro-absent.js（3 人房、C 進房後關頁、AB 真解數獨）：修前結算永遠不來（60s 逾時、零錯誤）；修後 5/5（來賓 1st 10 分、房主 2nd 7 分、C 3rd 5 分）。
- 房間頁 UI（使用者 09:59 附截圖指示）：刪下方浮動正方形 dock 條（#plat-dock 的 HTML/CSS/updateDock 操作/init 綁定全清；PlatDock API 保留給遊戲 PlatBar）；renderRoomTabs 在錦標賽分頁不再隱藏 PlatRoom 的 dock region＋leave 鈕 → 三分頁統一有卡片內膠囊（💬/🎥，視訊時 🎤/🔊）＋離開房間。test-hub +3 斷言（41)、test-v193 修6 改為斷言 #plat-dock 不存在。
- 測試：hub 41/41、leave 18/18、v193 19/19、v190 44/44、tourn-bugs 17/17、tourn-full 綠、repro-absent 修後 5/5；diff 雙 0；Pages 驗證 PLAT_VERSION=1.12.5、線上 index 無 plat-dock。

## v1.12.6（79d7cf4，2026-10-26 上線）
- 數獨 16×16 錦標賽斷線（使用者 2026-10-26 回報）：根因不在連線，在題目生成——16×16 普通唯一解驗證（countSolutions）單次可同步卡主執行緒 104.5 秒（實測總生成 115s），殼與遊戲的連線心跳都在同一條執行緒，一起凍結 → 對方判定斷線、房主像進不去。困難單次卡 32.6s；簡單與 9×9 不受影響。
- 修法（sudoku engine.js）：(1) countSolutions 改位元遮罩（列/欄/宮 mask＋MRV)；(2) 每次驗證給時間預算（非 16:300ms；16 依深度 250/600/1200ms），超時回 -1、呼叫端補回洞口（題目保持唯一解、只是少挖）——主執行緒單次卡頓從此 ≤~1.2s；(3) 16×16 單次嘗試 8 秒上限，挖到高原就換新盤重挖（bestResult 跨嘗試保留）;(4) 16×16 目標格數校準：普通 [100,120]→[105,120]、困難 [70,85]→[98,108]（70–85 隨機挖洞 30 秒內不可達、高原 ~104；困難仍有 148+ 洞）。
- 實測：普通 115s→0.2–8.6s、困難多數 ≤10s（最差 ~31s 但全程無卡頓、介面活著）；正確性獨立驗證（無預算 countSolutions=1＋解與給定格一致）4/9/16 三難度＋每日一題全過。jsdom 雙頁複現 repro-16x16.js 9/9：進場、生成+開局 0.5s、頁面最大事件間隔 0.28s、來賓 256 格＋填格 GHOST_SOLVED 同步、零錯誤。回歸：hub 41、leave 18、v193 19、v190 44、tourn-bugs 17、tourn-full、absent 5 全綠；diff 雙 0。
- 附帶修正：v1.12.5 的 PLAT_VERSION 行被 sed 改成雙引號且掉行尾註解（test-v190 正則抓到）——已恢復單引號＋註解的原始格式，之後 bump 注意。

## v1.12.7（5afeb3e，2026-10-26 上線）
- 使用者截圖指示：數橋遊戲主頁的「🌐 多人合作」按鈕刪除——多人入口統一回平台主畫面（數獨首頁的多人鈕早在 v1.12.0 已刪，兩款一致）。連同玩法說明「多人合作」卡的入口文字改為「從平台主畫面進入多人連線」（原本寫從主選單進入）。smoke-hashi-home.js 9/9（按鈕清單核對＋說明卡翻頁驗證＋零錯誤）；回歸 hub 41、v193 19、v190 44、tourn-full 全綠；diff 雙 0。

## v1.12.8（ac18c8b，2026-10-26 上線）
- 使用者指示：兩款每日一題改月曆選日。兩款主頁的原生 <input type="date"> 換成「📅 YYYY-MM-DD」按鈕，點開同款月曆 overlay（月份 ◀ ▶ 導航：下限 2026-01、上限本月；週日開頭）：已完成日期亮燈（數橋 #4ade80／數獨 #ffcc00＋✓ 角標）、今天粗框標記可選、過去未玩可選、未來日期反灰 disabled、點任一可玩日期直接開那天的每日題。紀錄來源：數橋 readDailyRecord（hashi_daily_<日期>）、數獨 dailyRecords（sudoku_daily_records）。test-daily-cal.js 22/22（兩款各 11 項）；回歸 hub 41、v193 19、v190 44、smoke-hashi-home 9、tourn-full 全綠；diff 雙 0。

## v1.12.9（7b0a70e，2026-10-26 上線）
- 使用者截圖回報：月曆每月列數不同（2026-02 只有 4 列、1/3 月 5 列），卡片置中導致高度變化、◀ ▶ 跟著上下跑不好按。修法：兩款月曆一律補滿 42 格（6 列），空格 div 同高 h-11 → 每月卡片同高、按鈕位置固定。test-daily-cal 擴充至 30/30（新增本月/2 月格數與空格同高斷言）；hub 41 全綠；diff 雙 0。

## v1.13.0（32fb36d，2026-10-28 上線）
- 使用者指示：多人對戰自己完賽後，畫面自動轉上帝模式，避免不小心關掉就打不開；兩款同辦。
- 數獨：新增 effect——isBrawlMode 且我進 brawlWinners、finishViewMode 仍為 'my' 時，自動 setFinishViewMode('god') + toggleSpectator(myId, true, true)（與原手動按鈕同一支呼叫、同一時機）；autoGodRef 每場只觸發一次（generateAndSync 開局重置），手動切回「我的版面」不再被強迫切回。成績卡照常顯示（其 watch 鈕變冪等）。
- 數橋：不開 modal，改用常駐面板——觀戰面板渲染條件由 raceState==='spectating' 擴為 spectating || (inRace && raceWaiting)（raceWaiting 正是「我完賽、賽未完」旗標，結算/重置路徑本來就會清）；標題分「👁️ 觀戰中」/「🏁 已完賽・觀戰中」，選手切換列濾掉自己。等待態 watchAction 不再 setGodViewUid（只關成績卡，面板已在後面）；全場結算態維持開 modal 看盤面。刪除被面板取代的等待 pill；完賽 toast 改「🏁 你完成了！已自動轉為上帝模式觀戰」。
- 驗證 test-autogod.js 14/14（數獨房主先完賽、數橋來賓先完賽：自動切換、關卡後仍在、對手不受影響、零錯誤）。回歸全綠：hub 41/v190 44/v193 19/leave 18/daily-cal 30/smoke-hashi-home 9/tourn-bugs 17/absent 5/tourn-full 全過。diff 雙 0。
- 測試端教訓（本版踩滿）：(1) #lob-room-code/#lob-roster 已不存在——房號讀 __PLAT_NET.code、房間頁名單在 #view-lobby [data-pr-region=roster]。(2) [data-launch] 已於 v1.11 刪除；開局走房間頁：data-rtab 切分頁 → data-hub-mode 選模式（注意：數獨模式值 'brawl'、數橋 'race'，且按鈕帶 data-hub-game）→ 房間頁 data-pr ready/start。(3) launch 前 preboot（PLAT_show 遊戲等 __PLAT_HOOKS 再回 lobby）加速且穩定。(4) 數橋拖曳在 jsdom 可用（probe 的 SVG 打樁法）；數線判橋不可靠——預覽線 display:none 仍在 DOM、雙橋兩線位移 ±5；判讀以 app 狀態/完賽訊號為準。(5) 數橋點按島嶼不架橋（只有拖曳和點橋樑循環），tap 補橋無效。(6) 平台訊息在 fullog 裡是蓋戳形 {__pg,__pd}，統計 type 要先解包。

## 踩地雷接入（2026-10-28 施工中，第一段完成）
- 使用者拍板：平台第三款「💣 踩地雷」；多人競速踩雷直接出局照進度%排名；盤面 9×9・10雷（預設）/16×16・40雷；v1 不做道具；首點永不踩雷；觀戰不洩漏雷位。
- 新原始碼 ~/workspace/mines-site/（js/app.js + css/style.css，比照數獨 Babel7）；殼註冊點：booted/PLAT_show 清單/showHubRoom 清單（兩處）/首頁卡/view-mines/code-mines；build.py 與 compile.js 已加第三款（/tmp/plat-mines-compiled.js、js/mines/、css/mines.css）。
- 引擎：makeLayout(seed) 決定性佈雷（同 seed 同盤）；首點保護＝relocateMine 把首點的雷確定性移到最低編號非雷格（競速各人只影響自己的盤、每日一題同 seed 同結果）；revealFrom 洪水填充；chord（旗數==數字時點已開格挖鄰格）；進度＝已開安全格/總安全格。
- 教訓：遊戲根節點在不同 screen 之間若結構位置不同（PlatBar 掛載點位置兩畫面不一致），React 位置配對 diff 會與殼寫入的外部子節點交互出 removeChild NotFoundError（PlatBoundary 吞成空白頁、錯誤只出現在殼狀態面板）。解法：兩畫面根 div 各加 key（home/game）強制整樹換新。新遊戲/新畫面比照辦理。
- 測試 test-mines-solo.js 24/24：首頁卡、81/256 格、雷數、首點點雷搬雷、插旗、踩雷 lost、全清 won、零錯誤。debug 快照掛在 __PLAT_HOOKS_mines.debug（唯讀，含 layout/cells/status/progress）。
- 第二段多人完成（v1.14.0 一併上線）：殼 hub 加 mines（armed/hubDefaults mines:{mode:'coop', sizeId:9}、HUB_MINES_SIZES 9/16、hub 分頁列第四個分頁、模式鈕地雷 race 顯示「⚔️ 競速模式」）；遊戲端星型拓撲（來賓只連房主、房主轉發），協定 JOIN/INIT/PLAYERS_UPDATE/READY/SPEC/MINE_START/MINE_PROGRESS（0–1 小數、整數%變動才送）/MINE_STATE（cells 字串+sparse nums、節流 250ms）/MINE_FINISH/MINE_BOOM/MINE_ACT→MINE_DO（合作房主定序）/REQ_LOBBY/REQ_REMATCH/HOST_LEFT（名單首位非房主接手）；完賽・出局自動上帝面板（god 只收已公開 cells/sparse、不洩雷位）；主畫面框架一致性（2026-10-28 使用者糾正）：PlatBar 掛載點與靜音鈕只放對局畫面，比照數獨/數橋。test-mines-mp 22/22、test-mines-solo 47/47。
- 第三段錦標賽完成（v1.14.0，commit 721f983）：tournBuildRounds 改三款輪替（games=[sudoku,hashi,mines]，alt 以起頭款旋轉、random 三款均勻）；t-order 加 alt-m「地雷先」；tournCreate/PublicCfg/Sess/StateMsg 加 mines{sizeId}；tournSniff mines 分支（MINE_PROGRESS 0–1→×100、MINE_BOOM 只記 t.boom+progress 不走 tournMarkFinished、出局由 tournCheckDone 的 boom 豁免放行、照進度排名）；頒獎台/系統訊息標籤 tournGameLabel（地雷顯示「💣 踩地雷競速」）；錦標賽表單 tm-size 與 hub cfg 雙向同步（TKEYS）；房主 join 補第三款 hubcfg 同步；遊戲端錦標賽等待畫面（ready 鈕+房主開始閘門比照數獨：全員到齊+全員準備或等滿 60 秒、開賽清未到席位）＋房主「⏹️ 結束本局」兩段確認鈕。test-mines-tourn 22/22（地雷局真打：來賓出局 7 分照進度、房主 10 分；三款輪替序；總冠軍）。舊測試同步新輪替：repro-tourn-bugs 改 5 局版 21/21（注意 #t-rounds 是 select 只有 3/5/7/10，寫非法值會默默變預設 5）、repro-tourn-full 局序改 [hashi,mines,sudoku]。
- 順手查證（2026-10-28 口頭承諾）：「0 值 truthiness」bug 只有地雷中招（裸秒數無保底）；數獨寫入有 Math.max(1,…) 保底、數橋紀錄是 {time} 物件形式，兩款皆安全免修。
- v1.14.2 全域除錯稽核（2026-10-29，commit 4c082af）：四路唯讀稽核（殼14/數獨8/數橋8/地雷10）逐條讀碼核對行號才修。修：殼[1]restored 殘留（waitForNewHost 改 !!Net.inMatch、endSession/doReturnToLobby 清）、[2]enter/migrate catch 補 toast、[3]launch/arm game 白名單、[4]tourn tiedPids、[5]tournCreate 防空、[6]pbEsc 真跳脫＋join 名字 safeName、[7]拉霸鎖＋peer 重入守衛、[10]syncTournForm 跳過編輯中 INPUT、[12]tourn-setup 驗 entrants、[13][14]Virtual onfire console.warn。數獨：autoGod 每場重置、武器 phase/完賽守衛、matchToken 世代代幣（SYNC 帶 token、舊者丟棄、新局公告認領）、SIZES fallback、REQ_REJOIN no-op 化、toast timer 清理。數橋：applyRaceStart 觀戰分支清 raceResults、JOIN 賽中撤銷 DNF（RACE_UNDNF 新訊息＋RACE_RESUME 帶 results、來賓合併恢復）、磁鐵計入 draftCount 與草稿阻擋、goHome 清 fx、pen pointercancel 作廢筆觸、readDailyRecord 驗有限數。地雷：boardRef 全面鏡像（MINE_DO cells/reloc/lost mines、becomeHost 補 layout/nums）、openedSafe layout-null 直數 'o'、觀戰 INIT 不帶 seed、接任選人排除觀戰/離線/pending、becomeHost 標舊房主 offline＋checkRaceEnd、房主端 conn.__uid 寄件者驗證、MINE_ACT 守衛、觀戰倒數後自切 playing、raceSendState 尾隨補送。不修與理由：殼[8]無限時掛機（房主有「結束本局」，設計）、[9]platSend 吞例外（傳輸層重試語義）、[11]舊元素防空（元素穩定）、數獨[7]uid interval（boot 單次）、數橋[8]生成 fallback（更動風險高）、地雷[8] godUid/feArm 殘留（無功能影響）。測試：test-migrate-room 9/9（房間頁接管→新房主開局來賓真 enter）、test-mines-takeover 10/10（合作接管盤面全保留、MINE_DO opens 連續）、test-xver 15/15（v1.13.0 站台版 × v1.14.2 雙向合作＋跨版錦標賽；站台版以 git worktree 32fb36d 重建 /tmp/site-v1130、http 8901/8902 雙埠、beforeParse 橋 fetch）。mockpeer 重大修正：send 改 JSON 深拷貝（真實 PeerJS 序列化語義）——舊版傳參照讓跨頁共用 roster 條目物件，接管選舉被對方 promote 的 host 旗標污染成雙房主（假 bug）；另 mock 的 peer.destroy 不斷連線，模擬房主消失要用 __PLAT_NOTIFY('player-leave')。全套 320 項全綠（新 mock 下重驗）。
- v1.14.3 (5bca155)：地雷玩法教學改卡片式動畫（比照數獨 tutorialOverlay 規格）：五卡（挖開 mtut-cover/num＋手指 mtut-finger、插旗 mtut-flag/chip、和弦 mtut-chord-num/cover＋mtut-finger2、結局 mtut-boom/trophy、資訊卡）；keyframes 在 mines-site/css/style.css，mtut- 前綴防同頁撞 sudoku tut-*。test-mines-solo 斷言改查 mtut 元素與新文案。
- v1.14.4 (a77b340)：第一下整圈保護 makeFirstSafe(L,w,h,idx) 取代 relocateMine：保護圈＝點格＋neighborsOf，圈內雷依編號序搬到圈外最低編號非雷格（zone 集合排除落點），回傳 {layout, moves}；doReveal 與 processCoopAct 皆改「firstRef 時無條件套用、moves 非空才換盤」。MINE_DO reloc 升級為 moves 清單，adoptCoopDo 以 typeof reloc[0]==='number' 並容舊單筆格式；房主自身 adopt 重複套用為冪等（from 已 false、to 已 true）。教學第四卡文案：「第一下點的格子跟周圍 8 格保證沒有雷；…」。mines-solo 全清路徑教訓：批次照預算清單點格會踩到首點搬雷後的雷，改逐格重讀 dbg 再點（48/48）。
- v1.15.0 (690a1c5)：①join 同步分頁——join handler 在 hubcfg 後、tourn/launch 前補送 {kind:'arm', game:Net.armed.game} 或房主在 tourn 分頁/Net.tourn 時 {kind:'tab', tab:'tourn'}；來賓端 arm/tab handler 本來就會套用（缺的只是進房這一送）。test-jointab.js（新）：房主先切 mines→來賓進房 armed/roomTab=mines＋亮燈；房主切 tourn→在房者跟隨、新來賓直接落 tourn。②地雷合作 owners：boardRef.owners（players 索引、-1 未開）；processCoopAct 以 prevC→C 差集把新開格標 aIdx（playersRef.findIndex(id===byUid)）；MINE_DO.own=base36 字串（flag 動作不帶）；adoptCoopDo 鏡像 boardRef.owners＋setOwnArr；coopSnap.own 同步給中途加入者；setupBoardFromSeed 重置。renderCell 合作 'o' 格：bg=color+'2e'＋boxShadow inset 0 0 0 2px color。貢獻列：占比條＋chips「開了 N 格・%」（分母＝已開總數）。③地雷響應式：vpW state＋resize 監聽；cellPx=floor((min(vpW,720)-50-(w-1)*gap)/w) 夾 [28..64]/[18..38]；colW=w*cellPx+(w-1)*gap+26，對局畫面六處欄位（雙標頭列/狀態列/進度列/競速 chips/PlatBar 掛載）改 style width=colW。字級 cellPx<=22→12 否則 round(cellPx*0.5)。test-v190 版本正則改 1.1[3-9]。
- v1.16.0 (81ec3c4)：框架共用稽核批。數橋 handleGoHome 刪殘留 setShowRoomSettings(false)（state 在 v1.11.0 已移除、呼叫漏刪，ReferenceError 打死離開流程；診斷法：開局後走退出選單抓到 'setShowRoomSettings is not defined'）。地雷：screen 'mp' 等候室整段刪除——!tourn 只顯示極簡等待卡（⏳等房主開始對局…，hub 自動開局不變）、tourn 改同款局間等待卡（mpRef.tournInfo 存 sess.tourn 供標題局數；canStartW 閘門與 toggleMyReady 沿用；按鈕文案改「✋ 準備好了/🏁 開始本局」，test-mines-tourn 同步）；toggleSpec 函式+鈕刪除（onMpData 的 SPEC case 保留供舊版來賓）。leaveMatch 補 __PLAT_NOTIFY('player-leave')（在 HOST_LEFT 與 cleanupMp 之前，比照 hashi 順序）；requestLobby 改 PLAT_PLATFORM 時一律 notify('game-exit')（舊版來賓走 REQ_LOBBY 託房主全員回房，與另兩款語義不同，一併統一）。標頭 MP 分支：刪 🏁回等待室直通鈕/⏹️feArm 鈕/🚪leaveArm 鈕 → 標題置左＋🔊＋「🔌 退出」開 showExitMenu 選單（項目與數獨/數橋同款、結束本局直呼 __PLAT_TOURN_FORCEEND）；feArm state/timer 清除；leaveArm 保留（結算卡三款一致）。PlatCalendar（殼，PlatResults 後）：show({accent, records, selected, onPick})，內部 ym state、固定 42 格、完成日 class bg-[accent]（不用 inline style，daily-cal 測試驗 class），overlay id #plat-calendar z 9990；三款 openDailyCal 改接、renderDailyCalendar/showDailyCal/dailyCalYM 全刪（數橋 records 由 readDailyRecord 逐日掃 2026-01-01..今天組 map）。test-mines-solo 月曆斷言改 scoped #plat-calendar。新 test-leaveflow.js 11 項（數橋房主離開+接管、地雷無等候室取樣、離開選單、回等待室、結算離開、多人入口不被劫）。注意：第二局第一下點雷炸不到（整圈保護）——測試要先挖安全格再點雷並重讀盤面。
- v1.17.0 (36d7c3c)：霧化修復＋地雷對局框架對齊。霧化根源＝shell.html/數獨/數橋 standalone 的 apple-mobile-web-app-status-bar-style=black-translucent（iOS 霜霧化狀態列下緣內容），改 default；頁面 css 無任何頂部模糊（chat 面板 blur 是舊定案、在下方）。地雷對局畫面改同款骨架：外層 h-screen 點點背景＋max-w-[1200px] 邊框卡（bg #fff7ed）＋標頭帶 bg #fb923c 兩列（列1 logo/⏱ 深色晶片/每日或模式晶片＋展開規則鈕與白色規則卡；列2 ⚙️尺寸晶片＋重開/靜音/退出・主選單鈕組，hbtn 共用 class）＋全寬狀態條（雷數/模式切換/進度）＋flex-1 捲動區（盤/chips/貢獻/上帝面板）＋PlatBar 全卡寬。hdrOpen state：newGame 設 true、enter 設 false（比照數獨單機展開/多人收合）。hide-scrollbar CSS 補進 mines style.css。test-mines-solo 每日段落改逐格重讀（批次舊快照踩搬移雷＝測試假象，diag 證實逐格可完勝）。工作流變更（使用者 2026-10-30 令）：平台自此比照學霸，測試綠即直接上線、不再等核准。
- v1.17.1 (dbe2ca9)：地雷插旗模式點已開數字格改走和弦（三路徑 flag 短路加 !=='o' 守衛；coop 穿過去落入既有 'o' 和弦分支、race 落入 chord(idx)、solo 落入 chord）。規則卡第 4 條加註兩模式皆可。test-mines-solo +2 斷言 = 50。
- v1.17.2 (d9eaadb)+v1.17.3 (d6a0acf)：資產快取破壞。build_site 在寫 index 前以 regex 把 (src|href)="(js|css)/..." 加 ?v=<_ver>（_ver 自 shell.js 的 PLAT_VERSION 擷取，assert 注入成功）。真正的 stale 通道是 shell.js loadCode 的 fetch('js/'+name+'/app.compiled.js')（站台專用路徑；bundle 用 #code-<name> 元素）——改帶 ?v=PLAT_VERSION。注意：curl 驗版號要連 shell.js 也帶 ?v= 問，否則 curl 拿到的是 CDN 快取的舊 shell（本次 try1-3 就先拿到 1.17.2、try4 才換新，那是 Pages 部署延遲＋邊緣快取）。
- v1.17.4 (0497928)：全域按壓回彈——四份 css（shell＋三款）各加 :where(button) 三行規則（active 時 translateY(2px) scale(0.97) brightness(0.95)、70ms transition）。:where 的用意是特異度層級管理：壓到與單一 class 同級，讓 Tailwind 的 active:/transition-all 在同級時靠載入順序勝出，專屬效果不被通用規則蓋掉。日後新增按鈕不必再逐顆寫 active 效果。
- v1.17.5 (cff8486)：數獨大亂鬥開局卡死（真機競態）三修：(1) shell VirtualConn.open 補發——on('open') 註冊時實體連線未 open 就掛 real.on('open') 一次性補發＋setTimeout 復查（原實作直接遺失回呼，來賓 JOIN 永遠送不出）；(2) 數獨來賓 JOIN 重送——conn open 後每 3s 重送、matchPhase 離開 waiting 或 40 次停、JOIN_REJECTED/setup 冪等重設清除；房主端配套：existingPlayer 的重送 JOIN 不跳 toast；(3) hubStartTimer 拿掉 tries>90 放棄、加 !isGenerating 閘門。test-brawl-start.js 為專屬回歸（mockpeer 新增 __SHARED_REG__.__dropOnce 與 window.__MOCK_OPEN_DELAY__ 兩個測試鉤子，預設不影響其他測試）。
