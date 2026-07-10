# Working Reference: Wand & Willow Horizon Theme

## Quick Reference

- **Theme:** Shopify Horizon v3.4.0
- **Brand:** Wand & Willow (magical goods store)
- **Fonts:** Playfair Display (heading), Inter (body) — loaded via Google Fonts in `layout/theme.liquid:36-41`
- **CSS:** Two systems — Horizon native (`base.css`) + Tailwind (`landing-tailwind.css`)
- **Tailwind scoped via:** `.landing` class on `<body>` (`layout/theme.liquid:50`), `important: '.landing'` in `tailwind.config.cjs:64`
- **Build:** `npm run build:css` (prod) / `npm run dev:css` (watch)
- **Brand colors:** `brand-dark`, `brand-forest`, `brand-gold`, `brand-goldHover`, `brand-parchment`, `brand-sand`, `brand-text`, `brand-muted` — defined as CSS vars in `snippets/landing-theme-tokens.liquid`
- **Font Awesome:** loaded via CDN in `layout/theme.liquid:41`

## Architecture Conventions

### Section Pattern (landing sections)
```
sections/landing-*.liquid
  - Tailwind utility classes in HTML
  - {% schema %} with name, tag: "section", class: "landing-*"
  - Blocks for repeatable items (max_blocks, blocks array)
  - Settings for static content (text, image_picker, richtext, url, select, etc.)
  - presets array for editor defaults
```

### Block Pattern
```
blocks/*.liquid (public, no underscore prefix)
blocks/_*.liquid (internal/sub-blocks, underscore prefix)
  - {% render 'snippet_name', param: block.settings.param %}
  - {% schema %} with "tag": null for inline blocks
  - Use "static": true for blocks whose content is determined by section
```

### Snippet Pattern
```
snippets/landing-*.liquid (W&W specific)
  - {%- doc -%} ... {%- enddoc -%} for JSDoc-style docs
  - @param annotations for all params
  - {%- liquid %} for logic blocks
```

### Key Reusable Snippets
| Snippet | Purpose |
|---------|---------|
| `landing-button.liquid` | CTA buttons with palette/tone variants |
| `landing-section-heading.liquid` | Section title with eyebrow, divider |
| `landing-theme-tokens.liquid` | CSS custom properties for brand colors |
| `landing-featured-product-card.liquid` | Product card in landing context |

### JSON Template Pattern
```
templates/*.json
  - sections array with type references to section files
  - section blocks configured inline
  - block_order arrays for ordering
```

## Color Scheme IDs
| ID | Purpose | Colors |
|----|---------|--------|
| `scheme-1` | Primary (white bg, black text) | #ffffff, #000000 |
| `scheme-2` | Light gray | #f5f5f5 |
| `scheme-3` | Sage green | #eef1ea |
| `scheme-4` | Light blue | #e1edf5 |
| `scheme-5` | Dark (announcement, inverse) | #333333, white text |
| `scheme-6` | Transparent overlay | transparent, white text |
| `scheme-UUID` | Transparent, black text | transparent |

## Section Groups
- `header-group.json` → `header-announcements` + `landing-header`
- `footer-group.json` → `landing-footer`

## Conversion Status

### Completed Sections (in templates)
- [x] Homepage (index.json) — 8 landing sections
- [x] Product page (product.json)
- [x] Collection page (collection.json)
- [x] Cart (cart.json)
- [x] Blog (blog.json)
- [x] Article (article.json)
- [x] Generic page (page.json)
- [x] About page (page.about.json)
- [x] Contact page (page.contact.json)
- [x] Search (search.json)
- [x] 404 (404.json)
- [x] Password (password.json)

### HTML Exports NOT Yet Converted
| Export File | Target Template | Notes |
|-------------|-----------------|-------|
| `1-My Favourites.html` | `page.favourites.json` | Wishlist — needs `{% render 'app-wishlist' %}` |
| `2-Loyalty Program.html` | `page.loyalty.json` | |
| `3-Loyalty Program 2.html` | — | Variant, may merge with above |
| `2-Subscription Options.html` | `page.subscription.json` | |
| `3-Frequently Asked Questions.html` | `page.faq.json` | |
| `3-Magical Goods Store.html` | — | Alternative storefront layout? |
| `4-Order Confirmation.html` | — | Checkout flow (may not be theme-controlled) |
| `5-Checkout Process.html` | — | Checkout flow (may not be theme-controlled) |
| `page.community.html` | `page.community.json` | |
| `page.privacy.html` | `page.privacy.json` | |
| `page.terms.html` | `page.terms.json` | |

### Missing Features
- [ ] Customer account templates (`templates/customers/` is empty)
- [ ] Wishlist app integration (`{% render 'app-wishlist' %}`)
- [ ] Review app integration (`{% render 'judgeme_widgets' %}`)
- [ ] Translation tags (`{{ 'key' | t }}`) not used in landing sections
- [ ] No `.shopify/cli.themerc` for theme link

## Settings Schema Groups (settings_schema.json)
1. Theme info
2. Logo and Favicon
3. Landing design tokens (custom — brand colors + spacing)
4. Colors (color_scheme_group with 40+ tokens)
5. Typography
6. Page Layout
7. Animations
8. Badges
9. Buttons
10. Cart
11. Drawers
12. Icons
13. Input Fields
14. Popovers & Modals
15. Prices
16. Product Cards
17. Search
18. Swatches
19. Variant Pickers

## Tailwind Config Notes
- **Content:** `blocks/*.liquid`, `layout/**/*.liquid`, `sections/**/*.liquid`, `snippets/**/*.liquid`, `templates/**/*.{json,liquid}`, `assets/**/*.{js,ts}`
- **Spacing:** Uses `--landing-space-unit` CSS var multiplier (0-32)
- **Colors:** Only brand-* colors, white, black, red-500
- **Font families:** `font-heading` (Playfair Display), `font-body` (Inter)
- **IMPORTANT:** Config is `.cjs` not `.js` — update AGENTS.md if needed

## File Count Summary
- Sections: 74 files (72 .liquid + 2 .json)
- Blocks: 94 files (54 public + 40 internal)
- Snippets: 101 files
- Templates: 14 files + customers/ (empty)
- Assets: 116 files
- Locales: 51 files (25+ languages)

## Theme Check Baseline
- **Command:** `shopify theme check` (or `npm run check`)
- **Status:** 341 files inspected, 25 warnings (all from base Horizon theme, zero errors)
- **Warnings are all in upstream Horizon code** — safe to ignore for conversion work
- Our custom landing sections/blocks: zero offenses
