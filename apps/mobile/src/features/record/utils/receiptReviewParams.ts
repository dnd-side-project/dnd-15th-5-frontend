import { RECORD_CATEGORIES, VISIT_PERIODS } from '@chapchap/shared/record';

import type { ReceiptReviewRouteParams, ReceiptReviewState } from '../types';
import type { RecordCategory, VisitDateTimeValue, VisitPeriod } from '@chapchap/shared/record';

/** 라우트에서 받은 문자열이 지원하는 기록 카테고리인지 확인한다. */
export const isRecordCategory = (value: string | undefined): value is RecordCategory =>
  RECORD_CATEGORIES.some((category) => category === value);

const isVisitPeriod = (value: string | undefined): value is VisitPeriod =>
  VISIT_PERIODS.some((period) => period.value === value);

/** 라우트 문자열에서 유효하고 미래가 아닌 방문 일시만 복원한다. */
export const parseVisitDateTime = (
  visitedAt: string | undefined,
  visitPeriod: string | undefined,
  now = new Date()
): VisitDateTimeValue | undefined => {
  const timestamp = Number(visitedAt);

  if (!visitedAt || !Number.isFinite(timestamp) || !isVisitPeriod(visitPeriod)) {
    return undefined;
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime()) || date.getTime() > now.getTime()) {
    return undefined;
  }

  return { date, period: visitPeriod };
};

/** 영수증 폼 상태를 Expo Router가 전달할 수 있는 문자열 값으로 직렬화한다. */
export const createReceiptReviewRouteParams = (
  state: ReceiptReviewState
): ReceiptReviewRouteParams => ({
  uri: state.receiptUri,
  ...(state.shopId ? { shopId: state.shopId } : {}),
  shopName: state.shopName,
  shopAddress: state.shopAddress,
  ...(state.shopPhotoUrl ? { shopPhotoUrl: state.shopPhotoUrl } : {}),
  amount: state.amount,
  visitedAt: String(state.visitDateTime.date.getTime()),
  visitPeriod: state.visitDateTime.period,
  category: state.category,
});
