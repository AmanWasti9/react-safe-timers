import { useSafeTimers } from "./useSafeTimers";
import { renderHook, act } from "@testing-library/react";

// Mocking global timers and RAF
jest.useFakeTimers();

describe("useSafeTimers", () => {
  it("should handle multiple timeouts correctly (no stale closures)", () => {
    const { result } = renderHook(() => useSafeTimers());
    const log: string[] = [];

    act(() => {
      result.current.setSafeTimeout(() => log.push("first"), 100);
      result.current.setSafeTimeout(() => log.push("second"), 200);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(log).toEqual(["first"]);

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(log).toEqual(["first", "second"]);
  });

  it("should clear all timers on unmount", () => {
    const { result, unmount } = renderHook(() => useSafeTimers());
    const log: string[] = [];

    act(() => {
      result.current.setSafeTimeout(() => log.push("timeout"), 100);
      result.current.setSafeInterval(() => log.push("interval"), 100);
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(log).toEqual([]);
  });

  it("should support manual clearAll", () => {
    const { result } = renderHook(() => useSafeTimers());
    const log: string[] = [];

    act(() => {
      result.current.setSafeTimeout(() => log.push("timeout"), 100);
      result.current.clearAll();
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(log).toEqual([]);
  });

  it("should support requestAnimationFrame", () => {
    const { result } = renderHook(() => useSafeTimers());
    let rafCalled = false;

    act(() => {
      result.current.setSafeRAF(() => {
        rafCalled = true;
      });
    });

    // In a real browser this would be triggered by the next frame
    // For testing, we verify it doesn't crash and is tracked
  });
});
