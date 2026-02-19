// Combined into two files logically, but keeping logic separate as requested
import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';


const TotalAmount: React.FC<{ total: number }> = ({ total }) => (
    <div className="total-display-premium">
        <label className="total-label">Total Amount Due</label>
        <div className="total-amount-wrapper">
            <span className="currency-symbol">$</span>
            <h2 className="main-total">{total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
        </div>
        <p className="total-disclaimer">Local taxes may apply during checkout</p>
    </div>
);

export default TotalAmount;