# FORGED Custom Wheels

The website for **FORGED Custom Wheels**, a South African supplier of forged alloy wheel sets for BMW M cars.

It presents the in-stock inventory, helps a visitor find wheels for their BMW model, shows every wheel in photography and an interactive 3D studio, and takes enquiries. There is no online checkout: every call to action leads to an interest request.

| | |
| --- | --- |
| **Production domain** | `forgedcustomwheels.com` |
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
6. [Inventory](#inventory)
7. [Catalogue data model](#catalogue-data-model)
8. [Adding or changing a wheel](#adding-or-changing-a-wheel)
9. [3D wheel studio](#3d-wheel-studio)
10. [Search and sharing](#search-and-sharing)
11. [Business details and contact channels](#business-details-and-contact-channels)
12. [Accounts and Firebase](#accounts-and-firebase)
13. [Testing](#testing)
14. [Deployment](#deployment)
15. [Known limitations and roadmap](#known-limitations-and-roadmap)
16. [Contributing](#contributing)
17. [Licence](#licence)

---

## What the site does

- **Wheel catalogue.** A filterable grid of in-stock wheel sets, each with its own page, a three-angle gallery with zoom and pan, finish swatches and an enquiry button.
- **3D wheel studio.** Every listed wheel opens in an interactive Three.js studio with physically based paint finishes, fixed camera views (face, 3/4, side, back, top), an exploded view and, for staggered sets with two models, a Front / Rear switch.
- **Vehicle fitment finder.** Make → Model → Year → Part, resolving to a collection of wheel sets with sale and diameter filters and price sorting.
- **Technical product pages.** A specification table, finish selector, gallery and an interest request form in place of a cart.
- **Client fitments gallery.** Client BMW M cars on FORGED wheel sets, shown as studio re-shoots of each customer's own photo.
- **Trade applications.** A dealer and workshop application form.
- **Client accounts.** Google sign-in with a saved profile and a personal garage of vehicles, stored in Firestore under owner-only security rules.
- **Search-ready pages.** Per-route titles, descriptions, canonical URLs, link-preview tags, structured data, a generated sitemap and crawlable navigation links.

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
| `bun run build` | Regenerates `public/sitemap.xml` from the catalogue, then builds to `dist/` |
| `bun run preview` | Serves the production build locally |
| `bun run lint` | Type-check with `tsc --noEmit` |
| `bun run test` | Data, SEO, 3D-studio and security-rules tests (`node:test` via `tsx`) |
| `bun run add-wheel` | Catalogue CLI (`--help` for options) |
| `bun run clean` | Removes `dist/` |

Run `lint`, `test` and `build` before every pull request. The repository has no CI, so these local checks are the gate.

## Routes

Routing is client-side (`src/utils/router.tsx`). The host must rewrite every path to `index.html`.

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `BrandHomePage` | Hero, wheel catalogue (`#catalogue`), client fitments |
| `/wheels/:slug` | `WheelShowcasePDP` | Wheel page: 3D studio, three-angle photography, finishes, enquire |
| `/sixnine-wheels`, `/official-dealer-sixnine-wheels` | `SixnineDealerPage` | Sixnine FF-1 and FF-3 range |
| `/client-fitments` | `ClientFitmentsPage` | Gallery of client cars |
| `/dealer-application` | `DealerApplicationPage` | Trade application form |
| `/store` | `VehicleFitmentWidget` | Fitment finder and featured collections |
| `/store/collections/:slug` | `FitmentCollectionView` | Product grid for a BMW model |
| `/store/products/:slug` | `TechnicalProductView` | Technical product page with 3D studio and interest request |
| `/account`, `/garage` | `AccountGaragePage` | Google sign-in, profile, garage vehicles |
| `/studio/:slug` | `StudioPreviewPage` | Unlisted, noindex 3D preview page (currently `stf399`) |
| `/admin`, `/admin/wheels` | `AdminWheelUploader` | Passcode-gated uploader, local preview only |
| `/privacy-policy` | `PrivacyPolicyPage` | Data governance and cookie disclosure |

## Project structure

```
.
├─ index.html                     Single-page shell and static share tags
├─ firebase-applet-config.json    Firebase project config (public web keys)
├─ firebase-blueprint.json        JSON Schema for UserProfile and UserVehicle
├─ firestore.rules                Firestore security rules
├─ firestore.rules.test.ts        Structural tests for the rules
├─ security_spec.md               Rules invariants and adversarial payloads
├─ public/
│  ├─ images/wheels/<slug>/       front.webp · hero.webp · profile.webp per wheel
│  ├─ models/wheels/              .glb models for the 3D studio
│  ├─ assets/aistudio/            Client fitment photography
│  ├─ robots.txt
│  └─ sitemap.xml                 Generated on every build
├─ scripts/
│  ├─ add-wheel.ts                CLI that writes src/data/customWheels.json
│  ├─ generate-sitemap.ts         Writes public/sitemap.xml from the catalogue
│  └─ fitment-reshoot/            Pipeline for the client fitment studio re-shoots
├─ components/ui/                 Button, input, label, icons, global footer
└─ src/
   ├─ App.tsx                     Providers, route switch, lazy-loaded pages, page metadata
   ├─ config/site.ts              Business identity and contact channels
   ├─ data/catalogue.ts           Types, 14 seed wheels, store products, fitment tree, helpers
   ├─ data/customWheels.json      Inventory overrides and additions
   ├─ data/studioFinishes.ts      Paint settings per finish for the 3D studio
   ├─ data/clientFitments.ts      Client fitment gallery data
   ├─ store/                      Zustand store persisted to localStorage
   ├─ context/FirebaseContext.tsx Auth, profile and garage data
   ├─ utils/router.tsx            pushState router and crawlable <Link>
   ├─ utils/seo.ts                Per-route metadata, structured data, sitemap paths
   ├─ utils/wheelStudioParts.ts   Part classification and camera maths for the studio
   ├─ utils/wheelBuilder.ts       Builds a wheel and store product from a short input
   └─ components/
      ├─ brand/                   Home, catalogue, wheel page, Sixnine, fitments, dealer, account, privacy
      ├─ store/                   Fitment finder, collection grid, product page
      ├─ admin/                   Admin uploader
      ├─ shared/                  Interest request form, skeletons
      └─ visuals/                 WheelStudio (3D), WheelStage
```

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

Two record types live in `src/data/catalogue.ts`:

- **`BrandWheelItem`**: a wheel as shown on the brand site. Key fields: `slug`, `model`, `modelCode`, `finishName`, `priceZAR`, `sizesAvailable`, `compatibleCars`, `technicalSpecSheet`, `stockStatus`, `stockQuantitySets`, `images` (exactly three), `availableFinishes`, `modelUrl`, optional `rearModelUrl`, and `compatibleStoreProductSlug`.
- **`StoreProductItem`**: a sellable set as shown in the store. Key fields: `slug`, `wheelSlug`, `make`, `model`, `yearRange`, `priceZAR`, optional `originalPriceZAR` (shown as a sale when higher), `technicalSpecs`, optional `modelUrl`.

The stock sheet is the single source of truth for what the site sells. Its fourteen rows are seeded as `INVENTORY_SEEDS`; `BRAND_WHEELS` (the catalogue) and `STORE_PRODUCTS` (one sellable set per row, slug `bmw-m3-<wheel-slug>`) are both generated from those seeds, so a wheel cannot appear in the store without being on the sheet. `src/data/customWheels.json` is merged on top by slug to attach real photography and 3D models to sheet wheels; the test suite fails if it introduces a wheel that is not on the sheet. Only the M3 (G80) fitment node carries in-stock sets, because that is the only car the sheet lists the wheels as available for; every other model line, including M2, M4 and M5, resolves to an enquiry-only collection.

**Pricing.** Prices are whole Rand in `priceZAR`. `formatZAR()` is the only formatter. There is no currency conversion.

## Adding or changing a wheel

1. **Choose a slug**: lowercase model code plus finish, for example `fsa003-pure-bronze`. It becomes the URL and the image folder.
2. **Add photos** as three square WebP files (2000×2000 recommended, under 400 KB each, consistent background and framing):

   ```
   public/images/wheels/fsa003-pure-bronze/front.webp
   public/images/wheels/fsa003-pure-bronze/hero.webp
   public/images/wheels/fsa003-pure-bronze/profile.webp
   ```

3. **Add the record** to `brandWheels` in `src/data/customWheels.json`. Copy an existing entry and change the slug, names, price, sizes, finishes, spec sheet, stock and image paths. Reference images as `/images/wheels/<slug>/front.webp` (leading slash, no `public/`).
4. **Add the 3D model** (see below) by setting `modelUrl`.
5. **Store product**: nothing to do. Each seed row generates its store product at `/store/products/bmw-m3-<slug>` and lists it in the M3 collection. A wheel must be added to `INVENTORY_SEEDS` (the stock sheet) before anything else; leave `storeProducts` in `customWheels.json` empty.
6. Run `bun run lint`, `bun run test` and `bun run dev`, check `/wheels/<slug>` and `/#catalogue`, then open a pull request.

The CLI can draft an entry:

```bash
bun run add-wheel -- --name "TYPE 60" --price 75000 --model M3 --finish satin-black \
  --image /images/wheels/type-60/front.webp --glb /models/wheels/type-60.glb
bun run add-wheel -- --list
bun run add-wheel -- --remove type-60
```

The admin page at `/admin` is a local preview tool: wheels created there are stored only in that browser's localStorage and are not published.

## 3D wheel studio

A wheel or product with a `modelUrl` opens in the studio (`src/components/visuals/WheelStudio.tsx`, mounted through `WheelStage.tsx`). Three.js is downloaded only on pages that show a model. If a model fails to load, the studio shows a message with a retry button.

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

`public/models/wheels/sample-reference-rim.glb` is a low-poly test asset with the correct axes and names. It is not a real product.

## Search and sharing

All search metadata is produced by `src/utils/seo.ts` and applied on every route change.

- **Titles and descriptions** per route, with titles capped at 60 characters.
- **Canonical URLs** always on `https://forgedcustomwheels.com`.
- **Link previews**: Open Graph and Twitter tags on every route, plus static tags in `index.html` for crawlers that do not run JavaScript.
- **Structured data**: `Organization` and `WebSite` on the home page; `Product` with the Rand price and stock status on wheel pages.
- **Sitemap**: `public/sitemap.xml` is regenerated from the catalogue on every build and lists only indexable, canonical pages.
- **Noindex**: account, admin, preview and unknown-slug pages. `public/robots.txt` keeps crawlers out of account and admin paths.
- **Crawlable navigation**: header, footer and catalogue links are real anchors (`Link` in `src/utils/router.tsx`).

## Business details and contact channels

`src/config/site.ts` is the single source of truth for the business name, domain, address, WhatsApp, phone, email and social links.

A value left empty is never shown: the related button falls back to the enquiry form and the icon or address line is hidden. Fill a value in only once it is confirmed.

**Content rule.** Public copy states only what the business can evidence. Do not add certifications, warranty terms, delivery promises, response times, load ratings or dealer status without a source from the owner.

## Lead delivery (n8n)

Every call to action posts to one n8n webhook; the site itself has no backend.

| Form | Where | Lead `type` |
| --- | --- | --- |
| Interest request modal (every "Register interest" / "Enquire" button) | `src/components/shared/GlobalOverlays.tsx` | `interest` |
| Dealer application | `src/components/brand/DealerApplicationPage.tsx` | `dealer` |
| Allocation-list sign-up | product page footer in `src/components/store/TechnicalProductView.tsx` | `newsletter` |

`src/utils/leads.ts` builds the payload (fields, the page it came from, a timestamp, consent and a honeypot), POSTs it as JSON and shows the visitor the reference n8n returns. If the webhook cannot be reached the form still completes with a locally generated reference and tells the visitor to email the business, so nothing is silently lost on the visitor's side.

The workflow **FORGED · Website Leads** (production URL `https://novahavensai.app.n8n.cloud/webhook/forged-website-lead`) does the rest:

1. **Normalize & Validate** (Code node): rejects unknown types, bad emails and filled honeypots with HTTP 400, otherwise issues a `FORGED-INT-`, `FORGED-DLR-` or `FORGED-NEWS-` reference and builds the emails. The inbox that receives leads and the reply-to address live in the `CONFIG` block at the top of this node; change them there.
2. **Log lead**: inserts the raw submission into the n8n data table **FORGED Website Leads** (one row per lead, with `status` for triage).
3. **Respond: accepted**: answers the browser with `{ ok: true, reference }`.
4. **Email the team**: a dark-themed summary of the lead, reply-to set to the visitor.
5. **Confirm to visitor**: a receipt for interest requests and dealer applications, a welcome note for allocation-list sign-ups.

Emails go out through the Gmail credential attached to the workflow. To point a deployment at a different workflow (for example the test URL while developing), set `VITE_LEADS_WEBHOOK_URL`; otherwise `SITE.leadsWebhookUrl` in `src/config/site.ts` is used.

## Accounts and Firebase

Client accounts use Firebase Authentication (Google provider) and Firestore:

- `users/{uid}`: the client's profile and primary vehicle (`UserProfile` in `firebase-blueprint.json`).
- `users/{uid}/vehicles/{vehicleId}`: garage vehicles (`UserVehicle`).

`firestore.rules` denies everything by default and allows owner-only access with a verified email, exact key sets, bounded string sizes, enum allow-lists, server timestamps and immutable identity fields. `security_spec.md` documents the invariants and the adversarial payloads each rule rejects.

```bash
firebase deploy --only firestore:rules
```

`firebase-applet-config.json` holds the public web configuration for the Firebase project. To point the site at another project, replace the values in that file and redeploy the rules there.

## Testing

`bun run test` runs five suites with `node:test`:

| Suite | Covers |
| --- | --- |
| `src/data/catalogue.test.ts` | Inventory, fitment tree, pricing, wheel builder, and that every listed wheel has a 3D model file that exists |
| `src/data/clientFitments.test.ts` | Client fitment gallery data |
| `src/utils/wheelStudioParts.test.ts` | Studio part classification, exploded-view offsets, camera distance |
| `src/utils/seo.test.ts` | Per-route metadata, canonical URLs, structured data, share images, sitemap |
| `firestore.rules.test.ts` | Structure of the Firestore security rules |

There are no browser-level tests. Check 3D and layout changes by hand on a phone-sized viewport before merging.

## Deployment

`npm run build` (or `bun run build`) produces a static single-page app in `dist/`. Any static host works, provided every path that is not a real file is rewritten to `index.html`. The repository ships ready-made configuration for two hosts:

| Host | Config file | How to deploy |
| --- | --- | --- |
| **Render** (static site) | `render.yaml` | Render dashboard → New → Blueprint → select this repository |
| **Vercel** | `vercel.json` | Vercel dashboard → Add New → Project → import this repository |

Both configurations install with `npm install --legacy-peer-deps`, run `npm run build`, publish `dist/`, apply the single-page rewrite, and cache fingerprinted assets for a year and models and images for a day. Every push to `main` redeploys.

After the first deploy, add `forgedcustomwheels.com` as a custom domain in the host's dashboard and point the DNS records it gives you at the domain registrar. Canonical URLs and the sitemap already use that domain.

Vercel's free Hobby plan is for non-commercial use only, so a business site needs Vercel Pro. Render's static sites are free to deploy; check the bandwidth included with the workspace plan against traffic, since each 3D model is 3–4 MB.

For Firebase Hosting instead:

```json
{ "hosting": { "public": "dist", "rewrites": [{ "source": "**", "destination": "/index.html" }] } }
```

Build chunks are split per vendor (`react`, `motion`, `three`, `firebase`, `lucide`) and per route.

## Known limitations and roadmap

| Area | Today | Planned |
| --- | --- | --- |
| **Lead delivery** | Leads reach the team by email through n8n (see [Lead delivery](#lead-delivery-n8n)). The inbox is set inside the n8n workflow, and there is no CRM or WhatsApp hand-off yet. | Route leads into the CRM and WhatsApp from the same workflow |
| **Contact channels** | Address, WhatsApp, phone and social links are empty in `src/config/site.ts`, so those elements are hidden | Fill in once confirmed |
| **3D accuracy** | Five designs are traced from photos with simplified surfaces | Replace with scans of the physical wheels |
| **Photography** | Six listings have no product photos (FSA001, FSA002 Hyper Black and Polished Face, FSA003 Silver, FSA004 Hyper Black and Gloss Black) | Shoot and add |
| **Link previews** | The app is client-rendered, so chat apps show the home title and image for every URL | Prerender or server-render |
| **Unknown URLs** | Render the home page with HTTP 200 | Not-found page and host configuration |
| **Store URLs** | Some product slugs are legacy names that do not match the product | Rename with redirects |
| **Admin publishing** | The uploader stores wheels locally; publishing is a data-file change and rebuild | Firebase-backed catalogue with authenticated admin writes |
| **Partners section** | Renders nothing until logo assets are supplied | Add logos |

## Contributing

1. Branch from `main`.
2. Keep changes small and focused; update tests with the behaviour you change.
3. Run `bun run lint`, `bun run test` and `bun run build`.
4. Open a pull request against `main` describing what changed and how it was checked.
5. Follow the content rule above for anything customer-facing.

## Licence

Proprietary. Copyright © 2026 FORGED Custom Wheels. All rights reserved. See [LICENSE](LICENSE).

This repository is public for deployment and collaboration only. No permission is granted to use, copy, modify or distribute its contents without prior written consent.
