import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaChartLine, FaClock } from 'react-icons/fa';
import './StatsOverview.css';

interface StatsOverviewProps {
    totalApplicants: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ totalApplicants }) => {
    const { t } = useTranslation();
    return (
        <div className="stats-container">
            <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                    <FaUsers />
                </div>
                <div className="stat-content">
                    <label>{t('rentalRequests.stats.totalRequests')}</label>
                    <div className="stat-value-group">
                        <h2>{totalApplicants}</h2>
                        <span className="trend positive">+12%</span>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon-wrapper green">
                    <FaChartLine />
                </div>
                <div className="stat-content">
                    <label>{t('rentalRequests.stats.avgMatchScore', { defaultValue: 'Avg. Match Score' })}</label>
                    <div className="stat-value-group">
                        <h2>92%</h2>
                        <span className="trend neutral">Solid</span>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon-wrapper orange">
                    <FaClock />
                </div>
                <div className="stat-content">
                    <label>{t('rentalRequests.stats.avgResponse')}</label>
                    <div className="stat-value-group">
                        <h2>4.5h</h2>
                        <span className="trend positive">-20m</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsOverview;