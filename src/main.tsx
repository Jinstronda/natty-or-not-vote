import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  // React 19 performance profiling in development
  import('react').then(({ Profiler }) => {
    const onRenderCallback = (id: string, phase: string, actualDuration: number) => {
      console.log(`${id} (${phase}): ${actualDuration}ms`)
    }

    // Add profiling data to window for debugging
    (window as any).REACT_DEVTOOLS_GLOBAL_HOOK = {
      onRenderCallback
    }
  })
}

const container = document.getElementById("root")!
const root = createRoot(container)

root.render(<App />);

// Register Service Worker for PWA features AFTER React initialization
// Delay service worker registration to prevent interference with Supabase auth
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  // Wait for app to initialize before registering service worker
  setTimeout(() => {
    import('workbox-window').then(({ Workbox }) => {
      const wb = new Workbox('/sw.js', {
        // Exclude Supabase domains from service worker caching/interception
        scope: '/',
        type: 'module'
      })
      
      wb.addEventListener('waiting', () => {
        console.log('Service worker is waiting, skipping for now...')
      })
      
      wb.addEventListener('installed', () => {
        console.log('Service worker installed successfully')
      })
      
      wb.register().catch((error) => {
        console.warn('Service worker registration failed:', error)
      })
    }).catch((error) => {
      console.warn('Failed to load service worker:', error)
    })
  }, 2000) // 2 second delay to ensure auth is initialized
}
