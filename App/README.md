# al-musawir

Website for Al-Musawir, naqsha nawees and land survey. Built with Next.js (App Router), TypeScript and Tailwind CSS v4.

All content (business details, menu, services, projects, page text) comes from the backend (`../backend`, public API `/api/v1`) and is edited in the dashboard (`../admin-panel`). Pages are prerendered as static HTML and refreshed when content changes.

## Run it

The backend must be running (see `../backend/README.md`); in development it is expected at `http://localhost:4000`.

```bash
npm install
cp .env.example .env.local   # optional in development
npm run dev                  # http://localhost:3000
npm run build && npm start   # the backend must be reachable during the build
```

## Environment variables

| Variable | What it does |
| --- | --- |
| `API_URL` | The backend, e.g. `https://api.example.com`. Required in production. |
| `REVALIDATE_SECRET` | Shared with the backend. With it, a save in the dashboard shows on the website straight away. |
| `CONTENT_REVALIDATE_SECONDS` | Fallback refresh interval when no notice comes from the backend. Default 300. |
| `SITE_URL` | The site's public address, e.g. `https://example.com`. Needed for canonical URLs, `og:url`, `robots.txt` and `sitemap.xml`; without it they are left out. |

## How content gets here

- `src/lib/content.ts` fetches each piece of content from the backend. Responses are cached by Next.js, so visitors get static pages and the backend is not asked on every visit.
- After every save in the dashboard, the backend calls `POST /api/revalidate` with the shared secret (`src/app/api/revalidate/route.ts`). The cached content is dropped, and the next visit to each page rebuilds it with the new content.
- Without that call, pages still refresh every `CONTENT_REVALIDATE_SECONDS`.
- If the backend is down, visitors keep getting the last good pages.
- A project added in the dashboard gets its page on its first visit, without a rebuild. A deleted one shows the 404 page.

## Where things live

| Path | What it holds |
| --- | --- |
| `src/app/` | One folder per page. `layout.tsx` has the shared header, footer and fonts. |
| `src/app/globals.css` | Tailwind theme: colours, type sizes, the CAD dot grid, draw-on animation, print colours. |
| `src/lib/content.ts` | Reads content from the backend, one function per endpoint. |
| `src/lib/types.ts` | Content shapes, including the text of each page. |
| `src/lib/format.ts` | Plot size and area helpers, WhatsApp links. |
| `src/app/api/revalidate/` | Lets the backend refresh the cached pages after a save. |
| `src/components/plan/` | Plan drawings: full plot map, thumbnail, legend, service illustrations, line styles. |
| `src/components/react-bits/` | Animated components from [React Bits](https://reactbits.dev), copied in as source. |

## Design

The site is styled like a draftsman's CAD workspace: a graphite canvas, light linework, one amber accent, and Geist / Geist Mono type with Newsreader italic for accent words. Project plot maps are shown as white paper sheets. All colours are CSS variables in `globals.css`, and the print styles swap them for black on white.

Plan drawings come in two tones from the same geometry: `paper` (white sheet, used on project pages and for printing) and `model` (light lines on dark, used in the hero, thumbnails and legend).

## React Bits

Components are added with the shadcn CLI and land in `src/components/react-bits/`:

```bash
npx shadcn@latest add @react-bits/<Name>-TS-TW    # e.g. @react-bits/BlurText-TS-TW
```

In use: Crosshair and DotGrid (home hero), SplitText and RotatingText (hero text), ScrollVelocity (marquee), SpotlightCard (service cards), AnimatedContent (scroll reveals), Topography (land survey backgrounds), CountUp (project stats) and Magnet (footer button). They respect `prefers-reduced-motion`.

## Adding a project

Add it in the dashboard (Projects › New project). Plan geometry is in feet, measured from the rear-left corner of the plot (the road is at the front). From that one entry the site draws the plot map and the thumbnails, and computes the room schedule, area statement and ground coverage. The page appears at `/projects/<slug>`.

## Old URLs

The site used to be plain `.html` files. `next.config.ts` redirects the old addresses (for example `/project-1.html`) to the new ones. The project redirects name the original slugs; if a project is renamed in the dashboard, update its redirect there.
