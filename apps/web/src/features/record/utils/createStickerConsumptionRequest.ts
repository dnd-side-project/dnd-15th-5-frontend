import {
  formatPurchaseDateTime,
  MAX_RECORD_AMOUNT,
  RECORD_CATEGORIES,
} from '@chapchap/shared/record';

import type { ConsumptionSaveRequest } from '@/features/record/apis/dto';
import type { StickerRecordDraft } from '@/features/record/types';

import type { ShopSearchResult } from '@chapchap/shared/shop';

/** 폼의 제출 가능 여부와 API 요청에서 동일한 가게 필수 조건을 사용합니다. */
export const isValidStickerRecordShop = (
  shop: ShopSearchResult | null | undefined
): shop is ShopSearchResult =>
  Boolean(
    shop?.id.trim() &&
    shop.name.trim() &&
    shop.address.trim() &&
    Number.isFinite(shop.latitude) &&
    Math.abs(shop.latitude) <= 90 &&
    Number.isFinite(shop.longitude) &&
    Math.abs(shop.longitude) <= 180
  );

/** 업로드 전에 확인 가능한 필수 입력과 서버 제약을 검증합니다. */
export const validateStickerRecordDraft = (draft: StickerRecordDraft) => {
  const { shop, visitDateTime, amount, memo, category, receiptImageId, purchaseTime } = draft;
  if (!isValidStickerRecordShop(shop)) throw new Error('가게 정보와 위치를 확인해주세요.');
  if (Number.isNaN(visitDateTime.date.getTime()) || visitDateTime.date > new Date())
    throw new Error('방문 일시를 확인해주세요.');
  if (
    amount !== '' &&
    (!/^\d+$/.test(amount) ||
      !Number.isSafeInteger(Number(amount)) ||
      Number(amount) > MAX_RECORD_AMOUNT)
  )
    throw new Error('금액을 확인해주세요.');
  if (memo.length > 1000) throw new Error('메모는 1,000자 이하로 입력해주세요.');
  if (![...RECORD_CATEGORIES, '쇼핑'].includes(category))
    throw new Error('카테고리를 확인해주세요.');
  if (purchaseTime && !/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(purchaseTime))
    throw new Error('방문 시각을 확인해주세요.');
  if (receiptImageId !== undefined && (!Number.isInteger(receiptImageId) || receiptImageId <= 0))
    throw new Error('영수증을 다시 인식해주세요.');
};

export type StickerRecordMediaId =
  { imageId: number; stickerItemId?: never } | { stickerItemId: number; imageId?: never };

/** 사진 ID 또는 기본 이모지 ID 하나만 포함한 최종 등록 요청을 만듭니다. */
export const createStickerConsumptionRequest = (
  draft: StickerRecordDraft,
  media: StickerRecordMediaId
): ConsumptionSaveRequest => {
  validateStickerRecordDraft(draft);
  const ids = [media.imageId, media.stickerItemId].filter((id) => id !== undefined);
  const [id] = ids;
  if (ids.length !== 1 || id === undefined || !Number.isSafeInteger(id) || id <= 0)
    throw new Error('기록할 이미지 또는 이모지를 다시 선택해주세요.');
  const { shop, visitDateTime, amount, memo, category, receiptImageId, purchaseTime } = draft;
  return {
    googlePlaceId: shop.id,
    placeName: shop.name,
    roadAddress: shop.address,
    latitude: shop.latitude,
    longitude: shop.longitude,
    ...formatPurchaseDateTime(visitDateTime),
    ...(purchaseTime ? { purchaseTime } : {}),
    category,
    ...(media.imageId !== undefined
      ? { imageId: media.imageId }
      : { stickerItemId: media.stickerItemId }),
    ...(amount !== '' ? { amount: Number(amount) } : {}),
    ...(memo.trim() ? { memo: memo.trim() } : {}),
    ...(receiptImageId !== undefined ? { receiptImageId } : {}),
  };
};
