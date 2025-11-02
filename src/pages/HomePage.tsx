import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>欢迎来到 NDZY Web 应用</h1>
      <p>这是一个演示各种功能组件的应用程序。</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>功能组件</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
          <Link to="/live-chat" style={{ padding: '10px', textDecoration: 'none', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
            📱 Live Chat
          </Link>
          <Link to="/live-chat1" style={{ padding: '10px', textDecoration: 'none', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
            💬 Live Chat 1
          </Link>
          <Link to="/worker-demo" style={{ padding: '10px', textDecoration: 'none', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
            👷 Worker Demo
          </Link>
          <Link to="/todo" style={{ padding: '10px', textDecoration: 'none', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
            ✅ Todo List
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;