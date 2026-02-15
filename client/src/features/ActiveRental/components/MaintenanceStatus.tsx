import React from 'react';
import './MaintenanceStatus.css';
import { FaTools } from 'react-icons/fa';

const MaintenanceStatus = () => {
    return (
        <div className="maintenance-status-card">
            <div className="m-header">
                <div className="title-area">
                    <FaTools className="m-icon" />
                    <h3>Maintenance Request</h3>
                </div>
                <span className="m-badge">In Progress</span>
            </div>
            <div className="m-body">
                <div className="request-details">
                    <strong>A/C Unit Periodic Maintenance</strong>
                    <p>Request ID: #MT-88291 • Oct 14, 2024</p>
                </div>
                <div className="m-steps">
                    <div className="step completed"></div>
                    <div className="step active"></div>
                    <div className="step"></div>
                </div>
                <p className="m-footer-text">Technician assigned: <b>Mark Stevens</b>. Expected arrival tomorrow, 10:00 AM.</p>
            </div>
        </div>
    );
};

export default MaintenanceStatus;