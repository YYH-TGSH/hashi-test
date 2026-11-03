const { loadPage, sleep, waitFor, click, findBtn } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/tmp/plat-diag.html');
  await waitFor(() => typeof w.PLAT_show === 'function' && !!w.PlatBar, 600000, 'shell');
  w.PLAT_show('sudoku');
  await waitFor(() => findBtn(D, '每日一題', '#view-sudoku'), 240000, 'sudoku home');
  click(w, findBtn(D, '每日一題', '#view-sudoku'));
  await waitFor(() => D.querySelector('#view-sudoku [data-pb="mode-press"]'), 120000, 'sudoku bar');
  console.log('sudoku ok, debug=', JSON.stringify(w.PlatBar._debug()));
  w.PLAT_show('hashi');
  const hb = await waitFor(() => findBtn(D, '每日一題', '#view-hashi'), 240000, 'hashi home');
  click(w, hb);
  for (let i = 0; i < 8; i++) {
    await sleep(6000);
    const mounts = [...D.querySelectorAll('#view-hashi div')].filter(d => (d.className || '').includes('z-30'));
    console.log(`t=${(i + 1) * 6}s debug=${JSON.stringify(w.PlatBar._debug())} liveMountHtml=${mounts.length ? mounts[0].innerHTML.length : 'NO MOUNT'} pb=${D.querySelectorAll('#view-hashi [data-pb]').length}`);
    if (D.querySelector('#view-hashi [data-pb="mode-press"]')) { console.log('HASHI BAR OK'); break; }
  }
  w.close();
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
