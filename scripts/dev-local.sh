#!/usr/bin/env bash
# Runs the API and web app against a throwaway Postgres in Docker, with seed
# data and an email/password account, so you can click through the app
# without touching a shared database, Stripe or real email.
#
#   pnpm dev:local           start (reuses the local DB and its data)
#   pnpm dev:local --reset   wipe the local DB and reseed
#
# Sign in at http://localhost:3000 as dev@coderscreen.test / localdev-password.
# Ctrl-C stops everything; the DB data is kept in a Docker volume.
#
# What it does differently from `pnpm dev`:
# - DATABASE + Hyperdrive point at the local container, never .dev.vars' DB
# - NODE_ENV=development, so emails are logged instead of sent
# - the plan and subscription are seeded, so nothing calls Stripe
# - the code-run sandbox container is off (running candidate code won't work)
set -euo pipefail
# Job control gives each background server its own process group, so shutdown
# can stop pnpm, wrangler and workerd together instead of orphaning them.
set -m

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT/apps/api"
WEB_DIR="$ROOT/apps/web"

PG_CONTAINER="coderscreen-local-pg"
PG_VOLUME="coderscreen-local-pg-data"
PG_PORT="${LOCAL_PG_PORT:-55433}"
DB_URL="postgres://postgres:localdev@localhost:${PG_PORT}/postgres"
API_PORT=8000
WEB_PORT=3000

DEV_EMAIL="dev@coderscreen.test"
DEV_PASSWORD="localdev-password"

LOCAL_CONFIG="$API_DIR/wrangler.local.jsonc"
ENV_DIR="$(mktemp -d)"
API_PID=""
WEB_PID=""

log() { printf '\033[1;34m[dev:local]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[dev:local]\033[0m %s\n' "$*" >&2; exit 1; }

cleanup() {
  trap - EXIT INT TERM
  log "Shutting down..."
  for pid in "$WEB_PID" "$API_PID"; do
    [[ -n "$pid" ]] && kill -TERM -- "-$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  rm -f "$LOCAL_CONFIG"
  rm -rf "$ENV_DIR"
  docker stop "$PG_CONTAINER" >/dev/null 2>&1 || true
  log "Stopped. Local DB data is kept; use --reset to start over."
}

port_in_use() { lsof -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

# --- preflight ---------------------------------------------------------------

RESET=false
for arg in "$@"; do
  case "$arg" in
    --reset) RESET=true ;;
    *) fail "Unknown option: $arg (supported: --reset)" ;;
  esac
done

docker info >/dev/null 2>&1 || fail "Docker isn't running. Start Docker Desktop and try again."
for port in "$API_PORT" "$WEB_PORT"; do
  port_in_use "$port" && fail "Port $port is already in use. Stop whatever is running there first."
done

trap cleanup EXIT INT TERM

# --- database ----------------------------------------------------------------

if $RESET; then
  log "Resetting the local database..."
  docker rm -f "$PG_CONTAINER" >/dev/null 2>&1 || true
  docker volume rm "$PG_VOLUME" >/dev/null 2>&1 || true
fi

if docker container inspect "$PG_CONTAINER" >/dev/null 2>&1; then
  docker start "$PG_CONTAINER" >/dev/null
else
  log "Starting Postgres on port $PG_PORT..."
  docker run -d --name "$PG_CONTAINER" -p "${PG_PORT}:5432" \
    -e POSTGRES_PASSWORD=localdev -v "${PG_VOLUME}:/var/lib/postgresql/data" \
    postgres:16 >/dev/null
fi

for _ in $(seq 1 30); do
  docker exec "$PG_CONTAINER" pg_isready -q -U postgres && break
  sleep 1
done
docker exec "$PG_CONTAINER" pg_isready -q -U postgres || fail "Postgres didn't start."

log "Syncing the schema..."
(cd "$ROOT/packages/db" && DATABASE_URL="$DB_URL" pnpm exec drizzle-kit push --force >/dev/null) \
  || fail "Schema push failed. Run it by hand to see why: cd packages/db && DATABASE_URL=$DB_URL pnpm exec drizzle-kit push"

# --- API ---------------------------------------------------------------------

# Same config as wrangler.jsonc, minus the sandbox container (a ~5 GB image).
node -e '
  const fs = require("fs");
  const [src, out] = process.argv.slice(1);
  const text = fs.readFileSync(src, "utf8");
  const patched = text.replace(/"dev":\s*\{/, "\"dev\": {\n\t\t\"enable_containers\": false,");
  if (patched === text) throw new Error("Could not find the dev block in wrangler.jsonc");
  fs.writeFileSync(out, patched);
' "$API_DIR/wrangler.jsonc" "$LOCAL_CONFIG"

# Placeholders so the API boots without a .dev.vars; .dev.vars wins if present.
cat >"$ENV_DIR/defaults.env" <<EOF
INFISCAL_BETTER_AUTH_SECRET=local-dev-only-better-auth-secret-not-for-prod
INFISCAL_STRIPE_PUBLISHABLE_KEY=pk_test_local
INFISCAL_STRIPE_SECRET_KEY=sk_test_local
INFISCAL_STRIPE_WEBHOOK_SECRET=whsec_local
INFISCAL_OPENROUTER_API_KEY=
INFISCAL_GOOGLE_CLIENT_ID=local
INFISCAL_GOOGLE_CLIENT_SECRET=local
INFISCAL_GITHUB_CLIENT_ID=local
INFISCAL_GITHUB_CLIENT_SECRET=local
EOF

# Always applied last, so these never point at shared services.
cat >"$ENV_DIR/overrides.env" <<EOF
NODE_ENV=development
FE_APP_URL=http://localhost:${WEB_PORT}
FREE_PLAN_ID=free
INFISCAL_DATABASE_URL=${DB_URL}
INFISCAL_BETTER_AUTH_URL=http://localhost:${API_PORT}/auth
INFISCAL_RESEND_API_KEY=re_local_disabled
USE_TUNNEL_FOR_PREVIEW=false
EOF

ENV_FILES=(--env-file "$ENV_DIR/defaults.env")
[[ -f "$API_DIR/.dev.vars" ]] && ENV_FILES+=(--env-file "$API_DIR/.dev.vars")
ENV_FILES+=(--env-file "$ENV_DIR/overrides.env")

log "Starting the API on http://localhost:${API_PORT}..."
(
  cd "$API_DIR"
  CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="$DB_URL" \
  INFISCAL_DATABASE_URL="$DB_URL" \
    exec pnpm exec wrangler dev -c "$LOCAL_CONFIG" --port "$API_PORT" "${ENV_FILES[@]}" 2>&1 \
    | sed -u 's/^/[api] /'
) &
API_PID=$!

for _ in $(seq 1 60); do
  curl -sf "http://localhost:${API_PORT}/health" >/dev/null 2>&1 && break
  kill -0 "$API_PID" 2>/dev/null || fail "The API exited during startup; see the [api] output above."
  sleep 1
done
curl -sf "http://localhost:${API_PORT}/health" >/dev/null || fail "The API didn't become healthy in 60s."

# --- seed --------------------------------------------------------------------

seeded="$(docker exec "$PG_CONTAINER" psql -U postgres -tAc "select count(*) from plans")"
if [[ "$seeded" == "0" ]]; then
  log "Creating $DEV_EMAIL and seeding demo data..."
  status="$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://localhost:${API_PORT}/auth/sign-up/email" \
    -H 'Content-Type: application/json' -H "Origin: http://localhost:${WEB_PORT}" \
    -d "{\"email\":\"${DEV_EMAIL}\",\"password\":\"${DEV_PASSWORD}\",\"name\":\"Local Dev\"}")"
  [[ "$status" == "200" ]] || fail "Sign-up for $DEV_EMAIL returned $status."
  docker exec -i "$PG_CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 -q <"$ROOT/scripts/local/seed.sql" \
    || fail "Seeding failed."
fi

# --- web ---------------------------------------------------------------------

log "Starting the web app on http://localhost:${WEB_PORT}..."
(
  cd "$WEB_DIR"
  VITE_APP_URL="http://localhost:${WEB_PORT}" VITE_API_URL="http://localhost:${API_PORT}" \
    exec pnpm exec vite --port "$WEB_PORT" --strictPort 2>&1 | sed -u 's/^/[web] /'
) &
WEB_PID=$!

cat <<EOF

  Local CoderScreen is starting
    App:        http://localhost:${WEB_PORT}
    Sign in:    ${DEV_EMAIL} / ${DEV_PASSWORD}
    Demo data:  Assessments > Backend Screen > Submissions
    Candidate:  http://localhost:${WEB_PORT}/take/asub_dee?token=tok_local_dee
    Run crons:  curl http://localhost:${API_PORT}/cdn-cgi/handler/scheduled
    Database:   ${DB_URL}

  Emails are printed in the [api] output instead of being sent.
  Ctrl-C to stop.

EOF

wait
