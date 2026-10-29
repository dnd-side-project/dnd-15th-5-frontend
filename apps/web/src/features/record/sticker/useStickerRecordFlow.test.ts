import { act, renderHook, waitFor } from '@testing-library/react';

import { isNativeApp, requestToNative } from '@/shared/lib/bridge';

import { createPhotoSticker } from './createPhotoSticker';
import { cropStickerImage } from './stickerImage';
import { useStickerRecordFlow } from './useStickerRecordFlow';

jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn(), requestToNative: jest.fn() }));
jest.mock('./createPhotoSticker', () => ({ createPhotoSticker: jest.fn() }));
jest.mock('./removeStickerBackground', () => ({
  prepareStickerBackground: jest.fn(),
  disposeStickerBackground: jest.fn(),
}));

jest.mock('./stickerImage', () => ({
  ...jest.requireActual('./stickerImage'),
  cropStickerImage: jest.fn(),
}));

const photo = new File(['photo'], 'photo.png', { type: 'image/png' });
const crop = { left: 0, top: 0, right: 1, bottom: 1 };

beforeEach(() => {
  jest.resetAllMocks();
  URL.createObjectURL = jest.fn(() => 'blob:photo');
  URL.revokeObjectURL = jest.fn();
  jest.mocked(cropStickerImage).mockResolvedValue(photo);
  jest.mocked(createPhotoSticker).mockResolvedValue(new Blob());
});

it('자르기에서 이미지 생성으로 넘어가면 자르기 대기 상태를 해제한다', async () => {
  let finish: (blob: Blob) => void = () => {};
  jest.mocked(createPhotoSticker).mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const { result } = renderHook(useStickerRecordFlow);
  act(() => result.current.openCrop(photo));
  let task!: Promise<void>;
  act(() => {
    task = result.current.confirmCrop(crop);
  });
  await waitFor(() => expect(result.current.isProcessing).toBe(true));
  expect(result.current.isCropping).toBe(false);
  await act(async () => {
    finish(new Blob());
    await task;
  });
  expect(result.current.isProcessing).toBe(false);
});

it('다른 사진으로 자르기를 시작하면 이전 사진의 늦은 자르기 결과를 무시한다', async () => {
  let finish: (file: File) => void = () => {};
  jest.mocked(cropStickerImage).mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const { result } = renderHook(useStickerRecordFlow);
  act(() => result.current.openCrop(photo));
  let task!: Promise<void>;
  act(() => {
    task = result.current.confirmCrop(crop);
  });
  const nextPhoto = new File(['next'], 'next.png', { type: 'image/png' });
  act(() => result.current.openCrop(nextPhoto));
  await act(async () => {
    finish(photo);
    await task;
  });
  expect(result.current.cropSource?.file).toBe(nextPhoto);
  expect(result.current.isCropping).toBe(false);
  expect(createPhotoSticker).not.toHaveBeenCalled();
  jest.mocked(cropStickerImage).mockResolvedValueOnce(nextPhoto);
  await act(async () => result.current.confirmCrop(crop));
  expect(createPhotoSticker).toHaveBeenCalledWith(
    nextPhoto,
    expect.any(AbortSignal),
    expect.any(Function)
  );
  expect(result.current.result).not.toBeNull();
});

it('취소한 사진의 늦은 진행률과 완료 결과가 선택 화면을 덮지 않는다', async () => {
  let finish: (blob: Blob) => void = () => {};
  jest.mocked(createPhotoSticker).mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const { result } = renderHook(useStickerRecordFlow);
  act(() => result.current.openCrop(photo));
  let task!: Promise<void>;
  act(() => {
    task = result.current.confirmCrop(crop);
  });
  await waitFor(() => expect(createPhotoSticker).toHaveBeenCalledTimes(1));
  const createdUrls = jest.mocked(URL.createObjectURL).mock.results.map(({ value }) => value);
  const [, signal, onProgress] = jest.mocked(createPhotoSticker).mock.calls[0];
  act(() => result.current.reset());
  await act(async () => {
    onProgress('늦은 진행률');
    finish(new Blob());
    await task;
  });
  expect(signal.aborted).toBe(true);
  expect(result.current.stage).toBe('select');
  expect(result.current.message).toBe('');
  expect(result.current.result).toBeNull();
  expect(URL.createObjectURL).toHaveBeenCalledTimes(createdUrls.length);
  expect(jest.mocked(URL.revokeObjectURL).mock.calls.map(([url]) => url)).toEqual(
    expect.arrayContaining(createdUrls)
  );
});

it('촬영에서 누끼 생성으로 넘어가면 촬영 대기 상태를 해제한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest
    .mocked(requestToNative)
    .mockResolvedValue({ status: 'success', base64: btoa('photo'), mimeType: 'image/jpeg' });
  let finish: (blob: Blob) => void = () => {};
  jest.mocked(createPhotoSticker).mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const { result } = renderHook(useStickerRecordFlow);
  let task!: Promise<void>;
  act(() => {
    task = result.current.capturePhoto();
  });
  await waitFor(() => expect(result.current.isProcessing).toBe(true));
  expect(result.current.isCapturing).toBe(false);
  await act(async () => {
    finish(new Blob());
    await task;
  });
  act(() => result.current.confirm());
  expect(result.current.stage).toBe('record');
});
