import type { RecordCategory, VisitDateTimeValue } from '@chapchap/shared/record';

/** 영수증 확인 화면에서 수정하고 기록 생성에 전달할 값. */
export type ReceiptDraft = {
  receiptImageId: number | null;
  shopId: string | null;
  shopName: string;
  shopAddress: string;
  shopPhotoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  visitDateTime: VisitDateTimeValue;
  amount: string;
  category: RecordCategory;
  receiptUri: string;
};

/** 영수증 확인 화면과 장소 검색 화면 사이에서 전달하는 직렬화된 라우트 값. */
export type ReceiptReviewRouteParams = {
  uri?: string;
  receiptImageId?: string;
  shopId?: string;
  shopName?: string;
  shopAddress?: string;
  shopPhotoUrl?: string;
  latitude?: string;
  longitude?: string;
  amount?: string;
  category?: string;
  visitedAt?: string;
  visitPeriod?: string;
};

/** 장소 검색으로 이동할 때 보존하는 현재 영수증 폼 상태. */
export type ReceiptReviewState = ReceiptDraft;
