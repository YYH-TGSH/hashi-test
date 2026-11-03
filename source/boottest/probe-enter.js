// 探針：房主單頁，賽程 R1 launch 後逐步取樣 hooks 註冊 / enter 呼叫 / 等待室出現的時間點
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
const { sleep, waitFor, click } = require('./harness');
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
(async () => {
  const host = loadPageShared(HTML);
  const w = host.w, D = host.D;
  await waitFor(() => typeof w.PLAT_show === 'function' && w.PlatDock, 600000, 'shell');
  // hooks 註冊/enter 呼叫計時（defineProperty 陷阱，setter 記錄 + 包裝 enter）
  const T0 = Date.now();
  const marks = [];
  ['sudoku', 'hashi'].forEach(g => {
    let val;
    Object.defineProperty(w, '__PLAT_HOOKS_' + g, {
      configurable: true, enumerable: true,
      get() { return val; },
      set(v) {
        marks.push(g + ' hooks registered @' + (Date.now() - T0) + 'ms');
        if (v && v.enter && !v.__probeWrapped) {
          const orig = v.enter;
          v = Object.assign({}, v, { enter: (sess) => { marks.push(g + ' ENTER called @' + (Date.now() - T0) + 'ms tourn=' + JSON.stringify(sess && sess.tourn)); return orig(sess); } });
          v.__probeWrapped = true;
        }
        val = v;
      }
    });
  });
  w.PLAT_show('lobby');
  click(w, D.querySelector('#lob-go-create'));
  await waitFor(() => D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'nick');
  setInput(w, D.querySelector('#lob-name'), '阿主');
  click(w, D.querySelector('#lob-confirm'));
  await waitFor(() => (D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'room');
  console.log('room ready @' + (Date.now() - T0) + 'ms');
  D.querySelector('#t-s-size').value = '4';
  D.querySelector('#t-s-diff').value = 'easy';
  const tLaunch = Date.now();
  click(w, D.querySelector('#t-start'));
  console.log('t-start clicked');
  for (let i = 0; i < 40; i++) {
    await sleep(3000);
    const N = w.__PLAT_NET || {};
    const roster = !!D.querySelector('#view-sudoku [data-pr-region="roster"]');
    const viewTxt = (D.querySelector('#view-sudoku').textContent || '').replace(/\s+/g, ' ').slice(0, 110);
    console.log('+' + (Date.now() - tLaunch) + 'ms view=' + D.body.getAttribute('data-view') + ' inMatch=' + N.inMatch + ' gamePeer=' + !!N.gamePeer + ' roster=' + roster + ' | ' + viewTxt);
    while (marks.length) console.log('   MARK:', marks.shift());
    if (roster) break;
  }
  console.log('errors:', host.errors.slice(0, 5));
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
