import { useEffect, useRef, useCallback } from "react";
import type { TimerId, TimerType, CancelFn } from "./types";

type TimerRegistry = Map<TimerId, TimerType>;

export function useSafeTimers() {
  const timersRef = useRef<TimerRegistry>(new Map());
  const callbacksRef = useRef<Map<TimerId, () => void>>(new Map());
  const isUnmountedRef = useRef(false);

  // Helper to safely execute callbacks
  const safeExecute = useCallback((id: TimerId) => {
    if (isUnmountedRef.current) return;
    const callback = callbacksRef.current.get(id);
    callback?.();
  }, []);

  // Safe Timeout
  const setSafeTimeout = useCallback(
    (callback: () => void, delay: number): CancelFn => {
      if (typeof window === "undefined") return () => {};

      const id = window.setTimeout(() => {
        safeExecute(id);
        timersRef.current.delete(id);
        callbacksRef.current.delete(id);
      }, delay);

      timersRef.current.set(id, "timeout");
      callbacksRef.current.set(id, callback);

      return () => {
        clearTimeout(id);
        timersRef.current.delete(id);
        callbacksRef.current.delete(id);
      };
    },
    [safeExecute]
  );

  // Safe Interval
  const setSafeInterval = useCallback(
    (callback: () => void, delay: number): CancelFn => {
      if (typeof window === "undefined") return () => {};

      const id = window.setInterval(() => {
        safeExecute(id);
      }, delay);

      timersRef.current.set(id, "interval");
      callbacksRef.current.set(id, callback);

      return () => {
        clearInterval(id);
        timersRef.current.delete(id);
        callbacksRef.current.delete(id);
      };
    },
    [safeExecute]
  );

  // Safe RequestAnimationFrame
  const setSafeRAF = useCallback(
    (callback: (time: number) => void): CancelFn => {
      if (typeof window === "undefined") return () => {};

      let id: number;
      const wrappedCallback = (time: number) => {
        if (isUnmountedRef.current) return;
        callback(time);
        timersRef.current.delete(id);
        callbacksRef.current.delete(id);
      };

      id = window.requestAnimationFrame(wrappedCallback);
      timersRef.current.set(id, "animationFrame");
      callbacksRef.current.set(id, () => {}); // Placeholder for general cleanup logic

      return () => {
        cancelAnimationFrame(id);
        timersRef.current.delete(id);
        callbacksRef.current.delete(id);
      };
    },
    []
  );

  // Clear all timers manually
  const clearAll = useCallback(() => {
    timersRef.current.forEach((type, id) => {
      if (type === "timeout") clearTimeout(id);
      else if (type === "interval") clearInterval(id);
      else if (type === "animationFrame") cancelAnimationFrame(id);
    });
    timersRef.current.clear();
    callbacksRef.current.clear();
  }, []);

  // Auto cleanup on unmount
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      clearAll();
    };
  }, [clearAll]);

  return {
    setSafeTimeout,
    setSafeInterval,
    setSafeRAF,
    clearAll,
  };
}

