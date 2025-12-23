import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * useRafTimer 基础配置选项
 */
interface UseRafTimerBaseOptions {
  /** 是否自动开始 */
  autoStart?: boolean;
  /** 完成回调（倒计时结束时触发） */
  onComplete?: () => void;
  /** 每次更新回调 */
  onTick?: (time: number) => void;
}

/**
 * 正计时模式配置
 */
interface StopwatchOptions extends UseRafTimerBaseOptions {
  /** 定时器模式：正计时 */
  mode: 'stopwatch';
  /** 正计时初始时间（毫秒），默认 0 */
  initialTime?: number;
}

/**
 * 倒计时模式配置
 */
interface CountdownOptions extends UseRafTimerBaseOptions {
  /** 定时器模式：倒计时 */
  mode: 'countdown';
  /** 倒计时时长（毫秒），必需 */
  duration: number;
}

/**
 * useRafTimer 配置选项（联合类型）
 */
export type UseRafTimerOptions = StopwatchOptions | CountdownOptions;

/**
 * useRafTimer 返回值
 */
export interface UseRafTimerReturn {
  /** 当前时间值（毫秒） */
  time: number;
  /** 格式化时间字符串（HH:MM:SS） */
  formattedTime: string;
  /** 是否正在运行 */
  isRunning: boolean;
  /** 开始定时器（可选参数动态修改倒计时时长） */
  start: (newDuration?: number) => void;
  /** 暂停定时器（保留当前进度） */
  stop: () => void;
  /** 继续定时器（从暂停处继续） */
  resume: () => void;
  /** 重置定时器到初始状态 */
  reset: () => void;
}

/**
 * 基于 requestAnimationFrame 的高精度定时器 Hook（秒级更新）
 *
 * @example
 * // 正计时示例
 * const timer = useRafTimer({
 *   mode: 'stopwatch',
 *   initialTime: 0
 * });
 *
 * @example
 * // 倒计时示例
 * const countdown = useRafTimer({
 *   mode: 'countdown',
 *   duration: 10 * 60 * 1000, // 10分钟
 *   onComplete: () => console.log('倒计时结束！')
 * });
 */
export function useRafTimer(options: UseRafTimerOptions): UseRafTimerReturn {
  const { mode, autoStart = false, onComplete, onTick } = options;

  // 根据模式安全地提取特定参数
  const duration = mode === 'countdown' ? options.duration : 0;
  const initialTime = mode === 'stopwatch' ? (options.initialTime ?? 0) : 0;

  // 状态
  const [time, setTime] = useState<number>(
    mode === 'countdown' ? duration : initialTime,
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Refs
  const rafIdRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const targetDurationRef = useRef<number>(duration);
  const initialTimeRef = useRef<number>(initialTime);
  const lastSecondRef = useRef<number>(-1);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  // 更新回调 refs
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
  }, [onComplete, onTick]);

  // RAF 循环核心逻辑（秒级更新）
  const tick = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;

      if (mode === 'stopwatch') {
        // 正计时逻辑（秒级更新）
        const currentTime = initialTimeRef.current + elapsed;
        const currentSecond = Math.floor(currentTime / 1000);
        if (currentSecond !== lastSecondRef.current) {
          setTime(currentTime);
          lastSecondRef.current = currentSecond;
          onTickRef.current?.(currentTime);
        }
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        // 倒计时逻辑（秒级更新）
        const remaining = Math.max(0, targetDurationRef.current - elapsed);
        const currentSecond = Math.floor(remaining / 1000);
        if (currentSecond !== lastSecondRef.current) {
          setTime(remaining);
          lastSecondRef.current = currentSecond;
          onTickRef.current?.(remaining);
        }

        if (remaining > 0) {
          rafIdRef.current = requestAnimationFrame(tick);
        } else {
          setTime(0);
          setIsRunning(false);
          onCompleteRef.current?.();
        }
      }
    },
    [mode],
  );

  // 开始定时器
  const start = useCallback(
    (newDuration?: number) => {
      // 清理之前的定时器
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      if (mode === 'countdown') {
        const targetMs = newDuration ?? targetDurationRef.current;
        targetDurationRef.current = targetMs;
        setTime(targetMs);
      } else {
        setTime(initialTimeRef.current);
      }

      setIsRunning(true);
      startTimeRef.current = 0;
      pausedTimeRef.current = 0;
      lastSecondRef.current = -1;
      rafIdRef.current = requestAnimationFrame(tick);
    },
    [mode, tick],
  );

  // 暂停定时器
  const stop = useCallback(() => {
    setIsRunning(false);
    pausedTimeRef.current = time;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
  }, [time]);

  // 继续定时器
  const resume = useCallback(() => {
    if (pausedTimeRef.current === undefined) return;

    setIsRunning(true);
    startTimeRef.current = 0;

    const resumeTick = (timestamp: number) => {
      if (!startTimeRef.current) {
        if (mode === 'countdown') {
          // 倒计时：调整起始时间以保持剩余时间
          startTimeRef.current =
            timestamp - (targetDurationRef.current - pausedTimeRef.current);
        } else {
          // 正计时：调整起始时间以保持已过时间
          startTimeRef.current =
            timestamp - (pausedTimeRef.current - initialTimeRef.current);
        }
      }
      tick(timestamp);
    };

    rafIdRef.current = requestAnimationFrame(resumeTick);
  }, [mode, tick]);

  // 重置定时器
  const reset = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    setIsRunning(false);
    if (mode === 'countdown') {
      setTime(targetDurationRef.current);
    } else {
      setTime(initialTimeRef.current);
    }
    pausedTimeRef.current = 0;
    startTimeRef.current = 0;
    lastSecondRef.current = -1;
  }, [mode]);

  // 清理副作用
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // autoStart 支持
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, []);

  const formattedTime = useMemo(() => formatTime(time), [time]);

  return {
    time,
    formattedTime,
    isRunning,
    start,
    stop,
    resume,
    reset,
  };
}
