# Subtronics LLC Project Notes — Current Source of Truth

Last cleanup pass: **v96 computer recycling service integration**

Use this file, `ROUTE_POLICY.md`, `sitemap.xml`, and `llms.txt` as the current source of truth. Older historical build notes were intentionally removed so future edits do not follow stale structure.

## Business snapshot
- **Brand:** Subtronics LLC
- **Primary contact:** 810-280-2222
- **Email:** Martin@subtronicsllc.com
- **Primary market:** Flushing, Flint, and Genesee County, Michigan
- **Positioning:** local computer repair, upgrades, diagnostics, gaming PC pricing, custom builds, computer recycling, and ongoing support

## Storefront-first structure
Visible site should feel like a local storefront, not an SEO dump.

Primary user paths:
1. **Buy a Gaming PC** → `/gaming-pc-prices-builds/`
2. **Repair a Computer** → `/services/`
3. **DIY / Learn** → `/help/` and `/help/diy/`
4. **TechCare Membership** → `/techcare/`

## Canonical hub routes
Use trailing-slash hub URLs in nav, schema, sitemap, and internal links:
- `/`
- `/gaming-pc-prices-builds/`
- `/services/`
- `/help/`
- `/help/diy/`
- `/faq/`
- `/locations/`
- `/techcare/`
- `/support/`
- `/review/`
- `/our-work/`

## Content page rule
Most non-hub pages should use the clean public URL **without** `.html`.
Examples:
- `/contact`
- `/about/right-to-repair`
- `/services/laptop-repair`
- `/services/computer-recycling`
- `/locations/computer-repair-flint-mi`

## Indexing rules
- `sitemap.xml` is the current list of indexable public pages.
- Utility / low-value pages should stay out of the sitemap.
- Legacy duplicates should redirect or remain `noindex,follow` until fully retired.
- Do not reintroduce weak local pages just to increase page count.

## Current content priorities
### Repair cluster
- computer repair
- laptop repair
- diagnostics and troubleshooting
- computer recycling / repair-or-recycle decisions
- data privacy options before recycling
- virus / malware cleanup
- hard drive and motherboard issues
- in-home / business support

### Gaming PC cluster
- gaming PC pricing page
- custom PC buying guidance
- prebuilt value guidance
- upgrades and setup
- migration / optimization help

### Trust cluster
- about / right-to-repair
- our work
- review
- support
- techcare

## Editing rules
- Keep copy human and storefront-oriented.
- Do not use robotic filler like “this page is designed to…” or “nothing staged. just real work.”
- Every major addition or removal must trigger a full-site audit:
  - nav
  - footer
  - internal linking
  - canonicals
  - schema
  - sitemap.xml
  - robots.txt
  - llms.txt
  - titles and descriptions
- No important page should be orphaned.
- No duplicate pages should compete for the same intent.

## Current technical priorities
- keep canonical routing clean
- avoid internal links that hit redirects
- keep image delivery lightweight with responsive image sizes where needed
- keep legacy pages either redirected or explicitly non-indexable
- keep only strong city pages live in the sitemap


### v94 money-page restructure
- Shifted storefront emphasis toward higher-value work: gaming PCs, PC upgrades, computer diagnostics, and PC optimization.
- Added canonical `/services/computer-diagnostics` and redirected old diagnostics-troubleshooting route to avoid duplicate diagnostic intent.
- Added canonical `/services/pc-optimization` and linked it from homepage, services hub, footer, and related money pages.
- Updated nav/footer consistency, sitemap, redirects, llms.txt, and homepage schema serviceType to reflect money-page priorities.


### v95 mobile-service emphasis
- Verified current source files still use the v## release-note convention; no v1.x.x release file or package version was present in the uploaded site bundle.
- Strengthened the site-wide message that Subtronics LLC comes to the customer for in-home and business on-site service across Genesee County.
- Updated homepage headline, description, hero CTA language, visible service badges, and FAQ/schema language to reduce confusion about visiting a storefront.
- Added on-site/mobile service reminders to service pages, contact page, repair location pages, and the global footer.
- Kept sitemap routes unchanged because this pass changed positioning and conversion language, not the public URL structure.


### v96 computer recycling service integration
- Added canonical `/services/computer-recycling` for free recycling of eligible computer equipment.
- Positioned recycling as part of the repair-or-recycle decision flow, not as a public storefront drop-off program.
- Added optional data privacy language before recycling.
- Added the recycling page to the services hub, footer, sitemap, and `llms.txt` discovery guidance.
- Updated recycling page schema with `Service`, `WebPage`, and `FAQPage` entities.
