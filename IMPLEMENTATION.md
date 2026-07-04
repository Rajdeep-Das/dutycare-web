# DutyCare Web — Implementation Tracker

Angular 20 (standalone), SCSS design-system tokens + TailwindCSS v4, mobile-first.
Deployed to Vercel; `/api/*` rewritten to the backend so calls stay same-origin
(no CORS). See `../DutyCare-Project-Plan.md` for the full design. This file tracks
build progress phase by phase and module by module.

Status legend: ☐ not started · ◐ in progress · ☑ done

---

## Phase 0 — Project scaffold  ☑

- ☑ `ng new` standalone + SCSS, routing, no SSR
- ☑ TailwindCSS v4 + `@tailwindcss/postcss` (`.postcssrc.json`)
- ☑ Folder structure per Plan §11 (core, shared/design-system, features)
- ☑ `core/`: `AuthService`, `authGuard`, `roleGuard`, auth interceptor, `ApiBaseService`
- ☑ `app.routes.ts` with lazy `doctor`/`police`, public `share/:token`, guarded `admin`
- ☑ `provideHttpClient` + interceptor wired in `app.config.ts`
- ☑ `vercel.json` `/api/*` rewrite + SPA fallback
- ☑ Builds clean (Tailwind utilities + tokens verified in output CSS)

## Phase 1 — Design system  ☐

Tokens fixed in `shared/design-system/tokens.scss` (spacing/type/color/accents, §12).
Build core components once, reuse everywhere:

- ☑ `tokens.scss` — spacing, type scale, neutral/primary/status, doctor/police accents
- ☐ `Button`
- ☐ `Card`
- ☐ `ListItem`
- ☐ `EmptyState`
- ☐ `ImageUploader` (client-side resize, progress, thumbnail preview)
- ☐ `SearchFilterBar` (config-driven filter field definitions, §11)
- ☐ `image-resize.util.ts` real implementation

## Phase 2 — Login & shell  ◐

- ☑ `LoginComponent` — form, calls `POST /api/auth/login`, stores session
- ☑ Role-based redirect via `landingRouteForRole` (Doctor → /doctor,
      Police → /police, SuperAdmin → /admin, §3)
- ☑ `AuthApiService` + `AuthService.setSession` wired from login response
- ☑ Empty doctor & police shells reachable behind guards
- ☑ **FIXED:** `AuthService` now decodes the JWT as the single source of truth —
      rehydrates user (role/username) on construction and expires stale tokens, so
      `authGuard` and `roleGuard` agree after a hard refresh. `isAuthenticated`
      derives from the decoded user, not the raw token.
- ☐ Verify against a live backend: log in → hard-refresh a `/doctor` route → stay
      logged in (needs the API + Postgres running)

## Phase 3 — Doctor module  ☐

Lazy `features/doctor` (`doctor.routes.ts`). Screens (§11):

- ☐ `activity-list.component` + `activity-search.component` (dashboard)
- ☐ `activity-detail.component` + `activity-image-upload.component`
- ☐ `activity-create.component`
- ☐ Doctor API service (search/get/create/update, images, share-link)
- ☐ `public-share/share-view.component` — public activity view (no auth)
- ☐ Doctor accent applied so module is visually distinct

## Phase 4 — Police module  ☐

Lazy `features/police` (`police.routes.ts`). Screens (§11):

- ☐ `case-list.component` + `case-search.component` (dashboard)
- ☐ `case-create.component`
- ☐ `case-detail.component`
- ☐ `case-person-form.component` (persons, phones, profile image)
- ☐ `case-vehicle-form.component` (vehicles)
- ☐ Police API service (cases, persons, phones, vehicles, search)
- ☐ Police accent applied so module is visually distinct

## Phase 5 — Admin  ☐

- ☐ `admin/user-list.component` — list + activate/deactivate (minimal, §7)

## Phase 6 — Deploy  ☐

- ☐ Set real backend host in `vercel.json`
- ☐ Deploy to Vercel once login + one working screen exist (§14)
