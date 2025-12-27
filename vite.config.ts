import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'

const gatusUrl = process.env.GATUS_URL || 'http://localhost:8080'

// CRITICAL: UnoCSS must come BEFORE preact preset
export default defineConfig({
  plugins: [
    UnoCSS(),
    preact(),
  ],
  resolve: {
    alias: {
      '@': '/src',
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'react-dom/client': 'preact/compat/client',
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: gatusUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
