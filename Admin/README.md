# al-musawir admin

Dashboard for editing everything the Al-Musawir website shows: projects and their plans, categories, services, process steps, land survey details, the text on every page, and the business details. Built with Next.js (App Router), TypeScript and Tailwind CSS v4, in the same style as the website.

It is a separate app from the website in `../App`, with its own `package.json`, so the two deploy separately.

Until the backend exists, the dashboard runs on a **mock API** built into this app (`src/app/api`). Its starting content was copied from the website's `src/data` files and the text in its pages.

## Run it

```bash
npm install
npm run dev               # http://localhost:3001 (the website uses 3000)
npm run build && npm start
```

Sign in with `admin@example.com` / `admin12345` in development. To change the login, copy `.env.example` to `.env.local` and set the values.

In production (`npm start` or a host such as Vercel), `ADMIN_PASSWORD` and `AUTH_SECRET` must be set, or sign-in is refused.

## Environment variables

| Variable | What it does |
| --- | --- |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | The one mock login. Development defaults: `admin@example.com` / `admin12345` / `Admin`. |
| `AUTH_SECRET` | Signs the session cookie. Required in production. |
| `NEXT_PUBLIC_API_URL` | Where the dashboard sends API requests. Empty = the mock API in this app (`/api`). |
| `NEXT_PUBLIC_SITE_URL` | The website, for the "View website" link. Default `http://localhost:3000`. |
| `MOCK_DB_PATH` | Where the mock API saves its data. Default `./.mock-db.json`. |

## What can be edited

| Dashboard page | Website content | Mock API path |
| --- | --- | --- |
| Overview | Counts, every field still holding placeholder text, recent changes | `/content`, `/activity` |
| Projects | Projects, each with plot, setbacks, rooms, doors and windows, and a live plan preview | `/projects`, `/projects/:slug` |
| Categories | Plot size filters on the projects page | `/categories` |
| Services | The four services (name, summary, what you receive, order) | `/services` |
| Process | The four process steps | `/process-steps` |
| Land survey | The survey details list | `/survey-specs` |
| Page text | Headings, intros, buttons, lists and notes on every page, plus the footer and 404 page | `/pages/:page` |
| Settings | Business name, tagline, WhatsApp number, hours, search title and description, menu labels and order | `/site`, `/navigation` |

## Where things live

| Path | What it holds |
| --- | --- |
| `src/app/(admin)/` | Dashboard pages. Each `page.tsx` renders a client component next to it. |
| `src/app/login/` | Sign-in page. |
| `src/app/api/` | The mock API. Delete it when the backend is ready. |
| `src/mock/seed/*.json` | The content copied from the website: the mock API's starting data. |
| `src/mock/db.ts` | The mock database: reads the seed, saves changes to `.mock-db.json`. |
| `src/proxy.ts` | Sends signed-out visitors to `/login` (Next.js 16's name for middleware). |
| `src/lib/api.ts` | The only code that calls the API. |
| `src/lib/types.ts` | Content types. Site, services, categories and projects match the website's types. |
| `src/lib/validate.ts` | Validation, run by the forms before saving and by the mock API on every write. |
| `src/lib/page-schema.ts` | Lists every editable piece of page text. The Page text forms are drawn from it. |
| `src/components/plan/` | Plan drawings copied from the website, so previews match. |

## Mock data

Changes are saved to `.mock-db.json` (git-ignored), so they survive a restart. **Settings › Reset content** puts everything back to the seed. Deleting the file does the same.

On a host with a read-only disk, such as Vercel, changes stay in memory and are lost when the server restarts. That is fine for a demo, not for real use.

## API contract (for the backend)

The backend should answer the same paths with the same JSON. Every response is JSON:

- success: `{ "data": ... }`
- failure: `{ "error": "message", "details": ["problem", "..."] }` (`details` only for validation errors)

Status codes: `200`, `201` (created), `401` (not signed in), `404`, `409` (blocked by other content), `422` (validation failed), `500`.

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/auth/login` | `{ email, password }` | `{ user }`, and sets the session cookie |
| POST | `/auth/logout` | none | `{ signedOut: true }`, and clears the cookie |
| GET | `/auth/me` | none | `{ user: { email, name } }` |
| GET | `/content` | none | Everything the website needs (`SiteContent`). **Public**, no sign-in, CORS open. |
| GET | `/activity` | none | The latest 50 changes, newest first |
| GET, PUT | `/site` | `Site` | `Site` |
| GET, PUT | `/navigation` | `NavLink[]`. Labels and order can change; the set of `href`s cannot. | `NavLink[]` |
| GET, PUT | `/services` | `Service[]`. The four ids are fixed; one illustration each on the website. | `Service[]` |
| GET, PUT | `/process-steps` | `{ title, text }[]` | the list |
| GET, PUT | `/survey-specs` | `{ title, text }[]` | the list |
| GET, PUT | `/categories` | `{ id, label }[]`. A category used by a project cannot be removed (`422`). | the list |
| GET | `/projects` | none | `Project[]` |
| POST | `/projects` | `Project` | the project, `201`. Slug must be unique. |
| GET | `/projects/:slug` | none | `Project` |
| PUT | `/projects/:slug` | `Project`. The slug may change; the home hero follows it. | `Project` |
| DELETE | `/projects/:slug` | none | `{ deleted }`. `409` if it is the home page hero plan. |
| GET | `/pages` | none | All page text |
| GET, PUT | `/pages/:page` | That page's text: `{ section: { field: text \| text[] \| { label, value }[] } }` | that page's text |
| POST | `/mock/reset` | none | Mock only. Puts all content back to the seed. |

Pages are `home`, `services`, `projects`, `projectDetail`, `survey`, `about`, `contact`, `footer`, `notFound`. The sections and fields of each are listed in `src/lib/page-schema.ts`. The types are in `src/lib/types.ts`; the rules are in `src/lib/validate.ts`.

The mock session is an HTTP-only cookie (`am_admin_session`) signed with `AUTH_SECRET`. The dashboard sends requests with `credentials: "include"`, so a backend on another domain must allow credentials for the dashboard's origin in its CORS settings, or sit behind the same domain.

## Switching to the real backend

1. Build the endpoints above.
2. Set `NEXT_PUBLIC_API_URL` to the backend's address and redeploy.
3. Delete `src/app/api`, `src/mock` and `src/lib/auth`, and make `src/proxy.ts` check the backend's session instead.

## The website and this content

The website still reads its own `src/data` files and the text written in its pages. Edits made here do not show on the website until the website reads `GET /content` (or the backend's equivalent) instead. The JSON keeps the website's shapes (`Site`, `Service`, `Project`...), so that change is mostly swapping imports for one fetch. Two shapes differ: land survey details are `{ title, text }` objects instead of `[title, text]` pairs, and page text is new.
