import React from 'react';
import { FaSearch, FaUserFriends, FaPlusCircle, FaCalendarCheck } from 'react-icons/fa';
import './QuickActions.css';

const QuickActions = () => {
  const actions = [
    { id: 1, label: 'Properties', sub: 'Find a home', icon: <FaSearch />, color: 'blue' },
    { id: 2, label: 'Roommates', sub: 'Match now', icon: <FaUserFriends />, color: 'purple' },
    { id: 3, label: 'Request', sub: 'Fix something', icon: <FaPlusCircle />, color: 'green' },
    { id: 4, label: 'Amenity', sub: 'Book gym/pool', icon: <FaCalendarCheck />, color: 'orange' },
  ];

  return (
    <div className="quick-actions-wrapper">
      <div className="section-header">
        <h4>Shortcuts</h4>
        <div className="pulse-indicator"></div>
      </div>
      <div className="actions-grid">
        {actions.map((action) => (
          <button key={action.id} className={`action-card ${action.color}`}>
            <div className="icon-circle">
              {action.icon}
            </div>
            <div className="action-text">
              <span className="main-label">{action.label}</span>
              <span className="sub-label">{action.sub}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;