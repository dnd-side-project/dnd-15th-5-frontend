import { MAX_STICKER_IMAGE_BASE64_LENGTH } from '@chapchap/shared/bridge';

import { requestToNative } from '@/shared/lib/bridge';

import { assertNativeStickerBackground } from './nativeStickerCapabilities';

let nextId = 0;
const aborted = () => new DOMException('Aborted', 'AbortError');

const waitWithAbort = <T>(
  operation: () => Promise<T>,
  signal: AbortSignal,
  onCancel?: () => void
): Promise<T> =>
  new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const cleanup = () => signal.removeEventListener('abort', onAbort);
    const onAbort = () => {
      cleanup();
      onCancel?.();
      reject(aborted());
    };
    signal.addEventListener('abort', onAbort, { once: true });
    void Promise.resolve()
      .then(() => {
        signal.throwIfAborted();
        return operation();
      })
      .then((result) => {
        if (!signal.aborted) resolve(result);
      })
      .catch((error: unknown) => {
        if (!signal.aborted) reject(error);
      })
      .finally(cleanup);
  });

const toBase64 = (image: Blob, signal: AbortSignal): Promise<string> =>
  new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const reader = new FileReader();
    const onAbort = () => reader.abort();
    const cleanup = () => signal.removeEventListener('abort', onAbort);
    reader.onerror = () => {
      cleanup();
      reject(new Error('사진을 읽지 못했어요.'));
    };
    reader.onabort = () => {
      cleanup();
      reject(aborted());
    };
    reader.onload = () => {
      cleanup();
      const base64 = typeof reader.result === 'string' ? reader.result.split(',')[1] : '';
      if (!base64 || base64.length > MAX_STICKER_IMAGE_BASE64_LENGTH) {
        reject(new Error('사진을 전달하지 못했어요. 더 작은 사진을 선택해주세요.'));
      } else resolve(base64);
    };
    signal.addEventListener('abort', onAbort, { once: true });
    reader.readAsDataURL(image);
  });

/** 앱에서는 WebView에서 모델을 실행하지 않고, 네이티브가 만든 투명 PNG만 받습니다. */
export const removeNativeStickerBackground = async (
  image: Blob,
  signal: AbortSignal,
  onProgress: (message: string) => void = () => {}
): Promise<Blob> => {
  signal.throwIfAborted();
  onProgress('사진 처리 기능을 준비하고 있어요');
  const [, base64] = await Promise.all([
    waitWithAbort(async () => {
      await assertNativeStickerBackground();
      signal.throwIfAborted();
      return requestToNative('prepareStickerBackground', {});
    }, signal),
    toBase64(image, signal),
  ]);
  signal.throwIfAborted();
  const requestId = `sticker-${Date.now()}-${++nextId}`;
  onProgress('사진에서 배경을 지우고 있어요');
  let cancellationRequested = false;
  const cancel = () => {
    if (cancellationRequested) return;
    cancellationRequested = true;
    void requestToNative('cancelStickerBackground', { requestId }).catch(() => {});
  };
  const result = await waitWithAbort(
    () => requestToNative('removeStickerBackground', { requestId, base64, mimeType: 'image/png' }),
    signal,
    cancel
  ).catch((error: unknown) => {
    // NOTE: 브릿지 시간 초과도 네이티브 요청을 취소해 다음 사진을 처리할 수 있게 합니다.
    cancel();
    throw error;
  });
  signal.throwIfAborted();
  const binary = atob(result.base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: 'image/png' });
};
