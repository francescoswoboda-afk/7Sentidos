# Araçari

Website and shop for Araçari, a father-and-son business importing flavoured Brazilian pecans from El Porvenir Farms (Santa Cruz do Sul, Brazil) to the Netherlands.

## Brand

The brand kit is in `design/`. Read `design/BRAND.md` before changing anything visual or any copy. `design/flavours.json` holds the pack colours; the pack images, wordmark and toucan illustrations are in `design/packs`, `design/logo` and `design/illustrations`.

- Text in `[TBD]` or `[VERIFY]` is a placeholder the owners still have to supply or check. Keep it visible, and do not invent facts to fill it.
- El Porvenir is the family's own farm, but NOT every pecan comes from it; they also work with partner farms ([TBD] which) that follow the same practices: 20% native forest kept as a reserve, protected streams, no pesticides (all [VERIFY]). Never write copy that implies all nuts come from El Porvenir (no "pecans from El Porvenir Farms", no El Porvenir as producer). Farm facts describe that farm only.
- El Porvenir's own website: https://www.elporvenir.farm/ (Monte Alverne, Santa Cruz do Sul; 72 ha). Its planted area is inconsistent there (35 vs 70 ha), and its health claims are not authorised in the EU, so do not copy those.
- No fake reviews, awards, certifications, stock counts or health claims. Environmental claims must be specific and provable (EU Directive 2024/825); no generic "eco-friendly" or "sustainable" wording. Never use "organic", "bio" or "eco" for the products until an EU organic certificate is in place (Reg. (EU) 2018/848).
- Prices use a comma: `€5,95`. Prices are placeholders while `DATA.pricesConfirmed` is `false`.
- Copy is in English with a Dutch toggle; Dutch strings live in `src/js/i18n.js`.

## Code

- `src/` is the source: `index.html`, `styles.css`, `js/` (loaded in the order listed in `build.js`) and `assets/` (600 px pack webps, wordmarks, icons).
- `src/js/data.js` holds every flavour, product, bundle, price, shipping rule and pairing. Change shop data there only.
- `npm run build` inlines everything into one self-contained `public/index.html`. Always rebuild after editing `src/`, and commit the rebuilt file.
- `docs/DECISIONES.md` (Spanish) explains the design decisions; `docs/type-study/` is the typography study.

## Site

- Only `public/` is deployed: a Cloudflare Worker named `7sentidos` serves it as static assets, set in `wrangler.jsonc`. `src/`, `design/` and `docs/` are never published.
- Live at https://7sentidos.francesco-swoboda.workers.dev
- Pushing to GitHub does NOT deploy: Cloudflare is not connected to the repo. Deploy with `npm run deploy` (builds, then uploads with wrangler; needs `npx wrangler login` once per machine). After deploying, open the live URL and check it changed.
- Run it locally with `npm run start` (http://localhost:3000).
