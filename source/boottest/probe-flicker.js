// 數橋來賓閃爍/閃退重現：120ms 延遲 broker＋等待室停留取樣＋開賽後崩塌監測
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer-lat.js');
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
function setInput(w, el, val) { if (!el) return false; const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; setter.call(el, val); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); return true; }
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
(async () => {
  const host = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 300000, 'host shell');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => host.D.querySelector('#lob-room').style.display === 'block', 60000, 'host room');
  const code = (host.D.querySelector('#lob-room-code') || {}).textContent || '';
  const guest = loadPageShared(HTML);
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 300000, 'guest shell');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code.trim());
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => { const t = host.D.body.textContent || ''; return t.includes('阿客') ? t : null; }, 90000, 'host sees guest');
  console.log('room ready, code', code);
  // 發射數橋大亂鬥
  click(host.w, host.D.querySelector('[data-launch="hashi-brawl"]'));
  await waitFor(() => host.D.querySelector('#view-hashi [data-pr-region="roster"]'), 240000, 'host hashi room');
  await waitFor(() => guest.D.querySelector('#view-hashi [data-pr-region="roster"]'), 240000, 'guest hashi room');
  console.log('both in hashi waiting room');
  // 停留取樣 24 秒：來賓名單文字變化次數（閃爍偵測）
  let lastTxt = '', changes = 0; const samples = [];
  const t0 = Date.now();
  while (Date.now() - t0 < 24000) {
    const ro = guest.D.querySelector('#view-hashi [data-pr-region="roster"]');
    const txt = ro ? ro.textContent.replace(/\s+/g, ' ').slice(0, 120) : 'NO-ROSTER';
    if (txt !== lastTxt) { changes++; samples.push(((Date.now() - t0) / 1000).toFixed(1) + 's -> ' + txt); lastTxt = txt; }
    await sleep(400);
  }
  console.log('roster changes:', changes);
  samples.slice(0, 14).forEach(s => console.log('  ' + s));
  check('等待室名單穩定（變化 ≤3 次）', changes <= 3, 'changes=' + changes);
  // 雙方準備 → 房主開始
  click(host.w, host.D.querySelector('#view-hashi [data-pr="ready"]'));
  await sleep(700);
  click(guest.w, guest.D.querySelector('#view-hashi [data-pr="ready"]'));
  await sleep(1500);
  click(host.w, host.D.querySelector('#view-hashi [data-pr="start"]'));
  // 開賽後監測 8 秒：來賓畫面內容長度＋錯誤
  let collapsed = false; const lens = [];
  const t1 = Date.now();
  while (Date.now() - t1 < 8000) {
    const view = guest.D.querySelector('#view-hashi');
    const len = view ? view.textContent.length : 0;
    lens.push(len);
    if (len > 200 && lens[lens.length - 1] < 60 && guest.errors.length) collapsed = true;
    await sleep(500);
  }
  console.log('guest view text lens:', lens.join(','));
  console.log('guest errors:', guest.errors.slice(0, 4));
  console.log('host errors:', host.errors.slice(0, 4));
  check('來賓進遊戲後未崩塌', !collapsed && Math.max(...lens) > 300, 'max len=' + Math.max(...lens));
  check('零頁面錯誤', host.errors.length === 0 && guest.errors.length === 0);
  report([...host.errors, ...guest.errors]);
  host.w.close(); guest.w.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
