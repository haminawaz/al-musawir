# al-musawir admin

Dashboard for editing everything the Al-Musawir website shows: projects and their plans, categories, services, process steps, land survey details, the text on every page, and the business details. Built with Next.js (App Router), TypeScript and Tailwind CSS v4, in the same style as the website.

It is a separate app from the website (`../App`) and the backend (`../backend`), so the three deploy separately. Content is saved by the backend; the website shows a save straight away.

## Run it

The backend must be running (see `../backend/README.md`); in development it is expected at `http://localhost:4000`.

```bash
npm install
cp .env.example .env.local   # optional in development
npm run dev                  # http://localhost:3001 (the website uses 3000)
npm run build && npm start
```

Sign in with the admin account created by the backend's `npm run db:seed` (or `npm run admin:set`).

## Environment variables

| Variable | What it does |
| --- | --- |
| `API_URL` | The backend, e.g. `https://api.example.com`. Required in production; read at startup, so changing it needs a restart, not a rebuild. |
| `NEXT_PUBLIC_SITE_URL` | The website, for the "View website" link. Built into the pages, so changing it needs a rebuild. |

The backend needs this dashboard's URL in its `ADMIN_CORS_ORIGINS`, or it refuses saves.

## How it talks to the backend

- **One address for the browser.** It only calls `/api/...` on the dashboard's own domain. `src/app/api/[...path]/route.ts` forwards each request to `<API_URL>/api/admin/...` and passes the answer back, the `Set-Cookie` header included.
- **Why.** The session cookie belongs to the dashboard's domain, so sign-in works wherever the backend is hosted. There is no cross-site cookie for browsers to block.
- **Page access.** `src/proxy.ts` asks the backend (`/auth/me`) whether the session is valid before showing a page. Signed-out visitors go to `/login`.
- **Where the checks are.** That check only decides which page to show. Every data request is checked again by the backend, along with validation, the request's origin and sign-in limits.
- **When the backend is down.** Pages still load, and show "Cannot reach the server".

## What can be edited

| Dashboard page | Website content | Admin API path |
| --- | --- | --- |
| Overview | Counts, every field still holding placeholder text, recent changes | `/content`, `/activity` |
| Projects | Projects, each with plot, setbacks, rooms, doors and windows, and a live plan preview | `/projects`, `/projects/:slug` |
| Categories | Plot size filters on the projects page | `/categories` |
| Services | The four services (name, summary, what you receive, order) | `/services` |
| Process | The four process steps | `/process-steps` |
| Land survey | The survey details list | `/survey-specs` |
| Page text | Headings, intros, buttons, lists and notes on every page, plus the footer and 404 page | `/pages/:page` |
| Settings | Business name, tagline, WhatsApp number, hours, search title and description, menu labels and order | `/site`, `/navigation` |

The paths and JSON are listed in `../backend/README.md` (Admin API).

## Where things live

| Path | What it holds |
| --- | --- |
| `src/app/(admin)/` | Dashboard pages. Each `page.tsx` renders a client component next to it. |
| `src/app/login/` | Sign-in page. |
| `src/app/api/[...path]/route.ts` | Forwards `/api/*` to the backend. |
| `src/proxy.ts` | Sends signed-out visitors to `/login` (Next.js 16's name for middleware). |
| `src/lib/api.ts` | The only code in the pages that calls the API. |
| `src/lib/backend.ts` | The backend's address (`API_URL`), server-side only. |
| `src/lib/types.ts` | Content types. |
| `src/lib/validate.ts` | Checks run by the forms before saving; the backend checks again with the same rules. |
| `src/lib/page-schema.ts` | Lists every editable piece of page text. The Page text forms are drawn from it. If you add a field here, add it to `../backend/src/modules/pages/page-definitions.ts` too. |
| `src/components/plan/` | Plan drawings copied from the website, so previews match. |
