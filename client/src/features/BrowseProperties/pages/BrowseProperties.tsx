// import React, { useState } from 'react';
// import './BrowseProperties.css';
// import Header from '../../../components/global/Tenant/header';
// import Sidebar from '../../../components/global/Tenant/sidebar';
// import Footer from '../../../components/global/Tenant/footer';
// import PropertyCard from '../components/PropertyCard';
// import SearchHero from '../components/SearchHero';
// import Filters from '../components/Filters';

// const BrowseProperties: React.FC = () => {
//     const [view, setView] = useState<'grid' | 'list'>('grid');

//     const properties = [
//         {
//             id: 1,
//             title: "Azure Horizon Suite",
//             address: "452 Ocean Drive, Miami, FL",
//             price: 3200,
//             beds: 3,
//             baths: 2,
//             sqft: 1250,
//             image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
//             tags: ["New Construction", "Sea View"],
//             rating: 4.8
//         },
//         {
//             id: 2,
//             title: "Urban Loft - The Foundry",
//             address: "12 Industrial Way, Brooklyn, NY",
//             price: 2850,
//             beds: 1,
//             baths: 1,
//             sqft: 850,
//             image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
//             tags: ["Pet Friendly", "Gym"],
//             rating: 4.5
//         },
//         {
//             id: 3,
//             title: "Modern Garden Apartment",
//             address: "789 Green Lane, Austin, TX",
//             price: 2450,
//             beds: 2,
//             baths: 2,
//             sqft: 950,
//             image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
//             tags: ["Garden", "Modern"],
//             rating: 4.6
//         },
//         {
//             id: 4,
//             title: "Downtown Luxury Penthouse",
//             address: "567 High Street, Los Angeles, CA",
//             price: 4500,
//             beds: 4,
//             baths: 3,
//             sqft: 2100,
//             image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
//             tags: ["Luxury", "City View"],
//             rating: 4.9
//         },
//         {
//             id: 5,
//             title: "Cozy Studio - Midtown",
//             address: "234 Market Street, Denver, CO",
//             price: 1850,
//             beds: 0,
//             baths: 1,
//             sqft: 500,
//             image: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=800&q=80",
//             tags: ["Studio", "Walkable"],
//             rating: 4.3
//         },
//         {
//             id: 6,
//             title: "Family Home with Backyard",
//             address: "890 Oak Drive, Portland, OR",
//             price: 2900,
//             beds: 3,
//             baths: 2,
//             sqft: 1600,
//             image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
//             tags: ["Backyard", "Family"],
//             rating: 4.7
//         }
//     ];

//     return (
//         <div className="layout-wrapper">
//             <Sidebar />
//             <div className="main-content">
//                 <Header />
//                 <div className="browse-properties-page">
//                     <SearchHero />
                    
//                     <div className="browse-header">
//                         <div className="result-count">
//                             Showing <strong>142</strong> properties found
//                         </div>
//                         <div className="view-controls">
//                             <select className="sort-dropdown">
//                                 <option>Newest First</option>
//                                 <option>Price: Low to High</option>
//                                 <option>Price: High to Low</option>
//                             </select>
//                         </div>
//                     </div>

//                     <div className="properties-grid">
//                         {properties.map(property => (
//                             <PropertyCard key={property.id} property={property} />
//                         ))}
//                     </div>
//                 </div>
//                 <Footer />
//             </div>
//         </div>
//     );
// };

// export default BrowseProperties;

// client\src\features\BrowseProperties\pages\BrowseProperties.tsx
import React, { useState } from 'react';
import './BrowseProperties.css';
import Header from '../../../components/global/Tenant/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/Tenant/footer';
import PropertyCard from '../components/PropertyCard';
import SearchHero from '../components/SearchHero';
import PropertyDetailModal from '../components/PropertyDetailedModal';

const BrowseProperties: React.FC = () => {
    const [selectedProperty, setSelectedProperty] = useState<any>(null);

    const properties = [
        {
            id: 1,
            title: "Azure Horizon Suite",
            address: "452 Ocean Drive, Miami, FL",
            price: 3200,
            beds: 3,
            baths: 2,
            sqft: 1250,
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            tags: ["New Construction", "Sea View"],
            rating: 4.8
        },
        {
            id: 2,
            title: "Urban Loft - The Foundry",
            address: "12 Industrial Way, Brooklyn, NY",
            price: 2850,
            beds: 1,
            baths: 1,
            sqft: 850,
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
            tags: ["Pet Friendly", "Gym"],
            rating: 4.5
        },
        {
            id: 3,
            title: "Modern Garden Apartment",
            address: "789 Green Lane, Austin, TX",
            price: 2450,
            beds: 2,
            baths: 2,
            sqft: 950,
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
            tags: ["Garden", "Modern"],
            rating: 4.6
        },
        {
            id: 4,
            title: "Downtown Luxury Penthouse",
            address: "567 High Street, Los Angeles, CA",
            price: 4500,
            beds: 4,
            baths: 3,
            sqft: 2100,
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
            tags: ["Luxury", "City View"],
            rating: 4.9
        },
        {
            id: 5,
            title: "Cozy Studio - Midtown",
            address: "234 Market Street, Denver, CO",
            price: 1850,
            beds: 0,
            baths: 1,
            sqft: 500,
            image: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=800&q=80",
            tags: ["Studio", "Walkable"],
            rating: 4.3
        },
        {
            id: 6,
            title: "Family Home with Backyard",
            address: "890 Oak Drive, Portland, OR",
            price: 2900,
            beds: 3,
            baths: 2,
            sqft: 1600,
            image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
            tags: ["Backyard", "Family"],
            rating: 4.7
        }
    ];

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="browse-properties-page">
                    <SearchHero />
                    <div className="browse-header">
                        <div className="result-count">
                            Showing <strong>{properties.length}</strong> properties found
                        </div>
                    </div>

                    <div className="properties-grid">
                        {properties.map(property => (
                            <PropertyCard 
                                key={property.id} 
                                property={property} 
                                onOpenDetails={() => setSelectedProperty(property)} 
                            />
                        ))}
                    </div>
                </div>
                <Footer />
            </div>

            {/* Modal Logic */}
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