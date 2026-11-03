const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const BUNDLE = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
const MOCK = require('./mockpeer.js');
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM(BUNDLE, { url: 'https://localhost/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) { w.__SHARED_REG__ = {}; w.eval(MOCK); w.scrollTo = () => {}; } });
const w = dom.window, D = w.document;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  for (let i = 0; i < 40 && typeof w.PLAT_show !== 'function'; i++) await sleep(250);
  w.PLAT_show('sudoku');
  for (let i = 0; i < 40 && D.querySelectorAll('#sudoku-root > *').length === 0; i++) await sleep(250);
  await sleep(1500);
  const keys = [];
  for (let i = 0; i < w.localStorage.length; i++) keys.push(w.localStorage.key(i));
  console.log('root kids:', D.querySelectorAll('#sudoku-root > *').length);
  console.log('localStorage keys:', JSON.stringify(keys));
  console.log('plat_uid_sudoku =', w.localStorage.getItem('plat_uid_sudoku'));
  process.exit(0);
})();
