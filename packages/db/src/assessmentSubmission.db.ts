import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { assessmentTable } from './assessment.db';
import { candidateTable } from './candidate.db';
import { organization } from './user.db';

export type SubmissionStatus = 'not_started' | 'in_progress' | 'submitted' | 'expired' | 'graded';

export const assessmentSubmissionTable = pgTable(
  'assessment_submissions',
  {
    id: text('id').primaryKey().$type<Id<'assessmentSubmission'>>(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(sql`now()`).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(sql`now()`).notNull(),
    assessmentId: text('assessment_id')
      .notNull()
      .references(() => assessmentTable.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    candidateId: text('candidate_id')
      .notNull()
      .references(() => candidateTable.id, { onDelete: 'cascade' }),
    status: text('status').$type<SubmissionStatus>().notNull().default('not_started'),
    selectedLanguage: text('selected_language'),
    startedAt: timestamp('started_at', { mode: 'string' }),
    submittedAt: timestamp('submitted_at', { mode: 'string' }),
    expiresAt: timestamp('expires_at', { mode: 'string' }),
    totalScore: integer('total_score'),
    maxScore: integer('max_score'),
    gradingNotes: text('grading_notes').notNull().default(''),
    accessToken: text('access_token').notNull().unique(),
  },
  (t) => [
    index('idx_submission_assessment').on(t.assessmentId),
    index('idx_submission_org').on(t.organizationId),
    index('idx_submission_candidate').on(t.candidateId),
    index('idx_submission_token').on(t.accessToken),
  ]
);

export type AssessmentSubmissionEntity = typeof assessmentSubmissionTable.$inferSelect;
