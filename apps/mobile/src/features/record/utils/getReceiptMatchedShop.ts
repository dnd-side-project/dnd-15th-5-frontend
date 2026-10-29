import type { GooglePlaceSearchResultResponse } from '@/features/record/apis/types';

import { stripCountryPrefix } from './stripCountryPrefix';

import type { ShopSearchResult } from '@chapchap/shared/shop';

const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

const isCoordinateInRange = (value: number | undefined, maximum: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= maximum;

/** OCR 원문을 대신 사용하지 않고 유효한 Google Places 매칭 결과만 가게로 변환합니다. */
export const getReceiptMatchedShop = (
  place: GooglePlaceSearchResultResponse | null | undefined
): ShopSearchResult | null => {
  const id = place?.googlePlaceId?.trim();
  const name = place?.placeName?.trim();
  const address = stripCountryPrefix(place?.roadAddress ?? '');
  const latitude = place?.latitude;
  const longitude = place?.longitude;
  if (
    !id ||
    !name ||
    !address ||
    !isCoordinateInRange(latitude, MAX_LATITUDE) ||
    !isCoordinateInRange(longitude, MAX_LONGITUDE)
  ) {
    return null;
  }
  return { id, name, address, latitude, longitude, photoUrl: place?.thumbnailUrl?.trim() || null };
};
