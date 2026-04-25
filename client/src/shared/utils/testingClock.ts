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
