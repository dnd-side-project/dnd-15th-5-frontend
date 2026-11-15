import { launchImageLibraryAsync } from 'expo-image-picker';

import { prepareStickerPhoto } from './prepareStickerPhoto';

import type { BridgeResult } from '@chapchap/shared/bridge';

/** 앱 사진 보관함을 바로 열고 선택한 이미지를 브릿지용 JPEG로 반환합니다. */
export const pickStickerImage = async (): Promise<BridgeResult<'pickStickerImage'>> => {
  const result = await launchImageLibraryAsync({ mediaTypes: ['images'] });
  if (result.canceled) return { status: 'cancelled' };
  const asset = result.assets[0];
  if (!asset) throw new Error('선택한 이미지를 가져오지 못했어요.');
  const photo = await prepareStickerPhoto(asset);
  if (photo.status !== 'success') throw new Error('이미지를 가져오지 못했어요.');
  return photo;
};
