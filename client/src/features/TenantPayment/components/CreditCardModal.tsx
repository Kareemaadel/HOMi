import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Lock, Info } from 'lucide-react';
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

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCardData(prev => ({ ...prev, [name]: value }));
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

                    {/* Input Form */}
                    <form className="card-form" onSubmit={e => e.preventDefault()}>
                        <div className="form-group">
                            <label>Cardholder Name</label>
                            <input 
                                type="text" 
                                name="holder"
                                placeholder="e.g. John Doe"
                                onChange={handleInputChange}
                                maxLength={26}
                            />
                        </div>

                        <div className="form-group">
                            <label>Card Number</label>
                            <div className="input-with-icon">
                                <Lock size={14} className="input-lock" />
                                <input 
                                    type="text" 
                                    name="number"
                                    placeholder="0000 0000 0000 0000"
                                    onChange={handleInputChange}
                                    maxLength={19}
                                />
                            </div>
                        </div>

                        <div className="form-row-dual">
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input 
                                    type="text" 
                                    name="expiry"
                                    placeholder="MM / YY"
                                    onChange={handleInputChange}
                                    maxLength={5}
                                />
                            </div>
                            <div className="form-group">
                                <label className="flex-align">
                                    CVV <Info size={12} className="info-icon" />
                                </label>
                                <input 
                                    type="password" 
                                    name="cvv"
                                    placeholder="•••"
                                    onChange={handleInputChange}
                                    maxLength={3}
                                />
                            </div>
                        </div>

                        <div className="security-notice">
                            <Lock size={12} />
                            <p>Your payment information is processed securely and is never stored on our local servers.</p>
                        </div>

                        <button className="submit-card-btn">
                            Save Payment Method
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreditCardModal;