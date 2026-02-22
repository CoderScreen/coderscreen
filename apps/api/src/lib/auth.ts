import * as schema from '@coderscreen/db/user.db';
import { BetterAuthOptions, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { createAuthMiddleware, organization } from 'better-auth/plugins';
import { desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { retryable } from '@/lib/utils';
import { BillingService } from '@/services/billing/Billing.service';
import { UsageService } from '@/services/billing/Usage.service';
import { ResendService } from '@/services/third-party/Resend.service';
import { betterAuthConfig } from '../../better-auth.config';

export const useAuth: (
  ctx: Context<AppContext>
) => ReturnType<typeof betterAuth<typeof betterAuthConfig>> = (ctx) => {
  const env = ctx.env;
  const db = useDb(ctx);
  const billingService = new BillingService(ctx);
  const usageService = new UsageService(ctx);
  const resendService = new ResendService(ctx);

  const options = {
    trustedOrigins: [env.FE_APP_URL],
    baseURL: env.INFISCAL_BETTER_AUTH_URL,
    secret: env.INFISCAL_BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    ...betterAuthConfig,
    // anything that needs db below this line
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await retryable(async () => {
              // check if user is invited to any organization, if so they dont need to be onboarded
              const db = useDb(ctx);
              const invitations = await db
                .select()
                .from(schema.invitation)
                .where(eq(schema.invitation.email, user.email))
                .limit(1);

              if (invitations.length === 0) {
                return;
              }

              // create user as onboarded
              await db
                .update(schema.user)
                .set({ isOnboarded: true })
                .where(eq(schema.user.id, user.id));
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
              .orderBy(desc(schema.member.createdAt))
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
        invitationLimit: async () => {
          const numMembers = await usageService.getCurrentUsage('team_members');
          return numMembers.limit;
        },
        sendInvitationEmail: async (data) => {
          const inviteLink = `${env.FE_APP_URL}/accept-invitation/${data.id}`;

          await resendService.sendTransactionalEmail('org_invitation', data.email, {
            invited_by_username: data.inviter.user.name,
            invited_by_email: data.inviter.user.email,
            org_name: data.organization.name,
            invite_link: inviteLink,
          });
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
        if (
          authCtx.path === '/organization/invite-member' ||
          authCtx.path === '/organizaiton/accept-invitation'
        ) {
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
          // biome-ignore lint/suspicious/noExplicitAny: setting so we dont have to perform another db fetch
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
        await resendService.sendTransactionalEmail('verification_code', data.user.email, {
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
