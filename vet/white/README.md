# SGEN — Veterinary Local SEO + AEO · White (light)

Retarget of `SGEN-SEO-AEO-Dental_White_Optimized_V4` from **dental** to **veterinary / animal clinics / animal hospitals**.
Content from `Veterinary_Landing_Page_Content_Map.xlsx`; sample sites from `Vet and Animal Hospital.zip`.

Method: the source is a complete static export, so this is a **verbatim file-tree copy + count-asserted
content surgery** — not a tokenize/re-emit rebuild. Every string replacement declared how many
occurrences it expected and threw on a mismatch.

## Revision — multi-page sample sites, refreshed Desert Paws, new deck order

1. **Desert Paws rebuilt from the newer export** (`desert-paws-full.zip`, 2026-08-07). That
   version moved its styling out into `design-system/tokens.css` + `structural.css`, which the
   sub-pages depend on entirely — those are now shipped. Its `tokens.css` also `@import`s a
   *wider* set of font weights than the homepage `<link>` requests; both are collected, so the
   sub-pages render with their real type.
2. **Multi-page sample sites now navigate inside the deck modal.** Desert Paws (5 pages) and
   Harbor Paws (6 pages) ship every real page, and their nav links resolve — click Services /
   About / Team / Contact / Emergency / Book inside the popup and the page opens. The homepage is
   renamed `<slug>.html` (the modal derives that path from the card image), and every nav
   reference to `index.html` was rewritten to match. Handoff artifacts (`lock-preview.html`,
   `design-system.html`, `brand-card.html`, `README.md`, `sitemap.yaml` and ~90 MB of PNG
   screenshots) are excluded.
3. **Deck order** is now Harbor Paws → **Beacon Animal Hospital** (opens here) → The Pawsitive Vet
   → Desert Paws → Haven Animal Hospital → Pawspital.

The extra pages cost **no** optimization: they share the one content-hash-deduped image pool and
the one pruned font set, and every image on every page carries a `loading` attribute.

## Sample sites in the deck

| Slot | Site | Pages | Category |
|---|---|---|---|
| 1 | Harbor Paws | 6 | Wellness & Surgery · Same-Day Booking |
| 2 | Beacon Animal Hospital *(deck opens here)* | 1 | Emergency & Critical Care · 24-Hour |
| 3 | The Pawsitive Vet | 1 | Neighborhood Practice · Wellness & Dentistry |
| 4 | Desert Paws | 5 | Bilingual Family Care · Urgent |
| 5 | Haven Animal Hospital | 1 | Full-Service Hospital · Emergency |
| 6 | Pawspital | 1 | Companion Care · Dogs & Cats |

- `beacon-animal-hospital` — 1 page: beacon-animal-hospital.html
- `desert-paws` — 5 pages: about.html, contact.html, desert-paws.html, services.html, team.html
- `harbor-paws` — 6 pages: about.html, book.html, contact.html, emergency.html, harbor-paws.html, services.html
- `haven-animal-hospital` — 1 page: haven-animal-hospital.html
- `pawspital` — 1 page: pawspital.html
- `the-pawsitive-vet` — 1 page: the-pawsitive-vet.html

Card names use the **real brand of each supplied mockup**, so a card always matches the site its
modal opens. The content map's Portfolio sheet proposed six different invented names; those were
**not** used — owner decision.

## Optimization (vs the source reference)

Techniques **identical** to the reference: preload 8, preconnect 2, defer 21, lazy 22, decoding 22,
fetchpriority 5, 5 JSON-LD blocks, 0 inline base64 rasters, 0 un-transcoded rasters, `.htaccess`
31 directives, and `chrome.css` **byte-identical** (md5 `6b34ff2432db5824ccb83fa035147f9e`).

| Metric | Reference | This build |
|---|---|---|
| mockup pages | 6 | 15 |
| mockup images | 68 | 117 |
| images carrying `loading` | 52 / 68 (76%) | **117 / 117 (100%)** |
| `_shared-img` files | 56 | 102 |
| `_shared-img` bytes | 1,997,000 | 3,299,640 |
| median longest edge | 809 px | 788 px |
| bytes / file | 35,661 | 32,349 |
| bytes / pixel | 0.0658 | 0.0558 |
| WebP carrying ICC | 0 | 0 |
| `@font-face` subsets | latin + latin-ext | latin + latin-ext (0 non-Latin faces) |
| woff2 | 28 / 917,048 B | 34 / 1,108,136 B |
| portfolio cards | 6 x 1600x1000 / 491,512 B (6 with ICC) | 6 x 1600x1000 / 383,814 B (**0** with ICC) |

Images are **right-sized against their measured on-page display size** across all 15 pages
(2x for retina, capped 1600, re-encoded from the originals to avoid generation loss) — that pass cut
2,169,674 B and brought the median to 788 px. The pool is larger than the reference only because the
six sites genuinely contain 117 images across 15 pages vs 68 across 6; **per file and per
pixel this build is more efficient than the reference.**

Bundle: **294 files, 10,474,116 bytes.**

## Verified

- Renders at 1440 / 1024 / 768 / 390: **0 broken images, 0 horizontal overflow**.
- Console: 5 errors / 4 failed requests at every viewport — **identical to the reference's own
  pre-existing baseline, 0 new** (live `sgen.com` cart/collect XHRs blocked by CORS on localhost,
  plus an `/assets/css/apply-v2.css` the source also lacks).
- Deck: 6 cards / 6 dots in the order above; all card images load at 1600x1000; all 6 modal targets
  resolve on disk; the modal opens and loads the real document.
- **Every sub-page of both multi-page sites returns HTTP 200 with its own title, 0 broken images,
  0 overflow and its correct font families loading.**
- ROI: all 11 presets compute, 0 clamped; the no-JS static fallback still agrees with the JS
  (40 x $1,200 = $48,000/mo; x2.2 = $105.6K/mo; annual lift $691K).
- FAQ: 15 items, accordion opens and closes. Logo wall: **0** old-industry terms.
- Visible-text sweep: 8 dental-vocabulary hits, all legitimate veterinary copy.
- Theme: `body` computes to `rgb(255, 255, 255)`; light-theme block present (<style id="light-theme">); logos sgen-logo.png x10, sgen-logo-3.webp x3 —
  matching the white (light) reference exactly.
- 0 dangling references (the one regex hit is a JS template string, present in the reference too).

## Open / worth knowing

1. **Sample data stays illustrative.** Case-study, Search Console and logo-wall figures are the
   reference's own sample numbers with veterinary names applied, labelled as samples on the page.
   They are **not** real veterinary client results.
2. Per the content map's "How to Use" row 4, the **before** half of every before/after is dropped:
   17 case-study rows are results-only and 10 Search Console "from NN" starting positions removed
   (clicks / impressions / CTR growth is kept, as the map specifies).
3. **Three sites originally hot-linked every image from Unsplash** (Beacon, Pawspital, The Pawsitive
   Vet). Those photos are downloaded and baked in as local WebP, so the bundle is self-contained but
   that photography is frozen at build time.
4. **Pawspital cited `cdnjs .../aos.min.js`, which 404s upstream** — the original shipped a broken
   script. AOS is now inlined from `aos.js`; the page has no external dependency.
5. Only pages a site actually links are shipped; handoff/design-system documentation pages are not.
   `design-system/` assets are shipped **only** where a page really loads them (Desert Paws and
   Harbor Paws); The Pawsitive Vet's unused copy was removed.
6. The content map states the portfolio cards are 1000x1400. The measured reference truth is
   **1600x1000**, and that is what was built.
7. `GLYPHS` still carries the now-unused `tooth` path (shared glyph library; harmless), and the
   white bundle retains an inherited CSS build comment from the earlier dental revision batch.

## Layout

```
index.html          the landing page
chrome.css          SGEN chrome (byte-identical to the reference)
mockups/            6 sample sites (15 pages) + _shared-img (102 WebP) + _shared-fonts (34 woff2)
assets/             SGEN assets + in-pages/portfolio (6 deck cards)
deploy/ dispenza/ sites/ _xorigin/     unchanged from the reference
llms.txt llms-full.txt ai.txt robots.txt sitemap.xml .htaccess
```

Each sample site has a `server.js` (full mime map incl. webp/avif) for standalone preview:
`node mockups/<slug>/server.js` then open the printed URL.
