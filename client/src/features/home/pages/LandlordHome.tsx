import React from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import PropertyCard from '../components/LandlordHomeComponents/PropertyCard';
import AddPropertyCard from '../components/LandlordHomeComponents/AddPropertyCard';
import TenantAI from '../components/LandlordHomeComponents/TenantAI';
import './landlordHome.css';

const LandlordHome = () => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  const properties = [
    { id: 1, name: "Skyline Apartments", address: "Downtown, Unit 402", status: "rented", price: "$2,400" },
    { id: 2, name: "Oak Ridge Villa", address: "Suburban St. 12", status: "available", price: "$1,850" },
    { id: 3, name: "Sunset Loft", address: "Beachside Ave 5", status: "pending", price: "$3,100" },
  ];

  return (
    <div className="landlord-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <main className="dashboard-container">
          {/* THE FIX: This container forces the horizontal split */}
          <div className="dashboard-split">
            
            {/* Left Section: Properties */}
            <div className="left-column">
              
              <header className="welcome-section">
                <div className="welcome-text">
                  <h1>Welocome Back, <span className="highlight">Mohy!</span></h1>
                  <p>Manage your properties and track occupancy.</p>
                </div>
              </header>

              <section className="add-property-section">
                <AddPropertyCard />
              </section>

              <div className="properties-divider"></div>

              <section className="properties-grid">
                {properties.map(prop => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </section>
            </div>

            {/* Right Section: AI Insights */}
            <aside className="right-column">
              <TenantAI />
            </aside>
            
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default LandlordHome;