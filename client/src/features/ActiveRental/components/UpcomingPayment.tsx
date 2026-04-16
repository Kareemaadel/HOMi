import './UpcomingPayment.css';
import { FaArrowRight } from 'react-icons/fa';

const UpcomingPayment = ({
    amount,
    dueDate,
    dueInLabel,
}: {
    amount: number;
    dueDate: string;
    dueInLabel: string;
}) => {
    return (
        <div className="payment-card">
            <div className="payment-header">
                <h3>Upcoming Payment</h3>
                <span className="due-tag">Due in {dueInLabel}</span>
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
                    <strong>Not available</strong>
                </div>
            </div>
            <button className="pay-now-btn">
                Pay Now <FaArrowRight />
            </button>
            <p className="autopay-note">Autopay status is not available yet.</p>
        </div>
    );
};

export default UpcomingPayment;