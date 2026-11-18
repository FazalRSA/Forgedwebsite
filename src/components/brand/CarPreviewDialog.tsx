import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Download, Loader2, MessageCircle, RotateCcw, X } from 'lucide-react';
import { SITE, whatsappLink } from '../../config/site';
import { trackEvent } from '../../utils/analytics';
import {
  CAR_PREVIEW_DISCLAIMER,
  CAR_PREVIEW_TIMEOUT_MS,
  CarPreviewError,
  captionedPreview,
  carPreviewConsentText,
  carPreviewTimeoutError,
  offersWhatsAppFallback,
  requestCarPreview,
  shrinkImage,
} from '../../utils/carPreview';
import { Link } from '../../utils/router';

/**
 * "See it on my car": one dialog, four steps (choose a photo, working, result, error).
 *
 * The photo and the result live only in this component's state and in object URLs that are revoked
 * when the photo changes or the dialog closes. Nothing is written to local storage, the store or
 * the cache. Dialog behaviour (focus trap, Escape, scroll lock, focus return) follows the enquiry
 * form in components/shared/GlobalOverlays.tsx.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const PRIMARY_BUTTON =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1D4ED8] px-6 text-base font-semibold text-white hover:bg-[#2563EB] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1D4ED8]';
/** The button that makes the preview: black with white text, with the neon laser while it works (index.css). */
const LASER_BUTTON =
  'laser-button flex min-h-12 w-full items-center justify-center gap-2 px-6 text-base font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
const SECONDARY_BUTTON =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#33333E] px-6 text-base font-medium text-neutral-100 hover:border-[#1D4ED8] hover:text-white transition-colors cursor-pointer';
const SECONDARY_BUTTON_COMPACT =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#33333E] px-3 text-sm font-medium text-neutral-100 hover:border-[#1D4ED8] hover:text-white transition-colors cursor-pointer whitespace-nowrap';
const LINK_BUTTON = 'min-h-11 text-sm text-[#C2C2CC] underline underline-offset-4 hover:text-white cursor-pointer';

type Step = 'choose' | 'working' | 'result' | 'error';

interface Photo {
  blob: Blob;
  width: number;
  height: number;
  name: string;
  /** Object URL of the shrunk copy; revoked when the photo is replaced or the dialog closes. */
  url: string;
}

interface CarPreviewDialogProps {
  /** The catalogue slug of the wheel page, sent to the Worker. */
  wheelSlug: string;
  /** For the alt text and the saved file, e.g. "FSA003 — Gold". */
  wheelName: string;
  onClose: () => void;
  /** Closes the dialog and opens the enquiry form for this wheel; `note` is one extra line for the message. */
  onEnquire: (note: string) => void;
  /** The button that opened the dialog, so focus can go back to it even where a tap does not focus a button. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /** Told when a preview starts and stops being made, so the button on the page can show it too. */
  onWorkingChange?: (working: boolean) => void;
}

export const CarPreviewDialog: React.FC<CarPreviewDialogProps> = ({
  wheelSlug,
  wheelName,
  onClose,
  onEnquire,
  returnFocusRef,
  onWorkingChange,
}) => {
  const [step, setStep] = useState<Step>('choose');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [showWheels, setShowWheels] = useState(true);
  const [error, setError] = useState<CarPreviewError | null>(null);
  const [saving, setSaving] = useState(false);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  const firstStepRun = useRef(true);
  // A newer choice of photo replaces an older one that is still being prepared.
  const pickToken = useRef(0);

  const waConfigured = Boolean(whatsappLink());

  useEffect(() => {
    trackEvent('car_preview_open');
  }, []);

  useEffect(() => {
    onWorkingChange?.(step === 'working');
    return () => onWorkingChange?.(false);
  }, [step, onWorkingChange]);

  // Keep the page behind still, keep focus inside (Tab cycles, Escape closes) and give it back on close.
  useEffect(() => {
    const opener = returnFocusRef?.current ?? (document.activeElement as HTMLElement | null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'Tab' && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (item) => item.offsetParent !== null
        );
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        const inside = active instanceof Node && dialogRef.current.contains(active);
        if (event.shiftKey && (active === first || !inside || active === dialogRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || !inside)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [onClose, returnFocusRef]);

  // Closing drops everything: stop a request in flight and free the thumbnail.
  useEffect(
    () => () => {
      const controller = abortRef.current;
      abortRef.current = null;
      controller?.abort();
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = null;
      pickToken.current += 1;
    },
    []
  );

  // When the step changes, put focus on the thing the visitor needs next (the dialog itself on open).
  useEffect(() => {
    if (firstStepRun.current) {
      firstStepRun.current = false;
      return;
    }
    const target = dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]');
    target?.focus();
  }, [step, photo]);

  const replacePhoto = useCallback((next: Photo | null) => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = next?.url ?? null;
    setPhoto(next);
  }, []);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    // Reset so choosing the same file again still fires a change.
    input.value = '';
    if (!file) return;
    const token = ++pickToken.current;
    setPickError(null);
    setPreparing(true);
    try {
      const shrunk = await shrinkImage(file);
      if (token !== pickToken.current) return;
      replacePhoto({ ...shrunk, name: file.name, url: URL.createObjectURL(shrunk.blob) });
    } catch (e) {
      if (token !== pickToken.current) return;
      setPickError(e instanceof CarPreviewError ? e.message : 'That photo could not be opened. Please try another.');
    } finally {
      if (token === pickToken.current) setPreparing(false);
    }
  };

  const fail = (err: CarPreviewError) => {
    trackEvent('car_preview_result', { outcome: err.code });
    setError(err);
    setStep('error');
  };

  const generate = async () => {
    if (!photo || !consent) return;
    const controller = new AbortController();
    abortRef.current = controller;
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, CAR_PREVIEW_TIMEOUT_MS);
    setError(null);
    setStep('working');
    try {
      const { imageUrl } = await requestCarPreview({
        url: SITE.carPreviewUrl,
        car: photo.blob,
        wheelSlug,
        width: photo.width,
        height: photo.height,
        signal: controller.signal,
      });
      // The dialog was closed, or this attempt was replaced: drop the result.
      if (abortRef.current !== controller) return;
      trackEvent('car_preview_result', { outcome: 'ok' });
      setResultUrl(imageUrl);
      setShowWheels(true);
      setStep('result');
    } catch (e) {
      if (abortRef.current !== controller) return;
      const err =
        e instanceof CarPreviewError
          ? e
          : new CarPreviewError('unknown', 'We could not make the preview this time. Please try again.');
      if (err.code === 'aborted') {
        // The visitor pressed Cancel: back to the photo, nothing to report. Our own timer ran out: say so.
        if (timedOut) fail(carPreviewTimeoutError());
        else setStep('choose');
      } else {
        fail(err);
      }
    } finally {
      window.clearTimeout(timer);
    }
  };

  const cancel = () => abortRef.current?.abort();

  const tryAnother = () => {
    setResultUrl(null);
    setError(null);
    replacePhoto(null);
    setStep('choose');
  };

  const save = async () => {
    if (!resultUrl || saving) return;
    setSaving(true);
    try {
      // A caption bar under the picture, so a shared copy is not mistaken for a photograph.
      const captioned = await captionedPreview(resultUrl, `AI preview · ${SITE.name}`);
      const href = captioned ? URL.createObjectURL(captioned) : resultUrl;
      const link = document.createElement('a');
      link.href = href;
      link.download = `${wheelSlug}-ai-preview.${captioned || resultUrl.startsWith('data:image/jpeg') ? 'jpg' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      if (captioned) window.setTimeout(() => URL.revokeObjectURL(href), 10_000);
    } finally {
      setSaving(false);
    }
  };

  const backdropClosable = step === 'choose' || step === 'error';
  const aspect = photo ? `${photo.width} / ${photo.height}` : '4 / 3';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4"
      onMouseDown={(e) => {
        if (backdropClosable && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="car-preview-title"
        tabIndex={-1}
        className="h-full w-full overflow-y-auto bg-[#0E0E12] text-[#EDEBE4] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl focus:outline-none sm:h-auto sm:max-h-[92svh] sm:max-w-xl sm:rounded-3xl sm:border sm:border-[#26262E] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="car-preview-title" className="text-xl font-semibold tracking-tight text-white">
              See it on my car
            </h2>
            <p className="mt-0.5 truncate text-sm text-neutral-400">{wheelName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close car preview"
            className="-mr-2 -mt-2 w-11 h-11 rounded-full flex items-center justify-center text-[#C2C2CC] hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'choose' && (
          <div className="pt-4 space-y-4">
            {!photo ? (
              <>
                <label className="relative flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#4A4A57] bg-[#141418] px-4 py-6 text-center hover:border-[#1D4ED8] focus-within:border-[#F43F5E]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    disabled={preparing}
                    data-autofocus
                    className="sr-only"
                  />
                  {preparing ? (
                    <Loader2 className="h-8 w-8 animate-spin motion-reduce:animate-none text-[#C2C2CC]" aria-hidden="true" />
                  ) : (
                    <Camera className="h-8 w-8 text-[#C2C2CC]" aria-hidden="true" />
                  )}
                  <span className="text-base font-semibold text-white">
                    {preparing ? 'Getting your photo ready…' : 'Choose or take a photo'}
                  </span>
                </label>
                <ul className="space-y-1 text-sm text-neutral-300">
                  <li>Use a side-on or three-quarter photo in daylight with the wheels clearly visible.</li>
                  <li>Please do not include people or number plates.</li>
                </ul>
                {pickError && (
                  <p role="alert" className="rounded-xl border border-[#F43F5E]/40 bg-[#F43F5E]/10 p-3 text-sm text-[#F9A8B8]">
                    {pickError}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={photo.url}
                    alt="The photo you chose"
                    className="h-24 w-32 shrink-0 rounded-xl border border-[#26262E] bg-[#141418] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{photo.name}</p>
                    <label className={`${LINK_BUTTON} relative inline-flex items-center focus-within:text-white focus-within:ring-2 focus-within:ring-[#F43F5E] rounded`}>
                      Choose a different photo
                      <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
                    </label>
                  </div>
                </div>
                {pickError && (
                  <p role="alert" className="rounded-xl border border-[#F43F5E]/40 bg-[#F43F5E]/10 p-3 text-sm text-[#F9A8B8]">
                    {pickError}
                  </p>
                )}
                <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-[#C2C2CC]">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    data-autofocus
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[#1D4ED8]"
                  />
                  <span>{carPreviewConsentText()}</span>
                </label>
                <button type="button" onClick={generate} disabled={!consent} className={LASER_BUTTON}>
                  <Camera className="h-5 w-5" aria-hidden="true" />
                  Show me this wheel on my car
                </button>
              </>
            )}
            <p className="text-xs text-neutral-400 text-center">
              See our{' '}
              <Link to="/privacy-policy" onClick={onClose} className="underline underline-offset-2 hover:text-white">
                privacy notice
              </Link>
              .
            </p>
          </div>
        )}

        {step === 'working' && photo && (
          <div className="pt-4 space-y-4">
            <div
              className="relative mx-auto w-full overflow-hidden rounded-2xl border border-[#26262E] bg-[#141418]"
              style={{ aspectRatio: aspect, maxHeight: '50svh' }}
            >
              <img src={photo.url} alt="" className="absolute inset-0 h-full w-full object-contain opacity-50" />
            </div>
            <button type="button" disabled aria-busy="true" data-working="true" className={`${LASER_BUTTON} disabled:opacity-100 disabled:cursor-progress`}>
              <Camera className="h-5 w-5" aria-hidden="true" />
              Fitting the wheels…
            </button>
            <p role="status" className="text-center text-sm text-[#C2C2CC]">
              Fitting the wheels to your car. This usually takes under a minute.
            </p>
            <button type="button" onClick={cancel} data-autofocus className={SECONDARY_BUTTON}>
              Cancel
            </button>
          </div>
        )}

        {step === 'result' && resultUrl && photo && (
          <div className="pt-4 space-y-4">
            <h3 tabIndex={-1} data-autofocus className="sr-only focus:outline-none">
              Your preview
            </h3>
            <div
              className="relative mx-auto w-full overflow-hidden rounded-2xl border border-[#26262E] bg-[#141418]"
              style={{ aspectRatio: aspect, maxHeight: '58svh' }}
            >
              <img
                src={photo.url}
                alt="Your photo"
                aria-hidden={showWheels}
                className={`absolute inset-0 h-full w-full object-contain ${showWheels ? 'invisible' : ''}`}
              />
              <img
                src={resultUrl}
                alt={`AI-generated preview of ${wheelName} on your car`}
                aria-hidden={!showWheels}
                className={`absolute inset-0 h-full w-full object-contain ${showWheels ? '' : 'invisible'}`}
              />
              {showWheels && (
                <span className="absolute left-2 top-2 rounded-full bg-black/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                  AI preview
                </span>
              )}
            </div>
            <div role="group" aria-label="Which picture to show" className="grid grid-cols-2 gap-1 rounded-full border border-[#26262E] bg-[#141418] p-1">
              {[
                { label: 'Your photo', on: !showWheels },
                { label: 'With the wheels', on: showWheels },
              ].map(({ label, on }) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setShowWheels(label === 'With the wheels')}
                  className={`min-h-11 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                    on ? 'bg-[#EDEBE4] text-[#111111]' : 'text-[#C2C2CC] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-sm text-[#C2C2CC]">{CAR_PREVIEW_DISCLAIMER}</p>
            <button
              type="button"
              onClick={() => onEnquire('I tried this wheel on my car with the preview.')}
              className={PRIMARY_BUTTON}
            >
              {waConfigured && <MessageCircle className="w-5 h-5" aria-hidden="true" />}
              Enquire about this wheel
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={tryAnother} className={SECONDARY_BUTTON_COMPACT}>
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Try another photo
              </button>
              <button type="button" onClick={save} disabled={saving} className={`${SECONDARY_BUTTON_COMPACT} disabled:opacity-60`}>
                <Download className="w-4 h-4" aria-hidden="true" />
                Save image
              </button>
            </div>
          </div>
        )}

        {step === 'error' && error && (
          <div className="pt-4 space-y-4">
            <div
              role="alert"
              tabIndex={-1}
              data-autofocus
              className="rounded-xl border border-[#F43F5E]/40 bg-[#F43F5E]/10 p-4 text-sm text-[#F9A8B8] focus:outline-none"
            >
              {error.message}
            </div>
            <button type="button" onClick={() => setStep('choose')} className={PRIMARY_BUTTON}>
              Try again
            </button>
            {offersWhatsAppFallback(error.code) && waConfigured && (
              <p className="text-sm text-[#C2C2CC]">
                <button
                  type="button"
                  onClick={() => onEnquire('I could not get the car preview to work, and would like to send you a photo of my car.')}
                  className="min-h-11 text-left underline underline-offset-4 hover:text-white cursor-pointer"
                >
                  You can also send us your car photo on WhatsApp.
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
