const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const mockSrc = require('./mockpeer.js');
const storeMap = new Map();
const storage = { getItem: k => (storeMap.has(String(k)) ? storeMap.get(String(k)) : null), setItem: (k, v) => storeMap.set(String(k), String(v)), removeItem: k => storeMap.delete(String(k)), clear: () => storeMap.clear(), key: i => [...storeMap.keys()][i] || null, get length() { return storeMap.size; } };
let html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
html = html.replace(/<script[^>]+src="[^"]*peerjs[^"]*"[^>]*><\/script>/, '<script>' + mockSrc + '</script>');
const vc = new VirtualConsole(); vc.on('error', m => console.log('[vc]', m)); vc.on('jsdomError', e => console.log('[jsdomError]', String(e.detail && e.detail.message || e.message).slice(0,120)));
const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(window) {
    window.__SHARED_REG__ = {};
    try { Object.defineProperty(window, 'localStorage', { configurable: true, value: storage }); console.log('override ok'); } catch (e) { console.log('override FAIL', e.message); }
    window.fetch = (url, opts) => fetch(new URL(url, window.location.href).href, opts);
    window.scrollTo = () => {};
  } });
const w = dom.window;
setTimeout(() => {
  console.log('PLAT_show:', typeof w.PLAT_show, '| PlatDock:', !!w.PlatDock, '| LS test:', (() => { try { w.localStorage.setItem('x', '1'); return w.localStorage.getItem('x'); } catch (e) { return 'ERR ' + e.message; } })());
  process.exit(0);
}, 20000);
