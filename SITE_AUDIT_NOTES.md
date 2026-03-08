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
