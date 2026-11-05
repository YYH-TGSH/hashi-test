// Q2 設定入口 modal 化（v1.43）：數橋標頭 select 改按鈕+modal、地雷規格標籤改設定鈕+modal
// 驗：數橋對局內點設定鈕 → modal 列出難度 → 選 5x5 → 盤面變小；地雷點規格鈕 → modal → 選 16×16 → sizeId=16
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const mock = require('./mockpeer.js');
const html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8')
  .replace('<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>', () => '<script>' + mock + '</scr' + 'ipt>');
let pass = 0, fail = 0; const fails = [];
function ok(cond, label) { if (cond) { pass++; console.log('✅', label); } else { fail++; fails.push(label); console.log('❌', label); } }
async function waitFor(fn, ms, label) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await new Promise(r => setTimeout(r, 120)); }
  console.log('⏱ timeout:', label); return null;
}
const errors = [];
async function main() {
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errors.push(m); });
  vc.on('error', m => errors.push(String(m)));
  const dom = new JSDOM(html, {
    url: 'https://localhost/', runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(window) {
      window.__SHARED_REG__ = {};
      window.scrollTo = () => {};
      window.addEventListener('error', e => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
    }
  });
  const w = dom.window, d = w.document;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clickBtn = (pred, scope) => { const b = [...(scope || d).querySelectorAll('button')].find(pred); if (b) { b.click(); return true; } return false; };
  await waitFor(() => typeof w.PLAT_show === 'function' && w.PlatDock && d.querySelector('#view-home button'), 120000, 'shell ready');

  // ---------- 數橋 ----------
  w.PLAT_show('hashi');
  await waitFor(() => d.querySelector('#view-hashi h1'), 60000, 'hashi home');
  ok(clickBtn(b => b.textContent.includes('單機挑戰'), d.querySelector('#view-hashi')), '數橋：點單機挑戰');
  const svgW0 = await waitFor(() => { const svg = d.querySelector('#view-hashi svg'); return svg ? parseFloat(svg.style.width) || svg.viewBox.baseVal.width : null; }, 30000, 'hashi board');
  ok(!!svgW0, '數橋：盤面出現');
  ok(!d.querySelector('#view-hashi select'), '數橋：標頭已無原生 select');
  ok(clickBtn(b => b.title === '設定難度', d.querySelector('#view-hashi')), '數橋：點設定鈕');
  await sleep(300);
  ok([...d.querySelectorAll('#view-hashi div')].some(x => x.textContent.includes('設定難度') && x.textContent.includes('魔王')), '數橋：設定 modal 列出難度');
  ok(clickBtn(b => b.textContent.includes('幼幼班'), d.querySelector('#view-hashi')), '數橋：選 5x5 幼幼班');
  const shrunk = await waitFor(() => { const svg = d.querySelector('#view-hashi svg'); const wdt = svg ? parseFloat(svg.style.width) || 0 : 0; return (svgW0 && wdt && wdt < svgW0) ? wdt : null; }, 30000, 'hashi board shrink');
  ok(!!shrunk, '數橋：換 5x5 後盤面變小（' + svgW0 + ' → ' + shrunk + '）');

  // ---------- 踩地雷 ----------
  w.PLAT_show('mines');
  await waitFor(() => d.querySelector('#mines-root h1'), 60000, 'mines home');
  const dbg = () => w.__PLAT_HOOKS_mines && w.__PLAT_HOOKS_mines.debug && w.__PLAT_HOOKS_mines.debug();
  ok(clickBtn(b => b.textContent.includes('單機挑戰'), d.querySelector('#mines-root')), '地雷：點單機挑戰');
  await sleep(300);
  ok(clickBtn(b => b.textContent.includes('9×9') || b.textContent.includes('9x9'), d.querySelector('#mines-root')), '地雷：選 9x9');
  await waitFor(() => dbg() && dbg().cells, 10000, 'mines board');
  ok(clickBtn(b => b.title === '設定盤面（換大小重開）', d.querySelector('#mines-root')), '地雷：點規格設定鈕');
  await sleep(300);
  ok([...d.querySelectorAll('#mines-root div')].some(x => x.textContent.includes('設定盤面') && x.textContent.includes('自訂盤面')), '地雷：設定 modal 出現（含自訂）');
  ok(clickBtn(b => b.textContent.includes('16×16'), d.querySelector('#mines-root')), '地雷：選 16×16');
  const grown = await waitFor(() => { const g = dbg(); return g && g.sizeId === 16 && g.cells && g.cells.length === 256 ? true : null; }, 15000, 'mines 16x16');
  ok(!!grown, '地雷：換成 16×16（256 格）');

  ok(errors.length === 0, '零錯誤' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log('\nRESULT settings-modal: ' + pass + ' pass / ' + fail + ' fail' + (fails.length ? ' FAILS: ' + fails.join('；') : ''));
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
