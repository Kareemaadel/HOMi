import React, { useState } from 'react';
import { 
    X, ChevronRight, ChevronLeft, Pencil, ShieldCheck,
    Landmark, Zap, Ban, User, DollarSign, Cpu, Clock, Globe,
    Fingerprint, CheckCircle2, CreditCard
} from 'lucide-react';
import { type LeaseContract } from '../pages/Contract';
import SignatureModal from './SignatureModal';
import contractService, { type VerificationSummary } from '../../../services/contract.service';
import './ContractDetailView.css';

interface Props {
    contract: LeaseContract;
    onUpdated?: () => void;
    onClose: () => void;
}

const ContractDetailView: React.FC<Props> = ({ contract, onUpdated, onClose }) => {
    const [step, setStep] = useState(1);
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [savedSignature, setSavedSignature] = useState<string | null>(null);
    const [isFinalized, setIsFinalized] = useState(false);
    const [summary, setSummary] = useState<VerificationSummary | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const maintenanceResponsibilities = contract.maintenanceResponsibilities ?? [];

    const [tenantData, setTenantData] = useState({
        idNumber: contract.tenantNationalId || '',
        emergencyName: contract.tenantEmergencyContactName || '',
        emergencyPhone: contract.tenantEmergencyPhone || '',
        confirmed: false
    });

    const handleNext = async () => {
        try {
            setSubmitting(true);
            if (step === 2) {
                await contractService.updateTenantIdentity(contract.internalId, {
                    national_id: tenantData.idNumber,
                    emergency_contact_name: tenantData.emergencyName,
                    emergency_phone: tenantData.emergencyPhone,
                });
                const summaryResponse = await contractService.getVerificationSummary(contract.internalId);
                setSummary(summaryResponse.data);
                onUpdated?.();
            }
            setStep((s) => Math.min(s + 1, 4));
        } catch (error) {
            console.error('Failed to process tenant step', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => setStep(s => s - 1);

    const handleSignatureSave = (signatureData: string) => {
        setSavedSignature(signatureData);
        setIsSignModalOpen(false);
    };

    const handleFinalExecute = async () => {
        if (!savedSignature || !tenantData.confirmed) return;
        setSubmitting(true);
        try {
            const signatureUrl =
                savedSignature.length <= 500
                    ? savedSignature
                    : `https://storage.homi.com/signatures/${contract.internalId}-tenant.png`;
            await contractService.signTenantContract(contract.internalId, {
                signature_url: signatureUrl,
                agree_to_terms: true,
            });
            setIsFinalized(true);
            onUpdated?.();
        } catch (error) {
            console.error('Failed to sign tenant contract', error);
        } finally {
            setSubmitting(false);
        }
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
                        <p>The contract for <strong>{contract.property}</strong> has been legally signed and activated.</p>
                        
                        <div className="success-actions">
                            <button className="btn-pay-action" onClick={() => globalThis.location.href = '/tenant-payment?tab=pending'}>
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
                        <span>{contract.id} • {contract.property}</span>
                    </div>
                    <div className="header-actions">
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
                            <div style={{ background: '#fffbeb', color: '#b45309', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                <ShieldCheck size={20} style={{ flexShrink: 0 }} />
                                <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.5', fontWeight: 500 }}>
                                    Please read carefully to the end. These are the legally binding clauses and parameters established by your landlord, and they represent contract terms you must strictly respect.
                                </p>
                            </div>
                            <section className="info-section">
                                <div className="section-title"><User size={16}/> <h4>Landlord Profile</h4></div>
                                <div className="autofill-grid">
                                    <div className="field"><label>Full Name</label><span>{contract.landlord}</span></div>
                                    <div className="field"><label>Contact</label><span>{contract.landlordEmail || '—'}</span></div>
                                    <div className="field"><label>Verified</label><span className="verified-tag">✓ ID Verified</span></div>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Clock size={16}/> <h4>Lease Fundamentals</h4></div>
                                <div className="policy-grid">
                                    <div className="policy-item"><label>Occupants</label><p>Max {contract.maxOccupants}</p></div>
                                    <div className="policy-item"><label>Rent Due Date</label><p>{contract.rentDueDate.replaceAll('_', ' ')}</p></div>
                                    <div className="policy-item"><label>Late Fee</label><p>${contract.lateFeeAmount}</p></div>
                                    <div className="policy-item"><label>Status</label><p>Pending Signature</p></div>
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Renewal Terms</label>
                                        <p>Automatic month-to-month renewal upon expiration unless a 30-day notice is provided.</p>
                                    </div>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Ban size={16}/> <h4>Rules & Allowances</h4></div>
                                <div className="policy-grid">
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Permitted Use</label><p>Premises are to be used for residential purposes only.</p>
                                    </div>
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Restrictions</label><p>No subletting without prior written consent. Pets and indoor smoking are not permitted.</p>
                                    </div>
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Landlord's Right to Enter</label><p>Landlord may enter the premises for necessary repairs, inspections, or emergencies.</p>
                                    </div>
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Notice Period</label><p>At least 24 hours written or verbal notice must be provided before non-emergency entry.</p>
                                    </div>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Globe size={16}/> <h4>Legal Framework & Insurance</h4></div>
                                <div className="policy-grid">
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Early Termination</label><p>Requires 60 days active notice and an early termination fee equivalent to one month's rent.</p>
                                    </div>
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Eviction</label><p>Grounds include, but are not limited to: non-payment of rent, substantial property damage, or violation of lease terms.</p>
                                    </div>
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Tenant's Insurance</label><p>Tenant is required to maintain valid renter's insurance for personal property and liability.</p>
                                    </div>
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Landlord's Insurance</label><p>Landlord's insurance covers structural damage and property liability, but not tenant belongings.</p>
                                    </div>
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Governing Law</label><p>This agreement shall be governed by the laws of the jurisdiction where the property is located.</p>
                                    </div>
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Dispute Resolution</label><p>Any disputes shall first be mediated in good faith before pursuing legal action.</p>
                                    </div>
                                    <div className="policy-item" style={{ gridColumn: 'span 2' }}>
                                        <label>Amendments</label><p>Any changes or modifications to this agreement must be made in writing and signed by both parties.</p>
                                    </div>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Zap size={16}/> <h4>Responsibilities</h4></div>
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

                    {/* STEP 2: TENANT IDENTITY */}
                    {step === 2 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Tenant Identity Details</h3>
                            <section className="info-section">
                                <div className="section-title"><User size={16}/> <h4>Personal Information</h4></div>
                                <div className="autofill-grid">
                                    <div className="field"><label>Full Name</label><span>{contract.tenant}</span></div>
                                    <div className="field"><label>Email</label><span>{contract.tenantEmail || '—'}</span></div>
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
                                        placeholder="Enter ID number"
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
                                        <div className="item"><label>Contract ID</label><span>{summary?.platformMetadata.contractId || contract.id}</span></div>
                                        <div className="item"><label>Created</label><span>{summary?.platformMetadata.created ? new Date(summary.platformMetadata.created).toLocaleDateString() : new Date(contract.createdAt).toLocaleDateString()}</span></div>
                                        <div className="item"><label>Lease ID</label><span>{summary?.platformMetadata.leaseId || contract.leaseId}</span></div>
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
                        disabled={
                            submitting ||
                            (step === 2 && (!tenantData.idNumber || !tenantData.emergencyName || !tenantData.emergencyPhone)) ||
                            (step === 4 && (!savedSignature || !tenantData.confirmed))
                        }
                        onClick={step === 4 ? handleFinalExecute : handleNext}
                    >
                        {submitting ? 'Saving...' : step === 4 ? 'Confirm & Execute Agreement' : 'Continue'} <ChevronRight size={18} />
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