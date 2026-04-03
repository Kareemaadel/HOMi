import React from 'react';
import { 
    X, CheckCircle2, FileText, Download, 
    User, DollarSign, Calendar, MapPin, 
    ShieldCheck, Clock, Building2
} from 'lucide-react';
import { type LeaseContract } from '../pages/Contract';
import './ActiveLeaseContract.css';

interface Props {
    contract: LeaseContract;
    onClose: () => void;
}

const ActiveLeaseContract: React.FC<Props> = ({ contract, onClose }) => {
    return (
        <div className="active-contract-overlay">
            <div className="active-detail-panel animate-slide-in-panel">
                <header className="active-panel-header">
                    <div className="header-status-badge">
                        <CheckCircle2 size={16} />
                        <span>Active Lease</span>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close panel">
                        <X size={20}/>
                    </button>
                </header>

                <div className="active-panel-content">
                    <div className="contract-header-info">
                        <h2>{contract.property}</h2>
                        <p className="contract-id-ref">Contract Reference: {contract.id}</p>
                    </div>

                    <div className="action-ribbon">
                        <button className="btn-secondary-action">
                            <Download size={16} /> Download PDF
                        </button>
                        <button className="btn-secondary-action">
                            <FileText size={16} /> View Original Terms
                        </button>
                    </div>

                    <div className="info-cards-grid">
                        {/* Lease Terms Card */}
                        <section className="info-card">
                            <div className="card-header">
                                <Calendar size={18} className="icon-blue" />
                                <h3>Lease Terms</h3>
                            </div>
                            <div className="card-content">
                                <div className="data-row">
                                    <span className="label">Start Date</span>
                                    <span className="value">{contract.startDate}</span>
                                </div>
                                <div className="data-row">
                                    <span className="label">Duration</span>
                                    <span className="value">{contract.duration}</span>
                                </div>
                                <div className="data-row">
                                    <span className="label">Status</span>
                                    <span className="value status-active">In Effect</span>
                                </div>
                            </div>
                        </section>

                        {/* Financials Card */}
                        <section className="info-card">
                            <div className="card-header">
                                <DollarSign size={18} className="icon-green" />
                                <h3>Financials</h3>
                            </div>
                            <div className="card-content">
                                <div className="data-row">
                                    <span className="label">Monthly Rent</span>
                                    <span className="value highlight">${contract.amount}</span>
                                </div>
                                <div className="data-row">
                                    <span className="label">Security Deposit</span>
                                    <span className="value">${contract.deposit}</span>
                                </div>
                                <div className="data-row">
                                    <span className="label">Next Payment</span>
                                    <span className="value">{contract.rentDueDate.replaceAll('_', ' ')}</span>
                                </div>
                            </div>
                        </section>

                        {/* Parties Involved Card */}
                        <section className="info-card full-width">
                            <div className="card-header">
                                <User size={18} className="icon-purple" />
                                <h3>Parties Involved</h3>
                            </div>
                            <div className="card-content multi-col">
                                <div className="party-box">
                                    <span className="party-role">Tenant</span>
                                    <span className="party-name">{contract.tenant}</span>
                                    <span className="party-status"><ShieldCheck size={14}/> Verified</span>
                                </div>
                                <div className="party-box">
                                    <span className="party-role">Landlord</span>
                                    <span className="party-name">{contract.landlord}</span>
                                    <span className="party-status"><ShieldCheck size={14}/> Verified</span>
                                </div>
                            </div>
                        </section>

                        {/* Property Details Card */}
                        <section className="info-card full-width">
                            <div className="card-header">
                                <Building2 size={18} className="icon-orange" />
                                <h3>Property Details</h3>
                            </div>
                            <div className="card-content">
                                <div className="data-row">
                                    <span className="label">Address</span>
                                    <span className="value flex-value"><MapPin size={14}/> {contract.propertyAddress}</span>
                                </div>
                                <div className="data-row">
                                    <span className="label">Usage</span>
                                    <span className="value">{contract.propertyType || 'Residential'}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="execution-footer">
                        <Clock size={16} />
                        <p>This agreement was digitally executed and timestamped on the HOMI platform.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveLeaseContract;