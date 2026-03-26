import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3, ArrowLeft } from 'lucide-react';
import './ComingSoon.css';

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-card">
        <div className="coming-soon-icon-wrap">
          <Clock3 size={40} />
        </div>

        <h1>{title}</h1>
        <p>{description || 'This page is under development and will be available soon.'}</p>

        <button type="button" className="coming-soon-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
