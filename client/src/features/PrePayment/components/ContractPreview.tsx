// client\src\features\PrePayment\components\ContractPreview.tsx
import React from 'react';
import { FaFileSignature, FaChevronRight } from 'react-icons/fa';
import './ContractPreview.css';

const ContractPreview: React.FC = () => (
    <div className="contract-card animate-in delay-2">
        <div className="card-header">
             <div className="icon-wrapper"><FaFileSignature /></div>
            <h3>Lease Agreement</h3>
        </div>
        <div className="contract-preview-box">
            <div className="doc-line"></div>
            <div className="doc-line short"></div>
            <div className="doc-line"></div>
            <ul>
                <li>✓ Standard Residential Lease</li>
                <li>✓ Digital Signature Ready</li>
            </ul>
        </div>
        <button className="view-full-btn">
            Review Full Document <FaChevronRight />
        </button>
    </div>
);

export default ContractPreview;