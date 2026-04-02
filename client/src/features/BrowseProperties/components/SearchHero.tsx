import React, { useState } from 'react';
import { FaSearch, FaHome, FaDollarSign, FaSlidersH, FaCalendarAlt, FaUserFriends, FaCouch } from 'react-icons/fa';
import './SearchHero.css';

export interface FilterParams {
    type?: string;
    furnishing?: string;
    target_tenant?: string;
    minPrice?: number | '';
    maxPrice?: number | '';
    availabilityDate?: string;
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchHero;