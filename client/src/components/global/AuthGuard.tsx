import React from 'react';
import AuthModal from './AuthModal';

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * Wraps a page and shows a full-screen sign-in modal overlay
 * if the user is not authenticated. The underlying page is still
 * rendered (blurred behind the overlay) so the layout stays intact.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('accessToken');

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
