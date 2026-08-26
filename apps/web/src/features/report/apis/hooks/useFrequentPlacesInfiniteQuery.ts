import { useInfiniteQuery } from '@tanstack/react-query';

import { getFrequentPlaces } from '@/features/report/apis/clients';
import type { GetFrequentPlacesParams, GetFrequentPlacesPeriod } from '@/features/report/apis/dto';
import { getGetFrequentPlacesQueryKey } from '@/features/report/apis/queryKeys';

const FREQUENT_PLACE_PAGE_SIZE = 20;

type FrequentPlacesFilter = {
  category?: string[];
  period: GetFrequentPlacesPeriod;
  size?: number;
};

type FrequentPlaceCursor = Pick<
  GetFrequentPlacesParams,
  'cursorPlaceId' | 'cursorRank' | 'cursorVisitCount'
>;

/** 자주 소비한 곳 순위를 서버 커서가 끝날 때까지 조회합니다. */
export const useFrequentPlacesInfiniteQuery = ({
  category,
  period,
  size = FREQUENT_PLACE_PAGE_SIZE,
}: FrequentPlacesFilter) =>
  useInfiniteQuery({
    queryKey: [...getGetFrequentPlacesQueryKey({ category, period, size }), 'infinite'],
    queryFn: ({ pageParam, signal }) =>
      getFrequentPlaces(
        {
          category,
          period,
          size,
          ...pageParam,
        },
        undefined,
        signal
      ),
    initialPageParam: {} as FrequentPlaceCursor,
    getNextPageParam: (lastPage) => {
      const data = lastPage.data;
      if (!data?.hasNext || data.nextCursorPlaceId === undefined) return undefined;

      return {
        cursorVisitCount: data.nextCursorVisitCount,
        cursorPlaceId: data.nextCursorPlaceId,
        cursorRank: data.nextCursorRank,
      };
    },
  });
