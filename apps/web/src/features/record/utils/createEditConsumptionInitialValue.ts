import { parseReceiptVisitDateTime, RECORD_CATEGORIES } from '@chapchap/shared/record';

import type { ConsumptionDetailResponse } from '@/features/record/apis/dto';
import type { StickerRecordInitialValue, StickerRecordMedia } from '@/features/record/types';
import { isValidStickerRecordShop } from '@/features/record/utils/createStickerConsumptionRequest';
import { DEFAULT_STICKERS } from '@/shared/assets/images/ios-stickers/catalog';
import { getStickerImageByName } from '@/shared/assets/images/stickers';
import { isPositiveSafeInteger } from '@/shared/utils/isPositiveSafeInteger';

import type { ShopSearchResult } from '@chapchap/shared/shop';

/** 서버의 기존 장소·시각·이미지 ID를 보존해 수정 폼의 초기값으로 변환합니다. */
export const createEditConsumptionInitialValue = (
  detail: ConsumptionDetailResponse
): StickerRecordInitialValue | null => {
  if (!detail.purchaseTime) return null;
  const category = RECORD_CATEGORIES.find((item) => item === detail.category);
  if (!category) return null;
  const visitDateTime = parseReceiptVisitDateTime(detail.purchaseDate, detail.purchaseTime);
  const shop: ShopSearchResult = {
    id: detail.googlePlaceId ?? '',
    name: detail.placeName ?? '',
    address: detail.roadAddress ?? '',
    latitude: detail.latitude ?? NaN,
    longitude: detail.longitude ?? NaN,
    photoUrl: detail.thumbnailUrl ?? null,
  };
  const imageId = detail.imageId;
  const stickerItemId = detail.stickerItemId;
  const hasImage = isPositiveSafeInteger(imageId);
  const hasSticker = isPositiveSafeInteger(stickerItemId);
  const media: StickerRecordMedia | null = hasImage
    ? { source: 'saved', imageId, category }
    : hasSticker
      ? { source: 'saved', stickerItemId, category }
      : null;
  const sticker = hasImage
    ? detail.imageUrl
    : getStickerImageByName(detail.stickerName ?? undefined);
  if (
    !visitDateTime ||
    !isValidStickerRecordShop(shop) ||
    !media ||
    hasImage === hasSticker ||
    !sticker
  )
    return null;
  return {
    sticker,
    defaultSticker: hasSticker
      ? DEFAULT_STICKERS.find(
          (item) =>
            item.category === (detail.stickerCategory ?? category) &&
            item.name === detail.stickerName
        )
      : undefined,
    media,
    draft: {
      shop,
      visitDateTime,
      category,
      amount: detail.amount === null || detail.amount === undefined ? '' : String(detail.amount),
      memo: detail.memo ?? '',
      purchaseTime:
        detail.purchaseTime.length === 5 ? `${detail.purchaseTime}:00` : detail.purchaseTime,
    },
  };
};
