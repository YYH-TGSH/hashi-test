// 數獨引擎：常數、題目生成（唯一解驗證）、求解器、本地存檔
// 由 sudoku-v3.13.4.html 拆出，純邏輯無 JSX，以一般 script 先於 app.js 載入

const COLORS = ['#E3002B', '#F35B00', '#FFC90E', '#D7157A', '#E895C0', '#007A61', '#87D300', '#C4D600', '#8DD1BF', '#616130', '#00538A', '#008CC1', '#00C1D5', '#79C8ED', '#CDBB79', '#41136A', '#935CB9', '#BCA8D1', '#7A0026', '#BC7B70'];
const SUDOKU_SLOT_NAMES = ['柴犬', '柯基', '虎斑貓', '橘貓', '倉鼠', '兔兔', '刺蝟', '龍貓', '水豚', '樹懶', '狐獴', '羊駝', '企鵝', '海獺', '貓頭鷹', '松鼠', '無尾熊', '台灣黑熊', '石虎', '穿山甲', '梅花鹿', '台灣藍鵲', '帝雉', '獼猴', '山羌', '綠蠵龜', '櫻花鉤吻鮭', '飛魚', '螢火蟲', '獨角仙'];
const getAvailableColor = (currentPlayers) => { const usedColors = currentPlayers.map(p => p.color); const available = COLORS.filter(c => !usedColors.includes(c)); return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : COLORS[Math.floor(Math.random() * COLORS.length)]; };

const SIZES = [
    { id: 4, name: "4x4 幼幼班", size: 4, boxW: 2, boxH: 2, chars: ['1', '2', '3', '4'] },
    { id: 9, name: "9x9 標準", size: 9, boxW: 3, boxH: 3, chars: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
    { id: 16, name: "16x16 史詩", size: 16, boxW: 4, boxH: 4, chars: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'] }
];
const DIFFICULTIES = [
    { id: 'easy', name: "🟢 簡單", targets: { 4: [9, 12], 9: [40, 45], 16: [140, 150] } },
    { id: 'medium', name: "🟡 普通", targets: { 4: [6, 7], 9: [27, 32], 16: [105, 120] } },
    // 16×16 困難原訂 70–85 格：隨機挖洞＋唯一解驗證在 30 秒內不可達（實測高原 ~104 格），每局必磨滿 30 秒；校準到 98–108（仍有 148+ 洞）
    { id: 'hard', name: "🔴 困難", targets: { 4: [3, 4], 9: [20, 22], 16: [98, 108] } }
];

const BASE_4 = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
const BASE_9 = [[0, 1, 2, 3, 4, 5, 6, 7, 8], [3, 4, 5, 6, 7, 8, 0, 1, 2], [6, 7, 8, 0, 1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6, 7, 8, 0], [4, 5, 6, 7, 8, 0, 1, 2, 3], [7, 8, 0, 1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7, 8, 0, 1], [5, 6, 7, 8, 0, 1, 2, 3, 4], [8, 0, 1, 2, 3, 4, 5, 6, 7]];
const BASE_16 = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0, 1, 2, 3], [8, 9, 10, 11, 12, 13, 14, 15, 0, 1, 2, 3, 4, 5, 6, 7], [12, 13, 14, 15, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [1, 2, 3, 0, 5, 6, 7, 4, 9, 10, 11, 8, 13, 14, 15, 12], [5, 6, 7, 4, 9, 10, 11, 8, 13, 14, 15, 12, 1, 2, 3, 0], [9, 10, 11, 8, 13, 14, 15, 12, 1, 2, 3, 0, 5, 6, 7, 4], [13, 14, 15, 12, 1, 2, 3, 0, 5, 6, 7, 4, 9, 10, 11, 8], [2, 3, 0, 1, 6, 7, 4, 5, 10, 11, 8, 9, 14, 15, 12, 13], [6, 7, 4, 5, 10, 11, 8, 9, 14, 15, 12, 13, 2, 3, 0, 1], [10, 11, 8, 9, 14, 15, 12, 13, 2, 3, 0, 1, 6, 7, 4, 5], [14, 15, 12, 13, 2, 3, 0, 1, 6, 7, 4, 5, 10, 11, 8, 9], [3, 0, 1, 2, 7, 4, 5, 6, 11, 8, 9, 10, 15, 12, 13, 14], [7, 4, 5, 6, 11, 8, 9, 10, 15, 12, 13, 14, 3, 0, 1, 2], [11, 8, 9, 10, 15, 12, 13, 14, 3, 0, 1, 2, 7, 4, 5, 6], [15, 12, 13, 14, 3, 0, 1, 2, 7, 4, 5, 6, 11, 8, 9, 10]];
const transpose = (matrix) => matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));

function getSolutionGrid(puzzleCells, sizeDef) {
    const { size, boxW, boxH, chars } = sizeDef;
    const grid = Array(size).fill(null).map(() => Array(size).fill(null));
    puzzleCells.forEach(c => { if (c.isGiven) grid[c.y][c.x] = chars.indexOf(c.value); });

    function getCandidates(y, x, g) {
        let used = Array(size).fill(false);
        for (let i = 0; i < size; i++) { if (g[y][i] !== null) used[g[y][i]] = true; if (g[i][x] !== null) used[g[i][x]] = true; }
        const by = Math.floor(y / boxH) * boxH, bx = Math.floor(x / boxW) * boxW;
        for (let dy = 0; dy < boxH; dy++) for (let dx = 0; dx < boxW; dx++) { let v = g[by + dy][bx + dx]; if (v !== null) used[v] = true; }
        let cands = []; for (let v = 0; v < size; v++) if (!used[v]) cands.push(v); return cands;
    }

    const solveGrid = grid.map(r => [...r]);
    function backtrack(g) {
        let bestY = -1, bestX = -1, minCands = size + 1, bestCands = null;
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
            if (g[y][x] === null) {
                const cands = getCandidates(y, x, g);
                if (cands.length === 0) return false;
                if (cands.length < minCands) { minCands = cands.length; bestY = y; bestX = x; bestCands = cands; if (minCands === 1) break; }
            }
        }
        if (bestY === -1) return true;
        for (let c of bestCands) { g[bestY][bestX] = c; if (backtrack(g)) return true; g[bestY][bestX] = null; }
        return false;
    }

    if (backtrack(solveGrid)) return solveGrid.map(row => row.map(v => chars[v]));
    return null;
}

// 唯一解驗證（位元遮罩版）：budget = { deadline } 時，超過期限中止並回傳 -1（未知）——
// 16×16 稀疏盤面單次驗證曾卡住主執行緒 100+ 秒（連線心跳全凍結＝雙方斷線），
// 呼叫端把 -1 當「不是唯一解」處理（補回洞口），題目正確性不受影響、只是少挖一點。
function countSolutions(grid, size, boxW, boxH, limit = 2, budget = null) {
    let count = 0;
    const fullMask = (1 << size) - 1;
    const rowMask = new Array(size).fill(0), colMask = new Array(size).fill(0), boxMask = new Array(size).fill(0);
    const boxesPerRow = size / boxW;
    const boxIdx = (y, x) => Math.floor(y / boxH) * boxesPerRow + Math.floor(x / boxW);
    const empties = [];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const v = grid[y][x];
        if (v === null || v === undefined) empties.push(y * size + x);
        else { const bit = 1 << v; rowMask[y] |= bit; colMask[x] |= bit; boxMask[boxIdx(y, x)] |= bit; }
    }
    let nodes = 0, aborted = false;
    const popcount = (m) => { let c = 0; while (m) { m &= m - 1; c++; } return c; };

    const solve = () => {
        if (budget) { if ((++nodes & 511) === 0 && Date.now() > budget.deadline) { aborted = true; return true; } }
        // MRV：挑候選最少的空格
        let bestI = -1, bestMask = 0, bestCount = size + 1;
        for (let i = 0; i < empties.length; i++) {
            const pos = empties[i]; if (pos < 0) continue;
            const y = (pos / size) | 0, x = pos % size;
            const mask = fullMask & ~(rowMask[y] | colMask[x] | boxMask[boxIdx(y, x)]);
            const c = popcount(mask);
            if (c === 0) return false;
            if (c < bestCount) { bestCount = c; bestI = i; bestMask = mask; if (c === 1) break; }
        }
        if (bestI === -1) { count++; return count >= limit; }
        const pos = empties[bestI], y = (pos / size) | 0, x = pos % size, b = boxIdx(y, x);
        empties[bestI] = -1;
        let m = bestMask;
        while (m) {
            const bit = m & -m; m &= m - 1;
            rowMask[y] |= bit; colMask[x] |= bit; boxMask[b] |= bit;
            const done = solve();
            rowMask[y] &= ~bit; colMask[x] &= ~bit; boxMask[b] &= ~bit;
            if (done) { empties[bestI] = pos; return true; }
            if (aborted) { empties[bestI] = pos; return true; }
        }
        empties[bestI] = pos;
        return false;
    };
    solve();
    return aborted ? -1 : count;
}

async function generateSudokuAsync(sizeId, diffId, onProgress) {
    const sizeDef = SIZES.find(s => s.id === sizeId);
    const diffDef = DIFFICULTIES.find(d => d.id === diffId);
    const targetRange = diffDef.targets[sizeId];
    const targetClues = Math.floor(Math.random() * (targetRange[1] - targetRange[0] + 1)) + targetRange[0];
    const targetMax = targetRange[1];
    const { size, boxW, boxH, chars } = sizeDef;

    let bestResult = null;
    let minCluesAchieved = Infinity;
    const maxAttempts = size === 16 ? 8 : 40;
    const generationStartTime = Date.now();
    let isTimedOut = false; let lastTick = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (isTimedOut) break;
        // 16×16 單次嘗試上限 8 秒：挖到高原期（怎麼挖都破壞唯一解）就換新盤重挖，別把全域 30 秒磨在一張盤上
        const attemptDeadline = Date.now() + 8000;

        let grid = (size === 4 ? BASE_4 : size === 9 ? BASE_9 : BASE_16).map(row => [...row]);
        const charPool = [...chars]; charPool.sort(() => Math.random() - 0.5);
        grid = grid.map(row => row.map(val => charPool[val]));

        for (let i = 0; i < size; i += boxH) { const block = grid.slice(i, i + boxH); block.sort(() => Math.random() - 0.5); grid.splice(i, boxH, ...block); }
        grid = transpose(grid);
        for (let i = 0; i < size; i += boxW) { const block = grid.slice(i, i + boxW); block.sort(() => Math.random() - 0.5); grid.splice(i, boxW, ...block); }
        grid = transpose(grid);
        const bands = []; for (let i = 0; i < size; i += boxH) bands.push(grid.slice(i, i + boxH)); bands.sort(() => Math.random() - 0.5); grid = bands.flat();
        grid = transpose(grid);
        const stacks = []; for (let i = 0; i < size; i += boxW) stacks.push(grid.slice(i, i + boxW)); stacks.sort(() => Math.random() - 0.5); grid = transpose(stacks.flat());

        let puzzle = grid.map(r => [...r]);
        const positions = [];
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) positions.push({ x, y });
        positions.sort(() => Math.random() - 0.5);

        let currentClues = size * size; let failCount = 0; const maxCheckHoles = positions.length;
        const testGrid = puzzle.map(r => [...r]);

        for (let i = 0; i < maxCheckHoles; i++) {
            const now = Date.now();
            if (size === 16 && now > attemptDeadline) break; // 本次嘗試放棄，交給下一次嘗試（bestResult 已保留最佳盤）
            const elapsedSecs = Math.floor((now - generationStartTime) / 1000);

            if (elapsedSecs >= 20) {
                const remainingSecs = 30 - elapsedSecs;
                if (remainingSecs <= 0) { isTimedOut = true; break; }
                if (now - lastTick >= 1000) { lastTick = now; if (onProgress) onProgress(`題目生成不超過 ${remainingSecs} 秒...`); await new Promise(r => setTimeout(r, 15)); }
            }
            if (currentClues <= targetClues) break;

            const p1 = positions[i]; const p2 = { x: size - 1 - p1.x, y: size - 1 - p1.y };

            if (puzzle[p1.y][p1.x] !== null) {
                const backup1 = puzzle[p1.y][p1.x]; const backup2 = puzzle[p2.y][p2.x];
                puzzle[p1.y][p1.x] = null; testGrid[p1.y][p1.x] = null;
                let removed = 1;
                if (p1.x !== p2.x || p1.y !== p2.y) { puzzle[p2.y][p2.x] = null; testGrid[p2.y][p2.x] = null; removed = 2; }
                const testNumGrid = testGrid.map(row => row.map(v => v === null ? null : chars.indexOf(v)));

                // 單次驗證預算（超時回 -1（≠1）→ 補回洞口；主執行緒不再被單次驗證長卡，連線心跳不中斷）：
                // 淺處 300ms 求快，深處（接近目標格數）放寬到 2 秒把驗證算完，避免困難 16×16 永遠挖不到底
                const holesLeft = currentClues - targetClues;
                const checkBudgetMs = size !== 16 ? 300 : (holesLeft > 40 ? 250 : (holesLeft > 15 ? 600 : 1200));
                if (countSolutions(testNumGrid, size, boxW, boxH, 2, { deadline: Date.now() + checkBudgetMs }) !== 1) {
                    puzzle[p1.y][p1.x] = backup1; testGrid[p1.y][p1.x] = backup1;
                    if (removed === 2) { puzzle[p2.y][p2.x] = backup2; testGrid[p2.y][p2.x] = backup2; }
                    failCount++;
                } else {
                    currentClues -= removed; failCount = 0;
                    if (currentClues < minCluesAchieved) { minCluesAchieved = currentClues; bestResult = puzzle.map(r => [...r]); if (elapsedSecs < 20 && onProgress) { onProgress(`挑戰極限難度... (目標: ${targetClues}格, 目前最佳: ${minCluesAchieved}格)`); } }
                }
                if (currentClues <= targetMax && failCount > 25) break;
            }
            if (size === 16 || i % 15 === 0) await new Promise(r => setTimeout(r, 0));
        }
        if (currentClues <= targetMax || isTimedOut) break;
    }

    if (!bestResult) bestResult = grid;

    const cells = [];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const isGiven = bestResult[y][x] !== null;
            cells.push({
                id: `${x}-${y}`, x: x, y: y, boxId: Math.floor(x / boxW) + Math.floor(y / boxH) * (size / boxW),
                value: isGiven ? bestResult[y][x] : null, isGiven: isGiven, drafts: [], owner: null, isSystemRevealed: false
            });
        }
    }
    return { sizeDef, diffDef, cells };
}

// ===== 每日一題：日期種子生成（全員同題、跨裝置一致） =====
function mulberry32(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashDateStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
async function generateDailySudoku(dateStr, onProgress) {
    const origRandom = Math.random;
    Math.random = mulberry32(hashDateStr('sudoku-daily-' + dateStr));
    try { return await generateSudokuAsync(9, 'medium', onProgress); }
    finally { Math.random = origRandom; }
}

function formatTime(secs) { return String(Math.floor(secs / 60)).padStart(2, '0') + ":" + String(secs % 60).padStart(2, '0'); }

// 本地進度恢復系統核心函數 (v3.8.0)
const saveLocalProgress = (rid, uid, name, isHost, data, sessionId, extra) => {
    if (!rid || !uid) return;
    try {
        const payload = { d: data, t: Date.now(), sid: sessionId };
        if (extra) Object.assign(payload, extra); // 存入 solutionGrid, playersList 等
        localStorage.setItem(`sudoku_prog_${rid}_${uid}`, JSON.stringify(payload));
        localStorage.setItem('sudoku_last_session', JSON.stringify({ rid, uid, time: Date.now(), name, isHost, sid: sessionId }));
    } catch (e) { /* 儲存空間被瀏覽器封鎖時（如預覽環境）靜默略過，不可讓遊戲崩潰 */ }
};
const loadLocalProgress = (rid, uid) => { try { const s = localStorage.getItem(`sudoku_prog_${rid}_${uid}`); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
