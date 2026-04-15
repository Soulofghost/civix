import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react', 
            'react-dom', 
            'react-router-dom', 
            'framer-motion', 
            'zustand'
          ],
          'ui': ['lucide-react', 'sonner', 'clsx', 'tailwind-merge'],
          'charts': ['recharts'],
          'maps': ['leaflet', 'react-leaflet'],
          'pdf': ['jspdf']
        }
      }
    }
  }
})
