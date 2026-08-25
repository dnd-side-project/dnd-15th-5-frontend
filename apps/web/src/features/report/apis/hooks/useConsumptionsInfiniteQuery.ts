import { useInfiniteQuery } from '@tanstack/react-query';

import { getConsumptions } from '@/features/report/apis/clients';
import type { GetConsumptionsParams } from '@/features/report/apis/dto';

const CONSUMPTION_PAGE_SIZE = 20;

type ConsumptionCursor = Pick<
  GetConsumptionsParams,
  'cursorPurchaseDate' | 'cursorPurchaseTime' | 'cursorId'
>;

const getNextCursor = (
  lastPage: Awaited<ReturnType<typeof getConsumptions>>
): ConsumptionCursor | undefined => {
  const pageData = lastPage.data;

  if (!pageData?.hasNext || pageData.nextCursorId === undefined) return undefined;

  return {
    cursorPurchaseDate: pageData.nextCursorPurchaseDate,
    cursorPurchaseTime: pageData.nextCursorPurchaseTime,
    cursorId: pageData.nextCursorId,
  };
};

/** 선택한 월의 소비내역을 서버 커서가 끝날 때까지 불러오는 무한 조회 훅입니다. */
export const useConsumptionsInfiniteQuery = (yearMonth: string) =>
  useInfiniteQuery({
    queryKey: ['/consumptions', 'infinite', { yearMonth }],
    queryFn: ({ pageParam, signal }) =>
      getConsumptions({ ...pageParam, yearMonth, size: CONSUMPTION_PAGE_SIZE }, undefined, signal),
    initialPageParam: {} as ConsumptionCursor,
    getNextPageParam: getNextCursor,
  });
