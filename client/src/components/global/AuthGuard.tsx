import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import { authService } from '../../services/auth.service';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: Array<'TENANT' | 'LANDLORD' | 'ADMIN' | 'MAINTENANCE_PROVIDER'>;
}

/**
 * Wraps a page and shows a full-screen sign-in modal overlay
 * if the user is not authenticated. The underlying page is still
 * rendered (blurred behind the overlay) so the layout stays intact.
 * Runs session restore first so expired access tokens + Remember-me refresh still count as logged in.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        void authService.tryRestoreSession().finally(() => {
            if (!cancelled) setSessionReady(true);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const isAuthenticated = sessionReady && !!localStorage.getItem('accessToken');
    const cached = authService.getCurrentUser();
    const role = cached?.user?.role;
    const hasAppRole = role === 'LANDLORD' || role === 'TENANT' || role === 'ADMIN' || role === 'MAINTENANCE_PROVIDER';

    if (!sessionReady) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    color: '#64748b',
                }}
            >
                Loading…
            </div>
        );
    }

    if (isAuthenticated && allowedRoles && role && !allowedRoles.includes(role)) {
        const redirectPath = role === 'ADMIN'
            ? '/admin/dashboard'
            : (role === 'LANDLORD' ? '/landlord-home' : (role === 'MAINTENANCE_PROVIDER' ? '/maintenance-home' : '/tenant-home'));
        return <Navigate to={redirectPath} replace />;
    }

    if (isAuthenticated && !hasAppRole) {
        return <Navigate to="/complete-profile" replace />;
    }

    return (
        <>
            {/* Always render children so the page layout is visible behind the modal */}
            <div style={{ filter: isAuthenticated ? 'none' : 'blur(4px)', pointerEvents: isAuthenticated ? 'auto' : 'none', userSelect: 'none' }}>
                {children}
            </div>

            {/* Overlay modal for unauthenticated users — not closeable */}
            {!isAuthenticated && (
                <AuthModal closeable={false} />
            )}
        </>
    );
};

export default AuthGuard;
