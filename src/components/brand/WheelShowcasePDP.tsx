import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Camera, ChevronLeft, ChevronRight, MessageCircle, Play } from 'lucide-react';
import {
  BrandWheelItem,
  WHEEL_FINISHES,
  type WheelFinishId,
  type WheelFinishOption,
  findWheelBySlug,
  formatZAR,
  getAllBrandWheels,
  getSiblingListings,
  getToOrderFinishes,
  TO_ORDER_LEAD_TIME,
  TO_ORDER_NOTICE,
  getWheelImages,
  brandOfWheel,
  WHEEL_BRANDS,
  capLogoForDesign,
  designName,
} from '../../data/catalogue';
import { whatsappLink } from '../../config/site';
import { carPreviewEnabled } from '../../utils/carPreview';
import { Link, useRouter } from '../../utils/router';
import { cutoutSrcFor, formatSizes } from '../../utils/designCards';
import { sixnineSizesForListing } from '../../utils/listingSpecs';
import { sizeLine, type SixnineSize } from '../../data/sixnineSeries';
import { wheelImageSrcSet } from '../../utils/wheelImageSrcSet';
import { useForgedStore } from '../../store/useForgedStore';
import {
  describeWheelForEnquiry,
  parseTechnicalSpecSheet,
  stockLabel,
  wheelEnquiryMessage,
} from '../../utils/wheelEnquiry';
import { prefersReducedMotion } from '../../wheel-viewer/wheelStudioParts';
import { BrandHeader } from './BrandHeader';
import { CarPreviewDialog } from './CarPreviewDialog';
import { CatalogueSwatch, ColourSwatches } from './ColourSwatches';
import { WheelOutline } from './WheelCatalogue';
import { WheelStage } from '../visuals/WheelStage';

/**
 * One wheel in stock: photos first, then name, price, sizes and specs, with a single call to
 * action (enquire on WhatsApp). The 3D view is opt-in: nothing 3D (no WebGL, no three.js, no GLB)
 * loads until the visitor taps "View in 3D".
 *
 * Layout: one column up to 1024 px (phones and tablets get a full-width gallery and a sticky price
 * bar); two columns from `lg:` with the details column sticky beside the photos.
 */

interface WheelShowcasePDPProps {
  slug: string;
}

const PRIMARY_BUTTON =
  'press inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-base font-semibold text-[#111111] hover:bg-white/90 cursor-pointer';

/** Black with white text; the neon laser runs round its edge while a preview is being made (index.css). */
const CAR_PREVIEW_BUTTON =
  'laser-button inline-flex h-12 w-full items-center justify-center gap-2 px-6 text-base font-medium cursor-pointer';

/** The soft lighter glow behind a wheel, as on the home page's design cards. */
const WHEEL_GLOW = 'bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.09),transparent_65%)]';

/** Real photographs only: a generated stand-in picture (data: URL) is not a photo of this wheel. */
function realPhotos(wheel: BrandWheelItem): string[] {
  return getWheelImages(wheel).images.filter((src) => src && !src.startsWith('data:'));
}

export const WheelShowcasePDP: React.FC<WheelShowcasePDPProps> = ({ slug }) => {
  const { navigate } = useRouter();
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);
  const wheel = findWheelBySlug(slug, customBrandWheels);

  if (!wheel) {
    return (
      <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
        <BrandHeader forceLight={false} />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold text-white">This wheel is not available</h1>
          <p className="mt-3 text-neutral-300">It may have sold. Here is what we have in stock now.</p>
          <button
            type="button"
            onClick={() => navigate('/#catalogue')}
            className={`${PRIMARY_BUTTON} mt-8 !w-auto mx-auto`}
          >
            See wheels in stock
          </button>
        </main>
      </div>
    );
  }

  // key: a different wheel always starts from a clean page (photos, 3D closed).
  return <WheelDetail key={wheel.slug} wheel={wheel} />;
};

const WheelDetail: React.FC<{ wheel: BrandWheelItem }> = ({ wheel }) => {
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);
  const openEnquiryModal = useForgedStore((state) => state.openEnquiryModal);

  const [studioOpen, setStudioOpen] = useState(false);
  // "See it on my car": only offered once the owner has set the Worker's address (see config/site.ts).
  const carPreviewOn = carPreviewEnabled();
  const [carPreviewOpen, setCarPreviewOpen] = useState(false);
  // True while the dialog is making a preview, so the button behind it shows the laser too.
  const [carPreviewWorking, setCarPreviewWorking] = useState(false);
  const carPreviewButtonRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const view3DButtonRef = useRef<HTMLButtonElement | null>(null);

  const has3D = Boolean(wheel.modelUrl);
  const photos = realPhotos(wheel);
  // The transparent cut-out of the three-quarter photo opens the gallery on the dark page colour.
  const cutout = cutoutSrcFor(getWheelImages(wheel).images[1]);
  const siblings = getSiblingListings(wheel, customBrandWheels);
  const otherFinishPhotos: OtherFinishPhotos[] = siblings
    .map((s) => ({
      name: s.finishName ?? WHEEL_FINISHES[s.defaultFinish]?.name ?? 'Standard',
      slug: s.slug,
      photos: realPhotos(s),
    }))
    .filter((s) => s.photos.length > 0);
  // Sixnine's published figures for the sizes this set is (see listingSpecs.ts); empty for Forged SA.
  const sixnineSizes = sixnineSizesForListing(wheel);
  const toOrderFinishes = getToOrderFinishes(wheel, customBrandWheels);
  // The colour shown in the 3D view: the stocked one, or a to-order colour being previewed.
  const [previewFinish, setPreviewFinish] = useState(wheel.defaultFinish);
  const previewingToOrder = previewFinish !== wheel.defaultFinish;
  const others = getAllBrandWheels(customBrandWheels)
    .filter((w) => w.slug !== wheel.slug)
    .slice(0, 4);

  const design = wheel.modelCode ? designName(wheel.modelCode) : wheel.model;
  const finishLabel = wheel.finishName ?? WHEEL_FINISHES[wheel.defaultFinish]?.name ?? 'Standard';
  const stageFinishNames = useMemo(() => ({ [wheel.defaultFinish]: finishLabel }), [wheel.defaultFinish, finishLabel]);
  const priceText = formatZAR(wheel.priceZAR);
  // The wheel's brand: the line under its name, and where the back link returns to.
  const brandId = brandOfWheel(wheel);
  const brand = brandId ? WHEEL_BRANDS[brandId] : undefined;
  const stock = stockLabel(wheel.stockQuantitySets);
  const specs = parseTechnicalSpecSheet(wheel.technicalSpecSheet);
  const construction = /piece/i.test(wheel.otherFinishes ?? '') ? wheel.otherFinishes : undefined;

  const descriptor = describeWheelForEnquiry({
    design,
    finish: finishLabel,
    sizes: wheel.sizesAvailable,
    price: priceText,
  });
  const message = wheelEnquiryMessage(descriptor);
  const whatsappHref = whatsappLink(message);

  const openStudio = useCallback(() => {
    setStudioOpen(true);
    // Bring the stage into view once it has rendered (the visitor may have tapped lower down).
    requestAnimationFrame(() =>
      stageRef.current?.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      })
    );
  }, []);

  // A colour swatch shows that colour on the 3D wheel, opening the 3D view first if it is closed.
  const showColour = useCallback(
    (finishId: WheelFinishId) => {
      setPreviewFinish(finishId);
      if (!studioOpen) openStudio();
    },
    [studioOpen, openStudio]
  );

  const closeStudio = useCallback(() => {
    setStudioOpen(false);
    requestAnimationFrame(() => view3DButtonRef.current?.focus());
  }, []);

  // The button opens the enquiry form, already filled in. The form posts the enquiry to the n8n
  // lead workflow (logged and emailed to the shop) and, with a WhatsApp number configured, then
  // opens WhatsApp with the same message.
  const openForm = () =>
    openEnquiryModal({
      subject: message,
      finish: finishLabel,
      priceZAR: wheel.priceZAR,
      domain: 'brand',
    });

  // A to-order colour: the enquiry says it is made to order and states the lead time.
  const askAboutColour = (finish: WheelFinishOption) =>
    openEnquiryModal({
      subject: `Hi, I'd like the ${design} in ${finish.name}. I understand this colour is made to order, with a lead time of ${TO_ORDER_LEAD_TIME}.`,
      finish: finish.name,
      domain: 'brand',
    });

  const closeCarPreview = useCallback(() => setCarPreviewOpen(false), []);

  // Closes the preview first and opens the enquiry on the next frame, so the two dialogs never
  // overlap (each locks the page's scroll and returns focus when it closes).
  const enquireAboutPreview = (note: string) => {
    setCarPreviewOpen(false);
    requestAnimationFrame(() =>
      openEnquiryModal({
        subject: `${message}\n${note}`,
        finish: finishLabel,
        priceZAR: wheel.priceZAR,
        domain: 'brand',
      })
    );
  };

  const openCarPreview = (event: React.MouseEvent<HTMLButtonElement>) => {
    carPreviewButtonRef.current = event.currentTarget;
    setCarPreviewOpen(true);
  };

  const carPreviewButton = carPreviewOn && (
    <button
      type="button"
      onClick={openCarPreview}
      data-working={carPreviewWorking}
      className={CAR_PREVIEW_BUTTON}
    >
      <Camera className="w-5 h-5" aria-hidden="true" />
      See it on my car
    </button>
  );

  const enquireButton = (
    <button type="button" onClick={openForm} className={PRIMARY_BUTTON}>
      {whatsappHref && <MessageCircle className="w-5 h-5" aria-hidden="true" />}
      {whatsappHref ? 'Enquire on WhatsApp' : 'Send an enquiry'}
    </button>
  );

  const specRows: { label: string; value: string }[] = [
    wheel.sizesAvailable && { label: 'Sizes', value: formatSizes(wheel.sizesAvailable) },
    // Bolt pattern, offset and centre bore are in the technical data table when Sixnine's sizes match.
    !sixnineSizes.length && specs.pcd && { label: 'PCD (bolt pattern)', value: specs.pcd },
    !sixnineSizes.length && specs.et && { label: 'ET (offset)', value: specs.et },
    !sixnineSizes.length && specs.cb && {
      label: 'CB (centre bore)',
      value: /^\d+(\.\d+)?$/.test(specs.cb) ? `${specs.cb} mm` : specs.cb,
    },
    construction && { label: 'Build', value: construction },
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  return (
    <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
      <BrandHeader forceLight={false} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-3 pb-12 lg:pb-16">
        {/* Back to the wheel's brand page, the same step its breadcrumb names. */}
        <Link
          to={brand?.path ?? '/#catalogue'}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {brand ? brand.name : 'Wheels in stock'}
        </Link>

        <div className="mt-1 lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">
          {/* Photos first; the 3D stage takes this slot once the visitor asks for it. */}
          <div ref={stageRef} className="scroll-mt-20">
            {studioOpen && has3D ? (
              <>
                <WheelStage
                  wheelModel={wheel.model}
                  selectedFinish={previewFinish}
                  availableFinishes={[wheel.defaultFinish, ...toOrderFinishes.map((f) => f.id)]}
                  onSelectFinish={setPreviewFinish}
                  finishName={previewingToOrder ? WHEEL_FINISHES[previewFinish]?.name ?? finishLabel : finishLabel}
                  finishNames={stageFinishNames}
                  modelUrl={wheel.modelUrl}
                  rearModelUrl={wheel.rearModelUrl}
                  capLogo={capLogoForDesign(wheel.modelCode)}
                  onClose={closeStudio}
                />
                <p className="mt-2 text-xs text-neutral-400">
                  The 3D view is a guide to shape and finish. The photos show the real wheels.
                </p>
                {previewingToOrder && (
                  <p className="mt-1 text-xs text-[#F43F5E]">
                    This colour is not in stock. {TO_ORDER_NOTICE}
                  </p>
                )}
              </>
            ) : photos.length > 0 ? (
              <PhotoGallery
                photos={photos}
                cutout={cutout}
                otherFinishes={otherFinishPhotos}
                altBase={`${wheel.model} forged wheel`}
                onView3D={has3D ? openStudio : undefined}
                triggerRef={view3DButtonRef}
              />
            ) : (
              <NoPhotoPanel
                label={wheel.model}
                onView3D={has3D ? openStudio : undefined}
                triggerRef={view3DButtonRef}
              />
            )}
          </div>

          <div className="mt-5 lg:mt-0 lg:sticky lg:top-24">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white">
              {wheel.model}
            </h1>
            {/* The brand, linked to its page: "Forged SA · our own designs", "Sixnine Wheels · official dealer". */}
            {brand && (
              <p className="mt-1 text-sm text-neutral-300">
                <Link to={brand.path} className="underline underline-offset-4 hover:text-white">
                  {brand.name} · {brand.relation.toLowerCase()}
                </Link>
              </p>
            )}
            <p className="mt-2 text-2xl font-semibold text-white">
              {priceText}{' '}
              <span className="text-base font-normal text-neutral-300">per set of 4</span>
            </p>
            {stock && (
              <p className="mt-2">
                <span className="inline-flex rounded-full bg-[#EDEBE4] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                  {stock}
                </span>
              </p>
            )}
            {wheel.compatibleCars && (
              <p className="mt-2 text-sm text-neutral-300">
                Fits BMW {wheel.compatibleCars}. Send us your car and we confirm the fit.
              </p>
            )}

            <div className="mt-5">
              <ColourSwatches
                current={{ finishId: wheel.defaultFinish, name: finishLabel }}
                siblings={siblings.map((s) => ({
                  slug: s.slug,
                  finishId: s.defaultFinish,
                  name: s.finishName ?? WHEEL_FINISHES[s.defaultFinish]?.name ?? 'Standard',
                }))}
                toOrder={toOrderFinishes}
                shown={previewFinish}
                has3D={has3D}
                onShow={showColour}
                onAskAbout={askAboutColour}
              />
            </div>

            <dl className="mt-6 border-t border-[#26262E]">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 border-b border-[#26262E] py-3"
                >
                  <dt className="text-sm text-neutral-400">{row.label}</dt>
                  <dd className="text-sm font-medium text-white text-right">{row.value}</dd>
                </div>
              ))}
            </dl>

            {sixnineSizes.length > 0 && <TechnicalData sizes={sixnineSizes} />}

            <div className="mt-6 hidden lg:block space-y-3">
              {enquireButton}
              {carPreviewButton}
            </div>
          </div>
        </div>

        {others.length > 0 && (
          <section aria-labelledby="more-wheels" className="mt-14 border-t border-[#26262E] pt-8">
            <h2 id="more-wheels" className="text-lg font-semibold text-white">
              More wheels in stock
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {others.map((w) => (
                <li key={w.slug}>
                  <Link
                    to={`/wheels/${w.slug}`}
                    className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-[#26262E] px-4 py-2 hover:border-[#1D4ED8]"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <CatalogueSwatch finishId={w.defaultFinish} name={w.finishName} size={28} />
                      <span className="truncate text-sm font-medium text-white">{w.model}</span>
                    </span>
                    <span className="shrink-0 text-sm text-neutral-300">{formatZAR(w.priceZAR)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* Phones and tablets: price and the one action stay in reach while scrolling. Sticky, not
          fixed: the bar sits at the foot of the viewport while this page is on screen and scrolls
          away with the end of the page, so it never covers the site footer below. */}
      <aside
        aria-label="Price and enquiry"
        className="sticky bottom-0 z-40 border-t border-[#26262E] bg-[#111111]/95 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
      >
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="text-lg font-semibold text-white">
            {priceText} <span className="text-xs font-normal text-neutral-300">per set of 4</span>
          </p>
          {carPreviewOn ? (
            <button
              type="button"
              onClick={openCarPreview}
              data-working={carPreviewWorking}
              className="laser-button inline-flex min-h-11 shrink-0 items-center gap-1.5 px-3.5 text-sm font-medium cursor-pointer"
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              See it on my car
            </button>
          ) : (
            stock && <p className="text-xs text-neutral-300">{stock}</p>
          )}
        </div>
        {enquireButton}
      </aside>

      {carPreviewOpen && (
        <CarPreviewDialog
          wheelSlug={wheel.slug}
          wheelName={`${design} — ${finishLabel}`}
          onClose={closeCarPreview}
          onEnquire={enquireAboutPreview}
          onWorkingChange={setCarPreviewWorking}
          returnFocusRef={carPreviewButtonRef}
        />
      )}
    </div>
  );
};

/**
 * The one "View in 3D" control on a page with photos: a play-style button laid over the first
 * slide. Closing the 3D view returns focus to it through triggerRef.
 */
const View3DPoster: React.FC<{ onClick: () => void; triggerRef: React.Ref<HTMLButtonElement> }> = ({
  onClick,
  triggerRef,
}) => (
  <button
    ref={triggerRef}
    type="button"
    onClick={onClick}
    className="absolute bottom-3 left-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-black/75 px-4 text-sm font-semibold text-white backdrop-blur cursor-pointer hover:bg-black"
  >
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1D4ED8]">
      <Play className="h-3 w-3 fill-[#111111] text-[#111111]" aria-hidden="true" />
    </span>
    View in 3D
  </button>
);

/**
 * How wide a gallery slide is drawn, so the browser can pick the smallest copy that fills it (see
 * wheelImageSrcSet): the full page width up to 1024 px (phones and tablets), then half of the
 * container (1152 px at most) beside the details column.
 */
const GALLERY_SIZES = '(min-width:1200px) 532px, (min-width:1024px) 46vw, 92vw';

/** One slide: the transparent cut-out floats on the dark page colour; a photo fills its frame. */
interface GallerySlide {
  src: string;
  kind: 'cutout' | 'photo';
  /** The pixel size of the file, for the img width/height attributes. */
  size: number;
  /** Set on photos of the design's other finishes in stock: the finish shown and its own page. */
  finish?: { name: string; slug: string };
}

/** The design's other finishes in stock, as gallery photos after this listing's own. */
export interface OtherFinishPhotos {
  name: string;
  slug: string;
  photos: string[];
}

/**
 * Swipeable slides (scroll-snap, so vertical page scrolling is never trapped): the wheel's cut-out
 * first when it has one, then the real photos. The first slide is the page's largest image and
 * loads eagerly at high priority; the rest load lazily.
 */
const PhotoGallery: React.FC<{
  photos: string[];
  cutout?: string;
  altBase: string;
  otherFinishes?: OtherFinishPhotos[];
  onView3D?: () => void;
  triggerRef: React.Ref<HTMLButtonElement>;
}> = ({ photos, cutout, altBase, otherFinishes = [], onView3D, triggerRef }) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const slides: GallerySlide[] = [
    ...(cutout ? [{ src: cutout, kind: 'cutout' as const, size: 1000 }] : []),
    ...photos.map((src) => ({ src, kind: 'photo' as const, size: 1600 })),
    // Then the same design in its other finishes in stock, as SIXNINE's gallery runs through every
    // finish. Each is labelled and links to its own page, since its price and stock are its own.
    ...otherFinishes.flatMap((other) =>
      other.photos.map((src) => ({ src, kind: 'photo' as const, size: 1600, finish: { name: other.name, slug: other.slug } }))
    ),
  ];
  const count = slides.length;

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = (index + count) % count;
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
    setActive(clamped);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActive(Math.min(count - 1, Math.round(track.scrollLeft / track.clientWidth)));
  };

  const slideAlt = (slide: GallerySlide, i: number) =>
    slide.kind === 'cutout'
      ? `${altBase}, cut-out, 1 of ${count}`
      : slide.finish
        ? `The same design in ${slide.finish.name}, photo ${i + 1} of ${count}`
        : `${altBase}, photo ${i + 1} of ${count}`;

  return (
    <div role="region" aria-roledescription="carousel" aria-label={`${altBase} photos`}>
      {/* The frame clips the slides and keeps the arrows inside it. */}
      <div className="relative overflow-hidden rounded-2xl border border-[#26262E] bg-[#18181D]">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          tabIndex={0}
          role="group"
          aria-label="Photos; use the arrow keys"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') goTo(active + 1);
            if (e.key === 'ArrowLeft') goTo(active - 1);
          }}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => (
            <div key={slide.src} className="relative aspect-square w-full shrink-0 snap-center">
              {slide.kind === 'cutout' && <div aria-hidden="true" className={`absolute inset-0 ${WHEEL_GLOW}`} />}
              <img
                {...wheelImageSrcSet(slide.src, GALLERY_SIZES)}
                alt={slideAlt(slide, i)}
                width={slide.size}
                height={slide.size}
                // The first slide is the largest thing on the page: never lazy.
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding={i === 0 ? 'sync' : 'async'}
                className={`relative h-full w-full ${
                  slide.kind === 'cutout'
                    ? 'object-contain p-8 drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)]'
                    : 'object-cover'
                }`}
              />
              {i === 0 && onView3D && <View3DPoster onClick={onView3D} triggerRef={triggerRef} />}
              {slide.finish && (
                <Link
                  to={`/wheels/${slide.finish.slug}`}
                  tabIndex={active === i ? 0 : -1}
                  className="absolute left-3 top-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-bold uppercase tracking-[0.08em] text-[#111111] hover:bg-white/90"
                >
                  {slide.finish.name}
                  <span className="font-semibold normal-case tracking-normal text-[#111111]/60">· view this finish</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white backdrop-blur-sm hover:bg-black cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white backdrop-blur-sm hover:bg-black cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs tabular-nums text-white backdrop-blur-sm"
            >
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <>
          {/* Thumbnails, as on SIXNINE's product page: every slide, the current one outlined. */}
          <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto p-0.5">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1} of ${count}${slide.finish ? `, ${slide.finish.name}` : ''}`}
                aria-current={active === i ? 'true' : undefined}
                className={`press relative aspect-square w-[68px] shrink-0 overflow-hidden rounded-xl border bg-[#18181D] transition-[opacity,border-color] sm:w-[84px] cursor-pointer ${
                  active === i ? 'border-neutral-400 opacity-100' : 'border-[#26262E] opacity-60 hover:opacity-90'
                }`}
              >
                <img
                  {...wheelImageSrcSet(slide.src, '84px')}
                  alt=""
                  width={84}
                  height={84}
                  loading="lazy"
                  decoding="async"
                  className={`h-full w-full ${slide.kind === 'cutout' ? 'object-contain p-[8%]' : 'object-cover'}`}
                  // A photo that fails to load (for example one added from the admin page and since
                  // removed) drops its thumbnail rather than showing a broken image; the arrows still reach it.
                  onError={(e) => {
                    const button = e.currentTarget.closest('button');
                    if (button) button.hidden = true;
                  }}
                />
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Photo {active + 1} of {count}
          </p>
        </>
      )}
    </div>
  );
};

/**
 * Sixnine's technical data for the sizes this set is, laid out like the table on SIXNINE's product
 * pages: one column per size, a row per figure. A figure Sixnine does not give is shown as a dash.
 */
const TechnicalData: React.FC<{ sizes: SixnineSize[] }> = ({ sizes }) => {
  const rows: { label: string; value: (size: SixnineSize) => string | null }[] = [
    { label: 'Wheel size', value: (z) => (z.width && z.diameter ? `${z.width}Jx${z.diameter}` : z.size) },
    { label: 'Offset (ET)', value: (z) => (z.offset !== null ? `ET${z.offset}` : null) },
    { label: 'Bolt pattern', value: (z) => z.boltPatterns.join(' / ') || null },
    { label: 'Load rating', value: (z) => (z.loadKg ? `${z.loadKg} kg` : null) },
    { label: 'Centre bore', value: (z) => (z.centreBoreMm ? `${z.centreBoreMm} mm` : null) },
    { label: 'Concavity', value: (z) => (z.concavityMm ? `${z.concavityMm} mm` : null) },
    { label: 'Wheel weight', value: (z) => (z.weightKg ? `≈ ${z.weightKg} kg` : null) },
  ];
  return (
    <section aria-labelledby="technical-data" className="mt-8">
      <h2 id="technical-data" className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
        Technical data
      </h2>
      <table className="mt-3 w-full border-collapse text-sm tabular-nums">
        <thead>
          <tr className="border-b border-[#3A3A44]">
            <th scope="col" className="py-2.5 pr-3 text-left font-medium text-neutral-400">
              <span className="sr-only">Figure</span>
            </th>
            {sizes.map((z) => (
              <th key={sizeLine(z)} scope="col" className="py-2.5 pl-3 text-right font-semibold text-white">
                {z.diameter}″
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-[#26262E]">
              <th scope="row" className="py-2.5 pr-3 text-left font-normal text-neutral-400">
                {row.label}
              </th>
              {sizes.map((z) => (
                <td key={sizeLine(z)} className="py-2.5 pl-3 text-right font-medium text-white">
                  {row.value(z) ?? '–'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-neutral-500">
        Sixnine Wheels' published figures for these sizes. Ask us to confirm the fit for your car.
      </p>
    </section>
  );
};

/** A listing with no photos yet: say so plainly, and offer the 3D view if there is one. */
const NoPhotoPanel: React.FC<{
  label: string;
  onView3D?: () => void;
  triggerRef: React.Ref<HTMLButtonElement>;
}> = ({ label, onView3D, triggerRef }) => (
  <div className="relative flex aspect-square md:aspect-[4/3] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-[#26262E] bg-[#18181D] p-6 text-center">
    <div aria-hidden="true" className={`absolute inset-0 ${WHEEL_GLOW}`} />
    <WheelOutline className="relative h-28 w-28 text-[#33333E]" />
    <div className="relative">
      <p className="text-lg font-semibold text-white">{label}</p>
      <p className="mt-1 text-sm text-neutral-300">{onView3D ? 'No photos yet. See it in 3D.' : 'No photos yet.'}</p>
    </div>
    {onView3D && (
      <button
        ref={triggerRef}
        type="button"
        onClick={onView3D}
        className="relative inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1D4ED8] px-6 text-base font-semibold text-white hover:bg-[#2563EB] cursor-pointer"
      >
        <Play className="h-4 w-4 fill-current" aria-hidden="true" />
        View in 3D
      </button>
    )}
  </div>
);
