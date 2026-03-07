import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/auth': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/me': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/account': { target: 'http://localhost:3002', changeOrigin: true },
      '/api/transfer': { target: 'http://localhost:3003', changeOrigin: true },
      '/api/transactions': { target: 'http://localhost:3003', changeOrigin: true },
      '/api/notifications': { target: 'http://localhost:3004', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3004', ws: true, changeOrigin: true },
    }
  }
})
