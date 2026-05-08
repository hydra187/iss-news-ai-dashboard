import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
      },
      '/api/news': {
        target: 'https://gnews.io/api/v4/top-headlines',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const category = url.searchParams.get('category') || 'general';
          const apiKey = process.env.VITE_NEWS_API_KEY || '';
          return `?category=${category}&lang=en&max=10&apikey=${apiKey}`;
        }
      }
    }
  }
})
