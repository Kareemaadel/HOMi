import React from 'react';
import './MyActives.css';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import RentedPropertyCard from '../components/RentedPropertyCard';

const MyActives: React.FC = () => {
    // Mocking a list of properties (In reality, this comes from an API/Hook)
    const activeRentals = [
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
                            <div className="stat-pill"><strong>1</strong> Pending Maintenance</div>
                        </div>
                    </div>

                    <div className="rentals-grid">
                        {activeRentals.map(property => (
                            <RentedPropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default MyActives;