import { Context } from 'hono';
import { AppContext } from '..';
import { RoomService } from './Room.service';
import { createMiddleware } from 'hono/factory';
import { CodeRunService } from './CodeRun.service';

export interface AppFactory {
	roomService: RoomService;
	codeRunService: CodeRunService;
}

export const appFactoryMiddleware = createMiddleware(async (ctx, next) => {
	const appFactory: AppFactory = {
		roomService: new RoomService(ctx),
		codeRunService: new CodeRunService(ctx),
	};
	ctx.set('appFactory', appFactory);
	return next();
});

export const useAppFactory = (ctx: Context<AppContext>) => {
	return ctx.get('appFactory');
};
