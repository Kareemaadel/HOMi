// client\src\features\BrowseProperties\pages\BrowseProperties.tsx
import React, { useState } from 'react';
import './BrowseProperties.css';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import PropertyCard from '../components/PropertyCard';
import SearchHero from '../components/SearchHero';
import PropertyDetailModal from '../components/PropertyDetailedModal';
import { FaFire, FaMagic } from 'react-icons/fa';

const BrowseProperties: React.FC = () => {
    const [selectedProperty, setSelectedProperty] = useState<any>(null);

    // Group 1: Popular in Sheikh Zayed (8 Properties)
    const popularProperties = [
        { id: 1, title: "Azure Horizon Suite", address: "452 Ocean Drive, Miami, FL", price: 3200, beds: 3, baths: 2, sqft: 1250, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", tags: ["New Construction", "Sea View"], rating: 4.8, securityDeposit: 5000, furnishing: "Fully Furnished", targetTenant: "Families" },
        { id: 2, title: "Urban Loft - The Foundry", address: "12 Industrial Way, Brooklyn, NY", price: 2850, beds: 1, baths: 1, sqft: 850, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", tags: ["Pet Friendly", "Gym"], rating: 4.5, securityDeposit: 3000, furnishing: "Semi-Furnished", targetTenant: "Students" },
        { id: 3, title: "Modern Garden Apartment", address: "789 Green Lane, Austin, TX", price: 2450, beds: 2, baths: 2, sqft: 950, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", tags: ["Garden", "Modern"], rating: 4.6, securityDeposit: 2500, furnishing: "Non-Furnished", targetTenant: "Families" },
        { id: 4, title: "Downtown Luxury Penthouse", address: "567 High Street, Los Angeles, CA", price: 4500, beds: 4, baths: 3, sqft: 2100, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", tags: ["Luxury", "City View"], rating: 4.9, securityDeposit: 10000, furnishing: "Fully Furnished", targetTenant: "Families" },
        { id: 5, title: "The Glass House", address: "Sheikh Zayed, Giza, EG", price: 5500, beds: 5, baths: 4, sqft: 3200, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", tags: ["Villa", "Pool"], rating: 5.0, securityDeposit: 12000, furnishing: "Fully Furnished", targetTenant: "Large Families" },
        { id: 6, title: "Minimalist Loft", address: "Arkan Plaza, Sheikh Zayed", price: 3100, beds: 2, baths: 1, sqft: 1100, image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80", tags: ["Minimalist", "Design"], rating: 4.7, securityDeposit: 4500, furnishing: "Fully Furnished", targetTenant: "Couples" },
        { id: 7, title: "Cozy Brick Estate", address: "Sodic West, Zayed", price: 4200, beds: 3, baths: 2, sqft: 1800, image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=80", tags: ["Classic", "Backyard"], rating: 4.8, securityDeposit: 6000, furnishing: "Semi-Furnished", targetTenant: "Families" },
        { id: 8, title: "The Royal Suite", address: "Beverly Hills Zayed, EG", price: 7500, beds: 4, baths: 4, sqft: 2800, image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80", tags: ["Ultra Luxury", "Balcony"], rating: 4.9, securityDeposit: 15000, furnishing: "Fully Furnished", targetTenant: "Families" },
    ];

    // Group 2: Suits Your Lifestyle (8 Properties)
    const recommendedProperties = [
        { id: 9, title: "Student Studio Hub", address: "University District, Denver, CO", price: 1200, beds: 1, baths: 1, sqft: 450, image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80", tags: ["Cheap", "Near Campus"], rating: 4.2, securityDeposit: 1000, furnishing: "Semi-Furnished", targetTenant: "Students" },
        { id: 10, title: "Professional Micro-Flat", address: "Finance Center, NY", price: 2100, beds: 0, baths: 1, sqft: 550, image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80", tags: ["Compact", "Fast WiFi"], rating: 4.4, securityDeposit: 2500, furnishing: "Fully Furnished", targetTenant: "Professionals" },
        { id: 11, title: "Modern Terrace Apt", address: "Hill Top, Portland, OR", price: 2600, beds: 2, baths: 2, sqft: 1050, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80", tags: ["Balcony", "Bright"], rating: 4.6, securityDeposit: 3000, furnishing: "Non-Furnished", targetTenant: "Couples" },
        { id: 12, title: "Artist Studio Space", address: "Arts District, Berlin", price: 1500, beds: 1, baths: 1, sqft: 700, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", tags: ["Creative", "Industrial"], rating: 4.5, securityDeposit: 2000, furnishing: "Semi-Furnished", targetTenant: "Students" },
        { id: 13, title: "Pet Haven Suite", address: "Suburban Grove, CA", price: 2800, beds: 3, baths: 2, sqft: 1400, image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80", tags: ["Pet Friendly", "Park Access"], rating: 4.7, securityDeposit: 3500, furnishing: "Non-Furnished", targetTenant: "Families" },
        { id: 14, title: "Smart Home Tech Pod", address: "Silicon Valley, CA", price: 3500, beds: 2, baths: 2, sqft: 1200, image: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=800&q=80", tags: ["Smart Tech", "Modern"], rating: 4.8, securityDeposit: 5000, furnishing: "Fully Furnished", targetTenant: "Professionals" },
        { id: 15, title: "Rustic Zen Retreat", address: "Countryside, Kyoto, JP", price: 1900, beds: 2, baths: 1, sqft: 900, image: "https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&w=800&q=80", tags: ["Quiet", "Zen"], rating: 4.9, securityDeposit: 2500, furnishing: "Semi-Furnished", targetTenant: "Single Person" },
        { id: 16, title: "Executive Harbor View", address: "Docklands, London, UK", price: 4800, beds: 3, baths: 3, sqft: 2000, image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80", tags: ["Harbor View", "Security"], rating: 4.9, securityDeposit: 9000, furnishing: "Fully Furnished", targetTenant: "Professionals" },
    ];

    // Group 3: Newly Listed (8 Properties)
    const newListings = [
        { id: 17, title: "Skyline View Studio", address: "North Zayed, Giza", price: 2200, beds: 1, baths: 1, sqft: 750, image: "https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=800&q=80", tags: ["Just In", "High Floor"], rating: 4.5, securityDeposit: 3000, furnishing: "Semi-Furnished", targetTenant: "Single Person" },
        { id: 18, title: "The Courtyard Villa", address: "Zayed Regency", price: 6800, beds: 4, baths: 4, sqft: 3500, image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80", tags: ["New Listing", "Private Pool"], rating: 4.9, securityDeposit: 14000, furnishing: "Fully Furnished", targetTenant: "Families" },
        { id: 19, title: "Industrial Chic Loft", address: "Downtown Extension", price: 3400, beds: 2, baths: 2, sqft: 1300, image: "https://images.unsplash.com/photo-1536376074432-cd242423c3dd?auto=format&fit=crop&w=800&q=80", tags: ["Raw Design", "Spacious"], rating: 4.6, securityDeposit: 5000, furnishing: "Non-Furnished", targetTenant: "Couples" },
        { id: 20, title: "Garden Terrace Flat", address: "Green Belt Zayed", price: 2700, beds: 2, baths: 2, sqft: 1100, image: "https://images.unsplash.com/photo-1493246507139-91e8bef99c1e?auto=format&fit=crop&w=800&q=80", tags: ["Pet Friendly", "New"], rating: 4.7, securityDeposit: 4000, furnishing: "Fully Furnished", targetTenant: "Families" },
        { id: 21, title: "The Glass Pavilion", address: "Estates Zayed", price: 8900, beds: 5, baths: 6, sqft: 4500, image: "https://images.unsplash.com/photo-1464146072230-91cabc9fa7c0?auto=format&fit=crop&w=800&q=80", tags: ["Exclusive", "Modern"], rating: 5.0, securityDeposit: 20000, furnishing: "Fully Furnished", targetTenant: "Large Families" },
        { id: 22, title: "Boutique 1BR", address: "Zayed Dunes", price: 1950, beds: 1, baths: 1, sqft: 800, image: "https://images.unsplash.com/photo-1499916078039-922301b0eb9b?auto=format&fit=crop&w=800&q=80", tags: ["New", "Quiet"], rating: 4.4, securityDeposit: 3000, furnishing: "Semi-Furnished", targetTenant: "Professionals" },
        { id: 23, title: "Urban Edge Penthouse", address: "Capital Business Park Area", price: 5200, beds: 3, baths: 3, sqft: 2200, image: "https://images.unsplash.com/photo-1502672023488-70e25813efdf?auto=format&fit=crop&w=800&q=80", tags: ["Luxury", "Prime Location"], rating: 4.8, securityDeposit: 10000, furnishing: "Fully Furnished", targetTenant: "Families" },
        { id: 24, title: "Cozy Corner House", address: "Zayed 2000", price: 3800, beds: 3, baths: 3, sqft: 1900, image: "https://images.unsplash.com/photo-1448630305451-91fd4644a032?auto=format&fit=crop&w=800&q=80", tags: ["Classic", "New Addition"], rating: 4.7, securityDeposit: 6000, furnishing: "Non-Furnished", targetTenant: "Families" },
    ];

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="browse-properties-page">
                    <SearchHero />

                    <section className="property-scroll-section">
                        <div className="section-header">
                            <div className="title-area">
                                <h2>Popular in Sheikh Zayed</h2>
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