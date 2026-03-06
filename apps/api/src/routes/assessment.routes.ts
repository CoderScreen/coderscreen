import { idString } from '@coderscreen/common/id';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { z } from 'zod';
import {
  AssessmentQuestionSchema,
  AssessmentSchema,
  CandidateSchema,
  CreateAssessmentSchema,
  CreateCandidateSchema,
  CreateQuestionSchema,
  CreateSubmissionSchema,
  CreateTestCaseSchema,
  GradeSubmissionSchema,
  ReorderQuestionsSchema,
  TestCaseSchema,
  UpdateAssessmentSchema,
  UpdateQuestionSchema,
  UpdateTestCaseSchema,
} from '@/schema/assessment.zod';
import { AssessmentService } from '@/services/Assessment.service';
import { AssessmentSubmissionService } from '@/services/AssessmentSubmission.service';
import { AppContext } from '..';

export const assessmentRouter = new Hono<AppContext>()
  // GET /assessments - List all assessments
  .get(
    '/',
    describeRoute({
      description: 'Get all assessments',
      responses: {
        200: {
          description: 'List of assessments',
          content: {
            'application/json': {
              schema: resolver(z.array(AssessmentSchema)),
            },
          },
        },
      },
    }),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const assessments = await service.listAssessments();
      return ctx.json(assessments);
    }
  )
  // POST /assessments - Create a new assessment
  .post(
    '/',
    describeRoute({
      description: 'Create a new assessment',
      responses: {
        201: {
          description: 'Assessment created successfully',
          content: {
            'application/json': {
              schema: resolver(AssessmentSchema),
            },
          },
        },
      },
    }),
    zValidator('json', CreateAssessmentSchema),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const body = ctx.req.valid('json');
      const result = await service.createAssessment(body);
      return ctx.json(result, 201);
    }
  )
  // GET /assessments/:id - Get assessment with questions and test cases
  .get(
    '/:id',
    describeRoute({
      description: 'Get a specific assessment with questions and test cases',
      responses: {
        200: {
          description: 'Assessment details',
        },
        404: {
          description: 'Assessment not found',
        },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { id } = ctx.req.valid('param');
      const result = await service.getAssessmentWithQuestions(id);

      if (!result) {
        return ctx.json({ error: 'Assessment not found' }, 404);
      }

      return ctx.json(result);
    }
  )
  // PATCH /assessments/:id - Update assessment
  .patch(
    '/:id',
    describeRoute({
      description: 'Update an assessment',
      responses: {
        200: {
          description: 'Assessment updated successfully',
          content: {
            'application/json': {
              schema: resolver(AssessmentSchema),
            },
          },
        },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    zValidator('json', UpdateAssessmentSchema),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { id } = ctx.req.valid('param');
      const body = ctx.req.valid('json');
      const result = await service.updateAssessment(id, body);
      return ctx.json(result);
    }
  )
  // DELETE /assessments/:id - Delete assessment
  .delete(
    '/:id',
    describeRoute({
      description: 'Delete an assessment',
      responses: {
        200: {
          description: 'Assessment deleted successfully',
        },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { id } = ctx.req.valid('param');
      await service.deleteAssessment(id);
      return ctx.json(null, 200);
    }
  )
  // POST /assessments/:id/publish - Publish assessment
  .post(
    '/:id/publish',
    describeRoute({
      description: 'Publish an assessment (validates questions and test cases exist)',
      responses: {
        200: {
          description: 'Assessment published successfully',
          content: {
            'application/json': {
              schema: resolver(AssessmentSchema),
            },
          },
        },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { id } = ctx.req.valid('param');
      const result = await service.publishAssessment(id);
      return ctx.json(result);
    }
  )
  // POST /assessments/:id/archive - Archive assessment
  .post(
    '/:id/archive',
    describeRoute({
      description: 'Archive an assessment',
      responses: {
        200: {
          description: 'Assessment archived successfully',
          content: {
            'application/json': {
              schema: resolver(AssessmentSchema),
            },
          },
        },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { id } = ctx.req.valid('param');
      const result = await service.archiveAssessment(id);
      return ctx.json(result);
    }
  )
  // POST /assessments/:id/questions - Add a question
  .post(
    '/:id/questions',
    describeRoute({
      description: 'Add a question to an assessment',
      responses: {
        201: {
          description: 'Question created successfully',
          content: {
            'application/json': {
              schema: resolver(AssessmentQuestionSchema),
            },
          },
        },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    zValidator('json', CreateQuestionSchema),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { id } = ctx.req.valid('param');
      const body = ctx.req.valid('json');
      const result = await service.createQuestion(id, body);
      return ctx.json(result, 201);
    }
  )
  // PATCH /assessments/:id/questions/:questionId - Update a question
  .patch(
    '/:id/questions/:questionId',
    describeRoute({
      description: 'Update a question',
      responses: {
        200: {
          description: 'Question updated successfully',
          content: {
            'application/json': {
              schema: resolver(AssessmentQuestionSchema),
            },
          },
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('assessment'),
        questionId: idString('assessmentQuestion'),
      })
    ),
    zValidator('json', UpdateQuestionSchema),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { questionId } = ctx.req.valid('param');
      const body = ctx.req.valid('json');
      const result = await service.updateQuestion(questionId, body);
      return ctx.json(result);
    }
  )
  // DELETE /assessments/:id/questions/:questionId - Delete a question
  .delete(
    '/:id/questions/:questionId',
    describeRoute({
      description: 'Delete a question',
      responses: {
        200: {
          description: 'Question deleted successfully',
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('assessment'),
        questionId: idString('assessmentQuestion'),
      })
    ),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { questionId } = ctx.req.valid('param');
      await service.deleteQuestion(questionId);
      return ctx.json(null, 200);
    }
  )
  // POST /assessments/:id/questions/reorder - Reorder questions
  .post(
    '/:id/questions/reorder',
    describeRoute({
      description: 'Reorder questions within an assessment',
      responses: {
        200: {
          description: 'Questions reordered successfully',
        },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    zValidator('json', ReorderQuestionsSchema),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { id } = ctx.req.valid('param');
      const { order } = ctx.req.valid('json');
      await service.reorderQuestions(id, order);
      return ctx.json({ success: true });
    }
  )
  // POST /assessments/:id/questions/:questionId/test-cases - Add a test case
  .post(
    '/:id/questions/:questionId/test-cases',
    describeRoute({
      description: 'Add a test case to a question',
      responses: {
        201: {
          description: 'Test case created successfully',
          content: {
            'application/json': {
              schema: resolver(TestCaseSchema),
            },
          },
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('assessment'),
        questionId: idString('assessmentQuestion'),
      })
    ),
    zValidator('json', CreateTestCaseSchema),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { questionId } = ctx.req.valid('param');
      const body = ctx.req.valid('json');
      const result = await service.createTestCase(questionId, body);
      return ctx.json(result, 201);
    }
  )
  // PATCH /assessments/:id/questions/:questionId/test-cases/:testCaseId - Update a test case
  .patch(
    '/:id/questions/:questionId/test-cases/:testCaseId',
    describeRoute({
      description: 'Update a test case',
      responses: {
        200: {
          description: 'Test case updated successfully',
          content: {
            'application/json': {
              schema: resolver(TestCaseSchema),
            },
          },
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('assessment'),
        questionId: idString('assessmentQuestion'),
        testCaseId: idString('assessmentTestCase'),
      })
    ),
    zValidator('json', UpdateTestCaseSchema),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { testCaseId } = ctx.req.valid('param');
      const body = ctx.req.valid('json');
      const result = await service.updateTestCase(testCaseId, body);
      return ctx.json(result);
    }
  )
  // DELETE /assessments/:id/questions/:questionId/test-cases/:testCaseId - Delete a test case
  .delete(
    '/:id/questions/:questionId/test-cases/:testCaseId',
    describeRoute({
      description: 'Delete a test case',
      responses: {
        200: {
          description: 'Test case deleted successfully',
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('assessment'),
        questionId: idString('assessmentQuestion'),
        testCaseId: idString('assessmentTestCase'),
      })
    ),
    async (ctx) => {
      const service = new AssessmentService(ctx);
      const { testCaseId } = ctx.req.valid('param');
      await service.deleteTestCase(testCaseId);
      return ctx.json(null, 200);
    }
  )
  // === Submissions ===
  // GET /assessments/:id/submissions - List submissions
  .get(
    '/:id/submissions',
    describeRoute({
      description: 'List all submissions for an assessment',
      responses: {
        200: {
          description: 'List of submissions',
        },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const { id } = ctx.req.valid('param');
      const result = await service.listSubmissions(id);
      return ctx.json(result);
    }
  )
  // POST /assessments/:id/submissions - Invite a candidate
  .post(
    '/:id/submissions',
    describeRoute({
      description: 'Invite a candidate to take an assessment',
      responses: {
        201: {
          description: 'Submission created successfully',
        },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    zValidator('json', CreateSubmissionSchema),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const { id } = ctx.req.valid('param');
      const body = ctx.req.valid('json');
      const result = await service.inviteCandidate(id, body);
      return ctx.json(result, 201);
    }
  )
  // GET /assessments/:id/submissions/:subId - Get submission details
  .get(
    '/:id/submissions/:subId',
    describeRoute({
      description: 'Get detailed submission with code and test results',
      responses: {
        200: {
          description: 'Submission details',
        },
        404: {
          description: 'Submission not found',
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('assessment'),
        subId: idString('assessmentSubmission'),
      })
    ),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const { subId } = ctx.req.valid('param');
      const result = await service.getSubmissionDetails(subId);

      if (!result) {
        return ctx.json({ error: 'Submission not found' }, 404);
      }

      return ctx.json(result);
    }
  )
  // POST /assessments/:id/submissions/:subId/grade - Grade a submission
  .post(
    '/:id/submissions/:subId/grade',
    describeRoute({
      description: 'Grade a submission',
      responses: {
        200: {
          description: 'Submission graded successfully',
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('assessment'),
        subId: idString('assessmentSubmission'),
      })
    ),
    zValidator('json', GradeSubmissionSchema),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const { subId } = ctx.req.valid('param');
      const body = ctx.req.valid('json');
      const result = await service.gradeSubmission(subId, body);
      return ctx.json(result);
    }
  );

// === Candidate Router (separate, mounted at /candidates) ===

export const candidateRouter = new Hono<AppContext>()
  // GET /candidates - List all candidates
  .get(
    '/',
    describeRoute({
      description: 'List all candidates for the organization',
      responses: {
        200: {
          description: 'List of candidates',
          content: {
            'application/json': {
              schema: resolver(z.array(CandidateSchema)),
            },
          },
        },
      },
    }),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const result = await service.listCandidates();
      return ctx.json(result);
    }
  )
  // POST /candidates - Create a candidate
  .post(
    '/',
    describeRoute({
      description: 'Create a candidate (upserts on org+email)',
      responses: {
        201: {
          description: 'Candidate created successfully',
          content: {
            'application/json': {
              schema: resolver(CandidateSchema),
            },
          },
        },
      },
    }),
    zValidator('json', CreateCandidateSchema),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const body = ctx.req.valid('json');
      const result = await service.createCandidate(body);
      return ctx.json(result, 201);
    }
  )
  // GET /candidates/:id - Get candidate with submission history
  .get(
    '/:id',
    describeRoute({
      description: 'Get a candidate with their submission history',
      responses: {
        200: {
          description: 'Candidate details',
        },
        404: {
          description: 'Candidate not found',
        },
      },
    }),
    zValidator('param', z.object({ id: idString('candidate') })),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const { id } = ctx.req.valid('param');
      const result = await service.getCandidate(id);

      if (!result) {
        return ctx.json({ error: 'Candidate not found' }, 404);
      }

      return ctx.json(result);
    }
  );
