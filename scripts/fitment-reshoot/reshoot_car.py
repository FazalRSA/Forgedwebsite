#!/usr/bin/env python3
"""
reshoot_car.py: turn a customer's phone photo of a car on FORGED wheels into two
consistent studio product shots (front three-quarter + exact 90 degree side profile)
for the website's Client Fitments gallery.

Derived from the wheel-render skill's photo path (generate_renders.py), with a car
prompt set and OpenRouter's dedicated Images API (POST /api/v1/images), which takes
reference images (`input_references`), a fixed `aspect_ratio` and a `resolution`
tier. Falls back to the chat-completions route if the Images API refuses the model.

Why this shape (same reasoning as the wheel skill):
- The model EDITS the real photo (passed as a reference), so the real car, body kit,
  colour and above all the real wheels stay faithful. Only the environment, camera
  and lighting are standardised.
- The side profile is generated with the phone photo AND the generated front-3/4
  shot as references, so both outputs read as the same car in the same studio.
- Canvas size and aspect ratio are enforced locally with Pillow afterwards.

Usage:
  OPENROUTER_API_KEY=... python3 reshoot_car.py --jobs jobs.json --slug g80-m3-mint-green-silver \
      --rawdir raw --outdir out [--angles front34,side] [--resolution 2K] [--model google/gemini-3-pro-image]
"""
import argparse, base64, io, json, os, sys, time, urllib.request, urllib.error
from PIL import Image, ImageOps

IMAGES_URL = "https://openrouter.ai/api/v1/images"
CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = os.environ.get("OPENROUTER_IMAGE_MODEL", "google/gemini-3-pro-image")

CANVAS = {"2K": (2400, 1800), "1K": (1200, 900), "4K": (4800, 3600)}  # 4:3 canvases near Gemini's native output sizes
WEB_WIDTHS = [1600, 800]

STYLE_RULES = (
    "This is a photographic re-shoot of the EXACT car in the reference photo(s), not a new design. "
    "Keep the same make, model, generation and body style; the same paint colour and finish; the same "
    "aftermarket parts (front lip, side skirts, diffuser, spoiler, carbon bonnet or roof, if present); the "
    "same ride height and stance; and, most important of all, the SAME WHEELS: identical spoke design and "
    "spoke count, identical wheel finish and colour, identical lip and concavity, identical brake caliper "
    "colour, identical tyre profile. Never swap, redesign, simplify or re-colour the wheels. Keep the roof, "
    "mirrors, spoiler and trim exactly as in the reference (a black carbon-fibre roof stays black carbon; a "
    "body-colour roof stays body colour). "
    "Remove the entire original environment: background, buildings, other vehicles, people, cones, signs, "
    "stickers, text and the reflections of that environment in the paint, and replace them with clean, "
    "plausible studio reflections. Remove the number plate completely and leave the plate recess empty "
    "(no plate, no text). "
    "Lighting: one large soft overhead softbox with gentle side fill, neutral white balance (5500 K), soft "
    "but crisp specular highlights along the body lines, in the style of premium automotive catalogue "
    "photography; the paint colour must stay true to the reference, neither darker nor more saturated. "
    "Background: an infinite, completely empty seamless sweep: a clean white floor that blends smoothly into a "
    "light grey upper background with no visible horizon line. The frame contains only the car, its soft "
    "realistic contact shadow and a faint reflection on the floor. There is NO ceiling, NO softbox or light "
    "panel, NO walls or corners, NO panel edges, NO turntable or floor disc, NO props. "
    "Output a single photorealistic image, sharp from bumper to bumper, with no added text, logos, "
    "watermarks or borders."
)

ANGLE_PROMPTS = {
    "front34": (
        "Front three-quarter studio shot: the camera is at about headlight height (around 1.0 m), roughly "
        "35 to 40 degrees off the car's nose on the side of the car that is visible in the reference photo, "
        "so the full front end and the full near side are both visible and both near-side wheels show their "
        "spoke design clearly. The front wheels are turned slightly toward the camera to present the wheel "
        "face. The car is centred, level, and fills about 80 percent of the frame width, with the tyres "
        "resting on the floor in the lower third of the frame and generous clear space above the roof. "
        "Landscape 4:3 format."
    ),
    "side": (
        "Exact 90 degree side profile studio shot, clearly different from a three-quarter view: the camera "
        "is perpendicular to the car's centreline at wheel-hub height (around 0.7 m), far back with a long "
        "lens (about 100 mm equivalent) so there is no perspective distortion and the car's silhouette is "
        "seen flat-on. Show the same side of the car as the reference photo. Both wheels are fully visible "
        "and perfectly round, front wheels pointing straight ahead, the whole wheel face and the stance "
        "(flush fitment, wheel gap) readable. The car is centred, level, and fills about 86 percent of the "
        "frame width, tyres resting on the floor in the lower third of the frame. Landscape 4:3 format."
    ),
}

BACKDROP_CLAUSE = (
    "The LAST reference image is a photograph of the empty studio set with no car in it. Reproduce that exact "
    "backdrop, gradient and floor tone behind and under the car, edge to edge, and add only the car's soft "
    "shadow and faint floor reflection. Do not add a ceiling, walls, light panels, edges or a turntable."
)

CONSISTENCY_CLAUSE = (
    "One or more earlier studio images of this same car are included as additional references: match "
    "their background tone, floor shadow, lighting, paint colour and wheel finish exactly, so the new "
    "angle looks like it was shot seconds later in the same studio."
)


def log(msg):
    print(f"[reshoot] {msg}", file=sys.stderr, flush=True)


def http_json(url, headers, payload=None, timeout=300):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method="POST" if data else "GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code} from {url}: {body[:1500]}") from None


def prepare_reference(src_path, dst_path, long_edge=1600, quality=88):
    """EXIF-correct, downscale and re-encode a phone photo so the request stays small."""
    try:
        im = ImageOps.exif_transpose(Image.open(src_path)).convert("RGB")
        im.thumbnail((long_edge, long_edge), Image.LANCZOS)
        im.save(dst_path, "JPEG", quality=quality, optimize=True)
    except (OSError, ValueError) as e:
        raise SystemExit(f"reshoot: could not prepare reference {src_path} -> {dst_path}: {e}")
    return dst_path


def data_url(path):
    ext = os.path.splitext(path)[1].lower().lstrip(".")
    mime = {"jpg": "jpeg"}.get(ext, ext or "png")
    try:
        with open(path, "rb") as f:
            return f"data:image/{mime};base64," + base64.b64encode(f.read()).decode("ascii")
    except OSError as e:
        raise SystemExit(f"reshoot: could not read reference image {path}: {e}")


def call_images_api(api_key, model, prompt, refs, resolution, aspect):
    payload = {
        "model": model,
        "prompt": prompt,
        "input_references": [{"type": "image_url", "image_url": {"url": data_url(p)}} for p in refs],
        "aspect_ratio": aspect,
        "resolution": resolution,
        "output_format": "png",
        "n": 1,
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json",
               "HTTP-Referer": "https://forged.local", "X-Title": "forged car re-shoot"}
    resp = http_json(IMAGES_URL, headers, payload)
    data = (resp.get("data") or [])
    if not data or not data[0].get("b64_json"):
        raise RuntimeError(f"Images API returned no image: {json.dumps(resp)[:600]}")
    cost = (resp.get("usage") or {}).get("cost")
    return base64.b64decode(data[0]["b64_json"]), cost


def call_chat_api(api_key, model, prompt, refs, resolution, aspect):
    content = [{"type": "text", "text": prompt}] + [
        {"type": "image_url", "image_url": {"url": data_url(p)}} for p in refs]
    payload = {"model": model, "modalities": ["image", "text"],
               "image_config": {"aspect_ratio": aspect, "image_size": resolution},
               "messages": [{"role": "user", "content": content}]}
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json",
               "HTTP-Referer": "https://forged.local", "X-Title": "forged car re-shoot"}
    resp = http_json(CHAT_URL, headers, payload)
    msg = resp["choices"][0]["message"]
    for img in (msg.get("images") or []):
        url = img.get("image_url", {}).get("url", "")
        if url.startswith("data:image"):
            return base64.b64decode(url.split(",", 1)[1]), (resp.get("usage") or {}).get("cost")
    raise RuntimeError(f"Chat API returned no image: {str(msg.get('content'))[:300]!r}")


def generate(api_key, model, prompt, refs, resolution, aspect, retries=3):
    last = None
    for attempt in range(1, retries + 1):
        try:
            # Chat completions first: with Gemini, `image_config.image_size` yields a true 2K
            # frame (2400x1792 at 4:3), whereas the Images API clamped `resolution` to ~1K
            # (1200x896) in testing on 2026-11-09. Same price either way.
            try:
                return call_chat_api(api_key, model, prompt, refs, resolution, aspect)
            except RuntimeError as e:
                if any(code in str(e) for code in ("HTTP 400", "HTTP 404", "HTTP 405", "HTTP 422")):
                    log(f"chat route refused ({str(e)[:160]}); trying the Images API")
                    return call_images_api(api_key, model, prompt, refs, resolution, aspect)
                raise
        except Exception as e:
            last = e
            log(f"attempt {attempt}/{retries} failed: {str(e)[:300]}")
            if "HTTP 401" in str(e) or "HTTP 402" in str(e) or "HTTP 403" in str(e):
                break  # bad key / no credits / forbidden: retrying cannot help
            if attempt < retries:
                time.sleep(3 * attempt)
    raise RuntimeError(f"generation failed after {retries} attempts: {last}")


def backdrop_artifact_score(raw_bytes, band=0.20, thr=6.0):
    """Percent of pixels in the car-free top band with a strong luminance gradient.

    A clean seamless backdrop scores about 0.1-0.3; a drawn ceiling, softbox or wall
    edge scores 0.8 and up (calibrated on the 2026-11-09 batch)."""
    import numpy as np
    a = np.asarray(Image.open(io.BytesIO(raw_bytes)).convert("L")).astype(float)
    h = a.shape[0]; top = a[: int(h * band), :]
    g = np.zeros_like(top); g[:-1, :] += np.abs(np.diff(top, axis=0)); g[:, :-1] += np.abs(np.diff(top, axis=1))
    return float((g > thr).mean() * 100)


def to_canvas(raw_bytes, size):
    """Centre-crop to 4:3 if needed and resize to the fixed canvas."""
    im = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    w, h = im.size
    target = size[0] / size[1]
    if abs(w / h - target) > 0.01:
        if w / h > target:  # too wide
            nw = int(h * target); x0 = (w - nw) // 2; im = im.crop((x0, 0, x0 + nw, h))
        else:               # too tall
            nh = int(w / target); y0 = (h - nh) // 2; im = im.crop((0, y0, w, y0 + nh))
    return im.resize(size, Image.LANCZOS)


def save_outputs(img, outdir, basename):
    png = os.path.join(outdir, f"{basename}.png")
    webps = []
    try:
        img.save(png, "PNG", optimize=True)
        for wdt in WEB_WIDTHS:
            r = img.copy(); r.thumbnail((wdt, wdt * 3 // 4), Image.LANCZOS)
            p = os.path.join(outdir, f"{basename}_{wdt}.webp"); r.save(p, "WEBP", quality=86, method=6); webps.append(p)
    except OSError as e:
        raise SystemExit(f"reshoot: could not write outputs for {basename} in {outdir}: {e}")
    return png, webps


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--jobs", required=True); ap.add_argument("--slug", required=True)
    ap.add_argument("--rawdir", required=True); ap.add_argument("--outdir", required=True)
    ap.add_argument("--angles", default="front34,side"); ap.add_argument("--resolution", default="2K", choices=list(CANVAS))
    ap.add_argument("--aspect", default="4:3"); ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--backdrop-ref", default=None, help="empty studio plate appended as the last reference image")
    ap.add_argument("--max-tries", type=int, default=3, help="regenerate an angle up to this many times until the backdrop is clean")
    ap.add_argument("--clean-threshold", type=float, default=0.5, help="max backdrop_artifact_score accepted as clean")
    args = ap.parse_args()

    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        log("OPENROUTER_API_KEY is not set"); sys.exit(1)
    try:
        with open(args.jobs, encoding="utf-8") as fh:
            jobs = {j["slug"]: j for j in json.load(fh)["jobs"]}
    except (OSError, ValueError, KeyError) as e:
        sys.exit(f"reshoot: could not read jobs file {args.jobs}: {e}")
    if args.slug not in jobs:
        log(f"unknown slug {args.slug}"); sys.exit(1)
    job = jobs[args.slug]
    angles = [a.strip() for a in args.angles.split(",") if a.strip()]
    for a in angles:
        if a not in ANGLE_PROMPTS:
            log(f"unknown angle {a}"); sys.exit(1)

    outdir = os.path.join(args.outdir, args.slug); os.makedirs(outdir, exist_ok=True)
    prep = [prepare_reference(os.path.join(args.rawdir, s), os.path.join(outdir, f"_ref{i}.jpg"))
            for i, s in enumerate(job["sources"])]
    refs = list(prep)
    # a targeted re-run of one angle chains off the other angle's raw output if it exists
    for other in ("front34", "side"):
        if other not in angles and os.path.isfile(os.path.join(outdir, f"_raw_{other}.png")):
            refs.append(os.path.join(outdir, f"_raw_{other}.png"))

    results, total_cost = [], 0.0
    backdrop = args.backdrop_ref if args.backdrop_ref and os.path.isfile(args.backdrop_ref) else None
    if args.backdrop_ref and not backdrop:
        sys.exit(f"reshoot: backdrop reference not found: {args.backdrop_ref}")
    for angle in angles:
        parts = [f"The car is a {job['car']}.", ANGLE_PROMPTS[angle], STYLE_RULES]
        if job.get("extra"): parts.append(job["extra"])
        if len(refs) > len(prep): parts.append(CONSISTENCY_CLAUSE)
        if backdrop: parts.append(BACKDROP_CLAUSE)
        prompt = "\n\n".join(parts)
        call_refs = refs + ([backdrop] if backdrop else [])
        log(f"{args.slug}: generating {angle} with {len(call_refs)} reference(s) on {args.model} @ {args.resolution}")
        t0 = time.time()
        best = None  # (score, raw, cost)
        for attempt in range(1, args.max_tries + 1):
            raw, cost = generate(api_key, args.model, prompt, call_refs, args.resolution, args.aspect)
            total_cost += float(cost or 0)
            score = backdrop_artifact_score(raw)
            log(f"{args.slug}: {angle} attempt {attempt} backdrop score {score:.2f} (clean <= {args.clean_threshold})")
            if best is None or score < best[0]:
                best = (score, raw, cost)
            if score <= args.clean_threshold:
                break
        score, raw, cost = best
        if score > args.clean_threshold:
            log(f"{args.slug}: WARNING {angle} still shows backdrop artifacts (score {score:.2f}) after {args.max_tries} tries; keeping the best")
        raw_path = os.path.join(outdir, f"_raw_{angle}.png")
        try:
            with open(raw_path, "wb") as f: f.write(raw)
        except OSError as e:
            sys.exit(f"reshoot: could not write {raw_path}: {e}")
        try:
            img = to_canvas(raw, CANVAS[args.resolution])
        except (OSError, ValueError) as e:
            sys.exit(f"reshoot: model returned an undecodable image for {args.slug} {angle}: {e}")
        png, webps = save_outputs(img, outdir, f"{args.slug}_{angle}")
        log(f"{args.slug}: saved {png} in {time.time()-t0:.0f}s (cost {cost})")
        results.append({"angle": angle, "png": png, "webp": webps, "cost": cost, "backdrop_score": round(score, 2),
                        "clean": score <= args.clean_threshold})
        refs.append(raw_path)

    manifest_path = os.path.join(outdir, "manifest.json")
    try:
        with open(manifest_path, "w") as f:
            json.dump({"slug": args.slug, "car": job["car"], "model": args.model, "resolution": args.resolution,
                       "sources": job["sources"], "results": results, "total_cost": total_cost}, f, indent=2)
    except OSError as e:
        sys.exit(f"reshoot: could not write {manifest_path}: {e}")
    log(f"{args.slug}: done, total cost {total_cost}")


if __name__ == "__main__":
    main()
