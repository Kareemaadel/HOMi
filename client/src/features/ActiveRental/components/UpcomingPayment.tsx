import './UpcomingPayment.css';
import { FaArrowRight } from 'react-icons/fa';

const UpcomingPayment = ({
    amount,
    dueDate,
    dueInLabel,
    dueTone,
    onPayNow,
    onTopUp,
    isPaying,
    isCurrentCyclePaid,
    outstandingInstallments,
    estimatedLateFee,
    totalDue,
}: {
    amount: number;
    dueDate: string;
    dueInLabel: string;
    dueTone: 'safe' | 'urgent';
    onPayNow: () => void;
    onTopUp: () => void;
    isPaying: boolean;
    isCurrentCyclePaid: boolean;
    outstandingInstallments: number;
    estimatedLateFee: number;
    totalDue: number;
}) => {
    const hasOutstanding = outstandingInstallments > 0;
    return (
        <div className="payment-card">
            <div className="payment-header">
                <h3>Upcoming Payment</h3>
                <span className={`due-tag ${dueTone}`}>Due in {dueInLabel}</span>
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
                    <strong>Wallet Balance</strong>
                </div>
                {outstandingInstallments > 1 && (
                    <div className="detail-row arrears">
                        <span>Outstanding Months</span>
                        <strong>{outstandingInstallments} installments</strong>
                    </div>
                )}
                {estimatedLateFee > 0 && (
                    <div className="detail-row arrears">
                        <span>Estimated Late Fees</span>
                        <strong>${estimatedLateFee.toLocaleString()}</strong>
                    </div>
                )}
            </div>
            {hasOutstanding && (
                <div className="payment-total-line">
                    <span>Total:</span>
                    <strong>${totalDue.toLocaleString()}</strong>
                </div>
            )}
            <button className="pay-now-btn" onClick={onPayNow} disabled={isPaying || isCurrentCyclePaid}>
                {isCurrentCyclePaid ? 'No Outstanding Dues' : isPaying ? 'Processing...' : 'Pay Now'} {!isPaying && !isCurrentCyclePaid && <FaArrowRight />}
            </button>
            <button className="pay-now-btn secondary" onClick={onTopUp} disabled={isPaying}>
                Top Up Wallet
            </button>
            <p className="autopay-note">
                {outstandingInstallments > 1
                    ? 'Arrears detected: payment will settle all unpaid months up to current cycle.'
                    : 'Once this month rent is paid, next due date moves to the following monthly cycle.'}
            </p>
        </div>
    );
};

export default UpcomingPayment;