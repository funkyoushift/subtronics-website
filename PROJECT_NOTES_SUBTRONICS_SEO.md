# Subtronics LLC Project Notes — Current Source of Truth

Last cleanup pass: **v92.3 pre-submit polish**

Use this file, `ROUTE_POLICY.md`, `sitemap.xml`, and `llms.txt` as the current source of truth. Older historical build notes were intentionally removed so future edits do not follow stale structure.

## Business snapshot
- **Brand:** Subtronics LLC
- **Primary contact:** 810-280-2222
- **Email:** Martin@subtronicsllc.com
- **Primary market:** Flushing, Flint, and Genesee County, Michigan
- **Positioning:** local computer repair, upgrades, diagnostics, gaming PC pricing, custom builds, and ongoing support

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
