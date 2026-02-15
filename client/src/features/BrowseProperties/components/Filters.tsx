import React from 'react';
import './Filters.css';

const Filters = () => (
    <div className="filter-sidebar">
        <h3 className="filter-title">Filters</h3>
        
        <div className="filter-group">
            <label>Property Type</label>
            <div className="type-chips">
                <span className="chip active">All</span>
                <span className="chip">Apartment</span>
                <span className="chip">Villa</span>
                <span className="chip">Studio</span>
            </div>
        </div>

        <div className="filter-group">
            <label>Price Range</label>
            <div className="range-inputs">
                <input type="number" placeholder="Min" />
                <div className="divider" />
                <input type="number" placeholder="Max" />
            </div>
        </div>

        <div className="filter-group">
            <label>Amenities</label>
            <div className="checkbox-list">
                <label className="cb-container">Gym Center
                    <input type="checkbox" /> <span className="checkmark" />
                </label>
                <label className="cb-container">Swimming Pool
                    <input type="checkbox" /> <span className="checkmark" />
                </label>
                <label className="cb-container">Pet Friendly
                    <input type="checkbox" /> <span className="checkmark" />
                </label>
            </div>
        </div>

        <button className="apply-filters-btn">Update Results</button>
    </div>
);

export default Filters;