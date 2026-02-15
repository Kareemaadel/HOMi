import React from 'react';
import './SettingsSidebar.css';
import { FaUser, FaShieldAlt, FaCog, FaInfoCircle, FaTrashAlt } from 'react-icons/fa';

interface SettingsSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'profile', label: 'My Profile', icon: <FaUser /> },
        { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
        { id: 'preferences', label: 'Preferences', icon: <FaCog /> },
        { id: 'about', label: 'About', icon: <FaInfoCircle /> },
    ];

    return (
        <aside className="internal-settings-sidebar">
            <nav className="settings-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="nav-divider"></div>

            <button 
                className={`nav-item delete-nav ${activeTab === 'delete' ? 'active' : ''}`}
                onClick={() => setActiveTab('delete')}
            >
                <span className="nav-icon"><FaTrashAlt /></span>
                Delete Account
            </button>
        </aside>
    );
};

export default SettingsSidebar;