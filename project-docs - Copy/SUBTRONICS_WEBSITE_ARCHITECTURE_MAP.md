# Subtronics LLC Website Architecture Map

## Purpose
This file defines the intended website structure so future updates stay organized, non-redundant, and SEO-friendly.

## 1. Top-Level Site Structure

### Core pages
- `/`
- `/services.html`
- `/about.html`
- `/contact.html`
- `/support/`
- `/service-area.html`
- `/techcare/`
- `/help/`
- `/help/diy/`
- `/locations/`
- `/our-work/`
- `/review/`
- `/store.html` *(soft-retired / beta configurator direction only)*

### Core architectural principle
The site should be organized around **service intent first**, then **local intent**, then **trust/help content**.

## 2. Primary SEO Clusters

### A. Repair & diagnostics cluster
Purpose: capture high-converting local repair searches

Examples:
- Computer repair
- Laptop repair
- Diagnostics
- Virus/malware cleanup
- Blue screen issues
- PC won’t turn on
- Overheating
- Data recovery / migration

These pages should interlink heavily and point users toward:
- Contact
- Support
- TechCare
- Relevant local pages

### B. Gaming PC cluster
Purpose: grow searches for builds, upgrades, and prebuilts

Core pages:
- `/services/custom-pc-builds.html`
- `/services/prebuilt-gaming-pcs.html`
- `/services/pc-upgrades.html`
- `/services/new-computer-setup.html`

Future-supporting pages:
- gaming PC local pages
- build configurator beta
- pricing / tier pages if they are curated and non-redundant

These pages should cross-link and point users toward:
- Call/Text CTA
- Quote/configurator flow
- TechCare
- Relevant city pages

### C. Local city cluster
Purpose: dominate map-adjacent organic searches in Genesee County

Priority cities:
- Flint
- Flushing
- Grand Blanc
- Fenton
- Davison
- Burton
- Swartz Creek
- Clio
- Goodrich
- Linden

Each location page should link to:
- related repair services
- gaming PC services where sensible
- homepage / service-area hub
- support / contact

### D. Help / DIY cluster
Purpose: capture informational searches and convert them into service leads

Hubs:
- `/help/`
- `/help/diy/`

Page types:
- repair troubleshooting
- upgrade help
- Windows help
- hardware replacement guidance
- beginner-friendly decision pages

Each strong DIY/help page should offer:
- service CTA
- related guide links
- link to relevant service page
- link to prebuilt/custom pages when contextually useful

### E. Trust / business cluster
Purpose: reinforce credibility and improve conversion

Includes:
- About
- Our Work
- Review
- TechCare
- Support
- Contact

These pages should connect users back into:
- service pages
- help pages
- conversion CTAs

## 3. Navigation Architecture

### Main navigation (keep clean)
- Home
- Services
- DIY Guides
- Help
- Service Area
- TechCare
- About
- Contact
- Support

### Do not place in primary nav unless strategically ready
- Build Configurator (Beta)
- Advanced Build Store
- Thin experimental pages
- Duplicate gaming PC pages

## 4. Footer Architecture

Footer should support:
- Core services
- Key hubs
- Legal / privacy
- TechCare terms if needed

Footer should **not** expose retired or confusing features unless deliberately chosen.

Preferred service footer links:
- PC repairs
- Laptop repairs
- Diagnostics
- Upgrades
- Custom builds
- Prebuilt gaming PCs
- In-home / business support

## 5. Internal Linking Rules by Page Type

### Homepage
Should link to:
- services hub
- top service categories
- top local pages
- prebuilt gaming PCs
- custom PC builds
- help/diy hubs
- TechCare
- contact / support

### Services hub
Should link to:
- every important service page
- prebuilt gaming PCs
- custom builds
- upgrades
- diagnostics
- local pages where useful

### Service pages
Should link to:
- related services
- local pages
- help content when relevant
- contact / support
- TechCare
- gaming PC services where relevant

### Location pages
Should link to:
- related repair services
- gaming PC services where sensible
- homepage / service-area hub
- support / contact

### DIY / help pages
Should link to:
- relevant service page
- contact CTA
- support
- related guides
- prebuilt/custom pages when contextually useful

## 6. Page Intent Guardrails

### Keep unique search intent
Do not create multiple pages that all target the same exact thing.

Instead:
- one strong custom builds page
- one strong prebuilt page
- one beta configurator page
- local pages that support the main pages

### Use pages for distinct intent
- **Custom builds** = bespoke build service
- **Prebuilt gaming PCs** = ready-to-go systems + migration/setup
- **Configurator beta** = on-site play/quote tool
- **Local pages** = city-specific organic capture
- **DIY pages** = informational capture and conversion support

## 7. Build Configurator Placement

### Recommended status
Soft-hidden / beta

### Purpose
Keep users on-site and collect quote-ready build intent without becoming a messy store.

### Inputs
- Tier
- RGB or blackout
- curated upgrade options
- setup add-ons
- warranty options

### Output
- send quote request
- text/call CTA
- possible email summary

### Page relationship
The configurator should be linked from:
- custom builds page
- prebuilt gaming PCs page
- selected support/help pages
- maybe homepage callout later if conversion data supports it

It should **not** be one of the site’s main public trust anchors until refined.

## 8. SEO / Schema / AI Pointer Architecture

Every major service or hub should support:
- strong title tag
- meta description
- H1
- internal links
- canonical
- appropriate schema
- sitemap inclusion
- llms.txt relevance where useful

### Schema priorities
- ComputerRepair / LocalBusiness
- Service
- FAQPage
- OfferCatalog on curated prebuilt/configurator content

### AI pointer priorities
- `llms.txt`
- clean service summaries
- non-ambiguous URLs
- strong internal linking

## 9. Recommended Future Expansions

### High-value next pages
- curated gaming PC local-intent pages
- warranty / TechCare sales support pages
- stronger new-computer-setup and migration content
- cost / pricing intent pages that do not cannibalize service pages

### Avoid unless strategy changes
- giant open-ended parts store
- thin brand-only pages
- mass-generated near-duplicate gaming pages

## 10. Maintenance Checklist

After any major change, always verify:
- navigation
- footer
- internal links
- sitemap.xml
- schema
- llms.txt
- canonicals
- outdated references
- redundant pages
- soft-retired links still hidden
- CTAs still obvious

## 11. Current Strategic Direction
The website is moving toward this structure:
1. **Repair authority**
2. **Gaming PC growth**
3. **Helpful on-site guidance/tools**
4. **Strong local coverage**
5. **Service-first conversion**

Anything that weakens that direction should be reduced, hidden, or removed.


## 12. Location-page expansion rule
Whenever a new service page or major service cluster is introduced, build matching city pages for the priority service-area cities so the new service is reflected across the local SEO structure.
