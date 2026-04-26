import React, { useEffect, useState } from 'react';
import Header from '../../../../../components/global/header';
import Footer from '../../../../../components/global/footer';
import MaintenanceSideBar from '../../SideBar/MaintenanceSideBar';
import './Earnings.css';
import {
    FaWallet, FaHistory, FaClock, FaArrowUp, FaCheckCircle, FaInfoCircle,
} from 'react-icons/fa';
import maintenanceService, {
    type MaintenanceRequest,
    type ProviderEarnings,
} from '../../../../../services/maintenance.service';

type TabType = 'overview' | 'upcoming';

const formatMoney = (amount: number) => `EGP ${amount.toLocaleString()}`;

const Earnings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [earnings, setEarnings] = useState<ProviderEarnings | null>(null);
    const [upcoming, setUpcoming] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [e, mine] = await Promise.all([
                    maintenanceService.getProviderEarnings(),
                    maintenanceService.listProviderRequests(['ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'AWAITING_CONFIRMATION']),
                ]);
                if (cancelled) return;
                setEarnings(e);
                setUpcoming(mine);
            } catch (err: any) {
                if (!cancelled) setError(err?.response?.data?.message ?? 'Failed to load earnings.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const renderOverview = () => (
        <div className="earnings-tab-content animate-fade-in">
            <div className="earnings-stats-mosaic">
                <div className="earnings-stat-card featured">
                    <div className="stat-icon-box"><FaWallet /></div>
                    <div className="stat-info">
                        <span className="stat-label">Wallet balance</span>
                        <div className="stat-value">{formatMoney(earnings?.walletBalance ?? 0)}</div>
                    </div>
                </div>
                <div className="earnings-stat-card">
                    <div className="stat-icon-box"><FaArrowUp /></div>
                    <div className="stat-info">
                        <span className="stat-label">Total lifetime earnings</span>
                        <div className="stat-value">{formatMoney(earnings?.totalEarned ?? 0)}</div>
                    </div>
                </div>
                <div className="earnings-stat-card">
                    <div className="stat-icon-box"><FaCheckCircle /></div>
                    <div className="stat-info">
                        <span className="stat-label">Completed jobs</span>
                        <div className="stat-value">{earnings?.completedJobs ?? 0}</div>
                    </div>
                </div>
            </div>

            <div className="earnings-table-section">
                <h3 className="section-title">Recent completed jobs</h3>
                {(earnings?.recentCompleted?.length ?? 0) > 0 ? (
                    <div className="earnings-table-wrapper">
                        <table className="earnings-modern-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Service</th>
                                    <th>Job ID</th>
                                    <th>Amount earned</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earnings!.recentCompleted.map((j) => (
                                    <tr key={j.id}>
                                        <td>{new Date(j.tenantConfirmedAt ?? j.providerCompletedAt ?? j.updatedAt).toLocaleDateString()}</td>
                                        <td className="font-semibold">{j.title}</td>
                                        <td><code className="txn-code">{j.id.slice(0, 8)}</code></td>
                                        <td className="text-success font-bold">+{formatMoney(Number(j.agreedPrice ?? 0))}</td>
                                        <td><span className="earnings-pill success">Paid</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="earnings-empty-card table-empty">
                        <div className="empty-icon-wrap"><FaHistory /></div>
                        <h4>No history yet</h4>
                        <p>Your completed maintenance jobs and payments will be listed here.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderUpcoming = () => (
        <div className="earnings-tab-content animate-fade-in">
            {upcoming.length > 0 ? (
                <>
                    <div className="earnings-table-wrapper">
                        <table className="earnings-modern-table">
                            <thead>
                                <tr>
                                    <th>Started</th>
                                    <th>Job</th>
                                    <th>Job ID</th>
                                    <th>Payout amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcoming.map((j) => (
                                    <tr key={j.id}>
                                        <td>{new Date(j.createdAt).toLocaleDateString()}</td>
                                        <td className="font-semibold">{j.title}</td>
                                        <td><code className="txn-code">{j.id.slice(0, 8)}</code></td>
                                        <td className="font-bold">{formatMoney(Number(j.agreedPrice ?? 0))}</td>
                                        <td><span className="earnings-pill pending">{j.status.replace('_', ' ')}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="upcoming-info-box">
                        <FaInfoCircle />
                        <p>The amount for each active job is held in escrow by HOMi. It is released to your wallet automatically once the tenant confirms the issue is resolved.</p>
                    </div>
                </>
            ) : (
                <div className="earnings-empty-card full-tab-empty">
                    <div className="empty-icon-wrap"><FaClock /></div>
                    <h4>No upcoming payouts</h4>
                    <p>You don't have any pending payments at the moment.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="earnings-page-wrapper">
            <MaintenanceSideBar />
            <div className="earnings-content-area">
                <Header />
                <main className="earnings-hub">
                    <header className="earnings-hub-header">
                        <h1>Financial hub</h1>
                        <p>Track your wallet balance, escrow payouts, and complete service history.</p>
                    </header>

                    {error && (
                        <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 12, margin: '0 0 1rem' }}>
                            {error}
                        </div>
                    )}

                    <div className="earnings-tabs-container">
                        <button
                            className={`earnings-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <FaHistory /> Earnings history
                        </button>
                        <button
                            className={`earnings-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            <FaClock /> Upcoming payouts
                        </button>
                    </div>

                    <div className="earnings-viewport">
                        {loading ? (
                            <div className="earnings-empty-card full-tab-empty"><h4>Loading…</h4></div>
                        ) : (
                            activeTab === 'overview' ? renderOverview() : renderUpcoming()
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Earnings;
