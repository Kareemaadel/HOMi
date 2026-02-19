// client\src\features\Loading\pages\LoadingPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoadingPage.css';

const LoadingPage: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState('focus'); // focus -> expand -> reveal

  useEffect(() => {
    // Stage 1: Focus on the House (0s - 1s)
    // Stage 2: Expand to full logo (1s - 2s)
    const expandTimer = setTimeout(() => setStage('expand'), 1000);
    
    // Stage 3: Fade out and navigate (2.7s - 3s)
    const exitTimer = setTimeout(() => setStage('exit'), 400);
    const navTimer = setTimeout(() => navigate('/tenant-home'), 3000);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

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