/**
 * Prevents hung Supabase auth or network calls from blocking UI indefinitely.
 */

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  onTimeout: () => T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(onTimeout()), ms);
    }),
  ]);
}

/** Use with `Promise.race` so slow requests fail instead of loading forever. */
export function rejectAfter(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}
