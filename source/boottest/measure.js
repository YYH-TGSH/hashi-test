// CDP 量測：數橋 10x10 盤面在 390 寬下的實際幾何
const WebSocket = require('ws');
const http = require('http');
function getJson(path) { return new Promise((resolve, reject) => { http.get({ host: '127.0.0.1', port: 9223, path }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))); }).on('error', reject); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const targets = await getJson('/json/list');
  const target = targets.find(t => t.type === 'page' && (t.url || '').includes('127.0.0.1:8913')) || targets.find(t => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pending = new Map();
  const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
  ws.on('message', raw => { const msg = JSON.parse(raw); if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result); } });
  await new Promise(r => ws.on('open', r));
  await send('Page.enable'); await send('Runtime.enable');
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) { console.log('EVAL-ERR', JSON.stringify(r.exceptionDetails).slice(0, 200), 'EXPR', expr.slice(0, 60)); return null; } return r.result.value; };
  await sleep(3000);
  // 等殼就緒
  for (let i = 0; i < 60 && !(await ev(`typeof window.PLAT_show === 'function'`)); i++) await sleep(1000);
  await ev(`PLAT_show('hashi')`);
  for (let i = 0; i < 90 && !(await ev(`((document.querySelector('#view-hashi')||{}).textContent||'').includes('每日一題')`)); i++) await sleep(1000);
  console.log('hashi home ok');
  await ev(`[...document.querySelectorAll('#view-hashi button')].find(b => (b.textContent||'').includes('每日一題')).click()`);
  await sleep(5000);
  const facts = await ev(`(() => {
    const hv = document.querySelector('#view-hashi');
    const svg = [...hv.querySelectorAll('svg')].find(s => (s.getAttribute('viewBox') || '').startsWith('0 0 755'));
    if (!svg) return 'NO BOARD SVG; svgs=' + [...hv.querySelectorAll('svg')].map(s => s.getAttribute('viewBox')).join(',');
    const wrap = svg.parentElement, cont = wrap.parentElement;
    const sr = svg.getBoundingClientRect(), cr = cont.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
    return JSON.stringify({
      inner: [innerWidth, innerHeight],
      contClient: [cont.clientWidth, cont.clientHeight], contScroll: [cont.scrollWidth, cont.scrollHeight], contRectX: Math.round(cr.x), contRectW: Math.round(cr.width),
      wrapClient: wrap.clientWidth, wrapScroll: wrap.scrollWidth, wrapRectW: Math.round(wr.width),
      svgRect: [Math.round(sr.x), Math.round(sr.width)], svgStyleW: svg.style.width,
      svgRightGap: Math.round(cr.x + cr.width - (sr.x + sr.width)),
      docScrollW: document.documentElement.scrollWidth
    });
  })()`);
  console.log('FACTS', facts);
  ws.close(); process.exit(0);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
