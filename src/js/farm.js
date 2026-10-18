/* The farm: an illustrated plan of El Porvenir drawn in SVG, as a living landscape rather
   than a plantation grid: loose groves that follow the land, grass strips with wildflowers,
   old native trees left among the pecans, a tree-lined stream, three ponds and the forest.
   Zones: forest, water (stream, banks, ponds), orchard, life (birds and bees). Hovering or
   tapping a point in the list highlights its zone on the map. */
const Farm = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent && parent.appendChild(n); return n; };
  const LABELS = {
    en: { forest: 'Native forest', water: 'Stream and spring', ponds: 'Three ponds', orchard: 'Pecan groves' },
    nl: { forest: 'Inheems bos', water: 'Beek en bron', ponds: 'Drie vijvers', orchard: 'Pecangaarden' },
  };
  let svg, labels = {};

  const STREAM = 'M232 34C222 96 262 132 250 196S206 300 236 352S300 400 296 440';
  const TRACK = 'M600 150C540 156 492 176 462 198S420 250 448 290S520 330 560 360';
  // forest in patches spread across the farm, adding up to about a fifth of the land (illustrative)
  const FOREST = [{ x: 58, y: 78, rx: 62, ry: 52 }, { x: 40, y: 338, rx: 74, ry: 70 }, { x: 548, y: 58, rx: 74, ry: 56 },
    { x: 340, y: 206, rx: 52, ry: 40 }, { x: 300, y: 378, rx: 50, ry: 34 }, { x: 588, y: 300, rx: 48, ry: 64 }];
  // lines of trees linking the patches
  const CORRIDORS = [[[104, 104], [160, 140], [214, 150]], [[388, 214], [436, 244], [470, 238]], [[334, 244], [322, 300], [306, 346]], [[112, 330], [170, 300], [210, 296]]];
  // the three ponds at El Porvenir (positions are illustrative)
  const PONDS = [{ x: 400, y: 92, rx: 34, ry: 22 }, { x: 512, y: 238, rx: 40, ry: 26 }, { x: 372, y: 318, rx: 28, ry: 19 }];

  // a soft, irregular closed shape around a centre
  function blob(cx, cy, rx, ry, n = 9, wobble = .22) {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + (rnd() - .5) * wobble * 2; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + 'Z';
  }
  let streamPts = [], trackPts = [];
  const nearStream = (x, y, d) => streamPts.some(p => Math.hypot(p.x - x, p.y - y) < d);
  const nearTrack = (x, y, d) => trackPts.some(p => Math.hypot(p.x - x, p.y - y) < d);
  let corridorPts = [];
  const nearForest = (x, y, pad) => FOREST.some(f => ((x - f.x) / (f.rx + pad)) ** 2 + ((y - f.y) / (f.ry + pad)) ** 2 < 1) || corridorPts.some(p => Math.hypot(p[0] - x, p[1] - y) < 10 + pad);
  const nearPond = (x, y, pad) => PONDS.some(p => ((x - p.x) / (p.rx + pad)) ** 2 + ((y - p.y) / (p.ry + pad)) ** 2 < 1);
  function tree(parent, x, y, r, fill, dark) {
    el('circle', { cx: x, cy: y + r * .25, r, fill: dark, opacity: .55 }, parent);           // soft shadow
    el('circle', { cx: x, cy: y, r, fill }, parent);
    el('circle', { cx: x - r * .3, cy: y - r * .3, r: r * .45, fill: 'rgba(255,255,255,.18)' }, parent);
  }

  function build() {
    svg = document.getElementById('farmMap');
    const defs = el('defs', {}, svg);
    const clip = el('clipPath', { id: 'farmClip' }, defs);
    el('rect', { x: 4, y: 4, width: 592, height: 412, rx: 28 }, clip);
    const grass = el('linearGradient', { id: 'farmGrass', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#dfe6b4' }, grass); el('stop', { offset: 1, 'stop-color': '#cfdca2' }, grass);
    el('rect', { x: 4, y: 4, width: 592, height: 412, rx: 28, fill: 'url(#farmGrass)' }, svg);
    const world = el('g', { 'clip-path': 'url(#farmClip)' }, svg);

    // meadow texture: lighter and darker patches of grass
    const meadow = el('g', {}, world);
    for (let i = 0; i < 40; i++) el('path', { d: blob(130 + rnd() * 470, rnd() * 420, 20 + rnd() * 40, 12 + rnd() * 26, 7, .3), fill: rnd() > .5 ? 'rgba(255,255,230,.35)' : 'rgba(140,170,90,.18)' }, meadow);

    // a farm track
    const track = el('path', { d: TRACK, fill: 'none', stroke: '#e8d9b0', 'stroke-width': 9, 'stroke-linecap': 'round' }, world);
    for (let s = 0, L = track.getTotalLength(); s <= L; s += 10) trackPts.push(track.getPointAtLength(s));

    // forest: patches across the farm, linked by lines of trees
    const forest = el('g', { 'data-zone': 'forest' }, world);
    const greens = [['#2f6b35', '#1f4a24'], ['#3d7f3a', '#285c2a'], ['#4d942f', '#2f6b25'], ['#27592c', '#173a1b'], ['#5aa23a', '#3d7f2a']];
    FOREST.forEach(f => {
      el('path', { d: blob(f.x, f.y, f.rx, f.ry, 10, .2), fill: '#2f6b35' }, forest);
      const n = Math.round(f.rx * f.ry / 95);
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * .92, x = f.x + Math.cos(a) * f.rx * r, y = f.y + Math.sin(a) * f.ry * r;
        if (nearTrack(x, y, 8)) continue;
        const g = greens[i % greens.length];
        tree(forest, x, y, 6 + rnd() * 9, g[0], g[1]);
      }
    });
    CORRIDORS.forEach(line => {
      for (let s = 0; s < line.length - 1; s++) {
        const [a, b] = [line[s], line[s + 1]], steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 11);
        for (let k = 0; k <= steps; k++) {
          const x = a[0] + (b[0] - a[0]) * k / steps + (rnd() - .5) * 5, y = a[1] + (b[1] - a[1]) * k / steps + (rnd() - .5) * 5;
          corridorPts.push([x, y]);
          const g = greens[(k + s) % greens.length];
          tree(forest, x, y, 5.5 + rnd() * 4, g[0], g[1]);
        }
      }
    });

    // stream, spring and a tree-lined bank
    const water = el('g', { 'data-zone': 'water' }, world);
    el('path', { d: STREAM, fill: 'none', stroke: '#a9cf8c', 'stroke-width': 40, 'stroke-linecap': 'round', opacity: .9 }, water);
    const probe = el('path', { d: STREAM }, water), len = probe.getTotalLength();
    for (let s = 0; s <= len; s += 10) streamPts.push(probe.getPointAtLength(s));
    for (let i = 0; i < 34; i++) {
      const p = probe.getPointAtLength(len * i / 33), side = i % 2 ? 1 : -1;
      const g = greens[(i * 3) % greens.length];
      tree(water, p.x + side * (14 + rnd() * 8), p.y + (rnd() - .5) * 8, 5 + rnd() * 5, g[0], g[1]);
    }
    probe.remove();
    el('path', { d: STREAM, fill: 'none', stroke: '#58b7e8', 'stroke-width': 7, 'stroke-linecap': 'round' }, water);
    el('path', { d: STREAM, fill: 'none', stroke: 'rgba(255,255,255,.7)', 'stroke-width': 2, 'stroke-dasharray': '4 14', class: 'farm-flow' }, water);
    el('circle', { cx: 232, cy: 34, r: 9, fill: '#58b7e8', stroke: '#fff', 'stroke-width': 2 }, water);
    el('circle', { cx: 232, cy: 34, r: 16, fill: 'none', stroke: '#58b7e8', 'stroke-width': 1.5, class: 'farm-ripple' }, water);

    // the three ponds, with a reedy rim
    PONDS.forEach(p => {
      el('path', { d: blob(p.x, p.y, p.rx + 9, p.ry + 8, 9, .18), fill: '#a9cf8c' }, water);
      el('path', { d: blob(p.x, p.y, p.rx, p.ry, 9, .14), fill: '#58b7e8', stroke: '#fff', 'stroke-width': 2 }, water);
      el('path', { d: blob(p.x - p.rx * .2, p.y - p.ry * .25, p.rx * .45, p.ry * .3, 7, .2), fill: 'rgba(255,255,255,.28)' }, water);
      for (let i = 0; i < 9; i++) {
        const a = rnd() * Math.PI * 2, x = p.x + Math.cos(a) * (p.rx + 5), y = p.y + Math.sin(a) * (p.ry + 5);
        el('path', { d: `M${x.toFixed(1)} ${y.toFixed(1)}l-1.5 -7M${(x + 2).toFixed(1)} ${y.toFixed(1)}l1.5 -6`, stroke: '#4d7f37', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, water);
      }
    });

    // pecan groves: loose rows that follow the land, varied trees, natural gaps
    const orchard = el('g', { 'data-zone': 'orchard' }, world);
    const pecan = [['#86bd62', '#5b8a3e'], ['#7ab55c', '#4f7f37'], ['#93c56b', '#62904a'], ['#6fa952', '#4a7a33']];
    for (let row = 0; row < 15; row++) {
      const y0 = 26 + row * 27;
      for (let x = 16 + (row % 2) * 12; x < 584; x += 25 + rnd() * 6) {
        const y = y0 + Math.sin(x / 80 + row * .5) * 9 + (rnd() - .5) * 5;
        if (rnd() < .14 || nearStream(x, y, 34) || nearPond(x, y, 14) || nearTrack(x, y, 12) || nearForest(x, y, 8)) continue;
        const g = pecan[Math.floor(rnd() * pecan.length)];
        tree(orchard, x + (rnd() - .5) * 4, y, 5.2 + rnd() * 2.6, g[0], g[1]);
      }
    }
    // old native trees left standing among the groves
    [[160, 230], [470, 120], [500, 380], [430, 400], [130, 20], [200, 400]].forEach(([x, y]) => {
      if (!nearStream(x, y, 30) && !nearPond(x, y, 10) && !nearTrack(x, y, 16) && !nearForest(x, y, 6)) tree(orchard, x, y, 12 + rnd() * 4, '#3d7f3a', '#285c2a');
    });

    // a hedgerow along the right and bottom edges
    const hedge = el('g', {}, world);
    for (let x = 6; x < 600; x += 9) tree(hedge, x, 414 + (rnd() - .5) * 4, 5 + rnd() * 3, greens[Math.floor(rnd() * 5)][0], '#285c2a');
    for (let y = 10; y < 410; y += 9) tree(hedge, 594 + (rnd() - .5) * 4, y, 5 + rnd() * 3, greens[Math.floor(rnd() * 5)][0], '#285c2a');

    // life: wildflowers in the grass, birds, bees
    const life = el('g', { 'data-zone': 'life' }, world);
    const flowers = ['#f6d641', '#ffffff', '#e98bb0', '#e9601c'];
    for (let i = 0; i < 110; i++) {
      const x = 14 + rnd() * 572, y = 10 + rnd() * 400;
      if (nearStream(x, y, 26) || nearPond(x, y, 6) || nearForest(x, y, 0)) continue;
      el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 1.4 + rnd() * 1.2, fill: flowers[i % flowers.length] }, life);
    }
    [[58, 66], [548, 50], [40, 330], [340, 196], [588, 290], [160, 120]].forEach(([x, y], i) => {
      el('path', { d: `M${x - 8} ${y}q4-5 8 0q4-5 8 0`, fill: 'none', stroke: i < 5 ? '#f6efe2' : '#13333a', 'stroke-width': 2.4, 'stroke-linecap': 'round', class: 'farm-bird', style: `animation-delay:${i * .4}s` }, life);
    });
    for (let i = 0; i < 14; i++) {
      const x = 20 + rnd() * 560, y = 30 + rnd() * 360;
      if (nearPond(x, y, 4) || nearForest(x, y, 0)) continue;
      const g = el('g', { class: 'farm-bee', style: `animation-delay:${(rnd() * 2).toFixed(2)}s` }, life);
      el('ellipse', { cx: x, cy: y, rx: 4, ry: 3, fill: '#f6d641', stroke: '#13333a', 'stroke-width': 1.2 }, g);
    }

    el('rect', { x: 4, y: 4, width: 592, height: 412, rx: 28, fill: 'none', stroke: '#13333a', 'stroke-width': 2 }, svg);
    const lab = (key, x, y, anchor = 'start') => { labels[key] = el('text', { x, y, 'text-anchor': anchor, class: 'farm-label', 'data-zone-label': key }, svg); };
    lab('forest', 340, 254, 'middle'); lab('water', 266, 34); lab('ponds', 506, 298, 'middle'); lab('orchard', 572, 384, 'end');
    relabel();
  }
  function relabel() { const L = LABELS[I18N.lang] || LABELS.en; Object.entries(labels).forEach(([k, t]) => (t.textContent = L[k])); }

  function setActive(zone) { const map = document.querySelector('.farm-map'); if (zone) map.dataset.active = zone; else delete map.dataset.active; }
  function init() {
    build();
    const list = document.getElementById('farmPoints');
    list.addEventListener('pointerover', e => { const b = e.target.closest('[data-zone]'); if (b) setActive(b.dataset.zone); });
    list.addEventListener('pointerleave', () => setActive(null));
    list.addEventListener('focusin', e => { const b = e.target.closest('[data-zone]'); if (b) setActive(b.dataset.zone); });
    list.addEventListener('focusout', () => setActive(null));
    list.addEventListener('click', e => { const b = e.target.closest('[data-zone]'); if (b) setActive(b.dataset.zone); });
    // the little animations (bees, birds, stream) only run while the map is on screen
    const fig = document.querySelector('.farm-map');
    fig.classList.add('paused');
    new IntersectionObserver(es => es.forEach(e => fig.classList.toggle('paused', !e.isIntersecting))).observe(fig);
    const big = document.getElementById('farmBig');
    if (window.gsap && window.ScrollTrigger && !Util.reduced.matches) {
      const o = { v: 0 };
      gsap.to(o, { v: 20, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: big, start: 'top 85%', once: true }, onUpdate: () => (big.textContent = Math.round(o.v) + '%') });
    }
  }
  return { init, relabel };
})();
