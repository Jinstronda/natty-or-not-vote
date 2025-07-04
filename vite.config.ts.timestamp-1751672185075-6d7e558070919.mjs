// vite.config.ts
import { defineConfig } from "file:///mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/node_modules/vite/dist/node/index.js";
import react from "file:///mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/node_modules/lovable-tagger/dist/index.js";
import { visualizer } from "file:///mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Warmup frequently accessed files for better dev performance
    warmup: {
      clientFiles: [
        "./src/pages/Index.tsx",
        "./src/components/InfluencerGrid.tsx",
        "./src/components/InfluencerCard.tsx",
        "./src/contexts/AuthContext.tsx"
      ]
    }
  },
  plugins: [
    // Use SWC instead of Babel for faster compilation (20-40x faster)
    react(),
    mode === "development" && componentTagger(),
    // Bundle analyzer for performance monitoring
    mode === "production" && visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true
    })
    // PWA support with modern caching strategies - TEMPORARILY DISABLED for iOS debugging
    // VitePWA({
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  // Advanced CSS optimization
  css: {
    // Enable threaded CSS preprocessing for faster builds (up to 40% improvement)
    preprocessorMaxWorkers: true,
    devSourcemap: mode === "development"
  },
  // Optimized dependency pre-bundling
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "@supabase/supabase-js",
      "date-fns",
      "lucide-react"
    ],
    exclude: ["@lovable/tagger"],
    // Improve cold start performance
    holdUntilCrawlEnd: false
  },
  build: {
    // Target browsers for iOS Safari compatibility - changed from es2020 to es2018
    target: ["es2018", "safari14"],
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1e3,
    // Advanced bundle optimization
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          // Vendor chunk for React and core dependencies
          vendor: ["react", "react-dom"],
          // Router chunk for navigation-related code
          router: ["react-router-dom"],
          // Supabase chunk for backend integration
          supabase: ["@supabase/supabase-js"],
          // Query chunk for data fetching
          query: ["@tanstack/react-query"],
          // UI chunk for component library
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-toast"]
        },
        // Optimize chunk naming for better caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    // Optimize assets inlining threshold
    assetsInlineLimit: 2048,
    // 2KB
    // Report compressed sizes for monitoring
    reportCompressedSize: true,
    // Source maps for production debugging
    sourcemap: mode === "development" ? true : "hidden"
  },
  // Performance configuration
  esbuild: {
    // Remove console logs in production
    drop: mode === "production" ? ["console", "debugger"] : []
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2MvVXNlcnMvam9hb3AvRG9jdW1lbnRzL0hvYmJpZXMvbmF0dHktb3Itbm90LXZvdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9tbnQvYy9Vc2Vycy9qb2FvcC9Eb2N1bWVudHMvSG9iYmllcy9uYXR0eS1vci1ub3Qtdm90ZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vbW50L2MvVXNlcnMvam9hb3AvRG9jdW1lbnRzL0hvYmJpZXMvbmF0dHktb3Itbm90LXZvdGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIjtcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjo6XCIsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gICAgLy8gV2FybXVwIGZyZXF1ZW50bHkgYWNjZXNzZWQgZmlsZXMgZm9yIGJldHRlciBkZXYgcGVyZm9ybWFuY2VcclxuICAgIHdhcm11cDoge1xyXG4gICAgICBjbGllbnRGaWxlczogW1xyXG4gICAgICAgIFwiLi9zcmMvcGFnZXMvSW5kZXgudHN4XCIsXHJcbiAgICAgICAgXCIuL3NyYy9jb21wb25lbnRzL0luZmx1ZW5jZXJHcmlkLnRzeFwiLFxyXG4gICAgICAgIFwiLi9zcmMvY29tcG9uZW50cy9JbmZsdWVuY2VyQ2FyZC50c3hcIixcclxuICAgICAgICBcIi4vc3JjL2NvbnRleHRzL0F1dGhDb250ZXh0LnRzeFwiLFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIC8vIFVzZSBTV0MgaW5zdGVhZCBvZiBCYWJlbCBmb3IgZmFzdGVyIGNvbXBpbGF0aW9uICgyMC00MHggZmFzdGVyKVxyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcclxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gICAgLy8gQnVuZGxlIGFuYWx5emVyIGZvciBwZXJmb3JtYW5jZSBtb25pdG9yaW5nXHJcbiAgICBtb2RlID09PSAncHJvZHVjdGlvbicgJiYgdmlzdWFsaXplcih7XHJcbiAgICAgIGZpbGVuYW1lOiAnZGlzdC9zdGF0cy5odG1sJyxcclxuICAgICAgb3BlbjogdHJ1ZSxcclxuICAgICAgZ3ppcFNpemU6IHRydWUsXHJcbiAgICAgIGJyb3RsaVNpemU6IHRydWVcclxuICAgIH0pLFxyXG4gICAgLy8gUFdBIHN1cHBvcnQgd2l0aCBtb2Rlcm4gY2FjaGluZyBzdHJhdGVnaWVzIC0gVEVNUE9SQVJJTFkgRElTQUJMRUQgZm9yIGlPUyBkZWJ1Z2dpbmdcclxuICAgIC8vIFZpdGVQV0Eoe1xyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIC8vIEFkdmFuY2VkIENTUyBvcHRpbWl6YXRpb25cclxuICBjc3M6IHtcclxuICAgIC8vIEVuYWJsZSB0aHJlYWRlZCBDU1MgcHJlcHJvY2Vzc2luZyBmb3IgZmFzdGVyIGJ1aWxkcyAodXAgdG8gNDAlIGltcHJvdmVtZW50KVxyXG4gICAgcHJlcHJvY2Vzc29yTWF4V29ya2VyczogdHJ1ZSxcclxuICAgIGRldlNvdXJjZW1hcDogbW9kZSA9PT0gJ2RldmVsb3BtZW50JyxcclxuICB9LFxyXG4gIC8vIE9wdGltaXplZCBkZXBlbmRlbmN5IHByZS1idW5kbGluZ1xyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogW1xyXG4gICAgICAncmVhY3QnLFxyXG4gICAgICAncmVhY3QtZG9tJyxcclxuICAgICAgJ3JlYWN0LXJvdXRlci1kb20nLFxyXG4gICAgICAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JyxcclxuICAgICAgJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcycsXHJcbiAgICAgICdkYXRlLWZucycsXHJcbiAgICAgICdsdWNpZGUtcmVhY3QnXHJcbiAgICBdLFxyXG4gICAgZXhjbHVkZTogWydAbG92YWJsZS90YWdnZXInXSxcclxuICAgIC8vIEltcHJvdmUgY29sZCBzdGFydCBwZXJmb3JtYW5jZVxyXG4gICAgaG9sZFVudGlsQ3Jhd2xFbmQ6IGZhbHNlLFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIC8vIFRhcmdldCBicm93c2VycyBmb3IgaU9TIFNhZmFyaSBjb21wYXRpYmlsaXR5IC0gY2hhbmdlZCBmcm9tIGVzMjAyMCB0byBlczIwMThcclxuICAgIHRhcmdldDogWydlczIwMTgnLCAnc2FmYXJpMTQnXSxcclxuICAgIC8vIEVuYWJsZSBDU1MgY29kZSBzcGxpdHRpbmcgZm9yIGJldHRlciBjYWNoaW5nXHJcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXHJcbiAgICAvLyBPcHRpbWl6ZSBjaHVuayBzaXplIHdhcm5pbmdzXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXHJcbiAgICAvLyBBZHZhbmNlZCBidW5kbGUgb3B0aW1pemF0aW9uXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIC8vIE9wdGltaXplIGNodW5rIHNwbGl0dGluZyBmb3IgYmV0dGVyIGNhY2hpbmdcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgIC8vIFZlbmRvciBjaHVuayBmb3IgUmVhY3QgYW5kIGNvcmUgZGVwZW5kZW5jaWVzXHJcbiAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgICAgICAgICAvLyBSb3V0ZXIgY2h1bmsgZm9yIG5hdmlnYXRpb24tcmVsYXRlZCBjb2RlXHJcbiAgICAgICAgICByb3V0ZXI6IFsncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gICAgICAgICAgLy8gU3VwYWJhc2UgY2h1bmsgZm9yIGJhY2tlbmQgaW50ZWdyYXRpb25cclxuICAgICAgICAgIHN1cGFiYXNlOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddLFxyXG4gICAgICAgICAgLy8gUXVlcnkgY2h1bmsgZm9yIGRhdGEgZmV0Y2hpbmdcclxuICAgICAgICAgIHF1ZXJ5OiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSddLFxyXG4gICAgICAgICAgLy8gVUkgY2h1bmsgZm9yIGNvbXBvbmVudCBsaWJyYXJ5XHJcbiAgICAgICAgICB1aTogWydAcmFkaXgtdWkvcmVhY3QtZGlhbG9nJywgJ0ByYWRpeC11aS9yZWFjdC1kcm9wZG93bi1tZW51JywgJ0ByYWRpeC11aS9yZWFjdC10b2FzdCddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gT3B0aW1pemUgY2h1bmsgbmFtaW5nIGZvciBiZXR0ZXIgY2FjaGluZ1xyXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF0nXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyBPcHRpbWl6ZSBhc3NldHMgaW5saW5pbmcgdGhyZXNob2xkXHJcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogMjA0OCwgLy8gMktCXHJcbiAgICAvLyBSZXBvcnQgY29tcHJlc3NlZCBzaXplcyBmb3IgbW9uaXRvcmluZ1xyXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IHRydWUsXHJcbiAgICAvLyBTb3VyY2UgbWFwcyBmb3IgcHJvZHVjdGlvbiBkZWJ1Z2dpbmdcclxuICAgIHNvdXJjZW1hcDogbW9kZSA9PT0gJ2RldmVsb3BtZW50JyA/IHRydWUgOiAnaGlkZGVuJyxcclxuICB9LFxyXG4gIC8vIFBlcmZvcm1hbmNlIGNvbmZpZ3VyYXRpb25cclxuICBlc2J1aWxkOiB7XHJcbiAgICAvLyBSZW1vdmUgY29uc29sZSBsb2dzIGluIHByb2R1Y3Rpb25cclxuICAgIGRyb3A6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyA/IFsnY29uc29sZScsICdkZWJ1Z2dlciddIDogW10sXHJcbiAgfSxcclxuICB0ZXN0OiB7XHJcbiAgICBnbG9iYWxzOiB0cnVlLFxyXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXHJcbiAgICBzZXR1cEZpbGVzOiAnLi92aXRlc3Quc2V0dXAudHMnLFxyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVixTQUFTLG9CQUFvQjtBQUNqWCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMsa0JBQWtCO0FBSjNCLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFFTixRQUFRO0FBQUEsTUFDTixhQUFhO0FBQUEsUUFDWDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBO0FBQUEsSUFFUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUNULGdCQUFnQjtBQUFBO0FBQUEsSUFFaEIsU0FBUyxnQkFBZ0IsV0FBVztBQUFBLE1BQ2xDLFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLFlBQVk7QUFBQSxJQUNkLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHSCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsS0FBSztBQUFBO0FBQUEsSUFFSCx3QkFBd0I7QUFBQSxJQUN4QixjQUFjLFNBQVM7QUFBQSxFQUN6QjtBQUFBO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxpQkFBaUI7QUFBQTtBQUFBLElBRTNCLG1CQUFtQjtBQUFBLEVBQ3JCO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQSxJQUVMLFFBQVEsQ0FBQyxVQUFVLFVBQVU7QUFBQTtBQUFBLElBRTdCLGNBQWM7QUFBQTtBQUFBLElBRWQsdUJBQXVCO0FBQUE7QUFBQSxJQUV2QixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUE7QUFBQSxRQUVOLGNBQWM7QUFBQTtBQUFBLFVBRVosUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBO0FBQUEsVUFFN0IsUUFBUSxDQUFDLGtCQUFrQjtBQUFBO0FBQUEsVUFFM0IsVUFBVSxDQUFDLHVCQUF1QjtBQUFBO0FBQUEsVUFFbEMsT0FBTyxDQUFDLHVCQUF1QjtBQUFBO0FBQUEsVUFFL0IsSUFBSSxDQUFDLDBCQUEwQixpQ0FBaUMsdUJBQXVCO0FBQUEsUUFDekY7QUFBQTtBQUFBLFFBRUEsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLG1CQUFtQjtBQUFBO0FBQUE7QUFBQSxJQUVuQixzQkFBc0I7QUFBQTtBQUFBLElBRXRCLFdBQVcsU0FBUyxnQkFBZ0IsT0FBTztBQUFBLEVBQzdDO0FBQUE7QUFBQSxFQUVBLFNBQVM7QUFBQTtBQUFBLElBRVAsTUFBTSxTQUFTLGVBQWUsQ0FBQyxXQUFXLFVBQVUsSUFBSSxDQUFDO0FBQUEsRUFDM0Q7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
