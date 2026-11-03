// 高亮語意驗證：同數字格永遠亮（強黃）、底塊提示預設關（無淡黃區域）
const { loadPage, sleep, waitFor, click, findBtn, check, report } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/home/hatch/workspace/platform/platform-v1-test.html');
  await waitFor(() => typeof w.PLAT_show === 'function', 600000, 'shell');
  w.PLAT_show('sudoku');
  await waitFor(() => findBtn(D, '每日一題', '#view-sudoku'), 240000, 'sudoku home');
  click(w, findBtn(D, '每日一題', '#view-sudoku'));
  await waitFor(() => D.querySelector('#view-sudoku svg g[id^="cell-"]'), 120000, 'board');
  await sleep(2000);
  const cellG = (id) => D.querySelector('#view-sudoku svg g#cell-' + id);
  const bigVal = (id) => { const g = cellG(id); if (!g) return null; const t = [...g.querySelectorAll('text')].find(x => parseFloat(x.getAttribute('font-size') || 0) >= 20); return t ? t.textContent.trim() : null; };
  const ids = [...D.querySelectorAll('#view-sudoku svg g[id^="cell-"]')].map(g => g.id.slice(5));
  const counts = {};
  ids.forEach(id => { const v = bigVal(id); if (v) counts[v] = (counts[v] || 0) + 1; });
  const digit = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  const fills = () => { const f = {}; D.querySelectorAll('#view-sudoku svg rect').forEach(r => { const x = r.getAttribute('fill'); if (x && x !== 'transparent' && x !== 'none') f[x] = (f[x] || 0) + 1; }); return f; };
  const keyBtn = [...D.querySelectorAll('#view-sudoku button')].find(b => b.textContent.trim() === digit);
  click(w, keyBtn); await sleep(900);
  let f = fills();
  check('選 ' + digit + '（題目格）→ 強黃格數 = 該數字格數 ' + counts[digit], (f['#fde047'] || 0) === counts[digit]);
  check('底塊提示預設關 → 無淡黃區域 #fef8cb', (f['#fef8cb'] || 0) === 0);
  // 自己填一格同數字 → 也要亮（先解出今日題目，填「正確」的格，避免被錯誤答案擋下）
  const grid = ids.map(id => { const v = bigVal(id); return v ? parseInt(v, 10) : 0; });
  const ok = (g, i, d) => { const x = i % 9, y = (i / 9) | 0; for (let k = 0; k < 9; k++) { if (g[y * 9 + k] === d || g[k * 9 + x] === d) return false; } const bx = (x / 3 | 0) * 3, by = (y / 3 | 0) * 3; for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) if (g[(by + dy) * 9 + bx + dx] === d) return false; return true; };
  const solve = (g) => { const i = g.indexOf(0); if (i === -1) return g; for (let d = 1; d <= 9; d++) if (ok(g, i, d)) { g[i] = d; if (solve(g)) return g; g[i] = 0; } return null; };
  const sol = solve([...grid]);
  const ei = sol ? sol.findIndex((v, i) => grid[i] === 0 && v === parseInt(digit, 10)) : -1;
  const empty = ei >= 0 ? ids[ei] : ids.find(id => !bigVal(id));
  console.log('solver placed digit', digit, 'into cell', empty);
  click(w, cellG(empty)); await sleep(900);
  f = fills();
  check('自己填入 ' + digit + ' 後 → 強黃格數 = ' + (counts[digit] + 1) + '（含自己那格）', (f['#fde047'] || 0) === counts[digit] + 1);
  check('填入後仍無淡黃區域', (f['#fef8cb'] || 0) === 0);
  check('頁面錯誤為零', errors.filter(e => !/scrollTo/.test(e)).length === 0);
  report(errors); w.close();
})().catch((e) => { console.error('FATAL', e); report([]); process.exitCode = 1; });
