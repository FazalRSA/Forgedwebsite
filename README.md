# FORGED Custom Wheels

The website for **FORGED Custom Wheels**, a South African supplier of forged alloy wheel sets for BMW M cars.

It shows the wheels that are in stock, each in photography and an interactive 3D viewer, shows past customer installs, and takes enquiries. There is no online checkout: every call to action opens the enquiry form, which sends the enquiry to the business through n8n and, with a WhatsApp number configured, then opens WhatsApp with the message typed in.

**Stock rule.** A wheel appears on the site only when its `stockStatus` is `In Stock` and `stockQuantitySets` is above zero. Each listing is one design in one finish; the other in-stock finishes of a design are separate listings. Colours a design has no stock of are offered on its wheel page as made to order, always with the notice that a lead time of 3 months applies.

| | |
| --- | --- |
| **Live site** | [forged-custom-wheels-gu3l.onrender.com](https://forged-custom-wheels-gu3l.onrender.com) (Render, redeploys on every push to `main`) |
| **Production domain** | `forgedsa.co.za` (`SITE.domain` in `src/config/site.ts`), served from `www.forgedsa.co.za` (`SITE.host`). The bare domain redirects there with an HTTP 301, so canonical URLs, the sitemap and robots.txt all name the `www` host |
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
    - [The blog](#the-blog)
    - [Search Console and visit statistics](#search-console-and-visit-statistics)
    - [For AI assistants and coding agents](#for-ai-assistants-and-coding-agents)
    - [See it on my car (AI preview)](#see-it-on-my-car-ai-preview)
12. [Google Tag Manager and Google Analytics](#google-tag-manager-and-google-analytics)
    - [How it works](#how-it-works)
    - [Cookie consent (opt-in)](#cookie-consent-opt-in)
    - [What is measured](#what-is-measured)
    - [How often the data arrives](#how-often-the-data-arrives)
    - [Setting up and checking](#setting-up-and-checking)
    - [Keeping the privacy notice in step](#keeping-the-privacy-notice-in-step)
13. [Business details and contact channels](#business-details-and-contact-channels)
14. [Customer accounts](#customer-accounts)
    - [Firebase (superseded)](#firebase-superseded)
15. [Testing](#testing)
16. [Deployment](#deployment)
17. [Known limitations and roadmap](#known-limitations-and-roadmap)
18. [Contributing](#contributing)
19. [Licence](#licence)

---

## What the site does

Six pages, plus the privacy notice. The shop sells two brands, and the site is organised by them: **Forged SA** (the shop's own designs, every design code starting `FSA`) and **Sixnine Wheels** (sold as an official dealer, every code starting `FF`). `brandOfWheel` and `WHEEL_BRANDS` in `src/data/catalogue.ts` hold that rule and each brand's name, page and logo; a test fails if a listing's code is neither, so a new design is never left without a brand.

- **Home (`/`).** Opens with the hero over the brand film: the headline "Forged Custom Wheels. Turning dreams into reality.", the owner's installs figure as a pill ("Over 80 successful wheels installed this year.", from `SITE.installsThisYear`, shown only during the year it counts), a white "See wheels in stock" button and a glass "See our installs" button, then "Our Industry Partners": the Sixnine Wheels (official dealer, linked to its page) and BMW logos as glass chips (`#partners`, from `src/data/partners.ts`). Then what is in stock, grouped by brand (Forged SA first, then Sixnine). Each group opens with the brand's logo and name, what the shop is to it ("Our own brand", "Official dealer"), how many designs and sets are in stock, and a link to the brand's page. Under it, one large dark card per wheel design (rows of three and two on wide screens, a lone last design full width; two columns on tablets, one on phones). Each card shows the design's wheel cut out on the dark card, its name, how many finishes are in stock, the lowest price per set of four, the finishes and sizes, all worked out from the catalogue (`src/utils/designCards.ts`); it links to the design's first photographed listing, whose page offers the other finishes. Then customer installs, Google reviews, the blog teaser and "Ask AI about us". Each section opens with an eyebrow label over its heading.
- **Wheel page (`/wheels/:slug`).** One in-stock listing: photos, price per set of four, sizes and specification. The gallery works like SIXNINE's product page: arrows, an `n / total` counter and a row of thumbnails, running through this listing's cut-out and photos and then the same design's other finishes in stock, each of those labelled with its finish and linked to its own page. A Sixnine listing also shows a **Technical data** table, one column per size: Sixnine's published wheel size, offset, bolt pattern, load rating, centre bore, concavity and weight for the sizes the set is. `sixnineSizesForListing` (`src/utils/listingSpecs.ts`) finds them from the listing's own diameters, offsets and bolt pattern, and leaves out any diameter that does not match exactly one Sixnine size. Colours are **photoreal swatches** (`ColourSwatches.tsx`): each shows a studio render of this design's wheel in that colour (`public/images/wheels/finishes/`, listed in `src/data/finishStills.json`); the same picture is on the 3D viewer's finish chips. A drawn paint ball stands in for a design or colour with no render yet. They come in two groups: the design's finishes that are **in stock** (the one on this page shows on the 3D wheel when tapped; the others open their own listing), and its **other colours, to order**, always shown with the notice that a lead time of 3 months applies. Tapping a to-order swatch opens the 3D view in that colour and offers an "Ask about" button. The 3D viewer loads only when the visitor taps "View in 3D" (or a colour swatch). A "See it on my car" button (on while `carPreviewUrl` is set, as it is today) lets a visitor choose a photo of their car and see an AI-made impression of the wheel on it (see [See it on my car](#see-it-on-my-car-ai-preview)). The enquiry button opens the enquiry form with the design, finish and sizes filled in; a to-order colour prefills the colour and the lead time. The form logs the enquiry through n8n and then opens WhatsApp (see [Lead delivery](#lead-delivery-n8n)).
- **Installs (`/installs`).** Customer cars the shop has fitted (BMW M cars and one Audi RS3; no install is linked to a catalogue wheel). Each install opens to three photos: two studio re-shoots made from the customer's own photo, then that photo itself with the number plate pixelated.
- **Forged SA page (`/forged-sa-wheels`, "Forged SA" in the menu).** The shop's own brand: every FSA set in stock, and a fitment summary. It says only what the owner has confirmed: the FSA designs are Forged SA's own, and they are forged. Every number on it is worked out from the catalogue.
- **Design names.** Visitors see Sixnine's names for its series: FF-ONE and FF-THREE, not the short codes FF-1 and FF-3 (`designName` in `src/data/catalogue.ts`). The codes stay the key for slugs, models, tests and the structured-data SKU.
- **Sixnine dealer page (`/sixnine-wheels`, "Sixnine" in the menu).** FORGED as an official Sixnine Wheels dealer: what Sixnine Wheels is (from sixnine-wheels.com, with a source link) and every Sixnine set in stock. Sixnine's range is on the series pages below, reached from the mega menu. A wheel is Sixnine when its design code starts with `FF` (`isSixnineWheel` in `src/data/catalogue.ts`), so a new FF design appears on the page by itself. Every number on it is worked out from the catalogue; the brand text is in `SixnineDealerPage.tsx`. Under the stock it has SIXNINE's two home-page card rows: **New at Sixnine** (what Sixnine has on pre-order, from `sixnineRange.json`: a whole series on pre-order, such as the EVO-TWO, or a single pre-order size named after its car, such as the FF-THREE for the Audi RS5 B10) and **Find your design** (one card per series, linking to its series page). Both use `ShowcaseCard` (`SixnineShowcase.tsx`, data in `src/utils/sixnineShowcase.ts`). The two brand pages share their opening, stock grid, fitment summary and enquiry row (`BrandSections.tsx`, with the fitment facts from `src/utils/brandFitment.ts`), so they stay alike.
- **Blog (`/blog`).** Nineteen guides in four content pillars (forged wheel basics, BMW M wheel fitment, buying in South Africa, wheel care), at `/blog`, `/blog/:pillar` and `/blog/:pillar/:post`. Every price, size, offset, bolt pattern, lead time and stock count in an article is read from the catalogue, never typed (see [The blog](#the-blog)).
- **Contact (`/contact`).** WhatsApp, phone, address and areas served; any channel not set in `src/config/site.ts` is hidden.
- **Account (`/account`).** The customer's account, shared with the FORGEDSA configurator: Continue with Google, profile, saved builds, the email choice, and download or delete of their data (see [Customer accounts](#customer-accounts)). Private: noindex, not in the sitemap, linked only from the footer.
- **Privacy notice (`/privacy-policy`).** Describes what the site does today: the optional account (Google sign-in, shared with the configurator), contact by WhatsApp or phone, local storage for an unsent enquiry, the cookie choice and the sign-in session, and Google Analytics (loaded through Google Tag Manager), whose two cookies are set only after a visitor accepts the cookie banner. The Google Analytics, cookie and recipient text appears only while `googleTagManagerId` is set in `src/config/site.ts`.
- **Sixnine series pages (`/sixnine-wheels/:series`).** One page per Sixnine series: `ff-one`, `ff-two`, `ff-three`, `evo-one`, `evo-two`, `oem-plus-one`. Each is built like a SIXNINE series landing page:
  - a centred hero with the facts (sizes, diameters, bolt patterns, finishes, sets in stock here);
  - the finishes with Sixnine's names and on-screen swatches;
  - the shop's own sets of that series in stock, as product cards in Rand;
  - every size Sixnine lists, as cards with offset, load rating, centre bore, concavity and weight, filterable by bolt pattern, each with an "Ask about this size" button;
  - the other series, then an enquiry row.

  The sizes come from `src/data/sixnineRange.json` (see [The Sixnine range data](#the-sixnine-range-data)). Stock and prices come only from the catalogue: FF-1 listings are the FF-ONE, FF-3 the FF-THREE (`sixnineSeriesOfWheel`). The hero, the series cards and the mega menu show Sixnine's own three-quarter render of each series (`public/images/sixnine/renders/`; the owner confirmed on 23 November 2026 that the shop, as an official dealer, may use them). Stock cards and wheel pages keep the shop's own photos.
- **Navigation.** The header reads Forged SA · Sixnine · Installs · Blog · Contact, with the Enquire button beside it. The brand links open the brand pages, and a wheel page marks its own brand as the current section. Beside "Sixnine" a chevron button opens the mega menu: the dealer page on the left, a tile per series on the right (the shop's photo or the series name, construction and diameters, and "In stock" when the shop has it). It is a disclosure (a link plus a button with `aria-expanded`), not an ARIA menu. It opens on click, or on hover with a mouse, and closes on Escape (focus returns to the button), on a click outside, when focus leaves it, or on a new page. In the phone menu, the same button under "Sixnine" lists the series. From 1024 px the links sit in the header; below that they are behind the menu button (five links and the button do not fit beside the logo at tablet width). On a wheel page, the line under the name names the brand and links to its page, the back link returns to the brand page, and the breadcrumb in the structured data is Home › brand › wheel. The footer links the wheels in stock, both brand pages, installs, the blog, contact and the privacy notice.
- **Search-ready pages.** Per-route titles, descriptions, canonical URLs, link-preview tags, structured data (each wheel's Product names its brand: Forged SA or Sixnine) and a generated sitemap.
- **AI-ready.** `/llms.txt` gives AI assistants the stock list, prices and contact details as plain text (see [For AI assistants and coding agents](#for-ai-assistants-and-coding-agents)).

The 3D viewer is a Three.js studio with physically based paint finishes, fixed camera views (face, 3/4, side, back, top), an exploded view and, for staggered sets with two models, a Front / Rear switch. The centre cap shows the FORGED monogram on FSA designs and the SIXNINE badge on FF designs (`capLogoForDesign` in `catalogue.ts`): the viewer finds the cap by looking down the axle, lays the logo on it and, when a model has an open centre bore, fills it with a cap in the wheel's paint first.

Removed in the simplification: the store and its fitment finder, collections and product pages, and dealer applications. Their old addresses redirect (see [Routes](#routes)). Client accounts came back on 23 November 2026, rebuilt on the configurator's Supabase accounts (see [Customer accounts](#customer-accounts)).

### Where to change what

Every change below is a file edit, then a pull request. Merging to `main` publishes it.

| To do this | Change this | Then |
| --- | --- | --- |
| Mark a set as sold, or change a price, size or stock count | The listing's seed in `INVENTORY_SEEDS`, `src/data/catalogue.ts` | Nothing else. The grid, wheel page, sitemap, `llms.txt` and Sixnine page all read the catalogue |
| Add photos to a listing | Three WebPs in `public/images/wheels/<slug>/` and an entry in `src/data/customWheels.json` | See [Adding or changing a wheel](#adding-or-changing-a-wheel) |
| Add a new listing | `bun run add-wheel` | Same section |
| Add or replace a 3D model | A `.glb` in `public/models/wheels/` and `MODEL_URL_BY_CODE` (or the listing's `modelUrl`) in `catalogue.ts` | [docs/adding-3d-models.md](docs/adding-3d-models.md) and the `add-wheel-model` skill |
| Rebuild all 3D models, or check all listings | `npm run build-wheel-models -- --src-dir <folder>`, then `npm run qa-wheels` | [docs/adding-3d-models.md](docs/adding-3d-models.md#doing-all-the-wheels-at-once) |
| Change how a finish looks in 3D | `src/data/studioFinishes.ts` | Paints are fitted to the real photos (a few designs have their own row in `DESIGN_FINISH_PBR`). After changing one, run `pip install bpy pillow numpy` then `python3 scripts/render-finish-stills.py` to redraw the swatch stills and `finishStills.json`, and check the wheel page in the viewer |
| Change the to-order lead time | `TO_ORDER_LEAD_TIME` in `catalogue.ts` | Nothing else; pages and `llms.txt` read it |
| Change the phone, WhatsApp, address or social links | `src/config/site.ts` | Nothing else; empty values are hidden |
| Switch "See it on my car" on or off | Set `carPreviewUrl` in `src/config/site.ts` (a Worker address to switch on, `''` to switch off). Changing the Worker itself: `worker/car-preview/` | See [See it on my car](#see-it-on-my-car-ai-preview); the privacy notice updates itself |
| Add a tag, or send an event to Google Analytics | In Google Tag Manager, not in code | See [Google Tag Manager and Google Analytics](#google-tag-manager-and-google-analytics); a new kind of tag also needs the privacy notice updated |
| Add or correct a customer install | `scripts/fitment-reshoot/jobs.json`, then the re-shoot scripts | See [Adding or correcting a customer install](#adding-or-correcting-a-customer-install) |
| Add or remove a partner logo | `src/data/partners.ts` and `public/images/partners/` | Owner's confirmation first |
| Add or edit a blog article | `src/data/blogPosts.ts` | See [The blog](#the-blog); `src/data/blog.test.ts` checks it |
| Add a blog content pillar | `BLOG_PILLARS` in `src/data/blog.ts` and `PILLAR_ICONS` in `src/components/blog/BlogCard.tsx` | Add at least three articles to it |
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

No environment variables are needed to run or build the site.

Two things look like setup and are not:

- `.env.example` (`GEMINI_API_KEY`, `APP_URL`) is left over from the Google AI Studio starter the project began as. Nothing in the site reads either value.
- `OPENROUTER_API_KEY` is used only by the install re-shoot scripts in `scripts/fitment-reshoot/`, which run on a developer's machine and never in the build. Set it in your shell's environment; do not put it in a file in the repository.

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Vite dev server on port 3000 |
| `bun run build` | Five steps, in order: regenerate `public/sitemap.xml`, `public/robots.txt`, the blog's RSS feed (`public/blog/feed.xml`) and the page rules in `render.yaml` from the catalogue and `SITE.host`; build to `dist/`; write each page's own HTML file with its title and share image, plus the full text of each blog page for crawlers, and add the Google Tag Manager snippet to every page (`prerender-meta.ts`); write a redirect page for every removed address (`legacy-shells.ts`); write `dist/llms.txt` (`generate-llms.ts`) |
| `bun run preview` | Serves the production build locally |
| `bun run lint` | Type-check with `tsc --noEmit` |
| `bun run test` | First checks that the shared 3D viewer folder was stamped (`wheel-viewer:verify`), then runs the data, design-card, hero film, brand fitment, Sixnine range and page, SEO, redirect, business-details, lead, car-preview (website and Worker), blog, `llms.txt`, 3D-studio and security-rules tests (`node:test` via `tsx`) |
| `bun run add-wheel` | Catalogue CLI (`--help` for options) |
| `bun run qa-wheels` | Opens every in-stock listing at 390 px against a running dev server, takes a picture from each 3D camera view and checks for console errors, failed requests, sideways scroll and a blank stage. Writes a contact sheet to `qa-wheels/`. Needs Playwright with Chromium, which is not a dependency of the site (`npx playwright install chromium`) |
| `bun run build-wheel-models` | Rebuilds every 3D model from the design list in `scripts/wheel-models.json` (`--src-dir <folder>` holds the downloaded source files; `--dry-run` shows what would run). Python 3, run by hand; see [docs/adding-3d-models.md](docs/adding-3d-models.md) |
| `bun run wheel-viewer:stamp` | Records the content hash of `src/wheel-viewer/` in its `VERSION.json`. Run it after any change to that folder |
| `bun run wheel-viewer:verify` | Fails if `src/wheel-viewer/` was edited without a new stamp (also the first step of `bun run test`) |
| `bun run clean` | Removes `dist/` |

Run `lint`, `test` and `build` before every pull request. The repository has no CI, so these local checks are the gate.

`lint` is the TypeScript type check only. `eslint.config.mjs` exists and checks `firestore.rules` alone; no script runs it.

## Routes

Routing is client-side (`src/utils/router.tsx`). Each page in the sitemap also gets its own HTML file at build time, so link previews show that page. The host serves those files for their paths and rewrites every other path to `index.html`.

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `BrandHomePage` | Hero with the brand film, installs figure and industry partners (`#partners`), wheels in stock (`#catalogue`), customer installs, reviews, blog teaser, Ask AI (`#ask-ai`) |
| `/wheels/:slug` | `WheelShowcasePDP` | Wheel page: photos, 3D viewer, price, sizes, in-stock and to-order colours, enquire. A sold or unknown slug shows the 404 page |
| `/blog` | `BlogIndexPage` | The blog hub: every content pillar and the latest guides |
| `/blog/:pillar` | `BlogTopicPage` | One content pillar: the topic explained and every guide in it. An unknown pillar shows the 404 page |
| `/blog/:pillar/:post` | `BlogPostPage` | One article: contents, body, FAQ, guides to read next. An unknown or mis-filed slug shows the 404 page |
| `/installs` | `ClientFitmentsPage` | Customer cars the shop has fitted |
| `/forged-sa-wheels` | `ForgedSaPage` | The shop's own brand: every FSA set in stock, fitment summary |
| `/sixnine-wheels` | `SixnineDealerPage` | Official Sixnine dealer page: about Sixnine Wheels, every FF set in stock |
| `/sixnine-wheels/:series` | `SixnineSeriesPage` | One Sixnine series: facts, finishes, sets in stock here (with a "View in 3D" of the stocked design), every size Sixnine lists. An unknown series shows the 404 page |
| `/contact` | `ContactPage` | WhatsApp, phone, address, areas served |
| `/account` | `AccountPage` | Customer account shared with the configurator. Lazy route, noindex, not in the sitemap |
| `/privacy-policy` | `PrivacyPolicyPage` | Privacy notice (POPIA): what is collected, by whom, and how to make a request |
| `/studio/:slug` | `StudioPreviewPage` | Unlisted, noindex 3D preview (currently `stf399`) |
| `/admin`, `/admin/*` | `AdminWheelUploader` | Unlisted, passcode-gated, local preview only |
| anything else | `NotFoundPage` | Not found, noindex |

**Old addresses** are redirected in the browser by `redirectFor()` in `src/utils/redirects.ts`, using `history.replaceState` so the Back button is not trapped. The build also writes a small redirect page for each of the 44 addresses in `scripts/legacy-pages.json` (`scripts/legacy-shells.ts`), so an old link still lands on the right page when the host serves a file for it. A test checks that every address in that list has a redirect.

| Old address | Goes to |
| --- | --- |
| `/store`, `/store/*`, `/wheels` | `/#catalogue` |
| `/official-dealer-sixnine-wheels*` | `/sixnine-wheels` |
| `/client-fitments`, `/store/client-fitments` | `/installs` |
| `/garage` | `/account` |
| `/dealer-application`, `/store/dealer-application` | `/contact` |

## Project structure

```
.
├─ index.html                     Single-page shell and static share tags
├─ AGENTS.md                      Commands and project rules for AI coding agents
├─ render.yaml · vercel.json      Host configuration (Render is in use)
├─ vite.config.ts                 Build config: the `@` alias (repository root) and vendor chunks
├─ metadata.json · .env.example   Left over from the Google AI Studio starter; the site reads neither
├─ firebase-applet-config.json    Firebase project config (public web keys); superseded, nothing loads it
├─ firebase-blueprint.json        JSON Schema for the old Firestore documents (superseded)
├─ firestore.rules                Firestore security rules (superseded)
├─ firestore.rules.test.ts        Structural tests for the rules
├─ security_spec.md               Rules invariants and adversarial payloads
├─ public/
│  ├─ images/wheels/<slug>/       front.webp · hero.webp · profile.webp per wheel
│  ├─ models/wheels/              .glb models for the 3D viewer, and README.md with the model spec
│  ├─ assets/fitments/<slug>/     front34.webp · side.webp · original.webp per install, each with an 800 px thumbnail
│  ├─ images/partners/            Partner logos (transparent WebP)
│  ├─ brand/                      FORGED monogram and wordmark (SVG)
│  ├─ video/                      The home page hero film: 1280 and 854 px, AV1 and H.264, plus its first frame as posters
│  ├─ favicon.ico · icon.svg · apple-touch-icon.png   Browser and home-screen icons
│  ├─ robots.txt
│  └─ sitemap.xml                 Generated on every build
├─ scripts/
│  ├─ add-wheel.ts                CLI that writes src/data/customWheels.json
│  ├─ generate-sitemap.ts         Writes public/sitemap.xml, public/robots.txt and the page rules in render.yaml
│  ├─ prerender-meta.ts           Bakes each page's title and share image into dist/
│  ├─ legacy-shells.ts            Writes a redirect page for each address in legacy-pages.json
│  ├─ legacy-pages.json           The removed addresses that still get a redirect page
│  ├─ generate-llms.ts            Writes dist/llms.txt
│  ├─ qa-wheels.mjs               Phone-width check of every listing and its 3D views (run by hand, needs Playwright)
│  ├─ build-wheel-models.py       Rebuilds every 3D model from wheel-models.json (run by hand)
│  ├─ wheel-models.json           One entry per wheel design: source file, output .glb and build options
│  ├─ wheel-viewer-sync.mjs       Stamps and verifies src/wheel-viewer/, and copies it to the BMW configurator
│  ├─ add-blog-rules.sh           Adds the blog's rewrite rules to a Render service whose routes are set by hand (needs a Render API key; previews first)
│  ├─ make-wheel-cutouts.py       Makes the transparent wheel cut-outs for the home page's design cards (run by hand)
│  ├─ sixnine-range-from-sheet.py Writes src/data/sixnineRange.json from the owner's Sixnine catalogue sheet (run by hand, needs openpyxl)
│  ├─ make-hero-video.sh          Makes the hero film's web files and posters in public/video/ from one source video (run by hand, needs ffmpeg)
│  ├─ make-wheel-sizes.py         Makes the 800, 400 and 600 px copies of the wheel photos that the srcsets list (run by hand)
│  └─ fitment-reshoot/            Pipeline for the install studio re-shoots (jobs.json, Python scripts, README.md)
├─ docs/adding-3d-models.md       The owner's steps for adding or replacing a wheel's 3D model, and the limits of AI models
├─ docs/installs-pipeline.md      How the Installs gallery is made, with animated diagrams (docs/assets/)
├─ docs/google-tag-manager/       forged-enquiry-events.json: the GTM import that sends the site's enquiry and car-preview events to GA4
├─ docs/blog-seo-plan.md          The blog's keyword map, on-page checklist and how to refine it in Search Console
├─ docs/render-blog-rewrites.md   The 24 blog rewrite rules to paste into a Render service whose routes are set by hand
├─ worker/car-preview/            Cloudflare Worker behind "See it on my car" (not part of the website build): src/handler.ts, its tests, wrangler.toml, dev-server.mjs, README.md
├─ .claude/skills/                Agent skills: add-wheel-model, and the four SIXNINE style skills
├─ components/ui/                 Shared UI primitives (button, input, label, icons)
├─ lib/utils.ts                   `cn()` class-name helper used by those primitives
└─ src/
   ├─ main.tsx · index.css        Entry point; colour and type tokens
   ├─ App.tsx                     Providers, route switch, lazy-loaded pages, page metadata
   ├─ config/site.ts              Business identity and contact channels
   ├─ data/catalogue.ts           Types, the 14 stock listings, in-stock filter, siblings, to-order colours, helpers
   ├─ data/customWheels.json      Photography for stock listings, and listings added by the CLI
   ├─ data/studioFinishes.ts      Paint settings per finish (and per design where needed) for the 3D viewer, fitted to the real photos
   ├─ data/finishStills.ts/.json  The swatch still of each design in each colour (made by scripts/render-finish-stills.py)
   ├─ data/clientFitments.ts      Customer installs data
   ├─ data/partners.ts            Industry partners shown on the home page
   ├─ data/googleReviews.ts       Google reviews for the home page, copied word for word (empty until real ones are added)
   ├─ data/sixnineRange.json      Every size Sixnine lists (see The Sixnine range data)
   ├─ data/sixnineRange.ts        Sixnine's full range, design by design, for the range section on /sixnine-wheels
   ├─ wheel-viewer/               The 3D wheel viewer, shared with the BMW configurator: stage, paint, swatches, part classification (edited only here; see its README.md)
   ├─ store/                      Zustand store (enquiry form, admin preview) in localStorage
   ├─ context/AccountContext.tsx  Customer account provider (Supabase Auth, profile, builds); mounted by the account page only
   ├─ lib/supabase.ts             Supabase client (the configurator's project, PKCE sign-in)
   ├─ utils/accountService.ts     The account's data calls, written against a client passed in (tested with a stub)
   ├─ utils/router.tsx            pushState router and crawlable <Link>
   ├─ utils/lazyWithRetry.ts      React.lazy with retries, for the 3D viewer's code
   ├─ utils/redirects.ts          Old address to new address
   ├─ data/blog.ts                Blog pillars, the post model and the catalogue facts articles quote
   ├─ data/blogPosts.ts           The nineteen articles, and blog path resolution
   ├─ components/blog/            Blog pages, article renderer, cards, FAQ, home teaser, prerendered HTML
   ├─ components/ui/              shadcn-style primitives: button, badge, card, alert, table, accordion, breadcrumb
   ├─ utils/blogSeo.ts            Blog metadata, Article/Breadcrumb/FAQ structured data, sitemap dates, RSS feed
   ├─ utils/seo.ts                Per-route metadata, structured data, sitemap paths
   ├─ utils/llms.ts               Builds llms.txt from the catalogue, installs and site config
   ├─ utils/brandFitment.ts       A brand page's design list and fitment-at-a-glance facts
   ├─ data/sixnineSeries.ts       The Sixnine series and sizes (from sixnineRange.json), their facts, slugs and finish swatches
   ├─ utils/askAi.ts              The "Ask AI about us" links and their question
   ├─ utils/listingSpecs.ts       The Sixnine sizes and figures a stocked Sixnine listing matches
   ├─ utils/sixnineShowcase.ts    Data for the "New at Sixnine" and "Find your design" cards
   ├─ utils/designCards.ts        The home page's design cards, worked out from the in-stock listings
   ├─ utils/heroVideo.ts          The hero film's files and posters, named in one place
   ├─ utils/wheelImageSrcSet.ts · fitmentImageSrcSet.ts   The smaller photo copies each srcset lists
   ├─ utils/leads.ts              Posts every enquiry to the n8n webhook (see Lead delivery)
   ├─ utils/googleTagManager.ts   The Google Tag Manager snippet, with the Consent Mode defaults, that the build writes into every page
   ├─ utils/consent.ts            The cookie choice: read, save, tell GTM, delete the _ga cookies on Decline
   ├─ utils/analytics.ts          trackEvent (to Umami when set up, and to the GTM data layer) and the Umami tracker
   ├─ utils/carPreview.ts         "See it on my car": is it on, shrink the photo, talk to the Worker
   ├─ utils/wheelBuilder.ts       Builds a stock listing from a short input
   ├─ utils/wheelEnquiry.ts       Reads the spec line and words the WhatsApp enquiry
   └─ components/
      ├─ ui/                      Re-exports of the root components/ui primitives
      ├─ brand/                   Header, footer, home, catalogue (grouped by brand), wheel page, car-preview dialog, installs, the two brand pages and their shared sections, partners strip, Ask AI, contact, privacy
      ├─ admin/                   Admin uploader
      ├─ shared/                  BrandLogo, enquiry form, cookie banner, floating WhatsApp button, social icons
      └─ visuals/                 WheelStudio (the site's wrapper around `src/wheel-viewer`), WheelStage, its loading skeleton and error boundary
```

## Design system

The look is dark, restrained and technical. Keep new work inside it.

Since November 2026 the site is built the way the SIXNINE Wheels storefront is (the `sixnine-website` skill in `.claude/skills/`), in FORGED's own palette and type:

- **Pills everywhere.** Buttons, chips, nav links and the header are fully rounded. Card tiles are 24 px (`rounded-3xl`).
- **Glass, not solid.** Floating and secondary surfaces use `.glass` (`src/index.css`): a translucent white fill, a 1px hairline, a 1px inner top highlight and a backdrop blur. The header is a floating glass pill bar; the page scrolls behind it.
- **White is the primary action; FORGED blue is the one accent.** `CTA_PRIMARY_CLASS` (white, dark text) for a page's main button, `CTA_SECONDARY_CLASS` (glass) beside it, and `CTA_ACCENT_CLASS` (blue) only for the header's Enquire button and the enquiry form's submit. One blue control per view.
- **Selected means lighter, not blue.** The current nav link sits on a lighter pill; the active photo dot is white.
- **Calm motion.** `.press` shrinks a control to 97 % while pressed, `.press-card` a card to 98.5 %; cards lift their hairline on hover. Both are off under reduced motion.
- **Product cards** (`ProductCard.tsx`, on the brand pages, the series pages and the blog's in-stock blocks) follow SIXNINE's card: the whole card is one link; the wheel is contained on a soft radial tile with a stock badge; under it a small brand and series label, the finish as the title, the sizes, then the price per set with the finish's swatch.
- **Showcase cards** (`ShowcaseCard` in `SixnineShowcase.tsx`) follow SIXNINE's large home-page cards: a tall dark tile lit from the top, the wheel at three-quarters in its upper part, a white pill badge, the name large at the bottom left (Satoshi Black) and a round arrow at the bottom right. They show Sixnine's three-quarter render of the series; without one, the shop's own angled cut-out, then the face-on range picture turned to three-quarters in CSS. Used for the Sixnine series on the dealer page, the series pages ("More Sixnine series") and under the Sixnine group on the home page (a swipe row on phones).
- **Sections open with an eyebrow** (`EYEBROW_CLASS`, `src/components/brand/sectionStyles.ts`): one or two uppercase words over the heading.

What stays FORGED's own: the gold logo, Satoshi Black headlines, the palette below, rose for accent text and the focus ring, the brand film, the 3D studio and the photoreal swatches.

- **Colour tokens** live in `src/index.css`: the brand palette of off-white text (`#EDEBE4`), black background (`#111111`), blue (`#1D4ED8`) for the one accent button (see above), and rose (`#F43F5E`) for accent text and keyboard focus, plus onyx surfaces (`#121215`, `#18181D`), borders (`#26262E`) and text greys. Blue text on the black background is too faint to read, so accent text is always rose. Do not add new colours; WhatsApp green and Instagram pink appear only on those channels' own buttons.
- **Logo.** `public/brand/forged-monogram.svg` (gold) and `public/brand/forged-wordmark.svg` (FORGED SA, in the same gold) were traced from the logo files on the business's WordPress site. Their gold belongs to the logo only; do not use them as interface colours. Use `BrandLogo` (`src/components/shared/`) for the monogram and wordmark together. The browser icons in `public/` are the monogram on an onyx tile.
- **Footer.** `SiteFooter` (`src/components/brand/`) is on every page: the wordmark across the full width, then one column per contact channel set in `src/config/site.ts`, then the page links. An empty channel has no column.
- **Three typefaces**, each with one job:
  - **Satoshi Black** (`--font-display`, self-hosted in `public/fonts`) for every `h1`.
  - **Nunito** (`--font-heading`) for other headings; `.font-editorial-serif` is Nunito italic for emphasis words.
  - **Open Sans** (`--font-sans`) for body text.
  - **Geist Mono** (`--font-mono`, via `.font-tech-mono`) for specifications and uppercase labels.
- **Reuse these components** rather than the plain HTML element:
  - A plain `<img>` with `width`, `height` and the attributes from `wheelImageSrcSet()` (`src/utils/wheelImageSrcSet.ts`) for wheel photography, or from `fitmentImageSrcSet()` (`src/utils/fitmentImageSrcSet.ts`) for install photos, so phones download the smaller copies.
  - `WheelStage` for any 3D view. It downloads Three.js only when it's needed.

## Inventory

The catalogue mirrors the stock sheet. All prices are South African Rand for a complete set of four. FSA designs are Forged SA's own; FF designs are Sixnine Wheels'.

| Design | Finishes | Sizes | Price (R) | 3D model |
| --- | --- | --- | --- | --- |
| FSA001 (2-piece) | Black Matte | 19 / 20 inch | 90,000 | `stf399-front.glb`, `stf399-rear.glb` |
| FSA002 | Hyper Black · Polished Face | 20 / 21 inch | 75,000 · 85,000 | `fsa002-forked-v4.glb` |
| FSA003 | Gold · Silver · Hyper Black | 20 / 21 inch | 75,000 | `fsa003-v6.glb` |
| FSA004 | Silver · Hyper Black · Gloss Black | 20 / 21 inch | 70,000 | `fsa004-v6.glb` |
| FF-1 | Silver (Hyper Silver) · Liquid Metal | 20 / 21 inch | 80,000 · 95,000 | `ff-1-sixnine-v4.glb` |
| FF-3 | Pure Bronze · Glossy Black · Liquid Metal | 20 / 21 inch | 80,000 · 80,000 · 95,000 | `ff-3-sixnine-v4.glb` |

All fitments are BMW M3 (G80), 5×112, centre bore 66.6. Stock counts live in the data, not in this file.

**Colours to order.** The table lists the finishes in stock. On each wheel page, every colour the design comes in (`designPalette`) that it has no stock of is offered as made to order, with the notice in `TO_ORDER_NOTICE` ("Colours not in stock are made to order. A lead time of 3 months applies."). `getToOrderFinishes(wheel)` returns them. FSA designs use the generic four-colour palette. **Sixnine (FF) designs use Sixnine's own published finishes, by their own names** (`SIXNINE_DESIGN_FINISHES`: FF-3 comes in Liquid Metal, Glossy Black, Hyper Silver and Pure Bronze; FF-1 in Hyper Silver, Liquid Metal and Glossy Black; the owner confirmed the FF-1 "Silver" is Hyper Silver), researched on 2026-11-18 from sixnine-wheels.com and a reseller listing. Sixnine publishes no Hyper Black, so it is never offered on an FF wheel. Check Sixnine's site again when they add a finish. A to-order colour has no listing, no page and no price of its own; the visitor asks about it on WhatsApp. Never show one as in stock or without the notice.

### The Sixnine range data

`src/data/sixnineRange.json` holds every size Sixnine Wheels lists (70 sizes in 6 series), from the owner's "SIXNINE Wheels Catalogue" Google Sheet, a scrape of sixnine-wheels.com on 19 November 2026. It keeps only facts about the wheels:
- size, offset and bolt pattern;
- finishes;
- load rating, centre bore, concavity and weight;
- construction.

Sixnine's euro prices, EU stock, delivery dates, certificates and shop links are left out on purpose: they are Sixnine's terms for its own shop, not this shop's. A test checks that none of them creep in.

To refresh the data, download the sheet as .xlsx (File › Download › Microsoft Excel), then run:

```bash
python3 scripts/sixnine-range-from-sheet.py path/to/SIXNINE_Wheels_Catalogue.xlsx
```

The script needs `pip install openpyxl`. It refuses a series it does not know: add a new one to `SERIES_ORDER` in the script, and any words about it to `FEATURES` in `src/data/sixnineSeries.ts`. The sheet's construction wording ("flow forged", "flow formed") is **not** shown: on 23 November 2026 the owner confirmed every wheel the shop sells is forged, so `SIXNINE_SERIES` in `src/data/sixnineSeries.ts` sets every series to `SHOP_CONSTRUCTION` ("Forged") and keeps a size's own line only where it adds the piece count ("Forged, 2-piece"). The series pages, range cards, wheel-page write-ups and search descriptions all read it from there; a test fails if any series or size says "flow".

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

   Then make the cut-out the home page's design card floats on the dark background: `scripts/make-wheel-cutouts.py` turns each `hero.webp` (the three-quarter view) into a transparent `cutout.webp` beside it, 1000×1000, with the `birefnet-general` model of [rembg](https://github.com/danielgatis/rembg) (a 1 GB download on first run, cached in `~/.rembg`). It skips folders that already have one; `--force` redoes them all. Look at each result on a dark background before committing: background between the spokes must be gone and silver spokes intact. A test fails if a photographed listing has no cut-out.

   ```bash
   python3 -m venv .venv-cutouts && .venv-cutouts/bin/pip install "rembg[cpu]" pillow
   .venv-cutouts/bin/python scripts/make-wheel-cutouts.py
   ```

   Then make the smaller copies phones and tablets download instead of the full-size files: `scripts/make-wheel-sizes.py` writes `front-800.webp` and `front-400.webp` beside each `front.webp` (likewise `hero` and `profile`) and `cutout-600.webp` beside each `cutout.webp`. It needs only Pillow, skips copies that are newer than their photo, and `--force` redoes them all. The pages list the copies in each `<img srcset>` through `wheelImageSrcSet()` in `src/utils/wheelImageSrcSet.ts`; a test fails if a copy is missing.

   ```bash
   python3 scripts/make-wheel-sizes.py
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

A wheel with a `modelUrl` opens in the studio. The stage itself, its paint, the colour swatches and the part classification live in `src/wheel-viewer/`, a folder shared with the BMW configurator (`FazalRSA/BMW-AND-FORGED-`, which keeps a copy in `shared/wheel-viewer/`). The website owns it: edit it only here, run `bun run wheel-viewer:stamp` (`bun run test` fails without it), then tell the owner the configurator needs `node scripts/wheel-viewer-sync.mjs pull`. The site's own `src/components/visuals/WheelStudio.tsx` wraps it with this catalogue's finishes and is mounted through `WheelStage.tsx`. Three.js is downloaded only after the visitor taps "View in 3D". If a model fails to load, the studio shows a message with a retry button. If the studio's own code fails to download, `lazyWithRetry` tries twice more, then `Wheel3DSceneErrorBoundary` shows a reload card instead of breaking the page.

**How models are assigned**

- One model per wheel **design**. FSA002 is the forked-spoke wheel (`fsa002-forked-v4.glb`) in every finish. The gold 15-spoke wheel was listed as FSA002 by mistake and is the FSA003 (the owner confirmed it); its old address `/wheels/fsa002-gold` redirects to `/wheels/fsa003-gold`. If a listing's photos ever show a different wheel from the rest of its design, check the design code before giving it a model of its own. `MODEL_URL_BY_CODE` in `catalogue.ts` maps a model code to its `.glb`; every finish of that design shares the file and the studio repaints it. Photo-backed entries in `customWheels.json` carry the same `modelUrl`.
- FSA001 sets its own front and rear pair on its seed (`modelUrl` and `rearModelUrl`), which enables the Front / Rear switch.
- Paint settings per finish live in `src/data/studioFinishes.ts`. The colour swatches on wheel pages and in the viewer are drawn from the same numbers (`src/wheel-viewer/swatch.ts`), so a finish and its swatch cannot disagree.
- **Adding a model:** put the rim photo into Tripo3D, generate multi-view then 3D, export the `.glb`, upload it to Google Drive and give Claude the link. The `add-wheel-model` skill (`.claude/skills/add-wheel-model/`) cleans it and opens the pull request; the owner's steps, the limits of AI models and the better source (the maker's CAD) are in [docs/adding-3d-models.md](docs/adding-3d-models.md).
- **Centre-cap logos** are drawn by the viewer, not baked into the file: `capLogoForDesign` in `catalogue.ts` gives the FORGED monogram for FSA designs and the SIXNINE badge for FF designs, and the viewer's `capLogo` prop finds the cap by looking down the axle, lays the logo on it (gold mark on dark paint, dark ink on light paint) and, when a model has an open centre bore (FSA002), fills it with a cap in the wheel's paint first.
- **Sixnine series pages** for designs in stock (FF-ONE, FF-THREE) have a "View in 3D" button that opens the stocked design's model in the finishes the shop has.
- On a wheel page the studio offers the listing's own finish plus the design's to-order colours. While a to-order colour is selected, the page shows the lead-time notice under the viewer.

**Model requirements** (full detail in `public/models/wheels/README.md`)

- Binary glTF 2.0 (`.glb`); bare rim only, no tyre or car.
- Axle bore centre at the origin, face toward +Z, real metres.
- Sub-meshes named `Rim_Barrel`, `Rim_Face_Spokes`, `Hardware_Bolts`, `Center_Cap`. The barrel, face and cap take the selected finish; bolts keep their own material. A wheel with no cap may omit `Center_Cap`.
- Optional `Brake_Rotor` and `Brake_Caliper` meshes enable the brake clearance check.
- Baked textures are not needed: the studio applies its own paint, so models ship without them. Today FSA001's pair is 0.4 MB each and the five AI-made models 3.4 to 4.6 MB each (no Draco compression yet).
- Keep near 150k to 200k triangles for mobile (the AI-made models are 146k to 200k).
- A one-mesh AI model (everything named `Rim_Face_Spokes`) is fine: it all takes the finish. Its bolts are painted too.

**Accuracy of the current models.** The FSA002, FSA003, FSA004, FF-1 and FF-3 models were generated with Tripo3D from the real wheel photos and cleaned with the `add-wheel-model` skill's `build_wheel_model.py` (see [docs/adding-3d-models.md](docs/adding-3d-models.md)); each was checked against its photos (spoke pattern, rim, hub, centre cap). The current files (`fsa002-forked-v4`, `fsa003-v6`, `fsa004-v6`, `ff-1-sixnine-v4`, `ff-3-sixnine-v4`, settings in `scripts/wheel-models.json`) have the AI's thin fins cut, smoothed surfaces and shading, and the barrel rebuilt as one clean 6 mm wall (the AI meshes modelled it as a thick double skin) on every design except FF-3, whose bolted two-piece lip the rebuild cuts. They are close to the real wheels, not CAD: faint bumps and the odd thin spike from the AI mesh remain at some angles. The maker's CAD or 3D scans are the better source if they become available. The FSA001 brake meshes use assumed G80 brake dimensions, not a measured caliper.

## Search and sharing

All search metadata is produced by `src/utils/seo.ts` and applied on every route change.

- **Titles and descriptions** per route, with titles capped at 60 characters. The home title is "Forged wheels for BMW M cars in stock | FORGED Custom Wheels".
- **Canonical URLs** always on `SITE.host` in `src/config/site.ts`, the address the site is served from (`www.forgedsa.co.za`). The bare domain redirects to it, and a canonical or sitemap entry that redirects back to its own page confuses search engines, so a test checks the sitemap, `robots.txt` and `index.html` all use the same host.
- **Link previews**: Open Graph and Twitter tags on every route. Link-preview bots and crawlers that do not run JavaScript read the same tags from each page's own HTML file, written by `scripts/prerender-meta.ts`. `index.html` keeps generic tags because it is also the fallback for unknown paths; the build adds only a preload for the hero's poster (the brand film's first frame, listed in `src/utils/heroVideo.ts`), so every screen starts fetching it before the JavaScript runs, and the Google Tag Manager snippet that every page carries (see [Google Tag Manager and Google Analytics](#google-tag-manager-and-google-analytics)).
- **Structured data**: `Organization` and `WebSite` on the home page; `Product` with the Rand price, in stock, on wheel pages; `CollectionPage`, `ContactPage` or `WebPage` with a `BreadcrumbList` on installs, the Sixnine dealer page, contact and the privacy notice; `Blog` and `ItemList` on the blog hub, `CollectionPage` on pillar pages, and `BlogPosting`, `BreadcrumbList` and `FAQPage` on articles.
- **Sitemap**: `public/sitemap.xml` is regenerated from the catalogue and the blog on every build. It lists `/`, one page per in-stock wheel, the blog hub, its four pillar pages and every article (these carry a `lastmod` that is the article's own date), `/installs`, `/sixnine-wheels`, `/contact` and `/privacy-policy`, and nothing else.
- **Noindex**: admin, preview, sold or unknown wheels, and unknown addresses. `public/robots.txt` (generated by `scripts/generate-sitemap.ts`, so its `Sitemap:` line cannot drift from the host) keeps crawlers out of `/admin` and `/studio/`.
- **Crawlable navigation**: header, footer and catalogue links are real anchors (`Link` in `src/utils/router.tsx`).

### The blog

The blog is built to rank for what owners of BMW M cars in South Africa search for, in a **silo**: four content pillars, each a page of its own (`/blog/:pillar`) that links to every article in it, and each article linking back to its pillar, to the hub and on to related articles. The plan, the keyword each page targets and how to check it in Search Console are in [docs/blog-seo-plan.md](docs/blog-seo-plan.md).

| Pillar | Address | Articles |
| --- | --- | --- |
| Forged wheel basics | `/blog/forged-wheel-basics` | forged vs cast vs flow-formed, unsprung weight, are forged wheels worth it, how to read a wheel's load rating, painted vs powder-coated vs polished finishes |
| BMW M wheel fitment | `/blog/bmw-m-wheel-fitment` | PCD, offset and centre bore explained, the G80 M3 guide, staggered vs square, hub-centric rings, tyre pressure sensors after a wheel change, plus-sizing |
| Buying forged wheels in South Africa | `/blog/buying-forged-wheels-south-africa` | what forged wheels cost, in stock vs made to order, choosing a colour and finish, a buyer's checklist |
| Wheel care | `/blog/wheel-care` | cleaning, wheel bolt torque, protecting wheels from potholes, balancing and alignment after new wheels |

**Writing an article.** Add an entry to `BLOG_POSTS` in `src/data/blogPosts.ts`: slug, pillar, title, `metaTitle` (60 characters or fewer with the site name), a 100 to 160 character description, the target keyword, related phrases, a body of blocks (`h2`, `p`, `ul`, `ol`, `callout`, `table`, `designTable`, `stock`, `cta`), FAQs and two to four `more` slugs. Text takes `[link](/path)` and `**bold**`. Add the article to a pillar by setting `pillar`; nothing else needs registering, because the pillar page, hub, sitemap, RSS feed, `llms.txt`, route and prerendered HTML all read the list.

**The rules the tests enforce** (`src/data/blog.test.ts`):

- **Numbers come from the catalogue.** A price, size, offset, bolt pattern, centre bore, lead time or stock count is never typed into an article. Write the text as a function of the catalogue facts, for example ``text: (f) => `Prices run from ${f.minPrice} to ${f.maxPrice} per set of four.` ``. A paragraph that resolves to nothing (no wheels in stock) is dropped rather than shown blank.
- **Wheel pages are not linked by hand.** The `stock` and `designTable` blocks list only in-stock wheels (`getAllBrandWheels()`).
- **No unconfirmed claims.** No warranty, certification, test standard, delivery, finance or opening-hours wording; fitment is never promised, only confirmed by the shop per car.
- **No orphans, no broken links.** Every article is linked from another and points on to two to four others, and every internal link resolves.

**What crawlers read.** `scripts/prerender-meta.ts` writes each blog page's full article HTML into its own file (`src/components/blog/blogStatic.tsx`), so the text, headings, tables, FAQ and links are in the page before any JavaScript runs; the app replaces it on load. The hub and each pillar are written twice, as `blog.html` and `blog/index.html`, because they share their name with a folder and hosts disagree about which one `/blog` means. `/blog/feed.xml` is an RSS feed, advertised in `index.html`.

**Components.** The blog uses shadcn/ui-style primitives (`src/components/ui/`: `badge`, `card`, `alert`, `table`, `breadcrumb`, `accordion`) built with `class-variance-authority` and `cn`, themed to the dark palette. The accordion uses the native `<details>` element so the FAQ works without JavaScript.

### Search Console and visit statistics

Each is off until the site is given the values it needs. Nothing is loaded or added to a page without them.

**Google Search Console** shows how Google crawls and indexes the site.

1. In Search Console choose *Add property*. The simplest is a **Domain property** for `forgedsa.co.za`: it covers `www` and the bare domain, `http` and `https`. Google shows a TXT record to add at the domain's DNS host; verify once it is there. This needs no code change (a Domain property can only be verified with a DNS record).
2. If the DNS cannot be edited, add a **URL-prefix property** for `https://www.forgedsa.co.za/` and choose the *HTML tag* method. Copy the `content` value of the tag Google shows into `searchConsoleToken` in `src/config/site.ts`. The build adds the tag to the home page and to every page file; deploy, then press Verify. Leave the tag in place, because Google checks it again from time to time.
3. Once verified, open *Sitemaps* and submit `https://www.forgedsa.co.za/sitemap.xml`. Use *URL inspection* on the home page and a wheel page to confirm Google can fetch and render them.

**Visit statistics** use [Umami Cloud](https://umami.is), which sets no cookies and does not store visitors' IP addresses in its statistics. On its pricing page (read 17 November 2026) the free Hobby plan allows 100,000 events a month, one website and six months of history; check the page again before relying on those numbers.

1. Create an Umami Cloud account and pick its data region (United States or European Union); the region cannot be changed afterwards.
2. Add a website for `www.forgedsa.co.za`. On its *Tracking code* page copy the script address and the website ID (a UUID).
3. Put them in `analyticsScriptUrl` and `analyticsWebsiteId` in `src/config/site.ts` and deploy. A test fails if only one is set, if the address is not `https`, or if the ID is not a UUID.

How it behaves (`src/utils/analytics.ts`): the tracker is added once, after the page has loaded; it counts only `SITE.host` (not the Render address or a developer's localhost); it respects a browser's Do Not Track setting. Two events are counted, `enquiry_open` and `enquiry_sent` (with `delivered` yes or no, and the channel), each with the page address only. Never put a name, phone number, email or message in an event. The privacy notice describes the statistics and lists Umami as a recipient only while they are set up, and says there are none otherwise; both read the same check, so they cannot disagree.

**Google Analytics** is loaded through Google Tag Manager and has its own section: [Google Tag Manager and Google Analytics](#google-tag-manager-and-google-analytics).

### See it on my car (AI preview)

On every wheel page a **See it on my car** button lets a visitor choose a photo of their car and see an AI-made impression of that wheel on it. It is **on while `carPreviewUrl` in `src/config/site.ts` is set** (today it points at the deployed Worker). Clear it to `''` and the button, the request and the preview text in the privacy notice all disappear again.

How it works:

1. The browser (`src/utils/carPreview.ts`, `CarPreviewDialog.tsx`) re-saves the photo as a JPEG at most 512 px on its longest side, which also strips the location and camera details stored in the original, and sends it with only the wheel's name, after the visitor ticks a consent box.
2. A small Cloudflare Worker (`worker/car-preview/`, **separate from the website and its Render deploy**) fetches that wheel's own 400 px product photo from this site, and asks Cloudflare's Workers AI model `@cf/black-forest-labs/flux-2-klein-4b` to put the wheel on the car. The instruction is fixed in the Worker, and only a catalogue wheel name is accepted, so it cannot be used as a general image editor.
   The button is black with white text. While a preview is being made, a neon gradient laser runs round its edge, both on the dialog's button and on the wheel page's button behind it (`.laser-button` in `src/index.css`, switched by `data-working`). For visitors who prefer reduced motion the ring is still instead of moving.
3. The picture comes back to the browser and is shown with "AI preview" marking and the line "This is an AI-generated impression, not a photograph. The wheel's shape, size and fit can differ from the real thing. We confirm fit for your exact car before you order." Nothing is stored: not in the browser, and the Worker keeps no photo, result or log (`wrangler.toml` turns logs off; do not turn them on).

The Worker is deployed to the owner's Cloudflare account as `forged-car-preview` (address in `carPreviewUrl`). To change it, edit `worker/car-preview/` and run `npx wrangler deploy` from that folder with a Cloudflare API token that has **Account · Workers Scripts · Edit**; the website needs no change unless the address changes. Test one real preview with `curl` as in [worker/car-preview/README.md](worker/car-preview/README.md). To try the site without Cloudflare, run `npx tsx worker/car-preview/dev-server.mjs` (a pretend model that returns the customer's own photo) and point `carPreviewUrl` at it only on your own machine; **never commit a local address**.

Things to know before relying on it:

- **Free limit.** Workers AI's free plan allows 10,000 Neurons a day and is a hard stop: when it is used up the dialog says so and offers the WhatsApp route. By Cloudflare's published prices one preview costs roughly 100 to 150 Neurons, so expect on the order of 70 to 100 previews a day (our estimate, not a Cloudflare figure; the dashboard shows the real use). Do not move the account to the Paid plan unless you want to pay for extra use.
- **Quality.** Tested on the live Worker (17 to 18 November 2026) with real customer photos of a G80 M3 and an F80 M3: about 7 seconds each, and the wheel came out as a close copy of the product photo in the right perspective. It is still an impression, and spoke shape and count can differ from the real wheel, which is why the result carries the disclaimer. Cloudflare says input images must be under 512 px, which is why the photos are small. If results look poor, the Worker's `MODEL` setting can be changed, or a paid image model used instead.
- **The model's own safety filter** sometimes refuses a picture (Cloudflare error 3030, "output has been flagged"). In testing it refused a studio re-shoot of a BMW but accepted ordinary customer photos. The Worker answers that case with its own message (`photo_rejected`, HTTP 422) asking for a different photo.
- **Photos are personal information.** A car photo can show people or a number plate. The dialog asks the visitor not to include either, and the privacy notice (which describes this only while the feature is on) names Cloudflare as the recipient and covers the transfer outside South Africa. If you change what is sent or where, change the notice in the same pull request.
- **Black Forest Labs' terms** do not plainly state that commercial use of outputs is allowed. The previews are for the visitor's own photo; check before reusing generated pictures in advertising.

### For AI assistants and coding agents

- **`/llms.txt`** follows the [llmstxt.org](https://llmstxt.org) format. `scripts/generate-llms.ts` writes it into `dist/` at the end of every build, from `src/utils/llms.ts`: every in-stock set with its Rand price, sizes and fitment, the to-order lead time, contact details and the main pages. Assistants cannot run this single-page app, so this file is what they can read. Nothing in it is typed by hand. Its links always use the production domain in `src/config/site.ts`, like the canonical URLs and the sitemap.
- **"Ask AI about us"** (`AskAiSection`, links built in `src/utils/askAi.ts`) is a row of buttons on the home page for ChatGPT, Claude, Perplexity and Google AI. Each opens that assistant in a new tab with a question typed in (ChatGPT, Perplexity and Google AI run it on load; Claude only fills its box) that points at `/llms.txt` on the address the visitor is on. The site sends nothing itself, and the question asks for facts only.
- **Contact us on WhatsApp** (`FloatingWhatsApp`) is a button fixed to the corner of every public page (not `/admin`). It opens the enquiry form like every other call to action, and is hidden when `SITE.whatsappNumber` is empty.
- **Social buttons** (`SocialButtons`, in the footer and on `/contact`) come from `instagramUrl`, `facebookUrl`, `tiktokUrl` and `youtubeUrl` in `src/config/site.ts`. An empty value hides its button; filled ones also go into the home page's `sameAs` structured data.
- **Google reviews** (`GoogleReviewsSection`, home page, after the installs) shows the rating and count from `SITE.googleRating` and `SITE.googleReviewCount`, review text copied from Google into `src/data/googleReviews.ts`, and the "Read all reviews" and "Leave a review" links from `SITE`. It is hidden until something is filled in. It adds no review structured data on purpose: Google does not show stars for a business's own reviews of itself.
- **`AGENTS.md`** at the repository root gives AI coding agents the commands and the rules that are easy to break. Keep it in step with this file.
- **[docs/agent-handoff.md](docs/agent-handoff.md)** is the working context for the next agent: what has been built, why, the owner's decisions and preferences, the 3D-model pipeline in practice, environment gotchas, and what is still open.
- **Agent skills** live in `.claude/skills/`: `add-wheel-model` (adding a 3D model), and four SIXNINE style skills (`sixnine-website`, `sixnine-product-listing`, `sixnine-marketing-pages`, `sixnine-blog-writing`) that describe the sixnine-wheels.com storefront, as supplied by the owner. `AGENTS.md` says when the SIXNINE skills apply and which of this repository's rules they never override.

## Google Tag Manager and Google Analytics

The site measures visits with **Google Analytics 4 (GA4)**, loaded through **Google Tag Manager (GTM)**.

| | ID | Where to sign in |
| --- | --- | --- |
| GTM container | `GTM-P554MVX4` (`googleTagManagerId` in `src/config/site.ts`) | [tagmanager.google.com](https://tagmanager.google.com) |
| GA4 property (measurement ID) | `G-H2TR6RVSK0` (set inside the GTM container, not in this repository) | [analytics.google.com](https://analytics.google.com) |

The code only installs GTM. Everything GTM loads, GA4 included, is configured and published in GTM itself, so a new tag or a change of GA4 property needs no code change and no deploy. The privacy notice is the exception (see [Keeping the privacy notice in step](#keeping-the-privacy-notice-in-step)).

### How it works

```
build (prerender-meta.ts)        every HTML file gets Google's container snippet
        │
visitor opens a page ──► on www.forgedsa.co.za? ──no──► nothing loads, no cookies
        │ yes
        ▼
snippet sets Consent Mode: everything denied, analytics granted only if this
browser accepted the banner before; then pushes the gtm.js start event and
downloads the container from googletagmanager.com (async: the page does not wait)
        │
        ▼
container runs the tags published in GTM (today: the GA4 Google tag)
        │
        ├─ accepted ──► GA4 sets _ga and _ga_H2TR6RVSK0 and sends full events
        └─ not yet / declined ──► no cookies; GA4 sends cookieless pings only
        │
        ▼
Reports in analytics.google.com (Realtime at once, the rest after processing)
```

1. **The build adds the snippet.** `scripts/prerender-meta.ts` calls `withGoogleTagManager` (`src/utils/googleTagManager.ts`) on the built `index.html` before every page file and redirect page is made from it. The script goes straight after `<meta charset>` and the `<noscript>` iframe straight after `<body>`, where Google's install instructions put them. The source `index.html` has no snippet (a test fails if someone pastes it there), so `npm run dev` never loads the container.
2. **Only the live site counts.** The snippet runs only when the page is served from `SITE.host` (`www.forgedsa.co.za`). A Render preview address loads nothing, so test visits never reach GA4. For the same reason, GTM's *Preview* mode and Tag Assistant work only on the live site.
3. **Page changes inside the site are counted by GA4.** The app moves between pages with the browser's history (`pushState` in `src/utils/router.tsx`) instead of reloading. GA4's enhanced-measurement setting *Page changes based on browser history events* (on by default) sends a `page_view` for each one. Do not also add a GTM *History Change* page-view tag: every page would be counted twice.
4. **The site's own events go to the data layer.** `trackEvent` (`src/utils/analytics.ts`) pushes `{ event, page, ...data }` for the events below. GA4 ignores them until a GTM tag forwards them (see [Setting up and checking](#setting-up-and-checking)). Events carry only the page address and anonymous values; never put a name, phone number, email or message in one.

### Cookie consent (opt-in)

Google Analytics cookies are **off until the visitor taps Accept** in the cookie banner (`src/components/shared/ConsentBanner.tsx`, logic in `src/utils/consent.ts`). It uses [Google Consent Mode v2](https://developers.google.com/tag-platform/security/concepts/consent-mode):

| Visitor | Banner | Cookies | What GA4 receives |
| --- | --- | --- | --- |
| Has not chosen | Shown at the bottom of every page until they choose | None; any `_ga` cookie left from an earlier visit is deleted | Cookieless pings only (`gcs=G100` on the request) |
| Tapped **Accept** | Hidden | `_ga`, `_ga_H2TR6RVSK0` | Full events (`gcs=G101`) |
| Tapped **Decline** | Hidden | None; existing ones deleted | Cookieless pings only |

- **Before the container loads**, the snippet sets `ad_storage`, `ad_user_data`, `ad_personalization` and `analytics_storage` to `denied`, then grants `analytics_storage` at once if `localStorage['forged-analytics-consent']` is `granted`. The three advertising types are never granted: the site has no advertising tags.
- **Accept and Decline** save the choice in `localStorage['forged-analytics-consent']` and push a `consent` `update` to the data layer (as an `Arguments` object, which is the only form GTM accepts). Decline also deletes the `_ga` cookies on the host and its parent domains.
- **Changing your mind**: *Cookie settings* at the foot of every page, and a button in section 06 of the privacy notice, reopen the banner.
- **Cookieless pings** ("advanced" consent mode): while consent is denied the GA4 tag still sends a ping for each page and event without cookies. Google describes them as containing coarse details that cannot directly identify a person, used for basic measurement and modelling. Reports therefore show fewer users and sessions than real visits; the gap is the visitors who did not accept. GA4's behavioural modelling fills it only on properties with enough daily consented traffic, which a site this size may not reach.
- **GTM tags**: the GA4 tags check consent themselves (built-in consent checks), so nothing extra is needed in GTM. A tag of another kind added later needs its consent settings set in GTM (*Advanced settings → Consent settings*).

### What is measured

Since the cookie banner, everything in this table is recorded in full only for visitors who tapped **Accept**; the rest send cookieless pings (see [Cookie consent](#cookie-consent-opt-in)).

| Event | When it fires | Comes from | In GA4 today? |
| --- | --- | --- | --- |
| `page_view` | A page opens, and each move to another page inside the site | GA4 enhanced measurement | Yes |
| `scroll` | A visitor scrolls to 90% of a page | GA4 enhanced measurement | Yes |
| `click` (outbound) | A visitor taps a link that leaves the site (WhatsApp, Instagram) | GA4 enhanced measurement | Yes |
| `form_start`, `form_submit` | A visitor starts or sends a form (never what is typed) | GA4 enhanced measurement | Yes |
| `file_download`, `video_*`, `view_search_results` | A file link, an embedded YouTube video, a search address | GA4 enhanced measurement | Yes, when the page has one |
| `enquiry_open` | The enquiry form is opened | `src/store/useForgedStore.ts` | Only after the GTM tag below |
| `enquiry_sent` (`delivered`, `channel`) | The enquiry form is sent; whether n8n received it, and by form or WhatsApp | `src/components/shared/GlobalOverlays.tsx` | Only after the GTM tag below |
| `car_preview_open`, `car_preview_result` (`outcome`) | "See it on my car" is opened, and how it ended | `src/components/brand/CarPreviewDialog.tsx` | Only after a GTM tag |

### How often the data arrives

GA4 does not send reports anywhere; you read them in [analytics.google.com](https://analytics.google.com). How fresh they are depends on where you look (Google's [data freshness](https://support.google.com/analytics/answer/11198161) page; checked 18 November 2026):

| Where you look | How fresh | Use it for |
| --- | --- | --- |
| **Reports → Realtime** | Within about a minute; shows the last 30 minutes | Checking that tracking works after a deploy or a GTM change |
| **Standard reports and Explore** | Processed through the day (Google lists about 12 hours for daily processing); a day's numbers can still change for **24 to 48 hours** | Weekly and monthly reading. Treat a day as final two days later |
| **GTM Preview / Tag Assistant** | Immediate, only in your own browser | Debugging tags before you publish them; live site only |

Two more limits from Google's documentation:

- An event that reaches Google more than **72 hours** after it happened (a phone that was offline) is dropped.
- Detailed, event-level data (Explore reports) is kept for the property's **data retention** setting: 2 months by default, 14 months at most on a free property. Set it to 14 months in GA4 under *Admin → Data collection and modification → Data retention*. The privacy notice says "at most 14 months".

A practical rhythm: look at *Realtime* after any change, and read the weekly numbers (*Reports → Engagement → Pages and screens*, *Reports → Acquisition → Traffic acquisition*, and the `enquiry_sent` key event once it exists) on a Wednesday for the week that ended on Sunday, by which time all of that week's figures have settled.

### Setting up and checking

1. **Check it works.** Open the live site and tap **Accept**, then GA4 *Reports → Realtime*: your visit should show within a minute. In the browser's developer tools, the page should load `gtm.js?id=GTM-P554MVX4`, set no `_ga` cookie before Accept and set both after; on the Render address it should load neither.
2. **Count enquiries as leads.** The quick way: in GTM, *Admin → Import container*, choose [docs/google-tag-manager/forged-enquiry-events.json](docs/google-tag-manager/forged-enquiry-events.json), your current workspace, **Merge** and **Rename conflicting tags, triggers, and variables**. It adds three Data Layer Variables (`delivered`, `channel`, `outcome`), a Custom Event trigger and a GA4 Event tag (to `G-H2TR6RVSK0`) for each of `enquiry_open`, `enquiry_sent`, `car_preview_open` and `car_preview_result`, all named `FORGED …`. Preview on the live site, send a test enquiry, then *Submit* to publish. The file was written by hand from published examples of the export format, not exported from GTM; if the import is refused, build the same thing by hand: *Variables → New → Data Layer Variable* named `delivered`, and another named `channel`. *Triggers → New → Custom Event*, event name `enquiry_sent`. *Tags → New → Google Analytics: GA4 Event*, measurement ID `G-H2TR6RVSK0`, event name `enquiry_sent`, event parameters `delivered` = `{{delivered}}` and `channel` = `{{channel}}`, fired by that trigger. Preview it on the live site, then *Submit* to publish. Repeat for `enquiry_open` or the car-preview events if they are wanted. Either way, in GA4 mark `enquiry_sent` as a key event under *Admin → Data display → Events* once it has arrived (allow a day).
3. **Set data retention to 14 months** (see above).

### Keeping the privacy notice in step

The privacy notice (`PrivacyPolicyPage.tsx`) describes Google Tag Manager, Google Analytics, the cookie banner and consent, the two `_ga` cookies, the cookieless pings, Google as a recipient and the retention limit while `googleTagManagerId` is set, and none of it when the ID is `''`; both read `googleTagManagerId()`, so they cannot disagree. The notice cannot see what is published inside GTM. Publishing a new kind of tag there (an advertising pixel, Google Ads conversions, a chat widget, another analytics tool) changes what the site collects without any code change, so update the notice at the same time. Clearing `googleTagManagerId` to `''` removes the snippet and the matching notice text together.

## Business details and contact channels

`src/config/site.ts` is the single source of truth for the business name, domain, address, WhatsApp, phone, email and social links.

A value left empty is never shown: the related button falls back to the enquiry form and the icon or address line is hidden. Fill a value in only once it is confirmed. Email addresses must be on the business's own domain (`SITE.domain`); a test fails otherwise. `privacyEmail` and `tradeEmail` are empty today, so the privacy notice gives WhatsApp and phone as the contact.

**Partners.** The "Our Industry Partners" row in the home page hero reads `src/data/partners.ts` and is left out when the list is empty.

**Installs figure.** `SITE.installsThisYear` (`{ wheels, year }`) is the owner's count of wheels installed in a calendar year. The hero shows "Over {wheels} successful wheels installed this year." only during that year (`installsThisYearLine`), so the claim never outlives its year; update both numbers with the owner's new figure, or set it to `null` to hide the line. Add a partner only with the owner's confirmation that the logo may be shown.

**Privacy notice.** `PrivacyPolicyPage` must describe the site as it is. If you add anything that collects, stores or sends visitor data (a form backend, analytics, cookies, a new third party), update the notice in the same pull request (the visit statistics are described only while they are set up in `src/config/site.ts`). A test fails if the notice mentions features the site no longer has.

**Content rule.** Public copy states only what the business can evidence. Do not add certifications, warranty terms, delivery promises, response times, load ratings or dealer status without a source from the owner.

## Lead delivery (n8n)

The enquiry form (`src/components/shared/GlobalOverlays.tsx`, opened by every "Enquire" button and the contact page) posts each submission to one n8n webhook; the site itself has no backend. When a WhatsApp number is configured the form also opens WhatsApp with the message typed, as before.

`src/utils/leads.ts` builds the payload (message, phone, optional car (`vehicle`), name and email, the wheel it is about, the page, a timestamp, consent and a honeypot), POSTs it as JSON with a 10 s timeout and returns the reference n8n issues. If the webhook cannot be reached: with WhatsApp configured the WhatsApp path still carries the message; without it the form keeps the text in the browser and says so, so nothing is silently lost on the visitor's side.

The workflow **FORGED · Website Leads** (production URL `https://novahavensai.app.n8n.cloud/webhook/forged-website-lead`) then:

1. **Normalize & Validate** (Code node): rejects unknown types, filled honeypots and submissions with neither a usable email nor a phone number with HTTP 400; otherwise issues a `FORGED-INT-` reference and builds the emails. The inbox that receives leads and the reply-to address live in the `CONFIG` block at the top of this node; change them there.
2. **Log lead**: inserts the raw submission into the n8n data table **FORGED Website Leads** (one row per lead, with `status` for triage).
3. **Respond: accepted**: answers the browser with `{ ok: true, reference }`.
4. **Email the team**: a summary of the lead, reply-to set to the visitor when they gave an email.
5. **Confirm to visitor**: a receipt with the reference, only when the visitor gave an email address.

Emails go out through the Gmail credential attached to the workflow. To point a deployment at a different workflow (for example the test URL while developing), set `VITE_LEADS_WEBHOOK_URL`; otherwise `SITE.leadsWebhookUrl` in `src/config/site.ts` is used.

## Customer accounts

The site and the FORGEDSA configurator ([forged-configurator.vercel.app](https://forged-configurator.vercel.app), repository `FazalRSA/BMW-AND-FORGED-`) share **one account system**: the configurator's Supabase project (`qxlfkfhzpqbxffuqqewg`, "Apex Forged Configurator"). A Google account is one user, one profile and one garage on both sites.

| Piece | Where |
| --- | --- |
| Supabase client (public URL and publishable key; `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` override them) | `src/lib/supabase.ts` |
| Data calls: profile, saved builds, rename, delete, export, account deletion | `src/utils/accountService.ts` |
| Provider (session, profile, builds, errors) | `src/context/AccountContext.tsx` |
| The page | `src/components/brand/AccountPage.tsx`, route `/account` |
| Tables and functions (owned by the configurator repo, `supabase/migrations/`) | `public.profiles`, `public.saved_configurations`, `rename_configuration()`, `export_my_data()`, `delete_my_account()` |

**What a customer can do on `/account`:** continue with Google; edit name, phone, city and brake system; see the builds they saved in the configurator and open (in the configurator), rename or delete them; tick **Email me news and offers** (a separate box, off unless ticked; the service emails about their account and enquiries are not optional while the account exists); download everything stored about them as JSON; delete the account (two steps; it removes the sign-in, profile and saved builds, while enquiries already sent stay with the business as sales records). The website does not create builds: that is the configurator's job.

**Sign-in flow.** PKCE: Google returns the visitor to `/account?code=...`, supabase-js swaps the code for a session, and `AccountContext` removes the code from the address. No token ever sits in the URL or history. `supabase-js` is imported by the account page only (the `vendor-supabase` chunk), so no other page downloads it.

**Honest limit: one sign-in per site.** Browsers keep a session per origin, so a customer signs in once on each site (one click on "Continue with Google"); after that it is the same user, profile and garage on both. True single sign-on would need both sites under one parent domain (for example the configurator on `app.forgedsa.co.za` sharing a cookie with `www.forgedsa.co.za`) and is not built.

**Owner steps** (Supabase dashboard, project *Apex Forged Configurator*):

1. **Authentication → URL Configuration → Redirect URLs:** add `https://www.forgedsa.co.za/**` and `https://forgedsa.co.za/**` (and `http://localhost:3000/**` to try it locally). Without them Google's return is refused.
2. Google Cloud: nothing new if the Supabase callback `https://qxlfkfhzpqbxffuqqewg.supabase.co/auth/v1/callback` is already an authorised redirect URI of the OAuth client the configurator uses (its set-up is in the configurator's `docs/ACCOUNTS.md`). The Google provider itself must be switched on in Supabase (**Authentication → Providers → Google**), and **Confirm email must stay on**.
3. The migration that adds `export_my_data()`, `delete_my_account()` and the marketing-consent timestamp (`20261124090000_shared_accounts_and_mailer.sql` in the configurator repo) must be applied before the download and delete buttons work.

**Keeping the privacy notice true.** The notice describes the account, the Supabase and Google recipients, the sign-in entry in local storage and the email choice. If the account page starts collecting anything else, update the notice in the same pull request (and `src/config/site.test.ts` guards the list of features the notice must not describe).

**Real sign-in is not tested by the suite.** Google sign-in cannot run in a test; the unit tests use a stub client, and the page was checked signed out and with a stubbed session at 390 px and 1280 px.

### Firebase (superseded)

The earlier Firebase accounts (Firebase Auth and Firestore, project `gen-lang-client-0484314317`) were never mounted on a page and are superseded by the Supabase accounts above. `src/context/FirebaseContext.tsx`, `src/lib/firebase.ts` and the `firebase` dependency are removed. `firestore.rules`, `firestore.rules.test.ts`, `firebase-blueprint.json`, `security_spec.md` and `firebase-applet-config.json` are kept untouched for now; nothing in the site loads them, and they can be deleted with the Firebase project when the owner decides.

## Testing

`bun run test` first runs `wheel-viewer:verify` (fails if `src/wheel-viewer/` was edited without a new stamp), then twenty-eight test files (282 tests) with `node:test`. The files are listed by name in the `test` script in `package.json`, so a new test file does not run until it is added there.

| Suite | Covers |
| --- | --- |
| `src/data/catalogue.test.ts` | The stock rule (every exported wheel is in stock, 14 listings across 6 designs, one finish each), siblings, to-order colours (never a colour the design has in stock), no store exports, wheel builder, and that every listed wheel has a 3D model and photos that exist |
| `src/data/clientFitments.test.ts` | Customer installs data: unique ids, the three photos of each install, the photo files on disk, sequential slot labels, filter families, and that a wheel button on an install's photo links only to an in-stock listing and marks only the two studio photos |
| `src/data/sixnineSeries.test.ts` | The six Sixnine series and their page addresses; the range holds wheel specifications only (no prices, stock, certificates or shop links); every size has a bolt pattern and every single wheel its diameter, width and Sixnine finish names with a swatch; facts are worked out from the sizes; every Sixnine listing in stock belongs to a series |
| `src/utils/sixnineShowcase.test.ts` | Every series has a showcase picture (the shop's own angled cut-out first), and "New at Sixnine" lists only what Sixnine has on pre-order |
| `src/utils/listingSpecs.test.ts` | A Sixnine listing's diameters, offsets and bolt pattern match exactly one Sixnine size per diameter, the Technical data table carries Sixnine's figures, a Forged SA listing has none, and an unreadable spec sheet hides the table rather than showing a wrong one |
| `src/utils/brandFitment.test.ts` | The brand pages' fitment summary: a size, bolt pattern or bore is stated only when every set agrees, and lists read as English |
| `src/utils/heroVideo.test.ts` | Every hero film file and poster exists, AV1 is offered before H.264, the film stays inside its download budget, it can start before it has fully downloaded, and it plays only for visitors who asked neither for less motion nor to save data |
| `src/utils/accountService.test.ts` | The customer account's data calls against a stub Supabase client: a profile patch writes only the five editable columns (never the email), limits, builds mapped from their payload, names for ids with a fallback, rename and delete of a build that is not the customer's, the data export and the account deletion |
| `src/utils/leads.test.ts` | The enquiry's delivery to n8n: the webhook address, the payload, the reference number, a visitor notice when delivery fails, and no send when the hidden honeypot field is filled |
| `src/utils/designCards.test.ts` | Home page design cards: one per design, badge, price and link from the data, the 3-then-2 row plan, and a cut-out on disk for every photographed listing |
| `src/utils/wheelImageSrcSet.test.ts` | The `srcset` for each wheel photo (site photos only; nothing for admin uploads or placeholders) and that every smaller copy exists on disk |
| `src/utils/fitmentImageSrcSet.test.ts` | The `srcset` for the install thumbnails (800 px copy, then the original) and that every install photo has its 800 px copy on disk |
| `src/utils/wheelStudioParts.test.ts` | Viewer part classification, exploded-view offsets, camera distance |
| `src/utils/heroVideo.test.ts` | The home-page hero film: every film file and poster is on disk, AV1 is offered before H.264, the download budget holds, each file can start before it has fully downloaded, and the film plays only when the visitor has not asked for less motion or to save data |
| `src/utils/brandFitment.test.ts` | Brand pages: the design list, and fitment facts that show a size, bolt pattern or bore only when every set agrees |
| `src/data/sixnineSeries.test.ts` | The six Sixnine series and their addresses; the range holds wheel specifications only (no prices, stock, certificates or shop links); sizes sort the Sixnine way; every in-stock FF listing belongs to a series |
| `src/utils/sixnineShowcase.test.ts` | Every Sixnine series has a showcase picture |
| `src/utils/listingSpecs.test.ts` | The spec sheet on each Sixnine listing: one Sixnine size per diameter, no Sixnine sizes on a Forged SA listing, and an unreadable sheet hides the table and says why |
| `src/utils/leads.test.ts` | Lead delivery: the webhook address, the reference format, the payload (page, time, consent, source), the local reference and visitor notice when delivery fails, and no send when the honeypot is filled |
| `src/utils/seo.test.ts` | Per-route metadata, canonical URLs, structured data, share images, sitemap (no removed route), `render.yaml`; that the sitemap, `robots.txt` and `index.html` all use the same host; the Search Console tag (added once, never from an unsafe token) |
| `src/utils/analytics.test.ts` | Visit statistics are off until both values are set, refuse a non-https address or a malformed ID, add one tracker that counts only the production host and respects Do Not Track, push each event to Google Tag Manager's data layer too, and never let a tracker failure reach the page |
| `src/utils/consent.test.ts` | The cookie choice is read and saved safely (blocked storage never throws), consent updates reach the data layer as gtag-style `Arguments` objects and only where GTM runs, Decline deletes only the `_ga` cookies on every parent domain, Accept keeps them, and Cookie settings reopens the banner |
| `src/utils/googleTagManager.test.ts` | Google Tag Manager is off without a well-formed container ID; the snippet sets every Consent Mode type to denied before the container starts and grants analytics only after an earlier Accept; it loads the container (with the `gtm.js` start event) only on the production host, goes straight after `<meta charset>` with the `<noscript>` straight after `<body>`, is added once, and is never typed into `index.html` |
| `src/utils/redirects.test.ts` | Old address to new address, `replaceState`, no loops, and every address in `scripts/legacy-pages.json` has a redirect |
| `src/config/site.test.ts` | Published emails are empty or on the business domain; the host is the domain or `www.<domain>`; the statistics and Search Console values are well formed and set together; the car-preview address is empty or https; the privacy notice does not describe removed features |
| `src/utils/carPreview.test.ts` | "See it on my car": off unless the address is https, shrinking keeps the shape and never enlarges, the request carries only the photo, wheel name and size and no cookies, every Worker error and malformed reply becomes a message fit to show |
| `worker/car-preview/src/handler.test.ts` | The Worker, with a pretend model: allowed origins only, photo type checked from its first bytes, size limits, unknown wheels, the fixed prompt and image order, each error status, timeout, and that nothing the customer sent is logged |
| `src/utils/llms.test.ts` | `llms.txt` shape, one link and price per in-stock wheel, contact details from the site config, no unbacked claims; the Ask AI links carry the question |
| `src/data/blog.test.ts` | Four pillars of three or more articles; titles, descriptions and keywords; structure and length; every internal link resolves and no wheel page is hand-linked; no orphan articles; no typed price, size, offset, bolt pattern, lead time or phone number; no unbacked claim; catalogue-built text is correct and never reads "undefined"; blog path resolution |
| `src/utils/blogSeo.test.ts` | Blog metadata and canonical URLs, noindex for unknown blog addresses, `BlogPosting`, `BreadcrumbList` and `FAQPage` data matching the page, the sitemap with `lastmod`, the RSS feed (and that the file on disk is current), prerendered article HTML, and `llms.txt` listing every article |
| `src/utils/finishSwatch.test.ts` | Every colour a visitor can pick has paint numbers and so a matching swatch; a swatch is keyed by paint, matte or gloss name and size; with no WebGL a swatch is `null`, never a throw, and nothing is cached; the drawn stand-in is a lit ball in the finish colour |
| `firestore.rules.test.ts` | Structure of the Firestore security rules |

There are no browser-level tests. Check 3D and layout changes by hand on a phone-sized viewport before merging.

## Deployment

`npm run build` (or `bun run build`) produces a static single-page app in `dist/`. Any static host works, provided every path that is not a real file is rewritten to `index.html`. The repository ships ready-made configuration for two hosts:

| Host | Config file | How to deploy |
| --- | --- | --- |
| **Render** (static site, in use) | `render.yaml` | Already deployed (see [Two Render services](#two-render-services) below). To recreate it: Render dashboard → New → Blueprint → select this repository |
| **Vercel** | `vercel.json` | Vercel dashboard → Add New → Project → import this repository |

Both configurations install with `npm install --legacy-peer-deps`, run `npm run build`, publish `dist/`, apply the single-page rewrite, and cache fingerprinted assets for a year and models and images for a day. Every push to `main` redeploys.

The page rules in `render.yaml` are written by the build. Do not edit the block between `BEGIN generated page routes` and `END generated page routes` by hand; run `bun run build` and commit the result.

**After a deploy, check old links.** Twice, straight after a deploy, Render served an empty page for some removed addresses (for example `/client-fitments`). Redeploying once with the build cache cleared fixed it both times. The service also still carries rewrite rules from an earlier `render.yaml` that the file no longer controls; they can be tidied under Redirects/Rewrites in the Render dashboard.

#### Two Render services

Two Render static sites build this repository's `main`:

| Service | Address | What it does today |
| --- | --- | --- |
| **Forged Wheels** (`srv-dbphe7on74is73dvmi2g`) | `forged-custom-wheels-gu3l.onrender.com` | Serves `www.forgedsa.co.za`, so the custom domain is attached to it. Its routes are set by hand in the dashboard and do not follow `render.yaml` on their own. On 23 November 2026 the rules for the Sixnine series pages, `/forged-sa-wheels`, `/wheels/fsa003-gold` and the blog's articles were added to it, and the old rules were kept. Seven blog articles added to `main` later were added on 23 November 2026 too, so every address in `render.yaml` now has its rule |
| **forged-custom-wheels-gu3l** (`srv-dbqhtl5bedkc73dlu350`) | `forged-custom-wheels-gu3l-lfgl.onrender.com` | Not on the domain. It follows `render.yaml` directly, so every page in the sitemap is served from its own prerendered file. It is a second build of the same branch and can be deleted |

Because of this, **a new page is correct on the second service and wrong on the live domain until its rewrite rule is on the first**. The rules to add are the ones in the generated block of `render.yaml`. Three ways to add them:

- `scripts/add-blog-rules.sh` adds the blog's rules from `render.yaml` to the domain's service. It previews first (`DRY_RUN=0` applies), skips rules that already exist and saves the current rules before it changes anything. It needs a Render API key in `RENDER_API_KEY`; the comments at its top say where to get one.
- [docs/render-blog-rewrites.md](docs/render-blog-rewrites.md) lists the blog rules to paste under Redirects/Rewrites in the dashboard.
- The Sixnine and Forged SA rules are `/forged-sa-wheels` → `/forged-sa-wheels.html` and `/sixnine-wheels/<series>` → `/sixnine-wheels/<series>.html`. The script does not add them; add them by hand, above the catch-all `/*` → `/index.html`.

Render applies the first rule that matches, from the top, so the catch-all must stay last. The Render MCP tools cannot edit routes or domains. To check a page, `curl -s https://www.forgedsa.co.za/blog/wheel-care/how-to-clean-forged-wheels | grep '<title>'` should show "How to clean forged wheels safely", not "Forged wheels for BMW M cars in stock".

**Checking a deploy.** Render's CDN caches each page's HTML for up to five minutes, so a visitor can see the previous version briefly after a deploy goes live. To check a new deploy straight away, add any query string to the URL, for example `/installs?check=1`.

**The domain.** `forgedsa.co.za` is live on the host as a custom domain: the `www` host serves the site and the bare domain redirects to it. To change it, edit the custom domain in the host's dashboard and the DNS records it gives you at the registrar (if the DNS is managed by the hosting provider, for example DirectAdmin, edit the A record for `@` and the CNAME for `www` there, remove any AAAA records, and leave the MX and mail records alone so email keeps working), then change `SITE.host` in `src/config/site.ts` so canonical URLs, the sitemap and `llms.txt` follow it.

Vercel's free Hobby plan is for non-commercial use only, so a business site needs Vercel Pro. Render's static sites are free to deploy; check the bandwidth included with the workspace plan against traffic.

For Firebase Hosting instead:

```json
{ "hosting": { "public": "dist", "rewrites": [{ "source": "**", "destination": "/index.html" }] } }
```

Build chunks are split per vendor (`react`, `motion`, `three`, `supabase`, `lucide`) and per route. `vendor-supabase` is fetched only when `/account` opens.

## Known limitations and roadmap

| Area | Today | Planned |
| --- | --- | --- |
| **Lead delivery** | Every enquiry is posted to n8n, which logs it and emails the business (see [Lead delivery](#lead-delivery-n8n)); with a WhatsApp number set, the form also opens WhatsApp. The inbox is set inside the n8n workflow. | Route leads into a CRM from the same workflow |
| **Contact channels** | Set in `src/config/site.ts`; any channel left empty there is hidden (Instagram, Facebook and trade email are empty today) | Fill in once confirmed |
| **3D accuracy** | Five designs are AI models (Tripo3D) made from photos and cleaned; faint bumps remain | Get the maker's CAD (ask Sixnine for FF-ONE and FF-THREE) or scans, then rebuild with `npm run build-wheel-models` |
| **Photography** | Two listings have no product photos (FSA003 Silver and FSA004 Hyper Black); their gallery shows renders of the 3D model, labelled "3D preview" in `customWheels.json` | Add their photos to the Drive folder, then run the studio-photo steps in [Adding or changing a wheel](#adding-or-changing-a-wheel) |
| **Link previews** | The app is client-rendered; `npm run build` bakes each page's title and share image into its own HTML file so chat apps show the right preview for the pages in the sitemap. Blog pages also carry their full article text in that file | Server-render the rest if more pages are added |
| **Blog content** | Nineteen articles of general knowledge, written without customer stories, photographs or a named author, because none were supplied | Add real install stories, workshop photographs and a named author, which search engines weigh as experience and expertise |
| **Old links** | Redirected in the browser and by a redirect page per removed address, not with an HTTP 301 | Add 301 rules on the host |
| **Unknown addresses** | Show the noindex not-found page, but the host still answers HTTP 200 | Return HTTP 404 from the host for unknown paths |
| **Domain** | Live at `www.forgedsa.co.za`; the bare domain redirects to it. The Render address still answers too (its pages name the `www` host as canonical, and the visit statistics ignore it) | Keep the Render address, or point it at the custom domain in the host's dashboard |
| **Admin publishing** | The uploader stores wheels locally; publishing is a data-file change and rebuild | Firebase-backed catalogue with authenticated admin writes |
| **Stock** | Counts are edited in `INVENTORY_SEEDS` and need a rebuild | Read from the stock sheet |
| **To-order colours** | Every design offers the same four swatch colours to order, with one lead time and no price | Confirm with the owner which colours each design can be ordered in, and their prices |
| **Dealer status** | The Sixnine page says "Official dealer" on the owner's word; no certificate is shown | Add the dealer certificate and the wording it supports |
| **Privacy notice** | Matches the site, but the retention periods are carried over from an older version, and no Information Officer or registration number is named | Owner to confirm, and have it legally reviewed |
| **Ask AI buttons** | The link formats follow each assistant's documented pattern; they have not been clicked through signed in | Test each once on the live site |
| **Install details** | Each car's make, model and paint were read from its photo, not confirmed | Shop to confirm, then correct `jobs.json` |
| **Leftovers from the starter** | `package.json` still lists `@google/genai`, `express` and `dotenv`, which no file imports. `.env.example`, `metadata.json` and a tracked `.aistudio/` folder (6 MB of screenshots) come from the same starter | Remove in one clean-up pull request |
| **Render routes** | Each address in `render.yaml`'s generated block has a rule on the domain's service, checked on 23 November 2026. A rule added in the dashboard that `render.yaml` does not list would not be tracked here | Re-check after any change to `render.yaml`: each `/blog/…` address should show its own title, not the home page's (see [Two Render services](#two-render-services)) |
| **Automated checks** | Type check, 282 tests in 28 files and the build, all run by hand, plus `npm run qa-wheels` for the 3D views. No CI, no browser tests, and ESLint is not wired to a script | Run the three checks on every pull request with a CI workflow |

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
