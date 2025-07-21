import { Context } from 'hono';

/**
 * Retry a function if it fails
 * @param fn - The function to retry
 * @param retries - The number of times to retry
 * @param delay - The delay between retries
 * @returns The result of the function
 */
export const retryable = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  return fn().catch((error) => {
    if (retries > 0) {
      return retryable(fn, retries - 1, delay * 2);
    }
    throw error;
  });
};

/**
 * Used to store data in context so reusable across whole request
 * @param ctx - The context
 * @param key - The key to store the data in
 * @param fn - The function to execute
 * @returns The result of the function
 */
export const withContext = async (ctx: Context, key: string, fn: () => Promise<any>) => {
  const cache = await ctx.var.get(key);
  if (cache) {
    return cache;
  }

  const result = await fn();
  await ctx.var.put(key, result);
  return result;
};
