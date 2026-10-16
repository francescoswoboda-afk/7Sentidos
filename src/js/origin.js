/* Origin: a pinned, scroll-scrubbed scene.
   0–4: the orchard turns through spring, summer, autumn (harvest) and winter.
   4–5: the view becomes a map and the route draws from Santa Cruz do Sul to the Netherlands. */
const Origin = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const leaves = [], catkins = [], nuts = [], frost = [];
  let svg, map, sky, sun, leafG, route, routeLen = 0, ship, kmText, progress = 0, active = false;

  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent && parent.appendChild(n); return n; };

  // recursive branches; tips collect leaves, catkins and nuts
  function branch(g, x, y, ang, len, w, depth) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    const mx = (x + x2) / 2 + (rnd() - .5) * len * .3, my = (y + y2) / 2 + (rnd() - .5) * len * .2;
    el('path', { d: `M${x} ${y}Q${mx} ${my} ${x2} ${y2}`, stroke: '#5b3a22', 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, g);
    if (depth <= 0 || len < 14) { tip(x2, y2); return; }
    const n = depth > 3 ? 2 : 2 + (rnd() > .5 ? 1 : 0);
    for (let i = 0; i < n; i++) branch(g, x2, y2, ang + (rnd() - .5) * 1.1 + (i - (n - 1) / 2) * .5, len * (.68 + rnd() * .12), w * .66, depth - 1);
    if (depth < 3) tip(x2, y2);
  }
  function tip(x, y) {
    for (let i = 0; i < 3; i++) leaves.push({ x: x + (rnd() - .5) * 26, y: y + (rnd() - .5) * 20, r: rnd() * 180, s: .7 + rnd() * .6, fall: rnd() });
    if (rnd() > .45) catkins.push({ x, y, l: 14 + rnd() * 14 });
    if (rnd() > .55) nuts.push({ x: x + (rnd() - .5) * 10, y: y + 6, drop: rnd(), gx: x + (rnd() - .5) * 60 });
  }
  function tree(g, x, base, scale) {
    const t = el('g', {}, g);
    el('path', { d: `M${x - 9 * scale} ${base}C${x - 6 * scale} ${base - 60 * scale} ${x - 4 * scale} ${base - 110 * scale} ${x} ${base - 150 * scale}L${x + 6 * scale} ${base - 150 * scale}C${x + 6 * scale} ${base - 100 * scale} ${x + 8 * scale} ${base - 50 * scale} ${x + 12 * scale} ${base}Z`, fill: '#5b3a22' }, t);
    branch(t, x + 3 * scale, base - 140 * scale, -Math.PI / 2 - .5, 70 * scale, 9 * scale, 5);
    branch(t, x + 3 * scale, base - 140 * scale, -Math.PI / 2 + .5, 70 * scale, 9 * scale, 5);
    branch(t, x + 3 * scale, base - 145 * scale, -Math.PI / 2, 80 * scale, 8 * scale, 5);
  }

  function buildOrchard() {
    svg = document.getElementById('orchard');
    sky = el('rect', { width: 800, height: 600, fill: '#cfe9f3' }, svg);
    sun = el('circle', { cx: 640, cy: 120, r: 46, fill: '#f6d641' }, svg);
    const hills = el('g', {}, svg);
    el('path', { d: 'M0 410C120 360 220 380 330 350S560 330 800 380V600H0Z', fill: '#9cc9a0' }, hills);
    el('path', { d: 'M0 450C160 420 300 440 420 420S640 400 800 440V600H0Z', fill: '#7db37f' }, hills);
    const ground = el('path', { d: 'M0 500C200 480 600 486 800 500V600H0Z', fill: '#c9b48a' }, svg);
    svg._hills = hills; svg._ground = ground;
    const rows = el('g', {}, svg);
    // far row
    for (let i = 0; i < 5; i++) tree(rows, 60 + i * 175, 452, .42);
    const near = el('g', {}, svg);
    tree(near, 400, 520, 1.15);
    tree(near, 110, 516, .7); tree(near, 690, 516, .72);
    // leaves, catkins, nuts, frost on top of branches
    leafG = el('g', { fill: '#8cc45a' }, svg);
    leaves.forEach(l => { l.n = el('ellipse', { cx: 0, cy: 0, rx: 6, ry: 3.2 }, leafG); });
    const catG = el('g', { stroke: '#c9c25a', 'stroke-width': 2.4, 'stroke-linecap': 'round', fill: 'none' }, svg);
    catkins.forEach(c => { c.n = el('path', { d: `M${c.x} ${c.y}q2 ${c.l / 2} -1 ${c.l}` }, catG); });
    const nutG = el('g', {}, svg);
    nuts.forEach(n => { n.n = el('ellipse', { rx: 4.5, ry: 3.4, fill: '#7aa63b' }, nutG); });
    const frostG = el('g', { fill: '#fff' }, svg);
    for (let i = 0; i < 90; i++) frost.push(el('circle', { cx: rnd() * 800, cy: rnd() * 600, r: 1 + rnd() * 2 }, frostG));
    svg._frost = frostG; svg._cat = catG; svg._nuts = nutG;
  }

  // coarse outlines, enough to read as a stylised map (lon, lat)
  const SA = [[-77, 8], [-72, 12], [-62, 10.5], [-52, 5], [-50, 0], [-44, -2.5], [-35, -5.5], [-35, -9], [-39, -15], [-41, -22], [-48, -26], [-53, -34], [-58, -38.5], [-62, -41], [-65, -45], [-68, -50], [-69, -55], [-74, -52], [-73.5, -44], [-71.5, -30], [-70.5, -18], [-76, -14], [-81, -5], [-80, 0], [-77, 4]];
  const AF = [[-17, 21], [-17, 15], [-12, 7], [-8, 4.5], [0, 5.5], [9, 4], [9, -1], [12, -6], [13, -12], [12, -17], [15, -27], [18, -34.5], [25, -34], [32, -29], [35, -24], [40, -15], [40, -10], [39, -5], [42, 0], [51, 11], [43, 12], [32, 30], [20, 32], [10, 37], [-6, 36], [-10, 30], [-13, 27]];
  const EU = [[-9, 37], [-9, 43], [-2, 43.5], [-1.5, 46.5], [-4.5, 48.5], [-1.5, 49.7], [1.5, 51], [4, 51.5], [4.7, 53], [8, 54], [8.5, 57], [10.5, 57.7], [12, 54.5], [20, 54.5], [24, 57], [24, 60], [30, 60], [32, 52], [30, 45], [28, 41], [24, 40], [23, 36.5], [20, 39.5], [16, 38], [16, 41], [12.5, 44], [13.5, 45.5], [10, 44], [6.5, 43], [3, 43.3], [0, 38.5], [-2, 36.7], [-5.5, 36]];
  const UK = [[-5.7, 50], [1.4, 51.2], [1.7, 52.7], [0, 53.5], [-1.6, 55.5], [-2, 57.6], [-5, 58.6], [-6, 56.5], [-4.8, 54.8], [-3, 53.4], [-4.6, 52.7], [-5.2, 51.7]];
  const NA = [[-85, 21], [-87, 16], [-83, 10], [-77, 8], [-80, 9], [-85, 12], [-90, 14], [-95, 16], [-97, 21], [-97, 26], [-90, 30], [-83, 29], [-81, 25], [-80, 31], [-76, 35], [-70, 42], [-66, 45], [-60, 47], [-53, 47], [-56, 52], [-64, 60], [-78, 62], [-95, 62], [-95, 21]];
  const P = ([lon, lat]) => [400 + (lon + 20) * 4.67, 300 - (lat - 2) * 4.67];
  function smooth(pts) {
    const p = pts.map(P); let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length; i++) {
      const p0 = p[(i - 1 + p.length) % p.length], p1 = p[i], p2 = p[(i + 1) % p.length], p3 = p[(i + 2) % p.length];
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + 'Z';
  }
  function buildMap() {
    map = document.getElementById('map');
    el('rect', { x: -400, y: -300, width: 1600, height: 1200, fill: '#285c69' }, map);
    const waves = el('g', { stroke: 'rgba(255,255,255,.12)', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, map);
    for (let y = 40; y < 600; y += 46) for (let x = (y / 46 % 2) * 40; x < 800; x += 90) el('path', { d: `M${x} ${y}q10 -8 20 0t20 0` }, waves);
    const land = el('g', { fill: '#f6efe2', stroke: '#13333a', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, map);
    [SA, AF, EU, UK, NA].forEach(s => el('path', { d: smooth(s) }, land));
    // Rio Grande do Sul highlighted
    const rs = el('path', { d: smooth([[-57.6, -30.2], [-53.5, -27.2], [-50, -29.3], [-50.6, -31], [-52.7, -33.7], [-53.4, -33.2], [-55.6, -30.9]]), fill: '#e88028', stroke: '#13333a', 'stroke-width': 1.5 }, map);
    const nl = el('path', { d: smooth([[3.4, 51.4], [6.1, 50.8], [7.2, 52.2], [7.1, 53.5], [5.5, 53.4], [4.7, 52.9]]), fill: '#e88028', stroke: '#13333a', 'stroke-width': 1.5 }, map);
    const a = P([-52.43, -29.72]), b = P([4.48, 51.92]);
    const c1 = P([-30, -24]), c2 = P([-24, 44]);
    route = el('path', { d: `M${a[0]} ${a[1]}C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${b[0]} ${b[1]}`, fill: 'none', stroke: '#f6d641', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-dasharray': '2 9' }, map);
    const routeMask = el('path', { d: route.getAttribute('d'), fill: 'none', stroke: '#fff', 'stroke-width': 8 });
    const m = el('mask', { id: 'routeMask' }, map); m.appendChild(routeMask);
    route.setAttribute('mask', 'url(#routeMask)');
    routeLen = routeMask.getTotalLength();
    routeMask.setAttribute('stroke-dasharray', routeLen); routeMask.setAttribute('stroke-dashoffset', routeLen);
    route._mask = routeMask;
    const pin = (p, label, anchor, dy) => {
      const g = el('g', {}, map);
      el('circle', { cx: p[0], cy: p[1], r: 6, fill: '#13333a', stroke: '#f6efe2', 'stroke-width': 2.5 }, g);
      const t = el('text', { x: p[0] + (anchor === 'end' ? -12 : 12), y: p[1] + dy, 'text-anchor': anchor, fill: '#f6efe2', stroke: '#285c69', 'stroke-width': 5, 'paint-order': 'stroke', 'stroke-linejoin': 'round', 'font-family': 'Josefin Sans, sans-serif', 'font-weight': 700, 'font-size': 15, 'letter-spacing': 2 }, g);
      t.textContent = label; return g;
    };
    pin(a, 'SANTA CRUZ DO SUL', 'start', 22);
    pin(b, 'NEDERLAND', 'start', -12);
    kmText = el('text', { x: 400, y: 560, 'text-anchor': 'middle', fill: '#f6efe2', 'font-family': 'Literata, serif', 'font-weight': 600, 'font-size': 28, 'font-variant-numeric': 'tabular-nums' }, map);
    kmText.textContent = '0 km';
  }

  const lerpC = (a, b, t) => Util.mix(a, b, Util.clamp(t, 0, 1));
  const win = (p, a, b, fade = .35) => Util.clamp(Math.min((p - a + fade) / fade, (b + fade - p) / fade), 0, 1);

  function render(p) {
    progress = p;
    // sky and sun per season
    const skies = ['#d8eef5', '#9fd6ee', '#f3d9ad', '#dfe6ea', '#dfe6ea'];
    const i = Math.min(3, Math.floor(p)), f = p - Math.floor(p);
    sky.setAttribute('fill', lerpC(skies[i], skies[Math.min(4, i + 1)], Util.clamp((f - .6) / .4, 0, 1)));
    const sunY = [130, 80, 150, 230, 230];
    sun.setAttribute('cy', Util.lerp(sunY[i], sunY[Math.min(4, i + 1)], Util.clamp((f - .5) / .5, 0, 1)));
    sun.setAttribute('fill', p > 2.6 && p < 3.6 ? '#f2e6b0' : '#f6d641');
    // leaves: small and fresh, full and dark, golden and falling, gone
    const leafCol = p < 1 ? lerpC('#a8d468', '#4d942f', p) : p < 2 ? lerpC('#4d942f', '#5a8f2e', p - 1) : lerpC('#d8a83a', '#b36b28', p - 2);
    leafG.setAttribute('fill', leafCol);
    const grow = Util.clamp(.45 + p * .55, 0, 1);
    leaves.forEach(l => {
      const fallT = Util.clamp((p - 2.15 - l.fall * .7) / .5, 0, 1);
      const gone = p >= 3 ? 0 : 1;
      const s = l.s * grow * (fallT > 0 ? 1 - fallT * .3 : 1) * gone;
      l.n.setAttribute('transform', `translate(${l.x + fallT * 30 * (l.fall - .5)} ${l.y + fallT * (520 - l.y) * .9}) rotate(${l.r + fallT * 200}) scale(${s.toFixed(3)})`);
      l.n.setAttribute('opacity', fallT >= 1 ? 0 : 1);
    });
    svg._cat.setAttribute('opacity', win(p, 0, .8));
    nuts.forEach(n => {
      const vis = Util.clamp((p - .8) / .4, 0, 1);
      const drop = Util.clamp((p - 2 - n.drop * .6) / .4, 0, 1);
      const col = p < 1.8 ? '#7aa63b' : lerpC('#7aa63b', '#7a4a22', (p - 1.8) / .4);
      n.n.setAttribute('fill', col);
      n.n.setAttribute('cx', Util.lerp(n.x, n.gx, drop)); n.n.setAttribute('cy', Util.lerp(n.y, 506 + n.drop * 30, drop * drop));
      n.n.setAttribute('opacity', p > 2.75 ? Util.clamp(1 - (p - 2.75) / .3, 0, 1) : vis);
    });
    svg._frost.setAttribute('opacity', win(p, 3, 4, .3) * .9);
    svg._hills.setAttribute('opacity', 1);
    svg._ground.setAttribute('fill', p > 2.9 ? lerpC('#c9b48a', '#e4e7e2', (p - 2.9) / .4) : '#c9b48a');
    // map
    const mp = Util.clamp((p - 3.85) / .3, 0, 1);
    map.style.opacity = mp; svg.style.opacity = 1 - mp * .9;
    const r = Util.clamp((p - 4.05) / .85, 0, 1);
    route._mask.setAttribute('stroke-dashoffset', routeLen * (1 - r));
    kmText.textContent = String(Math.round(10687 * r)).replace(/B(?=(d{3})+(?!d))/g, ' ') + ' km';
    // copy and dial
    const step = Math.min(4, Math.floor(p + .15));
    document.querySelectorAll('.season').forEach(s => s.classList.toggle('on', +s.dataset.step === step));
    document.querySelectorAll('#seasonDial span').forEach((s, j) => s.style.setProperty('--p', Util.clamp(p - j, 0, 1)));
    active = p > 4.02 && p < 4.98;
  }
  // a point on the route in screen coordinates, for the bird
  function routePoint() {
    const r = Util.clamp((progress - 4.05) / .85, 0, 1);
    const pt = route._mask.getPointAtLength(routeLen * r);
    const m = map.getScreenCTM(); if (!m) return null;
    return { x: m.a * pt.x + m.c * pt.y + m.e, y: m.b * pt.x + m.d * pt.y + m.f };
  }

  function init() {
    buildOrchard(); buildMap(); render(0);
    if (!window.ScrollTrigger) { document.querySelectorAll('.season').forEach(s => s.classList.add('on')); return; }
    ScrollTrigger.create({
      trigger: '.origin', start: 'top top', end: () => '+=' + innerHeight * 4.2, pin: '.origin-pin', scrub: Util.reduced.matches ? true : .7,
      onUpdate: self => render(self.progress * 5),
    });
  }
  return { init, routePoint, get onRoute() { return active; }, get progress() { return progress; } };
})();
