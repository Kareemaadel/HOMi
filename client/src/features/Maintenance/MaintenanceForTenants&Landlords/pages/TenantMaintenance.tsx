import React, { useState } from 'react';
import Header from '../../../../components/global/header';
import Footer from '../../../../components/global/footer';
import Sidebar from '../../../../components/global/Tenant/sidebar';
import ProviderCard from '../components/ProviderCard';
import './TenantMaintenance.css';
import { 
    FaPlus, FaSearch, FaFilter, FaTools, FaCalendarCheck, 
    FaHistory, FaMapMarkerAlt, FaHammer, FaWrench, FaBolt, 
    FaPaintRoller, FaCheckCircle, FaClock, FaTimesCircle,
    FaExclamationTriangle, FaChevronRight, FaStar
} from 'react-icons/fa';

// Mock Data
const MOCK_PROVIDERS = [
    {
        id: 'p1',
        name: 'Ahmed Plumbing Solutions',
        specialty: 'Plumbing & Drainage',
        rating: 4.8,
        reviewCount: 124,
        location: 'Maadi, Cairo',
        priceRange: 'EGP 200',
        imageUrl: 'https://images.unsplash.com/photo-1581578731522-745d4b45a0e7?q=80&w=400&auto=format&fit=crop',
        isVerified: true,
        completedJobs: 450
    },
    {
        id: 'p2',
        name: 'SafeWire Electrical',
        specialty: 'Electrical Systems',
        rating: 4.9,
        reviewCount: 89,
        location: 'New Cairo',
        priceRange: 'EGP 350',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop',
        isVerified: true,
        completedJobs: 230
    },
    {
        id: 'p3',
        name: 'Modern Interiors Painting',
        specialty: 'Painting & Decor',
        rating: 4.7,
        reviewCount: 156,
        location: 'Zamalek, Cairo',
        priceRange: 'EGP 150',
        imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400&auto=format&fit=crop',
        isVerified: false,
        completedJobs: 820
    },
    {
        id: 'p4',
        name: 'CoolBreeze AC Service',
        specialty: 'HVAC Maintenance',
        rating: 4.6,
        reviewCount: 67,
        location: 'Sheikh Zayed',
        priceRange: 'EGP 400',
        imageUrl: 'https://images.unsplash.com/photo-1599708144666-47b2c9c8172b?q=80&w=400&auto=format&fit=crop',
        isVerified: true,
        completedJobs: 180
    }
];

const MOCK_MY_REQUESTS = [
    {
        id: 'req-1',
        issueType: 'Water Leak',
        description: 'Kitchen sink is leaking significantly from the main valve.',
        status: 'Scheduled',
        providerName: 'Ahmed Plumbing Solutions',
        date: 'Oct 25, 2023',
        price: 300,
        urgency: 'High'
    },
    {
        id: 'req-2',
        issueType: 'AC Maintenance',
        description: 'Annual cleaning for 2 units in the living room.',
        status: 'In Progress',
        providerName: 'CoolBreeze AC Service',
        date: 'Oct 23, 2023',
        price: 800,
        urgency: 'Medium'
    },
    {
        id: 'req-3',
        issueType: 'Light Fixture',
        description: 'Bedroom chandelier needs installation.',
        status: 'Completed',
        providerName: 'SafeWire Electrical',
        date: 'Oct 15, 2023',
        price: 450,
        urgency: 'Low'
    }
];

const MOCK_MARKETPLACE_POSTS = [
    {
        id: 'post-1',
        issueType: 'Gardening',
        description: 'Need lawn mowing and tree trimming for my backyard.',
        applications: 5,
        postedDate: '2 days ago',
        status: 'Live',
        budget: 'EGP 500-800'
    }
];

const TenantMaintenance: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'post' | 'browse' | 'active'>('post');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const handleViewProfile = (id: string) => {
        console.log('Viewing profile:', id);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'post':
                return (
                    <div className="tab-pane animate-in">
                        <div className="section-header">
                            <div>
                                <h2>Community Marketplace</h2>
                                <p>Post your issue to the HOMi community and get bids from certified pros.</p>
                            </div>
                            <button className="post-issue-btn">
                                <FaPlus /> Post New Issue
                            </button>
                        </div>

                        <div className="marketplace-grid">
                            {MOCK_MARKETPLACE_POSTS.map(post => (
                                <div key={post.id} className="post-card-premium">
                                    <div className="post-card-badge">{post.status}</div>
                                    <div className="post-card-content">
                                        <div className="post-card-type">
                                            <FaHammer className="type-icon" />
                                            {post.issueType}
                                        </div>
                                        <p className="post-description">{post.description}</p>
                                        <div className="post-meta">
                                            <div className="meta-item">
                                                <FaClock /> {post.postedDate}
                                            </div>
                                            <div className="meta-item">
                                                <FaBolt /> {post.applications} Applications
                                            </div>
                                        </div>
                                    </div>
                                    <div className="post-card-footer">
                                        <div className="budget-info">
                                            <span>Budget:</span>
                                            <strong>{post.budget}</strong>
                                        </div>
                                        <button className="view-bids-btn">View Bids</button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="add-post-placeholder">
                                <div className="placeholder-content">
                                    <div className="plus-icon-box">
                                        <FaPlus />
                                    </div>
                                    <h3>Need something else?</h3>
                                    <p>Post a new maintenance request to get help fast.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'browse':
                return (
                    <div className="tab-pane animate-in">
                        <div className="browse-controls">
                            <div className="search-box-premium">
                                <FaSearch className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Search by name, skill, or location..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="filter-dropdown-premium">
                                <FaFilter className="filter-icon" />
                                <select 
                                    value={filterCategory} 
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="All">All Categories</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Painting">Painting</option>
                                    <option value="HVAC">HVAC</option>
                                </select>
                            </div>
                        </div>

                        <div className="providers-grid">
                            {MOCK_PROVIDERS
                                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                           p.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(provider => (
                                    <ProviderCard 
                                        key={provider.id} 
                                        {...provider} 
                                        onViewProfile={handleViewProfile} 
                                    />
                                ))
                            }
                        </div>
                    </div>
                );
            case 'active':
                return (
                    <div className="tab-pane animate-in">
                        <div className="section-header">
                            <div>
                                <h2>Track Maintenance</h2>
                                <p>Monitor the progress of your scheduled and active maintenance jobs.</p>
                            </div>
                        </div>

                        <div className="active-requests-list">
                            {MOCK_MY_REQUESTS.map(req => (
                                <div key={req.id} className="active-request-row">
                                    <div className={`status-indicator ${req.status.toLowerCase().replace(' ', '-')}`}>
                                        {req.status === 'Scheduled' && <FaCalendarCheck />}
                                        {req.status === 'In Progress' && <FaClock />}
                                        {req.status === 'Completed' && <FaCheckCircle />}
                                    </div>
                                    
                                    <div className="req-main-info">
                                        <h4>{req.issueType}</h4>
                                        <p>{req.description}</p>
                                    </div>
                                    
                                    <div className="req-provider">
                                        <span className="label">Provider</span>
                                        <span className="value">{req.providerName}</span>
                                    </div>
                                    
                                    <div className="req-date">
                                        <span className="label">Date</span>
                                        <span className="value">{req.date}</span>
                                    </div>
                                    
                                    <div className="req-status-badge">
                                        <span className={`badge ${req.status.toLowerCase().replace(' ', '-')}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    
                                    <button className="req-details-btn">
                                        <FaChevronRight />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="tenant-maintenance-layout">
            <Sidebar />
            <div className="tenant-maintenance-content">
                <Header />
                
                <main className="maintenance-main-container">
                    <header className="maintenance-hero">
                        <div className="hero-text">
                            <span className="pre-title">Home Care & Support</span>
                            <h1>Maintenance Hub</h1>
                            <p>Everything you need to keep your home in perfect condition.</p>
                        </div>
                        
                        <div className="maintenance-quick-stats">
                            <div className="mini-stat">
                                <span className="stat-num">{MOCK_MY_REQUESTS.filter(r => r.status !== 'Completed').length}</span>
                                <span className="stat-desc">Pending Issues</span>
                            </div>
                            <div className="mini-stat accent">
                                <span className="stat-num">{MOCK_PROVIDERS.length}</span>
                                <span className="stat-desc">Nearby Pros</span>
                            </div>
                        </div>
                    </header>

                    <nav className="maintenance-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'post' ? 'active' : ''}`}
                            onClick={() => setActiveTab('post')}
                        >
                            <FaPlus className="tab-icon" />
                            <span>Post an Issue</span>
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
                            onClick={() => setActiveTab('browse')}
                        >
                            <FaSearch className="tab-icon" />
                            <span>Browse Providers</span>
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                        >
                            <FaTools className="tab-icon" />
                            <span>Active Requests</span>
                        </button>
                    </nav>

                    <div className="tab-content-wrapper">
                        {renderTabContent()}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default TenantMaintenance;
