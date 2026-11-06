# FORGED Custom wheels — Luxury Editorial Showcase & Technical BMW Fitment Storefront

A unified dual-architecture automotive web application built with **React 19, TypeScript, Tailwind CSS v4, Motion, Zustand, and Lucide React**.

The platform combines two distinct yet cohesive digital experiences under the **FORGED Custom wheels** marque:
1. **The Editorial Brand Showcase (`/`)** — An architectural digital magazine featuring an isometric mag wheel CAD canvas, *Trusted by BMW* (3 UK BMW Locations) partnership showcase, certified distribution credentials, *Customer Fitments across South Africa*, clickable 3-image wheel cards with interactive cycling modal windows, a 16-slot *Client Fitments* Bento archive with dual-photo navigation, and a B2B *Dealer Application* portal.
2. **The Technical Specification Storefront (`/store`)** — A high-density, brutalist BMW M parts counter featuring a cascading 4-step *Vehicle Fitment Engine*, real-time SKU counter, filtered collection grids, and contiguous technical product pages where all shopping carts and checkouts are replaced with a direct *Interest Request Form*.
3. **The Global Atelier Footer** — Present on every page (`/`, `/store`, `/client-fitments`, `/dealer-application`, `/wheels/*`, `/privacy-policy`), featuring clean atelier typography, official Facebook & Instagram channels, allocation newsletter subscription, and full privacy compliance links.

---

## Table of Contents

1. [Architecture & Route Map](#1-architecture--route-map)
2. [Wheel Showcase: 3-Image Cycling System](#2-wheel-showcase-3-image-cycling-system)
3. [Client Fitments: Dual-Photo Architecture](#3-client-fitments-dual-photo-architecture)
4. [Technical Plan: How to Add Images to Customer Fitments](#4-technical-plan-how-to-add-images-to-customer-fitments)
5. [Brand Identity & Design Tokens](#5-brand-identity--design-tokens)
6. [Forms & Interactive Workflows Reference](#6-forms--interactive-workflows-reference)
7. [Local Development & Scripts](#7-local-development--scripts)

---

## 1. Architecture & Route Map

All routes are handled client-side via `src/utils/router.tsx` and `src/App.tsx` with instant scroll restoration and hash-anchor support. The global layout in `App.tsx` wraps all views with `BrandHeader`, `AppRoutes`, `StackedCircularFooter`, and `GlobalOverlays`:

| Route | Component | Description |
| :--- | :--- | :--- |
| `/` | `BrandHomePage` | Editorial landing page with `HeroSection`, `TrustedByBmwSection` (3 BMW locations), `CertifiedDistributorSection`, `EditorialFlow` (Customer Fitments across South Africa), and `WheelCatalogue` (`#catalogue`). |
| `/wheels/[slug]` | `WheelShowcasePDP` | Clickable 3-image cycling gallery (Front Monoblock Profile, 3/4 Deep Concave Depth, On-Vehicle BMW M Fitment Stance) with fullscreen lightbox window, finish swatches, and floating `Enquire` pill CTA. |
| `/client-fitments` | `ClientFitmentsPage` | Scrollable 4×4 Bento gallery of 16 verified BMW commissions, each equipped with dual photography (Stance & Concave Detail) and left/right navigation arrows. |
| `/dealer-application` | `DealerApplicationPage` | B2B trade accreditation portal with partnership pillars, workshop criteria, and interactive dealership onboarding dossier form. |
| `/admin/wheels` (`/admin`) | `AdminWheelUploader` | **Protected Route** gated by studio passcode (`FORGED-BMW-2026`) allowing administrators to publish new BMW wheels with an interactive image upload placeholder. |
| `/store` | `VehicleFitmentWidget` | Technical storefront home featuring the 4-step BMW Fitment Finder (`Make → Model → Year → Part`) and persisted session recall. |
| `/store/collections/[fitmentSlug]` | `FitmentCollectionView` | Filtered BMW model collection PLP with studio vehicle profile render, expandable SEO copy, diameter/sale filters, and 2-column brutalist product grid. |
| `/store/products/[productSlug]` | `TechnicalProductView` | Technical specification PDP with `TechnicalProductViewSkeleton`, finish selector, bespoke Interest Request Form, WhatsApp/IG/Phone bar, 10-row zebra spec table, and 2×2 angle gallery. |
| `/privacy-policy` | `PrivacyPolicyPage` | POPIA and GDPR compliant data governance, telemetry privacy, and cookie disclosure dossier. |

---

## 2. Wheel Showcase: 3-Image Cycling System

In place of rotating 3D wireframe graphics, both the catalogue and wheel showcase PDP use high-definition, clickable photographic cards with a modal gallery that cycles through 3 angles:

1. **Front Monoblock Profile (`Angle 1`)**: Direct studio flat-lay highlighting face geometry, spoke facets, and central hub recess.
2. **3/4 Deep Concave Depth (`Angle 2`)**: Perspective view demonstrating drop depth, spoke pocket milling, and barrel clearance.
3. **On-Vehicle BMW M Fitment (`Angle 3`)**: Road stance showing the wheel mounted on an M vehicle with flush arch stance and zero rubbing.

### Interaction Features:
- **Clickable Image Card**: In `WheelCatalogue.tsx`, clicking any wheel card opens an interactive window displaying the wheel in full resolution.
- **Left (`←`) & Right (`→`) Arrows**: Cycle smoothly between the 3 images.
- **Direct Angle Pills**: Tap `Image 1`, `Image 2`, or `Image 3` to jump directly to any view.
- **Keyboard Navigation**: Pressing `ArrowLeft` or `ArrowRight` triggers instant cycling; `Escape` closes the window.

---

## 3. Client Fitments: Dual-Photo Architecture

In `ClientFitmentsPage.tsx` and `EditorialFlow.tsx`, every client fitment is structured as a clean, minimalist photographic component:
- **Text Clutter Removed**: Extraneous placeholder badges and specs have been removed from card surfaces, leaving only the vehicle title and clean photography.
- **2 Images per Fitment**:
  - **Photo 1**: Stance & Arch Clearance Profile.
  - **Photo 2**: Forged Monoblock Spoke Geometry & Brake Caliper Clearance.
- **Navigation Controls**: Left and right chevron buttons appear directly on card hover and inside the centered lightbox modal window.

---

## 4. Technical Plan: How to Add Images to Customer Fitments

To populate real client photography into the Customer Fitments modules, use the following 3-phase technical plan:

### Phase 1: Asset Preparation & Image Specifications
1. **Aspect Ratio & Resolution**:
   - **Photo 1 (Full Stance)**: `16:10` or `16:9` ratio, minimum `2400 × 1500 px` (recommended `WEBP` or optimized `JPEG` < 400KB).
   - **Photo 2 (Detail / Wheel Concavity)**: `1:1` square or `4:3` ratio, minimum `1800 × 1800 px` focused on the caliper and spoke drop.
2. **Naming Convention**:
   Store images in an asset folder (e.g. `public/images/fitments/`) or CDN:
   - `[chassis]-[wheel]-[city]-01.webp` (Stance)
   - `[chassis]-[wheel]-[city]-02.webp` (Detail)
   *Example*: `g80-m3-type-52-chelsea-01.webp` & `g80-m3-type-52-chelsea-02.webp`.

### Phase 2: Updating the Static Data Sources
Each customer fitment item in `src/components/brand/ClientFitmentsPage.tsx` implements the `ClientFitmentItem` interface:

```typescript
export interface ClientFitmentItem {
  id: string;
  slotLabel: string;
  vehicleTitle: string;
  chassisCode: string;
  wheelModel: string;
  wheelSlug: string;
  storeProductSlug: string;
  staggeredSpec: string;
  finishName: string;
  clientCity: string;
  bentoClass: string;
  accentHex: string;
  images: [string, string]; // <-- Tuple of exactly 2 image URLs
  imageLabels: [string, string];
}
```

To update any slot with production photography:
1. Open `src/components/brand/ClientFitmentsPage.tsx`.
2. Locate the target item (e.g., `fitment-01`).
3. Replace the `images` tuple with your image URLs:
   ```typescript
   images: [
     '/images/fitments/g80-m3-type-52-chelsea-01.webp',
     '/images/fitments/g80-m3-type-52-chelsea-02.webp',
   ],
   ```
4. For the South African fitments on the Home Page, update `SOUTH_AFRICA_FITMENTS` in `src/components/brand/EditorialFlow.tsx` in the exact same manner.

### Phase 3: Runtime Client Photo Upload (No-Code Testing)
- Users and administrators can also test images live in the browser without code changes:
  1. Click any fitment card to open the modal window.
  2. Select **Photo 1** or **Photo 2**.
  3. Click **Upload Custom Photo**.
  4. Select a local file; the browser's `FileReader` immediately updates that slot's preview in real time.

---

## 5. Brand Identity & Design Tokens

### Color Palette
| Token Role | Hex | Usage |
| :--- | :--- | :--- |
| **Rich Black Canvas** | `#0A0A0A` | Deep velvet primary site background, dark stage canvas, root body |
| **Elevated Surface** | `#121215` / `#141418` | Stage platforms, brutalist product cards, editorial containers |
| **Card / Input Surface** | `#18181D` | Form inputs, modal dialogue boxes, filter containers, dropdowns |
| **Hairline Border** | `#26262E` / `#33333E` | Precision 1px grid borders, divider lines, and card frames |
| **Crisp Ivory (Text)** | `#F5F5F7` / `#FFFFFF` | Primary headings, titles, high-contrast labels, active buttons |
| **Silver Platinum (Text)** | `#C2C2CC` / `#A1A1AA` | Readable body copy, technical metadata, offsets, PCD specs |
| **Electric Orange (Accent)**| `#FF5500` | High-impact CTA buttons (`hover: #FF6B1A`), badges, active pills |

### Global Footer Architecture
- **Branding**: Symmetrical stacked circular logo badge with atelier address:
  `240 CANAL ROAD · BRADFORD · WEST YORKSHIRE · UNITED KINGDOM`
- **Navigation Links**: *The Collection*, *Client Fitments*, *Dealer Application*, *Admin Uploader*, *Privacy Policy*, and *Visit Wheel Store*.
- **Social Channels**: Exclusively **Facebook** and **Instagram** circular icon buttons.
- **Newsletter**: Instant allocation dispatch list registration with interactive confirmation feedback.

---

## 6. Forms & Interactive Workflows Reference

| Form / Interactive Module | Location | Validation & State Behavior |
| :--- | :--- | :--- |
| **1. Vehicle Fitment Finder** | `/store` (`VehicleFitmentWidget.tsx`) | Cascading 4-step state machine (`Make [BMW] → Model → Year → Part`). Auto-populates default year upon selecting a BMW model, shows live product count, and persists selection. |
| **2. Admin Passcode & Wheel Uploader** | `/admin/wheels` (`AdminWheelUploader.tsx`) | Protected route gate (`FORGED-BMW-2026`). Validates required fields, locks brand to `BMW`, supports drag-and-drop file preview, and syncs entries to `useKahnStore`. |
| **3. Dealer Application Dossier** | `/dealer-application` (`DealerApplicationPage.tsx`) | Captures corporate identity, VAT number, principal contact, facility classification, monthly allocation tier, and workshop criteria. Generates trade reference (`FORGED-DLR-XXXXXX`). |
| **4. Specification & Fitment Enquiry** | Global Modal (`GlobalOverlays.tsx`) | Triggered from any `Enquire` CTA or `Book Visit` button. Pre-fills subject, part number, finish, and Rand (ZAR) price; logs enquiries with reference `FORGED-XXXXXX`. |

---

## 7. Local Development & Scripts

```bash
# Install dependencies
npm install

# Start Vite development server on port 3000
npm run dev

# Type-check and build production bundle
npm run build

# Run CLI wheel generator
npm run add-wheel -- --help
```
