import { formatPurchaseDateTime } from '@chapchap/shared/record';

import type { ConsumptionCreateRequest } from '@/features/record/apis/dto';

import type { RecordCategory, VisitDateTimeValue } from '@chapchap/shared/record';
import type { ShopSearchResult } from '@chapchap/shared/shop';

type CreateConsumptionRequestParams = {
  shop: ShopSearchResult;
  visitDateTime: VisitDateTimeValue;
  amount: string;
  category: RecordCategory;
};

/** 수기 기록 폼의 값을 소비 등록 API 요청으로 변환한다. */
export const createConsumptionRequest = ({
  shop,
  visitDateTime,
  amount,
  category,
}: CreateConsumptionRequestParams): ConsumptionCreateRequest => {
  if (!Number.isFinite(shop.latitude) || !Number.isFinite(shop.longitude)) {
    throw new Error('선택한 장소의 위치 정보가 없습니다.');
  }

  return {
    googlePlaceId: shop.id,
    placeName: shop.name,
    roadAddress: shop.address,
    latitude: shop.latitude,
    longitude: shop.longitude,
    ...formatPurchaseDateTime(visitDateTime),
    amount: Number(amount),
    category,
  };
};
