import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckDouble, FaCreditCard, FaTools, FaGift, FaChevronRight } from 'react-icons/fa';
import type { LandlordContract } from '../../../../services/contract.service';
import './Notifications.css';

interface Alert {
  id: string;
  type: 'payment' | 'maintenance' | 'system';
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

interface NotificationsProps {
  contracts: LandlordContract[];
}

const getRelativeTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const Notifications: React.FC<NotificationsProps> = ({ contracts }) => {
  const navigate = useNavigate();

  const alerts = useMemo<Alert[]>(() => {
    const activeContract = contracts.find((c) => c.status === 'ACTIVE');
    const pendingPayment = contracts.find((c) => c.status === 'PENDING_PAYMENT');

    const generated: Alert[] = [];

    if (pendingPayment) {
      generated.push({
        id: `payment-${pendingPayment.id}`,
        type: 'payment',
        title: 'Payment Pending',
        desc: `Complete your payment for ${pendingPayment.property?.title ?? 'your lease'} to activate your contract.`,
        time: getRelativeTime(pendingPayment.createdAt),
        unread: true,
      });
    }

    if (activeContract) {
      generated.push({
        id: `active-${activeContract.id}`,
        type: 'system',
        title: 'Lease Active',
        desc: `Your lease for ${activeContract.property?.title ?? 'your property'} is active.`,
        time: getRelativeTime(activeContract.createdAt),
        unread: false,
      });

      if ((activeContract.maintenanceResponsibilities?.length ?? 0) > 0) {
        generated.push({
          id: `maintenance-${activeContract.id}`,
          type: 'maintenance',
          title: 'Maintenance Responsibilities Updated',
          desc: `${activeContract.maintenanceResponsibilities?.length ?? 0} maintenance areas are configured in your lease.`,
          time: getRelativeTime(activeContract.createdAt),
          unread: false,
        });
      }
    }

    if (generated.length === 0) {
      generated.push({
        id: 'empty-state',
        type: 'system',
        title: 'No Recent Activity',
        desc: 'Your latest contract and payment updates will appear here.',
        time: 'Now',
        unread: false,
      });
    }

    return generated;
  }, [contracts]);

  const getIcon = (type: Alert['type']) => {
    if (type === 'payment') return <FaCreditCard />;
    if (type === 'maintenance') return <FaTools />;
    return <FaGift />;
  };

  const handleNotificationClick = (alert: Alert) => {
    if (alert.type === 'payment') {
      navigate('/tenant-payment');
    }
  };

  return (
    <div className="card-base notifications-premium">
      <header className="notif-header">
        <div className="notif-title-group">
          <div className="bell-ring">
            <FaBell />
            {alerts.some((alert) => alert.unread) && <span className="active-dot"></span>}
          </div>
          <h3>Activity Feed</h3>
        </div>
        <button className="btn-mark-all" aria-label="Activity synced" disabled>
          <FaCheckDouble /> <span>Synced</span>
        </button>
      </header>

      <div className="notif-scroll-area">
        {alerts.map((alert) => {
          if (alert.type === 'payment') {
            return (
              <button
                key={alert.id}
                type="button"
                className={`notif-card ${alert.unread ? 'is-unread' : ''} is-clickable`}
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

                <div className="notif-action-hint">
                  <FaChevronRight />
                </div>
              </button>
            );
          }

          return (
            <div key={alert.id} className={`notif-card ${alert.unread ? 'is-unread' : ''}`}>
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
