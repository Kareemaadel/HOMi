import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckDouble, FaCreditCard, FaTools, FaGift, FaChevronRight } from 'react-icons/fa';
import './Notifications.css';
import NotificationsBar from './NotificationsBar';

interface Alert {
  id: number;
  type: 'payment' | 'maintenance' | 'system';
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

const Notifications: React.FC = () => {
  const [isBarOpen, setIsBarOpen] = useState(false);
  const navigate = useNavigate();

  const [alerts] = useState<Alert[]>([
    { id: 1, type: 'payment', title: 'Request Approved', desc: 'Rent for March was processed.', time: '2h ago', unread: true },
    { id: 2, type: 'maintenance', title: 'Technician En Route', desc: 'Mike Ross will arrive in 15 mins.', time: 'Just now', unread: true },
    { id: 3, type: 'system', title: 'New Reward!', desc: 'You earned 500 points for early payment.', time: '1d ago', unread: false },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <FaCreditCard />;
      case 'maintenance': return <FaTools />;
      default: return <FaGift />;
    }
  };

  const handleNotificationClick = (alert: Alert) => {
    if (alert.type === 'payment') {
      navigate('/tenant-contracts', { state: { tab: 'pending' } });
    }
  };

  return (
    <>
      <div className="card-base notifications-premium">
        <header className="notif-header">
          <div className="notif-title-group">
            <div className="bell-ring">
              <FaBell />
              {alerts.some(a => a.unread) && <span className="active-dot"></span>}
            </div>
            <h3>Activity Feed</h3>
          </div>
          <button className="btn-mark-all" aria-label="Mark all as read">
            <FaCheckDouble /> <span>Read all</span>
          </button>
        </header>

        <div className="notif-scroll-area">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`notif-card ${alert.unread ? 'is-unread' : ''} ${alert.type === 'payment' ? 'is-clickable' : ''}`}
              onClick={() => handleNotificationClick(alert)}
            >
              <div className={`icon-orb ${alert.type}`}>
                {getIcon(alert.type)}
              </div>
              
              <div className="notif-body">
                <div className="notif-meta">
                  <span className="notif-subject">{alert.title}</span>
                  <span className="notif-timestamp">{alert.time}</span>
                </div>
                <p className="notif-text">{alert.desc}</p>
              </div>

              {alert.type === 'payment' && (
                <div className="notif-action-hint">
                  <FaChevronRight />
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="btn-history-expand" onClick={() => setIsBarOpen(true)}>
          View All History
        </button>
      </div>

      <NotificationsBar isOpen={isBarOpen} onClose={() => setIsBarOpen(false)} />
    </>
  );
};

export default Notifications;