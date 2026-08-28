import { useQuery } from '@tanstack/react-query';
import { APILoadingStatus, useApiLoadingStatus, useMapsLibrary } from '@vis.gl/react-google-maps';

import { resolveRecommendationShop } from '@/features/map/apis/services/resolveRecommendationShop';
import type { ShopRecommendation } from '@/features/map/types';

const RECOMMENDATION_RECORD_SHOP_QUERY_KEY = (recommendationId?: string) =>
  ['map', 'recommendation', 'record-shop', recommendationId] as const;

/** 추천 매장을 소비 기록 폼이 사용하는 Google 장소 정보로 조회합니다. */
export const useRecommendationRecordShopQuery = (recommendation?: ShopRecommendation) => {
  const placesLibrary = useMapsLibrary('places');
  const apiLoadingStatus = useApiLoadingStatus();
  const isLibraryError =
    apiLoadingStatus === APILoadingStatus.FAILED ||
    apiLoadingStatus === APILoadingStatus.AUTH_FAILURE;

  // Places 라이브러리는 로드 후 유지되는 SDK 인스턴스이고 추천 정보는 ID 기준으로 캐시한다.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const query = useQuery({
    queryKey: RECOMMENDATION_RECORD_SHOP_QUERY_KEY(recommendation?.id),
    queryFn: () => {
      if (!placesLibrary || !recommendation) {
        throw new Error('추천 매장을 조회할 수 없습니다');
      }

      return resolveRecommendationShop(placesLibrary, recommendation);
    },
    enabled: Boolean(placesLibrary) && Boolean(recommendation),
    staleTime: Infinity,
  });

  return {
    query,
    isLibraryLoading: !placesLibrary && !isLibraryError,
    isLibraryError,
  };
};
