# 0001: Sentry for errors and alerts, Cloudflare Observability for logs and traces, Grafana Cloud later

Date: 2026-11-19
Status: accepted (direction from Kuba, 2026-11-19)
Context: [docs/plans/2026-11-error-tracking-and-alerting.md](../plans/2026-11-error-tracking-and-alerting.md)

## Decision

- **Sentry** (org `boreal-labs`, projects `coderscreen-api` and `coderscreen-web`) owns errors and every Slack alert:
  - issue alerts
  - uptime
  - the span-based 5xx and latency monitors
- **Cloudflare Workers Observability** is the log and trace store for now. Turn on Workers traces, which are off today.
  - It's where we search raw logs by `cfRayId` while debugging.
  - It does not send alerts.
- **Grafana Cloud** is the long-term home for full observability. It isn't part of this plan; see "Moving to Grafana Cloud" below.
- We don't ship coderscreen logs to Axiom.

Slack follows the same pattern as SFX and MediaOrca: `#coderscreen-alerts` for urgent and `#coderscreen-errors` for triage.

## Measured volume (14 days, 2026-11-05 to 2026-11-18)

- **API traffic:** about 2.4k requests a day (median), about 3k Worker invocations a day, about 8k DO WebSocket events a day.
- **Sentry errors:** about 5.6k a month for the whole org.
- **Sentry spans:** about 2.65M a month for the whole org. After the planned sampler change (HTTP at 100%, WebSocket messages at 1%), coderscreen adds about 0.5M, for a total of about 3.1M.
- **Workers Logs:** estimated 0.6M to 1.8M events a month, about 1 to 2 GB.
  - This is not measured exactly yet, because the `cf-obs` MCP isn't authorized.
  - Workers traces add to this once enabled.

## Cost at our volume

| Piece | Monthly cost | Notes |
| --- | --- | --- |
| Sentry | About **$1.00** extra on the existing Team plan, for one more uptime monitor | Errors (5.6k of 50k) and spans (about 3.1M of 5M) stay in the included quota. Slack is already connected |
| Cloudflare Workers Logs and Traces | $0 | Until Nov 30 the allowance is 20M events a month; from Dec 1 it's 50 GB per cycle. We're at an estimated 1 to 2 GB |
| Axiom (not chosen) | $0 Personal / $25 Cloud | The Personal tier has no Slack notifier, and either tier needs log shipping. Skipped |

## Moving to Grafana Cloud

- When we move, send Workers logs and traces to Grafana Cloud through Cloudflare's OpenTelemetry export (Loki and Tempo).
- After that, decide whether the span-based monitors (5xx backstop, p95 latency) move to Grafana alerting.
- Sentry keeps error grouping either way.
- Nothing in the Phase 1 code changes depends on Cloudflare-specific logging. Keep log lines structured, with `cfRayId`, `roomId` and `organizationId`, so they carry over as-is.
