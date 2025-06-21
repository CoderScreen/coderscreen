import { Context } from 'hono';
import { AppContext } from '..';
import { RoomService } from './Room.service';
import { createMiddleware } from 'hono/factory';

export interface AppFactory {
	roomService: RoomService;
}

export const appFactoryMiddleware = createMiddleware(async (ctx, next) => {
	const appFactory: AppFactory = {
		roomService: new RoomService(ctx),
	};
	ctx.set('appFactory', appFactory);
	return next();
});

export const useAppFactory = (ctx: Context<AppContext>) => {
	return ctx.get('appFactory');
};
