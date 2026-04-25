import { env } from '../../config/env.js';

class TestingClockService {
    private offsetDays = 0;

    getNow(): Date {
        const now = new Date();
        if (!this.isEnabled() || this.offsetDays === 0) return now;
        now.setDate(now.getDate() + this.offsetDays);
        return now;
    }

    getOffsetDays(): number {
        return this.offsetDays;
    }

    advanceDays(days: number): { enabled: boolean; offsetDays: number; now: string } {
        if (!this.isEnabled()) {
            return {
                enabled: false,
                offsetDays: this.offsetDays,
                now: new Date().toISOString(),
            };
        }
        this.offsetDays += Math.max(0, Math.floor(days));
        return this.getState();
    }

    reset(): { enabled: boolean; offsetDays: number; now: string } {
        this.offsetDays = 0;
        return this.getState();
    }

    getState(): { enabled: boolean; offsetDays: number; now: string } {
        return {
            enabled: this.isEnabled(),
            offsetDays: this.offsetDays,
            now: this.getNow().toISOString(),
        };
    }

    private isEnabled(): boolean {
        return env.NODE_ENV !== 'production';
    }
}

export const testingClockService = new TestingClockService();
export default testingClockService;
