// Bug2 機制驗證：殼層同 pid 連線替換（斷線重連）後，遊戲 VirtualConn 的 _real 是否變成殭屍
// 模擬：雙方進數獨房間後，從來賓的真 Peer 對同一個房主 pid 再開一條新連線（PeerJS 重連的等價物），
// 殼會以新連線覆蓋 Net.conns[pid]；檢查來賓遊戲 wrapper 的 _real 有沒有跟著換、以及 send 是否還送得到房主。
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
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
function setInput(w, el, val) { const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; setter.call(el, val); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); }
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
(async () => {
  const host = loadPageShared(HTML), guest = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  for (const pg of [host, guest]) { pg.w.PLAT_show('sudoku'); await waitFor(() => !!pg.w.__PLAT_HOOKS_sudoku, 300000, 'preboot'); pg.w.PLAT_show('lobby'); }
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => (guest.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'guest room');
  click(host.w, host.D.querySelector('[data-launch="sudoku-brawl"]'));
  await waitFor(() => guest.D.querySelector('#view-sudoku [data-pr-region="roster"]'), 120000, 'guest in sudoku room');
  await sleep(1500);
  const hostPid = host.w.__PLAT_NET.myPid;
  const guestPid = guest.w.__PLAT_NET.myPid;
  const gw = () => guest.w.__PLAT_NET.gamePeer && guest.w.__PLAT_NET.gamePeer._wrappers[hostPid];
  const hw = () => host.w.__PLAT_NET.gamePeer && host.w.__PLAT_NET.gamePeer._wrappers[guestPid];
  check('來賓遊戲 wrapper 存在', !!gw());
  check('房主遊戲 wrapper 存在', !!hw());
  const oldReal = gw()._real;
  console.log('before: guest wrapper _real === shell conn:', oldReal === Object.values(guest.w.__PLAT_NET.conns)[0]);
  // 模擬同 pid 重連：來賓的真 peer 再開一條新連線給房主（新 mock conn 物件、同 pid）
  const newConn = guest.w.__PLAT_NET.peer.connect(hostPid);
  await sleep(1200);
  const shellConnGuest = guest.w.__PLAT_NET.conns[hostPid];
  console.log('after reconnect: shell Net.conns replaced:', shellConnGuest && shellConnGuest !== oldReal);
  // 房主經新連線送一則遊戲訊息（觸發來賓端 routeData → wrapperFor 路徑）
  host.w.__got = [];
  Object.values(host.w.__PLAT_NET.conns).forEach(c => c.on('data', d => { if (d && d.type === 'PROBE_PONG') host.w.__got.push(d); }));
  const hostShellConn = host.w.__PLAT_NET.conns[guestPid];
  hostShellConn.send({ type: 'PROBE_PING' });
  await sleep(800);
  const w2 = gw();
  console.log('guest wrapper _real is NEW conn:', w2._real === shellConnGuest, '| still OLD conn:', w2._real === oldReal);
  check('重連後 wrapper._real 已重新綁定新連線（無殭屍）', w2._real === shellConnGuest);
  // 來賓遊戲層經 wrapper 回送（等價於 GHOST_I_WON 的送出路徑）
  w2.send({ type: 'PROBE_PONG' });
  await sleep(800);
  check('來賓遊戲層 send 在重連後仍送達房主', host.w.__got.length > 0);
  report([...host.errors, ...guest.errors]);
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); report([]); process.exit(1); });
