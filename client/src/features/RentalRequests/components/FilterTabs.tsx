import React from 'react';
import './FilterTabs.css';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    counts: {
        pending: number;
        review: number;
        approved: number;
        declined: number;
    };
}

const FilterTabs: React.FC<Props> = ({ activeTab, setActiveTab, counts }) => {
    const tabs = [
        { id: 'pending', label: 'Pending', count: counts.pending },
        { id: 'review', label: 'Under Review', count: counts.review },
        { id: 'approved', label: 'Approved', count: counts.approved },
        { id: 'declined', label: 'Declined', count: counts.declined }
    ];

    return (
        <div className="filter-navigation">
            <div className="tabs-list">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                        {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
                    </button>
                ))}
            </div>
            <div className="search-filter">
                <input type="text" placeholder="Search applicants..." />
            </div>
        </div>
    );
};

export default FilterTabs;