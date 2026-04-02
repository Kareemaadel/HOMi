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

interface BrowsePropertyUI {
    id: string;
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

const mapPropertyToUI = (property: PropertyResponse): BrowsePropertyUI => {
    const mainImage = property.images.find((image) => image.isMain)?.imageUrl;
    const fallbackImage = property.images[0]?.imageUrl;
    const image = mainImage || fallbackImage || 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80';
    const allImages = property.images.length > 0 ? property.images.map((img) => img.imageUrl) : [image];
    const tags = property.amenities.slice(0, 2).map((amenity) => amenity.name);
    const normalizedFurnishing = property.furnishing === 'Fully'
        ? 'Fully Furnished'
        : property.furnishing === 'Semi'
            ? 'Semi-Furnished'
            : 'Unfurnished';

    return {
        id: property.id,
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
        ownerImage: property.landlord?.avatarUrl || 'https://i.pravatar.cc/150?u=owner-fallback',
    };
};

const BrowseProperties: React.FC = () => {
    const [selectedProperty, setSelectedProperty] = useState<BrowsePropertyUI | null>(null);
    const [properties, setProperties] = useState<BrowsePropertyUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            setError(null);
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

        void fetchProperties();
    }, []);

    const popularProperties = useMemo(() => properties.slice(0, 8), [properties]);
    const recommendedProperties = useMemo(() => {
        const nextBucket = properties.slice(8, 16);
        return nextBucket.length > 0 ? nextBucket : properties.slice(0, 8);
    }, [properties]);
    const newListings = useMemo(() => {
        const newestBucket = properties.slice(16, 24);
        return newestBucket.length > 0 ? newestBucket : properties.slice(0, 8);
    }, [properties]);

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="browse-properties-page">
                    <SearchHero onSearch={(filters) => {
                        const fetchProperties = async () => {
                            setLoading(true);
                            setError(null);
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
                        void fetchProperties();
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
                        <>
                            <section className="property-scroll-section">
                                <div className="section-header">
                                    <div className="title-area">
                                        <h2>Popular Properties</h2>
                                    </div>
                                    <button className="view-all-btn">View All ({popularProperties.length})</button>
                                </div>
                                <div className="properties-grid">
                                    {popularProperties.map(property => (
                                        <PropertyCard
                                            key={property.id}
                                            property={property}
                                            onOpenDetails={() => setSelectedProperty(property)}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="property-scroll-section">
                                <div className="section-header">
                                    <div className="title-area">
                                        <h2>Suits Your Lifestyle</h2>
                                    </div>
                                    <button className="view-all-btn">View All ({recommendedProperties.length})</button>
                                </div>
                                <div className="properties-grid">
                                    {recommendedProperties.map(property => (
                                        <PropertyCard
                                            key={property.id}
                                            property={property}
                                            onOpenDetails={() => setSelectedProperty(property)}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="property-scroll-section">
                                <div className="section-header">
                                    <div className="title-area">
                                        <h2>Newly Listed</h2>
                                    </div>
                                    <button className="view-all-btn">View All ({newListings.length})</button>
                                </div>
                                <div className="properties-grid">
                                    {newListings.map(property => (
                                        <PropertyCard
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