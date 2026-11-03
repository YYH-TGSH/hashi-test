const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
let html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
let mock = require('./mockpeer.js');
mock = mock.replace("R.__msglog = R.__msglog || [];", "R.__msglog = R.__msglog || []; R.__fullog = R.__fullog || [];")
           .replace("if (pl && pl.type) R.__msglog.push({", "if (pl && pl.type) { try { R.__fullog.push(pl); } catch (e) {} R.__msglog.push({")
           .replace(": undefined }); } } catch (e) {}", ": undefined }); } } } catch (e) {}");
html = html.replace('<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>', () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(300); } console.log('  (waitFor timeout: ' + label + ')'); return null; }
const SHARED_REG = {};
function loadPage(label) {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errs.push(m); });
  vc.on('error', m => errs.push(String(m)));
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.__SHARED_REG__ = SHARED_REG; w.scrollTo = () => {}; w.localStorage.setItem('sudoku_input_mode', 'number'); w.addEventListener('error', e => { if (e.message && !/Script error/.test(e.message)) errs.push(e.message); }); } });
  return { window: dom.window, document: dom.window.document, errors: errs, label };
}
const clickEl = (p, el) => { if (el) el.dispatchEvent(new p.window.MouseEvent('click', { bubbles: true })); return !!el; };
const click = (p, sel) => clickEl(p, p.document.querySelector(sel));
const hubRoom = (p) => { const rm = p.document.querySelector('#lob-step-room'); return rm && rm.style.display === 'block' ? rm : null; };
function saves(p) { const ls = p.window.localStorage, out = []; for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k && k.indexOf('sudoku_prog_') === 0) { try { const v = JSON.parse(ls.getItem(k)); out.push(k.slice(0, 22) + ' cells=' + (v.d ? v.d.length : '?')); } catch (e) {} } } return out; }
async function joinAs(p, name, code) {
  p.window.localStorage.setItem('plat_name', name);
  if (code) { click(p, '#lob-go-join'); } else { click(p, '#lob-go-create'); }
  await waitFor(() => p.document.querySelector('#lob-step-nick').style.display !== 'none', 30000, p.label + ' nick');
  p.document.querySelector('#lob-name').value = name;
  if (code) p.document.querySelector('#lob-code').value = code;
  click(p, '#lob-confirm');
  await waitFor(() => hubRoom(p), 60000, p.label + ' room');
}
async function main() {
  const H = loadPage('H'); const G = loadPage('G');
  for (const p of [H, G]) await waitFor(() => (typeof p.window.PLAT_show === 'function' && p.window.__PLAT_NET) ? true : null, 120000, p.label + ' ready');
  await joinAs(H, '房主甲', null);
  const code = H.window.__PLAT_NET.code;
  await joinAs(G, '來賓乙', code);
  await waitFor(() => H.window.__PLAT_NET.roster.length >= 2, 30000, 'roster2');
  clickEl(H, H.document.querySelector('#lob-step-room [data-rtab="tourn"]'));
  await waitFor(() => H.document.querySelector('#lob-tourn-setup'), 30000, 'tourn setup');
  const set = (id, v) => { const el = H.document.querySelector(id); if (el) { el.value = v; el.dispatchEvent(new H.window.Event('change', { bubbles: true })); } };
  set('#t-rounds', '3'); set('#t-order', 'alt-s'); set('#ts-size', '16'); set('#ts-diff', 'medium'); set('#ts-wtime', '0');
  click(H, '#t-start');
  await waitFor(() => (H.window.__PLAT_NET.tourn && H.window.__PLAT_NET.inMatch === 'sudoku') ? true : null, 90000, 'R1');
  for (const p of [H, G]) { const rb = await waitFor(() => [...p.document.querySelectorAll('#view-sudoku button')].find(x => (x.textContent || '').trim() === '✋ 準備好了') || null, 45000, p.label + ' ready'); clickEl(p, rb); await sleep(600); }
  const sb = await waitFor(() => { const b = [...H.document.querySelectorAll('#view-sudoku button')].find(x => (x.textContent || '').includes('開始本局')); return (b && !b.disabled) ? b : null; }, 45000, 'start enabled');
  console.log('pre-start: H saves:', saves(H), ' G saves:', saves(G));
  clickEl(H, sb);
  for (let i = 0; i < 10; i++) {
    await sleep(3000);
    const types = {}; (SHARED_REG.__msglog || []).forEach(m => { types[m.type] = (types[m.type] || 0) + 1; });
    console.log('t+' + (i + 1) * 3 + 's H:', saves(H), ' G:', saves(G), ' msgs:', JSON.stringify(types));
    const gw = [...G.document.querySelectorAll('#view-sudoku button')].filter(b => /準備|開始|等待|生成/.test(b.textContent || '')).map(b => (b.textContent || '').trim().slice(0, 20));
    console.log('   G buttons:', JSON.stringify(gw), ' G cells in DOM:', G.document.querySelectorAll('#view-sudoku g[id^="cell-"]').length, ' H cells:', H.document.querySelectorAll('#view-sudoku g[id^="cell-"]').length);
  }
  // 互動驗證：來賓點一格空格 + 填入正確數字，看 SYNC 是否流動、房主畫面文字
  const full = SHARED_REG.__fullog || [];
  let sol = null;
  for (let i = full.length - 1; i >= 0; i--) { const d = full[i]; if (d && d.data && d.data.solutionGrid) { sol = d.data.solutionGrid; break; } if (d && d.data && d.data.levelData && d.data.levelData.solutionGrid) { sol = d.data.levelData.solutionGrid; break; } }
  console.log('solution found:', !!sol);
  const htxt = (H.document.querySelector('#view-sudoku').textContent || '').replace(/\s+/g, ' ').slice(0, 300);
  console.log('H view text:', htxt);
  const before = (SHARED_REG.__msglog || []).length;
  if (sol) {
    // 找來賓盤面第一個空格（DOM cell 的 title/資料難判，直接用解答+givens 推：讀 G 存檔不行，改點 DOM 中無文字的 cell）
    const cells = [...G.document.querySelectorAll('#view-sudoku g[id^="cell-"]')];
    console.log('G cell count:', cells.length);
    const empty = cells.find(g => !(g.textContent || '').trim());
    console.log('empty cell found:', !!empty, empty && empty.getAttribute('id'));
    if (empty) {
      const id = empty.getAttribute('id').replace('cell-', '');
      const [cx, cy] = id.split('-').map(Number);
      const want = String(sol[cy][cx]);
      const pad = [...G.document.querySelectorAll('#view-sudoku button')].find(b => (b.textContent || '').trim() === want);
      console.log('pad for', want, ':', !!pad);
      clickEl(G, pad); await sleep(150);
      clickEl(G, empty); await sleep(800);
      const after = (SHARED_REG.__msglog || []).slice(before);
      console.log('msgs after fill:', JSON.stringify(after.map(m => m.type)));
      console.log('cell text now:', JSON.stringify((empty.textContent || '').trim()));
    }
  }
  console.log('H errors:', H.errors.slice(0, 3), 'G errors:', G.errors.slice(0, 3));
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
