import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/live-chat', label: 'Live Chat', icon: '📱' },
    { path: '/live-chat1', label: 'Live Chat 1', icon: '💬' },
    { path: '/worker-demo', label: 'Worker Demo', icon: '👷' },
    { path: '/todo', label: 'Todo List', icon: '✅' },
  ];

  return (
    <nav style={{
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        height: '60px'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          textDecoration: 'none',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          NDZY Web
        </Link>

        {/* Navigation Items */}
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                color: location.pathname === item.path ? '#007bff' : '#666',
                backgroundColor: location.pathname === item.path ? '#e3f2fd' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* GitHub Link */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <a
            href="https://github.com/ndzy01"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px',
              backgroundColor: '#24292e',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>⭐</span>
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;