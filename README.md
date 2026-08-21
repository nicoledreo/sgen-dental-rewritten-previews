# SGEN rewritten previews

Live previews of the SGEN **Local SEO + AEO** landing page across all six industries, in both
colourways — twelve builds — plus the six design mockups each one ships.

**Preview:** https://nicoledreo.github.io/sgen-dental-rewritten-previews/

| Industry | Dark | Light | Bundles |
|---|---|---|---|
| Dental | [`dental/black/`](dental/black/) | [`dental/white/`](dental/white/) | [dark](bundles/dental-black.zip) · [light](bundles/dental-white.zip) |
| Veterinary | [`vet/black/`](vet/black/) | [`vet/white/`](vet/white/) | [dark](bundles/vet-black.zip) · [light](bundles/vet-white.zip) |
| Chiropractic | [`chiro/black/`](chiro/black/) | [`chiro/white/`](chiro/white/) | [dark](bundles/chiro-black.zip) · [light](bundles/chiro-white.zip) |
| Cannabis | [`dispensary/black/`](dispensary/black/) | [`dispensary/white/`](dispensary/white/) | [dark](bundles/dispensary-black.zip) · [light](bundles/dispensary-white.zip) |
| Med spa | [`medspa/black/`](medspa/black/) | [`medspa/white/`](medspa/white/) | [dark](bundles/medspa-black.zip) · [light](bundles/medspa-white.zip) |
| Optometry | [`opto/black/`](opto/black/) | [`opto/white/`](opto/white/) | [dark](bundles/opto-black.zip) · [light](bundles/opto-white.zip) |

> The dental preview previously lived at `/black/` and `/white/`. Those paths still work — they now
> redirect to `/dental/black/` and `/dental/white/`.

## Why this exists

Dental was the original SGEN landing-page build. Chiropractic, med spa, veterinary, cannabis and
optometry were produced by swapping the industry noun and leaving the sentences intact — so six pages
shared the same headlines, body copy, FAQ answers and sample data. That is exactly what near-duplicate
detection is built to catch, in Google and in the AI crawlers.

Every build here has since had its on-page strings rewritten from a per-industry content map, keeping
the design, section order, element types and all locked brand facts unchanged.

## Measured result — the dental pilot

8-word phrase overlap against the five sibling industry pages:

| | before | after |
|---|---|---|
| overlap with any sibling | **74.4%** | **6.0%** |
| sentences shared verbatim | 108 | 6 |
| `llms.txt` / `ai.txt` / `llms-full.txt` | ~sibling-identical | 4.0% / 8.8% / 2.8% |

The six remaining shared sentences are five generic FAQ *questions* — which should match across pages,
since they track search intent — and the shared SGEN cart/search chrome.

Of 115 original sample-data strings (practice names, cities, reviewer names, figures), **109 were
replaced**. The six survivors are the portfolio deck brands, kept deliberately so the captions match
their screenshots until those are re-rendered.

## Latest revision round

Applied across the set and verified by rendering each page, not by inspecting the markup:

- **Mobile layout — all 12.** Every build carried a horizontal scrollbar at 320px (worst: optometry at
  +85px). Four unscoped desktop rules were the cause: a hard two-column case-study grid, a four-column
  timeline, a `nowrap` tab strip, and a `nowrap` flex bar that pushed the *Sample · illustrative data*
  disclaimer outside its frame. Now **0 overflow and 0 clipped elements at 320 / 360 / 390**, with
  768 / 1024 / 1440 unchanged.
- **Light builds — all 6.** The closing formula panel moved from a pale red tint to the solid CTA red
  with white copy; the `2×` figure is set in `#ffd6d9`, which clears WCAG AA-large against the
  gradient (measured 3.19–5.58, threshold 3.0).
- **Dental copy.** All **55** em dashes in the copy were removed and the sentences repunctuated by
  hand — colons, commas, full stops or parentheses depending on the clause. The FAQ JSON-LD schema was
  treated as copy too, so the structured data still matches the visible page word for word. Em dashes
  inside CSS, JavaScript and HTML comments were deliberately left alone.

## Notes for anyone reading this repo

- **This mirror is not indexable.** Every page is served `noindex, nofollow` and `robots.txt` is
  `Disallow: /`. The canonical tags still point at `https://www.sgen.com/...`, so these copies cannot
  compete with the real pages.
- **All proof data is illustrative.** Case-study cards, Search Console dashboards, reviews and the
  logo walls are fictional and labelled *Sample · illustrative data* on the page.
- **Some console errors are expected.** The bundles are static mirrors, so calls the real site makes
  back to `www.sgen.com` (cart, search, session) fail off-origin. They are not page defects.
- `.nojekyll` is required — the bundles contain `_xorigin/` and `mockups/_shared-*/` directories that
  GitHub Pages' Jekyll pipeline would otherwise strip.

## Still open

- The portfolio screenshots and their mockup pages still carry the original brands.
- Tier naming splits between service names on the pricing cards and plan names elsewhere.
- En dashes remain in number ranges (`8–24`, `30–60`); only em dashes were removed, and only in dental.
