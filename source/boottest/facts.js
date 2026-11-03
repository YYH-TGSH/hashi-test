const WebSocket = require('ws');
const http = require('http');
function getJson(path) { return new Promise((resolve, reject) => { http.get({ host: '127.0.0.1', port: 9223, path }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))); }).on('error', reject); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const targets = await getJson('/json/list');
  const target = targets.find(t => t.type === 'page' && (t.url || '').includes('8914'));
  if (!target) { console.log('NO TARGET'); process.exit(1); }
  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pending = new Map();
  const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
  ws.on('message', raw => { const msg = JSON.parse(raw); if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result); } });
  await new Promise(r => ws.on('open', r));
  await send('Runtime.enable');
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) return null; return r.result.value; };
  for (let i = 0; i < 15; i++) {
    const facts = await ev(`(() => {
      const hv = document.querySelector('#view-hashi');
      if (!hv) return null;
      const svgs = [...hv.querySelectorAll('svg')];
      const svg = svgs.find(s => (s.getAttribute('viewBox') || '').indexOf('0 0 ') === 0 && parseFloat((s.getAttribute('viewBox') || '0 0 0').split(' ')[2]) > 500);
      if (!svg) return 'svgs=' + svgs.map(s => s.getAttribute('viewBox')).join(',');
      const wrap = svg.parentElement, cont = wrap.parentElement;
      const sr = svg.getBoundingClientRect(), cr = cont.getBoundingClientRect();
      return JSON.stringify({ innerW: innerWidth, contClientW: cont.clientWidth, contScrollW: cont.scrollWidth, svgW: Math.round(sr.width), rightGap: Math.round(cr.x + cr.width - (sr.x + sr.width)), overflowX: cont.scrollWidth - cont.clientWidth });
    })()`);
    console.log('try', i, facts);
    if (facts && facts.startsWith('{')) break;
    await sleep(4000);
  }
  ws.close(); process.exit(0);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
