/* A pack in CSS 3D. Drag to turn it; it settles on its front or back with a
   little inertia. opts.fmt: 'pouch' (default) or 'tube'.
   - Pouch: two flat faces, the v3 front and the printed back, with a foil sheen.
   - Tube: a real cylinder of TUBE_SIDES strips wrapped in the flat label
     (front half + back half, src/assets/<slug>-tube-label.webp), metal lid and
     rim, and per-strip shading that follows the turn. */
const TUBE_SIDES = 24;
// One stylesheet rule per flavour for the tube label, written once. Passing the label through a CSS
// variable made the browser re-read the whole image string on every restyle, which cost frames.
let tubeStylesDone = false;
function tubeStyles() {
  if (tubeStylesDone) return; tubeStylesDone = true;
  const lid = 'linear-gradient(#7a4116, #e9b26c 30%, #b06a2c 62%, #5e2f10)', rim = 'linear-gradient(#b8722f, #f0c088 40%, #a65f27 72%, #4f260c)';
  const el = document.createElement('style');
  el.textContent = DATA.flavours.map(f => `.tube3d[data-f="${f.id}"] .tube-side{background-image:${lid},${rim},url("${f.img.label}")}`).join('\n');
  document.head.append(el);
}
function createPack(host, flavour, opts = {}) {
  tubeStyles();
  host.classList.add('pack3d');
  host.innerHTML = `
    <div class="pack-float"><div class="pack-inner">
      <div class="pack-face pack-front"><img alt="" draggable="false" decoding="async"><div class="pack-sheen"></div></div>
      <div class="pack-face pack-back"><img alt="" draggable="false" decoding="async"></div>
      <div class="tube3d" hidden>
        ${Array.from({ length: TUBE_SIDES }, (_, i) => `<div class="tube-side" style="--i:${i}"><i></i></div>`).join('')}
        <div class="tube-cap tube-top"></div><div class="tube-cap tube-bottom"></div>
      </div>
    </div></div>
    ${opts.shadow === false ? '' : '<div class="pack-shadow"></div>'}`;
  const inner = host.querySelector('.pack-inner'), float = host.querySelector('.pack-float');
  const img = host.querySelector('.pack-front img'), sheen = host.querySelector('.pack-sheen');
  const backImg = host.querySelector('.pack-back img');
  const tube = host.querySelector('.tube3d'), shades = [...tube.querySelectorAll('.tube-side i')];
  const st = { ry: opts.ry ?? -14, rx: 4, try: opts.ry ?? -14, trx: 4, vel: 0, dragging: false, idle: opts.idle ?? true, hoverX: 0, hoverY: 0 };
  // fmt = what is painted now; target = where the latest swap is heading (a quick second switch must compare against this)
  let current = null, fmt = opts.fmt || 'pouch', target = fmt, raf = null, visible = true, lastF = '', lastI = '', lastShadeRy = null;

  // the browser must never treat the pack as a picture to drag out or text to select
  host.setAttribute('draggable', 'false');
  host.addEventListener('dragstart', e => e.preventDefault());
  host.addEventListener('selectstart', e => e.preventDefault());

  // cylinder size from the host box: label height = 0.9 of the box, diameter from the label's proportions
  function sizeTube() {
    const H = host.clientHeight; if (!H) return;
    const h = H * .9, side = h * 1.62 / TUBE_SIDES;          // label is 1.62 × as wide as it is tall
    const r = side / 2 / Math.tan(Math.PI / TUBE_SIDES);
    tube.style.setProperty('--th', h.toFixed(1) + 'px');
    tube.style.setProperty('--tw', side.toFixed(2) + 'px');
    tube.style.setProperty('--tr', r.toFixed(2) + 'px');
  }
  if ('ResizeObserver' in window) new ResizeObserver(sizeTube).observe(host); else addEventListener('resize', sizeTube);

  function paint(f) {
    current = f;
    const isTube = fmt === 'tube';
    img.alt = opts.alt === false ? '' : `${fname(f)}, ${DATA.formats[fmt].name[I18N.lang]}`;
    host.dataset.fmt = fmt;
    tube.hidden = !isTube;
    host.querySelectorAll('.pack-face').forEach(el => (el.hidden = isTube));
    if (isTube) {
      tube.dataset.f = f.id;
      sizeTube(); lastShadeRy = null;
      return;
    }
    img.src = f.img.front; backImg.src = f.img.back;
    const mask = `url("${f.img.front}")`;
    sheen.style.webkitMaskImage = sheen.style.maskImage = mask;
  }
  paint(flavour);

  // light on the tube: strips facing the viewer are lit, strips turning away go dark
  function shadeTube(ry) {
    if (lastShadeRy !== null && Math.abs(ry - lastShadeRy) < .4) return;
    lastShadeRy = ry;
    for (let i = 0; i < TUBE_SIDES; i++) {
      const a = (i * 360 / TUBE_SIDES + ry + 18) * Math.PI / 180;   // light a little from the left
      shades[i].style.opacity = (.62 - .62 * Math.max(0, Math.cos(a)) ** .7).toFixed(2);
    }
  }

  // flip to another flavour: turn edge-on, swap, turn back
  // newFmt (optional) changes pouch/tube at the same moment; opts.swapSlow stretches the turn (hero)
  function swap(f, dir = 1, newFmt) {
    if (newFmt) target = newFmt;
    const apply = () => { fmt = target; paint(f); };
    if (!window.gsap || Util.reduced.matches) { apply(); return; }
    const o = { a: 0 }, k = opts.swapSlow || 1;
    gsap.timeline()
      .to(o, { a: 90 * dir, duration: .32 * k, ease: 'power2.in', onUpdate: () => { st.ry = st.try + o.a; } })
      .add(() => { apply(); o.a = -90 * dir; })
      .to(o, { a: 0, duration: .7 * k, ease: 'elastic.out(1, .6)', onUpdate: () => { st.ry = st.try + o.a; } });
  }

  // pointer: drag to rotate (horizontal), hover tilts slightly
  let lastX = 0, lastT = 0, startX = 0, startY = 0, decided = false, horiz = false;
  host.addEventListener('pointerdown', e => {
    st.dragging = true; decided = false; startX = lastX = e.clientX; startY = e.clientY; lastT = performance.now(); st.vel = 0;
  });
  addEventListener('pointermove', e => {
    if (st.dragging) {
      if (!decided && (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6)) {
        decided = true; horiz = Math.abs(e.clientX - startX) > Math.abs(e.clientY - startY);
        if (horiz) try { host.setPointerCapture(e.pointerId); } catch (_) {}
        else st.dragging = false;
      }
      if (decided && horiz) {
        const now = performance.now(), dx = e.clientX - lastX;
        st.try += dx * .6; st.vel = dx / Math.max(1, now - lastT) * 16 * .6; lastX = e.clientX; lastT = now;
        host.dataset.dragged = '1';
      }
    }
  }, { passive: true });
  const end = () => { if (!st.dragging) return; st.dragging = false; setTimeout(() => delete host.dataset.dragged, 50); };
  addEventListener('pointerup', end); addEventListener('pointercancel', end);
  let box = null;
  host.addEventListener('pointerenter', () => { box = host.getBoundingClientRect(); });
  host.addEventListener('pointermove', e => {
    if (Util.coarse.matches || !box) return;
    st.hoverX = (e.clientX - box.left) / box.width - .5; st.hoverY = (e.clientY - box.top) / box.height - .5;
  });
  host.addEventListener('pointerleave', () => { st.hoverX = st.hoverY = 0; });
  host.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { st.try -= 30; e.preventDefault(); }
    if (e.key === 'ArrowRight') { st.try += 30; e.preventDefault(); }
  });

  const rest = opts.ry ?? -14;
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    if (!st.dragging) {
      st.try += st.vel; st.vel *= .93;
      if (Math.abs(st.vel) < .05) {
        // settle to the nearest face (front or back)
        const turns = Math.round((st.try - rest) / 180);
        st.try += (rest + turns * 180 - st.try) * .06;
      }
    }
    st.ry += (st.try + st.hoverX * 26 - st.ry) * .12;
    st.rx += (st.trx - st.hoverY * 14 - st.rx) * .12;
    const bob = st.idle && !Util.reduced.matches ? Math.sin(t / 900 + (opts.phase || 0)) : 0;
    const ft = `translateY(${(bob * (opts.bob ?? 8)).toFixed(1)}px)`;
    const it = `rotateX(${st.rx.toFixed(1)}deg) rotateY(${st.ry.toFixed(1)}deg) rotateZ(${(bob * (opts.sway ?? 1.2)).toFixed(1)}deg)`;
    if (ft !== lastF) { float.style.transform = ft; lastF = ft; }
    if (it !== lastI) {
      inner.style.transform = it; lastI = it;
      if (fmt === 'tube') shadeTube(st.ry);
      else {
        // the sheen only needs to follow the turn, not the bob
        const sh = (50 - ((st.ry % 360) + 360) % 360 / 3.6 * .9).toFixed(0) + '%';
        if (sh !== sheen.dataset.v) { sheen.dataset.v = sh; sheen.style.setProperty('--sheen', sh); }
      }
    }
  }
  raf = requestAnimationFrame(frame);
  // only animate packs that are on screen
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => (visible = e.isIntersecting)), { rootMargin: '100px' }).observe(host);

  // turn to the front (false) or the back (true) of the pack
  function showBack(on) {
    const turns = Math.round((st.try - rest) / 180), back = Math.abs(turns) % 2 === 1;
    if (back !== !!on) st.try = rest + (turns + 1) * 180;
    st.vel = 0;
  }
  const isBack = () => Math.abs(Math.round((st.try - rest) / 180)) % 2 === 1;

  return {
    el: host, swap, paint, showBack, get back() { return isBack(); }, get flavour() { return current; },
    get fmt() { return target; }, setFmt(v) { if (v !== target) swap(current, 1, v); },
    spin(turns = 1) { st.vel = 0; if (window.gsap && !Util.reduced.matches) gsap.to(st, { try: st.try + 360 * turns, duration: 1.2, ease: 'power3.out' }); },
    nudge(v) { st.vel += v; },
    setTilt(rx, ry) { st.trx = rx; if (ry != null) st.try = rest + ry; },
  };
}
