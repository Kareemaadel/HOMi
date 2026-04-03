import { useCallback, useEffect, useState } from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import PropertyCard from '../components/LandlordHomeComponents/PropertyCard';
import AddPropertyCard from '../components/LandlordHomeComponents/AddPropertyCard';
import Notifications from '../components/LandlordHomeComponents/Notifications';
import PaymentState from '../components/LandlordHomeComponents/PaymentState';
import AddPropertyModal from '../components/LandlordHomeComponents/AddPropertyModal';
import OptimizeListingModal from '../components/LandlordHomeComponents/optimizeListingModal';
import { FiPlus, FiHome, FiCamera, FiBookOpen, FiCreditCard, FiStar, FiZap, FiMessageSquare } from 'react-icons/fi';
import authService from '../../../services/auth.service';
import propertyService from '../../../services/property.service';
import type { PropertyResponse } from '../../../services/property.service';
import './landlordHome.css';

const LandlordHome = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [landlordName, setLandlordName] = useState('Landlord');

  const fetchProperties = useCallback(async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?.user?.id) {
        setProperties([]);
        return;
      }

      setLandlordName(
        currentUser.profile?.firstName ||
        currentUser.user?.email?.split('@')[0] ||
        'Landlord'
      );

      const response = await propertyService.getAllProperties({ landlordId: currentUser.user.id });
      setProperties(response?.data ?? []);
    } catch {
      setProperties([]);
    }
  }, []);

  useEffect(() => {
    void fetchProperties();
  }, [fetchProperties]);

  const hasData = properties.length > 0;
  const mappedProperties = properties.map((prop, index) => ({
    id: prop.id || String(index),
    name: prop.title,
    address: prop.address,
    status: (prop.status || '').toLowerCase(),
    price: String(prop.monthlyPrice ?? ''),
    imageUrl:
      prop.images?.find((img) => img.isMain)?.imageUrl ||
      prop.images?.[0]?.imageUrl ||
      '/rentblue.jpg',
    beds: prop.specifications?.bedrooms ?? 0,
    baths: prop.specifications?.bathrooms ?? 0,
    sqft: prop.specifications?.areaSqft ?? '—',
    tenantName:
      (
        ((prop as unknown as {
          currentTenant?: { firstName?: string; lastName?: string };
          activeContract?: { tenant?: { firstName?: string; lastName?: string } };
          tenant?: { firstName?: string; lastName?: string };
        }).currentTenant &&
          `${(prop as unknown as { currentTenant?: { firstName?: string; lastName?: string } }).currentTenant?.firstName || ''} ${(prop as unknown as { currentTenant?: { firstName?: string; lastName?: string } }).currentTenant?.lastName || ''}`.trim()) ||
        ((prop as unknown as { activeContract?: { tenant?: { firstName?: string; lastName?: string } } }).activeContract?.tenant &&
          `${(prop as unknown as { activeContract?: { tenant?: { firstName?: string; lastName?: string } } }).activeContract?.tenant?.firstName || ''} ${(prop as unknown as { activeContract?: { tenant?: { firstName?: string; lastName?: string } } }).activeContract?.tenant?.lastName || ''}`.trim()) ||
        ((prop as unknown as { tenant?: { firstName?: string; lastName?: string } }).tenant &&
          `${(prop as unknown as { tenant?: { firstName?: string; lastName?: string } }).tenant?.firstName || ''} ${(prop as unknown as { tenant?: { firstName?: string; lastName?: string } }).tenant?.lastName || ''}`.trim())
      ) ||
      'No current tenant',
    paymentStatus: prop.status?.toLowerCase() === 'rented' ? 'Paid' : 'Pending',
  }));

  return (
    <>
      <div className="landlord-layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          
          <main className="dashboard-container">
            {hasData ? (
              /* =========================================
                 PREMIUM POPULATED STATE (Dashboard)
                 ========================================= */
              <div className="dashboard-content-wrapper animate-fade-in">
                
                <header className="welcome-section">
                  <div className="welcome-text">
                    <h1>Welcome Back, <span className="highlight-gradient">{landlordName}!</span></h1>
                    <p>Manage your properties, track occupancy, and review incoming requests.</p>
                  </div>
                </header>

                {/* Top Actions & Summary Row */}
                <section className="dashboard-top-row">
                  <div className="action-widget">
                    <AddPropertyCard onClick={() => setIsModalOpen(true)} />
                  </div>
                  
                  <div className="payment-widget">
                    <PaymentState />
                  </div>

                  <div className="notifications-widget">
                    <Notifications />
                  </div>
                </section>

                {/* Master Properties Container */}
                <section className="properties-master-container">
                  <div className="section-header">
                    <div className="header-title-group">
                      <div className="header-icon"><FiHome size={20} /></div>
                      <h2>Your Portfolio</h2>
                      <span className="status-badge">{mappedProperties.length} Active Listings</span>
                    </div>
                    <button className="btn-text-primary" onClick={() => setIsModalOpen(true)}>
                      <FiPlus size={18} /> Add New
                    </button>
                  </div>

                  <div className="properties-grid">
                    {mappedProperties.map(prop => (
                      <PropertyCard 
                        key={prop.id} 
                        name={prop.name}
                        address={prop.address}
                        status={prop.status}
                        price={prop.price}
                        id={prop.id}
                        imageUrl={prop.imageUrl}
                        beds={prop.beds}
                        baths={prop.baths}
                        sqft={prop.sqft}
                        tenantName={prop.tenantName}
                        paymentStatus={prop.paymentStatus}
                      />
                    ))}
                  </div>
                </section>

              </div>
            ) : (
              /* =========================================
                 PREMIUM EMPTY STATE (Onboarding)
                 ========================================= */
              <div className="lh-onboarding-wrapper animate-fade-in">
                
                {/* 1. Hero Section */}
                <section className="lh-hero-banner">
                  <div className="lh-hero-blobs">
                    <div className="lh-blob blob-1"></div>
                    <div className="lh-blob blob-2"></div>
                  </div>
                  <div className="lh-hero-content">
                    <h1>Start listing your property today</h1>
                    <p>Reach thousands of tenants, manage your portfolio, and maximize your earnings all in one place.</p>
                    <div className="lh-hero-actions">
                      <button className="lh-btn-primary" onClick={() => setIsModalOpen(true)}>
                        <FiPlus size={20} /> Add Property
                      </button>
                      <button className="lh-btn-secondary">
                        Learn How It Works
                      </button>
                    </div>
                  </div>
                </section>

                <div className="lh-onboarding-split">
                  <div className="lh-onboarding-main">
                    
                    {/* 2. Getting Started Cards */}
                    <div className="lh-getting-started">
                      <div className="lh-cards-grid">
                        <div className="lh-onboarding-card" onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
                          <div className="lh-card-icon bg-blue"><FiHome /></div>
                          <span className="lh-step-badge">Step 1</span>
                          <h4>Add Your First Property</h4>
                          <p>Enter details, upload photos, and set your asking price.</p>
                        </div>
                        
                        {/* 👈 CLICK HANDLER ADDED FOR OPTIMIZE MODAL */}
                        <div className="lh-onboarding-card" onClick={() => setIsOptimizeModalOpen(true)} style={{ cursor: 'pointer' }}>
                          <div className="lh-card-icon bg-purple"><FiCamera /></div>
                          <span className="lh-step-badge">Step 2</span>
                          <h4>Optimize Listing</h4>
                          <p>Learn how to take photos that attract the best tenants.</p>
                        </div>

                        <div className="lh-onboarding-card">
                          <div className="lh-card-icon bg-green"><FiCreditCard /></div>
                          <span className="lh-step-badge">Step 3</span>
                          <h4>Setup Payments</h4>
                          <p>Connect your bank account to receive rent securely.</p>
                        </div>
                        <div className="lh-onboarding-card">
                          <div className="lh-card-icon bg-orange"><FiBookOpen /></div>
                          <span className="lh-step-badge">Step 4</span>
                          <h4>About HOMI</h4>
                          <p>Read our quick guide on managing requests and contracts.</p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Empty State For Properties List */}
                    <div className="lh-empty-list-box">
                      <div className="lh-empty-icon-wrapper">
                        <FiHome size={32} />
                      </div>
                      <h3>You haven't listed any properties yet.</h3>
                      <p>Your portfolio is waiting to be built. Click below to start.</p>
                      <button className="lh-btn-outline" onClick={() => setIsModalOpen(true)}>
                        <FiPlus /> Add Property
                      </button>
                    </div>

                  </div>

                  {/* Right Panel: Notifications & Tips */}
                  <aside className="lh-onboarding-sidebar">
                    
                    {/* 5. Notifications Panel */}
                    <div className="lh-widget lh-welcome-widget">
                      <div className="lh-widget-header">
                        <h4>Welcome to HOMI! 🎉</h4>
                      </div>
                      <p>Start by adding your first property. Once listed, you'll be able to track views, requests, and earnings right here.</p>
                    </div>

                    {/* 4. Tips Section */}
                    <div className="lh-widget lh-tips-widget">
                      <h4>Tips to Get Tenants Faster</h4>
                      <ul className="lh-tips-list">
                        <li>
                          <div className="lh-tip-icon"><FiCamera /></div>
                          <span>Add high-quality photos</span>
                        </li>
                        <li>
                          <div className="lh-tip-icon"><FiStar /></div>
                          <span>Set competitive pricing</span>
                        </li>
                        <li>
                          <div className="lh-tip-icon"><FiZap /></div>
                          <span>Respond quickly to inquiries</span>
                        </li>
                        <li>
                          <div className="lh-tip-icon"><FiMessageSquare /></div>
                          <span>Write clear, honest descriptions</span>
                        </li>
                      </ul>
                    </div>

                  </aside>
                </div>
              </div>
            )}
          </main>
          <Footer />
        </div>
      </div>

      {/* ==================================================
          MODALS WRAPPED OUTSIDE THE MAIN LAYOUT CONTAINER 
          ================================================== */}
      {isModalOpen && (
        <AddPropertyModal
          onClose={() => setIsModalOpen(false)}
          onPropertyAdded={() => {
            void fetchProperties();
          }}
        />
      )}

      {isOptimizeModalOpen && (
        <OptimizeListingModal onClose={() => setIsOptimizeModalOpen(false)} />
      )}
    </>
  );
};

export default LandlordHome;