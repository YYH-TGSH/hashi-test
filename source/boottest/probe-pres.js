const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
const { sleep, waitFor } = require('./harness');
let html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
html = html.replace(/<script[^>]+src="[^"]*peerjs[^"]*"[^>]*><\/script>/, '<script>' + mockSrc + '</script>');
const vc = new VirtualConsole(); vc.on('error', m => console.log('VCERR', m));
const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(window) { window.fetch = (u, o) => fetch(new URL(u, window.location.href).href, o); window.scrollTo = () => {}; } });
const w = dom.window;
(async () => {
  await waitFor(() => typeof w.PLAT_show === 'function' && w.PlatDock, 300000, 'shell');
  console.log('PlatResults exists:', typeof w.PlatResults, w.PlatResults && Object.keys(w.PlatResults));
  w.PlatResults.show({ accent: '#ffcc00', title: '大亂鬥結果', entries: [{ name: '阿主', color: '#ffd23f', isMe: true, right: '⏱ 1:23' }], buttons: [{ id: 'rematch', label: '🔁 再來一局', kind: 'primary' }], onAction: (id) => console.log('action', id) });
  await sleep(500);
  const el = w.document.querySelector('#plat-results');
  console.log('el exists:', !!el, 'display:', el && el.style.display, 'has title:', el && el.textContent.includes('大亂鬥結果'), 'has btn:', !!w.document.querySelector('[data-pres="rematch"]'));
  w.PlatResults.hide();
  await sleep(200);
  console.log('after hide display:', el.style.display, 'visible flag:', w.PlatResults._visible());
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
