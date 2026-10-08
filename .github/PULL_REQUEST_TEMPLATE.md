<!--
  Theme change PR template. Tick each box before requesting review.
  Delete the sections that do not apply, but keep the checklist honest.
-->

## What changed

<!-- One or two sentences. Link the issue/request if there is one. -->

## Theme change checklist

- [ ] I ran `shopify theme check` (or `npm run check`) locally and it passes with no errors.
- [ ] I previewed the change in the Shopify theme editor / `shopify theme dev` — not just in a static browser.
- [ ] I checked the change on **mobile** (≈375px wide), not only desktop.
- [ ] The affected section still renders with **zero blocks** / empty settings (no broken or empty markup, no Liquid errors).
- [ ] Any section schema I touched is **valid JSON** (settings, blocks, presets all parse).
- [ ] I did not hardcode store domains, tokens, or theme IDs in Liquid/JS/CSS.
- [ ] I did not move theme folders out of the repo root (layout/, sections/, assets/, ... stay put).
- [ ] New/renamed assets are referenced through `asset_url` / `{{ 'x' | asset_url }}` where appropriate.

## Screenshots / preview link

<!-- Desktop + mobile screenshots, or a theme preview link. -->
