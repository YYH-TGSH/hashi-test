// v1.9.0 驗收：分頁純選遊戲（按開始才過去）/ 錦標賽改名＋局數＋設定讀遊戲 / 多人深藍底色：拿掉多人連線選單頁（建/入房直達等待室）/ 等待室內分頁切換 / 藍色回大廳鈕回主頁 / 五戰嚴格結算
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
const { sleep, waitFor, click } = require('./harness');
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗ FAIL:', name, extra || ''); } };
const REG = {};
function loadPage(htmlPath, seed) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/<script[^>]+src="[^"]*peerjs[^"]*"[^>]*><\/script>/, '<script>' + mockSrc + '</script>');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errors.push(m); });
  vc.on('error', (m) => errors.push(String(m)));
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(window) { window.__SHARED_REG__ = REG; window.scrollTo = () => {}; if (seed) { try { for (const k in seed) window.localStorage.setItem(k, seed[k]); } catch (e) {} } } });
  const w = dom.window;
  w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
  return { w, D: w.document, errors };
}
function setInput(w, el, val) { const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; setter.call(el, val); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); }
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
const bundle = fs.readFileSync(HTML, 'utf8');
const rosterOf = (pg, game) => pg.D.querySelector('#view-' + game + ' [data-pr-region="roster"]');
(async () => {
  check('版本 1.9.1（bundle）', bundle.includes("PLAT_VERSION = '1.9.1'"));
  check('藍色回大廳鈕改回主頁（bundle 靜態）', (bundle.match(/PLAT_show\('home'\)/g) || []).length >= 2);

  // === 房主建房 → 直達數獨等待室 ===
  const host = loadPage(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  host.w.PLAT_show('lobby');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  const hRos = await waitFor(() => rosterOf(host, 'sudoku'), 90000, 'host auto-enter sudoku room');
  check('建房後直達數獨等待室（跳過多人連線選單）', !!hRos);
  check('直達時不在大廳畫面', host.D.body.getAttribute('data-view') === 'sudoku', host.D.body.getAttribute('data-view'));
  const code = (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim();
  check('房號取得', code.length === 4, code);
  const hTabs = host.D.querySelector('#view-sudoku [data-pr-region="tabs"]');
  check('等待室有分頁列（三個分頁）', !!hTabs && hTabs.querySelectorAll('[data-rtab]').length === 3);
  check('等待室沒有殼的模式列（模式在對局設定裡）', !!hTabs && hTabs.querySelectorAll('[data-rmode]').length === 0);
  check('進房後 body 掛 plat-room-on（多人深藍底色）', host.D.body.classList.contains('plat-room-on'));
  check('錦標賽分頁名稱', !!hTabs && (hTabs.textContent || '').includes('錦標賽'));
  await waitFor(() => (rosterOf(host, 'sudoku').textContent || '').includes('阿主'), 30000, 'host roster self');
  check('房主在等待室名單中', true);

  // === 來賓入房 → 直達同一個等待室 ===
  const guest = loadPage(HTML);
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  guest.w.PLAT_show('lobby');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  const gRos = await waitFor(() => rosterOf(guest, 'sudoku'), 120000, 'guest auto-enter sudoku room');
  check('來賓入房直達數獨等待室', !!gRos);
  check('來賓畫面在數獨不在大廳', guest.D.body.getAttribute('data-view') === 'sudoku', guest.D.body.getAttribute('data-view'));
  await waitFor(() => (rosterOf(host, 'sudoku').textContent || '').includes('阿客'), 60000, 'host sees guest');
  check('房主名單有來賓', true);
  await waitFor(() => (rosterOf(guest, 'sudoku').textContent || '').includes('阿主'), 60000, 'guest sees host');
  check('來賓名單有房主', true);
  const gTabs = guest.D.querySelector('#view-sudoku [data-pr-region="tabs"]');
  check('來賓等待室也看得到分頁列', !!gTabs && gTabs.querySelectorAll('[data-rtab]').length === 3);
  // === 錦標賽開賽 → 全員落進第 1 局等待室（可見性斷言，不能只查元素存在） ===
  const regionShown = (pg, game, region) => { const el = pg.D.querySelector('#view-' + game + ' [data-pr-region="' + region + '"]'); return !!el && el.style.display !== 'none'; };
  click(host.w, host.D.querySelector('#view-sudoku [data-rtab="tourn"]'));
  await sleep(800);
  check('開賽前房主在錦標賽分頁（名單隱藏）', !regionShown(host, 'sudoku', 'roster'));
  const tStartBtn = await waitFor(() => host.D.querySelector('#t-start'), 60000, 't-start btn');
  check('找到開賽鈕', !!tStartBtn);
  if (tStartBtn) click(host.w, tStartBtn);
  await waitFor(() => host.w.__PLAT_NET && host.w.__PLAT_NET.tourn && host.w.__PLAT_NET.tourn.phase === 'playing', 60000, 'tourn playing');
  check('賽程建立且第 1 局進行中（房主）', true);
  check('開賽後房主 roomTab 切到第 1 局遊戲', host.w.__PLAT_NET.roomTab === 'sudoku', host.w.__PLAT_NET.roomTab);
  check('房主看得到第 1 局等待室名單', regionShown(host, 'sudoku', 'roster'));
  check('房主看得到準備/開始控制列', regionShown(host, 'sudoku', 'controls'));
  check('錦標賽面板區已收起', !regionShown(host, 'sudoku', 'tourn'));
  await waitFor(() => guest.w.__PLAT_NET && guest.w.__PLAT_NET.tourn && guest.w.__PLAT_NET.tourn.phase === 'playing', 60000, 'guest tourn playing');
  check('來賓賽程進行中', true);
  check('來賓也被切去第 1 局（roomTab）', guest.w.__PLAT_NET.roomTab === 'sudoku', guest.w.__PLAT_NET.roomTab);
  check('來賓看得到第 1 局等待室名單', regionShown(guest, 'sudoku', 'roster'));
  const gEnt = (host.w.__PLAT_NET.tourn.entrants || []).find(e => e.name === '阿客');
  await waitFor(() => gEnt && host.w.__PLAT_NET.tourn.acks && host.w.__PLAT_NET.tourn.acks[gEnt.uid] && host.w.__PLAT_NET.tourn.acks[gEnt.uid].entered === 1, 90000, 'guest entered ack');
  check('房主收到來賓進場 ack', true);
  // === 準備 + 開始（用看得見的鈕）→ 第 1 局真的開打 ===
  const gReady = guest.D.querySelector('#view-sudoku [data-pr="ready"]');
  check('來賓看得到準備鈕', !!gReady && regionShown(guest, 'sudoku', 'controls'));
  if (gReady) click(guest.w, gReady);
  const hReady = host.D.querySelector('#view-sudoku [data-pr="ready"]');
  if (hReady) click(host.w, hReady);
  const startOk = await waitFor(() => { const b = host.D.querySelector('#view-sudoku [data-pr="start"]'); return (b && !b.disabled) ? b : null; }, 90000, 'host start enabled');
  check('全員準備後房主開始鈕亮起', !!startOk);
  for (let i = 0; i < 20 && rosterOf(host, 'sudoku'); i++) { const b = host.D.querySelector('#view-sudoku [data-pr="start"]'); if (b && !b.disabled) click(host.w, b); await sleep(1500); }
  check('第 1 局真的開打（房主等待室消失）', !rosterOf(host, 'sudoku'));
  await waitFor(() => !rosterOf(guest, 'sudoku'), 60000, 'guest match started');
  check('第 1 局真的開打（來賓等待室消失）', !rosterOf(guest, 'sudoku'));
  const errs = [...host.errors, ...guest.errors].filter(e => !/scrollTo/.test(e));
  check('零頁面錯誤', errs.length === 0, errs.slice(0, 3).join(' | '));
  console.log('\nRESULT: ' + pass + ' pass, ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
})();
