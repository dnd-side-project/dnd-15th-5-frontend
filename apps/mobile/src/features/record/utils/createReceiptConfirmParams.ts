import type {
  GooglePlaceSearchResultResponse,
  ReceiptOcrResponse,
} from '@/features/record/apis/types';
import type { ReceiptReviewRouteParams } from '@/features/record/types';

import { parseReceiptVisitDateTime } from './parseReceiptVisitDateTime';
import { stripCountryPrefix } from './stripCountryPrefix';

const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

type ProcessedReceipt = ReceiptOcrResponse & { uri: string };

const isCoordinateInRange = (value: number | undefined, minimum: number, maximum: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum;

const createMatchedShopParams = (
  googlePlaceSearchResult: GooglePlaceSearchResultResponse | null | undefined
): ReceiptReviewRouteParams => {
  const shopId = googlePlaceSearchResult?.googlePlaceId?.trim();
  const shopName = googlePlaceSearchResult?.placeName?.trim();
  const shopAddress = stripCountryPrefix(googlePlaceSearchResult?.roadAddress ?? '');
  const shopPhotoUrl = googlePlaceSearchResult?.thumbnailUrl?.trim();
  const latitude = googlePlaceSearchResult?.latitude;
  const longitude = googlePlaceSearchResult?.longitude;

  if (
    !shopId ||
    !shopName ||
    !shopAddress ||
    !isCoordinateInRange(latitude, MIN_LATITUDE, MAX_LATITUDE) ||
    !isCoordinateInRange(longitude, MIN_LONGITUDE, MAX_LONGITUDE)
  ) {
    return {};
  }

  return {
    shopId,
    shopName,
    shopAddress,
    ...(shopPhotoUrl ? { shopPhotoUrl } : {}),
    latitude: String(latitude),
    longitude: String(longitude),
  };
};

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

  return {
    uri,
    ...(receiptImageId !== undefined ? { receiptImageId: String(receiptImageId) } : {}),
    ...createMatchedShopParams(googlePlaceSearchResult),
    ...(amount !== null && amount !== undefined ? { amount: String(amount) } : {}),
    ...(visitDateTime
      ? {
          visitedAt: String(visitDateTime.date.getTime()),
          visitPeriod: visitDateTime.period,
        }
      : {}),
  };
};
