import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { ResendService } from '@/services/third-party/Resend.service';
import { AppContext } from '..';
import { AssetService } from './Asset.service';
import { CodeRunService } from './CodeRun.service';
import { RoomService } from './Room.service';

export interface AppFactory {
  resendService: ResendService;
  roomService: RoomService;
  codeRunService: CodeRunService;
  assetService: AssetService;
}

export const appFactoryMiddleware = createMiddleware(async (ctx, next) => {
  const appFactory: AppFactory = {
    resendService: new ResendService(ctx),
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
