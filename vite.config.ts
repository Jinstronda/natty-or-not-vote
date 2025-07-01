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
    // PWA support with modern caching strategies
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Natty or Not',
        short_name: 'NattyOrNot',
        description: 'Vote on whether fitness influencers are natty or not',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
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
    // Use legacy JavaScript to avoid ES module MIME type issues
    target: ['es2015', 'safari11'],
    // Disable ES modules to fix MIME type issues on hosting platforms
    rollupOptions: {
      external: [],
      output: {
        // Use IIFE format instead of ES modules to avoid MIME type issues
        format: 'iife',
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
        // Use traditional script loading instead of module loading
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
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
    // Target legacy browsers to avoid module loading issues
    target: 'es2015'
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
