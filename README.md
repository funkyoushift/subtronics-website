# Subtronics LLC Website README

This package is the current multi-page Subtronics LLC website for Cloudflare Pages.

## Source of truth
When these notes conflict, use them in this order:
1. `PROJECT_NOTES_SUBTRONICS_SEO.md`
2. `ROUTE_POLICY.md`
3. `SITE_AUDIT_NOTES.md`
4. `README.md`

## Current architecture
- Static HTML site
- Canonical hub routes use trailing-slash folder URLs
- Most content pages use clean no-extension public URLs
- Legacy `.html` and moved-page URLs should redirect to the canonical public pages

## Deployment reminders
- Keep `_redirects`, `robots.txt`, `sitemap.xml`, and `llms.txt` aligned
- Do not reintroduce duplicate public URLs for hub pages
- Do not add large clusters of thin township or near-duplicate location pages
- Remove or redirect stale legacy pages instead of leaving extra indexable copies behind

## Search Console goal for the current cleanup pass
The current cleanup is focused on:
- reducing duplicate discovery
- pruning weak location pages
- preserving only stronger money pages and support pages
- making redirects and sitemap signals line up cleanly before resubmission
