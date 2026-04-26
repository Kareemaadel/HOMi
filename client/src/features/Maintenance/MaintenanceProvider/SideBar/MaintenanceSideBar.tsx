import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FaHome, FaTools, FaSearch, FaCreditCard, FaEnvelope, FaSignOutAlt, FaInbox
} from 'react-icons/fa';
import './MaintenanceSideBar.css';
import authService from '../../../../services/auth.service';
import ConfirmModal from '../../../../components/global/ConfirmModal';

const MaintenanceSideBar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const [userName, setUserName] = useState(t('sidebar.loading'));
    const [userRole, setUserRole] = useState(t('sidebar.loading'));
    const [avatarSrc, setAvatarSrc] = useState(
        'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=80'
    );
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    // Assume no unread dot for messaging for now or just generic boolean
    const hasMessagingUnread = false;

    useEffect(() => {
        const load = () => {
            const cached = authService.getCurrentUser();
            if (cached) {
                const { profile, user } = cached;
                setUserName(`${profile.firstName} ${profile.lastName}`.trim() || user.email);
                setUserRole(t('sidebar.maintenance'));
                const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${profile.firstName} ${profile.lastName}`.trim() || 'User'
                )}&background=6366f1&color=fff&size=80`;
                setAvatarSrc(profile.avatarUrl || fallback);
            }
        };

        load();
        window.addEventListener('storage', load);
        return () => window.removeEventListener('storage', load);
    }, [t]);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        setShowLogoutConfirm(false);
        await authService.logout();
        navigate('/guest-home', { replace: true });
    };

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=6366f1&color=fff&size=80`;

    return (
        <aside className="sidebar">
            {/* 1. Brand Section */}
            <div className="sidebar-brand">
                <img src="/logo.png" alt="HOMi Logo" className="logo-image" />
            </div>

            {/* 2. Navigation */}
            <nav className="sidebar-nav">
                <ul>
                    <li><a href="/maintenance-home" className={location.pathname === "/maintenance-home" ? "active" : ""}><FaHome /> <span>{t('maintenanceSidebar.home')}</span></a></li>
                    <li><a href="/my-jobs" className={location.pathname === "/my-jobs" ? "active" : ""}><FaTools /> <span>{t('maintenanceSidebar.myJobs')}</span></a></li>
                    <li><a href="/available-jobs" className={location.pathname === "/available-jobs" ? "active" : ""}><FaSearch /> <span>{t('maintenanceSidebar.availableJobs')}</span></a></li>
                    <li><a href="/maintenance-requests" className={location.pathname === "/maintenance-requests" ? "active" : ""}><FaInbox /> <span>{t('maintenanceSidebar.jobRequests')}</span></a></li>
                    <li><a href="/earnings" className={location.pathname === "/earnings" ? "active" : ""}><FaCreditCard /> <span>{t('maintenanceSidebar.earnings')}</span></a></li>
                    <li><a href="/messages" className={location.pathname === "/messages" ? "active" : ""}><FaEnvelope /> <span className="badge-wrap">{t('maintenanceSidebar.messages')} {hasMessagingUnread ? <em className="notif-dot" aria-hidden /> : null}</span></a></li>
                </ul>
            </nav>

            {/* 3. User Section */}
            <div className="sidebar-footer">
                <div className="user-info">
                    <img
                        src={avatarSrc}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarSrc(fallbackAvatar)}
                    />
                    <div className="user-text">
                        <p className="user-name">{userName}</p>
                        <p className="user-role">{userRole}</p>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout} title={t('sidebar.signOut')}>
                    <FaSignOutAlt />
                </button>
            </div>

            <ConfirmModal
                isOpen={showLogoutConfirm}
                title={t('confirmModal.signOutTitle')}
                message={t('confirmModal.signOutMessage')}
                confirmText={t('confirmModal.confirm')}
                cancelText={t('confirmModal.cancel')}
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </aside>
    );
};

export default MaintenanceSideBar;
