# High-Resolution Cinematic Wheel Lightbox Gallery

This plan details the implementation of a full-screen cinematic Lightbox gallery for the FORGED Wheel Catalogue, opening seamlessly upon clicking any wheel card to showcase high-fidelity multi-angle photography with interactive pan/zoom magnification and real-time finish switching.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed by the user during the interactive clarification phase and will directly govern the implementation:

- **Stage Layout**: Full-screen cinematic viewport stage with an interactive bottom angle filmstrip previewing high-fidelity studio angles (face profile, deep concave 3/4 angle, and on-vehicle fitment stance).
- **Interactive Controls**: Pan-and-zoom magnification (1x to 3x with click/wheel zoom, mouse drag pan, and touch pinch) paired with a live alloy finish selector (`Liquid Silver`, `Satin Black`, `Champagne Bronze`, `Anthracite Gunmetal`).
- **Visual Aesthetic**: Deep obsidian backdrop (`#050507` at 95% opacity) with glassmorphic controls (`backdrop-blur-xl`, hairline borders `#26262E`, and high-visibility Forge Orange `#FF5500` accents).

---

### 1. Overview & Core Concept

- **What It Does**: Clicking any wheel card in the catalogue (`#catalogue`) immediately expands an immersive, full-screen high-resolution lightbox. Collectors and clients can inspect surface milling, concavity, and spoke facets across multiple studio angles with smooth zoom and pan, preview different finishes, and transition directly to specification inquiry.
- **Target Audience / Persona**: Luxury and performance car owners evaluating bespoke forged wheels for BMW M and exotic chassis who require crisp, high-resolution inspection of craftsmanship before ordering.
- **Key Value**: Replaces basic modal viewing with an editorial, ultra-responsive inspection tool that eliminates visual clutter and highlights engineering quality.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Activation**: User browses `#catalogue` and clicks any wheel card or inspect button. The lightbox opens instantly with a fade and scale reveal (`< 180ms`).
  2. **Angle Switching & Filmstrip Navigation**: The primary stage showcases the selected high-resolution angle. The bottom filmstrip renders live interactive thumbnails with angle labels (e.g., `Front Monoblock Profile`, `3/4 Concave Depth`, `Vehicle Stance`). Clicking any thumbnail or using keyboard arrows (`Left`/`Right`) smoothly swaps the active view.
  3. **Pan & Zoom Magnification**:
     - Hovering or clicking the zoom button triggers 1x $\to$ 2x $\to$ 3x zoom.
     - While zoomed, moving the cursor or dragging pans across the ultra-high-definition texture of the wheel billet and bevels.
     - Double-click or reset button returns to 1x fit.
  4. **Finish Exploration**: An unobtrusive floating glass bar lets users switch finishes (`Liquid Silver`, `Satin Black`, `Champagne Bronze`, `Anthracite Gunmetal`) with synchronized swatch updates.
  5. **Direct Action**: Subtle top/bottom action pills permit seamless transition: "Request Build Specification" (opens the enquiry modal pre-filled) or "View Technical PDP".
  6. **Dismissal**: Closes via `Escape` key, top-right close icon, or clicking the backdrop outside the stage.

- **Visual Identity & Theme**:
  - *Backdrop*: Obsidian glass (`rgba(5, 5, 7, 0.94)` with `backdrop-filter: blur(24px)`).
  - *Borders & Structural Lines*: Ultra-thin hairline dividers (`border-[#26262E] / border-white/10`).
  - *Typography*: Clean neo-grotesque sans (`Geist Sans` / `Plus Jakarta Sans`) paired with monospace technical readouts (`Geist Mono` tabular figures for specs and angle index `01 / 03`).
  - *Anti-Slop Discipline*: Zero static badge pills, zero fake telemetry meters, and clean unboxed typographic labels.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Screen Stage with Bottom Filmstrip vs. Split Side-by-Side Panel**
  - *Chosen Approach*: Dedicated full-screen cinematic stage centered on the photography, moving metadata and controls to sleek floating glass headers and footers.
  - *Why*: Maximizes pixel real estate for inspecting spoke machining and concavity without horizontal visual compression.
  - *Alternatives Considered*: Split side-drawer modal (crowds the image on laptops and tablets).

- **Decision 2: Pointer-Driven Zoom & Smooth Pan Engine**
  - *Chosen Approach*: Transform-based zoom (`scale` + `translate`) constrained to boundary bounding box with smooth CSS/motion damping.
  - *Why*: 60fps compositor-only animation with no layout recalculation or image re-fetching.
  - *Alternatives Considered*: CSS background-image magnifier lens (inflexible on mobile touch screens).

- **Decision 3: Keyboard and Accessibility First**
  - *Chosen Approach*: Focus trapping, `Escape` key dismiss, `ArrowLeft`/`ArrowRight` angle cycling, `+`/`-` zoom keys, and full ARIA dialog labeling.
  - *Why*: Ensures seamless keyboard navigation and WCAG AA compliance.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

#### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WHEEL CATALOGUE COMPONENT                       │
│                     (src/components/brand/WheelCatalogue.tsx)         │
├────────────────────────────────────────────────────────────────────────┤
│ • Marque Segmented Filter ('ALL' | 'BMW')                              │
│ • Hairline Responsive Product Grid                                     │
│ • Card Click Handler -> Opens High-Resolution Lightbox                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ triggers
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 WHEEL LIGHTBOX GALLERY MODAL / COMPONENT               │
│               (src/components/brand/WheelLightboxModal.tsx)            │
├────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Top Bar: Title, Series, Finish Badge, Fullscreen & Close (ESC)    │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Main Cinematic Stage:                                              │ │
│ │ • High-Resolution Viewport with Pan & Zoom Engine (1x - 3x)        │ │
│ │ • Next / Previous Navigation Hotspots & Chevrons                   │ │
│ │ • Zoom Level Indicator & Reset Affordance                          │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Floating Control Toolbar:                                          │ │
│ │ • Finish Selector Swatches (Silver, Black, Bronze, Gunmetal)       │ │
│ │ • Zoom Controls (- / + / 100%)                                     │ │
│ │ • Request Build CTA (opens EnquiryModal)                           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Bottom Angle Filmstrip:                                            │ │
│ │ • 3 High-Fidelity Angle Thumbnails with Active Glow Indicator      │ │
│ │ • Viewport Perspective Labels ('Front Profile', '3/4 Concave')     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### State & Interaction Management
- `isOpen: boolean`: Lightbox mount state.
- `activeWheel: BrandWheelItem`: The active selected wheel model and spec data.
- `activeAngleIndex: 0 | 1 | 2`: Currently viewed photography angle.
- `zoomScale: number` (1 to 3): Zoom level, reset upon angle change.
- `panOffset: { x: number, y: number }`: Drag coordinates constrained within bounds.
- `selectedFinish: WheelFinishId`: Active finish choice, synchronizing with store enquiry context.
