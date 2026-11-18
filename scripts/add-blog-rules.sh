#!/usr/bin/env bash
# Adds the blog's rewrite rules to a Render static site whose routes are set in the dashboard
# (and so ignore render.yaml). The rules are read from the generated block in render.yaml, so they
# always match the pages the build makes. See README -> Deployment -> Two Render services.
#
#   export RENDER_API_KEY=...        (Render dashboard -> Account Settings -> API Keys)
#   bash scripts/add-blog-rules.sh              preview only: changes nothing
#   DRY_RUN=0 bash scripts/add-blog-rules.sh    apply
#
# SERVICE defaults to the "Forged Wheels" service; override it with SERVICE=srv-... if the domain moves.
# Rules that already exist are skipped, so it is safe to run twice. Your existing rules are saved first.
set -u
: "${RENDER_API_KEY:?Set RENDER_API_KEY first: export RENDER_API_KEY=...}"
SERVICE="${SERVICE:-srv-dbphe7on74is73dvmi2g}"
API="https://api.render.com/v1/services/$SERVICE/routes"
DRY_RUN="${DRY_RUN:-1}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP="${TMPDIR:-/tmp}/render-routes-backup.json"

# "source|destination" for every blog page, from the block the build writes into render.yaml.
RULES="$(awk '/source: \/blog/ {s=$2} /destination: \/blog/ && s {print s "|" $2; s=""}' "$ROOT/render.yaml")"
if [ -z "$RULES" ]; then
  echo "No /blog rules found in render.yaml. Run 'npm run build' first, then try again."
  exit 1
fi

echo "== Current rules (saved to $BACKUP)"
status=$(curl -sS -H "Authorization: Bearer $RENDER_API_KEY" -H "Accept: application/json" \
  "$API" -o "$BACKUP" -w "%{http_code}")
echo "HTTP $status"
if [ "$status" != "200" ]; then
  echo "Could not read the current rules (check the key and service ID). Stopping."
  exit 1
fi
head -c 1500 "$BACKUP"; echo; echo

i=0
while IFS='|' read -r src dest; do
  [ -z "$src" ] && continue
  if grep -q "\"$src\"" "$BACKUP"; then
    echo "skip (already exists): $src"
  elif [ "$DRY_RUN" = "1" ]; then
    echo "would add: $src -> $dest (priority $i)"
  else
    code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -H "Content-Type: application/json" -H "Accept: application/json" \
      -d "{\"type\":\"rewrite\",\"source\":\"$src\",\"destination\":\"$dest\",\"priority\":$i}" \
      "$API")
    echo "$code  $src"
  fi
  i=$((i+1))
done <<< "$RULES"

if [ "$DRY_RUN" = "1" ]; then
  echo
  echo "Preview only. To apply: DRY_RUN=0 bash scripts/add-blog-rules.sh"
else
  echo
  echo "Now open the service in the Render dashboard (Redirects/Rewrites) and check the blog rules sit above the /* catch-all."
fi
