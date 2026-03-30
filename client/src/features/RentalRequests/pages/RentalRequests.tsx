import React, { useState } from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import RequestCard from '../components/RequestCard';
import StatsOverview from '../components/StatsOverview';
import FilterTabs from '../components/FilterTabs';
import { FaInbox } from 'react-icons/fa'; // Added for the empty state
import './RentalRequests.css';

const RentalRequests: React.FC = () => {
    const [activeTab, setActiveTab] = useState('pending');
    
    // TOGGLE THIS TO TEST THE EMPTY STATE
    const hasData = true; 

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
            property: { name: "Skyline Apartments", unit: "4B", rent: "$2,400" },
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
            property: { name: "Greenwood Villa", unit: "Main", rent: "$3,100" },
            status: "pending",
            message: "Relocating for my residency. Stable income, but my credit score is recovering from student loans.",
            moveInDate: "Nov 01, 2026",
            pets: "No Pets"
        },
        {
            id: 3,
            applicant: {
                name: "Elena Rodriguez",
                image: "https://i.pravatar.cc/150?u=elena",
                occupation: "Financial Analyst",
                company: "Morgan Stanley",
                income: "$9,200/mo",
                creditScore: 790,
                matchScore: 95
            },
            property: { name: "Skyline Apartments", unit: "2A", rent: "$2,100" },
            status: "pending",
            message: "Very interested in the unit. I travel often for work so I appreciate a secure building.",
            moveInDate: "Nov 15, 2026",
            pets: "No Pets"
        },
        {
            id: 4,
            applicant: {
                name: "David Chen",
                image: "https://i.pravatar.cc/150?u=david",
                occupation: "Software Engineer",
                company: "Spotify",
                income: "$10,500/mo",
                creditScore: 720,
                matchScore: 88
            },
            property: { name: "The Lumina", unit: "12C", rent: "$2,800" },
            status: "pending",
            message: "Looking for a long-term lease. I work from home 3 days a week, so a good internet connection is my main priority.",
            moveInDate: "Dec 01, 2026",
            pets: "1 Dog (Golden Retriever)"
        },
        {
            id: 5,
            applicant: {
                name: "Aisha Patel",
                image: "https://i.pravatar.cc/150?u=aisha",
                occupation: "Freelance Consultant",
                company: "Self-Employed",
                income: "$7,800/mo",
                creditScore: 810,
                matchScore: 92
            },
            property: { name: "Greenwood Villa", unit: "Coach House", rent: "$1,900" },
            status: "pending",
            message: "I love the coach house layout. I can provide 2 years of tax returns to verify my self-employment income.",
            moveInDate: "Oct 20, 2026",
            pets: "No Pets"
        },
        {
            id: 6,
            applicant: {
                name: "Michael & Emma",
                image: "https://i.pravatar.cc/150?u=couple",
                occupation: "High School Teachers",
                company: "Public School District",
                income: "$9,500/mo",
                creditScore: 710,
                matchScore: 89
            },
            property: { name: "Skyline Apartments", unit: "3B", rent: "$2,500" },
            status: "pending",
            message: "We are getting married next month and looking for our first place together! We have great references from our current landlord.",
            moveInDate: "Nov 01, 2026",
            pets: "No Pets"
        }
    ];

    // Determine what to display based on the toggle
    const currentRequests = hasData ? requests : [];

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main className="rental-requests-page">
                    <header className="page-intro">
                        <div className="intro-text">
                            <h1>Rental Requests</h1>
                            <p>Screen applicants and manage your property pipeline.</p>
                        </div>
                        <StatsOverview />
                    </header>

                    <FilterTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* Conditional Rendering for Empty State vs Grid */}
                    {currentRequests.length > 0 ? (
                        <div className="rental-requests-grid">
                            {currentRequests.map(req => (
                                <RequestCard key={req.id} data={req} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-container">
                            <div className="empty-state-icon">
                                <FaInbox />
                            </div>
                            <h3>No rental applications yet</h3>
                            <p>We'll notify you as soon as someone applies.</p>
                        </div>
                    )}

                </main>
                <Footer />
            </div>
        </div>
    );
};

export default RentalRequests;