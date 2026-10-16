/* The nut: crack a pecan. Hold to build pressure (or tap three times).
   Shell shards fly with gravity and bounce; the kernel pops out. */
const Nut = (() => {
  const { clamp, rand } = Util;
  let cv, ctx, W = 0, H = 0, dpr = 1, inView = false, raf = null;
  let nut = null, shards = [], dust = [], kernel = null, holding = false, pressure = 0, shake = 0, count = 0, streak = 0, best = 0, lastCrack = 0, flash = 0;
  let pointer = { x: -1, y: -1 };

  function newNut() {
    const s = Math.min(W, H) * (W < 500 ? .3 : .26);
    nut = {
      x: W + s * 1.4, y: H * .5, tx: W * .5, w: s * rand(1, 1.1), h: s * rand(.46, .52), rot: rand(-.2, .2), spin: 0,
      golden: Math.random() < .08, stripes: Array.from({ length: 11 }, () => ({ y: rand(-.75, .75), w: rand(.05, .14), l: rand(.25, .75), o: rand(-.15, .15) })),
      cracks: makeCracks(), crackP: 0, enter: 0,
    };
    nut.tex = texture(nut);
  }
  function makeCracks() {
    return Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2 + rand(-.3, .3), pts = [[0, 0]]; let x = 0, y = 0;
      for (let j = 0; j < 6; j++) { x += Math.cos(a + rand(-.6, .6)) * .2; y += Math.sin(a + rand(-.6, .6)) * .2; pts.push([x, y]); }
      return pts;
    });
  }
  function shellPath(c, w, h) {
    c.beginPath();
    c.moveTo(-w, 0);
    c.bezierCurveTo(-w, -h * .75, -w * .55, -h, 0, -h);
    c.bezierCurveTo(w * .55, -h, w * .9, -h * .45, w * 1.1, 0);
    c.bezierCurveTo(w * .9, h * .45, w * .55, h, 0, h);
    c.bezierCurveTo(-w * .55, h, -w, h * .75, -w, 0);
    c.closePath();
  }
  // paint the shell once into an offscreen canvas: shards reuse it
  function texture(n) {
    const pad = 8, tw = Math.ceil(n.w * 2.3 + pad * 2), th = Math.ceil(n.h * 2.4 + pad * 2);
    const o = document.createElement('canvas'); o.width = tw * dpr; o.height = th * dpr;
    const c = o.getContext('2d'); c.scale(dpr, dpr); c.translate(tw / 2, th / 2);
    shellPath(c, n.w, n.h); c.save(); c.clip();
    const g = c.createLinearGradient(0, -n.h, 0, n.h);
    if (n.golden) { g.addColorStop(0, '#f8dc6a'); g.addColorStop(.5, '#d9a531'); g.addColorStop(1, '#a8741a'); }
    else { g.addColorStop(0, '#b8743d'); g.addColorStop(.45, '#94552a'); g.addColorStop(1, '#5e3218'); }
    c.fillStyle = g; c.fillRect(-n.w * 1.2, -n.h * 1.2, n.w * 2.4, n.h * 2.4);
    // the dark streaks pecan shells have
    // pecan shells have dark streaks running lengthwise from the tip
    n.stripes.forEach(s => {
      c.fillStyle = n.golden ? 'rgba(120,70,10,.35)' : 'rgba(28,12,4,.62)';
      const y = s.y * n.h, x1 = n.w * 1.15, x0 = x1 - s.l * n.w * 2, hw = s.w * n.h;
      c.beginPath();
      c.moveTo(x1, y * .3);
      c.bezierCurveTo(x1 - n.w * .5, y + hw, x0 + n.w * .4, y + s.o * n.h + hw * .6, x0, y + s.o * n.h);
      c.bezierCurveTo(x0 + n.w * .4, y + s.o * n.h - hw * .6, x1 - n.w * .5, y - hw, x1, y * .3);
      c.fill();
    });
    const hl = c.createRadialGradient(-n.w * .3, -n.h * .5, 2, -n.w * .3, -n.h * .5, n.w * .9);
    hl.addColorStop(0, 'rgba(255,240,210,.45)'); hl.addColorStop(1, 'rgba(255,240,210,0)');
    c.fillStyle = hl; c.fillRect(-n.w * 1.2, -n.h * 1.2, n.w * 2.4, n.h * 2.4);
    c.restore();
    c.lineWidth = 1.5; c.strokeStyle = n.golden ? '#8a5a10' : '#3e2410'; shellPath(c, n.w, n.h); c.stroke();
    return { canvas: o, w: tw, h: th };
  }

  function crack() {
    const n = nut; if (!n || n.enter < .98) return;
    // break the outline into wedge shards around a jittered centre
    const k = 13, cx = rand(-.15, .15) * n.w, cy = rand(-.15, .15) * n.h;
    const outline = [];
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2 + rand(-.12, .12);
      outline.push([Math.cos(a) * n.w * 1.15, Math.sin(a) * n.h * 1.15]);
    }
    for (let i = 0; i < k; i++) {
      const p1 = outline[i], p2 = outline[(i + 1) % k];
      const mid = [(p1[0] + p2[0]) / 2 * 1.05, (p1[1] + p2[1]) / 2 * 1.05];
      const j1 = [cx + (p1[0] - cx) * .45 + rand(-6, 6), cy + (p1[1] - cy) * .45 + rand(-5, 5)];
      const j2 = [cx + (p2[0] - cx) * .45 + rand(-6, 6), cy + (p2[1] - cy) * .45 + rand(-5, 5)];
      const poly = Math.random() < .5 ? [j1, p1, mid, p2, j2] : [[cx, cy], j1, p1, mid, p2, j2];
      const ang = Math.atan2(mid[1], mid[0]);
      shards.push({ poly, x: n.x, y: n.y, rot: n.rot, vx: Math.cos(ang) * rand(220, 520), vy: Math.sin(ang) * rand(160, 380) - rand(260, 520), vr: rand(-9, 9), life: 3, tex: n.tex, golden: n.golden });
    }
    for (let i = 0; i < 26; i++) dust.push({ x: n.x + rand(-n.w, n.w) * .5, y: n.y + rand(-n.h, n.h) * .5, vx: rand(-260, 260), vy: rand(-420, -60), life: rand(.5, 1.2), r: rand(1, 3.2), c: n.golden ? '#f6d641' : (Math.random() > .5 ? '#c9965a' : '#6b4220') });
    kernel = { x: n.x, y: n.y, w: n.w * .86, h: n.h * .74, rot: n.rot, pop: 0, t: 0, golden: n.golden, out: 0 };
    shake = 1; flash = 1; pressure = 0; holding = false;
    Sound.crack(1); try { navigator.vibrate && navigator.vibrate(22); } catch (e) {}
    const now = performance.now();
    streak = now - lastCrack < 4500 ? streak + 1 : 1; lastCrack = now;
    count++; best = Math.max(best, streak);
    Util.store.set('nut', { count, best });
    document.getElementById('nutCount').textContent = count;
    document.getElementById('nutBest').textContent = best;
    document.getElementById('nutHint').textContent = I18N.s().nutAgain(count) + (streak > 2 ? ` × ${streak}` : '');
    if (window.gsap) gsap.fromTo('#nutCount', { scale: 1.35 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.5)' });
    if (count % 4 === 0 && Bird.currentPerch()?.el?.classList.contains('nut-stage')) Bird.crack();
    nut = null;
    setTimeout(() => { if (kernel) kernel.out = 1; }, 1100);
    setTimeout(newNut, 1300);
  }

  function drawKernel(k, dt) {
    k.t += dt; k.pop = Math.min(1, k.pop + dt * 3);
    const lift = Math.sin(Math.min(1, k.t * 2.2) * Math.PI) * 26 * (1 - k.out);
    const alpha = k.out ? Math.max(0, 1 - (k.t - 1.1) * 4) : 1;
    if (alpha <= 0) { kernel = null; return; }
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(k.x, k.y - lift + (k.out ? (k.t - 1.1) * -300 : 0)); ctx.rotate(k.rot);
    const s = .6 + .4 * easeOutBack(k.pop); ctx.scale(s, s);
    // two kernel halves: each has two lobes split by a groove, with wrinkled ridges
    [-1, 1].forEach(side => {
      ctx.save(); ctx.translate(side * k.w * .06 * k.pop, side * k.h * 1.05 * k.pop); ctx.rotate(side * .06 * k.pop);
      const L = k.w * .92, R = k.h * .95;
      [-1, 1].forEach(lobe => {
        ctx.save(); ctx.translate(0, lobe * R * .38);
        const g = ctx.createLinearGradient(0, -R * .6, 0, R * .6);
        g.addColorStop(0, k.golden ? '#ffe68a' : '#d99a57'); g.addColorStop(.6, k.golden ? '#f0c24a' : '#b8723a'); g.addColorStop(1, k.golden ? '#c8901f' : '#8a4f24');
        ctx.fillStyle = g; ctx.strokeStyle = k.golden ? '#8a5a10' : '#5e3218'; ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-L, 0);
        // bumpy top edge
        for (let i = 0; i <= 10; i++) { const x = -L + 2 * L * i / 10, env = Math.sin(i / 10 * Math.PI); ctx.lineTo(x, -lobe * 0 - env * R * .55 - (i % 2 ? env * 3.2 : 0)); }
        for (let i = 10; i >= 0; i--) { const x = -L + 2 * L * i / 10, env = Math.sin(i / 10 * Math.PI); ctx.lineTo(x, env * R * .5 + (i % 2 ? env * 2.6 : 0)); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // wrinkles
        ctx.strokeStyle = k.golden ? 'rgba(120,80,10,.5)' : 'rgba(70,35,12,.5)'; ctx.lineWidth = 1.3;
        for (let i = 1; i < 6; i++) { const x = -L + 2 * L * i / 6; ctx.beginPath(); ctx.moveTo(x - 4, -R * .32); ctx.quadraticCurveTo(x + 5, 0, x - 3, R * .3); ctx.stroke(); }
        ctx.restore();
      });
      // the groove between the lobes
      ctx.strokeStyle = k.golden ? '#8a5a10' : '#4a2510'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-L * .9, 0); ctx.bezierCurveTo(-L * .3, 3, L * .3, -3, L * .9, 0); ctx.stroke();
      // a little shine
      ctx.fillStyle = 'rgba(255,240,210,.35)'; ctx.beginPath(); ctx.ellipse(-L * .35, -R * .55, L * .25, R * .12, -.1, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }
  const easeOutBack = t => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!inView) return;
    const dt = Math.min(.04, (now - (frame.t || now)) / 1000); frame.t = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const floor = H * .86;
    // floor shadow line
    ctx.fillStyle = 'rgba(90,60,30,.08)'; ctx.fillRect(0, floor + 2, W, H - floor);

    // pressure
    if (holding) { pressure = Math.min(1, pressure + dt * (Util.reduced.matches ? .8 : 1.15)); if (Math.random() < .5) Sound.creak(pressure); }
    else pressure = Math.max(0, pressure - dt * .35);
    if (pressure >= 1) crack();
    shake = Math.max(0, shake - dt * 3.5); flash = Math.max(0, flash - dt * 4);

    if (nut) {
      nut.enter = Math.min(1, nut.enter + dt * 1.6);
      const e = 1 - Math.pow(1 - nut.enter, 3);
      const x = Util.lerp(W + nut.w * 1.4, nut.tx, e);
      nut.x = x; nut.spin = (1 - e) * 6;
      const jx = (Math.random() - .5) * pressure * 7, jy = (Math.random() - .5) * pressure * 5;
      ctx.save(); ctx.translate(nut.x + jx, nut.y + jy); ctx.rotate(nut.rot - nut.spin);
      const squeeze = 1 - pressure * .05;
      ctx.scale(1 + pressure * .03, squeeze);
      // shadow
      ctx.save(); ctx.rotate(-(nut.rot - nut.spin)); ctx.fillStyle = 'rgba(60,35,15,.18)'; ctx.beginPath(); ctx.ellipse(0, floor - nut.y + 4, nut.w * .9, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.drawImage(nut.tex.canvas, -nut.tex.w / 2, -nut.tex.h / 2, nut.tex.w, nut.tex.h);
      // growing cracks
      if (pressure > .05) {
        ctx.strokeStyle = 'rgba(25,12,4,.85)'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
        nut.cracks.forEach(c => {
          const n = Math.max(1, Math.floor(c.length * pressure));
          ctx.beginPath(); ctx.moveTo(c[0][0] * nut.w, c[0][1] * nut.h);
          for (let i = 1; i <= Math.min(n, c.length - 1); i++) ctx.lineTo(c[i][0] * nut.w * 1.3, c[i][1] * nut.h * 1.6);
          ctx.stroke();
        });
      }
      ctx.restore();
      // pressure ring around the pointer / nut
      if (pressure > 0) {
        ctx.save(); ctx.strokeStyle = '#13333a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        const r = nut.w * 1.35;
        ctx.globalAlpha = .18; ctx.beginPath(); ctx.arc(nut.x, nut.y, r, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.strokeStyle = '#e88028'; ctx.beginPath(); ctx.arc(nut.x, nut.y, r, -Math.PI / 2, -Math.PI / 2 + pressure * Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    }
    if (kernel) drawKernel(kernel, dt);

    // shards
    for (let i = shards.length - 1; i >= 0; i--) {
      const s = shards[i];
      s.vy += 1500 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.rot += s.vr * dt; s.life -= dt;
      if (s.y > floor) { s.y = floor; s.vy *= -.32; s.vx *= .7; s.vr *= .6; if (Math.abs(s.vy) < 40) s.vy = 0; }
      if (s.x < -50 || s.x > W + 50 || s.life <= 0) { shards.splice(i, 1); continue; }
      ctx.save(); ctx.globalAlpha = clamp(s.life, 0, 1); ctx.translate(s.x, s.y); ctx.rotate(s.rot);
      ctx.beginPath(); s.poly.forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
      ctx.save(); ctx.clip(); ctx.drawImage(s.tex.canvas, -s.tex.w / 2, -s.tex.h / 2, s.tex.w, s.tex.h); ctx.restore();
      ctx.strokeStyle = s.golden ? '#f3dc9a' : '#e3c79a'; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.restore();
    }
    for (let i = dust.length - 1; i >= 0; i--) {
      const d = dust[i]; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt;
      if (d.life <= 0) { dust.splice(i, 1); continue; }
      ctx.globalAlpha = clamp(d.life * 2, 0, 1); ctx.fillStyle = d.c; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (flash > 0) { ctx.fillStyle = `rgba(255,248,234,${flash * .35})`; ctx.fillRect(0, 0, W, H); }
    if (shake > 0) cv.style.transform = `translate(${(Math.random() - .5) * shake * 10}px, ${(Math.random() - .5) * shake * 8}px)`;
    else if (cv.style.transform) cv.style.transform = '';
  }

  function resize() {
    const r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
    if (nut) { nut.tex = texture(nut); nut.tx = W * .5; nut.y = H * .5; } else newNut();
  }

  function init() {
    cv = document.getElementById('nutCanvas'); ctx = cv.getContext('2d');
    const saved = Util.store.get('nut', { count: 0, best: 0 });
    count = saved.count || 0; best = saved.best || 0;
    document.getElementById('nutCount').textContent = count; document.getElementById('nutBest').textContent = best;
    let taps = 0, tapTimer, downAt = 0;
    cv.addEventListener('pointerdown', e => {
      e.preventDefault(); holding = true; downAt = performance.now();
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    });
    const up = () => {
      if (!holding) return; holding = false;
      if (performance.now() - downAt < 220) { // a tap
        pressure = Math.min(1, pressure + .36); shake = .35; Sound.creak(pressure);
        taps++; clearTimeout(tapTimer); tapTimer = setTimeout(() => (taps = 0), 900);
      }
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', up);
    cv.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); holding = true; } });
    cv.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') holding = false; });
    new ResizeObserver(resize).observe(cv);
    new IntersectionObserver(es => es.forEach(e => {
      inView = e.isIntersecting;
      if (inView && !raf) raf = requestAnimationFrame(frame);
    }), { rootMargin: '80px' }).observe(cv);
  }
  return { init };
})();
