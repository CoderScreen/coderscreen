# Notifications, Activity & Dashboard - Implementation Plan

## Context

Assessments now complete **asynchronously** — a candidate submits whenever they finish, with no interviewer present. Today the only signal back to the org is a transactional email (`assessment_submission`) fired from `AssessmentSubmission.service.ts → submitAssessment() → notifyOrgOfSubmission()` via `ctx.executionCtx.waitUntil(...)`.

This is the trigger for the work, but **not** the goal. The goal is a **generic, reusable notification engine** that every future feature plugs into. The assessment submission is just the *first consumer*.

---

## ⭐ Core Design Principle: one generic notification primitive

Everything below exists to support a **single call**, used identically anywhere in the codebase:

```ts
await notifications.notify({
  type: 'assessment_submission_received',          // registered notification type
  organizationId: orgId,
  actor: { type: 'candidate' },                    // or { type:'user', userId } | { type:'system' }
  audience: { kind: 'org_members', excludeActor: true },
  channels: 'default',                             // or ['in_app'] | ['email'] | ['in_app','email']
  data: { candidateName, assessmentTitle, score, maxScore, submissionId, assessmentId },
});
```

That one function must make all of the following **trivial and declarative**, with no bespoke code per feature:

1. **Who receives it (audience).** Single user, everyone in the org, members of a role, or an explicit list — declared, not hand-rolled. The engine resolves it to concrete recipients.
2. **How it's delivered (channels).** In-app only, email only, or both — chosen per-call or defaulted per-type. New channels (Slack, webhook, push) slot in later without touching call sites.
3. **What it looks like (type registry).** Each notification type declares its own typed payload + how to render in-app (icon/title/body/link) and as email (subject/html). Adding a new notification = **add one registry entry + call `notify()`**. Nothing else.
4. **Read state, archive, unread count — for free.** Generic across every type. Users mark read/all-read/archive; the unread badge works for any notification ever added.

These four axes are the important part of this plan. Assessments, billing alerts, team invites, interview reminders, system announcements — all become a registry entry + a `notify()` call.

### The three pluggable pieces

**A. Audience** — a declarative target resolved to recipients (`{ userId, email, role }[]`):

```ts
type Audience =
  | { kind: 'user'; userId: string }                         // one person
  | { kind: 'users'; userIds: string[] }                     // explicit list
  | { kind: 'org_members'; excludeActor?: boolean }          // everyone in the org
  | { kind: 'org_role'; role: 'owner' | 'admin' | 'member'; excludeActor?: boolean };
```

A single `AudienceResolver` (built on the better-auth `member` + `user` tables — same join already used in `notifyOrgOfSubmission`) turns any `Audience` into the recipient list, including each recipient's email for the email channel. New audience kinds are added in one place.

**B. Channels** — pluggable delivery strategies behind a common interface:

```ts
type Channel = 'in_app' | 'email'; // future: 'slack' | 'webhook' | 'push'

interface ChannelDispatcher {
  deliver(event: NotificationEvent, recipients: Recipient[]): Promise<void>;
}
```

- `in_app` → bulk-inserts per-recipient `notification` rows (this is what the bell + read state read from).
- `email` → for each recipient, renders the type's email template and sends via the existing `ResendService`.

Channels chosen at the call site override the type's defaults; otherwise the registry default applies.

**C. Type registry** — the single source of truth for every notification type:

```ts
// apps/api/src/notifications/registry.ts
export const NOTIFICATION_TYPES = {
  assessment_submission_received: {
    defaultChannels: ['in_app', 'email'],
    schema: z.object({ candidateName: z.string(), assessmentTitle: z.string(), /* ... */ }),
    renderInApp: (data) => ({
      icon: 'RiFileList3Line',
      title: `${data.candidateName} submitted ${data.assessmentTitle}`,
      body: data.score != null ? `Scored ${data.score}/${data.maxScore}` : 'Awaiting grading',
      link: `/assessments/${data.assessmentId}/submissions`,
    }),
    renderEmail: (data) => buildAssessmentSubmissionEmail(/* maps data → existing builder */),
  },
  // add the next notification type here — that's the whole integration
} satisfies Record<string, NotificationTypeDef>;
```

> The existing `assessment_submission` email builder becomes this type's `renderEmail`, unifying email + in-app under one definition. The `renderInApp` output is reused verbatim by both the notification bell and the dashboard activity feed (one renderer, two surfaces).

---

## Data Model

Two tables so the payload lives in **one** place (the event) while **read state is per-user** (the recipient row). The org activity feed reads events; a user's inbox reads their recipient rows.

### `notification_event` — `packages/db/src/notificationEvent.db.ts`

The thing that happened. One row per `notify()` call.

| column | type | notes |
| --- | --- | --- |
| `id` | text PK | `Id<'notificationEvent'>`, prefix `nev` |
| `createdAt` | timestamp | `sql\`now()\`` |
| `organizationId` | text FK → organization | cascade |
| `type` | text `$type<NotificationType>` | key into the registry |
| `actorType` | text `$type<'user'\|'candidate'\|'system'>` | default `'system'` |
| `actorUserId` | text, nullable | FK → user, `onDelete: set null` |
| `data` | jsonb `$type<NotificationData>` | typed per-type payload (validated by registry schema) |
| `entityType` | text, nullable | generic deep-link ref, e.g. `'assessment_submission'` |
| `entityId` | text, nullable | plain text (no FK → log survives entity deletion) |

Indexes: `(organizationId, createdAt desc)`, `(organizationId, type)`.

### `notification` — `packages/db/src/notification.db.ts`

Per-recipient delivery + read state.

| column | type | notes |
| --- | --- | --- |
| `id` | text PK | `Id<'notification'>`, prefix `notif` |
| `createdAt` | timestamp | `sql\`now()\`` |
| `organizationId` | text FK → organization | cascade |
| `eventId` | text FK → notification_event | cascade |
| `recipientUserId` | text FK → user | cascade |
| `channels` | jsonb `$type<Channel[]>` | channels targeted for this recipient |
| `emailSentAt` | timestamp, nullable | email delivery audit |
| `readAt` | timestamp, nullable | null = unread |
| `archivedAt` | timestamp, nullable | null = visible |

Indexes: `(recipientUserId, readAt)` (unread count), `(recipientUserId, createdAt desc)` (inbox list).

> **In-app inbox** = `notification` rows where `recipientUserId = me` AND `channels` contains `'in_app'` AND `archivedAt IS NULL`.
> **Unread count** = those with `readAt IS NULL`.
> Email-only notifications still create a row (for the audit trail) but are excluded from the inbox because `channels` omits `'in_app'`.

**Rejected alternatives:** (1) a single org-scoped `isRead` flag — wrong for multi-member orgs. (2) per-recipient duplication of `data` — wasteful and drifts; the event table keeps payload canonical. (3) a watermark `lastSeenAt` per member — can't mark/dismiss individual items.

---

## Phase 1: Schema & Migration

- [ ] Add 2 entity prefixes to `packages/common/src/id.ts`: `notificationEvent: 'nev'`, `notification: 'notif'`
- [ ] Create `packages/db/src/notificationEvent.db.ts` — table + `NotificationType`, `NotificationData`, `NotificationEventEntity`
- [ ] Create `packages/db/src/notification.db.ts` — table + `Channel`, `NotificationEntity`
- [ ] Add both exports to `packages/db/package.json` `exports` map + barrel
- [ ] `pnpm --filter @coderscreen/db db:generate` then `db:migrate`

**How to test:** Migration succeeds; tables + indexes + FKs exist; `pnpm build` passes.

---

## Phase 2: The generic notification engine (⭐ the important piece)

Build this as a self-contained, feature-agnostic module under `apps/api/src/notifications/`. Nothing here should mention "assessment" — that comes in Phase 3 as the first consumer.

- [ ] `apps/api/src/notifications/types.ts` — `Audience`, `Channel`, `Recipient`, `NotificationTypeDef`, `NotifyInput<T>` (generic over registered type so `data` is type-checked against the registry schema)
- [ ] `apps/api/src/notifications/registry.ts` — the `NOTIFICATION_TYPES` map (starts with one entry in Phase 3); export `NotificationType` union derived from its keys
- [ ] `apps/api/src/notifications/AudienceResolver.ts` — `resolve(orgId, audience, actorUserId?) → Recipient[]`; handles all `Audience` kinds + `excludeActor`
- [ ] `apps/api/src/notifications/channels/InAppChannel.ts` — bulk-insert `notification` rows
- [ ] `apps/api/src/notifications/channels/EmailChannel.ts` — render via registry + send through `ResendService`; stamp `emailSentAt`
- [ ] `apps/api/src/services/Notification.service.ts` — the public API:
  - `notify(input)` — insert event → resolve audience → for each channel (override ?? type default) dispatch; safe to call inside `ctx.executionCtx.waitUntil(...)`
  - `listForCurrentUser({ limit, cursor, unreadOnly })`, `unreadCount()`
  - `markRead(ids)`, `markAllRead()`, `archive(id)` — all scoped to `recipientUserId = getSession(ctx).user.id`
  - `listEvents({ limit, cursor, type? })` — org-scoped activity feed for the dashboard
- [ ] (Optional) register `notificationService` in `apps/api/src/services/AppFactory.ts`

**How to test:** A throwaway script / unit test calls `notify()` with each `Audience` kind and channel combo (`['in_app']`, `['email']`, both) and asserts: 1 event row, correct recipient rows, email-only produces a row excluded from the inbox query, `excludeActor` drops the actor. Read/unread/archive mutate state correctly.

---

## Phase 3: First consumer — assessment submission

Prove the engine by routing the existing flow through it. **No assessment-specific notification code** — only a registry entry + a `notify()` call.

- [ ] Add `assessment_submission_received` to `NOTIFICATION_TYPES` (Phase 2 registry), with `renderEmail` delegating to the existing `buildAssessmentSubmissionEmail`
- [ ] In `AssessmentSubmission.service.ts`, replace `notifyOrgOfSubmission()` internals with a single `notificationService.notify({ type: 'assessment_submission_received', audience: { kind: 'org_members', excludeActor: true }, channels: 'default', data: {...} })`
- [ ] Delete the now-duplicated bespoke email-fanout loop (the `recipients.map(... sendTransactionalEmail ...)` block)

**How to test:** Submitting an assessment via the candidate `/take/submit` route creates 1 event + N in-app notifications + N emails (unchanged behavior), now entirely through the generic path. Verify in `db:studio`.

---

## Phase 4: API routes

- [ ] `apps/api/src/schema/notification.zod.ts` — `NotificationEventSchema`, `NotificationSchema`, list/query params, mark-read body
- [ ] `apps/api/src/routes/notification.routes.ts`
  - `GET /notifications` — current user's inbox (paginated, `unreadOnly`)
  - `GET /notifications/unread-count`
  - `POST /notifications/read` — `{ ids: string[] }`
  - `POST /notifications/read-all`
  - `POST /notifications/:id/archive`
  - `GET /notifications/events` — org activity feed (for the dashboard)
- [ ] Register `/notifications` in `apps/api/src/index.ts` (auth-protected → **not** in the `except([...])` list)
- [ ] Rebuild api types so the web hono client sees the routes (`pnpm --filter @coderscreen/api build`)

**How to test:** `GET /notifications/unread-count` reflects the fan-out for the logged-in member; `POST /notifications/read-all` zeroes it.

---

## Phase 5: Web query hooks

- [ ] `apps/web/src/query/notification.query.ts`
  - `useNotifications({ unreadOnly })`, `useUnreadCount()` (with `refetchInterval: 30_000` — polling groundwork), `useMarkNotificationsRead()`, `useMarkAllRead()`, `useArchiveNotification()` (mutations invalidate `['notifications']` + `['notifications','unread-count']`)
  - `useActivityFeed({ limit })` (events) for the dashboard
- [ ] Mirror existing conventions (`apiClient.notifications.$...`, `meta.ERROR_MESSAGE`, destructure-and-extend return)
- [ ] Shared client-side renderer `apps/web/src/lib/notificationRender.tsx` — maps `type` + `data` → `{ icon, title, body, link }`, mirroring the server registry's `renderInApp`. Reused by the bell **and** the dashboard feed.

**How to test:** Hooks return data; unread count repolls.

---

## Phase 6: Notification bell UI

- [ ] `apps/web/src/components/common/NotificationBell.tsx` — bell + unread badge (`useUnreadCount()`), popover list (icon/title/relative-time/deep-link), "mark all as read", click marks read + navigates
- [ ] Place in desktop `Sidebar` (`SidebarBody`, near `OrgSwitcher`) and `MobileSidebar` header
- [ ] Uses the shared `notificationRender` helper (Phase 5)

**How to test:** Badge count is correct; reading clears it; deep-link navigates.

---

## Phase 7: Main dashboard page

Replace the thin `DashboardView` (today: `DashboardHeader` + `RoomListView`) with an at-a-glance overview.

- [ ] `apps/api/src/routes/dashboard.routes.ts` + `Dashboard.service.ts` → `GET /dashboard/summary` (org-scoped counts: active assessments, submissions awaiting review = `submitted` not yet `graded`, candidates, recent interviews)
- [ ] `apps/web/src/query/dashboard.query.ts` → `useDashboardSummary()`
- [ ] Rework `apps/web/src/components/dashboard/DashboardView.tsx`: stat cards row, **recent activity feed** (`useActivityFeed()` + shared renderer), quick actions (new interview / new assessment / invite candidate), compact recent interviews; empty states for fresh orgs

**How to test:** Dashboard at `/` shows live counts + the submission activity from Phase 3; numbers match `db:studio`.

---

## Phase 8 (future, builds on the generic engine)

- **Per-user / per-type preferences** — a `notification_preference` table keyed by `(userId, type, channel)`; the engine consults it when resolving channels (call-site `channels: 'default'` then becomes "default minus user opt-outs"). The engine is designed so this slots into one place (channel selection in `notify()`).
- **Realtime push** — a `push` channel over the existing PartyKit/Durable Object infra, replacing the bell's polling.
- **New channels** — `slack`, `webhook` dispatchers (implement `ChannelDispatcher`, register, done).
- **Digest/batching** — coalesce low-priority types into a periodic email.
- **More types** — team invite accepted, billing/usage alerts, interview reminders, system announcements: each is one registry entry + a `notify()` call.

---

## Touch-point summary

| Layer | New files | Edited files |
| --- | --- | --- |
| ids | — | `packages/common/src/id.ts` |
| db | `notificationEvent.db.ts`, `notification.db.ts` | `packages/db/package.json` (+ barrel) |
| **engine** | `notifications/{types,registry,AudienceResolver}.ts`, `notifications/channels/{InAppChannel,EmailChannel}.ts`, `services/Notification.service.ts` | `services/AppFactory.ts` (optional) |
| first consumer | — | `AssessmentSubmission.service.ts` (route through `notify()`) |
| api routes | `routes/notification.routes.ts`, `routes/dashboard.routes.ts`, `services/Dashboard.service.ts`, `schema/notification.zod.ts` | `index.ts` |
| web queries | `query/notification.query.ts`, `query/dashboard.query.ts`, `lib/notificationRender.tsx` | — |
| web ui | `components/common/NotificationBell.tsx` | `Sidebar.tsx`, `dashboard/DashboardView.tsx` |
