
    const { useState, useEffect, useMemo, useRef } = React;

    // === 20 色票 ===
    const COLORS = [
      '#E3002B', '#F35B00', '#FFC90E', '#D7157A', '#E895C0',
      '#007A61', '#87D300', '#C4D600', '#8DD1BF', '#616130',
      '#00538A', '#008CC1', '#00C1D5', '#79C8ED', '#CDBB79',
      '#41136A', '#935CB9', '#BCA8D1', '#7A0026', '#BC7B70'
    ];

    // === 關卡設定 ===
    const LEVELS = [
      { id: 1, name: "5x5 幼幼班", width: 5, height: 5, description: "最簡單的暖身關卡，試著連連看。" },
      { id: 2, name: "10x10 標準", width: 10, height: 10, description: "標準難度，注意所有島嶼都要連通喔！" },
      { id: 3, name: "10x20 手機直式", width: 10, height: 20, description: "適合手機滑動的長條形地圖。" },
      { id: 4, name: "15x15 魔王", width: 15, height: 15, description: "極具挑戰性！找尋角落的大數字作為突破口。" },
      { id: 5, name: "20x20 史詩", width: 20, height: 20, description: "超大地圖，請善用右下角的畫面縮放功能。" },
      { id: 'custom', name: "⚙️ 自訂尺寸", width: 30, height: 30, description: "自訂地圖長寬，適合多人合作挑戰！" }
    ];

    // === 首次教學導覽步驟 ===
    const TUTORIAL_STEPS = [
      { icon: "🌉", title: "歡迎來到數橋！", body: "每個圓圈是一座「島」，上面的數字代表這座島需要幾座橋。你的任務：用橋把所有島連成一張網！" },
      { icon: "👆", title: "怎麼架橋？", body: "從島嶼按住拖曳，會看到預覽線跟著手指，放開即架橋；按住不放也會進入拖曳預覽；也可以直接點擊兩座島之間的空白處：點一下架 1 座橋、點兩下架 2 座、點第三下取消。橋只能走直線或橫線，而且橋跟橋之間不能交叉喔！", demo: 'bridge' },
      { icon: "✏️", title: "草稿模式", body: "右下角按鈕可以切換到 ✏️ 草稿模式，先用虛線記下不確定的橋，確定後再轉成實線。", demo: 'draft' },
      { icon: "🔍", title: "縮放與操作", body: "雙指開合可以縮放地圖，也可以用右下角的 ＋ － 按鈕。向下滑動畫布可以自動收合上方選單，爭取更多空間。" },
      { icon: "🌐", title: "多人合作", body: "從主選單進入「多人合作」，一人按「建立房間」拿到 4 位數代碼，朋友按「加入房間」輸入代碼就能一起解題！每個人的橋會用不同顏色顯示。" },
      { icon: "🔌", title: "跟朋友連線", body: "房主建立房間拿代碼 → 把代碼傳給朋友 → 朋友輸入代碼加入 → 連線成功！", demo: 'connect' }
    ];

    const getAvailableColor = (currentPlayers) => {
        const usedColors = currentPlayers.map(p => p.color);
        const available = COLORS.filter(c => !usedColors.includes(c));
        if (available.length > 0) {
            return available[Math.floor(Math.random() * available.length)];
        }
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    };

    function formatTime(secs) {
      const m = String(Math.floor(secs / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      return m + ":" + s;
    }

    // ⭐ 每局星級評分：timeSec 完成秒數、islandCount 島數、usedSolution 是否看過解答
    function computeStars(timeSec, islandCount, usedSolution) {
      if (usedSolution) return 1;
      if (timeSec <= islandCount * 6) return 3;
      if (timeSec <= islandCount * 15) return 2;
      return 1;
    }

    function GameTimer({ startTime, endTime, isRunning }) {
        const [now, setNow] = useState(Date.now());
        useEffect(() => {
            if (!isRunning) return;
            setNow(Date.now());
            const t = setInterval(() => setNow(Date.now()), 1000);
            return () => clearInterval(t);
        }, [isRunning, startTime]);

        const timeToUse = endTime ? endTime : now;
        const secs = Math.max(0, Math.floor((timeToUse - startTime) / 1000));
        return <span>⏱ {formatTime(secs)}</span>;
    }

    // ==========================================
    // 每日一題：確定性隨機（零伺服器，同一天全世界同一題）
    // ==========================================
    // 台灣可愛動物隨機暱稱（多人連線用，約30個）
    // ===== ANIMAL-NAMES-START =====
    const ANIMAL_NAMES = [
      '柴犬', '柯基', '虎斑貓', '橘貓', '倉鼠', '兔兔', '刺蝟', '龍貓', '水豚', '樹懶',
      '狐獴', '羊駝', '企鵝', '海獺', '貓頭鷹', '松鼠', '無尾熊', '台灣黑熊', '石虎', '穿山甲',
      '梅花鹿', '台灣藍鵲', '帝雉', '獼猴', '山羌', '綠蠵龜', '櫻花鉤吻鮭', '飛魚', '螢火蟲', '獨角仙'
    ];
    function normName(n) { return (n || '').trim().toLowerCase(); }
    // ===== ANIMAL-NAMES-END =====

    // ===== DAILY-CHALLENGE-START ===

    // (moved to js/puzzle.js: mulberry32)


    // (moved to js/puzzle.js: hashDateStr)


    // (moved to js/puzzle.js: getDailyDateStr)


    // (moved to js/puzzle.js: shiftDateStr)


    // (moved to js/puzzle.js: getDailySeed)

    function readDailyRecord(dateStr) {
      try {
        const raw = localStorage.getItem('hashi_daily_' + dateStr);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    }
    function readDailyStreak() {
      try {
        const raw = localStorage.getItem('hashi_daily_streak');
        const s = raw ? JSON.parse(raw) : null;
        return (s && typeof s.count === 'number') ? s : { count: 0, lastDate: '' };
      } catch (e) { return { count: 0, lastDate: '' }; }
    }
    function getDailyStatus(dateStr) {
      const d = clampDailyDate(dateStr);
      return { dateStr: d, done: readDailyRecord(d), streak: readDailyStreak().count };
    }
    // 每日一題可玩的日期範圍：今天以前（含今天），未來不行
    const MIN_DAILY_DATE = '2026-01-01';
    function clampDailyDate(d) {
      const today = HASHI_PUZZLE.getDailyDateStr();
      if (!d) return today;
      if (d > today) return today;
      if (d < MIN_DAILY_DATE) return MIN_DAILY_DATE;
      return d;
    }
    // ===== DAILY-CHALLENGE-END =====

    // ==========================================
    // 全新高密度智慧演算法 (網格掃描 + Kruskal生成樹)
    // ==========================================

    // (moved to js/puzzle.js: generateRandomHashi)



    // (moved to js/puzzle.js: generateEmptyBridges)


    // ==========================================
    // React 主程式 (v2.0：移除雲端伺服器，僅保留 PeerJS 免費直連)
    // ==========================================

    function HashiGame() {
      const playerIdRef = useRef(Math.random().toString(36).substring(2, 12));
      const myId = playerIdRef.current;
      const myNameRef = useRef("");
      const myColorRef = useRef(COLORS[0]);

      const initialDataRef = useRef(null);
      if (!initialDataRef.current) {
        initialDataRef.current = HASHI_PUZZLE.generateUniqueHashi(LEVELS[1]);
      }

      const [screen, setScreen] = useState('home');
      const [engine, setEngine] = useState('none');
      const [currentLevelId, setCurrentLevelId] = useState(2);

      const [randomLevelData, setRandomLevelData] = useState(initialDataRef.current);
      const [bridges, setBridges] = useState(() => HASHI_PUZZLE.generateEmptyBridges(initialDataRef.current));
      const [strokes, setStrokes] = useState([]);

      const [history, setHistory] = useState([]);
      const [isWon, setIsWon] = useState(false);
      const [hideVictoryModal, setHideVictoryModal] = useState(false);
      const [toastMsg, setToastMsg] = useState("");

      const [startTime, setStartTime] = useState(Date.now());
      const [endTime, setEndTime] = useState(null);

      const [zoomLevel, setZoomLevel] = useState(1);
      const [showSolution, setShowSolution] = useState(false);
      const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);

      const [showSaveModal, setShowSaveModal] = useState(false);
      const [saveCode, setSaveCode] = useState("");

      const [showCustomModal, setShowCustomModal] = useState(false);
      const [tempWidth, setTempWidth] = useState(30);
      const [tempHeight, setTempHeight] = useState(30);

      const [interactionMode, setInteractionMode] = useState(0);
      const [drawSubMode, setDrawSubMode] = useState('pen');

      const modeIcons = ['🖋️', '✏️', '🖌️'];
      const modeTitles = ['實線模式', '草稿模式', '繪圖作記號'];

      const [zoomModeIdx, setZoomModeIdx] = useState(0);
      const [isClosingModal, setIsClosingModal] = useState(false);
      const [isGenerating, setIsGenerating] = useState(false);
      const [boardFadeKey, setBoardFadeKey] = useState(0); // 新題目時棋盤淡入

      const [hoveredBridgeId, setHoveredBridgeId] = useState(null);
      const [hoveredIslandId, setHoveredIslandId] = useState(null);

      const [colorPickerTarget, setColorPickerTarget] = useState(null);
      const [colorSeq, setColorSeq] = useState([]);

      // 💾 記住暱稱與房號（同一裝置下次免重打；房主代碼固定不變）
      const loadSavedNickname = () => { try { return localStorage.getItem('hashi_nickname') || ""; } catch (e) { return ""; } };
      const saveNickname = (n) => { try { if (n) localStorage.setItem('hashi_nickname', n); } catch (e) {} };
      const loadLastRoom = () => { try { return localStorage.getItem('hashi_last_room') || ""; } catch (e) { return ""; } };
      const saveLastRoom = (r) => { try { if (r) localStorage.setItem('hashi_last_room', r); } catch (e) {} };
      const loadHostRoom = () => { try { return localStorage.getItem('hashi_host_room') || ""; } catch (e) { return ""; } };
      const saveHostRoom = (r) => { try { if (r) localStorage.setItem('hashi_host_room', r); } catch (e) {} };
      const clearHostRoom = () => { try { localStorage.removeItem('hashi_host_room'); } catch (e) {} };

      const [roomId, setRoomId] = useState("");
      const [isHost, setIsHost] = useState(false);
      const [tempRoomId, setTempRoomId] = useState(() => loadLastRoom());
      const [tempPlayerName, setTempPlayerName] = useState("");
      const [namePlaceholderAnimal] = useState(() => ANIMAL_NAMES[(Math.random() * ANIMAL_NAMES.length) | 0]);
      const nameInputRef = useRef(null);
      const [joinStep, setJoinStep] = useState('choose'); // 'choose' | 'hostSetup' | 'guestSetup' | 'connecting' | 'nick'
      const [takenNames, setTakenNames] = useState([]);   // 來賓：房主回傳的已用名單快照
      const [nickError, setNickError] = useState("");      // nick 步輸入框下方 inline 錯誤
      const joinRoleRef = useRef(null);        // 'host' | 'guest'
      const joinActiveRef = useRef(false);     // 是否正在 join 流程中（供斷線／錯誤判斷）
      const suppressCloseRef = useRef(false);  // 主動清理連線時壓住 close 事件雜訊
      const autoNameRef = useRef(false); // 本次加入用的名字是否來自拉霸機（REQ_REJOIN 沿用）
      const hostRoomRetryRef = useRef(false); // 房主固定代碼衝突時只自動重試一次
      // 🎰 暱稱拉霸機
      const [showSlotMachine, setShowSlotMachine] = useState(false);
      const [slotMode, setSlotMode] = useState('host');
      const [slotPool, setSlotPool] = useState(ANIMAL_NAMES);
      const [slotName, setSlotName] = useState("");
      const [slotSpinning, setSlotSpinning] = useState(false);
      const [slotFinalName, setSlotFinalName] = useState("");
      const [slotWaiting, setSlotWaiting] = useState(false);
      const [slotRound, setSlotRound] = useState(0);
      const slotPoolRef = useRef(ANIMAL_NAMES);
      const slotFinalNameRef = useRef("");
      const slotTimerRef = useRef(null);
      const guestAutoNameRef = useRef(false);
      const guestJoinedRef = useRef(false);
      const guestNamesResolvedRef = useRef(false);
      const guestNamesTimeoutRef = useRef(null);
      const [playersList, setPlayersList] = useState([]);
      const [isConnecting, setIsConnecting] = useState(false);

      const [showOtherCursors, setShowOtherCursors] = useState(true);
      const [cursors, setCursors] = useState({});
      const [ripples, setRipples] = useState([]);

      // 💬 聊天室
      const [chatMsgs, setChatMsgs] = useState([]); // {id, uid, name, color, text, ts, mine}
      const [chatOpen, setChatOpen] = useState(false);
      const [chatInput, setChatInput] = useState('');
      const [unreadChat, setUnreadChat] = useState(0);
      const chatOpenRef = useRef(false);
      const chatListRef = useRef(null);
      const [chatMin, setChatMin] = useState(false); // 💬 聊天室收合

      // 💬 聊天室邏輯
      useEffect(function() { chatOpenRef.current = chatOpen; if (chatOpen) setUnreadChat(0); }, [chatOpen]);
      useEffect(function() { // 新訊息自動捲到底
        const el = chatListRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      }, [chatMsgs, chatOpen]);
      const appendChatMsg = (m) => {
        const msg = { id: 'c' + Date.now() + '_' + Math.floor(Math.random() * 1000000), uid: m.uid, name: m.name || '對手', color: m.color || '#3b82f6', text: String(m.text || '').slice(0, 200), ts: m.ts || Date.now(), mine: m.uid === myId };
        setChatMsgs(prev => [...prev.slice(-99), msg]);
        if (!msg.mine && !chatOpenRef.current) setUnreadChat(prev => prev + 1);
      };
      const sendChat = () => {
        const text = chatInput.trim();
        if (!text || engineRef.current !== 'peerjs') return;
        const msg = { type: 'CHAT', uid: myId, name: (myNameRef.current || '你'), color: myColorRef.current, text: text, ts: Date.now() };
        appendChatMsg(msg);
        setChatInput('');
        try {
          if (isHostRef.current) { connsRef.current.forEach(c => { if (c.open) c.send(msg); }); }
          else if (connRef.current && connRef.current.open) { connRef.current.send(msg); }
        } catch (e) {}
      };

      // 📹 圓形視訊（PeerJS MediaConnection，走 WebRTC 不經伺服器）
      const [videoOn, setVideoOn] = useState(false);
      const [micMuted, setMicMuted] = useState(false);
      const [localStream, setLocalStream] = useState(null);
      const [remoteVideos, setRemoteVideos] = useState({}); // uid -> MediaStream
      const localStreamRef = useRef(null);
      const videoCallsRef = useRef([]);
      const videoOnRef = useRef(false);
      useEffect(function() { videoOnRef.current = videoOn; }, [videoOn]);
      // 🔊 喇叭預設關閉；有人開麥發言時提示是否開音效
      const [speakerOn, setSpeakerOn] = useState(false);
      const [remoteMic, setRemoteMic] = useState({}); // uid -> muted(bool)
      const [speakPrompt, setSpeakPrompt] = useState(null); // {uid, name}
      const speakerOnRef = useRef(false);
      const speakPromptedRef = useRef({});
      useEffect(function() { speakerOnRef.current = speakerOn; }, [speakerOn]);
      useEffect(function() { // 喇叭開關即時套用到所有遠端視訊
        document.querySelectorAll('.remote-video-el').forEach(el => { try { el.muted = !speakerOn; } catch (e) {} });
        if (speakerOn) setSpeakPrompt(null);
      }, [speakerOn]);
      const broadcastMic = (muted) => {
        const msg = { type: 'MIC', uid: myId, name: (myNameRef.current || '你'), muted: muted };
        try {
          if (isHostRef.current) { connsRef.current.forEach(c => { if (c.open) c.send(msg); }); }
          else if (connRef.current && connRef.current.open) { connRef.current.send(msg); }
        } catch (e) {}
      };
      const handleMicMsg = (m) => {
        if (!m || m.uid === myId) return;
        setRemoteMic(prev => ({ ...prev, [m.uid]: !!m.muted }));
        if (m.muted) {
          speakPromptedRef.current[m.uid] = false;
          setSpeakPrompt(prev => (prev && prev.uid === m.uid) ? null : prev);
        } else if (!speakerOnRef.current && !speakPromptedRef.current[m.uid]) {
          speakPromptedRef.current[m.uid] = true;
          setSpeakPrompt({ uid: m.uid, name: m.name || '對手' });
        }
      };
      const handleIncomingCall = (call) => {
        try { call.answer(localStreamRef.current || undefined); } catch (e) { try { call.answer(); } catch (e2) {} }
        videoCallsRef.current.push(call);
        const remoteUid = (call.metadata && call.metadata.uid) || call.peer;
        call.on('stream', (rs) => {
          setRemoteVideos(prev => ({ ...prev, [remoteUid]: rs }));
          showToast('📹 對方開啟了視訊');
        });
        call.on('close', () => {
          setRemoteVideos(prev => { const n = { ...prev }; delete n[remoteUid]; return n; });
        });
      };
      const callAllPeers = (stream) => {
        const peer = peerRef.current;
        if (!peer) return;
        const doCall = (peerId, uid) => {
          try {
            const call = peer.call(peerId, stream, { metadata: { uid: myId, name: (myNameRef.current || '你') } });
            videoCallsRef.current.push(call);
            call.on('stream', (rs) => { setRemoteVideos(prev => ({ ...prev, [uid]: rs })); });
            call.on('close', () => { setRemoteVideos(prev => { const n = { ...prev }; delete n[uid]; return n; }); });
          } catch (e) {}
        };
        if (isHostRef.current) {
          connsRef.current.forEach(c => { if (c.uid && c.open) doCall(c.peer, c.uid); });
        } else if (connRef.current && connRef.current.open) {
          const hostEntry = playersListRef.current.find(p => p.isHost);
          doCall(connRef.current.peer, hostEntry ? hostEntry.id : connRef.current.peer);
        }
      };
      const stopVideo = () => {
        videoCallsRef.current.forEach(call => { try { call.close(); } catch (e) {} });
        videoCallsRef.current = [];
        const s = localStreamRef.current;
        if (s) { try { s.getTracks().forEach(t => t.stop()); } catch (e) {} }
        localStreamRef.current = null;
        setLocalStream(null); setRemoteVideos({}); setVideoOn(false); setMicMuted(false);
        setRemoteMic({}); setSpeakPrompt(null); speakPromptedRef.current = {};
      };
      const toggleVideo = async () => {
        if (videoOn) { stopVideo(); return; }
        if (engineRef.current !== 'peerjs') return;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          showToast('⚠️ 目前的環境不支援相機（預覽器不算），請上線後用 Safari 開啟');
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 320 }, facingMode: 'user' }, audio: true });
          try { stream.getAudioTracks().forEach(t => { t.enabled = false; }); } catch (e) {} // 🎤 麥克風預設關閉，要講話再手動開
          localStreamRef.current = stream;
          setLocalStream(stream); setVideoOn(true); setMicMuted(true);
          callAllPeers(stream);
          broadcastMic(true);
        } catch (e) {
          showToast(e && e.name === 'NotAllowedError' ? '⚠️ 相機/麥克風權限被拒，請到瀏覽器設定中允許' : '⚠️ 無法開啟相機/麥克風');
        }
      };
      const toggleMic = () => {
        const newMuted = !micMuted;
        const s = localStreamRef.current;
        if (s) { try { s.getAudioTracks().forEach(t => { t.enabled = !newMuted; }); } catch (e) {} }
        setMicMuted(newMuted);
        broadcastMic(newMuted); // 通知其他玩家：我開麥/關麥了
      };

      // 首次教學導覽
      const [showTutorial, setShowTutorial] = useState(false);
      const [tutorialStep, setTutorialStep] = useState(0);

      // 靜音偏好（與全域音效引擎同步）
      const [muted, setMuted] = useState(() => {
        try { return localStorage.getItem('hashi_muted') === '1'; } catch (e) { return false; }
      });

      // 🏁 競速模式
      const [mpMode, setMpMode] = useState('coop'); // 'coop' | 'race'
      const [raceState, setRaceState] = useState('idle'); // idle | lobby | countdown | racing | finished
      const [raceProgress, setRaceProgress] = useState({});
      const [raceResult, setRaceResult] = useState(null);
      const [raceWaiting, setRaceWaiting] = useState(false);
      const [raceCountdown, setRaceCountdown] = useState(null);

      // ⭐ 星級評分
      const [stars, setStars] = useState(0);
      const [isNewBest, setIsNewBest] = useState(false);

      // ✨ 爽感：粒子與撒花
      const [bursts, setBursts] = useState([]);
      const [confetti, setConfetti] = useState([]);

      // 每日一題
      const [isDailyMode, setIsDailyMode] = useState(false);
      const [dailyDateStr, setDailyDateStr] = useState("");
      const [dailyStreak, setDailyStreak] = useState(0);
      const [dailyDone, setDailyDone] = useState(null);
      const isDailyModeRef = useRef(false);
      const dailyDateStrRef = useRef("");
      // 主選單選擇的每日題目日期（預設今天，可往前選以前的題目）
      const [dailyMenuDate, setDailyMenuDate] = useState(() => HASHI_PUZZLE.getDailyDateStr());

      const dailyStatus = useMemo(() => {
        if (screen !== 'home') return null;
        return getDailyStatus(dailyMenuDate);
      }, [screen, dailyMenuDate]);

      const isMultiplayer = engine !== 'none';
      const inRace = raceState !== 'idle';
      const svgRef = useRef(null);
      const lastCursorSend = useRef(0);
      const isDrawingRef = useRef(false);

      const engineRef = useRef('none');
      const isHostRef = useRef(false);
      const peerRef = useRef(null);
      const connRef = useRef(null);
      const connsRef = useRef([]);
      const zoomContainerRef = useRef(null);
      const lastPinchDist = useRef(null);
      const stateRef = useRef({ bridges: [], randomLevelData: null, showSolution: false, startTime: Date.now(), levelId: 2, strokes: [] });

      const zoomLevelRef = useRef(1);
      const zoomModeIdxRef = useRef(0);
      const levelDimRef = useRef({ w: 10, h: 10 }); // 最新題目尺寸（給 auto-fit 用）
      const userZoomedRef = useRef(false); // 使用者是否手動調整過縮放
      const lastBridgeTapRef = useRef({}); // 橋樑防連點時間戳
      const dragDrawRef = useRef(null); // 拖曳架橋手勢 {kind:'island'|'bridge', id, startX, startY, startT, dragging, targetId, holdTimer}
      const panRef = useRef(null); // 空白處單指拖曳捲動 {lastX, lastY}（CSS px；svg 已 touch-action:none，需手動捲動）
      const currentPathDataRef = useRef("");
      const drawingPathRef = useRef(null);
      const eraserRef = useRef(null);
      const dragPreviewLineRef = useRef(null); // 拖曳架橋預覽線（ref 直寫 DOM，不走 React state）
      const dragPreviewTipRef = useRef(null);  // 拖曳預覽線末端圓點
      const lastEraseTimeRef = useRef(0);
      const mpModeRef = useRef('coop');
      const playersListRef = useRef([]);
      const raceStateRef = useRef('idle');
      const raceStartAtRef = useRef(null);
      const raceSeqRef = useRef(0);
      const raceResultsRef = useRef({});
      const myFinishTimeRef = useRef(null);
      const lastProgressSentRef = useRef(0);
      const lastProgressValRef = useRef(-1);
      const prevIslandDoneRef = useRef({});

      const MAX_SAFE_DIMENSION = 8500;

      // === 拖曳架橋手勢判定常數（方便微調手感） ===
      const TAP_MAX_MS = 350;   // 按下到放開 < 350ms 才算點擊
      const DRAG_HOLD_MS = 220; // 按住 220ms 不放 → 進入拖曳模式（預覽線現身）
      const TAP_MOVE_TOL = 12;  // 點擊容錯：移動 < 12px（SVG 單位）

      const cLevel = randomLevelData || { islands: [], description: "" };
      const islandsToRender = cLevel.islands || [];
      const maxGridX = islandsToRender.length > 0 ? Math.max.apply(Math, islandsToRender.map(i => i.x).concat([6])) : 6;
      const maxGridY = islandsToRender.length > 0 ? Math.max.apply(Math, islandsToRender.map(i => i.y).concat([6])) : 6;
      const gridWidth = (cLevel.width) ? cLevel.width : (maxGridX + 1);
      const gridHeight = (cLevel.height) ? cLevel.height : (maxGridY + 1);

      const SCALE = 65; const PADDING = 85; const ISLAND_RADIUS = 22;
      const svgW = (gridWidth - 1) * SCALE + PADDING * 2;
      const svgH = (gridHeight - 1) * SCALE + PADDING * 2;
      const hasSolution = cLevel.solution && cLevel.solution.length > 0;

      const getPlayerColor = (uid) => {
          const p = playersList.find(p => p.id === uid);
          return p ? p.color : COLORS[0];
      };

      const myCurrentColor = getPlayerColor(myId);
      const _mePlayer = playersList.find(p => p.id === myId);
      myNameRef.current = _mePlayer ? _mePlayer.name : "";
      myColorRef.current = myCurrentColor;

      useEffect(function() {
        if (engine !== 'peerjs' && interactionMode >= 2) {
            setInteractionMode(0);
        }
      }, [engine, interactionMode]);

      useEffect(() => { zoomLevelRef.current = zoomLevel; }, [zoomLevel]);
      useEffect(() => { zoomModeIdxRef.current = zoomModeIdx; }, [zoomModeIdx]);

      // 首次進入遊戲時顯示教學導覽（localStorage 記錄）
      useEffect(function() {
        let seen = false;
        try { seen = localStorage.getItem('hashi_tutorial_seen') === '1'; } catch (e) {}
        if (!seen) {
            setTutorialStep(0);
            setShowTutorial(true);
        }
      }, []);

      useEffect(function() {
        stateRef.current = { bridges, randomLevelData, showSolution, startTime, levelId: currentLevelId, strokes };
        levelDimRef.current = { w: gridWidth, h: gridHeight };
      }, [bridges, randomLevelData, showSolution, startTime, currentLevelId, strokes]);

      useEffect(function() {
        if (screen !== 'game') return;
        const el = zoomContainerRef.current;
        if (!el) return;
        let touchStartY = null;

        const handleTouchStart = (e) => { if (e.touches.length === 1) { touchStartY = e.touches[0].clientY; } };
        const handleTouchMove = (e) => {
          if (interactionMode >= 2) return;

          if (e.touches.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            if (lastPinchDist.current) {
              const delta = dist - lastPinchDist.current;
              let newZoom = Math.min(Math.max(zoomLevelRef.current + delta * 0.005, 0.4), 3.5);

              if (svgW * newZoom > MAX_SAFE_DIMENSION || svgH * newZoom > MAX_SAFE_DIMENSION) {
                  newZoom = Math.min(MAX_SAFE_DIMENSION / svgW, MAX_SAFE_DIMENSION / svgH);
              }

              zoomLevelRef.current = newZoom;
              userZoomedRef.current = true;

              if (svgRef.current) {
                  svgRef.current.style.width = `${svgW * newZoom}px`;
                  svgRef.current.style.height = `${svgH * newZoom}px`;
              }

              if (zoomModeIdxRef.current !== 0) {
                  setZoomModeIdx(0);
                  zoomModeIdxRef.current = 0;
              }
            }
            lastPinchDist.current = dist;
          } else if (e.touches.length === 1 && touchStartY !== null) {
            const dy = e.touches[0].clientY - touchStartY;
            if (Math.abs(dy) > 30 && !isHeaderCollapsed) { setIsHeaderCollapsed(true); }
          }
        };
        const handleTouchEnd = () => {
            lastPinchDist.current = null;
            touchStartY = null;
            if (zoomLevel !== zoomLevelRef.current) {
                setZoomLevel(zoomLevelRef.current);
            }
        };
        const handleWheel = (e) => {
            if (interactionMode >= 2) return;
            if (Math.abs(e.deltaY) > 10 && !isHeaderCollapsed) { setIsHeaderCollapsed(true); }
            if (e.ctrlKey && zoomModeIdxRef.current !== 0) {
                 setZoomModeIdx(0);
                 zoomModeIdxRef.current = 0;
            }
        };

        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd);
        el.addEventListener('touchcancel', handleTouchEnd);
        el.addEventListener('wheel', handleWheel, { passive: true });

        return () => {
          el.removeEventListener('touchstart', handleTouchStart);
          el.removeEventListener('touchmove', handleTouchMove);
          el.removeEventListener('touchend', handleTouchEnd);
          el.removeEventListener('touchcancel', handleTouchEnd);
          el.removeEventListener('wheel', handleWheel);
        };
      }, [screen, isHeaderCollapsed, interactionMode, svgW, svgH, zoomLevel]);

      useEffect(function() {
        if (screen !== 'game') return;
        let t = null;
        const onWinResize = () => {
            if (userZoomedRef.current) return; // 使用者手動調過就不自動重算
            if (t) clearTimeout(t);
            t = setTimeout(() => { applyFitZoom(); }, 200);
        };
        window.addEventListener('resize', onWinResize);
        window.addEventListener('orientationchange', onWinResize);
        return () => {
            window.removeEventListener('resize', onWinResize);
            window.removeEventListener('orientationchange', onWinResize);
            if (t) clearTimeout(t);
        };
      }, [screen]);

      useEffect(function() {
        if (ripples.length === 0) return;
        const timer = setTimeout(() => {
            const now = Date.now();
            setRipples(prev => prev.filter(r => now - r.timestamp < 1000));
        }, 1000);
        return () => clearTimeout(timer);
      }, [ripples]);

      useEffect(function() { playersListRef.current = playersList; }, [playersList]);

      // ✨ 島嶼完成粒子：偵測「未完成 → 完成」
      useEffect(function() {
        const islands = (randomLevelData && randomLevelData.islands) || [];
        if (islands.length === 0) return;
        const fresh = [];
        islands.forEach(isl => {
          const cc = islandCurrentCounts[isl.id];
          const done = !!(cc && cc.total === isl.req);
          const was = !!prevIslandDoneRef.current[isl.id];
          if (done && !was) fresh.push(isl);
          prevIslandDoneRef.current[isl.id] = done;
        });
        if (fresh.length > 0) {
          const col = myCurrentColor === 'rainbow' ? '#fbbf24' : myCurrentColor;
          const parts = fresh.map(isl => {
            const cx = isl.x * SCALE + PADDING, cy = isl.y * SCALE + PADDING;
            const arr = [];
            for (let k = 0; k < 8; k++) {
              const ang = (k / 8) * Math.PI * 2 + Math.random() * 0.6;
              const dist = 26 + Math.random() * 24;
              arr.push({ dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist });
            }
            return { id: 'b' + Date.now() + '_' + isl.id + '_' + Math.floor(Math.random() * 1000000), x: cx, y: cy, color: col, parts: arr };
          });
          setBursts(prev => [...prev, ...parts]);
          const ids = {};
          parts.forEach(p => { ids[p.id] = true; });
          setTimeout(() => { setBursts(prev => prev.filter(b => !ids[b.id])); }, 850);
        }
      }, [islandCurrentCounts]);

      // ✨ 勝利撒花
      useEffect(function() {
        if (isWon) {
          const colors = ['#4ade80', '#ef4444', '#3b82f6', '#10b981', '#a855f7', '#f97316'];
          const arr = [];
          for (let i = 0; i < 50; i++) {
            arr.push({ id: 'c' + i, left: Math.random() * 100, delay: Math.random() * 1.4, dur: 2.4 + Math.random() * 2.2, color: colors[i % colors.length], w: 6 + Math.random() * 6, h: 9 + Math.random() * 7 });
          }
          setConfetti(arr);
        } else {
          setConfetti([]);
        }
      }, [isWon]);

      // 🏁 競速進度分享：effect 版（安全網；主要推送走 raceAwareSync 內的 pushRaceProgress）
      useEffect(function() {
        pushRaceProgress(bridges);
      }, [islandCurrentCounts, raceState, randomLevelData]);

      const showToast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(""), 4000); };

      const getSvgCoords = (clientX, clientY) => {
        const svg = svgRef.current;
        if (!svg) return null;
        let pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return null;
        return pt.matrixTransform(ctm.inverse());
      };

      const eraseAtPoint = (cx, cy) => {
          const offsets = [[0,0], [15,0], [-15,0], [0,15], [0,-15], [10,10], [-10,-10], [10,-10], [-10,10]];
          let hitIds = new Set();
          for (let off of offsets) {
              const els = document.elementsFromPoint(cx + off[0], cy + off[1]);
              for (let el of els) {
                  if (el.classList.contains('doodle-stroke')) {
                      const sid = el.getAttribute('data-stroke-id');
                      const strokeObj = stateRef.current.strokes.find(s => s.id === sid);
                      const strokeUid = (strokeObj && strokeObj.uid) || (strokeObj ? strokeObj.id.split('-')[1] : null);
                      if (strokeUid === myId) {
                          hitIds.add(sid);
                      }
                  }
              }
          }
          if (hitIds.size > 0) {
              const newStrokes = stateRef.current.strokes.filter(s => !hitIds.has(s.id));
              if (newStrokes.length !== stateRef.current.strokes.length) {
                  raceAwareSync({ strokes: newStrokes });
              }
          }
      };

      // === 拖曳架橋：手勢起始（時間＋距離雙條件判定） ===
      // 「同點或相近位置、快速按下放開」→ 點擊；「持續按住（長按）或移動」→ 拖曳模式
      const clearDragTimer = (dd) => {
        if (dd && dd.holdTimer) { clearTimeout(dd.holdTimer); dd.holdTimer = null; }
      };

      const startDragGesture = (e, kind, id) => {
        if (interactionMode >= 2 || !e.isPrimary || dragDrawRef.current || isWon) return;
        const pt = getSvgCoords(e.clientX, e.clientY);
        if (!pt) return;
        const dd = { kind, id, startX: pt.x, startY: pt.y, startT: Date.now(), dragging: false, targetId: null, holdTimer: null };
        dragDrawRef.current = dd;
        const pc = myCurrentColor === 'rainbow' ? '#fbbf24' : myCurrentColor;
        if (dragPreviewLineRef.current) dragPreviewLineRef.current.setAttribute('stroke', pc);
        if (dragPreviewTipRef.current) dragPreviewTipRef.current.setAttribute('fill', pc);
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
        // 長按進入拖曳：DRAG_HOLD_MS 後還按著 → 只顯示 tip 圓點在觸摸點（還沒方向，線保持隱藏）
        dd.holdTimer = setTimeout(() => {
            const cur = dragDrawRef.current;
            if (cur && cur.holdTimer === dd.holdTimer && !cur.dragging) {
                cur.dragging = true;
                const tip = dragPreviewTipRef.current;
                if (tip) {
                    tip.setAttribute('cx', cur.startX); tip.setAttribute('cy', cur.startY);
                    tip.style.display = 'block';
                }
            }
        }, DRAG_HOLD_MS);
      };

      const handleIslandPointerDown = (e, island) => {
        if (interactionMode < 2) setHoveredIslandId(island.id);
        startDragGesture(e, 'island', island.id);
      };

      const handleBridgePointerDown = (e, b) => {
        startDragGesture(e, 'bridge', b.id);
      };

      // === 拖曳架橋：依拖曳方向判定目標橋樑 ===
      const resolveDragTarget = (d, dx, dy) => {
        const rlv = stateRef.current.randomLevelData;
        const islands = (rlv && rlv.islands) ? rlv.islands : [];
        const bridgesNow = stateRef.current.bridges || [];
        const islMap = {}; islands.forEach(i => { islMap[i.id] = i; });
        if (d.kind === 'island') {
          const from = islMap[d.id]; if (!from) return null;
          const fromX = from.x * SCALE + PADDING, fromY = from.y * SCALE + PADDING;
          const len = Math.hypot(dx, dy) || 1, nx = dx / len, ny = dy / len;
          let bestId = null, bestCos = 0.82; // 夾角 < ~35°
          bridgesNow.forEach(b => {
            if (b.from !== d.id && b.to !== d.id) return;
            const other = islMap[b.from === d.id ? b.to : b.from]; if (!other) return;
            let vx = (other.x * SCALE + PADDING) - fromX, vy = (other.y * SCALE + PADDING) - fromY;
            const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
            const cos = vx * nx + vy * ny;
            if (cos > bestCos) { bestCos = cos; bestId = b.id; }
          });
          return bestId;
        }
        // 從橋樑出發：拖曳以橋軸向為主才算數
        const b = bridgesNow.find(x => x.id === d.id); if (!b) return null;
        const f = islMap[b.from], t = islMap[b.to]; if (!f || !t) return null;
        const ax = t.x - f.x, ay = t.y - f.y;
        const axial = Math.abs(dx * ax + dy * ay), normal = Math.abs(dx * ay - dy * ax);
        return (axial > 0 && axial > normal * 1.5) ? d.id : null;
      };

      // === 拖曳架橋預覽線（ref 直寫 DOM，不走 React state，避免 pointermove 重渲染） ===
      const hideDragPreview = () => {
        if (dragPreviewLineRef.current) dragPreviewLineRef.current.style.display = 'none';
        if (dragPreviewTipRef.current) dragPreviewTipRef.current.style.display = 'none';
      };

      // 拖曳預覽線幾何：軸向取手指按下位置，法向取軸線位置（線「從手指開始」，貼在橋的線上）
      const islandCenter = (id) => {
        const rlv = stateRef.current.randomLevelData;
        const islands = (rlv && rlv.islands) ? rlv.islands : [];
        const isl = islands.find(i => i.id === id);
        return isl ? { x: isl.x * SCALE + PADDING, y: isl.y * SCALE + PADDING } : null;
      };
      const bridgeAxis = (id) => {
        const rlv = stateRef.current.randomLevelData;
        const islands = (rlv && rlv.islands) ? rlv.islands : [];
        const islMap = {}; islands.forEach(i => { islMap[i.id] = i; });
        const b = (stateRef.current.bridges || []).find(x => x.id === id);
        if (!b) return null;
        const f = islMap[b.from], t = islMap[b.to];
        if (!f || !t) return null;
        const fx = f.x * SCALE + PADDING, fy = f.y * SCALE + PADDING;
        const tx = t.x * SCALE + PADDING, ty = t.y * SCALE + PADDING;
        return { type: b.type, midX: (fx + tx) / 2, midY: (fy + ty) / 2 };
      };
      // 法向座標：島嶼出發 = 島中心在法向的分量；橋樑出發 = 橋中點在法向的分量
      const dragAxisNormal = (d, main) => {
        if (d.kind === 'island') {
          const c = islandCenter(d.id);
          return c ? (main === 'h' ? c.y : c.x) : null;
        }
        const ax = bridgeAxis(d.id);
        return ax ? (main === 'h' ? ax.midY : ax.midX) : null;
      };

      // 拖曳提交門檻：拉超過 max(24, 島間距×0.35) 才算數
      const dragCommitInfo = (d, dx, dy) => {
        const ax = Math.abs(dx), ay = Math.abs(dy);
        const main = ax >= ay ? 'h' : 'v';
        const len = main === 'h' ? ax : ay;
        let spacing = SCALE;
        if (d.targetId) {
          const rlv = stateRef.current.randomLevelData;
          const islands = (rlv && rlv.islands) ? rlv.islands : [];
          const islMap = {}; islands.forEach(i => { islMap[i.id] = i; });
          const b = (stateRef.current.bridges || []).find(x => x.id === d.targetId);
          if (b) {
            const f = islMap[b.from], t = islMap[b.to];
            if (f && t) spacing = Math.hypot(t.x - f.x, t.y - f.y) * SCALE;
          }
        }
        return { main, len, threshold: Math.max(24, spacing * 0.35) };
      };

      // 預覽線長度上限：有目標橋時 = 起點到拖曳方向那端島的距離，否則 120
      const dragPreviewMaxLen = (d, main, dir, sx, sy) => {
        const rlv = stateRef.current.randomLevelData;
        const islands = (rlv && rlv.islands) ? rlv.islands : [];
        const islMap = {}; islands.forEach(i => { islMap[i.id] = i; });
        if (d.targetId) {
          const b = (stateRef.current.bridges || []).find(x => x.id === d.targetId);
          if (b) {
            let targetIslandId = null;
            if (d.kind === 'island') {
              targetIslandId = (b.from === d.id) ? b.to : b.from;
            } else {
              const f = islMap[b.from], t = islMap[b.to];
              if (f && t) {
                const fx = f.x * SCALE + PADDING, fy = f.y * SCALE + PADDING;
                const tx = t.x * SCALE + PADDING, ty = t.y * SCALE + PADDING;
                const toF = main === 'h' ? (Math.sign(fx - sx) === dir) : (Math.sign(fy - sy) === dir);
                targetIslandId = toF ? b.from : b.to;
              }
            }
            const o = islMap[targetIslandId];
            if (o) {
              const ox = o.x * SCALE + PADDING, oy = o.y * SCALE + PADDING;
              return Math.max(0, Math.hypot(ox - sx, oy - sy));
            }
          }
        }
        return 120;
      };

      // 每幀更新預覽線：起點 = 手指按下點的軸向座標 × 軸線的法向座標（從手指開始、貼在橋線上）
      const updateDragPreview = (d, dx, dy) => {
        const line = dragPreviewLineRef.current, tip = dragPreviewTipRef.current;
        if (!line || !tip) return;
        const info = dragCommitInfo(d, dx, dy);
        const main = info.main;
        const fixed = dragAxisNormal(d, main);
        if (fixed === null) return;
        const sx = main === 'h' ? d.startX : fixed;
        const sy = main === 'h' ? fixed : d.startY;
        const dir = main === 'h' ? (Math.sign(dx) || 1) : (Math.sign(dy) || 1);
        const maxLen = dragPreviewMaxLen(d, main, dir, sx, sy);
        const cl = Math.min(info.len, maxLen);
        const ex = main === 'h' ? sx + dir * cl : sx;
        const ey = main === 'v' ? sy + dir * cl : sy;
        line.setAttribute('x1', sx); line.setAttribute('y1', sy);
        line.setAttribute('x2', ex); line.setAttribute('y2', ey);
        tip.setAttribute('cx', ex); tip.setAttribute('cy', ey);
        line.style.display = 'block'; tip.style.display = 'block';
      };

      const handlePointerDown = (e) => {
        // 雙指介入：取消拖曳架橋與空白捲動，讓 pinch 縮放接管
        if (e.isPrimary === false) {
            if (dragDrawRef.current) { clearDragTimer(dragDrawRef.current); dragDrawRef.current = null; hideDragPreview(); }
            panRef.current = null;
            if (interactionMode < 2) { setHoveredIslandId(null); setHoveredBridgeId(null); }
        }
        if (interactionMode < 2 && e.target.tagName && e.target.tagName.toLowerCase() === 'svg') {
            setHoveredIslandId(null);
            setHoveredBridgeId(null);
            // 空白處單指按下 → 手動捲動（svg 已是 touch-action:none，瀏覽器不會代勞捲動）
            if (e.isPrimary && !dragDrawRef.current && !panRef.current) {
                panRef.current = { lastX: e.clientX, lastY: e.clientY };
            }
        }

        const pt = getSvgCoords(e.clientX, e.clientY);
        if (!pt) return;

        if (interactionMode === 2) {
            e.target.setPointerCapture(e.pointerId);
            if (drawSubMode === 'pen') {
                isDrawingRef.current = true;
                currentPathDataRef.current = `M ${pt.x} ${pt.y}`;
                if (drawingPathRef.current) {
                    drawingPathRef.current.setAttribute('d', currentPathDataRef.current);
                    drawingPathRef.current.style.display = 'block';
                }
            } else if (drawSubMode === 'eraser') {
                eraseAtPoint(e.clientX, e.clientY);
            }
            return;
        }

        if (engineRef.current !== 'peerjs' || !showOtherCursors) return;
        if (raceStateRef.current === 'racing' || raceStateRef.current === 'countdown') return; // 🏁 競速中停用游標分享（防作弊）
        const msg = { type: 'CLICK', uid: myId, x: pt.x, y: pt.y };
        setRipples(prev => [...prev, { id: Date.now() + Math.random(), uid: myId, x: pt.x, y: pt.y, timestamp: Date.now() }]);

        if (isHostRef.current) {
            connsRef.current.forEach(c => c.send(msg));
        } else if (connRef.current) {
            connRef.current.send(msg);
        }
      };

      const handlePointerMove = (e) => {
        // 拖曳架橋：方向判定 + 預覽線跟隨 + 即時高亮
        if (dragDrawRef.current && interactionMode < 2) {
            const dd = dragDrawRef.current;
            const pressed = (e.buttons > 0) || (e.pointerType === 'touch' && e.isPrimary);
            if (!pressed) {
                clearDragTimer(dd);
                dragDrawRef.current = null;
                hideDragPreview();
                setHoveredBridgeId(null);
            } else {
                const pt = getSvgCoords(e.clientX, e.clientY);
                if (pt) {
                    const dx = pt.x - dd.startX, dy = pt.y - dd.startY;
                    if (!dd.dragging && Math.hypot(dx, dy) > TAP_MOVE_TOL) {
                        clearDragTimer(dd);
                        dd.dragging = true;
                        // 預覽線起點改為每幀投影（updateDragPreview 內計算），不再快照島中心/橋中點
                    }
                    if (dd.dragging) {
                        const t = resolveDragTarget(dd, dx, dy);
                        if (t !== dd.targetId) {
                            const wasNull = !dd.targetId;
                            dd.targetId = t;
                            setHoveredBridgeId(t);
                            // 目標出現時輕 tick 一聲，加 150ms 遲滯避免抖動連播
                            if (t && wasNull && Date.now() - (dd.lastTick || 0) > 150) {
                                dd.lastTick = Date.now();
                                try { window.HASHI_SOUND.play('click'); } catch (err2) {}
                            }
                        }
                        updateDragPreview(dd, dx, dy);
                    }
                }
            }
        }
        // 空白處單指拖曳 → 手動捲動棋盤（svg 為 touch-action:none 時的替代捲動）
        else if (panRef.current && interactionMode < 2 && e.isPrimary) {
            const pan = panRef.current;
            const zc = zoomContainerRef.current;
            if (zc && ((e.buttons > 0) || e.pointerType === 'touch')) {
                zc.scrollLeft -= (e.clientX - pan.lastX);
                zc.scrollTop -= (e.clientY - pan.lastY);
                pan.lastX = e.clientX; pan.lastY = e.clientY;
            }
        }
        if (interactionMode === 2) {
            const pt = getSvgCoords(e.clientX, e.clientY);
            if (drawSubMode === 'eraser') {
                if (pt && eraserRef.current) {
                    eraserRef.current.setAttribute('cx', pt.x);
                    eraserRef.current.setAttribute('cy', pt.y);
                    if (eraserRef.current.style.display === 'none') {
                        eraserRef.current.style.display = 'block';
                    }
                }
                if (e.buttons > 0 || e.pointerType === 'touch') {
                    if (Date.now() - lastEraseTimeRef.current > 50) {
                        eraseAtPoint(e.clientX, e.clientY);
                        lastEraseTimeRef.current = Date.now();
                    }
                }
            } else if (drawSubMode === 'pen' && isDrawingRef.current) {
                if (pt && currentPathDataRef.current) {
                    currentPathDataRef.current += ` L ${pt.x} ${pt.y}`;
                    if (drawingPathRef.current) {
                        drawingPathRef.current.setAttribute('d', currentPathDataRef.current);
                    }
                }
            }
            return;
        }

        if (engineRef.current !== 'peerjs' || !showOtherCursors) return;
        if (raceStateRef.current === 'racing' || raceStateRef.current === 'countdown') return; // 🏁 競速中停用游標分享（防作弊）
        if (Date.now() - lastCursorSend.current < 50) return;
        lastCursorSend.current = Date.now();
        const pt = getSvgCoords(e.clientX, e.clientY);
        if (pt) {
            const msg = { type: 'CURSOR', uid: myId, x: pt.x, y: pt.y };
            if (isHostRef.current) {
                connsRef.current.forEach(c => c.send(msg));
            } else if (connRef.current) {
                connRef.current.send(msg);
            }
        }
      };

      const handlePointerUp = (e) => {
        // 只處理真正的放開與取消；svg 的 onPointerLeave 不再經由這裡結算拖曳，
        // 避免邊界事件（特別是 iOS 上 pointer capture 相關的）誤殺進行中的手勢
        if (e.type !== 'pointerup' && e.type !== 'pointercancel') return;
        panRef.current = null;
        // 拖曳架橋手勢結算（pointercancel 只清空、不結算）
        const dd = dragDrawRef.current;
        if (dd) {
            clearDragTimer(dd);
            dragDrawRef.current = null;
            hideDragPreview();
            if (e.type !== 'pointercancel' && interactionMode < 2 && !isWon) {
                const pt = getSvgCoords(e.clientX, e.clientY);
                const dx = pt ? pt.x - dd.startX : 0, dy = pt ? pt.y - dd.startY : 0;
                const moved = Math.hypot(dx, dy);
                const dt = Date.now() - (dd.startT || 0);
                if (!dd.dragging && dt < TAP_MAX_MS && moved < TAP_MOVE_TOL) {
                    // 點擊：同點或相近位置、快速按下放開（有容錯率）→ 只有橋樑能點，島嶼不做事
                    if (dd.kind === 'bridge') handleBridgeClick(dd.id);
                } else if (dd.dragging && dd.targetId) {
                    // 拖曳：有目標且拉超過門檻才真正架橋
                    const info = dragCommitInfo(dd, dx, dy);
                    if (info.len > info.threshold) handleBridgeClick(dd.targetId);
                }
                // 其餘狀況（按住超時未動、拖曳未達門檻）→ 取消，什麼都不做
            }
            if (interactionMode < 2) { setHoveredIslandId(null); setHoveredBridgeId(null); }
        }
        if (interactionMode === 2) {
            if (drawSubMode === 'pen' && isDrawingRef.current) {
                isDrawingRef.current = false;
                if (currentPathDataRef.current) {
                    const newStrokes = [...stateRef.current.strokes, { id: Date.now() + '-' + myId, uid: myId, path: currentPathDataRef.current }];
                    raceAwareSync({ strokes: newStrokes });
                    currentPathDataRef.current = "";
                    if (drawingPathRef.current) drawingPathRef.current.style.display = 'none';
                }
            }
            if (e.type === 'pointerleave' || e.type === 'pointercancel' || e.pointerType === 'touch') {
                 if (eraserRef.current) eraserRef.current.style.display = 'none';
            }
        }
      };

      const clearOwnStrokes = () => {
          const newStrokes = stateRef.current.strokes.filter(s => !s.id.endsWith('-' + myId));
          raceAwareSync({ strokes: newStrokes });
          showToast("🗑️ 已清除你所有的塗鴉");
      };

      const clearAllStrokes = () => {
          if (isHostRef.current) {
              raceAwareSync({ strokes: [] });
              showToast("🚨 房主已清空全場塗鴉");
          }
      };

      const purgeGhostPlayers = () => {
        if (!isHostRef.current) return;
        setPlayersList(prev => {
          const hostPlayer = prev.find(p => p.id === myId);
          if (!hostPlayer) return prev;
          const newList = [hostPlayer];

          if (engineRef.current === 'peerjs') {
            connsRef.current = connsRef.current.filter(c => c.open);
            connsRef.current.forEach(c => c.send({ type: 'PLAYERS_UPDATE', players: newList }));
            connsRef.current.forEach(c => c.send({ type: 'REQ_REJOIN' }));
          }
          return newList;
        });
      };

      const syncState = (partial, shouldBroadcast = true) => {
        if (partial.bridges !== undefined) setBridges(partial.bridges);
        if (partial.showSolution !== undefined) setShowSolution(partial.showSolution);
        if (partial.randomLevelData !== undefined) setRandomLevelData(partial.randomLevelData);
        if (partial.startTime !== undefined) setStartTime(partial.startTime);
        if (partial.levelId !== undefined) setCurrentLevelId(partial.levelId);
        if (partial.strokes !== undefined) setStrokes(partial.strokes);

        const updatedState = { ...stateRef.current, ...partial };
        stateRef.current = updatedState;

        if (shouldBroadcast) {
            if (engineRef.current === 'peerjs') {
              if (isHostRef.current) {
                 connsRef.current.forEach(c => c.send({ type: 'SYNC', data: updatedState }));
              } else if (connRef.current) {
                 connRef.current.send({ type: 'SYNC', data: updatedState });
              }
            }
        }
      };

      // 🏁 競速進度推送：用最新的 bridges 直接計算並廣播（架橋當下同步呼叫，不依賴 effect 時序）
      const pushRaceProgress = (bridgesArr) => {
        if (raceStateRef.current !== 'racing') return;
        const rld = (stateRef.current && stateRef.current.randomLevelData) || randomLevelData;
        const islands = (rld && rld.islands) || [];
        if (islands.length === 0) return;
        const counts = {};
        islands.forEach(i => { counts[i.id] = 0; });
        (bridgesArr || []).forEach(b => {
          const t = (b.count || 0) + (b.draftCount || 0);
          if (counts[b.from] !== undefined) counts[b.from] += t;
          if (counts[b.to] !== undefined) counts[b.to] += t;
        });
        let done = 0;
        islands.forEach(isl => { if (counts[isl.id] === isl.req) done++; });
        const p = done / islands.length;
        const now = Date.now();
        if (p === lastProgressValRef.current && now - lastProgressSentRef.current <= 1000) return; // 節流
        lastProgressValRef.current = p;
        lastProgressSentRef.current = now;
        const info = { progress: p, name: (myNameRef.current || '你'), color: myColorRef.current };
        setRaceProgress(prev => ({ ...prev, [myId]: info }));
        const msg = { type: 'RACE_PROGRESS', uid: myId, name: info.name, color: info.color, progress: p };
        try {
          if (isHostRef.current) { connsRef.current.forEach(c => { if (c.open) c.send(msg); }); }
          else if (connRef.current && connRef.current.open) { connRef.current.send(msg); }
        } catch (e) {}
      };

      // 🏁 競速中：橋樑/塗鴉只改本地，不廣播（防偷看、防互相覆蓋）
      const raceAwareSync = (partial) => {
        if (raceStateRef.current === 'countdown' || raceStateRef.current === 'racing' || raceStateRef.current === 'finished') {
          if (partial.bridges !== undefined) {
            setBridges(partial.bridges);
            pushRaceProgress(partial.bridges);
          }
          if (partial.strokes !== undefined) setStrokes(partial.strokes);
          if (partial.showSolution !== undefined) setShowSolution(partial.showSolution);
          stateRef.current = { ...stateRef.current, ...partial };
        } else {
          syncState(partial);
        }
      };

      // ⭐ 最佳紀錄：hashi_best_{W}x{H}
      const recordBest = (secs) => {
        try {
          const w = randomLevelData.width, h = randomLevelData.height;
          const key = 'hashi_best_' + w + 'x' + h;
          const prev = parseInt(localStorage.getItem(key) || '0', 10);
          if (!prev || secs < prev) {
            localStorage.setItem(key, String(secs));
            setIsNewBest(true);
          } else {
            setIsNewBest(false);
          }
        } catch (e) {}
      };

      const resetWinMeta = () => {
        setStars(0); setIsNewBest(false); setBursts([]);
        prevIslandDoneRef.current = {};
      };

      const islandCurrentCounts = useMemo(function() {
        const counts = {};
        const islands = (randomLevelData && randomLevelData.islands) ? randomLevelData.islands : [];
        islands.forEach(i => { counts[i.id] = { total: 0, real: 0 }; });
        (bridges || []).forEach(b => {
          if (counts[b.from] !== undefined) {
             counts[b.from].total += b.count + (b.draftCount || 0);
             counts[b.from].real += b.count;
          }
          if (counts[b.to] !== undefined) {
             counts[b.to].total += b.count + (b.draftCount || 0);
             counts[b.to].real += b.count;
          }
        });
        return counts;
      }, [bridges, randomLevelData]);

      const crossedBridgeIds = useMemo(() => {
          const crossed = new Set();
          const islMap = {};
          const islands = (randomLevelData && randomLevelData.islands) ? randomLevelData.islands : [];
          islands.forEach(i => { islMap[i.id] = i; });

          const activeV = bridges.filter(b => (b.count + (b.draftCount || 0)) > 0 && b.type === 'v');
          const activeH = bridges.filter(b => (b.count + (b.draftCount || 0)) > 0 && b.type === 'h');

          bridges.forEach(target => {
              if ((target.count + (target.draftCount || 0)) > 0) return;

              const tFrom = islMap[target.from];
              const tTo = islMap[target.to];
              if (!tFrom || !tTo) return;

              let isCross = false;
              if (target.type === 'h') {
                  const y = tFrom.y;
                  const minX = Math.min(tFrom.x, tTo.x);
                  const maxX = Math.max(tFrom.x, tTo.x);
                  for (let i = 0; i < activeV.length; i++) {
                      const b = activeV[i];
                      const bFrom = islMap[b.from], bTo = islMap[b.to];
                      if (bFrom && bTo && bFrom.x > minX && bFrom.x < maxX && y > Math.min(bFrom.y, bTo.y) && y < Math.max(bFrom.y, bTo.y)) {
                          isCross = true; break;
                      }
                  }
              } else {
                  const x = tFrom.x;
                  const minY = Math.min(tFrom.y, tTo.y);
                  const maxY = Math.max(tFrom.y, tTo.y);
                  for (let i = 0; i < activeH.length; i++) {
                      const b = activeH[i];
                      const bFrom = islMap[b.from], bTo = islMap[b.to];
                      if (bFrom && bTo && bFrom.y > minY && bFrom.y < maxY && x > Math.min(bFrom.x, bTo.x) && x < Math.max(bFrom.x, bTo.x)) {
                          isCross = true; break;
                      }
                  }
              }
              if (isCross) crossed.add(target.id);
          });
          return crossed;
      }, [bridges, randomLevelData]);

      const highlightedIslandIds = useMemo(() => {
          const ids = new Set();
          if (hoveredIslandId) {
              ids.add(hoveredIslandId);
              bridges.forEach(b => {
                  if (b.from === hoveredIslandId) ids.add(b.to);
                  if (b.to === hoveredIslandId) ids.add(b.from);
              });
          }
          if (hoveredBridgeId) {
              const hb = bridges.find(b => b.id === hoveredBridgeId);
              if (hb) {
                  ids.add(hb.from);
                  ids.add(hb.to);
              }
          }
          return ids;
      }, [hoveredIslandId, hoveredBridgeId, bridges]);

      const activeHints = useMemo(() => {
          if (!hoveredIslandId || interactionMode >= 2) return [];
          return bridges.filter(b => b.from === hoveredIslandId || b.to === hoveredIslandId);
      }, [hoveredIslandId, interactionMode, bridges]);

      const handleBridgeClick = (bId) => {
        if (isWon || interactionMode >= 2) return;
        if (raceStateRef.current === 'countdown') return; // 🏁 倒數中鎖定操作
        const nowTap = Date.now();
        if (nowTap - (lastBridgeTapRef.current[bId] || 0) < 150) return; // 防手機連點誤觸
        lastBridgeTapRef.current[bId] = nowTap;
        const cur = bridges || [];
        const target = cur.find(b => b.id === bId);
        if (!target) return;

        if (target.count + (target.draftCount || 0) === 0) {
          if (crossedBridgeIds.has(bId)) {
             window.HASHI_SOUND.play('error');
             return showToast("🚫 橋樑不能交叉喔！請先移除阻擋的橋。");
          }
        }

        if (engineRef.current === 'none') {
            setHistory(past => {
                const newPast = [...past, cur];
                if (newPast.length > 25) return newPast.slice(newPast.length - 25);
                return newPast;
            });
        }

        const oldTotal = target.count + (target.draftCount || 0);

        const nextBridges = cur.map(b => {
            if (b.id !== bId) return b;

            let newCount = b.count;
            let newDraftCount = b.draftCount || 0;

            if (interactionMode === 1) { // 草稿模式
               if (b.count === 1) {
                  newDraftCount = newDraftCount === 0 ? 1 : 0;
               } else if (b.count === 0) {
                  newDraftCount = (newDraftCount + 1) % 3;
               }
            } else { // 實線模式
               if (newDraftCount > 0) {
                  newCount = b.count + newDraftCount;
                  newDraftCount = 0;
               } else {
                  newCount = (b.count + 1) % 3;
               }
            }

            const newOwner = (newCount > 0 || newDraftCount > 0) ? myId : null;
            return { ...b, count: newCount, draftCount: newDraftCount, owner: newOwner };
        });

        const newB = nextBridges.find(b => b.id === bId);
        const newTotal = newB.count + (newB.draftCount || 0);
        if (newTotal > oldTotal) {
            window.HASHI_SOUND.play('bridge');
        } else if (newTotal < oldTotal) {
            window.HASHI_SOUND.play('remove');
        }

        raceAwareSync({ bridges: nextBridges });

        // ✨ 點擊漣漪：在橋樑中點（成功架橋或取消時）
        if (newTotal !== oldTotal) {
            const islMap2 = {};
            ((randomLevelData && randomLevelData.islands) || []).forEach(i => { islMap2[i.id] = i; });
            const bf = islMap2[target.from], bt = islMap2[target.to];
            if (bf && bt) {
                const mx = (bf.x + bt.x) / 2 * SCALE + PADDING;
                const myy = (bf.y + bt.y) / 2 * SCALE + PADDING;
                setRipples(prev => [...prev, { id: Date.now() + Math.random(), uid: myId, x: mx, y: myy, timestamp: Date.now() }]);
            }
        }

        setHoveredIslandId(null);
      };

      const handleShowSolution = () => { syncState({ showSolution: true }); };

      const toggleInteractionMode = () => {
        const maxModes = engineRef.current === 'peerjs' ? 3 : 2;
        const nextMode = (interactionMode + 1) % maxModes;
        setInteractionMode(nextMode);
        showToast(`${modeIcons[nextMode]} 已切換為 ${modeTitles[nextMode]}`);
      };

      const handleUndo = () => {
        if (history.length === 0 || isWon || engineRef.current !== 'none') return;
        const previousState = history[history.length - 1];
        syncState({ bridges: previousState });
        setHistory(past => past.slice(0, -1));
      };

      const handleReset = () => {
        const empty = HASHI_PUZZLE.generateEmptyBridges(randomLevelData);
        raceAwareSync({ bridges: empty, strokes: [], showSolution: false, startTime: Date.now() });
        if (engineRef.current === 'none') setHistory([]);
        setIsWon(false); setEndTime(null);
        resetWinMeta();
      };

      const handleRegenerateRandom = () => {
        if (isDailyModeRef.current) return;
        setIsGenerating(true);
        setTimeout(() => {
            purgeGhostPlayers();
            let targetLevelDef;
            if (currentLevelId === 'custom') {
               targetLevelDef = { id: 'custom', name: `⚙️ 自訂 (${randomLevelData.width}x${randomLevelData.height})`, width: randomLevelData.width, height: randomLevelData.height, description: "玩家自訂尺寸的大型地圖！" };
            } else {
               targetLevelDef = LEVELS.find(l => l.id === currentLevelId) || LEVELS[1];
            }
            const newRandomData = HASHI_PUZZLE.generateUniqueHashi(targetLevelDef);
            const empty = HASHI_PUZZLE.generateEmptyBridges(newRandomData);
            syncState({ levelId: currentLevelId, randomLevelData: newRandomData, bridges: empty, strokes: [], showSolution: false, startTime: Date.now() });
            setIsWon(false); setHistory([]); setEndTime(null); setHideVictoryModal(false);
            resetWinMeta();
            setBoardFadeKey(k => k + 1); scheduleFitZoom();
            setIsGenerating(false);
        }, 100);
      };

      const handleLevelChange = (newLevelId) => {
        if (isDailyModeRef.current) return;
        if (engineRef.current !== 'none' && !isHostRef.current) return;

        if (newLevelId === 'custom') {
            setShowCustomModal(true);
            return;
        }

        setIsGenerating(true);
        setTimeout(() => {
            purgeGhostPlayers();
            const targetLevelDef = LEVELS.find(l => l.id === newLevelId);
            if(!targetLevelDef) {
                setIsGenerating(false);
                return;
            }
            const newRandomData = HASHI_PUZZLE.generateUniqueHashi(targetLevelDef);
            const empty = HASHI_PUZZLE.generateEmptyBridges(newRandomData);
            syncState({ levelId: newLevelId, randomLevelData: newRandomData, bridges: empty, strokes: [], showSolution: false, startTime: Date.now() });
            setIsWon(false); setHistory([]); setEndTime(null);
            resetWinMeta();
            setBoardFadeKey(k => k + 1); scheduleFitZoom();
            setIsGenerating(false);
        }, 100);
      };

      const handleCustomGenerate = () => {
          let w = Math.max(5, Math.min(100, tempWidth));
          let h = Math.max(5, Math.min(100, tempHeight));
          setTempWidth(w);
          setTempHeight(h);
          setShowCustomModal(false);

          setIsGenerating(true);
          setTimeout(() => {
              purgeGhostPlayers();
              const customLevelDef = { id: 'custom', name: `⚙️ 自訂 (${w}x${h})`, width: w, height: h, description: "玩家自訂尺寸的大型地圖！" };
              const newRandomData = HASHI_PUZZLE.generateUniqueHashi(customLevelDef);
              const empty = HASHI_PUZZLE.generateEmptyBridges(newRandomData);

              syncState({ levelId: 'custom', randomLevelData: newRandomData, bridges: empty, strokes: [], showSolution: false, startTime: Date.now() });
              setIsWon(false); setHistory([]); setEndTime(null);
            resetWinMeta();
              setBoardFadeKey(k => k + 1); scheduleFitZoom();
              setIsGenerating(false);
          }, 100);
      };

      const closeVictoryModal = () => {
        setIsClosingModal(true);
        setTimeout(() => {
          setHideVictoryModal(true);
          setIsClosingModal(false);
        }, 300);
      };

      const triggerRegenerate = () => {
        setIsClosingModal(true);
        setTimeout(() => {
          setIsClosingModal(false);
          handleRegenerateRandom();
        }, 300);
      };

      const triggerDailyHome = () => {
        setIsClosingModal(true);
        setTimeout(() => {
          setIsClosingModal(false);
          handleGoHome();
        }, 300);
      };

      const switchToOffline = () => {
        setEngine('none'); engineRef.current = 'none';
        setIsHost(false); isHostRef.current = false;
        setRoomId(""); setPlayersList([]);
        connsRef.current = []; connRef.current = null;
        setCursors({}); setRipples([]); setInteractionMode(0);
        setChatMsgs([]); setUnreadChat(0); setChatOpen(false); setChatInput('');
        stopVideo(); // 📹 關閉視訊
      };

      const startSinglePlayer = () => {
        setIsDailyMode(false); isDailyModeRef.current = false;
        resetWinMeta();
        switchToOffline(); setScreen('game'); handleReset(); setIsHeaderCollapsed(true);
      };

      // 每日一題：紀錄過關（只在每日模式呼叫）
      const recordDailyWin = (secs) => {
        const d = dailyDateStrRef.current;
        if (!d) return;
        try {
          const prev = readDailyRecord(d);
          const best = prev ? Math.min(prev.time, secs) : secs;
          localStorage.setItem('hashi_daily_' + d, JSON.stringify({ time: best }));
        } catch (e) {}
        // 連擊只算「今天」：補玩以前日期的題目只記成績，不影響連擊
        try {
          const today = HASHI_PUZZLE.getDailyDateStr();
          if (d === today) {
            const streak = readDailyStreak();
            const yesterday = HASHI_PUZZLE.shiftDateStr(d, -1);
            let newCount;
            if (streak.lastDate === d) newCount = streak.count;
            else if (streak.lastDate === yesterday) newCount = streak.count + 1;
            else newCount = 1;
            localStorage.setItem('hashi_daily_streak', JSON.stringify({ count: newCount, lastDate: d }));
            setDailyStreak(newCount);
          }
        } catch (e) {}
        setDailyDone(readDailyRecord(d));
      };

      const startDailyMode = (dateStr) => {
        const d = clampDailyDate(dateStr);
        const today = HASHI_PUZZLE.getDailyDateStr();
        const rng = HASHI_PUZZLE.getDailySeed(d);
        const dailyDef = { id: 'daily', name: `📅 每日一題 (${d})`, width: 10, height: 10, description: d < today ? `補玩 ${d} 的每日題目：全世界同一題！` : `每日挑戰（${d}）：全世界同一題，一天只有一次機會！` };
        const data = HASHI_PUZZLE.generateUniqueHashi(dailyDef, rng);
        const empty = HASHI_PUZZLE.generateEmptyBridges(data);
        const status = getDailyStatus(d);
        setIsDailyMode(true); isDailyModeRef.current = true;
        setDailyDateStr(d); dailyDateStrRef.current = d;
        setDailyStreak(status.streak);
        setDailyDone(status.done);
        setCurrentLevelId('daily');
        setRandomLevelData(data);
        setBridges(empty);
        setStrokes([]);
        setHistory([]);
        setShowSolution(false);
        setStartTime(Date.now());
        setIsWon(false); setEndTime(null); setHideVictoryModal(false);
        resetWinMeta();
        setBoardFadeKey(k => k + 1); scheduleFitZoom();
        setInteractionMode(0);
        switchToOffline();
        setScreen('game');
        setIsHeaderCollapsed(true);
      };

      // ===== 🎰 暱稱拉霸機（只給沒手動填暱稱的玩家） =====
      const spinSlot = (pool) => {
        if (slotTimerRef.current) { clearTimeout(slotTimerRef.current); slotTimerRef.current = null; }
        const list = (pool && pool.length > 0) ? pool : ANIMAL_NAMES;
        slotPoolRef.current = list;
        setSlotPool(list);
        setSlotRound(r => r + 1);
        setSlotSpinning(true);
        setSlotFinalName(""); slotFinalNameRef.current = "";
        const t0 = Date.now();
        let delay = 60;
        const tick = () => {
          setSlotName(list[(Math.random() * list.length) | 0]);
          if (Date.now() - t0 >= 1800) {
            const finalName = list[(Math.random() * list.length) | 0];
            setSlotName(finalName);
            setSlotFinalName(finalName); slotFinalNameRef.current = finalName;
            setSlotSpinning(false);
            slotTimerRef.current = null;
            try { window.HASHI_SOUND.play('star'); } catch (e) {}
            return;
          }
          delay = Math.min(delay * 1.18, 420);
          slotTimerRef.current = setTimeout(tick, delay);
        };
        tick();
      };

      const openSlotMachine = (mode, pool) => {
        // 新流程：pool 在開拉霸機前就已算好（含已用名單排除），直接轉
        setSlotMode(mode);
        setSlotWaiting(false);
        setSlotName(""); setSlotFinalName(""); slotFinalNameRef.current = "";
        setSlotSpinning(false);
        if (pool) { slotPoolRef.current = pool; setSlotPool(pool); }
        setShowSlotMachine(true);
        spinSlot(pool);
      };

      // 只關拉霸機 modal（回到 nick 步，連線保持）
      const closeSlotModal = () => {
        if (slotTimerRef.current) { clearTimeout(slotTimerRef.current); slotTimerRef.current = null; }
        setShowSlotMachine(false);
        setSlotSpinning(false);
        setSlotWaiting(false);
      };

      // 完整清理 join 流程（回到 choose 步）
      const fullJoinCleanup = () => {
        if (guestNamesTimeoutRef.current) { clearTimeout(guestNamesTimeoutRef.current); guestNamesTimeoutRef.current = null; }
        if (slotTimerRef.current) { clearTimeout(slotTimerRef.current); slotTimerRef.current = null; }
        setShowSlotMachine(false);
        setSlotSpinning(false);
        setSlotWaiting(false);
        suppressCloseRef.current = true;
        if (connRef.current) { try { connRef.current.close(); } catch (e) {} connRef.current = null; }
        if (peerRef.current) { try { peerRef.current.destroy(); } catch (e) {} peerRef.current = null; }
        connsRef.current = [];
        setTimeout(() => { suppressCloseRef.current = false; }, 500);
        engineRef.current = 'none'; setEngine('none');
        setIsConnecting(false);
        setIsHost(false); isHostRef.current = false;
        setRoomId("");
        setPlayersList([]);
        setTakenNames([]);
        setNickError("");
        setTempPlayerName("");
        setJoinStep('choose');
        joinRoleRef.current = null;
        joinActiveRef.current = false;
        guestAutoNameRef.current = false;
        guestJoinedRef.current = false;
        guestNamesResolvedRef.current = false;
      };

      const backToChoose = () => { fullJoinCleanup(); setScreen('join'); };

      const confirmSlotName = () => {
        const name = slotFinalNameRef.current;
        if (!name || slotSpinning) return;
        try { window.HASHI_SOUND.play('click'); } catch (e) {}
        if (slotTimerRef.current) { clearTimeout(slotTimerRef.current); slotTimerRef.current = null; }
        setShowSlotMachine(false);
        setTempPlayerName(name);
        autoNameRef.current = true;
        if (slotMode === 'host') {
          hostConfirmName(name);
        } else {
          guestSendJoin(name, true);
        }
      };

      const handleJoinRejected = (m) => {
        // 最終把關：連線保持開啟，不關閉
        setIsConnecting(false);
        guestJoinedRef.current = false;
        joinActiveRef.current = true;
        setScreen('join');
        setJoinStep('nick');
        if (guestAutoNameRef.current) {
          // 拉霸機自動名：用房主回傳的最新名單再轉一次
          showToast("🎰 剛好被選走了，再轉一次！");
          const taken = new Set((m.names || []).map(normName));
          const pool = ANIMAL_NAMES.filter(a => !taken.has(normName(a)));
          setTakenNames(m.names || []);
          setTimeout(() => { openSlotMachine('guest', pool.length > 0 ? pool : ANIMAL_NAMES); }, 700);
        } else {
          // 手動名：留在 nick 步，inline 錯誤
          setNickError("暱稱「" + (m.dupName || "這個名字") + "」已經有人用了，換一個吧！");
          setTimeout(() => { if (nameInputRef.current) nameInputRef.current.focus(); }, 350);
        }
      };

      // ===== 新流程：先選房間，進去再填暱稱（名字用參數傳遞） =====
      const excludeTakenNames = (pool, taken) => {
        const t = new Set((taken || []).map(normName));
        const rest = pool.filter(a => !t.has(normName(a)));
        return rest.length > 0 ? rest : pool.slice();
      };

      // 房主：建立房間（空名字先佔位）→ nick 步
      const hostCreateRoom = () => {
        mpModeRef.current = mpMode;
        setIsConnecting(true);
        setJoinStep('connecting');
        setNickError("");
        setTempPlayerName(loadSavedNickname());
        joinRoleRef.current = 'host';
        joinActiveRef.current = true;
        // 房主代碼固定不變：第一次隨機產生並存下，之後都用同一組，朋友不用每次重問代碼
        let rId = loadHostRoom();
        if (!rId) { rId = Math.floor(1000 + Math.random() * 9000).toString(); saveHostRoom(rId); }
        hostRoomRetryRef.current = false;
        setEngine('peerjs'); engineRef.current = 'peerjs';
        setupPeerJS(rId, true);
      };

      // 房主在 nick 步確認暱稱 → 進遊戲（競速則進大廳）
      const hostConfirmName = (pName) => {
        const name = (pName || "").trim();
        if (!name) return;
        // 房裡可能已有提早進來的來賓，本地即時檢查
        const clash = playersListRef.current.some(pl => pl.id !== myId && pl.name && normName(pl.name) === normName(name));
        if (clash) { setNickError("已經有人用這個名字了，換一個吧！"); return; }
        const entry = { id: myId, name: name, isHost: true, color: getAvailableColor(playersListRef.current.filter(p => p.id !== myId)) };
        setPlayersList(prev => {
          const nList = [entry].concat(prev.filter(p => p.id !== myId));
          connsRef.current.forEach(c => { if (c.open) { try { c.send({ type: 'PLAYERS_UPDATE', players: nList }); } catch (e) {} } });
          return nList;
        });
        setTempPlayerName(name);
        saveNickname(name);
        joinActiveRef.current = false;
        setIsConnecting(false);
        setScreen('game'); setIsHeaderCollapsed(true);
        if (mpModeRef.current === 'race') { setRaceState('lobby'); raceStateRef.current = 'lobby'; }
      };

      // 來賓：連線 → handshake 拿已用名單 → nick 步
      const guestConnectRoom = () => {
        const rId = tempRoomId.trim().toUpperCase();
        if (!rId) return showToast("⚠️ 請輸入朋友給你的 4 位數代碼");
        saveLastRoom(rId);
        setIsConnecting(true);
        setJoinStep('connecting');
        setNickError("");
        setTempPlayerName(loadSavedNickname());
        setTakenNames([]);
        joinRoleRef.current = 'guest';
        joinActiveRef.current = true;
        guestAutoNameRef.current = false;
        guestJoinedRef.current = false;
        guestNamesResolvedRef.current = false;
        setEngine('peerjs'); engineRef.current = 'peerjs';
        setupPeerJS(rId, false);
      };

      // 來賓送出 JOIN（暱稱已在 nick 步確認過）
      const guestSendJoin = (pName, auto) => {
        const name = (pName || "").trim();
        if (!name) return;
        setNickError("");
        setIsConnecting(true);
        guestAutoNameRef.current = auto;
        autoNameRef.current = auto;
        setTempPlayerName(name);
        saveNickname(name);
        if (connRef.current && connRef.current.open) {
          guestJoinedRef.current = true;
          joinActiveRef.current = false;
          connRef.current.send({ type: 'JOIN', pName: name, uid: myId, auto: auto });
          setScreen('game'); setIsHeaderCollapsed(true); setIsConnecting(false);
        } else {
          setIsConnecting(false);
          showToast("⚠️ 連線已中斷，請重試");
          backToChoose();
        }
      };

      // nick 步：拉霸機（排除已用名單）
      const openSlotForNick = () => {
        setNickError("");
        try { window.HASHI_SOUND.play('click'); } catch (e) {}
        let pool;
        if (joinRoleRef.current === 'host') {
          pool = excludeTakenNames(ANIMAL_NAMES, playersListRef.current.filter(pl => pl.id !== myId && pl.name).map(pl => pl.name));
        } else {
          pool = excludeTakenNames(ANIMAL_NAMES, takenNames);
        }
        openSlotMachine(joinRoleRef.current === 'host' ? 'host' : 'guest', pool);
      };

      // nick 步：按「進入房間」
      const confirmNickAndEnter = () => {
        const name = tempPlayerName.trim();
        setNickError("");
        if (!name) { openSlotForNick(); return; } // 空白 → 拉霸機
        autoNameRef.current = false;
        if (joinRoleRef.current === 'host') {
          hostConfirmName(name);
        } else {
          const clash = takenNames.some(t => normName(t) === normName(name)); // 本地即時檢查
          if (clash) { setNickError("已經有人用這個名字了，換一個吧！"); return; }
          guestSendJoin(name, false);
        }
      };

      const setupPeerJS = (rId, isCreating) => {
        if (isCreating) {
            const p = new Peer(rId + '-host');
            peerRef.current = p;
            p.on('call', handleIncomingCall); // 📹 視訊來電
            p.on('open', function() {
              setIsHost(true); isHostRef.current = true;
              setRoomId(rId); setIsConnecting(false);
              setJoinStep('nick');
              // 空名字先佔位，等 nick 步確認後再填上
              setPlayersList([{ id: myId, name: "", isHost: true, color: getAvailableColor([]) }]);

              p.on('connection', function(c) {
                connsRef.current.push(c);
                c.on('data', function(m) {
                  if (m.type === 'JOIN') {
                      c.uid = m.uid; // 將玩家身分標籤綁定到這個連線上
                      // 撞名檢查：同 uid 重連允許；不同 uid 同名（大小寫不敏感）拒絕
                      const tryName = (m.pName || '').trim();
                      const clash = !!tryName && playersListRef.current.some(pl => pl.id !== m.uid && normName(pl.name) === normName(tryName));
                      if (clash) {
                          // 連線保持開啟：拉霸機自動名會自動重轉，手動名回 nick 步重填
                          c.send({ type: 'JOIN_REJECTED', reason: 'name_taken', dupName: tryName, names: playersListRef.current.map(pl => pl.name) });
                          return;
                      }
                      setPlayersList(prev => {
                          const existingPlayer = prev.find(pl => pl.id === m.uid);
                          let nList;
                          if (existingPlayer) {
                              // 老玩家回歸，更新名字
                              nList = prev.map(pl => pl.id === m.uid ? { ...pl, name: m.pName } : pl);
                          } else {
                              // 新玩家加入
                              const newColor = m.color || getAvailableColor(prev);
                              nList = [...prev, { id: m.uid, name: m.pName, isHost: false, color: newColor }];
                          }
                          // 強制派發最新地圖與名單
                          connsRef.current.forEach(conn => {
                              if (conn === c) {
                                  conn.send({ type: 'INIT', data: stateRef.current, players: nList, mpMode: mpModeRef.current });
                              } else if (conn.open) {
                                  conn.send({ type: 'PLAYERS_UPDATE', players: nList });
                              }
                          });
                          return nList;
                      });
                      // 📹 若房主已開視訊，自動撥給新加入的玩家，並同步麥克風狀態
                      if (videoOnRef.current && localStreamRef.current && c.open) {
                        try {
                          const call = peerRef.current.call(c.peer, localStreamRef.current, { metadata: { uid: myId, name: (myNameRef.current || '你') } });
                          videoCallsRef.current.push(call);
                          const newUid = m.uid;
                          call.on('stream', (rs) => { setRemoteVideos(prev => ({ ...prev, [newUid]: rs })); });
                          call.on('close', () => { setRemoteVideos(prev => { const n = { ...prev }; delete n[newUid]; return n; }); });
                          c.send({ type: 'MIC', uid: myId, name: (myNameRef.current || '你'), muted: (function() { try { const at = localStreamRef.current.getAudioTracks()[0]; return at ? !at.enabled : true; } catch (e) { return true; } })() });
                        } catch (e) {}
                      }
                  } else if (m.type === 'GET_TAKEN_NAMES') {
                      // 只回給該連線：目前已使用的名字（排除空名字，給拉霸機／暱稱檢查用）
                      c.send({ type: 'TAKEN_NAMES', names: playersListRef.current.filter(pl => pl.name && pl.name.trim()).map(pl => pl.name) });
                  } else if (m.type === 'LEAVE') {
                      if (raceStateRef.current !== 'idle') {
                          showToast("⚠️ 對手離開，競速結束");
                          exitRaceToSolo();
                      }
                      // 玩家主動按退出時，觸發在線名單更新
                      setPlayersList(prev => {
                          const nList = prev.filter(pl => pl.id !== m.uid);
                          connsRef.current.forEach(conn => {
                              if (conn !== c && conn.open) conn.send({ type: 'PLAYERS_UPDATE', players: nList });
                          });
                          return nList;
                      });
                  } else if (m.type === 'SYNC') {
                      syncState(m.data, false);
                      connsRef.current.forEach(conn => { if(conn.peer !== c.peer) conn.send({ type: 'SYNC', data: m.data }); });
                  } else if (m.type === 'REQ_COLOR_CHANGE') {
                      setPlayersList(prev => {
                          const nList = prev.map(pl => {
                              if (pl.id === m.targetId) return { ...pl, color: m.color };
                              return pl;
                          });
                          connsRef.current.forEach(conn => conn.send({ type: 'PLAYERS_UPDATE', players: nList }));
                          return nList;
                      });
                  } else if (m.type === 'CURSOR') {
                      connsRef.current.forEach(conn => { if(conn.peer !== c.peer) conn.send(m); });
                      setCursors(prev => ({ ...prev, [m.uid]: { x: m.x, y: m.y } }));
                  } else if (m.type === 'CLICK') {
                      connsRef.current.forEach(conn => { if(conn.peer !== c.peer) conn.send(m); });
                      setRipples(prev => [...prev, { id: Date.now() + Math.random(), uid: m.uid, x: m.x, y: m.y, timestamp: Date.now() }]);
                  } else if (m.type === 'CHAT') {
                      appendChatMsg(m);
                      connsRef.current.forEach(conn => { if(conn.peer !== c.peer && conn.open) conn.send(m); });
                  } else if (m.type === 'MIC') {
                      handleMicMsg(m);
                      connsRef.current.forEach(conn => { if(conn.peer !== c.peer && conn.open) conn.send(m); });
                  } else if (m.type === 'RACE_PROGRESS') {
                      setRaceProgress(prev => ({ ...prev, [m.uid]: { progress: m.progress, name: m.name, color: m.color } }));
                      connsRef.current.forEach(conn => { if(conn.peer !== c.peer && conn.open) conn.send(m); });
                  } else if (m.type === 'RACE_FINISH') {
                      onRaceOpponentFinish(m.uid, m);
                      connsRef.current.forEach(conn => { if(conn.peer !== c.peer && conn.open) conn.send(m); });
                  }
                });

                c.on('close', function() {
                    if (suppressCloseRef.current) return;
                    if (c.uid && raceStateRef.current !== 'idle') {
                        showToast("⚠️ 對手斷線，競速結束");
                        exitRaceToSolo();
                    }
                    connsRef.current = connsRef.current.filter(conn => conn.peer !== c.peer);
                    if (c.uid) { // 如果斷線的是已知玩家，自動拔除並廣播
                        const goneUid = c.uid;
                        setRemoteVideos(prev => { const n = { ...prev }; delete n[goneUid]; return n; }); // 📹 移除視訊
                        setPlayersList(prev => {
                            const nList = prev.filter(pl => pl.id !== c.uid);
                            connsRef.current.forEach(conn => {
                                if (conn.open) conn.send({ type: 'PLAYERS_UPDATE', players: nList });
                            });
                            return nList;
                        });
                    }
                });
              });
            });
            p.on('error', function(err) {
              if (isCreating && err && err.type === 'unavailable-id' && !hostRoomRetryRef.current) {
                // 固定代碼被佔用（多半是上次連線殘留）：換一組新代碼重試一次
                hostRoomRetryRef.current = true;
                clearHostRoom();
                hostCreateRoom();
                return;
              }
              setIsConnecting(false); setJoinStep('choose'); joinActiveRef.current = false; joinRoleRef.current = null; switchToOffline(); showToast("⚠️ 無法建立對局大廳，請重試");
            });
        } else {
            const guestP = new Peer();
            peerRef.current = guestP;
            guestP.on('call', handleIncomingCall); // 📹 視訊來電
            guestP.on('open', function() {
                const c = guestP.connect(rId + '-host');
                connRef.current = c;
                c.on('open', function() {
                  setIsHost(false); isHostRef.current = false;
                  setRoomId(rId);
                  // 新流程：一律先跟房主要已用名單，進 nick 步填完暱稱才 JOIN
                  guestNamesResolvedRef.current = false;
                  c.send({ type: 'GET_TAKEN_NAMES', uid: myId });
                  if (guestNamesTimeoutRef.current) { clearTimeout(guestNamesTimeoutRef.current); }
                  guestNamesTimeoutRef.current = setTimeout(() => {
                    if (!guestNamesResolvedRef.current && !guestJoinedRef.current && joinActiveRef.current) {
                      setTakenNames([]);
                      setIsConnecting(false);
                      setJoinStep('nick');
                    }
                  }, 5000);
                });
                c.on('data', function(m) {
                  if (m.type === 'INIT') {
                      if (m.players) setPlayersList(m.players);
                      if (m.data) syncState(m.data, false);
                      if (m.mpMode === 'race') {
                          setMpMode('race'); mpModeRef.current = 'race';
                          setRaceState('lobby'); raceStateRef.current = 'lobby';
                      }
                  } else if (m.type === 'SYNC') {
                      syncState(m.data, false);
                  } else if (m.type === 'PLAYERS_UPDATE') {
                      if (m.players) setPlayersList(m.players);
                  } else if (m.type === 'RACE_START') {
                      beginRace(m.data, m.startAt);
                  } else if (m.type === 'RACE_REMATCH') {
                      showToast("🏁 房主發起了再來一局！");
                  } else if (m.type === 'RACE_PROGRESS') {
                      setRaceProgress(prev => ({ ...prev, [m.uid]: { progress: m.progress, name: m.name, color: m.color } }));
                  } else if (m.type === 'RACE_FINISH') {
                      onRaceOpponentFinish(m.uid, m);
                  } else if (m.type === 'CURSOR') {
                      setCursors(prev => ({ ...prev, [m.uid]: { x: m.x, y: m.y } }));
                  } else if (m.type === 'CLICK') {
                      setRipples(prev => [...prev, { id: Date.now() + Math.random(), uid: m.uid, x: m.x, y: m.y, timestamp: Date.now() }]);
                  } else if (m.type === 'CHAT') {
                      appendChatMsg(m);
                  } else if (m.type === 'MIC') {
                      handleMicMsg(m);
                  } else if (m.type === 'TAKEN_NAMES') {
                      if (!guestNamesResolvedRef.current && !guestJoinedRef.current && joinActiveRef.current) {
                          if (guestNamesTimeoutRef.current) { clearTimeout(guestNamesTimeoutRef.current); guestNamesTimeoutRef.current = null; }
                          guestNamesResolvedRef.current = true;
                          setTakenNames((m.names || []).filter(n => n && n.trim()));
                          setIsConnecting(false);
                          setJoinStep('nick');
                      }
                  } else if (m.type === 'JOIN_REJECTED' && m.reason === 'name_taken') {
                      handleJoinRejected(m);
                  } else if (m.type === 'REQ_REJOIN') {
                      connRef.current.send({ type: 'JOIN', pName: myNameRef.current, uid: myId, color: myColorRef.current, auto: autoNameRef.current });
                  }
                });
                c.on('close', function() {
                    if (suppressCloseRef.current) return;
                    if (joinActiveRef.current) {
                        // 還在 join 流程（connecting/nick/拉霸機）→ 回 choose 步
                        showToast("⚠️ 連線中斷，請重試");
                        fullJoinCleanup();
                        return;
                    }
                    if (raceStateRef.current !== 'idle') { showToast("⚠️ 對手斷線，競速結束"); exitRaceToSolo(); }
                    else { showToast("⚠️ 主機已離線，切換為單機模式"); switchToOffline(); }
                });
            });
            guestP.on('error', function() {
              if (joinActiveRef.current) {
                showToast("⚠️ 無法連線，請確認代碼是否正確");
                fullJoinCleanup();
              } else {
                setIsConnecting(false); switchToOffline();
                showToast("⚠️ 無法連線，請確認代碼是否正確");
              }
            });
        }
      };

      const handleGoHome = () => {
        if (engineRef.current !== 'none') {
            if (!isHostRef.current && engineRef.current === 'peerjs' && connRef.current) {
               // 有禮貌地先傳送退出訊號給房主，再關閉連線
               connRef.current.send({ type: 'LEAVE', uid: myId });
               setTimeout(() => {
                   if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null; }
               }, 100);
            } else {
               if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null; }
            }
        }
        switchToOffline(); setScreen('home'); setIsWon(false); setEndTime(null); setHistory([]);
        setIsDailyMode(false); isDailyModeRef.current = false;
        setRaceState('idle'); raceStateRef.current = 'idle';
        setRaceWaiting(false); setRaceResult(null); setRaceCountdown(null); setRaceProgress({});
        raceResultsRef.current = {}; myFinishTimeRef.current = null;
        resetWinMeta();
      };

      // ==================== 🏁 競速模式 ====================
      const startRace = () => {
        if (!isHostRef.current || playersListRef.current.length < 2) return;
        const targetLevelDef = { id: 2, name: "10x10 標準", width: 10, height: 10, description: "🏁 競速專用題目，祝好運！" };
        const newRandomData = HASHI_PUZZLE.generateUniqueHashi(targetLevelDef);
        const empty = HASHI_PUZZLE.generateEmptyBridges(newRandomData);
        const startAt = Date.now() + 3500;
        const payload = { randomLevelData: newRandomData, bridges: empty, levelId: 2, showSolution: false, startTime: startAt, strokes: [] };
        connsRef.current.forEach(c => { if (c.open) c.send({ type: 'RACE_START', data: payload, startAt: startAt }); });
        beginRace(payload, startAt);
      };

      const rematchRace = () => {
        if (!isHostRef.current) return;
        connsRef.current.forEach(c => { if (c.open) c.send({ type: 'RACE_REMATCH' }); });
        showToast("🏁 再來一局！");
        startRace();
      };

      const beginRace = (payload, startAt) => {
        const seq = ++raceSeqRef.current;
        setRandomLevelData(payload.randomLevelData);
        setBridges(payload.bridges);
        setCurrentLevelId(payload.levelId || 2);
        setShowSolution(false);
        setStrokes([]);
        setHistory([]);
        setStartTime(startAt);
        setEndTime(null);
        setIsWon(false); setHideVictoryModal(false);
        resetWinMeta();
        setConfetti([]);
        raceStartAtRef.current = startAt;
        myFinishTimeRef.current = null;
        raceResultsRef.current = {};
        setRaceResult(null); setRaceWaiting(false); setRaceCountdown(null);
        lastProgressValRef.current = -1; lastProgressSentRef.current = 0;
        stateRef.current = { ...stateRef.current, ...payload };
        const seed = {};
        playersListRef.current.forEach(p => { seed[p.id] = { progress: 0, name: p.name, color: p.color }; });
        if (!seed[myId]) seed[myId] = { progress: 0, name: (myNameRef.current || '你'), color: myColorRef.current };
        setRaceProgress(seed);
        setCursors({}); // 🏁 競速開始：清掉大廳殘留的游標（競速模式不顯示游標，防作弊）
        levelDimRef.current = { w: payload.randomLevelData.width, h: payload.randomLevelData.height };
        setBoardFadeKey(k => k + 1); scheduleFitZoom();
        setRaceState('countdown'); raceStateRef.current = 'countdown';
        const now = Date.now();
        [3, 2, 1].forEach(n => {
          const delay = Math.max(0, (startAt - n * 1000) - now);
          setTimeout(() => {
            if (raceSeqRef.current !== seq || raceStateRef.current !== 'countdown') return;
            setRaceCountdown(n);
            window.HASHI_SOUND.play('countdown');
          }, delay);
        });
        setTimeout(() => {
          if (raceSeqRef.current !== seq || raceStateRef.current !== 'countdown') return;
          setRaceCountdown(0);
          window.HASHI_SOUND.play('go');
          setRaceState('racing'); raceStateRef.current = 'racing';
          setTimeout(() => { if (raceSeqRef.current === seq) setRaceCountdown(null); }, 900);
        }, Math.max(0, startAt - now));
      };

      const onRaceSelfFinish = (timeMs) => {
        myFinishTimeRef.current = timeMs;
        const msg = { type: 'RACE_FINISH', uid: myId, name: (myNameRef.current || '你'), color: myColorRef.current, timeMs: timeMs };
        if (isHostRef.current) { connsRef.current.forEach(c => { if (c.open) c.send(msg); }); }
        else if (connRef.current && connRef.current.open) { connRef.current.send(msg); }
        if (Object.keys(raceResultsRef.current).length > 0) {
          showRaceResult();
        } else {
          setRaceWaiting(true);
          showToast("⏳ 你完成了！等待對手...");
        }
      };

      const onRaceOpponentFinish = (uid, m) => {
        if (raceResultsRef.current[uid]) return;
        raceResultsRef.current[uid] = { name: (m.name || '對手'), color: m.color, timeMs: m.timeMs };
        if (myFinishTimeRef.current != null) {
          showRaceResult();
        } else {
          showToast("🏁 " + (m.name || '對手') + " 已完成！加油！");
        }
      };

      const showRaceResult = () => {
        const myTime = myFinishTimeRef.current || 0;
        const entries = [{ uid: myId, name: (myNameRef.current || '你'), color: myColorRef.current, timeMs: myTime }];
        Object.keys(raceResultsRef.current).forEach(uid => {
          const r = raceResultsRef.current[uid];
          entries.push({ uid: uid, name: r.name, color: r.color, timeMs: r.timeMs });
        });
        entries.sort((a, b) => a.timeMs - b.timeMs);
        const islCount = ((stateRef.current.randomLevelData && stateRef.current.randomLevelData.islands) || []).length || 1;
        const s = computeStars(Math.floor(myTime / 1000), islCount, false);
        setStars(s);
        for (let si = 0; si < s; si++) {
          setTimeout(() => window.HASHI_SOUND.play('star'), 200 + si * 320);
        }
        setRaceResult({ winnerUid: entries[0].uid, entries: entries });
        setRaceWaiting(false);
        setRaceState('finished'); raceStateRef.current = 'finished';
      };

      const exitRaceToSolo = () => {
        setRaceState('idle'); raceStateRef.current = 'idle';
        setRaceWaiting(false); setRaceResult(null); setRaceCountdown(null); setRaceProgress({});
        raceResultsRef.current = {}; myFinishTimeRef.current = null;
        switchToOffline();
      };
      // ================== 🏁 競速模式結束 ==================

      const handlePlayerColorChange = (playerId, newColor) => {
        if (engineRef.current === 'none') return;

        if (engineRef.current === 'peerjs') {
            if (isHostRef.current) {
                setPlayersList(prev => {
                    const nList = prev.map(p => {
                        if (p.id === playerId) return { ...p, color: newColor };
                        return p;
                    });
                    connsRef.current.forEach(c => c.send({ type: 'PLAYERS_UPDATE', players: nList }));
                    return nList;
                });
            } else if (connRef.current) {
                connRef.current.send({ type: 'REQ_COLOR_CHANGE', targetId: playerId, color: newColor });
            }
        }
      };

      useEffect(function() {
        const islands = (randomLevelData && randomLevelData.islands) ? randomLevelData.islands : [];
        if (islands.length === 0) {
            if (isWon) { setIsWon(false); setEndTime(null); }
            return;
        }

        let allCountsMatch = true;
        for (let i=0; i<islands.length; i++) {
           if (islandCurrentCounts[islands[i].id].real !== islands[i].req) { allCountsMatch = false; break; }
        }
        if (!allCountsMatch) {
            if (isWon) { setIsWon(false); setEndTime(null); }
            return;
        }

        const adjList = {}; islands.forEach(i => { adjList[i.id] = []; });
        (bridges || []).forEach(b => {
           if (b.count > 0 && adjList[b.from] && adjList[b.to]) {
               adjList[b.from].push(b.to); adjList[b.to].push(b.from);
           }
        });
        const visited = new Set(); const queue = [islands[0].id];
        if (queue.length > 0) visited.add(queue[0]);
        while (queue.length > 0) {
          const curr = queue.shift();
          if (adjList[curr]) {
            adjList[curr].forEach(neighbor => { if (!visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor); } });
          }
        }
        if (visited.size === islands.length && islands.length > 0) {
            if (!isWon) {
                setIsWon(true);
                setEndTime(Date.now());
                setHideVictoryModal(false);
                const secs = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
                if (raceStateRef.current === 'racing') {
                    // 🏁 競速完賽：記錄個人成績並通知對手，不播標準勝利音效
                    const timeMs = Math.max(0, Date.now() - raceStartAtRef.current);
                    recordBest(secs);
                    onRaceSelfFinish(timeMs);
                } else {
                    window.HASHI_SOUND.play('win');
                    const s = computeStars(secs, islands.length, showSolution);
                    setStars(s);
                    for (let si = 0; si < s; si++) {
                        setTimeout(() => window.HASHI_SOUND.play('star'), 200 + si * 320);
                    }
                    recordBest(secs);
                    if (isDailyModeRef.current) {
                        recordDailyWin(secs);
                    }
                }
            }
        } else {
            if (isWon) { setIsWon(false); setEndTime(null); }
        }
      }, [bridges, randomLevelData, islandCurrentCounts, isWon]);

      const handleSaveCode = () => {
        const saveData = {
            lid: currentLevelId,
            r: randomLevelData,
            b: (bridges || []).filter(br => br.count > 0 || (br.draftCount || 0) > 0).map(br => ({ i: br.id, c: br.count, d: br.draftCount || 0, o: br.owner })),
            s: strokes
        };
        const code = btoa(encodeURIComponent(JSON.stringify(saveData)));
        setSaveCode(code);
        const textArea = document.createElement("textarea"); textArea.value = code; document.body.appendChild(textArea); textArea.select();
        try { document.execCommand('copy'); showToast("✅ 已產生並複製代碼！"); } catch (err) {}
        document.body.removeChild(textArea);
      };

      const handleQuickPaste = async () => {
        try { if (navigator.clipboard && navigator.clipboard.readText) { const text = await navigator.clipboard.readText(); if(text) { setSaveCode(text); showToast("✅ 貼上成功！"); } } else { throw new Error(); } }
        catch (err) { const ta = document.getElementById("saveCodeTextarea"); if (ta) ta.focus(); showToast("⚠️ 瀏覽器阻擋自動貼上，請手動貼上"); }
      };

      const handleLoadCode = () => {
        try {
          if (!saveCode.trim()) return showToast("⚠️ 請貼上代碼");
          const data = JSON.parse(decodeURIComponent(atob(saveCode.trim())));

          let baseLevel, newRandom;
          if (data.lid === 'custom' || data.lid === 'daily') {
              baseLevel = { id: data.lid, name: data.lid === 'daily' ? `📅 每日一題` : `⚙️ 自訂尺寸`, islands: (data.r && data.r.islands) ? data.r.islands : [] };
              newRandom = data.r;
          } else {
              baseLevel = LEVELS.find(l => l.id === data.lid);
              if (!baseLevel) return showToast("⚠️ 無效的代碼");
              newRandom = data.r;
          }

          const islandsToUse = newRandom && newRandom.islands ? newRandom.islands : baseLevel.islands;
          const emptyBridges = HASHI_PUZZLE.generateEmptyBridges({ islands: islandsToUse });

          data.b.forEach(savedBr => { let tb = emptyBridges.find(eb => eb.id === savedBr.i); if (tb) { tb.count = savedBr.c || 0; tb.draftCount = savedBr.d || 0; tb.owner = savedBr.o; } });
          setCurrentLevelId(data.lid);
          syncState({ randomLevelData: newRandom, bridges: emptyBridges, strokes: data.s || [], showSolution: false });
          setIsWon(false); setShowSaveModal(false); showToast("✅ 讀取成功！");
        } catch(e) { showToast("⚠️ 讀檔失敗！"); }
      };

      const handleZoomIn = () => {
          let newZoom = Math.min(zoomLevelRef.current + 0.3, 3.5);
          userZoomedRef.current = true;

          if (svgW * newZoom > MAX_SAFE_DIMENSION || svgH * newZoom > MAX_SAFE_DIMENSION) {
              newZoom = Math.min(MAX_SAFE_DIMENSION / svgW, MAX_SAFE_DIMENSION / svgH);
              showToast("⚠️ 已達此設備顯示極限，無法再放大");
          }

          zoomLevelRef.current = newZoom;
          setZoomLevel(newZoom);
          setZoomModeIdx(0);
          zoomModeIdxRef.current = 0;
          if (svgRef.current) {
              svgRef.current.style.width = `${svgW * newZoom}px`;
              svgRef.current.style.height = `${svgH * newZoom}px`;
          }
      };
      const handleZoomOut = () => {
          let newZoom = Math.max(zoomLevelRef.current - 0.3, 0.4);
          userZoomedRef.current = true;
          zoomLevelRef.current = newZoom;
          setZoomLevel(newZoom);
          setZoomModeIdx(0);
          zoomModeIdxRef.current = 0;
          if (svgRef.current) {
              svgRef.current.style.width = `${svgW * newZoom}px`;
              svgRef.current.style.height = `${svgH * newZoom}px`;
          }
      };
      const handleZoomReset = () => {
          zoomLevelRef.current = 1;
          userZoomedRef.current = true;
          setZoomLevel(1);
          setZoomModeIdx(0);
          zoomModeIdxRef.current = 0;
          if (svgRef.current) {
              svgRef.current.style.width = `${svgW}px`;
              svgRef.current.style.height = `${svgH}px`;
          }
      };

      // === 題目自動適應螢幕（新題目 / 旋轉螢幕時呼叫） ===
      const applyFitZoom = () => {
        const container = zoomContainerRef.current;
        if (!container) return false;
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        if (!cw || !ch) return false;
        const { w, h } = levelDimRef.current;
        const sW = (w - 1) * SCALE + PADDING * 2;
        const sH = (h - 1) * SCALE + PADDING * 2;
        const paddingFactor = 0.95;
        let newZoom = Math.min(cw / sW, ch / sH) * paddingFactor;
        newZoom = Math.min(Math.max(newZoom, 0.2), 3.5);
        if (sW * newZoom > MAX_SAFE_DIMENSION || sH * newZoom > MAX_SAFE_DIMENSION) {
            newZoom = Math.min(MAX_SAFE_DIMENSION / sW, MAX_SAFE_DIMENSION / sH);
        }
        userZoomedRef.current = false;
        zoomLevelRef.current = newZoom;
        setZoomLevel(newZoom);
        setZoomModeIdx(3);
        zoomModeIdxRef.current = 3;
        if (svgRef.current) {
            svgRef.current.style.width = `${sW * newZoom}px`;
            svgRef.current.style.height = `${sH * newZoom}px`;
        }
        return true;
      };
      const scheduleFitZoom = () => {
        // 等 DOM 穩定再量測；量不到就 350ms 後重試一次
        setTimeout(() => {
            requestAnimationFrame(() => {
                if (!applyFitZoom()) {
                    setTimeout(() => requestAnimationFrame(() => { applyFitZoom(); }), 350);
                }
            });
        }, 60);
      };

      const handleCycleZoom = () => {
        const nextIdx = (zoomModeIdxRef.current + 1) % 4;
        setZoomModeIdx(nextIdx);
        zoomModeIdxRef.current = nextIdx;
        userZoomedRef.current = true; // 手動縮放

        const container = zoomContainerRef.current;
        if (!container) return;

        const paddingFactor = 0.95;
        const cw = container.clientWidth;
        const ch = container.clientHeight;

        let newZoom = 1;
        if (nextIdx === 0) {
          newZoom = 1;
          showToast("🔍 原始大小 (1x)");
        } else if (nextIdx === 1) {
          newZoom = (cw / svgW) * paddingFactor;
          showToast("↔️ 適應螢幕寬度");
        } else if (nextIdx === 2) {
          newZoom = (ch / svgH) * paddingFactor;
          showToast("↕️ 適應螢幕長度");
        } else if (nextIdx === 3) {
          newZoom = Math.min(cw / svgW, ch / svgH) * paddingFactor;
          showToast("🔲 長寬自動適應");
        }

        newZoom = Math.min(Math.max(newZoom, 0.2), 3.5);

        if (svgW * newZoom > MAX_SAFE_DIMENSION || svgH * newZoom > MAX_SAFE_DIMENSION) {
            newZoom = Math.min(MAX_SAFE_DIMENSION / svgW, MAX_SAFE_DIMENSION / svgH);
        }

        zoomLevelRef.current = newZoom;
        setZoomLevel(newZoom);

        if (svgRef.current) {
            svgRef.current.style.width = `${svgW * newZoom}px`;
            svgRef.current.style.height = `${svgH * newZoom}px`;
        }
      };

      // === 首次教學導覽 overlay（可在任何畫面開啟） ===
      const closeTutorial = () => {
        try { localStorage.setItem('hashi_tutorial_seen', '1'); } catch (e) {}
        setShowTutorial(false);
      };
      // ===== 👆 架橋教學動畫（兩幕：拖曳 → 點擊三連拍） =====
      const BridgeDemo = () => (
        <div className="bdemo mb-4" aria-hidden="true">
          <div className="bdemo-section bdemo-sec1">拖曳</div>
          <div className="bdemo-section bdemo-sec2">點擊</div>
          <div className="bdemo-label bdemo-l1">👆 按住拖曳，放開架橋</div>
          <div className="bdemo-label bdemo-l2">點一下：1 座橋</div>
          <div className="bdemo-label bdemo-l3">點兩下：2 座橋</div>
          <div className="bdemo-label bdemo-l4">點三下：取消</div>
          <div className="bdemo-scene">
            <div className="bdemo-island" style={{ left: '30px' }}>3</div>
            <div className="bdemo-island" style={{ left: '210px' }}>2</div>
            <div className="bdemo-preview"></div>
            <div className="bdemo-bridge bdemo-b1"></div>
            <div className="bdemo-bridge bdemo-bd1"></div>
            <div className="bdemo-bridge bdemo-bd2"></div>
            <div className="bdemo-finger">👆</div>
            <div className="bdemo-ripple"></div>
          </div>
        </div>
      );

      // ===== ✏️ 草稿教學動畫：虛線兩法 → 切畫筆一點變實線 =====
      const DraftDemo = () => (
        <div className="bdemo mb-4" aria-hidden="true">
          <div className="bdemo-label ddemo-l1">✏️ 草稿：拖曳畫出虛線</div>
          <div className="bdemo-label ddemo-l2">👆 點擊：點兩下 2 條虛線</div>
          <div className="bdemo-label ddemo-l3">切回畫筆模式 ✎</div>
          <div className="bdemo-label ddemo-l4">點一下：虛線直接變實線！</div>
          <div className="bdemo-scene">
            <div className="ddemo-mode"><span className="ddemo-m ddemo-m-draft">✏️ 草稿</span><span className="ddemo-m ddemo-m-pen">✎ 畫筆</span></div>
            <div className="bdemo-island" style={{ left: '30px' }}>3</div>
            <div className="bdemo-island" style={{ left: '210px' }}>2</div>
            <div className="bdemo-preview ddemo-preview"></div>
            <div className="ddemo-dash ddemo-db1"></div>
            <div className="ddemo-dash ddemo-dbA"></div>
            <div className="ddemo-dash ddemo-dbB"></div>
            <div className="bdemo-bridge ddemo-sbA"></div>
            <div className="bdemo-bridge ddemo-sbB"></div>
            <div className="bdemo-finger ddemo-finger">👆</div>
            <div className="bdemo-ripple ddemo-ripple"></div>
          </div>
        </div>
      );

      // ===== 🔌 連線教學動畫：房主建房拿代碼 → 代碼飛給朋友 → 朋友輸入加入 → 成功 =====
      const ConnectDemo = () => (
        <div className="conn-demo mb-4" aria-hidden="true">
          <div className="conn-phone conn-host">
            <div className="conn-ptitle">🏠 房主</div>
            <div className="conn-btn">建立房間</div>
            <div className="conn-code"><span>1</span><span>2</span><span>3</span><span>4</span></div>
          </div>
          <div className="conn-wire"><div className="conn-chip">1234</div></div>
          <div className="conn-phone conn-guest">
            <div className="conn-ptitle">🚪 朋友</div>
            <div className="conn-input"><span>1</span><span>2</span><span>3</span><span>4</span></div>
            <div className="conn-btn">加入房間</div>
          </div>
          <div className="conn-success">✅ 連線成功！</div>
        </div>
      );

      const openTutorial = () => {
        window.HASHI_SOUND.play('click');
        setTutorialStep(0);
        setShowTutorial(true);
      };

      const tutorialOverlay = showTutorial ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-[#f3fbf3] border-4 border-slate-800 rounded-2xl p-6 shadow-[8px_8px_0px_rgba(30,41,59,1)] w-full max-w-md animate-popUpCenter">
            <div className="text-5xl mb-3 text-center">{TUTORIAL_STEPS[tutorialStep].icon}</div>
            <h2 className="text-xl font-black text-slate-800 mb-2 text-center">{TUTORIAL_STEPS[tutorialStep].title}</h2>
            <p className="text-sm font-bold text-slate-600 leading-relaxed mb-4 text-center">{TUTORIAL_STEPS[tutorialStep].body}</p>
            {TUTORIAL_STEPS[tutorialStep].demo === 'connect' && <ConnectDemo />}
            {TUTORIAL_STEPS[tutorialStep].demo === 'bridge' && <BridgeDemo />}
            {TUTORIAL_STEPS[tutorialStep].demo === 'draft' && <DraftDemo />}
            <div className="flex justify-center gap-2 mb-5">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div key={idx} className={`w-2.5 h-2.5 rounded-full border-2 border-slate-800 ${idx === tutorialStep ? 'bg-[#4ade80]' : 'bg-white'}`} />
              ))}
            </div>
            <div className="flex gap-3">
              {tutorialStep > 0 && (
                <button onClick={() => { window.HASHI_SOUND.play('click'); setTutorialStep(tutorialStep - 1); }} className="flex-1 py-2.5 bg-white border-4 border-slate-800 rounded-xl font-black text-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all">上一步</button>
              )}
              <button onClick={closeTutorial} className="flex-1 py-2.5 bg-white border-4 border-slate-800 rounded-xl font-black text-slate-400 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all">跳過</button>
              {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                <button onClick={() => { window.HASHI_SOUND.play('click'); setTutorialStep(tutorialStep + 1); }} className="flex-1 py-2.5 bg-[#4ade80] border-4 border-slate-800 rounded-xl font-black text-slate-900 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all">下一步</button>
              ) : (
                <button onClick={closeTutorial} className="flex-1 py-2.5 bg-emerald-400 border-4 border-slate-800 rounded-xl font-black text-slate-900 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all">開始遊戲 🎮</button>
              )}
            </div>
          </div>
        </div>
      ) : null;

      if (screen === 'home') {
        return (
          <div className="h-screen w-screen flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fadeIn">
            <div className="flex-1 flex flex-col justify-center w-full max-w-md items-center">
              <div className="bg-[#f3fbf3] border-4 border-slate-800 p-10 rounded-xl shadow-[8px_8px_0px_rgba(30,41,59,1)] w-full text-center relative transform -rotate-1 z-10">
                 <h1 className="text-6xl font-black text-slate-800 mb-6 tracking-widest flex justify-center gap-3">
                    <span className="inline-block animate-float-slow bg-[#4ade80] px-4 py-2 border-4 border-slate-800 rounded-xl transform rotate-3 shadow-[4px_4px_0px_rgba(30,41,59,1)]">數</span>
                    <span className="inline-block animate-float-slow animate-float-slow-d bg-[#4ade80] px-4 py-2 border-4 border-slate-800 rounded-xl transform -rotate-2 shadow-[4px_4px_0px_rgba(30,41,59,1)]">橋</span>
                    <span className="inline-block self-center bg-[#2d2a26] text-[#4ade80] text-base px-3 py-1.5 border-[3px] border-slate-800 rounded-lg transform rotate-3 shadow-[3px_3px_0px_rgba(30,41,59,1)] tracking-widest">測試版</span>
                 </h1>
                 <div className="inline-block border-[3px] border-dashed border-slate-800 rounded-xl px-6 py-2 mb-8 bg-white shadow-[4px_4px_0px_rgba(30,41,59,1)] transform rotate-2">
                    <p className="text-slate-800 font-black text-xl tracking-widest uppercase italic">Hashi Puzzle</p>
                 </div>
                 <div className="flex flex-col gap-5">
                    <button onClick={startSinglePlayer} className="w-full py-4 bg-white border-4 border-slate-800 rounded-xl font-black text-xl text-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all transform rotate-1">👤 單機挑戰</button>
                    <button onClick={() => { setJoinStep('choose'); setTempPlayerName(""); setNickError(""); setScreen('join'); }} className="w-full py-4 bg-emerald-400 border-4 border-slate-800 rounded-xl font-black text-xl text-slate-900 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all transform -rotate-1">🌐 多人合作</button>
                    <button onClick={() => startDailyMode(dailyMenuDate)} className="w-full py-4 bg-[#4ade80] border-4 border-slate-800 rounded-xl font-black text-xl text-slate-900 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all transform rotate-1">📅 每日一題</button>
                    <div className="-mt-2 flex items-center justify-center gap-1.5">
                      <span className="text-slate-500 font-bold text-xs whitespace-nowrap">🕘 以前的題目</span>
                      <button onClick={() => setDailyMenuDate(d => clampDailyDate(HASHI_PUZZLE.shiftDateStr(d, -1)))} disabled={dailyMenuDate <= MIN_DAILY_DATE} className="px-2 py-1 bg-white border-2 border-slate-800 rounded-md font-black text-xs text-slate-800 shadow-[2px_2px_0px_rgba(30,41,59,1)] disabled:opacity-30 active:translate-y-0.5 active:shadow-none">◀</button>
                      <input type="date" value={dailyMenuDate} min={MIN_DAILY_DATE} max={HASHI_PUZZLE.getDailyDateStr()} onChange={(e) => setDailyMenuDate(clampDailyDate(e.target.value))} className="border-2 border-slate-800 rounded-md px-1.5 py-1 font-bold text-sm bg-white text-slate-800 outline-none" />
                      <button onClick={() => setDailyMenuDate(d => clampDailyDate(HASHI_PUZZLE.shiftDateStr(d, 1)))} disabled={dailyMenuDate >= HASHI_PUZZLE.getDailyDateStr()} className="px-2 py-1 bg-white border-2 border-slate-800 rounded-md font-black text-xs text-slate-800 shadow-[2px_2px_0px_rgba(30,41,59,1)] disabled:opacity-30 active:translate-y-0.5 active:shadow-none">▶</button>
                    </div>
                    {dailyStatus && (
                      <p className="text-slate-600 font-bold text-sm -mt-2">
                        {dailyStatus.done ? `✅ 已完成 ${formatTime(dailyStatus.done.time)}` : `📅 ${dailyStatus.dateStr}`}
                        {dailyStatus.streak > 1 ? `  🔥 連擊 x${dailyStatus.streak}` : ''}
                      </p>
                    )}
                    <button onClick={openTutorial} className="w-full py-3 bg-white border-4 border-slate-800 rounded-xl font-black text-lg text-slate-600 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all">❓ 玩法說明</button>
                 </div>
              </div>
            </div>
            <div className="shrink-0 pb-4 text-slate-800 font-black text-sm opacity-60 tracking-wider z-10">Copyright © 2026 葉大帥. All rights reserved. (v2.18 測試版)</div>
            {tutorialOverlay}
          </div>
        );
      }

      if (screen === 'join') {
        return (
          <div className="h-screen w-screen flex flex-col items-center justify-center p-4 relative animate-fadeIn">
            <div className="bg-[#f3fbf3] border-4 border-slate-800 p-8 rounded-xl shadow-[10px_10px_0px_rgba(30,41,59,1)] max-w-2xl w-full z-10 transform rotate-1">
              <h2 className="text-2xl font-black text-slate-800 mb-6 inline-block border-b-4 border-[#4ade80] pb-1 select-none">🌐 多人連線選單</h2>

              {joinStep === 'choose' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => { window.HASHI_SOUND.play('click'); setJoinStep('hostSetup'); }} disabled={isConnecting} className="bg-blue-500 text-white border-4 border-slate-800 rounded-xl p-6 shadow-[6px_6px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50 text-left">
                  <div className="font-black text-2xl mb-1">🏠 建立房間</div>
                  <div className="text-xs font-bold opacity-90 leading-relaxed">你是房主！代碼固定不變，朋友用同一組代碼加入</div>
                </button>
                <button onClick={() => { window.HASHI_SOUND.play('click'); setJoinStep('guestSetup'); }} disabled={isConnecting} className="bg-emerald-400 text-slate-900 border-4 border-slate-800 rounded-xl p-6 shadow-[6px_6px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50 text-left">
                  <div className="font-black text-2xl mb-1">🚪 加入房間</div>
                  <div className="text-xs font-bold opacity-80 leading-relaxed">輸入朋友給你的 4 位數代碼</div>
                </button>
              </div>)}

              {joinStep === 'hostSetup' && (<div>
                <div className="mb-6 bg-white p-4 rounded-lg border-2 border-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)]">
                  <label className="block text-slate-800 font-black text-sm mb-2">選擇遊戲模式</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setMpMode('coop'); mpModeRef.current = 'coop'; window.HASHI_SOUND.play('click'); }} disabled={isConnecting} className={"py-3 border-4 border-slate-800 rounded-xl font-black text-lg shadow-[4px_4px_0px_rgba(30,41,59,1)] transition-all " + (mpMode === 'coop' ? 'bg-emerald-400 text-slate-900' : 'bg-white text-slate-400')}>🤝 合作</button>
                    <button onClick={() => { setMpMode('race'); mpModeRef.current = 'race'; window.HASHI_SOUND.play('click'); }} disabled={isConnecting} className={"py-3 border-4 border-slate-800 rounded-xl font-black text-lg shadow-[4px_4px_0px_rgba(30,41,59,1)] transition-all " + (mpMode === 'race' ? 'bg-red-400 text-slate-900' : 'bg-white text-slate-400')}>🏁 競速</button>
                  </div>
                  <p className="text-xs text-slate-500 font-bold mt-2">{mpMode === 'race' ? '🏁 兩人挑戰同一題目，比誰先解完！（來賓以房主選擇為準）' : '🤝 和朋友在同一張地圖上合作解題。'}</p>
                </div>
                <button onClick={hostCreateRoom} disabled={isConnecting} className="w-full py-4 bg-blue-500 text-white border-4 border-slate-800 rounded-xl font-black text-xl shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">🏠 建立房間</button>
                <button onClick={() => setJoinStep('choose')} disabled={isConnecting} className="mt-4 w-full text-slate-400 font-bold hover:text-slate-800 hover:underline text-center transition-colors disabled:opacity-50">← 返回</button>
              </div>)}
              {joinStep === 'guestSetup' && (<div>
                <div className="mb-6 bg-white p-4 rounded-lg border-2 border-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)]">
                  <label className="block text-slate-800 font-black text-sm mb-2">輸入朋友的 4 位數代碼</label>
                  <input type="text" maxLength="5" placeholder="4 位數代碼" value={tempRoomId} onChange={(e) => setTempRoomId(e.target.value.toUpperCase())} disabled={isConnecting} className="w-full border-4 border-slate-800 rounded-xl p-3 font-black text-center text-2xl tracking-widest outline-none bg-white uppercase shadow-[4px_4px_0px_rgba(30,41,59,1)] disabled:opacity-50" />
                </div>
                <button onClick={guestConnectRoom} disabled={isConnecting} className="w-full py-4 bg-emerald-400 text-slate-900 border-4 border-slate-800 rounded-xl font-black text-xl shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">🚪 加入房間</button>
                <button onClick={() => setJoinStep('choose')} disabled={isConnecting} className="mt-4 w-full text-slate-400 font-bold hover:text-slate-800 hover:underline text-center transition-colors disabled:opacity-50">← 返回</button>
              </div>)}
              {joinStep === 'connecting' && (
                <div className="bg-white p-8 rounded-lg border-2 border-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)] text-center">
                  <p className="text-slate-800 font-black text-xl animate-pulse">{joinRoleRef.current === 'host' ? "🏠 建立房間中…" : "🔌 連線中…"}</p>
                  <p className="text-slate-500 font-bold text-sm mt-2">請稍候一下下</p>
                </div>
              )}
              {joinStep === 'nick' && (
                <div className="bg-white p-4 rounded-lg border-2 border-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)]">
                  {joinRoleRef.current === 'host' ? (
                    <div className="mb-4 bg-blue-50 border-2 border-dashed border-blue-400 rounded-lg p-3 text-center">
                      <p className="font-black text-slate-800 text-lg">🏠 房間 <span className="text-2xl tracking-[0.3em]">{roomId}</span> 已建立！</p>
                      <p className="text-xs text-slate-600 font-bold mt-1">把這組代碼傳給朋友吧</p>
                    </div>
                  ) : (
                    <div className="mb-4 bg-emerald-50 border-2 border-dashed border-emerald-400 rounded-lg p-3 text-center">
                      <p className="font-black text-slate-800 text-lg">🚪 已連上房間 <span className="text-2xl tracking-[0.3em]">{roomId}</span></p>
                      <p className="text-xs text-slate-600 font-bold mt-1">取個名字就可以進去了</p>
                    </div>
                  )}
                  <label className="block text-slate-800 font-black text-sm mb-2">取個名字 <span className="text-slate-400 font-bold">（可留白，拉霸機幫你抽！）</span></label>
                  <input ref={nameInputRef} type="text" maxLength={12} placeholder={"例如：" + namePlaceholderAnimal + "（留白隨機抽一個！）"} value={tempPlayerName} onChange={(e) => { setTempPlayerName(e.target.value); setNickError(""); }} disabled={isConnecting} className="w-full border-2 border-slate-800 rounded-md p-3 font-bold bg-green-50 outline-none focus:ring-2 ring-[#4ade80] disabled:opacity-50" />
                  {nickError && <p className="text-red-600 font-black text-sm mt-2 animate-fadeIn">⚠️ {nickError}</p>}
                  <div className="flex gap-2 mt-4">
                    <button onClick={backToChoose} disabled={isConnecting} className="px-4 py-3 bg-white border-4 border-slate-800 rounded-xl font-black text-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50">← 返回</button>
                    <button onClick={openSlotForNick} disabled={isConnecting} className="flex-1 py-3 bg-[#4ade80] border-4 border-slate-800 rounded-xl font-black text-slate-900 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50">🎰 隨機抽一個</button>
                    <button onClick={confirmNickAndEnter} disabled={isConnecting} className="flex-1 py-3 bg-emerald-400 border-4 border-slate-800 rounded-xl font-black text-slate-900 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50">{isConnecting ? "進入中…" : "進入房間"}</button>
                  </div>
                </div>
              )}
              {joinStep === 'choose' && (
                <button onClick={() => { window.HASHI_SOUND.play('click'); setTutorialStep(Math.max(0, TUTORIAL_STEPS.findIndex(s => s.demo === 'connect'))); setShowTutorial(true); }} className="mt-4 w-full text-slate-500 font-bold text-sm hover:text-slate-800 hover:underline text-center transition-colors">🔌 不知道怎麼跟朋友連線？看動畫教學</button>
              )}
              {(joinStep === 'choose' || joinStep === 'hostSetup' || joinStep === 'guestSetup') && (
              <button onClick={() => setScreen('home')} disabled={isConnecting} className="mt-8 w-full text-slate-400 font-bold hover:text-slate-800 hover:underline text-center transition-colors disabled:opacity-50">取消返回主選單</button>
              )}
            </div>
            {showSlotMachine && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
                <div className="bg-[#f6fdf6] border-[4px] border-[#2d2a26] rounded-2xl p-6 shadow-[10px_10px_0px_rgba(30,41,59,1)] w-full max-w-sm animate-popUpCenter text-center">
                  <h2 className="text-2xl font-black text-slate-800 mb-1">🎰 暱稱拉霸機</h2>
                  <p className="text-xs font-bold text-slate-500 mb-4">沒填名字？那就交給命運吧！</p>
                  <div className="bg-slate-800 rounded-xl border-4 border-[#4ade80] px-4 mb-4 min-h-[96px] flex items-center justify-center">
                    {slotWaiting ? (
                      <p className="text-white font-black animate-pulse text-lg">正在確認可用名字…</p>
                    ) : (
                      <p key={'slot-' + slotRound + '-' + (slotFinalName || 'spinning')} className={"font-black text-white " + (slotFinalName && !slotSpinning ? "text-3xl animate-popUpCenter" : "text-2xl text-yellow-200")}>{slotName || "…"}</p>
                    )}
                  </div>
                  {!slotWaiting && (
                    <div className="flex gap-3 mb-3">
                      <button onClick={() => { try { window.HASHI_SOUND.play('click'); } catch (e) {} spinSlot(slotPoolRef.current); }} disabled={slotSpinning} className="flex-1 py-3 bg-white border-4 border-slate-800 rounded-xl font-black text-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50">🔄 再轉一次</button>
                      <button onClick={confirmSlotName} disabled={slotSpinning || !slotFinalName} className="flex-1 py-3 bg-[#4ade80] border-4 border-slate-800 rounded-xl font-black text-slate-900 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50">✅ 就用這個進入</button>
                    </div>
                  )}
                  <button onClick={closeSlotModal} className="w-full text-slate-400 font-bold hover:text-slate-800 hover:underline text-center transition-colors text-sm">取消</button>
                </div>
              </div>
            )}
  
          {toastMsg && <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full font-bold shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-[100] border-[3px] border-white animate-slideUpFade">{toastMsg}</div>}
            {tutorialOverlay}
          </div>
        );
      }

      const sortedBridges = [...bridges].sort((a, b) => {
          const aActive = (a.count + (a.draftCount || 0)) > 0 ? 1 : 0;
          const bActive = (b.count + (b.draftCount || 0)) > 0 ? 1 : 0;
          return aActive - bActive;
      });

      return (
        <div className="h-screen w-screen p-1 md:p-4 flex flex-col items-center font-sans relative" style={{ backgroundColor: '#e9f7e9', backgroundImage: 'radial-gradient(#b7ddb7 2px, transparent 2px)', backgroundSize: '12px 12px' }}>
          <div className="w-full max-w-[1200px] bg-[#f3fbf3] rounded-xl border-4 border-slate-800 shadow-[8px_8px_0px_rgba(30,41,59,1)] flex flex-col h-full relative z-10 overflow-hidden">

            <div className={`bg-gradient-to-b from-[#ffd633] to-[#4ade80] border-b-4 border-slate-800 shrink-0 z-50 relative transition-all duration-300 ease-in-out px-2 md:px-4 py-2 flex flex-col gap-2`}>
               <div className="flex items-center justify-between gap-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                     <h1 className="font-black tracking-tight uppercase text-lg md:text-2xl text-[#2d2a26] flex items-center gap-1">🌉<span className="hidden sm:inline">數橋</span><span className="bg-[#2d2a26] text-[#4ade80] text-[10px] md:text-xs px-1.5 py-0.5 rounded-md tracking-widest">測試版</span></h1>
                     <div className="flex items-center gap-1 bg-[#2d2a26] text-white px-2 py-1 rounded-md font-mono font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.4)] text-xs md:text-sm whitespace-nowrap">
                        <GameTimer startTime={startTime} endTime={endTime} isRunning={!isWon && screen === 'game'} />
                     </div>
                     {isDailyMode && ( <span className="flex items-center gap-0.5 bg-[#4ade80] text-[#2d2a26] pl-1 pr-1.5 py-1 rounded-md border-2 border-[#2d2a26] font-black text-xs md:text-sm shadow-[2px_2px_0px_rgba(0,0,0,0.3)] whitespace-nowrap">
                       <button onClick={() => startDailyMode(HASHI_PUZZLE.shiftDateStr(dailyDateStr, -1))} disabled={dailyDateStr <= MIN_DAILY_DATE} className="disabled:opacity-30 px-1" title="前一天的題目">◀</button>
                       <span>📅 {dailyDateStr}</span>
                       <button onClick={() => startDailyMode(HASHI_PUZZLE.shiftDateStr(dailyDateStr, 1))} disabled={dailyDateStr >= HASHI_PUZZLE.getDailyDateStr()} className="disabled:opacity-30 px-1" title="後一天的題目">▶</button>
                     </span> )}
                     {isDailyMode && dailyStreak > 0 && ( <span className="bg-red-500 text-white px-2 py-1 rounded-md border-2 border-[#2d2a26] font-black text-xs md:text-sm shadow-[2px_2px_0px_rgba(0,0,0,0.3)] whitespace-nowrap">🔥 x{dailyStreak}</span> )}
                     {(videoOn || Object.keys(remoteVideos).length > 0) && (
              <div className="px-4 py-2 bg-slate-800 flex gap-3 items-start overflow-x-auto shrink-0">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-[3px] border-[#4ade80] shadow relative bg-slate-600">
                    {localStream ? (
                      <video ref={el => { if (el) el.srcObject = localStream; }} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: myColorRef.current === 'rainbow' ? '#a855f7' : (myColorRef.current || '#3b82f6') }}>{(myNameRef.current || '你').slice(0, 1)}</div>
                    )}
                  </div>
                  <span className="text-white text-[10px] font-bold mt-0.5">你{micMuted ? ' 🔇' : ''}</span>
                </div>
                {Object.entries(remoteVideos).map(entry => {
                  const uid = entry[0]; const stream = entry[1];
                  const pl = playersList.find(p => p.id === uid);
                  const nm = pl ? pl.name : '對手';
                  return (
                    <div key={uid} className="flex flex-col items-center shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-[3px] border-white shadow relative bg-slate-600">
                        <video ref={el => { if (el) { el.srcObject = stream; try { el.muted = !speakerOnRef.current; } catch (e) {} } }} autoPlay playsInline muted className="remote-video-el w-full h-full object-cover" />
                      </div>
                      <span className="text-white text-[10px] font-bold mt-0.5 max-w-[64px] truncate">{nm}{remoteMic[uid] === false ? ' 🎤' : ''}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {isMultiplayer && ( <span className="bg-emerald-400 text-slate-900 px-2 py-1 rounded-md border-2 border-slate-800 font-black text-xs md:text-sm shadow-[2px_2px_0px_rgba(30,41,59,1)] flex items-center gap-1 whitespace-nowrap">{isHostRef.current ? '👑 主機' : '👤 玩家'} | 代碼: {roomId}</span> )}
                  </div>
                  <button onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)} className="flex px-2 md:px-3 py-1 bg-[#2d2a26] text-white border-2 border-[#2d2a26] rounded-md font-bold text-xs md:text-sm shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:bg-slate-800 items-center gap-1 whitespace-nowrap">{isHeaderCollapsed ? '🔽 展開規則' : '🔼 縮小面板'}</button>
               </div>

               <div className={`w-full overflow-hidden transition-all duration-500 ease-in-out origin-top flex flex-col gap-2 ${isHeaderCollapsed ? 'max-h-0 opacity-0 scale-y-95' : 'max-h-[500px] opacity-100 scale-y-100'}`}>
                  <div className="bg-white border-[3px] border-[#2d2a26] rounded-xl p-3 text-[#2d2a26] shadow-[4px_4px_0px_#2d2a26] flex flex-col md:flex-row gap-3">
                     <div className="flex-1">
                        <h3 className="text-sm md:text-base font-black mb-1 border-b-[3px] border-[#4ade80] inline-block pb-0.5">📜 遊戲四大規則</h3>
                        <ol className="list-decimal list-outside ml-4 space-y-1 text-xs md:text-sm leading-relaxed font-bold">
                           <li>每個圓圈是一座「島」，數字代表需要幾座橋樑。</li>
                           <li>橋樑必須是垂直或水平方向。</li>
                           <li>橋樑之間絕對不能交叉或重疊。</li>
                           <li>兩座島之間最多架設 2 座橋，且完成時所有島嶼必須全部連通。</li>
                        </ol>
                     </div>
                     <div className="md:w-1/3 bg-[#4ade80]/20 p-2 md:p-3 rounded-xl border-[3px] border-dashed border-[#2d2a26] flex flex-col justify-center">
                        <p className="text-[#2d2a26] font-black text-xs md:text-sm mb-1 flex items-center gap-1"><span>💡</span> 提示與狀態：</p>
                        <p className="text-slate-700 text-xs md:text-sm font-bold leading-relaxed">{cLevel.description}</p>
                     </div>
                  </div>
               </div>

               <div className="flex flex-wrap gap-1.5 items-center justify-between w-full">
                  <select disabled={isDailyMode || inRace || (isMultiplayer && !isHostRef.current)} value={currentLevelId} onChange={(e) => {
                      const val = e.target.value;
                      handleLevelChange(val === 'custom' ? 'custom' : Number(val));
                  }} className="px-1 py-1 md:px-2 md:py-1.5 rounded-md border-2 border-[#2d2a26] font-bold bg-white text-[#2d2a26] text-xs md:text-sm outline-none shadow-[2px_2px_0px_#2d2a26] w-auto cursor-pointer max-w-[150px] sm:max-w-none truncate disabled:opacity-60 disabled:cursor-not-allowed">
                     {LEVELS.map(level => {
                         const isCustomActive = (level.id === 'custom' && currentLevelId === 'custom' && randomLevelData);
                         const displayName = isCustomActive
                             ? `⚙️ 自訂 (${randomLevelData.width}x${randomLevelData.height})`
                             : level.name;
                         return <option key={level.id} value={level.id}>{displayName}</option>;
                     })}
                  </select>

                  <div className="flex gap-1 md:gap-2 flex-wrap items-center ml-auto">
                     {!isWon && hasSolution && !showSolution && !inRace && ( <button onClick={handleShowSolution} className="px-2 py-1 md:px-3 md:py-1.5 bg-green-400 text-[#2d2a26] border-2 border-[#2d2a26] rounded-md font-bold text-xs md:text-sm shadow-[2px_2px_0px_#2d2a26] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1" title="解答">💡<span className="hidden sm:inline">解答</span></button> )}
                     {!isDailyMode && !inRace && ( <button onClick={handleRegenerateRandom} className="px-2 py-1 md:px-3 md:py-1.5 bg-blue-500 text-white border-2 border-[#2d2a26] rounded-md font-bold text-xs md:text-sm shadow-[2px_2px_0px_#2d2a26] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1" title="新題">🎲<span className="hidden sm:inline">新題</span></button> )}
                     {!isMultiplayer && ( <button onClick={handleUndo} disabled={history.length === 0 || isWon} className="px-2 py-1 md:px-3 md:py-1.5 bg-white border-2 border-[#2d2a26] rounded-md font-bold text-xs md:text-sm shadow-[2px_2px_0px_rgba(30,41,59,1)] disabled:opacity-50 disabled:shadow-none active:translate-y-1 active:shadow-none transition-all flex items-center gap-1 text-[#2d2a26]" title="復原">↩️<span className="hidden sm:inline">復原</span></button> )}
                     <button onClick={handleReset} className="px-2 py-1 md:px-3 md:py-1.5 bg-red-500 text-white border-2 border-[#2d2a26] rounded-md font-bold text-xs md:text-sm shadow-[2px_2px_0px_#2d2a26] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1" title="重置">🔄<span className="hidden sm:inline">重置</span></button>
                     <button onClick={() => setShowSaveModal(true)} className="px-2 py-1 md:px-3 md:py-1.5 bg-blue-500 text-white border-2 border-[#2d2a26] rounded-md font-bold text-xs md:text-sm shadow-[2px_2px_0px_#2d2a26] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1" title="存檔/讀檔">💾<span className="hidden sm:inline">存檔</span></button>
                     <button onClick={() => { const m = window.HASHI_SOUND.toggleMute(); setMuted(m); if (!m) window.HASHI_SOUND.play('click'); }} className="px-2 py-1 md:px-3 md:py-1.5 bg-white border-2 border-[#2d2a26] rounded-md font-bold text-xs md:text-sm shadow-[2px_2px_0px_#2d2a26] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1 text-[#2d2a26]" title={muted ? "取消靜音" : "靜音"}>{muted ? '🔇' : '🔊'}</button>
                     <button onClick={handleGoHome} className="bg-white text-[#2d2a26] border-2 border-[#2d2a26] px-2 py-1 md:px-3 md:py-1.5 rounded-md font-bold text-xs md:text-sm shadow-[2px_2px_0px_#2d2a26] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1" title="回首頁/斷線">{!isMultiplayer ? '🏠' : '🔌'}<span className="hidden sm:inline ml-1">{!isMultiplayer ? '回首頁' : '退出'}</span></button>
                  </div>
               </div>
            </div>

            {isMultiplayer && (
              <div className="px-4 py-2 bg-[#f6fdf6] border-b-4 border-slate-800 flex flex-wrap gap-2 items-center relative z-40 shadow-inner shrink-0">
                <span className="font-black text-slate-800 text-sm">👥 連線玩家：</span>
                {playersList.map((p, idx) => {
                  const isMe = p.id === myId;
                  const isRainbow = p.color === 'rainbow';
                  return (
                    <div key={idx} className="relative inline-flex">
                      <span
                            onClick={() => setColorPickerTarget(prev => prev === p.id ? null : p.id)}
                            title={isMe ? "點擊可切換你的代表色" : "點擊可為這位玩家更換顏色"}
                            className="px-2 py-0.5 rounded text-xs font-bold bg-white text-slate-800 flex items-center shadow-[1px_1px_0px_rgba(30,41,59,1)] cursor-pointer hover:bg-slate-100 transition-colors relative border-2 border-slate-800"
                            style={{ borderLeftWidth: '6px', borderLeftColor: isRainbow ? 'transparent' : p.color }}>
                        {isRainbow && (
                            <svg className="absolute top-[-2px] left-[-6px] w-[6px] pointer-events-none" style={{ height: 'calc(100% + 4px)', borderRadius: '2px 0 0 2px' }}>
                                <rect width="100%" height="100%" fill="url(#rainbowGrad)" />
                            </svg>
                        )}
                        {p.name} {p.isHost && '👑'} {isMe && '(你)'}
                      </span>

                      {colorPickerTarget === p.id && (
                        <div className="absolute top-full mt-2 left-0 sm:left-0 bg-[#f6fdf6] border-[3px] border-slate-800 rounded-xl p-3 shadow-[4px_4px_0px_rgba(30,41,59,1)] z-[100] w-[180px] animate-fadeIn">
                          <div className="flex justify-between items-center mb-2 border-b-2 border-slate-800 pb-1">
                            <h3 className="text-xs font-black text-slate-800">🎨 選色</h3>
                            <button onClick={(e) => { e.stopPropagation(); setColorPickerTarget(null); setColorSeq([]); }} className="text-slate-400 hover:text-slate-800 font-black leading-none">✕</button>
                          </div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {COLORS.map(color => (
                              <button
                                key={color}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const colorIdx = COLORS.indexOf(color);
                                  let newSeq = [...colorSeq, colorIdx];
                                  const targetSeq = [0, 4, 15, 19];

                                  let isValid = true;
                                  for (let i = 0; i < newSeq.length; i++) {
                                      if (newSeq[i] !== targetSeq[i]) { isValid = false; break; }
                                  }

                                  if (isValid) {
                                      setColorSeq(newSeq);
                                      if (newSeq.length === 4) {
                                          handlePlayerColorChange(p.id, 'rainbow');
                                          setColorPickerTarget(null);
                                          showToast("🌈 解鎖隱藏彩色漸變！");
                                          setColorSeq([]);
                                      } else {
                                          handlePlayerColorChange(p.id, color);
                                      }
                                  } else {
                                      setColorSeq([]);
                                      handlePlayerColorChange(p.id, color);
                                      setColorPickerTarget(null);
                                  }
                                }}
                                className="w-6 h-6 rounded-full border-[2px] border-slate-800 shadow-[1px_1px_0px_rgba(30,41,59,1)] hover:scale-110 hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all active:scale-95 active:shadow-none"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {engineRef.current === 'peerjs' && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <button
                      onClick={() => { setChatOpen(prev => { if (!prev) setChatMin(false); return !prev; }); }}
                      className="relative flex items-center gap-1 text-xs md:text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border-2 border-slate-300 shadow-[1px_1px_0px_rgba(30,41,59,1)] hover:bg-slate-200 transition-colors"
                      title="聊天室"
                    >
                      💬 聊天
                      {unreadChat > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                          {unreadChat > 99 ? '99+' : unreadChat}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={toggleVideo}
                      className={"flex items-center gap-1 text-xs md:text-sm font-bold px-2 py-1 rounded-md border-2 shadow-[1px_1px_0px_rgba(30,41,59,1)] transition-colors " + (videoOn ? "text-white bg-slate-800 border-slate-800" : "text-slate-700 bg-slate-100 border-slate-300 hover:bg-slate-200")}
                      title={videoOn ? '關閉視訊' : '開啟視訊（圓形頭像）'}
                    >
                      {videoOn ? '📹' : '🎥'} 視訊
                    </button>
                    {videoOn && (
                      <button
                        onClick={toggleMic}
                        className="flex items-center text-xs md:text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border-2 border-slate-300 shadow-[1px_1px_0px_rgba(30,41,59,1)] hover:bg-slate-200 transition-colors"
                        title={micMuted ? '取消靜音' : '靜音'}
                      >
                        {micMuted ? '🔇' : '🎤'}
                      </button>
                    )}
                    {(videoOn || Object.keys(remoteVideos).length > 0) && (
                      <button
                        onClick={() => setSpeakerOn(prev => !prev)}
                        className={"flex items-center gap-1 text-xs md:text-sm font-bold px-2 py-1 rounded-md border-2 shadow-[1px_1px_0px_rgba(30,41,59,1)] transition-colors " + (speakerOn ? "text-white bg-slate-800 border-slate-800" : "text-slate-700 bg-slate-100 border-slate-300 hover:bg-slate-200")}
                        title={speakerOn ? '喇叭開啟中（點按關閉）' : '喇叭關閉中（點按開啟，才聽得到對方）'}
                      >
                        {speakerOn ? '🔊' : '🔈'} 喇叭
                      </button>
                    )}
                    <label title={mpMode === 'race' ? '競速模式停用顯示游標（防作弊）' : ''} className={"flex items-center gap-1.5 text-xs md:text-sm font-bold px-2 py-1 rounded-md border-2 shadow-[1px_1px_0px_rgba(30,41,59,1)] transition-colors " + (mpMode === 'race' ? "text-slate-400 bg-slate-200 border-slate-300 cursor-not-allowed opacity-70" : "cursor-pointer text-slate-700 hover:text-slate-900 bg-slate-100 border-slate-300 hover:bg-slate-200")}>
                      <input
                        type="checkbox"
                        checked={showOtherCursors}
                        disabled={mpMode === 'race'}
                        onChange={(e) => setShowOtherCursors(e.target.checked)}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 accent-emerald-500"
                      />
                      顯示游標{mpMode === 'race' ? ' 🔒' : ''}
                    </label>
                  </div>
                )}
              </div>
            )}

            {inRace && raceState !== 'lobby' && (
              <div className="px-4 py-2 bg-[#f6fdf6] border-b-4 border-slate-800 shrink-0 relative z-40">
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-black text-slate-500">🏁 競速進度</p>
                  {Object.keys(raceProgress).map(uid => {
                    const info = raceProgress[uid];
                    const pct = Math.round(info.progress * 100);
                    return (
                      <div key={uid} className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 w-24 truncate">{info.name}{uid === myId ? '(你)' : ''}</span>
                        <div className="flex-1 h-4 bg-slate-200 border-2 border-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: pct + '%' }} />
                        </div>
                        <span className="text-xs font-black text-slate-800 w-12 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!isHeaderCollapsed && (
              <div className="h-8 shrink-0 flex items-center justify-center bg-slate-800 text-white border-b-4 border-slate-800 relative z-30 font-bold tracking-wide">
                <span className="text-xs md:text-sm hidden md:inline">點擊或從島嶼拖曳架橋：一下1座、兩下2座、三下取消；滾輪縮放。</span>
                <span className="text-xs md:text-sm md:hidden">點擊或拖曳島嶼架橋：一下1座、兩下2座、三下取消。</span>
              </div>
            )}

            <div className="relative z-0 flex-1 flex flex-col min-h-0 bg-[#f3fbf3]">

              {isGenerating && (
                <div className="absolute inset-0 z-[40] flex items-center justify-center pointer-events-none">
                  <div className="text-slate-800/30 font-black text-3xl md:text-5xl tracking-widest flex items-center select-none animate-pulse">
                    地圖產生中<span className="animate-loading-dots inline-block w-[1.5em] text-left"></span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col gap-2 md:gap-3 z-[5] pointer-events-auto items-end">
                <div className="flex items-center">
                   {interactionMode === 2 && (
                       <div className="flex items-center gap-2 animate-fadeIn bg-white/80 p-1.5 rounded-full border-2 border-slate-300 backdrop-blur-sm mr-2 shadow-[2px_2px_0px_rgba(30,41,59,1)]">
                           <button
                               onClick={() => setDrawSubMode('pen')}
                               className={`w-9 h-9 md:w-10 md:h-10 border-2 border-slate-800 rounded-full font-black text-lg flex items-center justify-center shadow-sm transition-[transform,color] relative overflow-hidden ${drawSubMode === 'pen' ? 'text-white scale-110 shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                               style={drawSubMode === 'pen' && myCurrentColor !== 'rainbow' ? { backgroundColor: myCurrentColor } : { backgroundColor: drawSubMode === 'pen' && myCurrentColor === 'rainbow' ? 'transparent' : undefined }}
                               title="畫筆 (可直接在畫布上任意做記號)"
                           >
                               {drawSubMode === 'pen' && myCurrentColor === 'rainbow' && (
                                   <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10">
                                       <rect width="100%" height="100%" fill="url(#rainbowGrad)" />
                                   </svg>
                               )}
                               <span className="relative z-10">🖌️</span>
                           </button>
                           <button
                               onClick={() => setDrawSubMode('eraser')}
                               onDoubleClick={clearOwnStrokes}
                               className={`w-9 h-9 md:w-10 md:h-10 border-2 border-slate-800 rounded-full font-black text-lg flex items-center justify-center shadow-sm transition-[transform,color] relative overflow-hidden ${drawSubMode === 'eraser' ? 'text-white scale-110 shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                               style={drawSubMode === 'eraser' && myCurrentColor !== 'rainbow' ? { backgroundColor: myCurrentColor } : { backgroundColor: drawSubMode === 'eraser' && myCurrentColor === 'rainbow' ? 'transparent' : undefined }}
                               title="橡皮擦 (連點兩下清空自己的所有塗鴉)"
                           >
                               {drawSubMode === 'eraser' && myCurrentColor === 'rainbow' && (
                                   <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10">
                                       <rect width="100%" height="100%" fill="url(#rainbowGrad)" />
                                   </svg>
                               )}
                               <span className="relative z-10">🧽</span>
                           </button>
                           {isHostRef.current && (
                               <button
                                   onClick={clearAllStrokes}
                                   className={`w-9 h-9 md:w-10 md:h-10 bg-red-500 hover:bg-red-600 text-white border-2 border-slate-800 rounded-full font-black text-lg transition-all flex items-center justify-center shadow-sm ml-1`}
                                   title="房主特權：一鍵清空所有人的塗鴉"
                               >🚨</button>
                           )}
                       </div>
                   )}
                   <button onClick={toggleInteractionMode} title={`切換模式 (目前: ${modeTitles[interactionMode]})`} className={`w-10 h-10 md:w-12 md:h-12 border-2 border-slate-800 rounded-full font-black text-xl md:text-2xl shadow-[3px_3px_0px_rgba(30,41,59,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center ${interactionMode > 0 ? 'bg-[#4ade80] text-slate-800' : 'bg-white text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}>
                     {modeIcons[interactionMode]}
                   </button>
                </div>
                <button onClick={handleZoomIn} title="放大" className="w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-slate-800 rounded-full font-black text-xl md:text-2xl shadow-[3px_3px_0px_rgba(30,41,59,1)] hover:bg-slate-100 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center text-slate-800">＋</button>
                <button onClick={handleZoomOut} title="縮小" className="w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-slate-800 rounded-full font-black text-2xl md:text-3xl shadow-[3px_3px_0px_rgba(30,41,59,1)] hover:bg-slate-100 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center text-slate-800">－</button>
                <button onClick={handleCycleZoom} title="循環切換縮放模式" className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 border-2 border-slate-800 rounded-full font-black text-xs md:text-sm shadow-[3px_3px_0px_rgba(0,0,0,0.3)] hover:bg-slate-700 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center text-white">
                  {zoomModeIdx === 0 ? '1x' : zoomModeIdx === 1 ? '↔️' : zoomModeIdx === 2 ? '↕️' : '🔲'}
                </button>
              </div>

              <div ref={zoomContainerRef} className="p-2 md:p-6 flex-1 overflow-auto custom-scrollbar relative z-0">
                <div key={boardFadeKey} className="flex justify-center items-center min-w-max min-h-max m-auto pb-24 pr-20 animate-boardFade">
                  <svg
                    ref={svgRef}
                    onPointerMove={handlePointerMove}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={(e) => { if(eraserRef.current) eraserRef.current.style.display = 'none'; }}
                    onPointerCancel={handlePointerUp}
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    className="bg-transparent transition-transform duration-100 ease-out origin-center select-none"
                    style={{
                        width: `${svgW * zoomLevel}px`,
                        height: `${svgH * zoomLevel}px`,
                        // 全模式 touch-action:none：iOS 對 SVG 內層 <g> 的 touch-action 支援不可靠，
                        // 曾導致拖曳手勢被瀏覽器捲動劫持（pointercancel）而永遠觸發不了；
                        // 改由 svg 統一吃掉手勢，空白處捲動改走手動 pan（見 panRef）
                        touchAction: 'none',
                        WebkitTouchCallout: 'none' // iOS 長按不跳系統選單（拖曳需要長按）
                    }}>
                    <defs>
                      <pattern id="grid" width={SCALE} height={SCALE} patternUnits="userSpaceOnUse">
                        <path d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`} fill="none" stroke="#d97706" strokeOpacity="0.28" strokeWidth="1"/>
                      </pattern>
                      <pattern id="warningStripe" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                          <line x1="0" y1="0" x2="0" y2="16" stroke="#facc15" strokeWidth="8" strokeOpacity="0.7" />
                      </pattern>
                      <radialGradient id="islandShine">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="rainbowGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={svgW} y2={svgH}>
                          <stop offset="0%" className="rainbow-stop" />
                          <stop offset="100%" className="rainbow-stop" />
                      </linearGradient>
                    </defs>
                    <rect id="svg-bg" width="100%" height="100%" fill="url(#grid)" transform={`translate(${PADDING}, ${PADDING})`} className="pointer-events-none" />

                    {/* 解答線 */}
                    {showSolution && cLevel.solution && cLevel.solution.map((sol, idx) => {
                        const islandsMap = {}; islandsToRender.forEach(i => { islandsMap[i.id] = i; });
                        const f = islandsMap[sol.from], t = islandsMap[sol.to];
                        if (!f || !t) return null;
                        const x1 = f.x*SCALE+PADDING, y1 = f.y*SCALE+PADDING, x2 = t.x*SCALE+PADDING, y2 = t.y*SCALE+PADDING;

                        if (sol.count === 1) {
                            return <line key={`sol-${idx}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ef4444" strokeWidth="6" strokeOpacity="0.4" strokeDasharray="8,6" className="solution-line pointer-events-none" />;
                        } else if (sol.count === 2) {
                            if (sol.type === 'h') {
                                return (
                                    <g key={`sol-${idx}`} className="pointer-events-none">
                                        <line x1={x1} y1={y1-5} x2={x2} y2={y2-5} stroke="#ef4444" strokeWidth="5" strokeOpacity="0.4" strokeDasharray="8,6" className="solution-line" />
                                        <line x1={x1} y1={y1+5} x2={x2} y2={y2+5} stroke="#ef4444" strokeWidth="5" strokeOpacity="0.4" strokeDasharray="8,6" className="solution-line" />
                                    </g>
                                );
                            } else {
                                return (
                                    <g key={`sol-${idx}`} className="pointer-events-none">
                                        <line x1={x1-5} y1={y1} x2={x2-5} y2={y2} stroke="#ef4444" strokeWidth="5" strokeOpacity="0.4" strokeDasharray="8,6" className="solution-line" />
                                        <line x1={x1+5} y1={y1} x2={x2+5} y2={y2} stroke="#ef4444" strokeWidth="5" strokeOpacity="0.4" strokeDasharray="8,6" className="solution-line" />
                                    </g>
                                );
                            }
                        }
                        return null;
                    })}

                    {/* 塗鴉筆跡 */}
                    {strokes.map(s => {
                        const strokeUid = s.uid || s.id.split('-')[1];
                        const isOwnStroke = strokeUid === myId;

                        let strokeColor = s.color;
                        let strokeOpacity = 1;
                        let isRainbow = false;

                        if (isMultiplayer && strokeUid) {
                            strokeColor = getPlayerColor(strokeUid);
                            if (strokeColor === 'rainbow') isRainbow = true;
                            strokeOpacity = isOwnStroke ? 1 : 0.5;
                        }

                        return (
                            <path
                                key={s.id}
                                d={s.path}
                                fill="none"
                                stroke={isRainbow ? undefined : strokeColor}
                                strokeOpacity={strokeOpacity}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`doodle-stroke ${isRainbow ? 'rainbow-stroke' : ''}`}
                                data-stroke-id={s.id}
                                style={{ pointerEvents: (interactionMode === 2 && drawSubMode === 'eraser' && isOwnStroke) ? 'stroke' : 'none' }}
                            />
                        );
                    })}

                    {/* 直接由 JS 操控的畫筆 Ref (不觸發 React 重繪) */}
                    <path
                        ref={drawingPathRef}
                        fill="none"
                        stroke={myCurrentColor === 'rainbow' ? undefined : myCurrentColor}
                        strokeOpacity={1}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`pointer-events-none ${myCurrentColor === 'rainbow' ? 'rainbow-stroke' : ''}`}
                        style={{ display: 'none' }}
                    />

                    {/* 橋樑繪製 */}
                    {sortedBridges.map(b => {
                      const totalLines = b.count + (b.draftCount || 0);
                      const islMap = {}; islandsToRender.forEach(i => { islMap[i.id] = i; });
                      const f=islMap[b.from], t=islMap[b.to];
                      if (!f || !t) return null;
                      const x1=f.x*SCALE+PADDING, y1=f.y*SCALE+PADDING, x2=t.x*SCALE+PADDING, y2=t.y*SCALE+PADDING;

                      let lineStroke = "#1e293b";
                      let lineOpacity = 1;
                      let isRainbow = false;

                      if (isMultiplayer && totalLines > 0 && b.owner) {
                          lineStroke = getPlayerColor(b.owner);
                          if (lineStroke === 'rainbow') isRainbow = true;
                          lineOpacity = (b.owner === myId) ? 1 : 0.5;
                      }

                      const isCrossed = crossedBridgeIds.has(b.id);
                      const isIslandHovered = (hoveredIslandId === b.from || hoveredIslandId === b.to) && interactionMode < 2;

                      const bridgeGroupClass = interactionMode >= 2 || (isCrossed && totalLines === 0) ? "pointer-events-none" : "cursor-pointer group";

                      const bridgeRectClass = interactionMode >= 2 ? "fill-transparent bridge-hotzone" : `transition-colors duration-300 bridge-hotzone ${isIslandHovered ? 'fill-yellow-300/40' : 'fill-transparent group-hover:fill-yellow-300/40'}`;
                      const bridgeLineClass = `pointer-events-none ${isRainbow ? 'rainbow-stroke' : 'transition-colors duration-300'}`;

                      if (totalLines === 0) {
                          return (
                            <g key={b.id}
                               onPointerDown={(e) => handleBridgePointerDown(e, b)}
                               style={interactionMode < 2 ? { touchAction: 'none' } : undefined}
                               onPointerEnter={(e) => { if(e.pointerType==='mouse' && interactionMode < 2) setHoveredBridgeId(b.id); }}
                               onPointerLeave={(e) => { if(e.pointerType==='mouse' && interactionMode < 2) setHoveredBridgeId(null); }}
                               className={bridgeGroupClass}>

                               {b.type === 'h' ? (
                                  <rect x={Math.min(x1, x2) + ISLAND_RADIUS} y={y1 - 20} width={Math.abs(x1 - x2) - ISLAND_RADIUS * 2} height={40} className={isCrossed ? 'fill-transparent' : bridgeRectClass} />
                                ) : (
                                  <rect x={x1 - 20} y={Math.min(y1, y2) + ISLAND_RADIUS} width={40} height={Math.abs(y1 - y2) - ISLAND_RADIUS * 2} className={isCrossed ? 'fill-transparent' : bridgeRectClass} />
                                )}

                               {isCrossed && isIslandHovered && (
                                    b.type === 'h' ? (
                                        <rect x={Math.min(x1, x2) + ISLAND_RADIUS} y={y1 - 8} width={Math.abs(x1 - x2) - ISLAND_RADIUS * 2} height={16} fill="url(#warningStripe)" className="pointer-events-none animate-fadeIn" />
                                    ) : (
                                        <rect x={x1 - 8} y={Math.min(y1, y2) + ISLAND_RADIUS} width={16} height={Math.abs(y1 - y2) - ISLAND_RADIUS * 2} fill="url(#warningStripe)" className="pointer-events-none animate-fadeIn" />
                                    )
                               )}
                            </g>
                          );
                      }

                      let linesToDraw = [];
                      if (totalLines === 1) {
                          linesToDraw.push({ isDraft: b.draftCount === 1, offset: 0 });
                      } else if (totalLines === 2) {
                          if (b.count === 2) {
                              linesToDraw.push({ isDraft: false, offset: -5 });
                              linesToDraw.push({ isDraft: false, offset: 5 });
                          } else if ((b.draftCount || 0) === 2) {
                              linesToDraw.push({ isDraft: true, offset: -5 });
                              linesToDraw.push({ isDraft: true, offset: 5 });
                          } else {
                              linesToDraw.push({ isDraft: false, offset: -5 });
                              linesToDraw.push({ isDraft: true, offset: 5 });
                          }
                      }

                      return (
                        <g key={b.id}
                           onPointerDown={(e) => handleBridgePointerDown(e, b)}
                           style={interactionMode < 2 ? { touchAction: 'none' } : undefined}
                           onPointerEnter={(e) => { if(e.pointerType==='mouse' && interactionMode < 2) setHoveredBridgeId(b.id); }}
                           onPointerLeave={(e) => { if(e.pointerType==='mouse' && interactionMode < 2) setHoveredBridgeId(null); }}
                           className={bridgeGroupClass}>
                          {b.type === 'h' ? (
                            <rect x={Math.min(x1, x2) + ISLAND_RADIUS} y={y1 - 20} width={Math.abs(x1 - x2) - ISLAND_RADIUS * 2} height={40} className={bridgeRectClass} />
                          ) : (
                            <rect x={x1 - 20} y={Math.min(y1, y2) + ISLAND_RADIUS} width={40} height={Math.abs(y1 - y2) - ISLAND_RADIUS * 2} className={bridgeRectClass} />
                          )}
                          {linesToDraw.map((lineObj, lIdx) => {
                              const isDraft = lineObj.isDraft;
                              const off = lineObj.offset;
                              const w = totalLines === 1 ? (isDraft ? "5" : "6") : (isDraft ? "4" : "5");
                              const op = isDraft ? (lineOpacity * 0.4) : lineOpacity;
                              const dash = isDraft ? "8,6" : "none";
                              if (b.type === 'h') {
                                 return <line key={lIdx} x1={x1} y1={y1+off} x2={x2} y2={y2+off} stroke={isRainbow ? undefined : lineStroke} strokeWidth={w} strokeLinecap="round" strokeOpacity={op} strokeDasharray={dash} className={bridgeLineClass} style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))' }} />;
                              } else {
                                 return <line key={lIdx} x1={x1+off} y1={y1} x2={x2+off} y2={y2} stroke={isRainbow ? undefined : lineStroke} strokeWidth={w} strokeLinecap="round" strokeOpacity={op} strokeDasharray={dash} className={bridgeLineClass} style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))' }} />;
                              }
                          })}
                        </g>
                      );
                    })}

                    {/* 拖曳架橋預覽線：跟著手指的直線預覽（ref 即時更新，不走 React state） */}
                    <line
                        ref={dragPreviewLineRef}
                        x1="0" y1="0" x2="0" y2="0"
                        stroke={myCurrentColor === 'rainbow' ? '#fbbf24' : myCurrentColor}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeOpacity="0.9"
                        className="solution-line pointer-events-none"
                        style={{ display: 'none' }}
                    />
                    <circle
                        ref={dragPreviewTipRef}
                        cx="0" cy="0" r="9"
                        fill={myCurrentColor === 'rainbow' ? '#fbbf24' : myCurrentColor}
                        fillOpacity="0.9"
                        className="pointer-events-none animate-pulse"
                        style={{ display: 'none' }}
                    />

                    {islandsToRender.map(island => {
                      const cx = island.x * SCALE + PADDING; const cy = island.y * SCALE + PADDING; const current = islandCurrentCounts[island.id].total;
                      let strokeColor = "#1e293b"; let bgColor = "#ffffff"; let textColor = "#1e293b";
                      if (current === island.req) { strokeColor = "#059669"; bgColor = "#d1fae5"; textColor = "#065f46"; }
                      else if (current > island.req) { strokeColor = "#dc2626"; bgColor = "#fee2e2"; textColor = "#991b1b"; }

                      const showHighlight = highlightedIslandIds.has(island.id) && interactionMode < 2;
                      const isDirectlyHovered = hoveredIslandId === island.id && interactionMode < 2;

                      return (
                        <g key={`island-${island.id}`}
                           onPointerEnter={(e) => { if(e.pointerType==='mouse' && interactionMode < 2) setHoveredIslandId(island.id); }}
                           onPointerLeave={(e) => { if(e.pointerType==='mouse' && interactionMode < 2) setHoveredIslandId(null); }}
                           onPointerDown={(e) => handleIslandPointerDown(e, island)}
                           style={interactionMode < 2 ? { touchAction: 'none' } : undefined}
                        >
                          {showHighlight && (
                              <circle cx={cx} cy={cy} r={ISLAND_RADIUS + 8} fill="#fde047" fillOpacity="0.5" className="pointer-events-none transition-all duration-300" />
                          )}

                          <circle cx={cx + 3} cy={cy + 3} r={ISLAND_RADIUS} fill="rgba(30,41,59,0.2)" className="pointer-events-none" />
                          <circle cx={cx} cy={cy} r={ISLAND_RADIUS} fill={bgColor} stroke={strokeColor} strokeWidth="4" className="transition-colors duration-300" />
                          <circle cx={cx - 6} cy={cy - 7} r={ISLAND_RADIUS * 0.55} fill="url(#islandShine)" className="pointer-events-none" />
                          <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="central" className="text-xl font-black font-sans pointer-events-none select-none transition-colors duration-300" fill={textColor}>{island.req}</text>

                          {/* 只在被阻擋的路徑顯示紅色 X 提示，拔除原本的黃色提示點 */}
                          {isDirectlyHovered && activeHints.map(b => {
                             if (!crossedBridgeIds.has(b.id)) return null;

                             let dotCx = cx;
                             let dotCy = cy;
                             const offset = ISLAND_RADIUS + 14;
                             if (b.type === 'h') {
                                 if (b.from === island.id) dotCx += offset;
                                 else dotCx -= offset;
                             } else {
                                 if (b.from === island.id) dotCy += offset;
                                 else dotCy -= offset;
                             }

                             return (
                                 <g key={`hint-${b.id}`} className="pointer-events-none animate-pulse" transform={`translate(${dotCx}, ${dotCy})`}>
                                     <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                                     <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                                 </g>
                             );
                          })}
                        </g>
                      );
                    })}

                    {bursts.map(b => (
                      <g key={b.id} className="pointer-events-none">
                        {b.parts.map((pt, i) => (
                          <circle key={i} cx={b.x} cy={b.y} r="5" fill={b.color} className="burst-particle" style={{ '--bx': pt.dx + 'px', '--by': pt.dy + 'px' }} />
                        ))}
                      </g>
                    ))}

                    <circle
                        ref={eraserRef}
                        r="15"
                        fill={myCurrentColor === 'rainbow' ? undefined : myCurrentColor}
                        fillOpacity="0.4"
                        stroke={myCurrentColor === 'rainbow' ? undefined : myCurrentColor}
                        strokeWidth="2"
                        className={`pointer-events-none ${myCurrentColor === 'rainbow' ? 'rainbow-stroke rainbow-fill' : ''}`}
                        style={{ display: 'none' }}
                    />

                    {showOtherCursors && mpMode !== 'race' && engineRef.current === 'peerjs' && Object.entries(cursors).map(entry => {
                        const uid = entry[0]; const pos = entry[1];
                        if (uid === myId) return null;
                        const player = playersList.find(p => p.id === uid);
                        if (!player) return null;
                        const isRainbow = player.color === 'rainbow';
                        return (
                            <g key={`cursor-${uid}`} transform={`translate(${pos.x}, ${pos.y})`} className="pointer-events-none transition-transform duration-75 ease-linear">
                               <path d="M0,0 L16,6 L10,10 L15,19 L11,21 L6,12 L0,18 Z" fill={isRainbow ? undefined : player.color} stroke="white" strokeWidth="2" className={isRainbow ? 'rainbow-fill' : ''} />
                               <rect x="14" y="22" rx="4" ry="4" width={player.name.length * 14 + 12} height="22" fill="rgba(0,0,0,0.6)" />
                               <text x="20" y="37" fill="white" fontSize="13" fontWeight="bold">{player.name}</text>
                            </g>
                        );
                    })}

                    {(engineRef.current === 'peerjs' ? showOtherCursors : true) && ripples.map(r => {
                        const player = playersList.find(p => p.id === r.uid);
                        const color = player ? player.color : '#3b82f6';
                        const isRainbow = color === 'rainbow';
                        return (
                            <circle key={r.id} cx={r.x} cy={r.y} r="20" fill="none" stroke={isRainbow ? undefined : color} className={`pointer-events-none ${isRainbow ? 'rainbow-stroke' : ''}`} style={{ transformOrigin: `${r.x}px ${r.y}px`, animation: 'rippleAnim 0.8s ease-out forwards' }} />
                        );
                    })}
                  </svg>
                </div>
              </div>

              {inRace && raceState === 'lobby' && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
                  <div className="bg-white rounded-2xl p-6 border-[4px] border-[#2d2a26] shadow-[8px_8px_0px_#2d2a26] text-center min-w-[280px] max-w-sm w-full animate-popUpCenter">
                    <div className="text-5xl mb-2">🏁</div>
                    <h2 className="text-2xl font-black text-[#2d2a26] mb-4">競速大廳</h2>
                    <div className="mb-4 flex flex-col gap-2">
                      {playersList.map(p => (
                        <div key={p.id} className="flex items-center justify-center gap-2 bg-green-50 border-2 border-slate-800 rounded-xl px-4 py-2 font-black text-slate-800">
                          <span className="w-4 h-4 rounded-full border-2 border-slate-800 inline-block" style={{ backgroundColor: p.color === 'rainbow' ? '#fbbf24' : p.color }} />
                          {p.name} {p.isHost && '👑'} {p.id === myId && '(你)'}
                        </div>
                      ))}
                    </div>
                    {isHostRef.current ? (
                      <div>
                        <button onClick={startRace} disabled={playersList.length < 2} className="w-full py-3 bg-red-400 text-slate-900 border-4 border-slate-800 rounded-xl font-black text-lg shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-2">🏁 開始競速</button>
                        <p className="text-xs text-slate-500 font-bold">{playersList.length < 2 ? '等待對手加入...' : '雙方將同時挑戰同一題目，比誰先解完！'}</p>
                      </div>
                    ) : (
                      <p className="font-black text-slate-700 animate-pulse">等待房主開始競速...</p>
                    )}
                    <button onClick={handleGoHome} className="mt-4 text-slate-400 font-bold hover:text-slate-800 hover:underline">離開</button>
                  </div>
                </div>
              )}

              {raceCountdown !== null && (
                <div className="absolute inset-0 z-[65] flex items-center justify-center pointer-events-none">
                  <div key={raceCountdown} className="animate-countdownPop text-8xl md:text-9xl font-black text-[#2d2a26] bg-[#4ade80] border-4 border-slate-800 rounded-3xl px-10 py-6 shadow-[8px_8px_0px_rgba(30,41,59,1)]">
                    {raceCountdown === 0 ? 'GO!' : raceCountdown}
                  </div>
                </div>
              )}

              {inRace && raceWaiting && raceState === 'racing' && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[58] bg-slate-800 text-white px-5 py-2 rounded-full font-black border-[3px] border-white shadow-lg animate-pulse whitespace-nowrap">⏳ 等待對手完成...</div>
              )}

              {inRace && raceState === 'finished' && raceResult && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
                  <div className="bg-white rounded-2xl p-6 md:p-8 border-[4px] border-[#2d2a26] shadow-[8px_8px_0px_#2d2a26] text-center min-w-[300px] max-w-md w-full animate-popUpCenter">
                    <div className="text-5xl mb-2">🏁</div>
                    <h2 className="text-2xl font-black text-[#2d2a26] mb-4">競速結果</h2>
                    {raceResult.entries.map(e => (
                      <div key={e.uid} className={'flex items-center justify-between gap-4 px-4 py-2 mb-2 rounded-xl border-[3px] ' + (e.uid === raceResult.winnerUid ? 'bg-[#4ade80] border-slate-800' : 'bg-slate-50 border-slate-300')}>
                        <span className="font-black text-slate-800">{e.uid === raceResult.winnerUid ? '🏆 ' : ''}{e.name}{e.uid === myId ? '(你)' : ''}</span>
                        <span className="font-mono font-black text-slate-800">{formatTime(Math.floor(e.timeMs / 1000))}</span>
                      </div>
                    ))}
                    {raceResult.winnerUid === myId ? (
                      <p className="text-emerald-600 font-black text-lg my-2">🎉 你贏了！</p>
                    ) : (
                      <p className="text-slate-500 font-black text-lg my-2">對手快了一步，再接再厲！</p>
                    )}
                    <div className="flex justify-center gap-2 my-3">
                      {[0, 1, 2].map(i => (
                        <span key={i} className={i < stars ? "animate-starPop text-4xl inline-block" : "text-4xl inline-block opacity-20 grayscale"} style={i < stars ? { animationDelay: (i * 0.3) + 's' } : {}}>⭐</span>
                      ))}
                    </div>
                    <div className="flex justify-center gap-3 mt-4">
                      {isHostRef.current ? (
                        <button onClick={rematchRace} className="px-5 py-3 bg-red-400 text-slate-900 border-4 border-slate-800 font-black rounded-xl shadow-[4px_4px_0px_#2d2a26] hover:translate-y-[2px] transition-all">🏁 再來一局</button>
                      ) : (
                        <p className="font-bold text-slate-500 self-center">等待房主開始下一局...</p>
                      )}
                      <button onClick={handleGoHome} className="px-5 py-3 bg-white text-slate-800 border-4 border-slate-800 font-black rounded-xl shadow-[4px_4px_0px_#2d2a26] hover:translate-y-[2px] transition-all">離開</button>
                    </div>
                  </div>
                </div>
              )}

              {confetti.length > 0 && !hideVictoryModal && (
                <div className="absolute inset-0 z-[55] pointer-events-none overflow-hidden">
                  {confetti.map(c => (
                    <div key={c.id} className="confetti-piece absolute -top-4" style={{ left: c.left + '%', width: c.w + 'px', height: c.h + 'px', backgroundColor: c.color, animationDuration: c.dur + 's', animationDelay: c.delay + 's' }} />
                  ))}
                </div>
              )}

              {isWon && !hideVictoryModal && !inRace && (
                <div className={`absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] pointer-events-auto ${isClosingModal ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
                  <div className={`bg-white rounded-2xl p-6 md:p-8 border-[4px] border-[#2d2a26] shadow-[8px_8px_0px_#2d2a26] text-center min-w-[280px] md:min-w-[320px] relative ${isClosingModal ? 'animate-popOutCenter' : 'animate-popUpCenter'}`}>
                    <button onClick={closeVictoryModal} className="absolute top-2 right-4 text-slate-400 hover:text-[#2d2a26] text-2xl font-black">✕</button>
                    <div className="text-5xl md:text-6xl mb-3">💥🏆</div>
                    <h2 className="text-2xl md:text-3xl font-black text-[#2d2a26] mb-2 uppercase tracking-wide">PERFECT!</h2>
                    <p className="text-slate-600 mb-1 text-sm md:text-base font-bold">所有的島嶼都成功連結了！</p>
                    <p className="text-blue-600 mb-1 text-sm md:text-base font-bold">完成時間：{endTime ? formatTime(Math.floor((endTime - startTime) / 1000)) : "00:00"}</p>
                    <div className="flex justify-center gap-2 my-3">
                      {[0, 1, 2].map(i => (
                        <span key={i} className={i < stars ? "animate-starPop text-4xl md:text-5xl inline-block" : "text-4xl md:text-5xl inline-block opacity-20 grayscale"} style={i < stars ? { animationDelay: (i * 0.3) + 's' } : {}}>⭐</span>
                      ))}
                    </div>
                    {isNewBest && <p className="text-amber-600 font-black mb-2 animate-pulse">🎉 新紀錄！</p>}
                    {isDailyMode ? (
                      <p className="text-emerald-600 mb-6 text-sm md:text-base font-black border-b-[3px] border-dashed border-slate-300 pb-4">✅ 今日挑戰完成！明天再來</p>
                    ) : (
                      <div className="border-b-[3px] border-dashed border-slate-300 mb-6"></div>
                    )}
                    <div className="flex justify-center gap-3">
                      {isDailyMode ? (
                        <button onClick={triggerDailyHome} className="px-5 py-3 bg-[#4ade80] text-[#2d2a26] border-[4px] border-[#2d2a26] font-black rounded-xl shadow-[4px_4px_0px_#2d2a26] hover:translate-y-[2px] transition-all text-base md:text-lg">回主選單 🏠</button>
                      ) : (
                        <button onClick={triggerRegenerate} className="px-5 py-3 bg-[#4ade80] text-[#2d2a26] border-[4px] border-[#2d2a26] font-black rounded-xl shadow-[4px_4px_0px_#2d2a26] hover:translate-y-[2px] transition-all text-base md:text-lg">再來一局 ➔</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isWon && hideVictoryModal && (
                <div className="absolute bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
                  <button onClick={() => setHideVictoryModal(false)} className="pointer-events-auto bg-[#4ade80] text-[#2d2a26] border-[4px] border-[#2d2a26] px-6 py-3 rounded-full shadow-[6px_6px_0px_#2d2a26] hover:translate-y-[2px] transition-all font-black flex items-center gap-2 tracking-wide text-lg">🏆 顯示成績</button>
                </div>
              )}
            </div>
          </div>

          {/* 存檔彈窗 */}
          {showSaveModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
              <div className="bg-[#f6fdf6] border-[4px] border-[#2d2a26] rounded-2xl p-6 shadow-[10px_10px_0px_rgba(30,41,59,1)] w-full max-w-md animate-popUp">
                <h2 className="text-2xl font-black text-slate-800 mb-2 border-b-4 border-blue-500 inline-block pb-1">💾 存檔與讀檔</h2>
                <p className="text-sm font-bold text-slate-600 mb-4">將進度轉換為代碼，下次貼上代碼即可恢復！</p>
                <div className="mb-6">
                  <button onClick={handleSaveCode} className="w-full py-3 bg-blue-500 text-white border-4 border-slate-800 rounded-xl font-black shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all mb-3 text-base md:text-lg">產生進度代碼 (自動複製)</button>
                  <div className="relative">
                    <textarea id="saveCodeTextarea" value={saveCode} onChange={(e) => setSaveCode(e.target.value)} placeholder="點擊上方按鈕生成，或是手動貼上舊代碼至此處" rows="4" className="w-full border-4 border-slate-800 rounded-xl p-3 pb-12 font-mono text-sm shadow-inner outline-none focus:bg-blue-50 break-all bg-white" />
                    <button onClick={handleQuickPaste} className="absolute bottom-3 right-3 bg-[#4ade80] text-slate-900 px-3 py-1.5 rounded-lg text-sm font-black border-2 border-slate-800 hover:bg-[#e6b800] shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all active:translate-y-1 active:shadow-none">📋 快速貼上</button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowSaveModal(false)} className="flex-1 py-3 bg-white border-4 border-slate-800 rounded-xl font-black text-slate-800 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all">關閉</button>
                  <button onClick={handleLoadCode} className="flex-1 py-3 bg-emerald-400 text-slate-900 border-4 border-slate-800 rounded-xl font-black shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-all">載入代碼</button>
                </div>
              </div>
            </div>
          )}

          {/* 自訂地圖彈窗 */}
          {showCustomModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
              <div className="bg-[#f6fdf6] border-[4px] border-[#2d2a26] rounded-2xl p-6 shadow-[10px_10px_0px_rgba(30,41,59,1)] w-full max-w-sm animate-popUpCenter">
                <div className="flex justify-between items-center mb-4 border-b-4 border-slate-800 pb-2">
                  <h2 className="text-xl font-black text-slate-800">⚙️ 自訂地圖尺寸</h2>
                  <button onClick={() => {
                      setShowCustomModal(false);
                      setCurrentLevelId(stateRef.current.levelId);
                  }} className="text-slate-400 hover:text-slate-800 text-2xl font-black">✕</button>
                </div>
                <p className="text-xs font-bold text-slate-500 mb-4">輸入專屬長寬（5 ~ 100），生成超大型合作地圖：</p>
                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">寬度 (橫向島嶼數):</label>
                    <input type="number" min="5" max="100" value={tempWidth} onChange={(e) => setTempWidth(parseInt(e.target.value) || 5)} className="w-full border-2 border-slate-800 rounded-md p-2 font-bold focus:ring-2 ring-[#4ade80] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">長度 (直向島嶼數):</label>
                    <input type="number" min="5" max="100" value={tempHeight} onChange={(e) => setTempHeight(parseInt(e.target.value) || 5)} className="w-full border-2 border-slate-800 rounded-md p-2 font-bold focus:ring-2 ring-[#4ade80] outline-none" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => {
                      setShowCustomModal(false);
                      setCurrentLevelId(stateRef.current.levelId);
                  }} className="flex-1 py-2 bg-slate-200 border-2 border-slate-800 rounded-xl font-black text-slate-800 shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:bg-slate-300 active:translate-y-1 active:shadow-none transition-all">取消</button>
                  <button onClick={handleCustomGenerate} className="flex-1 py-2 bg-[#4ade80] border-2 border-slate-800 rounded-xl font-black text-slate-900 shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:bg-[#e6b800] active:translate-y-1 active:shadow-none transition-all">產生</button>
                </div>
              </div>
            </div>
          )}

          {toastMsg && <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full font-bold shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-[100] border-[3px] border-white animate-slideUpFade">{toastMsg}</div>}
          {speakPrompt && !speakerOn && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[96] bg-slate-800 text-white pl-4 pr-2 py-2 rounded-full font-bold shadow-[0_4px_10px_rgba(0,0,0,0.35)] border-[3px] border-white flex items-center gap-2 whitespace-nowrap max-w-[calc(100%-16px)]">
              <span className="truncate">🔊 {speakPrompt.name} 發言中，開啟音效？</span>
              <button onClick={() => setSpeakerOn(true)} className="bg-[#4ade80] text-slate-900 px-3 py-1 rounded-full font-black border-2 border-slate-900 shrink-0">開啟</button>
              <button onClick={() => setSpeakPrompt(null)} className="bg-white/20 text-white px-2 py-1 rounded-full font-black shrink-0">✕</button>
            </div>
          )}

          {chatOpen && engineRef.current === 'peerjs' && (
            <div className="absolute inset-0 z-[95] flex items-end justify-center pointer-events-none p-3">
              <div className="pointer-events-auto w-full max-w-md bg-[#f6fdf6]/90 backdrop-blur-[2px] border-4 border-slate-800 rounded-2xl shadow-[4px_4px_0px_rgba(30,41,59,0.6)] flex flex-col overflow-hidden" style={chatMin ? {} : { height: '40vh', maxHeight: '380px' }}>
                <div onClick={() => setChatMin(prev => !prev)} className="flex items-center justify-between px-3 py-2 bg-[#4ade80] border-b-[3px] border-slate-800 shrink-0 cursor-pointer select-none">
                  <span className="font-black text-slate-900">💬 聊天室 {unreadChat > 0 && <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black inline-flex items-center justify-center border-2 border-white align-middle">{unreadChat > 99 ? '99+' : unreadChat}</span>}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800">{chatMin ? '🔼' : '🔽'}</span>
                    <button onClick={(e) => { e.stopPropagation(); setChatOpen(false); }} className="w-7 h-7 rounded-full bg-white border-2 border-slate-800 font-black text-slate-800 text-sm leading-none">✕</button>
                  </div>
                </div>
                {!chatMin && (
                <React.Fragment>
                <div ref={chatListRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                  {chatMsgs.length === 0 && <p className="text-center text-slate-400 text-xs font-bold py-8">還沒有訊息，打個招呼吧！👋</p>}
                  {chatMsgs.map(m => (
                    <div key={m.id} className={"flex " + (m.mine ? "justify-end" : "justify-start")}>
                      <div className={"max-w-[82%] px-2.5 py-1.5 rounded-xl border-2 border-slate-800 " + (m.mine ? "bg-[#4ade80]" : "bg-white")}>
                        {!m.mine && <div className="text-[10px] font-black leading-tight" style={{ color: m.color === 'rainbow' ? '#a855f7' : m.color }}>{m.name}</div>}
                        <div className="break-words text-sm font-bold text-slate-900 leading-snug">{m.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 p-2 border-t-[3px] border-slate-800 shrink-0 bg-white">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }}
                    placeholder="輸入訊息…"
                    maxLength={200}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-slate-800 text-sm font-bold outline-none focus:border-emerald-500"
                  />
                  <button onClick={sendChat} className="px-4 py-2 bg-[#4ade80] border-2 border-slate-800 rounded-xl font-black text-slate-900 shadow-[2px_2px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none shrink-0">送出</button>
                </div>
                </React.Fragment>
                )}
              </div>
            </div>
          )}

          {tutorialOverlay}
        </div>
      );
    }
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<HashiGame />);
  