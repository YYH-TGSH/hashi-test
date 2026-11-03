// Phase D 賽程「真遊戲」切換測試：雙頁 + 真 hooks（不裝 stub），跑 R1 數獨 → R2 數橋 → R3 數獨
// 每局：雙方進等待室 → 雙方準備（自動開始）→ 倒數 overlay 取樣 → 短時限計時結算 → 雙方回大廳 → 房主下一局
// 目的：重現使用者實測「第二局卡住／玩完跳主畫面或卡住」。卡住時傾印雙頁狀態快照定位。
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
const { sleep, waitFor, click, check, report } = require('./harness');
const SHARED_REG = {};
function loadPageShared(htmlPath) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/<script[^>]+src="[^"]*peerjs[^"]*"[^>]*><\/script>/, '<script>' + mockSrc + '</script>');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errors.push(m); });
  vc.on('error', (m) => errors.push(String(m)));
  const dom = new JSDOM(html, {
    url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(window) {
      window.__SHARED_REG__ = SHARED_REG;
      window.fetch = (url, opts) => fetch(new URL(url, window.location.href).href, opts);
      window.scrollTo = () => {};
    },
  });
  const w = dom.window;
  w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message + (e.error && e.error.stack ? ' || ' + String(e.error.stack).split('\n').slice(0, 4).join(' <- ') : '')); });
  return { w, D: w.document, errors };
}
function setInput(w, el, val) {
  const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set;
  setter.call(el, val);
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
  el.dispatchEvent(new w.Event('change', { bubbles: true }));
}
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
function snap(pg, tag) {
  const D = pg.D, N = pg.w.__PLAT_NET || {};
  const cd = D.querySelector('#plat-countdown');
  const views = ['sudoku', 'hashi'].map(g => g + ':' + (D.querySelector('#view-' + g + ' [data-pr-region="roster"]') ? 'room' : '-')).join(' ');
  const active = D.body.getAttribute('data-view');
  const tourn = N.tourn ? ('phase=' + N.tourn.phase + ' round=' + N.tourn.round) : 'no-tourn';
  console.log('  [snap ' + tag + '] view=' + active + ' inMatch=' + N.inMatch + ' ' + tourn + ' cd=' + (cd ? cd.style.display + '/' + (cd.textContent || '').trim() : 'none') + ' ' + views);
}
function instrument(pg, tag) {
  const pc = pg.w.PlatCountdown; if (!pc || pc.__logged) return; pc.__logged = true;
  pg.cdLog = [];
  const os = pc.show.bind(pc), oh = pc.hide.bind(pc);
  pc.show = (v) => { pg.cdLog.push(String(v)); console.log('  [' + tag + ' countdown] show ' + v); os(v); };
  pc.hide = () => { console.log('  [' + tag + ' countdown] hide'); oh(); };
}
(async () => {
  const host = loadPageShared(HTML);
  const guest = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  instrument(host, 'H'); instrument(guest, 'G');
  // 預先 boot 兩款遊戲（模擬真人先點開過遊戲；避免 jsdom 冷啟動時間污染回合切換量測）
  for (const pg of [host, guest]) {
    pg.w.PLAT_show('sudoku');
    await waitFor(() => !!pg.w.__PLAT_HOOKS_sudoku, 300000, 'preboot sudoku');
    pg.w.PLAT_show('hashi');
    await waitFor(() => !!pg.w.__PLAT_HOOKS_hashi, 300000, 'preboot hashi');
    pg.w.PLAT_show('lobby');
  }
  console.log('preboot done');
  // 建房/入房
  host.w.PLAT_show('lobby');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  guest.w.PLAT_show('lobby');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => (guest.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'guest room');
  check('兩人進房', true);
  // 開賽：數獨 4x4 簡單、數橋預設；開賽後把每局時限縮成 7 秒（sniffer 在開賽訊號時讀 roundSecs）
  host.D.querySelector('#t-s-size').value = '4';
  host.D.querySelector('#t-s-diff').value = 'easy';
  click(host.w, host.D.querySelector('#t-start'));
  await waitFor(() => host.w.__PLAT_NET.tourn && host.w.__PLAT_NET.tourn.phase === 'playing', 60000, 'tourn playing');
  host.w.__PLAT_NET.tourn.roundSecs = 7;
  check('賽程開始（round=1）', host.w.__PLAT_NET.tourn.round === 1);

  const games = ['sudoku', 'hashi', 'sudoku'];
  let broken = false;
  for (let r = 1; r <= 3 && !broken; r++) {
    const game = games[r - 1];
    console.log('--- ROUND ' + r + ' (' + game + ') ---');
    // 1) 雙方進等待室
    const inRoom = await waitFor(() => host.D.querySelector('#view-' + game + ' [data-pr-region="roster"]') && guest.D.querySelector('#view-' + game + ' [data-pr-region="roster"]'), 120000, 'R' + r + ' both in waiting room');
    check('R' + r + ' 雙方進等待室', !!inRoom);
    if (!inRoom) { snap(host, 'H R' + r + '-stall'); snap(guest, 'G R' + r + '-stall'); broken = true; break; }
    snap(host, 'H R' + r + '-room'); snap(guest, 'G R' + r + '-room');
    const hr = host.D.querySelector('#view-' + game + ' [data-pr-region="roster"]');
    const gr = guest.D.querySelector('#view-' + game + ' [data-pr-region="roster"]');
    console.log('  [NAMES H] ' + (hr ? hr.textContent.replace(/\s+/g, ' ').slice(0, 200) : 'none'));
    console.log('  [NAMES G] ' + (gr ? gr.textContent.replace(/\s+/g, ' ').slice(0, 200) : 'none'));
    // 2) 雙方準備 → 自動開始；取樣倒數與離開等待室
    host.cdLog.length = 0; guest.cdLog.length = 0;
    click(host.w, host.D.querySelector('#view-' + game + ' [data-pr="ready"]'));
    await sleep(800);
    click(guest.w, guest.D.querySelector('#view-' + game + ' [data-pr="ready"]'));
    let hCd = false, gCd = false, hGone = 0, gGone = 0, hostStartClicked = false;
    const t0 = Date.now();
    while (Date.now() - t0 < 45000) {
      const hcd = host.D.querySelector('#plat-countdown'); if (hcd && hcd.style.display === 'flex') hCd = true;
      const gcd = guest.D.querySelector('#plat-countdown'); if (gcd && gcd.style.display === 'flex') gCd = true;
      if (!hGone && !host.D.querySelector('#view-' + game + ' [data-pr-region="roster"]')) hGone = Date.now() - t0;
      if (!gGone && !guest.D.querySelector('#view-' + game + ' [data-pr-region="roster"]')) gGone = Date.now() - t0;
      // 8 秒還沒開始 → 房主試按開始鈕（PlatRoom 主按鈕）
      if (!hostStartClicked && Date.now() - t0 > 8000 && !(hGone && gGone)) {
        hostStartClicked = true;
        const sb = host.D.querySelector('#view-' + game + ' [data-pr="start"]');
        console.log('  [drive] host clicks start btn:', !!sb);
        click(host.w, sb);
      }
      if (hGone && gGone) break;
      await sleep(120);
    }
    console.log('  [R' + r + ' start] hostGone=' + hGone + ' guestGone=' + gGone);
    check('R' + r + ' 雙方離開等待室進比賽', hGone > 0 && gGone > 0, 'host=' + hGone + ' guest=' + gGone);
    if (!(hGone && gGone)) { snap(host, 'H R' + r + '-startstall'); snap(guest, 'G R' + r + '-startstall'); broken = true; break; }
    // 3) 等計時結算（roundSecs=7）→ 雙方回大廳
    const settled = await waitFor(() => host.w.__PLAT_NET.tourn && host.w.__PLAT_NET.tourn.phase === 'standings', 90000, 'R' + r + ' settle');
    check('R' + r + ' 結算進 standings', !!settled);
    hCd = host.cdLog.some(v => /^[0-9]+$/.test(v)); gCd = guest.cdLog.some(v => /^[0-9]+$/.test(v));
    console.log('  [R' + r + ' cd-final] H=[' + host.cdLog.join(',') + '] G=[' + guest.cdLog.join(',') + ']');
    check('R' + r + ' 房主看到倒數', hCd);
    check('R' + r + ' 來賓看到倒數', gCd);
    const backLobby = await waitFor(() => !host.w.__PLAT_NET.inMatch && !guest.w.__PLAT_NET.inMatch && host.D.body.getAttribute('data-view') === 'lobby' && guest.D.body.getAttribute('data-view') === 'lobby', 60000, 'R' + r + ' back to lobby');
    check('R' + r + ' 雙方回大廳（非主畫面/非卡住）', !!backLobby);
    snap(host, 'H R' + r + '-after'); snap(guest, 'G R' + r + '-after');
    if (!settled || !backLobby) { broken = true; break; }
    if (r < 3) {
      click(host.w, host.D.querySelector('#t-next'));
      const adv = await waitFor(() => host.w.__PLAT_NET.tourn.round === r + 1 && host.w.__PLAT_NET.tourn.phase === 'playing', 60000, 'R' + (r + 1) + ' launched');
      check('R' + (r + 1) + ' launch 成功', !!adv);
      if (!adv) { snap(host, 'H adv-stall'); snap(guest, 'G adv-stall'); broken = true; }
    }
  }
  check('零頁面錯誤（host+guest）', host.errors.length === 0 && guest.errors.length === 0, 'H:' + host.errors.length + ' G:' + guest.errors.length);
  report([...host.errors, ...guest.errors]);
  try { host.w.close(); guest.w.close(); } catch (e) {}
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); report([]); process.exit(1); });
