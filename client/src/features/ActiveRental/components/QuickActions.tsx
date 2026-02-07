import React from 'react';
import './QuickActions.css';
import { FaWrench, FaShieldAlt, FaFileInvoice, FaKey } from 'react-icons/fa';

const QuickActions = () => {
    const actions = [
        { icon: <FaWrench />, label: "Request Repair", class: "wrench" },
        { icon: <FaShieldAlt />, label: "Insurance", class: "shield" },
        { icon: <FaFileInvoice />, label: "Documents", class: "docs" },
        { icon: <FaKey />, label: "Guest Access", class: "key" },
    ];

    return (
        <div className="quick-actions-bar">
            {actions.map((action, index) => (
                <button key={index} className="action-button">
                    <div className={`icon-wrapper ${action.class}`}>
                        {action.icon}
                    </div>
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickActions;