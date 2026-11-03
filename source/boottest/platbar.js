// PlatBar 共用底部列測試：兩款遊戲內列由殼渲染、互動/ popover / dock / 連線塗鴉
const { loadPage, sleep, waitFor, click, dblclick, findBtn, check, report } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/tmp/plat-diag.html');
  const pb = (scope, k) => D.querySelector(scope + ' [data-pb="' + k + '"]');
  try {
    const ready = await waitFor(() => typeof w.PLAT_show === 'function' && !!w.PlatBar && !!w.PlatDock, 600000, 'shell ready');
    check('殼＋PlatBar 就緒', !!ready);
    // --- 數獨單人（每日）
    w.PLAT_show('sudoku');
    await waitFor(() => findBtn(D, '每日一題', '#view-sudoku'), 240000, 'sudoku home');
    click(w, findBtn(D, '每日一題', '#view-sudoku'));
    const sMode = await waitFor(() => pb('#view-sudoku', 'mode-press'), 120000, 'sudoku bar');
    check('數獨底部列由殼渲染（mode-press 存在）', !!sMode);
    check('數獨模式初始＝填答', (sMode.textContent || '').includes('填答'));
    click(w, sMode); await sleep(300);
    check('點模式 → 筆記', (pb('#view-sudoku', 'mode-press').textContent || '').includes('筆記'));
    click(w, pb('#view-sudoku', 'mode-press')); await sleep(300);
    check('再點 → 塗鴉', (pb('#view-sudoku', 'mode-press').textContent || '').includes('塗鴉'));
    check('塗鴉 popover 自動開（draw-pen）', !!pb('#view-sudoku', 'draw-pen'));
    check('popover 是往上方框', (pb('#view-sudoku', 'draw-pen').parentElement.className || '').includes('absolute'));
    click(w, pb('#view-sudoku', 'draw-eraser')); await sleep(200);
    dblclick(w, pb('#view-sudoku', 'draw-eraser')); await sleep(200);
    check('點橡皮擦＋雙擊後 popover 仍在', !!pb('#view-sudoku', 'draw-pen'));
    click(w, pb('#view-sudoku', 'mode-press')); await sleep(300);
    check('popover 開著點模式 → 回填答', (pb('#view-sudoku', 'mode-press').textContent || '').includes('填答'));
    click(w, pb('#view-sudoku', 'zoom-toggle')); await sleep(300);
    const sz = pb('#view-sudoku', 'zoom-out');
    check('數獨縮放 popover（殼）', !!sz && (sz.parentElement.className || '').includes('absolute'));
    click(w, pb('#view-sudoku', 'input-cell')); await sleep(300);
    const cellBtn = pb('#view-sudoku', 'input-cell');
    check('輸入方式切格子先行（active 樣式）', !!cellBtn && /38bdf8|56, 189, 248/.test(cellBtn.getAttribute('style') || ''));
    check('數獨列存活於多次重渲染', !!pb('#view-sudoku', 'mode-press'));
    // --- 數橋單人（每日）
    w.PLAT_show('hashi');
    await waitFor(() => findBtn(D, '每日一題', '#view-hashi'), 240000, 'hashi home');
    click(w, findBtn(D, '每日一題', '#view-hashi'));
    const hMode = await waitFor(() => pb('#view-hashi', 'mode-press'), 420000, 'hashi bar');
    check('數橋底部列由殼渲染', !!hMode);
    check('數橋模式初始＝畫筆', (hMode.textContent || '').includes('畫筆'));
    click(w, hMode); await sleep(300);
    check('點模式 → 草稿', (pb('#view-hashi', 'mode-press').textContent || '').includes('草稿'));
    click(w, pb('#view-hashi', 'mode-press')); await sleep(300);
    check('單機跳過繪圖 → 畫筆', (pb('#view-hashi', 'mode-press').textContent || '').includes('畫筆'));
    click(w, pb('#view-hashi', 'zoom-toggle')); await sleep(300);
    check('數橋縮放 popover（殼）', !!pb('#view-hashi', 'zoom-in'));
    // --- 大廳 → 數橋合作 → 塗鴉 popover + dock
    click(w, D.querySelector('#btn-home')); await sleep(600);
    click(w, D.querySelector('#btn-lobby')); await sleep(800);
    click(w, D.querySelector('#lob-go-create')); await sleep(600);
    await waitFor(() => D.querySelector('#lob-name'), 30000, 'nick');
    D.querySelector('#lob-name').value = 'PlatBar測試';
    click(w, D.querySelector('#lob-confirm')); await sleep(1500);
    click(w, D.querySelector('[data-launch="hashi-coop"]'));
    await waitFor(() => findBtn(D, '開始合作', '#view-hashi'), 90000, 'waiting room');
    click(w, findBtn(D, '開始合作', '#view-hashi'));
    await waitFor(() => pb('#view-hashi', 'mode-press') && !findBtn(D, '開始合作', '#view-hashi'), 60000, 'coop board');
    check('合作盤面＋殼列就緒', true);
    click(w, pb('#view-hashi', 'mode-press')); await sleep(300);
    click(w, pb('#view-hashi', 'mode-press')); await sleep(400);
    check('合作切到繪圖', (pb('#view-hashi', 'mode-press').textContent || '').includes('繪圖'));
    check('合作塗鴉 popover（殼）', !!pb('#view-hashi', 'draw-pen'));
    check('房主有 draw-clear 🚮', !!pb('#view-hashi', 'draw-clear'));
    const dockChat = pb('#view-hashi', 'dock-chat');
    check('連線中列內有 dock-chat', !!dockChat);
    click(w, dockChat); await sleep(400);
    check('點列內 💬 → 殼聊天室開啟', w.PlatDock.getState().chatOpen === true);
  } catch (e) { check('EXCEPTION ' + e.message, false); }
  w.close();
  report(errors);
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
