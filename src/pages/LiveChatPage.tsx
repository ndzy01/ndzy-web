import React from 'react';
import LiveChat from '../components/LiveChat';

const LiveChatPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Live Chat</h1>
      <LiveChat />
    </div>
  );
};

export default LiveChatPage;