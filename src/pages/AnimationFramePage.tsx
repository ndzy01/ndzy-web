import React, { useState, useRef, useCallback } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import './AnimationFramePage.css';

const AnimationFramePage: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [fps, setFps] = useState(0);
  const [position, setPosition] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const animationStartRef = useRef<number>(0);

  const animate = useCallback(
    (timestamp: number) => {
      if (!isAnimating) return;

      // 初始化开始时间
      if (!animationStartRef.current) {
        animationStartRef.current = timestamp;
      }

      // 计算 FPS
      frameCountRef.current++;
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        lastFpsUpdateRef.current = timestamp;
      }

      if (timestamp - lastFpsUpdateRef.current >= 1000) {
        const currentFps = Math.round(
          (frameCountRef.current * 1000) / (timestamp - startTimeRef.current)
        );
        setFps(currentFps);
        lastFpsUpdateRef.current = timestamp;
      }

      // 计算动画进度
      const elapsed = timestamp - animationStartRef.current;
      const duration = 3000; // 3秒循环
      const progress = (elapsed % duration) / duration;

      // 更新动画状态
      setPosition(progress * 100); // 0 到 100%
      setRotation(progress * 360); // 0 到 360度
      setScale(1 + Math.sin(progress * Math.PI * 2) * 0.5); // 0.5 到 1.5
    },
    [isAnimating]
  );

  useAnimationFrame(animate);

  const startAnimation = () => {
    setIsAnimating(true);
    animationStartRef.current = 0;
    startTimeRef.current = 0;
    frameCountRef.current = 0;
    lastFpsUpdateRef.current = 0;
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    animationStartRef.current = 0;
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setPosition(0);
    setRotation(0);
    setScale(1);
    setFps(0);
    animationStartRef.current = 0;
    startTimeRef.current = 0;
    frameCountRef.current = 0;
    lastFpsUpdateRef.current = 0;
  };

  return (
    <div className="animation-frame-page">
      <div className="container">
        <h1>requestAnimationFrame 示例</h1>
        <p className="description">
          requestAnimationFrame 用于创建流畅的动画，在浏览器下次重绘前执行回调。
          适用于所有类型的动画、视觉更新和游戏循环。
        </p>

        <div className="controls">
          <button onClick={startAnimation} disabled={isAnimating} className="btn-primary">
            开始动画
          </button>
          <button onClick={stopAnimation} disabled={!isAnimating} className="btn-warning">
            停止动画
          </button>
          <button onClick={resetAnimation} className="btn-secondary">
            重置
          </button>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">FPS:</span>
            <span className="stat-value">{fps}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">位置:</span>
            <span className="stat-value">{position.toFixed(2)}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">旋转:</span>
            <span className="stat-value">{rotation.toFixed(2)}°</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">缩放:</span>
            <span className="stat-value">{scale.toFixed(2)}x</span>
          </div>
        </div>

        <div className="animation-container">
          <h2>动画演示区</h2>
          <div className="demo-area">
            <div className="track">
              <div
                className="animated-box"
                style={{
                  left: `${position}%`,
                  transform: `translateX(-50%) rotate(${rotation}deg) scale(${scale})`,
                }}
              >
                <div className="box-content">🚀</div>
              </div>
            </div>
          </div>

          <div className="demo-grid">
            <div className="demo-item">
              <h3>线性移动</h3>
              <div className="mini-demo">
                <div
                  className="mini-box linear"
                  style={{ left: `${position}%` }}
                />
              </div>
            </div>

            <div className="demo-item">
              <h3>旋转动画</h3>
              <div className="mini-demo">
                <div
                  className="mini-box rotation"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              </div>
            </div>

            <div className="demo-item">
              <h3>缩放动画</h3>
              <div className="mini-demo">
                <div
                  className="mini-box scale"
                  style={{ transform: `scale(${scale})` }}
                />
              </div>
            </div>

            <div className="demo-item">
              <h3>综合动画</h3>
              <div className="mini-demo">
                <div
                  className="mini-box combined"
                  style={{
                    left: `${position}%`,
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>关键特性</h3>
          <ul>
            <li>与浏览器刷新率同步（通常 60 FPS）</li>
            <li>自动优化性能，标签页不可见时暂停</li>
            <li>提供时间戳参数，便于计算动画进度</li>
            <li>适合所有视觉动画和游戏开发</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnimationFramePage;
