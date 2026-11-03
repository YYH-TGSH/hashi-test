// 除錯：兩頁進房流程 + 每 5 秒狀態傾印（找 join 卡點）
const { loadPage, waitFor, sleep } = require('./harness');
const BUILD = '/home/hatch/workspace/platform/platform-v1-test.html';
(async () => {
  const host = loadPage(BUILD), guest = loadPage(BUILD);
  const H = host.w, G = guest.w;
  const el = (w, id) => w.document.getElementById(id);
  const dump = (tag) => {
    const hn = H.__PLAT_NET, gn = G.__PLAT_NET;
    console.log(tag,
      'H:', hn ? `active=${hn.active} host=${hn.isHost} roster=${hn.roster.length} conns=${Object.keys(hn.conns).length}` : 'noNet',
      '| G:', gn ? `active=${gn.active} host=${gn.isHost} roster=${gn.roster.length} conns=${Object.keys(gn.conns).length} hostPid=${gn.hostPid}` : 'noNet',
      '| Gerr:', guest.errors.slice(0, 2).join(';'), '| Herr:', host.errors.slice(0, 2).join(';'));
  };
  await waitFor(() => typeof H.PLAT_show === 'function' && H.PlatDock, 90000, 'host shell');
  await waitFor(() => typeof G.PLAT_show === 'function' && G.PlatDock, 90000, 'guest shell');
  dump('shells ready');
  el(H, 'lob-go-create').click();
  await waitFor(() => el(H, 'lob-step-nick').style.display !== 'none', 20000, 'host nick');
  el(H, 'lob-name').value = '房主甲'; el(H, 'lob-confirm').click();
  await waitFor(() => H.__PLAT_NET.active && H.__PLAT_NET.isHost, 30000, 'host room');
  dump('host room up, code ' + H.__PLAT_NET.code);
  el(G, 'lob-go-join').click();
  await waitFor(() => el(G, 'lob-step-nick').style.display !== 'none', 20000, 'guest nick');
  el(G, 'lob-name').value = '來賓乙'; el(G, 'lob-code').value = H.__PLAT_NET.code; el(G, 'lob-confirm').click();
  for (let i = 0; i < 8; i++) { await sleep(5000); dump('t+' + (i + 1) * 5 + 's'); if (H.__PLAT_NET.roster.length === 2) { console.log('JOIN OK'); break; } }
  process.exit(0);
})().catch(e => { console.log('FATAL', e && e.message); process.exit(1); });
