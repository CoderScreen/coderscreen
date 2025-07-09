import { AppContext } from '@/index';
import { RoomService } from '@/services/Room.service';
import { Id } from '@coderscreen/common/id';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { useAuth } from '@/lib/auth';

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

	// Check if this is a GET request to the root route (/:roomId)
	const isGetRootRoute = ctx.req.method === 'GET' && ctx.req.path.endsWith(`/${roomId}/public`);
	const publicCanConnect = room.status === 'active';

	if (isGetRootRoute) {
		// this route is always public
		return next();
	}

	if (publicCanConnect) {
		// if room is active, always allow new connections
		return next();
	}

	// otherwise, only authed users with access to the room can connect
	const auth = useAuth(ctx);
	const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

	if (!session) {
		throw new HTTPException(401, {
			message: 'Room is no longer active, must be authenticated to connect',
		});
	}

	if (session.session.activeOrganizationId !== room.organizationId) {
		throw new HTTPException(401, {
			message: 'Unauthorized to connect to this room',
		});
	}

	return next();
});
