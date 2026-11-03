const { loadPage, sleep, waitFor, click, findBtn } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/home/hatch/workspace/platform/platform-v1-test.html');
  await waitFor(() => typeof w.PLAT_show === 'function', 600000, 'shell');
  w.PLAT_show('sudoku');
  await waitFor(() => findBtn(D, '每日一題', '#view-sudoku'), 240000, 'sudoku home');
  click(w, findBtn(D, '每日一題', '#view-sudoku'));
  await waitFor(() => D.querySelector('#view-sudoku svg'), 120000, 'board');
  await sleep(2500);
  // 找一個盤面已有的數字
  const cellTexts = [...D.querySelectorAll('#view-sudoku svg g[id^="cell-"] text')].map(t => t.textContent.trim()).filter(Boolean);
  const digit = cellTexts[0];
  console.log('board digits sample:', cellTexts.slice(0, 8).join(','), '-> select', digit);
  // 點數字鍵盤（上方數字列的按鈕）
  const keyBtn = [...D.querySelectorAll('#view-sudoku button')].find(b => b.textContent.trim() === digit);
  console.log('keyBtn found:', !!keyBtn);
  click(w, keyBtn); await sleep(800);
  const fills = {};
  D.querySelectorAll('#view-sudoku svg rect').forEach(r => { const f = r.getAttribute('fill'); if (f && f !== 'transparent' && f !== 'none') fills[f] = (fills[f] || 0) + 1; });
  console.log('rect fills after select:', JSON.stringify(fills));
  console.log('errors:', errors.slice(0, 2));
  w.close();
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
