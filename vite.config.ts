import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Warmup frequently accessed files for better dev performance
    warmup: {
      clientFiles: [
        "./src/pages/Index.tsx",
        "./src/components/InfluencerGrid.tsx",
        "./src/components/InfluencerCard.tsx",
        "./src/contexts/AuthContext.tsx",
      ],
    },
  },
  plugins: [
    // Use SWC instead of Babel for faster compilation (20-40x faster)
    react(),
    mode === 'development' &&
    componentTagger(),
    // Bundle analyzer for performance monitoring
    mode === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    }),
    // PWA support with modern caching strategies - TEMPORARILY DISABLED for iOS debugging
    // VitePWA({
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Advanced CSS optimization
  css: {
    // Enable threaded CSS preprocessing for faster builds (up to 40% improvement)
    preprocessorMaxWorkers: true,
    devSourcemap: mode === 'development',
  },
  // Optimized dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'date-fns',
      'lucide-react'
    ],
    exclude: ['@lovable/tagger'],
    // Improve cold start performance
    holdUntilCrawlEnd: false,
  },
  build: {
    // Target browsers for iOS Safari compatibility - changed from es2020 to es2018
    target: ['es2018', 'safari14'],
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Advanced bundle optimization
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          // Vendor chunk for React and core dependencies
          vendor: ['react', 'react-dom'],
          // Router chunk for navigation-related code
          router: ['react-router-dom'],
          // Supabase chunk for backend integration
          supabase: ['@supabase/supabase-js'],
          // Query chunk for data fetching
          query: ['@tanstack/react-query'],
          // UI chunk for component library
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Optimize assets inlining threshold
    assetsInlineLimit: 2048, // 2KB
    // Report compressed sizes for monitoring
    reportCompressedSize: true,
    // Source maps for production debugging
    sourcemap: mode === 'development' ? true : 'hidden',
  },
  // Performance configuration
  esbuild: {
    // Remove console logs in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
}));
