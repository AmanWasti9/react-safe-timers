# How to Use and Test `react-safe-timers`

Follow these steps to test your package in a local React application.

## Step 1: Prepare Your Package
First, you need to build your package to generate the `dist` folder.

1. In your package directory (`react-safe-timers`), run:
   ```bash
   npm run build
   ```

## Step 2: Use in a Local React Project (Method 1: File Reference)
The easiest way to test without publishing to NPM is to reference the folder directly.

1. Go to your target React project.
2. Install the package using a local path:
   ```bash
   npm install ../path/to/react-safe-timers
   ```
   *(Replace with the actual relative or absolute path)*

## Step 3: Implementation Example (`App.tsx`)
Here is a complete example of how to use the hook in your component.

```tsx
import React, { useState } from 'react';
import { useSafeTimers } from 'react-safe-timers';

const App = () => {
  const [msg, setMsg] = useState('Wait...');
  const { setSafeTimeout, clearAll } = useSafeTimers();

  const startTimer = () => {
    setSafeTimeout(() => {
      setMsg('Timer Executed Safely!');
    }, 2000);
  };

  return (
    <div>
      <h1>Status: {msg}</h1>
      <button onClick={startTimer}>Start 2s Timer</button>
      <button onClick={() => { clearAll(); setMsg('Cleared'); }}>Cancel All</button>
    </div>
  );
};

export default App;
```

## Step 4: Pro Features to Test
- **Auto-Cleanup**: Start a 10s timer and then navigate away from the component (unmount it). Check that the timer never logs to the console or updates state after unmount.
- **SSR Safety**: Use it in a Next.js app; notice it doesn't crash during server-side execution.
- **Stable References**: Notice that `setSafeTimeout` doesn't change on every re-render, making it safe for `useEffect` dependency arrays.

## Tips for Senior Development
- Always use `setSafeInterval` for loops to avoid memory leaks.
- Use `setSafeRAF` for any animations to ensure they stop when the component is gone.
- Use `clearAll` if you need to reset the entire state of timers (e.g., when a user logs out).
