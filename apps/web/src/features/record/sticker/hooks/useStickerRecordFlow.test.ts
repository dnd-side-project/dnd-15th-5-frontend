import { act, renderHook, waitFor } from '@testing-library/react';

import { prepareStickerBackground } from '@/features/record/sticker/background-removal/removeStickerBackground';
import { cropStickerImage } from '@/features/record/sticker/image/stickerImage';
import { createPhotoSticker } from '@/features/record/sticker/utils/createPhotoSticker';
import { isNativeApp, requestToNative } from '@/shared/lib/bridge';

import { useStickerRecordFlow } from './useStickerRecordFlow';

jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn(), requestToNative: jest.fn() }));
jest.mock('@/features/record/sticker/utils/createPhotoSticker', () => ({
  createPhotoSticker: jest.fn(),
}));
jest.mock('@/features/record/sticker/background-removal/removeStickerBackground', () => ({
  prepareStickerBackground: jest.fn(),
  disposeStickerBackground: jest.fn(),
}));

jest.mock('@/features/record/sticker/image/stickerImage', () => ({
  ...jest.requireActual('@/features/record/sticker/image/stickerImage'),
  cropStickerImage: jest.fn(),
}));

const photo = new File(['photo'], 'photo.png', { type: 'image/png' });
const crop = { left: 0, top: 0, right: 1, bottom: 1 };

type FlowScreen = ReturnType<typeof useStickerRecordFlow>['screen'];
const getCropSource = (screen: FlowScreen) =>
  screen.stage === 'crop'
    ? screen.cropSource
    : screen.stage === 'preview'
      ? screen.input.cropSource
      : null;
const getPreviewResult = (screen: FlowScreen) =>
  screen.stage === 'preview' ? screen.result : null;

beforeEach(() => {
  jest.resetAllMocks();
  URL.createObjectURL = jest.fn(() => 'blob:photo');
  URL.revokeObjectURL = jest.fn();
  jest.mocked(cropStickerImage).mockResolvedValue(photo);
  jest.mocked(createPhotoSticker).mockResolvedValue(new Blob());
});

it('갤러리 기록에서 뒤로 가면 같은 원본과 자르기 영역을 복원한다', async () => {
  const { result } = renderHook(useStickerRecordFlow);
  const selectedCrop = { left: 0.1, top: 0.2, right: 0.8, bottom: 0.9 };
  act(() => result.current.openCrop(photo));
  const originalSource = getCropSource(result.current.screen);
  await act(async () => result.current.confirmCrop(selectedCrop));
  act(() => result.current.confirm());
  const recorded = result.current.recordResult;
  act(() => result.current.backToMediaSelection());
  expect(result.current.screen.stage).toBe('crop');
  expect(getCropSource(result.current.screen)).toBe(originalSource);
  expect(result.current.recordResult).toBe(recorded);
  expect(result.current.recordResult?.crop).toEqual(selectedCrop);
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
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
  expect(getCropSource(result.current.screen)?.file).toBe(nextPhoto);
  expect(result.current.isCropping).toBe(false);
  expect(createPhotoSticker).not.toHaveBeenCalled();
  jest.mocked(cropStickerImage).mockResolvedValueOnce(nextPhoto);
  await act(async () => result.current.confirmCrop(crop));
  expect(createPhotoSticker).toHaveBeenCalledWith(
    nextPhoto,
    expect.any(AbortSignal),
    expect.any(Function)
  );
  expect(getPreviewResult(result.current.screen)).not.toBeNull();
});

it('다른 이미지 선택을 시작하면 이전 사진의 늦은 진행률과 완료를 무시한다', async () => {
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
  act(() => result.current.openDefaultStickers());
  await act(async () => {
    onProgress('늦은 진행률');
    finish(new Blob());
    await task;
  });
  expect(signal.aborted).toBe(true);
  expect(result.current.screen.stage).toBe('default');
  expect(result.current.message).toBe('');
  expect(getPreviewResult(result.current.screen)).toBeNull();
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
  expect(result.current.screen.stage).toBe('record');
  const recordedPhoto = result.current.recordResult;
  act(() => result.current.backToMediaSelection());
  expect(result.current.screen.stage).toBe('preview');
  expect(result.current.recordResult).toBe(recordedPhoto);
  expect(cropStickerImage).not.toHaveBeenCalled();
  expect(result.current.screen).toMatchObject({ input: { source: 'camera' } });
  act(() => result.current.cancelPreview());
  expect(result.current.screen.stage).toBe('select');
  expect(getCropSource(result.current.screen)).toBeNull();
  expect(result.current.recordResult).toBe(recordedPhoto);
  expect(result.current.recordResult?.source).toBe('photo');
});

it('촬영 사진의 생성을 취소해 배경 제거 Worker가 종료돼도 다음 사진 선택에서 다시 준비한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest
    .mocked(requestToNative)
    .mockResolvedValue({ status: 'success', base64: btoa('photo'), mimeType: 'image/jpeg' });
  jest.mocked(createPhotoSticker).mockReturnValueOnce(new Promise(() => {}));
  const { result } = renderHook(useStickerRecordFlow);
  act(() => {
    void result.current.capturePhoto();
  });
  await waitFor(() => expect(result.current.isProcessing).toBe(true));
  const [, signal] = jest.mocked(createPhotoSticker).mock.calls[0];
  jest.mocked(prepareStickerBackground).mockClear();
  act(() => result.current.cancelPreview());
  expect(signal.aborted).toBe(true);
  expect(result.current.screen.stage).toBe('select');
  act(() => result.current.openCrop(photo));
  expect(prepareStickerBackground).toHaveBeenCalledTimes(1);
});
