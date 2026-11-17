#!/usr/bin/env python3
"""Make the smaller copies of each wheel photo that phones and tablets download instead of the full one.

Every folder in public/images/wheels/ holds front.webp, hero.webp and profile.webp at 1600 x 1600
and cutout.webp (made by make-wheel-cutouts.py) at 1000 x 1000. Served as they are, a phone showing
a 350 px wide card downloads the whole 1600 px file. This script writes, next to each one:

    front.webp    -> front-800.webp,   front-400.webp     (likewise hero and profile)
    cutout.webp   -> cutout-600.webp                      (transparency kept)

The pages list them in the <img srcset> through wheelImageSrcSet() in src/utils/wheelImageSrcSet.ts,
so the browser picks the smallest one that fills the space; src/utils/wheelImageSrcSet.test.ts
checks every size exists for every photographed listing.

Run it after adding or replacing wheel photos or cut-outs. It needs only Pillow:

    python3 -m pip install pillow
    python3 scripts/make-wheel-sizes.py            # only sizes that are missing or older than their photo
    python3 scripts/make-wheel-sizes.py --force    # redo all of them
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
WHEELS = ROOT / "public" / "images" / "wheels"
QUALITY = 82
# Widths written for each photo, in pixels. The cut-out keeps its alpha channel.
SIZES = {"front": (800, 400), "hero": (800, 400), "profile": (800, 400), "cutout": (600,)}


def resize(source: Path, target: Path, width: int) -> None:
    photo = Image.open(source)
    photo = photo.convert("RGBA" if photo.mode in ("RGBA", "LA", "P") else "RGB")
    height = round(photo.height * width / photo.width)
    small = photo.resize((width, height), Image.LANCZOS)
    # Write to a temporary file and rename it, so an interrupted run never leaves a half-written
    # file that later runs would skip as already done.
    temporary = target.with_name(target.name + ".tmp")
    try:
        small.save(temporary, "WEBP", quality=QUALITY, method=6)
        os.replace(temporary, target)
    finally:
        temporary.unlink(missing_ok=True)


def up_to_date(source: Path, target: Path) -> bool:
    return target.exists() and target.stat().st_mtime >= source.stat().st_mtime


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--force", action="store_true", help="redo sizes that already exist")
    args = parser.parse_args()

    if not WHEELS.is_dir():
        print(f"No wheel photo folder at {WHEELS}; nothing to do.", file=sys.stderr)
        return 1

    done = 0
    failed = 0
    for folder in sorted(p for p in WHEELS.iterdir() if p.is_dir()):
        for name, widths in SIZES.items():
            source = folder / f"{name}.webp"
            if not source.exists():
                continue
            for width in widths:
                target = folder / f"{name}-{width}.webp"
                if up_to_date(source, target) and not args.force:
                    continue
                try:
                    resize(source, target, width)
                except Exception as error:  # unreadable photo or a failed write
                    print(f"failed: {source.relative_to(ROOT)} -> {target.name}: {error}", file=sys.stderr)
                    failed += 1
                    continue
                print(f"{target.relative_to(ROOT)} ({target.stat().st_size // 1024} KB)")
                done += 1
    print(f"{done} size(s) written, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
