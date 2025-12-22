// Custom hook to use requestAnimationFrame
import { useEffect, useRef } from 'react';

export function useAnimationFrame(callback: (timestamp: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        savedCallback.current(time);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
}