// client\src\features\Loading\pages\LoadingPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import './LoadingPage.css';

interface LoadingState {
  next?: string;
  force?: boolean;
}

const LoadingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LoadingState;
  const forceShow = state.force ?? false;
  const [stage, setStage] = useState('focus'); // focus -> expand -> reveal

  useEffect(() => {
    let cancelled = false;
    let expandTimer: ReturnType<typeof setTimeout> | undefined;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    let navTimer: ReturnType<typeof setTimeout> | undefined;

    const resolveDefaultPath = async (): Promise<string> => {
      const restored = await authService.tryRestoreSession();
      if (!restored) return '/guest-home';

      const role = authService.getCurrentUser()?.user?.role;
      return role === 'LANDLORD' ? '/landlord-home' : '/tenant-home';
    };

    const run = async () => {
      const hasSeen = sessionStorage.getItem('hasSeenLoading');
      const fallbackPath = await resolveDefaultPath();
      const nextPath = state.next || fallbackPath;
      const isDirectRootVisit = !state.next;

      if (cancelled) return;

      if (hasSeen && !forceShow && !isDirectRootVisit) {
        // Skip animation if already shown and not forced
        navigate(nextPath, { replace: true });
        return;
      }

      // Stage 1: Focus on the House (0s - 1s)
      // Stage 2: Expand to full logo (1s - 2s)
      expandTimer = setTimeout(() => setStage('expand'), 1000);

      // Stage 3: Fade out and navigate (2.7s - 3s)
      exitTimer = setTimeout(() => setStage('exit'), 2700);
      navTimer = setTimeout(() => {
        sessionStorage.setItem('hasSeenLoading', 'true');
        navigate(nextPath, { replace: true });
      }, 3000);
    };

    void run();

    return () => {
      cancelled = true;
      if (expandTimer) clearTimeout(expandTimer);
      if (exitTimer) clearTimeout(exitTimer);
      if (navTimer) clearTimeout(navTimer);
    };
  }, [navigate, state.next, forceShow]);

  return (
    <div className={`loading-wrapper stage-${stage}`}>
      <div className="portal-container">
        {/* The "O" Portal Effect */}
        <div className="logo-portal">
          <img src="/logo.png" alt="HOMi Logo" className="portal-image" />
        </div>
        
        {/* Decorative Ring around the house */}
        <div className="pulse-ring"></div>
      </div>

      <div className="loading-footer">
        <div className="loading-bar-container">
          <div className="loading-bar-fill"></div>
        </div>
        <p className="loading-subtitle">Securing your domain</p>
      </div>
    </div>
  );
};

export default LoadingPage;