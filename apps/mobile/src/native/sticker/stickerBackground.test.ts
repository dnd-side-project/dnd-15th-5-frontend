import { waitFor } from '@testing-library/react-native';

import type * as StickerBackground from './stickerBackground';

jest.mock('expo', () => ({ requireOptionalNativeModule: jest.fn() }));
const native = { prepare: jest.fn(), remove: jest.fn(), cancel: jest.fn() };
const result = {
  base64: 'aW1hZ2U=',
  mimeType: 'image/png',
  backend: 'coreml',
  elapsedMs: 100,
} as const;
const payload = { requestId: 'photo-01', base64: 'cGhvdG8=', mimeType: 'image/png' } as const;
let api: typeof StickerBackground;
beforeEach(() => {
  jest.resetModules();
  native.prepare.mockReset().mockResolvedValue('coreml');
  native.remove.mockReset().mockResolvedValue(result);
  native.cancel.mockReset();
  // 격리한 모듈에서도 같은 가짜 네이티브 객체를 사용합니다.
  const expo = jest.requireMock('expo') as typeof import('expo');
  jest.mocked(expo.requireOptionalNativeModule).mockReturnValue(native);
  api = jest.requireActual('./stickerBackground') as typeof StickerBackground;
});

it('사전 준비와 사진 요청이 겹쳐도 네이티브 준비는 한 번만 한다', async () => {
  await Promise.all([
    api.prepareNativeStickerBackground(),
    api.prepareNativeStickerBackground(),
    api.removeNativeStickerBackground(payload),
  ]);
  expect(native.prepare).toHaveBeenCalledTimes(1);
  expect(native.remove).toHaveBeenCalledWith('photo-01', payload.base64);
});

it('구형 앱 빌드에서는 재빌드 안내를 반환한다', async () => {
  const expo = jest.requireMock('expo') as typeof import('expo');
  jest.mocked(expo.requireOptionalNativeModule).mockReturnValue(null);
  await expect(api.prepareNativeStickerBackground()).rejects.toThrow('새 개발 빌드');
});

it('준비 실패는 다음 요청에서 다시 준비할 수 있다', async () => {
  native.prepare.mockRejectedValueOnce(new Error('initialization failed'));
  await expect(api.prepareNativeStickerBackground()).rejects.toThrow('initialization failed');
  await expect(api.prepareNativeStickerBackground()).resolves.toEqual({
    ready: true,
    backend: 'coreml',
  });
  expect(native.prepare).toHaveBeenCalledTimes(2);
});

it('준비 중 취소하면 사진 추론을 시작하지 않는다', async () => {
  let finish!: () => void;
  native.prepare.mockReturnValueOnce(
    new Promise<string>((resolve) => {
      finish = () => resolve('coreml');
    })
  );
  const task = api.removeNativeStickerBackground(payload);
  const rejected = expect(task).rejects.toThrow('취소');
  await Promise.resolve();
  api.cancelNativeStickerBackground({ requestId: payload.requestId });
  await rejected;
  expect(native.remove).not.toHaveBeenCalled();
  finish();
  await api.prepareNativeStickerBackground();
});

it('처리 중 취소한 사진의 늦은 결과는 반환하지 않는다', async () => {
  let finish!: () => void;
  native.remove.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = () => resolve(result);
    })
  );
  await api.prepareNativeStickerBackground();
  const task = api.removeNativeStickerBackground(payload);
  const rejected = expect(task).rejects.toThrow('취소');
  await waitFor(() => expect(native.remove).toHaveBeenCalledTimes(1));
  api.cancelNativeStickerBackground({ requestId: payload.requestId });
  await rejected;
  expect(native.cancel).toHaveBeenCalledWith(payload.requestId);
  finish();
});

it('이전 사진 처리 중에는 중복 추론을 시작하지 않고 완료 후 다음 사진을 받는다', async () => {
  let finish!: () => void;
  native.remove.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = () => resolve(result);
    })
  );
  await api.prepareNativeStickerBackground();
  const first = api.removeNativeStickerBackground(payload);
  await expect(
    api.removeNativeStickerBackground({ ...payload, requestId: 'next' })
  ).rejects.toThrow('이전 사진');
  await waitFor(() => expect(native.remove).toHaveBeenCalledTimes(1));
  finish();
  await first;
  await expect(
    api.removeNativeStickerBackground({ ...payload, requestId: 'next' })
  ).resolves.toEqual(result);
  expect(native.prepare).toHaveBeenCalledTimes(1);
});

it('사진 추론 오류 후에도 다음 사진을 처리할 수 있다', async () => {
  native.remove.mockRejectedValueOnce(new Error('inference failed'));
  await expect(api.removeNativeStickerBackground(payload)).rejects.toThrow('inference failed');
  await expect(api.removeNativeStickerBackground(payload)).resolves.toEqual(result);
});

it('취소된 추론이 끝나기 전에 재시도를 받아 두고 연산 정리 후 자동으로 실행한다', async () => {
  let finish!: () => void;
  let oldRunning = true;
  native.remove
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = () => {
            oldRunning = false;
            resolve(result);
          };
        })
    )
    .mockImplementationOnce(async () => {
      expect(oldRunning).toBe(false);
      return result;
    });
  const first = api.removeNativeStickerBackground(payload);
  const rejected = expect(first).rejects.toThrow('취소');
  await waitFor(() => expect(native.remove).toHaveBeenCalledTimes(1));
  api.cancelNativeStickerBackground({ requestId: payload.requestId });
  await rejected;
  const retry = api.removeNativeStickerBackground({ ...payload, requestId: 'retry' });
  expect(native.remove).toHaveBeenCalledTimes(1);
  finish();
  await expect(retry).resolves.toEqual(result);
  expect(native.remove).toHaveBeenLastCalledWith('retry', payload.base64);
});

it('재시도 대기 중 취소해도 다음 요청을 막거나 취소된 사진을 추론하지 않는다', async () => {
  let fail!: () => void;
  native.remove.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        fail = () => reject(new Error('late inference failure'));
      })
  );
  const first = api.removeNativeStickerBackground(payload);
  const firstRejected = expect(first).rejects.toThrow('취소');
  await waitFor(() => expect(native.remove).toHaveBeenCalledTimes(1));
  api.cancelNativeStickerBackground({ requestId: payload.requestId });
  await firstRejected;

  const second = api.removeNativeStickerBackground({ ...payload, requestId: 'waiting' });
  const secondRejected = expect(second).rejects.toThrow('취소');
  api.cancelNativeStickerBackground({ requestId: 'waiting' });
  await secondRejected;
  expect(native.cancel).toHaveBeenCalledTimes(1);

  const third = api.removeNativeStickerBackground({ ...payload, requestId: 'latest' });
  fail();
  await expect(third).resolves.toEqual(result);
  expect(native.remove.mock.calls.map(([id]) => id)).toEqual([payload.requestId, 'latest']);
});
