# SGEN Dental — rewritten previews

Live preview of the SGEN dental **Local SEO + AEO** landing page after a full copy rewrite, in both
colourways, plus the six design mockups it contains.

**Preview:** https://nicoledreo.github.io/sgen-dental-rewritten-previews/

| | |
|---|---|
| Dark | [`black/`](black/) |
| Light | [`white/`](white/) |
| Bundles | the two `.zip` files at the repo root (227 files each) |

## Why this exists

Dental was the original SGEN landing-page build. Chiropractic, med spa, veterinary, cannabis and
optometry were produced by swapping the industry noun and leaving the sentences intact — so six pages
shared the same headlines, body copy, FAQ answers and sample data. That is exactly what near-duplicate
detection is built to catch, in Google and in the AI crawlers.

This build rewrites every on-page string from a content map, keeping the design, section order, element
types and all locked brand facts unchanged.

## Measured result

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

## Notes for anyone reading this repo

- **This mirror is not indexable.** Every page is served `noindex, nofollow` and `robots.txt` is
  `Disallow: /`. The canonical tag still points at `https://www.sgen.com/dental-local-seo-aeo`, so this
  copy cannot compete with the real page.
- **All proof data is illustrative.** Case-study cards, Search Console dashboards, reviews and the
  80-practice logo wall are fictional and labelled *Sample · illustrative data* on the page.
- `.nojekyll` is required — the bundles contain `_xorigin/` and `mockups/_shared-*/` directories that
  GitHub Pages' Jekyll pipeline would otherwise strip.

## Still open

- The six portfolio screenshots and their mockup pages still carry the original brands.
- Tier naming splits between service names on the pricing cards and plan names elsewhere.
- The other four industry pages have not had this treatment — dental was the pilot.
