# SGEN Med Spa (Dark) — Local SEO + AEO Landing Page

**Dark/black-theme** editable static clone of the SGEN Local SEO + AEO landing page,
retargeted to **medical spas / medical aesthetics**. Static HTML/CSS/JS — no build step.

Cloned from `SGEN-SEO-AEO-Dental_Black_Optimized_V4` (the optimized dental reference),
so every performance and layout refinement in that build is preserved here. Copy is
sourced from `MedSpa_Landing_Page_Content_Map.xlsx`, which was itself written against
that exact V4 reference.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | The med spa Local SEO + AEO landing page — **dark theme** |
| `chrome.css` | Shared stylesheet (site chrome, tokens, components) |
| `assets/` | Fonts, images, JS, and the portfolio deck screenshots |
| `mockups/` | The 6 med spa sample sites shown in the Selected Work deck |
| `llms.txt` / `llms-full.txt` | Plain-text brief for AI assistants |
| `ai.txt` / `robots.txt` / `sitemap.xml` | Crawler policy, directives, sitemap |

## Preview

Because the original export references a few assets with **server-absolute paths**
(e.g. `/assets/dispenza/js/dispenza.js`), a couple of scripts/styles won't resolve when
you open `index.html` directly via `file://`. Serve the folder from any static server to
preview it exactly as hosted:

```
cd SGEN-SEO-MedSpa_Black
python -m http.server 8080     # then open http://localhost:8080/index.html
```

Content, layout, fonts, and the portfolio deck all render correctly either way — the
absolute-path items are analytics/enhancement scripts, not layout-critical.

## What was retargeted (dental → med spa)

**306 audited substitutions** across `index.html`, applied section by section from the
content map. Every replacement asserted its expected occurrence count, so nothing was
changed silently or missed.

- **Meta / SEO / schema** — title, description, OG + Twitter, canonical, breadcrumb,
  the 15-question FAQ JSON-LD, Organization and Service schema. URL slug
  `dental-local-seo-aeo` → `med-spa-local-seo-aeo` (9 places).
- **Hero** — H1 typed phrases (`med spa near me` / `laser hair removal near me`), lead,
  CTA, trust chips, the live rank-tracker keywords and the ChatGPT-answer widget.
- **01 Results** — all **30** result cards (25 businesses) plus the owner pull quote.
  Per the map's Read Me, the **"before" half of every before→after comparison was
  removed** — cards now show only the achieved result (`0 → 115+` becomes `115+`), and
  the heading no longer says "Before & after".
- **The Shift / Two Engines / Timeline / Deliverables** — client-facing wording,
  directory names, `2× more new clients`.
- **04 Live Proof** — all **10** Search Console dashboards (names + treatment
  categories). Chart values carried over as the map instructs.
- **More Wins** — 4 city cards with med spa keywords.
- **05 Selected Work** — deck rebuilt to **6 med spa cards** (see below).
- **06 Reviews** — all 9 review cards; reviewer names kept, roles and wording re-skinned.
- **07 ROI calculator** — 11 med spa treatment-category presets replacing the dental
  specialties. Default `40 clients × $1,500` → `$60,000/mo · $132K/mo · $864K/yr ·
  8,934%`, matching the map's Statistics tab exactly. The static no-JS fallback markup
  was recomputed to match the JS output.
- **08 Compare / By the Numbers / Pricing / Method / FAQ / Final CTA / Footer**.
- **Application overlay** — headline, sub, field labels, placeholders and ARIA labels,
  in the markup and in both JS copies.
- **Logo wall** — all **80** fictional businesses renamed to med spas. Only glyph keys
  already present in the file's icon dictionary were reused; the `tooth` glyph is no
  longer referenced (it remains in the dictionary, unused, alongside the other unused
  keys the dictionary already shipped).
- **llms.txt, llms-full.txt, ai.txt, sitemap.xml, .htaccess** — retargeted to match.

SGEN's own brand and pricing (`$497 / $797 / $1,297`, `4.9★`, `500+`, `9+ yrs`) are
unchanged — they are the agency's own, industry-agnostic, per the map's Read Me.

## Portfolio deck — "Med spa sites we've built & ranked"

**6 med spa cards**, one per retained mockup:

| # | Brand | Category | Mockup |
|---|---|---|---|
| 1 | Aura Medi Spa | Full-Service Med Spa · Clinical | `mockups/aura-medi-spa/` |
| 2 | BLOC Aesthetics | Aesthetics Studio · Editorial | `mockups/bloc-aesthetics/` |
| 3 | Revive Skin Lab | Skin Clinic · Science-Led | `mockups/revive-skin-lab/` |
| 4 | Renew Wellness Spa | Med Spa + Wellness · Restorative | `mockups/renew-wellness-spa/` |
| 5 | Nuyu | Medical Aesthetics · Elite | `mockups/nuyu/` |
| 6 | Peel Good | Resurfacing Clinic · Retail | `mockups/peel-good/` |

**FORM Medi Spa and Lumière Medi Spa were removed from the deck** at the owner's request
(2026-08-04). The deck went 8 cards → 6, `data-i` was renumbered contiguously 0–5, and the
now-orphaned assets were garbage-collected: both card images, both `mockups/<slug>/` folders,
both `_shared-fonts/<slug>-fonts.css`, plus **15 shared images and 10 woff2 (0.25 MB)** that no
surviving mockup still referenced. Shared files still in use by other mockups were deliberately
kept — the pools are content-deduped, so deleting by filename prefix would have broken the
mockups that reuse them. Both designs remain in the original
`Medi Spas Compiled for SGEN.zip` if they are ever wanted back.

## Optimization parity vs the dental reference — verified 2026-08-04

Measured, not asserted. `SGEN-SEO-MedSpa_Black` vs `SGEN-SEO-AEO-Dental_Black_Optimized_V4`:

| Dimension | Reference | This bundle | |
|---|---|---|---|
| Un-transcoded rasters in `mockups/` | 1 `.jpg` | **0** | better |
| External font requests in mockups | 0 | **0** | parity |
| Inline base64 rasters in mockups | 0 | **0** | parity |
| `rel=preload` / `preconnect` | 8 / 2 | **8 / 2** | parity |
| `<script defer>` / `async` | 21 / 0 | **21 / 0** | parity |
| `decoding="async"` | 22 | **22** | parity |
| `chrome.css` | 788,972 B | **788,972 B** | untouched |
| JSON-LD blocks / parse errors / FAQ Qs | 5 / 0 / 15 | **5 / 0 / 15** | parity |
| `.htaccess` directives | — | **byte-identical** | parity |
| Dangling local refs | 0 | **0** | parity |
| woff2 serving only non-Latin subsets | 0 | **0** | parity (fixed, see below) |
| `_shared-fonts` total | 935 KB | **920 KB** | parity |
| Mockup `<img>` with a loading attr | 52 / 68 | **66 / 66** | better |
| WebP carrying an ICC profile | 0 / 56 | **0 / 65** | parity (fixed) |
| Mockups shipping `server.js` | 6 / 6 | **6 / 6** | parity (fixed) |
| Image longest edge (median / max) | 809 / 1920 px | **1500 / 1600 px** | open by owner decision |

`mockups/` is 6.05 MB against the reference's 3.29 MB. That remaining gap is **content, not
technique** — these six med spa designs are photography-led editorial layouts (65 images) where the
dental mockups used smaller stock (56 images, 809px median). Reducing image resolution further was
explicitly declined by the owner, so it stays open deliberately.

### Four right-sizing gaps closed 2026-08-04

A parity check that only asks "is each technique present?" passes a bundle that ships the right
techniques at the wrong size. An audit against the reference caught four such gaps; all are fixed
here and identically in the white bundle:

- **Non-Latin font subsets — 38 woff2 / 573 KB deleted.** The localized Google Fonts CSS shipped
  every subset the families support, but no mockup contains a single Cyrillic, Greek or Vietnamese
  codepoint, so those `@font-face` blocks could never be fetched. Kept `latin` + `latin-ext` only
  (53 faces each); CSS 93.8 KB → **42.5 KB**, woff2 66 → **28, exactly matching the reference**.
  The script asserts parsed blocks equal the file's total `@font-face` count and refuses to leave
  any file with zero faces.
- **Lazy-loading — 13 of 66 `<img>` → 66 of 66** (60 lazy + 6 eager), plus `decoding="async"` on
  all 66. First image per mockup stays eager as the likely LCP. Image counts asserted unchanged.
- **ICC profiles — stripped from all 65 WebP.** A lossless `ICCP` chunk removal with the `VP8X`
  ICC flag bit cleared, not a re-encode, so no generation loss; pixel dimensions asserted identical
  before and after each write.
- **`server.js` — 4 of 6 → 6 of 6**, all with the full webp/avif/woff2 mime map. All 12 files
  across both bundles pass `node --check`.

Verified after: all six mockups render with 0 broken images, 0 console errors, 0 failed requests
and the correct font families loading; the full page gate still passes at four breakpoints.

- Card images are real **1600×1000** lossy-WebP renders of each mockup's above-the-fold
  hero — the same format and dimensions as the dental cards they replace — captured with
  `prefers-reduced-motion: reduce` so splash overlays and scroll reveals stay suppressed.
- Each card's `--paper` (its load-time backdrop) is sampled from that design's own page
  background, not invented.
- `View design →` opens the mockup in the page's existing lazy **modal iframe**. That
  script derives the mockup path from the card image's filename
  (`portfolio/<slug>.webp` → `mockups/<slug>/<slug>.html`), so slug names must stay in
  sync between the two. Nothing loads until a card is clicked.
- The deck JS is count-agnostic (`var n = cards.length`), so 8 cards needed no layout
  change.

## Mockup optimization

The supplied mockups were rebuilt to match the V4 bundle's own optimization scheme
rather than dropped in raw:

- **Images** — every JPEG transcoded to WebP (quality 0.82), capped at **1600px** on the
  long edge, and pooled in `mockups/_shared-img/` so duplicates are stored once.
  For the 6 retained mockups: **65 images, 11.98 MB → 4.86 MB (59.4% smaller)**.

  The 1600px cap is set against the reference, not guessed. A first pass used 1920px and
  produced a 5.90 MB pool whose median longest edge was 1500px against the dental V4's
  **809px** — 30 of 65 images were over 1600px where the reference had 3 of 56. Re-transcoding
  **from the original sources** (not from the already-lossy WebP, so no generation loss) at the
  same quality with the tighter cap recovered **1.04 MB** and brought the pool inside the
  reference's own resolution band. 1600px is still ~1.4× the modal panel these images are ever
  displayed in (`min(1120px, 96vw)`), and the heaviest recompressions were spot-checked visually
  — Peel Good's before/after skin close-up, the worst case for fine texture, is artifact-free.
- **Inline base64 extracted** — the two dev-handoff mockups shipped their photos as
  base64 inside the HTML. Extracting them to files collapsed
  `nuyu` **1877 KB → 72 KB** and `peel-good` **6785 KB → 66 KB**, and lets the browser
  cache and lazy-load the images instead of parsing them on every open.
- **Fonts self-hosted** — every mockup's Google Fonts CDN link was localized to
  `mockups/_shared-fonts/<slug>-fonts.css` with the woff2 files stored under their
  original filenames, so families shared between mockups dedupe. 76 woff2 files
  (1.66 MB) with 42 dedupe hits at build time; **66 woff2 (1.42 MB)** remain after the
  removal. No mockup makes a third-party font request.

## Layout fixes applied 2026-08-04

Appended as `<style id="layout-fixes-2026-08-04-medspa-align">` at the end of `index.html`
(the file's own convention — fixes live in `index.html` so `chrome.css` stays untouched).
Both were measured before and after at 8 viewports and diffed, so each provably changes only
what it should:

- **#55 · THE SHIFT stat cards** — card 3's divider rule and `Source:` line sat one text-line
  too high, because its label fits on one line where cards 1–2 wrap to two. Reserving two
  lines of label height drops the divider onto the shared baseline: at 1440px it moved
  `208.17px → 233.55px` from the card top, exactly matching its neighbours. Scoped `>=921px`;
  below that the grid reflows and card 3 sits alone on its own row with nothing to align to.
- **#56 · MORE WINS keyword chips** — the "Laser & Skin" card's three long phrases needed
  608.56px in a 592px strip, so they wrapped and made that grid row 334.38px tall against
  296.38px for the row below. Trimming chip chrome first, then type, brings the strip to
  519.31px and all four cards to a uniform **292.38px**. Scoped `>=1280px`, which is measured:
  the strip has 548px there but only 508px at 1200px, and closing that last 11.31px would mean
  ~9px type. 1200–1279px is left to wrap, matching the dental reference's behaviour at that
  width (it needs 566.77px). This bundle fits from 1280px up; the reference only fits from 1440px.

Neither fix uses `flex` on the stat card or `flex-wrap: nowrap` on the chip strip. Both were
tried and rejected with measurements: flex blockifies the `inline-flex` `.sc-eyebrow` and pulls
`.sc-num` up 16px in every card, and `nowrap` guarantees one row only by letting the strip
overflow the card instead of wrapping.

## Editing notes

- Pure static — edit `index.html` / `chrome.css` in any editor and refresh.
- The ROI calculator's `<option>` labels are lowercased at runtime to key into the
  `PRESETS` object in the inline script — if you rename an option, rename its matching
  `PRESETS` key too.
- The portfolio deck JavaScript is count-agnostic, so you can add or remove `.e-card`
  articles freely.
- To replace a deck screenshot, drop a 1600×1000 WebP into
  `assets/in-pages/portfolio/` and point the card's `<img src>` at it — and remember the
  filename doubles as the modal's mockup path.

## Verify before publishing

- Statistics carried over from the reference (60% zero-click, 3.4× AI referrals, 47% ask
  ChatGPT, 500+ ranked, $47M+, 9+ yrs, 4.9/5 from 50+ reviews) are flagged by the content
  map as **unverified illustrative benchmarks**. The 47% figure originally measured
  *dentists* — the map explicitly asks for a med-spa-specific figure. Verify or replace
  with audited data and cited sources before publishing.
- Client names, results, reviews and the 80-name logo wall are **fictional /
  illustrative**, exactly as in the source page.

## Known pre-existing gaps (from the source export, not introduced here)

- `assets/css/apply-v2.css` is referenced but was not included in the source export.
- `assets/dispenza/js/dispenza.js` is referenced with a server-absolute path.
- `https://www.sgen.com/sg-collect` is an SGEN analytics beacon (network-only).

None affect the page's content or layout, and all three are referenced identically in
the dental source — zero new failures introduced.

© SGEN. All rights reserved.
