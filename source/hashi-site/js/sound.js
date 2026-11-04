// === 零成本音效引擎：Web Audio API 即時合成，無任何外部音檔 ===
    // 單例，全域透過 window.HASHI_SOUND.play(type) 呼叫
    window.HASHI_SOUND = (function () {
      let ctx = null;
      let muted = false;
      try { muted = localStorage.getItem('hashi_muted') === '1'; } catch (e) {}
      function ensureCtx() {
        if (!ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return null;
          ctx = new AC();
        }
        // iOS Safari 要求在使用者手勢中 resume，否則無聲
        if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
        return ctx;
      }
      function beep(freq, dur, type, vol, delay) {
        if (muted) return;
        const c = ensureCtx();
        if (!c) return;
        try {
          const t = c.currentTime + (delay || 0);
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = type || 'square';
          o.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(vol || 0.07, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o.connect(g);
          g.connect(c.destination);
          o.start(t);
          o.stop(t + dur + 0.05);
        } catch (e) {}
      }
      function buzz(pattern) {
        try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
      }
      return {
        play: function (type) {
          if (muted) return;
          switch (type) {
            case 'bridge':  // 架橋成功：清脆嗶聲 + 輕震
              beep(600, 0.06, 'square', 0.07, 0);
              buzz(10);
              break;
            case 'remove':  // 取消橋樑：低音噗聲
              beep(300, 0.06, 'square', 0.07, 0);
              break;
            case 'error':   // 違規（橋樑交叉）：嗡嗡兩聲 + 震動
              beep(160, 0.09, 'sawtooth', 0.09, 0);
              beep(160, 0.09, 'sawtooth', 0.09, 0.13);
              buzz([30, 30, 30]);
              break;
            case 'win':     // 過關：C-E-G 上行琶音 + 勝利震動
              beep(523.25, 0.12, 'triangle', 0.10, 0);
              beep(659.25, 0.12, 'triangle', 0.10, 0.13);
              beep(783.99, 0.22, 'triangle', 0.10, 0.26);
              buzz([50, 50, 100]);
              break;
            case 'countdown': // 🏁 競速倒數嗶聲
              beep(880, 0.09, 'square', 0.08, 0);
              break;
            case 'go':      // 🏁 競速 GO！
              beep(1320, 0.25, 'square', 0.09, 0);
              break;
            case 'star':    // ⭐ 星星叮聲
              beep(1568, 0.18, 'sine', 0.09, 0);
              break;
            case 'click':   // UI 輕觸
              beep(440, 0.04, 'sine', 0.05, 0);
              break;
          }
        },
        toggleMute: function () {
          muted = !muted;
          try { localStorage.setItem('hashi_muted', muted ? '1' : '0'); } catch (e) {}
          return muted;
        }
      };
    })();
