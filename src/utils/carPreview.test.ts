import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  CAR_PREVIEW_DISCLAIMER,
  CAR_PREVIEW_PROVIDER,
  CarPreviewError,
  carPreviewConsentText,
  carPreviewEnabled,
  fitWithin,
  offersWhatsAppFallback,
  requestCarPreview,
} from './carPreview';

const URL_OK = 'https://forged-car-preview.example.workers.dev/';
const IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAHnOcQAAAAABJRU5ErkJggg==';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

/** A fake fetch that records the request it was given and answers with `answer`. */
function fakeFetch(answer: () => Response | Promise<Response>) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return answer();
  }) as typeof fetch;
  return { impl, calls };
}

const car = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' });
const base = { url: URL_OK, car, wheelSlug: 'ff-3-pure-bronze', width: 800, height: 600 };

async function failure(promise: Promise<unknown>): Promise<CarPreviewError> {
  try {
    await promise;
  } catch (error) {
    assert.ok(error instanceof CarPreviewError, `expected a CarPreviewError, got ${String(error)}`);
    return error;
  }
  throw new assert.AssertionError({ message: 'expected the request to fail' });
}

test('a good answer becomes a data URL, and the request carries the four agreed fields', async () => {
  const { impl, calls } = fakeFetch(() => jsonResponse(200, { image: IMAGE, mime: 'image/png' }));
  const result = await requestCarPreview({ ...base, fetchImpl: impl });
  assert.equal(result.imageUrl, `data:image/png;base64,${IMAGE}`);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, URL_OK);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.credentials, 'omit');
  const form = calls[0].init.body as FormData;
  assert.ok(form instanceof FormData);
  const sent = form.get('car') as File;
  assert.equal(sent.name, 'car.jpg');
  assert.equal(sent.size, car.size);
  assert.equal(form.get('wheel'), 'ff-3-pure-bronze');
  assert.equal(form.get('width'), '800');
  assert.equal(form.get('height'), '600');
});

test('a jpeg answer is accepted', async () => {
  const { impl } = fakeFetch(() => jsonResponse(200, { image: IMAGE, mime: 'image/jpeg' }));
  assert.equal((await requestCarPreview({ ...base, fetchImpl: impl })).imageUrl, `data:image/jpeg;base64,${IMAGE}`);
});

for (const [status, code] of [
  [400, 'bad_request'],
  [400, 'unknown_wheel'],
  [403, 'forbidden_origin'],
  [413, 'too_large'],
  [429, 'daily_limit'],
  [502, 'model_failed'],
  [504, 'timeout'],
  [405, 'method_not_allowed'],
] as const) {
  test(`${status} ${code}: the Worker's own message is shown as it is`, async () => {
    const { impl } = fakeFetch(() => jsonResponse(status, { error: code, message: `Message for ${code}.` }));
    const error = await failure(requestCarPreview({ ...base, fetchImpl: impl }));
    assert.equal(error.code, code);
    assert.equal(error.message, `Message for ${code}.`);
  });

  test(`${status} ${code}: a friendly message is used when the Worker sent none`, async () => {
    const { impl } = fakeFetch(() => jsonResponse(status, { error: code }));
    const error = await failure(requestCarPreview({ ...base, fetchImpl: impl }));
    assert.equal(error.code, code);
    assert.ok(error.message.length > 10);
    assert.doesNotMatch(error.message, /undefined|\[object|<html/i);
  });
}

test('an error body that is not JSON gives a generic message and an http_ code', async () => {
  const { impl } = fakeFetch(() => new Response('<html>Bad gateway</html>', { status: 502 }));
  const error = await failure(requestCarPreview({ ...base, fetchImpl: impl }));
  assert.equal(error.code, 'http_502');
  assert.match(error.message, /try again/i);
  assert.doesNotMatch(error.message, /html|gateway/i);
});

test('an error body with an unexpected shape is handled', async () => {
  const { impl } = fakeFetch(() => jsonResponse(500, ['nope']));
  const error = await failure(requestCarPreview({ ...base, fetchImpl: impl }));
  assert.equal(error.code, 'http_500');
});

test('a network failure says so in words the visitor can use', async () => {
  const { impl } = fakeFetch(() => {
    throw new TypeError('Failed to fetch');
  });
  const error = await failure(requestCarPreview({ ...base, fetchImpl: impl }));
  assert.equal(error.code, 'network');
  assert.equal(error.message, 'We could not reach the preview service. Check your connection and try again.');
});

test('an abort is reported as aborted, with nothing to show', async () => {
  const controller = new AbortController();
  const impl = ((_url: string, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })) as unknown as typeof fetch;
  const pending = requestCarPreview({ ...base, signal: controller.signal, fetchImpl: impl });
  controller.abort();
  const error = await failure(pending);
  assert.equal(error.code, 'aborted');
  assert.equal(error.message, '');
});

test('an abort that arrives while the body is being read is still an abort', async () => {
  const controller = new AbortController();
  const { impl } = fakeFetch(() => {
    controller.abort();
    return jsonResponse(200, { image: IMAGE, mime: 'image/png' });
  });
  const error = await failure(requestCarPreview({ ...base, signal: controller.signal, fetchImpl: impl }));
  assert.equal(error.code, 'aborted');
});

test('malformed success bodies are refused', async () => {
  const bad: unknown[] = [
    {},
    null,
    'text',
    { image: IMAGE },
    { mime: 'image/png' },
    { image: 42, mime: 'image/png' },
    { image: '', mime: 'image/png' },
    { image: 'not base64 !!!!!!!!!!!!!!', mime: 'image/png' },
    { image: IMAGE, mime: 'text/html' },
    { image: IMAGE, mime: 'image/svg+xml' },
    { image: IMAGE, mime: 'image/png;base64,evil' },
    { image: IMAGE, mime: 42 },
  ];
  for (const body of bad) {
    const { impl } = fakeFetch(() => jsonResponse(200, body));
    const error = await failure(requestCarPreview({ ...base, fetchImpl: impl }));
    assert.equal(error.code, 'bad_response', JSON.stringify(body));
    assert.match(error.message, /try again/i);
  }
});

test('a success status with a body that is not JSON is refused', async () => {
  const { impl } = fakeFetch(() => new Response('plain text', { status: 200 }));
  assert.equal((await failure(requestCarPreview({ ...base, fetchImpl: impl }))).code, 'bad_response');
});

test('fitWithin keeps the shape of a landscape photo', () => {
  assert.deepEqual(fitWithin(4000, 3000), { width: 512, height: 384 });
  assert.deepEqual(fitWithin(4032, 3024, 1024), { width: 1024, height: 768 });
});

test('fitWithin keeps the shape of a portrait photo', () => {
  assert.deepEqual(fitWithin(3000, 4000), { width: 384, height: 512 });
});

test('fitWithin never enlarges a small photo', () => {
  assert.deepEqual(fitWithin(400, 300), { width: 400, height: 300 });
  assert.deepEqual(fitWithin(512, 512), { width: 512, height: 512 });
  assert.deepEqual(fitWithin(1, 1), { width: 1, height: 1 });
});

test('fitWithin gives whole numbers, at least 1, and honours a different limit', () => {
  const tall = fitWithin(10000, 7, 1024);
  assert.deepEqual(tall, { width: 1024, height: 1 });
  const odd = fitWithin(3001, 2003, 1024);
  assert.ok(Number.isInteger(odd.width) && Number.isInteger(odd.height));
  assert.equal(odd.width, 1024);
  assert.deepEqual(fitWithin(2000, 1000, 500), { width: 500, height: 250 });
});

test('fitWithin refuses a size that is not a size', () => {
  assert.throws(() => fitWithin(0, 100), RangeError);
  assert.throws(() => fitWithin(100, -1), RangeError);
  assert.throws(() => fitWithin(Number.NaN, 100), RangeError);
  assert.throws(() => fitWithin(Number.POSITIVE_INFINITY, 100), RangeError);
});

test('the feature is on only for a non-empty https address', () => {
  assert.equal(carPreviewEnabled({ carPreviewUrl: '' }), false);
  assert.equal(carPreviewEnabled({ carPreviewUrl: URL_OK }), true);
  assert.equal(carPreviewEnabled({ carPreviewUrl: 'http://forged.example.workers.dev/' }), false);
  assert.equal(carPreviewEnabled({ carPreviewUrl: 'not a url' }), false);
  assert.equal(carPreviewEnabled({ carPreviewUrl: 'javascript:alert(1)' }), false);
  assert.equal(carPreviewEnabled({ carPreviewUrl: '//forged.example.workers.dev/' }), false);
});

test('the WhatsApp fallback is offered for the failures a retry will not fix', () => {
  for (const code of ['daily_limit', 'model_failed', 'timeout', 'network']) assert.equal(offersWhatsAppFallback(code), true, code);
  for (const code of ['bad_request', 'too_large', 'unknown_wheel', 'unsupported_image', 'bad_response']) {
    assert.equal(offersWhatsAppFallback(code), false, code);
  }
});

test('the consent and the disclaimer say what was agreed', () => {
  assert.equal(CAR_PREVIEW_PROVIDER, 'Cloudflare');
  assert.equal(
    carPreviewConsentText('FORGED Custom Wheels'),
    'I understand my photo is sent to an AI service (Cloudflare) to make this preview, and that FORGED Custom Wheels does not keep it.',
  );
  assert.equal(
    CAR_PREVIEW_DISCLAIMER,
    "This is an AI-generated impression, not a photograph. The wheel's shape, size and fit can differ from the real thing. We confirm fit for your exact car before you order.",
  );
});

test('the dialog copy makes no fit promise (the agreed disclaimer is the one place that mentions fit)', () => {
  const source = readFileSync(new URL('../components/brand/CarPreviewDialog.tsx', import.meta.url), 'utf8');
  const banned = source.match(/\b(fits|fitting-guaranteed|guarantee[sd]?|exact(ly)?|perfect(ly)? fit)\b/i);
  assert.equal(banned, null, `the dialog says "${banned?.[0]}"`);
});

test('nothing in the car preview code stores the photo or the result', () => {
  for (const file of ['../components/brand/CarPreviewDialog.tsx', './carPreview.ts']) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|useForgedStore|caches\./, file);
  }
});
