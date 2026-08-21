# SGEN — Cannabis Dispensary Local SEO + AEO · Black (dark)

Retarget of `SGEN-SEO-AEO-Dental_Black_Optimized_V4` from **dental** to **cannabis dispensaries**.
Content from `Cannabis_Dispensary_Content_Map.xlsx` (11 sheets); sample sites from
`Dispensary - Copy.zip` (a zip of 6 nested per-site zips).

Method: the source is a complete static export, so this is a **verbatim file-tree copy +
count-asserted content surgery** — not a tokenize/re-emit rebuild. Every string replacement
declared how many occurrences it expected and refused to write anything on a mismatch. That
discipline caught five real source-string errors that a blind find-and-replace would have
skipped silently (see "Errors the assert-counting caught" below).

## What changed

| Area | Change |
|---|---|
| Meta / SEO | title, description, og/twitter, canonical, breadcrumb → `cannabis-dispensary-local-seo-aeo` |
| Hero | H1 typed queries → "dispensary near me" / "Recreational dispensary near me"; subhead adds Weedmaps + Leafly |
| Rank widget | `dispensary near me`, `edibles near me`, `pre-rolls near me` |
| ChatGPT answer mock | now cites lab-tested flower + in-store pickup |
| Case-study cards | 31 cards → 25 dispensary clients across legal US/CA markets |
| GSC dashboards | 10 businesses renamed; 4 stale comments (EasyCleanouts / Dr. Amara / Summit Tree & Stump / Pacific Coast Movers) aligned — these were already wrong in the dental reference |
| Portfolio deck | 6 real supplied mockups (see below) |
| Reviews | 9 reviewer role labels + 8 review bodies |
| ROI calculator | 11 dispensary types, 10 presets, new defaults, recomputed static fallback |
| Compare grid | "Cannabis-first, built for dispensary foot traffic & delivery" + ad-ban differentiator |
| Logo wall | 80 fictional dispensary names; `tooth` glyph → `leaf`/`flower`/`lotus`/`drop`/`truck`/`spa` |
| FAQ | 6 questions + 9 answers rewritten (visible **and** JSON-LD) |
| Apply overlay | markup **and both JS copies** — headline, sub, scarcity line, field labels |
| Schema | audience + audienceType; **United Arab Emirates removed from `areaServed`** (cannabis is illegal there) |
| Compliance | Google/Meta Ads references → Weedmaps/Leafly (both ad networks ban cannabis) |
| Ancillary | `llms.txt`, `llms-full.txt`, `ai.txt`, `sitemap.xml`, `.htaccess` |

## Sample sites in the deck

Owner decision: the deck uses the **real supplied mockups' own brands**, not the invented names on
the content map's "Sample Websites" sheet — so each card label matches the site its modal opens.

| Slot | Site | Category |
|---|---|---|
| 1 | Bloomhaus | Recreational · Online Ordering |
| 2 | Northlight Cannabis Co. *(deck opens here)* | Licensed Dispensary · Delivery |
| 3 | North Canopy | Neighborhood Shop · Olympia WA |
| 4 | Neon Leaf | Las Vegas · Open 24/7 |
| 5 | Golden Hour Cannabis | Recreational · Express Pickup |
| 6 | CannMenus | Cannabis Data · Market Intelligence |

Deck order is owner-specified. DOM order **is** deck order — the carousel builds its card array from
`deck.querySelectorAll('.e-card')` and indexes it positionally; `data-i` is inert legacy (0 rules in
`chrome.css`, never read by the JS) and was renumbered 0–5 to match. Northlight keeps `data-open`,
so the deck still opens on it.

## Optimization

| Metric | Reference (dental V4) | This build |
|---|---|---|
| Files | 227 | 305 |
| `chrome.css` | 788,972 B | 788,972 B (byte-identical) |
| `_shared-img` | 56 files, 1.90 MB, median 809 px | 136 files, **7.43 MB**, median 1024 px, max edge 1280 px |
| `_shared-fonts` | 28 woff2, 6 css, 98 faces | 26 woff2, 6 css, 94 faces |
| Portfolio cards | 6 @ 1600×1000, all carry ICC | 6 @ 1600×1000, **0 carry ICC** |
| Mockup lazy coverage | 52/68 (76%) | 132/132 (**100%**) |
| Un-transcoded rasters in mockups | 1 | 0 |

- **87 Unsplash images were remote** in the supplied mockups. All are now self-hosted and
  transcoded, so the bundle is fully self-contained (the dental reference had 0 external image
  refs; matching that was a hard requirement).
- Fonts pruned to `latin` + `latin-ext`: **218 → 94 faces**, 7 orphaned woff2 deleted.
- 136 images transcoded from 27.6 MB → **7.43 MB** (WebP q0.80, long edge capped 1280 px),
  re-encoded **from the originals**, never from the already-lossy WebP (that would add generation
  loss — playbook trap 9). Average image 72 KB → 56 KB; files over 200 KB went 12 → 1; the heaviest
  single image 492 KB → 278 KB.
- Median longest edge 1024 px is within the 1.3× tolerance of the reference's 809 px (≤ 1052).


## Measured load profile

The landing page is at parity with the dental reference it was cloned from:

| | Reference (dental V4) | This build |
|---|---|---|
| Local requests on load | 40 | 40 |
| Landing-page payload | 2.53 MB | **2.50 MB** |
| External network calls | 31 | 31 |

The 31 external calls (leadconnectorhq, Facebook, Reddit, Google Fonts, the `sg-collect` beacon)
come from the source platform and are byte-identical in both bundles — wall-clock timing swings
run-to-run because of them, not because of anything in the bundle.

**The mockup assets are not landing-page weight.** 8.87 MB under `mockups/` is fetched only when a
visitor opens a deck modal; the landing page itself never requests it. The re-optimization pass
above targeted exactly that, so opening a sample site is faster while the landing page is unchanged.

## Verified

Rendered at 1440 / 1024 / 768 / 390:

- 0 broken images, 0 horizontal overflow at every breakpoint
- **0 NEW console errors and 0 NEW failed requests** vs the reference's own baseline. The
  reference itself logs 10–14 errors / 6–8 failed requests (file:// CORS on fonts + the
  `sg-collect` beacon); the build logs 12/7 and the error set is identical.
- Deck: 6 cards == 6 dots; all 6 modal targets resolve on disk
- ROI: defaults 40 × $900 → $36,000/mo · $79,200/mo · $518K · 5,320% — static fallback matches
  what the JS computes; all 10 presets seed the sliders without clamping
- FAQ accordion toggles (0 → 96 px); logo wall renders 640 nodes with **0** dental terms
- All 5 JSON-LD blocks parse; FAQ is 15 questions in both JSON-LD and visible markup
- Each mockup renders standalone: 0 broken images, 0 console errors, 0 failed requests, and the
  correct font families load at the weights actually used — which is what proves the subset
  pruning was safe
- Visible-text sweep: **632 → 3 hits**, each justified below

## Errors the assert-counting caught

1. `Cherry Creek` GSC row uses a **raw `&`**, not `&amp;`.
2. The hero H1 is **split across spans** (`tw-sr` + hidden `tw-size`), not one text node.
3. `best dentist near me` occurs **3×**, not 2 — the third is the Shift-section lead.
4. `Dental-first, built for patient catchment` occurs **4×** — once in the desktop grid and once
   per column in the three mobile lists.
5. `Only 5 new practices onboarded per month` occurs **3×** — markup plus both JS copies.

## Justified survivors (3)

1. `Patient, effective,` — review 5 uses **"patient" as an adjective**; the content map keeps it.
2. `adds the design-system` — contains the letters "dds"; a false positive.
3. `tooth:` — an unused glyph in the shared icon library, which also carries `paw`, `glasses`,
   `eye` for other verticals. Not visible text.

## Open / needs owner input

1. **Meta title and description were trimmed.** The content map's own values exceeded its stated
   guidance (title 69 chars vs ≤60; description 179 vs 150–160) and would truncate in SERPs.
   Per owner decision they were shortened to:
   - title (42): `Cannabis Dispensary Local SEO & AEO | SGEN`
   - description (154): `Local SEO and AEO for cannabis dispensaries — rank in Google Maps, Weedmaps and Leafly, and get cited by ChatGPT and Gemini. From $497/mo, month-to-month.`
2. **CannMenus is not a dispensary** — it is a B2B cannabis market-intelligence product that reads
   live dispensary menus. Kept in the deck per owner decision; it is the one off-archetype card.
3. **Statistics are illustrative.** The content map flags the 60% / 3.4× / 47% figures and the
   `500+` / `$47M+` / `9+ yrs` counters as illustrative or SGEN-portfolio numbers. Verify before
   publishing.
4. **Case-study client names are fictional**, matching the reference's own convention.
5. **`--paper` is sampled from each design's computed `body` background**, per playbook §5 Phase C.
   The reference's own inline CSS comment says "sampled from each design's own hero" — the two
   disagree; the playbook was followed. Affects only the load-time backdrop behind each card.
6. **GSC charts are SVG-drawn, not screenshots.** The content map asks for "a real dispensary GSC
   export"; there is no raster to swap, so the synthetic chart remains and the business names
   around it were retargeted.
7. **Mockup age gates are intact.** The three 21+ gates (Bloomhaus, Neon Leaf, Northlight) still
   work in the mockups; they were dismissed only to capture the portfolio card heroes.
