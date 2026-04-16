// client/src/features/Messages/components/MessageBubble.tsx
import React from 'react';
import './MessageBubble.css';

interface Props {
  type: 'sent' | 'received';
  text: string;
  createdAt: string;
  readAt?: string | null;
}

const MessageBubble: React.FC<Props> = ({ type, text, createdAt, readAt }) => (
  <div className={`bubble-wrapper ${type}`}>
    <div className="bubble-content">
      <p>{text}</p>
    </div>
    <div className="bubble-meta">
      <span>{new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      {type === 'sent' && <span className="read-status">{readAt ? 'Seen' : 'Sent'}</span>}
    </div>
  </div>
);

export default MessageBubble;