import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'

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
})
