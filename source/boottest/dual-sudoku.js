// 雙頁真連線測試（數獨合作）：房主準備→來賓準備→雙方都應進入遊戲（倒數→playing）
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
  const dom = new JSDOM(html, {
    url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(window) {
      window.__SHARED_REG__ = SHARED_REG;
      window.fetch = (url, opts) => fetch(new URL(url, window.location.href).href, opts);
      window.scrollTo = () => {};
    },
  });
  const w = dom.window;
  w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
  return { w, D: w.document, errors };
}
function setInput(w, el, val) {
  if (!el) return false;
  const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set;
  setter.call(el, val);
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
  el.dispatchEvent(new w.Event('change', { bubbles: true }));
  return true;
}
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
const roomGone = (pg) => !pg.D.querySelector('#view-sudoku [data-pr-region="roster"]');
(async () => {
  const host = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick step');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room code');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  console.log('room code:', code);
  const guest = loadPageShared(HTML);
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick step');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => (guest.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿主'), 60000, 'guest sees host');
  // 房主啟動數獨合作
  click(host.w, host.D.querySelector('[data-launch="sudoku-coop"]'));
  await waitFor(() => host.D.querySelector('#view-sudoku [data-pr-region="roster"]'), 180000, 'host sudoku room');
  await waitFor(() => guest.D.querySelector('#view-sudoku [data-pr-region="roster"]'), 180000, 'guest sudoku room');
  check('雙方進數獨等待室', true);
  const gRoster = guest.D.querySelector('#view-sudoku [data-pr-region="roster"]').textContent.replace(/\s+/g, ' ');
  console.log('guest sudoku roster:', gRoster);
  check('來賓等待室名單含阿主+阿客', gRoster.includes('阿主') && gRoster.includes('阿客'));
  // 房主先準備，來賓後準備（使用者的操作順序）
  click(host.w, host.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await sleep(800);
  click(guest.w, guest.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await sleep(1200);
  // 新規：準備不會自動開始，房主按「開始比賽」才倒數
  const sbS = host.D.querySelector('#view-sudoku [data-pr="start"]');
  console.log('host start btn:', !!sbS, sbS && sbS.textContent);
  click(host.w, sbS);
  // 取樣觀察 30 秒：倒數 overlay + 等待室消失
  let hostCd = false, guestCd = false, hostGoneAt = 0, guestGoneAt = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < 30000) {
    const hcd = host.D.querySelector('#plat-countdown');
    if (hcd && hcd.style.display === 'flex') hostCd = true;
    const gcd = guest.D.querySelector('#plat-countdown');
    if (gcd && gcd.style.display === 'flex') guestCd = true;
    if (!hostGoneAt && roomGone(host)) hostGoneAt = Date.now() - t0;
    if (!guestGoneAt && roomGone(guest)) guestGoneAt = Date.now() - t0;
    if (hostGoneAt && guestGoneAt) break;
    await sleep(100);
  }
  console.log('timeline: hostCd=' + hostCd, 'guestCd=' + guestCd, 'hostGoneAt=' + hostGoneAt, 'guestGoneAt=' + guestGoneAt);
  check('房主看到倒數', hostCd);
  check('來賓看到倒數', guestCd);
  check('房主離開等待室（進入遊戲）', hostGoneAt > 0);
  check('來賓離開等待室（進入遊戲）', guestGoneAt > 0);
  check('零頁面錯誤（host+guest）', host.errors.length === 0 && guest.errors.length === 0);
  report([...host.errors, ...guest.errors]); host.w.close(); guest.w.close();
})().catch((e) => { console.error('FATAL', e); report([]); process.exitCode = 1; });
