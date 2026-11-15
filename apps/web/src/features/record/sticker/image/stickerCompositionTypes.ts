export type StickerCompositionMessage =
  { type: 'success'; blob: Blob } | { type: 'unsupported' } | { type: 'error'; message: string };

/** Worker 생성이나 OffscreenCanvas를 지원하지 않을 때만 기존 합성으로 복구합니다. */
export class StickerCompositionUnavailableError extends Error {}
