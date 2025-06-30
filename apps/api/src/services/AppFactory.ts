import { Context } from 'hono';
import { AppContext } from '..';
import { RoomService } from './Room.service';
import { createMiddleware } from 'hono/factory';
import { CodeRunService } from './CodeRun.service';
import { AssetService } from './Asset.service';

export interface AppFactory {
	roomService: RoomService;
	codeRunService: CodeRunService;
	assetService: AssetService;
}

export const appFactoryMiddleware = createMiddleware(async (ctx, next) => {
	const appFactory: AppFactory = {
		roomService: new RoomService(ctx),
		codeRunService: new CodeRunService(ctx),
		assetService: new AssetService(ctx),
	};
	ctx.set('appFactory', appFactory);
	return next();
});

export const useAppFactory = (ctx: Context<AppContext>) => {
	return ctx.get('appFactory');
};
