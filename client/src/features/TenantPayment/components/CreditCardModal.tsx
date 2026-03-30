import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Lock, Info, CheckCircle } from 'lucide-react';
import './CreditCardModal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreditCardModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [cardData, setCardData] = useState({
        number: '',
        holder: '',
        expiry: '',
        cvv: ''
    });
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;

        // Auto-format Card Number: Add space after every 4 digits
        if (name === 'number') {
            value = value
                .replace(/\D/g, '') // Remove all non-digit characters
                .replace(/(\d{4})(?=\d)/g, '$1 ') // Add a space after every 4 digits
                .trim();
        }

        // Auto-format Expiry Date: Add " / " after the first 2 digits (MM)
        if (name === 'expiry') {
            value = value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 2) {
                value = `${value.slice(0, 2)} / ${value.slice(2, 4)}`;
            }
        }

        // CVV should only be numbers
        if (name === 'cvv') {
            value = value.replace(/\D/g, '');
        }

        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Trigger success message
        setIsSuccess(true);

        // Optional: Close modal automatically after 2.5 seconds
        setTimeout(() => {
            setIsSuccess(false);
            onClose();
            // Reset form if needed
            setCardData({ number: '', holder: '', expiry: '', cvv: '' });
        }, 2500);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="credit-card-modal-container animate-slide-up" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="header-icon-title">
                        <div className="shield-icon-box"><ShieldCheck size={20} /></div>
                        <h3>Add Payment Method</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <div className="modal-body">
                    {/* Live Card Preview */}
                    <div className={`card-preview-visual ${cardData.number.startsWith('4') ? 'visa-theme' : 'master-theme'}`}>
                        <div className="card-top-row">
                            <CreditCard size={32} strokeWidth={1.5} />
                            <span className="card-type-label">
                                {cardData.number.startsWith('4') ? 'VISA' : 'MASTERCARD'}
                            </span>
                        </div>
                        <div className="card-number-display">
                            {cardData.number || '•••• •••• •••• ••••'}
                        </div>
                        <div className="card-bottom-row">
                            <div className="card-holder-info">
                                <label>Card Holder</label>
                                <span>{cardData.holder || 'YOUR NAME'}</span>
                            </div>
                            <div className="card-expiry-info">
                                <label>Expires</label>
                                <span>{cardData.expiry || 'MM/YY'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Success Message Banner */}
                    {isSuccess && (
                        <div className="success-banner">
                            <CheckCircle size={18} />
                            <span>Payment method added successfully!</span>
                        </div>
                    )}

                    {/* Input Form */}
                    <form className="card-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Cardholder Name</label>
                            <input 
                                type="text" 
                                name="holder"
                                value={cardData.holder}
                                placeholder="e.g. John Doe"
                                onChange={handleInputChange}
                                maxLength={26}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Card Number</label>
                            <div className="input-with-icon">
                                <Lock size={14} className="input-lock" />
                                <input 
                                    type="text" 
                                    name="number"
                                    value={cardData.number}
                                    placeholder="0000 0000 0000 0000"
                                    onChange={handleInputChange}
                                    maxLength={19}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row-dual">
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input 
                                    type="text" 
                                    name="expiry"
                                    value={cardData.expiry}
                                    placeholder="MM / YY"
                                    onChange={handleInputChange}
                                    maxLength={7} // 4 digits + 3 spaces/slashes
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="flex-align">
                                    CVV <Info size={12} className="info-icon" />
                                </label>
                                <input 
                                    type="password" 
                                    name="cvv"
                                    value={cardData.cvv}
                                    placeholder="•••"
                                    onChange={handleInputChange}
                                    maxLength={4} // Some AMEX cards have 4
                                    required
                                />
                            </div>
                        </div>

                        <div className="security-notice">
                            <Lock size={12} />
                            <p>Your payment information is processed securely and is never stored on our local servers.</p>
                        </div>

                        <button type="submit" className="submit-card-btn" disabled={isSuccess}>
                            {isSuccess ? 'Saving...' : 'Save Payment Method'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreditCardModal;