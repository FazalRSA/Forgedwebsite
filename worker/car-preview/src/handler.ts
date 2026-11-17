/**
 * Car preview Worker: takes a customer's car photo and a wheel slug, asks Workers AI to put that
 * wheel on the car, and returns the edited picture as base64 JSON.
 *
 * Rules this file keeps (see README.md in this folder):
 *  - Nothing the customer sends is logged or stored. console.error only ever gets an error name
 *    or a number, never a body, image, base64 string or prompt.
 *  - The prompt is a constant and the second reference image is always the site's own wheel photo,
 *    so this cannot be used as a free general image editor.
 *  - No image is ever base64-encoded or decoded here (the free plan allows 10 ms of CPU per
 *    request). Blobs go in, the model's base64 string comes straight back out.
 *  - Every failure returns a JSON error. Nothing throws out of handleCarPreview.
 *
 * There are no Cloudflare-only globals at import time, so this also runs under node 22.
 */

/** The only part of the Workers AI binding this file uses. */
export interface AiBinding {
  run(model: string, input: unknown): Promise<unknown>;
}

export interface Env {
  AI: AiBinding;
  /** Comma separated browser origins that may call the Worker. */
  ALLOWED_ORIGINS?: string;
  /** Where wheel photos are fetched from. */
  SITE_ORIGIN?: string;
  /** Workers AI model id. */
  MODEL?: string;
  /** Wheel photo file name inside /images/wheels/<slug>/. Defaults to hero-400.webp (Cloudflare: input images must be under 512x512). */
  WHEEL_IMAGE_FILE?: string;
}

export interface Deps {
  /** Replaces the global fetch (used for the wheel photo). */
  fetch?: typeof fetch;
  /** How long to wait for the model, in milliseconds. Defaults to 90 seconds. */
  timeoutMs?: number;
}

export const DEFAULT_ORIGIN = 'https://www.forgedsa.co.za';
export const DEFAULT_MODEL = '@cf/black-forest-labs/flux-2-klein-4b';
export const DEFAULT_WHEEL_IMAGE_FILE = 'hero-400.webp';
export const MAX_CAR_BYTES = 2_000_000;
/** Allowance on top of the photo for the multipart framing and the other small fields. */
export const MAX_BODY_BYTES = MAX_CAR_BYTES + 64 * 1024;
/** Wheel photos are about 70 KB. Anything near this size is not one of ours. */
export const MAX_WHEEL_BYTES = 2_000_000;
export const AI_TIMEOUT_MS = 90_000;
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** The only text that ever reaches the model. No customer-supplied text is used. */
export const PROMPT =
  "Replace the wheels on the car in the first image with the wheel shown in the second image. Copy that wheel's exact design: the same spokes, finish, bolts on the lip and centre cap. Fit each wheel to the car in the correct perspective and size for the wheel arch, keep the original tyres and brake calipers. Change nothing else: same car, paint colour, camera angle, background and lighting.";

export type ErrorCode =
  | 'bad_request'
  | 'unknown_wheel'
  | 'too_large'
  | 'method_not_allowed'
  | 'forbidden_origin'
  | 'daily_limit'
  | 'model_failed'
  | 'timeout';

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  bad_request: 'Please send a JPEG, PNG or WebP photo of your car and pick one of our wheels.',
  unknown_wheel: 'We could not find that wheel. Please pick one from the wheels page.',
  too_large: 'That photo is too large. Please use a photo under 2 MB.',
  method_not_allowed: 'This address only accepts a photo sent with POST.',
  forbidden_origin: 'This address cannot be used from that website.',
  daily_limit:
    'The free previews for today are used up. Please try again tomorrow, or send us your photo on WhatsApp.',
  model_failed: 'We could not make the preview this time. Please try again, or send us your photo on WhatsApp.',
  timeout: 'The preview took too long. Please try again, or send us your photo on WhatsApp.',
};

const ERROR_STATUS: Record<ErrorCode, number> = {
  bad_request: 400,
  unknown_wheel: 400,
  too_large: 413,
  method_not_allowed: 405,
  forbidden_origin: 403,
  daily_limit: 429,
  model_failed: 502,
  timeout: 504,
};

export type ImageType = 'image/jpeg' | 'image/png' | 'image/webp';

/** Identifies a JPEG, PNG or WebP from its first 12 bytes. Returns null for anything else. */
export function detectImageType(bytes: Uint8Array): ImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50 // P
  ) {
    return 'image/webp';
  }
  return null;
}

const DEFAULT_SIZE = { width: 1024, height: 768 } as const;

function parseDimension(value: unknown): number | null {
  const text = typeof value === 'number' ? String(value) : value;
  if (typeof text !== 'string' || !/^\d{1,5}$/.test(text.trim())) return null;
  const n = Number(text.trim());
  return n >= 64 && n <= 4096 ? n : null;
}

function roundToSixteen(value: number): number {
  return Math.min(1536, Math.max(256, Math.round(value / 16) * 16));
}

/**
 * The size of the edited picture: the sent aspect ratio fitted so the long side is 1024, each side
 * rounded to a multiple of 16 and clamped to 256..1536. 1024x768 when the sizes are missing or invalid.
 */
export function outputSize(width: unknown, height: unknown): { width: number; height: number } {
  const w = parseDimension(width);
  const h = parseDimension(height);
  if (w === null || h === null) return { ...DEFAULT_SIZE };
  const scale = 1024 / Math.max(w, h);
  return { width: roundToSixteen(w * scale), height: roundToSixteen(h * scale) };
}

function allowedOrigins(env: Env): string[] {
  const raw = env.ALLOWED_ORIGINS && env.ALLOWED_ORIGINS.trim() ? env.ALLOWED_ORIGINS : DEFAULT_ORIGIN;
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

/** CORS headers for a request origin: empty unless the origin is on the allowed list. */
export function corsHeaders(origin: string | null, env: Pick<Env, 'ALLOWED_ORIGINS'>, preflight = false): Headers {
  const headers = new Headers();
  if (!origin || !allowedOrigins(env as Env).includes(origin)) return headers;
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Vary', 'Origin');
  if (preflight) {
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Access-Control-Max-Age', '86400');
  }
  return headers;
}

function respond(status: number, body: unknown, cors: Headers, extra?: Record<string, string>): Response {
  const headers = new Headers(cors);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  if (extra) for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  return new Response(JSON.stringify(body), { status, headers });
}

function errorResponse(code: ErrorCode, cors: Headers, extra?: Record<string, string>): Response {
  return respond(ERROR_STATUS[code], { error: code, message: ERROR_MESSAGES[code] }, cors, extra);
}

/**
 * Decides whether a Workers AI failure means the free daily allowance is used up. Cloudflare's error
 * table (https://developers.cloudflare.com/workers-ai/platform/errors/) lists code 3036, HTTP 429:
 * "You have used up your daily free allocation of 10,000 neurons...". The exact shape the binding
 * throws is not documented, so this matches that wording and code case-insensitively (a best guess).
 * Code 3040 ("Capacity temporarily exceeded") is a busy model, not the daily cap.
 */
export function isDailyLimitError(err: unknown): boolean {
  const e = err as { message?: unknown; name?: unknown; code?: unknown } | null;
  const text = `${e && typeof e === 'object' ? String(e.message ?? '') : String(err ?? '')} ${
    e && typeof e === 'object' ? String(e.code ?? '') : ''
  }`.toLowerCase();
  if (text.includes('capacity')) return false;
  return /3036|neurons|daily|quota|allocation|account limited|usage limit|free limit/.test(text);
}

/** The only things an error log line may contain: a name and a number, never content. */
function logAiFailure(err: unknown): void {
  const e = err as { name?: unknown; status?: unknown; code?: unknown } | null;
  const name = e && typeof e.name === 'string' ? e.name : 'unknown';
  const num = e && typeof e.status === 'number' ? e.status : e && typeof e.code === 'number' ? e.code : 0;
  console.error('car-preview AI call failed', name, num);
}

/** Re-wraps a request whose size is not declared so reading more than `max` bytes fails. */
function limitedRequest(request: Request, max: number): { request: Request; exceeded: () => boolean } {
  let exceeded = false;
  if (!request.body) return { request, exceeded: () => false };
  let seen = 0;
  const limiter = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      seen += chunk.byteLength;
      if (seen > max) {
        exceeded = true;
        controller.error(new Error('body too large'));
        return;
      }
      controller.enqueue(chunk);
    },
  });
  const limited = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body.pipeThrough(limiter),
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });
  return { request: limited, exceeded: () => exceeded };
}

type AiOutcome = { kind: 'ok'; image: string } | { kind: 'error'; code: ErrorCode };

async function runModel(env: Env, form: FormData, timeoutMs: number): Promise<AiOutcome> {
  const packed = new Response(form);
  const contentType = packed.headers.get('content-type') ?? '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), timeoutMs);
  });
  try {
    const call = env.AI.run(env.MODEL?.trim() || DEFAULT_MODEL, {
      multipart: { body: packed.body, contentType },
    });
    // If the timeout wins, the model call may still fail later: swallow that so it never goes unhandled.
    call.catch(() => undefined);
    const result = await Promise.race([call, timedOut]);
    if (result === 'timeout') return { kind: 'error', code: 'timeout' };
    const image = (result as { image?: unknown } | null)?.image;
    if (typeof image !== 'string' || image.length < 16) return { kind: 'error', code: 'model_failed' };
    return { kind: 'ok', image };
  } catch (err) {
    logAiFailure(err);
    return { kind: 'error', code: isDailyLimitError(err) ? 'daily_limit' : 'model_failed' };
  } finally {
    clearTimeout(timer);
  }
}

type WheelOutcome = { kind: 'ok'; blob: Blob } | { kind: 'error'; code: ErrorCode };

async function fetchWheelPhoto(slug: string, env: Env, doFetch: typeof fetch): Promise<WheelOutcome> {
  const origin = (env.SITE_ORIGIN?.trim() || DEFAULT_ORIGIN).replace(/\/+$/, '');
  const file = (env.WHEEL_IMAGE_FILE?.trim() || DEFAULT_WHEEL_IMAGE_FILE).replace(/^\/+/, '');
  const url = `${origin}/images/wheels/${slug}/${file}`;
  try {
    const res = await doFetch(url, { cf: { cacheTtl: 86400, cacheEverything: true } } as RequestInit);
    if (res.status === 404) return { kind: 'error', code: 'unknown_wheel' };
    if (!res.ok) return { kind: 'error', code: 'model_failed' };
    // The site answers unknown image addresses with its HTML page (status 200), so check the type.
    const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (!type.startsWith('image/')) return { kind: 'error', code: 'unknown_wheel' };
    const blob = await res.blob();
    if (blob.size === 0 || blob.size > MAX_WHEEL_BYTES) return { kind: 'error', code: 'model_failed' };
    return { kind: 'ok', blob: blob.type ? blob : new Blob([blob], { type }) };
  } catch {
    return { kind: 'error', code: 'model_failed' };
  }
}

export async function handleCarPreview(request: Request, env: Env, deps: Deps = {}): Promise<Response> {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin, env);
  try {
    if (origin && cors.get('Access-Control-Allow-Origin') === null) {
      return errorResponse('forbidden_origin', new Headers());
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env, true) });
    }
    if (request.method !== 'POST') {
      return errorResponse('method_not_allowed', cors, { Allow: 'POST, OPTIONS' });
    }

    const contentType = request.headers.get('Content-Type') ?? '';
    if (!/^multipart\/form-data\s*;/i.test(contentType)) return errorResponse('bad_request', cors);

    const declaredLength = Number(request.headers.get('Content-Length'));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return errorResponse('too_large', cors);

    const limited = limitedRequest(request, MAX_BODY_BYTES);
    let form: FormData;
    try {
      form = await limited.request.formData();
    } catch {
      return errorResponse(limited.exceeded() ? 'too_large' : 'bad_request', cors);
    }

    const car = form.get('car');
    const wheel = form.get('wheel');
    if (!(car instanceof Blob)) return errorResponse('bad_request', cors);
    if (typeof wheel !== 'string' || wheel.length < 3 || wheel.length > 60 || !SLUG_PATTERN.test(wheel)) {
      return errorResponse('bad_request', cors);
    }
    if (car.size > MAX_CAR_BYTES) return errorResponse('too_large', cors);
    if (car.size < 12) return errorResponse('bad_request', cors);

    const declaredType = car.type.split(';')[0].trim().toLowerCase();
    const detectedType = detectImageType(new Uint8Array(await car.slice(0, 12).arrayBuffer()));
    if (!detectedType || declaredType !== detectedType) return errorResponse('bad_request', cors);

    const size = outputSize(form.get('width'), form.get('height'));

    const wheelPhoto = await fetchWheelPhoto(wheel, env, deps.fetch ?? fetch);
    if (wheelPhoto.kind === 'error') return errorResponse(wheelPhoto.code, cors);

    const aiForm = new FormData();
    aiForm.append('prompt', PROMPT);
    aiForm.append('input_image_0', car, 'car');
    aiForm.append('input_image_1', wheelPhoto.blob, 'wheel');
    aiForm.append('width', String(size.width));
    aiForm.append('height', String(size.height));

    const outcome = await runModel(env, aiForm, deps.timeoutMs ?? AI_TIMEOUT_MS);
    if (outcome.kind === 'error') return errorResponse(outcome.code, cors);

    const mime = outcome.image.startsWith('iVBOR') ? 'image/png' : 'image/jpeg';
    return respond(200, { image: outcome.image, mime }, cors);
  } catch {
    return errorResponse('model_failed', cors);
  }
}
