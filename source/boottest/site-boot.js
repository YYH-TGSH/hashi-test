// 站台版 boot 冒煙：直接載 platform-site/index.html，確認殼＋兩款主畫面渲染、零錯誤
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const siteDir = '/home/hatch/workspace/platform-site';
const html = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
const errors = [];
const vc = new (require('jsdom').VirtualConsole)();
vc.on('jsdomError', (e) => { const m = String(e.detail && e.detail.message || e.message || e); if (!/scrollTo|getContext|Not implemented/i.test(m)) errors.push(m); });
vc.on('error', (m) => errors.push(String(m)));
const dom = new JSDOM(html, {
  url: 'http://127.0.0.1:8913/index.html',
  resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(window) {
    window.fetch = (url, opts) => fetch(new URL(url, window.location.href).href, opts);
    window.scrollTo = () => {};
  },
});
const w = dom.window;
w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, ms, label) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { try { if (fn()) return true; } catch (_) {} await sleep(300); }
  console.log('  (waitFor timeout: ' + label + ')'); return false;
}
(async () => {
  let pass = 0, fail = 0;
  const check = (n, ok) => { ok ? pass++ : fail++; console.log((ok ? '✅ ' : '❌ ') + n); };
  check('殼就緒', await waitFor(() => typeof w.PLAT_show === 'function' && !!w.PlatDock, 240000, 'shell'));
  w.PLAT_show('sudoku');
  check('數獨主畫面', await waitFor(() => (w.document.querySelector('#view-sudoku').textContent || '').includes('每日一題'), 240000, 'sudoku home'));
  w.PLAT_show('hashi');
  check('數橋主畫面', await waitFor(() => (w.document.querySelector('#view-hashi').textContent || '').includes('每日一題'), 240000, 'hashi home'));
  check('零頁面錯誤', errors.length === 0);
  if (errors.length) console.log('ERRORS:', errors.slice(0, 5).join(' | '));
  console.log(`RESULT: ${pass} pass, ${fail} fail`);
  w.close();
  process.exitCode = fail ? 1 : 0;
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
