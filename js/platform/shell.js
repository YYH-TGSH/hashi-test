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
    if (currentView === 'home') { btn.style.display = 'none'; return; }
    var root = document.getElementById(currentView + '-root');
    var onHome = !!(root && root.textContent && root.textContent.indexOf(HOME_MARKERS[currentView]) >= 0);
    btn.style.display = onHome ? 'block' : 'none';
  }
  setInterval(updateBackBtn, 600);
  window.PLAT_show = function (name) {
    currentView = name;
    ['home', 'sudoku', 'hashi'].forEach(function (v) {
      document.getElementById('view-' + v).classList.toggle('active', v === name);
    });
    document.body.setAttribute('data-view', name);
    updateBackBtn();
    if (name !== 'home') {
      try { boot(name); } catch (e) { status('❌ ' + name + ' 啟動例外: ' + (e && e.message ? e.message : e)); }
    }
    window.scrollTo(0, 0);
  };
  status('殼就緒。點上面的遊戲按鈕開始。');
})();
