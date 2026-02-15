import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ include: /\.[jt]sx?$/ })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
  ,
  // Dev server response headers to allow HMR, blob workers, Supabase and third-party widgets during local development.
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self' data: blob:; connect-src 'self' https://*.supabase.co https://core.service.elfsight.com ws: wss: http://localhost:5173 http://localhost:5180; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https://cdnjs.cloudflare.com https://use.fontawesome.com https://fonts.gstatic.com; frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube-nocookie.com https://www.youtube.com https://paramtuitions.com; worker-src 'self' blob:; frame-ancestors 'self' https://paramtuitions.com;",
      'X-Frame-Options': 'SAMEORIGIN'
    }
  }
  ,
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  }
  ,
  // Production build hardening: disable source maps and strip comments/console
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false
      },
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
