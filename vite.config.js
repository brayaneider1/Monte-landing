import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Raise chunk warning threshold (we know what we're doing)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Split heavy deps into separate cacheable chunks
        manualChunks: {
          'react-vendor':  ['react', 'react-dom'],
          'router':        ['react-router-dom'],
          'motion':        ['framer-motion'],
        },
      },
    },

    // Minify with esbuild (faster + smaller than terser)
    minify: 'esbuild',

    // Inline tiny assets (< 4 KB) directly into JS to avoid extra requests
    assetsInlineLimit: 4096,

    // Enable source maps only in dev
    sourcemap: false,
  },

  // Pre-bundle these for faster dev HMR
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
    // Explicitly exclude the unused packages so they never enter the bundle
    exclude: ['three', 'vanta'],
  },
})

