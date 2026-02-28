import React, { useState } from 'react';
import './Settings.css';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import SettingsSidebar from '../components/SettingsSidebar';

// Sub-components
import MyProfile from '../components/MyProfile';
import Security from '../components/Security';
import Preferences from '../components/Preferences';
import About from '../components/About';
import { FaExclamationTriangle } from 'react-icons/fa';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <MyProfile />;
            case 'security': return <Security />;
            case 'preferences': return <Preferences />;
            case 'about': return <About />;
            case 'delete': return (
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
            );
            default: return <MyProfile />;
        }
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
                            {renderContent()}
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Settings;