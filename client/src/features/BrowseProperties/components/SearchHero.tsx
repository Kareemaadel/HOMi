import React, { useState, useEffect } from 'react';
import { FaSearch, FaHome, FaDollarSign, FaSlidersH, FaCalendarAlt, FaUserFriends, FaCouch, FaMapMarkedAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import './SearchHero.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const EGYPT_BOUNDS = L.latLngBounds(
  L.latLng(21.9, 24.6), 
  L.latLng(31.7, 36.9)
);

const SearchField = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    // @ts-ignore
    const geocoder = L.Control.Geocoder.nominatim();
    // @ts-ignore
    const control = L.Control.geocoder({
      geocoder,
      defaultMarkGeocode: false,
      placeholder: "Search in Egypt...",
    })
      .on('markgeocode', (e: any) => {
        const { center } = e.geocode;
        if (EGYPT_BOUNDS.contains(center)) {
          map.setView(center, 12);
          onLocationSelect(center.lat, center.lng);
        } else {
          alert("Please select a location within Egypt.");
        }
      })
      .addTo(map);
    return () => { map.removeControl(control); };
  }, [map, onLocationSelect]);
  return null;
};

const MapEventsHandler = ({ position, onLocationSelect, radiusKm }: any) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setMaxBounds(EGYPT_BOUNDS);
  }, [map]);
  useMapEvents({
    click(e) {
      if (EGYPT_BOUNDS.contains(e.latlng)) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  
  if (!position) return null;
  return (
    <>
      <Marker position={[position.lat, position.lng]} />
      <Circle 
        center={[position.lat, position.lng]} 
        radius={radiusKm * 1000} // Convert km to meters
        pathOptions={{ fillColor: '#3b82f6', color: '#1d4ed8', weight: 2 }}
      />
    </>
  );
};

export interface FilterParams {
    type?: string;
    furnishing?: string;
    target_tenant?: string;
    minPrice?: number | '';
    maxPrice?: number | '';
    availabilityDate?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
}

interface SearchHeroProps {
    onSearch: (filters: FilterParams) => void;
}

const SearchHero: React.FC<SearchHeroProps> = ({ onSearch }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState<FilterParams>({
        type: '',
        furnishing: '',
        target_tenant: '',
        minPrice: '',
        maxPrice: '',
        availabilityDate: '',
    });
    const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
    const [radiusKm, setRadiusKm] = useState<number>(5);
    const [isMapActive, setIsMapActive] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: name === 'minPrice' || name === 'maxPrice' ? (value ? Number(value) : '') : value
        }));
    };

    const handleSearchClick = () => {
        const cleanedFilters: FilterParams = {};
        if (filters.type) cleanedFilters.type = filters.type;
        if (filters.furnishing) cleanedFilters.furnishing = filters.furnishing;
        if (filters.target_tenant) cleanedFilters.target_tenant = filters.target_tenant;
        if (filters.minPrice !== '') cleanedFilters.minPrice = filters.minPrice;
        if (filters.maxPrice !== '') cleanedFilters.maxPrice = filters.maxPrice;
        if (filters.availabilityDate) cleanedFilters.availabilityDate = filters.availabilityDate;
        
        if (position) {
            cleanedFilters.lat = position.lat;
            cleanedFilters.lng = position.lng;
            cleanedFilters.radiusKm = radiusKm;
        }

        onSearch(cleanedFilters);
    };

    return (
        <div className={`search-hero ${showAdvanced ? 'advanced-open' : ''}`}>
            <div className="hero-overlay">
                <div className="hero-content">
                    <h1>Find your next <span className="text-gradient">Dream Home</span></h1>
                    <p>Discover over 5,000+ premium properties curated just for you.</p>
                    
                    <div className="glass-search-container">
                        {/* Property Type Group */}
                        <div className="search-input-group">
                            <div className="icon-box">
                                <FaHome className="input-icon" />
                            </div>
                            <div className="input-stack">
                                <label>Property Type</label>
                                <select name="type" value={filters.type} onChange={handleChange}>
                                    <option value="">Any Type</option>
                                    <option value="APARTMENT">Apartment</option>
                                    <option value="VILLA">Villa</option>
                                    <option value="STUDIO">Studio</option>
                                    <option value="CHALET">Chalet</option>
                                </select>
                            </div>
                        </div>

                        <div className="divider-line" />

                        {/* Budget Min Group */}
                        <div className="search-input-group small-input">
                            <div className="icon-box">
                                <FaDollarSign className="input-icon" />
                            </div>
                            <div className="input-stack">
                                <label>Min Price</label>
                                <input type="number" name="minPrice" placeholder="No min ($)" value={filters.minPrice} onChange={handleChange} min={0} />
                            </div>
                        </div>

                        <div className="divider-line" />

                        {/* Budget Max Group */}
                        <div className="search-input-group small-input">
                            <div className="icon-box">
                                <FaDollarSign className="input-icon" />
                            </div>
                            <div className="input-stack">
                                <label>Max Price</label>
                                <input type="number" name="maxPrice" placeholder="No max ($)" value={filters.maxPrice} onChange={handleChange} min={0} />
                            </div>
                        </div>

                        <button className="hero-search-btn" onClick={handleSearchClick}>
                            <FaSearch /> <span>Search</span>
                        </button>
                    </div>

                    <div className="advanced-filters-toggle">
                        <button onClick={() => setShowAdvanced(!showAdvanced)} className="btn-advanced-toggle">
                            <FaSlidersH /> {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                        </button>
                    </div>

                    {showAdvanced && (
                        <div className="advanced-filters-pane">
                            <div className="adv-filter-grid">
                                <div className="adv-filter-item">
                                    <label><FaCouch /> Furnishing</label>
                                    <select name="furnishing" value={filters.furnishing} onChange={handleChange}>
                                        <option value="">Any</option>
                                        <option value="Fully">Fully</option>
                                        <option value="Semi">Semi</option>
                                        <option value="Unfurnished">Unfurnished</option>
                                    </select>
                                </div>
                                <div className="adv-filter-item">
                                    <label><FaUserFriends /> Target Tenant</label>
                                    <select name="target_tenant" value={filters.target_tenant} onChange={handleChange}>
                                        <option value="">Any</option>
                                        <option value="STUDENTS">Students</option>
                                        <option value="FAMILIES">Families</option>
                                        <option value="TOURISTS">Tourists</option>
                                    </select>
                                </div>
                                <div className="adv-filter-item">
                                    <label><FaCalendarAlt /> Availability Date</label>
                                    <input type="date" name="availabilityDate" value={filters.availabilityDate} onChange={handleChange} />
                                </div>
                            </div>
                            
                            <div className="adv-map-section">
                                <label><FaMapMarkedAlt /> Where do you want to live?</label>
                                <div className="map-radius-control">
                                    <span>Search Radius: <strong>{radiusKm} km</strong></span>
                                    <input 
                                        type="range" 
                                        min="1" max="50" step="1" 
                                        value={radiusKm} 
                                        onChange={(e) => setRadiusKm(Number(e.target.value))} 
                                    />
                                </div>
                                <div className="map-picker-container">
                                    {!isMapActive ? (
                                        <div className="map-placeholder" onClick={() => setIsMapActive(true)}>
                                            <FaMapMarkedAlt size={40} />
                                            {position ? (
                                              <div className="coord-badge">
                                                Location Selected. Radius: {radiusKm}km
                                              </div>
                                            ) : (
                                              <p>Click to open interactive map</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="leaflet-wrapper" style={{ height: '300px', width: '100%', position: 'relative', borderRadius: '15px', overflow: 'hidden' }}>
                                            <MapContainer 
                                              center={position ? [position.lat, position.lng] : [30.0444, 31.2357]} 
                                              zoom={position ? 12 : 6} 
                                              maxBounds={EGYPT_BOUNDS}
                                              style={{ height: '100%', width: '100%' }}
                                            >
                                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                              <SearchField onLocationSelect={(lat, lng) => setPosition({lat, lng})} />
                                              <MapEventsHandler position={position} onLocationSelect={(lat: number, lng: number) => setPosition({lat, lng})} radiusKm={radiusKm} />
                                            </MapContainer>
                                        </div>
                                    )}
                                    {position && (
                                        <button className="clear-location-btn" onClick={() => { setPosition(null); setIsMapActive(false); }}>
                                            Clear Location
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchHero;