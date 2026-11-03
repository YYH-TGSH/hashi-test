// 同瀏覽器雙分頁重現：兩頁共用 localStorage（同 profile）+ 共用 mock broker
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
const { sleep, waitFor, click, check, report } = require('./harness');
const SHARED_REG = {};
// 共用 localStorage backing（模擬同一個瀏覽器的兩個分頁）
const storeMap = new Map();
function makeStorage() {
  return {
    getItem: (k) => (storeMap.has(String(k)) ? storeMap.get(String(k)) : null),
    setItem: (k, v) => { storeMap.set(String(k), String(v)); },
    removeItem: (k) => { storeMap.delete(String(k)); },
    clear: () => storeMap.clear(),
    key: (i) => [...storeMap.keys()][i] || null,
    get length() { return storeMap.size; },
  };
}
function loadTab(htmlPath) {
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
      try { Object.defineProperty(window, 'localStorage', { configurable: true, value: makeStorage() }); } catch (e) { console.log('LS override fail', e.message); }
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
  const A = loadTab(HTML); // 分頁 A = 房主
  await waitFor(() => typeof A.w.PLAT_show === 'function' && A.w.PlatDock, 300000, 'A shell');
  click(A.w, A.D.querySelector('#lob-go-create'));
  await waitFor(() => A.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'A nick');
  setInput(A.w, A.D.querySelector('#lob-name'), '阿甲');
  click(A.w, A.D.querySelector('#lob-confirm'));
  await waitFor(() => A.D.querySelector('#lob-room') && A.D.querySelector('#lob-room').style.display === 'block', 60000, 'A room');
  const code = (A.D.querySelector('#lob-room-code') || {}).textContent || '';
  console.log('room code:', code, '| A me.name:', A.w.__PLAT_NET.me.name);
  const B = loadTab(HTML); // 分頁 B = 來賓（同瀏覽器！）
  await waitFor(() => typeof B.w.PLAT_show === 'function' && B.w.PlatDock, 300000, 'B shell');
  click(B.w, B.D.querySelector('#lob-go-join'));
  await waitFor(() => B.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'B nick');
  setInput(B.w, B.D.querySelector('#lob-code'), code.trim());
  setInput(B.w, B.D.querySelector('#lob-name'), '阿乙');
  click(B.w, B.D.querySelector('#lob-confirm'));
  const joined = await waitFor(() => { const t = A.D.body.textContent || ''; return t.includes('阿乙') ? t : null; }, 90000, 'A sees B');
  console.log('A lobby sees B:', !!joined, '| B me.name:', B.w.__PLAT_NET.me.name);
  console.log('LS keys:', [...storeMap.keys()].join(','));
  // 房主從大廳發射數獨大亂鬥
  click(A.w, A.D.querySelector('[data-launch="sudoku-brawl"]'));
  await waitFor(() => A.D.querySelector('#view-sudoku [data-pr-region="roster"]'), 180000, 'A sudoku room');
  await waitFor(() => B.D.querySelector('#view-sudoku [data-pr-region="roster"]'), 180000, 'B sudoku room');
  await sleep(2500);
  const dump = (pg, tag) => {
    const ro = pg.D.querySelector('#view-sudoku [data-pr-region="roster"]');
    console.log(tag + ' roster: ' + (ro ? ro.textContent.replace(/\s+/g, ' ').slice(0, 220) : 'none'));
  };
  dump(A, '[A]'); dump(B, '[B]');
  check('A 名單含阿甲', (A.D.querySelector('#view-sudoku [data-pr-region="roster"]') || { textContent: '' }).textContent.includes('阿甲'));
  check('B 名單含阿甲', (B.D.querySelector('#view-sudoku [data-pr-region="roster"]') || { textContent: '' }).textContent.includes('阿甲'));
  check('兩邊名單含阿乙', (A.D.body.textContent || '').includes('阿乙') && (B.D.body.textContent || '').includes('阿乙'));
  console.log('A errors:', A.errors.slice(0, 3)); console.log('B errors:', B.errors.slice(0, 3));
  report([]);
  A.w.close(); B.w.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
