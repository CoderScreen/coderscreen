# Production error tracking and Slack alerting

Status: draft for review, 2026-11-19
Owner: Kuba
Tooling decision: [docs/decisions/0001-alerting-on-sentry.md](../decisions/0001-alerting-on-sentry.md). Sentry handles errors and alerts. Cloudflare Workers Observability holds logs and traces for now. Grafana Cloud comes later.
Sentry org: `boreal-labs` (renamed from `sfx-engine`; same org).

## Goal

Two Slack channels, and nothing else pings anyone:

| Channel | Meaning | Target | Who reads it |
| --- | --- | --- | --- |
| `#coderscreen-alerts` (urgent) | A user is blocked, or we are losing money, right now | Fewer than 2 messages a week. Every message needs an action | Phone notifications on |
| `#coderscreen-errors` (triage) | Something new or degraded that should get a look today | A handful a day at most | Checked once a day |

The existing `#coderscreen` channel stops getting Sentry posts.

## What we have today (inventory, 2026-11-19)

### Error tracker (Sentry org `boreal-labs`, formerly `sfx-engine`, shared with SFX Engine and MediaOrca)

- **Projects:** `coderscreen-api` (Worker plus Durable Objects) and `coderscreen-web` (Vite SPA). The `sfxengine-*` projects belong to the other product. Staging and prod share one DSN and are split by `environment`.
- **Alert rules touching coderscreen:** one.
  - `Notify #coderscreen via Slack` (id 6268468) only watches `coderscreen-api`. It fires on *every event*, new, regressed, reappeared and resolved, throttled to once per 30 min per issue. During the Nov 17 burst it posted every 30 min for 2 hours.
  - `coderscreen-web` has **no alert at all**.
- **Uptime and cron monitors for coderscreen:** none. The 2 uptime monitors in the org are both SFX, so the 1 included uptime seat is already used.
- **Slack integration:** `Boreal Labs` workspace (integration id 551552), already connected.
- **SDK config:**
  - API: `withSentry` on `fetch` only. `tracesSampleRate: 0.1` and `sendDefaultPii: true`. No `release`, no `beforeSend`.
  - Web: `tracesSampleRate: 0.1` and `sendDefaultPii: true`. No `release`, no filters, no source maps.
  - Marketing and the sandbox container have no Sentry at all.

### Log and trace store

- **Cloudflare Workers Logs:** `observability.enabled: true` on api and web, with the default 100% head sampling and 7-day retention. Nothing alerts on it.
  - The `cf-obs` MCP is not authorized in this environment, so log volume below is estimated from invocation counts.
- **Axiom:** only SFX datasets (`sfxengine-api`, `sfxengine-api-logs`). No coderscreen data, no monitors, no notifiers.
- **Sentry traces:** 10% of API and web transactions, about 1.6k spans a day for the API.

### Slack

- Channels:
  - `#coderscreen` is the current Sentry target.
  - `#sfx-alerts` and `#sfx-errors` were created today for SFX.
- No coderscreen alert channels exist yet.

### Code

- **Hono `onError`** (`apps/api/src/index.ts:126`) is the only error handler. All sub-routers bubble up to it.
  - It reports any non-`HTTPException` error and returns 500 with `err.message`.
  - It never reports `HTTPException`, even a 500.
- **Durable Objects:**
  - `PartyServer`, `PrivateRoomServer` and `WhiteboardDurableObject` are wrapped with `instrumentDurableObjectWithSentry`.
  - `Sandbox` is deliberately left unwrapped, because wrapping it breaks the `getSandbox()` types.
  - `CoderScreenMcp` is unwrapped with no reason given.
- **Cron, Queues, Workflows:** none.
  - The only scheduled work is one DO alarm (Postgres export retry, every 5 min, at most 6 times).
  - The rest is `ctx.waitUntil` calls: AI chat, email dispatch, persist, export, sandbox start.
- **Webhooks:** Stripe only (`apps/api/src/routes/webhook.routes.ts`). Every failure returns 400 with `console.error` and no Sentry.
- **Health:** `GET /health` returns a static `ok` and checks nothing.

## Baselines (measured 2026-11-05 to 2026-11-18)

Sources:
- Cloudflare GraphQL analytics for `api.coderscreen.com`: the edge status codes, and Worker invocations for `coderscreen-api`.
- Sentry spans and errors.
- Prod Postgres, read-only session (`default_transaction_read_only=on`).

### Traffic and latency

| Metric | Value |
| --- | --- |
| Requests/day (edge, api.coderscreen.com) | median 2.4k, range 0.6k to 15.9k. The Nov 6 peak was almost all 401s |
| 5xx, 14 days | 1,174. Of these, 1,169 were on Nov 17 from one incident; every other day had 0 or 1 |
| 5xx rate excluding the Nov 17 incident | about 0.02% (5 out of about 33k) |
| Worker exceptions (CF `errors`) | 0 every day. Hono catches everything, so CF never sees an unhandled throw |
| p95 / p99, HTTP transactions (WebSocket messages excluded) | 1.19 s / 2.30 s |
| Slowest routes by p95 | `GET /auth/organization/list-invitations` 2.9 s, `get-full-organization` 2.5 s, `POST /mcp` 2.2 s, `GET /assessments` 1.8 s, private-room connect 1.4 to 3.7 s |
| WebSocket messages | 64% of API transactions sent to Sentry, with p95 53 ms. Useless for alerting and costly in span quota |

### 4xx to ignore

- **401s are about 55% of all API traffic.** The biggest single source was one private-room connect URL with 12k 401s in 14 days. That's a client retry loop, worth a ticket but not an alert.
- **Scanners:** `/.env`, `/.git/config`, `/wp-login.php`, `/actuator/env`, `/*/.env` and similar paths all return 401. Ignore.
- **`POST /webhook/stripe` returns 400 on 40 of 190 calls (21%).** The handler returns 400 for unsupported event types, bad signatures *and* real handler failures, so these can't be told apart today. Unsupported types should be 200, or Stripe keeps retrying them and eventually disables the endpoint. See Phase 1.

### Third-party errors by host

| Host | Errors in 14 days | Where it shows up |
| --- | --- | --- |
| openrouter.ai | **26 of 26 AI replies failed since about 2026-10-26 (100%)** with `401 User not found` (invalid or revoked key) | Only the `llm_messages.success=false` rows. **No Sentry event, no log alert.** The AI assistant has been down for about 3.5 weeks |
| api.stripe.com, resend.com, oauth2.googleapis.com | 0 errors in the sampled spans | Sentry `http.client` spans |
| Resend (failures are swallowed) | unknown | `console.error` only |

### Business-critical failure rates (prod DB, read-only)

| Flow | Last 14 to 30 days | Note |
| --- | --- | --- |
| Rooms created | 38 in 14 days (about 3/day) | 22 active, 16 completed |
| Signups | 32 in 14 days | |
| AI assistant | 100% failure since about Oct 26 | See OpenRouter above. **Fix the key first; this is an outage, not a monitoring task** |
| Assessment test runs | 10 of 17 results in 30 days are `crash` | 8 are a Node `ERR_INVALID_ARG_TYPE` and 2 are PHP `Could not parse function return value as JSON`. Both look like runner bugs, not candidate code. Not reported to Sentry |
| Assessment submissions | 21 submitted, 12 in progress, 19 expired | Expiry is lazy (set on next read), so there's no job to monitor |
| Subscriptions | 504 free, 3 paid active, 3 canceled | 16 subscriptions have no matching `customers` row, and 13 orgs from Jun to Jul 2025 have no subscription. Legacy data, not a live failure |

### Error tracker issues (unresolved, active in 14 days)

| Issue | Events / users | Real or noise | Action |
| --- | --- | --- | --- |
| CODERSCREEN-API-N `Active organization not found in session` | 1,001 (+157 dropped by spike protection) / 1 | Real, already fixed in #61 (now a 403) | Resolve |
| CODERSCREEN-API-H, -M `Failed query: select ... from rooms` | 1 each | Real, but the wrapper hides the Postgres cause | Report `err.cause` (Phase 1) |
| CODERSCREEN-API-6 LSP `ProcessExitedBeforeReadyError` | 1 | Real, low | Keep |
| CODERSCREEN-API-K `internal error; reference = ...` in `retryDurableObjectOperation` | 1 | Cloudflare platform transient | Ignore until it repeats 10 times |
| CODERSCREEN-API-J `npm install failed: EJSONPARSE` | 1 | Noise (the candidate's own package.json) | Don't report user-caused sandbox errors |
| CODERSCREEN-WEB-C, -X `WebSocket is not open` | 32 / 24 all time | Real but harmless: the LSP client writes after the socket closed | Guard the write; ignore until it's fixed |
| CODERSCREEN-WEB-V `LSLockTimeoutError` | 3 / 3 | Low-value noise | Ignore |
| CODERSCREEN-WEB-2 `Password too short`, `Invalid email or password` | 17 / 6 | Noise: an expected 4xx rethrown by `MutationCache.onError` and caught as an unhandled rejection | Filter (Phase 1) |
| CODERSCREEN-WEB-W `Invalid origin` | 1 | Noise: a better-auth 403 | Filter |
| CODERSCREEN-WEB-G `Failed to update user` | 1 | Unclear | Keep |

**Summary: 6 real, 6 noise.** Typical volume outside incidents is about 1 API error a week and 1 to 4 web errors a day.

### Volume and quotas

| Stream | Measured | Quota | Headroom |
| --- | --- | --- | --- |
| Sentry errors, whole org | 2,616 accepted in 14 days (about 5.6k/month). Coderscreen is about 1.2k of that, mostly the Nov 17 burst | 50k/month (Team) | Large |
| Sentry spans, whole org | about 1.24M in 14 days (about 2.65M/month). coderscreen-api is about 23k and web about 2k of that | 5M/month | About 2.3M |
| Sentry logs | 0 (not used) | 5 GB | n/a |
| CF Workers Logs (estimate, `cf-obs` not authorized) | About 3k invocations a day plus about 8k DO WebSocket events a day, at 1 to 3 log lines each: roughly 20k to 60k events a day, or 0.6M to 1.8M a month, about 1 to 2 GB | 20M events/month now; 50 GB/cycle from 2026-12-01 | Large |

## Missing signals (answers to "does X actually reach Sentry?")

- [x] **Unhandled route errors reach Sentry.** Verified by the Nov 17 burst: 1,169 edge 500s against 1,156 Sentry events (999 accepted plus 157 spike-protected).
  - **Gap:** `HTTPException` with status >= 500 is never reported. Example: `getBilling` throws `HTTPException(500, 'No active subscription found')`, which is exactly the #56 failure.
  - **Gap:** the 500 body echoes `err.message` to the client, so a raw SQL query can leak. Return a generic message plus the `cfRayId`.
- [ ] **Background work does not report.**
  - AI streaming errors are caught and turned into a chat message, with no Sentry. That's how the OpenRouter outage stayed invisible for about 24 days.
  - `waitUntil` promises (AI chat, email dispatch, persist, export) have no capture.
  - The DO alarm export retry swallows failures and gives up silently after 6 tries.
  - The `CoderScreenMcp` DO is not instrumented.
  - The whiteboard DO's inner Hono app has no `onError`.
- [ ] **These endpoints return 5xx or swallow errors without reporting:**
  - `whiteboard.router.ts`: upload, download and unfurl return 500; a missing binding returns 503.
  - The preview proxy returns 502 (`index.ts:221`).
  - The Stripe webhook returns 400 on handler failure.
  - Code-run sync and stream errors (`CodeRun.service.ts`).
  - Sandbox exceptions recorded as test `crash` (`AssessmentCodeRun.service.ts:210`).
  - Email send failures in `AssessmentSubmission.service.ts` and `lib/auth.ts:60`.
  - The `FileSyncService` and `PreviewService` catch blocks.
- [ ] **User id:**
  - **Set, but too much.** Both apps send `{id, email}` and `sendDefaultPii: true` adds the IP. Switch to the opaque better-auth `user.id` only, plus an `organizationId` tag.
  - **Not set** on candidate (`/assessments/:subId/take`), public-room and MCP requests. Tag `assessmentSubmissionId` / `roomId` instead.
- [ ] **Source maps are not uploaded.**
  - The web stack traces are minified (`index-Ba3Pwwx9.js:351:1497`).
  - There's no `release`, so "regressed in release" and suspect commits don't work.
  - `upload_source_maps: true` in wrangler only sends maps to Cloudflare, not Sentry.
- [ ] **Client noise:**
  - Expected 4xx rethrown from the React Query mutation cache.
  - better-auth origin and CSRF errors.
  - LSP `WebSocket is not open`.
  - Router errors are swallowed by TanStack's default boundary, so they are *missing*, not noisy: there's no `defaultErrorComponent` that reports.
  - Org-level inbound filters already drop hydration, crawler and extension errors (mostly SFX).
  - No translator errors seen yet, but add the filter anyway since it's cheap.
- [ ] **CI runs lint and build only.**
  - No test step.
  - The only API test (`apps/api/test/index.spec.ts`) is a stale template that expects `Hello World!`.

## Alerts

All Sentry rules are scoped to `environment:production`.

### Urgent: `#coderscreen-alerts`

| # | Alert | Condition | Threshold and why | Tool | First thing to check |
| --- | --- | --- | --- | --- | --- |
| U1 | API down | Uptime check on `https://api.coderscreen.com/health`, which now runs `SELECT 1` through Hyperdrive with a 2 s timeout | 60 s interval, 3 failures in a row (3 min), recover after 2 OKs. Baseline: there's never been a failing check because /health was static. 3 in a row rides out a single blip | Sentry uptime (+$1/mo) | Cloudflare Workers dashboard for `coderscreen-api`, then Railway Postgres status, then `railway logs --service Postgres` |
| U2 | One issue bursting | Any single `coderscreen-api` issue gets 10 or more events in 15 min | Baseline outside incidents: at most 1 event per issue per day. Nov 17 ran at about 125 per 15 min, so it would have fired within minutes. Notify at most once an hour per issue | Sentry issue alert | Issue page: user count and room id tags, then the last deploy (`release`), then whether it's one client looping |
| U4 | Stripe webhook handler failed | Any event tagged `webhook:stripe` at level error (handler threw, after Phase 1) | Any one event. With 3 paying customers every failure means wrong billing state, and the expected rate after the fix is 0 | Sentry issue alert | Stripe dashboard, then Webhooks, then the failed event, then replay it once fixed |
| U5 | 5xx backstop | Count of API transactions with `http.response.status_code:>=500` is 20 or more in 15 min | Baseline 0 to 1 a day. This catches 5xx that never throw (DO responses, proxy 502s) and so never become issues. Needs HTTP traces at 100% (Phase 1) | Sentry metric monitor (spans) | Group the spans by `transaction`, then open one trace |

Expected urgent volume at baseline: about 0 a week. The last 14 days would have produced 1 real page (Nov 17), plus 1 for the AI outage if we route U6 to urgent (we don't, see below).

### Triage: `#coderscreen-errors`

| # | Alert | Condition | Threshold and why | Tool | First thing to check |
| --- | --- | --- | --- | --- | --- |
| T1 | New or regressed backend issue | `coderscreen-api` issue first seen, or regressed | 1 event. Baseline is about 6 new API issues per 14 days, so about 3 a week | Sentry issue alert | Stack trace, `cfRayId` tag, then search Workers Logs for that ray id |
| T2 | Frontend error spreading | `coderscreen-web` issue seen by 3 or more unique users in 1 h | The busiest web issue (WEB-C) reached 24 users over 6 weeks, so it wouldn't fire. Alert once a day per issue at most | Sentry issue alert | Source-mapped frame (needs Phase 1), browser and release tags |
| T4 | Slow API | p95 of HTTP transactions (excluding `webSocket*` and `*/connect/*`) above 3 s over 1 h | Baseline p95 is 1.19 s and the slowest normal routes are 2.5 to 2.9 s, so 3 s means something regressed. Needs HTTP traces at 100% | Sentry metric monitor (spans) | Group p95 by `transaction`, then open the slowest trace and look at the DB spans |

U6 and T5 are not separate rules.
- AI failures and test-run sandbox crashes get reported in Phase 1 with `feature:ai` and `feature:code-run` tags. They then flow through T1 (new or regressed) and U2 (burst).
- AI is not urgent on its own: candidates can still interview without it.

### Retire

| Rule | Action | When |
| --- | --- | --- |
| `Notify #coderscreen via Slack` (6268468) | Disable, don't delete | Right after T1 and U2 are live and have posted a test |
| SFX rules (Discord, `#sfx-*`) | Leave alone | Not ours |

## Phases

### Phase 0: outages found while measuring (do now, outside this plan)

- [ ] Replace the OpenRouter key (`INFISCAL_OPENROUTER_API_KEY`). The AI assistant has failed 100% since about Oct 26.
- [ ] Look at the assessment runner `crash` results: the Node `ERR_INVALID_ARG_TYPE` from Nov 4 and the PHP JSON parse from Nov 9.
- [ ] Resolve CODERSCREEN-API-N in Sentry (fixed by #61).

### Phase 1: fix the signals (one PR)

API:
- [x] `onError`: also report `HTTPException` with status >= 500. Return a generic message with the `cfRayId` instead of `err.message`. Include `err.cause` (the Postgres error) as context.
- [x] Add `release` (git SHA) to both SDKs. Upload source maps to Sentry:
  - **Web:** `build.sourcemap: 'hidden'` plus `@sentry/vite-plugin`, gated on `SENTRY_AUTH_TOKEN`, and delete the `.map` files after upload.
  - **API:** `wrangler deploy --dry-run --outdir dist` plus `sentry-cli sourcemaps inject/upload`, inside the `cf-deploy` nx target.
- [x] Switch to a `tracesSampler`:
  - HTTP transactions at 1.0.
  - `webSocketMessage` and `webSocketClose` at 0.01.
  - Web stays at 0.1.
  - Estimated +0.5M spans/month. The org total stays near 3.1M against the 5M quota.
- [x] Background work:
  - Capture in `AI.service` catch blocks (tag `feature:ai`, provider status code).
  - Wrap `waitUntil` promises in a small `reportOnFailure(promise, tags)` helper.
  - Capture when the export retry gives up.
  - Add `onError` that captures on the whiteboard DO's Hono app.
  - Instrument `CoderScreenMcp`.
- [x] Report before swallowing, in each place listed under Missing signals: whiteboard 500s and 503, preview 502, code-run, sandbox `crash`, email sends, FileSync.
  - **Skip user-caused failures:** non-zero exits from candidate code, npm errors from the candidate's package.json.
- [x] Stripe webhook:
  - Unsupported event types return 200.
  - Handler failures capture (tag `webhook:stripe`) and return 500 so Stripe retries.
  - Bad signature stays 400 with a warning-level capture.
- [x] `/health`: `SELECT 1` through Hyperdrive with a 2 s timeout. Return 200 `ok` or 503, and don't put error details in the body.
- [x] ~~Canary crons~~ Dropped (Kuba, 2026-11-26): no separate checks that track env vars. The two silent outages now surface through normal requests:
  - Room DB credentials: room DOs are Sentry-instrumented, so an `onLoad` DB failure becomes an issue on the first room open and bursts into U2.
  - OpenRouter key: `AI.service` now reports every failed reply (tag `feature:ai`), so the first failure is a new issue (T1) and repeats hit U2.
- [x] User context:
  - `setUser({ id })` only, with `sendDefaultPii: false` in both apps.
  - Add an `organizationId` tag.
  - Candidate and public routes get `assessmentSubmissionId` and `roomId` tags.

Web:
- [x] Add a router `defaultErrorComponent` that calls `Sentry.captureException`.
- [x] ~~Stop `MutationCache.onError` rethrowing expected API 4xx.~~ Tested: the rethrow doesn't cause the unhandled rejections. They come from `mutateAsync` callers without a `catch`, so the `beforeSend` filter drops them instead.
- [x] Add a `beforeSend` filter in its own module, with unit tests. It drops:
  1. Events with no stack frame from our own bundle (`app.coderscreen.com/assets/`). This covers extensions and injected scripts.
  2. API errors carrying a 4xx status (401, 403, 404, 409, 422 and similar), plus better-auth `Invalid origin`, `Invalid email or password` and `Password too short`.
  3. Translator and DOM mutation errors: `Failed to execute 'removeChild'`, `'insertBefore' on 'Node'`, `NotFoundError: The object can not be found here`.
  4. `ResizeObserver loop` errors.
  5. `WebSocket is not open` until the LSP write guard ships.

Tests and CI:
- [x] Replace the stale API test. Add tests for the `onError` reporting rule, webhook status codes, `/health` and the `beforeSend` filter.
- [x] Add `pnpm nx run-many -t test` to `ci.yaml` (it currently runs only lint and build).
- [x] Integration tests for `/health` against a local scratch Postgres (`docker run postgres:16`), **never prod**.
- [x] Before opening the PR, run `pnpm lint`, `pnpm build` (which typechecks) and the tests, the same way CI does.

Left out of the Phase 1 PR, on purpose:
- `FileSyncService` and `PreviewService` catch blocks: they fire on every sandbox hiccup, and code-run failures already report.
- The whiteboard unfurl route: it fetches arbitrary user URLs, so failures are expected.
- The `CoderScreenMcp` DO: wrapping the agents SDK class risks breaking MCP. Its HTTP entry is still traced.
- The 401 retry loop and the LSP write guard go to Phase 4.

### Phase 2: error-tracker alerts (MCP, each change shown before applying)

- [x] Create the Slack channels `#coderscreen-alerts` (C0CMBBK7T0A) and `#coderscreen-errors` (C0CMBBKA5GA). Done 2026-11-26.
- [ ] U1: uptime monitor on `/health`, after Phase 1 is deployed so it checks the DB.
- [ ] T1: new or regressed API issue → triage.
- [ ] U2: issue burst, 10 or more in 15 min → urgent.
- [ ] T2: web issue reaching 3 or more users in 1 h → triage.
- [ ] U4: Stripe webhook error → urgent.
- [ ] Send a test notification for each one, then disable `Notify #coderscreen via Slack`.

### Phase 3: log and trace alerts

- [ ] U5: 5xx backstop metric monitor (spans).
- [ ] T4: p95 latency metric monitor (spans).
- [x] Turn on Workers traces (`observability.traces.enabled: true` in `apps/api/wrangler.jsonc`). Cloudflare Observability is the log and trace store until Grafana Cloud.
- [ ] Authorize the `cf-obs` MCP and measure the real Workers Logs volume to replace the estimate above.

### Phase 4: noise cleanup

- [ ] Resolve or ignore each issue as marked in the issue table.
- [ ] Ticket the 401 retry loop on private-room connect (12k a day at peak) and the LSP `WebSocket is not open` write guard.
- [ ] Mark the Sentry project's inbound filters for web-crawlers and legacy browsers on `coderscreen-web`. Some already exist at org level, so check them per project.

### Phase 5: tuning check-in (2026-12-03, 2 weeks after Phase 2)

- [ ] Count messages per channel. If the urgent channel had more than 2 a week, or any message with no action, raise that threshold or move the rule to triage.
- [ ] For each triage message: was it real? If a rule is under 50% real, tighten it.
- [ ] Re-check the span quota after the sampler change.
- [ ] Check for any user-reported incident that didn't produce an alert, and add the missing signal.

## Open questions for review

1. **Source map upload:** deploys run from a laptop (`pnpm deploy:api` / `deploy:web`). Is web also built by Cloudflare Workers Builds (the comment in `apps/web/wrangler.jsonc:24` suggests it)? If so, `SENTRY_AUTH_TOKEN` must go there too.
2. ~~Channel names~~ Decided: `#coderscreen-alerts` / `#coderscreen-errors`, the same pattern as `#sfx-*` and `#mediaorca-*`.
3. **Should AI failures be urgent?** I've put them in triage, since interviews still work without the assistant.
