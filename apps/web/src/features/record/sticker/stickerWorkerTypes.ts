import type { IsnetBackend } from './isnetModels';

export type StickerProgress = { type: 'progress'; key: string; current: number; total: number };
export type StickerDiagnostic = {
  type: 'diagnostic';
  backend: IsnetBackend;
  phase: 'selected' | 'warming' | 'ready' | 'reused' | 'complete' | 'fallback';
  elapsedMs?: number;
  details?: string;
};
export type StickerWorkerUpdate = StickerProgress | StickerDiagnostic;
export type StickerWorkerRequest =
  { type: 'prepare' } | { type: 'remove'; requestId: number; image: Blob };
export type StickerWorkerMessage =
  | (StickerWorkerUpdate & { requestId?: number })
  | { type: 'ready' }
  | { type: 'success'; requestId: number; blob: Blob }
  | { type: 'error'; requestId?: number; message: string; details?: string };
