/**
 * StudioNet currently allows 30 RPC requests/minute. Keep a conservative 24 RPM
 * per browser identity, serialize writes, and coalesce duplicate reads. This is
 * client-side protection; production-wide enforcement needs an RPC provider plan.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 24;
let requestTimes: number[] = [];
let tail: Promise<unknown> = Promise.resolve();
const pending = new Map<string, Promise<unknown>>();

function nextDelay(): number {
  const now = Date.now();
  requestTimes = requestTimes.filter((time) => now - time < WINDOW_MS);
  return requestTimes.length < MAX_REQUESTS ? 0 : WINDOW_MS - (now - requestTimes[0]) + 50;
}

export function queuedRequest<T>(run: () => Promise<T>): Promise<T> {
  const execute = async () => {
    const delay = nextDelay();
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    requestTimes.push(Date.now());
    return run();
  };
  const result = tail.then(execute, execute) as Promise<T>;
  tail = result.then(() => undefined, () => undefined);
  return result;
}

export function dedupedRequest<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = pending.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const request = queuedRequest(run);
  pending.set(key, request);
  request.finally(() => pending.delete(key)).catch(() => undefined);
  return request;
}

export async function retryRateLimited<T>(run: () => Promise<T>, attempts = 4): Promise<T> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { return await queuedRequest(run); }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/rate limit|429/i.test(message) || attempt === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1_000 * 2 ** attempt));
    }
  }
  throw new Error("Unreachable rate-limit retry state.");
}
