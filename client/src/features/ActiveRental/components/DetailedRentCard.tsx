import React from 'react';
import './DetailedRentCard.css';
import { FaCalendarAlt, FaUserTie, FaRulerCombined, FaFileContract } from 'react-icons/fa';

const DetailedRentCard = ({ rental }: any) => {
    return (
        <div className="detailed-card">
            <div className="card-image-section">
                <img src={rental.image} alt={rental.title} />
                <div className="status-badge">Active Lease</div>
            </div>
            <div className="card-info-section">
                <h2>{rental.title}</h2>
                <p className="address">{rental.address}</p>
                
                <div className="info-grid">
                    <div className="info-item">
                        <FaUserTie className="icon" />
                        <div>
                            <label>Landlord</label>
                            <p>{rental.landlord}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <FaCalendarAlt className="icon" />
                        <div>
                            <label>Lease Period</label>
                            <p>{rental.leaseStart} - {rental.leaseEnd}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <FaRulerCombined className="icon" />
                        <div>
                            <label>Space</label>
                            <p>{rental.sqft} Sq Ft</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <FaFileContract className="icon" />
                        <div>
                            <label>Agreement</label>
                            <p className="link">View PDF</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedRentCard;