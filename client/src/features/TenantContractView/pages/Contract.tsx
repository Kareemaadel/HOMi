import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import ActiveLeaseContract from '../components/ActiveLeaseContract';

import { FileText, Clock, Plus, Building2, ChevronRight } from 'lucide-react';
import ContractDetailView from '../components/ContractDetailView';
import contractService, { type LandlordContract as ContractApi } from '../../../services/contract.service';
import './Contract.css';

export type ContractStatus = 'PENDING_TENANT' | 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED';

export interface LeaseContract {
    id: string;
    internalId: string;
    property: string;
    tenant: string;
    landlord: string;
    landlordEmail: string;
    tenantEmail: string;
    amount: number;
    deposit: number;
    status: ContractStatus;
    startDate: string;
    duration: string;
    createdAt: string;
    leaseId: string;
    rentDueDate: string;
    lateFeeAmount: number;
    maxOccupants: number;
    propertyAddress: string;
    propertyType: string;
    propertyFurnishing: string;
    tenantNationalId: string;
    tenantEmergencyContactName: string;
    tenantEmergencyPhone: string;
    maintenanceResponsibilities: Array<{
        area: string;
        responsible_party: 'LANDLORD' | 'TENANT';
    }>;
}

const Contract: React.FC = () => {
    const navigate = useNavigate();
    const [selectedContract, setSelectedContract] = useState<LeaseContract | null>(null);
    const [contracts, setContracts] = useState<LeaseContract[]>([]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const mapStatus = (status: ContractApi['status']): ContractStatus => {
        if (status === 'ACTIVE') return 'ACTIVE';
        if (status === 'TERMINATED' || status === 'EXPIRED') return 'EXPIRED';
        if (status === 'PENDING_PAYMENT') return 'PENDING_PAYMENT';
        return 'PENDING_TENANT';
    };

    const mapContract = (contract: ContractApi): LeaseContract => ({
        id: contract.contractId,
        internalId: contract.id,
        property: contract.property?.title || 'Property',
        tenant: `${contract.tenant?.firstName || ''} ${contract.tenant?.lastName || ''}`.trim() || 'Tenant',
        landlord: `${contract.landlord?.firstName || ''} ${contract.landlord?.lastName || ''}`.trim() || 'Landlord',
        landlordEmail: contract.landlord?.email || '',
        tenantEmail: contract.tenant?.email || '',
        amount: contract.rentAmount || 0,
        deposit: contract.securityDeposit || 0,
        status: mapStatus(contract.status),
        startDate: formatDate(contract.moveInDate),
        duration: `${contract.leaseDurationMonths} Months`,
        createdAt: contract.createdAt,
        leaseId: contract.leaseId || '—',
        rentDueDate: contract.rentDueDate || '1ST_OF_MONTH',
        lateFeeAmount: contract.lateFeeAmount || 0,
        maxOccupants: contract.maxOccupants || 1,
        propertyAddress: contract.property?.address || '—',
        propertyType: contract.property?.type || 'Residential',
        propertyFurnishing: contract.property?.furnishing || 'N/A',
        tenantNationalId: contract.tenantNationalId || '',
        tenantEmergencyContactName: contract.tenantEmergencyContactName || '',
        tenantEmergencyPhone: contract.tenantEmergencyPhone || '',
        maintenanceResponsibilities: contract.property?.maintenanceResponsibilities || [],
    });

    const fetchContracts = useCallback(async () => {
        try {
            const response = await contractService.getTenantContracts({ page: 1, limit: 50 });
            const mapped = (response.data || [])
                .map(mapContract)
                .filter((c) => c.status === 'PENDING_TENANT' || c.status === 'PENDING_PAYMENT' || c.status === 'ACTIVE');
            setContracts(mapped);
        } catch {
            setContracts([]);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchContracts();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchContracts]);

    const hasContracts = contracts.length > 0;

    const getStatusInfo = (status: ContractStatus) => {
        const map = {
            PENDING_TENANT: { label: 'Pending Signature', color: 'blue' },
            PENDING_PAYMENT: { label: 'Pending Payment', color: 'yellow' },
            ACTIVE: { label: 'Active Lease', color: 'green' },
            EXPIRED: { label: 'Expired', color: 'gray' },
        };
        return map[status];
    };

    return (
        <div className="tenant-contract-shell">
            <Sidebar />
            <div className="tenant-contract-content">
                <Header />
                <main className="tenant-contract-hub">
                    <div className="tenant-contract-header">
                        <div>
                            <h1>Lease Agreements</h1>
                            <p>Track, sign, and manage your property contracts.</p>
                        </div>
                        {hasContracts && (
                            <button className="btn-primary"><Plus size={18}/> Browse Properties</button>
                        )}
                    </div>

                    {hasContracts ? (
                        <div className="contract-list-grid">
                            {contracts.map(contract => (
                                <div key={contract.id} className="tenant-contract-card">
                                    <div className="card-status-bar" data-status={contract.status === 'PENDING_TENANT' ? 'signing' : contract.status.toLowerCase()}></div>
                                    <div className="tenant-card-body">
                                        <div className="tenant-card-top">
                                            <span className="contract-id">{contract.id}</span>
                                            <span className={`status-tag ${contract.status === 'PENDING_TENANT' ? 'signing' : contract.status.toLowerCase()}`}>
                                                {getStatusInfo(contract.status).label}
                                            </span>
                                        </div>
                                        <h3>{contract.property}</h3>
                                        <div className="tenant-card-meta">
                                            <div className="meta-item"><Building2 size={14}/> {contract.duration}</div>
                                            <div className="meta-item"><Clock size={14}/> Starts {contract.startDate}</div>
                                        </div>
                                        <div className="tenant-card-footer">
                                            <div className="price-info">
                                                <span className="label">Monthly Rent</span>
                                                <span className="value">${contract.amount}</span>
                                            </div>
                                            <button 
                                                className="btn-view-contract"
                                                onClick={() => {
                                                    if (contract.status === 'PENDING_PAYMENT') {
                                                        globalThis.location.href = '/tenant-payment?tab=pending';
                                                    } else {
                                                        setSelectedContract(contract);
                                                    }
                                                }}
                                            >
                                                {contract.status === 'PENDING_PAYMENT' ? 'Pay Now' : 'View Details'} <ChevronRight size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="tenant-contract-empty-state" style={{ 
                            textAlign: 'center', padding: '80px 20px', 
                            backgroundColor: 'var(--saas-card-bg)', 
                            borderRadius: '14px', border: '1px dashed var(--saas-border-hover)' 
                        }}>
                            <FileText size={48} color="var(--saas-text-muted)" style={{ margin: '0 auto 16px' }} />
                            <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--saas-text-main)' }}>No Lease Agreements Yet</h2>
                            <p style={{ color: 'var(--saas-text-muted)', marginBottom: '24px' }}>It looks like you don't have any active contracts. Let's check your sent requests!</p>
                            <button 
                                className="btn-primary" 
                                style={{ margin: '0 auto' }} 
                                onClick={() => navigate('/sent-requests')}
                            >
                                View Sent Requests
                            </button>
                        </div>
                    )}
                </main>
                <Footer />
            </div>

            {selectedContract?.status === 'PENDING_TENANT' && (
                <ContractDetailView 
                    contract={selectedContract} 
                    onUpdated={fetchContracts}
                    onClose={() => setSelectedContract(null)} 
                />
            )}

            {selectedContract?.status === 'ACTIVE' && (
                <ActiveLeaseContract 
                    contract={selectedContract} 
                    onClose={() => setSelectedContract(null)} 
                />
            )}
        </div>
    );
};

export default Contract;