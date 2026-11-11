# FORGED Custom Wheels

The website for **FORGED Custom Wheels**, a South African supplier of forged alloy wheel sets for BMW M cars.

It shows the wheels that are in stock, each in photography and an interactive 3D viewer, shows past customer installs, and takes enquiries. There is no online checkout and no backend: every call to action opens WhatsApp with the enquiry typed in.

**Stock rule.** A wheel appears on the site only when its `stockStatus` is `In Stock` and `stockQuantitySets` is above zero. Each listing is one design in one finish; the other in-stock finishes of a design are separate listings. Colours a design has no stock of are offered on its wheel page as made to order, always with the notice that a lead time of 3 months applies.

| | |
| --- | --- |
| **Live site** | [forged-custom-wheels-gu3l.onrender.com](https://forged-custom-wheels-gu3l.onrender.com) (Render, redeploys on every push to `main`) |
| **Production domain** | `forgedsa.co.za` (set in `src/config/site.ts`). The domain still serves the business's existing WordPress site; its DNS has not been moved to this app yet |
| **Stack** | React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · Three.js · Zustand |
| **Type** | Static single-page app with client-side routing |
| **Inventory** | 14 in-stock wheel listings across 6 designs, priced in South African Rand per set of four |
| **Licence** | Proprietary, all rights reserved |

---

## Contents

1. [What the site does](#what-the-site-does)
    - [Where to change what](#where-to-change-what)
2. [Quick start](#quick-start)
3. [Scripts](#scripts)
4. [Routes](#routes)
5. [Project structure](#project-structure)
6. [Design system](#design-system)
7. [Inventory](#inventory)
8. [Catalogue data model](#catalogue-data-model)
9. [Adding or changing a wheel](#adding-or-changing-a-wheel)
    - [Adding or correcting a customer install](#adding-or-correcting-a-customer-install)
10. [3D wheel studio](#3d-wheel-studio)
11. [Search and sharing](#search-and-sharing)
    - [For AI assistants and coding agents](#for-ai-assistants-and-coding-agents)
12. [Business details and contact channels](#business-details-and-contact-channels)
13. [Firebase](#firebase)
14. [Testing](#testing)
15. [Deployment](#deployment)
16. [Known limitations and roadmap](#known-limitations-and-roadmap)
17. [Contributing](#contributing)
18. [Licence](#licence)

---

## What the site does

Five pages, plus the privacy notice:

- **Home (`/`).** What is in stock, as a grid you can filter by design, then customer installs, the industry partners strip (SIXNINE Wheels and BMW) and "Ask AI about us".
- **Wheel page (`/wheels/:slug`).** One in-stock listing: photos, price per set of four, sizes and specification. Colours come in two groups: the design's finishes that are **in stock** (each links to its own listing), and its **other colours, to order**, always shown with the notice that a lead time of 3 months applies. The 3D viewer loads only when the visitor taps "View in 3D" and can preview the to-order colours. The enquiry button opens WhatsApp with the design, finish and sizes filled in; a to-order colour opens WhatsApp with the colour and the lead time filled in.
- **Installs (`/installs`).** Customer BMW M cars on FORGED wheels. Each install opens to three photos: two studio re-shoots made from the customer's own photo, then that photo itself with the number plate pixelated.
- **Sixnine dealer page (`/sixnine-wheels`).** FORGED as an official Sixnine Wheels dealer: the Sixnine sets in stock and a fitment summary. Every number on it is worked out from the catalogue.
- **Contact (`/contact`).** WhatsApp, phone, address and areas served; any channel not set in `src/config/site.ts` is hidden.
- **Privacy notice (`/privacy-policy`).** Describes what the site does today: no accounts, no cookies, nothing stored in the browser, contact by WhatsApp or phone.
- **Search-ready pages.** Per-route titles, descriptions, canonical URLs, link-preview tags, structured data and a generated sitemap.
- **AI-ready.** `/llms.txt` gives AI assistants the stock list, prices and contact details as plain text (see [For AI assistants and coding agents](#for-ai-assistants-and-coding-agents)).

The 3D viewer is a Three.js studio with physically based paint finishes, fixed camera views (face, 3/4, side, back, top), an exploded view and, for staggered sets with two models, a Front / Rear switch.

Removed in the simplification: the store and its fitment finder, collections and product pages, dealer applications, and client accounts with a garage. Their old addresses redirect (see [Routes](#routes)).

### Where to change what

Every change below is a file edit, then a pull request. Merging to `main` publishes it.

| To do this | Change this | Then |
| --- | --- | --- |
| Mark a set as sold, or change a price, size or stock count | The listing's seed in `INVENTORY_SEEDS`, `src/data/catalogue.ts` | Nothing else. The grid, wheel page, sitemap, `llms.txt` and Sixnine page all read the catalogue |
| Add photos to a listing | Three WebPs in `public/images/wheels/<slug>/` and an entry in `src/data/customWheels.json` | See [Adding or changing a wheel](#adding-or-changing-a-wheel) |
| Add a new listing | `bun run add-wheel` | Same section |
| Add or replace a 3D model | A `.glb` in `public/models/wheels/` and `MODEL_URL_BY_CODE` in `catalogue.ts` | See [3D wheel studio](#3d-wheel-studio) |
| Change how a finish looks in 3D | `src/data/studioFinishes.ts` | Check the wheel page in the viewer |
| Change the to-order lead time | `TO_ORDER_LEAD_TIME` in `catalogue.ts` | Nothing else; pages and `llms.txt` read it |
| Change the phone, WhatsApp, address or social links | `src/config/site.ts` | Nothing else; empty values are hidden |
| Add or correct a customer install | `scripts/fitment-reshoot/jobs.json`, then the re-shoot scripts | See [Adding or correcting a customer install](#adding-or-correcting-a-customer-install) |
| Add or remove a partner logo | `src/data/partners.ts` and `public/images/partners/` | Owner's confirmation first |
| Add a page | `src/App.tsx`, then `metaForPath` and `sitemapPaths` in `src/utils/seo.ts`, a link in `src/utils/llms.ts` | Update `src/utils/seo.test.ts` |
| Remove a page | Add its address to `src/utils/redirects.ts` and `scripts/legacy-pages.json` | A test checks the two agree |
| Change a page title or description | `metaForPath` in `src/utils/seo.ts` | Titles stay under 60 characters |

## Quick start

**Requirements:** [Bun](https://bun.sh) 1.x (the committed lockfile is `bun.lock`) or Node 22+.

```bash
bun install
bun run dev        # http://localhost:3000
```

With npm, a plain `npm install` fails on an esbuild peer-dependency conflict. Use:

```bash
npm install --legacy-peer-deps
```

Do not commit `package-lock.json`; the repository tracks `bun.lock` only.

No environment variables are needed to run or build the site. On Render the build reads `RENDER_EXTERNAL_URL`, which Render sets itself, for the links in `llms.txt`.

Two things look like setup and are not:

- `.env.example` (`GEMINI_API_KEY`, `APP_URL`) is left over from the Google AI Studio starter the project began as. Nothing in the site reads either value.
- `OPENROUTER_API_KEY` is used only by the install re-shoot scripts in `scripts/fitment-reshoot/`, which run on a developer's machine and never in the build. Set it in your shell's environment; do not put it in a file in the repository.

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Vite dev server on port 3000 |
| `bun run build` | Five steps, in order: regenerate `public/sitemap.xml` and the page rules in `render.yaml` from the catalogue; build to `dist/`; write each page's own HTML file with its title and share image (`prerender-meta.ts`); write a redirect page for every removed address (`legacy-shells.ts`); write `dist/llms.txt` (`generate-llms.ts`) |
| `bun run preview` | Serves the production build locally |
| `bun run lint` | Type-check with `tsc --noEmit` |
| `bun run test` | Data, SEO, redirect, business-details, `llms.txt`, 3D-studio and security-rules tests (`node:test` via `tsx`) |
| `bun run add-wheel` | Catalogue CLI (`--help` for options) |
| `bun run clean` | Removes `dist/` |

Run `lint`, `test` and `build` before every pull request. The repository has no CI, so these local checks are the gate.

`lint` is the TypeScript type check only. `eslint.config.mjs` exists and checks `firestore.rules` alone; no script runs it.

## Routes

Routing is client-side (`src/utils/router.tsx`). Each page in the sitemap also gets its own HTML file at build time, so link previews show that page. The host serves those files for their paths and rewrites every other path to `index.html`.

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `BrandHomePage` | Hero, wheels in stock (`#catalogue`), customer installs, partners strip (`#partners`), Ask AI (`#ask-ai`) |
| `/wheels/:slug` | `WheelShowcasePDP` | Wheel page: photos, 3D viewer, price, sizes, in-stock and to-order colours, enquire. A sold or unknown slug shows the 404 page |
| `/installs` | `ClientFitmentsPage` | Customer cars on the wheels |
| `/sixnine-wheels` | `SixnineDealerPage` | Official Sixnine dealer page: Sixnine sets in stock, fitment summary |
| `/contact` | `ContactPage` | WhatsApp, phone, address, areas served |
| `/privacy-policy` | `PrivacyPolicyPage` | Privacy notice (POPIA): what is collected, by whom, and how to make a request |
| `/studio/:slug` | `StudioPreviewPage` | Unlisted, noindex 3D preview (currently `stf399`) |
| `/admin`, `/admin/*` | `AdminWheelUploader` | Unlisted, passcode-gated, local preview only |
| anything else | `NotFoundPage` | Not found, noindex |

**Old addresses** are redirected in the browser by `redirectFor()` in `src/utils/redirects.ts`, using `history.replaceState` so the Back button is not trapped. The build also writes a small redirect page for each of the 43 addresses in `scripts/legacy-pages.json` (`scripts/legacy-shells.ts`), so an old link still lands on the right page when the host serves a file for it. A test checks that every address in that list has a redirect.

| Old address | Goes to |
| --- | --- |
| `/store`, `/store/*`, `/wheels` | `/#catalogue` |
| `/official-dealer-sixnine-wheels*` | `/sixnine-wheels` |
| `/client-fitments`, `/store/client-fitments` | `/installs` |
| `/account`, `/garage`, `/dealer-application`, `/store/dealer-application` | `/contact` |

## Project structure

```
.
├─ index.html                     Single-page shell and static share tags
├─ AGENTS.md                      Commands and project rules for AI coding agents
├─ render.yaml · vercel.json      Host configuration (Render is in use)
├─ vite.config.ts                 Build config: the `@` alias (repository root) and vendor chunks
├─ metadata.json · .env.example   Left over from the Google AI Studio starter; the site reads neither
├─ firebase-applet-config.json    Firebase project config (public web keys)
├─ firebase-blueprint.json        JSON Schema for the Firestore documents
├─ firestore.rules                Firestore security rules
├─ firestore.rules.test.ts        Structural tests for the rules
├─ security_spec.md               Rules invariants and adversarial payloads
├─ public/
│  ├─ images/wheels/<slug>/       front.webp · hero.webp · profile.webp per wheel
│  ├─ models/wheels/              .glb models for the 3D viewer, and README.md with the model spec
│  ├─ assets/fitments/<slug>/     front34.webp · side.webp · original.webp per install, each with an 800 px thumbnail
│  ├─ images/partners/            Partner logos (transparent WebP)
│  ├─ brand/                      FORGED monogram and wordmark (SVG)
│  ├─ favicon.ico · icon.svg · apple-touch-icon.png   Browser and home-screen icons
│  ├─ robots.txt
│  └─ sitemap.xml                 Generated on every build
├─ scripts/
│  ├─ add-wheel.ts                CLI that writes src/data/customWheels.json
│  ├─ generate-sitemap.ts         Writes public/sitemap.xml and the page rules in render.yaml
│  ├─ prerender-meta.ts           Bakes each page's title and share image into dist/
│  ├─ legacy-shells.ts            Writes a redirect page for each address in legacy-pages.json
│  ├─ legacy-pages.json           The removed addresses that still get a redirect page
│  ├─ generate-llms.ts            Writes dist/llms.txt
│  └─ fitment-reshoot/            Pipeline for the install studio re-shoots (jobs.json, Python scripts, README.md)
├─ docs/installs-pipeline.md      How the Installs gallery is made, with animated diagrams (docs/assets/)
├─ components/ui/                 Shared UI primitives (button, input, label, icons)
├─ lib/utils.ts                   `cn()` class-name helper used by those primitives
└─ src/
   ├─ main.tsx · index.css        Entry point; colour and type tokens
   ├─ App.tsx                     Providers, route switch, lazy-loaded pages, page metadata
   ├─ config/site.ts              Business identity and contact channels
   ├─ data/catalogue.ts           Types, the 14 stock listings, in-stock filter, siblings, to-order colours, helpers
   ├─ data/customWheels.json      Photography for stock listings, and listings added by the CLI
   ├─ data/studioFinishes.ts      Paint settings per finish for the 3D viewer
   ├─ data/clientFitments.ts      Customer installs data
   ├─ data/partners.ts            Industry partners shown on the home page
   ├─ store/                      Zustand store (enquiry form, admin preview) in localStorage
   ├─ context/FirebaseContext.tsx Firebase provider (kept, not mounted by any page)
   ├─ lib/firebase.ts             Firebase setup used by that provider
   ├─ utils/router.tsx            pushState router and crawlable <Link>
   ├─ utils/lazyWithRetry.ts      React.lazy with retries, for the 3D viewer's code
   ├─ utils/redirects.ts          Old address to new address
   ├─ utils/seo.ts                Per-route metadata, structured data, sitemap paths
   ├─ utils/llms.ts               Builds llms.txt from the catalogue, installs and site config
   ├─ utils/askAi.ts              The "Ask AI about us" links and their question
   ├─ utils/wheelStudioParts.ts   Part classification and camera maths for the viewer
   ├─ utils/wheelBuilder.ts       Builds a stock listing from a short input
   ├─ utils/wheelEnquiry.ts       Reads the spec line and words the WhatsApp enquiry
   └─ components/
      ├─ ui/                      Re-exports of the root components/ui primitives
      ├─ brand/                   Header, footer, home, catalogue, wheel page, installs, Sixnine dealer page, partners strip, Ask AI, contact, privacy
      ├─ admin/                   Admin uploader
      ├─ shared/                  BrandLogo, enquiry form, SafeImage
      └─ visuals/                 WheelStudio (3D), WheelStage, its loading skeleton and error boundary
```

## Design system

The look is dark, restrained and technical. Keep new work inside it.

- **Colour tokens** live in `src/index.css`: the brand palette of off-white text (`#EDEBE4`), black background (`#111111`), blue (`#1D4ED8`) for button fills and selected states, and rose (`#F43F5E`) for accent text and keyboard focus, plus onyx surfaces (`#121215`, `#18181D`), borders (`#26262E`) and text greys. Blue text on the black background is too faint to read, so accent text is always rose. Do not add new colours; WhatsApp green and Instagram pink appear only on those channels' own buttons.
- **Logo.** `public/brand/forged-monogram.svg` (gold) and `public/brand/forged-wordmark.svg` (red and white FORGED SA) were traced from the logo files on the business's WordPress site. Their red and gold belong to the logo only; do not use them as interface colours. Use `BrandLogo` (`src/components/shared/`) for the monogram and wordmark together. The browser icons in `public/` are the monogram on an onyx tile.
- **Footer.** `SiteFooter` (`src/components/brand/`) is on every page: the wordmark across the full width, then one column per contact channel set in `src/config/site.ts`, then the page links. An empty channel has no column.
- **Three typefaces**, each with one job:
  - **Satoshi Black** (`--font-display`, self-hosted in `public/fonts`) for every `h1`.
  - **Nunito** (`--font-heading`) for other headings; `.font-editorial-serif` is Nunito italic for emphasis words.
  - **Open Sans** (`--font-sans`) for body text.
  - **Geist Mono** (`--font-mono`, via `.font-tech-mono`) for specifications and uppercase labels.
- **Reuse these components** rather than the plain HTML element:
  - `SafeImage` (`src/components/shared/`) instead of `<img>` for wheel photography. A broken image URL shows the site's placeholder card instead of the browser's broken-image icon.
  - `WheelStage` for any 3D view. It downloads Three.js only when it's needed.

## Inventory

The catalogue mirrors the stock sheet. All prices are South African Rand for a complete set of four.

| Design | Finishes | Sizes | Price (R) | 3D model |
| --- | --- | --- | --- | --- |
| FSA001 (2-piece) | Black Matte | 19 / 20 inch | 90,000 | `stf399-front.glb`, `stf399-rear.glb` |
| FSA002 | Gold · Hyper Black · Polished Face | 20 / 21 inch | 75,000 · 75,000 · 85,000 | `fsa002.glb` |
| FSA003 | Silver · Hyper Black | 20 / 21 inch | 75,000 | `fsa003.glb` |
| FSA004 | Silver · Hyper Black · Gloss Black | 20 / 21 inch | 70,000 | `fsa004.glb` |
| FF-1 | Silver · Liquid Metal | 20 / 21 inch | 80,000 · 95,000 | `ff-1.glb` |
| FF-3 | Pure Bronze · Glossy Black · Liquid Metal | 20 / 21 inch | 80,000 · 80,000 · 95,000 | `ff-3.glb` |

All fitments are BMW M3 (G80), 5×112, centre bore 66.6. Stock counts live in the data, not in this file.

**Colours to order.** The table lists the finishes in stock. On each wheel page, every colour in `WHEEL_FINISHES` that the design has no stock of is offered as made to order, with the notice in `TO_ORDER_NOTICE` ("Colours not in stock are made to order. A lead time of 3 months applies."). `getToOrderFinishes(wheel)` returns them. A to-order colour has no listing, no page and no price of its own; the visitor asks about it on WhatsApp. Never show one as in stock or without the notice.

## Catalogue data model

One record type lives in `src/data/catalogue.ts`:

- **`BrandWheelItem`**: one listing, which is one design in one finish. Key fields: `slug`, `model`, `modelCode` (the design), `finishName`, `priceZAR`, `sizesAvailable`, `compatibleCars`, `technicalSpecSheet`, `stockStatus`, `stockQuantitySets`, `images` (exactly three), `defaultFinish`, `availableFinishes` (only the listing's own finish), `modelUrl`, optional `rearModelUrl`.

Fourteen listings are seeded in `INVENTORY_SEEDS`. What the site can show comes only from `getAllBrandWheels()`, which drops anything that is not in stock. `getSiblingListings(wheel)` returns the other in-stock listings of the same design, `getToOrderFinishes(wheel)` returns the colours of that design that are not in stock, and `findWheelBySlug()` returns undefined for a sold or unknown wheel.

`src/data/customWheels.json` is merged by slug. An entry with a seed's slug only adds to that listing (today: the three photos, so the stock sheet stays the source for names, sizes, prices and stock). An entry with a new slug is a complete listing, as written by `npm run add-wheel`.

**Pricing.** Prices are whole Rand in `priceZAR`. `formatZAR()` is the only formatter. There is no currency conversion.

## Adding or changing a wheel

Change stock, prices and sizes in `INVENTORY_SEEDS` in `src/data/catalogue.ts`; set `stockQuantitySets` to 0 (or remove the seed) when a set sells and the listing disappears from the site. If that was the design's last set in a colour, the colour moves to the design's to-order group on its remaining wheel pages. The lead time is `TO_ORDER_LEAD_TIME` in the same file.

To attach photos or add a new listing:

1. **Choose a slug**: lowercase model code plus finish, for example `fsa003-pure-bronze`. It becomes the URL and the image folder.
2. **Add photos** as three square WebP files (2000×2000 recommended, under 400 KB each, consistent background and framing):

   ```
   public/images/wheels/fsa003-pure-bronze/front.webp
   public/images/wheels/fsa003-pure-bronze/hero.webp
   public/images/wheels/fsa003-pure-bronze/profile.webp
   ```

3. **Point to them.** For a stock-sheet listing, add `{ "slug": ..., "images": [...], "imageLabels": [...] }` to `brandWheels` in `src/data/customWheels.json`. For a new listing use the CLI below. Reference images as `/images/wheels/<slug>/front.webp` (leading slash, no `public/`).
4. **Add the 3D model** (see below) by setting `modelUrl`, or add the design to `MODEL_URL_BY_CODE`.
5. Run `bun run lint`, `bun run test` and `bun run dev`, check `/wheels/<slug>` and `/#catalogue`, then open a pull request.

The CLI writes a complete new listing (sets in stock default to 1; `--sets 0` hides it):

```bash
bun run add-wheel -- --name "TYPE 60 BRONZE" --price 75000 --sets 1 \
  --cars "M3 Competition Sedan (G80)" --sizes "20 inch / 21 inch" --finish champagne-bronze \
  --image /images/wheels/type-60-bronze/front.webp --glb /models/wheels/type-60.glb
bun run add-wheel -- --list
bun run add-wheel -- --remove type-60-bronze
```

The admin page at `/admin` is a local preview tool: wheels created there are stored only in that browser's localStorage and are not published.

### Adding or correcting a customer install

The Installs page shows 22 cars. Each has three photos in `public/assets/fitments/<slug>/`: `front34.webp` and `side.webp` (studio re-shoots made by an image model from the customer's phone photo) and `original.webp` (that photo, with the number plate pixelated and its location data removed).

`src/data/clientFitments.ts` is generated. Do not edit it by hand; change `scripts/fitment-reshoot/jobs.json` and run the scripts.

1. Put the phone photo in `scripts/fitment-reshoot/raw/` (git-ignored) and add the car to `jobs.json`.
2. Render it with `./batch_reshoot.sh <slug>`. This is the only step that costs money (about US$0.14 per image through OpenRouter) and it needs `OPENROUTER_API_KEY` in your environment.
3. Run `python3 qa_sheet.py out` and compare each render with its phone photo: body style, paint, wheel design and finish, and no invented parts. The model has added a rear wing and changed a wheel finish before, so a person must look.
4. Run `python3 build_site_data.py --site ../.. --rawdir raw` to copy the images in and regenerate the data file.
5. Run `bun run test` and check `/installs` on a phone-sized screen.

To change only a label (wheel model, finish name, city), edit `jobs.json` and run step 4; nothing is re-rendered. [docs/installs-pipeline.md](docs/installs-pipeline.md) has the full guide, the field list and what to check before publishing.

The make, model and paint of each car were read from its photo. They are a best reading until the shop confirms them.

## 3D wheel studio

A wheel with a `modelUrl` opens in the studio (`src/components/visuals/WheelStudio.tsx`, mounted through `WheelStage.tsx`). Three.js is downloaded only after the visitor taps "View in 3D". If a model fails to load, the studio shows a message with a retry button. If the studio's own code fails to download, `lazyWithRetry` tries twice more, then `Wheel3DSceneErrorBoundary` shows a reload card instead of breaking the page.

**How models are assigned**

- One model per wheel **design**. `MODEL_URL_BY_CODE` in `catalogue.ts` maps a model code to its `.glb`; every finish of that design shares the file and the studio repaints it. Photo-backed entries in `customWheels.json` carry the same `modelUrl`.
- FSA001 sets its own front and rear pair on its seed (`modelUrl` and `rearModelUrl`), which enables the Front / Rear switch.
- Paint settings per finish live in `src/data/studioFinishes.ts`. Silver and Liquid Metal share one finish id; a listing named Liquid Metal is painted with the polished `LIQUID_METAL_PBR` instead of brushed silver.
- On a wheel page the studio offers the listing's own finish plus the design's to-order colours. While a to-order colour is selected, the page shows the lead-time notice under the viewer.

**Model requirements** (full detail in `public/models/wheels/README.md`)

- Binary glTF 2.0 (`.glb`); bare rim only, no tyre or car.
- Axle bore centre at the origin, face toward +Z, real metres.
- Sub-meshes named `Rim_Barrel`, `Rim_Face_Spokes`, `Hardware_Bolts`, `Center_Cap`. The barrel, face and cap take the selected finish; bolts keep their own material. A wheel with no cap may omit `Center_Cap`.
- Optional `Brake_Rotor` and `Brake_Caliper` meshes enable the brake clearance check.
- Baked textures are not needed: the studio applies its own paint, so models ship without them to keep downloads small (0.4 to 0.8 MB each today; the rebuilt FF-1 and FF-3 are about 1.4 to 1.5 MB each).
- Keep under roughly 150k triangles for mobile.

**Accuracy of the current models.** The FSA002, FSA003, FSA004, FF-1 and FF-3 models were traced from face-on product photos. Spoke layout, window shapes, bolt positions and hubs follow the photos; spoke sculpting, cap logos and engraving are simplified, and depth is estimated except on FSA002. The FF-1 and FF-3 models have been rebuilt from their traces at about 200,000 triangles each with chamfered spokes and occlusion baked in Blender (see `public/models/wheels/README.md`); they are still estimates of depth, not scans. Replacing them with 3D scans of the physical wheels is the planned upgrade. The FSA001 brake meshes use assumed G80 brake dimensions, not a measured caliper.

## Search and sharing

All search metadata is produced by `src/utils/seo.ts` and applied on every route change.

- **Titles and descriptions** per route, with titles capped at 60 characters. The home title is "Forged wheels for BMW M cars in stock | FORGED Custom Wheels".
- **Canonical URLs** always on the production domain in `src/config/site.ts`.
- **Link previews**: Open Graph and Twitter tags on every route. Link-preview bots and crawlers that do not run JavaScript read the same tags from each page's own HTML file, written by `scripts/prerender-meta.ts`. `index.html` keeps generic tags because it is also the fallback for unknown paths.
- **Structured data**: `Organization` and `WebSite` on the home page; `Product` with the Rand price, in stock, on wheel pages.
- **Sitemap**: `public/sitemap.xml` is regenerated from the catalogue on every build. It lists `/`, one page per in-stock wheel, `/installs`, `/sixnine-wheels`, `/contact` and `/privacy-policy`, and nothing else.
- **Noindex**: admin, preview, sold or unknown wheels, and unknown addresses. `public/robots.txt` keeps crawlers out of `/admin` and `/studio/`.
- **Crawlable navigation**: header, footer and catalogue links are real anchors (`Link` in `src/utils/router.tsx`).

### For AI assistants and coding agents

- **`/llms.txt`** follows the [llmstxt.org](https://llmstxt.org) format. `scripts/generate-llms.ts` writes it into `dist/` at the end of every build, from `src/utils/llms.ts`: every in-stock set with its Rand price, sizes and fitment, the to-order lead time, contact details and the main pages. Assistants cannot run this single-page app, so this file is what they can read. Nothing in it is typed by hand. Its links use the address Render publishes the build at (`RENDER_EXTERNAL_URL`), and fall back to the domain in `src/config/site.ts`.
- **"Ask AI about us"** (`AskAiSection`, links built in `src/utils/askAi.ts`) is a row of buttons on the home page for ChatGPT, Claude, Perplexity and Google AI. Each opens that assistant in a new tab with a question typed in that points at `/llms.txt` on the address the visitor is on. The site sends nothing itself, and the question asks for facts only.
- **`AGENTS.md`** at the repository root gives AI coding agents the commands and the rules that are easy to break. Keep it in step with this file.

## Business details and contact channels

`src/config/site.ts` is the single source of truth for the business name, domain, address, WhatsApp, phone, email and social links.

A value left empty is never shown: the related button falls back to the enquiry form and the icon or address line is hidden. Fill a value in only once it is confirmed. Email addresses must be on the business's own domain (`SITE.domain`); a test fails otherwise. `privacyEmail` and `tradeEmail` are empty today, so the privacy notice gives WhatsApp and phone as the contact.

**Partners.** The home page strip reads `src/data/partners.ts` and shows nothing when the list is empty. Add a partner only with the owner's confirmation that the logo may be shown.

**Privacy notice.** `PrivacyPolicyPage` must describe the site as it is. If you add anything that collects, stores or sends visitor data (a form backend, analytics, cookies, a new third party), update the notice in the same pull request. A test fails if the notice mentions features the site no longer has.

**Content rule.** Public copy states only what the business can evidence. Do not add certifications, warranty terms, delivery promises, response times, load ratings or dealer status without a source from the owner.

## Firebase

Client accounts and the garage are gone from the site and no page loads Firebase. The Firebase provider (`src/context/FirebaseContext.tsx`), `firestore.rules` and their tests are kept as they were, for a possible later return of accounts. `firestore.rules` denies everything by default and allows owner-only access with a verified email, exact key sets, bounded string sizes, enum allow-lists, server timestamps and immutable identity fields. `security_spec.md` documents the invariants and the adversarial payloads each rule rejects.

```bash
firebase deploy --only firestore:rules
```

`firebase-applet-config.json` holds the public web configuration for the Firebase project.

## Testing

`bun run test` runs eight test files (73 tests) with `node:test`. The files are listed by name in the `test` script in `package.json`, so a new test file does not run until it is added there.

| Suite | Covers |
| --- | --- |
| `src/data/catalogue.test.ts` | The stock rule (every exported wheel is in stock, 14 listings across 6 designs, one finish each), siblings, to-order colours (never a colour the design has in stock), no store exports, wheel builder, and that every listed wheel has a 3D model and photos that exist |
| `src/data/clientFitments.test.ts` | Customer installs data |
| `src/utils/wheelStudioParts.test.ts` | Viewer part classification, exploded-view offsets, camera distance |
| `src/utils/seo.test.ts` | Per-route metadata, canonical URLs, structured data, share images, sitemap (no removed route), `render.yaml` |
| `src/utils/redirects.test.ts` | Old address to new address, `replaceState`, no loops, and every address in `scripts/legacy-pages.json` has a redirect |
| `src/config/site.test.ts` | Published emails are empty or on the business domain; the privacy notice does not describe removed features |
| `src/utils/llms.test.ts` | `llms.txt` shape, one link and price per in-stock wheel, contact details from the site config, no unbacked claims; the Ask AI links carry the question |
| `firestore.rules.test.ts` | Structure of the Firestore security rules |

There are no browser-level tests. Check 3D and layout changes by hand on a phone-sized viewport before merging.

## Deployment

`npm run build` (or `bun run build`) produces a static single-page app in `dist/`. Any static host works, provided every path that is not a real file is rewritten to `index.html`. The repository ships ready-made configuration for two hosts:

| Host | Config file | How to deploy |
| --- | --- | --- |
| **Render** (static site, in use) | `render.yaml` | Already deployed as `forged-custom-wheels-gu3l`. To recreate it: Render dashboard → New → Blueprint → select this repository |
| **Vercel** | `vercel.json` | Vercel dashboard → Add New → Project → import this repository |

Both configurations install with `npm install --legacy-peer-deps`, run `npm run build`, publish `dist/`, apply the single-page rewrite, and cache fingerprinted assets for a year and models and images for a day. Every push to `main` redeploys.

The page rules in `render.yaml` are written by the build. Do not edit the block between `BEGIN generated page routes` and `END generated page routes` by hand; run `bun run build` and commit the result.

**After a deploy, check old links.** Twice, straight after a deploy, Render served an empty page for some removed addresses (for example `/client-fitments`). Redeploying once with the build cache cleared fixed it both times. The service also still carries rewrite rules from an earlier `render.yaml` that the file no longer controls; they can be tidied under Redirects/Rewrites in the Render dashboard.

**Checking a deploy.** Render's CDN caches each page's HTML for up to five minutes, so a visitor can see the previous version briefly after a deploy goes live. To check a new deploy straight away, add any query string to the URL, for example `/installs?check=1`.

**Moving the domain.** To go live on `forgedsa.co.za`, add it as a custom domain in the host's dashboard and point the DNS records it gives you at the domain registrar. Canonical URLs and the sitemap already use that domain. `llms.txt` links use Render's own address while Render sets `RENDER_EXTERNAL_URL`; change `scripts/generate-llms.ts` to prefer the domain once it is connected. The domain currently serves the business's existing WordPress site, which the DNS change replaces, so keep anything still needed from it first.

Vercel's free Hobby plan is for non-commercial use only, so a business site needs Vercel Pro. Render's static sites are free to deploy; check the bandwidth included with the workspace plan against traffic.

For Firebase Hosting instead:

```json
{ "hosting": { "public": "dist", "rewrites": [{ "source": "**", "destination": "/index.html" }] } }
```

Build chunks are split per vendor (`react`, `motion`, `three`, `firebase`, `lucide`) and per route.

## Known limitations and roadmap

| Area | Today | Planned |
| --- | --- | --- |
| **Lead delivery** | Every enquiry button opens WhatsApp with the wheel filled in. The fallback enquiry form is used only if the WhatsApp number is removed from `src/config/site.ts`; it stores entries in the visitor's browser and nothing reaches the business from it. | Send form entries to the business (email or Google Sheets) |
| **Contact channels** | Set in `src/config/site.ts`; any channel left empty there is hidden (Instagram, Facebook and trade email are empty today) | Fill in once confirmed |
| **3D accuracy** | Five designs are traced from photos with simplified surfaces | Replace with scans of the physical wheels |
| **Photography** | Five listings have no product photos and show a plain drawn stand-in (FSA002 Hyper Black and Polished Face, FSA003 Silver, FSA004 Hyper Black and Gloss Black) | Shoot and add |
| **Link previews** | The app is client-rendered; `npm run build` bakes each page's title and share image into its own HTML file so chat apps show the right preview for the pages in the sitemap | Server-render if more pages are added |
| **Old links** | Redirected in the browser and by a redirect page per removed address, not with an HTTP 301 | Add 301 rules on the host |
| **Unknown addresses** | Show the noindex not-found page, but the host still answers HTTP 200 | Return HTTP 404 from the host for unknown paths |
| **Domain** | The new site is live only at its Render address; `forgedsa.co.za` still serves the old WordPress site | Move the domain's DNS to the host (see [Deployment](#deployment)) |
| **Admin publishing** | The uploader stores wheels locally; publishing is a data-file change and rebuild | Firebase-backed catalogue with authenticated admin writes |
| **Stock** | Counts are edited in `INVENTORY_SEEDS` and need a rebuild | Read from the stock sheet |
| **To-order colours** | Every design offers the same four swatch colours to order, with one lead time and no price | Confirm with the owner which colours each design can be ordered in, and their prices |
| **Dealer status** | The Sixnine page says "Official dealer" on the owner's word; no certificate is shown | Add the dealer certificate and the wording it supports |
| **Privacy notice** | Matches the site, but the retention periods are carried over from an older version, and no Information Officer or registration number is named | Owner to confirm, and have it legally reviewed |
| **Ask AI buttons** | The link formats follow each assistant's documented pattern; they have not been clicked through signed in | Test each once on the live site |
| **Install details** | Each car's make, model and paint were read from its photo, not confirmed | Shop to confirm, then correct `jobs.json` |
| **Leftovers from the starter** | `package.json` still lists `@google/genai`, `express` and `dotenv`, which no file imports. `.env.example`, `metadata.json` and a tracked `.aistudio/` folder (6 MB of screenshots) come from the same starter | Remove in one clean-up pull request |
| **Automated checks** | Type check, 73 data tests and the build, all run by hand. No CI, no browser tests, and ESLint is not wired to a script | Run the three checks on every pull request with a CI workflow |

## Contributing

1. Branch from `main`.
2. Keep changes small and focused; update tests with the behaviour you change, and add any new test file to the `test` script in `package.json`.
3. Run `bun run lint`, `bun run test` and `bun run build`.
4. Open a pull request against `main` describing what changed and how it was checked.
5. Follow the content rule above for anything customer-facing.
6. Do not push to `main`: every push deploys to the live site.

AI coding agents should read `AGENTS.md` first.

## Licence

Proprietary. Copyright © 2026 FORGED Custom Wheels. All rights reserved. See [LICENSE](LICENSE).

This repository is public for deployment and collaboration only. No permission is granted to use, copy, modify or distribute its contents without prior written consent.
