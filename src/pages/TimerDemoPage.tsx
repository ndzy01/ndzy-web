import React, { useState, useRef, useCallback } from 'react';
import './TimerDemoPage.css';
import { useRafTimer } from '../hooks/useRafTimer';

const TimerDemoPage: React.FC = () => {
  // requestAnimationFrame 定时器 - 使用 useRafTimer hook
  const rafTimer = useRafTimer({
    mode: 'stopwatch'
  });

  // requestIdleCallback 定时器
  const [idleTime, setIdleTime] = useState(0);
  const [idleRunning, setIdleRunning] = useState(false);
  const idleStartRef = useRef<number>(0);
  const idleIdRef = useRef<number | undefined>(undefined);

  // setTimeout 对比定时器
  const [setTimeoutTime, setSetTimeoutTime] = useState(0);
  const [setTimeoutRunning, setSetTimeoutRunning] = useState(false);
  const setTimeoutStartRef = useRef<number>(0);
  const setTimeoutIdRef = useRef<number | undefined>(undefined);

  // 倒计时 - requestIdleCallback
  const [idleCountdown, setIdleCountdown] = useState(0);
  const [idleCountdownRunning, setIdleCountdownRunning] = useState(false);
  const idleCountdownStartRef = useRef<number>(0);
  const idleCountdownTargetRef = useRef<number>(0);
  const idleCountdownIdRef = useRef<number | undefined>(undefined);

  // 倒计时 - setTimeout
  const [timeoutCountdown, setTimeoutCountdown] = useState(0);
  const [timeoutCountdownRunning, setTimeoutCountdownRunning] = useState(false);
  const timeoutCountdownStartRef = useRef<number>(0);
  const timeoutCountdownTargetRef = useRef<number>(0);
  const timeoutCountdownIdRef = useRef<number | undefined>(undefined);

  // 倒计时设置
  const [countdownSeconds, setCountdownSeconds] = useState(60);

  // requestIdleCallback 定时器逻辑
  const idleTick = useCallback(() => {
    if (!idleStartRef.current) {
      idleStartRef.current = performance.now();
    }
    const elapsed = performance.now() - idleStartRef.current;
    setIdleTime(elapsed);
    idleIdRef.current = requestIdleCallback(idleTick);
  }, []);

  const startIdleTimer = () => {
    setIdleRunning(true);
    idleStartRef.current = 0;
    setIdleTime(0);
    idleIdRef.current = requestIdleCallback(idleTick);
  };

  const stopIdleTimer = () => {
    setIdleRunning(false);
    if (idleIdRef.current) {
      cancelIdleCallback(idleIdRef.current);
    }
  };

  const resetIdleTimer = () => {
    stopIdleTimer();
    setIdleTime(0);
    idleStartRef.current = 0;
  };

  // setTimeout 定时器逻辑
  const setTimeoutTick = useCallback(() => {
    if (!setTimeoutStartRef.current) {
      setTimeoutStartRef.current = performance.now();
    }
    const elapsed = performance.now() - setTimeoutStartRef.current;
    setSetTimeoutTime(elapsed);
    setTimeoutIdRef.current = window.setTimeout(setTimeoutTick, 16);
  }, []);

  const startSetTimeoutTimer = () => {
    setSetTimeoutRunning(true);
    setTimeoutStartRef.current = 0;
    setSetTimeoutTime(0);
    setTimeoutTick();
  };

  const stopSetTimeoutTimer = () => {
    setSetTimeoutRunning(false);
    if (setTimeoutIdRef.current) {
      clearTimeout(setTimeoutIdRef.current);
    }
  };

  const resetSetTimeoutTimer = () => {
    stopSetTimeoutTimer();
    setSetTimeoutTime(0);
    setTimeoutStartRef.current = 0;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
  };

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    return `${totalSeconds}秒`;
  };

  // 倒计时 - requestAnimationFrame - 使用 useRafTimer hook
  const rafCountdownTimer = useRafTimer({
    mode: 'countdown',
    duration: countdownSeconds * 1000,
    onComplete: () => {
      console.log('RAF 倒计时完成！');
    }
  });

  // 倒计时 - requestIdleCallback
  const idleCountdownTick = useCallback(() => {
    if (!idleCountdownStartRef.current) {
      idleCountdownStartRef.current = performance.now();
    }
    const elapsed = performance.now() - idleCountdownStartRef.current;
    const remaining = Math.max(0, idleCountdownTargetRef.current - elapsed);
    
    // 每秒更新一次显示
    const currentSecond = Math.ceil(remaining / 1000);
    const displaySecond = Math.ceil(idleCountdown / 1000);
    if (currentSecond !== displaySecond) {
      setIdleCountdown(remaining);
    }
    
    if (remaining > 0) {
      idleCountdownIdRef.current = requestIdleCallback(idleCountdownTick);
    } else {
      setIdleCountdown(0);
      setIdleCountdownRunning(false);
    }
  }, [idleCountdown]);

  const startIdleCountdown = () => {
    const targetMs = countdownSeconds * 1000;
    idleCountdownTargetRef.current = targetMs;
    setIdleCountdown(targetMs);
    setIdleCountdownRunning(true);
    idleCountdownStartRef.current = 0;
    idleCountdownIdRef.current = requestIdleCallback(idleCountdownTick);
  };

  const stopIdleCountdown = () => {
    setIdleCountdownRunning(false);
    if (idleCountdownIdRef.current) {
      cancelIdleCallback(idleCountdownIdRef.current);
    }
  };

  const resetIdleCountdown = () => {
    stopIdleCountdown();
    setIdleCountdown(0);
    idleCountdownStartRef.current = 0;
  };

  // 倒计时 - setTimeout
  const timeoutCountdownTick = useCallback(() => {
    if (!timeoutCountdownStartRef.current) {
      timeoutCountdownStartRef.current = performance.now();
    }
    const elapsed = performance.now() - timeoutCountdownStartRef.current;
    const remaining = Math.max(0, timeoutCountdownTargetRef.current - elapsed);
    
    setTimeoutCountdown(remaining);
    
    if (remaining > 0) {
      timeoutCountdownIdRef.current = window.setTimeout(timeoutCountdownTick, 1000);
    } else {
      setTimeoutCountdown(0);
      setTimeoutCountdownRunning(false);
    }
  }, []);

  const startTimeoutCountdown = () => {
    const targetMs = countdownSeconds * 1000;
    timeoutCountdownTargetRef.current = targetMs;
    setTimeoutCountdown(targetMs);
    setTimeoutCountdownRunning(true);
    timeoutCountdownStartRef.current = 0;
    timeoutCountdownTick();
  };

  const stopTimeoutCountdown = () => {
    setTimeoutCountdownRunning(false);
    if (timeoutCountdownIdRef.current) {
      clearTimeout(timeoutCountdownIdRef.current);
    }
  };

  const resetTimeoutCountdown = () => {
    stopTimeoutCountdown();
    setTimeoutCountdown(0);
    timeoutCountdownStartRef.current = 0;
  };

  const startAllCountdowns = () => {
    rafCountdownTimer.start(countdownSeconds * 1000);
    startIdleCountdown();
    startTimeoutCountdown();
  };

  const stopAllCountdowns = () => {
    rafCountdownTimer.stop();
    stopIdleCountdown();
    stopTimeoutCountdown();
  };

  const resetAllCountdowns = () => {
    rafCountdownTimer.reset();
    resetIdleCountdown();
    resetTimeoutCountdown();
  };

  return (
    <div className="timer-demo-page">
      <div className="container">
        <h1>定时器对比演示</h1>
        <p className="description">
          对比 requestAnimationFrame、requestIdleCallback 和 setTimeout 三种定时器的精度和性能
        </p>

        <div className="countdown-section">
          <h2>倒计时功能测试</h2>
          <p className="countdown-description">
            同时启动三种定时器的倒计时，观察它们的精度差异
          </p>

          <div className="countdown-settings">
            <label htmlFor="countdown-seconds">设置倒计时时长（秒）：</label>
            <input
              id="countdown-seconds"
              type="number"
              min="1"
              max="3600"
              value={countdownSeconds}
              onChange={(e) => setCountdownSeconds(Number(e.target.value))}
              disabled={rafCountdownTimer.isRunning || idleCountdownRunning || timeoutCountdownRunning}
            />
            <div className="countdown-master-controls">
              <button
                onClick={startAllCountdowns}
                disabled={rafCountdownTimer.isRunning || idleCountdownRunning || timeoutCountdownRunning}
                className="btn-start-all"
              >
                🚀 同时启动所有倒计时
              </button>
              <button
                onClick={stopAllCountdowns}
                disabled={!rafCountdownTimer.isRunning && !idleCountdownRunning && !timeoutCountdownRunning}
                className="btn-stop-all"
              >
                ⏸️ 全部暂停
              </button>
              <button onClick={resetAllCountdowns} className="btn-reset-all">
                🔄 全部重置
              </button>
            </div>
          </div>

          <div className="countdown-grid">
            {/* RAF 倒计时 */}
            <div className="countdown-card raf">
              <div className="countdown-header">
                <h3>requestAnimationFrame</h3>
                <span className={`countdown-status ${rafCountdownTimer.isRunning ? 'running' : rafCountdownTimer.time === 0 ? '' : 'paused'}`}>
                  {rafCountdownTimer.isRunning ? '运行中' : rafCountdownTimer.time === 0 ? '已完成' : '已暂停'}
                </span>
              </div>
              <div className="countdown-display">
                <div className="countdown-time">{formatCountdown(rafCountdownTimer.time)}</div>
              </div>
              <div className="countdown-progress">
                <div 
                  className="countdown-progress-bar raf-bar"
                  style={{ width: `${countdownSeconds > 0 ? (rafCountdownTimer.time / (countdownSeconds * 1000)) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Idle 倒计时 */}
            <div className="countdown-card idle">
              <div className="countdown-header">
                <h3>requestIdleCallback</h3>
                <span className={`countdown-status ${idleCountdownRunning ? 'running' : idleCountdown === 0 ? '' : 'paused'}`}>
                  {idleCountdownRunning ? '运行中' : idleCountdown === 0 ? '已完成' : '已暂停'}
                </span>
              </div>
              <div className="countdown-display">
                <div className="countdown-time">{formatCountdown(idleCountdown)}</div>
              </div>
              <div className="countdown-progress">
                <div 
                  className="countdown-progress-bar idle-bar"
                  style={{ width: `${idleCountdownTargetRef.current > 0 ? (idleCountdown / idleCountdownTargetRef.current) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Timeout 倒计时 */}
            <div className="countdown-card timeout">
              <div className="countdown-header">
                <h3>setTimeout (16ms)</h3>
                <span className={`countdown-status ${timeoutCountdownRunning ? 'running' : timeoutCountdown === 0 ? '' : 'paused'}`}>
                  {timeoutCountdownRunning ? '运行中' : timeoutCountdown === 0 ? '已完成' : '已暂停'}
                </span>
              </div>
              <div className="countdown-display">
                <div className="countdown-time">{formatCountdown(timeoutCountdown)}</div>
              </div>
              <div className="countdown-progress">
                <div 
                  className="countdown-progress-bar timeout-bar"
                  style={{ width: `${timeoutCountdownTargetRef.current > 0 ? (timeoutCountdown / timeoutCountdownTargetRef.current) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="countdown-note">
            <h4>📊 观察要点：</h4>
            <ul>
              <li><strong>requestAnimationFrame</strong> - 最准确，几乎零误差</li>
              <li><strong>requestIdleCallback</strong> - 误差最大，可能提前或延后数秒</li>
              <li><strong>setTimeout</strong> - 会有累积误差，时间越长误差越大</li>
            </ul>
          </div>
        </div>

        <div className="timer-grid">
          {/* requestAnimationFrame 定时器 */}
          <div className="timer-card raf">
            <div className="timer-header">
              <h2>requestAnimationFrame</h2>
              <span className="timer-badge">高精度</span>
            </div>
            <div className="timer-display">
              <div className="time-value">{formatTime(rafTimer.time)}</div>
              <div className="time-ms">{rafTimer.time.toFixed(2)} ms</div>
            </div>
            <div className="timer-controls">
              <button
                onClick={() => rafTimer.start()}
                disabled={rafTimer.isRunning}
                className="btn-start"
              >
                开始
              </button>
              <button
                onClick={() => rafTimer.stop()}
                disabled={!rafTimer.isRunning}
                className="btn-stop"
              >
                停止
              </button>
              <button onClick={() => rafTimer.reset()} className="btn-reset">
                重置
              </button>
            </div>
            <div className="timer-info">
              <h3>特点：</h3>
              <ul>
                <li>与浏览器刷新率同步（60 FPS）</li>
                <li>使用高精度时间戳，无时间漂移</li>
                <li>适合动画和高精度计时</li>
                <li>标签页不可见时自动暂停</li>
                <li>性能最优，CPU 友好</li>
              </ul>
            </div>
          </div>

          {/* requestIdleCallback 定时器 */}
          <div className="timer-card idle">
            <div className="timer-header">
              <h2>requestIdleCallback</h2>
              <span className="timer-badge idle-badge">低优先级</span>
            </div>
            <div className="timer-display">
              <div className="time-value">{formatTime(idleTime)}</div>
              <div className="time-ms">{idleTime.toFixed(2)} ms</div>
            </div>
            <div className="timer-controls">
              <button
                onClick={startIdleTimer}
                disabled={idleRunning}
                className="btn-start"
              >
                开始
              </button>
              <button
                onClick={stopIdleTimer}
                disabled={!idleRunning}
                className="btn-stop"
              >
                停止
              </button>
              <button onClick={resetIdleTimer} className="btn-reset">
                重置
              </button>
            </div>
            <div className="timer-info">
              <h3>特点：</h3>
              <ul>
                <li>在浏览器空闲时执行</li>
                <li>不阻塞主线程</li>
                <li>精度较低，不适合精确计时</li>
                <li>适合后台数据处理</li>
              </ul>
            </div>
          </div>

          {/* setTimeout 定时器 */}
          <div className="timer-card timeout">
            <div className="timer-header">
              <h2>setTimeout (16ms)</h2>
              <span className="timer-badge timeout-badge">传统方式</span>
            </div>
            <div className="timer-display">
              <div className="time-value">{formatTime(setTimeoutTime)}</div>
              <div className="time-ms">{setTimeoutTime.toFixed(2)} ms</div>
            </div>
            <div className="timer-controls">
              <button
                onClick={startSetTimeoutTimer}
                disabled={setTimeoutRunning}
                className="btn-start"
              >
                开始
              </button>
              <button
                onClick={stopSetTimeoutTimer}
                disabled={!setTimeoutRunning}
                className="btn-stop"
              >
                停止
              </button>
              <button onClick={resetSetTimeoutTimer} className="btn-reset">
                重置
              </button>
            </div>
            <div className="timer-info">
              <h3>特点：</h3>
              <ul>
                <li>传统定时器方式</li>
                <li>最小延迟约 4ms（嵌套）</li>
                <li>标签页不可见时会被限流</li>
                <li>存在累积误差和时间漂移</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="comparison-section">
          <h2>性能对比</h2>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>特性</th>
                <th>requestAnimationFrame</th>
                <th>requestIdleCallback</th>
                <th>setTimeout</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>精度</td>
                <td className="good">高（~16.67ms）</td>
                <td className="bad">低（不确定）</td>
                <td className="medium">中（≥4ms）</td>
              </tr>
              <tr>
                <td>CPU 使用</td>
                <td className="good">优化</td>
                <td className="good">优化</td>
                <td className="medium">一般</td>
              </tr>
              <tr>
                <td>适用场景</td>
                <td className="good">动画、游戏</td>
                <td className="medium">后台任务</td>
                <td className="medium">通用定时</td>
              </tr>
              <tr>
                <td>后台运行</td>
                <td className="bad">暂停</td>
                <td className="bad">暂停</td>
                <td className="medium">限流</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="usage-section">
          <h2>使用建议</h2>
          <div className="usage-grid">
            <div className="usage-card">
              <h3>🎬 requestAnimationFrame</h3>
              <p>适用于：</p>
              <ul>
                <li>动画效果</li>
                <li>游戏循环</li>
                <li>实时数据可视化</li>
                <li>需要高精度的计时器</li>
              </ul>
            </div>
            <div className="usage-card">
              <h3>⏱️ requestIdleCallback</h3>
              <p>适用于：</p>
              <ul>
                <li>数据分析和统计</li>
                <li>日志上报</li>
                <li>预加载资源</li>
                <li>非紧急的后台任务</li>
              </ul>
            </div>
            <div className="usage-card">
              <h3>⏰ setTimeout/setInterval</h3>
              <p>适用于：</p>
              <ul>
                <li>延迟执行</li>
                <li>轮询操作</li>
                <li>定时提醒</li>
                <li>通用定时任务</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerDemoPage;
