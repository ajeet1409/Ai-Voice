import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],

  // Production build optimizations
  // build: {
  //   // Enable minification
  //   minify: 'terser',
  //   terserOptions: {
  //     compress: {
  //       drop_console: true, // Remove console.logs in production
  //       drop_debugger: true,
  //     },
  //   },

    // Code splitting configuration
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       // Separate vendor chunks for better caching
    //       'react-vendor': ['react', 'react-dom'],
    //       'lucide': ['lucide-react'],
    //       'vapi': ['@vapi-ai/web'],
    //     },
    //   },
    // },

    // Chunk size warnings
    // chunkSizeWarningLimit: 1000,

    // Enable source maps for debugging (disable in production if not needed)
    // sourcemap: false,

    // Optimize CSS
  //   cssCodeSplit: true,
  // },

  // Performance optimizations
  // optimizeDeps: {
  //   include: ['react', 'react-dom', 'lucide-react', '@vapi-ai/web'],
  // },

  // Server configuration for development
  // server: {
  //   port: 5173,
  //   strictPort: false,
  //   host: true,
  // },
})
