import { findStickers, upload } from '@/features/record/apis/clients';
import type { StickerRecordMedia } from '@/features/record/types';
import type { StickerRecordMediaId } from '@/features/record/utils/createStickerConsumptionRequest';
import { isPositiveSafeInteger } from '@/shared/utils/isPositiveSafeInteger';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** 기존 미디어 ID는 보존하고 새 사진 업로드 또는 기본 스티커 조회로 저장할 ID를 구합니다. */
export const resolveStickerRecordMediaId = async (
  media: StickerRecordMedia,
  signal: AbortSignal
): Promise<StickerRecordMediaId> => {
  if (media.source === 'saved') {
    if (media.imageId !== undefined) return { imageId: media.imageId };
    return { stickerItemId: media.stickerItemId };
  }
  if (media.source === 'default') {
    const response = await findStickers(undefined, signal);
    const matches = response.data?.filter(
      (item) => item.category === media.category && item.name === media.name
    );
    const stickerItemId = matches?.length === 1 ? matches[0].stickerItemId : undefined;
    if (!isPositiveSafeInteger(stickerItemId))
      throw new Error('선택한 이모지가 서버 목록에 없어요. 다른 이모지를 선택해주세요.');
    return { stickerItemId };
  }
  const { image } = media;
  if (!['image/png', 'image/jpeg'].includes(image.type) || image.size === 0)
    throw new Error('PNG 또는 JPEG 이미지를 선택해주세요.');
  if (image.size > MAX_IMAGE_BYTES) throw new Error('이미지는 5MB 이하로 준비해주세요.');
  const response = await upload(
    {
      image: new File([image], image.type === 'image/png' ? 'sticker.png' : 'sticker.jpg', {
        type: image.type,
      }),
    },
    undefined,
    signal
  );
  const imageId = response.data?.imageId;
  if (!isPositiveSafeInteger(imageId))
    throw new Error('이미지 업로드 결과를 확인하지 못했어요. 다시 시도해주세요.');
  return { imageId };
};
