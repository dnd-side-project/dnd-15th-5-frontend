import { waitFor } from '@testing-library/react';

import { requestToNative } from '@/shared/lib/bridge';

import { removeNativeStickerBackground } from './removeNativeStickerBackground';

jest.mock('@/shared/lib/bridge', () => ({ requestToNative: jest.fn() }));
jest.mock('./nativeStickerCapabilities', () => ({
  assertNativeStickerBackground: jest.fn().mockResolvedValue(undefined),
}));
const request = jest.mocked(requestToNative);
const image = new Blob(['photo'], { type: 'image/png' });
const result = {
  base64: btoa('foreground'),
  mimeType: 'image/png',
  backend: 'coreml',
  elapsedMs: 100,
} as const;
beforeEach(() => {
  request
    .mockReset()
    .mockImplementation(async (type) =>
      type === 'prepareStickerBackground' ? { ready: true, backend: 'coreml' } : result
    );
});

it('사진을 네이티브에 보내고 받은 투명 PNG를 Blob으로 반환한다', async () => {
  const output = await removeNativeStickerBackground(image, new AbortController().signal);
  expect(output.type).toBe('image/png');
  expect(output.size).toBe('foreground'.length);
  expect(request).toHaveBeenCalledWith('removeStickerBackground', {
    requestId: expect.any(String),
    base64: btoa('photo'),
    mimeType: 'image/png',
  });
});

it('이미 취소한 사진은 네이티브에 보내지 않는다', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(removeNativeStickerBackground(image, controller.signal)).rejects.toMatchObject({
    name: 'AbortError',
  });
  expect(request).not.toHaveBeenCalled();
});

it('모델 준비를 기다리는 동안에도 사진 변환을 시작한다', async () => {
  const read = jest.spyOn(FileReader.prototype, 'readAsDataURL');
  let finish!: () => void;
  request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = () => resolve({ ready: true, backend: 'coreml' });
      })
  );
  try {
    const task = removeNativeStickerBackground(image, new AbortController().signal);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(read).toHaveBeenCalledWith(image);
    expect(request).not.toHaveBeenCalledWith('removeStickerBackground', expect.anything());
    finish();
    await task;
  } finally {
    read.mockRestore();
  }
});

it('PNG의 0부터 255까지 모든 바이트 값을 보존한다', async () => {
  const binary = Array.from({ length: 256 }, (_, index) => String.fromCharCode(index)).join('');
  request.mockImplementation(async (type) =>
    type === 'prepareStickerBackground'
      ? { ready: true, backend: 'coreml' }
      : { ...result, base64: btoa(binary) }
  );
  const output = await removeNativeStickerBackground(image, new AbortController().signal);
  const encoded = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(output);
  });
  expect(encoded).toBe(btoa(binary));
});

it('취소 즉시 화면 대기를 끝내고 같은 사진 ID의 네이티브 취소를 요청한다', async () => {
  let finish!: () => void;
  request.mockImplementation((type) =>
    type === 'removeStickerBackground'
      ? new Promise((resolve) => {
          finish = () => resolve(result);
        })
      : Promise.resolve({ ready: true, backend: 'coreml' })
  );
  const controller = new AbortController();
  const task = removeNativeStickerBackground(image, controller.signal);
  const rejected = expect(task).rejects.toMatchObject({ name: 'AbortError' });
  await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  const payload = request.mock.calls[1][1];
  controller.abort();
  await rejected;
  expect(request).toHaveBeenLastCalledWith('cancelStickerBackground', {
    requestId: 'requestId' in payload ? payload.requestId : '',
  });
  expect(request.mock.calls.filter(([type]) => type === 'cancelStickerBackground')).toHaveLength(1);
  finish();
  await Promise.resolve();
});

it('브릿지 시간 초과도 같은 사진 ID로 취소해 네이티브의 재시도 대기를 풀어준다', async () => {
  request.mockImplementation((type) => {
    if (type === 'prepareStickerBackground')
      return Promise.resolve({ ready: true, backend: 'coreml' });
    if (type === 'removeStickerBackground')
      return Promise.reject(new Error('네이티브 응답 시간 초과'));
    return Promise.resolve({ cancelled: true });
  });
  await expect(removeNativeStickerBackground(image, new AbortController().signal)).rejects.toThrow(
    '시간 초과'
  );
  const payload = request.mock.calls.find(([type]) => type === 'removeStickerBackground')?.[1];
  expect(request).toHaveBeenLastCalledWith('cancelStickerBackground', {
    requestId: payload && 'requestId' in payload ? payload.requestId : '',
  });
  expect(request.mock.calls.filter(([type]) => type === 'cancelStickerBackground')).toHaveLength(1);
});

it('네이티브 오류는 브라우저 CPU로 재시도하지 않고 폼으로 전달한다', async () => {
  request.mockRejectedValueOnce(new Error('새 개발 빌드를 설치해주세요'));
  await expect(removeNativeStickerBackground(image, new AbortController().signal)).rejects.toThrow(
    '새 개발 빌드'
  );
  expect(request).toHaveBeenCalledTimes(1);
});

it('모델 준비 중 취소하면 즉시 대기를 끝내고 사진 추론을 보내지 않는다', async () => {
  let finish!: () => void;
  request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = () => resolve({ ready: true, backend: 'coreml' });
      })
  );
  const controller = new AbortController();
  const progress = jest.fn();
  const task = removeNativeStickerBackground(image, controller.signal, progress);
  const rejected = expect(task).rejects.toMatchObject({ name: 'AbortError' });
  await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
  expect(progress).toHaveBeenLastCalledWith('사진 처리 기능을 준비하고 있어요');
  controller.abort();
  await rejected;
  finish();
  await Promise.resolve();
  expect(request).toHaveBeenCalledTimes(1);
});
