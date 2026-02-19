// client\src\features\PrePayment\components\SecurityDeposit.tsx
import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import './SecurityDeposit.css';

const SecurityDeposit: React.FC<{ amount: number }> = ({ amount }) => (
    <div className="deposit-card animate-in delay-1">
        <div className="shield-icon-container">
            <FaShieldAlt />
        </div>
        <div className="deposit-info">
            <h3>Security Deposit</h3>
            <p>100% Refundable via Platform Protection</p>
            <span className="deposit-value">${amount.toLocaleString()}</span>
        </div>
    </div>
);

export default SecurityDeposit;