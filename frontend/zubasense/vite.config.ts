import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Force IPv4 to avoid IPv6 CORS issues
    port: 5173,
    strictPort: true,
  },
})
