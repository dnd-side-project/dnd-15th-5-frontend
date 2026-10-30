import { removeStickerBackground } from '@/features/record/sticker/background-removal/removeStickerBackground';
import { composeSticker, prepareStickerImage } from '@/features/record/sticker/image/stickerImage';

/** 사진 정규화·ISNet 배경 제거·테두리 합성을 순서대로 실행하고 취소된 결과는 반환하지 않습니다. */
export const createPhotoSticker = async (
  file: File,
  signal: AbortSignal,
  onProgress: (message: string) => void
) => {
  signal.throwIfAborted();
  onProgress('사진을 준비하고 있어요');
  const image = await prepareStickerImage(file);
  signal.throwIfAborted();
  onProgress('사진에서 배경을 지우고 있어요');
  const foreground = await removeStickerBackground(image, signal, onProgress);
  signal.throwIfAborted();
  onProgress('흰색 테두리를 만들고 있어요');
  const sticker = await composeSticker(foreground);
  signal.throwIfAborted();
  return sticker;
};
