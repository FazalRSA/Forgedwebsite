# AGENTS.md

Guidance for AI coding agents working in this repository. People should read `README.md`.

## What this is

The website for FORGED Custom Wheels: forged wheel sets for BMW M cars, sold in South Africa.
A static single-page app (React 19, TypeScript, Vite 8, Tailwind CSS v4, Three.js) deployed on
Render from `main`. There is no checkout. Every call to action opens the enquiry form, which posts the
enquiry to an n8n webhook (logged and emailed to the business; see README → Lead delivery) and then
opens WhatsApp with the same message when a number is configured.

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
   `llms.txt` are derived from `src/data/catalogue.ts`. Do not type them into components. The sizes
   and specifications Sixnine publishes for its whole range are in `src/data/sixnineRange.json`, written
   by `scripts/sixnine-range-from-sheet.py`; stock and prices still come only from the catalogue.
5. **Prices are South African Rand per set of four.** Format with `formatZAR`.
5a. **Design names.** Show a design with `designName(code)` (FF-1 reads FF-ONE, FF-3 reads FF-THREE); keep the
   code itself as the key. Never type "FF-1" or "FF-3" into text a visitor reads.
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
- `src/data/catalogue.ts`: wheel listings and stock, and the two brands (`WHEEL_BRANDS`, `brandOfWheel`): FSA designs are
  Forged SA (the shop's own), FF designs are Sixnine Wheels (official dealer). Group, label and link wheels by brand
  through these; never decide a brand any other way. `src/data/clientFitments.ts`: installs.
  `src/data/partners.ts`: partner logos.
- `worker/car-preview/`: the Cloudflare Worker behind "See it on my car" (deployed by the owner, not by Render). The feature stays off while `SITE.carPreviewUrl` is empty; never commit a local address there. `src/utils/carPreview.ts` and `CarPreviewDialog.tsx` are the website side.
- `src/utils/seo.ts`: page titles, descriptions, sitemap paths. `src/utils/redirects.ts`: old
  addresses. `src/utils/llms.ts`: `llms.txt`. `src/utils/askAi.ts`: the "Ask AI about us" links.
- `src/lib/supabase.ts`, `src/context/AccountContext.tsx`, `src/utils/accountService.ts`, `src/components/brand/AccountPage.tsx`: the customer account (README → Customer accounts). `/account` is noindex and stays out of the sitemap.
- `src/utils/router.tsx`: the client-side router. Routes are matched in `src/App.tsx`.
- `src/wheel-viewer/`: the 3D wheel viewer, shared with the BMW configurator repo (`FazalRSA/BMW-AND-FORGED-`, copied into its `shared/wheel-viewer/`). It is edited only here. After a change run `npm run wheel-viewer:stamp` (`npm test` fails without it), then tell the owner the configurator needs `node scripts/wheel-viewer-sync.mjs pull`. See its README.
- `src/components/brand/`: pages and sections. `scripts/`: build steps, in the order in the
  `build` script.

## Adding a 3D model

Use the `add-wheel-model` skill (`.claude/skills/add-wheel-model/`); the owner's steps are in `docs/adding-3d-models.md`. Check a model against the real photos of the listing before wiring it, and never wire an AI model of a wheel the shop does not sell.

## The SIXNINE style skills

`.claude/skills/sixnine-website`, `sixnine-product-listing`, `sixnine-marketing-pages` and `sixnine-blog-writing`
describe the sixnine-wheels.com storefront (measured 19 November 2026; source: the owner's "forged sixnine skills"
Drive folder). They are reference material, kept exactly as the owner supplied them. On 20 November 2026 the owner
asked for the site to follow SIXNINE's build ideology while keeping FORGED's own touches; README → Design system says
what was taken (pills, glass, white primary buttons, one accent, eyebrow heads, press feedback) and what stays. Their
descriptions say "use for any wheel listing / landing page / blog post", but here they guide structure only, and this
file wins:

- FORGED's palette and type stay: `#111111`, blue `#1D4ED8` as the one accent, rose accent text and focus ring, the
  three typefaces. Do not bring in the skills' violet, `#08080A`, Albert Sans or Montserrat unless the owner asks.
- There is no checkout: no cart, "Add to cart", quantity stepper, VAT or shipping lines. Every call to action opens
  the enquiry form.
- Prices are Rand per set of four from the catalogue (rules 4 and 5), never the skills' euro example prices,
  surcharges or sale lines. Finish names stay as the catalogue spells them.
- Blog posts follow `src/data/blog.ts` and its tests, not the skills' article format.
- The skills' own brand rule holds: no SIXNINE renders, photos or wording without the owner confirming permission.
  On 23 November 2026 the owner confirmed the shop, as an official dealer, may use Sixnine's series renders. They are
  in `public/images/sixnine/renders/` (`render` in `src/data/sixnineRange.ts`) and show on the series cards, the mega
  menu and the series pages' hero. Stock cards and wheel pages keep the shop's own photos. Anything else from Sixnine
  (lifestyle photos, wording) still needs the owner's say.

## Things that must stay in step

- The privacy notice (`PrivacyPolicyPage.tsx`) describes what the site does. If a change collects,
  stores or sends visitor data, update the notice in the same pull request.
- Customer accounts are **shared with the BMW configurator**: the same Supabase project, tables and functions
  (`profiles`, `saved_configurations`, `rename_configuration`, `export_my_data`, `delete_my_account`). The schema belongs to
  the configurator repo (`FazalRSA/BMW-AND-FORGED-`, `supabase/migrations/`); change it there, never from this repo, and keep
  `src/utils/accountService.ts` in step. Supabase is imported by the `/account` chunk only; do not import `src/lib/supabase.ts`
  from a page that every visitor loads. Firebase accounts are superseded (see README → Customer accounts).
- `README.md` describes the routes, the build steps, the tests and the stock rule. Update it when
  you change any of them.
- Google Tag Manager (`SITE.googleTagManagerId`, `src/utils/googleTagManager.ts`) loads whatever the owner
  publishes in the container. The privacy notice describes Google Analytics only. If a tag of another kind is
  added there, or the container ID changes, update the notice.
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
