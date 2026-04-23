import React, { useState } from 'react';
import Header from '../../../../../components/global/header';
import Footer from '../../../../../components/global/footer';
import MaintenanceSideBar from '../../SideBar/MaintenanceSideBar';
import './Earnings.css';
import {
    FaWallet, FaHistory, FaClock, FaCreditCard,
    FaArrowUp, FaCheckCircle, FaSpinner,
    FaRegCalendarAlt, FaDollarSign, FaInfoCircle
} from 'react-icons/fa';

type TabType = 'overview' | 'upcoming' | 'methods';

const Earnings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Individual data flags for each section
    const [hasStatsOverview, setHasStatsOverview] = useState(true);
    const [hasHistoryData, setHasHistoryData] = useState(true);
    const [hasUpcomingData, setHasUpcomingData] = useState(true);
    const [hasMethodsData, setHasMethodsData] = useState(true);

    const MOCK_EARNINGS_HISTORY = [
        { id: 'TXN-001', date: 'Oct 20, 2023', ref: 'Broken AC Repair - Villa 12', amount: 450, status: 'Success' },
        { id: 'TXN-002', date: 'Oct 18, 2023', ref: 'Kitchen Plumbing - Apt 402', amount: 200, status: 'Success' },
        { id: 'TXN-003', date: 'Oct 15, 2023', ref: 'Wall Painting - Zamalek 5', amount: 1200, status: 'Success' },
        { id: 'TXN-004', date: 'Oct 12, 2023', ref: 'Door Lock Change - Giza', amount: 150, status: 'Success' },
    ];

    const MOCK_UPCOMING_PAYOUTS = [
        { id: 'JOB-701', date: 'Oct 25, 2023', ref: 'Water Heater Replacement', amount: 800, status: 'Scheduled' },
        { id: 'JOB-702', date: 'Oct 27, 2023', ref: 'Electrical Rewiring', amount: 1500, status: 'In Progress' },
    ];

    const formatMoney = (amount: number) => `EGP ${amount.toLocaleString()}`;

    const renderOverview = () => (
        <div className="earnings-tab-content animate-fade-in">
            {hasStatsOverview ? (
                <div className="earnings-stats-mosaic">
                    <div className="earnings-stat-card featured">
                        <div className="stat-icon-box"><FaWallet /></div>
                        <div className="stat-info">
                            <span className="stat-label">Available Balance</span>
                            <div className="stat-value">{formatMoney(650)}</div>
                        </div>
                        <button className="earnings-withdraw-btn" onClick={() => alert('Withdrawal request submitted!')}>
                            Withdraw Funds
                        </button>
                    </div>
                    <div className="earnings-stat-card">
                        <div className="stat-icon-box"><FaArrowUp /></div>
                        <div className="stat-info">
                            <span className="stat-label">Total Lifetime Earnings</span>
                            <div className="stat-value">{formatMoney(12450)}</div>
                        </div>
                    </div>
                    <div className="earnings-stat-card">
                        <div className="stat-icon-box"><FaCheckCircle /></div>
                        <div className="stat-info">
                            <span className="stat-label">Completed Jobs</span>
                            <div className="stat-value">42</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="earnings-empty-card stats-empty">
                    <div className="empty-icon-wrap"><FaWallet /></div>
                    <h4>No Financial Activity</h4>
                    <p>Start accepting jobs to see your balance and earnings statistics here.</p>
                </div>
            )}

            <div className="earnings-table-section">
                <h3 className="section-title">Earnings History</h3>
                {hasHistoryData ? (
                    <div className="earnings-table-wrapper">
                        <table className="earnings-modern-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Service Reference</th>
                                    <th>Transaction ID</th>
                                    <th>Amount Earned</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_EARNINGS_HISTORY.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.date}</td>
                                        <td className="font-semibold">{row.ref}</td>
                                        <td><code className="txn-code">{row.id}</code></td>
                                        <td className="text-success font-bold">+{formatMoney(row.amount)}</td>
                                        <td><span className="earnings-pill success">{row.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="earnings-empty-card table-empty">
                        <div className="empty-icon-wrap"><FaHistory /></div>
                        <h4>No History Yet</h4>
                        <p>Your completed maintenance requests and payments will be listed here.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderUpcoming = () => (
        <div className="earnings-tab-content animate-fade-in">
            {hasUpcomingData ? (
                <>
                    <div className="earnings-table-wrapper">
                        <table className="earnings-modern-table">
                            <thead>
                                <tr>
                                    <th>Expected Payout Date</th>
                                    <th>Job Reference</th>
                                    <th>Job ID</th>
                                    <th>Payout Amount</th>
                                    <th>Job Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_UPCOMING_PAYOUTS.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.date}</td>
                                        <td className="font-semibold">{row.ref}</td>
                                        <td><code className="txn-code">{row.id}</code></td>
                                        <td className="font-bold">{formatMoney(row.amount)}</td>
                                        <td><span className="earnings-pill pending">{row.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="upcoming-info-box">
                        <FaInfoCircle />
                        <p>Funds from "In Progress" and "Scheduled" jobs are reserved and will be available for withdrawal once the job is marked as completed and verified by the requester.</p>
                    </div>
                </>
            ) : (
                <div className="earnings-empty-card full-tab-empty">
                    <div className="empty-icon-wrap"><FaClock /></div>
                    <h4>No Upcoming Payouts</h4>
                    <p>You don't have any pending payments for upcoming or in-progress jobs at the moment.</p>
                </div>
            )}
        </div>
    );

    const renderMethods = () => (
        <div className="earnings-tab-content animate-fade-in">
            {hasMethodsData ? (
                <div className="earnings-methods-grid">
                    <div className="earnings-card-visual">
                        <div className="card-top-info">
                            <span className="bank-name">HOMI PAY</span>
                            <div className="card-chip"></div>
                        </div>
                        <div className="card-number">•••• •••• •••• 4421</div>
                        <div className="card-bottom-info">
                            <span className="holder-label">Payout Account</span>
                            <span className="holder-name">MOHY MOHAMED</span>
                        </div>
                    </div>
                    <div className="method-details-pane">
                        <h4>Primary Payout Method</h4>
                        <p>Configure how you receive your earnings. Payments are processed every Friday for the previous week's completed jobs.</p>
                        <div className="method-item active">
                            <FaCreditCard className="stat-icon-box" style={{ width: '40px', height: '40px', background: '#f8fafc' }} />
                            <div className="method-text">
                                <span>Visa ending in 4421</span>
                                <small>Primary Payout Account</small>
                            </div>
                            <FaCheckCircle className="check-icon" />
                        </div>
                        <button className="add-method-btn">Change Account Details</button>
                    </div>
                </div>
            ) : (
                <div className="earnings-empty-card methods-empty">
                    <div className="empty-icon-wrap"><FaCreditCard /></div>
                    <h4>No Payout Method Linked</h4>
                    <p>Please link a bank account or credit card to receive your earnings automatically.</p>
                    <button className="add-method-btn" style={{ maxWidth: '300px', marginTop: '1.5rem' }}>
                        Add Payout Method
                    </button>
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
                        <h1>Financial Hub</h1>
                        <p>Manage your revenue, track pending payouts, and view your complete service history.</p>
                    </header>

                    <div className="earnings-tabs-container">
                        <button
                            className={`earnings-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <FaHistory /> Earnings History
                        </button>
                        <button
                            className={`earnings-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            <FaClock /> Upcoming Payouts
                        </button>
                        <button
                            className={`earnings-tab-btn ${activeTab === 'methods' ? 'active' : ''}`}
                            onClick={() => setActiveTab('methods')}
                        >
                            <FaCreditCard /> Payout Methods
                        </button>
                    </div>

                    <div className="earnings-viewport">
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'upcoming' && renderUpcoming()}
                        {activeTab === 'methods' && renderMethods()}
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Earnings;
