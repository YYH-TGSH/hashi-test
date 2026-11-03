// 除錯：踩地雷插旗 + 獲勝後回主選單
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const mock = require('./mockpeer.js');
const html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8')
  .replace('<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>', () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(200); } console.log('timeout:', label); return null; }
async function main() {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errs.push(m + ' || ' + String((e.detail && e.detail.stack) || '').split('\n').slice(1, 4).join(' <- ')); });
  const dom = new JSDOM(html, { url: 'https://localhost/', runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.__SHARED_REG__ = {}; w.scrollTo = () => {}; w.addEventListener('error', e => { if (e.message && !/Script error/.test(e.message)) errs.push('winerr: ' + e.message); }); } });
  const w = dom.window, d = w.document;
  await waitFor(() => typeof w.PLAT_show === 'function' && w.PlatDock, 120000, 'shell');
  w.PLAT_show('mines');
  await waitFor(() => d.querySelector('#mines-root h1'), 60000, 'mines home');
  const dbg = () => w.__PLAT_HOOKS_mines.debug();
  const cellEls = () => [...d.querySelectorAll('#mines-root button[data-cell]')];
  [...d.querySelectorAll('#mines-root button')].find(b => b.textContent.includes('9×9')).click();
  await waitFor(() => cellEls().length === 81, 15000, 'cells');
  let snap = dbg();
  const mineIdx = snap.layout.indexOf(true);
  cellEls()[mineIdx].click(); await sleep(300);
  snap = dbg(); console.log('after first click: status', snap.status, 'cell', snap.cells[mineIdx]);
  // 切插旗
  const flagBtn = [...d.querySelectorAll('#mines-root button')].find(b => b.getAttribute('data-mode') === 'flag');
  console.log('flagBtn style before:', flagBtn.style.background, '| parent html len', flagBtn.parentElement.innerHTML.length);
  flagBtn.click(); await sleep(200);
  console.log('flagBtn style after:', flagBtn.style.background, 'color:', flagBtn.style.color);
  snap = dbg();
  const m2 = snap.layout.findIndex((v, i) => v && snap.cells[i] === 'h');
  console.log('clicking hidden mine', m2, 'cell text before:', JSON.stringify(cellEls()[m2].textContent));
  cellEls()[m2].click(); await sleep(300);
  snap = dbg();
  console.log('after flag click: cells[m2] =', snap.cells[m2], 'text:', JSON.stringify(cellEls()[m2].textContent));
  // 玩到獲勝
  for (let round = 0; round < 12; round++) {
    snap = dbg(); if (snap.status === 'won') break;
    const digBtn = [...d.querySelectorAll('#mines-root button')].find(b => b.getAttribute('data-mode') === 'dig');
    if (digBtn) digBtn.click(); await sleep(60);
    snap = dbg();
    const targets = []; snap.cells.forEach((c, i) => { if (c === 'h' && !snap.layout[i]) targets.push(i); });
    for (const t of targets) { cellEls()[t].click(); await sleep(10); }
    await sleep(150);
  }
  snap = dbg(); console.log('status now:', snap.status);
  const panel = d.createElement('div'); panel.id = 'plat-status-body'; d.body.appendChild(panel);
  const homeBtn = [...d.querySelectorAll('#mines-root button')].find(b => b.textContent.includes('回主選單'));
  console.log('homeBtn found:', !!homeBtn, homeBtn && homeBtn.textContent);
  homeBtn.click(); await sleep(600);
  console.log('after home click: h1?', !!d.querySelector('#mines-root h1'), '| root children:', d.querySelector('#mines-root').childElementCount, '| body view:', d.body.getAttribute('data-view'));
  console.log('root html head:', d.querySelector('#mines-root').innerHTML.slice(0, 200));
  console.log('STATUS PANEL:', panel.textContent.slice(-1500));
  console.log('ERRORS:\n' + errs.join('\n'));
  process.exit(0);
}
main().catch(e => { console.error('HARNESS', e); process.exit(2); });
