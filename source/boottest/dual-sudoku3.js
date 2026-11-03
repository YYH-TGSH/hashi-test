// 三頁真連線（數獨合作）：房主+來賓+觀戰者；房主與選手準備後，雙方應進遊戲
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
async function joinLobby(guest, code, name) {
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, name + ' shell');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, name + ' nick step');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  setInput(guest.w, guest.D.querySelector('#lob-name'), name);
  click(guest.w, guest.D.querySelector('#lob-confirm'));
}
const roomEl = (pg) => pg.D.querySelector('#view-sudoku [data-pr-region="roster"]');
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
  const g1 = loadPageShared(HTML);
  await joinLobby(g1, code, '阿客');
  await waitFor(() => (g1.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿主'), 60000, 'g1 sees host');
  const g2 = loadPageShared(HTML);
  await joinLobby(g2, code, '阿丙');
  await waitFor(() => (g2.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿客'), 60000, 'g2 sees g1');
  click(host.w, host.D.querySelector('[data-launch="sudoku-coop"]'));
  await waitFor(() => roomEl(host), 180000, 'host room');
  await waitFor(() => roomEl(g1), 180000, 'g1 room');
  await waitFor(() => roomEl(g2), 180000, 'g2 room');
  await sleep(6000); // 等房主生成題目完成，避免生成競速干擾判定
  console.log('host roster:', roomEl(host).textContent.replace(/\s+/g, ' '));
  // 阿丙切觀戰（自己名單列的開關）
  const tg = g2.D.querySelector('#view-sudoku [data-pr="player-toggle"]');
  check('阿丙名單列有觀戰開關（coop 也要有）', !!tg);
  if (tg) click(g2.w, tg);
  await sleep(1200);
  console.log('after spec toggle, host roster:', roomEl(host) ? roomEl(host).textContent.replace(/\s+/g, ' ') : '(gone)');
  // 房主準備、阿客準備
  click(host.w, host.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await sleep(600);
  click(g1.w, g1.D.querySelector('#view-sudoku [data-pr="ready"]'));
  let hostCd = false, g1Cd = false, hostGone = 0, g1Gone = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < 30000) {
    const hcd = host.D.querySelector('#plat-countdown'); if (hcd && hcd.style.display === 'flex') hostCd = true;
    const gcd = g1.D.querySelector('#plat-countdown'); if (gcd && gcd.style.display === 'flex') g1Cd = true;
    if (!hostGone && !roomEl(host)) hostGone = Date.now() - t0;
    if (!g1Gone && !roomEl(g1)) g1Gone = Date.now() - t0;
    if (hostGone && g1Gone) break;
    await sleep(80);
  }
  console.log('timeline hostCd=' + hostCd, 'g1Cd=' + g1Cd, 'hostGone=' + hostGone, 'g1Gone=' + g1Gone);
  if (roomEl(host)) console.log('host roster at end:', roomEl(host).textContent.replace(/\s+/g, ' '));
  check('房主看到倒數', hostCd);
  check('阿客看到倒數', g1Cd);
  check('房主進入遊戲', hostGone > 0);
  check('阿客進入遊戲', g1Gone > 0);
  check('零錯誤', host.errors.length === 0 && g1.errors.length === 0 && g2.errors.length === 0);
  report([...host.errors, ...g1.errors, ...g2.errors]);
  host.w.close(); g1.w.close(); g2.w.close();
})().catch((e) => { console.error('FATAL', e); report([]); process.exitCode = 1; });
