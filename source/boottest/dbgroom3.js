const { loadPage, sleep, waitFor, click } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/home/hatch/workspace/platform/platform-v1-test.html');
  await waitFor(() => typeof w.PLAT_show === 'function' && !!w.PlatRoom, 600000, 'shell');
  D.querySelector('#lob-name').value = '房主甲';
  D.querySelector('#lob-name').dispatchEvent(new w.Event('input', { bubbles: true }));
  click(w, D.querySelector('#lob-go-create')); await sleep(400);
  click(w, D.querySelector('#lob-confirm'));
  await waitFor(() => D.querySelectorAll('#lob-roster li').length >= 1, 60000, 'room');
  click(w, D.querySelector('[data-launch="sudoku-brawl"]'));
  await sleep(15000);
  const v = D.querySelector('#view-sudoku');
  console.log('htmlLen:', v.innerHTML.length);
  console.log('TEXT:', (v.textContent || '').slice(0, 400).replace(/\s+/g, ' '));
  const overlays = [...v.querySelectorAll('div')].filter(d => (d.className || '').includes('bg-slate-900/80'));
  console.log('overlay divs:', overlays.length);
  console.log('root children:', D.querySelector('#sudoku-root').childElementCount);
  w.close();
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
