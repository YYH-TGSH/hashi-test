// 複現：錦標賽結束回房間後，切到數橋分頁 → 合作設定是否出現
const { loadPage, sleep, waitFor, click } = require('./harness.js');
const BUNDLE = '/home/hatch/workspace/platform/platform-v1-test.html';
async function main() {
  const H = loadPage(BUNDLE);
  const D = H.D, w = H.w;
  await waitFor(() => w.PLAT_show && D.querySelector('#lob-go-create'), 90000, 'shell ready');
  w.localStorage.setItem('plat_name', '房主甲');
  click(w, D.querySelector('#lob-go-create'));
  await waitFor(() => D.querySelector('#lob-step-nick').style.display !== 'none', 30000, 'nick');
  D.querySelector('#lob-name').value = '房主甲';
  click(w, D.querySelector('#lob-confirm'));
  await waitFor(() => { const r = D.querySelector('#lob-step-room'); return (r && r.style.display !== 'none') ? r : null; }, 60000, 'room page');
  await sleep(1200);
  const slot = () => D.querySelector('[data-pr-slot="settings"]');
  console.log('fresh room slot len:', slot() ? slot().innerHTML.length : -1, 'display:', slot() ? slot().style.display : '?');
  // 模擬錦標賽結束後的殼狀態：tourn ended、停在錦標賽分頁
  const N = w.__PLAT_NET;
  const me = N.roster[0];
  N.tourn = { phase: 'ended', round: 3, totalRounds: 3, order: 'alt-s', rounds: ['sudoku', 'hashi', 'hashi'],
    sudoku: { sizeId: 9, diffId: 'medium' }, hashi: { sizeId: 2 }, roundSecs: 300,
    entrants: [{ pid: me.pid, uid: me.uid, name: me.name, color: me.color }],
    totals: {}, wins: {}, history: [], curGame: 'hashi', settled: true, startedAt: 0, endsAt: 0,
    progress: {}, finishOrder: [], uidMap: {}, cellTrack: {}, totalBlanks: 0, disc: {}, acks: {}, timer: null, armTimer: null, tiedPids: null, champion: { uid: me.uid, name: me.name }, endNote: '' };
  N.tourn.totals[me.uid] = 10; N.tourn.wins[me.uid] = 1;
  N.roomTab = 'tourn';
  w.PLAT_show('lobby');
  await sleep(1200);
  console.log('tourn tab slot display:', slot() ? slot().style.display : '?', 'len:', slot() ? slot().innerHTML.length : -1);
  // 使用者：切回數橋分頁
  click(w, D.querySelector('[data-rtab="hashi"]'));
  await sleep(1500);
  console.log('after hashi tab: roomTab=', N.roomTab, 'armed=', JSON.stringify(N.armed));
  console.log('slot display:', slot() ? slot().style.display : '?', 'len:', slot() ? slot().innerHTML.length : -1);
  console.log('slot text head:', slot() ? slot().textContent.slice(0, 80) : '');
  console.log('errors:', H.errors.length, H.errors.slice(0, 4));
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
