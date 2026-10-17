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
    if (window.__PLAT_SESSION_ACTIVE) { btn.style.display = 'none'; return; }
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
        renderColors(); renderLobby();
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
      if (pid === Net.hostPid) { onHostConnLost(); }
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
        if (Net.inMatch) platSend(c, { kind: 'launch', game: Net.inMatch, mode: Net.matchMode || 'coop' });
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
      case 'launch': if (Net.restored) { Net.restored = false; Net.inMatch = d.game; Net.matchMode = d.mode || 'coop'; window.PLAT_show(d.game); renderLobby(); } else if (!Net.isHost) doLaunch(d.game, d.mode); break;
      case 'return': if (!Net.isHost) doReturnToLobby(); break;
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
        platSend(c, { kind: 'join', name: Net.me.name, color: Net.me.color });
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
    storeSet('plat_room', code);
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
    storeSet('plat_room', code);
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
      if (++tries < 30) setTimeout(poll, 400);
    })();
  }
  function doLaunch(game, mode) {
    Net.inMatch = game; Net.matchMode = mode || 'coop';
    renderLobby();
    window.PLAT_show(game);
    waitForHook(game, function (hk) {
      if (Net.inMatch !== game) return;
      try { hk.enter({ code: Net.code, isHost: Net.isHost, name: Net.me.name, mode: mode || 'coop' }); } catch (e) {}
    });
  }
  function exitGameHook(g) { var hk = window['__PLAT_HOOKS_' + g]; if (hk && hk.exit) { try { hk.exit(); } catch (e) {} } }
  function doReturnToLobby() {
    var g = Net.inMatch; Net.inMatch = null; Net.matchMode = null;
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
      onHostConnLost(); // 接管流程（殼層選舉升格），不再直接結束連線
    }
  };

  // ---------- 視訊（v2.18 禮儀：麥克風預設關、喇叭預設關、發言提示） ----------
  function updateDock() {
    var dock = $('plat-dock'); if (!dock) return;
    dock.style.display = Net.active ? 'flex' : 'none';
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
    goLobby: function () { window.PLAT_show('lobby'); },
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
    _debug: function () { return { attached: !!PB.el, inDoc: !!(PB.el && PB.el.isConnected), hasState: !!PB.state, htmlLen: PB.el ? PB.el.innerHTML.length : -1, zoomOpen: PB.zoomOpen, drawOpen: PB.drawOpen }; }
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
        h += '<div class="flex items-center gap-2 bg-slate-50 border-2 border-slate-800 rounded-xl px-3 py-2 font-black text-slate-800"' + (pl.clickable ? ' data-pr="player-click" data-key="' + pbEsc(pl.key) + '" style="cursor:pointer"' : '') + '>';
        h += '<span class="relative shrink-0"><span class="w-4 h-4 rounded-full inline-block border-2 border-slate-800 shadow-inner" style="background:' + bg + '"></span>';
        if (pl.online !== undefined && pl.online !== null) h += '<span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-white ' + (pl.online ? 'bg-green-500' : 'bg-slate-300') + '"></span>';
        h += '</span>';
        h += '<span class="truncate">' + pbEsc(pl.name || '玩家') + (pl.isMe ? '（你）' : '') + (pl.isHost ? ' 👑' : '') + '</span>';
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
  }
  function prSkeleton() {
    PR.el.innerHTML =
      '<div class="bg-white border-4 border-slate-800 rounded-3xl shadow-[10px_10px_0px_rgba(30,41,59,1)] p-5 md:p-6 w-full animate-popUpCenter">' +
      '<div class="flex items-center justify-between gap-2 mb-4">' +
      '<h2 data-pr-region="title" class="text-2xl md:text-3xl font-black text-slate-800 tracking-widest">🎮 遊戲大廳</h2>' +
      '<div class="flex items-center gap-2 shrink-0">' +
      '<span class="font-black text-sm text-slate-500">房間代碼 <span data-pr-region="code" class="bg-slate-800 text-white font-mono px-2 py-0.5 rounded-md tracking-widest"></span></span>' +
      '<button data-pr="refresh" data-pr-region="refresh" class="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded border border-slate-400 font-bold shadow-sm transition-colors" style="display:none">🔄 重整名單</button>' +
      '</div></div>' +
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
    var t = e.target && e.target.closest ? e.target.closest('[data-pr]') : null;
    if (!t || !PR.el.contains(t)) return;
    var k = t.getAttribute('data-pr');
    if (k === 'dock-chat' && window.PlatDock) window.PlatDock.toggleChat();
    else if (k === 'dock-video' && window.PlatDock) window.PlatDock.toggleVideo();
    else if (k === 'dock-mic' && window.PlatDock) window.PlatDock.toggleMic();
    else if (k === 'dock-speaker' && window.PlatDock) window.PlatDock.toggleSpeaker();
    else if (k === 'player-click' || k === 'player-toggle') prAct(k, t.getAttribute('data-key'));
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
    if (nameInp) nameInp.value = '';
    slotName = ''; $('slot-display').textContent = '🎰';
    var savedColor = storeGet('plat_color');
    if (savedColor) Net.me.color = savedColor;
    var codeInp = $('lob-code');
    if (codeInp) codeInp.value = storeGet('plat_last_code') || '';
    renderColors();
    $('lob-go-create').onclick = function () { Net.lobMode = 'create'; $('lob-joinrow').style.display = 'none'; lobbyMsg(''); showStep('nick'); };
    $('lob-go-join').onclick = function () { Net.lobMode = 'join'; $('lob-joinrow').style.display = 'block'; lobbyMsg(''); showStep('nick'); };
    var rjBtn = $('lob-rejoin');
    if (rjBtn) {
      var rc = storeGet('plat_room');
      if (rc) { rjBtn.style.display = ''; var rcEl = $('lob-rejoin-code'); if (rcEl) rcEl.textContent = rc; }
      rjBtn.onclick = function () {
        Net.lobMode = 'join'; $('lob-joinrow').style.display = 'block'; lobbyMsg(''); showStep('nick');
        $('lob-code').value = storeGet('plat_room') || '';
        if (Net.me.name && !$('lob-name').value) $('lob-name').value = Net.me.name;
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
