// 雙頁真連線測試：房主頁 + 來賓頁（共用 mock broker）
// 驗證：大廳代表色拉霸、數橋大亂鬥名單/進度列、等待室設定骨架、觀戰開關、共用倒數、視訊 popover 層級
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
      const fakeTrack = { enabled: true, stop: () => {} };
      Object.defineProperty(window.navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => ({ getTracks: () => [fakeTrack], getAudioTracks: () => [fakeTrack], getVideoTracks: () => [fakeTrack] }) } });
    },
  });
  const w = dom.window;
  w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
  return { w, D: w.document, errors };
}
function setInput(w, el, val) {
  if (!el) return false;
  const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set;
  setter.call(el, val);
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
  el.dispatchEvent(new w.Event('change', { bubbles: true }));
  return true;
}
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
(async () => {
  const host = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  // 房主建房 → 暱稱步
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick step');
  // 代表色：點色塊不應選色
  const colorBtn = host.D.querySelector('[data-lob-color="5"]');
  check('大廳色盤有色塊', !!colorBtn);
  click(host.w, colorBtn);
  await sleep(200);
  check('點色塊不選色（plat_color 仍未設定）', !host.w.localStorage.getItem('plat_color'));
  // 拉霸選色
  click(host.w, host.D.querySelector('#lob-color-spin'));
  await waitFor(() => !!host.w.localStorage.getItem('plat_color'), 30000, 'color slot result');
  const spun = host.w.localStorage.getItem('plat_color');
  check('拉霸選色寫入 plat_color', /^#[0-9A-Fa-f]{6}$/.test(spun));
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room code');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  console.log('room code:', code);
  // 來賓加入
  const guest = loadPageShared(HTML);
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick step');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => (guest.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿主'), 60000, 'guest sees host in lobby');
  check('來賓大廳名單含房主阿主', true);
  // 房主啟動數橋大亂鬥
  const launchBtn = host.D.querySelector('[data-launch="hashi-brawl"]');
  check('房主有數橋大亂鬥啟動鈕', !!launchBtn);
  click(host.w, launchBtn);
  await waitFor(() => host.D.querySelector('#view-hashi [data-pr-region="roster"]'), 120000, 'host hashi room');
  await waitFor(() => guest.D.querySelector('#view-hashi [data-pr-region="roster"]'), 120000, 'guest hashi room');
  const gRoster = guest.D.querySelector('#view-hashi [data-pr-region="roster"]').textContent.replace(/\s+/g, ' ');
  check('來賓等待室名單含自己（阿客）', gRoster.includes('阿客'));
  check('來賓等待室名單含房主（阿主）', gRoster.includes('阿主'));
  // 設定骨架（數獨同款）：對局設定標頭＋遊戲設定鈕（房主）＋下拉選單
  const hSettings = host.D.querySelector('#view-hashi [data-pr-slot="settings"]');
  check('房主設定區有「對局設定」標頭', !!hSettings && hSettings.textContent.includes('對局設定'));
  check('房主設定區有「遊戲設定」鈕', !!hSettings && hSettings.textContent.includes('遊戲設定'));
  check('房主設定區有下拉選單（關卡+名次 2 個）', !!hSettings && hSettings.querySelectorAll('select').length === 2);
  check('房主設定區無舊關卡晶片列', !!hSettings && !hSettings.textContent.includes('房主選，全員同步'));
  // 來賓遊戲是 lazy boot，設定 portal 內容比名單晚到：等內容出現再斷言（檢查意圖不變）
  await waitFor(() => { const s2 = guest.D.querySelector('#view-hashi [data-pr-slot="settings"]'); return s2 && s2.textContent.includes('對局設定'); }, 45000, 'guest settings slot content');
  const gSettings = guest.D.querySelector('#view-hashi [data-pr-slot="settings"]');
  check('來賓設定區有「對局設定」標頭', !!gSettings && gSettings.textContent.includes('對局設定'));
  check('來賓設定區顯示關卡文字（無 select）', !!gSettings && gSettings.querySelectorAll('select').length === 0 && gSettings.textContent.includes('關卡'));
  // 觀戰改名單列開關：有 player-toggle、沒有獨立觀戰鈕
  check('來賓名單列有參賽/上帝開關', !!guest.D.querySelector('#view-hashi [data-pr="player-toggle"]'));
  check('來賓控制區無獨立觀戰鈕', !guest.D.querySelector('#view-hashi [data-pr="spectator"]'));
  // 頁內觀察器：記錄 PlatCountdown 是否曾顯示/後隱藏（不受 Node 取樣停滯影響）
  guest.w.eval(`(function(){ window.__cdCalls = []; if (window.PlatCountdown) { var os = window.PlatCountdown.show.bind(window.PlatCountdown); var oh = window.PlatCountdown.hide.bind(window.PlatCountdown); window.PlatCountdown.show = function(v){ window.__cdCalls.push('show:' + v); return os(v); }; window.PlatCountdown.hide = function(){ window.__cdCalls.push('hide'); return oh(); }; } window.__cdSeen = false; window.__cdHidden = false; var wasFlex = false;
    new MutationObserver(function(){
      var cd = document.querySelector('#plat-countdown');
      var flex = !!(cd && cd.style.display === 'flex');
      if (flex) { window.__cdSeen = true; wasFlex = true; }
      else if (wasFlex) { window.__cdHidden = true; }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
  })()`);
  // 雙方準備 → 自動開始，期間共用倒數 overlay 應出現
  click(guest.w, guest.D.querySelector('#view-hashi [data-pr="ready"]'));
  await sleep(600);
  click(host.w, host.D.querySelector('#view-hashi [data-pr="ready"]'));
  let sawCountdown = false, cdText = '';
  const cdDeadline = Date.now() + 25000;
  while (Date.now() < cdDeadline) {
    const cd = guest.D.querySelector('#plat-countdown');
    if (cd && cd.style.display === 'flex') { sawCountdown = true; cdText = cd.textContent.trim(); break; }
    const hStart = host.D.querySelector('#view-hashi [data-pr="start"]');
    if (hStart && !hStart.disabled && (host.D.body.textContent || '').includes('遊戲大廳')) { click(host.w, hStart); }
    if ((guest.D.body.textContent || '').includes('👥 玩家：')) break;
    await sleep(120);
  }
  check('共用倒數 overlay 出現（PlatCountdown）', sawCountdown || guest.w.__cdSeen === true);
  console.log('countdown text seen:', cdText, 'observer seen:', guest.w.__cdSeen, 'PlatCountdown calls:', JSON.stringify(guest.w.__cdCalls || []));
  await waitFor(() => (guest.D.body.textContent || '').includes('👥 玩家：'), 60000, 'guest race progress strip');
  await sleep(5000); // 倒數結束
  check('倒數結束後 overlay 隱藏', (() => { if (guest.w.__cdHidden === true) return true; const cd = guest.D.querySelector('#plat-countdown'); return !cd || cd.style.display !== 'flex'; })());
  const gBody = guest.D.body.textContent.replace(/\s+/g, ' ');
  const rowsText = (() => { const idx = gBody.indexOf('👥 玩家：'); return idx >= 0 ? gBody.slice(idx, idx + 120) : ''; })();
  console.log('guest progress strip:', rowsText);
  check('來賓進度晶片含房主（阿主）', rowsText.includes('阿主'));
  check('來賓進度晶片含自己（阿客（你））', rowsText.includes('阿客') && rowsText.includes('(你)'));
  check('來賓進度晶片沒有「你(你)」假名', !rowsText.includes('你(你)'));
  check('來賓進度晶片阿主只出現一次', (rowsText.match(/阿主/g) || []).length === 1);
  check('進度卡無里程碑說明文字', !gBody.includes('會發道具給落後者'));
  const hBody = host.D.body.textContent.replace(/\s+/g, ' ');
  const hIdx = hBody.indexOf('👥 玩家：');
  check('房主端進度晶片阿主/阿客各一次', hIdx >= 0 && (hBody.slice(hIdx, hIdx + 160).match(/阿主/g) || []).length === 1 && (hBody.slice(hIdx, hIdx + 160).match(/阿客/g) || []).length === 1);
  // 視訊：來賓開視訊 → 頭像出現；點底部列 🎥 開 popover → 層級檢查
  guest.w.PlatDock.toggleVideo();
  await waitFor(() => guest.D.querySelectorAll('#plat-videos .plat-vid').length >= 1, 30000, 'guest video circle');
  check('來賓視訊頭像出現', true);
  const vidBtn = guest.D.querySelector('#view-hashi [data-pb="dock-video"]');
  check('底部列有視訊鈕', !!vidBtn);
  click(guest.w, vidBtn);
  await sleep(400);
  check('視訊 popover 開啟（麥克風鈕出現）', !!guest.D.querySelector('#view-hashi [data-pb="dock-mic"]'));
  check('popover 開啟時底部列層級高於頭像', (() => {
    let el = guest.D.querySelector('[data-pb="dock-mic"]');
    while (el && el !== guest.D.body) { if (el.style && el.style.zIndex === '99990') return true; el = el.parentElement; }
    return false;
  })());
  check('popover 開啟時頭像層級降低', (guest.D.querySelector('#plat-videos') || { style: {} }).style.zIndex === '9990');
  // 頭像拖曳：pointer 拖移 → 位置寫入 localStorage（本機個別位置）
  const vid = guest.D.querySelector('#plat-videos .plat-vid');
  const r = vid.getBoundingClientRect();
  const fire = (type, x, y) => { const ev = new guest.w.MouseEvent(type, { bubbles: true, clientX: x, clientY: y }); Object.defineProperty(ev, 'pointerId', { value: 1 }); vid.dispatchEvent(ev); };
  fire('pointerdown', r.left + 10, r.top + 10);
  fire('pointermove', r.left + 110, r.top + 70);
  fire('pointerup', r.left + 110, r.top + 70);
  await sleep(200);
  const saved = JSON.parse(guest.w.localStorage.getItem('plat_vpos') || '{}');
  check('拖曳後頭像位置存入本機（self）', !!saved.self && typeof saved.self.fx === 'number');
  check('來賓端零錯誤', guest.errors.filter(e => !/scrollTo/.test(e)).length === 0);
  check('房主端零錯誤', host.errors.filter(e => !/scrollTo/.test(e)).length === 0);
  report([...host.errors, ...guest.errors]); host.w.close(); guest.w.close();
})().catch((e) => { console.error('FATAL', e); report([]); process.exitCode = 1; });
