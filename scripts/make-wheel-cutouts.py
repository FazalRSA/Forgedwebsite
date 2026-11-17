#!/usr/bin/env python3
"""Cut the wheel out of each studio photo so it can float on the dark design cards.

For every folder in public/images/wheels/ this reads hero.webp (the three-quarter view, shot on
white) and writes cutout.webp next to it: the same square framing, with a transparent background,
1000 x 1000 px. The home page's design cards use it (see cutoutSrcFor in
src/utils/designCards.ts), and src/utils/designCards.test.ts checks every photo has one.

Run it after adding or replacing wheel photos:

    python3 -m venv .venv-cutouts
    .venv-cutouts/bin/pip install "rembg[cpu]" pillow
    .venv-cutouts/bin/python scripts/make-wheel-cutouts.py            # only folders without a cut-out
    .venv-cutouts/bin/python scripts/make-wheel-cutouts.py --force    # redo all of them

Then look at every result on a dark background before committing: background that shows between
the spokes must be gone, and silver spokes must not be eaten away.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import onnxruntime as ort
from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
WHEELS = ROOT / "public" / "images" / "wheels"
SIZE = 1000
MODEL = "birefnet-general"


def cut_out(session, source: Path, target: Path) -> None:
    photo = Image.open(source).convert("RGB")
    cut = remove(photo, session=session)
    cut = cut.convert("RGBA").resize((SIZE, SIZE), Image.LANCZOS)
    # Write to a temporary file and rename it, so an interrupted run never leaves a half-written
    # cutout.webp that later runs would skip as already done.
    temporary = target.with_name(target.name + ".tmp")
    try:
        cut.save(temporary, "WEBP", quality=85, method=6)
        os.replace(temporary, target)
    finally:
        temporary.unlink(missing_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--force", action="store_true", help="redo folders that already have a cut-out")
    parser.add_argument("--model", default=MODEL, help=f"rembg model (default {MODEL})")
    args = parser.parse_args()

    if not WHEELS.is_dir():
        print(f"No wheel photo folder at {WHEELS}; nothing to do.", file=sys.stderr)
        return 1

    # Without this, onnxruntime keeps growing its memory pool from photo to photo and a
    # high-quality model can run out of memory on an ordinary machine after one or two images.
    options = ort.SessionOptions()
    options.enable_cpu_mem_arena = False
    options.enable_mem_pattern = False
    session = new_session(args.model, sess_opts=options)
    done = 0
    failed = 0
    for folder in sorted(p for p in WHEELS.iterdir() if p.is_dir()):
        source, target = folder / "hero.webp", folder / "cutout.webp"
        if not source.exists():
            continue
        if target.exists() and not args.force:
            continue
        try:
            cut_out(session, source, target)
        except Exception as error:  # unreadable photo, failed write, or the model failing on an odd image
            print(f"failed: {source.relative_to(ROOT)}: {error}", file=sys.stderr)
            failed += 1
            continue
        print(f"{target.relative_to(ROOT)}")
        done += 1
    print(f"{done} cut-out(s) written, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
