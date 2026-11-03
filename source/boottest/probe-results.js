// 探針：數獨來賓完賽後，guest 窗的 #plat-results 是否被建立、PlatResults._visible 狀態
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
function readBoard(D) { const cells = {}; D.querySelectorAll('g[id^="cell-"]').forEach(g => { const id = g.getAttribute('id').slice(5); const t = (g.textContent || '').trim(); cells[id] = t ? parseInt(t, 10) : 0; }); return cells; }
function solve4(board) { const ids = Object.keys(board); const N = Math.round(Math.sqrt(ids.length)); const B = N === 4 ? 2 : 3; const grid = {}; ids.forEach(id => { grid[id] = board[id]; });
  const ok = (id, v) => { const [x, y] = id.split('-').map(Number); for (const o of ids) { if (o === id) continue; const [ox, oy] = o.split('-').map(Number); if (grid[o] === v && (ox === x || oy === y || (Math.floor(ox / B) === Math.floor(x / B) && Math.floor(oy / B) === Math.floor(y / B)))) return false; } return true; };
  const empties = ids.filter(id => !grid[id]); const bt = (i) => { if (i === empties.length) return true; const id = empties[i]; for (let v = 1; v <= N; v++) { if (ok(id, v)) { grid[id] = v; if (bt(i + 1)) return true; grid[id] = 0; } } return false; }; bt(0); return grid; }
async function fillBoard(pg, tag) {
  await waitFor(() => { const cd = pg.D.querySelector('#plat-countdown'); return !cd || cd.style.display !== 'flex'; }, 30000, tag + ' countdown over');
  await sleep(800);
  const sol = solve4(readBoard(pg.D));
  for (let pass = 0; pass < 4; pass++) { const cur = readBoard(pg.D); const todo = Object.keys(cur).filter(id => !cur[id]);
    console.log('FILL pass', pass, 'todo:', JSON.stringify(todo));
    if (!todo.length) break;
    for (const id of todo) { const g = pg.D.querySelector('g[id="cell-' + id + '"]'); if (!g) continue; click(pg.w, g); await sleep(120);
      const btns = [...pg.D.querySelectorAll('#view-sudoku button')].filter(b => (b.textContent || '').trim() === String(sol[id]));
      if (!btns.length) { console.log('FILL', id, 'NO BUTTON for', sol[id]); continue; }
      click(pg.w, btns[0]); await sleep(120);
      const after = (pg.D.querySelector('g[id="cell-' + id + '"]') || { textContent: '?' }).textContent;
      if ((after || '').trim() !== String(sol[id])) console.log('FILL', id, 'wanted', sol[id], 'cell now:', JSON.stringify(after));
    } }
}
(async () => {
  const host = loadPageShared(HTML), guest = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  for (const pg of [host, guest]) { pg.w.PLAT_show('sudoku'); await waitFor(() => !!pg.w.__PLAT_HOOKS_sudoku, 300000, 'preboot'); pg.w.PLAT_show('lobby'); }
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
  await waitFor(() => (guest.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿主'), 60000, 'guest in room');
  click(host.w, host.D.querySelector('[data-launch="sudoku-brawl"]'));
  await waitFor(() => host.D.querySelector('#view-sudoku [data-pr-region="roster"]') && guest.D.querySelector('#view-sudoku [data-pr-region="roster"]'), 120000, 'rooms');
  await sleep(1500);
  const sels = host.D.querySelectorAll('#view-sudoku [data-pr-slot="settings"] select');
  const setSel = (w, s, v) => { const setter = Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype, 'value').set; setter.call(s, v); s.dispatchEvent(new w.Event('change', { bubbles: true })); };
  for (const s of sels) { const vals = [...s.options].map(o => o.value); if (vals.includes('4')) setSel(host.w, s, '4'); if (vals.includes('easy')) setSel(host.w, s, 'easy'); }
  await sleep(1200);
  click(host.w, host.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await sleep(600);
  click(guest.w, guest.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await sleep(1500);
  const boardsUp = await waitFor(() => {
    const sb = host.D.querySelector('#view-sudoku [data-pr="start"]');
    if (sb && !sb.disabled && !host.D.querySelectorAll('g[id^="cell-"]').length) click(host.w, sb);
    return host.D.querySelectorAll('g[id^="cell-"]').length > 0 && guest.D.querySelectorAll('g[id^="cell-"]').length > 0;
  }, 90000, 'boards up');
  console.log('PROBE boards up:', !!boardsUp, 'host cells:', host.D.querySelectorAll('g[id^="cell-"]').length, 'guest cells:', guest.D.querySelectorAll('g[id^="cell-"]').length);
  // 階段診斷（DOM only）：來賓是否還卡在等待室 overlay？房主/來賓各試填一格（乾淨讀回）
  await sleep(6000);
  console.log('PROBE guest roster overlay present:', !!guest.D.querySelector('#view-sudoku [data-pr-region="roster"]'), '| host roster overlay present:', !!host.D.querySelector('#view-sudoku [data-pr-region="roster"]'));
  const spectBadge = [...guest.D.querySelectorAll('#view-sudoku *')].some(el => el.children.length === 0 && (el.textContent || '').includes('觀戰中'));
  console.log('PROBE guest spectator badge:', spectBadge);
  for (const [tag, pg] of [['host', host], ['guest', guest]]) {
    const sol2 = solve4(readBoard(pg.D)); const fe2 = Object.keys(readBoard(pg.D)).find(id => !readBoard(pg.D)[id]);
    if (!fe2) { console.log('PROBE', tag, 'no empty cell'); continue; }
    click(pg.w, pg.D.querySelector('g[id="cell-' + fe2 + '"]')); await sleep(250);
    const nb2 = [...pg.D.querySelectorAll('#view-sudoku button')].find(b => (b.textContent || '').trim() === String(sol2[fe2]));
    if (nb2) click(pg.w, nb2); await sleep(250);
    console.log('PROBE', tag, 'fill attempt', fe2, '->', JSON.stringify((pg.D.querySelector('g[id="cell-' + fe2 + '"]') || {}).textContent));
  }
  // 輸入診斷：來賓第一個空格——模式鈕、點格後 g 內容變化、逐顆數字鈕試按
  const cd2 = await waitFor(() => { const cd = guest.D.querySelector('#plat-countdown'); return !cd || cd.style.display !== 'flex'; }, 30000, 'cd over');
  await sleep(800);
  const modeBtns = [...guest.D.querySelectorAll('#view-sudoku button')].filter(b => (b.textContent || '').includes('先行'));
  modeBtns.forEach(b => console.log('PROBE mode btn:', (b.textContent || '').trim(), '| class:', (b.className || '').slice(0, 90)));
  // 試數字先行順序：先按數字鈕、再點格
  const solX = solve4(readBoard(guest.D)); const fe = Object.keys(readBoard(guest.D)).find(id => !readBoard(guest.D)[id]);
  const nb = [...guest.D.querySelectorAll('#view-sudoku button')].find(b => (b.textContent || '').trim() === String(solX[fe]));
  click(guest.w, nb); await sleep(250);
  click(guest.w, guest.D.querySelector('g[id="cell-' + fe + '"]')); await sleep(250);
  console.log('PROBE number-first attempt on', fe, '-> cell =', JSON.stringify((guest.D.querySelector('g[id="cell-' + fe + '"]') || {}).textContent));
  const sol = solve4(readBoard(guest.D));
  const firstEmpty = Object.keys(readBoard(guest.D)).find(id => !readBoard(guest.D)[id]);
  console.log('PROBE first empty cell:', firstEmpty, 'solution:', sol[firstEmpty]);
  const g0 = guest.D.querySelector('g[id="cell-' + firstEmpty + '"]');
  const beforeHTML = g0.innerHTML.slice(0, 120);
  click(guest.w, g0); await sleep(300);
  console.log('PROBE after cell click, g html changed:', g0.innerHTML.slice(0, 120) !== beforeHTML, '| g html head:', g0.innerHTML.slice(0, 120).replace(/\s+/g, ' '));
  const cand = [...guest.D.querySelectorAll('#view-sudoku button')].filter(b => (b.textContent || '').trim() === String(sol[firstEmpty]));
  console.log('PROBE number-button candidates for', sol[firstEmpty], ':', cand.length);
  for (let i = 0; i < cand.length; i++) { click(guest.w, cand[i]); await sleep(300);
    const now = (guest.D.querySelector('g[id="cell-' + firstEmpty + '"]') || { textContent: '?' }).textContent;
    console.log('PROBE after button #' + i, 'cell =', JSON.stringify(now), '| btn class:', (cand[i].className || '').slice(0, 60));
    if ((now || '').trim() === String(sol[firstEmpty])) break; }
  await fillBoard(guest, 'G');
  await sleep(5000);
  console.log('PROBE dup cell ids: cell-1-0 count =', guest.D.querySelectorAll('g[id="cell-1-0"]').length, '| total g[id^=cell-] =', guest.D.querySelectorAll('g[id^="cell-"]').length);
  const b = readBoard(guest.D);
  const filled = Object.values(b).filter(v => v).length, total = Object.keys(b).length;
  const modalDiv = [...guest.D.querySelectorAll('#view-sudoku div')].find(d => (d.className || '').includes('z-[60]'));
  const showBtn = [...guest.D.querySelectorAll('#view-sudoku button')].some(x => (x.textContent || '').includes('顯示成績'));
  console.log('PROBE guest board filled:', filled + '/' + total, '| local modal div present:', !!modalDiv, '| 顯示成績 btn:', showBtn);
  guest.w.PlatResults.show({ title: '大亂鬥結果', entries: [{ name: 'X', right: '⏱ 1:00' }], buttons: [] });
  await sleep(400);
  const el2 = guest.D.querySelector('#plat-results');
  console.log('PROBE guest manual show -> exists:', !!el2, 'display:', el2 && el2.style.display);
  console.log('PROBE guest errors:', JSON.stringify(guest.errors.slice(0, 3)));
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
