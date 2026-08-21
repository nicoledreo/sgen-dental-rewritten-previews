# SGEN Dental (Light) — Local SEO + AEO Landing Page

**Light/white-theme** editable static clone of the SGEN Local SEO + AEO landing page,
retargeted from optometry to **dentistry**. This is the white counterpart of the
dark (`SGEN-SEO-AEO-Dental_Black`) bundle — **identical dental content, stats, and website samples**,
rendered on SGEN's light theme. Static HTML/CSS/JS — no build step.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | The dental Local SEO + AEO landing page — **light theme** |
| `chrome.css` | Shared stylesheet (site chrome, tokens, components) |
| `assets/` | Fonts, images, JS, and the portfolio deck screenshots |

## Light vs dark: what makes this version white

The dark and light versions share the **same content, scripts, and components**. The
theme difference is entirely presentational and self-contained:

- **Light-theme stylesheet** — an appended `<style id="light-theme">` block (end of
  `index.html`) flips the `.surface-dark` / `[data-surface="dark"]` design tokens back
  to light values and overrides the hardcoded dark page grounds (`#0a090b` / `#0d0d0f`)
  to `#ffffff`. This is carried verbatim from SGEN's own `SGEN-SEO-Opto_White` export.
- **Logo** — the light theme uses the dark-ink logo `assets/in-pages/sgen-logo.png`
  (the dark theme uses the reversed `sgen-logo-3.webp`).
- **Product mockups stay dark by design** — the hero "search visibility" dashboard and
  the **portfolio deck** (`.ppf-e`) are dark app-window screenshots and are intentionally
  left dark on the light page (they declare their own tokens and are insulated from the
  flip). This matches SGEN's white reference exactly.

Verified: body/hero/footer render `#ffffff` (light) at all six breakpoints; the deck
frame remains dark as intended.

## Preview

Because the original export references some assets with **server-absolute paths**
(e.g. `/assets/dispenza/js/dispenza.js`), a couple of scripts/styles won't resolve
when you open `index.html` directly via `file://`. Serve the folder from any static
server to preview it exactly as hosted:

```
cd SGEN-SEO-AEO-Dental_White
python -m http.server 8080     # then open http://localhost:8080/index.html
```

Content, layout, fonts, and the portfolio deck all render correctly either way —
the absolute-path items are analytics/enhancement scripts, not layout-critical.

## What was retargeted (optometry → dental)

All copy was changed from the **SGEN Landing Page Refined – Content Template (Dental)**
workbook — 113 content strings plus:

- **ROI calculator** — 10 dental specialty presets (patients/mo × first-year case value),
  slider ceiling raised to `$6,000` to fit high-value cases (implants/ortho), default
  `45 patients × $1,150` → `$51,750/mo · $113.9K/mo · $745K · 7,692%`.
- **Portfolio deck** — "Practice sites we designed, then ranked": 7 dental clinic mockups
  (Bright Smile, Coast Dental Co., The Dental Collective, Kidspark, Familia, Pearl,
  Sovereign) rendered to `assets/in-pages/portfolio/*.webp` (1000×1400).
- **Logo wall** — 80 fictional dental practices; eye/glasses icons swapped to the
  built-in `tooth` glyph; names/taglines localized to dental.
- **Case studies, reviews, compare table, method, FAQ, pricing copy, page title +
  social meta** — all dental.

SGEN's own brand and pricing (`$497 / $797 / $1,297`, `4.9★`, `500+ practices`,
`9+ yrs`) are unchanged, per the workbook's DO-NOT-CHANGE rule.

## Editing notes

- Pure static — edit `index.html` / `chrome.css` in any editor and refresh.
- To adjust the light theme, edit the `<style id="light-theme">` block at the end of
  `index.html` (or the `:root` / `.surface-dark` tokens in `chrome.css`).
- The ROI calculator's specialty `<option>` labels are lowercased at runtime to key
  into the `PRESETS` object in the inline script — if you rename an option, rename its
  matching `PRESETS` key too.
- The portfolio deck JavaScript is count-agnostic (`var n = cards.length`), so you can
  add or remove `.e-card` articles freely.
- To replace a deck screenshot, drop a 1000×1400 WebP into
  `assets/in-pages/portfolio/` and point the card's `<img src>` at it.

## Known pre-existing gaps (from the source export, not introduced here)

- `assets/css/apply-v2.css` is referenced but was not included in the source export.
- `assets/dispenza/js/dispenza.js` is referenced with a server-absolute path.
- `https://www.sgen.com/sg-collect` is an SGEN analytics beacon (network-only).

None affect the page's content or layout. (Confirmed byte-for-byte identical to the
white-opto source's own failed requests — zero new failures introduced.)

© SGEN. All rights reserved.

## Files added in V4

| File | Purpose |
|------|---------|
| `llms-full.txt` | Extended plain-text brief for AI assistants — pricing, method, timeline |
| `ai.txt` | AI-crawler usage policy and attribution request |
| `robots.txt` | Crawl directives + sitemap pointer |
| `sitemap.xml` | Single-URL sitemap for the dental landing page |
