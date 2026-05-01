import { useEffect, useMemo, useState } from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import rewardsService, {
    type RewardsDashboardData,
} from '../../../services/rewards.service';
import './Rewards.css';

const formatMoney = (value: number): string =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value: string): string => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
};

const getDueLabel = (daysUntilDue: number): string => {
    if (daysUntilDue < 0) return 'Overdue';
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
};

const Rewards = () => {
    const [dashboardData, setDashboardData] = useState<RewardsDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showRedeemConfirm, setShowRedeemConfirm] = useState(false);
    const [redeemSuccess, setRedeemSuccess] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await rewardsService.getDashboardData();
            setDashboardData(data);
            setIsLoading(false);
        };
        void loadData();
    }, []);

    const hasRewardsToRedeem = useMemo(
        () => Number(dashboardData?.summary.redeemableBalance ?? 0) > 0,
        [dashboardData]
    );

    const onConfirmRedeem = () => {
        setRedeemSuccess(true);
        setShowRedeemConfirm(false);
        globalThis.setTimeout(() => setRedeemSuccess(false), 2500);
    };

    return (
        <div className="tenant-dashboard-root rewards-root">
            <Sidebar />
            <div className="main-wrapper">
                <Header />
                <main className="content-area rewards-content">
                    <header className="welcome-section rewards-header">
                        <div className="welcome-text">
                            <h1>Rewards ⭐</h1>
                            <p>Track rewards earned from rent payments and redeem them as cash value.</p>
                        </div>
                    </header>

                    {isLoading || !dashboardData ? (
                        <section className="rewards-card">
                            <p className="rewards-muted">Loading rewards data...</p>
                        </section>
                    ) : (
                        <>
                            <section className="rewards-grid rewards-summary-grid">
                                <article className="rewards-card">
                                    <h3>Total rewards balance</h3>
                                    <p className="rewards-value">{formatMoney(dashboardData.summary.earnedRewards)}</p>
                                </article>
                                <article className="rewards-card">
                                    <h3>Points earned</h3>
                                    <p className="rewards-value">{dashboardData.summary.pointsEarned.toLocaleString()}</p>
                                </article>
                                <article className="rewards-card">
                                    <h3>Conversion rate</h3>
                                    <p className="rewards-value rewards-value-small">{dashboardData.summary.conversionRateText}</p>
                                </article>
                            </section>

                            <section className="rewards-card">
                                <h2>Rewards logic ✨</h2>
                                <div className="logic-flow">
                                    <div className="logic-step">
                                        <h4>On-time rent payment</h4>
                                        <p>Each on-time payment adds base rewards to your earned balance.</p>
                                    </div>
                                    <div className="logic-step">
                                        <h4>Consistency streak bonus</h4>
                                        <p>Consecutive on-time months increase the multiplier bonus.</p>
                                    </div>
                                    <div className="logic-step">
                                        <h4>Late payment impact</h4>
                                        <p>Late payments earn no rewards for that cycle and reset streak progression.</p>
                                    </div>
                                </div>
                            </section>

                            <section className="rewards-card">
                                <div className="section-head">
                                    <h2>Payment history</h2>
                                </div>
                                <div className="table-wrap">
                                    <table className="rewards-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Amount paid</th>
                                                <th>Status</th>
                                                <th>Rewards earned</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.paymentHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="rewards-muted">No rent payments recorded yet.</td>
                                                </tr>
                                            ) : (
                                                dashboardData.paymentHistory.map((entry) => (
                                                    <tr key={entry.id}>
                                                        <td>{formatDate(entry.date)}</td>
                                                        <td>{formatMoney(entry.amountPaid)}</td>
                                                        <td>
                                                            <span className={`status-badge ${entry.status === 'ON_TIME' ? 'on-time' : 'late'}`}>
                                                                {entry.status === 'ON_TIME' ? 'On-time' : 'Late'}
                                                            </span>
                                                        </td>
                                                        <td>{formatMoney(entry.rewardsEarned)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section className="rewards-card">
                                <div className="section-head">
                                    <h2>Upcoming rent</h2>
                                </div>
                                <div className="upcoming-list">
                                    {dashboardData.upcomingRents.length === 0 ? (
                                        <p className="rewards-muted">No upcoming rent found for active leases.</p>
                                    ) : (
                                        dashboardData.upcomingRents.map((entry) => (
                                            <article className="upcoming-item" key={entry.id}>
                                                <div>
                                                    <h4>{formatDate(entry.dueDate)}</h4>
                                                    <p className="rewards-muted">{getDueLabel(entry.daysUntilDue)}</p>
                                                </div>
                                                <div>
                                                    <h4>{formatMoney(entry.amountDue)}</h4>
                                                    <p className="rewards-muted">Expected reward: {formatMoney(entry.expectedRewards)}</p>
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </section>

                            <section className="rewards-card redeem-card">
                                <h2>Redeem rewards ⭐</h2>
                                <div className="redeem-grid">
                                    <div>
                                        <p className="redeem-label">Earned rewards</p>
                                        <p className="redeem-value">{formatMoney(dashboardData.summary.earnedRewards)}</p>
                                    </div>
                                    <div>
                                        <p className="redeem-label">Redeemable balance</p>
                                        <p className="redeem-value">{formatMoney(dashboardData.summary.redeemableBalance)}</p>
                                    </div>
                                    <div>
                                        <p className="redeem-label">Pending upcoming rewards</p>
                                        <p className="redeem-value">{formatMoney(dashboardData.summary.pendingRewards)}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-redeem"
                                    disabled={!hasRewardsToRedeem}
                                    onClick={() => setShowRedeemConfirm(true)}
                                >
                                    Redeem as money ✨
                                </button>
                            </section>
                        </>
                    )}
                </main>
                <Footer />
            </div>

            {showRedeemConfirm && (
                <div className="redeem-modal-backdrop">
                    <div className="redeem-modal">
                        <h3>Confirm redeem request</h3>
                        <p>
                            Redeem {formatMoney(dashboardData?.summary.redeemableBalance ?? 0)} into your wallet balance?
                            This is a UI confirmation flow only for now.
                        </p>
                        <div className="redeem-modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setShowRedeemConfirm(false)}>Cancel</button>
                            <button type="button" className="btn-confirm" onClick={onConfirmRedeem}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {redeemSuccess && (
                <div className="redeem-toast">Redeem request submitted (UI only).</div>
            )}
        </div>
    );
};

export default Rewards;
