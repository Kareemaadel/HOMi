import React, { useState } from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import { 
    Wallet, TrendingUp, Calendar, Clock, 
    ArrowUpRight, Building2, User, Landmark, 
    Plus, Download, CheckCircle2, ChevronRight,
    Search, Filter, MoreHorizontal, CreditCard
} from 'lucide-react';
import './LandlordPayment.css';
import CreditCardModal from '../../TenantPayment/components/CreditCardModal';

type LandlordTab = 'earnings' | 'received' | 'payouts' | 'methods' | 'upcoming' | 'analytics';

interface StatCardProps {
    label: string;
    amount: string;
    subtext: string;
    icon: React.ReactNode;
    variant?: 'featured' | 'white';
}

const LandlordPayment: React.FC = () => {
    const [activeTab, setActiveTab] = useState<LandlordTab>('earnings');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- SUB-COMPONENTS ---

    const StatCard = ({ label, amount, subtext, icon, variant = 'white' }: StatCardProps) => (
        <div className={`stat-card-${variant}`}>
            {variant === 'featured' && <div className="card-glass-overlay"></div>}
            <div className="stat-card-content">
                <div className="stat-header">
                    <span className="stat-label">{label}</span>
                    <div className="stat-icon-wrapper">{icon}</div>
                </div>
                <h2 className="stat-amount">{amount}</h2>
                <p className="stat-subtext">{subtext}</p>
            </div>
        </div>
    );

    // --- TAB RENDERERS ---

    const renderEarnings = () => (
        <div className="tab-viewport animate-fade-in">
            <div className="stats-grid">
                <StatCard 
                    variant="featured"
                    label="Available Balance" 
                    amount="$12,450.00" 
                    subtext="Ready for withdrawal" 
                    icon={<Wallet size={20} />} 
                />
                <StatCard 
                    label="Pending Payouts" 
                    amount="$3,200.00" 
                    subtext="Processing by bank" 
                    icon={<Clock size={20} />} 
                />
                <StatCard 
                    label="Total Earnings (YTD)" 
                    amount="$54,800.00" 
                    subtext="+12.5% from last year" 
                    icon={<TrendingUp size={20} />} 
                />
                <StatCard 
                    label="Next Payout Date" 
                    amount="April 15" 
                    subtext="Automatic transfer" 
                    icon={<Calendar size={20} />} 
                />
            </div>

            <div className="recent-activity-section">
                <div className="section-header">
                    <h3>Recent Growth</h3>
                    <button className="btn-text">View Full Report</button>
                </div>
                <div className="placeholder-chart-area">
                    <div className="chart-bar-mock"></div>
                    <p>Payouts are performing 15% better than Q1 2024.</p>
                </div>
            </div>
        </div>
    );

    const renderReceived = () => (
        <div className="tab-viewport animate-fade-in">
            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input type="text" placeholder="Search tenant or property..." />
                </div>
                <button className="btn-filter"><Filter size={16} /> Filter</button>
            </div>
            <div className="modern-table-wrapper">
                <table className="landlord-table">
                    <thead>
                        <tr>
                            <th>Tenant</th>
                            <th>Property</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'John Doe', property: 'Sunset Loft', amount: 800, date: 'Apr 01, 2024' },
                            { name: 'Sarah Ali', property: 'Green Villa', amount: 1200, date: 'Apr 02, 2024' },
                            { name: 'Michael Chen', property: 'Azure Suite', amount: 950, date: 'Apr 03, 2024' },
                        ].map((item, i) => (
                            <tr key={i}>
                                <td>
                                    <div className="user-info-cell">
                                        <div className="avatar-mini">{item.name.charAt(0)}</div>
                                        <span>{item.name}</span>
                                    </div>
                                </td>
                                <td><div className="prop-cell"><Building2 size={14} /> {item.property}</div></td>
                                <td className="font-bold">${item.amount}</td>
                                <td>{item.date}</td>
                                <td><span className="badge-success">Received</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPayouts = () => (
        <div className="tab-viewport animate-fade-in">
            <div className="payouts-list">
                {[
                    { id: '3290', amount: 3200, status: 'Completed', date: 'Mar 28, 2024' },
                    { id: '3291', amount: 800, status: 'Processing', date: 'Apr 04, 2024' },
                ].map((p, i) => (
                    <div className="payout-row" key={i}>
                        <div className="payout-info">
                            <div className={`payout-icon ${p.status.toLowerCase()}`}>
                                {p.status === 'Completed' ? <CheckCircle2 size={18}/> : <Clock size={18}/>}
                            </div>
                            <div>
                                <h5>Payout #{p.id}</h5>
                                <span>{p.date}</span>
                            </div>
                        </div>
                        <div className="payout-meta">
                            <span className="payout-amount">${p.amount.toLocaleString()}</span>
                            <span className={`status-pill ${p.status.toLowerCase()}`}>{p.status}</span>
                            <button className="icon-btn-sm"><Download size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderMethods = () => (
        <div className="tab-viewport animate-fade-in">
            <div className="methods-viewport">
                {/* Visual Card Section */}
                <div className="card-visual bank-account">
                    <div className="card-top-row">
                        <span className="bank-logo">CHASE BUSINESS</span>
                        <div className="chip-gold"></div>
                    </div>
                    <div className="card-mid-row">
                        <div className="iban-display">US76 •••• •••• 9901</div>
                    </div>
                    <div className="card-bottom-row">
                        <span className="card-holder-label">Account Holder</span>
                        <span className="card-holder-name">ALEX STERLING</span>
                    </div>
                </div>

                {/* List Section */}
                <div className="methods-list-side">
                    <div className="method-entry active">
                        <div className="method-icon-wrap"><Landmark size={20}/></div>
                        <div className="method-info-text">
                            <h5>Chase Business Savings</h5>
                            <p>Primary Payout Method</p>
                        </div>
                        <CheckCircle2 size={18} className="ml-auto text-success" />
                    </div>

                    <button className="btn-add-method" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Add New Payout Method
                    </button>
                </div>
            </div>
        </div>
    );

    const renderUpcoming = () => (
        <div className="tab-viewport animate-fade-in">
            <div className="upcoming-grid">
                {[
                    { tenant: 'Emily Blunt', property: 'Skyline Penthouse', due: 'Apr 10', amount: 2400 },
                    { tenant: 'David Rose', property: 'Creek Side Cottage', due: 'Apr 12', amount: 1100 },
                ].map((item, i) => (
                    <div className="upcoming-card" key={i}>
                        <div className="upcoming-top">
                            <span className="due-tag">Due in {i + 3} days</span>
                            <span className="amount">${item.amount}</span>
                        </div>
                        <h4>{item.property}</h4>
                        <div className="tenant-mini">
                            <User size={14} /> {item.tenant}
                        </div>
                        <div className="upcoming-footer">
                            <Calendar size={14} /> Expected {item.due}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="dashboard-shell">
            <Sidebar />
            <div className="content-container">
                <Header />
                <main className="landlord-hub">
                    <header className="landlord-hub-header">
                        <div className="header-text">
                            <h1>Financial Overview</h1>
                        </div>
                    </header>

                    <div className="tabs-container">
                        <nav className="modern-tabs">
                            {[
                                { id: 'earnings', label: 'Earnings', icon: <TrendingUp size={16}/> },
                                { id: 'received', label: 'Received', icon: <CheckCircle2 size={16}/> },
                                { id: 'payouts', label: 'Payouts', icon: <ArrowUpRight size={16}/> },
                                { id: 'upcoming', label: 'Upcoming', icon: <Clock size={16}/> },
                                { id: 'methods', label: 'Methods', icon: <CreditCard size={16}/> },
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    className={activeTab === tab.id ? 'active' : ''} 
                                    onClick={() => setActiveTab(tab.id as LandlordTab)}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="viewport-container">
                        {activeTab === 'earnings' && renderEarnings()}
                        {activeTab === 'received' && renderReceived()}
                        {activeTab === 'payouts' && renderPayouts()}
                        {activeTab === 'methods' && renderMethods()}
                        {activeTab === 'upcoming' && renderUpcoming()}
                    </div>
                </main>
                <Footer />
            </div>

            <CreditCardModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default LandlordPayment;