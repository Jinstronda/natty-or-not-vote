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
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/nutgdqowaqjnxtedascw\.supabase\.co\/.*/i,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'supabase-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
    //           }
    //         }
    //       }
    //     ]
    //   }
    // }),
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
      'lucide-react',
      'web-vitals', // Pre-bundle for performance monitoring
      'clsx', // Pre-bundle utility for faster className generation
      'tailwind-merge' // Pre-bundle for efficient Tailwind class merging
    ],
    exclude: ['@lovable/tagger'],
    // Improve cold start performance
    holdUntilCrawlEnd: false,
    // Enable esbuild cache for faster rebuilds
    force: mode === 'development',
  },
  build: {
    // Target browsers for iOS Safari compatibility - changed from es2020 to es2018
    target: ['es2018', 'safari14'],
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enhanced minification for better Core Web Vitals
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log'] : [],
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true, // Fix Safari 10 compatibility
      },
      format: {
        comments: false, // Remove comments for smaller bundle
      },
    },
    // Optimize assets handling for better SEO
    assetsInlineLimit: 2048, // 2KB - inline small assets for fewer requests
    // Generate module preload directives for critical resources
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps) => {
        // Preload critical chunks
        return deps.filter(dep => 
          dep.includes('vendor') || 
          dep.includes('index') || 
          dep.includes('router')
        );
      },
    },
    // Advanced bundle optimization
    rollupOptions: {
      output: {
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Optimize chunk splitting for better caching and Core Web Vitals
        manualChunks: (id) => {
          // Create separate chunks for node_modules to improve caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('@tanstack')) {
              return 'query';
            }
            if (id.includes('web-vitals')) {
              return 'performance';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('date-fns')) {
              return 'utils';
            }
            return 'vendor';
          }
          // Group pages together for better code splitting
          if (id.includes('/pages/')) {
            return 'pages';
          }
          if (id.includes('/components/')) {
            return 'components';
          }
        },
      }
    },
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
