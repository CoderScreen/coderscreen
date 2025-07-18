// import { eq, and, sql } from 'drizzle-orm';
// import { generateId } from '@coderscreen/common/id';
// import { useDb } from '@/db/client';
// import { Context } from 'hono';
// import { AppContext } from '@/index';
// import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
// import {
//   usageTable,
//   eventLogTable,
//   UsageEntity,
//   EventLogEntity,
//   EventType,
//   eventTypes,
// } from '@coderscreen/db/usage.db';
// import { getSession, useBilling } from '@/lib/session';
// import { HTTPException } from 'hono/http-exception';

// /**
//  * Simplified Usage Tracking Service
//  *
//  * Usage example:
//  *
//  * const usageService = new UsageService(ctx);
//  *
//  * // Track a live interview
//  * const result = await usageService.trackEvent({
//  *   eventType: eventTypes.LIVE_INTERVIEW,
//  *   resource: { id: 'room_123' },
//  *   metadata: { duration: 30 }
//  * });
//  *
//  * if (result.exceeded) {
//  *   // Handle limit exceeded
//  *   throw new Error('Interview limit reached');
//  * }
//  *
//  * // Check current usage
//  * const usage = await usageService.getCurrentUsage(eventTypes.TEAM_MEMBERS);
//  * console.log(`${usage.currentCount}/${usage.limit} team members used`);
//  */

// export interface TrackEventParams {
//   eventType: EventType;
//   resource?: {
//     id: string;
//     type?: string;
//   };
//   amount?: number;
//   metadata?: Record<string, any>;
// }

// export interface UsageResult {
//   eventType: EventType;
//   count: number;
//   limit: number;
//   exceeded: boolean;
// }

// export class UsageService {
//   private readonly db: PostgresJsDatabase;

//   constructor(private readonly ctx: Context<AppContext>) {
//     this.db = useDb(ctx);
//   }

//   /**
//    * Track an event and check if it exceeds the limit
//    * This is the main method you'll call whenever a billable event occurs
//    */
//   async trackEvent(params: TrackEventParams): Promise<UsageResult> {
//     const { eventType, resource, amount = 1, metadata } = params;
//     const { orgId, user } = getSession(this.ctx);

//     // Get or create usage record for current cycle
//     const usage = await this.getOrCreateUsage(eventType);

//     // Check if already exceeded
//     if (usage.currentCount >= usage.limit) {
//       return {
//         eventType: usage.eventType,
//         count: usage.currentCount,
//         limit: usage.limit,
//         exceeded: true,
//       };
//     }

//     // Increment the usage count
//     await this.incrementUsage(orgId, eventType, amount);

//     // Log the event (optional - can be disabled for performance)
//     await this.logEvent({
//       organizationId: orgId,
//       eventType,
//       amount,
//       userId: user.id,
//       resourceId: resource?.id ?? null,
//       metadata: metadata || {},
//     });

//     // Return the updated usage
//     return {
//       ...usage,
//       currentCount: usage.currentCount + amount,
//       exceeded: usage.currentCount + amount >= usage.limit,
//     };
//   }

//   /**
//    * Get current usage for an event type
//    */
//   async getCurrentUsage(eventType: EventType): Promise<UsageResult> {
//     const { orgId } = getSession(this.ctx);
//     const usage = await this.getOrCreateUsage(eventType);

//     return {
//       eventType: usage.eventType,
//       count: usage.currentCount,
//       limit: usage.limit,
//       exceeded: usage.currentCount >= usage.limit,
//     };
//   }

//   /**
//    * Get or create usage record for current billing cycle
//    */
//   private async getOrCreateUsage(eventType: EventType): Promise<UsageEntity> {
//     const { orgId } = getSession(this.ctx);
//     const cycleStart = await this.getCycleStart();

//     // Try to get existing usage
//     const existing = await this.db
//       .select()
//       .from(usageTable)
//       .where(
//         and(
//           eq(usageTable.organizationId, orgId),
//           eq(usageTable.eventType, eventType),
//           eq(usageTable.cycleStart, cycleStart)
//         )
//       )
//       .then((res) => res[0]);

//     if (existing) {
//       return existing;
//     }

//     // Create new usage record with default limits
//     const defaultLimits = this.getDefaultLimits(eventType);
//     const newUsage = {
//       id: generateId('usage'),
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       organizationId: orgId,
//       eventType,
//       currentCount: 0,
//       limit: defaultLimits.limit,
//       cycleStart,
//       cycleEnd,
//     };

//     await this.db.insert(usageTable).values(newUsage);
//     return newUsage;
//   }

//   /**
//    * Increment usage count atomically
//    */
//   private async incrementUsage(orgId: string, eventType: EventType, amount: number) {
//     const cycleStart = await this.getCycleStart();

//     await this.db
//       .update(usageTable)
//       .set({
//         currentCount: sql`${usageTable.currentCount} + ${amount}`,
//         updatedAt: new Date().toISOString(),
//       })
//       .where(
//         and(
//           eq(usageTable.organizationId, orgId),
//           eq(usageTable.eventType, eventType),
//           eq(usageTable.cycleStart, cycleStart)
//         )
//       );
//   }

//   /**
//    * Get current billing cycle start date
//    */
//   private async getCycleStart(): Promise<string> {
//     // TODO: fix this function
//     const { subscription } = await useBilling(this.ctx);
//     return subscription.currentPeriodStart!;
//   }

//   /**
//    * Get default limits for event types
//    */
//   private getDefaultLimits(eventType: EventType) {
//     const limits = {
//       live_interview: { limit: 100 },
//       team_members: { limit: 10 },
//       code_executions: { limit: 1000 },
//       ai_chat_messages: { limit: 500 },
//     };
//     return limits[eventType] || { limit: 100 };
//   }

//   /**
//    * Log event for analytics (optional)
//    */
//   private async logEvent(params: Omit<EventLogEntity, 'id' | 'createdAt'>) {
//     const logEntry = {
//       id: generateId('eventLog'),
//       createdAt: new Date().toISOString(),
//       ...params,
//     };

//     await this.db.insert(eventLogTable).values(logEntry);
//   }
// }
