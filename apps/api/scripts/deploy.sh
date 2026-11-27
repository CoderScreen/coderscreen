#!/usr/bin/env bash
# Deploy the API Worker tagged with the git SHA as its Sentry release, then
# upload the bundle's source maps to Sentry so stack traces show real code.
# Usage: scripts/deploy.sh [extra wrangler args, e.g. --env staging]
set -euo pipefail
cd "$(dirname "$0")/.."

RELEASE="${SENTRY_RELEASE:-$(git rev-parse --short HEAD)}"

wrangler deploy --outdir dist --upload-source-maps --var "SENTRY_RELEASE:${RELEASE}" "$@"

if [[ -z "${SENTRY_AUTH_TOKEN:-}" ]]; then
  echo "SENTRY_AUTH_TOKEN not set: skipped the Sentry source map upload for ${RELEASE}." >&2
  exit 0
fi

SENTRY_ORG="${SENTRY_ORG:-boreal-labs}"
SENTRY_PROJECT="${SENTRY_PROJECT:-coderscreen-api}"
sentry-cli releases new "$RELEASE" --org "$SENTRY_ORG" --project "$SENTRY_PROJECT"
sentry-cli sourcemaps upload --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" \
  --release "$RELEASE" --strip-prefix 'dist/..' dist
sentry-cli releases finalize "$RELEASE" --org "$SENTRY_ORG" --project "$SENTRY_PROJECT"
