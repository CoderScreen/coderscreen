import { Context } from 'hono';
import { AppContext } from '../index';

export const getSession = (ctx: Context<AppContext>, options?: { noActiveOrg?: boolean }) => {
  const user = ctx.get('user');
  const session = ctx.get('session');

  if (!user) {
    throw new Error('User not found in context');
  }

  if (!session) {
    throw new Error('Session not found in context');
  }

  if (!session.activeOrganizationId && !options?.noActiveOrg) {
    throw new Error('Active organization not found in session');
  }

  return {
    user,
    session,
    orgId: session.activeOrganizationId!,
  };
};
