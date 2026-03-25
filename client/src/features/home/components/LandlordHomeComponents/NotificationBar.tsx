import React from 'react';
import { FiX, FiBell, FiTrash2 } from 'react-icons/fi';
import './NotificationBar.css';

interface Props { isOpen: boolean; onClose: () => void; }

const NotificationBar: React.FC<Props> = ({ isOpen, onClose }) => {
  const history = [
    { id: 1, type: 'Maintenance', title: 'AC Repair Completed', date: 'Today', status: 'done' },
    { id: 2, type: 'Lease', title: 'New Lease Signed - Unit 102', date: 'Yesterday', status: 'new' },
    { id: 3, type: 'Payment', title: 'Rent Overdue - Sunset Loft', date: '2 days ago', status: 'alert' },
  ];

  return (
    <div className={`notif-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="notif-sidebar" onClick={e => e.stopPropagation()}>
        <div className="sidebar-header">
          <div className="header-title">
            <div className="icon-circle"><FiBell /></div>
            <div>
              <h2>Management History</h2>
              <p>Review recent property events</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><FiX /></button>
        </div>

        <div className="sidebar-content">
          {history.map(item => (
            <div key={item.id} className="history-card">
              <div className="history-tag">{item.type}</div>
              <h4>{item.title}</h4>
              <span>{item.date}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="clear-btn"><FiTrash2 /> Clear All History</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;