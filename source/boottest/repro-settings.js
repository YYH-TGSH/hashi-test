// 複現：房間頁合作模式設定沒出現？四種 tab/mode 組合都 dump 設定槽內容
const { loadPage, sleep, waitFor, click, check, report } = require('./harness.js');
const BUNDLE = '/home/hatch/workspace/platform/platform-v1-test.html';
const REG = {};
async function bootPage(name) {
  const p = loadPage(BUNDLE);
  p.w.__SHARED_REG__ = REG;
  p.w.addEventListener('error', () => {});
  return p;
}
function slotHtml(H) {
  const slot = H.D.querySelector('[data-pr-slot="settings"]');
  return slot ? slot.innerHTML : '(no slot)';
}
async function main() {
  Object.assign(global, {});
  const H = await bootPage('H');
  // 等殼就緒
  await waitFor(() => H.w.PLAT_show && H.D.querySelector('#lob-go-create'), 90000, 'shell ready');
  H.w.localStorage.setItem('plat_name', '房主甲');
  click(H.w, H.D.querySelector('#lob-go-create'));
  await waitFor(() => H.D.querySelector('#lob-step-nick').style.display !== 'none', 30000, 'nick step');
  H.D.querySelector('#lob-name').value = '房主甲';
  click(H.w, H.D.querySelector('#lob-confirm'));
  const room = await waitFor(() => H.D.querySelector('#lob-step-room') && H.D.querySelector('#lob-step-room').style.display !== 'none' ? H.D.querySelector('#hub-room') : null, 60000, 'room page');
  console.log('in room:', !!room, 'errors so far:', H.errors.length, H.errors.slice(0, 3));
  await sleep(1500);
  const combos = [];
  function dump(label) {
    const h = slotHtml(H);
    console.log('--- ' + label + ' slot len=' + h.length + ' ---');
    console.log(h.replace(/</g, '\n<').split('\n').filter(s => /模式|題目|關卡|結束|select|checkbox|對局設定/.test(s)).slice(0, 14).join('\n'));
    combos.push([label, h.length]);
  }
  dump('sudoku/coop (default)');
  // 切到數橋分頁
  click(H.w, H.D.querySelector('[data-rtab="hashi"]'));
  await sleep(1200);
  dump('hashi/coop');
  // 數橋切競速
  const raceBtn = [...H.D.querySelectorAll('[data-hub-mode]')].find(b => (b.getAttribute('data-hub-mode') || '') === 'race');
  console.log('race mode btn found:', !!raceBtn);
  if (raceBtn) { click(H.w, raceBtn); await sleep(1200); dump('hashi/race'); }
  // 切回合作
  const coopBtn = [...H.D.querySelectorAll('[data-hub-mode]')].find(b => (b.getAttribute('data-hub-mode') || '') === 'coop');
  if (coopBtn) { click(H.w, coopBtn); await sleep(1200); dump('hashi/coop again'); }
  // 回數獨分頁 + 大亂鬥
  click(H.w, H.D.querySelector('[data-rtab="sudoku"]'));
  await sleep(1200);
  const brawlBtn = [...H.D.querySelectorAll('[data-hub-mode]')].find(b => (b.getAttribute('data-hub-mode') || '') === 'brawl');
  if (brawlBtn) { click(H.w, brawlBtn); await sleep(1200); dump('sudoku/brawl'); }
  console.log('errors total:', H.errors.length, H.errors.slice(0, 5));
  for (const [l, n] of combos) check('設定槽有內容: ' + l, n > 200, 'len=' + n);
  report('repro-settings');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
