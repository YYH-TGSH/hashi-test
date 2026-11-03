// 殼層心跳測試（共用 REG 雙頁）：來賓停止 shell ping → 房主大廳名單先標（離線）、再移除
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer-lat.js');
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
    beforeParse(window) { window.__SHARED_REG__ = SHARED_REG; window.fetch = (url, opts) => fetch(new URL(url, window.location.href).href, opts); window.scrollTo = () => {}; } });
  const w = dom.window;
  w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
  return { w, D: w.document, errors };
}
function setInput(w, el, val) { if (!el) return false; const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; setter.call(el, val); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); return true; }
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
(async () => {
  const host = loadPageShared(HTML), guest = loadPageShared(HTML);
  const H = host.w, G = guest.w;
  await waitFor(() => typeof H.PLAT_show === 'function' && H.PlatDock, 120000, 'host shell');
  await waitFor(() => typeof G.PLAT_show === 'function' && G.PlatDock, 120000, 'guest shell');

  click(H, H.document.getElementById('lob-go-create'));
  await waitFor(() => H.document.getElementById('lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(H, H.document.getElementById('lob-name'), '房主甲');
  click(H, H.document.getElementById('lob-confirm'));
  await waitFor(() => H.__PLAT_NET.active && H.__PLAT_NET.isHost, 60000, 'host room');
  const code = H.__PLAT_NET.code;
  console.log('room code', code);

  click(G, G.document.getElementById('lob-go-join'));
  await waitFor(() => G.document.getElementById('lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(G, G.document.getElementById('lob-name'), '來賓乙');
  setInput(G, G.document.getElementById('lob-code'), code);
  click(G, G.document.getElementById('lob-confirm'));
  const joined = await waitFor(() => H.__PLAT_NET.roster.length === 2, 60000, 'roster 2');
  check('兩人進房', !!joined);

  // 房主把門檻縮小；來賓把 ping 間隔放大到幾乎永不送（模擬 App 被關/凍結）
  H.__PLAT_NET.presence.offlineMs = 3000; H.__PLAT_NET.presence.removeMs = 8000;
  G.__PLAT_NET.presence.pingMs = 99999999;
  const gp = H.__PLAT_NET.roster.find(p => !p.host);
  if (!gp) { check('房主名單有來賓', false); report(host.errors.concat(guest.errors)); process.exit(1); }
  H.__PLAT_NET.lastSeen[gp.pid] = Date.now() - 4000;

  const off = await waitFor(() => { const p = H.__PLAT_NET.roster.find(x => !x.host); return p && p.offline; }, 20000, 'guest marked offline');
  check('靜默超過門檻 → 房主標記來賓離線', !!off);
  check('大廳名單顯示（離線）', H.document.getElementById('lob-roster').textContent.includes('離線'), H.document.getElementById('lob-roster').textContent.trim());

  const gone = await waitFor(() => H.__PLAT_NET.roster.length === 1, 25000, 'guest removed');
  check('持續靜默 → 房主把來賓移出名單', !!gone);
  check('大廳名單不再有來賓', !H.document.getElementById('lob-roster').textContent.includes('來賓乙'));

  report(host.errors.concat(guest.errors));
  process.exit(0);
})().catch(e => { console.log('FATAL', e && e.message); process.exit(1); });
