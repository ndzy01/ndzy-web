import React, { useState } from 'react';
import { useRafTimer } from '../hooks/useRafTimer';
import './RafTimerDemoPage.css';

const RafTimerDemoPage: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [customDuration, setCustomDuration] = useState(10);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
  };

  // 示例1: 基础正计时
  const stopwatchFrame = useRafTimer({
    mode: 'stopwatch',
  });

  // 示例2: 秒级正计时（带回调）
  const stopwatchSecond = useRafTimer({
    mode: 'stopwatch',
    onTick: (time) => {
      const seconds = Math.floor(time / 1000);
      if (seconds > 0 && seconds % 10 === 0) {
        addLog(`秒级正计时已运行 ${seconds} 秒`);
      }
    },
  });

  // 示例3: 活动倒计时（10分钟）
  const activityCountdown = useRafTimer({
    mode: 'countdown',
    duration: 10 * 60 * 1000,
    onComplete: () => {
      addLog('🎉 活动开始！倒计时结束');
    },
    onTick: (remaining) => {
      const seconds = Math.ceil(remaining / 1000);
      if (seconds === 60 || seconds === 30 || seconds === 10) {
        addLog(`⚠️ 还有 ${seconds} 秒活动开始`);
      }
    },
  });

  // 示例4: 可暂停继续的定时器
  const pausableTimer = useRafTimer({
    mode: 'stopwatch',
  });

  // 示例5: 动态时长倒计时
  const dynamicCountdown = useRafTimer({
    mode: 'countdown',
    duration: customDuration * 1000,
    onComplete: () => {
      addLog(`✅ ${customDuration}秒倒计时完成`);
    },
  });

  return (
    <div className="raf-timer-demo-page">
      <div className="container">
        <header className="page-header">
          <h1>⏱️ useRafTimer Hook 演示</h1>
          <p className="subtitle">
            基于 requestAnimationFrame 的高精度定时器 Hook
          </p>
        </header>

        <div className="demo-grid">
          {/* 示例1: 基础正计时 */}
          <div className="demo-card">
            <div className="card-header">
              <h3>📊 基础正计时</h3>
              <span className="badge second-badge">秒级更新</span>
            </div>
            <div className="timer-display large">
              {stopwatchFrame.formattedTime}
            </div>
            <div className="card-controls">
              <button
                onClick={() => stopwatchFrame.start()}
                disabled={stopwatchFrame.isRunning}
                className="btn btn-start"
              >
                开始
              </button>
              <button
                onClick={() => stopwatchFrame.stop()}
                disabled={!stopwatchFrame.isRunning}
                className="btn btn-stop"
              >
                停止
              </button>
              <button
                onClick={() => stopwatchFrame.reset()}
                className="btn btn-reset"
              >
                重置
              </button>
            </div>
            <div className="card-info">
              <code>mode: 'stopwatch'</code>
              <p>秒级更新，减少重渲染</p>
            </div>
          </div>

          {/* 示例2: 秒级正计时 */}
          <div className="demo-card">
            <div className="card-header">
              <h3>⏰ 秒级正计时</h3>
              <span className="badge second-badge">秒级更新</span>
            </div>
            <div className="timer-display large">
              {stopwatchSecond.formattedTime}
            </div>
            <div className="card-controls">
              <button
                onClick={() => {
                  stopwatchSecond.start();
                  addLog('秒级正计时已启动');
                }}
                disabled={stopwatchSecond.isRunning}
                className="btn btn-start"
              >
                开始
              </button>
              <button
                onClick={() => stopwatchSecond.stop()}
                disabled={!stopwatchSecond.isRunning}
                className="btn btn-stop"
              >
                停止
              </button>
              <button
                onClick={() => stopwatchSecond.reset()}
                className="btn btn-reset"
              >
                重置
              </button>
            </div>
            <div className="card-info">
              <code>onTick</code>
              <p>秒级更新，带回调函数</p>
            </div>
          </div>

          {/* 示例3: 活动倒计时 */}
          <div className="demo-card highlight">
            <div className="card-header">
              <h3>🎯 活动倒计时</h3>
              <span
                className={`status-badge ${activityCountdown.isRunning ? 'running' : ''}`}
              >
                {activityCountdown.isRunning ? '运行中' : '已停止'}
              </span>
            </div>
            <div className="timer-display xlarge countdown">
              {activityCountdown.formattedTime}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(activityCountdown.time / (10 * 60 * 1000)) * 100}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div className="card-controls">
              <button
                onClick={() => {
                  activityCountdown.start();
                  addLog('活动倒计时开始：10分钟');
                }}
                disabled={activityCountdown.isRunning}
                className="btn btn-primary"
              >
                启动倒计时
              </button>
              <button
                onClick={() => {
                  activityCountdown.stop();
                  addLog('倒计时已暂停');
                }}
                disabled={!activityCountdown.isRunning}
                className="btn btn-warning"
              >
                暂停
              </button>
              <button
                onClick={() => {
                  activityCountdown.resume();
                  addLog('倒计时已继续');
                }}
                disabled={
                  activityCountdown.isRunning || activityCountdown.time === 0
                }
                className="btn btn-success"
              >
                继续
              </button>
              <button
                onClick={() => activityCountdown.reset()}
                className="btn btn-reset"
              >
                重置
              </button>
            </div>
            <div className="card-info">
              <code>duration: 10 * 60 * 1000</code>
              <p>带 onComplete 回调的倒计时</p>
            </div>
          </div>

          {/* 示例4: 暂停/继续 */}
          <div className="demo-card">
            <div className="card-header">
              <h3>⏯️ 暂停/继续</h3>
              <span
                className={`status-badge ${pausableTimer.isRunning ? 'running' : 'paused'}`}
              >
                {pausableTimer.isRunning ? '运行中' : '已暂停'}
              </span>
            </div>
            <div className="timer-display large">
              {pausableTimer.formattedTime}
            </div>
            <div className="card-controls">
              <button
                onClick={() => {
                  pausableTimer.start();
                  addLog('定时器已启动');
                }}
                disabled={pausableTimer.isRunning}
                className="btn btn-start"
              >
                开始
              </button>
              <button
                onClick={() => {
                  pausableTimer.stop();
                  addLog(`定时器已暂停于 ${pausableTimer.formattedTime}`);
                }}
                disabled={!pausableTimer.isRunning}
                className="btn btn-warning"
              >
                暂停
              </button>
              <button
                onClick={() => {
                  pausableTimer.resume();
                  addLog('定时器已继续');
                }}
                disabled={pausableTimer.isRunning || pausableTimer.time === 0}
                className="btn btn-success"
              >
                继续
              </button>
              <button
                onClick={() => pausableTimer.reset()}
                className="btn btn-reset"
              >
                重置
              </button>
            </div>
            <div className="card-info">
              <code>stop() / resume()</code>
              <p>支持暂停后从当前位置继续</p>
            </div>
          </div>

          {/* 示例5: 动态修改时长 */}
          <div className="demo-card">
            <div className="card-header">
              <h3>🔧 动态时长</h3>
              <span className="badge custom-badge">可配置</span>
            </div>
            <div className="timer-display large">
              {dynamicCountdown.formattedTime}
            </div>
            <div className="duration-control">
              <label htmlFor="duration-input">设置时长（秒）：</label>
              <input
                id="duration-input"
                type="number"
                min="1"
                max="300"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                disabled={dynamicCountdown.isRunning}
              />
            </div>
            <div className="card-controls">
              <button
                onClick={() => {
                  dynamicCountdown.start(customDuration * 1000);
                  addLog(`启动 ${customDuration} 秒倒计时`);
                }}
                disabled={dynamicCountdown.isRunning}
                className="btn btn-primary"
              >
                启动
              </button>
              <button
                onClick={() => dynamicCountdown.stop()}
                disabled={!dynamicCountdown.isRunning}
                className="btn btn-stop"
              >
                停止
              </button>
              <button
                onClick={() => dynamicCountdown.reset()}
                className="btn btn-reset"
              >
                重置
              </button>
            </div>
            <div className="card-info">
              <code>start(newDuration)</code>
              <p>运行时动态修改倒计时时长</p>
            </div>
          </div>

          {/* 日志面板 */}
          <div className="demo-card log-panel">
            <div className="card-header">
              <h3>📝 回调日志</h3>
              <button
                onClick={() => setLogs([])}
                className="btn btn-sm btn-clear"
              >
                清空
              </button>
            </div>
            <div className="log-container">
              {logs.length === 0 ? (
                <div className="log-empty">暂无日志记录</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="log-item">
                    {log}
                  </div>
                ))
              )}
            </div>
            <div className="card-info">
              <p>onComplete 和 onTick 回调触发记录</p>
            </div>
          </div>
        </div>

        {/* 使用示例代码 */}
        <section className="code-examples">
          <h2>💻 使用示例</h2>

          <div className="code-block">
            <h4>基础用法 - 正计时</h4>
            <pre>
              <code>{`const timer = useRafTimer({
  mode: 'stopwatch'
});

// 控制方法
timer.start();  // 开始
timer.stop();   // 暂停
timer.resume(); // 继续
timer.reset();  // 重置

// 状态
timer.time       // 当前时间（毫秒）
timer.isRunning  // 是否运行中`}</code>
            </pre>
          </div>

          <div className="code-block">
            <h4>倒计时 + 回调</h4>
            <pre>
              <code>{`const countdown = useRafTimer({
  mode: 'countdown',
  duration: 10 * 60 * 1000, // 10分钟
  onComplete: () => {
    console.log('倒计时结束！');
    // 跳转、提示等操作
  },
  onTick: (remaining) => {
    const seconds = Math.ceil(remaining / 1000);
    if (seconds === 60) {
      console.log('还有1分钟');
    }
  }
});`}</code>
            </pre>
          </div>

          <div className="code-block">
            <h4>动态修改时长</h4>
            <pre>
              <code>{`// 启动时指定新的时长
timer.start(customDuration * 1000);

// 示例：用户输入倒计时时长
const [duration, setDuration] = useState(60);
<input 
  value={duration} 
  onChange={(e) => setDuration(Number(e.target.value))}
/>
<button onClick={() => timer.start(duration * 1000)}>
  启动
</button>`}</code>
            </pre>
          </div>
        </section>

        {/* API 文档 */}
        <section className="api-docs">
          <h2>📚 API 文档</h2>

          <div className="api-table">
            <h4>配置选项（UseRafTimerOptions）</h4>
            <table>
              <thead>
                <tr>
                  <th>参数</th>
                  <th>类型</th>
                  <th>必填</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>mode</td>
                  <td>'stopwatch' | 'countdown'</td>
                  <td>✅</td>
                  <td>定时器模式：正计时或倒计时</td>
                </tr>
                <tr>
                  <td>duration</td>
                  <td>number</td>
                  <td>✅</td>
                  <td>倒计时时长（毫秒），countdown模式必需</td>
                </tr>
                <tr>
                  <td>initialTime</td>
                  <td>number</td>
                  <td>❌</td>
                  <td>正计时初始时间（毫秒），stopwatch模式可选，默认0</td>
                </tr>
                <tr>
                  <td>autoStart</td>
                  <td>boolean</td>
                  <td>❌</td>
                  <td>是否自动开始，默认false</td>
                </tr>
                <tr>
                  <td>onComplete</td>
                  <td>() =&gt; void</td>
                  <td>❌</td>
                  <td>倒计时结束回调</td>
                </tr>
                <tr>
                  <td>onTick</td>
                  <td>(time: number) =&gt; void</td>
                  <td>❌</td>
                  <td>每次更新回调</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="api-table">
            <h4>返回值（UseRafTimerReturn）</h4>
            <table>
              <thead>
                <tr>
                  <th>属性/方法</th>
                  <th>类型</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>time</td>
                  <td>number</td>
                  <td>当前时间值（毫秒）</td>
                </tr>
                <tr>
                  <td>isRunning</td>
                  <td>boolean</td>
                  <td>是否正在运行</td>
                </tr>
                <tr>
                  <td>start</td>
                  <td>(newDuration?: number) =&gt; void</td>
                  <td>开始/重新开始定时器</td>
                </tr>
                <tr>
                  <td>stop</td>
                  <td>() =&gt; void</td>
                  <td>暂停（保留进度）</td>
                </tr>
                <tr>
                  <td>resume</td>
                  <td>() =&gt; void</td>
                  <td>从暂停处继续</td>
                </tr>
                <tr>
                  <td>reset</td>
                  <td>() =&gt; void</td>
                  <td>重置到初始状态</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RafTimerDemoPage;
