import React, { useState, useRef, useEffect } from 'react';
import './DetailedRentCard.css';
import { 
  FaCalendarAlt, FaUserCircle, 
  FaFileDownload, FaMapMarkerAlt, FaGavel, FaTimes, FaHome 
} from 'react-icons/fa';

interface RentalProps {
  rental: {
    title: string;
    address: string;
    landlord: string;
    leaseStart: string;
    leaseEnd: string;
    sqft: number;
        image: string | null;
        propertyType?: string;
        houseRules: string[];
  };
}

const DetailedRentCard: React.FC<RentalProps> = ({ rental }) => {
    const [showRules, setShowRules] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setShowRules(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const houseRules = rental.houseRules;
    const locationBadge = rental.address.split(',')[1]?.trim() || rental.address;

    return (
        <div className="premium-detailed-card animate-fade-in">
            <div className="card-visual-side">
                {rental.image ? (
                    <img src={rental.image} alt={rental.title} className="hero-rental-img" />
                ) : (
                    <div className="hero-rental-img placeholder-rental-img" aria-label="Property image unavailable">
                        <FaHome />
                        <span>No property image uploaded yet</span>
                    </div>
                )}
                <div className="glass-status-tag">Active Lease</div>
            </div>

            <div className="card-content-side">
                <header className="rental-header">
                    <div className="location-badge">
                        <FaMapMarkerAlt /> {locationBadge}
                    </div>
                    <h2>{rental.title}</h2>
                    <p className="full-address">{rental.address}</p>
                </header>

                <div className="info-grid-modern">
                    <div className="info-tile">
                        <div className="tile-icon"><FaUserCircle /></div>
                        <div className="tile-data">
                            <span className="tile-label">Landlord</span>
                            <span className="tile-value">{rental.landlord}</span>
                        </div>
                    </div>

                    <div className="info-tile">
                        <div className="tile-icon"><FaHome /></div>
                        <div className="tile-data">
                            <span className="tile-label">Type</span>
                            <span className="tile-value">{rental.propertyType || 'Apartment'}</span>
                        </div>
                    </div>

                    <div className="info-tile full-width">
                        <div className="tile-icon"><FaCalendarAlt /></div>
                        <div className="tile-data">
                            <span className="tile-label">Lease Period</span>
                            <span className="tile-value">{rental.leaseStart} — {rental.leaseEnd}</span>
                        </div>
                    </div>
                </div>

                <div className="card-actions-row">
                    <button className="download-contract-btn">
                        <FaFileDownload />
                        <span>Lease Agreement</span>
                    </button>

                    <div className="rules-wrapper">
                        <button 
                            className={`rules-trigger-btn ${showRules ? 'active' : ''}`}
                            onClick={() => setShowRules(!showRules)}
                        >
                            <FaGavel />
                            <span>House Rules</span>
                        </button>

                        {showRules && (
                            <div className="mini-rules-modal" ref={modalRef}>
                                <div className="rules-header">
                                    <span>Property Rules</span>
                                    <FaTimes className="close-rules" onClick={() => setShowRules(false)} />
                                </div>
                                <ul className="rules-list">
                                    {(houseRules.length > 0 ? houseRules : ['No house rules were provided for this property.']).map((rule) => (
                                        <li key={rule}>{rule}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedRentCard;