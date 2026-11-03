// v1.7.0 驗證：PlatResults 共用結算框架——兩款大亂鬥結算都由殼 #plat-results 渲染（同版式/按鈕），本地舊 modal 不再出現
// 斷言一律用 DOM 訊號（#plat-results 元素 / #view-<game> 子樹）——body.textContent 含 inline script 原始碼，不可用於文字斷言
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
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(window) { window.__SHARED_REG__ = SHARED_REG; window.fetch = (url, opts) => fetch(new URL(url, window.location.href).href, opts); window.scrollTo = () => {}; try { window.localStorage.setItem('sudoku_input_mode', 'cell'); } catch (e) {} } });
  const w = dom.window;
  w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
  return { w, D: w.document, errors };
}
function setInput(w, el, val) { const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; setter.call(el, val); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); }
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
const presVisible = (pg) => { const el = pg.D.querySelector('#plat-results'); return !!el && el.style.display === 'flex'; };
const presText = (pg) => { const el = pg.D.querySelector('#plat-results'); return el ? el.textContent : ''; };
const presBtn = (pg, id) => pg.D.querySelector('#plat-results [data-pres="' + id + '"]');
const viewHasResults = (pg, game) => { const v = pg.D.querySelector('#view-' + game); return !!v && v.textContent.includes('大亂鬥結果'); };
async function makeRoom() {
  const host = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  const guest = loadPageShared(HTML);
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => (guest.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿主'), 60000, 'guest in room');
  return { host, guest };
}
// 穩健開局：雙邊準備→等房主開始鈕啟用（canStart 門檻）→點擊→等雙邊等待室 overlay 消失（=真的開賽）
async function startGame(host, guest, game) {
  const view = '#view-' + game;
  click(host.w, host.D.querySelector(view + ' [data-pr="ready"]'));
  await sleep(700);
  click(guest.w, guest.D.querySelector(view + ' [data-pr="ready"]'));
  const enabled = await waitFor(() => { const sb = host.D.querySelector(view + ' [data-pr="start"]'); return sb && !sb.disabled; }, 90000, 'start enabled');
  if (!enabled) return false;
  click(host.w, host.D.querySelector(view + ' [data-pr="start"]'));
  const gone = await waitFor(() => !host.D.querySelector(view + ' [data-pr-region="roster"]') && !guest.D.querySelector(view + ' [data-pr-region="roster"]'), 90000, 'rooms gone');
  return !!gone;
}
// ===== 數獨 solver =====
function readBoard(D) {
  const cells = {};
  D.querySelectorAll('g[id^="cell-"]').forEach(g => { const id = g.getAttribute('id').slice(5); const t = (g.textContent || '').trim(); cells[id] = t ? parseInt(t, 10) : 0; });
  return cells;
}
function solve4(board) {
  const ids = Object.keys(board);
  const N = Math.round(Math.sqrt(ids.length));
  const B = N === 4 ? 2 : 3;
  const grid = {}; ids.forEach(id => { grid[id] = board[id]; });
  const ok = (id, v) => { const [x, y] = id.split('-').map(Number); for (const o of ids) { if (o === id) continue; const [ox, oy] = o.split('-').map(Number); if (grid[o] === v && (ox === x || oy === y || (Math.floor(ox / B) === Math.floor(x / B) && Math.floor(oy / B) === Math.floor(y / B)))) return false; } return true; };
  const empties = ids.filter(id => !grid[id]);
  const bt = (i) => { if (i === empties.length) return true; const id = empties[i]; for (let v = 1; v <= N; v++) { if (ok(id, v)) { grid[id] = v; if (bt(i + 1)) return true; grid[id] = 0; } } return false; };
  bt(0); return grid;
}
async function fillBoard(pg, tag) {
  await waitFor(() => { const cd = pg.D.querySelector('#plat-countdown'); return !cd || cd.style.display !== 'flex'; }, 30000, tag + ' countdown over');
  await sleep(800);
  const sol = solve4(readBoard(pg.D));
  for (let pass = 0; pass < 5; pass++) {
    const cur = readBoard(pg.D);
    const todo = Object.keys(cur).filter(id => !cur[id]);
    if (!todo.length) break;
    for (const id of todo) {
      const g = pg.D.querySelector('g[id="cell-' + id + '"]');
      if (!g) continue;
      click(pg.w, g); await sleep(90);
      const btns = [...pg.D.querySelectorAll('#view-sudoku button')].filter(b => (b.textContent || '').trim() === String(sol[id]));
      if (!btns.length) continue;
      click(pg.w, btns[0]); await sleep(90);
    }
  }
}
(async () => {
  // ===== Part A：數獨 =====
  {
    const { host, guest } = await makeRoom();
    for (const pg of [host, guest]) { pg.w.PLAT_show('sudoku'); await waitFor(() => !!pg.w.__PLAT_HOOKS_sudoku, 300000, 'preboot sudoku'); pg.w.PLAT_show('lobby'); }
    click(host.w, host.D.querySelector('[data-launch="sudoku-brawl"]'));
    const rooms = await waitFor(() => host.D.querySelector('#view-sudoku [data-pr-region="roster"]') && guest.D.querySelector('#view-sudoku [data-pr-region="roster"]'), 120000, 'rooms');
    check('數獨：雙邊進等待室', !!rooms);
    await sleep(1200);
    const sels = host.D.querySelectorAll('#view-sudoku [data-pr-slot="settings"] select');
    const setSel = (w, s, v) => { const setter = Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype, 'value').set; setter.call(s, v); s.dispatchEvent(new w.Event('change', { bubbles: true })); };
    for (const s of sels) { const vals = [...s.options].map(o => o.value); if (vals.includes('4')) setSel(host.w, s, '4'); if (vals.includes('easy')) setSel(host.w, s, 'easy'); }
    await sleep(1000);
    const started = await startGame(host, guest, 'sudoku');
    check('數獨：開賽（等待室收起、輸入解鎖）', started);
    await fillBoard(guest, 'G');
    const waitShown = await waitFor(() => presVisible(guest), 30000, 'guest waiting results');
    check('數獨：來賓先完賽→來賓端 PlatResults 等待態出現', !!waitShown);
    check('數獨：等待態含「等待其他玩家完成」', presText(guest).includes('等待其他玩家完成'));
    check('數獨：等待態有觀戰按鈕（data-pres=watch）', !!presBtn(guest, 'watch'));
    check('數獨：房主比賽中不跳結算（PlatResults 未出現）', !presVisible(host));
    await fillBoard(host, 'H');
    const finShown = await waitFor(() => presVisible(host) && presVisible(guest), 30000, 'both finished results');
    check('數獨：結算後雙邊 PlatResults 出現', !!finShown);
    const ht = presText(host);
    check('數獨：結算條目含兩人＋⏱', ht.includes('阿主') && ht.includes('阿客') && ht.includes('⏱'));
    check('數獨：結算按鈕齊（看盤面/再來一局/回等待室/離開）', !!presBtn(host, 'watch') && !!presBtn(host, 'rematch') && !!presBtn(host, 'lobby') && !!presBtn(host, 'home'));
    check('數獨：本地舊結算 modal 未出現（遊戲視圖內無結果卡）', !viewHasResults(host, 'sudoku') && !viewHasResults(guest, 'sudoku'));
    click(host.w, presBtn(host, 'lobby'));
    const backRoom = await waitFor(() => host.D.querySelector('#view-sudoku [data-pr-region="roster"]') && !presVisible(host), 30000, 'host back to waiting room');
    check('數獨：按「回等待室」→結算關閉、回到等待室', !!backRoom);
    check('數獨 Part A 零錯誤', host.errors.length === 0 && guest.errors.length === 0);
    host.w.close(); guest.w.close();
  }
  // ===== Part B：數橋（winnersCount=1＋注入完賽訊息觸發 finalize）=====
  {
    const { host, guest } = await makeRoom();
    click(host.w, host.D.querySelector('[data-launch="hashi-brawl"]'));
    const rooms = await waitFor(() => host.D.querySelector('#view-hashi [data-pr-region="roster"]') && guest.D.querySelector('#view-hashi [data-pr-region="roster"]'), 120000, 'hashi rooms');
    check('數橋：雙邊進等待室', !!rooms);
    await sleep(1200);
    const setSel = (w, s, v) => { const setter = Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype, 'value').set; setter.call(s, v); s.dispatchEvent(new w.Event('change', { bubbles: true })); };
    const wsel = [...host.D.querySelectorAll('#view-hashi [data-pr-slot="settings"] select')].find(s => [...s.options].some(o => o.textContent.includes('前 1 名結束')));
    check('數橋：找到結束名次設定', !!wsel);
    if (wsel) setSel(host.w, wsel, '1');
    await sleep(800);
    const started = await startGame(host, guest, 'hashi');
    check('數橋：開賽（等待室收起）', started);
    await sleep(7000); // 過倒數（3.5s 對齊＋GO）
    const guestUid = guest.w.localStorage.getItem('plat_uid_hashi');
    const hostUid = host.w.localStorage.getItem('plat_uid_hashi');
    Object.values(guest.w.__PLAT_NET.conns)[0].send({ type: 'RACE_FINISH', uid: guestUid, name: '阿客', color: '#e3002b', timeMs: 42000 });
    const hostFin = await waitFor(() => presVisible(host), 30000, 'host PlatResults');
    check('數橋：房主端 PlatResults 結算出現', !!hostFin);
    const ht = presText(host);
    check('數橋：結算條目含阿客⏱＋阿主未完成', ht.includes('阿客') && ht.includes('⏱') && ht.includes('阿主') && ht.includes('未完成'));
    check('數橋：結算按鈕齊（看盤面/再來一局/回等待室/離開）', !!presBtn(host, 'watch') && !!presBtn(host, 'rematch') && !!presBtn(host, 'lobby') && !!presBtn(host, 'home'));
    Object.values(host.w.__PLAT_NET.conns)[0].send({ type: 'RACE_FINISH', uid: hostUid, name: '阿主', color: '#ffd23f', timeMs: 45000 });
    const guestFin = await waitFor(() => presVisible(guest), 30000, 'guest PlatResults');
    check('數橋：來賓端 PlatResults 結算出現（同框架）', !!guestFin);
    check('數橋：來賓結算含兩人條目', presText(guest).includes('阿主') && presText(guest).includes('阿客'));
    check('數橋：本地舊結算 modal 未出現', !viewHasResults(host, 'hashi') && !viewHasResults(guest, 'hashi'));
    check('數橋 Part B 零錯誤', host.errors.length === 0 && guest.errors.length === 0);
    host.w.close(); guest.w.close();
  }
  report([]);
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); report([]); process.exit(1); });
