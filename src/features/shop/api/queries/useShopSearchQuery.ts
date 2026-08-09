import { useQuery } from '@tanstack/react-query';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

import { SHOP_QUERY_KEYS } from '../queryKeys';
import { searchShops } from '../services';

/**
 * 키워드로 장소를 검색하는 쿼리 훅.
 *
 * Places 라이브러리는 비동기로 로드되므로, 로드가 끝나고 키워드가 있을 때만 요청한다.
 * 로드 전에는 쿼리가 비활성 상태라 결과가 비어 있으므로, 이를 "결과 없음"과 구분할 수 있도록
 * `isLibraryLoading`을 함께 반환한다.
 */
export const useShopSearchQuery = (keyword: string) => {
  const placesLibrary = useMapsLibrary('places');
  const trimmedKeyword = keyword.trim();

  // placesLibrary는 로드 후 값이 바뀌지 않는 SDK 인스턴스라 캐시 키에 포함하지 않는다
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const query = useQuery({
    queryKey: SHOP_QUERY_KEYS.search(trimmedKeyword),
    queryFn: () => {
      if (!placesLibrary) {
        throw new Error('Google Places 라이브러리가 로드되지 않았습니다');
      }

      return searchShops(placesLibrary, trimmedKeyword);
    },
    enabled: Boolean(placesLibrary) && trimmedKeyword.length > 0,
  });

  return { query, isLibraryLoading: !placesLibrary };
};
