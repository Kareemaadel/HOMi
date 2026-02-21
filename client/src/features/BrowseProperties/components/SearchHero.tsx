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
                        {/* Location Group */}
                        <div className="search-input-group">
                            <div className="icon-box">
                                <FaMapMarkerAlt className="input-icon" />
                            </div>
                            <div className="input-stack">
                                <label>Location</label>
                                <input type="text" placeholder="Where are you going?" />
                            </div>
                        </div>

                        <div className="divider-line" />

                        {/* Property Type Group */}
                        <div className="search-input-group">
                            <div className="icon-box">
                                <FaHome className="input-icon" />
                            </div>
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

                        {/* Budget Group */}
                        <div className="search-input-group">
                            <div className="icon-box">
                                <FaDollarSign className="input-icon" />
                            </div>
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
                        <button>Cairo</button>
                        <button>Alexandria</button>
                        <button>Giza</button>
                        <button>North Coast</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchHero;