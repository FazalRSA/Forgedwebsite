// Local stand-in for the car preview Worker, for testing the browser side without a Cloudflare account.
//
//   npx tsx worker/car-preview/dev-server.mjs            (port 3170, or set PORT)
//   MOCK_ERROR=daily_limit|model_failed|timeout npx tsx worker/car-preview/dev-server.mjs
//
// It runs the real handler with a MOCK AI: after 1.5 seconds it returns the car photo it was given,
// unchanged, as the "edited" image. The wheel photo fetch is mocked too (a 1x1 webp; a slug that
// starts with "nope" answers 404 so you can see the unknown_wheel error).
// Allowed browser origins: ALLOWED_ORIGINS, or the live site plus localhost:3000 / 127.0.0.1:3000.
import http from 'node:http';
import { Readable } from 'node:stream';
import { handleCarPreview } from './src/handler.ts';

const PORT = Number(process.env.PORT) || 3170;
const MOCK_ERROR = process.env.MOCK_ERROR || '';
const DELAY_MS = 1500;
// 1x1 lossless webp
const ONE_PX_WEBP = Buffer.from('UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==', 'base64');

const env = {
  ALLOWED_ORIGINS:
    process.env.ALLOWED_ORIGINS ||
    'https://www.forgedsa.co.za,http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173',
  SITE_ORIGIN: 'https://mock.invalid',
  AI: {
    async run(_model, input) {
      const { body, contentType } = input.multipart;
      const parsed = await new Response(body, { headers: { 'content-type': contentType } }).formData();
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      if (MOCK_ERROR === 'daily_limit') {
        throw new Error(
          "3036: You have used up your daily free allocation of 10,000 neurons. Please upgrade to Cloudflare's Workers Paid plan if you would like to continue usage.",
        );
      }
      if (MOCK_ERROR === 'model_failed') throw new Error('InferenceError: mock failure');
      if (MOCK_ERROR === 'timeout') return new Promise(() => {}); // never answers; the handler gives up
      const car = parsed.get('input_image_0');
      return { image: Buffer.from(await car.arrayBuffer()).toString('base64') };
    },
  },
};

const deps = {
  // The real Worker waits 90 s. Here a "timeout" test gives up after 4 s so it is quick to try.
  timeoutMs: MOCK_ERROR === 'timeout' ? 4000 : 90_000,
  fetch: async (url) => {
    const slug = String(url).split('/images/wheels/')[1]?.split('/')[0] ?? '';
    if (slug.startsWith('nope')) return new Response('not found', { status: 404 });
    return new Response(ONE_PX_WEBP, { status: 200, headers: { 'content-type': 'image/webp' } });
  },
};

/** Turns node's request into a Web Request, streaming the body (no buffering). */
function toWebRequest(req) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) for (const v of value) headers.append(name, v);
    else if (value !== undefined) headers.set(name, value);
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const init = { method: req.method, headers };
  if (hasBody) {
    init.body = Readable.toWeb(req);
    init.duplex = 'half';
  }
  return new Request(`http://localhost:${PORT}${req.url}`, init);
}

const server = http.createServer(async (req, res) => {
  try {
    const response = await handleCarPreview(toWebRequest(req), env, deps);
    const headers = {};
    response.headers.forEach((value, name) => {
      headers[name] = value;
    });
    res.writeHead(response.status, headers);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify({ error: 'model_failed', message: 'Dev server error.' }));
  }
});

server.listen(PORT, () => {
  console.log(`car-preview dev server (mock AI${MOCK_ERROR ? `, forced error: ${MOCK_ERROR}` : ''}) on http://localhost:${PORT}`);
});
