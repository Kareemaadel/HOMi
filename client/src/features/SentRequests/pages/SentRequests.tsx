// client/src/features/SentRequests/pages/SentRequests.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import PropertyDetailModal from '../../BrowseProperties/components/PropertyDetailedModal';
import './SentRequests.css';

const MOCK_SENT_REQUESTS = [
    {
        id: 'LXP-101',
        title: 'Modern Loft in Downtown',
        address: '123 Main St, City Center',
        price: 2400,
        securityDeposit: 2400,
        beds: 2,
        baths: 2,
        sqft: 1200,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
        availableDate: 'Sept 1st, 2024',
        furnishing: 'Fully Furnished',
        landlordName: 'Marcus Wright',
        status: 'Pending'
    },
    {
        id: 'LXP-204',
        title: 'Sunny Minimalist Studio',
        address: '45 Arts District, Westside',
        price: 1800,
        securityDeposit: 1800,
        beds: 1,
        baths: 1,
        sqft: 650,
        image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800',
        availableDate: 'Oct 15th, 2024',
        furnishing: 'Unfurnished',
        landlordName: 'Elena Rodriguez',
        status: 'Reviewed'
    }
];

const SentRequests = () => {
    // Hooks for routing and state
    const navigate = useNavigate();
    
    // DEV TOGGLE: Set to true to see mock requests, or false to see the empty state.
    const [hasData, setHasData] = useState(false);
    
    const [selectedProperty, setSelectedProperty] = useState<any>(null);

    // Conditionally load requests based on hasData state
    const currentRequests = hasData ? MOCK_SENT_REQUESTS : [];

    return (
        <div className="sent-requests-layout">
            <Header />
            
            <div className="sent-requests-main">
                <Sidebar />
                
                <div className="sent-requests-content">
                    <div className="sent-requests-header">
                        <h1>Sent Requests</h1>
                        <p>Track and manage the status of your rental applications.</p>
                    </div>

                    {hasData ? (
                        <div className="requests-grid">
                            {currentRequests.map(property => (
                                <div 
                                    key={property.id} 
                                    className="request-card" 
                                    onClick={() => setSelectedProperty(property)}
                                >
                                    <div className="request-card-image-wrapper">
                                        <img src={property.image} alt={property.title} />
                                        <span className={`status-badge ${property.status.toLowerCase()}`}>
                                            {property.status}
                                        </span>
                                    </div>
                                    <div className="request-card-info">
                                        <h3>{property.title}</h3>
                                        <p className="request-address">{property.address}</p>
                                        <div className="request-card-footer">
                                            <span className="request-price">${property.price.toLocaleString()}<span>/mo</span></span>
                                            <button className="view-details-btn">View Request</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="sent-empty-state-container">
                            <div className="sent-empty-icon-wrapper">
                                <Inbox size={56} className="sent-empty-icon" />
                            </div>
                            <h3 className="sent-empty-title">No Requests Sent Yet</h3>
                            <p className="sent-empty-text">
                                You haven't applied to any properties. Start exploring available rentals and find your perfect home today!
                            </p>
                            <button 
                                className="btn-browse-action"
                                onClick={() => navigate('/browse-properties')}
                            >
                                Browse Properties
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />

            {selectedProperty && (
                <PropertyDetailModal 
                    property={selectedProperty} 
                    onClose={() => setSelectedProperty(null)} 
                    isSentRequestView={true} 
                />
            )}
        </div>
    );
};

export default SentRequests;