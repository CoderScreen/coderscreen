import type { Id } from '@coderscreen/common/id';
import { assessmentQuestionTable } from '@coderscreen/db/assessmentQuestion.db';
import { assessmentSubmissionTable } from '@coderscreen/db/assessmentSubmission.db';
import { and, countDistinct, eq, inArray, isNull, ne } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export interface QuestionUsage {
  // Assessments that currently include the question (archived links excluded).
  assessmentCount: number;
  // Candidates who have started one of those assessments. Their results are
  // snapshotted, so edits don't change them, but authors should know edits
  // only reach candidates who haven't started yet.
  candidateCount: number;
}

const EMPTY_USAGE: QuestionUsage = { assessmentCount: 0, candidateCount: 0 };

/**
 * Library questions are shared across every assessment that links them, so an
 * edit made from one place lands everywhere. The editor surfaces these counts
 * so that isn't a surprise.
 */
export async function getQuestionUsage(
  db: PostgresJsDatabase,
  libraryQuestionIds: Id<'questionLibrary'>[]
): Promise<Map<string, QuestionUsage>> {
  const usage = new Map<string, QuestionUsage>();
  if (libraryQuestionIds.length === 0) return usage;

  const activeLinks = and(
    inArray(assessmentQuestionTable.questionId, libraryQuestionIds),
    isNull(assessmentQuestionTable.archivedAt)
  );

  const [assessmentRows, candidateRows] = await Promise.all([
    db
      .select({
        questionId: assessmentQuestionTable.questionId,
        count: countDistinct(assessmentQuestionTable.assessmentId),
      })
      .from(assessmentQuestionTable)
      .where(activeLinks)
      .groupBy(assessmentQuestionTable.questionId),
    db
      .select({
        questionId: assessmentQuestionTable.questionId,
        count: countDistinct(assessmentSubmissionTable.id),
      })
      .from(assessmentQuestionTable)
      .innerJoin(
        assessmentSubmissionTable,
        eq(assessmentSubmissionTable.assessmentId, assessmentQuestionTable.assessmentId)
      )
      .where(and(activeLinks, ne(assessmentSubmissionTable.status, 'not_started')))
      .groupBy(assessmentQuestionTable.questionId),
  ]);

  for (const row of assessmentRows) {
    usage.set(row.questionId, { ...EMPTY_USAGE, assessmentCount: Number(row.count) });
  }
  for (const row of candidateRows) {
    const existing = usage.get(row.questionId) ?? EMPTY_USAGE;
    usage.set(row.questionId, { ...existing, candidateCount: Number(row.count) });
  }
  return usage;
}

export const usageFor = (usage: Map<string, QuestionUsage>, id: string): QuestionUsage =>
  usage.get(id) ?? EMPTY_USAGE;
