import { useCallback, useEffect, useState } from 'react';
import { FaForward, FaUndo } from 'react-icons/fa';
import contractService from '../../services/contract.service';
import './TestingClockBadge.css';

const formatDateLabel = (iso: string): string => {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const TestingClockBadge = () => {
    const [now, setNow] = useState<string>('');
    const [offsetDays, setOffsetDays] = useState<number>(0);
    const [isBusy, setIsBusy] = useState<boolean>(false);
    const [lastError, setLastError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            const state = await contractService.getTestingClock();
            setNow(state.now);
            setOffsetDays(Number(state.offsetDays ?? 0));
        } catch {
            // ignore - badge stays hidden if API not reachable
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const handleAdvance = async () => {
        if (isBusy) return;
        setIsBusy(true);
        setLastError(null);
        try {
            const state = await contractService.advanceTestingClock(15);
            setNow(state.now);
            setOffsetDays(Number(state.offsetDays ?? 0));
            globalThis.dispatchEvent(new CustomEvent('homi:testing-clock-changed', {
                detail: { now: state.now, offsetDays: state.offsetDays },
            }));
        } catch (err: any) {
            setLastError(err?.response?.data?.message ?? 'Could not advance time.');
        } finally {
            setIsBusy(false);
        }
    };

    const handleReset = async () => {
        if (isBusy || offsetDays <= 0) return;
        setIsBusy(true);
        setLastError(null);
        try {
            const state = await contractService.resetTestingClock();
            setNow(state.now);
            setOffsetDays(Number(state.offsetDays ?? 0));
            globalThis.dispatchEvent(new CustomEvent('homi:testing-clock-changed', {
                detail: { now: state.now, offsetDays: state.offsetDays },
            }));
        } catch (err: any) {
            setLastError(err?.response?.data?.message ?? 'Could not reset time.');
        } finally {
            setIsBusy(false);
        }
    };

    if (!now) return null;

    return (
        <div className="testing-clock-badge" title={lastError ?? 'Simulated date for testing — affects rentals, payments, and maintenance.'}>
            <div className="testing-clock-meta">
                <span className="testing-clock-label">Test Date</span>
                <span className="testing-clock-value">
                    {formatDateLabel(now)}
                    {offsetDays > 0 ? <span className="testing-clock-offset"> +{offsetDays}d</span> : null}
                </span>
            </div>
            <div className="testing-clock-actions">
                <button
                    type="button"
                    className="testing-clock-btn advance"
                    onClick={handleAdvance}
                    disabled={isBusy}
                    aria-label="Advance test clock by 15 days"
                >
                    <FaForward /> +15d
                </button>
                <button
                    type="button"
                    className="testing-clock-btn reset"
                    onClick={handleReset}
                    disabled={isBusy || offsetDays <= 0}
                    aria-label="Reset test clock"
                >
                    <FaUndo /> Reset
                </button>
            </div>
        </div>
    );
};

export default TestingClockBadge;
