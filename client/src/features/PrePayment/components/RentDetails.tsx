// client\src\features\PrePayment\components\RentDetails.tsx
import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import './RentDetails.css';

interface Props {
    monthlyRent: number;
    isFullPayment: boolean;
    setIsFullPayment: (val: boolean) => void;
    duration: number;
}

const RentDetails: React.FC<Props> = ({ monthlyRent, isFullPayment, setIsFullPayment, duration }) => (
    <div className="rent-card animate-in">
        <div className="card-header">
            <div className="icon-wrapper"><FaCalendarAlt /></div>
            <h3>Rental Period</h3>
        </div>
        
        <div className="toggle-container">
            <button 
                className={`toggle-btn ${!isFullPayment ? 'active' : ''}`}
                onClick={() => setIsFullPayment(false)}
            >
                Monthly
            </button>
            <button 
                className={`toggle-btn ${isFullPayment ? 'active' : ''}`}
                onClick={() => setIsFullPayment(true)}
            >
                Full Term ({duration} Mo.)
            </button>
        </div>

        <div className="price-breakdown">
            <span className="label">Current Commitment</span>
            <span className="amount">
                ${(isFullPayment ? monthlyRent * duration : monthlyRent).toLocaleString()}
            </span>
        </div>
    </div>
);

export default RentDetails;