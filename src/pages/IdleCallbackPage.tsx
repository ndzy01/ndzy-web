import React, { useState, useCallback } from 'react';
import { useIdleCallback } from '../hooks/useIdleCallback';
import './IdleCallbackPage.css';

interface Task {
  id: number;
  name: string;
  status: 'pending' | 'processing' | 'completed';
}

const IdleCallbackPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: '数据处理任务 1', status: 'pending' },
    { id: 2, name: '数据处理任务 2', status: 'pending' },
    { id: 3, name: '数据处理任务 3', status: 'pending' },
    { id: 4, name: '数据处理任务 4', status: 'pending' },
    { id: 5, name: '数据处理任务 5', status: 'pending' },
  ]);
  const [log, setLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string) => {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const processTasks = useCallback((deadline: IdleDeadline) => {
    addLog(`空闲时间可用: ${deadline.timeRemaining().toFixed(2)}ms`);

    setTasks((currentTasks) => {
      const updatedTasks = [...currentTasks];
      let processed = false;

      while (deadline.timeRemaining() > 0 && !processed) {
        const pendingIndex = updatedTasks.findIndex((t) => t.status === 'pending');
        
        if (pendingIndex !== -1) {
          updatedTasks[pendingIndex] = {
            ...updatedTasks[pendingIndex],
            status: 'processing',
          };

          // 模拟处理任务
          const startTime = performance.now();
          let sum = 0;
          for (let i = 0; i < 1000000; i++) {
            sum += Math.random();
          }
          const duration = performance.now() - startTime;

          updatedTasks[pendingIndex] = {
            ...updatedTasks[pendingIndex],
            status: 'completed',
          };

          addLog(`任务 ${updatedTasks[pendingIndex].name} 已完成 (耗时: ${duration.toFixed(2)}ms)`);
          processed = true;
        } else {
          setIsRunning(false);
          addLog('所有任务已完成！');
          break;
        }
      }

      return updatedTasks;
    });
  }, []);

  useIdleCallback(isRunning ? processTasks : () => {});

  const startProcessing = () => {
    setTasks((prev) =>
      prev.map((task) => ({ ...task, status: 'pending' }))
    );
    setLog([]);
    setIsRunning(true);
    addLog('开始使用 requestIdleCallback 处理任务...');
  };

  const resetTasks = () => {
    setTasks([
      { id: 1, name: '数据处理任务 1', status: 'pending' },
      { id: 2, name: '数据处理任务 2', status: 'pending' },
      { id: 3, name: '数据处理任务 3', status: 'pending' },
      { id: 4, name: '数据处理任务 4', status: 'pending' },
      { id: 5, name: '数据处理任务 5', status: 'pending' },
    ]);
    setLog([]);
    setIsRunning(false);
  };

  return (
    <div className="idle-callback-page">
      <div className="container">
        <h1>requestIdleCallback 示例</h1>
        <p className="description">
          requestIdleCallback 允许在浏览器空闲时执行低优先级任务，不会阻塞主线程。
          适用于非关键任务，如数据处理、日志记录、分析等。
        </p>

        <div className="controls">
          <button onClick={startProcessing} disabled={isRunning} className="btn-primary">
            开始处理任务
          </button>
          <button onClick={resetTasks} className="btn-secondary">
            重置任务
          </button>
        </div>

        <div className="content-grid">
          <div className="task-list">
            <h2>任务列表</h2>
            {tasks.map((task) => (
              <div key={task.id} className={`task-item ${task.status}`}>
                <span className="task-name">{task.name}</span>
                <span className={`status-badge ${task.status}`}>
                  {task.status === 'pending' && '待处理'}
                  {task.status === 'processing' && '处理中...'}
                  {task.status === 'completed' && '✓ 已完成'}
                </span>
              </div>
            ))}
          </div>

          <div className="log-panel">
            <h2>处理日志</h2>
            <div className="log-content">
              {log.length === 0 ? (
                <p className="empty-log">点击"开始处理任务"查看日志...</p>
              ) : (
                log.map((entry, index) => (
                  <div key={index} className="log-entry">
                    {entry}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>关键特性</h3>
          <ul>
            <li>利用浏览器空闲时间执行任务</li>
            <li>不会阻塞用户交互和动画</li>
            <li>可以通过 deadline.timeRemaining() 检查剩余时间</li>
            <li>适合处理非紧急的后台任务</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IdleCallbackPage;
