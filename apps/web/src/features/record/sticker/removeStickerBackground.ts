type ProgressMessage = { type: 'progress'; key: string; current: number; total: number };
type WorkerMessage = ProgressMessage | { type: 'success'; blob: Blob } | { type: 'error' };
const PROCESSING_TIMEOUT = 180_000;

/** 요청마다 Worker를 정리합니다. 취소하면 실제 추론 작업도 중단됩니다. */
export const removeStickerBackground = (
  image: Blob,
  signal: AbortSignal,
  onProgress: (message: string) => void
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const worker = new Worker(new URL('./sticker.worker.ts', import.meta.url), { type: 'module' });
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      worker.terminate();
    };
    const abort = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const fail = () => {
      cleanup();
      reject(
        new Error(
          '배경을 제거하지 못했어요. 네트워크와 브라우저 지원 여부를 확인하고 다시 시도해주세요.'
        )
      );
    };
    const timer = setTimeout(fail, PROCESSING_TIMEOUT);
    signal.addEventListener('abort', abort, { once: true });
    worker.onerror = fail;
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.type === 'error') {
        fail();
        return;
      }
      if (message.type === 'success') {
        cleanup();
        resolve(message.blob);
        return;
      }
      if (
        message.key.startsWith('fetch:') &&
        message.total > 0 &&
        message.current < message.total
      ) {
        onProgress(
          '스티커 생성에 필요한 데이터를 준비하고 있어요 (' +
            Math.round((message.current / message.total) * 100) +
            '%)'
        );
      } else {
        onProgress('사진에서 배경을 지우고 있어요');
      }
    };
    worker.postMessage(image);
  });
