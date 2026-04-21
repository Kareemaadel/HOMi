import React from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiBell, FiTrash2 } from 'react-icons/fi';
import './NotificationBar.css';

interface ActivityAlert {
  id: string;
  type: 'payment' | 'maintenance' | 'lead';
  title: string;
  desc: string;
  time: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  alerts: ActivityAlert[];
}

const labelMap: Record<ActivityAlert['type'], string> = {
  payment: 'Payment',
  maintenance: 'Maintenance',
  lead: 'Lease',
};

const NotificationBar: React.FC<Props> = ({ isOpen, onClose, alerts }) => {
  const [dismissedIds, setDismissedIds] = React.useState<string[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const visibleAlerts = React.useMemo(
    () => alerts.filter((item) => !dismissedIds.includes(item.id)),
    [alerts, dismissedIds]
  );

  React.useEffect(() => {
    setDismissedIds([]);
  }, [alerts]);

  const handleClearAll = () => {
    setDismissedIds(alerts.map((item) => item.id));
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`notif-sidebar-overlay ${isOpen ? 'open' : ''}`}
      onClick={onClose}
    >
      <div
        className="notif-sidebar"
        onClick={(e) => e.stopPropagation()}
      >
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
          {visibleAlerts.length === 0 ? (
            <div className="history-empty-state">No activity to show.</div>
          ) : visibleAlerts.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-tag">{labelMap[item.type]}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
              <span>{item.time}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="clear-btn" onClick={handleClearAll}><FiTrash2 /> Clear All History</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationBar;