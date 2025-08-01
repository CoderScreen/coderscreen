import { idString } from '@coderscreen/common/id';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { z } from 'zod';
import { privatePartyKitMiddleware } from '@/middleware/partyKit.middleware';
import { RoomSchema } from '@/schema/room.zod';
import { useAppFactory } from '@/services/AppFactory';
import { RoomService } from '@/services/Room.service';
import { TemplateService } from '@/services/Template.service';
import { AppContext } from '..';

export const roomRouter = new Hono<AppContext>()
  .use('/:id/connect/*', privatePartyKitMiddleware)
  // GET /rooms - List all rooms
  .get(
    '/',
    describeRoute({
      description: 'Get all rooms',
      responses: {
        200: {
          description: 'List of rooms',
          content: {
            'application/json': {
              schema: resolver(z.array(RoomSchema)),
            },
          },
        },
      },
    }),
    async (ctx) => {
      const roomService = new RoomService(ctx);
      const rooms = await roomService.listRooms();
      return ctx.json(rooms);
    }
  )
  // POST /rooms - Create a new room
  .post(
    '/',
    describeRoute({
      description: 'Create a new room',
      responses: {
        200: {
          description: 'Room created successfully',
          content: {
            'application/json': {
              schema: resolver(RoomSchema),
            },
          },
        },
      },
    }),
    zValidator(
      'json',
      RoomSchema.omit({ id: true, createdAt: true, updatedAt: true, status: true })
    ),
    async (ctx) => {
      const roomService = new RoomService(ctx);
      const body = ctx.req.valid('json');

      const result = await roomService.createRoom({
        ...body,
        status: 'active',
      });

      return ctx.json(result, 201);
    }
  )
  // GET /rooms/:id - Get a specific room
  .get(
    '/:id',
    describeRoute({
      description: 'Get a specific room by ID',
      responses: {
        200: {
          description: 'Room details',
          content: {
            'application/json': {
              schema: resolver(RoomSchema),
            },
          },
        },
        404: {
          description: 'Room not found',
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('room'),
      })
    ),
    async (ctx) => {
      const roomService = new RoomService(ctx);
      const { id } = ctx.req.valid('param');
      const room = await roomService.getRoom(id);

      if (!room) {
        return ctx.json({ error: 'Room not found' }, 404);
      }

      return ctx.json(room);
    }
  )
  // PATCH /rooms/:id - Update a room
  .patch(
    '/:id',
    describeRoute({
      description: 'Update a room',
      responses: {
        200: {
          description: 'Room updated successfully',
          content: {
            'application/json': {
              schema: resolver(RoomSchema),
            },
          },
        },
        404: {
          description: 'Room not found',
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('room'),
      })
    ),
    zValidator('json', RoomSchema.partial()),
    async (ctx) => {
      const roomService = new RoomService(ctx);
      const { id } = ctx.req.valid('param');
      const body = ctx.req.valid('json');

      const result = await roomService.updateRoom(id, body);
      return ctx.json(result);
    }
  )
  // DELETE /rooms/:id - Delete a room
  .delete(
    '/:id',
    describeRoute({
      description: 'Delete a room',
      responses: {
        200: {
          description: 'Room deleted successfully',
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('room'),
      })
    ),
    async (ctx) => {
      const roomService = new RoomService(ctx);
      const { id } = ctx.req.valid('param');

      await roomService.deleteRoom(id);
      return ctx.json(null, 200);
    }
  )
  // POST /rooms/:id/end - End the room
  .post(
    '/:id/end',
    describeRoute({
      description: 'End the interview',
      responses: {
        200: {
          description: 'Room ended successfully',
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('room'),
      })
    ),
    async (ctx) => {
      const { id } = ctx.req.valid('param');
      const { roomService } = useAppFactory(ctx);
      await roomService.endRoom(id);
      return ctx.json(null, 200);
    }
  )
  // POST /rooms/:id/load-template - Load specified template
  .post(
    '/:id/load-template',
    describeRoute({
      description: 'Load specific room template',
      responses: {
        200: {
          description: 'Template loaded successfully',
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        id: idString('room'),
      })
    ),
    zValidator(
      'json',
      z.object({
        templateId: idString('template'),
      })
    ),
    async (ctx) => {
      const { id } = ctx.req.valid('param');
      const { templateId } = ctx.req.valid('json');

      const templateService = new TemplateService(ctx);
      const roomService = new RoomService(ctx);

      const [room, template] = await Promise.all([
        roomService.getRoom(id),
        templateService.getTemplate(templateId),
      ]);

      if (!room || !template) {
        throw new HTTPException(404, {
          message: 'Room or Template was not found',
        });
      }

      // await roomService.loadTemplate({
      //   room,
      //   template,
      // });

      // return room;
    }
  );
