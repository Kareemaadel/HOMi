import React, { useState } from 'react';
import Header from '../../../components/global/Landlord/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/Landlord/footer';
import RequestCard from '../components/RequestCard';
import StatsOverview from '../components/StatsOverview';
import FilterTabs from '../components/FilterTabs';
import './RentalRequests.css';

const RentalRequests: React.FC = () => {
    const [activeTab, setActiveTab] = useState('pending');

    // Mock Data for the "Rich" UI
    const requests = [
        {
            id: 1,
            applicant: {
                name: "Sarah Jenkins",
                image: "https://i.pravatar.cc/150?u=sarah",
                occupation: "Senior UX Designer",
                company: "Adobe",
                income: "$8,500/mo",
                creditScore: 745,
                matchScore: 98
            },
            property: {
                name: "Skyline Apartments",
                unit: "4B",
                rent: "$2,400"
            },
            status: "pending",
            message: "I'm looking for a quiet space close to the tech hub. I have a 5-year rental history with no late payments.",
            moveInDate: "Oct 12, 2026",
            pets: "1 Cat"
        },
        {
            id: 2,
            applicant: {
                name: "Marcus Thorne",
                image: "https://i.pravatar.cc/150?u=marcus",
                occupation: "Medical Resident",
                company: "City General Hospital",
                income: "$12,000/mo",
                creditScore: 680,
                matchScore: 85
            },
            property: {
                name: "Greenwood Villa",
                unit: "Main",
                rent: "$3,100"
            },
            status: "pending",
            message: "Relocating for my residency. Stable income, but my credit score is recovering from student loans.",
            moveInDate: "Nov 01, 2026",
            pets: "No Pets"
        }
    ];

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="rental-requests-page">
                    <header className="page-intro">
                        <div>
                            <h1>Rental Requests</h1>
                            <p>Screen applicants and manage your property pipeline.</p>
                        </div>
                        <StatsOverview />
                    </header>

                    <FilterTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                    <div className="requests-grid">
                        {requests.map(req => (
                            <RequestCard key={req.id} data={req} />
                        ))}
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default RentalRequests;