import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import { 
    Plus, Building2, Clock, ChevronRight, FileText
} from 'lucide-react';
import ContractDetailView from '../components/ContractDetailView';
import ActiveLeaseContract from '../components/ActiveLeaseContract';
import contractService, { type LandlordContract as LandlordContractApi } from '../../../services/contract.service';
import './Contract.css';

export interface LeaseContract {
    id: string;
    internalId: string;
    property: string;
    tenant: string;
    landlord: string;
    amount: number;
    deposit: number;
    status: 'PENDING_LANDLORD' | 'PENDING_TENANT' | 'ACTIVE' | 'EXPIRED';
    startDate: string;
    duration: string;
    rentDueDate: string;
    lateFeeAmount: number;
    maxOccupants: number;
    propertyAddress: string;
    propertyType: string;
    propertyFurnishing: string;
    tenantEmail: string;
    landlordEmail: string;
    propertyRegistrationNumber: string;
    createdAt: string;
}

const LandlordContract: React.FC = () => {
    const navigate = useNavigate();

    const [selectedContract, setSelectedContract] = useState<LeaseContract | null>(null);
    const [contracts, setContracts] = useState<LeaseContract[]>([]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const mapContract = (contract: LandlordContractApi): LeaseContract => ({
        id: contract.contractId,
        internalId: contract.id,
        property: contract.property?.title || 'Property',
        tenant: `${contract.tenant?.firstName || ''} ${contract.tenant?.lastName || ''}`.trim() || 'Tenant',
        landlord: `${contract.landlord?.firstName || ''} ${contract.landlord?.lastName || ''}`.trim() || 'Landlord',
        amount: contract.rentAmount || 0,
        deposit: contract.securityDeposit || 0,
        status: contract.status === 'TERMINATED' ? 'EXPIRED' : contract.status,
        startDate: formatDate(contract.moveInDate),
        duration: `${contract.leaseDurationMonths} Months`,
        rentDueDate: contract.rentDueDate || '1ST_OF_MONTH',
        lateFeeAmount: contract.lateFeeAmount || 0,
        maxOccupants: contract.maxOccupants || 1,
        propertyAddress: contract.property?.address || '—',
        propertyType: contract.property?.type || 'Residential',
        propertyFurnishing: contract.property?.furnishing || 'N/A',
        tenantEmail: contract.tenant?.email || '',
        landlordEmail: contract.landlord?.email || '',
        propertyRegistrationNumber: contract.propertyRegistrationNumber || '',
        createdAt: contract.createdAt,
    });

    const fetchContracts = useCallback(async () => {
        try {
            const response = await contractService.getLandlordContracts({ page: 1, limit: 50 });
            setContracts((response.data || []).map(mapContract));
        } catch {
            setContracts([]);
        }
    }, []);

    useEffect(() => {
        void fetchContracts();
    }, [fetchContracts]);

    const hasContracts = contracts.length > 0;

    const getStatusInfo = (status: LeaseContract['status']) => {
        const map = {
            PENDING_LANDLORD: { label: 'Pending Signature', color: 'blue' },
            PENDING_TENANT: { label: 'Pending Tenant', color: 'yellow' },
            ACTIVE: { label: 'Active Lease', color: 'green' },
            EXPIRED: { label: 'Expired', color: 'gray' },
        };
        return map[status];
    };

    return (
        <div className="dashboard-shell">
            <Sidebar />
            <div className="content-container">
                <Header />
                <main className="contract-hub">
                    <div className="hub-header">
                        <div>
                            <h1>Property Management</h1>
                            <p>Manage legal agreements for your rental portfolio.</p>
                        </div>
                        {hasContracts && (
                            <button className="btn-primary"><Plus size={18}/> New Agreement</button>
                        )}
                    </div>

                    {hasContracts ? (
                        <div className="contract-list-grid">
                            {contracts.map(contract => (
                                <div key={contract.id} className="contract-card">
                                    <div className="card-status-bar" data-status={contract.status.toLowerCase()}></div>
                                    <div className="card-body">
                                        <div className="card-top">
                                            <span className="contract-id">{contract.id}</span>
                                            <span className={`status-tag ${contract.status.toLowerCase()}`}>
                                                {getStatusInfo(contract.status).label}
                                            </span>
                                        </div>
                                        <h3>{contract.property}</h3>
                                        <div className="card-meta">
                                            <div className="meta-item"><Building2 size={14}/> {contract.duration}</div>
                                            <div className="meta-item"><Clock size={14}/> Starts {contract.startDate}</div>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <div className="price-info">
                                            <span className="label">Monthly Revenue</span>
                                            <span className="value">${contract.amount}</span>
                                        </div>
                                        <button className="btn-view-contract" onClick={() => setSelectedContract(contract)}>
                                            Manage <ChevronRight size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-container" style={{ 
                            textAlign: 'center', padding: '80px 20px', 
                            backgroundColor: 'var(--saas-card-bg)', 
                            borderRadius: '14px', border: '1px dashed var(--saas-border-hover)' 
                        }}>
                            <FileText size={48} color="var(--saas-text-muted)" style={{ margin: '0 auto 16px' }} />
                            <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--saas-text-main)' }}>No Active Agreements</h2>
                            <p style={{ color: 'var(--saas-text-muted)', marginBottom: '24px' }}>You don't have any lease contracts in your portfolio yet.</p>
                            <button 
                                className="btn-primary" 
                                style={{ margin: '0 auto' }} 
                                onClick={() => navigate('/rental-requests')}
                            >
                                View Rental Requests
                            </button>
                        </div>
                    )}
                </main>
                <Footer />
            </div>

            {selectedContract && selectedContract.status !== 'ACTIVE' && (
                <ContractDetailView 
                    contract={selectedContract} 
                    onUpdated={fetchContracts}
                    onClose={() => setSelectedContract(null)} 
                />
            )}

            {selectedContract && selectedContract.status === 'ACTIVE' && (
                <ActiveLeaseContract 
                    contract={selectedContract} 
                    onClose={() => setSelectedContract(null)} 
                />
            )}
        </div>
    );
};

export default LandlordContract;