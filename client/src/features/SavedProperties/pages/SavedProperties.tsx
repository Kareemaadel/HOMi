import React, { useState, useMemo } from 'react';
import { FaTrashAlt, FaChartLine, FaArrowRight } from 'react-icons/fa';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import PropertyCard from '../../BrowseProperties/components/PropertyCard';
import PropertyDetailModal from '../../BrowseProperties/components/PropertyDetailedModal';

import './SavedProperties.css';

const SavedProperties: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);

    // Mock Data
    const savedItems = [
        { id: 1, title: "Modern Skyline Loft", address: "124 Bluebell Ave, Manhattan, NY", price: 3500, beds: 2, baths: 2, sqft: 1200, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800", tags: ["Luxury", "City View"], rating: 4.9 },
        { id: 2, title: "Greenwich Village Studio", address: "45 Perry St, New York, NY", price: 2800, beds: 1, baths: 1, sqft: 750, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800", tags: ["Classic", "Quiet"], rating: 4.7 },
        { id: 3, title: "Highland Penthouse", address: "888 Skyline Dr, Los Angeles, CA", price: 5200, beds: 3, baths: 3, sqft: 2100, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800", tags: ["Premium", "Panoramic"], rating: 5.0 },
        { id: 4, title: "Industrial Soho Flat", address: "12 Mercer St, New York, NY", price: 4100, beds: 2, baths: 1, sqft: 1100, image: "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&w=800", tags: ["Industrial", "Trendy"], rating: 4.8 },
        { id: 5, title: "Cozy Brooklyn Studio", address: "777 Park Ave, Brooklyn, NY", price: 3200, beds: 1, baths: 1, sqft: 800, image: "https://images.unsplash.com/photo-1522708323520-d240b3fee1e4?auto=format&fit=crop&w=800", tags: ["Cozy", "Urban"], rating: 4.6 },
        { id: 6, title: "Downtown Loft", address: "333 Broadway, New York, NY", price: 3800, beds: 2, baths: 2, sqft: 1400, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800", tags: ["Modern", "Downtown"], rating: 4.9 },
        { id: 7, title: "Highland Penthouse", address: "888 Skyline Dr, Los Angeles, CA", price: 5200, beds: 3, baths: 3, sqft: 2100, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800", tags: ["Premium", "Panoramic"], rating: 5.0 },



    ];

    // Business Logic: Stats Calculation
    const stats = useMemo(() => {
        const total = savedItems.reduce((acc, curr) => acc + curr.price, 0);
        const avg = total / (savedItems.length || 1);
        return { total, avg };
    }, [savedItems]);

    const handleOpenModal = (property: any) => {
        setSelectedProperty(property);
        setIsModalOpen(true);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-wrapper">
                <Header />
                <main className="saved-content">
                    <div className="bg-blob shadow-blue"></div>
                    
                    {/* 1. Enhanced Business Header */}
                    <header className="saved-header-section">
                        
                    <div className="market-insight-alert">
                        <div className="insight-icon"><FaChartLine /></div>
                        <div className="insight-text">
                            <strong>Market Insight:</strong> 3 of your saved properties have high demand. We recommend applying within 48 hours.
                        </div>
                        <button className="insight-cta">Compare All <FaArrowRight /></button>
                    </div>
                        <div className="header-stats-bar">
                            <div className="stat-item">
                                <span className="stat-label">Avg. Rent</span>
                                <span className="stat-value">${stats.avg.toLocaleString()}</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-label">Inventory</span>
                                <span className="stat-value">{savedItems.length} Units</span>
                            </div>
                            <button className="btn-clear-all" title="Clear Wishlist">
                                <FaTrashAlt />
                            </button>
                        </div>
                    </header>

                    {/* 2. Insight Alert (Business Urgency) */}


                    <div className="properties-grid-wrapper">
                        {savedItems.length > 0 ? (
                            <div className="saved-properties-grid">
                                {savedItems.map(item => (
                                    <PropertyCard 
                                        key={item.id} 
                                        property={item} 
                                        onOpenDetails={() => handleOpenModal(item)} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-saved-state">
                                <div className="empty-icon">📂</div>
                                <h3>No saved properties yet</h3>
                                <p>Start browsing to build your dream list!</p>
                                <button className="btn-browse">Browse Properties</button>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />

                {isModalOpen && selectedProperty && (
                    <PropertyDetailModal 
                        property={selectedProperty} 
                        isOpen={isModalOpen} 
                        onClose={() => setIsModalOpen(false)} 
                    />
                )}
            </div>
        </div>
    );
};

export default SavedProperties;