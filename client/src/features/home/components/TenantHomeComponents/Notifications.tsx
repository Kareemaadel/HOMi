// client\src\features\home\components\TenantHomeComponents\Notifications.tsx
import React, { useState } from 'react';
import './Notifications.css';
import NotificationsBar from './NotificationsBar';

const Notifications = () => {
  const [isBarOpen, setIsBarOpen] = useState(false);

  const alerts = [
    { id: 1, type: 'payment', title: 'Payment Confirmed', desc: 'Rent for March was processed.', time: '2h ago', unread: true },
    { id: 2, type: 'maintenance', title: 'Technician En Route', desc: 'Mike Ross will arrive in 15 mins.', time: 'Just now', unread: true },
    { id: 3, type: 'system', title: 'New Reward!', desc: 'You earned 500 points for early payment.', time: '1d ago', unread: false },
  ];

  return (
    <>
      <div className="card-base notifications-premium">
        <div className="notif-header">
          <div className="notif-title-wrapper">
            <h3>Activity Feed</h3>
            <span className="unread-badge">2 New</span>
          </div>
          <button className="mark-read">Mark all as read</button>
        </div>

        <div className="notif-list">
          {alerts.map((alert) => (
            <div key={alert.id} className={`notif-item ${alert.unread ? 'unread' : ''}`}>
              <div className={`notif-icon-box ${alert.type}`}>
                {alert.type === 'payment' && '💳'}
                {alert.type === 'maintenance' && '🔧'}
                {alert.type === 'system' && '🎉'}
              </div>
              <div className="notif-content">
                <div className="notif-top-line">
                  <span className="notif-subject">{alert.title}</span>
                  <span className="notif-time">{alert.time}</span>
                </div>
                <p className="notif-desc">{alert.desc}</p>
              </div>
              {alert.unread && <div className="unread-glow"></div>}
            </div>
          ))}
        </div>

        {/* CLICK HANDLER ADDED HERE */}
        <button className="view-history-btn" onClick={() => setIsBarOpen(true)}>
          See Full History
        </button>
      </div>

      {/* RENDER THE SIDEBAR */}
      <NotificationsBar isOpen={isBarOpen} onClose={() => setIsBarOpen(false)} />
    </>
  );
};

export default Notifications;