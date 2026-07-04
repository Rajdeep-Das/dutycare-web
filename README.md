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

## Run locally (full stack)

Three terminals:

```bash
# 1. Database (in dutycare-api) — first time also seeds admin/admin
cd ../dutycare-api && docker compose up -d
cd DutyCare.Api && dotnet run -- seed-admin admin admin SuperAdmin   # first run only

# 2. API  → http://localhost:5066
ASPNETCORE_ENVIRONMENT=Development dotnet run

# 3. Web  → http://localhost:4200
cd ../../dutycare-web && npm install && npm start
```

Open http://localhost:4200 and log in with **admin / admin**.

`npm start` uses `proxy.conf.json` to forward `/api/*` to the API on :5066, so
frontend calls stay same-origin exactly like the Vercel rewrite in production —
no CORS, no code change between local and deployed.

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
