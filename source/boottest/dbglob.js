const { loadPage, sleep, waitFor, click } = require('./harness');
(async () => {
  const { w, D, errors } = loadPage('/home/hatch/workspace/platform/platform-v1-test.html');
  await waitFor(() => typeof w.PLAT_show === 'function' && w.PlatDock, 600000, 'shell');
  const st = (t) => console.log(t, '| entry:', D.querySelector('#lob-step-entry').style.display, '| nick:', D.querySelector('#lob-step-nick').style.display, '| room:', (D.querySelector('#lob-room') || {}).style ? D.querySelector('#lob-room').style.display : '?', '| code:', JSON.stringify((D.querySelector('#lob-code') || {}).textContent || ''));
  st('before');
  click(w, D.querySelector('#lob-go-create'));
  await sleep(1500); st('after create');
  const inp = D.querySelector('#lob-name');
  const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set;
  setter.call(inp, '阿主'); inp.dispatchEvent(new w.Event('input', { bubbles: true }));
  click(w, D.querySelector('#lob-confirm'));
  await sleep(2500); st('after confirm');
  console.log('errors:', errors.filter(e => !/scrollTo/.test(e)).slice(0, 3));
  w.close();
})().catch((e) => { console.error('FATAL', e); process.exitCode = 1; });
