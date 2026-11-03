// 本批測試：暱稱空白+自動拉霸 / 遲入房間 / PlatRoom 兩款 / 視訊 popover / 規則預設收合
const { loadPage, sleep, waitFor, click, findBtn, check, report } = require('./harness');
const PAGE = '/home/hatch/workspace/platform/platform-v1-test.html';
(async () => {
  const { w, D, errors } = loadPage(PAGE);
  const pr = (scope, k) => D.querySelector(scope + ' [data-pr="' + k + '"]');
  const prRegion = (scope, n) => D.querySelector(scope + ' [data-pr-region="' + n + '"]');
  const pb = (scope, k) => D.querySelector(scope + ' [data-pb="' + k + '"]');
  try {
    await waitFor(() => typeof w.PLAT_show === 'function' && !!w.PlatRoom && !!w.PlatDock, 600000, 'shell ready');
    check('殼＋PlatRoom 就緒', true);
    // --- 暱稱：一開始空白
    check('暱稱欄初始空白', D.querySelector('#lob-name').value === '');
    check('拉霸顯示初始 🎰', (D.querySelector('#slot-display').textContent || '').includes('🎰'));
    click(w, D.querySelector('#lob-go-create')); await sleep(500);
    click(w, D.querySelector('#lob-confirm')); // 空白 → 自動拉霸後建房
    const inRoom = await waitFor(() => D.querySelector('#lob-room').style.display !== 'none' && D.querySelectorAll('#lob-roster li').length >= 1, 60000, 'auto-slot room');
    check('空白確認 → 自動拉霸 → 已建房', !!inRoom);
    const autoName = D.querySelector('#lob-name').value;
    check('拉霸已填入名字', !!autoName && autoName !== '🎰');
    check('名單含自動名字', (D.querySelector('#lob-roster').textContent || '').includes(autoName));
    // --- 數獨大亂鬥等待室 = PlatRoom
    click(w, D.querySelector('[data-launch="sudoku-brawl"]'));
    const sRoom = await waitFor(() => prRegion('#view-sudoku', 'roster'), 120000, 'sudoku PlatRoom');
    check('數獨等待室由 PlatRoom 渲染', !!sRoom);
    check('數獨等待室標題/房號', (prRegion('#view-sudoku', 'title').textContent || '').includes('遊戲大廳') && (prRegion('#view-sudoku', 'code').textContent || '').length === 4);
    const slotOk = await waitFor(() => { const sl = D.querySelector('#view-sudoku [data-pr-slot="settings"]'); return sl && (sl.textContent || '').includes('對局設定') && (sl.textContent || '').includes('模式'); }, 60000, 'sudoku settings portal');
    check('數獨設定 portal 進殼的設定槽', !!slotOk);
    check('數獨名單含自己', (prRegion('#view-sudoku', 'roster').textContent || '').includes(autoName));
    check('數獨有準備鈕與房主強制開始', !!pr('#view-sudoku', 'ready') && !!pr('#view-sudoku', 'start'));
    // --- 開始後規則預設收合
    click(w, pr('#view-sudoku', 'start'));
    const rulesBtn = await waitFor(() => findBtn(D, '展開規則', '#view-sudoku'), 120000, 'sudoku playing');
    check('數獨進對局規則預設收合（顯示展開規則）', !!rulesBtn);
    // --- 回大廳 → 數橋大亂鬥等待室
    w.__PLAT_NOTIFY('game-exit'); await sleep(800);
    click(w, D.querySelector('[data-launch="hashi-brawl"]'));
    const hRoom = await waitFor(() => prRegion('#view-hashi', 'roster'), 120000, 'hashi PlatRoom');
    check('數橋等待室由 PlatRoom 渲染', !!hRoom);
    const hSlot = D.querySelector('#view-hashi [data-pr-slot="settings"]');
    check('數橋設定 portal（模式列＋對局設定）', !!hSlot && (hSlot.textContent || '').includes('合作模式') && (hSlot.textContent || '').includes('對局設定'));
    check('數橋名單未準備徽章', (prRegion('#view-hashi', 'roster').textContent || '').includes('未準備'));
    click(w, pr('#view-hashi', 'ready')); await sleep(600);
    check('數橋按準備 → 徽章變已準備', (prRegion('#view-hashi', 'roster').textContent || '').includes('✅ 準備好了'));
    const hStart = pr('#view-hashi', 'start');
    check('數橋開始鈕 disabled（選手不足）+ 提示', !!hStart && hStart.disabled && (prRegion('#view-hashi', 'controls').textContent || '').includes('等待選手加入'));
    // --- 遲入：房主已在等待室，朋友現在才加入房間
    const Net = w.__PLAT_NET;
    const got = [];
    await new Promise((resolve) => {
      const FP = w.__RealPeer; const fp = new FP();
      fp.on('open', () => {
        const conn = fp.connect(Net.hostPid);
        conn.on('open', () => { conn.send({ __plat: 1, kind: 'join', name: '遲入朋友', color: '#123456' }); });
        conn.on('data', (d) => { if (d && d.__plat) { got.push(d.kind + (d.kind === 'launch' ? ':' + d.game + '/' + d.mode : '')); if (got.includes('launch:hashi/brawl')) resolve(); } });
      });
      setTimeout(resolve, 20000);
    });
    check('遲入朋友收到名單', got.includes('roster'));
    check('遲入朋友被直接送進進行中的對局（launch hashi/brawl）', got.includes('launch:hashi/brawl'));
    check('殼名單含遲入朋友', (D.querySelector('#lob-roster').textContent || '').includes('遲入朋友'));
    // --- 回大廳 → 數橋合作 → 視訊 popover
    w.__PLAT_NOTIFY('game-exit'); await sleep(800);
    click(w, D.querySelector('[data-launch="hashi-coop"]'));
    await waitFor(() => prRegion('#view-hashi', 'roster'), 60000, 'coop room');
    click(w, pr('#view-hashi', 'start'));
    await waitFor(() => pb('#view-hashi', 'mode-press') && !prRegion('#view-hashi', 'roster'), 60000, 'coop board');
    check('合作開局、PlatBar 在', true);
    w.PlatDock.toggleVideo();
    await waitFor(() => w.PlatDock.getState().videoOn, 30000, 'video on');
    check('視訊開啟後底部列沒有麥克風鈕（不佔列）', !pb('#view-hashi', 'dock-mic'));
    click(w, pb('#view-hashi', 'dock-video')); await sleep(400);
    const micBtn = pb('#view-hashi', 'dock-mic');
    check('點 🎥 → 往上 popover 出現麥克風', !!micBtn && (micBtn.parentElement.className || '').includes('absolute'));
    check('popover 含喇叭與關閉視訊', !!pb('#view-hashi', 'dock-speaker') && !!pb('#view-hashi', 'dock-stop'));
    click(w, micBtn); await sleep(300);
    check('popover 內點麥克風 → 開麥', w.PlatDock.getState().micMuted === false);
    click(w, pb('#view-hashi', 'dock-stop')); await sleep(400);
    check('關閉視訊 → popover/麥克風消失', w.PlatDock.getState().videoOn === false && !pb('#view-hashi', 'dock-mic'));
    const vidBottom = w.getComputedStyle(D.querySelector('#plat-videos')).bottom;
    check('視訊圓圈 bottom 抬高至 96px', String(vidBottom).includes('96px'));
  } catch (e) { check('EXCEPTION ' + e.message, false); }
  w.close();
  report(errors);
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
