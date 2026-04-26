// client\src\features\home\components\TenantHomeComponents\NotificationsBar.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaFilter, FaBell, FaCheckDouble, FaTrashAlt } from 'react-icons/fa';
import './NotificationsBar.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationsBar: React.FC<Props> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    // State to track unread status and the notification list
    const [unreadCount, setUnreadCount] = useState(2);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'maintenance', title: t('notificationCenter.examples.maintenance.title'), desc: t('notificationCenter.examples.maintenance.desc'), date: t('notificationCenter.today'), status: 'completed' },
        { id: 2, type: 'payment', title: t('notificationCenter.examples.invoice.title'), desc: t('notificationCenter.examples.invoice.desc'), date: t('notificationCenter.yesterday'), status: 'pending' },
        { id: 3, type: 'system', title: t('notificationCenter.examples.policy.title'), desc: t('notificationCenter.examples.policy.desc'), date: 'Oct 15, 2026', status: 'info' },
        { id: 4, type: 'payment', title: t('notificationCenter.examples.confirmed.title'), desc: t('notificationCenter.examples.confirmed.desc'), date: 'Feb 01, 2026', status: 'success' },
    ]);

    // Handle clearing the "Live" pulse
    const handleMarkAllRead = () => {
        setUnreadCount(0);
    };

    // Handle clearing the entire history
    const handleClearHistory = () => {
        if (window.confirm(t('notificationCenter.confirmClear'))) {
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    // Close on Escape key press
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    return (
        <div className={`notif-bar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div
                className={`notif-sidebar-container ${isOpen ? 'slide-in' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                {/* HEADER SECTION */}
                <div className="notif-bar-header">
                    <div className="bar-title">
                        <div className="bell-ring">
                            <FaBell />
                            {/* THE LIVE PULSE: Only renders if there are unread items */}
                            {unreadCount > 0 && <span className="status-pulse"></span>}
                        </div>
                        <div>
                            <h2>{t('notificationCenter.title')}</h2>
                            <p className={unreadCount === 0 ? 'all-caught-up' : ''}>
                                {unreadCount > 0
                                    ? t('notificationCenter.newAlerts', { count: unreadCount })
                                    : t('notificationCenter.allCaughtUp')}
                            </p>
                        </div>
                    </div>
                    <button className="close-bar-btn" onClick={onClose} aria-label={t('common.close')}>
                        <FaTimes />
                    </button>
                </div>

                {/* QUICK ACTIONS */}
                <div className="notif-bar-actions">
                    <button className="bar-action-btn" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                        <FaCheckDouble /> {t('notificationCenter.markAllRead')}
                    </button>
                    <button className="bar-action-btn">
                        <FaFilter /> {t('guestSearch.filter')}
                    </button>
                </div>

                {/* MAIN CONTENT / TIMELINE */}
                <div className="notif-bar-content">
                    {notifications.length > 0 ? (
                        <div className="history-timeline">
                            {notifications.map((item, index) => (
                                <div
                                    className="history-item"
                                    key={item.id}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="history-dot-line">
                                        <div className={`history-dot ${item.status}`}></div>
                                        {index !== notifications.length - 1 && <div className="history-line"></div>}
                                    </div>
                                    <div className="history-card">
                                        <div className="history-header">
                                            <span className="history-date">{item.date}</span>
                                            <span className={`history-tag ${item.status}`}>{item.type}</span>
                                        </div>
                                        <h4>{item.title}</h4>
                                        <p>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-notif-state">
                            <div className="empty-icon">📂</div>
                            <p>{t('notificationCenter.empty')}</p>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="notif-bar-footer">
                    <button
                        className="clear-history-btn"
                        onClick={handleClearHistory}
                        disabled={notifications.length === 0}
                    >
                        <FaTrashAlt /> {t('notificationCenter.clearHistory')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationsBar;
