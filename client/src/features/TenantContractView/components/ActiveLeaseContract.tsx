import React from 'react';
import { 
    X, CheckCircle2, FileText, Download, 
    User, DollarSign, Calendar, MapPin, 
    ShieldCheck, Clock, Building2, Eye, Receipt,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { type LeaseContract } from '../pages/Contract';
import './ActiveLeaseContract.css';

interface Props {
    contract: LeaseContract;
    onClose: () => void;
}

import { useTranslation } from 'react-i18next';
import pdfService from '../../../services/pdf.service';
import contractService, { type TenantPaymentHistoryItem } from '../../../services/contract.service';

const ActiveLeaseContract: React.FC<Props> = ({ contract, onClose }) => {
    const { t } = useTranslation();
    const [previewLang, setPreviewLang] = React.useState<'en' | 'ar' | null>(null);
    const [currentPreviewPage, setCurrentPreviewPage] = React.useState(1);
    const [recentPayment, setRecentPayment] = React.useState<TenantPaymentHistoryItem | null>(null);
    const [loadingReceipt, setLoadingReceipt] = React.useState(true);

    // Reset page when lang changes
    React.useEffect(() => {
        if (previewLang) setCurrentPreviewPage(1);
    }, [previewLang]);

    React.useEffect(() => {
        const fetchRecentPayment = async () => {
            try {
                const history = await contractService.getPaymentHistory(10);
                const contractPayments = history.filter(h => h.entityId === contract.internalId);
                if (contractPayments.length > 0) {
                    setRecentPayment(contractPayments[0]);
                }
            } catch (err) {
                console.error('Failed to fetch payment history:', err);
            } finally {
                setLoadingReceipt(false);
            }
        };
        void fetchRecentPayment();
    }, [contract.internalId]);

    const handleDownloadPDF = async (lang: 'en' | 'ar') => {
        const pdfData = {
            id: contract.id,
            property: contract.property,
            propertyAddress: contract.propertyAddress,
            propertyType: contract.propertyType,
            landlord: contract.landlord,
            landlordNationalId: contract.landlordNationalId,
            landlordAddress: contract.landlordAddress || 'Cairo, Egypt',
            tenant: contract.tenant,
            tenantNationalId: contract.tenantNationalId,
            tenantAddress: contract.tenantAddress || contract.propertyAddress,
            startDate: contract.startDate,
            duration: contract.duration,
            amount: contract.amount,
            deposit: contract.deposit,
            lateFeeAmount: contract.lateFeeAmount,
            permittedUse: contract.permittedUse || 'Residential purposes only',
            rightToEnter: contract.rightToEnter || 'With 24h notice',
            noticePeriod: contract.noticePeriod || '24 Hours',
            maintenanceResponsibilities: contract.maintenanceResponsibilities,
            landlordSignature: contract.landlordSignature,
            tenantSignature: contract.tenantSignature,
            executionDate: new Date(contract.createdAt).toLocaleDateString(),
        };
        await pdfService.generateContractPDF(pdfData as any, lang);
    };

    return (
        <div className="active-contract-overlay" dir="ltr">
            <div className="active-detail-panel animate-slide-in-panel">
                <header className="active-panel-header">
                    <div className="header-status-badge">
                        <CheckCircle2 size={16} />
                        <span>{t('activeLease.activeLease')}</span>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close panel">
                        <X size={20}/>
                    </button>
                </header>

                <div className="active-panel-content">
                    <div className="contract-header-info">
                        <h2>{contract.property}</h2>
                        <p className="contract-id-ref">{t('activeLease.contractReference')}: {contract.id}</p>
                    </div>

                    <div className="action-ribbon">
                        <button className="btn-secondary-action" onClick={() => handleDownloadPDF('en')}>
                            <Download size={16} /> {t('activeLease.downloadPDF')} (EN)
                        </button>
                        <button className="btn-secondary-action" onClick={() => handleDownloadPDF('ar')}>
                            <Download size={16} /> {t('activeLease.downloadPDF')} (AR)
                        </button>
                        <button className="btn-secondary-action" onClick={() => setPreviewLang('en')}>
                            <Eye size={16} /> {t('activeLease.viewContract')} (EN)
                        </button>
                        <button className="btn-secondary-action" onClick={() => setPreviewLang('ar')}>
                            <Eye size={16} /> {t('activeLease.viewContract')} (AR)
                        </button>
                    </div>

                    <div className="info-cards-grid">
                        {/* Lease Terms Card */}
                        <section className="info-card">
                            <div className="card-header">
                                <Calendar size={18} className="icon-blue" />
                                <h3>{t('activeLease.leaseTerms')}</h3>
                            </div>
                            <div className="card-content">
                                <div className="data-row">
                                    <span className="label">{t('activeLease.startDate')}</span>
                                    <span className="value">{contract.startDate}</span>
                                </div>
                                <div className="data-row">
                                    <span className="label">{t('activeLease.duration')}</span>
                                    <span className="value">{contract.duration}</span>
                                </div>
                                <div className="data-row">
                                    <span className="label">{t('activeLease.status')}</span>
                                    <span className="value status-active">{t('activeLease.inEffect')}</span>
                                </div>
                            </div>
                        </section>

                        {/* Financials Card */}
                        <section className="info-card">
                            <div className="card-header">
                                <DollarSign size={18} className="icon-green" />
                                <h3>{t('activeLease.financials')}</h3>
                            </div>
                            <div className="card-content">
                                <div className="data-row">
                                    <span className="label">{t('activeLease.monthlyRent')}</span>
                                    <span className="value highlight">${contract.amount}</span>
                                </div>
                                <div className="data-row">
                                    <span className="label">{t('activeLease.securityDeposit')}</span>
                                    <span className="value">${contract.deposit}</span>
                                </div>
                                <div className="data-row">
                                    <span className="label">{t('activeLease.nextPayment')}</span>
                                    <span className="value">{contract.rentDueDate.replaceAll('_', ' ')}</span>
                                </div>
                            </div>
                        </section>

                        {/* Parties Involved Card */}
                        <section className="info-card full-width">
                            <div className="card-header">
                                <User size={18} className="icon-purple" />
                                <h3>{t('activeLease.partiesInvolved')}</h3>
                            </div>
                            <div className="card-content multi-col">
                                <div className="party-box">
                                    <span className="party-role">{t('activeLease.tenant')}</span>
                                    <span className="party-name">{contract.tenant}</span>
                                    <span className="party-status"><ShieldCheck size={14}/> {t('activeLease.verified')}</span>
                                </div>
                                <div className="party-box">
                                    <span className="party-role">{t('activeLease.landlord')}</span>
                                    <span className="party-name">{contract.landlord}</span>
                                    <span className="party-status"><ShieldCheck size={14}/> {t('activeLease.verified')}</span>
                                </div>
                            </div>
                        </section>

                        {/* Property Details Card */}
                        <section className="info-card full-width">
                            <div className="card-header">
                                <Building2 size={18} className="icon-orange" />
                                <h3>{t('activeLease.propertyDetails')}</h3>
                            </div>
                            <div className="card-content">
                                <div className="data-row">
                                    <span className="label">{t('activeLease.address')}</span>
                                    <span className="value flex-value"><MapPin size={14}/> {contract.propertyAddress}</span>
                                </div>
                                <div className="data-row">
                                    <span className="label">{t('activeLease.usage')}</span>
                                    <span className="value">{contract.propertyType || 'Residential'}</span>
                                </div>
                            </div>
                        </section>

                        {/* Recent Payment Receipt Card */}
                        <section className="info-card full-width">
                            <div className="card-header">
                                <Receipt size={18} className="icon-green" />
                                <h3>{t('activeLease.recentPaymentReceipt')}</h3>
                            </div>
                            <div className="card-content">
                                {loadingReceipt ? (
                                    <div className="loading-state">Loading receipt...</div>
                                ) : recentPayment ? (
                                    <div className="receipt-display-box">
                                        <div className="receipt-main-info">
                                            <div className="receipt-col">
                                                <span className="label">{t('activeLease.paymentDate')}</span>
                                                <span className="value">{new Date(recentPayment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="receipt-col">
                                                <span className="label">{t('activeLease.reference')}</span>
                                                <span className="value">{recentPayment.reference}</span>
                                            </div>
                                            <div className="receipt-col">
                                                <span className="label">{t('activeLease.totalPaid')}</span>
                                                <span className="value highlight">${recentPayment.amount}</span>
                                            </div>
                                        </div>
                                        <div className="receipt-breakdown">
                                            <div className="breakdown-row">
                                                <span>{t('activeLease.monthlyRent')}</span>
                                                <span>${contract.amount}</span>
                                            </div>
                                            {recentPayment.type === 'CONTRACT_INITIAL' && (
                                                <div className="breakdown-row">
                                                    <span>{t('activeLease.securityDeposit')}</span>
                                                    <span>${contract.deposit}</span>
                                                </div>
                                            )}
                                            <div className="breakdown-row">
                                                <span>{t('activeLease.platformFee')}</span>
                                                <span>$10.00</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-receipt-state">{t('activeLease.noReceiptFound')}</div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="execution-footer">
                        <Clock size={16} />
                        <p>{t('activeLease.executionNote')}</p>
                    </div>
                </div>
            </div>

            {previewLang && (
                <div className="contract-preview-overlay">
                    <div className="preview-container animate-fade-in">
                        <header className="preview-header">
                            <div className="header-left">
                                <h3>{t('activeLease.contractPreview')} ({previewLang.toUpperCase()})</h3>
                                <span className="page-indicator">Page {currentPreviewPage} of 2</span>
                            </div>
                            <div className="header-actions">
                                <div className="pagination-controls">
                                    <button 
                                        className="icon-btn" 
                                        disabled={currentPreviewPage === 1}
                                        onClick={() => setCurrentPreviewPage(1)}
                                    >
                                        <ChevronLeft size={20}/>
                                    </button>
                                    <button 
                                        className="icon-btn" 
                                        disabled={currentPreviewPage === 2}
                                        onClick={() => setCurrentPreviewPage(2)}
                                    >
                                        <ChevronRight size={20}/>
                                    </button>
                                </div>
                                <button className="icon-btn close-preview" onClick={() => setPreviewLang(null)}><X size={20}/></button>
                            </div>
                        </header>
                        <div className="preview-body">
                            <div className="preview-document" dir={previewLang === 'ar' ? 'rtl' : 'ltr'}>
                                {currentPreviewPage === 1 ? (
                                    <>
                                        <div className="pdf-header-preview">
                                            <h1>{previewLang === 'en' ? 'RESIDENTIAL LEASE AGREEMENT' : 'عقد إيجار وحدة سكنية'}</h1>
                                            <div className="ref-no">{previewLang === 'en' ? 'Contract Ref' : 'رقم مرجع العقد'}: {contract.id}</div>
                                        </div>
                                        
                                        {/* Section 1: Parties */}
                                        <div className="pdf-section">
                                            <div className="pdf-section-title">{previewLang === 'en' ? '1. PARTIES INVOLVED' : '١. أطراف التعاقد'}</div>
                                            <div className="pdf-data-grid">
                                                <div className="pdf-party-card">
                                                    <span className="pdf-data-label">{previewLang === 'en' ? 'Lessor (Landlord)' : 'المؤجر (الطرف الأول)'}</span>
                                                    <span className="pdf-data-value" style={{ fontWeight: 'bold' }}>{contract.landlord}</span><br/>
                                                    <span className="pdf-data-label" style={{ marginTop: '8px' }}>{previewLang === 'en' ? 'National ID' : 'الرقم القومي'}:</span> <span className="pdf-data-value">{contract.landlordNationalId || '—'}</span><br/>
                                                    <span className="pdf-data-label">{previewLang === 'en' ? 'Primary Address' : 'العنوان الحالي'}:</span> <span className="pdf-data-value">{contract.landlordAddress || '—'}</span>
                                                </div>
                                                <div className="pdf-party-card">
                                                    <span className="pdf-data-label">{previewLang === 'en' ? 'Lessee (Tenant)' : 'المستأجر (الطرف الثاني)'}</span>
                                                    <span className="pdf-data-value" style={{ fontWeight: 'bold' }}>{contract.tenant}</span><br/>
                                                    <span className="pdf-data-label" style={{ marginTop: '8px' }}>{previewLang === 'en' ? 'National ID' : 'الرقم القومي'}:</span> <span className="pdf-data-value">{contract.tenantNationalId || '—'}</span><br/>
                                                    <span className="pdf-data-label">{previewLang === 'en' ? 'Primary Address' : 'العنوان الحالي'}:</span> <span className="pdf-data-value">{contract.tenantAddress || contract.propertyAddress}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 2: Property & Terms */}
                                        <div className="pdf-section">
                                            <div className="pdf-section-title">{previewLang === 'en' ? '2. PROPERTY & TERMS' : '٢. بيانات العقار والمدة'}</div>
                                            <div className="pdf-data-grid">
                                                <div className="pdf-data-item"><span className="pdf-data-label">{previewLang === 'en' ? 'Property Address' : 'عنوان العقار المؤجر'}</span><span className="pdf-data-value">{contract.propertyAddress}</span></div>
                                                <div className="pdf-data-item"><span className="pdf-data-label">{previewLang === 'en' ? 'Property Type' : 'نوع العقار'}</span><span className="pdf-data-value">{contract.propertyType}</span></div>
                                                <div className="pdf-data-item"><span className="pdf-data-label">{previewLang === 'en' ? 'Lease Start Date' : 'تاريخ بداية العقد'}</span><span className="pdf-data-value">{contract.startDate}</span></div>
                                                <div className="pdf-data-item"><span className="pdf-data-label">{previewLang === 'en' ? 'Lease Duration' : 'مدة التعاقد'}</span><span className="pdf-data-value">{contract.duration}</span></div>
                                            </div>
                                        </div>

                                        {/* Section 3: Financials */}
                                        <div className="pdf-section">
                                            <div className="pdf-section-title">{previewLang === 'en' ? '3. FINANCIAL OBLIGATIONS' : '٣. الالتزامات المالية'}</div>
                                            <div className="pdf-data-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                                <div className="pdf-data-item"><span className="pdf-data-label">{previewLang === 'en' ? 'Monthly Rent Amount' : 'القيمة الإيجارية الشهرية'}</span><span className="pdf-data-value" style={{ color: '#27ae60', fontWeight: 'bold' }}>${contract.amount}</span></div>
                                                <div className="pdf-data-item"><span className="pdf-data-label">{previewLang === 'en' ? 'Security Deposit' : 'مبلغ التأمين'}</span><span className="pdf-data-value" style={{ color: '#2980b9', fontWeight: 'bold' }}>${contract.deposit}</span></div>
                                                <div className="pdf-data-item"><span className="pdf-data-label">{previewLang === 'en' ? 'Late Fee Penalty' : 'غرامة التأخير'}</span><span className="pdf-data-value" style={{ color: '#c0392b', fontWeight: 'bold' }}>${contract.lateFeeAmount || 0}</span></div>
                                            </div>
                                        </div>

                                        {/* Section 4: Rules */}
                                        <div className="pdf-section">
                                            <div className="pdf-section-title">{previewLang === 'en' ? '4. RULES & PERMISSIONS' : '٤. القواعد والأذونات'}</div>
                                            <div className="pdf-data-grid">
                                                <div className="pdf-data-item"><span className="pdf-data-label">{previewLang === 'en' ? 'Permitted Use' : 'الغرض من الاستخدام'}</span><span className="pdf-data-value">{contract.permittedUse || 'Residential'}</span></div>
                                                <div className="pdf-data-item"><span className="pdf-data-label">{previewLang === 'en' ? 'Access/Entry Rights' : 'حق الدخول للمعاينة'}</span><span className="pdf-data-value">{contract.rightToEnter || 'With 24h Notice'}</span></div>
                                                <div className="pdf-data-item"><span className="pdf-data-label">{previewLang === 'en' ? 'Notice Period' : 'مدة الإخطار المسبق'}</span><span className="pdf-data-value">{contract.noticePeriod || '24 Hours'}</span></div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Section 5: Legal Clauses (Full) */}
                                        <div className="pdf-section">
                                            <div className="pdf-section-title">{previewLang === 'en' ? '5. LEGAL CLAUSES & COVENANTS' : '٥. البنود القانونية'}</div>
                                            <div className="pdf-clause-list">
                                                <div className="pdf-clause-item">1. {previewLang === 'en' ? `Description: The property is located at ${contract.propertyAddress}. It consists of the unit specified (${contract.propertyType}).` : `الوصف: يقع العقار في ${contract.propertyAddress}. ويتكون من الوحدة المحددة (${contract.propertyType}).`}</div>
                                                <div className="pdf-clause-item">2. {previewLang === 'en' ? `Duration: The contract starts on ${contract.startDate} and has a duration of ${contract.duration}.` : `المدة: يبدأ العقد في ${contract.startDate} ومدته ${contract.duration}.`}</div>
                                                <div className="pdf-clause-item">3. {previewLang === 'en' ? `Value: The monthly rent is $${contract.amount}. It must be paid in advance at the beginning of each month.` : `القيمة: مبلغ الإيجار الشهري هو $${contract.amount}. يجب دفعه مقدماً في بداية كل شهر.`}</div>
                                                <div className="pdf-clause-item">4. {previewLang === 'en' ? `Deposit: A security deposit of $${contract.deposit} is paid. Refundable if no damages or unpaid bills.` : `التأمين: يتم دفع تأمين قدره $${contract.deposit}. يسترد إذا لم تكن هناك أضرار أو فواتير.`}</div>
                                                <div className="pdf-clause-item">5. {previewLang === 'en' ? `Late Payment: A late fee of $${contract.lateFeeAmount || 0} applies if payment is delayed more than 5 days.` : `التأخير: تطبق غرامة $${contract.lateFeeAmount || 0} في حال التأخر عن الدفع لأكثر من 5 أيام.`}</div>
                                                <div className="pdf-clause-item">6. {previewLang === 'en' ? 'No Subleasing: Lessee cannot sublease or make changes without written consent.' : 'التنازل: لا يجوز للمستأجر التنازل عن الإيجار أو تغيير العقار دون موافقة.'}</div>
                                                <div className="pdf-clause-item">7. {previewLang === 'en' ? 'Use: Property must be used for residential purposes only. Any other use terminates contract.' : 'الاستخدام: يستخدم العقار للسكن فقط. أي استخدام آخر ينهي العقد تلقائياً.'}</div>
                                                <div className="pdf-clause-item">8. {previewLang === 'en' ? 'Expenses: Lessee expenses (decorations/improvements) are not reimbursable by lessor.' : 'المصاريف: مصاريف المستأجر (تحسينات/ديكور) لا يستردها وتصبح جزءاً من العقار.'}</div>
                                                <div className="pdf-clause-item">9. {previewLang === 'en' ? 'Condition: Lessee must return property in original condition. Liable for negligence.' : 'الحالة: يجب إعادة العقار بحالته الأصلية. المستأجر مسؤول عن أي إهمال.'}</div>
                                                <div className="pdf-clause-item">10. {previewLang === 'en' ? 'Eviction: Lessee must vacate at end of term. Delay results in illegal occupation.' : 'الإخلاء: يجب الإخلاء عند انتهاء العقد. التأخير يعتبر شغلاً غير قانوني.'}</div>
                                                <div className="pdf-clause-item">11. {previewLang === 'en' ? 'Utilities: Lessee is responsible for water, electricity, gas, and internet bills.' : 'المرافق: المستأجر مسؤول عن دفع فواتير الكهرباء والمياه والغاز والإنترنت.'}</div>
                                                <div className="pdf-clause-item">12. {previewLang === 'en' ? 'Termination: Early termination requires one month notice or one month rent penalty.' : 'الإنهاء: يتطلب الإنهاء المبكر إخطاراً قبل شهر أو دفع إيجار شهر غرامة.'}</div>
                                                <div className="pdf-clause-item">13. {previewLang === 'en' ? 'Correspondence: Addresses in contract are valid for all legal notices.' : 'المراسلات: العناوين المذكورة صحيحة لجميع الإخطارات القانونية والمراسلات.'}</div>
                                                <div className="pdf-clause-item">14. {previewLang === 'en' ? 'Jurisdiction: Digital copies provided to both parties. Subject to local courts.' : 'الاختصاص: نسختان رقميتان للطرفين. يخضع العقد للمحاكم المحلية.'}</div>
                                            </div>
                                        </div>

                                        {/* Section 6: Signatures */}
                                        <div className="pdf-signature-area">
                                            <div className="pdf-sig-box">
                                                <span className="pdf-data-label">{previewLang === 'en' ? 'Landlord Signature' : 'توقيع المؤجر'}</span>
                                                <div className="pdf-sig-img" style={{ fontSize: '10px', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', height: '60px' }}>
                                                    {previewLang === 'en' ? 'Digitally Signed' : 'تم التوقيع رقمياً'}
                                                </div>
                                                <div style={{ fontSize: '11px' }}>{previewLang === 'en' ? 'Date' : 'التاريخ'}: {new Date(contract.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <div className="pdf-sig-box">
                                                <span className="pdf-data-label">{previewLang === 'en' ? 'Tenant Signature' : 'توقيع المستأجر'}</span>
                                                <div className="pdf-sig-img" style={{ fontSize: '10px', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', height: '60px' }}>
                                                    {previewLang === 'en' ? 'Digitally Signed' : 'تم التوقيع رقمياً'}
                                                </div>
                                                <div style={{ fontSize: '11px' }}>{previewLang === 'en' ? 'Date' : 'التاريخ'}: {new Date(contract.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pdf-footer-preview">
                                    {previewLang === 'en' ? 'Digitally Verified Agreement • HOMI Platform • Timestamped Security' : 'عقد موثق رقمياً • منصة هومي (HOMI) • حماية تقنية وتوقيع زمنى'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveLeaseContract;