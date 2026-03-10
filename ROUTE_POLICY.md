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

## Duplicate route rule
If both a folder route and a `.html` route exist for the same topic, the folder route is canonical. The `.html` version should either redirect or act as a redirect stub.

## Deployment reminder
Seeing many `index.html` files in Cloudflare Pages is expected. The real problem is conflicting public URLs, not the file names themselves.
