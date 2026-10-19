/* =====================================================================
   ARAÇARI SHOP DATA
   Everything the shop sells lives here. Change a price, add a flavour or
   adjust shipping in this one object; nothing else needs editing.

   - Prices are in euro cents, VAT included. 595 = €5,95.
   - Every price below is a PLACEHOLDER copied from the old 7 Sentidos
     price list. The site shows a [TBD] tag next to every price while
     `pricesConfirmed` is false. Set it to true once the real prices are in.
   - Text fields marked [TBD] are shown on the site as visible placeholders.
   - To add a flavour: copy one entry in `flavours`, give it a new `id`,
     its pack colours and its two pack images (perched + flying, 600 px webp
     in src/assets/), then run `npm run build`.
   ===================================================================== */
const DATA = {
  brand: 'Araçari',              // name is still being surveyed; change it here
  tagline: 'Wildly good pecans',
  // El Porvenir is the family's own farm, but not every pecan comes from it: partner farms
  // with the same practices supply the rest. Never present El Porvenir as the producer of all products.
  // Do not use "organic", "bio" or "eco" anywhere until the EU organic certificate is in place.
  farm: 'El Porvenir, Monte Alverne, Santa Cruz do Sul, Brazil',   // [VERIFY]
  partnerFarms: '[TBD]',          // names and regions of the partner farms
  origin: 'Brazil',
  packSizeG: 100,
  currency: 'EUR',
  pricesConfirmed: false,        // false = show a [TBD] tag on every price

  /* ---------------- Shipping (Netherlands first, Europe later) ------- */
  shipping: {
    country: 'NL',
    standardCents: 495,          // [TBD] placeholder
    freeFromCents: 3500,         // [TBD] placeholder: free shipping from €35
    deliveryDays: '1–2',         // [TBD] working days
    carrier: '[TBD]',
    laterCountries: ['BE', 'DE', 'FR'], // shown as "coming later"
  },
  vat: { foodRatePercent: 9, note: '[VERIFY] 9% is the Dutch VAT rate for food' },

  /* ---------------- Flavours ----------------------------------------
     colors come straight from the packs (design/flavours.json):
       body  = pouch colour, strip = the dark strip, band = bottom swirl band,
       label = the small flavour label and its text colour.
     taste is used by the cart upsell and the pairing tool.               */
  flavours: [
    { id: 'salted-caramel', status: 'core', taste: 'salty-sweet',
      name: { en: 'Salted caramel', nl: 'Gezouten karamel' },
      colors: { body: '#e88028', strip: '#285c69', band: '#c1d04a', label: '#13333a', labelInk: '#f4fbc4' },
      notes: ['slow roasted', 'real sea salt', 'glassy caramel'],
      img: { perched: 'assets/salted-caramel-perched.webp', flying: 'assets/salted-caramel-flying.webp' },
      priceCents: 595 },
    { id: 'chocolate', status: 'core', taste: 'rich',
      name: { en: 'Chocolate', nl: 'Chocolade' },
      colors: { body: '#4a221a', strip: '#a8662c', band: '#b4472b', label: '#fbefd6', labelInk: '#3b1713' },
      notes: ['slow roasted', 'dark chocolate', 'hand dipped'],
      img: { perched: 'assets/chocolate-perched.webp', flying: 'assets/chocolate-flying.webp' },
      priceCents: 595 },
    { id: 'chocolate-sea-salt', status: 'core', taste: 'salty-rich',
      name: { en: 'Chocolate & sea salt', nl: 'Chocolade & zeezout' },
      colors: { body: '#1f5a5c', strip: '#113a3c', band: '#63d8da', label: '#143f41', labelInk: '#d7f7f6' },
      notes: ['slow roasted', 'real sea salt', 'dark chocolate'],
      img: { perched: 'assets/chocolate-sea-salt-perched.webp', flying: 'assets/chocolate-sea-salt-flying.webp' },
      priceCents: 595 },
    { id: 'caramel', status: 'core', taste: 'sweet',
      name: { en: 'Caramel', nl: 'Karamel' },
      colors: { body: '#e6d2a8', strip: '#4b2a1a', band: '#e17c20', label: '#46210f', labelInk: '#fbefd6' },
      notes: ['slow roasted', 'golden caramel', 'glassy shell'],
      img: { perched: 'assets/caramel-perched.webp', flying: 'assets/caramel-flying.webp' },
      priceCents: 595 },
    { id: 'doce-de-leite', status: 'concept', taste: 'sweet',
      name: { en: 'Doce de leite', nl: 'Doce de leite' },
      colors: { body: '#c08243', strip: '#5a2f17', band: '#f2dfb6', label: '#5a2f17', labelInk: '#fbefd6' },
      notes: ['slow roasted', 'doce de leite', 'half dipped'],
      img: { perched: 'assets/doce-de-leite-perched.webp', flying: 'assets/doce-de-leite-flying.webp' },
      priceCents: 595 },
    { id: 'cinnamon-sugar', status: 'concept', taste: 'spiced',
      name: { en: 'Cinnamon sugar', nl: 'Kaneelsuiker' },
      colors: { body: '#93301f', strip: '#4a1410', band: '#f2b46a', label: '#4a1410', labelInk: '#fbefd6' },
      notes: ['slow roasted', 'real cinnamon', 'sugar crust'],
      img: { perched: 'assets/cinnamon-sugar-perched.webp', flying: 'assets/cinnamon-sugar-flying.webp' },
      priceCents: 595 },
    { id: 'coffee-chocolate', status: 'concept', taste: 'rich',
      name: { en: 'Coffee & chocolate', nl: 'Koffie & chocolade' },
      colors: { body: '#33201a', strip: '#a67a3c', band: '#7d4a2c', label: '#fbefd6', labelInk: '#2e1d18' },
      notes: ['slow roasted', 'real coffee', 'dark chocolate'],
      img: { perched: 'assets/coffee-chocolate-perched.webp', flying: 'assets/coffee-chocolate-flying.webp' },
      priceCents: 595 },
    { id: 'honey-sea-salt', status: 'concept', taste: 'salty-sweet',
      name: { en: 'Honey & sea salt', nl: 'Honing & zeezout' },
      colors: { body: '#e0a00c', strip: '#6a4208', band: '#fff0b0', label: '#6a4208', labelInk: '#fff3c4' },
      notes: ['slow roasted', 'real sea salt', 'golden honey'],
      img: { perched: 'assets/honey-sea-salt-perched.webp', flying: 'assets/honey-sea-salt-flying.webp' },
      priceCents: 595 },
  ],

  /* Shown on every product. Ingredients and traces are not known yet. */
  productInfo: {
    allergen: { en: 'Contains tree nuts (pecans).', nl: 'Bevat noten (pecannoten).' },
    ingredients: '[TBD]',
    traces: '[TBD]',
    storage: '[TBD]',
    shelfLife: '[TBD]',
    // per 100 g; values not supplied yet
    nutrition: [
      ['energy', '[TBD] kJ / [TBD] kcal'], ['fat', '[TBD] g'], ['saturates', '[TBD] g'],
      ['carbs', '[TBD] g'], ['sugars', '[TBD] g'], ['fibre', '[TBD] g'], ['protein', '[TBD] g'], ['salt', '[TBD] g'],
    ],
  },

  /* Subscription: a fresh pack every month. Discount is a placeholder. */
  subscription: { enabled: true, discountPercent: 10 /* [TBD] */ },

  /* ---------------- Bundles ---------------------------------------- */
  bundles: [
    { id: 'tasting-box', kind: 'tasting',
      name: { en: 'The tasting box', nl: 'De proefdoos' },
      blurb: { en: 'One pack of every flavour. Eight colours, eight moods, one table.', nl: 'Eén zak van elke smaak. Acht kleuren, acht stemmingen, één tafel.' },
      contents: 'all',            // every flavour above
      priceCents: 4400 },         // [TBD] placeholder (8 × €5,95 = €47,60)
    { id: 'wine-night', kind: 'wine',
      name: { en: 'Wine night box', nl: 'Wijnavond-box' },
      blurb: { en: 'Three flavours picked to sit next to a glass of red, a glass of white and something sweet, with a pairing card.', nl: 'Drie smaken naast een glas rood, een glas wit en iets zoets, met een pairingkaart.' },
      contents: ['chocolate-sea-salt', 'salted-caramel', 'honey-sea-salt'],
      priceCents: 1695 },         // [TBD] placeholder
    { id: 'gift-box', kind: 'gift',
      name: { en: 'The gift box', nl: 'De cadeaudoos' },
      blurb: { en: 'Four packs in a box, with a handwritten-style card carrying your own message.', nl: 'Vier zakken in een doos, met een kaartje met jouw eigen boodschap.' },
      contents: ['salted-caramel', 'chocolate', 'caramel', 'cinnamon-sugar'],
      giftMessage: true,
      priceCents: 2400 },         // [TBD] placeholder
  ],

  /* ---------------- Flavour finder (the quiz in the "nut" section) ----
     Each answer gives points to flavours (by id). The flavour with the
     most points wins; ties go to the one listed first in `flavours`.
     `you` is the line shown with the result.                           */
  quiz: {
    questions: [
      { q: { en: 'Sweet or salty?', nl: 'Zoet of zout?' }, options: [
        { t: { en: 'Sweet tooth', nl: 'Zoetekauw' }, pts: { caramel: 2, 'doce-de-leite': 2, 'cinnamon-sugar': 2, chocolate: 1, 'coffee-chocolate': 1 } },
        { t: { en: 'A bit of both', nl: 'Een beetje van allebei' }, pts: { 'salted-caramel': 2, 'honey-sea-salt': 2, 'chocolate-sea-salt': 2 } },
        { t: { en: 'Salty, always', nl: 'Zout, altijd' }, pts: { 'chocolate-sea-salt': 2, 'salted-caramel': 1, 'honey-sea-salt': 1 } },
      ] },
      { q: { en: 'Which texture do you love?', nl: 'Van welke textuur houd je?' }, options: [
        { t: { en: 'A glassy crunch', nl: 'Een glazen krak' }, pts: { 'salted-caramel': 2, caramel: 2 } },
        { t: { en: 'Smooth and rich', nl: 'Zacht en vol' }, pts: { chocolate: 2, 'chocolate-sea-salt': 1, 'coffee-chocolate': 1, 'doce-de-leite': 1 } },
        { t: { en: 'A sugary crust', nl: 'Een suikerkorstje' }, pts: { 'cinnamon-sugar': 3 } },
        { t: { en: 'Light, so the nut comes through', nl: 'Licht, zodat je de noot proeft' }, pts: { 'honey-sea-salt': 2, 'doce-de-leite': 1 } },
      ] },
      { q: { en: 'When do you reach for a snack?', nl: 'Wanneer pak je iets lekkers?' }, options: [
        { t: { en: 'With my morning coffee', nl: 'Bij mijn ochtendkoffie' }, pts: { 'coffee-chocolate': 3, 'cinnamon-sugar': 1 } },
        { t: { en: 'With wine or cheese', nl: 'Bij wijn of kaas' }, pts: { 'chocolate-sea-salt': 1, 'salted-caramel': 1, 'honey-sea-salt': 1, chocolate: 1 } },
        { t: { en: 'An afternoon treat', nl: 'Als middagtraktatie' }, pts: { 'doce-de-leite': 2, caramel: 1, 'cinnamon-sugar': 1 } },
        { t: { en: 'Film night on the sofa', nl: 'Filmavond op de bank' }, pts: { 'salted-caramel': 2, chocolate: 1 } },
      ] },
      { q: { en: 'Which flavour pulls you in?', nl: 'Welke smaak trekt je aan?' }, options: [
        { t: { en: 'Toffee and caramel', nl: 'Toffee en karamel' }, pts: { caramel: 2, 'salted-caramel': 2 } },
        { t: { en: 'Dark and a little bitter', nl: 'Donker en een beetje bitter' }, pts: { chocolate: 2, 'coffee-chocolate': 2, 'chocolate-sea-salt': 1 } },
        { t: { en: 'Warm spice', nl: 'Warme specerijen' }, pts: { 'cinnamon-sugar': 3 } },
        { t: { en: 'Golden honey', nl: 'Goudgele honing' }, pts: { 'honey-sea-salt': 3 } },
        { t: { en: 'Soft and milky', nl: 'Zacht en romig' }, pts: { 'doce-de-leite': 3 } },
      ] },
    ],
    you: {
      'salted-caramel': { en: 'Sweet and salty at once, with a glassy crunch. Made for film nights and a glass of tawny.', nl: 'Zoet en zout tegelijk, met een glazen krak. Gemaakt voor filmavonden en een glas tawny.' },
      chocolate: { en: 'Deep, dark and rich. You like your treats grown-up.', nl: 'Diep, donker en vol. Jij houdt van volwassen lekkers.' },
      'chocolate-sea-salt': { en: 'Dark chocolate with a pinch of salt: rich, but never too sweet.', nl: 'Pure chocolade met een snufje zout: vol, maar nooit te zoet.' },
      caramel: { en: 'Golden caramel and a crisp shell. A classic, done properly.', nl: 'Goudkleurige karamel en een knapperig laagje. Een klassieker, goed gedaan.' },
      'doce-de-leite': { en: 'Soft, milky and warm, like Brazil’s favourite caramel.', nl: 'Zacht, romig en warm, zoals Brazilië’s favoriete karamel.' },
      'cinnamon-sugar': { en: 'Warm cinnamon and a sugary crust. Cosy in a pouch.', nl: 'Warme kaneel en een suikerkorstje. Gezelligheid in een zakje.' },
      'coffee-chocolate': { en: 'Coffee and dark chocolate. Your morning, in a nut.', nl: 'Koffie en pure chocolade. Je ochtend, in een noot.' },
      'honey-sea-salt': { en: 'Golden honey with a little sea salt. Bright, light and easy to love.', nl: 'Goudgele honing met een beetje zeezout. Fris, licht en makkelijk om van te houden.' },
    },
  },

  /* ---------------- Pairing ritual --------------------------------
     For each wine or cheese: the flavour it suggests and why.
     These are our suggestions, to be confirmed at a real tasting [TBD]. */
  pairings: {
    wine: [
      { id: 'tawny', name: { en: 'Tawny port', nl: 'Tawny port' }, color: '#9b4a1f', pick: 'salted-caramel',
        why: { en: 'Tawny already tastes of nuts and toffee. The sea salt in the caramel cuts through the sweetness so both stay bright.', nl: 'Tawny smaakt al naar noten en toffee. Het zeezout in de karamel snijdt door de zoetheid, zodat beide fris blijven.' } },
      { id: 'malbec', name: { en: 'Malbec', nl: 'Malbec' }, color: '#5b1a2e', pick: 'chocolate',
        why: { en: 'Dark fruit and soft tannins want something bitter and rich next to them. Dark chocolate is that.', nl: 'Donker fruit en zachte tannines vragen om iets bitters en vols. Pure chocolade is dat.' } },
      { id: 'bubbles', name: { en: 'Champagne or cava', nl: 'Champagne of cava' }, color: '#e9d48a', pick: 'honey-sea-salt',
        why: { en: 'Bubbles love salt. Honey rounds off the acidity so the glass feels softer.', nl: 'Bubbels houden van zout. Honing rondt de zuren af, waardoor het glas zachter voelt.' } },
      { id: 'riesling', name: { en: 'Off-dry riesling', nl: 'Halfdroge riesling' }, color: '#d8d26b', pick: 'cinnamon-sugar',
        why: { en: 'A little sweetness and a lot of acidity: the warm spice of cinnamon gives the wine something to lean on.', nl: 'Een beetje zoet en veel zuur: de warme kaneel geeft de wijn iets om op te leunen.' } },
      { id: 'px', name: { en: 'Pedro Ximénez sherry', nl: 'Pedro Ximénez-sherry' }, color: '#3a1a10', pick: 'coffee-chocolate',
        why: { en: 'Raisins, coffee and dark sugar in the glass. Coffee and chocolate on the nut, so they finish each other’s sentences.', nl: 'Rozijnen, koffie en donkere suiker in het glas. Koffie en chocolade op de noot: ze maken elkaars zinnen af.' } },
      { id: 'chardonnay', name: { en: 'Oaked chardonnay', nl: 'Chardonnay op hout' }, color: '#e7c35a', pick: 'caramel',
        why: { en: 'Butter and vanilla from the oak meet golden caramel halfway.', nl: 'Boter en vanille van het hout ontmoeten goudkleurige karamel halverwege.' } },
    ],
    cheese: [
      { id: 'oude-kaas', name: { en: 'Aged Gouda (oude kaas)', nl: 'Oude Goudse kaas' }, color: '#e9b44c', pick: 'caramel',
        why: { en: 'Old Gouda already has caramel crystals of its own. A glassy caramel shell makes that taste louder.', nl: 'Oude kaas heeft zelf al karamelachtige kristallen. Een glazen karamellaagje maakt die smaak luider.' } },
      { id: 'blue', name: { en: 'Blue cheese', nl: 'Blauwe kaas' }, color: '#9fb3c8', pick: 'honey-sea-salt',
        why: { en: 'Blue cheese and honey is a classic for a reason: sweet calms the sharp, salt keeps it awake.', nl: 'Blauwe kaas met honing is niet voor niets een klassieker: zoet tempert het scherpe, zout houdt het wakker.' } },
      { id: 'brie', name: { en: 'Brie or camembert', nl: 'Brie of camembert' }, color: '#f3ead2', pick: 'doce-de-leite',
        why: { en: 'Soft, milky cheese with milky caramel. Gentle on gentle, with the crunch of the pecan in between.', nl: 'Zachte, melkachtige kaas met melkkaramel. Zacht op zacht, met de knapperige pecan ertussen.' } },
      { id: 'goat', name: { en: 'Fresh goat cheese', nl: 'Verse geitenkaas' }, color: '#f7f4ea', pick: 'cinnamon-sugar',
        why: { en: 'Tangy goat cheese needs warmth. Cinnamon sugar brings it, like a dessert you can serve before dinner.', nl: 'Frisse geitenkaas heeft warmte nodig. Kaneelsuiker brengt die, als een dessert dat je voor het eten serveert.' } },
      { id: 'manchego', name: { en: 'Manchego', nl: 'Manchego' }, color: '#e8d08a', pick: 'chocolate-sea-salt',
        why: { en: 'Nutty, firm and a little salty. Dark chocolate and sea salt bring depth without hiding the cheese.', nl: 'Nootachtig, stevig en een beetje zout. Pure chocolade met zeezout geeft diepte zonder de kaas te verbergen.' } },
      { id: 'parmigiano', name: { en: 'Parmigiano Reggiano', nl: 'Parmigiano Reggiano' }, color: '#f0d27a', pick: 'salted-caramel',
        why: { en: 'Big savoury crystals and a sweet-salty nut: the same contrast, from two directions.', nl: 'Grote hartige kristallen en een zoetzoute noot: hetzelfde contrast, van twee kanten.' } },
    ],
  },
};
