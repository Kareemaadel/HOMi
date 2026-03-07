import React, { useState } from 'react';
import { 
    X, ChevronRight, ChevronLeft, ShieldCheck, Pencil, 
    Landmark, Zap, Ban, User, DollarSign, Cpu, Clock, Globe, 
    Fingerprint, CheckCircle2, FileText, Scale
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
    
    // Landlord Specific State
    const [landlordData, setLandlordData] = useState({
        idNumber: '', // National ID / Business Reg
        ownershipRef: '', // Property Registration No
        rentDueDate: '1st',
        lateFee: '25',
        occupants: '2',
        pets: 'Allowed',
        smoking: 'No',
        confirmed: false
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    if (isFinalized) {
        return (
            <div className="contract-overlay">
                <div className="detail-panel success-panel animate-slide-in">
                    <div className="success-content">
                        <div className="success-icon-badge"><CheckCircle2 size={60} /></div>
                        <h2>Signature Recorded</h2>
                        <p>The contract for <strong>{contract.property}</strong> has been signed by you. We are now notifying the tenant for their final counter-signature.</p>
                        <div className="success-actions">
                            <button className="btn-close-dashboard" onClick={onClose}>Return to Portfolio</button>
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
                        <h2>Step {step} of 5</h2>
                        <span>LANDLORD ACTION • {contract.property}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20}/></button>
                </header>

                <div className="panel-content">
                    <div className="contract-stepper">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <React.Fragment key={i}>
                                <div className={`step-pill ${step >= i ? 'active' : ''}`}>{i}</div>
                                {i < 5 && <div className={`step-line ${step > i ? 'active' : ''}`}></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* STEP 1: FINANCIAL & LEASE RULES */}
                    {step === 1 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Lease Terms & Financials</h3>
                            <section className="info-section">
                                <div className="section-title"><DollarSign size={16}/> <h4>Financial Configuration</h4></div>
                                <div className="input-grid">
                                    <div className="input-group">
                                        <label>Rent Due Date</label>
                                        <select value={landlordData.rentDueDate} onChange={e => setLandlordData({...landlordData, rentDueDate: e.target.value})}>
                                            <option>1st of month</option>
                                            <option>5th of month</option>
                                            <option>Last day of month</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Late Fee Amount ($)</label>
                                        <input type="number" value={landlordData.lateFee} onChange={e => setLandlordData({...landlordData, lateFee: e.target.value})} />
                                    </div>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Ban size={16}/> <h4>Occupancy Rules</h4></div>
                                <div className="input-grid">
                                    <div className="input-group"><label>Max Occupants</label><input type="text" value={landlordData.occupants} onChange={e => setLandlordData({...landlordData, occupants: e.target.value})} /></div>
                                    <div className="input-group"><label>Pet Policy</label><select value={landlordData.pets} onChange={e => setLandlordData({...landlordData, pets: e.target.value})}><option>Allowed</option><option>Not Allowed</option></select></div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 2: LANDLORD IDENTITY */}
                    {step === 2 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Landlord Identity Details</h3>
                            <section className="info-section">
                                <div className="section-title"><User size={16}/> <h4>Profile Information</h4></div>
                                <div className="autofill-grid">
                                    <div className="field"><label>Legal Name</label><span>{contract.landlord}</span></div>
                                    <div className="field"><label>Email</label><span>landlord@homi.com</span></div>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Fingerprint size={16}/> <h4>Verification</h4></div>
                                <div className="input-group">
                                    <label>National ID / Business Registration Number</label>
                                    <input type="text" placeholder="Enter ID number" value={landlordData.idNumber} onChange={e => setLandlordData({...landlordData, idNumber: e.target.value})} />
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 3: PROPERTY OWNERSHIP */}
                    {step === 3 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Property Ownership Confirmation</h3>
                            <section className="info-section">
                                <div className="section-title"><Landmark size={16}/> <h4>Ownership Records</h4></div>
                                <div className="input-group">
                                    <label>Property Registration Number / Deed Ref</label>
                                    <input type="text" placeholder="e.g. REG-99210-XB" value={landlordData.ownershipRef} onChange={e => setLandlordData({...landlordData, ownershipRef: e.target.value})} />
                                </div>
                                <div className="ownership-notice">
                                    <ShieldCheck size={20} />
                                    <p>By providing this, you confirm you are the legal owner or authorized representative of <strong>{contract.property}</strong>.</p>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Zap size={16}/> <h4>Maintenance Responsibilities</h4></div>
                                <div className="responsibility-box">
                                    <div className="resp-row"><span>Structural Repairs</span><span className="owner-badge landlord">Landlord</span></div>
                                    <div className="resp-row"><span>Interior Appliances</span><span className="owner-badge tenant">Tenant</span></div>
                                    <div className="resp-row"><span>Utility Bills</span><span className="owner-badge tenant">Tenant</span></div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 4: SUMMARY */}
                    {step === 4 && (
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

                    {/* STEP 5: SIGNATURE */}
                    {step === 5 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Finalize & Sign</h3>
                            {!savedSignature ? (
                                <div className="signature-trigger" onClick={() => setIsSignModalOpen(true)}>
                                    <Pencil size={24} />
                                    <p>Draw or upload Landlord signature</p>
                                </div>
                            ) : (
                                <div className="signature-display-card">
                                    <div className="sig-header"><span>Verified Landlord Signature</span><button onClick={() => setIsSignModalOpen(true)}>Change</button></div>
                                    <div className="sig-preview"><img src={savedSignature} alt="Landlord Signature" /></div>
                                    <div className="sig-footer"><p><Globe size={12}/> Secure IP: 192.168.1.45 • {new Date().toLocaleString()}</p></div>
                                </div>
                            )}
                            <div className="confirmation-check">
                                <input type="checkbox" id="landlord-final" checked={landlordData.confirmed} onChange={(e) => setLandlordData({...landlordData, confirmed: e.target.checked})} />
                                <label htmlFor="landlord-final">I certify that I am the legal owner of this property and agree to these terms.</label>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="panel-footer-nav">
                    {step > 1 && <button className="btn-nav-secondary" onClick={handleBack}><ChevronLeft size={18} /> Back</button>}
                    <button 
                        className="btn-nav-primary"
                        disabled={(step === 2 && !landlordData.idNumber) || (step === 3 && !landlordData.ownershipRef) || (step === 5 && (!savedSignature || !landlordData.confirmed))}
                        onClick={step === 5 ? () => setIsFinalized(true) : handleNext}
                    >
                        {step === 5 ? 'Sign Agreement' : 'Continue'} <ChevronRight size={18} />
                    </button>
                </footer>
            </div>

            <SignatureModal isOpen={isSignModalOpen} onClose={() => setIsSignModalOpen(false)} onSave={(sig) => {setSavedSignature(sig); setIsSignModalOpen(false);}} />
        </div>
    );
};

export default ContractDetailView;