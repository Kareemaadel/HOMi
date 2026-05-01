import contractService, { type LandlordContract, type TenantPaymentHistoryItem } from './contract.service';
import { getRentCycleSummary } from '../features/TenantPayment/utils/rentSchedule';

export type RewardPaymentStatus = 'ON_TIME' | 'LATE';

export interface RewardsPaymentEntry {
    id: string;
    date: string;
    amountPaid: number;
    status: RewardPaymentStatus;
    rewardsEarned: number;
}

export interface UpcomingRewardEntry {
    id: string;
    dueDate: string;
    amountDue: number;
    daysUntilDue: number;
    expectedRewards: number;
}

export interface RewardsSummary {
    earnedRewards: number;
    redeemableBalance: number;
    pendingRewards: number;
    pointsEarned: number;
    conversionRateText: string;
}

export interface RewardsDashboardData {
    summary: RewardsSummary;
    paymentHistory: RewardsPaymentEntry[];
    upcomingRents: UpcomingRewardEntry[];
}

const BASE_REWARD_RATE = 0.015;
const STREAK_BONUS_STEP = 3;
const STREAK_BONUS_INCREMENT = 0.005;
const STREAK_BONUS_MAX = 0.02;
const REDEEMABLE_PORTION = 0.8;
const POINTS_PER_CURRENCY_UNIT = 100;

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const getDueDay = (contract: LandlordContract, paymentDate: Date): number => {
    if (contract.rentDueDate === '5TH_OF_MONTH') return 5;
    if (contract.rentDueDate === 'LAST_DAY_OF_MONTH') {
        return new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0).getDate();
    }
    return 1;
};

const toRewardsPaymentRows = (
    paymentHistory: TenantPaymentHistoryItem[],
    contractsById: Map<string, LandlordContract>
): Array<{ row: TenantPaymentHistoryItem; contract: LandlordContract }> => {
    return paymentHistory
        .filter((item) => item.type === 'RENT_MONTHLY' && item.direction === 'DEBIT' && item.entityId)
        .map((row) => {
            const contract = row.entityId ? contractsById.get(row.entityId) : undefined;
            return contract ? { row, contract } : null;
        })
        .filter((item): item is { row: TenantPaymentHistoryItem; contract: LandlordContract } => item !== null)
        .sort((a, b) => new Date(a.row.createdAt).getTime() - new Date(b.row.createdAt).getTime());
};

const buildDashboardData = (contracts: LandlordContract[], paymentHistory: TenantPaymentHistoryItem[]): RewardsDashboardData => {
    const contractsById = new Map<string, LandlordContract>(contracts.map((contract) => [contract.id, contract]));
    const rewardRows = toRewardsPaymentRows(paymentHistory, contractsById);

    let streak = 0;
    let earnedRewards = 0;

    const mappedHistory: RewardsPaymentEntry[] = rewardRows.map(({ row, contract }) => {
        const paidAt = new Date(row.createdAt);
        const dueDate = new Date(paidAt.getFullYear(), paidAt.getMonth(), getDueDay(contract, paidAt));
        const status: RewardPaymentStatus = paidAt.getTime() <= dueDate.getTime() ? 'ON_TIME' : 'LATE';

        if (status === 'ON_TIME') {
            streak += 1;
        } else {
            streak = 0;
        }

        const streakBonusMultiplier = Math.min(
            Math.floor(streak / STREAK_BONUS_STEP) * STREAK_BONUS_INCREMENT,
            STREAK_BONUS_MAX
        );
        const rewardRate = status === 'ON_TIME' ? BASE_REWARD_RATE + streakBonusMultiplier : 0;
        const rewardsEarned = roundMoney(Math.max(Number(row.amount), 0) * rewardRate);

        earnedRewards += rewardsEarned;

        return {
            id: row.id,
            date: row.createdAt,
            amountPaid: Number(row.amount),
            status,
            rewardsEarned,
        };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const upcomingRents = contracts
        .filter((contract) => contract.status === 'ACTIVE')
        .map((contract) => {
            const cycle = getRentCycleSummary(contract);
            const amountDue = Number(contract.rentAmount ?? contract.property?.monthlyPrice ?? 0);
            return {
                id: contract.id,
                dueDate: cycle.dueDate.toISOString(),
                amountDue,
                daysUntilDue: cycle.daysUntilDue,
                expectedRewards: roundMoney(amountDue * BASE_REWARD_RATE),
            };
        })
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const pendingRewards = roundMoney(upcomingRents.reduce((sum, row) => sum + row.expectedRewards, 0));
    const totalEarned = roundMoney(earnedRewards);
    const redeemableBalance = roundMoney(totalEarned * REDEEMABLE_PORTION);

    return {
        summary: {
            earnedRewards: totalEarned,
            redeemableBalance,
            pendingRewards,
            pointsEarned: Math.floor(totalEarned * POINTS_PER_CURRENCY_UNIT),
            conversionRateText: `${POINTS_PER_CURRENCY_UNIT} points = $1.00`,
        },
        paymentHistory: mappedHistory,
        upcomingRents,
    };
};

const buildMockDashboardData = (): RewardsDashboardData => ({
    summary: {
        earnedRewards: 246.5,
        redeemableBalance: 197.2,
        pendingRewards: 18.75,
        pointsEarned: 24650,
        conversionRateText: '100 points = $1.00',
    },
    paymentHistory: [
        { id: 'mock-1', date: new Date().toISOString(), amountPaid: 750, status: 'ON_TIME', rewardsEarned: 11.25 },
        { id: 'mock-2', date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), amountPaid: 750, status: 'ON_TIME', rewardsEarned: 15 },
        { id: 'mock-3', date: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(), amountPaid: 750, status: 'LATE', rewardsEarned: 0 },
    ],
    upcomingRents: [
        { id: 'mock-upcoming-1', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), amountDue: 750, daysUntilDue: 7, expectedRewards: 11.25 },
    ],
});

class RewardsService {
    async getDashboardData(): Promise<RewardsDashboardData> {
        try {
            const [contractsRes, paymentHistory] = await Promise.all([
                contractService.getTenantContracts({ page: 1, limit: 50 }),
                contractService.getPaymentHistory(120),
            ]);
            return buildDashboardData(contractsRes.data ?? [], paymentHistory ?? []);
        } catch {
            return buildMockDashboardData();
        }
    }
}

export const rewardsService = new RewardsService();
export default rewardsService;
