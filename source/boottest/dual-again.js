// 雙頁（數獨合作 4x4）：來賓解完整盤 → 雙邊結算 → 來賓按「再來一局」→ 雙邊一起開新局（房主不卡結算）
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
  w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
  return { w, D: w.document, errors };
}
function setInput(w, el, val) {
  if (!el) return false;
  const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set;
  setter.call(el, val);
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
  el.dispatchEvent(new w.Event('change', { bubbles: true }));
  return true;
}
function setSelect(w, el, val) {
  const setter = Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype, 'value').set;
  setter.call(el, val);
  el.dispatchEvent(new w.Event('change', { bubbles: true }));
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
}
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
const roomEl = (pg) => pg.D.querySelector('#view-sudoku [data-pr-region="roster"]');
function cellsOf(pg) { return [...pg.D.querySelectorAll('#view-sudoku svg g[id^="cell-"]')]; }
function cellVal(g) { const t = g.querySelector('text'); return t ? t.textContent.trim() : ''; }
function solve4(grid) {
  const N = 4, B = 2;
  const ok = (x, y, v) => {
    for (let i = 0; i < N; i++) { if (grid[y][i] === v || grid[i][x] === v) return false; }
    const bx = Math.floor(x / B) * B, by = Math.floor(y / B) * B;
    for (let j = 0; j < B; j++) for (let i = 0; i < B; i++) if (grid[by + j][bx + i] === v) return false;
    return true;
  };
  const bt = () => {
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (!grid[y][x]) {
        for (let v = 1; v <= N; v++) if (ok(x, y, v)) { grid[y][x] = v; if (bt()) return true; grid[y][x] = 0; }
        return false;
      }
    }
    return true;
  };
  bt();
  return grid;
}
(async () => {
  const host = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick step');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room code');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  const guest = loadPageShared(HTML);
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick step');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => (guest.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿主'), 60000, 'guest sees host');
  click(host.w, host.D.querySelector('[data-launch="sudoku-coop"]'));
  await waitFor(() => roomEl(host), 180000, 'host room');
  await waitFor(() => roomEl(guest), 180000, 'guest room');
  // 房主把尺寸改 4（第一個 select）
  await sleep(2500);
  const sel = host.D.querySelector('#view-sudoku select');
  check('房主設定區有尺寸下拉', !!sel);
  if (sel) setSelect(host.w, sel, '4');
  await sleep(3500);
  click(host.w, host.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await sleep(700);
  click(guest.w, guest.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await waitFor(() => !roomEl(host) && !roomEl(guest), 60000, 'both enter game');
  await waitFor(() => cellsOf(guest).length === 16, 60000, 'guest 4x4 board');
  check('雙邊進遊戲且盤面 4x4', true);
  // 讀來賓盤面 givens → 解題
  const grid = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const empties = [];
  cellsOf(guest).forEach(g => {
    const m = /cell-(\d+)-(\d+)/.exec(g.id);
    if (!m) return;
    const x = +m[1], y = +m[2];
    const v = cellVal(g);
    if (v) grid[y][x] = parseInt(v, 10); else empties.push({ x, y });
  });
  console.log('givens grid:', JSON.stringify(grid), 'empties:', empties.length);
  solve4(grid);
  console.log('solution:', JSON.stringify(grid));
  // 填答（來賓端）：先試數字先行
  const padBtn = (d) => [...guest.D.querySelectorAll('#view-sudoku button')].find(b => b.textContent.trim() === String(d));
  const cellEl = (x, y) => guest.D.querySelector('#view-sudoku svg g[id="cell-' + x + '-' + y + '"]');
  let numFirst = true;
  for (const e of empties) {
    const d = grid[e.y][e.x];
    if (numFirst) { const pb = padBtn(d); if (pb) click(guest.w, pb); await sleep(60); const c = cellEl(e.x, e.y); if (c) click(guest.w, c); }
    else { const c = cellEl(e.x, e.y); if (c) click(guest.w, c); await sleep(60); const pb = padBtn(d); if (pb) click(guest.w, pb); }
    await sleep(160);
    const c2 = cellEl(e.x, e.y);
    if (c2 && cellVal(c2) !== String(d)) {
      if (numFirst) { // 改格子先行重試這格
        numFirst = false;
        const c = cellEl(e.x, e.y); if (c) click(guest.w, c); await sleep(60);
        const pb = padBtn(d); if (pb) click(guest.w, pb); await sleep(160);
      }
    }
  }
  await sleep(1200);
  const filledCount = cellsOf(guest).filter(g => cellVal(g)).length;
  console.log('guest filled cells:', filledCount);
  check('來賓盤面填滿 16 格', filledCount === 16);
  // 結算：雙邊都應出現勝利 modal（含「再來一局」）
  const againBtn = (pg) => [...pg.D.querySelectorAll('#view-sudoku button')].find(b => b.textContent.includes('再來一局'));
  let modalBoth = false;
  try { await waitFor(() => againBtn(host) && againBtn(guest), 30000, 'victory modal both'); modalBoth = true; } catch (e) {}
  check('雙邊都出現結算（勝利）畫面', modalBoth);
  if (modalBoth) {
    click(guest.w, againBtn(guest));
    console.log('guest clicked play-again');
    let hostFree = false, guestFree = false;
    const t0 = Date.now();
    while (Date.now() - t0 < 45000) {
      if (!againBtn(host)) hostFree = true;
      if (!againBtn(guest)) guestFree = true;
      if (hostFree && guestFree) break;
      await sleep(400);
    }
    check('來賓按再來一局後，房主離開結算畫面', hostFree);
    check('來賓自己也離開結算畫面', guestFree);
    // 新局盤面出現（格子還在且 givens 與上一局不同或至少重新生成）
    await sleep(2500);
    check('新一局盤面存在（16 格）', cellsOf(host).length === 16 && cellsOf(guest).length === 16);
  }
  check('零錯誤', host.errors.length === 0 && guest.errors.length === 0);
  report([...host.errors, ...guest.errors]);
  host.w.close(); guest.w.close();
})().catch((e) => { console.error('FATAL', e); report([]); process.exitCode = 1; });
