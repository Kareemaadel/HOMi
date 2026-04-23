import React, { useState } from 'react';
import Header from '../../../../../components/global/header';
import Footer from '../../../../../components/global/footer';
import MaintenanceSideBar from '../../SideBar/MaintenanceSideBar';
import AvailableJobCard from '../components/AvailableJobCard';
import AvailableJobModal from '../components/AvailableJobModal';
import './AvailableJobs.css';
import {
    FaSearch, FaFilter, FaCompass, FaMapMarkerAlt,
    FaChartLine, FaGripHorizontal, FaList, FaBolt, FaBriefcase
} from 'react-icons/fa';

const MOCK_AVAILABLE_JOBS = [
    {
        id: 'pub-201',
        issueType: 'Interior Painting',
        description: 'Living room and hallway need repainting. Approximately 45sqm total. Color: Off-white. Requires surface preparation and 2 coats.',
        requesterName: 'Yasmine Khalil',
        propertyLocation: 'Zamalek, Cairo',
        price: 1500,
        datePublished: '30 mins ago',
        urgency: 'Medium' as const,
        paymentMethod: 'Cash'
    },
    {
        id: 'pub-202',
        issueType: 'Water Heater',
        description: 'Gas water heater is not igniting. Model: Ariston 10L. Needs immediate inspection of the thermocouple and burner.',
        requesterName: 'Kareem Adel',
        propertyLocation: 'Sheikh Zayed, Giza',
        price: 450,
        datePublished: '1 hour ago',
        urgency: 'High' as const,
        paymentMethod: 'Instapay'
    },
    {
        id: 'pub-203',
        issueType: 'Garden Care',
        description: 'Full pruning and lawn mowing for a medium-sized villa garden. Debris removal and weed treatment required.',
        requesterName: 'Noura Mansour',
        propertyLocation: 'New Cairo, Egypt',
        price: 2200,
        datePublished: '3 hours ago',
        urgency: 'Low' as const,
        paymentMethod: 'Visa'
    },
    {
        id: 'pub-204',
        issueType: 'Electrical',
        description: 'Main distribution board making clicking noises. Several outlets in the kitchen have no power. Dangerous sparking noted.',
        requesterName: 'Tarek Ibrahim',
        propertyLocation: 'Heliopolis, Cairo',
        price: 1800,
        datePublished: '5 hours ago',
        urgency: 'Critical' as const,
        paymentMethod: 'Vodafone cash'
    },
    {
        id: 'pub-205',
        issueType: 'AC Service',
        description: 'Installation of 2 new 2.25HP split units. Copper piping is already pre-installed. Units are on site.',
        requesterName: 'Laila Hassan',
        propertyLocation: 'Madinaty',
        price: 3200,
        datePublished: 'Yesterday',
        urgency: 'Medium' as const,
        paymentMethod: 'Cash'
    }
,
    {
        id: 'pub-206',
        issueType: 'Flooring',
        description: 'Wooden floor panels in the bedroom are warping. Requires removal and new panel installation. Area: 12sqm.',
        requesterName: 'Omar Reda',
        propertyLocation: '6th of October City',
        price: 4500,
        datePublished: 'Yesterday',
        urgency: 'High' as const
    }
];

const AvailableJobs: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredJobs = MOCK_AVAILABLE_JOBS.filter(job => {
        const matchesSearch = job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.issueType.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = category === 'All' || job.issueType.includes(category);
        return matchesSearch && matchesCategory;
    });

    const handleOpenModal = (id: string) => {
        const job = MOCK_AVAILABLE_JOBS.find(j => j.id === id);
        if (job) {
            setSelectedJob(job);
            setIsModalOpen(true);
        }
    };

    const handleConfirmApply = (id: string) => {
        console.log(`Application for ${id} submitted successfully.`);
        // Note: Modal state is handled internally to show the success message
    };

    return (
        <div className="marketplace-layout">
            <MaintenanceSideBar />

            <div className="marketplace-content">
                <Header />

                <main className="marketplace-main">
                    <header className="marketplace-header">
                        <div className="header-top">
                            <div className="title-group">
                                <div className="live-tag">
                                    <span className="pulse-dot"></span>
                                    LIVE MARKETPLACE
                                </div>
                                <h1>Find Your Next Job</h1>
                                <p>Discover high-paying maintenance opportunities posted by the HOMi community.</p>
                            </div>

                            <div className="quick-stats-row">
                                <div className="stat-pill">
                                    <FaBriefcase className="pill-icon" />
                                    <span><strong>{MOCK_AVAILABLE_JOBS.length}</strong> Open Jobs</span>
                                </div>
                                <div className="stat-pill accent">
                                    <FaBolt className="pill-icon" />
                                    <span><strong>EGP 13.6k</strong> Value</span>
                                </div>
                            </div>
                        </div>

                        <div className="search-bar-premium">
                            <div className="search-input-group">
                                <input
                                    type="text"
                                    placeholder="Search by specialty, location, or keyword..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="divider-vertical" />

                            <div className="filter-controls">
                                <div className="filter-dropdown">
                                    <FaFilter className="filter-icon" />
                                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option value="All">All Categories</option>
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Painting">Painting</option>
                                        <option value="AC Service">AC Service</option>
                                    </select>
                                </div>

                                <div className="view-toggle">
                                    <button
                                        className={viewMode === 'grid' ? 'active' : ''}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <FaGripHorizontal />
                                    </button>
                                    <button
                                        className={viewMode === 'list' ? 'active' : ''}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <FaList />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="jobs-container-modern">
                        <div className={`jobs-display-wrapper ${viewMode}`}>
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map(job => (
                                    <AvailableJobCard
                                        key={job.id}
                                        {...job}
                                        onApply={handleOpenModal}
                                        onViewDetails={handleOpenModal}
                                    />
                                ))
                            ) : (
                                <div className="empty-market-state">
                                    <div className="empty-graphic">
                                        <FaCompass className="compass-icon" />
                                    </div>
                                    <h2>No matching jobs found</h2>
                                    <p>Try broadening your search or switching categories to find more results.</p>
                                    <button className="clear-filters-btn" onClick={() => { setSearchQuery(''); setCategory('All'); }}>
                                        Clear Search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <AvailableJobModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    job={selectedJob}
                    onConfirmApply={handleConfirmApply}
                />

                <Footer />
            </div>
        </div>
    );
};


export default AvailableJobs;
