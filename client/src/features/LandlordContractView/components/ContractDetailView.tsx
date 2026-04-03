import React, { useState } from 'react';
import { 
    X, ChevronRight, ChevronLeft, ShieldCheck, Pencil, 
    Landmark, Zap, Ban, User, DollarSign, Cpu, Clock, Globe, 
    Fingerprint, CheckCircle2, FileText, Scale, MoreVertical,
    Download, Share2, MessageSquare, History
} from 'lucide-react';
import { type LeaseContract } from '../pages/Contract';
import SignatureModal from './SignatureModal';
import contractService, { type VerificationSummary } from '../../../services/contract.service';
import './ContractDetailView.css';

interface Props {
    contract: LeaseContract;
    isReadOnly?: boolean;
    onUpdated?: () => void;
    onClose: () => void;
}

const ContractDetailView: React.FC<Props> = ({ contract, isReadOnly = false, onUpdated, onClose }) => {
    const [step, setStep] = useState(1);
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [savedSignature, setSavedSignature] = useState<string | null>(null);
    const [isFinalized, setIsFinalized] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [summary, setSummary] = useState<VerificationSummary | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const maintenanceResponsibilities = contract.maintenanceResponsibilities ?? [];
    
    // Landlord Specific State
    const [landlordData, setLandlordData] = useState({
        idNumber: contract.landlordNationalId || '', 
        ownershipRef: contract.propertyRegistrationNumber || '',
        rentDueDate: contract.rentDueDate || '1ST_OF_MONTH',
        lateFee: String(contract.lateFeeAmount || 25),
        occupants: String(contract.maxOccupants || 2),
        smoking: 'No',
        confirmed: Boolean(contract.certifyOwnership) || isReadOnly
    });
    const toDueDateEnum = (value: string): '1ST_OF_MONTH' | '5TH_OF_MONTH' | 'LAST_DAY_OF_MONTH' => {
        if (value === '5TH_OF_MONTH') return '5TH_OF_MONTH';
        if (value === 'LAST_DAY_OF_MONTH') return 'LAST_DAY_OF_MONTH';
        return '1ST_OF_MONTH';
    };

    const handleNext = async () => {
        if (isReadOnly) {
            if (step === 3 && !summary) {
                try {
                    setSubmitting(true);
                    const response = await contractService.getVerificationSummary(contract.internalId);
                    setSummary(response.data);
                } catch (error) {
                    console.error('Failed to load verification summary', error);
                } finally {
                    setSubmitting(false);
                }
            }
            setStep((s) => Math.min(s + 1, 5));
            return;
        }
        try {
            setSubmitting(true);
            if (step === 1) {
                await contractService.updateLeaseTerms(contract.internalId, {
                    rent_due_date: toDueDateEnum(landlordData.rentDueDate),
                    late_fee_amount: Number(landlordData.lateFee),
                    max_occupants: Number(landlordData.occupants),
                });
            }

            if (step === 2) {
                await contractService.updateLandlordIdentity(contract.internalId, {
                    national_id: landlordData.idNumber,
                });
            }

            if (step === 3) {
                await contractService.updatePropertyConfirmation(contract.internalId, {
                    property_registration_number: landlordData.ownershipRef,
                });
            }

            if (step === 4) {
                const response = await contractService.getVerificationSummary(contract.internalId);
                setSummary(response.data);
            }

            setStep((s) => s + 1);
            onUpdated?.();
        } catch (error) {
            console.error('Failed to submit contract step', error);
        } finally {
            setSubmitting(false);
        }
    };
    const handleBack = () => setStep(s => s - 1);

    const handleSign = async () => {
        if (isReadOnly) return;
        if (!savedSignature || !landlordData.confirmed) return;
        setSubmitting(true);
        try {
            const signatureUrl =
                savedSignature.length <= 500
                    ? savedSignature
                    : `https://storage.homi.com/signatures/${contract.internalId}-landlord.png`;
            await contractService.signLandlordContract(contract.internalId, {
                signature_url: signatureUrl,
                certify_ownership: true,
            });
            setIsFinalized(true);
            onUpdated?.();
        } catch (error) {
            console.error('Failed to sign contract', error);
        } finally {
            setSubmitting(false);
        }
    };

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
                        <span>LANDLORD ACTION • {contract.property}</span>
                    </div>
                    <div className="header-actions">

                        <button className="close-btn" onClick={onClose}><X size={20}/></button>
                    </div>
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
                                        <select className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} value={landlordData.rentDueDate} onChange={e => setLandlordData({...landlordData, rentDueDate: e.target.value})}>
                                            <option value="1ST_OF_MONTH">1st of month</option>
                                            <option value="5TH_OF_MONTH">5th of month</option>
                                            <option value="LAST_DAY_OF_MONTH">Last day of month</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Late Fee Amount ($)</label>
                                        <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="number" value={landlordData.lateFee} onChange={e => setLandlordData({...landlordData, lateFee: e.target.value})} />
                                    </div>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Ban size={16}/> <h4>Occupancy Rules</h4></div>
                                <div className="input-grid">
                                    <div className="input-group"><label>Max Occupants</label><input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" value={landlordData.occupants} onChange={e => setLandlordData({...landlordData, occupants: e.target.value})} /></div>
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
                                    <div className="field"><label>Email</label><span>{contract.landlordEmail || '—'}</span></div>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Fingerprint size={16}/> <h4>Verification</h4></div>
                                <div className="input-group">
                                    <label>National ID / Business Registration Number</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="Enter ID number" value={landlordData.idNumber} onChange={e => setLandlordData({...landlordData, idNumber: e.target.value})} />
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
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="e.g. REG-99210-XB" value={landlordData.ownershipRef} onChange={e => setLandlordData({...landlordData, ownershipRef: e.target.value})} />
                                </div>
                                <div className="ownership-notice">
                                    <ShieldCheck size={20} />
                                    <p>By providing this, you confirm you are the legal owner or authorized representative of <strong>{contract.property}</strong>.</p>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Zap size={16}/> <h4>Maintenance Responsibilities</h4></div>
                                <div className="responsibility-box scrollable">
                                    {maintenanceResponsibilities.length > 0 ? (
                                        maintenanceResponsibilities.map((item, idx) => (
                                            <div key={`${item.area}-${idx}`} className="resp-row">
                                                <span>{item.area}</span>
                                                <span className={`owner-badge ${item.responsible_party === 'LANDLORD' ? 'landlord' : 'tenant'}`}>
                                                    {item.responsible_party === 'LANDLORD' ? 'Landlord' : 'Tenant'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="resp-row"><span>No maintenance responsibilities found on this property.</span><span className="owner-badge tenant">N/A</span></div>
                                    )}
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
                                        <div className="item"><label>Contract ID</label><span>{summary?.platformMetadata.contractId || contract.id}</span></div>
                                        <div className="item"><label>Created</label><span>{summary?.platformMetadata.created ? new Date(summary.platformMetadata.created).toLocaleDateString() : new Date(contract.createdAt).toLocaleDateString()}</span></div>
                                        <div className="item"><label>Lease ID</label><span>{summary?.platformMetadata.leaseId || '—'}</span></div>
                                    </div>
                                </section>
                                <section className="auto-section">
                                    <div className="section-title"><Landmark size={16}/> <h4>Verified Property Information</h4></div>
                                    <div className="mini-grid">
                                        <div className="item"><label>Title</label><span>{summary?.verifiedPropertyInfo.title || contract.property}</span></div>
                                        <div className="item"><label>Type</label><span>{summary?.verifiedPropertyInfo.type || contract.propertyType}</span></div>
                                        <div className="item"><label>Rooms</label><span>{summary?.verifiedPropertyInfo.rooms || 'N/A'}</span></div>
                                        <div className="item"><label>Furnishing</label><span>{summary?.verifiedPropertyInfo.furnishing || contract.propertyFurnishing}</span></div>
                                        <div className="item full"><label>Address</label><span>{summary?.verifiedPropertyInfo.address || contract.propertyAddress}</span></div>
                                    </div>
                                </section>
                                <section className="auto-section">
                                    <div className="section-title"><DollarSign size={16}/> <h4>Payment Terms</h4></div>
                                    <div className="mini-grid">
                                        <div className="item"><label>Rent</label><span>${summary?.paymentTerms.rent ?? contract.amount}</span></div>
                                        <div className="item"><label>Security Deposit</label><span>${summary?.paymentTerms.securityDeposit ?? contract.deposit}</span></div>
                                        <div className="item"><label>Service Fee</label><span>${summary?.paymentTerms.serviceFee ?? 10}</span></div>
                                        <div className="item"><label>Schedule</label><span>{summary?.paymentTerms.schedule || 'MONTHLY'}</span></div>
                                    </div>
                                </section>
                                <section className="auto-section">
                                    <div className="section-title"><Clock size={16}/> <h4>Lease Duration</h4></div>
                                    <div className="mini-grid">
                                        <div className="item"><label>Move-In</label><span>{summary?.leaseDuration.moveIn ? new Date(summary.leaseDuration.moveIn).toLocaleDateString() : contract.startDate}</span></div>
                                        <div className="item"><label>Duration</label><span>{summary?.leaseDuration.durationMonths ? `${summary.leaseDuration.durationMonths} Months` : contract.duration}</span></div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: SIGNATURE */}
                    {step === 5 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Finalize & Sign</h3>
                            {isReadOnly ? (
                                <div className="ownership-notice">
                                    <ShieldCheck size={20} />
                                    <p>This contract is not in pending landlord status and is view-only.</p>
                                </div>
                            ) : !savedSignature ? (
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
                                <input className={isReadOnly ? 'readonly-checkbox' : ''} disabled={isReadOnly} type="checkbox" id="landlord-final" checked={landlordData.confirmed} onChange={(e) => setLandlordData({...landlordData, confirmed: e.target.checked})} />
                                <label className={isReadOnly ? 'readonly-label' : ''} htmlFor="landlord-final">I certify that I am the legal owner of this property and agree to these terms.</label>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="panel-footer-nav">
                    {step > 1 && <button className="btn-nav-secondary" onClick={handleBack}><ChevronLeft size={18} /> Back</button>}
                    <button 
                        className="btn-nav-primary"
                        disabled={
                            (!isReadOnly && ((step === 2 && !landlordData.idNumber) || (step === 3 && !landlordData.ownershipRef) || (step === 5 && (!savedSignature || !landlordData.confirmed)))) ||
                            submitting
                        }
                        onClick={step === 5 ? (isReadOnly ? onClose : handleSign) : handleNext}
                    >
                        {submitting ? 'Saving...' : step === 5 ? (isReadOnly ? 'Close' : 'Sign Agreement') : 'Continue'} <ChevronRight size={18} />
                    </button>
                </footer>
            </div>

            {!isReadOnly && (
                <SignatureModal isOpen={isSignModalOpen} onClose={() => setIsSignModalOpen(false)} onSave={(sig) => {setSavedSignature(sig); setIsSignModalOpen(false);}} />
            )}
        </div>
    );
};

export default ContractDetailView;