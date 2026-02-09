// client/src/features/Messages/components/MessageBubble.tsx
import React from 'react';
import { FiPlay } from 'react-icons/fi';
import './MessageBubble.css';

interface Props { type: 'sent' | 'received'; text?: string; isAudio?: boolean; duration?: string; }

const MessageBubble: React.FC<Props> = ({ type, text, isAudio, duration }) => (
  <div className={`bubble-wrapper ${type}`}>
    <div className="bubble-content">
      {isAudio ? (
        <div className="audio-player">
          <button className="play-btn"><FiPlay /></button>
          <div className="waveform">
            <div className="progress" style={{ width: '40%' }}></div>
          </div>
          <span className="duration">{duration}</span>
        </div>
      ) : (
        <p>{text}</p>
      )}
    </div>
    {type === 'sent' && <div className="read-status">Seen</div>}
  </div>
);

export default MessageBubble;