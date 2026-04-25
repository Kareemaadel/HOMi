// Updated SettingsSidebar.tsx
import React from 'react';
import './SettingsSidebar.css';
import { 
  FaUser, FaShieldAlt, FaCog, FaTrashAlt, 
  FaBell, FaCreditCard, FaUserShield 
} from 'react-icons/fa';

interface SettingsSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    role?: string | null;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, setActiveTab, role }) => {
    const isMaintainer = role === 'MAINTENANCE_PROVIDER';
    const menuItems = [
        { id: 'profile', label: 'My Profile', icon: <FaUser /> },
        { id: 'billing', label: 'Plan & Billing', icon: <FaCreditCard /> }, // NEW
        { id: 'notifications', label: 'Notifications', icon: <FaBell /> }, // NEW
        { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
        { id: 'privacy', label: 'Privacy & Data', icon: <FaUserShield /> }, // NEW
        { id: 'preferences', label: 'Preferences', icon: <FaCog /> },
    ];
    const visibleItems = isMaintainer
        ? menuItems.filter((item) => item.id !== 'billing' && item.id !== 'privacy')
        : menuItems;

    return (
        <aside className="internal-settings-sidebar">
            <nav className="settings-nav">
                {visibleItems.map((item) => (
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