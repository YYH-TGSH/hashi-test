const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
let html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
let mock = require('./mockpeer.js');
html = html.replace('<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>', () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const SHARED_REG = {};
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errs.push(m); });
vc.on('error', m => errs.push(String(m)));
const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) { w.__SHARED_REG__ = SHARED_REG; w.scrollTo = () => {}; w.addEventListener('error', e => { if (e.message && !/Script error/.test(e.message)) errs.push(e.message); }); } });
const w = dom.window, D = w.document;
const clickEl = (el) => { if (el) el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); return !!el; };
function setInput(el, val) { const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set; setter.call(el, val); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); }
(async () => {
  for (let i = 0; i < 200 && !(typeof w.PLAT_show === 'function' && w.PlatDock); i++) await sleep(300);
  console.log('shell ready:', typeof w.PLAT_show, !!w.PlatDock);
  console.log('go-create exists:', !!D.querySelector('#lob-go-create'));
  clickEl(D.querySelector('#lob-go-create'));
  await sleep(1500);
  const nick = D.querySelector('#lob-step-nick');
  console.log('nick display:', nick && nick.style.display);
  setInput(D.querySelector('#lob-name'), '阿主');
  clickEl(D.querySelector('#lob-confirm'));
  for (let i = 0; i < 40; i++) {
    await sleep(1000);
    const code = D.querySelector('#lob-room-code');
    const room = D.querySelector('#lob-step-room');
    if (i % 5 === 0 || (code && (code.textContent || '').trim().length === 4)) console.log('t=' + i + 's code=', code ? JSON.stringify((code.textContent || '').trim()) : 'NO-EL', '| room display:', room && room.style.display, '| errs:', errs.length);
    if (code && (code.textContent || '').trim().length === 4) break;
  }
  console.log('errors:', JSON.stringify(errs.slice(0, 5)));
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
