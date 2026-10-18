/* The farm: an illustrated plan of El Porvenir drawn in SVG.
   Zones: forest (the reserve), water (stream, spring and the green banks),
   orchard (pecan rows), life (birds and bees). Hovering or tapping a point
   in the list highlights its zone on the map. */
const Farm = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent && parent.appendChild(n); return n; };
  const LABELS = {
    en: { forest: 'Mata Atlântica reserve', water: 'Stream and spring', orchard: 'Pecan orchard' },
    nl: { forest: 'Mata Atlântica-reservaat', water: 'Beek en bron', orchard: 'Pecanboomgaard' },
  };
  let svg, labels = {};

  // the stream: a path from the spring at the top to the bottom edge
  const STREAM = 'M232 34C222 96 262 132 250 196S206 300 236 352S300 400 296 440';
  function nearStream(pathEl, x, y, d) {
    const len = pathEl.getTotalLength();
    for (let s = 0; s <= len; s += 12) { const p = pathEl.getPointAtLength(s); if (Math.hypot(p.x - x, p.y - y) < d) return true; }
    return false;
  }

  function build() {
    svg = document.getElementById('farmMap');
    el('rect', { x: 4, y: 4, width: 592, height: 412, rx: 28, fill: '#e9dfc4', stroke: '#13333a', 'stroke-width': 2 }, svg);
    const clip = el('clipPath', { id: 'farmClip' }, el('defs', {}, svg));
    el('rect', { x: 4, y: 4, width: 592, height: 412, rx: 28 }, clip);
    const world = el('g', { 'clip-path': 'url(#farmClip)' }, svg);

    // forest: a fifth of the land, on the left
    const forest = el('g', { 'data-zone': 'forest' }, world);
    el('path', { d: 'M0 0H118C132 60 108 120 126 180S110 300 130 360S118 410 122 420H0Z', fill: '#2f6b35' }, forest);
    const greens = ['#2f6b35', '#3d7f3a', '#4d942f', '#27592c', '#5aa23a'];
    for (let i = 0; i < 120; i++) {
      const y = rnd() * 430, edge = 116 + Math.sin(y / 40) * 10;
      el('circle', { cx: rnd() * edge, cy: y, r: 7 + rnd() * 9, fill: greens[i % greens.length], stroke: 'rgba(255,255,255,.25)', 'stroke-width': 1 }, forest);
    }

    // stream with its green banks, and the spring
    const water = el('g', { 'data-zone': 'water' }, world);
    el('path', { d: STREAM, fill: 'none', stroke: '#9cc58a', 'stroke-width': 44, 'stroke-linecap': 'round' }, water);
    for (let i = 0; i < 26; i++) {
      const t = i / 25, probe = el('path', { d: STREAM });
      water.appendChild(probe); const len = probe.getTotalLength(), p = probe.getPointAtLength(len * t); probe.remove();
      el('circle', { cx: p.x + (i % 2 ? 16 : -16) + (rnd() - .5) * 6, cy: p.y, r: 5 + rnd() * 4, fill: i % 3 ? '#6aa84f' : '#4d942f' }, water);
    }
    const streamPath = el('path', { d: STREAM, fill: 'none', stroke: '#58b7e8', 'stroke-width': 7, 'stroke-linecap': 'round' }, water);
    el('path', { d: STREAM, fill: 'none', stroke: 'rgba(255,255,255,.7)', 'stroke-width': 2, 'stroke-dasharray': '4 14', class: 'farm-flow' }, water);
    el('circle', { cx: 232, cy: 34, r: 9, fill: '#58b7e8', stroke: '#fff', 'stroke-width': 2 }, water);
    el('circle', { cx: 232, cy: 34, r: 16, fill: 'none', stroke: '#58b7e8', 'stroke-width': 1.5, class: 'farm-ripple' }, water);

    // orchard rows, kept clear of the stream banks
    const orchard = el('g', { 'data-zone': 'orchard' }, world);
    for (let y = 28; y < 410; y += 26) {
      for (let x = 150 + (y / 26 % 2) * 11; x < 584; x += 24) {
        if (nearStream(streamPath, x, y, 34)) continue;
        el('circle', { cx: x, cy: y, r: 6.5, fill: '#7ab55c', stroke: '#4d7f37', 'stroke-width': 1.4 }, orchard);
      }
    }

    // life: birds over the forest edge, bees between the rows
    const life = el('g', { 'data-zone': 'life' }, world);
    [[70, 70], [96, 210], [52, 330], [150, 120], [176, 300]].forEach(([x, y], i) => {
      el('path', { d: `M${x - 8} ${y}q4-5 8 0q4-5 8 0`, fill: 'none', stroke: i < 3 ? '#f6efe2' : '#13333a', 'stroke-width': 2.4, 'stroke-linecap': 'round', class: 'farm-bird', style: `animation-delay:${i * .4}s` }, life);
    });
    for (let i = 0; i < 14; i++) {
      const x = 330 + rnd() * 250, y = 30 + rnd() * 360;
      const g = el('g', { class: 'farm-bee', style: `animation-delay:${(rnd() * 2).toFixed(2)}s` }, life);
      el('ellipse', { cx: x, cy: y, rx: 4, ry: 3, fill: '#f6d641', stroke: '#13333a', 'stroke-width': 1.2 }, g);
    }

    // labels
    const lab = (key, x, y, anchor = 'start') => {
      const t = el('text', { x, y, 'text-anchor': anchor, class: 'farm-label', 'data-zone-label': key }, svg);
      labels[key] = t;
    };
    lab('forest', 20, 400); lab('water', 266, 34); lab('orchard', 580, 400, 'end');
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
    // count the 20% up when it comes into view
    const big = document.getElementById('farmBig');
    if (window.gsap && window.ScrollTrigger && !Util.reduced.matches) {
      const o = { v: 0 };
      gsap.to(o, { v: 20, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: big, start: 'top 85%', once: true }, onUpdate: () => (big.textContent = Math.round(o.v) + '%') });
    }
  }
  return { init, relabel };
})();
