# FORGED Custom Wheels

Brand showcase and technical fitment storefront for **FORGED Custom Wheels**, a South African supplier of forged alloy wheel sets for BMW M cars. The site presents the in-stock wheel inventory, lets a visitor find wheels for their BMW model, inspect each wheel in photography and a 360° 3D studio, and submit an interest request. There is no online checkout; every call to action leads to an enquiry.

Built with React 19, TypeScript, Vite 8, Tailwind CSS v4, Three.js, Zustand and Firebase.

---

## Contents

1. [Features](#features)
2. [Routes](#routes)
3. [Getting started](#getting-started)
4. [Project structure](#project-structure)
5. [Catalogue data model](#catalogue-data-model)
6. [Adding a wheel](#adding-a-wheel)
7. [3D models](#3d-models)
8. [Pricing](#pricing)
9. [Accounts and Firebase](#accounts-and-firebase)
10. [Scripts](#scripts)
11. [Deployment](#deployment)
12. [Status and roadmap](#status-and-roadmap)
13. [License](#license)

---

## Features

- **Editorial brand site** with a filterable wheel catalogue, a three-angle lightbox gallery with zoom and pan, client fitment galleries, a dealer application form and a POPIA-aligned privacy policy.
- **Vehicle fitment finder**: Make → Model → Year → Part, resolving to a filtered collection of wheel sets with sale and diameter filters and price sorting.
- **Technical product pages** with a ten-row specification table, finish selector, four-angle gallery and an interest request form in place of a cart.
- **3D wheel studio** (Three.js) on every wheel and product page. A wheel with a registered `.glb` opens in the wheel studio: a light product-photography stage with physically based paint finishes, fixed camera views, an exploded view, a brake clearance check when the model includes brake meshes, and a Front / Rear switch for staggered sets. A wheel with no model yet has no 3D stage: its pages lead with photography until a model is added.
- **Client accounts** via Google sign-in, with a saved profile and a personal garage of vehicles stored in Firestore under strict owner-only security rules. A saved preferred finish pre-selects the finish on wheel pages.
- **Per-page search metadata**: every route gets its own title, description, canonical URL and link-preview tags, and wheel pages carry schema.org `Product` data with the Rand price and stock status (`src/utils/seo.ts`). Account, admin, preview and unknown-slug pages are marked noindex; `public/robots.txt` keeps crawlers out of them.
- **Rand pricing** throughout, formatted by a single helper and shown per set of four.
- **Catalogue tooling**: a JSON data file for inventory, a CLI to generate entries, and a passcode-gated admin uploader for local previews.

## Routes

Routing is client-side (`src/utils/router.tsx`). The host must rewrite all paths to `index.html`.

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `BrandHomePage` | Hero, industry partners, wheel catalogue (`#catalogue`), South African client fitments |
| `/wheels/:slug` | `WheelShowcasePDP` | Wheel page: 3D studio or three-angle photography, finish swatches, enquire |
| `/studio/:slug` | `StudioPreviewPage` | Unlisted, noindex 3D studio preview for a modelled wheel that is not in the catalogue yet (currently `stf399`) |
| `/client-fitments` | `ClientFitmentsPage` | Bento gallery of client commissions, two photos each |
| `/dealer-application` | `DealerApplicationPage` | Trade partner application form |
| `/account`, `/garage` | `AccountGaragePage` | Google sign-in, profile, garage vehicles |
| `/store` | `VehicleFitmentWidget` | Fitment finder and featured collections |
| `/store/collections/:slug` | `FitmentCollectionView` | Filtered product grid for a BMW model |
| `/store/products/:slug` | `TechnicalProductView` | Technical product page with 3D studio and interest request |
| `/admin`, `/admin/wheels` | `AdminWheelUploader` | Passcode-gated wheel uploader (local preview only) |
| `/privacy-policy` | `PrivacyPolicyPage` | Data governance and cookie disclosure |

## Getting started

Requirements: [Bun](https://bun.sh) 1.x (the committed lockfile is `bun.lock`) or Node 22+. A plain `npm install` currently fails on an esbuild peer-dependency conflict; use Bun, or `npm install --legacy-peer-deps`.

```bash
bun install
bun run dev        # http://localhost:3000
```

Other checks:

```bash
bun run lint       # TypeScript type-check (tsc --noEmit)
bun run test       # data and security-rules tests (node:test via tsx)
bun run build      # production bundle in dist/
bun run preview    # serve the production bundle
```

No environment variables are required for local development. Firebase configuration is read from `firebase-applet-config.json` (see [Accounts and Firebase](#accounts-and-firebase)).

## Project structure

```
.
├─ index.html                     Single-page shell
├─ firebase-applet-config.json    Firebase project config (public web keys)
├─ firebase-blueprint.json        JSON Schema for UserProfile and UserVehicle
├─ firestore.rules                Firestore security rules
├─ firestore.rules.test.ts        Structural tests for the rules
├─ security_spec.md               Rules invariants and adversarial payloads
├─ public/
│  ├─ images/wheels/<slug>/       front.webp · hero.webp · profile.webp per wheel
│  ├─ assets/aistudio/            Client fitment car photography
│  └─ models/wheels/              Per-wheel .glb models (see 3D models)
├─ scripts/add-wheel.ts           CLI that writes src/data/customWheels.json
├─ components/ui/                 Button, input, label, icons, global footer
└─ src/
   ├─ App.tsx                     Providers, route switch, lazy-loaded pages
   ├─ data/kahnData.ts            Types, 14 seed wheels, 8 store products, fitment tree, helpers
   ├─ data/customWheels.json      Inventory overrides and additions (edit this to add wheels)
   ├─ store/useKahnStore.ts       Zustand store persisted to localStorage
   ├─ context/FirebaseContext.tsx Auth, profile and garage data
   ├─ utils/router.tsx            pushState router
   ├─ utils/wheelBuilder.ts       Builds a wheel + store product from a short input
   └─ components/
      ├─ brand/                   Home, catalogue, lightbox, wheel page, fitments, dealer, account, privacy
      ├─ store/                   Fitment finder, collection grid, product page, store header
      ├─ admin/                   Admin uploader
      ├─ shared/                  Interest request form, chat overlay, skeletons
      └─ visuals/                 WheelStudio (3D), WheelStage, SVG rim, vehicle silhouette
```

## Catalogue data model

Two record types live in `src/data/kahnData.ts`:

- **`BrandWheelItem`**: a wheel as shown on the brand site. Key fields: `slug`, `model`, `modelCode`, `finishName`, `priceZAR`, `sizesAvailable`, `compatibleCars`, `technicalSpecSheet`, `stockStatus`, `stockQuantitySets`, `images` (exactly three), `imageLabels`, `availableFinishes`, optional `modelUrl`, and `compatibleStoreProductSlug` linking to a store product.
- **`StoreProductItem`**: a sellable set as shown in the store. Key fields: `slug`, `wheelSlug`, `make`, `model`, `yearRange`, `priceZAR`, optional `originalPriceZAR` (shown as a sale when higher), `technicalSpecs` (sizes, bolt pattern, part number, load rating, centre bore), optional `modelUrl`.

Fourteen in-stock wheels are seeded in `kahnData.ts`. `src/data/customWheels.json` is merged on top by slug: an entry with a seed's slug overrides it (this is how real photography is attached), and an entry with a new slug is added. `VEHICLE_FITMENT_TREE` has a node for every BMW M model line on the stock sheet; `BMW_M_MODEL_OPTIONS` holds the sheet's "Cars that this is available for" names verbatim and each belongs to exactly one node's `variants`. A node's `productSlugs` are the store products the fitment finder lists for it. The M3, M2, M4 and M5 nodes carry the in-stock sets; every other model line resolves to an enquiry-only collection until sets are allocated to it.

## Adding a wheel

1. **Choose a slug**: lowercase model code plus finish, e.g. `fsa003-pure-bronze`. It becomes the URL, the image folder and the model file name.
2. **Add photos** as three square WebP files (2000×2000 recommended, under 400 KB each, consistent background and framing):

   ```
   public/images/wheels/fsa003-pure-bronze/front.webp
   public/images/wheels/fsa003-pure-bronze/hero.webp
   public/images/wheels/fsa003-pure-bronze/profile.webp
   ```

3. **Add the record** to `brandWheels` in `src/data/customWheels.json`. Copy an existing entry and change the slug, names, price, sizes, finishes, spec sheet, stock, image paths and labels. Reference images as `/images/wheels/<slug>/front.webp` (leading slash, no `public/`).
4. **Store product**: if the wheel needs its own part number and sizes, add an entry to `storeProducts` in the same file (use a `STORE_PRODUCTS` entry in `kahnData.ts` as a template), point the wheel's `compatibleStoreProductSlug` at it, and add its slug to the right model's `productSlugs` in `VEHICLE_FITMENT_TREE`.
5. Run `bun run lint` and `bun run dev`, check `/wheels/<slug>` and `/#catalogue`, then commit and deploy.

The CLI can draft an entry for you:

```bash
bun run add-wheel -- --name "TYPE 60" --price 75000 --model M3 --finish satin-black \
  --image /images/wheels/type-60/front.webp --glb /models/wheels/type-60.glb
bun run add-wheel -- --list
bun run add-wheel -- --remove type-60
```

The admin page at `/admin` is a local preview tool: wheels created there are stored only in that browser's localStorage and are not published.

## 3D models

A wheel or product with a `modelUrl` opens in the wheel studio (`src/components/visuals/WheelStudio.tsx`, mounted through `WheelStage.tsx`). Without one there is no 3D stage: the wheel page opens on its three-angle photography and the product page leads with the product photo. three.js is only downloaded on pages that show a model.

A staggered set can add `"rearModelUrl"` for the rear size; the studio then shows a Front / Rear switch. Paint settings per finish live in `src/data/studioFinishes.ts`.

1. Export the rim as `public/models/wheels/<slug>.glb`.
2. Add `"modelUrl": "/models/wheels/<slug>.glb"` to the wheel (or product) record.
3. Rebuild.

Model requirements (full detail in `public/models/wheels/README.md`):

- Binary glTF 2.0 with embedded PBR metallic-roughness textures; bare rim only.
- Axle bore centre at the origin, face toward +Z, up +Y, spin around Z, real metres.
- Sub-meshes named `Rim_Barrel`, `Rim_Face_Spokes`, `Hardware_Bolts`, `Center_Cap`. The barrel, face and cap take the selected finish; bolts keep their own material.
- Optional `Brake_Rotor` and `Brake_Caliper` meshes enable the studio's brake check. They stay hidden until the visitor turns it on.
- Keep under roughly 150k triangles for mobile.

`public/models/wheels/sample-reference-rim.glb` is a low-poly test asset with the correct axes and names. It is not a real product.

## Pricing

All prices are South African Rand for a complete set of four wheels and are stored as whole Rand in `priceZAR`. `formatZAR()` in `src/data/kahnData.ts` is the only formatter and renders `R 75,000` or `R 75,000.00`. There is no currency conversion.

## Accounts and Firebase

Client accounts use Firebase Authentication (Google provider) and Firestore:

- `users/{uid}`: the client's profile and primary vehicle (`UserProfile` in `firebase-blueprint.json`).
- `users/{uid}/vehicles/{vehicleId}`: garage vehicles (`UserVehicle`).

`firestore.rules` denies everything by default and allows owner-only access with a verified email, exact key sets, bounded string sizes, enum allow-lists, server timestamps and immutable identity fields. `security_spec.md` documents the invariants and the adversarial payloads each rule rejects. Deploy rules with the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

`firebase-applet-config.json` holds the public web configuration for the Firebase project. To point the site at your own project, replace the values in that file and redeploy the rules there.

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Vite dev server on port 3000 |
| `bun run build` | Production build to `dist/` |
| `bun run preview` | Serve `dist/` locally |
| `bun run lint` | `tsc --noEmit` |
| `bun run test` | `src/data/kahnData.test.ts` and `firestore.rules.test.ts` with `node:test` |
| `bun run add-wheel` | Catalogue CLI (`--help` for options) |
| `bun run clean` | Remove `dist/` |

## Deployment

The build output in `dist/` is a static single-page app. Any static host works provided every path is rewritten to `index.html`; for Firebase Hosting:

```json
{ "hosting": { "public": "dist", "rewrites": [{ "source": "**", "destination": "/index.html" }] } }
```

Production build chunks are split per vendor (`react`, `motion`, `three`, `firebase`, `lucide`) and per route.

## Status and roadmap

The catalogue, fitment finder, product pages, 3D studio and client accounts are working. The following are not yet connected and are tracked for follow-up:

- **Lead delivery**: interest requests, dealer applications and newsletter sign-ups are currently stored only in the visitor's browser. Planned: write to Firestore and fan out through n8n to email, Google Sheets, WhatsApp and the CRM.
- **Contact buttons**: the WhatsApp, Instagram and phone buttons on product pages do not yet open external channels.
- **Admin publishing**: the admin uploader stores wheels locally; publishing goes through `customWheels.json` and a rebuild. Planned: Firebase-backed catalogue with authenticated admin writes.
- **Industry partners**: the partner section renders placeholders pending logo assets.
- **Legacy naming**: some internal identifiers (`useKahnStore`, `kahnData.ts`, the persisted store key) and the AI Studio metadata still carry template-era names.

## License

Proprietary. Copyright © 2026 FORGED Custom Wheels. All rights reserved. See [LICENSE](LICENSE). This repository is public for deployment and collaboration purposes only; no permission is granted to use, copy, modify or distribute its contents without prior written consent.
