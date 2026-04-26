import React, { useEffect, useMemo, useState } from 'react';
import { Search, Home, ShieldCheck, UserCircle, Handshake, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [hasActiveRentals, setHasActiveRentals] = useState<boolean>(false);
  const [isCheckingContracts, setIsCheckingContracts] = useState<boolean>(true);
  const [tenantContracts, setTenantContracts] = useState<LandlordContract[]>([]);
  const [activePropertyDetails, setActivePropertyDetails] = useState<PropertyResponse | null>(null);
  const navigate = useNavigate();
  const firstName = authService.getCurrentUser()?.profile?.firstName?.trim() || 'there';

  const currentHour = new Date().getHours();
  let greetingKey = 'tenantHome.goodEvening';
  if (currentHour < 12) {
    greetingKey = 'tenantHome.goodMorning';
  } else if (currentHour < 18) {
    greetingKey = 'tenantHome.goodAfternoon';
  }

  useEffect(() => {
    const loadActiveContracts = async () => {
      setIsCheckingContracts(true);
      try {
        const response = await contractService.getTenantContracts({ page: 1, limit: 50 });
        const contracts = response.data ?? [];
        const activeContracts = contracts.filter((contract) => contract.status === 'ACTIVE');
        setTenantContracts(contracts);
        setHasActiveRentals(activeContracts.length > 0);
      } catch {
        setTenantContracts([]);
        setHasActiveRentals(false);
      } finally {
        setIsCheckingContracts(false);
      }
    };

    void loadActiveContracts();
  }, []);

  const activeContract = useMemo(
    () => tenantContracts.find((contract) => contract.status === 'ACTIVE') ?? null,
    [tenantContracts]
  );

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

  const activeSummaryText = openPaymentContractsCount > 0
    ? t('tenantHome.pendingPaymentsMaintenance', { paymentCount: openPaymentContractsCount, maintenanceCount: maintenanceAreasCount })
    : t('tenantHome.leaseDashboardUpToDate', { count: maintenanceAreasCount });

  if (isCheckingContracts) {
    return (
      <div className="tenant-dashboard-root">
        <Sidebar />
        <div className="main-wrapper">
          <Header />
          <main className="content-area" style={{ display: 'grid', placeItems: 'center' }}>
            <p style={{ color: '#64748b', fontWeight: 600 }}>{t('tenantHome.loadingDashboard')}</p>
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
              <h1>{t(greetingKey)}, <span className="highlight">{firstName}!</span></h1>
              {hasActiveRentals ? (
                <p>{activeSummaryText}</p>
              ) : (
                <p>{t('tenantHome.welcomeDreamHome')}</p>
              )}
            </div>
          </header>

          {hasActiveRentals ? (
            <div className="dashboard-grid active-dashboard-grid">
              <section className="grid-col-2 active-home-card-slot">
                <ActiveRentalsCard contract={activeContract} propertyDetails={activePropertyDetails} />
              </section>
              <section className="grid-col-1 active-payment-card-slot">
                <UpcomingPayments contract={activeContract} />
              </section>
              <section className="grid-col-1">
                <Notifications contracts={tenantContracts} />
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
                  <h2>{t('tenantHome.readyToFindPerfectPlace')}</h2>
                  <p>{t('tenantHome.browseVerifiedListings')}</p>
                  <button className="btn-search-primary" onClick={() => navigate('/browse-properties')}>
                    <Search size={18} /> {t('tenantHome.exploreProperties')}
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
                  <h3 className="section-subtitle" style={{ marginBottom: '1.25rem' }}>{t('tenantHome.gettingStarted')}</h3>
                  <div className="onboarding-grid">

                    {/* Card 1 */}
                    <div className="onboarding-card">
                      <div className="card-bg-icon"><UserCircle size={120} /></div>
                      <div className="step-badge">{t('landlordHome.step')} 1</div>
                      <div className="icon-wrapper blue"><UserCircle size={24} /></div>
                      <h4>{t('tenantHome.profileSetup')}</h4>
                      <p>{t('tenantHome.preApprovedFaster')}</p>
                      <button className="text-link" onClick={() => navigate('/settings')}>{t('tenantHome.goToProfile')} <ArrowRight size={16} className="arrow-icon" /></button>
                    </div>

                    {/* Card 2 */}
                    <div className="onboarding-card">
                      <div className="card-bg-icon"><Home size={120} /></div>
                      <div className="step-badge">{t('landlordHome.step')} 2</div>
                      <div className="icon-wrapper green"><Home size={24} /></div>
                      <h4>{t('tenantHome.findRoommate')}</h4>
                      <p>{t('tenantHome.smartFilters')}</p>
                      <button className="text-link" onClick={() => navigate('/matching')}>{t('tenantHome.viewMatchingProfiles')} <ArrowRight size={16} className="arrow-icon" /></button>
                    </div>

                    {/* Card 3 */}
                    <div className="onboarding-card">
                      <div className="card-bg-icon"><Handshake size={120} /></div>
                      <div className="step-badge">{t('landlordHome.step')} 3</div>
                      <div className="icon-wrapper purple"><Handshake size={24} /></div>
                      <h4>{t('tenantHome.sentRequests')}</h4>
                      <p>{t('tenantHome.viewManageRequests')}</p>
                      <button className="text-link" onClick={() => navigate('/sent-requests')}>
                        {t('tenantHome.viewRequests')} <ArrowRight size={16} className="arrow-icon" />
                      </button>
                    </div>

                  </div>
                </div>

                <section className="grid-col-1">
                  <h3 className="section-subtitle" style={{ marginBottom: '1.25rem' }}>{t('tenantHome.yourUpdates')}</h3>
                  <Notifications contracts={tenantContracts} />
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

