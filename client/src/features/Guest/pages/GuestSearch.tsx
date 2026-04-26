import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, SlidersHorizontal, Search, ArrowRight } from 'lucide-react';
import PropCard, { type Property } from '../components/PropCard';
import PropertyDetailedModal, {
    type PropertyDetailModalProperty,
} from '../../BrowseProperties/components/PropertyDetailedModal';
import './GuestSearch.css';

const mapGuestPropertyToModal = (p: Property): PropertyDetailModalProperty => ({
    id: p.id,
    title: p.title,
    address: p.address ?? p.location,
    price: p.price,
    securityDeposit: 0,
    image: p.image,
    allImages: [p.image],
    beds: p.beds,
    baths: p.baths,
    sqft: p.sqft,
    ownerName: 'Host',
    ownerImage: p.hostImg,
    ownerVerified: false,
    locationLat: null,
    locationLng: null,
    availabilityDateISO: null,
    listedAtISO: new Date().toISOString(),
    maintenanceResponsibilities: [],
    petsAllowed: Boolean(p.tags?.some((t) => t.toLowerCase().includes('pet'))),
    targetTenant: 'Any Tenant',
    furnishing: 'Unfurnished',
    availableDate: 'Not specified',
    description: '',
    tags: p.tags ?? [],
    rating: p.rating,
});

const GuestSearch: React.FC = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    // Group 1: Popular in Sheikh Zayed
    const popularProperties: Property[] = [
        { id: 1, title: i18n.language === 'ar' ? 'جناح أزور هورايزون' : "Azure Horizon Suite", address: "452 Ocean Drive, Miami, FL", price: 3200, beds: 3, baths: 2, sqft: 1250, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.apartment')], rating: 4.8 },
        { id: 2, title: i18n.language === 'ar' ? 'لوفت حضري - ذا فاوندري' : "Urban Loft - The Foundry", address: "12 Industrial Way, Brooklyn, NY", price: 2850, beds: 1, baths: 1, sqft: 850, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.apartment')], rating: 4.5 },
        { id: 3, title: i18n.language === 'ar' ? 'شقة حديقة عصرية' : "Modern Garden Apartment", address: "789 Green Lane, Austin, TX", price: 2450, beds: 2, baths: 2, sqft: 950, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.apartment')], rating: 4.6 },
        { id: 4, title: i18n.language === 'ar' ? 'بنتهاوس فاخر في وسط المدينة' : "Downtown Luxury Penthouse", address: "567 High Street, Los Angeles, CA", price: 4500, beds: 4, baths: 3, sqft: 2100, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.villa')], rating: 4.9 },
    ];

    // Group 2: Suits Your Lifestyle
    const recommendedProperties: Property[] = [
        { id: 9, title: i18n.language === 'ar' ? 'استوديو سكن طلاب' : "Student Studio Hub", address: "University District, Denver, CO", price: 1200, beds: 1, baths: 1, sqft: 450, image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.studio')], rating: 4.2 },
        { id: 10, title: i18n.language === 'ar' ? 'شقة ميكرو للمحترفين' : "Professional Micro-Flat", address: "Finance Center, NY", price: 2100, beds: 0, baths: 1, sqft: 550, image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.studio')], rating: 4.4 },
        { id: 11, title: i18n.language === 'ar' ? 'شقة تراس عصرية' : "Modern Terrace Apt", address: "Hill Top, Portland, OR", price: 2600, beds: 2, baths: 2, sqft: 1050, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.apartment')], rating: 4.6 },
        { id: 12, title: i18n.language === 'ar' ? 'مساحة استوديو فنان' : "Artist Studio Space", address: "Arts District, Berlin", price: 1500, beds: 1, baths: 1, sqft: 700, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.studio')], rating: 4.5 },
    ];

    // Group 3: Newly Listed
    const newListings: Property[] = [
        { id: 17, title: i18n.language === 'ar' ? 'استوديو إطلالة أفقية' : "Skyline View Studio", address: "North Zayed, Giza", price: 2200, beds: 1, baths: 1, sqft: 750, image: "https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.studio')], rating: 4.5 },
        { id: 18, title: i18n.language === 'ar' ? 'فيلا كورتيارد' : "The Courtyard Villa", address: "Zayed Regency", price: 6800, beds: 4, baths: 4, sqft: 3500, image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.villa')], rating: 4.9 },
        { id: 19, title: i18n.language === 'ar' ? 'لوفت صناعي أنيق' : "Industrial Chic Loft", address: "Downtown Extension", price: 3400, beds: 2, baths: 2, sqft: 1300, image: "https://images.unsplash.com/photo-1536376074432-cd242423c3dd?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.apartment')], rating: 4.6 },
        { id: 20, title: i18n.language === 'ar' ? 'شقة تراس حديقة' : "Garden Terrace Flat", address: "Green Belt Zayed", price: 2700, beds: 2, baths: 2, sqft: 1100, image: "https://images.unsplash.com/photo-1493246507139-91e8bef99c1e?auto=format&fit=crop&w=800&q=80", tags: [t('guestHome.apartment')], rating: 4.7 },
    ];

    return (
        <div className="search-layout">
            <nav className="search-nav glass-panel-nav">
                <div className="nav-container">
                    <Link to="/guest-home" className="brand-logo">
                        <img src="/logo.png" alt="HOMi Logo" className="logo-image" />
                    </Link>
                    
                    <div className="search-nav-bar desktop-only">
                        <input type="text" placeholder={t('guestHome.searchPlaceholder')} />
                        <div className="search-nav-divider"></div>
                        <button className="filter-btn"><SlidersHorizontal size={18}/> {t('guestHome.filters')}</button>
                        <button className="search-btn"><Search size={18}/></button>
                    </div>

                    <div className="nav-actions desktop-only">
                        <button className="btn-text" onClick={() => navigate('/auth')}>{t('guestHome.login')}</button>
                        <button className="btn-primary-pill shadow-hover" onClick={() => navigate('/auth')}>{t('guestHome.signup')}</button>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={28}/> : <Menu size={28}/>}
                    </button>
                </div>
            </nav>

            <main className="search-main-content">
                <div className="search-container">
                    
                    {/* Group 1 */}
                    <section className="property-scroll-section">
                        <div className="section-header">
                            <div className="title-area">
                                <h2>{t('guestHome.highestRated')}</h2>
                                <p>{t('guestHome.trendingProperties')}</p>
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
                                <p>{t('guestHome.lifestyleCurated')}</p>
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
                                <p>{t('guestHome.brandNewAdditions')}</p>
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

                </div>
            </main>

            {selectedProperty && (
                <PropertyDetailedModal
                    property={mapGuestPropertyToModal(selectedProperty)}
                    onClose={() => setSelectedProperty(null)}
                    isGuest={true}
                />
            )}
        </div>
    );
};

export default GuestSearch;