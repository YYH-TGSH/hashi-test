// 平台殼：畫面切換 + 遊戲啟動（兩款 app 已由 build 預先編譯，點進去直接執行）
(function () {
  var booted = { sudoku: false, hashi: false };
  var statusEl = null;
  function status(msg) {
    if (!statusEl) statusEl = document.getElementById('plat-status-body');
    if (statusEl) { var d = document.createElement('div'); d.textContent = msg; statusEl.appendChild(d); }
  }
  window.__PLAT_status = status;
  window.addEventListener('error', function (e) {
    status('❌ error: ' + (e.message || e.type));
  });
  window.addEventListener('unhandledrejection', function (e) {
    status('❌ rejection: ' + (e.reason && e.reason.message ? e.reason.message : e.reason));
  });
  function ensureBoundary() {
    if (window.PlatBoundary || !window.React) return;
    window.PlatBoundary = class extends React.Component {
      constructor(p) { super(p); this.state = { err: null }; }
      static getDerivedStateFromError(e) { return { err: e }; }
      componentDidCatch(e, info) {
        status('❌ 渲染錯誤本名: ' + (e && e.message ? e.message : e));
        if (e && e.stack) status('stack: ' + e.stack.split('\n').slice(0, 3).join(' | ').slice(0, 320));
      }
      render() { return this.state.err ? null : this.props.children; }
    };
  }
  function loadCode(name, cb) {
    var el = document.getElementById('code-' + name);
    if (el) { cb(el.textContent); return; }
    fetch('js/' + name + '/app.compiled.js').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(cb).catch(function (e) {
      booted[name] = false;
      status('❌ 載入 ' + name + ' 程式失敗: ' + e.message);
    });
  }
  function boot(name) {
    if (booted[name]) { status(name + ' 已啟動過（略過）'); return; }
    if (!(window.React && window.ReactDOM)) {
      if (!boot['w_' + name]) { boot['w_' + name] = 1; status('⏳ 等函式庫（React）載入完成…'); }
      if ((boot['w_' + name] || 0) > 40) { status('❌ 函式庫載入逾時，可能是網路問題'); return; }
      boot['w_' + name] = (boot['w_' + name] || 0) + 1;
      setTimeout(function () { boot(name); }, 500);
      return;
    }
    booted[name] = true;
    var t0 = Date.now();
    ensureBoundary();
    loadCode(name, function (src) {
      try {
        status('▶ 啟動 ' + name + '（程式 ' + Math.round(src.length / 1024) + 'KB）…');
        new Function(src)();
        status('▶ ' + name + ' 執行完成 ' + (Date.now() - t0) + 'ms，檢查掛載…');
        setTimeout(function () {
          var root = document.getElementById(name + '-root');
          var n = root ? root.childElementCount : -1;
          status((n > 0 ? '✅ ' : '❌ ') + name + ' 掛載子元素: ' + n);
        }, 1200);
      } catch (e) {
        booted[name] = false;
        status('❌ ' + name + ' 執行例外: ' + (e && e.message ? e.message : e));
      }
    });
  }
  // （v1.8.0 起）左上角「🏠 平台」鈕已移除：回大廳改由兩款遊戲主畫面最下方的藍色大按鈕擔任（使用者指定）
  var currentView = 'home';
  window.PLAT_show = function (name) {
    // v1.8.1：房間進行中要求看「大廳」＝回等待室（多人連線選單頁不再出現）；doLaunch 在下方才定義，這裡只在執行期引用
    if (name === 'lobby' && typeof Net !== 'undefined') {
      var fromView = document.body.getAttribute('data-view');
      if ((fromView === 'sudoku' || fromView === 'hashi') && !Net.inMatch) Net.armed.game = fromView; // 從哪款按多人連線就進哪款的大廳
      if (Net.active) {
        if (Net.inMatch) { window.PLAT_show(Net.inMatch); return; }
        doLaunch(Net.armed.game, Net.armed.mode); return; // 直接進遊戲大廳（等待室），不停選單頁
      }
    }
    currentView = name;
    ['home', 'sudoku', 'hashi', 'lobby'].forEach(function (v) {
      document.getElementById('view-' + v).classList.toggle('active', v === name);
    });
    document.body.setAttribute('data-view', name);
    if (typeof updateDock === 'function') updateDock();
    if (name === 'sudoku' || name === 'hashi') {
      try { boot(name); } catch (e) { status('❌ ' + name + ' 啟動例外: ' + (e && e.message ? e.message : e)); }
    }
    window.scrollTo(0, 0);
  };
  status('殼就緒。點上面的遊戲按鈕開始。');
})();

// ==================== Phase C：共用連線（PlatNet） ====================
// 殼持有唯一的 RealPeer 連線：大廳/名單/聊天/視訊都在殼層；
// 遊戲透過 PlatPeer shim 共用同一條連線進多人（訊息以 __plat 信封與遊戲訊息多工）。
(function () {
  var RealPeer = window.Peer;
  window.__RealPeer = RealPeer;
  window.__PLAT_PLATFORM = true;
  var PLAT_VERSION = '1.9.5'; // 平台主版本（功能批 +0.1 尾碼歸零；小修 +0.0.1）——數獨/數橋的子版本號讀這個值
  window.PLAT_START_WAIT_MS = 60000; // 開始按鈕門檻（兩款共用單一來源）：全員準備，或等待室開滿此毫秒數（防掛機卡房）房主才能開始；測試可調
  // 連線設定：v1.7.1 回滾 v1.6.1 的 OpenRelay TURN——該組公開帳密已失效，死中繼反而讓交涉整體卡死（使用者實測：加了之後連原本能連的都連不上）。
  // 回到 PeerJS 預設（v1.6.0 以前的做法）：同區網/友善 NAT 直連。跨網路穿透需要有在運作的中繼服務（需註冊），使用者 2026-10-18 決定不註冊任何服務，此路暫擱置。
  window.PLAT_VERSION = PLAT_VERSION;

  var PLAT_COLORS = ['#E3002B', '#F35B00', '#FFC90E', '#D7157A', '#E895C0', '#007A61', '#87D300', '#C4D600', '#8DD1BF', '#616130', '#00538A', '#008CC1', '#00C1D5', '#79C8ED', '#CDBB79', '#41136A', '#935CB9', '#BCA8D1', '#7A0026', '#BC7B70'];
  var RAINBOW_BG = 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)';

  function $(id) { return document.getElementById(id); }
  function storeGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function storeSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function normName(s) { return (s || '').trim().toLowerCase(); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function myUid() { // 殼層持久身份：斷線重連/接管後仍是同一個人（賽程積分綁這個，不綁連線 pid）
    var u = storeGet('plat_uid');
    if (!u) { u = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9); storeSet('plat_uid', u); }
    return u;
  }
  var Net = {
    active: false, isHost: false, code: '', peer: null, myPid: '', hostPid: '', myUid: '',
    armed: { game: (function () { try { var g = localStorage.getItem('plat_armed_game'); return (g === 'hashi' || g === 'sudoku') ? g : 'sudoku'; } catch (e) { return 'sudoku'; } })(), mode: 'coop' }, armedByGame: { sudoku: 'coop', hashi: 'coop' }, roomTab: 'sudoku',
    me: { name: '', color: PLAT_COLORS[2] },
    roster: [], conns: {}, gamePeer: null, inMatch: null,
    lastSeen: {}, hostSeen: 0, _lastPing: 0, _hostWarned: false,
    presence: { pingMs: 10000, offlineMs: 25000, removeMs: 60000 }, // 在線心跳：10s ping、25s 標離線、60s 移除（比賽中只標離線不移除）
    videoOn: false, localStream: null, micMuted: true, speakerOn: false,
    remoteStreams: {}, remoteMic: {}, calls: {}, speakPrompted: {}, speakPid: null,
    chatOpen: false, chatMin: false, unread: 0, ending: false, joinRetry: false, tourn: null
  };
  window.__PLAT_NET = Net;

  var SLOT_NAMES = ['柴犬', '柯基', '虎斑貓', '橘貓', '倉鼠', '兔兔', '刺蝟', '龍貓', '水豚', '樹懶', '狐獴', '羊駝', '企鵝', '海獺', '貓頭鷹', '松鼠', '無尾熊', '台灣黑熊', '石虎', '穿山甲', '梅花鹿', '台灣藍鵲', '帝雉', '獼猴', '山羌', '綠蠵龜', '櫻花鉤吻鮭', '飛魚', '螢火蟲', '獨角仙'];
  var slotName = '', slotTimer = null;
  function spinSlot(cb) {
    if (slotTimer) return;
    var el = $('slot-display'); var t0 = Date.now();
    el.classList.add('slot-spinning');
    (function tick() {
      slotName = SLOT_NAMES[Math.floor(Math.random() * SLOT_NAMES.length)];
      el.textContent = slotName;
      var elapsed = Date.now() - t0;
      if (elapsed < 1150) slotTimer = setTimeout(tick, 50 + (elapsed / 1150) * 160);
      else {
        slotTimer = null;
        el.classList.remove('slot-spinning'); el.classList.add('slot-land');
        setTimeout(function () { el.classList.remove('slot-land'); }, 350);
        $('lob-name').value = slotName;
        if (cb) cb();
      }
    })();
  }

  // ---------- 訊息傳送 ----------
  Net.myUid = myUid();
  function platSend(conn, obj) { if (!conn) return; var m = { __plat: 1 }; for (var k in obj) m[k] = obj[k]; try { conn.send(m); } catch (e) {} }
  function platBroadcast(obj, exceptPid) {
    for (var pid in Net.conns) { if (pid !== exceptPid) platSend(Net.conns[pid], obj); }
  }
  function platToHost(obj) { var c = Net.conns[Net.hostPid]; if (c) platSend(c, obj); }
  function platToast(msg) {
    var el = $('plat-toast');
    if (!el) {
      el = document.createElement('div'); el.id = 'plat-toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:118px;transform:translateX(-50%);z-index:100001;background:rgba(15,23,42,.93);color:#fff;font-weight:800;font-size:14px;padding:10px 18px;border-radius:999px;border:2px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.35);pointer-events:none;transition:opacity .3s;display:none';
      document.body.appendChild(el);
    }
    el.textContent = msg; el.style.display = 'block'; el.style.opacity = '1';
    clearTimeout(platToast._t);
    platToast._t = setTimeout(function () { el.style.opacity = '0'; setTimeout(function () { el.style.display = 'none'; }, 320); }, 3600);
  }
  function platDistribute(obj, fromPid) {
    if (Net.isHost) platBroadcast(obj, fromPid); else platToHost(obj);
  }

  // ---------- 聊天 ----------
  function appendChat(m) {
    var list = $('plat-chat-list'); if (!list) return;
    var d = document.createElement('div');
    if (m.sys) { d.className = 'plat-msg sys'; d.textContent = m.text; }
    else {
      d.className = 'plat-msg';
      var who = document.createElement('span'); who.className = 'who'; who.textContent = m.name || '玩家';
      who.style.color = (m.color === 'rainbow') ? '#a855f7' : (m.color || '#1e293b');
      d.appendChild(who);
      d.appendChild(document.createTextNode(m.text || ''));
    }
    list.appendChild(d);
    list.scrollTop = list.scrollHeight;
    if (!m.sys && !m.mine && (!Net.chatOpen || Net.chatMin)) { Net.unread++; renderUnread(); }
  }
  function sysChat(text) { appendChat({ sys: true, text: text }); }
  function renderUnread() {
    var b = $('dock-chat-badge'); if (b) { b.style.display = Net.unread > 0 ? 'flex' : 'none'; b.textContent = Net.unread > 99 ? '99+' : Net.unread; }
    var u = $('plat-chat-unread'); if (u) { u.style.display = (Net.chatOpen && Net.chatMin && Net.unread > 0) ? 'inline-block' : 'none'; u.textContent = Net.unread > 99 ? '99+' : Net.unread; }
    if (window.PlatDock) window.PlatDock._emit();
  }
  function openChat() {
    Net.chatOpen = true; Net.chatMin = false; Net.unread = 0; renderUnread();
    $('plat-chat').style.display = 'block'; $('plat-chat-body').style.display = 'flex'; $('plat-chat-min').textContent = '🔽';
    var list = $('plat-chat-list'); if (list) list.scrollTop = list.scrollHeight;
  }
  function closeChat() { Net.chatOpen = false; $('plat-chat').style.display = 'none'; }
  function sendChat() {
    var inp = $('plat-chat-input'); var text = (inp.value || '').trim(); if (!text || !Net.active) return;
    inp.value = '';
    var m = { kind: 'chat', pid: Net.myPid, name: Net.me.name, color: Net.me.color, text: text };
    appendChat({ name: m.name, color: m.color, text: text, mine: true });
    platDistribute(m, Net.myPid);
  }

  // ---------- 大廳 UI ----------
  function lobbyMsg(t) { var el = $('lob-msg'); if (el) el.textContent = t || ''; }
  function showStep(s) {
    $('lob-step-entry').style.display = (s === 'entry') ? 'block' : 'none';
    $('lob-step-nick').style.display = (s === 'nick') ? 'block' : 'none';
    if (s === 'entry') refreshRejoin();
  }
  function refreshRejoin() {
    var rjBtn = $('lob-rejoin'); if (!rjBtn) return;
    var rc = storeGet('plat_room');
    rjBtn.style.display = rc ? '' : 'none';
    if (rc) { var rcEl = $('lob-rejoin-code'); if (rcEl) rcEl.textContent = rc; }
  }
  function showIdle() { showStep('entry'); }
  function renderLobby() {
    document.body.classList.toggle('plat-room-on', !!Net.active);
    if (typeof renderForceBtn === 'function') renderForceBtn();
    // 未連線時若使用者正在暱稱步，不可把畫面踢回入口步（拉霸選色等 render 呼叫會踩到）
    if (!Net.active) { var nk = $('lob-step-nick'); if (!nk || nk.style.display !== 'block') showIdle(); return; }
    renderTourn();
  }
  function renderColors() {
    var wrap = $('lob-colors'); if (!wrap) return;
    wrap.innerHTML = '';
    var unlocked = storeGet('plat_rainbow') === '1';
    PLAT_COLORS.forEach(function (c, i) {
      var b = document.createElement('button');
      b.style.background = c; b.title = c;
      if (Net.me.color === c) b.className = 'sel';
      b.setAttribute('data-lob-color', String(i));
      b.onclick = function () { tapColorSeq(i); };
      wrap.appendChild(b);
    });
    var dot = $('lob-color-dot');
    if (dot) dot.style.background = (Net.me.color === 'rainbow') ? RAINBOW_BG : (Net.me.color || '#ccc');
    if (unlocked) {
      var rb = document.createElement('button');
      rb.style.background = RAINBOW_BG; rb.title = 'rainbow';
      if (Net.me.color === 'rainbow') rb.className = 'sel';
      rb.onclick = function () { Net.me.color = 'rainbow'; storeSet('plat_color', 'rainbow'); renderColors(); };
      wrap.appendChild(rb);
    }
  }
  var tapSeq = [];
  function tapColorSeq(i) {
    // 代表色預設不能點選（用拉霸決定）；點色塊只累計彩虹密碼
    tapSeq.push(i); if (tapSeq.length > 4) tapSeq.shift();
    if (tapSeq.join(',') === '0,4,15,19' && storeGet('plat_rainbow') !== '1') {
      storeSet('plat_rainbow', '1'); renderColors(); lobbyMsg('🌈 解鎖隱藏代表色 rainbow！');
    }
  }
  var colorSpinning = false;
  function spinColor() {
    if (colorSpinning) return;
    colorSpinning = true;
    var btn = $('lob-color-spin'); if (btn) btn.disabled = true;
    var dot = $('lob-color-dot');
    var start = Date.now(), dur = 1150, timer = null;
    var tick = function () {
      var t = (Date.now() - start) / dur;
      var c = PLAT_COLORS[Math.floor(Math.random() * PLAT_COLORS.length)];
      if (dot) dot.style.background = c;
      if (t >= 1) {
        Net.me.color = c; storeSet('plat_color', c);
        if (storeGet('plat_rainbow') === '1' && Net.me.color === 'rainbow') Net.me.color = c;
        colorSpinning = false;
        if (btn) btn.disabled = false;
        renderColors(); if (Net.active) renderLobby();
        return;
      }
      timer = setTimeout(tick, 50 + 160 * t * t);
    };
    tick();
  }
  function readIdentity() { return Net.me.name || ''; }

  // ---------- 連線管理 ----------
  function wireConn(c) {
    c.on('data', function (d) { routeData(c, d); });
    c.on('close', function () { onRealConnClose(c); });
    c.on('error', function () {});
  }
  function routeData(c, d) {
    if (d && typeof d === 'object' && d.__plat) { onPlatData(c, d); return; }
    tournSniff(c.peer, d);
    var vp = Net.gamePeer;
    if (vp && !vp._destroyed) { try { vp.wrapperFor(c)._deliverData(d); } catch (e) {} }
    else { var nq = (Net._dq = Net._dq || {})[c.peer] || (Net._dq[c.peer] = []); nq.push(d); if (nq.length > 100) nq.shift(); }
  }
  function onRealConnClose(c) {
    var pid = c.peer;
    var vp = Net.gamePeer;
    if (vp && !vp._destroyed) { try { vp._notifyClose(c); } catch (e) {} }
    if (!Net.active || Net.ending) { delete Net.conns[pid]; return; }
    delete Net.conns[pid];
    closeCallOf(pid);
    if (!Net.isHost) {
      if (pid === Net.hostPid) { onHostConnLost(); }
    } else {
      var gone = null;
      Net.roster = Net.roster.filter(function (p) { if (p.pid === pid) { gone = p; return false; } return true; });
      if (gone) {
        sysChat('👋 ' + (gone.name || '玩家') + ' 離開了房間');
        if (Net.tourn && (Net.tourn.phase === 'playing' || Net.tourn.phase === 'playoff')) { var de = tournEntrantByPid(pid); if (de) { Net.tourn.disc[de.uid] = true; tournCheckDone(); } }
        platBroadcast({ kind: 'roster', players: Net.roster, code: Net.code });
        renderLobby();
      }
    }
  }
  // 在線心跳：來賓每 pingMs 向房主 ping（房主回 pong 兼證明房主存活）；房主以 lastSeen 判定離線/移除。
  // 傳輸層的 close 訊號在 App 被直接關掉時可能拖很久，心跳是即時性的後盾。參數在 Net.presence（測試可調）。
  setInterval(function () {
    if (!Net.active) return;
    var now = Date.now(), cfg = Net.presence;
    if (!Net.isHost) {
      if (now - (Net._lastPing || 0) >= cfg.pingMs) { Net._lastPing = now; platToHost({ kind: 'ping' }); }
      if (Net.hostSeen && now - Net.hostSeen > cfg.offlineMs && !Net._hostWarned) { Net._hostWarned = true; lobbyMsg('⚠️ 與房主連線中斷，嘗試重連中…'); }
      return;
    }
    var changed = false;
    Net.roster.slice().forEach(function (p) {
      if (p.host || p.pid === Net.myPid) return;
      var seen = Net.lastSeen[p.pid] || p._joinedAt || now;
      var silent = now - seen;
      if (silent > cfg.removeMs && !Net.inMatch) {
        Net.roster = Net.roster.filter(function (x) { return x.pid !== p.pid; });
        delete Net.lastSeen[p.pid];
        sysChat('📴 ' + (p.name || '玩家') + ' 已離線（無回應）');
        changed = true;
      } else if (silent > cfg.offlineMs && !p.offline) {
        p.offline = true; changed = true;
      }
    });
    if (changed) { platBroadcast({ kind: 'roster', players: Net.roster, code: Net.code }); renderLobby(); }
  }, 5000);
  function onPlatData(c, d) {
    var pid = c.peer;
    switch (d.kind) {
      case 'join': {
        if (!Net.isHost) return;
        var clash = Net.roster.some(function (p) { return p.pid !== pid && normName(p.name) === normName(d.name); });
        if (clash) { platSend(c, { kind: 'reject', reason: 'name_taken' }); return; }
        if (!Net.roster.some(function (p) { return p.pid === pid; })) {
          Net.roster.push({ pid: pid, uid: d.uid || pid, ver: d.ver || '', name: d.name || '玩家', color: d.color, host: false, _joinedAt: Date.now() });
        }
        Net.lastSeen[pid] = Date.now();
        tournRebind();
        platSend(c, { kind: 'roster', players: Net.roster, code: Net.code });
        platBroadcast({ kind: 'roster', players: Net.roster, code: Net.code }, pid);
        sysChat('👋 ' + (d.name || '玩家') + ' 加入了房間');
        if (Net.tourn) { platSend(c, { kind: 'tourn-setup', cfg: tournPublicCfg() }); var tsm = tournStateMsg(); if (tsm) platSend(c, tsm); }
        if (Net.inMatch) platSend(c, { kind: 'launch', game: Net.inMatch, mode: Net.matchMode || 'coop', tourn: (Net.tourn && (Net.tourn.phase === 'playing' || Net.tourn.phase === 'playoff')) ? tournSess() : undefined });
        renderLobby();
        if (Net.videoOn) callPeer(pid);
        if (Net.videoOn || Object.keys(Net.remoteStreams).length) platSend(c, { kind: 'mic', pid: Net.myPid, name: Net.me.name, muted: Net.micMuted });
        break;
      }
      case 'roster': Net.roster = d.players || []; if (d.code) Net.code = d.code; Net.hostSeen = Date.now(); Net._hostWarned = false; tournRebind(); renderLobby();
        if (!Net.isHost && !Net.inMatch && !Net.tourn) { var fbT = setTimeout(function () { if (Net.active && !Net.inMatch && !Net.tourn) maybeAutoEnterRoom(); }, 1500); }
        break;
      case 'ping': {
        if (!Net.isHost) return;
        Net.lastSeen[pid] = Date.now();
        platSend(c, { kind: 'pong' });
        var pp = Net.roster.find(function (x) { return x.pid === pid; });
        if (pp && pp.offline) { pp.offline = false; platBroadcast({ kind: 'roster', players: Net.roster, code: Net.code }); renderLobby(); }
        break;
      }
      case 'pong': Net.hostSeen = Date.now(); Net._hostWarned = false; break;
      case 'reject': lobbyMsg('⚠️ 暱稱已被使用，換一個名字再試'); teardownPeer(); showIdle(); break;
      case 'leave': {
        if (!Net.isHost) return;
        var gone2 = null;
        Net.roster = Net.roster.filter(function (p) { if (p.pid === d.pid) { gone2 = p; return false; } return true; });
        if (gone2) sysChat('👋 ' + (gone2.name || '玩家') + ' 離開了房間');
        platBroadcast({ kind: 'roster', players: Net.roster, code: Net.code });
        renderLobby();
        break;
      }
      case 'bye': endSession('房主已解散房間'); break;
      case 'chat': {
        appendChat({ name: d.name, color: d.color, text: d.text });
        if (Net.isHost) platBroadcast({ kind: 'chat', pid: d.pid, name: d.name, color: d.color, text: d.text }, pid);
        break;
      }
      case 'mic': {
        Net.remoteMic[d.pid] = d.muted;
        onRemoteMic(d);
        if (Net.isHost) platBroadcast({ kind: 'mic', pid: d.pid, name: d.name, muted: d.muted }, pid);
        renderVideos();
        break;
      }
      case 'arm': if (!Net.isHost) { Net.armed.game = d.game; Net.roomTab = d.game; renderRoomTabs(); } break;
      case 'tab': if (!Net.isHost) { Net.roomTab = d.tab; renderTourn(); renderRoomTabs(); } break;
      case 'launch': {
        if (Net.restored) { Net.restored = false; Net.inMatch = d.game; Net.matchMode = d.mode || 'coop'; window.PLAT_show(d.game); renderLobby(); }
        else if (!Net.isHost) {
          var dupLaunch = Net.inMatch === d.game && (!d.tourn || (Net.tourn && Net.tourn.round === d.tourn.round));
          if (!dupLaunch) doLaunch(d.game, d.mode, d.tourn);
        }
        break;
      }
      case 'return': if (!Net.isHost) doReturnToLobby(); break;
      case 'tourn-setup': Net.tourn = tournNewState(d.cfg, 'playing'); sysChat('🏆 錦標賽開始！共 ' + ((d.cfg && d.cfg.totalRounds) || 5) + ' 局'); renderTourn(); break;
      case 'tourn-ack': {
        if (Net.isHost && Net.tourn) {
          var ta = Net.tourn, all2 = (ta.acks = ta.acks || {});
          var ackKey = d.uid || pid;
          var rec = all2[ackKey] || (all2[ackKey] = {});
          rec[d.what] = d.round; if (d.game) rec.enteredGame = d.game;
          renderTourn();
        }
        break;
      }
      case 'tourn-score': { var tst = Net.tourn; if (tst) { tst.totals = d.totals || tst.totals; tst.wins = d.wins || tst.wins; tst.history = d.history || tst.history; tst.round = d.round || tst.round; tst.phase = d.phase || 'standings'; if (d.game) tst.curGame = d.game; if (d.progress) tst.progress = d.progress; if (d.finishOrder) tst.finishOrder = d.finishOrder; tst.settled = (tst.phase !== 'playing' && tst.phase !== 'playoff'); if (!Net.isHost && !Net.inMatch && (tst.phase === 'standings' || tst.phase === 'playoff-pending')) platToHost({ kind: 'tourn-ack', what: 'lobby', round: tst.round, uid: Net.myUid }); } renderTourn(); break; }
      case 'tourn-end': { var ten = Net.tourn; if (ten) { ten.phase = 'ended'; ten.champion = d.champion; ten.endNote = d.note || ''; ten.totals = d.totals || ten.totals; ten.wins = d.wins || ten.wins; ten.history = d.history || ten.history; } if (Net.inMatch) doReturnToLobby(); if (d.champion) sysChat('🏆 總冠軍：' + d.champion.name + '！'); renderTourn(); break; }
      case 'tourn-abort': tournClear(); renderLobby(); break;
    }
  }
  // ---------- 房主斷線接管（未收到 bye 的意外斷線才走這裡；主動解散已在 endSession 處理） ----------
  function onHostConnLost() {
    if (Net.isHost || !Net.active || Net.migrating) return;
    Net.migrating = true;
    sysChat('📡 房主連線中斷，正在自動接管重連…');
    lobbyMsg('📡 房主連線中斷，正在自動接管重連…');
    var cand = null;
    for (var i = 0; i < Net.roster.length; i++) { if (!Net.roster[i].host) { cand = Net.roster[i]; break; } }
    if (cand && cand.pid === Net.myPid) promoteToHost();
    else waitForNewHost();
  }
  function promoteToHost() {
    var code = Net.code;
    Net.roster = Net.roster.filter(function (pp) { return !pp.host; });
    Net.roster.forEach(function (pp) { if (pp.pid === Net.myPid) pp.host = true; });
    var tries = 0;
    (function attempt() {
      if (!Net.migrating) return;
      var peer = new RealPeer('yyh-tgsh-' + code + '-host');
      Net.peer = peer;
      peer.on('open', function (id) {
        Net.hostPid = id; Net.isHost = true; Net.migrating = false;
        sysChat('👑 你已接管成為新房主，朋友們正在重連…');
        renderLobby(); updateDock();
        platBroadcast({ kind: 'roster', players: Net.roster, code: Net.code });
        migrateGame(true);
        if (Net.tourn) setTimeout(tournAdopt, 1200);
      });
      peer.on('connection', function (c) {
        Net.conns[c.peer] = c; wireConn(c);
        if (Net.gamePeer && !Net.gamePeer._destroyed) Net.gamePeer._deliver(c);
      });
      peer.on('call', function (call) { handleCall(call); });
      peer.on('error', function (err) {
        if (err && err.type === 'unavailable-id' && tries < 10 && Net.migrating) {
          tries++; try { peer.destroy(); } catch (e) {}
          setTimeout(attempt, 2000); return;
        }
        if (Net.migrating) { Net.migrating = false; endSession('⚠️ 接管失敗，連線結束'); }
      });
    })();
  }
  function waitForNewHost() {
    var tries = 0;
    (function attempt() {
      if (!Net.migrating) return;
      tries++;
      if (tries > 16) { Net.migrating = false; endSession('⚠️ 房主離線且接管逾時，連線結束'); return; }
      var c = Net.peer.connect(Net.hostPid);
      var done = false;
      c.on('open', function () {
        if (done) return; done = true;
        Net.conns[Net.hostPid] = c; wireConn(c);
        Net.migrating = false;
        Net.restored = true; // 接管重連：遊戲由 migrateGame 重設，launch 重播不可再 enter 一次（雙重 setup 會弄亂 refs）
        platSend(c, { kind: 'join', name: Net.me.name, color: Net.me.color, uid: Net.myUid, ver: PLAT_VERSION });
        sysChat('📡 已重連到新房主');
        renderLobby(); updateDock();
        migrateGame(false);
      });
      setTimeout(function () { if (!done && Net.migrating) { try { c.close(); } catch (e) {} attempt(); } }, 3000);
    })();
  }
  function migrateGame(amHost) {
    var g = Net.inMatch; if (!g) return;
    var hk = window['__PLAT_HOOKS_' + g]; if (!hk) return;
    var sess = { code: Net.code, name: Net.me.name, isHost: amHost, mode: Net.matchMode || 'coop' };
    if (hk.migrate) { try { hk.migrate(amHost, sess); } catch (e) {} }
    else if (hk.enter) { try { hk.enter(sess); } catch (e) {} }
  }
  function teardownPeer() {
    Net.ending = true;
    try { if (Net.peer) Net.peer.destroy(); } catch (e) {}
    Net.peer = null; Net.conns = {}; Net.active = false; Net.ending = false;
  }
  function endSession(msg) {
    Net.migrating = false;
    if (!Net.active && !Net.peer) { showIdle(); return; }
    var g = Net.inMatch; Net.inMatch = null; Net.matchMode = null;
    stopVideo();
    teardownPeer();
    Net.roster = []; Net.gamePeer = null; Net.isHost = false;
    tournClear();
    updateDock(); closeChat(); showIdle(); renderLobby();
    if (g) { var hk = window['__PLAT_HOOKS_' + g]; if (hk && hk.exit) { try { hk.exit(); } catch (e) {} } }
    window.PLAT_show('lobby');
    if (msg) lobbyMsg(msg);
  }
  function createRoom() {
    var name = readIdentity();
    if (!name) { lobbyMsg('⚠️ 請先輸入暱稱'); return; }
    var code = storeGet('plat_code');
    if (!code) { code = String(Math.floor(1000 + Math.random() * 9000)); storeSet('plat_code', code); }
    Net.code = code; Net.joinRetry = false;
    storeSet('plat_room', code); storeSet('plat_room_role', 'host');
    lobbyMsg('正在建立房間…');
    makeHostPeer(code);
  }
  function makeHostPeer(code) {
    var p = new RealPeer('yyh-tgsh-' + code + '-host');
    Net.peer = p;
    p.on('open', function (id) {
      Net.myPid = id; Net.hostPid = id; Net.isHost = true; Net.active = true;
      Net.roster = [{ pid: id, uid: Net.myUid, ver: PLAT_VERSION, name: Net.me.name, color: Net.me.color, host: true }];
      lobbyMsg(''); renderLobby(); updateDock();
      sysChat('🏠 房間已建立，房號 ' + code + '（把房號告訴朋友）');
      maybeAutoEnterRoom();
    });
    p.on('connection', function (c) {
      Net.conns[c.peer] = c; wireConn(c);
      if (Net.gamePeer && !Net.gamePeer._destroyed) Net.gamePeer._deliver(c);
    });
    p.on('call', function (call) { handleCall(call); });
    p.on('error', function (err) {
      if (err && err.type === 'unavailable-id' && !Net.joinRetry) {
        Net.joinRetry = true;
        var nc = String(Math.floor(1000 + Math.random() * 9000));
        storeSet('plat_code', nc); Net.code = nc;
        try { p.destroy(); } catch (e) {}
        makeHostPeer(nc);
        return;
      }
      lobbyMsg('⚠️ 建立房間失敗：' + (err && err.type ? err.type : '未知錯誤'));
      teardownPeer(); showIdle();
    });
  }
  function joinRoom() {
    var name = readIdentity();
    if (!name) { lobbyMsg('⚠️ 請先輸入暱稱'); return; }
    var code = ($('lob-code').value || '').trim();
    if (code.length !== 4) { lobbyMsg('⚠️ 請輸入 4 位數房號'); return; }
    Net.code = code; Net.hostPid = 'yyh-tgsh-' + code + '-host';
    storeSet('plat_room', code); storeSet('plat_room_role', 'guest');
    lobbyMsg('正在連線到房間 ' + code + '…');
    var p = new RealPeer();
    Net.peer = p;
    p.on('open', function (id) {
      Net.myPid = id;
      var c = p.connect(Net.hostPid);
      Net.conns[Net.hostPid] = c; wireConn(c);
      c.on('open', function () {
        Net.active = true; Net.isHost = false;
        platSend(c, { kind: 'join', name: Net.me.name, color: Net.me.color, uid: Net.myUid, ver: PLAT_VERSION });
        lobbyMsg('已連上房間，等待房主確認…');
        updateDock();
      });
    });
    p.on('call', function (call) { handleCall(call); });
    p.on('error', function (err) {
      if (err && err.type === 'peer-unavailable') { lobbyMsg('⚠️ 找不到這個房號，房主可能還沒建立房間'); storeSet('plat_room', ''); teardownPeer(); showIdle(); return; }
      if (!Net.active) { lobbyMsg('⚠️ 連線失敗：' + (err && err.type ? err.type : '')); teardownPeer(); showIdle(); }
    });
  }
  function leaveRoom() {
    if (!Net.active) { showIdle(); return; }
    if (Net.isHost) platBroadcast({ kind: 'bye' });
    else platToHost({ kind: 'leave', pid: Net.myPid });
    storeSet('plat_room', '');
    endSession('');
    lobbyMsg('已離開房間');
  }

  // ---------- 進/出對局 ----------
  function waitForHook(game, cb) {
    var tries = 0;
    (function poll() {
      var hk = window['__PLAT_HOOKS_' + game];
      if (hk && hk.enter) { cb(hk); return; }
      tries++;
      if (tries === 25) platToast('⏳ 遊戲還在載入，正在等它就緒…');
      if (tries === 110) platToast('⚠️ 遊戲載入逾時，請回平台後再重新進入');
      if (tries < 120) setTimeout(poll, 400);
    })();
  }
  function tournSelfAck(what, round, game) {
    var t = Net.tourn; if (!t) return;
    var all = (t.acks = t.acks || {});
    var a = all[Net.myUid] || (all[Net.myUid] = {});
    a[what] = round; if (game) a.enteredGame = game;
  }
  // 使用者裁示（2026-10-20 深夜修正）：不停多人連線選單頁——建/入房直接進遊戲大廳（等待室）。
  function maybeAutoEnterRoom() {
    if (!Net.active || Net.inMatch || Net.tourn) return;
    doLaunch(Net.armed.game, Net.armed.mode);
  }
  function doLaunch(game, mode, tournSess) {
    if (window.PlatCountdown) window.PlatCountdown.hide(); if (window.PlatResults) window.PlatResults.hide(); if (!(typeof POD !== 'undefined' && POD.shownAt && Date.now() - POD.shownAt < 6000)) podHide(); // 剛播的頒獎台不擋：來賓先收 tourn-score 播台、隨後才被 return 帶回，立刻 podHide 會讓玩家永遠看不到小局結算
    Net.inMatch = game; Net.matchMode = mode || 'coop';
    if (tournSess) { Net.armed.game = game; Net.roomTab = game; } else { Net.armed = { game: game, mode: mode || 'coop' }; Net.roomTab = game; } // 賽程局開局也要切到該局遊戲的分頁：全員落進該局等待室（名單/準備/開始），不要停在錦標賽面板（局間回來由 doReturnToLobby 再切回 tourn）
    Net.armedByGame[game] = mode || 'coop';
    try { localStorage.setItem('plat_armed_game', game); } catch (e) {}
    if (tournSess && Net.tourn) { Net.tourn.phase = tournSess.playoff ? 'playoff' : 'playing'; Net.tourn.round = tournSess.round; Net.tourn.curGame = game; Net.tourn.settled = false; }
    // 切換遊戲時先釋放 PlatRoom 的外來綁定：舊遊戲的等待室節點只是被隱藏、仍連在文件上，
    // 遊戲端自我修復 effect 不會主動讓出（isAttached && 已連接就跳過），不先 detach 新遊戲永遠掛不上等待室
    if (window.PlatRoom && window.PlatRoom.isAttached()) {
      var prSlotEl = window.PlatRoom.getSlot();
      var prOwnerView = prSlotEl && prSlotEl.closest ? prSlotEl.closest('[id^="view-"]') : null;
      if (!prOwnerView || prOwnerView.id !== 'view-' + game) window.PlatRoom.detach();
    }
    renderLobby();
    window.PLAT_show(game);
    waitForHook(game, function (hk) {
      if (Net.inMatch !== game) return;
      try { hk.enter({ code: Net.code, isHost: Net.isHost, name: Net.me.name, mode: mode || 'coop', tourn: tournSess || null }); } catch (e) {}
      if (tournSess) { if (Net.isHost) tournSelfAck('entered', tournSess.round, game); else platToHost({ kind: 'tourn-ack', what: 'entered', round: tournSess.round, game: game, uid: Net.myUid }); }
    });
  }
  function exitGameHook(g) { var hk = window['__PLAT_HOOKS_' + g]; if (hk && hk.exit) { try { hk.exit(); } catch (e) {} } }
  function doReturnToLobby() {
    var g = Net.inMatch; Net.inMatch = null; Net.matchMode = null;
    if (g) exitGameHook(g);
    // 注意：這裡不 podHide——頒獎台是回大廳的儀式，來賓先收到 tourn-score 播台、隨後才被 return 帶回大廳，藏掉就永遠看不到
    if (window.PlatCountdown) window.PlatCountdown.hide(); if (window.PlatResults) window.PlatResults.hide();
    if (Net.tourn) { if (Net.isHost) tournSelfAck('lobby', Net.tourn.round); else platToHost({ kind: 'tourn-ack', what: 'lobby', round: Net.tourn.round, uid: Net.myUid }); }
    // v1.8.1：還在房間裡就直接回等待室（賽程中顯示五戰分頁），不再經過「多人連線選單」頁
    if (Net.active) {
      var wantTourn = !!Net.tourn;
      doLaunch(Net.armed.game, Net.armed.mode);
      if (wantTourn) { Net.roomTab = 'tourn'; renderRoomTabs(); }
    } else { renderLobby(); window.PLAT_show('lobby'); }
  }
  window.__PLAT_NOTIFY = function (type) {
    if (type === 'game-exit') {
      if (!Net.inMatch) return;
      if (Net.isHost) { platBroadcast({ kind: 'return' }); doReturnToLobby(); }
      else Net.inMatch = null;
    } else if (type === 'host-gone') {
      onHostConnLost(); // 接管流程（殼層選舉升格），不再直接結束連線
    }
  };


  // ---------- 混合大亂鬥賽程 PlatTourn（房主權威；嗅探遊戲訊息計分；設計見 phase-d-design.md） ----------
  var TOURN_PTS = [10, 7, 5, 3, 2];
  function tournPts(rank) { return rank <= 5 ? TOURN_PTS[rank - 1] : 1; }
  function tournGameName(g) { return g === 'sudoku' ? '🔢 數獨' : '🌉 數橋'; }
  function tournUidByName(name) {
    var t = Net.tourn; if (!t || !name) return null;
    var n = normName(name);
    for (var i = 0; i < t.entrants.length; i++) if (normName(t.entrants[i].name) === n) return t.entrants[i].uid;
    return null;
  }
  function tournEntrant(key) { var t = Net.tourn; if (!t) return null; for (var i = 0; i < t.entrants.length; i++) if (t.entrants[i].uid === key) return t.entrants[i]; return null; }
  function tournEntrantByPid(pid) { var t = Net.tourn; if (!t) return null; for (var i = 0; i < t.entrants.length; i++) if (t.entrants[i].pid === pid) return t.entrants[i]; return null; }
  function tournRebind() { // 參賽者 pid 隨重連/接管變動：以 uid 把 entrant 的傳輸 pid 對回當下名單
    var t = Net.tourn; if (!t) return;
    t.entrants.forEach(function (e) {
      if (!e.uid) return;
      for (var i = 0; i < Net.roster.length; i++) { var rp = Net.roster[i]; if (rp.uid === e.uid) { e.pid = rp.pid; e.name = rp.name || e.name; e.color = rp.color || e.color; break; } }
    });
  }
  function tournSess() {
    var t = Net.tourn; if (!t) return null;
    return { round: t.round, total: t.totalRounds, playoff: t.phase === 'playoff', entrants: t.entrants.length,
      roster: t.entrants.map(function (e) { return { uid: e.uid, name: e.name, color: e.color }; }),
      sizeId: t.curGame === 'sudoku' ? t.sudoku.sizeId : t.hashi.sizeId, diffId: t.sudoku.diffId, roundSecs: t.roundSecs };
  }
  function tournBuildRounds(order, n) {
    n = n || 5;
    var rounds = [], i;
    if (order === 'random') { for (i = 0; i < n; i++) rounds.push(Math.random() < 0.5 ? 'sudoku' : 'hashi'); return rounds; }
    var first = order === 'alt-h' ? 'hashi' : 'sudoku', second = first === 'sudoku' ? 'hashi' : 'sudoku';
    for (i = 0; i < n; i++) rounds.push(i % 2 === 0 ? first : second);
    return rounds;
  }
  // 錦標賽的題目設定直接讀各遊戲等待室目前的設定（使用者指示：不要在錦標賽面板再放一份表單）
  function tournGameSettings(game, dflt) { var hk = window['__PLAT_HOOKS_' + game]; if (hk && hk.getSettings) { try { var s = hk.getSettings(); if (s) return Object.assign({}, dflt, s); } catch (e) {} } return dflt; }
  function tournPublicCfg() {
    var t = Net.tourn;
    return { rounds: t.rounds, order: t.order, sudoku: t.sudoku, hashi: t.hashi, roundSecs: t.roundSecs, totalRounds: t.totalRounds, entrants: t.entrants };
  }
  function tournNewState(cfg, phase) {
    Net._podiumKey = '';
    var totals = {}, wins = {};
    cfg.entrants.forEach(function (e) { totals[e.uid] = 0; wins[e.uid] = 0; });
    return { phase: phase, round: 1, totalRounds: cfg.totalRounds, order: cfg.order, rounds: cfg.rounds,
      sudoku: cfg.sudoku, hashi: cfg.hashi, roundSecs: cfg.roundSecs, entrants: cfg.entrants,
      totals: totals, wins: wins, history: [], curGame: null, settled: false, startedAt: 0, endsAt: 0,
      progress: {}, finishOrder: [], uidMap: {}, cellTrack: {}, totalBlanks: 0, disc: {}, acks: {}, timer: null, armTimer: null, tiedPids: null, champion: null, endNote: '' };
  }
  function tournCreate() {
    if (!Net.isHost || Net.tourn) return;
    var sSet = tournGameSettings('sudoku', { sizeId: 9, diffId: 'medium' });
    var hSet = tournGameSettings('hashi', { sizeId: 2 });
    var cfg = { order: $('t-order').value,
      sudoku: { sizeId: Number(sSet.sizeId) || 9, diffId: sSet.diffId || 'medium' },
      hashi: { sizeId: Number(hSet.sizeId) || 2 },
      roundSecs: Number($('t-secs').value), totalRounds: Number(($('t-rounds') || {}).value) || 5, rounds: null,
      entrants: Net.roster.map(function (p) { return { pid: p.pid, uid: p.uid || p.pid, name: p.name, color: p.color }; }) };
    cfg.rounds = tournBuildRounds(cfg.order, cfg.totalRounds);
    var badVer = Net.roster.filter(function (p) { return p.ver && p.ver !== PLAT_VERSION; });
    if (badVer.length) sysChat('⚠️ ' + badVer.map(function (p) { return (p.name || '玩家') + '（' + p.ver + '）'; }).join('、') + ' 的版本和房主（' + PLAT_VERSION + '）不同，可能連線異常');
    Net.tourn = tournNewState(cfg, 'playing');
    platBroadcast({ kind: 'tourn-setup', cfg: tournPublicCfg() });
    sysChat('🏆 錦標賽開始！共 ' + cfg.totalRounds + ' 局');
    tournStartRound();
  }
  function tournStartRound() {
    var t = Net.tourn; if (!t) return;
    t.curGame = t.phase === 'playoff' ? 'hashi' : t.rounds[t.round - 1];
    t.settled = false; t.startedAt = 0; t.endsAt = 0;
    t.progress = {}; t.finishOrder = []; t.uidMap = {}; t.cellTrack = {}; t.totalBlanks = 0; t.disc = {};
    if (t.timer) { clearTimeout(t.timer); t.timer = null; }
    if (t.armTimer) { clearTimeout(t.armTimer); t.armTimer = null; }
    var sess = tournSess();
    platBroadcast({ kind: 'launch', game: t.curGame, mode: 'brawl', tourn: sess });
    doLaunch(t.curGame, 'brawl', sess);
    sysChat('🏆 第 ' + t.round + ' 局：' + tournGameName(t.curGame) + '大亂鬥');
    if (t.roundSecs > 0) {
      t.armTimer = setTimeout(function () {
        if (Net.tourn === t && !t.startedAt && !t.settled) { t.startedAt = Date.now(); t.endsAt = Date.now() + t.roundSecs * 1000; tournArmTimer(); }
      }, 120000);
    }
    renderTourn();
  }
  function tournArmTimer() {
    var t = Net.tourn; if (!t) return;
    if (t.timer) clearTimeout(t.timer);
    t.timer = setTimeout(function () { if (Net.tourn === t && !t.settled) tournSettle(); }, Math.max(0, t.endsAt - Date.now()) + 250);
  }
  function tournMarkFinished(key) {
    var t = Net.tourn; if (!t || !key || t.settled) return;
    if (t.finishOrder.indexOf(key) < 0) { t.finishOrder.push(key); t.progress[key] = 100; }
    tournSnapshot(true);
    tournCheckDone();
  }
  function tournCheckDone() {
    var t = Net.tourn; if (!t || t.settled) return;
    var done = t.entrants.every(function (e) {
      if (t.finishOrder.indexOf(e.uid) >= 0) return true;
      if (!t.disc[e.uid]) return false;
      // 斷線旗標只在本人真的不在房間時才算數：重連回來的選手還在玩，要等他完賽，不能提前結算
      var present = Net.roster.some(function (p) { return (p.uid || p.pid) === e.uid || p.pid === e.pid; });
      return !present;
    });
    if (done) tournSettle();
  }
  function tournDecideChampion() {
    var t = Net.tourn;
    var sorted = t.entrants.slice().sort(function (a, b) { return (t.totals[b.uid] || 0) - (t.totals[a.uid] || 0); });
    var top = t.totals[sorted[0].uid] || 0;
    var tied = sorted.filter(function (e) { return (t.totals[e.uid] || 0) === top; }).map(function (e) { return e.uid; });
    if (tied.length === 1) return { champion: tied[0], note: '' };
    var bestWins = -1; tied.forEach(function (k) { bestWins = Math.max(bestWins, t.wins[k] || 0); });
    var winTied = tied.filter(function (k) { return (t.wins[k] || 0) === bestWins; });
    if (winTied.length === 1) return { champion: winTied[0], note: '同分比冠軍局數（' + bestWins + ' 次第 1 名）決勝' };
    return { champion: null, tied: winTied };
  }
  // ===== v1.8.1 等待室分頁：分頁列長在等待室（PlatRoom）頂部，房內切換，不經過多人連線選單頁 =====
  var roomTabsSig = '';
  var _tournNodeCache = {};
  function tournNode(id) {
    var n = _tournNodeCache[id];
    if (n && n.id === id) return n;
    n = document.getElementById(id);
    if (n) _tournNodeCache[id] = n;
    return n || null;
  }
  function rescueTournNodes() {
    var home = document.getElementById('lob-panel-tourn'); if (!home) return;
    ['lob-tourn-setup', 'lob-tourn-note', 'lob-tourn'].forEach(function (id) {
      var n = tournNode(id);
      if (n && n.parentNode !== home) home.appendChild(n);
    });
  }
  function renderRoomTabs() {
    if (typeof prRegion !== 'function' || typeof PR === 'undefined' || !PR.el) return;
    var tabsRg = prRegion('tabs'), tournRg = prRegion('tourn');
    if (!tabsRg && !tournRg) return;
    var showTourn = Net.roomTab === 'tourn';
    if (tournRg) {
      tournRg.style.display = showTourn ? 'block' : 'none';
      if (showTourn) {
        ['lob-tourn-setup', 'lob-tourn-note', 'lob-tourn'].forEach(function (id) {
          var n = tournNode(id);
          if (n && n.parentNode !== tournRg) tournRg.appendChild(n);
        });
      } else rescueTournNodes();
    }
    var ro = prRegion('roster'), ct = prRegion('controls'), dk2 = prRegion('dock');
    [ro, ct, dk2].forEach(function (n) { if (n) n.style.display = showTourn ? 'none' : ''; });
    if (PR.slot) PR.slot.style.display = showTourn ? 'none' : '';
    var lv = PR.el.querySelector('[data-pr="leave"]'); if (lv) lv.style.display = showTourn ? 'none' : '';
    if (ro && ro.previousElementSibling) ro.previousElementSibling.style.display = showTourn ? 'none' : '';
    if (!tabsRg) return;
    var t = Net.tourn;
    var tournLive = !!(t && t.phase !== 'ended');
    var sig = [Net.armed.game, Net.armed.mode, Net.roomTab, Net.isHost ? 'H' : 'G', t ? t.phase + ':' + t.round : '-', tournLive ? 'L' : ''].join('|');
    if (sig === roomTabsSig && tabsRg.innerHTML) return;
    roomTabsSig = sig;
    function tabBtn(id, label) {
      var on = id === 'tourn' ? (Net.roomTab === 'tourn') : (Net.roomTab !== 'tourn' && Net.armed.game === id);
      var dim = tournLive && id !== 'tourn' && !on;
      return '<button data-rtab="' + id + '" class="lob-tab' + (on ? ' lob-tab-on' : '') + '" style="flex:1' + (dim ? ';opacity:.45' : '') + '">' + label + '</button>';
    }
    var h = '<div class="flex gap-1.5">' + tabBtn('sudoku', '🔢 數獨') + tabBtn('hashi', '🌉 數橋') + tabBtn('tourn', '🏆 錦標賽') + '</div>';
    // 模式（合作/大亂鬥）不在這裡切：兩款的「對局設定」裡本來就有，殼只負責換遊戲（使用者指示刪除重複的模式列）
    if (Net.roomTab !== 'tourn') {
      if (tournLive) h += '<div class="text-center text-[11px] font-black text-amber-600 mt-1.5">🏆 賽程進行中・本局由賽程決定</div>';
      else if (Net.armed.game && Net.inMatch && Net.armed.game !== Net.inMatch) {
        var gn2 = Net.armed.game === 'hashi' ? '數橋' : '數獨';
        h += '<div class="text-center text-[11px] font-black text-sky-700 mt-1.5">' + (Net.isHost ? ('已選「' + gn2 + '」・按下方開始鈕帶大家過去') : ('房主已選「' + gn2 + '」・等房主開始後一起過去')) + '</div>';
      }
      else if (!Net.isHost) h += '<div class="text-center text-[11px] font-black text-slate-400 mt-1.5">遊戲由房主選擇，跟著房主走</div>';
    }
    tabsRg.innerHTML = h;
  }
  // 分頁選了別款遊戲時，房主按本房的「開始」＝帶全房去選定遊戲的等待室（回傳 true 表示已改道，不再啟動本房遊戲）
  function tryTransportStart() {
    if (!Net.isHost || Net.tourn || !Net.armed.game || !Net.inMatch || Net.armed.game === Net.inMatch) return false;
    var m = Net.armedByGame[Net.armed.game] || 'coop';
    platBroadcast({ kind: 'launch', game: Net.armed.game, mode: m });
    doLaunch(Net.armed.game, m);
    return true;
  }
  window.__PLAT_ROOMTAB = function (kind, val) {
    if (!Net.active) return;
    if (kind === 'tab' && val === 'tourn') { Net.roomTab = 'tourn'; if (Net.isHost) platBroadcast({ kind: 'tab', tab: 'tourn' }); renderTourn(); renderRoomTabs(); return; }
    if (!Net.isHost) return;
    var t = Net.tourn;
    if (kind === 'tab') {
      if (t && t.phase !== 'ended') return;
      if (t && t.phase === 'ended') tournAbort();
      // 分頁只是選遊戲（使用者定案）：只改選定＋廣播同步，不 launch、不換畫面；房主按等待室的開始鈕才帶大家過去
      Net.armed.game = val; Net.roomTab = val;
      platBroadcast({ kind: 'arm', game: val });
      renderRoomTabs();
    }
  };
  function tournSettle() {
    var t = Net.tourn; if (!t || t.settled) return;
    t.settled = true;
    if (t.timer) { clearTimeout(t.timer); t.timer = null; }
    if (t.armTimer) { clearTimeout(t.armTimer); t.armTimer = null; }
    var rest = t.entrants.filter(function (e) { return t.finishOrder.indexOf(e.uid) < 0; });
    rest.sort(function (a, b) { return (t.progress[b.uid] || 0) - (t.progress[a.uid] || 0); });
    var ordered = t.finishOrder.concat(rest.map(function (e) { return e.uid; }));
    var placements = ordered.map(function (key, i) {
      var en = tournEntrant(key);
      return { uid: key, pid: en ? en.pid : null, name: en ? en.name : '玩家', rank: i + 1, pts: tournPts(i + 1), progress: Math.floor(t.progress[key] || 0), finished: t.finishOrder.indexOf(key) >= 0 };
    });
    placements.forEach(function (pl) { t.totals[pl.uid] = (t.totals[pl.uid] || 0) + pl.pts; if (pl.rank === 1) t.wins[pl.uid] = (t.wins[pl.uid] || 0) + 1; });
    t.history.push({ round: t.round, game: t.curGame, placements: placements });
    if (t.phase === 'playoff') {
      var champKey = null;
      for (var i = 0; i < placements.length; i++) { if (t.tiedPids && t.tiedPids.indexOf(placements[i].uid) >= 0) { champKey = placements[i].uid; break; } }
      tournFinish(champKey || placements[0].uid, '同分加賽決勝');
      return;
    }
    if (t.round >= t.totalRounds) {
      var res = tournDecideChampion();
      if (res.champion) { tournFinish(res.champion, res.note); return; }
      t.tiedPids = res.tied;
      t.phase = 'playoff-pending';
    } else t.phase = 'standings';
    platBroadcast({ kind: 'tourn-score', round: t.round, game: t.curGame, placements: placements, totals: t.totals, wins: t.wins, history: t.history, phase: t.phase });
    tournReturnAll();
    renderTourn();
  }
  function tournFinish(champKey, note) {
    var t = Net.tourn; if (!t) return;
    t.phase = 'ended';
    var en = tournEntrant(champKey);
    t.champion = { uid: champKey, pid: en ? en.pid : null, name: en ? en.name : '玩家' };
    t.endNote = note || '';
    platBroadcast({ kind: 'tourn-end', champion: t.champion, totals: t.totals, wins: t.wins, history: t.history, note: t.endNote });
    tournReturnAll();
    renderTourn();
  }
  function tournStateMsg() { // 完整賽程狀態（接管備份/重連同步用）
    var t = Net.tourn; if (!t) return null;
    return { kind: 'tourn-score', phase: t.phase, round: t.round, game: t.curGame, progress: t.progress, finishOrder: t.finishOrder, totals: t.totals, wins: t.wins, history: t.history };
  }
  function tournSnapshot(force) { // 局中定期把進度/完賽序同步給全員，接管時新房主才有資料結算本局
    var t = Net.tourn; if (!t || !Net.isHost) return;
    var now = Date.now();
    if (!force && t._snapAt && now - t._snapAt < 2500) return;
    t._snapAt = now;
    var m = tournStateMsg(); if (m) platBroadcast(m);
  }
  function tournReturnAll() {
    if (Net.isHost) platBroadcast({ kind: 'return' });
    if (Net.inMatch) doReturnToLobby();
  }
  function tournAbort() {
    if (Net.isHost) platBroadcast({ kind: 'tourn-abort' });
    tournClear();
    renderLobby();
  }
  function tournClear() {
    var t = Net.tourn; if (!t) return;
    if (t.timer) clearTimeout(t.timer);
    if (t.armTimer) clearTimeout(t.armTimer);
    Net.tourn = null;
  }
  function tournAdopt() { // 房主接管後續打：新房主用全員備份的狀態接著主持（局中斷→本局依備份進度結算；局間→直接接手面板）
    var t = Net.tourn; if (!t || !Net.isHost) return;
    if (t.timer) { clearTimeout(t.timer); t.timer = null; }
    if (t.armTimer) { clearTimeout(t.armTimer); t.armTimer = null; }
    tournRebind();
    if (t.phase === 'playing' || t.phase === 'playoff') {
      t.settled = false;
      sysChat('👑 新房主接管賽程：本局依目前進度結算，賽程繼續進行');
      tournSettle();
    } else {
      sysChat('👑 新房主接管賽程：由新房主接著主持');
      var m2 = tournStateMsg(); if (m2) platBroadcast(m2);
      renderTourn();
    }
  }
  // 嗅探遊戲訊息（只在房主端計分）：fromPid 是傳輸層 pid，身份以訊息內 uid/name 為準（轉發不影響）
  function tournSniff(fromPid, d) {
    var t = Net.tourn;
    if (!t || !Net.isHost || t.settled || !d || typeof d !== 'object' || d.__plat) return;
    if (t.phase !== 'playing' && t.phase !== 'playoff') return;
    if (d.type === 'JOIN' && d.uid && d.pName) t.uidMap[d.uid] = tournUidByName(d.pName) || (tournEntrantByPid(fromPid) || {}).uid || null;
    if (d.type === 'PLAYERS_UPDATE' && d.players) d.players.forEach(function (p) { if (p.id && p.name) { var pp = tournUidByName(p.name); if (pp) t.uidMap[p.id] = pp; } });
    if (d.uid && d.name) { var pn = tournUidByName(d.name); if (pn) t.uidMap[d.uid] = pn; }
    var pidOf = function (uid) { return (uid && t.uidMap[uid]) || null; };
    if (t.curGame === 'hashi') {
      if (d.type === 'RACE_START' && !t.startedAt) {
        t.startedAt = d.startAt || Date.now();
        if (t.roundSecs > 0) { t.endsAt = t.startedAt + t.roundSecs * 1000; tournArmTimer(); }
      } else if (d.type === 'RACE_PROGRESS') { var p1 = pidOf(d.uid); if (p1) { t.progress[p1] = d.progress || 0; tournSnapshot(false); } }
      else if (d.type === 'RACE_FINISH' || d.type === 'RACE_DNF') tournMarkFinished(pidOf(d.uid));
    } else if (t.curGame === 'sudoku') {
      if (d.type === 'SYNC' && d.data) {
        // 數獨 SYNC 是 delta 廣播：cells（出題時）與 countdownTarget（開賽時）永遠不在同一封，必須分開認
        var sCells = d.data.cells || (d.data.levelData && d.data.levelData.cells);
        if (sCells && !t.totalBlanks) t.totalBlanks = sCells.filter(function (c) { return !c.isGiven; }).length || 0;
        if (d.data.countdownTarget && !t.startedAt) {
          t.startedAt = d.data.countdownTarget;
          if (t.roundSecs > 0) { t.endsAt = t.startedAt + t.roundSecs * 1000; tournArmTimer(); }
        }
        if (d.data.brawlWinners) d.data.brawlWinners.forEach(function (w) { tournMarkFinished(pidOf(w.id)); });
      } else if (d.type === 'GHOST_I_WON') tournMarkFinished(pidOf(d.senderUid));
      else if (d.type === 'GHOST_SOLVED' && d.uid) {
        var m = t.cellTrack[d.uid] || (t.cellTrack[d.uid] = {});
        m[d.cellId] = d.value;
        var p2 = pidOf(d.uid);
        if (p2 && t.totalBlanks > 0) {
          var cnt = 0; for (var k in m) if (m[k] !== null && m[k] !== undefined) cnt++;
          t.progress[p2] = Math.floor(cnt * 100 / t.totalBlanks);
          tournSnapshot(false);
        }
      }
    }
  }
  // 錦標賽局中「結束本局」浮動鈕：面板裡的同名鈕在比賽中位於回不去的大廳頁、房主摸不到；這顆固定鈕（僅房主、進行中）才是局中可達的入口
  function forceBtnEl() {
    var el = document.getElementById('plat-forceend');
    if (!el) {
      el = document.createElement('button');
      el.id = 'plat-forceend';
      el.textContent = '⏹️ 結束本局';
      el.style.cssText = 'position:fixed;top:calc(62px + env(safe-area-inset-top, 0px));left:50%;transform:translateX(-50%);z-index:295;display:none;background:#f43f5e;color:#fff;border:3px solid #1e293b;border-radius:9999px;padding:7px 18px;font-weight:900;font-size:14px;box-shadow:3px 3px 0 rgba(30,41,59,1);cursor:pointer;';
      el.addEventListener('click', function () { if (Net.tourn && !Net.tourn.settled) tournSettle(); });
      document.body.appendChild(el);
    }
    return el;
  }
  function renderForceBtn() {
    var t = Net.tourn;
    var show = !!(Net.isHost && t && (t.phase === 'playing' || t.phase === 'playoff') && !t.settled);
    forceBtnEl().style.display = show ? 'block' : 'none';
  }
  function renderTourn() {
    renderForceBtn();
    var setup = tournNode('lob-tourn-setup'), panel = tournNode('lob-tourn');
    if (!setup || !panel) return;
    var t = Net.tourn;
    setup.style.display = (Net.isHost && !t && Net.roomTab === 'tourn') ? 'block' : 'none'; // v1.8.2：等待室五戰分頁裡就顯示（舊條件 !Net.inMatch 在房內永遠成立不了 → 五戰分頁全白）
    var tnote = tournNode('lob-tourn-note'); if (tnote) tnote.style.display = (!Net.isHost && Net.active && !t && Net.roomTab === 'tourn') ? 'block' : 'none';
    if (!t) { panel.style.display = 'none'; panel.innerHTML = ''; return; }
    if (t.phase === 'standings' || t.phase === 'playoff-pending' || t.phase === 'ended') {
      var tkey = t.phase + ':' + t.round + ':' + t.history.length;
      if (Net._tabTournKey !== tkey) Net._tabTournKey = tkey;
    }
    panel.style.display = 'block';
    var html = '<div class="lob-game-card"><div class="lob-game-title" style="background:#f59e0b">🏆 錦標賽</div><div class="p-2.5">';
    html += '<div class="flex flex-wrap gap-1.5 mb-2.5">';
    for (var i = 0; i < t.rounds.length; i++) {
      var rn = i + 1, g = t.rounds[i], st = 'bg-slate-100 text-slate-500', mark = '';
      var doneR = false; t.history.forEach(function (h) { if (h.round === rn) doneR = true; });
      if (doneR) { st = 'bg-emerald-100 text-emerald-700'; mark = '✓ '; }
      else if (t.round === rn && (t.phase === 'playing' || t.phase === 'playoff')) { st = 'bg-amber-200 text-slate-800'; mark = '▶ '; }
      html += '<span class="px-2 py-1 rounded-lg border-2 border-slate-800 text-xs font-black ' + st + '">' + mark + '第' + rn + '局 ' + tournGameName(g) + '</span>';
    }
    var hasPlayoff = t.phase === 'playoff' || t.phase === 'playoff-pending';
    t.history.forEach(function (h) { if (h.round > t.totalRounds) hasPlayoff = true; });
    if (hasPlayoff) html += '<span class="px-2 py-1 rounded-lg border-2 border-slate-800 text-xs font-black bg-rose-100 text-rose-600">加賽 數橋</span>';
    html += '</div>';
    if (t.phase === 'playing' || t.phase === 'playoff') html += '<div class="font-black text-slate-700 text-sm mb-2">▶ ' + (t.phase === 'playoff' ? '加賽' : '第 ' + t.round + ' 局') + '進行中：' + tournGameName(t.curGame) + '大亂鬥' + (t.roundSecs > 0 ? '（限時 ' + Math.round(t.roundSecs / 60) + ' 分鐘）' : '') + '</div>';
    else if (t.phase === 'standings') html += '<div class="font-black text-slate-700 text-sm mb-2">第 ' + t.round + ' 局結束，下一局：' + tournGameName(t.rounds[t.round]) + '</div>';
    else if (t.phase === 'playoff-pending') html += '<div class="font-black text-rose-600 text-sm mb-2">⚖️ 總分同分、冠軍局數也同分 — 加賽一局數橋決勝！</div>';
    else if (t.phase === 'ended' && t.champion) html += '<div class="font-black text-amber-600 text-lg mb-1 text-center">🏆 總冠軍：' + esc(t.champion.name) + '</div>' + (t.endNote ? '<div class="text-center text-xs text-slate-500 font-bold mb-1">' + esc(t.endNote) + '</div>' : '');
    if (Net.isHost && (t.phase === 'playing' || t.phase === 'playoff')) {
      html += '<button id="t-forceend" class="w-full mb-2 py-2 bg-rose-500 border-[3px] border-slate-800 rounded-xl font-black text-white active:translate-y-[2px] transition-all">⏹️ 結束本局（以目前進度結算）</button>';
      html += '<div class=\"mb-2 flex flex-col gap-1\">' + t.entrants.map(function (e) {
        var a = (t.acks || {})[e.uid] || {};
        var okIn = a.entered === t.round;
        return '<div class=\"flex items-center justify-between text-xs font-bold ' + (okIn ? 'text-emerald-600' : 'text-amber-600') + '\"><span>' + (okIn ? '🎮' : '⏳') + ' ' + esc(e.name) + (okIn ? ' 已進場' : ' 進場中…') + '</span>' + (!okIn && e.pid !== Net.myPid ? '<button data-t-resend=\"' + e.pid + '\" class=\"px-2 py-0.5 bg-white border-2 border-slate-800 rounded-lg text-slate-700\">重送邀請</button>' : '') + '</div>';
      }).join('') + '</div>';
    }
    if (Net.isHost && t.phase === 'standings') {
      html += '<div class=\"mb-1 flex flex-col gap-1\">' + t.entrants.map(function (e) {
        var a = (t.acks || {})[e.uid] || {};
        var okBack = a.lobby === t.round;
        return '<div class=\"flex items-center justify-between text-xs font-bold ' + (okBack ? 'text-emerald-600' : 'text-amber-600') + '\"><span>' + (okBack ? '🏠' : '⏳') + ' ' + esc(e.name) + (okBack ? ' 已回大廳' : ' 還在遊戲裡…') + '</span>' + (!okBack && e.pid !== Net.myPid ? '<button data-t-rtn=\"' + e.pid + '\" class=\"px-2 py-0.5 bg-white border-2 border-slate-800 rounded-lg text-slate-700\">叫他回大廳</button>' : '') + '</div>';
      }).join('') + '</div>';
    }
    var rows = t.entrants.slice().sort(function (a, b) { return (t.totals[b.uid] || 0) - (t.totals[a.uid] || 0); });
    html += '<table class="w-full text-sm font-bold text-slate-600"><tbody>';
    rows.forEach(function (e, ri) {
      var cells = '';
      for (var r = 0; r < t.history.length; r++) {
        var pl = null;
        t.history[r].placements.forEach(function (x) { if (x.uid ? x.uid === e.uid : x.pid === e.pid) pl = x; });
        cells += '<td class="text-center px-1">' + (pl ? pl.pts : '–') + '</td>';
      }
      html += '<tr><td class="py-1">' + (ri + 1) + '. <span style="display:inline-block;width:10px;height:10px;border-radius:99px;background:' + ((e.color === 'rainbow') ? RAINBOW_BG : (e.color || '#ccc')) + ';vertical-align:middle"></span> ' + esc(e.name) + (e.uid === Net.myUid ? '（你）' : '') + (t.wins[e.uid] ? ' <span class="text-xs text-slate-400">👑×' + t.wins[e.uid] + '</span>' : '') + '</td>' + cells + '<td class="text-right font-black text-slate-800">' + (t.totals[e.uid] || 0) + ' 分</td></tr>';
    });
    html += '</tbody></table>';
    var last = t.history[t.history.length - 1];
    if (last && (t.phase === 'standings' || t.phase === 'playoff-pending' || t.phase === 'ended')) {
      html += '<div class="mt-2 text-xs font-bold text-slate-500">' + (last.round > t.totalRounds ? '加賽' : '第 ' + last.round + ' 局') + '名次：' + last.placements.map(function (pl) { return pl.rank + '. ' + esc(pl.name) + '（' + pl.pts + ' 分' + (pl.finished ? '' : '・未完成 ' + pl.progress + '%') + '）'; }).join('　') + '</div>';
    }
    var missingBack = t.entrants.filter(function (e) { var a = (t.acks || {})[e.uid] || {}; return a.lobby !== t.round; }).length;
    if (Net.isHost && t.phase === 'standings') html += '<button id="t-next" class="w-full mt-3 py-2.5 ' + (missingBack ? 'bg-rose-400' : 'bg-[#f59e0b]') + ' border-[3px] border-slate-800 rounded-xl font-black text-slate-900 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none transition-all">' + (missingBack ? '🚀 強制開始第 ' + (t.round + 1) + ' 局（還有 ' + missingBack + ' 人未回來）' : '▶ 開始第 ' + (t.round + 1) + ' 局：' + tournGameName(t.rounds[t.round])) + '</button>';
    if (Net.isHost && t.phase === 'playoff-pending') html += '<button id="t-playoff" class="w-full mt-3 py-2.5 bg-rose-400 border-[3px] border-slate-800 rounded-xl font-black text-slate-900 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none transition-all">' + (missingBack ? '🚀 強制加賽（還有 ' + missingBack + ' 人未回來）' : '▶ 加賽一局：數橋大亂鬥') + '</button>';
    if (Net.isHost && (t.phase === 'standings' || t.phase === 'playoff-pending')) html += '<button id="t-abort" class="w-full mt-2 py-2 bg-white border-[3px] border-slate-300 rounded-xl font-black text-slate-500 active:translate-y-[2px] transition-all">✖ 中止賽程</button>';
    if (Net.isHost && t.phase === 'ended') html += '<button id="t-abort" class="w-full mt-3 py-2.5 bg-white border-[3px] border-slate-800 rounded-xl font-black text-slate-700 active:translate-y-[2px] transition-all">結束賽程（回房間）</button>';
    if (!Net.isHost && (t.phase === 'standings' || t.phase === 'playoff-pending')) html += '<div class="text-center text-slate-400 font-bold text-xs mt-2">⏳ 等待房主開始下一局…</div>';
    html += '</div></div>';
    panel.innerHTML = html;
    var feb = panel.querySelector('#t-forceend'); if (feb) feb.onclick = function () { if (Net.tourn && !Net.tourn.settled) tournSettle(); };
    var nb = panel.querySelector('#t-next'); if (nb) nb.onclick = function () { var tt = Net.tourn; if (!tt) return; tt.round++; tt.phase = 'playing'; tournStartRound(); };
    var pb = panel.querySelector('#t-playoff'); if (pb) pb.onclick = function () { var tt = Net.tourn; if (!tt) return; tt.round = tt.totalRounds + 1; tt.phase = 'playoff'; tournStartRound(); };
    var ab = panel.querySelector('#t-abort'); if (ab) ab.onclick = function () { tournAbort(); };
    panel.querySelectorAll('[data-t-resend]').forEach(function (b) { b.onclick = function () { var pid2 = b.getAttribute('data-t-resend'); var c2 = Net.conns[pid2]; var tt2 = Net.tourn; if (c2 && tt2) { platSend(c2, { kind: 'launch', game: tt2.curGame, mode: 'brawl', tourn: tournSess() }); var en = tt2.entrants.find(function (x) { return x.pid === pid2; }); sysChat('📨 已重送進場邀請給 ' + (en ? en.name : '玩家')); } }; });
    panel.querySelectorAll('[data-t-rtn]').forEach(function (b) { b.onclick = function () { var pid3 = b.getAttribute('data-t-rtn'); var c3 = Net.conns[pid3]; if (c3) { platSend(c3, { kind: 'return' }); sysChat('📨 已請他回大廳'); } }; });
    // 小局結算頒獎台：history 新增一筆且處於結算相態時播一次（房主/來賓/接管皆經 renderTourn 觸發）
    if ((t.phase === 'standings' || t.phase === 'playoff-pending' || t.phase === 'ended') && t.history && t.history.length) {
      var hk2 = t.history.length + ':' + t.history[t.history.length - 1].round;
      if (Net._podiumKey !== hk2) { Net._podiumKey = hk2; try { podShow(t.history[t.history.length - 1], t); } catch (e) {} }
    }
  }

  // ---------- 視訊（v2.18 禮儀：麥克風預設關、喇叭預設關、發言提示） ----------
  function updateDock() {
    var dock = $('plat-dock'); if (!dock) return;
    dock.style.display = (Net.active && document.body.getAttribute('data-view') === 'lobby') ? 'flex' : 'none'; // strip 只留在大廳：回主頁也要收掉（遊戲畫面由 CSS 隱藏、遊戲自繪膠囊）
    document.body.classList.toggle('dock-on', !!Net.active);
    window.__PLAT_SESSION_ACTIVE = !!Net.active;
    if (window.PlatDock) window.PlatDock._emit();
    var v = $('dock-video'); v.className = Net.videoOn ? 'on' : ''; v.textContent = Net.videoOn ? '📹' : '🎥';
    var mic = $('dock-mic'); mic.style.display = Net.videoOn ? 'flex' : 'none'; mic.textContent = Net.micMuted ? '🔇' : '🎤'; mic.className = Net.micMuted ? '' : 'on';
    var sp = $('dock-speaker');
    sp.style.display = (Net.videoOn || Object.keys(Net.remoteStreams).length > 0) ? 'flex' : 'none';
    sp.textContent = Net.speakerOn ? '🔊' : '🔈'; sp.className = Net.speakerOn ? 'on' : '';
  }
  // 遊戲內底部列的平台按鈕 API（💬/🎥/🎤/🔈/回大廳）：遊戲在平台模式＋連線中時
  // 把這些按鈕畫進自己的底部工具列（與遊戲按鈕同排同款），殼的 strip 只留在大廳。
  window.PlatDock = {
    _subs: [],
    isActive: function () { return !!Net.active; },
    getState: function () {
      return { unread: Net.unread || 0, chatOpen: !!Net.chatOpen, videoOn: !!Net.videoOn, micMuted: !!Net.micMuted, speakerOn: !!Net.speakerOn, remoteCount: Object.keys(Net.remoteStreams).length };
    },
    toggleChat: function () { if (Net.chatOpen) closeChat(); else openChat(); if (window.PlatDock) window.PlatDock._emit(); },
    toggleVideo: function () { toggleVideo(); },
    toggleMic: function () { toggleMic(); },
    toggleSpeaker: function () { toggleSpeaker(); },
    goLobby: function () { window.PLAT_show('home'); }, // 回「大廳」= 平台主頁（使用者明示：不是多人連線選單、也不是等待室）
    subscribe: function (fn) {
      window.PlatDock._subs.push(fn);
      return function () { var i = window.PlatDock._subs.indexOf(fn); if (i >= 0) window.PlatDock._subs.splice(i, 1); };
    },
    _emit: function () { window.PlatDock._subs.slice().forEach(function (f) { try { f(); } catch (e) {} }); }
  };

  // ---------- 共用底部列 PlatBar（單一元件：兩款遊戲的對局底部列都由殼渲染） ----------
  // 遊戲只負責：留掛載點 div、attach(cfg)、狀態變動時 update(state)、卸載時 detach(el)。
  // cfg: { accent:'#ffcc00'|'#4ade80', onAction:function(name, payload) }
  // state: { mode, modes:[{icon,label}], modeTitle, zoomLabel, zoomGlyph,
  //          showInput, inputMode, showDraw, drawTool, showHostClear }
  // popover 開合（zoomOpen/drawOpen）由殼持有；模式鈕規則與數獨/數橋原行為一致：
  // 在塗鴉模式且 popover 關閉時按模式鈕 → 只重開 popover；其餘 → onAction('mode-press') 由遊戲切換。
  var PB = { el: null, cfg: null, state: null, zoomOpen: false, drawOpen: false, dockOpen: false, lastMode: -1, unsub: null, lastJson: null };
  function pbEsc(t) { return String(t == null ? '' : t); }
  function pbRender() {
    if (!PB.el || !PB.state || !PB.cfg) return;
    var st = PB.state, ac = PB.cfg.accent || '#ffcc00';
    var dock = window.PlatDock;
    var ds = dock && dock.isActive() ? dock.getState() : null;
    var drawIdx = st.modes.length - 1;
    var h = '';
    h += '<div class="bg-[#fffdfa]/95 backdrop-blur-md border-t-[4px] border-slate-800 min-h-[4rem] md:min-h-[5rem] flex flex-nowrap items-center justify-between gap-x-2 gap-y-1 py-1 px-3 md:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]" style="width:100%">';
    // 縮放組
    h += '<div class="flex items-center gap-1.5 md:gap-3 bg-slate-100 p-1 rounded-xl border-2 border-slate-300 relative">';
    h += '<button data-pb="zoom-toggle" title="縮放（點開/收合）" class="w-11 h-11 md:w-14 md:h-14 bg-white border-[3px] border-slate-800 rounded-lg shadow-[2px_2px_0px_#1e293b] active:translate-y-[2px] active:shadow-none flex items-center justify-center text-base md:text-lg font-black transition-all" style="--pba:' + ac + '">' + (st.zoomLabel && st.zoomLabel !== '🔍' ? '<span class="text-xs md:text-sm">' + pbEsc(st.zoomLabel) + '</span>' : '🔍') + '</button>';
    if (PB.zoomOpen) {
      h += '<div class="absolute bottom-full mb-3 left-0 flex flex-col gap-2 bg-white border-[3px] border-slate-800 p-2 rounded-2xl shadow-[6px_6px_0px_rgba(30,41,59,0.25)] animate-popUpCenter z-50">';
      h += '<button data-pb="zoom-in" title="放大" class="w-12 h-12 bg-white border-[3px] border-slate-800 rounded-xl flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_#1e293b] active:translate-y-[2px] active:shadow-none transition-all">＋</button>';
      h += '<button data-pb="zoom-out" title="縮小" class="w-12 h-12 bg-white border-[3px] border-slate-800 rounded-xl flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_#1e293b] active:translate-y-[2px] active:shadow-none transition-all">－</button>';
      h += '<button data-pb="zoom-cycle" title="循環切換縮放模式（自動適應）" class="w-12 h-12 bg-slate-800 border-[3px] border-slate-800 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-[2px_2px_0px_#1e293b] active:translate-y-[2px] active:shadow-none transition-all">' + pbEsc(st.zoomGlyph || '🔲') + '</button>';
      h += '</div>';
    }
    h += '</div>';
    // 輸入方式組（數獨專屬，遊戲以 showInput 開啟）
    if (st.showInput) {
      var numOn = st.inputMode !== 'cell';
      h += '<div class="flex items-center bg-slate-800 p-1 rounded-2xl border-2 border-slate-800 shadow-inner">';
      h += '<button data-pb="input-num" class="px-3 md:px-5 py-1.5 md:py-2 rounded-xl font-black text-sm md:text-base flex items-center gap-1.5 md:gap-2 transition-all ' + (numOn ? 'shadow-md' : 'text-slate-400 hover:text-white') + '"' + (numOn ? ' style="background:' + ac + ';color:#0f172a"' : '') + '><span class="text-lg md:text-xl leading-none">🔢</span><span class="hidden sm:inline">數字先行</span></button>';
      h += '<button data-pb="input-cell" class="px-3 md:px-5 py-1.5 md:py-2 rounded-xl font-black text-sm md:text-base flex items-center gap-1.5 md:gap-2 transition-all ' + (!numOn ? 'shadow-md' : 'text-slate-400 hover:text-white') + '"' + (!numOn ? ' style="background:#38bdf8;color:#0f172a"' : '') + '><span class="sm:hidden text-lg leading-none">👆</span><span class="hidden sm:inline">👆 格子先行</span></button>';
      h += '</div>';
    }
    // 模式組
    var md = st.modes[st.mode] || st.modes[0];
    var modeBg = (st.mode === drawIdx && st.modes.length > 2) ? '#34d399' : ac;
    h += '<div class="flex items-center gap-1 md:gap-2 bg-slate-800 p-1 rounded-2xl border-2 border-slate-800 shadow-inner relative">';
    h += '<button data-pb="mode-press" title="' + pbEsc(st.modeTitle || '切換模式') + '" class="px-3 md:px-5 py-1.5 md:py-2 rounded-xl font-black text-sm md:text-base flex items-center gap-1.5 md:gap-2 transition-all shadow-md" style="background:' + modeBg + ';color:#0f172a"><span>' + pbEsc(md.icon) + '</span><span class="hidden sm:inline">' + pbEsc(md.label) + '</span><span style="font-size:10px;opacity:.6">▾</span></button>';
    if (st.showDraw && PB.drawOpen) {
      var penOn = st.drawTool !== 'eraser';
      h += '<div class="absolute bottom-full mb-6 right-0 flex flex-col gap-3 bg-white border-[3px] border-slate-800 p-2.5 rounded-2xl shadow-[10px_10px_0px_rgba(30,41,59,0.2)] animate-popUpCenter z-50">';
      h += '<button data-pb="draw-pen" title="畫筆模式" class="w-12 h-12 border-[3px] rounded-xl flex items-center justify-center transition-all shadow-[2px_2px_0px_#1e293b] active:shadow-none active:translate-y-[2px] ' + (penOn ? 'bg-emerald-100 border-emerald-600' : 'bg-white border-slate-800 hover:bg-slate-50') + '"' + (penOn ? ' style="transform:scale(1.1)"' : '') + '>🖌️</button>';
      h += '<button data-pb="draw-eraser" title="橡皮擦 (雙擊清除自己所有塗鴉)" class="w-12 h-12 border-[3px] rounded-xl flex items-center justify-center transition-all shadow-[2px_2px_0px_#1e293b] active:shadow-none active:translate-y-[2px] ' + (!penOn ? 'bg-orange-100 border-orange-600' : 'bg-white border-slate-800 hover:bg-slate-50') + '"' + (!penOn ? ' style="transform:scale(1.1)"' : '') + '>🧽</button>';
      if (st.showHostClear) h += '<button data-pb="draw-clear" title="房主：清除全場塗鴉" class="w-12 h-12 bg-rose-50 border-[3px] border-rose-800 text-rose-800 rounded-xl flex items-center justify-center hover:bg-rose-100 shadow-[2px_2px_0px_#1e293b] active:shadow-none active:translate-y-[2px]">🚮</button>';
      h += '</div>';
    }
    h += '</div>';
    // 平台 dock capsule（連線中才出現）：列上只留 💬＋🎥；視訊相關控制（麥克風/喇叭/關閉）
    // 收進 🎥 的往上展開 popover（比照縮放/塗鴉），底部列永遠不換行成兩排。
    if (ds) {
      if (!ds.videoOn && ds.remoteCount === 0) PB.dockOpen = false;
      var dbtn = 'position:relative;display:flex;align-items:center;justify-content:center;padding:6px 10px;border-radius:12px;font-size:17px;line-height:1;background:transparent;border:none;cursor:pointer';
      var hasVidCtl = ds.videoOn || ds.remoteCount > 0;
      var popBtn = 'w-12 h-12 border-[3px] border-slate-800 rounded-xl flex items-center justify-center text-xl shadow-[2px_2px_0px_#1e293b] active:translate-y-[2px] active:shadow-none transition-all bg-white';
      h += '<div class="flex items-center gap-0.5 md:gap-1 bg-slate-800 p-1 rounded-2xl border-2 border-slate-800 shadow-inner relative">';
      h += '<button data-pb="dock-chat" title="聊天室" style="' + dbtn + (ds.chatOpen ? ';background:' + ac : '') + '">💬' + (ds.unread > 0 && !ds.chatOpen ? '<span style="position:absolute;top:1px;right:1px;min-width:15px;height:15px;padding:0 3px;border-radius:9999px;background:#ef4444;color:#fff;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center;border:1.5px solid #1e293b">' + ds.unread + '</span>' : '') + '</button>';
      h += '<button data-pb="dock-video" title="視訊" style="' + dbtn + (ds.videoOn ? ';background:' + ac : '') + '">' + (ds.videoOn ? '📹' : '🎥') + (hasVidCtl ? '<span style="font-size:9px;opacity:.75;margin-left:1px">▴</span>' : '') + '</button>';
      if (hasVidCtl && PB.dockOpen) {
        h += '<div class="absolute bottom-full mb-3 right-0 flex flex-col gap-2 bg-white border-[3px] border-slate-800 p-2 rounded-2xl shadow-[6px_6px_0px_rgba(30,41,59,0.25)] animate-popUpCenter z-50">';
        if (ds.videoOn) h += '<button data-pb="dock-mic" title="麥克風" class="' + popBtn + '"' + (!ds.micMuted ? ' style="background:' + ac + '"' : '') + '>' + (ds.micMuted ? '🔇' : '🎤') + '</button>';
        h += '<button data-pb="dock-speaker" title="喇叭" class="' + popBtn + '"' + (ds.speakerOn ? ' style="background:' + ac + '"' : '') + '>' + (ds.speakerOn ? '🔊' : '🔈') + '</button>';
        if (ds.videoOn) h += '<button data-pb="dock-stop" title="關閉視訊" class="w-12 h-12 bg-rose-50 border-[3px] border-rose-800 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#1e293b] active:translate-y-[2px] active:shadow-none transition-all"><span style="font-size:19px">📹</span><span style="font-size:10px;vertical-align:top;color:#9f1239;font-weight:900">✕</span></button>';
        else h += '<button data-pb="dock-start" title="開啟視訊" class="' + popBtn + '">🎥</button>';
        h += '</div>';
      }
      h += '</div>';
    }
    h += '</div>';
    PB.el.innerHTML = h;
    // popover（視訊控制/縮放/塗鴉）開啟時要浮在視訊頭像上面，否則會被自己的頭像遮住按不到
    var anyPop = PB.dockOpen || PB.zoomOpen || PB.drawOpen;
    PB.el.style.position = 'relative';
    PB.el.style.zIndex = anyPop ? '99990' : '';
    var vv = $('plat-videos'); if (vv) vv.style.zIndex = anyPop ? '9990' : '';
  }
  function pbAct(name, payload) { if (PB.cfg && PB.cfg.onAction) { try { PB.cfg.onAction(name, payload); } catch (e) {} } }
  function pbClick(e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-pb]') : null;
    if (!t || !PB.el.contains(t)) return;
    var k = t.getAttribute('data-pb');
    if (k === 'zoom-toggle') { PB.zoomOpen = !PB.zoomOpen; pbRender(); }
    else if (k === 'zoom-in') pbAct('zoom-in');
    else if (k === 'zoom-out') pbAct('zoom-out');
    else if (k === 'zoom-cycle') pbAct('zoom-cycle');
    else if (k === 'input-num') pbAct('input-set', 'num');
    else if (k === 'input-cell') pbAct('input-set', 'cell');
    else if (k === 'mode-press') {
      var st = PB.state; if (!st) return;
      var drawIdx = st.modes.length - 1;
      if (st.showDraw && st.mode === drawIdx && !PB.drawOpen) { PB.drawOpen = true; pbRender(); return; }
      pbAct('mode-press');
    }
    else if (k === 'draw-pen') pbAct('draw-tool', 'pen');
    else if (k === 'draw-eraser') pbAct('draw-tool', 'eraser');
    else if (k === 'draw-clear') pbAct('draw-clear');
    else if (k === 'dock-chat' && window.PlatDock) window.PlatDock.toggleChat();
    else if (k === 'dock-video' && window.PlatDock) {
      var ds2 = window.PlatDock.isActive() ? window.PlatDock.getState() : null;
      if (ds2 && (ds2.videoOn || ds2.remoteCount > 0)) { PB.dockOpen = !PB.dockOpen; pbRender(); }
      else window.PlatDock.toggleVideo();
    }
    else if (k === 'dock-start' && window.PlatDock) { PB.dockOpen = false; window.PlatDock.toggleVideo(); }
    else if (k === 'dock-stop' && window.PlatDock) { PB.dockOpen = false; window.PlatDock.toggleVideo(); }
    else if (k === 'dock-mic' && window.PlatDock) window.PlatDock.toggleMic();
    else if (k === 'dock-speaker' && window.PlatDock) window.PlatDock.toggleSpeaker();
  }
  function pbDblClick(e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-pb]') : null;
    if (!t || !PB.el.contains(t)) return;
    if (t.getAttribute('data-pb') === 'draw-eraser') pbAct('draw-erase-dbl');
  }
  window.PlatBar = {
    attach: function (el, cfg) {
      if (!el) return;
      if (PB.el && PB.el !== el) window.PlatBar.detach(PB.el);
      PB.el = el; PB.cfg = cfg || {}; PB.lastJson = null;
      el.removeEventListener('click', pbClick);
      el.addEventListener('click', pbClick);
      el.removeEventListener('dblclick', pbDblClick);
      el.addEventListener('dblclick', pbDblClick);
      if (!PB.unsub && window.PlatDock) PB.unsub = window.PlatDock.subscribe(function () { pbRender(); });
      pbRender();
    },
    update: function (state) {
      if (!state) return;
      var j = null;
      try { j = JSON.stringify(state); } catch (e) {}
      if (j && j === PB.lastJson && PB.state) { PB.state = state; return; }
      PB.lastJson = j;
      var prevMode = PB.state ? PB.state.mode : -1;
      PB.state = state;
      if (state.mode !== prevMode) {
        var drawIdx = state.modes.length - 1;
        PB.drawOpen = !!(state.showDraw && state.mode === drawIdx);
        PB.lastMode = state.mode;
      }
      pbRender();
    },
    detach: function (el) {
      if (!PB.el || (el && el !== PB.el)) return;
      PB.el.removeEventListener('click', pbClick);
      PB.el.removeEventListener('dblclick', pbDblClick);
      PB.el.innerHTML = '';
      PB.el = null; PB.cfg = null; PB.state = null; PB.lastJson = null; PB.zoomOpen = false; PB.drawOpen = false; PB.dockOpen = false;
      if (PB.unsub) { PB.unsub(); PB.unsub = null; }
    },
    isAttached: function () { return !!PB.el; },
    _debug: function () { return { attached: !!PB.el, inDoc: !!(PB.el && PB.el.isConnected), hasState: !!PB.state, mode0: PB.state && PB.state.modes && PB.state.modes[0] ? PB.state.modes[0].label : null, htmlLen: PB.el ? PB.el.innerHTML.length : -1, zoomOpen: PB.zoomOpen, drawOpen: PB.drawOpen }; }
  };
  // ---------- 共用等待室 PlatRoom（兩款遊戲的多人等待室由殼渲染同一張卡） ----------
  // 遊戲負責：留掛載點、attach(cfg)、update(state)、把自己的「對局設定」JSX 用
  // ReactDOM.createPortal 塞進 PlatRoom.getSlot() 的設定槽（殼不碰那個節點）。
  // state: { title, code, showRefresh,
  //   players:[{key,name,color,isMe,isHost,online,badge:{text,kind}|null,
  //             toggle:{on,labelOn,labelOff}|null, clickable}],
  //   myReady(bool|null), readyOn, readyOff, mySpectator(bool|null),
  //   start:{label,kind:'primary'|'danger',disabled,note}|null, waitingText }
  // actions: refresh / ready / spectator / start / leave /
  //          player-click(key) / player-toggle(key)
  var PR = { el: null, cfg: null, state: null, lastJson: null, unsub: null, slot: null };
  function prRegion(name) { return PR.el ? PR.el.querySelector('[data-pr-region="' + name + '"]') : null; }
  function prAct(name, payload) { if (PR.cfg && PR.cfg.onAction) { try { PR.cfg.onAction(name, payload); } catch (e) {} } }
  function prDockHtml(ac) {
    var dock = window.PlatDock;
    if (!dock || !dock.isActive()) return '';
    var ds = dock.getState();
    var dbtn = 'position:relative;display:flex;align-items:center;justify-content:center;padding:6px 10px;border-radius:12px;font-size:17px;line-height:1;background:transparent;border:none;cursor:pointer';
    var h = '<div class="flex items-center gap-0.5 md:gap-1 bg-slate-800 p-1 rounded-2xl border-2 border-slate-800 shadow-inner">';
    h += '<button data-pr="dock-chat" title="聊天室" style="' + dbtn + (ds.chatOpen ? ';background:' + ac : '') + '">💬' + (ds.unread > 0 && !ds.chatOpen ? '<span style="position:absolute;top:1px;right:1px;min-width:15px;height:15px;padding:0 3px;border-radius:9999px;background:#ef4444;color:#fff;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center;border:1.5px solid #1e293b">' + ds.unread + '</span>' : '') + '</button>';
    h += '<button data-pr="dock-video" title="視訊" style="' + dbtn + (ds.videoOn ? ';background:' + ac : '') + '">' + (ds.videoOn ? '📹' : '🎥') + '</button>';
    if (ds.videoOn) h += '<button data-pr="dock-mic" title="麥克風" style="' + dbtn + (!ds.micMuted ? ';background:' + ac : '') + '">' + (ds.micMuted ? '🔇' : '🎤') + '</button>';
    if (ds.videoOn || ds.remoteCount > 0) h += '<button data-pr="dock-speaker" title="喇叭" style="' + dbtn + (ds.speakerOn ? ';background:' + ac : '') + '">' + (ds.speakerOn ? '🔊' : '🔈') + '</button>';
    return h + '</div>';
  }
  function prRenderRegions() {
    if (!PR.el || !PR.state) return;
    var st = PR.state, ac = (PR.cfg && PR.cfg.accent) || '#ffcc00';
    var t = prRegion('title'); if (t) t.textContent = st.title || '🎮 遊戲大廳';
    var cd = prRegion('code'); if (cd) cd.textContent = st.code || '';
    var rf = prRegion('refresh'); if (rf) rf.style.display = st.showRefresh ? '' : 'none';
    var ro = prRegion('roster');
    if (ro) {
      var h = '';
      (st.players || []).forEach(function (pl) {
        var bg = pl.color === 'rainbow' ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)' : (pl.color || '#ccc');
        h += '<div class="flex items-center gap-2 bg-slate-50 border-2 border-slate-800 rounded-xl px-3 py-2 font-black text-slate-800"' + (pl.clickable ? ' data-pr="player-click" data-key="' + pbEsc(pl.key) + '" style="cursor:pointer' + (pl.pending ? ';opacity:.55' : '') + '"' : (pl.pending ? ' style="opacity:.55"' : '')) + '>';
        h += '<span class="relative shrink-0"><span class="w-4 h-4 rounded-full inline-block border-2 border-slate-800 shadow-inner" style="background:' + bg + (pl.pending ? ';filter:grayscale(1)' : '') + '"></span>';
        if (pl.online !== undefined && pl.online !== null) h += '<span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-white ' + (pl.online ? 'bg-green-500' : 'bg-slate-300') + '"></span>';
        h += '</span>';
        h += '<span class="truncate">' + pbEsc(pl.name || '玩家') + (pl.isMe ? '（你）' : '') + (pl.isHost ? ' 👑' : '') + (pl.pending ? '<span class="text-slate-400">（未到）</span>' : '') + '</span>';
        h += '<span class="ml-auto flex gap-1 shrink-0 items-center">';
        if (pl.toggle) {
          var tg = pl.toggle;
          h += '<button data-pr="player-toggle" data-key="' + pbEsc(pl.key) + '" class="flex items-center gap-1 cursor-pointer select-none bg-transparent border-none">';
          h += '<span class="font-black text-[10px] ' + (tg.on ? 'text-slate-700' : 'text-slate-400') + '">' + pbEsc(tg.on ? tg.labelOn : tg.labelOff) + '</span>';
          h += '<span class="w-10 h-5 rounded-full border-2 border-slate-800 relative shadow-inner inline-block ' + (tg.on ? 'bg-emerald-400' : 'bg-slate-300') + '"><span class="w-3.5 h-3.5 bg-white rounded-full border-2 border-slate-800 absolute top-[1px]" style="left:' + (tg.on ? '18px' : '1px') + '"></span></span>';
          h += '</button>';
        }
        if (pl.badge) {
          var bk = pl.badge.kind === 'ready' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : pl.badge.kind === 'spec' ? 'bg-sky-100 border-sky-400 text-sky-700' : 'bg-slate-100 border-slate-300 text-slate-400';
          h += '<span class="text-[10px] border px-1.5 py-0.5 rounded-md ' + bk + '">' + pbEsc(pl.badge.text) + '</span>';
        }
        h += '</span></div>';
      });
      ro.innerHTML = h;
    }
    var ct = prRegion('controls');
    if (ct) {
      var c = '';
      if (st.myReady !== null && st.myReady !== undefined || st.mySpectator !== null && st.mySpectator !== undefined) {
        c += '<div class="flex gap-2 mb-4">';
        if (st.myReady !== null && st.myReady !== undefined) {
          c += '<button data-pr="ready" class="flex-1 py-3 rounded-xl border-[3px] border-slate-800 font-black text-base shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none transition-all" style="background:' + (st.myReady ? ac : '#ffffff') + ';color:' + (st.myReady ? '#0f172a' : '#64748b') + '">' + pbEsc(st.myReady ? (st.readyOn || '✅ 已準備') : (st.readyOff || '✋ 準備好了')) + '</button>';
        }
        if (st.mySpectator !== null && st.mySpectator !== undefined) {
          c += '<button data-pr="spectator" class="px-4 py-3 rounded-xl border-[3px] border-slate-800 font-black text-base shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none transition-all ' + (st.mySpectator ? 'bg-sky-300 text-slate-900' : 'bg-white text-slate-500') + '">👁️ 觀戰</button>';
        }
        c += '</div>';
      }
      if (st.start) {
        var sk = st.start.kind === 'danger' ? 'background:#f87171;color:#0f172a' : 'background:' + ac + ';color:#0f172a';
        c += '<button data-pr="start"' + (st.start.disabled ? ' disabled' : '') + ' class="w-full py-3.5 border-4 border-slate-800 rounded-xl font-black text-lg shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed" style="' + sk + '">' + pbEsc(st.start.label || '開始') + '</button>';
        if (st.start.note) c += '<p class="text-xs text-slate-500 font-bold text-center mt-2">' + pbEsc(st.start.note) + '</p>';
      } else if (st.waitingText) {
        c += '<p class="font-black text-slate-700 animate-pulse text-center">' + pbEsc(st.waitingText) + '</p>';
      }
      ct.innerHTML = c;
    }
    var dk = prRegion('dock'); if (dk) dk.innerHTML = prDockHtml(ac);
    if (Net.isHost && !Net.tourn && Net.armed.game && Net.inMatch && Net.armed.game !== Net.inMatch) {
      var sb2 = PR.el.querySelector('[data-pr="start"]');
      if (sb2) { sb2.disabled = false; sb2.textContent = '🚀 帶大家去' + (Net.armed.game === 'hashi' ? '數橋' : '數獨'); var np2 = sb2.nextElementSibling; if (np2 && np2.tagName === 'P') np2.style.display = 'none'; }
    }
    renderRoomTabs();
  }
  function prSkeleton() {
    PR.el.innerHTML =
      '<div data-pr-region="tabs" class="mb-3"></div>' +
      '<div class="bg-white border-4 border-slate-800 rounded-3xl shadow-[10px_10px_0px_rgba(30,41,59,1)] p-5 md:p-6 w-full animate-popUpCenter">' +
      '<div class="flex items-center justify-between gap-2 mb-4">' +
      '<h2 data-pr-region="title" class="text-2xl md:text-3xl font-black text-slate-800 tracking-widest">🎮 遊戲大廳</h2>' +
      '<div class="flex items-center gap-2 shrink-0">' +
      '<span class="font-black text-sm text-slate-500">房間代碼 <span data-pr-region="code" class="bg-slate-800 text-white font-mono px-2 py-0.5 rounded-md tracking-widest"></span></span>' +
      '<button data-pr="refresh" data-pr-region="refresh" class="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded border border-slate-400 font-bold shadow-sm transition-colors" style="display:none">🔄 重整名單</button>' +
      '</div></div>' +
      '<div data-pr-region="tourn" style="display:none" class="mb-2"></div>' +
      '<div data-pr-slot="settings"></div>' +
      '<div class="font-black text-slate-700 text-sm mb-1.5 text-left">玩家名單</div>' +
      '<div data-pr-region="roster" class="mb-4 flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1"></div>' +
      '<div data-pr-region="controls"></div>' +
      '<div data-pr-region="dock" class="flex justify-center mt-4"></div>' +
      '<button data-pr="leave" class="w-full mt-4 text-slate-400 font-bold hover:text-slate-800 hover:underline bg-transparent border-none cursor-pointer">離開房間</button>' +
      '</div>';
    PR.slot = PR.el.querySelector('[data-pr-slot="settings"]');
  }
  function prClick(e) {
    var tb = e.target && e.target.closest ? e.target.closest('[data-rtab]') : null;
    if (tb && PR.el.contains(tb)) { if (window.__PLAT_ROOMTAB) window.__PLAT_ROOMTAB('tab', tb.getAttribute('data-rtab')); return; }
    var t = e.target && e.target.closest ? e.target.closest('[data-pr]') : null;
    if (!t || !PR.el.contains(t)) return;
    var k = t.getAttribute('data-pr');
    if (k === 'dock-chat' && window.PlatDock) window.PlatDock.toggleChat();
    else if (k === 'dock-video' && window.PlatDock) window.PlatDock.toggleVideo();
    else if (k === 'dock-mic' && window.PlatDock) window.PlatDock.toggleMic();
    else if (k === 'dock-speaker' && window.PlatDock) window.PlatDock.toggleSpeaker();
    else if (k === 'player-click' || k === 'player-toggle') prAct(k, t.getAttribute('data-key'));
    else if (k === 'start' && tryTransportStart()) { /* 已改道：帶大家去選定的遊戲 */ }
    else prAct(k);
  }
  // ===== PlatCountdown：兩款共用倒數 overlay（同一套邏輯，不寫兩遍）=====
  window.PlatCountdown = (function () {
    var el = null, numEl = null;
    function ensure() {
      if (el) return;
      el = document.createElement('div');
      el.id = 'plat-countdown';
      el.style.cssText = 'position:fixed;inset:0;z-index:300;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)';
      numEl = document.createElement('div');
      numEl.style.cssText = 'font-size:11rem;line-height:1;font-weight:900;color:#ef4444;text-shadow:6px 6px 0 #fff,-6px -6px 0 #fff,6px -6px 0 #fff,-6px 6px 0 #fff;filter:drop-shadow(0 0 30px rgba(255,0,0,.8));font-family:inherit';
      el.appendChild(numEl);
      document.body.appendChild(el);
    }
    return {
      show: function (v) { ensure(); el.style.display = 'flex'; numEl.textContent = v; numEl.style.animation = 'none'; void numEl.offsetWidth; numEl.style.animation = 'platCountPulse .45s ease-in-out infinite alternate'; },
      hide: function () { if (el) el.style.display = 'none'; },
      _visible: function () { return !!(el && el.style.display === 'flex'); }
    };
  })();

  // ---------- 共用結算畫面 PlatResults（數獨/數橋大亂鬥共用同一框架；遊戲只餵 spec：條目/判定/按鈕） ----------
  var PR2 = { spec: null, json: '' };
  function pr2El() {
    var el = document.getElementById('plat-results');
    if (!el) {
      el = document.createElement('div');
      el.id = 'plat-results';
      el.style.cssText = 'position:fixed;inset:0;z-index:850;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.45);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);padding:16px';
      document.body.appendChild(el);
      el.addEventListener('click', function (e) {
        var b = e.target && e.target.closest ? e.target.closest('[data-pres]') : null;
        if (b && !b.disabled && PR2.spec && PR2.spec.onAction) { try { PR2.spec.onAction(b.getAttribute('data-pres')); } catch (err) {} }
      });
    }
    return el;
  }
  function pr2Render() {
    var el = pr2El(); var s = PR2.spec;
    if (!s) { el.style.display = 'none'; el.innerHTML = ''; return; }
    var ac = s.accent || '#ffcc00';
    var medals = ['🥇', '🥈', '🥉'];
    var h = '<div class="bg-white rounded-2xl p-6 md:p-8 border-4 border-slate-800 shadow-[8px_8px_0px_rgba(30,41,59,1)] text-center animate-popUpCenter" style="min-width:300px;max-width:28rem;width:100%;max-height:92vh;overflow-y:auto">';
    h += '<div style="font-size:2.6rem;line-height:1.1">🏆</div>';
    h += '<h2 class="text-2xl md:text-3xl font-black text-slate-800 mb-4">' + pbEsc(s.title || '大亂鬥結果') + '</h2>';
    (s.entries || []).forEach(function (e, i) {
      var medal = medals[i] || ((i + 1) + '.');
      var rowStyle = i === 0 ? 'background:' + ac + '2e;border-color:#1e293b' : 'background:#f8fafc;border-color:#cbd5e1';
      var stripe = e.color === 'rainbow' ? 'background:linear-gradient(180deg, red, orange, yellow, green, blue, indigo, violet)' : 'background:' + (e.color || '#94a3b8');
      h += '<div class="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl text-left" style="border-width:3px;border-style:solid;' + rowStyle + '">'
        + '<span class="shrink-0 text-center" style="font-size:1.4rem;width:2rem">' + medal + '</span>'
        + '<span class="shrink-0 rounded-full" style="width:4px;align-self:stretch;' + stripe + '"></span>'
        + '<span class="font-black text-slate-800 flex-1 truncate">' + pbEsc(e.name || '玩家') + (e.isMe ? '(你)' : '') + (e.isHost ? ' 👑' : '') + '</span>'
        + '<span class="font-mono font-black text-slate-700 shrink-0" style="font-size:.85rem">' + pbEsc(e.right || '') + '</span></div>';
    });
    if (s.waitingText) h += '<p class="font-black text-slate-500 animate-pulse my-2">⏳ ' + pbEsc(s.waitingText) + '</p>';
    if (s.verdict) h += '<p class="text-emerald-600 font-black text-lg my-2">' + pbEsc(s.verdict) + '</p>';
    if (s.stars != null) {
      h += '<div class="flex justify-center gap-2 my-3">';
      for (var si = 0; si < 3; si++) h += '<span style="font-size:2.2rem;line-height:1' + (si < s.stars ? '' : ';opacity:.2;filter:grayscale(1)') + '">⭐</span>';
      h += '</div>';
    }
    if (s.buttons && s.buttons.length) {
      h += '<div class="flex justify-center gap-2 mt-4 flex-wrap">';
      s.buttons.forEach(function (b) {
        var st = b.kind === 'primary' ? 'background:' + ac + ';color:#0f172a' : (b.kind === 'danger' ? 'background:#f87171;color:#0f172a' : 'background:#ffffff;color:#1e293b');
        h += '<button data-pres="' + pbEsc(b.id) + '"' + (b.disabled ? ' disabled' : '') + ' class="px-4 py-3 border-4 border-slate-800 font-black rounded-xl shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] transition-all disabled:opacity-40" style="' + st + '">' + pbEsc(b.label) + '</button>';
      });
      h += '</div>';
    }
    if (s.note) h += '<p class="text-xs font-bold text-slate-400 mt-3">' + pbEsc(s.note) + '</p>';
    h += '</div>';
    el.innerHTML = h;
    el.style.display = 'flex';
  }
  window.PlatResults = {
    show: function (spec) {
      var j = '';
      try { j = JSON.stringify(spec, function (k, v) { return k === 'onAction' ? undefined : v; }); } catch (e) {}
      if (j && j === PR2.json && PR2.spec) { PR2.spec.onAction = spec.onAction; return; }
      PR2.json = j; PR2.spec = spec; pr2Render();
    },
    hide: function () { if (!PR2.spec && !PR2.json) return; PR2.spec = null; PR2.json = ''; pr2Render(); },
    _visible: function () { return !!PR2.spec; }
  };

  // ---------- 五戰小局結算頒獎台（PlatPodium）：前三名上山字台、本局分數動畫加進總分、未得名滾下台 ----------
  var POD = { timer: null, tick: null };
  function podEl() {
    var el = document.getElementById('plat-podium');
    if (!el) {
      el = document.createElement('div'); el.id = 'plat-podium';
      el.style.cssText = 'position:fixed;inset:0;z-index:880;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.45);backdrop-filter:blur(2px);padding:16px;';
      el.addEventListener('click', function () { podHide(); });
      document.body.appendChild(el);
    }
    return el;
  }
  function podHide() {
    var el = document.getElementById('plat-podium'); if (el) el.style.display = 'none';
    if (POD.timer) { clearTimeout(POD.timer); POD.timer = null; }
    if (POD.tick) { clearInterval(POD.tick); POD.tick = null; }
  }
  function podColorOf(t, uid, name) {
    var en = (typeof tournEntrant === 'function') ? tournEntrant(uid) : null;
    if (en && en.color) return en.color;
    return '#94a3b8';
  }
  function podShow(entry, t) {
    if (!entry || !entry.placements || !entry.placements.length) return;
    POD.shownAt = Date.now();
    var el = podEl();
    var pls = entry.placements.slice().sort(function (a, b) { return a.rank - b.rank; });
    var totals = t.totals || {}, wins = t.wins || {};
    var rows = pls.map(function (pl) {
      var after = totals[pl.uid] || 0;
      return { uid: pl.uid, name: pl.name, rank: pl.rank, pts: pl.pts, after: after, before: after - pl.pts, wins: wins[pl.uid] || 0, color: podColorOf(t, pl.uid, pl.name), finished: pl.finished, progress: pl.progress };
    });
    var byTotal = rows.slice().sort(function (a, b) { return (b.after - a.after) || (b.wins - a.wins); });
    var top3 = rows.filter(function (r) { return r.rank <= 3; });
    var rest = rows.filter(function (r) { return r.rank > 3; });
    var medal = { 1: '🥇', 2: '🥈', 3: '🥉' };
    var blockH = { 1: 96, 2: 66, 3: 48 };
    var blockBg = { 1: '#fcd34d', 2: '#e2e8f0', 3: '#fed7aa' };
    var dropDelay = { 1: 0.85, 2: 0.45, 3: 0.15 };
    function chipHtml(r, big) {
      var bg = r.color === 'rainbow' ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)' : r.color;
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;max-width:96px">' +
        (r.rank === 1 ? '<div style="font-size:20px;line-height:1">👑</div>' : '') +
        '<span style="width:' + (big ? 34 : 26) + 'px;height:' + (big ? 34 : 26) + 'px;border-radius:9999px;display:inline-block;border:3px solid #1e293b;background:' + bg + '"></span>' +
        '<span style="font-weight:900;color:#1e293b;font-size:13px;max-width:96px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + pbEsc(r.name) + '</span></div>';
    }
    function colHtml(r) {
      return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;animation:podDrop .55s cubic-bezier(.2,1.6,.4,1) ' + dropDelay[r.rank] + 's both">' +
        chipHtml(r, r.rank === 1) +
        '<div style="width:88px;height:' + blockH[r.rank] + 'px;background:' + blockBg[r.rank] + ';border:3px solid #1e293b;border-bottom:none;border-radius:10px 10px 0 0;display:flex;align-items:flex-start;justify-content:center;padding-top:6px;font-weight:900;font-size:22px;color:#1e293b">' + medal[r.rank] + '</div></div>';
    }
    var stageOrder = [];
    var byRank = {}; top3.forEach(function (r) { byRank[r.rank] = r; });
    if (byRank[2]) stageOrder.push(byRank[2]);
    if (byRank[1]) stageOrder.push(byRank[1]);
    if (byRank[3]) stageOrder.push(byRank[3]);
    var h = '<div style="background:#fff;border:4px solid #1e293b;border-radius:24px;box-shadow:10px 10px 0 rgba(30,41,59,1);padding:20px 18px 14px;width:100%;max-width:430px;text-align:center;animation:podIn .3s ease-out both;max-height:92vh;overflow-y:auto">';
    h += '<div style="font-weight:900;font-size:22px;color:#1e293b">🏆 第 ' + entry.round + ' 局結果</div>';
    h += '<div style="font-weight:900;font-size:13px;color:#64748b;margin-bottom:6px">' + tournGameName(entry.game) + '大亂鬥</div>';
    h += '<div style="display:flex;align-items:flex-end;justify-content:center;gap:6px;border-bottom:4px solid #1e293b;padding:0 4px">' + stageOrder.map(colHtml).join('') + '</div>';
    if (rest.length) {
      h += '<div style="display:flex;justify-content:center;gap:8px;margin-top:10px;flex-wrap:wrap">' + rest.map(function (r, i) {
        return '<span style="animation:podRoll .9s ease-in ' + (1.15 + i * 0.14) + 's both;display:inline-flex">' + chipHtml(r, false) + '</span>';
      }).join('') + '</div>';
      h += '<div style="font-size:11px;font-weight:900;color:#94a3b8;margin-top:2px">未進前三 · 滾下台啦</div>';
    }
    h += '<div style="margin-top:14px;display:flex;flex-direction:column;gap:5px;text-align:left">';
    byTotal.forEach(function (r) {
      var bg2 = r.color === 'rainbow' ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)' : r.color;
      h += '<div style="display:flex;align-items:center;gap:8px;background:#f8fafc;border:2px solid #1e293b;border-radius:12px;padding:5px 10px;font-weight:900;color:#1e293b;font-size:14px">' +
        '<span style="width:14px;height:14px;border-radius:9999px;display:inline-block;border:2px solid #1e293b;background:' + bg2 + ';flex-shrink:0"></span>' +
        '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + pbEsc(r.name) + (r.wins ? ' <span style="color:#d97706;font-size:12px">👑×' + r.wins + '</span>' : '') + '</span>' +
        '<span style="margin-left:auto;font-size:12px;color:#94a3b8">第 ' + r.rank + ' 名</span>' +
        '<span class="pod-plus" style="color:#059669;font-size:13px;opacity:0">+' + r.pts + '</span>' +
        '<span class="pod-score" data-from="' + r.before + '" data-to="' + r.after + '" style="font-family:monospace;font-size:17px;min-width:34px;text-align:right">' + r.before + '</span></div>';
    });
    h += '</div>';
    h += '<div style="margin-top:10px;font-size:11px;font-weight:900;color:#94a3b8">點任意處跳過</div>';
    h += '</div>';
    el.innerHTML = h;
    el.style.display = 'flex';
    // 分數動畫：+N 浮現 + 總分 0.5s 後開始滾動累加（1.15 秒）
    var plus = el.querySelectorAll('.pod-plus');
    setTimeout(function () { plus.forEach(function (s) { s.style.animation = 'podPlus 1.2s ease-out both'; }); }, 450);
    var scores = el.querySelectorAll('.pod-score');
    var t0 = Date.now() + 500;
    if (POD.tick) clearInterval(POD.tick);
    POD.tick = setInterval(function () {
      var elap = Date.now() - t0;
      if (elap < 0) return;
      var p = Math.min(1, elap / 1150);
      var e = 1 - Math.pow(1 - p, 3);
      scores.forEach(function (s) {
        var f = Number(s.getAttribute('data-from')), to = Number(s.getAttribute('data-to'));
        s.textContent = String(Math.round(f + (to - f) * e));
      });
      if (p >= 1) { clearInterval(POD.tick); POD.tick = null; }
    }, 40);
    if (POD.timer) clearTimeout(POD.timer);
    POD.timer = setTimeout(podHide, 5600);
  }
  window.PlatPodium = { show: podShow, hide: podHide, _visible: function () { var el = document.getElementById('plat-podium'); return !!el && el.style.display === 'flex'; } };

  window.PlatRoom = {
    attach: function (el, cfg) {
      if (!el) return;
      if (PR.el && PR.el !== el) window.PlatRoom.detach(PR.el);
      PR.el = el; PR.cfg = cfg || {}; PR.lastJson = null;
      el.removeEventListener('click', prClick);
      el.addEventListener('click', prClick);
      prSkeleton();
      if (!PR.unsub && window.PlatDock) PR.unsub = window.PlatDock.subscribe(function () { var dk = prRegion('dock'); if (dk && PR.state) dk.innerHTML = prDockHtml((PR.cfg && PR.cfg.accent) || '#ffcc00'); });
      prRenderRegions();
      renderRoomTabs();
    },
    update: function (state) {
      if (!state) return;
      var j = null;
      try { j = JSON.stringify(state); } catch (e) {}
      if (j && j === PR.lastJson && PR.state) { PR.state = state; return; }
      PR.lastJson = j; PR.state = state;
      prRenderRegions();
    },
    detach: function (el) {
      if (!PR.el || (el && el !== PR.el)) return;
      rescueTournNodes();
      PR.el.removeEventListener('click', prClick);
      PR.el.innerHTML = '';
      PR.el = null; PR.cfg = null; PR.state = null; PR.lastJson = null; PR.slot = null;
      if (PR.unsub) { PR.unsub(); PR.unsub = null; }
    },
    getSlot: function () { return PR.slot; },
    isAttached: function () { return !!PR.el; },
    _elConnected: function () { return !!(PR.el && PR.el.isConnected); }
  };

  function nameOf(pid) {
    var p = Net.roster.find(function (x) { return x.pid === pid; });
    return p ? (p.name || '玩家') : '玩家';
  }
  function renderVideos() {
    var wrap = $('plat-videos'); if (!wrap) return;
    var hasRemote = Object.keys(Net.remoteStreams).length > 0;
    if (!Net.videoOn && !hasRemote) { wrap.style.display = 'none'; wrap.innerHTML = ''; updateDock(); return; }
    wrap.style.display = 'block'; wrap.innerHTML = '';
    var vidIdx = 0;
    if (Net.videoOn && Net.localStream) {
      wrap.appendChild(makeCircle('你' + (Net.micMuted ? ' 🔇' : ' 🎤'), Net.localStream, true, Net.me.color, 'self', vidIdx++));
    }
    Object.keys(Net.remoteStreams).forEach(function (pid) {
      var nm = nameOf(pid) + (Net.remoteMic[pid] === false ? ' 🎤' : '');
      wrap.appendChild(makeCircle(nm, Net.remoteStreams[pid], false, null, pid, vidIdx++));
    });
    updateDock();
  }
  // 視訊頭像位置：每位玩家在本機自己拖曳決定（不與其他玩家同步），存在 localStorage
  var vidPosCache = null;
  function vidPosMap() {
    if (vidPosCache) return vidPosCache;
    try { vidPosCache = JSON.parse(storeGet('plat_vpos') || '{}') || {}; } catch (e) { vidPosCache = {}; }
    return vidPosCache;
  }
  function applyVidPos(d, key, idx) {
    var p = vidPosMap()[key];
    var W = window.innerWidth || 360, H = window.innerHeight || 640;
    if (p && typeof p.fx === 'number' && typeof p.fy === 'number') {
      d.style.left = Math.max(0, Math.min(Math.max(1, W - 60), p.fx * Math.max(1, W - 60))) + 'px';
      d.style.top = Math.max(0, Math.min(Math.max(1, H - 84), p.fy * Math.max(1, H - 84))) + 'px';
    } else {
      d.style.right = (8 + idx * 68) + 'px';
      d.style.bottom = 'calc(96px + env(safe-area-inset-bottom, 0px))';
    }
    attachVidDrag(d, key);
  }
  function attachVidDrag(d, key) {
    d.addEventListener('pointerdown', function (e) {
      var r = d.getBoundingClientRect();
      var sx = e.clientX, sy = e.clientY, ox = r.left, oy = r.top, moved = false;
      try { d.setPointerCapture(e.pointerId); } catch (err) {}
      d.style.right = ''; d.style.bottom = ''; d.style.left = ox + 'px'; d.style.top = oy + 'px';
      function mv(ev) {
        var dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        var W = window.innerWidth || 360, H = window.innerHeight || 640;
        d.style.left = Math.max(0, Math.min(Math.max(1, W - 60), ox + dx)) + 'px';
        d.style.top = Math.max(0, Math.min(Math.max(1, H - 84), oy + dy)) + 'px';
      }
      function up() {
        d.removeEventListener('pointermove', mv);
        d.removeEventListener('pointerup', up);
        d.removeEventListener('pointercancel', up);
        if (moved) {
          var W = window.innerWidth || 360, H = window.innerHeight || 640;
          var m = vidPosMap();
          m[key] = { fx: (parseFloat(d.style.left) || 0) / Math.max(1, W - 60), fy: (parseFloat(d.style.top) || 0) / Math.max(1, H - 84) };
          try { storeSet('plat_vpos', JSON.stringify(m)); } catch (err) {}
        }
      }
      d.addEventListener('pointermove', mv);
      d.addEventListener('pointerup', up);
      d.addEventListener('pointercancel', up);
      e.preventDefault();
    });
  }
  function makeCircle(label, stream, mirror, color, key, idx) {
    var d = document.createElement('div'); d.className = 'plat-vid';
    var c = document.createElement('div'); c.className = 'circ';
    if (stream) {
      var v = document.createElement('video');
      v.autoplay = true; v.playsInline = true; v.srcObject = stream;
      if (mirror) { v.muted = true; v.style.transform = 'scaleX(-1)'; }
      else { v.className = 'plat-remote-video'; v.muted = !Net.speakerOn; }
      c.appendChild(v);
    } else {
      c.textContent = (label || '？').slice(0, 1);
      if (color) c.style.background = (color === 'rainbow') ? '#a855f7' : color;
    }
    var nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = label;
    d.appendChild(c); d.appendChild(nm);
    applyVidPos(d, key || label, idx || 0);
    return d;
  }
  function broadcastMic() {
    platDistribute({ kind: 'mic', pid: Net.myPid, name: Net.me.name, muted: Net.micMuted }, Net.myPid);
  }
  function onRemoteMic(d) {
    if (d.muted) {
      Net.speakPrompted[d.pid] = false;
      if (Net.speakPid === d.pid) { $('plat-speak').style.display = 'none'; Net.speakPid = null; }
    } else if (!Net.speakerOn && !Net.speakPrompted[d.pid]) {
      Net.speakPrompted[d.pid] = true; Net.speakPid = d.pid;
      $('plat-speak-name').textContent = d.name || nameOf(d.pid);
      $('plat-speak').style.display = 'flex';
    }
  }
  function wireCall(call, pid) {
    Net.calls[pid] = call;
    call.on('stream', function (rs) { Net.remoteStreams[pid] = rs; renderVideos(); });
    call.on('close', function () { delete Net.remoteStreams[pid]; delete Net.calls[pid]; renderVideos(); });
    call.on('error', function () {});
  }
  function handleCall(call) {
    try { call.answer(Net.localStream || undefined); } catch (e) { try { call.answer(); } catch (e2) {} }
    wireCall(call, call.peer);
  }
  function callPeer(pid) {
    if (!Net.peer || !Net.localStream) return;
    try { var call = Net.peer.call(pid, Net.localStream); wireCall(call, pid); } catch (e) {}
  }
  function closeCallOf(pid) {
    if (Net.calls[pid]) { try { Net.calls[pid].close(); } catch (e) {} delete Net.calls[pid]; }
    if (Net.remoteStreams[pid]) { delete Net.remoteStreams[pid]; renderVideos(); }
  }
  function toggleVideo() {
    if (Net.videoOn) { stopVideo(); broadcastMic(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      sysChat('⚠️ 此環境不支援視訊（需要相機權限），請用瀏覽器開啟線上版');
      if ($('view-lobby').classList.contains('active')) lobbyMsg('⚠️ 此環境不支援視訊，請用瀏覽器開啟線上版');
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function (stream) {
      Net.localStream = stream; Net.videoOn = true; Net.micMuted = true;
      var at = stream.getAudioTracks()[0]; if (at) at.enabled = false; // 麥克風預設關閉
      renderVideos();
      Net.roster.forEach(function (p) { if (p.pid !== Net.myPid) callPeer(p.pid); });
      broadcastMic();
    }).catch(function (e) {
      var msg = (e && e.name === 'NotAllowedError') ? '⚠️ 相機/麥克風權限被拒絕' : '⚠️ 無法取得相機/麥克風';
      sysChat(msg); lobbyMsg(msg);
    });
  }
  function stopVideo() {
    if (Net.localStream) { try { Net.localStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} }
    Net.localStream = null; Net.videoOn = false; Net.micMuted = true;
    for (var pid in Net.calls) { try { Net.calls[pid].close(); } catch (e) {} }
    Net.calls = {}; Net.remoteStreams = {};
    renderVideos();
  }
  function toggleMic() {
    if (!Net.localStream) return;
    var at = Net.localStream.getAudioTracks()[0]; if (!at) return;
    at.enabled = !at.enabled; Net.micMuted = !at.enabled;
    updateDock(); renderVideos(); broadcastMic();
  }
  function toggleSpeaker() {
    Net.speakerOn = !Net.speakerOn;
    document.querySelectorAll('.plat-remote-video').forEach(function (el) { try { el.muted = !Net.speakerOn; } catch (e) {} });
    if (Net.speakerOn) { $('plat-speak').style.display = 'none'; Net.speakPid = null; }
    updateDock();
  }

  // ---------- Peer shim ----------
  function VirtualConn(realConn, vp, peerLabel) {
    this._real = realConn; this._vp = vp; this.peer = peerLabel;
    this._cbs = {}; this._closed = false; this.uid = undefined; this._dq = [];
    this.connectionId = realConn.connectionId || ('vc-' + realConn.peer);
  }
  Object.defineProperty(VirtualConn.prototype, 'open', { get: function () { return !this._closed && !(this._vp && this._vp._destroyed) && !!this._real.open; } });
  VirtualConn.prototype.on = function (ev, cb) {
    (this._cbs[ev] = this._cbs[ev] || []).push(cb);
    if (ev === 'open' && this.open) { var s = this; setTimeout(function () { if (!s._closed) cb(); }, 0); }
    if (ev === 'data' && this._dq.length) { var q = this._dq; this._dq = []; var s2 = this; setTimeout(function () { q.forEach(function (m) { s2._deliverData(m); }); }, 0); }
    return this;
  };
  VirtualConn.prototype._deliverData = function (d) {
    if (this._closed) return;
    var l = this._cbs['data'];
    if (l && l.length) this._fire('data', d);
    else { this._dq.push(d); if (this._dq.length > 100) this._dq.shift(); }
  };
  VirtualConn.prototype.send = function (d) { if (this._closed || (this._vp && this._vp._destroyed)) return; tournSniff(Net.myPid, d); try { this._real.send(d); } catch (e) {} };
  VirtualConn.prototype.close = function () { this._closed = true; }; // 共用連線：不關實體連線
  VirtualConn.prototype._fire = function (ev, arg) {
    var l = this._cbs[ev] || [];
    for (var i = 0; i < l.length; i++) { try { l[i](arg); } catch (e) {} }
  };
  function VirtualPeer(id) {
    this.id = id || Net.myPid;
    this._cbs = {}; this._wrappers = {}; this._delivered = {};
    this._destroyed = false; this.disconnected = false; this.connections = {};
    Net.gamePeer = this;
    var self = this;
    setTimeout(function () {
      if (self._destroyed) return;
      self._fire('open', self.id);
      self._deliverAll();
    }, 0);
  }
  VirtualPeer.prototype.on = function (ev, cb) {
    (this._cbs[ev] = this._cbs[ev] || []).push(cb);
    if (ev === 'connection') { var s = this; setTimeout(function () { s._deliverAll(); }, 0); }
    return this;
  };
  VirtualPeer.prototype._fire = function (ev, arg) {
    var l = this._cbs[ev] || [];
    for (var i = 0; i < l.length; i++) { try { l[i](arg); } catch (e) {} }
  };
  VirtualPeer.prototype.wrapperFor = function (realConn, peerLabel) {
    var key = realConn.peer;
    var w = this._wrappers[key];
    if (!w) { w = this._wrappers[key] = new VirtualConn(realConn, this, peerLabel || realConn.peer); }
    else if (w._real !== realConn) { w._real = realConn; w._closed = false; } // 同 pid 重連換了新實體連線：重新綁定，否則遊戲層 send 會一直送進已死的舊連線（收得到、送不出）
    return w;
  };
  VirtualPeer.prototype._deliverAll = function () {
    if (this._destroyed) return;
    for (var pid in Net.conns) this._deliver(Net.conns[pid]);
    if (Net._dq) for (var pid2 in Net._dq) {
      var rc = Net.conns[pid2], qq = Net._dq[pid2];
      if (rc && qq && qq.length) { var w = this.wrapperFor(rc); Net._dq[pid2] = []; qq.forEach(function (m) { w._deliverData(m); }); }
    }
  };
  VirtualPeer.prototype._deliver = function (realConn) {
    if (this._destroyed) return;
    var cbs = this._cbs['connection'] || [];
    if (!cbs.length) return;
    var key = realConn.peer;
    if (this._delivered[key]) return;
    this._delivered[key] = true;
    var w = this.wrapperFor(realConn, realConn.peer);
    cbs.forEach(function (cb) { try { cb(w); } catch (e) {} });
  };
  VirtualPeer.prototype._notifyClose = function (realConn) {
    var w = this._wrappers[realConn.peer];
    if (w && !w._closed) { w._closed = true; w._fire('close'); }
  };
  VirtualPeer.prototype.connect = function (remoteId) {
    var real = null, pid;
    for (pid in Net.conns) { real = Net.conns[pid]; break; }
    if (!real && Net.peer && Net.hostPid) {
      real = Net.peer.connect(Net.hostPid);
      Net.conns[Net.hostPid] = real; wireConn(real);
    }
    return this.wrapperFor(real, remoteId);
  };
  VirtualPeer.prototype.call = function () { // 平台模式視訊由殼接管
    return { on: function () {}, close: function () {}, answer: function () {} };
  };
  VirtualPeer.prototype.destroy = function () {
    this._destroyed = true;
    if (Net.gamePeer === this) Net.gamePeer = null;
    this._fire('close');
  };
  VirtualPeer.prototype.disconnect = function () {};
  VirtualPeer.prototype.reconnect = function () {};

  function PlatPeer(id) {
    if (Net.active) return new VirtualPeer(id);
    return new RealPeer(id);
  }
  window.Peer = PlatPeer;

  // ---------- 初始化 UI 綁定 ----------
  function init() {
    var nameInp = $('lob-name');
    if (nameInp) nameInp.value = '';
    slotName = ''; $('slot-display').textContent = '🎰';
    var savedColor = storeGet('plat_color');
    if (savedColor) Net.me.color = savedColor;
    var codeInp = $('lob-code');
    if (codeInp) codeInp.value = storeGet('plat_last_code') || '';
    renderColors();
    var pvEl = $('plat-ver'); if (pvEl) pvEl.textContent = 'v' + PLAT_VERSION;
    $('lob-go-create').onclick = function () { Net.lobMode = 'create'; $('lob-joinrow').style.display = 'none'; lobbyMsg(''); showStep('nick'); };
    $('lob-go-join').onclick = function () { Net.lobMode = 'join'; $('lob-joinrow').style.display = 'block'; lobbyMsg(''); showStep('nick'); };
    var rjBtn = $('lob-rejoin');
    if (rjBtn) {
      refreshRejoin();
      rjBtn.onclick = function () {
        var rc = storeGet('plat_room'); if (!rc) return;
        var savedName = storeGet('plat_name');
        if (!savedName) { // 尚無身份（第一次）才退回暱稱步，房號已預填
          Net.lobMode = 'join'; $('lob-joinrow').style.display = 'block'; lobbyMsg(''); showStep('nick');
          $('lob-code').value = rc;
          return;
        }
        // 一鍵重連：暱稱/顏色/房號/角色都照舊，直接連線，不經暱稱步
        Net.me.name = savedName;
        var savedColor = storeGet('plat_color'); if (savedColor) Net.me.color = savedColor;
        lobbyMsg('');
        if (storeGet('plat_room_role') === 'host' && rc === storeGet('plat_code')) createRoom();
        else { $('lob-code').value = rc; joinRoom(); }
      };
    }
    $('lob-back').onclick = function () { lobbyMsg(''); showStep('entry'); };
    $('slot-spin').onclick = function () { spinSlot(); };
    var csb = $('lob-color-spin'); if (csb) csb.onclick = function () { spinColor(); };
    nameInp.addEventListener('input', function () { slotName = nameInp.value; $('slot-display').textContent = nameInp.value || '🎰'; });
    $('lob-confirm').onclick = function () {
      var name = (nameInp.value || '').trim();
      if (!name) {
        if (slotTimer) return;
        lobbyMsg('🎰 名字空白，幫你拉霸選一個…');
        spinSlot(function () { $('lob-confirm').click(); });
        return;
      }
      Net.me.name = name; storeSet('plat_name', name);
      if (Net.lobMode === 'join') {
        var c = ($('lob-code').value || '').trim();
        if (c.length !== 4) { lobbyMsg('⚠️ 請輸入 4 位數房號'); return; }
        storeSet('plat_last_code', c);
        joinRoom();
      } else createRoom();
    };
    var tStartBtn = $('t-start'); if (tStartBtn) tStartBtn.onclick = tournCreate;
    $('dock-chat').onclick = function () { Net.chatOpen ? closeChat() : openChat(); };
    $('dock-video').onclick = toggleVideo;
    $('dock-mic').onclick = toggleMic;
    $('dock-speaker').onclick = toggleSpeaker;
    $('dock-lobby').onclick = function () {
      if (Net.inMatch) {
        var g = Net.inMatch;
        if (Net.isHost) { platBroadcast({ kind: 'return' }); doReturnToLobby(); }
        else { Net.inMatch = null; exitGameHook(g); window.PLAT_show('lobby'); renderLobby(); }
      } else window.PLAT_show('lobby');
    };
    $('plat-chat-close').onclick = function (e) { e.stopPropagation(); closeChat(); };
    $('plat-chat-min').onclick = function (e) {
      e.stopPropagation();
      Net.chatMin = !Net.chatMin;
      if (!Net.chatMin) Net.unread = 0;
      renderUnread();
      $('plat-chat-body').style.display = Net.chatMin ? 'none' : 'flex';
      $('plat-chat-min').textContent = Net.chatMin ? '🔼' : '🔽';
    };
    $('plat-chat-head').onclick = function () { $('plat-chat-min').click(); };
    $('plat-chat-send').onclick = sendChat;
    $('plat-chat-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') sendChat(); });
    $('plat-speak-yes').onclick = function () { if (!Net.speakerOn) toggleSpeaker(); $('plat-speak').style.display = 'none'; Net.speakPid = null; };
    $('plat-speak-no').onclick = function () { $('plat-speak').style.display = 'none'; Net.speakPid = null; };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
