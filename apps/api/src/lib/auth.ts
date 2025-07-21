import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import { APIError } from 'better-auth/api';
import { AppContext } from '@/index';
import { Context } from 'hono';
import * as schema from '@coderscreen/db/user.db';
import { betterAuthConfig } from '../../better-auth.config';
import { useDb } from '@/db/client';
import { createAuthMiddleware, organization } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { BillingService } from '@/services/billing/Billing.service';
import { UsageService } from '@/services/billing/Usage.service';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { LoopsService } from '@/services/third-party/Loops.service';

export const useAuth: (
  ctx: Context<AppContext>
) => ReturnType<typeof betterAuth<typeof betterAuthConfig>> = (ctx) => {
  const env = ctx.env;
  const db = useDb(ctx);
  const billingService = new BillingService(ctx);
  const usageService = new UsageService(ctx);
  const loopsService = new LoopsService(ctx);

  const options = {
    trustedOrigins: [env.FE_APP_URL],
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    ...betterAuthConfig,
    // anything that needs db below this line
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await loopsService.createContact({
              email: user.email,
              name: user.name,
            });
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            const db = useDb(ctx);
            // get first organization id
            const member = await db
              .select()
              .from(schema.member)
              .where(eq(schema.member.userId, session.userId))
              .limit(1)
              .then((res) => res[0]);

            const activeOrganizationId = member?.organizationId;

            return {
              data: {
                ...session,
                activeOrganizationId,
              },
            };
          },
        },
      },
    },

    plugins: [
      organization({
        invitationLimit: async (data) => {
          const numMembers = await usageService.getCurrentUsage('team_members');

          return numMembers.limit;
        },

        organizationCreation: {
          afterCreate: async ({ user: orgUser, organization: org }) => {
            const db = useDb(ctx);

            // update user to set isOnboarded to true
            await db
              .update(schema.user)
              .set({ isOnboarded: true })
              .where(eq(schema.user.id, orgUser.id));

            // Create customer for the organization
            await billingService.createCustomerForOrganization({
              organizationId: org.id,
              email: orgUser.email,
            });
          },
        },
      }),
    ],
    hooks: {
      before: createAuthMiddleware(async (authCtx) => {
        if (authCtx.path === '/organization/invite-member') {
          const sessionCookieToken = await authCtx.getSignedCookie(
            authCtx.context.authCookies.sessionToken.name,
            authCtx.context.secret
          );
          if (!sessionCookieToken) {
            throw new APIError('BAD_REQUEST', {
              message: 'Invalid session token',
            });
          }

          const session = await getSessionManual({ token: sessionCookieToken, db });
          ctx.set('user', {} as any);
          ctx.set('session', session);

          const usageResult = await usageService.getCurrentUsage('team_members');

          if (usageResult.exceeded) {
            throw new APIError('BAD_REQUEST', {
              message: 'You are not allowed to invite members to this organization',
            });
          }
        }

        return;
      }),
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async (data) => {
        await loopsService.sendTransactionalEmail('verification_code', data.user.email, {
          verification_url: data.url,
        });
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(options);
};

const getSessionManual = async (params: { token: string; db: PostgresJsDatabase }) => {
  const { token, db } = params;

  const session = await db
    .select()
    .from(schema.session)
    .where(eq(schema.session.token, token))
    .then((res) => (res.length > 0 ? res[0] : null));

  if (!session) {
    throw new APIError('BAD_REQUEST', {
      message: 'Invalid session token',
    });
  }

  return session;
};
