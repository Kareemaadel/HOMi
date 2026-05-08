import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SubscriptionProcess from '../components/SubscriptionProcess';
import Header from '../../../components/global/header';
import Footer from '../../../components/global/footer';
import TenantSidebar from '../../../components/global/Tenant/sidebar';
import LandlordSidebar from '../../../components/global/Landlord/sidebar';
import MaintenanceSideBar from '../../Maintenance/MaintenanceProvider/SideBar/MaintenanceSideBar';
import { authService } from '../../../services/auth.service';
import { FaCheckCircle, FaCrown, FaRobot, FaHome, FaTools, FaBuilding, FaStar, FaBolt, FaArrowRight } from 'react-icons/fa';
import './ProMain.css';

const ProMain = () => {
    const user = authService.getCurrentUser()?.user;
    const role = user?.role || 'TENANT';
    const hasSidebar = !!role;

    // Toggle for testing both states visually
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'custom'>('yearly');
    const [customMonths, setCustomMonths] = useState<number>(3);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const getExpirationDate = () => {
        const date = new Date();
        const monthsToAdd = billingCycle === 'yearly' ? 12 : billingCycle === 'monthly' ? 1 : customMonths;
        date.setMonth(date.getMonth() + monthsToAdd);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const renderSidebar = () => {
        if (role === 'TENANT') return <TenantSidebar />;
        if (role === 'LANDLORD') return <LandlordSidebar />;
        if (role === 'MAINTENANCE_PROVIDER') return <MaintenanceSideBar />;
        return null;
    };

    const handleSubscribe = () => {
        setIsModalOpen(true);
    };

    const renderUnsubscribed = () => (
        <div className="pro-marketing-container animate-fade-in">
            <div className="pro-hero">
                <div className="pro-badge"><FaCrown /> HOMi Pro</div>
                <h1>Unlock the Ultimate Real Estate Experience</h1>
                <p>Elevate your journey with exclusive premium features designed for power users, ambitious landlords, and top-tier maintenance providers.</p>
                <div className="billing-toggle">
                    <button className={billingCycle === 'monthly' ? 'active' : ''} onClick={() => setBillingCycle('monthly')}>Monthly</button>
                    <button className={billingCycle === 'yearly' ? 'active' : ''} onClick={() => setBillingCycle('yearly')}>Annually <span className="save-badge">Save 20%</span></button>
                    <button className={billingCycle === 'custom' ? 'active' : ''} onClick={() => setBillingCycle('custom')}>Custom</button>
                </div>
            </div>

            <div className="pro-features-grid">
                {/* Tenant Features */}
                <div className="pro-feature-card tenant-feature">
                    <div className="feature-icon"><FaHome /></div>
                    <h3>For Tenants</h3>
                    <ul className="feature-list">
                        <li><FaCheckCircle className="check" /> <strong>Concurrent Leases:</strong> Rent multiple properties at the same time.</li>
                        <li><FaCheckCircle className="check" /> <strong>Endless Journeys:</strong> Continue renting new properties after your first lease expires.</li>
                        <li><FaCheckCircle className="check" /> <strong>Unlimited AI Matches:</strong> Bypass the 5-match limit for AI Roommate Matching.</li>
                        <li><FaCheckCircle className="check" /> Priority customer support & faster application processing.</li>
                    </ul>
                </div>

                {/* Landlord Features */}
                <div className="pro-feature-card landlord-feature">
                    <div className="feature-icon"><FaBuilding /></div>
                    <h3>For Landlords</h3>
                    <ul className="feature-list">
                        <li><FaCheckCircle className="check" /> <strong>Infinite Portfolio:</strong> List more than 2 properties simultaneously.</li>
                        <li><FaCheckCircle className="check" /> <strong>Premium Visibility:</strong> Boosted ranking for your listings in search results.</li>
                        <li><FaCheckCircle className="check" /> Advanced tenant screening & analytics dashboard.</li>
                        <li><FaCheckCircle className="check" /> Dedicated account manager.</li>
                    </ul>
                </div>

                {/* Maintenance Features */}
                <div className="pro-feature-card maintenance-feature">
                    <div className="feature-icon"><FaTools /></div>
                    <h3>For Maintenance Providers</h3>
                    <ul className="feature-list">
                        <li><FaCheckCircle className="check" /> <strong>Direct Tenant Requests:</strong> Receive and accept maintenance jobs directly from tenants.</li>
                        <li><FaCheckCircle className="check" /> <strong>Pro Badge:</strong> Stand out with a verified 'Pro' badge to build trust.</li>
                        <li><FaCheckCircle className="check" /> Zero commission on your first 10 premium jobs each month.</li>
                        <li><FaCheckCircle className="check" /> Early access to high-value commercial repair requests.</li>
                    </ul>
                </div>
            </div>

            <div className="pricing-section">
                <div className="pricing-card premium">
                    <div className="most-popular">Most Popular</div>
                    <h2>HOMi Pro</h2>
                    <div className="price">
                        <span className="currency">EGP</span>
                        <span className="amount">{billingCycle === 'yearly' ? '399' : '499'}</span>
                        <span className="period">/mo</span>
                    </div>
                    {billingCycle === 'yearly' && <p className="billed-annually">Billed annually at EGP 4,788</p>}
                    {billingCycle === 'custom' && (
                        <div className="custom-months-selector" style={{ marginBottom: '20px' }}>
                            <label style={{ color: 'var(--text-muted)' }}>Number of months: </label>
                            <input 
                                type="number" 
                                min="1" 
                                max="11" 
                                value={customMonths} 
                                onChange={(e) => setCustomMonths(Number(e.target.value))} 
                                style={{ width: '60px', padding: '5px', borderRadius: '5px', border: '1px solid #cbd5e1', marginLeft: '10px' }}
                            />
                            <p className="billed-annually" style={{ marginTop: '10px' }}>Total: EGP {customMonths * 499}</p>
                        </div>
                    )}
                    <button className="btn-subscribe" onClick={handleSubscribe}>Upgrade to Pro Now</button>
                    <p className="guarantee">7-day money-back guarantee. Cancel anytime.</p>
                </div>
            </div>
        </div>
    );

    const renderTenantPro = () => (
        <div className="pro-dashboard tenant-dashboard animate-fade-in">
            <div className="dashboard-header">
                <div className="welcome-text">
                    <h1>Welcome to your <span className="pro-gradient">Pro Hub</span></h1>
                    <p>Your premium tenant privileges are active and ready.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div className="pro-status-badge" style={{ marginTop: 0 }}><FaStar /> PRO ACTIVE</div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Plan Ends: {getExpirationDate()}</span>
                    <button 
                        onClick={() => setIsCancelModalOpen(true)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        Cancel plan
                    </button>
                </div>
            </div>

            <div className="pro-widgets-grid">
                <div className="pro-widget">
                    <div className="widget-icon"><FaRobot /></div>
                    <div className="widget-info">
                        <h3>AI Roommate Matching</h3>
                        <p>Usage: <strong>Unlimited</strong></p>
                        <span className="perk-label">Pro Perk</span>
                    </div>
                    <button className="widget-action" onClick={() => navigate('/roommate-matching')}>Find Matches <FaArrowRight /></button>
                </div>

                <div className="pro-widget">
                    <div className="widget-icon"><FaHome /></div>
                    <div className="widget-info">
                        <h3>Concurrent Leases</h3>
                        <p>Active Leases: <strong>2</strong> / ∞</p>
                        <span className="perk-label">Pro Perk</span>
                    </div>
                    <button className="widget-action" onClick={() => navigate('/browse-properties')}>Browse Properties <FaArrowRight /></button>
                </div>

                <div className="pro-widget highlight-widget">
                    <div className="widget-icon"><FaBolt /></div>
                    <div className="widget-info">
                        <h3>Endless Journeys</h3>
                        <p>Your account is unlocked for lifetime sequential rentals.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLandlordPro = () => (
        <div className="pro-dashboard landlord-dashboard animate-fade-in">
            <div className="dashboard-header">
                <div className="welcome-text">
                    <h1>Welcome to your <span className="pro-gradient">Pro Hub</span></h1>
                    <p>Your premium landlord privileges are active.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div className="pro-status-badge" style={{ marginTop: 0 }}><FaStar /> PRO ACTIVE</div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Plan Ends: {getExpirationDate()}</span>
                    <button 
                        onClick={() => setIsCancelModalOpen(true)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        Cancel plan
                    </button>
                </div>
            </div>

            <div className="pro-widgets-grid">
                <div className="pro-widget">
                    <div className="widget-icon"><FaBuilding /></div>
                    <div className="widget-info">
                        <h3>Infinite Portfolio</h3>
                        <p>Listed Properties: <strong>5</strong> / ∞</p>
                        <span className="perk-label">Limit Removed</span>
                    </div>
                    <button className="widget-action">Add New Property <FaArrowRight /></button>
                </div>

                <div className="pro-widget highlight-widget">
                    <div className="widget-icon"><FaCrown /></div>
                    <div className="widget-info">
                        <h3>Boosted Listings</h3>
                        <p>Your properties currently rank <strong>#1</strong> in your local area searches.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMaintenancePro = () => (
        <div className="pro-dashboard maintenance-dashboard animate-fade-in">
            <div className="dashboard-header">
                <div className="welcome-text">
                    <h1>Welcome to your <span className="pro-gradient">Pro Hub</span></h1>
                    <p>Your premium maintenance privileges are active.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div className="pro-status-badge" style={{ marginTop: 0 }}><FaStar /> PRO ACTIVE</div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Plan Ends: {getExpirationDate()}</span>
                    <button 
                        onClick={() => setIsCancelModalOpen(true)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        Cancel plan
                    </button>
                </div>
            </div>

            <div className="pro-widgets-grid">
                <div className="pro-widget">
                    <div className="widget-icon"><FaTools /></div>
                    <div className="widget-info">
                        <h3>Direct Tenant Requests</h3>
                        <p>Inbox: <strong>3 New Requests</strong></p>
                        <span className="perk-label">Pro Exclusive</span>
                    </div>
                    <button className="widget-action">View Inbox <FaArrowRight /></button>
                </div>

                <div className="pro-widget highlight-widget">
                    <div className="widget-icon"><FaCheckCircle /></div>
                    <div className="widget-info">
                        <h3>Pro Badge Active</h3>
                        <p>Tenants now see you as a Verified Pro Provider.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSubscribed = () => {
        if (role === 'TENANT') return renderTenantPro();
        if (role === 'LANDLORD') return renderLandlordPro();
        if (role === 'MAINTENANCE_PROVIDER') return renderMaintenancePro();
        return renderTenantPro(); // fallback
    };

    return (
        <div className={`pro-main-root ${hasSidebar ? 'with-sidebar' : 'guest-view'}`}>
            <Header />
            {renderSidebar()}

            <main className={hasSidebar ? 'main-wrapper' : 'pro-full-wrapper'}>
                {/* Temporary dev toggle for testing */}
                <div className="dev-toggle">
                    <label>
                        <input type="checkbox" checked={isSubscribed} onChange={(e) => setIsSubscribed(e.target.checked)} />
                        Toggle Subscribed State (For Demo)
                    </label>
                </div>

                <div className="pro-content-area">
                    {isSubscribed ? renderSubscribed() : renderUnsubscribed()}
                </div>
                <Footer />
            </main>

            <SubscriptionProcess 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    setIsSubscribed(true);
                    window.scrollTo(0, 0);
                }}
                userRole={role}
                planDetails={{
                    billingCycle,
                    months: billingCycle === 'yearly' ? 12 : billingCycle === 'monthly' ? 1 : customMonths,
                    totalPrice: billingCycle === 'yearly' ? 4788 : billingCycle === 'monthly' ? 499 : customMonths * 499
                }}
            />

            {isCancelModalOpen && (
                <div className="cancel-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="cancel-modal" style={{ background: 'white', padding: '40px', borderRadius: '24px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
                        <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Cancel Pro Plan?</h2>
                        <p style={{ color: '#475569', marginBottom: '20px', lineHeight: 1.6 }}>Are you sure you want to cancel your HOMi Pro subscription? You will lose access to all premium features at the end of your current billing cycle.</p>
                        <p style={{ color: '#475569', marginBottom: '30px', fontSize: '0.9rem' }}>Please review our <Link to="/terms" target="_blank" style={{ color: '#3b82f6', textDecoration: 'underline' }}>termination rules and conditions</Link> before proceeding.</p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                            <button 
                                onClick={() => setIsCancelModalOpen(false)}
                                style={{ padding: '12px 24px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Keep Plan
                            </button>
                            <button 
                                onClick={() => {
                                    setIsSubscribed(false);
                                    setIsCancelModalOpen(false);
                                }}
                                style={{ padding: '12px 24px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Confirm Cancellation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProMain;
