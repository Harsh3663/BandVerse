# BandVerse — Information Architecture (IA)

**Discover. Perform. Connect.**

| | |
|---|---|
| **Document Owner** | Principal UX Architecture Office |
| **Status** | Draft v1.0 |
| **Source of Truth** | `docs/PRD.md` — this document does not introduce new features beyond PRD scope; MVP-only elements are explicitly marked **(MVP)**, and everything else is marked **(Phase 2+)** per the PRD roadmap |
| **Last Updated** | August 2026 |

> **Note on scope discipline:** Every screen listed below traces back to a functional requirement, user story, or roadmap phase in the PRD. Where I've added a screen not explicitly named in the PRD (e.g., a "Report a Profile" screen), it's because it is a structural necessity of a feature the PRD *does* require (e.g., trust & safety) — never a net-new feature idea. These are flagged inline as *(structural necessity)*.

---

## 0. How to Read This Document

This IA is organized as a system, not a list of screens. Before the sitemap, three architectural decisions govern everything that follows — worth stating explicitly because they resolve several ambiguities in the PRD:

1. **Role-based experience, not role-based apps.** A single logged-in user can hold multiple hats over time (a customer today, a solo artist tomorrow). BandVerse is one product with a **Profile Switcher**, not separate apps per role. This avoids the "which app do I download" fragmentation that kills two-sided marketplaces (a mistake even some large gig platforms have made).
2. **Public-first, not gated.** Discovery (browsing artists, bands, traditional groups, viewing profiles, media, and reviews) is **fully accessible without login**. Authentication is only required to *act* (chat, book, pay, publish, apply). This is a deliberate challenge to the instinct to gate everything behind sign-up — forcing login before value is delivered is the #1 killer of marketplace top-of-funnel conversion. Section 11 elaborates on why.
3. **One Dashboard shell, contextual modules.** Rather than fully separate dashboards for Artist/Band/Customer/Admin, there is one **Dashboard shell** (consistent header, sidebar pattern, layout grid) whose *content modules* change based on active role. This keeps the design system consistent and dramatically reduces engineering and design surface area — directly serving the PRD's "modular, maintainable" non-functional requirement.

---

## 1. Complete Sitemap

```
BandVerse Root
│
├── 1.0 PUBLIC / MARKETING
│   ├── Landing Page (/)
│   ├── How It Works (/how-it-works)
│   ├── For Artists & Bands (/for-performers)              [marketing/supply-acquisition page]
│   ├── For Customers & Organizers (/for-customers)         [marketing/demand-acquisition page]
│   ├── Pricing & Commission (/pricing)                     [transparency page — builds trust pre-signup]
│   ├── About BandVerse (/about)
│   ├── Traditional Arts Spotlight (/traditions)            [PRD §3, §5 — cultural positioning page]
│   ├── Trust & Safety (/trust-safety)                      (structural necessity — verification/escrow explainer)
│   ├── FAQs (/faq)
│   ├── Contact / Support (/contact)
│   ├── Legal
│   │   ├── Terms of Service (/legal/terms)
│   │   ├── Privacy Policy (/legal/privacy)
│   │   └── Refund & Cancellation Policy (/legal/refunds)
│   └── Blog / Stories (Phase 2+) (/stories)                [artist spotlight content, SEO/discovery engine]
│
├── 2.0 AUTHENTICATION
│   ├── Sign Up (/auth/signup)
│   │   ├── Choose Account Type (Customer / Performer / Organizer)
│   │   └── Google OAuth / Email
│   ├── Log In (/auth/login)
│   ├── Forgot Password (/auth/reset)
│   ├── Verify Email (/auth/verify)
│   └── Onboarding Wizard (role-specific, post-signup)
│       ├── Customer Onboarding (minimal — name, city, preferences)
│       ├── Solo Artist Onboarding (category, bio, media, pricing, location)
│       ├── Band Onboarding (band name, members, category, practice location)
│       ├── Traditional Group Onboarding (group name, category, size, media)
│       └── Restaurant/Venue Onboarding (Phase 2+)
│
├── 3.0 DISCOVERY (Public, no login required)
│   ├── Search / Browse (/search)
│   │   ├── Search Results (List View)
│   │   ├── Search Results (Map View)
│   │   └── Filters Panel (category, city, distance, price, rating, availability)
│   ├── Category Landing Pages
│   │   ├── Solo Artists (/categories/solo-artists)
│   │   ├── Bands (/categories/bands)
│   │   ├── Dhol Tasha Groups (/categories/dhol-tasha)
│   │   ├── Banjo Groups (/categories/banjo)
│   │   ├── Folk Artists (/categories/folk)
│   │   └── Wedding Bands (/categories/wedding-bands)
│   ├── City Landing Pages (/cities/[city])                 (structural necessity — SEO + geo-discovery entry points)
│   ├── Compare (/compare?ids=...)
│   ├── Upcoming Live Performances (/events)  (Phase 2+)
│   │   └── Event Detail (/events/[id])
│   └── Public Profile Pages
│       ├── Solo Artist Profile (/artist/[handle])
│       ├── Band Profile (/band/[handle])
│       └── Traditional Group Profile (/group/[handle])
│
├── 4.0 DASHBOARD (Authenticated Shell — see §5 for full breakdown)
│   ├── Overview / Home
│   ├── Profile Switcher (if user has multiple roles)
│   ├── [Role-specific modules — Artist / Band / Customer / Admin]
│   ├── Messages (Inbox)
│   ├── Notifications
│   └── Account Settings
│       ├── Personal Info
│       ├── Security & Password
│       ├── Linked Accounts (Google)
│       ├── Payout / Payment Methods
│       ├── Notification Preferences
│       └── Delete Account
│
├── 5.0 BOOKING
│   ├── Booking Request (initiate — modal/drawer from profile)
│   ├── Booking Detail (/bookings/[id])
│   │   ├── Chat Thread (embedded)
│   │   ├── Event Details
│   │   ├── Price & Payment Breakdown
│   │   └── Status Timeline (Requested → Confirmed → Paid → Completed / Cancelled / Disputed)
│   └── Booking List (in Dashboard — see §5)
│
├── 6.0 PAYMENTS
│   ├── Checkout / Payment (/bookings/[id]/pay)
│   ├── Payment Confirmation
│   ├── Payment History (Dashboard)
│   ├── Payout Dashboard (Performer — earnings, pending, history)
│   └── Refund / Dispute Request Flow
│
├── 7.0 REVIEWS
│   ├── Leave a Review (post-booking, triggered flow)
│   ├── Reviews Tab (on public profile)
│   └── Manage Reviews (Dashboard — respond to reviews)
│
├── 8.0 BAND-SPECIFIC (Phase 2+ for build/apply flows; team mgmt is MVP)
│   ├── Team & Member Management (Dashboard)
│   ├── Join Requests Inbox (Dashboard)
│   ├── Apply to Join a Band (/bands/[handle]/apply)      (Phase 2+)
│   └── Build Your Own Band (/build-a-band)                (Phase 2+)
│
├── 9.0 ADMIN (Internal — /admin/*)
│   ├── Admin Overview / Analytics
│   ├── Verification Queue
│   ├── User & Profile Management
│   ├── Content Moderation (media, reviews, reports)
│   ├── Disputes & Resolution Center
│   ├── Payments Oversight
│   ├── Platform Configuration (categories, cities, commission rates)
│   └── Admin Team & Roles (structural necessity — internal permissioning)
│
└── 10.0 SYSTEM / UTILITY STATES
    ├── 404 Not Found
    ├── 500 / Something Went Wrong
    ├── Offline / No Connection
    ├── Maintenance Mode
    └── Access Denied / Unauthorized
```

---

## 2. Navigation

### 2.1 Desktop Navigation (Top Nav Bar — persistent, all public pages)

```
[ Logo: BandVerse ]   [ Search bar (persistent, expands on focus) ]   Discover ▾   How It Works   For Performers   [ Sign Up ]  [ Log In ]
```

- **Logged out:** Logo · Search · Discover (dropdown: by category) · How It Works · For Performers · Log In · Sign Up (primary button).
- **Logged in:** Logo · Search · Discover · Messages (icon w/ badge) · Notifications (icon w/ badge) · **Profile Menu** (avatar).
- The search bar is **persistent and always visible**, not hidden behind an icon — search is the single most important action on a discovery-first product, and hiding it behind a click is a measurable conversion tax (this mirrors Airbnb/Spotify's persistent-search pattern, not a stylistic choice).

### 2.2 Sidebar (Dashboard only, desktop/tablet ≥1024px)

Collapsible left sidebar, role-aware:

```
[ Avatar + Name + Role badge ]
[ Profile Switcher, if multi-role ]
─────────────
Overview
[Role-specific modules — see §5]
─────────────
Messages
Notifications
─────────────
Settings
Help / Support
Log out
```

### 2.3 Mobile Navigation

- **Public pages:** Collapsed hamburger menu + persistent search icon in a sticky top bar. Search expands to a full-screen search experience on tap (not a cramped inline dropdown).
- **Dashboard (logged in):** Sidebar is replaced entirely by **Bottom Tab Navigation** (see 2.4) — sidebars do not translate well to mobile ergonomics (thumb-reach), so this is a structural adaptation, not a cosmetic one.

### 2.4 Bottom Navigation (Mobile, logged-in only)

Maximum 5 items, role-aware:

| Customer | Artist/Band | Admin |
|---|---|---|
| Discover | Overview | Overview |
| Search | Bookings | Queue |
| Bookings | Messages | Disputes |
| Messages | Calendar | Reports |
| Profile | Profile | Profile |

- **Why 5 max:** Beyond 5 items, label legibility and tap-target size degrade on small screens (iOS/Material HIG both converge on this). "Profile" always occupies the rightmost slot for muscle-memory consistency across roles.

### 2.5 Breadcrumbs

Used only in **deep, hierarchical contexts** where users need to understand "where am I" — not on every page (breadcrumbs on shallow pages are visual noise):

- Discovery: `Discover > Bands > Wedding Bands > The Groove Collective`
- Admin: `Admin > Disputes > Dispute #4521`
- Dashboard settings: `Settings > Payout Methods`

Not used on: Landing page, Dashboard Overview, Booking flow (which uses a **stepper**, not breadcrumbs — see §7), Chat.

### 2.6 Profile Menu (Avatar dropdown, top-right)

```
[Avatar] Name
Role: Solo Artist ▾  (profile switcher if multi-role)
─────────────
Dashboard
My Bookings
Messages
Settings
Help & Support
─────────────
Log out
```

### 2.7 Quick Actions

Context-sensitive floating/primary actions rather than a generic FAB (generic FABs are low-information; a labeled, contextual primary action converts better and is more accessible):

| Context | Quick Action |
|---|---|
| Customer — Discover page | "Filter" (mobile, opens filter sheet) |
| Customer — Profile page | "Book Now" (sticky on scroll) |
| Artist — Dashboard Overview | "Add Media" / "Update Availability" |
| Band — Dashboard Overview | "Invite Member" / "Review Join Requests" |
| Admin — Verification Queue | "Approve" / "Reject" (inline, per row) |

---

## 3. User Flows

Each flow is written as a linear happy path with key branch points called out, since real flows are rarely linear.

### 3.1 Customer Flow — Discover to Review (Primary Marketplace Loop)

```
Landing Page
   ↓
Search / Browse (filters: city, category, price, distance)
   ↓
Search Results (List or Map view)
   ↓
Public Profile Page (photos, videos, pricing, reviews, availability)
   ↓ (optional)
Compare (2–3 shortlisted profiles side-by-side)
   ↓
[ Login/Signup gate — only triggered here, not earlier ]
   ↓
Chat (ask questions, negotiate)
   ↓
Booking Request (event date, type, location, budget)
   ↓
Performer Confirms / Counter-offers (via chat)
   ↓
Payment (full or advance, via Razorpay)
   ↓
Booking Confirmed (calendar entry, reminders scheduled)
   ↓
Event Happens (offline)
   ↓
Review Prompt (triggered post-event date)
   ↓
Review Submitted → visible on performer's public profile
```

**Key branch points:**
- If performer declines/doesn't respond within X hours → customer is nudged back to Search Results with similar alternatives (never a dead end).
- If payment fails → retry flow, booking held in "pending payment" for a grace window before auto-release.
- If a dispute arises post-booking → routed to Dispute flow (§3.4b) rather than dead-ending in chat.

### 3.2 Artist (Solo Performer) Flow — Onboarding to First Booking

```
Sign Up (choose "Performer" → "Solo Artist")
   ↓
Onboarding Wizard
   ├── Basic Info (name, category/instrument, city)
   ├── Media Upload (min. 3 photos + 1 video recommended, not blocking)
   ├── Bio & Performance Timeline
   ├── Pricing & Packages
   ├── Availability Calendar (initial setup)
   └── Social Links (optional)
   ↓
Profile Completeness Score shown (gamified nudge, not a hard gate)
   ↓
Dashboard Overview ("Your profile is X% complete — add a video to increase bookings by Y%")
   ↓
Profile goes live (Phase 1: manual admin verification badge follows async, doesn't block visibility)
   ↓
Receives inbound message/booking request (Messages/Leads Inbox)
   ↓
Responds via Chat → Confirms availability
   ↓
Customer pays → Booking appears in Calendar
   ↓
Event completed → Payout scheduled
   ↓
Review received → appears on profile, artist can respond
```

**Key branch point — verification timing:** The PRD requires admin verification for trust, but blocking profile visibility until manual verification completes would kill early activation (artists give up waiting). Resolution: profile is **visible immediately with an "Unverified" state**, verification badge is layered on top once approved. This is a deliberate UX trade-off worth flagging to product: it optimizes for supply-side activation speed over zero-risk trust, and should be revisited once verification SLA is fast enough (<24h) to not need this compromise.

### 3.3 Band Owner Flow — Setup to Team Management

```
Sign Up (choose "Performer" → "Band")
   ↓
Onboarding Wizard
   ├── Band Info (name, category, city, bio)
   ├── Add Members (invite via phone/email, or "solo profile" placeholder for later)
   ├── Practice Location (map pin)
   ├── Practice Schedule
   ├── Packages & Pricing
   └── Media Upload
   ↓
Dashboard Overview
   ↓
Team Management Module
   ├── View Members (roles: Leader / Admin / Member)
   ├── Invite New Member
   └── Remove / Edit Member
   ↓
Join Requests Inbox (Phase 2+, once "Apply to Join Band" ships)
   ├── Review Applicant Profile
   └── Approve / Reject
   ↓
[ Same booking loop as Artist flow from this point forward ]
```

### 3.4a Admin Flow — Profile Verification

```
Admin Login → Admin Dashboard
   ↓
Verification Queue (list of pending profiles, oldest first)
   ↓
Open Profile Detail (side-by-side: submitted info + public preview)
   ↓
Checklist Review (identity, media authenticity, category accuracy)
   ↓
Approve → badge applied, performer notified
   or
Reject → reason selected from list, performer notified with actionable feedback (never a silent rejection)
```

### 3.4b Admin Flow — Dispute Resolution

```
Dispute Raised (by customer or performer, from Booking Detail page)
   ↓
Appears in Admin Disputes Queue (priority-sorted by booking date proximity)
   ↓
Admin Opens Dispute Detail
   ├── Full booking timeline
   ├── Chat transcript (read-only, for context)
   ├── Payment status
   └── Evidence attachments (photos, messages)
   ↓
Admin Decision
   ├── Refund customer (full/partial)
   ├── Release payment to performer
   └── Escalate / Request more info from both parties
   ↓
Both parties notified of resolution + rationale
```

### 3.5 "Build Your Own Band" Flow (Phase 2+)

```
/build-a-band
   ↓
Select Event Type & Date (filters relevant instrument roles, e.g., wedding → vocalist+guitarist+drummer+dhol)
   ↓
For each role: browse available solo artists (filtered by availability on selected date)
   ↓
Add to "Custom Lineup" cart
   ↓
Review Lineup Summary (combined price, individual profiles linked)
   ↓
Send Combined Booking Request (fans out to each artist individually)
   ↓
Each artist confirms independently → Lineup status updates incrementally
   ↓
Once all confirmed → single combined payment
   ↓
Booking Confirmed (functions as one "event" with multiple linked performer bookings)
```

*Flagging for product:* this is the most structurally complex flow in the entire product (N independent confirmations converging into one payment). Recommend this stays firmly in Phase 2 and gets its own dedicated design/spec sprint rather than being treated as "just another booking."

---

## 4. Landing Page Sections

Ordered deliberately — each section has a single job, and the order mirrors a trust-building narrative arc (curiosity → credibility → social proof → action), not just a features list.

| # | Section | Purpose | Content |
|---|---|---|---|
| 1 | **Hero** | Communicate the core value prop in <3 seconds; drive immediate search intent | Headline ("Discover. Perform. Connect."), sub-headline, prominent search bar (location + category), background video/photo montage of real performers (not stock imagery — authenticity is the brand) |
| 2 | **Trust Strip** | Immediate credibility signal before asking for any commitment | Small strip: "X verified artists · Y cities · Z completed bookings" (structural necessity — social proof works best placed immediately after the hero, before scroll fatigue) |
| 3 | **Nearby Artists** | Personalized relevance — geo-detected (or city-selected) results | Horizontal scroll cards: photo, name, category, rating, starting price, distance |
| 4 | **Featured Artists** | Curated quality showcase — editorial trust signal, especially important pre-liquidity when "nearby" results may be sparse | Hand-picked/algorithmic mix of high-quality profiles across categories |
| 5 | **Traditional Performers Spotlight** | PRD-critical: this is the differentiating, culturally significant category — deserves its own dedicated section, not buried in generic listings | Dhol Tasha, Banjo, Folk — with short cultural context copy, not just a listing grid |
| 6 | **Popular Bands** | Category depth for the second major supply type | Horizontal scroll cards, same pattern as Featured Artists |
| 7 | **How It Works** | Reduces first-time-user anxiety about an unfamiliar transaction type (hiring a stranger for a live event) | 3-step visual: Discover → Book & Pay Securely → Enjoy the Show |
| 8 | **Upcoming Live Performances** *(Phase 2+)* | Engagement/discovery hook independent of immediate booking intent | Event cards: date, location, performer, "interested" count |
| 9 | **Testimonials** | Social proof from the demand side (reduces payment/trust anxiety) | Real customer quotes + photos, ideally video testimonials over time |
| 10 | **For Performers CTA** | Supply-side acquisition — landing page must serve both sides of the marketplace | Short pitch + "Join as a Performer" CTA, distinct visual treatment from customer-facing sections |
| 11 | **FAQs** | Pre-empt objections that would otherwise become support tickets or drop-off points | Accordion: pricing/commission, safety, cancellation policy, how payments work |
| 12 | **Final CTA Band** | Last conversion opportunity before footer | Restated value prop + search bar or "Get Started" button |
| 13 | **Footer** | Navigation completeness, SEO, legal, trust | Sitemap links, category links, city links, social links, legal links, "Verified Payments via Razorpay" trust badge |

**Deliberate exclusion worth noting:** I did not include a generic "Download the App" section — per PRD MVP scope, there is no native app yet (Phase 3). Adding that CTA prematurely would set a false expectation and is a good example of resisting scope creep even at the landing-page-copy level.

---

## 5. Dashboard Structure

All dashboards share the **shell** described in §0/§2.2. Below is the module list — i.e., every page — per role.

### 5.1 Artist Dashboard (Solo Performer)

| Page | Purpose |
|---|---|
| **Overview** | Snapshot: profile completeness, upcoming bookings, unread messages, recent reviews, earnings summary |
| **Profile Editor** | Edit bio, category, photos, videos, performance timeline, social links |
| **Pricing & Packages** | Define base pricing, package tiers (e.g., 1hr/2hr/full-event) |
| **Availability Calendar** | Block/unblock dates, view confirmed bookings on calendar |
| **Bookings** | List view: Requested / Confirmed / Completed / Cancelled / Disputed, filterable |
| **Messages** | Unified chat inbox with all customers/leads |
| **Reviews** | View all reviews received, respond publicly |
| **Earnings & Payouts** | Transaction history, pending payouts, payout method setup |
| **Analytics** *(Phase 2+)* | Profile views, search appearances, conversion rate, benchmark vs. category |
| **Settings** | Account, security, notifications (shared shell module) |

### 5.2 Band Dashboard

Everything in the Artist Dashboard, **plus**:

| Page | Purpose |
|---|---|
| **Team & Members** | Roster, roles (Leader/Admin/Member), invite/remove members |
| **Practice Locations & Schedule** | Map-pinned rehearsal locations, recurring schedule display |
| **Join Requests** *(Phase 2+)* | Inbound applications from solo musicians wanting to join |
| **Packages (Group-level)** | Distinct from individual artist pricing — full-band packages |

*Design note:* Team & Members is scoped as **MVP** per PRD §8.2 (band profile requires member management), while Join Requests is correctly deferred to Phase 2 alongside the "Apply to Join Band" feature — the two are inseparable and should ship together.

### 5.3 Customer Dashboard

| Page | Purpose |
|---|---|
| **Overview** | Upcoming bookings, saved/favorited performers, recent activity |
| **My Bookings** | List: Upcoming / Past / Cancelled, each linking to Booking Detail |
| **Saved / Favorites** | Shortlisted performers for later comparison |
| **Messages** | Chat inbox with performers |
| **My Reviews** | Reviews the customer has written, editable within a policy window |
| **Payment Methods** | Saved payment methods, transaction history |
| **Settings** | Account, security, notifications |

### 5.4 Admin Dashboard

| Page | Purpose |
|---|---|
| **Overview / Analytics** | Platform health: GMV, active users, bookings, category breakdown (PRD §12 metrics made actionable) |
| **Verification Queue** | Pending profile approvals |
| **User & Profile Management** | Search/edit/suspend any user or profile |
| **Content Moderation** | Flagged media, flagged reviews, reported profiles |
| **Disputes & Resolution Center** | Active/resolved disputes (see flow §3.4b) |
| **Payments Oversight** | Transaction ledger, payout status, refund processing |
| **Platform Configuration** | Manage categories, cities, commission rates, featured placements |
| **Admin Roles** *(structural necessity)* | Manage internal team permissions (e.g., Support vs. Finance vs. Super Admin) |

---

## 6. Search Experience

### 6.1 Global Search (MVP)

- Persistent search bar (see §2.1) accepts free-text + implicit location.
- Autosuggest as-you-type: matches performer names, categories, and cities.
- Submitting routes to `/search` with query params, landing on **List View** by default (Map View is opt-in via toggle — most users scan lists faster than maps on first pass; map is a refinement tool, not the default lens).

### 6.2 Nearby Search (MVP)

- On first visit, prompts for location permission (with a **clear, non-blocking rationale**: "Allow location to see performers near you" — never a bare OS permission prompt with no context, which has poor grant rates).
- If denied or unavailable, gracefully falls back to manual city selection — never a dead end.
- Results ranked by distance by default, combinable with other filters (price, rating).

### 6.3 Map Search (MVP, per PRD Google Maps requirement)

- Toggle from List ⇄ Map on the Search Results page.
- Map shows performer location pins (approximate, not exact address, for safety) and, for bands, **practice location** pins as a distinct marker style.
- Clicking a pin surfaces a compact profile card inline (no full navigation away from map context) — preserves spatial orientation during comparison.

### 6.4 Voice Search *(Phase 2+/Future)*

- Positioned as a mobile-first convenience layer on top of existing search, not a separate feature: microphone icon inside the same search bar.
- Use case: hands-free query while multitasking (e.g., "Dhol Tasha groups near me under 20000 rupees").
- **Recommendation to product:** de-prioritize until core text search has strong query-understanding (see 6.5) — voice search is a UI wrapper around search intelligence, not a substitute for it. Building voice before the underlying ranking/NLP is solid risks shipping a novelty feature with poor accuracy.

### 6.5 AI Search / Recommendations *(Phase 2+/Future)*

- Conversational refinement layer: "Find me a wedding band for 200 guests in Pune under ₹50,000, available Dec 12."
- Distinct from the AI *recommendation* feed (personalized suggestions shown passively on Discover/Dashboard) — AI Search is **active/query-driven**, recommendations are **passive/behavioral**. Keeping these conceptually separate in the IA avoids conflating two different interaction models under one "AI" umbrella, which tends to produce a confusing, kitchen-sink UI.

---

## 7. Booking Journey (End-to-End)

Presented as a **stepper**, not breadcrumbs, because it is a linear, stateful transaction the user must complete or explicitly abandon — a stepper communicates progress and remaining effort, which reduces abandonment in checkout-like flows.

```
Step 1: Initiate
  → From Profile page, "Book Now" (or "Check Availability")
  → Select event date, event type, location, guest count (contextual fields per category)

Step 2: Request Sent
  → Booking enters "Requested" state
  → Performer notified (push + in-app)
  → Customer sees confirmation screen: "Request sent — [Performer] usually responds within X hours"
     (sets expectations explicitly rather than leaving the customer wondering)

Step 3: Negotiation (optional)
  → Chat thread opens, contextualized with the booking request card pinned at top
  → Either party can propose changes (date, price, package)
  → Performer confirms or declines

Step 4: Confirmation
  → Booking status → "Confirmed — Awaiting Payment"
  → Price breakdown shown transparently: base price, platform fee, taxes, total
     (transparency here directly serves PRD trust requirements — hidden fees at
     the last step is a top driver of cart abandonment and trust erosion)

Step 5: Payment
  → Razorpay checkout (UPI / card / netbanking)
  → Support for partial advance payment where performer allows it
  → Payment held (escrow-style) until event completion window passes

Step 6: Booking Confirmed
  → Calendar entries created for both parties
  → Automated reminders scheduled (e.g., 7 days, 1 day before event)

Step 7: Event Day
  → No required in-app action; optional "Mark as completed" nudge sent to both parties after event date

Step 8: Post-Event
  → Payment released to performer (minus commission)
  → Review prompt sent to customer
  → Performer can respond to review once posted

[Exit ramps at every step]:
  - Cancel Request (Step 2–3) → no charge, no penalty
  - Cancel After Confirmation (Step 4+) → governed by Cancellation Policy, may incur fee
  - Raise Dispute (Step 6+) → routes to Admin Dispute flow (§3.4b)
```

---

## 8. Empty States, Loading States & Error States

Every empty/error state follows three rules: **(1)** never a dead end — always offer a next action, **(2)** tone matches brand voice (warm, never robotic), **(3)** never blame the user.

| State | Trigger | Treatment |
|---|---|---|
| **Loading (initial)** | Any data-dependent page on first load | Skeleton screens matching final layout (not spinners) — reduces perceived load time and prevents layout shift |
| **Loading (pagination/infinite scroll)** | Search results, messages | Inline spinner at list end, non-blocking |
| **No Search Results** | Filters too narrow / no matches | "No performers match these filters yet in [city]." + auto-suggestion to broaden radius or clear one filter (named explicitly, e.g., "Try removing the price filter") — never just "No results found" |
| **No Nearby Performers** | Sparse supply in a new city (real early-stage risk) | "We're growing in [city] — here are top performers from nearby areas" + fallback results, never a blank page (critical for early markets before liquidity) |
| **No Bookings Yet (Customer)** | New customer, empty Bookings tab | Illustration + "You haven't booked anyone yet — start by exploring artists near you" + CTA to Discover |
| **No Bookings Yet (Performer)** | New performer, empty pipeline | "Your profile is live! Bookings will show up here." + checklist nudge to improve profile completeness (turns an empty state into an activation opportunity) |
| **No Reviews Yet** | New profile | "No reviews yet — be the first to book and share your experience" (customer-facing) / "Reviews will appear here after your first completed booking" (performer-facing) |
| **No Messages** | Empty inbox | "No conversations yet" + CTA relevant to role (Discover for customers, "your profile is visible to customers" reassurance for performers) |
| **Profile Incomplete** | Performer with <60% completeness | Persistent but dismissible banner in Dashboard Overview, not a blocking modal — never prevent access to the dashboard itself |
| **Error — Network/Offline** | Connectivity loss | Inline banner: "You're offline — some features may not work" with auto-retry on reconnect |
| **Error — Payment Failed** | Razorpay failure | Specific, actionable message ("Payment couldn't be processed — your card wasn't charged") + retry button, never a generic "Error occurred" |
| **Error — 404** | Broken/removed profile link | Branded 404 with search bar + link back to Discover (recover the user's intent, don't just apologize) |
| **Error — 500 / System** | Server error | Branded error page, "Our team has been notified" + retry action |
| **Access Denied** | Wrong role attempting restricted page (e.g., customer hitting `/admin`) | Redirect to appropriate dashboard, not a raw 403 page |

---

## 9. Responsive Behaviour

BandVerse is **mobile-first in design intent**, but desktop is treated as a first-class experience for performers managing their business (a Dhol Tasha group leader managing 25 members is more likely to do so from a laptop) — so this is genuinely responsive, not "mobile-only with desktop as an afterthought."

| Breakpoint | Range | Layout Behavior |
|---|---|---|
| **Mobile** | <768px | Single-column layout; bottom tab nav (logged in) or hamburger (public); search is full-screen takeover on focus; map/list are separate full-screen views (toggle, not split-screen); dashboard sidebar collapses entirely into bottom nav + a "More" sheet for secondary items |
| **Tablet** | 768–1023px | Two-column layouts where content allows (e.g., search results grid 2-wide); sidebar becomes a collapsible icon-rail (icons only, expandable on tap) rather than full bottom nav — tablets have enough width to avoid sacrificing the sidebar pattern entirely |
| **Desktop** | ≥1024px | Full sidebar (labeled) + content area; search results in multi-column grid; map search uses split-screen (list left, map right) — this split view is desktop-only because it requires enough width for both to be legible simultaneously |
| **Large Desktop** | ≥1440px | Max-content-width constraint (e.g., ~1280–1320px centered) rather than letting content stretch edge-to-edge — unconstrained line lengths and card grids hurt readability and scanning on large monitors |

**Specific adaptive behaviors:**
- **Booking stepper:** horizontal steps on desktop/tablet collapse to a vertical, single-active-step view on mobile with a progress bar rather than cramped horizontal labels.
- **Compare feature:** side-by-side columns on desktop (up to 3), becomes a swipeable card-per-screen carousel on mobile (3 columns of dense data is unreadable below ~600px).
- **Chat:** full split-pane (thread list + active conversation) on desktop/tablet; single-pane with back-navigation on mobile.

---

## 10. Accessibility

Accessibility is treated as a baseline requirement (per PRD NFRs, WCAG 2.1 AA), not a post-launch add-on — particularly important given the PRD's own persona set includes lower-tech-literacy users.

### 10.1 Keyboard Navigation
- Full tab-order support across all interactive elements; logical order follows visual hierarchy (top-to-bottom, left-to-right).
- Visible focus states on every interactive element (buttons, links, form fields, map pins) — never `outline: none` without a replacement focus style.
- Modal/drawer patterns (booking request, filters) trap focus within them and return focus to the triggering element on close.
- Skip-to-content link at the top of every page for keyboard/screen-reader users to bypass repeated navigation.

### 10.2 Screen Readers
- All images (performer photos, media galleries) require meaningful alt text — for performer-uploaded media, prompt for a short description during upload rather than leaving alt text blank.
- Icon-only buttons (chat, notifications, filters) always paired with `aria-label`.
- Live regions (`aria-live`) for asynchronous updates that sighted users perceive visually but screen reader users would otherwise miss: new chat messages arriving, booking status changes, form validation errors.
- Map search experience must have a non-map equivalent (list view) that is fully screen-reader operable — maps are inherently difficult to make accessible, so the list view is the accessible parity path, not an afterthought.

### 10.3 Color Contrast
- Minimum 4.5:1 contrast ratio for body text, 3:1 for large text/UI components, per WCAG AA.
- Status indicators (booking states, verification badges) never rely on color alone — always paired with an icon and/or text label (e.g., not just a green dot, but "✓ Confirmed").
- Given the brand direction leans toward a deep/dark base palette (§17 of PRD), contrast checking is especially critical on dark backgrounds — every text/background combination in the design system must be validated, not assumed.

### 10.4 Touch Targets
- Minimum 44×44px touch targets on all interactive mobile elements (buttons, nav items, map pin markers, form controls), per iOS/Material guidelines.
- Adequate spacing between adjacent tappable elements (e.g., category filter chips, review "helpful" buttons) to prevent mis-taps.
- Bottom nav items sized and spaced for thumb-reach zones on standard mobile device heights.

### 10.5 Additional Considerations
- **Reduced motion:** respect `prefers-reduced-motion` — Framer Motion animations (per PRD tech stack) should have a reduced/instant-transition fallback, not just be decoratively disabled.
- **Form errors:** inline, specific, associated with their field via `aria-describedby` — never a generic error summary disconnected from the field itself.
- **Language:** given the PRD's localization roadmap (Hindi, Marathi, Gujarati), the IA and component structure should avoid hard-coded text-length assumptions (e.g., nav labels, buttons) that would break under longer translated strings.

---

## 11. UX Principles — Reasoning, Challenges & Recommendations

This section makes the *why* explicit, and — per your brief — actively challenges instincts that would otherwise creep into this product.

### 11.1 "Don't gate discovery behind login" — and why this matters more than it seems
**The naive approach** many teams default to: require sign-up before browsing, to "capture the lead early." **Why this is wrong for BandVerse specifically:** the core value proposition is *browsing and evaluating unfamiliar performers* — that's the entire trust-building job of the product. If you force login before a customer has even seen a single Dhol Tasha group's video, you've asked for commitment before delivering any value, and you will lose the majority of top-of-funnel traffic before they ever understand what BandVerse is. **Recommendation (implemented above):** login is only required at the point of *action* (chat, book, save/favorite) — never for passive discovery.

### 11.2 "Don't build 4 separate apps for 4 roles"
**The naive approach:** since Artists, Bands, Customers, and Admins have such different needs, build separate dashboards/apps for each. **Why this is wrong:** it multiplies design and engineering surface area, breaks the PRD's stated goal of a maintainable, modular codebase, and — critically — fails the realistic scenario where one person is *both* a customer (books a DJ for their own wedding) and, say, a music teacher offering lessons. **Recommendation (implemented above):** one shell, role-aware modules, a profile switcher.

### 11.3 "Don't hide pricing behind a 'contact for quote' pattern"
**The naive approach**, common in wedding-vendor sites: hide all pricing to force a phone call/lead capture. **Why this is wrong for BandVerse:** the entire PRD problem statement (§3) explicitly names "no pricing transparency" as a core pain point BandVerse exists to solve. Hiding pricing on the platform would directly contradict the product's founding thesis. **Recommendation:** transparent starting prices and package tiers are shown directly on public profiles, with negotiation happening openly in-chat, not via an opaque "request a quote" black box.

### 11.4 "Don't force verification to block visibility"
**The naive approach:** don't show any profile publicly until admin manually verifies it — maximizes trust, zero risk of showing a fake profile. **Why this is wrong at this stage:** with a manual verification process (per MVP scope, PRD §10), this creates a multi-day dead zone between signup and any visibility, which will kill supply-side activation, especially for lower-tech-literacy performer groups who are already the hardest segment to onboard. **Recommendation:** show unverified profiles immediately with a clear "Unverified" state, layer in a verified badge asynchronously. **Explicit trade-off flagged for founder sign-off:** this accepts short-term display of unverified profiles in exchange for activation speed — revisit once verification SLA is fast (this is a business risk decision, not purely a UX one, and deserves explicit founder awareness).

### 11.5 "Don't treat the map as the default search mode"
**The naive approach:** since Google Maps is a headline feature, make map view the default search experience. **Why this is wrong:** maps are a *comparison/spatial-reasoning* tool, not a *scanning* tool — most users scan a list faster than they parse a cluster of pins, especially on mobile where a map consumes the entire viewport and shows fewer results at once. **Recommendation:** List is default, Map is an explicit, easily-accessible toggle — this also directly serves the accessibility requirement in §10.2 (maps are harder to make screen-reader accessible).

### 11.6 "Don't conflate 'AI Search' and 'AI Recommendations' into one fuzzy 'AI' feature"
**The naive approach:** ship one vague "Ask AI" button that tries to do both conversational search and passive suggestions. **Why this is wrong:** these are different interaction models (user-initiated query vs. system-initiated suggestion) solving different problems, and merging them produces a confusing UI that undersells both. **Recommendation:** keep AI Search as a query-refinement layer on the Search page, and AI Recommendations as a passive, clearly-labeled feed module ("Recommended for you") — both deferred to Phase 2+ per PRD, but architected distinctly from day one so they don't need to be untangled later.

### 11.7 "Don't let 'Build Your Own Band' hide its complexity"
**The naive approach:** treat multi-artist booking exactly like a single-artist booking, just with more line items. **Why this is wrong:** it involves N independent confirmation states converging into a single payment — a fundamentally different transactional shape that will confuse users if it's visually indistinguishable from a normal booking. **Recommendation:** give it a distinct "Lineup" visual metaphor (a cart/roster, not a single booking card) so users correctly understand they're coordinating multiple independent confirmations.

### 11.8 "Don't design empty states as dead ends"
**The naive approach:** ship default framework empty states ("No results found") because they're fast to build. **Why this is wrong:** for a two-sided marketplace pre-liquidity, empty states (especially "no performers near you") are not edge cases — they will be a *common* early experience in new cities, and a dead-end empty state directly damages first-impression trust at the exact moment the platform is most fragile. **Recommendation:** every empty state in §8 includes a graceful fallback and a next action, with special attention to the "sparse supply in new city" case.

### 11.9 "Don't skip transparent fee breakdowns at checkout"
**The naive approach:** show a single total price to simplify the payment screen. **Why this is wrong:** the PRD explicitly frames payment transparency as a trust-building pillar (§3, §9 NFRs, §15 Product Philosophy #1 "trust before transaction"). A single opaque total reintroduces the exact "hidden pricing" problem the platform exists to eliminate. **Recommendation:** itemized breakdown (base price, platform fee, taxes) shown before payment confirmation, every time.

---

## Summary of Structural Additions Beyond Explicit PRD Feature Names

For full transparency, here is every screen/element in this IA that isn't a literal feature name from the PRD, with its justification:

| Addition | Why it's structurally necessary |
|---|---|
| City Landing Pages | SEO/geo-discovery entry points — required to make "nearby discovery" (PRD feature) actually discoverable via search engines pre-login |
| Trust & Safety page | Required to operationalize PRD's verification/escrow trust model into something customers can read before transacting |
| Report a Profile action | Required to operationalize "content moderation" (PRD §8.10) — moderation needs an input mechanism |
| Admin Roles/permissions page | Required to operationalize "Admin" as more than one person — any real ops team needs internal permissioning |
| 404 / 500 / Offline / Access Denied states | Required baseline for any production system; not a feature, a necessity |
| Compare page as a distinct URL/screen | Explicit PRD feature ("compare artists") — given a proper IA slot rather than left as a vague modal |

No other additions were made. Everything else maps directly to a PRD section, feature, or user story.

---

*Next recommended milestone (per the "one module at a time" build philosophy): either (a) detailed wireframes/low-fidelity layouts for the Discovery + Public Profile pages (highest-traffic, highest-trust-impact screens), or (b) the Design System foundations (typography, color, spacing, component tokens) that both wireframes and later engineering will depend on. Recommend (b) before (a) — wireframing without a settled design system risks rework.*
