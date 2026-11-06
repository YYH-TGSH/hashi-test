// 驗收（規格報告第八節 1+2）：引擎單元＋2,000 盤模擬複驗——直接抽取 mines app.js 的引擎純函式 eval，不複製邏輯。
const fs = require('fs');
const src = fs.readFileSync('/home/hatch/workspace/mines-site/js/app.js', 'utf8');
function extract(name) {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('missing ' + name);
  let d = 0, j = src.indexOf('{', i);
  const start = j;
  for (; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}') { d--; if (!d) return src.slice(i, j + 1); } }
  throw new Error('unbalanced ' + name);
}
const names = ['neighborsOf', 'mulberry32', 'makeLayout', 'makeFirstSafe', 'computeNums', 'revealFrom', 'computeBVWeights', 'effProgressOf'];
eval(names.map(extract).join('\n'));
let pass = 0, fail = 0;
const ok = (c, l, x) => { if (c) { pass++; console.log('✅', l); } else { fail++; console.log('❌', l, x !== undefined ? '— ' + x : ''); } };
// 單元 1：全空白盤 bv=1、權重總和=bv
{
  const L = new Array(81).fill(false), N = computeNums(9, 9, L);
  const r = computeBVWeights(9, 9, L, N);
  ok(r.bv === 1, '全空白盤 bv=1', 'bv=' + r.bv);
  const sum = r.weights.reduce((a, b) => a + b, 0);
  ok(Math.abs(sum - r.bv) < 1e-9, '全盤權重總和 = bv', sum);
}
// 單元 2：真盤——雷格權重 0、每單位權重和=1、開滿 eff=1
{
  const L = makeLayout(9, 9, 10, 12345), N = computeNums(9, 9, L);
  const r = computeBVWeights(9, 9, L, N);
  ok(L.every((v, i) => !v || r.weights[i] === 0), '雷格權重全 0');
  const sum = r.weights.reduce((a, b) => a + b, 0);
  ok(Math.abs(sum - r.bv) < 1e-9, '真盤權重總和 = bv（' + r.bv + '）', sum);
  const cells = L.map(v => v ? 'h' : 'o');
  ok(Math.abs(effProgressOf(cells, r.weights, r.bv) - 1) < 1e-9, '開滿 eff = 1');
  ok(effProgressOf(new Array(81).fill('h'), r.weights, r.bv) === 0, '未開 eff = 0');
}
// 模擬：2,000 盤，首點點中心（首點保護後）
function sim(w, h, mines, label, expLo, expHi) {
  const total = w * h, center = Math.floor(h / 2) * w + Math.floor(w / 2);
  let effSum = 0, openSum = 0, bvSum = 0;
  for (let t = 0; t < 2000; t++) {
    let L = makeLayout(w, h, mines, (t * 2654435761) >>> 0);
    const fs = makeFirstSafe(L, w, h, center, new Array(total).fill('h'));
    if (fs.moves.length) L = fs.layout;
    const N = computeNums(w, h, L);
    const r = revealFrom(w, h, L, N, new Array(total).fill('h'), center);
    const bw = computeBVWeights(w, h, L, N);
    effSum += effProgressOf(r.cells, bw.weights, bw.bv);
    openSum += r.opened / (total - mines);
    bvSum += bw.bv;
  }
  const effAvg = effSum / 2000, openAvg = openSum / 2000;
  console.log(label + ': 首點洪水 eff 平均 ' + (effAvg * 100).toFixed(1) + '%（開格 ' + (openAvg * 100).toFixed(1) + '%）、3BV 平均 ' + (bvSum / 2000).toFixed(1));
  ok(effAvg >= expLo && effAvg <= expHi, label + ' eff 平均落在規格區間（' + (expLo * 100) + '–' + (expHi * 100) + '%）', (effAvg * 100).toFixed(2) + '%');
  return { effAvg, bvAvg: bvSum / 2000 };
}
const a = sim(9, 9, 10, '9×9・10 雷', 0.055, 0.105);   // 規格 ≈7.9%、3BV 平均 12.6
ok(a.bvAvg >= 11 && a.bvAvg <= 14.5, '9×9 3BV 平均 ≈12.6', a.bvAvg.toFixed(1));
sim(16, 16, 40, '16×16・40 雷', 0.008, 0.03);          // 規格 ≈1.7%
console.log('\nRESULT sim-3bv: ' + pass + ' pass / ' + fail + ' fail');
process.exit(fail ? 1 : 0);
