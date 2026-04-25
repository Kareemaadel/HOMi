import type { LandlordContract } from '../../../services/contract.service';

export interface RentCycleSummary {
    dueDate: Date;
    nextDueDate: Date;
    daysUntilDue: number;
    isPaidForCurrentCycle: boolean;
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

export const getRentCycleSummary = (contract: LandlordContract, nowInput?: Date): RentCycleSummary => {
    const now = nowInput ? startOfDay(nowInput) : startOfDay(new Date());
    const thisCycleDue = getCycleDueDate(contract, now);
    const nextCycleDue = getCycleDueDate(contract, new Date(now.getFullYear(), now.getMonth() + 1, 1));
    const paidAt = contract.paymentVerifiedAt ? startOfDay(new Date(contract.paymentVerifiedAt)) : null;
    const isPaidForCurrentCycle = Boolean(paidAt && paidAt >= thisCycleDue && paidAt < nextCycleDue);

    const dueDate = isPaidForCurrentCycle ? nextCycleDue : thisCycleDue;
    const followingDueDate = getCycleDueDate(contract, new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 1));
    const daysUntilDue = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
        dueDate,
        nextDueDate: followingDueDate,
        daysUntilDue,
        isPaidForCurrentCycle,
    };
};

export const formatMoney = (amount: number): string =>
    `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDateLabel = (date: Date): string =>
    date.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
