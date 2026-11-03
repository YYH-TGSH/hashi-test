// 診斷 2：雙房主競態——逐 500ms 追 roster/isHost/migrating/restored + REG 所有權
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
let html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
const mock = require('./mockpeer.js');
const marker = '<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>';
html = html.replace(marker, () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(200); } console.log('  (timeout ' + label + ')'); return null; }
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
    await waitFor(() => G.document.querySelector('#lob-step-nick').style.display === 'block', 60000, nm);
    setInput(G.window, G.document.querySelector('#lob-name'), nm);
    setInput(G.window, G.document.querySelector('#lob-code'), code);
    clickEl(G, G.document.querySelector('#lob-confirm'));
    await waitFor(() => H.window.__PLAT_NET.roster.length >= (nm === '接管者' ? 2 : 3), 90000, nm + ' in');
  }
  const hostId = 'yyh-tgsh-' + code + '-host';
  const owner = () => { const r = SHARED_REG[hostId]; if (!r) return 'none'; if (r === A.window.__PLAT_NET.peer) return 'A'; if (r === B.window.__PLAT_NET.peer) return 'B'; if (r === H.window.__PLAT_NET.peer) return 'H'; return 'other'; };
  const line = (p) => { const N = p.window.__PLAT_NET; return p.label + '[host=' + N.isHost + ' mig=' + N.migrating + ' rst=' + N.restored + ' peer=' + (N.peer ? N.peer.id : 'null') + ' peerIsReg=' + (N.peer && SHARED_REG[hostId] === N.peer) + ' roster=' + (N.roster || []).map(r => r.name + (r.host ? '*' : '')).join(',') + ']'; };
  console.log('READY owner=' + owner());
  for (const p of [A, B]) console.log(p.label + ' myPid=' + p.window.__PLAT_NET.myPid + ' rosterPids=' + JSON.stringify((p.window.__PLAT_NET.roster || []).map(r => ({ pid: r.pid, uid: r.uid, name: r.name, host: !!r.host }))));
  H.window.__PLAT_NOTIFY('player-leave');
  let last = '';
  for (let i = 0; i < 60; i++) {
    await sleep(100);
    const s = line(A) + ' ' + line(B) + ' owner=' + owner();
    if (s !== last) { console.log('t+' + (i + 1) * 0.1 + 's ' + s); last = s; }
    if (B.window.__PLAT_NET.restored !== undefined && !B.window.__PLAT_NET.migrating && i > 10) break;
  }
  console.log('FINAL owner=' + owner());
  for (const p of [A, B]) { const cl = p.document.querySelector('#plat-chat-list'); console.log(p.label + ' CHAT: ' + (cl ? cl.textContent.replace(/\s+/g, ' ').slice(0, 300) : 'none')); }
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
