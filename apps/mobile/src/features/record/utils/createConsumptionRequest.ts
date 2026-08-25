import { formatPurchaseDateTime } from '@chapchap/shared/record';

import type { ConsumptionCreateRequest } from '@/features/record/apis/types';
import type { ReceiptDraft } from '@/features/record/types';

/** 영수증 확인 폼의 값을 소비 등록 API 요청으로 변환한다. */
export const createConsumptionRequest = (draft: ReceiptDraft): ConsumptionCreateRequest => {
  if (
    !draft.shopId ||
    draft.latitude === null ||
    draft.longitude === null ||
    draft.receiptImageId === null
  ) {
    throw new Error('가게 또는 영수증 정보를 다시 확인해 주세요.');
  }

  return {
    receiptImageId: draft.receiptImageId,
    googlePlaceId: draft.shopId,
    placeName: draft.shopName,
    roadAddress: draft.shopAddress,
    latitude: draft.latitude,
    longitude: draft.longitude,
    ...formatPurchaseDateTime(draft.visitDateTime),
    amount: Number(draft.amount),
    category: draft.category,
  };
};
