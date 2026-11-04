// 全套回歸的單一清單（稽核 H-03：「測試全綠」從此只有這個定義）
// 用法：node run-all.js [子字串過濾]  —— 逐支「依序」執行（不可平行：jsdom 雙頁測試平行跑會 CPU 爭用假失敗）
// 退出碼：全綠 0、任一支失敗 1。每支的完整輸出留在 boottest/run-all-logs/<name>.log
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 正式回歸清單（發版前必跑）。不在清單的：test-hashi-strip（已退休）、test-v1xx/test-xver（特定版本探針）、
// test-lastone2dbg（除錯版）、repro-*（一次性重現腳本；僅 staleprog/rematch 兩支列入常規）
const SUITES = [
  ['test-hub.js', {}],
  ['test-roomui.js', {}],
  ['test-site.js', {}],
  ['test-wheel.js', {}],
  ['test-color.js', { GAME: 'hashi' }],
  ['test-color.js', { GAME: 'sudoku' }],
  ['test-color.js', { GAME: 'mines' }],
  ['test-autogod.js', {}],
  ['test-brawl-start.js', {}],
  ['test-startgate.js', {}],
  ['test-jointab.js', {}],
  ['test-leave.js', {}],
  ['test-leaveflow.js', {}],
  ['test-migrate-room.js', {}],
  ['test-results.js', {}],
  ['test-turnopts.js', {}],
  ['test-daily-cal.js', {}],
  ['test-guestfirst.js', {}],
  ['test-hashifirst.js', {}],
  ['repro-staleprog.js', {}],
  ['repro-sudoku-rematch.js', {}],
  ['test-hashi-items.js', {}],
  ['test-sudoku-items.js', {}],
  ['test-prob-weights.js', {}],
  ['test-lastone.js', {}],
  ['test-lastone2.js', {}],
  ['test-islandgift.js', {}],
  ['test-islandgift-strict.js', {}],
  ['test-inputfix.js', {}],
  ['test-mines-solo.js', {}],
  ['test-mines-mp.js', {}],
  ['test-mines-tourn.js', {}],
  ['test-mines-items.js', {}],
  ['test-mines-takeover.js', {}],
  ['test-mines-zoomcustom.js', {}],
  ['test-resume.js', {}],
];

const filter = process.argv[2] || '';
const logDir = path.join(__dirname, 'run-all-logs');
fs.mkdirSync(logDir, { recursive: true });
let pass = 0, fail = 0; const failed = [];
for (const [file, env] of SUITES) {
  const tag = file.replace('.js', '') + (env.GAME ? ':' + env.GAME : '');
  if (filter && !tag.includes(filter)) continue;
  const t0 = Date.now();
  const r = spawnSync('node', [path.join(__dirname, file)], { env: Object.assign({}, process.env, env), encoding: 'utf8', timeout: 12 * 60 * 1000 });
  const out = (r.stdout || '') + (r.stderr || '');
  fs.writeFileSync(path.join(logDir, tag.replace(':', '_') + '.log'), out);
  const m = out.match(/(\d+) passed, (\d+) failed|RESULT: (\d+) pass, (\d+) fail|(\d+) passed/g);
  const bad = r.status !== 0 || /[1-9]\d* failed/.test(out) || /RESULT: \d+ pass, [1-9]/.test(out);
  const secs = Math.round((Date.now() - t0) / 1000);
  if (bad) { fail++; failed.push(tag); console.log('✗ ' + tag + ' (' + secs + 's) — log: run-all-logs/' + tag.replace(':', '_') + '.log'); }
  else { pass++; console.log('✓ ' + tag + ' (' + secs + 's)'); }
}
console.log('\n=== run-all: ' + pass + ' suites passed, ' + fail + ' failed' + (failed.length ? ' → ' + failed.join(', ') : '') + ' ===');
process.exit(fail ? 1 : 0);
