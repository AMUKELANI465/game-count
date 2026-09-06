import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Override with `BACKEND_PORT=8010 npm run dev` if 8000 is already taken.
const BACKEND_URL = `http://localhost:${process.env.BACKEND_PORT || 8000}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': BACKEND_URL,
      '/uploads': BACKEND_URL,
      '/results': BACKEND_URL,
    },
  },
})
