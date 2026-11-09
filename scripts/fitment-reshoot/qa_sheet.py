#!/usr/bin/env python3
"""Build review sheets: one row per car = [phone photo | front 3/4 render | side render]."""
import glob, json, math, os, sys
from PIL import Image, ImageOps, ImageDraw, ImageFont

outdir = sys.argv[1] if len(sys.argv) > 1 else "out"
rows_per_sheet = int(sys.argv[2]) if len(sys.argv) > 2 else 6
only = sys.argv[3].split(",") if len(sys.argv) > 3 else None
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
TH = 480  # tile height
items = []
for mp in sorted(glob.glob(os.path.join(outdir, "*", "manifest.json"))):
    m = json.load(open(mp)); slug = m["slug"]
    if only and slug not in only: continue
    d = os.path.dirname(mp)
    ref = os.path.join(d, "_ref0.jpg")
    f34 = os.path.join(d, f"{slug}_front34.png"); side = os.path.join(d, f"{slug}_side.png")
    items.append((slug, m["car"], ref, f34, side))

def fit_image_to_tile(path, w, h):
    canvas = Image.new("RGB", (w, h), "#303030")
    if path and os.path.exists(path):
        im = ImageOps.exif_transpose(Image.open(path)).convert("RGB"); im.thumbnail((w, h))
        canvas.paste(im, ((w - im.width) // 2, (h - im.height) // 2))
    else:
        ImageDraw.Draw(canvas).text((20, h // 2), "missing", fill="red", font=font)
    return canvas

W_REF, W_R = 360, 640; pad = 10; label_h = 34
for s in range(math.ceil(len(items) / rows_per_sheet)):
    chunk = items[s * rows_per_sheet:(s + 1) * rows_per_sheet]
    sheet = Image.new("RGB", (pad * 4 + W_REF + 2 * W_R, len(chunk) * (TH + label_h + pad) + pad), "#181818")
    d = ImageDraw.Draw(sheet)
    for i, (slug, car, ref, f34, side) in enumerate(chunk):
        y = pad + i * (TH + label_h + pad)
        d.text((pad, y), f"{slug}  |  {car[:90]}", fill="white", font=font)
        y += label_h
        sheet.paste(fit_image_to_tile(ref, W_REF, TH), (pad, y))
        sheet.paste(fit_image_to_tile(f34, W_R, TH), (pad * 2 + W_REF, y))
        sheet.paste(fit_image_to_tile(side, W_R, TH), (pad * 3 + W_REF + W_R, y))
    p = os.path.join(outdir, f"_qa_sheet_{s + 1}.jpg"); sheet.save(p, "JPEG", quality=85); print(p, sheet.size)
