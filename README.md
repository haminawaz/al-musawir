# al-musawir

Website for Al-Musawir, naqsha nawees and land survey. Built with Next.js (App Router), TypeScript and Tailwind CSS v4. Every page is prerendered as static HTML.

## Run it

```bash
npm install
npm run dev               # http://localhost:3000
npm run build && npm start
```

## Where things live

| Path | What it holds |
| --- | --- |
| `src/app/` | One folder per page. `layout.tsx` has the shared header, footer and fonts. |
| `src/app/globals.css` | Tailwind theme: colours, fonts, heading styles, the drafting-grid background. |
| `src/data/projects.ts` | Projects and their plans. |
| `src/data/services.ts` | The four services (home page and Services page). |
| `src/data/site.ts` | WhatsApp number, opening hours, nav links. |
| `src/components/plan/` | Plan drawings: full plot map, thumbnail, legend, shared line styles. |

## Adding a project

Add an entry to `projects` in `src/data/projects.ts`. Plan geometry is in feet, measured from the rear-left corner of the plot (the road is at the front). From that one entry the site draws the plot map and the thumbnails, and computes the room schedule, area statement and ground coverage. The page appears at `/projects/<slug>`.

## Old URLs

The site used to be plain `.html` files. `next.config.ts` redirects the old addresses (for example `/project-1.html`) to the new ones.
