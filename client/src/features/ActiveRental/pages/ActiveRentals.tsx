import React from 'react';
import './ActiveRentals.css';
import Header from '../../../components/global/Tenant/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/Tenant/footer';
import DetailedRentCard from '../components/DetailedRentCard';
import UpcomingPayment from '../components/UpcomingPayment';
import QuickActions from '../components/QuickActions';
import MaintenanceStatus from '../components/MaintenanceStatus';

const ActiveRentals: React.FC = () => {
    const rentalData = {
        title: "Azure Horizon Suite",
        address: "452 Ocean Drive, Miami, FL",
        leaseStart: "Jan 12, 2024",
        leaseEnd: "Jan 12, 2025",
        monthlyRent: 3200,
        landlord: "Sarah Jenkins",
        sqft: 1250,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    };

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="active-rentals-container">
                

                    <QuickActions />

                    <div className="active-rental-content">
                        <section className="main-rental-info">
                            <DetailedRentCard rental={rentalData} />
                            <MaintenanceStatus />
                        </section>

                        <aside className="payment-sidebar">
                            <UpcomingPayment amount={rentalData.monthlyRent} dueDate="Oct 01, 2024" />
                            
                            <div className="support-card">
                                <h4>Need Help?</h4>
                                <p>Contact our 24/7 support line for urgent property issues.</p>
                                <button className="secondary-btn">Contact Support</button>
                            </div>

                            <div className="cancel-rental-card">
                                <h4>Terminate Lease</h4>
                                <p>Review terms or initiate the move-out process early.</p>
                                <button className="cancel-btn">Cancel Rental</button>
                            </div>
                        </aside>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default ActiveRentals;