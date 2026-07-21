import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5600,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5055',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5055',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
