import React from 'react';
import { FaCreditCard, FaCalendarAlt, FaChevronRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { LandlordContract, RentDueDate } from '../../../../services/contract.service';
import { formatDateLabel, getRentCycleSummary } from '../../../TenantPayment/utils/rentSchedule';
import './UpcomingPayments.css';

interface UpcomingPaymentsProps {
  contract: LandlordContract | null;
  referenceDate?: Date;
}

const getDueDayFromContract = (rentDueDate: RentDueDate | null): number => {
  if (rentDueDate === '1ST_OF_MONTH') return 1;
  if (rentDueDate === '5TH_OF_MONTH') return 5;
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

const getDueInLabel = (rentDueDate: RentDueDate | null): string => {
  const dueDay = getDueDayFromContract(rentDueDate);
  const now = new Date();
  const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);

  if (dueDate < now) {
    dueDate.setMonth(dueDate.getMonth() + 1);
  }

  const diffDays = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
};

const getPeriodLabel = (): string => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};

export const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ contract, referenceDate }) => {
  const navigate = useNavigate();

  const amount = Number(contract?.rentAmount ?? contract?.property?.monthlyPrice ?? 0);
  const cycle = contract ? getRentCycleSummary(contract, referenceDate) : null;
  const dueDate = cycle
    ? `Due ${formatDateLabel(cycle.dueDate)}`
    : getDueInLabel(contract?.rentDueDate ?? null);
  const paymentState = cycle
    ? (cycle.isPaidForCurrentCycle ? 'Paid for current cycle' : `Due in ${cycle.daysUntilDue} day${cycle.daysUntilDue === 1 ? '' : 's'}`)
    : 'No active lease';
  const isAutopay = false;
  const hasLinkedMethod = false;

  return (
    <div className="card-base payment-premium-card">
      <div className="payment-main-content">
        <header className="payment-header">
          <span className="type-badge">Rent Payment</span>
          <div className="due-status-indicator">
            {cycle?.isPaidForCurrentCycle ? <FaCheckCircle className="pulse-icon" /> : <FaExclamationCircle className="pulse-icon" />}
            <span>{paymentState}</span>
          </div>
        </header>
        
        <div className="amount-display">
          <div className="amount-main">
            <span className="currency-symbol">$</span>
            <span className="amount-value">{amount.toLocaleString()}</span>
            <span className="amount-fraction">.00</span>
          </div>
          <p className="billing-label">
            <FaCalendarAlt className="icon-subtle" /> {dueDate} - Period: {getPeriodLabel()}
          </p>
        </div>

        <footer className="payment-meta-footer">
          <div className="meta-item">
            <span className="meta-label">Method</span>
            <div className="meta-value">
              <FaCreditCard className="card-icon" /> 
              <span>{hasLinkedMethod ? 'Card on file' : 'Not connected'}</span>
            </div>
          </div>
          <div className="meta-item">
            <span className="meta-label">Autopay</span>
            <div className={`meta-value autopay-status ${isAutopay ? 'active' : 'inactive'}`}>
              {isAutopay ? <FaCheckCircle /> : null}
              <span>{isAutopay ? 'Active' : 'Disabled'}</span>
            </div>
          </div>
        </footer>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="payment-action-inline"
            aria-label="Open payments page"
            onClick={() => navigate('/tenant-payment')}
          >
            <FaCreditCard className="pay-icon" />
            <span>Open Payments</span>
            <FaChevronRight className="arrow-icon" />
          </button>
          <button
            className="payment-action-inline"
            aria-label="Open maintenance page"
            onClick={() => navigate('/maintenance-requests')}
          >
            <span>Maintenance</span>
            <FaChevronRight className="arrow-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingPayments;