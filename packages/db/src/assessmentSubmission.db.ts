import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { boolean, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { assessmentTable } from './assessment.db';
import { candidateTable } from './candidate.db';
import { organization } from './user.db';

// 'graded' is no longer written; older reviewed rows still carry it.
export type SubmissionStatus = 'not_started' | 'in_progress' | 'submitted' | 'expired' | 'graded';

export type SubmissionDecision = 'advance' | 'reject';

export const assessmentSubmissionTable = pgTable(
  'assessment_submissions',
  {
    id: text('id').primaryKey().$type<Id<'assessmentSubmission'>>(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    assessmentId: text('assessment_id')
      .notNull()
      .references(() => assessmentTable.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    candidateId: text('candidate_id')
      .$type<Id<'candidate'>>()
      .notNull()
      .references(() => candidateTable.id, { onDelete: 'cascade' }),
    status: text('status').$type<SubmissionStatus>().notNull().default('not_started'),
    selectedLanguage: text('selected_language'),
    startedAt: timestamp('started_at', { mode: 'string', withTimezone: true }),
    submittedAt: timestamp('submitted_at', { mode: 'string', withTimezone: true }),
    expiresAt: timestamp('expires_at', { mode: 'string', withTimezone: true }),
    totalScore: integer('total_score'),
    maxScore: integer('max_score'),
    gradingNotes: text('grading_notes').notNull().default(''),
    // Set when a reviewer records a decision; status keeps how the attempt ended.
    decision: text('decision').$type<SubmissionDecision>(),
    reviewedAt: timestamp('reviewed_at', { mode: 'string', withTimezone: true }),
    accessToken: text('access_token').notNull().unique(),
    // The invite stops working if not started by then. Null means no deadline.
    startBy: timestamp('start_by', { mode: 'string', withTimezone: true }),
    // Optional note from the team, shown in the invite email (and resends).
    inviteMessage: text('invite_message'),
    isArchived: boolean('is_archived').notNull().default(false),
  },
  (t) => [
    index('idx_submission_assessment').on(t.assessmentId),
    index('idx_submission_org').on(t.organizationId),
    index('idx_submission_candidate').on(t.candidateId),
    index('idx_submission_token').on(t.accessToken),
  ]
);

export type AssessmentSubmissionEntity = typeof assessmentSubmissionTable.$inferSelect;
