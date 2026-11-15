import { composeStickerOffThread } from './composeStickerOffThread';
import { renderSticker } from './stickerComposition';
import { StickerCompositionUnavailableError } from './stickerCompositionTypes';
import { composeSticker } from './stickerImage';

jest.mock('./composeStickerOffThread', () => ({ composeStickerOffThread: jest.fn() }));
jest.mock('./stickerComposition', () => ({ renderSticker: jest.fn() }));

const foreground = new Blob(['foreground']);
const png = new Blob(['sticker'], { type: 'image/png' });
const original = {
  Worker: globalThis.Worker,
  OffscreenCanvas: globalThis.OffscreenCanvas,
  createImageBitmap: globalThis.createImageBitmap,
  createObjectURL: URL.createObjectURL,
  revokeObjectURL: URL.revokeObjectURL,
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(globalThis, {
    Worker: jest.fn(),
    OffscreenCanvas: jest.fn(),
    createImageBitmap: jest.fn(),
  });
  Object.assign(URL, {
    createObjectURL: jest.fn(() => 'blob:foreground'),
    revokeObjectURL: jest.fn(),
  });
  jest.spyOn(window, 'Image').mockImplementation(
    () =>
      ({
        naturalWidth: 64,
        naturalHeight: 48,
        decode: async () => {},
      }) as HTMLImageElement
  );
  jest.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(png));
  jest.mocked(renderSticker).mockReturnValue(document.createElement('canvas'));
  jest.mocked(composeStickerOffThread).mockResolvedValue(png);
});
afterEach(() => {
  Object.assign(globalThis, {
    Worker: original.Worker,
    OffscreenCanvas: original.OffscreenCanvas,
    createImageBitmap: original.createImageBitmap,
  });
  Object.assign(URL, {
    createObjectURL: original.createObjectURL,
    revokeObjectURL: original.revokeObjectURL,
  });
  jest.restoreAllMocks();
});

it('지원 환경에서는 DOM 픽셀 합성 없이 Worker 결과를 사용한다', async () => {
  const { signal } = new AbortController();
  await expect(composeSticker(foreground, signal)).resolves.toBe(png);
  expect(composeStickerOffThread).toHaveBeenCalledWith(foreground, signal);
  expect(renderSticker).not.toHaveBeenCalled();
});

it('미지원 환경에서는 기존 DOM Canvas로 같은 합성 함수를 실행한다', async () => {
  Object.assign(globalThis, { OffscreenCanvas: undefined });
  await expect(composeSticker(foreground, new AbortController().signal)).resolves.toBe(png);
  expect(composeStickerOffThread).not.toHaveBeenCalled();
  expect(renderSticker).toHaveBeenCalledWith(expect.anything(), 64, 48, expect.any(Function));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:foreground');
});

it('Worker에서 Canvas 지원 불가를 알리면 DOM 합성으로 복구한다', async () => {
  jest
    .mocked(composeStickerOffThread)
    .mockRejectedValueOnce(new StickerCompositionUnavailableError());
  await expect(composeSticker(foreground, new AbortController().signal)).resolves.toBe(png);
  expect(renderSticker).toHaveBeenCalledTimes(1);
});

it('합성 자체가 실패하면 메인 스레드에서 같은 작업을 반복하지 않는다', async () => {
  jest.mocked(composeStickerOffThread).mockRejectedValueOnce(new Error('피사체 없음'));
  await expect(composeSticker(foreground, new AbortController().signal)).rejects.toThrow(
    '피사체 없음'
  );
  expect(renderSticker).not.toHaveBeenCalled();
});

it('Worker 결과 전달 직전에 취소하면 완료 결과나 DOM 폴백을 반환하지 않는다', async () => {
  const controller = new AbortController();
  jest.mocked(composeStickerOffThread).mockImplementationOnce(async () => {
    controller.abort();
    return png;
  });
  await expect(composeSticker(foreground, controller.signal)).rejects.toMatchObject({
    name: 'AbortError',
  });
  expect(renderSticker).not.toHaveBeenCalled();
});
