import React, { useCallback, useRef, useState } from 'react';
import { ArrowLeft, Camera, ChevronLeft, ChevronRight, MessageCircle, Play } from 'lucide-react';
import {
  BrandWheelItem,
  WHEEL_FINISHES,
  WheelFinishOption,
  findWheelBySlug,
  formatZAR,
  getAllBrandWheels,
  getSiblingListings,
  getToOrderFinishes,
  TO_ORDER_LEAD_TIME,
  TO_ORDER_NOTICE,
  getWheelImages,
  isSixnineWheel,
} from '../../data/catalogue';
import { whatsappLink } from '../../config/site';
import { carPreviewEnabled } from '../../utils/carPreview';
import { Link, useRouter } from '../../utils/router';
import { cutoutSrcFor, formatSizes } from '../../utils/designCards';
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
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1D4ED8] px-6 text-base font-semibold text-white hover:bg-[#2563EB] active:bg-[#1E40AF] transition-colors cursor-pointer';

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
  const toOrderFinishes = getToOrderFinishes(wheel, customBrandWheels);
  // The colour shown in the 3D view: the stocked one, or a to-order colour being previewed.
  const [previewFinish, setPreviewFinish] = useState(wheel.defaultFinish);
  const previewingToOrder = previewFinish !== wheel.defaultFinish;
  const others = getAllBrandWheels(customBrandWheels)
    .filter((w) => w.slug !== wheel.slug)
    .slice(0, 4);

  const design = wheel.modelCode ?? wheel.model;
  const finishLabel = wheel.finishName ?? WHEEL_FINISHES[wheel.defaultFinish]?.name ?? 'Standard';
  const priceText = formatZAR(wheel.priceZAR);
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
    specs.pcd && { label: 'PCD (bolt pattern)', value: specs.pcd },
    specs.et && { label: 'ET (offset)', value: specs.et },
    specs.cb && {
      label: 'CB (centre bore)',
      value: /^\d+(\.\d+)?$/.test(specs.cb) ? `${specs.cb} mm` : specs.cb,
    },
    construction && { label: 'Build', value: construction },
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  return (
    <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
      <BrandHeader forceLight={false} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-3 pb-12 lg:pb-16">
        <Link
          to="/#catalogue"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Wheels in stock
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
                  modelUrl={wheel.modelUrl}
                  rearModelUrl={wheel.rearModelUrl}
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
            {isSixnineWheel(wheel) && (
              <p className="mt-1 text-sm text-neutral-300">
                <Link to="/sixnine-wheels" className="underline underline-offset-4 hover:text-white">
                  Sixnine Wheels · official dealer
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

            <div className="mt-5" data-testid="finish-options">
              <p className="text-sm text-neutral-400">In stock</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  aria-current="true"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white bg-white/10 px-4 text-sm font-medium text-white"
                >
                  <Swatch hex={WHEEL_FINISHES[wheel.defaultFinish]?.swatchHex} />
                  {finishLabel}
                </span>
                {siblings.map((s) => (
                  <Link
                    key={s.slug}
                    to={`/wheels/${s.slug}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#33333E] px-4 text-sm text-neutral-200 hover:border-[#1D4ED8] hover:text-white"
                  >
                    <Swatch hex={WHEEL_FINISHES[s.defaultFinish]?.swatchHex} />
                    {s.finishName ?? WHEEL_FINISHES[s.defaultFinish]?.name}
                  </Link>
                ))}
              </div>

              {toOrderFinishes.length > 0 && (
                <div className="mt-4" data-testid="to-order-finishes">
                  <p className="text-sm text-neutral-400">
                    Other colours, to order ({TO_ORDER_LEAD_TIME} lead time)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {toOrderFinishes.map((finish) => (
                      <ToOrderChip
                        key={finish.id}
                        design={design}
                        finish={finish}
                        onEnquire={(subject) => openEnquiryModal({ subject, finish: finish.name, domain: 'brand' })}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-neutral-300">
                    {TO_ORDER_NOTICE} Tap a colour to ask about it.
                  </p>
                </div>
              )}
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
                      <Swatch hex={WHEEL_FINISHES[w.defaultFinish]?.swatchHex} />
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

const TO_ORDER_CHIP =
  'inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-[#4A4A57] px-4 text-sm text-neutral-200 hover:border-[#1D4ED8] hover:text-white cursor-pointer';

/**
 * A colour that is not in stock. Tapping it opens the enquiry form with the lead time stated; the
 * form logs the enquiry through n8n and then opens WhatsApp when a number is configured.
 */
const ToOrderChip: React.FC<{
  design: string;
  finish: WheelFinishOption;
  onEnquire: (subject: string) => void;
}> = ({ design, finish, onEnquire }) => {
  const message = `Hi, I'd like the ${design} in ${finish.name}. I understand this colour is made to order, with a lead time of ${TO_ORDER_LEAD_TIME}.`;
  return (
    <button
      type="button"
      onClick={() => onEnquire(message)}
      aria-label={`Ask about ${finish.name}, made to order, ${TO_ORDER_LEAD_TIME} lead time`}
      className={TO_ORDER_CHIP}
    >
      <Swatch hex={finish.swatchHex} />
      {finish.name}
    </button>
  );
};

const Swatch: React.FC<{ hex?: string }> = ({ hex }) => (
  <span
    aria-hidden="true"
    className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-white/30"
    style={{ background: hex ?? '#888' }}
  />
);

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
  onView3D?: () => void;
  triggerRef: React.Ref<HTMLButtonElement>;
}> = ({ photos, cutout, altBase, onView3D, triggerRef }) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const slides: GallerySlide[] = [
    ...(cutout ? [{ src: cutout, kind: 'cutout' as const, size: 1000 }] : []),
    ...photos.map((src) => ({ src, kind: 'photo' as const, size: 1600 })),
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
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black md:flex cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black md:flex cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <>
          <div className="mt-1 flex justify-center">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={active === i ? 'true' : undefined}
                className="flex h-11 w-9 items-center justify-center cursor-pointer"
              >
                <span
                  className={`block h-2 w-2 rounded-full transition-colors ${
                    active === i ? 'bg-[#1D4ED8]' : 'bg-neutral-600'
                  }`}
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
