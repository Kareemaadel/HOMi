import React, { useState } from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import { 
    Plus, Building2, Clock, ChevronRight 
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
        // Here is your Active Lease mock data!
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
                        <button className="btn-primary"><Plus size={18}/> New Agreement</button>
                    </div>

                    <div className="contract-list-grid">
                        {contracts.map(contract => (
                            <div key={contract.id} className="contract-card">
                                {/* The data-status attribute hooks into your CSS to color the top bar green */}
                                <div className="card-status-bar" data-status={contract.status.toLowerCase()}></div>
                                <div className="card-body">
                                    <div className="card-top">
                                        <span className="contract-id">{contract.id}</span>
                                        {/* The status-tag class hooks into your CSS to make the pill green */}
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
                </main>
                <Footer />
            </div>

            {/* If it's NOT active, open the standard detail view */}
            {selectedContract && selectedContract.status !== 'ACTIVE' && (
                <ContractDetailView 
                    contract={selectedContract} 
                    onClose={() => setSelectedContract(null)} 
                />
            )}

            {/* If it IS active, open the ActiveLeaseContract component */}
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