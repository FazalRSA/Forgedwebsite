# Car preview Worker

This small Cloudflare Worker powers the "see these wheels on your car" preview on the website.
The browser sends a customer's car photo and the name of a wheel. The Worker asks Cloudflare's
Workers AI model `@cf/black-forest-labs/flux-2-klein-4b` to put that wheel on the car and sends
the edited picture back. It is separate from the website (which is deployed on Render) and runs on
Cloudflare's **free** plan.

## One-time setup

1. **Create a free Cloudflare account** at <https://dash.cloudflare.com/sign-up/workers-and-pages>.
   Cloudflare's Workers setup pages say "sign up for a Cloudflare account" and do not mention a
   payment card for the Free plan. We could not test the sign-up itself, so if Cloudflare asks for
   a card, check that you are on the **Free** plan before continuing.
2. **Deploy the Worker** from a terminal on a computer with Node installed:

   ```bash
   cd worker/car-preview
   npx wrangler login      # opens a browser tab; approve the login
   npx wrangler deploy
   ```

   The last line prints the Worker's address, like `https://forged-car-preview.<your-name>.workers.dev`.
3. **Tell the website about it.** Copy that address into `carPreviewUrl` in `src/config/site.ts`,
   then deploy the website as usual (pull request, then merge to `main`).
4. **Test it** with any car photo (JPEG, PNG or WebP, under 2 MB). Use a wheel name from the wheels
   page address, for example `ff-1-silver`:

   ```bash
   curl -sS -X POST "https://forged-car-preview.<your-name>.workers.dev" \
     -F "car=@my-car.jpg;type=image/jpeg" -F "wheel=ff-1-silver" \
     -F "width=1024" -F "height=768" -o result.json
   ```

   `result.json` holds `{"image":"<base64>","mime":"image/jpeg"}`. To look at the picture:
   `python3 -c "import json,base64;d=json.load(open('result.json'));open('result.jpg','wb').write(base64.b64decode(d['image']))"`

To try the website against a pretend Worker (no Cloudflare account needed), run
`npx tsx worker/car-preview/dev-server.mjs` from the repository root. It listens on port 3170, waits
1.5 seconds and returns the customer's own photo unchanged. Add `MOCK_ERROR=daily_limit`,
`MOCK_ERROR=model_failed` or `MOCK_ERROR=timeout` in front of the command to see each error.

## What the Worker accepts

`POST` with `multipart/form-data`:

| Field | Meaning |
| --- | --- |
| `car` | The photo: JPEG, PNG or WebP, at most 2,000,000 bytes. The file type and its first bytes are both checked. |
| `wheel` | A wheel name from the catalogue, such as `ff-1-silver` (lower case letters, numbers and single dashes, 3 to 60 characters). |
| `width`, `height` | Optional. The size of the photo as sent (64 to 4096). The edited picture keeps the same shape with its long side at 1024. |

Only the wheel name is accepted from the customer. The Worker fetches that wheel's own product photo
from `https://www.forgedsa.co.za/images/wheels/<wheel>/hero-400.webp` and uses a fixed instruction,
so nobody can use it as a general-purpose image editor.

Answers are JSON. Success is `{"image":"...","mime":"image/jpeg"}`. A problem is
`{"error":"<code>","message":"..."}` with `bad_request` or `unknown_wheel` (400), `forbidden_origin`
(403), `method_not_allowed` (405), `too_large` (413), `photo_rejected` (422, the model's own safety
filter refused the picture: Cloudflare error 3030), `daily_limit` (429), `model_failed` (502) or
`timeout` (504, after 90 seconds).

Only the origins in `ALLOWED_ORIGINS` (default `https://www.forgedsa.co.za`) can call it from a
browser. To test from a local copy of the site, add `,http://localhost:3000` in `wrangler.toml`,
deploy, and remove it again afterwards.

## The free limits

From Cloudflare's pricing and limits pages for the Free plan:

- **Workers AI: 10,000 Neurons per day.** This is a hard cap on the Free plan: once it is used up,
  further AI calls fail until the count resets at **00:00 UTC** (02:00 in South Africa). The website
  then shows the customer "The free previews for today are used up. Please try again tomorrow, or
  send us your photo on WhatsApp." Cloudflare's price list charges this model about 5.4 Neurons per
  512x512 input image tile and about 26 Neurons per 512x512 output tile, so one preview is roughly
  100 to 150 Neurons, which is on the order of 70 to 100 previews a day. Your Cloudflare dashboard
  (Workers AI page) shows the real number used.
- **Workers: 100,000 requests per day, 10 ms of CPU time per request, 128 MB of memory and 50
  outgoing requests per request.** Time spent waiting for the AI does not count towards the 10 ms.
  The Worker never converts the photos itself, to stay far below that.

**Do not upgrade this account to the Workers Paid plan unless you want to pay for extra use.** On
Paid, Workers AI above 10,000 Neurons a day is charged at $0.011 per 1,000 Neurons, and the daily cap
no longer stops the previews. If you ever do, set a spending limit or email alert in the Cloudflare
dashboard (Billing).

## Changing the model

The model name is the `MODEL` line in `wrangler.toml`. Change it and run `npx wrangler deploy`
again. The Worker sends `prompt`, `input_image_0` (the car), `input_image_1` (the wheel), `width` and
`height`, which is what the FLUX.2 models on Workers AI take. A different model family may need a
different input, which means changing `src/handler.ts`.

Cloudflare's FLUX.2 [klein] 4B notes say input images "must be smaller than 512x512" (the klein 9B
and FLUX.2 dev notes say the same). So the website shrinks the car photo to 512 px on its longest side
before sending it, and the Worker uses the 400 px wheel photo (`hero-400.webp`). The picture that comes
back is larger: the Worker asks the model for a 1024 px long side, as in Cloudflare's own example.
`WHEEL_IMAGE_FILE` in `wrangler.toml` can name a different file in the wheel's image folder, for
example `front-400.webp`, if another view copies better. A larger file would go against Cloudflare's
documented limit, so keep it under 512 px.

## Privacy

What Cloudflare says on its Workers AI data usage page (<https://developers.cloudflare.com/workers-ai/platform/data-usage/>):

- "Cloudflare does not retain inputs or outputs after they are no longer needed to process the
  request and deliver the response" (for standard requests that do not use a stateful feature).
- "Cloudflare does not use Customer Content processed by Workers AI to train AI models."
- "Your content remains yours: You own, and are responsible for, your Customer Content."
- Cloudflare may keep "operational metadata" for running and billing the service, such as
  timestamps, request and response sizes, neuron counts, latency and status codes. It "does not
  include Customer Content".
- Storage happens only if you add it: "Customer Content may be stored when you ... write Customer
  Content to application logs" or use R2, KV, Durable Objects, Vectorize or AI Gateway logging.

So this Worker keeps no logs of photos or results (`[observability] enabled = false` in
`wrangler.toml`), writes nothing to Cloudflare storage and never logs a photo, prompt or result.
It only logs an error name and number if the model fails. Keep it that way: do not turn on logs,
Logpush, KV, R2, D1 or AI Gateway for this Worker.

The model's page lists "Zero data retention: Yes", and its terms link is
<https://bfl.ai/legal/terms-of-service>. In those terms, Black Forest Labs says "We claim no
ownership rights in and to Your Content" (which includes the generated output), but its terms do
not plainly say "you may use outputs commercially": they allow "your use of your Output ... as
expressly permitted by these Terms". The model's weights are published on Hugging Face under
Apache 2.0 ("Open weights available for commercial use under the Apache 2.0 license"). The
previews are a free service for the customer's own photo, not something we sell. If you plan to
reuse the edited pictures in advertising, ask Black Forest Labs or take legal advice first.
