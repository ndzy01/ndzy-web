import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/live-chat', label: 'Live Chat', icon: '📱' },
    { path: '/live-chat1', label: 'Live Chat 1', icon: '💬' },
    { path: '/worker-demo', label: 'Worker Demo', icon: '👷' },
    { path: '/todo', label: 'Todo List', icon: '✅' },
    { path: '/device-info', label: 'Device Info', icon: '🔍' },
    { path: '/idle-callback', label: 'Idle Callback', icon: '⏱️' },
    { path: '/animation-frame', label: 'Animation Frame', icon: '🎬' },
    { path: '/timer-demo', label: '定时器对比', icon: '⏰' },
    { path: '/raf-timer-demo', label: 'RAF Timer Hook', icon: '⚡' },
  ];

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // 禁止背景滚动
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            NDZY Web
          </Link>

          {/* Desktop Navigation Items */}
          <div className="nav-items">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-link-icon">{item.icon}</span>
                <span className="nav-link-text">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop GitHub Link */}
          <div className="nav-actions">
            <a
              href="https://github.com/ndzy01"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              <span>⭐</span>
              <span>GitHub</span>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="menu-toggle"
            onClick={toggleDrawer}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
        onClick={closeDrawer}
      />

      {/* Mobile Drawer */}
      <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">NDZY Web</h2>
          <button
            className="drawer-close"
            onClick={closeDrawer}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="drawer-content">
          <div className="drawer-nav-items">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`drawer-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={closeDrawer}
              >
                <span className="drawer-nav-link-icon">{item.icon}</span>
                <span className="drawer-nav-link-text">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="drawer-footer">
          <a
            href="https://github.com/ndzy01"
            target="_blank"
            rel="noopener noreferrer"
            className="drawer-github-link"
            onClick={closeDrawer}
          >
            <span>⭐</span>
            <span>Star on GitHub</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Navigation;
