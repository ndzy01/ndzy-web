import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// 导入页面组件
import HomePage from './pages/HomePage';
import LiveChatPage from './pages/LiveChatPage';
import LiveChat1Page from './pages/LiveChat1Page';
import WorkerDemoPage from './pages/WorkerDemoPage';
import TodoListPage from './pages/TodoListPage';
import DeviceInfoPage from './pages/DeviceInfoPage';
import IdleCallbackPage from './pages/IdleCallbackPage';
import AnimationFramePage from './pages/AnimationFramePage';
import TimerDemoPage from './pages/TimerDemoPage';
import RafTimerDemoPage from './pages/RafTimerDemoPage';

// 导入通用组件
import Navigation from './components/Navigation';

const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navigation />
      <main>
        <Routes>
          {/* 所有路由都是公开的 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/live-chat" element={<LiveChatPage />} />
          <Route path="/live-chat1" element={<LiveChat1Page />} />
          <Route path="/worker-demo" element={<WorkerDemoPage />} />
          <Route path="/todo" element={<TodoListPage />} />
          <Route path="/device-info" element={<DeviceInfoPage />} />
          <Route path="/idle-callback" element={<IdleCallbackPage />} />
          <Route path="/animation-frame" element={<AnimationFramePage />} />
          <Route path="/timer-demo" element={<TimerDemoPage />} />
          <Route path="/raf-timer-demo" element={<RafTimerDemoPage />} />

          {/* 404 页面 */}
          <Route
            path="*"
            element={
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>404 - 页面未找到</h1>
                <p>您访问的页面不存在</p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;
