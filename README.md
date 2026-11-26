# al-musawir

Three apps, deployed separately:

| Folder | What it is | Local address |
| --- | --- | --- |
| `App/` | The public website (Next.js) | http://localhost:3000 |
| `admin-panel/` | The dashboard where content is edited (Next.js) | http://localhost:3001 |
| `backend/` | The API and the PostgreSQL database (Express, Prisma) | http://localhost:4000 |

```
visitor ──> website ──GET /api/v1──────────┐
                ▲                          ▼
                └── POST /api/revalidate ── backend ── PostgreSQL
                                           ▲
admin ──> dashboard ──/api/* forwarded to /api/admin/*
```

Each folder has its own README, `.env.example` and `package.json`.

## Deploying

Use HTTPS in production for all three. In the example below, the addresses are `https://api.example.com` (backend), `https://admin.example.com` (dashboard) and `https://example.com` (website).

**1. Backend.** Create a PostgreSQL database, then set:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | the database's connection URL |
| `AUTH_SECRET` | a long random string: `openssl rand -base64 48` |
| `ADMIN_CORS_ORIGINS` | `https://admin.example.com` |
| `WEBSITE_REVALIDATE_URL` | `https://example.com/api/revalidate` |
| `REVALIDATE_SECRET` | another long random string |
| `TRUST_PROXY` | the number of proxies in front of it, usually `1` on a hosting platform |
| `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` | the admin account, for the first seed only |

Then run:

```bash
npm ci && npm run build && npm run db:deploy
npm run db:seed        # first time only: loads the content and creates the admin account
npm start
```

After the first seed, remove `ADMIN_PASSWORD`. Change the account later with `npm run admin:set`.

**2. Website.** Set:

| Variable | Value |
| --- | --- |
| `API_URL` | `https://api.example.com` |
| `REVALIDATE_SECRET` | the same value as the backend's |
| `SITE_URL` | `https://example.com` (canonical URLs and the sitemap) |

Then `npm ci && npm run build && npm start`. The build reads the content, so the backend must be up first.

**3. Dashboard.** Set:

| Variable | Value |
| --- | --- |
| `API_URL` | `https://api.example.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://example.com` |

Then `npm ci && npm run build && npm start`.

**Check it.**
- `https://api.example.com/health/ready` answers `{"data":{"status":"ok","database":"ok"}}`.
- You can sign in at `https://admin.example.com`.
- After you save a change, it shows at `https://example.com` on the next page load.

## Local development

```bash
cd backend && cp .env.example .env    # fill in DATABASE_URL, AUTH_SECRET, ADMIN_*; docker compose up -d starts PostgreSQL
npm install && npm run db:deploy && npm run db:seed && npm run dev
cd ../App && npm install && npm run dev
cd ../admin-panel && npm install && npm run dev
```

In development the website and the dashboard find the backend at `http://localhost:4000` without any settings. Without `REVALIDATE_SECRET` on both sides, the website still refreshes on its own every 5 minutes.
