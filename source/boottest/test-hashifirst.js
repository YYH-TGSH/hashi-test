// 情境驗證（使用者回報：五戰先數橋再數獨，來賓一直斷線重連＋誤以為自己是房主）：
// 來賓先在數獨玩過單機/每日一題（switchToOffline 把 isHost 毒化為 true），之後以來賓身份進數獨等待室
// 必須：(1) 沒有開始按鈕 (2) 房主端名單穩定不閃（無殭屍 PLAYERS_UPDATE 廣播）
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
(async () => {
  // ===== Phase 0：來賓先玩數獨每日一題（毒化 isHost）=====
  const guest = loadPageShared(HTML);
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  guest.w.PLAT_show('sudoku');
  const dailyBtn = await waitFor(() => [...guest.D.querySelectorAll('#view-sudoku button')].find(b => b.textContent.includes('每日一題')), 180000, 'guest sudoku daily btn');
  check('來賓打開數獨主畫面（每日一題鈕）', !!dailyBtn);
  click(guest.w, dailyBtn);
  await sleep(4000); // 每日一題開局 → switchToOffline → isHost=true（舊版毒化點）
  guest.w.PLAT_show('home');
  await sleep(1000);

  // ===== 正常大廳流程 =====
  const host = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick step');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room code');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick step');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => (guest.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿主'), 60000, 'guest sees host');
  click(host.w, host.D.querySelector('[data-launch="sudoku-coop"]'));
  await waitFor(() => host.D.querySelector('#view-sudoku [data-pr-region="roster"]'), 180000, 'host sudoku room');
  await waitFor(() => guest.D.querySelector('#view-sudoku [data-pr-region="roster"]'), 180000, 'guest sudoku room');
  await sleep(1500);
  check('被毒化的來賓：沒有開始按鈕', !guest.D.querySelector('#view-sudoku [data-pr="start"]'));
  check('被毒化的來賓：看到「等待房主開始」', guest.D.querySelector('#view-sudoku').textContent.includes('等待房主開始'));
  check('房主端：有開始按鈕', !!host.D.querySelector('#view-sudoku [data-pr="start"]'));
  // 房主端名單穩定取樣 10 秒（殭屍廣播會讓 阿客 反覆消失/出現＝斷線重連感）
  let present = 0, total = 0, transitions = 0, prev = null;
  const t0 = Date.now();
  while (Date.now() - t0 < 10000) {
    const r = host.D.querySelector('#view-sudoku [data-pr-region="roster"]');
    const has = r ? r.textContent.includes('阿客') : false;
    total++; if (has) present++;
    if (prev !== null && has !== prev) transitions++;
    prev = has;
    await sleep(250);
  }
  console.log('host roster sampling: present=' + present + '/' + total, 'transitions=' + transitions);
  check('房主名單穩定（阿客不消失）', present >= total - 1);
  check('房主名單無進出循環（transitions<=1）', transitions <= 1);
  check('零頁面錯誤（host+guest）', host.errors.length === 0 && guest.errors.length === 0);
  report([...host.errors, ...guest.errors]); host.w.close(); guest.w.close();
})().catch((e) => { console.error('FATAL', e); report([]); process.exitCode = 1; });
