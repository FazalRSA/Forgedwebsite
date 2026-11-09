#!/usr/bin/env bash
# Run reshoot_car.py for every job (or the slugs given as arguments), N at a time.
# Angles within one car stay sequential (the side shot references the front-3/4 shot);
# different cars are independent, so they run in parallel.
#   OPENROUTER_API_KEY=... tools/batch_reshoot.sh            # all jobs
#   OPENROUTER_API_KEY=... tools/batch_reshoot.sh slug1 slug2 # a subset
#   PAR=4 RES=2K MODEL=google/gemini-3-pro-image tools/batch_reshoot.sh
set -u
cd "$(dirname "$0")"
PAR="${PAR:-4}"; RES="${RES:-2K}"; MODEL="${MODEL:-google/gemini-3-pro-image}"; ANGLES="${ANGLES:-front34,side}"
mkdir -p out logs
if [ "$#" -gt 0 ]; then SLUGS="$*"; else SLUGS=$(python3 -I -c 'import json; print(" ".join(j["slug"] for j in json.load(open("jobs.json"))["jobs"]))'); fi
echo "$SLUGS" | tr ' ' '\n' | xargs -P "$PAR" -I{} sh -c '
  python3 -I ./reshoot_car.py --jobs jobs.json --slug {} --rawdir raw --outdir out --angles "'"$ANGLES"'" --resolution "'"$RES"'" --model "'"$MODEL"'" --backdrop-ref backdrop_ref.png > logs/{}.log 2>&1 \
    && echo "OK   {}" || echo "FAIL {} (see logs/{}.log)"'
echo "--- cost ---"
python3 -I -c '
import json,glob
t=0
for p in sorted(glob.glob("out/*/manifest.json")):
    m=json.load(open(p)); t+=m.get("total_cost") or 0
    print(f"{m[\"slug\"]:45s} {len(m[\"results\"])} images  ${(m.get(\"total_cost\") or 0):.3f}")
print(f"TOTAL ${t:.2f}")'
