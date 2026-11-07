import { waitFor } from '@testing-library/react';

import { removeStickerBackground } from '@/features/record/sticker/background-removal/removeStickerBackground';
import { composeSticker, prepareStickerImage } from '@/features/record/sticker/image/stickerImage';

import { createPhotoSticker } from './createPhotoSticker';

jest.mock('@/features/record/sticker/background-removal/removeStickerBackground', () => ({
  removeStickerBackground: jest.fn(),
}));
jest.mock('@/features/record/sticker/image/stickerImage', () => ({
  prepareStickerImage: jest.fn(),
  composeSticker: jest.fn(),
}));

const photo = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
const prepared = new Blob(['prepared']);
const foreground = new Blob(['foreground']);
const sticker = new Blob(['sticker']);

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(prepareStickerImage).mockResolvedValue(prepared);
  jest.mocked(removeStickerBackground).mockResolvedValue(foreground);
  jest.mocked(composeSticker).mockResolvedValue(sticker);
});

it('정규화한 사진으로 배경을 제거하고 결과에 테두리를 합성한다', async () => {
  const { signal } = new AbortController();
  const onProgress = jest.fn();
  await expect(createPhotoSticker(photo, signal, onProgress)).resolves.toBe(sticker);
  expect(prepareStickerImage).toHaveBeenCalledWith(photo);
  expect(removeStickerBackground).toHaveBeenCalledWith(prepared, signal, onProgress);
  expect(composeSticker).toHaveBeenCalledWith(foreground);
  expect(onProgress).toHaveBeenLastCalledWith('흰색 테두리를 만들고 있어요');
});

it('이미 취소한 요청은 사진을 읽지 않는다', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(createPhotoSticker(photo, controller.signal, jest.fn())).rejects.toMatchObject({
    name: 'AbortError',
  });
  expect(prepareStickerImage).not.toHaveBeenCalled();
});

it.each(['prepare', 'remove', 'compose'] as const)(
  '%s 대기 중 취소하면 다음 단계를 실행하거나 완료 결과를 반환하지 않는다',
  async (stage) => {
    const controller = new AbortController();
    let finish: (blob: Blob) => void = () => {};
    const pending = new Promise<Blob>((resolve) => {
      finish = resolve;
    });
    const operation = {
      prepare: prepareStickerImage,
      remove: removeStickerBackground,
      compose: composeSticker,
    }[stage];
    jest.mocked(operation).mockReturnValueOnce(pending);
    const task = createPhotoSticker(photo, controller.signal, jest.fn());
    await waitFor(() => expect(operation).toHaveBeenCalledTimes(1));
    controller.abort();
    finish(sticker);
    await expect(task).rejects.toMatchObject({ name: 'AbortError' });
    if (stage === 'prepare') expect(removeStickerBackground).not.toHaveBeenCalled();
    if (stage !== 'compose') expect(composeSticker).not.toHaveBeenCalled();
  }
);
