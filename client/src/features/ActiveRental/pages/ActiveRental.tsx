import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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

const ActiveRental: React.FC = () => {
    const location = useLocation();
    const [contracts, setContracts] = useState<LandlordContract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [propertyDetails, setPropertyDetails] = useState<PropertyResponse | null>(null);

    useEffect(() => {
        const loadContracts = async () => {
            setIsLoading(true);
            try {
                const response = await contractService.getTenantContracts({ page: 1, limit: 50 });
                const activeContracts = (response.data ?? []).filter((contract) => contract.status === 'ACTIVE');
                setContracts(activeContracts);
            } catch {
                setContracts([]);
            } finally {
                setIsLoading(false);
            }
        };

        void loadContracts();
    }, []);

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

    const getDueDay = (rentDueDate: LandlordContract['rentDueDate'], baseDate: Date): number => {
        if (rentDueDate === '5TH_OF_MONTH') return 5;
        if (rentDueDate === 'LAST_DAY_OF_MONTH') {
            return new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
        }
        return 1;
    };

    const dueDateLabel = useMemo(() => {
        if (!selectedContract) return 'N/A';
        const today = new Date();
        const dueDay = getDueDay(selectedContract.rentDueDate, today);
        const due = new Date(today.getFullYear(), today.getMonth(), dueDay);
        if (due < today) due.setMonth(due.getMonth() + 1);
        return formatDate(due.toISOString());
    }, [selectedContract]);

    const dueInLabel = useMemo(() => {
        if (!selectedContract) return 'N/A';

        const now = new Date();
        const dueDay = getDueDay(selectedContract.rentDueDate, now);

        const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
        if (dueDate < now) {
            dueDate.setMonth(dueDate.getMonth() + 1);
        }

        const diffDays = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
    }, [selectedContract]);

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
                            <UpcomingPayment amount={rentalData.monthlyRent} dueDate={dueDateLabel} dueInLabel={dueInLabel} />
                            
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
        </div>
    );
};

export default ActiveRental;