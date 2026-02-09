// client/src/features/Messages/components/ChatWindow.tsx
import React from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { FiPhone, FiVideo, FiMoreHorizontal } from 'react-icons/fi';
import './ChatWindow.css';

const ChatWindow: React.FC = () => (
  <div className="chat-window">
    <div className="chat-header">
      <div className="user-meta">
        <img src="https://i.pravatar.cc/150?u=courtney" alt="Courtney" />
        <div>
          <h4>Courtney Henry</h4>
          <p>Product Designer & team lead</p>
        </div>
      </div>
      <div className="header-actions">
        <button className="action-btn"><FiMoreHorizontal /></button>
      </div>
    </div>

    <div className="message-history">
      <div className="date-separator">Wednesday 5:14PM</div>
      <MessageBubble type="received" text="Hi, I'm trying to make a purchase but I'm getting an error message." />
      <MessageBubble type="sent" isAudio={true} duration="00:02" />
      <MessageBubble type="sent" text="Hi, I'm trying to make a purchase but I'm getting an error message. Can you help me troubleshoot." />
    </div>

    <ChatInput />
  </div>
);

export default ChatWindow;