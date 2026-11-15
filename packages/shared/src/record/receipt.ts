import { parsePurchaseDateTime } from './visitDateTime';

import type { VisitDateTimeValue } from './visitDateTime';

/** OCR 날짜·시각을 유효하고 미래가 아닌 방문 일시로 변환합니다. */
export const parseReceiptVisitDateTime = (
  purchaseDate?: string | null,
  purchaseTime?: string | null,
  now = new Date()
): VisitDateTimeValue | undefined => {
  const value = parsePurchaseDateTime(
    purchaseDate,
    purchaseTime || `${String(now.getHours()).padStart(2, '0')}:00:00`
  );
  return value && value.date.getTime() <= now.getTime() ? value : undefined;
};
