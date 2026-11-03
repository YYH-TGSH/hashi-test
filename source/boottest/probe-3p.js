// 探針：3 人數獨大亂鬥——第三人（阿三）是否名單不穩/進度不傳/被踢出（取樣觀察，不下斷言）
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
const { sleep, waitFor, click } = require('./harness');
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
async function joinAs(name, code) {
  const pg = loadPageShared(HTML);
  await waitFor(() => typeof pg.w.PLAT_show === 'function' && pg.w.PlatDock, 600000, name + ' shell');
  click(pg.w, pg.D.querySelector('#lob-go-join'));
  await waitFor(() => pg.D.querySelector('#lob-step-nick').style.display === 'block', 60000, name + ' nick');
  setInput(pg.w, pg.D.querySelector('#lob-name'), name);
  setInput(pg.w, pg.D.querySelector('#lob-code'), code);
  click(pg.w, pg.D.querySelector('#lob-confirm'));
  await waitFor(() => (pg.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿主'), 60000, name + ' in room');
  return pg;
}
(async () => {
  const host = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  for (const pg of [host]) { pg.w.PLAT_show('sudoku'); await waitFor(() => !!pg.w.__PLAT_HOOKS_sudoku, 300000, 'preboot'); pg.w.PLAT_show('lobby'); }
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  const g1 = await joinAs('阿客', code);
  const g2 = await joinAs('阿三', code);
  for (const pg of [g1, g2]) { pg.w.PLAT_show('sudoku'); await waitFor(() => !!pg.w.__PLAT_HOOKS_sudoku, 300000, 'preboot g'); pg.w.PLAT_show('lobby'); }
  click(host.w, host.D.querySelector('[data-launch="sudoku-brawl"]'));
  const rooms = await waitFor(() => [host, g1, g2].every(pg => pg.D.querySelector('#view-sudoku [data-pr-region="roster"]')), 120000, 'rooms x3');
  console.log('rooms x3:', !!rooms);
  // 取樣等待室名單 20 秒：每頁應恆含三人
  const rosterOf = (pg) => { const r = pg.D.querySelector('#view-sudoku [data-pr-region="roster"]'); return r ? r.textContent : ''; };
  const miss = { host: 0, g1: 0, g2: 0 }; let samples = 0;
  const names = ['阿主', '阿客', '阿三'];
  const missDetail = [];
  for (let i = 0; i < 20; i++) {
    samples++;
    [['host', host], ['g1', g1], ['g2', g2]].forEach(([tag, pg]) => {
      const t = rosterOf(pg);
      const missing = names.filter(n => !t.includes(n));
      if (missing.length) { miss[tag]++; missDetail.push(tag + ' missing ' + missing.join(',') + ' @' + i); }
    });
    await sleep(1000);
  }
  console.log('roster samples:', samples, '| pages with ANY missing-name sample:', JSON.stringify(miss));
  console.log('miss details (first 8):', JSON.stringify(missDetail.slice(0, 8)));
  // 設 4x4 簡單、全員準備、開賽
  const sels = host.D.querySelectorAll('#view-sudoku [data-pr-slot="settings"] select');
  const setSel = (w, s, v) => { const setter = Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype, 'value').set; setter.call(s, v); s.dispatchEvent(new w.Event('change', { bubbles: true })); };
  for (const s of sels) { const vals = [...s.options].map(o => o.value); if (vals.includes('4')) setSel(host.w, s, '4'); if (vals.includes('easy')) setSel(host.w, s, 'easy'); }
  await sleep(1000);
  click(host.w, host.D.querySelector('#view-sudoku [data-pr="ready"]')); await sleep(500);
  click(g1.w, g1.D.querySelector('#view-sudoku [data-pr="ready"]')); await sleep(500);
  click(g2.w, g2.D.querySelector('#view-sudoku [data-pr="ready"]'));
  const en = await waitFor(() => { const sb = host.D.querySelector('#view-sudoku [data-pr="start"]'); return sb && !sb.disabled; }, 90000, 'start enabled');
  console.log('start enabled (all ready):', !!en);
  if (en) click(host.w, host.D.querySelector('#view-sudoku [data-pr="start"]'));
  const racing = await waitFor(() => [host, g1, g2].every(pg => !pg.D.querySelector('#view-sudoku [data-pr-region="roster"]')), 90000, 'racing x3');
  console.log('racing x3:', !!racing);
  await waitFor(() => { const cd = g2.D.querySelector('#plat-countdown'); return !cd || cd.style.display !== 'flex'; }, 30000, 'g2 cd over');
  await sleep(1000);
  // 阿三填 3 格 → 看房主/阿客的進度條有沒有阿三 >0%
  const sol = solve4(readBoard(g2.D));
  const empties = Object.keys(readBoard(g2.D)).filter(id => !readBoard(g2.D)[id]).slice(0, 3);
  for (const id of empties) {
    click(g2.w, g2.D.querySelector('g[id="cell-' + id + '"]')); await sleep(120);
    const btn = [...g2.D.querySelectorAll('#view-sudoku button')].find(b => (b.textContent || '').trim() === String(sol[id]));
    if (btn) click(g2.w, btn); await sleep(120);
  }
  await sleep(3500);
  const stripOf = (pg) => { const v = pg.D.querySelector('#view-sudoku'); return v ? v.textContent : ''; };
  console.log('host sees 阿三 progress:', /阿三[^%]*([1-9]\d*)%/.test(stripOf(host)), '| g1 sees 阿三 progress:', /阿三[^%]*([1-9]\d*)%/.test(stripOf(g1)));
  console.log('g2 still in game (cells>0):', g2.D.querySelectorAll('g[id^="cell-"]').length > 0);
  // 再取樣 10 秒看阿三會不會從任何人的畫面消失
  let vanish = 0;
  for (let i = 0; i < 10; i++) {
    if (!stripOf(host).includes('阿三')) vanish++;
    await sleep(1000);
  }
  console.log('host strip missing 阿三 samples (of 10):', vanish);
  console.log('errors H/G1/G2:', host.errors.length, g1.errors.length, g2.errors.length, JSON.stringify(g2.errors.slice(0, 2)));
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
