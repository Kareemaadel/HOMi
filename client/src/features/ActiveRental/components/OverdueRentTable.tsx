import { useMemo } from 'react';
import { FaExclamationTriangle, FaArrowRight, FaClock, FaCalendarAlt } from 'react-icons/fa';
import type { ContractInstallments, RentInstallmentItem } from '../../../services/contract.service';
import './OverdueRentTable.css';

interface OverdueRentTableProps {
    installments: ContractInstallments;
    onPayNow: () => void;
    isPaying: boolean;
}

const formatMoney = (amount: number): string =>
    `$${Number(amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDateLabel = (iso: string): string => {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
};

/**
 * Inline arrears table that automatically appears in ActiveRental when the
 * tenant has more than one outstanding rent installment (or any overdue one).
 * It highlights overdue months in red, lists late fees per month, and exposes
 * a single "Pay All Now" action that funnels back through the existing
 * wallet-based settlement modal.
 */
const OverdueRentTable = ({ installments, onPayNow, isPaying }: OverdueRentTableProps) => {
    const unpaidItems = useMemo<RentInstallmentItem[]>(
        () => installments.items.filter((item) => item.status === 'OVERDUE' || item.status === 'DUE'),
        [installments.items]
    );

    const overdueCount = useMemo(
        () => unpaidItems.filter((item) => item.status === 'OVERDUE').length,
        [unpaidItems]
    );

    const totalRent = installments.rentAmount * unpaidItems.length;
    const totalLateFees = unpaidItems.reduce((sum, item) => sum + Number(item.lateFeeAmount ?? 0), 0);
    const totalDue = Number(installments.nextPayableTotal ?? totalRent + totalLateFees);

    const headlineCount = unpaidItems.length;
    const headline = overdueCount > 0
        ? `${overdueCount} overdue rent payment${overdueCount === 1 ? '' : 's'}`
        : `${headlineCount} unpaid rent installment${headlineCount === 1 ? '' : 's'}`;

    return (
        <section className="overdue-rent-card" aria-live="polite">
            <header className="overdue-rent-header">
                <div className="overdue-rent-headline">
                    <span className="overdue-rent-icon">
                        <FaExclamationTriangle aria-hidden="true" />
                    </span>
                    <div>
                        <span className="overdue-rent-eyebrow">Action Required</span>
                        <h3>{headline}</h3>
                        <p>
                            {overdueCount > 0
                                ? 'You have rent payments past their due date. Late fees have been added to the months below.'
                                : 'You have multiple rent payments waiting to be settled. Clear them now to keep your lease in good standing.'}
                        </p>
                    </div>
                </div>
                <div className="overdue-rent-total">
                    <span>Total to pay</span>
                    <strong>{formatMoney(totalDue)}</strong>
                </div>
            </header>

            <div className="overdue-rent-table-wrapper">
                <table className="overdue-rent-table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Due Date</th>
                            <th>Rent</th>
                            <th>Late Fee</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {unpaidItems.map((item) => {
                            const isOverdue = item.status === 'OVERDUE';
                            return (
                                <tr key={item.index} className={isOverdue ? 'overdue-row' : 'due-row'}>
                                    <td>{item.label}</td>
                                    <td>{formatDateLabel(item.dueDate)}</td>
                                    <td>{formatMoney(item.rentAmount)}</td>
                                    <td>{item.lateFeeAmount > 0 ? formatMoney(item.lateFeeAmount) : '—'}</td>
                                    <td><strong>{formatMoney(item.totalAmount)}</strong></td>
                                    <td>
                                        <span className={`overdue-row-pill ${isOverdue ? 'overdue' : 'due'}`}>
                                            {isOverdue
                                                ? (<><FaExclamationTriangle aria-hidden="true" /> Overdue</>)
                                                : (<><FaClock aria-hidden="true" /> Due</>)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="overdue-rent-summary">
                <div className="overdue-rent-summary-row">
                    <span><FaCalendarAlt aria-hidden="true" /> Outstanding rent ({headlineCount} month{headlineCount === 1 ? '' : 's'})</span>
                    <strong>{formatMoney(totalRent)}</strong>
                </div>
                {totalLateFees > 0 && (
                    <div className="overdue-rent-summary-row warn">
                        <span>Late fees ({overdueCount} overdue)</span>
                        <strong>{formatMoney(totalLateFees)}</strong>
                    </div>
                )}
                {installments.pendingLandlordCredit > 0 && (
                    <div className="overdue-rent-summary-row credit">
                        <span>Landlord maintenance credit</span>
                        <strong>−{formatMoney(installments.pendingLandlordCredit)}</strong>
                    </div>
                )}
                <div className="overdue-rent-summary-row total">
                    <span>Total to debit</span>
                    <strong>{formatMoney(totalDue)}</strong>
                </div>
            </div>

            <button
                type="button"
                className="overdue-rent-pay-btn"
                onClick={onPayNow}
                disabled={isPaying || headlineCount <= 0}
            >
                {isPaying
                    ? 'Processing...'
                    : (<>Pay {formatMoney(totalDue)} Now <FaArrowRight aria-hidden="true" /></>)}
            </button>
            <p className="overdue-rent-fineprint">
                Payment is settled atomically from your wallet balance. If anything fails, no charge is applied.
            </p>
        </section>
    );
};

export default OverdueRentTable;
