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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-router-dom') || id.includes('framer-motion') || id.includes('zustand')) {
              return 'vendor';
            }
            if (id.includes('lucide-react') || id.includes('sonner') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui-core';
            }
            if (id.includes('recharts')) {
              return 'analytics';
            }
            if (id.includes('leaflet')) {
              return 'geo';
            }
            if (id.includes('jspdf')) {
              return 'pdf-engine';
            }
            return 'common-libs';
          }
        }
      }
    }
  }
})
