import React, { useState } from 'react';
import Header from '../../../../../components/global/header';
import Footer from '../../../../../components/global/footer';
import MaintenanceSideBar from '../../SideBar/MaintenanceSideBar';
import JobRequestCard from '../components/JobRequestCard';
import type { JobRequestCardProps } from '../components/JobRequestCard';
import DetailedMaintenanceModal from '../components/DetailedMaintenanceModal';
import './JobRequests.css';

// Mock Data
const MOCK_JOB_REQUESTS: Omit<JobRequestCardProps, 'onViewDetails'>[] = [
    {
        id: 'req-001',
        issueType: 'Plumbing Issue',
        description: 'The kitchen sink is severely leaking from the pipes underneath. Water is pooling on the floor and requires immediate attention to prevent water damage to the cabinets.',
        requesterName: 'Sarah Jenkins',
        requesterRole: 'Tenant',
        propertyLocation: 'Apt 4B, Sunset Boulevard, Cairo',
        urgency: 'Critical',
        price: 1500,
        dateRequested: 'Oct 24, 2023',
        paymentMethod: 'Cash'
    },
    {
        id: 'req-002',
        issueType: 'Electrical Repair',
        description: 'Multiple power outlets in the living room have stopped working. I checked the breaker but everything seems fine there. Needs an electrician to inspect.',
        requesterName: 'Ahmed Hassan',
        requesterRole: 'Landlord',
        propertyLocation: 'Villa 12, Palm Hills, Giza',
        urgency: 'High',
        price: 800,
        dateRequested: 'Oct 23, 2023',
        paymentMethod: 'Visa'
    },
    {
        id: 'req-003',
        issueType: 'HVAC Maintenance',
        description: 'The air conditioning unit in the master bedroom is making a loud rattling noise and not cooling properly. It just blows warm air now.',
        requesterName: 'Nour El-Din',
        requesterRole: 'Tenant',
        propertyLocation: 'Unit 502, Maadi Degla',
        urgency: 'Medium',
        price: 'Pending Estimate',
        dateRequested: 'Oct 21, 2023',
        paymentMethod: 'Instapay'
    },
    {
        id: 'req-004',
        issueType: 'Carpentry/Door Repair',
        description: 'The front door lock is sticking and it is very difficult to turn the key. Sometimes it takes several minutes to lock or unlock the door.',
        requesterName: 'Mona Zaki',
        requesterRole: 'Landlord',
        propertyLocation: 'Building 5, Zamalek',
        urgency: 'Medium',
        price: 450,
        dateRequested: 'Oct 20, 2023',
        paymentMethod: 'Vodafone cash'
    },
    {
        id: 'req-005',
        issueType: 'Appliance Repair',
        description: 'The built-in oven is not heating up. The display turns on, but the heating element seems to be broken. Need it fixed before the weekend.',
        requesterName: 'Omar Tarek',
        requesterRole: 'Tenant',
        propertyLocation: 'Apt 12C, New Cairo',
        urgency: 'Low',
        price: 1200,
        dateRequested: 'Oct 19, 2023',
        paymentMethod: 'Cash'
    },
    {
        id: 'req-006',
        issueType: 'Water Heater Replacement',
        description: 'There is no hot water in the apartment. The electric water heater is completely unresponsive and seems to be leaking slightly from the bottom.',
        requesterName: 'Laila Mahmoud',
        requesterRole: 'Tenant',
        propertyLocation: 'Apt 8A, Heliopolis',
        urgency: 'High',
        price: 3500,
        dateRequested: 'Oct 18, 2023',
        paymentMethod: 'Visa'
    }
];

const JobRequests: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Toggle this to false to easily view the empty state
    const hasData = true;

    const handleViewDetails = (id: string) => {
        const job = MOCK_JOB_REQUESTS.find(req => req.id === id);
        if (job) {
            // Mapping job props to match modal expected object
            setSelectedJob({
                ...job,
                datePosted: job.dateRequested,
                deadline: '48 hours' // Mock deadline
            });
            setIsModalOpen(true);
        }
    };

    const handleAcceptJob = (id: string, scheduleTime: string) => {
        console.log(`Job ${id} accepted and scheduled for ${scheduleTime}`);
        // Logic to update job status would go here
    };

    const handleIgnoreJob = (id: string) => {
        console.log(`Job ${id} ignored`);
        setIsModalOpen(false);
    };

    const data = hasData ? MOCK_JOB_REQUESTS : [];

    const filteredRequests = filter === 'All'
        ? data
        : data.filter(req => req.urgency === filter);

    return (
        <div className="maintenance-job-requests-page">
            <Header />

            <div className="maintenance-layout">
                <MaintenanceSideBar />

                <main className="job-requests-content">
                    <div className="job-requests-header">
                        <div>
                            <h1 className="page-title">Job Requests</h1>
                            <p className="page-subtitle">Manage and respond to maintenance requests from landlords and tenants.</p>
                        </div>

                        <div className="job-requests-actions">
                            <div className="filter-group">
                                <span className="filter-label">Filter by Urgency:</span>
                                <div className="filter-buttons">
                                    {['All', 'Critical', 'High', 'Medium', 'Low'].map(f => (
                                        <button
                                            key={f}
                                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                                            onClick={() => setFilter(f)}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="job-requests-summary">
                        <div className="summary-card">
                            <div className="summary-value">{data.length}</div>
                            <div className="summary-label">Total Requests</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value critical">{data.filter(r => r.urgency === 'Critical').length}</div>
                            <div className="summary-label">Critical</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value high">{data.filter(r => r.urgency === 'High').length}</div>
                            <div className="summary-label">High Priority</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value active">{hasData ? 4 : 0}</div>
                            <div className="summary-label">Active Jobs</div>
                        </div>
                    </div>

                    <div className="job-requests-grid">
                        {hasData && filteredRequests.length > 0 ? (
                            filteredRequests.map(request => (
                                <JobRequestCard
                                    key={request.id}
                                    {...request}
                                    onViewDetails={handleViewDetails}
                                />
                            ))
                        ) : (
                            <div className="no-requests-found">
                                <div className="empty-state-icon">📋</div>
                                <h3>No requests found</h3>
                                <p>There are no job requests matching the selected filter.</p>
                                <button className="btn-clear-filter" onClick={() => setFilter('All')}>
                                    View Available Jobs
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <DetailedMaintenanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                request={selectedJob}
                onAccept={handleAcceptJob}
                onIgnore={handleIgnoreJob}
            />

            <Footer />
        </div>
    );
};

export default JobRequests;

