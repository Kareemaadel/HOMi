import React, { useState } from 'react';
import { Search, Home, ShieldCheck, UserCircle, Handshake, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { authService } from '../../../services/auth.service';

const TenantHome: React.FC = () => {
  // TODO: Replace this with actual API data
  const [hasActiveRentals, setHasActiveRentals] = useState<boolean>(false); 
  const navigate = useNavigate(); 
  const firstName = authService.getCurrentUser()?.profile?.firstName?.trim() || 'there';

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="tenant-dashboard-root">
      <Sidebar />
      
      <div className="main-wrapper">
        <Header />
        
        <main className="content-area">
          <header className="welcome-section">
            <div className="welcome-text">
              <h1>{greeting}, <span className="highlight">{firstName}!</span></h1>
              {hasActiveRentals ? (
                <p>You have 2 payments due this week and 1 active maintenance request.</p>
              ) : (
                <p>Welcome to your new dashboard. Let's get you into your dream home!</p>
              )}
            </div>
          </header>

          {hasActiveRentals ? (
            <div className="dashboard-grid">
              <section className="grid-col-2">
                <ActiveRentalsCard />
              </section>
              <section className="grid-col-1">
                <UpcomingPayments />
              </section>
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
          ) : (
            <div className="empty-state-wrapper animate-fade-in">
              
              {/* HERO CTA BANNER */}
              <div className="hero-cta-card">
                {/* Abstract Background Shapes */}
                <div className="hero-bg-shape shape-1"></div>
                <div className="hero-bg-shape shape-2"></div>

                <div className="hero-cta-content">
                  <h2>Ready to find your perfect place?</h2>
                  <p>Browse thousands of verified listings, schedule tours, and sign your lease—all entirely online.</p>
                  <button className="btn-search-primary" onClick={() => navigate('/browse-properties')}>
                    <Search size={18} /> Explore Properties
                  </button>
                </div>

                {/* Decorative Floating Elements */}
                <div className="hero-cta-graphics">
                  <div className="floating-card card-1">
                    <Home size={28} className="float-icon" />
                    <div className="float-lines">
                      <div className="line line-short"></div>
                      <div className="line line-long"></div>
                    </div>
                  </div>
                  <div className="floating-card card-2">
                    <ShieldCheck size={28} className="float-icon" />
                    <div className="float-lines">
                      <div className="line line-long"></div>
                      <div className="line line-short"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Layout */}
              <div className="dashboard-grid" style={{ marginTop: '1rem' }}>
                
                <div className="grid-col-2">
                  <h3 className="section-subtitle" style={{ marginBottom: '1.25rem' }}>Getting Started</h3>
                  <div className="onboarding-grid">
                    
                    {/* Card 1 */}
                    <div className="onboarding-card">
                      <div className="card-bg-icon"><UserCircle size={120} /></div>
                      <div className="step-badge">Step 1</div>
                      <div className="icon-wrapper blue"><UserCircle size={24} /></div>
                      <h4>Profile Setup</h4>
                      <p>Get pre-approved faster by filling out your tenant profile and verifying your ID.</p>
                      <button className="text-link" onClick={() => navigate('/settings')}>Go to Profile <ArrowRight size={16} className="arrow-icon"/></button>
                    </div>

                    {/* Card 2 */}
                    <div className="onboarding-card">
                      <div className="card-bg-icon"><Home size={120} /></div>
                      <div className="step-badge">Step 2</div>
                      <div className="icon-wrapper green"><Home size={24} /></div>
                      <h4>Find a Roommate</h4>
                      <p>Use our smart filters to find apartments that fit your budget and lifestyle.</p>
                      <button className="text-link" onClick={() => navigate('/matching')}>View Matching Profiles <ArrowRight size={16} className="arrow-icon"/></button>
                    </div>

                    {/* Card 3 */}
                    <div className="onboarding-card">
                      <div className="card-bg-icon"><Handshake size={120} /></div>
                      <div className="step-badge">Step 3</div>
                      <div className="icon-wrapper purple"><Handshake size={24} /></div>
                      <h4>Sent Requests</h4>
                      <p>View and manage the rental requests you've sent to property owners.</p>
                      <button className="text-link" onClick={() => navigate('/sent-requests')}>
                        View Requests <ArrowRight size={16} className="arrow-icon"/>
                      </button>
                    </div>

                  </div>
                </div>

                <section className="grid-col-1">
                  <h3 className="section-subtitle" style={{ marginBottom: '1.25rem' }}>Your Updates</h3>
                  <Notifications />
                </section>

              </div>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default TenantHome;