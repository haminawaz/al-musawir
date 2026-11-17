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
| `src/app/globals.css` | Tailwind theme: colours, type sizes, the CAD dot grid, draw-on animation, print colours. |
| `src/data/projects.ts` | Projects and their plans. |
| `src/data/services.ts` | The four services, the four process steps, the land survey specs. |
| `src/data/site.ts` | WhatsApp number, opening hours, nav links. |
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

Add an entry to `projects` in `src/data/projects.ts`. Plan geometry is in feet, measured from the rear-left corner of the plot (the road is at the front). From that one entry the site draws the plot map and the thumbnails, and computes the room schedule, area statement and ground coverage. The page appears at `/projects/<slug>`.

## Old URLs

The site used to be plain `.html` files. `next.config.ts` redirects the old addresses (for example `/project-1.html`) to the new ones.
