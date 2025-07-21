import { z } from 'zod';
import { nanoid } from 'nanoid';

export const Entities = {
  room: 'r',
  room_content: 'rc',
  asset: 'a',
  template: 't',
  llmMessage: 'lm',
  customer: 'c',
  plan: 'p',
  subscription: 's',
  eventUsage: 'eu',
  eventUsageType: 'eut',
  eventLog: 'el',
} as const;

type Entities = typeof Entities;

type IdsWithPrefixes = {
  [key in keyof Entities]: `${Entities[key]}_${string}`;
};

export type Id<T extends keyof Entities> = IdsWithPrefixes[T];

export const idString = <T extends keyof Entities>(
  entity: T
): z.ZodType<Id<T>, z.ZodTypeDef, string> => {
  return z
    .string()
    .regex(
      new RegExp(`^${Entities[entity]}_.+`),
      `Invalid ID: must start with ${Entities[entity]}_`
    )
    .transform((id: string) => id as Id<T>);
};

export const generateId = <T extends keyof Entities>(entity: T): Id<T> => {
  return `${Entities[entity]}_${nanoid()}` as Id<T>;
};
