import { idString } from '@coderscreen/common/id';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { z } from 'zod';
import { AppContext } from '@/index';
import { PaginationQuerySchema } from '@/lib/pagination';
import { CreateSubmissionSchema } from '@/schema/assessment.zod';
import {
  PublicAssessmentSchema,
  PublicCandidateSchema,
  PublicPaginationSchema,
  PublicRoomSchema,
  PublicSubmissionSchema,
  toPublicAssessment,
  toPublicCandidate,
  toPublicRoom,
  toPublicSubmission,
} from '@/schema/public.zod';
import { AssessmentService } from '@/services/Assessment.service';
import { AssessmentSubmissionService } from '@/services/AssessmentSubmission.service';
import { RoomService } from '@/services/Room.service';

// Public request bodies. Kept separate from internal schemas so the external
// contract is explicit and stable.
const CreateRoomBody = z.object({
  title: z.string().min(1),
  language: z.string().min(1),
  notes: z.string().optional(),
});

/**
 * Public REST API (v1). Authenticated with an organization API key via
 * `apiKeyMiddleware` (mounted in index.ts). Handlers are thin: they call the
 * same services the internal API uses, then map to the stable public DTOs in
 * schema/public.zod.ts. Business logic lives in the services, not here.
 */
export const publicApiRouter = new Hono<AppContext>()
  // --- Interviews (rooms) ---------------------------------------------------
  .get(
    '/rooms',
    describeRoute({
      description: 'List interviews',
      responses: {
        200: {
          description: 'List of interviews',
          content: { 'application/json': { schema: resolver(z.array(PublicRoomSchema)) } },
        },
      },
    }),
    async (ctx) => {
      const rooms = await new RoomService(ctx).listRooms();
      return ctx.json(rooms.map((r) => toPublicRoom(r, ctx.env.FE_APP_URL)));
    }
  )
  .post(
    '/rooms',
    describeRoute({
      description: 'Create an interview',
      responses: {
        201: {
          description: 'Interview created',
          content: { 'application/json': { schema: resolver(PublicRoomSchema) } },
        },
      },
    }),
    zValidator('json', CreateRoomBody),
    async (ctx) => {
      const body = ctx.req.valid('json');
      const room = await new RoomService(ctx).createRoom({
        title: body.title,
        language: body.language as Parameters<RoomService['createRoom']>[0]['language'],
        notes: body.notes ?? '',
        status: 'active',
      });
      return ctx.json(toPublicRoom(room, ctx.env.FE_APP_URL), 201);
    }
  )
  .get(
    '/rooms/:id',
    describeRoute({
      description: 'Get an interview by ID',
      responses: {
        200: {
          description: 'Interview',
          content: { 'application/json': { schema: resolver(PublicRoomSchema) } },
        },
        404: { description: 'Interview not found' },
      },
    }),
    zValidator('param', z.object({ id: idString('room') })),
    async (ctx) => {
      const { id } = ctx.req.valid('param');
      const room = await new RoomService(ctx).getRoom(id);
      if (!room) return ctx.json({ error: 'Interview not found' }, 404);
      return ctx.json(toPublicRoom(room, ctx.env.FE_APP_URL));
    }
  )
  // --- Assessments ----------------------------------------------------------
  .get(
    '/assessments',
    describeRoute({
      description: 'List assessments',
      responses: {
        200: {
          description: 'Paginated list of assessments',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  data: z.array(PublicAssessmentSchema),
                  pagination: PublicPaginationSchema,
                })
              ),
            },
          },
        },
      },
    }),
    zValidator('query', PaginationQuerySchema),
    async (ctx) => {
      const pagination = ctx.req.valid('query');
      const result = await new AssessmentService(ctx).listAssessments(pagination);
      return ctx.json({
        data: result.data.map(toPublicAssessment),
        pagination: result.pagination,
      });
    }
  )
  .get(
    '/assessments/:id',
    describeRoute({
      description: 'Get an assessment by ID',
      responses: {
        200: {
          description: 'Assessment',
          content: { 'application/json': { schema: resolver(PublicAssessmentSchema) } },
        },
        404: { description: 'Assessment not found' },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    async (ctx) => {
      const { id } = ctx.req.valid('param');
      const assessment = await new AssessmentService(ctx).getAssessment(id);
      if (!assessment) return ctx.json({ error: 'Assessment not found' }, 404);
      return ctx.json(toPublicAssessment(assessment));
    }
  )
  .get(
    '/assessments/:id/submissions',
    describeRoute({
      description: 'List submissions for an assessment',
      responses: {
        200: {
          description: 'List of submissions',
          content: { 'application/json': { schema: resolver(z.array(PublicSubmissionSchema)) } },
        },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    async (ctx) => {
      const { id } = ctx.req.valid('param');
      const submissions = await new AssessmentSubmissionService(ctx).listSubmissions(id);
      return ctx.json(submissions.map((s) => toPublicSubmission(s, ctx.env.FE_APP_URL)));
    }
  )
  .post(
    '/assessments/:id/invites',
    describeRoute({
      description: 'Invite a candidate to an assessment. Returns the submission (with take link).',
      responses: {
        201: {
          description: 'Candidate invited',
          content: { 'application/json': { schema: resolver(PublicSubmissionSchema) } },
        },
      },
    }),
    zValidator('param', z.object({ id: idString('assessment') })),
    zValidator('json', CreateSubmissionSchema),
    async (ctx) => {
      const { id } = ctx.req.valid('param');
      const body = ctx.req.valid('json');
      const submission = await new AssessmentSubmissionService(ctx).inviteCandidate(id, body);
      return ctx.json(toPublicSubmission(submission, ctx.env.FE_APP_URL), 201);
    }
  )
  // --- Submissions ----------------------------------------------------------
  .get(
    '/submissions/:id',
    describeRoute({
      description: 'Get a submission (with results) by ID',
      responses: {
        200: {
          description: 'Submission details',
          content: { 'application/json': { schema: resolver(PublicSubmissionSchema) } },
        },
        404: { description: 'Submission not found' },
      },
    }),
    zValidator('param', z.object({ id: idString('assessmentSubmission') })),
    async (ctx) => {
      const { id } = ctx.req.valid('param');
      const submission = await new AssessmentSubmissionService(ctx).getSubmissionDetails(id);
      if (!submission) return ctx.json({ error: 'Submission not found' }, 404);
      return ctx.json(toPublicSubmission(submission, ctx.env.FE_APP_URL));
    }
  )
  // --- Candidates -----------------------------------------------------------
  .get(
    '/candidates',
    describeRoute({
      description: 'List candidates',
      responses: {
        200: {
          description: 'List of candidates',
          content: { 'application/json': { schema: resolver(z.array(PublicCandidateSchema)) } },
        },
      },
    }),
    async (ctx) => {
      const candidates = await new AssessmentSubmissionService(ctx).listCandidates();
      return ctx.json(candidates.map(toPublicCandidate));
    }
  );
