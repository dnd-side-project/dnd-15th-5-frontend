import { useQuery } from '@tanstack/react-query';
import { APILoadingStatus, useApiLoadingStatus, useMapsLibrary } from '@vis.gl/react-google-maps';

import { resolveRecommendationShop } from '@/features/map/apis/services/resolveRecommendationShop';
import type { ShopRecommendation } from '@/features/map/types';

const RECOMMENDATION_RECORD_SHOP_QUERY_KEY = (recommendationId?: string, includePhotos = true) =>
  ['map', 'recommendation', 'record-shop', recommendationId, { includePhotos }] as const;

/** 추천 매장의 Google 장소 정보를 조회합니다. 필요한 화면에서 조회를 지연할 수 있습니다.
 * @param recommendation 조회할 추천 매장입니다.
 * @param options.enabled `false`이면 쿼리를 실행하지 않습니다. 목록의 화면 밖 항목을 지연할 때 사용합니다.
 */
export const useRecommendationRecordShopQuery = (
  recommendation?: ShopRecommendation,
  { enabled = true, includePhotos = true }: { enabled?: boolean; includePhotos?: boolean } = {}
) => {
  const placesLibrary = useMapsLibrary('places');
  const apiLoadingStatus = useApiLoadingStatus();
  const isLibraryError =
    apiLoadingStatus === APILoadingStatus.FAILED ||
    apiLoadingStatus === APILoadingStatus.AUTH_FAILURE;

  // Places 라이브러리는 로드 후 유지되는 SDK 인스턴스이고 추천 정보는 ID 기준으로 캐시한다.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const query = useQuery({
    queryKey: RECOMMENDATION_RECORD_SHOP_QUERY_KEY(recommendation?.id, includePhotos),
    queryFn: () => {
      if (!placesLibrary || !recommendation) {
        throw new Error('추천 매장을 조회할 수 없습니다');
      }

      return resolveRecommendationShop(placesLibrary, recommendation, { includePhotos });
    },
    enabled: enabled && Boolean(placesLibrary) && Boolean(recommendation),
    staleTime: Infinity,
  });

  return {
    query,
    isLibraryLoading: !placesLibrary && !isLibraryError,
    isLibraryError,
  };
};
