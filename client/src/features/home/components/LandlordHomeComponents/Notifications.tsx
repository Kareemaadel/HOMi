import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiDollarSign, FiTool, FiUserPlus, FiChevronRight } from 'react-icons/fi';
import './Notifications.css';
import NotificationBar from './NotificationBar';

interface LandlordAlert {
  id: number;
  type: 'payment' | 'maintenance' | 'lead';
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

const Notifications: React.FC = () => {
  const [isBarOpen, setIsBarOpen] = useState(false);
  const navigate = useNavigate();

  const [alerts] = useState<LandlordAlert[]>([
    { id: 1, type: 'payment', title: 'Rent Received', desc: 'Skyline Apt #402 payment confirmed.', time: '10m ago', unread: true },
    { id: 2, type: 'maintenance', title: 'New Request', desc: 'Broken AC reported in Sunset Loft.', time: '1h ago', unread: true },
    { id: 3, type: 'lead', title: 'New Application', desc: 'John Doe applied for Oak Ridge Villa.', time: '3h ago', unread: false },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <FiDollarSign />;
      case 'maintenance': return <FiTool />;
      case 'lead': return <FiUserPlus />;
      default: return <FiBell />;
    }
  };

  return (
    <>
      <div className="landlord-notifications-card">
        <header className="notif-header">
          <div className="notif-title-group">
            <div className="bell-ring">
              <FiBell />
              {alerts.some(a => a.unread) && <span className="active-dot"></span>}
            </div>
            <h3>Management Feed</h3>
          </div>
          <button className="btn-mark-all">
            <span>Clear</span>
          </button>
        </header>

        <div className="notif-scroll-area">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`notif-item-row ${alert.unread ? 'is-unread' : ''}`}
              onClick={() => setIsBarOpen(true)}
            >
              <div className={`icon-box ${alert.type}`}>
                {getIcon(alert.type)}
              </div>
              
              <div className="notif-info">
                <div className="notif-meta-top">
                  <span className="subject">{alert.title}</span>
                  <span className="timestamp">{alert.time}</span>
                </div>
                <p className="description">{alert.desc}</p>
              </div>
              <FiChevronRight className="arrow-hint" />
            </div>
          ))}
        </div>

        <button className="btn-history-expand" onClick={() => setIsBarOpen(true)}>
          See All Activity
        </button>
      </div>

      <NotificationBar isOpen={isBarOpen} onClose={() => setIsBarOpen(false)} />
    </>
  );
};

export default Notifications;