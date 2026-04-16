// client/src/features/Messages/components/ChatInput.tsx
import React, { useState } from 'react';
import { FiSmile, FiAtSign, FiMoreVertical } from 'react-icons/fi';
import './ChatInput.css';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, disabled = false }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

    const commonEmojis = ['😀', '👍', '🙏', '🎉', '🏠', '✅', '👀', '😊'];

    const appendText = (text: string) => {
      onChange(`${value}${text}`);
    };

  return (
    <div className="chat-input-container">
      <div className="input-wrapper">
        <input
          type="text"
          placeholder="Type your message here..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          disabled={disabled}
        />
        <div className="input-actions">
            <div className="input-action-menu-wrap">
              <button
                type="button"
                className="icon-action-btn"
                onClick={() => {
                  setShowEmojiPicker((current) => !current);
                  setShowQuickMenu(false);
                }}
                disabled={disabled}
                aria-label="Open emoji picker"
              >
                <FiSmile className="action-icon" />
              </button>
              {showEmojiPicker && (
                <div className="emoji-picker" role="menu">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        appendText(emoji);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="icon-action-btn"
              onClick={() => appendText('@')}
              disabled={disabled}
              aria-label="Insert mention"
            >
              <FiAtSign className="action-icon" />
            </button>

            <div className="input-action-menu-wrap">
              <button
                type="button"
                className="icon-action-btn"
                onClick={() => {
                  setShowQuickMenu((current) => !current);
                  setShowEmojiPicker(false);
                }}
                disabled={disabled}
                aria-label="Open quick actions"
              >
                <FiMoreVertical className="action-icon" />
              </button>
              {showQuickMenu && (
                <div className="quick-actions-menu" role="menu">
                  <button
                    type="button"
                    onClick={() => {
                      appendText('Hi! Is this still available? ');
                      setShowQuickMenu(false);
                    }}
                  >
                    Insert availability template
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      appendText('Thanks! I would like to schedule a viewing. ');
                      setShowQuickMenu(false);
                    }}
                  >
                    Insert viewing template
                  </button>
                </div>
              )}
            </div>

          <button className="send-btn" onClick={onSend} disabled={disabled || !value.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;