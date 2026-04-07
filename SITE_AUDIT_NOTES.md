# Subtronics LLC Site Audit Notes — Current Status

Last audit pass: **v92.3 pre-submit polish**

This file is intentionally short. Long historical change logs were removed so future edits stay focused on the current live architecture instead of old experiments.

## What is in good shape
- Canonical hub structure is aligned to trailing-slash folder routes.
- Sitemap only lists the current indexable public pages.
- Legacy and soft-retired routes are being handled by redirects or `noindex,follow` stubs.
- Internal links were checked against redirect targets in this pass.
- Robots and llms discovery files match the trimmed architecture.
- Homepage, gaming PCs page, and trust-photo pages now use better image sizing hints and responsive image variants.

## What was cleaned in this pass
- Added responsive `srcset` / `sizes` handling for the heaviest visible images.
- Added intrinsic image dimensions across local images to reduce layout instability and help Lighthouse.
- Recompressed several large WebP/JPG assets to reduce transfer weight.
- Cleaned project notes so only current rules remain.

## What should remain true before and after launch
- Do not submit thin or duplicate pages to Google just to inflate page count.
- Do not put beta / utility pages in the sitemap.
- Keep the gaming PC buying path centered on `/gaming-pc-prices-builds/`.
- Keep location coverage focused on stronger city pages rather than weak variants.
- After any major structural change, repeat a full audit of:
  - sitemap
  - internal links
  - canonicals
  - schema
  - llms.txt
  - redirects

## Remaining judgment calls
These are optional choices, not blockers:
- Further trim weak city pages if any are not earning their keep.
- Continue replacing large photos with tighter crops or additional smaller variants if future Lighthouse reports still flag them.
- Soft-retire more legacy HTML files later once redirects alone fully cover the old routes you still care about.
