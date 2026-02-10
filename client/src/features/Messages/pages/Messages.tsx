// client/src/features/Messages/pages/Messages.tsx
import React from 'react';
import Header from '../../../components/global/Landlord/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/Landlord/footer';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import './Messages.css';

const Messages: React.FC = () => {
  return (
    <div className="messages-page-layout">
      <Sidebar />
      <div className="messages-main-content">
        <Header />
        <div className="messages-hub-container">
          <ChatSidebar />
          <ChatWindow />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Messages;