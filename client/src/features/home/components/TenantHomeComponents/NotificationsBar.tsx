// client\src\features\home\components\TenantHomeComponents\NotificationsBar.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaFilter, FaBell, FaCheckDouble, FaTrashAlt } from 'react-icons/fa';
import './NotificationsBar.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationsBar: React.FC<Props> = ({ isOpen, onClose }) => {
    // State to track unread status and the notification list
    const [unreadCount, setUnreadCount] = useState(2);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'maintenance', title: 'Work Order Completed', desc: 'The leak in the bathroom has been fixed.', date: 'Today, 10:30 AM', status: 'completed' },
        { id: 2, type: 'payment', title: 'Invoice Generated', desc: 'Monthly rent invoice for March is ready.', date: 'Yesterday', status: 'pending' },
        { id: 3, type: 'system', title: 'Policy Update', desc: 'Updated terms for parking space usage.', date: 'Oct 15, 2026', status: 'info' },
        { id: 4, type: 'payment', title: 'Payment Confirmed', desc: 'Rent for February was processed.', date: 'Feb 01, 2026', status: 'success' },
    ]);

    // Handle clearing the "Live" pulse
    const handleMarkAllRead = () => {
        setUnreadCount(0);
    };

    // Handle clearing the entire history
    const handleClearHistory = () => {
        if (window.confirm("Are you sure you want to clear all notifications?")) {
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
                            <h2>Notification Center</h2>
                            <p className={unreadCount === 0 ? 'all-caught-up' : ''}>
                                {unreadCount > 0 
                                    ? `You have ${unreadCount} new alerts` 
                                    : 'You are all caught up!'}
                            </p>
                        </div>
                    </div>
                    <button className="close-bar-btn" onClick={onClose} aria-label="Close Sidebar">
                        <FaTimes />
                    </button>
                </div>

                {/* QUICK ACTIONS */}
                <div className="notif-bar-actions">
                    <button className="bar-action-btn" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                        <FaCheckDouble /> Mark all read
                    </button>
                    <button className="bar-action-btn">
                        <FaFilter /> Filter
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
                            <p>No notifications to show</p>
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
                        <FaTrashAlt /> Clear Notification History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationsBar;