const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
let html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
let mock = require('./mockpeer.js');
mock = mock.replace("R.__msglog = R.__msglog || [];", "R.__msglog = R.__msglog || []; R.__fullog = R.__fullog || [];")
           .replace("if (pl && pl.type) R.__msglog.push({", "if (pl && pl.type) { try { R.__fullog.push(pl); } catch (e) {} R.__msglog.push({")
           .replace(": undefined }); } } catch (e) {}", ": undefined }); } } } catch (e) {}");
html = html.replace('<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>', () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(300); } console.log('  (timeout: ' + label + ')'); return null; }
const SHARED_REG = {};
function loadPage(label) {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errs.push(m); });
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.__SHARED_REG__ = SHARED_REG; w.scrollTo = () => {}; w.localStorage.setItem('sudoku_input_mode', 'number'); } });
  return { window: dom.window, document: dom.window.document, errors: errs, label };
}
const clickEl = (p, el) => { if (el) el.dispatchEvent(new p.window.MouseEvent('click', { bubbles: true })); return !!el; };
const hubRoom = (p) => { const rm = p.document.querySelector('#lob-step-room'); return rm && rm.style.display === 'block' ? rm : null; };
function sudokuSave(p) { const ls = p.window.localStorage; for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k && k.indexOf('sudoku_prog_') === 0) { try { const v = JSON.parse(ls.getItem(k)); if (v && Array.isArray(v.d) && v.d.length) return v; } catch (e) {} } } return null; }
function getSolution() { const log = SHARED_REG.__fullog || []; for (let i = log.length - 1; i >= 0; i--) { const d = log[i]; if (d && d.data) { if (d.data.solutionGrid) return d.data.solutionGrid; if (d.data.levelData && d.data.levelData.solutionGrid) return d.data.levelData.solutionGrid; } } return null; }
async function fillCells(p, tag) {
  const save = sudokuSave(p); const sol = getSolution();
  const blanks = save.d.filter(c => !c.isGiven);
  let done = 0;
  for (const c of blanks) {
    const ans = sol[c.y][c.x];
    const view = p.document.querySelector('#view-sudoku');
    const pad = [...view.querySelectorAll('button')].find(b => (b.textContent || '').trim() === String(ans));
    clickEl(p, pad);
    clickEl(p, view.querySelector('g[id="cell-' + c.id + '"]'));
    done++;
    await sleep(25);
  }
  console.log(tag + ' filled', done);
}
async function main() {
  const H = loadPage('H'); const G = loadPage('G');
  for (const p of [H, G]) await waitFor(() => (typeof p.window.PLAT_show === 'function' && p.window.__PLAT_NET) ? true : null, 120000, p.label + ' ready');
  H.window.localStorage.setItem('plat_name', '房主甲');
  clickEl(H, H.document.querySelector('#lob-go-create'));
  await waitFor(() => H.document.querySelector('#lob-step-nick').style.display !== 'none', 30000, 'H nick');
  H.document.querySelector('#lob-name').value = '房主甲';
  clickEl(H, H.document.querySelector('#lob-confirm'));
  await waitFor(() => hubRoom(H), 60000, 'H room');
  const code = H.window.__PLAT_NET.code;
  G.window.localStorage.setItem('plat_name', '來賓乙');
  clickEl(G, G.document.querySelector('#lob-go-join'));
  await waitFor(() => G.document.querySelector('#lob-step-nick').style.display !== 'none', 30000, 'G nick');
  G.document.querySelector('#lob-name').value = '來賓乙';
  G.document.querySelector('#lob-code').value = code;
  clickEl(G, G.document.querySelector('#lob-confirm'));
  await waitFor(() => hubRoom(G), 60000, 'G room');
  await waitFor(() => H.window.__PLAT_NET.roster.length >= 2, 30000, 'roster2');
  clickEl(H, H.document.querySelector('#lob-step-room [data-rtab="tourn"]'));
  await waitFor(() => H.document.querySelector('#lob-tourn-setup'), 30000, 'tourn setup');
  const set = (id, v) => { const el = H.document.querySelector(id); if (el) { el.value = v; el.dispatchEvent(new H.window.Event('change', { bubbles: true })); } };
  set('#t-rounds', '3'); set('#t-order', 'alt-s'); set('#ts-size', '9'); set('#ts-diff', 'easy'); set('#ts-wtime', '0');
  clickEl(H, H.document.querySelector('#t-start'));
  await waitFor(() => (H.window.__PLAT_NET.tourn && H.window.__PLAT_NET.inMatch === 'sudoku') ? true : null, 90000, 'R1 in');
  for (const p of [H, G]) { const rb = await waitFor(() => [...p.document.querySelectorAll('#view-sudoku button')].find(x => (x.textContent || '').trim() === '✋ 準備好了') || null, 45000, p.label + ' ready btn'); clickEl(p, rb); await sleep(600); }
  const sb = await waitFor(() => { const b = [...H.document.querySelectorAll('#view-sudoku button')].find(x => (x.textContent || '').includes('開始本局')); return (b && !b.disabled) ? b : null; }, 45000, 'start enabled');
  clickEl(H, sb);
  await waitFor(() => { const b = [...H.document.querySelectorAll('#view-sudoku button')].find(x => (x.textContent || '').includes('準備好了')); return !b ? true : null; }, 45000, 'playing');
  await sleep(6500);
  await fillCells(G, 'G solve');
  await sleep(2000);
  await fillCells(H, 'H solve');
  await sleep(6000);
  for (const p of [H, G]) { const sv = sudokuSave(p); const sol = getSolution(); const left = sv.d.filter(c => !c.isGiven && (c.value === null || c.value === '' || c.value === undefined)); console.log(p.label + ' remaining blanks:', JSON.stringify(left.map(c => [c.id, c.x, c.y, sol && sol[c.y][c.x], JSON.stringify(c.value)]))); const wrong = sv.d.filter(c => !c.isGiven && c.value !== null && c.value !== '' && sol && String(c.value) !== String(sol[c.y][c.x])); console.log(p.label + ' wrong cells:', JSON.stringify(wrong.map(c => [c.id, c.value, sol[c.y][c.x]]))); }
  const t = H.window.__PLAT_NET.tourn;
  console.log('tourn phase:', t.phase, 'finishOrder:', JSON.stringify(t.finishOrder), 'progress:', JSON.stringify(t.progress), 'uidMap:', JSON.stringify(t.uidMap));
  const fl = SHARED_REG.__fullog || [];
  console.log('GHOST_I_WON count:', fl.filter(m => m.type === 'GHOST_I_WON').length, '| SYNC with brawlWinners:', fl.filter(m => m.type === 'SYNC' && m.data && m.data.brawlWinners).length, '| GHOST_SOLVED:', fl.filter(m => m.type === 'GHOST_SOLVED').length);
  const bwSync = fl.filter(m => m.type === 'SYNC' && m.data && m.data.brawlWinners).pop();
  console.log('last brawlWinners SYNC:', bwSync ? JSON.stringify(bwSync.data.brawlWinners).slice(0, 200) : 'none');
  for (const p of [H, G]) { const pr = p.document.querySelector('#plat-results'); console.log(p.label + ' #plat-results display:', pr && pr.style.display, '| text:', pr ? pr.textContent.replace(/\s+/g, ' ').slice(0, 90) : ''); }
  console.log('H errors:', H.errors.slice(0, 3)); console.log('G errors:', G.errors.slice(0, 3));
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
