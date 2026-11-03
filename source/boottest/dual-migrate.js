// 三頁（數獨合作）：對局等待中房主斷線 → 第一位來賓升格接管 → 另一位自動重連回座 → 新房主開局全員進遊戲
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
  if (!el) return false;
  const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set;
  setter.call(el, val);
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
  el.dispatchEvent(new w.Event('change', { bubbles: true }));
  return true;
}
const HTML = '/home/hatch/workspace/platform/platform-v1-test.html';
async function joinLobby(guest, code, name) {
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, name + ' shell');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, name + ' nick step');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  setInput(guest.w, guest.D.querySelector('#lob-name'), name);
  click(guest.w, guest.D.querySelector('#lob-confirm'));
}
const roomEl = (pg) => pg.D.querySelector('#view-sudoku [data-pr-region="roster"]');
(async () => {
  const host = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick step');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room code');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  const hostPid = 'yyh-tgsh-' + code + '-host';
  const g1 = loadPageShared(HTML);
  await joinLobby(g1, code, '阿客');
  await waitFor(() => (g1.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿主'), 60000, 'g1 sees host');
  const g2 = loadPageShared(HTML);
  await joinLobby(g2, code, '阿丙');
  await waitFor(() => (g2.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿客'), 60000, 'g2 sees g1');
  click(host.w, host.D.querySelector('[data-launch="sudoku-coop"]'));
  await waitFor(() => roomEl(host), 180000, 'host room');
  await waitFor(() => roomEl(g1), 180000, 'g1 room');
  await waitFor(() => roomEl(g2), 180000, 'g2 room');
  await sleep(6000); // 等房主生成題目完成，避免生成競速干擾
  check('三人進等待室', true);
  // 💥 房主斷線：關閉房主 peer 的所有連線 + 從 broker 註銷 + 關頁
  host.w.eval(`(function(){ var reg = window.__SHARED_REG__; var hp = reg['${hostPid}']; if (hp && hp._conns) { Object.keys(hp._conns).forEach(function(k){ try { hp._conns[k].close(); } catch(e){} }); } })()`);
  delete SHARED_REG[hostPid];
  await sleep(300);
  host.w.close();
  // 等接管：阿客（roster 第一位來賓）升格 → 他的等待室名單應顯示自己為房主且阿丙在列；阿丙應重連回來
  let migOk = false;
  try {
    await waitFor(() => {
      const r1 = roomEl(g1); const r2 = roomEl(g2);
      if (!r1 || !r2) return false;
      const t1 = r1.textContent, t2 = r2.textContent;
      return t1.includes('阿客') && t1.includes('阿丙') && t2.includes('阿客') && t2.includes('阿丙');
    }, 90000, 'migration roster restore');
    migOk = true;
  } catch (e) {
    console.log('g1 room:', roomEl(g1) ? roomEl(g1).textContent.replace(/\s+/g, ' ') : '(none)');
    console.log('g2 room:', roomEl(g2) ? roomEl(g2).textContent.replace(/\s+/g, ' ') : '(none)');
    console.log('g1 lobby:', (g1.D.querySelector('#lob-roster') || { textContent: '' }).textContent.replace(/\s+/g, ' '));
    console.log('g2 lobby:', (g2.D.querySelector('#lob-roster') || { textContent: '' }).textContent.replace(/\s+/g, ' '));
  }
  check('房主斷線後阿客接管、阿丙回座（名單恢復）', migOk);
  if (migOk) {
    // 取樣器：記錄兩端數獨畫面關鍵字變化
    const sampler = setInterval(() => {
      const t1 = (g1.D.querySelector('#view-sudoku') || { textContent: '' }).textContent.replace(/\s+/g, ' ').slice(0, 160);
      const t2 = (g2.D.querySelector('#view-sudoku') || { textContent: '' }).textContent.replace(/\s+/g, ' ').slice(0, 160);
      console.log('[sample] g1:', t1);
      console.log('[sample] g2:', t2);
    }, 4000);
    setTimeout(() => clearInterval(sampler), 45000);
    // 新房主阿客按準備、阿丙按準備 → 全員準備 → 雙方進遊戲
    // 點準備（重試直到自己的狀態變已準備，避免 jsdom 重繪換節點造成點擊落空）
    async function readyUp(pg, label) {
      for (let i = 0; i < 6; i++) {
        const btn = pg.D.querySelector('#view-sudoku [data-pr="ready"]');
        if (!btn) return true; // 房間已關閉＝已進遊戲
        click(pg.w, btn);
        await sleep(900);
        const ctl = (pg.D.querySelector('#view-sudoku [data-pr-region="controls"]') || { textContent: '' }).textContent;
        if (ctl.includes('✅ 已準備') || !roomEl(pg)) { console.log(label, 'ready ok (try', i + 1, ')'); return true; }
      }
      console.log(label, 'ready FAILED after retries; controls:', (pg.D.querySelector('#view-sudoku [data-pr-region="controls"]') || { textContent: '' }).textContent.replace(/\s+/g, ' '));
      console.log(label, 'roster:', roomEl(pg) ? roomEl(pg).textContent.replace(/\s+/g, ' ') : '(gone)');
      return false;
    }
    // 探針：監看新房主送出的遊戲訊息（PLAYERS_UPDATE / SYNC）
    g1.w.eval(`(function(){ var reg = window.__SHARED_REG__; var hp = reg['${hostPid}']; if (hp && hp._conns) { Object.keys(hp._conns).forEach(function(k){ var c = hp._conns[k]; if (c.__spied) return; c.__spied = true; var orig = c.send.bind(c); c.send = function(d){ try { if (d && d.type) console.log('[g1-send]', d.type, d.type === 'PLAYERS_UPDATE' ? d.players.map(function(p){ return p.name + ':' + p.isReady; }).join(',') : (d.type === 'SYNC' ? ('phase=' + (d.data && d.data.matchPhase)) : '')); } catch(e){} return orig(d); }; }); } })()`);
    await readyUp(g1, 'g1');
    await readyUp(g2, 'g2');
    let g1Cd = false, g2Cd = false, g1Gone = 0, g2Gone = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 40000) {
      const c1 = g1.D.querySelector('#plat-countdown'); if (c1 && c1.style.display === 'flex') g1Cd = true;
      const c2 = g2.D.querySelector('#plat-countdown'); if (c2 && c2.style.display === 'flex') g2Cd = true;
      if (!g1Gone && !roomEl(g1)) g1Gone = Date.now() - t0;
      if (!g2Gone && !roomEl(g2)) g2Gone = Date.now() - t0;
      if (g1Gone && g2Gone) break;
      await sleep(80);
    }
    console.log('post-migration start: g1Cd=' + g1Cd, 'g2Cd=' + g2Cd, 'g1Gone=' + g1Gone, 'g2Gone=' + g2Gone);
    check('接管後新房主看到倒數', g1Cd);
    check('接管後阿丙看到倒數', g2Cd);
    check('接管後雙方進入遊戲', g1Gone > 0 && g2Gone > 0);
  }
  check('零錯誤（g1+g2）', g1.errors.length === 0 && g2.errors.length === 0);
  report([...g1.errors, ...g2.errors]);
  g1.w.close(); g2.w.close();
})().catch((e) => { console.error('FATAL', e); report([]); process.exitCode = 1; });
