import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    allowedHosts: true,
  },
  server: {
    proxy: {
      // Kakao OAuth token exchange (bypasses CORS from browser)
      '/oauth/kakao/token': {
        target: 'https://kauth.kakao.com',
        changeOrigin: true,
        rewrite: () => '/oauth/token',
      },
      // Kakao user info
      '/oauth/kakao/me': {
        target: 'https://kapi.kakao.com',
        changeOrigin: true,
        rewrite: () => '/v2/user/me',
      },
      // Naver OAuth token exchange
      '/oauth/naver/token': {
        target: 'https://nid.naver.com',
        changeOrigin: true,
        rewrite: () => '/oauth2.0/token',
      },
      // Naver user info
      '/oauth/naver/me': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: () => '/v1/nid/me',
      },
    },
  },
})


