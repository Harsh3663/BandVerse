# BandVerse — Design System

**Discover. Perform. Connect.**

| | |
|---|---|
| **Document Owner** | Design Director's Office |
| **Status** | Draft v1.0 — Official Design Guideline |
| **Source of Truth** | `docs/PRD.md` (product scope) + `docs/InformationArchitecture.md` (screens/flows) — this document defines *how things look and feel*, not what exists |
| **Last Updated** | August 2026 |

> This document defines tokens and component principles, not implementation. No CSS, no Tailwind config, no React — those are engineering decisions that should be built *from* this system, not the other way around. Every value below (colors, spacing, type sizes) is a **design token specification**, ready to be implemented in whatever styling technology engineering chooses.

---

## Brand Identity

### The Feeling We're Designing For

Close your eyes and imagine walking into a great live show ten minutes before it starts: the room is dim, a single warm light is on the stage, there's anticipation in the air, and everything about the space tells you *something good is about to happen*. That feeling — **anticipation, warmth, quality, confidence** — is the emotional target for every screen in BandVerse. Not a spreadsheet. Not a listings site. A stage.

### Brand Pillars → Design Translation

| Brand Pillar (from PRD) | What it means for design |
|---|---|
| **Premium** | Generous whitespace, restrained color use, high-quality imagery over icons/illustration where possible, no visual clutter |
| **Modern** | Contemporary geometric typography, subtle motion, glass/blur effects used with intent, no skeuomorphism or dated gradients |
| **Confident** | Strong type hierarchy, decisive color contrast, few but purposeful accent moments — confidence is expressed through restraint, not decoration |
| **Energetic** | A single, vivid accent color (Spotlight Gold, see below) used sparingly at moments of delight and action — energy through precision, not noise |
| **Minimal** | Every element must earn its place; if removing it doesn't hurt comprehension, it doesn't ship |
| **Elegant** | Consistent rhythm (spacing, alignment, type scale) — elegance is the byproduct of systematic consistency, not embellishment |
| **Authentic** | Real performer photography/video is the hero visual language, not stock imagery or illustration — authenticity can't be faked with design |
| **Human** | Warm color temperature, rounded (not sharp) geometry, conversational microcopy tone, generous touch targets |

### What BandVerse Must Never Feel Like

| Anti-pattern | How this system prevents it |
|---|---|
| College project | No default framework styling left un-customized; every component has an opinionated, branded state |
| Bootstrap template | No boxy, heavy-bordered cards; no default blue links; a distinct type and color identity, not a generic one |
| Admin dashboard | Public-facing surfaces (Discovery, Profiles, Landing) are visually rich and editorial; only internal Admin screens are allowed to feel utilitarian — and even those follow the same type/color tokens |
| Generic booking website | No dense data tables as a primary pattern for customer-facing screens; no cluttered form-heavy layouts; performer media is always the visual hero, not a thumbnail afterthought |

---

## Color Philosophy

### Guiding Principle

Color in BandVerse is used **structurally, not decoratively**. A large, saturated color palette dilutes premium feel — the best premium products (Linear, Stripe, Apple) use one confident primary hue, one deliberate accent, and do almost everything else in a carefully tuned neutral scale. BandVerse follows this discipline: **one primary hue family, one accent hue, a disciplined neutral ramp, and semantic colors reserved strictly for meaning (never decoration).**

### Why a Dark-First Theme

BandVerse ships with **dark theme as the primary/default experience**, with a fully-supported light theme as an equal alternative (never a second-class "light mode as an afterthought").

**Why dark-first:** the brand metaphor is a stage — a dark environment where a single warm light draws focus. A dark UI:
1. Makes performer photography and video (the actual product) pop dramatically more than on a white background — media becomes the "stage light" against a dark "room."
2. Aligns with the premium-tech register of Spotify, Linear, and Apple's own dark surfaces (e.g., Apple Music, Apple TV).
3. Reduces eye strain during evening browsing — realistically when a large share of event planning and browsing happens (after work, before bed).

**Why light theme is still mandatory, not optional:** many performers (per PRD personas — moderate tech comfort, outdoor/on-the-go use) will primarily use BandVerse in bright daylight conditions where dark UI has poor legibility. Accessibility and real-world usability require both themes to be genuinely first-class, not a "dark mode is the real product, light mode is a fallback" approach.

### Primary Color — "Stage Violet"

A confident violet-indigo: mysterious and premium (avoiding the two most overused startup colors — generic SaaS blue and Instagram-adjacent gradient-purple), while still reading as vivid and energetic rather than corporate.

| Token | Hex | Usage |
|---|---|---|
| `primary-50` | `#F4F1FF` | Tinted backgrounds on light theme (e.g., selected filter chip background) |
| `primary-100` | `#E7E0FF` | Hover backgrounds, subtle highlights |
| `primary-200` | `#CFC1FF` | Disabled-state accents, light borders |
| `primary-300` | `#AD97FF` | Secondary icons/accents on dark surfaces |
| `primary-400` | `#8D71FF` | Hover state of primary actions |
| `primary-500` | `#7451F5` | **Core brand color** — logo, primary buttons (light theme), key highlights |
| `primary-600` | `#5D37E0` | Primary button default state (dark theme), active/pressed states |
| `primary-700` | `#4826B8` | Text-on-light requiring AA contrast (links, active nav on light theme) |
| `primary-800` | `#341B87` | Deep accents, gradient end-stop |
| `primary-900` | `#20105A` | Rarely used — deep gradient/background tinting only |

*Why 500 vs. 600 as "the" primary depending on theme:* on dark backgrounds, a slightly deeper violet (600) reads as more legible and less neon; on light backgrounds, the brighter 500 provides sufficient contrast while feeling more vivid — this is standard practice in mature design systems (see Radix, Material 3 tonal palettes) and prevents the common mistake of using one fixed brand hex that looks great in Figma but washes out or vibrates depending on theme.

### Secondary / Accent Color — "Spotlight Gold"

A warm amber-gold used **exclusively** for high-intent moments: primary CTAs on dark surfaces, "featured" badges, ratings/stars, and the occasional celebratory micro-moment (booking confirmed). This is the "stage light" of the palette — it must stay rare to stay powerful.

| Token | Hex | Usage |
|---|---|---|
| `accent-50` | `#FFF8E9` | Rare — tinted highlight backgrounds |
| `accent-100` | `#FFECC2` | Badge backgrounds (light theme) |
| `accent-300` | `#FFD374` | Icon accents, star ratings (unfilled contrast state) |
| `accent-500` | `#F5A623` | **Core accent** — star ratings, "Featured" badge, highlight underlines |
| `accent-600` | `#D6890F` | Accent text on light backgrounds (AA-compliant) |
| `accent-700` | `#A8680A` | Pressed/active accent states |

**Rule of restraint:** Accent Gold should never be used for more than one element's worth of emphasis per screen. If a screen has a primary CTA in gold, nothing else on that screen should also be gold — this preserves its function as a directional signal, not a color scheme.

### Semantic Colors

Reserved strictly for system meaning — never for branding or decoration, so users can trust them instantly.

| Purpose | Token | Hex (base) | Usage |
|---|---|---|---|
| **Success** | `success-500` | `#2FB673` | Booking confirmed, payment successful, verified badge |
| **Warning** | `warning-500` | `#E8A93B` | Pending states, "awaiting response," profile incompleteness |
| **Error / Destructive** | `error-500` | `#E2544B` | Failed payment, cancellation, validation errors |
| **Info** | `info-500` | `#4C8DFF` | Informational banners, tooltips, neutral system messages |

*Why Success is a teal-leaning green, not a generic "grass green":* it needs to sit harmoniously next to Stage Violet without clashing (a pure grass green fights violet on the color wheel), and a teal-leaning green feels more premium/modern than a saturated "traffic light" green — consistent with how Linear/Stripe treat success states.

*Why Warning is muted amber, not the same hue family as Accent Gold:* Accent Gold is a *brand/delight* color, Warning is a *system meaning* color — if they were visually identical, a "featured artist" badge and a "profile incomplete" warning would be indistinguishable at a glance, which is a real usability failure. They are deliberately differentiated in saturation and value.

### Neutral Colors

A single neutral ramp with a very subtle cool-violet undertone (not a pure gray), so it feels cohesive with the primary hue rather than clashing with it — a technique used extensively at Linear and Vercel.

| Token | Hex (Dark theme role) | Hex (Light theme role) |
|---|---|---|
| `neutral-0` | `#FFFFFF` (text on dark) | `#0D0C14` (primary text) |
| `neutral-50` | `#0A0912` (app background) | `#FAFAFC` (app background) |
| `neutral-100` | `#131220` (surface / card) | `#F2F1F6` (surface / card) |
| `neutral-200` | `#1B1A2B` (elevated surface) | `#E7E5EE` (elevated surface / border) |
| `neutral-300` | `#262538` (borders, dividers) | `#D8D6E3` (borders, dividers) |
| `neutral-400` | `#3B3A52` (disabled elements) | `#C1BFCF` (disabled elements) |
| `neutral-500` | `#5C5A78` (placeholder text) | `#8E8CA3` (placeholder text) |
| `neutral-600` | `#8C8AA3` (secondary text) | `#6B6980` (secondary text) |
| `neutral-700` | `#B3B1C4` (tertiary/muted text) | `#4A4860` (tertiary text) |
| `neutral-800` | `#DEDCE8` (primary text, dark theme) | `#2A2840` (headings) |
| `neutral-900` | `#F7F6FA` (highest-emphasis text) | `#0D0C14` (highest-emphasis text) |

### Dark Theme — Surface & Elevation Strategy

On dark backgrounds, **box-shadow is nearly invisible**, so elevation cannot rely on shadow alone (a common mistake that makes dark-theme UIs feel flat and confusing about hierarchy). Instead, elevation on dark theme is communicated through a combination of:

1. **Progressive surface lightening** — each elevation level uses a slightly lighter neutral (see `neutral-50` → `neutral-200` above as background → card → elevated-card).
2. **A subtle 1px top-lit border** (a hairline slightly lighter than the surface, suggesting a light source from above) — this is the same trick macOS and Linear use to make dark surfaces feel tactile.
3. **Soft, low-opacity ambient shadow** (still applied, but treated as a secondary cue, not the primary one) for large floating elements like modals and dropdowns.

### Light Theme — Surface & Elevation Strategy

Light theme uses **traditional soft, diffused shadows** as the primary elevation cue (shadow is highly legible on light backgrounds), kept intentionally soft and low-contrast (never a hard drop-shadow) to preserve the "elegant," not "boxy," feeling.

| Elevation Level | Usage | Light Theme Shadow | Dark Theme Treatment |
|---|---|---|---|
| **0 — Flat** | Page background | none | `neutral-50` background |
| **1 — Resting** | Cards, list items | `0 1px 2px rgba(13,12,20,0.04), 0 1px 1px rgba(13,12,20,0.03)` | `neutral-100` bg + 1px hairline border `neutral-200` |
| **2 — Raised** | Hover state cards, dropdown triggers | `0 2px 8px rgba(13,12,20,0.06)` | `neutral-150` bg + hairline top-highlight |
| **3 — Floating** | Popovers, tooltips, dropdown menus | `0 8px 24px rgba(13,12,20,0.10)` | `neutral-200` bg + ambient shadow (12% opacity black) |
| **4 — Overlay** | Modals, dialogs | `0 16px 48px rgba(13,12,20,0.16)` | `neutral-200` bg + stronger ambient shadow + backdrop dim |
| **5 — Toast/System** | Toasts, always-on-top alerts | `0 12px 32px rgba(13,12,20,0.14)` | `neutral-250` bg + glass treatment (see below) |

### Gradients

Used **sparingly, only at moments meant to feel special** — hero backgrounds, premium/featured badges, and celebratory success states. Overusing gradients is the fastest way to make a product feel like a 2021 SaaS landing page template, so BandVerse limits itself to exactly two signature gradients:

| Gradient | Composition | Usage |
|---|---|---|
| **Stage Gradient** | `primary-700 → primary-500 → accent-500` (135°, subtle, slow transition) | Hero section backgrounds, "Build Your Own Band" feature banner, premium subscription upsell surfaces |
| **Spotlight Glow** | Radial, `accent-500` at 25% opacity fading to transparent | Used behind featured performer avatars/cards, celebratory success screens (booking confirmed) — mimics an actual stage spotlight |

**Rule:** gradients never appear behind body text (contrast/readability risk) and never on more than one section of any given screen.

### Glass / Blur Effects

Reserved for **surfaces that float above content and need to maintain spatial context with what's beneath them** — this is a deliberate, narrow use case, not a blanket aesthetic choice:

| Use Case | Treatment | Why |
|---|---|---|
| Top navigation bar (on scroll) | Backdrop blur + semi-transparent surface (`neutral-50` at ~80% opacity) | Lets content peek through while remaining legible — feels lighter than a hard-edged opaque bar, echoes Apple's own navigation treatment |
| Mobile bottom sheet (filters, quick actions) | Backdrop blur behind the sheet, opaque sheet surface itself | Focuses attention on the sheet while providing spatial continuity with the page behind it |
| Command palette / global search overlay | Strong backdrop blur + dim | Signals a distinct, focused mode without a jarring hard cut |

**Explicit restraint:** glass effects are never used on primary content cards (artist cards, booking cards) — glass on top of glass, or glass as a default card treatment, quickly reads as visual noise rather than premium polish. It is reserved for temporary/overlay UI only.

---

## Typography

### Font Families

| Role | Typeface | Why |
|---|---|---|
| **Display / Headings** | **Cabinet Grotesk** (or equivalent confident geometric grotesque) | Headings need personality — a distinctive, slightly characterful geometric sans immediately signals "designed brand," not "default system font," which is the single fastest way to avoid the "college project" feeling. Reserved for H1–H4 and hero display text only. |
| **Body / UI Text** | **Inter** | The industry-proven choice for UI legibility at small sizes across a huge range of devices and pixel densities; variable-weight support gives fine-grained control over hierarchy without loading many font files. Used for body copy, buttons, labels, forms, navigation. |
| **Regional Scripts (roadmap)** | **Noto Sans (Devanagari / Gujarati)** | Required for the PRD's Hindi/Marathi/Gujarati localization roadmap — chosen because it's metrically designed to pair predictably alongside Inter's Latin glyphs, avoiding jarring size/weight mismatches when scripts are mixed on one page. |
| **Numerals / Data (prices, dates, IDs)** | Inter (tabular figure variant) | Tabular (fixed-width) numerals prevent price and date values from visually "jumping" in width as digits change — important in booking summaries, calendars, and pricing tables. |

*Why not one font for everything:* a single-typeface system (common in generic templates) is faster to implement but reads as flat. Pairing one **characterful display face** with one **highly legible workhorse face** is the exact pattern used by Linear (Inter + custom display), Stripe, and Notion — distinct personality at the top of the hierarchy, maximum clarity everywhere else.

### Heading Scale

A modular type scale (~1.25 ratio) that compresses at smaller sizes and expands at larger ones — mathematically consistent but visually tuned, not a rigid formula applied blindly.

| Token | Size (Desktop) | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `display-xl` | 64px | 700 (Bold) | 1.05 | -2% | Landing page hero headline only |
| `display-l` | 48px | 700 | 1.1 | -2% | Section headlines (landing page) |
| `h1` | 40px | 600 (Semibold) | 1.15 | -1.5% | Page titles (Profile name, Dashboard section titles) |
| `h2` | 32px | 600 | 1.2 | -1% | Major section headers within a page |
| `h3` | 24px | 600 | 1.25 | -0.5% | Card group headers, modal titles |
| `h4` | 20px | 600 | 1.3 | 0% | Sub-section headers, list group titles |
| `h5` | 18px | 600 | 1.35 | 0% | Card titles (artist/band name on cards) |

*Why negative letter-spacing on large headings:* at large sizes, default letter spacing looks visually "loose" — tightening tracking as size increases is a standard typographic correction (used by Apple, Linear) that makes big display text feel more deliberate and premium rather than default-rendered.

### Body Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `body-l` | 18px | 400 (Regular) | 1.6 | Lead paragraphs, profile bios |
| `body-m` | 16px | 400 | 1.6 | Default body text, form inputs, buttons |
| `body-s` | 14px | 400 | 1.5 | Secondary text, card metadata, table cells |
| `caption` | 12px | 500 (Medium) | 1.4 | Timestamps, helper text, form hints |
| `overline` | 11px | 600 | 1.4 | +8% letter spacing, uppercase | Eyebrow labels, category tags, section kickers |

*Why line-height is generous (1.5–1.6) on body but tight (1.05–1.3) on headings:* body text is read continuously and needs breathing room between lines for comfortable scanning (especially important for the accessibility-conscious, lower-tech-literacy segment of our users); headings are scanned as single visual units, not read line-by-line, so tight leading reinforces their weight and cohesion instead.

### Responsive Typography

Rather than a fixed desktop scale that abruptly changes at breakpoints, headings **scale fluidly** between a minimum (mobile) and maximum (desktop) size proportional to viewport width — preventing the jarring "type size jump" that happens with fixed breakpoint-based sizing.

| Token | Mobile Min | Desktop Max |
|---|---|---|
| `display-xl` | 36px | 64px |
| `display-l` | 30px | 48px |
| `h1` | 28px | 40px |
| `h2` | 24px | 32px |
| `h3` | 20px | 24px |

Body text sizes (`body-m`, `body-s`) remain **fixed across breakpoints** — body copy legibility should not shrink on mobile just because the viewport is smaller (a common and harmful mistake); only display/heading text benefits from fluid scaling.

---

## Layout

### Grid System

A **12-column grid** on desktop/tablet, collapsing to a **4-column grid** on mobile — 12 columns provide flexible asymmetric layouts (e.g., a 8/4 split for content + sidebar) while 4 columns keep mobile layouts simple and prevent overly narrow, cramped columns.

| Breakpoint | Columns | Gutter | Margin |
|---|---|---|---|
| Mobile (<768px) | 4 | 16px | 20px |
| Tablet (768–1023px) | 8 | 20px | 32px |
| Desktop (1024–1439px) | 12 | 24px | 48px |
| Large Desktop (≥1440px) | 12 | 24px | Auto (content max-width centers) |

### Spacing System

A **4px base unit** scale — small enough for fine-grained control, large enough to keep every spacing decision systematic rather than arbitrary (no "17px margin because it looked right").

| Token | Value | Typical Usage |
|---|---|---|
| `space-1` | 4px | Icon-to-label gap, tight inline spacing |
| `space-2` | 8px | Compact internal padding (chips, badges) |
| `space-3` | 12px | Form field internal padding |
| `space-4` | 16px | Default component padding, gap between related elements |
| `space-5` | 20px | Card internal padding (mobile) |
| `space-6` | 24px | Card internal padding (desktop), gap between cards in a grid |
| `space-8` | 32px | Gap between distinct component groups |
| `space-10` | 40px | Section internal padding (mobile) |
| `space-12` | 48px | Gap between major page sections |
| `space-16` | 64px | Section internal padding (desktop) |
| `space-20` | 80px | Large section separation (landing page) |
| `space-24` | 96px | Hero section vertical padding |

*Why this matters more than it seems:* whitespace consistency is the single biggest lever for making a product feel "designed" rather than "assembled" — nearly every design system audit of a product that "feels like a college project" traces the feeling to inconsistent, arbitrary spacing far more often than bad color choices.

### Container Widths

| Container | Max Width | Usage |
|---|---|---|
| `container-narrow` | 720px | Reading-focused content: legal pages, blog posts, FAQ |
| `container-default` | 1120px | Standard page content: dashboard, forms, profile detail |
| `container-wide` | 1320px | Discovery grids, landing page sections with card grids |
| `container-full` | 100% (no max) | Hero backgrounds, map views, full-bleed media |

*Why a narrow container for text-heavy pages specifically:* optimal reading line length is ~60–75 characters; letting legal/FAQ text stretch to the same 1320px width as a card grid page would produce uncomfortably long lines and measurably hurt readability.

### Breakpoints

| Token | Range |
|---|---|
| `xs` | 0–479px |
| `sm` | 480–767px |
| `md` | 768–1023px |
| `lg` | 1024–1279px |
| `xl` | 1280–1439px |
| `2xl` | ≥1440px |

### Responsive Behaviour Principles

1. **Mobile layouts are authored, not derived.** Every component has an explicit mobile composition, not just a "shrunk desktop version" — e.g., a Booking Card's desktop horizontal layout becomes a vertical stack on mobile, not a horizontally-compressed version of the same layout.
2. **Touch first, pointer-enhanced.** All interactive elements meet the 44×44px minimum touch target regardless of breakpoint; desktop adds hover-only enhancements (tooltips, hover-reveal actions) as progressive enhancement, never as the only way to access a function.
3. **Content reflow over content hiding.** When space is constrained, prefer reflowing content into a new arrangement (e.g., stacking) over hiding it behind additional taps — hiding information to "simplify" mobile is usually a workaround for an under-designed component, not a real solution.

---

## Components

Every component below is defined by **purpose → states → key decisions & rationale**. Visual weight (padding, radius, elevation) inherits from the design tokens above.

### Buttons

**Purpose:** communicate the single most important action on a screen unambiguously.

| Variant | Usage |
|---|---|
| **Primary** | One per screen/section — the single most important action (e.g., "Book Now," "Confirm Payment") |
| **Secondary** | Supporting actions alongside a primary (e.g., "View Details" next to "Book Now") |
| **Tertiary / Ghost** | Low-emphasis actions (e.g., "Cancel," "Skip for now") |
| **Destructive** | Uses `error-500` — cancellations, account deletion, decline actions |
| **Icon Button** | Circular/square, icon-only, always paired with an accessible label |

**States:** default, hover (subtle lift + slight brightness increase), active/pressed (scale down 2% + darken), focus (visible ring using `primary-300`, never removed), disabled (40% opacity, no pointer feedback), loading (label replaced by an inline spinner, button width preserved to prevent layout shift).

**Sizing:** three sizes (`sm` 36px height, `md` 44px height, `lg` 52px height) — `md` is the default and meets the 44px touch-target minimum by default rather than as an exception.

*Why only one Primary button per view:* multiple competing primary buttons dilute decision-making and visually flatten hierarchy — a hallmark of unpolished products. If two actions seem equally important, that's a hierarchy decision to resolve in design review, not a case for two primary buttons.

### Cards

**Purpose:** the primary content container across the entire product (artist cards, band cards, booking cards, etc. — see dedicated sections below). All cards share a base anatomy for consistency.

**Base anatomy:** media area (top, 16:10 aspect ratio default) → content padding (`space-5`/`space-6`) → primary title (`h5`) → metadata row (`body-s`, `neutral-600`) → action row (bottom-aligned).

**Elevation:** Level 1 (resting) by default, transitions to Level 2 on hover with a subtle upward translate (2–4px) — this "lift toward the viewer" motion is a deliberate tactile cue that the card is interactive, more intuitive than a color change alone.

**Radius:** 16px corner radius across all cards — large enough to feel soft/premium (avoiding sharp, "enterprise dashboard" corners) without becoming overly playful/rounded (which would undercut the "confident, premium" personality).

### Forms & Inputs

**Purpose:** the highest-friction moment in any flow (onboarding, booking, payment) — forms must minimize cognitive and physical effort.

**Key decisions:**
- **Floating/persistent labels above the field**, never placeholder-as-label (a well-documented accessibility and usability failure — placeholder text disappears the moment a user starts typing, removing the only context for what the field is).
- **Inline, real-time validation** on blur (not on every keystroke, which feels punitive) with specific error messaging tied to the field via accessible association.
- **Grouped, progressive forms** — long forms (e.g., artist onboarding) are broken into logical steps with a visible progress indicator, never a single overwhelming scroll of every field at once.
- **Input height:** 48px default — generous enough for comfortable touch interaction and to visually match button height for aligned form+action rows.
- **Border-only default state** (no filled background) on light theme; **subtle filled surface** (`neutral-100`) on dark theme, since a border alone has lower contrast/visibility against dark backgrounds.

### Dropdowns & Select Menus

- Trigger matches standard input height (48px) for visual consistency with adjacent form fields.
- Menu appears at Elevation 3, with a **max-height + internal scroll** rather than pushing page content when option lists are long (e.g., city selection).
- Selected state uses a checkmark + `primary-500` text color — never relies on background color change alone (contrast/accessibility).
- Multi-select variants show selections as removable chips within the trigger itself, so the current state is always visible without opening the menu.

### Search Bars

**Purpose:** the most important single interactive element in the product (per IA §2.1/§6) — deserves outsized design attention.

- Pill-shaped (fully rounded), Elevation 1 at rest, Elevation 2 on focus, with a soft `primary-200`-tinted glow ring on focus (not just a hard border) — reinforces "this is the important interactive surface" without being loud.
- Icon (magnifying glass) always left-aligned; a clear ("×") affordance appears right-aligned once text is entered.
- On mobile, tapping expands to a **full-screen search takeover** (per IA) with the keyboard, autosuggest, and recent searches all immediately visible — never a cramped inline expansion.
- Autosuggest results are visually distinguished by type (performer name vs. category vs. city) via small leading icons/labels, so users can parse a mixed result list at a glance.

### Navigation (Top Nav / Sidebar)

- **Top Nav:** height 72px desktop / 60px mobile, glass-blur treatment on scroll (see Glass Effects), logo always top-left, primary actions right-aligned.
- **Sidebar:** 264px expanded width, collapsible to a 72px icon-only rail; active item indicated by a `primary-500` left-border accent + subtle background tint (`primary-50`/`neutral-100`) — never bold text alone, which is a weak and inaccessible signal of "active" state.
- Navigation items always pair icon + label at full width; icon-only at collapsed width, with tooltips on hover to preserve comprehension.

### Sidebar (Dashboard)

Covered above under Navigation — additionally: sidebar sections are visually grouped with `overline`-style small-caps section labels (e.g., "MANAGE," "INSIGHTS") and `space-6` vertical rhythm between groups, so a dashboard with 8–10 items never feels like an undifferentiated list.

### Dialogs (Modals)

- Elevation 4, centered, max-width 480px (small confirmation dialogs) or 640px (content-rich dialogs, e.g., booking request form).
- Backdrop: 60% opacity `neutral-900`/black scrim + slight blur — focuses attention decisively without fully hiding page context.
- Always dismissible via: explicit close button, `Esc` key, and backdrop click (unless the action is destructive/irreversible-in-progress, e.g., mid-payment, in which case backdrop-click-to-dismiss is intentionally disabled to prevent accidental data loss).
- Entry animation: scale from 96% → 100% + fade-in, 200ms — communicates the dialog "arriving" from the trigger point rather than simply appearing.

### Drawer (Side Sheet)

Used for **contextual, longer-form tasks that benefit from keeping the underlying page visible** (e.g., mobile filters, chat thread on tablet, booking detail preview) — the key distinction from a Dialog: a Drawer is for tasks that *relate to* the page behind it, a Dialog is for a *focused, blocking* decision.

- Slides in from the right on desktop/tablet (or bottom, for mobile filter sheets), Elevation 4, width 400–480px (desktop) or full-width (mobile).
- Page content behind it dims slightly (20% scrim) but remains visible — reinforcing that the underlying context still matters.

### Toast (Notifications)

- Appears top-right (desktop) / top-center (mobile), Elevation 5, glass treatment on dark theme for a lightweight, floating feel.
- Auto-dismisses after 5 seconds for informational toasts; **persists until manually dismissed** for actionable or error toasts (e.g., "Payment failed — Retry") — auto-dismissing an error the user hasn't had time to act on is a common and frustrating failure mode.
- Always includes an icon matching semantic color (success/warning/error/info) — never color alone.

### Tables (Admin-primary use case)

Per the Brand Identity principle, dense tables are an **Admin-context pattern**, not a customer-facing default. Where used (Admin user management, transaction ledgers):

- Row height 56px minimum (comfortable scanning, not cramped enterprise-density).
- Sticky header on scroll; sortable columns indicated with a subtle directional icon, never relying on a tooltip alone.
- Zebra-striping avoided (reads as dated); row separation instead via a single 1px hairline divider (`neutral-200`/`neutral-300`) — quieter and more premium.
- Row hover state: subtle background tint, not a border change — communicates interactivity without visual noise.

### Timeline (Performance History)

Used on Artist/Band public profiles to show performance history (per PRD §8.2).

- Vertical timeline on mobile, can switch to a horizontal scrollable timeline on desktop for profiles with many entries (more space-efficient than an ever-growing vertical list).
- Each entry: date marker (accent dot on a connecting line) + event thumbnail (if available) + short description — media-first, since photos/videos from past events are far more persuasive to a prospective customer than text descriptions alone.

### Media Gallery

The single most important content module on any performer profile (per Brand Identity: "authentic" and "media-first").

- **Masonry or curated grid layout** (not a rigid uniform grid) to accommodate mixed photo/video aspect ratios without awkward cropping.
- Video content is visually distinguished with a play-icon overlay and (where available) auto-playing muted preview loops on hover (desktop) / on-scroll-into-view (mobile) — this single interaction dramatically increases engagement with performer media versus a static thumbnail, and directly serves the PRD's "watch previous events" core use case.
- Full-screen lightbox on tap/click, swipeable between media items, with visible position indicator (e.g., "3 of 12").

### Video Player

- Custom-branded player chrome (not raw default browser controls) — controls use the same icon set and color tokens as the rest of the product, reinforcing that video is a first-class, native part of the experience rather than an embedded third-party widget.
- Poster frame (thumbnail) always required at upload time — never a blank black frame before play, which reads as broken/unprofessional.
- Autoplay is **muted-only and only within gallery preview contexts**, never with sound — unsolicited audio autoplay is a well-established trust/annoyance violation.

### Maps

- Custom map styling (not default Google Maps skin) matching the neutral palette — a default-styled Google Map visually clashes hard with a custom dark-themed product and is one of the fastest ways to break premium perception.
- Custom marker design: performer category is encoded via a small icon within a branded pin shape (not default red teardrop markers); practice-location pins use a visually distinct secondary marker style (per IA §6.3) — e.g., outlined/dashed vs. solid fill.
- Clustering applied at low zoom levels to avoid overwhelming pin density; cluster markers show a count and expand smoothly on click/zoom.

### Booking Cards

Represents a single booking's state at a glance across dashboards and lists.

- Left-aligned status indicator (colored dot + label, using semantic colors — "Requested" = `warning-500`/amber, "Confirmed" = `info-500`/blue, "Completed" = `success-500`/green, "Cancelled/Disputed" = `error-500`/red) — color plus text label together, never color alone.
- Shows: counterpart name/photo, event date, event type, price, and status — in that priority order, since date and counterpart identity are what users scan for first when reviewing a list of bookings.
- Tapping opens the full Booking Detail (per IA §5.0); the card itself never contains destructive actions inline (e.g., no "Cancel" button directly on the list card) — destructive actions require the intentional context of the detail view, preventing accidental taps.

### Band Cards / Artist Cards

The core discovery unit — appears in search results, landing page carousels, and comparison views. Given how central this component is, it gets the most design attention of any card type.

**Anatomy:** hero media (photo/video preview, 4:5 or 1:1 aspect ratio — taller than a typical landscape card, since portrait-oriented performer photography is more common and more flattering) → name + verified badge (if applicable) → category/genre tag → star rating + review count → starting price → distance (if location-aware search) → quick-save (heart/bookmark) icon, top-right of media.

**Why the verified badge is placed directly next to the name, not as a separate row:** trust signals need to be seen in the very first glance, at the same reading position as the identity itself — burying it below other metadata reduces its effectiveness.

**Why price is shown as "Starting at ₹X," not a range or hidden:** directly implements the PRD's pricing-transparency principle (see IA §11.3) at the most fundamental unit of the discovery experience.

### Review Cards

- Reviewer name/initial avatar + star rating + relative date (e.g., "2 weeks ago," not a raw timestamp — more human, per Brand Identity) → review text → (optional) reviewer-submitted photo(s) from the actual event → performer's public response, visually indented/nested beneath, in a subtly tinted sub-card to distinguish it from the original review.
- Long reviews truncate with a "Read more" expansion rather than always showing full text — preserves scannability in a list of many reviews.

### Pricing Cards

Used for package/tier display (Artist pricing, Band packages).

- Clear visual hierarchy: package name → price (largest, most prominent number on the card) → included features (checklist format, not paragraph text) → single clear CTA.
- If multiple tiers are shown side-by-side, the recommended/most-popular tier gets a subtle `accent-500` top border + small "Most Booked" label — a single, restrained emphasis technique rather than oversized "popular" ribbons or badges that feel like aggressive upsell tactics (inconsistent with "elegant" brand personality).

### Chat UI

- Message bubbles: outgoing (customer/performer's own messages) use `primary-500`/`primary-600` fill with light text; incoming use a neutral surface (`neutral-100`/`neutral-200`) with default text color — standard, well-understood convention that requires no learning curve.
- Booking context card **pinned at the top of the thread** (per IA §7 negotiation flow) — persistent visibility of what's being discussed (date, price, event type) prevents the common chat-UI failure of losing transactional context in a long scrolling conversation.
- Typing indicators and read receipts use subtle, low-emphasis treatment (small animated dots, small double-checkmark) — present for reassurance, but never visually competing with actual message content.

### Calendar

- Month-grid view as default (matches mental model of event planning — "what's happening this month"), with a toggle to a compact list/agenda view for accessibility and for users who find grid scanning difficult.
- Available dates: neutral/default state. Booked/unavailable dates: subtle diagonal texture or muted fill + a small indicator — **never just grayed out with no distinction from "past date"**, which is a common source of user confusion (is this date unavailable because it's booked, or because it's already passed?).
- Selected date range (for multi-day events) uses a `primary-100` background fill connecting start and end dates, with the endpoints emphasized in solid `primary-500`.

---

## Motion

### Guiding Principle

Motion in BandVerse is **purposeful and informative, never decorative for its own sake**. Every animation should answer one of three questions for the user: *where did this come from, what changed, or is the system working?* If an animation doesn't answer one of these, it's cut.

### Timing & Easing Standards

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `motion-instant` | 100ms | ease-out | Hover color/opacity changes, button press feedback |
| `motion-fast` | 180ms | ease-out | Toggle states, small element transitions (checkbox, switch) |
| `motion-base` | 240ms | cubic-bezier(0.2, 0, 0, 1) | Card hover lift, dropdown open, tab switching |
| `motion-moderate` | 320ms | cubic-bezier(0.2, 0, 0, 1) | Modal/drawer entrance, page section reveals on scroll |
| `motion-slow` | 480ms | ease-in-out | Full-page transitions, hero animations |

*Why a custom cubic-bezier rather than default ease/linear:* default CSS easing curves feel mechanical; a slightly decelerated custom curve (fast start, gentle settle) feels more natural and "physical" — this is the same category of easing curve used across Apple's and Linear's interfaces and is one of the more noticeable (if subconscious) contributors to a product feeling premium versus generic.

### Micro-Animations

- **Buttons:** subtle scale-down (98%) on press, immediate — provides tactile confirmation of the tap/click registering.
- **Icon buttons (like/save):** a small "pop" spring animation (slight overshoot) on activation (e.g., saving a favorite) — this is one of the rare places a slightly playful, non-strictly-utilitarian animation is appropriate, because it's a positive, low-stakes user action (an intentional exception to strict minimalism, used for delight in exactly one interaction pattern).
- **Form field focus:** border/glow transitions over `motion-fast`, label float-up over `motion-base`.

### Page Transitions

- Route changes within the app use a **subtle cross-fade + slight vertical shift** (new content enters from 8px below, fades in) over `motion-moderate` — signals forward navigation without a jarring, disorienting slide (which can feel gimmicky at the scale of dozens of route types).
- Modal/drawer entrances use scale/slide-in as described in Components; exits reverse the same motion at a slightly faster duration (exits should always feel quicker than entrances — leaving should never feel more effortful than arriving).

### Hover States

- Cards: 2–4px upward translate + elevation increase (Level 1 → 2), `motion-base`.
- Links/text buttons: underline animates in from the left over `motion-fast` rather than appearing instantly — a small but consistently noticed refinement.
- Media (gallery thumbnails, video previews): subtle scale (102–103%) on hover, clipped within a fixed-size container — communicates interactivity on the single most important content type in the product.

### Loading Skeletons

Per IA §8: skeletons, not spinners, for initial content loads.

- Skeleton shapes precisely match the final content's layout (card outlines, text-line placeholders at correct widths) — a mismatched skeleton (e.g., generic gray boxes unrelated to final layout) causes a jarring "pop" when real content loads and undermines the perceived-performance benefit skeletons are meant to provide.
- Subtle shimmer animation (a soft gradient sweep, `motion-slow`, looping) communicates "actively loading" rather than "stuck" — a fully static skeleton can read as frozen/broken after a couple of seconds.

### Scroll Behaviour

- Landing page sections use a **subtle fade + upward reveal** (16px translate) as they enter the viewport, triggered once per element (not re-triggered on scroll-back) — reinforces narrative pacing (per IA §4 landing page ordering) without becoming a distracting "everything animates every time" experience.
- Top navigation transitions from transparent/minimal (at page top, especially over a hero image) to the glass-blur elevated treatment once the user scrolls past the hero — a common, well-understood pattern that keeps the hero visually clean while ensuring nav remains usable and legible once content scrolls beneath it.
- `prefers-reduced-motion` is respected globally: all scroll-triggered and page-transition animations are replaced with instant or near-instant (fade-only, no translate) equivalents.

### Empty States

Per IA §8: illustration/graphic + message + next action. Motion here is restrained — a single gentle fade-in on load, no looping or attention-seeking animation, since an empty state should feel calm and inviting, not anxious or "broken."

### Success States

Reserved as one of the few places to allow a slightly more expressive motion moment (matching the "energetic" brand pillar) — e.g., booking confirmation: a brief, tasteful use of the Spotlight Glow gradient (radial burst, `motion-slow`, plays once) behind a success checkmark icon. This is intentionally the emotional high point of the interface — a wedding customer just confirmed hiring a band for one of the most important days of their life, and the interface should acknowledge that appropriately, once, without becoming a recurring gimmick used for minor actions.

### Error States

Deliberately **muted motion** — a small horizontal shake (2–3px, 2 cycles, `motion-fast`) on invalid form submission is acceptable as a well-established, subtle convention; anything larger (bouncing, red flashing, exclamation animations) reads as alarming and punitive, inconsistent with the "human" and "warm" brand pillars even when delivering bad news.

---

## Iconography

- **Style:** outlined (stroke-based), 1.5px stroke weight, rounded line caps/joins — pairs naturally with the 16px card radius and rounded, human brand personality; avoids the colder, more technical feeling of sharp-cornered or filled/solid icon sets.
- **Grid:** all icons designed on a consistent 24×24px grid for uniform optical weight across the set, regardless of source (custom-drawn vs. icon library).
- **Fill exception:** icons switch to a filled variant **only** to indicate an active/selected state (e.g., a filled heart once saved, filled star for a completed rating) — the outline→fill transition itself becomes a meaningful state signal, not just decoration.
- **Category icons (map pins, category filters):** a small, custom-drawn set representing each performer category (guitar, dhol, DJ turntable, violin, mic, etc.) — generic/mismatched stock icon packs rarely have accurate representations of traditional instruments like a dhol or a tasha, and getting these specifically right is a meaningful authenticity signal to exactly the underserved communities the PRD identifies as core differentiators.

## Illustration Style

Illustration is used **sparingly and only in specific, non-photographic contexts**: empty states, onboarding walkthroughs, and error pages — never as a substitute for real content on discovery or profile screens (where photography must always be the hero, per Brand Identity).

- **Style:** simple, geometric, two-to-three-color illustrations using the primary/accent palette at reduced opacity — abstract enough to feel premium and brand-consistent, not cartoonish or overly literal (avoiding the generic "flat illustration character with oversized head" style heavily associated with template-feeling SaaS products).
- **Tone:** warm and optimistic even in error/empty contexts — e.g., an empty "no bookings yet" illustration should evoke anticipation (a spotlight, a stage curtain about to open) rather than absence.

## Photography Style

Photography is the **primary visual language of the entire product** — this is a deliberate strategic design choice, not a default.

- **Guideline for platform-sourced imagery** (landing page, marketing, category headers): warm, low-key lighting; genuine performance moments (mid-performance energy, audience reactions) over posed studio shots — reinforces the "authentic" brand pillar and differentiates from generic corporate-event stock photography.
- **Guideline for user-generated content** (performer-uploaded photos/videos): the platform does not impose a strict style requirement on performers' own uploads (that would be unrealistic and gatekeeping), but the **onboarding flow actively coaches performers** toward better submissions (simple in-app tips: "photos with good lighting get 2x more views," suggested minimum photo count) — quality is encouraged through guidance and incentive, not enforced through rejection, which would create exactly the friction the PRD is trying to eliminate for lower-tech-literacy performer segments.
- **Treatment:** a subtle, consistent color-grading overlay (slightly warmer shadows, slightly cooler highlights — a filmic look) can be applied uniformly to platform-served thumbnails/cards to create visual cohesion across a feed of otherwise wildly different source photo qualities, without altering the performer's actual uploaded media.

## Video Preview Style

- Every performer video requires a **selected poster/cover frame** at upload (not an arbitrary auto-generated first frame, which is very often a black or blurry transition frame) — this single detail has an outsized impact on gallery browsing quality.
- Preview loops (autoplay-muted, in gallery/card contexts) are capped at **6–8 seconds**, sourced from a mid-performance highlight rather than the start of the full video (which is often setup/soundcheck, not performance) — shows the most compelling, representative content in the least amount of time, respecting the scanning behavior of a customer comparing multiple performers quickly.
- A subtle **progress-ring indicator** appears around the play icon during preview looping, so users understand they're watching an auto-looping preview rather than the full video — sets accurate expectations before they click through to the full lightbox/player.

---

## Summary — How This System Prevents Every "Anti-Pattern" Named in the Brief

| Anti-pattern to avoid | Where this system prevents it |
|---|---|
| College project | Custom type pairing (Cabinet Grotesk + Inter), disciplined 2-hue palette, systematic 4px spacing — nothing left at framework defaults |
| Bootstrap template | 16px card radius + soft shadows/glass instead of boxy bordered panels; no default-blue links; branded icon set instead of generic icon packs |
| Admin dashboard | Media-first card anatomy, restrained data-table usage confined to true Admin contexts only, motion and photography treated as core (not absent) design elements |
| Generic booking website | Transparent pricing patterns, authentic photography/video as the visual hero throughout, a distinctive Stage Violet + Spotlight Gold identity instead of generic corporate blue |

*Next recommended milestone: with tokens and component principles now defined, the next step is either (a) a component-by-component low/mid-fidelity wireframe pass for the highest-traffic screens (Landing, Discovery, Public Profile, Booking flow) applying these tokens, or (b) a focused Accessibility & Contrast Audit of the exact hex values above (validating every text/background pairing against WCAG AA before any screen is designed on top of them). Recommend (b) first — it's far cheaper to adjust token values now than after dozens of screens have been designed against them.*
