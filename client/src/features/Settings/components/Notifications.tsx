import React from 'react';
import './Notifications.css';
import { FaEnvelope, FaMobileAlt, FaBell } from 'react-icons/fa';

const Notifications: React.FC = () => {
  const notificationTypes = [
    { id: 'rental', title: 'Rental Requests', desc: 'When someone applies to your listing' },
    { id: 'payment', title: 'Payment Alerts', desc: 'Confirmations and failed transactions' },
    { id: 'maintenance', title: 'Maintenance Updates', desc: 'Status changes on repair tickets' },
    { id: 'system', title: 'Security & System', desc: 'Login alerts and security updates' },
    { id: 'marketing', title: 'Newsletter & Offers', desc: 'The latest PropTech news and tips' },
    { id: 'messages', title: 'Direct Messages', desc: 'New chats from tenants or landlords' },
    { id: 'reports', title: 'Monthly Reports', desc: 'Financial summaries for your properties' }
  ];

  return (
    <div className="notif-settings-wrapper animate-fade-in">


      <div className="notif-card-container">
        {/* Sticky Header: Does not move */}
        <header className="grid-header">
          <div className="type-col">Notification Type</div>
          <div className="channel-group">
            <div className="channel-col"><FaBell /> App</div>
            <div className="channel-col"><FaEnvelope /> Email</div>
            <div className="channel-col"><FaMobileAlt /> SMS</div>
          </div>
        </header>

        {/* Scrollable Content Area: Only this moves */}
        <div className="notif-scroll-area">
          {notificationTypes.map((item) => (
            <div className="grid-row" key={item.id}>
              <div className="notif-info">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
              <div className="channel-group">
                <div className="checkbox-cell"><input type="checkbox" defaultChecked /></div>
                <div className="checkbox-cell"><input type="checkbox" defaultChecked /></div>
                <div className="checkbox-cell"><input type="checkbox" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="notif-footer-sticky">
          <button className="prime-save-button">Save Preferences</button>
      </div>
    </div>
  );
};

export default Notifications;