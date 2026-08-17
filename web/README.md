# BandVerse — Web (Frontend)

The Next.js frontend for BandVerse. This package is the **engineering
foundation only** — routing, theming, design tokens, and the shared
component architecture. No business features (auth, search, booking,
dashboards) exist here yet; they land in future milestones on top of this
foundation.

**Source of truth for product/design decisions** (never redesign these —
open a discussion instead):

- [`../docs/PRD.md`](../docs/PRD.md) — product scope
- [`../docs/InformationArchitecture.md`](../docs/InformationArchitecture.md) — sitemap, navigation, flows
- [`../docs/DesignSystem.md`](../docs/DesignSystem.md) — color/type/spacing/motion tokens
- [`../docs/LandingPageExperience.md`](../docs/LandingPageExperience.md) — landing page spec (not yet built)

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui
(Radix primitives) · Framer Motion · Lucide Icons · next-themes.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000, Turbopack dev server
```

| Script                            | Purpose                                             |
| --------------------------------- | --------------------------------------------------- |
| `npm run dev`                     | Start the dev server (Turbopack)                    |
| `npm run build`                   | Production build                                    |
| `npm run start`                   | Serve a production build                            |
| `npm run lint` / `lint:fix`       | ESLint (Next.js Core Web Vitals + TypeScript rules) |
| `npm run typecheck`               | `tsc --noEmit` — CI should run this alongside lint  |
| `npm run format` / `format:check` | Prettier (with Tailwind class sorting)              |

## Folder structure

```
src/
├── app/                 App Router routes, layouts, and system pages
│   ├── layout.tsx       Root layout: fonts, ThemeProvider, nav shell
│   ├── page.tsx         Foundation verification page (NOT the real landing page)
│   ├── loading.tsx      Global route-transition fallback
│   ├── not-found.tsx    Branded 404
│   ├── error.tsx        Root error boundary
│   └── globals.css      Tailwind v4 + all design tokens (@theme)
├── components/
│   ├── ui/              shadcn/ui primitives — generated, rarely hand-edited
│   ├── layout/          Structural shell: Header, Footer, Container
│   ├── theme/           ThemeProvider (next-themes) + ThemeToggle
│   └── shared/          Small reusable presentational components (Logo, ...)
├── config/              Site metadata, nav structure — single source, no
│                        hardcoded links inside components
├── hooks/               Reusable, component-agnostic React hooks
├── lib/                 utils.ts (cn helper), fonts.ts, motion.ts
└── types/               Shared TypeScript types used across components/lib
```

**Why three tiers of components** (`ui/`, `layout/`, `shared/`): `ui/`
primitives stay low-level and upgradable via the shadcn CLI without
conflicts; `layout/` composes them into BandVerse-specific structure;
`shared/` holds small cross-cutting pieces that aren't generic enough for
`ui/` but aren't page-specific either. As real features (Discovery,
Profiles, Booking) are built, they should get their own top-level
`src/features/<name>/` (or similar) directories rather than growing
`components/shared/` into a junk drawer.

## Design tokens: how to use them correctly

`globals.css` defines two layers of color tokens — **read the comment block
at the top of that file before adding any new color usage.** The short
version:

- **Semantic tokens** (`bg-background`, `text-foreground`, `bg-card`,
  `bg-primary`, `border-border`, ...) — theme-aware, use these for all UI
  chrome so dark/light mode "just works."
- **Raw palette** (`bg-primary-500`, `bg-gold-500`, `bg-success-500`,
  `bg-neutral-300`, ...) — fixed values, use only for one-off/non-themed
  contexts (illustrations, charts, marketing graphics).

The brand accent color ("Spotlight Gold", `gold-*`) is intentionally **not**
wired into shadcn's generic `accent` token (which controls subtle hover
backgrounds everywhere). Overloading that would make gold appear on every
dropdown/menu hover across the app, violating the Design System's explicit
rule that gold must stay rare. Use `gold-*` utilities directly, deliberately,
and rarely.

## Known follow-ups (tracked here so they aren't lost)

1. **Display font placeholder.** The Design System specifies "Cabinet
   Grotesk," a commercial/Fontshare typeface not available via Google
   Fonts/npm. `src/lib/fonts.ts` currently maps `font-display` to **Space
   Grotesk** (closest free equivalent) as a placeholder. See the detailed
   swap instructions in that file's comments — no other file needs to
   change when the real font is licensed.
2. **`npm audit` flags 3 high-severity advisories** in `postcss`/`sharp`,
   both bundled transitively inside `next@15.5.x`'s own dependency tree.
   The only fix currently available is upgrading to Next.js 16, which
   conflicts with this project's explicit Next.js 15 pin. Revisit when
   either a patched Next 15.x point release ships, or the team decides to
   move to Next 16.
3. **Real brand mark.** `components/shared/logo.tsx` renders a text
   wordmark in `font-display`; swap for a real SVG/logo asset once Design
   produces one — it's the only file that needs to change.
