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
    // DEV TOGGLE: Change this to true to see the populated data, or false for the empty states.
    // Later, this will be set by your backend (e.g., user.payments.length > 0)
    const [hasData, setHasData] = useState(true); 
    
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

    // Reusable Empty State UI for the tabs
    const EmptyState = ({ icon, title, description, action }: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <div style={{ marginBottom: '16px', opacity: 0.5 }}>{icon}</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '1.25rem' }}>{title}</h3>
            <p style={{ margin: '0 0 24px 0', maxWidth: '350px', lineHeight: '1.5' }}>{description}</p>
            {action && action}
        </div>
    );

    // --- TAB RENDERERS ---

    const renderEarnings = () => (
        <div className="tab-viewport animate-fade-in">
            <div className="stats-grid">
                <StatCard 
                    variant="featured"
                    label="Available Balance" 
                    amount={hasData ? "$12,450.00" : "$0.00"} 
                    subtext={hasData ? "Ready for withdrawal" : "No funds available"} 
                    icon={<Wallet size={20} />} 
                />
                <StatCard 
                    label="Pending Payouts" 
                    amount={hasData ? "$3,200.00" : "$0.00"} 
                    subtext={hasData ? "Processing by bank" : "No pending transfers"} 
                    icon={<Clock size={20} />} 
                />
                <StatCard 
                    label="Total Earnings (YTD)" 
                    amount={hasData ? "$54,800.00" : "$0.00"} 
                    subtext={hasData ? "+12.5% from last year" : "No earnings yet"} 
                    icon={<TrendingUp size={20} />} 
                />
                <StatCard 
                    label="Next Payout Date" 
                    amount={hasData ? "April 15" : "N/A"} 
                    subtext={hasData ? "Automatic transfer" : "No scheduled payouts"} 
                    icon={<Calendar size={20} />} 
                />
            </div>

            <div className="recent-activity-section">
                <div className="section-header">
                    <h3>Recent Growth</h3>
                    {hasData && <button className="btn-text">View Full Report</button>}
                </div>
                <div className="placeholder-chart-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {hasData ? (
                        <>
                            <div className="chart-bar-mock"></div>
                            <p>Payouts are performing 15% better than Q1 2024.</p>
                        </>
                    ) : (
                        <p style={{ color: '#94a3b8' }}>Not enough data to generate growth charts.</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderReceived = () => {
        if (!hasData) {
            return (
                <div className="tab-viewport animate-fade-in">
                    <EmptyState 
                        icon={<CheckCircle2 size={48} />}
                        title="No received payments"
                        description="When your tenants pay their rent or fees, the transaction records will appear here."
                    />
                </div>
            );
        }

        return (
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
    };

    const renderPayouts = () => {
        if (!hasData) {
            return (
                <div className="tab-viewport animate-fade-in">
                    <EmptyState 
                        icon={<ArrowUpRight size={48} />}
                        title="No payouts yet"
                        description="Your withdrawal history to your connected bank accounts will be tracked here."
                    />
                </div>
            );
        }

        return (
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
    };

    const renderMethods = () => {
        if (!hasData) {
            return (
                <div className="tab-viewport animate-fade-in">
                    <EmptyState 
                        icon={<Landmark size={48} />}
                        title="No payout methods added"
                        description="Add a bank account to start receiving your rent payments and withdrawals."
                        action={
                            <button className="btn-add-method" onClick={() => setIsModalOpen(true)} style={{ width: 'auto', marginTop: '16px' }}>
                                <Plus size={18} /> Add Payout Method
                            </button>
                        }
                    />
                </div>
            );
        }

        return (
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
    };

    const renderUpcoming = () => {
        if (!hasData) {
            return (
                <div className="tab-viewport animate-fade-in">
                    <EmptyState 
                        icon={<Calendar size={48} />}
                        title="No upcoming payments"
                        description="You have no scheduled incoming rent payments at this time."
                    />
                </div>
            );
        }

        return (
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
    };

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