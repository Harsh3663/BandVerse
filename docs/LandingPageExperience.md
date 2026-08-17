# BandVerse — Landing Page Experience Specification

**Discover. Perform. Connect.**

| | |
|---|---|
| **Document Owner** | Lead Product Design Office |
| **Status** | Draft v1.0 — Visual & Interaction Specification |
| **Source of Truth** | `docs/PRD.md` (scope), `docs/InformationArchitecture.md` (sections/order), `docs/DesignSystem.md` (tokens) — this document specifies *experience*, introduces zero new sections or features |
| **Last Updated** | August 2026 |

> This is a visual and interaction specification, not an implementation spec. No markup, no styling code — every reference to color, type, spacing, or motion below uses the exact tokens already defined in `docs/DesignSystem.md`, so this document can go directly into the hands of a visual designer and, later, an engineer, without translation loss.

---

## 1. Complete Page Narrative

**The one-sentence version:** the page should feel like the lights slowly coming up before a show — starting in near-darkness with a single point of focus, and gradually revealing a whole world of talent, culture, and possibility as you move through it, ending with the quiet confidence that you know exactly who to book.

**The emotional arc, beat by beat:**

| Moment | Feeling | What's Happening On Screen |
|---|---|---|
| **0–2 seconds** | *Curiosity + anticipation* | Hero loads: dark, cinematic, a single warm light on real performance footage. No clutter. The visitor's eye has exactly one place to go. |
| **2–8 seconds** | *"Oh, this understands me"* | Headline and search bar reveal. The visitor realizes this isn't a generic listings site — it's built around a real, specific need (find talent, nearby, now). |
| **Scroll begins** | *Immersion* | The page stops feeling like a "website" and starts feeling like scrolling through a curated lineup — real faces, real instruments, real venues. |
| **Mid-page (Traditional Performers, Popular Bands)** | *Delight + surprise* | The visitor discovers depth they didn't expect — a Dhol Tasha troupe, a folk ensemble — categories rarely given this kind of premium visual treatment anywhere else. This is the emotional "hook" moment. |
| **How It Works + Testimonials** | *Reassurance* | Any lingering "can I trust this?" doubt is answered concretely and briefly — never a wall of text, just enough to remove hesitation. |
| **FAQs + Final CTA** | *Resolved confidence* | Remaining objections are pre-empted. The final CTA doesn't feel like a hard sell — it feels like an invitation to the show that's already been building for the whole scroll. |
| **Footer** | *Quiet trust* | The last impression is stability and legitimacy — not a marketing flourish, just clear, calm, comprehensive information. |

**Design principle governing the whole page:** *restraint builds anticipation*. Nothing competes for attention at the same time. Every section gets its own moment, its own breathing room (`space-20`–`space-24` between major sections per the Design System), and its own single clear takeaway — the page never asks the visitor to process two big ideas at once.

---

## 2. Hero Section

### Layout

Full-bleed, full-viewport-height (100vh on desktop, ~92vh on mobile to hint at scrollable content below — never trapping the user in an ambiguous "is this the whole page?" moment). Content is **center-aligned, vertically centered**, constrained to `container-narrow` (720px) width for the text block, with the search bar slightly wider (~640px) sitting just below the subheadline.

```
┌──────────────────────────────────────────────┐
│                [ transparent nav ]             │
│                                                │
│              (eyebrow label)                  │
│         DISCOVER · PERFORM · CONNECT           │
│                                                │
│        Every unforgettable event               │
│         starts with the right sound.            │
│                                                │
│     Find and book verified musicians, bands,    │
│      and traditional performers near you.       │
│                                                │
│   [ 📍 City ]  [ 🎵 Category ]  [ Search → ]    │
│                                                │
│         ↓  scroll indicator (subtle)           │
└──────────────────────────────────────────────┘
   (full-bleed cinematic performance footage,
    dark gradient overlay, single warm light)
```

### Headline

**"Every unforgettable event starts with the right sound."**

Set in `display-xl` (64px desktop / fluid down to 36px mobile), Cabinet Grotesk, weight 700, `-2%` tracking, pure white (`neutral-900` on dark theme). Two lines maximum on desktop, wrapping naturally — never forced with manual line breaks, so it reflows gracefully across breakpoints.

*Why this headline over a more literal one (e.g., "Find musicians near you"):* it leads with the **emotional outcome** (an unforgettable event) rather than the mechanical function (a search tool) — consistent with the brand pillar of feeling premium and human rather than utilitarian. The literal function is still made unmistakably clear one line below.

A small **eyebrow label** sits above the headline: `DISCOVER · PERFORM · CONNECT` — `overline` token, uppercase, `+8%` tracking, in `accent-500` at 80% opacity. This does double duty: it reinforces the brand tagline on first contact, and its warm gold color is the very first "spotlight" moment the eye catches against the dark background.

### Subheadline

**"Find and book verified musicians, bands, and traditional performers near you — with real videos, transparent pricing, and honest reviews."**

`body-l` (18px), Inter, `neutral-700`/`neutral-600` (soft, secondary emphasis — never competing with the headline's contrast), max-width constrained to ~52 characters per line for comfortable reading, centered, `space-4` below the headline.

*Why "verified," "real videos," "transparent pricing," "honest reviews" are named explicitly here:* this single sentence is doing the PRD's entire trust-differentiation job (§3 Problem Statement) in one breath, right at the first moment of contact — before the visitor has scrolled at all, they already understand what makes this different from a WhatsApp referral or a generic listings page.

### Background

A slow, silent, looping **cinematic video montage** (6–10 second loop, muted, auto-playing) of real BandVerse performance footage: a guitarist mid-solo, a Dhol Tasha troupe in motion, a wedding band in full swing, a solo vocalist under stage light — 3–4 clips cross-dissolving into one another. Treated with:

- A **consistent color grade** (per Design System Photography Style — warm shadows, cooler highlights, filmic) so visually disparate source clips feel like one cohesive brand film, not a stock reel.
- A **dark gradient scrim** (bottom-heavy, `neutral-50` at ~70% opacity fading to ~20% at the top) ensuring the headline/search text always meets AA contrast regardless of what's playing behind it at any given moment.
- A very subtle **Spotlight Glow** (per Design System Gradients) radiating from roughly the center-top of the frame — an intentional, almost subconscious echo of an actual stage light, reinforcing the brand metaphor without being literal or cheesy.

*Fallback:* on low-bandwidth connections or `prefers-reduced-motion`, the video is replaced by a single, carefully chosen high-quality static photograph with the same grade and scrim treatment — never a blank color background, since the imagery itself carries much of the emotional weight of the hero.

### Animation (Entrance Sequence)

A deliberate, staggered reveal — nothing appears all at once:

1. **0ms:** background video begins playing (already loading during the brief loading-state moment before this, see §8).
2. **150ms:** dark scrim fades in over the video (`motion-moderate`, 320ms).
3. **400ms:** eyebrow label fades up (`motion-base`, 8px upward translate + opacity 0→1).
4. **550ms:** headline fades up, same treatment, slightly larger translate distance (12px) to feel like the "main event" arriving with a touch more weight.
5. **750ms:** subheadline fades up.
6. **900ms:** search bar fades up **and** scales from 98%→100% — the search bar gets a slightly more pronounced entrance than plain text, subconsciously marking it as "the interactive one."
7. **1200ms:** scroll indicator (a thin, slowly pulsing downward chevron) fades in last, low-emphasis.

Total entrance sequence: ~1.4 seconds — fast enough to never feel like the visitor is waiting, slow enough that the staggering is perceptible and feels choreographed rather than instantaneous.

### Buttons

The Hero intentionally has **no separate "Sign Up" button competing with the search bar** — the search bar's own submit action *is* the primary CTA (a magnifying-glass icon button, filled `primary-600`, integrated into the right edge of the search pill). This is a deliberate simplification: per Design System's "one primary action" principle, the search bar already represents the single most important action on this screen, and adding a second, separate large CTA button would dilute it.

A secondary, low-emphasis text link — **"I'm a performer →"** — sits quietly below the search bar (`body-s`, `neutral-600`, underline-on-hover only), routing to the performer-acquisition page (`/for-performers` per IA). This acknowledges the supply-side visitor without stealing visual weight from the primary customer-facing flow, which is correct given landing-page traffic is predominantly demand-side.

### Search

The Hero search bar is a **three-part pill**: `[ 📍 Location ]  |  [ 🎵 Category — optional ]  |  [ Search button ]`, matching the Design System's Search Bar component spec (pill shape, Elevation 2, glass-tinted surface sitting on top of the video background so it reads clearly against any frame of the loop).

- **Location field:** pre-fills with the visitor's detected city (via the same graceful, rationale-first permission prompt described in the IA §6.2) or shows a placeholder "Your city" if location is unavailable/denied.
- **Category field:** optional, a lightweight dropdown (Solo Artists, Bands, Dhol Tasha, Banjo, Folk, Wedding Bands) — left empty by default so the first-touch experience isn't gated by a decision the visitor may not have made yet.
- Clicking into either field triggers a **soft glow ring** (per Design System) and, on the location field, an inline autosuggest of matching cities.

### Motion

- **Idle micro-motion:** the background video itself provides all the "ambient" motion in this section — no additional floating/bobbing decorative animation is layered on top of static elements, since two independent motion sources (video + decorative UI motion) would compete and feel busy rather than cinematic.
- **Parallax:** a very subtle parallax (the video background moves ~5% slower than the foreground content on scroll) as the visitor begins scrolling away from the Hero — just enough to create a sense of depth between the "stage" (background) and the "audience's view" (foreground content), consistent with the show metaphor, without becoming a gimmicky heavy-parallax effect.

---

## 3. Every Section After Hero

Each section follows the Design System's `container-wide` (1320px) or `container-default` (1120px) width as noted, with `space-20` (80px) vertical padding between major sections on desktop, `space-12` (48px) on mobile.

### 3.1 Trust Strip

**Purpose:** deliver an immediate, low-effort credibility signal in the first few seconds after the Hero — before asking for any further attention investment.

**Layout:** a slim, full-width horizontal band directly beneath the Hero, `neutral-100` surface (a subtle tonal shift from the Hero's near-black, signaling "we've moved to the next beat"), `space-8` vertical padding.

**Components:** three or four stat items in a single row (`display: flex`, evenly spaced): e.g., **"2,400+ Verified Performers"**, **"18 Cities"**, **"12,000+ Events Booked"**, **"4.8★ Average Rating"** — numerals in `h3` weight, labels in `caption`, `neutral-600`.

**Animation:** numbers **count up** from zero over ~1.2 seconds, triggered once when the section scrolls into view (a well-established, low-risk "trust delight" pattern — quantified proof feels more credible when it visibly accumulates rather than appearing static).

**Interaction:** none — this section is intentionally non-interactive, a pure statement of fact, not a distraction from the browsing that follows.

**Spacing:** `space-8` internal, `space-16` before the next section begins.

### 3.2 Nearby Artists

**Purpose:** immediately demonstrate personal relevance — "this isn't generic, this is near *you*, right now."

**Layout:** section header (`overline` "NEAR YOU" + `h2` "Talented performers in [City]") left-aligned, followed by a **horizontally scrollable row** of Artist Cards (per Design System component spec), 4–5 visible at once on desktop, peeking a 5th partial card at the edge to visually hint "there's more, scroll me."

**Components:** Artist Cards (portrait media, name, verified badge, category tag, rating, starting price, distance) — distance is the one metadata field emphasized here specifically (vs. other sections), since proximity is this section's entire reason for existing.

**Animations:** cards fade + slide up (`motion-base`) in a **staggered sequence** (60ms delay between each) as the section enters the viewport — a subtle "dealing cards onto a table" feeling rather than all appearing simultaneously.

**Interaction:** horizontal scroll via mouse-wheel-to-horizontal translation (desktop), native touch swipe (mobile/trackpad); small left/right chevron controls appear on hover (desktop only, since touch devices don't need them) at the row's edges.

**Spacing:** `space-6` gap between cards, `space-10` between section header and card row.

### 3.3 Featured Artists

**Purpose:** provide a curated, editorially-vetted showcase — critical in early markets where "Nearby" results may still be sparse (per IA §4 rationale), and a chance to demonstrate the platform's range and quality bar deliberately, not algorithmically.

**Layout:** visually near-identical to Nearby Artists (same card, same horizontal-scroll pattern) but distinguished by a **"Featured" ribbon-free treatment** — a small `accent-500` dot + "Featured" `overline` label integrated into the card's metadata row (never a loud ribbon/banner across the corner, which reads as aggressive advertising rather than editorial curation).

**Components:** identical Artist/Band Card component — deliberately reusing the same visual language as Nearby Artists reinforces that "Featured" is a quality signal, not a different, separate marketplace.

**Animations/Interaction:** identical pattern to 3.2, for consistency and to avoid the visitor needing to learn a new interaction model twice in a row.

### 3.4 Traditional Performers Spotlight

**Purpose:** the single most differentiated, emotionally resonant section on the page — this is where BandVerse announces "we take Dhol Tasha, Banjo, and Folk performers as seriously as any other act," a claim no comparable platform makes. Per the page narrative (§1), this is the "delight + surprise" beat.

**Layout:** breaks the horizontal-scroll pattern used elsewhere — this section gets a **full-width, editorial treatment**: a large, immersive photo/video banner (16:7 aspect ratio) on the left half of the section, with a short cultural-context headline and a 2×2 grid of representative group cards on the right half (desktop). This asymmetry is intentional — a section this important shouldn't use the exact same "just another scrollable row" pattern as the sections around it, or its significance would be visually flattened.

**Components:** headline (`h2`) — e.g., **"Celebrate tradition. Book the real thing."** — one short supporting sentence, then the group card grid (Dhol Tasha, Banjo, Folk, Wedding Bands — using the same base card component, but sized slightly larger here to reflect the section's visual priority).

**Animations:** the large banner media uses a slow, subtle **Ken Burns effect** (imperceptibly slow zoom, ~1.0→1.05 scale over 20+ seconds, looping) rather than a static image — communicates living, ongoing culture rather than a frozen snapshot, and differentiates this section's motion signature from the horizontal-scroll sections around it.

**Interaction:** the entire banner is clickable through to the Traditional Arts Spotlight page (per IA); group cards link to their respective category landing pages.

**Spacing:** `space-24` above and below this section specifically (more than the standard `space-20`) — giving it visibly more breathing room than its neighbors is itself a hierarchy signal that this section matters more.

### 3.5 Popular Bands

**Purpose:** category depth for the second major supply type, maintaining momentum after the emotional peak of the Traditional Performers section.

**Layout/Components/Animation/Interaction:** identical pattern to Featured Artists (3.3), substituting Band Cards — deliberate repetition here is a feature, not a shortcut: by this point in the scroll, the visitor has fully learned the "horizontal row of cards" interaction pattern, so it can be reused efficiently without re-explaining itself.

### 3.6 How It Works

**Purpose:** resolve any accumulated "how does this actually work / is this safe" uncertainty concisely, right before testimonials reinforce it socially.

**Layout:** centered `h2` section title ("Booking live talent has never been this simple"), followed by a **3-step horizontal layout** on desktop (three columns, each with a large numeral, a simple custom icon/illustration, a short title, one sentence of description) collapsing to a vertical stack on mobile.

**Steps:** 1) **Discover** — browse verified performers near you, watch real videos. 2) **Book & Pay Securely** — chat, confirm details, pay safely online. 3) **Enjoy the Show** — leave a review and build the community.

**Components:** simple line-art custom illustrations (per Design System Illustration Style — geometric, 2–3 color, brand-palette) rather than photography here, since this section is conceptual/instructional rather than showcasing actual performers.

**Animations:** each step's icon draws itself in with a subtle stroke-animation (the icon's outline appears to be "drawn," ~600ms) as it scrolls into view, sequenced left-to-right with a short stagger — reinforces the sequential, step-by-step nature of the content itself through motion.

**Interaction:** none required — purely explanatory, intentionally free of any competing interactive elements so its clarity isn't undermined.

### 3.7 Upcoming Live Performances *(Phase 2+ — designed now, shipped later)*

**Purpose:** an engagement hook independent of immediate booking intent — lets visitors discover the platform's energy even if they have no event to plan yet. *(Flagged per IA: this section is Phase 2+ scope; it is fully specified here so the visual language is ready in advance, but it will not appear on the MVP landing page.)*

**Layout:** horizontal-scroll event cards (date badge, performer name/photo, venue/city, small "🔥 42 interested" social-proof counter).

**Animations/Interaction:** same horizontal-scroll pattern as Nearby/Featured Artists, for consistency; date badges use the accent gold for the day number specifically (a small, warm "circle this on your calendar" visual cue).

### 3.8 Testimonials

**Purpose:** social proof from the demand side, specifically addressing the payment/trust anxiety named in the PRD's customer persona (Priya Nair, §6.4) — real people, real relief.

**Layout:** a **large, single-testimonial-at-a-time carousel** (not a dense grid of many small quotes) — one testimonial gets full visual weight (large portrait photo left, generously-sized quote text right, `h4`-styled), auto-advancing every 6 seconds, with small dot indicators below.

*Why one-at-a-time instead of a grid:* a grid of many small testimonials reads as "we needed to prove volume," while one large, beautifully presented testimonial at a time reads as "each of these stories matters" — more consistent with the "human" and "elegant" brand pillars.

**Animations:** cross-fade between testimonials (`motion-slow`, 480ms) — never a hard cut or a sliding/swiping motion, which would feel more like a slideshow than an editorial moment.

**Interaction:** auto-advance **pauses immediately on hover or focus** (a baseline accessibility and usability requirement — auto-advancing content must never race ahead of a user actively trying to read it); manual dot navigation and swipe (mobile) always available.

### 3.9 For Performers CTA

**Purpose:** the landing page's one explicit acknowledgment of its supply-side audience — must be visually distinct enough to catch a performer's attention without competing with the customer-facing narrative that dominates the rest of the page.

**Layout:** a **full-width banner section** with a shift in background treatment — the Stage Gradient (per Design System) applied here specifically, the only place on the page besides the Hero where this gradient appears, marking it as a clearly different "mode" of the page.

**Components:** short, direct headline (**"Your talent deserves to be discovered."**), one sentence of supporting copy, a single clear button (**"Join as a Performer"**, `primary` variant using `accent-500` fill here — the one deliberate exception where gold is used as a button fill rather than a rating/badge accent, justified because this section's entire purpose *is* the single "high-intent moment" the Design System reserves gold for).

**Animation:** the gradient background shifts almost imperceptibly (a slow-moving gradient position animation, 15+ second loop) — alive, not static, without being distracting.

### 3.10 FAQs

**Purpose:** pre-empt the specific objections that would otherwise become support tickets or silent drop-off (pricing/commission, safety, cancellation, how payment works) per IA §4.

**Layout:** `container-narrow` (720px) centered accordion list — narrow width here specifically because this is a reading-heavy section (per Design System's container-width rationale).

**Components:** standard accordion pattern — question in `h5`, chevron icon that rotates 180° on expand; only one item open at a time by default (reduces visual clutter of multiple long answers stacked simultaneously), though this is a soft default, not an enforced restriction.

**Animation:** expand/collapse uses a height-auto transition (`motion-base`) with content fading in slightly after the height animation begins (not simultaneously) — prevents the janky "text appearing before there's room for it" effect common in naive accordion implementations.

### 3.11 Final CTA Band

**Purpose:** the last conversion opportunity, restating the core value proposition once more before the visitor leaves the emotional "show" and enters the purely informational Footer.

**Layout:** centered, generous vertical padding (`space-24`), a shortened echo of the Hero's headline treatment (smaller scale — `display-l` not `display-xl`) over a **static, single frame** from the Hero's video (not the looping video again — signals "we've returned full circle" without literally replaying the same animated content).

**Components:** headline (**"Ready to find your perfect performer?"**), the same search bar component as the Hero (fully functional, not just a decorative CTA button) — giving a second, low-friction chance to act immediately rather than requiring a scroll back to the top.

### 3.12 Footer

**Purpose:** navigational completeness, legal/trust signaling, and SEO — deliberately the calmest, least animated section on the page (per §1 narrative: "quiet trust" as the final beat).

**Layout:** `neutral-50`/darkest surface, multi-column layout (Discover, Company, Legal, Cities, Categories, Connect/Social) collapsing to an accordion-style stacked layout on mobile.

**Components:** BandVerse logo + one-line tagline, column link groups, a small **"Payments secured by Razorpay"** trust badge, social icons, copyright line.

**Animation/Interaction:** none beyond standard link hover states — the Footer's entire design intent is to feel stable and unremarkable, the calm resolution after the more expressive sections above it.

---

## 4. Scroll Storytelling

Scrolling through the BandVerse landing page should feel like **the house lights coming up gradually through a concert**, not like flipping through a series of unrelated slides. Four principles govern this:

1. **Progressive brightness.** The page background subtly lightens in perceived value as you scroll — the Hero is the darkest, most cinematic moment; the Trust Strip introduces the first lighter surface tone; by the Footer, the page has settled into its calmest, most neutral state. This isn't a literal color-lightening gimmick applied uniformly — it's expressed through the *content* getting progressively more informational and less atmospheric (video → curated cards → data/testimonials → plain text/links), which is a more sophisticated and less heavy-handed way to achieve the same emotional pacing.
2. **One idea reveals at a time.** Every section's content animates in **only once**, triggered the first time it enters the viewport (never re-triggering on scroll-up-then-down-again) — this respects the visitor's attention and avoids the fatiguing, gimmicky feeling of a page that "performs" at you every time you nudge the scrollbar.
3. **Rhythm through spacing, not just motion.** The generous, consistent vertical spacing between sections (§3, `space-20`–`space-24`) creates a deliberate pacing — like the pause between songs in a live set — giving each section room to land before the next one begins, rather than a dense, uninterrupted wall of content.
4. **Momentum preserved, never hijacked.** The page **never intercepts or overrides native scroll physics** (no scroll-jacking, no forced full-page-snap sections) — a well-known anti-pattern that feels disorienting and frustrating regardless of how polished the visuals are. Section transitions rely entirely on content design (spacing, tonal shifts, motion-on-enter) to create narrative pacing, never on hijacking the user's actual scroll input.

The single connecting motif across the whole scroll: **the Spotlight Glow gradient reappears in exactly two other places** beyond the Hero — subtly behind the Traditional Performers Spotlight banner, and behind the For Performers CTA — acting as a quiet visual "chapter marker" that says *this moment matters* each time it resurfaces, without being overused into meaninglessness (three appearances total across the entire page, including the Hero).

---

## 5. Hover Behaviour

All hover behaviors are **desktop/pointer-only** enhancements — every hover-revealed piece of information or affordance also has a touch/tap equivalent, since hover has no direct mobile analog (per Design System's "touch first, pointer-enhanced" principle).

### Cards (General)

- Elevation lifts from Level 1 → Level 2 (per Design System) with a synchronized 2–4px upward translate, `motion-base` (240ms).
- Media area scales very subtly (102%) **within its clipped container** — the card frame itself does not grow, only the image inside breathes slightly, avoiding layout shift among neighboring cards.
- Cursor becomes a pointer; on cards specifically, cursor also gains a very subtle custom **"View" label following the cursor** at a slight offset (a refined touch used sparingly — see Premium Details §8) only for card grids where the click destination might not be obvious (e.g., the Traditional Performers banner), not on every card everywhere.

### Buttons

- Fill buttons (`primary`, `accent`): background brightens by one token step (e.g., `primary-600` → `primary-500`) over `motion-instant` (100ms) — fast enough to feel responsive to the exact moment of intent, not sluggish.
- Outline/ghost buttons: background fades in from transparent to `neutral-100`/`neutral-200` at ~8% opacity — communicates interactivity without the heavier visual weight of a full fill.
- On press (`:active`), all buttons scale to 98% instantly, released back to 100% on release — a tactile "give" that makes clicking feel physically responsive.

### Artist Cards / Band Cards

In addition to the general card hover treatment above:

- The **save/bookmark icon** (top-right of card media) transitions from a low-opacity outline icon (present but unobtrusive at rest) to full-opacity on card hover — it's technically always there (for touch-device visibility, where hover doesn't exist), but "arrives" visually on desktop hover to avoid cluttering the resting state with every icon at full strength simultaneously.
- If the card's media includes video, hovering triggers the **muted preview loop to begin playing** after a very short intentional delay (~300ms) — this delay prevents every card in a fast mouse-sweep across a grid from firing a video load simultaneously, which would be both a performance problem and a visually chaotic experience.
- Star rating, price, and distance metadata do not change on hover — only the media and elevation respond, keeping the hover state calm rather than making every piece of text jump around.

### Navigation

- Top nav links: an underline animates in from the left edge of the text (`motion-fast`, 180ms) on hover, rather than appearing instantly — consistent with the Design System's link-hover specification.
- The active/current page nav item (where applicable, e.g., within Dashboard) does **not** respond to its own hover state the same way inactive items do — it's already visually marked as active (left-border accent per Design System), and adding a redundant hover treatment on top would be visual noise.
- The search bar itself, when the nav is in its scrolled/glass state, gets a hover-triggered subtle glow-ring identical to its focus state — signaling "click here" before the visitor even focuses it.

---

## 6. Motion System (Landing-Page-Specific Application)

This section maps the Design System's general motion tokens (`docs/DesignSystem.md` → Motion) to their specific landing-page usages.

| System | Application on Landing Page |
|---|---|
| **Page Transitions** | Navigating *away* from the landing page (e.g., clicking into a profile) uses the standard cross-fade + 8px vertical shift (`motion-moderate`). Navigating *within* the landing page (e.g., footer anchor links) uses native smooth-scroll, not a hard jump. |
| **Hover Transitions** | As detailed in §5 — instant (100ms) for buttons/direct feedback, base (240ms) for card lift/elevation changes. |
| **Loading** | See §8 for the full loading sequence; in short — a minimal top-of-page progress bar (`accent-500`, 2px height) during initial load, skeleton placeholders for below-the-fold sections that haven't loaded their data yet (e.g., Nearby Artists before geolocation/API resolves). |
| **Search Animation** | Focusing the Hero search bar triggers the glow-ring (`motion-fast`) and a gentle expansion of the input width by a few pixels (98%→100% scale) to signal "you're now in an active input." Submitting triggers the search button icon to morph briefly into a small spinner (button width preserved, per Design System) while results load, then the page transitions to `/search`. |
| **Card Animation** | Entrance: staggered fade+slide-up per section (§3). Hover: lift + subtle media scale (§5). |
| **Micro-interactions** | Save/heart icon: small spring "pop" on activation (the Design System's one sanctioned playful exception). FAQ chevrons: 180° rotation, `motion-fast`. Stat counters: count-up, `motion-slow`-adjacent custom duration (~1200ms) with an ease-out curve so the count *decelerates* into its final number rather than stopping abruptly. |

---

## 7. Mobile Experience

Every section is **authored for mobile**, not shrunk from desktop, per Design System responsive principles. Section-by-section transformation:

| Section | Mobile Transformation |
|---|---|
| **Hero** | Height reduces to ~92vh (never full 100vh, to visually hint scrollable content exists below). Video background may be swapped for a shorter, lighter-weight loop or the static-photo fallback by default on cellular connections to conserve data. Search bar becomes a **single tappable field** ("Where and what are you looking for?") that opens the full-screen search takeover on tap, rather than three separate inline fields competing for limited width. |
| **Trust Strip** | Stat row becomes a **horizontally swipeable strip** instead of a fixed 4-across row, since 4 stat blocks can't comfortably fit at readable size on a narrow viewport. |
| **Nearby / Featured Artists, Popular Bands** | Horizontal scroll pattern is preserved as-is (it's already a mobile-native gesture — no transformation needed, one of the reasons this pattern was chosen for desktop too). Card width sized so exactly 1.2 cards are visible at once (the partial second card reinforces "swipeable" affordance without needing an explicit arrow indicator, which doesn't suit touch). |
| **Traditional Performers Spotlight** | The desktop's asymmetric side-by-side layout (banner + grid) stacks vertically: full-width banner first, then the group cards below in a 2-column grid (not the horizontal-scroll pattern used elsewhere, preserving this section's intentionally distinct visual treatment even on mobile). |
| **How It Works** | 3-column layout stacks to a vertical sequence, with a thin connecting vertical line between steps (echoing the Timeline component from the Design System) to visually reinforce the step-by-step relationship that horizontal layout communicated on desktop. |
| **Testimonials** | Single-testimonial carousel becomes fully swipe-driven (native touch gesture replaces the desktop's hover-adjacent dot navigation as the primary interaction, though dots remain visible for orientation). |
| **For Performers CTA** | Retains full visual treatment (gradient background, single CTA) — this section's simplicity makes it naturally mobile-friendly with no structural change needed. |
| **FAQs** | Unchanged structurally (accordions are inherently mobile-friendly); container padding adjusts to `space-5` mobile margins. |
| **Final CTA** | Search bar collapses to the same single-tappable-field pattern as the Hero, for interaction consistency. |
| **Footer** | Multi-column link layout becomes a **stacked accordion** (each column header is tappable to expand/collapse its links) — prevents an overwhelming wall of 30+ links all visible at once on a narrow screen. |

**Global mobile behaviors:** the top navigation collapses to a minimal bar (logo + hamburger + search icon); all touch targets meet the 44×44px minimum without exception; and the sticky "back to top" affordance (see Premium Details) appears earlier in the scroll on mobile, since mobile scroll distances feel longer per section.

---

## 8. Premium Details

Fifty-plus small, deliberate details — individually almost invisible, collectively the entire reason the product feels premium rather than generic.

1. **Custom cursor on interactive elements** — pointer cursor is universal, but card grids in particular reveal a subtle "View" text-label cursor companion (§5), never used to excess.
2. **Focus rings are never removed**, only restyled — a 2px `primary-300` ring with 2px offset, visible on keyboard focus, suppressed on mouse-click focus (`:focus-visible` behavior) so it never appears as visual noise during normal mouse use.
3. **Button press feedback** — 98% scale on `:active`, released on mouse-up, giving every click a tactile "give."
4. **Images load with a blur-up placeholder** (a tiny, blurred low-res version fades into the sharp final image) rather than a blank gray box or an abrupt pop-in.
5. **No layout shift on image load** — every media container reserves its exact final aspect ratio before the image arrives.
6. **Search suggestions appear with a subtle stagger** (each suggestion row fades in ~30ms after the previous), not all at once.
7. **Map pin drop animation** — pins ease in with a small bounce-settle when a map view first renders, rather than appearing instantly and abruptly.
8. **Map cluster expansion** animates smoothly (clusters visibly "burst" into individual pins) rather than an instant zoom-cut.
9. **Video previews fade in their poster frame first**, then crossfade to the playing loop once buffered — never a flash of black.
10. **Custom scrollbar styling** (thin, `neutral-400`, rounded) on desktop — default OS scrollbars visually clash with a considered dark theme.
11. **Text selection color** is customized to a soft `primary-100` tint rather than the default OS blue highlight.
12. **Favicon and browser theme-color** match the current theme (dark/light) so even the browser chrome feels considered.
13. **Page `<title>` updates contextually** as the visitor scrolls into distinct major sections (subtle, not gimmicky — mainly relevant for the search/results pages beyond the landing page itself).
14. **Smooth-scroll for all anchor links** (e.g., Footer "Back to top") rather than an instant jump.
15. **A "back to top" affordance** appears (fades in) only after scrolling past ~2 full viewport heights, positioned unobtrusively bottom-right.
16. **Lazy-loading below-the-fold media** with generous pre-load margins, so images are always ready just before they'd be needed, never popping in visibly mid-scroll.
17. **Skeleton loaders match final layout exactly** (per Design System) — including correct card aspect ratios and text-line widths.
18. **Optimistic UI on save/bookmark** — the heart icon fills instantly on tap, before the network request even resolves, with silent rollback + a toast only if it actually fails.
19. **Toasts slide/fade in from a consistent, predictable position**, never randomly positioned per toast type.
20. **Number counters** (Trust Strip) ease into their final value rather than incrementing linearly — deceleration reads as more "considered."
21. **Star ratings fill with a small left-to-right animated sweep** the first time they scroll into view, rather than appearing fully rendered instantly.
22. **Carousel/testimonial autoplay pauses immediately on hover, focus, or touch** — never fighting the user's attention.
23. **A subtle, almost imperceptible film-grain/noise texture overlay** across dark surfaces — a well-known trick (used extensively in premium dark-themed apps) that prevents large flat dark areas from looking like a plain digital fill and adds a tactile, cinematic depth.
24. **Consistent corner radius language** — every rounded element (cards, buttons, inputs, modals) uses the same 16px/8px radius scale, never mismatched radii across components on the same screen.
25. **Deliberate use of negative space around the logo** in the nav — never crammed against the viewport edge or other nav items.
26. **Category icons are custom-drawn**, not generic stock icons — instantly recognizable and correct for instruments like dhol/tasha (per Design System Iconography).
27. **Hover states never trigger layout reflow** — only opacity, transform, and color transitions, never changes to width/height/margin that would cause neighboring elements to jump.
28. **Autofill-detected form fields are re-styled** to match the design system's input treatment rather than showing the browser's jarring default yellow autofill background.
29. **Keyboard shortcut hint** (a small "⌘K" badge) appears within the search bar on desktop, signaling power-user affordance for quickly jumping to search from anywhere.
30. **Reduced-motion respects are truly complete** — not just disabling the obvious animations, but also the Ken Burns effect, gradient drift, and parallax, replaced with clean static equivalents.
31. **Currency and number formatting respects locale conventions** (₹ with correct thousands separators) rather than a naive string concatenation.
32. **Relative timestamps** ("2 weeks ago") used everywhere a raw date would feel colder or less human, per Design System Review Cards.
33. **Empty and loading states never show a flash of "empty" before data has had a real chance to load** — a minimum skeleton display duration prevents a jarring flicker on very fast connections.
34. **The Hero video loop has no visible seam** — the last and first frame are matched/cross-dissolved so the loop point is imperceptible.
35. **Sticky nav's glass-blur transition itself is animated** (opacity/blur intensity ease in over `motion-base`) rather than snapping on at a scroll threshold.
36. **Drag-free, momentum-based horizontal card scrolling** on trackpad/touch (natural deceleration), not a rigid, page-by-page forced-snap scroll.
37. **Save icon's "pop" micro-animation** uses a genuine spring curve (slight overshoot then settle), not a linear scale — reads as far more "alive."
38. **Consistent icon stroke weight (1.5px)** across every icon on the page, including any third-party-sourced icons re-drawn to match.
39. **All interactive elements have a minimum 44×44px hit area** even when their visible size is smaller (e.g., a small heart icon still has a generously padded invisible tap zone).
40. **Tooltip delay timing is tuned** (short ~400ms delay before appearing, near-instant on subsequent tooltips within the same session) — mirrors how modern OS-level tooltip systems behave, feels considered rather than either laggy or overeager.
41. **The FAQ accordion's height-change animation and content fade-in are slightly offset** (fade begins a beat after the height starts expanding) to avoid the common "squished text" artifact of naive accordions.
42. **Section entrance animations trigger only once per session**, never replaying if a user scrolls back up and down again.
43. **The scroll-triggered "Spotlight Glow" reappearances (§4) are perfectly consistent in exact visual treatment** each time, reinforcing them as an intentional motif rather than coincidental gradient reuse.
44. **404 and empty-search states include a working, prominent search bar**, not just an apology — always offering a next action.
45. **Dark/light theme toggle (if user-triggered) animates as a smooth cross-fade of the entire palette**, not an abrupt flash-cut between themes.
46. **All animations use hardware-accelerated properties only** (transform, opacity) — never animating box-shadow, width, or top/left directly, which is both a performance detail and directly responsible for animations feeling silky rather than janky.
47. **Consistent, calm loading-bar behavior** at the very top of the page during initial load and route transitions (a thin `accent-500` bar that fills left-to-right) — a small but universally recognized "something considered is happening" signal.
48. **Placeholder/empty avatar states** (e.g., a reviewer with no photo) use a tasteful initials-based avatar with a color derived deterministically from the name, never a generic gray silhouette icon.
49. **The mobile full-screen search takeover animates in as a genuine overlay transition** (slide/fade up from the search field's exact origin position), not a jarring full-page navigation.
50. **Every single button's loading state preserves the button's exact width** (label replaced by a centered spinner) so surrounding layout never shifts when an action is submitted.
51. **Videos pause automatically when scrolled out of the viewport** (Hero and gallery previews alike) — both a performance/battery consideration and a subtle sign of a well-engineered, considerate product.
52. **The "For Performers" CTA gradient drift is slow enough to be felt, not seen** — if a user can consciously perceive it moving in real time, it's tuned too fast.

---

## 9. Inspiration

Specific, named influences — each described precisely enough to make clear what's being learned from, and explicitly not copied.

**Apple** — the **restraint and pacing**: one idea per screen/section, generous whitespace, product imagery (here, performer photography/video) always the hero rather than decorative UI chrome, and the specific interaction discipline of never hijacking scroll physics no matter how cinematic the intent. BandVerse borrows Apple's *confidence in silence* — the willingness to leave a section visually simple because the content itself is strong enough — without borrowing Apple's literal visual style (no glassmorphism-everywhere, no product-photography-on-white aesthetic, since BandVerse's world is a dark stage, not a bright studio).

**Spotify** — the **dark-first, media-forward canvas** and the specific way Spotify treats imagery (album art) as equal in visual priority to typography, never subordinate to it. BandVerse's Artist/Band Cards borrow this exact philosophy — the media *is* the content, text is a caption to it — applied to performer photography/video instead of album covers. Explicitly not borrowed: Spotify's dense, list-heavy, high-information-density library screens — BandVerse's public-facing discovery stays sparser and more editorial, since it's a first-time-visitor experience, not a returning power-user's daily tool.

**Airbnb** — the **trust-building card and search pattern**: prominent search as the primary hero action, transparent pricing shown directly on browsing cards (never hidden behind a click-through), and a warm, human photography style over corporate stock imagery. Explicitly not borrowed: Airbnb's specific card layout proportions or its now-ubiquitous rounded-search-pill silhouette copied verbatim — BandVerse's search bar and cards are styled per its own distinct color/type system (Stage Violet, Cabinet Grotesk) so it doesn't read as "an Airbnb clone with different colors."

**Stripe** — the **precision of motion and technical confidence conveyed through subtlety**: Stripe's landing pages are known for extremely refined micro-interactions (gradient meshes that drift almost imperceptibly, numbers that count with perfect easing) that communicate engineering quality before a single word is read. BandVerse's gradient-drift treatment (For Performers CTA) and stat count-up animation (Trust Strip) borrow this exact *register* of motion — slow, precise, confidence-through-subtlety. Explicitly not borrowed: Stripe's B2B-developer visual language (code snippets, terminal aesthetics, dense technical diagrams) — entirely inappropriate for a consumer, emotionally-driven product like BandVerse.

**Linear** — the **disciplined, systematic design-token rigor** and specifically the dark-theme elevation technique (surface lightening + hairline top-lit borders instead of relying on invisible box-shadows on dark backgrounds) already codified in `docs/DesignSystem.md`. Linear's obsessive internal consistency (every spacing value, every radius, every motion curve clearly systematized) is the standard BandVerse holds itself to structurally. Explicitly not borrowed: Linear's utilitarian, keyboard-shortcut-driven, information-dense product surface — appropriate for a project-management power tool, not for a warm, browsing-oriented consumer marketplace landing page.

---

## 10. The Emotional Departure

After scrolling through the entire landing page — even before signing up, even before searching for anything specific — a visitor should close the tab (or keep scrolling into Search) feeling:

> **"I didn't know a platform like this existed — and now that I've seen it, I trust it enough to actually use it for something that matters to me."**

More specifically, they should feel:

- **Surprised**, in a good way — that traditional and cultural performance categories are treated with this much visual respect and production quality, when they've never seen that anywhere else.
- **Reassured**, not sold to — the page never felt like it was pushing, yet by the end every practical doubt (pricing, safety, quality, how it works) has quietly been answered.
- **A little bit excited** — the way you feel flipping through a lineup for a festival you're actually going to attend, not the way you feel filling out a vendor-comparison spreadsheet.
- **Confident**, specifically, that if they have an event — a wedding, a celebration, a party — coming up, they now know exactly where they'd go to find the right performer, without a single moment of the page having *told* them that directly. It should feel discovered, not declared.

If a first-time visitor leaves the page and later describes it to a friend not as "I found a booking website" but as **"you have to see this site, the performers on it are incredible"** — the landing page has done its job completely.

---

*Next recommended milestone: with the full experience now specified, the next step is a mid-fidelity visual mockup (static, single-viewport-per-breakpoint) of the Hero and Traditional Performers Spotlight sections specifically — the two highest-stakes, most differentiated sections — to validate the visual direction before investing in mockups for the full page or any engineering.*
