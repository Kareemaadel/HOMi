import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './DetailedRentCard.css';
import {
    FaCalendarAlt, FaUserCircle,
    FaFileDownload, FaMapMarkerAlt, FaGavel, FaTimes, FaHome
} from 'react-icons/fa';
import pdfService from '../../../services/pdf.service';

interface RentalProps {
    rental: {
        title: string;
        address: string;
        landlord: string;
        leaseStart: string;
        leaseEnd: string;
        sqft: number;
        image: string | null;
        propertyType?: string;
        houseRules: string[];
        monthlyRent: number;
    };
    contract: any;
}

const DetailedRentCard: React.FC<RentalProps> = ({ rental, contract }) => {
    const { t } = useTranslation();
    const [showRules, setShowRules] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setShowRules(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDownloadPDF = async (lang: 'en' | 'ar') => {
        if (!contract) return;
        const pdfData = {
            id: contract.id,
            property: rental.title,
            propertyAddress: rental.address,
            propertyType: rental.propertyType || 'Apartment',
            landlord: rental.landlord,
            landlordNationalId: contract.landlordNationalId,
            landlordAddress: contract.landlordAddress || 'Cairo, Egypt', // Placeholder if not in DB
            tenant: `${contract.tenant?.firstName || ''} ${contract.tenant?.lastName || ''}`.trim() || 'Tenant',
            tenantNationalId: contract.tenantNationalId,
            tenantAddress: contract.tenantAddress || rental.address, // Usually the rented property address
            startDate: rental.leaseStart,
            duration: `${contract.leaseDurationMonths || 12} Months`,
            amount: rental.monthlyRent,
            deposit: contract.securityDeposit || 0,
            lateFeeAmount: contract.lateFeeAmount || 0,
            permittedUse: contract.permittedUse || 'Residential purposes only',
            rightToEnter: contract.rightToEnter || 'With 24h notice',
            noticePeriod: contract.noticePeriod || '24 Hours',
            maintenanceResponsibilities: contract.maintenanceResponsibilities,
            landlordSignature: contract.landlordSignature || (contract.landlordSignedAt ? `https://storage.homi.com/signatures/${contract.id}-landlord.png` : undefined),
            tenantSignature: contract.tenantSignature || (contract.status === 'ACTIVE' ? `https://storage.homi.com/signatures/${contract.id}-tenant.png` : undefined),
            executionDate: new Date(contract.createdAt).toLocaleDateString(),
        };
        await pdfService.generateContractPDF(pdfData as any, lang);
    };

    const houseRules = rental.houseRules;
    const locationBadge = rental.address.split(',')[1]?.trim() || rental.address;

    return (
        <div className="premium-detailed-card animate-fade-in" dir="ltr">
            <div className="card-visual-side">
                {rental.image ? (
                    <img src={rental.image} alt={rental.title} className="hero-rental-img" />
                ) : (
                    <div className="hero-rental-img placeholder-rental-img" aria-label="Property image unavailable">
                        <FaHome />
                        <span>{t('landlordHomeComponents.noPhotos')}</span>
                    </div>
                )}
                <div className="glass-status-tag">{t('activeLease.inEffect')}</div>
            </div>

            <div className="card-content-side">
                <header className="rental-header">
                    <div className="location-badge">
                        <FaMapMarkerAlt /> {locationBadge}
                    </div>
                    <h2>{rental.title}</h2>
                    <p className="full-address">{rental.address}</p>
                </header>

                <div className="info-grid-modern">
                    <div className="info-tile">
                        <div className="tile-icon"><FaUserCircle /></div>
                        <div className="tile-data">
                            <span className="tile-label">{t('activeLease.landlord')}</span>
                            <span className="tile-value">{rental.landlord}</span>
                        </div>
                    </div>

                    <div className="info-tile">
                        <div className="tile-icon"><FaHome /></div>
                        <div className="tile-data">
                            <span className="tile-label">{t('activeLease.usage')}</span>
                            <span className="tile-value">{rental.propertyType || 'Apartment'}</span>
                        </div>
                    </div>

                    <div className="info-tile full-width">
                        <div className="tile-icon"><FaCalendarAlt /></div>
                        <div className="tile-data">
                            <span className="tile-label">{t('activeLease.leaseTerms')}</span>
                            <span className="tile-value">{rental.leaseStart} — {rental.leaseEnd}</span>
                        </div>
                    </div>
                </div>

                <div className="card-actions-row">
                    <div className="pdf-buttons-group" style={{ display: 'flex', gap: '8px' }}>
                        <button className="download-contract-btn" onClick={() => handleDownloadPDF('en')}>
                            <FaFileDownload />
                            <span>{t('activeLease.downloadPDF')} (EN)</span>
                        </button>
                        <button className="download-contract-btn" onClick={() => handleDownloadPDF('ar')}>
                            <FaFileDownload />
                            <span>{t('activeLease.downloadPDF')} (AR)</span>
                        </button>
                    </div>

                    <div className="rules-wrapper">
                        <button
                            className={`rules-trigger-btn ${showRules ? 'active' : ''}`}
                            onClick={() => setShowRules(!showRules)}
                        >
                            <FaGavel />
                            <span>{t('activeLease.houseRules')}</span>
                        </button>

                        {showRules && (
                            <div className="mini-rules-modal" ref={modalRef}>
                                <div className="rules-header">
                                    <span>{t('activeLease.propertyRules')}</span>
                                    <FaTimes className="close-rules" onClick={() => setShowRules(false)} />
                                </div>
                                <ul className="rules-list">
                                    {(houseRules.length > 0 ? houseRules : [t('landlordHomeComponents.noHouseRulesProvided')]).map((rule) => (
                                        <li key={rule}>{rule}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedRentCard;