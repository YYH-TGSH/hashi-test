// Bug1 重現：賽程 R1 數獨（時限結算）→ R2 數橋等待室靜置取樣：來賓名單是否閃爍＋訊息流記錄
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
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(window) { window.__SHARED_REG__ = SHARED_REG; window.fetch = (url, opts) => fetch(new URL(url, window.location.href).href, opts); window.scrollTo = () => {}; } });
  const w = dom.window;
  w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
  return { w, D: w.document, errors };
}
function setInput(w, el, val) { const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; setter.call(el, val); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); }
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
function logMsgs(pg, tag) {
  pg.w.__msgLog = [];
  const N = pg.w.__PLAT_NET;
  Object.values(N.conns).forEach(c => {
    if (c.__logged) return; c.__logged = true;
    const os = c.send.bind(c);
    c.send = (d) => { try { if (d && typeof d === 'object' && !d.__plat) pg.w.__msgLog.push(tag + '>' + (d.type || d.kind || '?') + (d.type === 'JOIN' ? (' uid=' + String(d.uid).slice(-6) + ' color=' + ('color' in d)) : '')); } catch (e) {} return os(d); };
  });
}
(async () => {
  const host = loadPageShared(HTML), guest = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  for (const pg of [host, guest]) {
    pg.w.PLAT_show('sudoku'); await waitFor(() => !!pg.w.__PLAT_HOOKS_sudoku, 300000, 'preboot sudoku');
    pg.w.PLAT_show('hashi'); await waitFor(() => !!pg.w.__PLAT_HOOKS_hashi, 300000, 'preboot hashi');
    pg.w.PLAT_show('lobby');
  }
  host.w.PLAT_show('lobby');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  guest.w.PLAT_show('lobby');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => (guest.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'guest room');
  logMsgs(host, 'H'); logMsgs(guest, 'G');
  host.D.querySelector('#t-s-size').value = '4';
  host.D.querySelector('#t-s-diff').value = 'easy';
  click(host.w, host.D.querySelector('#t-start'));
  await waitFor(() => host.w.__PLAT_NET.tourn && host.w.__PLAT_NET.tourn.phase === 'playing', 60000, 'tourn playing');
  host.w.__PLAT_NET.tourn.roundSecs = 7;
  // R1 sudoku：雙方準備＋房主開始
  await waitFor(() => host.D.querySelector('#view-sudoku [data-pr-region="roster"]') && guest.D.querySelector('#view-sudoku [data-pr-region="roster"]'), 120000, 'R1 rooms');
  click(host.w, host.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await sleep(800);
  click(guest.w, guest.D.querySelector('#view-sudoku [data-pr="ready"]'));
  await sleep(1600);
  click(host.w, host.D.querySelector('#view-sudoku [data-pr="start"]'));
  const settled = await waitFor(() => host.w.__PLAT_NET.tourn && host.w.__PLAT_NET.tourn.phase === 'standings', 120000, 'R1 settle');
  check('R1 結算', !!settled);
  await waitFor(() => !host.w.__PLAT_NET.inMatch && !guest.w.__PLAT_NET.inMatch, 60000, 'back to lobby');
  // R2 hashi：進等待室後靜置取樣 24 秒（不準備、不開始）
  click(host.w, host.D.querySelector('#t-next'));
  const inRoom = await waitFor(() => guest.D.querySelector('#view-hashi [data-pr-region="roster"]'), 120000, 'R2 guest hashi room');
  check('R2 來賓進數橋等待室', !!inRoom);
  host.w.__msgLog.length = 0; guest.w.__msgLog.length = 0;
  // 來賓端 incoming 監聽（mock conn 再掛一個 data listener，只記錄不干擾）
  guest.w.__inLog = [];
  Object.values(guest.w.__PLAT_NET.conns).forEach(c => {
    c.on('data', (d) => { try { if (d && typeof d === 'object' && !d.__plat) guest.w.__inLog.push((Date.now() % 100000) + ' ' + (d.type || '?') + (d.players ? ' players=[' + d.players.map(p => String(p.id).slice(-6) + ':' + p.name + ']') : '') + (d.type === 'INIT' ? ' initPlayers=[' + (d.players || []).map(p => String(p.id).slice(-6)) + ']' : '')); } catch (e) {} });
  });
  let present = 0, absent = 0, transitions = 0, last = null;
  const t0 = Date.now();
  while (Date.now() - t0 < 24000) {
    const r = guest.D.querySelector('#view-hashi [data-pr-region="roster"]');
    const has = !!r && r.textContent.includes('阿客');
    if (has) present++; else absent++;
    if (last !== null && has !== last) { transitions++; console.log('  [roster flip @' + (Date.now() - t0) + 'ms] -> ' + (has ? 'PRESENT' : 'ABSENT')); }
    last = has;
    await sleep(400);
  }
  console.log('guest incoming:', JSON.stringify(guest.w.__inLog, null, 0));
  console.log('guest roster samples: present=' + present + ' absent=' + absent + ' transitions=' + transitions);
  console.log('guest outgoing game msgs:', JSON.stringify(guest.w.__msgLog));
  console.log('host outgoing game msgs:', JSON.stringify(host.w.__msgLog.filter(m => /JOIN|PLAYERS|INIT|REJECT/.test(m))));
  check('Bug1 不重現：來賓在數橋等待室名單穩定（無閃爍）', transitions === 0 && absent === 0);
  check('來賓 Sudoku 殭屍 JOIN 未出現（無 color 的 JOIN）', !guest.w.__msgLog.some(m => m.includes('JOIN') && m.includes('color=false')));
  report([...host.errors, ...guest.errors]);
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); report([]); process.exit(1); });
