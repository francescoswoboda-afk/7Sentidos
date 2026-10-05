// 7 Sentidos: shared data, components and bag. Loaded on every page.

const FLAVOURS = {
  "chocolate": {
    name: "Chocolate",
    description: "Deep, dark and a little bitter. The buttery pecan does the rest.",
    pairing: "Tawny port, or a strong espresso",
    label: {
      logo: "vlogo-choc.png", field: "#300602", origin: "#EED3AF",
      strip: "#D1793A", stripText: "#300602",
      band: "#AD3D25", bandPattern: 0.22, bandFilter: "brightness(0)", bandText: "#FBE6C4",
      box: "#EED3AF", boxText: "#300602",
    },
  },
  "chocolate-sea-salt": {
    name: "Chocolate & sea salt",
    description: "The same chocolate, finished with flakes of sea salt that crackle first.",
    pairing: "A bold red and aged Gouda",
    label: {
      logo: "vlogo-orange.png", field: "#005656", origin: "#FFF1D8",
      strip: "#003B3D", stripText: "#FFF1D8",
      band: "#00E1E1", bandPattern: 0.4, bandFilter: "none", bandText: "#003B3D",
      box: "#005656", boxText: "#FFFFFF",
    },
  },
  "caramel": {
    name: "Caramel",
    description: "Slow-cooked caramel that sets into a thin, glassy shell.",
    pairing: "Brie, or a young goat's cheese",
    label: {
      logo: "vlogo-cream.png", field: "#EED3AF", origin: "#542821",
      strip: "#542821", stripText: "#EED3AF",
      band: "#DA6B20", bandPattern: 0.25, bandFilter: "none", bandText: "#300602",
      box: "#542821", boxText: "#FFF1D8",
    },
  },
  "salted-caramel": {
    name: "Salted caramel",
    description: "Sweet, then salty, then sweet again. The one people buy twice.",
    pairing: "Blue cheese and a sweet white",
    label: {
      logo: "vlogo-orange.png", field: "#FF9B00", origin: "#003B3D",
      strip: "#005656", stripText: "#FFF1D8",
      band: "#D7E100", bandPattern: 0.4, bandFilter: "none", bandText: "#005656",
      box: "#005656", boxText: "#FFFFFF",
    },
  },
};

// Everything that can go in the bag. Prices in cents.
const PRODUCTS = {
  ...Object.fromEntries(Object.entries(FLAVOURS).map(([id, f]) => [id, {
    name: f.name, price: 595, detail: "100 g bag, €5,95", thumb: id,
  }])),
  "tasting-set": {
    name: "Tasting set", price: 2200, detail: "One bag of each flavour, 400 g, €22,00", thumb: "chocolate-sea-salt",
  },
};

const MAX_QTY = 20;

// Lets CSS hide scroll-reveal content only when this script is running to reveal it
document.documentElement.classList.add("js");

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Restart a one-shot CSS animation class on an element
function replay(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

const formatPrice = (cents) => "€" + (cents / 100).toFixed(2).replace(".", ",");

const escapeHTML = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* Bag: { productId: quantity }, kept in localStorage so it carries across pages */

const bag = {
  key: "7sentidos-bag",
  read() {
    try {
      const data = JSON.parse(localStorage.getItem(this.key)) || {};
      return Object.fromEntries(Object.entries(data).filter(([id, qty]) => PRODUCTS[id] && qty > 0));
    } catch {
      return {};
    }
  },
  write(data) {
    try { localStorage.setItem(this.key, JSON.stringify(data)); } catch { /* storage blocked */ }
    document.dispatchEvent(new CustomEvent("bag:change"));
  },
  add(id, qty = 1) {
    const data = this.read();
    data[id] = Math.min(MAX_QTY, (data[id] || 0) + qty);
    this.write(data);
  },
  set(id, qty) {
    const data = this.read();
    if (qty <= 0) delete data[id];
    else data[id] = Math.min(MAX_QTY, qty);
    this.write(data);
  },
  count() {
    return Object.values(this.read()).reduce((sum, qty) => sum + qty, 0);
  },
};

/* <site-header current="about"> */

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute("current");
    const link = (href, id, text) =>
      `<a href="${href}"${current === id ? ' aria-current="page"' : ""}>${text}</a>`;

    this.innerHTML = `
      <header class="site-header">
        <div class="wrap">
          <a class="site-header__logo" href="index.html"><img src="design/assets/logo-cream.png" alt="7 Sentidos Super Foods, home" width="137" height="58"></a>
          <nav aria-label="Main">
            ${link("flavour.html", "flavour", "Flavours")}
            ${link("about.html", "about", "About us")}
            ${link("where-to-buy.html", "where-to-buy", "Where to buy")}
            <a class="btn btn--orange" href="bag.html"${current === "bag" ? ' aria-current="page"' : ""}>Bag<span data-bag-count></span></a>
          </nav>
        </div>
      </header>`;

    this.updateCount();
    document.addEventListener("bag:change", () => this.updateCount());
    window.addEventListener("storage", () => this.updateCount());
  }

  updateCount() {
    const count = bag.count();
    this.querySelector("[data-bag-count]").textContent = count ? ` (${count})` : "";
    if (this.lastCount !== undefined && count > this.lastCount) {
      replay(this.querySelector(".btn"), "is-bumped");
    }
    this.lastCount = count;
  }
}

/* <site-footer> */

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer">
        <div class="claim-strip">El Porvenir Farms | Santa Cruz do Sul - Brazil</div>
        <div class="wrap site-footer__main">
          <div class="site-footer__brand">
            <a href="index.html"><img src="design/assets/logo-cream.png" alt="7 Sentidos Super Foods, home" width="245" height="104"></a>
            <p>Brazilian pecans dipped in chocolate and caramel by a father and son.</p>
          </div>
          <div class="site-footer__col">
            <a href="flavour.html">Flavours</a>
            <a href="about.html">About us</a>
            <a href="where-to-buy.html">Where to buy</a>
          </div>
          <div class="site-footer__col">
            <a href="mailto:hallo@7sentidos.nl">hallo@7sentidos.nl</a>
            <span>Instagram</span>
            <span>Contains nuts and milk</span>
            <span>KvK [your KvK number]</span>
          </div>
        </div>
      </footer>`;
  }
}

/* <flavour-label flavour="caramel">: the packaging label, scales with its width */

class FlavourLabel extends HTMLElement {
  static observedAttributes = ["flavour"];

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const flavour = FLAVOURS[this.getAttribute("flavour")];
    if (!flavour) return;
    const l = flavour.label;
    const style = [
      `--field:${l.field}`, `--origin:${l.origin}`, `--strip:${l.strip}`, `--strip-text:${l.stripText}`,
      `--band:${l.band}`, `--band-pattern:${l.bandPattern}`, `--band-filter:${l.bandFilter}`,
      `--band-text:${l.bandText}`, `--box:${l.box}`, `--box-text:${l.boxText}`,
    ].join(";");

    this.innerHTML = `
      <div class="label" role="img" aria-label="7 Sentidos ${escapeHTML(flavour.name)} label" style="${style}">
        <img class="label__logo" src="design/assets/${l.logo}" alt="">
        <div class="label__origin" aria-hidden="true">El Porvenir Farms | Santa Cruz do Sul - Brazil</div>
        <div class="label__strip" aria-hidden="true">Nature wonders</div>
        <div class="label__band" aria-hidden="true">
          <div class="label__nuts">Brazilian<br>pecan nuts</div>
          <div class="label__box-row"><div class="label__box">${escapeHTML(flavour.name)}</div></div>
        </div>
      </div>`;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
customElements.define("flavour-label", FlavourLabel);

/* Any link with data-add="productId" adds to the bag, then follows its href (the bag page) */

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-add]");
  if (!trigger) return;
  bag.add(trigger.dataset.add);
});

/* A flavour card on Home hands its label to the flavour page, so it flies into place */

document.addEventListener("click", (event) => {
  const card = event.target.closest(".flavour-card > a");
  if (!card) return;
  card.querySelector("flavour-label").style.viewTransitionName = "product-label";
});

// Clear it again if the page comes back from the back/forward cache
window.addEventListener("pageshow", () => {
  document.querySelectorAll(".flavour-card flavour-label").forEach((l) => { l.style.viewTransitionName = ""; });
});

/* Scroll reveal: [data-reveal] containers get .is-in once they are on screen */

document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  targets.forEach((el) => observer.observe(el));
});

/* Quantity stepper: <div class="stepper"><button data-step="-1"> <output> <button data-step="1"> */

function stepper(root, { value = 1, min = 1, max = MAX_QTY, onChange }) {
  const output = root.querySelector("output");
  const minus = root.querySelector('[data-step="-1"]');
  const plus = root.querySelector('[data-step="1"]');

  const render = () => {
    output.textContent = value;
    minus.disabled = value <= min;
    plus.disabled = value >= max;
  };

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-step]");
    if (!button) return;
    value = Math.min(max, Math.max(min, value + Number(button.dataset.step)));
    render();
    onChange?.(value);
  });

  render();
  return { get value() { return value; } };
}
