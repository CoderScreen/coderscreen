import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { AppContext } from '..';
import { AssetService } from './Asset.service';
import { CodeRunService } from './CodeRun.service';
import { RoomService } from './Room.service';

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
