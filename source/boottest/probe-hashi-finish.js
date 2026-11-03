// 探針：數橋來賓「真的解完一盤」後，完賽畫面（PlatResults 等待態）有沒有跳出來
// jsdom 沒有 createSVGPoint/getScreenCTM——在棋盤 svg 上打樁成恆等座標，才能模擬拖曳架橋
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
const { sleep, waitFor, click } = require('./harness');
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
function pev(w, el, type, x, y) { const e = new w.Event(type, { bubbles: true, cancelable: true }); e.clientX = x; e.clientY = y; e.isPrimary = true; e.pointerId = 7; e.pointerType = 'mouse'; e.button = 0; e.buttons = (type === 'pointerup' ? 0 : 1); el.dispatchEvent(e); }
// ---- Hashi solver ----
function solveHashi(islands) {
  const pairs = [];
  for (let i = 0; i < islands.length; i++) for (let j = i + 1; j < islands.length; j++) {
    const a = islands[i], b = islands[j];
    if (a.gx !== b.gx && a.gy !== b.gy) continue;
    const between = islands.some(k => k !== a && k !== b && ((a.gx === b.gx && k.gx === a.gx && k.gy > Math.min(a.gy, b.gy) && k.gy < Math.max(a.gy, b.gy)) || (a.gy === b.gy && k.gy === a.gy && k.gx > Math.min(a.gx, b.gx) && k.gx < Math.max(a.gx, b.gx))));
    if (!between) pairs.push([i, j]);
  }
  const crosses = (p, q) => {
    const [a, b] = [islands[p[0]], islands[p[1]]], [c, d] = [islands[q[0]], islands[q[1]]];
    const h1 = a.gy === b.gy, h2 = c.gy === d.gy;
    if (h1 === h2) return false;
    const H = h1 ? [a, b] : [c, d], V = h1 ? [c, d] : [a, b];
    return V[0].gx > Math.min(H[0].gx, H[1].gx) && V[0].gx < Math.max(H[0].gx, H[1].gx) && H[0].gy > Math.min(V[0].gy, V[1].gy) && H[0].gy < Math.max(V[0].gy, V[1].gy);
  };
  const counts = new Array(pairs.length).fill(0);
  const sums = islands.map(() => 0);
  const connected = () => {
    const adj = islands.map(() => []);
    pairs.forEach(([i, j], pi) => { if (counts[pi] > 0) { adj[i].push(j); adj[j].push(i); } });
    const seen = new Set([0]); const q = [0];
    while (q.length) { const u = q.shift(); adj[u].forEach(v => { if (!seen.has(v)) { seen.add(v); q.push(v); } }); }
    return seen.size === islands.length;
  };
  const dfs = (pi) => {
    if (pi === pairs.length) return sums.every((s, i) => s === islands[i].req) && connected();
    const [i, j] = pairs[pi];
    for (let c = 0; c <= 2; c++) {
      if (sums[i] + c > islands[i].req || sums[j] + c > islands[j].req) continue;
      if (c > 0) { let bad = false; for (let q = 0; q < pi; q++) if (counts[q] > 0 && crosses(pairs[pi], pairs[q])) { bad = true; break; } if (bad) continue; }
      counts[pi] = c; sums[i] += c; sums[j] += c;
      if (dfs(pi + 1)) return true;
      counts[pi] = 0; sums[i] -= c; sums[j] -= c;
    }
    return false;
  };
  if (!dfs(0)) return null;
  return pairs.map(([i, j], pi) => ({ a: islands[i], b: islands[j], count: counts[pi] })).filter(x => x.count > 0);
}
(async () => {
  // ---- 開房＋進數橋大亂鬥（同 test-results 的穩健開局）----
  const host = loadPageShared(HTML);
  await waitFor(() => typeof host.w.PLAT_show === 'function' && host.w.PlatDock, 600000, 'host shell');
  click(host.w, host.D.querySelector('#lob-go-create'));
  await waitFor(() => host.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'host nick');
  setInput(host.w, host.D.querySelector('#lob-name'), '阿主');
  click(host.w, host.D.querySelector('#lob-confirm'));
  await waitFor(() => (host.D.querySelector('#lob-room-code') || { textContent: '' }).textContent.trim().length === 4, 60000, 'host room');
  const code = host.D.querySelector('#lob-room-code').textContent.trim();
  const guest = loadPageShared(HTML);
  await waitFor(() => typeof guest.w.PLAT_show === 'function' && guest.w.PlatDock, 600000, 'guest shell');
  click(guest.w, guest.D.querySelector('#lob-go-join'));
  await waitFor(() => guest.D.querySelector('#lob-step-nick').style.display === 'block', 60000, 'guest nick');
  setInput(guest.w, guest.D.querySelector('#lob-name'), '阿客');
  setInput(guest.w, guest.D.querySelector('#lob-code'), code);
  click(guest.w, guest.D.querySelector('#lob-confirm'));
  await waitFor(() => (guest.D.querySelector('#lob-roster') || { textContent: '' }).textContent.includes('阿主'), 60000, 'guest in room');
  click(host.w, host.D.querySelector('[data-launch="hashi-brawl"]'));
  await waitFor(() => host.D.querySelector('#view-hashi [data-pr-region="roster"]') && guest.D.querySelector('#view-hashi [data-pr-region="roster"]'), 120000, 'rooms');
  await sleep(1200);
  const setSel = (w, s, v) => { const setter = Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype, 'value').set; setter.call(s, v); s.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const lvSel = [...host.D.querySelectorAll('#view-hashi [data-pr-slot="settings"] select')].find(s => [...s.options].some(o => String(o.value) === '1'));
  if (lvSel) setSel(host.w, lvSel, '1');
  await sleep(800);
  click(host.w, host.D.querySelector('#view-hashi [data-pr="ready"]'));
  await sleep(700);
  click(guest.w, guest.D.querySelector('#view-hashi [data-pr="ready"]'));
  const en = await waitFor(() => { const sb = host.D.querySelector('#view-hashi [data-pr="start"]'); return sb && !sb.disabled; }, 90000, 'start enabled');
  if (en) click(host.w, host.D.querySelector('#view-hashi [data-pr="start"]'));
  const racing = await waitFor(() => !host.D.querySelector('#view-hashi [data-pr-region="roster"]') && !guest.D.querySelector('#view-hashi [data-pr-region="roster"]'), 90000, 'racing');
  console.log('racing:', !!racing);
  await waitFor(() => { const cd = guest.D.querySelector('#plat-countdown'); return !cd || cd.style.display !== 'flex'; }, 30000, 'cd over');
  await sleep(1500);
  // ---- 來賓端：找棋盤 svg、打樁、讀島嶼、解題 ----
  const svgs = [...guest.D.querySelectorAll('#view-hashi svg')];
  const board = svgs.find(s => [...s.querySelectorAll('text')].some(t => /^[1-8]$/.test((t.textContent || '').trim())));
  console.log('board svg found:', !!board, '| total svgs:', svgs.length);
  board.createSVGPoint = () => { const p = { x: 0, y: 0, matrixTransform: () => ({ x: p.x, y: p.y }) }; return p; };
  board.getScreenCTM = () => ({ inverse: () => ({}) });
  const islands = [];
  board.querySelectorAll('g').forEach(g => {
    const t = [...g.querySelectorAll('text')].find(x => /^[1-8]$/.test((x.textContent || '').trim()));
    if (!t) return;
    const cx = parseFloat(t.getAttribute('x')), cy = parseFloat(t.getAttribute('y')) - 2;
    islands.push({ g, cx, cy, gx: Math.round((cx - 85) / 65), gy: Math.round((cy - 85) / 65), req: parseInt(t.textContent, 10) });
  });
  console.log('islands:', islands.length, JSON.stringify(islands.map(i => [i.gx, i.gy, i.req])));
  console.log('all g texts:', JSON.stringify([...board.querySelectorAll('g')].map(g => { const ts = [...g.querySelectorAll('text')].map(t => t.textContent); return ts.join('|'); }).filter(x => x)));
  const sol = solveHashi(islands);
  console.log('solution bridges:', sol ? sol.length : null);
  if (!sol) { console.log('SOLVE FAILED'); process.exit(1); }
  // ---- 拖曳架橋（每次手勢前重查節點＋重打樁，避免節點被重繪換掉）----
  const freshBoard = () => { const s = [...guest.D.querySelectorAll('#view-hashi svg')].find(x => [...x.querySelectorAll('text')].some(t => /^[1-8]$/.test((t.textContent || '').trim()))); if (s) { s.createSVGPoint = () => { const p = { x: 0, y: 0, matrixTransform: () => ({ x: p.x, y: p.y }) }; return p; }; s.getScreenCTM = () => ({ inverse: () => ({}) }); } return s; };
  const freshIslandG = (isl) => { const s = freshBoard(); if (!s) return null; let found = null; s.querySelectorAll('g').forEach(g => { const t = [...g.querySelectorAll('text')].find(x => /^[1-8]$/.test((x.textContent || '').trim())); if (!t) return; const cx = parseFloat(t.getAttribute('x')), cy = parseFloat(t.getAttribute('y')) - 2; if (Math.round((cx - 85) / 65) === isl.gx && Math.round((cy - 85) / 65) === isl.gy) found = g; }); return found; };
  let firstDrag = true;
  for (const br of sol) {
    for (let k = 0; k < br.count; k++) {
      const bd = freshBoard(); const gA = freshIslandG(br.a);
      console.log('drag', br.a.gx + ',' + br.a.gy, '->', br.b.gx + ',' + br.b.gy, '| board connected:', !!(bd && bd.isConnected), '| gA connected:', !!(gA && gA.isConnected));
      if (!bd || !gA) continue;
      pev(guest.w, gA, 'pointerdown', br.a.cx, br.a.cy);
      await sleep(300);
      if (firstDrag) { console.log('after pointerdown: hover highlight in gA:', (gA.innerHTML || '').includes('fde047')); firstDrag = false; }
      pev(guest.w, bd, 'pointermove', (br.a.cx + br.b.cx) / 2, (br.a.cy + br.b.cy) / 2);
      await sleep(60);
      pev(guest.w, bd, 'pointermove', br.b.cx, br.b.cy);
      await sleep(60);
      pev(guest.w, bd, 'pointerup', br.b.cx, br.b.cy);
      await sleep(220);
      console.log('svg lines now:', bd.querySelectorAll('line').length, '| svg children:', bd.childElementCount);
    }
  }
  await sleep(2500);
  // 讀回橋樑：line 端點 → 島嶼對，比對解法
  const bd2 = freshBoard();
  const segSet = {};
  bd2.querySelectorAll('line').forEach(L => {
    const x1 = parseFloat(L.getAttribute('x1')), y1 = parseFloat(L.getAttribute('y1')), x2 = parseFloat(L.getAttribute('x2')), y2 = parseFloat(L.getAttribute('y2'));
    if (isNaN(x1) || (x1 === x2 && y1 === y2)) return;
    const key = [x1, y1, x2, y2].join(',');
    segSet[key] = (segSet[key] || 0) + 1;
  });
  console.log('line segments:', JSON.stringify(segSet));
  console.log('expected:', JSON.stringify(sol.map(br => ({ a: [br.a.gx, br.a.gy], b: [br.b.gx, br.b.gy], c: br.count }))));
  const pres = guest.D.querySelector('#plat-results');
  console.log('GUEST #plat-results:', !!pres, 'display:', pres && pres.style.display, '| text:', pres ? pres.textContent.slice(0, 80) : '');
  console.log('GUEST toast seen:', (guest.D.querySelector('#view-hashi') || { textContent: '' }).textContent.includes('你完成了'));
  const presH = host.D.querySelector('#plat-results');
  console.log('HOST #plat-results:', !!presH, 'display:', presH && presH.style.display);
  console.log('errors H/G:', host.errors.length, guest.errors.length, JSON.stringify(guest.errors.slice(0, 2)));
  process.exit(0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
