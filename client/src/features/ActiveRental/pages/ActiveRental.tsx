import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ActiveRental.css';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import DetailedRentCard from '../components/DetailedRentCard';
import UpcomingPayment from '../components/UpcomingPayment';
import QuickActions from '../components/QuickActions';
import MaintenanceStatus from '../components/MaintenanceStatus';
import contractService, { type LandlordContract } from '../../../services/contract.service';
import { propertyService, type PropertyResponse } from '../../../services/property.service';
import { formatDateLabel, getRentCycleSummary, getRentInstallmentStats } from '../../TenantPayment/utils/rentSchedule';
import type { TenantPaymentHistoryItem } from '../../../services/contract.service';
import InstallmentsModal from '../components/InstallmentsModal';

const ActiveRental: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [contracts, setContracts] = useState<LandlordContract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [propertyDetails, setPropertyDetails] = useState<PropertyResponse | null>(null);
    const [isPayingRent, setIsPayingRent] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState<TenantPaymentHistoryItem[]>([]);
    const [showInstallments, setShowInstallments] = useState(false);

    const loadContracts = useCallback(async () => {
        setIsLoading(true);
        try {
            const [contractsRes, historyRes] = await Promise.all([
                contractService.getTenantContracts({ page: 1, limit: 50 }),
                contractService.getPaymentHistory(250),
            ]);
            const all = contractsRes.data ?? [];
            const payableContracts = all.filter((contract) => {
                if (contract.status === 'ACTIVE') return true;
                if (contract.status !== 'EXPIRED') return false;
                const stats = getRentInstallmentStats(contract);
                const paidInstallments = (historyRes ?? [])
                    .filter((row) =>
                        row.type === 'RENT_MONTHLY' &&
                        row.direction === 'DEBIT' &&
                        row.entityId === contract.id
                    )
                    .reduce((sum, row) => sum + Math.max(Number(row.installmentsCount ?? 1), 1), 0);
                const outstanding = Math.max(stats.dueCount - paidInstallments, 0);
                return outstanding > 0;
            });
            setContracts(payableContracts);
            setPaymentHistory(historyRes ?? []);
        } catch {
            setContracts([]);
            setPaymentHistory([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadContracts();
        const handler = () => { void loadContracts(); };
        globalThis.addEventListener('homi:testing-clock-changed', handler);
        return () => globalThis.removeEventListener('homi:testing-clock-changed', handler);
    }, [loadContracts]);

    const contractIdFromQuery = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('contractId') ?? '';
    }, [location.search]);

    const selectedContract = useMemo(() => {
        if (!contracts.length) return null;
        if (contractIdFromQuery) {
            const matched = contracts.find((contract) => contract.id === contractIdFromQuery);
            if (matched) return matched;
        }
        return contracts[0];
    }, [contracts, contractIdFromQuery]);

    useEffect(() => {
        const propertyId = selectedContract?.property?.id;
        if (!propertyId) {
            setPropertyDetails(null);
            return;
        }

        let cancelled = false;

        const loadPropertyDetails = async () => {
            try {
                const response = await propertyService.getPropertyById(propertyId);
                if (!cancelled) {
                    setPropertyDetails(response.data);
                }
            } catch {
                if (!cancelled) {
                    setPropertyDetails(null);
                }
            }
        };

        void loadPropertyDetails();

        return () => {
            cancelled = true;
        };
    }, [selectedContract?.property?.id]);

    const formatDate = (date?: string) => {
        if (!date) return 'N/A';
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return 'N/A';
        return parsed.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const formatLeaseEnd = (moveInDate?: string, durationMonths?: number) => {
        if (!moveInDate) return 'N/A';
        const start = new Date(moveInDate);
        if (Number.isNaN(start.getTime())) return 'N/A';
        const end = new Date(start);
        end.setMonth(end.getMonth() + Number(durationMonths ?? 0));
        return formatDate(end.toISOString());
    };

    const rentCycle = useMemo(() => {
        if (!selectedContract) return null;
        return getRentCycleSummary(selectedContract);
    }, [selectedContract]);

    const dueDateLabel = rentCycle ? formatDateLabel(rentCycle.dueDate) : 'N/A';
    const dueInLabel = rentCycle ? `${rentCycle.daysUntilDue} day${rentCycle.daysUntilDue === 1 ? '' : 's'}` : 'N/A';
    const dueTone = rentCycle && rentCycle.daysUntilDue > 7 ? 'safe' : 'urgent';
    const installmentStats = useMemo(
        () => (selectedContract ? getRentInstallmentStats(selectedContract) : { dueCount: 0, overdueCount: 0 }),
        [selectedContract]
    );
    const paidInstallments = useMemo(() => {
        if (!selectedContract) return 0;
        return paymentHistory
            .filter((row) =>
                row.type === 'RENT_MONTHLY' &&
                row.direction === 'DEBIT' &&
                row.entityId === selectedContract.id
            )
            .reduce((sum, row) => sum + Math.max(Number(row.installmentsCount ?? 1), 1), 0);
    }, [paymentHistory, selectedContract]);
    const outstandingInstallments = Math.max(installmentStats.dueCount - paidInstallments, 0);
    const estimatedLateFee = Math.max(Number(selectedContract?.lateFeeAmount ?? 0), 0) * Math.max(installmentStats.overdueCount - paidInstallments, 0);
    const totalDueNow = Math.max(outstandingInstallments, 1) * Number(selectedContract?.rentAmount ?? selectedContract?.property?.monthlyPrice ?? 0) + estimatedLateFee;

    const rentalData = useMemo(() => {
        if (!selectedContract) return null;

        const resolvedImage =
            propertyDetails?.images?.find((image) => image.isMain)?.imageUrl ||
            propertyDetails?.images?.[0]?.imageUrl ||
            null;

        return {
            title: propertyDetails?.title || selectedContract.property?.title || 'Property',
            address: propertyDetails?.address || selectedContract.property?.address || 'Address unavailable',
            leaseStart: formatDate(selectedContract.moveInDate),
            leaseEnd: formatLeaseEnd(selectedContract.moveInDate, selectedContract.leaseDurationMonths),
            monthlyRent: Number(selectedContract.rentAmount ?? propertyDetails?.monthlyPrice ?? selectedContract.property?.monthlyPrice ?? 0),
            landlord: `${selectedContract.landlord?.firstName || ''} ${selectedContract.landlord?.lastName || ''}`.trim() || 'Landlord',
            sqft: propertyDetails?.specifications?.areaSqft ?? selectedContract.propertySpecifications?.areaSqft ?? 0,
            image: resolvedImage,
            propertyType: propertyDetails?.type || selectedContract.property?.type || 'Apartment',
            houseRules: propertyDetails?.houseRules?.map((rule) => rule.name) ?? [],
        };
    }, [propertyDetails, selectedContract]);

    const handlePayNow = () => {
        if (!selectedContract || !rentalData || isPayingRent) return;
        setShowInstallments(true);
    };

    const handleInstallmentsPaid = async () => {
        setIsPayingRent(true);
        try {
            await loadContracts();
        } finally {
            setIsPayingRent(false);
        }
    };

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="active-rentals-container">
                    {isLoading && (
                        <div className="active-rental-state-box" style={{ marginBottom: '20px' }}>
                            <h3 className="active-rental-state-title">Loading rental details...</h3>
                        </div>
                    )}

                    {!isLoading && !rentalData && (
                        <div className="active-rental-state-box" style={{ marginBottom: '20px' }}>
                            <h3 className="active-rental-state-title">No active rental found</h3>
                            <p className="active-rental-state-text">Once your contract is active, its details will appear here.</p>
                        </div>
                    )}

                    <QuickActions />

                    {!isLoading && rentalData && (
                    <div className="active-rental-content">
                        <section className="main-rental-info">
                            <DetailedRentCard rental={rentalData} />
                            <MaintenanceStatus contract={selectedContract} />
                        </section>

                        <aside className="payment-sidebar">
                            <UpcomingPayment
                                amount={rentalData.monthlyRent}
                                dueDate={dueDateLabel}
                                dueInLabel={dueInLabel}
                                dueTone={dueTone}
                                outstandingInstallments={outstandingInstallments}
                                estimatedLateFee={estimatedLateFee}
                                totalDue={totalDueNow}
                                onPayNow={handlePayNow}
                                onTopUp={() => navigate('/tenant-payment?tab=topup')}
                                isPaying={isPayingRent}
                                isCurrentCyclePaid={outstandingInstallments <= 0}
                            />
                            
                            <div className="support-card">
                                <h4>Need Help?</h4>
                                <p>Contact our 24/7 support line for urgent property issues.</p>
                                <button className="secondary-btn">Contact Support</button>
                            </div>

                            <div className="cancel-rental-card">
                                <h4>Terminate Lease</h4>
                                <p>Review terms or initiate the move-out process early.</p>
                                <button className="cancel-btn">Cancel Rental</button>
                            </div>
                        </aside>
                    </div>
                    )}
                </div>
                <Footer />
            </div>
            {showInstallments && selectedContract && (
                <InstallmentsModal
                    contractId={selectedContract.id}
                    contractTitle={rentalData?.title ?? 'Contract'}
                    onClose={() => setShowInstallments(false)}
                    onPaid={() => {
                        void handleInstallmentsPaid();
                    }}
                />
            )}
        </div>
    );
};

export default ActiveRental;