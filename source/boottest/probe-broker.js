// 直接探測 PeerJS 雲端 broker：註冊新 peer + 嘗試連線到 yyh-tgsh-2242-host
const WebSocket = require('ws');
function reg(id) {
  return new Promise((resolve) => {
    const url = 'wss://0.peerjs.com/peerjs?key=peerjs&id=' + encodeURIComponent(id) + '&token=t' + Math.random().toString(36).slice(2, 8);
    const ws = new WebSocket(url);
    const to = setTimeout(() => { try { ws.terminate(); } catch (e) {} resolve({ id, result: 'TIMEOUT 12s 無回應' }); }, 12000);
    ws.on('message', (m) => {
      const d = JSON.parse(m.toString());
      if (d.type === 'OPEN') { clearTimeout(to); resolve({ id, result: 'OPEN ✅ 已註冊', ws }); }
    });
    ws.on('error', (e) => { clearTimeout(to); resolve({ id, result: 'ERROR ' + e.message }); });
  });
}
(async () => {
  const a = await reg('probe-a-' + Math.random().toString(36).slice(2, 6));
  console.log('新 peer 註冊:', a.result);
  if (!a.ws) { process.exit(0); }
  // 用 a 對房主 id 發 OFFER，觀察 broker 回應（EXPIRE=對方不在；無錯誤=可能送達）
  const offer = { type: 'OFFER', dst: 'yyh-tgsh-2242-host', payload: { sdp: { type: 'offer', sdp: 'x' }, type: 'data', connectionId: 'probe-conn-1', metadata: {}, reliable: false } };
  a.ws.send(JSON.stringify(offer));
  const got = await new Promise((resolve) => {
    const to = setTimeout(() => resolve('12s 內 broker 無任何回應'), 12000);
    a.ws.on('message', (m) => { const d = JSON.parse(m.toString()); if (d.type !== 'OPEN') { clearTimeout(to); resolve('broker 回應: ' + m.toString().slice(0, 200)); } });
  });
  console.log('對 2242 房主發信令:', got);
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
