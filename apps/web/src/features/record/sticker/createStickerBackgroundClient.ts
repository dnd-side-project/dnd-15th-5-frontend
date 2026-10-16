import type { StickerWorkerMessage, StickerWorkerRequest } from './stickerWorkerTypes';

const PROCESSING_TIMEOUT = 180_000;
const DEFAULT_ERROR =
  '배경을 제거하지 못했어요. 네트워크와 브라우저 지원 여부를 확인하고 다시 시도해주세요.';
const aborted = () => new DOMException('Aborted', 'AbortError');

type PendingRequest = {
  id: number;
  image: Blob;
  signal: AbortSignal;
  onProgress: (message: string) => void;
  resolve: (blob: Blob) => void;
  reject: (error: Error) => void;
  cleanup: () => void;
};

/** 성공한 Worker는 재사용하고, 취소·오류·화면 이탈 시 종료합니다. */
export const createStickerBackgroundClient = (
  createWorker: () => Worker,
  onDiagnostic: (message: StickerWorkerMessage) => void = () => {}
) => {
  let worker: Worker | null = null;
  let pending: PendingRequest | null = null;
  let nextId = 0;
  let forceCpu = false;
  let gpuFailure: string | undefined;
  let prepareTimer: ReturnType<typeof setTimeout> | undefined;

  const clearPrepareTimer = () => {
    clearTimeout(prepareTimer);
    prepareTimer = undefined;
  };
  const terminate = () => {
    clearPrepareTimer();
    worker?.terminate();
    worker = null;
  };
  const stop = (error: Error) => {
    const request = pending;
    pending = null;
    request?.cleanup();
    terminate();
    request?.reject(error);
  };
  const getWorker = () => {
    if (worker) return worker;
    const current = createWorker();
    worker = current;
    current.onerror = (event) => {
      if (worker !== current) return;
      const details =
        (event.error instanceof Error ? event.error.stack || event.error.message : event.message) ||
        'Worker 실행이 중단됐지만 브라우저가 오류 원문을 제공하지 않았습니다';
      onDiagnostic({
        type: 'error',
        requestId: pending?.id,
        message: DEFAULT_ERROR,
        details,
      });
      if (!forceCpu) {
        retryOnCpu(details);
        return;
      }
      stop(new Error(DEFAULT_ERROR));
    };
    current.onmessageerror = () => {
      if (worker === current) stop(new Error(DEFAULT_ERROR));
    };
    current.onmessage = (event: MessageEvent<StickerWorkerMessage>) => {
      if (worker !== current) return;
      const message = event.data;
      if (message.type === 'diagnostic') {
        onDiagnostic(gpuFailure ? { ...message, gpuFailure } : message);
        return;
      }
      if (message.type === 'ready') {
        clearPrepareTimer();
        return;
      }
      const request = pending;
      if (message.type === 'error') {
        onDiagnostic(message);
        if (message.requestId !== undefined && request?.id !== message.requestId) return;
        if (message.retryOnCpu && !forceCpu) {
          retryOnCpu(message.details || message.message);
          return;
        }
        if (message.requestId === undefined) {
          if (!request) terminate();
          return;
        }
        if (request?.id === message.requestId) stop(new Error(message.message));
        return;
      }
      if (!request || (message.requestId !== undefined && message.requestId !== request.id)) return;
      if (message.type === 'success') {
        request.cleanup();
        pending = null;
        request.resolve(message.blob);
        return;
      }
      const isDownloading =
        message.key.startsWith('fetch:') && message.total > 0 && message.current < message.total;
      request.onProgress(
        isDownloading
          ? '스티커 생성에 필요한 데이터를 준비하고 있어요 (' +
              Math.round((message.current / message.total) * 100) +
              '%)'
          : '사진에서 배경을 지우고 있어요'
      );
    };
    return current;
  };
  const retryOnCpu = (reason: string) => {
    // NOTE: IMG.LY는 첫 ONNX 런타임을 캐시하므로 GPU 실패 시 새 Worker에서 CPU를 시작합니다.
    forceCpu = true;
    gpuFailure = reason;
    terminate();
    try {
      const current = getWorker();
      if (pending) {
        pending.onProgress('CPU로 배경 제거를 다시 시도하고 있어요');
        current.postMessage({
          type: 'remove',
          requestId: pending.id,
          image: pending.image,
          device: 'cpu',
        } satisfies StickerWorkerRequest);
      } else {
        prepareTimer = setTimeout(() => {
          if (worker === current && !pending) terminate();
        }, PROCESSING_TIMEOUT);
        current.postMessage({ type: 'prepare', device: 'cpu' } satisfies StickerWorkerRequest);
      }
    } catch {
      stop(new Error(DEFAULT_ERROR));
    }
  };
  const prepare = () => {
    if (worker) return;
    try {
      const current = getWorker();
      prepareTimer = setTimeout(() => {
        if (worker === current && !pending) terminate();
      }, PROCESSING_TIMEOUT);
      current.postMessage({
        type: 'prepare',
        ...(forceCpu ? { device: 'cpu' as const } : {}),
      } satisfies StickerWorkerRequest);
    } catch {
      terminate();
    }
  };
  const remove = (
    image: Blob,
    signal: AbortSignal,
    onProgress: (message: string) => void
  ): Promise<Blob> =>
    new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(aborted());
        return;
      }
      if (pending) stop(aborted());
      let current: Worker;
      try {
        current = getWorker();
      } catch {
        reject(new Error(DEFAULT_ERROR));
        return;
      }
      clearPrepareTimer();
      const id = ++nextId;
      const abort = () => stop(aborted());
      const timer = setTimeout(
        () => stop(new Error('사진 처리 시간이 초과됐어요. 더 작은 사진으로 다시 시도해주세요.')),
        PROCESSING_TIMEOUT
      );
      pending = {
        id,
        image,
        signal,
        onProgress,
        resolve,
        reject,
        cleanup: () => {
          clearTimeout(timer);
          signal.removeEventListener('abort', abort);
        },
      };
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) {
        abort();
        return;
      }
      try {
        current.postMessage({
          type: 'remove',
          requestId: id,
          image,
          ...(forceCpu ? { device: 'cpu' as const } : {}),
        } satisfies StickerWorkerRequest);
      } catch {
        stop(new Error(DEFAULT_ERROR));
      }
    });

  return {
    prepare,
    remove,
    dispose: () => {
      stop(aborted());
      forceCpu = false;
      gpuFailure = undefined;
    },
  };
};
