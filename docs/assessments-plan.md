# Assessments Mode - Implementation Plan

## Key Decisions

- Candidate-only (async, no live interviewer)
- Test cases: some visible to candidate, some hidden (revealed after submission)
- Building mode: same code editor carries over between questions
- Independent mode: shared sandbox, candidate switches between questions freely
- Languages: candidate picks from org-defined allowed list; tests use stdin/stdout
- Time limits: both overall and per-question
- Candidates: per-organization, unique on (org, email)

## Building vs Independent Mode

**Sequential:** Questions locked in order. Single code editor, code carries forward Q1 -> Q2. `questionSubmission.code` = cumulative state. Test cases for Q2 run against accumulated code.

**Independent:** All questions accessible, candidate switches freely. Each question has own code state. Sandbox shared, code written to `/workspace/q_{position}/main.{ext}`.

---

## Phase 1: Schema & Migration

- [x] Add 7 entity prefixes to `packages/common/src/id.ts` (candidate, assessment, assessmentQuestion, assessmentTestCase, assessmentSubmission, questionSubmission, testCaseResult)
- [x] Create `packages/db/src/candidate.db.ts` — per-org candidate pool, unique index on (org, email)
- [x] Create `packages/db/src/assessment.db.ts` — title, description, mode, status, allowedLanguages, timeLimitSeconds
- [x] Create `packages/db/src/assessmentQuestion.db.ts` — title, description (jsonb), position, timeLimitSeconds, starterCode
- [x] Create `packages/db/src/assessmentTestCase.db.ts` — input, expectedOutput, isHidden, label, position
- [x] Create `packages/db/src/assessmentSubmission.db.ts` — candidateId FK, status, selectedLanguage, timing fields, accessToken
- [x] Create `packages/db/src/questionSubmission.db.ts` — code, timeSpentSeconds per (submission, question)
- [x] Create `packages/db/src/testCaseResult.db.ts` — passed, actualOutput, stderr, exitCode, executionTimeMs
- [x] Add 7 exports to `packages/db/package.json`
- [ ] Generate and run migration

**How to test:** Migration succeeds. Tables exist with correct columns/FKs. `pnpm build` passes.

---

## Phase 2: Assessment CRUD (org-side)

- [x] Create `apps/api/src/schema/assessment.zod.ts` — Assessment, Question, TestCase schemas + create/update variants
- [x] Create `apps/api/src/services/Assessment.service.ts` — CRUD for assessments, questions, test cases + publish/archive
- [x] Create `apps/api/src/routes/assessment.routes.ts` — all CRUD routes
- [x] Add `assessmentService` to `apps/api/src/services/AppFactory.ts`
- [x] Register `/assessments` route in `apps/api/src/index.ts`

**Routes implemented:**
- [x] `GET /assessments` — list all for org
- [x] `POST /assessments` — create
- [x] `GET /assessments/:id` — get with nested questions & test cases
- [x] `PATCH /assessments/:id` — update
- [x] `DELETE /assessments/:id` — delete
- [x] `POST /assessments/:id/publish` — validate has questions with test cases, set active
- [x] `POST /assessments/:id/archive` — archive
- [x] `POST /assessments/:id/questions` — add question
- [x] `PATCH /assessments/:id/questions/:questionId` — update question
- [x] `DELETE /assessments/:id/questions/:questionId` — delete question
- [x] `POST /assessments/:id/questions/reorder` — reorder questions
- [x] `POST /assessments/:id/questions/:qId/test-cases` — add test case
- [x] `PATCH /assessments/:id/questions/:qId/test-cases/:tcId` — update test case
- [x] `DELETE /assessments/:id/questions/:qId/test-cases/:tcId` — delete test case

**How to test:** `pnpm build` passes. Curl each endpoint against a running dev server.

---

## Phase 3: Candidates & Submissions (org-side)

- [x] Add Candidate + Submission Zod schemas to `assessment.zod.ts`
- [x] Create `apps/api/src/services/AssessmentSubmission.service.ts`
  - [x] `createCandidate` — upsert on org+email
  - [x] `getCandidate` — with submission history
  - [x] `listCandidates`
  - [x] `inviteCandidate` — resolve/create candidate, validate assessment is active, create submission + questionSubmission rows, generate accessToken
  - [x] `listSubmissions` — joined with candidate info
  - [x] `getSubmissionDetails` — with questionSubmissions and testCaseResults
  - [x] `gradeSubmission` — set status=graded, update notes
- [x] Add candidate + submission routes to `assessment.routes.ts`
  - [x] `GET /candidates` — list
  - [x] `POST /candidates` — create (upsert)
  - [x] `GET /candidates/:id` — with submission history
  - [x] `GET /assessments/:id/submissions` — list with candidate
  - [x] `POST /assessments/:id/submissions` — invite candidate
  - [x] `GET /assessments/:id/submissions/:subId` — full details
  - [x] `POST /assessments/:id/submissions/:subId/grade` — grade
- [x] Add `assessmentSubmissionService` to `AppFactory.ts`
- [x] Register `/candidates` route in `index.ts`

**How to test:** `pnpm build` passes. Create candidate, invite to assessment, verify DB rows (submission + questionSubmission per question, accessToken generated). List/get submissions with candidate info.

---

## Phase 4: Candidate-Facing API (take assessment)

- [ ] Create `apps/api/src/routes/assessment/candidateAssessment.routes.ts`
  - [ ] `GET /assessments/:subId/take?token=xxx` — load assessment (only visible test cases)
  - [ ] `POST /assessments/:subId/take/start` — set selectedLanguage, startedAt, expiresAt
  - [ ] `POST /assessments/:subId/take/save` — auto-save code for a question
- [ ] Add auth exception for `/assessments/:subId/take/*` in `index.ts`
- [ ] Add candidate-facing Zod schemas (start, save) to `assessment.zod.ts`
- [ ] Add methods to `AssessmentSubmission.service.ts`
  - [ ] `getSubmissionByToken` — validate token, return submission
  - [ ] `startAssessment` — set startedAt, selectedLanguage, compute expiresAt
  - [ ] `saveCode` — upsert code into questionSubmission
  - [ ] `checkExpiration` — auto-transition expired submissions

**How to test:** `pnpm build` passes. GET with valid token returns assessment (hidden test cases excluded). Start sets timing fields. Save persists code. Invalid/expired tokens rejected.

---

## Phase 5: Code Execution & Submission

- [ ] Create `apps/api/src/services/AssessmentCodeRun.service.ts`
  - [ ] `runVisibleTests` — run code against visible test cases only
  - [ ] `runAllTests` — run code against all test cases (including hidden)
  - [ ] `executeTestCase` — write code to sandbox, pipe stdin, compare stdout
  - [ ] Sandbox ID: `s_assessment_${submissionId}`
  - [ ] Stdin approach: write to `/workspace/input.txt`, run `<command> < /workspace/input.txt`
  - [ ] Compiled languages: compile first using `LANGUAGE_CONFIG`, then run
- [ ] Add routes to `candidateAssessment.routes.ts`
  - [ ] `POST /assessments/:subId/take/run` — run visible tests
  - [ ] `POST /assessments/:subId/take/submit` — run all tests, store results, set submitted
- [ ] Add `submitAssessment` to `AssessmentSubmission.service.ts`
  - [ ] Run all test cases (including hidden)
  - [ ] Store results in `testCaseResult` table
  - [ ] Auto-grade (count passed tests)
  - [ ] Set status=submitted, submittedAt

**How to test:** Full flow with sandbox running. Create assessment with visible + hidden test cases. Invite candidate, start, run code — see pass/fail for visible only. Submit — all tests run, results stored. Org-side GET shows all results including hidden.

---

## Phase 6: Billing & Email Integration

- [ ] Add `'assessment_completion'` to `EventType` in `packages/db/src/usage.db.ts`
- [ ] Add `'assessment_completion'` to `AllUsageTypes` in `packages/db/src/billing.db.ts`
- [ ] Add usage tracking to `inviteCandidate()` (same pattern as `RoomService.createRoom`)
- [ ] Create assessment invitation email template in `apps/api/src/services/third-party/emails/`
- [ ] Update `ResendService` with `'assessment_invitation'` type
- [ ] Wire email sending into `inviteCandidate()`

**How to test:** Invite candidate — verify usage event tracked and email sent. Hit usage limit — verify 403 on next invite.
