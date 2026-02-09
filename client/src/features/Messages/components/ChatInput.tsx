// client/src/features/Messages/components/ChatInput.tsx
import React from 'react';
import { FiSmile, FiAtSign, FiMoreVertical } from 'react-icons/fi';
import './ChatInput.css';

const ChatInput: React.FC = () => (
  <div className="chat-input-container">
    <div className="input-wrapper">
      <input type="text" placeholder="Type your message here..." />
      <div className="input-actions">
        <FiSmile className="action-icon" />
        <FiAtSign className="action-icon" />
        <FiMoreVertical className="action-icon" />
        <button className="send-btn">Send</button>
      </div>
    </div>
  </div>
);

export default ChatInput;