# DutyCare Web

Angular 20 (standalone) mobile-first responsive web app for DutyCare, with two
lazy-loaded, role-guarded modules (Doctor, Police), a public share view, and a
minimal admin area. Styled with a fixed SCSS design-system token set plus
TailwindCSS v4 utilities.

See [`../DutyCare-Project-Plan.md`](../DutyCare-Project-Plan.md) for the full
design and [`IMPLEMENTATION.md`](IMPLEMENTATION.md) for phase-by-phase progress.

## Stack

- Angular 20, standalone components, lazy routes
- SCSS design-system tokens (`src/app/shared/design-system/tokens.scss`)
- TailwindCSS v4 (`@tailwindcss/postcss`)
- Deployed to Vercel; `/api/*` rewritten to the backend (same-origin, no CORS)

## Getting started

```bash
npm install
npm start        # ng serve
```

For local API calls, either run against a deployed backend or add a dev proxy
for `/api`.

## Layout

```
src/app/
  core/         auth service/guards, HTTP interceptor, api base
  shared/       design-system components, pipes, utils
  features/
    login/
    doctor/     (lazy) dashboard, activity detail, create
    police/     (lazy) dashboard, case detail, create
    public-share/
    admin/
```

## Deployment

Deployed to Vercel. Set the real backend host in `vercel.json` (`/api/:path*`
rewrite) before the first production deploy.
