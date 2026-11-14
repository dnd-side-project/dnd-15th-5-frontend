import { act, renderHook } from '@testing-library/react';

import { requestToNative } from '@/shared/lib/bridge';

import { useStickerGallery } from './useStickerGallery';

import type { BridgeResult } from '@chapchap/shared/bridge';

jest.mock('@/shared/lib/bridge', () => ({ requestToNative: jest.fn() }));

const success = { status: 'success', base64: btoa('gallery'), mimeType: 'image/jpeg' } as const;
const setup = () => {
  let finish!: (result: BridgeResult<'pickStickerImage'>) => void;
  jest.mocked(requestToNative).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const options = { isApp: true, onSelect: jest.fn(), onError: jest.fn() };
  return {
    ...renderHook(useStickerGallery, { initialProps: options }),
    options,
    finish: (value: BridgeResult<'pickStickerImage'>) => finish(value),
  };
};

beforeEach(() => jest.resetAllMocks());

it('앱 갤러리 중복 요청을 막고 응답은 최신 콜백으로 전달한다', async () => {
  const { result, options, rerender, finish } = setup();
  act(() => {
    result.current.openGallery();
    result.current.openGallery();
  });
  expect(requestToNative).toHaveBeenCalledTimes(1);
  expect(requestToNative).toHaveBeenCalledWith('pickStickerImage', {});
  const onSelect = jest.fn();
  rerender({ ...options, onSelect });
  await act(async () => finish(success));
  expect(options.onSelect).not.toHaveBeenCalled();
  const file = onSelect.mock.calls[0][0];
  expect(file).toBeInstanceOf(File);
  expect(file.name).toBe('sticker-image.jpg');
  expect(file.type).toBe('image/jpeg');
  expect(file.size).toBe(7);
});

it('취소 후에는 다시 갤러리를 열 수 있다', async () => {
  const { result, options, finish } = setup();
  act(() => result.current.openGallery());
  await act(async () => finish({ status: 'cancelled' }));
  expect(options.onSelect).not.toHaveBeenCalled();
  expect(options.onError).not.toHaveBeenCalled();
  jest.mocked(requestToNative).mockResolvedValueOnce(success);
  await act(async () => result.current.openGallery());
  expect(requestToNative).toHaveBeenCalledTimes(2);
  expect(options.onSelect).toHaveBeenCalledTimes(1);
});

it('갤러리 요청 실패를 알리고 재시도를 허용한다', async () => {
  jest.mocked(requestToNative).mockRejectedValueOnce(new Error('gallery failed'));
  const options = { isApp: true, onSelect: jest.fn(), onError: jest.fn() };
  const { result } = renderHook(() => useStickerGallery(options));
  await act(async () => result.current.openGallery());
  expect(options.onError).toHaveBeenCalledTimes(1);
  jest.mocked(requestToNative).mockResolvedValueOnce(success);
  await act(async () => result.current.openGallery());
  expect(options.onSelect).toHaveBeenCalledTimes(1);
});

it('화면 이탈 뒤 도착한 갤러리 결과는 무시한다', async () => {
  const { result, options, unmount, finish } = setup();
  act(() => result.current.openGallery());
  unmount();
  await act(async () => finish(success));
  expect(options.onSelect).not.toHaveBeenCalled();
  expect(options.onError).not.toHaveBeenCalled();
});
