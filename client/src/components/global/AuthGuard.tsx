import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import { authService } from '../../services/auth.service';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: Array<'TENANT' | 'LANDLORD'>;
}

/**
 * Wraps a page and shows a full-screen sign-in modal overlay
 * if the user is not authenticated. The underlying page is still
 * rendered (blurred behind the overlay) so the layout stays intact.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
    const isAuthenticated = !!localStorage.getItem('accessToken');
    const cached = authService.getCurrentUser();
    const role = cached?.user?.role;

    if (isAuthenticated && allowedRoles && role && !allowedRoles.includes(role)) {
        const redirectPath = role === 'LANDLORD' ? '/landlord-home' : '/tenant-home';
        return <Navigate to={redirectPath} replace />;
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
