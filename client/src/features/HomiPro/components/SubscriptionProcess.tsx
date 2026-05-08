import React, { useState } from 'react';
import { FaCheckCircle, FaTimes, FaWallet, FaFileContract, FaCreditCard } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './SubscriptionProcess.css';

interface SubscriptionProcessProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userRole: string;
    planDetails: {
        billingCycle: string;
        months: number;
        totalPrice: number;
    };
}

const SubscriptionProcess: React.FC<SubscriptionProcessProps> = ({ isOpen, onClose, onSuccess, userRole, planDetails }) => {
    const [step, setStep] = useState(1);
    const [mockBalance, setMockBalance] = useState(0); // Initially 0, so user has to add funds
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen) return null;

    const renderStep1 = () => (
        <div className="sub-step step-1 animate-fade-in">
            <h2>Step 1: Review Your Pro Privileges</h2>
            <div className="privileges-box">
                {userRole === 'TENANT' && (
                    <ul>
                        <li><FaCheckCircle className="check-icon" /> Rent multiple properties at the same time.</li>
                        <li><FaCheckCircle className="check-icon" /> Continue renting new properties after your first lease expires.</li>
                        <li><FaCheckCircle className="check-icon" /> Bypass the 5-match limit for AI Roommate Matching.</li>
                    </ul>
                )}
                {userRole === 'LANDLORD' && (
                    <ul>
                        <li><FaCheckCircle className="check-icon" /> List more than 2 properties simultaneously.</li>
                        <li><FaCheckCircle className="check-icon" /> Boosted ranking for your listings in search results.</li>
                        <li><FaCheckCircle className="check-icon" /> Advanced tenant screening & analytics dashboard.</li>
                    </ul>
                )}
                {userRole === 'MAINTENANCE_PROVIDER' && (
                    <ul>
                        <li><FaCheckCircle className="check-icon" /> Receive and accept maintenance jobs directly from tenants.</li>
                        <li><FaCheckCircle className="check-icon" /> Verified 'Pro' badge to build trust.</li>
                        <li><FaCheckCircle className="check-icon" /> Zero commission on your first 10 premium jobs each month.</li>
                    </ul>
                )}
            </div>
            <div className="plan-summary-box">
                <p><strong>Plan:</strong> {planDetails.billingCycle.toUpperCase()}</p>
                <p><strong>Duration:</strong> {planDetails.months} {planDetails.months > 1 ? 'Months' : 'Month'}</p>
                <p><strong>Total Cost:</strong> EGP {planDetails.totalPrice}</p>
            </div>
            <button className="sub-btn primary-btn" onClick={() => setStep(2)}>Next: View Balance</button>
        </div>
    );

    const renderStep2 = () => {
        const hasSufficientFunds = mockBalance >= planDetails.totalPrice;

        return (
            <div className="sub-step step-2 animate-fade-in">
                <h2>Step 2: Payment Method & Balance</h2>
                <div className="balance-checker">
                    <div className="balance-info">
                        <FaWallet className="wallet-icon" />
                        <div>
                            <p>Current HOMi Wallet Balance</p>
                            <h3>EGP {mockBalance}</h3>
                        </div>
                    </div>
                    <div className="cost-info">
                        <p>Total Required:</p>
                        <h3>EGP {planDetails.totalPrice}</h3>
                    </div>
                </div>

                {!hasSufficientFunds ? (
                    <div className="insufficient-funds-msg">
                        <p className="error-text">Insufficient funds. Please add funds to your wallet to continue.</p>
                        <button className="sub-btn add-funds-btn" onClick={() => setMockBalance(mockBalance + planDetails.totalPrice + 500)}>
                            <FaCreditCard /> Add EGP {planDetails.totalPrice + 500} (Mock)
                        </button>
                    </div>
                ) : (
                    <div className="sufficient-funds-msg">
                        <FaCheckCircle className="check-icon" />
                        <p>You have sufficient funds to proceed.</p>
                    </div>
                )}

                <div className="step-actions">
                    <button className="sub-btn secondary-btn" onClick={() => setStep(1)}>Back</button>
                    <button 
                        className={`sub-btn primary-btn ${!hasSufficientFunds ? 'disabled' : ''}`} 
                        onClick={() => hasSufficientFunds && setStep(3)}
                        disabled={!hasSufficientFunds}
                    >
                        Next: Terms & Conditions
                    </button>
                </div>
            </div>
        );
    };

    const renderStep3 = () => (
        <div className="sub-step step-3 animate-fade-in">
            <h2>Step 3: Terms & Policies</h2>
            <div className="terms-box">
                <FaFileContract className="terms-icon" />
                <p>By subscribing to HOMi Pro, you agree to the recurring billing cycle specified in your plan details. Your subscription will automatically renew unless canceled.</p>
                <p><strong>Cancellation Policy:</strong> You may cancel at any time. Cancellations will take effect at the end of the current billing cycle. No partial refunds are provided.</p>
            </div>
            
            <label className="terms-checkbox-label">
                <input 
                    type="checkbox" 
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span>I agree to the <Link to="/terms" target="_blank" className="terms-link">terms & conditions</Link></span>
            </label>

            <div className="step-actions">
                <button className="sub-btn secondary-btn" onClick={() => setStep(2)}>Back</button>
                <button 
                    className={`sub-btn primary-btn ${!agreedToTerms ? 'disabled' : ''}`} 
                    onClick={() => agreedToTerms && setStep(4)}
                    disabled={!agreedToTerms}
                >
                    Next: Finalize
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => {
        const handlePay = () => {
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                setShowSuccess(true);
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            }, 1500);
        };

        if (showSuccess) {
            return (
                <div className="sub-step step-success animate-fade-in">
                    <div className="success-circle">
                        <FaCheckCircle />
                    </div>
                    <h2>Plan Updated Successfully!</h2>
                    <p>Welcome to HOMi Pro. Redirecting to your dashboard...</p>
                </div>
            );
        }

        return (
            <div className="sub-step step-4 animate-fade-in">
                <h2>Step 4: Finalize & Pay</h2>
                <div className="final-checkout-box">
                    <div className="checkout-row">
                        <span>Total Cost</span>
                        <strong>EGP {planDetails.totalPrice}</strong>
                    </div>
                    <div className="checkout-row">
                        <span>Wallet Balance After Payment</span>
                        <strong>EGP {mockBalance - planDetails.totalPrice}</strong>
                    </div>
                </div>

                <div className="step-actions split">
                    <button className="sub-btn secondary-btn" onClick={() => setStep(3)} disabled={isProcessing}>Back</button>
                    <button className="sub-btn pay-btn" onClick={handlePay} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : `Pay EGP ${planDetails.totalPrice}`}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="sub-modal-overlay">
            <div className="sub-modal-container">
                <button className="sub-modal-close" onClick={onClose}><FaTimes /></button>
                
                <div className="sub-stepper">
                    <div className={`stepper-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className={`stepper-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`stepper-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                    <div className={`stepper-line ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`stepper-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                    <div className={`stepper-line ${step >= 4 ? 'active' : ''}`}></div>
                    <div className={`stepper-dot ${step >= 4 ? 'active' : ''}`}>4</div>
                </div>

                <div className="sub-modal-content">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionProcess;
