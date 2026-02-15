import React from 'react';
import { FaSearch, FaMapMarkerAlt, FaHome, FaDollarSign } from 'react-icons/fa';
import './SearchHero.css';

const SearchHero: React.FC = () => {
    return (
        <div className="search-hero">
            <div className="hero-overlay">
                <div className="hero-content">
                    <h1>Find your next <span className="text-gradient">Dream Home</span></h1>
                    <p>Discover over 5,000+ premium properties curated just for you.</p>
                    
                    <div className="glass-search-container">
                        <div className="search-input-group">
                            <FaMapMarkerAlt className="input-icon" />
                            <div className="input-stack">
                                <label>Location</label>
                                <input type="text" placeholder="Where are you going?" />
                            </div>
                        </div>

                        <div className="divider-line" />

                        <div className="search-input-group">
                            <FaHome className="input-icon" />
                            <div className="input-stack">
                                <label>Property Type</label>
                                <select>
                                    <option>Apartment</option>
                                    <option>Modern Villa</option>
                                    <option>Studio Loft</option>
                                </select>
                            </div>
                        </div>

                        <div className="divider-line" />

                        <div className="search-input-group">
                            <FaDollarSign className="input-icon" />
                            <div className="input-stack">
                                <label>Budget</label>
                                <select>
                                    <option>$1,000 - $2,500</option>
                                    <option>$2,500 - $5,000</option>
                                    <option>$5,000+</option>
                                </select>
                            </div>
                        </div>

                        <button className="hero-search-btn">
                            <FaSearch /> <span>Search</span>
                        </button>
                    </div>

                    <div className="hero-tags">
                        <span>Popular:</span>
                        <button>New York</button>
                        <button>Miami</button>
                        <button>Los Angeles</button>
                        <button>Chicago</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchHero;