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

## v64 image-forward storefront pass (2026-03-09)
- Read project rules first and used the uploaded files as the source of truth before editing.
- Added representative storefront imagery to the homepage, gaming PC pricing page, services hub, DIY hub, and TechCare page.
- Created optimized tier photo variants from existing site imagery so the gaming PC price tiers are easier to scan visually without adding heavy new dependencies.
- Surfaced trusted brand logos more prominently on the storefront-facing pages.
- Added lightweight visual-card, tier-card, photo-band, and logo-wall styles in `style.css` for reusable image-first page sections.


## v65 tier panel image pass
- Promoted the newly uploaded tier images into optimized canonical web assets under /assets/img/photos/.
- Replaced the gaming pricing panel images for Tier 1, Starter, Performance, Enthusiast, and Extreme with the new uploaded artwork.
- Kept the existing card layout and canonical paths so the visual update does not break links or page structure.

- v66: removed the oversized component brand collage from the Gaming PC Prices & Builds page, cleaned the brand logo assets for dark-theme display, and replaced the section with a cleaner trusted-brands layout.


## v67 full cleanup + SEO sanity pass (2026-03-09)
- Read project rules first and used the uploaded project notes as the source of truth before editing.
- Audited all indexable pages for broken local links, orphan pages, canonical coverage, metadata coverage, schema presence, nav/footer presence, and route consistency.
- Confirmed 0 broken local links and 0 orphan indexable pages after cleanup.
- Fixed duplicate metadata/canonical conflicts on `computer-problems.html` and `ssd-upgrade-benefits.html`.
- Standardized `/help/` as the canonical DIY/help hub and converted `guides.html` into a redirect stub to reduce duplicate-route confusion.
- Removed unused `app.js` references from non-builder pages and removed the unused `app.js` file.
- Removed unused assets and leftovers that were no longer referenced by the live site, including the old component collage, unused videos, an unused CSS/JS pair, and the unused staging image folder.
- Regenerated `sitemap.xml` from live indexable canonical pages only and kept `llms.txt` aligned with the current storefront/navigation structure.
- Corrected the phone typo in the project notes so future sessions do not inherit the wrong number.

## v68 location hub + header consistency cleanup
- Made `/locations/` the single canonical location hub and converted `service-area.html` into a redirect stub to `/locations/`.
- Removed self-redirect rules that were causing redirect loops on canonical hub routes.
- Standardized lingering footer and body links from `Service Area` to `Locations` so users no longer hit mixed route language.
- Corrected `locations/index.html` social metadata and breadcrumb labeling to reflect the actual page.
- Kept the existing local SEO location pages in place under `/locations/` for Flint, Flushing, Grand Blanc, Fenton, Davison, Burton, Clio, Swartz Creek, and surrounding communities.

## v81 hub-route policy alignment + sitemap cleanup (2026-04-02)
- Re-read the uploaded project notes, route policy, README, and site audit notes before editing.
- Aligned the live hub canonicals, Open Graph URLs, and internal hub links with the folder-route policy for `/gaming-pc-prices-builds/`, `/services/`, `/help/`, `/faq/`, `/locations/`, `/techcare/`, `/support/`, `/review/`, and `/our-work/`.
- Updated redirect stubs and `_redirects` so the no-slash hub variants now 301 to the canonical folder routes instead of competing with them.
- Regenerated `sitemap.xml` from indexable canonical pages only so malformed hub entries like `/faq//` and `/help//` are removed.
- Left non-hub content URLs alone unless they were direct aliases or stubs, to stay within the route policy and existing site structure.


## v82 authority pass + conflict cleanup (2026-04-02)
- Read the uploaded project notes, route policy, README, and site audit notes again before editing.
- Kept the existing route policy and site structure in place instead of adding new clusters or changing public URL patterns.
- Added an authority block and stronger priority-city internal links on the homepage.
- Added a stronger Genesee County authority section and priority local links on `/services/`.
- Added a local buyer-support section and city-level gaming PC links on `/gaming-pc-prices-builds/`.
- Strengthened the top repair location pages for Flint, Grand Blanc, and Fenton with clearer trust copy, diagnostic messaging, and nearby-city internal links.
- Added a professional-diagnosis authority block to the help and DIY pages so the troubleshooting cluster ties back into local service intent more clearly.
- Fixed duplicate/conflicting footer links that repeated `Locations` twice across the site.
- Fixed conflicting metadata on the `/locations/computer-repair-*.html` pages where some pages still carried the old Flushing homepage title/description instead of city-specific metadata.
- Removed a conflicting duplicate homepage JSON-LD block so the homepage has one clearer primary schema set instead of overlapping older homepage schema.
- Note for future passes: the README file is deployment history, not the source of truth for the current SEO architecture; project notes + route policy + site audit notes should continue to win when they conflict.


## v83 real photo proof pass (2026-04-02)
- Added real uploaded Subtronics work photos into `/assets/img/photos/` as optimized WebP assets.
- Replaced generic-looking visual placeholders on the homepage, services hub, and gaming PC pricing page with actual Subtronics build and repair photos where they strengthen trust.
- Expanded `/our-work/` so it now shows real Subtronics repair and build photos instead of mostly placeholder/supporting graphics.
- Kept the route policy, canonical structure, and Repair -> Upgrade -> Build storefront path intact while adding stronger trust signals.
- Avoided publicly surfacing the uploaded drive-label photo because it exposes unnecessary device-identifying details and does not help the storefront as much as the build/repair photos.

## v84 real-work page rebuild + photo selection cleanup (2026-04-02)
- Rebuilt `/our-work/` so it reads like grouped proof of real work instead of a repeated image grid.
- Added four stronger real-photo assets:
  - black custom build final inspection
  - high-end RGB showcase build
  - motherboard / build-prep shot
  - finished multi-monitor setup with completed PC
- Removed repeated-looking gallery entries so the page no longer feels like the same 2-3 systems shown over and over.
- Kept the route policy and site structure intact while improving trust signals and human readability.
- Updated homepage proof-band copy and imagery to point at the stronger real-work presentation.
- Deliberately did not surface weaker workspace-heavy shots or the Halloween personal photo on the public site in this pass.


## v85 our-work human copy cleanup (2026-04-02)
- Rewrote `/our-work/` to remove developer-style explanation and site-note language.
- Kept the real-photo trust angle, but changed the page copy to speak to customers in plain language.
- Simplified the image section copy so it reads like a local service business, not internal SEO notes.
- Replaced the meta/explanatory closing section with a direct customer-facing call to action.


## v89 clean our-work human copy pass (2026-04-02)
- Reverted the broader v86 text changes so this pass only updates `/our-work/`.
- Rewrote the visible copy on `/our-work/` to remove awkward marketing-style phrases and image descriptions that did not match the photos well.
- Kept the existing route policy, schema, metadata, and page structure intact.
- Added only natural internal links on `/our-work/` to `/services/`, `/gaming-pc-prices-builds/`, and `/locations/`.


## v91 sitemap rebuild from canonical indexable pages (2026-04-02)
- Rebuilt `sitemap.xml` from the actual site files instead of a placeholder wrapper.
- Included only pages with an indexable robots directive and a canonical URL.
- Excluded redirect stubs, noindex pages, and moved beta pages from the sitemap.
- Kept canonical hub routes like `/services/`, `/faq/`, `/help/`, `/locations/`, `/our-work/`, and `/gaming-pc-prices-builds/` aligned with the route policy.
