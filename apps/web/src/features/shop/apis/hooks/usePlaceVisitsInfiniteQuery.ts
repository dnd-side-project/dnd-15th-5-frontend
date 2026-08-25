import { useInfiniteQuery } from '@tanstack/react-query';

import { getPlaceVisits } from '@/features/shop/apis/clients';
import type { GetPlaceVisitsParams, PlaceVisitResponse } from '@/features/shop/apis/dto';

const PLACE_VISIT_PAGE_SIZE = 20;
const MOCK_PLACE_VISIT_PAGE_SIZE = 2;

type UsePlaceVisitsInfiniteQueryOptions = {
  mockVisits?: readonly PlaceVisitResponse[];
};

const getMockVisitPage = (
  visits: readonly PlaceVisitResponse[],
  pageParam: GetPlaceVisitsParams
): Awaited<ReturnType<typeof getPlaceVisits>> => {
  const pageStart = pageParam.cursorId ?? 0;
  const pageEnd = pageStart + MOCK_PLACE_VISIT_PAGE_SIZE;
  const nextVisit = visits[pageEnd];
  const hasNext = pageEnd < visits.length;

  return {
    data: {
      visits: visits.slice(pageStart, pageEnd),
      hasNext,
      nextCursorPurchaseDate: hasNext ? nextVisit?.visitedAt?.slice(0, 10) : undefined,
      nextCursorPurchaseTime: hasNext ? nextVisit?.visitedAt?.slice(11, 19) : undefined,
      nextCursorId: hasNext ? pageEnd : undefined,
    },
  };
};

const getNextCursor = (
  lastPage: Awaited<ReturnType<typeof getPlaceVisits>>
): GetPlaceVisitsParams | undefined => {
  const pageData = lastPage.data;
  if (!pageData?.hasNext || pageData.nextCursorId === undefined) return undefined;

  return {
    cursorPurchaseDate: pageData.nextCursorPurchaseDate,
    cursorPurchaseTime: pageData.nextCursorPurchaseTime,
    cursorId: pageData.nextCursorId,
  } satisfies GetPlaceVisitsParams;
};

/** 장소 방문 기록을 서버 커서가 끝날 때까지 불러오는 무한 조회 훅입니다. */
export const usePlaceVisitsInfiniteQuery = (
  placeId: number,
  { mockVisits }: UsePlaceVisitsInfiniteQueryOptions = {}
) => {
  const isMockMode = mockVisits !== undefined;

  return useInfiniteQuery({
    queryKey: [
      '/consumptions/places',
      placeId,
      'visits',
      'infinite',
      isMockMode ? 'mock' : 'api',
      mockVisits,
    ],
    queryFn: ({ pageParam, signal }) => {
      if (mockVisits) return Promise.resolve(getMockVisitPage(mockVisits, pageParam));

      return getPlaceVisits(
        placeId,
        { size: PLACE_VISIT_PAGE_SIZE, ...pageParam },
        undefined,
        signal
      );
    },
    initialPageParam: {} as GetPlaceVisitsParams,
    getNextPageParam: getNextCursor,
    enabled: Number.isSafeInteger(placeId) && placeId > 0,
    ...(isMockMode ? { staleTime: Infinity } : {}),
  });
};
