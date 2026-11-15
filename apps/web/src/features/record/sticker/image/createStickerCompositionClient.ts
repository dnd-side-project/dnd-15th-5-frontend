import { StickerCompositionUnavailableError } from './stickerCompositionTypes';

import type { StickerCompositionMessage } from './stickerCompositionTypes';

const COMPOSITION_TIMEOUT_MS = 30_000;

/** 요청마다 가벼운 합성 Worker를 만들고 완료·실패·취소 시 즉시 해제합니다. */
export const createStickerCompositionClient =
  (createWorker: () => Worker) =>
  (foreground: Blob, signal: AbortSignal): Promise<Blob> =>
    new Promise((resolve, reject) => {
      signal.throwIfAborted();
      let worker: Worker;
      try {
        worker = createWorker();
      } catch {
        reject(new StickerCompositionUnavailableError());
        return;
      }
      let finished = false;
      const finish = (result: { error: Error } | { blob: Blob }) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
        worker.onmessage = null;
        worker.onerror = null;
        worker.onmessageerror = null;
        worker.terminate();
        if ('error' in result) reject(result.error);
        else resolve(result.blob);
      };
      const abort = () => finish({ error: new DOMException('Aborted', 'AbortError') });
      const timer = setTimeout(
        () => finish({ error: new Error('스티커 생성 시간이 초과됐어요. 다시 시도해주세요.') }),
        COMPOSITION_TIMEOUT_MS
      );
      worker.onmessage = (event: MessageEvent<StickerCompositionMessage>) => {
        const result = event.data;
        switch (result.type) {
          case 'success':
            finish({ blob: result.blob });
            break;
          case 'unsupported':
            finish({ error: new StickerCompositionUnavailableError() });
            break;
          case 'error':
            finish({ error: new Error(result.message) });
        }
      };
      worker.onerror = (event) => {
        event.preventDefault();
        finish({ error: new StickerCompositionUnavailableError() });
      };
      worker.onmessageerror = () => finish({ error: new StickerCompositionUnavailableError() });
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) {
        abort();
        return;
      }
      try {
        worker.postMessage(foreground);
      } catch {
        finish({ error: new StickerCompositionUnavailableError() });
      }
    });
