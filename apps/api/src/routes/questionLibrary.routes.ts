import { idString } from '@coderscreen/common/id';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { z } from 'zod';
import {
  CreateQuestionLibrarySchema,
  CreateQuestionLibraryTestCaseSchema,
  QuestionLibrarySchema,
  QuestionLibraryTestCaseSchema,
  UpdateQuestionLibrarySchema,
  UpdateQuestionLibraryTestCaseSchema,
} from '@/schema/questionLibrary.zod';
import { QuestionLibraryService } from '@/services/QuestionLibrary.service';
import { AppContext } from '..';

export const questionLibraryRouter = new Hono<AppContext>()
  // GET /questions - List all questions
  .get(
    '/',
    describeRoute({
      description: 'Get all question library entries',
      responses: {
        200: {
          description: 'List of questions',
          content: {
            'application/json': {
              schema: resolver(z.array(QuestionLibrarySchema)),
            },
          },
        },
      },
    }),
    async (ctx) => {
      const service = new QuestionLibraryService(ctx);
      const questions = await service.listQuestions();
      return ctx.json(questions);
    }
  )
  // POST /questions - Create a new question
  .post(
    '/',
    describeRoute({
      description: 'Create a new question library entry',
      responses: {
        201: {
          description: 'Question created successfully',
          content: {
            'application/json': {
              schema: resolver(QuestionLibrarySchema),
            },
          },
        },
      },
    }),
    zValidator('json', CreateQuestionLibrarySchema),
    async (ctx) => {
      const service = new QuestionLibraryService(ctx);
      const body = ctx.req.valid('json');
      const result = await service.createQuestion(body);
      return ctx.json(result, 201);
    }
  )
  // GET /questions/:id - Get question with test cases
  .get(
    '/:id',
    describeRoute({
      description: 'Get a question with its test cases',
      responses: {
        200: {
          description: 'Question details',
        },
        404: {
          description: 'Question not found',
        },
      },
    }),
    zValidator('param', z.object({ id: idString('questionLibrary') })),
    async (ctx) => {
      const service = new QuestionLibraryService(ctx);
      const { id } = ctx.req.valid('param');
      const result = await service.getQuestion(id);

      if (!result) {
        return ctx.json({ error: 'Question not found' }, 404);
      }

      return ctx.json(result);
    }
  )
  // PATCH /questions/:id - Update question
  .patch(
    '/:id',
    describeRoute({
      description: 'Update a question',
      responses: {
        200: {
          description: 'Question updated successfully',
          content: {
            'application/json': {
              schema: resolver(QuestionLibrarySchema),
            },
          },
        },
      },
    }),
    zValidator('param', z.object({ id: idString('questionLibrary') })),
    zValidator('json', UpdateQuestionLibrarySchema),
    async (ctx) => {
      const service = new QuestionLibraryService(ctx);
      const { id } = ctx.req.valid('param');
      const body = ctx.req.valid('json');
      const result = await service.updateQuestion(id, body);
      return ctx.json(result);
    }
  )
  // DELETE /questions/:id - Delete question
  .delete(
    '/:id',
    describeRoute({
      description: 'Delete a question',
      responses: {
        200: {
          description: 'Question deleted successfully',
        },
      },
    }),
    zValidator('param', z.object({ id: idString('questionLibrary') })),
    async (ctx) => {
      const service = new QuestionLibraryService(ctx);
      const { id } = ctx.req.valid('param');
      await service.deleteQuestion(id);
      return ctx.json(null, 200);
    }
  )
  // POST /questions/:id/test-cases - Create test case
  .post(
    '/:id/test-cases',
    describeRoute({
      description: 'Add a test case to a question',
      responses: {
        201: {
          description: 'Test case created successfully',
          content: {
            'application/json': {
              schema: resolver(QuestionLibraryTestCaseSchema),
            },
          },
        },
      },
    }),
    zValidator('param', z.object({ id: idString('questionLibrary') })),
    zValidator('json', CreateQuestionLibraryTestCaseSchema),
    async (ctx) => {
      const service = new QuestionLibraryService(ctx);
      const { id } = ctx.req.valid('param');
      const body = ctx.req.valid('json');
      const result = await service.createTestCase(id, body);
      return ctx.json(result, 201);
    }
  )
  // PATCH /questions/:id/test-cases/:testCaseId - Update test case
  .patch(
    '/:id/test-cases/:testCaseId',
    describeRoute({
      description: 'Update a test case',
      responses: {
        200: {
          description: 'Test case updated successfully',
          content: {
            'application/json': {
              schema: resolver(QuestionLibraryTestCaseSchema),
            },
          },
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('questionLibrary'),
        testCaseId: idString('questionLibraryTestCase'),
      })
    ),
    zValidator('json', UpdateQuestionLibraryTestCaseSchema),
    async (ctx) => {
      const service = new QuestionLibraryService(ctx);
      const { testCaseId } = ctx.req.valid('param');
      const body = ctx.req.valid('json');
      const result = await service.updateTestCase(testCaseId, body);
      return ctx.json(result);
    }
  )
  // DELETE /questions/:id/test-cases/:testCaseId - Delete test case
  .delete(
    '/:id/test-cases/:testCaseId',
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
        id: idString('questionLibrary'),
        testCaseId: idString('questionLibraryTestCase'),
      })
    ),
    async (ctx) => {
      const service = new QuestionLibraryService(ctx);
      const { testCaseId } = ctx.req.valid('param');
      await service.deleteTestCase(testCaseId);
      return ctx.json(null, 200);
    }
  );
