import { launchImageLibraryAsync } from 'expo-image-picker';

import { pickStickerImage } from './pickStickerImage';
import { prepareStickerPhoto } from './prepareStickerPhoto';

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('./prepareStickerPhoto');

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
});

it('취소하면 이미지 변환 없이 취소 결과를 반환한다', async () => {
  jest.mocked(prepareStickerPhoto).mockClear();
  jest.mocked(launchImageLibraryAsync).mockResolvedValue({ canceled: true, assets: null });
  expect(await pickStickerImage()).toEqual({ status: 'cancelled' });
  expect(prepareStickerPhoto).not.toHaveBeenCalled();
});
