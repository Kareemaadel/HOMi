// client/src/features/Messages/components/ChatSidebar.tsx
import React, { useState } from 'react';
import { FiSearch, FiPlus, FiCheck } from 'react-icons/fi';
import './ChatSidebar.css';

const conversations = [
  { id: 1, name: 'Jane Cooper', time: '25m ago', msg: 'Great service.', avatar: 'https://i.pravatar.cc/150?u=jane', unread: 0, online: true },
  { id: 2, name: 'Courtney Henry', time: '1h ago', msg: 'I sent the documents.', avatar: 'https://i.pravatar.cc/150?u=courtney', unread: 2, online: true },
  { id: 3, name: 'Arlene McCoy', time: '3h ago', msg: 'The plumbing is fixed!', avatar: 'https://i.pravatar.cc/150?u=arlene', unread: 0, online: false },
  { id: 4, name: 'Dianne Russell', time: 'Yesterday', msg: 'When is the next inspection?', avatar: 'https://i.pravatar.cc/150?u=dianne', unread: 1, online: true },
  { id: 5, name: 'Jerome Bell', time: 'Yesterday', msg: 'Thank you for the help.', avatar: 'https://i.pravatar.cc/150?u=jerome', unread: 0, online: false },
  { id: 6, name: 'Guy Hawkins', time: '2 days ago', msg: 'Is the parking spot available?', avatar: 'https://i.pravatar.cc/150?u=guy', unread: 0, online: true },
  { id: 7, name: 'Eleanor Pena', time: '3 days ago', msg: 'Payment received.', avatar: 'https://i.pravatar.cc/150?u=eleanor', unread: 0, online: false },
  { id: 8, name: 'Wade Warren', time: '4 days ago', msg: 'I have a question about the lease.', avatar: 'https://i.pravatar.cc/150?u=wade', unread: 0, online: false },
  { id: 9, name: 'Arlene McCoy', time: '3h ago', msg: 'The plumbing is fixed!', avatar: 'https://i.pravatar.cc/150?u=arlene', unread: 0, online: false },
  { id: 10, name: 'Dianne Russell', time: 'Yesterday', msg: 'When is the next inspection?', avatar: 'https://i.pravatar.cc/150?u=dianne', unread: 1, online: true },


];

const ChatSidebar: React.FC = () => {
  const [activeId, setActiveId] = useState(2); // Set Courtney as default active
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const unreadCount = conversations.filter(chat => chat.unread > 0).length;
  const filteredConversations = activeTab === 'unread' 
    ? conversations.filter(chat => chat.unread > 0)
    : conversations;

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <div className="chat-title-row">
          <h2>Messages</h2>
          <div className="header-actions">
            <button className="icon-btn"><FiSearch /></button>
            <button className="icon-btn primary"><FiPlus /></button>
          </div>
        </div>
        
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
        {filteredConversations.map((chat) => (
          <div 
            key={chat.id} 
            className={`contact-item ${activeId === chat.id ? 'active' : ''}`}
            onClick={() => setActiveId(chat.id)}
          >
            <div className="avatar-wrapper">
              <img src={chat.avatar} alt={chat.name} />
              {chat.online && <span className="online-indicator" />}
            </div>
            <div className="contact-info">
              <div className="contact-top">
                <span className="name">{chat.name}</span>
                <span className="time">{chat.time}</span>
              </div>
              <div className="contact-bottom">
                <p className="last-msg">{chat.msg}</p>
                {chat.unread > 0 ? (
                  <span className="unread-badge">{chat.unread}</span>
                ) : (
                  <FiCheck className="read-icon" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;