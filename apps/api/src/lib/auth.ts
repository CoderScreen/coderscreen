import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import { AppContext } from '@/index';
import { Context } from 'hono';
import * as schema from '@coderscreen/db/user.db';
import { betterAuthConfig } from '../../better-auth.config';
import { useDb } from '@/db/client';
import { organization } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { BillingService } from '@/services/billing/Billing.service';

export const useAuth: (
  ctx: Context<AppContext>
) => ReturnType<typeof betterAuth<typeof betterAuthConfig>> = (ctx) => {
  const env = ctx.env;
  const db = useDb(ctx);
  const billingService = new BillingService(ctx);

  const options = {
    trustedOrigins: [env.FE_APP_URL],
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    ...betterAuthConfig,

    // anything that needs db below this line
    databaseHooks: {
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
    user: betterAuthConfig.user,
  } satisfies BetterAuthOptions;

  return betterAuth(options);
};
