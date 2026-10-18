# Araçari — brand kit for the new website

Read this before designing or building any page. Everything here comes from the packaging mockups made in October 2026.

## Status (important)
- Araçari is a **work in progress, not launched**. No shop, no prices, no stock yet. Don't write "buy now", "order today", "shipping", prices or reviews.
- The name **Araçari** is the favourite, but a survey comparing it with two other names (Bom Dia, Sensibus) is still running. Keep the brand name in one place (a config/constant) so it can be swapped.
- The name has **not been legally cleared** as a trademark yet.
- Pack shots are **digital mockups** (the nuts are photo composites), not photos of real products.

## The story
> **Correction (Oct 2026):** El Porvenir is the family's own farm, but not all pecans come from it. The rest come from partner farms with the same practices (20% native forest, protected streams, no pesticides). Do not present El Porvenir as the source of every pack, and do not say "organic"/"bio" until certified.

- Flavoured Brazilian pecans from **El Porvenir Farms**, Santa Cruz do Sul, Rio Grande do Sul, in the south of Brazil.
- Pecans grow in the south of Brazil because they need four seasons and a cold winter. That's also why the mascot is a **toucan**: the araçari is a small, colourful toucan that lives in Brazil.
- The business imports the pecans to the Netherlands, and later to the rest of Europe.
- Tagline: **"Wildly good pecans"**.
- Pack: 100 g stand-up pouch.

## Flavours
All data (names, colours, notes and image paths) is in `flavours.json`. Build product cards from that file instead of hard-coding them.

**Core range** (the four real flavours):

| Flavour | Pack body | Strip | Band | Handwritten notes |
|---|---|---|---|---|
| Salted caramel | `#e88028` orange | `#285c69` teal | `#c1d04a` lime | slow roasted · real sea salt · glassy caramel |
| Chocolate | `#4a221a` dark brown | `#a8662c` | `#b4472b` | slow roasted · dark chocolate · hand dipped |
| Chocolate & sea salt | `#1f5a5c` deep teal | `#113a3c` | `#63d8da` aqua | slow roasted · real sea salt · dark chocolate |
| Caramel | `#e6d2a8` cream | `#4b2a1a` | `#e17c20` orange | slow roasted · golden caramel · glassy shell |

**Concept flavours** in `packs/concept/` (doce de leite, cinnamon sugar, coffee & chocolate, honey & sea salt). These are **ideas only, with no recipes yet**. Don't present them as products. If they appear on the site at all, put them in a clearly labelled "flavours we're dreaming up" section.

The handwritten notes on the packs are placeholders until the recipes are final.

## Assets
```
logo/           aracari-wordmark-white.svg/.png   (for orange or dark backgrounds)
                aracari-wordmark-dark.svg/.png    (for cream or white backgrounds)
illustrations/  toucan-perched.svg/.png           (with sun halo, branch and leaves)
                toucan-flying.svg/.png
                toucan-perched-simple.svg/.png    (no halo, no leaves; use it small)
packs/core/<flavour>/     aracari-<flavour>-perched|flying .png (transparent cut-out, full size)
                          .webp (same, smaller file)   -600.webp (600 px, for cards)
                          -photo.jpg (original mockup on light background)
packs/concept/<flavour>/  same structure
packs-overview.jpg        every pack in one picture, for reference only
fonts/          Josefin Sans and Dancing Script (variable TTF, OFL licence)
flavours.json   site data
```
- Use the SVG wordmark as it is. Don't retype "ARAÇARI" in a font: the three A's have small painted landscapes in their peaks (sun, hills, waves), and that's the logo's signature.
- Each flavour has two pack versions: the toucan **perched** and the toucan **flying**. Use one version consistently per page (for example perched on product cards, flying in hero sections).
- On the web, use the `-600.webp` or `.webp` files. Keep the PNGs as the masters.

## Colours (from the artwork)
| Role | Hex |
|---|---|
| Ink / dark teal (text, the toucan's body) | `#13333a` |
| Pecan orange (signature pack colour) | `#e88028` |
| Strip teal | `#285c69` / `#1f5e63` |
| Lime | `#c1d04a` / `#85bb49` |
| Leaf green | `#4d942f` |
| Sky blue | `#58b7e8` |
| Blue / navy (feathers) | `#2a84cc` / `#1c5fa3` |
| Sun orange-red | `#e9601c` |
| Sun yellow | `#f6d641` |
| Cream background | `#f6efe2` / `#fff6e4` |

Suggested approach: a warm cream page background, dark teal text, and a flavour's own colours as the accent on that flavour's section or page. Keep the brand vibrant and colourful (the family likes the bright pouch colours and patterns), but let the packs be the loudest thing on the page.

## Typography
- **Josefin Sans**: headings and UI. The wordmark is drawn from Josefin Sans Bold, the tagline uses weight 600, and the pack lettering is uppercase with wide letter-spacing ("BRAZILIAN PECANS", "EL PORVENIR FARMS · BRAZIL").
- **Dancing Script** (600): only for small handwritten notes with arrows pointing at the nuts, like on the packs. Use it sparingly.
- Both are on Google Fonts. The TTFs in `fonts/` can be self-hosted.

## Visual language
- The toucan is friendly: smiling closed eye, little orange blush.
- There's a pattern of sun, leaves, hills and waves inside letters and shapes.
- Handwritten notes have hand-drawn arrows.
- The bottom band has big soft swirl patterns.
- The packs show real-looking pecans, so a visitor sees immediately what's inside. Clarity about what's inside was the biggest complaint about the old 7Sentidos pack in the first survey.

## Tone
Warm, a bit playful, honest. Short sentences. It's a family farm, not a corporation.
