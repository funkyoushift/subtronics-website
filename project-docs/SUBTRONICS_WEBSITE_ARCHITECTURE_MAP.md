# Subtronics Website Architecture Map

## Top-level architecture
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
- `/about`
- `/contact`

## Architecture principle
Organize the site by:
1. **service intent**
2. **local intent**
3. **trust / support content**

## What should stay out of the main nav
- beta tools
- experimental pages
- duplicate gaming PC paths
- low-confidence utility pages

## Canonical route approach
- hubs use trailing slash folder URLs
- most content pages use clean extensionless URLs
- legacy `.html` routes should redirect or stay non-indexable until fully retired

## Quality guardrails
- only strong pages belong in the sitemap
- local pages should be trimmed rather than bloated
- every important page needs internal links
- new pages must match the current storefront strategy rather than old archive logic
