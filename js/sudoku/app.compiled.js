"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
// 數獨 App：React 元件（大廳、多人連線、對戰、道具）
// 由 sudoku-v3.13.4.html 拆出；引擎函數在 js/engine.js

var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useMemo = _React.useMemo,
  useRef = _React.useRef;
function GameTimer(_ref) {
  var startTime = _ref.startTime,
    endTime = _ref.endTime,
    isRunning = _ref.isRunning,
    matchPhase = _ref.matchPhase;
  var _useState = useState(Date.now()),
    _useState2 = _slicedToArray(_useState, 2),
    now = _useState2[0],
    setNow = _useState2[1];
  useEffect(function () {
    if (!isRunning) return;
    setNow(Date.now());
    var t = setInterval(function () {
      return setNow(Date.now());
    }, 1000);
    return function () {
      return clearInterval(t);
    };
  }, [isRunning, startTime]);
  var secs = 0;
  if (matchPhase === 'playing' || matchPhase === 'finished') {
    secs = Math.max(0, Math.floor(((endTime || now) - startTime) / 1000));
  }
  return /*#__PURE__*/React.createElement("span", {
    style: {
      color: matchPhase === 'finished' ? '#ff4444' : 'white',
      fontWeight: 'bold',
      fontSize: '1.1em'
    }
  }, "\u23F1 ", formatTime(secs));
}
function SudokuGame() {
  var _SIZES$find, _DIFFICULTIES$find;
  var playerIdRef = useRef(Math.random().toString(36).substring(2, 12));
  var myId = playerIdRef.current;
  var myNameRef = useRef("");
  var myColorRef = useRef(COLORS[Math.floor(Math.random() * COLORS.length)]);
  var emptyLevelData = {
    sizeDef: SIZES[1],
    diffDef: DIFFICULTIES[1],
    cells: []
  };

  // 首頁房間存續狀態 (v3.8.29)
  var _useState3 = useState(null),
    _useState4 = _slicedToArray(_useState3, 2),
    lastSessionAlive = _useState4[0],
    setLastSessionAlive = _useState4[1]; // null: 檢查中, true: 可恢復, false: 失效

  useEffect(function () {
    if (screen === 'home' && !window.__PLAT_PLATFORM) {
      var last = null;
      try {
        last = JSON.parse(localStorage.getItem('sudoku_last_session') || 'null');
      } catch (e) {
        last = null;
      }
      if (last && Date.now() - last.time < 3600000 * 24) {
        setLastSessionAlive(null);
        var p = new Peer();
        var timer = setTimeout(function () {
          p.destroy();
          setLastSessionAlive(false);
        }, 5000);
        p.on('open', function () {
          var c = p.connect('yyh-tgsh-' + last.rid + '-host');
          c.on('open', function () {
            setLastSessionAlive(true);
            clearTimeout(timer);
            p.destroy();
          });
          c.on('error', function () {
            setLastSessionAlive(false);
            clearTimeout(timer);
            p.destroy();
          });
        });
        p.on('error', function () {
          setLastSessionAlive(false);
          clearTimeout(timer);
          p.destroy();
        });
      } else {
        setLastSessionAlive(false);
      }
    }
  }, [screen]);
  var initialDataRef = useRef(emptyLevelData);
  var _useState5 = useState('home'),
    _useState6 = _slicedToArray(_useState5, 2),
    screen = _useState6[0],
    setScreen = _useState6[1];
  var screenRef = useRef('home');
  useEffect(function () {
    screenRef.current = screen;
  }, [screen]);
  var _useState7 = useState('none'),
    _useState8 = _slicedToArray(_useState7, 2),
    engine = _useState8[0],
    setEngine = _useState8[1];
  var _useState9 = useState(9),
    _useState10 = _slicedToArray(_useState9, 2),
    sizeId = _useState10[0],
    setSizeId = _useState10[1];
  var _useState11 = useState('medium'),
    _useState12 = _slicedToArray(_useState11, 2),
    diffId = _useState12[0],
    setDiffId = _useState12[1];
  var _useState13 = useState(initialDataRef.current),
    _useState14 = _slicedToArray(_useState13, 2),
    levelData = _useState14[0],
    setLevelData = _useState14[1];
  var _useState15 = useState(initialDataRef.current.cells),
    _useState16 = _slicedToArray(_useState15, 2),
    cells = _useState16[0],
    setCells = _useState16[1];
  var _useState17 = useState([]),
    _useState18 = _slicedToArray(_useState17, 2),
    localCells = _useState18[0],
    setLocalCells = _useState18[1];
  var solutionGridRef = useRef(null);
  var _useState19 = useState({}),
    _useState20 = _slicedToArray(_useState19, 2),
    ghostHints = _useState20[0],
    setGhostHints = _useState20[1];
  var _useState21 = useState(false),
    _useState22 = _slicedToArray(_useState21, 2),
    isBrawlMode = _useState22[0],
    setIsBrawlMode = _useState22[1];
  var _useState23 = useState([]),
    _useState24 = _slicedToArray(_useState23, 2),
    brawlWinners = _useState24[0],
    setBrawlWinners = _useState24[1];
  var _useState25 = useState({
      winnersCount: 3,
      allowQuickFill: false,
      allowTraversal: false,
      allowYellowHint: false,
      hideAnswers: true,
      allowOthersToPlayAgain: true,
      allowGifts: true,
      showNumbersInGodMode: false,
      allowWeapons: true,
      weaponStartTime: 60
    }),
    _useState26 = _slicedToArray(_useState25, 2),
    brawlSettings = _useState26[0],
    setBrawlSettings = _useState26[1];
  var _useState27 = useState(false),
    _useState28 = _slicedToArray(_useState27, 2),
    showBrawlSettings = _useState28[0],
    setShowBrawlSettings = _useState28[1];
  var _useState29 = useState(null),
    _useState30 = _slicedToArray(_useState29, 2),
    winner = _useState30[0],
    setWinner = _useState30[1];
  var isWinnerDeclaredRef = useRef(false);
  var _useState31 = useState(false),
    _useState32 = _slicedToArray(_useState31, 2),
    showSetupModal = _useState32[0],
    setShowSetupModal = _useState32[1];
  var _useState33 = useState(9),
    _useState34 = _slicedToArray(_useState33, 2),
    tempSizeId = _useState34[0],
    setTempSizeId = _useState34[1];
  var _useState35 = useState('medium'),
    _useState36 = _slicedToArray(_useState35, 2),
    tempDiffId = _useState36[0],
    setTempDiffId = _useState36[1];
  var _useState37 = useState('playing'),
    _useState38 = _slicedToArray(_useState37, 2),
    matchPhase = _useState38[0],
    setMatchPhase = _useState38[1];
  var _useState39 = useState(null),
    _useState40 = _slicedToArray(_useState39, 2),
    countdownTarget = _useState40[0],
    setCountdownTarget = _useState40[1];
  var _useState41 = useState(null),
    _useState42 = _slicedToArray(_useState41, 2),
    countdownValue = _useState42[0],
    setCountdownValue = _useState42[1];
  var _useState43 = useState(false),
    _useState44 = _slicedToArray(_useState43, 2),
    isSpectator = _useState44[0],
    setIsSpectator = _useState44[1];
  var _useState45 = useState([]),
    _useState46 = _slicedToArray(_useState45, 2),
    strokes = _useState46[0],
    setStrokes = _useState46[1];
  var _useState47 = useState([]),
    _useState48 = _slicedToArray(_useState47, 2),
    history = _useState48[0],
    setHistory = _useState48[1];
  var _useState49 = useState(false),
    _useState50 = _slicedToArray(_useState49, 2),
    isWon = _useState50[0],
    setIsWon = _useState50[1];
  var _useState51 = useState(false),
    _useState52 = _slicedToArray(_useState51, 2),
    hideVictoryModal = _useState52[0],
    setHideVictoryModal = _useState52[1];
  var _useState53 = useState(""),
    _useState54 = _slicedToArray(_useState53, 2),
    toastMsg = _useState54[0],
    setToastMsg = _useState54[1];
  var _useState55 = useState(Date.now()),
    _useState56 = _slicedToArray(_useState55, 2),
    startTime = _useState56[0],
    setStartTime = _useState56[1];
  var _useState57 = useState(null),
    _useState58 = _slicedToArray(_useState57, 2),
    endTime = _useState58[0],
    setEndTime = _useState58[1];
  var _useState59 = useState(null),
    _useState60 = _slicedToArray(_useState59, 2),
    matchStartTime = _useState60[0],
    setMatchStartTime = _useState60[1];
  var _useState61 = useState(1),
    _useState62 = _slicedToArray(_useState61, 2),
    zoomLevel = _useState62[0],
    setZoomLevel = _useState62[1];
  var _useState63 = useState(false),
    _useState64 = _slicedToArray(_useState63, 2),
    isHeaderCollapsed = _useState64[0],
    setIsHeaderCollapsed = _useState64[1];
  var _useState65 = useState(false),
    _useState66 = _slicedToArray(_useState65, 2),
    showSaveModal = _useState66[0],
    setShowSaveModal = _useState66[1];
  var _useState67 = useState(""),
    _useState68 = _slicedToArray(_useState67, 2),
    saveCode = _useState68[0],
    setSaveCode = _useState68[1];
  var _useState69 = useState(0),
    _useState70 = _slicedToArray(_useState69, 2),
    interactionMode = _useState70[0],
    setInteractionMode = _useState70[1];
  var _useState71 = useState('pen'),
    _useState72 = _slicedToArray(_useState71, 2),
    drawSubMode = _useState72[0],
    setDrawSubMode = _useState72[1];
  var _useState73 = useState(null),
    _useState74 = _slicedToArray(_useState73, 2),
    selectedChar = _useState74[0],
    setSelectedChar = _useState74[1];
  // 輸入方式：'num' 數字先行（先點數字再點格子）｜'cell' 格子先行（先點格子再點數字）— 玩家可切換、記住選擇
  var _useState75 = useState(function () {
      try {
        return localStorage.getItem('sudoku_input_mode') === 'cell' ? 'cell' : 'num';
      } catch (e) {
        return 'num';
      }
    }),
    _useState76 = _slicedToArray(_useState75, 2),
    inputMode = _useState76[0],
    setInputMode = _useState76[1];
  var _useState77 = useState(null),
    _useState78 = _slicedToArray(_useState77, 2),
    selectedCellId = _useState78[0],
    setSelectedCellId = _useState78[1];
  useEffect(function () {
    try {
      localStorage.setItem('sudoku_input_mode', inputMode);
    } catch (e) {}
  }, [inputMode]);

  // 禮物與反擊機制 (盤面直接覆蓋)
  var _useState79 = useState({}),
    _useState80 = _slicedToArray(_useState79, 2),
    unopenedGifts = _useState80[0],
    setUnopenedGifts = _useState80[1];
  var _useState81 = useState(initialDataRef.current.sizeDef.chars),
    _useState82 = _slicedToArray(_useState81, 2),
    keyMapping = _useState82[0],
    setKeyMapping = _useState82[1];
  var _useState83 = useState([]),
    _useState84 = _slicedToArray(_useState83, 2),
    flippedKeys = _useState84[0],
    setFlippedKeys = _useState84[1];
  var _useState85 = useState([]),
    _useState86 = _slicedToArray(_useState85, 2),
    flares = _useState86[0],
    setFlares = _useState86[1];

  // === 道具系統：水球霧化 + 格子清除 ===
  var _useState87 = useState([]),
    _useState88 = _slicedToArray(_useState87, 2),
    myWeapons = _useState88[0],
    setMyWeapons = _useState88[1]; // ['balloon','eraser',...]
  var _useState89 = useState({}),
    _useState90 = _slicedToArray(_useState89, 2),
    foggedBoxes = _useState90[0],
    setFoggedBoxes = _useState90[1]; // { boxId: expiryTimestamp }
  var _useState91 = useState({}),
    _useState92 = _slicedToArray(_useState91, 2),
    erasingCells = _useState92[0],
    setErasingCells = _useState92[1]; // { cellId: { value, timestamp } }
  var _useState93 = useState('my'),
    _useState94 = _slicedToArray(_useState93, 2),
    finishViewMode = _useState94[0],
    setFinishViewMode = _useState94[1]; // 'my' | 'god'
  var lastMilestoneRef = useRef(0); // 已跨越的 10% 里程碑數量（0~9）

  var processedEventsRef = useRef(new Set());
  var completedRegionsRef = useRef(new Set());
  var scrambledCharsRef = useRef(new Set());
  var modeIcons = ['🖋️', '✏️', '🖌️'];
  var modeTitles = ['填答模式', '草稿模式', '畫筆作記號'];
  var _useState95 = useState(3),
    _useState96 = _slicedToArray(_useState95, 2),
    zoomModeIdx = _useState96[0],
    setZoomModeIdx = _useState96[1];
  var _useState97 = useState({
      value: 1.0,
      visible: false
    }),
    _useState98 = _slicedToArray(_useState97, 2),
    zoomIndicator = _useState98[0],
    setZoomIndicator = _useState98[1];
  var zoomIndicatorTimer = useRef(null);
  var _useState99 = useState(false),
    _useState100 = _slicedToArray(_useState99, 2),
    isClosingModal = _useState100[0],
    setIsClosingModal = _useState100[1];

  // --- 漂浮選單分身術 (Zoom 與 Mode 獨立系統) ---
  var _useState101 = useState(false),
    _useState102 = _slicedToArray(_useState101, 2),
    zoomMenuOpen = _useState102[0],
    setZoomMenuOpen = _useState102[1];
  var _useState103 = useState({
      x: -1,
      y: -1
    }),
    _useState104 = _slicedToArray(_useState103, 2),
    zoomMenuPos = _useState104[0],
    setZoomMenuPos = _useState104[1];
  var _useState105 = useState(false),
    _useState106 = _slicedToArray(_useState105, 2),
    isDraggingZoom = _useState106[0],
    setIsDraggingZoom = _useState106[1];
  var wasZoomDragged = useRef(false);
  var zoomDragTimer = useRef(null);
  var _useState107 = useState(false),
    _useState108 = _slicedToArray(_useState107, 2),
    modeSubOpen = _useState108[0],
    setModeSubOpen = _useState108[1];
  var _useState109 = useState({
      x: -1,
      y: -1
    }),
    _useState110 = _slicedToArray(_useState109, 2),
    modeMenuPos = _useState110[0],
    setModeMenuPos = _useState110[1];
  var _useState111 = useState(false),
    _useState112 = _slicedToArray(_useState111, 2),
    isDraggingMode = _useState112[0],
    setIsDraggingMode = _useState112[1];
  var wasModeDragged = useRef(false);
  var modeDragTimer = useRef(null);
  var _useState113 = useState(true),
    _useState114 = _slicedToArray(_useState113, 2),
    menuVertical = _useState114[0],
    setMenuVertical = _useState114[1]; // 共用排列方向偏好
  var _useState115 = useState(false),
    _useState116 = _slicedToArray(_useState115, 2),
    isGenerating = _useState116[0],
    setIsGenerating = _useState116[1];
  var _useState117 = useState(""),
    _useState118 = _slicedToArray(_useState117, 2),
    genProgress = _useState118[0],
    setGenProgress = _useState118[1];
  var isAutoFillingRef = useRef(false);
  var _useState119 = useState(null),
    _useState120 = _slicedToArray(_useState119, 2),
    colorPickerTarget = _useState120[0],
    setColorPickerTarget = _useState120[1];
  var _useState121 = useState([]),
    _useState122 = _slicedToArray(_useState121, 2),
    colorSeq = _useState122[0],
    setColorSeq = _useState122[1];
  var _useState123 = useState(""),
    _useState124 = _slicedToArray(_useState123, 2),
    editName = _useState124[0],
    setEditName = _useState124[1];
  var _useState125 = useState(""),
    _useState126 = _slicedToArray(_useState125, 2),
    roomId = _useState126[0],
    setRoomId = _useState126[1];
  var _useState127 = useState(false),
    _useState128 = _slicedToArray(_useState127, 2),
    isHost = _useState128[0],
    setIsHost = _useState128[1];
  var isHostRef = useRef(false);
  var _useState129 = useState(""),
    _useState130 = _slicedToArray(_useState129, 2),
    tempRoomId = _useState130[0],
    setTempRoomId = _useState130[1];
  var _useState131 = useState(""),
    _useState132 = _slicedToArray(_useState131, 2),
    tempPlayerName = _useState132[0],
    setTempPlayerName = _useState132[1];
  var _useState133 = useState('entry'),
    _useState134 = _slicedToArray(_useState133, 2),
    setupStep = _useState134[0],
    setSetupStep = _useState134[1]; // entry | create | join（比照數橋三段式）
  // ===== 每日一題（比照數橋） =====
  var dailyTodayStr = function dailyTodayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  var shiftDateStr = function shiftDateStr(ds, delta) {
    var d = new Date(ds + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  var _useState135 = useState(function () {
      return dailyTodayStr();
    }),
    _useState136 = _slicedToArray(_useState135, 2),
    dailyPickDate = _useState136[0],
    setDailyPickDate = _useState136[1];
  var _useState137 = useState(null),
    _useState138 = _slicedToArray(_useState137, 2),
    dailyDate = _useState138[0],
    setDailyDate = _useState138[1]; // 進行中的每日題日期（null=非每日模式）
  var dailyRef = useRef(null);
  var dailyRecordedRef = useRef(false);
  var _useState139 = useState(function () {
      try {
        return JSON.parse(localStorage.getItem('sudoku_daily_records') || '{}');
      } catch (e) {
        return {};
      }
    }),
    _useState140 = _slicedToArray(_useState139, 2),
    dailyRecords = _useState140[0],
    setDailyRecords = _useState140[1];
  var _useState141 = useState(function () {
      try {
        return JSON.parse(localStorage.getItem('sudoku_daily_streak') || '{"count":0,"lastDate":""}');
      } catch (e) {
        return {
          count: 0,
          lastDate: ''
        };
      }
    }),
    _useState142 = _slicedToArray(_useState141, 2),
    dailyStreak = _useState142[0],
    setDailyStreak = _useState142[1];
  var _useState143 = useState(false),
    _useState144 = _slicedToArray(_useState143, 2),
    showTutorial = _useState144[0],
    setShowTutorial = _useState144[1];
  var _useState145 = useState(false),
    _useState146 = _slicedToArray(_useState145, 2),
    stableMode = _useState146[0],
    setStableMode = _useState146[1];
  var _useState147 = useState(0),
    _useState148 = _slicedToArray(_useState147, 2),
    titleClicks = _useState148[0],
    setTitleClicks = _useState148[1];
  var _useState149 = useState([{
      id: myId,
      name: "單機玩家",
      isHost: true,
      color: COLORS[11],
      isReady: false,
      isSpectator: false
    }]),
    _useState150 = _slicedToArray(_useState149, 2),
    playersList = _useState150[0],
    setPlayersList = _useState150[1];
  var _useState151 = useState(false),
    _useState152 = _slicedToArray(_useState151, 2),
    isConnecting = _useState152[0],
    setIsConnecting = _useState152[1];
  var _useState153 = useState(""),
    _useState154 = _slicedToArray(_useState153, 2),
    connectionStatus = _useState154[0],
    setConnectionStatus = _useState154[1];
  var _useState155 = useState(false),
    _useState156 = _slicedToArray(_useState155, 2),
    showCancelButton = _useState156[0],
    setShowCancelButton = _useState156[1];
  var _useState157 = useState(true),
    _useState158 = _slicedToArray(_useState157, 2),
    showOtherCursors = _useState158[0],
    setShowOtherCursors = _useState158[1];
  var _useState159 = useState(true),
    _useState160 = _slicedToArray(_useState159, 2),
    showGhostProgress = _useState160[0],
    setShowGhostProgress = _useState160[1];
  var _useState161 = useState({}),
    _useState162 = _slicedToArray(_useState161, 2),
    cursors = _useState162[0],
    setCursors = _useState162[1];
  var _useState163 = useState([]),
    _useState164 = _slicedToArray(_useState163, 2),
    ripples = _useState164[0],
    setRipples = _useState164[1];
  var isMultiplayer = engine === 'peerjs';
  var svgRef = useRef(null);
  var lastCursorSend = useRef(0);
  var isDrawingRef = useRef(false);
  var cellLongPressTimer = useRef(null);
  var isLongPressTriggered = useRef(false);
  var touchStartPt = useRef(null);
  var engineRef = useRef('none');
  var peerRef = useRef(null);
  var connRef = useRef(null);
  var connsRef = useRef([]);
  var zoomContainerRef = useRef(null);
  var lastPinchDist = useRef(null);
  var stateRef = useRef({
    cells: [],
    localCells: [],
    levelData: null,
    startTime: Date.now(),
    sizeId: 9,
    diffId: 'medium',
    strokes: [],
    isGenerating: false,
    selectedChar: null,
    isBrawlMode: false,
    brawlWinners: [],
    brawlSettings: {
      winnersCount: 3,
      allowQuickFill: false,
      allowTraversal: false,
      allowYellowHint: false,
      hideAnswers: true,
      allowOthersToPlayAgain: true,
      allowGifts: true,
      showNumbersInGodMode: false
    },
    winner: null,
    isAutoFilling: false,
    matchPhase: 'playing',
    matchEndTime: null,
    countdownTarget: null,
    giftEvents: [],
    keyMapping: [],
    unopenedGifts: {},
    myWeapons: []
  });
  var playersListRef = useRef([]);
  var handleMultiplayerWinRef = useRef(null);
  handleMultiplayerWinRef.current = function (winInfo) {
    if (!stateRef.current.isBrawlMode) return;
    if (stateRef.current.brawlWinners.some(function (w) {
      return w.id === winInfo.id;
    })) return;
    var curWinners = stateRef.current.brawlWinners;
    var newWinners = [].concat(_toConsumableArray(curWinners), [winInfo]);
    var winnersIds = newWinners.map(function (w) {
      return w.id || w.uid;
    });
    var playingPlayers = playersListRef.current.filter(function (p) {
      return !p.isSpectator && !p.isHost;
    });
    var winnersLimit = stateRef.current.isBrawlMode ? stateRef.current.brawlSettings.winnersCount || 1 : 1;
    var allDone = newWinners.length >= winnersLimit || playingPlayers.length > 0 && playingPlayers.every(function (p) {
      return winnersIds.includes(p.id);
    });
    var winnerObj = stateRef.current.isBrawlMode ? newWinners[0] || winInfo : winInfo;
    stateRef.current.brawlWinners = newWinners;
    if (allDone) {
      var now = Date.now();
      stateRef.current.matchPhase = 'finished';
      stateRef.current.matchEndTime = now;
      stateRef.current.winner = winnerObj;
    }
    setBrawlWinners(newWinners);
    if (allDone) {
      setMatchPhase('finished');
      setWinner(winnerObj);
    }
    if (engineRef.current === 'peerjs' && isHostRef.current) {
      var syncData = {
        brawlWinners: newWinners
      };
      if (allDone) {
        syncData.matchPhase = 'finished';
        syncData.matchEndTime = stateRef.current.matchEndTime;
        syncData.winner = winnerObj;
      }
      syncState(syncData, true);
    }
  };
  var zoomLevelRef = useRef(1);
  var zoomModeIdxRef = useRef(3);
  var currentPathDataRef = useRef("");
  var drawingPathRef = useRef(null);
  var eraserRef = useRef(null);
  var lastEraseTimeRef = useRef(0);
  var handleBrawlWinRef = useRef(null);
  var handleRegenerateRandomRef = useRef(null);
  var handleReceiveWeaponRef = useRef(null);
  var handleWeaponHitFogRef = useRef(null);
  var handleWeaponHitEraseRef = useRef(null);
  var handleReceiveCounterAttackRef = useRef(null);
  var handleMilestoneRef = useRef(null);
  handleBrawlWinRef.current = function (winInfo) {
    if (handleMultiplayerWinRef.current) handleMultiplayerWinRef.current(winInfo);
  };
  var cSizeDef = levelData.sizeDef;
  var CELL_SIZE = 60;
  var PADDING = 20;
  var svgW = cSizeDef.size * CELL_SIZE + PADDING * 2;
  var svgH = cSizeDef.size * CELL_SIZE + PADDING * 2;
  var MAX_SAFE_DIMENSION = 4000;
  var activeCells = isBrawlMode ? localCells : cells;
  useEffect(function () {
    playersListRef.current = playersList;
  }, [playersList]);

  // 定期清理過期的盤面禮物 (已經廢棄，禮物永久保存不用清理)

  useEffect(function () {
    if (matchPhase === 'countdown' && countdownTarget) {
      var checkTime = function checkTime() {
        var remaining = Math.ceil((countdownTarget - Date.now()) / 1000);
        if (remaining > 0) {
          setCountdownValue(remaining);
        } else {
          setCountdownValue(null);
          if (stateRef.current.matchPhase !== 'playing') {
            setMatchPhase('playing');
            setStartTime(countdownTarget);
            setMatchStartTime(countdownTarget);
            stateRef.current.matchPhase = 'playing';
            stateRef.current.matchEndTime = null;
            stateRef.current.startTime = countdownTarget;
          }
        }
      };
      checkTime();
      var interval = setInterval(checkTime, 100);
      return function () {
        return clearInterval(interval);
      };
    } else {
      setCountdownValue(null);
    }
  }, [matchPhase, countdownTarget]);

  // --- 漂浮選單拖動邏輯 (通用) ---
  useEffect(function () {
    if (!isDraggingZoom && !isDraggingMode) return;
    var handleGlobalMove = function handleGlobalMove(e) {
      var margin = 20;
      var x = Math.max(margin, Math.min(window.innerWidth - margin, e.clientX));
      var y = Math.max(margin, Math.min(window.innerHeight - margin, e.clientY));
      if (isDraggingZoom) setZoomMenuPos({
        x: x,
        y: y
      });else if (isDraggingMode) setModeMenuPos({
        x: x,
        y: y
      });
    };
    var handleGlobalUp = function handleGlobalUp() {
      if (isDraggingZoom) {
        setIsDraggingZoom(false);
        wasZoomDragged.current = true;
        setTimeout(function () {
          return wasZoomDragged.current = false;
        }, 200);
      }
      if (isDraggingMode) {
        setIsDraggingMode(false);
        wasModeDragged.current = true;
        setTimeout(function () {
          return wasModeDragged.current = false;
        }, 200);
      }
      if (zoomDragTimer.current) clearTimeout(zoomDragTimer.current);
      if (modeDragTimer.current) clearTimeout(modeDragTimer.current);
    };
    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);
    return function () {
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('pointerup', handleGlobalUp);
    };
  }, [isDraggingZoom, isDraggingMode]);
  var handleZoomPointerDown = function handleZoomPointerDown(e) {
    zoomDragTimer.current = setTimeout(function () {
      setIsDraggingZoom(true);
      setZoomMenuOpen(false);
      setZoomMenuPos({
        x: e.clientX,
        y: e.clientY
      });
    }, 500);
  };
  var handleModePointerDown = function handleModePointerDown(e) {
    modeDragTimer.current = setTimeout(function () {
      setIsDraggingMode(true);
      setModeSubOpen(false);
      setModeMenuPos({
        x: e.clientX,
        y: e.clientY
      });
    }, 500);
  };
  var handleMenuPointerUpGlobal = function handleMenuPointerUpGlobal() {
    if (zoomDragTimer.current) {
      clearTimeout(zoomDragTimer.current);
      zoomDragTimer.current = null;
    }
    if (modeDragTimer.current) {
      clearTimeout(modeDragTimer.current);
      modeDragTimer.current = null;
    }
    setIsDraggingZoom(false);
    setIsDraggingMode(false);
  };
  useEffect(function () {
    if (!isHostRef.current && isMultiplayer) return;
    if (matchPhase === 'waiting' && playersList.length > 0) {
      var allReady = playersList.every(function (p) {
        return p.isReady;
      });
      if (allReady && playersList.filter(function (p) {
        return !p.isSpectator;
      }).length > 0) {
        var target = Date.now() + 5000;
        syncState({
          matchPhase: 'countdown',
          countdownTarget: target
        }, true);
      }
    }
  }, [playersList, matchPhase, isMultiplayer]);
  useEffect(function () {
    setGhostHints({});
    completedRegionsRef.current.clear();
    setUnopenedGifts({});
    scrambledCharsRef.current.clear();
    processedEventsRef.current.clear();
    setMyWeapons([]);
    setFoggedBoxes({});
    setFinishViewMode('my');
    lastMilestoneRef.current = 0;
  }, [startTime]);
  useEffect(function () {
    if (selectedChar && completedChars.has(selectedChar)) setSelectedChar(null);
  }, [completedChars, selectedChar]);
  useEffect(function () {
    if (screen !== 'game' || isSpectator) return;
    var handleKeyDown = function handleKeyDown(e) {
      if (interactionMode >= 2 || isAutoFillingRef.current || matchPhase !== 'playing') return;
      var key = e.key.toUpperCase();
      var origIdx = cSizeDef.chars.indexOf(key);
      if (origIdx !== -1) {
        var mappedKey = keyMapping[origIdx];
        if (!completedChars.has(mappedKey)) setSelectedChar(function (prev) {
          return prev === mappedKey ? null : mappedKey;
        });
      } else if (e.key === 'q' || e.key === 'Q') toggleInteractionMode();
    };
    window.addEventListener('keydown', handleKeyDown);
    return function () {
      return window.removeEventListener('keydown', handleKeyDown);
    };
  }, [screen, cSizeDef.chars, interactionMode, completedChars, matchPhase, isSpectator, keyMapping]);
  var getPlayerColor = function getPlayerColor(uid) {
    var p = playersList.find(function (p) {
      return p.id === uid;
    });
    if (!p) return COLORS[11];
    var isOnline = engineRef.current === 'none' || p.id === myId || (isHostRef.current ? connsRef.current.some(function (c) {
      return (c.uid === p.id || c.peer === p.id) && c.open;
    }) : connRef.current && connRef.current.open);
    return isOnline ? p.color : '#94a3b8';
  };
  var myCurrentColor = getPlayerColor(myId);
  var _mePlayer = playersList.find(function (p) {
    return p.id === myId;
  });
  myNameRef.current = _mePlayer ? _mePlayer.name : "";
  myColorRef.current = myCurrentColor;
  useEffect(function () {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);
  useEffect(function () {
    zoomModeIdxRef.current = zoomModeIdx;
  }, [zoomModeIdx]);

  // 同步本地觀戰狀態與伺服器列表中的身分
  useEffect(function () {
    var me = playersList.find(function (p) {
      return p.id === myId;
    });
    if (me && me.isSpectator !== isSpectator) {
      setIsSpectator(me.isSpectator);
    }
  }, [playersList, myId]);
  useEffect(function () {
    stateRef.current = _objectSpread(_objectSpread({}, stateRef.current), {}, {
      cells: cells,
      localCells: localCells,
      levelData: levelData,
      startTime: startTime,
      sizeId: sizeId,
      diffId: diffId,
      strokes: strokes,
      isBrawlMode: isBrawlMode,
      brawlWinners: brawlWinners,
      brawlSettings: brawlSettings,
      winner: winner,
      matchPhase: matchPhase,
      matchEndTime: stateRef.current.matchEndTime,
      countdownTarget: countdownTarget,
      keyMapping: keyMapping,
      unopenedGifts: unopenedGifts,
      myWeapons: myWeapons,
      ghostHints: ghostHints,
      finishViewMode: finishViewMode
    });
  }, [cells, localCells, levelData, startTime, sizeId, diffId, strokes, isBrawlMode, brawlWinners, brawlSettings, winner, matchPhase, countdownTarget, keyMapping, unopenedGifts, myWeapons, ghostHints, finishViewMode]);

  // 連線超時處理 (v3.8.14)
  useEffect(function () {
    var timer;
    if (isConnecting) {
      timer = setTimeout(function () {
        setShowCancelButton(true);
      }, 20000);
    } else {
      setShowCancelButton(false);
      setConnectionStatus("");
    }
    return function () {
      return clearTimeout(timer);
    };
  }, [isConnecting]);
  var cancelConnection = function cancelConnection() {
    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch (e) {}
      peerRef.current = null;
    }
    setIsConnecting(false);
    setScreen('home');
    showToast("已取消連線嘗試");
  };

  // 新增：多人模式分層自動同步機制 (v3.8.13)
  useEffect(function () {
    if (!isHost || engineRef.current !== 'peerjs') return;
    var interval = setInterval(function () {
      var list = playersListRef.current;
      var phase = stateRef.current.matchPhase;

      // 1. 廣播最新名單 (包含在線燈號狀態)
      connsRef.current.forEach(function (c) {
        if (c.open) c.send({
          type: 'PLAYERS_UPDATE',
          players: list
        });
      });

      // 2. 遊戲中進行完整狀態 Heartbeat (補償掉包) (v3.8.32: 排除個人狀態以防覆蓋客端進度)
      if (phase === 'playing') {
        // 依照使用者要求，每 3 秒心跳僅檢查連線狀態，不再強制夾帶盤面覆寫客端進度 (v3.9.10)
        connsRef.current.forEach(function (c) {
          if (c.open) c.send({
            type: 'HEARTBEAT_PING',
            timestamp: Date.now()
          });
        });
      }
    }, matchPhase === 'waiting' ? 1000 : 3000);
    return function () {
      return clearInterval(interval);
    };
  }, [isHost, matchPhase]);
  var conflictCellIds = useMemo(function () {
    var conflicts = new Set();
    var grid = Array(cSizeDef.size).fill(null).map(function () {
      return Array(cSizeDef.size).fill(null);
    });
    activeCells.forEach(function (c) {
      if (c.value) grid[c.y][c.x] = c;
    });
    for (var i = 0; i < cSizeDef.size; i++) {
      var rowSeen = {};
      var colSeen = {};
      for (var j = 0; j < cSizeDef.size; j++) {
        var cr = grid[i][j];
        if (cr) {
          if (rowSeen[cr.value]) {
            conflicts.add(cr.id);
            conflicts.add(rowSeen[cr.value].id);
          } else rowSeen[cr.value] = cr;
        }
        var cc = grid[j][i];
        if (cc) {
          if (colSeen[cc.value]) {
            conflicts.add(cc.id);
            conflicts.add(colSeen[cc.value].id);
          } else colSeen[cc.value] = cc;
        }
      }
    }
    for (var by = 0; by < cSizeDef.size; by += cSizeDef.boxH) {
      for (var bx = 0; bx < cSizeDef.size; bx += cSizeDef.boxW) {
        var boxSeen = {};
        for (var dy = 0; dy < cSizeDef.boxH; dy++) {
          for (var dx = 0; dx < cSizeDef.boxW; dx++) {
            var cb = grid[by + dy][bx + dx];
            if (cb) {
              if (boxSeen[cb.value]) {
                conflicts.add(cb.id);
                conflicts.add(boxSeen[cb.value].id);
              } else boxSeen[cb.value] = cb;
            }
          }
        }
      }
    }
    return conflicts;
  }, [activeCells, cSizeDef]);
  var completedChars = useMemo(function () {
    var counts = {};
    activeCells.forEach(function (c) {
      if (c.value !== null && !conflictCellIds.has(c.id)) {
        counts[c.value] = (counts[c.value] || 0) + 1;
      }
    });
    var completed = new Set();
    if (cSizeDef && cSizeDef.chars) {
      var _iterator = _createForOfIteratorHelper(cSizeDef.chars),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _char = _step.value;
          if (counts[_char] >= cSizeDef.size) completed.add(_char);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    return completed;
  }, [activeCells, cSizeDef, conflictCellIds]);
  useEffect(function () {
    if (selectedChar && completedChars.has(selectedChar)) setSelectedChar(null);
  }, [completedChars, selectedChar]);
  useEffect(function () {
    if (screen !== 'game' || isSpectator) return;
    var handleKeyDown = function handleKeyDown(e) {
      if (interactionMode >= 2 || isAutoFillingRef.current || matchPhase !== 'playing') return;
      var key = e.key.toUpperCase();
      var origIdx = cSizeDef.chars.indexOf(key);
      if (origIdx !== -1) {
        var mappedKey = keyMapping[origIdx];
        if (!completedChars.has(mappedKey)) setSelectedChar(function (prev) {
          return prev === mappedKey ? null : mappedKey;
        });
      } else if (e.key === 'q' || e.key === 'Q') toggleInteractionMode();
    };
    window.addEventListener('keydown', handleKeyDown);
    return function () {
      return window.removeEventListener('keydown', handleKeyDown);
    };
  }, [screen, cSizeDef.chars, interactionMode, completedChars, matchPhase, isSpectator, keyMapping]);
  var highlightZones = useMemo(function () {
    var zones = new Set();
    if (selectedChar === null || interactionMode >= 2) return zones;
    activeCells.forEach(function (c) {
      if (c.value === selectedChar) {
        activeCells.forEach(function (target) {
          if (target.x === c.x || target.y === c.y || target.boxId === c.boxId) zones.add(target.id);
        });
      }
    });
    return zones;
  }, [activeCells, selectedChar, interactionMode]);
  var totalEmpty = useMemo(function () {
    var targetCells = isBrawlMode ? localCells : cells;
    if (!targetCells || targetCells.length === 0) return 1;
    return targetCells.filter(function (c) {
      return !c.isGiven;
    }).length || 1;
  }, [localCells, cells]);
  var playerProgress = useMemo(function () {
    if (isBrawlMode) return [];
    var counts = {};
    cells.forEach(function (c) {
      if (!c.isGiven && c.value !== null && c.owner) counts[c.owner] = (counts[c.owner] || 0) + 1;
    });
    return Object.entries(counts).map(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
        uid = _ref3[0],
        count = _ref3[1];
      return {
        uid: uid,
        color: getPlayerColor(uid),
        pct: Math.round(count / totalEmpty * 100)
      };
    });
  }, [cells, totalEmpty, playersList, isBrawlMode]);

  // 為幽靈競速模式建立所有人的獨立進度
  var ghostProgress = useMemo(function () {
    if (!isBrawlMode) return {};
    var counts = {};
    playersList.forEach(function (p) {
      return counts[p.id] = 0;
    });
    Object.values(ghostHints).forEach(function (cellHints) {
      Object.keys(cellHints).forEach(function (uid) {
        if (counts[uid] !== undefined) counts[uid]++;
      });
    });
    // 自己精確的進度 (v3.13.3 移除衝突檢查，避免透過進度條洩漏答案)
    var myAccurateCount = localCells.filter(function (c) {
      return !c.isGiven && c.value !== null;
    }).length;
    counts[myId] = Math.max(counts[myId] || 0, myAccurateCount);
    var result = {};
    Object.keys(counts).forEach(function (uid) {
      result[uid] = totalEmpty > 0 ? Math.min(100, Math.round(counts[uid] / totalEmpty * 100)) : 0;
    });
    return result;
  }, [ghostHints, playersList, localCells, conflictCellIds, totalEmpty, myId]);

  // 區域完成判斷與禮物發送
  useEffect(function () {
    if (!isBrawlMode || isGenerating || !localCells.length || isSpectator || matchPhase !== 'playing') return;
    var solution = solutionGridRef.current;
    if (!solution) return;
    var newComps = 0;
    var s = cSizeDef.size;
    var chars = cSizeDef.chars;
    var _loop = function _loop(i) {
      if (s !== 4) {
        // 4x4 模式不發送行列宮的禮物
        if (!completedRegionsRef.current.has("R".concat(i))) {
          var rowCells = localCells.filter(function (c) {
            return c.y === i;
          });
          if (rowCells.length === s && rowCells.every(function (c) {
            return c.value === solution[c.y][c.x];
          })) {
            completedRegionsRef.current.add("R".concat(i));
            if (!rowCells.every(function (c) {
              return c.isGiven;
            })) newComps++;
          }
        }
        if (!completedRegionsRef.current.has("C".concat(i))) {
          var colCells = localCells.filter(function (c) {
            return c.x === i;
          });
          if (colCells.length === s && colCells.every(function (c) {
            return c.value === solution[c.y][c.x];
          })) {
            completedRegionsRef.current.add("C".concat(i));
            if (!colCells.every(function (c) {
              return c.isGiven;
            })) newComps++;
          }
        }
        if (!completedRegionsRef.current.has("B".concat(i))) {
          var boxCells = localCells.filter(function (c) {
            return c.boxId === i;
          });
          if (boxCells.length === s && boxCells.every(function (c) {
            return c.value === solution[c.y][c.x];
          })) {
            completedRegionsRef.current.add("B".concat(i));
            if (!boxCells.every(function (c) {
              return c.isGiven;
            })) newComps++;
          }
        }
      }
    };
    for (var i = 0; i < s; i++) {
      _loop(i);
    }
    chars.forEach(function (_char2) {
      if (!completedRegionsRef.current.has("N".concat(_char2))) {
        var numCells = localCells.filter(function (c) {
          return c.value === _char2;
        });
        if (numCells.length === s && numCells.every(function (c) {
          return c.value === solution[c.y][c.x];
        })) {
          completedRegionsRef.current.add("N".concat(_char2));
          if (!numCells.every(function (c) {
            return c.isGiven;
          })) newComps++;
        }
      }
    });
    if (newComps > 0 && stateRef.current.brawlSettings.allowGifts !== false) {
      var _loop2 = function _loop2() {
        var winnersIds = stateRef.current.brawlWinners.map(function (w) {
          return w.id;
        });
        var validPlayers = playersList.filter(function (p) {
          return !p.isSpectator && !winnersIds.includes(p.id) && p.id !== myId;
        });

        // 計算自己的有效分數（正確格數 + 未拆禮物數）
        var myEffectiveScore = (ghostProgress[myId] || 0) + (stateRef.current.unopenedGifts[myId] ? stateRef.current.unopenedGifts[myId].length : 0);

        // 只送給比自己弱（有效分數更低）的玩家
        var weakerPlayers = validPlayers.filter(function (p) {
          var pScore = (ghostProgress[p.id] || 0) + (stateRef.current.unopenedGifts[p.id] ? stateRef.current.unopenedGifts[p.id].length : 0);
          return pScore < myEffectiveScore;
        });
        if (weakerPlayers.length === 0) return 1; // continue
        // 沒有比自己弱的人，不送

        // 加權隨機：差距越大機率越高
        var weights = weakerPlayers.map(function (p) {
          var pScore = (ghostProgress[p.id] || 0) + (stateRef.current.unopenedGifts[p.id] ? stateRef.current.unopenedGifts[p.id].length : 0);
          return Math.sqrt(myEffectiveScore - pScore + 1);
        });
        var totalWeight = weights.reduce(function (a, b) {
          return a + b;
        }, 0);
        var rand = Math.random() * totalWeight;
        var targetUid = weakerPlayers[weakerPlayers.length - 1].id;
        for (var _i = 0; _i < weakerPlayers.length; _i++) {
          rand -= weights[_i];
          if (rand <= 0) {
            targetUid = weakerPlayers[_i].id;
            break;
          }
        }
        var gid = Math.random().toString(36).substring(2, 10);
        var msg = {
          type: 'RECEIVE_GIFT',
          targetUid: targetUid,
          senderUid: myId,
          id: gid,
          timestamp: Date.now()
        };
        if (engineRef.current === 'peerjs') {
          if (isHostRef.current) connsRef.current.forEach(function (c) {
            return c.send(msg);
          });else if (connRef.current) connRef.current.send(msg);
          setUnopenedGifts(function (prev) {
            var q = prev[targetUid] || [];
            return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, targetUid, [].concat(_toConsumableArray(q), [myId])));
          });
        }
      };
      for (var k = 0; k < newComps; k++) {
        if (_loop2()) continue;
      }
    }
  }, [localCells, isGenerating, cSizeDef.size, cSizeDef.chars, ghostHints, isSpectator, matchPhase, conflictCellIds, ghostProgress, playersList, brawlWinners]);

  // === 里程碑偵測：自己每跨過 10% 就廣播給主機分配道具 ===
  useEffect(function () {
    if (!isBrawlMode || isSpectator || matchPhase !== 'playing' || !isMultiplayer) return;
    if (totalEmpty === 0) return;

    // 計算自己的有效完成率（使用 ghostProgress 的自身值，最精確）
    var myCorrect = ghostProgress[myId] || 0;
    var myGifts = (stateRef.current.unopenedGifts[myId] || []).length;
    var myEffectivePct = Math.min(99, Math.floor((myCorrect + myGifts) / totalEmpty * 100));

    // 目前應達到的里程碑級別（每 10% 一個）
    var currentMilestone = Math.floor(myEffectivePct / 10);
    if (currentMilestone > lastMilestoneRef.current) {
      lastMilestoneRef.current = currentMilestone;
      // 廣播給主機（主機自己也要處理）
      var msg = {
        type: 'MILESTONE_REACHED',
        uid: myId,
        completionPct: myEffectivePct,
        id: Math.random().toString(36).substring(2, 10),
        timestamp: Date.now()
      };
      if (engineRef.current === 'peerjs') {
        if (isHostRef.current) {
          // 自己是主機，直接本地處理
          if (handleMilestoneRef.current) handleMilestoneRef.current(msg);
        } else if (connRef.current) {
          connRef.current.send(msg);
        }
      }
    }
  }, [ghostProgress, myId, isSpectator, matchPhase, isMultiplayer, totalEmpty]);
  useEffect(function () {
    if (!activeCells || activeCells.length === 0 || isGenerating || winner || matchPhase !== 'playing' || isSpectator) return;
    var isFull = activeCells.every(function (c) {
      return c.value !== null;
    });
    var hasNoConflicts = conflictCellIds.size === 0;
    if (isFull && hasNoConflicts) {
      if (isBrawlMode) {
        if (!isWinnerDeclaredRef.current) {
          isWinnerDeclaredRef.current = true;
          var finishTime = Date.now();
          var isBrawl = stateRef.current.isBrawlMode;
          setIsWon(true);
          setEndTime(finishTime);
          setHideVictoryModal(false);
          if (!isBrawl) {
            setMatchPhase('finished');
          } else {
            setIsSpectator(true);
            showToast("🏁 恭喜完成！已進入觀戰模式，觀察對手中...");
          }
          var me = playersList.find(function (p) {
            return p.id === myId;
          });
          var winInfo = {
            id: myId,
            name: me ? me.name : "玩家",
            color: me ? me.color : COLORS[0],
            time: formatTime(Math.floor((finishTime - (matchStartTime || startTime)) / 1000)),
            isBrawl: isBrawl
          };

          // 客戶端先本地同步一份獲勝名單，增加即時感 (v3.10.4)
          if (isBrawl) setBrawlWinners(function (prev) {
            if (prev.some(function (w) {
              return w.id === myId;
            })) return prev;
            return [].concat(_toConsumableArray(prev), [winInfo]);
          });
          var msgId = Math.random().toString(36).substring(2, 10);
          var msg = {
            type: 'GHOST_I_WON',
            senderUid: myId,
            id: msgId,
            time: finishTime,
            winInfo: winInfo
          };
          if (engineRef.current === 'peerjs') {
            if (isHostRef.current) {
              if (!isBrawl) {
                setWinner(winInfo);
                connsRef.current.forEach(function (c) {
                  return c.send({
                    type: 'GHOST_WINNER',
                    winner: winInfo
                  });
                });
              } else if (handleBrawlWinRef.current) handleBrawlWinRef.current(winInfo);
            } else if (connRef.current) connRef.current.send(msg);
          }
        }
      } else {
        if (!isWon) {
          setIsWon(true);
          setEndTime(Date.now());
          setHideVictoryModal(false);
          setMatchPhase('finished');
        }
      }
    } else {
      if (isWon) {
        setIsWon(false);
        setEndTime(null);
        setMatchPhase('playing');
      }
    }
  }, [activeCells, conflictCellIds.size, isWon, isGenerating, winner, matchStartTime, startTime, playersList, myId, matchPhase, isSpectator]);

  // 觸控縮放
  useEffect(function () {
    if (screen !== 'game') return;
    var el = zoomContainerRef.current;
    if (!el) return;
    var touchStartY = null;
    var handleTouchStart = function handleTouchStart(e) {
      if (e.touches.length === 1) touchStartY = e.touches[0].clientY;
    };
    var handleTouchMove = function handleTouchMove(e) {
      if (interactionMode >= 2 || isSpectator) return;
      if (e.touches.length === 2) {
        e.preventDefault();
        var dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (lastPinchDist.current) {
          var delta = dist - lastPinchDist.current;
          var newZoom = Math.min(Math.max(zoomLevelRef.current + delta * 0.005, 0.4), 3.5);
          if (svgW * newZoom > MAX_SAFE_DIMENSION || svgH * newZoom > MAX_SAFE_DIMENSION) newZoom = Math.min(MAX_SAFE_DIMENSION / svgW, MAX_SAFE_DIMENSION / svgH);
          zoomLevelRef.current = newZoom;
          if (svgRef.current) {
            svgRef.current.style.width = "".concat(svgW * newZoom, "px");
            svgRef.current.style.height = "".concat(svgH * newZoom, "px");
          }
          if (zoomModeIdxRef.current !== 0) {
            setZoomModeIdx(0);
            zoomModeIdxRef.current = 0;
          }
          showZoomIndicator(newZoom);
        }
        lastPinchDist.current = dist;
      } else if (e.touches.length === 1 && touchStartY !== null) {
        if (Math.abs(e.touches[0].clientY - touchStartY) > 30 && !isHeaderCollapsed) setIsHeaderCollapsed(true);
      }
    };
    var handleTouchEnd = function handleTouchEnd() {
      lastPinchDist.current = null;
      touchStartY = null;
      if (zoomLevel !== zoomLevelRef.current) setZoomLevel(zoomLevelRef.current);
    };
    var handleWheel = function handleWheel(e) {
      if (interactionMode >= 2 || isSpectator) return;
      if (Math.abs(e.deltaY) > 10 && !isHeaderCollapsed) setIsHeaderCollapsed(true);
      if (e.ctrlKey && zoomModeIdxRef.current !== 0) {
        setZoomModeIdx(0);
        zoomModeIdxRef.current = 0;
      }
    };
    el.addEventListener('touchstart', handleTouchStart, {
      passive: true
    });
    el.addEventListener('touchmove', handleTouchMove, {
      passive: false
    });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);
    el.addEventListener('wheel', handleWheel, {
      passive: true
    });
    return function () {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [screen, isHeaderCollapsed, interactionMode, svgW, svgH, zoomLevel, isSpectator]);
  useEffect(function () {
    if (ripples.length === 0) return;
    var timer = setTimeout(function () {
      var now = Date.now();
      setRipples(function (prev) {
        return prev.filter(function (r) {
          return now - r.timestamp < 1000;
        });
      });
    }, 1000);
    return function () {
      return clearTimeout(timer);
    };
  }, [ripples]);

  // 霧化遮罩倒數 ticker：每 500ms 觸發一次重渲染以更新倒數秒數
  useEffect(function () {
    if (Object.keys(foggedBoxes).length === 0) return;
    var ticker = setInterval(function () {
      var now = Date.now();
      setFoggedBoxes(function (prev) {
        var next = _objectSpread({}, prev);
        var changed = false;
        Object.keys(next).forEach(function (k) {
          if (next[k] <= now) {
            delete next[k];
            changed = true;
          }
        });
        return changed ? next : prev; // 若有到期的才更新 state
      });
    }, 500);
    return function () {
      return clearInterval(ticker);
    };
  }, [foggedBoxes]);

  // 清除特效清理 ticker：每 500ms 清理超過 1 秒的 erasingCells
  useEffect(function () {
    if (Object.keys(erasingCells).length === 0) return;
    var ticker = setInterval(function () {
      var now = Date.now();
      setErasingCells(function (prev) {
        var next = _objectSpread({}, prev);
        var changed = false;
        Object.keys(next).forEach(function (k) {
          if (now - next[k].timestamp > 1000) {
            delete next[k];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 500);
    return function () {
      return clearInterval(ticker);
    };
  }, [erasingCells]);
  var revealSystemCellRef = useRef();
  revealSystemCellRef.current = function (cellId) {
    var grid = solutionGridRef.current;
    var targetCell = stateRef.current.localCells.find(function (c) {
      return c.id === cellId;
    });
    if (!grid || !targetCell) return;
    var ansValue = grid[targetCell.y] ? grid[targetCell.y][targetCell.x] : null;
    if (ansValue === null || ansValue === undefined) return;
    setLocalCells(function (prev) {
      var nextCells = _toConsumableArray(prev);
      var targetIdx = nextCells.findIndex(function (c) {
        return c.id === cellId;
      });
      if (targetIdx === -1) return prev;
      var target = nextCells[targetIdx];
      nextCells[targetIdx] = _objectSpread(_objectSpread({}, target), {}, {
        value: ansValue,
        drafts: [],
        isSystemRevealed: true,
        owner: null
      });
      for (var i = 0; i < nextCells.length; i++) {
        if (i !== targetIdx) {
          var c = nextCells[i];
          if (c.x === target.x || c.y === target.y || c.boxId === target.boxId) {
            if (c.drafts.includes(ansValue)) {
              nextCells[i] = _objectSpread(_objectSpread({}, c), {}, {
                drafts: c.drafts.filter(function (d) {
                  return d !== ansValue;
                })
              });
            }
          }
        }
      }
      stateRef.current.localCells = nextCells;
      return nextCells;
    });
    var me = playersListRef.current.find(function (p) {
      return p.id === myId;
    });
    var msg = {
      type: 'GHOST_SOLVED',
      uid: myId,
      color: me ? me.color : myColorRef.current,
      cellId: cellId,
      id: Math.random().toString(36).substring(2, 11),
      value: ansValue
    };
    if (engineRef.current === 'peerjs') {
      if (isHostRef.current) connsRef.current.forEach(function (c) {
        return c.send(msg);
      });else if (connRef.current) connRef.current.send(msg);
    }
  };
  var handleReceiveGiftRef = useRef();
  handleReceiveGiftRef.current = function (ev) {
    if (isSpectator) return;
    // 將收到的禮物的 senderUid 放入目標的 unopenedGifts 佇列
    setUnopenedGifts(function (prev) {
      var currentQueue = prev[ev.targetUid] || [];
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, ev.targetUid, [].concat(_toConsumableArray(currentQueue), [ev.senderUid || 'system'])));
    });
  };
  var triggerRipple = function triggerRipple(pt) {
    var msg = {
      type: 'RIPPLE',
      x: pt.x,
      y: pt.y,
      color: myColorRef.current || COLORS[0],
      id: Math.random().toString(36).substring(2, 10)
    };
    if (engineRef.current === 'peerjs') {
      if (isHostRef.current) connsRef.current.forEach(function (c) {
        return c.send(msg);
      });else if (connRef.current) connRef.current.send(msg);
    }
  };
  var triggerCounterAttack = function triggerCounterAttack(targetUid) {
    var msg = {
      type: 'GIFT_COUNTER_ATTACK',
      targetUid: targetUid,
      id: Math.random().toString(36).substring(2, 10),
      timestamp: Date.now()
    };
    if (engineRef.current === 'peerjs') {
      if (isHostRef.current) connsRef.current.forEach(function (c) {
        return c.send(msg);
      });else if (connRef.current) connRef.current.send(msg);
    }
  };
  handleReceiveCounterAttackRef.current = function () {
    if (isSpectator) return;
    showToast("💥 遭到反擊！數字按鍵順序大亂！");
    setKeyMapping(function (prev) {
      var newMap = _toConsumableArray(prev);
      if (newMap.length >= 2) {
        var idx1 = Math.floor(Math.random() * newMap.length);
        var idx2 = Math.floor(Math.random() * newMap.length);
        while (idx1 === idx2) idx2 = Math.floor(Math.random() * newMap.length);
        var temp = newMap[idx1];
        newMap[idx1] = newMap[idx2];
        newMap[idx2] = temp;

        // 記錄被打亂的數字
        scrambledCharsRef.current.add(newMap[idx1]);
        scrambledCharsRef.current.add(newMap[idx2]);

        // 觸發翻轉動畫
        setFlippedKeys([idx1, idx2]);
        setTimeout(function () {
          return setFlippedKeys([]);
        }, 600);
      }
      syncState({
        keyMapping: newMap
      }, false);
      return newMap;
    });
  };

  // ================================================================
  // 道具系統：主機里程碑分配 + 接收道具 + 水球霧化 + 格子清除
  // ================================================================

  // 主機處理 MILESTONE_REACHED：加權計算哪些弱者獲得道具
  handleMilestoneRef.current = function (ev) {
    if (!isHostRef.current) return;
    if (stateRef.current.brawlSettings.allowGifts === false) return;
    if (stateRef.current.brawlSettings.allowWeapons === false) return;
    var delay = (stateRef.current.brawlSettings.weaponStartTime || 0) * 1000;
    if (Date.now() - stateRef.current.startTime < delay) return;
    var triggererUid = ev.uid;
    var triggererPct = ev.completionPct;

    // 找比觸發者有效分數更低的玩家（排除觀戰、已完成、觸發者本人）
    var winnersIds = stateRef.current.brawlWinners.map(function (w) {
      return w.id;
    });
    var candidates = playersListRef.current.filter(function (p) {
      return !p.isSpectator && !winnersIds.includes(p.id) && p.id !== triggererUid;
    });

    // 權重分配：越弱勢的人權重越高 (v3.13.0 加強公平性)
    var ghostHintsData = stateRef.current.ghostHints || {};
    var totalEmp = stateRef.current.cells.filter(function (c) {
      return !c.isGiven;
    }).length || 1;
    var getEffPct = function getEffPct(uid) {
      var corr = Object.values(ghostHintsData).filter(function (hints) {
        return hints && hints[uid];
      }).length;
      var gifts = (stateRef.current.unopenedGifts[uid] || []).length;
      return Math.floor((corr + gifts) / totalEmp * 100);
    };

    // 所有人（除了已過關者）都是候選人
    var brawlCandidates = playersListRef.current.filter(function (p) {
      return !p.isSpectator && !winnersIds.includes(p.id);
    });
    if (brawlCandidates.length === 0) return;
    var candidateWeights = brawlCandidates.map(function (p) {
      var progress = getEffPct(p.id);
      // 權重 = (100 - 進度)^2 + 10 (保底權重)
      var weight = Math.pow(Math.max(1, 100 - progress), 2) + 10;
      return {
        id: p.id,
        weight: weight
      };
    });
    var totalWeight = candidateWeights.reduce(function (sum, w) {
      return sum + w.weight;
    }, 0);

    // 根據人數決定發放道具數量 (1~2 個)
    var weaponsToGive = brawlCandidates.length >= 3 ? 2 : 1;
    var _loop3 = function _loop3() {
      var random = Math.random() * totalWeight;
      var selectedId = null;
      var _iterator2 = _createForOfIteratorHelper(candidateWeights),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var cw = _step2.value;
          random -= cw.weight;
          if (random <= 0) {
            selectedId = cw.id;
            break;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      if (!selectedId) selectedId = candidateWeights[0].id;

      // 準備道具訊息
      var weaponType = Math.random() < 0.5 ? 'balloon' : 'eraser';
      var wid = Math.random().toString(36).substring(2, 10);
      var wMsg = {
        type: 'RECEIVE_WEAPON',
        targetUid: selectedId,
        weaponType: weaponType,
        id: wid,
        timestamp: Date.now()
      };

      // 廣播給所有人
      if (engineRef.current === 'peerjs') {
        var _playersListRef$curre;
        connsRef.current.forEach(function (c) {
          return c.send(wMsg);
        });
        // 自己也要接收（如果是主機自己落後）
        if (selectedId === myId && handleReceiveWeaponRef.current) {
          handleReceiveWeaponRef.current(wMsg);
        }
        // 房主上帝日誌：方便測試 (v3.10.12)
        var targetName = ((_playersListRef$curre = playersListRef.current.find(function (p) {
          return p.id === selectedId;
        })) === null || _playersListRef$curre === void 0 ? void 0 : _playersListRef$curre.name) || '玩家';
        if (isSpectator) showToast("\uD83D\uDEE1\uFE0F \u4E0A\u5E1D\u5075\u6E2C\u5230\u91CC\u7A0B\u7891\uFF1A\u767C\u9001\u6B66\u5668\u7D66 ".concat(targetName));
      }
    };
    for (var i = 0; i < weaponsToGive; i++) {
      _loop3();
    }
  };

  // 接收道具：各項道具上限 3 個
  handleReceiveWeaponRef.current = function (ev) {
    if (ev.targetUid !== myId || isSpectator) return;
    setMyWeapons(function (prev) {
      if (prev.filter(function (w) {
        return w === ev.weaponType;
      }).length >= 3) return prev; // 該項已達上限
      var weaponName = ev.weaponType === 'balloon' ? '💧 水球' : '🧹 橡皮擦';
      showToast("\uD83C\uDFAF \u7372\u5F97\u9053\u5177\uFF1A".concat(weaponName, "\uFF01\u9EDE\u64CA\u9053\u5177\u6309\u9215\u653B\u64CA\u5C0D\u624B\uFF01"));
      return [].concat(_toConsumableArray(prev), [ev.weaponType]);
    });
  };

  // 收到水球霧化攻擊：隨機霧化自己的一個宮格 10 秒
  handleWeaponHitFogRef.current = function (ev) {
    var targetObj = playersListRef.current.find(function (p) {
      return p.id === ev.targetUid;
    });
    var senderObj = playersListRef.current.find(function (p) {
      return p.id === ev.senderUid;
    });
    if (ev.targetUid !== myId) {
      // 如果我是主機或觀戰者，顯示誰攻擊了誰 (v3.13.2)
      if ((isHostRef.current || isSpectator) && senderObj && targetObj) {
        showToast("\uD83D\uDCE2 ".concat(senderObj.name, " \u5411 ").concat(targetObj.name, " \u6254\u4E86\u6C34\u7403\uFF01"));
      }
      return;
    }
    if (isSpectator) return;
    // 選一個隨機宮格（從有數字的格子中選）
    var totalBoxes = cSizeDef.size; // 9x9 有 9 個宮格 (boxId 0~8)
    var randomBoxId = Math.floor(Math.random() * totalBoxes);
    var expiry = Date.now() + 10000; // 10 秒
    setFoggedBoxes(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, randomBoxId, expiry));
    });
    showToast("\uD83D\uDCA7 \u6C34\u7403\u547D\u4E2D\uFF01\u5BAE\u683C\u88AB\u984F\u6599\u906E\u4F4F\u4E86 10 \u79D2\uFF01");
    // 10 秒後自動解除
    setTimeout(function () {
      setFoggedBoxes(function (prev) {
        var next = _objectSpread({}, prev);
        if (next[randomBoxId] === expiry) delete next[randomBoxId];
        return next;
      });
    }, 10000);
  };

  // 收到格子清除攻擊：清除自己隨機一格已填正確的格子
  handleWeaponHitEraseRef.current = function (ev) {
    var targetObj = playersListRef.current.find(function (p) {
      return p.id === ev.targetUid;
    });
    var senderObj = playersListRef.current.find(function (p) {
      return p.id === ev.senderUid;
    });
    if (ev.targetUid !== myId) {
      // 如果我是主機或觀戰者，顯示誰攻擊了誰 (v3.13.2)
      if ((isHostRef.current || isSpectator) && senderObj && targetObj) {
        showToast("\uD83D\uDCE2 ".concat(senderObj.name, " \u6B63\u5728\u6E05\u9664 ").concat(targetObj.name, " \u7684\u683C\u5B57\uFF01"));
      }
      return;
    }
    if (isSpectator) return;
    var solution = solutionGridRef.current;
    if (!solution) return;
    // 找所有已填正確、非預填、非系統揭露的格子
    var correctCells = stateRef.current.localCells.filter(function (c) {
      return !c.isGiven && !c.isSystemRevealed && c.value !== null && c.value === solution[c.y][c.x];
    });
    if (correctCells.length === 0) {
      showToast("\uD83E\uDDF9 \u6A61\u76AE\u64E6\u6C92\u6709\u6548\u679C\uFF0C\u4F60\u6C92\u6709\u53EF\u88AB\u6E05\u9664\u7684\u683C\u5B50\uFF01");
      return;
    }
    var target = correctCells[Math.floor(Math.random() * correctCells.length)];

    // 寫入 erasingCells 記錄發動特效
    setErasingCells(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, target.id, {
        value: target.value,
        timestamp: Date.now()
      }));
    });

    // 清除該格
    setLocalCells(function (prev) {
      var next = prev.map(function (c) {
        return c.id === target.id ? _objectSpread(_objectSpread({}, c), {}, {
          value: null,
          drafts: [],
          owner: null
        }) : c;
      });
      stateRef.current.localCells = next;
      return next;
    });
    // 廣播給其他人這格退步了
    var me = playersListRef.current.find(function (p) {
      return p.id === myId;
    });
    var ghostMsg = {
      type: 'GHOST_SOLVED',
      uid: myId,
      color: me ? me.color : myColorRef.current,
      cellId: target.id,
      value: null,
      id: Math.random().toString(36).substring(2, 11)
    };
    if (engineRef.current === 'peerjs') {
      if (isHostRef.current) connsRef.current.forEach(function (c) {
        return c.send(ghostMsg);
      });else if (connRef.current) connRef.current.send(ghostMsg);
    }
    showToast("\uD83E\uDDF9 \u4E00\u683C\u88AB\u6A61\u76AE\u64E6\u6E05\u9664\u4E86\uFF01\u518D\u60F3\u60F3\u770B...");
  };

  // 玩家主動使用道具：廣播攻擊
  var handleUseWeapon = function handleUseWeapon(weaponType) {
    if (stateRef.current.myWeapons.length === 0) return;
    var idx = stateRef.current.myWeapons.indexOf(weaponType);
    if (idx === -1) return;

    // 自動選擇攻擊目標（優先打比自己強的）
    var giftsData = stateRef.current.unopenedGifts || {};
    var hintsData = stateRef.current.ghostHints || {};
    var validPlayers = playersListRef.current.filter(function (p) {
      return !p.isSpectator && p.id !== myId && !stateRef.current.brawlWinners.some(function (w) {
        return w.id === p.id;
      });
    });
    if (validPlayers.length === 0) {
      showToast("😅 目前沒有可以攻擊的對手");
      return;
    }

    // 自己精確的進度（不檢查衝突，保持與進度條一致） (v3.13.4)
    var myAccurateCount = localCells.filter(function (c) {
      return !c.isGiven && c.value !== null;
    }).length;
    var myScore = Math.max(Object.values(hintsData).filter(function (h) {
      return h && h[myId];
    }).length, myAccurateCount) + (giftsData[myId] ? giftsData[myId].length : 0);
    var strongerPlayers = validPlayers.filter(function (p) {
      var pScore = Object.values(hintsData).filter(function (h) {
        return h && h[p.id];
      }).length + (giftsData[p.id] ? giftsData[p.id].length : 0);
      return pScore > myScore;
    });
    var targetUid;
    if (strongerPlayers.length === 0) {
      targetUid = validPlayers[Math.floor(Math.random() * validPlayers.length)].id;
    } else {
      // 權重計算：差距愈大，權重愈高 (差距的 2 次方 + 5 基礎分)
      var weights = strongerPlayers.map(function (p) {
        var pScore = Object.values(hintsData).filter(function (h) {
          return h && h[p.id];
        }).length + (giftsData[p.id] ? giftsData[p.id].length : 0);
        return Math.pow(Math.max(1, pScore - myScore), 2) + 5;
      });
      var totalWeight = weights.reduce(function (a, b) {
        return a + b;
      }, 0);
      var rand = Math.random() * totalWeight;
      targetUid = strongerPlayers[strongerPlayers.length - 1].id;
      for (var i = 0; i < strongerPlayers.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
          targetUid = strongerPlayers[i].id;
          break;
        }
      }
    }

    // 移除已使用的道具 (修正連續點擊問題：在更新回調中找 index)
    setMyWeapons(function (prev) {
      var next = _toConsumableArray(prev);
      var realIdx = next.indexOf(weaponType);
      if (realIdx !== -1) {
        next.splice(realIdx, 1);
        stateRef.current.myWeapons = next;
      }
      return next;
    });
    var hitType = weaponType === 'balloon' ? 'WEAPON_HIT_FOG' : 'WEAPON_HIT_ERASE';
    var wMsg = {
      type: hitType,
      targetUid: targetUid,
      senderUid: myId,
      id: Math.random().toString(36).substring(2, 10),
      timestamp: Date.now()
    };
    var sObj = playersListRef.current.find(function (p) {
      return p.id === myId;
    });
    var senderName = sObj ? sObj.name : '某人';
    if (engineRef.current === 'peerjs') {
      if (isHostRef.current) connsRef.current.forEach(function (c) {
        return c.send(wMsg);
      });else if (connRef.current) connRef.current.send(wMsg);
      // 如果攻擊目標是主機自己
      if (targetUid === myId) {
        if (weaponType === 'balloon' && handleWeaponHitFogRef.current) handleWeaponHitFogRef.current(wMsg);else if (weaponType === 'eraser' && handleWeaponHitEraseRef.current) handleWeaponHitEraseRef.current(wMsg);
      }
    }
    var tObj = playersListRef.current.find(function (p) {
      return p.id === targetUid;
    });
    var targetName = tObj ? tObj.name : '對手';
    var emoji = weaponType === 'balloon' ? '💧' : '🧹';
    showToast("".concat(emoji, " \u5411 ").concat(targetName, " \u767C\u5C04\u4E86\u653B\u64CA\uFF01"));
  };
  var handleOpenGift = function handleOpenGift() {
    if (interactionMode >= 2 || matchPhase !== 'playing' || isSpectator) return;
    var myQueue = stateRef.current.unopenedGifts[myId] || [];
    if (myQueue.length === 0) return;
    var emptyCells = stateRef.current.localCells.filter(function (c) {
      return !c.isGiven && !c.isSystemRevealed && c.value === null;
    });
    var incorrectCells = stateRef.current.localCells.filter(function (c) {
      return !c.isGiven && !c.isSystemRevealed && c.value !== null && solutionGridRef.current && c.value !== solutionGridRef.current[c.y][c.x];
    });
    var giftsToOpenCount = Math.min(myQueue.length, emptyCells.length + incorrectCells.length);
    if (giftsToOpenCount === 0) {
      showToast("⚠️ 盤面已無可解鎖或錯誤的空格");
      return;
    }
    var giftsToOpen = myQueue.slice(0, giftsToOpenCount);
    var cellsToReveal = [];
    if (giftsToOpenCount <= emptyCells.length) {
      cellsToReveal = _toConsumableArray(emptyCells).sort(function () {
        return 0.5 - Math.random();
      }).slice(0, giftsToOpenCount);
    } else {
      var _cellsToReveal;
      cellsToReveal = _toConsumableArray(emptyCells);
      var remaining = giftsToOpenCount - emptyCells.length;
      var shuffledIncorrect = _toConsumableArray(incorrectCells).sort(function () {
        return 0.5 - Math.random();
      });
      (_cellsToReveal = cellsToReveal).push.apply(_cellsToReveal, _toConsumableArray(shuffledIncorrect.slice(0, remaining)));
    }
    var buttonEl = document.getElementById("btn-open-gift");
    var buttonRect = buttonEl ? buttonEl.getBoundingClientRect() : null;
    var counterAttackCount = 0;
    var newFlares = [];
    giftsToOpen.forEach(function (senderUid, index) {
      var targetCell = cellsToReveal[index];
      revealSystemCellRef.current(targetCell.id);
      if (senderUid !== 'system') {
        setTimeout(function () {
          triggerCounterAttack(senderUid);
        }, index * 150);
        counterAttackCount++;
      }
      if (buttonRect) {
        var cellEl = document.getElementById("cell-".concat(targetCell.id));
        if (cellEl) {
          var cellRect = cellEl.getBoundingClientRect();
          newFlares.push({
            id: Date.now() + '-' + index,
            startX: buttonRect.left + buttonRect.width / 2,
            startY: buttonRect.top + buttonRect.height / 2,
            endX: cellRect.left + cellRect.width / 2,
            endY: cellRect.top + cellRect.height / 2
          });
        }
      }
    });
    if (newFlares.length > 0) {
      setFlares(function (prev) {
        return [].concat(_toConsumableArray(prev), newFlares);
      });
      setTimeout(function () {
        setFlares(function (prev) {
          return prev.filter(function (f) {
            return !newFlares.find(function (nf) {
              return nf.id === f.id;
            });
          });
        });
      }, 600);
    }
    if (counterAttackCount > 0) {
      showToast("\u2694\uFE0F \u9023\u7E8C\u62C6\u958B ".concat(giftsToOpenCount, " \u500B\u79AE\u7269\uFF01\u5C0D\u6575\u4EBA\u767C\u52D5\u4E86 ").concat(counterAttackCount, " \u6B21\u5E72\u64FE\u53CD\u64CA\uFF01"));
    } else {
      showToast("\uD83C\uDF81 \u9023\u7E8C\u62C6\u958B ".concat(giftsToOpenCount, " \u500B\u7CFB\u7D71\u79AE\u7269\uFF01\u7372\u5F97 ").concat(giftsToOpenCount, " \u683C\u63D0\u793A\uFF01"));
    }
    var _loop4 = function _loop4() {
      var msg = {
        type: 'GIFT_OPENED',
        uid: myId,
        id: Math.random().toString(36).substring(2, 10),
        timestamp: Date.now()
      };
      if (engineRef.current === 'peerjs') {
        if (isHostRef.current) connsRef.current.forEach(function (c) {
          return c.send(msg);
        });else if (connRef.current) connRef.current.send(msg);
      }
    };
    for (var i = 0; i < giftsToOpenCount; i++) {
      _loop4();
    }
    setUnopenedGifts(function (prev) {
      var q = prev[myId] || [];
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, myId, q.slice(giftsToOpenCount)));
    });
  };
  var syncState = function syncState(partial) {
    var shouldBroadcast = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    if (partial.cells !== undefined) setCells(partial.cells);
    if (partial.localCells !== undefined) setLocalCells(partial.localCells);
    if (partial.levelData !== undefined) setLevelData(partial.levelData);
    if (partial.startTime !== undefined) {
      setStartTime(partial.startTime);
      setMatchStartTime(partial.startTime);
    }
    if (partial.matchPhase !== undefined) setMatchPhase(partial.matchPhase);
    if (partial.matchEndTime !== undefined) stateRef.current.matchEndTime = partial.matchEndTime;
    if (partial.countdownTarget !== undefined) setCountdownTarget(partial.countdownTarget);
    if (partial.isGenerating !== undefined) {
      setIsGenerating(partial.isGenerating);
      if (partial.isGenerating) {
        setIsWon(false);
        setWinner(null);
        setEndTime(null);
        isWinnerDeclaredRef.current = false;
        setUnopenedGifts({});
        completedRegionsRef.current.clear();
        scrambledCharsRef.current.clear();
        setBrawlWinners([]);
        // 恢復大廳設定的觀戰狀態
        var me = playersListRef.current.find(function (p) {
          return p.id === myId;
        });
        setIsSpectator(me ? !!me.isLobbySpectator : false);
      }
    }
    if (partial.isBrawlMode !== undefined) setIsBrawlMode(partial.isBrawlMode);
    if (partial.brawlWinners !== undefined) setBrawlWinners(partial.brawlWinners);
    if (partial.brawlSettings !== undefined) setBrawlSettings(partial.brawlSettings);
    if (partial.winner !== undefined) setWinner(partial.winner);
    if (partial.keyMapping !== undefined) setKeyMapping(partial.keyMapping);
    if (partial.solutionGrid !== undefined) {
      var parsedGrid = typeof partial.solutionGrid === 'string' ? JSON.parse(partial.solutionGrid) : partial.solutionGrid;
      solutionGridRef.current = parsedGrid;
      partial.solutionGrid = parsedGrid;
    }

    // 題目一致性修復：收到新題目時同步初始化個人棋盤 (v3.8.33)
    if (partial.levelData && (partial.isBrawlMode || stateRef.current.isBrawlMode)) {
      setLocalCells(JSON.parse(JSON.stringify(partial.cells || partial.levelData.cells)));
    }
    if (partial.sizeId !== undefined) {
      setSizeId(partial.sizeId);
      setKeyMapping(SIZES.find(function (s) {
        return s.id === partial.sizeId;
      }).chars);
    }
    if (partial.diffId !== undefined) setDiffId(partial.diffId);
    if (partial.strokes !== undefined) setStrokes(partial.strokes);
    if (partial.selectedChar !== undefined) setSelectedChar(partial.selectedChar);
    if (partial.isAutoFilling !== undefined) isAutoFillingRef.current = partial.isAutoFilling;
    var updatedState = _objectSpread(_objectSpread({}, stateRef.current), partial);
    stateRef.current = updatedState;
    if (shouldBroadcast && engineRef.current === 'peerjs') {
      var broadcastData = {};
      if (partial.levelData !== undefined) broadcastData.levelData = partial.levelData;
      if (partial.startTime !== undefined) broadcastData.startTime = partial.startTime;
      if (partial.isGenerating !== undefined) broadcastData.isGenerating = partial.isGenerating;
      if (partial.isBrawlMode !== undefined) broadcastData.isBrawlMode = partial.isBrawlMode;
      if (partial.brawlWinners !== undefined) broadcastData.brawlWinners = partial.brawlWinners;
      if (partial.brawlSettings !== undefined) broadcastData.brawlSettings = partial.brawlSettings;
      if (partial.winner !== undefined) broadcastData.winner = partial.winner;
      if (partial.solutionGrid !== undefined) broadcastData.solutionGrid = partial.solutionGrid ? JSON.stringify(partial.solutionGrid) : null;
      if (partial.sizeId !== undefined) broadcastData.sizeId = partial.sizeId;
      if (partial.diffId !== undefined) broadcastData.diffId = partial.diffId;
      if (partial.strokes !== undefined) broadcastData.strokes = partial.strokes;
      if (partial.matchPhase !== undefined) broadcastData.matchPhase = partial.matchPhase;
      if (partial.countdownTarget !== undefined) broadcastData.countdownTarget = partial.countdownTarget;
      if (partial.giftEvents !== undefined) broadcastData.giftEvents = partial.giftEvents;
      if (partial.keyMapping !== undefined) broadcastData.keyMapping = partial.keyMapping;
      if (!updatedState.isBrawlMode) {
        broadcastData.cells = updatedState.cells;
      } else if (partial.levelData !== undefined) {
        // 在競速/亂鬥模式中，只有在產生新題目時，才廣播初始的 cells
        broadcastData.cells = updatedState.cells;
      }
      // 注意：永遠不廣播 localCells 與 selectedChar 給其他玩家 (v3.8.32)

      if (isHostRef.current) connsRef.current.forEach(function (c) {
        return c.send({
          type: 'SYNC',
          data: broadcastData
        });
      });else if (connRef.current) connRef.current.send({
        type: 'SYNC',
        data: broadcastData
      });
    }

    // 本地進度持久化 (v3.8.21: 存入完整對局 DNA)
    if (roomId && !isSpectator) {
      saveLocalProgress(roomId, myId, myNameRef.current, isHostRef.current, isBrawlMode ? updatedState.localCells : updatedState.cells, updatedState.sessionId, {
        solution: solutionGridRef.current,
        players: playersListRef.current,
        sizeId: updatedState.sizeId,
        diffId: updatedState.diffId,
        isBrawl: updatedState.isBrawlMode,
        isGhost: updatedState.isBrawlMode
      });
    }
  };
  var initiateHostGame = function initiateHostGame() {
    if (!tempPlayerName.trim()) return showToast("⚠️ 請輸入暱稱");
    myNameRef.current = tempPlayerName;
    setEngine('peerjs');
    engineRef.current = 'peerjs';
    syncState({
      levelData: emptyLevelData,
      cells: [],
      localCells: [],
      matchPhase: 'waiting',
      matchEndTime: null,
      isBrawlMode: false
    }, false);
    var rID = Math.floor(1000 + Math.random() * 9000).toString();
    setIsConnecting(true);
    setupPeerJS(rID, tempPlayerName, true);
  };
  var joinExistingGame = function joinExistingGame() {
    if (!tempPlayerName.trim()) return showToast("⚠️ 請輸入暱稱");
    if (tempRoomId.length < 4) return showToast("⚠️ 請輸入正確的 4 碼邀請碼");
    myNameRef.current = tempPlayerName;
    setEngine('peerjs');
    engineRef.current = 'peerjs';
    setIsConnecting(true);
    setupPeerJS(tempRoomId, tempPlayerName, false);
  };
  var handleReady = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var nList, me;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (engineRef.current === 'peerjs') {
              if (isHostRef.current) {
                nList = playersListRef.current.map(function (p) {
                  return p.id === myId ? _objectSpread(_objectSpread({}, p), {}, {
                    isReady: !p.isReady
                  }) : p;
                });
                setPlayersList(nList);
                connsRef.current.forEach(function (c) {
                  if (c.open) c.send({
                    type: 'PLAYERS_UPDATE',
                    players: nList
                  });
                });
              } else if (connRef.current && connRef.current.open) {
                me = playersListRef.current.find(function (p) {
                  return p.id === myId;
                });
                if (me) connRef.current.send({
                  type: me.isReady ? 'REQ_UNREADY' : 'REQ_READY',
                  targetId: myId
                });
              }
            } else {
              setPlayersList(function (prev) {
                return prev.map(function (p) {
                  return p.id === myId ? _objectSpread(_objectSpread({}, p), {}, {
                    isReady: !p.isReady
                  }) : p;
                });
              });
            }
          case 1:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function handleReady() {
      return _ref4.apply(this, arguments);
    };
  }();
  var toggleSpectator = function toggleSpectator(targetId) {
    var isTemp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var forceState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (isHostRef.current) {
      var nList = playersListRef.current.map(function (p) {
        if (p.id === targetId) {
          var newState = forceState !== null ? forceState : !p.isSpectator;
          return _objectSpread(_objectSpread({}, p), {}, {
            isSpectator: newState,
            isLobbySpectator: isTemp ? p.isLobbySpectator : newState
          });
        }
        return p;
      });
      setPlayersList(nList);
      connsRef.current.forEach(function (c) {
        if (c.open) c.send({
          type: 'PLAYERS_UPDATE',
          players: nList
        });
      });
      if (targetId === myId) {
        var me = nList.find(function (p) {
          return p.id === myId;
        });
        if (me) setIsSpectator(me.isSpectator);
      }
    } else if (connRef.current && connRef.current.open && targetId === myId) {
      connRef.current.send({
        type: 'REQ_SPEC_TOGGLE',
        targetId: myId,
        isTemp: isTemp,
        forceState: forceState
      });
    }
  };

  // 強制開始邏輯 (v3.8.30)
  var handleForceStart = function handleForceStart() {
    if (!isHostRef.current) return;
    var target = Date.now() + 5000;
    syncState({
      matchPhase: 'countdown',
      countdownTarget: target
    }, true);
    showToast("⚡ 房主已強制啟動對局！");
  };
  var handlePlayAgain = function handlePlayAgain() {
    if (isMultiplayer && !isHostRef.current && engineRef.current === 'peerjs') {
      if (connRef.current) connRef.current.send({
        type: 'REQ_PLAY_DIRECT'
      });
      showToast("已向主機發送強制開局請求...");
      return;
    }
    if (isHostRef.current && isMultiplayer) {
      // 房主直接本地生成新一盤並略過大廳
      generateAndSync(sizeId, diffId, undefined, true);
      return;
    }
    setIsWon(false);
    setIsClosingModal(true);
    setTimeout(function () {
      setIsClosingModal(false);
      if (handleRegenerateRandomRef.current) handleRegenerateRandomRef.current();
    }, 300);
  };
  var handleBackToLobby = function handleBackToLobby() {
    if (isMultiplayer && !isHostRef.current && engineRef.current === 'peerjs') {
      if (connRef.current) connRef.current.send({
        type: 'REQ_PLAY_AGAIN'
      });
      showToast("已向主機發送返回大廳請求...");
      return;
    }
    if (isHostRef.current && isMultiplayer) {
      generateAndSync(sizeId, diffId, undefined, false);
      return;
    }
  };
  var closeVictoryModal = function closeVictoryModal() {
    return setHideVictoryModal(true);
  };
  var showToast = function showToast(m) {
    setToastMsg(m);
    setTimeout(function () {
      return setToastMsg("");
    }, 4000);
  };
  var getSvgCoords = function getSvgCoords(clientX, clientY) {
    var svg = svgRef.current;
    if (!svg) return null;
    var pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    var ctm = svg.getScreenCTM();
    return ctm ? pt.matrixTransform(ctm.inverse()) : null;
  };
  var eraseAtPoint = function eraseAtPoint(cx, cy) {
    var offsets = [[0, 0], [15, 0], [-15, 0], [0, 15], [0, -15], [10, 10], [-10, -10], [10, -10], [-10, 10]];
    var hitIds = new Set();
    for (var _i2 = 0, _offsets = offsets; _i2 < _offsets.length; _i2++) {
      var off = _offsets[_i2];
      var els = document.elementsFromPoint(cx + off[0], cy + off[1]);
      var _iterator3 = _createForOfIteratorHelper(els),
        _step3;
      try {
        var _loop5 = function _loop5() {
          var el = _step3.value;
          if (el.classList.contains('doodle-stroke')) {
            var sid = el.getAttribute('data-stroke-id');
            var strokeObj = stateRef.current.strokes.find(function (s) {
              return s.id === sid;
            });
            if ((strokeObj && strokeObj.uid || (strokeObj ? strokeObj.id.split('-')[1] : null)) === myId) hitIds.add(sid);
          }
        };
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          _loop5();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
    if (hitIds.size > 0) {
      var newStrokes = stateRef.current.strokes.filter(function (s) {
        return !hitIds.has(s.id);
      });
      if (newStrokes.length !== stateRef.current.strokes.length) syncState({
        strokes: newStrokes
      });
    }
  };
  var clearCell = function clearCell(cellId) {
    if (isWon || interactionMode >= 2 || winner || matchPhase !== 'playing' || isSpectator) return;
    var cur = stateRef.current.isBrawlMode ? stateRef.current.localCells : stateRef.current.cells;
    var targetIdx = cur.findIndex(function (c) {
      return c.id === cellId;
    });
    if (targetIdx === -1) return;
    var target = cur[targetIdx];

    // 只有玩家自己填上的數字能被長按清除，題目或收禮系統填的不能清
    if (target.isGiven || target.isSystemRevealed || target.value === null) return;
    if (engineRef.current === 'none') setHistory(function (past) {
      return [].concat(_toConsumableArray(past.slice(past.length > 25 ? 1 : 0)), [cur]);
    });
    var nextCells = _toConsumableArray(cur);
    nextCells[targetIdx] = _objectSpread(_objectSpread({}, target), {}, {
      value: null,
      owner: null
    });
    if (stateRef.current.isBrawlMode) {
      syncState({
        localCells: nextCells
      }, false);
    } else {
      syncState({
        cells: nextCells
      });
    }
    showToast("🧽 已清除該格內容");
  };
  var handlePointerDown = function handlePointerDown(e) {
    if (matchPhase !== 'playing' || isSpectator) return;
    var pt = getSvgCoords(e.clientX, e.clientY);
    if (!pt) return;
    if (interactionMode === 2) {
      e.target.setPointerCapture(e.pointerId);
      if (drawSubMode === 'pen') {
        isDrawingRef.current = true;
        currentPathDataRef.current = "M ".concat(pt.x, " ").concat(pt.y);
        if (drawingPathRef.current) {
          drawingPathRef.current.setAttribute('d', currentPathDataRef.current);
          drawingPathRef.current.style.display = 'block';
        }
      } else if (drawSubMode === 'eraser') eraseAtPoint(e.clientX, e.clientY);
    } else {
      setRipples(function (prev) {
        return [].concat(_toConsumableArray(prev), [{
          id: Date.now() + Math.random(),
          uid: myId,
          x: pt.x,
          y: pt.y,
          timestamp: Date.now()
        }]);
      });

      // 設定長按清除偵測
      var cx = Math.floor((pt.x - PADDING) / CELL_SIZE);
      var cy = Math.floor((pt.y - PADDING) / CELL_SIZE);
      if (cx >= 0 && cx < cSizeDef.size && cy >= 0 && cy < cSizeDef.size) {
        var cellId = "".concat(cx, "-").concat(cy);
        isLongPressTriggered.current = false;
        touchStartPt.current = pt;
        cellLongPressTimer.current = setTimeout(function () {
          clearCell(cellId);
          isLongPressTriggered.current = true;
          if (navigator.vibrate) navigator.vibrate(50);
          cellLongPressTimer.current = null;
        }, 500); // 500毫秒視為長按
      }
    }
    if (engineRef.current !== 'peerjs' || !showOtherCursors) return;
    var msg = {
      type: 'CLICK',
      uid: myId,
      x: pt.x,
      y: pt.y
    };
    if (isHostRef.current) connsRef.current.forEach(function (c) {
      return c.send(msg);
    });else if (connRef.current) connRef.current.send(msg);
  };
  var handlePointerMove = function handlePointerMove(e) {
    if (matchPhase !== 'playing' || isSpectator) return;
    var pt = getSvgCoords(e.clientX, e.clientY);
    if (interactionMode === 2) {
      if (drawSubMode === 'eraser') {
        if (pt && eraserRef.current) {
          eraserRef.current.setAttribute('cx', pt.x);
          eraserRef.current.setAttribute('cy', pt.y);
          if (eraserRef.current.style.display === 'none') eraserRef.current.style.display = 'block';
        }
        if ((e.buttons > 0 || e.pointerType === 'touch') && Date.now() - lastEraseTimeRef.current > 50) {
          eraseAtPoint(e.clientX, e.clientY);
          lastEraseTimeRef.current = Date.now();
        }
      } else if (drawSubMode === 'pen' && isDrawingRef.current && pt && currentPathDataRef.current) {
        currentPathDataRef.current += " L ".concat(pt.x, " ").concat(pt.y);
        if (drawingPathRef.current) {
          drawingPathRef.current.setAttribute('d', currentPathDataRef.current);
        }
      }
    } else {
      // 防手震：如果移動超過10px就取消長按判定
      if (cellLongPressTimer.current && touchStartPt.current && pt) {
        var dist = Math.hypot(pt.x - touchStartPt.current.x, pt.y - touchStartPt.current.y);
        if (dist > 10) {
          clearTimeout(cellLongPressTimer.current);
          cellLongPressTimer.current = null;
        }
      }
    }
    if (!showOtherCursors) return;
    if (Date.now() - lastCursorSend.current < 50) return;
    lastCursorSend.current = Date.now();
    if (pt) {
      var msg = {
        type: 'CURSOR',
        uid: myId,
        x: pt.x,
        y: pt.y
      };
      if (engineRef.current === 'peerjs') {
        if (isHostRef.current) connsRef.current.forEach(function (c) {
          return c.send(msg);
        });else if (connRef.current) connRef.current.send(msg);
      }
    }
  };
  var handlePointerUp = function handlePointerUp(e) {
    if (matchPhase !== 'playing' || isSpectator) return;
    if (cellLongPressTimer.current) {
      clearTimeout(cellLongPressTimer.current);
      cellLongPressTimer.current = null;
    }
    if (interactionMode === 2) {
      if (drawSubMode === 'pen' && isDrawingRef.current) {
        isDrawingRef.current = false;
        if (currentPathDataRef.current) {
          var newStroke = {
            id: Date.now() + '-' + myId,
            uid: myId,
            path: currentPathDataRef.current
          };
          syncState({
            strokes: [].concat(_toConsumableArray(stateRef.current.strokes), [newStroke])
          }, !isBrawlMode);
          currentPathDataRef.current = "";
          if (drawingPathRef.current) drawingPathRef.current.style.display = 'none';
        }
      }
      if (e.type === 'pointerleave' || e.type === 'pointercancel' || e.pointerType === 'touch') if (eraserRef.current) eraserRef.current.style.display = 'none';
    }
  };
  var clearOwnStrokes = function clearOwnStrokes() {
    var filtered = stateRef.current.strokes.filter(function (s) {
      return !s.id.endsWith('-' + myId);
    });
    syncState({
      strokes: filtered
    }, !isBrawlMode);
    showToast("🗑️ 已清除你所有的塗鴉");
  };
  var clearAllStrokes = function clearAllStrokes() {
    if (isHostRef.current) {
      syncState({
        strokes: []
      }, !isBrawlMode);
      if (!isBrawlMode) showToast("🚨 房主已清空全場塗鴉");else showToast("🗑️ 已清空塗鴉");
    }
  };
  var clearAllPlayers = function clearAllPlayers() {
    setPlayersList(function (prev) {
      var hostPlayer = prev.find(function (p) {
        return p.id === myId;
      });
      if (!hostPlayer) return prev;
      var newList = [hostPlayer];
      if (engineRef.current === 'peerjs') {
        connsRef.current = connsRef.current.filter(function (c) {
          return c.open;
        });
        connsRef.current.forEach(function (c) {
          c.send({
            type: 'PLAYERS_UPDATE',
            players: newList
          });
          c.send({
            type: 'REQ_REJOIN'
          });
        });
      }
      return newList;
    });
  };
  var autoFillHiddenSingles = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(_char3) {
      var changed, stateChanged, currentCells, isValid, fill, _loop6, y, _loop7, x, _loop8, b;
      return _regeneratorRuntime().wrap(function _callee3$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            if (stateRef.current.brawlSettings.allowQuickFill) {
              _context6.next = 3;
              break;
            }
            showToast("⚠️ 已關閉快速填答功能");
            return _context6.abrupt("return");
          case 3:
            if (!isAutoFillingRef.current) {
              _context6.next = 5;
              break;
            }
            return _context6.abrupt("return");
          case 5:
            isAutoFillingRef.current = true;
            syncState({
              isAutoFilling: true,
              selectedChar: _char3
            }, !isBrawlMode);
            changed = false;
            stateChanged = false;
            currentCells = _toConsumableArray(isBrawlMode ? stateRef.current.localCells : stateRef.current.cells);
            isValid = function isValid(cell, gridCells) {
              if (cell.value !== null) return false;
              var _iterator4 = _createForOfIteratorHelper(gridCells),
                _step4;
              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var other = _step4.value;
                  if (other.value === _char3) {
                    if (other.x === cell.x || other.y === cell.y || other.boxId === cell.boxId) return false;
                  }
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
              return true;
            };
            fill = /*#__PURE__*/function () {
              var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(cellId) {
                var idx, targetCell, i, c, me, msg;
                return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                  while (1) switch (_context2.prev = _context2.next) {
                    case 0:
                      idx = currentCells.findIndex(function (c) {
                        return c.id === cellId;
                      });
                      if (!(idx !== -1)) {
                        _context2.next = 11;
                        break;
                      }
                      currentCells = _toConsumableArray(currentCells);
                      targetCell = currentCells[idx];
                      currentCells[idx] = _objectSpread(_objectSpread({}, targetCell), {}, {
                        value: _char3,
                        drafts: [],
                        owner: myId
                      });
                      changed = true;
                      stateChanged = true;
                      for (i = 0; i < currentCells.length; i++) {
                        if (i !== idx) {
                          c = currentCells[i];
                          if (c.x === targetCell.x || c.y === targetCell.y || c.boxId === targetCell.boxId) {
                            if (c.drafts.includes(_char3)) currentCells[i] = _objectSpread(_objectSpread({}, c), {}, {
                              drafts: c.drafts.filter(function (d) {
                                return d !== _char3;
                              })
                            });
                          }
                        }
                      }
                      if (isBrawlMode) {
                        syncState({
                          localCells: currentCells
                        }, false);
                        if (isMultiplayer) {
                          me = playersListRef.current.find(function (p) {
                            return p.id === myId;
                          });
                          msg = {
                            type: 'GHOST_SOLVED',
                            uid: myId,
                            color: me ? me.color : myColorRef.current,
                            cellId: cellId,
                            id: Math.random().toString(36).substring(2, 11),
                            value: _char3
                          };
                          if (engineRef.current === 'peerjs') {
                            if (isHostRef.current) connsRef.current.forEach(function (c) {
                              return c.send(msg);
                            });else if (connRef.current) connRef.current.send(msg);
                          }
                        }
                      } else {
                        syncState({
                          cells: currentCells
                        });
                      }
                      _context2.next = 11;
                      return new Promise(function (r) {
                        return setTimeout(r, 100);
                      });
                    case 11:
                    case "end":
                      return _context2.stop();
                  }
                }, _callee2);
              }));
              return function fill(_x2) {
                return _ref6.apply(this, arguments);
              };
            }();
          case 12:
            changed = false;
            _loop6 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop6(y) {
              var rowCells, validEmpties;
              return _regeneratorRuntime().wrap(function _loop6$(_context3) {
                while (1) switch (_context3.prev = _context3.next) {
                  case 0:
                    rowCells = currentCells.filter(function (c) {
                      return c.y === y;
                    });
                    if (!rowCells.some(function (c) {
                      return c.value === _char3;
                    })) {
                      _context3.next = 3;
                      break;
                    }
                    return _context3.abrupt("return", 1);
                  case 3:
                    validEmpties = rowCells.filter(function (c) {
                      return isValid(c, currentCells);
                    });
                    if (!(validEmpties.length === 1)) {
                      _context3.next = 7;
                      break;
                    }
                    _context3.next = 7;
                    return fill(validEmpties[0].id);
                  case 7:
                  case "end":
                    return _context3.stop();
                }
              }, _loop6);
            });
            y = 0;
          case 15:
            if (!(y < cSizeDef.size)) {
              _context6.next = 22;
              break;
            }
            return _context6.delegateYield(_loop6(y), "t0", 17);
          case 17:
            if (!_context6.t0) {
              _context6.next = 19;
              break;
            }
            return _context6.abrupt("continue", 19);
          case 19:
            y++;
            _context6.next = 15;
            break;
          case 22:
            if (!changed) {
              _context6.next = 24;
              break;
            }
            return _context6.abrupt("continue", 44);
          case 24:
            _loop7 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop7(x) {
              var colCells, validEmpties;
              return _regeneratorRuntime().wrap(function _loop7$(_context4) {
                while (1) switch (_context4.prev = _context4.next) {
                  case 0:
                    colCells = currentCells.filter(function (c) {
                      return c.x === x;
                    });
                    if (!colCells.some(function (c) {
                      return c.value === _char3;
                    })) {
                      _context4.next = 3;
                      break;
                    }
                    return _context4.abrupt("return", 1);
                  case 3:
                    validEmpties = colCells.filter(function (c) {
                      return isValid(c, currentCells);
                    });
                    if (!(validEmpties.length === 1)) {
                      _context4.next = 7;
                      break;
                    }
                    _context4.next = 7;
                    return fill(validEmpties[0].id);
                  case 7:
                  case "end":
                    return _context4.stop();
                }
              }, _loop7);
            });
            x = 0;
          case 26:
            if (!(x < cSizeDef.size)) {
              _context6.next = 33;
              break;
            }
            return _context6.delegateYield(_loop7(x), "t1", 28);
          case 28:
            if (!_context6.t1) {
              _context6.next = 30;
              break;
            }
            return _context6.abrupt("continue", 30);
          case 30:
            x++;
            _context6.next = 26;
            break;
          case 33:
            if (!changed) {
              _context6.next = 35;
              break;
            }
            return _context6.abrupt("continue", 44);
          case 35:
            _loop8 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop8(b) {
              var boxCells, validEmpties;
              return _regeneratorRuntime().wrap(function _loop8$(_context5) {
                while (1) switch (_context5.prev = _context5.next) {
                  case 0:
                    boxCells = currentCells.filter(function (c) {
                      return c.boxId === b;
                    });
                    if (!boxCells.some(function (c) {
                      return c.value === _char3;
                    })) {
                      _context5.next = 3;
                      break;
                    }
                    return _context5.abrupt("return", 1);
                  case 3:
                    validEmpties = boxCells.filter(function (c) {
                      return isValid(c, currentCells);
                    });
                    if (!(validEmpties.length === 1)) {
                      _context5.next = 7;
                      break;
                    }
                    _context5.next = 7;
                    return fill(validEmpties[0].id);
                  case 7:
                  case "end":
                    return _context5.stop();
                }
              }, _loop8);
            });
            b = 0;
          case 37:
            if (!(b < cSizeDef.size)) {
              _context6.next = 44;
              break;
            }
            return _context6.delegateYield(_loop8(b), "t2", 39);
          case 39:
            if (!_context6.t2) {
              _context6.next = 41;
              break;
            }
            return _context6.abrupt("continue", 41);
          case 41:
            b++;
            _context6.next = 37;
            break;
          case 44:
            if (changed) {
              _context6.next = 12;
              break;
            }
          case 45:
            if (stateChanged) {
              if (engineRef.current === 'none') setHistory(function (past) {
                return [].concat(_toConsumableArray(past.slice(past.length > 25 ? 1 : 0)), [currentCells]);
              });
              if (currentCells.every(function (c) {
                return c.value !== null;
              })) syncState({
                selectedChar: null
              }, !isBrawlMode);else showToast("\u2705 \u81EA\u52D5\u586B\u5165 ".concat(_char3, " \u6210\u529F\uFF01"));
            } else {
              showToast("\uD83D\uDCA1 \u76EE\u524D\u627E\u4E0D\u5230\u5FC5\u5B9A\u70BA ".concat(_char3, " \u7684\u7A7A\u683C\u4E86"));
            }
            isAutoFillingRef.current = false;
            syncState({
              isAutoFilling: false,
              selectedChar: null
            }, !isBrawlMode);
          case 48:
          case "end":
            return _context6.stop();
        }
      }, _callee3);
    }));
    return function autoFillHiddenSingles(_x) {
      return _ref5.apply(this, arguments);
    };
  }();
  var autoFillDrafts = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(_char4) {
      var stateChanged, currentCells, isValid, _loop9, y;
      return _regeneratorRuntime().wrap(function _callee4$(_context9) {
        while (1) switch (_context9.prev = _context9.next) {
          case 0:
            if (stateRef.current.brawlSettings.allowQuickFill) {
              _context9.next = 3;
              break;
            }
            showToast("⚠️ 已關閉快速填答功能");
            return _context9.abrupt("return");
          case 3:
            if (!isAutoFillingRef.current) {
              _context9.next = 5;
              break;
            }
            return _context9.abrupt("return");
          case 5:
            isAutoFillingRef.current = true;
            syncState({
              isAutoFilling: true,
              selectedChar: _char4
            }, !isBrawlMode);
            stateChanged = false;
            currentCells = _toConsumableArray(isBrawlMode ? stateRef.current.localCells : stateRef.current.cells);
            isValid = function isValid(cell) {
              if (cell.value !== null) return false;
              var _iterator5 = _createForOfIteratorHelper(currentCells),
                _step5;
              try {
                for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                  var other = _step5.value;
                  if (other.value === _char4) {
                    if (other.x === cell.x || other.y === cell.y || other.boxId === cell.boxId) return false;
                  }
                }
              } catch (err) {
                _iterator5.e(err);
              } finally {
                _iterator5.f();
              }
              return true;
            };
            _loop9 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop9(y) {
              var rowChanged, newRowCells, _loop10, x;
              return _regeneratorRuntime().wrap(function _loop9$(_context8) {
                while (1) switch (_context8.prev = _context8.next) {
                  case 0:
                    rowChanged = false;
                    newRowCells = _toConsumableArray(currentCells);
                    _loop10 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop10(x) {
                      var cellIdx, cell;
                      return _regeneratorRuntime().wrap(function _loop10$(_context7) {
                        while (1) switch (_context7.prev = _context7.next) {
                          case 0:
                            cellIdx = newRowCells.findIndex(function (c) {
                              return c.x === x && c.y === y;
                            });
                            cell = newRowCells[cellIdx];
                            if (cell.value === null && isValid(cell)) {
                              if (!cell.drafts.includes(_char4)) {
                                newRowCells[cellIdx] = _objectSpread(_objectSpread({}, cell), {}, {
                                  drafts: [].concat(_toConsumableArray(cell.drafts), [_char4])
                                });
                                stateChanged = true;
                                rowChanged = true;
                              }
                            }
                          case 3:
                          case "end":
                            return _context7.stop();
                        }
                      }, _loop10);
                    });
                    x = 0;
                  case 4:
                    if (!(x < cSizeDef.size)) {
                      _context8.next = 9;
                      break;
                    }
                    return _context8.delegateYield(_loop10(x), "t0", 6);
                  case 6:
                    x++;
                    _context8.next = 4;
                    break;
                  case 9:
                    if (!rowChanged) {
                      _context8.next = 14;
                      break;
                    }
                    currentCells = newRowCells;
                    if (isBrawlMode) syncState({
                      localCells: currentCells
                    }, false);else syncState({
                      cells: currentCells
                    });
                    _context8.next = 14;
                    return new Promise(function (r) {
                      return setTimeout(r, 40);
                    });
                  case 14:
                  case "end":
                    return _context8.stop();
                }
              }, _loop9);
            });
            y = 0;
          case 12:
            if (!(y < cSizeDef.size)) {
              _context9.next = 17;
              break;
            }
            return _context9.delegateYield(_loop9(y), "t0", 14);
          case 14:
            y++;
            _context9.next = 12;
            break;
          case 17:
            if (stateChanged) {
              if (engineRef.current === 'none') setHistory(function (past) {
                return [].concat(_toConsumableArray(past.slice(past.length > 25 ? 1 : 0)), [currentCells]);
              });
              showToast("\u270F\uFE0F \u5DF2\u5C07 ".concat(_char4, " \u6A19\u8A18\u81F3\u6240\u6709\u5B89\u5168\u7684\u7A7A\u683C\u4E2D"));
            } else {
              showToast("\uD83D\uDCA1 \u6C92\u6709\u66F4\u591A\u5B89\u5168\u7684\u7A7A\u683C\u53EF\u4EE5\u6A19\u8A18 ".concat(_char4, " \u4E86"));
            }
            isAutoFillingRef.current = false;
            syncState({
              isAutoFilling: false,
              selectedChar: null
            }, !isBrawlMode);
          case 20:
          case "end":
            return _context9.stop();
        }
      }, _callee4);
    }));
    return function autoFillDrafts(_x3) {
      return _ref7.apply(this, arguments);
    };
  }();
  var runAutoFillCycle = /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(startChar) {
      var changed, stateChanged, currentCells, totalFilled, chars, startIndex, isValid, isCharCompleted, fill, passChanged, _loop11, _ret, i;
      return _regeneratorRuntime().wrap(function _callee6$(_context15) {
        while (1) switch (_context15.prev = _context15.next) {
          case 0:
            if (stateRef.current.brawlSettings.allowTraversal) {
              _context15.next = 3;
              break;
            }
            showToast("⚠️ 已關閉循環功能");
            return _context15.abrupt("return");
          case 3:
            if (!isAutoFillingRef.current) {
              _context15.next = 5;
              break;
            }
            return _context15.abrupt("return");
          case 5:
            isAutoFillingRef.current = true;
            syncState({
              isAutoFilling: true
            }, !isBrawlMode);
            changed = false;
            stateChanged = false;
            currentCells = _toConsumableArray(isBrawlMode ? stateRef.current.localCells : stateRef.current.cells);
            totalFilled = 0;
            chars = cSizeDef.chars;
            startIndex = chars.indexOf(startChar);
            isValid = function isValid(cell, gridCells, checkChar) {
              if (cell.value !== null) return false;
              var _iterator6 = _createForOfIteratorHelper(gridCells),
                _step6;
              try {
                for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                  var other = _step6.value;
                  if (other.value === checkChar) {
                    if (other.x === cell.x || other.y === cell.y || other.boxId === cell.boxId) return false;
                  }
                }
              } catch (err) {
                _iterator6.e(err);
              } finally {
                _iterator6.f();
              }
              return true;
            };
            isCharCompleted = function isCharCompleted(checkChar, gridCells) {
              return gridCells.filter(function (c) {
                return c.value === checkChar;
              }).length === cSizeDef.size;
            };
            fill = /*#__PURE__*/function () {
              var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(cellId, fillChar) {
                var idx, targetCell, i, c, me, msg;
                return _regeneratorRuntime().wrap(function _callee5$(_context10) {
                  while (1) switch (_context10.prev = _context10.next) {
                    case 0:
                      idx = currentCells.findIndex(function (c) {
                        return c.id === cellId;
                      });
                      if (!(idx !== -1)) {
                        _context10.next = 12;
                        break;
                      }
                      currentCells = _toConsumableArray(currentCells);
                      targetCell = currentCells[idx];
                      currentCells[idx] = _objectSpread(_objectSpread({}, targetCell), {}, {
                        value: fillChar,
                        drafts: [],
                        owner: myId
                      });
                      changed = true;
                      stateChanged = true;
                      totalFilled++;
                      for (i = 0; i < currentCells.length; i++) {
                        if (i !== idx) {
                          c = currentCells[i];
                          if (c.x === targetCell.x || c.y === targetCell.y || c.boxId === targetCell.boxId) {
                            if (c.drafts.includes(fillChar)) {
                              currentCells[i] = _objectSpread(_objectSpread({}, c), {}, {
                                drafts: c.drafts.filter(function (d) {
                                  return d !== fillChar;
                                })
                              });
                            }
                          }
                        }
                      }
                      if (isBrawlMode) {
                        syncState({
                          localCells: currentCells,
                          selectedChar: fillChar
                        }, false);
                        if (isMultiplayer) {
                          me = playersListRef.current.find(function (p) {
                            return p.id === myId;
                          });
                          msg = {
                            type: 'GHOST_SOLVED',
                            uid: myId,
                            color: me ? me.color : myColorRef.current,
                            cellId: cellId,
                            id: Math.random().toString(36).substring(2, 11),
                            value: fillChar
                          };
                          if (engineRef.current === 'peerjs') {
                            if (isHostRef.current) connsRef.current.forEach(function (c) {
                              return c.send(msg);
                            });else if (connRef.current) connRef.current.send(msg);
                          }
                        }
                      } else {
                        syncState({
                          cells: currentCells,
                          selectedChar: fillChar
                        });
                      }
                      _context10.next = 12;
                      return new Promise(function (r) {
                        return setTimeout(r, 100);
                      });
                    case 12:
                    case "end":
                      return _context10.stop();
                  }
                }, _callee5);
              }));
              return function fill(_x5, _x6) {
                return _ref9.apply(this, arguments);
              };
            }();
          case 16:
            passChanged = false;
            _loop11 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop11() {
              var charIdx, _char5, _loop12, y, _loop13, x, _loop14, b;
              return _regeneratorRuntime().wrap(function _loop11$(_context14) {
                while (1) switch (_context14.prev = _context14.next) {
                  case 0:
                    charIdx = (startIndex + i) % chars.length;
                    _char5 = chars[charIdx];
                    if (!currentCells.every(function (c) {
                      return c.value !== null;
                    })) {
                      _context14.next = 4;
                      break;
                    }
                    return _context14.abrupt("return", 0);
                  case 4:
                    if (!isCharCompleted(_char5, currentCells)) {
                      _context14.next = 6;
                      break;
                    }
                    return _context14.abrupt("return", 1);
                  case 6:
                    syncState({
                      selectedChar: _char5
                    }, !isBrawlMode);
                    _context14.next = 9;
                    return new Promise(function (r) {
                      return setTimeout(r, 50);
                    });
                  case 9:
                    changed = false;
                    _loop12 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop12(y) {
                      var rowCells, validEmpties;
                      return _regeneratorRuntime().wrap(function _loop12$(_context11) {
                        while (1) switch (_context11.prev = _context11.next) {
                          case 0:
                            rowCells = currentCells.filter(function (c) {
                              return c.y === y;
                            });
                            if (!rowCells.some(function (c) {
                              return c.value === _char5;
                            })) {
                              _context11.next = 3;
                              break;
                            }
                            return _context11.abrupt("return", 1);
                          case 3:
                            validEmpties = rowCells.filter(function (c) {
                              return isValid(c, currentCells, _char5);
                            });
                            if (!(validEmpties.length === 1)) {
                              _context11.next = 7;
                              break;
                            }
                            _context11.next = 7;
                            return fill(validEmpties[0].id, _char5);
                          case 7:
                          case "end":
                            return _context11.stop();
                        }
                      }, _loop12);
                    });
                    y = 0;
                  case 12:
                    if (!(y < cSizeDef.size)) {
                      _context14.next = 19;
                      break;
                    }
                    return _context14.delegateYield(_loop12(y), "t0", 14);
                  case 14:
                    if (!_context14.t0) {
                      _context14.next = 16;
                      break;
                    }
                    return _context14.abrupt("continue", 16);
                  case 16:
                    y++;
                    _context14.next = 12;
                    break;
                  case 19:
                    if (!changed) {
                      _context14.next = 22;
                      break;
                    }
                    passChanged = true;
                    return _context14.abrupt("continue", 44);
                  case 22:
                    _loop13 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop13(x) {
                      var colCells, validEmpties;
                      return _regeneratorRuntime().wrap(function _loop13$(_context12) {
                        while (1) switch (_context12.prev = _context12.next) {
                          case 0:
                            colCells = currentCells.filter(function (c) {
                              return c.x === x;
                            });
                            if (!colCells.some(function (c) {
                              return c.value === _char5;
                            })) {
                              _context12.next = 3;
                              break;
                            }
                            return _context12.abrupt("return", 1);
                          case 3:
                            validEmpties = colCells.filter(function (c) {
                              return isValid(c, currentCells, _char5);
                            });
                            if (!(validEmpties.length === 1)) {
                              _context12.next = 7;
                              break;
                            }
                            _context12.next = 7;
                            return fill(validEmpties[0].id, _char5);
                          case 7:
                          case "end":
                            return _context12.stop();
                        }
                      }, _loop13);
                    });
                    x = 0;
                  case 24:
                    if (!(x < cSizeDef.size)) {
                      _context14.next = 31;
                      break;
                    }
                    return _context14.delegateYield(_loop13(x), "t1", 26);
                  case 26:
                    if (!_context14.t1) {
                      _context14.next = 28;
                      break;
                    }
                    return _context14.abrupt("continue", 28);
                  case 28:
                    x++;
                    _context14.next = 24;
                    break;
                  case 31:
                    if (!changed) {
                      _context14.next = 34;
                      break;
                    }
                    passChanged = true;
                    return _context14.abrupt("continue", 44);
                  case 34:
                    _loop14 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop14(b) {
                      var boxCells, validEmpties;
                      return _regeneratorRuntime().wrap(function _loop14$(_context13) {
                        while (1) switch (_context13.prev = _context13.next) {
                          case 0:
                            boxCells = currentCells.filter(function (c) {
                              return c.boxId === b;
                            });
                            if (!boxCells.some(function (c) {
                              return c.value === _char5;
                            })) {
                              _context13.next = 3;
                              break;
                            }
                            return _context13.abrupt("return", 1);
                          case 3:
                            validEmpties = boxCells.filter(function (c) {
                              return isValid(c, currentCells, _char5);
                            });
                            if (!(validEmpties.length === 1)) {
                              _context13.next = 7;
                              break;
                            }
                            _context13.next = 7;
                            return fill(validEmpties[0].id, _char5);
                          case 7:
                          case "end":
                            return _context13.stop();
                        }
                      }, _loop14);
                    });
                    b = 0;
                  case 36:
                    if (!(b < cSizeDef.size)) {
                      _context14.next = 43;
                      break;
                    }
                    return _context14.delegateYield(_loop14(b), "t2", 38);
                  case 38:
                    if (!_context14.t2) {
                      _context14.next = 40;
                      break;
                    }
                    return _context14.abrupt("continue", 40);
                  case 40:
                    b++;
                    _context14.next = 36;
                    break;
                  case 43:
                    if (changed) passChanged = true;
                  case 44:
                    if (changed) {
                      _context14.next = 9;
                      break;
                    }
                  case 45:
                  case "end":
                    return _context14.stop();
                }
              }, _loop11);
            });
            i = 0;
          case 19:
            if (!(i < chars.length)) {
              _context15.next = 29;
              break;
            }
            return _context15.delegateYield(_loop11(), "t0", 21);
          case 21:
            _ret = _context15.t0;
            if (!(_ret === 0)) {
              _context15.next = 24;
              break;
            }
            return _context15.abrupt("break", 29);
          case 24:
            if (!(_ret === 1)) {
              _context15.next = 26;
              break;
            }
            return _context15.abrupt("continue", 26);
          case 26:
            i++;
            _context15.next = 19;
            break;
          case 29:
            if (passChanged && !currentCells.every(function (c) {
              return c.value !== null;
            })) {
              _context15.next = 16;
              break;
            }
          case 30:
            if (stateChanged) {
              if (engineRef.current === 'none') {
                setHistory(function (past) {
                  return [].concat(_toConsumableArray(past.slice(past.length > 25 ? 1 : 0)), [currentCells]);
                });
              }
              if (currentCells.every(function (c) {
                return c.value !== null;
              })) {
                syncState({
                  selectedChar: null
                }, !isBrawlMode);
              } else {
                showToast("\uD83D\uDE80 \u5168\u81EA\u52D5\u5FAA\u74B0\u586B\u5BEB\u5B8C\u7562\uFF01\n\u5171\u5E6B\u60A8\u586B\u5165\u4E86 ".concat(totalFilled, " \u683C\u3002"));
              }
            } else {
              showToast("\uD83D\uDCA1 \u76EE\u524D\u5DF2\u7D93\u627E\u4E0D\u5230\u5FC5\u5B9A\u80FD\u586B\u5BEB\u7684\u7A7A\u683C\u4E86");
              syncState({
                selectedChar: null
              }, !isBrawlMode);
            }
            isAutoFillingRef.current = false;
            syncState({
              isAutoFilling: false,
              selectedChar: null
            }, !isBrawlMode);
          case 33:
          case "end":
            return _context15.stop();
        }
      }, _callee6);
    }));
    return function runAutoFillCycle(_x4) {
      return _ref8.apply(this, arguments);
    };
  }();
  var clickTracker = useRef({
    "char": null,
    count: 0,
    time: 0
  });
  var onNumClick = function onNumClick(e, c) {
    e.preventDefault();
    if (isAutoFillingRef.current || winner || matchPhase !== 'playing' || isSpectator) return;
    if (inputMode === 'cell') {
      // 格子先行：數字鍵 = 寫入目前選取的格子（還沒選格子時，點數字只做同值高亮）
      if (!selectedCellId) {
        if (!completedChars.has(c)) setSelectedChar(function (prev) {
          return prev === c ? null : c;
        });
        return;
      }
      var cur = isBrawlMode ? localCells : cells;
      var t = cur.find(function (x) {
        return x.id === selectedCellId;
      });
      if (!t) return;
      if (t.isGiven || t.isSystemRevealed) {
        showToast("⚠️ 這格是題目給的，不能修改");
        return;
      }
      if (!isHeaderCollapsed) setIsHeaderCollapsed(true);
      applyCharToCell(selectedCellId, c);
      setSelectedChar(c);
      return;
    }
    if (!isHeaderCollapsed) setIsHeaderCollapsed(true);
    var now = Date.now();
    var tracker = clickTracker.current;
    if (tracker["char"] === c && now - tracker.time < 400) {
      tracker.count += 1;
    } else {
      tracker["char"] = c;
      tracker.count = 1;
    }
    tracker.time = now;
    var isCompleted = completedChars.has(c);
    if (tracker.count === 1) {
      if (!isCompleted) setSelectedChar(function (prev) {
        return prev === c ? null : c;
      });
    } else if (tracker.count === 2) {
      if (!isCompleted) {
        var isGhostBlocked = !stateRef.current.brawlSettings.allowQuickFill;
        if (isGhostBlocked) {
          tracker.count = 0;
        } else {
          if (interactionMode === 0) autoFillHiddenSingles(c);else if (interactionMode === 1) autoFillDrafts(c);
        }
      }
    } else if (tracker.count === 5) {
      var _isGhostBlocked = !stateRef.current.brawlSettings.allowTraversal;
      if (!_isGhostBlocked) {
        if (interactionMode === 0) runAutoFillCycle(c);else showToast("⚠️ 草稿模式不支援循環自動填寫\n請切換至一般模式使用");
      }
      tracker.count = 0;
    }
  };
  var recalculateZoom = function recalculateZoom(modeIdx) {
    var container = zoomContainerRef.current;
    if (!container) return;
    var cw = container.clientWidth;
    var ch = container.clientHeight;
    var newZoom = 1;
    if (modeIdx === 0) {
      newZoom = zoomLevelRef.current;
    } else if (modeIdx === 1) {
      newZoom = cw / svgW;
    } else if (modeIdx === 2) {
      newZoom = ch / svgH;
    } else if (modeIdx === 3) {
      newZoom = Math.min(cw / svgW, ch / svgH) * 0.95;
    }

    // 增加防震：如果縮放比例變動微小，不更新 (避免手機虛擬鍵盤彈出導致的呼大呼小)
    if (Math.abs(newZoom - zoomLevelRef.current) < 0.001 && svgRef.current && svgRef.current.style.width) return;
    setZoomLevel(newZoom);
    zoomLevelRef.current = newZoom;
    if (svgRef.current) {
      svgRef.current.style.width = "".concat(svgW * newZoom, "px");
      svgRef.current.style.height = "".concat(svgH * newZoom, "px");
    }
  };
  var handleSizeChange = function handleSizeChange(e) {
    var newSize = parseInt(e.target.value);
    if (isHostRef.current) generateAndSync(newSize, diffId);
  };
  var handleDiffChange = function handleDiffChange(e) {
    var newDiff = e.target.value;
    if (isHostRef.current) generateAndSync(sizeId, newDiff);
  };
  useEffect(function () {
    if (screen === 'game' && levelData && levelData.cells.length > 0) {
      var tid = setTimeout(function () {
        return recalculateZoom(zoomModeIdxRef.current);
      }, 100);
      return function () {
        return clearTimeout(tid);
      };
    }
  }, [levelData, screen]);
  var handleCellClick = function handleCellClick(cellId) {
    if (isLongPressTriggered.current) return; // 防長按後觸發點擊
    if (isWon || interactionMode >= 2 || winner || matchPhase !== 'playing' || isSpectator) return;
    var cur = isBrawlMode ? localCells : cells;
    var targetIdx = cur.findIndex(function (c) {
      return c.id === cellId;
    });
    if (targetIdx === -1) return;
    var target = cur[targetIdx];

    // 格子先行：點格子只是「選取」，等玩家再點數字鍵填入（同時以該格數字做同值高亮）
    if (inputMode === 'cell') {
      setSelectedCellId(cellId);
      setSelectedChar(target.value);
      return;
    }

    // 判斷按鍵是否已經被反擊打亂
    var isScrambled = keyMapping.join('') !== cSizeDef.chars.join('');
    if (selectedChar === null) {
      if (target.value !== null) {
        if (isBrawlMode && scrambledCharsRef.current.has(target.value)) {
          showToast("⚠️ 這個數字的按鍵已被打亂，無法使用智慧吸取！");
          return;
        }
        setSelectedChar(target.value);
      }
      return;
    }
    if (target.isGiven || target.isSystemRevealed) {
      if (isBrawlMode && target.value !== selectedChar && scrambledCharsRef.current.has(target.value)) {
        showToast("⚠️ 這個數字的按鍵已被打亂，無法使用智慧吸取！");
        return;
      }
      setSelectedChar(function (prev) {
        return prev === target.value ? null : target.value;
      });
      return;
    }
    applyCharToCell(cellId, selectedChar);
  };

  // 把字元 char 套用到指定格子（填答/草稿共用；數字先行與格子先行都走這裡）
  var applyCharToCell = function applyCharToCell(cellId, _char6) {
    var cur = isBrawlMode ? localCells : cells;
    var targetIdx = cur.findIndex(function (c) {
      return c.id === cellId;
    });
    if (targetIdx === -1) return;
    var target = cur[targetIdx];
    if (target.isGiven || target.isSystemRevealed) return;
    if (engineRef.current === 'none') setHistory(function (past) {
      return [].concat(_toConsumableArray(past.slice(past.length > 25 ? 1 : 0)), [cur]);
    });
    var nextCells = _toConsumableArray(cur);
    var nextCell = _objectSpread({}, target);
    if (interactionMode === 1) {
      // 草稿模式
      if (nextCell.drafts.includes(_char6)) {
        nextCell.drafts = nextCell.drafts.filter(function (d) {
          return d !== _char6;
        });
      } else {
        nextCell.drafts = [].concat(_toConsumableArray(nextCell.drafts), [_char6]);
      }
    } else {
      // 一般填答模式
      var nextValue = target.value === _char6 ? null : _char6;
      nextCell.value = nextValue;
      nextCell.owner = nextValue !== null ? myId : null;
      nextCell.drafts = [];

      // 幽靈競速/亂鬥模式：廣播玩家填答狀況（包含擦除，讓上帝模式與進度條能正確反映）
      if (isBrawlMode && isMultiplayer) {
        var me = playersListRef.current.find(function (p) {
          return p.id === myId;
        });
        var msg = {
          type: 'GHOST_SOLVED',
          uid: myId,
          color: me ? me.color : myColorRef.current,
          cellId: cellId,
          id: Math.random().toString(36).substring(2, 11),
          value: nextValue
        };
        if (engineRef.current === 'peerjs') {
          if (isHostRef.current) connsRef.current.forEach(function (c) {
            return c.send(msg);
          });else if (connRef.current) connRef.current.send(msg);
        }
      }
    }
    nextCells[targetIdx] = nextCell;
    if (isBrawlMode) {
      syncState({
        localCells: nextCells
      }, false);
    } else {
      syncState({
        cells: nextCells
      });
    }
  };
  var handleReset = function handleReset() {
    if (isAutoFillingRef.current || matchPhase !== 'playing' || isSpectator) return;
    var currentActive = isBrawlMode ? localCells : cells;
    var resetCells = currentActive.map(function (c) {
      return _objectSpread(_objectSpread({}, c), {}, {
        value: c.isGiven || c.isSystemRevealed ? c.value : null,
        drafts: [],
        owner: null
      });
    });
    syncState({
      cells: resetCells,
      localCells: resetCells,
      strokes: [],
      startTime: Date.now()
    });
    if (engineRef.current === 'none') setHistory([]);
    setIsWon(false);
    setEndTime(null);
    setSelectedChar(null);
    showToast("🔄 盤面已重置！");
  };
  var switchToOffline = function switchToOffline() {
    setEngine('local');
    engineRef.current = 'local';
    setIsHost(true);
    isHostRef.current = true;
    setPlayersList([{
      id: myId,
      name: myNameRef.current || "單機玩家",
      isHost: true,
      color: myColorRef.current,
      isReady: false,
      isSpectator: false
    }]);
  };
  var handleGoHome = function handleGoHome() {
    dailyRef.current = null;
    setDailyDate(null);
    if (window.__PLAT_NOTIFY) window.__PLAT_NOTIFY('game-exit');
    if (engineRef.current === 'peerjs') {
      if (!isHostRef.current && connRef.current) {
        connRef.current.send({
          type: 'LEAVE',
          uid: myId
        });
        setTimeout(function () {
          if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
          }
        }, 100);
      } else if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    }
    switchToOffline();
    setScreen('home');
    setIsWon(false);
    setEndTime(null);
    setHistory([]);
  };
  var handlePlayerColorChange = function handlePlayerColorChange(playerId, newColor) {
    var updateLogic = function updateLogic(prev) {
      var nList = prev.map(function (p) {
        return p.id === playerId ? _objectSpread(_objectSpread({}, p), {}, {
          color: newColor
        }) : p;
      });
      if (isHostRef.current) {
        // 連動更新盤面上該玩家填寫的格子顏色 (v3.8.33)
        setCells(function (cur) {
          return cur.map(function (c) {
            return c.owner === playerId ? _objectSpread(_objectSpread({}, c), {}, {
              ownerColor: newColor
            }) : c;
          });
        });
        setLocalCells(function (cur) {
          return cur.map(function (c) {
            return c.owner === playerId ? _objectSpread(_objectSpread({}, c), {}, {
              ownerColor: newColor
            }) : c;
          });
        });
        connsRef.current.forEach(function (c) {
          return c.send({
            type: 'PLAYERS_UPDATE',
            players: nList
          });
        });
      }
      return nList;
    };
    if (engineRef.current === 'none') {
      setPlayersList(updateLogic);
      return;
    }
    if (engineRef.current === 'peerjs') {
      if (isHostRef.current) setPlayersList(updateLogic);else if (connRef.current) connRef.current.send({
        type: 'REQ_COLOR_CHANGE',
        targetId: playerId,
        color: newColor
      });
    }
  };
  var handlePlayerNameChange = function handlePlayerNameChange(playerId, newName) {
    if (playerId === myId) setTempPlayerName(newName);
    if (engineRef.current === 'none') setPlayersList(function (prev) {
      return prev.map(function (p) {
        return p.id === playerId ? _objectSpread(_objectSpread({}, p), {}, {
          name: newName
        }) : p;
      });
    });else if (engineRef.current === 'peerjs') {
      if (isHostRef.current) {
        var nList = playersListRef.current.map(function (p) {
          return p.id === playerId ? _objectSpread(_objectSpread({}, p), {}, {
            name: newName
          }) : p;
        });
        setPlayersList(nList);
        connsRef.current.forEach(function (c) {
          return c.send({
            type: 'PLAYERS_UPDATE',
            players: nList
          });
        });
      } else if (connRef.current) connRef.current.send({
        type: 'REQ_NAME_CHANGE',
        targetId: playerId,
        name: newName
      });
    }
    showToast("✅ 暱稱修改成功！");
  };
  var handleUndo = function handleUndo() {
    if (history.length === 0 || isWon || engineRef.current !== 'none' && !isBrawlMode) return;
    setHistory(function (past) {
      var newPast = _toConsumableArray(past);
      var lastState = newPast.pop();
      if (isBrawlMode) {
        setLocalCells(lastState);
        syncState({
          localCells: lastState
        }, false);
      } else {
        setCells(lastState);
        syncState({
          cells: lastState
        });
      }
      return newPast;
    });
  };
  var handleCycleZoom = function handleCycleZoom() {
    var next = (zoomModeIdx + 1) % 4;
    setZoomModeIdx(next);
    zoomModeIdxRef.current = next;
    recalculateZoom(next);
  };
  var handleZoomIn = function handleZoomIn() {
    setZoomModeIdx(0);
    zoomModeIdxRef.current = 0;
    var next = Math.min(5, zoomLevel + 0.1);
    setZoomLevel(next);
    zoomLevelRef.current = next;
    if (svgRef.current) {
      svgRef.current.style.width = "".concat(svgW * next, "px");
      svgRef.current.style.height = "".concat(svgH * next, "px");
    }
  };
  var handleZoomOut = function handleZoomOut() {
    setZoomModeIdx(0);
    zoomModeIdxRef.current = 0;
    var next = Math.max(0.1, zoomLevel - 0.1);
    setZoomLevel(next);
    zoomLevelRef.current = next;
    if (svgRef.current) {
      svgRef.current.style.width = "".concat(svgW * next, "px");
      svgRef.current.style.height = "".concat(svgH * next, "px");
    }
  };
  var startDailyGame = function startDailyGame(dateStr) {
    switchToOffline();
    dailyRef.current = dateStr;
    setDailyDate(dateStr);
    dailyRecordedRef.current = false;
    setScreen('game');
    setMatchPhase('playing');
    setIsBrawlMode(false);
    setIsHeaderCollapsed(false);
    setIsGenerating(true);
    setWinner(null);
    isWinnerDeclaredRef.current = false;
    setTimeout(function () {
      generateDailySudoku(dateStr, setGenProgress).then(function (newData) {
        var initCells = JSON.parse(JSON.stringify(newData.cells));
        syncState({
          sizeId: 9,
          diffId: 'medium',
          levelData: newData,
          cells: initCells,
          localCells: initCells,
          strokes: [],
          startTime: Date.now(),
          isBrawlMode: false,
          winner: null,
          matchEndTime: null,
          solutionGrid: null,
          isGenerating: false,
          selectedChar: null,
          keyMapping: newData.sizeDef.chars,
          finishViewMode: 'my'
        }, true);
        setIsWon(false);
        setHistory([]);
        setEndTime(null);
        setHideVictoryModal(false);
        setSelectedChar(null);
        setGenProgress("");
      });
    }, 100);
  };

  // 每日一題完賽記錄（連擊只認今天；補玩只記該日成績）
  useEffect(function () {
    if (!isWon || !dailyRef.current || dailyRecordedRef.current || !endTime) return;
    dailyRecordedRef.current = true;
    var dateStr = dailyRef.current;
    var secs = Math.max(1, Math.round((endTime - startTime) / 1000));
    setDailyRecords(function (prev) {
      var next = _objectSpread({}, prev);
      if (!next[dateStr] || secs < next[dateStr]) next[dateStr] = secs;
      try {
        localStorage.setItem('sudoku_daily_records', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    if (dateStr === dailyTodayStr()) {
      setDailyStreak(function (prev) {
        var next = prev;
        if (prev.lastDate !== dateStr) {
          var count = prev.lastDate === shiftDateStr(dateStr, -1) ? prev.count + 1 : 1;
          next = {
            count: count,
            lastDate: dateStr
          };
          try {
            localStorage.setItem('sudoku_daily_streak', JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
    }
    showToast('📅 每日一題（' + dateStr + '）完成！用時 ' + formatTime(secs));
  }, [isWon, endTime]);
  var startSinglePlayer = function startSinglePlayer() {
    dailyRef.current = null;
    setDailyDate(null);
    switchToOffline();
    setScreen('game');
    setMatchPhase('waiting');
    setIsBrawlMode(false);
    setIsBrawlMode(false); // 確保是純單機模式
    setIsHeaderCollapsed(false);
  };
  var handleSaveCode = function handleSaveCode() {
    var targetCells = isBrawlMode ? localCells : cells;
    var data = {
      sId: sizeId,
      dId: diffId,
      cells: targetCells.map(function (c) {
        return {
          x: c.x,
          y: c.y,
          v: c.value,
          g: c.isGiven,
          d: c.drafts,
          o: c.owner
        };
      }),
      mode: isBrawlMode ? 'brawl' : 'coop'
    };
    try {
      var code = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      setSaveCode(code);
      navigator.clipboard.writeText(code).then(function () {
        return showToast("📋 進度代碼已複製到剪貼簿！");
      });
    } catch (e) {
      showToast("❌ 產生代碼失敗");
    }
  };
  var handleLoadCode = function handleLoadCode() {
    if (!saveCode.trim()) return showToast("⚠️ 請先貼上代碼");
    try {
      var data = JSON.parse(decodeURIComponent(escape(atob(saveCode))));
      setIsGenerating(true);
      generateSudokuAsync(data.sId, data.dId, setGenProgress).then(function (newData) {
        var loadedCells = newData.cells.map(function (c) {
          var saved = data.cells.find(function (sc) {
            return sc.x === c.x && sc.y === c.y;
          });
          if (saved) return _objectSpread(_objectSpread({}, c), {}, {
            value: saved.v,
            isGiven: saved.g,
            drafts: saved.d || [],
            owner: saved.o || null
          });
          return c;
        });
        var solution = null;
        if (data.mode === 'ghost' || data.mode === 'brawl') solution = getSolutionGrid(loadedCells, newData.sizeDef);
        syncState(_defineProperty(_defineProperty(_defineProperty({
          sizeId: data.sId,
          diffId: data.dId,
          levelData: newData,
          cells: loadedCells,
          localCells: loadedCells,
          isBrawlMode: data.mode === 'ghost' || data.mode === 'brawl'
        }, "isBrawlMode", data.mode === 'brawl'), "solutionGrid", solution), "isGenerating", false), true);
        setScreen('game');
        setShowSaveModal(false);
        showToast("✅ 進度載入成功！");
      });
    } catch (e) {
      showToast("❌ 無效的進度代碼");
    }
  };
  var handleQuickPaste = /*#__PURE__*/function () {
    var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
      var text;
      return _regeneratorRuntime().wrap(function _callee7$(_context16) {
        while (1) switch (_context16.prev = _context16.next) {
          case 0:
            _context16.prev = 0;
            _context16.next = 3;
            return navigator.clipboard.readText();
          case 3:
            text = _context16.sent;
            setSaveCode(text);
            showToast("📋 已貼上剪貼簿內容");
            _context16.next = 11;
            break;
          case 8:
            _context16.prev = 8;
            _context16.t0 = _context16["catch"](0);
            showToast("❌ 無法讀取剪貼簿，請手動貼上");
          case 11:
          case "end":
            return _context16.stop();
        }
      }, _callee7, null, [[0, 8]]);
    }));
    return function handleQuickPaste() {
      return _ref10.apply(this, arguments);
    };
  }();
  var generateAndSync = function generateAndSync(sId, dId, nextMode) {
    var skipLobby = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    if (isAutoFillingRef.current) return;
    setIsGenerating(true);
    setWinner(null);
    isWinnerDeclaredRef.current = false;
    setGhostHints({});
    setUnopenedGifts({});
    setBrawlWinners([]);
    var targetMode = nextMode;
    if (targetMode === undefined) {
      targetMode = stateRef.current.isBrawlMode ? 'brawl' : 'coop';
    }
    var isGR = targetMode === 'brawl';
    var isBrawl = targetMode === 'brawl';
    var newPhase = engineRef.current === 'peerjs' ? 'waiting' : 'playing';
    var cdTarget = null;
    if (skipLobby && engineRef.current === 'peerjs') {
      if (isGR) {
        newPhase = 'countdown';
        cdTarget = Date.now() + 5500;
      } else {
        newPhase = 'playing';
      }
    }
    setIsSpectator(false);
    syncState({
      isGenerating: true,
      isBrawlMode: isBrawl,
      winner: null,
      matchPhase: newPhase,
      matchEndTime: null,
      countdownTarget: cdTarget,
      giftEvents: [],
      brawlWinners: [],
      finishViewMode: 'my'
    }, true);
    setPlayersList(function (prev) {
      var nList = prev.map(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          isReady: engineRef.current === 'none',
          isSpectator: !!p.isLobbySpectator
        });
      });
      if (engineRef.current === 'peerjs' && isHostRef.current) connsRef.current.forEach(function (c) {
        return c.send({
          type: 'PLAYERS_UPDATE',
          players: nList
        });
      });
      return nList;
    });
    setTimeout(function () {
      generateSudokuAsync(sId, dId, setGenProgress).then(function (newData) {
        var solution = null;
        if (isGR) solution = getSolutionGrid(newData.cells, newData.sizeDef);
        var initLocalCells = JSON.parse(JSON.stringify(newData.cells));
        syncState({
          sizeId: sId,
          diffId: dId,
          levelData: newData,
          cells: initLocalCells,
          localCells: initLocalCells,
          strokes: [],
          startTime: Date.now(),
          isBrawlMode: isBrawl,
          winner: null,
          matchEndTime: null,
          solutionGrid: solution,
          isGenerating: false,
          selectedChar: null,
          keyMapping: newData.sizeDef.chars,
          finishViewMode: 'my'
        }, true);
        setIsWon(false);
        setHistory([]);
        if (sId !== sizeId) {
          setZoomLevel(1);
          setZoomModeIdx(0);
        }
        setEndTime(null);
        setHideVictoryModal(false);
        setSelectedChar(null);
        setGenProgress("");
      });
    }, 100);
  };
  handleRegenerateRandomRef.current = function () {
    return generateAndSync(sizeId, diffId);
  };

  // ===== 平台 Phase C 接入：殼 launch 時自動進多人（免重打暱稱/房號） =====
  useEffect(function () {
    if (!window.__PLAT_PLATFORM) return;
    window.__PLAT_HOOKS_sudoku = {
      enter: function enter(sess) {
        myNameRef.current = sess.name;
        setTempPlayerName(sess.name);
        setEngine('peerjs');
        engineRef.current = 'peerjs';
        setIsConnecting(true);
        if (sess.isHost) {
          syncState({
            levelData: emptyLevelData,
            cells: [],
            localCells: [],
            matchPhase: 'waiting',
            matchEndTime: null,
            isBrawlMode: sess.mode === 'brawl'
          }, false);
          setupPeerJS(sess.code, sess.name, true);
        } else {
          setupPeerJS(sess.code, sess.name, false);
        }
      },
      exit: function exit() {
        handleGoHome();
      }
    };
  }, []);
  var setupPeerJS = function setupPeerJS(rId, pName, isCreating) {
    var savedProg = loadLocalProgress(rId, myId);
    setConnectionStatus(isCreating ? "正在啟動通訊模組..." : "\u6B63\u5728\u5C0B\u627E\u623F\u9593 ".concat(rId, "..."));
    if (isCreating) {
      var p = new Peer('yyh-tgsh-' + rId + '-host');
      peerRef.current = p;
      p.on('open', function () {
        setConnectionStatus("房間已建立，等待進入...");
        var currentPhase = stateRef.current.matchPhase;
        var hasLevelData = stateRef.current.levelData !== null;
        var isMigrating = hasLevelData && (currentPhase === 'playing' || currentPhase === 'countdown');
        var targetPhase = isMigrating ? currentPhase : 'waiting';
        setIsHost(true);
        isHostRef.current = true;
        setIsSpectator(false);
        setRoomId(rId);
        setScreen('game');
        setIsHeaderCollapsed(false);
        setIsConnecting(false);
        syncState({
          matchPhase: targetPhase
        }, false);
        setPlayersList(function (prev) {
          var others = prev.filter(function (pl) {
            return pl.id !== myId && !pl.isHost;
          });
          var me = prev.find(function (pl) {
            return pl.id === myId;
          }) || {
            id: myId,
            color: getAvailableColor([])
          };
          var newList = [_objectSpread(_objectSpread({}, me), {}, {
            name: pName,
            isHost: true,
            isReady: false,
            isSpectator: false
          })].concat(_toConsumableArray(others));
          return newList;
        });
        saveLocalProgress(rId, myId, pName, true, savedProg ? savedProg.d : []);
        if (!isMigrating) {
          if (savedProg) {
            setLocalCells(savedProg.d);
            showToast("📦 已恢復上次對局進度");
          }
          generateAndSync(stateRef.current.sizeId, stateRef.current.diffId, stateRef.current.isBrawlMode ? 'brawl' : 'coop');
        }
        p.on('connection', function (c) {
          connsRef.current.push(c);
          c.on('data', function (m) {
            if (m.type === 'JOIN') {
              var storedSid = null;
              try {
                var ls = localStorage.getItem('sudoku_last_session');
                storedSid = ls ? JSON.parse(ls).sid : null;
              } catch (e) {}
              var roomSessionId = stateRef.current.sessionId || storedSid;
              if (m.sid && roomSessionId && m.sid !== roomSessionId) {
                c.send({
                  type: 'JOIN_REJECTED',
                  reason: 'session_mismatch'
                });
                return;
              }
              if (playersListRef.current.some(function (p) {
                return p.name === m.pName && p.id !== m.uid;
              })) {
                c.send({
                  type: 'JOIN_REJECTED',
                  reason: 'name_conflict'
                });
                return;
              }
              connsRef.current = connsRef.current.filter(function (conn) {
                if (conn.uid === m.uid && conn !== c) {
                  try {
                    conn.close();
                  } catch (e) {}
                  return false;
                }
                return true;
              });
              c.uid = m.uid;
              var existingPlayer = playersListRef.current.find(function (pl) {
                return pl.id === m.uid;
              });
              var isSpec = existingPlayer ? existingPlayer.isSpectator : stateRef.current.isBrawlMode && stateRef.current.matchPhase === 'playing';
              setPlayersList(function (prev) {
                var nList;
                if (prev.find(function (pl) {
                  return pl.id === m.uid;
                })) nList = prev.map(function (pl) {
                  return pl.id === m.uid ? _objectSpread(_objectSpread({}, pl), {}, {
                    name: m.pName,
                    isSpectator: isSpec
                  }) : pl;
                });else nList = [].concat(_toConsumableArray(prev), [{
                  id: m.uid,
                  name: m.pName || "玩家",
                  isHost: false,
                  color: getAvailableColor(prev),
                  isReady: false,
                  isSpectator: isSpec
                }]);
                connsRef.current.forEach(function (conn) {
                  if (conn === c) conn.send({
                    type: 'INIT',
                    data: _objectSpread(_objectSpread({}, stateRef.current), {}, {
                      solutionGrid: solutionGridRef.current
                    }),
                    players: nList,
                    isSpectator: isSpec
                  });else if (conn.open) conn.send({
                    type: 'PLAYERS_UPDATE',
                    players: nList
                  });
                });
                return nList;
              });
              showToast("\uD83D\uDC4B ".concat(m.pName || "玩家", " \u5DF2\u52A0\u5165\u5C0D\u5C40"));
            } else if (m.type === 'SYNC') {
              syncState(m.data, false);
              if (m.data.isBrawlMode && m.data.startTime) setMatchStartTime(m.data.startTime);
            } else if (m.type === 'PLAYERS_UPDATE') {
              if (m.players) setPlayersList(m.players);
            } else if (m.type === 'REQ_READY') {
              setPlayersList(function (prev) {
                var nList = prev.map(function (p) {
                  return p.id === m.targetId ? _objectSpread(_objectSpread({}, p), {}, {
                    isReady: true
                  }) : p;
                });
                connsRef.current.forEach(function (conn) {
                  if (conn.open) conn.send({
                    type: 'PLAYERS_UPDATE',
                    players: nList
                  });
                });
                return nList;
              });
            } else if (m.type === 'REQ_UNREADY') {
              setPlayersList(function (prev) {
                var nList = prev.map(function (p) {
                  return p.id === m.targetId ? _objectSpread(_objectSpread({}, p), {}, {
                    isReady: false
                  }) : p;
                });
                connsRef.current.forEach(function (conn) {
                  if (conn.open) conn.send({
                    type: 'PLAYERS_UPDATE',
                    players: nList
                  });
                });
                return nList;
              });
            } else if (m.type === 'REQ_PLAY_DIRECT') {
              if (isHostRef.current) generateAndSync(stateRef.current.sizeId, stateRef.current.diffId, undefined, true);
            } else if (m.type === 'REQ_PLAY_AGAIN') {
              if (isHostRef.current) generateAndSync(stateRef.current.sizeId, stateRef.current.diffId, undefined, false);
            } else if (m.type === 'REQ_COLOR_CHANGE') handlePlayerColorChange(m.targetId, m.color);else if (m.type === 'REQ_NAME_CHANGE') handlePlayerNameChange(m.targetId, m.name);else if (m.type === 'REQ_SPEC_TOGGLE') {
              setPlayersList(function (prev) {
                var nList = prev.map(function (p) {
                  if (p.id === m.targetId) {
                    var newState = m.forceState !== undefined && m.forceState !== null ? m.forceState : !p.isSpectator;
                    return _objectSpread(_objectSpread({}, p), {}, {
                      isSpectator: newState,
                      isLobbySpectator: m.isTemp ? p.isLobbySpectator : newState
                    });
                  }
                  return p;
                });
                connsRef.current.forEach(function (conn) {
                  if (conn.open) conn.send({
                    type: 'PLAYERS_UPDATE',
                    players: nList
                  });
                });
                return nList;
              });
            } else if (m.type === 'GHOST_I_WON') {
              if (isHostRef.current && handleBrawlWinRef.current) handleBrawlWinRef.current(m.winInfo);
            } else if (m.type === 'GHOST_SOLVED') {
              setGhostHints(function (prev) {
                var newHints = _objectSpread({}, prev);
                if (m.value === null || m.value === undefined) {
                  if (newHints[m.cellId]) {
                    var cellHints = _objectSpread({}, newHints[m.cellId]);
                    delete cellHints[m.uid];
                    newHints[m.cellId] = cellHints;
                  }
                } else {
                  newHints[m.cellId] = _objectSpread(_objectSpread({}, prev[m.cellId] || {}), {}, _defineProperty({}, m.uid, {
                    color: m.color,
                    value: m.value
                  }));
                }
                return newHints;
              });
              connsRef.current.forEach(function (conn) {
                if (conn.open && conn !== c) conn.send(m);
              });
            } else if (m.type === 'GHOST_WINNER') {
              setWinner(m.winner);
              if (m.winner.id === myId) setEndTime(Date.now());
            } else if (m.type === 'CURSOR') {
              setCursors(function (prev) {
                return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, m.uid, {
                  x: m.x,
                  y: m.y
                }));
              });
              connsRef.current.forEach(function (conn) {
                if (conn.open && conn !== c) conn.send(m);
              });
            } else if (m.type === 'CLICK') {
              setRipples(function (prev) {
                return [].concat(_toConsumableArray(prev), [{
                  id: Date.now() + Math.random(),
                  uid: m.uid,
                  x: m.x,
                  y: m.y,
                  timestamp: Date.now()
                }]);
              });
              connsRef.current.forEach(function (conn) {
                if (conn.open && conn !== c) conn.send(m);
              });
            } else if (m.type === 'REQ_REJOIN') connRef.current.send({
              type: 'JOIN',
              pName: myNameRef.current || "玩家",
              uid: myId,
              color: myColorRef.current
            });else if (m.type === 'RECEIVE_GIFT') {
              setUnopenedGifts(function (prev) {
                var q = prev[m.targetUid] || [];
                return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, m.targetUid, [].concat(_toConsumableArray(q), [m.senderUid || 'system'])));
              });
              connsRef.current.forEach(function (conn) {
                if (conn.open && conn !== c) conn.send(m);
              });
            } else if (m.type === 'GIFT_OPENED') {
              if (m.uid !== myId) {
                setUnopenedGifts(function (prev) {
                  var q = prev[m.uid] || [];
                  var nq = _toConsumableArray(q);
                  nq.shift();
                  return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, m.uid, nq));
                });
              }
              connsRef.current.forEach(function (conn) {
                if (conn.open && conn !== c) conn.send(m);
              });
            } else if (m.type === 'GIFT_COUNTER_ATTACK') {
              if (m.targetUid === myId) {
                if (handleReceiveCounterAttackRef.current) handleReceiveCounterAttackRef.current();
              }
              connsRef.current.forEach(function (conn) {
                if (conn.open && conn !== c) conn.send(m);
              });
            } else if (m.type === 'MILESTONE_REACHED') {
              if (handleMilestoneRef.current) handleMilestoneRef.current(m);
              connsRef.current.forEach(function (conn) {
                if (conn.open && conn !== c) conn.send(m);
              });
            } else if (m.type === 'RECEIVE_WEAPON') {
              if (handleReceiveWeaponRef.current) handleReceiveWeaponRef.current(m);
              connsRef.current.forEach(function (conn) {
                if (conn.open && conn !== c) conn.send(m);
              });
            } else if (m.type === 'WEAPON_HIT_FOG') {
              if (handleWeaponHitFogRef.current) handleWeaponHitFogRef.current(m);
              connsRef.current.forEach(function (conn) {
                if (conn.open && conn !== c) conn.send(m);
              });
            } else if (m.type === 'WEAPON_HIT_ERASE') {
              if (handleWeaponHitEraseRef.current) handleWeaponHitEraseRef.current(m);
              connsRef.current.forEach(function (conn) {
                if (conn.open && conn !== c) conn.send(m);
              });
            }
          });
          c.on('close', function () {
            if (c.uid) {
              setPlayersList(function (prev) {
                var newList = prev.filter(function (p) {
                  return p.id !== c.uid;
                });
                connsRef.current.forEach(function (conn) {
                  if (conn !== c && conn.open) conn.send({
                    type: 'PLAYERS_UPDATE',
                    players: newList
                  });
                });
                return newList;
              });
              showToast("👋 一位玩家已斷開連線");
            }
            connsRef.current = connsRef.current.filter(function (conn) {
              return conn !== c;
            });
          });
        });
        p.on('error', function (err) {
          if (err.type === 'unavailable-id') {
            showToast("⚠️ 房號已被佔用或正在釋放中，請稍候再試");
            setIsConnecting(false);
          }
        });
      });
    } else {
      var guestP = new Peer();
      peerRef.current = guestP;
      guestP.on('open', function (id) {
        setConnectionStatus("已啟動握手，建立加密通道...");
        var c = guestP.connect('yyh-tgsh-' + rId + '-host');
        connRef.current = c;
        c.on('open', function () {
          setConnectionStatus("已找到主機，同步遊戲資料中...");
          c.send({
            type: 'JOIN',
            pName: pName,
            uid: myId
          });
        });
        c.on('data', function (m) {
          if (m.type === 'INIT') {
            setConnectionStatus("同步完成，進入遊戲！");
            setRoomId(rId);
            setScreen('game');
            setIsHeaderCollapsed(false);
            setIsConnecting(false);
            // 強制立刻儲存一次，避開 syncState 的狀態更新延遲 (v3.8.15)
            saveLocalProgress(rId, myId, pName, false, m.data.isBrawlMode ? m.data.localCells : m.data.cells);
            syncState(m.data, false);
            setPlayersList(m.players);
            setIsSpectator(m.isSpectator);
          } else if (m.type === 'SYNC') {
            syncState(m.data, false);
            if (m.data.isBrawlMode && m.data.startTime) setMatchStartTime(m.data.startTime);
            // 客端收到同步後也立刻存檔備援 (v3.8.21)
            if (roomId && !isSpectator) {
              saveLocalProgress(roomId, myId, pName, false, m.data.isBrawlMode ? m.data.localCells : m.data.cells, m.data.sessionId || stateRef.current.sessionId, {
                solution: solutionGridRef.current,
                players: playersListRef.current,
                sizeId: m.data.sizeId,
                diffId: m.data.diffId,
                isBrawl: m.data.isBrawlMode,
                isGhost: m.data.isBrawlMode
              });
            }
          } else if (m.type === 'PLAYERS_UPDATE') {
            if (m.players) setPlayersList(m.players);
          } else if (m.type === 'GHOST_SOLVED') {
            setGhostHints(function (prev) {
              var newHints = _objectSpread({}, prev);
              if (m.value === null || m.value === undefined) {
                if (newHints[m.cellId]) {
                  var cellHints = _objectSpread({}, newHints[m.cellId]);
                  delete cellHints[m.uid];
                  newHints[m.cellId] = cellHints;
                }
              } else {
                newHints[m.cellId] = _objectSpread(_objectSpread({}, prev[m.cellId] || {}), {}, _defineProperty({}, m.uid, {
                  color: m.color,
                  value: m.value
                }));
              }
              return newHints;
            });
          } else if (m.type === 'GHOST_WINNER') {
            setWinner(m.winner);
            if (m.winner.id === myId) setEndTime(Date.now());
          } else if (m.type === 'CURSOR') setCursors(function (prev) {
            return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, m.uid, {
              x: m.x,
              y: m.y
            }));
          });else if (m.type === 'CLICK') setRipples(function (prev) {
            return [].concat(_toConsumableArray(prev), [{
              id: Date.now() + Math.random(),
              uid: m.uid,
              x: m.x,
              y: m.y,
              timestamp: Date.now()
            }]);
          });else if (m.type === 'JOIN_REJECTED') {
            setIsConnecting(false);
            showToast("⚠️ 無法加入：暱稱衝突");
          } else if (m.type === 'RECEIVE_GIFT') {
            setUnopenedGifts(function (prev) {
              var q = prev[m.targetUid] || [];
              return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, m.targetUid, [].concat(_toConsumableArray(q), [m.senderUid || 'system'])));
            });
          } else if (m.type === 'GIFT_OPENED') {
            if (m.uid !== myId) {
              setUnopenedGifts(function (prev) {
                var q = prev[m.uid] || [];
                var nq = _toConsumableArray(q);
                nq.shift();
                return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, m.uid, nq));
              });
            }
          } else if (m.type === 'GIFT_COUNTER_ATTACK') {
            if (m.targetUid === myId) {
              if (handleReceiveCounterAttackRef.current) handleReceiveCounterAttackRef.current();
            }
          } else if (m.type === 'RECEIVE_WEAPON') {
            if (handleReceiveWeaponRef.current) handleReceiveWeaponRef.current(m);
          } else if (m.type === 'WEAPON_HIT_FOG') {
            if (handleWeaponHitFogRef.current) handleWeaponHitFogRef.current(m);
          } else if (m.type === 'WEAPON_HIT_ERASE') {
            if (handleWeaponHitEraseRef.current) handleWeaponHitEraseRef.current(m);
          }
        });
        c.on('close', function () {
          if (window.__PLAT_PLATFORM) {
            showToast("⚠️ 與主機連線中斷");
            switchToOffline();
            if (window.__PLAT_NOTIFY) window.__PLAT_NOTIFY('host-gone');
            return;
          }
          var list = playersListRef.current;
          var others = list.filter(function (p) {
            return !p.isHost && !p.isSpectator;
          });
          if (others.length === 0) {
            showToast("⚠️ 與主機連線中斷，轉為單機模式");
            switchToOffline();
          } else {
            var nextHost = others[0];
            if (myId === nextHost.id) {
              showToast("👑 原主機離線，您已被自動提升為新房主！正在重組對局...");
              // 稍微延遲以確保 PeerID 已釋放
              setTimeout(function () {
                setupPeerJS(rId, pName, true);
              }, 1500);
            } else {
              showToast("\uD83D\uDCE1 \u4E3B\u6A5F\u96E2\u7DDA\uFF0C\u6B63\u5728\u7B49\u5F85 ".concat(nextHost.name, " \u63A5\u7BA1\u623F\u9593..."));
              // 其它玩家嘗試連回新房主
              setTimeout(function () {
                setupPeerJS(rId, pName, false);
              }, 5000);
            }
          }
        });
      });
      guestP.on('error', function (err) {
        setIsConnecting(false);
        if (err.type === 'peer-unavailable') showToast("⚠️ 找不到對應房號，主機可能已離線");else showToast("⚠️ 連線發生錯誤：" + err.type);
      });
    }
  };
  var renderHostGodView = function renderHostGodView() {
    var activePlayers = playersList.filter(function (p) {
      return !p.isSpectator;
    });
    if (activePlayers.length === 0) return /*#__PURE__*/React.createElement("div", {
      className: "text-slate-500 text-2xl font-black flex items-center justify-center flex-1"
    }, "\u7B49\u5F85\u73A9\u5BB6\u52A0\u5165...");
    return /*#__PURE__*/React.createElement("div", {
      className: "w-full h-full p-2 md:p-4 overflow-y-auto bg-slate-900 border-t-4 border-slate-800 grid gap-2 md:gap-4 auto-rows-max",
      style: {
        gridTemplateColumns: "repeat(auto-fit, minmax(".concat(Math.min(300, Math.max(150, 600 / Math.max(1, Math.ceil(activePlayers.length / 2)))), "px, 1fr))")
      }
    }, activePlayers.map(function (p) {
      var size = cSizeDef.size;
      var pw = size * 22;
      return /*#__PURE__*/React.createElement("div", {
        key: p.id,
        className: "flex flex-col items-center bg-slate-800 rounded-lg p-2 border-[3px] shadow-[4px_4px_0px_rgba(0,0,0,0.5)]",
        style: {
          borderColor: p.color === 'rainbow' ? '#ffcc00' : p.color
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-white font-black mb-2 flex items-center gap-2 text-sm uppercase tracking-wider"
      }, /*#__PURE__*/React.createElement("span", {
        className: "w-3 h-3 rounded-full shadow-inner",
        style: {
          background: p.color === 'rainbow' ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)' : p.color
        }
      }), p.name, " ", p.isHost && '👑', stateRef.current.brawlWinners.some(function (w) {
        return w.id === p.id;
      }) && /*#__PURE__*/React.createElement("span", {
        className: "ml-1 text-[10px] bg-yellow-400 text-slate-800 px-1.5 py-0.5 rounded font-black shadow-[1px_1px_0px_#000]"
      }, "\u5DF2\u5B8C\u6210")), /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 ".concat(pw, " ").concat(pw),
        className: "w-full h-auto max-w-[400px]",
        style: {
          aspectRatio: '1/1',
          background: '#1e293b',
          borderRadius: '4px'
        }
      }, cells.map(function (cell) {
        var cx = cell.x * 22;
        var cy = cell.y * 22;
        var isFilled = false;
        var color = "rgba(255,255,255,0.05)";
        var val = "";
        if (cell.isGiven || cell.isSystemRevealed) {
          isFilled = true;
          color = "#475569";
          val = cell.value;
        } else if (ghostHints[cell.id] && ghostHints[cell.id][p.id]) {
          isFilled = true;
          var hint = ghostHints[cell.id][p.id];
          color = _typeof(hint) === 'object' ? hint.color : hint;
          val = _typeof(hint) === 'object' ? hint.value : "";
        }
        return /*#__PURE__*/React.createElement("g", {
          key: cell.id
        }, /*#__PURE__*/React.createElement("rect", {
          x: cx + 1,
          y: cy + 1,
          width: "20",
          height: "20",
          fill: color,
          fillOpacity: isFilled && (cell.isGiven || cell.isSystemRevealed || brawlSettings.showNumbersInGodMode) ? "0.3" : "1",
          rx: "2"
        }), isFilled && (cell.isGiven || cell.isSystemRevealed || brawlSettings.showNumbersInGodMode) && /*#__PURE__*/React.createElement("text", {
          x: cx + 11,
          y: cy + 15,
          textAnchor: "middle",
          fill: "white",
          className: "font-black",
          style: {
            fontSize: '12px'
          }
        }, val));
      }), Array.from({
        length: size + 1
      }).map(function (_, i) {
        var isThickX = i % cSizeDef.boxW === 0;
        var isThickY = i % cSizeDef.boxH === 0;
        return /*#__PURE__*/React.createElement("g", {
          key: "god-grid-".concat(i),
          className: "pointer-events-none"
        }, /*#__PURE__*/React.createElement("line", {
          x1: i * 22,
          y1: 0,
          x2: i * 22,
          y2: pw,
          stroke: "#94a3b8",
          strokeWidth: isThickX ? 2 : 0.5,
          strokeOpacity: isThickX ? 1 : 0.3,
          strokeLinecap: isThickX ? 'square' : 'butt'
        }), /*#__PURE__*/React.createElement("line", {
          x1: 0,
          y1: i * 22,
          x2: pw,
          y2: i * 22,
          stroke: "#94a3b8",
          strokeWidth: isThickY ? 2 : 0.5,
          strokeOpacity: isThickY ? 1 : 0.3,
          strokeLinecap: isThickY ? 'square' : 'butt'
        }));
      })));
    }));
  };

  // ==========================================
  // 新增：連線狀態蓋板 (v3.8.14)
  // ==========================================
  if (isConnecting) {
    return /*#__PURE__*/React.createElement("div", {
      className: "fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-[#fffaf0] p-8 rounded-3xl border-4 border-slate-800 shadow-[10px_10px_0px_rgba(30,41,59,1)] text-center max-sm w-full transform rotate-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "relative w-20 h-20 mx-auto mb-8"
    }, /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-0 border-8 border-slate-200 rounded-full"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-0 border-8 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-0 flex items-center justify-center text-3xl"
    }, "\uD83D\uDCE1")), /*#__PURE__*/React.createElement("h2", {
      className: "text-2xl font-black text-slate-800 mb-2"
    }, "\u6B63\u5728\u5EFA\u7ACB\u901A\u8A0A..."), /*#__PURE__*/React.createElement("p", {
      className: "text-slate-600 font-bold mb-8 h-12 flex items-center justify-center leading-relaxed"
    }, connectionStatus || "初始化連線模組中..."), /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, showCancelButton ? /*#__PURE__*/React.createElement("button", {
      onClick: cancelConnection,
      className: "w-full py-4 bg-red-500 text-white border-4 border-slate-800 rounded-xl font-black shadow-[4px_4px_0px_#1e293b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all animate-bounce"
    }, "\u274C \u53D6\u6D88\u9023\u7DDA\u4E26\u8FD4\u56DE") : /*#__PURE__*/React.createElement("div", {
      className: "py-4 text-slate-400 font-bold text-sm animate-pulse italic"
    }, "\u8ACB\u7A0D\u5019\uFF0C\u6B63\u52AA\u529B\u5C0B\u627E\u4E3B\u6A5F\u4E2D..."), /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest"
    }, "Connection ID: ", myId.substring(0, 6)))));
  }
  var tutorialOverlay = showTutorial ? /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4",
    onClick: function onClick() {
      return setShowTutorial(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#fffaf0] border-4 border-slate-800 rounded-2xl shadow-[10px_10px_0px_rgba(30,41,59,1)] max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 relative",
    onClick: function onClick(e) {
      return e.stopPropagation();
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowTutorial(false);
    },
    className: "absolute top-3 right-3 w-9 h-9 bg-white border-[3px] border-slate-800 rounded-full font-black shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[1px] active:shadow-none z-10"
  }, "\u2715"), /*#__PURE__*/React.createElement("h3", {
    className: "text-2xl font-black text-slate-800 border-b-4 border-[#ffcc00] inline-block pb-1 mb-5"
  }, "\u2753 \u73A9\u6CD5\u6559\u5B78"), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-[3px] border-slate-800 rounded-xl p-4 mb-4 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-center mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 border-[3px] border-slate-800 rounded-lg overflow-hidden w-40"
  }, ['5', '', '', '', null, '3', '', '', ''].map(function (v, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "relative aspect-square flex items-center justify-center font-black text-xl border border-slate-300 " + (v === null ? 'tut-target bg-amber-50' : 'bg-white text-slate-800')
    }, v === null ? /*#__PURE__*/React.createElement("span", {
      className: "tut-key-num text-emerald-600"
    }, "8") : v);
  }))), /*#__PURE__*/React.createElement("p", {
    className: "text-center font-black text-slate-700"
  }, "\u9EDE\u4E00\u683C\uFF0C\u518D\u6309\u4E0B\u9762\u7684\u6578\u5B57\u9375\u586B\u5165")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-[3px] border-slate-800 rounded-xl p-4 mb-4 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-center mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative w-20 h-20 border-[3px] border-slate-800 rounded-lg bg-white"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tut-draft-a absolute top-1 left-2 font-black text-slate-400 text-lg"
  }, "2"), /*#__PURE__*/React.createElement("span", {
    className: "tut-draft-b absolute bottom-1 right-2 font-black text-slate-400 text-lg"
  }, "7"), /*#__PURE__*/React.createElement("span", {
    className: "absolute -bottom-3 -right-3 text-2xl"
  }, "\u270F\uFE0F"))), /*#__PURE__*/React.createElement("p", {
    className: "text-center font-black text-slate-700"
  }, "\u9084\u4E0D\u78BA\u5B9A\uFF1F\u5148\u958B\u7B46\u8A18\uFF0C\u628A\u53EF\u80FD\u7684\u6578\u5B57\u8A18\u4E0B\u4F86")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-[3px] border-slate-800 rounded-xl p-4 mb-4 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-center mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex border-[3px] border-slate-800 rounded-lg overflow-hidden"
  }, [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) {
    return /*#__PURE__*/React.createElement("div", {
      key: n,
      className: "tut-row-cell w-8 h-8 md:w-9 md:h-9 flex items-center justify-center font-black border-r border-slate-300 last:border-r-0",
      style: {
        animationDelay: n * 0.28 + 's'
      }
    }, n);
  }))), /*#__PURE__*/React.createElement("p", {
    className: "text-center font-black text-slate-700"
  }, "\u6BCF\u4E00\u884C\u3001\u6BCF\u4E00\u5217\u3001\u6BCF\u500B 3\xD73 \u5BAE\uFF0C1~9 \u90FD\u4E0D\u80FD\u91CD\u8907")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-[3px] border-slate-800 rounded-xl p-4 mb-5 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-center gap-2 mb-3 flex-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "px-3 py-2 bg-[#ffcc00] border-[3px] border-slate-800 rounded-xl font-black text-sm shadow-[2px_2px_0px_rgba(30,41,59,1)]"
  }, "\uD83D\uDD22 \u5148\u9EDE\u6578\u5B57 \u2192 \u518D\u9EDE\u683C\u5B50"), /*#__PURE__*/React.createElement("span", {
    className: "px-3 py-2 bg-sky-300 border-[3px] border-slate-800 rounded-xl font-black text-sm shadow-[2px_2px_0px_rgba(30,41,59,1)]"
  }, "\uD83D\uDC46 \u5148\u9EDE\u683C\u5B50 \u2192 \u518D\u9EDE\u6578\u5B57")), /*#__PURE__*/React.createElement("p", {
    className: "text-center font-black text-slate-700"
  }, "\u8F38\u5165\u65B9\u5F0F\u81EA\u5DF1\u9078\uFF0C\u904A\u6232\u4E2D\u5728\u76E4\u9762\u4E0B\u65B9\u96A8\u6642\u5207\u63DB")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowTutorial(false);
    },
    className: "w-full py-3.5 bg-[#ffcc00] border-4 border-slate-800 rounded-xl font-black text-lg shadow-[4px_4px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none transition-all"
  }, "\u77E5\u9053\u4E86\uFF0C\u958B\u59CB\u73A9\uFF01"))) : null;
  if (screen === 'home') {
    return /*#__PURE__*/React.createElement("div", {
      className: "h-screen w-screen flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fadeIn"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex-1 flex flex-col justify-center w-full max-w-md items-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-[#fffaf0] border-4 border-slate-800 p-10 rounded-xl shadow-[8px_8px_0px_rgba(30,41,59,1)] w-full text-center relative transform -rotate-1 z-10"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "text-6xl font-black text-slate-800 mb-6 tracking-widest flex justify-center gap-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "inline-block bg-[#ffcc00] px-4 py-2 border-4 border-slate-800 rounded-xl transform rotate-3 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
    }, "\u6578"), /*#__PURE__*/React.createElement("span", {
      className: "inline-block bg-[#ffcc00] px-4 py-2 border-4 border-slate-800 rounded-xl transform -rotate-2 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
    }, "\u7368")), /*#__PURE__*/React.createElement("div", {
      className: "inline-block border-[3px] border-dashed border-slate-800 rounded-xl px-6 py-2 mb-8 bg-white shadow-[4px_4px_0px_rgba(30,41,59,1)] transform rotate-2"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-slate-800 font-black text-xl tracking-widest uppercase italic"
    }, "Sudoku Master")), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-5"
    }, function () {
      var last = null;
      try {
        last = JSON.parse(localStorage.getItem('sudoku_last_session') || 'null');
      } catch (e) {
        last = null;
      }
      if (last && Date.now() - last.time < 3600000 * 24) {
        var disabled = lastSessionAlive === false;
        return /*#__PURE__*/React.createElement("button", {
          disabled: disabled || lastSessionAlive === null,
          onClick: function onClick() {
            setTempPlayerName(last.name || "");
            setTempRoomId(last.rid);
            myNameRef.current = last.name;
            setEngine('peerjs');
            engineRef.current = 'peerjs';
            setIsConnecting(true);
            setConnectionStatus("🔍 正在尋找原房主...");
            setupPeerJS(last.rid, last.name, false);
          },
          className: "w-full py-4 border-4 border-slate-800 rounded-xl font-black text-xl shadow-[4px_4px_0px_rgba(30,41,59,1)] transition-all ".concat(disabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none grayscale' : 'bg-amber-400 text-slate-900 animate-pulse hover:translate-x-[2px] hover:translate-y-[2px]')
        }, lastSessionAlive === null ? "⏳ 正在檢查連線..." : disabled ? "\uD83D\uDEAB \u623F\u9593\u5DF2\u5931\u6548 (".concat(last.rid, ")") : "\uD83D\uDD04 \u6062\u5FA9\u4E0A\u6B21\u5C0D\u5C40 (".concat(last.rid, ")"));
      }
      return null;
    }(), /*#__PURE__*/React.createElement("button", {
      onClick: startSinglePlayer,
      className: "w-full py-4 bg-white border-4 border-slate-800 rounded-xl font-black text-xl text-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all transform rotate-1"
    }, "\uD83D\uDC64 \u55AE\u6A5F\u6311\u6230"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setScreen('join');
      },
      className: "w-full py-4 bg-emerald-400 border-4 border-slate-800 rounded-xl font-black text-xl text-slate-900 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all transform -rotate-1"
    }, "\uD83C\uDF10 \u591A\u4EBA\u9023\u7DDA"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return startDailyGame(dailyPickDate);
      },
      className: "w-full py-4 bg-[#ffcc00] border-4 border-slate-800 rounded-xl font-black text-xl text-slate-900 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all transform rotate-1"
    }, "\uD83D\uDCC5 \u6BCF\u65E5\u4E00\u984C", dailyPickDate !== dailyTodayStr() ? '（' + dailyPickDate.slice(5) + '）' : '', dailyRecords[dailyPickDate] ? ' ✓' : ''), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-center gap-2 flex-wrap"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setDailyPickDate(shiftDateStr(dailyPickDate, -1));
      },
      disabled: dailyPickDate <= '2026-01-01',
      className: "w-9 h-9 bg-white border-[3px] border-slate-800 rounded-lg font-black shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[1px] active:shadow-none disabled:opacity-30"
    }, "\u25C0"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      min: "2026-01-01",
      max: dailyTodayStr(),
      value: dailyPickDate,
      onChange: function onChange(e) {
        if (e.target.value) setDailyPickDate(e.target.value);
      },
      className: "border-[3px] border-slate-800 rounded-lg px-2 py-1.5 font-black bg-white text-sm outline-none"
    }), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setDailyPickDate(shiftDateStr(dailyPickDate, 1));
      },
      disabled: dailyPickDate >= dailyTodayStr(),
      className: "w-9 h-9 bg-white border-[3px] border-slate-800 rounded-lg font-black shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[1px] active:shadow-none disabled:opacity-30"
    }, "\u25B6"), /*#__PURE__*/React.createElement("span", {
      className: "font-black text-sm text-orange-600"
    }, "\uD83D\uDD25 \u9023\u7E8C ", dailyStreak.count || 0, " \u5929"), dailyRecords[dailyPickDate] ? /*#__PURE__*/React.createElement("span", {
      className: "font-black text-sm text-emerald-600"
    }, "\u6700\u4F73 ", formatTime(dailyRecords[dailyPickDate])) : null), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setShowTutorial(true);
      },
      className: "w-full py-4 bg-white border-4 border-slate-800 rounded-xl font-black text-xl text-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all transform -rotate-1"
    }, "\u2753 \u73A9\u6CD5\u6559\u5B78")))), /*#__PURE__*/React.createElement("div", {
      className: "shrink-0 pb-4 text-slate-800 font-black text-sm opacity-60 tracking-wider z-10"
    }, "Copyright \xA9 2026 \u8449\u5927\u5E25. All rights reserved. (v3.13.4)"), tutorialOverlay);
  }
  if (screen === 'join') {
    return /*#__PURE__*/React.createElement("div", {
      className: "h-screen w-screen flex flex-col items-center justify-center p-4 relative animate-fadeIn"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-[#fffaf0] border-4 border-slate-800 p-8 rounded-xl shadow-[10px_10px_0px_rgba(30,41,59,1)] max-w-2xl w-full z-10 transform rotate-1"
    }, /*#__PURE__*/React.createElement("h2", {
      onClick: function onClick() {
        var nc = titleClicks + 1;
        if (nc >= 3) {
          setStableMode(!stableMode);
          setTitleClicks(0);
        } else setTitleClicks(nc);
      },
      className: "text-2xl font-black text-slate-800 mb-6 inline-block border-b-4 border-[#ffcc00] pb-1 cursor-pointer select-none"
    }, "\uD83C\uDF10 \u591A\u4EBA\u9023\u7DDA\u9078\u55AE"), setupStep === 'entry' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-4"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setSetupStep('create');
      },
      className: "bg-blue-500 text-white border-4 border-slate-800 rounded-xl p-6 shadow-[6px_6px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all text-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-black text-2xl mb-1"
    }, "\uD83C\uDFE0 \u5EFA\u7ACB\u623F\u9593"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold opacity-90 leading-relaxed"
    }, "\u4F60\u662F\u623F\u4E3B\uFF01\u4EE3\u78BC\u56FA\u5B9A\u4E0D\u8B8A\uFF0C\u670B\u53CB\u7528\u540C\u4E00\u7D44\u4EE3\u78BC\u52A0\u5165")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setSetupStep('join');
      },
      className: "bg-emerald-400 text-slate-900 border-4 border-slate-800 rounded-xl p-6 shadow-[6px_6px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all text-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-black text-2xl mb-1"
    }, "\uD83D\uDEAA \u52A0\u5165\u623F\u9593"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold opacity-80 leading-relaxed"
    }, "\u8F38\u5165\u670B\u53CB\u7D66\u4F60\u7684 4 \u4F4D\u6578\u4EE3\u78BC"))), /*#__PURE__*/React.createElement("p", {
      className: "mt-5 text-sm font-bold text-slate-400 text-center"
    }, "\u8DDF\u670B\u53CB\u7D04\u597D\uFF0C\u4E00\u500B\u4EBA\u5EFA\u7ACB\u623F\u9593\u3001\u5176\u4ED6\u4EBA\u8F38\u5165\u623F\u865F\u52A0\u5165")), setupStep !== 'entry' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setSetupStep('entry');
      },
      disabled: isConnecting,
      className: "mb-4 font-bold text-slate-400 hover:text-slate-800 hover:underline disabled:opacity-50"
    }, "\u2190 \u8FD4\u56DE"), /*#__PURE__*/React.createElement("div", {
      className: "mb-6 bg-white p-4 rounded-lg border-2 border-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)]"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-slate-800 font-black text-sm mb-2"
    }, "\u8A2D\u5B9A\u986F\u793A\u66B1\u7A31"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: "\u4F8B\u5982\uFF1A\u738B\u5C0F\u660E",
      value: tempPlayerName,
      onChange: function onChange(e) {
        return setTempPlayerName(e.target.value);
      },
      disabled: isConnecting,
      className: "w-full border-2 border-slate-800 rounded-md p-3 font-bold bg-yellow-50 outline-none focus:ring-2 ring-[#ffcc00] disabled:opacity-50"
    })), setupStep === 'create' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "font-black text-lg mb-2 flex items-center gap-2 text-slate-800"
    }, "\uD83D\uDC51 \u5EFA\u7ACB\u5C0D\u5C40\u5927\u5EF3"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs text-slate-600 mb-4 font-bold leading-relaxed"
    }, /*#__PURE__*/React.createElement("p", null, "\u64D4\u4EFB\u5C0D\u5C40\u4E3B\u6A5F\uFF0C\u7CFB\u7D71\u6703\u81EA\u52D5\u5206\u6D3E\u9080\u8ACB\u78BC\u3002", /*#__PURE__*/React.createElement("br", null), "\u5EFA\u7ACB\u5F8C\u53EF\u96A8\u6642\u65BC\u4E0A\u65B9\u9078\u55AE\u5207\u63DB\u300C\u5408\u4F5C/\u5927\u4E82\u9B25\u300D\u6A21\u5F0F\u3002")), stableMode && /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-black text-emerald-600 mb-2 animate-pulse"
    }, "\u2713 \u96F2\u7AEF\u6A21\u5F0F\u6E96\u5099\u5C31\u7DD2"), /*#__PURE__*/React.createElement("button", {
      onClick: initiateHostGame,
      disabled: isConnecting,
      className: "w-full py-3 bg-blue-500 text-white border-4 border-slate-800 rounded-xl font-black shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
    }, isConnecting ? "生成中..." : "發起對戰")), setupStep === 'join' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "font-black text-lg mb-2 flex items-center gap-2 text-slate-800"
    }, "\uD83D\uDC64 \u53C3\u8207\u73FE\u6709\u5C0D\u5C40"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-slate-600 mb-2 font-bold leading-relaxed"
    }, "\u8ACB\u8F38\u5165\u4E3B\u6A5F\u5206\u6D3E\u7684 4 \u78BC\u9080\u8ACB\u78BC\uFF1A"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      maxLength: "5",
      placeholder: "\u9080\u8ACB\u78BC",
      value: tempRoomId,
      onChange: function onChange(e) {
        return setTempRoomId(e.target.value.toUpperCase());
      },
      disabled: isConnecting,
      className: "w-full border-4 border-slate-800 rounded-xl p-3 font-black text-center text-2xl mb-4 tracking-widest outline-none bg-emerald-50 uppercase shadow-[4px_4px_0px_rgba(30,41,59,1)] disabled:opacity-50"
    }), /*#__PURE__*/React.createElement("button", {
      onClick: joinExistingGame,
      disabled: isConnecting,
      className: "w-full py-3 bg-emerald-400 text-slate-900 border-4 border-slate-800 rounded-xl font-black shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
    }, isConnecting ? "加入中..." : "參與連線"))), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setSetupStep('entry');
        setScreen('home');
      },
      disabled: isConnecting,
      className: "mt-8 w-full text-slate-400 font-bold hover:text-slate-800 hover:underline text-center transition-colors disabled:opacity-50"
    }, "\u53D6\u6D88\u8FD4\u56DE\u4E3B\u9078\u55AE")), toastMsg && /*#__PURE__*/React.createElement("div", {
      className: "fixed top-10 left-1/2 transform -translate-x-1/2 bg-white text-slate-800 px-6 py-3 rounded-xl border-[3px] border-slate-800 font-black shadow-[4px_4px_0px_rgba(30,41,59,1)] z-[100] animate-slideUpFade flex items-center justify-center gap-2 whitespace-pre-line text-center"
    }, toastMsg));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "h-screen w-screen p-1 md:p-2 flex flex-col items-center font-sans relative",
    style: {
      backgroundColor: '#fdf5e6',
      backgroundImage: 'radial-gradient(#d3c5ab 2px, transparent 2px)',
      backgroundSize: '12px 12px'
    }
  }, matchPhase === 'waiting' && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 z-[65] flex items-center justify-center bg-slate-900/80 backdrop-blur-md pointer-events-auto p-4 overflow-y-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#fffaf0] rounded-2xl p-6 md:p-8 border-4 border-slate-800 shadow-[10px_10px_0px_rgba(30,41,59,1)] text-center min-w-[320px] max-w-xl w-full my-auto animate-bounceIn"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl font-black text-slate-800 mb-2 tracking-widest"
  }, engine === 'local' ? "🧩 單機挑戰設定" : "🎮 遊戲大廳"), engine === 'local' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-6 mb-8 text-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-[3px] border-slate-800 rounded-2xl p-5 shadow-[4px_4px_0px_#1e293b] transform rotate-1"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-black text-slate-400 text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2 h-2 bg-amber-400 rounded-full animate-pulse"
  }), " \uD83D\uDCD0 \u9078\u64C7\u7248\u578B"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, SIZES.map(function (s) {
    return /*#__PURE__*/React.createElement("button", {
      key: s.id,
      onClick: function onClick() {
        return setSizeId(s.id);
      },
      className: "py-3 border-2 border-slate-800 rounded-xl font-black text-sm transition-all " + (sizeId === s.id ? 'bg-[#ffcc00] text-slate-900 shadow-[3px_3px_0px_#1e293b] -translate-y-0.5' : 'bg-slate-50 text-slate-400 hover:bg-white')
    }, s.name);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-[3px] border-slate-800 rounded-2xl p-5 shadow-[4px_4px_0px_#1e293b] transform -rotate-1"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-black text-slate-400 text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
  }), " \uD83D\uDD25 \u6311\u6230\u96E3\u5EA6"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, DIFFICULTIES.map(function (d) {
    return /*#__PURE__*/React.createElement("button", {
      key: d.id,
      onClick: function onClick() {
        return setDiffId(d.id);
      },
      className: "py-3 border-2 border-slate-800 rounded-xl font-black text-sm transition-all " + (diffId === d.id ? 'bg-[#ffcc00] text-slate-900 shadow-[3px_3px_0px_#1e293b] -translate-y-0.5' : 'bg-slate-50 text-slate-400 hover:bg-white')
    }, d.name);
  })))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      generateAndSync(sizeId, diffId);
      setMatchPhase('playing');
    },
    className: "w-full py-5 bg-emerald-400 text-slate-900 border-4 border-slate-800 rounded-2xl font-black shadow-[6px_6px_0px_rgba(30,41,59,1)] text-2xl hover:translate-y-[2px] hover:shadow-none transition-all active:scale-[0.98]"
  }, "\uD83D\uDE80 \u958B\u59CB\u6311\u6230")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "mb-4 text-slate-600 font-bold flex items-center justify-center gap-4"
  }, /*#__PURE__*/React.createElement("span", null, "\u623F\u9593\u4EE3\u78BC: ", /*#__PURE__*/React.createElement("span", {
    className: "bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded shadow-sm select-all"
  }, roomId)), isHostRef.current && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var list = playersListRef.current;
      connsRef.current.forEach(function (conn) {
        if (conn.open) conn.send({
          type: 'PLAYERS_UPDATE',
          players: list
        });
      });
      showToast("🔄 已向所有玩家重新廣播名單");
    },
    className: "text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded border border-slate-400 font-bold shadow-sm transition-colors"
  }, "\uD83D\uDD04 \u91CD\u6574\u540D\u55AE")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-[3px] border-slate-800 rounded-xl p-4 mb-6 shadow-[4px_4px_0px_#1e293b] flex flex-col gap-3 text-left"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-black border-b-2 border-slate-100 pb-2 mb-1 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "\u2699\uFE0F \u5C0D\u5C40\u8A2D\u5B9A"), isHostRef.current && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowBrawlSettings(true);
    },
    className: "bg-slate-700 text-white px-3 py-1 rounded border-2 border-slate-800 font-black text-sm shadow-[2px_2px_0px_#1e293b] hover:translate-y-[1px] hover:shadow-none transition-all"
  }, "\u904A\u6232\u8A2D\u5B9A")), isHostRef.current ? /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 items-center mb-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-slate-500 w-12 text-sm"
  }, "\u6A21\u5F0F"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (isBrawlMode) generateAndSync(sizeId, diffId, 'coop');
    },
    className: "flex-1 min-w-[70px] px-2 py-2 rounded-lg border-2 border-slate-800 font-black text-sm transition-all " + (!isBrawlMode ? 'bg-[#ffcc00] text-slate-900 shadow-[2px_2px_0px_#1e293b]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')
  }, "\uD83E\uDD1D \u5408\u4F5C\u6A21\u5F0F"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (!isBrawlMode) generateAndSync(sizeId, diffId, 'brawl');
    },
    className: "flex-1 min-w-[70px] px-2 py-2 rounded-lg border-2 border-slate-800 font-black text-sm transition-all " + (isBrawlMode ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#1e293b]' : 'bg-slate-50 text-slate-400 hover:bg-white')
  }, "\u2694\uFE0F \u5927\u4E82\u9B25\u6A21\u5F0F")) : /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-slate-500 text-sm"
  }, "\u7576\u524D\u6A21\u5F0F"), /*#__PURE__*/React.createElement("span", {
    className: "font-black text-slate-800"
  }, isBrawlMode ? '⚔️ 亂鬥模式' : '🤝 合作模式')), isHostRef.current ? /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 font-bold text-slate-600 text-sm mt-2"
  }, /*#__PURE__*/React.createElement("select", {
    value: sizeId,
    onChange: function onChange(e) {
      var newS = Number(e.target.value);
      setSizeId(newS);
      generateAndSync(newS, diffId, isBrawlMode ? 'brawl' : 'coop');
    },
    className: "flex-1 bg-white border-2 border-slate-800 rounded p-1 shadow-[2px_2px_0px_#1e293b] outline-none"
  }, SIZES.map(function (s) {
    return /*#__PURE__*/React.createElement("option", {
      key: s.id,
      value: s.id
    }, s.name);
  })), /*#__PURE__*/React.createElement("select", {
    value: diffId,
    onChange: function onChange(e) {
      var newD = e.target.value;
      setDiffId(newD);
      generateAndSync(sizeId, newD, isBrawlMode ? 'brawl' : 'coop');
    },
    className: "flex-1 bg-white border-2 border-slate-800 rounded p-1 shadow-[2px_2px_0px_#1e293b] outline-none"
  }, DIFFICULTIES.map(function (d) {
    return /*#__PURE__*/React.createElement("option", {
      key: d.id,
      value: d.id
    }, d.name);
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between font-bold text-slate-600 text-sm mt-1"
  }, /*#__PURE__*/React.createElement("span", null, "\u7248\u578B\uFF1A", (SIZES.find(function (s) {
    return s.id === sizeId;
  }) || {}).name), /*#__PURE__*/React.createElement("span", null, "\u96E3\u5EA6\uFF1A", (DIFFICULTIES.find(function (d) {
    return d.id === diffId;
  }) || {}).name))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2 mb-6 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar"
  }, playersList.map(function (p) {
    var canEdit = p.id === myId || isHostRef.current;
    var isPOnline = p.isHost || connsRef.current.some(function (c) {
      return c.uid === p.id && c.open;
    });
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      className: "flex justify-between items-center bg-white p-3 rounded-xl border-2 border-slate-800 shadow-sm shrink-0 " + (canEdit ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''),
      onClick: function onClick() {
        if (canEdit) {
          setEditName(p.name);
          setColorPickerTarget(p.id);
        }
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-bold text-slate-700 text-base flex items-center gap-2 truncate"
    }, /*#__PURE__*/React.createElement("div", {
      className: "relative shrink-0"
    }, /*#__PURE__*/React.createElement("span", {
      className: "w-4 h-4 rounded-full inline-block border-2 border-slate-800 shadow-inner",
      style: {
        background: p.color === 'rainbow' ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)' : p.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-white " + (isPOnline ? 'bg-green-500' : 'bg-slate-300')
    })), /*#__PURE__*/React.createElement("span", {
      className: "truncate"
    }, p.name, " ", p.id === myId && '(你)', " ", p.isHost && '👑')), /*#__PURE__*/React.createElement("span", {
      className: "font-black text-[10px] shrink-0 ml-2 flex gap-1"
    }, canEdit && isBrawlMode && /*#__PURE__*/React.createElement("div", {
      onClick: function onClick(e) {
        e.stopPropagation();
        toggleSpectator(p.id);
      },
      className: "flex items-center gap-1 cursor-pointer select-none"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-black transition-colors duration-200 " + (!p.isSpectator ? "text-slate-700" : "text-slate-400")
    }, !p.isSpectator ? "🎮 參賽" : "👁️ 上帝"), /*#__PURE__*/React.createElement("div", {
      className: "w-10 h-5 rounded-full border-2 border-slate-800 transition-colors duration-200 relative shadow-inner " + (!p.isSpectator ? "bg-emerald-400" : "bg-slate-300")
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-3.5 h-3.5 bg-white rounded-full border-2 border-slate-800 absolute top-[1px] transition-transform duration-200 " + (!p.isSpectator ? "left-[18px]" : "left-[1px]")
    }))), p.isReady && /*#__PURE__*/React.createElement("span", {
      className: "text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded border-2 border-emerald-600"
    }, "\u2714 \u5DF2\u6E96\u5099")));
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleReady,
    className: "flex-1 py-4 border-4 border-slate-800 rounded-xl font-black text-xl shadow-[4px_4px_0px_rgba(30,41,59,1)] transition-all " + ((playersList.find(function (p) {
      return p.id === myId;
    }) || {}).isReady ? 'bg-amber-400 text-slate-900' : 'bg-white text-slate-800')
  }, (playersList.find(function (p) {
    return p.id === myId;
  }) || {}).isReady ? '✅ 已準備' : '✋ 準備好了'), isHost && /*#__PURE__*/React.createElement("div", {
    className: "flex-[0.5] flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleForceStart,
    className: "w-full py-4 bg-red-500 text-white border-4 border-slate-800 rounded-xl font-black text-lg shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-none transition-all",
    title: "\u7121\u8996\u6E96\u5099\u72C0\u614B\u76F4\u63A5\u958B\u59CB"
  }, "\u26A1 \u5F37\u5236\u958B\u59CB")))))), countdownValue !== null && !isGenerating && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 z-[65] flex items-center justify-center bg-slate-900/50 backdrop-blur-md pointer-events-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[12rem] font-black text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,0.8)] animate-pulse",
    style: {
      textShadow: '6px 6px 0 #fff, -6px -6px 0 #fff, 6px -6px 0 #fff, -6px 6px 0 #fff'
    }
  }, countdownValue)), showSetupModal && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md pointer-events-auto animate-fadeIn p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#fffdfa] rounded-2xl p-6 border-[4px] border-[#2d2a26] shadow-[8px_8px_0px_#2d2a26] relative flex flex-col gap-4 min-w-[300px] max-w-sm w-full mx-auto my-auto animate-popUpCenter"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-black mb-2 border-b-4 border-[#ffcc00] inline-block pb-1"
  }, "\u2699\uFE0F \u8A2D\u5B9A\u984C\u578B\u8207\u96E3\u5EA6"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold text-slate-600 mb-1"
  }, "\u76E4\u9762\u5C3A\u5BF8\uFF1A"), /*#__PURE__*/React.createElement("select", {
    value: tempSizeId,
    onChange: function onChange(e) {
      return setTempSizeId(parseInt(e.target.value));
    },
    className: "w-full px-3 py-2 rounded-xl border-2 border-slate-800 font-bold bg-white text-slate-800 outline-none shadow-[2px_2px_0px_#2d2a26] cursor-pointer"
  }, SIZES.map(function (s) {
    return /*#__PURE__*/React.createElement("option", {
      key: s.id,
      value: s.id
    }, s.name);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mb-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold text-slate-600 mb-1"
  }, "\u904A\u6232\u96E3\u5EA6\uFF1A"), /*#__PURE__*/React.createElement("select", {
    value: tempDiffId,
    onChange: function onChange(e) {
      return setTempDiffId(e.target.value);
    },
    className: "w-full px-3 py-2 rounded-xl border-2 border-slate-800 font-bold bg-white text-slate-800 outline-none shadow-[2px_2px_0px_#2d2a26] cursor-pointer"
  }, DIFFICULTIES.map(function (d) {
    return /*#__PURE__*/React.createElement("option", {
      key: d.id,
      value: d.id
    }, d.name);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-3 mt-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowSetupModal(false);
    },
    className: "flex-1 py-3 bg-white border-2 border-slate-800 rounded-xl font-black text-slate-800 shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-none transition-all"
  }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setShowSetupModal(false);
      if (isHostRef.current && (sizeId !== tempSizeId || diffId !== tempDiffId)) {
        generateAndSync(tempSizeId, tempDiffId);
      }
    },
    className: "flex-1 py-3 bg-[#ffcc00] text-slate-900 border-2 border-slate-800 rounded-xl font-black shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-none transition-all"
  }, "\u78BA\u8A8D\u7522\u751F")))), showBrawlSettings && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md pointer-events-auto animate-fadeIn p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-2xl p-6 border-[4px] border-[#2d2a26] shadow-[8px_8px_0px_#2d2a26] relative flex flex-col gap-4 min-w-[300px] max-w-sm w-full mx-auto my-auto"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-black mb-2 border-b-4 ".concat(isBrawlMode ? 'border-purple-500' : 'border-sky-500', " inline-block pb-1")
  }, "\u2699\uFE0F ", isBrawlMode ? '大亂鬥設定' : '遊戲設定'), isBrawlMode && /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4"
  }, /*#__PURE__*/React.createElement("label", {
    className: "flex items-center justify-between font-bold text-slate-800"
  }, /*#__PURE__*/React.createElement("span", null, "\u7D50\u675F\u540D\u6B21 (1~5)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    max: "5",
    value: brawlSettings.winnersCount,
    onChange: function onChange(e) {
      var val = Math.max(1, Math.min(5, Number(e.target.value)));
      var newS = {};
      for (var k in brawlSettings) {
        newS[k] = brawlSettings[k];
      }
      newS.winnersCount = val;
      syncState({
        brawlSettings: newS
      });
    },
    className: "w-16 border-2 border-slate-800 rounded p-1 text-center font-black"
  })), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center justify-between font-bold text-slate-800 cursor-pointer"
  }, /*#__PURE__*/React.createElement("span", null, "\u4E0A\u5E1D\u8996\u89D2\u986F\u793A\u6578\u5B57"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: brawlSettings.showNumbersInGodMode,
    onChange: function onChange(e) {
      var newS = _objectSpread({}, brawlSettings);
      newS.showNumbersInGodMode = e.target.checked;
      syncState({
        brawlSettings: newS
      });
    },
    className: "w-5 h-5 accent-purple-500"
  })), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center justify-between font-bold text-slate-800 cursor-pointer"
  }, /*#__PURE__*/React.createElement("span", null, "\u958B\u555F\u9677\u5BB3\u9053\u5177 (\u6C34\u7403/\u6A61\u76AE\u64E6)"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: brawlSettings.allowWeapons !== false,
    onChange: function onChange(e) {
      var newS = _objectSpread({}, brawlSettings);
      newS.allowWeapons = e.target.checked;
      syncState({
        brawlSettings: newS
      });
    },
    className: "w-5 h-5 accent-purple-500"
  })), brawlSettings.allowWeapons !== false && /*#__PURE__*/React.createElement("label", {
    className: "flex items-center justify-between font-bold text-slate-800"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm"
  }, "\u9677\u5BB3\u9053\u5177\u5EF6\u9072 (\u79D2)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    max: "600",
    value: brawlSettings.weaponStartTime,
    onChange: function onChange(e) {
      var val = Math.max(0, Math.min(600, Number(e.target.value)));
      var newS = _objectSpread({}, brawlSettings);
      newS.weaponStartTime = val;
      syncState({
        brawlSettings: newS
      });
    },
    className: "w-20 border-2 border-slate-800 rounded p-1 text-center font-black"
  }))), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center justify-between font-bold text-slate-800 cursor-pointer"
  }, /*#__PURE__*/React.createElement("span", null, "\u958B\u555F\u5FEB\u901F\u586B\u7B54"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: brawlSettings.allowQuickFill,
    onChange: function onChange(e) {
      var newS = {};
      for (var k in brawlSettings) {
        newS[k] = brawlSettings[k];
      }
      newS.allowQuickFill = e.target.checked;
      syncState({
        brawlSettings: newS
      });
    },
    className: "w-5 h-5 " + (isBrawlMode ? 'accent-purple-600' : 'accent-red-600') + " cursor-pointer"
  })), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center justify-between font-bold text-slate-800 cursor-pointer"
  }, /*#__PURE__*/React.createElement("span", null, "\u958B\u555F\u5FAA\u74B0\u6A21\u5F0F"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: brawlSettings.allowTraversal,
    onChange: function onChange(e) {
      var newS = {};
      for (var k in brawlSettings) {
        newS[k] = brawlSettings[k];
      }
      newS.allowTraversal = e.target.checked;
      syncState({
        brawlSettings: newS
      });
    },
    className: "w-5 h-5 " + (isBrawlMode ? 'accent-purple-600' : 'accent-red-600') + " cursor-pointer"
  })), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center justify-between font-bold text-slate-800 cursor-pointer"
  }, /*#__PURE__*/React.createElement("span", null, "\u958B\u555F\u5E95\u584A\u63D0\u793A"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: brawlSettings.allowYellowHint,
    onChange: function onChange(e) {
      var newS = {};
      for (var k in brawlSettings) {
        newS[k] = brawlSettings[k];
      }
      newS.allowYellowHint = e.target.checked;
      syncState({
        brawlSettings: newS
      });
    },
    className: "w-5 h-5 " + (isBrawlMode ? 'accent-purple-600' : 'accent-red-600') + " cursor-pointer"
  })), isMultiplayer && /*#__PURE__*/React.createElement("label", {
    className: "flex items-center justify-between font-bold text-slate-800 cursor-pointer"
  }, /*#__PURE__*/React.createElement("span", null, "\u5141\u8A31\u5176\u4ED6\u73A9\u5BB6\u6309\u518D\u4F86\u4E00\u5C40"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: brawlSettings.allowOthersToPlayAgain !== false,
    onChange: function onChange(e) {
      var newS = {};
      for (var k in brawlSettings) {
        newS[k] = brawlSettings[k];
      }
      newS.allowOthersToPlayAgain = e.target.checked;
      syncState({
        brawlSettings: newS
      });
    },
    className: "w-5 h-5 " + (isBrawlMode ? 'accent-purple-600' : 'accent-red-600') + " cursor-pointer"
  })), isMultiplayer && isBrawlMode && /*#__PURE__*/React.createElement("label", {
    className: "flex items-center justify-between font-bold text-slate-800 cursor-pointer"
  }, /*#__PURE__*/React.createElement("span", null, "\u958B\u555F\u7372\u5F97\u8207\u8D08\u9001\u79AE\u7269\u529F\u80FD"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: brawlSettings.allowGifts !== false,
    onChange: function onChange(e) {
      var newS = {};
      for (var k in brawlSettings) {
        newS[k] = brawlSettings[k];
      }
      newS.allowGifts = e.target.checked;
      syncState({
        brawlSettings: newS
      });
    },
    className: "w-5 h-5 " + (isBrawlMode ? 'accent-purple-600' : 'accent-red-600') + " cursor-pointer"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowBrawlSettings(false);
    },
    className: "mt-4 px-4 py-3 bg-[#ffcc00] border-4 border-[#2d2a26] font-black rounded-xl shadow-[4px_4px_0px_#2d2a26] hover:translate-y-[2px] hover:shadow-none transition-all"
  }, "\u95DC\u9589\u8A2D\u5B9A"))), /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-[1200px] bg-[#fffaf0] rounded-xl border-4 border-slate-800 shadow-[8px_8px_0px_rgba(30,41,59,1)] flex flex-col h-full relative z-10 overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#ffcc00] border-b-[3px] border-slate-800 shrink-0 z-50 relative transition-all duration-300 ease-in-out px-2 md:px-4 py-1.5 flex flex-col gap-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2 w-full overflow-x-auto hide-scrollbar pb-0.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 flex-nowrap shrink-0"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "font-black tracking-tight uppercase text-base md:text-2xl text-[#2d2a26] flex items-center gap-1 shrink-0"
  }, "\uD83D\uDD22", /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "\u6578\u7368 - SUDOKU")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 bg-[#2d2a26] text-white px-1.5 py-0.5 rounded font-mono font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.4)] text-[10px] md:text-sm whitespace-nowrap shrink-0"
  }, /*#__PURE__*/React.createElement(GameTimer, {
    startTime: startTime,
    endTime: isBrawlMode ? matchPhase === 'finished' ? stateRef.current.matchEndTime || endTime : null : endTime || (winner ? matchStartTime : null),
    isRunning: (isBrawlMode ? matchPhase === 'playing' : !isWon) && !winner && screen === 'game',
    matchPhase: matchPhase
  })), dailyDate && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 bg-emerald-500 text-white px-1.5 py-0.5 rounded font-black shadow-[2px_2px_0px_rgba(0,0,0,0.4)] text-[10px] md:text-sm whitespace-nowrap shrink-0"
  }, "\uD83D\uDCC5 \u6BCF\u65E5 ", dailyDate.slice(5), dailyDate !== dailyTodayStr() ? ' 補玩' : ''), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 shrink-0"
  }, isMultiplayer && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "bg-emerald-400 text-slate-900 px-1.5 py-0.5 rounded border-2 border-slate-800 font-black text-[10px] md:text-sm shadow-[1px_1px_0px_rgba(30,41,59,1)] flex items-center gap-1 whitespace-nowrap shrink-0"
  }, "\u4EE3\u78BC: ", roomId), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (isHostRef.current) {
        var currentMode = stateRef.current.isBrawlMode ? 'brawl' : 'coop';
        var nextMode = currentMode === 'coop' ? 'ghost' : currentMode === 'ghost' ? 'brawl' : 'coop';
        generateAndSync(sizeId, diffId, nextMode);
      }
    },
    disabled: !isHostRef.current,
    className: "".concat(isBrawlMode ? 'bg-purple-600' : 'bg-sky-400', " text-white px-1.5 py-0.5 rounded border-2 border-slate-800 font-black text-[10px] md:text-sm shadow-[1px_1px_0px_rgba(30,41,59,1)] flex items-center gap-1 whitespace-nowrap shrink-0 ").concat(isHostRef.current ? 'cursor-pointer hover:translate-y-[1px] hover:shadow-none active:translate-y-[2px] transition-all' : 'opacity-90 cursor-default'),
    title: isHostRef.current ? "點擊切換競賽模式（將會重新出題）" : "僅房主可切換模式"
  }, isBrawlMode ? '⚔️ 大亂鬥' : '🌐 合作模式')), (!isMultiplayer || isHostRef.current) && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowBrawlSettings(true);
    },
    className: "bg-slate-700 text-white px-1.5 py-0.5 rounded border-2 border-slate-800 font-black text-[10px] md:text-sm shadow-[1px_1px_0px_rgba(30,41,59,1)] hover:translate-y-[1px] hover:shadow-none active:translate-y-[2px] transition-all"
  }, "\u2699\uFE0F \u8A2D\u5B9A"))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setIsHeaderCollapsed(!isHeaderCollapsed);
    },
    className: "shrink-0 flex px-1.5 py-0.5 bg-[#2d2a26] text-white border-2 border-[#2d2a26] rounded font-bold text-[10px] md:text-sm shadow-[1px_1px_0px_rgba(0,0,0,0.3)] hover:bg-slate-800 items-center gap-1 whitespace-nowrap"
  }, isHeaderCollapsed ? '🔽 展開規則' : '🔼 縮小面板')), /*#__PURE__*/React.createElement("div", {
    className: "w-full overflow-hidden transition-all duration-500 ease-in-out origin-top flex flex-col gap-2 ".concat(isHeaderCollapsed ? 'max-h-0 opacity-0 scale-y-95' : 'max-h-[500px] opacity-100 scale-y-100')
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-[3px] border-[#2d2a26] rounded-xl p-2 md:p-3 text-[#2d2a26] shadow-[4px_4px_0px_#2d2a26] flex flex-col md:flex-row gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-sm md:text-base font-black mb-1 border-b-[3px] border-[#ffcc00] inline-block pb-0.5"
  }, "\uD83D\uDCDC \u904A\u6232\u898F\u5247"), /*#__PURE__*/React.createElement("ol", {
    className: "list-decimal list-outside ml-4 space-y-1 text-[10px] md:text-sm leading-relaxed font-bold"
  }, /*#__PURE__*/React.createElement("li", null, "\u9078\u64C7\u4E0A\u65B9\u6578\u5B57\u9EDE\u64CA\u65B9\u683C\u3002\u82E5\u4E0D\u9078\u4E0A\u65B9\u6578\u5B57\uFF0C\u53EF\u76F4\u63A5\u9EDE\u64CA\u76E4\u9762\u5DF2\u6709\u6578\u5B57\u4F86\u300C\u667A\u6167\u5438\u53D6\u300D\u9AD8\u4EAE\u3002"), /*#__PURE__*/React.createElement("li", null, "\u8F38\u5165\u65B9\u5F0F\u53EF\u5728\u4E0B\u65B9\u5207\u63DB\u6210\u300C\uD83D\uDC46 \u683C\u5B50\u5148\u884C\u300D\uFF1A\u5148\u9EDE\u683C\u5B50\u3001\u518D\u9EDE\u6578\u5B57\u586B\u5165\uFF0C\u7FD2\u6163\u9019\u7A2E\u9806\u5E8F\u7684\u73A9\u5BB6\u9069\u7528\uFF1B\u5207\u63DB\u5F8C\u6703\u8A18\u4F4F\u4F60\u7684\u9078\u64C7\u3002"), /*#__PURE__*/React.createElement("li", null, "\u4E0D\u53EF\u91CD\u8907\uFF1A\u82E5\u767C\u751F\u885D\u7A81\uFF0C\u80CC\u666F\u6703\u4EAE\u8D77\u7D05\u8272\u63D0\u793A\u3002"), /*#__PURE__*/React.createElement("li", null, "\u8349\u7A3F\u6A21\u5F0F\uFF1A\u53EF\u5728\u65B9\u683C\u5167\u6A19\u8A18\u591A\u500B\u5C0F\u6578\u5B57\u8F14\u52A9\u63A8\u7406\u3002"), /*#__PURE__*/React.createElement("li", null, "\u9577\u6309\u6E05\u9664\uFF1A\u82E5\u586B\u932F\u6578\u5B57\u4E14\u4E0A\u65B9\u6309\u9375\u5DF2\u88AB\u9396\u5B9A\uFF08\u53CD\u7070\uFF09\uFF0C\u53EF\u9577\u6309\u8A72\u683C 0.5 \u79D2\u5F37\u5236\u6E05\u9664\u3002"))))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-nowrap gap-1.5 items-center w-full overflow-x-auto hide-scrollbar pt-0.5 pb-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5 items-center shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    disabled: isMultiplayer && !isHostRef.current,
    onClick: function onClick() {
      setTempSizeId(sizeId);
      setTempDiffId(diffId);
      setShowSetupModal(true);
    },
    className: "px-2 py-1 md:px-3 md:py-1.5 rounded border-2 border-[#2d2a26] font-bold bg-white text-[#2d2a26] text-[10px] md:text-sm outline-none shadow-[2px_2px_0px_#2d2a26] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0 flex items-center gap-1 hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#2d2a26] active:translate-y-[2px] active:shadow-none transition-all",
    title: "\u8A2D\u5B9A\u984C\u578B\u8207\u96E3\u5EA6"
  }, "\u2699\uFE0F ", (_SIZES$find = SIZES.find(function (s) {
    return s.id === sizeId;
  })) === null || _SIZES$find === void 0 ? void 0 : _SIZES$find.name.split(' ')[0], " - ", ((_DIFFICULTIES$find = DIFFICULTIES.find(function (d) {
    return d.id === diffId;
  })) === null || _DIFFICULTIES$find === void 0 ? void 0 : _DIFFICULTIES$find.name.split(' ')[1]) || '難度')), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5 items-center ml-auto shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handlePlayAgain,
    disabled: isMultiplayer && !isHost,
    className: "px-1.5 py-1 md:px-3 md:py-1.5 bg-blue-500 text-white border-2 border-[#2d2a26] rounded font-bold text-[10px] md:text-sm shadow-[2px_2px_0px_#2d2a26] disabled:opacity-60 disabled:cursor-not-allowed active:translate-y-1 active:shadow-none transition-all flex items-center gap-1 shrink-0",
    title: "\u65B0\u984C"
  }, "\uD83C\uDFB2", /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "\u65B0\u984C")), true && /*#__PURE__*/React.createElement("button", {
    onClick: handleUndo,
    disabled: history.length === 0 || isWon || isMultiplayer && !isBrawlMode,
    className: "px-1.5 py-1 md:px-3 md:py-1.5 bg-white border-2 border-[#2d2a26] rounded font-bold text-[10px] md:text-sm shadow-[2px_2px_0px_#2d2a26] disabled:opacity-50 disabled:shadow-none active:translate-y-1 active:shadow-none transition-all flex items-center gap-1 text-[#2d2a26] shrink-0",
    title: "\u5FA9\u539F"
  }, "\u21A9\uFE0F", /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "\u5FA9\u539F")), /*#__PURE__*/React.createElement("button", {
    onClick: handleReset,
    className: "px-1.5 py-1 md:px-3 md:py-1.5 bg-red-500 text-white border-2 border-[#2d2a26] rounded font-bold text-[10px] md:text-sm shadow-[2px_2px_0px_#2d2a26] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1 shrink-0",
    title: "\u91CD\u7F6E"
  }, "\uD83D\uDD04", /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "\u91CD\u7F6E")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowSaveModal(true);
    },
    className: "px-1.5 py-1 md:px-3 md:py-1.5 bg-blue-500 text-white border-2 border-[#2d2a26] rounded font-bold text-[10px] md:text-sm shadow-[2px_2px_0px_#2d2a26] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1 shrink-0",
    title: "\u5B58\u6A94/\u8B80\u6A94"
  }, "\uD83D\uDCBE", /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "\u5B58\u6A94")), /*#__PURE__*/React.createElement("button", {
    onClick: handleGoHome,
    className: "bg-white text-[#2d2a26] border-2 border-[#2d2a26] px-1.5 py-1 md:px-3 md:py-1.5 rounded font-bold text-[10px] md:text-sm shadow-[2px_2px_0px_#2d2a26] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1 shrink-0",
    title: "\u56DE\u9996\u9801/\u65B7\u7DDA"
  }, !isMultiplayer ? '🏠' : '🔌', /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline ml-1"
  }, !isMultiplayer ? '回首頁' : '退出'))))), isMultiplayer && /*#__PURE__*/React.createElement("div", {
    className: "px-2 md:px-4 py-1.5 bg-[#fffdfa] border-b-[3px] border-slate-800 flex flex-nowrap gap-2 items-center relative z-40 shadow-inner shrink-0 overflow-x-auto hide-scrollbar w-full"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-black text-slate-800 text-xs shrink-0 whitespace-nowrap"
  }, "\uD83D\uDC65 \u73A9\u5BB6\uFF1A"), playersList.map(function (p, idx) {
    var isMe = p.id === myId;
    var isRainbow = p.color === 'rainbow';
    var pct = isBrawlMode ? ghostProgress[p.id] || 0 : (playerProgress.find(function (x) {
      return x.uid === p.id;
    }) || {
      pct: 0
    }).pct || 0;
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "shrink-0 flex flex-col gap-0.5 border-2 border-slate-800 rounded px-1.5 py-0.5 relative cursor-pointer hover:bg-slate-100 transition-colors ".concat(p.isSpectator ? 'opacity-60 bg-slate-100' : 'bg-white'),
      onClick: function onClick() {
        if (isMe || isHostRef.current) {
          setEditName(p.name);
          setColorPickerTarget(p.id);
        } else {
          showToast("⚠️ 只有房主可以更改其他玩家的設定！");
        }
      },
      title: isMe ? "點擊修改設定" : isHostRef.current ? "房主可修改他人設定" : "無法修改他人設定"
    }, /*#__PURE__*/React.createElement("div", {
      className: "absolute left-0 top-0 bottom-0 w-1 rounded-l-[1px]",
      style: {
        backgroundColor: isRainbow ? 'transparent' : p.color
      }
    }, isRainbow && /*#__PURE__*/React.createElement("svg", {
      className: "absolute inset-0 w-full h-full pointer-events-none"
    }, /*#__PURE__*/React.createElement("rect", {
      width: "100%",
      height: "100%",
      fill: "url(#rainbowGrad)"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1 text-[10px] md:text-xs font-bold text-slate-800 pl-1.5 whitespace-nowrap"
    }, p.name, " ", p.isHost && '👑', " ", p.isSpectator && ' 👁️', " ", isMe && '(你)', /*#__PURE__*/React.createElement("span", {
      className: "text-emerald-600 font-mono ml-1"
    }, pct, "%")), /*#__PURE__*/React.createElement("div", {
      className: "w-24 md:w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden ml-1.5 relative border border-slate-300"
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-full transition-all duration-300",
      style: {
        width: "".concat(pct, "%"),
        backgroundColor: isRainbow ? 'transparent' : p.color
      }
    }, isRainbow && /*#__PURE__*/React.createElement("svg", {
      className: "absolute inset-0 w-full h-full pointer-events-none"
    }, /*#__PURE__*/React.createElement("rect", {
      width: "100%",
      height: "100%",
      fill: "url(#rainbowGrad)"
    })))));
  }), /*#__PURE__*/React.createElement("div", {
    className: "ml-auto shrink-0 flex items-center pl-2 gap-2"
  }, engineRef.current === 'peerjs' && !isBrawlMode && /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-1.5 cursor-pointer text-[10px] md:text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-1.5 py-1 rounded border-2 border-slate-300 shadow-[1px_1px_0px_rgba(30,41,59,1)] whitespace-nowrap"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showOtherCursors,
    onChange: function onChange(e) {
      return setShowOtherCursors(e.target.checked);
    },
    className: "w-3 h-3 accent-emerald-500"
  }), "\u986F\u793A\u6E38\u6A19"), isMultiplayer && isBrawlMode && /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-1.5 cursor-pointer text-[10px] md:text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-1.5 py-1 rounded border-2 border-slate-300 shadow-[1px_1px_0px_rgba(30,41,59,1)] whitespace-nowrap"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showGhostProgress,
    onChange: function onChange(e) {
      return setShowGhostProgress(e.target.checked);
    },
    className: "w-3 h-3 accent-purple-500"
  }), "\u986F\u793A\u5C0D\u624B\u8272\u584A"))), !isHeaderCollapsed && /*#__PURE__*/React.createElement("div", {
    className: "h-6 md:h-8 shrink-0 flex items-center justify-center bg-slate-800 text-white border-b-4 border-slate-800 relative z-30 font-bold tracking-wide"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] md:text-sm hidden md:inline"
  }, "\u652F\u63F4\u6ED1\u9F20\u62D6\u66F3\u3001\u6EFE\u8F2A\u7E2E\u653E\uFF1B\u4E0B\u65B9\u5DE5\u5177\u5217\u53EF\u5207\u63DB\u6A21\u5F0F\u8207\u7E2E\u653E\u3002 (v3.13.4)"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] md:text-sm md:hidden"
  }, "\u9EDE\u9078\u4E0A\u65B9\u6578\u5B57\u518D\u9EDE\u64CA\u65B9\u683C\u3002\u652F\u63F4\u96D9\u6307\u7E2E\u653E\u8207\u5E73\u79FB\u3002")), /*#__PURE__*/React.createElement("div", {
    className: "relative z-0 flex-1 flex flex-col min-h-0 bg-[#fffaf0]"
  }, isGenerating && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 z-[40] flex flex-col items-center justify-center pointer-events-none bg-[#fffaf0]/80 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-slate-800 font-black text-2xl md:text-4xl tracking-widest flex items-center select-none animate-pulse mb-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative inline-flex items-center justify-center"
  }, /*#__PURE__*/React.createElement("span", null, "\u984C\u76EE\u751F\u6210\u4E2D"), /*#__PURE__*/React.createElement("span", {
    className: "absolute left-full animate-loading-dots w-[1.5em] text-left"
  }))), genProgress && /*#__PURE__*/React.createElement("div", {
    className: "text-slate-600 font-bold text-sm md:text-base animate-fadeIn whitespace-pre-line text-center"
  }, genProgress), /*#__PURE__*/React.createElement("div", {
    className: "text-emerald-600 font-bold text-xs mt-2 opacity-80"
  }, "*\u56B4\u683C\u552F\u4E00\u89E3\u904B\u7B97\u8F03\u8017\u6642\uFF0C\u8ACB\u7A0D\u5019*")), !isSpectator && /*#__PURE__*/React.createElement("div", {
    className: "flex flex-nowrap gap-0.5 sm:gap-1 md:gap-2 justify-center w-full px-1 sm:px-2 py-2 md:py-3 bg-[#f8fafc] border-b-[3px] border-slate-800 shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.05)] z-20 select-none",
    style: {
      perspective: '1000px'
    }
  }, keyMapping.map(function (c, idx) {
    var isCompleted = completedChars.has(c);
    var isFlipping = flippedKeys.includes(idx);
    return /*#__PURE__*/React.createElement("button", {
      key: "keybtn-".concat(idx),
      onClick: function onClick(e) {
        onNumClick(e, c);
      },
      title: isCompleted ? "\u5DF2\u7D93\u586B\u6EFF ".concat(c) : "\u9EDE\u64CA\u9078\u53D6 ".concat(c),
      className: "select-none flex-1 min-w-[24px] max-w-[48px] aspect-square rounded-md sm:rounded-lg md:rounded-xl text-sm sm:text-lg md:text-2xl font-black border-2 md:border-[3px] border-slate-800 flex items-center justify-center p-0 key-btn\n                       ".concat(isFlipping ? 'anim-key-flip' : '', "\n                       ").concat(isCompleted ? 'bg-slate-300 text-slate-500 opacity-60 cursor-pointer shadow-none' : selectedChar === c ? 'bg-[#ffcc00] text-slate-900 scale-110 shadow-[2px_2px_0px_rgba(30,41,59,1)] sm:shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:scale-110' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-[1px_1px_0px_rgba(30,41,59,1)] sm:shadow-[2px_2px_0px_rgba(30,41,59,1)]', "\n                       ").concat(!isCompleted && !isFlipping ? 'active:translate-y-1 active:shadow-none' : '')
    }, c);
  })), /*#__PURE__*/React.createElement("div", {
    ref: zoomContainerRef,
    className: "p-2 md:p-6 flex-1 overflow-auto custom-scrollbar relative z-0 flex flex-col"
  }, isSpectator || isBrawlMode && winner && finishViewMode === 'god' ? isBrawlMode ? renderHostGodView() : /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex flex-col items-center justify-center min-h-[400px]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-4 border-slate-800 rounded-xl p-6 md:p-10 shadow-[8px_8px_0px_rgba(30,41,59,1)] w-full max-w-2xl text-center"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl md:text-4xl font-black text-slate-800 mb-2 tracking-widest"
  }, "\uD83D\uDCE1 \u8CFD\u6CC1\u8F49\u64AD\u4E2D"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 font-bold mb-8"
  }, "\u60A8\u4EE5\u89C0\u6230\u8005\u8EAB\u5206\u52A0\u5165\uFF0C\u8ACB\u70BA\u5834\u4E0A\u73A9\u5BB6\u52A0\u6CB9\uFF01"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-5 text-left"
  }, playersList.filter(function (p) {
    return !p.isSpectator;
  }).map(function (p) {
    var pct = ghostProgress[p.id] || 0;
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      className: "flex flex-col gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between font-black text-slate-700 items-center"
    }, /*#__PURE__*/React.createElement("span", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "w-4 h-4 rounded-full border-2 border-slate-800",
      style: {
        backgroundColor: p.color === 'rainbow' ? '#ffcc00' : p.color
      }
    }), p.name, " ", p.isHost && '👑'), /*#__PURE__*/React.createElement("span", {
      className: "text-emerald-600 font-mono text-lg"
    }, pct, "%")), /*#__PURE__*/React.createElement("div", {
      className: "w-full h-5 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-800 shadow-inner"
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-full transition-all duration-300",
      style: {
        width: "".concat(pct, "%"),
        backgroundColor: p.color === 'rainbow' ? '#ffcc00' : p.color
      }
    })));
  }), playersList.filter(function (p) {
    return !p.isSpectator;
  }).length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "text-center text-slate-400 font-bold py-4"
  }, "\u76EE\u524D\u5834\u4E0A\u6C92\u6709\u6BD4\u8CFD\u73A9\u5BB6")))) : /*#__PURE__*/React.createElement("div", {
    className: "flex justify-center items-center min-w-max min-h-max m-auto pb-32 pr-20"
  }, /*#__PURE__*/React.createElement("svg", {
    ref: svgRef,
    onPointerMove: handlePointerMove,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerLeave: function onPointerLeave(e) {
      handlePointerUp(e);
      if (eraserRef.current) eraserRef.current.style.display = 'none';
    },
    onPointerCancel: handlePointerUp,
    viewBox: "0 0 ".concat(svgW, " ").concat(svgH),
    className: "bg-transparent transition-transform duration-100 ease-out origin-center select-none",
    style: {
      width: "".concat(svgW * zoomLevel, "px"),
      height: "".concat(svgH * zoomLevel, "px"),
      touchAction: interactionMode >= 2 ? 'none' : 'manipulation'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "rainbowGrad",
    gradientUnits: "userSpaceOnUse",
    x1: "0",
    y1: "0",
    x2: svgW,
    y2: svgH
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    className: "rainbow-stop"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    className: "rainbow-stop"
  })), /*#__PURE__*/React.createElement("radialGradient", {
    id: "fogGrad",
    cx: "50%",
    cy: "45%",
    r: "60%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#a855f7",
    stopOpacity: "0.95"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "40%",
    stopColor: "#7c3aed",
    stopOpacity: "0.90"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "80%",
    stopColor: "#db2777",
    stopOpacity: "0.85"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#1e1b4b",
    stopOpacity: "0.75"
  }))), /*#__PURE__*/React.createElement("g", {
    transform: "translate(".concat(PADDING, ", ").concat(PADDING, ")")
  }, activeCells.map(function (cell) {
    var hasConflict = conflictCellIds.has(cell.id);
    var yellowAllowed = stateRef.current.brawlSettings.allowYellowHint;
    var isExactMatch = yellowAllowed && selectedChar !== null && cell.value === selectedChar && interactionMode < 2;
    var isHighlightZone = yellowAllowed && highlightZones.has(cell.id);
    var isFilledWithOther = yellowAllowed && selectedChar !== null && cell.value !== null && cell.value !== selectedChar && interactionMode < 2;
    var fillColor = '#ffffff';
    if (hasConflict) fillColor = '#fee2e2';else if (inputMode === 'cell' && selectedCellId === cell.id) fillColor = '#bae6fd';else if (isExactMatch) fillColor = '#fde047';else if (isHighlightZone || isFilledWithOther) fillColor = '#fef8cb';else if (isSpectator && cell.isGiven) fillColor = '#f1f5f9'; // 上帝視角下的題目背景：淺灰色 (v3.10.12)

    return /*#__PURE__*/React.createElement("rect", {
      key: "bg-".concat(cell.id),
      x: cell.x * CELL_SIZE,
      y: cell.y * CELL_SIZE,
      width: CELL_SIZE,
      height: CELL_SIZE,
      fill: fillColor,
      className: "transition-colors duration-300 pointer-events-none"
    });
  })), strokes.map(function (s) {
    var strokeUid = s.uid || s.id.split('-')[1];
    var isOwnStroke = strokeUid === myId;
    var strokeColor = s.color;
    var strokeOpacity = 1;
    var isRainbow = false;
    if (strokeUid) {
      strokeColor = getPlayerColor(strokeUid);
      if (strokeColor === 'rainbow') isRainbow = true;
      strokeOpacity = isMultiplayer && !isOwnStroke ? 0.5 : 1;
    }
    return /*#__PURE__*/React.createElement("path", {
      key: s.id,
      d: s.path,
      fill: "none",
      stroke: isRainbow ? undefined : strokeColor,
      strokeOpacity: strokeOpacity,
      strokeWidth: "8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: "doodle-stroke ".concat(isRainbow ? 'rainbow-stroke' : ''),
      "data-stroke-id": s.id,
      style: {
        pointerEvents: interactionMode === 2 && drawSubMode === 'eraser' && isOwnStroke ? 'stroke' : 'none'
      }
    });
  }), /*#__PURE__*/React.createElement("path", {
    ref: drawingPathRef,
    fill: "none",
    stroke: myCurrentColor === 'rainbow' ? undefined : myCurrentColor,
    strokeOpacity: 1,
    strokeWidth: "8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "pointer-events-none ".concat(myCurrentColor === 'rainbow' ? 'rainbow-stroke' : ''),
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("g", {
    transform: "translate(".concat(PADDING, ", ").concat(PADDING, ")")
  }, Array.from({
    length: cSizeDef.size + 1
  }).map(function (_, i) {
    var isThickX = i % cSizeDef.boxW === 0;
    var isThickY = i % cSizeDef.boxH === 0;
    return /*#__PURE__*/React.createElement("g", {
      key: "grid-line-".concat(i),
      className: "pointer-events-none"
    }, /*#__PURE__*/React.createElement("line", {
      x1: i * CELL_SIZE,
      y1: 0,
      x2: i * CELL_SIZE,
      y2: cSizeDef.size * CELL_SIZE,
      stroke: "#1e293b",
      strokeWidth: isThickX ? 4 : 1,
      strokeLinecap: isThickX ? 'square' : 'butt'
    }), /*#__PURE__*/React.createElement("line", {
      x1: 0,
      y1: i * CELL_SIZE,
      x2: cSizeDef.size * CELL_SIZE,
      y2: i * CELL_SIZE,
      stroke: "#1e293b",
      strokeWidth: isThickY ? 4 : 1,
      strokeLinecap: isThickY ? 'square' : 'butt'
    }));
  }), activeCells.map(function (cell) {
    var cx = cell.x * CELL_SIZE;
    var cy = cell.y * CELL_SIZE;
    var valColor = "#1e293b";
    var isRainbow = false;
    if (!cell.isGiven && cell.value && cell.owner) {
      valColor = getPlayerColor(cell.owner);
      if (valColor === 'rainbow') isRainbow = true;
    }
    if (cell.isSystemRevealed) {
      valColor = "#1e293b";
      isRainbow = false;
    }
    return /*#__PURE__*/React.createElement("g", {
      key: "cell-".concat(cell.id),
      id: "cell-".concat(cell.id),
      onClick: function onClick() {
        return handleCellClick(cell.id);
      },
      className: interactionMode >= 2 ? 'pointer-events-none' : 'cursor-pointer group'
    }, /*#__PURE__*/React.createElement("rect", {
      x: cx,
      y: cy,
      width: CELL_SIZE,
      height: CELL_SIZE,
      fill: "transparent",
      className: interactionMode >= 2 ? '' : 'hover:fill-yellow-600/20 transition-colors'
    }), erasingCells[cell.id] && /*#__PURE__*/React.createElement("g", {
      className: "pointer-events-none select-none",
      style: {
        animation: 'eraseFade 0.5s ease-in forwards'
      }
    }, /*#__PURE__*/React.createElement("text", {
      x: cx + CELL_SIZE / 2,
      y: cy + CELL_SIZE / 2 + 2,
      textAnchor: "middle",
      dominantBaseline: "central",
      fontSize: CELL_SIZE * 0.6,
      fontWeight: "bold",
      fill: isRainbow ? undefined : valColor,
      className: isRainbow ? 'rainbow-fill' : ''
    }, erasingCells[cell.id].value), /*#__PURE__*/React.createElement("text", {
      x: cx + CELL_SIZE / 2 + 10,
      y: cy + CELL_SIZE / 2 - 10,
      textAnchor: "middle",
      dominantBaseline: "central",
      fontSize: CELL_SIZE * 0.4
    }, "\uD83E\uDDF9")), function () {
      // 上帝視角視覺分層 (v3.10.12)
      if (isSpectator) {
        if (cell.isGiven) {
          var _stateRef$current$lev;
          var originalCell = (_stateRef$current$lev = stateRef.current.levelData) === null || _stateRef$current$lev === void 0 || (_stateRef$current$lev = _stateRef$current$lev.cells) === null || _stateRef$current$lev === void 0 ? void 0 : _stateRef$current$lev.find(function (c) {
            return c.id === cell.id;
          });
          return /*#__PURE__*/React.createElement("text", {
            x: cx + CELL_SIZE / 2,
            y: cy + CELL_SIZE / 2 + 2,
            textAnchor: "middle",
            dominantBaseline: "central",
            fontSize: CELL_SIZE * 0.6,
            fontWeight: "900",
            fill: "#1e293b",
            className: "pointer-events-none select-none opacity-40"
          }, (originalCell === null || originalCell === void 0 ? void 0 : originalCell.value) || cell.value);
        }
        // 如果是上帝且不是題目，但「上帝視角顯示數字」關閉，則不顯示數字 (即便 cell.value 有值)
        if (!brawlSettings.showNumbersInGodMode) {
          return null;
        }
      }
      if (cell.value) {
        return /*#__PURE__*/React.createElement("text", {
          x: cx + CELL_SIZE / 2,
          y: cy + CELL_SIZE / 2 + 2,
          textAnchor: "middle",
          dominantBaseline: "central",
          fontSize: CELL_SIZE * 0.6,
          fontWeight: cell.isGiven || cell.isSystemRevealed ? "900" : "bold",
          fill: isRainbow ? undefined : valColor,
          className: "pointer-events-none select-none ".concat(isRainbow ? 'rainbow-fill' : '')
        }, cell.value);
      }
      return cell.drafts.map(function (d) {
        var idx = cSizeDef.chars.indexOf(d);
        var dx, dy, fontSize;
        if (cSizeDef.size === 4) {
          dx = idx % 2 * (CELL_SIZE / 2) + CELL_SIZE / 4;
          dy = Math.floor(idx / 2) * (CELL_SIZE / 2) + CELL_SIZE / 4;
          fontSize = CELL_SIZE * 0.3;
        } else if (cSizeDef.size === 9) {
          dx = idx % 3 * (CELL_SIZE / 3) + CELL_SIZE / 6;
          dy = Math.floor(idx / 3) * (CELL_SIZE / 3) + CELL_SIZE / 6;
          fontSize = CELL_SIZE * 0.25;
        } else {
          dx = idx % 4 * (CELL_SIZE / 4) + CELL_SIZE / 8;
          dy = Math.floor(idx / 4) * (CELL_SIZE / 4) + CELL_SIZE / 8;
          fontSize = CELL_SIZE * 0.18;
        }
        var isDraftSelected = d === selectedChar;
        return /*#__PURE__*/React.createElement("g", {
          key: "draft-".concat(d),
          className: "pointer-events-none"
        }, /*#__PURE__*/React.createElement("text", {
          x: cx + dx,
          y: cy + dy + 1,
          textAnchor: "middle",
          dominantBaseline: "central",
          fontSize: isDraftSelected ? fontSize * 1.2 : fontSize,
          fontWeight: isDraftSelected ? "900" : "bold",
          fill: isDraftSelected ? "#facc15" : "#64748b",
          stroke: isDraftSelected ? "#1e293b" : "none",
          strokeWidth: isDraftSelected ? 2 : 0,
          strokeLinejoin: "round",
          paintOrder: "stroke",
          className: "select-none transition-all duration-200"
        }, d));
      });
    }());
  })), /*#__PURE__*/React.createElement("g", {
    transform: "translate(".concat(PADDING, ", ").concat(PADDING, ")")
  }, isBrawlMode && showGhostProgress && activeCells.map(function (cell) {
    var ghostInfo = ghostHints[cell.id];
    if (!ghostInfo || cell.isGiven || cell.isSystemRevealed) return null;
    return Object.entries(ghostInfo).map(function (_ref11, idx) {
      var _ref12 = _slicedToArray(_ref11, 2),
        uid = _ref12[0],
        hint = _ref12[1];
      if (uid === myId) return null; // 不顯示自己的

      // 只有一位填答者時，且是上帝模式，畫出「大方塊」覆蓋格子背景
      var isOnlyOneHint = Object.keys(ghostInfo).length === 1;
      var sqSize = isSpectator && isOnlyOneHint ? CELL_SIZE - 4 : 10;
      var col = idx % 5;
      var row = Math.floor(idx / 5);
      var offsetX = isSpectator && isOnlyOneHint ? 2 : col * (sqSize + 2);
      var offsetY = isSpectator && isOnlyOneHint ? 2 : row * (sqSize + 2);
      var playerColor = (_typeof(hint) === 'object' ? hint.color : hint) || getPlayerColor(uid);
      return /*#__PURE__*/React.createElement("rect", {
        key: "ghost-".concat(cell.id, "-").concat(uid),
        x: cell.x * CELL_SIZE + (isSpectator && isOnlyOneHint ? 2 : CELL_SIZE - sqSize - 2 - offsetX),
        y: cell.y * CELL_SIZE + (isSpectator && isOnlyOneHint ? 2 : 2 + offsetY),
        width: sqSize,
        height: sqSize,
        fill: playerColor === 'rainbow' ? 'url(#rainbowGrad)' : playerColor,
        opacity: isSpectator && isOnlyOneHint ? "0.85" : "0.95",
        rx: isSpectator && isOnlyOneHint ? "8" : "2",
        className: "pointer-events-none ghost-highlight",
        stroke: "rgba(255,255,255,0.7)",
        strokeWidth: "1"
      });
    });
  })), /*#__PURE__*/React.createElement("circle", {
    ref: eraserRef,
    r: "15",
    fill: myCurrentColor === 'rainbow' ? undefined : myCurrentColor,
    fillOpacity: "0.4",
    stroke: myCurrentColor === 'rainbow' ? undefined : myCurrentColor,
    strokeWidth: "2",
    className: "pointer-events-none ".concat(myCurrentColor === 'rainbow' ? 'rainbow-stroke rainbow-fill' : ''),
    style: {
      display: 'none'
    }
  }), !isBrawlMode && Object.entries(cursors).map(function (entry) {
    var uid = entry[0];
    var pos = entry[1];
    if (uid === myId) return null;
    var player = playersList.find(function (p) {
      return p.id === uid;
    });
    if (!player) return null;
    var isRainbow = player.color === 'rainbow';
    return /*#__PURE__*/React.createElement("g", {
      key: "cursor-".concat(uid),
      transform: "translate(".concat(pos.x, ", ").concat(pos.y, ")"),
      className: "pointer-events-none transition-transform duration-75 ease-linear"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M0,0 L16,6 L10,10 L15,19 L11,21 L6,12 L0,18 Z",
      fill: isRainbow ? undefined : player.color,
      stroke: "white",
      strokeWidth: "2",
      className: isRainbow ? 'rainbow-fill' : ''
    }), /*#__PURE__*/React.createElement("rect", {
      x: "14",
      y: "22",
      rx: "4",
      ry: "4",
      width: player.name.length * 14 + 12,
      height: "22",
      fill: "rgba(0,0,0,0.6)"
    }), /*#__PURE__*/React.createElement("text", {
      x: "20",
      y: "37",
      fill: "white",
      fontSize: "13",
      fontWeight: "bold"
    }, player.name));
  }), !isBrawlMode && ripples.map(function (r) {
    var player = playersList.find(function (p) {
      return p.id === r.uid;
    });
    var color = player ? player.color : '#3b82f6';
    var isRainbow = color === 'rainbow';
    return /*#__PURE__*/React.createElement("circle", {
      key: r.id,
      cx: r.x,
      cy: r.y,
      r: "20",
      fill: "none",
      stroke: isRainbow ? undefined : color,
      className: "pointer-events-none ".concat(isRainbow ? 'rainbow-stroke' : ''),
      style: {
        transformOrigin: "".concat(r.x, "px ").concat(r.y, "px"),
        animation: 'rippleAnim 0.8s ease-out forwards'
      }
    });
  }), /*#__PURE__*/React.createElement("g", {
    transform: "translate(".concat(PADDING, ", ").concat(PADDING, ")")
  }, isBrawlMode && Object.entries(foggedBoxes).map(function (_ref13) {
    var _ref14 = _slicedToArray(_ref13, 2),
      boxIdStr = _ref14[0],
      expiry = _ref14[1];
    var boxId = parseInt(boxIdStr);
    var boxRow = Math.floor(boxId / (cSizeDef.size / cSizeDef.boxH));
    var boxCol = boxId % (cSizeDef.size / cSizeDef.boxW);
    var bx = boxCol * cSizeDef.boxW * CELL_SIZE;
    var by = boxRow * cSizeDef.boxH * CELL_SIZE;
    var bw = cSizeDef.boxW * CELL_SIZE;
    var bh = cSizeDef.boxH * CELL_SIZE;
    return /*#__PURE__*/React.createElement("text", {
      key: "fog-".concat(boxId),
      x: bx + bw / 2,
      y: by + bh / 2,
      textAnchor: "middle",
      dominantBaseline: "middle",
      fontSize: "".concat(Math.min(bw, bh) * 1.1, "px"),
      className: "pointer-events-none",
      style: {
        animation: 'fogFade 10s ease-in-out forwards',
        userSelect: 'none',
        pointerEvents: 'none'
      }
    }, "\uD83E\uDEDF");
  }))))), (isWon || isBrawlMode && winner) && !hideVictoryModal && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] pointer-events-auto ".concat(isClosingModal ? 'animate-fadeOut' : 'animate-fadeIn')
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-2xl p-6 md:p-8 border-[4px] border-[#2d2a26] shadow-[8px_8px_0px_#2d2a26] text-center min-w-[280px] md:min-w-[320px] relative ".concat(isClosingModal ? 'animate-popOutCenter' : 'animate-popUpCenter')
  }, /*#__PURE__*/React.createElement("button", {
    onClick: closeVictoryModal,
    className: "absolute top-2 right-4 text-slate-400 hover:text-[#2d2a26] text-2xl font-black"
  }, "\u2715"), isBrawlMode ? /*#__PURE__*/React.createElement("div", {
    className: "w-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-5xl mb-2"
  }, "\u2694\uFE0F\uD83C\uDFC6"), /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl font-black text-purple-700 mb-3 uppercase tracking-wide"
  }, "\u5927\u4E82\u9B25\u7D50\u679C\uFF01"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2 mb-5 text-left max-h-[240px] overflow-y-auto pr-1 custom-scrollbar"
  }, brawlWinners.map(function (w, i) {
    var medals = ['🥇', '🥈', '🥉'];
    var medal = medals[i] || "".concat(i + 1);
    return /*#__PURE__*/React.createElement("div", {
      key: w.id,
      className: "flex items-center gap-3 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 shadow-sm animate-fadeIn"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-2xl w-8 shrink-0 text-center"
    }, medal), /*#__PURE__*/React.createElement("span", {
      className: "w-3 h-full shrink-0 rounded-full self-stretch",
      style: {
        backgroundColor: w.color === 'rainbow' ? 'transparent' : w.color,
        minWidth: '4px',
        maxWidth: '4px',
        background: w.color === 'rainbow' ? 'linear-gradient(to bottom, red, orange, yellow, green, blue, indigo, violet)' : w.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "font-black text-slate-800 flex-1 truncate"
    }, w.name), /*#__PURE__*/React.createElement("span", {
      className: "font-mono text-blue-600 text-sm shrink-0"
    }, "\u23F1 ", w.time));
  }), function () {
    var limit = brawlSettings.winnersCount || 1;
    var placeholders = [];
    for (var i = brawlWinners.length; i < limit; i++) {
      var medals = ['🥇', '🥈', '🥉'];
      var medal = medals[i] || "".concat(i + 1);
      placeholders.push( /*#__PURE__*/React.createElement("div", {
        key: "wait-".concat(i),
        className: "flex items-center gap-3 bg-slate-100/50 border-2 border-slate-100 border-dashed rounded-xl px-3 py-2 opacity-50"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-2xl w-8 shrink-0 text-center filter grayscale"
      }, medal), /*#__PURE__*/React.createElement("span", {
        className: "w-1 h-full shrink-0 bg-slate-300 rounded-full self-stretch"
      }), /*#__PURE__*/React.createElement("span", {
        className: "font-bold text-slate-400 flex-1 italic text-sm"
      }, "\u7B49\u5F85\u7B2C ", i + 1, " \u540D\u5B8C\u6210...")));
    }
    return placeholders;
  }(), brawlWinners.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "text-slate-400 text-center font-bold py-4"
  }, "\u5C1A\u7121\u5B8C\u6210\u8005")), /*#__PURE__*/React.createElement("div", {
    className: "border-t-2 border-dashed border-slate-200 pt-3 mb-2"
  })) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-6xl mb-3"
  }, "\uD83D\uDCA5\uD83C\uDFC6"), /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl font-black text-[#2d2a26] mb-1 uppercase tracking-wide"
  }, "\u5B8C\u7F8E\u901A\u95DC\uFF01"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-600 mb-6 text-sm font-bold border-b-2 border-dashed border-slate-300 pb-4"
  }, "\u5B8C\u6210\u6642\u9593\uFF1A", endTime ? formatTime(Math.floor((endTime - startTime) / 1000)) : "00:00")), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-center gap-3 flex-wrap w-full mt-4"
  }, !isMultiplayer ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: handlePlayAgain,
    className: "flex-1 px-3 py-3 bg-[#ffcc00] text-[#2d2a26] border-[4px] border-[#2d2a26] font-black rounded-xl shadow-[4px_4px_0px_#2d2a26] hover:translate-y-[2px] hover:shadow-none transition-all text-sm sm:text-base"
  }, "\u4E0B\u4E00\u984C (\u540C\u8A2D\u5B9A)"), /*#__PURE__*/React.createElement("button", {
    onClick: handleGoHome,
    className: "flex-1 px-3 py-3 bg-white text-[#2d2a26] border-[4px] border-[#2d2a26] font-black rounded-xl shadow-[4px_4px_0px_#2d2a26] hover:translate-y-[2px] hover:shadow-none transition-all text-sm sm:text-base"
  }, "\u8FD4\u56DE\u4E3B\u9078\u55AE")) : /*#__PURE__*/React.createElement(React.Fragment, null, matchPhase === 'finished' ? isHostRef.current || stateRef.current.brawlSettings.allowOthersToPlayAgain !== false ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: handlePlayAgain,
    className: "flex-1 px-3 py-3 bg-[#ffcc00] text-[#2d2a26] border-[4px] border-[#2d2a26] font-black rounded-xl shadow-[4px_4px_0px_#2d2a26] hover:translate-y-[2px] hover:shadow-none transition-all text-sm sm:text-base"
  }, "\u518D\u4F86\u4E00\u5C40 (\u540C\u8A2D\u5B9A)"), /*#__PURE__*/React.createElement("button", {
    onClick: handleBackToLobby,
    className: "flex-1 px-3 py-3 bg-white text-[#2d2a26] border-[4px] border-[#2d2a26] font-black rounded-xl shadow-[4px_4px_0px_#2d2a26] hover:translate-y-[2px] hover:shadow-none transition-all text-sm sm:text-base"
  }, "\u8FD4\u56DE\u5927\u5EF3")) : /*#__PURE__*/React.createElement("span", {
    className: "font-black text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border-2 border-slate-300 w-full text-center"
  }, "\u23F3 \u7B49\u5F85\u623F\u4E3B\u6C7A\u5B9A\u4E0B\u4E00\u5C40...") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setHideVictoryModal(true);
      setFinishViewMode('god');
      toggleSpectator(myId, true, true);
      showToast("👁️ 已轉變為上帝模式，您可以繼續觀看其他玩家比賽");
    },
    className: "flex-1 px-3 py-3 bg-purple-100 text-purple-700 border-[4px] border-purple-700 font-black rounded-xl shadow-[4px_4px_0px_#6d28d9] hover:translate-y-[2px] hover:shadow-none transition-all text-sm sm:text-base"
  }, "\uD83D\uDC41\uFE0F \u8F49\u8B8A\u70BA\u4E0A\u5E1D\u6A21\u5F0F (\u89C0\u6230)"), /*#__PURE__*/React.createElement("div", {
    className: "w-full text-xs font-bold text-slate-400 mt-2 animate-pulse"
  }, "\u6BD4\u8CFD\u5C1A\u672A\u7D50\u675F\uFF0C\u60A8\u53EF\u4EE5\u5148\u8F49\u70BA\u89C0\u6230\u6A21\u5F0F...")))))), (isWon || isBrawlMode && winner) && hideVictoryModal && /*#__PURE__*/React.createElement("div", {
    className: "absolute bottom-20 inset-x-0 flex flex-col items-center gap-3 z-50 pointer-events-none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pointer-events-auto bg-white/90 backdrop-blur-sm border-2 border-slate-800 p-1 rounded-xl shadow-lg flex gap-1"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setFinishViewMode('my');
      toggleSpectator(myId, true, false);
    },
    className: "px-3 py-1.5 rounded-lg font-black text-xs transition-all ".concat(finishViewMode === 'my' ? 'bg-blue-500 text-white shadow-inner' : 'text-slate-500 hover:bg-slate-100')
  }, "\uD83D\uDC64 \u6211\u7684\u7248\u9762"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setFinishViewMode('god');
      toggleSpectator(myId, true, true);
    },
    className: "px-3 py-1.5 rounded-lg font-black text-xs transition-all ".concat(finishViewMode === 'god' ? 'bg-purple-500 text-white shadow-inner' : 'text-slate-500 hover:bg-slate-100')
  }, "\uD83D\uDC41\uFE0F \u4E0A\u5E1D\u8996\u89D2")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setHideVictoryModal(false);
    },
    className: "pointer-events-auto bg-[#ffcc00] text-[#2d2a26] border-[4px] border-[#2d2a26] px-6 py-3 rounded-full shadow-[6px_6px_0px_#2d2a26] hover:translate-y-[2px] transition-all font-black flex items-center gap-2 tracking-wide text-lg"
  }, "\uD83C\uDFC6 \u986F\u793A\u6210\u7E3E")))), flares.length > 0 && /*#__PURE__*/React.createElement("svg", {
    className: "fixed inset-0 pointer-events-none z-[120]",
    style: {
      width: '100vw',
      height: '100vh'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("filter", {
    id: "flareGlow"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "3",
    result: "blur"
  }), /*#__PURE__*/React.createElement("feMerge", null, /*#__PURE__*/React.createElement("feMergeNode", {
    "in": "blur"
  }), /*#__PURE__*/React.createElement("feMergeNode", {
    "in": "SourceGraphic"
  })))), flares.map(function (f) {
    var cpX = (f.startX + f.endX) / 2;
    var cpY = Math.min(f.startY, f.endY) - 200;
    var pathD = "M ".concat(f.startX, " ").concat(f.startY, " Q ").concat(cpX, " ").concat(cpY, " ").concat(f.endX, " ").concat(f.endY);
    return /*#__PURE__*/React.createElement("g", {
      key: f.id
    }, /*#__PURE__*/React.createElement("path", {
      d: pathD,
      fill: "none",
      stroke: "#fcd34d",
      strokeWidth: "2",
      strokeDasharray: "5,5",
      opacity: "0.4"
    }), /*#__PURE__*/React.createElement("circle", {
      r: "12",
      fill: "#fff",
      filter: "url(#flareGlow)"
    }, /*#__PURE__*/React.createElement("animateMotion", {
      path: pathD,
      dur: "0.6s",
      fill: "freeze",
      calcMode: "spline",
      keyTimes: "0;1",
      keySplines: "0.4 0 0.2 1"
    }), /*#__PURE__*/React.createElement("animate", {
      attributeName: "opacity",
      values: "1;0",
      begin: "0.5s",
      dur: "0.1s",
      fill: "freeze"
    }), /*#__PURE__*/React.createElement("animate", {
      attributeName: "r",
      values: "8;16;0",
      keyTimes: "0;0.8;1",
      dur: "0.6s",
      fill: "freeze"
    })));
  })), colorPickerTarget && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm pointer-events-auto animate-fadeIn",
    onClick: function onClick(e) {
      e.stopPropagation();
      setColorPickerTarget(null);
      setColorSeq([]);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#fffdfa] border-[3px] border-slate-800 rounded-xl p-4 shadow-[8px_8px_0px_rgba(30,41,59,1)] animate-popUpCenter max-w-[280px] w-full mx-4",
    onClick: function onClick(e) {
      return e.stopPropagation();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-3 border-b-2 border-slate-800 pb-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-sm font-black text-slate-800"
  }, "\u2699\uFE0F \u500B\u4EBA\u8A2D\u5B9A"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setColorPickerTarget(null);
      setColorSeq([]);
    },
    className: "text-slate-400 hover:text-slate-800 font-black text-lg leading-none"
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] md:text-xs font-bold text-slate-600 mb-1"
  }, "\u4FEE\u6539\u66B1\u7A31\uFF1A"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: editName,
    onChange: function onChange(e) {
      return setEditName(e.target.value);
    },
    placeholder: "\u8F38\u5165\u65B0\u66B1\u7A31",
    className: "w-full border-2 border-slate-800 rounded px-2 py-1 text-xs font-bold outline-none focus:ring-1 ring-[#ffcc00]"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick(e) {
      e.stopPropagation();
      var newName = editName.trim();
      if (!newName) return showToast("⚠️ 暱稱不能為空");
      if (playersList.some(function (p) {
        return p.name === newName && p.id !== colorPickerTarget;
      })) return showToast("⚠️ 此暱稱已被其他人使用");
      handlePlayerNameChange(colorPickerTarget, newName);
      setColorPickerTarget(null);
      setColorSeq([]);
    },
    className: "bg-blue-500 text-white font-bold text-[10px] md:text-xs px-3 rounded border-2 border-slate-800 hover:bg-blue-600 active:translate-y-[1px] whitespace-nowrap"
  }, "\u5132\u5B58"))), /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] md:text-xs font-bold text-slate-600 mb-1"
  }, "\u4FEE\u6539\u4EE3\u8868\u8272\uFF1A"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-5 gap-2"
  }, COLORS.map(function (color) {
    return /*#__PURE__*/React.createElement("button", {
      key: color,
      onClick: function onClick(e) {
        e.stopPropagation();
        var colorIdx = COLORS.indexOf(color);
        var newSeq = [].concat(_toConsumableArray(colorSeq), [colorIdx]);
        var targetSeq = [0, 4, 15, 19];
        var isValid = true;
        for (var i = 0; i < newSeq.length; i++) {
          if (newSeq[i] !== targetSeq[i]) {
            isValid = false;
            break;
          }
        }
        if (isValid) {
          setColorSeq(newSeq);
          if (newSeq.length === 4) {
            handlePlayerColorChange(colorPickerTarget, 'rainbow');
            setColorPickerTarget(null);
            showToast("🌈 解鎖隱藏彩色漸變！");
            setColorSeq([]);
          } else handlePlayerColorChange(colorPickerTarget, color);
        } else {
          setColorSeq([]);
          handlePlayerColorChange(colorPickerTarget, color);
          setColorPickerTarget(null);
        }
      },
      className: "w-8 h-8 rounded-full border-[2px] border-slate-800 shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:scale-110 hover:shadow-[3px_3px_0px_rgba(30,41,59,1)] transition-all active:scale-95 active:shadow-none mx-auto",
      style: {
        backgroundColor: color
      },
      title: color
    });
  })))), showSaveModal && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#fffdfa] border-[4px] border-[#2d2a26] rounded-2xl p-6 shadow-[10px_10px_0px_rgba(30,41,59,1)] w-full max-w-md animate-popUpCenter"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-black text-slate-800 mb-2 border-b-4 border-blue-500 inline-block pb-1"
  }, "\uD83D\uDCBE \u5B58\u6A94\u8207\u8B80\u6A94"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-bold text-slate-600 mb-4"
  }, "\u5C07\u9032\u5EA6\u8F49\u63DB\u70BA\u4EE3\u78BC\uFF0C\u4E0B\u6B21\u8CBC\u4E0A\u4EE3\u78BC\u5373\u53EF\u6062\u5FA9\uFF01"), /*#__PURE__*/React.createElement("div", {
    className: "mb-6"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleSaveCode,
    className: "w-full py-3 bg-blue-500 text-white border-4 border-slate-800 rounded-xl font-black shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all mb-3 text-base md:text-lg"
  }, "\u7522\u751F\u9032\u5EA6\u4EE3\u78BC (\u81EA\u52D5\u8907\u88FD)"), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("textarea", {
    id: "saveCodeTextarea",
    value: saveCode,
    onChange: function onChange(e) {
      return setSaveCode(e.target.value);
    },
    placeholder: "\u9EDE\u64CA\u4E0A\u65B9\u6309\u9215\u751F\u6210\uFF0C\u6216\u662F\u624B\u52D5\u8CBC\u4E0A\u820A\u4EE3\u78BC\u81F3\u6B64\u8655",
    rows: "4",
    className: "w-full border-4 border-slate-800 rounded-xl p-3 pb-12 font-mono text-sm shadow-inner outline-none focus:bg-blue-50 break-all bg-white"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleQuickPaste,
    className: "absolute bottom-3 right-3 bg-[#ffcc00] text-slate-900 px-3 py-1.5 rounded-lg text-sm font-black border-2 border-slate-800 hover:bg-[#e6b800] shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all active:translate-y-1 active:shadow-none"
  }, "\uD83D\uDCCB \u5FEB\u901F\u8CBC\u4E0A"))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowSaveModal(false);
    },
    className: "flex-1 py-3 bg-white border-4 border-slate-800 rounded-xl font-black text-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all"
  }, "\u95DC\u9589"), /*#__PURE__*/React.createElement("button", {
    onClick: handleLoadCode,
    className: "flex-1 py-3 bg-emerald-400 text-slate-900 border-4 border-slate-800 rounded-xl font-black shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all"
  }, "\u8F09\u5165\u4EE3\u78BC")))), toastMsg && /*#__PURE__*/React.createElement("div", {
    className: "fixed top-10 left-1/2 transform -translate-x-1/2 bg-white text-slate-800 px-6 py-3 rounded-xl border-[3px] border-slate-800 font-black shadow-[4px_4px_0px_rgba(30,41,59,1)] z-[100] animate-slideUpFade flex items-center justify-center gap-2 whitespace-pre-line text-center"
  }, toastMsg), !isSpectator && screen === 'game' && /*#__PURE__*/React.createElement("div", {
    className: "fixed bottom-0 left-0 right-0 z-[100] pb-safe"
  }, matchPhase === 'playing' && /*#__PURE__*/React.createElement("div", {
    className: "absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-row gap-4 items-center pointer-events-none"
  }, unopenedGifts[myId] && unopenedGifts[myId].length > 0 && /*#__PURE__*/React.createElement("button", {
    id: "btn-open-gift",
    onClick: handleOpenGift,
    className: "pointer-events-auto relative w-14 h-14 bg-pink-500 rounded-full border-[3px] border-slate-800 shadow-[4px_4px_0px_#1e293b] text-3xl animate-bounce flex items-center justify-center p-0"
  }, "\uD83C\uDF81 ", /*#__PURE__*/React.createElement("div", {
    className: "absolute -top-1.5 -right-1.5 bg-red-500 text-white font-black text-xs w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-800"
  }, unopenedGifts[myId].length)), isBrawlMode && myWeapons.filter(function (w) {
    return w === 'balloon';
  }).length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return handleUseWeapon('balloon');
    },
    className: "pointer-events-auto relative w-14 h-14 bg-violet-500 rounded-full border-[3px] border-slate-800 shadow-[4px_4px_0px_#1e293b] text-3xl anim-weapon flex items-center justify-center"
  }, "\uD83D\uDCA7 ", myWeapons.filter(function (w) {
    return w === 'balloon';
  }).length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-900 font-black text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-800"
  }, myWeapons.filter(function (w) {
    return w === 'balloon';
  }).length)), isBrawlMode && myWeapons.filter(function (w) {
    return w === 'eraser';
  }).length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return handleUseWeapon('eraser');
    },
    className: "pointer-events-auto relative w-14 h-14 bg-orange-500 rounded-full border-[3px] border-slate-800 shadow-[4px_4px_0px_#1e293b] text-3xl anim-weapon flex items-center justify-center"
  }, "\uD83E\uDDF9 ", myWeapons.filter(function (w) {
    return w === 'eraser';
  }).length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-900 font-black text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-800"
  }, myWeapons.filter(function (w) {
    return w === 'eraser';
  }).length))), /*#__PURE__*/React.createElement("div", {
    className: "bg-[#fffdfa]/95 backdrop-blur-md border-t-[4px] border-slate-800 h-16 md:h-20 flex items-center justify-between px-3 md:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 md:gap-3 bg-slate-100 p-1 rounded-xl border-2 border-slate-300"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleCycleZoom,
    className: "w-11 h-11 md:w-14 md:h-14 bg-white border-[3px] border-slate-800 rounded-lg shadow-[2px_2px_0px_#1e293b] active:translate-y-[2px] active:shadow-none flex items-center justify-center text-xs md:text-sm font-black transition-all hover:bg-[#ffcc00] group",
    title: "\u5FAA\u74B0\u5207\u63DB\u7E2E\u653E\u6A21\u5F0F"
  }, zoomIndicator.visible ? /*#__PURE__*/React.createElement("span", {
    className: "text-blue-600 scale-110"
  }, zoomIndicator.value.toFixed(1), "X") : zoomModeIdx === 0 ? '1X' : zoomModeIdx === 1 ? '↔️' : zoomModeIdx === 2 ? '↕️' : '🔲'), /*#__PURE__*/React.createElement("div", {
    className: "w-[2px] h-6 bg-slate-300 hidden md:block"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleZoomOut,
    className: "w-10 h-10 md:w-12 md:h-12 bg-white border-[3px] border-slate-800 rounded-lg shadow-[2px_2px_0px_#1e293b] active:translate-y-[2px] active:shadow-none flex items-center justify-center text-xl font-black",
    title: "\u7E2E\u5C0F"
  }, "\uFF0D"), /*#__PURE__*/React.createElement("button", {
    onClick: handleZoomIn,
    className: "w-10 h-10 md:w-12 md:h-12 bg-white border-[3px] border-slate-800 rounded-lg shadow-[2px_2px_0px_#1e293b] active:translate-y-[2px] active:shadow-none flex items-center justify-center text-xl font-black",
    title: "\u653E\u5927"
  }, "\uFF0B")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 md:gap-2 bg-slate-800 p-1 rounded-2xl border-2 border-slate-800 shadow-inner",
    title: "\u8F38\u5165\u65B9\u5F0F"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setInputMode('num');
    },
    className: "px-3 md:px-5 py-1.5 md:py-2 rounded-xl font-black text-sm md:text-base flex items-center gap-1.5 md:gap-2 transition-all ".concat(inputMode === 'num' ? 'bg-[#ffcc00] text-slate-900 shadow-md scale-105' : 'text-slate-400 hover:text-white')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD22"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "\u6578\u5B57\u5148\u884C")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setInputMode('cell');
    },
    className: "px-3 md:px-5 py-1.5 md:py-2 rounded-xl font-black text-sm md:text-base flex items-center gap-1.5 md:gap-2 transition-all ".concat(inputMode === 'cell' ? 'bg-sky-400 text-slate-900 shadow-md scale-105' : 'text-slate-400 hover:text-white')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC46"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "\u683C\u5B50\u5148\u884C"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 md:gap-2 bg-slate-800 p-1 rounded-2xl border-2 border-slate-800 shadow-inner"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setInteractionMode(0);
    },
    className: "px-3 md:px-5 py-1.5 md:py-2 rounded-xl font-black text-sm md:text-base flex items-center gap-1.5 md:gap-2 transition-all ".concat(interactionMode === 0 ? 'bg-[#ffcc00] text-slate-900 shadow-md scale-105' : 'text-slate-400 hover:text-white')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD8B\uFE0F"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "\u586B\u7B54")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setInteractionMode(1);
    },
    className: "px-3 md:px-5 py-1.5 md:py-2 rounded-xl font-black text-sm md:text-base flex items-center gap-1.5 md:gap-2 transition-all ".concat(interactionMode === 1 ? 'bg-[#ffcc00] text-slate-900 shadow-md scale-105' : 'text-slate-400 hover:text-white')
  }, /*#__PURE__*/React.createElement("span", null, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "\u7B46\u8A18")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (interactionMode === 2) setModeSubOpen(!modeSubOpen);else {
        setInteractionMode(2);
        setModeSubOpen(true);
      }
    },
    className: "px-3 md:px-5 py-1.5 md:py-2 rounded-xl font-black text-sm md:text-base flex items-center gap-1.5 md:gap-2 transition-all relative ".concat(interactionMode === 2 ? 'bg-emerald-400 text-slate-900 shadow-md scale-105' : 'text-slate-400 hover:text-white')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD8C\uFE0F"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "\u5857\u9D09"), interactionMode === 2 && modeSubOpen && /*#__PURE__*/React.createElement("div", {
    className: "absolute bottom-full mb-6 right-0 flex flex-col gap-3 bg-white border-[3px] border-slate-800 p-2.5 rounded-2xl shadow-[10px_10px_0px_rgba(30,41,59,0.2)] animate-popUpCenter pointer-events-auto"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick(e) {
      e.stopPropagation();
      setDrawSubMode('pen');
    },
    className: "w-12 h-12 border-[3px] border-slate-800 rounded-xl flex items-center justify-center transition-all shadow-[2px_2px_0px_#1e293b] active:shadow-none active:translate-y-[2px] ".concat(drawSubMode === 'pen' ? 'bg-emerald-100 scale-110 border-emerald-600' : 'bg-white hover:bg-slate-50'),
    title: "\u756B\u7B46\u6A21\u5F0F"
  }, "\uD83D\uDD8C\uFE0F"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick(e) {
      e.stopPropagation();
      setDrawSubMode('eraser');
    },
    onDoubleClick: function onDoubleClick(e) {
      e.stopPropagation();
      clearOwnStrokes();
    },
    className: "w-12 h-12 border-[3px] border-slate-800 rounded-xl flex items-center justify-center transition-all shadow-[2px_2px_0px_#1e293b] active:shadow-none active:translate-y-[2px] ".concat(drawSubMode === 'eraser' ? 'bg-orange-100 scale-110 border-orange-600' : 'bg-white hover:bg-slate-50'),
    title: "\u6A61\u76AE\u64E6 (\u96D9\u64CA\u6E05\u9664\u81EA\u5DF1\u6240\u6709\u5857\u9D09)"
  }, "\uD83E\uDDFD"), isHostRef.current && !isBrawlMode && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick(e) {
      e.stopPropagation();
      clearAllStrokes();
    },
    className: "w-12 h-12 bg-rose-50 border-[3px] border-rose-800 text-rose-800 rounded-xl flex items-center justify-center hover:bg-rose-100 shadow-[2px_2px_0px_#1e293b] active:shadow-none active:translate-y-[2px]",
    title: "\u623F\u4E3B\uFF1A\u6E05\u9664\u5168\u5834\u5857\u9D09"
  }, "\uD83D\uDEAE")))))));
}
var renderApp = function renderApp() {
  var root = ReactDOM.createRoot(document.getElementById('sudoku-root'));
  root.render(React.createElement(window.PlatBoundary, null, React.createElement(SudokuGame)));
};
renderApp();