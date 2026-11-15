import { createStickerCompositionClient } from './createStickerCompositionClient';

export const composeStickerOffThread = createStickerCompositionClient(
  () => new Worker(new URL('./stickerComposition.worker.ts', import.meta.url), { type: 'module' })
);
