import { requestToNative } from '@/shared/lib/bridge';

/** 네이티브 카메라의 촬영 결과를 웹 이미지 처리에 사용할 File로 변환합니다. */
export const captureStickerPhoto = async () => {
  const photo = await requestToNative('captureStickerPhoto', {});
  if (photo.status !== 'success') return photo;

  const bytes = Uint8Array.from(atob(photo.base64), (character) => character.charCodeAt(0));
  return {
    status: 'success' as const,
    file: new File([bytes], 'sticker-photo.jpg', { type: photo.mimeType }),
  };
};
