// 三頁（數獨合作）：阿丙閒置未準備 → 房主+阿客準備（預期不自動開始）→ 房主強制開始 → 誰進遊戲？
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
async function watch(pages, ms, label) {
  const seen = { cd: {}, gone: {} };
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    for (const [k, pg] of Object.entries(pages)) {
      const cd = pg.D.querySelector('#plat-countdown');
      if (cd && cd.style.display === 'flex') seen.cd[k] = true;
      if (!roomEl(pg)) seen.gone[k] = Date.now() - t0;
    }
    if (seen.gone.host && seen.gone.g1) break;
    await sleep(80);
  }
  console.log(label, JSON.stringify(seen));
  return seen;
}
(async () => {
  const host = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick step');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room code');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
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
  click(host.w, host.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await sleep(600);
  click(g1.w, g1.D.querySelector('#view-sudoku [data-pr="ready"]'));
  const s1 = await watch({ host, g1, g2 }, 9000, 'after 2 readies (p3 idle):');
  check('兩人準備、第三人閒置 → 不自動開始（現行行為）', !s1.gone.host && !s1.gone.g1);
  const startBtn = host.D.querySelector('#view-sudoku [data-pr="start"]');
  check('房主有強制開始鈕', !!startBtn);
  if (startBtn) click(host.w, startBtn);
  const s2 = await watch({ host, g1, g2 }, 20000, 'after force start:');
  check('強制開始後房主看到倒數', !!s2.cd.host);
  check('強制開始後阿客看到倒數', !!s2.cd.g1);
  check('強制開始後房主進入遊戲', !!s2.gone.host);
  check('強制開始後阿客進入遊戲', !!s2.gone.g1);
  check('零錯誤', host.errors.length === 0 && g1.errors.length === 0 && g2.errors.length === 0);
  report([...host.errors, ...g1.errors, ...g2.errors]);
  host.w.close(); g1.w.close(); g2.w.close();
})().catch((e) => { console.error('FATAL', e); report([]); process.exitCode = 1; });
