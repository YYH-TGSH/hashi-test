// Phase D 賽程引擎測試：stub 遊戲 hook（走真實 PlatPeer shim 通道送協定訊息）
// 驗證：開賽面板→tourn-setup→逐局 launch(帶 preset)→嗅探計分(SYNC/GHOST/RACE)→結算/積分榜→同分加賽→總冠軍
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
const { sleep, waitFor, click, check, report } = require('./harness');
const SHARED_REG = {};
function loadPageShared(htmlPath) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/<script[^>]+src="[^"]*peerjs[^"]*"[^>]*><\/script>/, '<script>' + mockSrc + '</script>');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errors.push(m); });
  vc.on('error', (m) => errors.push(String(m)));
  const dom = new JSDOM(html, {
    url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(window) {
      window.__SHARED_REG__ = SHARED_REG;
      window.fetch = (url, opts) => fetch(new URL(url, window.location.href).href, opts);
      window.scrollTo = () => {};
    },
  });
  const w = dom.window;
  w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
  return { w, D: w.document, errors };
}
function setInput(w, el, val) {
  const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set;
  setter.call(el, val);
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
  el.dispatchEvent(new w.Event('change', { bubbles: true }));
}
// 安裝 stub 遊戲 hook：enter 時用 window.Peer(shim) 建 VirtualPeer，行為比照真遊戲（host 等連線、guest 連線後送 JOIN）
function installStub(page, myName, uidFor) {
  const w = page.w;
  const stub = { enters: [], conns: [], conn: null, peer: null, exits: 0 };
  page.stub = stub;
  const hooks = {
    enter: (sess) => {
      stub.enters.push(sess);
      const P = w.Peer;
      const uid = uidFor(sess);
      if (sess.isHost) {
        const p = new P('yyh-tgsh-' + sess.code + '-host');
        stub.peer = p;
        p.on('connection', (c) => {
          stub.conns.push(c);
          c.on('data', (m) => {
            if (m && m.type === 'JOIN' && stub.onJoin) stub.onJoin(m, c);
          });
        });
      } else {
        const p = new P();
        stub.peer = p;
        p.on('open', () => {
          const c = p.connect('yyh-tgsh-' + sess.code + '-host');
          stub.conn = c;
          c.on('open', () => c.send({ type: 'JOIN', pName: myName, uid: uid }));
        });
      }
    },
    exit: () => { stub.exits++; try { stub.peer && stub.peer.destroy(); } catch (e) {} stub.peer = null; stub.conn = null; },
  };
  w.__PLAT_HOOKS_sudoku = hooks;
  w.__PLAT_HOOKS_hashi = hooks;
  // 鎖住 hooks：殼的 lazy boot 在遊戲第一次顯示時才執行真遊戲程式碼並覆寫 __PLAT_HOOKS_*，
  // 第一局 stub 會贏競速、第二局起就被真 hooks 取代（R3/R4 enters 消失的根源，屬 harness 假象）。
  // 用 defineProperty 吞掉後續覆寫，讓 stub 全程有效。
  ['__PLAT_HOOKS_sudoku', '__PLAT_HOOKS_hashi'].forEach(k => {
    const val = w[k];
    try {
      Object.defineProperty(w, k, {
        configurable: true, enumerable: true,
        get() { return val; },
        set() { /* 忽略真遊戲的 hooks 註冊 */ }
      });
    } catch (e) {}
  });
}
function hostSend(page, m) { page.stub.conns.forEach((c) => { try { c.send(m); } catch (e) {} }); }
function guestSend(page, m) { if (page.stub.conn) page.stub.conn.send(m); }
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
const cells16 = Array.from({ length: 16 }, (_, i) => ({ id: i, isGiven: i < 10, value: i < 10 ? '3' : null }));
(async () => {
  const host = loadPageShared(HTML);
  const guest = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  // 房主建房
  host.w.PLAT_show('lobby');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('[data-pr-region="code"]') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room');
  const code = host.D.querySelector('[data-pr-region="code"]').textContent.trim();
  // 來賓加入
  guest.w.PLAT_show('lobby');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => (guest.D.querySelector('[data-pr-region="code"]') || { textContent: '' }).textContent.trim().length === 4, 60000, 'guest room');
  const hostPid = host.w.__PLAT_NET.myPid, guestPid = guest.w.__PLAT_NET.myPid;
  const hostUid = host.w.__PLAT_NET.myUid, guestUid = guest.w.__PLAT_NET.myUid;
  check('兩人進房', !!hostPid && !!guestPid && hostPid !== guestPid);
  // 安裝 stub（在任何遊戲被開啟前）
  installStub(host, '阿主', (sess) => (sess.tourn && sess.tourn.round % 2 === 1) || !sess.tourn ? 'sH' : 'hH');
  installStub(guest, '阿客', (sess) => (sess.tourn && sess.tourn.round % 2 === 1) || !sess.tourn ? 'sG' : 'hG');
  // 比照真遊戲：host 收到 JOIN 後廣播 PLAYERS_UPDATE（殼靠它學 host 的 game uid 映射）
  host.stub.onJoin = () => hostSend(host, { type: 'PLAYERS_UPDATE', players: [{ id: 'sH', name: '阿主' }, { id: 'sG', name: '阿客' }] });
  // 開賽設定：數獨 4x4 簡單，其餘預設（交替數獨先、5 分鐘）
  click(host.w, host.D.querySelector('[data-rtab="tourn"]')); // 設定卡只在錦標賽分頁顯示（roomTab==='tourn'）
  await waitFor(() => host.D.querySelector('#lob-tourn-setup').style.display === 'block', 30000, 'tourn setup visible');
  host.D.querySelector('#ts-size').value = '4';
  host.D.querySelector('#ts-diff').value = 'easy';
  check('開賽卡房主可見', host.D.querySelector('#lob-tourn-setup').style.display === 'block');
  await waitFor(() => host.D.querySelector('#lob-step-room [data-pr="ready"]') && guest.D.querySelector('#lob-step-room [data-pr="ready"]'), 30000, 'ready btns'); // 等名單卡準備鈕渲染出來再點（早點會點空）
  click(host.w, host.D.querySelector('#lob-step-room [data-pr="ready"]'));
  click(guest.w, guest.D.querySelector('#lob-step-room [data-pr="ready"]'));
  const tCardStartS = await waitFor(() => { const b = host.D.querySelector('#lob-step-room [data-pr="start"]'); return (b && !b.disabled && b.textContent.includes('開賽')) ? b : null; }, 30000, 'tourn card start');
  click(host.w, tCardStartS);
  // 第 1 局 launch（雙方 stub enter 帶 tourn preset）
  await waitFor(() => host.stub.enters.length === 1 && guest.stub.enters.length === 1, 60000, 'round1 enters');
  const e1 = host.stub.enters[0];
  check('R1 房主 enter 帶賽程 preset（數獨 4x4）', !!e1.tourn && e1.tourn.round === 1 && e1.tourn.sizeId === 4 && e1.tourn.entrants === 2);
  check('R1 來賓 enter 同步帶 preset', !!guest.stub.enters[0].tourn && guest.stub.enters[0].tourn.sizeId === 4);
  check('賽程表交替 [數獨,數橋,數獨,數橋,數獨]', JSON.stringify(host.w.__PLAT_NET.tourn.rounds) === JSON.stringify(['sudoku', 'hashi', 'sudoku', 'hashi', 'sudoku']));
  check('來賓收到 tourn-setup', !!guest.w.__PLAT_NET.tourn);
  // R1 數獨：guest JOIN → host 回 PLAYERS_UPDATE（學 uid 映射）→ SYNC 開局 → guest 解 3 格(50%) → host 完賽 → guest 完賽 → 結算
  await sleep(800);
  hostSend(host, { type: 'SYNC', data: { cells: cells16, countdownTarget: Date.now() + 2000 } });
  await waitFor(() => host.w.__PLAT_NET.tourn.startedAt > 0, 30000, 'R1 started');
  check('R1 開局偵測（totalBlanks=6）', host.w.__PLAT_NET.tourn.totalBlanks === 6);
  [10, 11, 12].forEach((cid) => guestSend(guest, { type: 'GHOST_SOLVED', uid: 'sG', cellId: cid, value: '5' }));
  await waitFor(() => (host.w.__PLAT_NET.tourn.progress[guestUid] || 0) === 50, 30000, 'R1 guest progress');
  check('R1 嗅探數獨進度 50%', true);
  hostSend(host, { type: 'SYNC', data: { brawlWinners: [{ id: 'sH', name: '阿主' }] } });
  await sleep(300);
  guestSend(guest, { type: 'GHOST_I_WON', senderUid: 'sG', winInfo: { id: 'sG', name: '阿客' } });
  await waitFor(() => host.w.__PLAT_NET.tourn.phase === 'standings', 30000, 'R1 settle');
  const T1 = host.w.__PLAT_NET.tourn;
  check('R1 結算：房主 10 分、來賓 7 分', T1.totals[hostUid] === 10 && T1.totals[guestUid] === 7);
  check('R1 後雙方回大廳', !host.w.__PLAT_NET.inMatch && !guest.w.__PLAT_NET.inMatch);
  await waitFor(() => guest.w.__PLAT_NET.tourn && guest.w.__PLAT_NET.tourn.phase === 'standings', 30000, 'guest standings');
  check('來賓端積分同步', guest.w.__PLAT_NET.tourn.totals[hostUid] === 10);
  check('積分榜面板有總冠軍字樣區塊/下一局鈕', !!host.D.querySelector('#t-next'));
  // 第 2 局 數橋
  click(host.w, host.D.querySelector('#t-next'));
  await waitFor(() => host.stub.enters.length === 2 && guest.stub.enters.length === 2, 60000, 'round2 enters');
  check('R2 enter 帶數橋關卡 preset（sizeId=2）', host.stub.enters[1].tourn.sizeId === 2 && host.stub.enters[1].tourn.round === 2);
  await sleep(800);
  hostSend(host, { type: 'RACE_START', startAt: Date.now(), data: {}, racers: [], settings: {} });
  await waitFor(() => host.w.__PLAT_NET.tourn.startedAt > 0, 30000, 'R2 started');
  check('R2 計時器已啟動（endsAt-start=5分）', Math.abs(host.w.__PLAT_NET.tourn.endsAt - host.w.__PLAT_NET.tourn.startedAt - 300000) < 5000);
  guestSend(guest, { type: 'RACE_PROGRESS', uid: 'hG', name: '阿客', progress: 40 });
  await waitFor(() => (host.w.__PLAT_NET.tourn.progress[guestUid] || 0) === 40, 30000, 'R2 guest progress');
  check('R2 嗅探數橋進度 40%', true);
  guestSend(guest, { type: 'RACE_FINISH', uid: 'hG', name: '阿客' });
  await sleep(300);
  hostSend(host, { type: 'RACE_FINISH', uid: 'hH', name: '阿主' });
  await waitFor(() => host.w.__PLAT_NET.tourn.phase === 'standings', 30000, 'R2 settle');
  const T2 = host.w.__PLAT_NET.tourn;
  check('R2 結算：來賓 10 分，累計 17:17', T2.totals[hostUid] === 17 && T2.totals[guestUid] === 17);
  // 第 3 局 數獨（來賓勝）
  click(host.w, host.D.querySelector('#t-next'));
  await waitFor(() => host.stub.enters.length === 3, 60000, 'round3 enters');
  await sleep(600);
  hostSend(host, { type: 'SYNC', data: { cells: cells16, countdownTarget: Date.now() + 1500 } });
  await sleep(300);
  guestSend(guest, { type: 'GHOST_I_WON', senderUid: 'sG', winInfo: { id: 'sG', name: '阿客' } });
  await sleep(300);
  hostSend(host, { type: 'SYNC', data: { brawlWinners: [{ id: 'sH', name: '阿主' }] } });
  await waitFor(() => host.w.__PLAT_NET.tourn.phase === 'standings' && host.w.__PLAT_NET.tourn.round === 3, 30000, 'R3 settle');
  check('R3 累計 24:27', host.w.__PLAT_NET.tourn.totals[hostUid] === 24 && host.w.__PLAT_NET.tourn.totals[guestUid] === 27);
  // 第 4 局 數橋（房主勝）
  click(host.w, host.D.querySelector('#t-next'));
  await waitFor(() => host.stub.enters.length === 4, 60000, 'round4 enters');
  await sleep(600);
  hostSend(host, { type: 'RACE_START', startAt: Date.now(), data: {}, racers: [], settings: {} });
  await sleep(300);
  hostSend(host, { type: 'RACE_FINISH', uid: 'hH', name: '阿主' });
  await sleep(300);
  guestSend(guest, { type: 'RACE_FINISH', uid: 'hG', name: '阿客' });
  await waitFor(() => host.w.__PLAT_NET.tourn.phase === 'standings' && host.w.__PLAT_NET.tourn.round === 4, 30000, 'R4 settle');
  check('R4 累計 34:34、冠軍局數 2:2', host.w.__PLAT_NET.tourn.totals[hostUid] === 34 && host.w.__PLAT_NET.tourn.wins[hostUid] === 2 && host.w.__PLAT_NET.tourn.wins[guestUid] === 2);
  // 第 5 局 數獨：注入同分劇本（totals 31:34、wins 1:2），房主第 1、來賓第 2 → 41:41 且 wins 2:2 → 全同分 → 加賽
  click(host.w, host.D.querySelector('#t-next'));
  await waitFor(() => host.stub.enters.length === 5, 60000, 'round5 enters');
  await sleep(600);
  hostSend(host, { type: 'SYNC', data: { cells: cells16, countdownTarget: Date.now() + 1500 } });
  await sleep(300);
  const TT = host.w.__PLAT_NET.tourn;
  TT.totals[hostUid] = 31; TT.totals[guestUid] = 34; TT.wins[hostUid] = 1; TT.wins[guestUid] = 2;
  hostSend(host, { type: 'SYNC', data: { brawlWinners: [{ id: 'sH', name: '阿主' }] } });
  await sleep(300);
  guestSend(guest, { type: 'GHOST_I_WON', senderUid: 'sG', winInfo: { id: 'sG', name: '阿客' } });
  await waitFor(() => host.w.__PLAT_NET.tourn.phase === 'playoff-pending', 30000, 'playoff pending');
  check('R5 全同分 → 加賽待定', true);
  check('房主有加賽鈕', !!host.D.querySelector('#t-playoff'));
  // 加賽 數橋：來賓先完賽 → 總冠軍來賓
  click(host.w, host.D.querySelector('#t-playoff'));
  await waitFor(() => host.stub.enters.length === 6 && guest.stub.enters.length === 6, 60000, 'playoff enters');
  check('加賽 enter 帶 playoff 旗標', host.stub.enters[5].tourn.playoff === true && guest.stub.enters[5].tourn.playoff === true);
  await sleep(600);
  hostSend(host, { type: 'RACE_START', startAt: Date.now(), data: {}, racers: [], settings: {} });
  await sleep(300);
  guestSend(guest, { type: 'RACE_FINISH', uid: 'hG', name: '阿客' });
  await sleep(300);
  hostSend(host, { type: 'RACE_FINISH', uid: 'hH', name: '阿主' });
  await waitFor(() => host.w.__PLAT_NET.tourn.phase === 'ended', 30000, 'tourn ended');
  check('總冠軍 = 阿客（加賽勝者）', host.w.__PLAT_NET.tourn.champion && host.w.__PLAT_NET.tourn.champion.name === '阿客');
  await waitFor(() => guest.w.__PLAT_NET.tourn && guest.w.__PLAT_NET.tourn.phase === 'ended', 30000, 'guest ended');
  check('來賓端看到總冠軍畫面', (guest.D.querySelector('#lob-tourn') || { textContent: '' }).textContent.indexOf('總冠軍') >= 0);
  const errs = host.errors.concat(guest.errors);
  check('零錯誤', errs.length === 0);
  report(errs);
})();
