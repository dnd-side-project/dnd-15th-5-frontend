import { useInfiniteQuery } from '@tanstack/react-query';

import { REPORT_LIST_QUERY_CACHE_OPTIONS } from '@/features/report/apis/cacheOptions';
import { getFrequentPlaces } from '@/features/report/apis/clients';
import type { GetFrequentPlacesParams, GetFrequentPlacesPeriod } from '@/features/report/apis/dto';

const FREQUENT_PLACE_PAGE_SIZE = 15;

type FrequentPlaceCursor = Pick<
  GetFrequentPlacesParams,
  'cursorVisitCount' | 'cursorPlaceId' | 'cursorRank'
>;

type UseFrequentPlacesInfiniteQueryParams = {
  category?: string[];
  period: GetFrequentPlacesPeriod;
  size?: number;
};

const getNextCursor = (
  lastPage: Awaited<ReturnType<typeof getFrequentPlaces>>
): FrequentPlaceCursor | undefined => {
  const pageData = lastPage.data;

  if (
    !pageData?.hasNext ||
    pageData.nextCursorVisitCount === undefined ||
    pageData.nextCursorPlaceId === undefined ||
    pageData.nextCursorRank === undefined
  ) {
    return undefined;
  }

  return {
    cursorVisitCount: pageData.nextCursorVisitCount,
    cursorPlaceId: pageData.nextCursorPlaceId,
    cursorRank: pageData.nextCursorRank,
  };
};

/** 선택한 기간과 카테고리의 단골 가게 순위를 서버 커서가 끝날 때까지 불러옵니다. */
export const useFrequentPlacesInfiniteQuery = ({
  category,
  period,
  size = FREQUENT_PLACE_PAGE_SIZE,
}: UseFrequentPlacesInfiniteQueryParams) =>
  useInfiniteQuery({
    queryKey: ['/consumptions/places/rank', 'infinite', { category, period, size }],
    queryFn: ({ pageParam, signal }) =>
      getFrequentPlaces({ ...pageParam, category, period, size }, undefined, signal),
    initialPageParam: {} as FrequentPlaceCursor,
    getNextPageParam: getNextCursor,
    ...REPORT_LIST_QUERY_CACHE_OPTIONS,
  });
