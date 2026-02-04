import React from 'react';
import './TenantHome.css';
import Header from '../../../components/global/Tenant/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/Tenant/footer';

// Sub-components
import ActiveRentalsCard from '../components/TenantHomeComponents/ActiveRentalsCard';
import UpcomingPayments from '../components/TenantHomeComponents/UpcomingPayments';
import MaintenanceRequests from '../components/TenantHomeComponents/MaintenanceRequests';
// import QuickActions from '../components/TenantHomeComponents/QuickActions';
import Notifications from '../components/TenantHomeComponents/Notifications';
import RewardsSummary from '../components/TenantHomeComponents/RewardsSummary';

const TenantHome: React.FC = () => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="main-wrapper">
        <Header />
        
        <main className="content-area">
          <header className="welcome-section">
            <div className="welcome-text">
              <h1>{greeting}, <span className="highlight">Mohy!</span></h1>
              <p>Welcome back! You have 2 payments due this week.</p>
            </div>
          </header>

          <div className="dashboard-grid">
            {/* Primary Section - High Priority */}
            <section className="grid-col-2">
              <ActiveRentalsCard />
            </section>
            
            <section className="grid-col-1">
              <UpcomingPayments />
            </section>

            {/* Secondary Section */}
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