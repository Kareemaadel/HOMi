import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaChartLine, FaArrowRight } from 'react-icons/fa';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import PropertyCard from '../../BrowseProperties/components/PropertyCard';
import PropertyDetailModal from '../../BrowseProperties/components/PropertyDetailedModal';

import './SavedProperties.css';

const MOCK_SAVED_ITEMS = [
    { id: 1, title: "Modern Skyline Loft", address: "124 Bluebell Ave, Manhattan, NY", price: 3500, beds: 2, baths: 2, sqft: 1200, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800", tags: ["Luxury", "City View"], rating: 4.9 },
    { id: 2, title: "Greenwich Village Studio", address: "45 Perry St, New York, NY", price: 2800, beds: 1, baths: 1, sqft: 750, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800", tags: ["Classic", "Quiet"], rating: 4.7 },
    { id: 3, title: "Highland Penthouse", address: "888 Skyline Dr, Los Angeles, CA", price: 5200, beds: 3, baths: 3, sqft: 2100, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800", tags: ["Premium", "Panoramic"], rating: 5.0 },
    { id: 4, title: "Industrial Soho Flat", address: "12 Mercer St, New York, NY", price: 4100, beds: 2, baths: 1, sqft: 1100, image: "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&w=800", tags: ["Industrial", "Trendy"], rating: 4.8 },
];

const SavedProperties: React.FC = () => {
    const navigate = useNavigate();
    const [savedItems, setSavedItems] = useState(MOCK_SAVED_ITEMS);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const stats = useMemo(() => {
        if (savedItems.length === 0) return { total: 0, avg: 0, min: 0, max: 0 };
        const prices = savedItems.map(i => i.price);
        const total = prices.reduce((a, b) => a + b, 0);
        return {
            total,
            avg: total / savedItems.length,
            min: Math.min(...prices),
            max: Math.max(...prices),
        };
    }, [savedItems]);

    const handleOpenDetails = (property: any) => {
        setSelectedProperty(property);
        setIsModalOpen(true);
    };

    const handleClearAll = () => {
        setSavedItems([]);
        setShowClearConfirm(false);
    };

    return (
        <div className="sp-root">
            <Sidebar />

            <div className="sp-main">
                <Header />

                <div className="sp-page">

                    {/* ── HERO BANNER ── */}
                    <div className="sp-hero">
                        <div className="sp-hero-noise" />
                        <div className="sp-hero-glow sp-hero-glow--a" />
                        <div className="sp-hero-glow sp-hero-glow--b" />

                        <div className="sp-hero-inner">
                            <p className="sp-eyebrow">Your Collection</p>
                            <h1 className="sp-hero-title">
                                Saved<br />
                                <em>Properties</em>
                            </h1>
                            <p className="sp-hero-sub">
                                Curated listings you've marked for later — compare, explore, and apply.
                            </p>
                        </div>

                        {savedItems.length > 0 && (
                            <div className="sp-stats-row">
                                <div className="sp-stat">
                                    <span className="sp-stat-val">{savedItems.length}</span>
                                    <span className="sp-stat-lbl">Saved</span>
                                </div>
                                <div className="sp-stat-divider" />
                                <div className="sp-stat">
                                    <span className="sp-stat-val">${stats.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    <span className="sp-stat-lbl">Avg / mo</span>
                                </div>
                                <div className="sp-stat-divider" />
                                <div className="sp-stat">
                                    <span className="sp-stat-val">${stats.min.toLocaleString()}</span>
                                    <span className="sp-stat-lbl">Lowest</span>
                                </div>
                                <div className="sp-stat-divider" />
                                <div className="sp-stat">
                                    <span className="sp-stat-val">${stats.max.toLocaleString()}</span>
                                    <span className="sp-stat-lbl">Highest</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── CONTENT ── */}
                    <div className="sp-content">

                        {savedItems.length > 0 && (
                            <>
                                {/* Toolbar */}
                                <div className="sp-toolbar">
                                    <div className="sp-insight">
                                        <span className="sp-insight-icon"><FaChartLine /></span>
                                        <span className="sp-insight-text">
                                            <strong>Market Pulse:</strong> Properties in your list are seeing 30% higher engagement this week.
                                        </span>
                                        <button className="sp-insight-cta">
                                            Compare <FaArrowRight />
                                        </button>
                                    </div>

                                    <div className="sp-toolbar-actions">
                                        {showClearConfirm ? (
                                            <div className="sp-confirm">
                                                <span>Remove all?</span>
                                                <button className="sp-confirm-yes" onClick={handleClearAll}>Yes, clear</button>
                                                <button className="sp-confirm-no" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <button
                                                className="sp-clear-btn"
                                                onClick={() => setShowClearConfirm(true)}
                                                title="Clear All"
                                            >
                                                <FaTrashAlt />
                                                <span>Clear All</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Grid */}
                                <div className="sp-grid">
                                    {savedItems.map((item, i) => (
                                        <div
                                            className="sp-card-wrapper"
                                            key={item.id}
                                            style={{ animationDelay: `${i * 80}ms` }}
                                        >
                                            <PropertyCard
                                                property={item}
                                                onOpenDetails={() => handleOpenDetails(item)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Empty State */}
                        {savedItems.length === 0 && (
                            <div className="sp-empty">
                                <div className="sp-empty-ring sp-empty-ring--outer" />
                                <div className="sp-empty-ring sp-empty-ring--inner" />
                                <video
                                    className="sp-empty-video"
                                    src="/HOMI_Boy.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                                <h2 className="sp-empty-title">Nothing saved yet</h2>
                                <p className="sp-empty-sub">
                                    Start browsing and heart the listings you love — they'll appear right here.
                                </p>
                                <button
                                    className="sp-browse-btn"
                                    onClick={() => navigate('/browse-properties')}
                                >
                                    Browse Properties <FaArrowRight />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <Footer />
            </div>

            {isModalOpen && selectedProperty && (
                <PropertyDetailModal
                    property={selectedProperty}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default SavedProperties;