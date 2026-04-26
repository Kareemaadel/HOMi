import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

const Notifications: React.FC<NotificationsProps> = ({ contracts }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getRelativeTime = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return t('tenantHomeComponents.recently');

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return t('tenantHomeComponents.now');
    if (diffMins < 60) return t('landlordHomeComponents.minutesAgo', { count: diffMins });
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return t('landlordHomeComponents.hoursAgo', { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    return t('landlordHomeComponents.daysAgo', { count: diffDays });
  };

  const alerts = useMemo<Alert[]>(() => {
    const activeContract = contracts.find((c) => c.status === 'ACTIVE');
    const pendingPayment = contracts.find((c) => c.status === 'PENDING_PAYMENT');

    const generated: Alert[] = [];

    if (pendingPayment) {
      generated.push({
        id: `payment-${pendingPayment.id}`,
        type: 'payment',
        title: t('tenantHomeComponents.paymentPendingTitle'),
        desc: t('tenantHomeComponents.completePaymentFor', { title: pendingPayment.property?.title ?? t('sidebar.contracts') }),
        time: getRelativeTime(pendingPayment.createdAt),
        unread: true,
      });
    }

    if (activeContract) {
      generated.push({
        id: `active-${activeContract.id}`,
        type: 'system',
        title: t('tenantHomeComponents.leaseActiveTitle'),
        desc: t('tenantHomeComponents.leaseForActive', { title: activeContract.property?.title ?? t('sidebar.home') }),
        time: getRelativeTime(activeContract.createdAt),
        unread: false,
      });

      if ((activeContract.maintenanceResponsibilities?.length ?? 0) > 0) {
        generated.push({
          id: `maintenance-${activeContract.id}`,
          type: 'maintenance',
          title: t('tenantHomeComponents.maintenanceResponsibilitiesUpdated'),
          desc: t('tenantHomeComponents.maintenanceAreasConfigured', { count: activeContract.maintenanceResponsibilities?.length ?? 0 }),
          time: getRelativeTime(activeContract.createdAt),
          unread: false,
        });
      }
    }

    if (generated.length === 0) {
      generated.push({
        id: 'empty-state',
        type: 'system',
        title: t('tenantHomeComponents.noRecentActivityTitle'),
        desc: t('tenantHomeComponents.latestContractUpdates'),
        time: t('tenantHomeComponents.now'),
        unread: false,
      });
    }

    return generated;
  }, [contracts, t]);

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
          <h3>{t('tenantHomeComponents.activityFeed')}</h3>
        </div>
        <button className="btn-mark-all" aria-label="Activity synced" disabled>
          <FaCheckDouble /> <span>{t('tenantHomeComponents.synced')}</span>
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
