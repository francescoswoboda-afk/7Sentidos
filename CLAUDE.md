# Araçari

Website and shop for Araçari, a father-and-son business importing flavoured Brazilian pecans from El Porvenir Farms (Santa Cruz do Sul, Brazil) to the Netherlands.

## Brand

The brand kit is in `design/`. Read `design/BRAND.md` before changing anything visual or any copy. `design/flavours.json` holds the pack colours; the pack images, wordmark and toucan illustrations are in `design/packs`, `design/logo` and `design/illustrations`.

- Text in `[TBD]` or `[VERIFY]` is a placeholder the owners still have to supply or check. Keep it visible, and do not invent facts to fill it.
- No fake reviews, awards, certifications, stock counts or health claims.
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
