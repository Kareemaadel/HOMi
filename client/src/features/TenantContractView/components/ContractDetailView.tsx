import React, { useState } from 'react';
import { 
    X, ChevronRight, ChevronLeft, ShieldCheck, Pencil, 
    Landmark, Zap, Ban, User, DollarSign, Cpu, Clock, Globe, 
    Fingerprint, CheckCircle2, CreditCard, MoreVertical,
    Download, HelpCircle, FileText
} from 'lucide-react';
import { type LeaseContract } from '../pages/Contract';
import SignatureModal from './SignatureModal';
import './ContractDetailView.css';

interface Props {
    contract: LeaseContract;
    onClose: () => void;
}

const ContractDetailView: React.FC<Props> = ({ contract, onClose }) => {
    const [step, setStep] = useState(1);
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [savedSignature, setSavedSignature] = useState<string | null>(null);
    const [isFinalized, setIsFinalized] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const [tenantData, setTenantData] = useState({
        idNumber: '',
        emergencyName: '',
        emergencyPhone: '',
        confirmed: false
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSignatureSave = (signatureData: string) => {
        setSavedSignature(signatureData);
        setIsSignModalOpen(false);
    };

    const handleFinalExecute = () => {
        setIsFinalized(true);
    };

    if (isFinalized) {
        return (
            <div className="contract-overlay">
                <div className="detail-panel success-panel animate-slide-in">
                    <div className="success-content">
                        <div className="success-icon-badge">
                            <CheckCircle2 size={60} />
                        </div>
                        <h2>Agreement Executed</h2>
                        <p>The contract for <strong>{contract.property}</strong> has been legally signed and timestamped.</p>
                        
                        <div className="success-actions">
                            <button className="btn-pay-action" onClick={() => window.location.href = `/prepayment-page?contractId=${contract.id}`}>
                                <CreditCard size={18} /> Go to Payments Page
                            </button>
                            <button className="btn-close-dashboard" onClick={onClose}>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="contract-overlay">
            <div className="detail-panel animate-slide-in">
                <header className="panel-header">
                    <div className="header-title">
                        <h2>Step {step} of 4</h2>
                        <span>{contract.id} • {contract.property}</span>
                    </div>
                    <div className="header-actions">
                        <div className="action-menu-container">
                            <button 
                                className={`icon-btn-menu ${isMenuOpen ? 'active' : ''}`} 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <MoreVertical size={20}/>
                            </button>
                            {isMenuOpen && (
                                <div className="action-dropdown-menu animate-fade-in">
                                    <button onClick={() => setIsMenuOpen(false)}><Download size={16}/> Save PDF Copy</button>
                                    <button onClick={() => setIsMenuOpen(false)}><FileText size={16}/> Review Local Laws</button>
                                    <button onClick={() => setIsMenuOpen(false)}><HelpCircle size={16}/> Contract Help</button>
                                </div>
                            )}
                        </div>
                        <button className="close-btn" onClick={onClose}><X size={20}/></button>
                    </div>
                </header>

                <div className="panel-content">
                    <div className="contract-stepper">
                        {[1, 2, 3, 4].map((i) => (
                            <React.Fragment key={i}>
                                <div className={`step-pill ${step >= i ? 'active' : ''}`}>{i}</div>
                                {i < 4 && <div className={`step-line ${step > i ? 'active' : ''}`}></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* STEP 1: LANDLORD TERMS */}
                    {step === 1 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Landlord's Terms & Conditions</h3>
                            <section className="info-section">
                                <div className="section-title"><User size={16}/> <h4>Landlord Profile</h4></div>
                                <div className="autofill-grid">
                                    <div className="field"><label>Full Name</label><span>{contract.landlord}</span></div>
                                    <div className="field"><label>Contact</label><span>landlord@homi.com</span></div>
                                    <div className="field"><label>Verified</label><span className="verified-tag">✓ ID Verified</span></div>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Ban size={16}/> <h4>Lease Rules</h4></div>
                                <div className="policy-grid">
                                    <div className="policy-item"><label>Occupants</label><p>Max 2</p></div>
                                    <div className="policy-item"><label>Pets</label><p>Allowed</p></div>
                                    <div className="policy-item"><label>Smoking</label><p>No</p></div>
                                    <div className="policy-item"><label>Subletting</label><p>Prohibited</p></div>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Zap size={16}/> <h4>Responsibilities</h4></div>
                                <div className="responsibility-box scrollable">
                                    <div className="resp-row"><span>Structural Repairs</span><span className="owner-badge landlord">Landlord</span></div>
                                    <div className="resp-row"><span>Interior Appliances</span><span className="owner-badge tenant">Tenant</span></div>
                                    <div className="resp-row"><span>Utility Bills</span><span className="owner-badge tenant">Tenant</span></div>
                                    <div className="resp-row"><span>Plumbing</span><span className="owner-badge landlord">Landlord</span></div>
                                    <div className="resp-row"><span>Electrical</span><span className="owner-badge landlord">Landlord</span></div>
                                    <div className="resp-row"><span>HVAC / Air Conditioning</span><span className="owner-badge landlord">Landlord</span></div>
                                    <div className="resp-row"><span>Pest Control</span><span className="owner-badge tenant">Tenant</span></div>
                                    <div className="resp-row"><span>Exterior Maintenance</span><span className="owner-badge landlord">Landlord</span></div>
                                    <div className="resp-row"><span>Common Areas</span><span className="owner-badge landlord">Landlord</span></div>
                                    <div className="resp-row"><span>Security Systems</span><span className="owner-badge landlord">Landlord</span></div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 2: TENANT IDENTITY */}
                    {step === 2 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Tenant Identity Details</h3>
                            <section className="info-section">
                                <div className="section-title"><User size={16}/> <h4>Personal Information</h4></div>
                                <div className="autofill-grid">
                                    <div className="field"><label>Full Name</label><span>{contract.tenant}</span></div>
                                    <div className="field"><label>Email</label><span>{contract.tenant.toLowerCase().replace(' ', '.')}@homi.com</span></div>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Fingerprint size={16}/> <h4>Identity Verification</h4></div>
                                <div className="input-group">
                                    <label>National ID / Passport Number</label>
                                    <input 
                                        type="text" 
                                        value={tenantData.idNumber} 
                                        onChange={(e) => setTenantData({...tenantData, idNumber: e.target.value})}
                                        placeholder="Enter document ID"
                                    />
                                </div>
                                <div className="input-grid">
                                    <div className="input-group">
                                        <label>Emergency Contact Name</label>
                                        <input type="text" value={tenantData.emergencyName} onChange={(e) => setTenantData({...tenantData, emergencyName: e.target.value})} />
                                    </div>
                                    <div className="input-group">
                                        <label>Emergency Phone</label>
                                        <input type="tel" value={tenantData.emergencyPhone} onChange={(e) => setTenantData({...tenantData, emergencyPhone: e.target.value})} />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 3: SUMMARY */}
                    {step === 3 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Platform Verification Summary</h3>
                            <div className="homi-auto-box">
                                <section className="auto-section">
                                    <div className="section-title"><Cpu size={16}/> <h4>Platform Metadata</h4></div>
                                    <div className="mini-grid">
                                        <div className="item"><label>Contract ID</label><span>{contract.id}</span></div>
                                        <div className="item"><label>Created</label><span>March 07, 2026</span></div>
                                        <div className="item"><label>Lease ID</label><span>L-8829-Z</span></div>
                                    </div>
                                </section>
                                <section className="auto-section">
                                    <div className="section-title"><Landmark size={16}/> <h4>Verified Property Information</h4></div>
                                    <div className="mini-grid">
                                        <div className="item"><label>Title</label><span>{contract.property}</span></div>
                                        <div className="item"><label>Type</label><span>Residential</span></div>
                                        <div className="item"><label>Rooms</label><span>2 Bedrooms</span></div>
                                        <div className="item"><label>Furnishing</label><span>Fully Furnished</span></div>
                                        <div className="item full"><label>Address</label><span>123 Global Ave, Penthouse District</span></div>
                                    </div>
                                </section>
                                <section className="auto-section">
                                    <div className="section-title"><DollarSign size={16}/> <h4>Payment Terms</h4></div>
                                    <div className="mini-grid">
                                        <div className="item"><label>Rent</label><span>${contract.amount}</span></div>
                                        <div className="item"><label>Security Deposit</label><span>${contract.deposit}</span></div>
                                        <div className="item"><label>Service Fee</label><span>$10.00</span></div>
                                        <div className="item"><label>Schedule</label><span>Monthly</span></div>
                                    </div>
                                </section>
                                <section className="auto-section">
                                    <div className="section-title"><Clock size={16}/> <h4>Lease Duration</h4></div>
                                    <div className="mini-grid">
                                        <div className="item"><label>Move-In</label><span>{contract.startDate}</span></div>
                                        <div className="item"><label>Duration</label><span>{contract.duration}</span></div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: SIGNATURE */}
                    {step === 4 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Finalize & Sign</h3>
                            {!savedSignature ? (
                                <div className="signature-trigger" onClick={() => setIsSignModalOpen(true)}>
                                    <Pencil size={24} />
                                    <p>Draw or upload your digital signature</p>
                                </div>
                            ) : (
                                <div className="signature-display-card">
                                    <div className="sig-header">
                                        <span>Verified Signature</span>
                                        <button onClick={() => setIsSignModalOpen(true)}>Change</button>
                                    </div>
                                    <div className="sig-preview">
                                        <img src={savedSignature} alt="Tenant Signature" />
                                    </div>
                                    <div className="sig-footer">
                                        <p><Globe size={12}/> Timestamped IP: 192.168.1.45 • {new Date().toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                            <div className="confirmation-check">
                                <input 
                                    type="checkbox" 
                                    id="final" 
                                    checked={tenantData.confirmed} 
                                    onChange={(e) => setTenantData({...tenantData, confirmed: e.target.checked})} 
                                />
                                <label htmlFor="final">I agree to the HOMI terms and understand this signature is legally binding.</label>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="panel-footer-nav">
                    {step > 1 && (
                        <button className="btn-nav-secondary" onClick={handleBack}>
                            <ChevronLeft size={18} /> Back
                        </button>
                    )}
                    <button 
                        className="btn-nav-primary"
                        disabled={(step === 2 && !tenantData.idNumber) || (step === 4 && (!savedSignature || !tenantData.confirmed))}
                        onClick={step === 4 ? handleFinalExecute : handleNext}
                    >
                        {step === 4 ? 'Confirm & Execute Agreement' : 'Continue'} <ChevronRight size={18} />
                    </button>
                </footer>
            </div>

            <SignatureModal 
                isOpen={isSignModalOpen} 
                onClose={() => setIsSignModalOpen(false)}
                onSave={handleSignatureSave}
            />
        </div>
    );
};

export default ContractDetailView;