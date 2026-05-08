import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Search, ArrowRight, ArrowLeft } from 'lucide-react';
import PropCard from '../components/PropCard';
import { propertyService } from '../../../services/property.service';
import { 
    mapPropertyToUI 
} from '../../../utils/propertyMapping';
import type { PropertyUI as Property } from '../../../utils/propertyMapping';
import PropertyDetailedModal from '../../BrowseProperties/components/PropertyDetailedModal';
import AuthModal from '../../../components/global/AuthModal';
import Footer from '../../../components/global/footer';
import './GuestSearch.css';


const GuestSearch: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const getHelpFromGuest = {
        pathname: '/get-help',
        state: { fromGuestHome: true },
    };

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await propertyService.getAllProperties({
                    status: 'AVAILABLE',
                    page: 1,
                    limit: 30
                });
                setProperties(response.data.map(mapPropertyToUI));
            } catch (err) {
                console.error('Failed to fetch properties for GuestSearch:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    // Grouping logic for live data
    const popularProperties = properties.slice(0, 4);
    const recommendedProperties = properties.slice(4, 8);
    const newListings = properties.slice(8, 12);

    return (
        <div className="search-layout">
            <nav className="search-nav glass-panel-nav">
                <div className="nav-container">
                    <div className="header-left-group">
                        <Link to="/guest-home" className="back-home-link">
                            <ArrowLeft size={18} />
                            <span className="desktop-only">{t('guestHome.backToHome')}</span>
                        </Link>
                        <Link to="/guest-home" className="brand-logo-guest">
                            <img src="/logo.png" alt="HOMi Logo" className="logo-image-guest" />
                        </Link>
                    </div>

                    <div className="search-nav-bar desktop-only">
                        <input type="text" placeholder={t('guestHome.searchPlaceholder')} />
                        <div className="search-nav-divider"></div>
                        <button className="filter-btn"><SlidersHorizontal size={18} /> {t('guestHome.filters')}</button>
                        <button className="search-btn"><Search size={18} /></button>
                    </div>

                    <div className="nav-actions desktop-only">
                        <button className="btn-text" onClick={() => navigate('/auth')}>{t('guestHome.login')}</button>
                        <button className="btn-primary-pill shadow-hover" onClick={() => navigate('/auth')}>{t('guestHome.signup')}</button>
                    </div>

                    <div className="mobile-header-center mobile-only">
                        <div className="mobile-search-pill">
                            <Search size={16} className="text-blue" />
                            <span>{t('guestHome.search')}...</span>
                        </div>
                    </div>

                    <div className="mobile-nav-actions mobile-only">
                        <button className="mobile-icon-btn"><SlidersHorizontal size={20} /></button>
                    </div>
                </div>
            </nav>

            <main className="guest-search-main-content">
                <div className="search-container">
                    {loading ? (
                        <div className="search-loading">
                            <div className="loading-spinner"></div>
                            <p>Finding the perfect homes for you...</p>
                        </div>
                    ) : (
                        <>
                            {/* Group 1 */}
                            <section className="property-scroll-section">
                                <div className="section-header">
                                    <div className="title-area">
                                        <h2>{t('guestHome.highestRated')}</h2>
                                    </div>
                                    <button className="view-all-btn">
                                        {t('guestHome.viewAll', { count: popularProperties.length })} <ArrowRight size={18} />
                                    </button>
                                </div>
                                <div className="properties-scroller">
                                    {popularProperties.map(property => (
                                        <PropCard
                                            key={property.id}
                                            property={property}
                                            onOpenDetails={() => setSelectedProperty(property)}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* Group 2 */}
                            <section className="property-scroll-section">
                                <div className="section-header">
                                    <div className="title-area">
                                        <h2>{t('guestHome.lifestyleSuits')}</h2>
                                    </div>
                                    <button className="view-all-btn">
                                        {t('guestHome.viewAll', { count: recommendedProperties.length })} <ArrowRight size={18} />
                                    </button>
                                </div>
                                <div className="properties-scroller">
                                    {recommendedProperties.map(property => (
                                        <PropCard
                                            key={property.id}
                                            property={property}
                                            onOpenDetails={() => setSelectedProperty(property)}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* Group 3 */}
                            <section className="property-scroll-section">
                                <div className="section-header">
                                    <div className="title-area">
                                        <h2>{t('guestHome.newlyListed')}</h2>
                                    </div>
                                    <button className="view-all-btn">
                                        {t('guestHome.viewAll', { count: newListings.length })} <ArrowRight size={18} />
                                    </button>
                                </div>
                                <div className="properties-scroller">
                                    {newListings.map(property => (
                                        <PropCard
                                            key={property.id}
                                            property={property}
                                            onOpenDetails={() => setSelectedProperty(property)}
                                        />
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </main>

            <Footer />

            {/* Bottom Navigation for Mobile */}


            {selectedProperty && (
                <PropertyDetailedModal
                    property={selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    isGuest={true}
                />
            )}

            {/* Reusable Auth Modal for Guests */}
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </div>
    );
};

export default GuestSearch;