// Bug2 重現：一般模式數獨大亂鬥 4x4，房主先完賽、來賓後完賽，房主端是否收到來賓結果
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
// 讀盤面 givens（g#cell-x-y 的 text）
function readBoard(D) {
  const cells = {};
  D.querySelectorAll('g[id^="cell-"]').forEach(g => {
    const id = g.getAttribute('id').slice(5);
    const t = (g.textContent || '').trim();
    cells[id] = t ? parseInt(t, 10) : 0;
  });
  return cells;
}
function solve4(board) {
  const ids = Object.keys(board);
  const N = Math.round(Math.sqrt(ids.length));
  const B = N === 4 ? 2 : 3; // 宮格邊長
  const grid = {};
  ids.forEach(id => { const [x, y] = id.split('-').map(Number); grid[id] = board[id]; });
  const ok = (id, v) => {
    const [x, y] = id.split('-').map(Number);
    for (const o of ids) { if (o === id) continue; const [ox, oy] = o.split('-').map(Number); if (grid[o] === v && (ox === x || oy === y || (Math.floor(ox / B) === Math.floor(x / B) && Math.floor(oy / B) === Math.floor(y / B)))) return false; }
    return true;
  };
  const empties = ids.filter(id => !grid[id]);
  const bt = (i) => { if (i === empties.length) return true; const id = empties[i]; for (let v = 1; v <= N; v++) { if (ok(id, v)) { grid[id] = v; if (bt(i + 1)) return true; grid[id] = 0; } } return false; };
  bt(0);
  return grid;
}
async function fillBoard(pg, tag) {
  // 等倒數結束（phase playing）再填，否則 onNumClick 會被 phase 閘門擋下
  await waitFor(() => { const cd = pg.D.querySelector('#plat-countdown'); return !cd || cd.style.display !== 'flex'; }, 30000, tag + ' countdown over');
  await sleep(800);
  const board = readBoard(pg.D);
  const sol = solve4(board);
  console.log(tag + ' empties: ' + Object.keys(board).filter(id => !board[id]).length);
  for (let pass = 0; pass < 4; pass++) {
    const cur = readBoard(pg.D);
    const todo = Object.keys(cur).filter(id => !cur[id]);
    if (!todo.length) break;
    for (const id of todo) {
      const g = pg.D.querySelector('g[id="cell-' + id + '"]');
      if (!g) continue;
      click(pg.w, g);
      await sleep(80);
      const want = String(sol[id]);
      const btns = [...pg.D.querySelectorAll('#view-sudoku button')].filter(b => (b.textContent || '').trim() === want);
      if (!btns.length) continue;
      click(pg.w, btns[0]);
      await sleep(80);
    }
  }
  const after = readBoard(pg.D);
  const filled = Object.values(after).filter(v => v).length;
  console.log(tag + ' filled cells after: ' + filled + '/' + Object.keys(after).length);
}
(async () => {
  const host = loadPageShared(HTML), guest = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  for (const pg of [host, guest]) { pg.w.PLAT_show('sudoku'); await waitFor(() => !!pg.w.__PLAT_HOOKS_sudoku, 300000, 'preboot sudoku'); pg.w.PLAT_show('lobby'); }
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => (guest.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'guest room');
  // 啟動數獨大亂鬥，房主設定改 4x4 簡單（等待室設定區的 select）
  click(host.w, host.D.querySelector('[data-launch="sudoku-brawl"]'));
  await waitFor(() => host.D.querySelector('#view-sudoku [data-pr-region="roster"]') && guest.D.querySelector('#view-sudoku [data-pr-region="roster"]'), 120000, 'rooms');
  await sleep(1500);
  const sels = host.D.querySelectorAll('#view-sudoku [data-pr-slot="settings"] select');
  console.log('host settings selects: ' + sels.length);
  const setSel = (s, v) => { const setter = Object.getOwnPropertyDescriptor(host.w.HTMLSelectElement.prototype, 'value').set; setter.call(s, v); s.dispatchEvent(new host.w.Event('change', { bubbles: true })); };
  for (const s of sels) { const vals = [...s.options].map(o => o.value); console.log(' select options: ' + vals.join(',')); if (vals.includes('4')) setSel(s, '4'); if (vals.includes('easy')) setSel(s, 'easy'); }
  await sleep(1200);
  click(host.w, host.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await sleep(600);
  click(guest.w, guest.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await sleep(1500);
  click(host.w, host.D.querySelector('#view-sudoku [data-pr="start"]'));
  // 等比賽開始（等待室消失、盤面出現）
  const started = await waitFor(() => host.D.querySelectorAll('g[id^="cell-"]').length > 0 && guest.D.querySelectorAll('g[id^="cell-"]').length > 0, 90000, 'boards up');
  check('比賽開始、雙邊盤面出現', !!started);
  await sleep(1000);
  // 訊息記錄
  for (const [pg, tag] of [[host, 'H'], [guest, 'G']]) {
    pg.w.__out = [];
    Object.values(pg.w.__PLAT_NET.conns).forEach(c => { if (c.__logged) return; c.__logged = true; const os = c.send.bind(c); c.send = (d) => { try { if (d && d.type) pg.w.__out.push(tag + '>' + d.type); } catch (e) {} return os(d); }; });
  }
  // 房主先完賽
  await fillBoard(host, 'H');
  const hostDone = await waitFor(() => (host.D.body.textContent || '').includes('大亂鬥結果'), 30000, 'host result modal');
  check('房主完賽看到結果視窗', !!hostDone);
  console.log('host sees waiting text:', (host.D.body.textContent || '').includes('等待第 2 名完成'));
  // 來賓後完賽
  await fillBoard(guest, 'G');
  const guestDone = await waitFor(() => (guest.D.body.textContent || '').includes('大亂鬥結果'), 30000, 'guest result modal');
  check('來賓完賽看到結果視窗', !!guestDone);
  await sleep(3000);
  const hostText = host.D.body.textContent || '';
  const guestText = guest.D.body.textContent || '';
  console.log('guest->host msgs:', JSON.stringify(guest.w.__out.filter(m => /WON|SYNC/.test(m))));
  console.log('guest modal has 再來一局:', guestText.includes('再來一局'));
  console.log('host result includes guest:', hostText.includes('阿客'), '| host still waiting#2:', hostText.includes('等待第 2 名完成'), '| host has 再來一局:', hostText.includes('再來一局'));
  check('Bug2 不重現：房主端更新來賓完賽結果', hostText.includes('大亂鬥結果') && hostText.includes('阿客') && !hostText.includes('等待第 2 名完成') && hostText.includes('再來一局'));
  report([...host.errors, ...guest.errors]);
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); report([]); process.exit(1); });
