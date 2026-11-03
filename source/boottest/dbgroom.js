const { loadPage, sleep, waitFor, click, findBtn } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/home/hatch/workspace/platform/platform-v1-test.html');
  await waitFor(() => typeof w.PLAT_show === 'function' && !!w.PlatRoom, 600000, 'shell');
  D.querySelector('#lob-name').value = '房主甲';
  D.querySelector('#lob-name').dispatchEvent(new w.Event('input', { bubbles: true }));
  click(w, D.querySelector('#lob-go-create')); await sleep(400);
  click(w, D.querySelector('#lob-confirm'));
  await waitFor(() => D.querySelectorAll('#lob-roster li').length >= 1, 60000, 'room');
  console.log('room ok');
  click(w, D.querySelector('[data-launch="sudoku-brawl"]'));
  for (let i = 0; i < 10; i++) {
    await sleep(6000);
    const hk = w.__PLAT_HOOKS_sudoku;
    const st = hk && hk.getState ? hk.getState() : null;
    console.log(`t=${(i+1)*6}s prAttached=${w.PlatRoom.isAttached()} prRegions=${D.querySelectorAll('#view-sudoku [data-pr-region]').length} hookState=${JSON.stringify(st)} sudokuText=${(D.querySelector('#view-sudoku').textContent||'').slice(0,80).replace(/\s+/g,' ')}`);
    if (D.querySelector('#view-sudoku [data-pr-region="roster"]')) break;
  }
  const status = D.querySelector('#plat-status-body');
  console.log('STATUS:', status ? (status.textContent || '').slice(-600) : 'none');
  console.log('errors:', errors.slice(0, 3));
  w.close();
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
