import { RECORD_CATEGORIES } from '@chapchap/shared/record';

import type { FrequentPlaceItem } from '@/features/report/apis/dto';
import type { FrequentShop } from '@/features/report/types';

import type { SpendingCategory } from '@chapchap/shared/common/types';

const normalizeCategory = (category?: string): SpendingCategory =>
  RECORD_CATEGORIES.find((item) => item === category) ?? '기타';

/** 자주 소비한 곳 API 응답을 기존 공통 카드 모델로 변환합니다. */
export const toFrequentShops = (places: FrequentPlaceItem[]): FrequentShop[] =>
  places.flatMap((place, index) => {
    if (place.placeId === undefined || !place.placeName) return [];

    return [
      {
        id: String(place.placeId),
        name: place.placeName,
        rank: place.rank ?? index + 1,
        district: place.dongname ?? '',
        category: normalizeCategory(place.category),
        thumbnailSrc: place.thumbnailUrl ?? null,
        visitCount: place.visitCount ?? 0,
      },
    ];
  });
