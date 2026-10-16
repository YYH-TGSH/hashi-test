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
  // 「🏠 平台」鈕只在遊戲的主畫面出現；進入對局/大廳就自動隱藏（不擋計時器等遊戲 UI）
  var HOME_MARKERS = { sudoku: 'Sudoku Master', hashi: 'Hashi Puzzle' };
  var currentView = 'home';
  function updateBackBtn() {
    var btn = document.getElementById('plat-back');
    if (!btn) return;
    if (currentView === 'home' || currentView === 'lobby') { btn.style.display = 'none'; return; }
    var root = document.getElementById(currentView + '-root');
    var onHome = !!(root && root.textContent && root.textContent.indexOf(HOME_MARKERS[currentView]) >= 0);
    btn.style.display = onHome ? 'block' : 'none';
  }
  setInterval(updateBackBtn, 600);
  window.PLAT_show = function (name) {
    currentView = name;
    ['home', 'sudoku', 'hashi', 'lobby'].forEach(function (v) {
      document.getElementById('view-' + v).classList.toggle('active', v === name);
    });
    document.body.setAttribute('data-view', name);
    updateBackBtn();
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

  var PLAT_COLORS = ['#E3002B', '#F35B00', '#FFC90E', '#D7157A', '#E895C0', '#007A61', '#87D300', '#C4D600', '#8DD1BF', '#616130', '#00538A', '#008CC1', '#00C1D5', '#79C8ED', '#CDBB79', '#41136A', '#935CB9', '#BCA8D1', '#7A0026', '#BC7B70'];
  var RAINBOW_BG = 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)';

  function $(id) { return document.getElementById(id); }
  function storeGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function storeSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function normName(s) { return (s || '').trim().toLowerCase(); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var Net = {
    active: false, isHost: false, code: '', peer: null, myPid: '', hostPid: '',
    me: { name: '', color: PLAT_COLORS[2] },
    roster: [], conns: {}, gamePeer: null, inMatch: null,
    videoOn: false, localStream: null, micMuted: true, speakerOn: false,
    remoteStreams: {}, remoteMic: {}, calls: {}, speakPrompted: {}, speakPid: null,
    chatOpen: false, chatMin: false, unread: 0, ending: false, joinRetry: false
  };
  window.__PLAT_NET = Net;

  var SLOT_NAMES = ['柴犬', '柯基', '虎斑貓', '橘貓', '倉鼠', '兔兔', '刺蝟', '龍貓', '水豚', '樹懶', '狐獴', '羊駝', '企鵝', '海獺', '貓頭鷹', '松鼠', '無尾熊', '台灣黑熊', '石虎', '穿山甲', '梅花鹿', '台灣藍鵲', '帝雉', '獼猴', '山羌', '綠蠵龜', '櫻花鉤吻鮭', '飛魚', '螢火蟲', '獨角仙'];
  var slotName = '', slotTimer = null;
  function spinSlot() {
    if (slotTimer) return;
    var el = $('slot-display'); var t0 = Date.now();
    (function tick() {
      slotName = SLOT_NAMES[Math.floor(Math.random() * SLOT_NAMES.length)];
      el.textContent = slotName;
      var elapsed = Date.now() - t0;
      if (elapsed < 950) slotTimer = setTimeout(tick, 55 + (elapsed / 950) * 140);
      else { slotTimer = null; $('lob-name').value = slotName; }
    })();
  }

  // ---------- 訊息傳送 ----------
  function platSend(conn, obj) { if (!conn) return; var m = { __plat: 1 }; for (var k in obj) m[k] = obj[k]; try { conn.send(m); } catch (e) {} }
  function platBroadcast(obj, exceptPid) {
    for (var pid in Net.conns) { if (pid !== exceptPid) platSend(Net.conns[pid], obj); }
  }
  function platToHost(obj) { var c = Net.conns[Net.hostPid]; if (c) platSend(c, obj); }
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
    $('lob-room').style.display = (s === 'room') ? 'block' : 'none';
  }
  function showIdle() { showStep('entry'); }
  function showRoom() { showStep('room'); }
  function renderLobby() {
    if (!Net.active) { showIdle(); return; }
    showRoom();
    $('lob-room-code').textContent = Net.code;
    $('lob-role').textContent = Net.isHost ? '👑 你是房主' : '👤 玩家';
    var ul = $('lob-roster'); ul.innerHTML = '';
    Net.roster.forEach(function (p) {
      var li = document.createElement('li');
      var dot = document.createElement('span'); dot.className = 'dot';
      dot.style.background = (p.color === 'rainbow') ? RAINBOW_BG : (p.color || '#ccc');
      li.appendChild(dot);
      var nm = document.createElement('span');
      nm.textContent = (p.name || '玩家') + (p.pid === Net.myPid ? '（你）' : '') + (p.host ? ' 👑' : '');
      li.appendChild(nm);
      ul.appendChild(li);
    });
    $('lob-launch').style.display = (Net.isHost && !Net.inMatch) ? 'block' : 'none';
    $('lob-waiting').style.display = (!Net.isHost && !Net.inMatch) ? 'block' : 'none';
    $('lob-inmatch').style.display = Net.inMatch ? 'block' : 'none';
  }
  function renderColors() {
    var wrap = $('lob-colors'); if (!wrap) return;
    wrap.innerHTML = '';
    var unlocked = storeGet('plat_rainbow') === '1';
    PLAT_COLORS.forEach(function (c, i) {
      var b = document.createElement('button');
      b.style.background = c; b.title = c;
      if (Net.me.color === c) b.className = 'sel';
      b.onclick = function () { pickColor(i, c); };
      wrap.appendChild(b);
    });
    if (unlocked) {
      var rb = document.createElement('button');
      rb.style.background = RAINBOW_BG; rb.title = 'rainbow';
      if (Net.me.color === 'rainbow') rb.className = 'sel';
      rb.onclick = function () { Net.me.color = 'rainbow'; storeSet('plat_color', 'rainbow'); renderColors(); };
      wrap.appendChild(rb);
    }
  }
  var tapSeq = [];
  function pickColor(i, c) {
    Net.me.color = c; storeSet('plat_color', c); renderColors();
    tapSeq.push(i); if (tapSeq.length > 4) tapSeq.shift();
    if (tapSeq.join(',') === '0,4,15,19' && storeGet('plat_rainbow') !== '1') {
      storeSet('plat_rainbow', '1'); renderColors(); lobbyMsg('🌈 解鎖隱藏代表色 rainbow！');
    }
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
    var vp = Net.gamePeer;
    if (vp && !vp._destroyed) { try { vp.wrapperFor(c)._fire('data', d); } catch (e) {} }
  }
  function onRealConnClose(c) {
    var pid = c.peer;
    var vp = Net.gamePeer;
    if (vp && !vp._destroyed) { try { vp._notifyClose(c); } catch (e) {} }
    if (!Net.active || Net.ending) { delete Net.conns[pid]; return; }
    delete Net.conns[pid];
    closeCallOf(pid);
    if (!Net.isHost) {
      if (pid === Net.hostPid) { endSession('⚠️ 房主已離線，連線結束'); }
    } else {
      var gone = null;
      Net.roster = Net.roster.filter(function (p) { if (p.pid === pid) { gone = p; return false; } return true; });
      if (gone) {
        sysChat('👋 ' + (gone.name || '玩家') + ' 離開了房間');
        platBroadcast({ kind: 'roster', players: Net.roster, code: Net.code });
        renderLobby();
      }
    }
  }
  function onPlatData(c, d) {
    var pid = c.peer;
    switch (d.kind) {
      case 'join': {
        if (!Net.isHost) return;
        var clash = Net.roster.some(function (p) { return p.pid !== pid && normName(p.name) === normName(d.name); });
        if (clash) { platSend(c, { kind: 'reject', reason: 'name_taken' }); return; }
        if (!Net.roster.some(function (p) { return p.pid === pid; })) {
          Net.roster.push({ pid: pid, name: d.name || '玩家', color: d.color, host: false });
        }
        platSend(c, { kind: 'roster', players: Net.roster, code: Net.code });
        platBroadcast({ kind: 'roster', players: Net.roster, code: Net.code }, pid);
        sysChat('👋 ' + (d.name || '玩家') + ' 加入了房間');
        renderLobby();
        if (Net.videoOn) callPeer(pid);
        if (Net.videoOn || Object.keys(Net.remoteStreams).length) platSend(c, { kind: 'mic', pid: Net.myPid, name: Net.me.name, muted: Net.micMuted });
        break;
      }
      case 'roster': Net.roster = d.players || []; if (d.code) Net.code = d.code; showRoom(); renderLobby(); break;
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
      case 'launch': if (!Net.isHost) doLaunch(d.game, d.mode); break;
      case 'return': if (!Net.isHost) doReturnToLobby(); break;
    }
  }
  function teardownPeer() {
    Net.ending = true;
    try { if (Net.peer) Net.peer.destroy(); } catch (e) {}
    Net.peer = null; Net.conns = {}; Net.active = false; Net.ending = false;
  }
  function endSession(msg) {
    if (!Net.active && !Net.peer) { showIdle(); return; }
    var g = Net.inMatch; Net.inMatch = null;
    stopVideo();
    teardownPeer();
    Net.roster = []; Net.gamePeer = null; Net.isHost = false;
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
    lobbyMsg('正在建立房間…');
    makeHostPeer(code);
  }
  function makeHostPeer(code) {
    var p = new RealPeer('yyh-tgsh-' + code + '-host');
    Net.peer = p;
    p.on('open', function (id) {
      Net.myPid = id; Net.hostPid = id; Net.isHost = true; Net.active = true;
      Net.roster = [{ pid: id, name: Net.me.name, color: Net.me.color, host: true }];
      lobbyMsg(''); renderLobby(); updateDock();
      sysChat('🏠 房間已建立，房號 ' + code + '（把房號告訴朋友）');
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
    lobbyMsg('正在連線到房間 ' + code + '…');
    var p = new RealPeer();
    Net.peer = p;
    p.on('open', function (id) {
      Net.myPid = id;
      var c = p.connect(Net.hostPid);
      Net.conns[Net.hostPid] = c; wireConn(c);
      c.on('open', function () {
        Net.active = true; Net.isHost = false;
        platSend(c, { kind: 'join', name: Net.me.name, color: Net.me.color });
        lobbyMsg('已連上房間，等待房主確認…');
        updateDock();
      });
    });
    p.on('call', function (call) { handleCall(call); });
    p.on('error', function (err) {
      if (err && err.type === 'peer-unavailable') { lobbyMsg('⚠️ 找不到這個房號，房主可能還沒建立房間'); teardownPeer(); showIdle(); return; }
      if (!Net.active) { lobbyMsg('⚠️ 連線失敗：' + (err && err.type ? err.type : '')); teardownPeer(); showIdle(); }
    });
  }
  function leaveRoom() {
    if (!Net.active) { showIdle(); return; }
    if (Net.isHost) platBroadcast({ kind: 'bye' });
    else platToHost({ kind: 'leave', pid: Net.myPid });
    endSession('');
    lobbyMsg('已離開房間');
  }

  // ---------- 進/出對局 ----------
  function waitForHook(game, cb) {
    var tries = 0;
    (function poll() {
      var hk = window['__PLAT_HOOKS_' + game];
      if (hk && hk.enter) { cb(hk); return; }
      if (++tries < 30) setTimeout(poll, 400);
    })();
  }
  function doLaunch(game, mode) {
    Net.inMatch = game;
    renderLobby();
    window.PLAT_show(game);
    waitForHook(game, function (hk) {
      if (Net.inMatch !== game) return;
      try { hk.enter({ code: Net.code, isHost: Net.isHost, name: Net.me.name, mode: mode || 'coop' }); } catch (e) {}
    });
  }
  function exitGameHook(g) { var hk = window['__PLAT_HOOKS_' + g]; if (hk && hk.exit) { try { hk.exit(); } catch (e) {} } }
  function doReturnToLobby() {
    var g = Net.inMatch; Net.inMatch = null;
    if (g) exitGameHook(g);
    renderLobby();
    window.PLAT_show('lobby');
  }
  window.__PLAT_NOTIFY = function (type) {
    if (type === 'game-exit') {
      if (!Net.inMatch) return;
      if (Net.isHost) { platBroadcast({ kind: 'return' }); doReturnToLobby(); }
      else Net.inMatch = null;
    } else if (type === 'host-gone') {
      endSession('⚠️ 與主機連線中斷');
    }
  };

  // ---------- 視訊（v2.18 禮儀：麥克風預設關、喇叭預設關、發言提示） ----------
  function updateDock() {
    var dock = $('plat-dock'); if (!dock) return;
    dock.style.display = Net.active ? 'flex' : 'none';
    var v = $('dock-video'); v.className = Net.videoOn ? 'on' : ''; v.textContent = Net.videoOn ? '📹' : '🎥';
    var mic = $('dock-mic'); mic.style.display = Net.videoOn ? 'flex' : 'none'; mic.textContent = Net.micMuted ? '🔇' : '🎤'; mic.className = Net.micMuted ? '' : 'on';
    var sp = $('dock-speaker');
    sp.style.display = (Net.videoOn || Object.keys(Net.remoteStreams).length > 0) ? 'flex' : 'none';
    sp.textContent = Net.speakerOn ? '🔊' : '🔈'; sp.className = Net.speakerOn ? 'on' : '';
  }
  function nameOf(pid) {
    var p = Net.roster.find(function (x) { return x.pid === pid; });
    return p ? (p.name || '玩家') : '玩家';
  }
  function renderVideos() {
    var wrap = $('plat-videos'); if (!wrap) return;
    var hasRemote = Object.keys(Net.remoteStreams).length > 0;
    if (!Net.videoOn && !hasRemote) { wrap.style.display = 'none'; wrap.innerHTML = ''; updateDock(); return; }
    wrap.style.display = 'flex'; wrap.innerHTML = '';
    if (Net.videoOn && Net.localStream) {
      wrap.appendChild(makeCircle('你' + (Net.micMuted ? ' 🔇' : ' 🎤'), Net.localStream, true, Net.me.color));
    }
    Object.keys(Net.remoteStreams).forEach(function (pid) {
      var nm = nameOf(pid) + (Net.remoteMic[pid] === false ? ' 🎤' : '');
      wrap.appendChild(makeCircle(nm, Net.remoteStreams[pid], false, null));
    });
    updateDock();
  }
  function makeCircle(label, stream, mirror, color) {
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
    this._cbs = {}; this._closed = false; this.uid = undefined;
    this.connectionId = realConn.connectionId || ('vc-' + realConn.peer);
  }
  Object.defineProperty(VirtualConn.prototype, 'open', { get: function () { return !this._closed && !!this._real.open; } });
  VirtualConn.prototype.on = function (ev, cb) {
    (this._cbs[ev] = this._cbs[ev] || []).push(cb);
    if (ev === 'open' && this.open) { var s = this; setTimeout(function () { if (!s._closed) cb(); }, 0); }
    return this;
  };
  VirtualConn.prototype.send = function (d) { if (this._closed) return; try { this._real.send(d); } catch (e) {} };
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
    if (!this._wrappers[key]) this._wrappers[key] = new VirtualConn(realConn, this, peerLabel || realConn.peer);
    return this._wrappers[key];
  };
  VirtualPeer.prototype._deliverAll = function () {
    if (this._destroyed) return;
    for (var pid in Net.conns) this._deliver(Net.conns[pid]);
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
    var savedName = storeGet('plat_name') || '';
    if (nameInp) nameInp.value = savedName;
    if (savedName) { Net.me.name = savedName; slotName = savedName; $('slot-display').textContent = savedName; }
    else { slotName = SLOT_NAMES[Math.floor(Math.random() * SLOT_NAMES.length)]; $('slot-display').textContent = slotName; }
    var savedColor = storeGet('plat_color');
    if (savedColor) Net.me.color = savedColor;
    var codeInp = $('lob-code');
    if (codeInp) codeInp.value = storeGet('plat_last_code') || '';
    renderColors();
    $('lob-go-create').onclick = function () { Net.lobMode = 'create'; $('lob-joinrow').style.display = 'none'; lobbyMsg(''); showStep('nick'); };
    $('lob-go-join').onclick = function () { Net.lobMode = 'join'; $('lob-joinrow').style.display = 'block'; lobbyMsg(''); showStep('nick'); };
    $('lob-back').onclick = function () { lobbyMsg(''); showStep('entry'); };
    $('slot-spin').onclick = spinSlot;
    nameInp.addEventListener('input', function () { slotName = nameInp.value; $('slot-display').textContent = nameInp.value || '🎰'; });
    $('lob-confirm').onclick = function () {
      var name = (nameInp.value || '').trim() || slotName;
      if (!name) { lobbyMsg('⚠️ 先拉霸或輸入暱稱'); return; }
      Net.me.name = name; storeSet('plat_name', name);
      if (Net.lobMode === 'join') {
        var c = ($('lob-code').value || '').trim();
        if (c.length !== 4) { lobbyMsg('⚠️ 請輸入 4 位數房號'); return; }
        storeSet('plat_last_code', c);
        joinRoom();
      } else createRoom();
    };
    $('lob-leave').onclick = leaveRoom;
    document.querySelectorAll('[data-launch]').forEach(function (b) {
      b.onclick = function () {
        var parts = (b.getAttribute('data-launch') || '').split('-');
        var game = parts[0], mode = parts[1] || 'coop';
        platBroadcast({ kind: 'launch', game: game, mode: mode });
        doLaunch(game, mode);
      };
    });
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
