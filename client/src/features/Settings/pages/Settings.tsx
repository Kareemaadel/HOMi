import React, { useState } from 'react';
import './Settings.css';
import Header from '../../../components/global/Tenant/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/Tenant/footer';
import SettingsSidebar from '../components/SettingsSidebar';

// New Component Imports
import MyProfile from '../components/MyProfile';
import Security from '../components/Security';
import Preferences from '../components/Preferences';
import About from '../components/About';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <MyProfile />;
            case 'security': return <Security />;
            case 'preferences': return <Preferences />;
            case 'about': return <About />;
            case 'delete': return (
                <div className="delete-zone">
                    <h2>Delete Account</h2>
                    <p>Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="danger-btn">Permanently Delete My Account</button>
                </div>
            );
            default: return <MyProfile />;
        }
    };

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="settings-page-container">
                    <div className="settings-card">
                        <SettingsSidebar 
                            activeTab={activeTab} 
                            setActiveTab={setActiveTab} 
                        />
                        <main className="settings-content-area">
                            <div className="content-inner">
                                {renderContent()}
                            </div>
                        </main>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default Settings;