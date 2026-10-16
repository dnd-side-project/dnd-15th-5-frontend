import { fileURLToPath } from 'node:url';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

import type { Plugin } from 'vite';

const SENTRY_ORGANIZATION = '481bfb6d59b2';
const SENTRY_PROJECT = 'chapchap-web';

// IMG.LY의 ONNX import를 원본 정적 모듈로 연결해 Vite 클라이언트의 Worker 유입을 막습니다.
const imglyOnnxRuntime = (): Plugin => ({
  name: 'imgly-onnx-runtime',
  enforce: 'pre',
  resolveId(source) {
    if (source === 'onnxruntime-web/webgpu')
      return { id: '/imgly-runtime/ort.webgpu.min.mjs', external: true };
    if (source === 'onnxruntime-web')
      return { id: '/imgly-runtime/ort.wasm.min.mjs', external: true };
    return null;
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const isSentryUploadEnabled = mode === 'production' && Boolean(process.env.SENTRY_AUTH_TOKEN);
  const sentryRelease = process.env.GITHUB_SHA
    ? `${SENTRY_PROJECT}@${process.env.GITHUB_SHA}`
    : undefined;

  return {
    plugins: [
      imglyOnnxRuntime(),
      react(),
      svgr(),
      tailwindcss(),
      sentryVitePlugin({
        org: SENTRY_ORGANIZATION,
        project: SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        disable: !isSentryUploadEnabled,
        telemetry: false,
        sourcemaps: {
          filesToDeleteAfterUpload: './dist/**/*.map',
        },
        release: {
          name: sentryRelease,
          setCommits: false,
        },
      }),
    ],
    worker: { format: 'es', plugins: () => [imglyOnnxRuntime()] },
    build: {
      sourcemap: isSentryUploadEnabled ? 'hidden' : false,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      exclude: ['@imgly/background-removal'],
    },
    // 실기기 앱의 WebView에서 개발 서버에 접근할 수 있도록 같은 네트워크에 노출한다
    server: {
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'https://chapchap.kr',
          changeOrigin: true,
          secure: true,
          // 개발 API의 경로와 쿠키 범위를 브라우저가 요청하는 `/api`에 맞춘다.
          rewrite: (path) => path.replace(/^\/api/, '/dev/api'),
          cookieDomainRewrite: '',
          cookiePathRewrite: {
            '/dev/api': '/api',
          },
        },
      },
    },
  };
});
