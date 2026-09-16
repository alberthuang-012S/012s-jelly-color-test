import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/012s-jelly-color-test/',
  server: {
    port: 4173,
  },
})
