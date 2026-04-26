const TESTING_CLOCK_NOW_KEY = 'homiTestingClockNowIso';
const TESTING_CLOCK_OFFSET_KEY = 'homiTestingClockOffsetDays';

export interface TestingClockSnapshot {
    now: string;
    offsetDays: number;
}

/**
 * Whether the simulated "test date" system is active in this client build.
 * Driven by `VITE_TEST_DATE` — when off, every helper here behaves as if no
 * cache exists, so date-sensitive screens fall back to the real system clock.
 */
export const isTestDateEnabled = (): boolean => {
    // import.meta.env values are baked in as string literals by Vite at build
    // time. Access them directly — do NOT use optional chaining on import.meta
    // itself, which can confuse the Vite static-analysis transform.
    return import.meta.env.VITE_TEST_DATE === 'true';
};

export const saveTestingClockSnapshot = (snapshot: TestingClockSnapshot): void => {
    if (!isTestDateEnabled()) return;
    localStorage.setItem(TESTING_CLOCK_NOW_KEY, snapshot.now);
    localStorage.setItem(TESTING_CLOCK_OFFSET_KEY, String(snapshot.offsetDays));
};

export const getTestingNowFromCache = (): Date | null => {
    if (!isTestDateEnabled()) return null;
    const nowIso = localStorage.getItem(TESTING_CLOCK_NOW_KEY);
    if (!nowIso) return null;
    const parsed = new Date(nowIso);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
};

export const clearTestingClockCache = (): void => {
    localStorage.removeItem(TESTING_CLOCK_NOW_KEY);
    localStorage.removeItem(TESTING_CLOCK_OFFSET_KEY);
};

/**
 * Single source of truth for "what is today" on the client.
 *
 * - When `VITE_TEST_DATE=true` AND a simulated snapshot is cached, returns the
 *   simulated date so every screen (rent dues, payment history, lease lifecycle
 *   labels, etc.) sees the same "today" the testing badge advertises.
 * - Otherwise returns the real wall-clock time.
 *
 * Always prefer this over `new Date()` / `Date.now()` for any date-sensitive
 * UI logic that should react to the testing clock.
 */
export const getEffectiveNow = (): Date => {
    return getTestingNowFromCache() ?? new Date();
};

// On startup, scrub any stale cache that may have been written by a previous
// build where TEST_DATE was enabled.
if (typeof window !== 'undefined' && !isTestDateEnabled()) {
    clearTestingClockCache();
}
