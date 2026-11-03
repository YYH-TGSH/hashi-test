// 診斷：冷啟動 vs 預啟動，數獨合作開局後畫面到底長什麼樣（文字＋結構計數）
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
let html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
let mock = require('./mockpeer.js');
html = html.replace('<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>', () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(300); } console.log('  (timeout: ' + label + ')'); return null; }
const SHARED_REG = {};
function loadPage(label) {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errs.push(m); });
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.__SHARED_REG__ = SHARED_REG; w.scrollTo = () => {}; } });
  return { window: dom.window, document: dom.window.document, errors: errs, label };
}
const clickEl = (p, el) => { if (el) el.dispatchEvent(new p.window.MouseEvent('click', { bubbles: true })); return !!el; };
function setInput(w, el, val) { const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; setter.call(el, val); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); }
const hubRoom = (p) => { const rm = p.document.querySelector('#lob-step-room'); return rm && rm.style.display === 'block'; };
function dump(p, tag) {
  const v = p.document.querySelector('#view-sudoku');
  const txt = v ? v.textContent.replace(/\s+/g, ' ').slice(0, 350) : '(no view)';
  console.log('--- ' + tag + ' [' + p.label + '] view=' + p.document.body.getAttribute('data-view') + ' inMatch=' + p.window.__PLAT_NET.inMatch);
  console.log('    btns=' + (v ? v.querySelectorAll('button').length : 0) + ' divs=' + (v ? v.querySelectorAll('div').length : 0));
  console.log('    text: ' + txt);
}
async function roomAndStart(H, G) {
  clickEl(H, H.document.querySelector('#lob-go-create'));
  await waitFor(() => H.document.querySelector('#lob-step-nick').style.display === 'block', 60000, 'H nick');
  setInput(H.window, H.document.querySelector('#lob-name'), '阿主');
  clickEl(H, H.document.querySelector('#lob-confirm'));
  await waitFor(() => hubRoom(H) && H.window.__PLAT_NET.code, 150000, 'H room');
  const code = H.window.__PLAT_NET.code;
  clickEl(G, G.document.querySelector('#lob-go-join'));
  await waitFor(() => G.document.querySelector('#lob-step-nick').style.display === 'block', 60000, 'G nick');
  setInput(G.window, G.document.querySelector('#lob-name'), '阿客');
  setInput(G.window, G.document.querySelector('#lob-code'), code);
  clickEl(G, G.document.querySelector('#lob-confirm'));
  await waitFor(() => H.window.__PLAT_NET.roster.length >= 2, 90000, 'roster2');
  clickEl(H, H.document.querySelector('#lob-step-room [data-pr="ready"]')); await sleep(400);
  clickEl(G, G.document.querySelector('#lob-step-room [data-pr="ready"]'));
  const sb = await waitFor(() => { const b = H.document.querySelector('#lob-step-room [data-pr="start"]'); return b && !b.disabled ? b : null; }, 90000, 'start enabled');
  clickEl(H, sb);
  await waitFor(() => H.window.__PLAT_NET.inMatch === 'sudoku' && G.window.__PLAT_NET.inMatch === 'sudoku' ? true : null, 60000, 'inMatch');
  await sleep(12000); // 等倒數＋開局
}
(async () => {
  console.log('===== 情景 A：全冷啟動 =====');
  const H = loadPage('H'), G = loadPage('G');
  for (const p of [H, G]) await waitFor(() => typeof p.window.PLAT_show === 'function' && p.window.PlatDock, 600000, p.label + ' shell');
  await roomAndStart(H, G);
  dump(H, 'A 開局後'); dump(G, 'A 開局後');
  console.log('A errors H:', H.errors.slice(0, 3), 'G:', G.errors.slice(0, 3));
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
