import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { MONTHLY_REPORT_CACHE_TIME } from '@/features/report/apis/hooks/useMonthlyReportQuery';
import { getGetMonthlyReportQueryOptions } from '@/features/report/apis/queries';
import type { MonthlyReportAdjacentCard } from '@/features/report/types';
import { formatYearMonth } from '@/shared/utils/yearMonth';

/** 실제 리포트가 존재하는 양옆 달을 미리 조회해 월 이동 대기 시간을 줄입니다. */
export const useAdjacentMonthlyReportPrefetch = (
  adjacentCards: readonly MonthlyReportAdjacentCard[] | undefined
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    adjacentCards?.forEach((card) => {
      if (card.isUnavailable) return;

      void queryClient.prefetchQuery(
        getGetMonthlyReportQueryOptions(
          { yearMonth: formatYearMonth(card.month) },
          {
            query: {
              gcTime: MONTHLY_REPORT_CACHE_TIME,
              staleTime: MONTHLY_REPORT_CACHE_TIME,
            },
          }
        )
      );
    });
  }, [adjacentCards, queryClient]);
};
