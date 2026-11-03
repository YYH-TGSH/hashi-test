// 探針：一般數橋大亂鬥房，開賽後 25 秒內數來賓 JOIN / 房主 RESUME 次數，比對 id
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
    beforeParse(w) { w.__SHARED_REG__ = SHARED_REG; w.scrollTo = () => {}; } });
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
  console.log('both in sudoku room; transport to hashi');
  H.window.__PLAT_ROOMTAB('tab', 'hashi');
  await sleep(800);
  // 房主等待室開始鈕在 armed!=inMatch 時變帶路鈕
  const moved = await waitFor(() => { const s = H.document.querySelector('#view-sudoku [data-pr="start"]'); if (s) s.dispatchEvent(new H.window.MouseEvent('click', { bubbles: true })); const r = H.document.querySelector('#view-hashi [data-pr-region="roster"]'); return (r && r.isConnected) ? true : null; }, 30000, 'transport');
  console.log('transported:', !!moved);
  await shownW(G, 'hashi');
  clickEl(H, H.document.querySelector('#view-hashi [data-pr="ready"]'));
  clickEl(G, G.document.querySelector('#view-hashi [data-pr="ready"]'));
  SHARED_REG.__msglog = [];
  const gone = await waitFor(() => { const s = H.document.querySelector('#view-hashi [data-pr="start"]'); if (s && !s.disabled) s.dispatchEvent(new H.window.MouseEvent('click', { bubbles: true })); const r = H.document.querySelector('#view-hashi [data-pr-region="roster"]'); return (!r || !r.isConnected) ? true : null; }, 60000, 'race started');
  console.log('race started:', !!gone);
  await sleep(25000);
  const log = SHARED_REG.__msglog || [];
  const cnt = {};
  log.forEach(m => { cnt[m.type] = (cnt[m.type] || 0) + 1; });
  console.log('msg counts in 25s after start click:', JSON.stringify(cnt));
  const byStamp = {}; log.forEach(m => { const k = m.type + '@' + (m.stamp || 'raw'); byStamp[k] = (byStamp[k] || 0) + 1; });
  console.log('by stamp:', JSON.stringify(byStamp));
  console.log('RESUMEs:', log.filter(m => m.type === 'RACE_RESUME').length);
  const joins = log.filter(m => m.type === 'JOIN');
  const inits = log.filter(m => m.type === 'INIT');
  console.log('JOIN uids:', JSON.stringify(joins.map(j => j.uid)));
  console.log('INIT players ids:', JSON.stringify(inits.map(i => i.players)));
  console.log('G errors:', G.errors.slice(0, 3).join(' | ') || '(none)');
  process.exit(0);
}
main().catch(e => { console.log('FATAL', e && e.message); process.exit(2); });
