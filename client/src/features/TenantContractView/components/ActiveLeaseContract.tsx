import React from 'react';
import { 
    X, CheckCircle2, FileText, Download, 
    User, DollarSign, Calendar, MapPin, 
    ShieldCheck, Clock, Building2
} from 'lucide-react';
import { type LeaseContract } from '../pages/Contract';
import './ActiveLeaseContract.css';

interface Props {
    contract: LeaseContract;
    onClose: () => void;
}

import { useTranslation } from 'react-i18next';
import pdfService from '../../../services/pdf.service';

const ActiveLeaseContract: React.FC<Props> = ({ contract, onClose }) => {
    const { t } = useTranslation();

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
                        <button className="btn-secondary-action">
                            <FileText size={16} /> {t('activeLease.viewOriginalTerms')}
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
                    </div>

                    <div className="execution-footer">
                        <Clock size={16} />
                        <p>{t('activeLease.executionNote')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveLeaseContract;