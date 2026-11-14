import { renderSticker } from './stickerComposition';
import './stickerComposition.worker';

jest.mock('./stickerComposition', () => ({ renderSticker: jest.fn() }));

const png = new Blob(['sticker'], { type: 'image/png' });
const image = { width: 64, height: 48, close: jest.fn() };
const convertToBlob = jest.fn(async () => png);
const getContext = jest.fn(() => ({}));
const bitmap = jest.fn(async () => image);
const originalCanvas = globalThis.OffscreenCanvas;
const originalBitmap = globalThis.createImageBitmap;

class FakeCanvas {
  getContext() {
    return getContext();
  }
  convertToBlob() {
    return convertToBlob();
  }
}

const dispatch = () =>
  self.onmessage?.call(
    self,
    new MessageEvent('message', {
      data: new Blob(['foreground']),
    })
  );

beforeEach(() => {
  jest.clearAllMocks();
  getContext.mockReturnValue({});
  bitmap.mockResolvedValue(image);
  Object.assign(globalThis, { OffscreenCanvas: FakeCanvas, createImageBitmap: bitmap });
  jest.mocked(renderSticker).mockReturnValue(new FakeCanvas() as unknown as OffscreenCanvas);
  jest.spyOn(self, 'postMessage').mockImplementation(() => {});
});
afterEach(() => {
  Object.assign(globalThis, { OffscreenCanvas: originalCanvas, createImageBitmap: originalBitmap });
  jest.restoreAllMocks();
});

it('공통 합성 결과를 PNG로 인코딩하고 ImageBitmap을 해제한다', async () => {
  await dispatch();
  expect(renderSticker).toHaveBeenCalledWith(image, 64, 48, expect.any(Function));
  expect(self.postMessage).toHaveBeenCalledWith({ type: 'success', blob: png });
  expect(image.close).toHaveBeenCalledTimes(1);
});

it('Worker에 OffscreenCanvas가 없으면 폴백을 요청한다', async () => {
  Object.assign(globalThis, { OffscreenCanvas: undefined });
  await dispatch();
  expect(self.postMessage).toHaveBeenCalledWith({ type: 'unsupported' });
  expect(bitmap).not.toHaveBeenCalled();
});

it('Canvas 생성이 제한된 환경도 예외를 누락하지 않고 폴백을 요청한다', async () => {
  getContext.mockImplementationOnce(() => {
    throw new Error('Canvas disabled');
  });
  await dispatch();
  expect(self.postMessage).toHaveBeenCalledWith({ type: 'unsupported' });
});

it('이미지 처리 오류를 전달하고 디코딩한 비트맵을 해제한다', async () => {
  jest.mocked(renderSticker).mockImplementationOnce(() => {
    throw new Error('피사체 없음');
  });
  await dispatch();
  expect(self.postMessage).toHaveBeenCalledWith({ type: 'error', message: '피사체 없음' });
  expect(image.close).toHaveBeenCalledTimes(1);
});

it('디코딩 실패도 재시도할 수 있는 오류 응답으로 반환한다', async () => {
  bitmap.mockRejectedValueOnce(new Error('잘못된 사진'));
  await dispatch();
  expect(self.postMessage).toHaveBeenCalledWith({ type: 'error', message: '잘못된 사진' });
  expect(image.close).not.toHaveBeenCalled();
});
