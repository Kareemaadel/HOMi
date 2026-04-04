import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Legacy route: verification links now open /verify-email?token=… directly.
 * Keeps old bookmarks working by forwarding query string to the inbox page.
 */
const VerifyEmailCallback: React.FC = () => {
    const location = useLocation();
    return <Navigate to={{ pathname: '/verify-email', search: location.search }} replace />;
};

export default VerifyEmailCallback;
