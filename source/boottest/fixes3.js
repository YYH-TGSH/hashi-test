// 三修驗證：數獨黃底 / 草稿自動清 / 數橋格線範圍
const { loadPage, sleep, waitFor, click, findBtn, check, report } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/home/hatch/workspace/platform/platform-v1-test.html');
  const realErr = () => errors.filter((e) => !/scrollTo/.test(e));
  await waitFor(() => typeof w.PLAT_show === 'function', 600000, 'shell');
  // ===== 數獨 =====
  w.PLAT_show('sudoku');
  await waitFor(() => findBtn(D, '每日一題', '#view-sudoku'), 240000, 'sudoku home');
  click(w, findBtn(D, '每日一題', '#view-sudoku'));
  await waitFor(() => D.querySelector('#view-sudoku svg g[id^="cell-"]'), 120000, 'board');
  await sleep(2000);
  const cellG = (id) => D.querySelector('#view-sudoku svg g#cell-' + id);
  const cellVal = (id) => { const g = cellG(id); if (!g) return null; const t = [...g.querySelectorAll('text')].map(x => x.textContent.trim()).filter(x => x.length === 1); return t[0] || null; };
  // 盤面既有數字 → 選它 → 檢查黃底
  const ids = [...D.querySelectorAll('#view-sudoku svg g[id^="cell-"]')].map(g => g.id.slice(5));
  const digitCount = {};
  ids.forEach(id => { const v = cellVal(id); if (v) digitCount[v] = (digitCount[v] || 0) + 1; });
  const digit = Object.keys(digitCount).sort((a, b) => digitCount[b] - digitCount[a])[0];
  const keyBtn = [...D.querySelectorAll('#view-sudoku button')].find(b => b.textContent.trim() === digit);
  click(w, keyBtn); await sleep(900);
  const fills = {};
  D.querySelectorAll('#view-sudoku svg rect').forEach(r => { const f = r.getAttribute('fill'); if (f && f !== 'transparent' && f !== 'none') fills[f] = (fills[f] || 0) + 1; });
  check('選 ' + digit + ' → 同數字格強黃底 #fde047（' + digitCount[digit] + ' 格）', (fills['#fde047'] || 0) === digitCount[digit]);
  check('選 ' + digit + ' → 同列/行/宮淡黃 #fef8cb', (fills['#fef8cb'] || 0) > 0);
  // 草稿：找一列裡兩個空格，A 寫草稿 digit2、B 填入 digit2 → A 草稿應消失
  const rows = {};
  ids.forEach(id => { const [x, y] = id.split('-').map(Number); (rows[y] = rows[y] || []).push({ id, x, y }); });
  let pair = null, d2 = null;
  for (const y of Object.keys(rows)) {
    const empties = rows[y].filter(c => !cellVal(c.id));
    if (empties.length >= 2) {
      for (const cand of ['1','2','3','4','5','6','7','8','9']) {
        if (cand !== digit && !rows[y].some(c => cellVal(c.id) === cand)) { pair = [empties[0], empties[1]]; d2 = cand; break; }
      }
      if (pair) break;
    }
  }
  check('找到同列空格對＋可用數字', !!pair);
  if (pair) {
    const [A, B] = pair;
    const pressMode = async (label) => { const b = D.querySelector('#view-sudoku [data-pb="mode-press"]'); click(w, b); await sleep(600); };
    // 切到草稿模式（按一次模式鈕）
    await pressMode();
    const key2 = [...D.querySelectorAll('#view-sudoku button')].find(b => b.textContent.trim() === d2);
    click(w, key2); await sleep(300);
    click(w, cellG(A.id)); await sleep(700);
    const draftHas = () => [...cellG(A.id).querySelectorAll('text')].some(x => x.textContent.trim() === d2 && parseFloat(x.getAttribute('font-size') || x.getAttribute('fontSize') || 99) < 20);
    const filledVal = (id) => { const t = [...cellG(id).querySelectorAll('text')].find(x => parseFloat(x.getAttribute('font-size') || x.getAttribute('fontSize') || 0) >= 20); return t ? t.textContent.trim() : null; };
    check('草稿模式在 A 格寫入 ' + d2 + '（小字草稿）', draftHas());
    // 回填答模式：在 B 格填入 d2（自適應：按到模式鈕顯示「填答」為止）
    for (let i = 0; i < 5; i++) {
      const mb = D.querySelector('#view-sudoku [data-pb="mode-press"]');
      if (mb && (mb.textContent || '').includes('填答')) break;
      await pressMode();
    }
    console.log('mode after cycle:', (D.querySelector('#view-sudoku [data-pb="mode-press"]').textContent || '').replace(/\s+/g, ' ').trim());
    click(w, cellG(B.id)); await sleep(800);
    check('B 格填入 ' + d2 + '（大字填答）', filledVal(B.id) === d2);
    check('A 格草稿 ' + d2 + ' 已自動清除', !draftHas());
  }
  // ===== 數橋格線 =====
  w.__PLAT_NOTIFY('game-exit'); await sleep(800);
  w.PLAT_show('hashi');
  const hHome = await waitFor(() => D.querySelector('#view-hashi #svg-bg') || [...D.querySelectorAll('#view-hashi button')].some(b => (b.textContent || '').includes('新遊戲')), 240000, 'hashi home');
  if (!D.querySelector('#view-hashi #svg-bg')) {
    const skip = [...D.querySelectorAll('#view-hashi button')].find(b => (b.textContent || '').trim() === '跳過');
    if (skip) { click(w, skip); await sleep(600); }
    const solo = [...D.querySelectorAll('#view-hashi button')].find(b => (b.textContent || '').includes('單機挑戰'));
    if (solo) { click(w, solo); await sleep(3000); }
  }
  console.log('hashi home reached:', !!hHome, 'svg-bg:', !!D.querySelector('#view-hashi #svg-bg'));
  if (!D.querySelector('#view-hashi #svg-bg')) console.log('hashi view text head:', (D.querySelector('#view-hashi').textContent || '').replace(/\s+/g, ' ').slice(0, 200));
  const bg = D.querySelector('#view-hashi #svg-bg');
  check('數橋格線 rect 寬 = 10×65=650（不再 100%）', !!bg && bg.getAttribute('width') === '650');
  check('數橋格線 rect 高 = 650', !!bg && bg.getAttribute('height') === '650');
  check('頁面錯誤為零', realErr().length === 0);
  report(errors); w.close();
})().catch((e) => { console.error('FATAL', e); report([]); process.exitCode = 1; });
