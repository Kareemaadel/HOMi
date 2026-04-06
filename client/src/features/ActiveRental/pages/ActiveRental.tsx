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

const ActiveRental: React.FC = () => {
    const location = useLocation();
    const [contracts, setContracts] = useState<LandlordContract[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const dueDateLabel = useMemo(() => {
        if (!selectedContract) return 'N/A';
        const today = new Date();
        const dueDay = selectedContract.rentDueDate === '5TH_OF_MONTH' ? 5 : 1;
        const due = new Date(today.getFullYear(), today.getMonth(), dueDay);
        if (due < today) due.setMonth(due.getMonth() + 1);
        return formatDate(due.toISOString());
    }, [selectedContract]);

    const rentalData = useMemo(() => {
        if (!selectedContract) return null;
        return {
            title: selectedContract.property?.title || 'Property',
            address: selectedContract.property?.address || 'Address unavailable',
            leaseStart: formatDate(selectedContract.moveInDate),
            leaseEnd: formatLeaseEnd(selectedContract.moveInDate, selectedContract.leaseDurationMonths),
            monthlyRent: Number(selectedContract.rentAmount ?? selectedContract.property?.monthlyPrice ?? 0),
            landlord: `${selectedContract.landlord?.firstName || ''} ${selectedContract.landlord?.lastName || ''}`.trim() || 'Landlord',
            sqft: 0,
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            propertyType: selectedContract.property?.type || 'Apartment',
        };
    }, [selectedContract]);

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
                            <MaintenanceStatus />
                        </section>

                        <aside className="payment-sidebar">
                            <UpcomingPayment amount={rentalData.monthlyRent} dueDate={dueDateLabel} />
                            
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