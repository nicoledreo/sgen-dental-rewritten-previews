# SGEN Chiropractic (Dark) — Local SEO + AEO Landing Page

**Dark/black-theme** editable static bundle of the SGEN Local SEO + AEO landing page,
retargeted from **dentistry to chiropractic**. Counterpart of the
`SGEN-SEO-Chiro_White - Optimized` bundle — identical chiropractic content, stats and
website samples, rendered on SGEN's dark theme. Static HTML/CSS/JS — no build step.

Source reference: `SGEN-SEO-AEO-Dental_Black_Optimized_V4` (locked master — V4, never V3).
Content payload: `SGEN_Chiropractor_Content_Map_1.xlsx` (9 sheets).

## Content rewrite (2026-08-20) — de-duplicated against the five sibling industry pages

Source of copy: `SGEN_Chiropractic_Content_Map_REWRITTEN.xlsx` (13 tabs). This pass changed
**five files** — `index.html`, `llms.txt`, `llms-full.txt`, `ai.txt` and `chrome.css` (minified only).
Every other file is byte-identical to the pre-rewrite bundle. Design, layout, section order and
element types are unchanged.

### Why

The six SGEN industry landing pages were produced from one another, so they shared headlines, body
copy, FAQ answers and sample data. Measured against the five already-rewritten siblings
(Dental / MedSpa / Optometry / Veterinary / Dispensary):

| File | 8-word shingle overlap | Shared 7+ word sentences |
|---|---|---|
| `index.html` | 63.9% → **8.0%** | 81 → **10** |
| `llms.txt` | 66.5% → **0.3%** | 8 → **0** |
| `llms-full.txt` | 81.7% → **0.3%** | 24 → **0** |
| `ai.txt` | 74.5% → **14.5%** | 0 → 1 |

The 10 residual sentences are 7 FAQ **questions** (the workbook rewrites answers only — questions
track search intent and are meant to match), plus three strings of SGEN form/cart chrome. The
`ai.txt` residual is the attribution policy line and the `User-agent` / `Sitemap` / `Llms`
directive block, which are file format rather than copy. That is the floor, not a shortfall.

### How it was applied

360 verified find/replace pairs, authored region by region and each gated before use. The gate
checks: exact byte-for-byte existence in **both** themes, uniqueness, identical tag sequence,
unchanged `id`/`href`/`class`/`data-*`/`aria-*`/`for`/`name` attributes, no em or en dashes,
retained locked brand facts, US English, and — added mid-build after an audit showed the original
gate could not see it — **no 7+ word run shared with any of the five sibling pages**. That last
check indexes 22,258 sibling runs and distinguishes runs that come from the workbook itself
(reported, since they are the owner's own copy) from runs an author invented (blocked). Final
state: 16 specs, 360 pairs, **0 failures**.

Applied fail-closed: the applier computes real byte offsets in both files and refuses to write if
any pair is missing, ambiguous, or overlaps another pair's range.

### What was regenerated

30 case-study cards · 10 Search Console dashboards · the 80-practice logo wall · 10 ROI presets and
the four comparison bars · 9 client reviews · 15 FAQ answers (in the accordion **and** the FAQPage
JSON-LD, verified identical) · the head metadata and the Service JSON-LD audience taxonomy.

The **ten Search Console chart curves were re-seeded** from the workbook's own figures. Those curves
are drawn by inline JS from per-card `data-seed` / `data-clk-*` / `data-imp-*` values that were
byte-identical across every industry page; re-seeding them fixes that with no image re-export. The
new seeds are unique within the page and collide with no sibling's set.

### Portfolio deck — deliberately NOT renamed

Workbook tab 06 and tab 11 rename all six deck sites (Draycott Spine & Wellness, Ellerby Movement
Clinic, Steady Chiropractic, Quiropráctica Buen Camino, Ottery Posture Studio, Marlbank Private
Spine) and mark the six screenshots REPLACE. **Per owner instruction the deck follows the names of
the web mockup samples, so this was not applied.** The six cards remain AlignWell Chiropractic,
Fulcrum Chiropractic, ChiroPro, Pillar Chiropractic, Fix My Bones and Sperbeck Chiropractic; each
one's `.webp` and its `mockups/<slug>/` site carry those slugs, and the page derives the preview
path from the image filename, so renaming would break all six previews. Only the prose around the
deck was rewritten. (Tab 06's "current" column is stale in any case — it names
`trueallign-chiropractic.webp`, which is not in this bundle.)

Note that five of those names still appear elsewhere on the page as case-study clients, Search
Console practices and logo-wall entries. That is not the deck rename leaking through: tabs 03, 04
and 05 of the workbook independently use the same names for those rosters.

### Verification (run against these files, not asserted)

- **Structural parity** with the pre-rewrite bundle across 26 element and class counts.
- **`#verified` carousel**: div balance 296/296, unchanged from source. A sibling rewrite once left
  stray `</div>` closers here and nine of ten cards fell out of the track; that is a hard gate now.
- **26 inline `<script>` blocks parse**; **5 JSON-LD blocks parse**; the FAQPage block still carries
  15 questions and every answer in it also appears in the visible accordion.
- **Logo wall**: 80 entries, every glyph key resolving in the 31-key `GLYPHS` registry (an unknown
  key silently renders a generic square).
- **ROI**: 11 `<option>`s, 10 `PRESETS` keys, no orphans either way. Static markup equals what
  `compute()` renders on load — 55 exams × $1,340 → $73,700/mo · $162.1K/mo · $1.1M · **10,997%** —
  and all ten presets sit inside the slider ranges and land on the step, so nothing clamps. Driven
  in a real browser: every preset matches the workbook's computed ROI to the last digit.
- **Headless Chrome at 1440 / 1024 / 768 / 375**: 10 chart cards in the track at 1120px, typewriter
  running, FAQ accordion opening, no horizontal overflow at any width, and the console error set
  **byte-identical to the pre-rewrite bundle** — zero regressions.
- **Clipping**: 292 clipped elements before, 292 after, same distribution. All of it is pre-existing
  carousel overflow by design.

### Load-time optimization (each removal justified by a verified redundancy)

Critical path (`index.html` + `chrome.css`, gzipped): **231.8 KB → 189.4 KB**, 42 KB less.

- `chrome.css` 788,972 → 646,933 bytes raw (139.3 → 97.6 KB gzipped) with a conservative minifier
  that strips comments and insignificant whitespace only, never rewriting, merging or dropping a
  rule, and asserts brace / `@media` / `@supports` / `@keyframes` / `@font-face` counts against the
  comment-stripped source. It also refuses to fuse a media-query keyword to `(` — that mistake
  silently disables a whole block.
- The 16 inline `<style>` blocks minified with the same algorithm.
- **11 requests removed.** All 202 `@font-face` rules resolve to local `_xorigin/` woff2 (0 remote)
  and 60 of them are Poppins, so the remote Google Fonts stylesheet, its `<noscript>` twin and both
  preconnects are redundant. animate.css and swiper's CSS are already bundled inside `chrome.css`
  (`.fadeInUp`/`.slideInLeft`/`.animated` present; 77 distinct `.swiper-*` selectors), so those two
  sheets and their `<noscript>` twins go too. Three image preloads were pure waste:
  `av-mallie.jpg` was `fetchpriority=high` while its own `<img>` is `loading="lazy"` far below the
  fold; `sgen-logo-3.webp`'s only consumers are the closed mobile drawer and the hidden apply
  overlay; and `sgen-logo-2.webp` had no consumer `<img>` at all while its `imagesrcset` pointed at
  remote full-size logos.
- jQuery repointed from the remote copy to the local 89,501-byte file and deferred — safe because
  the page contains 0 `jQuery` tokens and both `# SGEN Chiropractic (Dark) — Local SEO + AEO Landing Page

**Dark/black-theme** editable static bundle of the SGEN Local SEO + AEO landing page,
retargeted from **dentistry to chiropractic**. Counterpart of the
`SGEN-SEO-Chiro_White - Optimized` bundle — identical chiropractic content, stats and
website samples, rendered on SGEN's dark theme. Static HTML/CSS/JS — no build step.

Source reference: `SGEN-SEO-AEO-Dental_Black_Optimized_V4` (locked master — V4, never V3).
Content payload: `SGEN_Chiropractor_Content_Map_1.xlsx` (9 sheets).

 hits are local `var $ =` helpers.
- `form_embed.js` deferred.
- `.htaccess` already ships brotli + deflate and 1-year immutable caching, so nothing was needed
  server-side.

**Tried and reverted:** making `/assets/dispenza/js/dispenza.js` relative. It looks like a free fix
for a 404, but rendering proved otherwise — with the path corrected the script loads, fetches
`sgen.com/dispenza/ajax/cart_html` cross-origin and throws an uncaught `TypeError`. At a real domain
root the original path already resolves, so the change buys nothing in production and costs a 16 KB
download plus a page error everywhere else. Left exactly as the source shipped it.

### Open for the owner

1. **Tab 12 rates the page's central argument HIGH-severity and unverified.** "Win the Question
   Before the Booking" is now the page title, the OG title and the Twitter title, and two of the
   four rotating hero phrases are research queries rather than local intent. Tab 12 asks for search
   volumes in two or three client markets before this becomes the headline, and keeps "lead with
   local intent" as the fallback.
2. **Named-entity coverage dropped, and this is the sharpest trade-off in the rewrite.** The new
   title omits "Local", "Google" and "ChatGPT"; the meta description omits ChatGPT, Gemini,
   Perplexity and Google Maps. Counted across the visible page (before → after), while the visible
   text actually got *longer*, 29,131 → 34,018 characters:

   | term | before | after |
   |---|---|---|
   | chiropractic | 136 | 93 |
   | chiropractor | 19 | 11 |
   | Google | 42 | 22 |
   | AEO | 32 | 20 |
   | ChatGPT | 23 | 12 |
   | Gemini / Perplexity | 16 / 16 | 8 / 8 |
   | Claude | 12 | 7 |
   | "near me" | 9 | 3 |
   | **Google Maps** | 4 | **0** |
   | **"local pack"** | 4 | **0** |

   "Google Maps" and "local pack" reach zero because the workbook replaces both with "leading three"
   (rows 22, 29, 45). Those are the two plainest industry terms on a local-SEO page. This is the
   workbook's copy applied as written, not a build decision — but it is worth a deliberate call
   before publish. The `<title>` is also 66 characters against the workbook's own 60 guide; tab 01
   row 1 offers a 47-character trim as the fallback.
3. **"22 · included at every tier"** (workbook row 60) asserts the whole 22-item list applies to the
   $497 tier, which the tiered pricing cards contradict. The list itself contains 20 `<li>` items
   against a badge of 22 — that gap is pre-existing, but the rewrite now states the number three
   times directly above the list.
4. **Register.** The workbook is written in British business English. Spellings and clearly-British
   vocabulary were converted (catchment → service area, paediatric → pediatric, premises →
   locations, enquire → inquire, supplier → agency, commence → start, and others). The wider voice —
   passive constructions, spelled-out numerals in the pricing table, "TO PROCEED", "Arrange fifteen
   minutes" — is the workbook's own and was applied as written rather than rewritten to US
   marketing register. Worth a read-through if a more conversational voice is wanted.
5. **Sample data.** All 30 case-study figures, 10 Search Console dashboards, 80 logo-wall practices
   and 6 portfolio sites are fictional and labelled "Sample · illustrative data". Tab 12 rates these
   HIGH and notes several chiropractic regulators restrict outcome and comparative advertising by
   registrants more tightly than general advertising law.
6. **The three market statistics** (60% SparkToro 2025, 3.4× Similarweb 2026, 47% Local SEO Guide
   2026) carry future dates and are unverified. This is the sixth workbook in the set to raise them;
   worth resolving across all pages in one pass.
7. **Tab 11 asks for the six portfolio screenshots to be re-rendered** under the new deck names. Not
   done, because the deck names are frozen per your instruction. The Search Console chart REPLACE on
   the same tab **is** satisfied, via the data re-seed described above.
8. Pre-existing and untouched: `assets/css/apply-v2.css` is injected by inline JS but absent from
   the bundle, so it 404s on every load; and `reset()` writes the literal string `there` into the
   name placeholder, so a re-opened apply overlay reads "Thank youthere!". Both predate this rewrite.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | The chiropractic Local SEO + AEO landing page — **dark theme** |
| `chrome.css` | Shared stylesheet — minified in this bundle: 788,972 → 646,933 B (see Content rewrite below) |
| `assets/` | Fonts, images, JS, and the portfolio deck screenshots |
| `mockups/` | 6 chiropractic sample sites (56 pages) with shared font + image pools |
| `llms.txt`, `llms-full.txt`, `ai.txt`, `robots.txt`, `sitemap.xml`, `.htaccess` | AEO / crawler layer |

## Preview

Some assets use server-absolute paths, so serve the folder rather than opening `file://`:

```
cd "SGEN-SEO-Chiro_Black - Optimized"
python -m http.server 8080     # then open http://localhost:8080/index.html
```

Each mockup also ships its own `server.js` (full mime map incl. `.webp`/`.avif`/`.woff2`).

## What was retargeted (dental → chiropractic)

**201 audited operations / 261 substitutions** applied to `index.html`. Every replacement declared
its expected occurrence count and a mismatch aborted the run — this caught six real
source-string errors (a raw `&` in `Cosmetic & Whitening · Denver, CO`, two comments wrapped
across lines, an undercounted canonical URL, a 1-vs-3 placeholder, and a `"best dentist near me"`
phrase shared between the JSON-LD and visible copy).

- **Meta / SEO / OG / canonical / breadcrumb / JSON-LD** — slug `dental-local-seo-aeo` →
  `chiropractic-local-seo-aeo` (9 sites). All 5 JSON-LD blocks parse.
- **Hero** — rotating "near me" phrases (visible H1 **and** the separate JS phrase array),
  rank widget, AI-answer bubble.
- **Logo wall** — all **80** practices regenerated from sheet 04, with **5 new Lucide-style
  glyphs authored** (bone, activity, baby, heart-pulse, scan) since the icon library had no
  chiropractic symbols. Renders **0** old-industry terms.
- **30 result cards + 10 Search Console cards** — practice names and specialties localised;
  marketing metrics carried over unchanged per the map's own note.
- **ROI calculator** — 10 chiropractic presets from sheet 06. Default **50 patients × $1,000**
  → `$50,000/mo · $110K/mo · $720K · 7,428%`. Verified against the real slider ceilings
  (`jobs max=80`, `ticket max=6000` — the code comment claiming $1500 is wrong): **no preset
  clamps**. The no-JS static fallback was recomputed to match the live JS exactly.
- **Reviews, compare table, numbers, pricing, method, 15 FAQs (visible *and* JSON-LD), footer,
  application overlay** — all chiropractic. The source typo "for an dentist" is fixed.
- **Portfolio deck** — see below.

SGEN's brand facts (`$497 / $797 / $1,297`, `4.9★ / 50+`, `500+ practices`, `$47M+`, `9+ yrs`)
are unchanged, per the workbook's DO-NOT-CHANGE rule.

## Portfolio deck — 6 real chiropractic builds

The deck shows the six supplied designs under their **real names**, so each card matches the
site that opens in its modal:

| Card | Practice | Positioning |
|------|----------|-------------|
| 1 | AlignWell Chiropractic | Walk-In Chiropractic · Las Vegas |
| 2 | Fulcrum Chiropractic | Diagnostic-Led · Three Clinics *(deck opens here)* |
| 3 | ChiroPro | First-Visit Focused · Three Locations |
| 4 | Pillar Chiropractic | Assessment-First · Online Booking |
| 5 | Fix My Bones | Rehab-Led Chiropractic · Riverside |
| 6 | Sperbeck Chiropractic | Gentle & No-Force · Tracy, CA |

Cards rendered at **1600×1000** (the reference's measured dimensions), `reducedMotion: 'reduce'`,
each card's `--paper` sampled from that design's own computed background.

## Optimization (all verified, not assumed)

| Measure | Reference | This bundle |
|---|---|---|
| `chrome.css` | 788,972 B | **788,972 B (identical)** |
| Mockup images | 56 files / 1.90 MB | 93 files / 3.84 MB (from **33.83 MB** source — 88.7% smaller) |
| Image median longest edge | 809 px | **900 px** (gate ≤ 1052) |
| WebP carrying ICC | 6 | **0** |
| Un-transcoded rasters in mockups | 1 | **0** |
| Lazy-loading coverage | 47/68 (69.1%) | **134/165 (81.2%)** |
| Self-hosted woff2 | 28 | 32 (277 `@font-face` pruned to **110**, latin + latin-ext only) |
| External font URLs in mockups | 0 | **0** |
| Inline base64 rasters | 0 | **0** |
| `server.js` w/ webp+avif mime | 6/6 | **6/6** |
| `.htaccess` directives | — | **identical** |

**42 hot-linked `images.unsplash.com` photos** in three of the supplied mockups were downloaded
and localised — the bundle makes **no external image requests**.

## Verified

- Renders at **1440 / 1024 / 768 / 390**: 0 horizontal overflow; **14 console errors and
  7 failed requests — exactly the reference's own baseline, 0 NEW**.
- Deck: 6 cards == 6 dots; all 6 modal targets resolve on disk; modal opens and the iframe
  loads the real document.
- FAQ accordion toggles; logo wall renders 202 nodes with **0** old-industry terms.
- All **56** mockup pages render standalone with 0 broken images, 0 console errors,
  0 failed requests, and the **correct font families loading** (proving the subset pruning was safe).
- Whole-bundle visible-text sweep: **0** old-industry vocabulary except the justified survivors below.
- Bundle: 330 files, 12.05 MB.

## Post-delivery adversarial audit (13 agents) — and the 4 defects it fixed

After delivery, a 13-agent read-only audit ran over both bundles: five independent auditors
(content-map fidelity · data-system fidelity · self-containment · SEO/AEO coherence · theme parity
and deck integrity), then a refute-by-default skeptic per finding, then a completeness critic.
Five claims were raised; **four were confirmed and are now fixed, one was refuted.**

| Sev | Defect | Fix applied |
|---|---|---|
| medium | ROI "How we compare" lifts were never rescaled to the chiropractic baseline — the page contradicted itself: the tile read *Annual revenue lift $720K* (= $60K/mo) while the row beneath read *$57K/mo lift* | Rescaled to the map's 8 / **29** / **14** / **60**. Verified in the rendered DOM: `$720K == 12 x $60K`. |
| low | ROI caption spans still printed the dental defaults 40 / $1,200 while the inputs were 50 / $1,000. JS corrected them on load — **except under `prefers-reduced-motion`**, where the stale pair painted permanently | Corrected in the served HTML. Verified under **both** `reduce` and `no-preference`. |
| low | `"@type":"Chiropractic"` in `mockups/sperbeck-chiropractic/contact.html` — a schema.org MedicineSystem *enumeration member*, not a class, so the address/phone/hours hung off it were invalid and silently dropped | Changed to `["MedicalBusiness","LocalBusiness"]` + `"medicineSystem":"Chiropractic"`. |
| low | `Service.audienceType` listed 9 specialties while llms.txt, llms-full.txt, the ROI selector and FAQ #4 all listed 10 | Restored the missing "chiropractic with massage and soft-tissue therapy". |
| — | *Refuted:* the 64-char page title flagged as over the ≤60 guidance | Not a defect — it matches the content map's own row-3 value byte-for-byte. |

All gates re-run green after the fixes; all 5 JSON-LD blocks still parse.

## Open items / justified survivors

1. **"Apex Crown Chiropractic"** (logo wall #9) retains the word *Crown*, which reads as dental.
   It is specified that way in content-map sheet 04 — **flagged, not silently overridden.**
   Change the sheet and re-run if you want it renamed.
2. **Sperbeck mockup says "trained as a medic and a dental technician"** (3 pages). This is
   **true biography of a real client** (Dr. Sperbeck, US Navy) on their own site — deliberately
   left intact.
3. The icon library still defines an unused `tooth` glyph, and vendor `lucide.min.js` contains a
   `smile` icon name. Neither renders.
4. **Content-map sheet 05 ("Sample Sites") is superseded.** It invented six practices
   (TrueAlign, The Spine Collective, KidSpark, Familia, Poise, Sovereign Spine) that do not match
   the supplied mockups. Per owner decision the deck uses the six real designs instead.
5. **Sheet 05 also specifies 1000×1400 cards**; the reference's actual cards are 1600×1000 and
   that measured value was used.
6. The woff2 pool is larger than the reference (1.61 MB vs 917 KB) because six designs use more
   families, several of them variable fonts. All are pruned to latin + latin-ext.
7. Multi-page mockups were kept navigable per owner decision, so the bundle is larger than the
   reference (12.05 MB vs 8.39 MB): 56 mockup pages instead of 6.

## Known pre-existing gaps (inherited from the reference, not introduced here)

- `assets/css/apply-v2.css` is referenced but absent from the source export (404 in the
  reference too).
- `assets/dispenza/js/dispenza.js` is referenced with a server-absolute path.
- `https://www.sgen.com/sg-collect` is an SGEN analytics beacon (network-only).
- Five review-carousel avatars are `loading="lazy"` and never scroll into view, so the browser
  correctly never fetches them. Identical behaviour in the reference; files are present and
  byte-identical.

## Editing notes

- Pure static — edit `index.html` / `chrome.css` and refresh.
- ROI `<option>` labels are lowercased at runtime to key into the `PRESETS` object — rename an
  option and you must rename its `PRESETS` key too.
- The deck JS is count-agnostic; add or remove `.e-card` articles freely. The modal derives
  `mockups/<slug>/<slug>.html` from the card image filename, so a new card needs a matching
  `assets/in-pages/portfolio/<slug>.webp` **and** `mockups/<slug>/<slug>.html`.

© SGEN. All rights reserved.
