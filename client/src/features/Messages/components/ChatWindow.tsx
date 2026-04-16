// client/src/features/Messages/components/ChatWindow.tsx
import React, { useState, useMemo } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { FiMoreHorizontal } from 'react-icons/fi';
import type { ConversationDto, MessageDto } from '../../../services/message.service';
import './ChatWindow.css';

interface ChatWindowProps {
  conversation: ConversationDto | null;
  messages: MessageDto[];
  currentUserId: string | null;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onRefreshConversation: () => void;
  onClearDraft: () => void;
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  currentUserId,
  draft,
  onDraftChange,
  onSend,
  onRefreshConversation,
  onClearDraft,
  isLoading,
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const counterpartName = useMemo(() => {
    if (!conversation) {
      return 'Select a conversation';
    }
    return `${conversation.counterpart.firstName} ${conversation.counterpart.lastName}`.trim();
  }, [conversation]);

  const counterpartSubtitle = useMemo(() => {
    if (!conversation) {
      return 'Choose a chat from the left panel';
    }
    return conversation.counterpart.role === 'LANDLORD' ? 'Landlord' : 'Tenant';
  }, [conversation]);

  const handleCopyConversationId = async () => {
    if (!conversation?.id || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(conversation.id);
    } catch (error) {
      console.error('Failed to copy conversation id:', error);
    }
  };

  return (
  <div className="chat-window">
    <div className="chat-header">
      <div className="user-meta">
        <img
          src={conversation?.counterpart.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(counterpartName || 'User')}&background=6366f1&color=fff&size=80`}
          alt={counterpartName}
        />
        <div>
          <h4>{counterpartName}</h4>
          <p>{counterpartSubtitle}</p>
        </div>
      </div>
      <div className="header-actions">
        <div className="header-menu-wrap">
          <button
            type="button"
            className="action-btn"
            onClick={() => setShowActionsMenu((current) => !current)}
            aria-label="Open conversation actions"
          >
            <FiMoreHorizontal />
          </button>
          {showActionsMenu && (
            <div className="chat-header-menu" role="menu">
              <button
                type="button"
                onClick={() => {
                  onRefreshConversation();
                  setShowActionsMenu(false);
                }}
                disabled={!conversation}
              >
                Refresh messages
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearDraft();
                  setShowActionsMenu(false);
                }}
              >
                Clear draft
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleCopyConversationId();
                  setShowActionsMenu(false);
                }}
                disabled={!conversation}
              >
                Copy conversation ID
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="message-history">
      {!conversation && <div className="date-separator">Select a conversation to start chatting.</div>}
      {conversation && isLoading && <div className="date-separator">Loading messages...</div>}
      {conversation && !isLoading && messages.length === 0 && <div className="date-separator">No messages yet.</div>}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          type={message.senderId === currentUserId ? 'sent' : 'received'}
          text={message.body}
          createdAt={message.createdAt}
          readAt={message.readAt}
        />
      ))}
    </div>

    <ChatInput value={draft} onChange={onDraftChange} onSend={onSend} disabled={!conversation} />
  </div>
  );
};

export default ChatWindow;