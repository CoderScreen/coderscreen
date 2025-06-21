import { z } from 'zod';

export const Entities = {
  room: 'r',
  user: 'u',
  organization: 'org_',
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
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = crypto.getRandomValues(new Uint8Array(10));
  const randomString = Array.from(randomValues)
    .map((value) => characters.charAt(value % characters.length))
    .join('');

  const entityPrefix = Entities[entity];
  return `${entityPrefix}_${randomString}` as Id<T>;
};
