/* Multi-step checkout: details → shipping → payment → review → confirmation.
   Payment is a front-end mock. To go live, replace PaymentProvider.pay() with a
   redirect to Stripe Checkout (create a session server-side) or a Shopify Buy
   Button cart; it receives the order object built in review(). */
const PaymentProvider = {
  async pay(order) {
    await new Promise(r => setTimeout(r, 900));      // pretend to talk to the provider
    return { ok: true, orderNo: 'AR-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase() };
  },
};

const Checkout = (() => {
  const { $, $$, money, store } = Util;
  let step = 0;
  const data = Object.assign({ first: '', last: '', email: '', phone: '', postcode: '', house: '', addition: '', street: '', city: '', method: 'standard', pay: 'ideal', cardNo: '', exp: '', cvc: '', cardName: '', terms: false }, store.get('checkout', {}));
  delete data.cardNo; delete data.cvc; delete data.exp; delete data.terms; // never keep card data
  data.terms = false;

  const field = (id, label, opts = {}) => `
    <div class="field ${opts.full ? 'full' : ''}">
      <label for="co-${id}">${label}</label>
      <input id="co-${id}" name="${id}" value="${escapeHTML(data[id] || '')}" ${opts.type ? `type="${opts.type}"` : ''} ${opts.auto ? `autocomplete="${opts.auto}"` : ''} ${opts.mode ? `inputmode="${opts.mode}"` : ''} ${opts.req === false ? '' : 'required aria-required="true"'} ${opts.max ? `maxlength="${opts.max}"` : ''} aria-describedby="co-${id}-err ${opts.hint ? `co-${id}-hint` : ''}">
      ${opts.hint ? `<span class="hint" id="co-${id}-hint">${opts.hint}</span>` : ''}
      <span class="err" id="co-${id}-err" aria-live="polite"></span>
    </div>`;

  // validators return an error key or ''
  const luhn = n => { const d = n.replace(/\D/g, ''); if (d.length < 12 || d.length > 19) return false; let s = 0; for (let i = 0; i < d.length; i++) { let x = +d[d.length - 1 - i]; if (i % 2) { x *= 2; if (x > 9) x -= 9; } s += x; } return s % 10 === 0; };
  const V = {
    first: v => (v.trim() ? '' : 'required'), last: v => (v.trim() ? '' : 'required'),
    email: v => (!v.trim() ? 'required' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'email'),
    phone: v => (!v.trim() || /^[+\d][\d\s-]{5,}$/.test(v.trim()) ? '' : 'phone'),
    postcode: v => (!v.trim() ? 'required' : /^[1-9]\d{3}\s?[a-zA-Z]{2}$/.test(v.trim()) ? '' : 'postcode'),
    house: v => (!v.trim() ? 'required' : /^\d{1,5}$/.test(v.trim()) ? '' : 'house'),
    addition: () => '', street: v => (v.trim() ? '' : 'required'), city: v => (v.trim() ? '' : 'required'),
    cardNo: v => (data.pay !== 'card' ? '' : !v.trim() ? 'required' : luhn(v) ? '' : 'card'),
    exp: v => {
      if (data.pay !== 'card') return ''; if (!v.trim()) return 'required';
      const m = v.match(/^(\d{2})\s*\/\s*(\d{2})$/); if (!m || +m[1] < 1 || +m[1] > 12) return 'exp';
      const end = new Date(2000 + +m[2], +m[1], 1); return end > new Date() ? '' : 'exp';
    },
    cvc: v => (data.pay !== 'card' ? '' : !v.trim() ? 'required' : /^\d{3,4}$/.test(v.trim()) ? '' : 'cvc'),
    cardName: v => (data.pay !== 'card' ? '' : v.trim() ? '' : 'required'),
  };
  function check(input, show = true) {
    const name = input.name, v = V[name]; if (!v) return true;
    data[name] = input.value;
    const err = v(input.value), f = input.closest('.field'), msg = $(`#co-${name}-err`);
    if (err && show) { f.setAttribute('data-invalid', ''); input.setAttribute('aria-invalid', 'true'); msg.textContent = I18N.s().co.err[err]; }
    if (!err) { f.removeAttribute('data-invalid'); input.removeAttribute('aria-invalid'); msg.textContent = ''; }
    return !err;
  }

  function stepHTML() {
    const s = I18N.s(), c = s.co;
    if (step === 0) return `<div class="co-step"><h3>${c.details}</h3><div class="co-grid">
      ${field('first', c.first, { auto: 'given-name' })}${field('last', c.last, { auto: 'family-name' })}
      ${field('email', c.email, { type: 'email', auto: 'email', full: true, mode: 'email' })}
      ${field('phone', c.phone, { type: 'tel', auto: 'tel', full: true, req: false, hint: c.phoneHint, mode: 'tel' })}</div></div>`;
    if (step === 1) return `<div class="co-step"><h3>${c.shipTo}</h3><div class="co-grid">
      ${field('postcode', c.postcode, { auto: 'postal-code', max: 7 })}${field('house', c.house, { mode: 'numeric', max: 5 })}
      ${field('addition', c.addition, { req: false, max: 6 })}${field('street', c.street, { auto: 'address-line1' })}
      ${field('city', c.city, { auto: 'address-level2', full: true })}</div>
      <fieldset class="field" style="margin-top:6px"><legend>${c.country}</legend><div class="radio-cards">
        <label><input type="radio" name="country" value="NL" checked><span>${c.nl}</span><span></span></label>
        ${DATA.shipping.laterCountries.map(k => `<label><input type="radio" name="country" value="${k}" disabled><span>${k}<span class="rc-s">${c.later}</span></span><span></span></label>`).join('')}
      </div></fieldset>
      <fieldset class="field"><legend>${c.method}</legend><div class="radio-cards">
        <label><input type="radio" name="method" value="standard" checked><span>${c.standard}<span class="rc-s">${c.standardSub(DATA.shipping.deliveryDays)}</span></span><span class="price" style="font-size:1rem">${Cart.shipping() ? money(Cart.shipping()) : s.free}</span></label>
      </div></fieldset></div>`;
    if (step === 2) return `<div class="co-step"><h3>${c.pay}</h3>
      <p class="demo-note" role="note">${c.demo}</p>
      <div class="radio-cards" role="radiogroup" aria-label="${c.pay}">
        <label><input type="radio" name="pay" value="ideal" ${data.pay === 'ideal' ? 'checked' : ''}><span>${c.ideal}<span class="rc-s">${c.idealSub}</span></span><span></span></label>
        <label><input type="radio" name="pay" value="card" ${data.pay === 'card' ? 'checked' : ''}><span>${c.card}<span class="rc-s">${c.cardSub}</span></span><span></span></label>
      </div>
      <div class="co-grid" id="cardFields" ${data.pay === 'card' ? '' : 'hidden'}>
        ${field('cardNo', c.cardNo, { auto: 'cc-number', mode: 'numeric', full: true, max: 23 })}
        ${field('exp', c.exp, { auto: 'cc-exp', max: 7 })}${field('cvc', c.cvc, { auto: 'cc-csc', mode: 'numeric', max: 4 })}
        ${field('cardName', c.nameOnCard, { auto: 'cc-name', full: true })}
      </div></div>`;
    if (step === 3) {
      const L = I18N.lang;
      return `<div class="co-step"><h3>${c.review}</h3>
        <div class="review-block"><h4>${c.details}</h4><p>${escapeHTML(data.first)} ${escapeHTML(data.last)}<br>${escapeHTML(data.email)}${data.phone ? '<br>' + escapeHTML(data.phone) : ''}</p><button type="button" data-goto="0">${c.edit}</button></div>
        <div class="review-block"><h4>${c.shipTo}</h4><p>${escapeHTML(data.street)} ${escapeHTML(data.house)}${data.addition ? ' ' + escapeHTML(data.addition) : ''}<br>${escapeHTML(data.postcode.toUpperCase())} ${escapeHTML(data.city)}<br>${c.nl} · ${c.standard}</p><button type="button" data-goto="1">${c.edit}</button></div>
        <div class="review-block"><h4>${c.pay}</h4><p>${data.pay === 'card' ? `${c.card} •••• ${escapeHTML(data.cardNo.replace(/\D/g, '').slice(-4))}` : c.ideal}</p><button type="button" data-goto="2">${c.edit}</button></div>
        <p class="small muted">${c.withdraw}</p>
        <label class="check" id="termsWrap"><input type="checkbox" id="co-terms" name="terms" aria-describedby="co-terms-err"> <span>${c.terms}</span></label>
        <span class="err" id="co-terms-err" aria-live="polite" style="color:var(--error);font-size:.85rem"></span>
      </div>`;
    }
  }
  function navHTML() {
    const c = I18N.s().co;
    return `<div class="co-nav">
      ${step > 0 ? `<button type="button" class="btn btn-line" data-back>${c.back}</button>` : '<span></span>'}
      <button type="submit" class="btn btn-solid magnetic" id="coNext">${step === 3 ? `${c.place} · ${money(Cart.total())}` : c.next}</button>
    </div>`;
  }
  function summary() {
    const s = I18N.s();
    const wide = !window.matchMedia('(max-width: 820px)').matches;
    $('#coSummary').innerHTML = `<details class="co-sum-d" ${wide ? 'open' : ''}><summary><h3>${s.co.summary}</h3><span class="co-sum-total">${money(Cart.total())}</span></summary>
      <ul>${Cart.lines.map(l => `<li><span>${l.qty} × ${Cart.lineName(l)}${l.sub ? ' · ' + s.monthly : ''}</span><span>${money(Cart.unit(l) * l.qty)}</span></li>`).join('')}</ul>
      <dl class="totals">${Cart.totalsHTML()}</dl></details>`;
  }

  function render(dir = 1) {
    const form = $('#coForm');
    const paint = () => {
      form.innerHTML = stepHTML() + navHTML();
      $$('#coSteps li').forEach((li, i) => { li.className = i < step ? 'done' : i === step ? 'now' : ''; if (i === step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
      summary();
      const first = form.querySelector('input:not([type=radio]):not([disabled])');
      if (first && step < 3) setTimeout(() => first.focus({ preventScroll: true }), 50);
    };
    if (window.gsap && !Util.reduced.matches && form.children.length) {
      gsap.to(form, { x: -30 * dir, opacity: 0, duration: .22, ease: 'power2.in', onComplete: () => { paint(); gsap.fromTo(form, { x: 30 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: .5, ease: 'expo.out' }); } });
    } else paint();
    $('#checkout').scrollTop = 0;
  }

  function validStep() {
    const inputs = $$('#coForm input').filter(i => V[i.name]);
    let ok = true, firstBad = null;
    inputs.forEach(i => { if (!check(i)) { ok = false; firstBad = firstBad || i; } });
    if (firstBad) firstBad.focus();
    return ok;
  }

  async function place() {
    const t = $('#co-terms');
    if (!t.checked) { $('#co-terms-err').textContent = I18N.s().co.err.terms; t.focus(); return; }
    const btn = $('#coNext'); btn.disabled = true; btn.textContent = '…';
    const order = { lines: Cart.lines, totalCents: Cart.total(), customer: { ...data, cardNo: undefined, cvc: undefined } };
    const res = await PaymentProvider.pay(order);
    if (res.ok) confirm(res.orderNo);
  }
  function confirm(no) {
    const s = I18N.s(), c = s.co;
    $('#coSteps').hidden = true; $('#coSummary').hidden = true;
    const items = Cart.lines.map(l => `<li><span>${l.qty} × ${Cart.lineName(l)}${l.sub ? ' · ' + s.monthly : ''}</span><span>${money(Cart.unit(l) * l.qty)}</span></li>`).join('');
    const total = money(Cart.total());
    $('#coForm').innerHTML = `<div class="confirm">
      <div class="confirm-perch" id="confirmPerch"></div>
      <h3>${c.thanks}</h3>
      <p class="order-no">${no}</p>
      <p>${c.confirmP(no)}</p>
      <div class="receipt">
        <div class="receipt-route" aria-hidden="true">
          <svg viewBox="0 0 400 70" preserveAspectRatio="none"><path id="rrPath" d="M8 58C120 -10 280 -10 392 40" fill="none" stroke="#f6d641" stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round"/><circle cx="8" cy="58" r="5" fill="#e88028"/><circle cx="392" cy="40" r="5" fill="#e88028"/></svg>
          <div class="rr-labels"><span>Santa Cruz do Sul</span><span>${escapeHTML(data.city)}</span></div>
        </div>
        <div class="receipt-body">
          <ul>${items}</ul>
          <div class="grand-row"><span>${s.total}</span><span>${total}</span></div>
          <p class="to">${escapeHTML(data.street)} ${escapeHTML(data.house)}${data.addition ? ' ' + escapeHTML(data.addition) : ''}, ${escapeHTML(data.postcode.toUpperCase())} ${escapeHTML(data.city)} · ${s.shipDays(DATA.shipping.deliveryDays)} <span class="tbd">[TBD]</span></p>
        </div>
      </div>
      <button type="button" class="btn btn-solid magnetic" id="coDone">${c.again}</button></div>`;
    $('#coForm').style.gridColumn = '1 / -1';
    if (window.gsap && !Util.reduced.matches) {
      const p = $('#rrPath'), len = 420;
      gsap.fromTo(p, { strokeDashoffset: len, strokeDasharray: `${len}` }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', delay: .4, onComplete: () => p.setAttribute('stroke-dasharray', '3 7') });
      gsap.from('.confirm > *:not(.confirm-perch)', { y: 26, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08 });
    }
    Cart.clear();
    $('#coDone').onclick = () => Util.close($('#checkout'));
    $('#coDone').focus();
    const perchEl = $('#confirmPerch');
    Bird.perchOn({ el: perchEl, fx: .5, fy: 1 }, { force: true }).then(() => Bird.celebrate());
  }

  function bind() {
    const form = $('#coForm');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (step === 3) { place(); return; }
      if (!validStep()) return;
      store.set('checkout', { first: data.first, last: data.last, email: data.email, phone: data.phone, postcode: data.postcode, house: data.house, addition: data.addition, street: data.street, city: data.city });
      step++; render(1);
    });
    form.addEventListener('click', e => {
      if (e.target.closest('[data-back]')) { step--; render(-1); }
      const g = e.target.closest('[data-goto]'); if (g) { const to = +g.dataset.goto; step = to; render(-1); }
    });
    // blur-first validation; errors clear as soon as the value is fixed
    form.addEventListener('focusout', e => { if (e.target.matches('input') && e.target.value) check(e.target); });
    form.addEventListener('input', e => {
      const i = e.target;
      if (i.name === 'cardNo') { const p = i.selectionStart, before = i.value.length; i.value = i.value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 '); i.setSelectionRange(p + i.value.length - before, p + i.value.length - before); }
      if (i.name === 'exp' && /^\d{2}$/.test(i.value) && !e.inputType?.startsWith('delete')) i.value += '/';
      if (i.name === 'postcode') i.value = i.value.toUpperCase();
      if (i.closest('[data-invalid]')) check(i);
      else if (V[i.name]) data[i.name] = i.value;
      if (i.name === 'pay') { data.pay = i.value; $('#cardFields').hidden = i.value !== 'card'; }
      if (i.id === 'co-terms') $('#co-terms-err').textContent = '';
    });
  }
  function open() {
    if (!Cart.lines.length) return;
    step = 0; $('#coSteps').hidden = false; $('#coSummary').hidden = false; $('#coForm').style.gridColumn = '';
    $('#coForm').innerHTML = '';
    render();
    Util.close($('#cart'));
    Util.open($('#checkout'), { onClose: App.birdHome });
    App.birdTo($('#coTitle'));
  }
  return { init: () => { bind(); $('#toCheckout').addEventListener('click', open); }, open, rerender: () => { if (Util.isOpen($('#checkout')) && !$('#coSteps').hidden) render(0); } };
})();
