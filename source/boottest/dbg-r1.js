const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
let html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
const mock = require('./mockpeer.js');
html = html.replace('<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>', () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(300); } console.log('  (timeout: ' + label + ')'); return null; }
const SHARED_REG = {};
function loadPage(label) {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errs.push(m); });
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.__SHARED_REG__ = SHARED_REG; w.scrollTo = () => {}; w.localStorage.setItem('sudoku_input_mode', 'number'); } });
  return { window: dom.window, document: dom.window.document, errors: errs, label };
}
const clickEl = (p, el) => { if (el) el.dispatchEvent(new p.window.MouseEvent('click', { bubbles: true })); return !!el; };
const hubRoom = (p) => { const rm = p.document.querySelector('#lob-step-room'); return rm && rm.style.display === 'block' ? rm : null; };
async function main() {
  const H = loadPage('H'); const G = loadPage('G');
  for (const p of [H, G]) await waitFor(() => (typeof p.window.PLAT_show === 'function' && p.window.__PLAT_NET) ? true : null, 120000, p.label + ' ready');
  H.window.localStorage.setItem('plat_name', '房主甲');
  clickEl(H, H.document.querySelector('#lob-go-create'));
  await waitFor(() => H.document.querySelector('#lob-step-nick').style.display !== 'none', 30000, 'H nick');
  H.document.querySelector('#lob-name').value = '房主甲';
  clickEl(H, H.document.querySelector('#lob-confirm'));
  await waitFor(() => hubRoom(H), 60000, 'H room');
  const code = H.window.__PLAT_NET.code;
  G.window.localStorage.setItem('plat_name', '來賓乙');
  clickEl(G, G.document.querySelector('#lob-go-join'));
  await waitFor(() => G.document.querySelector('#lob-step-nick').style.display !== 'none', 30000, 'G nick');
  G.document.querySelector('#lob-name').value = '來賓乙';
  G.document.querySelector('#lob-code').value = code;
  clickEl(G, G.document.querySelector('#lob-confirm'));
  await waitFor(() => hubRoom(G), 60000, 'G room');
  await waitFor(() => H.window.__PLAT_NET.roster.length >= 2, 30000, 'roster2');
  clickEl(H, H.document.querySelector('#lob-step-room [data-rtab="tourn"]'));
  await waitFor(() => H.document.querySelector('#lob-tourn-setup'), 30000, 'tourn setup');
  const set = (id, v) => { const el = H.document.querySelector(id); if (el) { el.value = v; el.dispatchEvent(new H.window.Event('change', { bubbles: true })); } };
  set('#t-rounds', '3'); set('#t-order', 'alt-s'); set('#ts-size', '9'); set('#ts-diff', 'easy'); set('#ts-wtime', '0');
  clickEl(H, H.document.querySelector('#t-start'));
  await waitFor(() => (H.window.__PLAT_NET.tourn && H.window.__PLAT_NET.inMatch === 'sudoku') ? true : null, 90000, 'R1 in');
  await sleep(4000);
  for (const p of [H, G]) {
    const v = p.document.querySelector('#view-sudoku');
    console.log('==== ' + p.label + ' sudoku view buttons:', [...v.querySelectorAll('button')].map(b => (b.textContent || '').trim().slice(0, 22)).filter(Boolean).slice(0, 25).join(' | '));
    const pr = v.querySelector('[data-pr-region]');
    console.log('  PlatRoom in view:', !!pr, pr ? pr.getAttribute('data-pr-region') : '');
    const ls = []; for (let i = 0; i < p.window.localStorage.length; i++) ls.push(p.window.localStorage.key(i));
    console.log('  ls keys:', ls.filter(k => /sudoku|plat/.test(k)).join(', '));
  }
  console.log('msglog types:', (SHARED_REG.__msglog || []).map(m => m.type).join(','));
  // dump 存檔形狀
  for (const p of [H, G]) { const ls = p.window.localStorage; for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k && k.indexOf('sudoku_prog_') === 0) { const v = JSON.parse(ls.getItem(k)); console.log(p.label + ' save keys:', Object.keys(v).join(','), '| raw:', ls.getItem(k).slice(0, 300)); } } }
  // 點「準備好了」（兩邊）＋房主「開始本局」
  for (const p of [H, G]) { const b = [...p.document.querySelectorAll('#view-sudoku button')].find(x => (x.textContent || '').includes('準備好了')); console.log(p.label + ' ready(own) btn:', !!b); clickEl(p, b); }
  await sleep(1200);
  const sb = [...H.document.querySelectorAll('#view-sudoku button')].find(x => (x.textContent || '').includes('開始本局'));
  console.log('H start btn:', !!sb, sb && sb.disabled);
  // 試著按等待卡的準備鈕（data-pr="ready"）
  for (const p of [H, G]) {
    const rb = p.document.querySelector('#view-sudoku [data-pr="ready"]');
    console.log(p.label + ' data-pr ready btn:', !!rb, rb && rb.textContent.trim());
    clickEl(p, rb);
  }
  await sleep(9000);
  console.log('after ready: countdown el:', !!H.document.querySelector('#plat-countdown'), H.document.querySelector('#plat-countdown') && H.document.querySelector('#plat-countdown').style.display);
  for (const p of [H, G]) { const ls = []; for (let i = 0; i < p.window.localStorage.length; i++) ls.push(p.window.localStorage.key(i)); console.log(p.label + ' ls sudoku keys:', ls.filter(k => /sudoku_prog|sudoku_last/.test(k)).join(', ')); const cells = p.document.querySelectorAll('#view-sudoku g[id^="cell-"]').length; console.log(p.label + ' cells rendered:', cells); }
  console.log('msglog types 2:', (SHARED_REG.__msglog || []).map(m => m.type).join(','));
  // 逐步：點兩邊「準備好了」→ 看房主端旗標與開始鈕
  for (const p of [H, G]) { const b = [...p.document.querySelectorAll('#view-sudoku button')].find(x => (x.textContent || '').trim() === '✋ 準備好了'); console.log(p.label + ' exact ready btn:', !!b); clickEl(p, b); }
  await sleep(2500);
  const cardTxt = (p) => { const v = p.document.querySelector('#view-sudoku'); const m = [...v.querySelectorAll('span')].map(s => s.textContent.trim()).filter(t => /準備|未到/.test(t)); return m.join(' | '); };
  console.log('H card badges:', cardTxt(H));
  console.log('G card badges:', cardTxt(G));
  const sb2 = [...H.document.querySelectorAll('#view-sudoku button')].find(x => (x.textContent || '').includes('開始本局'));
  console.log('H start btn disabled:', sb2 && sb2.disabled);
  clickEl(H, sb2);
  await sleep(3000);
  console.log('after start click: fullog types:', (SHARED_REG.__fullog || []).map(m => m.type).join(','));
  const cd = (SHARED_REG.__fullog || []).filter(m => m.data && m.data.countdownTarget);
  console.log('SYNC countdownTarget seen:', cd.length);
  await sleep(6000);
  const stillWait = [...H.document.querySelectorAll('#view-sudoku button')].some(x => (x.textContent || '').includes('準備好了') || (x.textContent || '').includes('已準備（點擊取消）'));
  console.log('H still in waiting overlay:', stillWait);
  console.log('H errors:', H.errors.slice(0, 3), 'G errors:', G.errors.slice(0, 3));
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
