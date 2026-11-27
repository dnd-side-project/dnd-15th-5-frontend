import { launchImageLibraryAsync } from 'expo-image-picker';

import { releaseTemporaryImage, trackPickedImage } from '@/native/image/temporaryImageFiles';

import { pickStickerImage } from './pickStickerImage';
import { prepareStickerPhoto } from './prepareStickerPhoto';

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('./prepareStickerPhoto');
jest.mock('@/native/image/temporaryImageFiles', () => ({
  trackPickedImage: jest.fn(),
  releaseTemporaryImage: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

it('사진 갤러리만 열고 선택한 사진을 브릿지용으로 변환한다', async () => {
  const asset = { uri: 'file://photo.heic', width: 4000, height: 3000 };
  jest
    .mocked(launchImageLibraryAsync)
    .mockResolvedValue({ canceled: false, assets: [{ ...asset, type: 'image' }] });
  jest
    .mocked(prepareStickerPhoto)
    .mockResolvedValue({ status: 'success', base64: 'cGhvdG8=', mimeType: 'image/jpeg' });
  expect(await pickStickerImage()).toEqual({
    status: 'success',
    base64: 'cGhvdG8=',
    mimeType: 'image/jpeg',
  });
  expect(launchImageLibraryAsync).toHaveBeenCalledWith({ mediaTypes: ['images'] });
  expect(prepareStickerPhoto).toHaveBeenCalledWith(expect.objectContaining(asset));
  expect(trackPickedImage).toHaveBeenCalledWith(asset.uri);
  expect(releaseTemporaryImage).toHaveBeenCalledWith(asset.uri);
});

it('취소하면 이미지 변환 없이 취소 결과를 반환한다', async () => {
  jest.mocked(launchImageLibraryAsync).mockResolvedValue({ canceled: true, assets: null });
  expect(await pickStickerImage()).toEqual({ status: 'cancelled' });
  expect(prepareStickerPhoto).not.toHaveBeenCalled();
  expect(trackPickedImage).not.toHaveBeenCalled();
});

it('변환 실패 시에도 선택기 캐시 복사본의 사용을 종료한다', async () => {
  jest.mocked(launchImageLibraryAsync).mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///cache/photo.jpg', width: 100, height: 100 }],
  } as never);
  jest.mocked(prepareStickerPhoto).mockRejectedValueOnce(new Error('conversion failed'));
  await expect(pickStickerImage()).rejects.toThrow('conversion failed');
  expect(releaseTemporaryImage).toHaveBeenCalledWith('file:///cache/photo.jpg');
});
