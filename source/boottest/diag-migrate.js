// 診斷：房主 player-leave 後，來賓 B 的殼接管路徑（migrating/restored/conns 逐秒快照）
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
let html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
const mock = require('./mockpeer.js');
const marker = '<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>';
html = html.replace(marker, () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(300); } console.log('  (timeout ' + label + ')'); return null; }
const SHARED_REG = {};
function loadPage(label) {
  const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.__SHARED_REG__ = SHARED_REG; w.scrollTo = () => {}; } });
  return { window: dom.window, document: dom.window.document, label };
}
const clickEl = (p, el) => { if (el) el.dispatchEvent(new p.window.MouseEvent('click', { bubbles: true })); return !!el; };
function setInput(w, el, val) { const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; setter.call(el, val); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); }
const hubRoom = (p) => { const rm = p.document.querySelector('#lob-step-room'); return rm && rm.style.display === 'block'; };
const snap = (p) => { const N = p.window.__PLAT_NET; if (!N) return 'no-net'; return JSON.stringify({ host: N.isHost, mig: N.migrating, rst: N.restored, act: N.active, inM: N.inMatch, conns: Object.keys(N.conns || {}).length, roster: (N.roster || []).map(r => r.name + (r.host ? '*' : '')), code: N.code }); };
(async () => {
  const H = loadPage('H'), A = loadPage('A'), B = loadPage('B');
  for (const p of [H, A, B]) await waitFor(() => (typeof p.window.PLAT_show === 'function' && p.window.PlatDock) ? true : null, 120000, p.label);
  clickEl(H, H.document.querySelector('#lob-go-create'));
  await waitFor(() => H.document.querySelector('#lob-step-nick').style.display === 'block', 60000, 'H nick');
  setInput(H.window, H.document.querySelector('#lob-name'), '原房主');
  clickEl(H, H.document.querySelector('#lob-confirm'));
  await waitFor(() => hubRoom(H) && H.window.__PLAT_NET.code, 150000, 'H room');
  const code = H.window.__PLAT_NET.code;
  for (const [G, nm] of [[A, '接管者'], [B, '重連者']]) {
    clickEl(G, G.document.querySelector('#lob-go-join'));
    await waitFor(() => G.document.querySelector('#lob-step-nick').style.display === 'block', 60000, nm + ' nick');
    setInput(G.window, G.document.querySelector('#lob-name'), nm);
    setInput(G.window, G.document.querySelector('#lob-code'), code);
    clickEl(G, G.document.querySelector('#lob-confirm'));
    await waitFor(() => H.window.__PLAT_NET.roster.length >= (nm === '接管者' ? 2 : 3), 90000, nm + ' in');
  }
  console.log('ROOM READY. code=' + code);
  console.log('A:', snap(A)); console.log('B:', snap(B));
  H.window.__PLAT_NOTIFY('player-leave');
  for (let i = 0; i < 14; i++) {
    await sleep(2000);
    console.log('t+' + (i + 1) * 2 + 's A:', snap(A));
    console.log('t+' + (i + 1) * 2 + 's B:', snap(B));
    if (A.window.__PLAT_NET.isHost && B.window.__PLAT_NET.conns && Object.keys(B.window.__PLAT_NET.conns).length > 0 && !B.window.__PLAT_NET.migrating) break;
  }
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
