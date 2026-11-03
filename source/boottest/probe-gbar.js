// 探針：來賓在普通數橋大亂鬥房間裡，底部列 PlatBar 是否有狀態（attached/state）
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
  vc.on('jsdomError', e => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errs.push(m); });
  vc.on('error', m => errs.push(String(m)));
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.__SHARED_REG__ = SHARED_REG; w.scrollTo = () => {}; w.addEventListener('error', e => { if (e.message && !/Script error/.test(e.message)) errs.push(e.message); }); } });
  return { window: dom.window, document: dom.window.document, errors: errs, label };
}
async function main() {
  const H = loadPage('H'); const G = loadPage('G');
  const clickEl = (p, el) => { if (el) el.dispatchEvent(new p.window.MouseEvent('click', { bubbles: true })); return !!el; };
  const click = (p, sel) => clickEl(p, p.document.querySelector(sel));
  for (const p of [H, G]) await waitFor(() => (typeof p.window.PLAT_show === 'function' && p.window.__PLAT_NET) ? true : null, 120000, p.label + ' shell');
  click(H, '#lob-go-create'); await waitFor(() => H.document.querySelector('#lob-step-nick').style.display !== 'none', 30000, 'H nick');
  H.document.querySelector('#lob-name').value = '房主甲'; click(H, '#lob-confirm');
  const lb = await waitFor(() => { const b = H.document.querySelector('[data-launch="hashi-brawl"]'); return (b && !b.disabled) ? b : null; }, 30000, 'launch hashi btn (need hashi tab)');
  if (!lb) { clickEl(H, H.document.querySelector('[data-lobtab="hashi"]')); }
  const lb2 = await waitFor(() => { const b = H.document.querySelector('[data-launch="hashi-brawl"]'); return (b && !b.disabled && b.offsetParent !== null) ? b : null; }, 30000, 'launch hashi brawl');
  clickEl(H, lb2);
  const shownW = async (p, ms) => await waitFor(() => { const r = p.document.querySelector('#view-hashi [data-pr-region="roster"]'); return (r && r.style.display !== 'none') ? r : null; }, ms || 90000, p.label + ' hashi roster');
  console.log('H room:', !!await shownW(H));
  const code = H.window.__PLAT_NET.code;
  click(G, '#lob-go-join'); await waitFor(() => G.document.querySelector('#lob-step-nick').style.display !== 'none', 30000, 'G nick');
  G.document.querySelector('#lob-name').value = '來賓乙';
  G.document.querySelector('#lob-code').value = code; click(G, '#lob-confirm');
  console.log('G room (pulled by replay):', !!await shownW(G));
  const dump = (p, tag) => { const d = p.window.PlatBar._debug(); console.log(tag, JSON.stringify(d), 'inMatch=', p.window.__PLAT_NET.inMatch); };
  dump(H, 'H bar @room'); dump(G, 'G bar @room');
  clickEl(H, H.document.querySelector('#view-hashi [data-pr="ready"]'));
  clickEl(G, G.document.querySelector('#view-hashi [data-pr="ready"]'));
  const gone = await waitFor(() => { const s = H.document.querySelector('#view-hashi [data-pr="start"]'); if (s && !s.disabled) s.dispatchEvent(new H.window.MouseEvent('click', { bubbles: true })); const r = H.document.querySelector('#view-hashi [data-pr-region="roster"]'); return (!r || !r.isConnected) ? true : null; }, 60000, 'race started');
  console.log('race started:', !!gone);
  for (let i = 0; i < 6; i++) { await sleep(1200); dump(G, 'G bar @race+' + (i + 1)); }
  dump(H, 'H bar @race end');
  console.log('G errors:', G.errors.slice(0, 3).join(' | ') || '(none)');
  process.exit(0);
}
main().catch(e => { console.log('FATAL', e && e.message); process.exit(2); });
