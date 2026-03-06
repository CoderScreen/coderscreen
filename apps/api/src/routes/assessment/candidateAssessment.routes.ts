import { Id, idString } from '@coderscreen/common/id';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { describeRoute } from 'hono-openapi';
import { validator as zValidator } from 'hono-openapi/zod';
import { z } from 'zod';
import { RunTestsSchema, SaveCodeSchema, StartAssessmentSchema } from '@/schema/assessment.zod';
import { AssessmentSubmissionService } from '@/services/AssessmentSubmission.service';
import { AppContext } from '../..';

async function validateToken(
  service: AssessmentSubmissionService,
  token: string,
  subId: Id<'assessmentSubmission'>
) {
  const submission = await service.getSubmissionForToken(token);
  if (!submission || submission.id !== subId) {
    throw new HTTPException(401, { message: 'Invalid token or submission' });
  }
  return submission;
}

export const candidateAssessmentRouter = new Hono<AppContext>()
  // GET /:subId/take?token=xxx - Load assessment for candidate
  .get(
    '/:subId/take',
    describeRoute({
      description: 'Load assessment for candidate (only visible test cases)',
      responses: {
        200: { description: 'Assessment loaded' },
        401: { description: 'Invalid or expired token' },
      },
    }),
    zValidator('param', z.object({ subId: idString('assessmentSubmission') })),
    zValidator('query', z.object({ token: z.string().min(1) })),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const { subId } = ctx.req.valid('param');
      const { token } = ctx.req.valid('query');

      const result = await service.getSubmissionByToken(token);
      if (!result || result.submission.id !== subId) {
        return ctx.json({ error: 'Invalid token or submission' }, 401);
      }

      // Check expiration after token validation
      await service.checkExpiration(subId);

      return ctx.json(result);
    }
  )
  // POST /:subId/take/start - Start assessment (set language, start timer)
  .post(
    '/:subId/take/start',
    describeRoute({
      description: 'Start an assessment (set language, start timer)',
      responses: {
        200: { description: 'Assessment started' },
        400: { description: 'Assessment already started or invalid' },
        401: { description: 'Invalid or expired token' },
      },
    }),
    zValidator('param', z.object({ subId: idString('assessmentSubmission') })),
    zValidator('query', z.object({ token: z.string().min(1) })),
    zValidator('json', StartAssessmentSchema),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const { subId } = ctx.req.valid('param');
      const { token } = ctx.req.valid('query');
      const body = ctx.req.valid('json');

      await validateToken(service, token, subId);
      const result = await service.startAssessment(subId, body);
      return ctx.json(result);
    }
  )
  // POST /:subId/take/save - Auto-save code for a question
  .post(
    '/:subId/take/save',
    describeRoute({
      description: 'Auto-save code for a question',
      responses: {
        200: { description: 'Code saved' },
        400: { description: 'Assessment not in progress or expired' },
        401: { description: 'Invalid or expired token' },
      },
    }),
    zValidator('param', z.object({ subId: idString('assessmentSubmission') })),
    zValidator('query', z.object({ token: z.string().min(1) })),
    zValidator('json', SaveCodeSchema),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const { subId } = ctx.req.valid('param');
      const { token } = ctx.req.valid('query');
      const body = ctx.req.valid('json');

      await validateToken(service, token, subId);

      // Check expiration before saving
      const expired = await service.checkExpiration(subId);
      if (expired) {
        throw new HTTPException(400, { message: 'Assessment has expired' });
      }

      const result = await service.saveCode(subId, body);
      return ctx.json(result);
    }
  )
  // POST /:subId/take/run - Run code against visible test cases
  .post(
    '/:subId/take/run',
    describeRoute({
      description: 'Run code against visible test cases for a question',
      responses: {
        200: { description: 'Test results' },
        400: { description: 'Assessment not in progress or expired' },
        401: { description: 'Invalid or expired token' },
      },
    }),
    zValidator('param', z.object({ subId: idString('assessmentSubmission') })),
    zValidator('query', z.object({ token: z.string().min(1) })),
    zValidator('json', RunTestsSchema),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const { subId } = ctx.req.valid('param');
      const { token } = ctx.req.valid('query');
      const body = ctx.req.valid('json');

      await validateToken(service, token, subId);

      const expired = await service.checkExpiration(subId);
      if (expired) {
        throw new HTTPException(400, { message: 'Assessment has expired' });
      }

      const result = await service.runVisibleTests(subId, body);
      return ctx.json(result);
    }
  )
  // POST /:subId/take/submit - Submit the assessment
  .post(
    '/:subId/take/submit',
    describeRoute({
      description: 'Submit the assessment (runs all tests including hidden, stores results)',
      responses: {
        200: { description: 'Assessment submitted' },
        400: { description: 'Assessment not in progress or expired' },
        401: { description: 'Invalid or expired token' },
      },
    }),
    zValidator('param', z.object({ subId: idString('assessmentSubmission') })),
    zValidator('query', z.object({ token: z.string().min(1) })),
    async (ctx) => {
      const service = new AssessmentSubmissionService(ctx);
      const { subId } = ctx.req.valid('param');
      const { token } = ctx.req.valid('query');

      await validateToken(service, token, subId);

      const expired = await service.checkExpiration(subId);
      if (expired) {
        throw new HTTPException(400, { message: 'Assessment has expired' });
      }

      const result = await service.submitAssessment(subId);
      return ctx.json(result);
    }
  );
