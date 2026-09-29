import { generateId } from '@coderscreen/common/id';
import { PlanEntity, SubscriptionEntity } from '@coderscreen/db/billing.db';
import {
  EventLogEntity,
  EventType,
  EventUsageEntity,
  eventLogTable,
  eventUsageTable,
} from '@coderscreen/db/usage.db';
import { member } from '@coderscreen/db/user.db';
import { and, count, eq, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { getBilling, getSession } from '@/lib/session';

/**
 * Simplified Usage Tracking Service
 *
 * Usage example:
 *
 * const usageService = new UsageService(ctx);
 *
 * // Track a live interview
 * const result = await usageService.trackEvent({
 *   eventType: eventTypes.LIVE_INTERVIEW,
 *   resource: { id: 'room_123' },
 *   metadata: { duration: 30 }
 * });
 *
 * if (!result.allowed) {
 *   // Handle limit exceeded
 *   throw new Error('Interview limit reached');
 * }
 *
 * // Check current usage
 * const usage = await usageService.getCurrentUsage(eventTypes.TEAM_MEMBERS);
 * console.log(`${usage.currentCount}/${usage.limit} team members used`);
 */

const CUSTOM_USAGE_EVENT_TYPES = ['team_members'] as const;
export type CustomUsageType = (typeof CUSTOM_USAGE_EVENT_TYPES)[number];
export type AllUsageTypes = EventType | CustomUsageType;

export interface TrackEventParams {
  eventType: EventType;
  resource?: {
    id: string;
    type?: string;
  };
  amount?: number;
  metadata?: Record<string, unknown>;
}

export interface UsageResult {
  eventType: AllUsageTypes;
  count: number;
  // -1 means unlimited
  limit: number;
  // true once count has reached the limit
  exceeded: boolean;
}

export interface TrackEventResult extends UsageResult {
  // false when the event would go over the limit (nothing is recorded)
  allowed: boolean;
}

// The base db or a transaction, so usage can be tracked atomically with the caller's writes
type DbExecutor = Pick<PostgresJsDatabase, 'select' | 'insert' | 'update'>;

const isLimitReached = (count: number, limit: number) => limit >= 0 && count >= limit;

export class UsageService {
  private readonly db: PostgresJsDatabase;

  constructor(private readonly ctx: Context<AppContext>) {
    this.db = useDb(ctx);
  }

  /**
   * Track an event and check if it exceeds the limit
   * This is the main method you'll call whenever a billable event occurs
   */
  async trackEvent(params: TrackEventParams, db: DbExecutor = this.db): Promise<TrackEventResult> {
    const { eventType, resource, amount = 1, metadata } = params;
    const { orgId, user } = getSession(this.ctx);

    // Make sure the usage row for this cycle exists before incrementing it
    const usage = await this.getOrCreateUsage(eventType, db);
    const cycleStart = await this.getCycleStart();

    // Check and increment atomically so concurrent requests can't exceed the limit
    const updated = await db
      .update(eventUsageTable)
      .set({
        count: sql`${eventUsageTable.count} + ${amount}`,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(eventUsageTable.organizationId, orgId),
          eq(eventUsageTable.eventType, eventType),
          eq(eventUsageTable.cycleStart, cycleStart),
          sql`(${eventUsageTable.limit} < 0 OR ${eventUsageTable.count} + ${amount} <= ${eventUsageTable.limit})`
        )
      )
      .returning({ count: eventUsageTable.count, limit: eventUsageTable.limit })
      .then((res) => (res.length > 0 ? res[0] : null));

    if (!updated) {
      return { ...usage, exceeded: true, allowed: false };
    }

    await this.logEvent(db, {
      organizationId: orgId,
      eventType,
      amount,
      userId: user.id,
      metadata: {
        ...metadata,
        resource,
      },
    });

    return {
      eventType,
      count: updated.count,
      limit: updated.limit,
      exceeded: isLimitReached(updated.count, updated.limit),
      allowed: true,
    };
  }

  /**
   * Get current usage for an event type
   */
  async getCurrentUsage(eventType: AllUsageTypes): Promise<UsageResult> {
    return this.getOrCreateUsage(eventType);
  }

  async getAllUsage(): Promise<{
    [key in AllUsageTypes]: UsageResult;
  }> {
    const getFallBackUsage = (eventType: AllUsageTypes) => ({
      eventType,
      count: 0,
      limit: -1,
      exceeded: false,
    });

    const result: {
      [key in AllUsageTypes]: UsageResult;
    } = {
      live_interview: getFallBackUsage('live_interview'),
      assessment_invite: getFallBackUsage('assessment_invite'),
      team_members: getFallBackUsage('team_members'),
    };

    await Promise.all(
      (Object.keys(result) as AllUsageTypes[]).map(async (eventType) => {
        try {
          result[eventType] = await this.getOrCreateUsage(eventType);
        } catch (err) {
          console.error(`Failed to get usage for ${eventType}:`, err);
        }
      })
    );

    return result;
  }

  /**
   * Get or create usage record for current billing cycle
   */
  private async getOrCreateUsage(
    rawEventType: AllUsageTypes,
    db: DbExecutor = this.db
  ): Promise<UsageResult> {
    const { orgId } = getSession(this.ctx);

    if (CUSTOM_USAGE_EVENT_TYPES.includes(rawEventType as CustomUsageType)) {
      return this.getCustomUsage(rawEventType as CustomUsageType);
    }

    const eventType = rawEventType as EventType;
    const cycleStart = await this.getCycleStart();

    // Try to get existing usage
    const existing = await db
      .select()
      .from(eventUsageTable)
      .where(
        and(
          eq(eventUsageTable.organizationId, orgId),
          eq(eventUsageTable.eventType, eventType),
          eq(eventUsageTable.cycleStart, cycleStart)
        )
      )
      .then((res) => (res.length > 0 ? res[0] : null));

    if (existing) {
      return {
        eventType,
        count: existing.count,
        limit: existing.limit,
        exceeded: isLimitReached(existing.count, existing.limit),
      };
    }

    const billing = await getBilling(this.ctx);
    // Plans without a limit for this type are treated as unlimited
    const limit = billing.plan.limits[eventType] ?? -1;

    // Create new usage record with default limits
    const newUsage: EventUsageEntity = {
      id: generateId('eventUsage'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: orgId,
      eventType,
      count: 0,
      limit,
      cycleStart,
    };

    // A concurrent request may have created the row first; that row wins
    await db.insert(eventUsageTable).values(newUsage).onConflictDoNothing();
    return {
      eventType,
      count: newUsage.count,
      limit,
      exceeded: isLimitReached(newUsage.count, limit),
    };
  }

  /**
   * Get current billing cycle start date
   */
  private async getCycleStart(): Promise<string> {
    const { subscription } = await getBilling(this.ctx);
    return subscription.currentPeriodStart;
  }

  /**
   * Log event for analytics (optional)
   */
  private async logEvent(db: DbExecutor, params: Omit<EventLogEntity, 'id' | 'createdAt'>) {
    const logEntry = {
      id: generateId('eventLog'),
      createdAt: new Date().toISOString(),
      ...params,
    };

    await db.insert(eventLogTable).values(logEntry);
  }

  private async getCustomUsage(eventType: CustomUsageType): Promise<UsageResult> {
    const { plan: currentPlan } = await getBilling(this.ctx);
    switch (eventType) {
      case 'team_members': {
        const { orgId } = getSession(this.ctx);
        const memberCount = await this.db
          .select({
            count: count(member.id),
          })
          .from(member)
          .where(eq(member.organizationId, orgId))
          .then((res) => res[0]);

        const limit = currentPlan.limits.team_members;

        return {
          eventType: 'team_members',
          count: memberCount.count,
          limit,
          exceeded: isLimitReached(memberCount.count, limit),
        };
      }
      default:
        throw new Error(`Unknown custom usage type: ${eventType}`);
    }
  }

  async updateUsageLimits(params: {
    limits: PlanEntity['limits'];
    subscription: SubscriptionEntity;
    orgId: string;
  }) {
    const { limits, subscription, orgId } = params;

    // upsert eventUsageTable entites with new limits
    const newUsages: EventUsageEntity[] = Object.entries(limits).map(([eventType, limit]) => ({
      id: generateId('eventUsage'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: orgId,
      eventType: eventType as EventType,
      limit,
      count: 0,
      cycleStart: subscription.currentPeriodStart,
    }));

    await this.db
      .insert(eventUsageTable)
      .values(newUsages)
      .onConflictDoUpdate({
        target: [
          eventUsageTable.organizationId,
          eventUsageTable.eventType,
          eventUsageTable.cycleStart,
        ],
        set: {
          limit: sql`excluded.limit`,
        },
      });
  }
}
