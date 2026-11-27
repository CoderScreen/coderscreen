import { generateId } from '@coderscreen/common/id';
import { assessmentTable } from '@coderscreen/db/assessment.db';
import { assessmentQuestionTable } from '@coderscreen/db/assessmentQuestion.db';
import { assessmentSubmissionTable } from '@coderscreen/db/assessmentSubmission.db';
import { candidateTable } from '@coderscreen/db/candidate.db';
import { questionLibraryTable } from '@coderscreen/db/questionLibrary.db';
import { questionSubmissionTable } from '@coderscreen/db/questionSubmission.db';
import { db, minutesAgo, type TestOrg } from './helpers';

// Insert rows straight into the test database. Each factory fills in sensible
// defaults; pass overrides for whatever the test is about.

type NewAssessment = typeof assessmentTable.$inferInsert;
type NewQuestionLink = typeof assessmentQuestionTable.$inferInsert;
type NewCandidate = typeof candidateTable.$inferInsert;
type NewSubmission = typeof assessmentSubmissionTable.$inferInsert;
type NewQuestionSubmission = typeof questionSubmissionTable.$inferInsert;

export async function createAssessment(org: TestOrg, overrides: Partial<NewAssessment> = {}) {
  const [row] = await db()
    .insert(assessmentTable)
    .values({
      id: generateId('assessment'),
      organizationId: org.id,
      createdByUserId: org.userId,
      title: 'Backend Screen',
      status: 'active',
      timeLimitSeconds: 3600,
      ...overrides,
    })
    .returning();
  return row;
}

/** A library question linked to the assessment. Returns the link row (what submissions reference). */
export async function addQuestion(
  org: TestOrg,
  assessmentId: string,
  overrides: Partial<NewQuestionLink> & { title?: string } = {}
) {
  const { title = 'Two Sum', ...link } = overrides;
  const [question] = await db()
    .insert(questionLibraryTable)
    .values({ id: generateId('questionLibrary'), organizationId: org.id, title, description: {} })
    .returning();
  const [row] = await db()
    .insert(assessmentQuestionTable)
    .values({
      id: generateId('assessmentQuestion'),
      assessmentId,
      organizationId: org.id,
      questionId: question.id,
      position: 0,
      points: 100,
      ...link,
    })
    .returning();
  return row;
}

export async function createCandidate(org: TestOrg, overrides: Partial<NewCandidate> = {}) {
  const id = generateId('candidate');
  const [row] = await db()
    .insert(candidateTable)
    .values({
      id,
      organizationId: org.id,
      name: 'Test Candidate',
      email: `${id}@candidate.example`,
      ...overrides,
    })
    .returning();
  return row;
}

/** Defaults to an attempt the candidate submitted 5 minutes ago. */
export async function createSubmission(
  org: TestOrg,
  values: { assessmentId: string } & Partial<NewSubmission>
) {
  const candidateId = values.candidateId ?? (await createCandidate(org)).id;
  const id = generateId('assessmentSubmission');
  const [row] = await db()
    .insert(assessmentSubmissionTable)
    .values({
      id,
      organizationId: org.id,
      candidateId,
      accessToken: `tok_${id}`,
      status: 'submitted',
      startedAt: minutesAgo(50),
      submittedAt: minutesAgo(5),
      ...values,
    })
    .returning();
  return row;
}

/** A graded (non-draft) submit of one question within an attempt. */
export async function createQuestionSubmit(
  org: TestOrg,
  values: { submissionId: string; questionId: string } & Partial<NewQuestionSubmission>
) {
  const [row] = await db()
    .insert(questionSubmissionTable)
    .values({
      id: generateId('questionSubmission'),
      organizationId: org.id,
      code: 'def solve(): pass',
      language: 'python',
      score: 4,
      maxScore: 4,
      isDraft: false,
      ...values,
    })
    .returning();
  return row;
}
