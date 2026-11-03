// 回歸測試：暱稱步拉霸選色後，必須留在暱稱步（不可被 renderLobby 踢回入口步），且能正常確認進房
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
  const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set;
  setter.call(el, val);
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
  el.dispatchEvent(new w.Event('change', { bubbles: true }));
}
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
const disp = (D, id) => (D.querySelector(id) || { style: {} }).style.display;
(async () => {
  // 情境 A：建房路徑——拉霸選色後留在暱稱步，確認後進房間
  const host = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => disp(host.D, '#lob-step-nick') === 'block', 60000, 'host nick step');
  click(host.w, host.D.querySelector('#lob-color-spin'));
  await waitFor(() => !!host.w.localStorage.getItem('plat_color'), 30000, 'color slot result');
  await sleep(400); // 等 spin 收尾的 render 呼叫跑完
  check('A 選色後仍停在暱稱步', disp(host.D, '#lob-step-nick') === 'block');
  check('A 選色後入口步未被顯示', disp(host.D, '#lob-step-entry') !== 'block');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room code');
  check('A 確認後進房間（房間步顯示）', disp(host.D, '#lob-room') === 'block');

  // 情境 B：加入路徑——拉霸選色後同樣留在暱稱步
  const guest = loadPageShared(HTML);
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => disp(guest.D, '#lob-step-nick') === 'block', 60000, 'guest nick step');
  guest.w.localStorage.removeItem('plat_color');
  click(guest.w, guest.D.querySelector('#lob-color-spin'));
  await waitFor(() => !!guest.w.localStorage.getItem('plat_color'), 30000, 'guest color slot result');
  await sleep(400);
  check('B 選色後仍停在暱稱步', disp(guest.D, '#lob-step-nick') === 'block');
  check('B 選色後入口步未被顯示', disp(guest.D, '#lob-step-entry') !== 'block');

  const errs = host.errors.concat(guest.errors);
  check('零錯誤', errs.length === 0);
  report(errs);
})();
