import type { LandlordContract } from '../../../services/contract.service';
import { getTestingNowFromCache } from '../../../shared/utils/testingClock';

export interface RentCycleSummary {
    dueDate: Date;
    nextDueDate: Date;
    daysUntilDue: number;
    isPaidForCurrentCycle: boolean;
}

export interface RentInstallmentStats {
    dueCount: number;
    overdueCount: number;
}

const getDueDay = (rentDueDate: LandlordContract['rentDueDate'], reference: Date): number => {
    if (rentDueDate === '5TH_OF_MONTH') return 5;
    if (rentDueDate === 'LAST_DAY_OF_MONTH') {
        return new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
    }
    return 1;
};

const getCycleDueDate = (contract: LandlordContract, reference: Date): Date => {
    const day = getDueDay(contract.rentDueDate, reference);
    return new Date(reference.getFullYear(), reference.getMonth(), day);
};

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const isWithinNextDays = (from: Date, target: Date, days: number): boolean => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const deltaDays = Math.ceil((target.getTime() - from.getTime()) / msPerDay);
    return deltaDays >= 0 && deltaDays <= days;
};

const getNow = (nowInput?: Date): Date => {
    const cached = getTestingNowFromCache();
    return nowInput ? startOfDay(nowInput) : startOfDay(cached ?? new Date());
};

export const getRentCycleSummary = (contract: LandlordContract, nowInput?: Date): RentCycleSummary => {
    const now = getNow(nowInput);
    const baseCycleDue = getCycleDueDate(contract, now);
    const currentCycleDue = baseCycleDue < now
        ? getCycleDueDate(contract, new Date(now.getFullYear(), now.getMonth() + 1, 1))
        : baseCycleDue;
    const previousCycleDue = getCycleDueDate(contract, new Date(currentCycleDue.getFullYear(), currentCycleDue.getMonth() - 1, 1));
    const nextCycleDue = getCycleDueDate(contract, new Date(currentCycleDue.getFullYear(), currentCycleDue.getMonth() + 1, 1));
    const paidAt = contract.paymentVerifiedAt ? startOfDay(new Date(contract.paymentVerifiedAt)) : null;
    const isPaidForCurrentCycle = Boolean(paidAt && paidAt >= previousCycleDue && paidAt < nextCycleDue);

    const dueDate = isPaidForCurrentCycle ? nextCycleDue : currentCycleDue;
    const followingDueDate = getCycleDueDate(contract, new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 1));
    const daysUntilDue = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
        dueDate,
        nextDueDate: followingDueDate,
        daysUntilDue,
        isPaidForCurrentCycle,
    };
};

/**
 * Mirror of the server's `getPrepaidInstallmentsCount`.
 *
 * The activation payment for a contract always covers the first month of rent
 * (in addition to the security deposit and service fee), so once a contract is
 * ACTIVE/EXPIRED the first scheduled installment is treated as already paid —
 * regardless of whether the move-in date and the first scheduled due date fall
 * in the same calendar month.
 */
export const getPrepaidInstallmentsCount = (contract: LandlordContract): number => {
    if (contract.status !== 'ACTIVE' && contract.status !== 'EXPIRED') return 0;
    if (Number(contract.leaseDurationMonths ?? 0) <= 0) return 0;
    const moveIn = new Date(contract.moveInDate);
    if (Number.isNaN(moveIn.getTime())) return 0;
    return 1;
};

export const getRentInstallmentStats = (contract: LandlordContract, nowInput?: Date): RentInstallmentStats => {
    const now = getNow(nowInput);
    const moveIn = startOfDay(new Date(contract.moveInDate));
    if (Number.isNaN(moveIn.getTime())) return { dueCount: 0, overdueCount: 0 };
    const leaseMonths = Math.max(Number(contract.leaseDurationMonths ?? 0), 0);
    if (leaseMonths <= 0) return { dueCount: 0, overdueCount: 0 };

    let firstRef = new Date(moveIn.getFullYear(), moveIn.getMonth(), 1);
    let firstDue = getCycleDueDate(contract, firstRef);
    if (firstDue < moveIn) {
        firstRef = new Date(firstRef.getFullYear(), firstRef.getMonth() + 1, 1);
        firstDue = getCycleDueDate(contract, firstRef);
    }

    let dueCount = 0;
    let overdueCount = 0;
    for (let i = 0; i < leaseMonths; i += 1) {
        const ref = new Date(firstRef.getFullYear(), firstRef.getMonth() + i, 1);
        const dueDate = getCycleDueDate(contract, ref);
        if (dueDate <= now || isWithinNextDays(now, dueDate, 30)) {
            dueCount += 1;
            if (dueDate < now) overdueCount += 1;
        }
    }
    return { dueCount, overdueCount };
};

export const formatMoney = (amount: number): string =>
    `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDateLabel = (date: Date | string | number): string => {
    const parsed = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
};
