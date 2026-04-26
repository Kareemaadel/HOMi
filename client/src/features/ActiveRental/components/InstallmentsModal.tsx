import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaTimes, FaCheckCircle, FaClock, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';
import contractService, {
    type ContractInstallments,
    type RentInstallmentItem,
    type RentInstallmentStatus,
} from '../../../services/contract.service';
import './InstallmentsModal.css';

interface InstallmentsModalProps {
    contractId: string;
    contractTitle: string;
    onClose: () => void;
    onPaid: () => void;
}

const formatMoney = (amount: number): string =>
    `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDateLabel = (iso: string): string => {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
};

const isWithinNextDays = (from: Date, target: Date, days: number): boolean => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const deltaDays = Math.ceil((target.getTime() - from.getTime()) / msPerDay);
    return deltaDays >= 0 && deltaDays <= days;
};

const getDisplayStatus = (item: RentInstallmentItem, nowIso: string): RentInstallmentStatus => {
    if (item.isPaid || item.status === 'PAID') return 'PAID';
    const now = new Date(nowIso);
    const due = new Date(item.dueDate);
    if (Number.isNaN(now.getTime()) || Number.isNaN(due.getTime())) return item.status;
    if (due < now) return 'OVERDUE';
    if (isWithinNextDays(now, due, 30)) return 'DUE';
    return 'UPCOMING';
};

const statusBadge = (status: RentInstallmentStatus) => {
    if (status === 'PAID') return { label: 'Paid', className: 'paid', icon: <FaCheckCircle /> };
    if (status === 'OVERDUE') return { label: 'Overdue', className: 'overdue', icon: <FaExclamationTriangle /> };
    if (status === 'DUE') return { label: 'Due', className: 'due', icon: <FaClock /> };
    return { label: 'Upcoming', className: 'upcoming', icon: <FaCalendarAlt /> };
};

const InstallmentsModal: React.FC<InstallmentsModalProps> = ({ contractId, contractTitle, onClose, onPaid }) => {
    const [data, setData] = useState<ContractInstallments | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [autopayBusy, setAutopayBusy] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const next = await contractService.getContractInstallments(contractId);
            setData(next);
        } catch (err: any) {
            setErrorMessage(err?.response?.data?.message ?? 'Could not load installments.');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [contractId]);

    useEffect(() => {
        void load();
        const handler = () => { void load(); };
        globalThis.addEventListener('homi:testing-clock-changed', handler);
        return () => globalThis.removeEventListener('homi:testing-clock-changed', handler);
    }, [load]);

    const summary = useMemo(() => {
        if (!data) return null;
        const statusList = data.items.map((item) => getDisplayStatus(item, data.now));
        const payableCount = statusList.filter((status) => status === 'DUE' || status === 'OVERDUE').length;
        const overdueCount = statusList.filter((status) => status === 'OVERDUE').length;
        const totalRentDue = payableCount * data.rentAmount;
        const lateFee = overdueCount * data.lateFeeAmount;
        return {
            totalRentDue,
            lateFee,
            netToPay: data.nextPayableTotal,
            credit: data.pendingLandlordCredit,
            payableCount,
            overdueCount,
        };
    }, [data]);

    const handlePayAll = async () => {
        if (!data || isPaying) return;
        const payableCount = data.items.filter((item) => {
            const status = getDisplayStatus(item, data.now);
            return status === 'DUE' || status === 'OVERDUE';
        }).length;
        if (payableCount <= 0) {
            setErrorMessage('All due installments are already paid.');
            return;
        }
        if (data.walletBalance < data.nextPayableTotal) {
            setErrorMessage('Insufficient wallet balance. Please top up to settle outstanding installments.');
            return;
        }

        const confirmed = globalThis.confirm(
            `Settle ${payableCount} installment(s) for ${formatMoney(data.nextPayableTotal)} from wallet?\n\nThis is processed atomically — if anything fails, no changes are saved.`
        );
        if (!confirmed) return;

        setIsPaying(true);
        setErrorMessage(null);
        try {
            await contractService.payMonthlyRentFromBalance(contractId);
            await load();
            onPaid();
        } catch (err: any) {
            setErrorMessage(err?.response?.data?.message ?? 'Could not complete payment. No charges were made.');
        } finally {
            setIsPaying(false);
        }
    };

    const handleAutopayToggle = async () => {
        if (!data || autopayBusy) return;
        setAutopayBusy(true);
        try {
            const next = await contractService.setContractAutopay(contractId, !data.autopayEnabled);
            setData((prev) => (prev ? { ...prev, autopayEnabled: next.autopayEnabled } : prev));
        } catch (err: any) {
            setErrorMessage(err?.response?.data?.message ?? 'Could not update autopay setting.');
        } finally {
            setAutopayBusy(false);
        }
    };

    return (
        <div className="installments-modal-overlay" onClick={onClose}>
            <div className="installments-modal" onClick={(e) => e.stopPropagation()}>
                <header className="installments-modal-header">
                    <div>
                        <span className="installments-eyebrow">Rent Schedule</span>
                        <h2>{contractTitle}</h2>
                        <p className="installments-subtitle">
                            Atomic, month-by-month payment ledger. You can't skip a month or pay one twice.
                        </p>
                    </div>
                    <button type="button" className="installments-close" onClick={onClose} aria-label="Close">
                        <FaTimes />
                    </button>
                </header>

                {isLoading && (
                    <div className="installments-state">Loading installments...</div>
                )}

                {!isLoading && data && (
                    <>
                        <section className="installments-summary">
                            <div className="installments-summary-row">
                                <div className="summary-pill">
                                    <span>Wallet Balance</span>
                                    <strong>{formatMoney(data.walletBalance)}</strong>
                                </div>
                                <div className="summary-pill">
                                    <span>Paid</span>
                                    <strong>{data.paidInstallments} / {data.leaseDurationMonths}</strong>
                                </div>
                                <div className="summary-pill">
                                    <span>Outstanding</span>
                                    <strong>{data.outstandingInstallments}</strong>
                                </div>
                                <div className="summary-pill">
                                    <span>Overdue</span>
                                    <strong className={data.overdueInstallments > 0 ? 'danger' : ''}>
                                        {data.overdueInstallments}
                                    </strong>
                                </div>
                            </div>

                            <label className="autopay-row">
                                <input
                                    type="checkbox"
                                    checked={data.autopayEnabled}
                                    onChange={handleAutopayToggle}
                                    disabled={autopayBusy}
                                />
                                <span>
                                    <strong>Autopay</strong>
                                    <small>
                                        When enabled, the wallet automatically pays each due installment as it falls due.
                                    </small>
                                </span>
                            </label>
                        </section>

                        <div className="installments-table-wrapper">
                            <table className="installments-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Month</th>
                                        <th>Due Date</th>
                                        <th>Rent</th>
                                        <th>Late Fee</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((item: RentInstallmentItem) => {
                                        const badge = statusBadge(getDisplayStatus(item, data.now));
                                        return (
                                            <tr key={item.index} className={`row-${badge.className}`}>
                                                <td>{item.index + 1}</td>
                                                <td>{item.label}</td>
                                                <td>{formatDateLabel(item.dueDate)}</td>
                                                <td>{formatMoney(item.rentAmount)}</td>
                                                <td>{item.lateFeeAmount > 0 ? formatMoney(item.lateFeeAmount) : '—'}</td>
                                                <td>{formatMoney(item.totalAmount)}</td>
                                                <td>
                                                    <span className={`row-status-pill ${badge.className}`}>
                                                        {badge.icon} {badge.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {summary && summary.payableCount > 0 && (
                            <section className="installments-totals">
                                <div className="installments-totals-row">
                                    <span>Outstanding rent ({summary.payableCount} months)</span>
                                    <strong>{formatMoney(summary.totalRentDue)}</strong>
                                </div>
                                {summary.lateFee > 0 && (
                                    <div className="installments-totals-row warn">
                                        <span>Late fees ({summary.overdueCount} overdue)</span>
                                        <strong>{formatMoney(summary.lateFee)}</strong>
                                    </div>
                                )}
                                {summary.credit > 0 && (
                                    <div className="installments-totals-row credit">
                                        <span>Landlord maintenance credit</span>
                                        <strong>−{formatMoney(summary.credit)}</strong>
                                    </div>
                                )}
                                <div className="installments-totals-row total">
                                    <span>Total to debit</span>
                                    <strong>{formatMoney(summary.netToPay)}</strong>
                                </div>
                            </section>
                        )}

                        {errorMessage && (
                            <div className="installments-error">{errorMessage}</div>
                        )}

                        <footer className="installments-footer">
                            <button type="button" className="installments-btn ghost" onClick={onClose} disabled={isPaying}>
                                Close
                            </button>
                            <button
                                type="button"
                                className="installments-btn primary"
                                onClick={handlePayAll}
                                disabled={isPaying || !summary || summary.payableCount <= 0}
                            >
                                {isPaying
                                    ? 'Processing...'
                                    : !summary || summary.payableCount <= 0
                                        ? 'No Outstanding Dues'
                                        : `Pay ${formatMoney(data.nextPayableTotal)} From Wallet`}
                            </button>
                        </footer>
                    </>
                )}

                {!isLoading && !data && errorMessage && (
                    <div className="installments-error" style={{ marginTop: 16 }}>{errorMessage}</div>
                )}
            </div>
        </div>
    );
};

export default InstallmentsModal;
