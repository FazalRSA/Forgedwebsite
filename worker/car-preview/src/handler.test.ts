import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROMPT,
  corsHeaders,
  detectImageType,
  handleCarPreview,
  isDailyLimitError,
  isPhotoRejectedError,
  outputSize,
  type Env,
} from './handler.ts';

const JPEG_HEAD = [0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1];
const PNG_HEAD = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13];
const WEBP_HEAD = [0x52, 0x49, 0x46, 0x46, 0x1a, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];
const WHEEL_BYTES = new Uint8Array([...WEBP_HEAD, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
const ORIGIN = 'https://www.forgedsa.co.za';
const FAKE_IMAGE = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD'; // starts like a base64 JPEG

function bytesOf(head: number[], total = 64): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(Math.max(total, head.length));
  out.set(head);
  for (let i = head.length; i < out.length; i++) out[i] = i % 251;
  return out;
}

function carFile(head = JPEG_HEAD, type = 'image/jpeg', total = 64): File {
  return new File([bytesOf(head, total)], 'car.jpg', { type });
}

function makeForm(fields: Record<string, string | Blob | undefined>): FormData {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) form.append(k, v);
  return form;
}

interface AiCall {
  model: string;
  prompt: string | null;
  names: string[];
  image0: Uint8Array;
  image1: Uint8Array;
  width: string | null;
  height: string | null;
}

function makeEnv(
  behaviour: (call: AiCall) => Promise<unknown> | unknown = () => ({ image: FAKE_IMAGE }),
  extra: Partial<Env> = {},
): { env: Env; calls: AiCall[] } {
  const calls: AiCall[] = [];
  const env: Env = {
    ...extra,
    AI: {
      async run(model: string, input: unknown) {
        const { multipart } = input as { multipart: { body: ReadableStream; contentType: string } };
        assert.equal(typeof multipart.contentType, 'string');
        assert.match(multipart.contentType, /^multipart\/form-data; boundary=/);
        const parsed = await new Response(multipart.body, { headers: { 'content-type': multipart.contentType } }).formData();
        const names = [...parsed.keys()];
        const i0 = parsed.get('input_image_0') as Blob;
        const i1 = parsed.get('input_image_1') as Blob;
        const call: AiCall = {
          model,
          prompt: parsed.get('prompt') as string | null,
          names,
          image0: new Uint8Array(await i0.arrayBuffer()),
          image1: new Uint8Array(await i1.arrayBuffer()),
          width: parsed.get('width') as string | null,
          height: parsed.get('height') as string | null,
        };
        calls.push(call);
        return behaviour(call);
      },
    },
  };
  return { env, calls };
}

const wheelFetch = (urls: string[] = []): typeof fetch =>
  (async (url: string | URL | Request) => {
    urls.push(String(url));
    return new Response(WHEEL_BYTES, { status: 200, headers: { 'content-type': 'image/webp' } });
  }) as typeof fetch;

function post(form: FormData | string, headers: Record<string, string> = {}): Request {
  return new Request('https://worker.example/', { method: 'POST', body: form, headers });
}

async function json(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>;
}

test('outputSize: fits the long side to 1024, rounds to 16, clamps to 256..1536', () => {
  assert.deepEqual(outputSize('1600', '1200'), { width: 1024, height: 768 });
  assert.deepEqual(outputSize('1024', '768'), { width: 1024, height: 768 });
  // 800x1200 -> scale 1024/1200 -> 682.67 x 1024 -> 682.67/16 = 42.67 -> 43 * 16 = 688
  assert.deepEqual(outputSize('800', '1200'), { width: 688, height: 1024 });
  // 4096x64 -> 1024 x 16 -> clamped up to 256
  assert.deepEqual(outputSize('4096', '64'), { width: 1024, height: 256 });
  assert.deepEqual(outputSize('64', '4096'), { width: 256, height: 1024 });
  assert.deepEqual(outputSize('300', '300'), { width: 1024, height: 1024 });
});

test('outputSize: missing or invalid sizes fall back to 1024x768', () => {
  for (const [w, h] of [
    [undefined, undefined],
    [null, '768'],
    ['abc', '768'],
    ['63', '768'],
    ['4097', '768'],
    ['1024.5', '768'],
    ['-5', '768'],
    ['', ''],
  ] as const) {
    assert.deepEqual(outputSize(w, h), { width: 1024, height: 768 }, `${w} x ${h}`);
  }
});

test('detectImageType: jpeg, png, webp and rejects the rest', () => {
  assert.equal(detectImageType(bytesOf(JPEG_HEAD)), 'image/jpeg');
  assert.equal(detectImageType(bytesOf(PNG_HEAD)), 'image/png');
  assert.equal(detectImageType(bytesOf(WEBP_HEAD)), 'image/webp');
  assert.equal(detectImageType(new TextEncoder().encode('GIF89a......')), null);
  assert.equal(detectImageType(new TextEncoder().encode('<html>......')), null);
  assert.equal(detectImageType(new Uint8Array([0xff, 0xd8])), null);
  // RIFF but not WEBP (a WAV file)
  assert.equal(detectImageType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45])), null);
});

test('corsHeaders: reflects only allowed origins', () => {
  const env = { ALLOWED_ORIGINS: 'https://a.example, http://localhost:3000/' };
  assert.equal(corsHeaders('https://a.example', env).get('Access-Control-Allow-Origin'), 'https://a.example');
  assert.equal(corsHeaders('http://localhost:3000', env).get('Access-Control-Allow-Origin'), 'http://localhost:3000');
  assert.equal(corsHeaders('https://evil.example', env).get('Access-Control-Allow-Origin'), null);
  assert.equal(corsHeaders(null, env).get('Access-Control-Allow-Origin'), null);
  // default origin
  assert.equal(corsHeaders(ORIGIN, {}).get('Access-Control-Allow-Origin'), ORIGIN);
});

test('happy path: JSON shape, jpeg mime, no-store, CORS reflected, AI called with the right input', async () => {
  const { env, calls } = makeEnv();
  const urls: string[] = [];
  const res = await handleCarPreview(
    post(makeForm({ car: carFile(), wheel: 'ff-1-silver', width: '1600', height: '1200' }), { Origin: ORIGIN }),
    env,
    { fetch: wheelFetch(urls) },
  );
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') ?? '', /^application\/json/);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(res.headers.get('vary'), 'Origin');
  assert.deepEqual(await json(res), { image: FAKE_IMAGE, mime: 'image/jpeg' });

  assert.deepEqual(urls, ['https://www.forgedsa.co.za/images/wheels/ff-1-silver/hero-400.webp']);
  assert.equal(calls.length, 1);
  const call = calls[0];
  assert.equal(call.model, '@cf/black-forest-labs/flux-2-klein-4b');
  assert.equal(call.prompt, PROMPT);
  assert.deepEqual(call.names, ['prompt', 'input_image_0', 'input_image_1', 'width', 'height']);
  assert.deepEqual(call.image0, bytesOf(JPEG_HEAD)); // car first
  assert.deepEqual(call.image1, WHEEL_BYTES); // wheel second
  assert.equal(call.width, '1024');
  assert.equal(call.height, '768');
});

test('happy path: png output is detected, MODEL / SITE_ORIGIN / WHEEL_IMAGE_FILE overrides are used, no Origin is allowed', async () => {
  const png = 'iVBORw0KGgoAAAANSUhEUgAA';
  const { env, calls } = makeEnv(() => ({ image: png }), {
    MODEL: '@cf/black-forest-labs/flux-2-klein-9b',
    SITE_ORIGIN: 'https://staging.example/',
    WHEEL_IMAGE_FILE: 'front-800.webp',
  });
  const urls: string[] = [];
  const res = await handleCarPreview(post(makeForm({ car: carFile(PNG_HEAD, 'image/png'), wheel: 'fsa004-silver' })), env, {
    fetch: wheelFetch(urls),
  });
  assert.equal(res.status, 200);
  assert.deepEqual(await json(res), { image: png, mime: 'image/png' });
  assert.equal(res.headers.get('access-control-allow-origin'), null);
  assert.deepEqual(urls, ['https://staging.example/images/wheels/fsa004-silver/front-800.webp']);
  assert.equal(calls[0].model, '@cf/black-forest-labs/flux-2-klein-9b');
  assert.equal(calls[0].width, '1024');
  assert.equal(calls[0].height, '768');
});

test('happy path: webp car photos are accepted and portrait sizes are passed to the model', async () => {
  const { env, calls } = makeEnv();
  const res = await handleCarPreview(
    post(makeForm({ car: carFile(WEBP_HEAD, 'image/webp'), wheel: 'abc', width: '800', height: '1200' })),
    env,
    { fetch: wheelFetch() },
  );
  assert.equal(res.status, 200);
  assert.equal(calls[0].width, '688');
  assert.equal(calls[0].height, '1024');
});

test('wrong method returns 405 with Allow', async () => {
  const { env, calls } = makeEnv();
  for (const method of ['GET', 'PUT', 'DELETE']) {
    const res = await handleCarPreview(new Request('https://worker.example/', { method }), env);
    assert.equal(res.status, 405, method);
    assert.equal((await json(res)).error, 'method_not_allowed');
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(res.headers.get('allow'), 'POST, OPTIONS');
  }
  assert.equal(calls.length, 0);
});

test('OPTIONS preflight from an allowed origin: 204 with CORS headers', async () => {
  const { env } = makeEnv();
  const res = await handleCarPreview(
    new Request('https://worker.example/', {
      method: 'OPTIONS',
      headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'POST' },
    }),
    env,
  );
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(res.headers.get('access-control-allow-methods'), 'POST, OPTIONS');
  assert.equal(res.headers.get('access-control-allow-headers'), 'Content-Type');
  assert.equal(res.headers.get('access-control-max-age'), '86400');
  assert.equal(res.headers.get('vary'), 'Origin');
});

test('disallowed Origin: 403 forbidden_origin, no CORS headers, AI never called (POST and OPTIONS)', async () => {
  const { env, calls } = makeEnv();
  for (const method of ['POST', 'OPTIONS']) {
    const res = await handleCarPreview(
      new Request('https://worker.example/', {
        method,
        headers: { Origin: 'https://evil.example' },
        body: method === 'POST' ? makeForm({ car: carFile(), wheel: 'ff-1-silver' }) : undefined,
      }),
      env,
      { fetch: wheelFetch() },
    );
    assert.equal(res.status, 403, method);
    assert.equal((await json(res)).error, 'forbidden_origin');
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(res.headers.get('access-control-allow-origin'), null);
  }
  assert.equal(calls.length, 0);
});

test('ALLOWED_ORIGINS can list several origins', async () => {
  const { env } = makeEnv(undefined, { ALLOWED_ORIGINS: 'https://www.forgedsa.co.za,http://localhost:3000' });
  const res = await handleCarPreview(
    post(makeForm({ car: carFile(), wheel: 'ff-1-silver' }), { Origin: 'http://localhost:3000' }),
    env,
    { fetch: wheelFetch() },
  );
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
});

test('bad requests: not multipart, missing fields, bad slugs, wrong declared type, wrong magic bytes', async () => {
  const { env, calls } = makeEnv();
  const deps = { fetch: wheelFetch() };
  const expectBad = async (req: Request, label: string) => {
    const res = await handleCarPreview(req, env, deps);
    assert.equal(res.status, 400, label);
    assert.equal((await json(res)).error, 'bad_request', label);
    assert.equal(res.headers.get('cache-control'), 'no-store', label);
  };

  await expectBad(post('{"wheel":"ff-1-silver"}', { 'Content-Type': 'application/json' }), 'json body');
  await expectBad(post('car=1', { 'Content-Type': 'application/x-www-form-urlencoded' }), 'urlencoded');
  await expectBad(post(makeForm({ wheel: 'ff-1-silver' })), 'no car');
  await expectBad(post(makeForm({ car: carFile() })), 'no wheel');
  await expectBad(post(makeForm({ car: 'not a file', wheel: 'ff-1-silver' })), 'car is a string');
  for (const slug of ['../etc', '../../etc/passwd', 'FF-1-Silver', 'ab', 'a', '-abc', 'abc-', 'a--b', 'a_b', 'a b', 'ab/cd', 'a'.repeat(61)]) {
    await expectBad(post(makeForm({ car: carFile(), wheel: slug })), `slug ${slug}`);
  }
  // Declared type is right but the bytes are a GIF
  const gif = new File([new TextEncoder().encode('GIF89a' + 'x'.repeat(60))], 'car.jpg', { type: 'image/jpeg' });
  await expectBad(post(makeForm({ car: gif, wheel: 'ff-1-silver' })), 'gif disguised as jpeg');
  // Bytes are a PNG but declared as JPEG
  await expectBad(post(makeForm({ car: carFile(PNG_HEAD, 'image/jpeg'), wheel: 'ff-1-silver' })), 'png declared as jpeg');
  // Bytes are a JPEG but the declared type is not allowed
  await expectBad(post(makeForm({ car: carFile(JPEG_HEAD, 'image/gif'), wheel: 'ff-1-silver' })), 'declared gif');
  await expectBad(post(makeForm({ car: carFile(JPEG_HEAD, 'application/octet-stream'), wheel: 'ff-1-silver' })), 'octet-stream');
  // Tiny file
  await expectBad(post(makeForm({ car: new File([new Uint8Array([0xff, 0xd8, 0xff])], 'c.jpg', { type: 'image/jpeg' }), wheel: 'ff-1-silver' })), 'tiny');
  assert.equal(calls.length, 0, 'the model is never called for bad requests');
});

test('oversize car photo: 413 too_large (1 byte over and way over); exactly 2,000,000 bytes is allowed', async () => {
  const { env, calls } = makeEnv();
  const deps = { fetch: wheelFetch() };
  const over = await handleCarPreview(post(makeForm({ car: carFile(JPEG_HEAD, 'image/jpeg', 2_000_001), wheel: 'ff-1-silver' })), env, deps);
  assert.equal(over.status, 413);
  assert.equal((await json(over)).error, 'too_large');
  assert.equal(over.headers.get('cache-control'), 'no-store');

  // A declared Content-Length that is already far too big is refused before reading the body.
  const huge = await handleCarPreview(
    new Request('https://worker.example/', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=x', 'Content-Length': '50000000' },
      body: 'x',
    }),
    env,
    deps,
  );
  assert.equal(huge.status, 413);

  // A body of unknown length that streams past the limit is cut off.
  const big = new Uint8Array(3_000_000);
  big.set(JPEG_HEAD);
  const streamed = await handleCarPreview(
    post(makeForm({ car: new File([big], 'car.jpg', { type: 'image/jpeg' }), wheel: 'ff-1-silver' })),
    env,
    deps,
  );
  assert.equal(streamed.status, 413);
  assert.equal(calls.length, 0);

  const exact = await handleCarPreview(post(makeForm({ car: carFile(JPEG_HEAD, 'image/jpeg', 2_000_000), wheel: 'ff-1-silver' })), env, deps);
  assert.equal(exact.status, 200);
});

test('unknown wheel: the wheel photo fetch returns 404 -> 400 unknown_wheel', async () => {
  const { env, calls } = makeEnv();
  const notFound = (async () => new Response('nope', { status: 404 })) as unknown as typeof fetch;
  const res = await handleCarPreview(post(makeForm({ car: carFile(), wheel: 'no-such-wheel' })), env, { fetch: notFound });
  assert.equal(res.status, 400);
  assert.equal((await json(res)).error, 'unknown_wheel');
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(calls.length, 0);
});

test('unknown wheel: the site answering with its HTML page (200 text/html) is also unknown_wheel', async () => {
  const { env, calls } = makeEnv();
  const spa = (async () =>
    new Response('<!doctype html><html></html>', { status: 200, headers: { 'content-type': 'text/html' } })) as unknown as typeof fetch;
  const res = await handleCarPreview(post(makeForm({ car: carFile(), wheel: 'no-such-wheel' })), env, { fetch: spa });
  assert.equal(res.status, 400);
  assert.equal((await json(res)).error, 'unknown_wheel');
  assert.equal(calls.length, 0);
});

test('wheel photo fetch failing (500 or network error) is a 502 model_failed, never a throw', async () => {
  const { env } = makeEnv();
  const fiveHundred = (async () => new Response('x', { status: 500 })) as unknown as typeof fetch;
  const boom = (async () => {
    throw new Error('network down');
  }) as unknown as typeof fetch;
  for (const f of [fiveHundred, boom]) {
    const res = await handleCarPreview(post(makeForm({ car: carFile(), wheel: 'ff-1-silver' })), env, { fetch: f });
    assert.equal(res.status, 502);
    assert.equal((await json(res)).error, 'model_failed');
  }
});

test('daily allowance used up -> 429 daily_limit (several plausible error wordings)', async () => {
  const wordings = [
    '3036: You have used up your daily free allocation of 10,000 neurons. Please upgrade to Cloudflare\'s Workers Paid plan if you would like to continue usage.',
    'AiError: Account limited (3036)',
    'Daily limit reached',
    'Quota exceeded',
  ];
  const silence = console.error;
  console.error = () => undefined;
  try {
    for (const message of wordings) {
      const { env } = makeEnv(() => {
        throw new Error(message);
      });
      const res = await handleCarPreview(post(makeForm({ car: carFile(), wheel: 'ff-1-silver' }), { Origin: ORIGIN }), env, {
        fetch: wheelFetch(),
      });
      assert.equal(res.status, 429, message);
      const body = await json(res);
      assert.equal(body.error, 'daily_limit');
      assert.match(String(body.message), /free previews for today are used up/i);
      assert.equal(res.headers.get('cache-control'), 'no-store');
      assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
    }
  } finally {
    console.error = silence;
  }
  assert.equal(isDailyLimitError(new Error('Capacity temporarily exceeded, please try again.')), false);
  assert.equal(isDailyLimitError(new Error('InferenceError: boom')), false);
});

test('the model refusing the photo (error 3030) -> 422 photo_rejected, never a daily-limit or generic failure', async () => {
  const silence = console.error;
  console.error = () => undefined;
  try {
    for (const message of [
      '3030: Your output has been flagged. Please choose another prompt / input image combination',
      'AiError: output has been flagged',
    ]) {
      const { env } = makeEnv(() => {
        throw new Error(message);
      });
      const res = await handleCarPreview(post(makeForm({ car: carFile(), wheel: 'ff-1-silver' }), { Origin: ORIGIN }), env, {
        fetch: wheelFetch(),
      });
      assert.equal(res.status, 422, message);
      const body = await json(res);
      assert.equal(body.error, 'photo_rejected');
      assert.match(String(body.message), /different photo/i);
      assert.equal(res.headers.get('cache-control'), 'no-store');
      assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
    }
  } finally {
    console.error = silence;
  }
  assert.equal(isPhotoRejectedError(new Error('InferenceError: boom')), false);
  assert.equal(isPhotoRejectedError(new Error('3036: You have used up your daily free allocation')), false);
  assert.equal(isDailyLimitError(new Error('3030: Your output has been flagged.')), false);
});

test('any other AI failure -> 502 model_failed; bad AI output shapes too', async () => {
  const silence = console.error;
  console.error = () => undefined;
  try {
    const failing = [
      () => {
        throw new Error('InferenceError: something broke');
      },
      () => Promise.reject(new Error('Capacity temporarily exceeded, please try again.')),
      () => ({}),
      () => ({ image: 123 }),
      () => null,
      () => ({ image: '' }),
    ];
    for (const behaviour of failing) {
      const { env } = makeEnv(behaviour);
      const res = await handleCarPreview(post(makeForm({ car: carFile(), wheel: 'ff-1-silver' })), env, { fetch: wheelFetch() });
      assert.equal(res.status, 502);
      assert.equal((await json(res)).error, 'model_failed');
      assert.equal(res.headers.get('cache-control'), 'no-store');
    }
  } finally {
    console.error = silence;
  }
});

test('AI call over the time limit -> 504 timeout', async () => {
  const { env } = makeEnv(() => new Promise(() => undefined));
  const started = Date.now();
  const res = await handleCarPreview(post(makeForm({ car: carFile(), wheel: 'ff-1-silver' })), env, {
    fetch: wheelFetch(),
    timeoutMs: 40,
  });
  assert.equal(res.status, 504);
  assert.equal((await json(res)).error, 'timeout');
  assert.ok(Date.now() - started < 2000);
});

test('a late AI failure after the timeout does not crash', async () => {
  const { env } = makeEnv(
    () => new Promise((_, reject) => setTimeout(() => reject(new Error('late')), 80)),
  );
  const res = await handleCarPreview(post(makeForm({ car: carFile(), wheel: 'ff-1-silver' })), env, {
    fetch: wheelFetch(),
    timeoutMs: 20,
  });
  assert.equal(res.status, 504);
  await new Promise((r) => setTimeout(r, 150));
});

test('nothing the customer sent is logged when the model fails', async () => {
  const logged: unknown[][] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    logged.push(args);
  };
  try {
    const { env } = makeEnv(() => {
      const err = new Error(`boom ${FAKE_IMAGE} ${PROMPT}`) as Error & { status?: number };
      err.status = 500;
      throw err;
    });
    await handleCarPreview(post(makeForm({ car: carFile(), wheel: 'ff-1-silver' })), env, { fetch: wheelFetch() });
  } finally {
    console.error = original;
  }
  assert.equal(logged.length, 1);
  const text = JSON.stringify(logged);
  assert.ok(!text.includes(FAKE_IMAGE));
  assert.ok(!text.includes('Replace the wheels'));
  assert.ok(!text.includes('boom'));
  assert.deepEqual(logged[0], ['car-preview AI call failed', 'Error', 500]);
});
