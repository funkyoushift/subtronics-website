# Subtronics Route Policy

For this static site, many `index.html` files are normal. Each folder-based public URL (for example `/services/` or `/gaming-pc-prices-builds/`) is powered by that folder's `index.html`.

## Canonical public route rule
Use these public routes in nav, footer, schema, sitemap, and internal links:

- `/`
- `/gaming-pc-prices-builds/`
- `/services/`
- `/help/`
- `/faq/`
- `/locations/`
- `/techcare/`
- `/support/`
- `/review/`
- `/our-work/`

## Content page rule
For most non-hub pages, use the clean public URL without `.html`.
Examples:
- `/contact`
- `/about/right-to-repair`
- `/services/laptop-repair`
- `/locations/computer-repair-flint-mi`

## Duplicate route rule
If both a canonical page and a legacy `.html` route exist for the same topic, the legacy route should redirect. Do not leave duplicate indexable copies live.

## Legacy pruning rule
Do not keep large batches of weak local variants just because they exist. If a page is thin, redundant, or no longer worth indexing, remove it from the sitemap and redirect it to the closest strong page.

## Deployment reminder
Seeing many `index.html` files in Cloudflare Pages is expected. The real problem is conflicting public URLs, not the file names themselves.


## DIY hub reminder
Use `/help/diy/` as the canonical public hub for the DIY tutorial cluster. Older `/help/diy` or `.html` variants should redirect there.
