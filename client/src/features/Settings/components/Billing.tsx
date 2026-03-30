import React, { useState } from 'react';
import './Billing.css';
import { FaCreditCard, FaDownload, FaHistory, FaBoxOpen, FaPlus } from 'react-icons/fa';
// Import the modal from the TenantPayment feature
import CreditCardModal from '../../TenantPayment/components/CreditCardModal';

const Billing: React.FC = () => {
    // State to handle modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // TOGGLE THIS TO TEST THE EMPTY STATE
    const hasBillingData = true;

    return (
        <div className="billing-wrapper animate-fade-in">
            {/* Header: Current Plan Card */}
            <div className={`current-plan-card ${!hasBillingData ? 'free-plan' : ''}`}>
                <div className="plan-info">
                    <span className="plan-badge">
                        {hasBillingData ? 'Active Plan' : 'Basic Tier'}
                    </span>
                    <h2>
                        {hasBillingData ? 'Landlord Pro' : 'Free Plan'} 
                        <span>{hasBillingData ? '$49/mo' : '$0/mo'}</span>
                    </h2>
                    <p>
                        {hasBillingData 
                            ? <>Next billing date: <strong>March 15, 2026</strong></> 
                            : 'Upgrade to unlock premium property management features.'}
                    </p>
                </div>
                <button className={`upgrade-btn ${!hasBillingData ? 'pulse-btn' : ''}`}>
                    {hasBillingData ? 'Manage Subscription' : 'Upgrade to Pro'}
                </button>
            </div>

            {/* Main Content: 2-Column Grid */}
            <div className="billing-grid">
                
                {/* Left Column: Payment Methods */}
                <section className="billing-section">
                    <header className="section-header">
                        <h3><FaCreditCard className="icon-blue" /> Payment Methods</h3>
                        {/* Added onClick handler here */}
                        <button className="add-method-btn" onClick={() => setIsModalOpen(true)}>
                            <FaPlus /> Add New
                        </button>
                    </header>

                    {hasBillingData ? (
                        <div className="method-card">
                            <div className="card-brand">VISA</div>
                            <div className="card-details">
                                <p>•••• •••• •••• 4242</p>
                                <span>Expires 12/28</span>
                            </div>
                            <button className="text-btn">Edit</button>
                        </div>
                    ) : (
                        <div className="billing-empty-state">
                            <FaCreditCard className="empty-icon" />
                            <p>No payment methods added</p>
                        </div>
                    )}
                </section>

                {/* Right Column: Recent Invoices */}
                <section className="billing-section">
                    <header className="section-header">
                        <h3><FaHistory className="icon-blue" /> Recent Invoices</h3>
                    </header>

                    {hasBillingData ? (
                        <div className="invoice-list">
                            {[1, 2, 3].map(i => (
                                <div className="invoice-item" key={i}>
                                    <div className="inv-meta">
                                        <strong>Feb 15, 2026</strong>
                                        <span>PRO-2026-00{i}</span>
                                    </div>
                                    <div className="inv-amount">$49.00</div>
                                    <button className="icon-btn" title="Download PDF">
                                        <FaDownload />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="billing-empty-state">
                            <FaBoxOpen className="empty-icon" />
                            <p>No billing history yet</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Render the modal exactly like TenantPayment.tsx does */}
            <CreditCardModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default Billing;