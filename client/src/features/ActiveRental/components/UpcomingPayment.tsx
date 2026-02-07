import React from 'react';
import './UpcomingPayment.css';
import { FaArrowRight, FaCreditCard } from 'react-icons/fa';

const UpcomingPayment = ({ amount, dueDate }: { amount: number, dueDate: string }) => {
    return (
        <div className="payment-card">
            <div className="payment-header">
                <h3>Upcoming Payment</h3>
                <span className="due-tag">Due in 5 days</span>
            </div>
            <div className="amount-display">
                <span className="currency">$</span>
                <span className="value">{amount.toLocaleString()}</span>
            </div>
            <div className="payment-details">
                <div className="detail-row">
                    <span>Due Date</span>
                    <strong>{dueDate}</strong>
                </div>
                <div className="detail-row">
                    <span>Payment Method</span>
                    <strong>**** 4242</strong>
                </div>
            </div>
            <button className="pay-now-btn">
                Pay Now <FaArrowRight />
            </button>
            <p className="autopay-note">Autopay is enabled for this rental.</p>
        </div>
    );
};

export default UpcomingPayment;