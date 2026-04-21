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
    const [summary, setSummary] = useState<VerificationSummary | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const maintenanceResponsibilities = contract.maintenanceResponsibilities ?? [];
    
    // Landlord Specific State for backend api compatibility
    const [landlordData, setLandlordData] = useState({
        idNumber: contract.landlordNationalId || 'NOT_PROVIDED', 
        ownershipRef: contract.propertyRegistrationNumber || 'NOT_PROVIDED',
        rentDueDate: contract.rentDueDate || '1ST_OF_MONTH',
        lateFee: String(contract.lateFeeAmount || 0),
        occupants: String(contract.maxOccupants || 1),
        confirmed: Boolean(contract.certifyOwnership) || isReadOnly,
        renewalTerms: '',
        permittedUse: '',
        restrictions: '',
        rightToEnter: '',
        noticePeriod: '',
        earlyTermination: '',
        eviction: '',
        tenantInsurance: '',
        landlordInsurance: '',
        governingLaw: '',
        disputeResolution: '',
        amendments: ''
    });
    
    const toDueDateEnum = (value: string): '1ST_OF_MONTH' | '5TH_OF_MONTH' | 'LAST_DAY_OF_MONTH' => {
        if (value === '5TH_OF_MONTH') return '5TH_OF_MONTH';
        if (value === 'LAST_DAY_OF_MONTH') return 'LAST_DAY_OF_MONTH';
        return '1ST_OF_MONTH';
    };

    const handleNext = async () => {
        if (isReadOnly) {
            if (step === 4 && !summary) {
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
            setStep((s) => Math.min(s + 1, 6));
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
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <React.Fragment key={i}>
                                <div className={`step-pill ${step >= i ? 'active' : ''}`}>{i}</div>
                                {i < 6 && <div className={`step-line ${step > i ? 'active' : ''}`}></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* STEP 1: PARTIES, PROPERTY, LEASE TERM */}
                    {step === 1 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Contract Details</h3>
                            <section className="info-section">
                                <div className="section-title"><User size={16}/> <h4>1. Parties Involved</h4></div>
                                <div className="autofill-grid">
                                    <div className="field full"><label>Landlord/Owner</label><span>{contract.landlord} • {contract.landlordEmail}</span></div>
                                    <div className="field full"><label>Tenant/Renter</label><span>{contract.tenant} • {contract.tenantEmail}</span></div>
                                </div>
                            </section>

                            <section className="info-section">
                                <div className="section-title"><Landmark size={16}/> <h4>2. Property Details</h4></div>
                                <div className="autofill-grid">
                                    <div className="field full"><label>Address</label><span>{contract.propertyAddress}</span></div>
                                    <div className="field full"><label>Description</label><span>{contract.propertyType} • {contract.propertyFurnishing}</span></div>
                                </div>
                            </section>

                            <section className="info-section">
                                <div className="section-title"><Clock size={16}/> <h4>3. Lease Term</h4></div>
                                <div className="autofill-grid">
                                    <div className="field"><label>Start Date</label><span>{contract.startDate}</span></div>
                                    <div className="field"><label>End Date</label><span>{contract.duration}</span></div>
                                </div>
                                <div className="input-group" style={{ marginTop: '24px' }}>
                                    <label>Renewal Terms</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="Enter renewal terms (e.g. Month-to-month)" value={landlordData.renewalTerms} onChange={e => setLandlordData({...landlordData, renewalTerms: e.target.value})} />
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 2: USE OF PROPERTY & ENTRY */}
                    {step === 2 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Rules & Allowances</h3>
                            <section className="info-section">
                                <div className="section-title"><ShieldCheck size={16}/> <h4>6. Use of Property</h4></div>
                                <div className="input-group">
                                    <label>Permitted Use</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="e.g. Residential purposes only" value={landlordData.permittedUse} onChange={e => setLandlordData({...landlordData, permittedUse: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Restrictions</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="e.g. No subletting, pets, or smoking" value={landlordData.restrictions} onChange={e => setLandlordData({...landlordData, restrictions: e.target.value})} />
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Globe size={16}/> <h4>7. Entry and Inspection</h4></div>
                                <div className="input-group">
                                    <label>Landlord's Right to Enter</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="Conditions for landlord entry" value={landlordData.rightToEnter} onChange={e => setLandlordData({...landlordData, rightToEnter: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Notice Period</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="e.g. 24 hours written notice" value={landlordData.noticePeriod} onChange={e => setLandlordData({...landlordData, noticePeriod: e.target.value})} />
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 3: MAINTENANCE RESPONSIBILITIES */}
                    {step === 3 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Maintenance Responsibilities</h3>
                            <section className="info-section">
                                <div className="section-title"><Zap size={16}/> <h4>Maintenance Allocation</h4></div>
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
                                        <div className="resp-row"><span>No specific maintenance requirements detailed.</span><span className="owner-badge tenant">N/A</span></div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 4: TERMINATION & LEGAL */}
                    {step === 4 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Legal Framework</h3>
                            <section className="info-section">
                                <div className="section-title"><Ban size={16}/> <h4>8. Termination Clause</h4></div>
                                <div className="input-group">
                                    <label>Early Termination</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="e.g. 60 days notice and fee" value={landlordData.earlyTermination} onChange={e => setLandlordData({...landlordData, earlyTermination: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Eviction</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="Grounds for eviction" value={landlordData.eviction} onChange={e => setLandlordData({...landlordData, eviction: e.target.value})} />
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><ShieldCheck size={16}/> <h4>9. Insurance</h4></div>
                                <div className="input-group">
                                    <label>Tenant's Insurance</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="Tenant insurance requirements" value={landlordData.tenantInsurance} onChange={e => setLandlordData({...landlordData, tenantInsurance: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Landlord's Insurance</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="Landlord insurance coverage" value={landlordData.landlordInsurance} onChange={e => setLandlordData({...landlordData, landlordInsurance: e.target.value})} />
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Scale size={16}/> <h4>10. Legal Clauses</h4></div>
                                <div className="input-group">
                                    <label>Governing Law</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="Governing jurisdiction" value={landlordData.governingLaw} onChange={e => setLandlordData({...landlordData, governingLaw: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Dispute Resolution</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="Resolution process" value={landlordData.disputeResolution} onChange={e => setLandlordData({...landlordData, disputeResolution: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Amendments</label>
                                    <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="Rules for amendments" value={landlordData.amendments} onChange={e => setLandlordData({...landlordData, amendments: e.target.value})} />
                                </div>
                                <div className="homi-auto-box" style={{marginTop: '16px'}}>
                                    <div className="section-title"><Cpu size={16}/> <h4>Clause Metadata</h4></div>
                                    <p style={{fontSize: '13px', color: 'var(--saas-text-muted)', lineHeight: '1.5'}}>
                                        <strong>Document Hash:</strong> {contract.internalId}-clauses-v1<br/>
                                        <strong>Included Legal Arrays:</strong> Parties, Property, Term, Use, Entry, Termination, Insurance, Legal<br/>
                                        All clauses encoded securely.
                                    </p>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 5: SUMMARY */}
                    {step === 5 && (
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

                    {/* STEP 6: SIGNATURE */}
                    {step === 6 && (
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
                            (!isReadOnly && (step === 6 && (!savedSignature || !landlordData.confirmed))) ||
                            submitting
                        }
                        onClick={step === 6 ? (isReadOnly ? onClose : handleSign) : handleNext}
                    >
                        {submitting ? 'Saving...' : step === 6 ? (isReadOnly ? 'Close' : 'Sign Agreement') : 'Continue'} <ChevronRight size={18} />
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