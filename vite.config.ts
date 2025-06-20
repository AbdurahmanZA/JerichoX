import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/config': path.resolve(__dirname, './src/config'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Proxy API calls to backend during development
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy WebSocket connections
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
      // Proxy Inter-VM communications during development
      '/vm-api': {
        target: 'http://localhost:8443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/vm-api/, '/api'),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize for ESXi VM resource constraints
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          // Keep Hikvision and security-related code together
          security: ['axios', 'socket.io-client', 'zod'],
          // Lightweight AI on client (heavy processing on AI VM)
          ai: ['@tensorflow/tfjs'],
          // VoIP/SIP functionality
          communications: ['sip.js'],
        },
      },
    },
    // Resource optimization for VM environments
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    target: 'es2020',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'axios',
      'socket.io-client',
      'zod',
      'date-fns',
      'lucide-react',
    ],
    // Exclude heavy dependencies that should be loaded separately
    exclude: ['@tensorflow/tfjs'],
  },
  define: {
    // Environment variables for different VM endpoints
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  css: {
    postcss: './postcss.config.js',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  // ESXi VM specific optimizations
  esbuild: {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  // Development environment settings
  preview: {
    port: 3000,
    host: true,
  },
  // For potential future PWA features (mobile command center)
  worker: {
    format: 'es',
  },
})