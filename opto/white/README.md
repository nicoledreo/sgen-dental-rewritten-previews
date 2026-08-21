# SGEN Optometry (Light) — Local SEO + AEO Landing Page

**Light/white-theme** editable static bundle of the SGEN Local SEO + AEO landing page, retargeted
to **optometry / eye care**. Cloned from `SGEN-SEO-AEO-Dental_White_Optimized_V4` and rewritten
against the owner's `Optometry_Landing_Page_Content_Map.xlsx`. This is the light counterpart of
`SGEN-SEO-Opto_Black - Optimized` — identical content, stats and website samples on the dark
theme. Built from the WHITE V4 source (never by re-theming the dark build), so the theme is
correct by construction. Static HTML/CSS/JS, no build step.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | The optometry Local SEO + AEO landing page — **light theme** |
| `chrome.css` | Shared stylesheet — **byte-identical to the V4 reference** (788,972 B) |
| `assets/` | Fonts, images, JS, and the portfolio deck card screenshots |
| `mockups/` | 6 standalone optometry sample sites (opened by the deck's modal) |
| `llms.txt`, `llms-full.txt`, `ai.txt`, `robots.txt`, `sitemap.xml`, `.htaccess`, `deploy/` | The AEO/crawler layer |

## Preview

Some assets use server-absolute paths, so serve the folder rather than opening `file://`:

```
cd "SGEN-SEO-Opto_White - Optimized"
python -m http.server 8080     # then open http://localhost:8080/index.html
```

Each mockup also ships its own `server.js` (ports 7020–7025) with a full mime map.

## Light vs dark

Both bundles share identical content, scripts and components — only 2 of **251** files differ
(`index.html` and this README), mirroring the V4 reference pair's own 2-of-227 delta.
(230 files before the American Eye mockup was added on 2026-08-05.)

- **Light-theme stylesheet** — an appended `<style id="light-theme">` block flips the dark
  surface tokens and page grounds (`#0a090b` / `#0d0d0f`) to `#ffffff`.
- **Logo** — light uses `sgen-logo.png` (x10); the 3 remaining `sgen-logo-3.webp` references are
  intentional (the mobile-menu and apply-overlay brands sit on dark surfaces). Counts match the
  white reference exactly.
- **Product mockups stay dark by design** — the hero dashboard and portfolio deck are dark app
  screenshots and are insulated from the flip, matching the white reference.

Verified at runtime: html/painted background `rgb(255,255,255)` and hero text `rgb(26,26,26)` —
**identical to the white V4 reference**, and distinct from the dark bundle.

## What was retargeted (dental → optometry)

Copy came from the owner's content map (155 rows) — **208 audited substitutions**, every one
assert-counted so a string that matched nothing threw instead of silently no-opping.

- **Meta / SEO / social / schema** — title, description, og:*, twitter:*, canonical, and the
  URL slug `dental-local-seo-aeo` → `optometry-local-seo-aeo`. All **5 JSON-LD blocks**
  (BreadcrumbList, FAQPage, Organization, Service, WebPage) rewritten and **verified to parse**.
- **Hero** — H1, lead, trust chips, the rotating typed phrases (`optometrist near me`,
  `Eye Clinic Near Me`, `eye exam near me`, `Dry eye treatment near me`) and the rank-widget
  keywords (`optometrist near me`, `eye exam near me`, `dry eye treatment near me`).
- **All body sections** — the shift/two-engines/first-7-days/deliverables, Search Console
  dashboards, win cards, reviews, compare table, by-the-numbers, pricing, 6-step method.
- **FAQ** — 15 Q&A, rewritten in **both** the visible accordion and the FAQPage JSON-LD.
- **ROI calculator** — 11 optometry specialty presets, defaults **40 new patients × $450**
  first-year value. Slider maxima checked in the markup (jobs 80, ticket 6000) so no preset
  clamps. The no-JS static fallback was recomputed to match the JS exactly.
- **Portfolio deck** — 6 dental cards → **5 optometry cards** at retarget time; a sixth,
  **American Eye**, was added on 2026-08-05 (below).
- **Logo wall** — all **80** practice names, taglines and icon glyphs swapped to eye-care
  equivalents (`Brightwater Dental Care` → `Brightwater Eye Care`); 0 dental terms remain.
- **Application overlay** — service placeholder and step copy.
- **Ancillary files** — `llms.txt`, `llms-full.txt`, `ai.txt`, `sitemap.xml`, `.htaccess`.

### Portfolio deck — "Optometry sites we've built & ranked"

Six real optometry mockups. Each card opens the **actual site** in the deck's modal.

| # | Site | Category | Mockup |
|---|------|----------|--------|
| 1 | Spectacles | Eyewear + Eye Exams · Retail | `mockups/spectacles/` |
| 2 | Visualyze | Optometry Clinic · Service | `mockups/visualyze/` |
| 3 | Metro Sunnies *(deck opens here)* | Eyewear E-commerce · Lifestyle | `mockups/metro-sunnies/` |
| 4 | American Eye *(added 2026-08-05)* | Eye Care Clinic · Multi-Location | `mockups/american-eye/` |
| 5 | Spec-ulation | Eyewear E-commerce · Editorial | `mockups/spec-ulation/` |
| 6 | Focus Pocus | Eyewear + Eye Exams · Family | `mockups/focus-pocus/` |

Card images are rendered at **1600×1000** — the V4 reference's exact card dimensions. The
supplied zip's cards were 1000×1400 portrait and could not be used as-is without distorting the
deck, so each card was re-rendered from its own mockup, with `--paper` sampled from that design's
computed background rather than invented.

> One of the originally supplied designs, **Spex**, was dropped by owner decision: no standalone
> mockup HTML exists for it anywhere, so its card would have been the only one with a dead
> "View design" link. A sixth card, **American Eye**, was added later (below).

### American Eye — deck position 4 (added 2026-08-05)

Placed **immediately after Metro Sunnies** by owner direction, so the two strongest cards sit
side by side at the front of the deck; Spec-ulation and Focus Pocus shifted to 5 and 6. The deck
still opens on Metro Sunnies (`data-open`), which puts American Eye in the first slot to its right.
Order is DOM order — the deck JS reads `deck.querySelectorAll('.e-card')` and never reads
`data-i`, so the `<article>` blocks themselves were moved; `data-i` was renumbered to match.

Built from the supplied `american-eye-site (1).zip` (21 files, **13.68 MB**) and put through the
same optimization pipeline as the original five. Net result: **13.68 MB → 1.25 MB (90.9% smaller)**
with no visual or functional loss.

| Step | Before | After |
|---|---|---|
| Hero video | 2 files, 12.52 MB — 2560×1440 @59.94 fps, plus a **189 kb/s AAC track on a `muted` video** | **1 file, 0.53 MB** — 1280×720 @30 fps, H.264 High, CRF 28, no audio, `+faststart` (**95.8% smaller**) |
| Photos | 14 JPG, 1.06 MB, up to 2160 px | 14 WebP, **0.39 MB**, 1024 px cap, q 0.82, **ICC stripped from all 14** (62.9% smaller) |
| Fonts | Google Fonts CDN `<link>` (runtime third-party request) | self-hosted woff2, **7 subsets → 2** (latin + latin-ext), **31 faces → 10**. Of 4 woff2 URLs only **2 are new files** — Inter's two are byte-identical to fonts already in `_shared-fonts` and deduped. |
| `<img>` attrs | `loading="lazy"` on 13/13, no `decoding`, no intrinsic size | `decoding="async"` + intrinsic `width`/`height` on **13/13** |
| Video preload | `preload="auto"` (pulls the whole clip on modal open) | `preload="metadata"` — the poster covers the gap |

Video quality was measured, not assumed: **SSIM 0.985** against a lossless 1280×720/30 fps
reference of the same source. CRF 26/28/30/32 were all encoded and compared before picking 28.

The bundled alternate clip (`hero-eye-alt.mp4`, 5.70 MB) was **dropped**. Its two `<source>` tags
were both H.264 MP4, so the second could never act as a codec fallback — the supplied README
describes it as a *design option* ("swap the order to use it as the primary"), i.e. dead weight
inside a portfolio modal. The original file is still in the source zip if you want to swap it in.

**Encoding defect fixed in the source.** The supplied `index.html` was double-encoded
(UTF-8 → windows-1252 → UTF-8): its title read `American Eye â€” Eye Care Clinic`, and the hero
chip read `Trusted Eye Care Â· New York`. 5,038 of its non-ASCII characters were mojibake. This
was reversed losslessly — the repair is proven by re-applying the forward damage to the fixed text
and getting the original file back **byte-for-byte**. Shipping the zip as supplied would have put
visible garbage characters in the modal.

Card image rendered at **1600×1000** like the other five, with the hero video live in frame.
`--paper:#040D1E` is the design's own `.hero-bg { background-color: var(--navy) }` — read from the
source, not invented. It is the deck's first dark card; `data-dark="1"` is set accordingly.

New directory: **`mockups/_shared-video/`**. `.htaccess` and `deploy/_headers` gained a matching
1-year immutable cache rule for `video/mp4` (they previously covered css/js/webp/woff2 only).
The Report-Only CSP needed no change — the clip is same-origin and already covered by
`default-src 'self'`.


### Retained by owner decision: "Real practices. Before & after."

The content map's "How to Use" sheet lists this section as EXCLUDED (and row 2.5 anticipates
repointing nav item "01" to the portfolio). It was **kept by explicit owner decision** — the
section is already fully retargeted to eye care (BrightView Eye Care · Toronto, Dr. Amara Eye
Care · myopia management, Dubai) and carries useful social proof. Nav item "01" therefore still
points to `#case-study`, not `#portfolio`.

Its figures (0 → 115+ new-patient calls, +4,900% organic traffic, $85K+/mo) are **illustrative**
and must be replaced with verified client data before publishing — see open item 3.

## Optimization

Retargeting preserved the V4 optimization standard; on several measures it improves on it.

| Measure | This bundle | V4 reference |
|---|---|---|
| Mockup payload (`_shared-img` + `_shared-fonts` + `_shared-video` + 6 mockup HTML) | **4.42 MB** — from 12.85 MB of source imagery for the first five plus 13.68 MB for American Eye | — |
| `_shared-img` | **84** files / 2.67 MB / median **1024 px** / max 1024 px | 56 / 1.90 MB / 809 px |
| WebP carrying ICC | **0** (of 84) | 0 |
| `_shared-video` | **1** file / 0.53 MB (H.264 720p30, no audio, faststart) | — |
| `_shared-fonts` | **24** woff2 / 0.75 MB, 106 faces across 6 css | 28 / 0.87 MB |
| Font subsets | latin + latin-ext only (**248 → 106** faces; cyrillic/greek/vietnamese/hebrew pruned) | latin + latin-ext |
| `<img>` loading attribute | **93/93 (100%)** — 88 lazy + 5 eager | 47/68 (69%) |
| `<img>` decoding attribute | **93/93 (100%)** | — |
| Un-transcoded rasters | **0** | 1 |
| External asset URLs / inline base64 rasters | **0 / 0** | 0 / 0 |
| `chrome.css` | 788,972 B — **byte-identical** | 788,972 B |

`metro-sunnies` additionally needed **17 remote Unsplash images** localized — 9 referenced in
markup and 8 more built at runtime inside a JavaScript product catalog, which no attribute-level
pass can see. Without that the bundle would not have been self-contained.

## What was verified

Rendered at **1440 / 1024 / 768 / 390**:

- 0 broken images · 0 horizontal overflow · **0 NEW** console errors and **0 NEW** failed
  requests, diffed against the reference's own pre-existing baseline (14 errors / 8 failed
  requests, from a missing `assets/css/apply-v2.css` and CORS calls to live sgen.com endpoints).
- Deck: **6 cards == 6 dots**, `data-i` runs 0–5, every card image loads at 1600×1000, **every
  modal target resolves on disk**, and the modal opens and loads the real document.
- Re-verified after the American Eye addition (2026-08-05), over HTTP, at **1440 and 390**, with a
  copy of the pre-edit `index.html` served side by side as the control: **0 NEW console errors and
  0 NEW failed requests** (14 / 7 on both). The new card's "View design" was **clicked**, not
  simulated — modal opens, iframe resolves to `mockups/american-eye/american-eye.html`, title
  reads "American Eye", body scroll locks, the mockup renders **0 broken images of 13**, the hero
  video decodes (`readyState 4`, 1280×720), Bricolage Grotesque + Inter both load, **0 mojibake in
  the rendered text**, and closing resets the iframe to `about:blank` and unlocks the body.
  Themes stayed distinct: dark `rgb(10,9,11)`, light `rgb(255,255,255)`.
- ROI: all four outputs match, all 11 presets compute with **0 clamped**.
- FAQ accordion toggles across all 15 items; logo wall renders 644 nodes with **0** dental terms.
- **Full visible-text sweep: 0 old-industry terms.**
- Optimization parity checked as two separate verdicts — techniques present **and** assets
  right-sized — both PASS.
- Each mockup standalone: 0 broken images, 0 console errors, 0 failed requests, and the
  **correct font families actually loading** (this is what proves the subset pruning was safe).


## Post-delivery audit: content map vs. the V4 reference

A 12-agent adversarial completeness audit was run against the DELIVERED bundle, checking every
content-map row (all three sheets, including the How-to-Use sheet) rather than merely sweeping
for dental words. Result: **28 findings, 0 blockers, and 0 in the highest-value category —
`stale-dental-semantics` (copy with no dental word that still only makes sense for dentistry).**

Structural parity with the reference was then proven directly: of **3,047 element signatures,
only 7 differ — all of them the deck-card sub-elements (6 → 5)**, i.e. the single intentional
change (dropping Spex). The retarget altered content only.

*(That audit predates the American Eye addition of 2026-08-05, which deliberately takes the deck
back to 6 cards. The count above is the state at retarget delivery, not a live figure.)*

Every remaining finding is therefore a **content-map vs. reference divergence**, not a defect
introduced here. The map describes an idealised page that the V4 reference does not implement.
Each was checked against the reference and confirmed byte-identical:

| Content map asks for | V4 reference actually has | Status |
|---|---|---|
| §1 Announcement / top bar ("kept from source") | **No announcement bar in any version** — not in V4, not in the older Opto V3 | Never existed; map error |
| §2.2-2.4 Product / Why SGEN / Pricing mega-menu | `#mm-host` exists but has **no trigger** and V4 deliberately added `inert` | Intentionally disabled upstream |
| §19.4 optometry goal chips, §19.6 nine clinical services | Generic SGEN agency options ("Generate More Leads", budget bands) — **zero dental vocabulary** | Byte-identical to reference |
| §15.6 "best value" badge | "Most popular" (×6) | Byte-identical |
| §13.3 four comparison columns | Three columns (no DIY) | Byte-identical |
| §7.2 "Twenty-two deliverables" | Claim present, 20 listed | Pre-existing mismatch |
| §8 Search Console real data | 10 charts badged "Sample · illustrative data" | Byte-identical |
| Pricing tier names | Apply overlay still uses legacy "Foundation/Accelerate/Authority" | Pre-existing |

**None of these were changed.** Altering them would mean adding features the reference never had,
breaking the clone fidelity this build was commissioned to preserve. They are listed here so the
decision is yours: each is a small, well-scoped edit if you want the page to match the map rather
than the reference.

One genuine content nit worth knowing: the Vancouver win card renders bare place names as ranking
chips ("#1 New Westminster", "#1 Burnaby") — neither is a rankable query on its own.

### Win-card keyword chips — one line per card (2026-08-05)

The "New-patient search capture" card wrapped its three chips 2+1 while the other three cards sat
on one line. Measured rather than eyeballed: that row needed **622 px** of chips against a
**592 px** container at 1440 (+30 over), **+74** at 1280 and **+202** at 1024.

Fixed in `<style id="layout-fixes-2026-08-05-win-chips">` (last block, wins the cascade) by
trimming the chip chrome — rank badge 21→16 px, padding `5px 10px 5px 5px`→`4px 7px 4px 3px`,
gap 6→4 px — and scaling the label with the viewport, `clamp(9.6px, 0.68vw, 10.5px)`.
Re-measured after: **all four rows are 1 line at every width from 1280 px up**, with 20–63 px to
spare (1280 −20, 1351 −55, 1440 −57, 1600 −26). Page horizontal overflow re-checked at 13 widths
from 1920 down to 390: **none**.

Two deliberate limits:

- **`flex-wrap` is left ON.** Forcing `nowrap` would fit the row by truncating a phrase or by
  pushing a scrollbar onto the page. Wrapping stays as the safety valve, so the one-line result is
  achieved by actually fitting, not by clipping.
- **768–1279 px stacks one-per-line instead.** The row is only 292–548 px wide there; three
  geo-qualified keywords would need roughly **7 px** type at 1024 to share a line. That band now
  uses the same one-per-line stack the ≤767 px rule (#52) already applied, so it reads as a clean
  list rather than a ragged 2+1 wrap. If you would rather have one line at those widths too, the
  only honest way is to shorten the keyword text — see the note below on why that was not done.

**Keyword text was not shortened.** All three chips repeat "springfield mo", which the card also
shows as its location line, so dropping it would have made everything fit trivially. It was left
alone because these chips assert *ranked queries* — "#1 myopia specialist" claims something
different from "#1 myopia specialist springfield mo", and stripping the city would reproduce
exactly the Vancouver-card defect flagged directly above. Say the word if you want it anyway.

## Open items

1. **ROI methodology changed to match the content map.** The dental build computed
   *net* ROI — `(annual lift − annual cost) / annual cost` against the **$797** retainer. The
   content map specifies the **$1,297** SEO+AEO tier and a *gross* `lift / cost` ratio, giving
   **1,665%**. The page now implements the map's method. If you want the conventional net-ROI
   reading restored, that is a one-line change in `roiCalc()` (it would show 1,565%).
2. **`focus-pocus` has a ~159 px horizontal overflow at 1280 px.** This is **pre-existing in the
   supplied design** (1444 px before any edit here) and is *smaller* than the equivalent defect
   the V4 reference itself ships (`sovereign-dental`, 267 px). Traced to a marquee/off-canvas
   overhang; a containment fix was tried, had no effect on scrolling, and was reverted rather
   than leave a dead edit in a third-party design. Cosmetic, inside a lazy modal iframe.
   *Correction (2026-08-05):* re-measured against the pre-change bundle as a control, the overflow
   is **not desktop-only** — `focus-pocus` also overflows at **390 px (471 vs 390, +81 px)**. The
   desktop figure also drifts run to run (1424–1450 px) because the overhang is an animated
   marquee. Both readings are identical on the control, so this is unchanged, not a regression.
   The other five mockups — including the new `american-eye` — show **0 overflow at 1280 and 390**.
3. **Statistics still need owner verification before publishing** — `500+ practices ranked`,
   `$47M+ revenue`, `4.9/5 · 50+ reviews`, `9+ yrs`, and the 47% "use ChatGPT to find a local eye
   doctor" figure (the content map flags this one as originally a dental stat: *"verify the
   figure applies to eye care"*). ROI figures are illustrative by the map's own labelling.
4. **Testimonials are the source bundle's, reworded for eye care.** Use real named clients with
   consent before publishing.
5. The unused `tooth` glyph remains in the shared 26-icon library — harmless and symmetrical
   with the dental build, which ships unused `eye` and `glasses` glyphs.
6. **The American Eye mockup's own content is placeholder**, exactly as its source ships it: the
   three doctor portraits are Unsplash stock, and the testimonials, "3 NYC locations", insurance
   list, phone/email and map links are all representative. Its own `ASSETS.md` carries the
   licensing (Pexels + Unsplash, both commercial-OK, no attribution required) and the same
   warning. Fine for a portfolio sample; replace before it is ever used as a live client site.
7. **The hero video is now 720p30 rather than the supplied 1440p60.** That is the whole point of
   the 95.8% saving and it is the right call inside a ~1120 px modal iframe, but if this mockup is
   ever repurposed as a real full-screen site, re-encode from the original clip in the source zip
   at a higher resolution.
