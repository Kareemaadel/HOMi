import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import { 
    Plus, Building2, Clock, ChevronRight, FileText
} from 'lucide-react';
import ContractDetailView from '../components/ContractDetailView';
import ActiveLeaseContract from '../components/ActiveLeaseContract';
import './Contract.css';

export type ContractStatus = 'REQUEST' | 'DRAFT' | 'SIGNING' | 'PAYMENT' | 'ACTIVE';

export interface LeaseContract {
    id: string;
    property: string;
    tenant: string;
    landlord: string;
    amount: number;
    deposit: number;
    status: ContractStatus;
    startDate: string;
    duration: string;
}

const LandlordContract: React.FC = () => {
    const navigate = useNavigate();
    
    // Toggle this to false to see the empty state!
    const hasContracts = true; 

    const [selectedContract, setSelectedContract] = useState<LeaseContract | null>(null);
    const [contracts] = useState<LeaseContract[]>([
        { 
            id: 'HOMI-8821', 
            property: 'Skyline Penthouse, #12', 
            tenant: 'Emily Blunt', 
            landlord: 'Alex Sterling',
            amount: 2400, 
            deposit: 3000,
            status: 'SIGNING', 
            startDate: 'May 01, 2026',
            duration: '12 Months'
        },
        { 
            id: 'HOMI-4410', 
            property: 'Sunset Loft', 
            tenant: 'John Doe', 
            landlord: 'Alex Sterling',
            amount: 1850, 
            deposit: 1850,
            status: 'ACTIVE', 
            startDate: 'Jan 15, 2026',
            duration: '12 Months'
        }
    ]);

    const getStatusInfo = (status: ContractStatus) => {
        const map = {
            REQUEST: { label: 'New Request', color: 'orange' },
            DRAFT: { label: 'In Review', color: 'gray' },
            SIGNING: { label: 'Pending Signature', color: 'blue' },
            PAYMENT: { label: 'Waiting for Tenant', color: 'yellow' },
            ACTIVE: { label: 'Active Lease', color: 'green' }
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