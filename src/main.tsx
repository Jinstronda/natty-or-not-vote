import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register Service Worker for PWA features
if ('serviceWorker' in navigator) {
  import('workbox-window').then(({ Workbox }) => {
    const wb = new Workbox('/sw.js')
    wb.register()
  })
}

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  // React 19 performance profiling in development
  import('react').then(({ Profiler }) => {
    const onRenderCallback = (id: string, phase: string, actualDuration: number) => {
      console.log(`${id} (${phase}): ${actualDuration}ms`)
    }
    
    // Add profiling data to window for debugging
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      onRenderCallback
    }
  })
}

const container = document.getElementById("root")!
const root = createRoot(container)

root.render(<App />);
