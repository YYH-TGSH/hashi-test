// 探針2：錦標賽來賓端 PlatBar 為何沒狀態 + 抓 Array.filter 錯誤的 stack
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const file = '/home/hatch/workspace/platform/platform-v1-test.html';
let html = fs.readFileSync(file, 'utf8');
const mock = require('./mockpeer.js');
const marker = '<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>';
html = html.replace(marker, () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(300); } console.log('  (timeout: ' + label + ')'); return null; }
const SHARED_REG = {};
function loadPage(label) {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const d = e.detail || {}; const m = String(d.message || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errs.push(m + (d.stack ? '\nSTACK: ' + String(d.stack).split('\n').slice(0, 4).join(' <- ') : '')); });
  vc.on('error', m => errs.push(String(m)));
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.__SHARED_REG__ = SHARED_REG; w.scrollTo = () => {}; w.__cap = [];
      const oce = w.console.error.bind(w.console);
      w.console.error = (...a) => { try { w.__cap.push(a.map(x => (x && x.stack) ? String(x.stack).split('\n').slice(0, 5).join(' <- ') : String(x)).join(' | ').slice(0, 600)); } catch (e) {} oce(...a); };
      w.addEventListener('error', e => { if (e.message && !/Script error/.test(e.message)) errs.push(e.message + (e.error && e.error.stack ? '\nSTACK: ' + String(e.error.stack).split('\n').slice(0, 5).join(' <- ') : '')); }); } });
  return { window: dom.window, document: dom.window.document, errors: errs, label };
}
async function main() {
  const H = loadPage('H'); const G = loadPage('G');
  const clickEl = (p, el) => { if (el) el.dispatchEvent(new p.window.MouseEvent('click', { bubbles: true })); return !!el; };
  const click = (p, sel) => clickEl(p, p.document.querySelector(sel));
  const shownW = async (p, which, ms) => await waitFor(() => { const r = p.document.querySelector('#view-' + which + ' [data-pr-region="roster"]'); return (r && r.style.display !== 'none') ? r : null; }, ms || 90000, p.label + ' ' + which + ' roster');
  for (const p of [H, G]) await waitFor(() => (typeof p.window.PLAT_show === 'function' && p.window.__PLAT_NET) ? true : null, 120000, p.label + ' shell');
  click(H, '#lob-go-create'); await waitFor(() => H.document.querySelector('#lob-step-nick').style.display !== 'none', 30000, 'H nick');
  H.document.querySelector('#lob-name').value = '房主甲'; click(H, '#lob-confirm');
  await shownW(H, 'sudoku');
  const code = H.window.__PLAT_NET.code;
  click(G, '#lob-go-join'); await waitFor(() => G.document.querySelector('#lob-step-nick').style.display !== 'none', 30000, 'G nick');
  G.document.querySelector('#lob-name').value = '來賓乙';
  G.document.querySelector('#lob-code').value = code; click(G, '#lob-confirm');
  await shownW(G, 'sudoku');
  console.log('both in sudoku room');
  H.window.__PLAT_ROOMTAB('tab', 'tourn');
  await waitFor(() => H.document.querySelector('#t-start'), 15000, 't-start');
  H.document.querySelector('#t-rounds').value = '3';
  H.document.querySelector('#t-order').value = 'alt-h';
  H.document.querySelector('#t-order').dispatchEvent(new H.window.Event('change', { bubbles: true }));
  click(H, '#t-start');
  await shownW(H, 'hashi'); await shownW(G, 'hashi');
  console.log('both in hashi room (tourney R1)');
  clickEl(H, H.document.querySelector('#view-hashi [data-pr="ready"]'));
  clickEl(G, G.document.querySelector('#view-hashi [data-pr="ready"]'));
  const gone = await waitFor(() => { const s = H.document.querySelector('#view-hashi [data-pr="start"]'); if (s && !s.disabled) s.dispatchEvent(new H.window.MouseEvent('click', { bubbles: true })); const r = H.document.querySelector('#view-hashi [data-pr-region="roster"]'); return (!r || !r.isConnected) ? true : null; }, 60000, 'race started');
  console.log('race started:', !!gone);
  const dump = (p, tag) => {
    const d = p.window.PlatBar._debug();
    const mounts = [...p.document.querySelectorAll('#view-hashi div')].filter(el => (el.className || '').includes('z-30')).length;
    const cells = p.document.querySelectorAll('#view-hashi svg circle, #view-hashi [data-cell], #view-hashi canvas').length;
    console.log(tag, 'bar=', JSON.stringify(d), 'z30mounts=', mounts, 'boardEls=', cells, 'inMatch=', p.window.__PLAT_NET.inMatch, 'view=', p.document.body.getAttribute('data-view'));
  };
  for (let i = 0; i < 30; i++) { await sleep(500); const d = G.window.PlatBar._debug(); if (!d.attached) { console.log('G bar LOST at ~' + (i * 0.5 + 0.5) + 's after race start'); break; } if (i === 29) console.log('G bar survived 15s'); }
  dump(G, 'G @lost');
  dump(H, 'H @end');
  console.log('--- G errors ---'); console.log(G.errors.slice(0, 4).join('\n') || '(none)');
  console.log('--- G console.error cap ---'); console.log((G.window.__cap || []).slice(-4).join('\n') || '(none)');
  console.log('--- H errors ---'); console.log(H.errors.slice(0, 4).join('\n') || '(none)');
  process.exit(0);
}
main().catch(e => { console.log('FATAL', e && e.message); process.exit(2); });
