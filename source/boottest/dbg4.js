const { loadPage, sleep, waitFor, click, findBtn } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/tmp/plat-diag.html');
  await waitFor(() => typeof w.PLAT_show === 'function' && !!w.PlatBar, 600000, 'shell');
  w.PLAT_show('sudoku');
  await waitFor(() => findBtn(D, '每日一題', '#view-sudoku'), 240000, 'sudoku home');
  click(w, findBtn(D, '每日一題', '#view-sudoku'));
  await waitFor(() => D.querySelector('#view-sudoku [data-pb="mode-press"]'), 120000, 'sudoku bar');
  console.log('sudoku in game, attached=', w.PlatBar.isAttached());
  w.PLAT_show('hashi');
  const hb = await waitFor(() => findBtn(D, '每日一題', '#view-hashi'), 240000, 'hashi home');
  click(w, hb);
  await sleep(20000);
  console.log('attached=', w.PlatBar.isAttached());
  console.log('mount candidates=', [...D.querySelectorAll('#view-hashi div')].filter(d => (d.className || '').includes('z-30')).length);
  console.log('pb in hashi=', D.querySelectorAll('#view-hashi [data-pb]').length, 'pb in sudoku=', D.querySelectorAll('#view-sudoku [data-pb]').length);
  // 手動 update 探針
  w.PlatBar.update({ mode: 0, modes: [{ icon: '🖋️', label: '畫筆' }, { icon: '✏️', label: '草稿' }], modeTitle: 'x', zoomLabel: '🔍', zoomGlyph: '1x', showInput: false, inputMode: 'num', showDraw: false, drawTool: 'pen', showHostClear: false });
  await sleep(300);
  console.log('after manual update: pb in hashi=', D.querySelectorAll('#view-hashi [data-pb]').length, 'pb in sudoku=', D.querySelectorAll('#view-sudoku [data-pb]').length);
  w.close();
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
