const { loadPage, sleep, waitFor, click, findBtn } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/tmp/plat-diag.html');
  await waitFor(() => typeof w.PLAT_show === 'function' && !!w.PlatBar, 600000, 'shell');
  w.PLAT_show('sudoku');
  await waitFor(() => findBtn(D, '每日一題', '#view-sudoku'), 240000, 'sudoku home');
  click(w, findBtn(D, '每日一題', '#view-sudoku'));
  await waitFor(() => D.querySelector('#view-sudoku [data-pb="mode-press"]'), 120000, 'sudoku bar');
  console.log('sudoku in game');
  w.PLAT_show('hashi');
  const hb = await waitFor(() => findBtn(D, '每日一題', '#view-hashi'), 240000, 'hashi home');
  console.log('hashi home btn:', !!hb, 'btnText=', hb ? (hb.textContent || '').slice(0, 20) : '');
  click(w, hb);
  for (let i = 0; i < 10; i++) {
    await sleep(8000);
    const hv = D.querySelector('#view-hashi');
    const st = w.__PLAT_HOOKS_hashi && w.__PLAT_HOOKS_hashi.getState ? w.__PLAT_HOOKS_hashi.getState() : {};
    console.log(`t=${(i + 1) * 8}s pb=${D.querySelectorAll('#view-hashi [data-pb]').length} hookScreen=${st.screen} viewText=${(hv.textContent || '').slice(0, 60).replace(/\s+/g, ' ')} err=${errors.length}`);
    if (D.querySelector('#view-hashi [data-pb="mode-press"]')) { console.log('HASHI BAR OK'); break; }
  }
  w.close();
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
