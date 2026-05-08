import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Billing.css';
import { FaHistory, FaBoxOpen, FaCheckCircle, FaWallet } from 'react-icons/fa';
import authService from '../../../services/auth.service';

const Billing: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    
    // Toggle state for testing Subscribed vs Free
    const [isSubscribed, setIsSubscribed] = useState(false);
    
    const isFreePlan = !isSubscribed;

    return (
        <div className="billing-wrapper animate-fade-in">
            {/* Dev toggle */}
            <div className="dev-toggle" style={{ marginBottom: '20px', padding: '10px', background: '#fee2e2', textAlign: 'center', borderRadius: '8px', color: '#991b1b', fontWeight: 'bold' }}>
                <label style={{ cursor: 'pointer' }}>
                    <input 
                        type="checkbox" 
                        checked={isSubscribed} 
                        onChange={(e) => setIsSubscribed(e.target.checked)} 
                        style={{ marginRight: '10px' }}
                    />
                    Toggle Subscribed State (For Demo)
                </label>
            </div>

            <div className={`current-plan-card ${isFreePlan ? 'free-plan' : ''}`}>
                <div className="plan-info">
                    <span className="plan-badge">
                        {isFreePlan ? 'Basic Tier' : 'Premium Tier'}
                    </span>
                    <h2>
                        {isFreePlan ? 'Free Plan' : 'HOMi Pro'}
                        <span>{isFreePlan ? 'EGP 0/mo' : 'EGP 399/mo'}</span>
                    </h2>
                    <p>{isFreePlan ? 'No subscription active.' : 'Your pro benefits are fully active.'}</p>
                </div>
                {isFreePlan && (
                    <button className="upgrade-btn pulse-btn" onClick={() => navigate('/homi-pro')}>
                        Upgrade to Pro
                    </button>
                )}
            </div>

            <div className="billing-grid">
                <section className="billing-section">
                    <header className="section-header">
                        <h3><FaWallet className="icon-blue" /> Current Balance</h3>
                    </header>
                    <div className="balance-display" style={{ padding: '40px 20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px' }}>
                        <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '10px' }}>HOMi Wallet Balance</p>
                        <h2 style={{ fontSize: '3rem', color: '#0f172a', margin: 0, fontWeight: 800 }}>EGP 0.00</h2>
                    </div>
                </section>

                <section className="billing-section">
                    <header className="section-header">
                        <h3><FaHistory className="icon-blue" /> Plan Expiration</h3>
                    </header>
                    {isFreePlan ? (
                        <div className="billing-empty-state" style={{ height: '250px' }}>
                            <FaBoxOpen className="empty-icon" />
                            <p style={{ marginBottom: '15px' }}>No plan is selected.</p>
                            <button 
                                onClick={() => navigate('/homi-pro')} 
                                style={{ 
                                    padding: '12px 24px', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    background: 'var(--blue-gradient)', 
                                    color: '#fff', 
                                    border: 'none', 
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                View HOMi Pro
                            </button>
                        </div>
                    ) : (
                        <div className="billing-empty-state" style={{ height: '250px', background: '#ecfdf5', borderColor: '#10b981' }}>
                            <FaCheckCircle className="empty-icon" style={{ color: '#10b981' }} />
                            <p style={{ color: '#065f46', fontWeight: 700, fontSize: '1.3rem', marginTop: '10px' }}>Your Premium Plan is Active!</p>
                            <p style={{ marginTop: '8px', fontSize: '1rem', color: '#047857' }}>Renews / Expires on: <strong>May 8, 2027</strong></p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Billing;