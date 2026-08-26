import { useInfiniteQuery } from '@tanstack/react-query';

import { searchVisitedPlaces } from '@/features/shop/apis/clients';
import { getSearchVisitedPlacesQueryKey } from '@/features/shop/apis/queryKeys';

const VISITED_PLACE_SEARCH_PAGE_SIZE = 5;

/** 소비 기록이 있는 장소 검색 결과를 서버 커서가 끝날 때까지 조회합니다. */
export const useVisitedPlaceSearchInfiniteQuery = (keyword: string) => {
  const normalizedKeyword = keyword.trim();

  return useInfiniteQuery({
    queryKey: [
      ...getSearchVisitedPlacesQueryKey({
        keyword: normalizedKeyword,
        size: VISITED_PLACE_SEARCH_PAGE_SIZE,
      }),
      'infinite',
    ],
    queryFn: ({ pageParam, signal }) =>
      searchVisitedPlaces(
        {
          keyword: normalizedKeyword,
          cursor: pageParam,
          size: VISITED_PLACE_SEARCH_PAGE_SIZE,
        },
        undefined,
        signal
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data?.hasNext ? (lastPage.data.nextCursor ?? undefined) : undefined,
    enabled: normalizedKeyword.length > 0,
  });
};
