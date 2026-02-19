import React, { useState } from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import RentDetails from '../components/RentDetails';
import SecurityDeposit from '../components/SecurityDeposit';
import ServiceFee from '../components/ServiceFee';
import TotalAmount from '../components/TotalAmount';
import ContractPreview from '../components/ContractPreview';
import './PrePayment.css';

const PrePayment: React.FC = () => {
    // Mock data - In a real app, these would come from your state/API
    const [isFullPayment, setIsFullPayment] = useState(false);
    const monthlyRent = 2400;
    const durationMonths = 12;
    const depositAmount = 3000;
    
    const baseRent = isFullPayment ? (monthlyRent * durationMonths) : monthlyRent;
    const platformFee = (baseRent + depositAmount) * 0.02;
    const total = baseRent + depositAmount + platformFee;

    return (
        <div className="prepayment-wrapper">
            <Header />
            <div className="prepayment-container">
                <Sidebar />
                <main className="prepayment-main">


                    <div className="prepayment-grid">
                        {/* LEFT COLUMN: Details & Contract */}
                        <div className="review-details-column">
                            <RentDetails 
                                monthlyRent={monthlyRent} 
                                isFullPayment={isFullPayment} 
                                setIsFullPayment={setIsFullPayment}
                                duration={durationMonths}
                            />
                            <SecurityDeposit amount={depositAmount} />
                            <ContractPreview />
                        </div>

                        {/* RIGHT COLUMN: Sticky Summary */}
<div className="payment-summary-column">
    <div className="sticky-summary-card">
        <div className="summary-glass-head">
            <span className="summary-status-pill">Final Review</span>
            <h3>Order Summary</h3>
        </div>
        
        <div className="summary-content-body">
            <ServiceFee fee={platformFee} />
            <div className="summary-divider">
                <span className="divider-glow"></span>
            </div>
            <TotalAmount total={total} />
        </div>
        
        <div className="summary-action-area">
            <button className="proceed-btn">
                <span className="btn-text">Proceed to Secure Payment</span>
                <span className="btn-shine"></span>
            </button>
            <div className="secure-footer">
                <div className="secure-badge">
                    <span className="pulse-dot"></span>
                    🔒 Bank-Grade Security
                </div>
                <p>Transaction encrypted via 256-bit SSL</p>
            </div>
        </div>
    </div>
</div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default PrePayment;