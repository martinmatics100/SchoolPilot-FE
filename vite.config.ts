import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',  // Root path
  server: {
    port: 5173,
    open: '/schoolpilot'  // So local dev still opens with /schoolpilot
  }
})
