// 除錯6：每日完成後主畫面按鈕文字
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const mock = require('./mockpeer.js');
const html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8')
  .replace('<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>', () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(200); } console.log('timeout:', label); return null; }
async function main() {
  const vc = new VirtualConsole(); vc.on('jsdomError', () => {}); vc.on('error', () => {});
  const dom = new JSDOM(html, { url: 'https://localhost/', runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.__SHARED_REG__ = {}; w.scrollTo = () => {}; } });
  const w = dom.window, d = w.document;
  await waitFor(() => typeof w.PLAT_show === 'function' && w.PlatDock, 120000, 'shell');
  w.PLAT_show('mines');
  await waitFor(() => d.querySelector('#mines-root h1'), 60000, 'home');
  const dbg = () => w.__PLAT_HOOKS_mines.debug();
  const cellEls = () => [...d.querySelectorAll('#mines-root button[data-cell]')];
  [...d.querySelectorAll('#mines-root button')].find(b => b.textContent.includes('每日一題')).click();
  await waitFor(() => cellEls().length === 81, 15000, 'cells');
  for (let round = 0; round < 12; round++) {
    const snap = dbg(); if (snap.status === 'won') break;
    const targets = []; snap.cells.forEach((c, i) => { if (c === 'h' && !snap.layout[i]) targets.push(i); });
    for (const t of targets) { cellEls()[t].click(); await sleep(10); }
    await sleep(150);
  }
  console.log('status:', dbg().status, '| records:', w.localStorage.getItem('mines_daily_records'));
  [...d.querySelectorAll('#mines-root button')].find(b => b.textContent.includes('回主選單')).click();
  await waitFor(() => d.querySelector('#mines-root h1'), 5000, 'home2');
  await sleep(300);
  console.log('HOME BUTTONS:');
  [...d.querySelectorAll('#mines-root button')].forEach(b => console.log(' -', JSON.stringify(b.textContent)));
  process.exit(0);
}
main().catch(e => { console.error('HARNESS', e); process.exit(2); });
