# **React Safe Timers**

![GitHub Workflow Status](https://img.shields.io/badge/status-production-green) ![npm version](https://img.shields.io/npm/v/use-smart-loading) ![License](https://img.shields.io/npm/l/use-smart-loading)

A robust, production-ready React hook for managing asynchronous timers with automatic cleanup capabilities. This library addresses the common issues of memory leaks, race conditions, and state updates on unmounted components that frequently occur when using native timer functions within React's lifecycle.

## Overview

In React applications, failing to clear timers (`setTimeout`, `setInterval`, `requestAnimationFrame`) upon component unmounting often leads to severe performance issues and console warnings. `react-safe-timers` provides a centralized hook `useSafeTimers` that wraps these native functions, ensuring all active timers are automatically cleared when the component unmounts. It eliminates the boilerplate code typically required for manual cleanup in `useEffect`.

## Features

- **Automatic Cleanup**: Automatically disposes of all active timers when the component unmounts.
- **Memory Leak Prevention**: Mitigates the risk of memory leaks ensuring callbacks are never executed after a component has been destroyed.
- **Type Safety**: Fully typed with TypeScript for reliable development.
- **Zero Dependencies**: Lightweight implementation with no external runtime dependencies.
- **Complete API**: Supports `setTimeout`, `setInterval`, and `requestAnimationFrame`.

## Installation

Install the package via npm:

```bash
npm install react-safe-timers
```

## Usage

Import the `useSafeTimers` hook into your component. The hook returns safe versions of standard timer functions.

### Basic Timeout

```typescript
import React, { useState } from 'react';
import { useSafeTimers } from 'react-safe-timers';

export const NotificationComponent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { setSafeTimeout } = useSafeTimers();

    const showNotification = () => {
        setIsVisible(true);
        
        // This timer will be automatically cleared if the component unmounts
        // before the 3000ms duration completes.
        setSafeTimeout(() => {
            setIsVisible(false);
        }, 3000);
    };

    return (
        <div>
            <button onClick={showNotification}>Show Notification</button>
            {isVisible && <div className="notification">Operation Success</div>}
        </div>
    );
};
```

### Interval

```typescript
import React, { useState, useEffect } from 'react';
import { useSafeTimers } from 'react-safe-timers';

export const TimerComponent = () => {
    const [count, setCount] = useState(0);
    const { setSafeInterval } = useSafeTimers();

    useEffect(() => {
        // Starts the interval immediately.
        // No return cleanup function is required here; the hook handles it.
        setSafeInterval(() => {
            setCount(prev => prev + 1);
        }, 1000);
    }, [setSafeInterval]);

    return <div>Seconds elapsed: {count}</div>;
};
```

### Request Animation Frame

```typescript
import React, { useRef, useEffect } from 'react';
import { useSafeTimers } from 'react-safe-timers';

export const AnimationComponent = () => {
    const elementRef = useRef<HTMLDivElement>(null);
    const { setSafeRAF } = useSafeTimers();

    const animate = (timestamp: number) => {
        if (elementRef.current) {
            // Animation logic here
            elementRef.current.style.transform = `translateX(${timestamp % 500}px)`;
        }
        
        // Recursively call for the next frame
        setSafeRAF(animate);
    };

    useEffect(() => {
        setSafeRAF(animate);
    }, [setSafeRAF]);

    return <div ref={elementRef} className="box" />;
};
```

## API Reference

The `useSafeTimers` hook returns an object containing the following methods:

### `setSafeTimeout(callback: () => void, delay: number): () => void`

Schedules a function to run after a specified delay.
- **Returns**: A cleanup function that can be called to manually cancel the timeout.

### `setSafeInterval(callback: () => void, delay: number): () => void`

Schedules a function to run repeatedly at a specified interval.
- **Returns**: A cleanup function that can be called to manually cancel the interval.

### `setSafeRAF(callback: (time: number) => void): () => void`

Schedules a function to run before the next repaint.
- **Returns**: A cleanup function that can be called to manually cancel the frame request.

### `clearAll(): void`

Instantly clears all active timers (timeouts, intervals, and animation frames) managed by the current hook instance. This is called automatically on unmount but can be used imperatively if needed.

## Rationale

Consider the following standard React pattern which is prone to errors:

```typescript
// BAD PRACTICE
useEffect(() => {
    const id = setTimeout(() => {
        // If the component unmounts before this runs, 
        // this state update will trigger a React warning/error.
        setData(result); 
    }, 1000);
    
    // Developer often forgets this cleanup line:
    // return () => clearTimeout(id);
}, []);
```

With `react-safe-timers`, the cleanup is intrinsic:

```typescript
// BEST PRACTICE
const { setSafeTimeout } = useSafeTimers();

useEffect(() => {
    setSafeTimeout(() => {
        // Safe to execute; will not run if component is unmounted.
        setData(result);
    }, 1000);
}, []);
```

## License
MIT © Syed Amanullah Wasti