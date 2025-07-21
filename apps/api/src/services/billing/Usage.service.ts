import { eq, and, sql, count } from 'drizzle-orm';
import { generateId } from '@coderscreen/common/id';
import { useDb } from '@/db/client';
import { Context } from 'hono';
import { AppContext } from '@/index';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  eventLogTable,
  EventLogEntity,
  EventType,
  eventUsageTable,
  EventUsageEntity,
} from '@coderscreen/db/usage.db';
import { getBilling, getSession } from '@/lib/session';
import { member } from '@coderscreen/db/user.db';
import { PlanEntity, SubscriptionEntity } from '@coderscreen/db/billing.db';

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
 * if (result.exceeded) {
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
  metadata?: Record<string, any>;
}

export interface UsageResult {
  eventType: AllUsageTypes;
  count: number;
  limit: number;
  exceeded: boolean;
}

export class UsageService {
  private readonly db: PostgresJsDatabase;

  constructor(private readonly ctx: Context<AppContext>) {
    this.db = useDb(ctx);
  }

  /**
   * Track an event and check if it exceeds the limit
   * This is the main method you'll call whenever a billable event occurs
   */
  async trackEvent(params: TrackEventParams): Promise<UsageResult> {
    const { eventType, resource, amount = 1, metadata } = params;
    const { orgId, user } = getSession(this.ctx);

    // Get or create usage record for current cycle
    const usage = await this.getOrCreateUsage(eventType);

    // Check if already or will be exceeded
    if (usage.count + amount >= usage.limit) {
      return {
        eventType: usage.eventType,
        count: usage.count,
        limit: usage.limit,
        exceeded: true,
      };
    }

    await Promise.all([
      this.incrementUsage(orgId, eventType, amount),
      this.logEvent({
        organizationId: orgId,
        eventType,
        amount,
        userId: user.id,
        metadata: {
          ...metadata,
          resource,
        },
      }),
    ]);
    return {
      ...usage,
      count: usage.count + amount,
      exceeded: usage.count + amount >= usage.limit,
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
      team_members: getFallBackUsage('team_members'),
    };

    await Promise.all(
      (Object.keys(result) as AllUsageTypes[]).map(async (eventType) => {
        try {
          result[eventType] = await this.getOrCreateUsage(eventType);
        } catch (err) {
          // Optionally log error, fallback to default
          // console.error(`Failed to get usage for ${eventType}:`, err);
          // Leave the fallback value as is
        }
      })
    );

    return result;
  }

  /**
   * Get or create usage record for current billing cycle
   */
  private async getOrCreateUsage(rawEventType: AllUsageTypes): Promise<UsageResult> {
    const { orgId } = getSession(this.ctx);

    if (CUSTOM_USAGE_EVENT_TYPES.includes(rawEventType as CustomUsageType)) {
      return this.getCustomUsage(rawEventType as CustomUsageType);
    }

    const eventType = rawEventType as EventType;
    const cycleStart = await this.getCycleStart();

    // Try to get existing usage
    const existing = await this.db
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
        exceeded: existing.count >= existing.limit,
      };
    }

    const billing = await getBilling(this.ctx);

    // Create new usage record with default limits
    const newUsage: EventUsageEntity = {
      id: generateId('eventUsage'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: orgId,
      eventType,
      count: 0,
      limit: billing.plan.limits[eventType],
      cycleStart,
    };

    await this.db.insert(eventUsageTable).values(newUsage);
    return {
      eventType,
      count: newUsage.count,
      limit: billing.plan.limits[eventType],
      exceeded: false,
    };
  }

  /**
   * Increment usage count atomically
   */
  private async incrementUsage(orgId: string, rawEventType: AllUsageTypes, amount: number) {
    // if eventType is a custom usage type, we don't increment since tracked in a custom way
    if (CUSTOM_USAGE_EVENT_TYPES.includes(rawEventType as CustomUsageType)) {
      return;
    }

    const eventType = rawEventType as EventType;
    const cycleStart = await this.getCycleStart();

    await this.db
      .update(eventUsageTable)
      .set({
        count: sql`${eventUsageTable.count} + ${amount}`,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(eventUsageTable.organizationId, orgId),
          eq(eventUsageTable.eventType, eventType),
          eq(eventUsageTable.cycleStart, cycleStart)
        )
      );
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
  private async logEvent(params: Omit<EventLogEntity, 'id' | 'createdAt'>) {
    const logEntry = {
      id: generateId('eventLog'),
      createdAt: new Date().toISOString(),
      ...params,
    };

    await this.db.insert(eventLogTable).values(logEntry);
  }

  private async getCustomUsage(eventType: CustomUsageType): Promise<UsageResult> {
    const { plan: currentPlan } = await getBilling(this.ctx);
    switch (eventType) {
      case 'team_members':
        const { orgId } = getSession(this.ctx);
        const memberCount = await this.db
          .select({
            count: count(member.id),
          })
          .from(member)
          .where(eq(member.organizationId, orgId))
          .then((res) => res[0]);

        const limit = currentPlan.limits['team_members'];

        return {
          eventType: 'team_members',
          count: memberCount.count,
          limit,
          exceeded: memberCount.count >= limit,
        };
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
