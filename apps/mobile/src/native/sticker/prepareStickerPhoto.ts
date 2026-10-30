import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { BridgeResult } from '@chapchap/shared/bridge';
const MAX_STICKER_EDGE = 1536;
const MAX_BASE64_LENGTH = 4 * 1024 * 1024;
/** 사진을 브릿지로 전달할 수 있는 크기의 JPEG로 변환합니다. */
export const prepareStickerPhoto = async (asset: {
  uri: string;
  width: number;
  height: number;
}): Promise<BridgeResult<'captureStickerPhoto'>> => {
  const context = ImageManipulator.manipulate(asset.uri);
  try {
    if (Math.max(asset.width, asset.height) > MAX_STICKER_EDGE) {
      context.resize(
        asset.width >= asset.height ? { width: MAX_STICKER_EDGE } : { height: MAX_STICKER_EDGE }
      );
    }
    const image = await context.renderAsync();
    try {
      const photo = await image.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.85,
        base64: true,
      });
      if (!photo.base64 || photo.base64.length > MAX_BASE64_LENGTH)
        throw new Error('사진 용량이 너무 커요. 다시 촬영해주세요.');
      return { status: 'success', base64: photo.base64, mimeType: 'image/jpeg' };
    } finally {
      image.release();
    }
  } finally {
    context.release();
  }
};
