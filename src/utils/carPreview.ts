/**
 * "See it on my car": the visitor's photo goes to our Cloudflare Worker (worker/car-preview), which
 * has an AI image model fit the wheel to the car and sends the picture back.
 *
 * This file holds the parts that need no screen, so they can be unit tested: whether the feature is
 * on, shrinking the photo before it is sent, and talking to the Worker. The dialog is
 * components/brand/CarPreviewDialog.tsx. Nothing here stores the photo or the result anywhere.
 *
 * Nothing touches the DOM at import time, so the tests run in plain Node.
 */
import { SITE } from '../config/site';

/**
 * Who processes the photo. One constant, used by the dialog's consent text and by the privacy
 * notice, so the two can never name different companies.
 */
export const CAR_PREVIEW_PROVIDER = 'Cloudflare';

/**
 * Longest side, in pixels, of the photo we send. Cloudflare documents that every input image to the
 * FLUX.2 klein models "must be smaller than 512x512", so this is 512. It also keeps the upload small on
 * mobile data. The picture that comes back is larger (the Worker asks for a 1024 px long side).
 */
export const CAR_PREVIEW_MAX_SIDE = 512;
/** A photo larger than this is refused before it is decoded (a phone's full-size photo is usually 2 to 8 MB). */
export const CAR_PREVIEW_MAX_FILE_BYTES = 15 * 1024 * 1024;
/** What we are willing to upload: the Worker accepts about this much. */
const MAX_UPLOAD_BYTES = 1_000_000;
/** How long a generation may take before the dialog gives up. The Worker itself takes about 5 to 60 seconds. */
export const CAR_PREVIEW_TIMEOUT_MS = 90_000;

/** Said under the result, exactly as agreed: it is an impression, not a photograph, and fit is confirmed by us. */
export const CAR_PREVIEW_DISCLAIMER =
  "This is an AI-generated impression, not a photograph. The wheel's shape, size and fit can differ from the real thing. We confirm fit for your exact car before you order.";

/** The consent the visitor ticks before anything is sent. */
export function carPreviewConsentText(businessName: string = SITE.name): string {
  return `I understand my photo is sent to an AI service (${CAR_PREVIEW_PROVIDER}) to make this preview, and that ${businessName} does not keep it.`;
}

/** True only when the Worker's address is set and is https. An empty address switches the whole feature off. */
export function carPreviewEnabled(config: { carPreviewUrl: string } = SITE): boolean {
  if (!config.carPreviewUrl) return false;
  try {
    return new URL(config.carPreviewUrl).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Why a preview could not be made. `aborted` is silent: the visitor cancelled or closed the dialog. */
export class CarPreviewError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'CarPreviewError';
    this.code = code;
  }
}

const GENERIC_MESSAGE = 'We could not make the preview this time. Please try again.';
const NETWORK_MESSAGE = 'We could not reach the preview service. Check your connection and try again.';
const UNSUPPORTED_MESSAGE = 'That photo format is not supported here. Please use a JPEG or PNG photo.';
const TIMEOUT_MESSAGE = 'The preview took too long. Please try again, or use a smaller photo.';

/** Used only when the Worker's own message is missing. */
const FALLBACK_MESSAGES: Record<string, string> = {
  bad_request: 'We could not read that photo. Please try a different one.',
  unknown_wheel: 'We could not find this wheel for the preview. Please reload the page and try again.',
  forbidden_origin: 'The preview is not available from this address.',
  too_large: 'That photo is too large. Please try a smaller one.',
  photo_rejected: 'We could not use that photo. Please try a different photo of the car, a plain side-on photo in daylight works best.',
  daily_limit: 'We have reached the number of previews we can make today. Please try again tomorrow.',
  model_failed: GENERIC_MESSAGE,
  timeout: TIMEOUT_MESSAGE,
  method_not_allowed: GENERIC_MESSAGE,
};

/** The error shown when the dialog's own timer ran out. */
export function carPreviewTimeoutError(): CarPreviewError {
  return new CarPreviewError('timeout', TIMEOUT_MESSAGE);
}

/** Errors for which the dialog also offers to take the photo on WhatsApp through the enquiry form. */
export function offersWhatsAppFallback(code: string): boolean {
  return (
    code === 'daily_limit' || code === 'model_failed' || code === 'photo_rejected' || code === 'timeout' || code === 'network'
  );
}

/** The size to draw a photo at: the longest side is at most `max`, the shape is kept, a small photo is never enlarged. */
export function fitWithin(width: number, height: number, max: number = CAR_PREVIEW_MAX_SIDE): { width: number; height: number } {
  if (!(width > 0) || !(height > 0) || !Number.isFinite(width) || !Number.isFinite(height)) {
    throw new RangeError('fitWithin needs a positive width and height');
  }
  const longest = Math.max(width, height);
  if (longest <= max) return { width: Math.round(width), height: Math.round(height) };
  const scale = max / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void };

async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      // 'from-image' turns a sideways phone photo upright (it is already the default in current browsers).
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      // Fall through to an <img>, which some browsers decode when createImageBitmap refuses.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    throw new CarPreviewError('unsupported_image', UNSUPPORTED_MESSAGE);
  }
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

/**
 * Re-save the visitor's photo as a JPEG whose longest side is at most CAR_PREVIEW_MAX_SIDE (512 px).
 *
 * Drawing the photo onto a canvas and encoding that canvas writes a brand-new file with the pixels
 * only. Everything else in the original is dropped, including the EXIF block that holds the camera
 * model, the time and the GPS location of the shot. That is deliberate, and the privacy notice says so.
 */
export async function shrinkImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  if (file.size > CAR_PREVIEW_MAX_FILE_BYTES) {
    throw new CarPreviewError('file_too_large', 'That photo is too large (over 15 MB). Please choose a smaller one.');
  }
  const decoded = await decode(file);
  try {
    if (!(decoded.width > 0) || !(decoded.height > 0)) {
      throw new CarPreviewError('unsupported_image', UNSUPPORTED_MESSAGE);
    }
    const { width, height } = fitWithin(decoded.width, decoded.height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new CarPreviewError('unsupported_image', UNSUPPORTED_MESSAGE);
    // A PNG with see-through areas would turn black as a JPEG; paint white underneath first.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(decoded.source, 0, 0, width, height);

    let blob: Blob | null = null;
    for (const quality of [0.85, 0.7, 0.55]) {
      blob = await canvasToJpeg(canvas, quality);
      if (blob && blob.size <= MAX_UPLOAD_BYTES) break;
    }
    if (!blob) throw new CarPreviewError('unsupported_image', UNSUPPORTED_MESSAGE);
    return { blob, width, height };
  } finally {
    decoded.release();
  }
}

export interface RequestCarPreviewInput {
  /** The Worker's address (SITE.carPreviewUrl). */
  url: string;
  /** The shrunk JPEG from shrinkImage. */
  car: Blob;
  /** The catalogue slug of the wheel, e.g. "ff-3-pure-bronze". */
  wheelSlug: string;
  /** The pixel size of `car`. */
  width: number;
  height: number;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png']);
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

function isAbort(error: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) return true;
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError';
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return JSON.parse(await response.text());
  } catch {
    return null;
  }
}

/**
 * Ask the Worker for the car wearing the wheel. Resolves with a `data:` URL for the picture; every
 * failure is a CarPreviewError whose `message` is fit to show the visitor as it is.
 */
export async function requestCarPreview({
  url,
  car,
  wheelSlug,
  width,
  height,
  signal,
  fetchImpl = fetch,
}: RequestCarPreviewInput): Promise<{ imageUrl: string }> {
  const form = new FormData();
  form.append('car', car, 'car.jpg');
  form.append('wheel', wheelSlug);
  form.append('width', String(Math.round(width)));
  form.append('height', String(Math.round(height)));

  let response: Response;
  try {
    // No cookies are sent or accepted: the Worker needs nothing that identifies the visitor.
    response = await fetchImpl(url, { method: 'POST', body: form, signal, credentials: 'omit' });
  } catch (error) {
    if (isAbort(error, signal)) throw new CarPreviewError('aborted', '');
    throw new CarPreviewError('network', NETWORK_MESSAGE);
  }

  // readJson never rejects (an unreadable body is null), so an abort during the read shows up here.
  const body = await readJson(response);
  if (signal?.aborted) throw new CarPreviewError('aborted', '');
  const record = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};

  if (!response.ok) {
    const code = typeof record.error === 'string' && record.error ? record.error : `http_${response.status}`;
    const sent = typeof record.message === 'string' ? record.message.trim() : '';
    throw new CarPreviewError(code, sent ? sent.slice(0, 300) : (FALLBACK_MESSAGES[code] ?? GENERIC_MESSAGE));
  }

  const { image, mime } = record;
  if (typeof image !== 'string' || image.length < 16 || !BASE64.test(image) || typeof mime !== 'string' || !IMAGE_MIMES.has(mime)) {
    throw new CarPreviewError('bad_response', GENERIC_MESSAGE);
  }
  return { imageUrl: `data:${mime};base64,${image}` };
}

/**
 * A copy of the preview with a caption bar underneath, for saving and sharing, so that a shared
 * picture is not mistaken for a real photograph. The picture itself is not covered. Returns null
 * when the browser cannot draw it; the caller then saves the plain picture.
 */
export async function captionedPreview(imageUrl: string, caption: string): Promise<Blob | null> {
  try {
    const img = new Image();
    img.src = imageUrl;
    await img.decode();
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return null;
    const bar = Math.max(32, Math.round(h * 0.06));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h + bar;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    ctx.fillStyle = '#0E0E12';
    ctx.fillRect(0, h, w, bar);
    ctx.fillStyle = '#EDEBE4';
    ctx.font = `600 ${Math.round(bar * 0.45)}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(caption, Math.round(bar * 0.4), h + bar / 2);
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  } catch {
    return null;
  }
}
