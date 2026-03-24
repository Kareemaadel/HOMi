import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import './MyActives.css';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import RentedPropertyCard from '../components/RentedPropertyCard';

const MyActives: React.FC = () => {
    // Hooks for routing and state
    const navigate = useNavigate();
    
    // DEV TOGGLE: Change to true or false to test both views.
    const [hasData, setHasData] = useState(false);

    // Mocking a list of properties
    const mockRentals = [
        {
            id: "1",
            title: "Azure Horizon Suite",
            address: "452 Ocean Drive, Miami, FL",
            leaseEnd: "Jan 12, 2025",
            status: "Active" as const,
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"
        },
        {
            id: "2",
            title: "The Urban Loft",
            address: "128 Wynwood St, Miami, FL",
            leaseEnd: "Nov 05, 2024",
            status: "Expiring Soon" as const,
            image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80"
        }
    ];

    // Conditionally load rentals based on our hasData state
    const activeRentals = hasData ? mockRentals : [];

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="my-actives-container">
                    <div className="page-intro">
                        <div>
                            <h1>My Active Rentals</h1>
                            <p>Manage your current leases, payments, and maintenance requests.</p>
                        </div>
                        <div className="stats-mini-grid">
                            <div className="stat-pill"><strong>{activeRentals.length}</strong> Properties</div>
                            <div className="stat-pill"><strong>{hasData ? "1" : "0"}</strong> Pending Maintenance</div>
                        </div>
                    </div>

                    {hasData ? (
                        <div className="rentals-grid">
                            {activeRentals.map(property => (
                                <RentedPropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-container">
                            <Home size={48} className="empty-state-icon" />
                            <h3 className="empty-state-title">No Active Rentals</h3>
                            <p className="empty-state-text">
                                You don't have any active leases at the moment. Check the status of your submitted applications to see if you've been approved!
                            </p>
                            <button 
                                className="btn-empty-state"
                                onClick={() => navigate('/sent-requests')}
                            >
                                View your rent requests
                            </button>
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default MyActives;