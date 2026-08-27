import { useInfiniteQuery } from '@tanstack/react-query';

import { getPlaceVisits } from '@/features/shop/apis/clients';
import type { GetPlaceVisitsParams } from '@/features/shop/apis/dto';
import { getGetPlaceVisitsQueryKey } from '@/features/shop/apis/queryKeys';

const PLACE_VISIT_PAGE_SIZE = 20;

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
export const usePlaceVisitsInfiniteQuery = (placeId: number) =>
  useInfiniteQuery({
    queryKey: [...getGetPlaceVisitsQueryKey(placeId, { size: PLACE_VISIT_PAGE_SIZE }), 'infinite'],
    queryFn: ({ pageParam, signal }) =>
      getPlaceVisits(placeId, { size: PLACE_VISIT_PAGE_SIZE, ...pageParam }, undefined, signal),
    initialPageParam: {} as GetPlaceVisitsParams,
    getNextPageParam: getNextCursor,
    enabled: Number.isSafeInteger(placeId) && placeId > 0,
  });
