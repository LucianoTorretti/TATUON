import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // supabase/tests usa su propio runner (npm run test:db)
    include: ['src/**/*.test.{js,jsx}'],
  },
  server: {
    port: 5173,
    open: true,
  },
})
