import type { ReceiptOcrResponse } from '@/features/record/apis/types';

import { getReceiptMatchedShop } from './getReceiptMatchedShop';

import type { ReceiptScanData } from '@chapchap/shared/bridge';

/** OCR에서 유효하게 인식한 가게·입력값만 웹 기록 폼에 전달합니다. */
export const createReceiptScanData = (receipt: ReceiptOcrResponse): ReceiptScanData => {
  if (
    !Number.isInteger(receipt.receiptImageId) ||
    !receipt.receiptImageId ||
    receipt.receiptImageId <= 0
  )
    throw new Error('영수증 인식 결과를 확인하지 못했어요. 다시 촬영해주세요.');
  return {
    receiptImageId: receipt.receiptImageId,
    purchaseDate: receipt.purchaseDate ?? null,
    purchaseTime: receipt.purchaseTime ?? null,
    amount:
      typeof receipt.amount === 'number' && Number.isFinite(receipt.amount) && receipt.amount >= 0
        ? receipt.amount
        : null,
    shop: getReceiptMatchedShop(receipt.googlePlaceSearchResult),
  };
};
