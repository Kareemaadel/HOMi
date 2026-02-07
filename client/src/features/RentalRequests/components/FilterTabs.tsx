import React from 'react';
import './FilterTabs.css';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const FilterTabs: React.FC<Props> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'pending', label: 'Pending', count: 12 },
        { id: 'review', label: 'Under Review', count: 5 },
        { id: 'approved', label: 'Approved', count: 3 },
        { id: 'declined', label: 'Declined', count: 0 }
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