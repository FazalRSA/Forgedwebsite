import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Play } from 'lucide-react';
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
} from '../../data/catalogue';
import { whatsappLink } from '../../config/site';
import { Link, useRouter } from '../../utils/router';
import { useForgedStore } from '../../store/useForgedStore';
import {
  describeWheelForEnquiry,
  parseTechnicalSpecSheet,
  stockLabel,
  wheelEnquiryMessage,
} from '../../utils/wheelEnquiry';
import { prefersReducedMotion } from '../../wheel-viewer/wheelStudioParts';
import { BrandHeader } from './BrandHeader';
import { WheelStage } from '../visuals/WheelStage';

/**
 * One wheel in stock: photos first, then name, price, sizes and specs, with a single call to
 * action (enquire on WhatsApp). The 3D view is opt-in: nothing 3D (no WebGL, no three.js, no GLB)
 * loads until the visitor taps "View in 3D".
 */

interface WheelShowcasePDPProps {
  slug: string;
}

const PRIMARY_BUTTON =
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1D4ED8] px-6 text-base font-semibold text-white hover:bg-[#2563EB] active:bg-[#1E40AF] transition-colors cursor-pointer';

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
  const stageRef = useRef<HTMLDivElement | null>(null);
  const view3DButtonRef = useRef<HTMLButtonElement | null>(null);

  const has3D = Boolean(wheel.modelUrl);
  const photos = realPhotos(wheel);
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

  // No number configured yet: the same button opens the enquiry form, already filled in.
  const openForm = () =>
    openEnquiryModal({
      subject: message,
      finish: finishLabel,
      priceZAR: wheel.priceZAR,
      domain: 'brand',
    });

  const enquireButton = whatsappHref ? (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      className={PRIMARY_BUTTON}
    >
      <MessageCircle className="w-5 h-5" aria-hidden="true" />
      Enquire on WhatsApp
    </a>
  ) : (
    <button type="button" onClick={openForm} className={PRIMARY_BUTTON}>
      Send an enquiry
    </button>
  );

  const specRows: { label: string; value: string }[] = [
    wheel.sizesAvailable && { label: 'Sizes', value: wheel.sizesAvailable },
    specs.pcd && { label: 'PCD (bolt pattern)', value: specs.pcd },
    specs.et && { label: 'ET (offset)', value: specs.et },
    specs.cb && {
      label: 'CB (centre bore)',
      value: /^\d+(\.\d+)?$/.test(specs.cb) ? `${specs.cb} mm` : specs.cb,
    },
    construction && { label: 'Build', value: construction },
    stock && { label: 'Stock', value: stock },
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  return (
    <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
      <BrandHeader forceLight={false} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-3 pb-40 md:pb-16">
        <Link
          to="/#catalogue"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Wheels in stock
        </Link>

        <div className="mt-1 md:grid md:grid-cols-2 md:gap-10 md:items-start">
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
                altBase={`${wheel.model} forged wheel`}
                onView3D={has3D ? openStudio : undefined}
              />
            ) : (
              <NoPhotoPanel
                label={wheel.model}
                swatchHex={WHEEL_FINISHES[wheel.defaultFinish]?.swatchHex}
                onView3D={has3D ? openStudio : undefined}
                triggerRef={view3DButtonRef}
              />
            )}
          </div>

          <div className="mt-5 md:mt-0 md:sticky md:top-24">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white">
              {wheel.model}
            </h1>
            <p className="mt-2 text-2xl font-semibold text-white">
              {priceText}{' '}
              <span className="text-base font-normal text-neutral-300">per set of 4</span>
            </p>
            {stock && <p className="mt-1 text-sm text-[#F43F5E]">{stock}</p>}

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
                        onNoWhatsapp={(subject) => openEnquiryModal({ subject, finish: finish.name, domain: 'brand' })}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-neutral-300">
                    {TO_ORDER_NOTICE} Tap a colour to ask about it on WhatsApp.
                  </p>
                </div>
              )}
            </div>

            {has3D && !studioOpen && photos.length > 0 && (
              <button
                ref={view3DButtonRef}
                type="button"
                onClick={openStudio}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#33333E] px-6 text-base font-semibold text-white hover:border-[#1D4ED8] transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                View in 3D
              </button>
            )}

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

            {wheel.compatibleCars && (
              <p className="mt-4 text-sm text-neutral-300">
                Listed for BMW {wheel.compatibleCars}. We confirm fitment for your exact car on
                WhatsApp.
              </p>
            )}

            <div className="mt-6 hidden md:block">{enquireButton}</div>
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

      {/* Phone: price and the one action stay in reach while scrolling. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#26262E] bg-[#111111]/95 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="text-lg font-semibold text-white">
            {priceText} <span className="text-xs font-normal text-neutral-300">per set of 4</span>
          </p>
          {stock && <p className="text-xs text-neutral-300">{stock}</p>}
        </div>
        {enquireButton}
      </div>
    </div>
  );
};

const TO_ORDER_CHIP =
  'inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-[#4A4A57] px-4 text-sm text-neutral-200 hover:border-[#1D4ED8] hover:text-white cursor-pointer';

/** A colour that is not in stock. Tapping it starts an enquiry that states the lead time. */
const ToOrderChip: React.FC<{
  design: string;
  finish: WheelFinishOption;
  onNoWhatsapp: (subject: string) => void;
}> = ({ design, finish, onNoWhatsapp }) => {
  const message = `Hi, I'd like the ${design} in ${finish.name}. I understand this colour is made to order, with a lead time of ${TO_ORDER_LEAD_TIME}.`;
  const href = whatsappLink(message);
  const content = (
    <>
      <Swatch hex={finish.swatchHex} />
      {finish.name}
    </>
  );
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ask about ${finish.name}, made to order, ${TO_ORDER_LEAD_TIME} lead time`}
      className={TO_ORDER_CHIP}
    >
      {content}
    </a>
  ) : (
    <button type="button" onClick={() => onNoWhatsapp(message)} className={TO_ORDER_CHIP}>
      {content}
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

/** The poster for the 3D view: a play-style button laid over the first photo. */
const View3DPoster: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
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
 * Swipeable photos (scroll-snap, so vertical page scrolling is never trapped). The first photo is
 * the page's largest image and loads eagerly at high priority; the rest load lazily.
 */
const PhotoGallery: React.FC<{
  photos: string[];
  altBase: string;
  onView3D?: () => void;
}> = ({ photos, altBase, onView3D }) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = (index + photos.length) % photos.length;
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
    setActive(clamped);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${altBase} photos`}
      className="relative"
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') goTo(active + 1);
          if (e.key === 'ArrowLeft') goTo(active - 1);
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl border border-[#26262E] bg-[#121215] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((src, i) => (
          <div key={src} className="relative aspect-square w-full shrink-0 snap-center">
            <img
              src={src}
              alt={`${altBase}, photo ${i + 1} of ${photos.length}`}
              width={1600}
              height={1600}
              // The first photo is the largest thing on the page: never lazy.
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              decoding={i === 0 ? 'sync' : 'async'}
              className="h-full w-full object-cover"
            />
            {i === 0 && onView3D && <View3DPoster onClick={onView3D} />}
          </div>
        ))}
      </div>

      {photos.length > 1 && (
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
          <div className="mt-1 flex justify-center">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1} of ${photos.length}`}
                aria-current={active === i}
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
        </>
      )}
    </div>
  );
};

/** A listing with no photos yet: say so plainly, and offer the 3D view if there is one. */
const NoPhotoPanel: React.FC<{
  label: string;
  swatchHex?: string;
  onView3D?: () => void;
  triggerRef: React.Ref<HTMLButtonElement>;
}> = ({ label, swatchHex, onView3D, triggerRef }) => (
  <div className="flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-2xl border border-[#26262E] bg-[#121215] p-6 text-center">
    <span
      aria-hidden="true"
      className="h-16 w-16 rounded-full border border-white/20"
      style={{ background: swatchHex ?? '#888' }}
    />
    <div>
      <p className="text-lg font-semibold text-white">{label}</p>
      <p className="mt-1 text-sm text-neutral-300">Photos coming soon.</p>
    </div>
    {onView3D && (
      <button
        ref={triggerRef}
        type="button"
        onClick={onView3D}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1D4ED8] px-6 text-base font-semibold text-white hover:bg-[#2563EB] cursor-pointer"
      >
        <Play className="h-4 w-4 fill-current" aria-hidden="true" />
        View in 3D
      </button>
    )}
  </div>
);
