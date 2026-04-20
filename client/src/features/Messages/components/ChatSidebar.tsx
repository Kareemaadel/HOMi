// client/src/features/Messages/components/ChatSidebar.tsx
import React, { useState } from 'react';
import { FiSearch, FiPlus, FiCheck } from 'react-icons/fi';
import type { ConversationDto } from '../../../services/message.service';
import './ChatSidebar.css';

interface ChatSidebarProps {
  conversations: ConversationDto[];
  activeId: string | null;
  onSelectConversation: (conversationId: string) => void;
  /** Omitted for landlords (e.g. new chats start from tenant browse flow). */
  onCreateConversation?: () => void;
  isLoading: boolean;
}

const formatRelativeTime = (iso: string | null): string => {
  if (!iso) {
    return 'No messages yet';
  }

  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMinutes = Math.floor((now - then) / 60000);

  if (diffMinutes < 1) return 'Now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return `${Math.floor(diffMinutes / 1440)}d ago`;
};

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onCreateConversation,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const unreadCount = conversations.filter(chat => chat.unreadCount > 0).length;
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredConversations = conversations.filter((chat) => {
    if (activeTab === 'unread' && chat.unreadCount <= 0) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const fullName = `${chat.counterpart.firstName} ${chat.counterpart.lastName}`.trim().toLowerCase();
    const messageBody = (chat.lastMessage?.body ?? '').toLowerCase();
    return fullName.includes(normalizedSearch) || messageBody.includes(normalizedSearch);
  });

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <div className="chat-title-row">
          <h2>Messages</h2>
          <div className="header-actions">
            <button
              type="button"
              className={`icon-btn ${showSearch ? 'active' : ''}`}
              onClick={() => setShowSearch((current) => !current)}
              aria-label="Toggle conversation search"
            >
              <FiSearch />
            </button>
            {onCreateConversation ? (
              <button
                type="button"
                className="icon-btn primary"
                onClick={onCreateConversation}
                aria-label="Start a new conversation"
              >
                <FiPlus />
              </button>
            ) : null}
          </div>
        </div>

        {showSearch && (
          <div className="sidebar-search-row">
            <input
              type="text"
              placeholder="Search by name or message"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        )}
        
        <div className="chat-tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({conversations.length})
          </button>
          <button 
            className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      <div className="conversation-list-scroll">
        {isLoading && <div className="conversation-empty">Loading conversations...</div>}
        {!isLoading && filteredConversations.length === 0 && (
          <div className="conversation-empty">
            {normalizedSearch ? 'No matching conversations found.' : 'No conversations yet.'}
          </div>
        )}
        {filteredConversations.map((chat) => {
          const fullName = `${chat.counterpart.firstName} ${chat.counterpart.lastName}`.trim() || 'User';
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff&size=80`;

          return (
            <button
              key={chat.id}
              type="button"
              className={`contact-item ${activeId === chat.id ? 'active' : ''}`}
              onClick={() => onSelectConversation(chat.id)}
            >
              <div className="avatar-wrapper">
                <img src={chat.counterpart.avatarUrl || fallbackAvatar} alt={fullName} />
              </div>
              <div className="contact-info">
                <div className="contact-top">
                  <span className="name">{fullName}</span>
                  <span className="time">{formatRelativeTime(chat.lastMessageAt)}</span>
                </div>
                <div className="contact-bottom">
                  <p className="last-msg">{chat.lastMessage?.body || 'No messages yet'}</p>
                  {chat.unreadCount > 0 ? (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  ) : (
                    <FiCheck className="read-icon" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChatSidebar;