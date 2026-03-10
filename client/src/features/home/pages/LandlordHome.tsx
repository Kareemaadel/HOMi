// client\src\features\home\pages\LandlordHome.tsx
import React, { useState } from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import PropertyCard from '../components/LandlordHomeComponents/PropertyCard';
import AddPropertyCard from '../components/LandlordHomeComponents/AddPropertyCard';
import Notifications from '../components/LandlordHomeComponents/Notifications'; // New Import
import TenantAI from '../components/LandlordHomeComponents/TenantAI';
import AddPropertyModal from '../components/LandlordHomeComponents/AddPropertyModal';
import './landlordHome.css';

const LandlordHome = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const properties = [
    { id: 1, name: "Skyline Apartments", address: "Downtown, Unit 402", status: "rented", price: "2,400" },
    { id: 2, name: "Oak Ridge Villa", address: "Suburban St. 12", status: "available", price: "1,850" },
    { id: 3, name: "Sunset Loft", address: "Beachside Ave 5", status: "pending", price: "3,100" },
  ];

  return (
    <div className="landlord-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <main className="dashboard-container">
          <div className="dashboard-split">
            
            <div className="left-column">
              <header className="welcome-section">
                <div className="welcome-text">
                  <h1>Welcome Back, <span className="highlight">Mohy!</span></h1>
                  <p>Manage your properties and track occupancy.</p>
                </div>
              </header>

              {/* Updated Row: Add Card next to Notifications */}
              <section className="top-actions-row">
                <AddPropertyCard onClick={() => setIsModalOpen(true)} />
                <Notifications />
              </section>

              <div className="properties-divider"></div>

              <section className="properties-grid">
                {properties.map(prop => (
                  <PropertyCard 
                    key={prop.id} 
                    name={prop.name}
                    address={prop.address}
                    status={prop.status}
                    price={prop.price}
                    id={prop.id}
                  />
                ))}
              </section>
            </div>

            <aside className="right-column">
              <TenantAI />
            </aside>
          </div>
        </main>
        <Footer />
      </div>

      {isModalOpen && (
        <AddPropertyModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default LandlordHome;