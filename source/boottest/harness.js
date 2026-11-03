const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
function loadPage(htmlPath) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/<script[^>]+src="[^"]*peerjs[^"]*"[^>]*><\/script>/, '<script>' + mockSrc + '</script>');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errors.push(m); });
  vc.on('error', (m) => errors.push(String(m)));
  const dom = new JSDOM(html, {
    url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(window) {
      window.fetch = (url, opts) => fetch(new URL(url, window.location.href).href, opts);
      window.scrollTo = () => {};
    },
  });
  const w = dom.window;
  w.addEventListener('error', (e) => { if (e.message && !/Script error/.test(e.message)) errors.push(e.message); });
  return { w, D: w.document, errors };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, ms, label) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (_) {} await sleep(300); }
  console.log('  (waitFor timeout: ' + label + ')');
  return null;
}
function click(w, el) { if (el) el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true })); return !!el; }
function dblclick(w, el) { if (el) el.dispatchEvent(new w.MouseEvent('dblclick', { bubbles: true, cancelable: true })); return !!el; }
function findBtn(D, text, scope) { const s = scope ? D.querySelector(scope) : D; if (!s) return null; return [...s.querySelectorAll('button')].find((b) => (b.textContent || '').includes(text)) || null; }
let pass = 0, fail = 0;
function check(name, ok, extra) { if (ok) { pass++; console.log('✅ ' + name + (extra ? ' — ' + extra : '')); } else { fail++; console.log('❌ ' + name + (extra ? ' — ' + extra : '')); } }
function report(errors) { console.log('ERRORS:', errors.length ? errors.slice(0, 6).join(' | ') : '(none)'); console.log(`RESULT: ${pass} pass, ${fail} fail`); }
module.exports = { loadPage, sleep, waitFor, click, dblclick, findBtn, check, report };
