import { preload, removeBackground } from '@imgly/background-removal';

import { createImglyBackgroundEngine } from './createImglyBackgroundEngine';
import { getImglyGpuSupport } from './getImglyGpuSupport';

import type { StickerWorkerUpdate } from './stickerWorkerTypes';

let engine: ReturnType<typeof createImglyBackgroundEngine> | undefined;
const getEngine = (forceCpu: boolean) => {
  engine ??= createImglyBackgroundEngine({
    api: { preload, removeBackground },
    forceCpu,
    getGpuSupport: () =>
      getImglyGpuSupport({
        gpu: navigator.gpu,
        secureContext: globalThis.isSecureContext,
        crossOriginIsolated: globalThis.crossOriginIsolated,
      }),
    createWarmupImage: () => {
      const canvas = new OffscreenCanvas(1, 1);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('배경 제거 예비 이미지를 만들지 못했어요.');
      context.fillStyle = '#808080';
      context.fillRect(0, 0, 1, 1);
      return canvas.convertToBlob({ type: 'image/png' });
    },
  });
  return engine;
};

export const prepareImglyBackground = (
  onUpdate: (update: StickerWorkerUpdate) => void,
  forceCpu: boolean
) => getEngine(forceCpu).prepare(onUpdate);

export const removeImglyBackground = (
  image: Blob,
  onUpdate: (update: StickerWorkerUpdate) => void,
  forceCpu: boolean
) => getEngine(forceCpu).remove(image, onUpdate);

export const getImglyDevice = () => engine?.getDevice();

export const prioritizeImglyPhoto = (forceCpu: boolean) => getEngine(forceCpu).prioritizePhoto();
