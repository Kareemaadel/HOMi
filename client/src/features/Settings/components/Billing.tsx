import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import './Billing.css';
import { FaCreditCard, FaDownload, FaHistory, FaBoxOpen, FaPlus } from 'react-icons/fa';
import CreditCardModal from '../../TenantPayment/components/CreditCardModal';
import paymentMethodService, { type SavedPaymentMethod } from '../../../services/payment-method.service';
import authService from '../../../services/auth.service';
import contractService, { type LandlordContract } from '../../../services/contract.service';

interface BillingInvoice {
    id: string;
    dateLabel: string;
    ref: string;
    amount: number;
}

const formatMoney = (amount: number): string =>
    `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value: string): string => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
};

const Billing: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
    const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
    const [billingError, setBillingError] = useState<string | null>(null);

    const currentUser = authService.getCurrentUser();
    const role = currentUser?.user?.role;

    useEffect(() => {
        let mounted = true;

        const getContractPaymentStatus = (contract: LandlordContract): string => {
            return ((contract as unknown as { paymentStatus?: string }).paymentStatus || 'PENDING').toUpperCase();
        };

        const loadBillingData = async () => {
            setIsLoading(true);
            setBillingError(null);

            try {
                const methodsPromise = paymentMethodService.getMyMethods();
                const contractsPromise = role === 'LANDLORD'
                    ? contractService.getLandlordContracts({ page: 1, limit: 50 })
                    : contractService.getTenantContracts({ page: 1, limit: 50 });

                const [fetchedMethods, contractsResponse] = await Promise.all([methodsPromise, contractsPromise]);
                if (!mounted) return;

                const contracts = contractsResponse.data ?? [];
                const paidContracts = contracts
                    .filter((contract) => getContractPaymentStatus(contract) === 'PAID')
                    .sort((a, b) => {
                        const left = new Date(b.landlordSignedAt || b.createdAt).getTime();
                        const right = new Date(a.landlordSignedAt || a.createdAt).getTime();
                        return left - right;
                    })
                    .slice(0, 5);

                const invoiceRows: BillingInvoice[] = paidContracts.map((contract) => ({
                    id: contract.id,
                    dateLabel: formatDate(contract.landlordSignedAt || contract.createdAt),
                    ref: contract.contractId || contract.id,
                    amount: Number(contract.rentAmount ?? contract.property?.monthlyPrice ?? 0),
                }));

                setMethods(fetchedMethods);
                setInvoices(invoiceRows);
            } catch {
                if (!mounted) return;
                setBillingError('Unable to load billing details right now.');
                setMethods([]);
                setInvoices([]);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        void loadBillingData();

        return () => {
            mounted = false;
        };
    }, [role]);

    const hasBillingData = methods.length > 0 || invoices.length > 0;
    const isFreePlan = !hasBillingData;
    const primaryMethod = methods.find((method) => method.isDefault) ?? methods[0] ?? null;

    const planLabel = useMemo(() => {
        if (isLoading) return 'Loading plan...';
        if (invoices.length > 0) return 'Billing Activity';
        return 'Free Plan';
    }, [invoices.length, isLoading]);

    const planPriceLabel = useMemo(() => {
        if (isLoading) return '';
        if (invoices.length === 0) return '$0/mo';
        const latestAmount = invoices[0]?.amount ?? 0;
        return `${formatMoney(latestAmount)}/mo`;
    }, [invoices, isLoading]);

    const planSubtitle = useMemo(() => {
        if (isLoading) return 'Fetching your billing details...';
        if (invoices.length > 0) {
            return <>Last invoice date: <strong>{invoices[0].dateLabel}</strong></>;
        }
        return 'No subscription invoices yet.';
    }, [invoices, isLoading]);

    let paymentMethodsContent: React.ReactNode;
    if (isLoading) {
        paymentMethodsContent = (
            <div className="billing-empty-state">
                <p>Loading payment methods...</p>
            </div>
        );
    } else if (primaryMethod) {
        paymentMethodsContent = (
            <div className="method-card">
                <div className="card-brand">{primaryMethod.brand.toUpperCase()}</div>
                <div className="card-details">
                    <p>•••• •••• •••• {primaryMethod.last4}</p>
                    <span>Expires {String(primaryMethod.expMonth).padStart(2, '0')}/{String(primaryMethod.expYear).slice(-2)}</span>
                </div>
                <button className="text-btn">Edit</button>
            </div>
        );
    } else {
        paymentMethodsContent = (
            <div className="billing-empty-state">
                <FaCreditCard className="empty-icon" />
                <p>No payment methods added</p>
            </div>
        );
    }

    let invoicesContent: React.ReactNode;
    if (isLoading) {
        invoicesContent = (
            <div className="billing-empty-state">
                <p>Loading invoices...</p>
            </div>
        );
    } else if (invoices.length > 0) {
        invoicesContent = (
            <div className="invoice-list">
                {invoices.map((invoice) => (
                    <div className="invoice-item" key={invoice.id}>
                        <div className="inv-meta">
                            <strong>{invoice.dateLabel}</strong>
                            <span>{invoice.ref}</span>
                        </div>
                        <div className="inv-amount">{formatMoney(invoice.amount)}</div>
                        <button className="icon-btn" title="Download PDF">
                            <FaDownload />
                        </button>
                    </div>
                ))}
            </div>
        );
    } else {
        invoicesContent = (
            <div className="billing-empty-state">
                <FaBoxOpen className="empty-icon" />
                <p>No billing history yet</p>
            </div>
        );
    }

    return (
        <div className="billing-wrapper animate-fade-in">
            <div className={`current-plan-card ${isFreePlan ? 'free-plan' : ''}`}>
                <div className="plan-info">
                    <span className="plan-badge">
                        {hasBillingData ? 'Billing Summary' : 'Basic Tier'}
                    </span>
                    <h2>
                        {planLabel}
                        <span>{planPriceLabel}</span>
                    </h2>
                    <p>{planSubtitle}</p>
                </div>
                <button className={`upgrade-btn ${isFreePlan ? 'pulse-btn' : ''}`}>
                    {hasBillingData ? 'Manage Billing' : 'Upgrade to Pro'}
                </button>
            </div>

            {billingError && <p className="billing-error">{billingError}</p>}

            <div className="billing-grid">
                <section className="billing-section">
                    <header className="section-header">
                        <h3><FaCreditCard className="icon-blue" /> Payment Methods</h3>
                        <button className="add-method-btn" onClick={() => setIsModalOpen(true)}>
                            <FaPlus /> Add New
                        </button>
                    </header>

                    {paymentMethodsContent}
                </section>

                <section className="billing-section">
                    <header className="section-header">
                        <h3><FaHistory className="icon-blue" /> Recent Invoices</h3>
                    </header>

                    {invoicesContent}
                </section>
            </div>

            {createPortal(
                <CreditCardModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={(created) => {
                        setMethods((prev) => [created, ...prev.filter((m) => m.id !== created.id)]);
                        setIsModalOpen(false);
                    }}
                />,
                document.body
            )}
        </div>
    );
};

export default Billing;