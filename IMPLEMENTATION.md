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

## Phase 1 — Design system  ☑

Tokens bridged into Tailwind v4 `@theme` (styles.scss) as the single source of
truth → first-class utilities (`bg-primary`, `text-doctor`, `text-title`,
`rounded-md`). Components use utilities, no inline `style=` for design values.
`tokens.scss` keeps the spacing scale + a runtime `--accent` var that flips per
module (`.theme-doctor` / `.theme-police`).

- ☑ Token→Tailwind `@theme` bridge (palette, type scale, radii); utilities verified in build
- ☑ `ButtonComponent` (`ds-button`) — primary/secondary/danger, loading, block; spec'd
- ☑ `CardComponent` (`ds-card`)
- ☑ `ListItemComponent` (`ds-list-item`) — title/subtitle/meta + leading/trailing slots
- ☑ `EmptyStateComponent` (`ds-empty-state`)
- ☑ `ImageUploaderComponent` (`ds-image-uploader`) — resize, thumbnail, progress;
      emits PreparedImage, upload stays in feature services (serves list + single)
- ☑ `SearchFilterBarComponent` (`ds-search-filter-bar`) + `search-filter.model.ts`
      — config-driven, field types limited to text / date-range / select (§5, §11)
- ☑ `image-resize.util.ts` — canvas resize, EXIF auto-orient via createImageBitmap
- ☑ Login refactored onto `ds-button` + theme utilities (real-content validation, §12)
- ☑ Accent mechanism settled: doctor/police screens use `text-doctor`/`bg-doctor`
      utilities directly; the dead `--accent`/`.theme-*` runtime var was removed

> Note: per project policy, no UI/API unit tests going forward. Verify by build
> (`ng build`) and the local run/preview flow.

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
- ☑ JWT decode verified end-to-end: real admin/admin login from the API returns a
      token whose payload decodes correctly (base64url handled). Login round-trip
      confirmed against the local Docker Postgres backend (bad creds → 401,
      admin/admin → 200 + SuperAdmin token).

## Phase 3 — Doctor module  ☑

Lazy `features/doctor` (`doctor.routes.ts`). Screens (§11):

- ☑ `activity-list.component` — dashboard: `ds-search-filter-bar` (name/place/
      date-range/type), `ds-list-item`, `ds-empty-state`, floating add button
- ☑ `activity-detail.component` — `ds-card`, `ds-image-uploader` (upload + delete,
      revokes object URLs), share link create + copy
- ☑ `activity-create.component` — dual create/edit (reused for `:id/edit`,
      prefills from the loaded activity)
- ☑ Detail: **Edit** button (→ edit form) and **Delete** (inline confirm →
      soft delete → back to dashboard)
- ☑ `doctor-api.service` + models (search/get/create/update, image up/delete, share-link)
- ☑ `public-share/share-view.component` — public activity view (no auth)
- ☑ Doctor accent (`text-doctor`/`bg-doctor`) applied throughout
- ☑ Verified through web proxy: SPA routes serve, public share returns safe fields

## Phase 4 — Police module  ☐

Lazy `features/police` (`police.routes.ts`). Screens (§11):

- ☐ `case-list.component` + `case-search.component` (dashboard)
- ☐ `case-create.component`
- ☐ `case-detail.component`
- ☐ `case-person-form.component` (persons, phones, profile image)
- ☐ `case-vehicle-form.component` (vehicles)
- ☐ Police API service (cases, persons, phones, vehicles, search)
- ☐ Police accent applied so module is visually distinct

## Phase 5 — Admin  ☑

- ☑ `admin-api.service` — list, create, setStatus
- ☑ `admin/user-list.component` — list, inline create form (username/password/
      role → Doctor/Police/SuperAdmin), activate/deactivate toggle
- ☑ Self row shows "(you)" and can't be deactivated (server enforces by id too)
- ☑ 409 → "username already taken"; verified create/list/status through web proxy

## Phase 6 — Deploy  ☐

- ☐ Set real backend host in `vercel.json`
- ☐ Deploy to Vercel once login + one working screen exist (§14)
