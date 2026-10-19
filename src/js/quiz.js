/* Flavour finder: four questions, then crack the pecan to reveal your flavour.
   Questions and scoring live in DATA.quiz (data.js). */
const Quiz = (() => {
  const { $ } = Util;
  const T = {
    en: { done: 'All four answered', of: (a, b) => `Question ${a} of ${b}`, back: 'Back', ready: 'Your pecan is ready.', crack: 'Crack it open to see your flavour.', show: 'Just show me', again: 'Start over', yours: 'Your flavour', also: n => `Also try: ${n}`, hint: 'Crack it to see your flavour', pick: 'Answer the questions first, or crack a few for fun' },
    nl: { done: 'Alle vier beantwoord', of: (a, b) => `Vraag ${a} van ${b}`, back: 'Terug', ready: 'Je pecan is klaar.', crack: 'Kraak hem open en zie je smaak.', show: 'Laat maar zien', again: 'Opnieuw', yours: 'Jouw smaak', also: n => `Probeer ook: ${n}`, hint: 'Kraak hem en zie je smaak', pick: 'Beantwoord eerst de vragen, of kraak er een paar voor de lol' },
  };
  const t = () => T[I18N.lang] || T.en;
  let step = 0, answers = [], ready = false, revealed = false;
  const Q = () => DATA.quiz.questions;

  function scores() {
    const s = {}; DATA.flavours.forEach(f => (s[f.id] = 0));
    answers.forEach((a, i) => Object.entries(Q()[i].options[a].pts).forEach(([id, p]) => (s[id] += p)));
    return DATA.flavours.map(f => ({ f, p: s[f.id] })).sort((a, b) => b.p - a.p);   // stable: ties keep data order
  }

  function render(dir = 1) {
    const card = $('#quizCard'), L = I18N.lang, s = t();
    let html;
    if (!ready) {
      const q = Q()[step];
      html = `<p class="quiz-step">${s.of(step + 1, Q().length)}</p>
        <div class="quiz-dots" aria-hidden="true">${Q().map((_, i) => `<span class="${i < step ? 'done' : i === step ? 'now' : ''}"></span>`).join('')}</div>
        <h3 class="quiz-q" tabindex="-1">${q.q[L]}</h3>
        <div class="quiz-opts">${q.options.map((o, i) => `<button type="button" class="quiz-opt" data-a="${i}" aria-pressed="${answers[step] === i}">${o.t[L]}</button>`).join('')}</div>
        ${step > 0 ? `<button type="button" class="quiz-link" data-quiz="back">← ${s.back}</button>` : ''}`;
    } else {
      const res = revealed ? scores() : null;
      html = revealed
        ? `<p class="quiz-step">${s.yours}</p><h3 class="quiz-q" tabindex="-1">${fname(res[0].f)}</h3>
           <p class="quiz-you">${DATA.quiz.you[res[0].f.id][L]}</p>
           <p class="quiz-also">${s.also(fname(res[1].f))}</p>
           <button type="button" class="quiz-link" data-quiz="again">↺ ${s.again}</button>`
        : `<p class="quiz-step">${s.done}</p><h3 class="quiz-q" tabindex="-1">${s.ready}</h3><p class="quiz-you">${s.crack}</p>
           <div class="quiz-row"><button type="button" class="btn btn-line btn-sm" data-quiz="show">${s.show}</button><button type="button" class="quiz-link" data-quiz="again">↺ ${s.again}</button></div>`;
    }
    const paint = () => { card.innerHTML = html; const h = card.querySelector('.quiz-q'); if (h && document.activeElement && card.contains(document.activeElement) === false && card.dataset.focus) h.focus({ preventScroll: true }); };
    if (window.gsap && !Util.reduced.matches && card.children.length) {
      gsap.to(card, { x: -24 * dir, opacity: 0, duration: .18, ease: 'power2.in', onComplete: () => { paint(); gsap.fromTo(card, { x: 24 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: 'expo.out' }); } });
    } else paint();
    $('#nutHint').textContent = ready && !revealed ? s.hint : I18N.lang === 'nl' ? NL['nut.hint'] : I18N.en['nut.hint'];
  }

  function reveal() {
    if (!ready || revealed) return;
    revealed = true;
    const [top] = scores(), f = top.f, s = t(), L = I18N.lang;
    World.set(f, { duration: 1 });
    const box = $('#quizReveal');
    box.innerHTML = `<p class="pr-eyebrow">${s.yours}</p>
      <img class="pack-mini" src="${f.img.perched}" alt="${fname(f)} pack">
      <h3>${fname(f)}</h3>
      <p class="why">${DATA.quiz.you[f.id][L]}</p>
      <div class="row"><span class="price">${Util.priceHTML(f.priceCents)}</span><button type="button" class="btn btn-solid magnetic" data-add="${f.id}">${I18N.s().addToCart}</button><button type="button" class="btn btn-line" data-detail="${f.id}">${I18N.s().details}</button></div>`;
    box.hidden = false;
    $('#nutHint').style.visibility = 'hidden';
    if (window.gsap && !Util.reduced.matches) {
      gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: .5 });
      gsap.from(box.querySelector('.pack-mini'), { y: 50, scale: .5, rotate: -12, duration: 1, ease: 'back.out(1.8)' });
      gsap.from(box.querySelectorAll('h3, .why, .row'), { y: 16, opacity: 0, duration: .7, ease: 'expo.out', stagger: .08, delay: .2 });
    }
    Sound.melody(); Bird.happy(1200); Bird.hop(2);
    render(1);
  }

  function reset() {
    step = 0; answers = []; ready = false; revealed = false;
    $('#quizReveal').hidden = true; $('#nutHint').style.visibility = ''; Nut.special(false);
    render(-1);
  }

  function init() {
    $('#quizCard').addEventListener('click', e => {
      const o = e.target.closest('[data-a]'), q = e.target.closest('[data-quiz]');
      $('#quizCard').dataset.focus = '1';
      if (o) {
        answers[step] = +o.dataset.a;
        if (step < Q().length - 1) { step++; render(1); }
        else { ready = true; Nut.special(true); render(1); }
        Sound.pluck(523 + step * 60);
      }
      if (q?.dataset.quiz === 'back' && step > 0) { step--; render(-1); }
      if (q?.dataset.quiz === 'again') reset();
      if (q?.dataset.quiz === 'show') reveal();
    });
    $('#quizReveal').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.hidden = true; });
    // cracking the "ready" pecan reveals the result once the kernel has popped out
    Nut.onCrack(() => { if (ready && !revealed) setTimeout(reveal, 650); });
    render();
  }
  return { init, rerender: () => { if (revealed) { revealed = false; reveal(); } else render(0); } };
})();
