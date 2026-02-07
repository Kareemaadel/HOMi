import React from 'react';
import { FaUsers, FaChartLine, FaClock } from 'react-icons/fa';
import './StatsOverview.css';

const StatsOverview: React.FC = () => {
    return (
        <div className="stats-container">
            <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                    <FaUsers />
                </div>
                <div className="stat-content">
                    <label>Total Applicants</label>
                    <div className="stat-value-group">
                        <h2>24</h2>
                        <span className="trend positive">+12%</span>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon-wrapper green">
                    <FaChartLine />
                </div>
                <div className="stat-content">
                    <label>Avg. Match Score</label>
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
                    <label>Avg. Response</label>
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