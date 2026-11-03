// 遊戲層心跳測試（共用 REG 雙頁，數橋等待室）：包裝來賓殼連線、丟棄遊戲層 PING（模擬來賓端靜默）
// 預期：~25s 房主把來賓標離線（狀態點 bg-slate-300）→ ~60s 等待中移除來賓
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
  click(G, G.document.getElementById('lob-go-join'));
  await waitFor(() => G.document.getElementById('lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(G, G.document.getElementById('lob-name'), '來賓乙');
  setInput(G, G.document.getElementById('lob-code'), code);
  click(G, G.document.getElementById('lob-confirm'));
  const joined = await waitFor(() => H.__PLAT_NET.roster.length === 2, 60000, 'roster 2');
  check('兩人進房', !!joined);

  // 包裝來賓的殼連線：丟棄遊戲層 PING（殼層 ping 照常送，隔離出遊戲層靜默）
  const gc = G.__PLAT_NET.conns[G.__PLAT_NET.hostPid];
  check('來賓殼連線存在', !!gc);
  const origSend = gc.send.bind(gc);
  gc.send = (d) => { if (d && !d.__plat && d.type === 'PING') return; return origSend(d); }; // 遊戲訊息在共用連線上是裸送（無 __plat 信封）；殼 ping 帶 __plat 不受影響

  // 預熱 boot 數橋 + 發射大亂鬥
  H.PLAT_show('hashi'); await sleep(500); H.PLAT_show('home');
  G.PLAT_show('hashi'); await sleep(500); G.PLAT_show('home');
  click(H, H.document.querySelector('[data-launch="hashi-brawl"]'));
  const region = () => H.document.querySelector('#view-hashi [data-pr-region="roster"]');
  const inRoom = await waitFor(() => { const r = region(); return r && r.textContent.includes('來賓乙'); }, 120000, 'host waiting room has guest');
  check('兩人進數橋等待室（來賓遊戲 PING 被丟棄）', !!inRoom);
  const joinedAt = Date.now();

  const off = await waitFor(() => { const r = region(); return r && /bg-slate-300/.test(r.innerHTML); }, 70000, 'guest dot turns offline');
  check('約 25 秒靜默 → 房主等待室把來賓標為離線', !!off, 'at ' + Math.round((Date.now() - joinedAt) / 1000) + 's');

  const gone = await waitFor(() => { const r = region(); return r && !r.textContent.includes('來賓乙'); }, 80000, 'guest removed');
  check('約 60 秒靜默 → 房主把來賓移出等待室名單', !!gone, 'at ' + Math.round((Date.now() - joinedAt) / 1000) + 's');

  report(host.errors.concat(guest.errors));
  process.exit(0);
})().catch(e => { console.log('FATAL', e && e.message); process.exit(1); });
