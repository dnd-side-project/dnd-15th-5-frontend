import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');

  return {
    plugins: [react(), svgr(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      dedupe: ['react', 'react-dom'],
    },
    // 실기기 앱의 WebView에서 개발 서버에 접근할 수 있도록 같은 네트워크에 노출한다
    server: {
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'https://chapchap.kr',
          changeOrigin: true,
          secure: true,
          // 운영 API 쿠키를 개발 서버의 host-only 쿠키로 저장한다.
          cookieDomainRewrite: '',
        },
      },
    },
  };
});
