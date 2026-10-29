"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
// 踩地雷 Minesweeper（平台第三款遊戲）
// 架構比照數獨/數橋：React 單一 app、平台模式走殼的 Peer 連線（PlatPeer shim）與共用元件（PlatBar/PlatRoom/PlatResults/PlatCountdown）。
// 規則（使用者 2026-10-28 拍板）：多人競速踩到雷直接出局、照當時進度%排名；盤面 9×9・10雷（預設）/16×16・40雷；
// 第一版不做大亂鬥道具（純競速）；第一次點擊永遠不踩雷；觀戰只看已挖開/插旗狀態、不洩漏雷位。
var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useRef = _React.useRef,
  useMemo = _React.useMemo,
  useCallback = _React.useCallback;

// ---------- 小工具（storage 一律 try/catch：iOS 預覽 webview 會封鎖 localStorage） ----------
function sGet(k) {
  try {
    return window.localStorage.getItem(k);
  } catch (e) {
    return null;
  }
}
function sSet(k, v) {
  try {
    window.localStorage.setItem(k, v);
  } catch (e) {}
}
function mulberry32(a) {
  return function () {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hashStr(s) {
  var h = 2166136261;
  for (var i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  var m = Math.floor(sec / 60),
    s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}
function todayStr(d) {
  d = d || new Date();
  var m = d.getMonth() + 1,
    day = d.getDate();
  return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
}
// ---------- 每日一題（日期種子，全員同題；規則比照數獨/數橋） ----------
function dailySeed(dateStr) {
  return hashStr('mines-daily-' + dateStr);
}
function readDailyRecords() {
  try {
    return JSON.parse(sGet('mines_daily_records') || '{}') || {};
  } catch (e) {
    return {};
  }
}
function readDailyStreak() {
  try {
    return JSON.parse(sGet('mines_daily_streak') || 'null') || {
      last: '',
      count: 0
    };
  } catch (e) {
    return {
      last: '',
      count: 0
    };
  }
}
function shiftDate(dateStr, days) {
  var p = dateStr.split('-');
  var d = new Date(+p[0], +p[1] - 1, +p[2]);
  d.setDate(d.getDate() + days);
  return todayStr(d);
}
var DAILY_MIN = '2026-01-01';

// ---------- 盤面引擎（純函式，可獨立驗證） ----------
var SIZES = {
  9: {
    id: 9,
    w: 9,
    h: 9,
    mines: 10,
    name: '9×9・10 雷',
    "short": '9×9'
  },
  16: {
    id: 16,
    w: 16,
    h: 16,
    mines: 40,
    name: '16×16・40 雷',
    "short": '16×16'
  }
};
function neighborsOf(w, h, i) {
  var x = i % w,
    y = Math.floor(i / w),
    out = [];
  for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    var nx = x + dx,
      ny = y + dy;
    if (nx >= 0 && nx < w && ny >= 0 && ny < h) out.push(ny * w + nx);
  }
  return out;
}
// 以 seed 決定性生成雷位（同 seed 全員同一盤）
function makeLayout(w, h, mines, seed) {
  var rnd = mulberry32(seed),
    n = w * h,
    idx = [],
    i,
    j,
    t;
  for (i = 0; i < n; i++) idx.push(i);
  for (i = n - 1; i > 0; i--) {
    j = Math.floor(rnd() * (i + 1));
    t = idx[i];
    idx[i] = idx[j];
    idx[j] = t;
  }
  var L = new Array(n).fill(false);
  for (i = 0; i < mines; i++) L[idx[i]] = true;
  return L;
}
function computeNums(w, h, L) {
  var N = new Array(w * h).fill(0),
    i;
  for (i = 0; i < w * h; i++) {
    if (L[i]) {
      N[i] = -1;
      continue;
    }
    var nb = neighborsOf(w, h, i),
      c = 0;
    for (var k = 0; k < nb.length; k++) if (L[nb[k]]) c++;
    N[i] = c;
  }
  return N;
}
// 第一次點擊保護（2026-10-29 使用者定案）：點的格子＋周圍 8 格整圈都不能有雷——把保護圈內的雷
// 依編號序移到圈外「最低編號的非雷格」（圈內格不可當落點）。確定性：全員同 seed＋同首點 → 同結果；競速時各人只影響自己的盤
// 回傳 { layout: 新盤面, moves: [[from, to], ...] }（moves 空陣列＝本來就安全、盤面不變）
function makeFirstSafe(L, w, h, clickIdx) {
  var zone = {};
  zone[clickIdx] = true;
  neighborsOf(w, h, clickIdx).forEach(function (i) {
    zone[i] = true;
  });
  var NL = L.slice(),
    moves = [];
  Object.keys(zone).map(Number).filter(function (i) {
    return NL[i];
  }).sort(function (a, b) {
    return a - b;
  }).forEach(function (from) {
    NL[from] = false;
    var placed = false;
    for (var i = 0; i < NL.length; i++) {
      if (!zone[i] && !NL[i]) {
        NL[i] = true;
        moves.push([from, i]);
        placed = true;
        break;
      }
    }
    if (!placed) NL[from] = true; // 圈外無空格（本遊戲的雷密度不會發生）：退回原位，不吃掉雷
  });
  return {
    layout: NL,
    moves: moves
  };
}
// 從 from 挖開：回傳 {cells: 新狀態陣列, hit: 踩到的雷 index 或 -1, opened: 本次新開的安全格數}
// cells 狀態：'h' 未開 / 'o' 已開 / 'f' 插旗
function revealFrom(w, h, L, N, cells, from) {
  var NC = cells.slice(),
    opened = 0;
  if (NC[from] !== 'h') return {
    cells: NC,
    hit: -1,
    opened: 0
  };
  if (L[from]) {
    NC[from] = 'o';
    return {
      cells: NC,
      hit: from,
      opened: 0
    };
  }
  var stack = [from];
  while (stack.length) {
    var i = stack.pop();
    if (NC[i] !== 'h' || L[i]) continue;
    NC[i] = 'o';
    opened++;
    if (N[i] === 0) {
      var nb = neighborsOf(w, h, i);
      for (var k = 0; k < nb.length; k++) if (NC[nb[k]] === 'h') stack.push(nb[k]);
    }
  }
  return {
    cells: NC,
    hit: -1,
    opened: opened
  };
}
function countOpened(cells) {
  var c = 0;
  for (var i = 0; i < cells.length; i++) if (cells[i] === 'o') c++;
  return c;
}
function countFlags(cells) {
  var c = 0;
  for (var i = 0; i < cells.length; i++) if (cells[i] === 'f') c++;
  return c;
}

// ---------- 極簡音效（WebAudio，靜音鍵 mines_muted） ----------
var _ac = null;
function beep(freq, dur, type, vol, slideTo) {
  if (sGet('mines_muted') === '1') return;
  try {
    _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
    if (_ac.state === 'suspended') _ac.resume();
    var o = _ac.createOscillator(),
      g = _ac.createGain(),
      t = _ac.currentTime;
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol || 0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(_ac.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch (e) {}
}
var SFX = {
  dig: function dig() {
    beep(520, 0.05, 'sine', 0.06);
  },
  flag: function flag() {
    beep(880, 0.06, 'triangle', 0.07);
  },
  boom: function boom() {
    beep(180, 0.5, 'sawtooth', 0.12, 40);
  },
  win: function win() {
    [523, 659, 784, 1046].forEach(function (f, i) {
      setTimeout(function () {
        beep(f, 0.16, 'triangle', 0.08);
      }, i * 110);
    });
  },
  click: function click() {
    beep(700, 0.04, 'sine', 0.05);
  }
};
var NUM_COLORS = {
  1: '#2563eb',
  2: '#16a34a',
  3: '#dc2626',
  4: '#1e3a8a',
  5: '#7f1d1d',
  6: '#0d9488',
  7: '#111827',
  8: '#6b7280'
};
var ACCENT = '#f97316';
var MP_COLORS = ['#E3002B', '#F35B00', '#b58900', '#D7157A', '#007A61', '#87D300', '#00538A', '#008CC1', '#935CB9', '#7A0026'];
function myGameId() {
  var u = sGet('plat_uid_mines');
  if (!u) {
    u = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    sSet('plat_uid_mines', u);
  }
  return u;
}
function normName(s) {
  return (s || '').trim().toLowerCase();
}
function MinesGame() {
  var isPlat = typeof window !== 'undefined' && !!window.__PLAT_PLATFORM;
  // ---------- 畫面/單機狀態 ----------
  var _useState = useState('home'),
    _useState2 = _slicedToArray(_useState, 2),
    screen = _useState2[0],
    setScreen = _useState2[1]; // home | game
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    showHelp = _useState4[0],
    setShowHelp = _useState4[1];
  var _useState5 = useState(sGet('mines_muted') === '1'),
    _useState6 = _slicedToArray(_useState5, 2),
    muted = _useState6[0],
    setMuted = _useState6[1];
  var _useState7 = useState(9),
    _useState8 = _slicedToArray(_useState7, 2),
    sizeId = _useState8[0],
    setSizeId = _useState8[1];
  var _useState9 = useState(null),
    _useState10 = _slicedToArray(_useState9, 2),
    layout = _useState10[0],
    setLayout = _useState10[1]; // bool[] 雷位（目前這一局）
  var _useState11 = useState(null),
    _useState12 = _slicedToArray(_useState11, 2),
    nums = _useState12[0],
    setNums = _useState12[1]; // int[] 鄰雷數（-1=雷）
  var _useState13 = useState(null),
    _useState14 = _slicedToArray(_useState13, 2),
    cells = _useState14[0],
    setCells = _useState14[1]; // 'h'|'o'|'f'
  var _useState15 = useState(null),
    _useState16 = _slicedToArray(_useState15, 2),
    ownArr = _useState16[0],
    setOwnArr = _useState16[1]; // 合作專用：每格由哪位玩家開啟（players 索引，-1=未開）→ 染玩家色算貢獻
  var _useState17 = useState(function () {
      return typeof window !== 'undefined' && window.innerWidth || 390;
    }),
    _useState18 = _slicedToArray(_useState17, 2),
    vpW = _useState18[0],
    setVpW = _useState18[1]; // 視窗寬（盤面響應式放大用）
  var _useState19 = useState(0),
    _useState20 = _slicedToArray(_useState19, 2),
    curSeed = _useState20[0],
    setCurSeed = _useState20[1];
  var _useState21 = useState('ready'),
    _useState22 = _slicedToArray(_useState21, 2),
    status = _useState22[0],
    setStatus = _useState22[1]; // ready | playing | won | lost
  var _useState23 = useState(-1),
    _useState24 = _slicedToArray(_useState23, 2),
    hitIdx = _useState24[0],
    setHitIdx = _useState24[1];
  var _useState25 = useState('dig'),
    _useState26 = _slicedToArray(_useState25, 2),
    inputMode = _useState26[0],
    setInputMode = _useState26[1]; // dig | flag
  var _useState27 = useState(null),
    _useState28 = _slicedToArray(_useState27, 2),
    startedAt = _useState28[0],
    setStartedAt = _useState28[1];
  var _useState29 = useState(0),
    _useState30 = _slicedToArray(_useState29, 2),
    elapsed = _useState30[0],
    setElapsed = _useState30[1];
  var _useState31 = useState(null),
    _useState32 = _slicedToArray(_useState31, 2),
    dailyDate = _useState32[0],
    setDailyDate = _useState32[1]; // 非 null = 每日一題模式（日期字串）
  var _useState33 = useState(todayStr()),
    _useState34 = _slicedToArray(_useState33, 2),
    dailySel = _useState34[0],
    setDailySel = _useState34[1]; // 主畫面每日一題目前選取日期
  var _useState35 = useState(false),
    _useState36 = _slicedToArray(_useState35, 2),
    showDailyCal = _useState36[0],
    setShowDailyCal = _useState36[1];
  var _useState37 = useState(function () {
      var d = new Date();
      return {
        y: d.getFullYear(),
        m: d.getMonth()
      };
    }),
    _useState38 = _slicedToArray(_useState37, 2),
    dailyCalYM = _useState38[0],
    setDailyCalYM = _useState38[1];
  var firstRef = useRef(true); // 本局是否還沒挖第一下（首點保護/計時起點）
  var statusRef = useRef('ready');
  statusRef.current = status;
  var lpRef = useRef(null); // 長按計時器（長按插旗）

  var spec = SIZES[sizeId] || SIZES[9];
  var totalSafe = spec.w * spec.h - spec.mines;
  var openedSafe = useMemo(function () {
    if (!cells) return 0;
    var c = 0;
    for (var i = 0; i < cells.length; i++) if (cells[i] === 'o' && (!layout || !layout[i])) c++;
    return c;
  }, [cells, layout]); // layout 為 null（合作來賓看不到雷位）時直接數已開格：'o' 恆為安全格，進度才不會恆 0%
  var flagsUsed = useMemo(function () {
    return cells ? countFlags(cells) : 0;
  }, [cells]);
  var progress = totalSafe ? openedSafe / totalSafe : 0;
  var dbgRef = useRef(null); // 唯讀狀態快照（測試/除錯用，掛在 hooks.debug）
  dbgRef.current = {
    layout: layout,
    cells: cells,
    nums: nums,
    owners: ownArr,
    status: status,
    sizeId: sizeId,
    progress: progress,
    openedSafe: openedSafe,
    seed: curSeed,
    screen: screen
  };
  useEffect(function () {
    if (typeof window === 'undefined') return;
    var f = function f() {
      return setVpW(window.innerWidth || 390);
    };
    window.addEventListener('resize', f);
    return function () {
      return window.removeEventListener('resize', f);
    };
  }, []);
  // ---------- 計時 ----------
  useEffect(function () {
    if (!startedAt) return;
    if (status !== 'playing' && !(mpRef.current.on && mpPhase === 'playing')) return; // 多人：首點前 status 還停在 ready，計時靠 mpPhase 驅動
    var iv = setInterval(function () {
      return setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return function () {
      return clearInterval(iv);
    };
  }, [status, startedAt, mpPhase]);
  useEffect(function () {
    if (screen !== 'mp') return;
    var iv = setInterval(function () {
      return setWaitTick(function (t) {
        return t + 1;
      });
    }, 1000);
    return function () {
      return clearInterval(iv);
    };
  }, [screen]);

  // ---------- 開局 ----------
  function newGame(szId, seed, daily) {
    var sp = SIZES[szId] || SIZES[9];
    var sd = seed != null ? seed : Math.random() * 4294967296 >>> 0;
    var L = makeLayout(sp.w, sp.h, sp.mines, sd);
    setSizeId(sp.id);
    setCurSeed(sd);
    setLayout(L);
    setNums(computeNums(sp.w, sp.h, L));
    setCells(new Array(sp.w * sp.h).fill('h'));
    setStatus('ready');
    statusRef.current = 'ready';
    setHitIdx(-1);
    setInputMode('dig');
    setStartedAt(null);
    setElapsed(0);
    setDailyDate(daily || null);
    firstRef.current = true;
    setScreen('game');
  }

  // 挖一格（含首點保護、和弦、勝負判定）——單機與多人共用核心
  function doReveal(from, baseCells, baseLayout, baseNums) {
    var sp = baseCells.length === 256 ? SIZES[16] : SIZES[9]; // 從盤面大小推，不吃 state 更新時序
    var L = baseLayout,
      N = baseNums,
      C = baseCells;
    if (firstRef.current) {
      var fs = makeFirstSafe(L, sp.w, sp.h, from);
      if (fs.moves.length) {
        L = fs.layout;
        N = computeNums(sp.w, sp.h, L);
        setLayout(L);
        setNums(N);
      }
      firstRef.current = false;
      if (!mpRef.current.on) {
        setStartedAt(Date.now());
        startedAtRef.current = Date.now();
      } // 多人：計時起點是 MINE_START 的 startAt（setupBoardFromSeed 已設定）
      setStatus('playing');
      statusRef.current = 'playing';
    }
    var r = revealFrom(sp.w, sp.h, L, N, C, from);
    if (r.hit >= 0) {
      setCells(r.cells);
      setHitIdx(r.hit);
      setStatus('lost');
      statusRef.current = 'lost';
      SFX.boom();
      return {
        hit: r.hit,
        cells: r.cells,
        layout: L,
        nums: N
      };
    }
    if (r.opened > 0) SFX.dig();
    setCells(r.cells);
    var opened = 0;
    for (var i = 0; i < r.cells.length; i++) if (r.cells[i] === 'o' && !L[i]) opened++;
    if (opened >= sp.w * sp.h - sp.mines) {
      setStatus('won');
      statusRef.current = 'won';
      SFX.win();
      if (!mpRef.current.on) onSoloWin(); // 多人場不寫單機最佳紀錄（競速由 afterRaceAction 處理）
    }
    return {
      hit: -1,
      cells: r.cells,
      layout: L,
      nums: N
    };
  }
  function onSoloWin() {
    var t = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : elapsed;
    if (dailyDate) {
      // 每日一題：完成才寫該日最佳；連勝只有今天的題目會動（回補不影響）
      var rec = readDailyRecords();
      if (rec[dailyDate] == null || t < rec[dailyDate]) {
        rec[dailyDate] = t;
        sSet('mines_daily_records', JSON.stringify(rec));
      }
      if (dailyDate === todayStr()) {
        var st = readDailyStreak();
        if (st.last === dailyDate) {/* 同日重玩不重複計 */} else if (st.last === shiftDate(dailyDate, -1)) sSet('mines_daily_streak', JSON.stringify({
          last: dailyDate,
          count: (st.count || 0) + 1
        }));else sSet('mines_daily_streak', JSON.stringify({
          last: dailyDate,
          count: 1
        }));
      }
      return;
    }
    var key = 'mines_best_' + sizeId;
    var prev = parseInt(sGet(key) || '0', 10);
    if (!prev || t < prev) sSet(key, String(t));
  }
  function startDaily(ds) {
    newGame(9, dailySeed(ds), ds);
  }
  function chord(idx) {
    if (!layout || !cells || nums[idx] <= 0) return;
    var sp = cells.length === 256 ? SIZES[16] : SIZES[9],
      nb = neighborsOf(sp.w, sp.h, idx),
      f = 0,
      i;
    for (i = 0; i < nb.length; i++) if (cells[nb[i]] === 'f') f++;
    if (f !== nums[idx]) return;
    var C = cells,
      L = layout,
      N = nums,
      last = {
        cells: C,
        layout: L,
        nums: N
      };
    for (i = 0; i < nb.length; i++) {
      var t = nb[i];
      if (C[t] !== 'h') continue;
      var r = doReveal(t, C, L, N);
      C = r.cells;
      L = r.layout;
      N = r.nums;
      last = r;
      if (r.hit >= 0) return last;
      if (statusRef.current === 'won') return last;
    }
    return last;
  }
  function mpSendAct(kind, idx) {
    // 合作動作：房主自己走定序佇列，來賓送給房主
    if (mpRef.current.isHost) {
      var pl = myPlayer();
      processCoopAct(kind, idx, myId, pl ? pl.name : '');
    } else mpSend({
      type: 'MINE_ACT',
      uid: myId,
      kind: kind,
      idx: idx
    });
  }
  function toggleFlag(idx) {
    if (mpRef.current.on) {
      if (mpRef.current.phase !== 'playing' || iAmSpecRef.current) return;
      if (mpRef.current.mode === 'coop') {
        if (status !== 'won' && status !== 'lost') mpSendAct('flag', idx);
        return;
      }
      if (!cells || outcomeRef.current || cells[idx] === 'o') return;
      var NC2 = cells.slice();
      NC2[idx] = NC2[idx] === 'f' ? 'h' : 'f';
      setCells(NC2);
      SFX.flag();
      raceSendState(NC2, nums, layout, false);
      return;
    }
    if (!cells || status !== 'ready' && status !== 'playing') return;
    if (cells[idx] === 'o') return;
    var NC = cells.slice();
    NC[idx] = NC[idx] === 'f' ? 'h' : 'f';
    setCells(NC);
    SFX.flag();
  }
  function onCellAction(idx) {
    if (lpFiredRef.current) {
      lpFiredRef.current = false;
      return;
    } // 這次 click 是長按插旗的尾巴
    if (mpRef.current.on) {
      if (mpRef.current.phase !== 'playing' || iAmSpecRef.current || !cells) return;
      if (mpRef.current.mode === 'coop') {
        if (status === 'won' || status === 'lost') return;
        if (inputMode === 'flag') {
          mpSendAct('flag', idx);
          return;
        }
        if (cells[idx] === 'f') return;
        if (cells[idx] === 'o') {
          // 合作和弦：把鄰格挖開拆成單格動作依序送出（房主定序，踩雷後後續的會被擋下）
          if (!nums || nums[idx] <= 0) return;
          var sp2 = cells.length === 256 ? SIZES[16] : SIZES[9],
            nb2 = neighborsOf(sp2.w, sp2.h, idx),
            f2 = 0,
            j2;
          for (j2 = 0; j2 < nb2.length; j2++) if (cells[nb2[j2]] === 'f') f2++;
          if (f2 !== nums[idx]) return;
          for (j2 = 0; j2 < nb2.length; j2++) if (cells[nb2[j2]] === 'h') mpSendAct('reveal', nb2[j2]);
          return;
        }
        mpSendAct('reveal', idx);
        return;
      }
      // 競速：本地盤面 + 廣播
      if (outcomeRef.current || status === 'won' || status === 'lost') return;
      if (inputMode === 'flag') {
        toggleFlag(idx);
        return;
      }
      if (cells[idx] === 'f') return;
      var res = cells[idx] === 'o' ? chord(idx) : doReveal(idx, cells, layout, nums);
      if (res) afterRaceAction(res.cells, res.nums, res.layout);
      return;
    }
    if (!cells || status === 'won' || status === 'lost') return;
    if (inputMode === 'flag') {
      toggleFlag(idx);
      return;
    }
    if (cells[idx] === 'f') return;
    if (cells[idx] === 'o') {
      chord(idx);
      return;
    }
    doReveal(idx, cells, layout, nums);
  }
  var lpFiredRef = useRef(false); // 長按已觸發插旗時，隨後的 click 不能再挖
  function onCellDown(idx) {
    if (lpRef.current) clearTimeout(lpRef.current);
    lpFiredRef.current = false;
    lpRef.current = setTimeout(function () {
      lpRef.current = null;
      lpFiredRef.current = true;
      toggleFlag(idx);
    }, 380);
  }
  function onCellUp() {
    if (lpRef.current) {
      clearTimeout(lpRef.current);
      lpRef.current = null;
    }
  }

  // ---------- 多人（平台模式）：星型拓撲（來賓只連房主、房主轉發全場） ----------
  var myId = myGameId();
  var _useState39 = useState(false),
    _useState40 = _slicedToArray(_useState39, 2),
    mpOn = _useState40[0],
    setMpOn = _useState40[1];
  var _useState41 = useState('off'),
    _useState42 = _slicedToArray(_useState41, 2),
    mpPhase = _useState42[0],
    setMpPhase = _useState42[1]; // off|waiting|countdown|playing|done
  var _useState43 = useState([]),
    _useState44 = _slicedToArray(_useState43, 2),
    players = _useState44[0],
    setPlayers = _useState44[1];
  var _useState45 = useState(false),
    _useState46 = _slicedToArray(_useState45, 2),
    myReadySt = _useState46[0],
    setMyReadySt = _useState46[1];
  var _useState47 = useState({}),
    _useState48 = _slicedToArray(_useState47, 2),
    godBoards = _useState48[0],
    setGodBoards = _useState48[1];
  var _useState49 = useState(null),
    _useState50 = _slicedToArray(_useState49, 2),
    godUid = _useState50[0],
    setGodUid = _useState50[1];
  var _useState51 = useState(null),
    _useState52 = _slicedToArray(_useState51, 2),
    raceFinal = _useState52[0],
    setRaceFinal = _useState52[1];
  var _useState53 = useState(null),
    _useState54 = _slicedToArray(_useState53, 2),
    myOutcome = _useState54[0],
    setMyOutcome = _useState54[1]; // 'finished'|'boom'
  var _useState55 = useState(false),
    _useState56 = _slicedToArray(_useState55, 2),
    leaveArm = _useState56[0],
    setLeaveArm = _useState56[1];
  var _useState57 = useState(false),
    _useState58 = _slicedToArray(_useState57, 2),
    feArm = _useState58[0],
    setFeArm = _useState58[1];
  var _useState59 = useState(''),
    _useState60 = _slicedToArray(_useState59, 2),
    coopBoomBy = _useState60[0],
    setCoopBoomBy = _useState60[1];
  var _useState61 = useState(null),
    _useState62 = _slicedToArray(_useState61, 2),
    cdNum = _useState62[0],
    setCdNum = _useState62[1];
  var _useState63 = useState(0),
    _useState64 = _slicedToArray(_useState63, 2),
    waitTick = _useState64[0],
    setWaitTick = _useState64[1];
  var mpRef = useRef({
    on: false,
    isHost: false,
    mode: 'coop',
    tourn: false,
    hub: false,
    code: '',
    sizeId: 9,
    seed: 0,
    startAt: 0,
    phase: 'off'
  });
  var playersRef = useRef([]);
  var peerRef = useRef(null),
    connsRef = useRef([]),
    hostConnRef = useRef(null);
  var godRef = useRef({}),
    outcomeRef = useRef(null),
    finalRef = useRef(null);
  var boardRef = useRef({
    layout: null,
    nums: null,
    cells: null,
    owners: null
  });
  var waitSinceRef = useRef(0),
    autoIvRef = useRef(null),
    cdIvRef = useRef(null);
  var stateAtRef = useRef(0),
    lastProgRef = useRef(-1),
    dismissRef = useRef(null);
  var stateArgsRef = useRef(null),
    stateTrailRef = useRef(null); // MINE_STATE 節流的尾隨補送（純插旗不改 progress，沒補送對手永遠看不到最後一支旗）
  var startedAtRef = useRef(null),
    myReadyRef = useRef(false),
    leaveArmTimerRef = useRef(null),
    feArmTimerRef = useRef(null);
  var iAmSpecRef = useRef(false);
  function setPlayersBoth(p) {
    playersRef.current = p;
    setPlayers(p);
  }
  function myPlayer() {
    return playersRef.current.find(function (p) {
      return p.id === myId;
    }) || null;
  }
  function iAmSpec() {
    var p = myPlayer();
    return !!(p && p.spectator);
  }
  function hostBroadcast(msg, exceptConn) {
    connsRef.current.forEach(function (c) {
      if (c !== exceptConn && c.open) {
        try {
          c.send(msg);
        } catch (e) {}
      }
    });
  }
  function mpSend(msg) {
    // 來賓→房主；房主→全場
    if (mpRef.current.isHost) hostBroadcast(msg);else if (hostConnRef.current && hostConnRef.current.open) {
      try {
        hostConnRef.current.send(msg);
      } catch (e) {}
    }
  }
  function godSet(uid, patch) {
    var cur = godRef.current[uid] || {
      progress: 0,
      state: 'playing',
      cells: '',
      nums: {}
    };
    godRef.current = Object.assign({}, godRef.current, _defineProperty({}, uid, Object.assign({}, cur, patch)));
    setGodBoards(godRef.current);
  }
  function openedSafeOf(cellsArr, layoutArr) {
    var c = 0;
    if (!cellsArr || !layoutArr) return 0;
    for (var i = 0; i < cellsArr.length; i++) if (cellsArr[i] === 'o' && !layoutArr[i]) c++;
    return c;
  }
  function cleanupMp() {
    if (autoIvRef.current) {
      clearInterval(autoIvRef.current);
      autoIvRef.current = null;
    }
    if (cdIvRef.current) {
      clearInterval(cdIvRef.current);
      cdIvRef.current = null;
    }
    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch (e) {}
      peerRef.current = null;
    }
    connsRef.current = [];
    hostConnRef.current = null;
    mpRef.current = {
      on: false,
      isHost: false,
      mode: 'coop',
      tourn: false,
      hub: false,
      code: '',
      sizeId: 9,
      seed: 0,
      startAt: 0,
      phase: 'off'
    };
    setMpOn(false);
    setMpPhase('off');
    setPlayersBoth([]);
    setMyReadySt(false);
    myReadyRef.current = false;
    setGodBoards({});
    godRef.current = {};
    setRaceFinal(null);
    finalRef.current = null;
    setMyOutcome(null);
    outcomeRef.current = null;
    setCdNum(null);
    iAmSpecRef.current = false;
    boardRef.current = {
      layout: null,
      nums: null,
      cells: null,
      owners: null
    }; // 上一場的權威盤面不可殘留到新場次（新 session 的 waiting 期若收到 ACT 會拿舊盤運算，稽核修）
  }

  // ----- 競速：本地狀態送出（progress 小訊息 + god 用盤面快照節流） -----
  function raceSendState(cellsArr, numsArr, layoutArr, force) {
    var opened = openedSafeOf(cellsArr, layoutArr);
    var total = layoutArr.length - (SIZES[mpRef.current.sizeId] || SIZES[9]).mines;
    var prog = total ? opened / total : 0;
    godSet(myId, {
      progress: prog
    });
    var pi = Math.floor(prog * 100);
    if (pi !== lastProgRef.current) {
      lastProgRef.current = pi;
      mpSend({
        type: 'MINE_PROGRESS',
        uid: myId,
        progress: prog
      });
    }
    stateArgsRef.current = [cellsArr, numsArr, layoutArr];
    var now = Date.now();
    if (!force && now - stateAtRef.current < 250) {
      if (!stateTrailRef.current) stateTrailRef.current = setTimeout(function () {
        stateTrailRef.current = null;
        if (stateArgsRef.current) raceSendState(stateArgsRef.current[0], stateArgsRef.current[1], stateArgsRef.current[2], true);
      }, 270);
      return;
    }
    stateAtRef.current = now;
    var sparse = {};
    for (var i = 0; i < cellsArr.length; i++) if (cellsArr[i] === 'o') sparse[i] = numsArr[i];
    mpSend({
      type: 'MINE_STATE',
      uid: myId,
      cells: cellsArr.join(''),
      nums: sparse,
      progress: prog
    });
    godSet(myId, {
      cells: cellsArr.join(''),
      nums: sparse,
      progress: prog
    });
  }
  function afterRaceAction(cellsArr, numsArr, layoutArr) {
    if (!mpRef.current.on || mpRef.current.mode !== 'race') return;
    if (outcomeRef.current) return;
    if (statusRef.current === 'won') {
      outcomeRef.current = 'finished';
      setMyOutcome('finished');
      var tms = Date.now() - mpRef.current.startAt;
      raceSendState(cellsArr, numsArr, layoutArr, true);
      godSet(myId, {
        state: 'finished',
        timeMs: tms,
        progress: 1
      });
      mpSend({
        type: 'MINE_FINISH',
        uid: myId,
        timeMs: tms
      });
      checkRaceEnd();
    } else if (statusRef.current === 'lost') {
      outcomeRef.current = 'boom';
      setMyOutcome('boom');
      var opened = openedSafeOf(cellsArr, layoutArr),
        total = layoutArr.length - (SIZES[mpRef.current.sizeId] || SIZES[9]).mines;
      var prog = total ? opened / total : 0;
      raceSendState(cellsArr, numsArr, layoutArr, true);
      godSet(myId, {
        state: 'boom',
        progress: prog,
        boomAt: Date.now()
      });
      mpSend({
        type: 'MINE_BOOM',
        uid: myId,
        progress: prog
      });
      checkRaceEnd();
    } else {
      raceSendState(cellsArr, numsArr, layoutArr, false);
    }
  }
  function checkRaceEnd() {
    if (finalRef.current || !mpRef.current.on || mpRef.current.mode !== 'race') return;
    var racers = playersRef.current.filter(function (p) {
      return !p.spectator && !p.pending;
    });
    if (!racers.length) return;
    var allDone = racers.every(function (p) {
      if (p.offline) return true;
      var g = godRef.current[p.id];
      return g && (g.state === 'finished' || g.state === 'boom');
    });
    if (!allDone) return;
    var fins = [],
      booms = [],
      rest = [];
    racers.forEach(function (p) {
      var g = godRef.current[p.id] || {
        progress: 0,
        state: 'playing'
      };
      var e = {
        key: p.id,
        name: p.name,
        color: p.color,
        isMe: p.id === myId,
        uid: p.id,
        g: g,
        offline: !!p.offline
      };
      if (g.state === 'finished') fins.push(e);else if (g.state === 'boom') booms.push(e);else rest.push(e);
    });
    fins.sort(function (a, b) {
      return (a.g.timeMs || 0) - (b.g.timeMs || 0);
    });
    booms.sort(function (a, b) {
      return (b.g.progress || 0) - (a.g.progress || 0) || (a.g.boomAt || 0) - (b.g.boomAt || 0);
    });
    rest.sort(function (a, b) {
      return (b.g.progress || 0) - (a.g.progress || 0);
    });
    var entries = fins.concat(booms, rest).map(function (e) {
      return {
        key: e.key,
        name: e.name,
        color: e.color,
        isMe: e.isMe,
        right: e.g.state === 'finished' ? '⏱ ' + fmtTime(Math.floor((e.g.timeMs || 0) / 1000)) : e.g.state === 'boom' ? '💥 ' + Math.floor((e.g.progress || 0) * 100) + '%' : '未完成・' + Math.floor((e.g.progress || 0) * 100) + '%'
      };
    });
    var fin = {
      entries: entries,
      winnerUid: fins.length ? fins[0].key : null
    };
    finalRef.current = fin;
    setRaceFinal(fin);
    mpRef.current.phase = 'done';
    setMpPhase('done');
  }

  // ----- 合作：房主權威定序（MINE_DO 帶權威盤面，全員照抄，保證一致） -----
  function encOwners(O) {
    return O ? O.map(function (o) {
      return o < 0 ? '-' : o.toString(36);
    }).join('') : undefined;
  }
  function decOwners(s) {
    return s ? s.split('').map(function (ch) {
      return ch === '-' ? -1 : parseInt(ch, 36);
    }) : null;
  }
  function coopSparse(cellsArr, numsArr) {
    var s = {};
    for (var i = 0; i < cellsArr.length; i++) if (cellsArr[i] === 'o') s[i] = numsArr[i];
    return s;
  }
  function processCoopAct(kind, idx, byUid, byName) {
    if (statusRef.current === 'won' || statusRef.current === 'lost') return; // 本局結束後的動作一律擋下（和弦拆送的後續格靠這裡截斷）
    var B = boardRef.current;
    if (!B.layout || !B.cells) return;
    var sp = SIZES[mpRef.current.sizeId] || SIZES[9];
    var L = B.layout,
      N = B.nums,
      C = B.cells.slice(),
      hit = -1,
      stAfter = 'playing';
    var OWN = B.owners ? B.owners.slice() : new Array(C.length).fill(-1);
    if (kind === 'flag') {
      if (C[idx] === 'h') C[idx] = 'f';else if (C[idx] === 'f') C[idx] = 'h';else return;
    } else {
      if (C[idx] !== 'h') return;
      var reloc = null;
      if (firstRef.current) {
        var fs2 = makeFirstSafe(L, sp.w, sp.h, idx);
        if (fs2.moves.length) {
          L = fs2.layout;
          N = computeNums(sp.w, sp.h, L);
          reloc = fs2.moves;
        }
        firstRef.current = false;
      }
      var r = revealFrom(sp.w, sp.h, L, N, C, idx);
      var prevC = C;
      C = r.cells;
      hit = r.hit;
      if (hit >= 0) stAfter = 'lost';else if (openedSafeOf(C, L) >= sp.w * sp.h - sp.mines) stAfter = 'won';
      var aIdx = playersRef.current.findIndex(function (p) {
        return p.id === byUid;
      }); // 貢獻歸屬：這次動作新開的格（含洪泛展開＋踩到的雷）都算動作玩家開啟
      if (aIdx >= 0) {
        for (var oi = 0; oi < C.length; oi++) if (prevC[oi] !== 'o' && C[oi] === 'o') OWN[oi] = aIdx;
      }
    }
    boardRef.current = {
      layout: L,
      nums: N,
      cells: C,
      owners: OWN
    };
    var msg = {
      type: 'MINE_DO',
      kind: kind,
      idx: idx,
      uid: byUid,
      byName: byName || '',
      cells: C.join(''),
      sparse: coopSparse(C, N),
      hit: hit,
      statusAfter: stAfter,
      reloc: reloc || undefined,
      own: kind === 'flag' ? undefined : encOwners(OWN),
      mines: stAfter === 'lost' ? L.map(function (v, i) {
        return v ? i : -1;
      }).filter(function (v) {
        return v >= 0;
      }) : undefined
    };
    hostBroadcast(msg);
    adoptCoopDo(msg);
  }
  function adoptCoopDo(m) {
    var arr = (m.cells || '').split('');
    // boardRef 必須跟著 MINE_DO 同步：來賓的 boardRef 原本整場停在開局快照，房主中途離開、來賓接任後 processCoopAct 會拿舊盤面定序、把全場進度洗掉（稽核修・高）
    var bL = boardRef.current.layout,
      bN = boardRef.current.nums;
    if (m.reloc && bL) {
      var NL2 = bL.slice();
      var pairs = typeof m.reloc[0] === 'number' ? [m.reloc] : m.reloc;
      pairs.forEach(function (pr) {
        NL2[pr[0]] = false;
        NL2[pr[1]] = true;
      });
      bL = NL2;
      var spR = SIZES[mpRef.current.sizeId] || SIZES[9];
      bN = computeNums(spR.w, spR.h, bL);
      if (mpRef.current.isHost) {
        setLayout(bL);
        setNums(bN);
      }
    }
    if (m.statusAfter === 'lost' && m.mines) {
      var LL = new Array(arr.length).fill(false);
      m.mines.forEach(function (i) {
        LL[i] = true;
      });
      bL = LL;
    }
    var OA = m.own ? decOwners(m.own) : boardRef.current.owners;
    boardRef.current = {
      layout: bL,
      nums: bN,
      cells: arr.slice(),
      owners: OA
    };
    if (m.own) setOwnArr(OA);
    setCells(arr);
    setNums(function (prev) {
      var N = prev ? prev.slice() : new Array(arr.length).fill(0);
      for (var k in m.sparse) N[+k] = m.sparse[k];
      return N;
    });
    if (m.hit >= 0) setHitIdx(m.hit);
    if (m.statusAfter === 'lost') {
      if (m.mines) {
        var L = new Array(arr.length).fill(false);
        m.mines.forEach(function (i) {
          L[i] = true;
        });
        setLayout(L);
      }
      setStatus('lost');
      statusRef.current = 'lost';
      setCoopBoomBy(m.byName || '');
      SFX.boom();
      mpRef.current.phase = 'done';
      setMpPhase('done');
    } else if (m.statusAfter === 'won') {
      setStatus('won');
      statusRef.current = 'won';
      SFX.win();
      mpRef.current.phase = 'done';
      setMpPhase('done');
    } else {
      setStatus('playing');
      statusRef.current = 'playing';
      if (m.kind === 'reveal') SFX.dig();else SFX.flag();
    }
  }

  // ----- 開局 -----
  function setupBoardFromSeed(seed, szId, startAt) {
    var sp = SIZES[szId] || SIZES[9];
    var L = makeLayout(sp.w, sp.h, sp.mines, seed);
    var N = computeNums(sp.w, sp.h, L);
    var C = new Array(sp.w * sp.h).fill('h');
    setSizeId(sp.id);
    setCurSeed(seed);
    setLayout(L);
    setNums(N);
    setCells(C);
    var OW0 = new Array(sp.w * sp.h).fill(-1);
    setOwnArr(OW0);
    boardRef.current = {
      layout: L,
      nums: N,
      cells: C,
      owners: OW0
    };
    setStatus('ready');
    statusRef.current = 'ready';
    setHitIdx(-1);
    setInputMode('dig');
    setStartedAt(startAt);
    startedAtRef.current = startAt;
    setElapsed(0);
    firstRef.current = true;
    lastProgRef.current = -1;
  }
  function startMatchLocal(seed, szId, startAt) {
    mpRef.current.seed = seed;
    mpRef.current.sizeId = szId;
    mpRef.current.startAt = startAt;
    mpRef.current.phase = 'countdown';
    setRaceFinal(null);
    finalRef.current = null;
    setMyOutcome(null);
    outcomeRef.current = null;
    setGodBoards({});
    godRef.current = {};
    dismissRef.current = null;
    setGodUid(null);
    setCoopBoomBy('');
    setMyReadySt(false);
    myReadyRef.current = false;
    var spec2 = iAmSpec();
    iAmSpecRef.current = spec2;
    if (!spec2) setupBoardFromSeed(seed, szId, startAt);else {
      setCells(null);
      setLayout(null);
      setNums(null);
    }
    setMpPhase('countdown');
    setScreen('game');
    if (cdIvRef.current) clearInterval(cdIvRef.current);
    cdIvRef.current = setInterval(function () {
      var rem = startAt - Date.now();
      if (rem <= 0) {
        clearInterval(cdIvRef.current);
        cdIvRef.current = null;
        setCdNum('GO!');
        setTimeout(function () {
          return setCdNum(null);
        }, 650);
        mpRef.current.phase = 'playing';
        setMpPhase('playing');
      } else setCdNum(Math.ceil(rem / 1000));
    }, 100);
  }
  function startMatch() {
    // 房主
    if (!mpRef.current.isHost) return;
    if (mpRef.current.phase !== 'waiting' && mpRef.current.phase !== 'done') return;
    if (autoIvRef.current) {
      clearInterval(autoIvRef.current);
      autoIvRef.current = null;
    }
    var seed = Math.random() * 4294967296 >>> 0,
      startAt = Date.now() + 3500;
    var szId = mpRef.current.sizeId;
    setPlayersBoth(playersRef.current.filter(function (p) {
      return !p.pending;
    }).map(function (p) {
      return Object.assign({}, p, {
        ready: false
      });
    })); // 開賽清未到席位（比照數獨；殼端結算另有「未到不擋結算」規則）
    hostBroadcast({
      type: 'PLAYERS_UPDATE',
      players: playersRef.current
    });
    hostBroadcast({
      type: 'MINE_START',
      seed: seed,
      sizeId: szId,
      startAt: startAt
    });
    startMatchLocal(seed, szId, startAt);
  }

  // ----- 訊息分派 -----
  function onMpData(m, conn) {
    if (!m || !m.type) return;
    var H = mpRef.current.isHost;
    // 房主端驗寄件者：連線在 JOIN 時已綁 conn.__uid，之後帶 uid 的訊息必須相符，冒名把對手打成出局/完賽一律丟棄（稽核修）
    if (H && conn && conn.__uid && m.uid && m.uid !== conn.__uid && ['MINE_FINISH', 'MINE_BOOM', 'MINE_STATE', 'MINE_PROGRESS', 'MINE_ACT', 'READY', 'SPEC', 'REQ_REMATCH'].indexOf(m.type) >= 0) return;
    switch (m.type) {
      case 'JOIN':
        if (H) hostOnJoin(m, conn);
        break;
      case 'INIT':
        if (!H) guestOnInit(m);
        break;
      case 'PLAYERS_UPDATE':
        if (!H) {
          setPlayersBoth(m.players || []);
          var mp2 = myPlayer();
          if (mp2) iAmSpecRef.current = !!mp2.spectator;
        }
        break;
      case 'READY':
        if (H) {
          setPlayersBoth(playersRef.current.map(function (p) {
            return p.id === m.uid ? Object.assign({}, p, {
              ready: !!m.ready
            }) : p;
          }));
          hostBroadcast({
            type: 'PLAYERS_UPDATE',
            players: playersRef.current
          });
        }
        break;
      case 'SPEC':
        if (H) {
          setPlayersBoth(playersRef.current.map(function (p) {
            return p.id === m.uid ? Object.assign({}, p, {
              spectator: !!m.spectator
            }) : p;
          }));
          hostBroadcast({
            type: 'PLAYERS_UPDATE',
            players: playersRef.current
          });
        }
        break;
      case 'MINE_START':
        if (!H) startMatchLocal(m.seed, m.sizeId, m.startAt);
        break;
      case 'MINE_PROGRESS':
        godSet(m.uid, {
          progress: m.progress || 0
        });
        if (H) hostBroadcast(m, conn);
        checkRaceEnd();
        break;
      case 'MINE_STATE':
        godSet(m.uid, {
          cells: m.cells,
          nums: m.nums || {},
          progress: m.progress || 0
        });
        if (H) hostBroadcast(m, conn);
        break;
      case 'MINE_FINISH':
        godSet(m.uid, {
          state: 'finished',
          timeMs: m.timeMs,
          progress: 1
        });
        if (H) hostBroadcast(m, conn);
        checkRaceEnd();
        break;
      case 'MINE_BOOM':
        godSet(m.uid, {
          state: 'boom',
          progress: m.progress || 0,
          boomAt: Date.now()
        });
        if (H) hostBroadcast(m, conn);
        checkRaceEnd();
        break;
      case 'MINE_ACT':
        if (H && mpRef.current.mode === 'coop') {
          var pl = playersRef.current.find(function (p) {
            return p.id === m.uid;
          });
          if (pl && !pl.spectator && mpRef.current.phase === 'playing') processCoopAct(m.kind, m.idx, m.uid, pl.name);
        }
        break;
      // 觀戰者/倒數期間的 ACT 不受理：adoptCoopDo 會把全員 status 設成 playing 偷跑盤面（稽核修）
      case 'MINE_DO':
        if (!H && mpRef.current.mode === 'coop') adoptCoopDo(m);
        break;
      case 'REQ_LOBBY':
        if (H) {
          if (window.__PLAT_NOTIFY) window.__PLAT_NOTIFY('game-exit');
        }
        break;
      case 'REQ_REMATCH':
        if (H) startMatch();
        break;
      case 'HOST_LEFT':
        if (!H) onHostLeft(m);
        break;
    }
  }
  function hostOnJoin(m, conn) {
    conn.__uid = m.uid;
    var phase = mpRef.current.phase;
    var lateSpec = (phase === 'countdown' || phase === 'playing') && mpRef.current.mode === 'race' || phase === 'playing' && mpRef.current.mode === 'coop';
    var list = playersRef.current.slice();
    var ex = list.find(function (p) {
      return p.id === m.uid;
    });
    if (ex) {
      list = list.map(function (p) {
        return p.id === m.uid ? Object.assign({}, p, {
          name: m.pName,
          offline: false
        }) : p;
      });
    } else {
      var pend = list.findIndex(function (p) {
        return p.pending && normName(p.name) === normName(m.pName || '');
      });
      var color = MP_COLORS[list.filter(function (p) {
        return !p.pending;
      }).length % MP_COLORS.length];
      var entry = {
        id: m.uid,
        name: m.pName || '玩家',
        color: pend >= 0 ? list[pend].color : color,
        isHost: false,
        spectator: lateSpec,
        ready: false,
        offline: false
      };
      if (pend >= 0) list[pend] = entry;else list.push(entry);
    }
    setPlayersBoth(list);
    hostBroadcast({
      type: 'PLAYERS_UPDATE',
      players: list
    }, conn);
    var myEntry = list.find(function (p) {
      return p.id === m.uid;
    });
    try {
      conn.send({
        type: 'INIT',
        players: list,
        mode: mpRef.current.mode,
        sizeId: mpRef.current.sizeId,
        phase: phase,
        seed: myEntry && myEntry.spectator ? undefined : mpRef.current.seed,
        startAt: mpRef.current.startAt,
        god: godRef.current,
        youSpec: !!(myEntry && myEntry.spectator),
        coopSnap: mpRef.current.mode === 'coop' && boardRef.current.cells ? {
          cells: boardRef.current.cells.join(''),
          sparse: coopSparse(boardRef.current.cells, boardRef.current.nums),
          status: statusRef.current,
          own: encOwners(boardRef.current.owners)
        } : null
      });
    } catch (e) {}
  }
  function guestOnInit(m) {
    setPlayersBoth(m.players || []);
    mpRef.current.mode = m.mode || mpRef.current.mode;
    mpRef.current.sizeId = m.sizeId || mpRef.current.sizeId;
    setSizeId(m.sizeId || 9);
    iAmSpecRef.current = !!m.youSpec;
    if (m.god) {
      godRef.current = m.god;
      setGodBoards(m.god);
    }
    if (m.phase === 'countdown' || m.phase === 'playing') {
      mpRef.current.seed = m.seed;
      mpRef.current.startAt = m.startAt;
      if (m.youSpec) {
        setCells(null);
        setLayout(null);
        setNums(null);
        mpRef.current.phase = m.phase;
        setMpPhase(m.phase);
        setScreen('game');
        if (m.phase === 'countdown' && m.startAt) {
          // 倒數中進場的觀戰者：MINE_START 已廣播完不會重送，自己排程在 startAt 切成 playing，否則整場卡在空白畫面（稽核修）
          var specDelay = Math.max(0, m.startAt - Date.now()) + 60;
          setTimeout(function () {
            if (mpRef.current.phase === 'countdown' && iAmSpecRef.current) {
              mpRef.current.phase = 'playing';
              setMpPhase('playing');
            }
          }, specDelay);
        }
        if (m.coopSnap) adoptCoopDo({
          cells: m.coopSnap.cells,
          sparse: m.coopSnap.sparse,
          hit: -1,
          statusAfter: m.coopSnap.status === 'won' ? 'won' : m.coopSnap.status === 'lost' ? 'lost' : 'playing',
          kind: 'reveal',
          own: m.coopSnap.own
        });
      } else {
        // 比賽進行中回座：用同 seed 重建自己的盤（進度不還原，至少能繼續看/觀戰）
        startMatchLocal(m.seed, m.sizeId, m.startAt);
      }
    }
  }
  function onHostLeft(m) {
    // 房主個人離開：名單第一位「在線的非觀戰選手」接手當房主（全端同一份名單、同一個篩法，結論一致；原寫法挑到離線者會無人接任、挑到觀戰者會帶觀戰旗標主持，稽核修）
    var racers = playersRef.current.filter(function (p) {
      return !p.isHost && !p.offline && !p.spectator && !p.pending;
    });
    if (!racers.length) racers = playersRef.current.filter(function (p) {
      return !p.isHost && !p.offline && !p.pending;
    });
    if (racers.length && racers[0].id === myId) becomeHost(true);
  }
  function onConnClose(conn) {
    // 房主端：某來賓連線斷了
    if (!mpRef.current.isHost) return;
    var uid = conn.__uid;
    if (!uid) return;
    setPlayersBoth(playersRef.current.map(function (p) {
      return p.id === uid ? Object.assign({}, p, {
        offline: true
      }) : p;
    }));
    hostBroadcast({
      type: 'PLAYERS_UPDATE',
      players: playersRef.current
    });
    godSet(uid, {}); // 確保有條目
    checkRaceEnd();
  }
  function onHostConnClose() {
    // 來賓端：房主連線斷了 → 等殼接管/房主端重組後重新加入
    if (!mpRef.current.on || mpRef.current.isHost) return;
    setTimeout(function () {
      if (mpRef.current.on && !mpRef.current.isHost && sessRef.current) guestSetup(sessRef.current);
    }, 1500);
  }

  // ----- 連線建立 -----
  function becomeHost(promoting) {
    mpRef.current.isHost = true;
    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch (e) {}
      peerRef.current = null;
    }
    connsRef.current = [];
    hostConnRef.current = null;
    var code = mpRef.current.code;
    var p = new Peer(code + '-host');
    peerRef.current = p;
    p.on('connection', function (c) {
      connsRef.current.push(c);
      c.on('data', function (m) {
        return onMpData(m, c);
      });
      c.on('close', function () {
        return onConnClose(c);
      });
    });
    p.on('open', function () {
      if (promoting) {
        var oldHost = playersRef.current.find(function (pl) {
          return pl.isHost && pl.id !== myId;
        });
        setPlayersBoth(playersRef.current.map(function (pl) {
          return pl.id === myId ? Object.assign({}, pl, {
            isHost: true,
            offline: false
          }) : Object.assign({}, pl, {
            isHost: false,
            offline: oldHost && pl.id === oldHost.id ? true : pl.offline
          });
        }));
        hostBroadcast({
          type: 'PLAYERS_UPDATE',
          players: playersRef.current
        });
        if (boardRef.current.layout && mpRef.current.mode === 'coop') {
          setLayout(boardRef.current.layout);
          if (boardRef.current.nums) setNums(boardRef.current.nums);
        } // 接任房主補上自己的 layout state（boardRef 已由 MINE_DO 同步成真盤面）
        checkRaceEnd(); // 已離開的原房主標了 offline：若其他人都完賽/出局，本局可能就此可結算（原房主不標 offline 會永遠卡住結算，稽核修）
      }
    });
  }
  function guestSetup(sess) {
    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch (e) {}
      peerRef.current = null;
    }
    var p = new Peer();
    peerRef.current = p;
    p.on('open', function () {
      var c = p.connect(sess.code + '-host');
      hostConnRef.current = c;
      c.on('open', function () {
        try {
          c.send({
            type: 'JOIN',
            uid: myId,
            pName: sess.name
          });
        } catch (e) {}
      });
      c.on('data', function (m) {
        return onMpData(m, c);
      });
      c.on('close', function () {
        return onHostConnClose();
      });
    });
  }
  function setupMp(sess) {
    var st = sess.settings || {};
    mpRef.current = {
      on: true,
      isHost: !!sess.isHost,
      mode: sess.mode === 'coop' ? 'coop' : 'race',
      tourn: !!sess.tourn,
      hub: !!sess.hub,
      code: sess.code,
      sizeId: Number(st.sizeId) || 9,
      seed: 0,
      startAt: 0,
      phase: 'waiting'
    };
    setMpOn(true);
    setMpPhase('waiting');
    waitSinceRef.current = Date.now();
    setScreen('mp');
    if (sess.isHost) {
      var list = [{
        id: myId,
        name: sess.name,
        color: MP_COLORS[0],
        isHost: true,
        spectator: false,
        ready: false,
        offline: false
      }];
      if (sess.tourn && sess.tourn.roster) {
        sess.tourn.roster.forEach(function (e) {
          if (e && e.name && normName(e.name) !== normName(sess.name)) list.push({
            id: 'pending:' + e.name,
            name: e.name,
            color: e.color || MP_COLORS[list.length % MP_COLORS.length],
            isHost: false,
            spectator: false,
            ready: false,
            offline: false,
            pending: true
          });
        });
      }
      setPlayersBoth(list);
      becomeHost(false);
      if (sess.hub && !sess.tourn) {
        // 房間框架一般對局：全員到齊自動開局
        if (autoIvRef.current) clearInterval(autoIvRef.current);
        autoIvRef.current = setInterval(function () {
          if (!mpRef.current.on || !mpRef.current.isHost || mpRef.current.phase !== 'waiting') return;
          var N = window.__PLAT_NET;
          if (!N || !N.roster || N.roster.length < 2) return;
          var joined = playersRef.current.filter(function (p) {
            return !p.pending;
          });
          var okAll = N.roster.every(function (r) {
            return joined.some(function (p) {
              return normName(p.name) === normName(r.name);
            });
          });
          if (okAll) startMatch();
        }, 800);
      }
    } else {
      setPlayersBoth([]);
      guestSetup(sess);
    }
  }
  function requestLobby() {
    if (mpRef.current.isHost) {
      if (window.__PLAT_NOTIFY) window.__PLAT_NOTIFY('game-exit');
    } else mpSend({
      type: 'REQ_LOBBY',
      uid: myId
    });
  }
  function leaveMatch() {
    // 個人離開（其他人繼續）
    if (mpRef.current.isHost) mpSend({
      type: 'HOST_LEFT',
      uid: myId
    });
    cleanupMp();
    setScreen('home');
  }
  function toggleMyReady() {
    var v = !myReadyRef.current;
    myReadyRef.current = v;
    setMyReadySt(v);
    if (mpRef.current.isHost) {
      setPlayersBoth(playersRef.current.map(function (p) {
        return p.id === myId ? Object.assign({}, p, {
          ready: v
        }) : p;
      }));
      hostBroadcast({
        type: 'PLAYERS_UPDATE',
        players: playersRef.current
      });
    } else mpSend({
      type: 'READY',
      uid: myId,
      ready: v
    });
  }
  function toggleSpec(key) {
    var p = playersRef.current.find(function (x) {
      return x.id === key;
    });
    if (!p) return;
    if (mpRef.current.isHost) {
      setPlayersBoth(playersRef.current.map(function (x) {
        return x.id === key ? Object.assign({}, x, {
          spectator: !x.spectator
        }) : x;
      }));
      hostBroadcast({
        type: 'PLAYERS_UPDATE',
        players: playersRef.current
      });
      if (key === myId) iAmSpecRef.current = !p.spectator;
    } else if (key === myId) mpSend({
      type: 'SPEC',
      uid: myId,
      spectator: !p.spectator
    });
  }

  // ---------- 平台底部列（PlatBar）：挖開/插旗模式切換（與遊戲內切換鈕同步） ----------
  var platBarRef = useRef(null);
  var platBarCfgRef = useRef(null);
  platBarCfgRef.current = {
    accent: ACCENT,
    onAction: function onAction(name) {
      if (name === 'mode-press') {
        setInputMode(function (m) {
          return m === 'dig' ? 'flag' : 'dig';
        });
        SFX.click();
      }
    }
  };
  var platBarCfgStable = useRef(null);
  if (!platBarCfgStable.current) platBarCfgStable.current = {
    accent: ACCENT,
    onAction: function onAction(n, p) {
      if (platBarCfgRef.current) platBarCfgRef.current.onAction(n, p);
    }
  };
  useEffect(function () {
    if (typeof window !== 'undefined' && window.__PLAT_NET && window.__PLAT_NET.inMatch && window.__PLAT_NET.inMatch !== 'mines') return;
    var el = platBarRef.current;
    if (el && typeof window.PlatBar !== 'undefined') {
      window.PlatBar.attach(el, platBarCfgStable.current);
      return function () {
        if (typeof window.PlatBar !== 'undefined') window.PlatBar.detach(el);
      };
    }
  }, [screen]);
  useEffect(function () {
    if (typeof window === 'undefined' || typeof window.PlatBar === 'undefined' || !window.PlatBar.isAttached()) return;
    if (window.__PLAT_NET && window.__PLAT_NET.inMatch && window.__PLAT_NET.inMatch !== 'mines') return;
    window.PlatBar.update({
      mode: inputMode === 'flag' ? 1 : 0,
      modes: [{
        icon: '⛏️',
        label: '挖開'
      }, {
        icon: '🚩',
        label: '插旗'
      }],
      modeTitle: '切換模式（挖開/插旗）',
      showInput: false,
      inputMode: 'num',
      showDraw: false,
      showHostClear: false
    });
  });

  // ---------- 平台倒數（PlatCountdown）：殼端共用元件，照數橋用法（cdNum 有值 show、null hide） ----------
  useEffect(function () {
    if (typeof window === 'undefined' || !window.PlatCountdown) return;
    if (window.__PLAT_NET && window.__PLAT_NET.inMatch !== 'mines') return;
    if (cdNum != null) window.PlatCountdown.show(cdNum);else window.PlatCountdown.hide();
  }, [cdNum]);

  // ---------- 平台結算（PlatResults）：多人競速/合作共用殼端結算卡（比照數橋：等待卡可關、關後觀戰面板常駐） ----------
  useEffect(function () {
    if (typeof window === 'undefined' || !window.PlatResults) return;
    if (window.__PLAT_NET && window.__PLAT_NET.inMatch !== 'mines') return;
    if (!mpRef.current.on) return;
    var M = mpRef.current,
      stage = null,
      specR = null;
    if (M.mode === 'race') {
      if (mpPhase === 'done' && raceFinal) stage = 'fin';else if (mpPhase === 'playing' && myOutcome) stage = 'wait';
    } else if (mpPhase === 'done' && (status === 'won' || status === 'lost')) stage = 'coop';
    if (!stage) {
      window.PlatResults.hide();
      if (dismissRef.current) dismissRef.current = null;
      if (leaveArm) setLeaveArm(false);
      return;
    }
    if (dismissRef.current === stage) {
      window.PlatResults.hide();
      return;
    }
    var inTourn = !!M.tourn;
    var acts = function acts(id) {
      if (id === 'watch') {
        dismissRef.current = stage;
        setLeaveArm(false);
        try {
          window.PlatResults.hide();
        } catch (e) {}
      } else if (id === 'rematch') {
        dismissRef.current = null;
        try {
          window.PlatResults.hide();
        } catch (e) {}
        if (mpRef.current.isHost) startMatch();else mpSend({
          type: 'REQ_REMATCH',
          uid: myId
        });
      } else if (id === 'lobby') {
        try {
          window.PlatResults.hide();
        } catch (e) {}
        requestLobby();
      } else if (id === 'home') {
        if (!leaveArm) {
          setLeaveArm(true);
          if (leaveArmTimerRef.current) clearTimeout(leaveArmTimerRef.current);
          leaveArmTimerRef.current = setTimeout(function () {
            return setLeaveArm(false);
          }, 3500);
          return;
        }
        if (leaveArmTimerRef.current) clearTimeout(leaveArmTimerRef.current);
        setLeaveArm(false);
        dismissRef.current = null;
        try {
          window.PlatResults.hide();
        } catch (e) {}
        leaveMatch();
      }
    };
    var homeBtn = leaveArm ? {
      id: 'home',
      label: '⚠️ 確定離開？',
      kind: 'danger'
    } : {
      id: 'home',
      label: '離開'
    };
    var stdBtns = [{
      id: 'watch',
      label: '👁️ 繼續觀戰',
      kind: 'primary'
    }].concat(inTourn ? [] : [{
      id: 'rematch',
      label: '🔁 再來一局'
    }]).concat([{
      id: 'lobby',
      label: '🏁 回房間頁'
    }, homeBtn]);
    if (stage === 'fin') {
      specR = {
        accent: ACCENT,
        title: '競速結果',
        entries: raceFinal.entries,
        verdict: raceFinal.winnerUid === myId ? '🎉 你贏了！' : myOutcome === 'finished' ? '完賽了，本場名次如上！' : myOutcome === 'boom' ? '💥 你踩到雷出局了，名次照當時進度排。' : '本場比賽結束，名次如上。',
        buttons: stdBtns,
        onAction: acts
      };
    } else if (stage === 'wait') {
      var res2 = playersRef.current.filter(function (p) {
        return !p.spectator && !p.pending;
      }).map(function (p) {
        return {
          p: p,
          g: godRef.current[p.id] || {
            progress: 0,
            state: 'playing'
          }
        };
      }).filter(function (e) {
        return e.g.state === 'finished' || e.g.state === 'boom';
      });
      res2.sort(function (a, b) {
        return (a.g.state === 'finished' ? 0 : 1) - (b.g.state === 'finished' ? 0 : 1) || (a.g.state === 'finished' ? (a.g.timeMs || 0) - (b.g.timeMs || 0) : (b.g.progress || 0) - (a.g.progress || 0));
      });
      specR = {
        accent: ACCENT,
        title: '本場成績',
        waitingText: '等待其他玩家完成…',
        entries: res2.map(function (e) {
          return {
            key: e.p.id,
            name: e.p.name,
            color: e.p.color,
            isMe: e.p.id === myId,
            right: e.g.state === 'finished' ? '⏱ ' + fmtTime(Math.floor((e.g.timeMs || 0) / 1000)) : '💥 ' + Math.floor((e.g.progress || 0) * 100) + '%'
          };
        }),
        verdict: myOutcome === 'finished' ? '🏁 你已完賽，先看看大家的盤面吧' : '💥 你踩到雷出局了，先看看大家的盤面吧',
        buttons: [{
          id: 'watch',
          label: '👁️ 轉變為上帝模式（觀戰）',
          kind: 'primary'
        }, homeBtn],
        onAction: acts
      };
    } else {
      specR = {
        accent: ACCENT,
        title: '合作結果',
        entries: playersRef.current.filter(function (p) {
          return !p.pending;
        }).map(function (p) {
          return {
            key: p.id,
            name: p.name,
            color: p.color,
            isMe: p.id === myId,
            right: ''
          };
        }),
        verdict: status === 'won' ? '🎉 合作成功！用時 ' + fmtTime(elapsed) : '💥 ' + (coopBoomBy || '有人') + ' 踩到地雷了，全隊出局',
        buttons: stdBtns,
        onAction: acts
      };
    }
    window.PlatResults.show(specR);
  });

  // ---------- 平台 hooks ----------
  var sessRef = useRef(null);
  useEffect(function () {
    if (typeof window === 'undefined' || !window.__PLAT_PLATFORM) return;
    window.__PLAT_HOOKS_mines = {
      enter: function enter(sess) {
        sessRef.current = sess || null;
        // 開新局先清掉上一局的結算暫存（站規：新局絕不能重播上一局的結算）
        cleanupMp();
        setRaceFinal(null);
        finalRef.current = null;
        setMyOutcome(null);
        outcomeRef.current = null;
        setGodBoards({});
        godRef.current = {};
        dismissRef.current = null;
        setStatus('ready');
        statusRef.current = 'ready';
        setHitIdx(-1);
        setCells(null);
        setLayout(null);
        setNums(null);
        setDailyDate(null);
        if (sess) setupMp(sess);
      },
      exit: function exit() {
        cleanupMp();
        sessRef.current = null;
        setScreen('home');
      },
      migrate: function migrate() {
        // 殼端房主接管：我升格成房主就接手主持（名單保留、來賓會重新 JOIN）
        if (mpRef.current.on && !mpRef.current.isHost && typeof window !== 'undefined' && window.__PLAT_NET && window.__PLAT_NET.isHost) becomeHost(true);
      },
      debug: function debug() {
        return Object.assign({}, dbgRef.current, {
          mp: {
            on: mpRef.current.on,
            isHost: mpRef.current.isHost,
            mode: mpRef.current.mode,
            phase: mpRef.current.phase,
            tourn: mpRef.current.tourn
          },
          players: playersRef.current,
          god: godRef.current,
          "final": finalRef.current
        });
      }
    };
  }, []);

  // ---------- 渲染 ----------
  var gapPx = sizeId === 16 ? 2 : 3;
  // 盤面隨視窗放大（iPad/大螢幕不再縮成手機尺寸）：可用寬 = min(視窗, 720) − 根層 padding 24 − 卡片 padding/邊框 26
  var cellPx = Math.max(sizeId === 16 ? 18 : 28, Math.min(sizeId === 16 ? 38 : 64, Math.floor((Math.min(vpW, 720) - 50 - (spec.w - 1) * gapPx) / spec.w)));
  var colW = spec.w * cellPx + (spec.w - 1) * gapPx + 26; // 對局畫面所有欄位（標頭列/狀態列/進度/貢獻/PlatBar）與盤同寬，不再各寬各的
  function renderCell(i) {
    var st = cells[i],
      isMine = layout ? !!layout[i] : false,
      num = nums ? nums[i] : 0; // 合作觀戰者可能沒有完整 layout（只收已開格數字），要能容忍 null
    var content = '',
      bg = '',
      color = '',
      extra = {};
    if (status === 'lost') {
      if (isMine && st !== 'f') {
        content = i === hitIdx ? '💥' : '💣';
        bg = i === hitIdx ? '#fca5a5' : '#e2e8f0';
      } else if (st === 'f' && !isMine) {
        content = '❌';
        bg = '#e2e8f0';
      } else if (st === 'f') {
        content = '🚩';
        bg = '#e2e8f0';
      } else if (st === 'o') {
        content = num > 0 ? String(num) : '';
        color = NUM_COLORS[num] || '';
        bg = '#f1f5f9';
      } else {
        bg = 'linear-gradient(145deg,#fdba74,#fb923c)';
      }
    } else if (status === 'won' && isMine && st !== 'o') {
      content = '🚩';
      bg = '#e2e8f0';
    } else if (st === 'o') {
      content = num > 0 ? String(num) : '';
      color = NUM_COLORS[num] || '';
      bg = '#f8fafc';
      if (mpRef.current.on && mpRef.current.mode === 'coop' && ownArr && ownArr[i] >= 0) {
        var opC = players[ownArr[i]];
        if (opC) {
          bg = opC.color + '2e';
          extra = Object.assign({}, extra, {
            boxShadow: 'inset 0 0 0 2px ' + opC.color
          });
        }
      } // 合作貢獻著色：誰開的格就染誰的顏色
    } else if (st === 'f') {
      content = '🚩';
      bg = 'linear-gradient(145deg,#fdba74,#fb923c)';
    } else {
      bg = 'linear-gradient(145deg,#fdba74,#fb923c)';
    }
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      "data-cell": i,
      className: "mine-cell flex items-center justify-center font-black rounded-[4px] border border-orange-900/20",
      style: Object.assign({
        width: cellPx,
        height: cellPx,
        background: bg,
        color: color,
        fontSize: cellPx <= 22 ? 12 : Math.round(cellPx * 0.5),
        lineHeight: 1
      }, extra),
      onClick: function onClick() {
        return onCellAction(i);
      },
      onPointerDown: function onPointerDown() {
        return onCellDown(i);
      },
      onPointerUp: onCellUp,
      onPointerLeave: onCellUp,
      onContextMenu: function onContextMenu(e) {
        e.preventDefault();
        toggleFlag(i);
      }
    }, content);
  }
  function renderBoard() {
    if (!cells) return null;
    var rows = [];
    for (var y = 0; y < spec.h; y++) {
      var rowCells = [];
      for (var x = 0; x < spec.w; x++) rowCells.push(renderCell(y * spec.w + x));
      rows.push( /*#__PURE__*/React.createElement("div", {
        key: y,
        className: "flex",
        style: {
          gap: gapPx
        }
      }, rowCells));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col items-center",
      style: {
        gap: gapPx
      }
    }, rows);
  }
  function bestText(sz) {
    var b = sGet('mines_best_' + sz);
    return b ? '最佳 ' + fmtTime(parseInt(b, 10)) : '';
  }

  // ---------- 上帝模式觀戰：只渲染對手已公開的盤面（已開格數字+插旗），不含雷位 ----------
  function renderGodBoard(g, szId) {
    var sp = SIZES[szId] || SIZES[9];
    var arr = (g.cells || '').split('');
    var px = szId === 16 ? 21 : 38,
      gp = szId === 16 ? 2 : 3;
    var rows = [];
    for (var y = 0; y < sp.h; y++) {
      var rc = [];
      for (var x = 0; x < sp.w; x++) {
        var i = y * sp.w + x,
          st = arr[i];
        var content = '',
          bg = 'linear-gradient(145deg,#fdba74,#fb923c)',
          color = '';
        if (st === 'o') {
          var n = g.nums ? g.nums[i] : 0;
          if (n === -1) {
            content = '💣';
            bg = '#fecaca';
          } else {
            content = n > 0 ? String(n) : '';
            color = NUM_COLORS[n] || '';
            bg = '#f8fafc';
          }
        } else if (st === 'f') {
          content = '🚩';
        }
        rc.push( /*#__PURE__*/React.createElement("div", {
          key: i,
          className: "flex items-center justify-center font-black rounded-[4px] border border-orange-900/20",
          style: {
            width: px,
            height: px,
            background: bg,
            color: color,
            fontSize: szId === 16 ? 12 : 19,
            lineHeight: 1
          }
        }, content));
      }
      rows.push( /*#__PURE__*/React.createElement("div", {
        key: y,
        className: "flex",
        style: {
          gap: gp
        }
      }, rc));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col items-center",
      style: {
        gap: gp
      }
    }, rows);
  }
  function renderGodPanel() {
    if (!mpOn || mpRef.current.mode !== 'race') return null;
    if (mpPhase !== 'playing' && mpPhase !== 'done') return null;
    var specMode = iAmSpec();
    if (!myOutcome && !specMode) return null; // 還在比賽中：只顯示進度條，不開上帝面板
    var opps = players.filter(function (p) {
      return !p.spectator && !p.pending && p.id !== myId;
    });
    if (!opps.length) return null;
    var sel = godUid && opps.some(function (p) {
      return p.id === godUid;
    }) ? godUid : opps[0].id;
    var selP = opps.find(function (p) {
      return p.id === sel;
    });
    var g = godBoards[sel] || {
      progress: 0,
      state: 'playing',
      cells: '',
      nums: {}
    };
    var title = myOutcome === 'boom' ? '💥 已出局・觀戰中' : myOutcome === 'finished' ? '🏁 已完賽・觀戰中' : '👁️ 觀戰中';
    return /*#__PURE__*/React.createElement("div", {
      className: "w-full max-w-md mt-3 bg-white border-[3px] border-slate-800 rounded-xl p-3 shadow-[4px_4px_0px_rgba(30,41,59,1)] animate-fadeIn"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-black text-slate-800 mb-2"
    }, title), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-1.5 mb-2"
    }, opps.map(function (p) {
      var gg = godBoards[p.id] || {
        progress: 0,
        state: 'playing'
      };
      return /*#__PURE__*/React.createElement("button", {
        key: p.id,
        onClick: function onClick() {
          return setGodUid(p.id);
        },
        className: "text-xs font-black px-2 py-1 rounded-full border-2 flex items-center gap-1 active:translate-y-[1px]",
        style: p.id === sel ? {
          background: '#1e293b',
          color: '#fff',
          borderColor: '#1e293b'
        } : {
          background: '#fff',
          color: '#334155',
          borderColor: '#cbd5e1'
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "w-2.5 h-2.5 rounded-full border border-slate-800",
        style: {
          background: p.color
        }
      }), p.name, " ", gg.state === 'finished' ? '⏱ ' + fmtTime(Math.floor((gg.timeMs || 0) / 1000)) : gg.state === 'boom' ? '💥 ' + Math.floor((gg.progress || 0) * 100) + '%' : Math.floor((gg.progress || 0) * 100) + '%');
    })), g.cells ? renderGodBoard(g, mpRef.current.sizeId) : /*#__PURE__*/React.createElement("p", {
      className: "font-bold text-slate-400 text-center py-3"
    }, "\u7B49\u5F85 ", selP ? selP.name : '對手', " \u7684\u76E4\u9762\u2026"));
  }

  // ---------- 每日一題月曆（規格比照數獨/數橋：固定 6 列、完成亮燈、未來反灰） ----------
  function renderDailyCalendar() {
    var y = dailyCalYM.y,
      m = dailyCalYM.m;
    var startDay = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var rec = readDailyRecords(),
      today = todayStr();
    var arr = [],
      i;
    for (i = 0; i < startDay; i++) arr.push(null);
    for (i = 1; i <= daysInMonth; i++) arr.push(i);
    while (arr.length < 42) arr.push(null);
    var canPrev = !(y === 2026 && m === 0);
    var nd = new Date();
    var canNext = !(y === nd.getFullYear() && m === nd.getMonth());
    function shiftMonth(delta) {
      var mm = m + delta,
        yy = y;
      if (mm < 0) {
        mm = 11;
        yy--;
      }
      if (mm > 11) {
        mm = 0;
        yy++;
      }
      setDailyCalYM({
        y: yy,
        m: mm
      });
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4",
      onClick: function onClick() {
        return setShowDailyCal(false);
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white border-4 border-slate-800 rounded-xl shadow-[8px_8px_0px_rgba(30,41,59,1)] max-w-md w-full p-5 animate-popIn",
      onClick: function onClick(e) {
        return e.stopPropagation();
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between mb-3"
    }, /*#__PURE__*/React.createElement("button", {
      disabled: !canPrev,
      onClick: function onClick() {
        return shiftMonth(-1);
      },
      className: "w-10 h-10 rounded-lg border-2 border-slate-800 font-black text-lg bg-white disabled:opacity-30 shadow-[2px_2px_0px_rgba(30,41,59,1)]"
    }, "\u25C0"), /*#__PURE__*/React.createElement("div", {
      className: "font-black text-xl text-slate-800"
    }, y, " \u5E74 ", m + 1, " \u6708"), /*#__PURE__*/React.createElement("button", {
      disabled: !canNext,
      onClick: function onClick() {
        return shiftMonth(1);
      },
      className: "w-10 h-10 rounded-lg border-2 border-slate-800 font-black text-lg bg-white disabled:opacity-30 shadow-[2px_2px_0px_rgba(30,41,59,1)]"
    }, "\u25B6")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-7 gap-1 text-center font-black text-slate-400 text-sm mb-1"
    }, ['日', '一', '二', '三', '四', '五', '六'].map(function (wd) {
      return /*#__PURE__*/React.createElement("div", {
        key: wd
      }, wd);
    })), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-7 gap-1"
    }, arr.map(function (dd, idx) {
      if (dd == null) return /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "h-11"
      });
      var ds = y + '-' + (m + 1 < 10 ? '0' : '') + (m + 1) + '-' + (dd < 10 ? '0' : '') + dd;
      var future = ds > today,
        done = rec[ds] != null,
        isToday = ds === today,
        isSel = ds === dailySel;
      var cls = 'h-11 rounded-lg font-black relative border-2 ';
      if (future) cls += 'bg-slate-100 text-slate-300 border-transparent';else if (done) cls += 'bg-[#fb923c] text-slate-900 border-slate-800';else cls += 'bg-white text-slate-700 border-slate-200';
      if (isToday) cls += ' ring-4 ring-slate-800 ring-inset';
      if (isSel && !isToday) cls += ' ring-4 ring-sky-400 ring-inset';
      return /*#__PURE__*/React.createElement("button", {
        key: idx,
        disabled: future,
        className: cls,
        onClick: function onClick() {
          setDailySel(ds);
          setShowDailyCal(false);
          SFX.click();
          startDaily(ds);
        }
      }, dd, done && /*#__PURE__*/React.createElement("span", {
        className: "absolute top-0 right-0.5 text-[10px]"
      }, "\u2713"), isToday && /*#__PURE__*/React.createElement("span", {
        className: "absolute bottom-0 left-0 right-0 text-[9px] leading-none"
      }, "\u4ECA\u5929"));
    })), /*#__PURE__*/React.createElement("div", {
      className: "mt-3 flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-bold text-slate-400"
    }, "\u4EAE\u71C8\uFF1D\u5DF2\u5B8C\u6210\u30FB\u7070\u8272\uFF1D\u9084\u6C92\u5230"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setShowDailyCal(false);
      },
      className: "px-4 py-1.5 bg-slate-800 text-white rounded-lg font-black"
    }, "\u95DC\u9589"))));
  }
  if (screen === 'setup') {
    return /*#__PURE__*/React.createElement("div", {
      key: "setup",
      className: "min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-full max-w-md bg-white border-4 border-slate-800 rounded-xl shadow-[8px_8px_0px_rgba(30,41,59,1)] p-6 md:p-8 relative z-10 animate-fadeIn"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "font-black text-2xl text-slate-800 mb-1"
    }, "\uD83D\uDC64 \u55AE\u6A5F\u6311\u6230"), /*#__PURE__*/React.createElement("p", {
      className: "font-bold text-slate-400 text-sm mb-5"
    }, "\u9078\u4E00\u500B\u76E4\u9762\u5927\u5C0F\u958B\u59CB"), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-3"
    }, [9, 16].map(function (sz) {
      return /*#__PURE__*/React.createElement("button", {
        key: sz,
        onClick: function onClick() {
          SFX.click();
          newGame(sz);
        },
        className: "w-full py-4 bg-[#fb923c] border-[3px] border-slate-800 rounded-xl font-black text-xl text-slate-900 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none flex items-center justify-between px-4"
      }, /*#__PURE__*/React.createElement("span", null, sz === 9 ? '🌱' : '🔥', " ", SIZES[sz].name), /*#__PURE__*/React.createElement("span", {
        className: "text-sm text-slate-700"
      }, bestText(sz)));
    }), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setScreen('home');
      },
      className: "w-full py-3 bg-white border-[3px] border-slate-800 rounded-xl font-black text-lg text-slate-700 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none"
    }, "\u2190 \u8FD4\u56DE\u4E3B\u9078\u55AE"))));
  }
  if (screen === 'home') {
    var dRec = readDailyRecords(),
      dStreak = readDailyStreak();
    var dDone = dRec[dailySel] != null,
      dBest = dRec[dailySel],
      dIsToday = dailySel === todayStr();
    return /*#__PURE__*/React.createElement("div", {
      key: "home",
      className: "min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-full max-w-md bg-white border-4 border-slate-800 rounded-xl shadow-[8px_8px_0px_rgba(30,41,59,1)] p-6 md:p-8 text-center relative transform -rotate-1 z-10 animate-fadeIn"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "font-black text-4xl text-slate-800"
    }, "\uD83D\uDCA3 \u8E29\u5730\u96F7"), /*#__PURE__*/React.createElement("div", {
      className: "text-slate-400 font-black tracking-widest text-sm mb-6"
    }, "Minesweeper"), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-3"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        SFX.click();
        setScreen('setup');
      },
      className: "w-full py-4 bg-[#fb923c] border-[3px] border-slate-800 rounded-xl font-black text-xl text-slate-900 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none"
    }, "\uD83D\uDC64 \u55AE\u6A5F\u6311\u6230"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        SFX.click();
        startDaily(dailySel);
      },
      className: "w-full py-4 bg-[#fb923c] border-[3px] border-slate-800 rounded-xl font-black text-xl text-slate-900 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2"
    }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCC5 \u6BCF\u65E5\u4E00\u984C"), dDone && /*#__PURE__*/React.createElement("span", {
      className: "text-base bg-white/70 rounded-lg px-2 py-0.5"
    }, "\u2713 \u5DF2\u5B8C\u6210")), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      disabled: dailySel <= DAILY_MIN,
      onClick: function onClick() {
        return setDailySel(shiftDate(dailySel, -1));
      },
      className: "w-11 h-11 shrink-0 rounded-lg border-2 border-slate-800 bg-white font-black text-lg disabled:opacity-30 shadow-[2px_2px_0px_rgba(30,41,59,1)]"
    }, "\u25C0"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var p = dailySel.split('-');
        setDailyCalYM({
          y: +p[0],
          m: +p[1] - 1
        });
        setShowDailyCal(true);
      },
      className: "flex-1 py-2.5 bg-white border-2 border-slate-800 rounded-lg font-black text-lg text-slate-800 shadow-[2px_2px_0px_rgba(30,41,59,1)]"
    }, "\uD83D\uDCC5 ", dailySel, dIsToday ? '（今天）' : ''), /*#__PURE__*/React.createElement("button", {
      disabled: dailySel >= todayStr(),
      onClick: function onClick() {
        return setDailySel(shiftDate(dailySel, 1));
      },
      className: "w-11 h-11 shrink-0 rounded-lg border-2 border-slate-800 bg-white font-black text-lg disabled:opacity-30 shadow-[2px_2px_0px_rgba(30,41,59,1)]"
    }, "\u25B6")), /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-black text-slate-500 -mt-1"
    }, "\uD83D\uDD25 \u9023\u7E8C\u6311\u6230 ", dStreak.count || 0, " \u5929", dBest != null ? '・這天最佳 ' + fmtTime(dBest) : ''), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setShowHelp(true);
      },
      className: "w-full py-3.5 bg-white border-[3px] border-slate-800 rounded-xl font-black text-lg text-slate-800 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none"
    }, "\u2753 \u73A9\u6CD5\u6559\u5B78"))), isPlat && /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (window.PLAT_show) window.PLAT_show('home');
      },
      className: "z-10 w-full max-w-md mt-5 py-3.5 bg-sky-400 border-4 border-slate-800 rounded-xl font-black text-xl text-slate-900 shadow-[4px_4px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none"
    }, "\uD83C\uDFE0 \u56DE\u5927\u5EF3"), /*#__PURE__*/React.createElement("div", {
      className: "shrink-0 pt-4 text-slate-800 font-black text-sm opacity-60 tracking-wider z-10"
    }, "Copyright \xA9 2026 \u8449\u5927\u5E25. All rights reserved. (", isPlat && window.PLAT_VERSION ? '整合版 v' + window.PLAT_VERSION : 'v1.0.0', ")"), showDailyCal && renderDailyCalendar(), showHelp && /*#__PURE__*/React.createElement("div", {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4",
      onClick: function onClick() {
        return setShowHelp(false);
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-[#fffaf0] border-4 border-slate-800 rounded-2xl shadow-[10px_10px_0px_rgba(30,41,59,1)] max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 relative animate-popIn",
      onClick: function onClick(e) {
        return e.stopPropagation();
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setShowHelp(false);
      },
      className: "absolute top-3 right-3 w-9 h-9 bg-white border-[3px] border-slate-800 rounded-full font-black shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[1px] active:shadow-none z-10"
    }, "\u2715"), /*#__PURE__*/React.createElement("h3", {
      className: "text-2xl font-black text-slate-800 border-b-4 border-[#fb923c] inline-block pb-1 mb-5"
    }, "\u2753 \u73A9\u6CD5\u6559\u5B78"), /*#__PURE__*/React.createElement("div", {
      className: "bg-white border-[3px] border-slate-800 rounded-xl p-4 mb-4 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "relative"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-3 gap-[3px]"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 flex items-center justify-center font-black text-lg rounded-[4px] border border-orange-900/20",
      style: {
        background: '#f8fafc',
        color: NUM_COLORS[1]
      }
    }, "1"), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 rounded-[4px] border border-orange-900/20",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 rounded-[4px] border border-orange-900/20",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 rounded-[4px] border border-orange-900/20",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 relative flex items-center justify-center font-black text-lg rounded-[4px] border border-orange-900/20 overflow-hidden",
      style: {
        background: '#f8fafc'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mtut-num",
      style: {
        color: NUM_COLORS[1]
      }
    }, "1"), /*#__PURE__*/React.createElement("div", {
      className: "mtut-cover absolute inset-0",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 rounded-[4px] border border-orange-900/20",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 rounded-[4px] border border-orange-900/20",
      style: {
        background: '#f8fafc'
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 rounded-[4px] border border-orange-900/20",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 flex items-center justify-center font-black text-lg rounded-[4px] border border-orange-900/20",
      style: {
        background: '#f8fafc',
        color: NUM_COLORS[2]
      }
    }, "2")), /*#__PURE__*/React.createElement("span", {
      className: "mtut-finger absolute text-3xl pointer-events-none",
      style: {
        left: 63,
        top: 62
      }
    }, "\uD83D\uDC46"))), /*#__PURE__*/React.createElement("p", {
      className: "text-center font-black text-slate-700"
    }, "\u9EDE\u683C\u5B50\u6316\u958B\u2014\u2014\u6578\u5B57\u4EE3\u8868\u5468\u570D 8 \u683C\u6709\u5E7E\u9846\u5730\u96F7")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white border-[3px] border-slate-800 rounded-xl p-4 mb-4 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-14 h-14 flex items-center justify-center rounded-[4px] border border-orange-900/20",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mtut-flag text-3xl"
    }, "\uD83D\uDEA9"))), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center gap-2 mb-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "px-3 py-2 bg-white border-[3px] border-slate-800 rounded-xl font-black text-sm shadow-[2px_2px_0px_rgba(30,41,59,1)]"
    }, "\u26CF\uFE0F \u6316\u958B"), /*#__PURE__*/React.createElement("span", {
      className: "mtut-chip px-3 py-2 border-[3px] border-slate-800 rounded-xl font-black text-sm shadow-[2px_2px_0px_rgba(30,41,59,1)]"
    }, "\uD83D\uDEA9 \u63D2\u65D7")), /*#__PURE__*/React.createElement("p", {
      className: "text-center font-black text-slate-700"
    }, "\u61F7\u7591\u662F\u5730\u96F7\uFF1F\u5207\u5230\u300C\u63D2\u65D7\u300D\u6A21\u5F0F\u9EDE\u5B83\uFF0C\u6216\u9577\u6309\u683C\u5B50\u505A\u8A18\u865F")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white border-[3px] border-slate-800 rounded-xl p-4 mb-4 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "relative"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-3 gap-[3px]"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 flex items-center justify-center text-xl rounded-[4px] border border-orange-900/20",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    }, "\uD83D\uDEA9"), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 relative flex items-center justify-center font-black text-lg rounded-[4px] border border-orange-900/20 overflow-hidden",
      style: {
        background: '#f8fafc'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mtut-chord-num",
      style: {
        color: NUM_COLORS[2]
      }
    }, "2"), /*#__PURE__*/React.createElement("div", {
      className: "mtut-chord-cover absolute inset-0",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 relative flex items-center justify-center font-black text-lg rounded-[4px] border border-orange-900/20 overflow-hidden",
      style: {
        background: '#f8fafc'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mtut-chord-num",
      style: {
        color: NUM_COLORS[1]
      }
    }, "1"), /*#__PURE__*/React.createElement("div", {
      className: "mtut-chord-cover absolute inset-0",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 relative flex items-center justify-center font-black text-lg rounded-[4px] border border-orange-900/20 overflow-hidden",
      style: {
        background: '#f8fafc'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mtut-chord-num",
      style: {
        color: NUM_COLORS[1]
      }
    }, "1"), /*#__PURE__*/React.createElement("div", {
      className: "mtut-chord-cover absolute inset-0",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 flex items-center justify-center font-black text-lg rounded-[4px] border border-orange-900/20",
      style: {
        background: '#f8fafc',
        color: NUM_COLORS[1]
      }
    }, "1"), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 relative flex items-center justify-center font-black text-lg rounded-[4px] border border-orange-900/20 overflow-hidden",
      style: {
        background: '#f8fafc'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "mtut-chord-cover absolute inset-0",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 relative flex items-center justify-center font-black text-lg rounded-[4px] border border-orange-900/20 overflow-hidden",
      style: {
        background: '#f8fafc'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "mtut-chord-cover absolute inset-0",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 relative flex items-center justify-center font-black text-lg rounded-[4px] border border-orange-900/20 overflow-hidden",
      style: {
        background: '#f8fafc'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mtut-chord-num",
      style: {
        color: NUM_COLORS[1]
      }
    }, "1"), /*#__PURE__*/React.createElement("div", {
      className: "mtut-chord-cover absolute inset-0",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 relative flex items-center justify-center font-black text-lg rounded-[4px] border border-orange-900/20 overflow-hidden",
      style: {
        background: '#f8fafc'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mtut-chord-num",
      style: {
        color: NUM_COLORS[2]
      }
    }, "2"), /*#__PURE__*/React.createElement("div", {
      className: "mtut-chord-cover absolute inset-0",
      style: {
        background: 'linear-gradient(145deg,#fdba74,#fb923c)'
      }
    }))), /*#__PURE__*/React.createElement("span", {
      className: "mtut-finger2 absolute text-3xl pointer-events-none",
      style: {
        left: 63,
        top: 62
      }
    }, "\uD83D\uDC46"))), /*#__PURE__*/React.createElement("p", {
      className: "text-center font-black text-slate-700"
    }, "\u6578\u5B57\u65C1\u7684\u65D7\u5B50\u6578\u525B\u597D\u7B49\u65BC\u6578\u5B57\u6642\uFF0C\u518D\u9EDE\u6578\u5B57\u683C\uFF0C\u5468\u570D\u5269\u4E0B\u7684\u683C\u5B50\u4E00\u6B21\u6316\u958B")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white border-[3px] border-slate-800 rounded-xl p-4 mb-4 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center gap-8 mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col items-center gap-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mtut-boom w-14 h-14 flex items-center justify-center text-3xl rounded-[4px] border border-orange-900/20",
      style: {
        background: '#e2e8f0'
      }
    }, "\uD83D\uDCA3"), /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-black text-slate-400"
    }, "\u8E29\u5230\u96F7")), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col items-center gap-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-14 h-14 flex items-center justify-center rounded-[4px] border border-orange-900/20",
      style: {
        background: '#f8fafc'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mtut-trophy text-3xl"
    }, "\uD83C\uDFC6")), /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-black text-slate-400"
    }, "\u5168\u90E8\u6316\u958B"))), /*#__PURE__*/React.createElement("p", {
      className: "text-center font-black text-slate-700"
    }, "\u7B2C\u4E00\u4E0B\u9EDE\u7684\u683C\u5B50\u8DDF\u5468\u570D 8 \u683C\u4FDD\u8B49\u6C92\u6709\u96F7\uFF1B\u4E0D\u662F\u96F7\u7684\u683C\u5B50\u5168\u6316\u958B\u5C31\u8D0F\uFF0C\u6316\u5230\u96F7\u5C31\u7D50\u675F")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white border-[3px] border-slate-800 rounded-xl p-4 mb-5 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-slate-600 leading-relaxed text-left flex flex-col gap-2"
    }, /*#__PURE__*/React.createElement("p", null, "\uD83D\uDCC5 \u6BCF\u65E5\u4E00\u984C\uFF1A\u6BCF\u5929\u540C\u4E00\u984C\uFF089\xD79\uFF09\uFF0C\u53EF\u4EE5\u56DE\u88DC\u4ECA\u5E74\u7684\u820A\u984C\u76EE\uFF0C\u53EA\u6709\u4ECA\u5929\u7684\u6703\u7D2F\u7A4D\u9023\u7E8C\u5929\u6578\u3002"), /*#__PURE__*/React.createElement("p", null, "\uD83D\uDC65 \u591A\u4EBA\u7AF6\u901F\uFF1A\u540C\u4E00\u500B\u76E4\u9762\u5404\u73A9\u5404\u7684\uFF0C\u6700\u5FEB\u6E05\u5B8C\u7684\u4EBA\u8D0F\uFF1B\u8E29\u5230\u96F7\u76F4\u63A5\u51FA\u5C40\uFF0C\u7167\u7576\u6642\u9032\u5EA6\u6392\u540D\u3002"))), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setShowHelp(false);
      },
      className: "w-full py-3.5 bg-[#fb923c] border-4 border-slate-800 rounded-xl font-black text-lg text-slate-900 shadow-[4px_4px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none transition-all"
    }, "\u77E5\u9053\u4E86\uFF0C\u958B\u59CB\u73A9\uFF01"))));
  }

  // ---------- 多人等待畫面（hub 一般對局：房主全員到齊自動開局；錦標賽：準備+房主開始） ----------
  if (screen === 'mp') {
    var M = mpRef.current;
    var szName = (SIZES[M.sizeId] || SIZES[9]).name;
    var racersW = players.filter(function (p) {
      return !p.spectator && !p.pending;
    });
    var pendW = players.filter(function (p) {
      return p.pending;
    });
    var allReadyW = racersW.length > 0 && racersW.every(function (p) {
      return p.ready;
    });
    var waitedW = waitSinceRef.current ? Date.now() - waitSinceRef.current : 0;
    var canStartW = M.isHost && racersW.length >= 2 && (!M.tourn || pendW.length === 0 && allReadyW || waitedW >= 60000); // 錦標賽閘門比照數獨：全員到齊+全員準備，或等滿 60 秒（未到者開賽清席、遲到觀戰加入）
    var startNoteW = !M.isHost ? '' : racersW.length < 2 ? '等待選手加入（至少 2 位）…' : M.tourn ? canStartW ? pendW.length ? '未到的選手將以觀戰身分加入' : '' : pendW.length ? '等待全員到齊…' : '等待全員準備（或 ' + Math.max(0, 60 - Math.floor(waitedW / 1000)) + ' 秒後開放開始）' : M.hub ? '全員到齊後自動開始，也可以直接開始' : '';
    return /*#__PURE__*/React.createElement("div", {
      key: "mp",
      className: "min-h-screen w-full flex flex-col items-center justify-center p-4 relative"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-full max-w-md bg-white border-4 border-slate-800 rounded-xl shadow-[8px_8px_0px_rgba(30,41,59,1)] p-6 z-10 animate-fadeIn"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "font-black text-2xl text-slate-800 mb-1"
    }, "\uD83D\uDCA3 \u8E29\u5730\u96F7", M.tourn ? '・錦標賽' : ''), /*#__PURE__*/React.createElement("p", {
      className: "font-bold text-slate-400 text-sm mb-4"
    }, M.mode === 'race' ? '⚔️ 競速對戰' : '🤝 合作模式', "\u30FB", szName, "\u30FB\u623F\u9593 ", M.code), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-2 mb-4"
    }, players.map(function (p) {
      return /*#__PURE__*/React.createElement("div", {
        key: p.id,
        className: "flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-lg px-3 py-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "w-4 h-4 rounded-full border-2 border-slate-800 shrink-0",
        style: {
          background: p.color
        }
      }), /*#__PURE__*/React.createElement("span", {
        className: "font-black text-slate-700 flex-1 text-left truncate"
      }, p.name, p.id === myId ? '（你）' : ''), p.isHost && /*#__PURE__*/React.createElement("span", {
        className: "text-xs font-black text-slate-500"
      }, "\uD83D\uDC51 \u623F\u4E3B"), p.pending ? /*#__PURE__*/React.createElement("span", {
        className: "text-xs font-black text-slate-400"
      }, "\u672A\u5230") : p.offline ? /*#__PURE__*/React.createElement("span", {
        className: "text-xs font-black text-rose-500"
      }, "\u96E2\u7DDA") : p.spectator ? /*#__PURE__*/React.createElement("span", {
        className: "text-xs font-black text-sky-600"
      }, "\uD83D\uDC41\uFE0F \u89C0\u6230") : M.mode === 'race' && p.ready ? /*#__PURE__*/React.createElement("span", {
        className: "text-xs font-black text-emerald-600"
      }, "\u2705 \u5DF2\u6E96\u5099") : null, (M.isHost || p.id === myId) && !p.pending && /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return toggleSpec(p.id);
        },
        className: "text-xs font-black px-2 py-1 rounded-md border-2 border-slate-300 bg-white active:translate-y-[1px]"
      }, p.spectator ? '🎮 改參賽' : '👁️ 改觀戰'));
    }), !players.length && /*#__PURE__*/React.createElement("p", {
      className: "font-bold text-slate-400"
    }, "\u9023\u7DDA\u4E2D\u2026")), M.tourn && M.mode === 'race' && /*#__PURE__*/React.createElement("button", {
      onClick: toggleMyReady,
      className: "w-full py-3 mb-3 bg-white border-[3px] border-slate-800 rounded-xl font-black text-lg text-slate-800 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none"
    }, myReadySt ? '✅ 已準備（點擊取消）' : '✋ 我準備好了'), M.isHost ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      disabled: !canStartW,
      onClick: startMatch,
      className: "w-full py-3.5 bg-[#fb923c] border-[3px] border-slate-800 rounded-xl font-black text-xl text-slate-900 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:shadow-none"
    }, M.mode === 'race' ? '⚔️ 開始競速' : '🤝 開始合作'), startNoteW && /*#__PURE__*/React.createElement("p", {
      className: "text-xs font-bold text-slate-400 mt-2 text-center"
    }, startNoteW)) : /*#__PURE__*/React.createElement("p", {
      className: "font-black text-slate-400 text-center py-1"
    }, "\u7B49\u5F85\u623F\u4E3B\u958B\u59CB\u2026"), /*#__PURE__*/React.createElement("button", {
      onClick: requestLobby,
      className: "w-full mt-3 py-2.5 bg-white border-[3px] border-slate-800 rounded-xl font-black text-slate-700 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none"
    }, "\uD83C\uDFC1 \u56DE\u623F\u9593\u9801")), /*#__PURE__*/React.createElement("div", {
      ref: platBarRef,
      className: "h-16 shrink-0 w-full max-w-md"
    }));
  }

  // ---------- 對局畫面 ----------
  var over = status === 'won' || status === 'lost';
  return /*#__PURE__*/React.createElement("div", {
    key: "game",
    className: "min-h-screen w-full flex flex-col items-center p-3 relative"
  }, mpOn ? /*#__PURE__*/React.createElement("div", {
    className: "w-full flex items-center justify-between mb-2",
    style: {
      width: colW,
      maxWidth: "100%"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: requestLobby,
    className: "px-3 py-1.5 bg-white border-2 border-slate-800 rounded-lg font-black text-slate-700 shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[1px] active:shadow-none"
  }, "\uD83C\uDFC1 \u56DE\u7B49\u5F85\u5BA4"), /*#__PURE__*/React.createElement("div", {
    className: "font-black text-slate-700"
  }, mpRef.current.mode === 'race' ? '⚔️ 競速對戰' : '🤝 合作模式'), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, mpRef.current.tourn && mpRef.current.isHost && typeof window !== 'undefined' && window.__PLAT_TOURN_CAN_FORCEEND && window.__PLAT_TOURN_CAN_FORCEEND() && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (!feArm) {
        setFeArm(true);
        if (feArmTimerRef.current) clearTimeout(feArmTimerRef.current);
        feArmTimerRef.current = setTimeout(function () {
          return setFeArm(false);
        }, 3500);
      } else {
        if (feArmTimerRef.current) clearTimeout(feArmTimerRef.current);
        setFeArm(false);
        if (window.__PLAT_TOURN_FORCEEND) window.__PLAT_TOURN_FORCEEND();
      }
    },
    className: "px-2.5 py-1.5 bg-rose-500 border-2 border-slate-800 rounded-lg font-black text-white shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[1px] active:shadow-none"
  }, feArm ? '⚠️ 確定結束？' : '⏹️ 結束本局'), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var m = !muted;
      setMuted(m);
      sSet('mines_muted', m ? '1' : '0');
    },
    title: muted ? '取消靜音' : '靜音',
    className: "px-2.5 py-1.5 bg-white border-2 border-slate-800 rounded-lg font-black text-slate-700 shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[1px] active:shadow-none"
  }, muted ? '🔇' : '🔊'), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (!leaveArm) {
        setLeaveArm(true);
        if (leaveArmTimerRef.current) clearTimeout(leaveArmTimerRef.current);
        leaveArmTimerRef.current = setTimeout(function () {
          return setLeaveArm(false);
        }, 3500);
      } else {
        if (leaveArmTimerRef.current) clearTimeout(leaveArmTimerRef.current);
        setLeaveArm(false);
        leaveMatch();
      }
    },
    className: "px-3 py-1.5 bg-white border-2 border-slate-800 rounded-lg font-black text-slate-700 shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[1px] active:shadow-none"
  }, leaveArm ? '⚠️ 確定離開？' : '🚪 離開'))) : /*#__PURE__*/React.createElement("div", {
    className: "w-full flex items-center justify-between mb-2",
    style: {
      width: colW,
      maxWidth: "100%"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setScreen('home');
    },
    className: "px-3 py-1.5 bg-white border-2 border-slate-800 rounded-lg font-black text-slate-700 shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[1px] active:shadow-none"
  }, "\u2190 \u4E3B\u9078\u55AE"), /*#__PURE__*/React.createElement("div", {
    className: "font-black text-slate-700"
  }, dailyDate ? '📅 ' + dailyDate : spec.name), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var m = !muted;
      setMuted(m);
      sSet('mines_muted', m ? '1' : '0');
    },
    title: muted ? '取消靜音' : '靜音',
    className: "px-2.5 py-1.5 bg-white border-2 border-slate-800 rounded-lg font-black text-slate-700 shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[1px] active:shadow-none"
  }, muted ? '🔇' : '🔊'), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (dailyDate) startDaily(dailyDate);else newGame(sizeId);
    },
    className: "px-3 py-1.5 bg-white border-2 border-slate-800 rounded-lg font-black text-slate-700 shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[1px] active:shadow-none"
  }, "\uD83D\uDD04 \u91CD\u958B"))), /*#__PURE__*/React.createElement("div", {
    className: "w-full flex items-center justify-between mb-2 px-1",
    style: {
      width: colW,
      maxWidth: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-black text-lg text-slate-800 bg-white border-2 border-slate-800 rounded-lg px-3 py-1"
  }, "\uD83D\uDCA3 ", spec.mines - flagsUsed), /*#__PURE__*/React.createElement("div", {
    className: "flex bg-white border-2 border-slate-800 rounded-lg overflow-hidden font-black"
  }, /*#__PURE__*/React.createElement("button", {
    "data-mode": "dig",
    onClick: function onClick() {
      return setInputMode('dig');
    },
    className: "px-4 py-1.5",
    style: inputMode === 'dig' ? {
      background: ACCENT,
      color: '#fff'
    } : {
      color: '#64748b'
    }
  }, "\u26CF\uFE0F \u6316\u958B"), /*#__PURE__*/React.createElement("button", {
    "data-mode": "flag",
    onClick: function onClick() {
      return setInputMode('flag');
    },
    className: "px-4 py-1.5",
    style: inputMode === 'flag' ? {
      background: '#dc2626',
      color: '#fff'
    } : {
      color: '#64748b'
    }
  }, "\uD83D\uDEA9 \u63D2\u65D7")), /*#__PURE__*/React.createElement("div", {
    className: "font-black text-lg text-slate-800 bg-white border-2 border-slate-800 rounded-lg px-3 py-1"
  }, "\u23F1 ", fmtTime(elapsed))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white/70 border-[3px] border-slate-800 rounded-xl p-2.5 shadow-[4px_4px_0px_rgba(30,41,59,1)] animate-fadeIn"
  }, renderBoard()), /*#__PURE__*/React.createElement("div", {
    className: "w-full mt-2 px-1 flex items-center justify-between font-black text-slate-500 text-sm",
    style: {
      width: colW,
      maxWidth: "100%"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u9032\u5EA6 ", Math.floor(progress * 100), "%"), /*#__PURE__*/React.createElement("span", null, status === 'ready' ? '點任意格開始' : status === 'playing' ? '排雷中…' : '')), mpOn && mpRef.current.mode === 'coop' && ownArr && function () {
    var cc = players.map(function (p, ix) {
      return {
        p: p,
        n: ownArr.reduce(function (a, o) {
          return a + (o === ix ? 1 : 0);
        }, 0)
      };
    }).filter(function (c) {
      return !c.p.spectator && !c.p.pending;
    });
    var tot = cc.reduce(function (a, c) {
      return a + c.n;
    }, 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "w-full mt-2",
      style: {
        width: colW,
        maxWidth: '100%'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex h-3.5 rounded-full overflow-hidden border-2 border-slate-800 bg-white"
    }, tot > 0 && cc.map(function (c) {
      return c.n > 0 ? /*#__PURE__*/React.createElement("div", {
        key: c.p.id,
        style: {
          width: c.n / tot * 100 + '%',
          background: c.p.color
        }
      }) : null;
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-1.5 mt-1.5"
    }, cc.map(function (c) {
      return /*#__PURE__*/React.createElement("span", {
        key: c.p.id,
        className: "text-xs font-black px-2 py-1 rounded-full border-2 border-slate-300 bg-white flex items-center gap-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "w-2.5 h-2.5 rounded-full border border-slate-800",
        style: {
          background: c.p.color
        }
      }), c.p.name, " \u958B\u4E86 ", c.n, " \u683C", tot > 0 ? '・' + Math.round(c.n / tot * 100) + '%' : '');
    })));
  }(), mpOn && mpRef.current.mode === 'race' && mpPhase === 'playing' && !myOutcome && !iAmSpec() && /*#__PURE__*/React.createElement("div", {
    className: "w-full mt-2 flex flex-wrap gap-1.5",
    style: {
      width: colW,
      maxWidth: "100%"
    }
  }, players.filter(function (p) {
    return !p.spectator && !p.pending && p.id !== myId;
  }).map(function (p) {
    var g = godBoards[p.id] || {
      progress: 0,
      state: 'playing'
    };
    return /*#__PURE__*/React.createElement("span", {
      key: p.id,
      className: "text-xs font-black px-2 py-1 rounded-full border-2 border-slate-300 bg-white flex items-center gap-1"
    }, /*#__PURE__*/React.createElement("span", {
      className: "w-2.5 h-2.5 rounded-full border border-slate-800",
      style: {
        background: p.color
      }
    }), p.name, " ", g.state === 'finished' ? '🏁' : g.state === 'boom' ? '💥' : Math.floor((g.progress || 0) * 100) + '%');
  })), renderGodPanel(), over && !mpOn && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-4 border-slate-800 rounded-xl shadow-[8px_8px_0px_rgba(30,41,59,1)] max-w-sm w-full p-6 text-center animate-popIn"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-5xl mb-2"
  }, status === 'won' ? '🎉' : '💥'), /*#__PURE__*/React.createElement("h3", {
    className: "font-black text-2xl text-slate-800 mb-1"
  }, status === 'won' ? '全部排完了！' : '踩到地雷！'), /*#__PURE__*/React.createElement("p", {
    className: "font-bold text-slate-500 mb-4"
  }, status === 'won' ? '用時 ' + fmtTime(elapsed) + (dailyDate ? '・🔥 連續 ' + (readDailyStreak().count || 0) + ' 天' : '') : '進度 ' + Math.floor(progress * 100) + '%'), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (dailyDate) startDaily(dailyDate);else newGame(sizeId);
    },
    className: "w-full py-3 bg-[#fb923c] border-[3px] border-slate-800 rounded-xl font-black text-lg text-slate-900 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none"
  }, "\uD83D\uDD01 \u518D\u4F86\u4E00\u5C40"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setScreen('home');
    },
    className: "w-full py-2.5 bg-white border-[3px] border-slate-800 rounded-xl font-black text-slate-700 shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none"
  }, "\u56DE\u4E3B\u9078\u55AE")))), /*#__PURE__*/React.createElement("div", {
    ref: platBarRef,
    className: "h-16 shrink-0 w-full mt-auto",
    style: {
      width: colW,
      maxWidth: "100%"
    }
  }));
}
ReactDOM.createRoot(document.getElementById('mines-root')).render(React.createElement(window.PlatBoundary, null, React.createElement(MinesGame)));