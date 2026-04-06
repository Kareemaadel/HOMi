import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import { 
    LayoutDashboard, CalendarClock, History, Undo2, 
    CreditCard, FileSearch, Download, Plus, CheckCircle2, 
    Clock, ArrowUpRight, Wallet, Receipt, ShieldCheck,
    TrendingUp, ExternalLink, MoreVertical, MapPin, Loader2, X,
    Landmark, SearchX, CalendarX
} from 'lucide-react';
import './TenantPayment.css';
import CreditCardModal from '../components/CreditCardModal';
import contractService, { type LandlordContract } from '../../../services/contract.service';
import rentalRequestService, { type MyRentalRequest } from '../../../services/rental-request.service';
import { authService } from '../../../services/auth.service';
import paymentMethodService, { type SavedPaymentMethod } from '../../../services/payment-method.service';

type TabType = 'overview' | 'upcoming' | 'history' | 'refunds' | 'methods' | 'pending';

interface CheckoutInfo {
    name: string;
    price: number;
    location: string;
}

const formatMoney = (amount: number): string =>
    `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatShortDate = (isoDate: string): string => {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
};

const formatLongDate = (isoDate: string): string => {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
};

const getDueDayFromContract = (rentDueDate: string | null | undefined): number => {
    if (rentDueDate === '1ST_OF_MONTH') return 1;
    if (rentDueDate === '5TH_OF_MONTH') return 5;
    return 1;
};

const TenantPayment: React.FC = () => {
    // --- UI STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [checkoutData, setCheckoutData] = useState<CheckoutInfo | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const location = useLocation();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [dataError, setDataError] = useState<string | null>(null);
    const [tenantContracts, setTenantContracts] = useState<LandlordContract[]>([]);
    const [tenantRequests, setTenantRequests] = useState<MyRentalRequest[]>([]);

    // --- ENTITY DATA STATES ---
    // Overview Tab
    const [hasCurrentBalance, setHasCurrentBalance] = useState(false);
    const [hasNextRent, setHasNextRent] = useState(true);
    const [hasAnnualSpend, setHasAnnualSpend] = useState(true);
    const [hasActiveProtection, setHasActiveProtection] = useState(true);
    
    // Checkout
    const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>([]);
    
    // Other Tabs
    const [hasUpcomingPayments, setHasUpcomingPayments] = useState(true);
    const [hasPaymentHistory, setHasPaymentHistory] = useState(true);
    const [hasRefunds, setHasRefunds] = useState(true);
    const [hasPendingRequests, setHasPendingRequests] = useState(true);

    const tenantProfile = authService.getCurrentUser()?.profile;
    const accountHolderName = `${tenantProfile?.firstName ?? ''} ${tenantProfile?.lastName ?? ''}`.trim() || 'Account Holder';

    // --- EFFECTS ---
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab as TabType);
        }
    }, [location.state]);

    useEffect(() => {
        let mounted = true;

        const loadPaymentData = async () => {
            try {
                setIsLoadingData(true);
                setDataError(null);

                const [contractsRes, requestsRes] = await Promise.all([
                    contractService.getTenantContracts({ page: 1, limit: 50 }),
                    rentalRequestService.getMyRequests({ page: 1, limit: 50 })
                ]);

                if (!mounted) return;

                const contracts = contractsRes.data ?? [];
                const requests = requestsRes.data ?? [];

                setTenantContracts(contracts);
                setTenantRequests(requests);

                const activeContract = contracts.find((c) => ['ACTIVE', 'PENDING_PAYMENT', 'PENDING_TENANT'].includes(c.status));
                const paidContracts = contracts.filter((c) => c.status === 'ACTIVE');
                const approvedOrPendingRequests = requests.filter((r) => r.status === 'APPROVED' || r.status === 'PENDING');

                setHasNextRent(Boolean(activeContract));
                setHasCurrentBalance(Boolean(activeContract && activeContract.status !== 'ACTIVE'));
                setHasAnnualSpend(paidContracts.length > 0);
                setHasActiveProtection(contracts.length > 0);
                setHasUpcomingPayments(Boolean(activeContract));
                setHasPaymentHistory(paidContracts.length > 0);
                setHasPendingRequests(approvedOrPendingRequests.length > 0);
                setHasRefunds(false);

                const methods = await paymentMethodService.getMyMethods();
                if (mounted) {
                    setSavedMethods(methods);
                }
            } catch {
                if (!mounted) return;
                setDataError('Could not load latest payment data.');
            } finally {
                if (mounted) setIsLoadingData(false);
            }
        };

        void loadPaymentData();

        return () => {
            mounted = false;
        };
    }, []);

    const activeContract = tenantContracts.find((c) => ['ACTIVE', 'PENDING_PAYMENT', 'PENDING_TENANT'].includes(c.status));
    const nextRentAmount = Number(activeContract?.rentAmount ?? activeContract?.property?.monthlyPrice ?? 0);
    const currentBalanceAmount = hasCurrentBalance ? nextRentAmount : 0;
    const paidContracts = tenantContracts.filter((c) => c.status === 'ACTIVE');
    const annualSpendAmount = paidContracts.reduce((sum, c) => sum + Number(c.rentAmount ?? c.property?.monthlyPrice ?? 0), 0);

    const getNextDueDateLabel = (): string => {
        if (!activeContract) return 'No active lease';
        const dueDay = getDueDayFromContract(activeContract.rentDueDate);
        const now = new Date();
        const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
        if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1);
        const diffDays = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'} (${formatShortDate(dueDate.toISOString())})`;
    };

    const upcomingPayments = activeContract
        ? Array.from({ length: 3 }, (_, idx) => {
            const dueDay = getDueDayFromContract(activeContract.rentDueDate);
            const base = new Date();
            const date = new Date(base.getFullYear(), base.getMonth() + idx, dueDay);
            return {
                title: `${date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} Rent`,
                date: formatShortDate(date.toISOString()),
                amount: nextRentAmount,
                status: idx === 0 ? 'Active' : 'Scheduled',
            };
        })
        : [];

    const historyRows = [...paidContracts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((c) => ({
            date: formatLongDate(c.createdAt),
            ref: `${c.property?.title ?? 'Rent Payment'} - ${c.contractId}`,
            amount: Number(c.rentAmount ?? c.property?.monthlyPrice ?? 0),
            status: 'Success',
        }));

    const requestCards = tenantRequests
        .filter((r) => r.status === 'APPROVED' || r.status === 'PENDING')
        .map((r) => ({
            id: r.id,
            property: r.property.title,
            status: r.status === 'APPROVED' ? 'Accepted' : 'Pending',
            price: Number(r.property.monthlyPrice ?? 0),
            loc: r.property.address,
        }));

    const successfulPaymentsLabel = `${historyRows.length} successful payment${historyRows.length === 1 ? '' : 's'}`;
    const hasSavedMethods = savedMethods.length > 0;
    const primaryMethod = savedMethods.find((m) => m.isDefault) ?? savedMethods[0] ?? null;
    const paymentMethodLabel = primaryMethod
        ? `${primaryMethod.brand.toUpperCase()} ending in ${primaryMethod.last4}`
        : 'No saved method';

    const handlePaymentMethodSaved = (created: SavedPaymentMethod) => {
        setSavedMethods((prev) => {
            const withoutDuplicates = prev.filter((m) => m.id !== created.id);
            return [created, ...withoutDuplicates];
        });
    };

    // --- HANDLERS ---
    const handleConfirmPayment = () => {
        setIsProcessing(true);
        // Simulate API Call
        setTimeout(() => {
            setIsProcessing(false);
            setCheckoutData(null); // Return to dashboard
            setShowSuccessToast(true);
            
            // Automatically switch necessary states to "populated" on successful payment
            setHasPaymentHistory(true); 
            setHasAnnualSpend(true);
            
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
                                {hasSavedMethods ? (
                                    <div className="mini-card selected">
                                        <div className="card-brand-info">
                                            <CreditCard size={18} />
                                            <span>{paymentMethodLabel}</span>
                                        </div>
                                        <CheckCircle2 size={16} className="text-success" />
                                    </div>
                                ) : (
                                    <div className="empty-method-prompt text-muted" style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '12px' }}>
                                        No payment methods saved.
                                    </div>
                                )}
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
                    {hasCurrentBalance && <div className="card-glass-overlay"></div>}
                    <div className="card-content">
                        <div className="icon-wrap-blur"><Wallet size={20} /></div>
                        <span>Current Balance</span>
                        <div className="amount-row">
                            <h2>{formatMoney(currentBalanceAmount)}</h2>
                            {hasCurrentBalance && <span className="mini-badge">Utilities</span>}
                        </div>
                        <p className={`card-footer-text ${hasCurrentBalance ? '' : 'opacity-70'}`}>
                            {hasCurrentBalance ? "Auto-pay scheduled for April 15" : "No outstanding balances"}
                        </p>
                    </div>
                </div>

                <div className="stat-card-white">
                    <div className="card-header-row">
                        <span>Next Rent</span>
                        <TrendingUp size={16} className={hasNextRent ? "text-success" : "text-muted"} />
                    </div>
                    <div className="flex-baseline">
                        <h3 className={hasNextRent ? "" : "text-muted"}>{formatMoney(hasNextRent ? nextRentAmount : 0)}</h3>
                        <span className="sub-label">/mo</span>
                    </div>
                    <div className="due-indicator">
                        {hasNextRent && <div className="pulse-dot"></div>}
                        <span className={hasNextRent ? "" : "text-muted"}>
                            {hasNextRent ? getNextDueDateLabel() : "No active lease"}
                        </span>
                    </div>
                </div>

                <div className="stat-card-white">
                    <div className="card-header-row">
                        <span>Annual Spend</span>
                        <Receipt size={16} className="text-slate" />
                    </div>
                    <h3 className={hasAnnualSpend ? "" : "text-muted"}>{formatMoney(hasAnnualSpend ? annualSpendAmount : 0)}</h3>
                    <p className="sub-label-sm">{hasAnnualSpend ? successfulPaymentsLabel : "No payments made yet"}</p>
                </div>
            </div>

            <div className={`stripe-style-banner ${hasActiveProtection ? '' : 'inactive-banner'}`}>
                <div className="banner-left">
                    <div className="banner-icon">
                        {hasActiveProtection ? <ShieldCheck size={24} /> : <FileSearch size={24} />}
                    </div>
                    <div className="banner-copy">
                        <h4>{hasActiveProtection ? "Payment protection is active" : "Why wait? Looking for a place?"}</h4>
                        <p>{hasActiveProtection 
                            ? "Your transactions are encrypted and monitored for your security." 
                            : "Browse properties and submit applications to get started."}
                        </p>
                    </div>
                </div>
                {hasActiveProtection ? (
                    <button className="btn-vercel-black" onClick={() => setActiveTab('upcoming')}>
                        Pay Now! <ArrowUpRight size={16} />
                    </button>
                ) : (
                    <button className="btn-vercel-black" style={{ background: '#334155' }}>
                        Find Properties
                    </button>
                )}
            </div>
        </div>
    );

    const renderUpcoming = () => (
        <div className="tab-viewport animate-fade-up">
            {hasUpcomingPayments ? (
                <div className="list-container">
                    {upcomingPayments.map((item) => (
                        <div className="list-row" key={`${item.title}-${item.date}`}>
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
                                <span className="row-amount">{formatMoney(item.amount)}</span>
                                <button 
                                    className={item.status === 'Active' ? 'btn-pay-now' : 'btn-manage-ghost'}
                                    onClick={item.status === 'Active' ? () => setCheckoutData({ 
                                        name: item.title, 
                                        price: item.amount, 
                                        location: activeContract?.property?.address ?? 'Current Rental' 
                                    }) : undefined}
                                >
                                    {item.status === 'Active' ? 'Pay Now' : 'Manage'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon"><CalendarX size={32} /></div>
                    <h4>No Upcoming Payments</h4>
                    <p>You don't have any upcoming rent or utility payments scheduled. Once your lease begins, they will appear here.</p>
                </div>
            )}
        </div>
    );

    const renderHistory = () => (
        <div className="tab-viewport animate-fade-up">
            {hasPaymentHistory ? (
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
                            {historyRows.map((row) => (
                                <tr key={`${row.ref}-${row.date}`}>
                                    <td>{row.date}</td>
                                    <td className="font-medium">{row.ref}</td>
                                    <td>{formatMoney(row.amount)}</td>
                                    <td><span className="pill success">{row.status}</span></td>
                                    <td className="text-right">
                                        <button className="icon-btn"><Download size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon"><History size={32} /></div>
                    <h4>No Payment History</h4>
                    <p>You haven't made any payments on the platform yet. Past invoices and receipts will be stored securely here.</p>
                </div>
            )}
        </div>
    );

    const renderPending = () => (
        <div className="tab-viewport animate-fade-up">
            {hasPendingRequests ? (
                <div className="grid-responsive">
                    {requestCards.map((req) => (
                        <div className="application-card-premium" key={req.id}>
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
                                    <span>Offer</span>
                                        <span>{formatMoney(req.price)}</span>
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
            ) : (
                <div className="empty-state">
                    <div className="empty-icon"><SearchX size={32} /></div>
                    <h4>No Active Applications</h4>
                    <p>You haven't submitted any rental offers. Pending offers and approved lease payments will appear here.</p>
                </div>
            )}
        </div>
    );

   const renderMethods = () => (
        <div className="tab-viewport animate-fade-in">
            <div className="methods-viewport">
                {/* Visual Card Section */}
                {hasSavedMethods ? (
                    <div className="card-visual bank-account">
                        <div className="card-top-row">
                            <span className="bank-logo">{primaryMethod?.brand?.toUpperCase() ?? 'CARD'}</span>
                            <div className="chip-gold"></div>
                        </div>
                        <div className="card-mid-row">
                            <div className="iban-display">•••• •••• •••• {primaryMethod?.last4 ?? '0000'}</div>
                        </div>
                        <div className="card-bottom-row">
                            <span className="card-holder-label">Account Holder</span>
                            <span className="card-holder-name">{primaryMethod?.cardholderName ?? accountHolderName}</span>
                        </div>
                    </div>
                ) : (
                    <div className="card-visual empty-card">
                        <div className="empty-card-content">
                            <CreditCard size={32} className="empty-card-icon" />
                            <span>No Methods Added</span>
                        </div>
                    </div>
                )}

                {/* List Section */}
                <div className="methods-list-side">
                    {hasSavedMethods ? (
                        <div className="method-entry active">
                            <div className="method-icon-wrap"><Landmark size={20}/></div>
                            <div className="method-info-text">
                                <h5>{primaryMethod?.brand?.toUpperCase() ?? 'Card'} •••• {primaryMethod?.last4 ?? '0000'}</h5>
                                <p>{primaryMethod?.isDefault ? 'Primary payment method' : 'Saved payment method'}</p>
                            </div>
                            <CheckCircle2 size={18} className="ml-auto text-success" />
                        </div>
                    ) : (
                        <div className="empty-method-text" style={{ marginBottom: '20px', color: '#64748b' }}>
                            <p>You haven't linked a payment method yet. Add a credit card or bank account to quickly pay for deposits and rent.</p>
                        </div>
                    )}

                    <button className="btn-add-method" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Add New Payment Method
                    </button>
                </div>
            </div>
        </div>
    );

    const renderRefunds = () => (
        <div className="tab-viewport animate-fade-up">
            {hasRefunds ? (
                <div className="list-container">
                    <div className="list-row" style={{ borderLeft: '4px solid #f59e0b' }}>
                        <div className="row-main">
                            <div className="calendar-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                                <Undo2 size={24} />
                            </div>
                            <div className="row-text">
                                <h5>Security Deposit Return</h5>
                                <p>Processing back to Chase •••• 9901</p>
                            </div>
                        </div>
                        <div className="row-actions">
                            <span className="row-amount text-success">+$500.00</span>
                            <span className="status-tag pending">Processing</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon"><Undo2 size={32} /></div>
                    <h4>No active refunds</h4>
                    <p>Refunds for security deposits or overpayments will appear here.</p>
                </div>
            )}
        </div>
    );

    const viewportContent = (() => {
        if (isLoadingData && !checkoutData) {
            return (
                <div className="empty-state">
                    <div className="empty-icon"><Loader2 size={32} className="animate-spin" /></div>
                    <h4>Loading payment data</h4>
                    <p>Please wait while we fetch your latest payment records.</p>
                </div>
            );
        }

        if (dataError && !checkoutData) {
            return (
                <div className="empty-state">
                    <div className="empty-icon"><X size={32} /></div>
                    <h4>Could not load payments</h4>
                    <p>{dataError}</p>
                </div>
            );
        }

        if (checkoutData) {
            return renderCheckout();
        }

        return (
            <>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'upcoming' && renderUpcoming()}
                {activeTab === 'history' && renderHistory()}
                {activeTab === 'refunds' && renderRefunds()}
                {activeTab === 'methods' && renderMethods()}
                {activeTab === 'pending' && renderPending()}
            </>
        );
    })();

    return (
        <div className="dashboard-shell">
            <Sidebar />
            <div className="content-container">
                <Header />
                <main className="payment-hub">
                    <header className="hub-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="header-text">
                            <h1>{checkoutData ? 'Checkout' : 'Billing & Payments'}</h1>
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
                        {viewportContent}
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
                onSaved={handlePaymentMethodSaved}
            />
        </div>
    );
};

export default TenantPayment;