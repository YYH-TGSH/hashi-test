// 除錯2：home→game→主選單（無結算卡）是否也炸
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
  const panel = d.createElement('div'); panel.id = 'plat-status-body'; d.body.appendChild(panel);
  delete w.PlatBar; w.PLAT_show("mines");
  await waitFor(() => d.querySelector('#mines-root h1'), 60000, 'mines home');
  const cellEls = () => [...d.querySelectorAll('#mines-root button[data-cell]')];
  [...d.querySelectorAll('#mines-root button')].find(b => b.textContent.includes('9×9')).click();
  await waitFor(() => cellEls().length === 81, 15000, 'cells');
  console.log('game ok, cells:', cellEls().length, '| panel so far:', JSON.stringify(panel.textContent.slice(-200)));
  const back = [...d.querySelectorAll('#mines-root button')].find(b => b.textContent.includes('主選單'));
  back.click(); await sleep(600);
  console.log('after back: h1?', !!d.querySelector('#mines-root h1'), '| children:', d.querySelector('#mines-root').childElementCount);
  console.log('panel:', panel.textContent.slice(-400));
  // 再進一次遊戲再回來
  const b9 = [...d.querySelectorAll('#mines-root button')].find(b => b.textContent.includes('9×9'));
  if (b9) { b9.click(); await waitFor(() => cellEls().length === 81, 15000, 'cells2'); console.log('game2 cells:', cellEls().length); }
  process.exit(0);
}
main().catch(e => { console.error('HARNESS', e); process.exit(2); });
