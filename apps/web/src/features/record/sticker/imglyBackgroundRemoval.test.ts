import { preload, removeBackground } from '@imgly/background-removal';

import { getImglyGpuSupport } from './getImglyGpuSupport';
import { prepareImglyBackground, removeImglyBackground } from './imglyBackgroundRemoval';

jest.mock('@imgly/background-removal', () => ({
  preload: jest.fn(),
  removeBackground: jest.fn(),
}));
jest.mock('./getImglyGpuSupport', () => ({ getImglyGpuSupport: jest.fn() }));

it('그리기 컨텍스트를 만든 이미지로 GPU를 워밍업한 뒤 같은 IMG.LY 세션으로 사진을 처리한다', async () => {
  const originalCanvas = Object.getOwnPropertyDescriptor(globalThis, 'OffscreenCanvas');
  const warmup = new Blob(['warmup'], { type: 'image/png' });
  const photo = new Blob(['photo'], { type: 'image/png' });
  const foreground = new Blob(['foreground'], { type: 'image/png' });
  const fillRect = jest.fn();
  let hasContext = false;
  const getContext = jest.fn((kind: string) => {
    hasContext = kind === '2d';
    return { fillStyle: '', fillRect };
  });
  const convertToBlob = jest.fn(async () => {
    if (!hasContext)
      throw new DOMException('The OffscreenCanvas has no rendering context.', 'InvalidStateError');
    return warmup;
  });
  Object.defineProperty(globalThis, 'OffscreenCanvas', {
    configurable: true,
    value: class {
      getContext = getContext;
      convertToBlob = convertToBlob;
    },
  });
  jest.mocked(getImglyGpuSupport).mockResolvedValue({ supported: true });
  jest.mocked(preload).mockResolvedValue(undefined);
  jest.mocked(removeBackground).mockResolvedValue(foreground);
  const update = jest.fn();
  try {
    await prepareImglyBackground(update, false);
    await expect(removeImglyBackground(photo, update, false)).resolves.toBe(foreground);
    expect(getContext).toHaveBeenCalledWith('2d');
    expect(fillRect).toHaveBeenCalledWith(0, 0, 1, 1);
    expect(convertToBlob).toHaveBeenCalledWith({ type: 'image/png' });
    expect(preload).toHaveBeenCalledTimes(1);
    const config = jest.mocked(preload).mock.calls[0][0];
    expect(config).toMatchObject({ device: 'gpu', model: 'isnet_fp16' });
    expect(removeBackground).toHaveBeenNthCalledWith(1, warmup, config);
    expect(removeBackground).toHaveBeenNthCalledWith(2, photo, config);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ backend: 'gpu', phase: 'ready' })
    );
  } finally {
    if (originalCanvas) Object.defineProperty(globalThis, 'OffscreenCanvas', originalCanvas);
    else delete (globalThis as { OffscreenCanvas?: unknown }).OffscreenCanvas;
    jest.restoreAllMocks();
  }
});
