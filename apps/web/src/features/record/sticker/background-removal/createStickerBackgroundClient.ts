import type {
  StickerWorkerMessage,
  StickerWorkerRequest,
  StickerWorkerUpdate,
} from './stickerWorkerTypes';

const PROCESSING_TIMEOUT = 180_000;
const DEFAULT_ERROR =
  '배경을 제거하지 못했어요. 네트워크와 브라우저 지원 여부를 확인하고 다시 시도해주세요.';
const aborted = () => new DOMException('Aborted', 'AbortError');

const getProgressMessage = (message: StickerWorkerUpdate): string | undefined => {
  if (message.type === 'diagnostic') {
    switch (message.phase) {
      case 'selected':
        return '배경 제거 데이터를 준비하고 있어요';
      case 'initializing':
        return '배경 제거 모델을 시작하고 있어요';
      case 'warming':
        return '사진 처리 기능을 준비하고 있어요';
      case 'fallback':
        return '처리 방식을 바꿔 다시 준비하고 있어요';
      default:
        return undefined;
    }
  }
  if (message.key.startsWith('fetch:') && message.total > 0) {
    return message.current < message.total
      ? `스티커 생성에 필요한 데이터를 준비하고 있어요 (${Math.floor((message.current / message.total) * 100)}%)`
      : '배경 제거 모델을 시작하고 있어요';
  }
  return '사진에서 배경을 지우고 있어요';
};

type PendingRequest = {
  id: number;
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
  let lastProgress = '배경 제거 기능을 준비하고 있어요';
  let prepareTimer: ReturnType<typeof setTimeout> | undefined;

  const clearPrepareTimer = () => {
    clearTimeout(prepareTimer);
    prepareTimer = undefined;
  };
  const terminate = () => {
    clearPrepareTimer();
    worker?.terminate();
    worker = null;
    lastProgress = '배경 제거 기능을 준비하고 있어요';
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
      onDiagnostic({
        type: 'error',
        requestId: pending?.id,
        message: DEFAULT_ERROR,
        details: event.message,
      });
      stop(new Error(DEFAULT_ERROR));
    };
    current.onmessageerror = () => {
      if (worker === current) stop(new Error(DEFAULT_ERROR));
    };
    current.onmessage = (event: MessageEvent<StickerWorkerMessage>) => {
      if (worker !== current) return;
      const message = event.data;
      if (message.type === 'diagnostic') {
        onDiagnostic(message);
        if (message.requestId !== undefined && message.requestId !== pending?.id) return;
        const progress = getProgressMessage(message);
        if (progress) {
          lastProgress = progress;
          pending?.onProgress(progress);
        }
        return;
      }
      if (message.type === 'ready') {
        clearPrepareTimer();
        lastProgress = '사진 처리 준비가 완료됐어요';
        return;
      }
      const request = pending;
      if (message.type === 'error') {
        onDiagnostic(message);
        if (message.requestId === undefined) {
          stop(new Error(message.message));
          return;
        }
        if (request?.id === message.requestId) stop(new Error(message.message));
        return;
      }
      if (message.requestId !== undefined && message.requestId !== request?.id) return;
      if (message.type === 'progress') {
        lastProgress = getProgressMessage(message) ?? lastProgress;
        request?.onProgress(lastProgress);
        return;
      }
      if (!request) return;
      if (message.type === 'success') {
        request.cleanup();
        pending = null;
        request.resolve(message.blob);
        return;
      }
    };
    return current;
  };
  const prepare = () => {
    if (worker) return;
    try {
      const current = getWorker();
      prepareTimer = setTimeout(() => {
        if (worker === current && !pending) terminate();
      }, PROCESSING_TIMEOUT);
      current.postMessage({ type: 'prepare' } satisfies StickerWorkerRequest);
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
        () => stop(new Error('사진 처리 시간이 초과됐어요. 네트워크와 기기 상태를 확인해주세요.')),
        PROCESSING_TIMEOUT
      );
      pending = {
        id,
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
        onProgress(lastProgress);
        current.postMessage({
          type: 'remove',
          requestId: id,
          image,
        } satisfies StickerWorkerRequest);
      } catch {
        stop(new Error(DEFAULT_ERROR));
      }
    });

  return { prepare, remove, dispose: () => stop(aborted()) };
};
