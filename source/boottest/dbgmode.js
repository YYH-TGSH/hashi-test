const { loadPage, sleep, waitFor, click, findBtn } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/home/hatch/workspace/platform/platform-v1-test.html');
  await waitFor(() => typeof w.PLAT_show === 'function', 600000, 'shell');
  w.PLAT_show('sudoku');
  await waitFor(() => findBtn(D, '每日一題', '#view-sudoku'), 240000, 'sudoku home');
  click(w, findBtn(D, '每日一題', '#view-sudoku'));
  await waitFor(() => D.querySelector('#view-sudoku svg g[id^="cell-"]'), 120000, 'board');
  await sleep(2000);
  const modeBtn = () => D.querySelector('#view-sudoku [data-pb="mode"]');
  const state = (tag) => {
    const b = modeBtn();
    const pop = D.querySelector('#view-sudoku [data-pb-pop]');
    console.log(tag, '| modeBtn:', b ? b.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) : 'NONE', '| pop:', pop ? pop.getAttribute('data-pb-pop') : 'none');
  };
  state('start');
  for (let i = 1; i <= 5; i++) { click(w, modeBtn()); await sleep(700); state('press' + i); }
  console.log('errors:', errors.filter(e => !/scrollTo/.test(e)).slice(0, 2));
  w.close();
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
