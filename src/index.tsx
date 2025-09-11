import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('https://www.ndzy01.com/ndzy-web/service-worker.js')
      .then((registration) => {
        console.log('Service Worker 注册成功: ', registration);
      })
      .catch((error) => {
        console.log('Service Worker 注册失败: ', error);
      });
  });
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
