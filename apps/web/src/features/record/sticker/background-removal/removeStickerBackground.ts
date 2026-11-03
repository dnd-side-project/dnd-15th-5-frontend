import { isNativeApp, requestToNative } from '@/shared/lib/bridge';

import { createStickerBackgroundClient } from './createStickerBackgroundClient';
import { assertNativeStickerBackground } from './nativeStickerCapabilities';
import { removeNativeStickerBackground } from './removeNativeStickerBackground';

const client = createStickerBackgroundClient(
  () => new Worker(new URL('./sticker.worker.ts', import.meta.url), { type: 'module' }),
  (message) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- backend·워밍업·재사용·추론 실패의 진단을 개발 콘솔에 남깁니다.
      console.info('[스티커 추론]', message);
    }
  }
);

export const prepareStickerBackground = () => {
  if (isNativeApp()) {
    void assertNativeStickerBackground()
      .then(() => requestToNative('prepareStickerBackground', {}))
      .catch(() => {});
  } else client.prepare();
};
export const removeStickerBackground = (
  image: Blob,
  signal: AbortSignal,
  onProgress: (message: string) => void
) => {
  if (!isNativeApp()) return client.remove(image, signal, onProgress);
  return removeNativeStickerBackground(image, signal, onProgress);
};
export const disposeStickerBackground = () => client.dispose();

if (import.meta.hot) import.meta.hot.dispose(client.dispose);
