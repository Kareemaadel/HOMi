import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import RentDetails from '../components/RentDetails';
import SecurityDeposit from '../components/SecurityDeposit';
import ServiceFee from '../components/ServiceFee';
import TotalAmount from '../components/TotalAmount';
import ContractPreview from '../components/ContractPreview';
import { contractService } from '../../../services/contract.service';
import './PrePayment.css';

const PrePayment: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const contractId = searchParams.get('contractId') || '';

    const [isFullPayment, setIsFullPayment] = useState(false);
    const [monthlyRent, setMonthlyRent] = useState(2400);
    const durationMonths = 12;
    const [depositAmount, setDepositAmount] = useState(3000);
    const [serviceFeeOverride, setServiceFeeOverride] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadContract = async () => {
            if (!contractId) {
                setIsLoading(false);
                setError('Missing contract ID. Open this page from a completed contract.');
                return;
            }

            try {
                const contract = await contractService.getContractById(contractId);
                if (!isMounted) return;

                setMonthlyRent(contract.paymentTerms.rentAmount ?? 0);
                setDepositAmount(contract.paymentTerms.securityDeposit ?? 0);
                setServiceFeeOverride(contract.paymentTerms.serviceFee);
                setError(null);
            } catch {
                if (!isMounted) return;
                setError('Could not load contract details. Please try again from Contracts page.');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        void loadContract();

        return () => {
            isMounted = false;
        };
    }, [contractId]);
    
    const baseRent = useMemo(
        () => (isFullPayment ? (monthlyRent * durationMonths) : monthlyRent),
        [isFullPayment, monthlyRent, durationMonths]
    );
    const platformFee = serviceFeeOverride ?? ((baseRent + depositAmount) * 0.02);
    const total = baseRent + depositAmount + platformFee;

    const handleProceedToPayment = async () => {
        if (!contractId) return;

        try {
            setIsRedirecting(true);
            setError(null);
            const checkout = await contractService.initiatePaymobPayment(contractId);
            globalThis.location.href = checkout.checkoutUrl;
        } catch {
            setError('Failed to start Paymob checkout. Please try again.');
            setIsRedirecting(false);
        }
    };

    return (
        <div className="prepayment-wrapper">
            <Header />
            <div className="prepayment-container">
                <Sidebar />
                <main className="prepayment-main">

                    {isLoading && <div className="prepayment-inline-state">Loading contract payment details...</div>}
                    {!isLoading && error && <div className="prepayment-inline-error">{error}</div>}
                    {!isLoading && !error && (
                        <div className="prepayment-route-note">
                            Contract: <strong>{contractId}</strong>
                        </div>
                    )}


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
            <button className="proceed-btn" onClick={handleProceedToPayment} disabled={isLoading || !!error || isRedirecting}>
                <span className="btn-text">{isRedirecting ? 'Redirecting to Paymob...' : 'Proceed to Secure Payment'}</span>
                <span className="btn-shine"></span>
            </button>
            <div className="secure-footer">
                <div className="secure-badge">
                    <span className="pulse-dot"></span>
                    <span>🔒 Bank-Grade Security</span>
                </div>
                <p>Transaction encrypted via 256-bit SSL</p>
            </div>
        </div>
    </div>
</div>
                    </div>
                    <div className="prepayment-nav-actions">
                        <button type="button" className="prepayment-back-btn" onClick={() => navigate('/tenant-contracts')}>
                            Back to Contracts
                        </button>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default PrePayment;