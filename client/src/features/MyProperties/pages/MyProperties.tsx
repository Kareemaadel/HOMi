import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import DetailedPropertyCard from '../components/DetailedPropertyCard';
import AddPropertyModal from '../../home/components/LandlordHomeComponents/AddPropertyModal'; // Import modal
import { FiPlus, FiHome } from 'react-icons/fi'; // Icons for the button
import propertyService from '../../../services/property.service';
import authService from '../../../services/auth.service';
import './MyProperties.css';
import type { LandlordPropertyRow } from '../components/DetailedPropertyCard';

const MyProperties = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [properties, setProperties] = useState<LandlordPropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const currentUser = authService.getCurrentUser();
        if (!currentUser?.user?.id) {
          setLoading(false);
          return;
        }
        
        const response = await propertyService.getAllProperties({
           landlordId: currentUser.user.id
        });
        
        if (response.success && response.data) {
           const mappedProperties = response.data.map(prop => ({
              id: prop.id,
              name: prop.title,
              address: prop.address,
              status: prop.status.toLowerCase(),
              price: `$${prop.monthlyPrice}`,
              beds: prop.specifications?.bedrooms || 0,
              baths: prop.specifications?.bathrooms || 0,
              sqft: prop.specifications?.areaSqft || 0,
              tenantName: null,
              leaseEnd: null,
              yield: "5.0", // Placeholder for now
              occupancyRate: prop.status === 'Rented' ? 100 : 0,
              images: prop.images || [],
                amenities: (prop.amenities || []).map((amenity) => amenity.name),
                houseRules: (prop.houseRules || []).map((rule) => rule.name),
              onUpdate: () => setRefreshKey(prev => prev + 1)
           }));
           setProperties(mappedProperties);
        }
      } catch (error) {
        console.error("Failed to fetch properties", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [refreshKey]);

  const hasData = properties.length > 0;

  if (loading) {
     return (
       <div className="landlord-layout">
         <Sidebar />
         <div className="main-content">
           <Header />
           <main className="my-properties-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
             <p>{t('myProperties.loadingProperties')}</p>
           </main>
           <Footer />
         </div>
       </div>
     );
  }

  return (
    <div className="landlord-layout" dir="ltr">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="my-properties-container">
          
          <div className="my-props-header">
            <div className="header-left">
              <h1>{t('myProperties.portfolio')}</h1>
              <p>{t('myProperties.managingUnits', { count: properties.length })}</p>
            </div>
            
            {/* Only show the top-right button if there IS data */}
            {hasData && (
              <button className="add-prop-primary-btn" onClick={() => setIsModalOpen(true)}>
                <div className="btn-icon-circle">
                  <FiPlus />
                </div>
                <span className="new-prop-btn-text">{t('myProperties.addNewProperty')}</span>
              </button>
            )}
          </div>

          {/* Conditional Rendering based on hasData */}
          {hasData ? (
            <div className="detailed-list-wrapper">
              {properties.map(prop => (
                <DetailedPropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="my-properties-empty-state-wrapper">
              <div className="my-properties-empty-state-icon-bg">
                <FiHome size={48} className="my-properties-empty-state-icon" />
              </div>
              <h2>{t('myProperties.noPropertiesFound')}</h2>
              <p className="my-properties-empty-state-text">{t('myProperties.noPropertiesText')}</p>
              <button className="my-properties-empty-state-btn" onClick={() => setIsModalOpen(true)}>
                <FiPlus size={20} />
                {t('myProperties.addFirstProperty')}
              </button>
            </div>
          )}

        </main>
        <Footer />
      </div>

      {isModalOpen && (
        <AddPropertyModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default MyProperties;