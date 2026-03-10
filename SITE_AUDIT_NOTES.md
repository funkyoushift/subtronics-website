# Subtronics LLC — Site Audit Notes (2026-03-08)

This update adds a new service page and performs a full internal-link / SEO sanity pass.

## Added / Updated
- New page: /services/prebuilt-gaming-pcs.html
- New asset: /assets/brands/component-brands-collage.png
- Redirects added:
  - /prebuilt-gaming-pcs.html -> /services/prebuilt-gaming-pcs.html
  - /services/custom-gaming-pc-builds.html -> /services/custom-pc-builds.html
  - Common hub paths normalized (e.g., /services -> /services/)

## Internal linking
- Footer: added “Prebuilt gaming PCs” link across pages with the standard footer
- Homepage: added a Prebuilt callout block under “What we do” + collage image
- Services: added Prebuilt mention/card
- Services hub (/services/): added Prebuilt card
- Custom builds pages: added “Need something ready today?” cross-link to Prebuilt page

## Schema / AI pointers
- Updated schema serviceType to include:
  - Prebuilt Gaming PCs
  - Gaming PC Setup & Optimization
  - Data Transfer / PC Migration
- Added OfferCatalog schema on the Prebuilt page (tiered offers)
- Updated llms.txt to include the new page
- sitemap.xml updated with the new URL

## Link health
- Ran an internal link scan and fixed broken internal links found during this pass.
  (Result: 0 broken internal links after fixes.)

## Notes / Next decision
- “Advanced Build Store” is still referenced widely across the site. If we decide to remove/hide it, we should:
  - Remove nav/footer references
  - Add redirects from old build-store URLs to the new direction
  - Optionally keep a lightweight “Build configurator (beta)” page if you want it discoverable but not prominent
## 2026-03-08 — Build Store soft-retired + configurator refresh
- “Advanced Build Store” link removed from global footer/nav to reduce confusion (soft retire).
- /store.html converted to “PC Build Configurator (Beta)” with:
  - PCPartPicker list URL input
  - Open-list button
  - Email-for-quote button (mailto)
  - Optional iframe preview (may be blocked by browser security headers)
- Store page set to meta robots: noindex,follow (beta while improving).
- Internal link scan: 0 broken links.
## v48 follow-up audit (2026-03-08)
- Replaced placeholder project docs with full Project Brain + Architecture Map
- Added Internal Linking Map
- Added gaming PC local-intent pages:
  - /locations/gaming-pcs-flint-mi.html
  - /locations/gaming-pcs-grand-blanc-mi.html
  - /locations/gaming-pcs-fenton-mi.html
- Added homepage gaming PC cluster section
- Added services hub gaming PC local links
- Added prebuilt/custom/configurator cross-links
- Expanded configurator beta structure with RGB/Blackout direction, add-ons, and warranty planning
- Added configurator alias redirects:
  - /build-configurator -> /store.html
  - /advanced-build-store.html -> /store.html
- Updated sitemap.xml and llms.txt
- Internal link scan result after changes: 0 broken internal links
## v49 gaming PCs page overhaul (2026-03-09)
- Rebuilt `/services/prebuilt-gaming-pcs.html` into a combined **Gaming PCs for Every Budget** page
- Added both **prebuilt value systems** and **custom gaming PC tiers** to the same main sales page
- Added price structure:
  - prebuilt/value path: $800-$1,400
  - starter custom: starting at $1,299
  - performance: $2,199-$2,499
  - enthusiast: $3,099-$3,499
  - extreme: $5,500+
- Added starter custom note for the Ryzen 5 7600X bundle and a 7600X3D add-on path
- Updated custom builds pages to point back to the combined gaming PCs page
- Added/updated priority gaming PC location pages:
  - Flint
  - Flushing
  - Grand Blanc
  - Fenton
  - Davison
  - Burton
  - Clio
  - Swartz Creek
  - Goodrich
  - Linden
- Updated homepage, services hubs, configurator, DIY/help pages, and locations hub with stronger gaming PC internal links
- Updated `llms.txt`, `sitemap.xml`, and project docs
- Added rule: every new service page or major service cluster must get matching location pages
- Internal link scan after changes: 0 broken internal links
## v50 visibility fix
- Surfaced the live Gaming PCs page more prominently on the homepage
- Added a top-level visible Gaming PCs section to services hubs
- Added Gaming PCs links into footer service/support areas sitewide
- Moved Gaming PCs by city higher on the locations hub
- Updated the main Gaming PCs page title/H1/meta to read like a clear live service page

## v59 rules-first navigation + combined buying page confirmation (2026-03-09)
- Read project notes first and used them as the source of truth before editing
- Kept the visible site human-readable and aligned to Repair -> Upgrade -> Build
- Kept `/services/custom-pc-builds.html` and `/services/custom-pc-builds/index.html` as the main combined human-facing buying page
- Strengthened homepage and services hub language so users are pushed directly to the combined pricing page
- Kept Tier 1 prebuilts, custom tiers, and the prebuilt-plus-optimization buying note together on the main gaming PC page
- Updated bridge-page wording and buying-path labels for consistency

## v60 storefront restructure + primary buying route (2026-03-09)
- Read project rules first before editing and treated them as the source of truth
- Created `/gaming-pc-prices-builds/` as the new primary human-facing buying page
- Simplified the homepage into a storefront path: Buy a Gaming PC / Services / DIY / TechCare
- Simplified `/services/`, `/help/`, and `techcare.html` so the visible pages are more human-readable
- Updated global header navigation to point to the new primary buying route
- Added redirects from older prebuilt/custom gaming PC routes into the new combined page
- Updated sitemap.xml and llms.txt to reflect the new primary buying page


## v61 canonical cleanup and duplicate-route pass
- Audited duplicate folder/index and .html routes for the main human-facing pages.
- Standardized internal links to the canonical folder routes for `/services/`, `/faq/`, `/locations/`, `/techcare/`, `/support/`, `/review/`, and `/our-work/`.
- Converted duplicate `.html` versions of those hub pages into redirect stubs so there is one clear human-facing version.
- Fixed leftover broken links that incorrectly pointed to `/services/gaming-pc-prices-builds/` instead of `/gaming-pc-prices-builds/`.
- Added redirect coverage for the duplicate route variants in `_redirects` and updated canonicals/og:url on the canonical index pages.


## v63 navigation audit + duplicate root route cleanup (2026-03-09)
- Read project rules first and treated the uploaded project notes as the source of truth before editing.
- Audited internal links, duplicate routes, sitemap coverage, and canonical route usage.
- Replaced legacy root-level duplicate content pages with redirect stubs to their canonical `/services/`, `/help/`, `/help/diy/`, or `/locations/` equivalents.
- Standardized internal links away from `/index.html` and other non-canonical hub variants.
- Added explicit redirect coverage for duplicate root legacy routes in `_redirects`.
- Regenerated `sitemap.xml` so it only lists canonical live pages instead of moved duplicate routes.
- Goal of this pass: make Cloudflare serve one clear public version of each page and reduce route confusion after deploy/cache refresh.
