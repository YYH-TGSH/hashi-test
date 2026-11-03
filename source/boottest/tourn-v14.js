// v1.4 五戰修正驗證：A 房主結束本局（進度%結算）/ B uid 認人重連歸隊 / C 狀態備份+接管續打 / D 局間強制開始標籤
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
const { sleep, waitFor, click, check, report } = require('./harness');
const SHARED_REG = {};
function loadPageShared(htmlPath, seedUid) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/<script[^>]+src="[^"]*peerjs[^"]*"[^>]*><\/script>/, '<script>' + mockSrc + '</script>');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errors.push(m); });
  vc.on('error', (m) => errors.push(String(m)));
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(window) { window.__SHARED_REG__ = SHARED_REG; if (seedUid) { try { window.localStorage.setItem('plat_uid', seedUid); } catch (e) {} } window.fetch = (url, opts) => fetch(new URL(url, window.location.href).href, opts); window.scrollTo = () => {}; } });
  const w = dom.window;
  w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
  return { w, D: w.document, errors };
}
function setInput(w, el, val) { const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; setter.call(el, val); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); }
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
        p.on('connection', (c) => { stub.conns.push(c); c.on('data', (m) => { if (m && m.type === 'JOIN' && stub.onJoin) stub.onJoin(m, c); }); });
      } else {
        const p = new P();
        stub.peer = p;
        p.on('open', () => { const c = p.connect('yyh-tgsh-' + sess.code + '-host'); stub.conn = c; c.on('open', () => c.send({ type: 'JOIN', pName: myName, uid: uid })); });
      }
    },
    exit: () => { stub.exits++; try { stub.peer && stub.peer.destroy(); } catch (e) {} stub.peer = null; stub.conn = null; },
    migrate: () => {},
  };
  w.__PLAT_HOOKS_sudoku = hooks;
  w.__PLAT_HOOKS_hashi = hooks;
  ['__PLAT_HOOKS_sudoku', '__PLAT_HOOKS_hashi'].forEach(k => {
    const val = w[k];
    try { Object.defineProperty(w, k, { configurable: true, enumerable: true, get() { return val; }, set() {} }); } catch (e) {}
  });
}
function hostSend(page, m) { page.stub.conns.forEach((c) => { try { c.send(m); } catch (e) {} }); }
function guestSend(page, m) { if (page.stub.conn) page.stub.conn.send(m); }
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
const cells16 = Array.from({ length: 16 }, (_, i) => ({ id: i, isGiven: i < 10, value: i < 10 ? '3' : null }));

async function makeRoom(hostName, guestName, seedGuestUid) {
  const host = loadPageShared(HTML);
  const guest = loadPageShared(HTML, seedGuestUid || null);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 300000, 'host shell');
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 300000, 'guest shell');
  host.w.PLAT_show('lobby');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(host.w, host.D.querySelector('#lob-name'), hostName);
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  guest.w.PLAT_show('lobby');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(guest.w, guest.D.querySelector('#lob-name'), guestName);
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => guest.w.__PLAT_NET.active && !guest.w.__PLAT_NET.isHost, 60000, 'guest in room');
  await waitFor(() => host.w.__PLAT_NET.roster.length === 2, 60000, 'roster 2');
  return { host, guest, code };
}

(async () => {
  // ============ 情境 1：A 結束本局 + C 快照 + D 強制標籤 + B 重連歸隊 ============
  const { host, guest, code } = await makeRoom('阿主', '阿客');
  const H = host.w, G = guest.w;
  const hostUid = H.__PLAT_NET.myUid, guestUid = G.__PLAT_NET.myUid;
  check('殼 uid 兩人不同', !!hostUid && !!guestUid && hostUid !== guestUid);
  installStub(host, '阿主', () => 'sH');
  installStub(guest, '阿客', () => 'sG');
  host.stub.onJoin = () => hostSend(host, { type: 'PLAYERS_UPDATE', players: [{ id: 'sH', name: '阿主' }, { id: 'sG', name: '阿客' }] });
  host.D.querySelector('#t-s-size').value = '4';
  host.D.querySelector('#t-s-diff').value = 'easy';
  click(H, host.D.querySelector('#t-start'));
  await waitFor(() => host.stub.enters.length === 1 && guest.stub.enters.length === 1, 60000, 'R1 enters');
  check('R1 開局', H.__PLAT_NET.tourn && H.__PLAT_NET.tourn.phase === 'playing');
  await sleep(600);
  hostSend(host, { type: 'SYNC', data: { cells: cells16, countdownTarget: Date.now() + 1500 } });
  await waitFor(() => H.__PLAT_NET.tourn.startedAt > 0, 30000, 'R1 started');
  [10, 11, 12].forEach((cid) => guestSend(guest, { type: 'GHOST_SOLVED', uid: 'sG', cellId: cid, value: '5' }));
  hostSend(host, { type: 'GHOST_SOLVED', uid: 'sH', cellId: 13, value: '5' }); // 房主解 1 格 = 16%
  await waitFor(() => (H.__PLAT_NET.tourn.progress[guestUid] || 0) === 50, 30000, 'guest 50%');
  // C：快照同步到來賓端（來賓的影子狀態要有進度）
  const snap = await waitFor(() => (G.__PLAT_NET.tourn.progress[guestUid] || 0) === 50, 30000, 'guest shadow progress');
  check('C：局中進度快照同步到來賓端備份', !!snap);
  // A：房主隨時結束本局
  const feb = host.D.querySelector('#t-forceend');
  check('A：局中有「結束本局」鈕', !!feb);
  click(H, feb);
  await waitFor(() => H.__PLAT_NET.tourn.phase === 'standings', 30000, 'settled by force-end');
  check('A：結束本局以進度結算（客 50% 第1=10 分、主 16% 第2=7 分）', H.__PLAT_NET.tourn.totals[guestUid] === 10 && H.__PLAT_NET.tourn.totals[hostUid] === 7, JSON.stringify(H.__PLAT_NET.tourn.totals));
  check('A：來賓端同步結算', G.__PLAT_NET.tourn.totals[guestUid] === 10);
  // D：清掉來賓 ack 並觸發重繪 → 下一局鈕變強制標籤；點擊可強制開局
  await waitFor(() => { const a = H.__PLAT_NET.tourn.acks[guestUid]; return a && a.lobby === 1; }, 30000, 'guest acked lobby');
  H.__PLAT_NET.tourn.acks = {}; H.__PLAT_NET.tourn.acks[hostUid] = { lobby: 1 };
  // 用一封殼 ack 訊息觸發房主端 renderTourn 重繪（經殼連線直送 __plat 信封；stub 遊戲連線已隨 exit 關閉）
  G.__PLAT_NET.conns[G.__PLAT_NET.hostPid].send({ __plat: 1, kind: 'tourn-ack', what: 'entered', round: 99, uid: guestUid });
  await waitFor(() => { const b = host.D.querySelector('#t-next'); return b && b.textContent.includes('強制開始'); }, 30000, 'force label');
  check('D：有人未回來時下一局鈕顯示「強制開始（還有 1 人未回來）」', host.D.querySelector('#t-next').textContent.includes('1 人未回來'), host.D.querySelector('#t-next').textContent);
  click(H, host.D.querySelector('#t-next'));
  await waitFor(() => host.stub.enters.length === 2, 60000, 'R2 enters after force');
  check('D：房主強制開始第 2 局成功', H.__PLAT_NET.tourn.round === 2 && H.__PLAT_NET.tourn.phase === 'playing');
  // B：原來賓頁面消失（關頁）→ 房主名單先移除他 → 同 uid 的新頁面同名重連歸隊
  Object.values(G.__PLAT_NET.conns).forEach(c => { try { c.close(); } catch (e) {} });
  try { guest.w.close(); } catch (e) {}
  await waitFor(() => H.__PLAT_NET.roster.length === 1, 60000, 'old guest pruned');
  const guest2 = loadPageShared(HTML, guestUid);
  const G2 = guest2.w;
  installStub(guest2, '阿客', () => 'sG');
  await waitFor(() => typeof G2.PLAT_show === 'function' && G2.PlatDock, 300000, 'guest2 shell');
  G2.PLAT_show('lobby');
  click(G2, guest2.D.querySelector('#lob-go-join'));
  await waitFor(() => guest2.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest2 nick');
  setInput(G2, guest2.D.querySelector('#lob-name'), '阿客');
  setInput(G2, guest2.D.querySelector('#lob-code'), code);
  // harness 修正：stub 遊戲 peer 曾以同 id 蓋掉殼 peer 的註冊；真實平台裡 host id 只屬於殼，還原註冊再加入
  const REG = H.__MOCK_PEER_REG || (G && G.__MOCK_PEER_REG);
  if (REG) REG['yyh-tgsh-' + code + '-host'] = H.__PLAT_NET.peer;
  click(G2, guest2.D.querySelector('#lob-confirm'));
  await waitFor(() => G2.__PLAT_NET.active && !G2.__PLAT_NET.isHost, 60000, 'guest2 in room');
  check('B：重連者 uid 相同', G2.__PLAT_NET.myUid === guestUid);
  await waitFor(() => { const e = H.__PLAT_NET.tourn.entrants.find(x => x.uid === guestUid); return e && e.pid === G2.__PLAT_NET.myPid; }, 60000, 'entrant rebound');
  check('B：房主端參賽者以 uid 認回（pid 已更新、仍 2 位參賽者）', H.__PLAT_NET.tourn.entrants.length === 2);
  check('B：積分保留（客仍 10 分）', H.__PLAT_NET.tourn.totals[guestUid] === 10);
  const synced = await waitFor(() => guest2.w.__PLAT_NET.tourn && guest2.w.__PLAT_NET.tourn.totals[guestUid] === 10, 60000, 'guest2 state synced');
  if (!synced) {
    const n2 = guest2.w.__PLAT_NET;
    console.log('DBG guest2: active=' + n2.active + ' isHost=' + n2.isHost + ' myPid=' + n2.myPid + ' roster=' + JSON.stringify(n2.roster.map(p => [p.name, p.pid === n2.myPid])) + ' tourn=' + !!n2.tourn + ' errs=' + guest2.errors.slice(0, 3).join(';'));
    console.log('DBG host roster=' + JSON.stringify(H.__PLAT_NET.roster.map(p => [p.name, p.uid === guestUid])) + ' entrants=' + JSON.stringify(H.__PLAT_NET.tourn.entrants.map(e => [e.name, e.uid === guestUid, e.pid])));
  }
  check('B：重連者收到賽程狀態同步（積分/局數）', !!synced && guest2.w.__PLAT_NET.tourn.round === 2);

  // ============ 情境 2：C 房主斷線接管續打 ============
  const s2 = await makeRoom('房主乙', '來賓丙');
  const H2 = s2.host.w, G2w = s2.guest.w;
  const h2Uid = H2.__PLAT_NET.myUid, g2Uid = G2w.__PLAT_NET.myUid;
  installStub(s2.host, '房主乙', () => 'sH');
  installStub(s2.guest, '來賓丙', () => 'sG');
  s2.host.stub.onJoin = () => hostSend(s2.host, { type: 'PLAYERS_UPDATE', players: [{ id: 'sH', name: '房主乙' }, { id: 'sG', name: '來賓丙' }] });
  s2.host.D.querySelector('#t-s-size').value = '4';
  s2.host.D.querySelector('#t-s-diff').value = 'easy';
  click(H2, s2.host.D.querySelector('#t-start'));
  await waitFor(() => s2.host.stub.enters.length === 1 && s2.guest.stub.enters.length === 1, 60000, 'S2 R1 enters');
  await sleep(600);
  hostSend(s2.host, { type: 'SYNC', data: { cells: cells16, countdownTarget: Date.now() + 1500 } });
  await waitFor(() => H2.__PLAT_NET.tourn.startedAt > 0, 30000, 'S2 started');
  [10, 11, 12].forEach((cid) => guestSend(s2.guest, { type: 'GHOST_SOLVED', uid: 'sG', cellId: cid, value: '5' }));
  hostSend(s2.host, { type: 'GHOST_SOLVED', uid: 'sH', cellId: 13, value: '5' });
  await waitFor(() => (G2w.__PLAT_NET.tourn.progress[g2Uid] || 0) === 50, 30000, 'S2 shadow progress');
  // 房主斷線：關閉來賓→房主的殼連線（來賓視角房主消失）
  const hc = G2w.__PLAT_NET.conns[G2w.__PLAT_NET.hostPid];
  hc.close();
  await waitFor(() => G2w.__PLAT_NET.isHost, 90000, 'guest promoted');
  check('C：來賓升格新房主', G2w.__PLAT_NET.isHost);
  await waitFor(() => G2w.__PLAT_NET.tourn && G2w.__PLAT_NET.tourn.phase === 'standings', 90000, 'adopted & settled');
  check('C：接管後本局依備份進度結算（丙 10 分、乙 7 分），不提前結束賽程', G2w.__PLAT_NET.tourn.totals[g2Uid] === 10 && G2w.__PLAT_NET.tourn.totals[h2Uid] === 7, JSON.stringify(G2w.__PLAT_NET.tourn.totals));
  const nb2 = s2.guest.D.querySelector('#t-next');
  check('C：新房主可繼續主持（有下一局鈕）', !!nb2);
  click(G2w, nb2);
  await waitFor(() => G2w.__PLAT_NET.tourn.round === 2 && G2w.__PLAT_NET.tourn.phase === 'playing', 60000, 'S2 round2');
  check('C：接管後成功開第 2 局', true);

  report(host.errors.concat(guest.errors, guest2.errors, s2.host.errors, s2.guest.errors));
  process.exit(0);
})().catch(e => { console.log('FATAL', e && e.message, e && e.stack && e.stack.split('\n')[1]); process.exit(1); });
