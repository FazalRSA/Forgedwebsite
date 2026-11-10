# FORGED Custom Wheels

The website for **FORGED Custom Wheels**, a South African supplier of forged alloy wheel sets for BMW M cars.

It shows the wheels that are in stock, each in photography and an interactive 3D viewer, shows past customer installs, and takes enquiries. There is no online checkout: every call to action is an enquiry.

**Stock rule.** A wheel appears on the site only when its `stockStatus` is `In Stock` and `stockQuantitySets` is above zero. Anything else is hidden, never greyed out or sold as made to order. Each listing is one design in one finish; the other finishes of a design are separate listings.

| | |
| --- | --- |
| **Live site** | [forged-custom-wheels-gu3l.onrender.com](https://forged-custom-wheels-gu3l.onrender.com) (Render, redeploys on every push to `main`) |
| **Production domain** | `forgedsa.co.za` (set in `src/config/site.ts`). The domain still serves the business's existing WordPress site; its DNS has not been moved to this app yet |
| **Stack** | React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · Three.js · Zustand · Firebase |
| **Type** | Static single-page app with client-side routing |
| **Inventory** | 14 in-stock wheel listings across 6 designs, priced in South African Rand per set of four |
| **Licence** | Proprietary, all rights reserved |

---

## Contents

1. [What the site does](#what-the-site-does)
2. [Quick start](#quick-start)
3. [Scripts](#scripts)
4. [Routes](#routes)
5. [Project structure](#project-structure)
6. [Design system](#design-system)
7. [Inventory](#inventory)
8. [Catalogue data model](#catalogue-data-model)
9. [Adding or changing a wheel](#adding-or-changing-a-wheel)
10. [3D wheel studio](#3d-wheel-studio)
11. [Search and sharing](#search-and-sharing)
12. [Business details and contact channels](#business-details-and-contact-channels)
13. [Firebase](#firebase)
14. [Testing](#testing)
15. [Deployment](#deployment)
16. [Known limitations and roadmap](#known-limitations-and-roadmap)
17. [Contributing](#contributing)
18. [Licence](#licence)

---

## What the site does

Four pages, plus the privacy policy:

- **Home (`/`).** What is in stock, as a grid you can filter by design, then customer installs.
- **Wheel page (`/wheels/:slug`).** One in-stock listing: photos, price per set of four, sizes, specification and the other in-stock finishes of the same design. The 3D viewer loads only when the visitor taps "View in 3D". The enquiry button opens WhatsApp with the design, finish and sizes filled in.
- **Installs (`/installs`).** Customer BMW M cars on FORGED wheels. Each install opens to three photos: two studio re-shoots made from the customer's own photo, then that photo itself.
- **Contact (`/contact`).** WhatsApp, phone, address and areas served; any channel not set in `src/config/site.ts` is hidden.
- **Search-ready pages.** Per-route titles, descriptions, canonical URLs, link-preview tags, structured data and a generated sitemap.

The 3D viewer is a Three.js studio with physically based paint finishes, fixed camera views (face, 3/4, side, back, top), an exploded view and, for staggered sets with two models, a Front / Rear switch.

Removed in the simplification: the store and its fitment finder, collections and product pages, the Sixnine dealer page, dealer applications, and client accounts with a garage. Their old addresses redirect (see [Routes](#routes)).

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

No environment variables are needed for local development. Firebase configuration is read from `firebase-applet-config.json`.

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Vite dev server on port 3000 |
| `bun run build` | Regenerates `public/sitemap.xml` and the page rules in `render.yaml` from the catalogue, builds to `dist/`, then writes each page's own HTML file with its title and share image (`scripts/prerender-meta.ts`) |
| `bun run preview` | Serves the production build locally |
| `bun run lint` | Type-check with `tsc --noEmit` |
| `bun run test` | Data, SEO, 3D-studio and security-rules tests (`node:test` via `tsx`) |
| `bun run add-wheel` | Catalogue CLI (`--help` for options) |
| `bun run clean` | Removes `dist/` |

Run `lint`, `test` and `build` before every pull request. The repository has no CI, so these local checks are the gate.

## Routes

Routing is client-side (`src/utils/router.tsx`). Each page in the sitemap also gets its own HTML file at build time, so link previews show that page. The host serves those files for their paths and rewrites every other path to `index.html`.

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `BrandHomePage` | Hero, wheels in stock (`#catalogue`), customer installs |
| `/wheels/:slug` | `WheelShowcasePDP` | Wheel page: photos, 3D viewer, price, sizes, enquire. A sold or unknown slug shows the 404 page |
| `/installs` | `ClientFitmentsPage` | Customer cars on the wheels |
| `/contact` | `ContactPage` | WhatsApp, phone, address, areas served |
| `/privacy-policy` | `PrivacyPolicyPage` | Data governance and cookie disclosure |
| `/studio/:slug` | `StudioPreviewPage` | Unlisted, noindex 3D preview (currently `stf399`) |
| `/admin`, `/admin/*` | `AdminWheelUploader` | Unlisted, passcode-gated, local preview only |
| anything else | `NotFoundPage` | Not found, noindex |

**Old addresses** are redirected in the browser by `redirectFor()` in `src/utils/redirects.ts`, using `history.replaceState` so the Back button is not trapped:

| Old address | Goes to |
| --- | --- |
| `/store`, `/store/*`, `/sixnine-wheels*`, `/official-dealer-sixnine-wheels*`, `/wheels` | `/#catalogue` |
| `/client-fitments`, `/store/client-fitments` | `/installs` |
| `/account`, `/garage`, `/dealer-application`, `/store/dealer-application` | `/contact` |

## Project structure

```
.
├─ index.html                     Single-page shell and static share tags
├─ firebase-applet-config.json    Firebase project config (public web keys)
├─ firebase-blueprint.json        JSON Schema for the Firestore documents
├─ firestore.rules                Firestore security rules
├─ firestore.rules.test.ts        Structural tests for the rules
├─ security_spec.md               Rules invariants and adversarial payloads
├─ public/
│  ├─ images/wheels/<slug>/       front.webp · hero.webp · profile.webp per wheel
│  ├─ models/wheels/              .glb models for the 3D viewer
│  ├─ assets/fitments/<slug>/     front34.webp · side.webp · original.webp per install
│  ├─ robots.txt
│  └─ sitemap.xml                 Generated on every build
├─ scripts/
│  ├─ add-wheel.ts                CLI that writes src/data/customWheels.json
│  ├─ generate-sitemap.ts         Writes public/sitemap.xml and the page rules in render.yaml
│  ├─ prerender-meta.ts           Bakes each page's title and share image into dist/
│  └─ fitment-reshoot/            Pipeline for the install studio re-shoots
├─ components/ui/                 Global footer and shared UI primitives
└─ src/
   ├─ App.tsx                     Providers, route switch, lazy-loaded pages, page metadata
   ├─ config/site.ts              Business identity and contact channels
   ├─ data/catalogue.ts           Types, the 14 stock listings, in-stock filter, siblings, helpers
   ├─ data/customWheels.json      Photography for stock listings, and listings added by the CLI
   ├─ data/studioFinishes.ts      Paint settings per finish for the 3D viewer
   ├─ data/clientFitments.ts      Customer installs data
   ├─ store/                      Zustand store (enquiry form, admin preview) in localStorage
   ├─ context/FirebaseContext.tsx Firebase provider
   ├─ utils/router.tsx            pushState router and crawlable <Link>
   ├─ utils/lazyWithRetry.ts      React.lazy with retries, for the 3D viewer's code
   ├─ utils/redirects.ts          Old address to new address
   ├─ utils/seo.ts                Per-route metadata, structured data, sitemap paths
   ├─ utils/wheelStudioParts.ts   Part classification and camera maths for the viewer
   ├─ utils/wheelBuilder.ts       Builds a stock listing from a short input
   └─ components/
      ├─ brand/                   Home, catalogue, wheel page, installs, contact, privacy
      ├─ admin/                   Admin uploader
      ├─ shared/                  Enquiry form, SafeImage
      └─ visuals/                 WheelStudio (3D), WheelStage, its loading skeleton and error boundary
```

## Design system

The look is dark, restrained and technical. Keep new work inside it.

- **Colour tokens** live in `src/index.css`: onyx surfaces (`#0A0A0A`, `#121215`, `#18181D`), borders (`#26262E`), text greys and one accent, electric orange (`#FF5500`). Do not add new colours; WhatsApp green and Instagram pink appear only on those channels' own buttons.
- **Three typefaces**, each with one job:
  - **Fraunces italic** (`--font-serif`, via `.font-editorial-serif`) for editorial headlines.
  - **Geist Sans** (`--font-sans`) for body text.
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

## Catalogue data model

One record type lives in `src/data/catalogue.ts`:

- **`BrandWheelItem`**: one listing, which is one design in one finish. Key fields: `slug`, `model`, `modelCode` (the design), `finishName`, `priceZAR`, `sizesAvailable`, `compatibleCars`, `technicalSpecSheet`, `stockStatus`, `stockQuantitySets`, `images` (exactly three), `defaultFinish`, `availableFinishes` (only the listing's own finish), `modelUrl`, optional `rearModelUrl`.

Fourteen listings are seeded in `INVENTORY_SEEDS`. What the site can show comes only from `getAllBrandWheels()`, which drops anything that is not in stock. `getSiblingListings(wheel)` returns the other in-stock listings of the same design, and `findWheelBySlug()` returns undefined for a sold or unknown wheel.

`src/data/customWheels.json` is merged by slug. An entry with a seed's slug only adds to that listing (today: the three photos, so the stock sheet stays the source for names, sizes, prices and stock). An entry with a new slug is a complete listing, as written by `npm run add-wheel`.

**Pricing.** Prices are whole Rand in `priceZAR`. `formatZAR()` is the only formatter. There is no currency conversion.

## Adding or changing a wheel

Change stock, prices and sizes in `INVENTORY_SEEDS` in `src/data/catalogue.ts`; set `stockQuantitySets` to 0 (or remove the seed) when a set sells and the wheel disappears from the site.

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

## 3D wheel studio

A wheel with a `modelUrl` opens in the studio (`src/components/visuals/WheelStudio.tsx`, mounted through `WheelStage.tsx`). Three.js is downloaded only after the visitor taps "View in 3D". If a model fails to load, the studio shows a message with a retry button. If the studio's own code fails to download, `lazyWithRetry` tries twice more, then `Wheel3DSceneErrorBoundary` shows a reload card instead of breaking the page.

**How models are assigned**

- One model per wheel **design**. `MODEL_URL_BY_CODE` in `catalogue.ts` maps a model code to its `.glb`; every finish of that design shares the file and the studio repaints it. Photo-backed entries in `customWheels.json` carry the same `modelUrl`.
- FSA001 sets its own front and rear pair on its seed (`modelUrl` and `rearModelUrl`), which enables the Front / Rear switch.
- Paint settings per finish live in `src/data/studioFinishes.ts`.

**Model requirements** (full detail in `public/models/wheels/README.md`)

- Binary glTF 2.0 (`.glb`); bare rim only, no tyre or car.
- Axle bore centre at the origin, face toward +Z, real metres.
- Sub-meshes named `Rim_Barrel`, `Rim_Face_Spokes`, `Hardware_Bolts`, `Center_Cap`. The barrel, face and cap take the selected finish; bolts keep their own material. A wheel with no cap may omit `Center_Cap`.
- Optional `Brake_Rotor` and `Brake_Caliper` meshes enable the brake clearance check.
- Baked textures are not needed: the studio applies its own paint, so models ship without them to keep downloads small (3–4 MB each).
- Keep under roughly 150k triangles for mobile.

**Accuracy of the current models.** The FSA002, FSA003, FSA004, FF-1 and FF-3 models were traced from face-on product photos. Spoke layout, window shapes, bolt positions and hubs follow the photos; spoke sculpting, cap logos and engraving are simplified, and depth is estimated except on FSA002. Replacing them with 3D scans of the physical wheels is the planned upgrade. The FSA001 brake meshes use assumed G80 brake dimensions, not a measured caliper.

## Search and sharing

All search metadata is produced by `src/utils/seo.ts` and applied on every route change.

- **Titles and descriptions** per route, with titles capped at 60 characters. The home title is "Forged wheels for BMW M cars in stock | FORGED Custom Wheels".
- **Canonical URLs** always on the production domain in `src/config/site.ts`.
- **Link previews**: Open Graph and Twitter tags on every route. Link-preview bots and crawlers that do not run JavaScript read the same tags from each page's own HTML file, written by `scripts/prerender-meta.ts`. `index.html` keeps generic tags because it is also the fallback for unknown paths.
- **Structured data**: `Organization` and `WebSite` on the home page; `Product` with the Rand price, in stock, on wheel pages.
- **Sitemap**: `public/sitemap.xml` is regenerated from the catalogue on every build. It lists `/`, one page per in-stock wheel, `/installs`, `/contact` and `/privacy-policy`, and nothing else.
- **Noindex**: admin, preview, sold or unknown wheels, and unknown addresses. `public/robots.txt` keeps crawlers out of `/admin` and `/studio/`.
- **Crawlable navigation**: header, footer and catalogue links are real anchors (`Link` in `src/utils/router.tsx`).

## Business details and contact channels

`src/config/site.ts` is the single source of truth for the business name, domain, address, WhatsApp, phone, email and social links.

A value left empty is never shown: the related button falls back to the enquiry form and the icon or address line is hidden. Fill a value in only once it is confirmed.

**Content rule.** Public copy states only what the business can evidence. Do not add certifications, warranty terms, delivery promises, response times, load ratings or dealer status without a source from the owner.

## Firebase

Client accounts and the garage are gone from the site, but the Firebase provider (`src/context/FirebaseContext.tsx`), `firestore.rules` and their tests are kept as they were. `firestore.rules` denies everything by default and allows owner-only access with a verified email, exact key sets, bounded string sizes, enum allow-lists, server timestamps and immutable identity fields. `security_spec.md` documents the invariants and the adversarial payloads each rule rejects.

```bash
firebase deploy --only firestore:rules
```

`firebase-applet-config.json` holds the public web configuration for the Firebase project.

## Testing

`bun run test` runs six suites with `node:test`:

| Suite | Covers |
| --- | --- |
| `src/data/catalogue.test.ts` | The stock rule (every exported wheel is in stock, 14 listings across 6 designs, one finish each), siblings, no store exports, wheel builder, and that every listed wheel has a 3D model and photos that exist |
| `src/data/clientFitments.test.ts` | Customer installs data |
| `src/utils/wheelStudioParts.test.ts` | Viewer part classification, exploded-view offsets, camera distance |
| `src/utils/seo.test.ts` | Per-route metadata, canonical URLs, structured data, share images, sitemap (no removed route), `render.yaml` |
| `src/utils/redirects.test.ts` | Old address to new address, `replaceState` and no loops |
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

**Checking a deploy.** Render's CDN caches each page's HTML for up to five minutes, so a visitor can see the previous version briefly after a deploy goes live. To check a new deploy straight away, add any query string to the URL, for example `/installs?check=1`.

**Moving the domain.** To go live on `forgedsa.co.za`, add it as a custom domain in the host's dashboard and point the DNS records it gives you at the domain registrar. Canonical URLs and the sitemap already use that domain. The domain currently serves the business's existing WordPress site, which the DNS change replaces, so keep anything still needed from it first.

Vercel's free Hobby plan is for non-commercial use only, so a business site needs Vercel Pro. Render's static sites are free to deploy; check the bandwidth included with the workspace plan against traffic, since each 3D model is 3–4 MB.

For Firebase Hosting instead:

```json
{ "hosting": { "public": "dist", "rewrites": [{ "source": "**", "destination": "/index.html" }] } }
```

Build chunks are split per vendor (`react`, `motion`, `three`, `firebase`, `lucide`) and per route.

## Known limitations and roadmap

| Area | Today | Planned |
| --- | --- | --- |
| **Lead delivery** | The enquiry button opens WhatsApp with the wheel filled in. The fallback enquiry form stores its entries only in the visitor's browser; nothing reaches the business from it. | Send form entries to the business (email or Google Sheets) |
| **Contact channels** | Set in `src/config/site.ts`; any channel left empty there is hidden (Instagram, Facebook and trade email are empty today) | Fill in once confirmed |
| **3D accuracy** | Five designs are traced from photos with simplified surfaces | Replace with scans of the physical wheels |
| **Photography** | Six listings have no product photos and show a plain drawn stand-in (FSA001, FSA002 Hyper Black and Polished Face, FSA003 Silver, FSA004 Hyper Black and Gloss Black) | Shoot and add |
| **Link previews** | The app is client-rendered; `npm run build` bakes each page's title and share image into its own HTML file so chat apps show the right preview for the pages in the sitemap | Server-render if more pages are added |
| **Old links** | Redirected in the browser, not with an HTTP 301 | Add 301 rules on the host |
| **Unknown addresses** | Show the noindex not-found page, but the host still answers HTTP 200 | Return HTTP 404 from the host for unknown paths |
| **Domain** | The new site is live only at its Render address; `forgedsa.co.za` still serves the old WordPress site | Move the domain's DNS to the host (see [Deployment](#deployment)) |
| **Admin publishing** | The uploader stores wheels locally; publishing is a data-file change and rebuild | Firebase-backed catalogue with authenticated admin writes |
| **Stock** | Counts are edited in `INVENTORY_SEEDS` and need a rebuild | Read from the stock sheet |

## Contributing

1. Branch from `main`.
2. Keep changes small and focused; update tests with the behaviour you change.
3. Run `bun run lint`, `bun run test` and `bun run build`.
4. Open a pull request against `main` describing what changed and how it was checked.
5. Follow the content rule above for anything customer-facing.

## Licence

Proprietary. Copyright © 2026 FORGED Custom Wheels. All rights reserved. See [LICENSE](LICENSE).

This repository is public for deployment and collaboration only. No permission is granted to use, copy, modify or distribute its contents without prior written consent.
