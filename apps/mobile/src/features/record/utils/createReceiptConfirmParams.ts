import { parseReceiptVisitDateTime } from '@chapchap/shared/record';

import type { ReceiptOcrResponse } from '@/features/record/apis/types';
import type { ReceiptReviewRouteParams } from '@/features/record/types';

import { getReceiptMatchedShop } from './getReceiptMatchedShop';

type ProcessedReceipt = ReceiptOcrResponse & { uri: string };

/** OCR 처리 결과를 영수증 확인 화면의 직렬화된 라우트 값으로 변환한다. */
export const createReceiptConfirmParams = ({
  uri,
  receiptImageId,
  purchaseDate,
  purchaseTime,
  amount,
  googlePlaceSearchResult,
}: ProcessedReceipt): ReceiptReviewRouteParams => {
  const visitDateTime = parseReceiptVisitDateTime(purchaseDate, purchaseTime);
  const shop = getReceiptMatchedShop(googlePlaceSearchResult);
  return {
    uri,
    ...(receiptImageId !== undefined ? { receiptImageId: String(receiptImageId) } : {}),
    ...(shop
      ? {
          shopId: shop.id,
          shopName: shop.name,
          shopAddress: shop.address,
          latitude: String(shop.latitude),
          longitude: String(shop.longitude),
          ...(shop.photoUrl ? { shopPhotoUrl: shop.photoUrl } : {}),
        }
      : {}),
    ...(amount !== null && amount !== undefined ? { amount: String(amount) } : {}),
    ...(visitDateTime
      ? {
          visitedAt: String(visitDateTime.date.getTime()),
          visitPeriod: visitDateTime.period,
        }
      : {}),
  };
};
