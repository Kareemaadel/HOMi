// client\src\features\BrowseProperties\pages\BrowseProperties.tsx
import React, { useEffect, useMemo, useState } from 'react';
import './BrowseProperties.css';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import PropertyCard from '../components/PropertyCard';
import SearchHero from '../components/SearchHero';
import PropertyDetailModal from '../components/PropertyDetailedModal';
import { propertyService, type PropertyResponse } from '../../../services/property.service';
import savedPropertiesService from '../../../services/saved-properties.service';

interface BrowsePropertyUI {
    id: string;
    ownerId: string;
    title: string;
    address: string;
    price: number;
    beds: number;
    baths: number;
    sqft: number;
    image: string;
    allImages: string[];
    tags: string[];
    rating: number;
    securityDeposit: number;
    furnishing: string;
    targetTenant: string;
    availableDate: string;
    petsAllowed: boolean;
    description: string;
    ownerName: string;
    ownerImage: string;
    maintenanceResponsibilities: Array<{
        area: string;
        responsible_party: 'LANDLORD' | 'TENANT';
    }>;
}

const mapTargetTenant = (targetTenant: string) => {
    switch (targetTenant) {
        case 'STUDENTS':
            return 'Students';
        case 'FAMILIES':
            return 'Families';
        case 'TOURISTS':
            return 'Tourists';
        default:
            return 'Any';
    }
};

const mapFurnishingLabel = (furnishing: string | null): string => {
    if (furnishing === 'Fully') return 'Fully Furnished';
    if (furnishing === 'Semi') return 'Semi-Furnished';
    return 'Unfurnished';
};

const mapPropertyToUI = (property: PropertyResponse): BrowsePropertyUI => {
    const mainImage = property.images.find((image) => image.isMain)?.imageUrl;
    const fallbackImage = property.images[0]?.imageUrl;
    const image = mainImage || fallbackImage || 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80';
    const allImages = property.images.length > 0 ? property.images.map((img) => img.imageUrl) : [image];
    const tags = property.amenities.slice(0, 2).map((amenity) => amenity.name);
    const normalizedFurnishing = mapFurnishingLabel(property.furnishing);

    return {
        id: property.id,
        ownerId: property.landlordId,
        title: property.title,
        address: property.address,
        price: property.monthlyPrice,
        beds: property.specifications?.bedrooms ?? 0,
        baths: property.specifications?.bathrooms ?? 0,
        sqft: property.specifications?.areaSqft ?? 0,
        image,
        allImages,
        tags: tags.length > 0 ? tags : [property.type ?? 'Property', normalizedFurnishing],
        rating: 4.8,
        securityDeposit: property.securityDeposit,
        furnishing: normalizedFurnishing,
        targetTenant: mapTargetTenant(property.targetTenant),
        availableDate: property.availabilityDate ? new Date(property.availabilityDate).toLocaleDateString() : 'Not specified',
        petsAllowed: property.houseRules.some((rule) => rule.name === 'Pets Allowed'),
        description: property.description,
        ownerName: property.landlord
            ? `${property.landlord.firstName} ${property.landlord.lastName}`.trim()
            : 'Owner',
        ownerImage:
            property.landlord?.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                property.landlord
                    ? `${property.landlord.firstName} ${property.landlord.lastName}`.trim() || 'Owner'
                    : 'Owner'
            )}&background=0f172a&color=ffffff&size=128`,
        maintenanceResponsibilities: property.maintenanceResponsibilities ?? [],
    };
};

const BrowseProperties: React.FC = () => {
    const [selectedProperty, setSelectedProperty] = useState<BrowsePropertyUI | null>(null);
    const [properties, setProperties] = useState<BrowsePropertyUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [viewingAll, setViewingAll] = useState<string | null>(null);
    const [savedIds, setSavedIds] = useState<string[]>([]);

    useEffect(() => {
        const loadSavedIds = async () => {
            try {
                const ids = await savedPropertiesService.getSavedIds();
                setSavedIds(ids);
            } catch {
                setSavedIds([]);
            }
        };

        void loadSavedIds();
    }, []);

    const handleToggleSave = async (propertyId: string | number) => {
        const normalized = String(propertyId);
        const currentlySaved = savedIds.includes(normalized);

        try {
            if (currentlySaved) {
                await savedPropertiesService.removeSavedProperty(propertyId);
                setSavedIds((prev) => prev.filter((id) => id !== normalized));
                return;
            }

            await savedPropertiesService.saveProperty(propertyId);
            setSavedIds((prev) => Array.from(new Set([...prev, normalized])));
        } catch {
            // Keep UI stable; no-op on failure.
        }
    };

    const isPropertySaved = (propertyId: string | number) => savedIds.includes(String(propertyId));

    const fetchDefaultProperties = async () => {
        setLoading(true);
        setError(null);
        setIsSearching(false);
        setViewingAll(null);
        try {
            const response = await propertyService.getAllProperties({
                status: 'Published',
                page: 1,
                limit: 60,
            });

            const mapped = response.data.map(mapPropertyToUI);
            setProperties(mapped);
        } catch (fetchError) {
            console.error('Failed to fetch properties:', fetchError);
            setError('Failed to load properties. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchDefaultProperties();
    }, []);

    const newListings = useMemo(() => properties.slice(0, 8), [properties]);
    const popularProperties = useMemo(() => {
        const nextBucket = properties.slice(8, 16);
        return nextBucket.length > 0 ? nextBucket : properties.slice(0, 8);
    }, [properties]);
    const recommendedProperties = useMemo(() => {
        const newestBucket = properties.slice(16, 24);
        return newestBucket.length > 0 ? newestBucket : properties.slice(0, 8);
    }, [properties]);

    const handleViewAll = (section: string) => {
        setViewingAll(section);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPropertyCard = (property: BrowsePropertyUI) => (
        <PropertyCard
            key={property.id}
            property={property}
            onOpenDetails={() => setSelectedProperty(property)}
            isSaved={isPropertySaved(property.id)}
            onToggleSave={handleToggleSave}
        />
    );

    const getViewingAllTitle = (section: string | null): string => {
        if (section === 'newListings') return 'Newly Listed';
        if (section === 'popular') return 'Popular Properties';
        return 'Suits Your Lifestyle';
    };

    const renderMainSections = () => {
        if (isSearching) {
            return (
                <section className="property-scroll-section animate-fade-in">
                    <div className="section-header">
                        <div className="title-area">
                            <h2>Search Results</h2>
                        </div>
                        <button className="view-all-btn" onClick={fetchDefaultProperties}>Clear Search</button>
                    </div>
                    <div className="properties-grid properties-grid-expanded">
                        {properties.map(renderPropertyCard)}
                    </div>
                </section>
            );
        }

        if (viewingAll) {
            return (
                <section className="property-scroll-section animate-fade-in">
                    <div className="section-header">
                        <div className="title-area">
                            <h2>{getViewingAllTitle(viewingAll)}</h2>
                        </div>
                        <button className="view-all-btn" onClick={() => setViewingAll(null)}>Back to Categories</button>
                    </div>
                    <div className="properties-grid properties-grid-expanded">
                        {properties.map(renderPropertyCard)}
                    </div>
                </section>
            );
        }

        return (
            <>
                <section className="property-scroll-section">
                    <div className="section-header">
                        <div className="title-area">
                            <h2>Newly Listed</h2>
                        </div>
                        <button className="view-all-btn" onClick={() => handleViewAll('newListings')}>View All ({properties.length})</button>
                    </div>
                    <div className="properties-grid">
                        {newListings.map(renderPropertyCard)}
                    </div>
                </section>

                <section className="property-scroll-section">
                    <div className="section-header">
                        <div className="title-area">
                            <h2>Popular Properties</h2>
                        </div>
                        <button className="view-all-btn" onClick={() => handleViewAll('popular')}>View All ({properties.length})</button>
                    </div>
                    <div className="properties-grid">
                        {popularProperties.map(renderPropertyCard)}
                    </div>
                </section>

                <section className="property-scroll-section">
                    <div className="section-header">
                        <div className="title-area">
                            <h2>Suits Your Lifestyle</h2>
                        </div>
                        <button className="view-all-btn" onClick={() => handleViewAll('recommended')}>View All ({properties.length})</button>
                    </div>
                    <div className="properties-grid">
                        {recommendedProperties.map(renderPropertyCard)}
                    </div>
                </section>
            </>
        );
    };

    return (
        <div className="layout-wrapper">
            {!selectedProperty && <Sidebar />}
            <div className="main-content">
                <Header />
                <div className="browse-properties-page">
                    <SearchHero onSearch={(filters) => {
                        const doSearch = async () => {
                            setLoading(true);
                            setError(null);
                            setIsSearching(true);
                            setViewingAll(null);
                            try {
                                const response = await propertyService.getAllProperties({
                                    status: 'Published',
                                    page: 1,
                                    limit: 60,
                                    ...filters
                                } as any);
                
                                const mapped = response.data.map(mapPropertyToUI);
                                setProperties(mapped);
                            } catch (fetchError) {
                                console.error('Failed to fetch properties:', fetchError);
                                setError('Failed to load properties. Please try again.');
                            } finally {
                                setLoading(false);
                            }
                        };
                        void doSearch();
                    }} />

                    {loading && (
                        <section className="property-scroll-section">
                            <div className="section-header">
                                <div className="title-area">
                                    <h2>Loading properties...</h2>
                                </div>
                            </div>
                        </section>
                    )}

                    {!loading && error && (
                        <section className="property-scroll-section">
                            <div className="section-header">
                                <div className="title-area">
                                    <h2>{error}</h2>
                                </div>
                            </div>
                        </section>
                    )}

                    {!loading && !error && properties.length === 0 && (
                        <section className="property-scroll-section">
                            <div className="section-header">
                                <div className="title-area">
                                    <h2>No properties available right now.</h2>
                                </div>
                            </div>
                        </section>
                    )}

                    {!loading && !error && properties.length > 0 && (
                        <>{renderMainSections()}</>
                    )}
                </div>
                <Footer />
            </div>

            {selectedProperty && (
                <PropertyDetailModal 
                    property={selectedProperty} 
                    onClose={() => setSelectedProperty(null)} 
                />
            )}
        </div>
    );
};

export default BrowseProperties;