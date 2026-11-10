# AGENTS.md

Guidance for AI coding agents working in this repository. People should read `README.md`.

## What this is

The website for FORGED Custom Wheels: forged wheel sets for BMW M cars, sold in South Africa.
A static single-page app (React 19, TypeScript, Vite 8, Tailwind CSS v4, Three.js) deployed on
Render from `main`. There is no backend and no checkout. Every call to action is a WhatsApp enquiry.

## Commands

| Task | Command |
| --- | --- |
| Install | `npm install --legacy-peer-deps` |
| Dev server | `npm run dev` (port 3000) |
| Type check | `npm run lint` |
| Tests | `npm test` |
| Production build | `npm run build` |

Run the type check, the tests and the build before you open a pull request. All three must pass.

## Rules that are easy to break

1. **Stock rule.** A wheel listing is shown only when `stockStatus` is `In Stock` and
   `stockQuantitySets` is above zero. Use `getAllBrandWheels()`; never list wheels another way.
   Colours a design has no stock of are offered as "to order" on its wheel page, always with
   `TO_ORDER_NOTICE` (3 months lead time). Use `getToOrderFinishes()`; never show a to-order
   colour as in stock or without the notice.
2. **No invented facts.** Do not add claims the business has not confirmed: certifications,
   warranties, test standards, compatibility promises, opening hours, service areas, email
   addresses. If a value is unknown, leave it empty; components hide empty values.
3. **One source for business details.** Phone, WhatsApp, address and domain come from
   `src/config/site.ts`. Do not hardcode them anywhere else. Emails must be on `SITE.domain`.
4. **Numbers come from data.** Prices, set counts, sizes and fitment on any page or in
   `llms.txt` are derived from `src/data/catalogue.ts`. Do not type them into components.
5. **Prices are South African Rand per set of four.** Format with `formatZAR`.
6. **Tests are listed by name.** `npm test` runs the files named in `package.json`. A new
   `*.test.ts` file does not run until you add it to that list.
7. **Generated files.** `public/sitemap.xml` and the page-route block in `render.yaml` are written
   by `scripts/generate-sitemap.ts`. `dist/llms.txt` is written by `scripts/generate-llms.ts`.
   Change the generator, not the output.
8. **Removed pages need a redirect.** When a page is removed, add its address to
   `src/utils/redirects.ts` and `scripts/legacy-pages.json`. A test checks they agree.
9. **Phones first.** Check every page change at 390 px wide: no sideways scroll, no console errors.

## Where things are

- `src/config/site.ts`: business details.
- `src/data/catalogue.ts`: wheel listings and stock. `src/data/clientFitments.ts`: installs.
  `src/data/partners.ts`: partner logos.
- `src/utils/seo.ts`: page titles, descriptions, sitemap paths. `src/utils/redirects.ts`: old
  addresses. `src/utils/llms.ts`: `llms.txt`. `src/utils/askAi.ts`: the "Ask AI about us" links.
- `src/utils/router.tsx`: the client-side router. Routes are matched in `src/App.tsx`.
- `src/components/brand/`: pages and sections. `scripts/`: build steps, in the order in the
  `build` script.

## Things that must stay in step

- The privacy notice (`PrivacyPolicyPage.tsx`) describes what the site does. If a change collects,
  stores or sends visitor data, update the notice in the same pull request.
- `README.md` describes the routes, the build steps, the tests and the stock rule. Update it when
  you change any of them.
- The lead time for to-order colours is `TO_ORDER_LEAD_TIME` in `src/data/catalogue.ts`. Pages and
  `llms.txt` read it from there.

## Adding a page

Add the route in `src/App.tsx`, its title and description in `metaForPath` and its path in
`sitemapPaths` (both in `src/utils/seo.ts`), a link in `src/utils/llms.ts`, then update the tests
in `src/utils/seo.test.ts`.

## Git

Work on a branch and open a pull request. Do not push to `main`: every push to `main` deploys to
the live site. Do not merge without the owner's go-ahead.

## Deploy note

After a deploy, Render has twice served an empty page for some old addresses. If old links go
blank, redeploy once with the build cache cleared and check again.
