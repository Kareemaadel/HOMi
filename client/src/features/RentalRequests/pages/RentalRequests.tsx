import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import RequestCard from '../components/RequestCard';
import StatsOverview from '../components/StatsOverview';
import FilterTabs from '../components/FilterTabs';
import { FaInbox } from 'react-icons/fa'; // Added for the empty state
import rentalRequestService from '../../../services/rental-request.service';
import type { LandlordRentalRequest } from '../../../services/rental-request.service';
import './RentalRequests.css';

const RentalRequests: React.FC = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [requests, setRequests] = useState<LandlordRentalRequest[]>([]);

    const formatDate = (date?: string) => {
        if (!date) return 'Flexible';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const refreshRequests = useCallback(async () => {
        try {
            const response = await rentalRequestService.getLandlordRequests();
            setRequests(response.data || []);
        } catch {
            setRequests([]);
        }
    }, []);

    useEffect(() => {
        void refreshRequests();
    }, [refreshRequests]);

    const mappedRequests = useMemo(() => {
        return requests.map((req) => ({
            id: req.id,
            applicant: {
                name: `${req.tenant.firstName} ${req.tenant.lastName}`.trim(),
                image: req.tenant.avatarUrl || 'https://i.pravatar.cc/150?u=fallback',
                occupation: 'Tenant',
                company: '',
                income: 'Verified',
                creditScore: 720,
                matchScore: 85,
            },
            property: {
                name: req.property.title,
                unit: req.property.address,
                rent: req.property.monthlyPrice ? `$${req.property.monthlyPrice}` : '',
                title: req.property.title,
            },
            status: req.status.toLowerCase(),
            message: req.message || '',
            moveInDate: formatDate(req.moveInDate),
            livingSituation: req.livingSituation.toLowerCase(),
            duration: req.duration.replace('_MONTHS', '').replace('_', ' '),
            occupants: req.occupants,
            habits: req.tenant.habits || [],
            appliedOnDate: formatDate(req.createdAt),
        }));
    }, [requests]);

    const tabCounts = useMemo(() => ({
        pending: mappedRequests.filter((req) => req.status === 'pending').length,
        review: mappedRequests.filter((req) => req.status === 'review' || req.status === 'under_review').length,
        approved: mappedRequests.filter((req) => req.status === 'approved').length,
        declined: mappedRequests.filter((req) => req.status === 'declined').length,
    }), [mappedRequests]);

    const currentRequests = useMemo(() => {
        if (activeTab === 'pending') return mappedRequests.filter((req) => req.status === 'pending');
        if (activeTab === 'review') return mappedRequests.filter((req) => req.status === 'review' || req.status === 'under_review');
        if (activeTab === 'approved') return mappedRequests.filter((req) => req.status === 'approved');
        if (activeTab === 'declined') return mappedRequests.filter((req) => req.status === 'declined');
        return mappedRequests;
    }, [activeTab, mappedRequests]);

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main className="rental-requests-page">
                    <header className="page-intro">
                        <div className="intro-text">
                            <h1>Rental Requests</h1>
                            <p>Screen applicants and manage your property pipeline.</p>
                        </div>
                        <StatsOverview totalApplicants={mappedRequests.length} />
                    </header>

                    <FilterTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={tabCounts} />

                    {/* Conditional Rendering for Empty State vs Grid */}
                    {currentRequests.length > 0 ? (
                        <div className="rental-requests-grid">
                            {currentRequests.map(req => (
                                <RequestCard key={req.id} data={req} onStatusChange={refreshRequests} />
                            ))}
                        </div>
                    ) : (
                        <div className="rr-empty-state-container">
                            <div className="rr-empty-state-icon">
                                <FaInbox />
                            </div>
                            <h3 className="rr-empty-state-title">No rental applications yet</h3>
                            <p className="rr-empty-state-text">We'll notify you as soon as someone applies.</p>
                        </div>
                    )}

                </main>
                <Footer />
            </div>
        </div>
    );
};

export default RentalRequests;