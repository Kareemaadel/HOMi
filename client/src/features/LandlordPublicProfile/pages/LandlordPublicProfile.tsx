import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiHome } from 'react-icons/fi';
import Header from '../../../components/global/header';
import TenantSidebar from '../../../components/global/Tenant/sidebar';
import LandlordSidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import { authService } from '../../../services/auth.service';
import propertyService from '../../../services/property.service';
import { mapPropertyToUI, type BrowsePropertyUI } from '../../BrowseProperties/pages/BrowseProperties';
import PropertyCard from '../../BrowseProperties/components/PropertyCard';
import PropertyDetailModal from '../../BrowseProperties/components/PropertyDetailedModal';
import '../../BrowseProperties/pages/BrowseProperties.css';
import './LandlordPublicProfile.css';

const LandlordPublicProfile = () => {
  const { landlordId } = useParams<{ landlordId: string }>();
  const navigate = useNavigate();
  const role = authService.getCurrentUser()?.user?.role;
  const Sidebar = role === 'LANDLORD' ? LandlordSidebar : TenantSidebar;

  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    isVerified: boolean;
  } | null>(null);
  const [listings, setListings] = useState<BrowsePropertyUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<BrowsePropertyUI | null>(null);

  const load = useCallback(async () => {
    if (!landlordId) {
      setError('Invalid profile link.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [profileRes, propsRes] = await Promise.all([
        propertyService.getPublicLandlordProfile(landlordId),
        propertyService.getAllProperties({
          landlordId,
          status: 'AVAILABLE',
          page: 1,
          limit: 100,
        }),
      ]);

      setProfile(profileRes.data);
      setListings(propsRes.data.map(mapPropertyToUI));
    } catch {
      setProfile(null);
      setListings([]);
      setError('We could not load this landlord profile. They may not exist or may not be a HOMi landlord.');
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() || 'Landlord' : '';
  const avatarSrc =
    profile?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Landlord')}&background=0f172a&color=ffffff&size=128`;

  return (
    <div className="layout-wrapper">
      {!selectedProperty && <Sidebar />}
      <div className="main-content">
        <Header />
        <div className="landlord-public-page">
          <button type="button" className="lpp-back" onClick={() => navigate(-1)}>
            <FiArrowLeft aria-hidden />
            Back
          </button>

          {loading && <div className="lpp-loading">Loading profile…</div>}

          {!loading && error && <div className="lpp-error">{error}</div>}

          {!loading && !error && profile && (
            <>
              <header className="lpp-hero">
                <img className="lpp-avatar" src={avatarSrc} alt="" />
                <div className="lpp-hero-text">
                  <h1>{displayName}</h1>
                  <p>Properties listed on HOMi</p>
                  {profile.isVerified ? (
                    <div className="lpp-verified-pill">
                      <FiCheckCircle aria-hidden size={14} />
                      Verified on HOMi
                    </div>
                  ) : null}
                </div>
              </header>

              <section className="lpp-portfolio">
                <div className="lpp-section-header">
                  <div className="lpp-title-group">
                    <div className="lpp-header-icon">
                      <FiHome size={20} />
                    </div>
                    <h2>Listings on HOMi</h2>
                    <span className="lpp-count-badge">{listings.length} available</span>
                  </div>
                </div>

                {listings.length === 0 ? (
                  <p className="lpp-empty">This landlord does not have any active listings right now.</p>
                ) : (
                  <div className="lpp-properties-grid">
                    {listings.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onOpenDetails={() => setSelectedProperty(property)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
        <Footer />
      </div>

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          isGuest={!authService.getCurrentUser()}
        />
      )}
    </div>
  );
};

export default LandlordPublicProfile;
