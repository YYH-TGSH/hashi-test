const { loadPage, sleep, waitFor, click, findBtn } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/tmp/plat-diag.html');
  await waitFor(() => typeof w.PLAT_show === 'function' && !!w.PlatBar, 600000, 'shell');
  w.PLAT_show('hashi');
  const b = await waitFor(() => findBtn(D, '每日一題', '#view-hashi'), 240000, 'hashi home');
  console.log('home btn found:', !!b);
  click(w, b);
  for (let i = 0; i < 12; i++) {
    await sleep(10000);
    const st = w.__PLAT_HOOKS_hashi && w.__PLAT_HOOKS_hashi.getState ? w.__PLAT_HOOKS_hashi.getState() : {};
    console.log(`t=${(i + 1) * 10}s screen=${st.screen} mount=${!!D.querySelector('#view-hashi [data-pb]')} pbCount=${D.querySelectorAll('#view-hashi [data-pb]').length} errors=${errors.length} ${errors[0] || ''}`);
    if (D.querySelector('#view-hashi [data-pb="mode-press"]')) break;
  }
  w.close();
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
