// 除錯：來賓設定槽內容出現時機（新版 build）
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer-lat.js');
const { sleep, waitFor, click } = require('./harness');
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
  const H = host.w, G = guest.w;
  await waitFor(() => typeof H.PLAT_show === 'function' && H.PlatDock, 120000, 'host shell');
  await waitFor(() => typeof G.PLAT_show === 'function' && G.PlatDock, 120000, 'guest shell');
  click(H, H.document.getElementById('lob-go-create'));
  await waitFor(() => H.document.getElementById('lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(H, H.document.getElementById('lob-name'), '阿主');
  click(H, H.document.getElementById('lob-confirm'));
  await waitFor(() => H.__PLAT_NET.active && H.__PLAT_NET.isHost, 60000, 'host room');
  const code = H.__PLAT_NET.code;
  click(G, G.document.getElementById('lob-go-join'));
  await waitFor(() => G.document.getElementById('lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(G, G.document.getElementById('lob-name'), '阿客');
  setInput(G, G.document.getElementById('lob-code'), code);
  click(G, G.document.getElementById('lob-confirm'));
  await waitFor(() => H.__PLAT_NET.roster.length === 2, 60000, 'roster 2');
  H.PLAT_show('hashi'); await sleep(400); H.PLAT_show('home');
  G.PLAT_show('hashi'); await sleep(400); G.PLAT_show('home');
  click(H, H.document.querySelector('[data-launch="hashi-brawl"]'));
  await waitFor(() => { const r = G.document.querySelector('#view-hashi [data-pr-region="roster"]'); return r && r.textContent.includes('阿客'); }, 120000, 'guest roster');
  console.log('roster appeared at', Date.now() % 100000);
  for (let i = 0; i < 6; i++) {
    const slot = G.document.querySelector('#view-hashi [data-pr-slot="settings"]');
    console.log('+', i * 1.5, 's slot:', slot ? ('len=' + slot.innerHTML.length + ' text=' + slot.textContent.slice(0, 40).replace(/\s+/g, ' ')) : '(no slot el)');
    await sleep(1500);
  }
  console.log('guest errors:', guest.errors.slice(0, 3).join(' | ') || '(none)');
  process.exit(0);
})().catch(e => { console.log('FATAL', e && e.message); process.exit(1); });
