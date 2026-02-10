// client\src\features\Balance\pages\Balance.tsx
import React, { useState } from 'react';
import Header from '../../../components/global/Landlord/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/Landlord/footer';
import { 
    FaWallet, FaArrowUp, FaArrowDown, FaPlus, 
    FaFileInvoiceDollar, FaChartLine, FaShieldAlt, FaEllipsisV 
} from 'react-icons/fa';
import './Balance.css';

const Balance: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="balance-page-wrapper">
            <Sidebar/>
            
            <div className={`balance-main-content ${isSidebarOpen ? 'shifted' : ''}`}>
                <Header />

                <main className="balance-container">
                    {/* TOP SECTION: HERO & ACTION */}
                    <header className="balance-header-visual">
                        <div className="text-group">
                            <h1>Financial Overview</h1>
                            <p>Manage your earnings, deposits, and payouts in real-time.</p>
                        </div>
                        <div className="action-group">
                            <button className="btn-secondary-glass"><FaFileInvoiceDollar /> Statements</button>
                            <button className="btn-primary-glow"><FaPlus /> Add Funds</button>
                        </div>
                    </header>

                    <div className="balance-grid">
                        {/* LEFT COLUMN: MAIN STATS & CHART MOCKUP */}
                        <div className="grid-left-col">
                            {/* THE WALLET CARD */}
                            <div className="premium-balance-card">
                                <div className="card-inner">
                                    <div className="card-info">
                                        <span className="label">Available Balance</span>
                                        <h2 className="amount">$42,850.00</h2>
                                        <div className="balance-meta">
                                            <span className="trend positive"><FaArrowUp /> 12.5%</span>
                                            <span className="since">vs last month</span>
                                        </div>
                                    </div>
                                    <div className="wallet-icon-box">
                                        <FaWallet />
                                    </div>
                                </div>
                                <div className="card-footer-stats">
                                    <div className="sub-stat">
                                        <p>Pending</p>
                                        <span>$1,200.00</span>
                                    </div>
                                    <div className="sub-stat">
                                        <p>In Escrow</p>
                                        <span>$5,500.00</span>
                                    </div>
                                </div>
                            </div>

                            {/* PLACEHOLDER FOR CHART COMPONENT */}
                            <div className="visual-chart-card">
                                <div className="card-head">
                                    <h3>Revenue Analytics</h3>
                                    <select className="chart-select">
                                        <option>Last 6 Months</option>
                                        <option>Last Year</option>
                                    </select>
                                </div>
                                <div className="chart-placeholder">
                                    {/* Component will go here */}
                                    <div className="mock-chart-bars">
                                        {[40, 70, 45, 90, 65, 80].map((h, i) => (
                                            <div key={i} className="bar" style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: RECENT ACTIVITY & CARDS */}
                        <div className="grid-right-col">
                            <div className="quick-actions-card">
                                <h3>Quick Actions</h3>
                                <div className="action-btns-grid">
                                    <button className="action-pill"><FaArrowDown /> Withdraw</button>
                                    <button className="action-pill"><FaArrowUp /> Transfer</button>
                                </div>
                            </div>

                            <div className="security-card">
                                <div className="shield-icon"><FaShieldAlt /></div>
                                <div>
                                    <h4>Account Security</h4>
                                    <p>Your funds are protected by 256-bit encryption.</p>
                                </div>
                            </div>

                            {/* RECENT TRANSACTIONS PREVIEW */}
                            <div className="transactions-mini-list">
                                <div className="list-head">
                                    <h3>Recent Transactions</h3>
                                    <button className="view-all">View All</button>
                                </div>
                                <div className="transaction-items">
                                    {/* Mock items for visual organization */}
                                    {[1, 2, 3].map((item) => (
                                        <div className="t-item" key={item}>
                                            <div className="t-icon rent"><FaFileInvoiceDollar /></div>
                                            <div className="t-info">
                                                <p className="t-name">Apartment Rent - #102</p>
                                                <p className="t-date">Oct 12, 2023</p>
                                            </div>
                                            <span className="t-amount positive">+$2,400</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default Balance;