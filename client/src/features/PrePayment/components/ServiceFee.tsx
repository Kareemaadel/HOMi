// Combined into two files logically, but keeping logic separate as requested
import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

const ServiceFee: React.FC<{ fee: number }> = ({ fee }) => (
    <div className="premium-fee-row">
        <div className="fee-info">
            <div className="fee-title">
             
                <span>Platform Service</span>
            </div>
            <p className="fee-subtext">Includes 24/7 Support & Insurance</p>
        </div>
        <div className="fee-value">
            <span className="fee-perc">2%</span>
            <span className="fee-total">${fee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
    </div>
);

export default ServiceFee;