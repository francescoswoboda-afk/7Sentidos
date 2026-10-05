# 7 Sentidos website: design handoff

This folder holds the approved design for the 7 Sentidos site ("Design 2: Brand") and everything needed to build it. It was designed on a Claude design canvas and exported here as plain HTML so it can be opened in a browser and read as a reference.

## What is in this folder

| Path | What it is |
|---|---|
| `preview/index.html` | Home page |
| `preview/flavour.html` | Flavour (product) page, shown with Salted caramel selected |
| `preview/about.html` | About us |
| `preview/where-to-buy.html` | Stockists, wholesale enquiry form, FAQ |
| `preview/bag.html` | Bag (cart), shown with three sample lines |
| `assets/` | Transparent PNGs cut from the brand files |
| `brand-source/` | The original packaging and colour PDFs from the brand designer |

Open any file in `preview/` in a browser to see the page. The previews are static: every style is inline, the flavour picker, quantity steppers and bag do not respond to clicks, and the bag shows fixed sample data. Treat them as the visual and content spec, not as code to ship.

## How to build from this

1. Look at the existing site code first (it runs on `localhost:3000`) and build this design in that stack. Do not paste the preview HTML in as-is.
2. Turn the inline styles into the project's own styling approach, with the colours and type below as shared tokens.
3. Make the header, footer, flavour label and patterned band reusable components. They repeat on every page.
4. Keep the copy exactly as written in the previews. Text in `[square brackets]` is a placeholder the owner still has to supply; keep it visible until he does.
5. Wire up the real behaviour described under "Behaviour".

## Colours

All taken from the packaging files in `brand-source/`.

| Token | Hex | Used for |
|---|---|---|
| Teal | `#00585A` | Header, footer, hero, primary buttons, rules |
| Deep teal | `#003B3D` | Claim strips, text on orange, lime and turquoise |
| Ink | `#00474A` | Body text on cream and sand |
| Cream | `#FFF1D8` | Page background, text on teal |
| Sand | `#EED3AF` | Alternate section background, label panel |
| Orange | `#FF9B00` | Accent buttons, "mostly nut" band, salted caramel label |
| Lime | `#D7E100` | Band under the hero, salted caramel label band |
| Turquoise | `#00E1E1` | Tasting-set band, sea salt label band |
| Chocolate | `#300602` | Chocolate label, dark accents |
| Rust | `#AD3D25` | Chocolate label band |
| Caramel orange | `#DA6B20` | Caramel label band |

Teal on orange only has enough contrast at large sizes, so body text on orange uses deep teal. Re-check contrast if you change any pairing.

## Type

- Headings: Josefin Sans, weight 700, sentence case, letter-spacing about -0.01em, line-height 1.0 to 1.05. This is the typeface on the packaging.
- Claim strips and label text: Josefin Sans, weight 600 to 700, uppercase, wide letter-spacing (0.26em to 0.5em), as on the packaging.
- Body and buttons: Schibsted Grotesk, 19px, line-height 1.55. Lead paragraphs are 21px.
- Both are on Google Fonts.

Sizes: h1 `clamp(48px, 6.8vw, 104px)`, section h2 `clamp(34px, 4.4vw, 60px)`, card h3 30px.

## Shapes and spacing

- Corners are nearly square: 4px on buttons, inputs and steppers; none on labels and bands.
- Content width is 1280px with 32px side padding.
- Sections have 96 to 112px vertical padding.
- Buttons are 60 to 62px tall for main actions, 46 to 54px for secondary ones. Every tap target is at least 44px.

## Components

**Header.** Teal bar, cream-text logo on the left (`assets/logo-cream.png`), three links and an orange "Bag" button. The nav wraps to a second line on narrow screens.

**Footer.** A deep teal strip with the origin line, then a teal block with the logo, a one-line description, page links and contact details.

**Patterned band.** A flat colour with `assets/pattern-white.png` laid over it using `object-fit: cover`. Opacity is 0.08 on teal, 0.22 on orange, 0.35 on turquoise and 0.4 on lime. The pattern is decorative, so it is hidden from screen readers.

**Flavour label.** Built in HTML to match the packaging layout: a colour field with the vertical logo, the origin line, a claim strip, and a patterned band with the product name and a flavour box. Proportions are field 70.45%, strip 4.55%, band 25% of the height; aspect ratio 300 / 412.5. Text sizes use container query units so the label scales with its width. Colourways:

| Flavour | Field | Strip | Band | Logo file |
|---|---|---|---|---|
| Chocolate | `#300602` | `#D1793A` | `#AD3D25` | `vlogo-choc.png` |
| Chocolate & sea salt | `#005656` | `#003B3D` | `#00E1E1` | `vlogo-orange.png` |
| Caramel | `#EED3AF` | `#542821` | `#DA6B20` | `vlogo-cream.png` |
| Salted caramel | `#FF9B00` | `#005656` | `#D7E100` | `vlogo-orange.png` |

The chocolate, caramel and salted caramel colourways come from the designer's colour sheet. The sea salt one was put together for the site from the same palette.

## Pages

**Home.** Hero on teal with the tube pack shot; "Nature wonders" strip and lime band; four flavour labels; "mostly nut" band on orange; wine and cheese pairings; the father-and-son story with a photo slot; tasting set on turquoise.

**Flavour.** Flavour switcher, large label on a sand panel, name, description, price, quantity stepper and "Add to bag", then a details list. Tasting-set band below.

**About us.** Opening story with a photo slot; "Why seven senses" beside the colour 7; origin (El Porvenir Farms, Santa Cruz do Sul, Brazil) with a photo slot; four numbered steps; "The two of us" with two portrait slots; closing band.

**Where to buy.** Intro and "Order online"; stockist list and map slot; wholesale pitch with an enquiry form; FAQ as native `<details>` elements.

**Bag.** Line items with quantity steppers, an order summary panel, and an empty state ("Your bag is empty. Pick a flavour to fill it.") that is not shown in the static preview.

## Behaviour

- Flavour switcher: changes the label, name, description and "Goes well with" line. Use toggle buttons with `aria-pressed`.
- Quantity stepper: minimum 1, maximum 20 on the flavour page. "Add to bag" shows the line total and, after adding, a status line such as "2 bags of Caramel added to your bag."
- Bag: steppers change the quantity, a line at 0 is removed, the subtotal updates, and the header shows the item count.
- Prices are written the Dutch way, with a comma: `€5,95`.
- The wholesale form and checkout are not connected to anything yet.

## Facts used in the copy

- Four flavours at €5,95 per 100 g bag. Tasting set of all four (400 g) at €22,00, which is €1,80 less than four separate bags.
- Delivery across the Netherlands in 1 to 3 working days.
- Contains nuts and milk.
- Pecans from El Porvenir Farms, Santa Cruz do Sul, Brazil (from the packaging).
- Contact: hallo@7sentidos.nl.

## Still to confirm with the owner

- The wine and cheese pairings were suggested during the design, not supplied by the owner.
- "We supply small shops directly" and "For now we only deliver within the Netherlands" are draft wording.
- Placeholders: names and roles of the two founders, all photos, stockist names and addresses, delivery price, payment methods, shelf life, ingredients, allergen traces, wholesale terms, KvK number, and the sixth and seventh senses.
- The tube in the hero is the designer's "Natural Salted" mockup, which is not one of the four dipped flavours.
- The pouch mockup shows `sietesentidos.org` and the Instagram handle `/7_sentidos`. They are not linked until the owner confirms they are real.

## Assets

| File | Size | Use |
|---|---|---|
| `logo-cream.png` | 1664 x 707 | Logo with cream text, for teal and other dark backgrounds |
| `logo-colour.png` | 1664 x 707 | Logo with teal text, for light backgrounds |
| `seven.png` | 503 x 696 | The colour 7 on its own |
| `can.png` | 912 x 1350 | Tube pack shot with a soft shadow |
| `pattern-white.png` | 1799 x 868 | The sun-and-leaves pattern in white, used as an overlay |
| `vlogo-choc.png`, `vlogo-cream.png`, `vlogo-orange.png` | 485 x 1144 | Vertical logo in three packaging colourways, for the labels |

All have transparent backgrounds. The original Illustrator logo file arrived damaged, so the logos were taken from the transparent PNG and the PDFs instead. If a clean `.ai` or `.svg` turns up, replace the logo PNGs with SVG.
