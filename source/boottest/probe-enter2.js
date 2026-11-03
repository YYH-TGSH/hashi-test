// 探針 v2：房主單頁賽程 R1，傾印等待 overlay / PlatRoom attach / 關鍵字 / 倒數狀態
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
  w.PLAT_show('lobby');
  click(w, D.querySelector('#lob-go-create'));
  await waitFor(() => D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'nick');
  setInput(w, D.querySelector('#lob-name'), '阿主');
  click(w, D.querySelector('#lob-confirm'));
  await waitFor(() => (D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'room');
  D.querySelector('#t-s-size').value = '4';
  D.querySelector('#t-s-diff').value = 'easy';
  click(w, D.querySelector('#t-start'));
  console.log('t-start clicked');
  for (let i = 0; i < 10; i++) {
    await sleep(2500);
    const N = w.__PLAT_NET || {};
    const sv = D.querySelector('#view-sudoku');
    const txt = (sv.textContent || '').replace(/\s+/g, ' ');
    const cd = D.querySelector('#plat-countdown');
    console.log('+' + ((i + 1) * 2.5) + 's inMatch=' + N.inMatch +
      ' platRoomAttached=' + (w.PlatRoom ? w.PlatRoom.isAttached() : 'n/a') +
      ' regions=' + D.querySelectorAll('[data-pr-region]').length +
      ' cd=' + (cd ? cd.style.display + '/' + (cd.textContent || '').trim() : 'none'));
    console.log('   kw: 遊戲大廳=' + txt.includes('遊戲大廳') + ' 等待房主=' + txt.includes('等待房主') + ' 準備=' + txt.includes('準備') + ' 倒數=' + txt.includes('倒數') + ' 產生中/生成=' + (txt.includes('生成') || txt.includes('產生')));
    console.log('   txt[600..900]: ' + txt.slice(600, 900));
    if (D.querySelector('[data-pr-region="roster"]')) { console.log('ROSTER APPEARED'); break; }
  }
  console.log('errors:', host.errors.slice(0, 5));
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
