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
        idFullName: contract.landlord || '',
        idNumber: contract.landlordNationalId || '',
        currentAddress: '',
        contractDate: new Date().toISOString().split('T')[0],
        ownershipRef: contract.propertyRegistrationNumber || 'NOT_PROVIDED',
        rentDueDate: contract.rentDueDate || '1ST_OF_MONTH',
        lateFee: String(contract.lateFeeAmount || 0),
        occupants: String(contract.maxOccupants || 1),
        confirmed: Boolean(contract.certifyOwnership) || isReadOnly,
        permittedUse: '',
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
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
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
                                <div className="section-title"><Fingerprint size={16} /> <h4>1. Identity & Date</h4></div>
                                <div className="input-grid">
                                    <div className="input-group">
                                        <label>National ID Full Name (Arabic Only)</label>
                                        <input
                                            className={isReadOnly ? 'readonly-field' : ''}
                                            disabled={isReadOnly}
                                            type="text"
                                            placeholder="الاسم الكامل باللغة العربية"
                                            value={landlordData.idFullName}
                                            onChange={e => {
                                                const value = e.target.value;
                                                if (/^[\u0600-\u06FF\s]*$/.test(value)) {
                                                    setLandlordData({ ...landlordData, idFullName: value });
                                                }
                                            }}
                                            style={{ direction: 'rtl' }}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>National ID Number (14 Digits)</label>
                                        <input
                                            className={isReadOnly ? 'readonly-field' : ''}
                                            disabled={isReadOnly}
                                            type="text"
                                            placeholder="2990101XXXXXXXX"
                                            maxLength={14}
                                            value={landlordData.idNumber}
                                            onChange={e => {
                                                const value = e.target.value;
                                                if (/^\d*$/.test(value)) {
                                                    setLandlordData({ ...landlordData, idNumber: value });
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="input-group full">
                                        <label>Current Address</label>
                                        <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" placeholder="Your residential address" value={landlordData.currentAddress} onChange={e => setLandlordData({ ...landlordData, currentAddress: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Main Phone number</label>
                                        <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" />
                                    </div>
                                    <div className="input-group">
                                        <label>Contract Date</label>
                                        <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="date" value={landlordData.contractDate} onChange={e => setLandlordData({ ...landlordData, contractDate: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Emergency Contact Name</label>
                                        <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="text" value={landlordData.emergencyName} onChange={(e) => setLandlordData({ ...landlordData, emergencyName: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Emergency Phone</label>
                                        <input className={isReadOnly ? 'readonly-field' : ''} disabled={isReadOnly} type="tel" value={landlordData.emergencyPhone} onChange={(e) => setLandlordData({ ...landlordData, emergencyPhone: e.target.value })} />
                                    </div>
                                </div>
                            </section>

                            <section className="info-section">
                                <div className="section-title"><User size={16} /> <h4>2. Parties Involved</h4></div>
                                <div className="autofill-grid">
                                    <div className="field full"><label>Landlord/Owner</label><span>{contract.landlord} • {contract.landlordEmail}</span></div>
                                    <div className="field full"><label>Tenant/Renter</label><span>{contract.tenant} • {contract.tenantEmail}</span></div>
                                </div>
                            </section>

                            <section className="info-section">
                                <div className="section-title"><Landmark size={16} /> <h4>3. Property Details</h4></div>
                                <div className="autofill-grid">
                                    <div className="field full"><label>Address</label><span>{contract.propertyAddress}</span></div>
                                    <div className="field full"><label>Description</label><span>{contract.propertyType} • {contract.propertyFurnishing}</span></div>
                                </div>
                            </section>

                            <section className="info-section">
                                <div className="section-title"><Clock size={16} /> <h4>4. Lease Term</h4></div>
                                <div className="autofill-grid">
                                    <div className="field"><label>Start Date</label><span>{contract.startDate}</span></div>
                                    <div className="field"><label>End Date</label><span>{contract.duration}</span></div>
                                </div>

                            </section>
                        </div>
                    )}

                    {/* STEP 2: USE OF PROPERTY & ENTRY */}
                    {step === 2 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Rules & Allowances</h3>
                            <section className="info-section">
                                <div className="section-title"><ShieldCheck size={16} /> <h4>6. Use of Property</h4></div>
                                <div className="input-group">
                                    <label>Permitted Use</label>
                                    <select
                                        className={isReadOnly ? 'readonly-field' : ''}
                                        disabled={isReadOnly}
                                        value={landlordData.permittedUse}
                                        onChange={e => setLandlordData({ ...landlordData, permittedUse: e.target.value })}
                                    >
                                        <option value="">Select Permitted Use</option>
                                        <option value="Residential purposes only">Residential purposes only</option>
                                        <option value="Residential and home office use">Residential and home office use</option>
                                        <option value="Single-family occupancy only">Single-family occupancy only</option>
                                        <option value="Temporary holiday lodging">Temporary holiday lodging</option>
                                        <option value="Professional consulting services">Professional consulting services</option>
                                        <option value="Artist studio and private residence">Artist studio and private residence</option>
                                        <option value="Educational and tutoring activities">Educational and tutoring activities</option>
                                        <option value="Shared co-living arrangement">Shared co-living arrangement</option>
                                        <option value="Short-term corporate housing">Short-term corporate housing</option>
                                        <option value="Quiet home-based business (no clients)">Quiet home-based business (no clients)</option>
                                    </select>
                                </div>
                            </section>
                            <section className="info-section">
                                <div className="section-title"><Globe size={16} /> <h4>7. Entry and Inspection</h4></div>
                                <div className="input-group">
                                    <label>Landlord's Right to Enter</label>
                                    <select
                                        className={isReadOnly ? 'readonly-field' : ''}
                                        disabled={isReadOnly}
                                        value={landlordData.rightToEnter}
                                        onChange={e => setLandlordData({ ...landlordData, rightToEnter: e.target.value })}
                                    >
                                        <option value="">Select Conditions</option>
                                        <option value="Maintenance, emergencies, and inspections">Maintenance, emergencies, and inspections</option>
                                        <option value="Emergencies and repairs only">Emergencies and repairs only</option>
                                        <option value="With prior tenant consent only">With prior tenant consent only</option>
                                        <option value="Routine inspections every 6 months">Routine inspections every 6 months</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Notice Period</label>
                                    <select
                                        className={isReadOnly ? 'readonly-field' : ''}
                                        disabled={isReadOnly}
                                        value={landlordData.noticePeriod}
                                        onChange={e => setLandlordData({ ...landlordData, noticePeriod: e.target.value })}
                                    >
                                        <option value="">Select Notice Period</option>
                                        <option value="24 hours written notice">24 hours written notice</option>
                                        <option value="48 hours written notice">48 hours written notice</option>
                                        <option value="72 hours written notice">72 hours written notice</option>
                                        <option value="Emergency access only (no notice)">Emergency access only (no notice)</option>
                                    </select>
                                </div>
                                <div className="input-group" style={{ marginTop: '20px' }}>
                                    <label>Late Fee Amount ($)</label>
                                    <input
                                        className={isReadOnly ? 'readonly-field' : ''}
                                        disabled={isReadOnly}
                                        type="number"
                                        placeholder="e.g. 50"
                                        value={landlordData.lateFee}
                                        onChange={e => setLandlordData({ ...landlordData, lateFee: e.target.value })}
                                    />
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 3: MAINTENANCE RESPONSIBILITIES */}
                    {step === 3 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Maintenance Responsibilities</h3>
                            <section className="info-section">
                                <div className="section-title"><Zap size={16} /> <h4>Maintenance Allocation</h4></div>
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

                    {/* STEP 4: RENTAL AGREEMENT TERMS */}
                    {step === 4 && (
                        <div className="step-view animate-fade-in">
                            <h3 className="step-heading">Apartment Rental Agreement Terms</h3>

                            <section className="info-section">
                                <div className="section-title"><User size={16} /> <h4>Introduction</h4></div>
                                <div className="legal-term-box">
                                    <p>This agreement is made between:</p>
                                    <div className="party-details">
                                        <div className="party">
                                            <strong>Lessor (First Party):</strong>
                                            <span>{landlordData.idFullName || contract.landlord}</span>
                                            <span>ID: {landlordData.idNumber || '—'}</span>
                                            <span>Address: {landlordData.currentAddress || '—'}</span>
                                        </div>
                                        <div className="party">
                                            <strong>Lessee (Second Party):</strong>
                                            <span>{contract.tenant}</span>
                                            <span>ID: {'—'}</span>{/* to be filled by tenant */}
                                            <span>Address: {'—'}</span>{/* to be filled by tenant */}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="info-section">
                                <div className="section-title"><Scale size={16} /> <h4>Main Clauses</h4></div>
                                <div className="legal-clauses-list">
                                    <div className="legal-clause">
                                        <label>1. Description of the Rented Property</label>
                                        <p>The rented property is located at <strong>{contract.propertyAddress}</strong>. It consists of the unit specified in the property records ({contract.propertyType}).</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>2. Contract Duration</label>
                                        <p>The contract starts on <strong>{contract.startDate}</strong> and has a duration of <strong>{contract.duration}</strong>. It does not automatically renew unless a new agreement is signed by both parties.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>3. Rental Value</label>
                                        <p>The monthly rent amount is <strong>${contract.amount}</strong>. The lessee must pay the rent in advance at the beginning of each month and receive a receipt from the lessor or through the platform.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>4. Security Deposit</label>
                                        <p>A security deposit of <strong>${contract.deposit}</strong> is paid by the lessee to the lessor. It will be refunded at the end of the contract if there are no valid claims against it for damages or unpaid bills.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>5. Late Payment of Rent</label>
                                        <p>If the lessee delays rent payment for more than 5 days, a late fee of <strong>${landlordData.lateFee || 0}</strong> shall apply. If the delay continues for a specified period, the contract is automatically terminated. The lessor has the right to evict the lessee and claim any outstanding amounts.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>6. No Subleasing</label>
                                        <p>The lessee cannot sublease the property or make structural changes without the written consent of the lessor. Violating this clause results in automatic contract termination.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>7. No Change of Use</label>
                                        <p>The property must be used for residential purposes only. Any other use terminates the contract automatically.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>8. Lessee’s Expenses on the Property</label>
                                        <p>Any expenses incurred by the lessee (e.g., painting, decorating, or improvements) are not reimbursable by the lessor and become part of the property unless otherwise agreed.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>9. Returning the Property in Its Original Condition</label>
                                        <p>The lessee must return the property in the same condition as it was at the start of the contract. The lessee is liable for any damages caused by their negligence or misuse.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>10. Eviction After Contract Ends and Compensation for Delay</label>
                                        <p>The lessee must vacate the property at the end of the contract term. Any delay is considered illegal occupation, and the lessor can evict the lessee and claim compensation for the period of delay.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>11. Payment of Utility Bills</label>
                                        <p>The lessee is responsible for paying all utility bills (water, electricity, gas, internet) during the lease term. Failure to pay allows the lessor to take legal action to cover these costs.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>12. Early Termination by the Lessee</label>
                                        <p>If the lessee wishes to terminate the contract early, they must notify the lessor at least one month in advance. Otherwise, they must pay an additional month’s rent as a penalty.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>13. Addresses and Correspondence</label>
                                        <p>The addresses provided in the contract are considered valid for all legal notices, correspondence, and service of process.</p>
                                    </div>

                                    <div className="legal-clause">
                                        <label>14. Number of Contract Copies and Jurisdiction</label>
                                        <p>The contract is made in two digital copies, one for each party, and is subject to the jurisdiction of the local courts where the property is located.</p>
                                    </div>
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
                                    <div className="section-title"><Cpu size={16} /> <h4>Platform Metadata</h4></div>
                                    <div className="mini-grid">
                                        <div className="item"><label>Contract ID</label><span>{summary?.platformMetadata.contractId || contract.id}</span></div>
                                        <div className="item"><label>Created</label><span>{summary?.platformMetadata.created ? new Date(summary.platformMetadata.created).toLocaleDateString() : new Date(contract.createdAt).toLocaleDateString()}</span></div>
                                        <div className="item"><label>Lease ID</label><span>{summary?.platformMetadata.leaseId || '—'}</span></div>
                                    </div>
                                </section>
                                <section className="auto-section">
                                    <div className="section-title"><Landmark size={16} /> <h4>Verified Property Information</h4></div>
                                    <div className="mini-grid">
                                        <div className="item"><label>Title</label><span>{summary?.verifiedPropertyInfo.title || contract.property}</span></div>
                                        <div className="item"><label>Type</label><span>{summary?.verifiedPropertyInfo.type || contract.propertyType}</span></div>
                                        <div className="item"><label>Rooms</label><span>{summary?.verifiedPropertyInfo.rooms || 'N/A'}</span></div>
                                        <div className="item"><label>Furnishing</label><span>{summary?.verifiedPropertyInfo.furnishing || contract.propertyFurnishing}</span></div>
                                        <div className="item full"><label>Address</label><span>{summary?.verifiedPropertyInfo.address || contract.propertyAddress}</span></div>
                                    </div>
                                </section>
                                <section className="auto-section">
                                    <div className="section-title"><DollarSign size={16} /> <h4>Payment Terms</h4></div>
                                    <div className="mini-grid">
                                        <div className="item"><label>Rent</label><span>${summary?.paymentTerms.rent ?? contract.amount}</span></div>
                                        <div className="item"><label>Security Deposit</label><span>${summary?.paymentTerms.securityDeposit ?? contract.deposit}</span></div>
                                        <div className="item"><label>Service Fee</label><span>${summary?.paymentTerms.serviceFee ?? 10}</span></div>
                                        <div className="item"><label>Schedule</label><span>{summary?.paymentTerms.schedule || 'MONTHLY'}</span></div>
                                    </div>
                                </section>
                                <section className="auto-section">
                                    <div className="section-title"><Clock size={16} /> <h4>Lease Duration</h4></div>
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
                                    <div className="sig-footer"><p><Globe size={12} /> Secure IP: 192.168.1.45 • {new Date().toLocaleString()}</p></div>
                                </div>
                            )}
                            <div className="confirmation-check">
                                <input className={isReadOnly ? 'readonly-checkbox' : ''} disabled={isReadOnly} type="checkbox" id="landlord-final" checked={landlordData.confirmed} onChange={(e) => setLandlordData({ ...landlordData, confirmed: e.target.checked })} />
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
                <SignatureModal isOpen={isSignModalOpen} onClose={() => setIsSignModalOpen(false)} onSave={(sig) => { setSavedSignature(sig); setIsSignModalOpen(false); }} />
            )}
        </div>
    );
};

export default ContractDetailView;