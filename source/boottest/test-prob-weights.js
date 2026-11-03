// v1.26.0 道具機率公式驗證（使用者定案）：兩款同形、保底統一 0.1——
// 禮物權重 = (1 − p)² + 0.1（平方扶弱）；陷阱：先取 1 − p 再套禮物公式 → 權重 = p² + 0.1。
// 關鍵性質：attack(progs) 應逐項等於 grant(1 − progs)（同一個公式、輸入翻轉）。
// 驗法：從兩款出貨原始碼抽出 platProgWeights / platPickWeighted 本體 eval 後驗公式，並斷言 bundle 內含同名函式。
const fs = require('fs');
let pass = 0, fail = 0;
const check = (n, c, x) => { if (c) { pass++; console.log('✅ ' + n + (x ? ' — ' + x : '')); } else { fail++; console.log('❌ ' + n + (x ? ' — ' + x : '')); } };
const approx = (a, b, eps) => Math.abs(a - b) < (eps || 1e-9);
const arrEq = (a, b) => a.length === b.length && a.every((v, i) => approx(v, b[i]));
function extractFn(src, name) {
  const start = src.indexOf('const ' + name);
  if (start < 0) return null;
  const brace0 = src.indexOf('{', start);
  let depth = 0, i = brace0;
  for (; i < src.length; i++) { if (src[i] === '{') depth++; else if (src[i] === '}') { depth--; if (depth === 0) break; } }
  return src.slice(start, i + 1) + ';';
}
function loadFns(path) {
  const src = fs.readFileSync(path, 'utf8');
  const w = extractFn(src, 'platProgWeights');
  const p = extractFn(src, 'platPickWeighted');
  if (!w || !p) return null;
  const platProgWeights = eval(w.replace('const platProgWeights =', 'globalThis.__w ='));
  const platPickWeighted = eval(p.replace('const platPickWeighted =', 'globalThis.__p ='));
  return { platProgWeights: globalThis.__w, platPickWeighted: globalThis.__p };
}
for (const [label, path] of [['數橋', '/home/hatch/workspace/hashi-site/js/app.js'], ['數獨', '/home/hatch/workspace/sudoku-site/js/app.js']]) {
  const fns = loadFns(path);
  check(label + '：platProgWeights/platPickWeighted 存在於出貨原始碼', !!fns);
  if (!fns) continue;
  const W = fns.platProgWeights, P = fns.platPickWeighted;
  // 禮物：[0.6,0.3,0.1] → [(0.4)²+0.1, (0.7)²+0.1, (0.9)²+0.1] = [0.26, 0.59, 0.91]
  check(label + '：禮物權重 = (1−p)² + 0.1', arrEq(W([0.6, 0.3, 0.1], 'grant'), [0.26, 0.59, 0.91]));
  // 陷阱：[0.6,0.3,0.1] → [0.36+0.1, 0.09+0.1, 0.01+0.1] = [0.46, 0.19, 0.11]
  check(label + '：陷阱權重 = p² + 0.1', arrEq(W([0.6, 0.3, 0.1], 'attack'), [0.46, 0.19, 0.11]));
  // 同公式輸入翻轉：attack(ps) == grant(1 − ps)
  const ps = [0.9, 0.75, 0.6, 0.4, 0.2, 0.05];
  check(label + '：陷阱 = 禮物公式套 1−p（attack(ps) ≡ grant(1−ps)）', arrEq(W(ps, 'attack'), W(ps.map(p => 1 - p), 'grant')));
  // 全員 0 進度：禮物全 1.1 等權重；陷阱全 0.1 等權重
  check(label + '：全員 0 進度 → 禮物/陷阱皆等權重', arrEq(W([0, 0, 0], 'grant'), [1.1, 1.1, 1.1]) && arrEq(W([0, 0, 0], 'attack'), [0.1, 0.1, 0.1]));
  // 20 人：禮物隨進度遞減、陷阱隨進度遞增且各 = p² + 0.1
  const p20 = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.05);
  const g20 = W(p20, 'grant'), a20 = W(p20, 'attack');
  check(label + '：20 人禮物權重隨進度遞減', g20.every((v, i) => i === 0 || v < g20[i - 1]));
  check(label + '：20 人陷阱權重 = p²+0.1 且隨進度遞增', a20.every((v, i) => approx(v, p20[i] * p20[i] + 0.1)) && a20.every((v, i) => i === 0 || v > a20[i - 1]));
  // 抽選分布：陷阱權重 [0.46,0.19,0.11]（總和 0.76）抽 20000 次 ≈ [0.605, 0.250, 0.145]
  const ws = W([0.6, 0.3, 0.1], 'attack');
  const cnt = [0, 0, 0];
  for (let i = 0; i < 20000; i++) { const s = P(['A', 'B', 'C'], ws); cnt[s === 'A' ? 0 : s === 'B' ? 1 : 2]++; }
  const freq = cnt.map(c => c / 20000);
  const expF = [0.46 / 0.76, 0.19 / 0.76, 0.11 / 0.76];
  check(label + '：platPickWeighted 抽選分布 ≈ 陷阱權重', freq.every((fq, i) => Math.abs(fq - expF[i]) < 0.03), freq.map(x => x.toFixed(3)).join('/') + ' vs ' + expF.map(x => x.toFixed(3)).join('/'));
}
const bundle = fs.readFileSync(process.env.BUNDLE || '/home/hatch/workspace/platform/platform-v1-test.html', 'utf8');
const hits = (bundle.match(/platProgWeights/g) || []).length;
check('成品 bundle 內含 platProgWeights（兩款出貨函式）', hits >= 4, 'occurrences=' + hits);
console.log('\n=== prob-weights: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
