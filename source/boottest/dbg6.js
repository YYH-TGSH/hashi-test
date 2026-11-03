const { loadPage, sleep, waitFor, click, findBtn } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/tmp/plat-diag.html');
  await waitFor(() => typeof w.PLAT_show === 'function' && !!w.PlatBar, 600000, 'shell');
  w.PLAT_show('sudoku');
  await waitFor(() => findBtn(D, '每日一題', '#view-sudoku'), 240000, 'sudoku home');
  click(w, findBtn(D, '每日一題', '#view-sudoku'));
  await waitFor(() => D.querySelector('#view-sudoku [data-pb="mode-press"]'), 120000, 'sudoku bar');
  console.log('sudoku ok', JSON.stringify(w.PlatBar._debug()));
  w.PLAT_show('hashi');
  const hb = await waitFor(() => findBtn(D, '每日一題', '#view-hashi'), 240000, 'hashi home');
  console.log('at hashi MENU', JSON.stringify(w.PlatBar._debug()));
  click(w, hb);
  for (let i = 0; i < 24; i++) {
    await sleep(500);
    const d = w.PlatBar._debug();
    console.log(`t=${(i + 1) * 0.5}s att=${d.attached} state=${d.hasState} html=${d.htmlLen} A=${w.__PB_ATTACH_RUNS || 0}/${w.__PB_ATTACH_EL} D=${w.__PB_DETACH_RUNS || 0} U=${w.__PB_UPDATE_RUNS || 0} GF=${w.__PB_UPDATE_GUARD_FAIL || 0} UC=${w.__PB_UPDATE_CALLS || 0}`);
    if (D.querySelector('#view-hashi [data-pb="mode-press"]')) { console.log('HASHI BAR OK'); break; }
  }
  w.close();
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
