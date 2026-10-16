import {
  getImglyDevice,
  prepareImglyBackground,
  prioritizeImglyPhoto,
  removeImglyBackground,
} from './imglyBackgroundRemoval';
import './sticker.worker';

import type { StickerWorkerRequest } from './stickerWorkerTypes';

jest.mock('./imglyBackgroundRemoval', () => ({
  getImglyDevice: jest.fn(),
  prepareImglyBackground: jest.fn(),
  prioritizeImglyPhoto: jest.fn(),
  removeImglyBackground: jest.fn(),
}));
const mockRemove = jest.mocked(removeImglyBackground);
const mockPrepare = jest.mocked(prepareImglyBackground);
const image = new Blob(['photo'], { type: 'image/png' });
const dispatch = (request: StickerWorkerRequest) =>
  self.onmessage?.call(self, new MessageEvent('message', { data: request }));
const dispatchImage = () => dispatch({ type: 'remove', requestId: 1, image });
beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getImglyDevice).mockReturnValue('cpu');
  mockPrepare.mockResolvedValue(undefined);
  jest.spyOn(self, 'postMessage').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

it('워밍업 중 사진이 들어오면 준비 완료 뒤 처리한다', async () => {
  let finish = () => {};
  mockPrepare.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const png = new Blob(['foreground']);
  mockRemove.mockResolvedValue(png);
  const preparing = dispatch({ type: 'prepare' });
  const processing = dispatchImage();
  expect(prioritizeImglyPhoto).toHaveBeenCalledWith(false);
  await Promise.resolve();
  expect(mockRemove).not.toHaveBeenCalled();
  finish();
  await preparing;
  await processing;
  expect(self.postMessage).toHaveBeenNthCalledWith(1, { type: 'ready' });
  expect(self.postMessage).toHaveBeenNthCalledWith(2, { type: 'success', requestId: 1, blob: png });
});

it('모델 준비 진행률과 생성한 PNG를 요청 식별자와 함께 전달한다', async () => {
  const png = new Blob(['foreground'], { type: 'image/png' });
  const progress = { type: 'progress' as const, key: 'fetch:imgly', current: 5, total: 10 };
  mockRemove.mockImplementation(async (_, onUpdate) => {
    onUpdate(progress);
    return png;
  });
  await dispatchImage();
  expect(self.postMessage).toHaveBeenNthCalledWith(1, { ...progress, requestId: 1 });
  expect(self.postMessage).toHaveBeenNthCalledWith(2, { type: 'success', requestId: 1, blob: png });
});

it('실패 단계 안내와 원인 스택을 보존한다', async () => {
  const cause = new Error('WASM loader failed');
  mockRemove.mockRejectedValue(new Error('배경 제거 모델을 시작하지 못했어요.', { cause }));
  await dispatchImage();
  expect(self.postMessage).toHaveBeenCalledWith({
    type: 'error',
    requestId: 1,
    message: '배경 제거 모델을 시작하지 못했어요.',
    details: expect.stringContaining('WASM loader failed'),
  });
});

it('사전 준비 실패가 뒤에 들어온 사진 요청까지 막지 않는다', async () => {
  mockPrepare.mockRejectedValue(new Error('offline'));
  const png = new Blob(['png']);
  mockRemove.mockResolvedValue(png);
  await dispatch({ type: 'prepare' });
  await dispatchImage();
  expect(self.postMessage).toHaveBeenLastCalledWith({ type: 'success', requestId: 1, blob: png });
});

it('Error가 아닌 추론 실패도 안내와 진단 정보를 전달한다', async () => {
  mockRemove.mockRejectedValue('unsupported runtime');
  await dispatchImage();
  expect(self.postMessage).toHaveBeenCalledWith({
    type: 'error',
    requestId: 1,
    message: '배경을 제거하지 못했어요. 다시 시도해주세요.',
    details: 'unsupported runtime',
  });
});

it('GPU 실패는 새 CPU Worker에서 재시도하도록 표시한다', async () => {
  jest.mocked(getImglyDevice).mockReturnValue('gpu');
  mockRemove.mockRejectedValue(new Error('GPU failed'));
  await dispatchImage();
  expect(self.postMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'error',
      requestId: 1,
      retryOnCpu: true,
    })
  );
});

it('CPU 강제 요청은 IMG.LY에도 전달하고 CPU 재시도를 반복하지 않는다', async () => {
  jest.mocked(getImglyDevice).mockReturnValue('gpu');
  mockRemove.mockRejectedValue(new Error('CPU failed'));
  await dispatch({ type: 'remove', requestId: 1, image, device: 'cpu' });
  expect(mockRemove).toHaveBeenCalledWith(image, expect.any(Function), true);
  expect(self.postMessage).toHaveBeenCalledWith(expect.not.objectContaining({ retryOnCpu: true }));
});
