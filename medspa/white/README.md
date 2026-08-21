# SGEN Med Spa (Light) — Local SEO + AEO Landing Page

**Light/white-theme** editable static clone of the SGEN Local SEO + AEO landing page,
retargeted to **medical spas / medical aesthetics**. Static HTML/CSS/JS — no build step.

This is the light counterpart of `SGEN-SEO-MedSpa_Black` — identical med-spa content, stats,
mockups and website samples, rendered on SGEN's light theme.

## How this bundle was built

Built from `SGEN-SEO-AEO-Dental_White_Optimized_V4` rather than by re-theming the black med-spa
bundle. That choice was measured, not assumed:

- Dental black V4 and white V4 differ in **only 2 of 227 files** — `index.html` and `README.md`.
  The other **225 are byte-identical**, so `chrome.css`, every mockup, and every asset are
  theme-agnostic and were copied straight from the finished black med-spa bundle.
- The two `index.html` files differ by **265 line-records**, and the delta cuts both ways: the
  black build *removes* rules the light build needs (`.pc-svc--seo` deep-blue, the axe contrast
  overrides, `caro-dots` backgrounds). Re-theming black → light would have meant reconstructing
  both halves of that by hand.
- Starting from the white file makes the theme correct **by construction** — it is never touched.
  Verified after the build: `<style id="light-theme">` present, light logo `sgen-logo.png` ×10 and
  dark logo `sgen-logo-3.webp` ×3, all counts matching dental White V4 exactly. (Those 3 dark-logo
  references are intentional — the mobile-menu brand and apply-overlay brand sit on dark surfaces.)

The med-spa content was applied with the same audited replacement scripts used for the black
bundle: **305 substitutions**, every one asserting its expected occurrence count so a wrong or
theme-shifted source string fails loudly instead of silently doing nothing. All 14 content anchors
were confirmed present in the white source at identical counts before the run.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | The med spa Local SEO + AEO landing page — **light theme** |
| `chrome.css` | Shared stylesheet — byte-identical to the reference (788,972 B) |
| `assets/` | Fonts, images, JS, and the portfolio deck screenshots |
| `mockups/` | The 6 med spa sample sites shown in the Selected Work deck |
| `llms.txt` / `llms-full.txt` | Plain-text brief for AI assistants |
| `ai.txt` / `robots.txt` / `sitemap.xml` | Crawler policy, directives, sitemap |

## Preview

A few assets are referenced with **server-absolute paths** (e.g. `/assets/dispenza/js/dispenza.js`),
so serve the folder rather than opening `index.html` via `file://`:

```
cd SGEN-SEO-MedSpa_White
python -m http.server 8080     # then open http://localhost:8080/index.html
```

## What is light about it

The light theme is entirely presentational and self-contained — an appended
`<style id="light-theme">` block flips the `.surface-dark` / `[data-surface="dark"]` design tokens
to light values and overrides the hardcoded dark grounds to `#ffffff`. Verified at runtime:
`body` and `html` compute to `rgb(255,255,255)`, body ink to `rgb(26,26,26)`, and the
`.surface-dark` sections compute to white.

**Product mockups stay dark by design** — the hero "search visibility" dashboard and the portfolio
deck (`.ppf-e`) are dark app-window screenshots that declare their own tokens and are insulated
from the flip. This matches the dental white reference exactly.

## Portfolio deck — "Med spa sites we've built & ranked"

| # | Brand | Category | Mockup |
|---|---|---|---|
| 1 | Aura Medi Spa | Full-Service Med Spa · Clinical | `mockups/aura-medi-spa/` |
| 2 | BLOC Aesthetics | Aesthetics Studio · Editorial | `mockups/bloc-aesthetics/` |
| 3 | Revive Skin Lab | Skin Clinic · Science-Led | `mockups/revive-skin-lab/` |
| 4 | Renew Wellness Spa | Med Spa + Wellness · Restorative | `mockups/renew-wellness-spa/` |
| 5 | Nuyu | Medical Aesthetics · Elite | `mockups/nuyu/` |
| 6 | Peel Good | Resurfacing Clinic · Retail | `mockups/peel-good/` |

FORM Medi Spa and Lumière Medi Spa were excluded at the owner's request; both remain in the
original `Medi Spas Compiled for SGEN.zip` if wanted back.

`View design →` opens the mockup in the page's lazy **modal iframe**, which derives the path from
the card image filename (`portfolio/<slug>.webp` → `mockups/<slug>/<slug>.html`) — so those slugs
must stay in sync. Nothing loads until a card is clicked.

## Mockup optimization

Carried over from the black bundle (these files are theme-agnostic and byte-identical between the
two): images transcoded to WebP q0.82 capped at 1600px in a content-deduped shared pool
(**65 images, 4.86 MB**), inline base64 photos extracted to files (`nuyu` 1877 KB → 72 KB,
`peel-good` 6785 KB → 66 KB), and Google Fonts localized to `mockups/_shared-fonts/` so no mockup
makes a third-party font request.

## Layout fixes applied 2026-08-04

Appended as `<style id="layout-fixes-2026-08-04-medspa-align">`. Ported from the black bundle after
confirming this bundle's geometry was **identical to black's pre-fix state**, so the same two rules
apply unchanged. Note the dental White V4 reference does **not** carry these — they are a
deliberate improvement over it, requested by the owner on the black build.

- **#55 · THE SHIFT stat cards** — card 3's divider and `Source:` line sat one text-line high
  because its label fits on one line where cards 1–2 wrap to two. Measured here at 1440px:
  `208.17px → 233.55px` from the card top, now matching its neighbours. Scoped `>=921px`.
- **#56 · MORE WINS keyword chips** — the "Laser & Skin" card's three long phrases needed 608.56px
  in a 592px strip and wrapped, making that grid row 334.38px against 296.38px below. Now 519.31px
  and all four cards a uniform **292.38px**. Scoped `>=1280px` (548px available there; only 508px
  at 1200px, where closing the last 11.31px would need ~9px type).

## Verified

- Parity vs `SGEN-SEO-AEO-Dental_White_Optimized_V4`: light-theme block, both logo counts, preload
  / preconnect / defer counts, `chrome.css` bytes, `.htaccess` directives, 5 JSON-LD blocks with 0
  parse errors and 15 FAQ questions, 0 dangling refs — all match. 0 un-transcoded rasters vs the
  reference's 1.
- Render gate at 1440 / 1024 / 768 / 390: 25 images, 0 broken, 0 horizontal overflow, 0 new console
  errors or failed requests vs the reference baseline.
- Deck: 6 cards, 6 dots, all 6 images load, all 6 modal targets resolve, modal opens and loads.
- ROI: 40 × $1,500 → $60,000/mo · $132K/mo · $864K · 8,934%; all 12 presets consistent.
- FAQ accordion toggles (15 items); logo wall 644 nodes, 0 dental terms.
- All 6 mockups render standalone with 0 broken images, 0 console errors, 0 failed requests.

## Optimization gaps — closed 2026-08-04

An audit against the reference found four right-sizing gaps a technique-presence check misses.
All four are now **fixed** here and identically in the black bundle:

| Gap | Before | After | Reference |
|---|---|---|---|
| woff2 serving only non-Latin subsets | 38 files, 573 KB | **0** | 0 |
| Font CSS | 93.8 KB | **42.5 KB** | 39.3 KB |
| `_shared-fonts` total | 1.46 MB | **920 KB** | 935 KB |
| Mockup `<img>` with a loading attr | 13 of 66 | **66 of 66** (60 lazy + 6 eager) | 52 of 68 |
| Mockup `<img>` with `decoding="async"` | 0 | **66 of 66** | 0 |
| WebP carrying an ICC profile | 65 of 65 | **0** | 0 |
| Mockups shipping `server.js` | 4 of 6 | **6 of 6** | 6 of 6 |
| `server.js` with webp/avif/woff2 mime | 0 | **6 of 6** | 6 of 6 |

How each was done safely:

- **Fonts** — the localized Google Fonts CSS shipped every subset the families support. No mockup
  contains a single Cyrillic, Greek or Vietnamese codepoint, so those `@font-face` blocks could
  never be fetched. Pruning kept `latin` + `latin-ext` only (53 faces each), then deleted the 38
  woff2 that no surviving rule referenced. The script asserts that the labelled blocks it parses
  equal the file's total `@font-face` count, and refuses to write if a file would be left with zero
  faces. Result: **28 woff2 — exactly matching the reference's 28.**
- **Lazy-loading** — first `<img>` per mockup marked `loading="eager"` (it is at or near the fold),
  every later one `loading="lazy"`, and `decoding="async"` on all. Image counts asserted unchanged.
- **ICC** — removed the `ICCP` chunk and cleared the ICC flag bit in the `VP8X` header. A lossless
  container edit, not a re-encode, so there is no generation loss; pixel dimensions are asserted
  identical before and after each write.
- **`server.js`** — added for `nuyu` and `peel-good`, and the mime map restored on all six.
  All 12 files across both bundles pass `node --check`.

Verified after the fix: all six mockups render with **0 broken images, 0 console errors, 0 failed
requests, correct font families loading** (Cormorant/DM Sans, Archivo/Inter, Fraunces/Inter/Space
Grotesk, Jost/Lora, IBM Plex Mono/Sans), and the full page gate still passes at four breakpoints.

**One gap remains open by the owner's decision:** mockup image resolution (median longest edge
1500px vs the reference's 809px). Reducing it further trades bytes against mockup fidelity, and
was explicitly declined.

## Known pre-existing gaps (from the source export)

- `assets/css/apply-v2.css` is referenced but was not included in the source export.
- `assets/dispenza/js/dispenza.js` is referenced with a server-absolute path.
- `https://www.sgen.com/sg-collect` is an SGEN analytics beacon (network-only).

All three are referenced identically in the dental source — zero new failures introduced.

## Verify before publishing

Statistics carried over from the reference (60% zero-click, 3.4× AI referrals, 47% ask ChatGPT,
500+ ranked, $47M+, 9+ yrs, 4.9/5) are flagged by the content map as **unverified illustrative
benchmarks**. The 47% figure originally measured *dentists* — the map explicitly asks for a
med-spa-specific figure. Client names, results, reviews and the 80-name logo wall are
fictional/illustrative, as in the source page.

© SGEN. All rights reserved.
