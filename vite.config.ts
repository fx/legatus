import { defineConfig, loadEnv } from 'vite'
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'

// CRITICAL: UnoCSS must come BEFORE preact preset
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gatusUrl = env.GATUS_URL || 'http://localhost:8080'

  return {
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
  }
})
