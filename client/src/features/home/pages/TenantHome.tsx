import React, { useEffect, useMemo, useState } from 'react';
import { Search, Home, ShieldCheck, UserCircle, Handshake, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TenantHome.css';

// Global Layout Components
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';  

// Dashboard Widgets
import ActiveRentalsCard from '../components/TenantHomeComponents/ActiveRentalsCard';
import { UpcomingPayments } from '../components/TenantHomeComponents/UpcomingPayments';
import MaintenanceRequests from '../components/TenantHomeComponents/MaintenanceRequests';
import Notifications from '../components/TenantHomeComponents/Notifications';
import RewardsSummary from '../components/TenantHomeComponents/RewardsSummary';
import { authService } from '../../../services/auth.service';
import contractService from '../../../services/contract.service';
import type { LandlordContract } from '../../../services/contract.service';
import { propertyService, type PropertyResponse } from '../../../services/property.service';

const TenantHome: React.FC = () => {
  const [isCheckingContracts, setIsCheckingContracts] = useState<boolean>(true);
  const [tenantContracts, setTenantContracts] = useState<LandlordContract[]>([]);
  const [activeRentalIndex, setActiveRentalIndex] = useState(0);
  const [timeOffsetDays, setTimeOffsetDays] = useState(0);
  const [simulatedNow, setSimulatedNow] = useState<Date>(new Date());
  const [activePropertyDetails, setActivePropertyDetails] = useState<PropertyResponse | null>(null);
  const navigate = useNavigate(); 
  const firstName = authService.getCurrentUser()?.profile?.firstName?.trim() || 'there';

  const currentHour = new Date().getHours();
  let greeting = 'Good Evening';
  if (currentHour < 12) {
    greeting = 'Good Morning';
  } else if (currentHour < 18) {
    greeting = 'Good Afternoon';
  }

  const isContractActiveForReferenceDate = (contract: LandlordContract, referenceDate: Date): boolean => {
    if (contract.status !== 'ACTIVE') return false;
    const moveIn = new Date(contract.moveInDate);
    if (Number.isNaN(moveIn.getTime())) return true;
    const leaseEnd = new Date(moveIn);
    leaseEnd.setMonth(leaseEnd.getMonth() + Number(contract.leaseDurationMonths ?? 0));
    return referenceDate < leaseEnd;
  };

  const loadDashboardData = async () => {
    setIsCheckingContracts(true);
    try {
      const [contractsRes, clock] = await Promise.all([
        contractService.getTenantContracts({ page: 1, limit: 50 }),
        contractService.getTestingClock(),
      ]);
      setTenantContracts(contractsRes.data ?? []);
      setActiveRentalIndex(0);
      setTimeOffsetDays(Number(clock.offsetDays ?? 0));
      setSimulatedNow(new Date(clock.now));
    } catch {
      setTenantContracts([]);
    } finally {
      setIsCheckingContracts(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const activeContracts = useMemo(
    () => tenantContracts.filter((contract) => isContractActiveForReferenceDate(contract, simulatedNow)),
    [tenantContracts, simulatedNow]
  );
  const activeContract = useMemo(
    () => activeContracts[activeRentalIndex] ?? activeContracts[0] ?? null,
    [activeContracts, activeRentalIndex]
  );
  const hasActiveRentalsForView = activeContracts.length > 0;

  useEffect(() => {
    if (activeRentalIndex < activeContracts.length) return;
    setActiveRentalIndex(0);
  }, [activeRentalIndex, activeContracts.length]);

  useEffect(() => {
    const propertyId = activeContract?.property?.id;
    if (!propertyId) {
      setActivePropertyDetails(null);
      return;
    }

    let cancelled = false;

    const loadPropertyDetails = async () => {
      try {
        const response = await propertyService.getPropertyById(propertyId);
        if (!cancelled) {
          setActivePropertyDetails(response.data);
        }
      } catch {
        if (!cancelled) {
          setActivePropertyDetails(null);
        }
      }
    };

    void loadPropertyDetails();

    return () => {
      cancelled = true;
    };
  }, [activeContract?.property?.id]);

  const openPaymentContractsCount = useMemo(
    () => tenantContracts.filter((contract) => contract.status === 'PENDING_PAYMENT').length,
    [tenantContracts]
  );

  const maintenanceAreasCount = activeContract?.maintenanceResponsibilities?.length ?? 0;

  let activeSummaryText = `Your lease dashboard is up to date with ${maintenanceAreasCount} maintenance area${maintenanceAreasCount === 1 ? '' : 's'} configured.`;
  if (openPaymentContractsCount > 0) {
    const paymentLabel = `payment${openPaymentContractsCount > 1 ? 's' : ''}`;
    const areaLabel = `area${maintenanceAreasCount === 1 ? '' : 's'}`;
    activeSummaryText = `You have ${openPaymentContractsCount} pending ${paymentLabel} and ${maintenanceAreasCount} maintenance ${areaLabel} in your lease.`;
  }

  const handleAdvance15Days = async () => {
    const next = await contractService.advanceTestingClock(15);
    setTimeOffsetDays(Number(next.offsetDays ?? 0));
    setSimulatedNow(new Date(next.now));
    await loadDashboardData();
  };

  const handleResetTimeSimulation = async () => {
    const next = await contractService.resetTestingClock();
    setTimeOffsetDays(Number(next.offsetDays ?? 0));
    setSimulatedNow(new Date(next.now));
    await loadDashboardData();
  };

  if (isCheckingContracts) {
    return (
      <div className="tenant-dashboard-root">
        <Sidebar />
        <div className="main-wrapper">
          <Header />
          <main className="content-area" style={{ display: 'grid', placeItems: 'center' }}>
            <p style={{ color: '#64748b', fontWeight: 600 }}>Loading your dashboard...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-dashboard-root">
      <Sidebar />
      
      <div className="main-wrapper">
        <Header />
        
        <main className="content-area">
          <header className="welcome-section">
            <div className="welcome-text">
              <h1>{greeting}, <span className="highlight">{firstName}!</span></h1>
              {hasActiveRentalsForView ? (
                <p>{activeSummaryText}</p>
              ) : (
                <p>Welcome to your new dashboard. Let's get you into your dream home!</p>
              )}
            </div>
            <div className="time-travel-controls">
              <div className="time-travel-meta">
                <strong>Testing Date:</strong>{' '}
                {simulatedNow.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                {timeOffsetDays > 0 ? ` (+${timeOffsetDays} days)` : ''}
              </div>
              <div className="time-travel-actions">
                <button type="button" className="time-travel-btn" onClick={handleAdvance15Days}>
                  Advance +15 days
                </button>
                <button
                  type="button"
                  className="time-travel-btn reset"
                  onClick={handleResetTimeSimulation}
                  disabled={timeOffsetDays === 0}
                >
                  Reset
                </button>
              </div>
            </div>
          </header>

          {hasActiveRentalsForView ? (
            <div className="dashboard-grid active-dashboard-grid">
              <section className="grid-col-2 active-home-card-slot">
                <ActiveRentalsCard contract={activeContract} propertyDetails={activePropertyDetails} referenceDate={simulatedNow} />
                {activeContracts.length > 1 && (
                  <div className="active-rental-dots" aria-label="Switch active property">
                    {activeContracts.map((contract, idx) => (
                      <button
                        key={contract.id}
                        type="button"
                        className={`rental-dot ${idx === activeRentalIndex ? 'active' : ''}`}
                        aria-label={`Show property ${idx + 1}`}
                        onClick={() => setActiveRentalIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </section>
              <section className="grid-col-1 active-payment-card-slot">
                <UpcomingPayments contract={activeContract} referenceDate={simulatedNow} />
              </section>
              <section className="grid-col-1">
                <Notifications />
              </section>
              <section className="grid-col-1">
                <MaintenanceRequests contract={activeContract} />
              </section>
              <section className="grid-col-1">
                <RewardsSummary contracts={tenantContracts} />
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