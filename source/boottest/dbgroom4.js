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
  await sleep(12000);
  const v = D.querySelector('#view-sudoku');
  const ov = [...v.querySelectorAll('div')].find(d => (d.className || '').includes('bg-slate-900/80'));
  console.log('overlay html head:', ov ? ov.innerHTML.slice(0, 300) : 'NONE');
  const cand = ov ? ov.querySelector('.max-w-xl') : null;
  console.log('wrapper found:', !!cand, 'wrapper html:', cand ? cand.innerHTML.slice(0, 200) : '');
  const mount = cand ? cand.querySelector('div') : null;
  console.log('mount:', !!mount, 'isAttached:', w.PlatRoom.isAttached());
  if (mount) {
    try {
      w.PlatRoom.attach(mount, { accent: '#ffcc00', onAction: () => {} });
      w.PlatRoom.update({ title: '🎮 遊戲大廳', code: '1234', players: [{ key: '1', name: '測試', color: '#f00', isMe: true, isHost: true }], myReady: false });
      console.log('manual attach OK, regions now:', D.querySelectorAll('[data-pr-region]').length);
    } catch (e) { console.log('manual attach THREW:', e.message, (e.stack || '').slice(0, 200)); }
  }
  console.log('errors:', errors.slice(0, 3));
  w.close();
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
