/* Wiring: smooth scroll, the bird's perches, reveals, cursor, magnetic buttons,
   language, sound, cookies, legal pages, forms and the easter eggs. */
const App = (() => {
  const { $, $$, store, reduced, coarse } = Util;
  const hasGsap = !!window.gsap;
  let lenis = null;

  /* ---------- where the bird sits in each section ---------- */
  // line: true = sit at the end of the heading's first line, on the baseline
  const PERCHES = [
    { sec: '#hero', sel: '#heroPack', fx: .64, fy: .035 },
    { sec: '#origin', sel: '.origin-stage', fx: .84, fy: 0 },
    { sec: '#nut', sel: '.nut-stage', fx: .8, fy: 0 },
    { sec: '#shop', sel: '#shopTitle, .bundles-head .h2', line: true },
    { sec: '#pairing', sel: '#pairTitle', line: true },
    { sec: '#pairing', sel: '#pairStage', fx: .82, fy: 0 },
    { sec: '#bird', sel: '.fact', fx: .955, fy: 0, dy: 2 },
    { sec: '#family', sel: '.portrait .frame', fx: .74, fy: 0 },
    { sec: '#retail', sel: '#retailForm', fx: .84, fy: 0 },
    { sec: '#letter', sel: '#letterTitle', line: true },
    { sec: '#letter', sel: '#letterForm', fx: .9, fy: 0 },
  ];
  const navH = () => $('#nav').getBoundingClientRect().bottom;
  function lineEnd(el) {
    const chars = el.querySelectorAll('.ch'); if (!chars.length) return null;
    const top0 = chars[0].getBoundingClientRect().top; let last = chars[0];
    for (const c of chars) { if (Math.abs(c.getBoundingClientRect().top - top0) < 6) last = c; else break; }
    const r = last.getBoundingClientRect();
    return { x: r.right + Bird.state.size * .4, y: r.bottom - r.height * .1 };
  }
  function pointOf(p) {
    if (p.get) return p.get() || { x: -999, y: -999 };
    const r = p.el.getBoundingClientRect(); return { x: r.left + r.width * p.fx, y: r.top + r.height * p.fy + (p.dy || 0), w: r.width };
  }
  function goodPoint(pt) { return pt.y > navH() + 70 && pt.y < innerHeight - 30 && pt.x > 30 && pt.x < innerWidth - 30; }
  function activeSection() {
    let best = null, bestV = 0;
    [...new Set(PERCHES.map(c => c.sec))].forEach(sec => {
      const s = $(sec); if (!s) return;
      const r = s.getBoundingClientRect();
      const v = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / innerHeight;
      if (v > bestV) { bestV = v; best = sec; }
    });
    return best;
  }
  function candidates(sec) {
    return PERCHES.filter(c => c.sec === sec).flatMap(cfg => $$(cfg.sel).filter(el => el.offsetParent !== null)
      .map(el => ({ el, fx: cfg.fx, fy: cfg.fy, dy: cfg.dy, get: cfg.line ? () => lineEnd(el) : null })));
  }
  function bestPerch() {
    const sec = activeSection(); if (!sec) return null;
    const c = candidates(sec).map(p => ({ p, pt: pointOf(p) })).filter(o => goodPoint(o.pt));
    if (!c.length) return null;
    c.sort((a, b) => Math.abs(a.pt.y - innerHeight * .38) - Math.abs(b.pt.y - innerHeight * .38));
    return c[0].p;
  }
  function perchManager() {
    if (['#checkout', '#product', '#cart', '#legal'].some(s => Util.isOpen($(s)))) return;
    if (Origin.onRoute && !reduced.matches) { if (Bird.mode !== 'track' && !Bird.busy) Bird.track(Origin.routePoint); return; }
    if (Bird.mode === 'track') Bird.untrack();
    if (Bird.busy || Bird.mode === 'busy') return;
    const cur = Bird.currentPerch(), sec = activeSection();
    if (cur && sec && Bird.mode !== 'idle') {
      const stillHere = candidates(sec).some(p => p.el === cur.el) && cur.el.isConnected && goodPoint(pointOf(cur));
      if (stillHere) return;
    }
    const b = bestPerch(); if (b) Bird.perchOn(b);
  }

  /* ---------- smooth scroll ---------- */
  function initScroll() {
    if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis && !reduced.matches && hasGsap) {
      lenis = new Lenis({ lerp: .1, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      App.lenis = lenis;
    }
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute('href'); const t = id === '#top' ? document.body : $(id); if (!t) return;
      e.preventDefault();
      closeMenu();
      const go = () => { if (lenis) lenis.scrollTo(t, { offset: id === '#top' ? 0 : -navH() - 10, duration: 1.6, easing: x => 1 - Math.pow(1 - x, 4) }); else t.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' }); };
      if (a.closest('#cart')) { Util.close($('#cart')); setTimeout(go, 350); } else go();
      if (t.tabIndex < 0 && t !== document.body) { t.setAttribute('tabindex', '-1'); }
      setTimeout(() => t.focus && t.focus({ preventScroll: true }), 900);
    });
    // nav hides on the way down, returns on the way up
    let lastY = scrollY;
    addEventListener('scroll', () => {
      const y = scrollY, nav = $('#nav');
      nav.classList.toggle('hide', y > 400 && y > lastY + 4 && $('#menu').hidden && performance.now() - Cart.lastAdd > 4000);
      if (y < lastY - 4 || y < 400) nav.classList.remove('hide');
      lastY = y;
    }, { passive: true });
  }

  /* ---------- reveals ---------- */
  function initReveals() {
    if (!hasGsap || !window.ScrollTrigger || reduced.matches) return;
    $$('.split').forEach(h => {
      if (h.id === 'heroTitle') return;
      const words = h.querySelectorAll('.w');
      // room above and below so accents (é) and cedillas (ç) are not cut by the mask
      gsap.set(words, { overflow: 'hidden', verticalAlign: 'top', paddingTop: '.2em', marginTop: '-.2em', paddingBottom: '.14em', marginBottom: '-.14em' });
      gsap.from(h.querySelectorAll('.ch'), { yPercent: 130, rotate: 6, duration: 1, ease: 'expo.out', stagger: .022, scrollTrigger: { trigger: h, start: 'top 88%', once: true },
        onComplete: () => gsap.set(words, { overflow: 'visible' }) });
    });
    const batch = (sel, vars = {}) => ScrollTrigger.batch(sel, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.from(els, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08, ...vars, overwrite: true }),
    });
    batch('.card'); batch('.bundle'); batch('.fact'); batch('.retail-points li'); batch('.ship-facts li', { y: 14 }); batch('.portrait', { y: 60 }); batch('.tbd-block p', { y: 20 });
    // the hero headline gets lighter as it leaves
    gsap.to('#heroPack', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- headings: letters near the pointer turn lighter ---------- */
  function initWeightPlay() {
    if (coarse.matches || reduced.matches) return;
    $$('.display, .h2').forEach(h => {
      let raf = null, px = 0, py = 0;
      h.addEventListener('pointermove', e => {
        px = e.clientX; py = e.clientY;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          h.querySelectorAll('.ch').forEach(c => {
            const r = c.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py);
            c.style.fontWeight = Math.round(300 + 400 * Util.clamp(d / 160, 0, 1));
          });
        });
      });
      h.addEventListener('pointerleave', () => h.querySelectorAll('.ch').forEach(c => (c.style.fontWeight = '')));
      h.querySelectorAll('.ch').forEach(c => c.classList.add('hoverable'));
    });
  }

  /* ---------- cursor + magnetic buttons ---------- */
  function initCursor() {
    if (coarse.matches || reduced.matches) return;
    document.documentElement.classList.add('has-cursor');
    const cur = $('#cursor'), dot = cur.querySelector('.cursor-dot'), ring = cur.querySelector('.cursor-ring'), label = $('#cursorLabel');
    let x = -100, y = -100, rx = -100, ry = -100;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      const t = e.target;
      const interactive = t.closest && t.closest('a, button, label, select, [data-cursor], .bird, .pack-slot, canvas');
      const lab = t.closest && (t.closest('canvas#nutCanvas') ? (I18N.lang === 'nl' ? 'kraak' : 'crack') : t.closest('[data-cursor="drag"]') ? (I18N.lang === 'nl' ? 'draai' : 'turn') : '');
      cur.classList.toggle('hover', !!interactive && !lab);
      cur.classList.toggle('label', !!lab);
      label.textContent = lab || '';
      cur.classList.toggle('on-nut', !!(t.closest && t.closest('#nutCanvas')));
      cur.classList.toggle('on-dark', !!(t.closest && t.closest('.pairing, .retail, .footer, .strip, .bundle')));
    }, { passive: true });
    addEventListener('pointerdown', () => gsap?.to(ring, { scale: .8, duration: .15 }));
    addEventListener('pointerup', () => gsap?.to(ring, { scale: 1, duration: .4, ease: 'elastic.out(1,.5)' }));
    const loop = () => {
      rx += (x - rx) * .5; ry += (y - ry) * .5;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`; ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    // magnetic buttons pull toward the pointer
    document.addEventListener('pointermove', e => {
      const m = e.target.closest && e.target.closest('.magnetic');
      $$('.magnetic.pulled').forEach(b => { if (b !== m) { b.classList.remove('pulled'); gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }); } });
      if (!m) return;
      const r = m.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      m.classList.add('pulled');
      gsap.to(m, { x: dx * .22, y: dy * .3, duration: .4, ease: 'power3.out' });
    }, { passive: true });
  }

  /* ---------- menu, sound, language ---------- */
  function closeMenu() { const m = $('#menu'); if (!m.hidden) { m.hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); lenis?.start(); document.documentElement.style.overflow = ''; } }
  function initControls() {
    $('#menuBtn').addEventListener('click', () => {
      const m = $('#menu'), open = m.hidden;
      if (!open) return closeMenu();
      m.hidden = false; $('#menuBtn').setAttribute('aria-expanded', 'true'); lenis?.stop(); document.documentElement.style.overflow = 'hidden';
      if (hasGsap && !reduced.matches) gsap.from('#menu a', { y: 40, opacity: 0, duration: .7, stagger: .05, ease: 'expo.out' });
      m.querySelector('a').focus();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    $('#soundBtn').addEventListener('click', () => {
      const on = !Sound.on; Sound.set(on);
      $('#soundBtn').setAttribute('aria-pressed', String(on));
      $('#soundBtn').setAttribute('aria-label', on ? (I18N.lang === 'nl' ? 'Geluid aan. Zet geluid uit' : 'Sound on. Turn sound off') : (I18N.lang === 'nl' ? 'Geluid uit. Zet geluid aan' : 'Sound off. Turn sound on'));
      if (on) Sound.chirp(3);
    });
    $$('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  }
  function setLang(lang) {
    if (lang === I18N.lang) return;
    I18N.apply(lang); store.set('lang', lang);
    Shop.render(); Hero.relabel(); Pairing.rerender(); Checkout.rerender();
    if (!coarse.matches && !reduced.matches) initWeightPlay();
  }

  /* ---------- cookies + legal ---------- */
  function initCookies() {
    const c = $('#cookies');
    const choice = store.get('cookies', null);
    if (!choice) setTimeout(() => { c.hidden = false; if (hasGsap && !reduced.matches) gsap.from(c, { y: 40, opacity: 0, duration: .8, ease: 'expo.out' }); }, 1800);
    const save = v => { store.set('cookies', v); c.hidden = true; Util.toast(I18N.s().cookieSaved); };
    $('#cookieDecline').addEventListener('click', () => save('essential'));
    $('#cookieAccept').addEventListener('click', () => save('analytics'));   // no analytics are loaded yet [TBD]
    $('#cookieOpen').addEventListener('click', () => { c.hidden = false; $('#cookieDecline').focus(); });
  }
  function legal(which) {
    const L = I18N.s().legal, sh = DATA.shipping, m = Util.money;
    const tabs = Object.keys(L).map(k => `<button type="button" data-legal-tab="${k}" aria-current="${k === which}">${L[k].t}</button>`).join('');
    $('#legalBody').innerHTML = `<div class="legal-tabs">${tabs}</div><h2 id="legalTitle">${L[which].t}</h2>${L[which].body.replace('{ship}', m(sh.standardCents)).replace('{free}', m(sh.freeFromCents)).replace('{days}', sh.deliveryDays)}`;
  }
  function initLegal() {
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-legal]'); if (b) { legal(b.dataset.legal); Util.open($('#legal'), { trigger: b }); }
      const t = e.target.closest('[data-legal-tab]'); if (t) { legal(t.dataset.legalTab); $(`[data-legal-tab="${t.dataset.legalTab}"]`).focus(); }
    });
  }

  /* ---------- forms ---------- */
  function fieldError(input, msg) {
    const f = input.closest('.field'); let err = f.querySelector('.err');
    if (!err) { err = document.createElement('span'); err.className = 'err'; err.id = input.id + '-err'; err.setAttribute('aria-live', 'polite'); f.appendChild(err); input.setAttribute('aria-describedby', err.id); }
    if (msg) { f.setAttribute('data-invalid', ''); input.setAttribute('aria-invalid', 'true'); } else { f.removeAttribute('data-invalid'); input.removeAttribute('aria-invalid'); }
    err.textContent = msg || '';
  }
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  function initForms() {
    const rf = $('#retailForm');
    const checkR = i => { const bad = i.required && (!i.value.trim() || (i.type === 'email' && !emailOk(i.value))); fieldError(i, bad ? (i.type === 'email' && i.value ? I18N.s().co.err.email : I18N.s().co.err.required) : ''); return !bad; };
    rf.addEventListener('focusout', e => { if (e.target.matches('input[required], select[required]') && e.target.value) checkR(e.target); });
    rf.addEventListener('input', e => { if (e.target.closest('[data-invalid]')) checkR(e.target); });
    rf.addEventListener('submit', e => {
      e.preventDefault();
      const req = $$('input[required], select[required]', rf); let first = null;
      req.forEach(i => { if (!checkR(i) && !first) first = i; });
      if (first) { first.focus(); Util.toast(I18N.s().retailErr); return; }
      const ok = $('#retailSuccess'); ok.hidden = false; ok.focus();
      if (hasGsap && !reduced.matches) {
        gsap.from(ok, { opacity: 0, duration: .4 });
        gsap.fromTo(ok.querySelector('.envelope'), { y: 40, rotate: -12, scale: .6 }, { y: 0, rotate: 0, scale: 1, duration: 1, ease: 'elastic.out(1,.5)' });
        gsap.from(ok.querySelectorAll('h3, p'), { y: 16, opacity: 0, stagger: .1, delay: .3, duration: .8, ease: 'expo.out' });
      }
      Bird.happy(1200); Sound.melody();
    });
    const lf = $('#letterForm');
    lf.addEventListener('submit', e => {
      e.preventDefault();
      const em = $('#nlEmail'), ok = emailOk(em.value) && $('#nlConsent').checked;
      $('#letterMsg').textContent = ok ? I18N.s().letterOk : I18N.s().letterErr;
      fieldError(em, emailOk(em.value) ? '' : I18N.s().co.err.email);
      if (ok) { lf.reset(); Bird.happy(1200); Bird.hop(2); Sound.melody(); }
    });
  }

  /* ---------- the bird's facts, goodbye and bedtime ---------- */
  function initBirdMoments() {
    $('#facts').addEventListener('click', async e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act, s = I18N.s().bird;
      Bird.say(s[act], 2600);
      if (act === 'sleep') { Bird.sleep(true); setTimeout(() => Bird.sleep(false), 3200); }
      if (act === 'toss') Bird.toss();
      if (act === 'beak') Bird.showBeak();
      if (act === 'hop') Bird.hop(3);
      if (act === 'sing') { Sound.chirp(5); Bird.happy(1200); }
    });
    // wave goodbye at the newsletter; fall asleep if you linger at the very bottom
    let waved = false, sleepTimer = null, asleep = false;
    const letter = $('#letter');
    new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting && en.intersectionRatio > .55) { Bird.wave(true); if (!waved) { waved = true; setTimeout(() => Bird.say(I18N.s().bird.bye, 2400), 700); } setTimeout(() => Bird.wave(false), 2600); }
    }), { threshold: [0, .55, .8] }).observe(letter);
    addEventListener('scroll', () => {
      const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && !sleepTimer && !asleep) sleepTimer = setTimeout(() => { asleep = true; Bird.sleep(true); $('#footerSecret').textContent = I18N.s().bird.night; }, 5000);
      if (!atBottom) { clearTimeout(sleepTimer); sleepTimer = null; if (asleep) { asleep = false; Bird.sleep(false); $('#footerSecret').textContent = ''; } }
    }, { passive: true });
  }

  function init() {
    if (hasGsap) document.documentElement.classList.add('js');
    I18N.capture();
    $$('.split').forEach(h => Util.split(h));
    const lang = store.get('lang', 'en');
    if (lang === 'nl') I18N.apply('nl');
    initScroll();
    Bird.build();
    Hero.init();
    Origin.init();
    Nut.init();
    Shop.init();
    Checkout.init();
    Pairing.init();
    initReveals();
    initWeightPlay();
    initCursor();
    initControls();
    initCookies();
    initLegal();
    initForms();
    initBirdMoments();
    // the bird flies in and lands on the hero pack
    const s = Bird.state; s.x = innerWidth + 80; s.y = -60;
    setTimeout(() => {
      Bird.perchOn({ el: $('#heroPack'), fx: .64, fy: .035 }).then(() => setTimeout(() => Bird.say(I18N.s().bird.hello, 2600), 300));
      setInterval(perchManager, 220);
    }, reduced.matches ? 100 : 1100);
    if (window.ScrollTrigger) addEventListener('load', () => ScrollTrigger.refresh());
  }
  // perch at the end of a panel title (cart, product sheet, checkout)
  function birdTo(el) {
    if (!el) return;
    setTimeout(() => Bird.perchOn({ el, get: () => { const r = el.getBoundingClientRect(); const t = el.firstChild && el.firstChild.nodeType === 3 ? (() => { const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect(); })() : r; return { x: Math.min(t.right + Bird.state.size * .45, innerWidth - Bird.state.size * .5), y: t.bottom - 4 }; } }, { force: true }), 380);
  }
  function birdHome() { setTimeout(() => { const b = bestPerch(); if (b) Bird.perchOn(b, { force: true }); }, 300); }
  return { init, bestPerch, birdTo, birdHome, lenis: null };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.init); else App.init();
window.App = App;
