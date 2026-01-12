import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // ===========================================
  // PATH ALIASES
  // ===========================================
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },

  // ===========================================
  // BUILD OPTIMIZATION
  // ===========================================
  build: {
    // Target modern browsers for smaller bundles
    target: 'esnext',
    
    // Enable minification
    minify: 'esbuild',
    
    // Generate source maps for debugging (disable in prod if needed)
    sourcemap: false,
    
    // Chunk size warning limit (500KB)
    chunkSizeWarningLimit: 500,
    
    // Code splitting strategy
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks - cached separately
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
        },
        // Asset file naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Reduce bundle size
    reportCompressedSize: true,
  },

  // ===========================================
  // DEV SERVER OPTIMIZATION
  // ===========================================
  server: {
    port: 5173,
    strictPort: true,
    // Enable HMR
    hmr: {
      overlay: true,
    },
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/graphql': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  // ===========================================
  // PREVIEW SERVER (production build preview)
  // ===========================================
  preview: {
    port: 4173,
    strictPort: true,
  },

  // ===========================================
  // DEPENDENCY OPTIMIZATION
  // ===========================================
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
    // Force pre-bundling of these deps
    force: false,
  },

  // ===========================================
  // ESBUILD OPTIMIZATION
  // ===========================================
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Minify identifiers
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
});
