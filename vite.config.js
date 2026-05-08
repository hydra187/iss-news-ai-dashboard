import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/iss': {
        target: 'http://api.open-notify.org/iss-now.json',
        changeOrigin: true,
        rewrite: () => ''
      },
      '/api/astros': {
        target: 'http://api.open-notify.org/astros.json',
        changeOrigin: true,
        rewrite: () => ''
      }
    }
  }
})
