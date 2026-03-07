import React, { useState } from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import { 
    FileText, CheckCircle2, Clock, AlertCircle, 
    Plus, Search, Filter, Building2, Eye, Download, ChevronRight 
} from 'lucide-react';
import ContractDetailView from '../components/ContractDetailView';
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

const Contract: React.FC = () => {
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
            amount: 1200, 
            deposit: 1200,
            status: 'ACTIVE', 
            startDate: 'Jan 15, 2026',
            duration: '6 Months'
        }
    ]);

    const getStatusInfo = (status: ContractStatus) => {
        const map = {
            REQUEST: { label: 'New Request', color: 'orange' },
            DRAFT: { label: 'In Review', color: 'gray' },
            SIGNING: { label: 'Pending Signature', color: 'blue' },
            PAYMENT: { label: 'Pending Payment', color: 'yellow' },
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
                            <h1>Lease Agreements</h1>
                            <p>Track, sign, and manage your property contracts.</p>
                        </div>
                        <button className="btn-primary"><Plus size={18}/> Draft New Lease</button>
                    </div>

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
                                    <div className="card-footer">
                                        <div className="price-info">
                                            <span className="label">Monthly Rent</span>
                                            <span className="value">${contract.amount}</span>
                                        </div>
                                        <button 
                                            className="btn-view-contract"
                                            onClick={() => setSelectedContract(contract)}
                                        >
                                            View Details <ChevronRight size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
                <Footer />
            </div>

            {/* Slide-over Detail View */}
            {selectedContract && (
                <ContractDetailView 
                    contract={selectedContract} 
                    onClose={() => setSelectedContract(null)} 
                />
            )}
        </div>
    );
};

export default Contract;