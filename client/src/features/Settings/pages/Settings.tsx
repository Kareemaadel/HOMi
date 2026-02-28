import React, { useState } from 'react';
import './Settings.css';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import SettingsSidebar from '../components/SettingsSidebar';

// Component Imports
import MyProfile from '../components/MyProfile';
import Security from '../components/Security';
import Preferences from '../components/Preferences';
import About from '../components/About';
import Notifications from '../components/Notifications'; // Ensure naming matches your file
import Billing from '../components/Billing';
import Privacy from '../components/Privacy';

import { FaExclamationTriangle } from 'react-icons/fa';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');

    // Senior Approach: Component Mapping Object
    // This replaces the switch statement for better readability
    const tabComponents: Record<string, React.ReactNode> = {
        profile: <MyProfile />,
        billing: <Billing />,
        notifications: <Notifications />,
        security: <Security />,
        privacy: <Privacy />,
        preferences: <Preferences />,
        about: <About />,
        delete: (
            <div className="delete-zone-container animate-fade-in">
                <div className="danger-icon-wrapper">
                    <FaExclamationTriangle />
                </div>
                <h2>Delete Account</h2>
                <p>
                    This action is <strong>irreversible</strong>. Deleting your account will 
                    permanently remove all your properties, rental history, and documents.
                </p>
                <div className="delete-actions">
                    <button className="cancel-btn" onClick={() => setActiveTab('profile')}>Keep My Account</button>
                    <button className="danger-confirm-btn">Permanently Delete</button>
                </div>
            </div>
        )
    };

    return (
        <div className="settings-layout">
            <Sidebar />
            
            <div className="settings-viewport">
                <Header />
                
                <main className="settings-main-area">

                    <div className="settings-glass-card">
                        <SettingsSidebar 
                            activeTab={activeTab} 
                            setActiveTab={setActiveTab} 
                        />
                        
                        <section className="settings-view-panel">
                            {/* Render the component based on activeTab key, fallback to Profile */}
                            {tabComponents[activeTab] || tabComponents.profile}
                        </section>
                    </div>
                </main>
                
                <Footer />
            </div>
        </div>
    );
};

export default Settings;