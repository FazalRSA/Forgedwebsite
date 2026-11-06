import { lazy, type ComponentType } from 'react';

/**
 * Wraps React.lazy with a couple of retries before giving up. Covers the
 * common transient case (flaky mobile connection, momentary CDN blip) so a
 * dropped packet doesn't surface as a hard failure; a genuinely missing
 * chunk (e.g. a stale deploy referencing an old hash) still rejects after
 * the retries and reaches the nearest error boundary.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors React.lazy's own <T extends ComponentType<any>> signature
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2,
  delayMs = 500
) {
  return lazy(async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await factory();
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        }
      }
    }
    throw lastError;
  });
}
