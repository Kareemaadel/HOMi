import React, { useState } from 'react';
import Header from '../../../../../components/global/header';
import Footer from '../../../../../components/global/footer';
import MaintenanceSideBar from '../../SideBar/MaintenanceSideBar';
import JobCard from '../components/JobCard';
import type { JobStatus } from '../components/JobCard';
import DetailedJobModal from '../components/DetailedJobModal';
import './MyJobs.css';

const MOCK_MY_JOBS = [
    {
        id: 'job-101',
        issueType: 'Plumbing Repair',
        description: 'Main kitchen pipe burst. Requires replacement of 2-meter section and pressure testing. Ensure all seals are waterproof and check for secondary leaks in the drainage system.',
        requesterName: 'Sarah Jenkins',
        requesterRole: 'Tenant' as const,
        propertyLocation: 'Apt 4B, Sunset Boulevard, Cairo',
        urgency: 'Critical' as const,
        price: 2400,
        dateRequested: 'Oct 22, 2023',
        status: 'In Progress' as JobStatus,
        finishDate: 'Oct 25, 2023 at 2:00 PM'
    },
    {
        id: 'job-102',
        issueType: 'Electrical Maintenance',
        description: 'Periodic inspection of circuit breakers and replacement of faulty switches in common areas. Test all safety groundings.',
        requesterName: 'Ahmed Hassan',
        requesterRole: 'Landlord' as const,
        propertyLocation: 'Building 12, Maadi Degla',
        urgency: 'Medium' as const,
        price: 1200,
        dateRequested: 'Oct 20, 2023',
        status: 'Scheduled' as JobStatus,
        finishDate: 'Oct 28, 2023 at 10:00 AM'
    },
    {
        id: 'job-103',
        issueType: 'AC Service',
        description: 'Full cleaning and gas refill for 3 split units. Units are making noise and cooling is inefficient. Replace filters if necessary.',
        requesterName: 'Mona Zaki',
        requesterRole: 'Landlord' as const,
        propertyLocation: 'Villa 5, Beverly Hills, Giza',
        urgency: 'High' as const,
        price: 3500,
        dateRequested: 'Oct 15, 2023',
        status: 'Completed' as JobStatus,
        finishDate: 'Oct 18, 2023'
    },
    {
        id: 'job-104',
        issueType: 'Door Lock Repair',
        description: 'Front door smart lock is not responding to codes. Needs manual bypass and electronic repair. Check battery and connectivity.',
        requesterName: 'Omar Tarek',
        requesterRole: 'Tenant' as const,
        propertyLocation: 'Unit 802, Nile Towers',
        urgency: 'High' as const,
        price: 850,
        dateRequested: 'Oct 10, 2023',
        status: 'Canceled' as JobStatus
    }
];

const MyJobs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<JobStatus | 'All'>('All');
    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Global data flag for testing empty states
    const [hasData, setHasData] = useState(true);

    const data = hasData ? MOCK_MY_JOBS : [];

    const filteredJobs = activeTab === 'All'
        ? data
        : data.filter(job => job.status === activeTab);

    const handleViewJobDetails = (id: string) => {
        const job = data.find(j => j.id === id);
        if (job) {
            setSelectedJob(job);
            setIsModalOpen(true);
        }
    };

    return (
        <div className="my-jobs-page-wrapper">
            <MaintenanceSideBar />

            <div className="my-jobs-content-area">
                <Header />

                <main className="my-jobs-main">
                    <div className="my-jobs-header">
                        <div className="header-text">
                            <h1>My Assigned Jobs</h1>
                            <p>Manage your current workload and review history</p>
                        </div>

                        <div className="jobs-summary-pills">
                            <div className="summary-pill blue">
                                <span className="pill-count">{data.filter(j => j.status === 'Scheduled').length}</span>
                                <span className="pill-label">Scheduled</span>
                            </div>
                            <div className="summary-pill yellow">
                                <span className="pill-count">{data.filter(j => j.status === 'In Progress').length}</span>
                                <span className="pill-label">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="tabs-container">
                        <div className="tabs-list">
                            {['All', 'Scheduled', 'In Progress', 'Completed', 'Canceled'].map((status) => (
                                <button
                                    key={status}
                                    className={`tab-trigger ${activeTab === status ? 'active' : ''}`}
                                    onClick={() => setActiveTab(status as any)}
                                >
                                    {status}
                                    <span className="tab-count">
                                        {status === 'All'
                                            ? data.length
                                            : data.filter(j => j.status === status).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="my-jobs-grid">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map(job => (
                                <JobCard
                                    key={job.id}
                                    {...job}
                                    onViewDetails={handleViewJobDetails}
                                />
                            ))
                        ) : (
                            <div className="empty-jobs-state">
                                <div className="empty-jobs-icon">{hasData ? '🔍' : '📁'}</div>
                                <h3>{hasData ? 'No jobs found' : 'Your job list is empty'}</h3>
                                <p>
                                    {hasData
                                        ? `You don't have any jobs in the "${activeTab}" category.`
                                        : "You haven't been assigned to any jobs yet. Check the Marketplace for available opportunities."}
                                </p>
                                {!hasData && (
                                    <button className="empty-state-action-btn" onClick={() => window.location.href = '/available-jobs'}>
                                        Browse Marketplace
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                <DetailedJobModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    job={selectedJob}
                />

                <Footer />
            </div>
        </div>
    );
};

export default MyJobs;

