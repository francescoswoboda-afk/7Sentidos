/* A pouch in CSS 3D: the real pack artwork on the front, a printed back
   (same silhouette, masked from the artwork) and a moving foil sheen.
   Drag to turn it; it settles back with a little inertia. */
function createPack(host, flavour, opts = {}) {
  host.classList.add('pack3d');
  host.innerHTML = `
    <div class="pack-float"><div class="pack-inner">
      <div class="pack-face pack-front"><img alt="" draggable="false" decoding="async"><div class="pack-sheen"></div></div>
      <div class="pack-face pack-back"><div class="back-shape"></div><div class="back-print"></div></div>
    </div></div>
    ${opts.shadow === false ? '' : '<div class="pack-shadow"></div>'}`;
  const inner = host.querySelector('.pack-inner'), float = host.querySelector('.pack-float');
  const img = host.querySelector('.pack-front img'), sheen = host.querySelector('.pack-sheen');
  const backShape = host.querySelector('.back-shape'), print = host.querySelector('.back-print');
  const st = { ry: opts.ry ?? -14, rx: 4, try: opts.ry ?? -14, trx: 4, vel: 0, dragging: false, idle: opts.idle ?? true, hoverX: 0, hoverY: 0 };
  let current = null, raf = null, visible = true;

  function paint(f) {
    current = f;
    const src = f.img[opts.pose || 'perched'];
    img.src = src; img.alt = opts.alt === false ? '' : `${fname(f)} pack`;
    const mask = `url("${src}")`;
    sheen.style.webkitMaskImage = sheen.style.maskImage = mask;
    backShape.style.webkitMaskImage = backShape.style.maskImage = mask;
    host.style.setProperty('--pk-body', f.colors.body);
    host.style.setProperty('--pk-ink', Util.inkFor(f.colors.body));
    const s = I18N.s(), info = DATA.productInfo;
    print.innerHTML = `
      <img src="${Util.inkFor(f.colors.body) === '#13333a' ? 'assets/aracari-wordmark-dark.svg' : 'assets/aracari-wordmark-white.svg'}" alt="">
      <div class="bp-name">${fname(f)}</div>
      <div>${s.ingredients}: ${info.ingredients}<br>${s.allergens}: ${info.allergen[I18N.lang]}</div>
      <div class="bp-table">${info.nutrition.slice(0, 4).map(([k, v]) => `<span>${s.nut[k]}</span><span>${v.replace(/ \/ .*/, '')}</span>`).join('')}</div>
      <div class="bp-foot"><span>${DATA.packSizeG} g<br>${DATA.producer}</span><span class="bp-bars"></span></div>`;
  }
  paint(flavour);

  // flip to another flavour: turn edge-on, swap, turn back
  function swap(f, dir = 1) {
    if (!window.gsap || Util.reduced.matches) { paint(f); return; }
    const o = { a: 0 };
    gsap.timeline()
      .to(o, { a: 90 * dir, duration: .32, ease: 'power2.in', onUpdate: () => { st.ry = st.try + o.a; } })
      .add(() => { paint(f); o.a = -90 * dir; })
      .to(o, { a: 0, duration: .7, ease: 'elastic.out(1, .6)', onUpdate: () => { st.ry = st.try + o.a; } });
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
  host.addEventListener('pointermove', e => {
    if (Util.coarse.matches) return;
    const r = host.getBoundingClientRect();
    st.hoverX = (e.clientX - r.left) / r.width - .5; st.hoverY = (e.clientY - r.top) / r.height - .5;
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
    float.style.transform = `translateY(${bob * (opts.bob ?? 8)}px)`;
    inner.style.transform = `rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg) rotateZ(${(bob * (opts.sway ?? 1.2)).toFixed(2)}deg)`;
    sheen.style.setProperty('--sheen', (50 - ((st.ry % 360) + 360) % 360 / 3.6 * .9) + '%');
  }
  raf = requestAnimationFrame(frame);
  // only animate packs that are on screen
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => (visible = e.isIntersecting)), { rootMargin: '100px' }).observe(host);

  return {
    el: host, swap, paint, get flavour() { return current; },
    spin(turns = 1) { st.vel = 0; if (window.gsap && !Util.reduced.matches) gsap.to(st, { try: st.try + 360 * turns, duration: 1.2, ease: 'power3.out' }); },
    nudge(v) { st.vel += v; },
    setTilt(rx, ry) { st.trx = rx; if (ry != null) st.try = rest + ry; },
  };
}
