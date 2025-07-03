import { partyserverMiddleware } from 'hono-party';
import { AppContext } from '@/index';
import { HTTPException } from 'hono/http-exception';
import { createMiddleware } from 'hono/factory';

export const partyKitMiddleware = createMiddleware<AppContext>(async (ctx, next) => {
	const publicRoom = ctx.get('publicRoom');

	if (!publicRoom) {
		throw new HTTPException(404, {
			message: 'Room not found',
		});
	}

	// Call the partyserverMiddleware with the validated room
	const partyMiddleware = partyserverMiddleware<AppContext>({
		options: {
			prefix: `rooms/${publicRoom.id}/public/partykit/parties`,
		},
	});

	// Apply the party middleware and continue
	return partyMiddleware(ctx, next);
});
