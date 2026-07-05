# DutyCare Web — UI/UX Revamp Plan

Goal: lift the app from "functional but basic" to a polished, professional feel.

**Direction (chosen with user):**
- Tone: **clean & clinical** — crisp, calm, generous whitespace, subtle depth.
- Accents: keep **teal (doctor) / indigo (police)**, used deliberately (headers,
  active states, key actions).
- Polish: **skeletons + smooth states** (transitions, focus rings).
- Reference aesthetic: **Linear / Stripe** — precise spacing, muted palette,
  crisp typography, subtle elevation.

**Strategy:** invest in the shared layer (design system), not per-screen polish,
so improvements compound and regressions stay contained. Don't touch Police
(stub, next phase). Validate on existing working screens: login, doctor
list/detail/create, admin.

> Verification caveat: the browser extension is offline, so appearance can't be
> screenshotted here. Each step is build-verified and the load-bearing flows
> (login, image upload, delete, logout, self-deactivate) are re-exercised, but
> the visual result must be judged by the user in a browser.

Status: ☐ not started · ◐ in progress · ☑ done

## Steps

1. ☑ **Token enrichment** — full neutral ramp, shadow scale (xs–lg), soft accent
   tints, tighter Linear-like type scale w/ line-heights + letter-spacing, global
   focus-ring, skeleton shimmer keyframes.
2. ☑ **PageHeader component** (`ds-page-header`) — sticky, blurred, optional back,
   accent title, action slot. Replaced the four hand-rolled headers.
3. ☑ **Input treatment** — `dsInput` directive (one source of truth for field
   styling) applied in login, create, admin, detail, search-filter-bar.
4. ☑ **Upgraded component states** — Button (spinner, doctor/police variants,
   active-press, shadow), Card (softer), ListItem (chevron, hover), EmptyState
   (icon, spacing), SearchFilterBar (ds-button + dsInput).
5. ☑ **Loading & empty polish** — `ds-skeleton-list` shimmer replaces "Loading…"
   on doctor list, detail, admin; empty state has an icon.
6. ☑ **Screen recomposition** — login (centered card + logo), doctor list
   (header/skeleton/list card/FAB), detail (badges, photo grid, sections), create
   (clean form), admin (avatars, status badges).
7. ☑ **Build + flows re-exercised** — build clean; login + all SPA routes serve;
   new utilities/tokens verified in output CSS.
   ☐ **Visual review by user** — appearance can't be screenshotted here; needs a
   look in the browser (login as admin/admin).
