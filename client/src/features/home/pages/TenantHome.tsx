import React from 'react';
import './TenantHome.css';

// Global Layout Components
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';  

// Dashboard Widgets
import ActiveRentalsCard from '../components/TenantHomeComponents/ActiveRentalsCard';
import UpcomingPayments from '../components/TenantHomeComponents/UpcomingPayments';
import MaintenanceRequests from '../components/TenantHomeComponents/MaintenanceRequests';
import Notifications from '../components/TenantHomeComponents/Notifications';
import RewardsSummary from '../components/TenantHomeComponents/RewardsSummary';

/**
 * TenantHome Component
 * Refactored to use a clean Grid system and standardized layout wrappers.
 */
const TenantHome: React.FC = () => {
  // Dynamic Greeting Logic
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="tenant-dashboard-root">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      <div className="main-wrapper">
        {/* Sticky/Top Header */}
        <Header />
        
        <main className="content-area">
          {/* Welcome Section */}
          <header className="welcome-section">
            <div className="welcome-text">
              <h1>{greeting}, <span className="highlight">Mohy!</span></h1>
              <p>You have 2 payments due this week and 1 active maintenance request.</p>
            </div>
          </header>

          {/* The Dashboard Grid 
              Row 1: 2/3 Active Rental, 1/3 Upcoming Payment
              Row 2: 1/3 Notifications, 1/3 Maintenance, 1/3 Rewards
          */}
          
          <div className="dashboard-grid">
            
            {/* Primary Section - High Priority */}
            <section className="grid-col-2">
              <ActiveRentalsCard />
            </section>
            
            <section className="grid-col-1">
              <UpcomingPayments />
            </section>

            {/* Secondary Section - Supporting Info */}
            <section className="grid-col-1">
              <Notifications />
            </section>

            <section className="grid-col-1">
              <MaintenanceRequests />
            </section>

            <section className="grid-col-1">
              <RewardsSummary />
            </section>
            
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default TenantHome;