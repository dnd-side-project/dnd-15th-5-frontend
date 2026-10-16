export type StickerDevice = 'gpu' | 'cpu';

export type StickerProgress = { type: 'progress'; key: string; current: number; total: number };
export type StickerDiagnostic = {
  type: 'diagnostic';
  backend: StickerDevice;
  phase: 'selected' | 'warming' | 'ready' | 'reused' | 'complete' | 'fallback';
  elapsedMs?: number;
  model?: 'isnet_fp16' | 'isnet_quint8';
  details?: string;
  gpuFailure?: string;
};
export type StickerWorkerUpdate = StickerProgress | StickerDiagnostic;
export type StickerWorkerRequest =
  | { type: 'prepare'; device?: 'cpu' }
  | { type: 'remove'; requestId: number; image: Blob; device?: 'cpu' };
export type StickerWorkerMessage =
  | (StickerWorkerUpdate & { requestId?: number })
  | { type: 'ready' }
  | { type: 'success'; requestId: number; blob: Blob }
  | {
      type: 'error';
      requestId?: number;
      message: string;
      details?: string;
      retryOnCpu?: boolean;
    };
