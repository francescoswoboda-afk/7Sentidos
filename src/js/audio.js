/* Sound, synthesized from scratch with the Web Audio API. No samples.
   Off by default; the speaker button in the nav turns it on. */
const Sound = (() => {
  let ctx, master, on = false, windNode, songTimer;

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  }
  function noiseBuffer(sec = 2, brown = false) {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    return b;
  }
  // soft wind: brown noise, low-passed, with a slow swell
  function startWind() {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(4, true); src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    const g = ctx.createGain(); g.gain.value = .16;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .07; lg.gain.value = .09;
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(lp); lp.connect(g); g.connect(master); src.start(); lfo.start();
    windNode = { src, lfo };
  }
  // one chirp: a sine sweeping fast, like a small bird
  function chirp(t0 = ctx.currentTime, base = rnd(2200, 3400), notes = 3) {
    for (let i = 0; i < notes; i++) {
      const t = t0 + i * rnd(.07, .12);
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(base * rnd(.9, 1.1), t);
      o.frequency.exponentialRampToValueAtTime(base * rnd(1.25, 1.6), t + .045);
      o.frequency.exponentialRampToValueAtTime(base * rnd(.8, .95), t + .08);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .09);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + .1);
    }
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
  function songLoop() {
    if (!on) return;
    chirp(ctx.currentTime, rnd(2000, 3600), Math.floor(rnd(2, 5)));
    songTimer = setTimeout(songLoop, rnd(3500, 9000));
  }
  // a soft pluck (Karplus-Strong flavoured: a short noise burst through a tuned comb)
  function pluck(freq = 523) {
    if (!on) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(.03);
    const delay = ctx.createDelay(); delay.delayTime.value = 1 / freq;
    const fb = ctx.createGain(); fb.gain.value = .93;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    const out = ctx.createGain(); out.gain.setValueAtTime(.5, t); out.gain.exponentialRampToValueAtTime(.0001, t + 1.2);
    src.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(out); out.connect(master);
    src.start(t); setTimeout(() => { try { out.disconnect(); } catch (e) {} }, 1400);
  }
  // shell crack: bright click + woody knock
  function crack(intensity = 1) {
    if (!on) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(.12);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = rnd(1800, 3200); bp.Q.value = 1.4;
    const g = ctx.createGain(); g.gain.setValueAtTime(.55 * intensity, t); g.gain.exponentialRampToValueAtTime(.0001, t + .09);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t);
    const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'triangle';
    o.frequency.setValueAtTime(rnd(180, 240), t); o.frequency.exponentialRampToValueAtTime(70, t + .12);
    og.gain.setValueAtTime(.35 * intensity, t); og.gain.exponentialRampToValueAtTime(.0001, t + .14);
    o.connect(og); og.connect(master); o.start(t); o.stop(t + .16);
  }
  function creak(p) { // rising pressure while holding a nut
    if (!on) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = 60 + p * 90;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300 + p * 500;
    g.gain.setValueAtTime(.025, t); g.gain.exponentialRampToValueAtTime(.0001, t + .07);
    o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + .08);
  }

  function set(state) {
    init(); if (!ctx) return;
    on = state;
    if (ctx.state === 'suspended') ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(on ? .9 : 0, ctx.currentTime + .6);
    if (on) { if (!windNode) startWind(); clearTimeout(songTimer); songTimer = setTimeout(songLoop, 1200); }
    else clearTimeout(songTimer);
  }
  return {
    set, get on() { return on; },
    pluck, crack, creak,
    chirp: (n = 3) => { if (on) chirp(ctx.currentTime, rnd(2400, 3400), n); },
    melody() { if (!on) return; [0, .16, .32, .52].forEach((d, i) => setTimeout(() => pluck([523, 659, 784, 1047][i]), d * 1000)); },
  };
})();
