import { renderSticker } from './stickerComposition';

import type { StickerCompositionMessage } from './stickerCompositionTypes';

const respond = (message: StickerCompositionMessage) => self.postMessage(message);

const supportsComposition = () => {
  try {
    return (
      typeof OffscreenCanvas !== 'undefined' &&
      typeof createImageBitmap !== 'undefined' &&
      typeof OffscreenCanvas.prototype.convertToBlob === 'function' &&
      Boolean(new OffscreenCanvas(1, 1).getContext('2d'))
    );
  } catch {
    return false;
  }
};

self.onmessage = async (event: MessageEvent<Blob>) => {
  if (!supportsComposition()) {
    respond({ type: 'unsupported' });
    return;
  }
  let image: ImageBitmap | undefined;
  try {
    image = await createImageBitmap(event.data);
    const canvas = renderSticker(image, image.width, image.height, (width, height) => {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('이미지를 편집하지 못했어요.');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      return { canvas, context };
    });
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    respond({ type: 'success', blob });
  } catch (error) {
    respond({
      type: 'error',
      message: error instanceof Error ? error.message : '스티커를 만들지 못했어요.',
    });
  } finally {
    image?.close();
  }
};
