// 驗證（使用者 2026-10-28）：多人對戰我完賽後，畫面自動轉上帝模式（不用按鈕、不怕關掉打不開）
// 數獨：房主先解完 → 主盤面自動變上帝視角（自己的格子消失、god 總覽出現），成績卡關掉後仍在
// 數橋：來賓先解完 → 常駐觀戰面板自動出現（🏁 已完賽・觀戰中），成績卡關掉後仍在
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
let html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
let mock = require('./mockpeer.js');
mock = mock.replace("R.__msglog = R.__msglog || [];", "R.__msglog = R.__msglog || []; R.__fullog = R.__fullog || [];")
           .replace("if (pl && pl.type) R.__msglog.push({", "if (pl && pl.type) { try { R.__fullog.push(pl); } catch (e) {} R.__msglog.push({")
           .replace(": undefined }); } } catch (e) {}", ": undefined }); } } } catch (e) {}");
html = html.replace('<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>', () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(300); } console.log('  (waitFor timeout: ' + label + ')'); return null; }
const SHARED_REG = {};
function loadPage(label) {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errs.push(m); });
  vc.on('error', m => errs.push(String(m)));
  const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.__SHARED_REG__ = SHARED_REG; w.scrollTo = () => {}; try { w.localStorage.setItem('sudoku_input_mode', 'cell'); } catch (e) {} w.addEventListener('error', e => { if (e.message && !/Script error/.test(e.message)) errs.push(e.message); }); } });
  return { window: dom.window, document: dom.window.document, errors: errs, label };
}
const clickEl = (p, el) => { if (el) el.dispatchEvent(new p.window.MouseEvent('click', { bubbles: true })); return !!el; };
function setInput(w, el, val) { const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; setter.call(el, val); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); }
let pass = 0, fail = 0;
function check(name, cond, extra) { if (cond) { pass++; console.log('✅ ' + name); } else { fail++; console.log('❌ ' + name + (extra ? ' — ' + extra : '')); } }

async function makeRoom(game, preStart) {
  const H = loadPage('H'); H.label = 'H';
  await waitFor(() => typeof H.window.PLAT_show === 'function' && H.window.PlatDock, 600000, 'H shell');
  clickEl(H, H.document.querySelector('#lob-go-create'));
  await waitFor(() => H.document.querySelector('#lob-step-nick').style.display === 'block', 60000, 'H nick');
  setInput(H.window, H.document.querySelector('#lob-name'), '阿主');
  clickEl(H, H.document.querySelector('#lob-confirm'));
  await waitFor(() => { const rm = H.document.querySelector('#lob-step-room'); return rm && rm.style.display === 'block' && H.window.__PLAT_NET && H.window.__PLAT_NET.code; }, 150000, 'H room');
  const code = H.window.__PLAT_NET.code;
  const G = loadPage('G'); G.label = 'G';
  await waitFor(() => typeof G.window.PLAT_show === 'function' && G.window.PlatDock, 600000, 'G shell');
  clickEl(G, G.document.querySelector('#lob-go-join'));
  await waitFor(() => G.document.querySelector('#lob-step-nick').style.display === 'block', 60000, 'G nick');
  setInput(G.window, G.document.querySelector('#lob-name'), '阿客');
  setInput(G.window, G.document.querySelector('#lob-code'), code);
  clickEl(G, G.document.querySelector('#lob-confirm'));
  await waitFor(() => { const r = G.document.querySelector('#view-lobby [data-pr-region="roster"]'); return r && (r.textContent || '').includes('阿主'); }, 90000, 'G in room');
  // 現行開局（v1.11+ 房間頁，抄 test-v190）：切分頁 → 選大亂鬥 → 雙邊準備 → 房主開始 → 自動載入開賽
  const gname = game.startsWith('sudoku') ? 'sudoku' : 'hashi';
  const view = '#' + 'view-' + gname;
  for (const p of [H, G]) { // preboot：先載好遊戲，開始時才不卡
    p.window.PLAT_show(gname);
    await waitFor(() => !!p.window['__PLAT_HOOKS_' + gname], 300000, 'preboot ' + gname);
    p.window.PLAT_show('lobby');
  }
  clickEl(H, H.document.querySelector('#lob-step-room [data-rtab="' + gname + '"]'));
  await waitFor(() => G.window.__PLAT_NET && G.window.__PLAT_NET.armed && G.window.__PLAT_NET.armed.game === gname, 30000, 'guest armed');
  const modeVal = gname === 'sudoku' ? 'brawl' : 'race'; // 數獨模式值叫 brawl、數橋叫 race（殼 hubModeBtn）
  clickEl(H, H.document.querySelector('#lob-step-room [data-hub-mode="' + modeVal + '"][data-hub-game="' + gname + '"]'));
  await sleep(600);
  if (preStart) await preStart(H, G, view);
  clickEl(H, H.document.querySelector('#lob-step-room [data-pr="ready"]'));
  await sleep(700);
  clickEl(G, G.document.querySelector('#lob-step-room [data-pr="ready"]'));
  const en = await waitFor(() => { const sb = H.document.querySelector('#lob-step-room [data-pr="start"]'); return sb && !sb.disabled ? sb : null; }, 90000, 'start enabled');
  if (en) clickEl(H, en);
  await waitFor(() => H.window.__PLAT_NET.inMatch === gname && G.window.__PLAT_NET.inMatch === gname, 120000, 'inMatch');
  await sleep(1000);
  return { H, G, view };
}
const btnByText = (root, txt) => [...root.querySelectorAll('button')].find(b => (b.textContent || '').includes(txt));
(async () => {
  const { H, G } = await makeRoom('hashi-brawl');
  // 等倒數結束、競速開始（來賓讀得到島嶼＝已開局）
  await waitFor(() => { const cd = G.document.querySelector('#plat-countdown'); return !cd || cd.style.display !== 'flex'; }, 30000, 'cd over');
  await sleep(1500);
  const islands = G.document.querySelectorAll('#view-hashi svg text').length;
  console.log('PRE: view=', G.document.body.getAttribute('data-view'), 'inMatch=', G.window.__PLAT_NET.inMatch, 'hashi svg texts=', islands);
  // 來賓：按頂欄「退出」→ 選單 → 「退出（回大廳）」
  const exitBtn = btnByText(G.document.querySelector('#view-hashi'), '退出');
  console.log('guest exit btn found:', !!exitBtn, exitBtn ? exitBtn.textContent.trim().slice(0, 20) : '');
  clickEl(G, exitBtn);
  await sleep(800);
  const menuLeave = btnByText(G.document, '退出（回大廳）');
  console.log('guest exit menu leave found:', !!menuLeave);
  clickEl(G, menuLeave);
  await sleep(2500);
  console.log('POST-G: view=', G.document.body.getAttribute('data-view'), 'active=', G.window.__PLAT_NET.active, 'inMatch=', G.window.__PLAT_NET.inMatch, 'errs=', JSON.stringify(G.errors.slice(0, 3)));
  const lobVisible = G.document.querySelector('#view-lobby') && G.document.querySelector('#view-lobby').classList.contains('active');
  console.log('guest sees lobby view:', !!lobVisible);
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
