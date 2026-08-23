import { fileURLToPath, URL } from 'node:url'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'react-vendor'
          }
          if (id.includes('/node_modules/@tanstack/')) return 'tanstack-vendor'
          if (id.includes('/node_modules/better-auth/')) return 'auth-vendor'
          if (
            id.includes('/node_modules/radix-ui/') ||
            id.includes('/node_modules/@radix-ui/')
          ) {
            return 'ui-vendor'
          }
          return 'vendor'
        },
      },
    },
  },
  envDir: '../..',
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
