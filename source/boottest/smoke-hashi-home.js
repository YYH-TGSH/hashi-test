const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
let html = fs.readFileSync('/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
let mock = require('./mockpeer.js');
html = html.replace('<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>', () => '<script>' + mock + '</scr' + 'ipt>');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(300); } console.log('  (timeout: ' + label + ')'); return null; }
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => { const m = String((e.detail && e.detail.message) || e.message || e); if (!/scrollTo|getContext|Not implemented|Could not parse CSS|Could not load/i.test(m)) errs.push(m); });
const dom = new JSDOM(html, { url: 'https://localhost/', resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) { w.__SHARED_REG__ = {}; w.scrollTo = () => {}; w.addEventListener('error', e => { if (e.message && !/Script error/.test(e.message)) errs.push(e.message); }); } });
const { window } = dom; const document = window.document;
(async () => {
  await waitFor(() => typeof window.PLAT_show === 'function' ? true : null, 60000, 'shell ready');
  window.PLAT_show('hashi');
  const home = await waitFor(() => { const v = document.querySelector('#view-hashi'); const t = v ? v.textContent : ''; return (t.includes('單機挑戰')) ? v : null; }, 90000, 'hashi home');
  let pass = 0, fail = 0;
  const check = (n, c) => { if (c) { pass++; console.log('✅ ' + n); } else { fail++; console.log('❌ ' + n); } };
  check('數橋主頁有載入', !!home); if (!home) console.log('view-hashi text head:', (document.querySelector('#view-hashi') || {}).textContent?.slice(0, 200)); else console.log('buttons:', JSON.stringify([...home.querySelectorAll('button')].map(b => (b.textContent || '').trim()).slice(0, 10)));
  if (home) {
    const btns = [...home.querySelectorAll('button')].map(b => (b.textContent || '').trim());
    check('多人合作鈕已移除', !btns.some(t => t.includes('多人合作')), JSON.stringify(btns));
    check('單機挑戰還在', btns.some(t => t.includes('單機挑戰')));
    check('每日一題還在', btns.some(t => t.includes('每日一題')));
    check('玩法說明還在', btns.some(t => t.includes('玩法說明')));
    check('回大廳還在', btns.some(t => t.includes('回大廳')));
    // 玩法說明卡文字已改指平台主畫面
    const helpBtn = [...home.querySelectorAll('button')].find(b => (b.textContent || '').includes('玩法說明'));
    helpBtn && helpBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await sleep(800);
    let foundCard = false;
    for (let i = 0; i < 7 && !foundCard; i++) {
      if ((document.body.textContent || '').includes('從平台主畫面進入多人連線')) { foundCard = true; break; }
      const nx = [...document.querySelectorAll('button')].find(b => (b.textContent || '').trim() === '下一步');
      if (!nx) break;
      nx.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      await sleep(500);
    }
    check('說明卡改指平台主畫面', foundCard);
    check('舊文字已消失', !(document.body.textContent || '').includes('從主選單進入「多人合作」'));
  }
  check('零錯誤', errs.length === 0, errs.slice(0, 2).join(' | '));
  console.log('RESULT: ' + pass + ' pass, ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
