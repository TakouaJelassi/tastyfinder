# TastyFinder Brand Guide

TastyFinder is a warm, modern recipe product for discovering, generating, saving, and planning meals. The visual direction should feel calm, curated, and portfolio-ready: more like a small food product than a training app.

## Brand Personality

- Warm, helpful, and clean
- Modern recipe app with handcrafted details
- Calm surfaces, soft contrast, and food-inspired accents
- Professional enough for recruiters, friendly enough for daily use

## Logo Direction

The wordmark should use the product name `TastyFinder`.

Implemented assets:

- Full logo: `public/brand/logo.svg`
- Icon mark: `public/brand/icon-mark.svg`
- Browser favicon: `public/favicon.svg`
- Web app manifest: `public/site.webmanifest`

Recommended logo structure:

- `Tasty` in the heading typeface or a soft serif treatment
- `Finder` in the UI typeface or the same serif with slightly stronger weight
- Optional small food mark beside the wordmark

Logo usage:

- Use the full wordmark in navigation, auth screens, and portfolio screenshots.
- Use the compact icon mark for app icons, loading states, empty states, and small UI surfaces.
- Keep enough whitespace around the logo. Minimum clear space: the height of the icon mark.

## Icon System

TastyFinder uses a simple line-icon system through the shared `app-icon` component.

Usage rules:

- Use the brand icon only for logo, favicon, app identity, and auth/navigation branding.
- Use line icons for page headers, empty states, navigation, utility actions, and metadata.
- Keep icon color tied to the design tokens, not one-off hardcoded colors.
- Avoid random emoji as permanent UI icons.
- Avoid pseudo-handmade SVG illustrations unless they are professionally designed and consistent.

## Image And Illustration Direction

TastyFinder should rely on strong recipe photography and clean UI composition instead of weak decorative illustrations.

Rules:

- Use real recipe images for food discovery and recipe cards.
- Use line icons for empty states and product features.
- Do not use generated-looking clipart or mixed illustration styles.
- Add custom illustration assets only if they are high quality, consistent, and reviewed as part of the design system.

## Color Palette

Core colors are defined in `src/styles.scss`.

Primary palette:

| Role          | Token             | Hex       | Usage                                         |
| ------------- | ----------------- | --------- | --------------------------------------------- |
| Primary       | `--primary`       | `#c2674a` | Main CTAs, highlights, active states          |
| Primary dark  | `--primary-dark`  | `#a5512f` | Hover states, stronger text accents           |
| Primary light | `--primary-light` | `#f6ece5` | Soft backgrounds, chips, subtle CTAs          |
| Accent        | `--accent`        | `#7e8b6e` | Secondary badges, food marks, calm highlights |
| Accent light  | `--accent-light`  | `#ebeee4` | Secondary soft surfaces                       |

Neutral palette:

| Role           | Token             | Hex       | Usage                      |
| -------------- | ----------------- | --------- | -------------------------- |
| App background | `--bg`            | `#fdfbf7` | Page background            |
| Surface        | `--surface`       | `#ffffff` | Cards, panels, forms       |
| Soft surface   | `--surface-2`     | `#f7f2ea` | Gradients, nested surfaces |
| Warm surface   | `--surface-3`     | `#fff8ef` | Branded highlight areas    |
| Text           | `--text`          | `#2a2622` | Main text                  |
| Muted text     | `--text-muted`    | `#8b8378` | Captions, helper copy      |
| Border         | `--border`        | `#ebe4d9` | Default borders            |
| Strong border  | `--border-strong` | `#ddd1c3` | Emphasis borders           |

Status colors:

| Role          | Token             | Hex       |
| ------------- | ----------------- | --------- |
| Success       | `--success`       | `#2f7d4f` |
| Success light | `--success-light` | `#eef8f1` |
| Warning       | `--warning`       | `#b86f21` |
| Warning light | `--warning-light` | `#fff7e8` |
| Danger        | `--danger`        | `#c2413d` |
| Danger light  | `--danger-light`  | `#fff1f0` |

Color rules:

- Do not introduce random new colors for feature pages.
- Use primary for the most important action on a screen.
- Use accent for supportive metadata and calm highlights.
- Use status colors only for real success, warning, or error states.
- Keep recipe imagery colorful; keep UI surfaces controlled and warm.

## Typography

Fonts:

- Heading: `Playfair Display`
- UI/body: `Plus Jakarta Sans`

Usage:

- Use `Playfair Display` for hero titles, page titles, and prominent recipe/card titles.
- Use `Plus Jakarta Sans` for navigation, forms, buttons, metadata, and body copy.
- Keep headings confident but not oversized.
- Use uppercase labels sparingly for section kickers and metadata.

Recommended scale:

| Role          | Size                         |
| ------------- | ---------------------------- |
| Hero title    | `clamp(2.6rem, 5.5vw, 4rem)` |
| Page title    | `clamp(1.8rem, 4vw, 2.4rem)` |
| Section title | `1.35rem - 1.5rem`           |
| Card title    | `1.1rem - 1.25rem`           |
| Body          | `15px - 16px`                |
| Metadata      | `12px - 13px`                |

## Radius

Use rounded shapes consistently, but avoid making everything overly soft.

| Token           | Value   | Usage                              |
| --------------- | ------- | ---------------------------------- |
| `--radius-sm`   | `10px`  | Small inputs, compact controls     |
| `--radius-md`   | `14px`  | Standard controls and list items   |
| `--radius`      | `16px`  | Default cards and panels           |
| `--radius-lg`   | `22px`  | Feature cards, page panels, modals |
| `--radius-pill` | `999px` | Buttons, chips, badges             |

Rules:

- Cards and feature panels should usually use `--radius-lg`.
- Form fields should usually use `--radius-sm` or `--radius-md`.
- Pills are reserved for buttons, chips, badges, and compact metadata.

## Shadows

Use shadows softly. The app should feel warm and premium, not heavy.

| Token            | Usage                                 |
| ---------------- | ------------------------------------- |
| `--shadow-sm`    | Default card depth                    |
| `--shadow`       | Interactive hover depth               |
| `--shadow-lg`    | Hero cards, modals, elevated surfaces |
| `--shadow-focus` | Accessible focus ring support         |

Rules:

- Pair shadow with a border for better definition.
- Hover may lift by `translateY(-1px)` or `translateY(-2px)`.
- Avoid dark, cold shadows; use warm brown-tinted shadows.

## Button Style

Primary buttons:

- Background: `--primary`
- Hover: `--primary-dark`
- Shape: `--radius-pill`
- Font weight: `700` or `800` for key CTAs
- Motion: subtle lift and warm shadow

Secondary buttons:

- Background: `--surface` or transparent
- Border: `1.5px solid --border`
- Hover: `--primary-light`
- Text: `--text` or `--primary`

Destructive buttons:

- Text/border: `--danger`
- Hover background: `--danger-light`
- Use only for remove, clear, logout, or destructive actions.

Button rules:

- Every interactive control needs a visible hover/focus state.
- Do not use multiple competing primary buttons in the same area.
- Keep action language short and concrete.

## Cards And Surfaces

Default cards should use:

- Warm gradient surface
- `1px` border using `--border`
- `--radius-lg`
- `--shadow-sm`
- Hover border and shadow only where the card is interactive

Recipe cards:

- Image first, title second, metadata third, CTA last
- Use controlled tag pills
- Keep image aspect consistent
- Treat favorite as a utility action, visually secondary to the recipe title

Empty states:

- Use a simple line icon inside `.page-mark`
- One clear heading
- One helpful sentence
- One primary next action when possible

## Accessibility

- Keep text contrast high enough on warm backgrounds.
- Use `:focus-visible` and `--shadow-focus` for keyboard users.
- Do not rely on color alone for status.
- Keep semantic buttons, links, labels, and form fields.
- Decorative page icons should use `aria-hidden="true"`.

## Do Not Use

- Random emoji as permanent UI icons
- Uncontrolled new colors
- Heavy black shadows
- Purple/blue generic SaaS gradients
- Too many nested cards
- Inline styles for reusable UI decisions
- Different button styles per page

## Implementation Source Of Truth

The source of truth for live tokens is:

`src/styles.scss`

When changing the visual system, update the tokens first, then apply them to feature styles.
