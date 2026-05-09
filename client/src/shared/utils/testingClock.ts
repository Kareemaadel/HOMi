const TESTING_CLOCK_NOW_KEY = 'homiTestingClockNowIso';
const TESTING_CLOCK_OFFSET_KEY = 'homiTestingClockOffsetDays';

export interface TestingClockSnapshot {
    now: string;
    offsetDays: number;
}

export const saveTestingClockSnapshot = (snapshot: TestingClockSnapshot): void => {
    localStorage.setItem(TESTING_CLOCK_NOW_KEY, snapshot.now);
    localStorage.setItem(TESTING_CLOCK_OFFSET_KEY, String(snapshot.offsetDays));
};

export const getTestingNowFromCache = (): Date | null => {
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
 * When a simulated snapshot is cached (set by the testing clock badge after
 * clicking +5d), returns the simulated date so every screen (rent dues,
 * payment history, lease lifecycle labels, etc.) sees the same "today" the
 * testing badge advertises.
 *
 * After clicking Reset, the cache is cleared and this returns the real clock.
 *
 * Always prefer this over `new Date()` / `Date.now()` for any date-sensitive
 * UI logic that should react to the testing clock.
 */
export const getEffectiveNow = (): Date => {
    return getTestingNowFromCache() ?? new Date();
};
