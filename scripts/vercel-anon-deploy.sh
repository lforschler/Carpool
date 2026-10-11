#!/usr/bin/env bash
# Anonymous Vercel deploy with runtime env injected into Build Output functions.
# Usage: scripts/vercel-anon-deploy.sh [https://your-temporary.vercel.app]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.local
set +a

: "${DATABASE_URL:?}"
: "${AUTH_SECRET:?}"

echo "Building + uploading anonymous deployment…"
DEPLOY_JSON="$(npx vercel deploy --temporary --yes --force --json)"
DEFAULT_URL="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["url"])' <<<"$DEPLOY_JSON")"
DEPLOY_URL="${1:-$DEFAULT_URL}"
CLAIM_URL="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("claimUrl") or "")' <<<"$DEPLOY_JSON" 2>/dev/null || true)"
if [[ -z "$CLAIM_URL" && -f .vercel/anonymous.json ]]; then
  CLAIM_URL="$(python3 -c 'import json; print(json.load(open(".vercel/anonymous.json")).get("claimUrl",""))')"
fi

export AUTH_URL="$DEPLOY_URL"
export NEXT_PUBLIC_APP_URL="$DEPLOY_URL"
export AUTH_TRUST_HOST=true

python3 - <<'PY'
import json, os, pathlib
env = {
  "DATABASE_URL": os.environ["DATABASE_URL"].strip().strip('"'),
  "AUTH_SECRET": os.environ["AUTH_SECRET"].strip().strip('"'),
  "NEXTAUTH_SECRET": os.environ["AUTH_SECRET"].strip().strip('"'),
  "AUTH_URL": os.environ["AUTH_URL"],
  "AUTH_TRUST_HOST": "true",
  "NEXT_PUBLIC_APP_URL": os.environ["NEXT_PUBLIC_APP_URL"],
}
root = pathlib.Path(".vercel/output/functions")
n = 0
for p in root.rglob(".vc-config.json"):
  data = json.loads(p.read_text())
  data["environment"] = {**(data.get("environment") or {}), **env}
  p.write_text(json.dumps(data))
  n += 1
print(f"Injected runtime env into {n} functions for {env['AUTH_URL']}")
PY

echo "Redeploying prebuilt with runtime env…"
npx vercel deploy --prebuilt --temporary --yes --force --json >/tmp/vercel-prebuilt.json
echo "Done."
echo "URL:   ${DEPLOY_URL}/login"
echo "Claim: ${CLAIM_URL:-see .vercel/anonymous.json}"
