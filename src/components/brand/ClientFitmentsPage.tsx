import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { ContactCta, CTA_PRIMARY_CLASS, CTA_SECONDARY_CLASS } from './ContactCta';
import { fitmentCar, fitmentMessage, fitmentTitle, fitmentWheels } from './fitmentFormat';
import { Link } from '../../utils/router';
import { CLIENT_FITMENTS, FITMENT_FAMILIES, type ClientFitment } from '../../data/clientFitments';

const ALL = 'All';

const FOCUSABLE = 'a[href], button:not([disabled])';

const PHOTO_COUNT = 3;

/** Photos of one customer car, with the details that are known and a way to ask about the setup. */
const InstallLightbox: React.FC<{ fitment: ClientFitment; onClose: () => void }> = ({
  fitment,
  onClose,
}) => {
  const [photo, setPhoto] = useState(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const title = fitmentTitle(fitment);
  const wheels = fitmentWheels(fitment);
  const previousPhoto = () => setPhoto((current) => (current + PHOTO_COUNT - 1) % PHOTO_COUNT);
  const nextPhoto = () => setPhoto((current) => (current + 1) % PHOTO_COUNT);
  // The studio re-shoots are 4:3; the owner's own photo can be any shape, so it is shown whole.
  const isOwnerPhoto = photo === PHOTO_COUNT - 1;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowLeft') {
        setPhoto((current) => (current + PHOTO_COUNT - 1) % PHOTO_COUNT);
      } else if (event.key === 'ArrowRight') {
        setPhoto((current) => (current + 1) % PHOTO_COUNT);
      } else if (event.key === 'Tab' && dialogRef.current) {
        // Keep keyboard focus inside the open window.
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [onClose]);

  // Details are listed only when they are known.
  const details: { label: string; value: string }[] = [
    { label: 'Wheels', value: wheels },
    ...(fitment.finishName ? [{ label: 'Finish', value: fitment.finishName }] : []),
    ...(fitment.staggeredSpec ? [{ label: 'Sizes', value: fitment.staggeredSpec }] : []),
    ...(fitment.clientCity ? [{ label: 'Location', value: fitment.clientCity }] : []),
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photos of ${title}`}
      data-testid="client-fitment-lightbox"
      className="fixed inset-0 z-50 bg-black/90 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center sm:p-6">
        <div
          ref={dialogRef}
          onClick={(event) => event.stopPropagation()}
          className="relative w-full max-w-5xl bg-[#121215] sm:rounded-2xl overflow-hidden md:grid md:grid-cols-[3fr_2fr]"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close photos"
            className="absolute top-3 right-3 z-10 w-11 h-11 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer hover:bg-black"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>

          {/* Photo */}
          <div className="bg-[#18181D]">
            <div className="relative">
              <img
                src={fitment.images[photo]}
                alt={`${title} on forged wheels, ${fitment.imageLabels[photo].toLowerCase()} (photo ${photo + 1} of ${PHOTO_COUNT})`}
                width={1600}
                height={1200}
                decoding="async"
                className={`w-full aspect-[4/3] ${isOwnerPhoto ? 'object-contain' : 'object-cover'}`}
              />
              <button
                type="button"
                onClick={previousPhoto}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer hover:bg-black"
              >
                <ChevronLeft aria-hidden="true" className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer hover:bg-black"
              >
                <ChevronRight aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 p-3">
              {fitment.images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setPhoto(index)}
                  aria-label={`Show photo ${index + 1}: ${fitment.imageLabels[index]}`}
                  aria-pressed={photo === index}
                  className={`w-16 h-12 rounded-md overflow-hidden border-2 cursor-pointer ${
                    photo === index ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="p-5 sm:p-7 flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-light tracking-tight text-white">{fitmentCar(fitment)}</h2>
              {fitment.paint && <p className="mt-1 text-neutral-300">{fitment.paint}</p>}
            </div>

            <dl className="divide-y divide-[#26262E] border-y border-[#26262E] text-sm">
              {details.map((row) => (
                <div key={row.label} className="py-3 flex justify-between gap-4">
                  <dt className="text-neutral-400">{row.label}</dt>
                  <dd className="text-white text-right">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-3">
              <ContactCta
                message={fitmentMessage(fitment)}
                enquirySubject={`Ask about this setup: ${title} (${wheels})`}
                label="Ask about this setup"
                fallbackLabel="Ask about this setup"
                onActivate={onClose}
                className={CTA_PRIMARY_CLASS}
              />
              {fitment.wheelSlug ? (
                <Link to={`/wheels/${fitment.wheelSlug}`} onClick={onClose} className={CTA_SECONDARY_CLASS}>
                  See this wheel
                </Link>
              ) : (
                <Link to="/#catalogue" onClick={onClose} className={CTA_SECONDARY_CLASS}>
                  See wheels in stock
                </Link>
              )}
            </div>

            <p className="text-xs text-neutral-400">
              The studio pictures are made from the owner&apos;s own photo of the car, shown as the third photo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClientFitmentsPage: React.FC = () => {
  const [family, setFamily] = useState<string>(ALL);
  const [openId, setOpenId] = useState<string | null>(null);

  const visibleItems = useMemo(
    () => (family === ALL ? CLIENT_FITMENTS : CLIENT_FITMENTS.filter((item) => item.family === family)),
    [family],
  );
  const openItem = openId ? CLIENT_FITMENTS.find((item) => item.id === openId) ?? null : null;
  const closeLightbox = useCallback(() => setOpenId(null), []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7]">
      <BrandHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-14">
        <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.03em] leading-tight text-white">
          Installs
        </h1>
        <p className="mt-3 max-w-xl text-neutral-300">
          Customer cars on our wheels. Tap a car for photos and to ask about the setup.
        </p>

        {FITMENT_FAMILIES.length > 1 && (
          <div role="group" aria-label="Filter by car" className="mt-6 flex flex-wrap gap-2">
            {[ALL, ...FITMENT_FAMILIES].map((option) => {
              const active = family === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setOpenId(null);
                    setFamily(option);
                  }}
                  className={`min-h-11 px-4 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#F5F5F7] text-[#0A0A0A]'
                      : 'border border-[#33333E] text-neutral-300 hover:border-neutral-500 hover:text-white'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}

        <ul
          data-testid="client-fitments-bento-grid"
          className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-5 gap-y-8"
        >
          {visibleItems.map((item, index) => (
            <li key={item.id} data-testid={`fitment-bento-card-${index + 1}`}>
              <button
                type="button"
                onClick={() => setOpenId(item.id)}
                aria-label={`Open photos of ${fitmentTitle(item)}`}
                className="group block w-full text-left cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[#18181D]">
                  <img
                    src={item.images[0]}
                    alt=""
                    width={1600}
                    height={1200}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="mt-3 block text-base font-medium text-white group-hover:underline underline-offset-4">
                  {fitmentCar(item)}
                </span>
                <span className="block text-sm text-neutral-300">{item.paint}</span>
              </button>
            </li>
          ))}
        </ul>
      </main>

      {openItem && <InstallLightbox key={openItem.id} fitment={openItem} onClose={closeLightbox} />}
    </div>
  );
};
