import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Taaki updates background mein instantly sync ho jayein
    watch: {
      usePolling: true,
    },
  },
})