import { AppContext } from '@/index';
import { RoomService } from '@/services/Room.service';
import { Id } from '@coderscreen/common/id';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

export const publicRoomMiddleware = createMiddleware<AppContext>(async (ctx, next) => {
	const roomId = ctx.req.param('roomId');

	if (!roomId) {
		throw new HTTPException(413, {
			message: 'roomId parameter not specified',
		});
	}

	const room = await new RoomService(ctx).getPublicRoom(roomId as Id<'room'>);
	if (!room) {
		throw new HTTPException(404, {
			message: 'Room not found',
		});
	}

	ctx.set('publicRoom', room);

	return next();
});
