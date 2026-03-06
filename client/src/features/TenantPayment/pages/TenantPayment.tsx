import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import { 
    LayoutDashboard, CalendarClock, History, Undo2, 
    CreditCard, FileSearch, Download, Plus, CheckCircle2, 
    Clock, ArrowUpRight, Wallet, Receipt, ShieldCheck,
    TrendingUp, ExternalLink, MoreVertical, MapPin, Loader2, X
} from 'lucide-react';
import './TenantPayment.css';
import CreditCardModal from '../components/CreditCardModal';

type TabType = 'overview' | 'upcoming' | 'history' | 'refunds' | 'methods' | 'pending';

interface CheckoutInfo {
    name: string;
    price: number;
    location: string;
}

const TenantPayment: React.FC = () => {
    // --- STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [checkoutData, setCheckoutData] = useState<CheckoutInfo | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const location = useLocation();

    // --- EFFECTS ---
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab as TabType);
        }
    }, [location.state]);

    // --- HANDLERS ---
    const handleConfirmPayment = () => {
        setIsProcessing(true);
        // Simulate API Call
        setTimeout(() => {
            setIsProcessing(false);
            setCheckoutData(null); // Return to dashboard
            setShowSuccessToast(true);
            setActiveTab('history'); // Move them to history to see the record
            
            // Auto-hide toast after 5 seconds
            setTimeout(() => setShowSuccessToast(false), 5000);
        }, 2000);
    };

    // --- TAB RENDERERS ---

    const renderCheckout = () => {
        if (!checkoutData) return null;
        
        return (
            <div className="checkout-view animate-fade-up">
                <button className="back-link" onClick={() => setCheckoutData(null)}>
                    ← Back to Requests
                </button>
                
                <div className="checkout-grid">
                    <div className="checkout-main">
                        <header className="checkout-header">
                        </header>

                        <section className="checkout-section">
                            <h3>1. Select Payment Method</h3>
                            <div className="method-selector-mini">
                                <div className="mini-card selected">
                                    <div className="card-brand-info">
                                        <CreditCard size={18} />
                                        <span>Visa ending in 4242</span>
                                    </div>
                                    <CheckCircle2 size={16} className="text-success" />
                                </div>
                                <button className="add-new-mini" onClick={() => setIsModalOpen(true)}>
                                    <Plus size={16} /> Add New Method
                                </button>
                            </div>
                        </section>

                        <section className="checkout-section">
                            <h3>2. Review Lease Terms</h3>
                            <div className="terms-box">
                                <ShieldCheck size={20} className="text-success" />
                                <div>
                                    <p>By clicking "Confirm & Pay", you agree to the 12-month lease agreement and house rules.</p>
                                    <button className="text-btn">View Lease Agreement (PDF)</button>
                                </div>
                            </div>
                        </section>

                        <button 
                            className={`btn-confirm-pay ${isProcessing ? 'loading' : ''}`} 
                            onClick={handleConfirmPayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <><Loader2 className="animate-spin" size={20} /> Processing...</>
                            ) : (
                                `Confirm & Pay $${(checkoutData.price + 500).toLocaleString()}`
                            )}
                        </button>
                    </div>

                    <div className="checkout-summary">
                        <div className="summary-card">
                            <h4>Payment Summary</h4>
                            <div className="summary-property-info">
                                <p className="summary-prop-name">{checkoutData.name}</p>
                                <p className="summary-prop-loc"><MapPin size={12}/> {checkoutData.location}</p>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row">
                                <span>First Month Rent</span>
                                <span>${checkoutData.price.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Security Deposit</span>
                                <span>$500.00</span>
                            </div>
                            <div className="summary-row">
                                <span>Processing Fee</span>
                                <span className="text-success">FREE</span>
                            </div>
                            <div className="summary-total">
                                <span>Total Due Now</span>
                                <span>${(checkoutData.price + 500).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderOverview = () => (
        <div className="tab-viewport animate-fade-up">
            <div className="stats-mosaic">
                <div className="stat-card-featured">
                    <div className="card-glass-overlay"></div>
                    <div className="card-content">
                        <div className="icon-wrap-blur"><Wallet size={20} /></div>
                        <label>Current Balance</label>
                        <div className="amount-row">
                            <h2>$120.00</h2>
                            <span className="mini-badge">Utilities</span>
                        </div>
                        <p className="card-footer-text">Auto-pay scheduled for April 15</p>
                    </div>
                </div>

                <div className="stat-card-white">
                    <div className="card-header-row">
                        <label>Next Rent</label>
                        <TrendingUp size={16} className="text-success" />
                    </div>
                    <div className="flex-baseline">
                        <h3>$800.00</h3>
                        <span className="sub-label">/mo</span>
                    </div>
                    <div className="due-indicator">
                        <div className="pulse-dot"></div>
                        <span>Due in 12 days (May 01)</span>
                    </div>
                </div>

                <div className="stat-card-white">
                    <div className="card-header-row">
                        <label>Annual Spend</label>
                        <Receipt size={16} className="text-slate" />
                    </div>
                    <h3>$3,200.00</h3>
                    <p className="sub-label-sm">4 successful payments in 2024</p>
                </div>
            </div>

            <div className="stripe-style-banner">
                <div className="banner-left">
                    <div className="banner-icon"><ShieldCheck size={24} /></div>
                    <div className="banner-copy">
                        <h4>Payment protection is active</h4>
                        <p>Your transactions are encrypted and monitored for your security.</p>
                    </div>
                </div>
                <button className="btn-vercel-black" onClick={() => setActiveTab('upcoming')}>
                    Pay Now! <ArrowUpRight size={16} />
                </button>
            </div>
        </div>
    );

    const renderUpcoming = () => (
        <div className="tab-viewport animate-fade-up">
            <div className="list-container">
                {[
                    { title: 'May 2024 Rent', date: 'May 01', amount: 800, status: 'Active' },
                    { title: 'June 2024 Rent', date: 'Jun 01', amount: 800, status: 'Scheduled' },
                    { title: 'July 2024 Rent', date: 'Jul 01', amount: 800, status: 'Scheduled' },
                ].map((item, i) => (
                    <div className="list-row" key={i}>
                        <div className="row-main">
                            <div className="calendar-box">
                                <span className="month">{item.date.split(' ')[0]}</span>
                                <span className="day">{item.date.split(' ')[1]}</span>
                            </div>
                            <div className="row-text">
                                <h5>{item.title}</h5>
                                <p>{item.status === 'Active' ? 'Awaiting payment' : 'Automatic payment scheduled'}</p>
                            </div>
                        </div>
                        <div className="row-actions">
                            <span className="row-amount">${item.amount}</span>
                            <button 
                                className={item.status === 'Active' ? 'btn-pay-now' : 'btn-manage-ghost'}
                                onClick={item.status === 'Active' ? () => setCheckoutData({ 
                                    name: item.title, 
                                    price: item.amount, 
                                    location: 'Current Rental' 
                                }) : undefined}
                            >
                                {item.status === 'Active' ? 'Pay Now' : 'Manage'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className="tab-viewport animate-fade-up">
            <div className="table-wrapper">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Reference</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { date: 'Apr 01, 2024', ref: 'Sunset Loft - April Rent', amount: 800, status: 'Success' },
                            { date: 'Mar 01, 2024', ref: 'Sunset Loft - March Rent', amount: 800, status: 'Success' },
                        ].map((row, i) => (
                            <tr key={i}>
                                <td>{row.date}</td>
                                <td className="font-medium">{row.ref}</td>
                                <td>${row.amount}</td>
                                <td><span className="pill success">{row.status}</span></td>
                                <td className="text-right">
                                    <button className="icon-btn"><Download size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPending = () => (
        <div className="tab-viewport animate-fade-up">
            <div className="grid-responsive">
                {[
                    { property: 'Azure Horizon Suite', status: 'Accepted', price: 1200, loc: 'Miami, FL' },
                    { property: 'Urban Glass Tower', status: 'Pending', price: 950, loc: 'New York, NY' },
                ].map((req, i) => (
                    <div className="application-card-premium" key={i}>
                        <div className="app-card-top">
                            <span className={`status-tag ${req.status.toLowerCase()}`}>
                                {req.status === 'Accepted' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                                {req.status}
                            </span>
                            <button className="icon-btn"><MoreVertical size={16}/></button>
                        </div>
                        <div className="app-card-body">
                            <h4>{req.property}</h4>
                            <p className="location-tag"><MapPin size={12}/> {req.loc}</p>
                        </div>
                        <div className="app-card-footer">
                            <div className="price-group">
                                <label>Offer</label>
                                <span>${req.price}</span>
                            </div>
                            <button 
                                className="btn-app-action" 
                                disabled={req.status !== 'Accepted'}
                                onClick={() => setCheckoutData({ 
                                    name: req.property, 
                                    price: req.price, 
                                    location: req.loc 
                                })}
                            >
                                {req.status === 'Accepted' ? 'Proceed to Payment' : 'Under Review'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderMethods = () => (
        <div className="tab-viewport animate-fade-up">
            <div className="methods-flex">
                <div className="card-visual visa">
                    <div className="card-visual-top">
                        <CreditCard size={24} />
                        <span className="chip-gold"></span>
                    </div>
                    <p className="card-num">•••• •••• •••• 4242</p>
                    <div className="card-visual-bottom">
                        <span>EXP 12/26</span>
                        <div className="visa-logo">VISA</div>
                    </div>
                </div>
                
                <div className="methods-list-side">
                    <div className="method-entry active">
                        <div className="entry-icon"><CreditCard size={18} /></div>
                        <div className="entry-text">
                            <h6>Visa ending in 4242</h6>
                            <span>Default Method</span>
                        </div>
                        <CheckCircle2 className="text-success" size={18} />
                    </div>
                    <button className="btn-add-new" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Add New Payment Method
                    </button>
                </div>
            </div>
        </div>
    );

    const renderRefunds = () => (
        <div className="tab-viewport animate-fade-up">
            <div className="empty-state">
                <div className="empty-icon"><Undo2 size={32} /></div>
                <h4>No active refunds</h4>
                <p>Refunds for security deposits or overpayments will appear here.</p>
            </div>
        </div>
    );

    return (
        <div className="dashboard-shell">
            <Sidebar />
            <div className="content-container">
                <Header />
                <main className="payment-hub">
                    <header className="hub-header">
                        <div className="header-text">
                            <h1>{checkoutData ? 'Checkout' : 'Billing & Payments'}</h1>
                        </div>
                        <div className="header-buttons">
                            <button className="btn-ghost"><ExternalLink size={16}/> View Contracts</button>
                        </div>
                    </header>

                    {!checkoutData && (
                        <div className="tabs-wrapper">
                            <nav className="modern-tabs">
                                {[
                                    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16}/> },
                                    { id: 'upcoming', label: 'Upcoming', icon: <CalendarClock size={16}/> },
                                    { id: 'history', label: 'History', icon: <History size={16}/> },
                                    { id: 'refunds', label: 'Refunds', icon: <Undo2 size={16}/> },
                                    { id: 'methods', label: 'Methods', icon: <CreditCard size={16}/> },
                                    { id: 'pending', label: 'Requests', icon: <FileSearch size={16}/> },
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        className={activeTab === tab.id ? 'active' : ''} 
                                        onClick={() => setActiveTab(tab.id as TabType)}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}

                    <div className="viewport-container">
                        {checkoutData ? renderCheckout() : (
                            <>
                                {activeTab === 'overview' && renderOverview()}
                                {activeTab === 'upcoming' && renderUpcoming()}
                                {activeTab === 'history' && renderHistory()}
                                {activeTab === 'refunds' && renderRefunds()}
                                {activeTab === 'methods' && renderMethods()}
                                {activeTab === 'pending' && renderPending()}
                            </>
                        )}
                    </div>
                </main>
                <Footer />
            </div>

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="toast-success-overlay">
                    <div className="toast-card">
                        <div className="toast-icon"><CheckCircle2 size={24} /></div>
                        <div className="toast-body">
                            <h6>Payment Successful!</h6>
                            <p>Your lease is now active. Receipt sent to your email.</p>
                        </div>
                        <button className="toast-close" onClick={() => setShowSuccessToast(false)}>
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <CreditCardModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default TenantPayment;