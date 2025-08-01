/**
 * debounce
 * Returns a debounced version of the provided function.
 * The debounced function will only be called after the specified delay has elapsed
 * since the last time it was invoked.
 *
 * @param fn - The function to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns A debounced function
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
