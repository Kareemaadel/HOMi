import './MaintenanceStatus.css';
import { FaTools } from 'react-icons/fa';
import type { LandlordContract } from '../../../services/contract.service';

const MaintenanceStatus = ({ contract }: { contract: LandlordContract | null }) => {
    const responsibilities = contract?.maintenanceResponsibilities ?? [];
    const hasResponsibilities = responsibilities.length > 0;
    const responsibilitiesCountText = `${responsibilities.length} responsibility area${responsibilities.length === 1 ? '' : 's'} defined in this contract.`;
    const previewSuffix = responsibilities.length > 2 ? ' • ...' : '';
    const preview = responsibilities
        .slice(0, 2)
        .map((item) => `${item.area} (${item.responsibleParty === 'LANDLORD' ? 'Landlord' : 'Tenant'})`)
        .join(' • ');

    return (
        <div className="maintenance-status-card">
            <div className="m-header">
                <div className="title-area">
                    <FaTools className="m-icon" />
                    <h3>Maintenance Overview</h3>
                </div>
                <span className="m-badge">{hasResponsibilities ? 'Configured' : 'No open requests'}</span>
            </div>
            <div className="m-body">
                <div className="request-details">
                    <strong>{hasResponsibilities ? 'Lease maintenance responsibilities' : 'No maintenance requests yet'}</strong>
                    <p>
                        {hasResponsibilities
                            ? responsibilitiesCountText
                            : 'Once maintenance requests are created, they will show up here.'}
                    </p>
                </div>
                <div className="m-steps">
                    <div className={`step ${hasResponsibilities ? 'completed' : ''}`}></div>
                    <div className={`step ${hasResponsibilities ? 'active' : ''}`}></div>
                    <div className="step"></div>
                </div>
                <p className="m-footer-text">
                    {hasResponsibilities
                        ? `Current setup: ${preview}${previewSuffix}`
                        : 'No technician is assigned yet.'}
                </p>
            </div>
        </div>
    );
};

export default MaintenanceStatus;