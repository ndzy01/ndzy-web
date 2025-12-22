// Custom hook to use requestIdleCallback
import { useEffect, useRef } from 'react';

export function useIdleCallback(callback: (deadline: IdleDeadline) => void) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let idleCallbackId: number;

    const executeCallback = (deadline: IdleDeadline) => {
      savedCallback.current(deadline);
    };

    idleCallbackId = requestIdleCallback(executeCallback);

    return () => {
      if (idleCallbackId) {
        cancelIdleCallback(idleCallbackId);
      }
    };
  }, []);
}