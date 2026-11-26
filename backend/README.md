# al-musawir backend

API for the Al-Musawir website and its admin dashboard. Node.js, Express 5, PostgreSQL, Prisma 7, TypeScript.

It serves two separate APIs:

| Base path | Who uses it | Access |
| --- | --- | --- |
| `/api/v1` | the website (`../App`) | public, no sign-in, **GET only** |
| `/api/admin` | the dashboard (`../admin-panel`) | the one admin account, signed in |

## Run it

Needs Node.js 20.19+ and PostgreSQL (any 14+; `docker compose up -d` starts one locally).

```bash
npm install
cp .env.example .env      # then fill in DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:generate       # Prisma client (dev and build also do this)
npm run db:deploy         # create the tables
npm run db:seed           # load the content and create the admin account
npm run dev               # http://localhost:4000
```

Generate `AUTH_SECRET` with `openssl rand -base64 48`.

## Scripts

| Script | What it does |
| --- | --- |
| `dev` | Runs the server and restarts it on changes. |
| `build`, `start` | Compiles to `dist/` and runs it. |
| `typecheck`, `test` | Type-checks, runs the tests (see [Tests](#tests)). |
| `db:migrate` | After changing `prisma/schema.prisma`: creates a migration and applies it (development). |
| `db:deploy` | Applies pending migrations (production, CI). |
| `db:seed` | Loads the website content from JSON (see [Seeding](#seeding)). |
| `db:studio` | Opens Prisma Studio to browse the database. |
| `admin:set` | Changes the admin's email, name or password. |

## Seeding

`npm run db:seed` loads all the website content: site settings, menu, services, process steps, land survey details, categories, projects and the text of every page. The files in `prisma/seed-data/` are copies of the admin panel's `src/mock/seed/*.json`. They are kept here because the admin panel's README says to delete `src/mock` once this backend is in use.

| Command | Effect |
| --- | --- |
| `npm run db:seed` | Fills only what is empty. Safe to run again: it never overwrites changes made in the dashboard. |
| `npm run db:seed -- --reset` | Replaces all website content with the files, and clears the activity log. |
| `npm run db:seed -- --from ../admin-panel/src/mock/seed` | Reads the JSON from another folder. Works with `--reset`. |

Every file is checked with the same rules the API uses before anything is written. Then everything is written in one transaction, so a bad file leaves the database unchanged.

## The admin account

There is exactly one admin, in the `admin` table (id 1; the database refuses a second row). The seed creates it from `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters) and `ADMIN_NAME` if it does not exist yet. After that, remove `ADMIN_PASSWORD` from `.env`.

To change it later:

```bash
npm run admin:set -- --email admin@example.com --name "Admin"   # asks for the new password
```

A new password signs out every open session.

## Public API (`/api/v1`)

Each endpoint returns what one part of the website needs, rather than one response with everything. All return `{ "data": ... }`.

| Path | Returns | Used by |
| --- | --- | --- |
| `/site` | `{ site, navigation }` | every page (header, footer, SEO, WhatsApp) |
| `/services` | `Service[]` | home, services |
| `/process-steps` | `{ title, text }[]` | home, about |
| `/survey-specs` | `{ title, text }[]` | home, survey |
| `/categories` | `{ id, label, projectCount }[]` | projects filter |
| `/projects?category=&limit=` | project cards: plot, room outlines, areas; no doors, windows or title-block details | home, projects |
| `/projects/slugs` | `{ slug, updatedAt }[]` | `generateStaticParams`, sitemap |
| `/projects/:slug` | `{ project, previous, next }`: the full plan, and cards for the projects before and after it | project page |
| `/pages/:page` | that page's text | each page; `footer` on every page |

Pages: `home`, `services`, `projects`, `projectDetail`, `survey`, `about`, `contact`, `footer`, `notFound`.

What makes it fast:
- **Smaller responses.** The projects page gets 2.7 KB instead of 15 KB for everything. A project page gets 2.2 KB.
- **Server cache.** Responses are cached in memory for `PUBLIC_CACHE_TTL_SECONDS` (default 60), and a cached response returns in about 3 ms.
- **Instant updates.** Any save in the dashboard clears that cache, so the website shows the change on the next request.
- **Browser and CDN caching.** Responses send `Cache-Control` and an ETag. A repeat request with `If-None-Match` gets a bodyless `304`.
- **Compression and indexes.** Responses are compressed, and the database has indexes for each list's sort order and the category filter.

How it is kept read-only, in three layers:
1. Any method other than `GET`, `HEAD` or `OPTIONS` (preflight) gets `405` before routing, body parsing or the database.
2. Only GET routes exist, and no body parser is mounted.
3. Its database client (`readDb`) opens connections with `default_transaction_read_only=on`, so PostgreSQL itself refuses any write. For a second lock, point `DATABASE_READONLY_URL` at a role that only has `SELECT`, or at a read replica.

## Admin API (`/api/admin`)

Same paths and JSON as the dashboard's mock API (see `../admin-panel/README.md`, "API contract"). The one exception: `/mock/reset` doesn't exist, and the dashboard only shows that button with the mock API anyway.

| Method | Path |
| --- | --- |
| POST | `/auth/login`, `/auth/logout` |
| GET | `/auth/me`, `/content`, `/activity`, `/pages`, `/projects` |
| GET, PUT | `/site`, `/navigation`, `/services`, `/process-steps`, `/survey-specs`, `/categories`, `/pages/:page` |
| POST | `/projects` |
| GET, PUT, DELETE | `/projects/:slug` |

Errors are `{ "error": "message", "details": ["problem", ...] }`. The status codes are 400 (bad JSON), 401, 403, 404, 405, 409, 413, 415, 422 (validation, with `details`), 429 and 500.

Security:
- **Sign-in.** Passwords are stored as bcrypt hashes. A wrong email and a wrong password take the same time and get the same message.
- **Login limits.** Failed sign-ins are limited to 10 per IP and 50 in total per 15 minutes.
- **Session cookie.** It is HTTP-only, signed with `AUTH_SECRET` and lasts 8 hours. `Secure` is on in production and `SameSite` is `lax`.
- **Signing everyone out.** A new password or a new `AUTH_SECRET` invalidates every open session.
- **Validation.** Every request body goes through a schema before anything is written. Unknown fields are dropped. The rules match the dashboard's `src/lib/validate.ts`, with the same messages.
- **Checks the schema can't do.** Slugs must be unique and categories must exist. A category in use can't be removed. The home hero project can't be deleted and follows a rename. The menu pages and service ids are fixed.
- **CSRF.** Changes from origins not in `ADMIN_CORS_ORIGINS` get 403. Bodies must be JSON.
- **CORS.** Credentials are allowed only for the dashboard's origins.
- **Headers.** Helmet headers are set, `X-Powered-By` is off, and admin responses send `Cache-Control: no-store`.

## How the three apps connect

- **Dashboard.** It forwards its own `/api/*` requests to `/api/admin/*` here. Browsers never call this API directly, so the session cookie is first-party on the dashboard's domain.
  - Set `ADMIN_CORS_ORIGINS` to the dashboard's URL. Saves from any other origin are refused.
- **Website.** It reads `/api/v1/*` while it builds pages, and when a page is refreshed.
  - After every successful save, this server clears its public cache.
  - If `WEBSITE_REVALIDATE_URL` and `REVALIDATE_SECRET` are set, it also calls the website, so the website shows the change on the next visit.

See `../README.md` for deploying all three.

## Where things live

| Path | What it holds |
| --- | --- |
| `src/server.ts`, `src/app.ts` | Startup and shutdown; middleware order and mounting. |
| `src/routes/public.ts`, `src/routes/admin.ts` | The two APIs: every endpoint and its guards, in one file each. |
| `src/modules/<area>/` | One folder per kind of content: `*.schema.ts` (validation), `*.service.ts` (reads and writes), `projects.queries.ts` (public project reads), `projects.mapper.ts` (row ↔ JSON). |
| `src/middleware/` | Auth, read-only guard, CSRF and JSON guards, rate limits, public cache, validation, errors. |
| `src/db/client.ts` | The read-write (`db`) and read-only (`readDb`) clients. |
| `src/db/seed.ts`, `src/scripts/` | The seeder, and the `db:seed` and `admin:set` commands. |
| `src/config/env.ts` | Every environment variable, checked at startup. |
| `prisma/schema.prisma`, `prisma/migrations/` | Tables and migrations. |
| `prisma/seed-data/` | The content to seed, copied from the admin panel. |

Page text is stored as one JSON value per page. Its sections and fields are listed in `src/modules/pages/page-definitions.ts`, a copy of the dashboard's `src/lib/page-schema.ts`. When a field is added there, add it here too, or saving drops it.

## Tests

```bash
npm test     # unit tests: validation, read-only guard, auth guards. No database needed.
```

The integration tests run the whole API against a real database. Use a separate database whose name contains `test`, because the tests replace its content:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/al_musawir_test npx prisma migrate deploy   # once, and after new migrations
TEST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/al_musawir_test npm test
```

## Production

- **Release.** `npm ci`, `npm run build`, `npm run db:deploy`, then `npm start`. The first time, also run `npm run db:seed`.
  - Prisma, TypeScript and tsx are regular dependencies on purpose: npm skips devDependencies when `NODE_ENV=production` is set at install time, and these commands need them.
- **Environment.** Set `NODE_ENV=production`. The server refuses to start without `DATABASE_URL` or an `AUTH_SECRET` of 32+ characters, or with `COOKIE_SECURE=false`.
- **Behind a proxy or load balancer.** Set `TRUST_PROXY` to the number of proxies in front of this server, for example `1`, so rate limits see the real client IP.
  - Dashboard requests all arrive from the dashboard's server, so they share one rate-limit bucket. `ADMIN_RATE_LIMIT_PER_MINUTE` defaults to 1000 for that reason.
  - Failed sign-ins are also capped in total (`LOGIN_GLOBAL_RATE_LIMIT_PER_15_MINUTES`), whatever address they come from.
- **The website's server counts as one client too.** At build time it fetches about one response per page. If you have several hundred projects, raise `PUBLIC_RATE_LIMIT_PER_MINUTE` so the build isn't rate-limited.
- **Health checks.** `/health` reports the process is up. `/health/ready` also checks the database.
- **More than one instance:**
  - Each instance has its own public cache, so another instance can show old content for up to `PUBLIC_CACHE_TTL_SECONDS`.
  - Rate-limit counts are per instance too. Move them to a shared store such as Redis when that matters.
- **Connection poolers.** If yours rejects startup options (some PgBouncer setups), set `PUBLIC_DB_READ_ONLY_SESSION=false`, and use a `SELECT`-only role in `DATABASE_READONLY_URL` instead.
