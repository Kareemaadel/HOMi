import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
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

const NotificationBar: React.FC<Props> = ({ isOpen, onClose, alerts }) => {
  const { t } = useTranslation();
  const [dismissedIds, setDismissedIds] = React.useState<string[]>([]);
  const [mounted, setMounted] = React.useState(false);

  const labelMap: Record<ActivityAlert['type'], string> = {
    payment: t('landlordHomeComponents.labelPayment'),
    maintenance: t('landlordHomeComponents.labelMaintenance'),
    lead: t('landlordHomeComponents.labelLease'),
  };

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
              <h2>{t('landlordHomeComponents.managementHistory')}</h2>
              <p>{t('landlordHomeComponents.reviewRecentEvents')}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><FiX /></button>
        </div>

        <div className="sidebar-content">
          {visibleAlerts.length === 0 ? (
            <div className="history-empty-state">{t('landlordHomeComponents.noActivityToShow')}</div>
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
          <button className="clear-btn" onClick={handleClearAll}><FiTrash2 /> {t('landlordHomeComponents.clearAllHistory')}</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationBar;