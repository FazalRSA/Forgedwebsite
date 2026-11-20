#!/usr/bin/env python3
"""Rebuild every wheel model in one go, from the list in scripts/wheel-models.json.

    python3 scripts/build-wheel-models.py --src-dir ~/wheel-sources            # all designs
    python3 scripts/build-wheel-models.py --src-dir ~/wheel-sources --only FSA003 FF-3
    python3 scripts/build-wheel-models.py --dry-run                           # just show what would run

Each design runs on its own, one after another: the build needs a few GB of memory, so running them
side by side gets them killed. The decimated mesh of each source is cached (in --cache-dir) so a second run
with different options skips the slow first half. Source files are untrusted downloads: they are only read,
never run, and the build runs with `python3 -I`. Exit code 1 if any design fails.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUILDER = ROOT / ".claude" / "skills" / "add-wheel-model" / "scripts" / "build_wheel_model.py"
MANIFEST = Path(__file__).resolve().parent / "wheel-models.json"
OUT_DIR = ROOT / "public" / "models" / "wheels"


def load_manifest() -> list[dict]:
    try:
        data = json.loads(MANIFEST.read_text())
    except (OSError, json.JSONDecodeError) as err:
        sys.exit(f"ERROR: cannot read {MANIFEST}: {err}")
    models = data.get("models")
    if not isinstance(models, list) or not models:
        sys.exit(f"ERROR: {MANIFEST} has no 'models' list")
    for m in models:
        for key in ("design", "src", "out"):
            if not isinstance(m.get(key), str) or not m[key]:
                sys.exit(f"ERROR: a model entry in {MANIFEST} is missing '{key}': {m}")
        if "/" in m["src"] or "/" in m["out"] or not m["out"].endswith(".glb"):
            sys.exit(f"ERROR: {m['design']}: 'src' and 'out' are plain file names, and 'out' ends in .glb")
        if not all(isinstance(a, str) for a in m.get("args", [])):
            sys.exit(f"ERROR: {m['design']}: 'args' must be a list of strings")
    return models


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--src-dir", type=Path, help="folder with the downloaded source files")
    ap.add_argument("--cache-dir", type=Path, help="where decimated meshes are cached (default: <src-dir>/.cache)")
    ap.add_argument("--only", nargs="+", metavar="DESIGN", help="build only these designs, e.g. FSA003 FF-3")
    ap.add_argument("--dry-run", action="store_true", help="show the commands without running them")
    a = ap.parse_args()

    models = load_manifest()
    if a.only:
        wanted = {d.upper() for d in a.only}
        unknown = wanted - {m["design"].upper() for m in models}
        if unknown:
            print(f"ERROR: not in the list: {', '.join(sorted(unknown))}", file=sys.stderr)
            return 1
        models = [m for m in models if m["design"].upper() in wanted]
    if not a.dry_run and not a.src_dir:
        print("ERROR: --src-dir is required (or use --dry-run)", file=sys.stderr)
        return 1

    src_dir = (a.src_dir or Path("<src-dir>")).expanduser()
    cache_dir = (a.cache_dir or src_dir / ".cache").expanduser()
    failed: list[str] = []
    for m in models:
        src, out = src_dir / m["src"], OUT_DIR / m["out"]
        cmd = [sys.executable, "-I", str(BUILDER), str(src), str(out),
               "--cache", str(cache_dir / (Path(m["src"]).stem + ".npz")), *m.get("args", [])]
        print(f"\n== {m['design']}: {m['src']} -> {m['out']}")
        if a.dry_run:
            print("   " + " ".join(cmd))
            continue
        if not src.is_file():
            print(f"   ERROR: {src} not found", file=sys.stderr)
            failed.append(m["design"])
            continue
        cache_dir.mkdir(parents=True, exist_ok=True)
        if subprocess.run(cmd).returncode != 0:
            failed.append(m["design"])

    if failed:
        print(f"\nFAILED: {', '.join(failed)}", file=sys.stderr)
        return 1
    print("\nDone. Check them with: npm run qa-wheels   (then bump the -vN in catalogue.ts if a file changed)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
