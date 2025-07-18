import { pgTable, text, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';
import { organization } from './user.db';
import { Id } from '@coderscreen/common/id';

export const customerTable = pgTable('customers', {
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' })
    .primaryKey(),
  createdAt: timestamp('created_at', { mode: 'string' })
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  email: text('email').notNull(),
});

export const planTable = pgTable('plans', {
  id: text('id').primaryKey().$type<Id<'plan'>>(),
  createdAt: timestamp('created_at', { mode: 'string' })
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  stripePriceId: text('stripe_price_id').unique().notNull(),
  price: decimal('price', { precision: 10, scale: 2 }),
  interval: text('interval'), // monthly, yearly
  isActive: boolean('is_active').default(true).notNull(),
});

export const subscriptionTable = pgTable('subscriptions', {
  id: text('id').primaryKey().$type<Id<'subscription'>>(),
  createdAt: timestamp('created_at', { mode: 'string' })
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  planId: text('plan_id')
    .notNull()
    .references(() => planTable.id),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  status: text('status').notNull(), // active, canceled, past_due, etc.
  currentPeriodStart: timestamp('current_period_start', { mode: 'string' }),
  currentPeriodEnd: timestamp('current_period_end', { mode: 'string' }),
});

export type CustomerEntity = typeof customerTable.$inferSelect;
export type PlanEntity = typeof planTable.$inferSelect;
export type SubscriptionEntity = typeof subscriptionTable.$inferSelect;
